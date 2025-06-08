const { compareStats } = require("../rule-comparator");
const logger = require('../../../logger');

function evaluateCollectiveOwnershipRule(mainRepo, mainRepoId, comparisonRepos, averageDays) {
  const ruleName = "Extreme Programming - Collective Ownership";
  const description = "details.collective_description";
  const documentationUrl = "https://www.agilealliance.org/glossary/collective-ownership/";
    var problems = [];

  const collectiveOwnershipAverageDays = parseInt(averageDays, 10);
  if (isNaN(averageDays) || averageDays <= 0) {
    throw new Error("El número de días debe ser un número entero positivo (Collective Ownership).");
  }

  const statsToCompare = [
    { key: 'participant_stats.totalParticipants', label: 'metrics.total_participants', units: 'units.participants',},
    { key: 'participant_stats.issueParticipationPercent', label: 'metrics.issue_participation', units: 'units.percentaje',},
    { key: 'participant_stats.commitParticipationPercent', label: 'metrics.commit_participation', units: 'units.percentaje',},
    { key: 'participant_stats.prParticipationPercent', label: 'metrics.pr_participation', units: 'units.percentaje',},
    { key: 'participant_stats.releaseParticipationPercent', label: 'metrics.release_participation', units: 'units.percentaje',},
    { key: 'participant_stats.averageUserActivity', label: 'metrics.average_activity', units: 'units.participations',},
  ];

  const { status, resultDetails, totalStats, statsBetter } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'details.surpassed') {
    message = 'details.collective_surpassed_message';
  } else if (status === 'details.not_surpassed') {
    message = 'details.collective_not_surpassed_message';
  } else if (status === 'details.not_applied') {
    message = 'details.collective_not_applied_message';
  } else {
problems = resultDetails
  .filter(d => d.evaluation === 'details.not_completed' || d.evaluation === 'details.not_applied')
  .map(d => ({ label: d.label }));    message = `details.collective_partially_surpassed_message`;
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
    averageDays: collectiveOwnershipAverageDays,
    details: resultDetails,
    problems
  };
}

module.exports = {
  evaluateCollectiveOwnershipRule
};
