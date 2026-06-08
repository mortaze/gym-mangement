const Membership = require("../model/Membership");

const addMonths = (date, months) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + Number(months || 1));
  return next;
};

const expireMemberships = async () => {
  const now = new Date();
  return Membership.updateMany(
    {
      status: "Active",
      $or: [{ membershipEndDate: { $lt: now } }, { remainingSessions: { $lte: 0 } }],
    },
    { $set: { status: "Expired" } },
  );
};

const getMembershipSummary = async (userId) => {
  await expireMemberships();
  const activeMembership = await Membership.findOne({ userId, status: "Active" }).sort({ membershipEndDate: 1 });
  const [activeCount, expiredCount, nearExpiryCount] = await Promise.all([
    Membership.countDocuments({ status: "Active" }),
    Membership.countDocuments({ status: "Expired" }),
    Membership.countDocuments({
      status: "Active",
      membershipEndDate: { $lte: new Date(Date.now() + 7 * 86400000) },
    }),
  ]);
  return { activeMembership, activeCount, expiredCount, nearExpiryCount };
};

module.exports = { addMonths, expireMemberships, getMembershipSummary };
