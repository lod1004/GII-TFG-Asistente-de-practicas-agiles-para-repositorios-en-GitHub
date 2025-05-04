const mongoose = require("mongoose");

const actionStatsSchema = new mongoose.Schema({
    repoId: { type: Number, required: true, ref: "Repository" },

    actionsCount: Number,
    actionsRuns: Number,
    actionsSuccess: Number,
    actionFrequency: Number
});

module.exports = mongoose.model("ActionStats", actionStatsSchema);