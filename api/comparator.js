/* jshint eqnull:true */
var _ = require('underscore'),
    Q = require('q');

function parse(str) {
    if (typeof str === 'string') {
        try {
            return JSON.parse(str, function(key, value) {
                if (key === '__comment__') {
                    return undefined;
                }
                return value;
            });
        } catch(e) {
            console.warn(e);
        }
    }
    return str;
}

var filters = [
    function (data) { return data.replace(/([\.\[\(\$\?\+\*\\])/g, '\\$1'); },
    function (data) { return data.replace(/&rx;(.*?)&rx;/g, function (match, param) {return param.replace(/\\(?!\\)/g, ''); }); }
];

function equals(obj1, obj2) {
    obj1 = parse(obj1);
    obj2 = parse(obj2);
    var tp1 = typeof obj1, tp2 = typeof obj2;
    if (obj1 != null && obj1 != null && tp1 === tp2 && tp1 === 'object') {
        var keys1 = Object.keys(obj1).sort();
        var keys2 = Object.keys(obj2).sort(function(a, b) {
            a = a.replace(/^ignore:/, '');
            b= b.replace(/^ignore:/, '');
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }
            return 0;
        });
        _.each(keys2, function(item, pos) {
            if (item.match(/^ignore:/)) {
                var key = item.replace(/^ignore:/, '');
                delete keys1[pos];
                delete keys2[pos];
            }
        });
        var keys = _.chain(keys1).union(keys2).unique().filter(function(item) { return item; }).value();
        return Q.all(_.map(keys, function(item) {
            if (obj1.hasOwnProperty(item) && !obj2.hasOwnProperty(item)) {
                return Q.Promise(function(resolve, reject) { reject(new Error('Item ' + item + ' not found')); });
            }
            if (!obj1.hasOwnProperty(item) && obj2[item] !== '&rx;.*&rx;' && obj2[item] !== '&rx;.*?&rx;') {
                return Q.Promise(function(resolve, reject) { reject(new Error('Item ' + item + ' not found')); });
            }
            var tp1 = typeof obj1[item], tp2 = typeof obj2[item];
            if (tp1 === tp2 && tp1 === 'object') {
                return equals(obj1[item], obj2[item]);
            }
            if (obj1[item].match(_.reduce(filters, function(val, cb) { return cb(val); }, obj2[item]))) {
                return Q.Promise(function(resolve) { return resolve(true); });
            }
            return Q.Promise(function(resolve, reject) { return reject(false); }); 
        }));
    }
    return Q.Promise(function(resolve) { return resolve(true); });
}

module.exports = equals;
module.exports.parse = parse;