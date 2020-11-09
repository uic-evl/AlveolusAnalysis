import { ComparisonController } from "./controllers/ComparisonController.js";

// const topImage = new ImageView({
//   name: "tys",
//   container: d3.select("#top-image-wrapper"),
// });

// const botImage = new ImageView({
//   name: "tys",
//   container: d3.select("#bot-image-wrapper"),
// });

const comparison = new ComparisonController();

comparison.setTopExperiment({ name: "tys" });
comparison.setBotExperiment({ name: "tys" });
