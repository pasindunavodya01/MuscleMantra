const mongoose = require("mongoose");

const BMISchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    weight: { type: Number, required: true }, // in kg
    height: { type: Number, required: true }, // in cm
    bmi: { type: Number, required: true },
    category: { type: String, enum: ["underweight", "normal", "overweight", "obese"], required: true },
    recordDate: { type: Date, required: true, default: Date.now },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("BMI", BMISchema);
