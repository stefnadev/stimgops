"use strict";

const express = require('express');
const multer = require('multer');
const upload = multer({
	storage: multer.memoryStorage()
}).single('img');
const optimizer = require('./optimizer');
const log = require('./log');
const logger = log();

const app = express();

const appOptions = {
	maxWidth: 2000,
	concurrency: 2,
	logFile: 'server.log'
};

let numWorking = 0;

const doOptimize = function(err, req, res) {
	if (numWorking >= appOptions.concurrency) {
		res.status(503).send('Too busy').end();
		logger.warn("Too many connected, rejecting");
		return;
	}
	numWorking++;
	logger.debug("New upload request", {
		method: req.method,
		url: req.originalUrl,
		mime: req.file.mimetype,
		numWorking: numWorking
	});
	if (err) {
		res.writeHead(400, {'Content-Type': 'text/plain'});
		res.end('ERROR:' + err + "\n");
		--numWorking;
		logger.warn('Upload error: ' + err, req.originalUrl);
		return;
	}
	let size = req.file.buffer.length;
	optimizer(req, appOptions, function(err, ret) {
		logger.debug("ServerResponding to optimization");
		if (err) {
			// Setting a 400 error so curl will not retry
			res.status(400).set('Content-Type', 'text/plain').send(err + "\n").end();
			--numWorking;
			logger.error('Optimization error: ' + err, req.originalUrl);
			return;
		}
		if (!ret.data) {
			// Nothing done for the file
			res.status(204).set('Content-Type', 'text/plain').end();
			--numWorking;
			logger.info('No optimization', req.originalUrl);
			return;
		}

		let total = optimizer.perc(size, ret.data.length);

		res.status(200);
		res.set('Content-Type', ret.contentType);
		res.set('ST-Img-Result', [ret.shrink, ret.optimize, total].join(';'));
		res.send(ret.data);
		res.end();
		logger.info("Optimized", [req.originalUrl, ret.contentType, ret.shrink, ret.optimize, total].join(', '));
		--numWorking;
	});
};

app.get('/ping', function(req, res) {
	logger.info('ping');
	res.status(204).set('Content-Type', 'text/plain').end();
});
app.get('/\*', function(req, res) {
	logger.notice('Bad request: ' + req && req.originalUrl ? req.originalUrl : '');
	res.status(400).set('Content-Type', 'text/plain').end();
});

app.post('/\*', function(req, res) {
	try {
		upload(req, res, function(err) {
			doOptimize(err, req, res);
		});
	}
	catch(e) {
		--numWorking;
		logger.alert("Error", {
			url: req.originalUrl,
			e: e
		});
		res.status(503)
			.set('Content-Type', 'text/plain')
			.send("ERROR: " + e.getMessage())
			.end();
	}
});

module.exports = function(options) {
	// remove undefined
	Object.keys(options).forEach(key => options[key] === undefined && delete options[key]);
	options = Object.assign(appOptions, options);
	log.setFile(options.logFile);
	app.listen(options.port, function() {
		logger.debug("Now listening for requests", {
			opts: options
		});
	});
};
