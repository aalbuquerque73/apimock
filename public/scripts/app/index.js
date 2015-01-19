/*jslint browser: true, nomen: true, regexp: true, vars: true, white: true */
/*global define, window, console, describe, it, before, beforeEach, after, afterEach */

define(['jquery','underscore','knockout','utils','messagequeue', 'domain', 'viewmodel', 'components'],
function($, _, ko, U, MQ, domain, ViewModel) {
    'use strict';
    
    function unwrapFunction(func) {
        console.log('[unwrapFunction]', func);
        if (typeof func !== 'function') {
            return func;
        }
        else {
            return unwrapFunction(func());
        }
    }
    
    ko.bindingHandlers.save = {
        init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
            var data = valueAccessor(),
                action = allBindings.get('action') || '',
                callback = allBindings.get('callback') || function() {console.log('[save:update:click:domain]', arguments);};
            if (data) {
                console.log('[save:update]', action, data());
                $(element).click(function() {
                    console.log('[save:update:click]', arguments);
                    domain.save(action, data(), callback);
                });
            }
        },
        update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        }
    };
    
    var source = new EventSource('/api/events');
    source.addEventListener('new', function(message) {
        var data = JSON.parse(message.data);
        console.log('[EventSource:new]', data);
        MQ.publish('ServerEvent:new', data);
    }, false);
    source.addEventListener('change', function(message) {
        var data = JSON.parse(message.data);
        console.log('[EventSource:change]', data);
        MQ.publish('ServerEvent:change', data);
    }, false);
    source.addEventListener('remove', function(message) {
        var data = JSON.parse(message.data);
        console.log('[EventSource:remove]', data);
        MQ.publish('ServerEvent:remove', data);
    }, false);
    source.addEventListener('rename', function(message) {
        var data = JSON.parse(message.data);
        console.log('[EventSource:rename]', data);
        //MQ.publish('ServerEvent:rename', data);
    }, false);
    
    return {
        start: function() {
            ko.applyBindings(ViewModel.create());
        }
    };
});