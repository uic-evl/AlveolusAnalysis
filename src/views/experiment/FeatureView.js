import {
  findMinimaLocations,
  chuckFeaturesByMinima,
  findTimeInCycles,
} from "../../util.js";

export class FeatureView {
  constructor({ data, container }) {
    this.data = data;
    this.container = container;

    // ... do stuff here

    console.log("FeatureView", this);

    this.drawChart();
  }

  setTime(t) {
    // console.log("FeatureView time:", t);
  }

  drawChart() {
    this.data
      .getAllFeatures()
      .then((features) => {
        const minima = findMinimaLocations(features);
        const cycles = chuckFeaturesByMinima(features, minima);

        const cycleLocations = d3
          .range(features.length)
          .map((t) => findTimeInCycles(t, cycles));
      })
      .catch(console.error);
  }
}
