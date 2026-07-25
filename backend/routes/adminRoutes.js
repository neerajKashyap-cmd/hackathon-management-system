const express = require("express");
const router = express.Router();
const { createEvent, getEvents, assignJudge, getJudges, getTeamsForAdmin } = require("../controllers/adminController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/events", protect, authorizeRoles("admin"), createEvent);
router.get("/events", protect, getEvents);
router.post("/assign-judge", protect, authorizeRoles("admin"), assignJudge);
router.get("/judges", protect, authorizeRoles("admin"), getJudges);
router.get("/teams", protect, authorizeRoles("admin"), getTeamsForAdmin);

module.exports = router;
