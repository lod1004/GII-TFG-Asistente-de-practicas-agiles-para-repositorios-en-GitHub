const { compareStats } = require("../rule-comparator");
const logger = require('../../../logger');

function evaluateContinuousIntegrationRule(mainRepo, mainRepoId, comparisonRepos, averageDays) {
  const ruleName = "DevOps, Extreme Programming - Continuous integration";
  const description = "details.continuous_description";
  const documentationUrl = "https://www.agilealliance.org/glossary/continuous-integration/";
    var problems = [];

  const statsToCompare = [
    { key: 'action_stats.actionFrequency', label: 'metrics.workflow_frequency', units: 'units.days',},
    { key: 'action_stats.actionsSuccess', label: 'metrics.successful_runs', units: 'units.percentaje',},
    { key: 'pull_request_stats.averageClosedPr', label: 'metrics.average_closed_pr', units: 'units.closed_prs',},
  ];

  const { status, resultDetails, totalStats, statsBetter } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'details.surpassed') {
    message = 'details.continuous_surpassed_message';
  } else if (status === 'details.not_surpassed') {
    message = 'details.continuous_not_surpassed_message';
  } else if (status === 'details.not_applied') {
    message = 'details.continuous_not_applied_message';
  } else {
problems = resultDetails
  .filter(d => d.evaluation === 'details.not_completed' || d.evaluation === 'details.not_applied')
  .map(d => ({ label: d.label }));    message = `details.continuous_partially_surpassed_message`;
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
  evaluateContinuousIntegrationRule
};
