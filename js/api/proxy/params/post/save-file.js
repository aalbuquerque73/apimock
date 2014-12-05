/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var CONFIG = require('config');

var Q = require('q'),
    path = require('path'),
	mkdirp = require('mkdirp'),
	glob = require('glob'),
    _ = require('underscore'),
    filters = CONFIG.util.path.require('api/filters'),
    WriteFile = CONFIG.util.path.require('api/domain/write-file');

function extensionOf(ct, config) {
    var exts = {
        'text/xml': '.xml',
        'application/json': '.json',
        'text/css': '.css'
    };
    
    if (exts.hasOwnProperty(ct)) {
        return exts[ct];
    }
    
    return config.extension || '.txt';
}

module.exports= function(res, options, Config) {
    var content = res.body,
        method = options.params.method,
        api = options.params.api;
    
    if (Config.api.hasOwnProperty(method)) {
        var apiConfig = Config.api[method];
        var folder = CONFIG.util.path.resolve('../data', apiConfig.source);
        
        mkdirp.sync(folder);
        var patterns = {
                request: 'request_',
                response: 'response_'
            },
            fileList = [];
        if (res.request) {
            fileList = [
                {
                    href: res.request,
                    content: options.raw
                },
                {
                    href: res.request.replace(patterns.request, patterns.response),
                    content: res.body
                }
            ];
        } else {
            var search = path.resolve(folder, patterns.request + '*' + (apiConfig.extension || '.*')),
                list = glob.sync(search);
            fileList = [
                {
                    href: path.resolve(folder, patterns.request + list.length + extensionOf(res.type, apiConfig)),
                    content: options.raw
                },
                {
                    href: path.resolve(folder, patterns.response + list.length + extensionOf(res.type, apiConfig)),
                    content: res.body
                }
            ];
        }
        
        var name;
        _.each(fileList, function(file) {
            name = path.basename(file.href);
            file.name = name;
        });
        if (apiConfig.options && apiConfig.options.filters && apiConfig.options.filters.write) {
            var name;
            _.each(fileList, function(file, key) {
                file.content = filters.apply(file.content,
                                             apiConfig.options.filters.write,
                                             { 'content-type':res.type.split('/')[1] });
            });
        }
        
        return Q.all(_.map(fileList, WriteFile));
    }
    
    return Q.defer().reject(new Error('No configuration found!')).promise;
};