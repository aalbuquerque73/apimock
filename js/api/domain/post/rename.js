/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var CONFIG = require('config');

var path = require('path'),
    fs = require('fs'),
    events = CONFIG.util.path.require('api/utils/events/file');

module.exports = function(req, res) {
    //CONFIG.util.logger.info('[domain:post] rename', req.query, req.body);

    var config = req.body;
    if (config.basename && config.newBasename) {
        if (config.file1) {
            var file = path.join(path.dirname(config.file1.href), config.file1.name.replace(config.basename, config.newBasename));
            if (!fs.existsSync(file)) {
                var eventList = [];
                
                fs.renameSync(config.file1.href, file);
                eventList.push({
                    old: config.file1.href,
                    'new': file
                });
                
                CONFIG.util.logger.info('[domain:post] rename', file);
                config.file1.href = file;
                config.file1.name = path.basename(file);

                if (config.file2) {
                    var file = path.join(path.dirname(config.file2.href), config.file2.name.replace(config.basename, config.newBasename));
                    fs.renameSync(config.file2.href, file);
                    eventList.push({
                        old: config.file2.href,
                        'new': file
                    });
                    CONFIG.util.logger.info('[domain:post] rename', file);
                    config.file2.href = file;
                    config.file2.name = path.basename(file);
                }

                events.renamed(eventList);
                
                res.setHeader('Content-Type', 'application/json');
                res.send(['OK', config]);
                return;
            }

            console.warn('[domain:post] action not handled', config.newBasename, 'already exists');
            res.setHeader('Content-Type', 'application/json');
            res.send(['Error', config.newBasename + ' already exists'], 409);
            return;
        }
    }

    console.warn('[domain:post] action not handled', req.query.type);
    res.setHeader('Content-Type', 'application/json');
    res.send(['[domain:post] save', req.query, req.body], 404);
};