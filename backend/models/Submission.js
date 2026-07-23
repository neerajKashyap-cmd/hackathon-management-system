const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
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
    },
    techStack: [
      {
        type: String,
        trim: true,
      },
    ],
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submission", submissionSchema);