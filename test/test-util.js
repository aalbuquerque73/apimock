var httpMocks = require('node-mocks-http');

module.exports = function() {
    return {
        mockHttpReq: function(name, filename, api) {
            return httpMocks.createRequest({
                        method: 'POST',
                        url: '/test',
                        body:  {api: api || 'test', name: name, file: filename}
                    });        
        },
        mockHttpRes: function() {
            return httpMocks.createResponse({encoding: 'utf8'});
        }    
    };
};