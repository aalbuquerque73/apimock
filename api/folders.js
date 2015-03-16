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
            this[route.name] = path.join(this.path, route.folder);
            _.each(route.connectors, function(name) {
                var connectors = config.get('connectors');
                if (connectors.hasOwnProperty(name)) {
                    var connector = connectors[name];
                    this[name] = path.join(this[route.name], connector.folder);
                    if (!fs.existsSync(this[name])) {
                        mkdirp.sync(this[name]);
                    }
                }
            }, this);
            if (!fs.existsSync(this[route.name])) {
                mkdirp.sync(this[route.name]);
            }
        }, this);
    }.bind(this));
}

module.exports = Folders;