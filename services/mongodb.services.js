const MongoClient = require("mongodb").MongoClient;

module.exports = {
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
