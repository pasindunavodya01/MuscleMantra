const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, required: true, default: Date.now },
    paymentMethod: { type: String, enum: ["cash", "card", "bank_transfer", "stripe", "online"], default: "cash" },
    description: { type: String, default: "" },
    status: { type: String, enum: ["completed", "pending", "failed"], default: "completed" },
    // Stripe-specific fields
    stripePaymentIntentId: { type: String, default: null },
    stripeSessionId: { type: String, default: null },
    stripeCustomerId: { type: String, default: null },
    receipt_url: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
