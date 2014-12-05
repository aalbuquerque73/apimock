/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var CONFIG = require('config');

var _ = require('underscore'),
    glob = require('glob'),
    path = require('path'),
    globalConfig = CONFIG.util.path.require('settings');

var handlersPath = glob.sync(path.join(globalConfig.app.root, 'js/api/domain/post/save/*.js')),
    handlers = {};

_.each(handlersPath, function(filepath) {
    var key = path.basename(filepath, path.extname(filepath));
    handlers[key] = require(filepath);
});

module.exports = function(req, res, Config) {
    if (req.query.type && handlers.hasOwnProperty(req.query.type)) {
        if (handlers[req.query.type].call(this, req, res, Config)) {
            return;
        }
    }

    CONFIG.util.logger.warn('[domain:post:save] action not handled', req.query.type);
    res.setHeader('Content-Type', 'application/json');
    res.send(['[domain:post] save', req.query, req.body], 404);
};