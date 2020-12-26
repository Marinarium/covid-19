import Chart from 'chart.js';
import Mixin from '../mixin';

export default class Charts {
  constructor(app) {
    this.$app = app;
    this.$storage = app.storage;

    this.chart = null;
    this.elements = {
      block: document.querySelector('.chart'),
      resizeButton: document.querySelector('.resize-button_chart'),
      canvas: document.querySelector('.chart__body-box'),
      modeText: document.querySelector('.chart__body-mode-current'),
      modePrev: document.querySelector('.chart__body-mode-nav-prev'),
      modeNext: document.querySelector('.chart__body-mode-nav-next'),
    }
  }

  init() {
    this.elements.block.classList.add('loading');
    document.addEventListener(this.$app.config.events.loadAll, () => {
      this.elements.block.classList.remove('loading');
      this.$app.storage.states.graphMode = 'Total Cases';
    });

    this.setModeListeners();

    const dataset = this.getFakeDataset();
    this.chart = this.getNewChart(this.elements.canvas, dataset.min, dataset.max);

    this.setNewChartDataset(dataset.collection, 'Total Cases');
  }

  getNewChart(canvas, xMin, xMax) {
    return new Chart(canvas, {
      type: 'bar',
      data: {
        datasets: [],
      },
      options: {
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              unit: 'day',
              ticks: {},
              min: xMin,
              max: xMax,
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
              maxTicksLimit: 5,
              callback(value) {
                if (value > 1e6) return `${value / 1e6} M`;
                if (value > 1e3) return `${value / 1e3} k`;

                return value;
              },
              padding: 10
            },
            gridLines: {
              drawTicks: false,
              color: 'gray',
              tickMarkLength: 0,
            },
          }],
        },
        legend: {
          display: false,
          position: 'bottom',
          labels: {
            boxWidth: 0,
          },
        },
        tooltips: {
          custom(model) {
            if (!model.dataPoints) return;

            model.displayColors = false;
            model.body[0].lines.length = 0;
            model.body[0].lines.push(`${model.dataPoints[0].value}`);
            model.height = 40;
            model.backgroundColor = '#ff8906';
          },
        },
      },
    });
  }

  getCurrentModeDataset(cb) {
    const currentCountry = this.$storage.states.selectedCountry;
    const calculateDailyCollection = (collection) => collection.reduce((out, item) => {
      out.push({
        x: Mixin.parseDateISO(item.date),
        y: item.value,
      });

      return out;
    }, []);

    if (currentCountry === 'world') {
      const worldData = this.$storage.getWorld();
      const dailyCollection = this.$storage.getDailyCollectionByCallback(worldData.daily, cb);

      return calculateDailyCollection(dailyCollection);
    }

    if (currentCountry !== 'world') {
      const countryData = this.$storage.getCountryDataByCode(currentCountry);
      const dailyCollection = this.$storage.getDailyCollectionByCallback(countryData.daily, cb);

      return calculateDailyCollection(dailyCollection);
    }

    return [];
  }

  getFakeDataset() {
    const datesCollection = Mixin.getCurrentYearDatesArray();
    const parseStringForChart = (dateString) => dateString.split('T').shift();

    return {
      min: parseStringForChart(datesCollection[0]),
      max: parseStringForChart(datesCollection[datesCollection.length - 1]),
      collection: datesCollection.reduce((out, str) => {
        out.push({
          x: parseStringForChart(str),
          y: Math.floor(5000 * Math.random() + 500000),
        });

        return out;
      }, []),
    };
  }

  changeGraphMode(graphMode) {
    const dataset = this.getCurrentModeDataset(graphMode.cb);

    this.setNewChartDataset(dataset, graphMode.name);
    this.elements.modeText.innerText = graphMode.name;
  }

  setNewChartDataset(dataset, label) {
    const datasetExample = {
      backgroundColor: '#fff',
      hoverBackgroundColor: '#ff8906',
      barThickness: 'flex',
      categoryPercentage: 1,
      barPercentage: 1,
      data: dataset,
      label,
    };

    this.removeCurrentDataset();
    this.chart.data.datasets.push(datasetExample);
    this.chart.update();
  }

  removeCurrentDataset() {
    this.chart.data.datasets.length = 0;
  }

  setModeListeners() {
    document.addEventListener(this.$app.config.events.graphModeChange, (e) => {
      this.changeGraphMode(e.detail);
    });

    this.elements.modeNext.addEventListener('click', () => {
      const currentModeName = this.$storage.states.graphMode;
      const currentModeIndex = this.$storage.statesCollection.graphModes.findIndex((item) => item.name === currentModeName);
      const newCurrentModeIndex = (currentModeIndex === (this.$storage.statesCollection.graphModes.length - 1))
        ? 0
        : currentModeIndex + 1;

      this.$storage.states.graphMode = this.$storage.statesCollection.graphModes[newCurrentModeIndex].name;
    });

    this.elements.modePrev.addEventListener('click', () => {
      const currentModeName = this.$storage.states.graphMode;
      const currentModeIndex = this.$storage.statesCollection.graphModes.findIndex((item) => item.name === currentModeName);
      const newCurrentModeIndex = (currentModeIndex === 0)
        ? this.$storage.statesCollection.graphModes.length - 1
        : currentModeIndex - 1;

      this.$storage.states.graphMode = this.$storage.statesCollection.graphModes[newCurrentModeIndex].name;
    });
  }
}