const { compareStats } = require("../rule-comparator");
const logger = require('../../../logger');

function evaluateContinuousIntegrationRule(mainRepo, comparisonRepos) {
  const ruleName = "DevOps, Extreme Programming - Continuous integration";
  const description = "El repositorio tiene señales de integración continua activa. Se cierran Pull Requests de forma consistente a lo largo del tiempo y los ficheros workflow se ejecutan con éxito frecuentemente";

  const statsToCompare = [
    { key: 'action_stats.actionFrequency', label: 'Frecuencia de ejecución de los ficheros workflow' },
    { key: 'action_stats.actionsSuccess', label: 'Porcentaje de éxito de los ficheros workflow' },
    { key: 'pull_request_stats.averageClosedPr', label: 'Frecuencia de cierre de los Pull Requests' },
  ];

  const { status, resultDetails } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'approved') {
    message = 'El repositorio muestra un uso sólido de integración continua mediante workflows frecuentes, exitosos y buena actividad de Pull Requests.';
  } else if (status === 'failed') {
    message = 'El repositorio no presenta suficientes señales de integración continua activa.';
  } else if (status === 'zero') {
    message = 'El repositorio no tiene señales de integración continua: no hay workflows ni actividad reciente de Pull Requests.';
  } else {
    const problems = resultDetails.filter(d => d.evaluation === 'worse' || d.evaluation === 'zero').map(d => d.label);
    message = `El repositorio parece usar integración continua, pero podría mejorar en: ${problems.join(', ')}.`;
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
  evaluateContinuousIntegrationRule
};
