/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var filters = require('./filters');

var handlers = {
    'text/xml': function (data) { return filters.apply(data, ['newline', 'xml.format']); },
    'application/json': function (data) { return filters.apply(data, ['newline', 'json.format']); },
    'text/css': function (data) { return filters.apply(data, ['newline', 'css.format']); },
    
    min: {  // TODO Is this ever used? If so, how is it accessed? (handlers.min returns undefined)
        'text/xml': function (data) { return filters.apply(data, ['newline', 'xml.all']); },
        'application/json': function (data) { return filters.apply(data, ['newline', 'json.all']); },
        'text/css': function (data) { return filters.apply(data, ['newline', 'css.all']); }
    }
};

module.exports = {
    handlers: handlers,
    has: function (handler) { return handlers.hasOwnProperty(handler) && typeof handlers[handler] === "function"; },
    apply: function (handler, data) { return handlers[handler](data); }
};