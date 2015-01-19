/*jslint browser: true, nomen: true, regexp: true, vars: true, white: true */
/*global define, window, console, describe, it, before, beforeEach, after, afterEach */

define(['jquery', 'underscore'],
function($, _) {
    'use strict';
    
    return {
        config: function(callback) {
            $.get('/api/domain?config')
            .done(function(data) {
                callback && callback(data);
            });
        },
        
        route: function(route, callback) {
            $.get('/api/domain?route='+route.config)
            .done(function(data) {
                callback && callback(data);
            });
        },
        
        fileList: function(api, callback) {
            $.post('/api/domain?action=files', api)
            .done(function(data) {
                callback && callback(data);
            });
        },
        
        file: function(config, callback) {
            $.post('/api/domain?action=file', config)
            .done(function (data) {
                console.log('[domain:file:post]', data);
                callback && callback(data);
            })
            .fail(function() {
                console.log('[domain:file:post] Error:', arguments);
            })
            .always(function() {
                console.log('[domain:file:post] finished:', arguments);
            });
        },
        
        save: function(type, params, callback) {
            console.log('[domain:file:post]', '/api/domain?action=save&type=' + type, params);
            $.post('/api/domain?action=save&type=' + type, params)
            .done(function (data) {
                console.log('[domain:file:post]', data);
                callback && callback(data);
            })
            .fail(function() {
                console.log('[domain:file:post] Error:', arguments);
            });
        },
        
        rename: function(params, callback) {
            console.log('[domain:rename:post]', '/api/domain?action=rename', params);
            $.post('/api/domain?action=rename', params)
            .done(function (data) {
                console.log('[domain:rename:post]', data);
                callback && callback.apply(null, data);
            })
            .fail(function() {
                console.log('[domain:rename:post] Error:', arguments);
            });
        }
    };
});