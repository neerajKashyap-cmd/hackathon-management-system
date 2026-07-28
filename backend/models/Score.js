const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema(
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
    judge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    innovation: { type: Number, min: 0, max: 10, default: 0 },
    technicalComplexity: { type: Number, min: 0, max: 10, default: 0 },
    userInterface: { type: Number, min: 0, max: 10, default: 0 },
    functionality: { type: Number, min: 0, max: 10, default: 0 },
    scalability: { type: Number, min: 0, max: 10, default: 0 },
    documentation: { type: Number, min: 0, max: 10, default: 0 },
    presentation: { type: Number, min: 0, max: 10, default: 0 },
    totalScore: { type: Number, default: 0 },
    feedback: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

scoreSchema.index({ team: 1, judge: 1 }, { unique: true });

scoreSchema.pre("save", function (next) {
  this.totalScore =
    (this.innovation || 0) +
    (this.technicalComplexity || 0) +
    (this.userInterface || 0) +
    (this.functionality || 0) +
    (this.scalability || 0) +
    (this.documentation || 0) +
    (this.presentation || 0);
  next();
});

module.exports = mongoose.model("Score", scoreSchema);
