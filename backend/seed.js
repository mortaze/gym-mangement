// backend/seed.js
require("dotenv").config(); // بارگذاری مقادیر از .env
const mongoose = require("mongoose");
const User = require("./model/User");
const Role = require("./model/Role");

const seedData = async () => {
  try {
    // اتصال به MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");

    // بررسی اینکه نقش Admin وجود دارد یا نه
    let adminRole = await Role.findOne({ name: "Admin" });
    if (!adminRole) {
      adminRole = await Role.create({
        name: "Admin",
        description: "مدیر سیستم با دسترسی کامل",
        permissions: ["all"],
      });
      console.log("Admin role created");
    }

    // بررسی اینکه کاربر از قبل وجود ندارد
    const existingUser = await User.findOne({ employeeCode: "0110486986" });
    if (existingUser) {
      console.log("User already exists");
      process.exit();
    }

    // ساخت کاربر
    const user = await User.create({
      name: "امیرحسین محسنی فر",
      email: "mohsenifar1383@gmail.com", // ایمیل اضافه شد
      employeeCode: "0110486986",
      password: "123456789", // هش توسط pre("save") انجام می‌شود
      role: adminRole._id,
      contactNumber: "09301306552",
      address: "تهران قرچک خیابان رجایی کوچه رجایی ۱۵ پلاک ۱۹ واحد ۱",
      profileImage: "",
      status: "active",
    });

    // اضافه کردن کاربر به آرایه users نقش
    adminRole.users.push(user._id);
    await adminRole.save();

    console.log("User created successfully");
    process.exit();
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
};

seedData();
