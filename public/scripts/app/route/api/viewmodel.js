/*jslint browser: true, nomen: true, regexp: true, vars: true, white: true */
/*global define, window, console, describe, it, before, beforeEach, after, afterEach */

define(['knockout', 'domain'],
function(ko, domain) {
    'use strict';
    
    function ViewModel(params) {
        var api = ko.utils.unwrapObservable(params.value);
        var config = ko.utils.unwrapObservable(params.config) || "";
        
        console.log('[api:ViewModel]', api, config);
        
        this.api = ko.observable(api);
        this.config = ko.observable(config);
        
        this.selectedApi = ko.observable();
        
        var model = this;
        this.select = function(selected) {
            console.log('[api:ViewModel:select]', api[selected.key], selected, this);
            model.selectedApi(selected.key);
        };
        
        var subscription = params.value.subscribe(function(api) {
            model.api(api);
        });
        
        this.dispose = function() {
            console.log('[api:ViewModel:dispose]', arguments);
            subscription.dispose();
        };
    }
    ViewModel.prototype = {};
    
    return {
        viewModel: ViewModel,
        template: { require: 'text!templates/route-api.html' }
    };
});