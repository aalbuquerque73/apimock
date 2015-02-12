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
    
    var fakePath = '/Users/fake/apimock/data';
    
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
    
    it('should return all saved GET requests', function() {
        // courtesy MediaWiki API (http://en.wikipedia.org/w/api.php)
        // The queries below work best when appended to http://en.wikipedia.org/w/api.php?
        var ghost_busters = 'action=query&format=json&continue=&titles=ghost%20busters.json',
            et_calls_home = 'action=query&format=json&continue=&titles=E.T.%20the%20Extra-Terrestrial.xml',
            wild_wild_west = 'action=query&format=xml&continue=&titles=The%20Good,%20the%20Bad%20and%20the%20Ugly.xml';
                
        assert.deepEqual(            
            _test(_getFiles([ghost_busters, et_calls_home, wild_wild_west])), 
            // files are sorted in alphabetical order
            _expected([et_calls_home, ghost_busters, wild_wild_west]));
    
    });
    
    it('should return all saved POST requests and ignore their response counterparts', function() {
        var post_0 = ['request_0.xml', 'response_0.xml'],
            post_1 = ['request_1.xml', 'response_1.xml'],
            post_2 = ['request_2.xml', 'response_2.xml'];
        
        assert.deepEqual(
            // all requests and responses
            _test(_getFiles([post_0[0], post_0[1], post_1[0], post_1[1], post_2[0], post_2[1]])), 
            // only requests are expected to be returned                                                                    
            _expected([post_0[0], post_1[0], post_2[0]]));    
    });
    
    it('should be possible to override the default response pattern', function() {
        var post_0 = ['req_0.xml', 'res_0.xml'],
            post_1 = ['req_1.xml', 'res_1.xml'],
            post_2 = ['req_2.xml', 'res_2.xml'];    
        
        assert.deepEqual(
            // all requests and responses - please note the shortened file names
            _test(_getFiles([post_0[0], post_0[1], post_1[0], post_1[1], post_2[0], post_2[1]]),
                  {patterns: {response: 'res_'}}), 
            _expected([post_0[0], post_1[0], post_2[0]]));
        
    });    
});