'use strict';

const usage = require('../index');

console.log('OS Usage');

var monitor1 = new usage.CpuMonitor();
monitor1.on('cpuUsage', function(data) {
    console.log(data);
});

monitor1.on('topCpuProcs', function(data) {
    console.log(data);
});

setTimeout(function() {
    monitor1.emit('exit');
}, 1000);

// memory monitor
var monitor2 = new usage.MemMonitor();
monitor2.on('memUsage', function(data) {
    console.log(data);
});

monitor2.on('topMemProcs', function(data) {
    console.log(data);
});

setTimeout(function() {
    monitor2.emit('exit');
}, 1000);
