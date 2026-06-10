const express = require("express");
const Membership = require("../model/Membership");
const MembershipPlan = require("../model/MembershipPlan");
const Payment = require("../model/Payment");
const Invoice = require("../model/Invoice");
const Coupon = require("../model/Coupon");
const Attendance = require("../model/Attendance");
const { addMonths, expireMemberships, getMembershipSummary } = require("../utils/membership");

const router = express.Router();

router.get("/plans", async (req, res) => {
  try {
    const plans = await MembershipPlan.find({ isActive: true }).sort({ priority: 1 });
    res.json({ success: true, plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/purchase", async (req, res) => {
  try {
    const { userId, planId, couponCode } = req.body;
    if (!userId || !planId) return res.status(400).json({ success: false, message: "userId and planId are required" });

    const plan = await MembershipPlan.findById(planId);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    if (!plan.isActive) return res.status(400).json({ success: false, message: "Plan is not active" });

    let finalPrice = plan.effectivePrice;
    let appliedCoupon = null;
    let couponDiscount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim(), isActive: true });
      if (!coupon) return res.status(404).json({ success: false, message: "Invalid coupon code" });
      if (coupon.isExpired) return res.status(400).json({ success: false, message: "Coupon has expired" });
      if (coupon.isExhausted) return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
      if (coupon.memberSpecific && String(coupon.memberSpecific) !== userId) {
        return res.status(403).json({ success: false, message: "This coupon is not valid for you" });
      }

      couponDiscount = coupon.type === "percentage"
        ? Math.round(finalPrice * (coupon.value / 100))
        : Math.min(coupon.value, finalPrice);
      finalPrice = Math.max(0, finalPrice - couponDiscount);
      appliedCoupon = coupon;

      coupon.usedCount += 1;
      await coupon.save();
    }

    const membership = await Membership.create({
      userId,
      planName: plan.title,
      durationMonths: plan.durationMonths,
      totalSessions: plan.totalSessions,
      remainingSessions: plan.totalSessions,
      completedSessions: 0,
      price: finalPrice,
      status: "Pending Payment",
    });

    const payment = await Payment.create({
      userId,
      membershipId: membership._id,
      amount: finalPrice,
      status: "Pending Payment",
      method: "mock",
      notes: couponDiscount > 0 ? `Coupon discount: ${couponDiscount}` : undefined,
    });

    membership.paymentId = payment._id;
    await membership.save();

    const count = await Invoice.countDocuments();
    const invoice = await Invoice.create({
      invoiceNumber: `INV-${String(count + 1).padStart(6, "0")}`,
      userId,
      membershipId: membership._id,
      paymentId: payment._id,
      planName: plan.title,
      amount: plan.price,
      discount: plan.discount + couponDiscount,
      finalAmount: finalPrice,
      couponCode: couponCode || undefined,
      status: "Pending",
    });

    res.status(201).json({ success: true, membership, payment, invoice });
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
