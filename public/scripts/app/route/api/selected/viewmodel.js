/*jslint browser: true, nomen: true, regexp: true, vars: true, white: true */
/*global define, window, console, describe, it, before, beforeEach, after, afterEach */

define(['underscore', 'knockout', 'domain', 'messagequeue'],
function(_, ko, domain, mq) {
    'use strict';
    
    function ViewModel(params) {
        var api = ko.utils.unwrapObservable(params.value);
        var selected = ko.utils.unwrapObservable(params.selected);
        var config = ko.utils.unwrapObservable(params.config);
        console.log('[api:selected:ViewModel]', api, selected, config);
        
        this.menu = ko.observableArray();
        this.api = ko.observable(api[selected]);
        this.fileList = ko.observableArray();
        
        _.each(api, function(item, name) {
            this.menu.push({
                label: name,
                selected: ko.pureComputed({
                    read: function() {
                        if (name === params.selected()) {
                            return 'selected';
                        }
                        return '';
                    }
                }),
                selectThis: function(model) {
                    console.log('[selected-api:selectThis]', model);
                    params.selected(model.label);
                }
            });
        }, this);
        
        var model = this;
        domain.fileList({config: config, api: selected}, function(data) {
            console.log('[api:selected:ViewModel:fileList]', data);
            model.fileList(data);
        });
        
        var subscription = params.selected.subscribe(function(selected) {
            model.api(api[selected]);
            model.fileList(null);
            
            domain.fileList({config: config, api: selected}, function(data) {
                console.log('[api:selected:ViewModel:fileList]', data);
                model.fileList(data);
            });
        });
        
        this.select = function(file) {
            console.log('[api:selected:ViewModel:select]', arguments);
            mq.publish('popup', file);
        };
        
        this.dispose = function() {
            console.log('[api:selected:ViewModel:dispose]', arguments);
            subscription.dispose();
            _.each(this.menu(), function(item) {
                item.selected.dispose();
            });
        };
    }
    ViewModel.prototype = {};
    
    return {
        viewModel: ViewModel,
        template: { require: 'text!templates/selected-api.html' }
    };
});