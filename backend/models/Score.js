const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema(
  {
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    judge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    innovation: { type: Number, min: 0, max: 10, required: true },
    technical: { type: Number, min: 0, max: 10, required: true },
    presentation: { type: Number, min: 0, max: 10, required: true },
    impact: { type: Number, min: 0, max: 10, required: true },
    totalScore: { type: Number },
    feedback: { type: String, trim: true },
  },
  { timestamps: true }
);

// One score per judge per team (they can update it, not duplicate it)
scoreSchema.index({ team: 1, judge: 1 }, { unique: true });

// Auto-calculate total before saving
scoreSchema.pre("save", function (next) {
  this.totalScore = this.innovation + this.technical + this.presentation + this.impact;
  next();
});

module.exports = mongoose.model("Score", scoreSchema);
