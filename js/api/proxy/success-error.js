/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var CONFIG = require('config');

function successOrError(err, filename, debug) {
    //CONFIG.util.logger.info('[successOrError]', arguments);
    if (err) {
        CONFIG.util.logger.error('Error saving', filename);
        CONFIG.util.logger.error(err);
        return;
    }

    if (debug) {
        CONFIG.util.logger.info('[get:save] file', filename, 'saved.');
    }
}

module.exports = successOrError;