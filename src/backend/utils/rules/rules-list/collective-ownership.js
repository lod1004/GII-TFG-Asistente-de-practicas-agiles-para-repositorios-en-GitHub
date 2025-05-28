const { compareStats } = require("../rule-comparator");
const logger = require('../../../logger');

function evaluateCollectiveOwnershipRule(mainRepo, comparisonRepos, averageDays) {
  const ruleName = "Extreme Programming - Collective Ownership";
  const description = "Todos los miembros del equipo modifican de forma activa cualquier parte del repositorio. Todos se encargan de todo: hacer Commits, Issues, Pull Requests...";
  const documentationUrl = "https://www.agilealliance.org/glossary/collective-ownership/";
  
  const statsToCompare = [
    { key: 'participant_stats.totalParticipants', label: 'Número de participantes', units: 'participantes',},
    { key: 'participant_stats.issueParticipationPercent', label: 'Porcentaje de participación en Issues', units: '%',},
    { key: 'participant_stats.commitParticipationPercent', label: 'Porcentaje de participación en Commits', units: '%',},
    { key: 'participant_stats.prParticipationPercent', label: 'Porcentaje de participación en Pull Requests', units: '%',},
    { key: 'participant_stats.releaseParticipationPercent', label: 'Porcentaje de participación en Releases', units: '%',},
    { key: 'participant_stats.averageUserActivity', label: 'Actividad media de los usuarios cada ' + averageDays + ' días', units: 'participaciones',},
  ];

  const { status, resultDetails, totalStats, statsBetter } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'Superada') {
    message = 'El repositorio refleja una fuerte propiedad colectiva. Todos los miembros participan en múltiples aspectos del desarrollo de forma activa.';
  } else if (status === 'No superada') {
    message = 'No se detecta propiedad colectiva clara. La mayoría del trabajo está concentrado en los mismos pocos miembros.';
  } else if (status === 'Sin aplicar') {
    message = 'Los usuarios no han participado en nada en el repositorio';
  } else {
    const problems = resultDetails.filter(d => d.evaluation === 'Incompleta' || d.evaluation === 'Sin aplicar').map(d => d.label);
    message = `Hay indicios de colaboración, pero podría mejorar en: ${problems.join(', ')}.`;
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
  evaluateCollectiveOwnershipRule
};
