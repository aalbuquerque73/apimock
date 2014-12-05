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
        console.log('[EventSource:new]', arguments);
        MQ.publish('ServerEvent:new', JSON.parse(message.data));
    }, false);
    source.addEventListener('change', function(message) {
        console.log('[EventSource:change]', arguments);
        MQ.publish('ServerEvent:change', JSON.parse(message.data));
    }, false);
    source.addEventListener('remove', function(message) {
        console.log('[EventSource:remove]', arguments);
        MQ.publish('ServerEvent:remove', JSON.parse(message.data));
    }, false);
    source.addEventListener('rename', function(message) {
        console.log('[EventSource:rename]', arguments);
        MQ.publish('ServerEvent:rename', JSON.parse(message.data));
    }, false);
    
    return {
        start: function() {
            ko.applyBindings(ViewModel.create());
        }
    };
});