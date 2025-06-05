const mongoose = require("mongoose");

const ruleResultSchema = new mongoose.Schema({
  rule: String,
  description: String,
  documentationUrl: String,
  passed: String,
  statsBetter: Number,
  totalStats: Number,
  message: String,
  mainRepoId: Number,
  averageDays: Number,
  details: [
    {
      label: String,
      value: mongoose.Schema.Types.Mixed,
      evaluation: String,
      unit: String,
      surpassedCount: Number,
      totalCompared: Number,
      comparedWith: [mongoose.Schema.Types.Mixed]
    },
  ],
    problems: [
      {
        label: String
      }
    ]
}, { timestamps: true });

module.exports = mongoose.model("RuleResult", ruleResultSchema);
