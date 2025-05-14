const { compareStats } = require("../rule-comparator");
const logger = require('../../../logger');

function evaluateBacklogQualityRule(mainRepo, comparisonRepos) {
  const ruleName = "Scrum - Backlog Quality";
  const description = "El repositorio incluye numerosas issues y de calidad para formar el backlog del proyecto.";

  const statsToCompare = [
    { key: 'issue_stats.issuesCount', label: 'Número total de Issues' },
    { key: 'issue_stats.closedIssuesCount', label: 'Número total de Issues cerradas' },
    { key: 'issue_stats.descriptionIssuesPercent', label: 'Porcentaje de Issues con descripción' },
    { key: 'issue_stats.imagedIssuesPercent', label: 'Porcentaje de Issues con imágenes' },
    { key: 'issue_stats.assignedIssuesPercent', label: 'Porcentaje de Issues con personas asignadas' },
    { key: 'issue_stats.labeledIssuesPercent', label: 'Porcentaje de Issues con etiquetas' },
  ];

  const { status, resultDetails } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'approved') {
    message = 'El repositorio cuenta con un backlog bien documentado y completo, gracias a su uso adecuado de issues.';
  } else if (status === 'failed') {
    message = 'El repositorio no tiene un backlog suficientemente sólido o bien documentado.';
  } else if (status === 'zero') {
    message = 'El repositorio no contiene issues, por lo tanto, no tiene backlog.';
  } else {
    const problems = resultDetails.filter(d => d.evaluation === 'worse' || d.evaluation === 'zero').map(d => d.label);
    message = `El backlog podría mejorar en: ${problems.join(', ')}.`;
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
  evaluateBacklogQualityRule
};
