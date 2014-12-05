/*jslint node: true, nomen: true, regexp: true, vars: true */
"use strict";

if (typeof String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function (str) {
        return this.indexOf(str) === 0;
    };
}

module.exports = String.prototype.startsWith;