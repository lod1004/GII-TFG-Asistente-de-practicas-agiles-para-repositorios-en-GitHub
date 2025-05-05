const { compareStats } = require("../rule-comparator");

function evaluateAutomatedBuildsRule(mainRepo, comparisonRepos) {
  const ruleName = "DevOps - Automated Build";
  const description = "El repositorio incluye ficheros workflows de GitHub Actions que automaticen el desarrollo.";

  const statsToCompare = [
    { key: 'action_stats.actionsCount', label: 'Número de ficheros workflow' },
  ];

  const { status, resultDetails } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'approved') {
    message = 'El repositorio usa de forma consistente la automatización proporcionada por GitHub Actions.';
  } else if (status === 'failed') {
    message = 'El repositorio no tiene suficientes ficheros workflow';
  } else if (status === 'zero') {
    message = 'El repositorio no usa ningún fichero workflow de GitHub Actions, por lo que no hay ningún tipo de automatización';
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
    evaluateAutomatedBuildsRule
};