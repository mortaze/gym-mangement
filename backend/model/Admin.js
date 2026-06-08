// backend/model/Admin.js
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Staff", "Manager", "CafeManager", "Trainer", "Reception", "Finance", "admin", "user"],
      default: "Admin",
    },
    image: String,
    joiningDate: String,
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
    confirmationToken: String,
    confirmationTokenExpires: Date,
  },
  { timestamps: true },
);

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
