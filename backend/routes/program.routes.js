const express = require("express");
const TrainingProgram = require("../model/TrainingProgram");
const NutritionProgram = require("../model/NutritionProgram");
const TrainingRequest = require("../model/TrainingRequest");

const router = express.Router();

router.post("/training", async (req, res) => {
  try {
    const { userId, trainerId, requestId, title, trainingDays, exercises } = req.body;
    if (!userId || !trainerId || !title || !trainingDays) return res.status(400).json({ success: false, message: "Required fields are missing" });
    await TrainingProgram.updateMany({ userId, status: "active" }, { status: "archived" });
    const program = await TrainingProgram.create({ userId, trainerId, requestId, title, trainingDays, exercises: exercises || [] });
    if (requestId) await TrainingRequest.findByIdAndUpdate(requestId, { trainingPlan: JSON.stringify({ title, trainingDays, exercises: exercises || [] }), status: "approved" });
    res.status(201).json({ success: true, program });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/nutrition", async (req, res) => {
  try {
    const { userId, trainerId, requestId, title, plan, meals } = req.body;
    const normalizedPlan = plan || (meals ? Object.values(meals).filter(Boolean).join("\n") : "");
    if (!userId || !trainerId || !title || !normalizedPlan) return res.status(400).json({ success: false, message: "Required fields are missing" });
    await NutritionProgram.updateMany({ userId, status: "active" }, { status: "archived" });
    const nutrition = await NutritionProgram.create({ userId, trainerId, requestId, title, plan: normalizedPlan, meals: meals || {} });
    if (requestId) await TrainingRequest.findByIdAndUpdate(requestId, { nutritionPlan: JSON.stringify({ title, meals: meals || {}, plan: normalizedPlan }), status: "approved" });
    res.status(201).json({ success: true, nutrition });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/user/:userId", async (req, res) => {
  try {
    const [trainingPrograms, nutritionPrograms] = await Promise.all([
      TrainingProgram.find({ userId: req.params.userId }).populate("trainerId", "name").sort({ createdAt: -1 }),
      NutritionProgram.find({ userId: req.params.userId }).populate("trainerId", "name").sort({ createdAt: -1 }),
    ]);
    res.json({ success: true, trainingPrograms, nutritionPrograms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
