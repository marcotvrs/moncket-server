module.exports = (projects, app, io) => {
    require("./http")(projects, app);
    require("./sockets")(projects, io);
};
