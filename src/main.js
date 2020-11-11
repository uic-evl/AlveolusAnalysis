import { ComparisonController } from "./controllers/ComparisonController.js";

const comparison = new ComparisonController();

comparison.setTopExperiment({ name: "control" });
comparison.setBotExperiment({ name: "tys" });
