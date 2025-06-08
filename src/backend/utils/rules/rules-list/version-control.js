const { compareStats } = require("../rule-comparator");
const logger = require('../../../logger');

function evaluateVersionControlRule(mainRepo, mainRepoId, comparisonRepos, averageDays) {
  const ruleName = "DevOps - Version Control";
  const description = "details.version_description";
  const documentationUrl = "https://www.agilealliance.org/glossary/version-control/";
  var problems = [];

  const versionControlAverageDays = validateAverageDays(averageDays);

  const statsToCompare = [
    { key: 'commit_stats.commitCount', label: 'metrics.number_of_commits', units: 'units.commits', },
    { key: 'commit_stats.averageCommits', label: 'metrics.average_commits', units: 'units.commits', },
    { key: 'commit_stats.titledCommitsPercent', label: 'metrics.titled_commits', units: 'units.percentaje', },
    { key: 'commit_stats.descriptionCommitsPercent', label: 'metrics.described_commits', units: 'units.percentaje', },
    { key: 'commit_stats.referencesCommitsPercent', label: 'metrics.referenced_commits', units: 'units.percentaje', },
  ];

  const { status, resultDetails, totalStats, statsBetter } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = 'details.';
  if (status === 'details.surpassed') {
    message = 'details.version_surpassed_message';
  } else if (status === 'details.not_surpassed') {
    message = 'details.version_not_surpassed_message';
  } else if (status === 'details.not_applied') {
    message = 'details.version_not_applied_message';
  } else {
    problems = resultDetails
      .filter(d => d.evaluation === 'details.not_completed' || d.evaluation === 'details.not_applied')
      .map(d => ({ label: d.label })); message = `details.version_partially_surpassed_message`;
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
    averageDays: versionControlAverageDays,
    details: resultDetails,
    problems
  };
}

module.exports = {
  evaluateVersionControlRule
};