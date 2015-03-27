/*jslint node: true, nomen: true, regexp: true, vars: true */
'use strict';

var path = require('path'),
	mkdirp = require('mkdirp'),
    winston = require('winston');

winston.emitErrs = true;

var root = path.resolve(__dirname.replace(/\\/g, '..')),
    logname = path.resolve(root, 'logs/all-logs.log');

mkdirp(path.dirname(logname));

var logger = new winston.Logger({
    transports: [
        new winston.transports.File({
            level: 'info',
            filename: logname,
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

//module.exports = logger;
module.exports.stream = {
    write: function (message, encoding) {
        logger.info(message);
    }
};
module.exports.log = function() {
    var args = Array.prototype.slice.call(arguments);
    logger.log('verbose', args.join(' '));
};