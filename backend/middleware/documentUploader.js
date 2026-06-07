// backend/middleware/documentUploader.js

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// استفاده از پوشه موقت در سرورلس (Vercel friendly)
const baseUploadDir = path.join("/tmp", "documents");

/**
 * ساخت uploader برای فایل‌های سند
 */
const createDocumentUploader = (subFolder = "") => {
  const uploadDir = path.join(baseUploadDir, subFolder);

  // مهم: فقط داخل runtime ساخته شود
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  } catch (err) {
    console.error("Upload dir error:", err);
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix =
        Date.now() + "-" + Math.round(Math.random() * 1e9);

      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });

  const uploader = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const allowedExt = /zip|rar/;
      const ext = path.extname(file.originalname).toLowerCase();

      if (allowedExt.test(ext)) {
        cb(null, true);
      } else {
        cb(new Error("فایل فقط باید zip یا rar باشد"));
      }
    },
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB
    },
  });

  return {
    single: (fieldName) => uploader.single(fieldName),
  };
};

module.exports = createDocumentUploader;