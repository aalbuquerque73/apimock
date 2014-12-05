/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

var path = require('path'),
    fs = require('fs');

function verify(filename, scenario, config, app) {
    var href = config.href,
        ext = config.extension || '',
        file = path.join(app.data, config.source, filename + ext),
        saveFile = file;
    if (config.scenarios && scenario && config.scenarios.hasOwnProperty(scenario)) {
        var current = config.scenarios[scenario];
        

        if (current.hasOwnProperty('href')) {
            href = current.href;
        }
        if (current.hasOwnProperty('extension')) {
            ext = current.extension;
        }

        saveFile = path.join(app.data, current.source, filename + ext);
        if (fs.existsSync(saveFile)) {
            file = saveFile;
        }
    }
    
    return {
        scenario: scenario,
        href: href,
        read: file,
        write: saveFile
    };
}

module.exports = verify;