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
      chartBlock: document.querySelector('.chart'),
      chartResizeButton: document.querySelector('.resize-button_chart'),
      chartGraph: document.querySelector('.chart__box'),
      chartLoaderProgress: document.querySelector('.chart__loader-progress'),
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
    this.addLoaderListeners();
    this.renderMap();
    this.renderChart();

    this.addFullScreenListeners();
    this.addSwitchListenters();
    this.addCountriesListListeners();

    document.addEventListener(this.$app.config.events.loadCountries, () => {
      this.renderTable();
    });

    document.addEventListener(this.$app.config.events.loadAll, () => {
      this.renderStatistics();
    });

    document.addEventListener(this.$app.config.events.countryChanged, this.renderStatistics.bind(this));
    document.addEventListener(this.$app.config.events.periodChanged, this.renderStatistics.bind(this));
    document.addEventListener(this.$app.config.events.casesChanged, this.renderStatistics.bind(this));
  }

  renderStatistics() {
    const country = this.$storage.states.selectedCountry;
    const period = this.$storage.states.typePeriod;
    const cases = this.$storage.states.typeCases;
    const {periodModes} = this.$storage.statesCollection;
    const {casesModes} = this.$storage.statesCollection;

    const areaData = (country === 'world')
      ? this.$storage.getWorld()
      : this.$storage.getCountryDataByCode(country);
    const locationTitle = (country === 'world') ? 'The World' : areaData.name;
    const mode = `${period}-${cases}`;

    this.elements.locationCasesIn.innerText = locationTitle;

    if (mode === `${periodModes.allTime}-${casesModes.allCases}`) {
      this.elements.allCases.innerText = areaData.total.cases;
      this.elements.deaths.innerText = areaData.total.deaths;
      this.elements.recovered.innerText = areaData.total.recovered;
    }

    if (mode === `${periodModes.lastDay}-${casesModes.allCases}`) {
      this.elements.allCases.innerText = areaData.lastDay.cases;
      this.elements.deaths.innerText = areaData.lastDay.deaths;
      this.elements.recovered.innerText = areaData.lastDay.recovered;
    }

    if (mode === `${periodModes.allTime}-${casesModes.per100k}`) {
      this.elements.allCases.innerText = areaData.perOneHundredThousandTotal.cases;
      this.elements.deaths.innerText = areaData.perOneHundredThousandTotal.deaths;
      this.elements.recovered.innerText = areaData.perOneHundredThousandTotal.recovered;
    }

    if (mode === `${periodModes.lastDay}-${casesModes.per100k}`) {
      this.elements.allCases.innerText = areaData.perOneHundredThousandLastDay.cases;
      this.elements.deaths.innerText = areaData.perOneHundredThousandLastDay.deaths;
      this.elements.recovered.innerText = areaData.perOneHundredThousandLastDay.recovered;
    }
  }

  renderTable() {
    const arrayOfNumbersAndNamesInCountry = [];

    for (let i = 0; i < this.$storage.getAllCountries().length; i += 1) {
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

    for (let j = 0; j < arrayOfNumbersAndNamesInCountry.length; j += 1) {
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

  renderChart() {
    this.chart.init();
  }

  renderMap() {
    map.addMap();
  }

  addLoaderListeners() {
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

  addFullScreenListeners() {
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

  addSwitchListenters() {
    const loadStates = this.$storage.states.isDataLoad;
    const {periodModes} = this.$storage.statesCollection;
    const {casesModes} = this.$storage.statesCollection;

    this.elements.timeSwitcher.addEventListener('click', (event) => {
      if (!loadStates.world || !loadStates.countries) return;

      if (event.target.getAttribute('data-param') === periodModes.allTime) {
        this.elements.timeButton.innerText = 'all time';
        this.$storage.states.typePeriod = periodModes.allTime;
      }

      if (event.target.getAttribute('data-param') === periodModes.lastDay) {
        this.elements.timeButton.innerText = 'last day';
        this.$storage.states.typePeriod = periodModes.lastDay;
      }
    });

    this.elements.casesSwitcher.addEventListener('click', (event) => {
      if (!loadStates.world || !loadStates.countries) return;

      if (event.target.getAttribute('data-param') === casesModes.allCases) {
        this.elements.casesButton.innerText = 'all cases';
        this.$storage.states.typeCases = casesModes.allCases;
      }

      if (event.target.getAttribute('data-param') === casesModes.per100k) {
        this.elements.casesButton.innerText = 'per 100k';
        this.$storage.states.typeCases = casesModes.per100k;
      }
    });
  }

  addCountriesListListeners() {
    this.elements.countryList.addEventListener('click', (event) => {
      this.$storage.states.selectedCountry = event.target.closest('[data-iso]').dataset.iso;
    });
  }
}
