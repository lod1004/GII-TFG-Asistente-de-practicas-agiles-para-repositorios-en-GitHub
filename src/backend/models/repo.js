const mongoose = require("mongoose");

const repoSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  url: { type: String, required: true },
  owner: { type: String, required: true },
  repoTitle: { type: String, required: true },
  openIssuesCount: { type: Number, },
  closedIssuesCount: { type: Number, },
  descriptionIssuesPercent: { type: Number, },
  imagedIssuesPercent: { type: Number, },
  assignedIssuesPercent: { type: Number, },
  labeledIssuesPercent: { type: Number, },
  milestonedIssuesPercent: { type: Number, },
  commitCount: { type: Number, },
  titledCommitsPercent: { type: Number, },
  descriptionCommitsPercent: { type: Number, },
  referencesCommitsPercent: { type: Number, },
  openPrCount: { type: Number, },
  closedPrCount: { type: Number, },
  reviewersPrPercent: { type: Number, },
  assigneesPrPercent: { type: Number, },
  labelsPrPercent: { type: Number, },
  milestonesPrPercent: { type: Number, },
  actionsCount: { type: Number, },
  createdAt: { type: Date, default: Date.now }
}/*, { timestamps: true }*/);

module.exports = mongoose.model("MainRepository", repoSchema);