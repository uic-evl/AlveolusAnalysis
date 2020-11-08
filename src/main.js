import { ImageView } from "./views/ImageView.js";

console.log("in main");

const folder1 = "./test_data/combined_images/control/";
const folder2 = "./test_data/combined_images/tys/";

const topImage = new ImageView({
  name: "tys",
  container: d3.select("#top-image-wrapper"),
});

const botImage = new ImageView({
  name: "control",
  container: d3.select("#bot-image-wrapper"),
});

d3.select("#time-slider").on("input", ({ target }) => {
  const { value } = target;

  topImage.setTime(value);
  botImage.setTime(value);
});

fetch("./test_data/features/tys.json")
  .then((res) => res.json())
  .then(console.log);
