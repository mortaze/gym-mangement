// backend/config/db.js
const mongoose = require("mongoose");
const logger = require("../lib/logger");

mongoose.set("debug", function (collectionName, method, query, doc) {
  logger.debug(`MONGO ${collectionName}.${method}`, {
    query,
    doc,
  });
});

const DEFAULT_LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/gym-management";

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || DEFAULT_LOCAL_MONGO_URI;

  if (!process.env.MONGO_URI) {
    logger.warn(
      `MONGO_URI is not defined. Falling back to local MongoDB URI: ${DEFAULT_LOCAL_MONGO_URI}`,
    );
  }

  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: Number(process.env.MONGO_TIMEOUT_MS) || 10000,
    });

    logger.info("✅ MongoDB connected successfully");

    mongoose.connection.on("error", (err) => {
      logger.error("❌ MongoDB runtime error", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("⚠️ MongoDB disconnected");
    });

    return mongoose.connection;
  } catch (err) {
    logger.error("❌ MongoDB connection failed", {
      message: err.message,
      stack: err.stack,
    });
    throw err;
  }
};

module.exports = connectDB;
