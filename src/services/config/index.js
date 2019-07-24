let _CONFIG = {};

module.exports = {
    set: function (_config) {
        _CONFIG = _config;
    },
    get: function () {
        return _CONFIG;
    }
};