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
          base: 'https://covid19.mathdro.id/api',
          confirmed: 'https://covid19.mathdro.id/api/confirmed',
          recovered: 'https://covid19.mathdro.id/api/recovered',
          deaths: 'https://covid19.mathdro.id/api/deaths',
          countries: 'https://covid19.mathdro.id/api/countries',
        },
        countries: {
          population: 'https://countriesnow.space/api/v0.1/countries/population',
        },
      },
      events: {
        loadAll: 'load-all',
        loadCountries: 'load-countries',
        loadCovid: 'load-covid',
        loadMap: 'load-map',
      },
    });

    this.client = new HttpClient(this);
    this.storage = new Storage(this, this.client);
    this.view = new View(this);
  }

  init() {
    this.view.init();
    this.storage.load();
  }
}

const app = new App();

app.init();
