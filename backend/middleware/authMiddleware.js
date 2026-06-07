// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../model/User");

const getJwtSecret = () =>
  process.env.JWT_SECRET || process.env.TOKEN_SECRET || "development-jwt-secret";

const getUserRole = (user) => {
  if (!user) return undefined;
  if (typeof user.role === "string") return user.role;
  if (user.role && typeof user.role.name === "string") return user.role.name;
  return undefined;
};

const normalizeRole = (role) => String(role || "").toLowerCase();

// Middleware factory. Also supports direct Express usage: router.get('/me', protect, handler).
function protect(roles = []) {
  if (roles && roles.headers && roles.method) {
    return protect()(roles, arguments[1], arguments[2]);
  }

  const allowedRoles = Array.isArray(roles) ? roles : [];

  return async (req, res, next) => {
    try {
      let token;

      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
      ) {
        token = req.headers.authorization.split(" ")[1];
      } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
      } else if (req.headers.cookie) {
        const tokenCookie = req.headers.cookie
          .split(";")
          .map((cookie) => cookie.trim())
          .find((cookie) => cookie.startsWith("token="));
        if (tokenCookie) token = decodeURIComponent(tokenCookie.split("=")[1]);
      }

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "توکن احراز هویت پیدا نشد. لطفاً لاگین کنید.",
        });
      }

      const decoded = jwt.verify(token, getJwtSecret());
      const userId = decoded.id || decoded._id;

      const user = await User.findById(userId).select("-password");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "کاربر یافت نشد.",
        });
      }

      const userRole = getUserRole(user);
      if (
        allowedRoles.length &&
        !allowedRoles.map(normalizeRole).includes(normalizeRole(userRole))
      ) {
        return res.status(403).json({
          success: false,
          message: "دسترسی کافی برای این عملیات ندارید.",
        });
      }

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
}

const authorize = (...roles) => protect(roles);

module.exports = {
  protect,
  authorize,
  getJwtSecret,
  getUserRole,
};
