/*'use strict';

const env = process.env.NODE_ENV || 'development';
const winston = require('winston');
winston.level = env === 'dev' ? 'debug' : 'info';

winston.loggers.options.transports = [
	new (winston.transports.File)({
		filename: 'server.log',
		json: false,
		timestamp: true,
		level: 'info'
	}),
	new (winston.transports.Console)({
		level: winston.level,
		json: false,
		timestamp: true,
		colorize: true
	})
];
module.exports = winston;*/
'use strict';
const env = process.env.NODE_ENV || 'development';
const log4js = require('log4js');
let level = env === 'dev' ? 'debug' : 'info';
if (level !== 'debug') {
	log4js.loadAppender('file');
	log4js.addAppender(log4js.appenders.file('server.log'));
	log4js.setGlobalLogLevel(level);
}

module.exports = log4js.getLogger;
