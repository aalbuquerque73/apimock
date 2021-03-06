// test message queue functionality
/* global before, after, beforeEach, afterEach, describe, it */

var MessageQueue = require('../message-queue'),
    
    should = require('should');

describe('MessageQueue', function() {
    var MQ;
    
    beforeEach(function(done) {
        MQ = new MessageQueue.MessageQueue();
        done();
    });
    
    describe('dispose', function() {
        it('subscribe should return a disposable', function() {
           var subscription = MQ.subscribe('test', function() {});
            should(subscription).have.property('dispose'); 
            should(subscription.dispose).be.type('function');
        });
    });
    
    describe('subscribe/publish', function() {
        it('subscribe should run when publishing', function() {
            var called = false;
            var subscription = MQ.subscribe('test', function() { called = true; });
            MQ.publish('test');
            should(called).equal(true);
        });
        
        it('subscribe should be called with argument', function() {
            var calledWith = null;
            var subscription = MQ.subscribe('test', function(data) { calledWith = data; });
            MQ.publish('test', 'test1');
            should(calledWith).equal('test1');
            MQ.publish('test', 'test2');
            should(calledWith).equal('test2');
            MQ.publish('test');
            should(calledWith).equal(undefined);
        });
        
        it('subscribeOnce should run only once', function() {
            var calls = 0;
            var subscription = MQ.subscribeOnce('test', function() { ++calls; });
            MQ.publish('test');
            MQ.publish('test');
            should(calls).equal(1);
        });
    });
});