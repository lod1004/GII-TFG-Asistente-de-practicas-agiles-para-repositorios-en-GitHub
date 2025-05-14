const { compareStats } = require("../rule-comparator");
const logger = require('../../../logger');

function evaluateCollectiveOwnershipRule(mainRepo, comparisonRepos) {
  const ruleName = "Extreme Programming - Collective Ownership";
  const description = "Todos los miembros del equipo modifican de forma activa cualquier parte del repositorio. Todos se encargan de todo: hacer Commits, Issues, Pull Requests...";

  const statsToCompare = [
    { key: 'participant_stats.totalParticipants', label: 'Número de participantes' },
    { key: 'participant_stats.issueParticipationPercent', label: 'Porcentaje de participación en Issues' },
    { key: 'participant_stats.commitParticipationPercent', label: 'Porcentaje de participación en Commits' },
    { key: 'participant_stats.prParticipationPercent', label: 'Porcentaje de participación en Pull Requests' },
    { key: 'participant_stats.releaseParticipationPercent', label: 'Porcentaje de participación en Releases' },
    { key: 'participant_stats.averageUserActivity', label: 'Actividad media de los usuarios' },
  ];

  const { status, resultDetails } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'approved') {
    message = 'El repositorio refleja una fuerte propiedad colectiva. Todos los miembros participan en múltiples aspectos del desarrollo de forma activa.';
  } else if (status === 'failed') {
    message = 'No se detecta propiedad colectiva clara. La mayoría del trabajo está concentrado en los mismos pocos miembros.';
  } else if (status === 'zero') {
    message = 'Los usuarios no han participado en nada en el repositorio';
  } else {
    const problems = resultDetails.filter(d => d.evaluation === 'worse' || d.evaluation === 'zero').map(d => d.label);
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
    passed: status,
    message,
    details: resultDetails
  };
}

module.exports = {
  evaluateCollectiveOwnershipRule
};
