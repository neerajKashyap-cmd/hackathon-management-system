const Score = require("../models/Score");
const Team = require("../models/team");
const Submission = require("../models/Submission");
const Event = require("../models/Event");

// @desc    Submit or update score for a team
// @route   POST /api/judging/score
const submitScore = async (req, res) => {
  try {
    const {
      teamId,
      hackathonId,
      innovation,
      technicalComplexity,
      userInterface,
      functionality,
      scalability,
      documentation,
      presentation,
      feedback,
    } = req.body;

    if (!teamId) {
      return res.status(400).json({ message: "Team ID is required" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    let score = await Score.findOne({ team: teamId, judge: req.user._id });

    const scoreData = {
      team: teamId,
      hackathon: hackathonId || team.hackathon || null,
      judge: req.user._id,
      innovation: Number(innovation || 0),
      technicalComplexity: Number(technicalComplexity || 0),
      userInterface: Number(userInterface || 0),
      functionality: Number(functionality || 0),
      scalability: Number(scalability || 0),
      documentation: Number(documentation || 0),
      presentation: Number(presentation || 0),
      feedback: feedback || "",
    };

    if (score) {
      Object.assign(score, scoreData);
      await score.save();
    } else {
      score = await Score.create(scoreData);
    }

    // Also update submission status to under_review or approved
    const submission = await Submission.findOne({ team: teamId });
    if (submission && submission.status === "pending") {
      submission.status = "under_review";
      await submission.save();
    }

    res.status(201).json(score);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get teams assigned to this judge (ONLY teams with submitted projects)
// @route   GET /api/judging/assigned-teams
const getAssignedTeams = async (req, res) => {
  try {
    // Find hackathons where judge is assigned directly
    const assignedEvents = await Event.find({ assignedJudges: req.user._id });
    const assignedEventIds = assignedEvents.map((e) => e._id);

    let teams = await Team.find({
      $or: [
        { assignedJudges: req.user._id },
        { hackathon: { $in: assignedEventIds } },
      ],
    })
      .populate("leader", "name email avatar")
      .populate("members", "name email avatar")
      .populate("hackathon", "title theme");

    if (teams.length === 0) {
      teams = await Team.find()
        .populate("leader", "name email avatar")
        .populate("members", "name email avatar")
        .populate("hackathon", "title theme");
    }

    const teamIds = teams.map((t) => t._id);
    const submissions = await Submission.find({ team: { $in: teamIds } });
    const myScores = await Score.find({ judge: req.user._id, team: { $in: teamIds } });

    // Filter to ONLY return teams that have submitted a project!
    const result = teams
      .map((team) => {
        const submission = submissions.find((s) => s.team.toString() === team._id.toString());
        const myScore = myScores.find((s) => s.team.toString() === team._id.toString());
        return {
          team,
          submission: submission || null,
          myScore: myScore || null,
        };
      })
      .filter((item) => item.submission !== null);

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get global leaderboard
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

    const populated = await Team.populate(leaderboard, { path: "_id", select: "name hackathon leader" });

    const formatted = await Promise.all(
      populated.map(async (entry) => {
        const submission = entry._id ? await Submission.findOne({ team: entry._id._id }) : null;
        return {
          teamId: entry._id?._id,
          teamName: entry._id?.name || "Unknown Team",
          averageScore: Math.round(entry.averageScore * 10) / 10,
          judgeCount: entry.judgeCount,
          submission: submission
            ? {
                title: submission.title,
                repoLink: submission.repoLink,
                demoLink: submission.demoLink,
                techStack: submission.techStack,
              }
            : null,
        };
      })
    );

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { submitScore, getAssignedTeams, getLeaderboard };
