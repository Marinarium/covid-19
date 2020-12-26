import Mixin from '../mixin';
import Countries from '../countries.json';

export default class Storage {
  constructor(app, client) {
    this.$app = app;
    this.$client = client;

    this.statesCollection = Mixin.deepFreeze({
      graphModes: [
        {
          name: 'Total Cases',
          cb: (country) => country.total.cases,
        },
        {
          name: 'Total Deaths',
          cb: (country) => country.total.deaths,
        },
        {
          name: 'Total Recovered',
          cb: (country) => country.total.recovered,
        },
        {
          name: 'Total Cases per 100k',
          cb: (country) => country.perOneHundredThousandTotal.cases,
        },
        {
          name: 'Total Deaths per 100k',
          cb: (country) => country.perOneHundredThousandTotal.deaths,
        },
        {
          name: 'Total Recovered per 100k',
          cb: (country) => country.perOneHundredThousandTotal.recovered,
        },
      ],
      periodModes: {
        allTime: 'all-time',
        lastDay: 'last-day',
      },
      casesModes: {
        allCases: 'all-cases',
        per100k: 'per-100k',
      },
    });
    this.states = this.getStateProxy({
      isDataLoad: {
        countries: false,
        world: false,
      },
      filterQuery: '',
      selectedCountry: 'world',
      typePeriod: this.statesCollection.periodModes.allTime,
      typeCases: this.statesCollection.casesModes.allCases,
      graphMode: 'Total Cases',
    });

    this.collection = {
      dateUpdate: null,
      world: {
        population: 0,
        daily: [],
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
      },
      countries: [],
    };
    this.countryExample = {
      iso: '',
      name: '',
      nameInApi: '',
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
      total: {
        cases: 0,
        deaths: 0,
        recovered: 0,
      },
      perOneHundredThousandTotal: {
        cases: 0,
        deaths: 0,
        recovered: 0,
      },
    };

    this.setDataLoadListeners();
  }

  load() {
    try {
      this.$client.getData(this.$app.config.url.countries, {}, this.getWorldInfo.bind(this));
    } catch (e) {
      alert('Error loading data, please, reload page');
    }
  }

  getStateProxy(obj) {
    const self = this;

    return new Proxy(obj, {
      set(object, property, value) {
        object[property] = value;

        const triggerGraphRender = () => {
          const graphMode = self.statesCollection.graphModes.find((item) => item.name === object.graphMode);

          setTimeout(() => {
            document.dispatchEvent(new CustomEvent(self.$app.config.events.graphModeChange, {detail: graphMode}));
          });
        }

        if (property === 'graphMode') {
          triggerGraphRender();
        }

        if (property === 'selectedCountry') {
          triggerGraphRender();

          document.dispatchEvent(new Event(self.$app.config.events.countryChanged));
        }

        if (property === 'typePeriod') {
          document.dispatchEvent(new Event(self.$app.config.events.periodChanged));
        }

        if (property === 'typeCases') {
          document.dispatchEvent(new Event(self.$app.config.events.casesChanged));
        }

        if (property === 'filterQuery') {
          document.dispatchEvent(new Event(self.$app.config.events.countryFilterChanged));
        }

        return true;
      }
    })
  }

  calculateByOneThousand(count, population) {
    if (!population) return (0).toFixed(2);

    return +((+count / +population) * 10000).toFixed(2);
  }

  getWorldInfo(countriesInfo) {
    this.collection.dateUpdate = Mixin.getYesterday();
    this.collection.countries.length = 0;

    const countriesIso = countriesInfo.reduce((out, country) => {
      out.push(country.alpha2Code);

      return out;
    }, []).join(',');

    countriesInfo.forEach((country) => {
      this.collection.countries.push(this.getCountryBaseInfo(country));
    });

    this.getCountriesInfoAllTime(countriesIso);
  }

  getCountryBaseInfo(info) {
    const countryExample = Mixin.deepClone(this.countryExample);
    const datesCollection = Mixin.getCurrentYearDatesArray();

    countryExample.iso = info.alpha2Code;
    countryExample.name = info.name;
    countryExample.population = info.population;
    countryExample.flagLink = info.flag;

    [countryExample.coords.latitude, countryExample.coords.longitude] = info.latlng;

    datesCollection.forEach((date) => {
      countryExample.daily.push(this.getCountryDailyData(date));
    });

    return countryExample;
  }

  getCountryDailyData(date) {
    const dailyExample = Mixin.deepClone(this.dailyExample);

    dailyExample.date = date;

    return dailyExample;
  }

