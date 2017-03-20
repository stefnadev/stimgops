#!/usr/bin/env node

'use strict';

const server = require('./server');

let program = require('commander');
program.version('0.1.0')
	.option('-p, --port <n>', 'Listening port', parseInt)
	.option('-m, --max-width <n>', 'Maximum width of images', parseInt)
	.option('-c, --concurrent <n>', 'Concurrent processes', parseInt)
	.option('-l, --log-file <s>', 'Logilfe')
	.parse(process.argv);

server({
	port: program.port || 8082,
	maxWidth: program.maxWidth || 2000,
	concurrency: program.concurrent || 2,
	logFile: program.logFile,
});
