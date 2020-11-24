import { NUM_TIMESTEPS } from "../global.js";

const FEATURE_SETS = {};

export class FeatureModel {
  constructor({ name }) {
    this.name = name;
  }

  getAllFeatures() {
    if (!FEATURE_SETS[this.name]) {
      FEATURE_SETS[this.name] = fetch(`./test_data/features/${this.name}.json`)
        .then((res) => res.json())
        .then(
          (features) =>
            (FEATURE_SETS[this.name] = features.slice(0, NUM_TIMESTEPS + 1))
        );
    }

    if (FEATURE_SETS[this.name] instanceof Promise) {
      return FEATURE_SETS[this.name];
    } else {
      return Promise.resolve(FEATURE_SETS[this.name]);
    }
  }

  // other specific accessors below ...
}
