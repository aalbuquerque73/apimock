// test message queue functionality
/* global before, after, beforeEach, afterEach, describe, it */

var MessageQueue = require('../message-queue'),
    Disposable = require('../disposable'),
    
    should = require('should');

describe('Disposable', function() {
    var MQ, disposable;
    
    beforeEach(function() {
        MQ = new MessageQueue.MessageQueue();
        disposable = new Disposable(MQ);
    });
    
    describe('disaposable', function() {
        it('should have a dispose method', function() {
            should(disposable).have.property('dispose');
            should(disposable.dispose).be.type('function');
        });
    });
    
    describe('dispose should clear subscriptions', function() {
        it('subscribe should run when publishing', function() {
            var called1 = false;
            var called2 = false;
            disposable.subscribe('test', function() { called1 = true; });
            disposable.subscribe('test', function() { called2 = true; });
            disposable.dispose();
            MQ.publish('test');
            should(called1).equal(false);
            should(called2).equal(false);
        });
        
        it('mixined object should have a dispose method', function() {
            var called = false;
            var obj = {};
            disposable.mixin(obj);
            should(obj).have.property('dispose'); 
            should(obj.dispose).be.type('function');
        });
        
        it('mixin dispose should clear subscriptions', function() {
            var called = false;
            var obj = {};
            disposable.mixin(obj);
            disposable.subscribe('test', function() { called = true; });
            obj.dispose();
            MQ.publish('test');
            should(called).equal(false);
        });
    });
});