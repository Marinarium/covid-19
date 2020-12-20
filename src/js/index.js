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
        },
      },
      apiCovidToken: '5cf9dfd5-3449-485e-b5ae-70a60e997864',
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
