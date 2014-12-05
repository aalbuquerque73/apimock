/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var events = require('events'),
    eventEmitter = new events.EventEmitter();

function FolderChanged() {
    events.EventEmitter.call(this);
    
    this.added = function() {
        this.emit.apply(this, ['added'].concat(arguments));
    };
    this.changed = function() {
        this.emit.apply(this, ['changed'].concat(arguments));
    };
    this.removed = function() {
        this.emit.apply(this, ['removed'].concat(arguments));
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
}
FolderChanged.prototype.__proto__ = events.EventEmitter.prototype;

FolderChanged.added = function() {
    eventEmitter.emit.apply(eventEmitter, ['added'].concat(arguments));
};
FolderChanged.changed = function() {
    eventEmitter.emit.apply(eventEmitter, ['changed'].concat(arguments));
};
FolderChanged.removed = function() {
    eventEmitter.emit.apply(eventEmitter, ['removed'].concat(arguments));
};

    
FolderChanged.onAdded = function(callback) {
    eventEmitter.on('added', callback);
};
FolderChanged.onChanged = function(callback) {
    eventEmitter.on('changed', callback);
};
FolderChanged.onRemoved = function(callback) {
    eventEmitter.on('removed', callback);
};

FolderChanged.off = function() {
    eventEmitter.off.apply(eventEmitter, arguments);
};

module.exports = FolderChanged;