const { compareStats } = require("../rule-comparator");
const logger = require('../../../logger');

function evaluateIterationsRule(mainRepo, comparisonRepos) {
  const ruleName = "Scrum, Extreme Programming - Iteraciones";
  const description = "El repositorio se está desarrollando mediante iteraciones o Sprints";

  const statsToCompare = [
    { key: 'issue_stats.milestonedIssuesPercent', label: 'Issues con Milestones' },
    { key: 'pull_request_stats.milestonedPrPercent', label: 'Pull Requests con Milestones' },
    { key: 'commit_stats.averageCommits', label: 'Frecuencia de Commits' },
    { key: 'release_stats.averageReleases', label: 'Releases' },
  ];

  const { status, resultDetails } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'approved') {
    message = 'El repositorio sigue claramente una estrategia basada en iteraciones. Se usan Milestones y se hacen Commits y Releases con frecuencia';
  } else if (status === 'failed') {
    message = 'El repositorio no parece seguir una estrategia iterativa (Sprints). Se usan muy pocas Milestones o ninguna, y no hay suficientes Commits ni Releases';
  } else if (status === 'zero') {
    message = 'El repositorio no sigue ningún tipo de estrategia iterativa (Sprints). No tiene Commits ni Releases, ni se usan Milestones';
  } else {
    const problems = resultDetails.filter(d => d.evaluation === 'worse' || d.evaluation === 'zero').map(d => d.label);
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
    passed: status,
    message,
    details: resultDetails
  };
}

module.exports = {
  evaluateIterationsRule
};