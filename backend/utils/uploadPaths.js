const fs = require("fs");
const path = require("path");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const resolveRoot = (envName, fallback) =>
  path.resolve(process.env[envName] || fallback);

const uploadRoot = resolveRoot("UPLOAD_ROOT", path.join("/tmp", "uploads"));

const imageRoot = resolveRoot("IMAGE_UPLOAD_ROOT", path.join("/tmp", "images"));

const documentRoot = resolveRoot(
  "DOCUMENT_UPLOAD_ROOT",
  path.join("/tmp", "documents"),
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
