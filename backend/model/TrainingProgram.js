const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    day: String,
    name: { type: String, required: true },
    sets: String,
    reps: String,
    restTime: String,
    notes: String,
  },
  { _id: false },
);

const trainingProgramSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "TrainingRequest", index: true },
    title: { type: String, required: true, trim: true },
    trainingDays: { type: Number, min: 1, max: 7 },
    exercises: [exerciseSchema],
    status: { type: String, enum: ["active", "archived"], default: "active", index: true },
    notes: String,
  },
  { timestamps: true },
);

trainingProgramSchema.index({ userId: 1, status: 1, createdAt: -1 });
module.exports = mongoose.model("TrainingProgram", trainingProgramSchema);
