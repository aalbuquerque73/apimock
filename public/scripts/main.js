/*jslint browser: true, nomen: true, regexp: true, vars: true, white: true */
/*global define, requirejs, window, console, describe, it, before, beforeEach, after, afterEach */

requirejs.config({
	baseUrl: 'scripts',
	
	paths: {
		jquery: 'lib/jquery-2.1.0',
		underscore: 'lib/underscore-1.6.0',
		template: 'lib/jquery-tmpl',
		text: 'lib/text',
		knockout: 'lib/knockout-3.2.0',
		sammy: 'lib/sammy',
		utils: 'lib/utils',
		rx: 'lib/rx.all',
		
		application: 'app/index',
		
		messagequeue: 'app/messagequeue',
		
		viewmodel: 'app/viewmodel',
		components: 'app/components',
		domain: 'app/domain',
		
		templates: '/templates'
	},
	
	shim: {
		template: {
			deps: ['jquery'],
			exports: 'jQuery.fn.tmpl'
		},
		underscore: {
			exports: '_'
		},
		knockout: {
			deps: ['text', 'underscore', 'jquery'],
			exports: 'ko'
		},
		sammy: {
			deps: ['jquery'],
			exports: 'Sammy'
		},
		utils: {
			exports: 'Utils'
		},
		'mode/css/css': {
			deps: ['lib/codemirror']
		},
		'addon/edit/closebrackets': {
			deps: ['lib/codemirror']
		},
		'addon/edit/matchbrackets': {
			deps: ['lib/codemirror']
		},
		'addon/edit/closetag': {
			deps: ['lib/codemirror']
		},
		'app/popup/viewmodel': {
			deps: [
				   'lib/codemirror',
				   'mode/css/css',
				   'mode/htmlmixed/htmlmixed',
				   'mode/javascript/javascript',
				   'addon/edit/closebrackets',
				   'addon/edit/matchbrackets',
				   'addon/edit/closetag'
			]
		},
		application: {
			deps: ['knockout'],
			exports: 'app'
		}
	}
});

requirejs(['application'],
function(app) {
	'use strict';
	
	app.start();
});