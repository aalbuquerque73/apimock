/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var CONFIG = require('config');

var handlers = CONFIG.util.path.require('api/handlers');

function parse(ct, body) {
    if (handlers.has(ct)) {
        return handlers.apply(ct, body);
    }
    
    return body;
}

module.exports = parse;