import {addMap} from '../open-street-map.js';
/*import {showMenu} from './showMenu';
import {changeDeckOfCards} from './changeDeckOfCards.js';
showMenu();
changeDeckOfCards();*/

//require '../showBlockOnFullscreen.js'
//import libs from '../showBlockOnFullscreen';

export default class View {
  constructor(app) {
    this.$app = app;
    this.elements = {
      statistics: document.querySelector('.statistic'),
      statisticsButton: document.querySelector('.show-fullscreen_statistic'),
    };
    console.log(this);
  }

  init() {
    this.loaderShow();

    this.renderStatistics();
    this.renderTable();
    this.renderMap();
    this.addListenersOnFullScreen();

    document.addEventListener(this.$app.config.events.loadCountries, () => {
      this.loaderHide.bind(this);
    });
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

  addListenersOnFullScreen() {
    this.elements.statisticsButton.addEventListener('click', () => console.log('click'));
  }
}
