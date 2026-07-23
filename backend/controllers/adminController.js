const Event = require("../models/Event");

const createEvent = async (req, res) => {
  try {
    const { title, theme, description, rules, registrationDeadline, submissionDeadline } = req.body;

    if (!title || !registrationDeadline || !submissionDeadline) {
      return res.status(400).json({ message: "Title and deadlines are required" });
    }

    const event = await Event.create({
      title,
      theme,
      description,
      rules,
      registrationDeadline,
      submissionDeadline,
      createdBy: req.user._id,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createEvent, getEvents };