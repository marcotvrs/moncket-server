let _watchers = {};

const removeWatchersRecursively = async (_socket, _bodyHash, _i) => {
    try {
        if (_i === 100)
            return console.error(
                new Date().toISOString(),
                "watchers/removeWatchersRecursively/stoped"
            );
        if (!_watchers[_socket.id] || !_watchers[_socket.id][_bodyHash])
            throw new Error();
        _watchers[_socket.id][_bodyHash].changeStream.close(() =>
            _watchers[_socket.id][_bodyHash].client.close(() => {
                try {
                    delete _watchers[_socket.id][_bodyHash];
                } catch (error) {
                    return error;
                }
            })
        );
    } catch (error) {
        return setTimeout(
            removeWatchersRecursively.bind(this, _socket, _bodyHash, _i + 1),
            1000
        );
    }
};

module.exports = {
    setBySocketId: (_socket, _client, _db, _body, _callback) => {
        try {
            const changeStream = _db
                .collection(_body.collection)
                .watch([], { fullDocument: "updateLookup" });
            changeStream.on("change", _callback);
            changeStream.on("error", error =>
                changeStream.close(() =>
                    _client.close(() =>
                        console.error(
                            new Date().toISOString(),
                            "watchers/setBySocketId/error",
                            error
                        )
                    )
                )
            );
            if (!_watchers[_socket.id]) _watchers[_socket.id] = {};
            _watchers[_socket.id][_body.hash] = {
                changeStream,
                client: _client
            };
        } catch (error) {
            return error;
        }
    },
    removeBySocketId: async (_socket, _body) => {
        try {
            await removeWatchersRecursively(_socket, _body.hash, 0);
        } catch (error) {
            return error;
        }
    },
    removeAllBySocketId: async _socket => {
        try {
            let keys = Object.keys(_watchers[_socket.id]);
            for (let i = 0; i < keys.length; i++)
                await removeWatchersRecursively(_socket, keys[i], 0);
            delete _watchers[_socket.id];
        } catch (error) {
            return error;
        }
    }
};
