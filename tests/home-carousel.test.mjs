import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../js/home-carousel.js', import.meta.url), 'utf8');

function harness({ reducedMotion = false, hiddenHome = false, hiddenMain = false } = {}) {
    const timers = new Map(), observers = [], nodes = new Map();
    let timerId = 0, now = 0;
    function target() {
        const listeners = new Map();
        return {
            addEventListener(type, handler) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(handler); },
            removeEventListener(type, handler) { listeners.get(type)?.delete(handler); },
            fire(type, event = {}) { for (const handler of [...listeners.get(type) || []]) handler(event); },
        };
    }
    function element(id, hidden = false) {
        const classes = new Set(hidden ? ['hidden'] : []), attrs = new Map();
        const value = { ...target(), id, dataset: {}, textContent: '', parent: null, hovered: false, inert: false,
            style: { setProperty() {} },
            classList: { contains: name => classes.has(name), toggle(name, active = !classes.has(name)) { active ? classes.add(name) : classes.delete(name); } },
            setAttribute(name, value) { attrs.set(name, String(value)); }, getAttribute: name => attrs.get(name),
            closest(selector) { for (let node = this; node; node = node.parent) if (selector === '.hidden' ? node.classList.contains('hidden') : `#${node.id}` === selector) return node; return null; },
            contains(other) { for (let node = other; node; node = node.parent) if (node === this) return true; return false; },
            matches: selector => selector === ':hover' && value.hovered,
        };
        nodes.set(id, value); return value;
    }
    const main = element('main-page', hiddenMain), home = element('home', hiddenHome), root = element('home-featured-carousel');
    home.parent = main; root.parent = home;
    const slides = ['fight', 'mowangcheng', 'plane'].map((game, i) => { const slide = element(game); slide.classList.toggle('is-active', i === 0); slide.parent = root; return slide; });
    const entries = slides.map(slide => { const button = element(`${slide.id}-entry`); button.parent = slide; return button; });
    const dots = slides.map((_, i) => { const dot = element(`select-${i}`); dot.dataset.featuredSelect = String(i); dot.parent = root; return dot; });
    const prev = element('prev'), next = element('next'), toggle = element('toggle');
    const toggleIcon = element('toggle-icon'), current = element('current');
    toggleIcon.parent = toggle; current.parent = root;
    toggle.textContent = 'preserve toggle children';
    for (const button of [prev, next, toggle]) button.parent = root;
    root.querySelectorAll = selector => selector === '[data-featured-slide]' ? slides : selector === '[data-featured-select]' ? dots : [];
    root.querySelector = selector => ({ '[data-featured-prev]': prev, '[data-featured-next]': next, '[data-featured-toggle]': toggle, '[data-featured-toggle-icon]': toggleIcon, '[data-featured-current]': current })[selector] || null;
    const motion = { ...target(), matches: reducedMotion };
    const view = { ...target(), matchMedia: () => motion,
        setTimeout(fn, delay) { const id = ++timerId; timers.set(id, { fn, due: now + delay }); return id; },
        clearTimeout(id) { timers.delete(id); },
        MutationObserver: class {
            constructor(callback) { this.callback = callback; this.targets = []; observers.push(this); }
            observe(node, options) { this.targets.push({ node, options }); }
            disconnect() { this.targets = []; }
        },
    };
    const doc = { ...target(), hidden: false, readyState: 'loading', activeElement: null,
        defaultView: view, getElementById: id => nodes.get(id) || null };
    root.ownerDocument = doc;
    const context = vm.createContext({ document: doc });
    vm.runInContext(source.replace('export const initHomeCarousel', 'globalThis.initHomeCarousel'), context);
    doc.fire('DOMContentLoaded');
    const controller = context.initHomeCarousel(root);
    return { root, home, main, slides, entries, dots, prev, next, toggle, toggleIcon, current, doc, view, motion, timers, observers, controller,
        init: () => context.initHomeCarousel(root),
        active: () => slides.filter(slide => slide.classList.contains('is-active')).map(slide => slide.id),
        advance(ms) {
            const end = now + ms;
            for (;;) {
                const due = [...timers.entries()].filter(([, timer]) => timer.due <= end).sort((a, b) => a[1].due - b[1].due)[0];
                if (!due) break;
                now = due[1].due; timers.delete(due[0]); due[1].fn();
            }
            now = end;
        },
        hide(node, hidden) {
            node.classList.toggle('hidden', hidden);
            for (const observer of observers) if (observer.targets.some(entry => entry.node === node)) observer.callback();
        },
        hover(hovered) { root.hovered = hovered; root.fire(hovered ? 'mouseenter' : 'mouseleave'); },
        focus(node, keyboard = false) {
            doc.fire(keyboard ? 'keydown' : 'pointerdown', { key: 'Tab' });
            const old = doc.activeElement; doc.activeElement = node;
            if (root.contains(old)) root.fire('focusout', { relatedTarget: node });
            if (root.contains(node)) root.fire('focusin', { target: node });
        },
    };
}

