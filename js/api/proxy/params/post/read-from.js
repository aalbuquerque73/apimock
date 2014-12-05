/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var CONFIG = require('config');

var _ = require('underscore'),
    fs = require('fs'),
    Q = require('q'),
    path = require('path'),
    glob = require('glob'),
    filters = CONFIG.util.path.require('api/filters');

module.exports = function(options, Config) {
    var deferred = Q.defer(),
        method = options.params.method,
        api = options.params.api;
    
    if (Config.api.hasOwnProperty(method)) {
        var apiConfig = Config.api[method];
        var folder = CONFIG.util.path.resolve('../data', apiConfig.source);
        
        var patterns = {
                request: 'request_',
                response: 'response_'
            },
            search = path.resolve(folder, patterns.request + '*' + (apiConfig.extension || '.*')),
            list = glob.sync(search);
        
        Q.allSettled(_.map(list, function(file) {
            var deferredFind = Q.defer();
            fs.readFile(file, {encoding:'utf8'}, function(err, data) {
                if (err) {
                    deferredFind.reject(new Error(err));
                    return;
                }
                
                var contents = data,
                    body = options.raw,
                    variables = { 'content-type': path.extname(file).replace('.','') };
                
                if (apiConfig.options && apiConfig.options.filters) {
                    
                    if (apiConfig.options.filters.read) {
                        contents = filters.apply(contents, apiConfig.options.filters.read, variables);
                        body = filters.apply(body, apiConfig.options.filters.read, variables);
                    }
                    if (apiConfig.options.filters.match) {
                        contents = filters.apply(contents, apiConfig.options.filters.match, variables);
                    }
                }
                var pattern = new RegExp(contents, 'im');
                var match = pattern.exec(body);

                if (match) {
                    deferredFind.resolve({
                        type: variables['content-type'],
                        request: file
                    });
                    return;
                }

                deferredFind.reject(new Error('file not found!'));
            });
            
            return deferredFind.promise;
        }))
        .then(function(found) {
            var res = _.find(found, function(file) {
                if (file.state === 'fulfilled') {
                    deferred.resolve(file.value);
                    return true;
                }
                return false;
            });
            
            CONFIG.util.logger.info('[proxy.params.post.read-from] reject/resolved', res);
            if (!res) {
                CONFIG.util.logger.info('[proxy.params.post.read-from] reject', res);
                deferred.reject(new Error('Not Found!'));
            }
        })
        .fail(function(err) {
            CONFIG.util.logger.info('[proxy.params.post.read-from] error reject', err);
            deferred.reject(err);
        });
    }
    
    return deferred.promise;
};