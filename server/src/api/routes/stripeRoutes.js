const express = require("express");
const { requireAuth } = require("../../middleware/auth");
const stripeController = require("../controllers/stripeController");

const router = express.Router();

// Create checkout session
router.post("/payment/checkout-session", requireAuth, stripeController.createCheckoutSession);

// Create payment intent
router.post("/payment/intent", requireAuth, stripeController.createPaymentIntent);

// Verify payment
router.post("/payment/verify", requireAuth, stripeController.verifyPayment);

// Get payment details
router.get("/payment/:paymentId", requireAuth, stripeController.getPaymentDetails);

// Get user payments
router.get("/user/:userId/payments", requireAuth, stripeController.getUserPayments);

// Webhook endpoint (no auth needed)
router.post("/webhook", express.raw({ type: "application/json" }), stripeController.handleWebhook);

module.exports = router;
