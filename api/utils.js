var _ = require('underscore');

module.exports = {
    createUrl: function(url, req) {
        var query = _.chain(req.query)
                .map(function(value, key) { return key + '=' + value; })
                .value()
            .join('&');
        
        var lookup = {
            search: '?' + query,
            query: query,
            path: req.url
        };
        _.extend(lookup, req.params);
        
        return url.replace(/{{(\w+)}}/g, function(match, param) {
            if (lookup.hasOwnProperty(param)) {
                return lookup[param];
            }
            return match;
        });
    },
    
    transform: function(data, req) {
        var query = _.chain(req.query)
                .map(function(value, key) { return key + '=' + value; })
                .value()
            .join('&');
        
        var lookup = {
            search: '?' + query,
            query: query,
            path: req.url
        };
        _.extend(lookup, req.query);
        _.extend(lookup, req.params);
        
        var transform = {};
        
        return data.replace(/&rpl;(.*?)&rpl;/g, function(match, text) {
            return text.replace(/{{(.*?)}}/g, function(match, param) {
                if (lookup.hasOwnProperty(param)) {
                    return lookup[param];
                }
                var tokens = param.split(':');
                if (transform.hasOwnProperty(tokens[0])) {
                    return transform[tokens[0]](tokens[1]);
                }
                return param;
            });
        });
    }
};