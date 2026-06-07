// backend/routes/equipment.routes.js
const express = require("express");
const router = express.Router();

const EquipmentController = require("../controller/equipment.controller");

// ==========================
// Routes
// ==========================

// ایجاد تجهیز جدید
// POST /api/equipment
router.post("/", EquipmentController.createEquipment);

// گرفتن همه تجهیزات
// GET /api/equipment
router.get("/", EquipmentController.getAllEquipment);

// گرفتن تجهیز با ID
// GET /api/equipment/:id
router.get("/:id", EquipmentController.getEquipmentById);

// آپدیت تجهیز
// PUT /api/equipment/:id
router.put("/:id", EquipmentController.updateEquipment);

// حذف تجهیز
// DELETE /api/equipment/:id
router.delete("/:id", EquipmentController.deleteEquipment);

// افزودن لاگ تعمیرات
// POST /api/equipment/:id/maintenance
router.post("/:id/maintenance", EquipmentController.addMaintenanceLog);

module.exports = router;
