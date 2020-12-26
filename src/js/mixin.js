const Mixin = {
  deepFreeze(object) {
    Object.freeze(object);

    Object.getOwnPropertyNames(object).forEach(function (prop) {
      if (Object.prototype.hasOwnProperty.call(object, prop)
        && object[prop] !== null
        && (typeof object[prop] === "object" || typeof object[prop] === "function")
        && !Object.isFrozen(object[prop])
      ) {
        Mixin.deepFreeze(object[prop]);
      }
    });

    return object;
  },
  deepClone(obj) {
    const out = {};

    Object.keys(obj).forEach((key) => {
      const item = obj[key];

      if (typeof item === 'object') {
        if (Array.isArray(item)) {
          out[key] = Array.from(item)
        } else {
          out[key] = Mixin.deepClone(item);
        }
      } else {
        out[key] = item;
      }
    });

    return out;
  },
  getDatesForPreviousDate() {
    const out = {
      from: '',
      to: '',
    };

    const date = new Date();

    date.setDate(date.getDate() - 1);
    date.setUTCMinutes(0);
    date.setUTCHours(0);
    date.setUTCSeconds(0);
    date.setUTCMilliseconds(0);

    out.from = date.toISOString();

    date.setUTCSeconds(1);

    out.to = date.toISOString();

    return out;
  },
  calcPercent(current, max) {
    if (!max) return 0;

    return +((current / max) * 100).toFixed(2);
  },
  getCurrentYearDatesArray() {
    const out = [];
    const date = new Date();
    const currentDate = new Date();
    currentDate.setUTCHours(-24, 0, 0, 0);
    const currentTimestamp = currentDate.getTime();

    date.setUTCFullYear(2020, 0, 1);
    date.setUTCHours(0, 0, 0, 0);

    while (date.getTime() < currentTimestamp) {
      date.setDate(date.getDate() + 1);

      out.push(date.toISOString());
    }

    return out;
  },
  parseDateFromAPI(dateString) {
    const date = new Date(dateString);
    date.setUTCHours(24);

    return date.toISOString();
  },
  getYesterday() {
    const date = new Date();

    date.setUTCFullYear(2020, 0);
    date.setUTCDate(date.getUTCDate() - 1);
    date.setUTCHours(0, 0, 0, 0);

    return date;
  },
  parseDateISO(dateString) {
    return dateString.split('T').shift();
  },
}

export default Mixin;