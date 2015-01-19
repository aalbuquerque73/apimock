/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var _ = require('underscore'),
    path = require('path'),
    CONFIG = require('config');

function querify(value, name) {
    return name + '=' + value;
}

module.exports = function(options, Config) {
    var method = options.params.method,
        api = options.params.api || 'request';
    
    if (Config.api.hasOwnProperty(method)) {
        var apiConfig = Config.api[method];
        var filename = api + apiConfig.extension;
        if (Object.keys(options.query).length > 0 ) {
            filename = api + '(' + _.map(options.query, querify).join(',') + ')' + apiConfig.extension;
        }
        var file = path.resolve(CONFIG.app.root, 'data', apiConfig.source, filename);
        
        return file;
    }
    
    return null;
};

module.exports.querify = querify;