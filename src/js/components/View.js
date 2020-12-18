import {addMap} from '../open-street-map.js';
/*import {showMenu} from './showMenu';
import {changeDeckOfCards} from './changeDeckOfCards.js';
showMenu();
changeDeckOfCards();*/

export default class View {
  constructor(app) {
    this.$app = app;
  }

  init() {
    this.loaderShow();

    this.renderStatistics();
    this.renderTable();
    this.renderMap();

    document.addEventListener(this.$app.config.events.loadCountries, this.loaderHide.bind(this));
  }

  renderStatistics() {
  }

  renderTable() {
  }

  renderMap() {
    addMap();
  }

  loaderShow() {
  }

  loaderHide() {
  }
}
