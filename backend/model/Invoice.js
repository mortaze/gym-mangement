const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    membershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Membership",
      index: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      index: true,
    },
    planName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true, min: 0 },
    couponCode: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Cancelled", "Refunded"],
      default: "Pending",
    },
    issuedAt: { type: Date, default: Date.now },
    paidAt: Date,
    notes: String,
  },
  { timestamps: true },
);

invoiceSchema.index({ userId: 1, createdAt: -1 });
module.exports = mongoose.model("Invoice", invoiceSchema);
