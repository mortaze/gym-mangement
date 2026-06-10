// backend/services/user.service.js
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../model/User");

class UserService {
  // =====================================
  // ✅ ایجاد کاربر جدید با ذخیره ایمیل + عکس + تاریخ تولد + نقش
  // =====================================
  async createUser(data) {
    try {
      const {
        name,
        employeeCode,
        password,
        email,
        role = "Member",
        contactNumber,
        address,
        status = "active",
        profileImage,
        birthday, // YYYY/MM/DD شمسی
      } = data;

      // بررسی یکتا بودن کد کارمند
      const exist = await User.findOne({ employeeCode });
      if (exist) throw new Error("Employee code already exists");

      // بررسی یکتا بودن ایمیل (اگر داده شده)
      if (email) {
        const emailExist = await User.findOne({ email });
        if (emailExist) throw new Error("Email already exists");
      }

      const user = new User({
        name,
        employeeCode,
        email,
        password,
        role,
        contactNumber,
        address,
        status,
        profileImage,
        birthday,
      });

      await user.save();
      return user;
    } catch (err) {
      throw err;
    }
  }

  // =====================================
  // ✅ آپدیت کاربر + آپلود تصویر جدید + هش پسورد جدید
  // =====================================
  async updateUser(id, data) {
    try {
      // هش پسورد در صورت وجود
      if (data.password) {
        const salt = await bcrypt.genSalt(10);
        data.password = await bcrypt.hash(data.password, salt);
      }

      const updatedUser = await User.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      });

      if (!updatedUser) throw new Error("User not found");
      return updatedUser;
    } catch (err) {
      throw err;
    }
  }

  // =====================================
  // ✅ دریافت کاربر با employeeCode
  // =====================================
  async getUserByEmployeeCode(code) {
    const user = await User.findOne({ employeeCode: code });
    if (!user) throw new Error("User not found");
    return user;
  }

  // =====================================
  // ✅ دریافت کاربر با ID
  // =====================================
  async getUserById(id) {
    const user = await User.findById(id);
    if (!user) throw new Error("User not found");
    return user;
  }

  // =====================================
  // ✅ حذف کاربر
  // =====================================
  async deleteUser(id) {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) throw new Error("User not found");
    return deletedUser;
  }

  // =====================================
  // ✅ بررسی پسورد
  // =====================================
  async verifyPassword(user, password) {
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid password");
    return true;
  }

  // =====================================
  // ✅ تولید توکن ریست پسورد
  // =====================================
  async generatePasswordResetToken(user) {
    const token = crypto.randomBytes(32).toString("hex");

    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 ساعت اعتبار

    await user.save();
    return token;
  }

  // =====================================
  // ✅ گرفتن کاربر با توکن ریست پسورد
  // =====================================
  async getUserByResetToken(token) {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) throw new Error("Invalid or expired token");
    return user;
  }

  // =====================================
  // ✅ ریست پسورد
  // =====================================
  async resetPassword(user, newPassword) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
    return user;
  }

  // =====================================
  // ✅ تغییر وضعیت کاربر
  // =====================================
  async changeUserStatus(id, status) {
    if (!["active", "inactive", "blocked"].includes(status)) {
      throw new Error("Invalid status");
    }

    const user = await User.findByIdAndUpdate(id, { status }, { new: true });
    if (!user) throw new Error("User not found");

    return user;
  }

  // =====================================
  // ✅ لیست کاربران با فیلتر و صفحه‌بندی + فیلتر بر اساس نقش
  // =====================================
  async listUsers({ page = 1, limit = 10, status, role }) {
    const query = {};
    if (status) query.status = status;
    if (role) query.role = role;

    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    return { users, total, page, limit };
  }
}

module.exports = new UserService();
