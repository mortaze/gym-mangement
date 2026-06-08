const MS_PER_DAY = 24 * 60 * 60 * 1000;

const toDate = (value) => (value ? new Date(value) : null);

const calculateRemainingDays = (endDate, now = new Date()) => {
  const end = toDate(endDate);
  if (!end || Number.isNaN(end.getTime())) return 0;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.max(0, Math.ceil((endDay - today) / MS_PER_DAY));
};

const calculateBmi = (height, weight) => {
  const numericHeight = Number(height);
  const numericWeight = Number(weight);
  if (!numericHeight || !numericWeight || numericHeight <= 0 || numericWeight <= 0) return undefined;
  const heightMeters = numericHeight > 3 ? numericHeight / 100 : numericHeight;
  return Number((numericWeight / (heightMeters * heightMeters)).toFixed(1));
};

const getBmiCategory = (bmi) => {
  const value = Number(bmi);
  if (!value) return "Unknown";
  if (value < 18.5) return "Underweight";
  if (value < 25) return "Normal";
  if (value < 30) return "Overweight";
  return "Obese";
};

module.exports = { calculateRemainingDays, calculateBmi, getBmiCategory };
