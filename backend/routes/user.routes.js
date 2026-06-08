// backend/routes/user.routes.js
const express = require("express");
const router = express.Router();
const User = require("../model/User");
const createUploader = require("../middleware/uploader");
const bcrypt = require("bcryptjs");
const Attendance = require("../model/Attendance");
const TrainingRequest = require("../model/TrainingRequest");
const TrainingProgram = require("../model/TrainingProgram");
const Payment = require("../model/Payment");
const Membership = require("../model/Membership");

// Middleware ساده (بعداً JWT و نقش‌ها اضافه می‌کنیم)
const authMiddleware = (req, res, next) => next();
const roleMiddleware = (roles) => (req, res, next) => next();

// ساخت uploader مخصوص کاربران
const userUpload = createUploader("users");

// =======================
// ✅ CREATE: ایجاد کاربر با آپلود تصویر و تعیین رول مستقیم
// =======================
router.post("/", userUpload.single("profileImage"), async (req, res) => {
  try {
    const {
      name,
      employeeCode,
      username,
      password,
      email,
      role,
      age,
      height,
      weight,
      contactNumber,
      address,
      status = "active",
      birthday,
    } = req.body;

    // بررسی یکتا بودن کد کارمند
    const exist = await User.findOne({ employeeCode });
    if (exist)
      return res.status(400).json({ message: "Employee code already exists" });

    // بررسی یکتا بودن نام کاربری در صورت وجود
    if (username) {
      const usernameExist = await User.findOne({ username: username.toLowerCase() });
      if (usernameExist)
        return res.status(400).json({ message: "Username already exists" });
    }

    // بررسی یکتا بودن ایمیل در صورت وجود
    if (email) {
      const emailExist = await User.findOne({ email });
      if (emailExist)
        return res.status(400).json({ message: "Email already exists" });
    }

    // هش کردن پسورد
    let hashedPassword = password;
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const newUser = new User({
      name,
      employeeCode,
      username,
      password: hashedPassword,
      email,
      role: role || "Member",
      age,
      height,
      weight,
      contactNumber,
      address,
      status,
      birthday,
      profileImage: req.file ? `/images/users/${req.file.filename}` : undefined,
    });

    await newUser.save();
    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error("❌ Error creating user:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

// =======================
// ✅ UPDATE: آپدیت کاربر با امکان آپلود تصویر و تغییر رول
// =======================
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  userUpload.single("profileImage"),
  async (req, res) => {
    try {
      const { role, password, birthday, ...rest } = req.body;

      // هش کردن پسورد در صورت وجود
      if (password && password.trim() !== "") {
        const salt = await bcrypt.genSalt(10);
        rest.password = await bcrypt.hash(password, salt);
      }

      if (role) rest.role = role;
      if (birthday) rest.birthday = birthday;
      if (req.file) rest.profileImage = `/images/users/${req.file.filename}`;

      const updatedUser = await User.findByIdAndUpdate(req.params.id, rest, {
        new: true,
        runValidators: true,
      });
      if (!updatedUser)
        return res.status(404).json({ message: "User not found" });

      res.json({ success: true, user: updatedUser });
    } catch (err) {
      console.error("❌ Error updating user:", err.message);
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

// =======================
// ✅ READ: دریافت کاربر با employeeCode
// =======================
router.get("/employee/:code", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ employeeCode: req.params.code });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error("❌ Error fetching user by code:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

// =======================
// ✅ READ: فعالیت‌های اخیر واقعی کاربر
// =======================
router.get("/:id/activities", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [attendances, requests, programs, payments, memberships, user] = await Promise.all([
      Attendance.find({ userId: id }).sort({ checkedInAt: -1 }).limit(5).lean(),
      TrainingRequest.find({ userId: id }).sort({ createdAt: -1 }).limit(5).lean(),
      TrainingProgram.find({ userId: id }).populate("trainerId", "name").sort({ createdAt: -1 }).limit(5).lean(),
      Payment.find({ userId: id }).sort({ createdAt: -1 }).limit(5).lean(),
      Membership.find({ userId: id }).sort({ createdAt: -1 }).limit(5).lean(),
      User.findById(id).select("updatedAt createdAt").lean(),
    ]);

    const activities = [];
    attendances.forEach((item) => activities.push({
      type: "attendance",
      title: "ثبت حضور",
      description: item.notes || "حضور شما در باشگاه ثبت شد",
      amount: "یک جلسه مصرف شد",
      date: item.checkedInAt || item.createdAt,
    }));
    requests.forEach((item) => activities.push({
      type: "training_request",
      title: "درخواست برنامه تمرینی",
      description: item.goals?.length ? `اهداف: ${item.goals.join("، ")}` : "درخواست شما برای مربی ثبت شد",
      amount: item.status,
      date: item.createdAt,
    }));
    programs.forEach((item) => activities.push({
      type: "program",
      title: "صدور برنامه توسط مربی",
      description: `${item.title}${item.trainerId?.name ? ` | مربی: ${item.trainerId.name}` : ""}`,
      amount: `${item.exercises?.length || 0} حرکت`,
      date: item.createdAt,
    }));
    payments.forEach((item) => activities.push({
      type: "payment",
      title: "ثبت پرداخت",
      description: item.notes || `روش پرداخت: ${item.method || "نامشخص"}`,
      amount: item.amount,
      date: item.approvedAt || item.createdAt,
    }));
    memberships.forEach((item) => activities.push({
      type: "membership",
      title: item.status === "Active" ? "تمدید اشتراک" : "ثبت اشتراک",
      description: item.planName,
      amount: `${item.remainingSessions}/${item.totalSessions} جلسه باقی‌مانده`,
      date: item.membershipStartDate || item.createdAt,
    }));
    if (user?.updatedAt) activities.push({
      type: "profile",
      title: "تغییر مشخصات",
      description: "اطلاعات پروفایل شما به‌روزرسانی شد",
      amount: "پروفایل",
      date: user.updatedAt,
    });

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, activities: activities.slice(0, 12) });
  } catch (err) {
    console.error("❌ Error fetching user activities:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

// =======================
// ✅ READ: دریافت کاربر با ID
// =======================
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    console.error("❌ Error fetching user:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

// =======================
// ✅ DELETE: حذف کاربر
// =======================
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (!deletedUser)
        return res.status(404).json({ message: "User not found" });
      res.json({ success: true, message: "User deleted" });
    } catch (err) {
      console.error("❌ Error deleting user:", err.message);
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

// =======================
// ✅ VERIFY PASSWORD
// =======================
router.post("/:id/verify-password", authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    res.json({ success: true, valid: isMatch });
  } catch (err) {
    console.error("❌ Error verifying password:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

// =======================
// ✅ GENERATE RESET TOKEN
// =======================
router.post("/:id/reset-token", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const token = user.generatePasswordResetToken();
    await user.save();

    res.json({ success: true, token });
  } catch (err) {
    console.error("❌ Error generating reset token:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

// =======================
// ✅ RESET PASSWORD
// =======================
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });
    if (!user)
      return res.status(400).json({ message: "Invalid or expired token" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("❌ Error resetting password:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

// =======================
// ✅ PATCH STATUS
// =======================
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(["Admin"]),
  async (req, res) => {
    try {
      const { status } = req.body;
      if (!["active", "inactive", "blocked"].includes(status))
        return res.status(400).json({ message: "Invalid status" });

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );
      if (!updatedUser)
        return res.status(404).json({ message: "User not found" });

      res.json({ success: true, user: updatedUser });
    } catch (err) {
      console.error("❌ Error updating status:", err.message);
      res.status(400).json({ success: false, message: err.message });
    }
  }
);

// =======================
// ✅ LIST USERS
// =======================
router.get("/", authMiddleware, roleMiddleware(["Admin"]), async (req, res) => {
  try {
    const { status, role } = req.query;
    const query = {};
    if (status) query.status = status;
    if (role) query.role = role;

    const users = await User.find(query);
    res.json({ success: true, users });
  } catch (err) {
    console.error("❌ Error listing users:", err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
