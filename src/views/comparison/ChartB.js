export class ChartB {
  topData = null;
  botData = null;

  constructor({ container }) {
    this.container = container;

    // ... do stuff here

    console.log("ChartB", this);
  }

  setTopData({ data }) {
    this.topData = data;
  }

  setBotData({ data }) {
    this.botData = data;
  }
}
