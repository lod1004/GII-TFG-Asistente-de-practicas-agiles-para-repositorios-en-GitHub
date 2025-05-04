const mongoose = require("mongoose");

const issueStatsSchema = new mongoose.Schema({
    repoId: { type: Number, required: true, ref: "Repository" },

    openIssuesCount: Number,
    closedIssuesCount: Number,
    averageClosedIssues: Number,
    descriptionIssuesPercent: Number,
    commentedIssuesPercent: Number,
    imagedIssuesPercent: Number,
    assignedIssuesPercent: Number,
    labeledIssuesPercent: Number,
    milestonedIssuesPercent: Number,
    storyPointsIssuesPercent: Number,
    reopenedIssuesPercent: Number,
    collaborativeIssuesPercent: Number
});

module.exports = mongoose.model("IssueStats", issueStatsSchema);