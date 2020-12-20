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

      out[key] = (typeof item === 'object') ? Mixin.deepClone(item) : item;
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
  }
}

export default Mixin;