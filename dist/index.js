'use strict';

var child_process = require('child_process');
var EventEmitter = require('events').EventEmitter;

var CPU_OPTS = ['-stats', 'pid,cpu,command', '-o', 'cpu'];
var MEM_OPTS = ['-stats', 'pid,mem,command', '-o', 'mem'];

// TODO
// function parseProcess(data) {
// }

// TODO
// function parseLoadAvg(data) {
//     let regex = /\s(\d+\.\d+).\s+(\d+\.\d+).\s+(\d+\.\d+)\s+.+\s+(\d+\.\d+).*\s+(\d+\.\d+).*\s+(\d+\.\d+)/;
// }

function parseCpuUsage(data) {
    var regex = /\s+(\d+\.\d+).*\s+(\d+\.\d+).*\s+(\d+\.\d+)/;

    var m = regex.exec(data);
    if (m) {
        return {
            user: m[1],
            sys: m[2],
            idle: m[3]
        };
    }
}

function parseMemInKb(mem) {
    var num = Number(mem.substring(0, mem.length - 1));

    if (mem.charAt(mem.length - 1) === 'M') {
        return num * 1024;
    } else if (mem.charAt(mem.length - 1) === 'G') {
        return num * 1024 * 1024;
    } else if (mem.charAt(mem.length - 1) === 'K') {
        return num;
    }
}

function parseMemUsage(data) {
    var regex = /\s+(\d+.)\s+.*\((\d+.)\s+.*\s(\d+.)/;

    var m = regex.exec(data);
    if (m) {
        return {
            used: m[1],
            wired: m[2],
            unused: m[3],
            used_kb: parseMemInKb(m[1]),
            wired_kb: parseMemInKb(m[2]),
            unused_kb: parseMemInKb(m[3])
        };
    }
}

// function parseVMUsage(data) {
// }

// function parseNetwork(data) {
// }

// function parseDisk(data) {

// }

function parseTopCpuProcs(data) {
    var regex = /^(\d+)\s+(\d+\.\d+)\s+(.*)$/mg;

    var m = regex.exec(data),
        procs = [];
    while (m) {
        procs.push({
            pid: m[1],
            cpu: m[2],
            command: m[3].trim()
        });

        m = regex.exec(data);
    }

    return procs;
}

function parseTopMemProcs(data) {
    var regex = /^(\d+)\s+(\w+).?\s+(.*)$/mg;

    var m = regex.exec(data),
        procs = [];
    while (m) {
        procs.push({
            pid: m[1],
            mem: m[2],
            command: m[3].trim()
        });

        m = regex.exec(data);
    }

    return procs;
}

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

var CpuMonitor = function CpuMonitor(options) {
    var self = this,
        opts = parseOptions(CPU_OPTS, options);

    var top = child_process.spawn('/usr/bin/top', opts);

    top.stdout.on('data', function (data) {
        var lines = data.toString().split('\n');

        var cpuUsage = parseCpuUsage(lines[3]);
        if (cpuUsage) {
            self.emit('cpuUsage', cpuUsage);
        }

        lines.splice(0, 11);
        data = lines.join('\n');

        var topCpuProcs = parseTopCpuProcs(data);
        if (topCpuProcs) {
            self.emit('topCpuProcs', topCpuProcs);
        }
    });

    self.on('exit', function () {
        top.kill('SIGINT');
    });
};

var MemMonitor = function MemMonitor(options) {
    var self = this,
        opts = parseOptions(MEM_OPTS, options);

    var top = child_process.spawn('/usr/bin/top', opts);

    top.stdout.on('data', function (data) {
        var lines = data.toString().split('\n');

        var memUsage = parseMemUsage(lines[6]);
        if (memUsage) {
            self.emit('memUsage', memUsage);
        }

        lines.splice(0, 11);
        data = lines.join('\n');

        var topMemProcs = parseTopMemProcs(data);
        if (topMemProcs) {
            self.emit('topMemProcs', topMemProcs);
        }
    });

    self.on('exit', function () {
        top.kill('SIGINT');
    });
};

CpuMonitor.prototype = Object.create(EventEmitter.prototype);
MemMonitor.prototype = Object.create(EventEmitter.prototype);

exports.CpuMonitor = CpuMonitor;
exports.MemMonitor = MemMonitor;
//# sourceMappingURL=index.js.map