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
      countryList: document.querySelector('.country__list'),
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

          const arrayOfNumbersAndNamesInCountry = [];
          for (let i = 0; i < this.$storage.getAllCountries().length; i++) {
              arrayOfNumbersAndNamesInCountry.push({
                  name: this.$storage.getAllCountries()[i].name,
                  totalCases: this.$storage.getAllCountries()[i].total.cases,
              })
          }
          
          function sortByNumbersOfCases(arr) {
              arr.sort((a, b) => a.totalCases < b.totalCases ? 1 : -1);
          }
          sortByNumbersOfCases(arrayOfNumbersAndNamesInCountry);

          for (let j = 0; j < arrayOfNumbersAndNamesInCountry.length; j++) {
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
    this.elements.mainContent.addEventListener('click', (event) => {
      if (event.target === this.elements.statisticResizeButton) {
        this.elements.statisticBlock.classList.toggle('statistic_full');
        this.elements.statisticResizeButton.classList.toggle('resize-button_minimize');
      }
      if(event.target === this.elements.chartResizeButton) {
        this.elements.chartBlock.classList.toggle('chart_full');
        this.elements.chartResizeButton.classList.toggle('resize-button_minimize');
      }
      if(event.target === this.elements.countryResizeButton) {
        this.elements.countryBlock.classList.toggle('country_full');
        this.elements.countryResizeButton.classList.toggle('resize-button_minimize');
      }
    });
  }
}
