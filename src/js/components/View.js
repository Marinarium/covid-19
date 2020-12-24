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
        locationCasesIn: document.querySelector('.information__numbers_location'),
        allCases: document.querySelector('.information__numbers_all'),
        deaths: document.querySelector('.information__numbers_deaths'),
        recovered: document.querySelector('.information__numbers_recovered'),
        timeSwitcher: document.querySelector('.switches__item_time'),
        timeButton: document.querySelector('.switches__btn_time'),
        casesSwitcher: document.querySelector('.switches__item_cases'),
        casesButton: document.querySelector('.switches__btn_cases'),
    };
    console.log(this);
  }

  init() {
    this.loaderShow();
    this.renderMap();
    this.addListenersOnFullScreen();
    this.toggleSwitch();
      document.addEventListener(this.$app.config.events.loadCountries, () => {
          this.loaderHide.bind(this);
          this.renderTable();
          this.renderStatistics('global-all-cases');
          this.toggleCountries();
      });
  }

  renderStatistics(mode, country) {
      if (mode === 'global-all-cases') {
          this.elements.locationCasesIn.innerText = 'The World';
          this.elements.allCases.innerText = this.$storage.getWorldData().total.cases.toLocaleString();
          this.elements.deaths.innerText = this.$storage.getWorldData().total.deaths.toLocaleString();
          this.elements.recovered.innerText = this.$storage.getWorldData().total.recovered.toLocaleString();
      }
      if(mode === 'global-last-cases') {
          this.elements.locationCasesIn.innerText = 'The World';
          this.elements.allCases.innerText = this.$storage.getWorldData().lastDay.cases.toLocaleString();
          this.elements.deaths.innerText = this.$storage.getWorldData().lastDay.deaths.toLocaleString();
          this.elements.recovered.innerText = this.$storage.getWorldData().lastDay.recovered.toLocaleString();
      }
      if (mode === 'global-all-per') {
          this.elements.locationCasesIn.innerText = 'The World';
          this.elements.allCases.innerText = this.$storage.getWorldData().perOneHundredThousandWorldTotal.cases;
          this.elements.deaths.innerText = this.$storage.getWorldData().perOneHundredThousandWorldTotal.deaths;
          this.elements.recovered.innerText = this.$storage.getWorldData().perOneHundredThousandWorldTotal.recovered;
      }
      if (mode === 'global-last-per') {
          this.elements.locationCasesIn.innerText = 'The World';
          this.elements.allCases.innerText = this.$storage.getWorldData().perOneHundredThousandWorldLastDay.cases;
          this.elements.deaths.innerText = this.$storage.getWorldData().perOneHundredThousandWorldLastDay.deaths;
          this.elements.recovered.innerText = this.$storage.getWorldData().perOneHundredThousandWorldLastDay.recovered;
      }
      if (mode === 'country-all-cases') {
          this.elements.locationCasesIn.innerText = country;
          const choosenCountry = this.$storage.getAllCountries().find(item => item.name === country);
          this.elements.allCases.innerText = choosenCountry.total.cases.toLocaleString();
          this.elements.deaths.innerText = choosenCountry.total.deaths.toLocaleString();
          this.elements.recovered.innerText = choosenCountry.total.recovered.toLocaleString();
      }
      if (mode === 'country-last-cases') {
          this.elements.locationCasesIn.innerText = country;
          const choosenCountry = this.$storage.getAllCountries().find(item => item.name === country);
          this.elements.allCases.innerText = choosenCountry.lastDay.cases.toLocaleString();
          this.elements.deaths.innerText = choosenCountry.lastDay.deaths.toLocaleString();
          this.elements.recovered.innerText = choosenCountry.lastDay.recovered.toLocaleString();
      }
      if (mode === 'country-all-per') {
          this.elements.locationCasesIn.innerText = country;
          const choosenCountry = this.$storage.getAllCountries().find(item => item.name === country);
          this.elements.allCases.innerText = choosenCountry.perOneHundredThousandTotal.cases;
          this.elements.deaths.innerText = choosenCountry.perOneHundredThousandTotal.deaths;
          this.elements.recovered.innerText = choosenCountry.perOneHundredThousandTotal.recovered;
      }
      if (mode === 'country-last-per') {
          this.elements.locationCasesIn.innerText = country;
          const choosenCountry = this.$storage.getAllCountries().find(item => item.name === country);
          this.elements.allCases.innerText = choosenCountry.perOneHundredThousandLastDay.cases;
          this.elements.deaths.innerText = choosenCountry.perOneHundredThousandLastDay.deaths;
          this.elements.recovered.innerText = choosenCountry.perOneHundredThousandLastDay.recovered;
      }
  }

  renderTable() {
      console.log(this.$storage.getAllCountries());
      const arrayOfNumbersAndNamesInCountry = [];
      for (let i = 0; i < this.$storage.getAllCountries().length; i++) {
          arrayOfNumbersAndNamesInCountry.push({
              name: this.$storage.getAllCountries()[i].name,
              totalCases: this.$storage.getAllCountries()[i].total.cases,
              iso: this.$storage.getAllCountries()[i].iso,
          })
      }

      function sortByNumbersOfCases(arr) {
          arr.sort((a, b) => a.totalCases < b.totalCases ? 1 : -1);
      }
      sortByNumbersOfCases(arrayOfNumbersAndNamesInCountry);

      for (let j = 0; j < arrayOfNumbersAndNamesInCountry.length; j++) {
          const listItem = document.createElement('li');
          listItem.className = "country__item";
          listItem.setAttribute('data-iso', arrayOfNumbersAndNamesInCountry[j].iso);
          listItem.setAttribute('data-country', arrayOfNumbersAndNamesInCountry[j].name);
          this.elements.countryList.append(listItem);

          const numberOfCasesInCountry = document.createElement('span');
          numberOfCasesInCountry.className = "country__cases";
          listItem.append(numberOfCasesInCountry);
          numberOfCasesInCountry.innerText = arrayOfNumbersAndNamesInCountry[j].totalCases.toLocaleString();

          const nameOfCountry = document.createElement('h2');
          nameOfCountry.className = "country__name";
          listItem.append(nameOfCountry);
          nameOfCountry.innerText = arrayOfNumbersAndNamesInCountry[j].name;
      }
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

  toggleSwitch(){
      this.elements.timeSwitcher.addEventListener('click', () => {
          if(event.target.getAttribute('data-param') === 'all-time') {
              this.elements.timeButton.innerText = 'all time';
              if(this.elements.casesButton.innerText === 'all cases' && this.elements.locationCasesIn.innerText === 'The World') {
                  this.renderStatistics('global-all-cases');
              }
              if(this.elements.casesButton.innerText === 'per 100 000' && this.elements.locationCasesIn.innerText === 'The World') {
                  this.renderStatistics('global-all-per');
              }
              if(this.elements.casesButton.innerText === 'all cases' && this.elements.locationCasesIn.innerText !== 'The World') {
                  this.renderStatistics('country-all-cases', this.elements.locationCasesIn.innerText);
              }
              if(this.elements.casesButton.innerText === 'per 100 000' && this.elements.locationCasesIn.innerText !== 'The World') {
                  this.renderStatistics('country-all-per', this.elements.locationCasesIn.innerText);
              }
          }
          if(event.target.getAttribute('data-param') === 'last-day') {
              this.elements.timeButton.innerText = 'last day';
              if(this.elements.casesButton.innerText === 'all cases' && this.elements.locationCasesIn.innerText === 'The World') {
                  this.renderStatistics('global-last-cases');
              }
              if(this.elements.casesButton.innerText === 'per 100 000' && this.elements.locationCasesIn.innerText === 'The World') {
                  this.renderStatistics('global-last-per');
              }
              if(this.elements.casesButton.innerText === 'all cases' && this.elements.locationCasesIn.innerText !== 'The World') {
                  this.renderStatistics('country-last-cases', this.elements.locationCasesIn.innerText);
              }
              if(this.elements.casesButton.innerText === 'per 100 000' && this.elements.locationCasesIn.innerText !== 'The World') {
                  this.renderStatistics('country-last-per', this.elements.locationCasesIn.innerText);
              }
          }
      });
      this.elements.casesSwitcher.addEventListener('click', () => {
          if(event.target.getAttribute('data-param') === 'all-cases') {
              this.elements.casesButton.innerText = 'all cases';
              if(this.elements.timeButton.innerText === 'all time' && this.elements.locationCasesIn.innerText === 'The World') {
                  this.renderStatistics('global-all-cases');
              }
              if(this.elements.timeButton.innerText === 'last day' && this.elements.locationCasesIn.innerText === 'The World') {
                  this.renderStatistics('global-last-cases');
              }
              if(this.elements.timeButton.innerText === 'all time' && this.elements.locationCasesIn.innerText !== 'The World') {
                  this.renderStatistics('country-all-cases', this.elements.locationCasesIn.innerText);
              }
              if(this.elements.timeButton.innerText === 'last day' && this.elements.locationCasesIn.innerText !== 'The World') {
                  this.renderStatistics('country-last-cases', this.elements.locationCasesIn.innerText);
              }
          }
          if(event.target.getAttribute('data-param') === 'per-cases') {
              this.elements.casesButton.innerText = 'per 100 000';
              if(this.elements.timeButton.innerText === 'all time' && this.elements.locationCasesIn.innerText === 'The World') {
                  this.renderStatistics('global-all-per');
              }
              if(this.elements.timeButton.innerText === 'last day' && this.elements.locationCasesIn.innerText === 'The World') {
                  this.renderStatistics('global-last-per');
              }
              if(this.elements.timeButton.innerText === 'all time' && this.elements.locationCasesIn.innerText !== 'The World') {
                  this.renderStatistics('country-all-per', this.elements.locationCasesIn.innerText);
              }
              if(this.elements.timeButton.innerText === 'last day' && this.elements.locationCasesIn.innerText !== 'The World') {
                  this.renderStatistics('country-last-per', this.elements.locationCasesIn.innerText);
              }
          }
      });
  }

  toggleCountries(){
      const countryItems = document.querySelectorAll('.country__item');
      this.elements.countryList.addEventListener('click', () => {

          let getCountry = (countryItem) => {
              if(countryItem.contains(event.target)){
                  if(this.elements.timeButton.innerText === 'all time' && this.elements.casesButton.innerText === 'all cases'){
                      this.renderStatistics('country-all-cases', countryItem.getAttribute('data-country'));
                  }
                  if(this.elements.timeButton.innerText === 'last day' && this.elements.casesButton.innerText === 'all cases'){
                      this.renderStatistics('country-last-cases', countryItem.getAttribute('data-country'));
                  }
                  if(this.elements.timeButton.innerText === 'all time' && this.elements.casesButton.innerText === 'per 100 000'){
                      this.renderStatistics('country-all-per', countryItem.getAttribute('data-country'));
                  }
                  if(this.elements.timeButton.innerText === 'last day' && this.elements.casesButton.innerText === 'per 100 000'){
                      this.renderStatistics('country-last-per', countryItem.getAttribute('data-country'));
                  }
              }
          };

          for (let i = 0; i < countryItems.length; i++) {
              getCountry(countryItems[i]);
          }
      });
  }
}
