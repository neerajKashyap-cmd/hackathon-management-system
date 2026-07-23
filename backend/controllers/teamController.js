const Team = require("../models/Team");
const User = require("../models/User");

const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const createTeam = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Team name is required" });
    }

    if (req.user.team) {
      return res.status(400).json({ message: "You already belong to a team" });
    }

    const inviteCode = generateInviteCode();

    const team = await Team.create({
      name,
      inviteCode,
      leader: req.user._id,
      members: [req.user._id],
    });

    req.user.team = team._id;
    await req.user.save();

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const joinTeam = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    if (req.user.team) {
      return res.status(400).json({ message: "You already belong to a team" });
    }

    const team = await Team.findOne({ inviteCode: inviteCode?.toUpperCase() });

    if (!team) {
      return res.status(404).json({ message: "Invalid invite code" });
    }

    team.members.push(req.user._id);
    await team.save();

    req.user.team = team._id;
    await req.user.save();

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMyTeam = async (req, res) => {
  try {
    const team = await Team.findOne({ members: req.user._id })
      .populate("leader", "name email")
      .populate("members", "name email");

    if (!team) {
      return res.status(404).json({ message: "You are not part of any team yet" });
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("leader", "name email")
      .populate("members", "name email");
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createTeam, joinTeam, getMyTeam, getAllTeams };