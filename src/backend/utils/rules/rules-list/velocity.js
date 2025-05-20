const logger = require('../../../logger');

function evaluateVelocityRule(mainRepo, comparisonRepos, averageDays) {
  const ruleName = "Extreme Programming - Velocity";
  const description = "El repositorio tiene indicios de medición de velocidad de trabajo mediante un buen ritmo de cierre de issues. Esto ofrece una forma de trabajo consistente que reducirá el tiempo necesario para el desarrollo";
  const documentationUrl = "https://www.agilealliance.org/glossary/velocity/";
  
  const statsToCompare = [
    { key: 'issue_stats.averageClosedIssues', label: 'Media de Issues cerradas cada ' + averageDays + ' días', units: 'Issues cerradas',},
    { key: 'issue_stats.averageCloseTime', label: 'Media de días necesarios para cerrar una Issue', units: 'días',},
  ];

  const resultDetails = [];
  let Bien = 0;
  let Mal = 0;
  let Cero = 0;

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
        if (mainValue <= compValue) higherCount++;
        else if (mainValue > compValue) lowerCount++;
      } else {
        if (mainValue >= compValue && mainValue != 0) higherCount++;
        else if (mainValue < compValue) lowerCount++;
      }
    }

    let evaluation = 'average';
    if (mainValue === 0) {
      evaluation = 'Cero';
      Cero++;
    } else if (higherCount >= lowerCount) {
      evaluation = 'Bien';
      Bien++;
    } else if (lowerCount > higherCount) {
      evaluation = 'Mal';
      Mal++;
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

  let status = 'Parcialmente superada';
  if (Bien === statsToCompare.length) status = 'Superada';
  else if (Cero === statsToCompare.length) status = 'Cero';
  else if ((Mal + Cero) === statsToCompare.length) status = 'Suspendida';

  let message = '';
  if (status === 'Superada') {
    message = 'El repositorio mantiene la velocidad de trabajo mediante el cierre frecuente de issues.';
  } else if (status === 'Suspendida') {
    message = 'No hay evidencia clara de que el repositorio mantenga la velocidad de trabajo.';
  } else if (status === 'Cero') {
    message = 'No se detectaron issues cerradas.';
  } else {
    const problems = resultDetails
      .filter(d => d.evaluation === 'Mal' || d.evaluation === 'Cero')
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
    documentationUrl,
    passed: status,
    statsBetter: Bien,
    totalStats: statsToCompare.length,
    message,
    details: resultDetails
  };
}

module.exports = {
  evaluateVelocityRule
};