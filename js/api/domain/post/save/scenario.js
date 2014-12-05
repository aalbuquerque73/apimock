/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var CONFIG = require('config');

var _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    WriteFile = CONFIG.util.path.require('api/domain/write-file'),
    globalConfig = CONFIG.util.path.require('settings'),
    events = CONFIG.util.path.require('api/utils/events/file');

module.exports = function(req, res, Config) {
    Config.scenario = req.body.scenario;
    var config = {};
    config[req.body.config] = {
        scenario: req.body.scenario
    };
    res.setHeader('Content-Type', 'application/json');
    fs.readFile(path.join(globalConfig.app.root, 'config/runtime.json'), { encoding: 'utf8' }, function(err, data) {
        if (err) {
            CONFIG.util.logger.error('[domain:post:save:scenario] Error', err);
            res.status(404).send(['ERR', err]);
            return;
        }

        var json = JSON.parse(data);
        _.extend(json, config);
        WriteFile({
            name: 'runtime.json',
            href: path.join(globalConfig.app.root, 'config/runtime.json'),
            content: JSON.stringify(json, null, '\t'),
            callback: function(err) {
                if (err) {
                    CONFIG.util.logger.error('[domain:post:save:server] Error', err);
                    res.status(404).send(['ERR', err]);
                    return;
                }
                
                events.changed([ path.join(globalConfig.app.root, 'config/runtime.json') ]);
                res.send(['OK', Config]);
            }
        });
    });

    return true;
};