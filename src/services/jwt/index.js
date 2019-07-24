const config = require('../config');
const jwt = require('jsonwebtoken');

module.exports = {
    sign: (_auth) => {
        return jwt.sign({ _id: _auth._id, email: _auth.email }, config.get().secretKey);
    },
    verify: (_token) => {
        return jwt.verify(_token, config.get().secretKey, { ignoreExpiration: true });
    }
};