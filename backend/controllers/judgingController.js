const Score = require("../models/Score");
const Team = require("../models/Team");
const Submission = require("../models/Submission");

// @desc    Submit or update a score for a team (judge only)
// @route   POST /api/judging/score
const submitScore = async (req, res) => {
  try {
    const { teamId, innovation, technical, presentation, impact, feedback } = req.body;

    if ([innovation, technical, presentation, impact].some((v) => v === undefined)) {
      return res.status(400).json({ message: "All four score fields are required (0-10 each)" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    let score = await Score.findOne({ team: teamId, judge: req.user._id });

    if (score) {
      Object.assign(score, { innovation, technical, presentation, impact, feedback });
      await score.save();
    } else {
      score = await Score.create({
        team: teamId,
        judge: req.user._id,
        innovation,
        technical,
        presentation,
        impact,
        feedback,
      });
    }

    res.status(201).json(score);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get teams this judge should score (assigned teams, or all teams with submissions if none assigned)
// @route   GET /api/judging/assigned-teams
const getAssignedTeams = async (req, res) => {
  try {
    const teamsWithAssignment = await Team.find({ assignedJudges: req.user._id });
    const teams = teamsWithAssignment.length > 0 ? teamsWithAssignment : await Team.find();

    const teamIds = teams.map((t) => t._id);
    const submissions = await Submission.find({ team: { $in: teamIds } });
    const myScores = await Score.find({ judge: req.user._id, team: { $in: teamIds } });

    const result = teams.map((team) => {
      const submission = submissions.find((s) => s.team.toString() === team._id.toString());
      const myScore = myScores.find((s) => s.team.toString() === team._id.toString());
      return {
        team: { _id: team._id, name: team.name },
        submission: submission || null,
        myScore: myScore || null,
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get leaderboard (average score per team, highest first)
// @route   GET /api/judging/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Score.aggregate([
      {
        $group: {
          _id: "$team",
          averageScore: { $avg: "$totalScore" },
          judgeCount: { $sum: 1 },
        },
      },
      { $sort: { averageScore: -1 } },
    ]);

    const populated = await Team.populate(leaderboard, { path: "_id", select: "name" });

    const formatted = populated.map((entry) => ({
      teamId: entry._id?._id,
      teamName: entry._id?.name || "Unknown Team",
      averageScore: Math.round(entry.averageScore * 10) / 10,
      judgeCount: entry.judgeCount,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { submitScore, getAssignedTeams, getLeaderboard };
