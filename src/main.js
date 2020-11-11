import { ComparisonController } from "./controllers/ComparisonController.js";

const comparison = new ComparisonController();

comparison.setTopExperiment({ name: "tys" });
comparison.setBotExperiment({ name: "tys" });
