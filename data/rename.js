var _ = require('underscore'),
    fs = require('fs'),
    minimist = require('minimist'),
    Q = require('q'),
    path = require('path'),
    glob = require('glob');

var options = {
    string: [ 'm', 'f', 'p' ],
    boolean: [ 'v' ],
    default: {
        p: ''
    },
    alias: {
        v: 'verbose',
        m: 'map',
        f: 'filter',
        p: 'path'
    }
};
var argv = minimist(process.argv.slice(2), options);

console.log(argv);
console.log(path.join(argv.path, '*.req'));

var list = glob.sync(path.join(argv.path, '*.req'));
console.log(list);

var promiseList = _.chain(list)
    .map(function(item) {
        return Q.Promise(function(resolve, reject) {
            console.log('checking', item, '...');
            fs.readFile(path.join(__dirname, item), { encoding: 'utf8' }, function(err, text) {
                if (err) {
                    reject(err);
                    return;
                }
                var data = JSON.parse(text);
                var line = argv.m;
                var have = [ 0, 0 ], expected = [ 0, 0 ];
                line = line.replace(/{{(\w+)}}/g, function(match, repl) {
                    ++expected[0];
                    if (data.hasOwnProperty(repl)) {
                        ++have[0];
                        return data[repl];
                    }
                    return match;
                });
                if (argv.filter) {
                    var filter = argv.filter.split(',').map(function(item) { return item.trim(); });
                    _.each(filter, function(item) {
                        ++expected[1];
                        if (data.hasOwnProperty(item)) {
                            ++have[1];
                        }
                        var tokens = item.split('=');
                        if (tokens.length > 1) {
                            if (data.hasOwnProperty(tokens[0]) && data[tokens[0]] === tokens[1]) {
                                ++have[1];
                            }
                        }
                    });
                }
                if (expected[0] === have[0] && expected[1] === have[1]) {
                    resolve({ old: item, new: path.join(argv.path, line) });
                }
                reject({ match: have[0]===expected[0], filter: have[1]===expected[1], file: item });
            });
        });
    })
    .value();

Q.allSettled(promiseList)
    .then(function(list) {
        _.chain(list)
            .filter(function(item) { return item.state === 'fulfilled' && item.value; })
            .map(function(item) { return item.value; })
            .each(function(item) {
                var files = {};
                _.each(item, function(name, key) {
                    files[key] = path.join(__dirname, name);
                });
                console.log(files);
                _.each(['req', 'res', 'stats'], function(ext) {
                    fs.rename(files.old.replace(/req$/, ext), files.new + '.' + ext, function(err) {
                        if (err) {
                            console.error('Error renaming', item.old);
                            console.error(err);
                        }
                    }); 
                });
            });
        
        //var err = _.chain(list)
        //    .filter(function(item) { return item.state === 'rejected'; })
        //    .map(function(item) { return item.reason; })
        //    .value();
        //
        //console.log(err);
    });
