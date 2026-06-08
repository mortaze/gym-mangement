const TrainingProgram = require("../model/TrainingProgram");
const NutritionProgram = require("../model/NutritionProgram");
const TrainingRequest = require("../model/TrainingRequest");

exports.createTrainingProgram = async (req, res) => {
  try {
    const program = await TrainingProgram.create(req.body);
    if (req.body.requestId) {
      await TrainingRequest.findByIdAndUpdate(req.body.requestId, { trainingProgramId: program._id, status: "approved" });
    }
    res.status(201).json({ success: true, program });
  } catch (err) {
    console.error("createTrainingProgram error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.createNutritionProgram = async (req, res) => {
  try {
    const program = await NutritionProgram.create(req.body);
    if (req.body.requestId) {
      await TrainingRequest.findByIdAndUpdate(req.body.requestId, { nutritionProgramId: program._id });
    }
    res.status(201).json({ success: true, program });
  } catch (err) {
    console.error("createNutritionProgram error:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getMemberPrograms = async (req, res) => {
  try {
    const { userId } = req.params;
    const [trainingPrograms, nutritionPrograms] = await Promise.all([
      TrainingProgram.find({ userId }).populate("trainerId", "name").sort({ createdAt: -1 }),
      NutritionProgram.find({ userId }).populate("trainerId", "name").sort({ createdAt: -1 }),
    ]);
    res.json({ success: true, trainingPrograms, nutritionPrograms });
  } catch (err) {
    console.error("getMemberPrograms error:", err);
    res.status(500).json({ success: false, message: "خطا در دریافت برنامه‌ها." });
  }
};
