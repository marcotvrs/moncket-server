const jwt = require('jsonwebtoken');

module.exports = {
    sign: (_projects, _projectId, _auth, expiresIn) => {
        let options = {};
        if (expiresIn)
            options.expiresIn = expiresIn;
        return jwt.sign({
            _id: _auth._id,
            email: _auth.email
        }, _projects[_projectId].secretKey, options);
    },
    verify: (_projects, _projectId, _value) => {
        return jwt.verify(_value, _projects[_projectId].secretKey);
    }
};