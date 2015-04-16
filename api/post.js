var _ = require('underscore'),
    Q = require('q'),
    glob = require('glob'),
    fs = require('fs'),
    path = require('path'),
    request = require('request'),
    xml2js = require('xml2js'),
    config = require('config'),
    logger = require('../logger'),
    
    overriders = require('./overriders'),
    
    folders = require('./folders'),
    compare = require('./comparator');

function sort(obj) {
    if (obj && typeof obj === 'object') {
        var tmp = {};
        if (Array.isArray(obj)) {
            tmp = [];
        }
        var keys = Object.keys(obj).sort();
        _.each(keys, function(key) {
            tmp[key] = sort(obj[key]);
        });
        return tmp;
    }
    return obj;
}

function sortedStringify(json) {
    return stringify(sort(json));
}

function stringify(json) {
    try {
        return JSON.stringify(json, null, 2);
    } catch(e) {
        console.error(e);
        return json;
    }
}

function Api(route) {
    this.folder = folders.path;
    this.route = route;
    this.proxyList = {};
    _.each(route.proxies, function(proxy) {
        var name = proxy.name || proxy.folder || 'proxy';
        logger.info('proxy found:', name);
        proxy.name = route.name + name;
        proxy.route = route;

        this.proxyList[proxy.binding] = proxy;
    }, this);
}
Api.prototype = {
    handle: function(req, res, next) {
        if (!this.proxyList.hasOwnProperty(req.params.binding)) {
            logger.warn(req.params.path, 'not found!');
            //res.status(404).send('Not found!');
            return next();
        }
        
        var proxy = this.proxyList[req.params.binding];
        overriders.save.folders(proxy, this.route);
        this.folder = folders[proxy.name];
        this.proxy(proxy, req, res, next)
            .then(function(file) {
                logger.info('post resolved', file);
                return next();
            })
            .fail(function(error) {
                logger.error(error);
                return next(error);
            });
    },
    
    proxy: function(proxy, req, res, next) {
        var patterns = [ path.join(folders[proxy.name], '*.req') ];
        overriders.override.if.needed(patterns, proxy, this);
        return Q.allSettled(_.map(patterns, function(pattern) {
            return Q.nfcall(glob, pattern, { nosort: true, nodir: true });
        }, this))
            .then(function(fileList) {
                fileList = _.chain(fileList).map(function(result) { return result.value; }).flatten().value();
                return this.find(fileList, req, res, next)
                    .then(function(file) {
                        logger.info('then', path.basename(file), 'found!');
                        return Q.promise(function(resolve) { resolve(file); });
                    })
                    .fail(function() {
                        var url = this.createUrl(proxy.url, req);
                        logger.info('fail', 'NOT found!');
                        return this.request(url, fileList, req, res, next);
                    }.bind(this));
            }.bind(this));
    },
    
    find: function(fileList, req, res, next) {
        var rbody = req.body;
        if (typeof rbody.substr !== 'function') {
            rbody = req.body.toString();
        }
        var body = Q.fcall(function() { return rbody; });
        if (rbody.substr(0, 5) === '<?xml') {
            body = Q.nfcall(xml2js.parseString, rbody);//.then(sortedStringify);
        }
        return body.then(function(body) {
            var promises = _.map(fileList, function(file) {
                return Q.Promise(function(resolve, reject) {
                    fs.readFile(file, { encoding: 'utf8'}, function(err, data) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        compare(body, data)
                            .then(function() {
                                logger.info('File', path.basename(file), 'found!');
                                resolve(file);
                            })
                            .fail(function() {
                                reject(new Error('Not found!'));
                            });
                    });
                });
            });
            return Q.any(promises)
                .then(function(result) {
                    logger.info('found:', result);
                    return Q.Promise(function(resolve, reject) {
                        logger.info('response found... reading files...');
                        Q.allSettled([
                            Q.nfcall(fs.readFile, result.replace(/\.req$/, '.stats'), { encoding: 'utf8' }),
                            Q.nfcall(fs.readFile, result.replace(/\.req$/, '.res'), { encoding: 'utf8' })
                        ])
                        .then(function(files) {
                            var stats = JSON.parse(files[0].value);
                            res.status(stats.status);
                            _.each(stats.headers, function(value, key) {
                                res.setHeader(key, value);
                            });
                            res.write(files[1].value);
                            res.end();
                            resolve(result);
                        })
                        .fail(reject);
                    });
                });
        });
    },
    
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
    
    request: function(url, fileList, req, res, next) {
        var rbody = req.body;
        if (typeof rbody.substr !== 'function') {
            rbody = req.body.toString();
        }
        return Q.Promise(function(resolve, reject) {
            logger.info('file not found, requesting from', url);
            var r = {
                url: url,
                body: rbody
            };
            request.post(r, function(error, response, body) {
                if (error) {
                    reject(error);
                    return;
                }
                if (response.statusCode === 200) {
                    var calls = [];
                    if (rbody.substr(0, 5) === '<?xml') {
                        calls.push(Q.nfcall(xml2js.parseString, rbody).then(sortedStringify));
                    } else {
                        calls.push(rbody);
                    }
                    calls.push(body);
                    
                    Q.allSettled(calls)
                        .then(function(params) {
                            return this.save(params[0].value, response, params[1].value, fileList.length)
                            .then(function(files) {
                                res.status(response.statusCode);
                                _.each(response.headers, function(value, key) {
                                    res.setHeader(key, value);
                                });
                                res.write(body);
                                res.end();
                                resolve(files[0].value);
                            })
                            .fail(console.error.bind(console));
                        }.bind(this))
                        .fail(reject);
                    return;
                }
                reject(new Error(body));
            }.bind(this));
        }.bind(this));
    },
    
    save: function(params, res, body, count) {
        return Q.allSettled([
            Q.Promise(function(resolve, reject) {
                var file = path.join(this.folder, 'file_' + count + '.req');
                logger.info('save to', file);
                fs.writeFile(file, params, function(err) {
                    if (!err) {
                        logger.info('file_' + count + '.req saved!');
                        resolve(file);
                    } else {
                        reject(err);
                    }
                });
            }.bind(this)),
            Q.Promise(function(resolve, reject) {
                var file = path.join(this.folder, 'file_' + count + '.stats');
                logger.info('save to', file);
                fs.writeFile(file, stringify({
                    status: res.statusCode,
                    headers: res.headers
                }), function(err) {
                    if (!err) {
                        logger.info('file_' + count + '.stats saved!');
                        resolve(file);
                    } else {
                        reject(err);
                    }
                });
            }.bind(this)),
            Q.Promise(function(resolve, reject) {
                var file = path.join(this.folder, 'file_' + count + '.res');
                logger.info('save to', file);
                fs.writeFile(file, body, function(err) {
                    if (!err) {
                        logger.info('file_' + count + '.res saved!');
                        resolve(file);
                    } else {
                        reject(err);
                    }
                });
            }.bind(this))
        ]);
    }
};

module.exports = Api;