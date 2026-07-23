const express = require("express");
const router = express.Router();
const { createTeam, joinTeam, getMyTeam, getAllTeams } = require("../controllers/teamController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/", protect, createTeam);
router.post("/join", protect, joinTeam);
router.get("/my-team", protect, getMyTeam);
router.get("/", protect, authorizeRoles("admin", "judge"), getAllTeams);

module.exports = router;