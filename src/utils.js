import util from 'util';

const DEFAULT_LIMIT = 5;
const DEFAULT_DELAY = 1;

export function parseOptions(default_options, options) {
    const opts = default_options;
    let limit = DEFAULT_LIMIT, delay = DEFAULT_DELAY;

    if (options) {
        if (util.isNumber(options.limit)) {
            limit = options.limit;
        }

        if (util.isNumber(options.delay)) {
            delay = options.delay;
        }

        if (util.isArray(options.exclude)) {
            limit += options.exclude.length;
        }
    }

    opts.push('-n');
    opts.push(String(limit));
    opts.push('-s');
    opts.push(String(delay));

    return opts;
}