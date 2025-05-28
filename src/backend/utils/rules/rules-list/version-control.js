const { compareStats } = require("../rule-comparator");
const logger = require('../../../logger');

function evaluateVersionControlRule(mainRepo, comparisonRepos, averageDays) {
  const ruleName = "DevOps - Version Control";
  const description = "El repositorio aprovecha en todo lo posible las herramientas de GitHub para el control de versiones. Hay Commits frecuentemente y estos contienen buenas características como descripción y referencias. Esto permite saber en cada Commit qué cambió y por qué, facilitando el volver a versiones anteriores en caso de error";
  const documentationUrl = "https://www.agilealliance.org/glossary/version-control/";
  
  const statsToCompare = [
    { key: 'commit_stats.commitCount', label: 'Número de Commits', units: 'Commits',},
    { key: 'commit_stats.averageCommits', label: 'Media de Commits hechos cada ' + averageDays + ' días', units: 'Commits',},
    { key: 'commit_stats.titledCommitsPercent', label: 'Porcentaje de Commits con título personalizado', units: '%',},
    { key: 'commit_stats.descriptionCommitsPercent', label: 'Porcentaje de Commits con descripción', units: '%',},
    { key: 'commit_stats.referencesCommitsPercent', label: 'Porcentaje de Commits con referencias', units: '%',},
  ];

  const { status, resultDetails, totalStats, statsBetter } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'Superada') {
    message = 'El repositorio tiene un buen control de versiones gracias a sus frecuentes Commits de calidad';
  } else if (status === 'No superada') {
    message = 'El repositorio no tiene un buen control de versiones. No hay suficientes Commits ni incluyen título personalizado, descripción o referencias';
  } else if (status === 'Sin aplicar') {
    message = 'El repositorio no tiene Commits, lo que hace imposible el control de versiones';
  } else {
    const problems = resultDetails.filter(d => d.evaluation === 'Incompleta' || d.evaluation === 'Sin aplicar').map(d => d.label);
    message = `El repositorio parece usar Commits y un control de versiones, pero podría mejorar en: ${problems.join(', ')}.`;
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
    evaluateVersionControlRule
};