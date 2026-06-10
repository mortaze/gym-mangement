const express = require("express");
const router = express.Router();
const Coupon = require("../model/Coupon");
const crypto = require("crypto");

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.active === "true") filter.isActive = true;
    if (req.query.active === "false") filter.isActive = false;
    if (req.query.type) filter.type = req.query.type;
    const coupons = await Coupon.find(filter)
      .populate("memberSpecific", "name employeeCode")
      .sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate("memberSpecific", "name employeeCode");
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, coupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.json({ success: true, message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/validate", async (req, res) => {
  try {
    const { code, amount, userId } = req.body;
    if (!code) return res.status(400).json({ success: false, message: "Code is required" });

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Invalid coupon code" });

    if (coupon.isExpired) return res.status(400).json({ success: false, message: "Coupon has expired" });
    if (coupon.isExhausted) return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
    if (coupon.memberSpecific && String(coupon.memberSpecific) !== userId) {
      return res.status(403).json({ success: false, message: "This coupon is not valid for you" });
    }
    if (amount < coupon.minPurchase) {
      return res.status(400).json({ success: false, message: `Minimum purchase amount is ${coupon.minPurchase}` });
    }

    let discountAmount = coupon.type === "percentage"
      ? Math.round(amount * (coupon.value / 100))
      : Math.min(coupon.value, amount);

    res.json({
      success: true,
      coupon,
      discountAmount,
      finalAmount: Math.max(0, amount - discountAmount),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/generate-gift", async (req, res) => {
  try {
    const { value, type = "fixed", maxUses = 1, expiresAt, memberSpecific, description } = req.body;

    const code = "GIFT-" + crypto.randomBytes(4).toString("hex").toUpperCase();

    const coupon = await Coupon.create({
      code,
      type,
      value,
      maxUses,
      expiresAt: expiresAt || null,
      isGift: true,
      isActive: true,
      memberSpecific: memberSpecific || null,
      description: description || "Gift code",
    });

    res.status(201).json({ success: true, coupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get("/analytics/summary", async (req, res) => {
  try {
    const total = await Coupon.countDocuments();
    const active = await Coupon.countDocuments({ isActive: true });
    const gift = await Coupon.countDocuments({ isGift: true });
    const totalUsed = await Coupon.aggregate([
      { $group: { _id: null, total: { $sum: "$usedCount" } } },
    ]);

    res.json({
      success: true,
      analytics: {
        total,
        active,
        gift,
        totalUsed: totalUsed[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
