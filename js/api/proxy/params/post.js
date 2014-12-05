/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var CONFIG = require('config'),
    path = require('path'),
    fs = require('fs'),
    Q = require('q'),
    saveFile = require('./post/save-file'),
    readFrom = require('./post/read-from'),
    requestFrom = require('./post/request-from');

function mimeTypeFromExtension(extension) {
    var mimeTypes = {
        xml: 'text/xml',
        json: 'application/json',
        css: 'text/css'
    };
    
    if (mimeTypes.hasOwnProperty(extension)) {
        return mimeTypes[extension];
    }
    return 'text/plain';
}

module.exports = function(req, res, Config) {
    var options = {
        url: req.url,
        query: req.query,
        params: req.params,
        body: req.body,
        raw: req.rawBody,
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
            CONFIG.util.logger.info('[post] file', path.basename(file.request), 'found!');
        }
        var response = file.request.replace('request_', 'response_');
        var deferred = Q.defer();
        fs.readFile(response, { encoding: 'utf8' }, function(err, data) {
            if (err) {
                if (debug.found) {
                    CONFIG.util.logger.info('[post] error reading file', path.basename(file.request), '!', err);
                }
                deferred.reject(file);
                return;
            }
            deferred.resolve(true);
            res.send(data);
        });
        
        return deferred.promise;
    })
    .fail(function(err) {
        if (debug.not.found) {
            CONFIG.util.logger.info('[post] file not found! requesting it from', url);
        }
        
        requestFrom(options, Config)
        .then(function(r) {
            r.request = err.request;
            saveFile(r, options, Config);
            res.send(r.body);
        })
        .fail(function(error) {
            res.status(404).send(error);
        });
    });
};