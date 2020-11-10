import { ImageView } from "../views/experiment/ImageView.js";
import { RespCycleView } from "../views/experiment/RespCycleView.js";
import { FeatureView } from "../views/experiment/FeatureView.js";

import { FeatureModel } from "../models/FeatureModel.js";

export class ExperimentController {
  constructor({ name, container }) {
    this.name = name;
    this.data = new FeatureModel({ name });

    this.image = new ImageView({
      name, // needed for image lookup
      data: this.data,
      container: container.select(".image-wrapper"),
    });

    this.resp = new RespCycleView({
      data: this.data,
      container: container.select(".resp-cycle"),
    });

    this.features = new FeatureView({
      name, // needed for title
      data: this.data,
      container: container.select(".feature-charts"),
    });
  }

  setTime(t) {
    this.image.setTime(t);
    this.resp.setTime(t);
    this.features.setTime(t);
  }
}
