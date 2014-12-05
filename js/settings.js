var _ = require('underscore'),
    path = require('path'),
    U = require('./utils'),
    Config = require('config');

var subscribable = {};

function setupArrayProperties(fn, attr, object) {
    if (typeof attr[fn] === 'function') {
        object[fn] = function() { attr[fn].apply(attr, arguments) };
        return;
    }
    Object.defineProperty(object, 'length', {
        get: function() {
            return attr.length;
        }
    });
}
function setupArray(attr, object) {
    _.each(['pop', 'push', 'length'], function(fn) {
        setupArrayProperties(fn, attr, object);
    }, this);
}

function setupProperties(key, value, object) {
    var properties = {
        get: function() {
            return object._attr[key];
        },
        enumerable: true
    };
    if (U.type(value) === 'array') {
        //console.log('[Property] array', key, U.type(value));
        object._attr[key] = [];
        _.each(value, function(v) {
            if (U.type(v) === 'object') {
                object._attr[key].push(new Property(v));
                return;
            }
            object._attr[key].push(v);
        });
    } else if (typeof value === 'object') {
        //console.log('[Property] object', key, U.type(value));
        object._attr[key] = new Property(value);
    } else {
        //console.log('[Property]', key, U.type(value));
        object._attr[key] = value;
        properties.set = function(v) {
            object._attr[key] = v;
        };
    }
    Object.defineProperty(object, key, properties);
}

function Property(config) {
    this._attr = {};
    
    Object.defineProperty(this, '_attr', {
        enumerable: false
    });

    _.each(config, function(value, key) {
        setupProperties(key, value, this);
    }, this);
}
Property.prototype = {
    applyDefaults: function(key, value) {
        if (value === undefined) {
            _.each(key, function(v, k) {
                this.applyDefaults(k, v);
            }, this);
            return;
        }
        
        if (this._attr.hasOwnProperty(key)) {
            this._attr[key].applyDefaults(value);
            return;
        }
        setupProperties(key, value, this);
    },
    
    toString: function() {
        return JSON.stringify(this);
    }
};


var root = path.resolve(__dirname.replace(/\\/g, "/"));
function Settings() {
    this._attr = {};
    Object.defineProperty(this, '_attr', {
        enumerable: false
    });
    
    _.each(Config, function(value, key) {
        setupProperties(key, value, this);
    }, this);
}
Settings.prototype = {
    util: {
        setModuleDefaults: function(key, value) {
            settings.applyDefaults(key, value);
            Config.util.setModuleDefaults(key, value);
        },
        
        path: {
            resolve: function() {
                return path.resolve.apply(path, [ root ].concat(Array.prototype.slice.call(arguments)));
            },
            require: function() {
                var file = this.util.path.resolve.apply(this, arguments);
                return require(file);
            }
        }
    },
    applyDefaults: function(key, value) {
        if (this._attr.hasOwnProperty(key)) {
            this._attr[key].applyDefaults(value);
            return;
        }
        setupProperties(key, value, this);
    },
    
    subscribe: function() {
        console.log('[Settings]');
    }
};
var settings = new Settings();
Config.util.path = {
    resolve: function() {
        return settings.util.path.resolve.apply(settings, arguments);
    },
    require: function() {
        return settings.util.path.require.apply(settings, arguments);
    }
};


module.exports = settings;
