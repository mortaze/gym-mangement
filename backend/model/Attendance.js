const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    membershipId: { type: mongoose.Schema.Types.ObjectId, ref: "Membership", required: true, index: true },
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    checkedInAt: { type: Date, default: Date.now, index: true },
    notes: String,
  },
  { timestamps: true },
);

attendanceSchema.index({ userId: 1, checkedInAt: -1 });
module.exports = mongoose.model("Attendance", attendanceSchema);
