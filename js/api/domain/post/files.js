/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var CONFIG = require('config');

var globalConfig = CONFIG.util.path.require('settings'),
    _ = require('underscore'),
    path = require('path'),
    gatherFiles = require('../gather-files');

module.exports = function (req, res, Config) {
    var filePtr = req.body,
        options = Config.api[filePtr.api],
        scenarios = [ 'default' ],
        list = {
            scenarios: scenarios,
            config: filePtr,
            default: gatherFiles(path.normalize(path.join(globalConfig.app.data, options.source)), options)
        };
    if (options.scenarios) {
        _.each(options.scenarios, function(scenario, name) {
            if (name === 'active') {
                return;
            }
            scenarios.push(name);
            list[name] = gatherFiles(path.normalize(path.join(globalConfig.app.data, scenario.source)), options);
        });
    }
    //CONFIG.util.logger.info('[post] files:', list);
    res.send(list);
};