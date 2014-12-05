/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var globalConfig = require('../../settings');

module.exports = {
    post: {
        files: require('./post/files'),

        file: require('./post/file'),

        save: require('./post/save'),

        rename: require('./post/rename')
    }
};