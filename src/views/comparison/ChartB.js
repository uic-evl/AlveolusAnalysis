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
      .attr("class", "y-axis")
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
      .attr("class", "y-axis")
      .call(yAxis_N)
      .attr("transform", `translate(${this.width - MARGINS.right}, 0)`);

    const { topname, botname } = this;
    //x-axis for interstitial
    this.xScale_I = d3
      .scaleBand()
      .domain(["top", "bot"])
      .range([MARGINS.left, MARGINS.left + xScale_length])
      .padding([0.3]);

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
      .padding([0.3]);

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
      .padding([0.3]);

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
      //function to draw violin plot for one experiments
      function violin(
        svg,
        name,
        position,
        min_I,
        max_I,
        min_A,
        max_A,
        min_N,
        max_N,
        density_I,
        density_A,
        density_N
      ) {
        //get 5 statistics for interstitial area
        const q1_I = d3.quantile(name, 0.25, (d) => d.interstitial_area);
        const q2_I = d3.quantile(name, 0.5, (d) => d.interstitial_area);
        const q3_I = d3.quantile(name, 0.75, (d) => d.interstitial_area);
        const IQR_I = q3_I - q1_I;

        //get 5-statistics for alveoli area
        const q1_A = d3.quantile(name, 0.25, (d) => d.alveoli_area);
        const q2_A = d3.quantile(name, 0.5, (d) => d.alveoli_area);
        const q3_A = d3.quantile(name, 0.75, (d) => d.alveoli_area);
        const IQR_A = q3_A - q1_A;

        //get 5-statistics for neutrophil area
        const q1_N = d3.quantile(name, 0.25, (d) => d.neutrophil_area);
        const q2_N = d3.quantile(name, 0.5, (d) => d.neutrophil_area);
        const q3_N = d3.quantile(name, 0.75, (d) => d.neutrophil_area);
        const IQR_N = q3_N - q1_N;

        const translate_I = xScale_I(`${position}`);
        const translate_A = xScale_A(`${position}`);
        const translate_N = xScale_N(`${position}`);

        const box_I = svg
          .append("g")
          .attr("class", "interstitial")
          .attr("transform", `translate(${translate_I}, 0)`);
        const box_A = svg
          .append("g")
          .attr("transform", `translate(${translate_A}, 0)`)
          .attr("class", "alveoli");
        const box_N = svg
          .append("g")
          .attr("transform", `translate(${translate_N}, 0)`)
          .attr("class", "neutrophil");

        //violin for interstitial area
        box_I
          .selectAll("violin")
          .data([density_I])
          .join("path")
          .attr("class", "area")
          //.attr("fill", "var(--inter)")
          //.attr("fill-opacity", 0.3)
          //.attr("stroke", 2)
          .attr(
            "d",
            d3
              .area()
              .x0(function (d) {
                return violinScale(-d[1]);
              })
              .x1(function (d) {
                return violinScale(d[1]);
              })
              .y(function (d) {
                return yScale(d[0]);
              })
              .curve(d3.curveCatmullRom)
          );
        box_I
          .append("line")
          .attr("class", "line")
          .attr("x1", 0.5 * xScale_I.bandwidth())
          .attr("x2", 0.5 * xScale_I.bandwidth())
          .attr("y1", yScale(Math.max(q1_I - 1.5 * IQR_I, min_I)))
          .attr("y2", yScale(q1_I));
        //.attr("stroke", "var(--inter)");
        box_I
          .append("line")
          .attr("class", "line")
          .attr("x1", 0.5 * xScale_I.bandwidth())
          .attr("x2", 0.5 * xScale_I.bandwidth())
          .attr("y1", yScale(q3_I))
          .attr("y2", yScale(Math.min(q3_I + 1.5 * IQR_I, max_I)));
        //.attr("stroke", "var(--inter)");

        box_I
          .append("line")
          .attr("class", "thickline")
          .attr("x1", 0.5 * xScale_I.bandwidth())
          .attr("x2", 0.5 * xScale_I.bandwidth())
          .attr("y1", yScale(q3_I))
          .attr("y2", yScale(q1_I));
        //.attr("stroke-width", 2);
        //.attr("stroke", "var(--inter)");

        box_I
          .append("circle")
          .attr("class", "dot")
          .attr("cx", 0.5 * xScale_I.bandwidth())
          .attr("cy", yScale(q2_I))
          .attr("r", 1.5);
        //.attr("fill", "black");

        //violin for interstitial area
        box_A
          .selectAll("violin")
          .data([density_A])
          .join("path")
          .attr("class", "area")
          //.attr("fill", "var(--alv)")
          //.attr("fill-opacity", 0.3)
          //.attr("stroke", 2)
          .attr(
            "d",
            d3
              .area()
              .x0(function (d) {
                return violinScale(-d[1]);
              })
              .x1(function (d) {
                return violinScale(d[1]);
              })
              .y(function (d) {
                return yScale(d[0]);
              })
              .curve(d3.curveCatmullRom)
          );
        box_A
          .append("line")
          .attr("class", "line")
          .attr("x1", 0.5 * xScale_A.bandwidth())
          .attr("x2", 0.5 * xScale_A.bandwidth())
          .attr("y1", yScale(Math.max(q1_A - 1.5 * IQR_A, min_A)))
          .attr("y2", yScale(q1_A));
        //.attr("stroke", "#C1C1C1");

        box_A
          .append("line")
          .attr("class", "line")
          .attr("x1", 0.5 * xScale_A.bandwidth())
          .attr("x2", 0.5 * xScale_A.bandwidth())
          .attr("y1", yScale(q3_A))
          .attr("y2", yScale(Math.min(q3_A + 1.5 * IQR_A, max_A)));
        //.attr("stroke", "#C1C1C1");

        box_A
          .append("line")
          .attr("class", "thickline")
          .attr("x1", 0.5 * xScale_A.bandwidth())
          .attr("x2", 0.5 * xScale_A.bandwidth())
          .attr("y1", yScale(q3_A))
          .attr("y2", yScale(q1_A));
        //.attr("stroke-width", 2)
        //.attr("stroke", "#C1C1C1");

        box_A
          .append("circle")
          .attr("class", "dot")
          .attr("cx", 0.5 * xScale_A.bandwidth())
          .attr("cy", yScale(q2_A))
          .attr("r", 1.5);
        //.attr("fill", "black");

        //violin for interstitial area
        box_N
          .selectAll("violin")
          .data([density_N])
          .join("path")
          .attr("class", "area")
          //.attr("fill", "var(--neut)")
          //.attr("fill-opacity", 0.3)
          //.attr("stroke", 2)
          .attr(
            "d",
            d3
              .area()
              .x0(function (d) {
                return violinScale_N(-d[1]);
              })
              .x1(function (d) {
                return violinScale_N(d[1]);
              })
              .y(function (d) {
                return yScale_N(d[0]);
              })
              .curve(d3.curveCatmullRom)
          );
        box_N
          .append("line")
          .attr("class", "line")
          .attr("x1", 0.5 * xScale_N.bandwidth())
          .attr("x2", 0.5 * xScale_N.bandwidth())
          .attr("y1", yScale_N(Math.max(q1_N - 1.5 * IQR_N, min_N)))
          .attr("y2", yScale_N(q1_N));
        //.attr("stroke", "var(--neut)");
        box_N
          .append("line")
          .attr("class", "line")
          .attr("x1", 0.5 * xScale_N.bandwidth())
          .attr("x2", 0.5 * xScale_N.bandwidth())
          .attr("y1", yScale_N(q3_N))
          .attr("y2", yScale_N(Math.min(q3_N + 1.5 * IQR_N, max_N)));
        //.attr("stroke", "var(--neut)");

        box_N
          .append("line")
          .attr("class", "thickline")
          .attr("x1", 0.5 * xScale_N.bandwidth())
          .attr("x2", 0.5 * xScale_N.bandwidth())
          .attr("y1", yScale_N(q3_N))
          .attr("y2", yScale_N(q1_N));
        //.attr("stroke-width", 2)
        //.attr("stroke", "var(--neut)");

        box_N
          .append("circle")
          .attr("class", "dot")
          .attr("cx", 0.5 * xScale_N.bandwidth())
          .attr("cy", yScale_N(q2_N))
          .attr("r", 1.5);
        //.attr("fill", "black");
      }

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

      const { yScale, yScale_N, xScale_I, xScale_N, xScale_A } = this;

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

      //get the density
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

      this.svg.call(
        violin,
        topFeatures,
        "top",
        topmin_I,
        topmax_I,
        topmin_A,
        topmax_A,
        topmin_N,
        topmax_N,
        density_topI,
        density_topA,
        density_topN
      );

      this.svg.call(
        violin,
        botFeatures,
        "bot",
        botmin_I,
        botmax_I,
        botmin_A,
        botmax_A,
        botmin_N,
        botmax_N,
        density_botI,
        density_botA,
        density_botN
      );

      console.log("topmin_A", topmin_A);
    });
  }
}
