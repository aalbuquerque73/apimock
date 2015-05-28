var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    _ = require('underscore'),
    config = require('config'),
    MQ = require('../message-queue');

function Folders() {
    this.base = './data';
    
    this.path = 'null';
}

Folders.prototype = {
    init: function() {
        MQ.publish('main:folder', function(folder) {
            this.path = path.join(folder, this.base);
            _.each(config.get('routes'), function(route) {
                var routeName = (route.name || route.folder || '') + path.sep;
                this[routeName] = this.path;
                if (route.folder) {
                    this[routeName] = path.join(this.path, route.folder);
                }
                if (Array.isArray(route.proxies)) {
                    _.each(route.proxies, function(proxy) {
                        if (proxy.folder) {
                            var name = path.join(routeName, proxy.name || proxy.folder || 'proxy');
                            this[name] = path.join(this[routeName], proxy.folder);
                            if (!fs.existsSync(this[name])) {
                                mkdirp.sync(this[name]);
                            }
                        }
                    }, this);
                }
                if (!fs.existsSync(this[routeName])) {
                    mkdirp.sync(this[routeName]);
                }
            }, this);
        }.bind(this));
    },
    
    reset: function() {
        _.each(this, function(val, key) {
            delete this[key];
        }, this);
        
        this.base = './data';
        this.path = 'null';
    }
};

module.exports = new Folders();