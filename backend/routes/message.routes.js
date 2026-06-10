const express = require("express");
const router = express.Router();
const Message = require("../model/Message");
const User = require("../model/User");
const Notification = require("../model/Notification");

router.get("/users/search", async (req, res) => {
  try {
    const { q, exclude } = req.query;
    if (!q?.trim()) return res.json({ success: true, users: [] });
    const filter = {
      $or: [
        { name: { $regex: q.trim(), $options: "i" } },
        { phone: { $regex: q.trim(), $options: "i" } },
        { employeeCode: { $regex: q.trim(), $options: "i" } },
      ],
    };
    if (exclude) filter._id = { $ne: exclude };
    const users = await User.find(filter).select("name employeeCode phone email role profileImage").limit(20);
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/conversations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .populate("senderId", "name employeeCode")
      .populate("receiverId", "name employeeCode")
      .sort({ createdAt: -1 });

    const conversationMap = {};
    for (const msg of messages) {
      const otherId = String(msg.senderId._id) === userId ? String(msg.receiverId._id) : String(msg.senderId._id);
      if (!conversationMap[otherId]) {
        conversationMap[otherId] = {
          withUser: String(msg.senderId._id) === userId ? msg.receiverId : msg.senderId,
          lastMessage: msg,
          unread: !msg.read && String(msg.receiverId._id) === userId ? 1 : 0,
        };
      } else {
        if (!msg.read && String(msg.receiverId._id) === userId) {
          conversationMap[otherId].unread += 1;
        }
      }
    }

    const conversations = Object.values(conversationMap).sort(
      (a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt),
    );

    res.json({ success: true, conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:userId1/:userId2", async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    })
      .populate("senderId", "name employeeCode")
      .sort({ createdAt: 1 });

    await Message.updateMany(
      { senderId: userId2, receiverId: userId1, read: false },
      { read: true, readAt: new Date() },
    );

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;
    if (!senderId || !receiverId || !text?.trim()) {
      return res.status(400).json({ success: false, message: "senderId, receiverId, and text are required" });
    }

    const sender = await User.findById(senderId).select("name");
    if (!sender) return res.status(400).json({ success: false, message: "Sender not found" });

    const message = await Message.create({ senderId, receiverId, text: text.trim() });

    await Notification.create({
      userId: receiverId,
      type: "message_received",
      title: `پیام جدید از ${sender.name}`,
      message: text.trim().slice(0, 100),
      relatedId: message._id,
    });

    const populated = await message.populate("senderId", "name employeeCode");
    res.status(201).json({ success: true, message: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch("/read/:userId1/:userId2", async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    await Message.updateMany(
      { senderId: userId2, receiverId: userId1, read: false },
      { read: true, readAt: new Date() },
    );
    res.json({ success: true, message: "Messages marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/unread-count/:userId", async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiverId: req.params.userId, read: false });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
