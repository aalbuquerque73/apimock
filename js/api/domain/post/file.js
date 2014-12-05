/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var CONFIG = require('config');

var fs = require('fs'),
    path = require('path');

module.exports = function (req, res, Config) {
    CONFIG.util.logger.info('[post/file]', Config.api, req.body);
    var resp = {};

    if (fs.existsSync(req.body.file)) {
        CONFIG.util.logger.info('[domain:post] file', req.body.name, 'found!');
        resp.file1 = {
            name: req.body.name,
            href: req.body.file,
            content: fs.readFileSync(req.body.file, { encoding: 'utf8' })
        };
    }
    var options = Config.api[req.body.api],
        requestPattern = options.patterns && options.patterns.request ? options.patterns.request : 'request_',
        responsePattern = options.patterns && options.patterns.response ? options.patterns.response : 'response_';
    if (req.body.file.indexOf(requestPattern) > -1) {
        var resFile = req.body.file.replace(requestPattern, responsePattern);
        if (fs.existsSync(resFile)) {
            CONFIG.util.logger.info('[domain:post] file', path.basename(resFile), 'found!');
            resp.file2 = {
                name: path.basename(resFile),
                href: resFile,
                content: fs.readFileSync(resFile, { encoding: 'utf8' })
            };
        }
    }

    resp.basename = path.basename(req.body.name, path.extname(req.body.name)).replace(requestPattern, '');
    res.setHeader('Content-Type', 'application/json');
    res.send(resp);
};