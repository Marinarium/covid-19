export default class HttpClient {
  constructor(app) {
    this.$app = app;
  }

  async getData(url, params = {}, cb = null, responseType = 'json', sync = false) {
    return (sync)
      ? this.getDataSync(url, params, responseType)
      : this.getDataAsync(url, params, cb, responseType);
  }

  getDataAsync(url, params, cb, responseType) {
    return fetch(url, params)
      .then((response) => response[responseType]())
      .then((response) => cb(response));
  }

  async getDataSync(url, params, responseType) {
    const response = await fetch(url, params);
    const decoded = await response[responseType]();

    return decoded;
  }
}
