function evaluateDefinitionOfDoneRule(mainRepo, comparisonRepos) {
  const ruleName = "Scrum - Definition of Done";
  const description = "Se cierran las Issues de forma correcta y consistente";

  const statsToCompare = [
    { key: 'issue_stats.openIssuesCount', label: 'Número de Issues abiertas' },
    { key: 'issue_stats.closedIssuesCount', label: 'Número de Issues cerradas' },
    { key: 'issue_stats.reopenedIssuesPercent', label: 'Porcentaje de Issues que alguna vez fueron reabiertas' },
  ];

    const resultDetails = [];
    let better = 0;
    let worse = 0;
    let zero = 0;

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
          if (mainValue < compValue) higherCount++;
          else if (mainValue > compValue) lowerCount++;
        } else {
          if (mainValue > compValue) higherCount++;
          else if (mainValue < compValue) lowerCount++;
        }
      }

  
      let evaluation = 'average';
      if (mainValue === 0) {
        evaluation = 'zero';
        zero++;
      } else if (higherCount >= lowerCount) {
        evaluation = 'better';
        better++;
      } else if (lowerCount > higherCount) {
        evaluation = 'worse';
        worse++;
      }
  
      resultDetails.push({
        label: stat.label,
        value: mainValue,
        evaluation,
        comparedWith: comparisonRepos.map(r => r[category][field])
      });
    }
  
    let status = 'parcial';
    if (better === statsToCompare.length) status = 'approved';
    else if (zero === statsToCompare.length) status = 'zero';
    else if ((worse + zero) === statsToCompare.length) status = 'failed';

  let message = '';
  if (status === 'approved') {
    message = 'La mayoría de las tareas se completan correctamente y rara vez o nunca se reabren.';
  } else if (status === 'failed') {
    message = 'Hay muchas tareas sin cerrar o se reabren con demasiada frecuencia, lo cual indica que no se respeta una definición clara de "Done".';
  } else if (status === 'zero') {
    message = 'No hay Issues creadas en el repositorio, por lo que no puede evaluarse la definición de "Done".';
  } else {
    const problems = resultDetails.filter(d => d.evaluation === 'worse' || d.evaluation === 'zero').map(d => d.label);
    message = `El repositorio parece usar integración continua, pero podría mejorar en: ${problems.join(', ')}.`;
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
    evaluateDefinitionOfDoneRule
};