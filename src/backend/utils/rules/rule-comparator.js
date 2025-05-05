function compareStats(mainRepo, comparisonRepos, statsToCompare) {
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
        if (mainValue > compValue) higherCount++;
        else if (mainValue < compValue) lowerCount++;
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
  
    return { status, resultDetails };
  }
  
  module.exports = {
    compareStats
  };
  