  handleCountriesInfo(collection) {
    this.collection.countries.length = 0;

    collection.forEach((country) => {
      const countryExample = Mixin.deepClone(this.countryExample);
      const localCountryData = Countries.find((item) => item.iso2 === country.CountryCode);
      const populationCount = country.Premium.CountryStats.Population;

      countryExample.iso = localCountryData.iso2;
      countryExample.name = localCountryData.country;
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

  getCountriesInfoAllTime(countriesIso) {
    const cb = (data) => {
      const loadingInfo = {
        overall: data.length,
        current: 0,
      };

      const nextStep = () => {
        loadingInfo.current += 1;

        if (loadingInfo.current > loadingInfo.overall) return;

        document.dispatchEvent(new CustomEvent(this.$app.config.events.loadProgress, {detail: loadingInfo}));

        setTimeout(() => {
          this.writeCountryDailyData(data[loadingInfo.current], loadingInfo.current, nextStep);
        });
      };

      this.writeCountryDailyData(data[loadingInfo.current], loadingInfo.current, nextStep);

      document.addEventListener(this.$app.config.events.loadProgress, (e) => {
        if (e.detail.current === e.detail.overall) {
          document.dispatchEvent(new Event(this.$app.config.events.loadCountries));
          this.getWorldDaily();
        }
      })
    }

    this.$client.getData(this.$app.config.url.covid.historical.replace('<PATH>', countriesIso), {}, cb);
  }

  writeCountryDailyData(info, index, cb) {
    if (!info) {
      cb();

      return;
    }

    this.collection.countries[index].nameInApi = info.country;
    const countryData = this.collection.countries.find((item) => item.nameInApi === info.country);
    let previousIndex = 0;

    if (!countryData) return;

    const reformatCollection = {};
    countryData.daily.forEach((item) => {
      reformatCollection[item.date] = {
        cases: 0,
        deaths: 0,
        recovered: 0,
      };
    });

    Object.keys(info.timeline).forEach((key) => {
      Object.keys(info.timeline[key]).forEach((date) => {
        reformatCollection[Mixin.parseDateFromAPI(date)][key] = info.timeline[key][date];
      });
    });

    Object.keys(reformatCollection).forEach((date) => {
      const countryDailyIndex = countryData.daily.findIndex((item) => item.date === date);
      const countryDaily = countryData.daily[countryDailyIndex];
      const countryDailyPreviousIndex = countryDailyIndex - 1;
      const countryDailyPrevious = countryData.daily[countryDailyPreviousIndex] || countryDaily;
      const apiData = reformatCollection[date];

      const totalMaxCases = Math.max(countryDailyPrevious.total.cases, apiData.cases);
      const totalMaxRecovered = Math.max(countryDailyPrevious.total.recovered, apiData.recovered);
      const totalMaxDeaths = Math.max(countryDailyPrevious.total.deaths, apiData.deaths);

      countryDaily.total.cases = totalMaxCases;
      countryDaily.total.recovered = totalMaxRecovered;
      countryDaily.total.deaths = totalMaxDeaths;

      countryDaily.perOneHundredThousandTotal.cases = this.calculateByOneThousand(totalMaxCases, countryData.population);
      countryDaily.perOneHundredThousandTotal.recovered = this.calculateByOneThousand(totalMaxRecovered, countryData.population);
      countryDaily.perOneHundredThousandTotal.deaths = this.calculateByOneThousand(totalMaxDeaths, countryData.population);

      if (countryDailyPreviousIndex > 0 && apiData.cases > countryDailyPrevious.total.cases) previousIndex = countryDailyPreviousIndex;
    });

    if (previousIndex) {
      const countryDailyPrevious = countryData.daily[previousIndex];
      const countryDailyCurrent = countryData.daily[previousIndex + 1];

      countryData.total.cases = countryDailyCurrent.total.cases;
      countryData.total.recovered = countryDailyCurrent.total.recovered;
      countryData.total.deaths = countryDailyCurrent.total.deaths;

      countryData.perOneHundredThousandTotal.cases = this.calculateByOneThousand(countryDailyCurrent.total.cases, countryData.population);
      countryData.perOneHundredThousandTotal.recovered = this.calculateByOneThousand(countryDailyCurrent.total.recovered, countryData.population);
      countryData.perOneHundredThousandTotal.deaths = this.calculateByOneThousand(countryDailyCurrent.total.deaths, countryData.population);

      countryData.lastDay.cases = countryDailyCurrent.total.cases - countryDailyPrevious.total.cases;
      countryData.lastDay.recovered = countryDailyCurrent.total.recovered - countryDailyPrevious.total.recovered;
      countryData.lastDay.deaths = countryDailyCurrent.total.deaths - countryDailyPrevious.total.deaths;

      countryData.perOneHundredThousandLastDay.cases = this.calculateByOneThousand(countryData.lastDay.cases, countryData.population);
      countryData.perOneHundredThousandLastDay.recovered = this.calculateByOneThousand(countryData.lastDay.recovered, countryData.population);
      countryData.perOneHundredThousandLastDay.deaths = this.calculateByOneThousand(countryData.lastDay.deaths, countryData.population);
    }

    cb();
  }

  getWorldDaily() {
    const cb = (info) => {
      const worldData = this.collection.world;
      const datesCollection = Mixin.getCurrentYearDatesArray();
      const reformatCollection = {};
      let previousIndex = 0;
      worldData.population = this.calculateWorldPopulation();

      datesCollection.forEach((date) => {
        worldData.daily.push(this.getCountryDailyData(date));

        reformatCollection[date] = {
          cases: 0,
          deaths: 0,
          recovered: 0,
        };
      });

      ['cases', 'deaths', 'recovered'].forEach((key) => {
        Object.keys(info[key]).forEach((date) => {
          reformatCollection[Mixin.parseDateFromAPI(date)][key] = info[key][date];
        });
      });

      Object.keys(reformatCollection).forEach((date) => {
        const worldDailyIndex = worldData.daily.findIndex((item) => item.date === date);
        const worldDaily = worldData.daily[worldDailyIndex];
        const worldDailyPreviousIndex = worldDailyIndex - 1;
        const worldDailyPrevious = worldData.daily[worldDailyPreviousIndex];
        const apiData = reformatCollection[date];

        worldDaily.total.cases = apiData.cases;
        worldDaily.total.recovered = apiData.recovered;
        worldDaily.total.deaths = apiData.deaths;

        worldDaily.perOneHundredThousandTotal.cases = this.calculateByOneThousand(apiData.cases, worldData.population);
        worldDaily.perOneHundredThousandTotal.recovered = this.calculateByOneThousand(apiData.recovered, worldData.population);
        worldDaily.perOneHundredThousandTotal.deaths = this.calculateByOneThousand(apiData.deaths, worldData.population);

        if (worldDailyPreviousIndex > 0 && apiData.cases > worldDailyPrevious.total.cases) previousIndex = worldDailyPreviousIndex;
      });

      if (previousIndex) {
        const countryDailyPrevious = worldData.daily[previousIndex];
        const countryDailyCurrent = worldData.daily[previousIndex + 1];

        worldData.total.cases = countryDailyCurrent.total.cases;
        worldData.total.recovered = countryDailyCurrent.total.recovered;
        worldData.total.deaths = countryDailyCurrent.total.deaths;

        worldData.perOneHundredThousandTotal.cases = this.calculateByOneThousand(countryDailyCurrent.total.cases, worldData.population);
        worldData.perOneHundredThousandTotal.recovered = this.calculateByOneThousand(countryDailyCurrent.total.recovered, worldData.population);
        worldData.perOneHundredThousandTotal.deaths = this.calculateByOneThousand(countryDailyCurrent.total.deaths, worldData.population);

        worldData.lastDay.cases = countryDailyCurrent.total.cases - countryDailyPrevious.total.cases;
        worldData.lastDay.recovered = countryDailyCurrent.total.recovered - countryDailyPrevious.total.recovered;
        worldData.lastDay.deaths = countryDailyCurrent.total.deaths - countryDailyPrevious.total.deaths;

        worldData.perOneHundredThousandLastDay.cases = this.calculateByOneThousand(worldData.lastDay.cases, worldData.population);
        worldData.perOneHundredThousandLastDay.recovered = this.calculateByOneThousand(worldData.lastDay.recovered, worldData.population);
        worldData.perOneHundredThousandLastDay.deaths = this.calculateByOneThousand(worldData.lastDay.deaths, worldData.population);
      }

      document.dispatchEvent(new Event(this.$app.config.events.loadAll));
    };

    this.$client.getData(this.$app.config.url.covid.summary, {}, cb);
  }

  calculateWorldPopulation() {
    return this.collection.countries.reduce((out, item) => out + item.population, 0);
  }

  getAllCountries() {
    return this.collection.countries;
  }

  getWorld() {
    return this.collection.world;
  }

  getDailyCollectionByCallback(collection, cb) {
    const out = [];

    collection.forEach((item) => out.push({
      date: item.date,
      value: cb(item)
    }));

    return out;
  }

  getCountryDataByCode(code) {
    const countryData = this.collection.countries.find((country) => country.iso === code);

    if (!countryData) throw new Error('Country not found');

    return countryData;
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

  setDataLoadListeners() {
    document.addEventListener(this.$app.config.events.loadAll, () => {
      this.states.isDataLoad.world = true;
    });

    document.addEventListener(this.$app.config.events.loadCountries, () => {
      this.states.isDataLoad.countries = true;
    });
  }
}
