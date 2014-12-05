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
    events = CONFIG.util.path.require('api/utils/events/file'),
    parse = CONFIG.util.path.require('api/proxy/params/parser'),
    Q = require('q');

function querify(value, name) {
    return name + '=' + value;
}

module.exports = function(options, Config) {
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
    
    var deferred = Q.defer(),
        method = options.params.method,
        api = options.params.api;
    if (Config.api.hasOwnProperty(method)) {
        var apiConfig = Config.api[method];
        if (api) {
            api = '/' + api;
        } else {
            api = '';
        }
        var url = apiConfig.href + api + '?' + _.map(options.query, querify).join('&');
        
        request.get(url, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                var ct = response.headers['content-type'].split(';')[0];
                
                deferred.resolve({
                    type: ct,
                    body: parse(ct, body)
                });
            } else {
                deferred.reject({
                    error: error,
                    response: body
                });
            }
        });
    } else {
        deferred.reject(new Error('API ' + api + ' not found!'));
    }
    
    return deferred.promise;
};