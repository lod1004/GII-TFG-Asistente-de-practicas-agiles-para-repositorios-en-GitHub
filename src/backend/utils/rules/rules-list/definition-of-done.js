const { validateAverageDays } = require("../rule-comparator");
const logger = require('../../../logger');

function evaluateDefinitionOfDoneRule(mainRepo, mainRepoId, comparisonRepos, averageDays) {
  const ruleName = "Scrum - Definition of Done";
  const description = "details.done_description";
  const documentationUrl = "https://www.agilealliance.org/glossary/definition-of-done/";
  var problems = [];

  const doneAverageDays = validateAverageDays(averageDays);

  const statsToCompare = [
    { key: 'issue_stats.openIssuesCount', label: 'metrics.open_issues', units: 'units.open_issues', },
    { key: 'issue_stats.closedIssuesCount', label: 'metrics.closed_issues', units: 'units.closed_issues', },
    { key: 'issue_stats.reopenedIssuesPercent', label: 'metrics.reopened_issues', units: 'units.percentaje', },
  ];

  const resultDetails = [];
  let Completa = 0;
  let Incompleta = 0;
  let Cero = 0;

  for (const stat of statsToCompare) {
    const [category, field] = stat.key.split('.');
    const mainValue = mainRepo[category][field];

    let higherCount = 0;
    let lowerCount = 0;

    for (const compRepo of comparisonRepos) {
      const compValue = compRepo[category][field];
      const invert = (
        stat.key === 'issue_stats.openIssuesCount' ||
        stat.key === 'issue_stats.reopenedIssuesPercent'
      );

      if (invert) {
        if (mainValue <= compValue) higherCount++;
        else if (mainValue > compValue) lowerCount++;
      } else {
        if (mainValue >= compValue && mainValue != 0) higherCount++;
        else if (mainValue < compValue) lowerCount++;
      }
    }


    let evaluation = 'average';
    if (mainValue === 0) {
      evaluation = 'details.not_applied';
      Cero++;
    } else if (higherCount >= lowerCount) {
      evaluation = 'details.completed';
      Completa++;
    } else if (lowerCount > higherCount) {
      evaluation = 'details.not_completed';
      Incompleta++;
    }

    resultDetails.push({
      label: stat.label,
      value: mainValue,
      evaluation,
      unit: stat.units,
      surpassedCount: higherCount,
      totalCompared: comparisonRepos.length,
      comparedWith: comparisonRepos.map(r => r[category][field])
    });
  }

  let status = 'details.partialy_surpassed';
  if (Completa === statsToCompare.length) status = 'details.surpassed';
  else if (Cero === statsToCompare.length) status = 'details.not_applied';
  else if ((Incompleta + Cero) === statsToCompare.length) status = 'details.not_surpassed';

  let message = '';
  if (status === 'details.surpassed') {
    message = 'details.done_surpassed_message';
  } else if (status === 'details.not_surpassed') {
    message = 'details.done_not_surpassed_message';
  } else if (status === 'details.not_applied') {
    message = 'details.done_not_applied_message';
  } else {
problems = resultDetails
  .filter(d => d.evaluation === 'details.not_completed' || d.evaluation === 'details.not_applied')
  .map(d => ({ label: d.label }));    message = `details.done_partially_surpassed_message`;
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
    statsBetter: Completa,
    totalStats: statsToCompare.length,
    message,
    mainRepoId,
    averageDays: doneAverageDays,
    details: resultDetails,
    problems
  };
}

module.exports = {
  evaluateDefinitionOfDoneRule
};