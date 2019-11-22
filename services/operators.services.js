const { ObjectId, Double, Int32, Long, Timestamp } = require("mongodb");
const md5 = require("md5");

const Operators = {
    formatters: {
        $mObjectId: _value => ObjectId(_value),
        $mDate: _value => new Date(_value),
        $mDouble: _value => Double(_value),
        $mInt32: _value => Int32(_value),
        $mLong: _value => Long(_value),
        $mTimestamp: _value => Timestamp(_value),
        $mServerDatetime: () => new Date(),
        $mServerTimestamp: () => Double(new Date().getTime()),
        $mMd5: _value => md5(_value)
    },
    search: function(_args) {
        if (!_args) return;
        Object.keys(_args).forEach(key => {
            if (_args[key]) {
                for (let $ in Operators.formatters) {
                    if (_args[key][$])
                        return (_args[key] = Operators.formatters[$](
                            _args[key][$]
                        ));
                }
            }
            if (typeof _args[key] === "object")
                return Operators.search(_args[key]);
        });
    }
};

module.exports = Operators;
