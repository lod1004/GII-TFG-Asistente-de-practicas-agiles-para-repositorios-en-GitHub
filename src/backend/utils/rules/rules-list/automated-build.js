const { compareStats } = require("../rule-comparator");
const logger = require('../../../logger');

function evaluateAutomatedBuildsRule(mainRepo, comparisonRepos) {
  const ruleName = "DevOps - Automated Build";
  const description = "El repositorio incluye ficheros workflows de GitHub Actions que automaticen el desarrollo, ahorrando bastante tiempo de desarrollo y testing.";
  const documentationUrl = "https://www.agilealliance.org/glossary/automated-build/";

  const statsToCompare = [
    { key: 'action_stats.actionsCount', label: 'Número de ficheros workflow', units: 'ficheros',},
  ];

  const { status, resultDetails, totalStats, statsBetter } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'Superada') {
    message = 'El repositorio usa de forma consistente la automatización proporcionada por GitHub Actions.';
  } else if (status === 'Suspendida') {
    message = 'El repositorio no tiene suficientes ficheros workflow';
  } else if (status === 'Cero') {
    message = 'El repositorio no usa ningún fichero workflow de GitHub Actions, por lo que no hay ningún tipo de automatización';
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
    evaluateAutomatedBuildsRule
};