/*jslint browser: true, nomen: true, regexp: true, vars: true, white: true */
/*global define, window, console, describe, it, before, beforeEach, after, afterEach */

/*
 * Utilities
 */

define(['underscore'],
function(_) {
    'use strict';
    
	function Callback(cb, ctx) {
		this.callback = cb;
		this.context = ctx;
	}
	function Bus() {
		this._data = [];
	}
	Bus.prototype = {
		push: function(callback, object) {
			//console.log("[Bus:push]", arguments);
			if(!this.has(callback, object)) {
				this._data.push(new Callback(callback, object));
			}
		},
		pop: function(callback, object) {
			//console.log("[Bus:pop]", arguments);
			var index = this.indexOf(callback, object);
			if(index>=0) {
				delete(this._data[index]);
			}
		},
		call: function(args) {
			//console.log("[Bus:call]", arguments);
			_.each(this._data, function(cb) {
				//console.log("", "[Bus:call]", cb);
				cb.callback.call(cb.context||this, args);
			}, this);
		},
		
		has: function(callback, object) {
			//console.log("[Bus:has]", arguments);
			return _.some(this._data, function(cb, index) {
				//console.log("[Bus:index:some]", arguments);
				return (callback===cb.callback) && (object===cb.context);
			}, this);
		},
		indexOf: function(callback, object) {
			//console.log("[Bus:indexOf]", arguments);
			return _.indexOf(_.findWhere(this._data, {
				callback: callback,
				context: object
			}));
		}
	};
	
	function Utils() {

	}
	Utils.prototype = {
			type: function(val) {
				return Object.prototype.toString.call(val).replace(/^\[object (.+)\]$/,"$1").toLowerCase();
			},

			merge: function (object, add) {
				var This = this;
				_.each(add, function(value, key) {
					if (This.type(key) === "string" &&
							"type" === key.toLowerCase() && 
							"merge" === key.toLowerCase() && 
							"update" === key.toLowerCase()) {
						return;
					}
					if(typeof (value) === "object") {
						this[key] = This.type(value) === "array" ? [] : {};
						This.merge(this[key], value);
					} else {
						this[key] = value;
					}
				}, object);
			},

			update: function(object, add, space) {
				var This = this;
				if(typeof (space) === "undefined") {
					space = "";
				}
				_.each(add, function (value, key) {
					if (This.type(key) === "string" &&
							"type" === key.toLowerCase() && 
							"merge" === key.toLowerCase() && 
							"update" === key.toLowerCase() && 
							"guid" === key.toLowerCase()) {
						return;
					}
					if(typeof (value) === "object") {
						//console.log(space, key, "= {");
						this[key] = This.type(value) === "array" ? [] : {};
						This.update(this[key], value, space + " ");
						//console.log(space, "}");
					} else {
						//console.log(space, key, "=", value);
						this[key] = value;
					}
				}, object);
			},

			guid: function () {
				return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
					var r = Math.random()*16 | 0,
                        v = c === 'x' ? r : (r & 0x3 | 0x8);
					return v.toString(16);
				});
			},

			// Changes XML to JSON
			xmlToJson: function (xml) {

				// Create the return object
				var obj = {};

				if (xml.nodeType === 1) { // element
					// do attributes
					if (xml.attributes.length > 0) {
						obj["@attributes"] = {};
						for (var j = 0; j < xml.attributes.length; j++) {
							var attribute = xml.attributes.item(j);
							obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
						}
					}
				} else if (xml.nodeType == 3) { // text
					obj = xml.nodeValue;
				}

				// do children
				if (xml.hasChildNodes()) {
					for(var i = 0; i < xml.childNodes.length; i++) {
						var item = xml.childNodes.item(i);
						var nodeName = item.nodeName;
						if (typeof(obj[nodeName]) == "undefined") {
							obj[nodeName] = this.xmlToJson(item);
						} else {
							if (typeof(obj[nodeName].push) == "undefined") {
								var old = obj[nodeName];
								obj[nodeName] = [];
								obj[nodeName].push(old);
							}
							obj[nodeName].push(this.xmlToJson(item));
						}
					}
				}
				return obj;
			},

			bus: {
				_events: {},
				
				trigger: function (evt, args) {
					//console.log('[bus:trigger]', arguments, this);
					if (this._events.hasOwnProperty(evt)) {
						this._events[evt].call(args);
					}
				},

				on: function (evt, callback, object) {
					//console.log('[bus:on]', arguments, this);
					if (!this._events.hasOwnProperty(evt)) {
						this._events[evt] = new Bus();
					}
					this._events[evt].push(callback, object);
				},
				off: function (evt, callback, object) {
					//console.log('[bus:off]', arguments, this);
					if(this._events.hasOwnProperty(evt)) {
						this._events[evt].pop(callback, object);
					}
				}
			}
	};

	return new Utils();
});