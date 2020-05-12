module.exports = (projects, app, io) => {
  if (app) require("./http")(projects, app);
  if (io) require("./sockets")(projects, io);
};
