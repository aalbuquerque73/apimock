var _ = require('underscore'),
    config = require('config'),
    logger = require('./logger'),
    overriders = require('./api/overriders');

function Api() {
    this.supported = {
        routes: [ undefined, 'get', 'post' ]
    };
    this.routes = config.get('routes');
}
Api.prototype = {
    setup: function(server) {
        overriders.init();
        overriders.apply(server);
        _.each(this.routes, function(route) {
            logger.log('setting up route:', route.name);
            this.apply(route).to(server);
        }, this);
    },
    
    apply: function(route) {
        var supported = (this.supported.routes.indexOf(route.method) !== -1);
        logger.log('route supported?', supported);
        if (supported) {
            route.method = route.method || 'get';
            var MethodModule = require('./api/' + route.method);
            route.name = (route.name || route.folder || '') + '/';
            var method = new MethodModule(route);
            return {
                to: function(server) {
                    logger.log('connecting paths to server', server.name);
                    if (Array.isArray(route.paths)) {
                        _.each(route.paths, function(path) {
                            logger.log('binding', path, 'to', route.method);
                            server[route.method](path, method.handle.bind(method));
                        });
                    } else {
                        logger.log('binding', route.paths, 'to', route.method);
                        server[route.method](route.paths, method.handle.bind(method));
                    }
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