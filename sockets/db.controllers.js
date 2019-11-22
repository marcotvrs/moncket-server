const equal = require("fast-deep-equal");
const mongodb = require("../services/mongodb.services");
const middlewares = require("../services/middlewares.services");
const operators = require("../services/operators.services");
const resolvers = require("../services/resolvers.services");
const watchers = require("../services/watchers.services");

module.exports = (_projects, _socket) => {
    const proxiesHandler = async (_stack, _db) => {
        for (let i = 0; i < _stack.length; i++) {
            operators.search(_stack[i].args);
            if (["first"].indexOf(_stack[i].name) !== -1)
                return _db.length ? _db[0] : {};
            _db = await _db[_stack[i].name](..._stack[i].args);
        }
        return _db;
    };

    _socket.on("moncket/db/collection", async (_body, _callback) => {
        try {
            await middlewares(_projects, _socket.handshake.query, _body.token);
            const { projectId } = _socket.handshake.query;
            const { client, database } = mongodb.client(_projects, projectId);
            client.connect(async error => {
                try {
                    if (error) throw error;
                    const db = client.db(database);
                    const e = await proxiesHandler(_body.stack, db);
                    client.close(() => _callback(resolvers.success(e)));
                } catch (error) {
                    client.close(() =>
                        _callback(
                            resolvers.error(
                                "moncket/db/collection/error",
                                error
                            )
                        )
                    );
                }
            });
        } catch (error) {
            _callback(resolvers.error("moncket/db/collection/error", error));
        }
    });

    _socket.on("moncket/db/transaction", async (_body, _callback) => {
        try {
            await middlewares(_projects, _socket.handshake.query, _body.token);
            let transaction = {};
            const keys = Object.keys(_body.stacks);
            const { projectId } = _socket.handshake.query;
            const { client, database } = mongodb.client(_projects, projectId);
            client.connect(async error => {
                try {
                    if (error) throw error;
                    const db = client.db(database);
                    for (let i = 0; i < keys.length; i++)
                        transaction[keys[i]] = await proxiesHandler(
                            _body.stacks[keys[i]],
                            db
                        );
                    client.close(() =>
                        _callback(resolvers.success(transaction))
                    );
                } catch (error) {
                    client.close(() =>
                        _callback(
                            resolvers.error(
                                "moncket/db/transaction/error",
                                error
                            )
                        )
                    );
                }
            });
        } catch (error) {
            _callback(resolvers.error("moncket/db/transaction/error", error));
        }
    });

    _socket.on("moncket/db/watch", async _body => {
        try {
            await middlewares(_projects, _socket.handshake.query, _body.token);
            operators.search(_body.args);
            const { projectId } = _socket.handshake.query;
            const { client, database } = mongodb.client(_projects, projectId);
            client.connect(async error => {
                try {
                    if (error) throw error;
                    const db = client.db(database);
                    let called = false;
                    let prevData = [];
                    const change = async () => {
                        let nextData = await db
                            .collection(_body.collection)
                            .aggregate(_body.args)
                            .toArray();
                        if (equal(prevData, nextData) && called) return;
                        called = true;
                        prevData = nextData;
                        _socket.emit(
                            `moncket/db/watch/${_body.hash}`,
                            resolvers.success(nextData)
                        );
                    };
                    watchers.setBySocketId(_socket, client, db, _body, change);
                    await change();
                } catch (error) {
                    client.close(() =>
                        resolvers.error(`moncket/db/watch/${_body.hash}`, error)
                    );
                }
            });
        } catch (error) {
            _socket.emit(
                `moncket/db/watch/${_body.hash}`,
                resolvers.error("moncket/db/watch", error)
            );
        }
    });

    _socket.on("moncket/db/watch/removeListener", async (_body, _callback) => {
        try {
            await middlewares(_projects, _socket.handshake.query, _body.token);
            watchers.removeBySocketId(_socket, _body);
            _callback(resolvers.success({ success: true }));
        } catch (error) {
            _callback(
                resolvers.error("moncket/db/watch/removeListener/error", error)
            );
        }
    });
};
