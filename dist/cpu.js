'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _utils = require('./utils');

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DEFAULT_LIMIT = 5;
var CPU_OPTS = ['-stats', 'pid,cpu,command', '-o', 'cpu'];

/*
 * options
 *     limit    @number
 *     delay    @number
 *     exclude  @array
 */

var CpuMonitor = function (_EventEmitter) {
    _inherits(CpuMonitor, _EventEmitter);

    function CpuMonitor() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, CpuMonitor);

        var _this = _possibleConstructorReturn(this, (CpuMonitor.__proto__ || Object.getPrototypeOf(CpuMonitor)).call(this));

        _this.exclude = options.exclude || [];
        _this.limit = options.limit || DEFAULT_LIMIT;
        _this.opts = (0, _utils.parseOptions)(CPU_OPTS, options);
        _this.top = _child_process2.default.spawn('/usr/bin/top', _this.opts);

        if (process.env.NODE_ENV !== 'test') {
            _this.onData();
        }

        _this.onExit();
        return _this;
    }

    _createClass(CpuMonitor, [{
        key: 'onData',
        value: function onData() {
            var _this2 = this;

            this.top.stdout.on('data', function (data) {
                _this2.parseData(data.toString());
            });
        }
    }, {
        key: 'onExit',
        value: function onExit() {
            var _this3 = this;

            this.on('exit', function () {
                _this3.top.kill('SIGINT');
            });
        }
    }, {
        key: 'parseData',
        value: function parseData(data) {
            var cpuUsage = this.parseCpuUsage(data);

            if (cpuUsage) {
                this.emit('cpuUsage', cpuUsage);
            }

            var topCpuProcs = this.parseTopCpuProcs(data);

            if (topCpuProcs) {
                this.emit('topCpuProcs', topCpuProcs);
            }
        }
    }, {
        key: 'parseCpuUsage',
        value: function parseCpuUsage(data) {
            var usage = void 0;
            var lines = data.split('\n');
            var regex = /(\d+\.\d+)% *user.*\s(\d+\.\d+)% *sys.*\s(\d+\.\d+)% *idle/;

            lines.forEach(function (line) {
                var matches = regex.exec(line);

                if (matches && matches.length >= 4) {
                    usage = { user: matches[1], sys: matches[2], idle: matches[3] };
                }
            });

            return usage;
        }
    }, {
        key: 'parseTopCpuProcs',
        value: function parseTopCpuProcs(data) {
            var procs = [];
            var regex = /^(\d+)\s+(\d+\.\d+)\s+(.*)$/mg;
            var matches = regex.exec(data);

            while (matches) {
                if (!matches || matches.length < 4 || procs.length >= this.limit || this.exclude.indexOf(matches[3].trim()) > -1 // exclude this proc from results
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
    }]);

    return CpuMonitor;
}(_events.EventEmitter);

exports.default = CpuMonitor;
//# sourceMappingURL=cpu.js.map