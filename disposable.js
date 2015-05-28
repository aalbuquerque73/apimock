var _ = require('underscore');

function Disposable(obj) {
    var subscriptions = [];
    
    this.subscribe = function() {
        subscriptions.push(obj.subscribe.apply(obj, arguments));
    };
    
    this.subscribeOnce = function() {
        obj.subscribeOnce.apply(obj, arguments);
    };
    
    this.dispose = function() {
        _.each(subscriptions, function(subscription) {
            subscription.dispose();
        });
        subscriptions = [];
    };
    
    this.mixin = function(obj) {
        var dispose = obj.dispose;
        if (dispose) {
            obj.dispose = function() {
                dispose.call(obj);
                this.dispose();
            }.bind(this);
        } else {
            obj.dispose = this.dispose.bind(this);
        }
    };
}

module.exports = Disposable;