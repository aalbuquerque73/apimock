var debug = require('debug'),
    _ = require('underscore'),
    fs = require('fs'),
    minimist = require('minimist'),
    Q = require('q'),
    path = require('path'),
    glob = require('glob');

var options = {
    string: [ 'm', 'f', 'p', 's' ],
    boolean: [ 'v', 'V', 'P', 'l' ],
    default: {
        f: null,
        m: '{{*}}',
        p: '',
        s: '_',
        v: false,
        V: false,
        l: false
    },
    alias: {
        v: 'verbose',
        m: 'map',
        f: 'filter',
        p: 'path',
        s: 'separator'
    }
};
var argv = minimist(process.argv.slice(2), options);

debug.enable('rename/errors');
if (argv.v || argv.P || argv.V) {
    debug.enable('rename/info');
    debug.enable('rename/warnings');
    if (argv.P) {
        debug.enable('rename/promise');
    }
    if (argv.V) {
        debug.enable('rename/logs');
        debug.enable('rename/promise');
    }
}

var log = debug('rename/logs'),
    plog = debug('rename/promise'),
    info = debug('rename/info'),
    warn = debug('rename/warnnings'),
    error = debug('rename/errors');

var list = glob.sync(path.join(argv.path, '*.req'));
info('Proccessing ' + list.length + ' files');

var promiseList = _.chain(list)
    .map(function(item) {
        return Q.Promise(function(resolve, reject) {
            log('checking file', item);
            fs.readFile(path.join(__dirname, item), { encoding: 'utf8' }, function(err, text) {
                if (err) {
                    plog('reject file ' + item, err);
                    reject(err);
                    return;
                }
                log('Checking file ' + item, text);
                var data = JSON.parse(text);
                var filter = [];
                if (argv.f) {
                    argv.f.split(',');
                }
                var test = _.all(filter, function(filter) {
                    var tokens = filter.split('=');
                    log(filter, tokens);
                    var vars = tokens[0].split('|');
                    return _.any(vars, function(key) {
                        if (data.hasOwnProperty(key)) {
                            return data[key].match(tokens[1]);
                        }
                        return false;
                    });
                });
                if (test) {
                    var first = true;
                    var line = argv.m.replace(/{{([\w\d,]+)}}/g, function(match, variable) {
                        var tokens = variable.split(',');
                        var sep = first ? '' : argv.s;
                        first = false;
                        log('match', match, variable, tokens);
                        for (var i = 0; i < tokens.length; ++i) {
                            if (data.hasOwnProperty(tokens[i])) {
                                var param = data[tokens[i]];
                                delete data[tokens[i]];
                                log(data);
                                return sep + param;
                            }
                        }
                        return '';
                    }).replace('{{*}}', function() {
                        var sep = first ? '' : argv.s;
                        return sep + Object.keys(data).map(function(key) { return data[key]; }).join(argv.s);
                    });
                    log('testing', data, line, filter, test);
                    plog('resolve file ' + item, line);
                    resolve({ old: item, 'new': path.join(path.dirname(item), line) });
                } else {
                    log('testing', data, filter, test);
                    plog('reject file ' + item, 'Filtered out');
                    reject('filtered out ' + item);
                }
            });
        });
    })
    .value();

Q.allSettled(promiseList)
    .then(function(list) {
        info('Renaming ' + _.chain(list)
            .filter(function(item) { return item.state === 'fulfilled' && item.value; })
            .map(function(item) { return item.value; })
             .value().length + ' files');
        _.chain(list)
            .filter(function(item) { return item.state === 'fulfilled' && item.value; })
            .map(function(item) { return item.value; })
            .each(function(item) {
                var files = {};
                _.each(item, function(name, key) {
                    files[key] = path.join(__dirname, name);
                });
                if (files.old !== (files.new + '.req')) {
                    _.each(['req', 'res', 'stats'], function(ext) {
                        fs.rename(files.old.replace(/req$/, ext), files.new + '.' + ext, function(err) {
                            if (err) {
                                error('Error renaming', item.old);
                                error(err);
                                return;
                            }
                            info('file renamed', path.basename(files.old).replace(/req$/, ext), path.basename(files.new) + '.' + ext);
                        }); 
                    });
                }
            });
        
        //var err = _.chain(list)
        //    .filter(function(item) { return item.state === 'rejected'; })
        //    .map(function(item) { return item.reason; })
        //    .value();
        //
        //console.log(err);
    });
