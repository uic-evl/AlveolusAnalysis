console.log("in main");

const folder1 = "./test_data/combined_images/control/";
const folder2 = "./test_data/combined_images/tys/";

d3.select("#top-image").attr(
  "src",
  `${folder1}${"1".toString().padStart(6, "0")}.png`
);
d3.select("#bot-image").attr(
  "src",
  `${folder2}${"1".toString().padStart(6, "0")}.png`
);

d3.select("#time-slider").on("input", ({ target }) => {
  const { value } = target;

  d3.select("#top-image").attr(
    "src",
    `${folder1}${value.toString().padStart(6, "0")}.png`
  );
  d3.select("#bot-image").attr(
    "src",
    `${folder2}${value.toString().padStart(6, "0")}.png`
  );
});
