/*jslint browser: true, nomen: true, regexp: true, vars: true, white: true */
/*global define, window, console, describe, it, before, beforeEach, after, afterEach */

define(['knockout'],
function(ko) {
    'use strict';
    console.log('[components] register components');
    
    ko.components.register('show', { require: 'app/components/show-model' });
    ko.components.register('edit', { require: 'app/components/edit-model' });
    
    ko.components.register('popup', { require: 'app/popup/viewmodel' });
    ko.components.register('route', { require: 'app/route/viewmodel' });
    ko.components.register('route-api', { require: 'app/route/api/viewmodel' });
    ko.components.register('selected-api', { require: 'app/route/api/selected/viewmodel' });
    ko.components.register('file-list', { require: 'app/route/api/selected/filelist-model' });
});