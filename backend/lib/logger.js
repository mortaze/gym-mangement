// backend/lib/logger.js
const winston = require("winston");
const path = require("path");
const fs = require("fs");

// مسیر پوشه لاگ‌ها
const logDir = path.join(process.cwd(), "logs");
// اگر وجود ندارد، ایجاد کن
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const level = process.env.LOG_LEVEL || "debug";

const logger = winston.createLogger({
  level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    // فایل لاگ خطاها
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
    // فایل لاگ ترکیبی (info + debug)
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

// در محیط توسعه لاگ به کنسول هم نوشته شود (خواناتر)
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// تضمین وجود متدهای مورد انتظار (ایمن‌سازی)
if (typeof logger.debug !== "function")
  logger.debug = (...args) => console.debug(...args);
if (typeof logger.info !== "function")
  logger.info = (...args) => console.info(...args);
if (typeof logger.warn !== "function")
  logger.warn = (...args) => console.warn(...args);
if (typeof logger.error !== "function")
  logger.error = (...args) => console.error(...args);

module.exports = logger;
