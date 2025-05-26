function compareStats(mainRepo, comparisonRepos, statsToCompare) {
  const resultDetails = [];
  let Bien = 0;
  let Mal = 0;
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
      evaluation = 'Cero';
      Cero++;
    } else if (higherCount >= lowerCount) {
      evaluation = 'Bien';
      Bien++;
    } else if (lowerCount > higherCount) {
      evaluation = 'Mal';
      Mal++;
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
  if (Bien === statsToCompare.length) status = 'Superada';
  else if (Cero === statsToCompare.length) status = 'Cero';
  else if ((Mal + Cero) === statsToCompare.length) status = 'No superada';

  return { 
    status, 
    resultDetails,    
    totalStats: statsToCompare.length,
    statsBetter: Bien 
  };
}

module.exports = {
  compareStats
};
