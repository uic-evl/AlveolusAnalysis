import { NUM_TIMESTEPS } from "../../global.js";
import { findMinimaLocations } from "../../util.js";

const MARGINS = {
  left: 40,
  top: 15,
  bottom: 15,
  right: 10,
};

export class TimelineView {
  topData = null;
  botData = null;

  time = 1;
  playInterval = undefined;

  constructor({ container, onChange }) {
    this.container = container;
    this.onChange = onChange;

    this.svg = container.select("svg");
    this.svg.selectAll("*").remove();

    this.width = this.container.select(".svg-wrapper").node().clientWidth;
    this.height = this.container.select(".svg-wrapper").node().clientHeight;

    this.svg.attr("width", this.width).attr("height", this.height);

    console.log("TimelineView", this);

    container
      .select("input")
      .attr("max", NUM_TIMESTEPS)
      .on("input", ({ target }) => {
        const { value } = target;
        this.time = +value;

        this.onChange({
          top: value,
          bot: value,
        });
      });

    this.setupControls();
    this.setupTimeline();
  }

  setTime(t) {
    this.time = t;
    this.container.select("input").attr("value", t);

    this.onChange({
      top: t,
      bot: t,
    });
  }

  setTopData({ data }) {
    this.topData = data;
    this.drawPath({ data, scale: this.yScaleTop, name: "top-path" });
  }

  setBotData({ data }) {
    this.botData = data;
    this.drawPath({ data, scale: this.yScaleBot, name: "bot-path" });
  }

  setupControls() {
    const view = this;

    this.container.select("#play-button").on("click", function () {
      const button = d3.select(this);

      if (view.playInterval) {
        clearInterval(view.playInterval);
        view.playInterval = undefined;

        button.text("Play");
      } else {
        view.playInterval = setInterval(() => {
          view.setTime((view.time + 1) % NUM_TIMESTEPS);
        }, 50);

        button.text("Pause");
      }
    });
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

    // this.sliderG = this.svg.append("g");

    // this.sliderG
    //   .append("line")
    //   .attr("y1", MARGINS.top)
    //   .attr("y2", this.height - MARGINS.bottom)
    //   .attr("x1", MARGINS.left)
    //   .attr("x2", MARGINS.left)
    //   .style("stroke", "#00ffff")
    //   .style("stroke-linecap", "round")
    //   .style("stroke-width", 4);
  }

  drawPath({ data, scale, name }) {
    const line = d3.area().y0(scale(0.6)).curve(d3.curveMonotoneX);

    data
      .getAllFeatures()
      .then((features) => {
        const minima = findMinimaLocations(features);

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

        this.paths
          .selectAll(`.${name}-minima`)
          .data(minima)
          .join("line")
          .attr("class", `${name}-minima`)
          .attr("x1", this.xScale)
          .attr("x2", this.xScale)
          .attr("y1", scale(0.6))
          .attr("y2", scale(0))
          .attr("stroke-width", 1)
          .attr("stroke", "var(--accent)")
          .attr("stroke-dasharray", "4 4");
      })
      .catch((err) => {
        console.error(err);
        d3.select(`.${name}`).attr("visibility", "hidden");
      });
  }
}
