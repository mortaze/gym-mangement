const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const controller = require("../controller/membership.controller");

const router = express.Router();

router.post("/purchase", protect(), controller.purchaseMembership);
router.get("/", protect(), controller.listMemberships);
router.get("/active/:userId", protect(), controller.getActiveMembership);
router.post("/attendance", protect(), controller.recordAttendance);
router.get("/finance/summary", authorize("Admin", "admin", "Finance", "finance"), controller.financeSummary);
router.put("/payments/:paymentId/approve", authorize("Admin", "admin", "Finance", "finance"), controller.approvePayment);

module.exports = router;
