// backend/controllers/trainingRequest.controller.js
const TrainingRequest = require("../model/TrainingRequest");
const User = require("../model/User");
const path = require("path");
const fs = require("fs");

// مسیر ذخیره عکس‌ها
const uploadDir = path.join(__dirname, "../uploads/TrainingRequest");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ================================
// ایجاد یک درخواست جدید با عکس‌ها
// ================================
exports.createRequest = async (req, res) => {
  try {
    const {
      userId,
      trainerId,
      height,
      weight,
      paymentMethod,
      amount,
      userNotes,
    } = req.body;

    // دریافت فایل‌ها از multer
    const photos = req.files;

    if (
      !userId ||
      !trainerId ||
      !height ||
      !weight ||
      !photos ||
      photos.length === 0 ||
      !amount
    ) {
      return res
        .status(400)
        .json({ success: false, message: "فیلدهای ضروری ناقص هستند." });
    }

    // مسیر عکس‌ها برای دیتابیس
    const photoPaths = photos.map((file) => `TrainingRequest/${file.filename}`);

    const request = await TrainingRequest.create({
      userId,
      trainerId,
      height,
      weight,
      photos: photoPaths,
      paymentMethod,
      amount,
      status: "pending",
      userNotes,
      history: [
        {
          by: "user",
          status: "pending",
          userNotes: userNotes || "",
          trainingPlan: "",
        },
      ],
    });

    res.status(201).json({ success: true, request });
  } catch (err) {
    console.error("createRequest error:", err);
    res.status(500).json({ success: false, message: "خطا در ایجاد درخواست." });
  }
};

// ================================
// گرفتن همه درخواست‌ها با فیلتر اختیاری
// ================================
exports.getAllRequests = async (req, res) => {
  try {
    const { userId, trainerId } = req.query;
    const filter = {};

    if (userId) filter.userId = userId;
    if (trainerId) filter.trainerId = trainerId;

    const requests = await TrainingRequest.find(filter)
      .populate("userId", "name profileImage")
      .populate("trainerId", "name profileImage role")
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "خطا در دریافت درخواست‌ها." });
  }
};

// ================================
// گرفتن یک درخواست خاص با تاریخچه
// ================================
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await TrainingRequest.findById(id)
      .populate("userId", "name profileImage")
      .populate("trainerId", "name profileImage role");

    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "درخواست یافت نشد." });

    res.json({ success: true, request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطا در دریافت درخواست." });
  }
};

// ================================
// آپدیت وضعیت، یادداشت، برنامه تمرینی و عکس‌ها
// ================================
exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { by, status, userNotes, trainerNotes, trainingPlan } = req.body;

    const request = await TrainingRequest.findById(id);
    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "درخواست یافت نشد." });

    // اگر فایل جدید آپلود شد، عکس قبلی پاک شود
    if (req.files && req.files.length > 0) {
      // پاک کردن عکس‌های قبلی
      request.photos.forEach((p) => {
        const oldPath = path.join(__dirname, "../uploads", p);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      });

      // ذخیره مسیر عکس‌های جدید
      const newPhotos = req.files.map((f) => `TrainingRequest/${f.filename}`);
      request.photos = newPhotos;
    }

    // به‌روز رسانی فیلدها در صورت ارسال
    if (status) request.status = status;
    if (userNotes !== undefined) request.userNotes = userNotes;
    if (trainerNotes !== undefined) request.trainerNotes = trainerNotes;
    if (trainingPlan !== undefined) request.trainingPlan = trainingPlan;

    // اضافه کردن رکورد به تاریخچه
    request.history.push({
      by: by || "trainer",
      status: request.status,
      userNotes: request.userNotes || "",
      trainerNotes: request.trainerNotes || "",
      trainingPlan: request.trainingPlan || "",
    });

    await request.save();

    res.json({ success: true, request });
  } catch (err) {
    console.error("updateRequest error:", err);
    res
      .status(500)
      .json({ success: false, message: "خطا در بروزرسانی درخواست." });
  }
};

// ================================
// حذف درخواست و عکس‌ها
// ================================
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await TrainingRequest.findById(id);
    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "درخواست یافت نشد." });

    // حذف عکس‌ها
    if (request.photos && request.photos.length > 0) {
      request.photos.forEach((p) => {
        const imgPath = path.join(__dirname, "../uploads", p);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });
    }

    await request.remove();
    res.json({ success: true, message: "درخواست حذف شد." });
  } catch (err) {
    console.error("deleteRequest error:", err);
    res.status(500).json({ success: false, message: "خطا در حذف درخواست." });
  }
};

// ================================
// گرفتن همه درخواست‌های یک کاربر
// ================================
exports.getRequestsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const requests = await TrainingRequest.find({ userId })
      .populate("trainerId", "name profileImage role")
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "خطا در دریافت درخواست‌های کاربر." });
  }
};

// ================================
// گرفتن همه درخواست‌های یک مربی
// ================================
exports.getRequestsByTrainer = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const requests = await TrainingRequest.find({ trainerId })
      .populate("userId", "name profileImage")
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "خطا در دریافت درخواست‌های مربی." });
  }
};
