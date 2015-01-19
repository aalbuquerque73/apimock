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
        console.group('api:selected:filelist:ViewModel');
        var filelist = ko.utils.unwrapObservable(params.value);
        
        console.log('[api:selected:filelist:ViewModel]', filelist);
        
        this.scenarios = ko.observableArray(filelist.scenarios);
        this.scenario = ko.observable(filelist.scenarios[Object.keys(filelist.scenarios)[0]]);
        this.fileList = ko.observableArray(observablisate(filelist[this.scenario()]));
        
        var model = this;
        
        this.select = function(selected) {
            console.group('api:selected:filelist:ViewModel');
            console.log('[api:selected:filelist:ViewModel:select]', selected);
            model.scenario(selected);
            model.fileList(observablisate(filelist[selected]));
            console.groupEnd();
        };
        
        this.selectFile = function(selected) {
            console.group('api:selected:filelist:ViewModel');
            console.log('[api:selected:filelist:ViewModel:select]', selected);
            selected.config = filelist.config.config;
            selected.api = filelist.config.api;
            /*selected.rename = function(data) {
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
            };*/
            mq.publish('popup', selected);
            console.groupEnd();
        };
        
        this.active = function(selected) {
            console.group('api:selected:filelist:ViewModel');
            console.log('[api:selected:filelist:ViewModel:active]', selected, model.scenario());
            console.groupEnd();
            return (selected === model.scenario());
        };
        
        var subscription = params.value.subscribe(function(filelist) {
            console.group('api:selected:filelist:ViewModel');
            console.log('[api:selected:filelist:ViewModel:value]', filelist);
            this.scenarios(filelist.scenarios);
            this.scenario(filelist.scenarios[Object.keys(filelist.scenarios)[0]]);
            this.fileList(filelist[this.scenario()]);
            console.groupEnd();
        });
        
        var renameSubscription = mq.subscribe('ServerEvent:rename', function(message) {
            console.group('api:selected:filelist:ViewModel');
            _.map(message, function(item) {
                console.group('api:selected:filelist:ViewModel:ServerEvent:rename');
                console.log('[api:selected:filelist:ViewModel:ServerEvent:rename.map]', item, this.fileList());
                _.chain(this.fileList())
                    .filter(function(test) {
                        var unwraped = ko.utils.unwrapObservable(test());
                        return unwraped.file === item.new;
                    }, this)
                    .map(function(item) {
                        var unwraped = ko.utils.unwrapObservable(item());
                        console.log('[api:selected:filelist:ViewModel:ServerEvent:rename.map.map]', this.scenario(), unwraped);
                        item.valueHasMutated();
                    }, this);
                console.groupEnd();
            }, this);
            console.groupEnd();
        }, this);
        
        this.dispose = function() {
            console.group('api:selected:filelist:ViewModel');
            console.log('[api:selected:filelist:ViewModel:dispose]');
            subscription.dispose();
            renameSubscription.dispose();
            console.groupEnd();
        };
        console.groupEnd();
    }
    ViewModel.prototype = {};
    
    return {
        viewModel: ViewModel,
        template: { require: 'text!templates/file-list.html' }
    };
});