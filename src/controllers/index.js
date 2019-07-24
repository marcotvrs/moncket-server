const config = require('../services/config');
const mongodb = require('../services/mongodb');
const md5 = require('md5');
const jwt = require('../services/jwt');
const s3 = require('../services/s3');
const models = require('../models');

module.exports = (server) => {
    const io = require('socket.io').listen(server);

    const middleware = (_token) => {
        return new Promise((resolve, reject) => {
            try {
                if (!jwt.verify(_token))
                    throw new Error();
                return resolve();
            } catch (error) {
                return reject({ error: 'This operation requires authentication.' });
            }
        });
    };

    io.use((socket, next) => {
        if (socket.handshake.query.apiKey === config.get().apiKey)
            return next();
        return next(new Error('Authentication error'));
    }).on('connection', async (socket) => {
        const mongo = await mongodb.connect();

        socket.on('watch', async (_body) => {
            try {
                await middleware(_body.token);
                socket.emit(`watch_${_body.hash}`, { success: true });
                models.watch(mongo, _body, (_data) => socket.emit(`watch_${_body.hash}`, _data));
            } catch (error) {
                socket.emit(`watch_${_body.hash}`, error);
            }
        });

        socket.on('aggregate', async (_body) => {
            try {
                await middleware(_body.token);
                let response = await models.aggregate(mongo, _body);
                if (response.error) throw response;
                socket.emit(`aggregate_${_body.hash}`, response);
            } catch (error) {
                socket.emit(`aggregate_${_body.hash}`, error);
            }
        });

        socket.on('find', async (_body) => {
            try {
                await middleware(_body.token);
                let response = await models.find(mongo, _body);
                if (response.error) throw response;
                socket.emit(`find_${_body.hash}`, response);
            } catch (error) {
                socket.emit(`find_${_body.hash}`, error);
            }
        });

        socket.on('findOne', async (_body) => {
            try {
                await middleware(_body.token);
                let response = await models.findOne(mongo, _body);
                if (response.error) throw response;
                socket.emit(`findOne_${_body.hash}`, response);
            } catch (error) {
                socket.emit(`findOne_${_body.hash}`, error);
            }
        });

        socket.on('insertOne', async (_body) => {
            try {
                await middleware(_body.token);
                let response = await models.insertOne(mongo, _body);
                if (response.error) throw response;
                socket.emit(`insertOne_${_body.hash}`, response);
            } catch (error) {
                socket.emit(`insertOne_${_body.hash}`, error);
            }
        });

        socket.on('insertMany', async (_body) => {
            try {
                await middleware(_body.token);
                let response = await models.insertMany(mongo, _body);
                if (response.error) throw response;
                socket.emit(`insertMany_${_body.hash}`, response);
            } catch (error) {
                socket.emit(`insertMany_${_body.hash}`, error);
            }
        });

        socket.on('updateOne', async (_body) => {
            try {
                await middleware(_body.token);
                let response = await models.updateOne(mongo, _body);
                if (response.error) throw response;
                socket.emit(`updateOne_${_body.hash}`, response);
            } catch (error) {
                socket.emit(`updateOne_${_body.hash}`, error);
            }
        });

        socket.on('updateMany', async (_body) => {
            try {
                await middleware(_body.token);
                let response = await models.updateMany(mongo, _body);
                if (response.error) throw response;
                socket.emit(`updateMany_${_body.hash}`, response);
            } catch (error) {
                socket.emit(`updateMany_${_body.hash}`, error);
            }
        });

        socket.on('deleteOne', async (_body) => {
            try {
                await middleware(_body.token);
                let response = await models.deleteOne(mongo, _body);
                if (response.error) throw response;
                socket.emit(`deleteOne_${_body.hash}`, response);
            } catch (error) {
                socket.emit(`deleteOne_${_body.hash}`, error);
            }
        });

        socket.on('deleteMany', async (_body) => {
            try {
                await middleware(_body.token);
                let response = await models.deleteMany(mongo, _body);
                if (response.error) throw response;
                socket.emit(`deleteMany_${_body.hash}`, response);
            } catch (error) {
                socket.emit(`deleteMany_${_body.hash}`, error);
            }
        });

        /************STORAGE************/

        socket.on('storageAsDataUrl', async (_body) => {
            try {
                await middleware(_body.token);
                let type = `data:${_body.ContentType};base64,`;
                let buffer = new Buffer.from(_body.dataUrl.replace(type, ''), 'base64');
                let response = await s3.putObject(_body.filename, buffer, _body.path, {
                    ContentEncoding: 'base64',
                    ContentType: _body.ContentType
                });
                socket.emit(`storageAsDataUrl_${_body.hash}`, { ...response, filename: _body.filename });
            } catch (error) {
                socket.emit(`storageAsDataUrl_${_body.hash}`, error);
            }
        });

        socket.on('storageListObjects', async (_body) => {
            try {
                await middleware(_body.token);
                let response = await s3.listObjects(_body.path);
                socket.emit(`storageListObjects_${_body.hash}`, response.Contents);
            } catch (error) {
                socket.emit(`storageListObjects_${_body.hash}`, error);
            }
        });

        socket.on('storageDeleteObjects', async (_body) => {
            try {
                await middleware(_body.token);
                let response = await s3.deleteObject(_body.path);
                socket.emit(`storageDeleteObjects_${_body.hash}`, response);
            } catch (error) {
                socket.emit(`storageDeleteObjects_${_body.hash}`, error);
            }
        });

        /************AUTH************/

        socket.on('signInWithEmailAndPassword', async (_body) => {
            try {
                let response = await models.findOne(mongo, {
                    collection: 'users',
                    arguments: [{ email: _body.email, password: md5(_body.password) }]
                });
                if (!response || !response._id) throw { error: 'Invalid e-mail or password.' }
                if (response.error) throw response;
                socket.emit(`signInWithEmailAndPassword_${_body.hash}`, {
                    user: response,
                    token: jwt.sign(response)
                });
            } catch (error) {
                socket.emit(`signInWithEmailAndPassword_${_body.hash}`, error);
            }
        });

        socket.on('disconnect', () => mongo.socket.close());
    });
};