test('featured games start automatically and loop every 4.5 seconds without duplicate timers', () => {
    const h = harness();
    assert.equal(h.init(), h.controller);
    assert.equal(h.timers.size, 1);
    assert.deepEqual(h.active(), ['fight']);
    assert.equal(h.root.dataset.playing, 'true');
    assert.equal(h.current.textContent, '01');
    h.advance(4499); assert.deepEqual(h.active(), ['fight']);
    h.advance(1); assert.deepEqual(h.active(), ['mowangcheng']);
    assert.equal(h.current.textContent, '02');
    assert.equal(h.slides[0].inert, true);
    assert.equal(h.slides[1].inert, false);
    h.advance(4500); assert.deepEqual(h.active(), ['plane']);
    h.advance(4500); assert.deepEqual(h.active(), ['fight']);
    assert.equal(h.timers.size, 1);
    assert.equal(h.dots[0].getAttribute('aria-pressed'), 'true');
    assert.equal(h.slides[1].getAttribute('aria-hidden'), 'true');
    assert.equal(h.slides.some(slide => slide.classList.contains('hidden')), false);
});

test('previous, next and direct selection restart the interval and keep playing', () => {
    const h = harness();
    h.advance(4000);
    h.prev.fire('click'); assert.deepEqual(h.active(), ['plane']);
    assert.equal(h.timers.size, 1);
    assert.equal(h.toggle.getAttribute('aria-label'), '暂停自动切换');
    h.advance(4499); assert.deepEqual(h.active(), ['plane']);
    h.advance(1); assert.deepEqual(h.active(), ['fight']);
    h.next.fire('click'); assert.deepEqual(h.active(), ['mowangcheng']);
    h.advance(4500); assert.deepEqual(h.active(), ['plane']);
    h.dots[1].fire('click'); assert.deepEqual(h.active(), ['mowangcheng']);
    h.advance(4500); assert.deepEqual(h.active(), ['plane']);
    assert.equal(h.root.getAttribute('aria-live'), 'off');
});

test('hover, pointer focus and keyboard focus on controls do not lock autoplay', () => {
    const h = harness();
    h.advance(3000); h.hover(true); h.advance(1500);
    assert.deepEqual(h.active(), ['mowangcheng']); assert.equal(h.timers.size, 1);
    h.focus(h.entries[1]); h.advance(4500); assert.deepEqual(h.active(), ['plane']);
    h.focus(h.next); h.next.fire('click'); h.advance(4500); assert.deepEqual(h.active(), ['mowangcheng']);
    h.focus(h.dots[0], true); h.dots[0].fire('click');
    h.advance(4500); assert.deepEqual(h.active(), ['mowangcheng']);
    assert.equal(h.root.dataset.playing, 'true');
});

test('keyboard focus keeps a game entry visible and leaving it resumes autoplay', () => {
    const h = harness();
    h.focus(h.entries[0], true); h.advance(18000);
    assert.deepEqual(h.active(), ['fight']); assert.equal(h.timers.size, 0);
    assert.equal(h.root.dataset.playing, 'false');
    h.focus(h.next, true); h.advance(4499); assert.deepEqual(h.active(), ['fight']);
    h.advance(1); assert.deepEqual(h.active(), ['mowangcheng']);
});

test('holding a game entry across a rotation deadline keeps its click target active until release', () => {
    const h = harness();
    h.advance(4499);
    h.doc.fire('pointerdown', { target: h.entries[0], button: 0, pointerId: 1, isPrimary: true });
    h.advance(9000);
    assert.deepEqual(h.active(), ['fight']);
    assert.equal(h.slides[0].inert, false);
    assert.equal(h.root.dataset.playing, 'false');
    h.doc.fire('pointerup', { pointerId: 1 });
    assert.equal(h.root.dataset.playing, 'true');
    h.advance(4499); assert.deepEqual(h.active(), ['fight']);
    h.advance(1); assert.deepEqual(h.active(), ['mowangcheng']);
});

