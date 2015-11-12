var path = require('path'),
    express = require('express'),
    restify = require('restify'),
    favicon = require('serve-favicon'),
    logger = require('./logger'),
    morgan = require('morgan'),
    util = require('util'),
    
    config = require('config');

var api = require('./api');
var MQ = require('./message-queue');

var environment = process.env.NODE_ENV || 'development';
logger.log('environment:', environment);

var subscription = MQ.subscribe('main:folder', function(cb) {
    if (typeof cb === 'function') {
        cb(__dirname);
    }
});

var server = restify.createServer({
    name: 'api-proxy',
    version: '0.0.1'
});

server.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.use(morgan('dev', {
    skip: function(req, res) { return res.statusCode < 400; },
    stream: logger.stream
}));

api.setup(server);

server.on('InternalServerError', function (req, res, err, next) {
    console.log('Server Error:', err);
    err._customContent = 'something is wrong!';
    return next();
});

server.on('NotFound', function(req, res, err, next) {
    console.log('Not found:', req.url, 'was not handled by this server!');
    res.send(404, req.url + 'was not handled by this server!');
    return next(new restify.errors.ConflictError(req.url + 'was not handled by this server!'));
});

var port = 8081;
if (config.server && config.server.port) {
    port = config.server.port;
}
server.listen(port, function() {
    logger.log(server.name, 'listening at', server.url);
});

if (config.web && config.web.port) {
    var app = express();
    
    app.use(morgan('dev', {
        skip: function(req, res) { return res.statusCode < 400; },
        stream: logger.web.stream
    }));
    app.use(express.static(path.join(__dirname, 'public')));
    
    var webServer = app.listen(config.web.port, function() {
        var host = webServer.address().address;
        var port = webServer.address().port;
        logger.web.log(config.web.name || server.name, 'listening at', 'http://[' + host + ']:', port);
    });
}