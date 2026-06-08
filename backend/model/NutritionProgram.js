const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    breakfast: { type: String, trim: true },
    snack: { type: String, trim: true },
    lunch: { type: String, trim: true },
    beforeWorkout: { type: String, trim: true },
    afterWorkout: { type: String, trim: true },
    dinner: { type: String, trim: true },
  },
  { _id: false },
);

const nutritionProgramSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "TrainingRequest", index: true },
    title: { type: String, required: true, trim: true },
    plan: { type: String, required: true },
    meals: { type: mealSchema, default: () => ({}) },
    status: { type: String, enum: ["active", "archived"], default: "active", index: true },
  },
  { timestamps: true },
);

nutritionProgramSchema.index({ userId: 1, status: 1, createdAt: -1 });
module.exports = mongoose.model("NutritionProgram", nutritionProgramSchema);
