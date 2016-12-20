'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parseOptions = parseOptions;

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_LIMIT = 5;
var DEFAULT_DELAY = 1;

function parseOptions(default_options, options) {
    var opts = default_options;
    var limit = DEFAULT_LIMIT,
        delay = DEFAULT_DELAY;

    if (options) {
        if (_util2.default.isNumber(options.limit)) {
            limit = options.limit;
        }

        if (_util2.default.isNumber(options.delay)) {
            delay = options.delay;
        }

        if (_util2.default.isArray(options.exclude)) {
            limit += options.exclude.length;
        }
    }

    opts.push('-n');
    opts.push(String(limit));
    opts.push('-s');
    opts.push(String(delay));

    return opts;
}
//# sourceMappingURL=utils.js.map