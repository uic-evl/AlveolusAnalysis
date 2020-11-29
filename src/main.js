import { FlowView } from "./views/FlowView.js";
import { ComparisonController } from "./controllers/ComparisonController.js";

const comparison = new ComparisonController();

comparison.setTopExperiment({ name: "control" });
comparison.setBotExperiment({ name: "tys" });

// set up basic ui tooltips
tippy("#step-back", { content: "Slow Down", animation: "scale" });
tippy("#play-button", { content: "Play/Pause", animation: "scale" });
tippy("#step-forward", { content: "Step Forward", animation: "scale" });

tippy("#slow-down", { content: "Slow Down", animation: "scale" });
tippy("#speed-up", { content: "Speed Up", animation: "scale" });
