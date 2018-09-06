'use strict';

window.addEventListener('load', function() {
    setScrollWarning();
    setTabLinks();
    setTitleAttribs();

    if (!window.top.tabBar) {
        return;
    }

    document.addEventListener('keydown', function(e) {
        switch (e.key) {
            case 'ArrowLeft':
            case 'ArrowRight':
                window.top.document.dispatchEvent(new KeyboardEvent('keydown', { key: e.key }));
        }
    });

    document.addEventListener('scroll', setScrollWarning);

    var snippets = document.getElementsByClassName('snippet'),
        hasSnippets = snippets.length > 0,
        tabBar = window.top.tutorial.tabBar,
        snippetTabName = 'Code Snippets';

    tabBar.toggle(snippetTabName, hasSnippets);

    if (hasSnippets) {
        window.top.snippetOnLoad = function() {
            var body = this.document.body;
            Array.prototype.slice.call(snippets).forEach(function (el) {
                body.appendChild(el);
            });
        };
        tabBar.getTab(snippetTabName).querySelector('iframe').contentWindow.location.reload();
    }

    function setScrollWarning() {
        var i = window.scrollY + window.innerHeight - document.body.scrollHeight;
        window.top.document.getElementById('scroll-warning').style.opacity = i < -100 ? 1 : i > 0 ? 0 : -i / 100;
    }

    function setTabLinks() {
        document.querySelectorAll('span.tab').forEach(function(el) {
            el.href = 'javascript:void(0)';
            el.onclick = goToTab;
            el.style.backgroundColor = findTab.call(el).content.style.backgroundColor;
            el.title = 'Shortcut: Click here to select the ' + el.innerText + ' tab.';
        });
    }

    function goToTab() {
        var tab = findTab.call(this);
        if (tab.content) {
            tab.bar.selected = tab.content;
        }
    }

    function findTab() {
        var result = {};
        [window.top.tabBar, window.top.tutorial.tabBar].find(function(tabBar) {
            return (result.content = (result.bar = tabBar).contents.querySelector('[name="' + this.innerText + '"]'));
        }, this);
        if (!result.bar) {
            throw new ReferenceError('No such tab "' + this.innerText + '" on either tab bar!');
        }
        return result;
    }

    function setTitleAttribs() {
        document.querySelectorAll('a[target=doc]').forEach(function (el) {
            el.title = 'Click to open the API documentation for "' + el.innerText + '" in another window.';
        });
        document.querySelectorAll('a[target=mdn]').forEach(function (el) {
            el.title = 'Click to open the Mozilla Developer Network page for "' + el.innerText + '" in another window.';
        });
    }
});