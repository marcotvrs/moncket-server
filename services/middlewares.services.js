const jwt = require('./jwt.services');

module.exports = (_projects, _handshake, _token) => {
    return new Promise((resolve, reject) => {
        if (jwt.verify(_projects, _handshake.projectId, _token))
            return resolve(true);
        return reject('Invalid authorization token.');
    });
};