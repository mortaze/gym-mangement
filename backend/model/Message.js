const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false, index: true },
    readAt: Date,
    conversationKey: { type: String, index: true },
  },
  { timestamps: true },
);

messageSchema.pre("save", function (next) {
  const ids = [String(this.senderId), String(this.receiverId)].sort();
  this.conversationKey = ids.join("_");
  next();
});

messageSchema.index({ conversationKey: 1, createdAt: -1 });
module.exports = mongoose.model("Message", messageSchema);
