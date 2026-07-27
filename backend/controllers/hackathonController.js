const Event = require("../models/Event");

// @desc    Get all hackathons (any logged-in user can browse)
// @route   GET /api/hackathons
const getAllHackathons = async (req, res) => {
  try {
    const hackathons = await Event.find().populate("organizer", "name email").sort({ createdAt: -1 });
    res.json(hackathons);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get a single hackathon by id
// @route   GET /api/hackathons/:id
const getHackathonById = async (req, res) => {
  try {
    const hackathon = await Event.findById(req.params.id)
      .populate("organizer", "name email")
      .populate("winners.team", "name");
    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }
    res.json(hackathon);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAllHackathons, getHackathonById };
