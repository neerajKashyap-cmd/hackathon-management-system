const express = require("express");
const router = express.Router();
const {
  createTeam,
  joinTeam,
  getMyTeam,
  removeMember,
  transferLeadership,
  leaveTeam,
  deleteTeam,
} = require("../controllers/teamController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", createTeam);
router.post("/join", joinTeam);
router.get("/my", getMyTeam);
router.post("/:id/remove-member", removeMember);
router.post("/:id/transfer-leadership", transferLeadership);
router.post("/:id/leave", leaveTeam);
router.delete("/:id", deleteTeam);

module.exports = router;