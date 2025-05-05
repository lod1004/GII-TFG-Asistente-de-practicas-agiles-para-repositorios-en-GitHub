const mongoose = require("mongoose");

const ruleResultSchema = new mongoose.Schema({
  rule: String,
  description: String,
  passed: String,
  message: String,
  details: [
    {
      label: String,
      value: mongoose.Schema.Types.Mixed,
      evaluation: String,
      comparedWith: [mongoose.Schema.Types.Mixed]
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("RuleResult", ruleResultSchema);
