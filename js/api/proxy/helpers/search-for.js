/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var CONFIG = require('config');

var fs = require('fs'),
    Q = require('q'),
    _ = require('underscore'),
    filters = CONFIG.util.path.require('api/filters');

function searchFor(body, scenario, config, fileList) {
    var deferred = Q.defer();
    var resolved = false;
    
    if (fileList && fileList.length > 0) {
        
        _.every(fileList, function (filePath) {
            var contents = filters.apply(
                filters.apply(fs.readFileSync(filePath, { encoding: 'utf8' }), config.filter),
                config.matchFilter
            );
            var pattern = new RegExp(contents, 'im');
            var match = pattern.exec(filters.apply(body, config.filter));

            if (match) {
                deferred.resolve({
                    type: config.type,
                    request: filePath
                });

                resolved = true;
                return false;
            }

            return true;
        });
    }
        
    if (!resolved) {
        deferred.reject(new Error('Request not found!'));
    }
    return deferred.promise;
}

module.exports = searchFor;