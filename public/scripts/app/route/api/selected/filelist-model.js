/*jslint browser: true, nomen: true, regexp: true, vars: true, white: true */
/*global define, window, console, describe, it, before, beforeEach, after, afterEach */

define(['underscore', 'knockout', 'messagequeue', 'utils', 'domain'],
function(_, ko, mq, U, domain) {
    'use strict';
    
    function observablisate(data) {
        if (typeof data === 'object') {
            var ret = {};
            if (U.type(data) === 'array') {
                ret = [];
            }
            _.each(data, function(value, key) {
                ret[key] = ko.observable(value);
            });
            
            return ret;
        }
        return data;
    }
    
    function ViewModel(params) {
        var filelist = ko.utils.unwrapObservable(params.value);
        
        console.log('[api:selected:filelist:ViewModel]', filelist);
        
        this.scenarios = ko.observableArray(filelist.scenarios);
        this.scenario = ko.observable(filelist.scenarios[Object.keys(filelist.scenarios)[0]]);
        this.fileList = ko.observableArray(observablisate(filelist[this.scenario()]));
        
        var model = this;
        
        this.select = function(selected) {
            console.log('[api:selected:filelist:ViewModel:select]', selected);
            model.scenario(selected);
            model.fileList(observablisate(filelist[selected]));
        };
        
        this.selectFile = function(selected) {
            console.log('[api:selected:filelist:ViewModel:select]', selected);
            selected.config = filelist.config.config;
            selected.api = filelist.config.api;
            selected.rename = function(data) {
                if (data) {
                    var index = filelist[model.scenario()].indexOf(selected);
                    console.log('[api:selected:filelist:ViewModel:selectFile]', index, selected, data);
                    domain.rename(data, function(data) {
                        if (data[0] == 'OK') {
                            console.log('[api:selected:filelist:ViewModel:selectFile:rename]', data, model.fileList()[index]());
                            model.fileList()[index]({
                                name: data[1].file1.name,
                                file: data[1].file1.href,
                                config: model.fileList()[index]().config
                            });
                        }
                    });
                }
            };
            mq.publish('popup', selected);
        };
        
        this.active = function(selected) {
            console.log('[api:selected:filelist:ViewModel:active]', selected, model.scenario());
            return (selected === model.scenario());
        };
        
        var subscription = params.value.subscribe(function(filelist) {
            this.scenarios(filelist.scenarios);
            this.scenario(filelist.scenarios[Object.keys(filelist.scenarios)[0]]);
            this.fileList(filelist[this.scenario()]);
        });
        
        this.dispose = function() {
            console.log('[api:selected:filelist:ViewModel:dispose]');
            subscription.dispose();
        };
    }
    ViewModel.prototype = {};
    
    return {
        viewModel: ViewModel,
        template: { require: 'text!templates/file-list.html' }
    };
});