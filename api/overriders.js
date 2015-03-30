var path = require('path'),
    folders = require('./folders');

function Overrides() {
    this.override = {
        if: {
            needed: function(patterns, proxy, that) {
                if (proxy.override) {
                    var override = proxy.override;
                    if (Array.isArray(proxy.override)) {
                    } else {
                        if (proxy.route.overrides && proxy.route.overrides[override]) {
                            override = proxy.route.overrides[override];
                            if (folders[override.name]) {
                                that.folder = folders[override.name];
                                patterns.unshift(path.join(folders[override.name], '*.req'));
                            }
                        }
                    }
                }
            }
        }
    };
}

module.exports = new Overrides();