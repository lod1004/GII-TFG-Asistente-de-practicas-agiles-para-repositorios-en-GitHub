const { compareStats } = require("../rule-comparator");

function evaluateFrequentReleasesRule(mainRepo, comparisonRepos) {
  const ruleName = "Extreme Programming - Frequent Releases";
  const description = "El repositorio incluye Releases y se van creando nuevas cada cierto tiempo.";

  const statsToCompare = [
    { key: 'release_stats.releasesCount', label: 'Número de Releases' },
    { key: 'release_stats.averageReleases', label: 'Frecuencia de Releases' },
  ];

  const { status, resultDetails } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'approved') {
    message = 'El repositorio publica Releases de forma frecuente, lo cual es un buen indicio de entrega continua.';
  } else if (status === 'failed') {
    message = 'El repositorio no publica Releases con suficiente frecuencia.';
  } else if (status === 'zero') {
    message = 'El repositorio no ha publicado ningún tipo de Release.';
  } else {
    const problems = resultDetails.filter(d => d.evaluation === 'worse' || d.evaluation === 'zero').map(d => d.label);
    message = `El repositorio tiene Releases, pero podría mejorar en: ${problems.join(', ')}.`;
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
  evaluateFrequentReleasesRule
};
