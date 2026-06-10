// backend/controller/equipment.controller.js
const EquipmentService = require("../services/equipment.service");

class EquipmentController {
  // =========================
  // ایجاد دستگاه جدید
  // =========================
  static async createEquipment(req, res) {
    try {
      const equipment = await EquipmentService.createEquipment(req.body);
      res.status(201).json(equipment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // =========================
  // گرفتن همه تجهیزات
  // =========================
  static async getAllEquipment(req, res) {
    try {
      const equipmentList = await EquipmentService.getAllEquipment();
      res.status(200).json(equipmentList);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // =========================
  // گرفتن تجهیز با ID
  // =========================
  static async getEquipmentById(req, res) {
    try {
      const equipment = await EquipmentService.getEquipmentById(req.params.id);
      res.status(200).json(equipment);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // =========================
  // آپدیت تجهیز
  // =========================
  static async updateEquipment(req, res) {
    try {
      const updatedEquipment = await EquipmentService.updateEquipment(
        req.params.id,
        req.body,
      );
      res.status(200).json(updatedEquipment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // =========================
  // حذف تجهیز
  // =========================
  static async deleteEquipment(req, res) {
    try {
      await EquipmentService.deleteEquipment(req.params.id);
      res.status(200).json({ message: "Equipment deleted successfully" });
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  // =========================
  // افزودن لاگ سرویس
  // =========================
  static async addMaintenanceLog(req, res) {
    try {
      const equipment = await EquipmentService.addMaintenanceLog(
        req.params.id,
        req.body,
      );
      res.status(200).json(equipment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = EquipmentController;
