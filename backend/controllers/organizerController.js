const Event = require("../models/Event");

// @desc    Create a new hackathon (organizer only)
// @route   POST /api/organizer/hackathons
const createHackathon = async (req, res) => {
  try {
    const { title, theme, description, rules, registrationDeadline, submissionDeadline } = req.body;

    if (!title || !registrationDeadline || !submissionDeadline) {
      return res.status(400).json({ message: "Title and deadlines are required" });
    }

    const hackathon = await Event.create({
      title,
      theme,
      description,
      rules,
      registrationDeadline,
      submissionDeadline,
      organizer: req.user._id,
    });

    res.status(201).json(hackathon);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get hackathons created by the logged-in organizer
// @route   GET /api/organizer/hackathons
const getMyHackathons = async (req, res) => {
  try {
    const hackathons = await Event.find({ organizer: req.user._id }).sort({ createdAt: -1 });
    res.json(hackathons);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper: fetch a hackathon and confirm it belongs to the logged-in organizer
const findOwnHackathon = async (hackathonId, userId) => {
  const hackathon = await Event.findById(hackathonId);
  if (!hackathon) return { error: "Hackathon not found", status: 404 };
  if (hackathon.organizer.toString() !== userId.toString()) {
    return { error: "You can only manage hackathons you created", status: 403 };
  }
  return { hackathon };
};

// @desc    Edit a hackathon (organizer must own it)
// @route   PUT /api/organizer/hackathons/:id
const editHackathon = async (req, res) => {
  try {
    const { hackathon, error, status } = await findOwnHackathon(req.params.id, req.user._id);
    if (error) return res.status(status).json({ message: error });

    const { title, theme, description, rules, registrationDeadline, submissionDeadline } = req.body;

    if (title !== undefined) hackathon.title = title;
    if (theme !== undefined) hackathon.theme = theme;
    if (description !== undefined) hackathon.description = description;
    if (rules !== undefined) hackathon.rules = rules;
    if (registrationDeadline !== undefined) hackathon.registrationDeadline = registrationDeadline;
    if (submissionDeadline !== undefined) hackathon.submissionDeadline = submissionDeadline;

    await hackathon.save();
    res.json(hackathon);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Delete a hackathon (organizer must own it)
// @route   DELETE /api/organizer/hackathons/:id
const deleteHackathon = async (req, res) => {
  try {
    const { hackathon, error, status } = await findOwnHackathon(req.params.id, req.user._id);
    if (error) return res.status(status).json({ message: error });

    await hackathon.deleteOne();
    res.json({ message: "Hackathon deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Open or close registration for a hackathon (organizer must own it)
// @route   PATCH /api/organizer/hackathons/:id/registration
const toggleRegistration = async (req, res) => {
  try {
    const { hackathon, error, status } = await findOwnHackathon(req.params.id, req.user._id);
    if (error) return res.status(status).json({ message: error });

    const { isOpen } = req.body;
    hackathon.registrationOpen = typeof isOpen === "boolean" ? isOpen : !hackathon.registrationOpen;

    await hackathon.save();
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
  findOwnHackathon,
};
