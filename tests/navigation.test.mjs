import test from 'node:test';
import assert from 'node:assert/strict';
import { setActiveSection } from '../js/dom.js';
import { isTypingTarget } from '../js/utils.js';
import { getStoredNickname, setStoredNickname } from '../js/storage.js';

function harness() {
    const make = id => {
        const attrs = new Map(), classes = new Set();
        return { id, dataset: {},
            classList: { contains: name => classes.has(name), add: name => classes.add(name), remove: name => classes.delete(name),
                toggle(name, on) { on ? classes.add(name) : classes.delete(name); } },
            getAttribute: name => attrs.get(name) ?? null, setAttribute: (name, value) => attrs.set(name, value), removeAttribute: name => attrs.delete(name),
            focus(options) { globalThis.document.activeElement = this; this.focusOptions = options; },
        };
    };
    const sections = ['home', 'pet', 'peak-duel'].map(make), main = make('main-page');
    const buttons = sections.map(section => { const button = make(`nav-${section.id}`); button.dataset.target = section.id; return button; });
    const scrolls = [];
    globalThis.window = { scrollTo: options => scrolls.push(options) };
    globalThis.document = { activeElement: null, getElementById: id => id === main.id ? main : null, querySelectorAll: () => [] };
    return { sections, main, buttons, scrolls, select: id => setActiveSection(sections, buttons, id) };
}

test('leaving a scrolled lobby brings the new page to the top and moves focus off its hidden launcher', () => {
    const h = harness();
    h.select('home');
    document.activeElement = h.buttons[0];
    assert.equal(h.select('pet'), true);
    assert.deepEqual(h.scrolls, [{ top: 0, left: 0, behavior: 'instant' }]);
    assert.equal(document.activeElement, h.sections[1]);
    assert.deepEqual(h.sections[1].focusOptions, { preventScroll: true });
    assert.equal(h.sections[0].classList.contains('hidden'), true);
});

test('unknown destinations preserve the visible page, selected navigation and scroll position', () => {
    const h = harness(); h.select('home');
    assert.equal(h.select('missing-game'), false);
    assert.equal(h.main.getAttribute('data-active-section'), 'home');
    assert.equal(h.sections[0].classList.contains('hidden'), false);
    assert.equal(h.buttons[0].getAttribute('aria-current'), 'page');
    assert.equal(h.scrolls.length, 0);
});

test('selecting the current game preserves its battle mode, focus and scroll position', () => {
    const h = harness(); h.select('peak-duel');
    h.main.classList.add('is-peak-battle-view');
    const input = { tagName: 'INPUT' }; document.activeElement = input;
    h.select('peak-duel');
    assert.equal(h.main.classList.contains('is-peak-battle-view'), true);
    assert.equal(document.activeElement, input);
    assert.equal(h.scrolls.length, 0);
});

test('native form controls and editable content are protected from game keyboard handling', () => {
    for (const tagName of ['INPUT', 'TEXTAREA', 'SELECT']) assert.ok(isTypingTarget({ tagName }));
    assert.ok(isTypingTarget({ tagName: 'DIV', isContentEditable: true }));
    assert.equal(Boolean(isTypingTarget({ tagName: 'CANVAS' })), false);
});

test('blocked nickname reads fall back to guest without claiming successful persistence', () => {
    globalThis.localStorage = { getItem() { throw new Error('storage access denied'); }, setItem() { throw new Error('storage access denied'); } };
    assert.equal(getStoredNickname(), '');
    assert.throws(() => setStoredNickname('游客'), /storage access denied/);
});
