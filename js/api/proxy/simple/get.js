/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var CONFIG = require('config');

var URL = require('url'),
	mkdirp = require('mkdirp'),
	path = require('path'),
	_ = require('underscore'),
    fs = require('fs'),
    request = require('request'),
    successOrError = CONFIG.util.path.require('api/proxy/success-error'),
    handlers = CONFIG.util.path.require('api/handlers'),
    filters = CONFIG.util.path.require('api/filters'),
    scenarios = CONFIG.util.path.require('api/proxy/scenarios'),
    events = CONFIG.util.path.require('api/utils/events/file');

module.exports = function(req, res, config) {
    var start = req.url.indexOf('?');
    var url = URL.parse(req.url.replace(/\?/g, function (match, pos) {
        if (pos === start) {
            return match;
        }
        return '&';
    }), true);

    var handled = false;
    var debug = {
        found: false,
        not: {
            found: false
        },
        saving: false
    };
    if (config.options && config.options.debug) {
        if (typeof config.options.debug.found === 'boolean') {
            debug.found = config.options.debug.found;
        }
        if (config.options.debug.not && typeof config.options.debug.not.found === 'boolean') {
            debug.not.found = config.options.debug.not.found;
        }
        if (typeof config.options.debug.saving === 'boolean') {
            debug.saving = config.options.debug.saving;
        }
    }

    _.every(config.methods.get, function (method) {
        if (url.query.hasOwnProperty(method) && config.api.hasOwnProperty(method)) {
            var filename = url.search.replace('?' + method + '&', '');
            scenarios.for.get(filename, config.scenario, config.api[method], function(data) {
                mkdirp(path.dirname(data.write));
                
                var localDebug = JSON.parse(JSON.stringify(debug));
                var localOptions = config.api[method].options;
                if (localOptions && localOptions.debug) {
                    if (typeof localOptions.debug.found === 'boolean') {
                        localDebug.found = localOptions.debug.found;
                    }
                    if (localOptions.debug.not && typeof localOptions.debug.not.found === 'boolean') {
                        localDebug.not.found = localOptions.debug.not.found;
                    }
                    if (typeof localOptions.debug.saving === 'boolean') {
                        localDebug.saving = localOptions.debug.saving;
                    }
                }
                
                if (fs.existsSync(data.read)) {
                    if (localDebug.found) {
                        CONFIG.util.logger.info('[get] file', data.scenario, filename, 'found!');
                    }
                    fs.readFile(data.read, { encoding: 'utf8' }, function(err, data) {
                        if (err) {
                            res.send(err, 404);
                            return;
                        }
                        
                        if (config.api[method].type) {
                            res.setHeader('Content-Type', config.api[method].type);
                        }
                        res.send(data);
                    });
                    
                    return;
                }
                
                if (localDebug.not.found) {
                    CONFIG.util.logger.info('[get] file', filename, 'not found! requesting it from', data.href);
                }
                request(data.href + filename, function(error, response, body) {
                    if (!error && response.statusCode === 200) {
                        var ct = response.headers['content-type'].split(';')[0];

                        if (localDebug.saving) {
                            CONFIG.util.logger.info("[get] saving file '", filename, "'");
                        }
                        if (handlers.has(ct)) {
                            fs.writeFile(data.write, handlers.apply(ct, body), { encoding: 'utf8' }, function (err) { successOrError(err, filename); });
                        } else {
                            fs.writeFile(data.write, body, { encoding: 'utf8' }, function (err) { successOrError(err, filename); });
                        }
                        events.added([ data.write ]);

                        if (config.api[method].type) {
                            res.setHeader('Content-Type', config.api[method].type);
                        }
                        res.send(body);
                        return;
                    }

                    res.send({error: error, response: body});
                });
            });
            
            handled = true;
            return false;
        }

        return true;
    });

    if (!handled) {
        res.send(url, 404);
    }
};