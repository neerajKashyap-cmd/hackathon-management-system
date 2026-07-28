const express = require("express");
const router = express.Router();
const {
  createHackathon,
  getMyHackathons,
  editHackathon,
  deleteHackathon,
  toggleRegistration,
  getHackathonRegistrations,
  updateTeamStatus,
  assignJudgeToTeam,
  getAllAvailableJudges,
  assignJudgeToHackathon,
  removeJudgeFromHackathon,
  publishResults,
} = require("../controllers/organizerController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Require logged-in organizer or admin
router.use(protect, authorizeRoles("organizer", "admin"));

router.post("/hackathons", createHackathon);
router.get("/hackathons", getMyHackathons);
router.put("/hackathons/:id", editHackathon);
router.delete("/hackathons/:id", deleteHackathon);
router.patch("/hackathons/:id/registration", toggleRegistration);

router.get("/hackathons/:id/registrations", getHackathonRegistrations);
router.patch("/teams/:teamId/status", updateTeamStatus);
router.post("/teams/:teamId/assign-judge", assignJudgeToTeam);

// Judge Management Routes
router.get("/judges", getAllAvailableJudges);
router.post("/hackathons/:id/judges", assignJudgeToHackathon);
router.delete("/hackathons/:id/judges/:judgeId", removeJudgeFromHackathon);

router.post("/hackathons/:id/publish-results", publishResults);

module.exports = router;
