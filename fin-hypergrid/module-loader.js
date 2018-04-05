'use strict';

var Hypergrid = require('fin-hypergrid');
var images = require('fin-hypergrid/images');

var REGEX_SRC_MODULES = /^fin-hypergrid\/src\/(Base|defaults)$/,
    REGEX_INTERNAL_MODULES = /^fin-hypergrid\/src\/(lib|behaviors|dataModels|features)(\/(\w[.\w]*))?$/,
    REGEX_LOCAL_MODULES = /^\.\.?\/(((\.\.?)|(\w[.\w]*))\/)*(\w[.\w]*)$/,
    REGEX_TRAILING_DEFAULTS = /(\/(index(\.js)?)?|\.js)$/;

function moduleLoader(path) { // See https://github.com/fin-hypergrid/core/wiki/Client-Modules
    var module, crumbs;

    switch (path) {
        case 'fin-hypergrid':
            module = Hypergrid;
            break;
        case 'fin-hypergrid/images':
            module = images;
            break;
        default:
            if ((crumbs = path.match(REGEX_SRC_MODULES))) {
                module = Hypergrid.src[crumbs[1]];
            } else if ((crumbs = path.match(REGEX_INTERNAL_MODULES)) && crumbs[3]) {
                module = Hypergrid.src[crumbs[1]][crumbs[3]];
            } else if ((crumbs = path.match(REGEX_LOCAL_MODULES))) {
                module = Hypergrid.modules[crumbs[5]];
            } else {
                module = Hypergrid.modules[path];
            }
    }

    if (!module) {
        var msg = 'Unknown module ' +  path,
            match = path.match(REGEX_TRAILING_DEFAULTS);

        if (match) {
            msg += ' (try omitting trailing "' + match[1] + '")';
        }

        throw msg;
    }

    return module;
}

module.exports = moduleLoader;
