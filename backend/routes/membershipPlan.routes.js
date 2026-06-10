const express = require("express");
const router = express.Router();
const MembershipPlan = require("../model/MembershipPlan");
const PricingHistory = require("../model/PricingHistory");

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.active === "true") filter.isActive = true;
    if (req.query.active === "false") filter.isActive = false;
    const plans = await MembershipPlan.find(filter).sort({ priority: 1, createdAt: -1 });
    res.json({ success: true, plans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const plan = await MembershipPlan.create(req.body);
    res.status(201).json({ success: true, plan });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const existing = await MembershipPlan.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: "Plan not found" });

    const priceChanged = existing.price !== req.body.price || existing.discount !== req.body.discount;
    const oldPrice = existing.price;
    const oldDiscount = existing.discount;

    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (priceChanged) {
      await PricingHistory.create({
        planId: plan._id,
        oldPrice,
        newPrice: plan.price,
        oldDiscount,
        newDiscount: plan.discount,
        changedBy: req.body.changedBy || null,
        reason: req.body.changeReason || "Price update",
      });
    }

    res.json({ success: true, plan });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const plan = await MembershipPlan.findByIdAndDelete(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    res.json({ success: true, message: "Plan deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch("/:id/toggle", async (req, res) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ success: false, message: "Plan not found" });
    plan.isActive = !plan.isActive;
    await plan.save();
    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/:id/duplicate", async (req, res) => {
  try {
    const original = await MembershipPlan.findById(req.params.id);
    if (!original) return res.status(404).json({ success: false, message: "Plan not found" });

    const dup = await MembershipPlan.create({
      ...original.toObject(),
      _id: undefined,
      title: `${original.title} (کپی)`,
      originalPlanId: original._id,
      createdAt: undefined,
      updatedAt: undefined,
    });

    res.status(201).json({ success: true, plan: dup });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id/pricing-history", async (req, res) => {
  try {
    const history = await PricingHistory.find({ planId: req.params.id })
      .populate("changedBy", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
