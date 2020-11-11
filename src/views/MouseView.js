//const ITEMS = ["control", "tys"];

import { ITEMS } from "../global.js";

const MARGINS = {
  top: 10,
  bottom: 10,
  left: 10,
  right: 10,
};

export class MouseView {
  constructor({ container, setTop, setBot, data }) {
    this.container = container;

    this.setTop = setTop;
    this.setBot = setBot;

    // ... do stuff here

    console.log("MouseView", this);

    this.list = this.container.select(".list");

    const view = this;

    this.list
      .selectAll(".mouse")
      .data(ITEMS)
      .join("div")
      .attr("class", "mouse dp-4")
      .each(function (d) {
        const mouse = d3.select(this);

        const title = mouse
          .selectAll(".name")
          .data([null])
          .join("div")
          .attr("class", "name")
          .each(function () {
            d3.select(this).append("span").text(d);
          });

        view.width = mouse.node().clientWidth - 24;
        view.height = mouse.node().clientWidth - 24;

        mouse
          .selectAll("svg")
          .data([null])
          .join("svg")
          .attr("width", view.width)
          .attr("height", view.height)
          .call(kiviat, view.width, view.height, {});

        const buttons = title
          .selectAll(".buttons")
          .data([null])
          .join("div")
          .attr("class", "buttons");

        buttons
          .selectAll("button")
          .data(["setTop", "setBot"])
          .join("button")
          .text((set) => set.substring(3))
          .on("click", (e, set) => {
            const setter = view[set];

            console.log(set, d);

            setter({ name: d });
          });
      });
  }
}

function kiviat(svg, width, height, data) {
  const numAttributes = 6; // Object.keys(data).length

  const axisG = svg
    .append("g")
    .attr("class", "axis-g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  axisG
    .selectAll(".kiv-axis")
    .data(Array.from({ length: numAttributes }))
    .join("line")
    .attr("class", "kiv-axis")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", width / 2 - MARGINS.left)
    .attr("y2", 0)
    .attr("transform", (d, i) => `rotate(${-90 + (360 * i) / numAttributes})`)
    .style("stroke", "white")
    .style("stroke-opacity", 0.25)
    .style("stroke-width", 4)
    .style("stroke-linecap", "round");

  const kiviatG = svg
    .append("g")
    .attr("class", "kiviat-g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`)
    .call(
      kiviatShape,
      [0, width / 2 - MARGINS.left],
      [...Array(numAttributes)].map(() => Math.random())
    );
}

function kiviatShape(g, extent, data) {
  const points = data.map((d, i) =>
    rotatePoint(
      d * (extent[1] - extent[0]) + extent[0],
      -90 + (360 * i) / data.length
    )
  );

  g.append("path")
    .attr("d", `M ${points.map((p) => p.join(", ")).join(" L ")} Z`)
    .attr("fill", "#00ffff77");
}

function rotatePoint(x, deg) {
  return [
    x * Math.cos((Math.PI * deg) / 180),
    x * Math.sin((Math.PI * deg) / 180),
  ];
}
