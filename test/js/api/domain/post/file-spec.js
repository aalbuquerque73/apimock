var assert = require('chai').assert,
    path = require('path'),
    fs = require('fs'),
    sinon = require('sinon'), 
    httpMocks = require('node-mocks-http'),
    logger = require('../../../../../js/logger');    
    file = require('../../../../../js/api/domain/post/file');    

describe('api/domain/post/file', function() {
        
    var stubs = [];
    
    afterEach(function() {
        for (key in stubs) {
            stubs[key].restore();
        }            
    });    
    
    var getResponse = function() {
        return httpMocks.createResponse({encoding: 'utf8'});
    };
    
    var getRequest = function(name, file) {
        return httpMocks.createRequest({
                    method: 'POST',
                    url: '/test',
                    body:  {api: 'test', name: name, file: file}
                });    
    }; 
    
    var respond = function(req, res, content, options) {
        options = options || {};
        
        var matcher = options.matcher || 'always';
        var stub = null;
        
        switch (matcher) {
            case 'res-only':             
                stub = sinon.stub(fs, "existsSync");
                stub.onCall(0).returns(false);
                stub.onCall(1).returns(true);                
                break;
            default:
                stub = sinon.stub(fs, "existsSync", function() {return matcher === 'always';})
                break;                
        };
        
        if (stub) stubs.push(stub);
        stubs.push(sinon.stub(fs, "readFileSync", function() {return content}));
        
        var config = {
            api:{
                'test': options.patterns || {}
            }
        };
        
        file(req, res, config);        
    };
    
    it('should send both the request and the response if both of them were captured', function() {
        
        var res = getResponse(),
            req = getRequest('test_req', 'request_0');
        
        respond(req, res, 'test content');
        
        var expected = {  
           file1:{  
              name:'test_req',
              href:'request_0',
              content:'test content'
           },
           file2:{  
              name:'response_0',
              href:'response_0',
              content:'test content'
           },
           basename:'test_req'
        };
        
        assert.deepEqual(res._getData(), expected);                        
    });
    
    it('should send a captured request', function() {
        
        var res = getResponse(),
            req = getRequest('test_req', 'no_match');
        
        respond(req, res, 'test content');
        
        var expected = {  
           file1:{  
              name:'test_req',
              href:'no_match',
              content:'test content'
           },
           basename:'test_req'
        };
        
        assert.deepEqual(res._getData(), expected);                        
    });

    it('should send a captured response', function() {
        
        var res = getResponse(),
            req = getRequest('test_req', 'request_0');
        
        respond(req, res, 'test content', {matcher: 'res-only'});
        
        var expected = {  
           file2:{  
              name:'response_0',
              href:'response_0',
              content:'test content'
           },
           basename:'test_req'
        };
                
        assert.deepEqual(res._getData(), expected);                        
    });
    
    it('should send the response as JSON', function() {
        
        var res = getResponse(),
            req = getRequest('test_req', 'request_0');
        
        respond(req, res, 'test content');
                        
        assert(res._isJSON(), 'Response doesn\'t seem to be JSONized!');                        
    });    
    
});