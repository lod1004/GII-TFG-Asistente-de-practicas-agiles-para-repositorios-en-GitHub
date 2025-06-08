const { compareStats, validateAverageDays } = require("../rule-comparator");
const logger = require('../../../logger');

function evaluateIterationsRule(mainRepo, mainRepoId, comparisonRepos, averageDays) {
  const ruleName = "Scrum, Extreme Programming - Iterations";
  const description = "details.iterations_description";
  const documentationUrl = "https://www.agilealliance.org/glossary/iteration/";
  var problems = [];

  const iterationsAverageDays = validateAverageDays(averageDays);

  const statsToCompare = [
    { key: 'issue_stats.milestonedIssuesPercent', label: 'metrics.milestoned_issues', units: 'units.percentaje',},
    { key: 'pull_request_stats.milestonedPrPercent', label: 'metrics.milestoned_pr', units: 'units.percentaje',},
    { key: 'commit_stats.averageCommits', label: 'metrics.average_commits', units: 'units.commits',},
    { key: 'release_stats.averageReleases', label: 'metrics.average_releases', units: 'units.releases',},
  ];

  const { status, resultDetails, totalStats, statsBetter } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'details.surpassed') {
    message = 'details.iterations_surpassed_message';
  } else if (status === 'details.not_surpassed') {
    message = 'details.iterations_not_surpassed_message';
  } else if (status === 'details.not_applied') {
    message = 'details.iterations_not_applied_message';
  } else {
problems = resultDetails
  .filter(d => d.evaluation === 'details.not_completed' || d.evaluation === 'details.not_applied')
  .map(d => ({ label: d.label }));    message = `details.iterations_partially_surpassed_message`;
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
    averageDays: iterationsAverageDays,
    details: resultDetails,
    problems: problems
  };
}

module.exports = {
  evaluateIterationsRule
};