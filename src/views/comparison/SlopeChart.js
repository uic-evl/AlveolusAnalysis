import { findMinimaLocations, chuckFeaturesByMinima } from "../../util.js";

const MARGINS = {
  left: 45,
  top: 80,
  bottom: 25,
  right: 45,
};

export class SlopeChart {
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
      .attr("x", 26)
      .attr("y", 24)
      .attr("font-size", 16)
      .attr("font-weight", 300)
      .text("Area Change Start-to-End");

    const xlength = 0.5 * (this.width - 2 * MARGINS.left - 2 * MARGINS.right);

    const ratioLabel = this.svg
      .append("text")
      .attr("x", MARGINS.left + xlength / 2)
      .attr("y", MARGINS.top - 10)
      .attr("font-size", 12)
      .attr("text-anchor", "middle");

    ratioLabel
      .append("tspan")
      .style("fill", "#F4BC1C")
      .style("font-weight", 600)
      .text("Ratio:  ");

    ratioLabel
      .append("tspan")
      .style("font-style", "italic")
      .style("color", "var(--inter)")
      .text("Interstitial");

    ratioLabel.append("tspan").text(" / ");

    ratioLabel
      .append("tspan")
      .style("font-style", "italic")
      .style("color", "white")
      .text("Total");

    this.svg
      .append("text")
      .attr("x", this.width - MARGINS.right - xlength / 2)
      .attr("y", MARGINS.top - 10)
      .attr("font-size", 12)
      .style("font-style", "italic")
      .style("color", "var(--neut)")
      .attr("text-anchor", "middle")
      .text("Neutrophil Area");

    this.svg
      .append("text")
      .attr("x", MARGINS.left)
      .attr("y", this.height - MARGINS.bottom + 14)
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .text("Start");

    this.svg
      .append("text")
      .attr("x", this.width - MARGINS.right - xlength)
      .attr("y", this.height - MARGINS.bottom + 14)
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .text("Start");

    this.svg
      .append("text")
      .attr("x", MARGINS.left + xlength)
      .attr("y", this.height - MARGINS.bottom + 14)
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .text("End");

    this.svg
      .append("text")
      .attr("x", this.width - MARGINS.right)
      .attr("y", this.height - MARGINS.bottom + 14)
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .text("End");

    console.log("ChartC", this);

