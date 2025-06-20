const mongoose = require("mongoose");

const repoSchema = new mongoose.Schema({
  id: { type: Number, required: true },

  averageDays: { type: Number, required: true },

  url: { type: String, required: true },
  owner: { type: String, required: true },
  repoTitle: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isMain: { type: Boolean, required: true },
  userId: { type: Number, required: true },
  group: { type: Number, required: false },
  
  createdAt: { type: Date, default: Date.now }
}, { timestamps: false });

module.exports = mongoose.model("Repository", repoSchema);