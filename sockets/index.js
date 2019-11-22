const watchers = require("../services/watchers.services");

module.exports = (_projects, _io) => {
    _io.use((socket, next) => {
        if (
            socket.handshake.query.apiKey ===
            _projects[socket.handshake.query.projectId].apiKey
        )
            return next();
        return next(new Error("Authentication error"));
    });

    _io.on("connection", async socket => {
        try {
            require("./auth.controllers")(_projects, socket);
            require("./db.controllers")(_projects, socket);
            require("./storage.controllers")(_projects, socket);
            socket.on("disconnect", () => watchers.removeAllBySocketId(socket));
        } catch (error) {
            console.error(new Date().toISOString(), "io/connection", error);
            socket.disconnect();
        }
    });
};
