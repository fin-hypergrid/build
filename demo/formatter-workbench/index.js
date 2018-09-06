'use strict';

var grid, tabBar, tutorial, callApi;

var tutTOC = [
    'Table of Contents.html',
    'Welcome.html',
    'The Workench Interface.html',
    [
        'The Hypergrid Section.html',
        'The Editor Section.html',
        'The Tutorial Section.html'
    ],
    'The Data Tab (Activity 1).html',
    [
        'Activity 2.html',
        'Activity 3.html'
    ],
    'The State Tab (Activity 4).html',
    [
        'Properties Basics.html',
        'Activity 5.html'
    ],
    'The Localizers Tab.html',
    [
        'Activity 6.html',
        'Adding a new localizer.html',
        'Activity 7.html'
    ],
    'The Cell Editors Tab (Activity 8).html',
    [
        'Activity 9.html'
    ],
    'Validation.html',
    [
        'The parse() method.html',
        'The invalid() method.html',
        'Activity 10 - Returning parsing errors.html'
    ]
];

window.onload = function() {
    var NEW = '(New)';
    var isCamelCase = /[a-z][A-Z]/;
    var DANGER_COLOR = '#cb2431', DISABLED_COLOR = 'rgb(204, 204, 204)';
    var saveFuncs = {
        editor: saveCellEditor,
        localizer: saveLocalizer
    };
    var defaults = {
        data: [
            { symbol: 'APPL', name: 'Apple Inc.', prevclose: 93.13, change: -.0725 },
            { symbol: 'MSFT', name: 'Microsoft Corporation', prevclose: 51.91, change: .0125 },
            { symbol: 'TSLA', name: 'Tesla Motors Inc.', prevclose: 196.40, change: .08 },
            { symbol: 'IBM', name: 'International Business Machines Corp', prevclose: 155.35, change: -.02375 }
        ],
        state: {
            showRowNumbers: false, // override the default (true)
            editable: true, // included here for clarity; this is the default value
            editor: 'Textfield', // override the default (undefined)
            columns: {
                prevclose: {
                    halign: 'right'
                }
            }
        }
    };

    grid = new fin.Hypergrid();

    var tabBars = document.querySelectorAll('.curvy-tabs-container');

    tabBar = new CurvyTabs(tabBars[0]);
    tabBar.paint();

    var flatTOC = [];
    walk(tutTOC);
    function walk(list) {
        list.forEach(function(item) {
            if (Array.isArray(item)) {
                walk(item);
            } else {
                flatTOC.push(item);
            }
        });
    }
    tutorial = new Tutorial(tabBars[1], 'tutorial/', flatTOC);

    callApi('data'); // inits both 'data' and 'state' editors

    initLocalsButtons();

    Object.keys(scripts).forEach(function(key) {
        initObjectEditor(key);
    });

    document.getElementById('reset-all').onclick = function() {
        if (confirm('Clear localStorage and reload?')) {
            localStorage.clear();
            location.reload();
        }
    };

    grid.addEventListener('fin-after-cell-edit', function(e) {
        document.getElementById('data').value = stringifyAndUnquoteKeys(grid.behavior.getData());
    });

    var dragger, divider = document.querySelector('.divider');
    divider.addEventListener('mousedown', function(e) {
        dragger = {
            delta: e.clientY - divider.getBoundingClientRect().top,
            gridHeight: grid.div.getBoundingClientRect().height,
            tabHeight: tabBar.container.getBoundingClientRect().height
        }
        e.stopPropagation(); // no other element needs to handle
    });
    document.addEventListener('mousemove', function(e) {
        if (dragger) {
            var newDividerTop = e.clientY - dragger.delta,
                oldDividerTop = divider.getBoundingClientRect().top,
                topDelta = newDividerTop - oldDividerTop,
                newGridHeight = dragger.gridHeight + topDelta,
                newTabHeight = dragger.tabHeight - topDelta;

            if (newGridHeight >= 65 && newTabHeight >= 130) {
                divider.style.borderTopStyle = divider.style.borderTopColor = null; // revert to :active style
                divider.style.top = newDividerTop + 'px';
                grid.div.style.height = (dragger.gridHeight = newGridHeight) + 'px';
                tabBar.container.style.height = (dragger.tabHeight = newTabHeight) + 'px';
            } else {
                // force :hover style when out of range even though dragging (i.e., :active)
                divider.style.borderTopStyle = 'double';
                divider.style.borderTopColor = '#444';
            }

            e.stopPropagation(); // no other element needs to handle
            e.preventDefault(); // no other drag effects, please
        }
    });
    document.addEventListener('mouseup', function(e) {
        dragger = undefined;
    });

    function callApi(methodName, type, confirmation) {
        // When `methodName` is `undefined` or omitted promote 2nd and 3rd params
        if (!methodName || !isCamelCase.test(methodName)) {
            confirmation = type;
            type = methodName;
            methodName = 'set' + capitalize(type);
        }

        var el = document.getElementById(type); // tab editor's textarea element
        var value;

        if (el.value) {
            value = el.value;
        } else if ((value = localStorage.getItem(type))) {
            el.value = value;
        } else {
            localStorage.setItem(type, el.value = value = stringifyAndUnquoteKeys(defaults[type]));
        }

        // We're using eval here instead of JSON.parse because we want to allow unquoted keys.
        // Note: L-value must be inside eval because R-value beginning with '{' is eval'd as BEGIN block.
        eval('value =' + value);

        if (methodName === 'setData') {
            grid.setData(value, { schema: [] });
            callApi('state'); // reapply state after resetting schema (also inits state editor on first time called)
        } else {
            grid[methodName](value);
        }

        if (confirmation) {
            feedback(el.parentElement, confirmation);
        }

        document.getElementById('reset-' + type).onclick = resetTextEditor;
    }

    function resetTextEditor() {
        var type = this.id.replace(/^reset-/, '');
        if (confirm('Reset the ' + capitalize(type) + ' tab editor to its default?')) {
            document.getElementById(type).value = '';
            localStorage.removeItem(type);
            callApi(type);
        }
    }

    function resetObject() {
        var type = this.id.replace(/^reset-/, '');
        var name = document.getElementById(type + '-dropdown').value;
        if (!isDisabled(this) && confirm('Reset the "' + name + '" ' + type + ' to its default?')) {
            var script = getDefaultScript(type, name);
            localStorage.setItem(type + '_' + name, script);
            document.getElementById(type + '-script').value = script;
            enableResetAndDeleteIcons(type, name);
        }
    }

    function deleteObject() {
        var type = this.id.replace(/^delete-/, '');
        var dropdown = document.getElementById(type + '-dropdown');
        var name = dropdown.value;
        if (!isDisabled(this) && confirm('Delete the "' + name + '" ' + type + '?')) {
            dropdown.options.remove(dropdown.selectedIndex);
            dropdown.selectedIndex = 0; // "(New)"
            dropdown.onchange();
            localStorage.removeItem(type + '_' + name);
        }
    }

    function isDisabled(el) {
        var svg = el.firstElementChild;
        return window.getComputedStyle(svg).color === DISABLED_COLOR;
    }

    function capitalize(str) {
        return str[0].toUpperCase() + str.substr(1);
    }

    function initLocalsButton(type, locals) {
        var el = document.getElementById(type + '-dropdown').parentElement.querySelector('.locals');
        locals = locals.sort();
        el.title = locals.join('\n');
        el.onclick = function() {
            alert('Local variables: ' + locals.join(', '));
        };
    }

    function initLocalsButtons() {
        initLocalsButton('editor', ['module', 'exports', 'CellEditor'].concat(Object.keys(grid.cellEditors.items)));
        initLocalsButton('localizer', ['module', 'exports']);
    }

    function initObjectEditor(type) {
        var dropdownEl = document.getElementById(type + '-dropdown'),
            resetEl = document.getElementById('reset-' + type),
            deleteEl = document.getElementById('delete-' + type),
            scriptEl = document.getElementById(type + '-script'),
            addButtonEl = dropdownEl.parentElement.querySelector('.api'),
            prefix = type + '_',
            save = saveFuncs[type],
            newScript;

        // STEP 1: Save default scripts to local storage not previously saved
        scripts[type].map(extractName).sort().forEach(function(name) {
            var script = getDefaultScript(type, name);
            if (name === NEW) {
                dropdownEl.add(new Option(name));
                newScript = scriptEl.value = script;
            } else if (!localStorage.getItem(prefix + name)) {
                localStorage.setItem(prefix + name, script);
            }
        });

        // STEP 2: Load scripts from local storage, re-saving each which adds it to drop-down
        for (var i = 0; i < localStorage.length; ++i) {
            var key = localStorage.key(i);
            if (key.substr(0, prefix.length) === prefix) {
                save(localStorage.getItem(key), dropdownEl);
            }
        }

        // STEP 3: Reset drop-down to first item: "(New)"
        dropdownEl.selectedIndex = 0;
        enableResetAndDeleteIcons(type); // hides icons

        // STEP 4: Assign handlers
        resetEl.onclick = resetObject;
        deleteEl.onclick = deleteObject;

        dropdownEl.onchange = function() {
            var name = this.value;

            if (name === NEW) {
                scriptEl.value = newScript;
                enableResetAndDeleteIcons(type);
            } else {
                scriptEl.value = localStorage.getItem(prefix + name);
                enableResetAndDeleteIcons(type, name);
            }
        };

        scriptEl.oninput = function() {
            enableResetAndDeleteIcons(type, dropdownEl.value);
        };

        addButtonEl.onclick = function() {
            save(scriptEl.value, dropdownEl);
            grid.repaint();
        };
    }

    function enableResetAndDeleteIcons(type, name) {
        var resetEl = document.getElementById('reset-' + type);
        var deleteEl = document.getElementById('delete-' + type);

        deleteEl.style.display = resetEl.style.display = name ? null : 'none'; // null means revert to start value

        if (name) {
            var defaultScript = name && getDefaultScript(type, name);
            var alteredFromDefault = defaultScript && defaultScript !== document.getElementById(type + '-script').value;

            disable(resetEl, !alteredFromDefault);
            disable(deleteEl, !name || defaultScript);
        }
    }

    function disable(el, disabled) {
        el.firstElementChild.style.color = disabled ? DISABLED_COLOR : DANGER_COLOR;
        el.style.cursor = disabled ? 'no-drop' : 'pointer';
    }

    function getDefaultScript(type, name) {
        return scripts[type].find(isScriptByName.bind(null, name));
    }

    function isScriptByName(name, script) {
        return extractName(script) === name;
    }

    function extractName(script) {
        var match = script.match(/\.extend\('([^']+)'|\.extend\("([^"]+)"|\bname:\s*'([^']+)'|\bname:\s*"([^"]+)"/);
        return match[1] || match[2] || match[3] || match[4];
    }

    function stringifyAndUnquoteKeys(json) {
        return JSON.stringify(json, undefined, 2)
            .replace(/(  +)"([a-zA-Z$_]+)"(: )/g, '$1$2$3'); // un-quote keys
    }

    function saveCellEditor(script, select) {
        var cellEditors = grid.cellEditors;
        var editorNames = Object.keys(cellEditors.items);
        var editors = editorNames.map(function(name) {
            return cellEditors.items[name];
        });
        var exports = {}, module = { exports: exports };
        var formalArgs = [null, 'module', 'exports', 'CellEditor'] // null is for bind's thisArg
            .concat(editorNames) // additional params
            .concat(script); // function body
        var actualArgs = [module, exports, cellEditors.BaseClass]
            .concat(editors);

        try {
            var closure = new (Function.prototype.bind.apply(Function, formalArgs)); // calls Function constructor using .apply
            closure.apply(null, actualArgs);
            var Editor = module.exports;
            var name = Editor.prototype.$$CLASS_NAME;
            if (!(Editor.prototype instanceof cellEditors.BaseClass)) {
                throw 'Cannot save cell editor "' + name + '" because it is not a subclass of CellEditor (aka grid.cellEditors.BaseClass).';
            }
            if (!name || name === NEW) {
                throw 'Cannot save cell editor. A name other than "(New)" is required.';
            }
        } catch (err) {
            console.error(err);
            alert(err + '\n\nAvailable locals: ' + formalArgs.slice(1, formalArgs.length - 1).join(', ') +
                '\n\nNOTE: Cell editors that extend directly from CellEditor must define a `template` property.');
            return;
        }

        cellEditors.add(Editor);

        localStorage.setItem('editor_' + name, script);

        addOptionInAlphaOrder(select, name);

        enableResetAndDeleteIcons('editor', name);

        if (select) {
            feedback(select.parentElement);
        }

        initLocalsButtons();
    }

    function saveLocalizer(script, select) {
        var module = {};

        try {
            var closure = new Function('module', script);
            closure(module);
            var localizer = module.exports;
            var name = localizer.name;
            if (!name || name === NEW) {
                throw 'Cannot save localizer. A `name` property with a value other than "(New)" is required.';
            }
            grid.localization.add(localizer);
        } catch (err) {
            console.error(err);
            alert(err + '\n\nAvailable locals:\n\tmodule');
            return;
        }

        localStorage.setItem('localizer_' + name, script);

        addOptionInAlphaOrder(select, name);

        enableResetAndDeleteIcons('localizer', name);

        if (select) {
            feedback(select.parentElement);
        }
    }

    function addOptionInAlphaOrder(el, text, value) {
        if (!el) {
            return;
        }

        var optionEls = Array.prototype.slice.call(el.options);

        var index = optionEls.findIndex(function(optionEl) {
            return optionEl.textContent === text;
        });
        if (index >= 0) {
            el.selectedIndex = index;
            return; // already in dropdown
        }

        var firstOptionGreaterThan = optionEls.find(function(optionEl) {
            return optionEl.textContent > text;
        });

        el.value = name;
        if (el.selectedIndex === -1) {
            el.add(new Option(text, value), firstOptionGreaterThan);
            el.value = value || text;
        }
    }

    function feedback(content, confirmation) {
        var el = content.querySelector('span.feedback');
        if (!confirmation) {
            confirmation = 'Saved';
        }
        el.innerText = confirmation;
        el.style.display = 'inline';
        setTimeout(function() {
            el.style.display = 'none';
        }, 750 + 50 * confirmation.length);
    }

    window.callApi = callApi; // for access from index.html `onclick` handlers
};