// backend/controllers/trainingRequest.controller.js
const TrainingRequest = require("../model/TrainingRequest");
const TrainingProgram = require("../model/TrainingProgram");
const NutritionProgram = require("../model/NutritionProgram");
const User = require("../model/User");
const path = require("path");
const fs = require("fs");
const { getUploadDir, uploadRoot } = require("../utils/uploadPaths");
const { calculateBmi, getBmiCategory } = require("../utils/membershipUtils");

getUploadDir("TrainingRequest");

const parseGoals = (goals) => {
  if (!goals) return [];
  if (Array.isArray(goals)) return goals.filter(Boolean);
  try {
    const parsed = JSON.parse(goals);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [String(goals)];
  } catch (_) {
    return String(goals).split(",").map((g) => g.trim()).filter(Boolean);
  }
};

exports.createRequest = async (req, res) => {
  try {
    const {
      userId,
      trainerId,
      age,
      height,
      weight,
      goals,
      trainingExperience,
      injuries,
      weeklyAvailableDays,
      paymentMethod,
      amount = 0,
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
      amount: Number(amount) || 0,
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

exports.getAllRequests = async (req, res) => {
  try {
    const { userId, trainerId, status } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (trainerId) filter.trainerId = trainerId;
    if (status) filter.status = status;
    const requests = await TrainingRequest.find(filter)
      .populate("userId", "name profileImage age height weight bmi bmiCategory")
      .populate("trainerId", "name profileImage role")
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطا در دریافت درخواست‌ها." });
  }
};

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

exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { by, status, userNotes, trainerNotes, trainingPlan, goals, age, height, weight, trainingExperience, injuries, weeklyAvailableDays } = req.body;

    const request = await TrainingRequest.findById(id);
    if (!request) return res.status(404).json({ success: false, message: "درخواست یافت نشد." });

    if (req.files && req.files.length > 0) {
      request.photos.forEach((p) => {
        const oldPath = path.join(uploadRoot, p);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      });
      request.photos = req.files.map((f) => `TrainingRequest/${f.filename}`);
    }

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

    request.history.push({
      by: by || "trainer",
      status: request.status,
      userNotes: request.userNotes || "",
      trainerNotes: request.trainerNotes || "",
      trainingPlan: request.trainingPlan || "",
    });

    await request.save();

    let program = null;
    let nutrition = null;
    if (trainingPlan || exercises) {
      await TrainingProgram.updateMany({ userId: request.userId, status: "active" }, { status: "archived" });
      let parsedExercises = [];
      if (exercises) parsedExercises = typeof exercises === "string" ? JSON.parse(exercises || "[]") : exercises;
      program = await TrainingProgram.create({
        userId: request.userId,
        trainerId: request.trainerId,
        requestId: request._id,
        title: title || "Training Program",
        trainingDays: Number(trainingDays) || request.weeklyAvailableDays,
        exercises: parsedExercises,
        notes: trainingPlan,
      });
    }
    if (nutritionPlan || nutritionDetails) {
      await NutritionProgram.updateMany({ userId: request.userId, status: "active" }, { status: "archived" });
      nutrition = await NutritionProgram.create({
        userId: request.userId,
        trainerId: request.trainerId,
        requestId: request._id,
        title: title ? `${title} Nutrition` : "Nutrition Program",
        plan: nutritionPlan || nutritionDetails,
      });
    }

    res.json({ success: true, request, program, nutrition });
  } catch (err) {
    console.error("updateRequest error:", err);
    res.status(500).json({ success: false, message: "خطا در بروزرسانی درخواست." });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const request = await TrainingRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "درخواست یافت نشد." });
    (request.photos || []).forEach((p) => {
      const imgPath = path.join(uploadRoot, p);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    });
    await request.deleteOne();
    res.json({ success: true, message: "درخواست حذف شد." });
  } catch (err) {
    console.error("deleteRequest error:", err);
    res.status(500).json({ success: false, message: "خطا در حذف درخواست." });
  }
};

exports.getRequestsByUser = async (req, res) => {
  try {
    const requests = await TrainingRequest.find({ userId: req.params.userId })
      .populate("trainerId", "name profileImage role")
      .sort({ createdAt: -1 });
    const programs = await TrainingProgram.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    const nutritionPrograms = await NutritionProgram.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json({ success: true, requests, programs, nutritionPrograms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطا در دریافت درخواست‌های کاربر." });
  }
};

exports.getRequestsByTrainer = async (req, res) => {
  try {
    const { trainerId } = req.params;
    const requests = await TrainingRequest.find({ trainerId })
      .populate("userId", "name profileImage age height weight bmi bmiCategory")
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطا در دریافت درخواست‌های مربی." });
  }
};
