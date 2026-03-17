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
    const userId = req.user.id; // Use authenticated user's ID for security
    const repo = req.app.locals.repo;

    if (!sessionId && !paymentIntentId) {
      return res.status(400).json({ message: "sessionId or paymentIntentId required" });
    }

    let paymentData = {
      userId,
      paymentMethod: "stripe",
      status: "pending",
      description: "Stripe payment"
    };

    // Verify with Stripe
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") {
        paymentData.stripeSessionId = sessionId;
        paymentData.stripePaymentIntentId = session.payment_intent;
        paymentData.status = "completed";

        // Retrieve payment intent to get amount and receipt
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);
        // Convert from cents to dollars
        paymentData.amount = paymentIntent.amount / 100;
        
        if (paymentIntent.charges.data[0]) {
          paymentData.receipt_url = paymentIntent.charges.data[0].receipt_url;
        }
      } else {
        return res.status(400).json({ message: "Payment not completed on Stripe" });
      }
    } else if (paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status === "succeeded") {
        paymentData.stripePaymentIntentId = paymentIntentId;
        paymentData.status = "completed";
        // Convert from cents to dollars
        paymentData.amount = paymentIntent.amount / 100;
        
        if (paymentIntent.charges.data[0]) {
          paymentData.receipt_url = paymentIntent.charges.data[0].receipt_url;
        }
      } else {
        return res.status(400).json({ message: "Payment not succeeded on Stripe" });
      }
    }

    // Check if payment already exists to avoid duplicates
    const existingPayments = await repo.getPaymentByStripeId(sessionId, paymentIntentId);

    if (existingPayments) {
      return res.json({
        success: true,
        message: "Payment already verified",
        payment: existingPayments
      });
    }

    // Save payment to database
    const savedPayment = await repo.createPayment(paymentData);

    res.json({
      success: true,
      message: "Payment verified and saved successfully",
      payment: savedPayment
    });
  } catch (err) {
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
