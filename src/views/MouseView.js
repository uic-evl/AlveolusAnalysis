//const ITEMS = ["control", "tys"];

import { ITEMS } from "../global.js";
import { FeatureModel } from "../models/FeatureModel.js";
import { chuckFeaturesByMinima, findMinimaLocations } from "../util.js";

const MARGINS = {
  top: 10,
  bottom: 10,
  left: 10,
  right: 10,
};

const formatter = d3.format(".4~s");

export class MouseView {
  constructor({ container, setTop, setBot, data }) {
    this.container = container;

    this.setTop = setTop;
    this.setBot = setBot;

    // ... do stuff here

    console.log("MouseView", this);

    this.list = this.container.select(".list");

    const view = this;

    this.list
      .selectAll(".mouse")
      .data(ITEMS)
      .join("div")
      .attr("class", "mouse dp-4")
      .each(function (d) {
        const mouse = d3.select(this);

        const title = mouse
          .selectAll(".name")
          .data([null])
          .join("div")
          .attr("class", "name")
          .each(function () {
            d3.select(this).append("span").text(d);
          });

        view.width = mouse.node().clientWidth - 24;
        view.height = mouse.node().clientWidth - 24;

        mouse
          .selectAll("svg")
          .data([null])
          .join("svg")
          .attr("width", view.width)
          .attr("height", view.height)
          .call(kiviat, view.width, view.height, d);

        const buttons = title
          .selectAll(".buttons")
          .data([null])
          .join("div")
          .attr("class", "buttons");

        buttons
          .selectAll("button")
          .data(["setTop", "setBot"])
          .join("button")
          .text((set) => set.substring(3))
          .on("click", (e, set) => {
            const setter = view[set];

            console.log(set, d);

            setter({ name: d });
          });
      });
  }
}

