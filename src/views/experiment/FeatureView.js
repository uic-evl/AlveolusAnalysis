import {
  findMinimaLocations,
  chuckFeaturesByMinima,
  findTimeInCycles,
  getValueAcrossCycles,
} from "../../util.js";

const MARGINS = {
  left: 36,
  top: 30,
  bottom: 14,
  right: 10,
};

const PADDING = 12;

export class FeatureView {
  time = 1;

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
    if (t !== this.time) {
      this.time = t;

      this.drawChart();
    }
  }

  setupChart() {
    // haha

    const sectionHeight = (this.height - 12) / 2;

    this.alvG = this.svg.append("g").attr("class", "alv-g");

    this.alvG
      .append("g")
      .attr("class", "x-axis x-axis-alv")
      .attr("transform", `translate(0, ${sectionHeight - MARGINS.bottom})`);

    this.alvG
      .append("g")
      .attr("class", "y-axis y-axis-alv")
      .attr("transform", `translate(${MARGINS.left}, 0)`);

    this.alvG.append("path").attr("class", "ci-area");
    this.alvG.append("path").attr("class", "mean");

    this.neuG = this.svg
      .append("g")
      .attr("class", "neu-g")
      .attr("transform", `translate(0, ${sectionHeight})`);

    this.neuG
      .append("g")
      .attr("class", "x-axis x-axis-neu")
      .attr("transform", `translate(0, ${sectionHeight - MARGINS.bottom})`);

    this.neuG
      .append("g")
      .attr("class", "y-axis y-axis-neu")
      .attr("transform", `translate(${MARGINS.left}, 0)`);

    this.neuG.append("path").attr("class", "ci-area");
    this.neuG.append("path").attr("class", "mean");

    this.xScale = d3
      .scaleLinear()
      .domain([0, 10])
      .range([MARGINS.left, this.width - MARGINS.right]);

    this.svg.selectAll(".x-axis").call(d3.axisBottom(this.xScale).ticks(0));

    this.yScaleAlv = d3
      .scaleLinear()
      .domain([0, 2000])
      .range([sectionHeight - MARGINS.bottom, MARGINS.top]);

    this.alvG
      .selectAll(".y-axis")
      .call(d3.axisLeft(this.yScaleAlv).tickFormat(d3.format(".3~s")).ticks(4));

    this.yScaleNeu = d3
      .scaleLinear()
      .domain([0, 100])
      .range([sectionHeight - MARGINS.bottom, MARGINS.top]);

    this.neuG.selectAll(".y-axis").call(d3.axisLeft(this.yScaleNeu).ticks(4));

    this.line = d3.line().curve(d3.curveMonotoneX);
    this.area = d3
      .area()
      .curve(d3.curveMonotoneX)
      .x((d) => d[0])
      .y0((d) => d[1])
      .y1((d) => d[2]);
  }

  drawChart() {
    this.data
      .getAllFeatures()
      .then((features) => {
        const minima = findMinimaLocations(features);
        const allCycles = chuckFeaturesByMinima(features, minima);

        const cycleLocation = findTimeInCycles(this.time, allCycles);
        const fullCycles = allCycles.slice(1, -1);

        const progress = cycleLocation.t / allCycles[cycleLocation.c].length;

        const alveoli = {
          mean: getValueAcrossCycles(progress, fullCycles, (t) =>
            d3.mean(Object.values(t.areas_per_alveoli))
          ),
          ci: getValueAcrossCycles(
            progress,
            fullCycles,
            (t) => 2 * d3.deviation(Object.values(t.areas_per_alveoli))
          ),
        };

        const neutrophil = {
          mean: getValueAcrossCycles(progress, fullCycles, (t) =>
            d3.mean(Object.values(t.areas_per_neutrophil))
          ),
          ci: getValueAcrossCycles(
            progress,
            fullCycles,
            (t) => 2 * d3.deviation(Object.values(t.areas_per_neutrophil))
          ),
        };

        const alvExtent = [
          d3.min(alveoli.mean, (d, i) => d - alveoli.ci[i] * 1.05),
          d3.max(alveoli.mean, (d, i) => d + alveoli.ci[i] * 1.05),
        ];

        const neuExtent = [
          d3.min(neutrophil.mean, (d, i) => d - neutrophil.ci[i] * 1.05),
          d3.max(neutrophil.mean, (d, i) => d + neutrophil.ci[i] * 1.05),
        ];

        this.updateXAxis([1, fullCycles.length]);
        this.updateYAxisAlv(alvExtent);
        this.updateYAxisNeu(neuExtent);
        // console.log()

        this.alvG
          .select(".ci-area")
          .attr(
            "d",
            this.area(
              alveoli.mean.map((mean, i) => [
                this.xScale(i + 1),
                this.yScaleAlv(mean - alveoli.ci[i]),
                this.yScaleAlv(mean + alveoli.ci[i]),
              ])
            )
          );
        this.alvG
          .select(".mean")
          .attr(
            "d",
            this.line(
              alveoli.mean.map((mean, i) => [
                this.xScale(i + 1),
                this.yScaleAlv(mean),
              ])
            )
          );

        this.neuG
          .select(".ci-area")
          .attr(
            "d",
            this.area(
              neutrophil.mean.map((mean, i) => [
                this.xScale(i + 1),
                this.yScaleNeu(mean - neutrophil.ci[i]),
                this.yScaleNeu(mean + neutrophil.ci[i]),
              ])
            )
          );
        this.neuG
          .select(".mean")
          .attr(
            "d",
            this.line(
              neutrophil.mean.map((mean, i) => [
                this.xScale(i + 1),
                this.yScaleNeu(mean),
              ])
            )
          );
      })
      .catch(console.error);
  }

  updateXAxis(domain) {
    this.xScale.domain(domain);
    this.svg
      .selectAll(".x-axis")
      .call(
        d3
          .axisBottom(this.xScale)
          .tickFormat(d3.format(".0"))
          .tickValues(domain)
      );
  }

  updateYAxisAlv(domain) {
    this.yScaleAlv.domain(domain);

    this.alvG
      .selectAll(".y-axis")
      .call(d3.axisLeft(this.yScaleAlv).tickFormat(d3.format(".3~s")).ticks(4));
  }

  updateYAxisNeu(domain) {
    this.yScaleNeu.domain(domain);

    this.neuG
      .selectAll(".y-axis")
      .call(d3.axisLeft(this.yScaleNeu).tickFormat(d3.format(".3~s")).ticks(4));
  }
}