test('cancelled presses, window blur and leaving home cannot leave autoplay stuck', () => {
    const h = harness();
    const press = () => h.doc.fire('pointerdown', { target: h.entries[0], button: 0, pointerId: 1, isPrimary: true });
    press();
    h.doc.fire('pointerdown', { target: h.next, button: 0, pointerId: 2, isPrimary: false });
    h.doc.fire('pointerup', { pointerId: 2 });
    h.advance(4500); assert.deepEqual(h.active(), ['fight']);
    h.doc.fire('pointercancel', { pointerId: 1 });
    assert.equal(h.root.dataset.playing, 'true');
    press(); h.view.fire('blur');
    assert.equal(h.root.dataset.playing, 'true');
    press(); h.hide(h.home, true); h.hide(h.home, false);
    h.advance(4500); assert.deepEqual(h.active(), ['mowangcheng']);
    assert.equal(h.timers.size, 1);
});

test('leaving home, opening login, hiding the tab and pagehide stop timers and safely resume on return', () => {
    const h = harness();
    h.hide(h.home, true); h.advance(12000); assert.equal(h.timers.size, 0);
    assert.equal(h.root.dataset.playing, 'false');
    h.hide(h.home, false); h.advance(4500); assert.deepEqual(h.active(), ['mowangcheng']);
    h.hide(h.main, true); h.advance(12000); assert.deepEqual(h.active(), ['mowangcheng']);
    h.hide(h.main, false); h.advance(4500); assert.deepEqual(h.active(), ['plane']);
    h.doc.hidden = true; h.doc.fire('visibilitychange'); h.advance(12000); assert.equal(h.timers.size, 0);
    h.doc.hidden = false; h.doc.fire('visibilitychange'); h.advance(4500); assert.deepEqual(h.active(), ['fight']);
    h.view.fire('pagehide'); h.advance(12000); assert.equal(h.timers.size, 0);
    h.view.fire('pageshow'); h.advance(4500); assert.deepEqual(h.active(), ['mowangcheng']);
    assert.equal(h.observers[0].targets.length, 2);
});

test('reduced motion affects CSS transitions without disabling the requested automatic rotation', () => {
    const h = harness({ reducedMotion: true });
    h.advance(4500); assert.deepEqual(h.active(), ['mowangcheng']); assert.equal(h.timers.size, 1);
    h.motion.matches = false; h.motion.fire('change');
    h.motion.matches = true; h.motion.fire('change'); h.advance(4500);
    assert.deepEqual(h.active(), ['plane']); assert.equal(h.timers.size, 1);
});

test('a stale timeout cannot rotate hidden content and manual pause survives returning to home', () => {
    const h = harness();
    const callback = [...h.timers.values()][0].fn;
    h.hide(h.home, true); callback(); assert.deepEqual(h.active(), ['fight']);
    h.hide(h.home, false); callback();
    assert.deepEqual(h.active(), ['fight']); assert.equal(h.timers.size, 1);
    h.dots[2].fire('click');
    h.toggle.fire('click');
    assert.equal(h.toggle.getAttribute('aria-label'), '开启自动切换');
    assert.equal(h.toggleIcon.textContent, '▶');
    assert.equal(h.toggle.textContent, 'preserve toggle children');
    assert.equal(h.root.getAttribute('aria-live'), 'polite');
    h.hide(h.home, true); h.hide(h.home, false); h.advance(12000);
    assert.deepEqual(h.active(), ['plane']); assert.equal(h.timers.size, 0);
    h.toggle.fire('click'); assert.equal(h.timers.size, 1);
    assert.equal(h.toggleIcon.textContent, 'Ⅱ');
    h.advance(4500); assert.deepEqual(h.active(), ['fight']);
    h.controller.destroy(); assert.equal(h.timers.size, 0);
    assert.equal(h.root.dataset.playing, 'false');
    h.view.fire('pageshow'); h.toggle.fire('click'); assert.equal(h.timers.size, 0);
});

test('initially hidden home waits for visibility before starting its first interval', () => {
    const h = harness({ hiddenHome: true, hiddenMain: true });
    assert.equal(h.timers.size, 0);
    h.hide(h.home, false); assert.equal(h.timers.size, 0);
    h.hide(h.main, false); h.advance(4500); assert.deepEqual(h.active(), ['mowangcheng']);
});

test('the standalone module can be loaded without a document', () => {
    assert.doesNotThrow(() => vm.runInNewContext(source.replace('export const initHomeCarousel', 'globalThis.initHomeCarousel')));
});
