/* eslint-disable */

'use strict';

var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var usage = require('../dist/index');

describe('cpu monitor', function() {
	before(function() {
		this.cpu = new usage.CpuMonitor();

		var cpu_data_file = path.resolve('test/mock/cpu2.txt');

		try {
			this.cpu_data = fs.readFileSync(cpu_data_file).toString();
		} catch(e) {
			console.error('Fail to read cpu mock data at %s.', cpu_data_file);
		}
	});

	after(function() {
		this.cpu.emit('exit');
	});

	it('should return correct cpu usage', function() {
		var usage = this.cpu.parseCpuUsage(this.cpu_data);

		expect(Object.keys(usage)).to.have.length(3);
		expect(usage.user).to.equal('3.35');
		expect(usage.sys).to.equal('2.75');
		expect(usage.idle).to.equal('93.89');
	});
});

describe('memory monitor', function() {
	before(function() {
		this.memory = new usage.MemMonitor();

		var mem_data_file = path.resolve('test/mock/memory.txt');

		try {
			this.mem_data = fs.readFileSync(mem_data_file).toString();
		} catch(e) {
			console.error('Fail to read cpu mock data at %s.', mem_data_file);
		}
	});

	after(function() {
		this.memory.emit('exit');
	});

	it('should return correct memory usage', function() {
		var usage = this.memory.parseMemUsage(this.mem_data);

		expect(Object.keys(usage)).to.have.length(6);
		expect(usage.used).to.equal('12G');
		expect(usage.wired).to.equal('2255M');
		expect(usage.unused).to.equal('4196M');
	});
});
