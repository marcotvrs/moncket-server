const watchers = require("../services/watchers.services");

module.exports = (projects, io) => {
    io.use((socket, next) => {
        if (socket.handshake.query.apiKey === projects[socket.handshake.query.projectId].apiKey) return next();
        return next(new Error("Authentication error"));
    });

    io.on("connection", async socket => {
        try {
            require("./db.sockets")(projects, socket);
            socket.on("disconnect", () => watchers.removeAllBySocketId(socket));
        } catch (error) {
            console.error(new Date().toISOString(), "io/connection", error);
            socket.disconnect();
        }
    });
};
