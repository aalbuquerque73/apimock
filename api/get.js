var _ = require('underscore'),
    Q = require('q'),
    glob = require('glob'),
    fs = require('fs'),
    path = require('path'),
    request = require('request'),
    config = require('config'),
    
    Folders = require('./folders'),
    equals = require('./comparator');

function Api(urlList) {
    this.folders = new Folders();
    this.folder = this.folders.path;
    this.urlList = urlList;
}
Api.prototype = {
    handle: function(req, res, next) {
        if (!this.urlList.hasOwnProperty(req.params.path)) {
            console.warn(req.params.path, 'not found!');
            res.status(404).send('Not found!');
            return next();
        }
        
        var connector = this.urlList[req.params.path];
        var url = connector.url;
        this.folder = this.folders[connector.name];
        this.proxy(url, req, res, next)
            .then(function() {
                console.log('resolved', arguments);
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
        return Q.any(promises)
            .then(function(result) {
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
            console.log('file not found, requesting from', url + req.url);
            request(url + req.url, function(error, response, body) {
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