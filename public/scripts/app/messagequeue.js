/*jslint browser: true, nomen: true, regexp: true, vars: true, white: true */
/*global define, window, console, describe, it, before, beforeEach, after, afterEach */

define(['knockout'],
function(ko) {
    'use strict';
    
    function MessageQueue() {
        this._postbox = new ko.subscribable ();
    }
    MessageQueue.prototype = {
        subscribe: function(event, callback, target) {
            return this._postbox.subscribe(callback, target, event);
        },
        
        publish: function(event, message) {
            this._postbox.notifySubscribers(message, event);
        }
    };
    
    MessageQueue.create = function() {
        return new MessageQueue();
    };
    
    return MessageQueue.create();
});