    tippy(this.container.select(".tooltip-trigger").node(), {
      content:
        "The change in Interstitial % and Neutrophil area from the Start to End of the selected experiments",
      animation: "scale",
      placement: "left",
      maxWidth: 300,
    });
  }

  setTopData({ data }) {
    this.topData = data;

    this.drawChart();
  }

  setBotData({ data }) {
    this.botData = data;

    this.drawChart();
  }

  drawCoordinate({ min_AI, max_AI, min_N, max_N }) {
    this.svg.selectAll("g").remove();

    const legendG = this.svg
      .append("g")
      .attr("transform", `translate(${MARGINS.left}, ${MARGINS.top - 36})`);

    legendG
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 32)
      .attr("y2", 0)
      .attr("stroke", "#ccc")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 4);

    legendG
      .append("text")
      .attr("x", 40)
      .attr("y", 4)
      .attr("class", "top-label")
      .attr("fill", "#ccc")
      .attr("stroke-width", 4)
      .attr("font-size", 14)
      .text("TEST TEST");

    legendG
      .append("line")
      .attr("x1", 120)
      .attr("y1", 0)
      .attr("x2", 120 + 32)
      .attr("y2", 0)
      .attr("stroke", "#ccc")
      .attr("stroke-dasharray", "5 8")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 4);

    legendG
      .append("text")
      .attr("x", 120 + 40)
      .attr("y", 4)
      .attr("class", "bot-label")
      .attr("fill", "#ccc")
      .attr("stroke-width", 4)
      .attr("font-size", 14)
      .text("TEST TEST");

    this.yAxis = this.svg.append("g");

    //const gap =  0.1*(this.height-MARGINS.bottom-MARGINS.top);
    //const gap =  0.1*(this.width-2*MARGINS.left-2*MARGINS.right);
    //const ylength = 0.45*(this.height-MARGINS.bottom-MARGINS.top);
    const xlength = 0.5 * (this.width - 2 * MARGINS.left - 2 * MARGINS.right);

    //y-axis for interstitial area
    this.yScale = d3
      .scaleLinear()
      .domain([min_AI, max_AI])
      .range([this.height - MARGINS.bottom, MARGINS.top]);

    this.yScale_N = d3
      .scaleLinear()
      .domain([min_N, max_N])
      .range([this.height - MARGINS.bottom, MARGINS.top]);

    const yAxis_left = d3
      .axisLeft(this.yScale)
      .ticks(4)
      .tickFormat(d3.format(".3~%"));

    this.yAxis
      .append("g")
      .attr("class", "y-axis chart1_yaxis")
      .call(yAxis_left)
      .attr("transform", `translate(${MARGINS.left}, 0)`);

    const yAxis_right = d3
      .axisRight(this.yScale)
      .ticks(4)
      .tickFormat(d3.format(".3~%"));

    this.yAxis
      .append("g")
      .attr("class", "y-axis chart1_yaxis")
      .call(yAxis_right)
      .attr("transform", `translate(${MARGINS.left + xlength}, 0)`);

    const yAxis_left_N = d3.axisLeft(this.yScale_N).ticks(4);

    this.yAxis
      .append("g")
      .attr("class", "y-axis chart1_yaxis")
      .call(yAxis_left_N)
      .attr(
        "transform",
        `translate(${this.width - MARGINS.right - xlength}, 0)`
      );

    const yAxis_right_N = d3.axisRight(this.yScale_N).ticks(4);

    this.yAxis
      .append("g")
      .attr("class", "y-axis chart1_yaxis")
      .call(yAxis_right_N)
      .attr("transform", `translate(${this.width - MARGINS.right}, 0)`);
  }

  drawChart() {
    if (!this.topData || !this.botData) {
      return;
    }
    Promise.all([
      this.topData.getAllFeatures().catch((err) => []),
      this.botData.getAllFeatures().catch((err) => []),
    ]).then(([topFeatures, botFeatures]) => {
      const topminima = findMinimaLocations(topFeatures);
      const botminima = findMinimaLocations(botFeatures);
      const topcycles = chuckFeaturesByMinima(topFeatures, topminima);
      const botcycles = chuckFeaturesByMinima(botFeatures, botminima);

      //get mean values from first cycle
      //top
      const topstart_I = d3.mean(topcycles[1], (d) => d.interstitial_area);
      const topstart_A = d3.mean(topcycles[1], (d) => d.alveoli_area);
      const topstart_N = d3.mean(topcycles[1], (d) => d.neutrophil_area);
      //bottom
      const botstart_I = d3.mean(botcycles[1], (d) => d.interstitial_area);
      const botstart_A = d3.mean(botcycles[1], (d) => d.alveoli_area);
      const botstart_N = d3.mean(botcycles[1], (d) => d.neutrophil_area);

      //get mean values from last cycle
      //top
      const topend_I = d3.mean(
        topcycles[topcycles.length - 2],
        (d) => d.interstitial_area
      );
      const topend_A = d3.mean(
        topcycles[topcycles.length - 2],
        (d) => d.alveoli_area
      );
      const topend_N = d3.mean(
        topcycles[topcycles.length - 2],
        (d) => d.neutrophil_area
      );
      //bottom
      const botend_I = d3.mean(
        botcycles[botcycles.length - 2],
        (d) => d.interstitial_area
      );
      const botend_A = d3.mean(
        botcycles[botcycles.length - 2],
        (d) => d.alveoli_area
      );
      const botend_N = d3.mean(
        botcycles[botcycles.length - 2],
        (d) => d.neutrophil_area
      );

      const [min_AI, max_AI] = d3.extent([
        topstart_I / (topstart_I + topstart_A),
        botstart_I / (botstart_I + botstart_A),
        topend_I / (topend_I + topend_A),
        botend_I / (botend_I + botend_A),
      ]);
      const [min_N, max_N] = d3.extent([
        topstart_N,
        botstart_N,
        topend_N,
        botend_N,
      ]);

      this.drawCoordinate({ min_AI, max_AI, min_N, max_N });

      this.lines = this.svg.append("g");

      const { yScale, yScale_N } = this;
      const xlength = 0.5 * (this.width - 2 * MARGINS.left - 2 * MARGINS.right);

      //ratio
      this.lines
        .append("line")
        .attr("x1", MARGINS.left)
        .attr("x2", MARGINS.left + xlength)
        .attr("y1", yScale(topstart_I / (topstart_I + topstart_A)))
        .attr("y2", yScale(topend_I / (topend_I + topend_A)))
        .attr("stroke", "#F4BC1C")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 4);

      this.lines
        .append("line")
        .attr("x1", MARGINS.left)
        .attr("x2", MARGINS.left + xlength)
        .attr("y1", yScale(botstart_I / (botstart_I + botstart_A)))
        .attr("y2", yScale(botend_I / (botend_I + botend_A)))
        .attr("stroke", "#F4BC1C")
        .attr("stroke-dasharray", "5 8")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 4);

      //neutrophil
      this.lines
        .append("line")
        .attr("x1", this.width - MARGINS.right - xlength)
        .attr("x2", this.width - MARGINS.right)
        .attr("y1", yScale_N(topstart_N))
        .attr("y2", yScale_N(topend_N))
        .attr("stroke", "var(--neut)")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 4);

      this.lines
        .append("line")
        .attr("x1", this.width - MARGINS.right - xlength)
        .attr("x2", this.width - MARGINS.right)
        .attr("y1", yScale_N(botstart_N))
        .attr("y2", yScale_N(botend_N))
        .attr("stroke", "var(--neut)")
        .attr("stroke-linecap", "round")
        .attr("stroke-dasharray", "5 8")
        .attr("stroke-width", 4);

      //console.log(topstart_I, topend_I);

      this.svg.select(".top-label").text(this.topData.name);
      this.svg.select(".bot-label").text(this.botData.name);
    });
  }
}
