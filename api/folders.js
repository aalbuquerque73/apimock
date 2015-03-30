var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    _ = require('underscore'),
    config = require('config'),
    MQ = require('../message-queue');

function Folders() {
    this.base = './data';
    
    this.path = 'null';
    
    MQ.publish('main:folder', function(folder) {
        this.path = path.join(folder, this.base);
        _.each(config.get('routes'), function(route) {
            this[route.name] = this.path;
            if (route.folder) {
                this[route.name] = path.join(this.path, route.folder);
            }
            if (Array.isArray(route.proxies)) {
                _.each(route.proxies, function(proxy) {
                    if (proxy.override && route.overrides) {
                        if (Array.isArray(proxy.override) && proxy.override.length > 0) {
                            _.each(proxy.override, function(key, index) {
                                var override = route.overrides[key];
                                var name = override.name || override.folder || index || 'override';
                                override.name = path.join(proxy.name, name);
                                this[override.name] = this[proxy.name];
                                if (override && override.folder) {
                                    this[override.name] = path.join(this[route.name], override.folder);
                                    if (!fs.existsSync(this[override.name])) {
                                        mkdirp.sync(this[override.name]);
                                    }
                                    return;
                                }
                            }, this);
                        } else {
                            var override = route.overrides[proxy.override];
                            var name = override.name || override.folder || 'override';
                            override.name = path.join(proxy.name, name);
                            this[override.name] = this[proxy.name];
                            if (override && override.folder) {
                                this[override.name] = path.join(this[route.name], override.folder);
                                if (!fs.existsSync(this[override.name])) {
                                    mkdirp.sync(this[override.name]);
                                }
                            }
                        }
                    }
                    if (proxy.folder) {
                        var name = path.join(route.name, proxy.name || proxy.folder || 'proxy');
                        this[name] = path.join(this[route.name], proxy.folder);
                        if (!fs.existsSync(this[name])) {
                            mkdirp.sync(this[name]);
                        }
                    }
                }, this);
            }
            if (!fs.existsSync(this[route.name])) {
                mkdirp.sync(this[route.name]);
            }
        }, this);
    }.bind(this));
}

module.exports = new Folders();