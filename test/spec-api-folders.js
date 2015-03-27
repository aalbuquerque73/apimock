// test message queue functionality
/* global before, after, beforeEach, afterEach, describe, it */

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
                { 'name': 'oxipub', 'connectors': [ 'pub' ], 'paths': [ '/:path/:api' ], 'method': 'get', 'folder': 'oxipub' },
                { 'name': 'oxixml', 'connectors': [ 'trans' ], 'paths': [ '/:path' ], 'method': 'post', 'folder': 'oxixml' }
            ])
            .withArgs('connectors').returns({
                'pub': { 'name': 'pub', 'binding': 'pub', 'url': 'http://localhost', 'folder': 'pub' },
                'trans': { 'name': 'trans', 'binding': 'xml', 'url': 'http://localhost', 'folder': 'transactions' }
            });
        sinon
            .stub(logger, 'log');
        sinon
            .stub(MQ, 'publish', function(event, cb) {
                cb('/fake');
            });
        sinon
            .stub(fs, 'existsSync')
            .withArgs('/fake/data/oxipub/pub')
            .returns(false)
            .withArgs('/fake/data/oxixml/transactions')
            .returns(false)
            .withArgs('/fake/data/oxipub')
            .returns(true)
            .withArgs('/fake/data/oxixml')
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
        
        it('should have a oxipub property', function(done) {
            folders.should.have.property('oxipub').and.be.equal('/fake/data/oxipub');
            done();
        });
        
        it('should have a oxixml property', function(done) {
            folders.should.have.property('oxixml').and.be.equal('/fake/data/oxixml');
            done();
        });
        
        it('should have a pub property', function(done) {
            folders.should.have.property('pub').and.be.equal('/fake/data/oxipub/pub');
            done();
        });
        
        it('should have a trans property', function(done) {
            folders.should.have.property('trans').and.be.equal('/fake/data/oxixml/transactions');
            done();
        });
        
        it('should have called mkdirp 2 times', function(done) {
            mkdirp.sync.calledTwice.should.be.equal(true);
            done();
        });
    });
});