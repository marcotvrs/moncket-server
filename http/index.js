module.exports = (projects, app) => {
    require("./auth.http")(projects, app);
    require("./db.http")(projects, app);
    require("./storage.http")(projects, app);
};
