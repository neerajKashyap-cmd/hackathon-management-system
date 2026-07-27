const express = require("express");
const router = express.Router();
const {
  createHackathon,
  getMyHackathons,
  editHackathon,
  deleteHackathon,
  toggleRegistration,
} = require("../controllers/organizerController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/hackathons", protect, authorizeRoles("organizer"), createHackathon);
router.get("/hackathons", protect, authorizeRoles("organizer"), getMyHackathons);
router.put("/hackathons/:id", protect, authorizeRoles("organizer"), editHackathon);
router.delete("/hackathons/:id", protect, authorizeRoles("organizer"), deleteHackathon);
router.patch("/hackathons/:id/registration", protect, authorizeRoles("organizer"), toggleRegistration);

module.exports = router;
