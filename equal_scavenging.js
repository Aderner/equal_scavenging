(function() {
  if (!location.href.includes('screen=place&mode=scavenge')) {
    location.href = 'https://uk82.tribalwars.co.uk/game.php?screen=place&mode=scavenge';
    return;
  }

  const unitInputs = Array.from(document.querySelectorAll('input.unitsInput'));
  const unitCounts = Array.from(document.querySelectorAll('.units-entry-all'));
  const availableUnits = {};

  unitInputs.forEach(input => {
    const unit = input.name.replace('unit_', '');
    let count = 0;
    unitCounts.forEach(unitCount => {
      if (unitCount.dataset.unit === unit) {
        count = unitCount.textContent.trim().replace(/\D/g, '');
      }
    });
    availableUnits[unit] = parseInt(count, 10);
  });

  const optionForms = Array.from(document.querySelectorAll('.scavenge-option .free_send_button'));
  const activeOptions = optionForms.filter(scavageOption =>
    scavageOption.textContent.includes('Start')
  );

  if (activeOptions.length === 0) {
    alert('No scavenging options available.');
    return;
  }

  const timeFactors = [1, 2.5, 5, 7.5];
  const selectedOptions = activeOptions.slice(0, 4);
  const selectedFactors = timeFactors.slice(0, selectedOptions.length);

  const unitDistribution = {};
  const notDistributedUnits = {};

  for (const unit in availableUnits) {
    const count = availableUnits[unit];
    const inverseSum = selectedFactors.map(f => 1 / f).reduce((a, b) => a + b, 0);
    const distribution = selectedFactors.map(f =>
      Math.floor(count * (1 / f) / inverseSum)
    );
    const distributedTotal = distribution.reduce((a, b) => a + b, 0);
    const notDistributed = count - distributedTotal;
    distribution[0] += notDistributed;
    unitDistribution[unit] = distribution;
    if (notDistributed > 0) {
      notDistributedUnits[unit] = (notDistributedUnits[unit] || 0) + notDistributed;
    }
  }

  selectedOptions.forEach((o, i) => {
    setTimeout(() => {
      const formInputs = document.querySelectorAll('.unitsInput');
      for (const unit in unitDistribution) {
        formInputs.forEach(input => {
          if (input.name === unit) {
            const value = unitDistribution[unit][i];
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }
      setTimeout(() => o.click(), 500);
    }, i * 2000);
  });
})();
