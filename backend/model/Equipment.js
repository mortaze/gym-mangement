const mongoose = require("mongoose");

/**
 * لاگ سرویس و تعمیرات
 */
const maintenanceLogSchema = new mongoose.Schema(
  {
    // تاریخ انجام سرویس (شمسی)
    date: {
      type: String,
      required: true,
      match: [/^\d{4}\/\d{2}\/\d{2}$/, "Date must be in YYYY/MM/DD format"],
    },

    // نوع اقدام (سرویس، تعمیر، تعویض قطعه و ...)
    action: {
      type: String,
      required: true,
      trim: true,
    },

    // انجام شده توسط
    performedBy: {
      type: String,
      trim: true,
    },

    // هزینه سرویس
    cost: {
      type: Number,
      min: 0,
      default: 0,
    },

    // وضعیت دستگاه بعد از سرویس
    statusAfterService: {
      type: String,
      enum: ["Operational", "NeedsRepair", "OutOfService"],
      default: "Operational",
    },
  },
  { _id: false },
);

/**
 * مدل تجهیزات
 */
const equipmentSchema = new mongoose.Schema(
  {
    // کد یکتای دستگاه (مثل EQ-401)
    equipmentCode: {
      type: String,
      required: [true, "Equipment code is required"],
      unique: true,
      trim: true,
      match: [/^EQ-\d+$/, "Equipment code must be like EQ-401"],
    },

    // نام دستگاه
    name: {
      type: String,
      required: [true, "Equipment name is required"],
      trim: true,
    },

    // برند سازنده
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },

    // مدل دستگاه
    model: {
      type: String,
      trim: true,
    },

    // شاخص سلامت (۰ تا ۱۰۰)
    healthIndex: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },

    // آخرین تاریخ سرویس
    lastServiceDate: {
      type: String,
    },

    // وضعیت عملیاتی
    operationalStatus: {
      type: String,
      enum: ["Operational", "NeedsRepair", "OutOfService"],
      default: "Operational",
      index: true,
    },

    // محل قرارگیری دستگاه (سالن بدنسازی، هوازی و ...)
    location: {
      type: String,
      trim: true,
    },

    // تاریخ خرید
    purchaseDate: {
      type: String,
    },

    // پایان گارانتی
    warrantyEndDate: {
      type: String,
    },

    // توضیحات تکمیلی
    notes: {
      type: String,
      trim: true,
    },

    // تاریخچه سرویس‌ها
    maintenanceLogs: {
      type: [maintenanceLogSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

// ایندکس‌ها
equipmentSchema.index({ brand: 1 });
equipmentSchema.index({ equipmentCode: 1 });

const Equipment = mongoose.model("Equipment", equipmentSchema);
module.exports = Equipment;
