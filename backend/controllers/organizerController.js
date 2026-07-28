const Event = require("../models/Event");
const Team = require("../models/team");
const Submission = require("../models/Submission");
const User = require("../models/user");
const { sendAnnouncementEmail } = require("../utils/emailService");

// Helper: check ownership
const findOwnHackathon = async (hackathonId, userId) => {
  const hackathon = await Event.findById(hackathonId);
  if (!hackathon) return { error: "Hackathon not found", status: 404 };
  if (hackathon.organizer.toString() !== userId.toString()) {
    return { error: "You can only manage hackathons you created", status: 403 };
  }
  return { hackathon };
};

// @desc    Create a new hackathon (organizer only)
// @route   POST /api/organizer/hackathons
const createHackathon = async (req, res) => {
  try {
    const {
      title,
      tagline,
      theme,
      description,
      rules,
      mode,
      venue,
      bannerImage,
      prizePool,
      maxTeamSize,
      registrationDeadline,
      submissionDeadline,
      judgingCriteria,
    } = req.body;

    if (!title || !registrationDeadline || !submissionDeadline) {
      return res.status(400).json({ message: "Title, registration deadline, and submission deadline are required" });
    }

    const defaultCriteria = [
      { name: "Innovation", maxScore: 10 },
      { name: "Technical Complexity", maxScore: 10 },
      { name: "User Interface", maxScore: 10 },
      { name: "Functionality", maxScore: 10 },
      { name: "Scalability", maxScore: 10 },
      { name: "Documentation", maxScore: 10 },
      { name: "Presentation", maxScore: 10 },
    ];

    const fallbackBanner = "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80";

    const hackathon = await Event.create({
      title,
      tagline: tagline || "",
      theme: theme || "AI & Web Development",
      description: description || "",
      rules: rules || "",
      mode: mode || "Online",
      venue: venue || "Virtual",
      bannerImage: bannerImage && bannerImage.trim() ? bannerImage : fallbackBanner,
      prizePool: prizePool || "$10,000",
      maxTeamSize: maxTeamSize || 4,
      registrationDeadline,
      submissionDeadline,
      organizer: req.user._id,
      judgingCriteria: judgingCriteria && judgingCriteria.length > 0 ? judgingCriteria : defaultCriteria,
    });

    // Send Broadcast Email Announcement to all registered users asynchronously
    User.find({ isEmailVerified: true })
      .select("email")
      .then((users) => {
        const emails = users.map((u) => u.email).filter(Boolean);
        if (emails.length > 0) {
          sendAnnouncementEmail(
            emails,
            `New Hackathon Launched: ${title}`,
            `🚀 ${title} is Live on HackSphere!`,
            `<p>Host: <strong>${req.user.name}</strong></p>
             <p>${description || tagline || "Register your team now and win prize pool awards!"}</p>
             <p>Prize Pool: <strong>${hackathon.prizePool}</strong> | Mode: <strong>${hackathon.mode}</strong></p>`
          );
        }
      })
      .catch((err) => console.error("Error fetching users for broadcast:", err));

    res.status(201).json(hackathon);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get hackathons created by logged-in organizer
// @route   GET /api/organizer/hackathons
const getMyHackathons = async (req, res) => {
  try {
    const hackathons = await Event.find({ organizer: req.user._id })
      .populate("assignedJudges", "name email avatar skills")
      .sort({ createdAt: -1 });
    res.json(hackathons);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Edit hackathon
// @route   PUT /api/organizer/hackathons/:id
const editHackathon = async (req, res) => {
  try {
    const { hackathon, error, status } = await findOwnHackathon(req.params.id, req.user._id);
    if (error) return res.status(status).json({ message: error });

    const fields = [
      "title",
      "tagline",
      "theme",
      "description",
      "rules",
      "mode",
      "venue",
      "bannerImage",
      "prizePool",
      "maxTeamSize",
      "registrationDeadline",
      "submissionDeadline",
      "status",
      "judgingCriteria",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        hackathon[field] = req.body[field];
      }
    });

    await hackathon.save();
    res.json(hackathon);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete hackathon
// @route   DELETE /api/organizer/hackathons/:id
const deleteHackathon = async (req, res) => {
  try {
    const { hackathon, error, status } = await findOwnHackathon(req.params.id, req.user._id);
    if (error) return res.status(status).json({ message: error });

    await hackathon.deleteOne();
    res.json({ message: "Hackathon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Toggle registration open/close
// @route   PATCH /api/organizer/hackathons/:id/registration
const toggleRegistration = async (req, res) => {
  try {
    const { hackathon, error, status } = await findOwnHackathon(req.params.id, req.user._id);
    if (error) return res.status(status).json({ message: error });

    hackathon.registrationOpen = typeof req.body.isOpen === "boolean" ? req.body.isOpen : !hackathon.registrationOpen;
    await hackathon.save();
    res.json(hackathon);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all teams & submissions registered for a hackathon
// @route   GET /api/organizer/hackathons/:id/registrations
const getHackathonRegistrations = async (req, res) => {
  try {
    const { hackathon, error, status } = await findOwnHackathon(req.params.id, req.user._id);
    if (error) return res.status(status).json({ message: error });

    const teams = await Team.find({ hackathon: req.params.id })
      .populate("leader", "name email avatar")
      .populate("members", "name email avatar")
      .populate("assignedJudges", "name email");

    const teamsWithSubmissions = await Promise.all(
      teams.map(async (t) => {
        const submission = await Submission.findOne({ team: t._id });
        return {
          ...t.toObject(),
          submission: submission || null,
        };
      })
    );

    res.json(teamsWithSubmissions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Approve or reject team registration
// @route   PATCH /api/organizer/teams/:teamId/status
const updateTeamStatus = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    team.status = status;
    await team.save();

    res.json(team);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Assign judge to a team
// @route   POST /api/organizer/teams/:teamId/assign-judge
const assignJudgeToTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { judgeId } = req.body;

    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const judge = await User.findById(judgeId);
    if (!judge || judge.role !== "judge") {
      return res.status(400).json({ message: "Invalid judge user" });
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

// @desc    Get all available platform users with judge role
// @route   GET /api/organizer/judges
const getAllAvailableJudges = async (req, res) => {
  try {
    const judges = await User.find({ role: "judge" }).select("name email avatar skills");
    res.json(judges);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Assign judge to a hackathon
// @route   POST /api/organizer/hackathons/:id/judges
const assignJudgeToHackathon = async (req, res) => {
  try {
    const { hackathon, error, status } = await findOwnHackathon(req.params.id, req.user._id);
    if (error) return res.status(status).json({ message: error });

    const { judgeId } = req.body;
    const judge = await User.findById(judgeId);
    if (!judge || judge.role !== "judge") {
      return res.status(400).json({ message: "Selected user is not a judge" });
    }

    if (!hackathon.assignedJudges.includes(judgeId)) {
      hackathon.assignedJudges.push(judgeId);
      await hackathon.save();
    }

    const updatedHackathon = await Event.findById(hackathon._id).populate("assignedJudges", "name email avatar skills");
    res.json(updatedHackathon);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Remove/Delete judge from a hackathon
// @route   DELETE /api/organizer/hackathons/:id/judges/:judgeId
const removeJudgeFromHackathon = async (req, res) => {
  try {
    const { hackathon, error, status } = await findOwnHackathon(req.params.id, req.user._id);
    if (error) return res.status(status).json({ message: error });

    const { judgeId } = req.params;
    hackathon.assignedJudges = hackathon.assignedJudges.filter(
      (j) => j.toString() !== judgeId.toString()
    );

    await hackathon.save();
    const updatedHackathon = await Event.findById(hackathon._id).populate("assignedJudges", "name email avatar skills");
    res.json(updatedHackathon);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Publish results and announce winners
// @route   POST /api/organizer/hackathons/:id/publish-results
const publishResults = async (req, res) => {
  try {
    const { hackathon, error, status } = await findOwnHackathon(req.params.id, req.user._id);
    if (error) return res.status(status).json({ message: error });

    // Check if at least ONE team has submitted a project
    const submittedCount = await Submission.countDocuments({ hackathon: hackathon._id });
    if (submittedCount === 0) {
      return res.status(400).json({
        message: "Cannot publish results: At least 1 team must submit a project first before results can be declared.",
      });
    }

    const { winners } = req.body; // array of { team, position, awardTitle }

    hackathon.resultsPublished = true;
    hackathon.status = "completed";
    if (Array.isArray(winners)) {
      hackathon.winners = winners;
    }

    await hackathon.save();

    // Automatically update status of all submitted projects in this hackathon to "approved" (evaluated)
    const teamsInHackathon = await Team.find({ hackathon: hackathon._id }).select("_id");
    const teamIdsInHackathon = teamsInHackathon.map((t) => t._id);
    await Submission.updateMany({ team: { $in: teamIdsInHackathon } }, { status: "approved" });

    // Broadcast email notification to all registered users
    User.find({ isEmailVerified: true })
      .select("email")
      .then((users) => {
        const emails = users.map((u) => u.email).filter(Boolean);
        if (emails.length > 0) {
          sendAnnouncementEmail(
            emails,
            `Winners Declared: ${hackathon.title}`,
            `🏆 Results Published for ${hackathon.title}!`,
            `<p>The organizer has declared final scores and published the leaderboard!</p>
             <p>Head to the Leaderboard page to view the winning teams and claim digital verification certificates.</p>`
          );
        }
      })
      .catch((err) => console.error("Error broadcasting results email:", err));

    res.json(hackathon);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createHackathon,
  getMyHackathons,
  editHackathon,
  deleteHackathon,
  toggleRegistration,
  getHackathonRegistrations,
  updateTeamStatus,
  assignJudgeToTeam,
  getAllAvailableJudges,
  assignJudgeToHackathon,
  removeJudgeFromHackathon,
  publishResults,
  findOwnHackathon,
};
