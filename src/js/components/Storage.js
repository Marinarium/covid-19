import Mixin from '../mixin';
import Countries from '../countries.json';

export default class Storage {
  constructor(app, client) {
    this.$app = app;
    this.$client = client;

    this.collection = {
      dateUpdate: null,
      world: {
        total: {
          cases: 0,
          recovered: 0,
          deaths: 0,
        },
        lastDay: {
          cases: 0,
          recovered: 0,
          deaths: 0,
        },
      },
      countries: [],
    };
    this.countryExample = {
      iso: '',
      name: '',
      slug: '',
      flagLink: '',
      population: 0,
      coords: {
        latitude: 0,
        longitude: 0,
      },
      total: {
        cases: 0,
        recovered: 0,
        deaths: 0,
      },
      lastDay: {
        cases: 0,
        recovered: 0,
        deaths: 0,
      },
      perOneHundredThousandTotal: {
        cases: 0,
        recovered: 0,
        deaths: 0,
      },
      perOneHundredThousandLastDay: {
        cases: 0,
        recovered: 0,
        deaths: 0,
      },
    };
  }

  load() {
    try {
      this.loadData();
    } catch (e) {
      alert('Error loading data, please, reload page');
    }
  }

  loadData() {
    const cb = (data) => {
      this.collection.dateUpdate = new Date(data.Date);

      this.handleBaseInfo(data.Global);
      this.handleCountriesInfo(data.Countries);

      document.dispatchEvent(new Event(this.$app.config.events.loadAll));
    }

    this.$client.getData(this.$app.config.url.covid.summary, {
      headers: {
        'X-Access-Token': this.$app.config.apiCovidToken,
      },
    }, cb);
  }

  calculateByOneThousand(count, population) {
    if (!population) return (0).toFixed(2);

    return +((+count / +population) * 10000).toFixed(2);
  }

  handleBaseInfo(global) {
    this.collection.world.total.cases = global.TotalConfirmed;
    this.collection.world.total.recovered = global.TotalRecovered;
    this.collection.world.total.deaths = global.TotalDeaths;

    this.collection.world.lastDay.cases = global.NewConfirmed;
    this.collection.world.lastDay.recovered = global.NewRecovered;
    this.collection.world.lastDay.deaths = global.NewDeaths;

    document.dispatchEvent(new Event(this.$app.config.events.loadWorld));
  }

  handleCountriesInfo(collection) {
    this.collection.countries.length = 0;

    collection.forEach((country) => {
      const countryExample = Mixin.deepClone(this.countryExample);
      const localCountryData = Countries.find((item) => item.iso2 === country.CountryCode);
      const populationCount = country.Premium.CountryStats.Population;

      countryExample.iso = localCountryData.iso2;
      countryExample.name = localCountryData.country;
      countryExample.slug = localCountryData.slug;
      countryExample.population = populationCount;
      countryExample.flagLink = this.$app.config.url.flag.replace('<ISO>', localCountryData.iso2);

      countryExample.coords.latitude = parseFloat(localCountryData.coordinates.latitude);
      countryExample.coords.longitude = parseFloat(localCountryData.coordinates.longitude);

      countryExample.total.cases = country.TotalConfirmed;
      countryExample.total.recovered = country.TotalRecovered;
      countryExample.total.deaths = country.TotalDeaths;

      countryExample.lastDay.cases = country.NewConfirmed;
      countryExample.lastDay.recovered = country.NewRecovered;
      countryExample.lastDay.deaths = country.NewDeaths;

      countryExample.perOneHundredThousandTotal.cases =
        this.calculateByOneThousand(country.TotalConfirmed, populationCount);
      countryExample.perOneHundredThousandTotal.recovered =
        this.calculateByOneThousand(country.TotalRecovered, populationCount);
      countryExample.perOneHundredThousandTotal.deaths =
        this.calculateByOneThousand(country.TotalDeaths, populationCount);

      countryExample.perOneHundredThousandLastDay.cases =
        this.calculateByOneThousand(country.NewConfirmed, populationCount);
      countryExample.perOneHundredThousandLastDay.recovered =
        this.calculateByOneThousand(country.NewRecovered, populationCount);
      countryExample.perOneHundredThousandLastDay.deaths =
        this.calculateByOneThousand(country.NewDeaths, populationCount);

      this.collection.countries.push(countryExample);
    });

    document.dispatchEvent(new Event(this.$app.config.events.loadCountries));
  }

  getAllCountries() {
    return this.collection.countries;
  }

  getCountryDataByCode(code) {
    const countryData = this.collection.countries.find((country) => country.iso === code);

    if (!countryData) throw new Error('Country not found');

    return countryData;
  }

  getWorldData() {
    return this.collection.world;
  }

  getCountryIntensityByCallback(code, cb) {
    const out = {
      current: 0,
      max: 0,
      percent: 0,
    };

    this.collection.countries.forEach((country) => {
      const value = cb(country);

      if (value > out.max) out.max = value;
      if (country.iso === code) out.current = value;
    });

    out.percent = Mixin.calcPercent(out.current, out.max);

    return out;
  }

  searchCountries(query) {
    const reg = new RegExp(query, 'i');

    return this.collection.countries.filter((country) => (reg.test(country.name) || reg.test(country.iso)));
  }
}
