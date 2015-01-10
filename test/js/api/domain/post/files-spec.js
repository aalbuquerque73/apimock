var assert = require('chai').assert,
    path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    sinon = require('sinon'), 
    testUtil = require('../../../../test-util')(),
    logger = require('../../../../../js/logger');

var rewire = require("rewire");
var files = rewire('../../../../../js/api/domain/post/files');    

var util = require('util');

describe('api/domain/post/files', function() {
    
    var stubs = [];

    var defaultApi = 'defaultApi',
        debugApi = 'debugApi',
        otherApi = 'otherApi';
        
    var defaultPath = 'defaultPath',
        debugPath = 'debugPath',
        otherPath = 'otherPath';
    
    var defaultData = 'defaultData',
        debugData = 'debugData',
        otherData = 'otherData';
    
    var defaultSource = 'defaultSource',
        debugSource = 'debugSource',
        otherSource = 'otherSource';
    
    var defaultScenario = 'defaultScenario',
        debugScenario = 'debugScenario',
        otherScenario = 'otherScenario';    
    
    before(function() {
        var normalizeStub = sinon.stub(path, 'normalize');
        normalizeStub.withArgs(defaultPath).returns(defaultSource);
        normalizeStub.withArgs(debugPath).returns(debugSource);
        normalizeStub.withArgs(otherPath).returns(otherSource);
        
        var joinStub = sinon.stub(path, 'join');
        joinStub.withArgs(defaultData, defaultSource).returns(defaultPath);
        joinStub.withArgs(debugData, debugSource).returns(debugPath);
        joinStub.withArgs(otherData, otherSource).returns(otherPath);
        
        var gatherFilesStub = sinon.stub();        
        gatherFilesStub.withArgs(defaultSource).returns(getFiles(['a', 'b', 'c']));
        gatherFilesStub.withArgs(debugSource).returns(getFiles(['d', 'e', 'f']));
        gatherFilesStub.withArgs(otherSource).returns(getFiles(['g', 'h', 'i']));        
        files.__set__('gatherFiles', gatherFilesStub);
                
        stubs.push(normalizeStub);        
        stubs.push(joinStub);            
        // no need to push the gatherFilesStub, since it doesn't override the actual object
    });
    
    after(function() {
        for (key in stubs) {
            stubs[key].restore();
        }            
    });    
        
    var httpRes = function() {
        return testUtil.mockHttpRes();
    };
    
    var httpReq = function(options) {
        options = options || {};
        return testUtil.mockHttpReq('test_req', options.filename || 'request_0', options.api);
    }; 
    
    var scenarios = {
        'active': '',
        'other': {
            'source': 'proxy/post/other'
        },
        'debug': {
            'source': 'proxy/debug/post',
            'href': 'http://myapp.com/api/post?debug=true&'
        }
    };    
    
    var getFiles = function(filenames) {
        filenames = filenames || [];
        
        var files = [];
        
        _.each(filenames, function(filename) {
            files.push({'name':filename, 'file':filename});
        });
        
        return files;
    }
    
    var respond = function(req, res, options) {
        files.__set__('globalConfig', options);                
        files(req, res, options);            
    };    
            
    it('should populate config for the default scenario', function() {
        
        var res = httpRes();
        
        var config = {
            app: {data: defaultData},
            api:{
                defaultApi: {
                    source: defaultSource
                }
            }
        };
                
        respond(httpReq({api: defaultApi}), res, config);
        assert.deepEqual(res._getData(), {  
           scenarios:[  
              'default'
           ],
           config:{  
              api:'defaultApi',
              name:'test_req',
              file:'request_0'
           },
           default:[  
              {  
                 name:'a',
                 file:'a'
              },
              {  
                 name:'b',
                 file:'b'
              },
              {  
                 name:'c',
                 file:'c'
              }
           ]
        });        
    });

    it('should populate config for the provided scenario', function() {
                
        var res = httpRes();
        
        var config = {
            app: {data: debugData},
            api:{
                debugApi: {
                    source: debugSource,
                    scenarios: {debugScenario: {source: debugSource}}
                }
            }
        };
                
        respond(httpReq({api: debugApi}), res, config);        
        assert.deepEqual(res._getData(), {  
           scenarios:[  
              'default',
              'debugScenario'
           ],
           config:{  
              api:'debugApi',
              name:'test_req',
              file:'request_0'
           },
           default:[  
              {  
                 name:'d',
                 file:'d'
              },
              {  
                 name:'e',
                 file:'e'
              },
              {  
                 name:'f',
                 file:'f'
              }
           ],
           debugScenario:[  
              {  
                 name:'d',
                 file:'d'
              },
              {  
                 name:'e',
                 file:'e'
              },
              {  
                 name:'f',
                 file:'f'
              }
           ]
        });           
    });
    
    it('should skip an active scenario', function() {
                
        var res = httpRes();
        
        var config = {
            app: {data: otherData},
            api:{
                otherApi: {
                    source: otherSource,
                    scenarios: {active: {source: otherSource}}
                }
            }
        };
                
        respond(httpReq({api: otherApi}), res, config); 
        assert.deepEqual(res._getData(), {  
           scenarios:[  
              'default'
           ],
           config:{  
              api:'otherApi',
              name:'test_req',
              file:'request_0'
           },
           default:[  
              {  
                 name:'g',
                 file:'g'
              },
              {  
                 name:'h',
                 file:'h'
              },
              {  
                 name:'i',
                 file:'i'
              }
           ]
        });          
    });    
});