// backend/services/Equipment.service.js
const Equipment = require("../model/Equipment");

class EquipmentService {
  // =========================
  // ایجاد دستگاه جدید
  // =========================
  static async createEquipment(data) {
    try {
      // جلوگیری از ثبت کد تکراری
      const exists = await Equipment.findOne({
        equipmentCode: data.equipmentCode,
      });

      if (exists) {
        throw new Error("Equipment code already exists");
      }

      const equipment = await Equipment.create({
        equipmentCode: data.equipmentCode,
        name: data.name,
        brand: data.brand,
        model: data.model,
        healthIndex: data.healthIndex ?? 100,
        lastServiceDate: data.lastServiceDate,
        operationalStatus: data.operationalStatus || "Operational",
        location: data.location,
        purchaseDate: data.purchaseDate,
        warrantyEndDate: data.warrantyEndDate,
        notes: data.notes,
      });

      return equipment;
    } catch (error) {
      throw error;
    }
  }

  // =========================
  // گرفتن همه تجهیزات
  // =========================
  static async getAllEquipment() {
    try {
      return await Equipment.find().sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // =========================
  // گرفتن تجهیز با ID
  // =========================
  static async getEquipmentById(id) {
    const equipment = await Equipment.findById(id);
    if (!equipment) {
      throw new Error("Equipment not found");
    }
    return equipment;
  }

  // =========================
  // آپدیت تجهیز
  // =========================
  static async updateEquipment(id, data) {
    const equipment = await Equipment.findById(id);
    if (!equipment) {
      throw new Error("Equipment not found");
    }

    if (data.name) equipment.name = data.name;
    if (data.brand) equipment.brand = data.brand;
    if (data.model) equipment.model = data.model;
    if (data.healthIndex !== undefined)
      equipment.healthIndex = data.healthIndex;
    if (data.lastServiceDate) equipment.lastServiceDate = data.lastServiceDate;
    if (data.operationalStatus)
      equipment.operationalStatus = data.operationalStatus;
    if (data.location) equipment.location = data.location;
    if (data.purchaseDate) equipment.purchaseDate = data.purchaseDate;
    if (data.warrantyEndDate) equipment.warrantyEndDate = data.warrantyEndDate;
    if (data.notes) equipment.notes = data.notes;

    await equipment.save();
    return equipment;
  }

  // =========================
  // حذف تجهیز
  // =========================
  static async deleteEquipment(id) {
    const equipment = await Equipment.findById(id);
    if (!equipment) {
      throw new Error("Equipment not found");
    }

    await equipment.remove();
    return equipment;
  }

  // =========================
  // افزودن لاگ سرویس
  // =========================
  static async addMaintenanceLog(id, logData) {
    const equipment = await Equipment.findById(id);
    if (!equipment) {
      throw new Error("Equipment not found");
    }

    equipment.maintenanceLogs.push({
      date: logData.date,
      action: logData.action,
      performedBy: logData.performedBy,
    });

    // اگر تاریخ سرویس یا سلامت ارسال شد، آپدیت شود
    if (logData.date) equipment.lastServiceDate = logData.date;
    if (logData.healthIndex !== undefined)
      equipment.healthIndex = logData.healthIndex;

    await equipment.save();
    return equipment;
  }
}

module.exports = EquipmentService;
