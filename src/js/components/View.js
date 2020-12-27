import Charts from './Charts';
import Map from './Map';

export default class View {
  constructor(app, storage) {
    this.$app = app;
    this.$storage = storage;
    this.chart = new Charts(this.$app);
    this.map = new Map(this.$app);

    this.elements = {
      mainContent: document.querySelector('.main'),
      statisticBlock: document.querySelector('.statistic'),
      statisticResizeButton: document.querySelector('.resize-button_statistic'),
      chart: this.chart.elements,
      mapResizeButton: document.querySelector('.resize-button_map'),
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
      countryFilterInput: document.querySelector('.search__input'),
      countryFilterButton: document.querySelector('.search__button'),
    };
  }

  init() {
    this.addLoaderListeners();
    this.renderMap();
    this.renderChart();

    this.addFullScreenListeners();
    this.addSwitchListeners();
    this.addCountriesListListeners();
    this.addCountryFilterListeners();

    const handler = () => {
      this.renderStatistics();
      this.renderTable();
    };

    document.addEventListener(this.$app.config.events.loadAll, handler);

    document.addEventListener(this.$app.config.events.periodChanged, handler);
    document.addEventListener(this.$app.config.events.casesChanged, handler);
    document.addEventListener(this.$app.config.events.countryChanged, () => {
      this.renderStatistics();
    });

    document.addEventListener(this.$app.config.events.countryFilterChanged, () => {
      this.renderTable();
    });
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
    if (!this.$storage.states.isDataLoad.countries || !this.$storage.states.isDataLoad.world) return;

    this.elements.countryList.innerHTML = '';

    const {states} = this.$storage;
    const {periodModes} = this.$storage.statesCollection;
    const {casesModes} = this.$storage.statesCollection;
    const pattern = new RegExp(states.filterQuery, 'i');

    const tableModes = {
      [`${periodModes.allTime}-${casesModes.allCases}`]: (country) => country.total.cases,
      [`${periodModes.lastDay}-${casesModes.allCases}`]: (country) => country.lastDay.cases,
      [`${periodModes.allTime}-${casesModes.per100k}`]: (country) => country.perOneHundredThousandTotal.cases,
      [`${periodModes.lastDay}-${casesModes.per100k}`]: (country) => country.perOneHundredThousandLastDay.cases,
    };

    const countriesCollection = this.$storage.getAllCountries()
      .filter((country) => {
        if (!states.filterQuery) return true;

        return (pattern.test(country.iso) || pattern.test(country.name));
      })
      .map((country) => {
        return {
          name: country.name,
          flag: country.flagLink,
          iso: country.iso,
          value: tableModes[`${states.typePeriod}-${states.typeCases}`](country),
        };
      })
      .sort((a, b) => a.value < b.value ? 1 : -1);

    countriesCollection.forEach((country) => {
      const listItem = document.createElement('li');
      listItem.className = 'country__item';
      listItem.setAttribute('data-iso', country.iso);

      const countrySortValue = document.createElement('span');
      countrySortValue.className = 'country__cases';
      countrySortValue.innerText = country.value;

      const nameWrapper = document.createElement('div');
      nameWrapper.className = 'country__name'

      const countryFlag = document.createElement('img');
      countryFlag.className = 'country__name-flag';
      countryFlag.src = country.flag;

      const countryName = document.createElement('div');
      countryName.className = 'country__name-text';
      countryName.innerText = country.name;

      nameWrapper.append(countryFlag, countryName);
      listItem.append(countrySortValue, nameWrapper);

      this.elements.countryList.append(listItem);
    });
  }

  renderChart() {
    this.chart.init();
  }

  renderMap() {
    this.map.init();
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
        document.body.classList.toggle('fullscreen__statistics');
        this.elements.statisticResizeButton.classList.toggle('resize-button_minimize');
      }
      if (event.target === this.elements.chart.resizeButton) {
        document.body.classList.toggle('fullscreen__chart');
        this.elements.chart.resizeButton.classList.toggle('resize-button_minimize');
      }
      if (event.target === this.elements.countryResizeButton) {
        document.body.classList.toggle('fullscreen__country');
        this.elements.countryResizeButton.classList.toggle('resize-button_minimize');
      }
      if (event.target === this.elements.mapResizeButton) {
        document.body.classList.toggle('fullscreen__map');
        this.elements.mapResizeButton.classList.toggle('resize-button_minimize');
        window.dispatchEvent(new Event('resize'));
      }
    });
  }

  addSwitchListeners() {
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

  addCountryFilterListeners() {
    const handler = (e) => {
      setTimeout(() => {
        this.$storage.states.filterQuery = e.target.value;
      });
    };

    this.elements.countryFilterInput.addEventListener('keydown', handler);

    this.elements.countryFilterButton.addEventListener('click', () => {
      this.elements.countryFilterInput.value = '';
      this.elements.countryFilterInput.dispatchEvent(new Event('keydown'));
      this.$app.keyboard.keyboardHide();
    });
  }
}
