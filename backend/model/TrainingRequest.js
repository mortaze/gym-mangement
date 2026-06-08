const mongoose = require("mongoose");

// تاریخچه تغییرات
const historySchema = mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    by: { type: String, enum: ["user", "trainer", "admin"], required: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "approved", "rejected"],
      required: true,
    },
    userNotes: { type: String },
    trainerNotes: { type: String },
    trainingPlan: { type: String },
    nutritionPlan: { type: String }, // می‌تونه JSON هم باشه
  },
  { _id: false },
);

const trainingRequestSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    goals: [{ type: String, trim: true }],
    age: { type: Number, min: 1, max: 120 },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    bmi: { type: Number },
    bmiCategory: { type: String },
    trainingExperience: { type: String, trim: true },
    injuries: { type: String, trim: true },
    weeklyAvailableDays: { type: Number, min: 1, max: 7 },
    notes: { type: String, trim: true },
    photos: [{ type: String }],
    paymentMethod: {
      type: String,
      enum: ["online", "cash"],
      default: "online",
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "in_progress", "approved", "rejected"],
      default: "pending",
    },
    userNotes: { type: String },
    trainerNotes: { type: String },
    trainingPlan: { type: String },
    nutritionPlan: { type: String },
    history: [historySchema], // اینجا همه تغییرات ثبت می‌شود
  },
  { timestamps: true },
);

trainingRequestSchema.index({ userId: 1, status: 1, createdAt: -1 });
trainingRequestSchema.index({ trainerId: 1, status: 1, createdAt: -1 });

const TrainingRequest = mongoose.model(
  "TrainingRequest",
  trainingRequestSchema,
);
module.exports = TrainingRequest;
