const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    theme: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    rules: {
      type: String,
      trim: true,
    },
    registrationDeadline: {
      type: Date,
      required: true,
    },
    submissionDeadline: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);