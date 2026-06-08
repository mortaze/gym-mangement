const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    membershipId: { type: mongoose.Schema.Types.ObjectId, ref: "Membership", index: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["membership_purchase", "membership_renewal"], default: "membership_purchase" },
    method: { type: String, enum: ["mock", "cash", "card"], default: "mock" },
    status: { type: String, enum: ["Pending Payment", "Paid", "Rejected", "Refunded"], default: "Pending Payment", index: true },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    approvedAt: Date,
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
