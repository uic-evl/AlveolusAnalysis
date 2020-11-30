import { NUM_TIMESTEPS } from "../../global.js";
import {
  chuckFeaturesByMinima,
  findMinimaLocations,
  getTimeFromCyclePoint,
} from "../../util.js";

const MARGINS = {
  left: 100,
  top: 18,
  bottom: 18,
  right: 10,
};

export class TimelineView {
  topData = null;
  botData = null;

  botTime = 1;
  topTime = 1;
  playInterval = undefined;
  playSpeed = 10; // images per second

  constructor({ container, onChange }) {
    this.container = container;
    this.onChange = onChange;

    this.svg = container.select("svg");
    this.svg.selectAll("*").remove();

    this.width = this.container.select(".svg-wrapper").node().clientWidth;
    this.height = this.container.select(".svg-wrapper").node().clientHeight;

    this.svg.attr("width", this.width).attr("height", this.height);

    console.log("TimelineView", this);

    this.setupControls();
    this.setupTimeline();
    this.setTime({ top: 1, bot: 1 });
  }

  setTime({ top, bot }) {
    this.topTime = top;
    this.botTime = bot;

    this.topSliderG.attr(
      "transform",
      `translate(${this.xScale(top)}, ${this.yScaleTop.range()[1] - 2})`
    );

    this.topSliderG
      .select(".slider-label")
      .style(
        "transform",
        `translate(${
          this.xScale(top) - 20 < this.xScale.range()[0]
            ? 20 - (this.xScale(top) - this.xScale.range()[0])
            : this.xScale.range()[1] - this.xScale(top) < 20
            ? -20 + (this.xScale.range()[1] - this.xScale(top))
            : 0
        }px, 0px)`
      );

    this.topSliderG
      .select(".slider-label text")
      .html(
        `<tspan style="font-style: italic; font-weight: lighter;">t=</tspan>${top}`
      );

    this.botSliderG.attr(
      "transform",
      `translate(${this.xScale(bot)}, ${this.yScaleBot.range()[1] + 2})`
    );

    this.botSliderG
      .select(".slider-label")
      .style(
        "transform",
        `translate(${
          this.xScale(bot) - 20 < this.xScale.range()[0]
            ? 20 - (this.xScale(bot) - this.xScale.range()[0])
            : this.xScale.range()[1] - this.xScale(bot) < 20
            ? -20 + (this.xScale.range()[1] - this.xScale(bot))
            : 0
        }px, 0px)`
      );

    this.botSliderG
      .select(".slider-label text")
      .html(
        `<tspan style="font-style: italic; font-weight: lighter;">t=</tspan>${bot}`
      );
  }

  setTopData({ data }) {
    this.topData = data;
    this.drawPath({ data, scale: this.yScaleTop, name: "top-path" });
    this.onChange({
      top: 1,
      bot: this.botTime,
    });

    this.svg.select(".top-label").text(data.name);
  }

  setBotData({ data }) {
    this.botData = data;
    this.drawPath({ data, scale: this.yScaleBot, name: "bot-path" });
    this.onChange({
      top: this.topTime,
      bot: 1,
    });

    this.svg.select(".bot-label").text(data.name);
  }

  play() {
    if (this.playInterval) {
      clearInterval(this.playInterval);
      this.playInterval = undefined;
    }

    this.onChange({
      top: 1 + (this.topTime % NUM_TIMESTEPS),
      bot: 1 + (this.botTime % NUM_TIMESTEPS),
    });

    this.playInterval = setInterval(() => {
      this.onChange({
        top: 1 + (this.topTime % NUM_TIMESTEPS),
        bot: 1 + (this.botTime % NUM_TIMESTEPS),
      });
    }, 1000 / this.playSpeed);
  }

  pause() {
    if (this.playInterval) {
      clearInterval(this.playInterval);
      this.playInterval = undefined;
    }
  }

  setupControls() {
    const view = this;

    this.container.select("#play-button").on("click", function () {
      const button = d3.select(this);

      if (view.playInterval) {
        view.pause();
        button.select("i").attr("class", "fas fa-play");
      } else {
        view.play();
        button.select("i").attr("class", "fas fa-pause");
      }
    });

    this.container.select("#step-forward").on("click", function () {
      view.onChange({
        top: (view.topTime + 1) % NUM_TIMESTEPS,
        bot: (view.botTime + 1) % NUM_TIMESTEPS,
      });
    });

    this.container.select("#step-back").on("click", function () {
      view.onChange({
        top: (NUM_TIMESTEPS + view.topTime - 1) % NUM_TIMESTEPS,
        bot: (NUM_TIMESTEPS + view.botTime - 1) % NUM_TIMESTEPS,
      });
    });

    this.container.select("#slow-down").on("click", function () {
      if (view.playSpeed > 1) {
        view.playSpeed--;

        if (view.playInterval) {
          view.play();
        }

        view.container.select("#speed-label").text(`${view.playSpeed}/s`);
      }
    });

    this.container.select("#speed-up").on("click", function () {
      if (view.playSpeed < 20) {
        view.playSpeed++;

        if (view.playInterval) {
          view.play();
        }

        view.container.select("#speed-label").text(`${view.playSpeed}/s`);
      }
    });
  }

