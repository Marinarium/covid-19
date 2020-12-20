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
  }
}

export default Mixin;