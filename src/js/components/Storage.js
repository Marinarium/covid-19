export default class Storage {
    constructor(app, client) {
        this.$app = app;
        this.$client = client;

        this.collection = {
            base: {},
            countries: [],
            population: {},
        };
    }

    load() {
        this.loadCountriesInfo();
    }

    loadCountriesInfo() {
        const cb = () => document.dispatchEvent(new Event(this.$app.config.events.loadCountries));

        this.$client.getData(this.$app.config.url.countries.population, {}, cb);
    }

    getCountryInfo() {}
}