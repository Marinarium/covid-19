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
          summary: 'https://disease.sh/v3/covid-19/historical/all?lastdays=all',
          historical: 'https://disease.sh/v3/covid-19/historical/<PATH>?lastdays=all',
        },
        countries: 'https://restcountries.eu/rest/v2/all?fields=name;flag;population;alpha2Code;latlng',
      },
      events: {
        loadAll: 'load-all',
        loadCountries: 'load-countries',
        loadDaily: 'load-daily',
        loadMap: 'load-map',
        countryDataLoaded: 'country-data-loaded',
        worldDailyCalculated: 'world-daily-calculated',
        selectCountry: 'select-country',
      },
    });

    this.client = new HttpClient(this);
    this.storage = new Storage(this, this.client);
    this.view = new View(this, this.storage);
  }

  init() {
    if (window.location.hostname !== 'localhost') alert('По возможности проверьте в последний день дедлайна :)');

    document.addEventListener(this.config.events.loadAll, () => console.log('loadWorld', this));
    document.addEventListener(this.config.events.loadCountries, () => console.log('loadCountries'));

    this.view.init();
    this.storage.load();
  }
}

const app = new App();

app.init();

