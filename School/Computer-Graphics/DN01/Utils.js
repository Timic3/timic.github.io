class Utils {
    static assert(condition, message) {
        if (!condition) {
            throw new TypeError(message);
        }
    }

    static isNumber(value) {
        return !isNaN(value);
    }
}