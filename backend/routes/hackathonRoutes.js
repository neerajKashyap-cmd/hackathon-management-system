const express = require("express");
const router = express.Router();
const { getAllHackathons, getHackathonById, getHackathonLeaderboard } = require("../controllers/hackathonController");

router.get("/", getAllHackathons);
router.get("/:id", getHackathonById);
router.get("/:id/leaderboard", getHackathonLeaderboard);

module.exports = router;
