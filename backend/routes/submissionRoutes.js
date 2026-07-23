const express = require("express");
const router = express.Router();
const {
  createOrUpdateSubmission,
  getMySubmission,
  getAllSubmissions,
} = require("../controllers/submissionController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", protect, createOrUpdateSubmission);
router.get("/my-submission", protect, getMySubmission);
router.get("/", protect, authorizeRoles("admin", "judge"), getAllSubmissions);

module.exports = router;