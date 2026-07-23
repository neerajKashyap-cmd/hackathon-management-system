const Submission = require("../models/Submission");
const Team = require("../models/Team");

const createOrUpdateSubmission = async (req, res) => {
  try {
    const { title, description, repoLink, demoLink, techStack } = req.body;

    if (!title || !description || !repoLink) {
      return res.status(400).json({ message: "Title, description and repo link are required" });
    }

    const team = await Team.findOne({ members: req.user._id });
    if (!team) {
      return res.status(400).json({ message: "You must be part of a team to submit a project" });
    }

    let submission = await Submission.findOne({ team: team._id });

    if (submission) {
      submission.title = title;
      submission.description = description;
      submission.repoLink = repoLink;
      submission.demoLink = demoLink;
      submission.techStack = techStack || [];
      submission.submittedBy = req.user._id;
      await submission.save();
    } else {
      submission = await Submission.create({
        team: team._id,
        title,
        description,
        repoLink,
        demoLink,
        techStack: techStack || [],
        submittedBy: req.user._id,
      });
    }

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getMySubmission = async (req, res) => {
  try {
    const team = await Team.findOne({ members: req.user._id });
    if (!team) {
      return res.status(404).json({ message: "You are not part of any team" });
    }

    const submission = await Submission.findOne({ team: team._id });
    if (!submission) {
      return res.status(404).json({ message: "No submission found for your team" });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("team", "name inviteCode")
      .populate("submittedBy", "name email");
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createOrUpdateSubmission, getMySubmission, getAllSubmissions };