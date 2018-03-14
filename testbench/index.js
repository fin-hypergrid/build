/* eslint-env browser */

'use strict';

window.onload = function() {
    window.demo = new Demo;
};

var Hypergrid = fin.Hypergrid;

function Demo() {
    var version = document.getElementById('version'),
        titleElement = document.querySelector('title');

    version.innerText = Hypergrid.prototype.version;
    titleElement.innerText = version.parentElement.innerText;

    var gridOptions = {
        // Because v3 defaults to use datasaur-local (which is still included in the build),
        // specifying it here is still optional, but may be required for v4.
        // Uncomment one of the following 2 lines to specify ("bring your own") data source:

        // dataModel: new (Hypergrid.require('datasaur-local'))(data.people1, getSchema(data.people1)),
        // DataModel: Hypergrid.require('datasaur-local'),

        data: this.data.people1,
        margin: { bottom: '17px', right: '17px' },
        plugins: this.plugins,
        // schema: myCustomSchema,
        state: { color: 'orange' }
    };

    var grid = new Hypergrid('div#hypergrid-example', gridOptions);

    Object.defineProperties(window, {
        grid: { get: function() { return grid; } },
        g: { get: function() { return grid; } },
        b: { get: function() { return grid.behavior; } },
        m: { get: function() { return grid.behavior.dataModel; } }
    });

    this.grid = grid;

    console.log('schema', grid.behavior.schema);

    this.initCellRenderers();
    this.initFormatters();
    this.initCellEditors();
    this.initEvents();
    this.initDashboard();
    this.initState();
}

Demo.prototype = {
    data: require('../demo/data/widedata'),
    initCellRenderers: require('./cellrenderers'),
    initFormatters: require('./formatters'),
    initCellEditors: require('./celleditors'),
    initEvents: require('./events'),
    initDashboard: require('./dashboard'),
    initState: require('./setState'),

    plugins: require('fin-hypergrid-event-logger'),

    reset: function() {
        this.grid.reset();
        this.initEvents();
    },

    setData: function(data, options) {
        options = !data.length ? undefined : options || {
            schema: getSchema(data)
        };
        this.grid.setData(data, options);
    },

    toggleEmptyData: function toggleEmptyData() {
        var behavior = this.grid.behavior;

        if (!this.oldData) {
            this.oldData = {
                data: behavior.dataModel.data,
                schema: behavior.schema,
                activeColumns: behavior.getActiveColumns().map(function(column) { return column.index; })
            };
            //important to set top totals first
            setData([]);
        } else {
            //important to set top totals first
            this.setData(this.oldData.data, this.oldData.schema);
            behavior.setColumnIndexes(this.oldData.activeColumns);
            delete this.oldData;
        }
    },

    resetData: function() {
        this.setData(this.data.people1);
        this.initState();
    },

    set vent(start) {
        if (start) {
            this.grid.logStart();
        } else {
            this.grid.logStop();
        }
    }
};
