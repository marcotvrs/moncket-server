const MongoClient = require("mongodb").MongoClient;

const MongoDB = {
    client(_projects, _projectId) {
        const { uri, database } = _projects[_projectId].mongodb;
        return {
            client: new MongoClient(uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }),
            database
        };
    }
};

module.exports = MongoDB;
