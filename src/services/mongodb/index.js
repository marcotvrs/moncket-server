const config = require('../config');
const MongoClient = require('mongodb').MongoClient;

const MongoDB = {
    connect: async () => {
        return new Promise((resolve, reject) => {
            MongoClient.connect(`mongodb://${config.get().mongodb.username}:${config.get().mongodb.password}@${config.get().mongodb.host}/${config.get().mongodb.authenticationDatabase}`, { useNewUrlParser: true }, (err, socket) => {
                if (err) return reject(err);
                return resolve({ socket, db: socket.db(config.get().mongodb.database) });
            });
        });
    }
};

module.exports = MongoDB;