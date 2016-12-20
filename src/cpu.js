import { EventEmitter } from 'events';
import { parseOptions } from './utils';
import child_process from 'child_process';

const CPU_OPTS = ['-stats', 'pid,cpu,command', '-o', 'cpu'];

export default class CpuMonitor extends EventEmitter {
    constructor(options = {}) {
        super();

        this.limit = options['limit'] || 5;
        this.opts = parseOptions(CPU_OPTS, {...options, limit: this.limit + 1});
        this.top = child_process.spawn('/usr/bin/top', this.opts);

        if (process.env.NODE_ENV !== 'test') {
            this.onData();
        }

        this.onExit();
    }

    onData() {
        this.top.stdout.on('data', (data) => {
            this.parseData(data.toString());
        });
    }

    onExit() {
        this.on('exit', () => {
            this.top.kill('SIGINT');
        });
    }

    parseData(data) {
        const cpuUsage = this.parseCpuUsage(data);

        if (cpuUsage) {
            this.emit('cpuUsage', cpuUsage);
        }

        const topCpuProcs = this.parseTopCpuProcs(data);

        if (topCpuProcs) {
            this.emit('topCpuProcs', topCpuProcs);
        }
    }

    parseCpuUsage(data) {
        let usage;
        const lines = data.split('\n');
        const regex = /(\d+\.\d+)% *user.*\s(\d+\.\d+)% *sys.*\s(\d+\.\d+)% *idle/;

        lines.forEach((line) => {
            const matches = regex.exec(line);

            if (matches && matches.length >= 4) {
                usage = { user: matches[1], sys: matches[2], idle: matches[3] };
            }
        });

        return usage;
    }

    parseTopCpuProcs(data) {
        const topPid = String(this.top.pid);
        const procs = [];
        const regex = /^(\d+)\s+(\d+\.\d+)\s+(.*)$/mg;
        let matches = regex.exec(data);

        while (matches) {
            if (!matches || matches.length < 4) continue;

            if (topPid !== matches[1] && procs.length < this.limit)
                procs.push({
                    pid: matches[1],
                    cpu: matches[2],
                    command: matches[3].trim()
                });

            matches = regex.exec(data);
        }

        return procs;
    }
}
