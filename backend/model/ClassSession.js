const mongoose = require("mongoose");

const attendeeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["booked", "cancelled", "attended"],
      default: "booked",
    },
    qrToken: { type: String, unique: true, sparse: true },
    attendedAt: Date,
  },
  { _id: true },
);

const waitingEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const classSessionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: Date, required: true, index: true },
    time: { type: String, required: true },
    capacity: { type: Number, required: true, min: 1 },
    duration: { type: Number, required: true, min: 15 },
    description: { type: String, trim: true },
    location: { type: String, trim: true, default: "باشگاه" },
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled"],
      default: "scheduled",
      index: true,
    },
    attendees: [attendeeSchema],
    waitingList: [waitingEntrySchema],
  },
  { timestamps: true },
);

classSessionSchema.virtual("availableSpots").get(function () {
  const bookedCount = this.attendees.filter((a) => a.status === "booked").length;
  return Math.max(0, this.capacity - bookedCount);
});

classSessionSchema.virtual("waitingCount").get(function () {
  return this.waitingList.length;
});

classSessionSchema.set("toJSON", { virtuals: true });
classSessionSchema.set("toObject", { virtuals: true });

classSessionSchema.index({ date: 1, status: 1 });
classSessionSchema.index({ "attendees.userId": 1 });
classSessionSchema.index({ "attendees.qrToken": 1 }, { sparse: true });

module.exports = mongoose.model("ClassSession", classSessionSchema);
