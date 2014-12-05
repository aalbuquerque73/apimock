/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

if (typeof String.prototype.startsWith !== 'function') {
    // see below for better implementation!
    String.prototype.startsWith = function (str) {
        return this.indexOf(str) === 0;
    };
}

var URL = require('url'),
    _ = require('underscore'),
	glob = require('glob'),
    globalConfig = require('../settings');

function Api() {
	this.methods = ['get', 'post'];
}
Api.prototype = {
    handle: require('./domain/handlers'),
    
    get: function (req, res) {
        if (req.query.hasOwnProperty('config')) {
            res.send(globalConfig);
            return;
        }
        
        if (req.query.hasOwnProperty('route')) {
            if (globalConfig.Configs.hasOwnProperty(req.query.route)) {
                res.send(globalConfig.Configs[req.query.route]);
                return;
            }
            res.send(globalConfig.Configs);
            return;
        }
        
        res.send(globalConfig);
    },
    
    post: function (req, res) {
        if (req.query.hasOwnProperty('action')) {
            if (this.handle.post.hasOwnProperty(req.query.action)) {
                this.handle.post[req.query.action].call(this, req, res, globalConfig.Configs[req.body.config]);
                return;
            }
        }
        
        console.warn('[domain:post] action not handled', req.query.action);
        res.send('[domain:post] action not handled', 404);
    },
    
    init: function (options) {
        var list = options.target.split('/');
        this.page = list[list.length - 1];
    }
};

module.exports = new Api();