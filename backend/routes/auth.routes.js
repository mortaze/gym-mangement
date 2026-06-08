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


const ROLE_ALIASES = {
  admin: "admin",
  manager: "admin",
  trainer: "trainer",
  coach: "trainer",
  member: "member",
  user: "member",
  reception: "reception",
  cafe: "cafeManager",
  cafemanager: "cafeManager",
  finance: "finance",
};

const ROLE_LABELS = {
  admin: "مدیر",
  trainer: "مربی",
  member: "ورزشکار",
  reception: "پذیرش",
  cafeManager: "مدیر کافه",
};

const canonicalRole = (role) => ROLE_ALIASES[String(role || "").trim().toLowerCase()] || String(role || "").trim();

const selectLoginIdentifier = (user) => user.employeeCode || user.username || user.email;

const ROLE_REDIRECTS = {
  admin: "/admin-dashboard",
  Admin: "/admin-dashboard",
  trainer: "/trainers-dashboard",
  Trainer: "/trainers-dashboard",
  member: "/member-dashboard",
  Member: "/member-dashboard",
  user: "/member-dashboard",
  reception: "/reception-dashboard",
  Reception: "/reception-dashboard",
  cafe: "/cafe-dashboard",
  cafemanager: "/cafe-dashboard",
  cafeManager: "/cafe-dashboard",
  CafeManager: "/cafe-dashboard",
  finance: "/manager-dashboard/finance",
  Finance: "/manager-dashboard/finance",
};

const publicUserFields = (user) => ({
  _id: user._id,
  name: user.name,
  username: user.username,
  employeeCode: user.employeeCode,
  role: canonicalRole(getUserRole(user)),
  email: user.email,
  profileImage: user.profileImage,
  status: user.status,
  height: user.height,
  weight: user.weight,
  bmi: user.bmi,
});

// --------------------
// POST /api/auth/login
// --------------------
router.post("/login", async (req, res) => {
  try {
    const { employeeCode, email, username, loginIdentifier, identifier: rawIdentifier, password } = req.body;
    const identifier = loginIdentifier || rawIdentifier || employeeCode || email || username;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "شناسه ورود و رمز عبور الزامی است",
      });
    }

    const normalizedIdentifier = String(identifier).trim();
    const lowerIdentifier = normalizedIdentifier.toLowerCase();

    const user = await User.findOne({
      $or: [
        { employeeCode: normalizedIdentifier },
        { email: lowerIdentifier },
        { username: lowerIdentifier },
      ],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "کاربر یافت نشد" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (user.status && user.status !== "active") {
      return res.status(403).json({ success: false, message: "حساب کاربری فعال نیست" });
    }

    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "رمز عبور اشتباه است" });
    }

    const token = jwt.sign(
      { id: user._id, _id: user._id, role: canonicalRole(getUserRole(user)) },
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
        redirectTo: ROLE_REDIRECTS[canonicalRole(getUserRole(user))] || ROLE_REDIRECTS[String(getUserRole(user)).toLowerCase()],
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
      { id: user._id, _id: user._id, role: canonicalRole(getUserRole(user)) },
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
// GET /api/auth/login-guides
// --------------------
router.get("/login-guides", async (req, res) => {
  try {
    const users = await User.find({
      status: "active",
      role: { $in: ["Admin", "admin", "Member", "member", "user", "Trainer", "trainer", "Reception", "reception", "CafeManager", "cafe", "cafeManager"] },
    })
      .select("employeeCode username email role createdAt")
      .sort({ createdAt: 1 })
      .lean();

    const wantedOrder = ["admin", "trainer", "member", "reception", "cafeManager"];
    const guideByRole = new Map();

    users.forEach((user) => {
      const role = canonicalRole(user.role);
      const identifier = selectLoginIdentifier(user);
      if (!wantedOrder.includes(role) || !identifier || guideByRole.has(role)) return;
      guideByRole.set(role, {
        role,
        label: ROLE_LABELS[role],
        identifier,
      });
    });

    res.json({
      success: true,
      guides: wantedOrder.map((role) => guideByRole.get(role)).filter(Boolean),
    });
  } catch (error) {
    console.error("❌ Login guides error:", error);
    res.status(500).json({ success: false, message: "خطا در دریافت راهنمای ورود" });
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
