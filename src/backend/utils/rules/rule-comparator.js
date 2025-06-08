function compareStats(mainRepo, comparisonRepos, statsToCompare) {
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
      if (mainValue >= compValue && mainValue != 0) higherCount++;
      else if (mainValue < compValue) lowerCount++;
    }

    let evaluation = 'average';
    if (mainValue === 0) {
      evaluation = 'details.not_applied';
      Cero++;
    } else if (higherCount >= lowerCount) {
      evaluation = 'details.completed';
      Completa++;
    } else if (lowerCount > higherCount) {
      evaluation = 'details.not_completed';
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

  let status = 'details.partialy_surpassed';
  if (Completa === statsToCompare.length) status = 'details.surpassed';
  else if (Cero === statsToCompare.length) status = 'details.not_applied';
  else if ((Incompleta + Cero) === statsToCompare.length) status = 'details.not_surpassed';

  return {
    status,
    resultDetails,
    totalStats: statsToCompare.length,
    statsBetter: Completa
  };
}

function validateAverageDays(averageDays) {
  const validatedAverageDays = parseInt(averageDays, 10);
  if (isNaN(averageDays) || averageDays <= 0) {
    throw new Error("El número de días debe ser un número entero positivo.");
  }
  return validatedAverageDays;
}

module.exports = {
  compareStats,
  validateAverageDays
};
