const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    tagline: {
      type: String,
      trim: true,
      default: "",
    },
    theme: {
      type: String,
      trim: true,
      default: "AI & Full Stack",
    },
    description: {
      type: String,
      trim: true,
    },
    rules: {
      type: String,
      trim: true,
    },
    mode: {
      type: String,
      enum: ["Online", "Offline"],
      default: "Online",
    },
    venue: {
      type: String,
      default: "Virtual Platform",
    },
    bannerImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    },
    prizePool: {
      type: String,
      default: "$10,000",
    },
    maxTeamSize: {
      type: Number,
      default: 4,
    },
    registrationDeadline: {
      type: Date,
      required: true,
    },
    submissionDeadline: {
      type: Date,
      required: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    registrationOpen: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed"],
      default: "ongoing",
    },
    resultsPublished: {
      type: Boolean,
      default: false,
    },
    hasUnpublishedScoreChanges: {
      type: Boolean,
      default: false,
    },
    assignedJudges: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    judgingCriteria: [
      {
        name: { type: String, required: true },
        maxScore: { type: Number, default: 10 },
      },
    ],
    winners: [
      {
        team: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
        position: { type: Number },
        awardTitle: { type: String, trim: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
