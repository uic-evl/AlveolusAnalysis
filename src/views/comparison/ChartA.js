//const NUM_TIMESTEPS = 20;

import { NUM_TIMESTEPS } from "../../global.js";

const MARGINS = {
  left: 40,
  top: 30,
  bottom: 25,
  right: 10,
};

export class ChartA {
  topData = null;
  botData = null;

  constructor({ container }) {
    this.container = container;

    this.svg = container.select("svg");

    this.width = this.container.node().clientWidth;
    this.height = this.container.node().clientHeight;

    this.svg
      .attr("width", this.container.node().clientWidth)
      .attr("height", this.container.node().clientHeight);

    this.svg
      .append("text")
      .attr("x", 6)
      .attr("y", MARGINS.top - 12)
      .attr("font-size", 14)
      .text("Experiments Difference Over Time");

    console.log("ChartA", this);
  }

  setTopData({ data }) {
    this.topData = data;

    this.drawChart();
  }

  setBotData({ data }) {
    this.botData = data;

    this.drawChart();
  }

  drawCoordinate({ min_I, min_A, min_N, max_I, max_A, max_N }) {
    this.svg.selectAll("g").remove();

    this.xAxis = this.svg.append("g");
    this.yAxis = this.svg.append("g");

    const gap = 15;
    const titlegap =
      0.1 * ((this.height - MARGINS.top - MARGINS.bottom - 3 * gap) / 3);
    const yScale_length =
      0.9 * ((this.height - MARGINS.top - MARGINS.bottom - 3 * gap) / 3);

    this.svg
      .append("text")
      .attr("x", MARGINS.left)
      .attr("y", MARGINS.top + gap)
      .attr("font-size", 10)
      .attr("text-anchor", "start")
      .text("Interstitial Area Difference");

    this.svg
      .append("text")
      .attr("x", MARGINS.left)
      .attr("y", yScale_length + MARGINS.top + 2 * gap + titlegap)
      .attr("font-size", 10)
      .attr("text-anchor", "start")
      .text("Alveolus Area Difference");

    this.svg
      .append("text")
      .attr("x", MARGINS.left)
      .attr("y", 2 * yScale_length + MARGINS.top + 3 * gap + 2 * titlegap)
      .attr("font-size", 10)
      .attr("text-anchor", "start")
      .text("Neutrophil Area Difference");

    //y-axis for interstitial area
    this.yScale_I = d3
      .scaleLinear()
      .domain([min_I, max_I])
      .range([
        yScale_length + MARGINS.top + titlegap + gap,
        MARGINS.top + titlegap + gap,
      ]);

    const yAxis_I = d3
      .axisLeft(this.yScale_I)
      .ticks(3)
      .tickFormat(d3.format(".3~s"));

    this.yAxis
      .append("g")
      .attr("class", "y-axis chart1_yaxis")
      .call(yAxis_I)
      .attr("transform", `translate(${MARGINS.left}, 0)`);

    //y-axis for alveoli area
    this.yScale_A = d3
      .scaleLinear()
      .domain([min_A, max_A])
      .range([
        2 * yScale_length + MARGINS.top + 2 * gap + 2 * titlegap,
        yScale_length + MARGINS.top + 2 * gap + 2 * titlegap,
      ]);

    const yAxis_A = d3
      .axisLeft(this.yScale_A)
      .ticks(3)
      .tickFormat(d3.format(".3~s"));

    this.yAxis
      .append("g")
      .attr("class", "y-axis chart1_yaxis")
      .call(yAxis_A)
      .attr("transform", `translate(${MARGINS.left}, 0)`);

    //y-axis for neutrophil area
    this.yScale_N = d3
      .scaleLinear()
      .domain([min_N, max_N])
      .range([
        3 * yScale_length + MARGINS.top + 3 * gap + 3 * titlegap,
        2 * yScale_length + MARGINS.top + 3 * gap + 3 * titlegap,
      ]);

    const yAxis_N = d3.axisLeft(this.yScale_N).ticks(3);

    this.yAxis
      .append("g")
      .attr("class", "y-axis chart1_yaxis")
      .call(yAxis_N)
      .attr("transform", `translate(${MARGINS.left}, 0)`);

    //x-axis for time
    this.timeScale = d3
      .scaleLinear()
      .domain([1, NUM_TIMESTEPS])
      .range([MARGINS.left, this.width - MARGINS.right]);

    const timeAxis = d3.axisBottom(this.timeScale).ticks(5);

    this.xAxis
      .append("g")
      .attr("class", "x-axis")
      .call(timeAxis)
      .attr("transform", `translate(0, ${this.height - MARGINS.bottom})`);
  }

