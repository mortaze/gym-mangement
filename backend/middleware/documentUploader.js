// backend/middleware/documentUploader.js

const multer = require("multer");
const path = require("path");
const { getDocumentUploadDir } = require("../utils/uploadPaths");

/**
 * ساخت uploader برای فایل‌های سند
 */
const createDocumentUploader = (subFolder = "") => {
  const uploadDir = getDocumentUploadDir(subFolder);

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