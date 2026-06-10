// backend/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware"); // middleware JWT
const { authorize } = require("../middleware/authMiddleware");

console.log("🔹 auth.routes.js loaded");

// --------------------
// POST /api/auth/login
// --------------------
router.post("/login", async (req, res) => {
  console.log("➡️ /api/auth/login endpoint hit");
  console.log("📥 Request body:", req.body);

  try {
    const { employeeCode, password } = req.body;

    // 1️⃣ چک کاربر
    const user = await User.findOne({ employeeCode }).populate("role");
    console.log("🔹 Searching for user with employeeCode:", employeeCode);

    if (!user) {
      console.log("⚠️ User not found");
      return res
        .status(404)
        .json({ success: false, message: "کاربر یافت نشد" });
    }
    console.log("✅ User found:", user);

    // 2️⃣ چک رمز
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("⚠️ Password mismatch");
      return res
        .status(400)
        .json({ success: false, message: "رمز عبور اشتباه است" });
    }

    // 3️⃣ تولید JWT و ست کردن در HttpOnly Cookie
    const token = jwt.sign(
      { id: user._id, role: user.role.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 روز
      })
      .json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          employeeCode: user.employeeCode,
          role: user.role.name,
          email: user.email,
          profileImage: user.profileImage,
        },
      });

    console.log("✅ Login successful, JWT cookie set");
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --------------------
// GET /api/auth/me
// --------------------
router.get("/me", protect, async (req, res) => {
  console.log("➡️ /api/auth/me endpoint hit");

  if (!req.user) {
    console.log("⚠️ No user in request (not logged in)");
    return res
      .status(401)
      .json({ success: false, message: "هیچ کاربری لاگین نکرده است" });
  }

  const user = await User.findById(req.user.id).populate("role");

  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      employeeCode: user.employeeCode,
      role: user.role.name,
      email: user.email,
      profileImage: user.profileImage,
    },
  });

  console.log("✅ Current user returned:", user);
});
router.get("/admin-only", authorize("Admin"), (req, res) => {
  res.json({ success: true, message: "Welcome Admin!" });
});
module.exports = router;
