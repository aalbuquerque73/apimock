/*jslint browser: true, nomen: true, regexp: true, vars: true, white: true */
/*global define, window, console, describe, it, before, beforeEach, after, afterEach */

define(['knockout', 'domain'],
function(ko, domain) {
    'use strict';
    
    function ViewModel(params) {
        var route = ko.utils.unwrapObservable(params.value);
        console.log('[route:ViewModel]', route);
        
        this.title = ko.observable(route.config);
        this.route = ko.observable(route);
        
        this.scenario = ko.observable();
        this.scenarioData = ko.pureComputed({
            read: function() {
                return {
                    scenario: this.scenario(),
                    config: this.route().config
                };
            },
            owner: this,
            deferEvaluation: true
        });
        
        this.methods = ko.observable();
        this.api = ko.observable();
        
        var model = this;
        domain.route(route, function(data) {
            console.log('[route:domain]', data.api);
            model.scenario(data.scenario);
            model.methods(data.methods);
            model.api(data.api);
        });
        
        var subscription = params.value.subscribe(function(route) {
            model.title(route.config);
            model.route(route);
            model.scenario(null);
            model.methods(null);
            model.api(null);
            
            domain.route(route, function(data) {
                console.log('[route:domain]', data.api);
                model.scenario(data.scenario);
                model.methods(data.methods);
                if (typeof data.api === 'object' && Object.keys(data.api).length > 0) {
                    model.api(data.api);
                }
            });
        });
        
        this.dispose = function() {
            console.log('[route:ViewModel:dispose]', arguments);
            subscription.dispose();
        };
    }
    ViewModel.prototype = {};
    
    return {
        viewModel: ViewModel,
        template: { require: 'text!templates/selected-route.html' }
    };
});