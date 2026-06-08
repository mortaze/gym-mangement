const mongoose = require("mongoose");

const nutritionProgramSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "TrainingRequest", index: true },
    title: { type: String, required: true, trim: true },
    plan: { type: String, required: true },
    status: { type: String, enum: ["active", "archived"], default: "active", index: true },
  },
  { timestamps: true },
);

nutritionProgramSchema.index({ userId: 1, status: 1, createdAt: -1 });
module.exports = mongoose.model("NutritionProgram", nutritionProgramSchema);
