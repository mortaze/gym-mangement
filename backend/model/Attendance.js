const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    membershipId: { type: mongoose.Schema.Types.ObjectId, ref: "Membership", required: true, index: true },
    checkedInAt: { type: Date, default: Date.now, index: true },
    checkedOutAt: Date,
    source: { type: String, enum: ["manual", "scan", "system"], default: "manual" },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

attendanceSchema.index({ userId: 1, checkedInAt: -1 });

module.exports = mongoose.model("Attendance", attendanceSchema);
