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
    
    it('should only return saved requests by default', function() {
        assert.deepEqual(
            _test(_getFiles(['request_a', 'response_a', 'request_b', 'response_b'])), 
            _expected(['request_a', 'request_b']));

    });    
    
    it('shouldn\'t return anything if there are only saved responses available, by default', function() {
        assert.deepEqual(_test(['response_a', 'response_b']), []);
    });    

    it('should be possible to override the default response pattern', function() {
        assert.deepEqual(
            _test(_getFiles(['request_a1', 'response_a1', 'request_a2', 'response_a2', 'request_b', 'response_b']),
                  {patterns: {response: 'response_a'}}), 
            _expected(['request_a1', 'request_a2', 'request_b', 'response_b']));
    });            

    it('should be possible to flip the response pattern to filter out requests instead of responses', function() {
        assert.deepEqual(
            _test(_getFiles(['request_a', 'response_a', 'request_b', 'response_b', 'request_c', 'response_c']),
                  {patterns: {response: 'request_'}}), 
            _expected(['response_a', 'response_b', 'response_c']));
    });            
    
});