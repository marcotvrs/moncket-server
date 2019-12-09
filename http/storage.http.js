const middlewares = require("../services/middlewares.services");
const s3 = require("../services/s3.services");
const resolvers = require("../services/resolvers.services");

module.exports = (projects, app) => {
    app.post(
        "/moncket/storage/storageAsDataUrl",
        (req, res, next) => middlewares.http(req, res, next, projects),
        async (req, res) => {
            try {
                const { ContentType, dataUrl, filename, path } = req.body;
                const { projectid } = req.headers;
                let type = `data:${ContentType};base64,`;
                let buffer = new Buffer.from(dataUrl.replace(type, ""), "base64");
                let e = await s3.putObject(projects, projectid, filename, buffer, path, {
                    ContentEncoding: "base64",
                    ContentType
                });
                res.json(resolvers.success({ ...e, filename: filename }));
            } catch (error) {
                res.json(resolvers.error("/moncket/storage/storageAsDataUrl/error", error));
            }
        }
    );

    app.post(
        "/moncket/storage/storageListObjects",
        (req, res, next) => middlewares.http(req, res, next, projects),
        async (req, res) => {
            try {
                const { path } = req.body;
                const { projectid } = req.headers;
                let e = await s3.listObjects(projects, projectid, path);
                res.json(resolvers.success(e));
            } catch (error) {
                res.json(resolvers.error("/moncket/storage/storageListObjects/error", error));
            }
        }
    );

    app.post(
        "/moncket/storage/storageDeleteObjects",
        (req, res, next) => middlewares.http(req, res, next, projects),
        async (req, res) => {
            try {
                const { path } = req.body;
                const { projectid } = req.headers;
                let e = await s3.deleteObject(projects, projectid, path);
                res.json(resolvers.success(e));
            } catch (error) {
                res.json(resolvers.error("/moncket/storage/storageDeleteObjects/error", error));
            }
        }
    );
};
