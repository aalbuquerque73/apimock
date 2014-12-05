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
    
    _.every(config.methods.post, function (method) {
        if (url.query.hasOwnProperty(method) && config.api.hasOwnProperty(method)) {
            handled = true;
            scenarios.for.post(req.rawBody, config.scenario, config.api[method], function(data) {
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
                
                fs.readFile(data.response, {encoding: 'utf8'}, function(err, content) {
                    if (err) {
                        mkdirp.sync(path.dirname(data.response));
                        var r = {url: config.api[method].href, body: req.rawBody};
                        if (localDebug.not.found) {
                            CONFIG.util.logger.info('[post] file not found! requesting it from', r.url);
                        }
                        request.post(r, function(error, response, body) {
                            if (error) {
                                CONFIG.util.logger.error('[post]', error);
                                res.send(error, 404);
                                return;
                            }
                            var requestExists = fs.existsSync(data.request);
                            
                            var ct = response.headers['content-type'].split(';')[0];

                            if (localDebug.saving) {
                                CONFIG.util.logger.info('[post] saving file', path.basename(data.request), ',', path.basename(data.response));
                            }
                            if (handlers.has(ct)) {
                                fs.writeFile(data.request,
                                             handlers.apply(ct, req.rawBody),
                                             { encoding: 'utf8' },
                                             function (err) { successOrError(err, 'request'); });
                                fs.writeFile(data.response,
                                             handlers.apply(ct, body),
                                             { encoding: 'utf8' },
                                             function (err) { successOrError(err, 'response'); });
                            } else {
                                fs.writeFile(data.request, req.rawBody, { encoding: 'utf8' }, function (err) { successOrError(err, 'request'); });
                                fs.writeFile(data.response, body, { encoding: 'utf8' }, function (err) { successOrError(err, 'response'); });
                            }
                            if (requestExists) {
                                events.changed([ data.request ]);
                                events.added([ data.response ]);
                            } else {
                                events.added([
                                    data.request,
                                    data.response
                                ]);
                            }
                            
                            res.setHeader('Content-Type', ct);
                            res.send(body);
                        });
                        return;
                    }
                    
                    if (localDebug.found) {
                        CONFIG.util.logger.info('[post]', data.scenario, path.basename(data.request), 'found!');
                    }
                    if (data.type) {
                        res.setHeader('Content-Type', data.type);
                    }
                    res.send(content);
                });
            });

            return false;
        }

        return true;
    });

    if (!handled) {
        CONFIG.util.logger.warn('url:', url, 'content type:', req.headers['content-type'], 'body:', req.rawBody);
        res.send({url: url, body: req.body}, 405);
    }
};