const Event = require("../models/Event");
const Team = require("../models/Team");
const User = require("../models/User");

// @desc    Create a hackathon event (admin only)
// @route   POST /api/admin/events
const createEvent = async (req, res) => {
  try {
    const { title, theme, description, rules, registrationDeadline, submissionDeadline } = req.body;

    if (!title || !registrationDeadline || !submissionDeadline) {
      return res.status(400).json({ message: "Title and deadlines are required" });
    }

    const event = await Event.create({
      title,
      theme,
      description,
      rules,
      registrationDeadline,
      submissionDeadline,
      organizer: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all events
// @route   GET /api/admin/events
const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Assign a judge to a team (admin only)
// @route   POST /api/admin/assign-judge
const assignJudge = async (req, res) => {
  try {
    const { teamId, judgeId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    if (!team.assignedJudges.includes(judgeId)) {
      team.assignedJudges.push(judgeId);
      await team.save();
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all users with role "judge" (admin only)
// @route   GET /api/admin/judges
const getJudges = async (req, res) => {
  try {
    const judges = await User.find({ role: "judge" }).select("name email");
    res.json(judges);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all teams with assigned judges populated (admin only)
// @route   GET /api/admin/teams
const getTeamsForAdmin = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("leader", "name email")
      .populate("members", "name email")
      .populate("assignedJudges", "name email");
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createEvent, getEvents, assignJudge, getJudges, getTeamsForAdmin };

