const express = require("express");
const Membership = require("../model/Membership");
const Payment = require("../model/Payment");
const Attendance = require("../model/Attendance");
const { addMonths, expireMemberships, getMembershipSummary } = require("../utils/membership");

const router = express.Router();

const PLANS = {
  "1m-10": { planName: "طرح یک‌ماهه ۱۰ جلسه‌ای", durationMonths: 1, totalSessions: 10, price: 850000 },
  "1m-15": { planName: "طرح یک‌ماهه ۱۵ جلسه‌ای", durationMonths: 1, totalSessions: 15, price: 1100000 },
  "1m-20": { planName: "طرح یک‌ماهه ۲۰ جلسه‌ای", durationMonths: 1, totalSessions: 20, price: 1350000 },
  "3m-30": { planName: "طرح سه‌ماهه ۳۰ جلسه‌ای", durationMonths: 3, totalSessions: 30, price: 3200000 },
};

router.get("/plans", (req, res) => res.json({ success: true, plans: PLANS }));

router.post("/purchase", async (req, res) => {
  try {
    const { userId, planCode = "1m-10" } = req.body;
    const plan = PLANS[planCode];
    if (!userId || !plan) return res.status(400).json({ success: false, message: "userId and valid planCode are required" });

    const membership = await Membership.create({
      userId,
      planName: plan.planName,
      durationMonths: plan.durationMonths,
      totalSessions: plan.totalSessions,
      remainingSessions: plan.totalSessions,
      completedSessions: 0,
      price: plan.price,
      status: "Pending Payment",
    });
    const payment = await Payment.create({ userId, membershipId: membership._id, amount: plan.price, status: "Pending Payment", method: "mock" });
    membership.paymentId = payment._id;
    await membership.save();

    res.status(201).json({ success: true, membership, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/:id/approve-payment", async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) return res.status(404).json({ success: false, message: "Membership not found" });
    const start = new Date();
    membership.membershipStartDate = membership.membershipStartDate || start;
    membership.membershipEndDate = membership.membershipEndDate || addMonths(start, membership.durationMonths);
    membership.status = "Active";
    await membership.save();

    const payment = await Payment.findByIdAndUpdate(
      membership.paymentId,
      { status: "Paid", approvedAt: new Date(), approvedBy: req.body.approvedBy },
      { new: true },
    );
    res.json({ success: true, membership, payment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/attendance", async (req, res) => {
  try {
    await expireMemberships();
    const { userId, checkedInBy, notes } = req.body;
    const membership = await Membership.findOne({ userId, status: "Active" }).sort({ membershipEndDate: 1 });
    if (!membership) return res.status(400).json({ success: false, message: "No active membership" });
    if (membership.membershipEndDate && membership.membershipEndDate < new Date()) {
      membership.status = "Expired";
      await membership.save();
      return res.status(400).json({ success: false, message: "Membership expired" });
    }
    if (membership.remainingSessions <= 0) {
      membership.status = "Expired";
      await membership.save();
      return res.status(400).json({ success: false, message: "No remaining sessions" });
    }
    const attendance = await Attendance.create({ userId, membershipId: membership._id, checkedInBy, notes });
    membership.remainingSessions -= 1;
    membership.completedSessions += 1;
    membership.lastAttendanceAt = attendance.checkedInAt;
    if (membership.remainingSessions <= 0) membership.status = "Expired";
    await membership.save();
    res.status(201).json({ success: true, attendance, membership });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const summary = req.query.userId ? await getMembershipSummary(req.query.userId) : {};
    res.json({ success: true, ...summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    await expireMemberships();
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.userId) filter.userId = req.query.userId;
    const memberships = await Membership.find(filter).populate("userId", "name employeeCode role contactNumber").populate("paymentId").sort({ createdAt: -1 });
    res.json({ success: true, memberships });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
