const { compareStats } = require("../rule-comparator");
const logger = require('../../../logger');

function evaluateBacklogQualityRule(mainRepo, comparisonRepos) {
  const ruleName = "Scrum - Backlog Quality";
  const description = "El repositorio incluye numerosas issues y de calidad para formar el backlog del proyecto, lo que ayuda a dividir el trabajo en tareas.";
  const documentationUrl = "https://www.agilealliance.org/glossary/backlog/";

  const statsToCompare = [
    { key: 'issue_stats.issuesCount', label: 'Número total de Issues', units: 'Issues',},
    { key: 'issue_stats.closedIssuesCount', label: 'Número total de Issues cerradas', units: 'Issues cerradas',},
    { key: 'issue_stats.descriptionIssuesPercent', label: 'Porcentaje de Issues con descripción', units: '%',},
    { key: 'issue_stats.imagedIssuesPercent', label: 'Porcentaje de Issues con imágenes', units: '%',},
    { key: 'issue_stats.assignedIssuesPercent', label: 'Porcentaje de Issues con personas asignadas', units: '%',},
    { key: 'issue_stats.labeledIssuesPercent', label: 'Porcentaje de Issues con etiquetas', units: '%',},
  ];

  const { status, resultDetails, totalStats, statsBetter } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'Superada') {
    message = 'El repositorio cuenta con un backlog bien documentado y completo, gracias a su uso adecuado de issues.';
  } else if (status === 'Suspendida') {
    message = 'El repositorio no tiene un backlog suficientemente sólido o bien documentado.';
  } else if (status === 'Cero') {
    message = 'El repositorio no contiene issues, por lo tanto, no tiene backlog.';
  } else {
    const problems = resultDetails.filter(d => d.evaluation === 'Mal' || d.evaluation === 'Cero').map(d => d.label);
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
    documentationUrl,
    passed: status,
    statsBetter,
    totalStats,
    message,
    details: resultDetails
  };
}

module.exports = {
  evaluateBacklogQualityRule
};
