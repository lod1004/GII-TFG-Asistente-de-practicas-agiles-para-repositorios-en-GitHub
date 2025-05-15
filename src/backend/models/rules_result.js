const mongoose = require("mongoose");

const ruleResultSchema = new mongoose.Schema({
  rule: String,
  description: String,
  documentationUrl: String,
  passed: String,
  statsBetter: Number,
  totalStats: Number,
  message: String,
  details: [
    {
      label: String,
      value: mongoose.Schema.Types.Mixed,
      evaluation: String,
      unit: String,
      surpassedCount: Number,
      totalCompared: Number,
      comparedWith: [mongoose.Schema.Types.Mixed]
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("RuleResult", ruleResultSchema);
