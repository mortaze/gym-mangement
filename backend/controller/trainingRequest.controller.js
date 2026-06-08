// backend/controllers/trainingRequest.controller.js
const TrainingRequest = require("../model/TrainingRequest");
const User = require("../model/User");
const path = require("path");
const fs = require("fs");
const { getUploadDir, uploadRoot } = require("../utils/uploadPaths");
const { calculateBmi, getBmiCategory } = require("../utils/membershipUtils");

// مسیر ذخیره عکس‌ها
getUploadDir("TrainingRequest");

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
      goals,
      age,
      trainingExperience,
      injuries,
      weeklyAvailableDays,
      notes,
    } = req.body;

    // دریافت فایل‌ها از multer
    const photos = req.files;

    if (
      !userId ||
      !trainerId ||
      !height ||
      !weight ||
      !amount
    ) {
      return res
        .status(400)
        .json({ success: false, message: "فیلدهای ضروری ناقص هستند." });
    }

    // مسیر عکس‌ها برای دیتابیس
    const photoPaths = (photos || []).map((file) => `TrainingRequest/${file.filename}`);
    const bmi = calculateBmi(height, weight);

    const request = await TrainingRequest.create({
      userId,
      trainerId,
      age,
      height,
      weight,
      bmi,
      bmiCategory: getBmiCategory(bmi),
      goals: Array.isArray(goals) ? goals : String(goals || "").split(",").map((goal) => goal.trim()).filter(Boolean),
      trainingExperience,
      injuries,
      weeklyAvailableDays,
      photos: photoPaths,
      paymentMethod,
      amount,
      status: "pending",
      userNotes: userNotes || notes,
      history: [
        {
          by: "user",
          status: "pending",
          userNotes: userNotes || notes || "",
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
      .populate("userId", "name profileImage age height weight bmi bmiCategory")
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
      .populate("userId", "name profileImage age height weight bmi bmiCategory")
      .populate("trainerId", "name profileImage role")
      .populate("trainingProgramId")
      .populate("nutritionProgramId");

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
    const { by, status, userNotes, trainerNotes, trainingPlan, goals, age, height, weight, trainingExperience, injuries, weeklyAvailableDays } = req.body;

    const request = await TrainingRequest.findById(id);
    if (!request)
      return res
        .status(404)
        .json({ success: false, message: "درخواست یافت نشد." });

    // اگر فایل جدید آپلود شد، عکس قبلی پاک شود
    if (req.files && req.files.length > 0) {
      // پاک کردن عکس‌های قبلی
      request.photos.forEach((p) => {
        const oldPath = path.join(uploadRoot, p);
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
    if (goals !== undefined) request.goals = Array.isArray(goals) ? goals : String(goals || "").split(",").map((goal) => goal.trim()).filter(Boolean);
    if (age !== undefined) request.age = age;
    if (height !== undefined) request.height = height;
    if (weight !== undefined) request.weight = weight;
    if (trainingExperience !== undefined) request.trainingExperience = trainingExperience;
    if (injuries !== undefined) request.injuries = injuries;
    if (weeklyAvailableDays !== undefined) request.weeklyAvailableDays = weeklyAvailableDays;
    const bmi = calculateBmi(request.height, request.weight);
    if (bmi !== undefined) {
      request.bmi = bmi;
      request.bmiCategory = getBmiCategory(bmi);
    }

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
        const imgPath = path.join(uploadRoot, p);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
      });
    }

    await request.deleteOne();
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
      .populate("userId", "name profileImage age height weight bmi bmiCategory")
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "خطا در دریافت درخواست‌های مربی." });
  }
};
