const mongoose = require("mongoose");
const {
  calculateRemainingDays,
  getMembershipStatus,
} = require("../utils/membershipUtils");

const membershipSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planName: { type: String, required: true, trim: true, default: "Membership" },
    membershipStartDate: { type: Date, required: true },
    membershipEndDate: { type: Date, required: true, index: true },
    totalSessions: { type: Number, required: true, min: 0 },
    remainingSessions: { type: Number, required: true, min: 0 },
    completedSessions: { type: Number, default: 0, min: 0 },
    remainingDays: { type: Number, default: 0, min: 0 },
    amount: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["pending_payment", "active", "expired", "cancelled"],
      default: "pending_payment",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending Payment", "Paid", "Rejected", "Refunded"],
      default: "Pending Payment",
      index: true,
    },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    activatedAt: Date,
  },
  { timestamps: true },
);

membershipSchema.index({ userId: 1, status: 1, membershipEndDate: 1 });
membershipSchema.index({ status: 1, paymentStatus: 1 });

membershipSchema.pre("validate", function (next) {
  if (this.isNew && this.remainingSessions === undefined) {
    this.remainingSessions = this.totalSessions;
  }
  this.remainingDays = calculateRemainingDays(this.membershipEndDate);
  this.status = getMembershipStatus(this);
  next();
});

membershipSchema.methods.refreshStatus = function () {
  this.remainingDays = calculateRemainingDays(this.membershipEndDate);
  this.status = getMembershipStatus(this);
  return this;
};

module.exports = mongoose.model("Membership", membershipSchema);
