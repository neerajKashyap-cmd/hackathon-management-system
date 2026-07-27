const express = require("express");
const router = express.Router();
const { createAnnouncement, getAnnouncements } = require("../controllers/announcementController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", protect, authorizeRoles("admin"), createAnnouncement);
router.get("/", protect, getAnnouncements);

module.exports = router;
