var path = require('path'),
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

// Not found
server.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Server error
server.use(function (err, req, res, next) {
    console.error('Error:', err);
    res.status(err.status || 500);
    res.send({
        message: err.message,
        error: (environment === 'development') ? err : {}
    });
});

server.listen(config.server.port || 8081, function() {
    logger.log(server.name, 'listening at', server.url);
});