var _ = require('underscore'),
    Q = require('q'),
    glob = require('glob'),
    fs = require('fs'),
    path = require('path'),
    request = require('request'),
    xml2js = require('xml2js'),
    config = require('config'),
    
    Folders = require('./folders'),
    equals = require('./comparator');

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

function Api(urlList) {
    this.folders = new Folders();
    this.folder = this.folders.path;
    this.urlList = urlList;
}
Api.prototype = {
    handle: function(req, res, next) {
        console.log('handle', this.urlList);
        if (!this.urlList.hasOwnProperty(req.params.path)) {
            console.warn(req.params.path, 'not found!');
            res.status(404).send('Not found!');
            return next();
        }
        
        var connector = this.urlList[req.params.path];
        var url = connector.url;
        this.folder = this.folders[connector.name];
        this.proxy(url, req, res, next)
            .then(function(file) {
                console.log('post resolved', file);
                next();
            })
            .fail(function(error) {
                console.error(error);
                next(error);
            });
    },
    
    proxy: function(url, req, res, next) {
        return Q.nfcall(glob, path.join(this.folder, '*.req'), { nosort: true, nodir: true })
            .then(function(fileList) {
                return this.find(fileList, req, res, next)
                .fail(function() {
                    return this.request(url, fileList, req, res, next);
                }.bind(this))
            }.bind(this))
    },
    
    find: function(fileList, req, res, next) {
        var isXml = false;
        var body = Q.fcall(function() { return req.body; });
        if (req.body.substr(0, 5) === '<?xml') {
            isXml = true;
            body = Q.nfcall(xml2js.parseString, req.body);//.then(sortedStringify);
        }
        return body.then(function(body) {
            var promises = _.map(fileList, function(file) {
                return Q.Promise(function(resolve, reject) {
                    fs.readFile(file, { encoding: 'utf8'}, function(err, data) {
                        if (err) {
                            reject(err);
                            return;
                        }
                        equals(body, data)
                            .then(function() {
                                console.log('File', path.basename(file), 'found!');
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
                    console.log('found:', result);
                    return Q.Promise(function(resolve, reject) {
                        console.log('response found... reading files...');
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
    
    request: function(url, fileList, req, res, next) {
        return Q.Promise(function(resolve, reject) {
            console.log('file not found, requesting from', url + req.url);
            var r = {
                url: url + req.url,
                body: req.body
            };
            request.post(r, function(error, response, body) {
                if (error) {
                    reject(error);
                    return;
                }
                if (response.statusCode === 200) {
                    var calls = [];
                    if (req.body.substr(0, 5) === '<?xml') {
                        calls.push(Q.nfcall(xml2js.parseString, req.body).then(sortedStringify));
                    } else {
                        calls.push(req.body);
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
                console.log('save to', file);
                fs.writeFile(file, params, function(err) {
                    if (!err) {
                        console.log('file_' + count + '.req saved!');
                        resolve(file);
                    } else {
                        reject(err);
                    }
                });
            }.bind(this)),
            Q.Promise(function(resolve, reject) {
                var file = path.join(this.folder, 'file_' + count + '.stats');
                console.log('save to', file);
                fs.writeFile(file, stringify({
                    status: res.statusCode,
                    headers: res.headers
                }), function(err) {
                    if (!err) {
                        console.log('file_' + count + '.stats saved!');
                        resolve(file);
                    } else {
                        reject(err);
                    }
                });
            }.bind(this)),
            Q.Promise(function(resolve, reject) {
                var file = path.join(this.folder, 'file_' + count + '.res');
                console.log('save to', file);
                fs.writeFile(file, body, function(err) {
                    if (!err) {
                        console.log('file_' + count + '.res saved!');
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