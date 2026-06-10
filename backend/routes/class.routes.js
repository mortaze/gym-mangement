const express = require("express");
const router = express.Router();
const { body, query, param, validationResult } = require("express-validator");
const ClassSession = require("../model/ClassSession");
const crypto = require("crypto");

const generateQrToken = () => crypto.randomBytes(12).toString("hex");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: "Validation failed", errors: errors.array() });
  }
  next();
};

router.post("/",
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("trainerId").notEmpty().withMessage("Trainer is required"),
    body("date").isISO8601().withMessage("Valid date is required"),
    body("time").trim().notEmpty().withMessage("Time is required"),
    body("capacity").isInt({ min: 1 }).withMessage("Capacity must be at least 1"),
    body("duration").isInt({ min: 15 }).withMessage("Duration must be at least 15 minutes"),
    body("description").optional().trim(),
    body("location").optional().trim(),
    validate,
  ],
  async (req, res) => {
    try {
      const { title, trainerId, date, time, capacity, duration, description, location } = req.body;
      const session = await ClassSession.create({ title, trainerId, date, time, capacity, duration, description, location });
    res.status(201).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const { trainerId, from, to, status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (trainerId) filter.trainerId = trainerId;
    if (status) filter.status = status;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }
    const skip = (Math.max(1, Number(page)) - 1) * Math.min(Number(limit), 100);
    const maxLimit = Math.min(Number(limit), 100);
    const [sessions, total] = await Promise.all([
      ClassSession.find(filter)
        .populate("trainerId", "name employeeCode")
        .sort({ date: 1, time: 1 })
        .skip(skip)
        .limit(maxLimit),
      ClassSession.countDocuments(filter),
    ]);
    res.json({ success: true, sessions, total, page: Number(page), limit: maxLimit });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const session = await ClassSession.findById(req.params.id)
      .populate("trainerId", "name employeeCode")
      .populate("attendees.userId", "name employeeCode email phone")
      .populate("waitingList.userId", "name employeeCode");
    if (!session) return res.status(404).json({ success: false, message: "Class not found" });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id",
  [
    body("title").optional().trim().notEmpty().withMessage("Title is required"),
    body("date").optional().isISO8601().withMessage("Valid date is required"),
    body("time").optional().trim().notEmpty().withMessage("Time is required"),
    body("capacity").optional().isInt({ min: 1 }).withMessage("Capacity must be at least 1"),
    body("duration").optional().isInt({ min: 15 }).withMessage("Duration must be at least 15 minutes"),
    body("description").optional().trim(),
    body("location").optional().trim(),
    body("status").optional().isIn(["scheduled", "ongoing", "completed", "cancelled"]).withMessage("Invalid status"),
    validate,
  ],
  async (req, res) => {
  try {
    const { title, date, time, capacity, duration, description, location, status } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (date !== undefined) update.date = date;
    if (time !== undefined) update.time = time;
    if (capacity !== undefined) update.capacity = capacity;
    if (duration !== undefined) update.duration = duration;
    if (description !== undefined) update.description = description;
    if (location !== undefined) update.location = location;
    if (status !== undefined) update.status = status;

    const session = await ClassSession.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!session) return res.status(404).json({ success: false, message: "Class not found" });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const session = await ClassSession.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: "Class not found" });
    res.json({ success: true, message: "Class deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/:id/book",
  [body("userId").notEmpty().withMessage("userId is required"), validate],
  async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "userId is required" });

    const session = await ClassSession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: "Class not found" });
    if (session.status === "cancelled" || session.status === "completed") {
      return res.status(400).json({ success: false, message: "Class is no longer available" });
    }

    const existing = session.attendees.find((a) => a.userId.toString() === userId && a.status !== "cancelled");
    if (existing) return res.status(400).json({ success: false, message: "Already booked this class" });

    const bookedCount = session.attendees.filter((a) => a.status === "booked").length;
    const isFull = bookedCount >= session.capacity;

    if (isFull) {
      const alreadyWaiting = session.waitingList.find((w) => w.userId.toString() === userId);
      if (alreadyWaiting) return res.status(400).json({ success: false, message: "Already on waiting list" });
      session.waitingList.push({ userId, joinedAt: new Date() });
      await session.save();
      return res.json({ success: true, message: "Added to waiting list", waiting: true, session });
    }

    const qrToken = generateQrToken();
    session.attendees.push({ userId, bookedAt: new Date(), status: "booked", qrToken });
    await session.save();
    res.status(201).json({ success: true, message: "Booked successfully", qrToken, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/:id/cancel/:userId", async (req, res) => {
  try {
    const session = await ClassSession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: "Class not found" });

    const attendee = session.attendees.find(
      (a) => a.userId.toString() === req.params.userId && a.status === "booked",
    );
    if (!attendee) return res.status(400).json({ success: false, message: "No active booking found" });

    attendee.status = "cancelled";
    attendee.qrToken = undefined;

    if (session.waitingList.length > 0) {
      const next = session.waitingList.shift();
      const qrToken = generateQrToken();
      session.attendees.push({ userId: next.userId, bookedAt: new Date(), status: "booked", qrToken });
    }

    await session.save();
    res.json({ success: true, message: "Booking cancelled", session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/:id/attendance",
  [body("qrToken").notEmpty().withMessage("qrToken is required"), validate],
  async (req, res) => {
  try {
    const { qrToken } = req.body;
    if (!qrToken) return res.status(400).json({ success: false, message: "qrToken is required" });

    const session = await ClassSession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: "Class not found" });

    const attendee = session.attendees.find((a) => a.qrToken === qrToken && a.status === "booked");
    if (!attendee) return res.status(400).json({ success: false, message: "Invalid or already used QR code" });

    attendee.status = "attended";
    attendee.attendedAt = new Date();
    attendee.qrToken = undefined;
    await session.save();

    res.json({ success: true, message: "Attendance marked", session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/user/:userId/bookings", async (req, res) => {
  try {
    const sessions = await ClassSession.find({
      "attendees.userId": req.params.userId,
    })
      .populate("trainerId", "name employeeCode")
      .sort({ date: 1 });
    const bookings = sessions.flatMap((s) => {
      const userAttendees = s.attendees.filter((a) => a.userId.toString() === req.params.userId);
      return userAttendees.map((a) => ({
        _id: a._id,
        classId: s._id,
        title: s.title,
        trainer: s.trainerId,
        date: s.date,
        time: s.time,
        duration: s.duration,
        location: s.location,
        status: a.status,
        qrToken: a.qrToken,
        bookedAt: a.bookedAt,
        attendedAt: a.attendedAt,
      }));
    });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/trainers/list", async (req, res) => {
  try {
    const User = require("../model/User");
    const trainers = await User.find({ role: "Trainer" }).select("name employeeCode email phone profileImage");
    res.json({ success: true, trainers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
