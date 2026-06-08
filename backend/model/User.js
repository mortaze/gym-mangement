// backend/model/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    // نام کامل کاربر
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
      minLength: [3, "Name must be at least 3 characters."],
      maxLength: [100, "Name is too large"],
    },

    // نام کاربری اختیاری برای ورود
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      minLength: [3, "Username must be at least 3 characters."],
      maxLength: [50, "Username is too long"],
    },

    // کد عضویت یا کد ملی
    employeeCode: {
      type: String,
      required: [true, "Employee code is required"],
      unique: true,
      trim: true,
      minLength: [3, "Employee code must be at least 3 characters."],
      maxLength: [50, "Employee code is too long"],
    },

    // رمز عبور هش‌شده
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: 6,
    },

    // نقش کاربر
    role: {
      type: String,
      enum: ["Member", "Trainer", "Reception", "Admin", "CafeManager", "Finance", "admin", "user", "member", "trainer", "reception", "cafe", "finance"],
      required: [true, "Role is required"],
      default: "Member",
    },

    // ایمیل (اختیاری)
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
    },


    age: {
      type: Number,
      min: 1,
      max: 120,
    },

    height: {
      type: Number,
      min: 0,
    },

    weight: {
      type: Number,
      min: 0,
    },

    bmi: {
      type: Number,
      min: 0,
    },

    // شماره تماس
    contactNumber: {
      type: String,
      trim: true,
    },

    // آدرس
    address: {
      type: String,
      trim: true,
    },

    // تصویر پروفایل
    profileImage: {
      type: String,
    },

    // وضعیت حساب
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },

    // تاریخ تولد شمسی (به صورت رشته YYYY/MM/DD)
    birthday: {
      type: String,
      match: [/^\d{4}\/\d{2}\/\d{2}$/, "Birthday must be in YYYY/MM/DD format"],
    },

    // تاریخ آخرین تغییر رمز عبور
    passwordChangedAt: Date,

    // توکن و تاریخ انقضای ریست رمز عبور
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);


userSchema.pre("validate", function (next) {
  const height = Number(this.height);
  const weight = Number(this.weight);
  if (height > 0 && weight > 0) {
    const heightInMeters = height > 3 ? height / 100 : height;
    this.bmi = Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
  }
  next();
});

// هش کردن پسورد قبل از ذخیره
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  // Avoid double-hashing when legacy routes/services already supplied a bcrypt hash.
  if (typeof this.password === "string" && this.password.startsWith("$2")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// بررسی پسورد
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// تولید توکن ریست رمز عبور
userSchema.methods.generatePasswordResetToken = function () {
  const crypto = require("crypto");
  const token = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = token;
  const date = new Date();
  date.setHours(date.getHours() + 1);
  this.passwordResetExpires = date;
  return token;
};

// چک کردن نقش
userSchema.methods.hasRole = function (...roles) {
  return roles.includes(this.role);
};

userSchema.index({ role: 1, status: 1 });
userSchema.index({ employeeCode: 1 });

const User = mongoose.model("User", userSchema);
module.exports = User;
