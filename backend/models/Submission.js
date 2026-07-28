const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    hackathon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    problemStatement: {
      type: String,
      default: "",
    },
    solution: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      required: true,
    },
    repoLink: {
      type: String,
      required: true,
      trim: true,
    },
    demoLink: {
      type: String,
      trim: true,
      default: "",
    },
    techStack: [
      {
        type: String,
        trim: true,
      },
    ],
    screenshots: [
      {
        type: String,
        trim: true,
      },
    ],
    presentationPdf: {
      type: String,
      default: "",
    },
    demoVideoLink: {
      type: String,
      default: "",
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "under_review", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);