/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var _ = require('underscore'),
    path = require('path'),
    glob = require('glob'),
    startsWith = require('../utils/starts-with');

module.exports = function (folder, options) {
    var responsePattern = options.patterns && options.patterns.response ? options.patterns.response : 'response_',
        extension = (options.extension || '.*'),
        searchPattern = path.join(folder, '*' + extension),
        files = glob.sync(searchPattern),
        fileList = [];

    _.each(files, function (file) {
        var basename = path.basename(file);
        if (basename.startsWith(responsePattern)) {
            return;
        }
        fileList.push({ name: basename, file: file});
    });
    
    return fileList;
};