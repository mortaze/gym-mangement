const CafeMenu = require("../model/CafeMenu");
const fs = require("fs");
const path = require("path");

// مسیر فولدر آپلود
const uploadDir = path.join(__dirname, "../uploads/CafeMenu");

class CafeMenuService {
  // ساخت منو
  static async createMenu(data, file) {
    const img = file ? `CafeMenu/${file.filename}` : null;

    const menuItem = await CafeMenu.create({
      ...data,
      img,
    });

    return menuItem;
  }

  // گرفتن همه منوها
  static async getAllMenus() {
    return await CafeMenu.find().sort({ createdAt: -1 });
  }

  // گرفتن منوی خاص
  static async getMenuById(id) {
    const menuItem = await CafeMenu.findById(id);
    if (!menuItem) throw new Error("Menu item not found");
    return menuItem;
  }

  // آپدیت منو
  static async updateMenu(id, data, file) {
    const menuItem = await CafeMenu.findById(id);
    if (!menuItem) throw new Error("Menu item not found");

    // اگر عکس جدید آپلود شد، عکس قبلی را پاک کن
    if (file && menuItem.img) {
      const oldPath = path.join(__dirname, "../uploads", menuItem.img);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      data.img = `CafeMenu/${file.filename}`;
    }

    Object.assign(menuItem, data);
    await menuItem.save();

    return menuItem;
  }

  // حذف منو
  static async deleteMenu(id) {
    const menuItem = await CafeMenu.findById(id);
    if (!menuItem) throw new Error("Menu item not found");

    // پاک کردن عکس از سرور
    if (menuItem.img) {
      const imgPath = path.join(__dirname, "../uploads", menuItem.img);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await menuItem.remove();
    return menuItem;
  }
}

module.exports = CafeMenuService;
