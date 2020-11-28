import { FlowView } from "./views/FlowView.js";
import { ComparisonController } from "./controllers/ComparisonController.js";

const comparison = new ComparisonController();

comparison.setTopExperiment({ name: "control" });
comparison.setBotExperiment({ name: "tys" });

const flowView = new FlowView({
  flowContainer: d3.select("#flow"),

  experimentsContainer: d3.select("#animals"),
  topContainer: d3.select("#top-experiment"),
  botContainer: d3.select("#bot-experiment"),
  compareContainer: d3.select("#compare"),
});
