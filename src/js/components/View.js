import Charts from './Charts';
import map from '../open-street-map';

export default class View {
  constructor(app, storage) {
    this.$app = app;
    this.$storage = storage;
    this.chart = new Charts(this.$app);

    this.elements = {
      mainContent: document.querySelector('.main'),
      statisticBlock: document.querySelector('.statistic'),
      statisticResizeButton: document.querySelector('.resize-button_statistic'),
      chart: this.chart.elements,
      countryBlock: document.querySelector('.country'),
      countryResizeButton: document.querySelector('.resize-button_country'),
      countryList: document.querySelector('.country__list'),
      loaderMain: document.querySelector('.loader'),
      loaderMainProgress: document.querySelector('.loader__progress-line'),
    };
    console.log(this);
  }

  init() {
    this.loaderShow();
    this.renderStatistics();
    this.renderMap();
    this.renderChart();
    this.addListenersOnFullScreen();

    document.addEventListener(this.$app.config.events.loadCountries, () => {
      this.loaderHide.bind(this);
      this.renderTable();
    });
  }

  renderStatistics() {
  }

  renderTable() {
    const arrayOfNumbersAndNamesInCountry = [];
    for (let i = 0; i < this.$storage.getAllCountries().length; i += 1) {
      arrayOfNumbersAndNamesInCountry.push({
        name: this.$storage.getAllCountries()[i].name,
        totalCases: this.$storage.getAllCountries()[i].total.cases,
      })
    }

    function sortByNumbersOfCases(arr) {
      arr.sort((a, b) => a.totalCases < b.totalCases ? 1 : -1);
    }

    sortByNumbersOfCases(arrayOfNumbersAndNamesInCountry);

    for (let j = 0; j < arrayOfNumbersAndNamesInCountry.length; j += 1) {
      const listItem = document.createElement('li');
      listItem.className = "country__item";
      this.elements.countryList.append(listItem);

      const numberOfCasesInCountry = document.createElement('span');
      numberOfCasesInCountry.className = "country__cases";
      listItem.append(numberOfCasesInCountry);
      numberOfCasesInCountry.innerText = arrayOfNumbersAndNamesInCountry[j].totalCases;

      const nameOfCountry = document.createElement('h2');
      nameOfCountry.className = "country__name";
      listItem.append(nameOfCountry);
      nameOfCountry.innerText = arrayOfNumbersAndNamesInCountry[j].name;
    }
  }

  renderChart() {
    this.chart.init();
  }

  renderMap() {
    map.addMap();
  }

  loaderShow() {
    document.addEventListener(this.$app.config.events.loadProgress, (e) => {
      requestAnimationFrame(() => {
        this.elements.loaderMainProgress.style.width = `${(e.detail.current / e.detail.overall) * 100}%`;
      });
    });
    document.addEventListener(this.$app.config.events.loadAll, () => {
      setTimeout(() => {
        this.elements.loaderMain.classList.remove('show');
      }, this.$app.config.timeouts.loaderHide);
    })
  }

  loaderHide() {
  }

  addListenersOnFullScreen() {
    this.elements.mainContent.addEventListener('click', (event) => {
      if (event.target === this.elements.statisticResizeButton) {
        this.elements.statisticBlock.classList.toggle('statistic_full');
        this.elements.statisticResizeButton.classList.toggle('resize-button_minimize');
      }
      if (event.target === this.elements.chart.resizeButton) {
        this.elements.chart.block.classList.toggle('chart_full');
        this.elements.chart.resizeButton.classList.toggle('resize-button_minimize');
      }
      if (event.target === this.elements.countryResizeButton) {
        this.elements.countryBlock.classList.toggle('country_full');
        this.elements.countryResizeButton.classList.toggle('resize-button_minimize');
      }
    });
  }
}
