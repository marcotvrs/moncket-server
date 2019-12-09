const jwt = require("./jwt.services");

module.exports = {
    socket: (projects, handshake, token) => {
        return new Promise((resolve, reject) => {
            if (jwt.verify(projects, handshake.projectId, token)) return resolve(true);
            return reject("Invalid authorization token.");
        });
    },
    http: (req, res, next, projects) => {
        try {
            const { token, projectid } = req.headers;
            if (jwt.verify(projects, projectid, token)) return next();
            throw new Error("Invalid authorization token.");
        } catch (error) {
            res.json({ error: error.message });
        }
    }
};
