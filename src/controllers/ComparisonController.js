import { ExperimentController } from "./ExperimentController.js";

import { FeatureModel } from "../models/FeatureModel.js";

import { MouseView } from "../views/MouseView.js";
import { TimelineView } from "../views/comparison/TimelineView.js";

import { ChartA } from "../views/comparison/ChartA.js";
import { ChartB } from "../views/comparison/ChartB.js";
import { ChartC } from "../views/comparison/ChartC.js";

export class ComparisonController {
  topExperiment = null;
  botExperiment = null;

  constructor() {
    this.experimentList = new MouseView({
      container: d3.select("#animals"),
      setTop: this.setTopExperiment.bind(this),
      setBot: this.setBotExperiment.bind(this),
    });

    this.timeline = new TimelineView({
      container: d3.select("#timeline-control"),
      onChange: this.onTimeChange.bind(this),
    });

    // these names can change once we know exactly what they are
    this.chartA = new ChartA({
      container: d3.select("#compare #compare-chart-a"),
    });
    this.chartB = new ChartB({
      container: d3.select("#compare #compare-chart-b"),
    });
    this.chartC = new ChartC({
      container: d3.select("#compare #compare-chart-c"),
    });
  }

  setTopExperiment({ name }) {
    this.topExperiment = new ExperimentController({
      name,
      container: d3.select("#top-experiment"),
    });

    const data = new FeatureModel({ name });

    this.timeline.setTopData({ data });
    this.chartA.setTopData({ data });
    this.chartB.setTopData({ data, name });
    this.chartC.setTopData({ data });
  }

  setBotExperiment({ name }) {
    this.botExperiment = new ExperimentController({
      name,
      container: d3.select("#bot-experiment"),
    });

    const data = new FeatureModel({ name });

    this.timeline.setBotData({ data });
    this.chartA.setBotData({ data });
    this.chartB.setBotData({ data, name });
    this.chartC.setBotData({ data });
  }

  onTimeChange({ top, bot }) {
    if (this.topExperiment) {
      this.topExperiment.setTime(top);
    }

    if (this.botExperiment) {
      this.botExperiment.setTime(bot);
    }
  }
}
