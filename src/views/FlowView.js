// const PADDING_Y = 12;
const PADDING_Y = 0.3;

export class FlowView {
  topSelection = d3.select("#control");
  botSelection = d3.select("#tys");

  constructor({
    flowContainer,

    topContainer,
    botContainer,
    compareContainer,
    experimentsContainer,
  }) {
    this.top = topContainer;
    this.bot = botContainer;
    this.compare = compareContainer;
    this.experiments = experimentsContainer;

    this.svg = flowContainer.select("svg");
    this.topFlow = this.svg.append("g");
    this.botFlow = this.svg.append("g");
    this.compFlow = this.svg.append("g");

    this.draw();
  }

  setTopSelection({ topContainer }) {
    this.topSelection = topContainer;
    const expLoc = this.experiments.node().getBoundingClientRect();
    const topSelLoc = this.topSelection.node().getBoundingClientRect();
    const topLoc = this.top.node().getBoundingClientRect();

    this.topFlow
      .selectAll(".flow-path")
      .data([null])
      .join("path")
      .attr("class", "flow-path")
      .call(
        drawFlow,
        getFlowCoords({ ...topSelLoc.toJSON(), right: expLoc.right }, topLoc)
      );
  }

  setBotSelection({ botContainer }) {
    this.botSelection = botContainer;
    this.draw();
  }

  draw() {
    const expLoc = this.experiments.node().getBoundingClientRect();
    const topSelLoc = this.topSelection.node().getBoundingClientRect();
    const botSelLoc = this.botSelection.node().getBoundingClientRect();
    const topLoc = this.top.node().getBoundingClientRect();
    const botLoc = this.bot.node().getBoundingClientRect();
    const compLoc = this.compare.node().getBoundingClientRect();

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.svg.attr("width", this.width);
    this.svg.attr("height", this.height);

    // this.svg
    //   .append("rect")
    //   .attr("class", "wrapper-box")
    //   .call(sizeBox, topSelLoc);
    // this.svg
    //   .append("rect")
    //   .attr("class", "wrapper-box")
    //   .call(sizeBox, botSelLoc);
    // this.svg.append("rect").attr("class", "wrapper-box").call(sizeBox, topLoc);
    // this.svg.append("rect").attr("class", "wrapper-box").call(sizeBox, botLoc);
    // this.svg.append("rect").attr("class", "wrapper-box").call(sizeBox, compLoc);

    this.svg
      .append("path")
      .attr("class", "flow-path")
      .call(
        drawFlow,
        getFlowCoords({ ...botSelLoc.toJSON(), right: expLoc.right }, botLoc)
      );

    this.svg
      .append("path")
      .attr("class", "flow-path")
      .call(
        drawFlow,
        getFlowCoords(topLoc, {
          ...compLoc.toJSON(),
          bottom: compLoc.bottom - compLoc.height * 0.12,
        })
      );

    this.svg
      .append("path")
      .attr("class", "flow-path")
      .call(
        drawFlow,
        getFlowCoords(botLoc, {
          ...compLoc.toJSON(),
          top: compLoc.top + compLoc.height * 0.12,
        })
      );
  }
}

function sizeBox(selection, { top, left, width, height }) {
  selection
    .attr("rx", 8)
    .attr("x", left)
    .attr("y", top)
    .attr("width", width)
    .attr("height", height);
}

function drawFlow(selection, { startX, startY1, startY2, endX, endY1, endY2 }) {
  const xMid1 = startX + (1 * (endX - startX)) / 3;
  const xMid2 = endX - (1 * (endX - startX)) / 3;
  // const xMid1 = startX;
  // const xMid2 = endX;

  const path = `
    M ${startX} ${startY2}
    C ${xMid2} ${startY2}, ${xMid1} ${endY2}, ${endX} ${endY2}
    L ${endX} ${endY1}
    C ${xMid1} ${endY1}, ${xMid2} ${startY1}, ${startX} ${startY1}
    Z`;

  selection.attr("d", path);
}

function getFlowCoords(box1, box2) {
  console.log(box1, box2);
  return {
    startX: box1.right,
    startY1: box1.top + PADDING_Y * box1.height,
    startY2: box1.bottom - PADDING_Y * box1.height,
    endX: box2.left,
    endY1: box2.top + PADDING_Y * box2.height,
    endY2: box2.bottom - PADDING_Y * box2.height,
  };
}
