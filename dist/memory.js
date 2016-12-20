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
var MEM_OPTS = ['-stats', 'pid,mem,command', '-o', 'mem'];

/*
 * options
 *     limit    @number
 *     delay    @number
 *     exclude  @array
 */

var MemMonitor = function (_EventEmitter) {
    _inherits(MemMonitor, _EventEmitter);

    function MemMonitor() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, MemMonitor);

        var _this = _possibleConstructorReturn(this, (MemMonitor.__proto__ || Object.getPrototypeOf(MemMonitor)).call(this));

        _this.exclude = options.exclude || [];
        _this.limit = options.limit || DEFAULT_LIMIT;
        _this.opts = (0, _utils.parseOptions)(MEM_OPTS, options);
        _this.top = _child_process2.default.spawn('/usr/bin/top', _this.opts);

        if (process.env.NODE_ENV !== 'test') {
            _this.onData();
        }

        _this.onExit();
        return _this;
    }

    _createClass(MemMonitor, [{
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
            var memUsage = this.parseMemUsage(data);

            if (memUsage) {
                this.emit('memUsage', memUsage);
            }

            var topMemProcs = this.parseTopMemProcs(data);

            if (topMemProcs) {
                this.emit('topMemProcs', topMemProcs);
            }
        }
    }, {
        key: 'parseMemUsage',
        value: function parseMemUsage(data) {
            var _this4 = this;

            var usage = void 0;
            var lines = data.split('\n');
            var regex = / +(\d+.) +used.*\((\d+.) +wired.* +(\d+.) +unused/;

            lines.forEach(function (line) {
                var matches = regex.exec(line);

                if (matches && matches.length >= 3) {
                    usage = {
                        used: matches[1],
                        wired: matches[2],
                        unused: matches[3],
                        used_kb: _this4.parseMemInKb(matches[1]),
                        wired_kb: _this4.parseMemInKb(matches[2]),
                        unused_kb: _this4.parseMemInKb(matches[3])
                    };
                }
            });

            return usage;
        }
    }, {
        key: 'parseTopMemProcs',
        value: function parseTopMemProcs(data) {
            var procs = [];
            var regex = /^(\d+)\s+(\w+).?\s+(.*)$/mg;
            var matches = regex.exec(data);

            while (matches) {
                if (!matches || matches.length < 4 || procs.length >= this.limit || this.exclude.indexOf(matches[3].trim()) > -1 // exclude this proc from results
                ) continue;

                procs.push({
                    pid: matches[1],
                    mem: matches[2],
                    command: matches[3].trim()
                });

                matches = regex.exec(data);
            }

            return procs;
        }
    }, {
        key: 'parseMemInKb',
        value: function parseMemInKb(mem) {
            var num = Number(mem.substring(0, mem.length - 1));

            if (mem.charAt(mem.length - 1) === 'M') {
                return num * 1024;
            } else if (mem.charAt(mem.length - 1) === 'G') {
                return num * 1024 * 1024;
            } else if (mem.charAt(mem.length - 1) === 'K') {
                return num;
            }
        }
    }]);

    return MemMonitor;
}(_events.EventEmitter);

exports.default = MemMonitor;
//# sourceMappingURL=memory.js.map