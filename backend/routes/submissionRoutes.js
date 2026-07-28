const express = require("express");
const router = express.Router();
const {
  createOrUpdateSubmission,
  getMySubmission,
  getPublicGallery,
  getAllSubmissions,
} = require("../controllers/submissionController");
const { protect } = require("../middleware/authMiddleware");

router.get("/gallery", getPublicGallery);
router.use(protect);
router.post("/", createOrUpdateSubmission);
router.get("/my", getMySubmission);
router.get("/", getAllSubmissions);

module.exports = router;
