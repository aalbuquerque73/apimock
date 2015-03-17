// test message queue functionality
var Folders = require('../api/folders'),
    logger = require('../logger'),
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
                { "name": "gettest", "connectors": [ "get" ], "paths": [ "/:path/:api" ], "method": "get", "folder": "gettest" },
                { "name": "posttest", "connectors": [ "post" ], "paths": [ "/:path" ], "method": "post", "folder": "posttest" }
            ])
            .withArgs('connectors').returns({
                "get": { "name": "get", "binding": "get", "url": "http://localhost", "folder": "get" },
                "post": { "name": "post", "binding": "post", "url": "http://localhost", "folder": "post" }
            });
        sinon
            .stub(logger, 'log');
        sinon
            .stub(MQ, 'publish', function(event, cb) {
                cb('/fake');
            });
        sinon
            .stub(fs, 'existsSync')
            .withArgs('/fake/data/gettest/get')
            .returns(false)
            .withArgs('/fake/data/posttest/post')
            .returns(false)
            .withArgs('/fake/data/gettest')
            .returns(true)
            .withArgs('/fake/data/posttest')
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
        folders = new Folders();
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
        
        it('should have a gettest property', function(done) {
            folders.should.have.property('gettest').and.be.equal('/fake/data/gettest');
            done();
        });
        
        it('should have a posttest property', function(done) {
            folders.should.have.property('posttest').and.be.equal('/fake/data/posttest');
            done();
        });
        
        it('should have a get property', function(done) {
            folders.should.have.property('get').and.be.equal('/fake/data/gettest/get');
            done();
        });
        
        it('should have a post property', function(done) {
            folders.should.have.property('post').and.be.equal('/fake/data/posttest/post');
            done();
        });
        
        it('should have called mkdirp 2 times', function(done) {
            mkdirp.sync.calledTwice.should.be.true;
            done();
        });
    });
});