const TrainingRequest = require("../model/TrainingRequest");

// ایجاد یک درخواست جدید
const createRequest = async ({
  userId,
  trainerId,
  height,
  weight,
  photos,
  paymentMethod,
  amount,
  userNotes,
}) => {
  const request = new TrainingRequest({
    userId,
    trainerId,
    height,
    weight,
    photos,
    paymentMethod,
    amount,
    userNotes,
    status: "pending",
    history: [
      {
        by: "user",
        status: "pending",
        userNotes: userNotes || "",
      },
    ],
  });

  return await request.save();
};

// دریافت همه درخواست‌ها
const getAllRequests = async () => {
  return await TrainingRequest.find()
    .populate("userId", "name contactNumber profileImage")
    .populate("trainerId", "name contactNumber profileImage role")
    .sort({ createdAt: -1 });
};

// دریافت درخواست‌های یک کاربر
const getRequestsByUser = async (userId) => {
  return await TrainingRequest.find({ userId })
    .populate("trainerId", "name contactNumber profileImage role")
    .sort({ createdAt: -1 });
};

// دریافت درخواست‌های مربی
const getRequestsByTrainer = async (trainerId) => {
  return await TrainingRequest.find({ trainerId })
    .populate("userId", "name contactNumber profileImage")
    .sort({ createdAt: -1 });
};

// دریافت یک درخواست خاص
const getRequestById = async (id) => {
  return await TrainingRequest.findById(id)
    .populate("userId", "name contactNumber profileImage")
    .populate("trainerId", "name contactNumber profileImage role");
};

// بروزرسانی وضعیت، یادداشت‌ها یا برنامه تمرینی + ثبت در تاریخچه
const updateRequest = async (
  id,
  { status, userNotes, trainerNotes, trainingPlan, by }
) => {
  const request = await TrainingRequest.findById(id);
  if (!request) throw new Error("درخواست پیدا نشد");

  // بروزرسانی فیلدها
  if (status) request.status = status;
  if (userNotes) request.userNotes = userNotes;
  if (trainerNotes) request.trainerNotes = trainerNotes;
  if (trainingPlan) request.trainingPlan = trainingPlan;

  // اضافه کردن به تاریخچه
  request.history.push({
    date: new Date(),
    by,
    status: status || request.status,
    userNotes: userNotes || request.userNotes,
    trainerNotes: trainerNotes || request.trainerNotes,
    trainingPlan: trainingPlan || request.trainingPlan,
  });

  return await request.save();
};

// حذف درخواست
const deleteRequest = async (id) => {
  const request = await TrainingRequest.findById(id);
  if (!request) throw new Error("درخواست پیدا نشد");

  return await request.remove();
};

module.exports = {
  createRequest,
  getAllRequests,
  getRequestsByUser,
  getRequestsByTrainer,
  getRequestById,
  updateRequest,
  deleteRequest,
};
