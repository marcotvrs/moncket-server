const middlewares = require("../services/middlewares.services");
const s3 = require("../services/s3.services");
const resolvers = require("../services/resolvers.services");

module.exports = (_projects, _socket) => {
    _socket.on("moncket/storage/storageAsDataUrl", async (_body, _callback) => {
        try {
            await middlewares(_projects, _socket.handshake.query, _body.token);
            let type = `data:${_body.ContentType};base64,`;
            let buffer = new Buffer.from(
                _body.dataUrl.replace(type, ""),
                "base64"
            );
            let e = await s3.putObject(
                _projects,
                _socket.handshake.query.projectId,
                _body.filename,
                buffer,
                _body.path,
                {
                    ContentEncoding: "base64",
                    ContentType: _body.contenttype
                }
            );
            _callback(resolvers.success({ ...e, filename: _body.filename }));
        } catch (error) {
            _callback(
                resolvers.error("moncket/storage/storageAsDataUrl/error", error)
            );
        }
    });

    _socket.on(
        "moncket/storage/storageListObjects",
        async (_body, _callback) => {
            try {
                await middlewares(
                    _projects,
                    _socket.handshake.query,
                    _body.token
                );
                let e = await s3.listObjects(
                    _projects,
                    _socket.handshake.query.projectId,
                    _body.path
                );
                _callback(resolvers.success(e));
            } catch (error) {
                _callback(
                    resolvers.error("moncket/storage/storageListObjects/error", error)
                );
            }
        }
    );

    _socket.on(
        "moncket/storage/storageDeleteObjects",
        async (_body, _callback) => {
            try {
                await middlewares(
                    _projects,
                    _socket.handshake.query,
                    _body.token
                );
                let e = await s3.deleteObject(
                    _projects,
                    _socket.handshake.query.projectId,
                    _body.path
                );
                _callback(resolvers.success(e));
            } catch (error) {
                _callback(
                    resolvers.error(
                        "moncket/storage/storageDeleteObjects/error",
                        error
                    )
                );
            }
        }
    );
};
