const mongoose = require("mongoose");

const releaseStatsSchema = new mongoose.Schema({
    repoId: { type: Number, required: true, ref: "Repository" },

    releasesCount: Number,
    averageReleases: Number,
    tagsCount: Number,
    descriptionReleasesPercent: Number,
    collaborativeReleasesPercent: Number,
    releaseParticipationPercent: Number,
});

module.exports = mongoose.model("ReleaseStats", releaseStatsSchema);