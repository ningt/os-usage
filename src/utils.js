export function parseOptions(default_opts, options) {
    const opts = default_opts;
    let v, limit = 5, delay = 1;

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