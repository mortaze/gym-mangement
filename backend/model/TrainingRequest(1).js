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
    trainingPlan: { type: String }, // می‌تونه JSON هم باشه
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
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    photos: [{ type: String, required: true }],
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
    history: [historySchema], // اینجا همه تغییرات ثبت می‌شود
  },
  { timestamps: true },
);

const TrainingRequest = mongoose.model(
  "TrainingRequest",
  trainingRequestSchema,
);
module.exports = TrainingRequest;
