const fs = require("fs");
const path = require("path");

const isVercel = Boolean(process.env.VERCEL || process.env.NOW_REGION);

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const resolveRoot = (envName, fallback) => path.resolve(process.env[envName] || fallback);

const uploadRoot = resolveRoot(
  "UPLOAD_ROOT",
  isVercel ? path.join("/tmp", "uploads") : path.join(__dirname, "..", "uploads"),
);

const imageRoot = resolveRoot(
  "IMAGE_UPLOAD_ROOT",
  isVercel ? path.join("/tmp", "images") : path.join(__dirname, "..", "public", "images"),
);

const documentRoot = resolveRoot(
  "DOCUMENT_UPLOAD_ROOT",
  isVercel ? path.join("/tmp", "documents") : path.join(__dirname, "..", "public", "documents"),
);

const getUploadDir = (subFolder = "") => ensureDir(path.join(uploadRoot, subFolder));
const getImageUploadDir = (subFolder = "") => ensureDir(path.join(imageRoot, subFolder));
const getDocumentUploadDir = (subFolder = "") => ensureDir(path.join(documentRoot, subFolder));

module.exports = {
  ensureDir,
  uploadRoot,
  imageRoot,
  documentRoot,
  getUploadDir,
  getImageUploadDir,
  getDocumentUploadDir,
};
