import map from '../open-street-map';

export default class View {
  constructor(app, storage) {
    this.$app = app;
    this.$storage = storage;
    this.elements = {
      mainContent: document.querySelector('.main'),
      statisticBlock: document.querySelector('.statistic'),
      statisticResizeButton: document.querySelector('.resize-button_statistic'),
      chartBlock: document.querySelector('.chart'),
      chartResizeButton: document.querySelector('.resize-button_chart'),
      countryBlock: document.querySelector('.country'),
      countryResizeButton: document.querySelector('.resize-button_country'),
    };
    console.log(this);
  }

  init() {
    this.loaderShow();

    this.renderStatistics();
    this.renderTable();
    this.renderMap();
    this.addListenersOnFullScreen();

    document.addEventListener(this.$app.config.events.loadCountries, () => {
      this.loaderHide.bind(this);
      console.log(this.$storage.getAllCountries());
    });
  }

  renderStatistics() {
  }

  renderTable() {
  }

  renderMap() {
    map.addMap();
  }

  loaderShow() {
  }

  loaderHide() {
  }

  addListenersOnFullScreen() {
    this.elements.mainContent.addEventListener('click', () => {
      if (event.target == this.elements.statisticResizeButton) {
        this.elements.statisticBlock.classList.toggle('statistic_full');
        this.elements.statisticResizeButton.classList.toggle('resize-button_minimize');
      }
      if(event.target == this.elements.chartResizeButton) {
        this.elements.chartBlock.classList.toggle('chart_full');
        this.elements.chartResizeButton.classList.toggle('resize-button_minimize');
      }
      if(event.target == this.elements.countryResizeButton) {
        this.elements.countryBlock.classList.toggle('country_full');
        this.elements.countryResizeButton.classList.toggle('resize-button_minimize');
      }
    });
  }
}
