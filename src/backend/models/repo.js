const mongoose = require("mongoose");

const repoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Repository", repoSchema);