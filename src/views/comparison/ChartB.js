//import { ITEMS } from "../../global.js";

const MARGINS = {
  left: 45,
  top: 50,
  bottom: 20,
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
      .attr("x", 6)
      .attr("y", MARGINS.top - 32)
      .attr("font-size", 14)
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
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .text("Interstitial Area");

    this.svg
      .append("text")
      .attr("x", MARGINS.left + 1.5 * xScale_length)
      .attr("y", MARGINS.top - 10)
      .attr("font-size", 10)
      .attr("text-anchor", "middle")
      .text("Alveolus Area");

    this.svg
      .append("text")
      .attr("x", this.width - MARGINS.right - 0.5 * xScale_length)
      .attr("y", MARGINS.top - 10)
      .attr("font-size", 10)
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
      .padding([0.8]);

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
      .padding([0.8]);

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
      .padding([0.8]);

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
      //get 5-statistics for interstitial area
      const [topmin_I, topmax_I] = d3.extent(
        topFeatures,
        (d) => d.interstitial_area
      );
      const [botmin_I, botmax_I] = d3.extent(
        botFeatures,
        (d) => d.interstitial_area
      );
      const topq1_I = d3.quantile(
        topFeatures,
        0.25,
        (d) => d.interstitial_area
      );
      const botq1_I = d3.quantile(
        botFeatures,
        0.25,
        (d) => d.interstitial_area
      );
      const topq2_I = d3.quantile(topFeatures, 0.5, (d) => d.interstitial_area);
      const botq2_I = d3.quantile(botFeatures, 0.5, (d) => d.interstitial_area);
      const topq3_I = d3.quantile(
        topFeatures,
        0.75,
        (d) => d.interstitial_area
      );
      const botq3_I = d3.quantile(
        botFeatures,
        0.75,
        (d) => d.interstitial_area
      );

      //get 5-statistics for alveoli area
      const [topmin_A, topmax_A] = d3.extent(
        topFeatures,
        (d) => d.alveoli_area
      );
      const [botmin_A, botmax_A] = d3.extent(
        botFeatures,
        (d) => d.alveoli_area
      );
      const topq1_A = d3.quantile(topFeatures, 0.25, (d) => d.alveoli_area);
      const botq1_A = d3.quantile(botFeatures, 0.25, (d) => d.alveoli_area);
      const topq2_A = d3.quantile(topFeatures, 0.5, (d) => d.alveoli_area);
      const botq2_A = d3.quantile(botFeatures, 0.5, (d) => d.alveoli_area);
      const topq3_A = d3.quantile(topFeatures, 0.75, (d) => d.alveoli_area);
      const botq3_A = d3.quantile(botFeatures, 0.75, (d) => d.alveoli_area);

      //get 5-statistics for neutrophil area
      const [topmin_N, topmax_N] = d3.extent(
        topFeatures,
        (d) => d.neutrophil_area
      );
      const [botmin_N, botmax_N] = d3.extent(
        botFeatures,
        (d) => d.neutrophil_area
      );
      const topq1_N = d3.quantile(topFeatures, 0.25, (d) => d.neutrophil_area);
      const botq1_N = d3.quantile(botFeatures, 0.25, (d) => d.neutrophil_area);
      const topq2_N = d3.quantile(topFeatures, 0.5, (d) => d.neutrophil_area);
      const botq2_N = d3.quantile(botFeatures, 0.5, (d) => d.neutrophil_area);
      const topq3_N = d3.quantile(topFeatures, 0.75, (d) => d.neutrophil_area);
      const botq3_N = d3.quantile(botFeatures, 0.75, (d) => d.neutrophil_area);

      //get min and max for y_axis
      const max_AI = d3.max([topmax_I, botmax_I, topmax_A, botmax_A]);
      const max_N = d3.max([topmax_N, botmax_N]);
      //const min_all = d3.min([topmin_I, botmin_I, topmin_A, botmin_A, topmin_N, botmin_N]);

      //draw the coordinate
      this.drawCoordinate({ max_AI, max_N });
      //draw the boxplot
      this.box_I = this.svg.append("g");
      this.box_A = this.svg.append("g");
      this.box_N = this.svg.append("g");

      const { yScale, yScale_N, xScale_I, xScale_N, xScale_A } = this;
      const boxwidth = (this.width - MARGINS.left - MARGINS.right) / 12;

      //Box for interstital area
      //top
      this.box_I
        .append("line")
        .attr("x1", xScale_I("top"))
        .attr("x2", xScale_I("top"))
        .attr("y1", yScale(topmin_I))
        .attr("y2", yScale(topq1_I))
        .attr("stroke", "#1f78b4");

      this.box_I
        .append("line")
        .attr("x1", xScale_I("top"))
        .attr("x2", xScale_I("top"))
        .attr("y1", yScale(topq3_I))
        .attr("y2", yScale(topmax_I))
        .attr("stroke", "#1f78b4");

      this.box_I
        .append("rect")
        .attr("x", xScale_I("top") - boxwidth / 2)
        .attr("y", yScale(topq3_I))
        .attr("height", yScale(topq1_I) - yScale(topq3_I))
        .attr("width", boxwidth)
        .attr("stroke", "#1f78b4")
        .style("fill", "#1f78b4")
        .attr("fill-opacity", 0.2);

      this.box_I
        .selectAll("bars")
        .data([topmin_I, topmax_I])
        .enter()
        .append("line")
        .attr("x1", xScale_I("top") - boxwidth / 4)
        .attr("x2", xScale_I("top") + boxwidth / 4)
        .attr("y1", function (d) {
          return yScale(d);
        })
        .attr("y2", function (d) {
          return yScale(d);
        })
        .attr("stroke", "#1f78b4");

      this.box_I
        .append("line")
        .attr("x1", xScale_I("top") - boxwidth / 2)
        .attr("x2", xScale_I("top") + boxwidth / 2)
        .attr("y1", yScale(topq2_I))
        .attr("y2", yScale(topq2_I))
        .attr("stroke", "#1f78b4");

      //bottom
      this.box_I
        .append("line")
        .attr("x1", xScale_I("bot"))
        .attr("x2", xScale_I("bot"))
        .attr("y1", yScale(botmin_I))
        .attr("y2", yScale(botq1_I))
        .attr("stroke", "#1f78b4");

      this.box_I
        .append("line")
        .attr("x1", xScale_I("bot"))
        .attr("x2", xScale_I("bot"))
        .attr("y1", yScale(botq3_I))
        .attr("y2", yScale(botmax_I))
        .attr("stroke", "#1f78b4");

      this.box_I
        .append("rect")
        .attr("x", xScale_I("bot") - boxwidth / 2)
        .attr("y", yScale(botq3_I))
        .attr("height", yScale(botq1_I) - yScale(botq3_I))
        .attr("width", boxwidth)
        .attr("stroke", "#1f78b4")
        .style("fill", "#1f78b4")
        .attr("fill-opacity", 0.2);

      this.box_I
        .selectAll("bars")
        .data([botmin_I, botmax_I])
        .enter()
        .append("line")
        .attr("x1", xScale_I("bot") - boxwidth / 4)
        .attr("x2", xScale_I("bot") + boxwidth / 4)
        .attr("y1", function (d) {
          return yScale(d);
        })
        .attr("y2", function (d) {
          return yScale(d);
        })
        .attr("stroke", "#1f78b4");

      this.box_I
        .append("line")
        .attr("x1", xScale_I("bot") - boxwidth / 2)
        .attr("x2", xScale_I("bot") + boxwidth / 2)
        .attr("y1", yScale(botq2_I))
        .attr("y2", yScale(botq2_I))
        .attr("stroke", "#1f78b4");

      //Box for alveoli area
      //top
      this.box_A
        .append("line")
        .attr("x1", xScale_A("top"))
        .attr("x2", xScale_A("top"))
        .attr("y1", yScale(topmin_A))
        .attr("y2", yScale(topq1_A))
        .attr("stroke", "#C1C1C1");

      this.box_A
        .append("line")
        .attr("x1", xScale_A("top"))
        .attr("x2", xScale_A("top"))
        .attr("y1", yScale(topq3_A))
        .attr("y2", yScale(topmax_A))
        .attr("stroke", "#C1C1C1");

      this.box_A
        .append("rect")
        .attr("x", xScale_A("top") - boxwidth / 2)
        .attr("y", yScale(topq3_A))
        .attr("height", yScale(topq1_A) - yScale(topq3_A))
        .attr("width", boxwidth)
        .attr("stroke", "#C1C1C1")
        .style("fill", "#C1C1C1")
        .attr("fill-opacity", 0.2);

      this.box_A
        .selectAll("bars")
        .data([topmin_A, topmax_A])
        .enter()
        .append("line")
        .attr("x1", xScale_A("top") - boxwidth / 4)
        .attr("x2", xScale_A("top") + boxwidth / 4)
        .attr("y1", function (d) {
          return yScale(d);
        })
        .attr("y2", function (d) {
          return yScale(d);
        })
        .attr("stroke", "#C1C1C1");

      this.box_A
        .append("line")
        .attr("x1", xScale_A("top") - boxwidth / 2)
        .attr("x2", xScale_A("top") + boxwidth / 2)
        .attr("y1", yScale(topq2_A))
        .attr("y2", yScale(topq2_A))
        .attr("stroke", "#C1C1C1");

      //bottom
      this.box_A
        .append("line")
        .attr("x1", xScale_A("bot"))
        .attr("x2", xScale_A("bot"))
        .attr("y1", yScale(botmin_A))
        .attr("y2", yScale(botq1_A))
        .attr("stroke", "#C1C1C1");

      this.box_A
        .append("line")
        .attr("x1", xScale_A("bot"))
        .attr("x2", xScale_A("bot"))
        .attr("y1", yScale(botq3_A))
        .attr("y2", yScale(botmax_A))
        .attr("stroke", "#C1C1C1");

      this.box_A
        .append("rect")
        .attr("x", xScale_A("bot") - boxwidth / 2)
        .attr("y", yScale(botq3_A))
        .attr("height", yScale(botq1_A) - yScale(botq3_A))
        .attr("width", boxwidth)
        .attr("stroke", "#C1C1C1")
        .style("fill", "#C1C1C1")
        .attr("fill-opacity", 0.2);

      this.box_A
        .selectAll("bars")
        .data([botmin_A, botmax_A])
        .enter()
        .append("line")
        .attr("x1", xScale_A("bot") - boxwidth / 4)
        .attr("x2", xScale_A("bot") + boxwidth / 4)
        .attr("y1", function (d) {
          return yScale(d);
        })
        .attr("y2", function (d) {
          return yScale(d);
        })
        .attr("stroke", "#C1C1C1");

      this.box_A
        .append("line")
        .attr("x1", xScale_A("bot") - boxwidth / 2)
        .attr("x2", xScale_A("bot") + boxwidth / 2)
        .attr("y1", yScale(botq2_A))
        .attr("y2", yScale(botq2_A))
        .attr("stroke", "#C1C1C1");

      //Box for Neutrophil area
      //top
      this.box_N
        .append("line")
        .attr("x1", xScale_N("top"))
        .attr("x2", xScale_N("top"))
        .attr("y1", yScale_N(topmin_N))
        .attr("y2", yScale_N(topq1_N))
        .attr("stroke", "#9CCC9C");

      this.box_N
        .append("line")
        .attr("x1", xScale_N("top"))
        .attr("x2", xScale_N("top"))
        .attr("y1", yScale_N(topq3_N))
        .attr("y2", yScale_N(topmax_N))
        .attr("stroke", "#9CCC9C");

      this.box_N
        .append("rect")
        .attr("x", xScale_N("top") - boxwidth / 2)
        .attr("y", yScale_N(topq3_N))
        .attr("height", yScale_N(topq1_N) - yScale_N(topq3_N))
        .attr("width", boxwidth)
        .attr("stroke", "#9CCC9C")
        .style("fill", "#9CCC9C")
        .attr("fill-opacity", 0.2);

      this.box_N
        .selectAll("bars")
        .data([topmin_N, topmax_N])
        .enter()
        .append("line")
        .attr("x1", xScale_N("top") - boxwidth / 4)
        .attr("x2", xScale_N("top") + boxwidth / 4)
        .attr("y1", function (d) {
          return yScale_N(d);
        })
        .attr("y2", function (d) {
          return yScale_N(d);
        })
        .attr("stroke", "#9CCC9C");

      this.box_N
        .append("line")
        .attr("x1", xScale_N("top") - boxwidth / 2)
        .attr("x2", xScale_N("top") + boxwidth / 2)
        .attr("y1", yScale_N(topq2_N))
        .attr("y2", yScale_N(topq2_N))
        .attr("stroke", "#9CCC9C");

      //bottom
      this.box_N
        .append("line")
        .attr("x1", xScale_N("bot"))
        .attr("x2", xScale_N("bot"))
        .attr("y1", yScale_N(botmin_N))
        .attr("y2", yScale_N(botq1_N))
        .attr("stroke", "#9CCC9C");

      this.box_N
        .append("line")
        .attr("x1", xScale_N("bot"))
        .attr("x2", xScale_N("bot"))
        .attr("y1", yScale_N(botq3_N))
        .attr("y2", yScale_N(botmax_N))
        .attr("stroke", "#9CCC9C");

      this.box_N
        .append("rect")
        .attr("x", xScale_N("bot") - boxwidth / 2)
        .attr("y", yScale_N(botq3_N))
        .attr("height", yScale_N(botq1_N) - yScale_N(botq3_N))
        .attr("width", boxwidth)
        .attr("stroke", "#9CCC9C")
        .style("fill", "#9CCC9C")
        .attr("fill-opacity", 0.2);

      this.box_N
        .selectAll("bars")
        .data([botmin_N, botmax_N])
        .enter()
        .append("line")
        .attr("x1", xScale_N("bot") - boxwidth / 4)
        .attr("x2", xScale_N("bot") + boxwidth / 4)
        .attr("y1", function (d) {
          return yScale_N(d);
        })
        .attr("y2", function (d) {
          return yScale_N(d);
        })
        .attr("stroke", "#9CCC9C");

      this.box_N
        .append("line")
        .attr("x1", xScale_N("bot") - boxwidth / 2)
        .attr("x2", xScale_N("bot") + boxwidth / 2)
        .attr("y1", yScale_N(botq2_N))
        .attr("y2", yScale_N(botq2_N))
        .attr("stroke", "#9CCC9C");

      //console.log("topFeatures", this.topname);
    });
  }
}
