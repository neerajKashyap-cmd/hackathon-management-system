const Submission = require("../models/Submission");
const Team = require("../models/team");
const Event = require("../models/Event");

// @desc    Create or Update project submission
// @route   POST /api/submissions
const createOrUpdateSubmission = async (req, res) => {
  try {
    const {
      teamId,
      title,
      problemStatement,
      solution,
      description,
      repoLink,
      demoLink,
      techStack,
      screenshots,
      presentationPdf,
      demoVideoLink,
    } = req.body;

    if (!title || !description || !repoLink) {
      return res.status(400).json({ message: "Project title, description, and repository link are required" });
    }

    let team;
    if (teamId) {
      team = await Team.findById(teamId);
    } else {
      team = await Team.findOne({ members: req.user._id });
    }

    if (!team) {
      return res.status(400).json({ message: "You must be a member or leader of a registered team to submit" });
    }

    // Check submission deadline & result publication status if hackathon is set
    if (team.hackathon) {
      const hackathon = await Event.findById(team.hackathon);
      if (hackathon) {
        if (hackathon.resultsPublished || hackathon.status === "completed") {
          return res.status(400).json({
            message: "Results have been announced for this hackathon. Project submissions can no longer be edited.",
          });
        }
        if (hackathon.submissionDeadline && new Date() > new Date(hackathon.submissionDeadline)) {
          return res.status(400).json({ message: "Submission deadline has passed. Submissions are closed." });
        }
      }
    }

    let submission = await Submission.findOne({ team: team._id });

    const formattedTechStack = Array.isArray(techStack)
      ? techStack
      : typeof techStack === "string"
      ? techStack.split(",").map((s) => s.trim())
      : [];

    const formattedScreenshots = Array.isArray(screenshots)
      ? screenshots
      : typeof screenshots === "string"
      ? screenshots.split(",").map((s) => s.trim())
      : [];

    if (submission) {
      submission.title = title;
      submission.problemStatement = problemStatement || submission.problemStatement;
      submission.solution = solution || submission.solution;
      submission.description = description;
      submission.repoLink = repoLink;
      submission.demoLink = demoLink || "";
      submission.techStack = formattedTechStack;
      submission.screenshots = formattedScreenshots;
      submission.presentationPdf = presentationPdf || "";
      submission.demoVideoLink = demoVideoLink || "";
      submission.submittedBy = req.user._id;
      submission.hackathon = team.hackathon || submission.hackathon;
      await submission.save();
    } else {
      submission = await Submission.create({
        team: team._id,
        hackathon: team.hackathon || null,
        title,
        problemStatement: problemStatement || "",
        solution: solution || "",
        description,
        repoLink,
        demoLink: demoLink || "",
        techStack: formattedTechStack,
        screenshots: formattedScreenshots,
        presentationPdf: presentationPdf || "",
        demoVideoLink: demoVideoLink || "",
        submittedBy: req.user._id,
        status: "pending",
      });
    }

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get user's team submissions (All teams user belongs to)
// @route   GET /api/submissions/my
const getMySubmission = async (req, res) => {
  try {
    const userTeams = await Team.find({ members: req.user._id });
    if (!userTeams || userTeams.length === 0) {
      return res.json([]);
    }

    const teamIds = userTeams.map((t) => t._id);

    const submissions = await Submission.find({ team: { $in: teamIds } })
      .populate("team", "name inviteCode status hackathon")
      .populate("hackathon", "title submissionDeadline status resultsPublished");

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all public submissions gallery (or filter by hackathon)
// @route   GET /api/submissions/gallery
const getPublicGallery = async (req, res) => {
  try {
    const { hackathonId, search } = req.query;
    let query = {};

    if (hackathonId) query.hackathon = hackathonId;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { techStack: { $regex: search, $options: "i" } },
      ];
    }

    const submissions = await Submission.find(query)
      .populate("team", "name")
      .populate("hackathon", "title theme")
      .populate("submittedBy", "name avatar");

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all submissions (admin/organizer/judge)
// @route   GET /api/submissions
const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("team", "name inviteCode members leader")
      .populate("hackathon", "title theme")
      .populate("submittedBy", "name email");
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createOrUpdateSubmission,
  getMySubmission,
  getPublicGallery,
  getAllSubmissions,
};