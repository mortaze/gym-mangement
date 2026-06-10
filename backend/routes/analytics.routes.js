const express = require("express");
const router = express.Router();
const Membership = require("../model/Membership");
const Invoice = require("../model/Invoice");
const ClassSession = require("../model/ClassSession");
const User = require("../model/User");
const AuditLog = require("../model/AuditLog");
const mongoose = require("mongoose");

router.get("/overview", async (req, res) => {
  try {
    const [
      activeMemberships,
      totalMemberships,
      invoicesPaid,
      invoicesData,
      classSessions,
      classBookings,
      auditCounts,
      userCounts,
    ] = await Promise.all([
      Membership.countDocuments({ status: "Active" }),
      Membership.countDocuments(),
      Invoice.aggregate([
        { $match: { status: "Paid" } },
        { $group: { _id: null, total: { $sum: "$finalAmount" }, count: { $sum: 1 } } },
      ]),
      Invoice.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$finalAmount" } } },
      ]),
      ClassSession.find().select("capacity attendees waitingList date status"),
      ClassSession.aggregate([
        { $unwind: "$attendees" },
        { $match: { "attendees.status": { $ne: "cancelled" } } },
        { $count: "total" },
      ]),
      AuditLog.aggregate([
        { $group: { _id: "$action", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
    ]);

    const totalRevenue = invoicesPaid.length > 0 ? invoicesPaid[0].total : 0;
    const paidCount = invoicesPaid.length > 0 ? invoicesPaid[0].count : 0;
    const totalClasses = classSessions.length;
    const totalBookings = classBookings.length > 0 ? classBookings[0].total : 0;
    let occupancyRate = 0;
    if (totalClasses > 0) {
      const totalCapacity = classSessions.reduce((s, c) => s + c.capacity, 0);
      occupancyRate = totalCapacity > 0 ? Math.round((totalBookings / totalCapacity) * 100) : 0;
    }

    const roleCounts = {};
    userCounts.forEach((u) => { roleCounts[u._id || "unknown"] = u.count; });

    const invoiceStatus = {};
    invoicesData.forEach((inv) => { invoiceStatus[inv._id] = { count: inv.count, total: inv.total }; });

    res.json({
      success: true,
      stats: {
        activeMemberships,
        totalMemberships,
        totalRevenue,
        paidInvoices: paidCount,
        totalClasses,
        totalBookings,
        occupancyRate,
        usersByRole: roleCounts,
        invoiceStatus,
        auditActions: auditCounts,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/revenue-trend", async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - Number(days));
    const invoices = await Invoice.aggregate([
      { $match: { createdAt: { $gte: since }, status: "Paid" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$finalAmount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, trend: invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/membership-growth", async (req, res) => {
  try {
    const memberships = await Membership.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
          revenue: { $sum: "$price" },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 24 },
    ]);
    res.json({ success: true, growth: memberships });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/class-heatmap", async (req, res) => {
  try {
    const { days = 14 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - Number(days));
    const sessions = await ClassSession.aggregate([
      { $match: { date: { $gte: since } } },
      { $unwind: "$attendees" },
      { $match: { "attendees.status": "attended" } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          attended: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, heatmap: sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/trainer-performance", async (req, res) => {
  try {
    const sessions = await ClassSession.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: "$trainerId",
          totalClasses: { $sum: 1 },
          totalBookings: { $sum: { $size: "$attendees" } },
          avgAttendance: { $avg: { $size: { $filter: { input: "$attendees", as: "a", cond: { $eq: ["$$a.status", "attended"] } } } } },
        },
      },
      { $sort: { totalClasses: -1 } },
      { $limit: 20 },
    ]);
    await ClassSession.populate(sessions, { path: "_id", select: "name", model: "User" });
    const performance = sessions.map((s) => ({
      trainerId: s._id?._id || s._id,
      name: s._id?.name || "نامشخص",
      totalClasses: s.totalClasses,
      totalBookings: s.totalBookings,
      avgAttendance: Math.round(s.avgAttendance || 0),
    }));
    res.json({ success: true, performance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
