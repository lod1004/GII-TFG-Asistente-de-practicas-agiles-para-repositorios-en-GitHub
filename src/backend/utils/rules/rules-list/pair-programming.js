const { compareStats, validateAverageDays } = require("../rule-comparator");
const logger = require('../../../logger');

function evaluatePairProgrammingRule(mainRepo, mainRepoId, comparisonRepos, averageDays) {
  const ruleName = "Extreme Programming - Pair Programming";
  const description = "details.pair_description";
  const documentationUrl = "https://www.agilealliance.org/glossary/pair-programming/";
  var problems = [];

  const pairProgrammingAverageDays = validateAverageDays(averageDays);
  const statsToCompare = [
    { key: 'commit_stats.collaborativeCommitsPercent', label: 'metrics.collaborative_commits', units: 'units.percentaje', },
    { key: 'pull_request_stats.collaborativePrPercent', label: 'metrics.collaborative_pr', units: 'units.percentaje', },
    { key: 'issue_stats.collaborativeIssuesPercent', label: 'metrics.collaborative_issues', units: 'units.percentaje', },
    { key: 'release_stats.collaborativeReleasesPercent', label: 'metrics.collaborative_releases', units: 'units.percentaje', },
  ];

  const { status, resultDetails, totalStats, statsBetter } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'details.surpassed') {
    message = 'details.pair_surpassed_message';
  } else if (status === 'details.not_surpassed') {
    message = 'details.pair_not_surpassed_message';
  } else if (status === 'details.not_applied') {
    message = 'details.pair_not_applied_message';
  } else {
problems = resultDetails
  .filter(d => d.evaluation === 'details.not_completed' || d.evaluation === 'details.not_applied')
  .map(d => ({ label: d.label }));    message = `details.pair_partially_surpassed_message`;
  }

  logger.info('Regla: ' + ruleName)
  logger.info('Descripción: ' + description)
  logger.info('Aprobada: ' + status)
  logger.info('Expliación: ' + message)
  logger.info('Detalles: ' + resultDetails)

  return {
    rule: ruleName,
    description,
    documentationUrl,
    passed: status,
    statsBetter,
    totalStats,
    message,
    mainRepoId,
    averageDays: pairProgrammingAverageDays,
    details: resultDetails,
    problems
  };
}

module.exports = {
  evaluatePairProgrammingRule
};
