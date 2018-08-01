/* eslint-env browser */

'use strict';

/* NOTE
 *
 * What this file is:
 * * This file is browserify's entry point.
 * * This file creates the `window.fin.Hypergrid` object.
 *
 * What this file is not:
 * * This file is not a node module; it has no reference to `module.exports` or `exports`; it cannot be "required" by any other file.
 * * This file (along with module-loader.js) is blacklisted in .npmignore and is not published to npm.
 *
 * Note: The npm "main" entry point is undefined in package.json implying /index.js
 * which just contains an indirection to /src/Hypergrid/index.js.
 */

// Create the `fin` namespace if not already extant
var fin = window.fin = window.fin || {};

// Create the `fin.Hypergrid` object, which serves both as a "class" (constructor) and a namespace:
var Hypergrid = fin.Hypergrid = require('fin-hypergrid');

// Install the module loader which uses `Hypergrid.modules` defined in fin-hypergrid/src/Hypergrid/modules.js
Hypergrid.require = require('./module-loader');

// Install `src` the internal module namespace which is for the build file only
Hypergrid.src = {};

var warned = {};

// Install internal modules may not be overridden so non-configurable, non-writable
Object.defineProperties(Hypergrid.src, {
    lib: { value: {
        assignOrDelete: require('fin-hypergrid/src/lib/assignOrDelete'),
        cellEventFactory: require('fin-hypergrid/src/lib/cellEventFactory'),
        dynamicProperties: require('fin-hypergrid/src/lib/dynamicProperties'),
        dispatchGridEvent: require('fin-hypergrid/src/lib/dispatchGridEvent'),
        fields: require('fin-hypergrid/src/lib/fields'),
        graphics: require('fin-hypergrid/src/lib/graphics'),
        Canvas: require('fin-hypergrid/src/lib/Canvas'),
        InclusiveRectangle: require('fin-hypergrid/src/lib/InclusiveRectangle'),
        Registry: require('fin-hypergrid/src/lib/Registry'),

        get DataSourceOrigin() {
            if (!warned.DataSourceOrigin) {
                console.warn('The `DataSourceOrigin` module has been retired as of v3.0.0. The new default data model, `datasaur-local`, will be returned instead. Note, however, that it may be removed from the build in a future release. Developers are advised and encouraged to provide their own data model going forward. For example: `new Hypergrid({ DataSource: require(\'datasaur-local\') })`; or provide a live data model instance in the `dataSource` (small "d") option.');
                warned.DataSourceOrigin = true;
            }
            return require('datasaur-local');
        },

        get dynamicPropertyDescriptors() {
            if (!warned.dynamicPropertyDescriptors) {
                console.warn('The `dynamicPropertyDescriptors` module has been renamed as of v3.0.0 to `dynamicProperties`. (This legacy name will be removed in a future version.)');
                warned.dynamicPropertyDescriptors = true;
            }
            return require('fin-hypergrid/src/lib/dynamicProperties');
        }
    }},
    behaviors: { value: {
        Behavior: require('fin-hypergrid/src/behaviors/Behavior'),
        Local: require('fin-hypergrid/src/behaviors/Local'),
        Column: require('fin-hypergrid/src/behaviors/Column'),

        get JSON() {
            if (!warned.behaviorsJSON) {
                console.warn('fin-hypergrid/src/behaviors/src/behaviors/JSON has been renamed to Local as of v3.0.0. (Will be removed in a future release.)');
            }
            warned.behaviorsJSON = true;
            return require('fin-hypergrid/src/behaviors/Local');
        }
    }},
    cellEditors: { value: require('fin-hypergrid/src/cellEditors') },
    cellRenderers: { value: require('fin-hypergrid/src/cellRenderers') },
    dataModels: { value: require('fin-hypergrid/src/dataModels') },
    features: { value: require('fin-hypergrid/src/features') },
    Base: { value: require('fin-hypergrid/src/Base') },
    defaults: { value: require('fin-hypergrid/src/defaults') }
});

// Deprecate certain properties
Object.defineProperties(Hypergrid, {
    lib: { get: deprecated.bind(null, 'lib') },
    behaviors: { get: deprecated.bind(null, 'behaviors') },
    dataModels: { get: function() { return deprecated('dataModels').items; } },
    features: { get: deprecated.bind(null, 'features') },
    rectangular: { get: deprecated.bind(null, 'rectangular', 'modules') }
});

function deprecated(key, namespaceName) {
    namespaceName = namespaceName || 'src';

    var warning;

    switch (namespaceName) {
        case 'src':
            warning = 'Reference to the `Hypergrid.' + key + '` namespace has been deprecated as of v3.0.0 and will be removed in a future release.' +
                ' Update dereferencing of this namespace such as `Hypergrid.' + key + '.modulename` to' +
                ' `Hypergrid.require(\'fin-hypergrid/src/' + key +'/modulename\')`.' +
                ' See https://fin-hypergrid.github.io#internal-modules.';
            break;

        case 'modules':
            warning = 'Reference to the `' + key + '` external module through' +
                ' `Hypergrid.' + key + '` has been deprecated as of v3.0.0 in favor of' +
                ' `Hypergrid.require(\'' + key + '\')`.' +
                ' The deprecated usage will be removed in a future release.' +
                ' See https://fin-hypergrid.github.io#external-dependencies.';
    }

    if (!deprecated.warned[key]) {
        console.warn(warning);
        deprecated.warned[key] = true;
    }

    var namespace = Hypergrid[namespaceName];
    return (namespace.items || namespace)[key];
}
deprecated.warned = {};
