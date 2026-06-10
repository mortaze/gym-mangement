const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["workout_assigned", "class_reminder", "payment_confirmed", "membership_expiry", "message_received", "progress_update", "system"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, trim: true },
    read: { type: Boolean, default: false, index: true },
    link: { type: String, trim: true },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
module.exports = mongoose.model("Notification", notificationSchema);
