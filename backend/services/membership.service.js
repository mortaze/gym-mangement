const Membership = require("../model/Membership");
const Attendance = require("../model/Attendance");
const Payment = require("../model/Payment");
const { calculateRemainingDays } = require("../utils/gymCalculations");

const addMonths = (date, months) => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + Number(months || 1));
  return result;
};

const refreshMembershipStatuses = async () => {
  const active = await Membership.find({ status: "Active" });
  for (const membership of active) {
    membership.remainingDays = calculateRemainingDays(membership.membershipEndDate);
    if (membership.remainingDays <= 0 || membership.remainingSessions <= 0) {
      membership.status = "Expired";
      membership.expiredAt = membership.expiredAt || new Date();
    }
    await membership.save();
  }
};

const purchaseMembership = async ({ userId, planName, durationMonths, totalSessions, price = 0, notes }) => {
  const membership = await Membership.create({
    userId,
    planName,
    durationMonths,
    totalSessions,
    remainingSessions: totalSessions,
    completedSessions: 0,
    price,
    notes,
    status: "Pending Payment",
  });
  const payment = await Payment.create({
    userId,
    membershipId: membership._id,
    amount: price,
    method: "mock",
    status: "Pending Payment",
    description: `Membership purchase: ${planName}`,
  });
  membership.paymentId = payment._id;
  await membership.save();
  return { membership, payment };
};

const approvePayment = async (paymentId, approvedBy) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new Error("Payment not found");
  payment.status = "Paid";
  payment.approvedBy = approvedBy;
  payment.approvedAt = new Date();
  await payment.save();

  const membership = await Membership.findById(payment.membershipId);
  if (membership) {
    const start = new Date();
    membership.status = "Active";
    membership.membershipStartDate = start;
    membership.membershipEndDate = addMonths(start, membership.durationMonths);
    membership.remainingSessions = membership.totalSessions;
    membership.completedSessions = 0;
    membership.remainingDays = calculateRemainingDays(membership.membershipEndDate);
    membership.activatedAt = start;
    await membership.save();
  }
  return { payment, membership };
};

const recordAttendance = async ({ userId, checkedInBy, note }) => {
  await refreshMembershipStatuses();
  const membership = await Membership.findOne({ userId, status: "Active" }).sort({ membershipEndDate: 1 });
  if (!membership) throw new Error("No active membership found");
  if (membership.remainingSessions <= 0) throw new Error("No remaining sessions");
  if (calculateRemainingDays(membership.membershipEndDate) <= 0) throw new Error("Membership is expired");

  membership.remainingSessions -= 1;
  membership.completedSessions += 1;
  membership.remainingDays = calculateRemainingDays(membership.membershipEndDate);
  if (membership.remainingSessions <= 0) {
    membership.status = "Expired";
    membership.expiredAt = new Date();
  }
  await membership.save();

  const attendance = await Attendance.create({ userId, membershipId: membership._id, checkedInBy, note });
  return { attendance, membership };
};

const getSummary = async (userId) => {
  await refreshMembershipStatuses();
  const activeMembership = await Membership.findOne({ userId, status: "Active" }).sort({ membershipEndDate: 1 });
  const memberships = await Membership.find({ userId }).sort({ createdAt: -1 });
  const attendance = await Attendance.find({ userId }).sort({ checkInAt: -1 }).limit(20);
  return { activeMembership, memberships, attendance };
};

module.exports = { refreshMembershipStatuses, purchaseMembership, approvePayment, recordAttendance, getSummary };
