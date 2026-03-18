const stripe = require("../../config/stripe");

// Create a Checkout Session for payment
exports.createCheckoutSession = async (req, res, next) => {
  try {
    const { userId, amount, description, membershipType } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Missing or invalid payment details" });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: membershipType || "Gym Membership",
              description: description || "Gym membership payment"
            },
            unit_amount: Math.round(amount * 100) // Convert to cents
          },
          quantity: 1
        }
      ],
      customer_email: req.user?.email,
      metadata: {
        userId,
        membershipType: membershipType || "standard"
      },
      success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/member?payment=success&session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/member?payment=cancelled`,
      // Store payment intent for webhook handling
      payment_intent_data: {
        metadata: {
          userId,
          membershipType: membershipType || "standard"
        }
      }
    });

    res.json({
      success: true,
      sessionId: session.id,
      clientSecret: session.payment_intent
    });
  } catch (err) {
    next(err);
  }
};

// Create Payment Intent for direct card payments (alternative to session-based checkout)
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Missing or invalid payment details" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      metadata: {
        userId,
        description: description || "Gym membership"
      }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (err) {
    next(err);
  }
};

// Verify payment and save to database
exports.verifyPayment = async (req, res, next) => {
  try {
    const { sessionId, paymentIntentId } = req.body;
    
    // Get user ID from authenticated user
    const userId = req.user?._id || req.user?.id;
    const repo = req.app.locals.repo;

    console.log("[STRIPE VERIFY] User ID:", userId, "Session ID:", sessionId, "Intent ID:", paymentIntentId);

    if (!sessionId && !paymentIntentId) {
      return res.status(400).json({ message: "sessionId or paymentIntentId required" });
    }

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!repo) {
      console.error("[STRIPE VERIFY] Repository not available");
      return res.status(500).json({ message: "Server configuration error" });
    }

    let paymentData = {
      userId,
      paymentMethod: "stripe",
      status: "completed",
      reviewStatus: "approved",  // Stripe payments are auto-approved
      description: "Stripe payment",
      paymentType: "membership_renewal",
      amount: 0  // Initialize amount, will be updated below
    };

    // Verify with Stripe
    if (sessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        console.log("[STRIPE VERIFY] Session payment status:", session.payment_status);
        
        if (session.payment_status === "paid") {
          paymentData.stripeSessionId = sessionId;
          paymentData.stripePaymentIntentId = session.payment_intent;
          paymentData.status = "completed";

          // Retrieve payment intent to get amount and receipt
          const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
          // Convert from cents to the original currency amount (Stripe stores in smallest unit)
          paymentData.amount = parseInt(paymentIntent.amount) / 100;
          
          console.log("[STRIPE VERIFY] Amount retrieved:", paymentData.amount);

          if (paymentIntent.charges?.data?.[0]) {
            paymentData.receipt_url = paymentIntent.charges.data[0].receipt_url;
          }
        } else {
          return res.status(400).json({ message: "Payment not completed on Stripe" });
        }
      } catch (stripeErr) {
        console.error("[STRIPE VERIFY] Error retrieving session:", stripeErr.message);
        return res.status(400).json({ message: "Failed to verify payment with Stripe: " + stripeErr.message });
      }
    } else if (paymentIntentId) {
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        console.log("[STRIPE VERIFY] Intent status:", paymentIntent.status);
        
        if (paymentIntent.status === "succeeded") {
          paymentData.stripePaymentIntentId = paymentIntentId;
          paymentData.status = "completed";
          // Convert from cents to the original currency amount
          paymentData.amount = parseInt(paymentIntent.amount) / 100;
          
          console.log("[STRIPE VERIFY] Amount retrieved:", paymentData.amount);

          if (paymentIntent.charges?.data?.[0]) {
            paymentData.receipt_url = paymentIntent.charges.data[0].receipt_url;
          }
        } else {
          return res.status(400).json({ message: "Payment not succeeded on Stripe" });
        }
      } catch (stripeErr) {
        console.error("[STRIPE VERIFY] Error retrieving intent:", stripeErr.message);
        return res.status(400).json({ message: "Failed to verify payment with Stripe: " + stripeErr.message });
      }
    }

    // Validate required fields
    if (!paymentData.amount || paymentData.amount <= 0) {
      console.error("[STRIPE VERIFY] Invalid amount:", paymentData.amount);
      return res.status(400).json({ message: "Invalid payment amount retrieved from Stripe" });
    }

    // Check if payment already exists to avoid duplicates
    try {
      const existingPayments = await repo.getPaymentByStripeId(sessionId, paymentIntentId);

      if (existingPayments) {
        console.log("[STRIPE VERIFY] Payment already exists, returning existing record");
        return res.json({
          success: true,
          message: "Payment already verified",
          payment: existingPayments
        });
      }
    } catch (repoErr) {
      console.error("[STRIPE VERIFY] Error checking for existing payment:", repoErr.message);
      // Continue - if there's an error, we'll try to create a new one
    }

    // Save payment to database
    try {
      console.log("[STRIPE VERIFY] Saving payment data:", paymentData);
      const savedPayment = await repo.createPayment(paymentData);
      
      console.log("[STRIPE VERIFY] Payment saved successfully:", savedPayment._id);
      
      res.json({
        success: true,
        message: "Payment verified and saved successfully",
        payment: savedPayment
      });
    } catch (saveErr) {
      console.error("[STRIPE VERIFY] Error saving payment:", saveErr.message, saveErr);
      return res.status(500).json({ 
        message: "Failed to save payment to database: " + saveErr.message 
      });
    }
  } catch (err) {
    console.error("[STRIPE VERIFY] Unexpected error:", err.message, err);
    next(err);
  }
};

// Handle Stripe Webhook (for async payment confirmation)
exports.handleWebhook = async (req, res, next) => {
  const sig = req.headers["stripe-signature"];
  const repo = req.app.locals.repo;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object;
        await repo.updatePaymentStatus(
          { stripeSessionId: session.id },
          {
            status: "completed",
            stripePaymentIntentId: session.payment_intent
          }
        );
        break;

      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        await repo.updatePaymentStatus(
          { stripePaymentIntentId: paymentIntent.id },
          { status: "completed" }
        );
        break;

      case "payment_intent.payment_failed":
        const failedIntent = event.data.object;
        await repo.updatePaymentStatus(
          { stripePaymentIntentId: failedIntent.id },
          { status: "failed" }
        );
        break;
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};

// Retrieve payment details
exports.getPaymentDetails = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const repo = req.app.locals.repo;

    const payment = await repo.getPaymentById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({ payment });
  } catch (err) {
    next(err);
  }
};

// List user payments
exports.getUserPayments = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const repo = req.app.locals.repo;

    const payments = await repo.getUserPayments(userId);
    res.json({ payments });
  } catch (err) {
    next(err);
  }
};
