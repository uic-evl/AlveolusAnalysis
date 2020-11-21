import { NUM_TIMESTEPS } from "../../global.js";

const MARGINS = {
  left: 45,
  top: 50,
  bottom: 25,
  right: 45,
};
export class ChartB {
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
      .attr("x", 16)
      .attr("y", MARGINS.top - 28)
      .attr("font-size", 16)
      .attr("font-weight", 300)
      .text("Experiments Overall Comparison");

    console.log("ChartB", this);
  }

  setTopData({ data, name }) {
    this.topname = name;
    this.topData = data;
    this.drawChart();
  }

  setBotData({ data, name }) {
    this.botname = name;
    this.botData = data;
    this.drawChart();
  }

  drawCoordinate({ max_AI, max_N }) {
    this.svg.selectAll("g").remove();

    this.xAxis = this.svg.append("g");
    this.yAxis = this.svg.append("g");

    const xScale_length = 0.3 * (this.width - MARGINS.left - MARGINS.right);
    const gap = 0.1 * (this.width - MARGINS.left - MARGINS.right);

    this.svg
      .append("text")
      .attr("x", MARGINS.left + 0.5 * xScale_length)
      .attr("y", MARGINS.top - 10)
      .attr("font-size", 12)
      .style("font-style", "italic")
      .style("color", "var(--inter)")
      .attr("text-anchor", "middle")
      .text("Interstitial Area");

    this.svg
      .append("text")
      .attr("x", MARGINS.left + 1.5 * xScale_length)
      .attr("y", MARGINS.top - 10)
      .attr("font-size", 12)
      .style("font-style", "italic")
      .style("color", "var(--alv)")
      .attr("text-anchor", "middle")
      .text("Alveolar Area");

    this.svg
      .append("text")
      .attr("x", this.width - MARGINS.right - 0.5 * xScale_length)
      .attr("y", MARGINS.top - 10)
      .attr("font-size", 12)
      .style("font-style", "italic")
      .style("color", "var(--neut)")
      .attr("text-anchor", "middle")
      .text("Neutrophil Area");

    //y-axis
    this.yScale = d3
      .scaleLinear()
      .domain([0, max_AI])
      .range([this.height - MARGINS.bottom, MARGINS.top]);

    const yAxis = d3
      .axisLeft(this.yScale)
      .ticks(5)
      .tickFormat(d3.format(".3~s"));

    this.yAxis
      .append("g")
      .attr("class", "y-axis chart2_yaxis")
      .call(yAxis)
      .attr("transform", `translate(${MARGINS.left}, 0)`);

    //y-axis
    this.yScale_N = d3
      .scaleLinear()
      .domain([0, max_N])
      .range([this.height - MARGINS.bottom, MARGINS.top]);

    const yAxis_N = d3.axisRight(this.yScale_N).ticks(5);

    this.yAxis
      .append("g")
      .attr("class", "y-axis chart2_yaxis")
      .call(yAxis_N)
      .attr("transform", `translate(${this.width - MARGINS.right}, 0)`);

    const { topname, botname } = this;
    //x-axis for interstitial
    this.xScale_I = d3
      .scaleBand()
      .domain(["top", "bot"])
      .range([MARGINS.left, MARGINS.left + xScale_length])
      .padding([0.1]);

    const xAxis_I = d3.axisBottom(this.xScale_I).tickFormat(function (d) {
      return d === "top" ? topname : botname;
    });

    this.xAxis
      .append("g")
      .attr("class", "x-axis")
      .call(xAxis_I)
      .attr("transform", `translate(0, ${this.height - MARGINS.bottom})`);

    //x-axis for alveoli
    this.xScale_A = d3
      .scaleBand()
      .domain(["top", "bot"])
      .range([MARGINS.left + xScale_length, MARGINS.left + 2 * xScale_length])
      .padding([0.1]);

    const xAxis_A = d3.axisBottom(this.xScale_A).tickFormat(function (d) {
      return d === "top" ? topname : botname;
    });

    this.xAxis
      .append("g")
      .attr("class", "x-axis")
      .call(xAxis_A)
      .attr("transform", `translate(0, ${this.height - MARGINS.bottom})`);

    //x-axis for neutrophil
    this.xScale_N = d3
      .scaleBand()
      .domain(["top", "bot"])
      .range([
        gap + MARGINS.left + 2 * xScale_length,
        gap + MARGINS.left + 3 * xScale_length,
      ])
      .padding([0.1]);

    const xAxis_N = d3.axisBottom(this.xScale_N).tickFormat(function (d) {
      return d === "top" ? topname : botname;
    });

    this.xAxis
      .append("g")
      .attr("class", "x-axis")
      .call(xAxis_N)
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
      //get min max for interstitial area
      const [topmin_I, topmax_I] = d3.extent(
        topFeatures,
        (d) => d.interstitial_area
      );
      const [botmin_I, botmax_I] = d3.extent(
        botFeatures,
        (d) => d.interstitial_area
      );

      //get min max for alveoli area
      const [topmin_A, topmax_A] = d3.extent(
        topFeatures,
        (d) => d.alveoli_area
      );
      const [botmin_A, botmax_A] = d3.extent(
        botFeatures,
        (d) => d.alveoli_area
      );

      //get min max for neutrophil area
      const [topmin_N, topmax_N] = d3.extent(
        topFeatures,
        (d) => d.neutrophil_area
      );
      const [botmin_N, botmax_N] = d3.extent(
        botFeatures,
        (d) => d.neutrophil_area
      );

      //get min and max for y_axis
      const max_AI = d3.max([topmax_I, botmax_I, topmax_A, botmax_A]);
      const max_N = d3.max([topmax_N, botmax_N]);

      //draw the coordinate
      this.drawCoordinate({ max_AI, max_N });
      //draw the boxplot
      this.box_I = this.svg.append("g");
      this.box_A = this.svg.append("g");
      this.box_N = this.svg.append("g");

      const { yScale, yScale_N, xScale_I, xScale_N, xScale_A } = this;
      //const boxwidth = (this.width - MARGINS.left - MARGINS.right) / 12;

      //function for kernel density estimator
      function kernelDensityEstimator(kernel, target) {
        return function (data) {
          const dev = d3.deviation(data);
          return target.map(function (x) {
            return [
              x,
              d3.mean(data, function (v) {
                return kernel(
                  x - v,
                  1.06 * Math.pow(NUM_TIMESTEPS, -1 / 5) * dev
                );
              }),
            ];
          });
        };
      }

      function kernelGaussian() {
        return function (v, bandwidth) {
          return (
            (1 / Math.sqrt(2 * Math.PI)) *
            (1 / bandwidth) *
            Math.exp(-0.5 * (v / bandwidth) * (v / bandwidth))
          );
        };
      }

      this.kde = kernelDensityEstimator(kernelGaussian(), yScale.ticks(50));
      this.kde_N = kernelDensityEstimator(kernelGaussian(), yScale_N.ticks(50));

      //get data for each of them

      const density_topI = this.kde(
        topFeatures.map(function (g) {
          return g.interstitial_area;
        })
      );
      const density_topA = this.kde(
        topFeatures.map(function (g) {
          return g.alveoli_area;
        })
      );
      const density_topN = this.kde_N(
        topFeatures.map(function (g) {
          return g.neutrophil_area;
        })
      );
      const density_botI = this.kde(
        botFeatures.map(function (g) {
          return g.interstitial_area;
        })
      );
      const density_botA = this.kde(
        botFeatures.map(function (g) {
          return g.alveoli_area;
        })
      );
      const density_botN = this.kde_N(
        botFeatures.map(function (g) {
          return g.neutrophil_area;
        })
      );

      //get the max value for density
      const maxValue = d3.max([
        d3.max(density_topI, function (d) {
          return d[1];
        }),
        d3.max(density_topA, function (d) {
          return d[1];
        }),
        d3.max(density_botI, function (d) {
          return d[1];
        }),
        d3.max(density_botA, function (d) {
          return d[1];
        }),
      ]);

      const maxValue_N = d3.max([
        d3.max(density_topN, function (d) {
          return d[1];
        }),
        d3.max(density_botN, function (d) {
          return d[1];
        }),
      ]);

      //scale for violin
      this.violinScale = d3
        .scaleLinear()
        .range([0, xScale_A.bandwidth()])
        .domain([-maxValue, maxValue]);

      this.violinScale_N = d3
        .scaleLinear()
        .range([0, xScale_N.bandwidth()])
        .domain([-maxValue_N, maxValue_N]);

      const { violinScale, violinScale_N } = this;
      this.box_I;
      //violin for interstitial area
      this.box_I
        .selectAll("violin")
        .data([density_topI])
        .join("path")
        .attr("fill", "var(--inter)")
        .attr("fill-opacity", 0.3)
        .attr("stroke", 2)
        .attr(
          "d",
          d3
            .area()
            .x0(function (d) {
              return xScale_I("top") + violinScale(-d[1]);
            })
            .x1(function (d) {
              return xScale_I("top") + violinScale(d[1]);
            })
            .y(function (d) {
              return yScale(d[0]);
            })
            .curve(d3.curveCatmullRom)
        );

      this.box_I
        .selectAll("violin")
        .data([density_botI])
        .join("path")
        .attr("fill", "var(--inter)")
        .attr("fill-opacity", 0.3)
        .attr("stroke", 2)
        .attr(
          "d",
          d3
            .area()
            .x0(function (d) {
              return xScale_I("bot") + violinScale(-d[1]);
            })
            .x1(function (d) {
              return xScale_I("bot") + violinScale(d[1]);
            })
            .y(function (d) {
              return yScale(d[0]);
            })
            .curve(d3.curveCatmullRom)
        );

      this.box_A;
      //violin for interstitial area
      this.box_A
        .selectAll("violin")
        .data([density_topA])
        .join("path")
        .attr("fill", "var(--alv)")
        .attr("fill-opacity", 0.3)
        .attr("stroke", 2)
        .attr(
          "d",
          d3
            .area()
            .x0(function (d) {
              return xScale_A("top") + violinScale(-d[1]);
            })
            .x1(function (d) {
              return xScale_A("top") + violinScale(d[1]);
            })
            .y(function (d) {
              return yScale(d[0]);
            })
            .curve(d3.curveCatmullRom)
        );

      this.box_A
        .selectAll("violin")
        .data([density_botA])
        .join("path")
        .attr("fill", "var(--alv)")
        .attr("fill-opacity", 0.3)
        .attr("stroke", 2)
        .attr(
          "d",
          d3
            .area()
            .x0(function (d) {
              return xScale_A("bot") + violinScale(-d[1]);
            })
            .x1(function (d) {
              return xScale_A("bot") + violinScale(d[1]);
            })
            .y(function (d) {
              return yScale(d[0]);
            })
            .curve(d3.curveCatmullRom)
        );

      this.box_N;
      //violin for interstitial area
      this.box_N
        .selectAll("violin")
        .data([density_topN])
        .join("path")
        .attr("fill", "var(--neut)")
        .attr("fill-opacity", 0.3)
        .attr("stroke", 2)
        .attr(
          "d",
          d3
            .area()
            .x0(function (d) {
              return xScale_N("top") + violinScale_N(-d[1]);
            })
            .x1(function (d) {
              return xScale_N("top") + violinScale_N(d[1]);
            })
            .y(function (d) {
              return yScale_N(d[0]);
            })
            .curve(d3.curveCatmullRom)
        );

      this.box_N
        .selectAll("violin")
        .data([density_botN])
        .join("path")
        .attr("fill", "var(--neut)")
        .attr("fill-opacity", 0.3)
        .attr("stroke", 2)
        .attr(
          "d",
          d3
            .area()
            .x0(function (d) {
              return xScale_N("bot") + violinScale_N(-d[1]);
            })
            .x1(function (d) {
              return xScale_N("bot") + violinScale_N(d[1]);
            })
            .y(function (d) {
              return yScale_N(d[0]);
            })
            .curve(d3.curveCatmullRom)
        );

      console.log("density_topI", density_topI);
    });
  }
}
