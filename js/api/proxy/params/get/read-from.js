/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var fs = require('fs'),
    Q = require('q'),
    fileNaming = require('./file-naming');

module.exports = function(options, Config) {
    var filename = fileNaming(options, Config);
    var deferred = Q.defer();
    
    if (filename) {
        var type = 'text/plain',
            method = options.params.method;
        
        if (Config.api.hasOwnProperty(method)) {
            var apiConfig = Config.api[method];
            
            type = apiConfig.type || type;
        }
        fs.readFile(filename, {encoding:'utf8'}, function(err, data) {
            if (err) {
                deferred.reject(new Error(err));
                return;
            }
            deferred.resolve({
                type: type,
                filename: filename,
                content: data
            });
        });
    } else {
        deferred.reject(new Error('Can not get name from config!'));
    }
    
    return deferred.promise;
};