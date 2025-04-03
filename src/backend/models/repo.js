const mongoose = require("mongoose");

const repoSchema = new mongoose.Schema({
  name: String,
  owner: String,
  commits: Number,
  issues: Number,
  closedIssues: Number,
  createdAt: Date,
});

module.exports = mongoose.model("Repository", repoSchema);
