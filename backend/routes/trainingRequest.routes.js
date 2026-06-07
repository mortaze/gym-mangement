// backend/routes/trainingRequest.routes.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const TrainingRequestController = require("../controller/TrainingRequest.controller");

const router = express.Router();

// ===============================
// تنظیم مسیر آپلود عکس‌ها
// ===============================
const uploadDir = path.join(__dirname, "../uploads/TrainingRequest");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// دسترسی عمومی به فایل‌های آپلود شده
router.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// تنظیم Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage });

// ===============================
// Routes
// ===============================

/**
 * @route   POST /api/training-requests
 * @desc    ایجاد یک درخواست جدید برنامه تمرینی
 *          شامل آپلود چند عکس
 * @access  کاربر وارد شده
 */
router.post(
  "/",
  upload.array("photos"), // چند فایل با نام فیلد photos
  TrainingRequestController.createRequest
);

/**
 * @route   GET /api/training-requests
 * @desc    دریافت لیست تمام درخواست‌ها (برای ادمین یا مربی)
 * @access  ادمین یا مربی
 */
router.get("/", TrainingRequestController.getAllRequests);

/**
 * @route   GET /api/training-requests/user/:userId
 * @desc    دریافت تمام درخواست‌های یک کاربر
 * @access  کاربر خودش یا ادمین
 */
router.get("/user/:userId", TrainingRequestController.getRequestsByUser);

/**
 * @route   GET /api/training-requests/trainer/:trainerId
 * @desc    دریافت تمام درخواست‌های مرتبط با یک مربی
 * @access  مربی یا ادمین
 */
router.get(
  "/trainer/:trainerId",
  TrainingRequestController.getRequestsByTrainer
);

/**
 * @route   GET /api/training-requests/:id
 * @desc    دریافت یک درخواست خاص با جزئیات کامل
 * @access  کاربر مرتبط، مربی یا ادمین
 */
router.get("/:id", TrainingRequestController.getRequestById);

/**
 * @route   PUT /api/training-requests/:id
 * @desc    بروزرسانی وضعیت درخواست و یادداشت‌ها یا برنامه تمرینی
 *          و اضافه کردن رکورد به تاریخچه
 * @access  مربی یا کاربر
 */
router.put(
  "/:id",
  upload.array("photos"),
  TrainingRequestController.updateRequest
);

/**
 * @route   DELETE /api/training-requests/:id
 * @desc    حذف یک درخواست (در صورت نیاز، ادمین یا کاربر خودش)
 * @access  ادمین یا کاربر خودش
 */
router.delete("/:id", TrainingRequestController.deleteRequest);

module.exports = router;
