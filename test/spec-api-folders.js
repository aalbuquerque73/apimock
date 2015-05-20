// test message queue functionality
/* global before, after, beforeEach, afterEach, describe, it */

// dependency grouping
    // API modules
var logger = require('../logger'),
    MQ = require('../message-queue'),

    // Node modules
    path = require('path'),
    mkdirp = require('mkdirp'),
    fs = require('fs'),

    // Config
    config = require('config'),

    // Test modules
    should = require('should'),
    sinon = require('sinon');

describe('Folders', function() {
    var folders;
    
    before(function() {
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
            .withArgs(path.normalize('/fake/data/get/doget'))
            .returns(false)
            .withArgs(path.normalize('/fake/data/post/dopost'))
            .returns(false)
            .withArgs(path.normalize('/fake/data/get'))
            .returns(true)
            .withArgs(path.normalize('/fake/data/post'))
            .returns(true);
    });
    
    after(function() {
        config.get.restore();
        logger.log.restore();
        MQ.publish.restore();
    });
    
    beforeEach(function() {
        sinon
            .stub(mkdirp, 'sync', function(){});
        folders = require('../api/folders');
        folders.reset();
        folders.init();
    });
    
    afterEach(function() {
        mkdirp.sync.restore();
    });
    
    describe('Folders', function() {
        it('should get main folder', function() {
            folders.path.should.be.equal(path.normalize('/fake/data'));
        });
        
        it('should have a get/ property', function() {
            folders.should.have.property(path.normalize('get/')).and.be.equal(path.normalize('/fake/data/get'));
        });
        
        it('should have a post/ property', function() {
            folders.should.have.property(path.normalize('post/')).and.be.equal(path.normalize('/fake/data/post'));
        });
        
        it('should have a get/doget property', function() {
            folders.should.have.property(path.normalize('get/doget')).and.be.equal(path.normalize('/fake/data/get/doget'));
        });
        
        it('should have a post/dopost property', function() {
            folders.should.have.property(path.normalize('post/dopost')).and.be.equal(path.normalize('/fake/data/post/dopost'));
        });
        
        it('should have called mkdirp 2 times', function() {
            mkdirp.sync.calledTwice.should.be.equal(true);
        });
    });
});
