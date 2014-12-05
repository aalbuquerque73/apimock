/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var events = require('events'),
    eventEmitter = new events.EventEmitter();

function FileChanged() {
    events.EventEmitter.call(this);
    
    this.added = function() {
        this.emit.apply(this, ['added'].concat(Array.prototype.slice.call(arguments)));
    };
    this.changed = function() {
        this.emit.apply(this, ['changed'].concat(Array.prototype.slice.call(arguments)));
    };
    this.removed = function() {
        this.emit.apply(this, ['removed'].concat(Array.prototype.slice.call(arguments)));
    };
    this.renamed = function() {
        this.emit.apply(this, ['renamed'].concat(Array.prototype.slice.call(arguments)));
    };
    
    this.onAdded = function(callback) {
        this.on('added', callback);
    };
    this.onChanged = function(callback) {
        this.on('changed', callback);
    };
    this.onRemoved = function(callback) {
        this.on('removed', callback);
    };
    this.onRenamed = function(callback) {
        this.on('renamed', callback);
    };
}
FileChanged.prototype.__proto__ = events.EventEmitter.prototype;

FileChanged.added = function() {
    eventEmitter.emit.apply(eventEmitter, ['added'].concat(Array.prototype.slice.call(arguments)));
};
FileChanged.changed = function() {
    eventEmitter.emit.apply(eventEmitter, ['changed'].concat(Array.prototype.slice.call(arguments)));
};
FileChanged.removed = function() {
    eventEmitter.emit.apply(eventEmitter, ['removed'].concat(Array.prototype.slice.call(arguments)));
};
FileChanged.renamed = function() {
    eventEmitter.emit.apply(eventEmitter, ['renamed'].concat(Array.prototype.slice.call(arguments)));
};

    
FileChanged.onAdded = function(callback) {
    eventEmitter.on('added', callback);
};
FileChanged.onChanged = function(callback) {
    eventEmitter.on('changed', callback);
};
FileChanged.onRemoved = function(callback) {
    eventEmitter.on('removed', callback);
};
FileChanged.onRenamed = function(callback) {
    eventEmitter.on('renamed', callback);
};

FileChanged.on = function(event, callback) {
    eventEmitter.on(event, callback);
};

FileChanged.off = function() {
    eventEmitter.off.apply(eventEmitter, arguments);
};

module.exports = FileChanged;