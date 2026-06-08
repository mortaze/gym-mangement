// backend/controllers/trainingRequest.controller.js
const TrainingRequest = require("../model/TrainingRequest");
const TrainingProgram = require("../model/TrainingProgram");
const NutritionProgram = require("../model/NutritionProgram");
const User = require("../model/User");
const path = require("path");
const fs = require("fs");
const { getUploadDir, uploadRoot } = require("../utils/uploadPaths");
const { calculateBmi, getBmiCategory } = require("../utils/gymCalculations");

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
      notes,
    } = req.body;

    if (!userId || !trainerId || !height || !weight) {
      return res.status(400).json({ success: false, message: "فیلدهای ضروری ناقص هستند." });
    }

    const photoPaths = (req.files || []).map((file) => `TrainingRequest/${file.filename}`);
    const bmi = calculateBmi(height, weight);

    const request = await TrainingRequest.create({
      userId,
      trainerId,
      age,
      height,
      weight,
      bmi,
      bmiCategory: getBmiCategory(bmi),
      goals: parseGoals(goals),
      trainingExperience,
      injuries,
      weeklyAvailableDays,
      photos: photoPaths,
      paymentMethod,
      amount: Number(amount) || 0,
      status: "pending",
      userNotes: userNotes || notes || "",
      notes,
      history: [{ by: "user", status: "pending", userNotes: userNotes || notes || "", trainingPlan: "" }],
    });

    await User.findByIdAndUpdate(userId, {
      ...(age ? { age } : {}),
      height,
      weight,
      ...(bmi ? { bmi, bmiCategory: getBmiCategory(bmi) } : {}),
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
      .populate("userId", "name employeeCode contactNumber profileImage age height weight bmi bmiCategory")
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
    const request = await TrainingRequest.findById(req.params.id)
      .populate("userId", "name employeeCode contactNumber email profileImage age height weight bmi bmiCategory")
      .populate("trainerId", "name profileImage role");
    if (!request) return res.status(404).json({ success: false, message: "درخواست یافت نشد." });
    res.json({ success: true, request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطا در دریافت درخواست." });
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      by,
      status,
      userNotes,
      trainerNotes,
      trainingPlan,
      nutritionPlan,
      title,
      trainingDays,
      exercises,
      nutritionDetails,
    } = req.body;

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
    if (nutritionPlan !== undefined) request.nutritionPlan = nutritionPlan;

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
    const requests = await TrainingRequest.find({ trainerId: req.params.trainerId })
      .populate("userId", "name employeeCode contactNumber profileImage age height weight bmi bmiCategory")
      .sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "خطا در دریافت درخواست‌های مربی." });
  }
};
