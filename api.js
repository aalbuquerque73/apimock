var _ = require('underscore'),
    config = require('config'),
    logger = require('./logger');

function Api() {
    this.supported = {
        routes: [ 'get', 'post' ]
    };
    this.routes = config.get('routes');
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
            route.method = route.method || 'get';
            var MethodModule = require('./api/' + route.method);
            route.name = (route.name || route.folder || '') + '/';
            var list = {};
            if (Array.isArray(route.proxies)) {
                _.each(route.proxies, function(proxy) {
                    var name = proxy.name || proxy.folder || 'proxy';
                    logger.log('proxy found:', name);
                    proxy.name = route.name + name;
                    proxy.route = route;
                    list[proxy.binding] = proxy;
                }, this);
            } else {
                list[route.paths] = {
                    name: route.name + 'proxy',
                    route: route,
                    binding: route.paths,
                    url: route.proxies
                };
            }
            var method = new MethodModule(list);
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