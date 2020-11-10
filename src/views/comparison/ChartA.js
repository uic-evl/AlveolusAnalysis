//const NUM_TIMESTEPS = 20;

import { NUM_TIMESTEPS } from "../../global.js";

const MARGINS = {
  left: 35,
  top: 15,
  bottom: 20,
  right: 10,
};

export class ChartA {
  topData = null;
  botData = null;

  constructor({ container}) {
    this.container = container;

    this.svg = container.select("svg");

    this.width = this.container.node().clientWidth;
    this.height = this.container.node().clientHeight;

    this.svg
      .attr("width", this.container.node().clientWidth)
      .attr("height", this.container.node().clientHeight);

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

  drawCoordinate({ min_I,min_A,min_N,max_I,max_A,max_N }){
    document.querySelectorAll('.chart1_yaxis').forEach(e => e.remove()); 


    this.xAxis = this.svg.append("g");
    this.yAxis = this.svg.append("g");

    const gap = 5;
    const yScale_length = (this.height-MARGINS.top-MARGINS.bottom-3*gap)/3;
    
    //y-axis for interstitial area
    this.yScale_I = d3
      .scaleLinear()
      .domain([min_I, max_I])
      .range([yScale_length+MARGINS.top, MARGINS.top]);
    
    const yAxis_I = d3.axisLeft(this.yScale_I).ticks(3);

    this.yAxis
      .append("g")
      .attr("class", "y-axis chart1_yaxis")
      .call(yAxis_I)
      .attr("transform", `translate(${MARGINS.left}, 0)`);

    //y-axis for alveoli area
    this.yScale_A = d3
      .scaleLinear()
      .domain([min_A, max_A])
      .range([2*yScale_length+MARGINS.top+gap,  yScale_length+MARGINS.top+gap]);
    
    const yAxis_A = d3.axisLeft(this.yScale_A).ticks(3);
    
    this.yAxis
      .append("g")
      .attr("class", "y-axis chart1_yaxis")
      .call(yAxis_A)
      .attr("transform", `translate(${MARGINS.left}, 0)`);

    //y-axis for neutrophil area
    this.yScale_N = d3
      .scaleLinear()
      .domain([min_N, max_N])
      .range([3*yScale_length+MARGINS.top+2*gap, 2*yScale_length+MARGINS.top+2*gap]);
    
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
      .attr("transform", `translate(0, ${this.height-MARGINS.bottom})`);

  }

  drawChart(){
    if(!this.topData || !this.botData){
      return;
    }
    Promise.all([
      this.topData.getAllFeatures().catch((err)=>[]),
      this.botData.getAllFeatures().catch((err)=>[]),
    ]).then(([topFeatures,botFeatures]) => {
      
      //get the difference 
      this.diff = [];

      topFeatures.forEach((eachtop, index) => {
        const eachbottom = botFeatures[index];
        this.diff.push({
          alveoli_diff : eachtop.alveoli_area-eachbottom.alveoli_area,
          interstitial_diff : eachtop.interstitial_area-eachbottom.interstitial_area,
          neutrophil_diff : eachtop.neutrophil_area-eachbottom.neutrophil_area,
        });
      });

      //get the max and min for differnece 
      //const min_I = Math.min(this.diff.interstitial_diff);
      const min_I = Math.min.apply(Math, this.diff.map(function(d) { return d.interstitial_diff; }));
      const min_A = Math.min.apply(Math, this.diff.map(function(d) { return d.alveoli_diff; }));
      const min_N = Math.min.apply(Math, this.diff.map(function(d) { return d.neutrophil_diff; }));
      const max_I = Math.max.apply(Math, this.diff.map(function(d) { return d.interstitial_diff; }));
      const max_A = Math.max.apply(Math, this.diff.map(function(d) { return d.alveoli_diff; }));
      const max_N = Math.max.apply(Math, this.diff.map(function(d) { return d.neutrophil_diff; }));
      const start_I = this.diff[0].interstitial_diff;
      const start_A = this.diff[0].alveoli_diff;
      const start_N = this.diff[0].neutrophil_diff;

      //draw three line chart
      this.paths_I = this.svg.append("g");
      this.paths_A = this.svg.append("g");
      this.paths_N = this.svg.append("g");


      this.paths_I;

      this.paths_I.selectAll("path")
        .data(this.diff)
        .join("path")
        .attr("fill", "#69b3a2")
        .attr("fill-opacity", .3)
        .attr("stroke", "none")
        .attr("d", d3.area()
        .x(function(d,i) { return this.timeScale(i); })
        .y0( function(d) { return this.yScale_I( start_I); })
        .y1(function(d) { return this.yScale_I(d.interstitial_diff); })
        );
      
      this.paths_I.selectAll("path")
        .data(this.diff)
        .join("path")
        .attr("fill", "none")
        .attr("stroke", "#69b3a2")
        .attr("stroke-width", 4)
        .attr("d", d3.line()
        .x(function(d,i) { return this.timeScale(i) })
        .y(function(d) { return this.yScale_I(d.interstitial_diff) })
        );
       




      //draw coordiantes
      this.drawCoordinate({min_I,min_A,min_N,max_I,max_A,max_N});

      console.log("topFeatures",topFeatures,"botFeatures",botFeatures,"difference",this.diff);
    });
  }
}
