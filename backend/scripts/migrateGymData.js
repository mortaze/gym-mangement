// Safe one-time data normalization for the gym membership/BMI expansion.
// Usage: node backend/scripts.migrateGymData.js
require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../model/User");
const Membership = require("../model/Membership");
const Payment = require("../model/Payment");
const Attendance = require("../model/Attendance");
const TrainingRequest = require("../model/TrainingRequest");
const TrainingProgram = require("../model/TrainingProgram");
const NutritionProgram = require("../model/NutritionProgram");
const { calculateBmi, getBmiCategory } = require("../utils/gymCalculations");

(async () => {
  await connectDB();

  const users = await User.find({ height: { $exists: true }, weight: { $exists: true } });
  for (const user of users) {
    const bmi = calculateBmi(user.height, user.weight);
    if (bmi && (user.bmi !== bmi || user.bmiCategory !== getBmiCategory(bmi))) {
      user.bmi = bmi;
      user.bmiCategory = getBmiCategory(bmi);
      await user.save();
    }
  }

  await Promise.all([
    User.syncIndexes(),
    Membership.syncIndexes(),
    Payment.syncIndexes(),
    Attendance.syncIndexes(),
    TrainingRequest.syncIndexes(),
    TrainingProgram.syncIndexes(),
    NutritionProgram.syncIndexes(),
  ]);

  console.log(`Migration complete. BMI normalized for ${users.length} users with body data.`);
  process.exit(0);
})().catch((err) => {
  console.error("Migration failed", err);
  process.exit(1);
});
