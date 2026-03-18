const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, required: true, default: Date.now },
    paymentMethod: { type: String, enum: ["cash", "card", "bank_transfer", "stripe", "online"], default: "cash" },
    description: { type: String, default: "" },
    
    // Payment status and proof
    status: { type: String, enum: ["pending", "approved", "rejected", "completed"], default: "pending" },
    proofOfPayment: { type: String, default: null }, // URL/path to uploaded proof (image/PDF)
    
    // Admin review fields
    reviewStatus: { type: String, enum: ["pending_review", "approved", "rejected"], default: "pending_review" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewNotes: { type: String, default: "" },
    reviewedAt: { type: Date, default: null },
    
    // Stripe-specific fields
    stripePaymentIntentId: { type: String, default: null },
    stripeSessionId: { type: String, default: null },
    stripeCustomerId: { type: String, default: null },
    receipt_url: { type: String, default: null },
    
    // Payment type (membership, other)
    paymentType: { type: String, enum: ["membership_renewal", "general"], default: "general" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