  setupTimeline() {
    this.paths = this.svg.append("g");

    this.axes = this.svg.append("g");

    this.xScale = d3
      .scaleLinear()
      .domain([1, NUM_TIMESTEPS])
      .range([MARGINS.left, this.width - MARGINS.right]);

    const xAxis = d3.axisBottom(this.xScale);

    const midPadding = 16;

    const midpoint =
      MARGINS.top + (this.height - MARGINS.top - MARGINS.bottom) / 2;

    const top0 = midpoint - midPadding / 2;
    const bot0 = midpoint + midPadding / 2;

    // this.axes
    //   .append("g")
    //   .attr("class", "x-axis")
    //   .call(xAxis)
    //   .attr("transform", `translate(0, ${midpoint})`);

    this.yScaleTop = d3
      .scaleLinear()
      .domain([0, 0.6])
      .range([top0, MARGINS.top]);

    const yAxisTop = d3
      .axisLeft(this.yScaleTop)
      .ticks(3)
      .tickFormat(d3.format(".2~%"));

    this.axes
      .append("g")
      .attr("class", "y-axis y-axis-top")
      .call(yAxisTop)
      .attr("transform", `translate(${MARGINS.left}, 0)`);

    this.yScaleBot = d3
      .scaleLinear()
      .domain([0, 0.6])
      .range([bot0, this.height - MARGINS.bottom]);

    const yAxisBot = d3
      .axisLeft(this.yScaleBot)
      .ticks(3)
      .tickFormat(d3.format(".2~%"));

    this.axes
      .append("g")
      .attr("class", "y-axis y-axis-bot")
      .call(yAxisBot)
      .attr("transform", `translate(${MARGINS.left}, 0)`);

    const topRange = this.yScaleTop.range();
    const botRange = this.yScaleBot.range();

    this.svg
      .append("line")
      .attr("x1", MARGINS.left)
      .attr("x2", this.width - MARGINS.right)
      .attr("y1", topRange[0])
      .attr("y2", topRange[0])
      .style("stroke", "var(--alv)")
      .style("stroke-opacity", 0.5)
      .style("stroke-dasharray", "2 4");

    this.svg
      .append("line")
      .attr("x1", MARGINS.left)
      .attr("x2", this.width - MARGINS.right)
      .attr("y1", botRange[0])
      .attr("y2", botRange[0])
      .style("stroke", "var(--alv)")
      .style("stroke-opacity", 0.5)
      .style("stroke-dasharray", "2 4");

    this.svg
      .append("text")
      .attr("class", "top-label")
      .attr("x", (MARGINS.left - 40) / 2)
      .attr("y", (topRange[1] + topRange[0]) / 2 + 4)
      .style("fill", "var(--alv)")
      .style("font-weight", 300)
      .style("text-anchor", "middle")
      .text("top");

    this.svg
      .append("line")
      .attr("x1", MARGINS.left)
      .attr("x2", this.width - MARGINS.right)
      .attr("y1", botRange[0])
      .attr("y2", botRange[0])
      .style("stroke", "var(--alv)")
      .style("stroke-opacity", 0.5)
      .style("stroke-dasharray", "2 4");

    this.svg
      .append("text")
      .attr("class", "bot-label")
      .attr("x", (MARGINS.left - 40) / 2)
      .attr("y", (botRange[1] + botRange[0]) / 2 + 4)
      .style("fill", "var(--alv)")
      .style("font-weight", 300)
      .style("text-anchor", "middle")
      .text("bot");

    this.svg
      .append("rect")
      .attr("class", "slider-area")
      .attr("x", MARGINS.left)
      .attr("y", topRange[1])
      .attr("height", topRange[0] - topRange[1])
      .attr("width", this.width - MARGINS.left - MARGINS.right)
      .call(
        d3.drag().on("drag", (e) => {
          const t = Math.max(
            1,
            Math.min(NUM_TIMESTEPS, Math.round(this.xScale.invert(e.x)))
          );

          this.onChange({ top: t, bot: this.botTime });
        })
      );

    this.svg
      .append("rect")
      .attr("class", "slider-area")
      .attr("x", MARGINS.left)
      .attr("y", botRange[0])
      .attr("height", botRange[1] - botRange[0])
      .attr("width", this.width - MARGINS.left - MARGINS.right)
      .call(
        d3.drag().on("drag", (e) => {
          const t = Math.max(
            1,
            Math.min(NUM_TIMESTEPS, Math.round(this.xScale.invert(e.x)))
          );

          this.onChange({ bot: t, top: this.topTime });
        })
      );

    this.topSliderG = this.svg
      .append("g")
      .attr("class", "slider")
      .attr("transform", `translate(${MARGINS.left}, ${topRange[1] - 2})`);

    this.topSliderG
      .append("line")
      .attr("class", "slider-bg")
      .attr("y1", 0)
      .attr("y2", topRange[0] - topRange[1] + 2)
      .attr("x1", 0)
      .attr("x2", 0);

    this.topSliderG
      .append("line")
      .attr("class", "slider-line")
      .attr("y1", 0)
      .attr("y2", topRange[0] - topRange[1] + 2)
      .attr("x1", 0)
      .attr("x2", 0);

    const topLabel = this.topSliderG
      .append("g")
      .attr("class", "slider-label")
      .style("transform", `translate(0px, 0px)`);

    topLabel
      .append("rect")
      .attr("x", -20)
      .attr("width", 40)
      .attr("height", 14)
      .attr("y", -14)
      .attr("rx", 2)
      .style("fill", "#fff4")
      .style("stroke", "#fff8");

    topLabel
      .append("text")
      .html(
        `<tspan style="font-style: italic; font-weight: lighter;">t=</tspan>1`
      )
      .attr("font-size", 12)
      .attr("y", -3)
      .attr("text-anchor", "middle");

    this.botSliderG = this.svg
      .append("g")
      .attr("class", "slider")
      .attr("transform", `translate(${MARGINS.left}, ${botRange[1] + 2})`);

    this.botSliderG
      .append("line")
      .attr("class", "slider-bg")
      .attr("y1", 0)
      .attr("y2", botRange[0] - botRange[1] - 2)
      .attr("x1", 0)
      .attr("x2", 0);

    this.botSliderG
      .append("line")
      .attr("class", "slider-line")
      .attr("y1", 0)
      .attr("y2", botRange[0] - botRange[1] - 2)
      .attr("x1", 0)
      .attr("x2", 0);

    const botLabel = this.botSliderG
      .append("g")
      .attr("class", "slider-label")
      .style("transform", `translate(0px, 0px)`);

    botLabel
      .append("rect")
      .attr("x", -20)
      .attr("width", 40)
      .attr("height", 14)
      .attr("y", 0)
      .attr("rx", 2)
      .style("fill", "#fff4")
      .style("stroke", "#fff8");

    botLabel
      .append("text")
      .html(
        `<tspan style="font-style: italic; font-weight: lighter;">t=</tspan>1`
      )
      .attr("font-size", 12)
      .attr("y", 11)
      .attr("text-anchor", "middle");
  }

