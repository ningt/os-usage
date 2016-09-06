import { EventEmitter } from 'events';
import { parseOptions } from './utils';
import child_process from 'child_process';

const CPU_OPTS = ['-stats', 'pid,cpu,command', '-o', 'cpu'];

export default class CpuMonitor extends EventEmitter {
    constructor(options) {
        super();

        this.opts = parseOptions(CPU_OPTS, options);
        this.top = child_process.spawn('/usr/bin/top', this.opts);
        this.listen();
    }

    listen() {
        this.top.stdout.on('data', (data) => {
            this.parseData(data.toString());
        });

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
        const lines = data.split('\n');
        const regex = /(\d+\.\d+)% *user.*(\d+\.\d+)% *sys.*(\d+\.\d+)% *idle/;

        lines.forEach((line) => {
            const matches = regex.exec(line);

            if (matches && matches.length === 6) {
                return { user: matches[3], sys: matches[4], idle: matches[5] };
            }
        });
    }

    parseTopCpuProcs(data) {
        let matches;
        const procs = [];
        const regex = /^(\d+)\s+(\d+\.\d+)\s+(.*)$/mg;

        while (matches = regex.exec(data)) {
            if (!matches || matches.length < 4) continue;

            procs.push({
                pid: matches[1],
                cpu: matches[2],
                command: matches[3].trim()
            });
        }

        return procs;
    }
}