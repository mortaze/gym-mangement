// backend/config/connectDB.js

const mongoose = require("mongoose");
const logger = require("../lib/logger");

// لاگ گرفتن از کوئری‌های mongoose
mongoose.set("debug", function (collectionName, method, query, doc) {
  logger.debug(`MONGO ${collectionName}.${method}`, {
    query,
    doc,
  });
});

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info("✅ MongoDB connected successfully");

    // لاگ وضعیت اتصال
    mongoose.connection.on("error", (err) => {
      logger.error("❌ MongoDB runtime error", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("⚠️ MongoDB disconnected");
    });
  } catch (err) {
    logger.error("❌ MongoDB connection failed", {
      message: err.message,
      stack: err.stack,
    });
    process.exit(1);
  }
};

module.exports = connectDB;
