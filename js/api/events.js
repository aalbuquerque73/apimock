/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var startsWith = require('./utils/starts-with');

var URL = require('url'),
    _ = require('underscore'),
	events = require('./utils/events/file'),
    globalConfig = require('../settings');

function Api() {
	this.methods = ['get'];
    this._list = [];
    
    events.onAdded(function(files) {
        console.log('[events:add]', arguments);
        this._list.push({
            event: 'new',
            files: files
        });
    }.bind(this));
    events.onChanged(function(files) {
        console.log('[events:change]', arguments);
        this._list.push({
            event: 'change',
            files: files
        });
    }.bind(this));
    events.onRemoved(function(files) {
        console.log('[events:remove]', arguments);
        this._list.push({
            event: 'remove',
            files: files
        });
    }.bind(this));
    events.onRenamed(function(files) {
        console.log('[events:renamed]', arguments);
        this._list.push({
            event: 'rename',
            files: files
        });
    }.bind(this));
}
Api.prototype = {
    get: function (req, res) {
        // let request last as long as possible
        req.socket.setTimeout(Infinity);
        
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        res.write('\n');
        
        _.each(this._list, function(item) {
            res.write('event: ' + item.event + '\n');
            res.write('data: ' + JSON.stringify(item.files) + '\n\n');
        });
        
        res.end();
        this._list = [];
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