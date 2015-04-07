var _ = require('underscore'),
    fs = require('fs'),
    mkdirp = require('mkdirp'),
    path = require('path'),
    folders = require('./folders'),
    bodyParser = require('body-parser');

function joinIfArray(folder) {
    if (Array.isArray(folder)) {
        return folder.join(',');
    }
    return folder;
}

function Overrides() {
    this.save = {
        folders: function(proxy, route) {
            if (proxy.override && route.overrides) {
                if (Array.isArray(proxy.override) && proxy.override.length > 0) {
                    _.each(proxy.override, function(key, index) {
                        var override = route.overrides[key];
                        var name = override.name || override.folder || index || 'override';
                        override.name = path.join(proxy.name, name);
                        folders[override.name] = folders[proxy.name];
                        if (override && override.folder) {
                            folders[override.name] = path.join(folders[route.name], override.folder);
                            if (!fs.existsSync(folders[override.name])) {
                                mkdirp.sync(folders[override.name]);
                            }
                            return;
                        }
                    }, this);
                } else {
                    var override = route.overrides[proxy.override];
                    if (override) {
                        var name = override.name || joinIfArray(override.folder) || 'override';
                        if (!override.name) {
                            override.name = path.join(proxy.name, name);
                        }
                        if (!folders[override.name]) {
                            folders[override.name] = folders[proxy.name];
                            if (override.folder) {
                                if (Array.isArray(override.folder)) {
                                    folders[override.name] = [];
                                    folders[override.name].name = override.name;
                                    folders[override.name].index = 0;
                                    folders[override.name].time = new Date().getTime();
                                    folders[override.name].next = function() {
                                        ++this.index;
                                        if (this.index >= this.length) {
                                            this.index = 0;
                                        }
                                    }.bind(folders[override.name]);
                                    if (override.type === 'time' && override.delay > 0) {
                                        folders[override.name].next = function() {
                                            if (new Date().getTime() - this.time > override.delay) {
                                                this.time = new Date().getTime();
                                                ++this.index;
                                                if (this.index >= this.length) {
                                                    this.index = 0;
                                                }
                                            }
                                        }.bind(folders[override.name]);
                                    }
                                    if (override.type === 'static') {
                                        folders[override.name].next = function() {};
                                        folders[override.name].staticNext = function(index) {
                                            if (typeof index === 'string') {
                                                this.index = parseInt(index);
                                            } else {
                                                ++this.index;
                                            }
                                            if (this.index >= this.length) {
                                                this.index = 0;
                                            }
                                        }.bind(folders[override.name]);
                                    }
                                    folders[override.name].current = function() {
                                        return this[this.index];
                                    }.bind(folders[override.name]);
                                    _.each(override.folder, function(folder) {
                                        var oFolder = path.join(folders[route.name], folder);
                                        folders[override.name].push(oFolder);
                                        if (!fs.existsSync(oFolder)) {
                                            mkdirp.sync(oFolder);
                                        }
                                    }, this);
                                } else {
                                    folders[override.name] = path.join(folders[route.name], override.folder);
                                    if (!fs.existsSync(folders[override.name])) {
                                        mkdirp.sync(folders[override.name]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }.bind(this)
    };
    
    this.override = {
        if: {
            needed: function(patterns, proxy, that) {
                if (proxy.override) {
                    var override = proxy.override;
                    if (Array.isArray(proxy.override)) {
                    } else {
                        if (proxy.route.overrides && proxy.route.overrides[override]) {
                            override = proxy.route.overrides[override];
                            if (folders[override.name]) {
                                if (Array.isArray(folders[override.name])) {
                                    that.folder = folders[override.name].current();
                                    patterns.unshift(path.join(that.folder, '*.req'));
                                    folders[override.name].next()
                                } else {
                                    that.folder = folders[override.name];
                                    patterns.unshift(path.join(folders[override.name], '*.req'));
                                }
                            }
                        }
                    }
                }
            }. bind(this)
        }
    };
    
    function parser(req, res, next) {
        if (typeof req.body === 'string') {
            var body = {};
            var tokens = req.body.split('&');
            if (_.all(tokens, function(token) {
                var pair = token.split('=');
                body[pair[0]] = pair[1];
                return pair.length == 2;
            })) {
                req.raw = req.body;
                req.body = body;
            }
        }
        next();
    }
    
    this.apply = function(server) {
        server.post('/_overrides', parser, function(req, res, next) {
            if (folders.hasOwnProperty(req.body.path)) {
                if (folders[req.body.path].staticNext) {
                    folders[req.body.path].staticNext(req.body.index);
                    res.send('OK');
                    next();
                    return;
                }
            }
            res.status(404);
            res.send('Not found!');
            next();
        }.bind(this));
    };
    
    this.init = function() {
        folders.init();
    };
}

module.exports = new Overrides();