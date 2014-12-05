/*jslint browser: true, nomen: true, regexp: true, vars: true, white: true */
/*global define, window, console, describe, it, before, beforeEach, after, afterEach */

define(['knockout', 'underscore'],
function(ko, _) {
    'use strict';
    
    function display(object, key) {
        if (object && key) {
            if (U.type(key) === 'array') {
                var result =null;
                _.every(key, function(value) {
                    if (object.hasOwnProperty(value)) {
                        result = object[value];
                        return false;
                    }
                    return true;
                });
                if (result != null) {
                    return result;
                }
                return object;
            }
            if (object.hasOwnProperty(key)) {
                return object[key];
            }
        }
        if (typeof object === 'object') {
            return JSON.stringify(object);
        }
        return object;
    }
    
    function ViewModel(params) {
        var value = ko.utils.unwrapObservable(params.value);
        var options = (params.options && ko.utils.unwrapObservable(params.options)) || {};
        var events = (params.events && ko.utils.unwrapObservable(params.events)) || {};
        
        console.log('[edit:ViewModel]', value);
        
        var model = this;
        var subscription = params.value.subscribe(function(value) {
            model.list([]);
            _.each(value, function(value, key) {
                model.list.push({
                    key: display(key, options.key),
                    value: display(value, options.value)
                });
            });
        });
        params.value.dispose = function() {
            console.log('[edit:ViewModel:dispose]', arguments);
            subscription.dispose();
        };
        
        this.list = ko.observableArray();
        _.each(value, function(value, key) {
            this.list.push({
                key: display(key, options.key),
                value: display(value, options.value)
            });
        }, this);
        
        this.onclick = function() {console.log('[edit:ViewModel] default onclick');};
        _.each(events, function(callback, event) {
            if (typeof this[event] === 'function') {
                console.log('[edit:ViewModel:events] setup', event, callback);
                this[event] = callback;
            }
        }, this);
    }
    ViewModel.prototype = {};
    
    return {
        viewModel: ViewModel,
        template: { require: 'text!templates/list-item.html' }
    };
});