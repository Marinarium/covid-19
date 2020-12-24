import Mixin from '../mixin';
import Countries from '../countries.json';

export default class Storage {
  constructor(app, client) {
    this.$app = app;
    this.$client = client;


    this.states = {
      selectedCountry: 'world',
      graphMode: ''
    };
    this.statesCollection = Mixin.deepFreeze({
      graphModes: {
        total: ''
      }
    });

    this.collection = {
      dateUpdate: null,
      world: {
        population: 0,
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
        perOneHundredThousandWorldTotal: {
          cases: 0,
          recovered: 0,
          deaths: 0,
        },
        perOneHundredThousandWorldLastDay: {
          cases: 0,
          recovered: 0,
          deaths: 0,
        },
        daily: [],
      },
      countries: [],
    };
    this.countryExample = {
      iso: '',
      name: '',
      slug: '',
      flagLink: '',
      population: 0,
      daily: [],
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
    this.dailyExample = {
      date: '',
      cases: 0,
      deaths: 0,
      recovered: 0,
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

      this.handleWorldInfo(data.Global);
      this.handleCountriesInfo(data.Countries);

      this.loadCountriesDailyInfo();
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

  handleWorldInfo(global) {
    this.collection.world.total.cases = global.TotalConfirmed;
    this.collection.world.total.recovered = global.TotalRecovered;
    this.collection.world.total.deaths = global.TotalDeaths;

    this.collection.world.lastDay.cases = global.NewConfirmed;
    this.collection.world.lastDay.recovered = global.NewRecovered;
    this.collection.world.lastDay.deaths = global.NewDeaths;

    this.collection.world.perOneHundredThousandWorldTotal.cases =  this.calculateByOneThousand(global.TotalConfirmed, 7594000000);
    this.collection.world.perOneHundredThousandWorldTotal.recovered =  this.calculateByOneThousand(global.TotalRecovered, 7594000000);
    this.collection.world.perOneHundredThousandWorldTotal.deaths =  this.calculateByOneThousand(global.TotalDeaths, 7594000000);

    this.collection.world.perOneHundredThousandWorldLastDay.cases =  this.calculateByOneThousand(global.NewConfirmed, 7594000000);
    this.collection.world.perOneHundredThousandWorldLastDay.recovered =  this.calculateByOneThousand(global.NewRecovered, 7594000000);
    this.collection.world.perOneHundredThousandWorldLastDay.deaths =  this.calculateByOneThousand(global.NewDeaths, 7594000000);
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

  loadCountriesDailyInfo() {
    const loadingInfo = {
      queue: [],
      countBad: 0,
    };
    let timeout = this.$app.config.timeouts.dailyLoad;
    let count = 0;

    this.collection.countries.forEach((country) => {
      timeout += this.$app.config.timeouts.dailyLoad;
      loadingInfo.queue.push(country.slug);

      count += 1;
      if (count > 15) return;

      setTimeout(this.getCountryDailyData.bind(this, country, loadingInfo), timeout);
    });

    document.addEventListener(this.$app.config.events.loadDaily, this.calculateWordDaily.bind(this));
  }

  getCountryDailyData(country, loadingInfo, isBad = false) {
    const {slug} = country;
    const cbError = () => {
      if (!isBad) loadingInfo.countBad += 1;
      const calcTimeout = this.calcRepeatTimeout(loadingInfo.countBad);

      setTimeout(this.getCountryDailyData.bind(this, country, loadingInfo, true), calcTimeout);
    };
    const cb = (data) => {
      if (data.success === false) {
        cbError(country, loadingInfo, isBad);

        return;
      }

      if (isBad) loadingInfo.countBad -= 1;

      const {queue} = loadingInfo;
      queue.splice(queue.indexOf(slug), 1);

      this.writeCountryDailyData(country.iso, data);
      document.dispatchEvent(new CustomEvent(this.$app.config.events.countryDataLoaded, {detail: {left: loadingInfo.queue.length}}));

      if (!queue.length) {
        document.dispatchEvent(new Event(this.$app.config.events.loadDaily));
      }
    };

    this.$client.getData(`${this.$app.config.url.covid.countryDayOne}/${slug}`, {}, cb)
      .catch(cbError.bind(this, country, loadingInfo, isBad));
  }

  writeCountryDailyData(iso, countryApiData) {
    const countryData = this.collection.countries.find((item) => item.iso === iso);

    if (!countryData) throw new Error('Country not found');

    const countryDailyCollection = countryData.daily;
    this.fillByEmptyDateCollection(countryDailyCollection);

    countryApiData.forEach((dayData) => {
      const countryDateInfo = countryDailyCollection.find((item) => item.date === dayData.Date);

      if (!countryDateInfo) throw new Error('Date not found');

      countryDateInfo.cases += dayData.Confirmed;
      countryDateInfo.deaths += dayData.Deaths;
      countryDateInfo.recovered += dayData.Recovered;
    });
  }

  calculateWordDaily() {
    this.fillByEmptyDateCollection(this.collection.world.daily);

    this.collection.countries.forEach((country) => {
      this.collection.world.population += country.population;

      country.daily.forEach((countryDailyData) => {
        const {date} = countryDailyData;
        const worldDailyData = this.collection.world.daily.find((item) => item.date === date);

        if (!worldDailyData) throw new Error('Date not found');

        worldDailyData.cases += countryDailyData.Confirmed;
        worldDailyData.deaths += countryDailyData.Deaths;
        worldDailyData.recovered += countryDailyData.Recovered;
      })
    });

    document.dispatchEvent(new Event(this.$app.config.events.worldDailyCalculated));
  }

  fillByEmptyDateCollection(arrayToFill) {
    arrayToFill.length = 0;
    const datesCollection = Mixin.getCurrentYearDatesArray();

    datesCollection.forEach((date) => {
      const example = {...this.dailyExample};
      example.date = date;

      arrayToFill.push(example);
    });
  }

  calcRepeatTimeout(currentErrorsCount) {
    return currentErrorsCount * this.$app.config.timeouts.dailyLoad;
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
