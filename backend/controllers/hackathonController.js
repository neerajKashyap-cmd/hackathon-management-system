const Event = require("../models/Event");
const Team = require("../models/Team");
const Submission = require("../models/Submission");
const Score = require("../models/Score");

// @desc    Get all hackathons with search, filter (mode, status, theme)
// @route   GET /api/hackathons
const getAllHackathons = async (req, res) => {
  try {
    const { search, mode, status, theme } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { theme: { $regex: search, $options: "i" } },
      ];
    }

    if (mode && mode !== "All") {
      query.mode = mode;
    }

    if (status && status !== "All") {
      query.status = status;
    }

    if (theme && theme !== "All") {
      query.theme = { $regex: theme, $options: "i" };
    }

    const hackathons = await Event.find(query)
      .populate("organizer", "name email avatar")
      .sort({ createdAt: -1 });

    res.json(hackathons);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get a single hackathon by id with detailed info
// @route   GET /api/hackathons/:id
const getHackathonById = async (req, res) => {
  try {
    const hackathon = await Event.findById(req.params.id)
      .populate("organizer", "name email avatar")
      .populate({
        path: "winners.team",
        populate: { path: "leader", select: "name email" },
      });

    if (!hackathon) {
      return res.status(404).json({ message: "Hackathon not found" });
    }

    // Count teams registered for this hackathon
    const registeredTeamsCount = await Team.countDocuments({ hackathon: req.params.id });

    res.json({
      ...hackathon.toObject(),
      registeredTeamsCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get hackathon leaderboard based on average score of scores
// @route   GET /api/hackathons/:id/leaderboard
const getHackathonLeaderboard = async (req, res) => {
  try {
    const hackathonId = req.params.id;
    const hackathon = await Event.findById(hackathonId);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    // Fetch all teams registered in this hackathon
    const teams = await Team.find({ hackathon: hackathonId })
      .populate("leader", "name email")
      .populate("members", "name email");

    const leaderboardData = await Promise.all(
      teams.map(async (team) => {
        const submission = await Submission.findOne({ team: team._id, hackathon: hackathonId });
        const scores = await Score.find({ team: team._id });

        let totalScore = 0;
        let scoreBreakdown = {
          innovation: 0,
          technicalComplexity: 0,
          userInterface: 0,
          functionality: 0,
          scalability: 0,
          documentation: 0,
          presentation: 0,
        };

        if (scores.length > 0) {
          const sumScore = scores.reduce((acc, s) => acc + (s.totalScore || 0), 0);
          totalScore = Number((sumScore / scores.length).toFixed(2));

          // Average each criterion
          ["innovation", "technicalComplexity", "userInterface", "functionality", "scalability", "documentation", "presentation"].forEach((key) => {
            const sumKey = scores.reduce((acc, s) => acc + (s[key] || 0), 0);
            scoreBreakdown[key] = Number((sumKey / scores.length).toFixed(1));
          });
        }

        return {
          teamId: team._id,
          teamName: team.name,
          leader: team.leader,
          membersCount: team.members.length + 1,
          submission: submission
            ? {
                title: submission.title,
                repoLink: submission.repoLink,
                demoLink: submission.demoLink,
                techStack: submission.techStack,
                status: submission.status,
              }
            : null,
          totalScore,
          scoresCount: scores.length,
          scoreBreakdown,
        };
      })
    );

    // Sort descending by total score
    leaderboardData.sort((a, b) => b.totalScore - a.totalScore);

    // Assign rank
    leaderboardData.forEach((item, index) => {
      item.rank = index + 1;
    });

    res.json({
      hackathonTitle: hackathon.title,
      resultsPublished: hackathon.resultsPublished,
      leaderboard: leaderboardData,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getAllHackathons, getHackathonById, getHackathonLeaderboard };
