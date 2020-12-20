import Mixin from '../mixin';
import Countries from '../countries.json';

export default class Storage {
  constructor(app, client) {
    this.$app = app;
    this.$client = client;

    this.collection = {
      base: {},
      countries: [],
    };
    this.countryExample = {
      iso: '',
      name: '',
      slug: '',
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
      perOneHundredThousand: {
        cases: 0,
        recovered: 0,
        deaths: 0,
      }
    };
  }

  load() {
    this.loadCountriesInfo();
  }

  loadCountriesInfo() {
    const cb = (data) => {
      this.handleCountriesInfo(data.Countries);

      document.dispatchEvent(new Event(this.$app.config.events.loadCountries));
    }

    this.$client.getData(this.$app.config.url.covid.summary, {
      headers: {
        'X-Access-Token': this.$app.config.apiCovidToken,
      },
    }, cb);
  }

  calculateByOneThousand(count, population) {
    return +((+count / +population) * 10000).toFixed(2);
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

      countryExample.coords.latitude = parseFloat(localCountryData.coordinates.latitude);
      countryExample.coords.longitude = parseFloat(localCountryData.coordinates.longitude);

      countryExample.total.cases = country.TotalConfirmed;
      countryExample.total.recovered = country.TotalRecovered;
      countryExample.total.deaths = country.TotalDeaths;

      countryExample.lastDay.cases = country.NewConfirmed;
      countryExample.lastDay.recovered = country.NewRecovered;
      countryExample.lastDay.deaths = country.NewDeaths;

      countryExample.perOneHundredThousand.cases =
        this.calculateByOneThousand(country.TotalConfirmed, populationCount);
      countryExample.perOneHundredThousand.recovered =
        this.calculateByOneThousand(country.TotalRecovered, populationCount);
      countryExample.perOneHundredThousand.deaths =
        this.calculateByOneThousand(country.TotalDeaths, populationCount);

      this.collection.countries.push(countryExample);
    });
  }

  getAllCountries() {
    return this.collection.countries;
  }

  getCountryDataByCode(code) {
    const countryData = this.collection.countries.find((country) => country.iso === code);

    if (!countryData) throw new Error('Country not found');

    return Mixin.deepClone(countryData);
  }
}
