# os-usage
A node module to watch system usage

### Installation

```
npm install https://github.com/ningt/os-usage.git
```

### Example Usage

```javascript
var usage = require('os-usage');

// create an instance of CpuMonitor
var cpuMonitor = new usage.CpuMonitor();

// watch cpu usage overview
cpuMonitor.on('cpuUsage', function(data) {
    console.log(data);
    
	// { user: '9.33', sys: '56.0', idle: '34.66' }
});

// watch processes that use most cpu percentage
cpuMonitor.on('topCpuProcs', function(data) {
    console.log(data);
    
	// [ { pid: '21749', cpu: '0.0', command: 'top' },
	//  { pid: '21748', cpu: '0.0', command: 'node' },
	//  { pid: '21747', cpu: '0.0', command: 'node' },
	//  { pid: '21710', cpu: '0.0', command: 'com.apple.iCloud' },
	//  { pid: '21670', cpu: '0.0', command: 'LookupViewServic' } ]
});

// exit monitor
cpuMonitor.emit('exit');


// create a new instance of MemMonitor
var memMonitor = new usage.MemMonitor();

// watch memory usage overview
memMonitor.on('memUsage', function(data) {
    console.log(data);
    
	// { used: '9377M', wired: '2442M', unused: '7005M' }
});

// watch processes that use most memory
memMonitor.on('topMemProcs', function(data) {
    console.log(data);
    
   	// [ { pid: '0', mem: '1521M', command: 'kernel_task' },
  	// { pid: '13718', mem: '319M', command: 'Safari' },
	// { pid: '332', mem: '173M', command: 'Google Drive' },
  	// { pid: '264', mem: '127M', command: 'Finder' },
  	// { pid: '21654', mem: '123M', command: 'MacDown' } ]
});

// exit monitor
memMonitor.emit('exit');
```

### Parameters
You can pass the following parameter when you initialize a monitor.

| Parameter | Description |
| --------- | ----------- |
| `limit` | number of processes to watch, default is `5` |
| `delay` | time interval in seconds to refesh stats, default is `1`|

Example:

```
var opts = {limit: 10, delay: 2};
var monitor = new usage.CpuMonitor(opts);
```