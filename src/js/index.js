import '../css/style.css';
import '../css/style.scss';
import HttpClient from './components/HttpClient';
import Storage from './components/Storage';
import View from './components/View';
import Keyboard from './components/Keyboard';
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
        geoJson: 'https://nominatim.openstreetmap.org/search.php?country=<ISO>&polygon_geojson=1&limit=1&polygon_threshold=0.01&format=geojson',
      },
      events: {
        loadAll: 'load-all',
        loadCountries: 'load-countries',
        loadDaily: 'load-daily',
        loadMap: 'load-map',
        loadProgress: 'country-data-loaded',
        worldDailyCalculated: 'world-daily-calculated',
        countryChanged: 'country-changed',
        periodChanged: 'period-changed',
        casesChanged: 'cases-changed',
        graphModeChange: 'graph-mode-change',
        countryFilterChanged: 'country-filter-changed',
      },
      timeouts: {
        loaderHide: 1500,
      },
      mapIntensityColors: {
        good: '#2dd720',
        average: '#18e3bb',
        medium: '#f1e616',
        high: '#fa3e3e',
      },
    });

    this.client = new HttpClient(this);
    this.storage = new Storage(this, this.client);
    this.view = new View(this, this.storage);
    this.keyboard = new Keyboard(document.querySelector('.search__input'));
  }

  init() {
    this.view.init();
    this.storage.load();
  }
}

const app = new App();

app.init();

