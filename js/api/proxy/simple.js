/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var CONFIG = require('config');

// API router
var globalConfig = CONFIG.util.path.require('settings');

var Utils = CONFIG.util.path.require('utils'),
    handlers = CONFIG.util.path.require('api/handlers'),
    filters = CONFIG.util.path.require('api/filters'),
    successOrError = require('./success-error');

//Configuration
var Config = globalConfig.Configs.proxy;
var httpMethods = {
    get: require('./simple/get'),
    post: require('./simple/post')
};

function Api() {
	this.methods = ['get', 'post'];
}
Api.prototype = {
	get: function(req, res) {
        return httpMethods.get(req, res, Config);
    },
	
	post: function (req, res) {
        return httpMethods.post(req, res, Config);
	},
    
    init: function (options) {
        var list = options.target.split('/');
        this.page = list[list.length - 1];
        if (options.config) {
            Config = globalConfig.Configs[options.config];
        }
    }
};

module.exports = new Api();