  drawPath({ data, scale, name }) {
    const interstitial = d3
      .area()
      .x(({ t }) => this.xScale(t))
      .y0(scale(0.6))
      .y1(({ extent }) => scale(extent[1]))
      .curve(d3.curveMonotoneX);

    const air = d3
      .area()
      .x(({ t }) => this.xScale(t))
      .y0(({ extent }) => scale(extent[0]))
      .y1(({ extent }) => scale(extent[1]))
      .curve(d3.curveMonotoneX);

    data
      .getAllFeatures()
      .then((features) => {
        const minima = findMinimaLocations(features);
        const cycles = chuckFeaturesByMinima(features, minima);

        const ratios = features.map(
          ({ alveoli_area, interstitial_area }) =>
            alveoli_area / (alveoli_area + interstitial_area)
        );

        const cycleExtents = cycles.map((c, ind) => ({
          t: getTimeFromCyclePoint(ind, 0.5, cycles),
          extent: d3.extent(
            c,
            ({ alveoli_area, interstitial_area }) =>
              alveoli_area / (alveoli_area + interstitial_area)
          ),
          mean: d3.mean(
            c,
            ({ alveoli_area, interstitial_area }) =>
              alveoli_area / (alveoli_area + interstitial_area)
          ),
        }));

        console.log(cycleExtents);

        this.paths
          .selectAll(`.${name}`)
          .data([cycleExtents])
          .join("path")
          .attr("class", `ratio-path ${name}`)
          .attr("visibility", "visible")
          .attr("d", interstitial);

        this.paths
          .selectAll(`.${name}-air`)
          .data([cycleExtents])
          .join("path")
          .attr("class", `airspace ${name}-air`)
          .attr("visibility", "visible")
          .attr("d", air);

        this.paths
          .selectAll(`.${name}-minima-extent`)
          .data(cycleExtents)
          .join("line")
          .attr("class", `${name}-minima-extent`)
          .attr("x1", ({ t }) => this.xScale(t))
          .attr("x2", ({ t }) => this.xScale(t))
          .attr("y1", ({ extent }) => scale(extent[0]))
          .attr("y2", ({ extent }) => scale(extent[1]))
          .attr("stroke-width", 1)
          .attr("stroke", "#fff3");

        this.paths
          .selectAll(`.${name}-minima-mean`)
          .data(cycleExtents)
          .join("circle")
          .attr("class", `${name}-minima-mean`)
          .attr("cx", ({ t }) => this.xScale(t))
          .attr("cy", ({ mean }) => scale(mean))
          .attr("r", 2)
          .attr("fill", "#fff3");
        // .attr("stroke-dasharray", "4 4");
      })
      .catch((err) => {
        console.error(err);
        d3.select(`.${name}`).attr("visibility", "hidden");
        d3.select(`.${name}-air`).attr("visibility", "hidden");
      });
  }
}
