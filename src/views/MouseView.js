const ITEMS = ["control", "tys"];

export class MouseView {
  constructor({ container, setTop, setBot }) {
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
      .attr("class", "mouse dp-1")
      .each(function (d) {
        const mouse = d3.select(this);

        mouse
          .selectAll(".name")
          .data([null])
          .join("div")
          .attr("class", "name")
          .text(d);

        const buttons = mouse
          .selectAll(".buttons")
          .data([null])
          .join("div")
          .attr("class", "buttons");

        buttons
          .selectAll("button")
          .data(["setTop", "setBot"])
          .join("button")
          .text((set) => set)
          .on("click", (e, set) => {
            const setter = view[set];

            console.log(set, d);

            setter({ name: d });
          });
      });
  }
}
