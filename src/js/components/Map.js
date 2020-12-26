import Polygons from '../polygons.json';
import Mixin from '../mixin';

export default class Map {
  constructor(app) {
    this.$app = app;
    this.$storage = this.$app.storage;

    this.layout = null;
    this.map = null;
    this.polygonsCollection = [];
    this.polygonExample = {
      iso: '',
      polygonObj: {},
      polygonCoords: {},
    };
  }

  init() {
    this.mapInit();

    this.setMapListeners();
  }

  mapInit() {
    this.layout = window.L;
    this.map = this.layout.map('map').setView([52, 25], 3);

    this.layout
      .mapboxGL({
        accessToken: 'not-needed',
        style: 'https://api.maptiler.com/maps/1e257f70-99a4-4d27-bef3-620500ae11e6/style.json?key=uji77qyPm7V3FmJfV7Xk'
      })
      .addTo(this.map);
  }

  setMapListeners() {
    document.addEventListener(this.$app.config.events.loadAll, () => {
      this.createPolygons();
      this.renderPolygons();
    });

    document.addEventListener(this.$app.config.events.periodChanged, this.renderPolygons.bind(this));
    document.addEventListener(this.$app.config.events.casesChanged, this.renderPolygons.bind(this));
  }

  createPolygons() {
    this.$storage.collection.countries.forEach((country) => {
      const example = Mixin.deepClone(this.polygonExample);
      const polygonInfo = Polygons.find((item) => item.iso === country.iso);

      example.iso = country.iso;
      example.polygonCoords = polygonInfo.polygon;
      example.polygonObj = (Object.keys(example.polygonCoords).length)
        ? this.layout.geoJSON(example.polygonCoords).addTo(this.map)
        : null;

      if (example.polygonObj) {
        example.polygonObj.addEventListener('click', () => {
          this.$storage.states.selectedCountry = example.iso;
        });

        example.polygonObj.bindTooltip(country.name, {
          direction: 'top',
          sticky: true,
        });
      }

      this.polygonsCollection.push(example);
    });
  }

  renderPolygons() {
    const {states} = this.$storage;
    const {periodModes} = this.$storage.statesCollection;
    const {casesModes} = this.$storage.statesCollection;
    const tableModes = {
      [`${periodModes.allTime}-${casesModes.allCases}`]: (country) => country.total.cases,
      [`${periodModes.lastDay}-${casesModes.allCases}`]: (country) => country.lastDay.cases,
      [`${periodModes.allTime}-${casesModes.per100k}`]: (country) => country.perOneHundredThousandTotal.cases,
      [`${periodModes.lastDay}-${casesModes.per100k}`]: (country) => country.perOneHundredThousandLastDay.cases,
    };
    const currentMode = `${states.typePeriod}-${states.typeCases}`;

    this.$storage.getAllCountries()
      .map((country) => {
        return {
          iso: country.iso,
          name: country.name,
          value: tableModes[currentMode](country),
          intensity: this.$storage.getCountryIntensityByCallback(country.iso, tableModes[currentMode]),
        };
      })
      .forEach((country) => {
        const countryPolygon = this.polygonsCollection.find((item) => item.iso === country.iso);
        let color;

        if (country.intensity.percent < 25) {
          color = this.$app.config.mapIntensityColors.good;
        } else if (country.intensity.percent < 50) {
          color = this.$app.config.mapIntensityColors.average;
        } else if (country.intensity.percent < 75) {
          color = this.$app.config.mapIntensityColors.medium;
        } else {
          color = this.$app.config.mapIntensityColors.high;
        }

        if (countryPolygon.polygonObj) {
          countryPolygon.polygonObj.setStyle({color});

          countryPolygon.polygonObj.bindTooltip(`${country.name}: ${country.value}`);
        }
      });
  }
}