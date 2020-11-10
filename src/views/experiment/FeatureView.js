import {
  findMinimaLocations,
  chuckFeaturesByMinima,
  findTimeInCycles,
} from "../../util.js";

const MARGINS = {
  left: 30,
  top: 30,
  bottom: 24,
  right: 10,
};

export class FeatureView {
  constructor({ name, data, container }) {
    this.name = name;
    this.data = data;
    this.container = container;

    this.svg = container.select("svg");
    this.svg.selectAll("*").remove();

    this.width = this.container.select(".svg-wrapper").node().clientWidth;
    this.height = this.container.select(".svg-wrapper").node().clientHeight;

    this.svg.attr("width", this.width).attr("height", this.height);

    this.container.select(".view-title").text(name);

    this.setupChart();
    this.drawChart();
  }

  setTime(t) {
    // console.log("FeatureView time:", t);
  }

  setupChart() {
    // haha
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

        // console.log()
      })
      .catch(console.error);
  }
}
