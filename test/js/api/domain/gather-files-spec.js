var assert = require('chai').assert,
    _ = require('underscore'),
    path = require('path'),
    glob = require('glob'),
    sinon = require('sinon'),
    gatherFiles = require('../../../../js/api/domain/gather-files');

var util = require('util');

describe('api/domain/gather-files', function() {
    
    afterEach(function() {
        if(stub) stub.restore();   
    });
    
    var fakePath = '/fake/path';
    
    var _getFiles = function(filenames) {
        return _.map(filenames, function(filename) {return path.join(fakePath, filename);});
    };
    
    // returns an array of objects, each of which is defined as { basename: <filename>, file: <absolute file path> }
    var _expected = function(filenames) {
        return _.map(filenames, function(filename) {
            return {name: filename, file: path.join(fakePath, filename)};
        });
    }
    
    var _test = function(files, options) {     
        stub = sinon.stub(glob, "sync", function() {return files.sort();});
        return gatherFiles(path.normalize(fakePath), options || {});    
    };

    it('should recognize responses as files starting with \'response_\' by default', function() {
        assert.deepEqual(
            _test(_getFiles(['request_a', 'response_a', 'request_b', 'res_b'])), 
            _expected(['request_a', 'request_b', 'res_b']));

    });    
    
    it('should only return all saved POST requests, not the responses associated with them', function() {
        assert.deepEqual(
            _test(_getFiles(['request_a', 'response_a', 'request_b', 'response_b'])), 
            _expected(['request_a', 'request_b']));

    });    

    it('shouldn\'t return anything if there are only saved POST responses available', function() {
        assert.deepEqual(_test(['response_a', 'response_b']), []);
    });    
        
    it('should return all saved GET requests', function() {
        assert.deepEqual(
            _test(_getFiles(['getA?b=c', 'getB?c=d', 'getC?d=e&f=g'])), 
            _expected(['getA?b=c', 'getB?c=d', 'getC?d=e&f=g']));

    });        
    
    it('should be possible to override the default response pattern', function() {
        assert.deepEqual(
            _test(_getFiles(['request_a1', 'response_a1', 'request_a2', 'response_a2', 'request_b', 'response_b']),
                  {patterns: {response: 'response_a'}}), 
            _expected(['request_a1', 'request_a2', 'request_b', 'response_b']));
    });            
    
});