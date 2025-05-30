const { evaluateIterationsRule } = require("./rules-list/iterations");
const { evaluateAutomatedBuildsRule } = require("./rules-list/automated-build");
const { evaluateVersionControlRule } = require("./rules-list/version-control");
const { evaluateContinuousIntegrationRule } = require("./rules-list/continuous-integration");
const { evaluateDefinitionOfDoneRule } = require("./rules-list/definition-of-done");
const { evaluateBacklogQualityRule } = require("./rules-list/backlog-quality");
const { evaluateVelocityRule } = require("./rules-list/velocity");
const { evaluateFrequentReleasesRule } = require("./rules-list/frequent-releases");
const { evaluateCollectiveOwnershipRule } = require("./rules-list/collective-ownership");
const { evaluatePairProgrammingRule } = require("./rules-list/pair-programming");

function evaluateAllRules(mainRepo, comparisonRepos, averageDays, mainRepoId) {
  const rules = [];

  rules.push(evaluateIterationsRule(mainRepo, mainRepoId, comparisonRepos, averageDays));
  rules.push(evaluateAutomatedBuildsRule(mainRepo, mainRepoId, comparisonRepos));
  rules.push(evaluateVersionControlRule(mainRepo, mainRepoId, comparisonRepos, averageDays));
  rules.push(evaluateContinuousIntegrationRule(mainRepo, mainRepoId, comparisonRepos, averageDays));
  rules.push(evaluateDefinitionOfDoneRule(mainRepo, mainRepoId, comparisonRepos));
  rules.push(evaluateBacklogQualityRule(mainRepo, mainRepoId, comparisonRepos));
  rules.push(evaluateVelocityRule(mainRepo, mainRepoId, comparisonRepos, averageDays));
  rules.push(evaluateFrequentReleasesRule(mainRepo, mainRepoId, comparisonRepos, averageDays));
  rules.push(evaluateCollectiveOwnershipRule(mainRepo, mainRepoId, comparisonRepos, averageDays));
  rules.push(evaluatePairProgrammingRule(mainRepo, mainRepoId, comparisonRepos));

  return rules;
}

module.exports = {
  evaluateAllRules
};
