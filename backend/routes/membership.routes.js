const express = require("express");
const Membership = require("../model/Membership");
const Attendance = require("../model/Attendance");
const Payment = require("../model/Payment");
const { purchaseMembership, approvePayment, recordAttendance, getSummary, refreshMembershipStatuses } = require("../services/membership.service");
const { protect, authorize } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/summary/:userId", async (req, res) => {
  try {
    const summary = await getSummary(req.params.userId);
    res.json({ success: true, ...summary });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post("/purchase", async (req, res) => {
  try {
    const result = await purchaseMembership(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post("/attendance", async (req, res) => {
  try {
    const result = await recordAttendance(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get("/admin/status", async (req, res) => {
  try {
    await refreshMembershipStatuses();
    const today = new Date();
    const near = new Date(today);
    near.setDate(near.getDate() + 7);
    const [active, expired, nearExpiry] = await Promise.all([
      Membership.find({ status: "Active" }).populate("userId", "name employeeCode").sort({ membershipEndDate: 1 }),
      Membership.find({ status: "Expired" }).populate("userId", "name employeeCode").sort({ membershipEndDate: -1 }),
      Membership.find({ status: "Active", membershipEndDate: { $lte: near } }).populate("userId", "name employeeCode").sort({ membershipEndDate: 1 }),
    ]);
    res.json({ success: true, active, expired, nearExpiry });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get("/payments", async (req, res) => {
  try {
    const payments = await Payment.find().populate("userId", "name employeeCode").populate("membershipId").sort({ createdAt: -1 });
    const revenue = await Payment.aggregate([{ $match: { status: "Paid" } }, { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]);
    res.json({ success: true, payments, revenue: revenue[0] || { total: 0, count: 0 } });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post("/payments/:id/approve", async (req, res) => {
  try {
    const result = await approvePayment(req.params.id, req.body.approvedBy);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get("/attendance", async (req, res) => {
  const attendance = await Attendance.find().populate("userId", "name employeeCode").populate("membershipId").sort({ checkInAt: -1 }).limit(100);
  res.json({ success: true, attendance });
});

module.exports = router;
