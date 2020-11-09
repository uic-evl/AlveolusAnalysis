export class FeatureView {
  constructor({ data, container }) {
    this.data = data;
    this.container = container;

    // ... do stuff here

    console.log("FeatureView", this);
  }

  setTime(t) {
    // console.log("FeatureView time:", t);
  }
}
