export class ChartC {
  topData = null;
  botData = null;

  constructor({ container }) {
    this.container = container;

    // ... do stuff here

    console.log("ChartC", this);
  }

  setTopData({ data }) {
    this.topData = data;
  }

  setBotData({ data }) {
    this.botData = data;
  }
}
