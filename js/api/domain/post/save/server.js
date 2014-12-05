/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var CONFIG = require('config');

var _ = require('underscore'),
    fs = require('fs'),
    WriteFile = CONFIG.util.path.require('api/domain/write-file'),
    globalConfig = CONFIG.util.path.require('settings');

module.exports = function(req, res, Config) {
    var config = {
        server: req.body
    };
    CONFIG.util.logger.info('[domain:post:save:server] body', req.body);
    res.setHeader('Content-Type', 'application/json');
    fs.readFile(globalConfig.app.root + '/config/runtime.json', { encoding: 'utf8' }, function(err, data) {
        if (err) {
            CONFIG.util.logger.error('[domain:post:save:server] Error', err);
            res.status(404).send(['ERR', err]);
            return;
        }

        var json = JSON.parse(data);
        _.extend(json, config);
        CONFIG.util.logger.info('[domain:post:save:server] data', json);
        WriteFile({
            name: 'runtime.json',
            href: globalConfig.app.root + '/config/runtime.json',
            content: JSON.stringify(json, null, '\t'),
            callback: function(err) {
                CONFIG.util.logger.info('[domain:post:save:server] data', globalConfig.server);
            }
        });
        res.send(['OK', globalConfig.server]);
    });

    return true;
};