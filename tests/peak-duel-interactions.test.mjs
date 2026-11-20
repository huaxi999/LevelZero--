import test from 'node:test';
import assert from 'node:assert/strict';
import { initPeakDuel } from '../js/peak-duel.js';
import { PEAK_CHARACTERS } from '../js/peak-duel-data.js';
import { PEAK_STORAGE_KEY } from '../js/peak-duel-storage.js';

const settle = () => new Promise(resolve => setImmediate(resolve));
const decode = value => value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

function harness(t, { otherPageOwnsSave = false } = {}) {
    const memory = new Map(), nodes = new Map(), timers = new Map();
    let timerId = 0, lockHeld = false, otherOwner = otherPageOwnsSave;
    const events = target => {
        const callbacks = new Map();
        target.addEventListener = (type, fn, capture = false) => {
            const list = callbacks.get(type) || [];
            list.push({ fn, capture: capture === true }); callbacks.set(type, list);
        };
        target.fire = async (type, extra = {}) => {
            let stopped = false;
            const event = { target, preventDefault() {}, stopPropagation() {}, stopImmediatePropagation() { stopped = true; }, ...extra };
            for (const { fn } of [...callbacks.get(type) || []].sort((a, b) => Number(b.capture) - Number(a.capture))) {
                await fn(event); if (stopped) break;
            }
        };
        return target;
    };
    const document = events({ activeElement: null, visibilityState: 'visible' });
    function element(tag = 'div', id = '') {
        const classes = new Set(), attributes = new Map();
        const el = events({ tagName: tag.toUpperCase(), id, dataset: {}, style: { setProperty() {} }, children: [], value: '', textContent: '', disabled: false,
            classList: { add: (...names) => names.forEach(name => classes.add(name)), remove: (...names) => names.forEach(name => classes.delete(name)), contains: name => classes.has(name), toggle(name, on = !classes.has(name)) { on ? classes.add(name) : classes.delete(name); } },
            setAttribute(key, value) { attributes.set(key, String(value)); if (key.startsWith('data-')) this.dataset[key.slice(5).replace(/-([a-z])/g, (_, char) => char.toUpperCase())] = value; },
            getAttribute: key => attributes.get(key) ?? null, removeAttribute: key => attributes.delete(key),
            matches(selector) {
                if (selector.includes(',')) return selector.split(',').some(part => this.matches(part.trim()));
                if (selector.startsWith('#')) return this.id === selector.slice(1);
                if (selector === 'button') return this.tagName === 'BUTTON';
                const match = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
                return Boolean(match && attributes.has(match[1]) && (match[2] === undefined || attributes.get(match[1]) === match[2]));
            },
            closest(selector) { return this.matches(selector) ? this : this.parent?.closest(selector) || null; },
            querySelectorAll(selector) { return this.children.filter(child => child.matches(selector)); },
            querySelector(selector) { return this.querySelectorAll(selector)[0] || null; },
            focus() { document.activeElement = this; },
            contains(target) { return target === this || this.children.includes(target); },
        });
        Object.defineProperty(el, 'innerHTML', { get: () => el.html || '', set(html) {
            el.html = html;
            el.children = [...html.matchAll(/<(input|button)\b([^>]*)>/g)].map(match => {
                const child = element(match[1]); child.parent = el;
                for (const attribute of match[2].matchAll(/([\w-]+)="([^"]*)"/g)) child.setAttribute(attribute[1], decode(attribute[2]));
                for (const attribute of match[2].matchAll(/\b(data-[\w-]+)(?=\s|$)/g)) child.setAttribute(attribute[1], '');
                child.id = child.getAttribute('id') || '';
                child.value = child.getAttribute('value') || '';
                child.disabled = /\sdisabled(?:\s|$)/.test(match[2]);
                return child;
            });
        } });
        if (id) nodes.set(id, el);
        return el;
    }
    const root = element('section', 'peak-duel');
    const content = element('div', 'peak-duel-content'), modal = element('div', 'peak-duel-modal');
    content.parent = modal.parent = root; modal.classList.add('hidden');
    for (const id of ['peak-duel-notice', 'peak-duel-gold', 'peak-duel-vouchers', 'peak-duel-stamina', 'peak-duel-stamina-timer', 'peak-duel-level', 'main-page', 'mobile-bottom-nav']) element('div', id);
    nodes.get('main-page').dataset.activeSection = 'peak-duel';
    root.querySelector = selector => selector.startsWith('#') ? nodes.get(selector.slice(1)) || null : null;
    document.getElementById = id => nodes.get(id) || null;
    document.contains = target => Boolean(target);
    document.createElement = tag => element(tag);
    const window = events({ innerHeight: 800, requestAnimationFrame() {},
        setTimeout(fn, ms) { const id = ++timerId; timers.set(id, { fn, ms }); return id; },
        clearTimeout: id => timers.delete(id), setInterval() { return ++timerId; }, clearInterval() {},
        matchMedia: () => ({ matches: false }), location: { reload() {} },
    });
    const replacements = { window, document, MutationObserver: class { observe() {} },
        localStorage: { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, String(value)) },
        navigator: { locks: { async request(name, options, callback) { if (otherOwner || lockHeld) return callback(null); lockHeld = true; try { await callback({ name }); } finally { lockHeld = false; } } } },
        fetch: async () => ({ ok: true, headers: { get: () => 'Thu, 19 Nov 2026 04:00:00 GMT' } }),
        setTimeout: window.setTimeout, clearTimeout: window.clearTimeout,
    };
    const originals = new Map(Object.keys(replacements).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
    for (const [key, value] of Object.entries(replacements)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    const game = initPeakDuel({ root });
    t.after(async () => {
        await window.fire('pagehide'); await settle();
        for (const [key, descriptor] of originals) descriptor ? Object.defineProperty(globalThis, key, descriptor) : delete globalThis[key];
    });
    const click = async (action, id) => {
        const button = [...modal.children, ...content.children].find(child => child.dataset.action === action && (!id || child.dataset.id === id));
        assert.ok(button, `button exists: ${action} ${id || ''}`);
        await root.fire('click', { target: button });
    };
    return { game, content, modal, memory, root, click, releaseOtherPage() { otherOwner = false; } };
}

test('changing profession keeps the typed character name and shows each profession description', async t => {
    const h = harness(t); h.game.resume(); await settle();
    await h.click('open-create-character');
    const draft = '新勇者<&"';
    h.modal.querySelector('#peak-character-name-input').value = draft;
    const descriptions = new Set();
    for (const classId of Object.keys(PEAK_CHARACTERS)) {
        await h.click('set-create-class', classId);
        assert.equal(h.modal.querySelector('#peak-character-name-input').value, draft);
        const description = h.modal.innerHTML.match(/class="peak-create-preview"[\s\S]*?<p>([^<]*)<\/p>/)[1];
        descriptions.add(description);
        if (classId === 'mage') assert.match(description, /法力充能/);
        if (classId === 'priest') assert.match(description, /治疗/);
    }
    assert.equal(descriptions.size, Object.keys(PEAK_CHARACTERS).length);
    await h.click('close-modal');
    await h.click('open-create-character');
    assert.equal(h.modal.querySelector('#peak-character-name-input').value, '', 'a cancelled creation does not populate the next one');
});

test('first character creation saves the chosen profession and preserved name then survives reentry', async t => {
    const h = harness(t); h.game.resume(); await settle();
    await h.click('open-create-character');
    h.modal.querySelector('#peak-character-name-input').value = '星界旅人';
    await h.click('set-create-class', 'mage');
    await h.click('confirm-create-character');
    const save = JSON.parse(h.memory.get(PEAK_STORAGE_KEY));
    assert.equal(save.characters[save.activeCharacterId].name, '星界旅人');
    assert.equal(save.characters[save.activeCharacterId].baseClassId, 'mage');
    assert.equal(h.modal.classList.contains('hidden'), true);
    h.game.pause(); h.game.resume();
    assert.match(h.content.innerHTML, /星界旅人/);
});

test('a blocked first visit can retry after the other page closes and create a character', async t => {
    const h = harness(t, { otherPageOwnsSave: true }); h.game.resume(); await settle();
    assert.match(h.content.innerHTML, /另一个页面/);
    h.releaseOtherPage();
    const retry = h.content.children.find(child => child.matches('[data-retry-peak-save]'));
    assert.ok(retry);
    await h.root.fire('click', { target: retry }); await settle();
    await h.click('open-create-character');
    h.modal.querySelector('#peak-character-name-input').value = '重返勇者';
    await h.click('confirm-create-character');
    assert.equal(JSON.parse(h.memory.get(PEAK_STORAGE_KEY)).characterOrder.length, 1);
});
