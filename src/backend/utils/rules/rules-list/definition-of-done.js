const logger = require('../../../logger');

function evaluateDefinitionOfDoneRule(mainRepo, comparisonRepos) {
  const ruleName = "Scrum - Definition of Done";
  const description = "Se cierran las Issues de forma correcta y consistente, logrando un avance en el desarrollo eficiente.";
  const documentationUrl = "https://www.agilealliance.org/glossary/definition-of-done/";

  const statsToCompare = [
    { key: 'issue_stats.openIssuesCount', label: 'Número de Issues abiertas', units: 'Issues abiertas', },
    { key: 'issue_stats.closedIssuesCount', label: 'Número de Issues cerradas', units: 'Issues cerradas', },
    { key: 'issue_stats.reopenedIssuesPercent', label: 'Porcentaje de Issues que alguna vez fueron reabiertas', units: '%', },
  ];

  const resultDetails = [];
  let Completa = 0;
  let Incompleta = 0;
  let Cero = 0;

  for (const stat of statsToCompare) {
    const [category, field] = stat.key.split('.');
    const mainValue = mainRepo[category][field];

    let higherCount = 0;
    let lowerCount = 0;

    for (const compRepo of comparisonRepos) {
      const compValue = compRepo[category][field];
      const invert = (
        stat.key === 'issue_stats.openIssuesCount' ||
        stat.key === 'issue_stats.reopenedIssuesPercent'
      );

      if (invert) {
        if (mainValue <= compValue) higherCount++;
        else if (mainValue > compValue) lowerCount++;
      } else {
        if (mainValue >= compValue && mainValue != 0) higherCount++;
        else if (mainValue < compValue) lowerCount++;
      }
    }


    let evaluation = 'average';
    if (mainValue === 0) {
      evaluation = 'Sin aplicar';
      Cero++;
    } else if (higherCount >= lowerCount) {
      evaluation = 'Completa';
      Completa++;
    } else if (lowerCount > higherCount) {
      evaluation = 'Incompleta';
      Incompleta++;
    }

    resultDetails.push({
      label: stat.label,
      value: mainValue,
      evaluation,
      unit: stat.units,
      surpassedCount: higherCount,
      totalCompared: comparisonRepos.length,
      comparedWith: comparisonRepos.map(r => r[category][field])
    });
  }

  let status = 'Parcialmente superada';
  if (Completa === statsToCompare.length) status = 'Superada';
  else if (Cero === statsToCompare.length) status = 'Sin aplicar';
  else if ((Incompleta + Cero) === statsToCompare.length) status = 'No superada';

  let message = '';
  if (status === 'Superada') {
    message = 'La mayoría de las tareas se completan correctamente y rara vez o nunca se reabren.';
  } else if (status === 'No superada') {
    message = 'Hay muchas tareas sin cerrar o se reabren con demasiada frecuencia, lo cual indica que no se respeta una definición clara de "Done".';
  } else if (status === 'Sin aplicar') {
    message = 'No hay Issues creadas en el repositorio, por lo que no puede evaluarse la definición de "Done".';
  } else {
    const problems = resultDetails.filter(d => d.evaluation === 'Incompleta' || d.evaluation === 'Sin aplicar').map(d => d.label);
    message = `El repositorio parece usar integración continua, pero podría mejorar en: ${problems.join(', ')}.`;
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
    statsBetter: Completa,
    totalStats: statsToCompare.length,
    message,
    details: resultDetails
  };
}

module.exports = {
  evaluateDefinitionOfDoneRule
};