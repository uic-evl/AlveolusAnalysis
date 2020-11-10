//const NUM_TIMESTEPS = 20;

import { NUM_TIMESTEPS } from "../../global.js";

const MARGINS = {
  left: 40,
  top: 15,
  bottom: 15,
  right: 10,
};

export class TimelineView {
  topData = null;
  botData = null;

  constructor({ container, onChange }) {
    this.container = container;
    this.onChange = onChange;

    this.svg = container.select("svg");

    this.width = this.container.node().clientWidth;
    this.height = this.container.node().clientHeight;

    this.svg
      .attr("width", this.container.node().clientWidth)
      .attr("height", this.container.node().clientHeight);

    console.log("TimelineView", this);

    container
      .select("input")
      .attr("max", NUM_TIMESTEPS)
      .on("input", ({ target }) => {
        const { value } = target;

        this.onChange({
          top: value,
          bot: value,
        });
      });

    this.setupTimeline();
  }

  setTopData({ data }) {
    this.topData = data;
    this.drawPath({ data, scale: this.yScaleTop, name: "top-path" });
  }

  setBotData({ data }) {
    this.botData = data;
    this.drawPath({ data, scale: this.yScaleBot, name: "bot-path" });
  }

  setupTimeline() {
    // this.svg
    //   .append("rect")
    //   .attr("x", MARGINS.left)
    //   .attr("y", MARGINS.top)
    //   .attr("width", this.width - MARGINS.left - MARGINS.right)
    //   .attr("height", this.height - MARGINS.top - MARGINS.bottom)
    //   .style("fill", "none")
    //   .style("stroke", "orange");
    this.paths = this.svg.append("g");

    this.axes = this.svg.append("g");

    this.xScale = d3
      .scaleLinear()
      .domain([1, NUM_TIMESTEPS])
      .range([MARGINS.left, this.width - MARGINS.right]);

    const xAxis = d3.axisBottom(this.xScale);

    const midpoint =
      MARGINS.top + (this.height - MARGINS.top - MARGINS.bottom) / 2;

    this.axes
      .append("g")
      .attr("class", "x-axis")
      .call(xAxis)
      .attr("transform", `translate(0, ${midpoint})`);

    this.yScaleTop = d3
      .scaleLinear()
      .domain([0, 0.6])
      .range([midpoint, MARGINS.top]);

    const yAxisTop = d3.axisLeft(this.yScaleTop).ticks(3);

    this.axes
      .append("g")
      .attr("class", "y-axis y-axis-top")
      .call(yAxisTop)
      .attr("transform", `translate(${MARGINS.left}, 0)`);

    this.yScaleBot = d3
      .scaleLinear()
      .domain([0, 0.6])
      .range([midpoint, this.height - MARGINS.bottom]);

    const yAxisBot = d3.axisLeft(this.yScaleBot).ticks(3);

    this.axes
      .append("g")
      .attr("class", "y-axis y-axis-bot")
      .call(yAxisBot)
      .attr("transform", `translate(${MARGINS.left}, 0)`);
  }

  drawPath({ data, scale, name }) {
    const line = d3.area().y0(scale(0.6)).curve(d3.curveMonotoneX);

    data
      .getAllFeatures()
      .then((features) => {
        this.paths;

        const ratios = features.map(
          ({ alveoli_area, interstitial_area }) =>
            alveoli_area / interstitial_area
        );

        this.paths
          .selectAll(`.${name}`)
          .data([
            ratios.map((ratio, index) => [
              this.xScale(index + 1),
              scale(ratio),
            ]),
          ])
          .join("path")
          .attr("class", `ratio-path ${name}`)
          .attr("visibility", "visible")
          .attr("d", line);
      })
      .catch(() => {
        d3.select(`.${name}`).attr("visibility", "hidden");
      });
  }
}
