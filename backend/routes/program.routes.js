const express = require("express");
const TrainingProgram = require("../model/TrainingProgram");
const NutritionProgram = require("../model/NutritionProgram");
const TrainingRequest = require("../model/TrainingRequest");
const Membership = require("../model/Membership");
const Attendance = require("../model/Attendance");

const router = express.Router();

router.post("/training", async (req, res) => {
  try {
    const { userId, trainerId, requestId, title, trainingDays, weekDays, exercises, isTemplate } = req.body;
    if (!userId || !trainerId || !title || !trainingDays) return res.status(400).json({ success: false, message: "Required fields are missing" });
    if (!isTemplate) await TrainingProgram.updateMany({ userId, status: "active" }, { status: "archived" });
    const program = await TrainingProgram.create({
      userId, trainerId, requestId, title, trainingDays,
      weekDays: weekDays || [],
      exercises: exercises || [],
      isTemplate: isTemplate || false,
    });
    if (requestId) await TrainingRequest.findByIdAndUpdate(requestId, { trainingPlan: JSON.stringify({ title, trainingDays, weekDays, exercises: exercises || [] }), status: "approved" });
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

router.get("/trainer/:trainerId/students", async (req, res) => {
  try {
    const { trainerId } = req.params;
    const requests = await TrainingRequest.find({ trainerId, status: { $in: ["approved", "in_progress"] } })
      .populate("userId", "name employeeCode email phone profileImage height weight bmi role")
      .sort({ createdAt: -1 });

    const students = await Promise.all(requests.map(async (r) => {
      const user = r.userId;
      if (!user) return null;
      const membership = await Membership.findOne({ userId: user._id, status: "Active" }).sort({ createdAt: -1 });
      const lastAttendance = await Attendance.findOne({ userId: user._id }).sort({ checkedInAt: -1 });
      const activeProgram = await TrainingProgram.findOne({ userId: user._id, status: "active" }).sort({ createdAt: -1 });

      return {
        _id: user._id,
        name: user.name,
        employeeCode: user.employeeCode,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        height: user.height,
        weight: user.weight,
        bmi: user.bmi,
        membershipStatus: membership?.status || "Inactive",
        membershipEndDate: membership?.membershipEndDate,
        lastAttendance: lastAttendance?.checkedInAt || null,
        progressScore: activeProgram?.progressScore || 0,
        activeProgramId: activeProgram?._id || null,
        activeProgramTitle: activeProgram?.title || null,
        trainingRequestId: r._id,
        goals: r.goals,
      };
    }));

    res.json({ success: true, students: students.filter(Boolean) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/trainer/:trainerId", async (req, res) => {
  try {
    const programs = await TrainingProgram.find({ trainerId: req.params.trainerId })
      .populate("userId", "name employeeCode")
      .sort({ createdAt: -1 });
    res.json({ success: true, programs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const program = await TrainingProgram.findById(req.params.id)
      .populate("userId", "name employeeCode")
      .populate("trainerId", "name");
    if (!program) return res.status(404).json({ success: false, message: "Program not found" });
    res.json({ success: true, program });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const program = await TrainingProgram.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!program) return res.status(404).json({ success: false, message: "Program not found" });
    res.json({ success: true, program });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const program = await TrainingProgram.findByIdAndDelete(req.params.id);
    if (!program) return res.status(404).json({ success: false, message: "Program not found" });
    res.json({ success: true, message: "Program deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/:id/duplicate", async (req, res) => {
  try {
    const original = await TrainingProgram.findById(req.params.id);
    if (!original) return res.status(404).json({ success: false, message: "Program not found" });
    const dup = await TrainingProgram.create({
      ...original.toObject(),
      _id: undefined,
      title: `${original.title} (کپی)`,
      isTemplate: true,
      userId: req.body.userId || original.userId,
      dailyLogs: [],
      createdAt: undefined,
      updatedAt: undefined,
    });
    res.status(201).json({ success: true, program: dup });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch("/:id/daily-log", async (req, res) => {
  try {
    const { date, dayName, completed, notes } = req.body;
    const program = await TrainingProgram.findById(req.params.id);
    if (!program) return res.status(404).json({ success: false, message: "Program not found" });

    const existing = program.dailyLogs.find(
      (l) => l.date.toDateString() === new Date(date).toDateString() && l.dayName === dayName,
    );

    if (existing) {
      existing.completed = completed;
      existing.completedAt = completed ? new Date() : null;
      if (notes !== undefined) existing.notes = notes;
    } else {
      program.dailyLogs.push({
        date: new Date(date),
        dayName,
        completed,
        completedAt: completed ? new Date() : null,
        notes: notes || "",
      });
    }

    await program.save();
    res.json({ success: true, program });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
