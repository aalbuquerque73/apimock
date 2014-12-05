/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var _ = require('underscore');

var Utils = {
	type: function (val) {
		return Object.prototype.toString.call(val).replace(/^\[object (.+)\]$/, "$1").toLowerCase();
	},

	copy: function (obj) {
		var newObject = JSON.parse(JSON.stringify(obj));
		return newObject;
	},

    // TODO - unused function, should it be deleted?
	setup: function (obj) {
		var cmd = {
			"debug.level": function (value) {
				var levels = {
					none: 0,
					log: 1,
					warn: 2,
					error: 3,
					critical: 4
				};
				if (levels.hasOwnProperty(value)) {
					return levels[value];
				}
				return value;
			}
		};
		function run(obj, path) {
			console.log("[run]", arguments);
			_.each(obj, function (value, key) {
				if (cmd.hasOwnProperty(path + key)) {
					obj[key] = cmd[path + key](value);
				}
				if (typeof value === "object") {
					run(value, key + ".");
				}
			});

			return obj;
		}

		return run(obj, "");
	},

	debug: function (opts, level) {
		var levels = {
			none: {value: 0, fn: function () {}},
			log: {value: 1, fn: console.log},
			warn: {value: 2, fn: console.log},
			error: {value: 3, fn: console.log},
			critical: {value: 4, fn: console.log}
		};
		if (levels.hasOwnProperty(level)) {
			var args = Array.prototype.slice.call(arguments, 2);
			if (opts.debug == null) {
				levels[level].fn.apply(this, args);
			} else if (opts.debug.level == null) {
				levels[level].fn.apply(this, args);
			} else if (levels[level].value <= opts.debug.level) {
				levels[level].fn.apply(this, args);
			}

		}
	},
	
	search: {
		path: function (search) {
			var s = search.replace("\?", "")
                .replace(/&/g, "\/")
                .replace(/\=/g, "_")
                .replace(/_(\w+)$/, "\/$1");
			return s;
		},
		folder: function (path) {
			var s = path.replace(/^(.*)\/([\w%+-=]+)$/, "$1");
			return s;
		},
		file: function (path) {
			var s = path.replace(/^(.*)\/([\w%+-=]+)$/, "$2");
			return s;
		}
	},
	
	mergeMask: function (source, nameList, mask) {
		var index = 0;
		var ctrl = {
			S: function (number) {
				if (number == null) {
					number = index;
				}
				return Utils.decodeURI(source[nameList[number]] || "");
			},
			s: function (number, src) {
				if (number == null) {
					number = index;
				}
				++index;
				return Utils.decodeURI(source[nameList[number]] || "");
			},
			N: function (number) {
				if (number == null) {
					number = index;
				}
				return nameList[number];
			},
			n: function () {
				return nameList[index++];
			},
			d: function () {
				return index++;
			}
		};
		var ctrlPlus = {
			S: function (number, src) {
				if (number == null) {
					number = index;
				}
				if (source[nameList[number]] != null) {
					return src[number] || "";
				}
				return "";
			},
			s: function (number, src) {
				if (number == null) {
					number = index;
				}
				++index;
				if (source[nameList[number]] != null) {
					return src[number] || "";
				}
				return "";
			},
			N: function (number) {
				if (number == null) {
					number = index;
				}
				return nameList[number];
			},
			n: function () {
				return nameList[index++];
			},
			d: function () {
				return index++;
			}
		};
		if (Utils.type(mask) == "array") {
			var sep = "-";
			var count = (mask[0].match(/%/g) || []).length + 1;
			if (mask[count] != null) {
				sep = mask[count];
			}
			index = 0;
			for (var i=1; i<count; ++i) {
				mask[i] = ((i>1)?sep:"") + mask[i].replace(/%(\d+)?(\w)/g, function (match, number, cmd) {
					if (ctrl.hasOwnProperty(cmd)) {
						return ctrl[cmd](number);
					}
					return match;
				});
			}
			var src = mask[0];
			mask.splice(0,1);
			index = 0;
			return src.replace(/%(\d+)?(\w)/g, function (match, number, cmd) {
				if (ctrlPlus.hasOwnProperty(cmd)) {
					return ctrlPlus[cmd](number, mask);
				}
				return match;
			});
		}
		return mask[0].replace(/%(\d+)?(\w)/g, function (match, number, cmd) {
			if (ctrl.hasOwnProperty(cmd)) {
				return ctrl[cmd](number);
			}
			return match;
		});
	},
	
	decodeURI: function(text) {
		return decodeURI(text||"").replace(/[\/:-]/g, '_');
	},
	

	xmlParse: function(xml) {
		var doc = [];
		var head = [];
		xml.replace(/<(\/)?(\w+)\s*([^\>]+)?>([^<]+)?/gm, function (match, close, element, args, content) {
			if (close) {
				doc = head.pop();
				return match;
			}
			var e = {
				name: element,
				args: {},
				text: (content) ? content.trim() : '',
				children: []
			};
			if (args != null) {
				args.replace(/([\w\.-]+)\s*="([^"]+)/g, function (match, name, value) {
					e.args[name] = value;
				});
			}
			doc.push(e);
			if (!args || !args.match(/\/$/)) {
				head.push(doc);
				doc = e.children;
			}
			return match;
		});
		return doc;
	}
};

module.exports = Utils;