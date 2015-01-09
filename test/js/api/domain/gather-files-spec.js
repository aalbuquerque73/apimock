var assert = require('chai').assert,
    path = require('path'),
    glob = require('glob'),
    sinon = require('sinon'),
    gatherFiles = require('../../../../js/api/domain/gather-files');

describe('api/domain/gather-files', function() {
    
    afterEach(function() {
        stub.restore();    
    });
    
    var getFiles = function(dir, files, options) {        
        stub = sinon.stub(glob, "sync", function() {return files.sort()});
        return gatherFiles(path.normalize(dir), options || {});    
    };
    
    it('should return all the files if there is not a matching filename', function() {
        var expected = [
            {"name":"a.js","file":"a.js"},
            {"name":"b.js","file":"b.js"},
            {"name":"c.js","file":"c.js"}];
        
        var actual = getFiles('/fake/dir', ['a.js', 'b.js', 'c.js']);
        assert.deepEqual(actual, expected);
    });

    it('should return only the files whose name won\'t match the pattern', function() {
        var expected = [{"name":"a.js","file":"a.js"}, {"name":"c.js","file":"c.js"}];        
        var actual = getFiles('/fake/dir', ['a.js', 'c.js', 'response_b.js']);
        assert.deepEqual(actual, expected);

    });    
    
    it('shouldn\'t return anything if all of the files match the pattern', function() {
        var actual = getFiles('/fake/dir', ['response_a.js', 'response_b.js']);
        assert.deepEqual(actual, []);
    });    

    it('should respect the provided response pattern', function() {
        var expected = [
            {"name":"a.xml","file":"a.xml"},
            {"name":"c.txt","file":"c.txt"}]; 
        
        var actual = getFiles('/fake/dir', ['a.xml', 'b.js', 'c.txt'], 
                              {patterns: {response: 'b'}});
        assert.deepEqual(actual, expected);
    });    
    
    it('should use a default value of \'_response\' if no response pattern is provided', function() {
        var expected = [{"name":"c.js","file":"c.js"}];        
        var actual = getFiles('/fake/dir', ['response_a.js', 'c.js', 'response_b.js']);
        assert.deepEqual(actual, expected);

    });    
    
    
});