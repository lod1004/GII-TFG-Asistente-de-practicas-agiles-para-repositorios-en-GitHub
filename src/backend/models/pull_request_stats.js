const mongoose = require("mongoose");

const prStatsSchema = new mongoose.Schema({
    repoId: { type: Number, required: true, ref: "Repository" },

    openPrCount: Number,
    closedPrCount: Number,
    averageClosedPr: Number,
    reviewersPrPercent: Number,
    assigneesPrPercent: Number,
    labelsPrPercent: Number,
    milestonedPrPercent: Number,
    collaborativePrPercent: Number
});

module.exports = mongoose.model("PullRequestStats", prStatsSchema);  