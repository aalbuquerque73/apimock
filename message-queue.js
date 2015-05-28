var EventEmitter = require('events').EventEmitter;

function MessageQueue() {
    var handler = new EventEmitter();
    
    this.subscribe = function(event, callback) {
        handler.on(event, callback);
        return {
            dispose: function() {
                handler.removeListener(event, callback);
            }
        };
    };
    
    this.subscribeOnce = function(event, callback) {
        var subscription,
            wrapper = function() {
                if (subscription) {
                    subscription.dispose();
                }
                callback.apply(null, arguments);
            };
        subscription = this.subscribe(event, wrapper);
    };
    
    this.publish = function(event, data) {
        handler.emit(event, data);
    };
}

function wrap(queue, obj, cb) {
    if (obj[cb]) {
        return function() {
            var objDisposable = obj[cb].apply(obj, arguments);
            var queueDisposable = queue[cb].apply(queue, arguments);
            if (objDisposable && queueDisposable) {
                return {
                    dispose: function() {
                        objDisposable.dispose();
                        queueDisposable.dispose();
                    }
                };
            }
            return objDisposable || queueDisposable;
        };
    }
    return function() {
        return queue[cb].apply(queue, arguments);
    };
}

MessageQueue.mixin = function(obj) {
    var queue = new MessageQueue();
    
    obj.subscribe = wrap(queue, obj, 'subscribe');
    obj.subscribeOnce = wrap(queue, obj, 'subscribeOnce');
    obj.publish = wrap(queue, obj, 'publish');
};

module.exports = new MessageQueue();
module.exports.MessageQueue = MessageQueue;
