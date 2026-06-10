const express = require("express");
const router = express.Router();
const Invoice = require("../model/Invoice");
const Membership = require("../model/Membership");
const Payment = require("../model/Payment");

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId) filter.userId = req.query.userId;
    if (req.query.status) filter.status = req.query.status;
    const invoices = await Invoice.find(filter)
      .populate("userId", "name employeeCode")
      .populate("membershipId")
      .populate("paymentId")
      .sort({ createdAt: -1 });
    res.json({ success: true, invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("userId", "name employeeCode contactNumber email address")
      .populate("membershipId")
      .populate("paymentId");
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });
    res.json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/generate", async (req, res) => {
  try {
    const { membershipId } = req.body;
    const membership = await Membership.findById(membershipId).populate("userId");
    if (!membership) return res.status(404).json({ success: false, message: "Membership not found" });

    const payment = await Payment.findById(membership.paymentId);

    const count = await Invoice.countDocuments();
    const invoiceNumber = `INV-${String(count + 1).padStart(6, "0")}`;

    const invoice = await Invoice.create({
      invoiceNumber,
      userId: membership.userId._id,
      membershipId: membership._id,
      paymentId: membership.paymentId,
      planName: membership.planName,
      amount: membership.price,
      discount: 0,
      finalAmount: membership.price,
      status: payment?.status === "Paid" ? "Paid" : "Pending",
      paidAt: payment?.approvedAt || null,
    });

    res.status(201).json({ success: true, invoice });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
