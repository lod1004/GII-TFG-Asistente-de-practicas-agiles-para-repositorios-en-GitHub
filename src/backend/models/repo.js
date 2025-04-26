const mongoose = require("mongoose");

const repoSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  url: { type: String, required: true },
  owner: { type: String, required: true },
  repoTitle: { type: String, required: true },

  openIssuesCount: { type: Number, },
  closedIssuesCount: { type: Number, },
  descriptionIssuesPercent: { type: Number, },
  commentedIssuesPercent: { type: Number, },
  imagedIssuesPercent: { type: Number, },
  assignedIssuesPercent: { type: Number, },
  labeledIssuesPercent: { type: Number, },
  milestonedIssuesPercent: { type: Number, },
  storyPointsIssuesPercent: { type: Number, },
  reopenedIssuesPercent: { type: Number, },
  collaborativeIssuesPercent: { type: Number, },
  issueParticipationPercent: { type: Number, },

  commitCount: { type: Number, },
  titledCommitsPercent: { type: Number, },
  descriptionCommitsPercent: { type: Number, },
  referencesCommitsPercent: { type: Number, },
  collaborativeCommitsPercent: { type: Number, },
  commitParticipationPercent: { type: Number, },

  openPrCount: { type: Number, },
  closedPrCount: { type: Number, },
  reviewersPrPercent: { type: Number, },
  assigneesPrPercent: { type: Number, },
  labelsPrPercent: { type: Number, },
  milestonesPrPercent: { type: Number, },
  collaborativePrPercent: { type: Number, },
  prParticipationPercent: { type: Number, },

  actionsCount: { type: Number, },
  actionsRuns: { type: Number, },
  actionsSuccess: { type: Number, },
  releasesCount: { type: Number, },
  tagsCount: { type: Number, },
  descriptionReleasesPercent: { type: Number, },
  collaborativeReleasesPercent: { type: Number, },
  releaseParticipationPercent: { type: Number, },

  isMain: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now }
}/*, { timestamps: true }*/);

module.exports = mongoose.model("Repository", repoSchema);