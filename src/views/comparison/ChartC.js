import {findMinimaLocations,chuckFeaturesByMinima} from "../../util.js";


const MARGINS = {
  left: 45,
  top: 50,
  bottom: 15,
  right: 45,
};

export class ChartC {
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
      .text("Experiments Trend Comparison");

    console.log("ChartB", this);

    console.log("ChartC", this);
  }

  setTopData({ data }) {
    this.topData = data;
    
    this.drawChart();
  }

  setBotData({ data }) {
    this.botData = data;

    this.drawChart();
  }


  drawCoordinate({min_AI, max_AI, min_N, max_N}){
    this.svg.selectAll('g').remove();

    this.yAxis = this.svg.append("g");

    //const gap =  0.1*(this.height-MARGINS.bottom-MARGINS.top);
    //const gap =  0.1*(this.width-2*MARGINS.left-2*MARGINS.right);
    //const ylength = 0.45*(this.height-MARGINS.bottom-MARGINS.top);
    const xlength = 0.5*(this.width-2*MARGINS.left-2*MARGINS.right);
    
    this.svg
      .append("text")
      .attr("x", MARGINS.left+0.5*xlength)
      .attr("y", MARGINS.top - 10)
      .attr("font-size", 10)
      .attr("text-anchor","middle")
      .text("Ratio");
      
    this.svg
      .append("text")
      .attr("x", this.width-MARGINS.right-0.5*xlength)
      .attr("y", MARGINS.top - 10)
      .attr("font-size", 10)
      .attr("text-anchor","middle")
      .text("Neutrophil");

    //y-axis for interstitial area
    this.yScale = d3
      .scaleLinear()
      .domain([min_AI, max_AI])
      .range([this.height-MARGINS.bottom, MARGINS.top]);

    this.yScale_N = d3
      .scaleLinear()
      .domain([min_N, max_N])
      .range([this.height-MARGINS.bottom, MARGINS.top]);
    
    const yAxis_left = d3.axisLeft(this.yScale).ticks(4).tickFormat(d3.format(".3~%"));

    this.yAxis
      .append("g")
      .attr("class", "y-axis chart1_yaxis")
      .call(yAxis_left)
      .attr("transform", `translate(${MARGINS.left}, 0)`);

    const yAxis_right = d3.axisRight(this.yScale).ticks(4).tickFormat(d3.format(".3~%"));

    this.yAxis
      .append("g")
      .attr("class", "y-axis chart1_yaxis")
      .call(yAxis_right)
      .attr("transform", `translate(${MARGINS.left+xlength}, 0)`);

    const yAxis_left_N = d3.axisLeft(this.yScale_N).ticks(4);

    this.yAxis
      .append("g")
      .attr("class", "y-axis chart1_yaxis")
      .call(yAxis_left_N)
      .attr("transform", `translate(${this.width-MARGINS.right-xlength}, 0)`);
  
    const yAxis_right_N = d3.axisRight(this.yScale_N).ticks(4);
  
    this.yAxis
      .append("g")
      .attr("class", "y-axis chart1_yaxis")
      .call(yAxis_right_N)
      .attr("transform", `translate(${this.width-MARGINS.right}, 0)`);
    
  }

  drawChart(){

    if(!this.topData || !this.botData){
      return;
    }
    Promise.all([
      this.topData.getAllFeatures().catch((err)=>[]),
      this.botData.getAllFeatures().catch((err)=>[]),
    ]).then(([topFeatures,botFeatures]) => {

      const topminima = findMinimaLocations(topFeatures);
      const botminima = findMinimaLocations(botFeatures);
      const topcycles = chuckFeaturesByMinima(topFeatures, topminima);
      const botcycles = chuckFeaturesByMinima(botFeatures, botminima);

      //get mean values from first cycle
      //top
      const topstart_I = d3.mean(topcycles[1], d => d.interstitial_area);
      const topstart_A = d3.mean(topcycles[1], d => d.alveoli_area);
      const topstart_N = d3.mean(topcycles[1], d => d.neutrophil_area);
      //bottom
      const botstart_I = d3.mean(botcycles[1], d => d.interstitial_area);
      const botstart_A = d3.mean(botcycles[1], d => d.alveoli_area);
      const botstart_N = d3.mean(botcycles[1], d => d.neutrophil_area);

      //get mean values from first cycle
      //top
      const topend_I = d3.mean(topcycles[topcycles.length - 2], d => d.interstitial_area);
      const topend_A = d3.mean(topcycles[topcycles.length - 2], d => d.alveoli_area);
      const topend_N = d3.mean(topcycles[topcycles.length - 2], d => d.neutrophil_area);
      //bottom
      const botend_I = d3.mean(botcycles[botcycles.length - 2], d => d.interstitial_area);
      const botend_A = d3.mean(botcycles[botcycles.length - 2], d => d.alveoli_area);
      const botend_N = d3.mean(botcycles[botcycles.length - 2], d => d.neutrophil_area);

      const [min_AI, max_AI] = d3.extent([topstart_A/topstart_I,botstart_A/botstart_I,topend_A/topend_I,botend_A/botend_I]);
      const [min_N, max_N] = d3.extent([topstart_N,botstart_N,topend_N,botend_N]);

      this.drawCoordinate({min_AI, max_AI, min_N, max_N});

      this.lines = this.svg.append("g");

      const { yScale, yScale_N} = this;
      const xlength = 0.5*(this.width-2*MARGINS.left-2*MARGINS.right);;
      
      //ratio
     this.lines.append("line")
     .attr("x1", MARGINS.left)
     .attr("x2", MARGINS.left+xlength)
     .attr("y1", yScale(topstart_A/topstart_I))
     .attr("y2", yScale(topend_A/topend_I))
     .attr("stroke", "#F4BC1C")
     .attr("stroke-width",2);

     this.lines.append("line")
     .attr("x1", MARGINS.left)
     .attr("x2", MARGINS.left+xlength)
     .attr("y1", yScale(botstart_A/botstart_I))
     .attr("y2", yScale(botend_A/botend_I))
     .attr("stroke", "#F4BC1C")
     .attr("stroke-dasharray",5)
     .attr("stroke-width",2);

     //neutrophil
     this.lines.append("line")
     .attr("x1", this.width-MARGINS.right-xlength)
     .attr("x2", this.width-MARGINS.right)
     .attr("y1", yScale_N(topstart_N) )
     .attr("y2", yScale_N(topend_N) )
     .attr("stroke", "#9CCC9C")
     .attr("stroke-width",2);

     this.lines.append("line")
     .attr("x1", this.width-MARGINS.right-xlength)
     .attr("x2", this.width-MARGINS.right)
     .attr("y1", yScale_N(botstart_N) )
     .attr("y2", yScale_N(botend_N) )
     .attr("stroke", "#9CCC9C")
     .attr("stroke-dasharray",5)
     .attr("stroke-width",2);


      //console.log(topstart_I, topend_I);
    });

  }

  


}
