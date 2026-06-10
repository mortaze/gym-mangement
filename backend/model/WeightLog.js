const mongoose = require("mongoose");

const weightLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    weight: { type: Number, required: true, min: 1 },
    bodyFat: { type: Number, min: 0, max: 100 },
    chest: { type: Number, min: 0 },
    waist: { type: Number, min: 0 },
    arm: { type: Number, min: 0 },
    thigh: { type: Number, min: 0 },
    notes: { type: String, trim: true },
    date: { type: Date, default: Date.now, index: true },
    loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

weightLogSchema.index({ userId: 1, date: -1 });
module.exports = mongoose.model("WeightLog", weightLogSchema);
