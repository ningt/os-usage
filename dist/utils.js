'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.parseOptions = parseOptions;
function parseOptions(default_opts, options) {
    var opts = default_opts;
    var v = void 0,
        limit = 5,
        delay = 1;

    if (options) {
        v = Number(options.limit);
        limit = v > 0 && v < 20 ? v : limit;

        v = Number(options.delay);
        delay = v > 0 ? v : delay;
    }

    opts.push('-n');
    opts.push(String(limit));
    opts.push('-s');
    opts.push(String(delay));

    return opts;
}
//# sourceMappingURL=utils.js.map