function kiviat(svg, width, height, name) {
  const data = new FeatureModel({ name });

  const numAttributes = Object.keys(calculators).length; // Object.keys(data).length

  const axisG = svg
    .append("g")
    .attr("class", "axis-g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  const overlay = svg
    .append("g")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  overlay
    .append("rect")
    .attr("width", width - 20)
    .attr("height", 40)
    .attr("x", (width - 20) / -2)
    .attr("y", -20)
    .attr("rx", 8)
    .style("fill", "#000c");

  overlay
    .append("text")
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .attr("x", 0)
    .attr("y", -8)
    .text("Attribute Label");

  overlay
    .append("text")
    .attr("class", "value")
    .attr("text-anchor", "middle")
    .attr("x", 0)
    .attr("y", 14)
    .attr("font-size", 16)
    .text("value");

  data.getAllFeatures().then((features) => {
    console.group(name + " - metrics");

    const percentages = {};
    const values = {};

    for (let key of Object.keys(calculators)) {
      values[key] = calculators[key](features);

      percentages[key] =
        (values[key] - domains[key][0]) / (domains[key][1] - domains[key][0]);
    }

    console.log(percentages);

    console.groupEnd();

    axisG
      .selectAll(".kiv-axis")
      .data(d3.range(Object.keys(labels).length))
      .join("line")
      .attr("class", "kiv-axis")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", width / 2 - MARGINS.left)
      .attr("y2", 0)
      .attr("transform", (d, i) => `rotate(${-90 + (360 * i) / numAttributes})`)
      .on("mouseover", (e, i) => {
        const key = Object.keys(labels)[i];

        overlay
          .style("opacity", 1)
          .attr(
            "transform",
            `translate(${width / 2}, ${
              ((i > 1 && i < 5 ? 1 : 3) * height) / 4
            })`
          );

        overlay.select(".label").text(labels[key]);
        overlay.select(".value").text(formatter(values[key]));
      })
      .on("mouseleave", () => overlay.style("opacity", 0));

    axisG
      .append("g")
      .attr("class", "kiviat-g")
      // .attr("transform", `translate(${width / 2}, ${height / 2})`)
      .call(
        kiviatShape,
        [6, width / 2 - MARGINS.left - 6],
        Object.keys(labels).map((key) => percentages[key])
      );
  });
}

function kiviatShape(g, extent, data) {
  const points = data.map((d, i) =>
    rotatePoint(
      d * (extent[1] - extent[0]) + extent[0],
      -90 + (360 * i) / data.length
    )
  );

  g.append("path")
    .attr("d", `M ${points.map((p) => p.join(", ")).join(" L ")} Z`)
    .attr("fill", "#00ffff77");
}

function rotatePoint(x, deg) {
  return [
    x * Math.cos((Math.PI * deg) / 180),
    x * Math.sin((Math.PI * deg) / 180),
  ];
}

const domains = {
  // mean # alv across time
  meanAlvCount: [15, 25],
  // mean # neut across time
  meanNeutCount: [0, 20],
  // max diff min/max air %
  maxAirPercent: [45, 55],
  // max of (mean neut area per cycle) across cycles
  maxNeutArea: [0, 200],
  // abs difference in air % - start to end (max point in cycle)
  absAirPercentChange: [-5, 5],
  // neut area change % - start to end  (mean per cycle)
  neutAreaChange: [-500, 500],
};

const labels = {
  // mean # alv across time
  meanAlvCount: "Mean # Alveoli",
  // mean # neut across time
  meanNeutCount: "Mean # Neut.",
  // max air %
  maxAirPercent: "Max Air %",
  // max of (mean neut area per cycle) across cycles
  maxNeutArea: "Max Neut. Area across Cycles",
  // abs difference in air % - start to end (max point in cycle)
  absAirPercentChange: "Max Air % Trend",
  // neut area change % - start to end  (mean per cycle)
  neutAreaChange: "Mean Neut. Area Trend",
};

const calculators = {
  // mean # alv across time
  meanAlvCount: (timesteps) =>
    d3.mean(timesteps, (time) => Object.keys(time.areas_per_alveoli).length),
  // mean # neut across time
  meanNeutCount: (timesteps) =>
    d3.mean(timesteps, (time) => Object.keys(time.areas_per_neutrophil).length),
  // max air %
  maxAirPercent: (timesteps) =>
    d3.max(
      timesteps,
      ({ alveoli_area, interstitial_area }) => alveoli_area / interstitial_area
    ) * 100,
  // max of (mean neut area per cycle) across cycles
  maxNeutArea: (timesteps) =>
    d3.max(
      chuckFeaturesByMinima(timesteps, findMinimaLocations(timesteps)),
      (cycle) =>
        d3.mean(cycle, (time) => Object.values(time.areas_per_neutrophil))
    ),
  // abs difference in air % - start to end (max point in cycle)
  absAirPercentChange: (timesteps) => {
    const cycles = chuckFeaturesByMinima(
      timesteps,
      findMinimaLocations(timesteps)
    );

    const [start, end] = [cycles[1], cycles[cycles.length - 2]];

    const startPerc =
      d3.max(
        start,
        ({ alveoli_area, interstitial_area }) =>
          alveoli_area / interstitial_area
      ) * 100;
    const endPerc =
      d3.max(
        end,
        ({ alveoli_area, interstitial_area }) =>
          alveoli_area / interstitial_area
      ) * 100;

    return endPerc - startPerc;
  },
  // neut area change % - start to end  (mean per cycle)
  neutAreaChange: (timesteps) => {
    const cycles = chuckFeaturesByMinima(
      timesteps,
      findMinimaLocations(timesteps)
    );

    const [start, end] = [cycles[1], cycles[cycles.length - 2]];

    const startPerc = d3.mean(start, ({ neutrophil_area }) => neutrophil_area);
    const endPerc = d3.mean(end, ({ neutrophil_area }) => neutrophil_area);

    return endPerc - startPerc;
  },
};
