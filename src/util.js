export function findMinimaLocations(features) {
  const minima = [];

  for (let i = 0; i < features.length; i++) {
    const timesteps = d3
      .range(i - 3, i + 4)
      .filter((t) => t >= 0 && t < features.length);

    const min = d3.minIndex(timesteps, (t) => features[t].alveoli_area);

    if (timesteps[min] === i && i !== 0 && i !== features.length - 1) {
      minima.push(i + 1);
    }
  }

  return minima;
}

export function chuckFeaturesByMinima(features, minima) {
  return [
    features.slice(0, minima[0]),
    ...minima.map((start, i) =>
      features.slice(
        Math.max(0, start - 1),
        minima[i + 1] ? minima[i + 1] : undefined
      )
    ),
  ];
}

export function findTimeInCycles(t, cycles) {
  let currInd = 0;
  for (let c in cycles) {
    const cycle = cycles[c];

    if (currInd + cycle.length - 1 < t) {
      // in next cycle
      currInd += cycle.length - 1;
    } else {
      return { c: +c, t: t - currInd };
    }
  }
}
