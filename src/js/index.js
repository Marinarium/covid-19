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
        flag: 'https://www.countryflags.io/<ISO>/flat/64.png',
      },
      apiCovidToken: '5cf9dfd5-3449-485e-b5ae-70a60e997864',
      events: {
        loadAll: 'load-all',
        loadWorld: 'load-world',
        loadCountries: 'load-countries',
        loadMap: 'load-map',
        selectCountry: 'select-country',
      },
    });

    this.client = new HttpClient(this);
    this.storage = new Storage(this, this.client);
    this.view = new View(this, this.storage);
  }

  init() {
    this.view.init();
    this.storage.load();
  }
}

const app = new App();

app.init();

