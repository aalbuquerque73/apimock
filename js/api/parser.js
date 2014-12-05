/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var filters = require('./filters');

var parsers = {
    'text/xml': function (data) { return data; },
    'application/json': function (data) { return JSON.parse(data); },
    'text/css': function (data) { return data; }
};

module.exports = {
    parsers: parsers,
    has: function (handler) { return parsers.hasOwnProperty(handler) && typeof parsers[handler] === "function"; },
    apply: function (handler, data) { return parsers[handler](data); }
};