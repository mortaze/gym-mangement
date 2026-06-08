/*
 Safe additive migration for the membership/session/BMI redesign.
 - Does not delete or overwrite business data.
 - Backfills BMI only when height and weight already exist.
 - Adds compatibility counters for existing paid/active memberships that may be missing new session fields.
 Usage: node backend/migrations/20260608-membership-session-bmi.js
*/
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../model/User");
const Membership = require("../model/Membership");
const { calculateBmi, getBmiCategory } = require("../utils/membershipUtils");

(async () => {
  await connectDB();

  const users = await User.find({ height: { $exists: true }, weight: { $exists: true } });
  for (const user of users) {
    const bmi = calculateBmi(user.height, user.weight);
    if (bmi !== undefined) {
      user.bmi = bmi;
      user.bmiCategory = getBmiCategory(bmi);
      await user.save();
    }
  }

  const memberships = await Membership.find({});
  for (const membership of memberships) {
    if (membership.totalSessions === undefined) membership.totalSessions = 0;
    if (membership.remainingSessions === undefined) membership.remainingSessions = membership.totalSessions;
    if (membership.completedSessions === undefined) membership.completedSessions = Math.max(0, membership.totalSessions - membership.remainingSessions);
    membership.refreshStatus();
    await membership.save();
  }

  await mongoose.connection.close();
  console.log(`Migration complete: ${users.length} users checked, ${memberships.length} memberships checked.`);
})().catch(async (err) => {
  console.error(err);
  await mongoose.connection.close();
  process.exit(1);
});
