const { compareStats } = require("../rule-comparator");

function evaluateVelocityRule(mainRepo, comparisonRepos) {
  const ruleName = "Extreme Programming - Velocity";
  const description = "El repositorio tiene indicios de medición de velocidad de trabajo mediante el uso de etiquetas de story points y ritmo de cierre de issues.";

  const statsToCompare = [
    { key: 'issue_stats.storyPointsIssuesPercent', label: 'Porcentaje de Issues con Story Points' },
    { key: 'issue_stats.averageClosedIssues', label: 'Media de cierre de Issues' },
  ];

  const { status, resultDetails } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'approved') {
    message = 'El repositorio mide activamente la velocidad de trabajo mediante el uso de Story Points y cierre frecuente de issues.';
  } else if (status === 'failed') {
    message = 'No hay evidencia clara de que el repositorio mida la velocidad de trabajo.';
  } else if (status === 'zero') {
    message = 'No se detectaron issues cerradas ni etiquetas que indiquen Story Points.';
  } else {
    const problems = resultDetails.filter(d => d.evaluation === 'worse' || d.evaluation === 'zero').map(d => d.label);
    message = `El repositorio podría mejorar la medición de velocidad en: ${problems.join(', ')}.`;
  }

  console.log('Regla: ', ruleName)
  console.log('Descripción: ', description)
  console.log('Aprobada: ', status)
  console.log('Expliación: ', message)
  console.log('Detalles: ', resultDetails)

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
