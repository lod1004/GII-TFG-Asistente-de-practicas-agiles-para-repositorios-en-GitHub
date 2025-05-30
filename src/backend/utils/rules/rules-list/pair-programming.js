const { compareStats } = require("../rule-comparator");
const logger = require('../../../logger');

function evaluatePairProgrammingRule(mainRepo, mainRepoId, comparisonRepos) {
  const ruleName = "Extreme Programming - Pair Programming";
  const description = "Los miembros del repositorio practican la programación por parejas, lo que facilita el desarrollo y el entendimiento del mismo por parte de todos los miembros";
  const documentationUrl = "https://www.agilealliance.org/glossary/pair-programming/";

  const statsToCompare = [
    { key: 'commit_stats.collaborativeCommitsPercent', label: 'Porcentaje de Commits colaborativos (menciones en mensajes)', units: '%', },
    { key: 'pull_request_stats.collaborativePrPercent', label: 'Porcentaje de Pull Requests colaborativos (menciones)', units: '%', },
    { key: 'issue_stats.collaborativeIssuesPercent', label: 'Porcentaje de Issues colaborativos (varios asignados o menciones)', units: '%', },
    { key: 'release_stats.collaborativeReleasesPercent', label: 'Porcentaje de Releases colaborativas (menciones)', units: '%', },
  ];

  const { status, resultDetails, totalStats, statsBetter } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'Superada') {
    message = 'Se observa una buena práctica de programación por parejas mediante colaboración activa en Issues, Pull Requests, Releases y Commits.';
  } else if (status === 'No superada') {
    message = 'No se observan suficientes evidencias de programación por parejas.';
  } else if (status === 'Sin aplicar') {
    message = 'No hay ninguna actividad colaborativa que indique programación por parejas.';
  } else {
    const problems = resultDetails.filter(d => d.evaluation === 'Incompleta' || d.evaluation === 'Sin aplicar').map(d => d.label);
    message = `Hay algunos indicios de colaboración, pero podría mejorar en: ${problems.join(', ')}.`;
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
    details: resultDetails
  };
}

module.exports = {
  evaluatePairProgrammingRule
};
