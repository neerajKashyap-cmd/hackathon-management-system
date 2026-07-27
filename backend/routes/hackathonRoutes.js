const express = require("express");
const router = express.Router();
const { getAllHackathons, getHackathonById } = require("../controllers/hackathonController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getAllHackathons);
router.get("/:id", protect, getHackathonById);

module.exports = router;
