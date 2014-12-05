/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var CONFIG = require('config');

var fs = require('fs'),
    Q = require('q');

module.exports = function (config) {
    var deferred = Q.defer();
    fs.writeFile(config.href, config.content, function (err) {
        if (err) {
            CONFIG.util.logger.error(err);
            deferred.reject(new Error(err));
            config.callback && config.callback(err);
            return;
        }

        CONFIG.util.logger.info('[domain:WriteFile] file', config.name, 'saved.');
        deferred.resolve(config);
        config.callback && config.callback();
    });
    return deferred.promise;
};