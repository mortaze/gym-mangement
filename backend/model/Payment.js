const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    membershipId: { type: mongoose.Schema.Types.ObjectId, ref: "Membership", index: true },
    amount: { type: Number, required: true, min: 0 },
    method: { type: String, enum: ["mock", "cash", "card", "online"], default: "mock" },
    status: { type: String, enum: ["Pending Payment", "Paid", "Rejected"], default: "Pending Payment", index: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
    description: { type: String, trim: true },
  },
  { timestamps: true },
);

paymentSchema.index({ status: 1, createdAt: -1 });
module.exports = mongoose.model("Payment", paymentSchema);
