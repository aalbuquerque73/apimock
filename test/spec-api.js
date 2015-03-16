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
                { "name": "pub", "connectors": [ "pub" ], "paths": [ "/:path/:api" ], "method": "get", "folder": "oxipub" },
                { "name": "xml", "connectors": [ "trans" ], "paths": [ "/:path" ], "method": "post", "folder": "oxixml" }
            ])
            .withArgs('connectors').returns({
                "pub": { "name": "pub", "binding": "pub", "url": "http://localhost", "folder": "pub" },
                "trans": { "name": "trans", "binding": "xml", "url": "http://localhost", "folder": "transactions" }
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