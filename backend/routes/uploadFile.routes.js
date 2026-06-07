// backend\routes\uploadFile.routes.js
const express = require("express");
const { fileUpload } = require("../controller/upload.controller");
const createUploader = require("../middleware/uploader");
const uploader = createUploader();

const router = express.Router();

// routes
router.post("/single", uploader.single("file"), fileUpload);

module.exports = router;
