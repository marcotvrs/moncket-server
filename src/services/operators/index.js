const ObjectID = require('mongodb').ObjectID;

const Operators = {
    formatters: {
        $oid: (_value) => ObjectID(_value),
        $serverDatetime: () => new Date(),
        $serverTimestamp: () => new Date().getTime(),
        $date: (value) => new Date(value)
    },
    search: function (_args) {
        if (!_args) return;
        Object.keys(_args).forEach((key) => {
            if (_args[key]) {
                for (let $ in Operators.formatters) {
                    if (_args[key][$])
                        return _args[key] = Operators.formatters[$](_args[key][$]);
                }
            }
            if (typeof _args[key] === 'object')
                return Operators.search(_args[key]);
        });
    }
};

module.exports = Operators;