/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var CONFIG = require('config');

var path = require('path'),
	glob = require('glob'),
    _ = require('underscore'),
    globalConfig = CONFIG.util.path.require('settings'),
    
    verify = require('./helpers/verify'),
    searchFor = require('./helpers/search-for');

module.exports = {
    for: {
        get: function(filename, scenario, config, callback) {
            var active = config.active || scenario,
                href = verify(filename, active, config, globalConfig.app);
            callback && callback(href);
        },
        
        post: function(body, scenario, config, callback) {
            var activeList = (config.scenarios ? config.scenarios.active : scenario) || scenario,
                active = "",
                index = 0,
                requestPattern = 'request_',
                responsePattern = 'response_';

            if (config.hasOwnProperty('patterns')) {
                if (config.patterns.hasOwnProperty('request')) {
                    requestPattern = config.patterns.request;
                }
                if (config.patterns.hasOwnProperty('response')) {
                    responsePattern = config.patterns.response;
                }
            }
            
            var folder = path.join(globalConfig.app.data, config.source),
                ext = config.extension || '.xml',
                fileList = [],
                reject = function() {
                    var file = {
                        scenario: active,
                        request: path.join(folder, requestPattern + fileList.length + ext)
                    };
                    file.response = file.request.replace(requestPattern,  responsePattern); 
                    callback && callback(file);
                };
            if (config.scenarios && activeList) {
                activeList = activeList.split(',');
                active = activeList[index];
                if (active && config.scenarios.hasOwnProperty(active)) {
                    var defaultSearch = path.join(folder, (requestPattern + '*') + ext),
                        last = reject;
                    
                    reject = function() {
                        if (index < activeList.length - 1) {
                            ++index;
                            active = activeList[index];
                            var activeExt = ext;
                            
                            var current = config.scenarios[active];
                            
                            if (current.hasOwnProperty('extension')) {
                                activeExt = current.extension;
                            }

                            var folder = path.join(globalConfig.app.data, current.source);
                            var search = path.join(folder, (requestPattern + '*') + activeExt);
                            searchFor(body, active, config, glob.sync(search))
                            .then(function(file) {
                                file.scenario = active;
                                file.response = file.request.replace(requestPattern,  responsePattern);
                                callback && callback(file);
                            }, reject);

                            return;
                        }
                        searchFor(body, active, config, glob.sync(defaultSearch))
                        .then(function(file) {
                            file.scenario = '';
                            file.response = file.request.replace(requestPattern,  responsePattern);
                            callback && callback(file);
                        }, last);
                    };
                    
                    var current = config.scenarios[active];
                    
                    if (current.hasOwnProperty('extension')) {
                        ext = current.extension;
                    }

                    folder = path.join(globalConfig.app.data, current.source);
                }
            }
            
            var search = path.join(folder, (requestPattern + '*') + ext);
            
            fileList = glob.sync(search);
            searchFor(body, active, config, fileList)
            .then(function(file) {
                file.scenario = active;
                file.response = file.request.replace(requestPattern,  responsePattern);
                callback && callback(file);
            }, reject);
        }
    }
};