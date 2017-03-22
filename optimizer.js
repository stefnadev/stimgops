"use strict";

const fs = require('fs');
const imagemin = require('imagemin');
const sharp = require('sharp');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPng = require('imagemin-optipng');
const clone = require('clone');
const logger = require('./log')('optimizer');

const NONE = 'None';

let shrink = function(data, maxWidth, cb) {
	let size = data.length;
	let copyData = clone(data);
	logger.debug("Shrink!", size);
	sharp(copyData).resize(maxWidth, maxWidth).max().toBuffer(function(err, buffer, info) {
		if (err) {
			cb(err);
			return;
		}
		if (info.size >= size) {
			logger.debug("Shrink did not help", {sizeIncrease: info.size - size});
			cb(null, data, NONE);
			return;
		}
		logger.debug("Sharp resize, done", info);
		cb(null, buffer, perc(size, info.size));
	});
};

let perc = function(before, after) {
	const ret = (((before - after) / before) * 100).toFixed(2) + '%';
	logger.debug('Perc', before, after, ret);
	return ret;
};

let optimize = function(data, cb) {
	let size = data.length;
	let copyData = clone(data);
	logger.debug("Optimize!", size);
	imagemin.buffer(copyData, {
		plugins: [
			imageminMozjpeg({
				quality: 85
			}),
			imageminPng({
				optimizationLevel: 2
			})
		]
	}).then(buffer => {
		logger.debug("Ok, imagemin returned me something", buffer.length);
		if (!buffer) {
			cb("Could not find imagemin buffer");
			return;
		}
		if (buffer.length >= size) {
			logger.debug("Optimize did not help", {sizeIncrease: buffer.length - size});
			cb(null, null, NONE);
			return;
		}
		cb(null, buffer, perc(size, buffer.length));
	}, (err) => {
		logger.debug("Error in imagemin", err);
		cb("Error in imagemin");
	});

};
module.exports = function(req, options, cb) {
	let ct = req.file.mimetype;
	let maxWidth = (options && options.maxWidth) ? options.maxWidth: 2000;
	let ret = {
		contentType: ct,
		shrink: null,
		optimize: null
	};

	logger.debug("Reading file", req.file.buffer.length);
	try {
		shrink(req.file.buffer, maxWidth, function(err, data, info) {
			if (err) {
				cb(err);
				return;
			}
			ret.shrink = info;
			optimize(data, function(err, data, info) {
				if (err) {
					cb(err);
					return;
				}
				logger.debug("Adding optz, and data");
				ret.optimize = info;
				ret.data = data;
				cb(null, ret);
			});
		});
	}
	catch (e) {
		cb(e.message);
	}
};
module.exports.perc = perc;
