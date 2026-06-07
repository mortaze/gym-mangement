// backend/middleware/requestLogger.js
import onFinished from "on-finished";
import { v4 as uuidv4 } from "uuid";
import logger from "../lib/logger.js"; // مسیر خودت را تنظیم کن

export function attachRequestId(req, res, next) {
  req.requestId = req.headers["x-request-id"] || uuidv4();
  res.setHeader("x-request-id", req.requestId);
  next();
}

export function requestLogger(req, res, next) {
  const start = process.hrtime();

  // لاگ ورودی
  logger.info(
    "REQ_START %s %s %s %o",
    req.method,
    req.originalUrl,
    req.requestId,
    {
      headers: req.headers,
      query: req.query,
      bodyPreview: tryPreview(req.body),
      user: req.user
        ? { id: req.user._id, role: req.user.role, email: req.user.email }
        : null,
    }
  );

  onFinished(res, function (err) {
    const diff = process.hrtime(start);
    const timeMs = diff[0] * 1000 + diff[1] / 1e6;
    logger.info(
      "REQ_FINISH %s %s %s %o",
      req.method,
      req.originalUrl,
      req.requestId,
      {
        statusCode: res.statusCode,
        responseTimeMs: Math.round(timeMs),
      }
    );
    if (err) logger.error("onFinished error: %o", err);
  });

  next();
}

function tryPreview(body) {
  try {
    if (!body) return null;
    // اگر body بزرگ است، فقط preview
    const str = JSON.stringify(body);
    return str.length > 2000
      ? JSON.parse(str.slice(0, 2000) + '..."[TRUNCATED]')
      : body;
  } catch (e) {
    return { error: "cannot stringify body" };
  }
}
