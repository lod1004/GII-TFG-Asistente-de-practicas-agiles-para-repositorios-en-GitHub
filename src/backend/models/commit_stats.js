const mongoose = require("mongoose");

const commitStatsSchema = new mongoose.Schema({
    repoId: { type: Number, required: true, ref: "Repository" },

    commitCount: Number,
    averageCommits: Number,
    titledCommitsPercent: Number,
    descriptionCommitsPercent: Number,
    referencesCommitsPercent: Number,
    collaborativeCommitsPercent: Number
});

module.exports = mongoose.model("CommitStats", commitStatsSchema);  