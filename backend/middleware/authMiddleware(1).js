// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../model/User");

// Middleware برای احراز هویت
// میتونی roles رو به عنوان آرایه پاس بدی، برای محدود کردن دسترسی به نقش‌های خاص
const protect =
  (roles = []) =>
  async (req, res, next) => {
    try {
      let token;

      // 1️⃣ بررسی هدر Authorization
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
      ) {
        token = req.headers.authorization.split(" ")[1];
      }
      // 2️⃣ بررسی کوکی HttpOnly
      else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
      }

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "توکن احراز هویت پیدا نشد. لطفاً لاگین کنید.",
        });
      }

      // 3️⃣ بررسی اعتبار JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded) {
        return res.status(401).json({
          success: false,
          message: "توکن معتبر نیست یا منقضی شده است.",
        });
      }

      // 4️⃣ گرفتن اطلاعات کاربر از DB
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "کاربر یافت نشد.",
        });
      }

      // 5️⃣ بررسی نقش‌ها (اگر داده شده)
      if (roles.length && !roles.includes(user.role.name)) {
        return res.status(403).json({
          success: false,
          message: "دسترسی کافی برای این عملیات ندارید.",
        });
      }

      // 6️⃣ attach کردن user به request
      req.user = user;

      next();
    } catch (err) {
      console.error("AuthMiddleware Error:", err);
      return res.status(401).json({
        success: false,
        message: "خطای احراز هویت",
        error: err.message,
      });
    }
  };

// Middleware برای محدود کردن فقط به نقش‌های خاص
const authorize = (...roles) => protect(roles);

module.exports = {
  protect,
  authorize,
};
