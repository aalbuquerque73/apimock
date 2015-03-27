var _ = require('underscore'),
    config = require('config'),
    logger = require('./logger');

function Api() {
    this.supported = {
        routes: [ 'get', 'post' ]
    };
    this.routes = config.get('routes');
    this.connectors = config.get('connectors');
}
Api.prototype = {
    setup: function(server) {
        _.each(this.routes, function(route) {
            logger.log('setting up route:', route.name);
            this.apply(route).to(server);
        }, this);
    },
    
    apply: function(route) {
        var supported = (this.supported.routes.indexOf(route.method) !== -1);
        logger.log('route supported?', supported);
        if (supported) {
            var MethodModule = require('./api/' + route.method);
            var list = {};
            _.each(route.connectors, function(name) {
                if (config.connectors.hasOwnProperty(name)) {
                    var connector = config.connectors[name];
                    logger.log('connector found:', name);
                    list[connector.binding] = connector;
                }
            }, this);
            var method = new MethodModule(list);
            return {
                to: function(server) {
                    logger.log('connecting paths to server', server.name);
                    _.each(route.paths, function(path) {
                        logger.log('binding', path, 'to', route.method);
                        server[route.method](path, method.handle.bind(method));
                    });
                }
            };
        }
        return { to: function() {} };
    }
};

Api.setup = function(server) {
    var api = new Api();
    api.setup(server);
};

module.exports = Api;