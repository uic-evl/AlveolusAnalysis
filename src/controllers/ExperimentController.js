import { ImageView } from "../views/experiment/ImageView.js";
import { RespCycleView } from "../views/experiment/RespCycleView.js";
import { FeatureView } from "../views/experiment/FeatureView.js";

import { FeatureModel } from "../models/FeatureModel.js";

export class ExperimentController {
  currentTime = 1;

  constructor({ name, container, onSelectTime }) {
    this.name = name;
    this.data = new FeatureModel({ name });
    this.onSelectTime = onSelectTime;

    this.image = new ImageView({
      name, // needed for image lookup
      data: this.data,
      container: container.select(".image-wrapper"),
    });

    this.resp = new RespCycleView({
      data: this.data,
      container: container.select(".resp-cycle"),
      onSelectTime: this.timeUpdated.bind(this),
    });

    this.features = new FeatureView({
      name, // needed for title
      data: this.data,
      container: container.select(".feature-charts"),
      onSelectTime: this.timeUpdated.bind(this),
    });
  }

  setTime(t) {
    if (t !== this.currentTime) {
      this.currentTime = t;

      this.image.setTime(t);
      this.resp.setTime(t);
      this.features.setTime(t);
    }
  }

  timeUpdated(t) {
    this.onSelectTime(t);
  }
}
