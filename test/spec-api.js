// test message queue functionality
var Api = require('../api'),
    logger = require('../logger'),
    
    config = require('config'),
    
    should = require('should'),
    sinon = require('sinon');

describe('API', function() {
    var api, server;
    
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
        done();
    });
    
    after(function(done) {
        config.get.restore();
        logger.log.restore();
        done();
    });
    
    beforeEach(function(done) {
        api = new Api();
        server = {
            get: sinon.spy(),
            post: sinon.spy()
        };
        done();
    });
    
    describe('API', function() {
        it('should setup get and post methods', function(done) {
            api.setup(server);
            server.get.called.should.be.equal(true);
            server.post.called.should.be.equal(true);
            done();
        });
    });
});