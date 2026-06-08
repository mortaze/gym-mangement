const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const controller = require("../controller/program.controller");

const router = express.Router();

router.post("/training", protect(), controller.createTrainingProgram);
router.post("/nutrition", protect(), controller.createNutritionProgram);
router.get("/member/:userId", protect(), controller.getMemberPrograms);

module.exports = router;
