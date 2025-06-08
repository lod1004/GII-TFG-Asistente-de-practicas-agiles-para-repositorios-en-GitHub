const { compareStats, validateAverageDays } = require("../rule-comparator");
const logger = require('../../../logger');

function evaluateBacklogQualityRule(mainRepo, mainRepoId, comparisonRepos, averageDays) {
  const ruleName = "Scrum - Backlog Quality";
  const description = "details.backlog_description";
  const documentationUrl = "https://www.agilealliance.org/glossary/backlog/";
  var problems = [];

  const backlogAverageDays = validateAverageDays(averageDays);

  const statsToCompare = [
    { key: 'issue_stats.issuesCount', label: 'metrics.total_issues', units: 'units.issues',},
    { key: 'issue_stats.closedIssuesCount', label: 'metrics.closed_issues', units: 'units.closed_issues',},
    { key: 'issue_stats.descriptionIssuesPercent', label: 'metrics.described_issues', units: 'units.percentaje',},
    { key: 'issue_stats.imagedIssuesPercent', label: 'metrics.imaged_issues', units: 'units.percentaje',},
    { key: 'issue_stats.assignedIssuesPercent', label: 'metrics.assigned_issues', units: 'units.percentaje',},
    { key: 'issue_stats.labeledIssuesPercent', label: 'metrics.labeled_issues', units: 'units.percentaje',},
  ];

  const { status, resultDetails, totalStats, statsBetter } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'details.surpassed') {
    message = 'details.backlog_surpassed_message';
  } else if (status === 'details.not_surpassed') {
    message = 'details.backlog_not_surpassed_message';
  } else if (status === 'details.not_applied') {
    message = 'details.backlog_not_applied_message';
  } else {
problems = resultDetails
  .filter(d => d.evaluation === 'details.not_completed' || d.evaluation === 'details.not_applied')
  .map(d => ({ label: d.label }));    message = `details.backlog_partially_surpassed_message`;
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
    averageDays: backlogAverageDays,
    details: resultDetails,
    problems
  };
}

module.exports = {
  evaluateBacklogQualityRule
};
