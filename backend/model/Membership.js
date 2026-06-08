const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planName: { type: String, required: true, trim: true },
    durationMonths: { type: Number, required: true, min: 1 },
    membershipStartDate: { type: Date },
    membershipEndDate: { type: Date, index: true },
    totalSessions: { type: Number, required: true, min: 1 },
    remainingSessions: { type: Number, required: true, min: 0 },
    completedSessions: { type: Number, default: 0, min: 0 },
    price: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["Pending Payment", "Active", "Expired", "Cancelled"],
      default: "Pending Payment",
      index: true,
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", index: true },
    lastAttendanceAt: Date,
  },
  { timestamps: true },
);

membershipSchema.index({ userId: 1, status: 1, membershipEndDate: 1 });

membershipSchema.virtual("remainingDays").get(function () {
  if (!this.membershipEndDate || this.status !== "Active") return 0;
  return Math.max(0, Math.ceil((this.membershipEndDate - new Date()) / 86400000));
});

membershipSchema.set("toJSON", { virtuals: true });
membershipSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Membership", membershipSchema);
