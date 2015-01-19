/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var CONFIG = require('config'),
    path = require('path'),
	mkdirp = require('mkdirp'),
    fs = require('fs'),
    readFrom = require('./get/read-from'),
    requestFrom = require('./get/request-from'),
    fileNaming = require('./get/file-naming'),
    parser = CONFIG.util.path.require('api/parser'),
    WriteFile = CONFIG.util.path.require('api/domain/write-file');

module.exports = function(req, res, Config) {
    var options = {
        url: req.url,
        query: req.query,
        params: req.params,
        body: req.body,
        route: req.route,
        config: Config
    };
    var debug = {
        found: false,
        not: {
            found: false
        },
        saving: false
    };
    
    if (Config.options && Config.options.debug) {
        if (typeof Config.options.debug.found === 'boolean') {
            debug.found = Config.options.debug.found;
        }
        if (Config.options.debug.not && typeof Config.options.debug.not.found === 'boolean') {
            debug.not.found = Config.options.debug.not.found;
        }
        if (typeof Config.options.debug.saving === 'boolean') {
            debug.saving = Config.options.debug.saving;
        }
    }
    var method = options.params.method;
    var url = '[not specified]';
    if (Config.api.hasOwnProperty(method)) {
        var apiConfig = Config.api[method];
        
        url = apiConfig.href;
        if (apiConfig.options && apiConfig.options.debug) {
            if (typeof Config.options.debug.found === 'boolean') {
                debug.found = apiConfig.options.debug.found;
            }
            if (apiConfig.options.debug.not && typeof apiConfig.options.debug.not.found === 'boolean') {
                debug.not.found = apiConfig.options.debug.not.found;
            }
            if (typeof apiConfig.options.debug.saving === 'boolean') {
                debug.saving = apiConfig.options.debug.saving;
            }
        }
    }
    
    readFrom(options, Config)
    .then(function(file) {
        if (debug.found) {
            CONFIG.util.logger.info('[get] file', path.basename(file.filename), 'found!');
        }
        res.setHeader('Content-Type', file.type);
        res.send(file.content);
    })
    .fail(function(err) {
        if (debug.not.found) {
            CONFIG.util.logger.info('[get] file not found! requesting it from', url);
        }
        requestFrom(options, Config)
        .then(function(r) {
            var filename = fileNaming(options, Config);
            mkdirp.sync(path.dirname(filename));
            if (debug.saving) {
                CONFIG.util.logger.info("[get] saving file '" + path.basename(filename) + "'");
            }
            WriteFile({
                name: path.basename(filename),
                href: filename,
                content: r.body
            });
            res.setHeader('Content-Type', r.type);
            if (parser.has(r.type)) {
                res.send(parser.apply(r.type, r.body));
            } else {
                res.send(r.body);
            }
        }, function(error) {
            CONFIG.util.logger.error('[proxy.params.get] failure', error);
            res.status(404).send(error);
        });
    });
};