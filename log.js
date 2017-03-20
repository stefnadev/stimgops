'use strict';
const log4js = require('log4js');

module.exports = log4js.getLogger;

module.exports.setFile = function(file) {
	const env = process.env.NODE_ENV || 'development';
	const level = env === 'dev' ? 'debug' : 'info';
	if (level !== 'debug') {
		log4js.loadAppender('file');
		log4js.addAppender(log4js.appenders.file(file));
		log4js.setGlobalLogLevel(level);
	}
};
