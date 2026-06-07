// backend/lib/logger.js

const winston = require("winston");

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
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === "production"
          ? winston.format.combine(
              winston.format.timestamp(),
              winston.format.json()
            )
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.timestamp(),
              winston.format.printf(
                ({ timestamp, level, message }) =>
                  `${timestamp} ${level}: ${message}`
              )
            ),
    }),
  ],
});

// تضمین وجود متدها
logger.debug =
  typeof logger.debug === "function"
    ? logger.debug.bind(logger)
    : (...args) => console.debug(...args);

logger.info =
  typeof logger.info === "function"
    ? logger.info.bind(logger)
    : (...args) => console.info(...args);

logger.warn =
  typeof logger.warn === "function"
    ? logger.warn.bind(logger)
    : (...args) => console.warn(...args);

logger.error =
  typeof logger.error === "function"
    ? logger.error.bind(logger)
    : (...args) => console.error(...args);

module.exports = logger;