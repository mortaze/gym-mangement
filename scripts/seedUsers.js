// scripts/seedUsers.js
require("dotenv").config({ path: require("path").join(__dirname, "..", "backend", ".env") });
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const User = require("../backend/model/User");
const Membership = require("../backend/model/Membership");
const Payment = require("../backend/model/Payment");
const { addMonths } = require("../backend/utils/membership");

const DEFAULT_LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/gym-management";
const mongoUri = process.env.MONGO_URI || DEFAULT_LOCAL_MONGO_URI;
const demoPassword = process.env.SEED_DEMO_PASSWORD || "Admin@123456";

const defaultUsers = [
  { name: "مدیر سیستم", username: "admin", employeeCode: "ADMIN001", email: "admin@example.com", password: demoPassword, role: "admin", status: "active" },
  { name: "ورزشکار آزمایشی", username: "member.demo", employeeCode: "9300000000", email: "member@example.com", password: demoPassword, role: "Member", age: 24, height: 178, weight: 76, contactNumber: "09300000000", status: "active" },
  { name: "مربی آزمایشی", username: "trainer.demo", employeeCode: "9300000001", email: "trainer@example.com", password: demoPassword, role: "Trainer", contactNumber: "09300000001", status: "active" },
  { name: "پذیرش آزمایشی", username: "reception.demo", employeeCode: "9300000002", email: "reception@example.com", password: demoPassword, role: "Reception", contactNumber: "09300000002", status: "active" },
  { name: "مدیر کافه آزمایشی", username: "cafe.demo", employeeCode: "9300000400", email: "cafe@example.com", password: demoPassword, role: "CafeManager", contactNumber: "09300000400", status: "active" },
];

const seedUsers = async () => {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: Number(process.env.MONGO_TIMEOUT_MS) || 10000 });
  console.log(`MongoDB connected: ${mongoUri}`);

  for (const userData of defaultUsers) {
    const existingUser = await User.findOne({ $or: [{ email: userData.email }, { username: userData.username }, { employeeCode: userData.employeeCode }] });
    if (existingUser) {
      Object.assign(existingUser, { ...userData, password: existingUser.password });
      await existingUser.save();
      console.log(`Updated existing demo user: ${userData.employeeCode}`);
      continue;
    }
    await User.create(userData);
    console.log(`Created ${userData.role} user: ${userData.employeeCode}`);
  }

  const member = await User.findOne({ employeeCode: "9300000000" });
  if (member) {
    const activeMembership = await Membership.findOne({ userId: member._id, status: "Active" });
    if (!activeMembership) {
      const start = new Date();
      const membership = await Membership.create({
        userId: member._id,
        planName: "طرح یک‌ماهه ۱۵ جلسه‌ای",
        durationMonths: 1,
        membershipStartDate: start,
        membershipEndDate: addMonths(start, 1),
        totalSessions: 15,
        remainingSessions: 12,
        completedSessions: 3,
        price: 1100000,
        status: "Active",
      });
      const payment = await Payment.create({ userId: member._id, membershipId: membership._id, amount: 1100000, status: "Paid", method: "mock", approvedAt: new Date() });
      membership.paymentId = payment._id;
      await membership.save();
      console.log("Created active demo membership for member account");
    }
  }
};

seedUsers()
  .then(async () => { await mongoose.disconnect(); console.log("User seeding completed"); process.exit(0); })
  .catch(async (error) => { console.error("User seeding failed:", error); await mongoose.disconnect(); process.exit(1); });
