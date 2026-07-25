const express = require("express");
const router = express.Router();
const { submitScore, getAssignedTeams, getLeaderboard } = require("../controllers/judgingController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/score", protect, authorizeRoles("judge"), submitScore);
router.get("/assigned-teams", protect, authorizeRoles("judge"), getAssignedTeams);
router.get("/leaderboard", protect, getLeaderboard);

module.exports = router;
