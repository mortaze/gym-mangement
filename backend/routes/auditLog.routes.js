const express = require("express");
const router = express.Router();
const AuditLog = require("../model/AuditLog");

router.get("/", async (req, res) => {
  try {
    const { limit = 50, skip = 0, action, userId } = req.query;
    const filter = {};
    if (action) filter.action = action;
    if (userId) filter.userId = userId;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate("userId", "name role")
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Math.min(Number(limit), 200)),
      AuditLog.countDocuments(filter),
    ]);
    res.json({ success: true, logs, total, limit: Number(limit), skip: Number(skip) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { userId, action, resource, resourceId, details, ip, userAgent } = req.body;
    if (!action) return res.status(400).json({ success: false, message: "action is required" });
    const log = await AuditLog.create({ userId, action, resource, resourceId, details, ip, userAgent });
    res.status(201).json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
