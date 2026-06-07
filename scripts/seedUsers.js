// scripts/seedUsers.js
require("dotenv").config({ path: require("path").join(__dirname, "..", "backend", ".env") });
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../backend/model/User");

const DEFAULT_LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/gym-management";
const mongoUri = process.env.MONGO_URI || DEFAULT_LOCAL_MONGO_URI;

const defaultUsers = [
  {
    name: "Default Admin",
    username: "admin",
    employeeCode: "ADMIN001",
    email: "admin@example.com",
    password: process.env.SEED_ADMIN_PASSWORD || "Admin@123456",
    role: "admin",
    contactNumber: "",
    address: "",
    status: "active",
  },
  {
    name: "Default User",
    username: "user",
    employeeCode: "USER001",
    email: "user@example.com",
    password: process.env.SEED_USER_PASSWORD || "User@123456",
    role: "user",
    contactNumber: "",
    address: "",
    status: "active",
  },
];

const seedUsers = async () => {
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: Number(process.env.MONGO_TIMEOUT_MS) || 10000,
  });

  console.log(`MongoDB connected: ${mongoUri}`);

  for (const userData of defaultUsers) {
    const existingUser = await User.findOne({
      $or: [
        { email: userData.email },
        { username: userData.username },
        { employeeCode: userData.employeeCode },
      ],
    });

    if (existingUser) {
      console.log(`Skipped existing user: ${userData.email}`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    await User.create({
      ...userData,
      password: hashedPassword,
    });

    console.log(`Created ${userData.role} user: ${userData.email}`);
  }
};

seedUsers()
  .then(async () => {
    await mongoose.disconnect();
    console.log("User seeding completed");
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("User seeding failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  });
