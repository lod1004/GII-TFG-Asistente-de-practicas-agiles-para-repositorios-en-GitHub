const logger = require('../../../logger');

function evaluateVelocityRule(mainRepo, comparisonRepos) {
  const ruleName = "Extreme Programming - Velocity";
  const description = "El repositorio tiene indicios de medición de velocidad de trabajo mediante un buen ritmo de cierre de issues.";

  const statsToCompare = [
    { key: 'issue_stats.averageClosedIssues', label: 'Media de cierre de Issues' },
    { key: 'issue_stats.averageCloseTime', label: 'Media de días de cierre de Issues' },
  ];

  const resultDetails = [];
  let better = 0;
  let worse = 0;
  let zero = 0;

  for (const stat of statsToCompare) {
    const [category, field] = stat.key.split('.');
    const mainValue = mainRepo[category][field];

    let higherCount = 0;
    let lowerCount = 0;

    for (const compRepo of comparisonRepos) {
      const compValue = compRepo[category][field];

      const invert = (
        stat.key === 'issue_stats.averageCloseTime'
      );

      if (invert) {
        if (mainValue < compValue) higherCount++;
        else if (mainValue > compValue) lowerCount++;
      } else {
        if (mainValue > compValue) higherCount++;
        else if (mainValue < compValue) lowerCount++;
      }
    }

    let evaluation = 'average';
    if (mainValue === 0) {
      evaluation = 'zero';
      zero++;
    } else if (higherCount >= lowerCount) {
      evaluation = 'better';
      better++;
    } else if (lowerCount > higherCount) {
      evaluation = 'worse';
      worse++;
    }

    resultDetails.push({
      label: stat.label,
      value: mainValue,
      evaluation,
      comparedWith: comparisonRepos.map(r => r[category][field])
    });
  }

  let status = 'parcial';
  if (better === statsToCompare.length) status = 'approved';
  else if (zero === statsToCompare.length) status = 'zero';
  else if ((worse + zero) === statsToCompare.length) status = 'failed';

  let message = '';
  if (status === 'approved') {
    message = 'El repositorio mantiene la velocidad de trabajo mediante el cierre frecuente de issues.';
  } else if (status === 'failed') {
    message = 'No hay evidencia clara de que el repositorio mantenga la velocidad de trabajo.';
  } else if (status === 'zero') {
    message = 'No se detectaron issues cerradas.';
  } else {
    const problems = resultDetails
      .filter(d => d.evaluation === 'worse' || d.evaluation === 'zero')
      .map(d => d.label);
    message = `El repositorio podría mejorar la medición de velocidad en: ${problems.join(' + ')}.`;
  }

  logger.info('Regla: ' + ruleName);
  logger.info('Descripción: ' + description);
  logger.info('Aprobada: ' + status);
  logger.info('Expliación: ' + message);
  logger.info('Detalles: ', resultDetails);

  return {
    rule: ruleName,
    description,
    passed: status,
    message,
    details: resultDetails
  };
}

module.exports = {
  evaluateVelocityRule
};