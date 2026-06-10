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

const dailyLogSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    dayName: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: Date,
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
    trainingDays: { type: Number, required: true, min: 1, max: 7 },
    weekDays: [{ type: String, trim: true }],
    exercises: { type: [exerciseSchema], default: [] },
    dailyLogs: { type: [dailyLogSchema], default: [] },
    isTemplate: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ["active", "archived"], default: "active", index: true },
  },
  { timestamps: true },
);

trainingProgramSchema.virtual("progressScore").get(function () {
  if (!this.dailyLogs || this.dailyLogs.length === 0) return 0;
  const completed = this.dailyLogs.filter((l) => l.completed).length;
  return Math.round((completed / this.dailyLogs.length) * 100);
});

trainingProgramSchema.virtual("totalScheduledDays").get(function () {
  return this.weekDays?.length || this.trainingDays || 0;
});

trainingProgramSchema.set("toJSON", { virtuals: true });
trainingProgramSchema.set("toObject", { virtuals: true });

trainingProgramSchema.index({ userId: 1, status: 1, createdAt: -1 });
trainingProgramSchema.index({ trainerId: 1, createdAt: -1 });
module.exports = mongoose.model("TrainingProgram", trainingProgramSchema);
