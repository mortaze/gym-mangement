const express = require("express");
const router = express.Router();
const Notification = require("../model/Notification");

router.get("/:userId", async (req, res) => {
  try {
    const filter = { userId: req.params.userId };
    if (req.query.unread === "true") filter.read = false;
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json({ success: true, notification });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found" });
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch("/read-all/:userId", async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.params.userId, read: false }, { read: true });
    res.json({ success: true, message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/unread-count/:userId", async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.params.userId, read: false });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
