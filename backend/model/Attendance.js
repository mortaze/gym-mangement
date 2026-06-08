const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    membershipId: { type: mongoose.Schema.Types.ObjectId, ref: "Membership", required: true, index: true },
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    checkInAt: { type: Date, default: Date.now, index: true },
    note: { type: String, trim: true },
  },
  { timestamps: true },
);

attendanceSchema.index({ userId: 1, checkInAt: -1 });
module.exports = mongoose.model("Attendance", attendanceSchema);
