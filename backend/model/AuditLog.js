const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    action: {
      type: String,
      enum: [
        "login", "logout", "create_user", "update_user", "delete_user",
        "create_class", "update_class", "delete_class", "book_class",
        "cancel_booking", "mark_attendance", "create_membership",
        "create_invoice", "create_coupon", "create_plan",
        "update_plan", "delete_plan", "system",
      ],
      required: true,
      index: true,
    },
    resource: { type: String, trim: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: mongoose.Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true },
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
