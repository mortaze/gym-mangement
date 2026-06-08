// backend/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  protect,
  authorize,
  getJwtSecret,
  getUserRole,
} = require("../middleware/authMiddleware");

const publicUserFields = (user) => ({
  _id: user._id,
  name: user.name,
  username: user.username,
  employeeCode: user.employeeCode,
  role: getUserRole(user),
  email: user.email,
  profileImage: user.profileImage,
  status: user.status,
  age: user.age,
  height: user.height,
  weight: user.weight,
  bmi: user.bmi,
  bmiCategory: user.bmiCategory,
});

// --------------------
// POST /api/auth/login
// --------------------
router.post("/login", async (req, res) => {
  try {
    const { employeeCode, email, username, password } = req.body;
    const identifier = employeeCode || email || username;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "employeeCode, email, or username and password are required",
      });
    }

    const user = await User.findOne({
      $or: [
        { employeeCode: identifier },
        { email: String(identifier).toLowerCase() },
        { username: String(identifier).toLowerCase() },
      ],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "کاربر یافت نشد" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "رمز عبور اشتباه است" });
    }

    const token = jwt.sign(
      { id: user._id, _id: user._id, role: getUserRole(user) },
      getJwtSecret(),
      { expiresIn: "7d" },
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        token,
        user: publicUserFields(user),
      });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// --------------------
// POST /api/auth/register
// --------------------
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      employeeCode,
      username,
      email,
      password,
      role = "user",
      contactNumber,
      address,
      birthday,
    } = req.body;

    if (!name || !employeeCode || !password) {
      return res.status(400).json({
        success: false,
        message: "name, employeeCode, and password are required",
      });
    }

    const duplicateConditions = [{ employeeCode }];
    if (email) duplicateConditions.push({ email: String(email).toLowerCase() });
    if (username)
      duplicateConditions.push({ username: String(username).toLowerCase() });

    const existingUser = await User.findOne({ $or: duplicateConditions });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this employeeCode, email, or username",
      });
    }

    const user = await User.create({
      name,
      employeeCode,
      username,
      email,
      password,
      role,
      contactNumber,
      address,
      birthday,
      status: "active",
    });

    const token = jwt.sign(
      { id: user._id, _id: user._id, role: getUserRole(user) },
      getJwtSecret(),
      { expiresIn: "7d" },
    );

    res.status(201).json({
      success: true,
      token,
      user: publicUserFields(user),
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// --------------------
// GET /api/auth/me
// --------------------
router.get("/me", protect, async (req, res) => {
  res.json({
    success: true,
    user: publicUserFields(req.user),
  });
});

router.get("/admin-only", authorize("Admin", "admin"), (req, res) => {
  res.json({ success: true, message: "Welcome Admin!" });
});

module.exports = router;
