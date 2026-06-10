const mongoose = require("mongoose");

const pricingHistorySchema = new mongoose.Schema(
  {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MembershipPlan",
      required: true,
      index: true,
    },
    oldPrice: { type: Number, required: true },
    newPrice: { type: Number, required: true },
    oldDiscount: { type: Number, default: 0 },
    newDiscount: { type: Number, default: 0 },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reason: { type: String, trim: true },
  },
  { timestamps: true },
);

pricingHistorySchema.index({ planId: 1, createdAt: -1 });
module.exports = mongoose.model("PricingHistory", pricingHistorySchema);
