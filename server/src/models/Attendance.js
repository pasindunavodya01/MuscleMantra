const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    checkInTime: { type: Date, required: true, default: Date.now },
    checkOutTime: { type: Date },
    date: { type: String, required: true } // Format: YYYY-MM-DD
  },
  { timestamps: true }
);

// Create compound index for faster queries on userId + date
AttendanceSchema.index({ userId: 1, date: 1 });
// Also index for finding all records of a user sorted by date
AttendanceSchema.index({ userId: 1, checkInTime: -1 });

module.exports = mongoose.model("Attendance", AttendanceSchema);
