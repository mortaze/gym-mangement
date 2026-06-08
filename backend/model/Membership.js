const mongoose = require("mongoose");
const { calculateRemainingDays } = require("../utils/gymCalculations");

const membershipSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planName: { type: String, required: true, trim: true },
    durationMonths: { type: Number, required: true, min: 1 },
    membershipStartDate: { type: Date },
    membershipEndDate: { type: Date },
    totalSessions: { type: Number, required: true, min: 1 },
    remainingSessions: { type: Number, min: 0 },
    completedSessions: { type: Number, default: 0, min: 0 },
    remainingDays: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["Pending Payment", "Active", "Expired", "Cancelled"],
      default: "Pending Payment",
      index: true,
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    price: { type: Number, default: 0, min: 0 },
    notes: { type: String, trim: true },
    activatedAt: Date,
    expiredAt: Date,
  },
  { timestamps: true },
);

membershipSchema.pre("validate", function (next) {
  if (this.remainingSessions === undefined || this.remainingSessions === null) {
    this.remainingSessions = this.totalSessions || 0;
  }
  this.remainingDays = calculateRemainingDays(this.membershipEndDate);
  if (this.status === "Active" && (this.remainingSessions <= 0 || this.remainingDays <= 0)) {
    this.status = "Expired";
    this.expiredAt = this.expiredAt || new Date();
  }
  next();
});

membershipSchema.index({ userId: 1, status: 1, membershipEndDate: 1 });
membershipSchema.index({ status: 1, membershipEndDate: 1 });

module.exports = mongoose.model("Membership", membershipSchema);
