/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var fs = require("fs"),
	path = require('path'),
	glob = require("glob"),
	express = require('express'),
	router = express.Router(),
	_ = require('underscore'),
    config = require('./settings'),
    utils = require('./utils'),
    
    ROUTES = config.Routes;

var appRoot = config.app.root;

config.util.logger.info("[Router]", appRoot);

function createMappings(options) {
	if (options.source === "" || options.source == null) {
		var r = require('../' + options.router);
        if (typeof r.init === "function") {
            r.init(options);
        }
        var targets;
        if (typeof options.target === 'object') {
            targets = options.target;
        } else {
            targets = [ options.target ];
        }
		_.each(r.methods, function (method) {
			if (typeof router[method] === "function") {
                _.each(targets, function(target) {
                    config.util.logger.info("Registered mapping: '%s' [%s]", target, method);
                    router[method](target, function (req, res) {
                        r[method](req, res);
                    });
                }, this);
			}
		});
		return;
	}
	var mockRoot = appRoot + options.source,
		searchPattern = mockRoot + options.pattern + options.suffix,
		files = glob.sync(searchPattern);

	if (files && files.length > 0) {
		files.forEach(function (fileName) {
			var mapping =  options.target + fileName
			.replace(mockRoot, "")
			.replace(/\?/g, "\\?")
			.replace(options.suffix, "")
			.replace(/_/g, "/");

			router.get(mapping, function (req, res) {
				var data = fs.readFileSync(fileName, "utf8");
				res.writeHead(200, {"Content-Type": options.type});
				res.write(data);
				res.end();
			});
			config.util.logger.info("Registered mapping: '%s' -> '%s'", mapping, fileName);
		});
	} else {
		config.util.logger.info("No mappings found for %s! Please check the configuration.", options.source);
	}
}

_.each(ROUTES, function (route) {
	createMappings(route);
});

module.exports = router;
