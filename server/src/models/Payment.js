const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, required: true, default: Date.now },
    paymentMethod: { type: String, enum: ["cash", "card", "bank_transfer", "online"], default: "cash" },
    description: { type: String, default: "" },
    status: { type: String, enum: ["completed", "pending", "failed"], default: "completed" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
