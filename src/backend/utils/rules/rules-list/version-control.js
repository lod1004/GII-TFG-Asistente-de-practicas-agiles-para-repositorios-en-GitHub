const { compareStats } = require("../rule-comparator");

function evaluateVersionControlRule(mainRepo, comparisonRepos) {
  const ruleName = "DevOps - Version Control";
  const description = "El repositorio aprovecha en todo lo posible las herramientas de GitHub para el control de versiones. Hay commits frecuentemente y estos contienen buenas características como descripción y referencias";

  const statsToCompare = [
    { key: 'commit_stats.averageCommits', label: 'Media de commits' },
    { key: 'commit_stats.titledCommitsPercent', label: 'Porcentaje de commits con título personalizado' },
    { key: 'commit_stats.descriptionCommitsPercent', label: 'Porcentaje de commits con descripción' },
    { key: 'commit_stats.referencesCommitsPercent', label: 'Porcentaje de commits con referencias' },
  ];

  const { status, resultDetails } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'approved') {
    message = 'El repositorio tiene un buen control de versiones gracias a sus frecuentes commits de calidad';
  } else if (status === 'failed') {
    message = 'El repositorio no tiene un buen control de versiones. No hay suficientes commits ni incluyen título personalizado, descripción o referencias';
  } else if (status === 'zero') {
    message = 'El repositorio no tiene commits, lo que hace imposible el control de versiones';
  } else {
    const problems = resultDetails.filter(d => d.evaluation === 'worse' || d.evaluation === 'zero').map(d => d.label);
    message = `El repositorio parece usar commits y un control de versiones, pero podría mejorar en: ${problems.join(', ')}.`;
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
    evaluateVersionControlRule
};