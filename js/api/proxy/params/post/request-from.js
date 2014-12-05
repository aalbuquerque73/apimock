/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var CONFIG = require('config');

var fs = require('fs'),
    Q = require('q'),
    request = require('request'),
    parse = CONFIG.util.path.require('api/proxy/params/parser');

module.exports = function(options, Config) {
    var deferred = Q.defer(),
        method = options.params.method,
        api = options.params.api;
        if (api) {
            api = '/' + api;
        } else {
            api = '';
        }
    
    if (Config.api.hasOwnProperty(method)) {
        var apiConfig = Config.api[method];
        
        var req = {
                url: apiConfig.href,
                body: options.raw
            },
            callback = function(error, response, body) {
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
            };
        
        request.post(req, callback);
    }
    
    return deferred.promise;
};