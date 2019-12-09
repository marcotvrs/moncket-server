const middlewares = require("../services/middlewares.services");
const mongodb = require("../services/mongodb.services");
const operators = require("../services/operators.services");
const resolvers = require("../services/resolvers.services");

module.exports = (projects, app) => {
    const proxiesHandler = async (_stack, _db) => {
        for (let i = 0; i < _stack.length; i++) {
            operators.search(_stack[i].args);
            if (["first"].indexOf(_stack[i].name) !== -1) return _db.length ? _db[0] : {};
            _db = await _db[_stack[i].name](..._stack[i].args);
        }
        return _db;
    };

    app.post(
        "/moncket/db/collection",
        (req, res, next) => middlewares.http(req, res, next, projects),
        async (req, res) => {
            try {
                const { projectid } = req.headers;
                const { stack } = req.body;
                const { client, database } = mongodb.client(projects, projectid);
                client.connect(async error => {
                    try {
                        if (error) throw error;
                        const db = client.db(database);
                        const e = await proxiesHandler(stack, db);
                        client.close(() => res.json(resolvers.success(e)));
                    } catch (error) {
                        client.close(() => res.json(resolvers.error("/moncket/db/collection/error", error)));
                    }
                });
            } catch (error) {
                res.json(resolvers.error("/moncket/db/collection/error", error));
            }
        }
    );

    app.post(
        "/moncket/db/transaction",
        (req, res, next) => middlewares.http(req, res, next, projects),
        async (req, res) => {
            try {
                let transaction = {};
                const { stacks } = req.body;
                const { projectid } = req.headers;
                const { client, database } = mongodb.client(projects, projectid);
                client.connect(async error => {
                    try {
                        if (error) throw error;
                        const db = client.db(database);
                        const keys = Object.keys(stacks);
                        for (let i = 0; i < keys.length; i++)
                            transaction[keys[i]] = await proxiesHandler(stacks[keys[i]], db);
                        client.close(() => res.json(resolvers.success(transaction)));
                    } catch (error) {
                        client.close(() => res.json(resolvers.error("/moncket/db/transaction/error", error)));
                    }
                });
            } catch (error) {
                res.json(resolvers.error("/moncket/db/transaction/error", error));
            }
        }
    );
};
