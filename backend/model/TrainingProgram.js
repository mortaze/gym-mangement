const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema(
  {
    day: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    sets: { type: Number, min: 0, default: 0 },
    reps: { type: String, trim: true },
    restTime: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { _id: false },
);

const trainingProgramSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "TrainingRequest", index: true },
    title: { type: String, required: true, trim: true },
    trainingDays: { type: Number, min: 1, max: 7, required: true },
    exercises: [exerciseSchema],
    status: { type: String, enum: ["active", "archived"], default: "active", index: true },
    startsAt: Date,
    endsAt: Date,
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

trainingProgramSchema.index({ userId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("TrainingProgram", trainingProgramSchema);