  drawChart() {
    if (!this.topData || !this.botData) {
      return;
    }
    Promise.all([
      this.topData.getAllFeatures().catch((err) => []),
      this.botData.getAllFeatures().catch((err) => []),
    ]).then(([topFeatures, botFeatures]) => {
      //get the difference
      this.diff = [];

      topFeatures.forEach((eachtop, index) => {
        const eachbottom = botFeatures[index];
        this.diff.push({
          alveoli_diff: eachtop.alveoli_area - eachbottom.alveoli_area,
          interstitial_diff:
            eachtop.interstitial_area - eachbottom.interstitial_area,
          neutrophil_diff: eachtop.neutrophil_area - eachbottom.neutrophil_area,
        });
      });

      //get the max and min for differnece
      const [min_I, max_I] = d3.extent(this.diff, (d) => d.interstitial_diff);
      const [min_A, max_A] = d3.extent(this.diff, (d) => d.alveoli_diff);
      const [min_N, max_N] = d3.extent(this.diff, (d) => d.neutrophil_diff);

      const start_I = this.diff[0].interstitial_diff;
      const start_A = this.diff[0].alveoli_diff;
      const start_N = this.diff[0].neutrophil_diff;

      //draw coordiantes
      this.drawCoordinate({ min_I, min_A, min_N, max_I, max_A, max_N });

      //draw three line chart

      const { timeScale, yScale_I, yScale_N, yScale_A } = this;

      this.paths_I = this.svg.append("g");
      this.paths_A = this.svg.append("g");
      this.paths_N = this.svg.append("g");

      //draw line for interstitial area
      this.paths_I;

      this.paths_I
        .selectAll("patharea")
        .data([this.diff])
        .join("path")
        .attr("fill", "#1f78b4")
        .attr("fill-opacity", 0.2)
        .attr("stroke", "none")
        .attr(
          "d",
          d3
            .area()
            .x(function (d, i) {
              return timeScale(i + 1);
            })
            .y0(function (d) {
              return yScale_I(start_I);
            })
            .y1(function (d) {
              return yScale_I(d.interstitial_diff);
            })
        );

      this.paths_I
        .selectAll("pathline")
        .data([this.diff])
        .join("path")
        .attr("fill", "none")
        .attr("stroke", "#1f78b4")
        .attr("stroke-width", 2)
        .attr(
          "d",
          d3
            .line()
            .x(function (d, i) {
              return timeScale(i + 1);
            })
            .y(function (d) {
              return yScale_I(d.interstitial_diff);
            })
        );

      //draw line for alveoli area

      this.paths_A;

      this.paths_A
        .selectAll("patharea")
        .data([this.diff])
        .join("path")
        .attr("fill", "#C1C1C1")
        .attr("fill-opacity", 0.3)
        .attr("stroke", "none")
        .attr(
          "d",
          d3
            .area()
            .x(function (d, i) {
              return timeScale(i + 1);
            })
            .y0(function (d) {
              return yScale_A(start_A);
            })
            .y1(function (d) {
              return yScale_A(d.alveoli_diff);
            })
        );

      this.paths_A
        .selectAll("pathline")
        .data([this.diff])
        .join("path")
        .attr("fill", "none")
        .attr("stroke", "#C1C1C1")
        .attr("stroke-width", 2)
        .attr(
          "d",
          d3
            .line()
            .x(function (d, i) {
              return timeScale(i + 1);
            })
            .y(function (d) {
              return yScale_A(d.alveoli_diff);
            })
        );

      //draw line for neutrophil area

      this.paths_N;

      this.paths_N
        .selectAll("patharea")
        .data([this.diff])
        .join("path")
        .attr("fill", "#9CCC9C")
        .attr("fill-opacity", 0.3)
        .attr("stroke", "none")
        .attr(
          "d",
          d3
            .area()
            .x(function (d, i) {
              return timeScale(i + 1);
            })
            .y0(function (d) {
              return yScale_N(start_N);
            })
            .y1(function (d) {
              return yScale_N(d.neutrophil_diff);
            })
        );

      this.paths_N
        .selectAll("pathline")
        .data([this.diff])
        .join("path")
        .attr("fill", "none")
        .attr("stroke", "#9CCC9C")
        .attr("stroke-width", 2)
        .attr(
          "d",
          d3
            .line()
            .x(function (d, i) {
              return timeScale(i + 1);
            })
            .y(function (d) {
              return yScale_N(d.neutrophil_diff);
            })
        );

      //console.log("topFeatures",topFeatures,"botFeatures",botFeatures,"difference",this.diff);
    });
  }
}
