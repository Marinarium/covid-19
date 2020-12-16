export const Mixin = {
    deepFreeze(object) {
        Object.freeze(object);

        Object.getOwnPropertyNames(object).forEach(function (prop) {
            if (object.hasOwnProperty(prop)
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
