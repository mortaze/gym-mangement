const express = require("express");
const router = express.Router();
const WeightLog = require("../model/WeightLog");

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId) filter.userId = req.query.userId;
    const logs = await WeightLog.find(filter)
      .populate("loggedBy", "name")
      .sort({ date: -1 });
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/latest/:userId", async (req, res) => {
  try {
    const log = await WeightLog.findOne({ userId: req.params.userId }).sort({ date: -1 });
    res.json({ success: true, log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/trend/:userId", async ( req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);
    const logs = await WeightLog.find({ userId: req.params.userId, date: { $gte: since } })
      .sort({ date: 1 });
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const log = await WeightLog.create(req.body);
    res.status(201).json({ success: true, log });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const log = await WeightLog.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: "Log not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
