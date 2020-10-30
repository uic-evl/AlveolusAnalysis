console.log("in main");

const folder1 = "./test_data/combo/";
const folder2 = "./test_data/maxed_combo/";

const timesteps = [
  "001200",
  "001202",
  "001203",
  "001205",
  "001206",
  "001207",
  "001208",
  "001209",
  "001210",
  "001212",
];

d3.select("#time-slider").on("input", ({ target }) => {
  const { value } = target;

  d3.select("#top-image").attr("src", `${folder1}${timesteps[value]}.png`);
  d3.select("#bot-image").attr("src", `${folder2}${timesteps[value]}.png`);
});
