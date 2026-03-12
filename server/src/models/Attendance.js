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

module.exports = mongoose.model("Attendance", AttendanceSchema);
