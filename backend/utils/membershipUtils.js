const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfToday = (date = new Date()) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const calculateRemainingDays = (endDate, now = new Date()) => {
  if (!endDate) return 0;
  const today = startOfToday(now);
  const end = startOfToday(endDate);
  return Math.max(0, Math.ceil((end.getTime() - today.getTime()) / MS_PER_DAY));
};

const calculateBmi = (height, weight) => {
  const numericHeight = Number(height);
  const numericWeight = Number(weight);
  if (!numericHeight || !numericWeight || numericHeight <= 0 || numericWeight <= 0) {
    return undefined;
  }
  const meters = numericHeight > 3 ? numericHeight / 100 : numericHeight;
  return Math.round((numericWeight / (meters * meters)) * 10) / 10;
};

const getBmiCategory = (bmi) => {
  const value = Number(bmi);
  if (!value) return "نامشخص";
  if (value < 18.5) return "Underweight";
  if (value < 25) return "Normal";
  if (value < 30) return "Overweight";
  return "Obese";
};

const getMembershipStatus = (membership, now = new Date()) => {
  if (!membership) return "expired";
  if (membership.status === "cancelled") return "cancelled";
  if (membership.paymentStatus && membership.paymentStatus !== "Paid") return "pending_payment";
  if (membership.remainingSessions <= 0) return "expired";
  if (membership.membershipEndDate && startOfToday(membership.membershipEndDate) < startOfToday(now)) {
    return "expired";
  }
  return "active";
};

module.exports = {
  startOfToday,
  calculateRemainingDays,
  calculateBmi,
  getBmiCategory,
  getMembershipStatus,
};
