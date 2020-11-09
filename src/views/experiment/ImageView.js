const IMAGE_FOLDER = "./test_data/combined_images";

export class ImageView {
  name = "";
  svg = d3.select();

  contours = [];
  currentTime = 1;

  constructor({ name, container, data }) {
    this.name = name;
    this.container = container;
    this.svg = this.container.select("svg");

    this.svg.selectAll(".contour-group, image").remove();

    this.container.style("width", this.container.node().clientHeight + "px");

    data
      .getAllFeatures()
      .then((features) => (this.contours = features))
      .then(() => this.setTime(this.currentTime))
      .catch((err) => console.log(err));

    const image = (this.image = this.svg
      .append("image")
      .style("filter", "url(#blue-only)")
      .attr("width", 512)
      .attr("height", 512)
      .attr("y", 0)
      .attr("x", 0));

    this.featureG = this.svg.append("g").attr("class", "contour-group");

    this.setTime(1);

    this.container
      .selectAll(".filter-dropdown .options button")
      .on("click", function () {
        const button = d3.select(this);

        // console.log(button.node().dataset.value);

        image.style("filter", button.node().dataset.value);
      });
  }

  setTime(t) {
    this.currentTime = t;

    this.image.attr(
      "href",
      `${IMAGE_FOLDER}/${this.name}/${t.toString().padStart(6, "0")}.png`
    );

    if (this.contours[t - 1]) {
      this.featureG.attr("visibility", "visible");
      const {
        alveoli_location: centers,
        alveoli_contour_outlines: paths,
        neutrophil_location: neutCenters,
        neutrophil_contour_outlines: neutPaths,
      } = this.contours[t - 1];

      console.log(this.contours[t - 1]);

      this.featureG
        .selectAll(".feature")
        .data(Object.keys(centers))
        .join("g")
        .attr("class", "feature")
        .each(function (id) {
          const g = d3.select(this);
          const center = centers[id];
          const points = paths[id];

          g.selectAll("circle")
            .data([null])
            .join("circle")
            .attr("cx", center[0])
            .attr("cy", center[1])
            .attr("r", 2)
            .attr("fill", "white");

          g.selectAll("path")
            .data([null])
            .join("path")
            .attr(
              "d",
              "M " + points.map((p) => p[0].join(", ")).join("L ") + " Z"
            )
            .attr("fill", "none")
            .attr("stroke", "white")
            .style("stroke-linejoin", "round");
        });

      this.featureG
        .selectAll(".neut")
        .data(Object.keys(neutCenters))
        .join("g")
        .attr("class", "neut")
        .each(function (id) {
          const g = d3.select(this);
          const points = neutPaths[id];

          g.selectAll("path")
            .data([null])
            .join("path")
            .attr(
              "d",
              "M " + points.map((p) => p[0].join(", ")).join("L ") + " Z"
            )
            .attr("fill", "#f00")
            .style("stroke-linejoin", "round");
        });
    } else {
      this.featureG.attr("visibility", "hidden");
    }
  }
}
