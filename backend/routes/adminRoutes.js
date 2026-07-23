const express = require("express");
const router = express.Router();
const { createEvent, getEvents } = require("../controllers/adminController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/events", protect, authorizeRoles("admin"), createEvent);
router.get("/events", protect, getEvents);

module.exports = router;