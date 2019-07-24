const config = require('./src/services/config');
module.exports = function (_server, _config) {
    config.set(_config);
    require('./src/controllers')(_server);
    return {
        listen: function (_port) {
            _server.listen(_port);
        }
    };
};