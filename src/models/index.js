const operators = require('../services/operators');

module.exports = {
    watch: async (_mongo, _body, _callback) => {
        try {
            operators.search(_body.arguments);
            const changeStream = _mongo.db.collection(_body.collection).watch(_body.arguments, { fullDocument: "updateLookup" });
            changeStream.on('change', next => _callback(next.fullDocument));
            changeStream.on('error', (error) => _callback({ error: error.message }));
        } catch (error) {
            return { error: error.message };
        }
    },
    aggregate: async (_mongo, _body) => {
        try {
            operators.search(_body.arguments);
            return await _mongo.db.collection(_body.collection).aggregate(..._body.arguments).toArray();
        } catch (error) {
            return { error: error.message };
        }
    },
    find: async (_mongo, _body) => {
        try {
            operators.search(_body.arguments);
            let e = _mongo.db.collection(_body.collection).find(..._body.arguments);
            if (_body.limit) e.limit(parseInt(_body.limit));
            if (_body.skip) e.skip(parseInt(_body.skip));
            if (_body.sort) e.sort(_body.sort);
            return {
                size: await e.count(),
                docs: await e.toArray()
            };
        } catch (error) {
            return { error: error.message };
        }
    },
    findOne: async (_mongo, _body) => {
        try {
            operators.search(_body.arguments);
            return await _mongo.db.collection(_body.collection).findOne(..._body.arguments);
        } catch (error) {
            return { error: error.message };
        }
    },
    insertOne: async (_mongo, _body) => {
        try {
            operators.search(_body.arguments);
            return await _mongo.db.collection(_body.collection).insertOne(..._body.arguments);
        } catch (error) {
            return { error: error.message };
        }
    },
    insertMany: async (_mongo, _body) => {
        try {
            operators.search(_body.arguments);
            return await _mongo.db.collection(_body.collection).insertMany(..._body.arguments)
        } catch (error) {
            return { error: error.message };
        }
    },
    updateOne: async (_mongo, _body) => {
        try {
            operators.search(_body.arguments);
            return await _mongo.db.collection(_body.collection).updateOne(..._body.arguments);
        } catch (error) {
            return { error: error.message };
        }
    },
    updateMany: async (_mongo, _body) => {
        try {
            operators.search(_body.arguments);
            return await _mongo.db.collection(_body.collection).updateMany(..._body.arguments);
        } catch (error) {
            return { error: error.message };
        }
    },
    deleteOne: async (_mongo, _body) => {
        try {
            operators.search(_body.arguments);
            return await _mongo.db.collection(_body.collection).deleteOne(..._body.arguments);
        } catch (error) {
            return { error: error.message };
        }
    },
    deleteMany: async (_mongo, _body) => {
        try {
            operators.search(_body.arguments);
            return await _mongo.db.collection(_body.collection).deleteMany(..._body.arguments);
        } catch (error) {
            return { error: error.message };
        }
    }
};