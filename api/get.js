var _ = require('underscore'),
    Q = require('q'),
    glob = require('glob'),
    fs = require('fs'),
    path = require('path'),
    request = require('request'),
    config = require('config'),
    
    restify = require('restify'),
    
    overriders = require('./overriders'),
    
    folders = require('./folders'),
    equals = require('./comparator');

function Api(urlList) {
    this.folder = folders.path;
    this.urlList = urlList;
}
Api.prototype = {
    handle: function(req, res, next) {
        if (!this.urlList.hasOwnProperty(req.params.path)) {
            res.send(404, 'Not handled!');
            return next(new restify.errors.ResourceNotFoundError('Not Handled', '"' + req.params.path + '" is not defined by configuration'));
        }
        
        var proxy = this.urlList[req.params.path];
        overriders.save.folders(proxy, proxy.route);
        this.folder = folders[proxy.name];
        this.proxy(proxy, req, res, next)
            .then(function() {
                console.log('resolved', arguments);
                return next();
            })
            .fail(function(error) {
                console.error(error);
                return next(error);
            });
    },
    
    
    proxy: function(proxy, req, res, next) {
        var url = proxy.url;
        var patterns = [ path.join(folders[proxy.name], '*.req') ];
        overriders.override.if.needed(patterns, proxy, this);
        return Q.allSettled(_.map(patterns, function(pattern) {
            return Q.nfcall(glob, pattern, { nosort: true, nodir: true });
        }, this))
            .then(function(fileList) {
                fileList = _.chain(fileList).map(function(result) { return result.value; }).flatten().value();
                this.find(fileList, req, res, next)
                    .then(function(file) {
                        console.log('then', path.basename(file), 'found!');
                        return Q.promise(function(resolve) { resolve(file); });
                    })
                    .fail(function() {
                        console.log('fail', 'NOT found!');
                        return this.request(url, fileList, req, res, next);
                    }.bind(this));
            }.bind(this));
    },
    
    find: function(fileList, req, res, next) {
        var promises = _.map(fileList, function(file) {
            return Q.Promise(function(resolve, reject) {
                fs.readFile(file, { encoding: 'utf8' }, function(err, data) {
                    if (err) {
                        reject(err);
                        return;
                    }
                    equals(req.params, data)
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
        return Q.allSettled(promises)
            .then(function(result) {
                var chain = _.chain(result)
                    .filter(function(file) { return file.state === 'fulfilled'; })
                    .first();
                result = chain.value().value;
                console.log('found:', path.basename(result));
                return Q.Promise(function(resolve, reject) {
                    //console.log('response found... reading files...');
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
    },
    
    request: function(url, fileList, req, res, next) {
        return Q.Promise(function(resolve, reject) {
            var apiUrl = url + req.url.replace(req.params.path + '/', '');
            console.log('file not found, requesting from', apiUrl);
            request(apiUrl, function(error, response, body) {
                if (error) {
                    reject(error);
                    return;
                }
                if (response.statusCode === 200) {
                    this.save(req.params, response, body, fileList.length)
                        .then(function() {
                            res.status(response.statusCode);
                            _.each(response.headers, function(value, key) {
                                res.setHeader(key, value);
                            });
                            res.write(body);
                            res.end();
                            resolve();
                        })
                        .fail(reject);
                    return;
                }
                reject(new Error(body));
            }.bind(this));
        }.bind(this));
    },
    
    save: function(params, res, body, count) {
        console.log('saving response content', count, params);
        return Q.allSettled([
            Q.Promise(function(resolve, reject) {
                console.log('save to', path.join(this.folder, 'file_' + count + '.req'));
                fs.writeFile(path.join(this.folder, 'file_' + count + '.req'), JSON.stringify(params, null, 2), function(err) {
                    if (!err) {
                        console.log('file_' + count + '.req saved!');
                        resolve();
                    } else {
                        reject(err);
                    }
                });
            }.bind(this)),
            Q.Promise(function(resolve, reject) {
                console.log('save to', path.join(this.folder, 'file_' + count + '.stats'));
                fs.writeFile(path.join(this.folder, 'file_' + count + '.stats'), JSON.stringify({
                    status: res.statusCode,
                    headers: res.headers
                }, null, 2), function(err) {
                    if (!err) {
                        console.log('file_' + count + '.stats saved!');
                        resolve();
                    } else {
                        reject(err);
                    }
                });
            }.bind(this)),
            Q.Promise(function(resolve, reject) {
                console.log('save to', path.join(this.folder, 'file_' + count + '.res'));
                fs.writeFile(path.join(this.folder, 'file_' + count + '.res'), body, function(err) {
                    if (!err) {
                        console.log('file_' + count + '.res saved!');
                        resolve();
                    } else {
                        reject(err);
                    }
                });
            }.bind(this))
        ]);
    }
};
module.exports = Api;