const { compareStats } = require("../rule-comparator");
const logger = require('../../../logger');

function evaluateFrequentReleasesRule(mainRepo, comparisonRepos, averageDays) {
  const ruleName = "Extreme Programming - Frequent Releases";
  const description = "El repositorio incluye Releases y se van creando nuevas cada cierto tiempo. Esto es útil para ir ofreciendo versiones utilizables de software";
  const documentationUrl = "https://www.agilealliance.org/glossary/frequent-releases/";
  
  const statsToCompare = [
    { key: 'release_stats.releasesCount', label: 'Número de Releases', units: 'Releases',},
    { key: 'release_stats.averageReleases', label: 'Media de Releases subidas cada ' + averageDays + ' días', units: 'Releases',},
  ];

  const { status, resultDetails, totalStats, statsBetter } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'Superada') {
    message = 'El repositorio publica Releases de forma frecuente, lo cual es un buen indicio de entrega continua.';
  } else if (status === 'No superada') {
    message = 'El repositorio no publica Releases con suficiente frecuencia.';
  } else if (status === 'Cero') {
    message = 'El repositorio no ha publicado ningún tipo de Release.';
  } else {
    const problems = resultDetails.filter(d => d.evaluation === 'Mal' || d.evaluation === 'Cero').map(d => d.label);
    message = `El repositorio tiene Releases, pero podría mejorar en: ${problems.join(', ')}.`;
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
  evaluateFrequentReleasesRule
};
