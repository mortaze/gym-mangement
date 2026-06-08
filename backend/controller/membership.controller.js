const Membership = require("../model/Membership");
const Payment = require("../model/Payment");
const Attendance = require("../model/Attendance");

const parseDate = (value, fallback) => (value ? new Date(value) : fallback);

exports.refreshMembershipStatuses = async () => {
  const memberships = await Membership.find({ status: { $in: ["active", "pending_payment"] } });
  await Promise.all(
    memberships.map(async (membership) => {
      const previousStatus = membership.status;
      membership.refreshStatus();
      if (membership.status !== previousStatus || membership.isModified("remainingDays")) {
        await membership.save();
      }
    }),
  );
};

exports.purchaseMembership = async (req, res) => {
  try {
    const {
      userId,
      planName,
      membershipStartDate,
      membershipEndDate,
      totalSessions,
      amount = 0,
      type = "membership_purchase",
      notes,
    } = req.body;

    if (!userId || !membershipEndDate || !totalSessions) {
      return res.status(400).json({ success: false, message: "عضو، تاریخ پایان و تعداد جلسات الزامی است." });
    }

    const startDate = parseDate(membershipStartDate, new Date());
    const endDate = parseDate(membershipEndDate);

    const membership = await Membership.create({
      userId,
      planName: planName || `${totalSessions} Sessions`,
      membershipStartDate: startDate,
      membershipEndDate: endDate,
      totalSessions: Number(totalSessions),
      remainingSessions: Number(totalSessions),
      completedSessions: 0,
      amount: Number(amount) || 0,
      paymentStatus: "Pending Payment",
      status: "pending_payment",
      createdBy: req.user?._id,
    });

    const payment = await Payment.create({
      userId,
      membershipId: membership._id,
      amount: Number(amount) || 0,
      type,
      method: "mock",
      status: "Pending Payment",
      notes,
    });

    membership.paymentId = payment._id;
    await membership.save();

    res.status(201).json({ success: true, membership, payment });
  } catch (err) {
    console.error("purchaseMembership error:", err);
    res.status(500).json({ success: false, message: "خطا در ثبت خرید عضویت." });
  }
};

exports.approvePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ success: false, message: "پرداخت یافت نشد." });

    payment.status = "Paid";
    payment.approvedAt = new Date();
    payment.approvedBy = req.user?._id;
    await payment.save();

    const membership = await Membership.findById(payment.membershipId);
    if (membership) {
      membership.paymentStatus = "Paid";
      membership.activatedAt = new Date();
      membership.refreshStatus();
      await membership.save();
    }

    res.json({ success: true, payment, membership });
  } catch (err) {
    console.error("approvePayment error:", err);
    res.status(500).json({ success: false, message: "خطا در تایید پرداخت." });
  }
};

exports.listMemberships = async (req, res) => {
  try {
    await exports.refreshMembershipStatuses();
    const { status, userId, nearExpiry } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (nearExpiry === "true") {
      filter.status = "active";
      filter.remainingDays = { $lte: 7 };
    }
    const memberships = await Membership.find(filter)
      .populate("userId", "name employeeCode profileImage")
      .populate("paymentId")
      .sort({ createdAt: -1 });
    res.json({ success: true, memberships });
  } catch (err) {
    console.error("listMemberships error:", err);
    res.status(500).json({ success: false, message: "خطا در دریافت عضویت‌ها." });
  }
};

exports.getActiveMembership = async (req, res) => {
  try {
    await exports.refreshMembershipStatuses();
    const membership = await Membership.findOne({
      userId: req.params.userId,
      status: "active",
      paymentStatus: "Paid",
    })
      .populate("paymentId")
      .sort({ membershipEndDate: -1 });
    res.json({ success: true, membership });
  } catch (err) {
    console.error("getActiveMembership error:", err);
    res.status(500).json({ success: false, message: "خطا در دریافت عضویت فعال." });
  }
};

exports.recordAttendance = async (req, res) => {
  try {
    await exports.refreshMembershipStatuses();
    const { userId, notes, source = "manual" } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "شناسه عضو الزامی است." });

    const membership = await Membership.findOne({ userId, status: "active", paymentStatus: "Paid" }).sort({ membershipEndDate: -1 });
    if (!membership) return res.status(403).json({ success: false, message: "عضویت فعال یافت نشد." });
    if (membership.remainingSessions <= 0) return res.status(403).json({ success: false, message: "جلسات عضویت تمام شده است." });

    const attendance = await Attendance.create({
      userId,
      membershipId: membership._id,
      notes,
      source,
      createdBy: req.user?._id,
    });

    membership.remainingSessions = Math.max(0, membership.remainingSessions - 1);
    membership.completedSessions += 1;
    membership.refreshStatus();
    await membership.save();

    res.status(201).json({ success: true, attendance, membership });
  } catch (err) {
    console.error("recordAttendance error:", err);
    res.status(500).json({ success: false, message: "خطا در ثبت حضور." });
  }
};

exports.financeSummary = async (req, res) => {
  try {
    await exports.refreshMembershipStatuses();
    const [payments, memberships, revenueAgg] = await Promise.all([
      Payment.find().populate("userId", "name employeeCode").populate("membershipId").sort({ createdAt: -1 }).limit(100),
      Membership.find().populate("userId", "name employeeCode").sort({ createdAt: -1 }).limit(100),
      Payment.aggregate([{ $match: { status: "Paid" } }, { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]),
    ]);

    res.json({
      success: true,
      payments,
      memberships,
      revenue: revenueAgg[0] || { total: 0, count: 0 },
      counts: {
        pendingPayments: payments.filter((payment) => payment.status === "Pending Payment").length,
        activeMemberships: memberships.filter((membership) => membership.status === "active").length,
        expiredMemberships: memberships.filter((membership) => membership.status === "expired").length,
        nearExpiryMemberships: memberships.filter((membership) => membership.status === "active" && membership.remainingDays <= 7).length,
      },
    });
  } catch (err) {
    console.error("financeSummary error:", err);
    res.status(500).json({ success: false, message: "خطا در دریافت داشبورد مالی." });
  }
};
