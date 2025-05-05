const { compareStats } = require("../rule-comparator");

function evaluatePairProgrammingRule(mainRepo, comparisonRepos) {
  const ruleName = "Extreme Programming - Pair Programming";
  const description = "Los miembros del repositorio practican la programación por parejas.";

  const statsToCompare = [
    { key: 'commit_stats.collaborativeCommitsPercent', label: 'Commits colaborativos (menciones en mensajes)' },
    { key: 'pull_request_stats.collaborativePrPercent', label: 'Pull Requests colaborativos (menciones)' },
    { key: 'issue_stats.collaborativeIssuesPercent', label: 'Issues colaborativos (varios asignados o menciones)' },
    { key: 'release_stats.collaborativeReleasesPercent', label: 'Releases colaborativas (menciones)' },
  ];

  const { status, resultDetails } = compareStats(mainRepo, comparisonRepos, statsToCompare);

  let message = '';
  if (status === 'approved') {
    message = 'Se observa una buena práctica de programación por parejas mediante colaboración activa en Issues, Pull Requests, Releases y Commits.';
  } else if (status === 'failed') {
    message = 'No se observan suficientes evidencias de programación por parejas.';
  } else if (status === 'zero') {
    message = 'No hay ninguna actividad colaborativa que indique programación por parejas.';
  } else {
    const problems = resultDetails.filter(d => d.evaluation === 'worse' || d.evaluation === 'zero').map(d => d.label);
    message = `Hay algunos indicios de colaboración, pero podría mejorar en: ${problems.join(', ')}.`;
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
  evaluatePairProgrammingRule
};
