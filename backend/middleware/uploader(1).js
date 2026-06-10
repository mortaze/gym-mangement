// backend/middleware/uploader.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// مسیر پیش‌فرض ذخیره عکس‌ها
const baseUploadDir = path.join(__dirname, "../../frontend/public/images");

/**
 * تابعی که یک uploader با پوشه دلخواه می‌سازد
 * @param {string} subFolder مسیر فرعی (مثل "users" یا "products")
 * @returns multer instance
 */
const createUploader = (subFolder = "") => {
  // مسیر کامل ذخیره فایل
  const uploadDir = path.join(baseUploadDir, subFolder);

  // اگر پوشه وجود ندارد، بساز
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // تنظیمات ذخیره‌سازی
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname)); // حفظ پسوند اصلی
    },
  });

  // ساخت uploader با فیلتر نوع فایل و محدودیت حجم
  const uploader = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const allowedExt = /png|jpg|jpeg|webp/;
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowedExt.test(ext)) {
        cb(null, true);
      } else {
        cb(new Error("فایل باید تصویر با فرمت png/jpg/jpeg/webp باشد"));
      }
    },
    limits: {
      fileSize: 4 * 1024 * 1024, // ۴ مگابایت
    },
  });

  // برگشت یک آبجکت شامل متدهای استاندارد multer
  return {
    single: (fieldName) => uploader.single(fieldName),
    array: (fieldName, maxCount) => uploader.array(fieldName, maxCount),
    fields: (fields) => uploader.fields(fields),
    any: () => uploader.any(),
  };
};

module.exports = createUploader;
