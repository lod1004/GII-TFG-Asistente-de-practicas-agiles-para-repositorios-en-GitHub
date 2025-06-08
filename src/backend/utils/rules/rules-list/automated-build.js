const { compareStats, validateAverageDays } = require("../rule-comparator");
const logger = require('../../../logger');

function evaluateAutomatedBuildsRule(mainRepo, mainRepoId, comparisonRepos, averageDays) {
  const ruleName = "DevOps - Automated Build";
  const description = "details.automated_description";
  const documentationUrl = "https://www.agilealliance.org/glossary/automated-build/";
  var problems = [];

  const automatedBuildAverageDays = validateAverageDays(averageDays);

  const statsToCompare = [
    { key: 'action_stats.actionsCount', label: 'metrics.workflow_files', units: 'units.files',},
  ];

  const { status, resultDetails, totalStats, statsBetter } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'details.surpassed') {
    message = 'details.automated_surpassed_message';
  } else if (status === 'details.not_surpassed') {
    message = 'details.automated_not_surpassed_message';
  } else if (status === 'details.not_applied') {
    message = 'details.automated_not_applied_message';
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
    averageDays: automatedBuildAverageDays,
    details: resultDetails,
    problems
  };
}

module.exports = {
    evaluateAutomatedBuildsRule
};