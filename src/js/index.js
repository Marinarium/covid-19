import '../css/style.css';
import '../css/style.scss';
import HttpClient from './components/HttpClient';
import Storage from './components/Storage';
import View from './components/View';
import Mixin from './mixin';

class App {
  constructor() {
    this.config = Mixin.deepFreeze({
      url: {
        covid: {
          summary: 'https://api.covid19api.com/summary',
          countryDayOne: 'https://api.covid19api.com/dayone/country',
        },
        flag: 'https://www.countryflags.io/<ISO>/flat/64.png',
      },
      apiCovidToken: '5cf9dfd5-3449-485e-b5ae-70a60e997864',
      events: {
        loadWorld: 'load-world',
        loadCountries: 'load-countries',
        loadDaily: 'load-daily',
        loadMap: 'load-map',
        countryDataLoaded: 'country-data-loaded',
        worldDailyCalculated: 'world-daily-calculated',
        selectCountry: 'select-country',
      },
      timeouts: {
        dailyLoad: 550,
      },
    });

    this.client = new HttpClient(this);
    this.storage = new Storage(this, this.client);
    this.view = new View(this, this.storage);
  }

  init() {
    if (window.location.hostname !== 'localhost') alert('По возможности проверьте в последний день дедлайна :)');

    document.addEventListener(this.config.events.loadWorld, () => console.log('loadWorld'));
    document.addEventListener(this.config.events.loadCountries, () => console.log('loadCountries'));
    document.addEventListener(this.config.events.loadDaily, () => console.log('loadDaily'));
    document.addEventListener(this.config.events.worldDailyCalculated, () => console.log('worldDailyCalculated'));

    this.view.init();
    this.storage.load();
  }
}

const app = new App();

app.init();

