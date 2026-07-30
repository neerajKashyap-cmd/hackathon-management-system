const mongoose = require("mongoose");
const Team = require("../models/Team");
const User = require("../models/User");
const Event = require("../models/Event");
const Submission = require("../models/Submission");

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

    const userIdStr = req.user._id.toString();

    if (hackathonId) {
      const hackathon = await Event.findById(hackathonId);
      if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });
      if (!hackathon.registrationOpen) {
        return res.status(400).json({ message: "Registration for this hackathon is closed" });
      }

      // Check if user is already in a team for this hackathon
      const allHackathonTeams = await Team.find({ hackathon: hackathonId }).lean();
      const existingTeam = allHackathonTeams.find((t) => {
        const isLeader = t.leader?.toString() === userIdStr;
        const isMember = (t.members || []).some((m) => m?.toString() === userIdStr);
        return isLeader || isMember;
      });

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
      .populate("hackathon", "title theme bannerImage registrationDeadline submissionDeadline status maxTeamSize mode venue")
      .lean();

    const sub = await Submission.findOne({ team: team._id }).lean();

    res.status(201).json({
      ...populated,
      hackathon: populated.hackathon || { title: "Registered Hackathon", theme: "General" },
      submission: sub || null,
    });
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

    const userIdStr = req.user._id.toString();

    if (team.hackathon) {
      const allHackathonTeams = await Team.find({ hackathon: team.hackathon._id }).lean();
      const existingTeam = allHackathonTeams.find((t) => {
        const isLeader = t.leader?.toString() === userIdStr;
        const isMember = (t.members || []).some((m) => m?.toString() === userIdStr);
        return isLeader || isMember;
      });

      if (existingTeam) {
        return res.status(400).json({ message: "You are already in a team for this hackathon" });
      }

      if (team.members.length >= (team.hackathon.maxTeamSize || 4)) {
        return res.status(400).json({ message: `Team is full (Max team size is ${team.hackathon.maxTeamSize || 4})` });
      }
    }

    if (!team.members.some((m) => m.toString() === userIdStr)) {
      team.members.push(req.user._id);
      await team.save();
    }

    req.user.team = team._id;
    await req.user.save();

    const populated = await Team.findById(team._id)
      .populate("leader", "name email avatar")
      .populate("members", "name email avatar")
      .populate("hackathon", "title theme bannerImage registrationDeadline submissionDeadline status maxTeamSize mode venue")
      .lean();

    const sub = await Submission.findOne({ team: team._id }).lean();

    res.json({
      ...populated,
      hackathon: populated.hackathon || { title: "Registered Hackathon", theme: "General" },
      submission: sub || null,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user's active teams with submissions
// @route   GET /api/teams/my & GET /api/teams/my-teams
const getMyTeam = async (req, res) => {
  try {
    const userIdStr = req.user._id.toString();
    const userEmail = req.user.email ? req.user.email.toLowerCase().trim() : "";

    const allTeams = await Team.find()
      .populate("leader", "name email avatar")
      .populate("members", "name email avatar")
      .populate("hackathon", "title theme bannerImage registrationDeadline submissionDeadline status maxTeamSize mode venue")
      .populate("assignedJudges", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const userTeams = allTeams.filter((t) => {
      const isLeader =
        t.leader?._id?.toString() === userIdStr ||
        t.leader?.toString() === userIdStr ||
        (userEmail && t.leader?.email?.toLowerCase().trim() === userEmail);

      const isMember = (t.members || []).some(
        (m) =>
          m?._id?.toString() === userIdStr ||
          m?.toString() === userIdStr ||
          (userEmail && m?.email?.toLowerCase().trim() === userEmail)
      );

      return isLeader || isMember;
    });

    const teams = await Promise.all(
      userTeams.map(async (t) => {
        let hackathonDoc = t.hackathon;
        if (!hackathonDoc && t.hackathon) {
          try {
            hackathonDoc = await Event.findById(t.hackathon)
              .select("title theme bannerImage registrationDeadline submissionDeadline status maxTeamSize mode venue")
              .lean();
          } catch (e) {}
        }

        const sub = await Submission.findOne({ team: t._id }).lean();

        return {
          ...t,
          hackathon: hackathonDoc || { title: "Registered Hackathon", theme: "General" },
          submission: sub || null,
        };
      })
    );

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