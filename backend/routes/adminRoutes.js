const express = require("express");
const router = express.Router();
const {
  getPlatformStats,
  getAllUsers,
  updateUserRole,
  toggleBlockUser,
  deleteUser,
  getJudges,
  getOrganizers,
  getTeamsForAdmin,
  deleteHackathonAdmin,
} = require("../controllers/adminController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Require logged-in admin
router.use(protect, authorizeRoles("admin"));

router.get("/stats", getPlatformStats);
router.get("/users", getAllUsers);
router.patch("/users/:id/role", updateUserRole);
router.patch("/users/:id/block", toggleBlockUser);
router.delete("/users/:id", deleteUser);

router.get("/judges", getJudges);
router.get("/organizers", getOrganizers);
router.get("/teams", getTeamsForAdmin);
router.delete("/hackathons/:id", deleteHackathonAdmin);

module.exports = router;
