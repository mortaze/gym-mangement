const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const CafeMenu = require("../model/CafeMenu");

const router = express.Router();

// ایجاد فولدر آپلود در صورت نبودن
const uploadDir = path.join(__dirname, "../uploads/CafeMenu");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// دسترسی عمومی به عکس‌ها (باید در server.js هم استفاده شود)
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// تنظیم Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage });

// ===================
// Routes
// ===================

// ایجاد منو
router.post("/", upload.single("img"), async (req, res) => {
  try {
    const { name, category, price, kcal } = req.body;
    if (!req.file)
      return res.status(400).json({ message: "Image is required" });

    // تولید productId یکتا
    const lastItem = await CafeMenu.findOne().sort({ productId: -1 });
    const productId = lastItem ? lastItem.productId + 1 : 100;

    const img = `CafeMenu/${req.file.filename}`;

    const menuItem = await CafeMenu.create({
      productId,
      name,
      category,
      price,
      kcal,
      img,
    });

    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// گرفتن همه منوها
router.get("/", async (req, res) => {
  try {
    const menus = await CafeMenu.find().sort({ createdAt: -1 });
    res.status(200).json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// گرفتن منوی خاص
router.get("/:id", async (req, res) => {
  try {
    const menu = await CafeMenu.findById(req.params.id);
    if (!menu) return res.status(404).json({ message: "Menu not found" });
    res.status(200).json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// آپدیت منو
router.put("/:id", upload.single("img"), async (req, res) => {
  try {
    const menu = await CafeMenu.findById(req.params.id);
    if (!menu) return res.status(404).json({ message: "Menu not found" });

    const { name, category, price, kcal, status } = req.body;

    // اگر عکس جدید آپلود شد، عکس قبلی پاک شود
    if (req.file && menu.img) {
      const oldPath = path.join(__dirname, "../uploads", menu.img);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      menu.img = `CafeMenu/${req.file.filename}`;
    }

    if (name) menu.name = name;
    if (category) menu.category = category;
    if (price) menu.price = price;
    if (kcal) menu.kcal = kcal;
    if (status) menu.status = status;

    await menu.save();
    res.status(200).json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// حذف منو
router.delete("/:id", async (req, res) => {
  try {
    const menu = await CafeMenu.findById(req.params.id);
    if (!menu) return res.status(404).json({ message: "Menu not found" });

    // پاک کردن عکس
    if (menu.img) {
      const imgPath = path.join(__dirname, "../uploads", menu.img);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await menu.remove();
    res.status(200).json({ message: "Menu deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
