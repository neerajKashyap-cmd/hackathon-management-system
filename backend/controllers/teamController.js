const Team = require("../models/Team");
const User = require("../models/User");
const Event = require("../models/Event");

const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// @desc    Create team for a specific hackathon
// @route   POST /api/teams
const createTeam = async (req, res) => {
  try {
    const { name, hackathonId } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Team name is required" });
    }

    if (hackathonId) {
      const hackathon = await Event.findById(hackathonId);
      if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });
      if (!hackathon.registrationOpen) {
        return res.status(400).json({ message: "Registration for this hackathon is closed" });
      }

      // Check if user already in a team for this hackathon
      const existingTeam = await Team.findOne({ hackathon: hackathonId, members: req.user._id });
      if (existingTeam) {
        return res.status(400).json({ message: "You are already in a team for this hackathon" });
      }
    }

    const inviteCode = generateInviteCode();

    const team = await Team.create({
      name,
      inviteCode,
      leader: req.user._id,
      members: [req.user._id],
      hackathon: hackathonId || null,
      status: "pending",
    });

    req.user.team = team._id;
    await req.user.save();

    const populated = await Team.findById(team._id)
      .populate("leader", "name email avatar")
      .populate("members", "name email avatar")
      .populate("hackathon", "title theme bannerImage");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Join team via invite code
// @route   POST /api/teams/join
const joinTeam = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) return res.status(400).json({ message: "Invite code is required" });

    const team = await Team.findOne({ inviteCode: inviteCode.trim().toUpperCase() }).populate("hackathon");

    if (!team) {
      return res.status(404).json({ message: "Invalid invite code" });
    }

    if (team.hackathon) {
      const existingTeam = await Team.findOne({ hackathon: team.hackathon._id, members: req.user._id });
      if (existingTeam) {
        return res.status(400).json({ message: "You are already in a team for this hackathon" });
      }

      if (team.members.length >= (team.hackathon.maxTeamSize || 4)) {
        return res.status(400).json({ message: `Team is full (Max team size is ${team.hackathon.maxTeamSize || 4})` });
      }
    }

    if (!team.members.includes(req.user._id)) {
      team.members.push(req.user._id);
      await team.save();
    }

    req.user.team = team._id;
    await req.user.save();

    const populated = await Team.findById(team._id)
      .populate("leader", "name email avatar")
      .populate("members", "name email avatar")
      .populate("hackathon", "title theme bannerImage");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user's active team
// @route   GET /api/teams/my
const getMyTeam = async (req, res) => {
  try {
    const teams = await Team.find({ members: req.user._id })
      .populate("leader", "name email avatar")
      .populate("members", "name email avatar")
      .populate("hackathon", "title theme bannerImage registrationDeadline submissionDeadline status")
      .populate("assignedJudges", "name email");

    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Remove member from team (Leader only)
// @route   POST /api/teams/:id/remove-member
const removeMember = async (req, res) => {
  try {
    const { memberId } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only team leader can remove members" });
    }

    if (memberId === team.leader.toString()) {
      return res.status(400).json({ message: "Leader cannot be removed. Transfer leadership first." });
    }

    team.members = team.members.filter((m) => m.toString() !== memberId);
    await team.save();

    const memberUser = await User.findById(memberId);
    if (memberUser && memberUser.team?.toString() === team._id.toString()) {
      memberUser.team = null;
      await memberUser.save();
    }

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Transfer team leadership
// @route   POST /api/teams/:id/transfer-leadership
const transferLeadership = async (req, res) => {
  try {
    const { newLeaderId } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.leader.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only current leader can transfer leadership" });
    }

    if (!team.members.map((m) => m.toString()).includes(newLeaderId)) {
      return res.status(400).json({ message: "New leader must be a member of the team" });
    }

    team.leader = newLeaderId;
    await team.save();

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Leave team
// @route   POST /api/teams/:id/leave
const leaveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.leader.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Leaders cannot leave the team. Transfer leadership or delete the team." });
    }

    team.members = team.members.filter((m) => m.toString() !== req.user._id.toString());
    await team.save();

    req.user.team = null;
    await req.user.save();

    res.json({ message: "Successfully left the team" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (team.leader.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Only team leader or admin can delete team" });
    }

    // Reset user team fields
    await User.updateMany({ team: team._id }, { $set: { team: null } });
    await team.deleteOne();

    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createTeam,
  joinTeam,
  getMyTeam,
  removeMember,
  transferLeadership,
  leaveTeam,
  deleteTeam,
};