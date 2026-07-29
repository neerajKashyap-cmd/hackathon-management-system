const Event = require("../models/Event");
const Team = require("../models/team");
const User = require("../models/user");
const Submission = require("../models/Submission");

// @desc    Get system platform analytics (admin only)
// @route   GET /api/admin/stats
const getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalHackathons = await Event.countDocuments();
    const totalTeams = await Team.countDocuments();
    const totalSubmissions = await Submission.countDocuments();

    const participants = await User.countDocuments({ role: "participant" });
    const organizers = await User.countDocuments({ role: "organizer" });
    const judges = await User.countDocuments({ role: "judge" });
    const admins = await User.countDocuments({ role: "admin" });

    res.json({
      totalUsers,
      totalHackathons,
      totalTeams,
      totalSubmissions,
      roleCounts: {
        participants,
        organizers,
        judges,
        admins,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all users with search & role filter (admin only)
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role && role !== "All") {
      query.role = role;
    }

    const users = await User.find(query).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update user role (admin only)
// @route   PATCH /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["participant", "judge", "organizer", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.json({ message: "User role updated", user: { _id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Block or Unblock user (admin only)
// @route   PATCH /api/admin/users/:id/block
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    user.isBlocked = typeof req.body.isBlocked === "boolean" ? req.body.isBlocked : !user.isBlocked;
    await user.save();

    res.json({ message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`, isBlocked: user.isBlocked });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete yourself" });
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all judges
// @route   GET /api/admin/judges
const getJudges = async (req, res) => {
  try {
    const judges = await User.find({ role: "judge" }).select("name email avatar");
    res.json(judges);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all organizers
// @route   GET /api/admin/organizers
const getOrganizers = async (req, res) => {
  try {
    const organizers = await User.find({ role: "organizer" }).select("name email avatar");
    res.json(organizers);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all teams for admin
// @route   GET /api/admin/teams
const getTeamsForAdmin = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("leader", "name email avatar")
      .populate("members", "name email avatar")
      .populate("hackathon", "title theme")
      .populate("assignedJudges", "name email");
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete any hackathon (admin override)
// @route   DELETE /api/admin/hackathons/:id
const deleteHackathonAdmin = async (req, res) => {
  try {
    const hackathon = await Event.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    await hackathon.deleteOne();
    res.json({ message: "Hackathon deleted by admin" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getPlatformStats,
  getAllUsers,
  updateUserRole,
  toggleBlockUser,
  deleteUser,
  getJudges,
  getOrganizers,
  getTeamsForAdmin,
  deleteHackathonAdmin,
};
