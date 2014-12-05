/*jslint browser: true, nomen: true, regexp: true, vars: true, white: true */
/*global define, window, console, describe, it, before, beforeEach, after, afterEach */

define(['jquery', 'underscore', 'knockout', 'domain', 'messagequeue'],
function($, _, ko, domain, mq) {
    'use strict';
    
    var model = {
        create: function() {
            this.app = ko.observable();
            this.server = ko.observable();
            this.options = ko.observable();
            
            this.routes = ko.observableArray();
            
            this.selectedRoute = ko.observable();
            
            // must be before any function that needs to use the viewmodel
            var model = this;
            
            this.popup = ko.observable();
            var subscription = mq.subscribe('popup', function(config) {
                console.log('[selectFile]', arguments);
                domain.file(config, function (data) {
                    console.log('[selectFile]', data);
                    model.popup({data:data, config:config});
                });
            });
            
            this.select = function(route) {
                console.log('[ViewModel:select]', route);
                model.selectedRoute(route);
            };
            
            this.active = function (selected) {
                return (selected === model.selectedRoute());
            };
            
            this.selectFile = function (config) {
                console.log('[selectFile]', arguments);
                domain.file(config, function (data) {
                    console.log('[selectFile]', data);
                    model.popup(data);
                });
            };
            
            domain.config(function(data) {
                console.log('[ViewModel:Init]', data);
                model.app(data.app);
                model.server(data.Server);
                model.options(data.Options);
                model.routes(data.Routes);
            });
            
            this.dispose = function() {
            console.log('[ViewModel:dispose]', arguments);
                subscription.dispose();
            };
            
            return Object.create(this);
        }
    };
    
    return model;
});