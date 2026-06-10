const mongoose = require("mongoose");

const membershipPlanSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Plan title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    durationMonths: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    color: {
      type: String,
      default: "#facc15",
      trim: true,
    },
    priority: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    allowedClasses: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    totalSessions: {
      type: Number,
      required: true,
      min: 1,
    },
    originalPlanId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MembershipPlan",
      default: null,
    },
  },
  { timestamps: true },
);

membershipPlanSchema.virtual("effectivePrice").get(function () {
  if (!this.discount) return this.price;
  return Math.round(this.price * (1 - this.discount / 100));
});

membershipPlanSchema.set("toJSON", { virtuals: true });
membershipPlanSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("MembershipPlan", membershipPlanSchema);
