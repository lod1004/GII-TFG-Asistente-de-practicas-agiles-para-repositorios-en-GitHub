const mongoose = require("mongoose");

const participantStatsSchema = new mongoose.Schema({
    repoId: { type: Number, required: true, ref: "Repository" },

    issueParticipationPercent: Number,
    commitParticipationPercent: Number,
    prParticipationPercent: Number,
    releaseParticipationPercent: Number,
    averageUserActivity: Number
});

module.exports = mongoose.model("ParticipantStats", participantStatsSchema);