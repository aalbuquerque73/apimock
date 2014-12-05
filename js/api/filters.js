/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var CONFIG = require('config');

var pd = require('pretty-data').pd,
    _ = require('underscore');

function log() {
    CONFIG.util.logger.info.apply(CONFIG.util.logger, arguments);
}

var filters = {
    escape: function (data) { return data.replace(/([\.\[\(\$\?\+\*\\])/g, '\\$1'); },
    regexp: function (data) { return data.replace(/&rx;(.*?)&rx;/g, function (match, param) {return param.replace(/\\(?!\\)/g, ''); }); },
    newline: function (data) { return data.replace(/\r?\n/g, ' '); },
    
    xml: {
        format: function (data) { return pd.xml(data, true); },
        whitespace: function (data) { return pd.xmlmin(data, true); },
        comments: function (data) { return pd.xml(data); },
        all: function (data) { return pd.xmlmin(data); }
    },
    json: {
        format: function (data) { return pd.json(data, true); },
        whitespace: function (data) { return pd.jsonmin(data, true); },
        comments: function (data) { return pd.json(data); },
        all: function (data) { return pd.xmlmin(data); }
    },
    css: {
        format: function (data) { return pd.css(data, true); },
        whitespace: function (data) { return pd.cssmin(data, true); },
        comments: function (data) { return pd.css(data); },
        all: function (data) { return pd.xmlmin(data); }
    }
};

function parse(text, variables) {
    return text.replace(/\$\{(.*?)\}/g, function(match, p, offset) {
        if (variables.hasOwnProperty(p)) {
            return variables[p];
        }
        return p;
    });
}

function execFilter(text, filter, variables) {
    var list = filter.split('.');
    var fl = filters;
    
    _.every(list, function (p) {
        //CONFIG.util.logger.info('[execFilter]', p);
        var param = parse(p, variables);
        if (fl.hasOwnProperty(param)) {
            fl = fl[param];
            return true;
        }

        return false;
    });
    if (typeof fl === "function") {
        //CONFIG.util.logger.info('[execFilter] filter found', fl);
        return fl(text);
    }
    return text;
}

function applyFilters(data, filterList, variables) {
    if (filterList) {
        var result = data;
        _.each(filterList, function (filter) {
            result = execFilter(result, filter, variables);
        });
        return result;
    }
    return data;
}

module.exports = {
    filters: filters,
    exec: execFilter,
    apply: applyFilters
};