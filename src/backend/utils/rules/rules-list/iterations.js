const { compareStats } = require("../rule-comparator");
const logger = require('../../../logger');

function evaluateIterationsRule(mainRepo, comparisonRepos, averageDays) {
  const ruleName = "Scrum, Extreme Programming - Iteraciones";
  const description = "El repositorio se está desarrollando mediante iteraciones o Sprints";
  const documentationUrl = "https://www.agilealliance.org/glossary/iteration/";
  
  const statsToCompare = [
    { key: 'issue_stats.milestonedIssuesPercent', label: 'Porcentaje de Issues con Milestones', units: '%',},
    { key: 'pull_request_stats.milestonedPrPercent', label: 'Porcentaje de Pull Requests con Milestones', units: '%',},
    { key: 'commit_stats.averageCommits', label: 'Media de Commits hechos cada ' + averageDays + ' días', units: 'Commits',},
    { key: 'release_stats.averageReleases', label: 'Media de Releases subidas cada ' + averageDays + ' días', units: 'Releases',},
  ];

  const { status, resultDetails, totalStats, statsBetter } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'Superada') {
    message = 'El repositorio sigue claramente una estrategia basada en iteraciones. Se usan Milestones y se hacen Commits y Releases con frecuencia';
  } else if (status === 'Suspendida') {
    message = 'El repositorio no parece seguir una estrategia iterativa (Sprints). Se usan muy pocas Milestones o ninguna, y no hay suficientes Commits ni Releases';
  } else if (status === 'Cero') {
    message = 'El repositorio no sigue ningún tipo de estrategia iterativa (Sprints). No tiene Commits ni Releases, ni se usan Milestones';
  } else {
    const problems = resultDetails.filter(d => d.evaluation === 'Mal' || d.evaluation === 'Cero').map(d => d.label);
    message = `El repositorio parece usar iteraciones, pero podría mejorar en: ${problems.join(', ')}.`;
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
    details: resultDetails
  };
}

module.exports = {
  evaluateIterationsRule
};