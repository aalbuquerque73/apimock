/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

// Web server
var express = require('express');
var app = express();

// App config
var path = require('path');
var config = require('./js/settings');

var root = path.resolve(__dirname.replace(/\\/g, "/"));
config.util.setModuleDefaults("app", {
    root: root,
    data: path.join(root, 'data'),
    views: {
        path: path.join(__dirname, config.app.views.folder)
    },
    public: {
        path: path.join(__dirname, config.app.public.folder)
    },
    favicon: {
        path: path.join(__dirname, config.app.public.folder, config.app.favicon.folder, 'favicon.ico')
    }
});

var lib = {
    favicon: require('serve-favicon'),
    morgan: require('morgan'),
    logger: require('./js/logger'),
    routes: require('./js/routes'),
    parser: {
        cookie: require('cookie-parser'),
        body: require('body-parser'),
        xml: require('express-xml-bodyparser'),
        raw: require('./js/raw-parser')
    },
    err: {
        notFound: function (req, res, next) {
            var err = new Error('Not Found');
            err.status = 404;
            next(err);
        },
        other: function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: (app.get('env') === 'development') ? err : {}
            });
        }
    }
};

// View engine
app.set('views', config.app.views.path);
app.set('view engine', config.app.views.engine);

// Routing and content handling
app.use(lib.favicon(config.app.favicon.path));
app.use(lib.parser.body.json());
app.use(lib.parser.body.urlencoded({extended: true}));
app.use(lib.parser.xml());
app.use(lib.parser.raw());
app.use(lib.parser.cookie());

// Logging
app.use(lib.morgan(config.Options.logging, {
    skip: function(req, res) { return res.statusCode < 400; },
    stream: lib.logger.stream
}));

app.use(lib.routes);
app.use(express.static(config.app.public.path));

// Error handling
app.use(lib.err.notFound);
app.use(lib.err.other);

// Bootstrap
var SERVER = config.Server;
console.log("App root dir: [%s]", config.app.root);
console.log("Starting server: [http://%s:%s]", SERVER.host, SERVER.port);
app.listen(SERVER.port, SERVER.host);

module.exports = app;
