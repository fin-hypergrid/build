'use strict';

document.addEventListener('keydown', function(e) {
    switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
            window.top.document.dispatchEvent(new KeyboardEvent('keydown', { key: e.key }));
    }
});