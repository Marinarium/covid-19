import Chart from 'chart.js';
import map from '../open-street-map';

export default class View {
  constructor(app, storage) {
    this.$app = app;
    this.$storage = storage;
    this.elements = {
      mainContent: document.querySelector('.main'),
      statisticBlock: document.querySelector('.statistic'),
      statisticResizeButton: document.querySelector('.resize-button_statistic'),
      chartBlock: document.querySelector('.chart'),
      chartResizeButton: document.querySelector('.resize-button_chart'),
      chartGraph: document.querySelector('.chart__box'),
      chartLoaderProgress: document.querySelector('.chart__loader-progress'),
      countryBlock: document.querySelector('.country'),
      countryResizeButton: document.querySelector('.resize-button_country'),
    };
    this.chart = null;
    console.log(this);
  }

  init() {
    this.loaderShow();

    this.renderStatistics();
    this.renderTable();
    this.renderMap();
    this.renderChart();
    this.addListenersOnFullScreen();

    document.addEventListener(this.$app.config.events.loadCountries, () => {
      this.loaderHide.bind(this);
      console.log(this.$storage.getAllCountries());
    });
  }

  renderStatistics() {
  }

  renderTable() {
  }

  renderChart() {
    this.elements.chartBlock.classList.add('loading');
    document.addEventListener(this.$app.config.events.countryDataLoaded, (e) => {
      this.elements.chartLoaderProgress.innerHTML = `Left: ${e.detail.left.toString().bold()} countries`;

      if (!e.detail.left) this.elements.chartBlock.classList.remove('loading');
    });

    const date = new Date();
    date.setMonth(11);
    date.setYear(2019);

    const minStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

    const arr = [...Array(350)].map(() => {
      date.setDate(date.getDate() + 1);

      const dateString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
      const randomInt = Math.floor(150 * Math.random() + 50)

      return {
        x: dateString,
        y: randomInt,
      };
    });

    const maxStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

    this.chart = new Chart(this.elements.chartGraph, {
      type: 'bar',
      data: {
        datasets: [{
          label: 'Cases per day',
          backgroundColor: 'gray',
          data: arr,
          barThickness: 'flex',
          minBarLength: 2,
          barPercentage: 1,
          categoryPercentage: 1,
          hoverBackgroundColor: 'white',
        }],
      },
      options: {
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              unit: 'day',
              ticks: {},
              min: minStr,
              max: maxStr,
            },
            offset: true,
            ticks: {
              display: false,
            },
            gridLines: {
              display: false,
              tickMarkLength: 0,
            },
          }],
          yAxes: [{
            offset: true,
            ticks: {
              beginAtZero: true,
            },
            gridLines: {
              drawTicks: false,
              color: 'gray',
              tickMarkLength: 0,
            },
          }],
        },
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            boxWidth: 0,
          },
        },
        tooltips: {
          custom(model) {
            if (!model.dataPoints) return;

            model.displayColors = false;
            model.title.length = 0;
            model.body[0].lines.length = 0;
            model.body[0].lines.push(`${model.dataPoints[0].label}: ${model.dataPoints[0].value}`);
            model.height = 22;
            model._bodyFontStyle = 'bold';
            model.backgroundColor = '#ff8906';
          },
        },
      },
    });
  }

  renderMap() {
    map.addMap();
  }

  loaderShow() {
  }

  loaderHide() {
  }

  addListenersOnFullScreen() {
    this.elements.mainContent.addEventListener('click', (event) => {
      if (event.target === this.elements.statisticResizeButton) {
        this.elements.statisticBlock.classList.toggle('statistic_full');
        this.elements.statisticResizeButton.classList.toggle('resize-button_minimize');
      }
      if (event.target === this.elements.chartResizeButton) {
        this.elements.chartBlock.classList.toggle('chart_full');
        this.elements.chartResizeButton.classList.toggle('resize-button_minimize');
      }
      if (event.target === this.elements.countryResizeButton) {
        this.elements.countryBlock.classList.toggle('country_full');
        this.elements.countryResizeButton.classList.toggle('resize-button_minimize');
      }
    });
  }
}
