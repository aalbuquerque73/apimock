// test message queue functionality
/* global before, after, beforeEach, afterEach, describe, it */

var logger = require('../logger'),
    MQ = require('../message-queue'),
    
    mkdirp = require('mkdirp'),
    fs = require('fs'),
    
    config = require('config'),
    
    should = require('should'),
    sinon = require('sinon');

describe('Folders', function() {
    var folders;
    
    before(function(done) {
        sinon
            .stub(config, 'get')
            .withArgs('routes').returns([
                {
                    'name': 'get',
                    'proxies': [{
                        'name': 'doget',
                        'binding': 'doget',
                        'url': 'http://localhost',
                        'folder': 'doget'
                    }],
                    'paths': ['/:path/:api'],
                    'method': 'get',
                    'folder': 'get'
                },
                {
                    'name': 'post',
                    'proxies': [{
                        'name': 'dopost',
                        'binding': 'dopost',
                        'url': 'http://localhost',
                        'folder': 'dopost'
                    }],
                    'paths': ['/:path'],
                    'method': 'post',
                    'folder': 'post'
                }
            ]);
        sinon
            .stub(logger, 'log');
        sinon
            .stub(MQ, 'publish', function(event, cb) {
                cb('/fake');
            });
        sinon
            .stub(fs, 'existsSync')
            .withArgs('/fake/data/get/doget')
            .returns(false)
            .withArgs('/fake/data/post/dopost')
            .returns(false)
            .withArgs('/fake/data/get')
            .returns(true)
            .withArgs('/fake/data/post')
            .returns(true);
        done();
    });
    
    after(function(done) {
        config.get.restore();
        logger.log.restore();
        MQ.publish.restore();
        done();
    });
    
    beforeEach(function(done) {
        sinon
            .stub(mkdirp, 'sync', function(){});
        folders = require('../api/folders');
        folders.reset();
        folders.init();
        done();
    });
    
    afterEach(function(done) {
        mkdirp.sync.restore();
        done();
    });
    
    describe('Folders', function() {
        it('should get main folder', function(done) {
            folders.path.should.be.equal('/fake/data');
            done();
        });
        
        it('should have a get/ property', function(done) {
            folders.should.have.property('get/').and.be.equal('/fake/data/get');
            done();
        });
        
        it('should have a post/ property', function(done) {
            folders.should.have.property('post/').and.be.equal('/fake/data/post');
            done();
        });
        
        it('should have a get/doget property', function(done) {
            folders.should.have.property('get/doget').and.be.equal('/fake/data/get/doget');
            done();
        });
        
        it('should have a post/dopost property', function(done) {
            folders.should.have.property('post/dopost').and.be.equal('/fake/data/post/dopost');
            done();
        });
        
        it('should have called mkdirp 2 times', function(done) {
            mkdirp.sync.calledTwice.should.be.equal(true);
            done();
        });
    });
});