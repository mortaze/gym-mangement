// backend\routes\uploadDocument.routes.js
const express = require("express");
const router = express.Router();
const createDocumentUploader = require("../middleware/documentUploader");

const uploadDocument = createDocumentUploader("property-documents");

router.post(
  "/upload-document",
  uploadDocument.single("documentFile"),
  (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "فایلی ارسال نشد" });
    }

    res.json({
      success: true,
      filePath: `/documents/property-documents/${req.file.filename}`,
    });
  }
);

module.exports = router;
