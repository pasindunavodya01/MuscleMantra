const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const QRCodeSchema = new mongoose.Schema(
  {
    code: { type: String, unique: true, required: true, default: () => uuidv4() },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date }, // Optional expiration time
    scannedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // Track users who have scanned
  },
  { timestamps: true }
);

// Index for faster lookups of active codes
QRCodeSchema.index({ code: 1, isActive: 1 });
// Index for finding active codes quickly
QRCodeSchema.index({ isActive: 1, createdAt: -1 });

module.exports = mongoose.model("QRCode", QRCodeSchema);
