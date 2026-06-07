const CafeMenuService = require("../services/CafeMenu.service");

class CafeMenuController {
  // ایجاد منو
  static async createMenu(req, res) {
    try {
      const menuItem = await CafeMenuService.createMenu(req.body, req.file);
      res.status(201).json(menuItem);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // گرفتن همه منوها
  static async getAllMenus(req, res) {
    try {
      const menus = await CafeMenuService.getAllMenus();
      res.status(200).json(menus);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // گرفتن منوی خاص
  static async getMenuById(req, res) {
    try {
      const menu = await CafeMenuService.getMenuById(req.params.id);
      res.status(200).json(menu);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // آپدیت منو
  static async updateMenu(req, res) {
    try {
      const menu = await CafeMenuService.updateMenu(
        req.params.id,
        req.body,
        req.file
      );
      res.status(200).json(menu);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // حذف منو
  static async deleteMenu(req, res) {
    try {
      const menu = await CafeMenuService.deleteMenu(req.params.id);
      res.status(200).json({ message: "Menu deleted successfully", menu });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = CafeMenuController;
