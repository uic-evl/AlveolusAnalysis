export class TimelineView {
  topData = null;
  botData = null;

  constructor({ container, onChange }) {
    this.container = container;
    this.onChange = onChange;

    console.log("TimelineView", this);

    container.select("input").on("input", ({ target }) => {
      const { value } = target;

      this.onChange({
        top: value,
        bot: value,
      });
    });
  }

  setTopData({ data }) {
    this.topData = data;
  }

  setBotData({ data }) {
    this.botData = data;
  }
}
