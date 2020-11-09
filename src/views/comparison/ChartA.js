export class ChartA {
  topData = null;
  botData = null;

  constructor({ container }) {
    this.container = container;
    //create the svg
    this.width = this.style('width'); this.height = this.width / 2;
    this.margin = {top: 20, right: 75, bottom: 45, left: 50};
    // ... do stuff here

    console.log("ChartA", this);
  }

  setTopData({ data }) {
    this.topData = data;
  }

  setBotData({ data }) {
    this.botData = data;
  }
}
