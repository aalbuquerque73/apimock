/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var CONFIG = require('config');

var _ = require('underscore'),
    WriteFile = CONFIG.util.path.require('api/domain/write-file'),
    events = CONFIG.util.path.require('api/utils/events/file');

module.exports = function (req, res) {
    var config;
    var list = {};
    var eventList = [];
    
    _.each(req.body, function (json, key) {
        config = JSON.parse(json);
        CONFIG.util.logger.info('[domain:post] save file', config.name);
        list['file' + (key + 1)] = config;
        WriteFile(config);
        eventList.push(config.href);
    });
    
    events.changed(eventList);

    res.setHeader('Content-Type', 'application/json');
    res.send(['OK', list]);

    return true;
};