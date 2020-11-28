import { ExperimentController } from "./ExperimentController.js";

import { FeatureModel } from "../models/FeatureModel.js";

import { MouseView } from "../views/MouseView.js";
import { TimelineView } from "../views/comparison/TimelineView.js";

import { DifferenceChart } from "../views/comparison/DifferenceChart.js";
import { ViolinChart } from "../views/comparison/ViolinChart.js";
import { SlopeChart } from "../views/comparison/SlopeChart.js";
import { FlowView } from "../views/FlowView.js";

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

    this.diffChart = new DifferenceChart({
      container: d3.select("#compare #compare-chart-a"),
    });

    this.violinChart = new ViolinChart({
      container: d3.select("#compare #compare-chart-b"),
    });

    this.slopeChart = new SlopeChart({
      container: d3.select("#compare #compare-chart-c"),
    });

    this.flowView = new FlowView({
      flowContainer: d3.select("#flow"),

      experimentsContainer: d3.select("#animals"),
      topContainer: d3.select("#top-experiment"),
      botContainer: d3.select("#bot-experiment"),
      compareContainer: d3.select("#compare"),
    });
  }

  setTopExperiment({ name }) {
    this.topExperiment = new ExperimentController({
      name,
      container: d3.select("#top-experiment"),
      onSelectTime: (t) =>
        this.onTimeChange({ top: t, bot: this.botExperiment.currentTime }),
    });

    this.flowView.setTopSelection({ topContainer: d3.select(`#${name}`) });

    const data = new FeatureModel({ name });

    this.timeline.setTopData({ data });
    this.diffChart.setTopData({ data });
    this.violinChart.setTopData({ data, name });
    this.slopeChart.setTopData({ data });
  }

  setBotExperiment({ name }) {
    this.botExperiment = new ExperimentController({
      name,
      container: d3.select("#bot-experiment"),
      onSelectTime: (t) =>
        this.onTimeChange({ bot: t, top: this.topExperiment.currentTime }),
    });

    this.flowView.setBotSelection({ botContainer: d3.select(`#${name}`) });

    const data = new FeatureModel({ name });

    this.timeline.setBotData({ data });
    this.diffChart.setBotData({ data });
    this.violinChart.setBotData({ data, name });
    this.slopeChart.setBotData({ data });
  }

  onTimeChange({ top, bot }) {
    if (this.topExperiment) {
      this.topExperiment.setTime(top);
    }

    if (this.botExperiment) {
      this.botExperiment.setTime(bot);
    }

    this.timeline.setTime({ top, bot });
  }
}
