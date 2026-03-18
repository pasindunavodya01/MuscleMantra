const mongoose = require("mongoose");

const MemberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    memberCode: { type: String, required: true, unique: true, trim: true },
    phone: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    plan: { type: String, enum: ["1-month", "3-months", "6-months", "1-year"], default: "1-month", required: true },
    status: { type: String, enum: ["active", "paused", "expired"], default: "active", required: true },
    joinDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", MemberSchema);

