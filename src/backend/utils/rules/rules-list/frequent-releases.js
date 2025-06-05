const { compareStats } = require("../rule-comparator");
const logger = require('../../../logger');

function evaluateFrequentReleasesRule(mainRepo, mainRepoId, comparisonRepos, averageDays) {
  const ruleName = "Extreme Programming - Frequent Releases";
  const description = "details.automated_description";
  const documentationUrl = "https://www.agilealliance.org/glossary/frequent-releases/";
  var problems = [];

  const statsToCompare = [
    { key: 'release_stats.releasesCount', label: 'metrics.releases_count', units: 'units.releases', },
    { key: 'release_stats.averageReleases', label: 'metrics.average_releases', units: 'units.releases', },
  ];

  const { status, resultDetails, totalStats, statsBetter } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'details.surpassed') {
    message = 'details.frequent_surpassed_message';
  } else if (status === 'details.not_surpassed') {
    message = 'details.frequent_not_surpassed_message';
  } else if (status === 'details.not_applied') {
    message = 'details.frequent_not_applied_message';
  } else {
problems = resultDetails
  .filter(d => d.evaluation === 'details.not_completed' || d.evaluation === 'details.not_applied')
  .map(d => ({ label: d.label }));    message = `details.frequent_partially_surpassed_message`;
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
    averageDays: averageDays,
    details: resultDetails,
    problems
  };
}

module.exports = {
  evaluateFrequentReleasesRule
};
