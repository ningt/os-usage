import { EventEmitter } from 'events';
import { parseOptions } from './utils';
import child_process from 'child_process';

const DEFAULT_LIMIT = 5;
const CPU_OPTS = ['-stats', 'pid,cpu,command', '-o', 'cpu'];

/*
 * options
 *     limit    @number
 *     delay    @number
 *     exclude  @array
 */
export default class CpuMonitor extends EventEmitter {
    constructor(options = {}) {
        super();

        this.exclude = options.exclude || [];
        this.limit = options.limit || DEFAULT_LIMIT;
        this.opts = parseOptions(CPU_OPTS, options);
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
        const procs = [];
        const regex = /^(\d+)\s+(\d+\.\d+)\s+(.*)$/mg;
        let matches = regex.exec(data);

        while (matches) {
            if (!matches ||
                matches.length < 4 ||
                procs.length >= this.limit ||
                this.exclude.indexOf(matches[3].trim()) > -1 // exclude this proc from results
            ) continue;

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
