import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const settle = () => new Promise(resolve => setImmediate(resolve));
const decode = text => text.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
function harness({ adopted = true, raw, lockAvailable = true, cloudSync } = {}) {
    const memory = new Map(), nodes = new Map(), timers = new Map(), frames = new Map();
    let failWrites = false, timerId = 0, now = new Date(2026, 10, 19, 12).getTime(), performanceTime = 0;
    let externalLock = !lockAvailable, held = false;
    function events(target = {}) {
        const callbacks = new Map();
        target.addEventListener = (type, callback) => { const list = callbacks.get(type) || []; list.push(callback); callbacks.set(type, list); };
        target.removeEventListener = (type, callback) => callbacks.set(type, (callbacks.get(type) || []).filter(fn => fn !== callback));
        target.fire = async (type, event = {}) => { for (const fn of [...callbacks.get(type) || []]) await fn({ target, preventDefault() {}, stopPropagation() {}, ...event }); };
        return target;
    }
    const document = events({ visibilityState: 'visible', activeElement: null });
    function element(id = '') {
        const classes = new Set(), attrs = new Map(), styles = new Map();
        const el = events({ id, value: '', textContent: '', disabled: false, dataset: {}, children: [], offsetWidth: 100, offsetHeight: 100,
            classList: { contains: value => classes.has(value), add: (...values) => values.forEach(value => classes.add(value)), remove: (...values) => values.forEach(value => classes.delete(value)), toggle(value, enabled = !classes.has(value)) { enabled ? classes.add(value) : classes.delete(value); } },
            style: { setProperty: (key, value) => styles.set(key, value), getPropertyValue: key => styles.get(key) },
            setAttribute(key, value) { attrs.set(key, String(value)); if (key.startsWith('data-')) this.dataset[key.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value; },
            getAttribute: key => attrs.get(key) ?? null, hasAttribute: key => attrs.has(key), removeAttribute: key => attrs.delete(key),
            append(...children) { children.forEach(child => { child.parent = this; this.children.push(child); }); },
            insertBefore(child) { child.parent = this; this.children.unshift(child); },
            replaceChildren(...children) { this.children = []; this.append(...children); },
            contains(target) { return target === this || this.children.some(child => child.contains?.(target)); },
            matches(selector) {
                const match = selector.match(/^\[([^=\]]+)(?:="([^"]*)")?\]$/);
                return match ? attrs.has(match[1]) && (match[2] === undefined || attrs.get(match[1]) === match[2]) : false;
            },
            closest(selector) { return this.matches(selector) ? this : this.parent?.closest(selector) || null; },
            querySelectorAll(selector) { return this.children.flatMap(child => [...(child.matches?.(selector) ? [child] : []), ...child.querySelectorAll?.(selector) || []]); },
            querySelector(selector) { return this.querySelectorAll(selector)[0] || null; },
            focus() { document.activeElement = this; },
            setSelectionRange(start, end) { this.selectionStart = start; this.selectionEnd = end; },
        });
        Object.defineProperty(el, 'className', { get: () => [...classes].join(' '), set: value => { classes.clear(); value.split(/\s+/).filter(Boolean).forEach(name => classes.add(name)); } });
        Object.defineProperty(el, 'innerHTML', { configurable: true, get: () => el.html || '', set(value) {
            el.html = value;
            el.replaceChildren(...[...value.matchAll(/<input\b([^>]*)>/g)].map(match => {
                const input = element();
                for (const attr of match[1].matchAll(/([\w-]+)="([^"]*)"/g)) input.setAttribute(attr[1], decode(attr[2]));
                input.value = input.getAttribute('value') || ''; input.selectionStart = input.selectionEnd = input.value.length;
                return input;
            }));
        } });
        if (id) nodes.set(id, el);
        return el;
    }
    for (const id of ['pet', 'pet-widget', 'pet-adoption', 'pet-game', 'pet-adopt-form', 'pet-name-input', 'pet-adoption-tip', 'pet-event-text',
        'pet-coins', 'pet-tickets', 'pet-sync-state', 'pet-sound-toggle', 'pet-widget-toggle', 'pet-widget-roam', 'pet-widget-shell',
        'pet-owned-roster', 'pet-roster-catalog', 'pet-playground-grid', 'pet-playground-arena', 'pet-arena-action', 'pet-arena-status', 'pet-arena-copy',
        'pet-competition-types', 'pet-competition-divisions', 'pet-competition-summary', 'pet-competition-stage']) element(id);
    const feed = element('feed'); feed.dataset.petAction = 'feed';
    const viewButtons = ['home', 'playground', 'competition'].map(id => { const el = element(`view-${id}`); el.dataset.petViewTarget = id; return el; });
    const views = ['home', 'playground', 'competition'].map(id => { const el = element(); el.dataset.petView = id; return el; });
    document.getElementById = id => nodes.get(id) || null;
    document.querySelector = () => null;
    document.querySelectorAll = selector => ({ '[data-pet-action]': [feed], '[data-pet-view-target]': viewButtons, '[data-pet-view]': views })[selector] || [];
    document.createTextNode = text => ({ textContent: text });
    document.createElement = tag => {
        const el = element();
        if (tag === 'template') {
            const content = { firstElementChild: null };
            Object.defineProperty(el, 'innerHTML', { configurable: true, set(value) { const child = element(); child.innerHTML = value; content.firstElementChild = child; } });
            el.content = content;
        }
        return el;
    };
    const window = events({ innerWidth: 1200, innerHeight: 800 });
    const context = vm.createContext({ console, document, window, performance: { now: () => performanceTime },
        Date: class extends Date { static now() { return now; } },
        navigator: { locks: { async request(name, options, callback) { if (externalLock || held) return callback(null); held = true; try { await callback({ name }); } finally { held = false; } } } },
        localStorage: { getItem: key => memory.get(key) ?? null, setItem(key, value) { if (failWrites) throw new Error('quota'); memory.set(key, String(value)); } },
        setTimeout(fn, ms) { const id = ++timerId; timers.set(id, { fn, ms }); return id; }, clearTimeout: id => timers.delete(id),
        setInterval(fn, ms) { const id = ++timerId; timers.set(id, { fn, ms, interval: true }); return id; },
        requestAnimationFrame(fn) { const id = ++timerId; frames.set(id, fn); return id; }, cancelAnimationFrame: id => frames.delete(id),
        getComputedStyle: el => ({ left: el.style.getPropertyValue('--pet-widget-x') || '80px', bottom: el.style.getPropertyValue('--pet-widget-bottom') || '20px' }),
    });
    for (const filename of ['pet-data.js', 'pet-storage.js', 'pet-cloud-sync.js', 'pet-writer.js', 'pet.js']) {
        const source = fs.readFileSync(new URL(`../js/${filename}`, import.meta.url), 'utf8');
        const names = [...source.matchAll(/export const (\w+)/g)].map(match => match[1]);
        const clean = source.replace(/^import[\s\S]*?from ['"][^'"]+['"];\r?\n/gm, '').replaceAll('export const ', 'const ');
        Object.assign(context, vm.runInContext(`(() => {${clean}\nreturn {${names.join(',')}};})()`, context, { filename }));
    }
    if (raw !== undefined) memory.set(context.PET_STORAGE_KEY, raw);
    else if (adopted) context.createPet('星星');
    const game = context.initPetGame({ cloudSync });
    const notice = nodes.get('pet').children[0], retry = notice.children[1];
    return { nodes, element, memory, timers, frames, document, window, game, notice, retry,
        read: () => JSON.parse(memory.get(context.PET_STORAGE_KEY)),
        fail(value) { failWrites = value; }, releaseOtherPage() { externalLock = false; },
        advance(ms) { now += ms; performanceTime += ms; },
        async interval(ms) { for (const timer of timers.values()) if (timer.interval && timer.ms === ms) await timer.fn(); },
    };
}

test('adoption, care, pause and resume work through their actual event handlers', async () => {
    const h = harness({ adopted: false }); await settle();
    h.nodes.get('pet-name-input').value = '第一位伙伴';
    await h.nodes.get('pet-adopt-form').fire('submit');
    assert.equal(h.read().name, '第一位伙伴');
    await h.nodes.get('feed').fire('click');
    assert.equal(h.read().daily.care, 1);
    h.game.pause(); h.game.resume();
    assert.equal(h.read().name, '第一位伙伴');
});

test('failed care displays an error and retries only after rereading the intact save', async () => {
    const h = harness(); await settle();
    const before = h.read(); h.fail(true);
    await h.nodes.get('feed').fire('click');
    assert.equal(h.read().revision, before.revision);
    assert.match(h.notice.children[0].textContent, /保存失败/);
    assert.equal(h.notice.classList.contains('hidden'), false);
    h.fail(false); await h.retry.fire('click');
    await h.nodes.get('feed').fire('click');
    assert.equal(h.read().daily.care, 1);
    assert.equal(h.notice.classList.contains('hidden'), true);
});

test('sound, visibility, roaming and drag settings all handle storage failures', async () => {
    const h = harness(); await settle();
    for (const id of ['pet-sound-toggle', 'pet-widget-toggle', 'pet-widget-roam']) {
        const raw = JSON.stringify(h.read()); h.fail(true);
        await h.nodes.get(id).fire('click');
        assert.equal(JSON.stringify(h.read()), raw);
        assert.match(h.notice.children[0].textContent, /保存失败/);
        h.fail(false); await h.retry.fire('click');
    }
    const shell = h.nodes.get('pet-widget-shell'), raw = JSON.stringify(h.read());
    h.fail(true);
    await shell.fire('pointerdown', { button: 0, pointerId: 1, clientX: 20, clientY: 20 });
    await shell.fire('pointermove', { pointerId: 1, clientX: 100, clientY: 20 });
    await shell.fire('pointerup', { pointerId: 1 });
    assert.equal(JSON.stringify(h.read()), raw);
    assert.equal(h.nodes.get('pet-widget').classList.contains('is-dragging'), false);
});

test('a second page cannot mutate and can take ownership after the first closes', async () => {
    const h = harness({ lockAvailable: false }); await settle();
    await h.nodes.get('feed').fire('click');
    assert.equal(h.read().daily.care, 0);
    h.releaseOtherPage(); await h.retry.fire('click');
    await h.nodes.get('feed').fire('click');
    assert.equal(h.read().daily.care, 1);
});

test('a damaged save stays intact across initialization, adoption and timers', async () => {
    const raw = '{"foo":1}', h = harness({ raw }); await settle();
    h.nodes.get('pet-name-input').value = '新伙伴';
    await h.nodes.get('pet-adopt-form').fire('submit');
    h.game.resume(); await h.interval(30000);
    assert.equal([...h.memory.values()][0], raw);
    assert.match(h.notice.children[0].textContent, /无法读取/);
});

test('periodic updates retain a partially entered roster name and text selection', async () => {
    const h = harness(); await settle(); h.game.resume();
    const catalog = h.nodes.get('pet-roster-catalog');
    const input = catalog.querySelector('[data-pet-adopt-name="clockwork-golem"]');
    input.value = '正在起名<&'; input.focus(); input.setSelectionRange(2, 4);
    h.advance(30000); await h.interval(30000);
    const restored = catalog.querySelector('[data-pet-adopt-name="clockwork-golem"]');
    assert.equal(restored.value, '正在起名<&');
    assert.equal(h.document.activeElement, restored);
    assert.equal(restored.selectionStart, 2); assert.equal(restored.selectionEnd, 4);
    assert.ok(h.read().relationship.growth > 0);
});

test('hiding the page cancels a running challenge without charging a ticket', async () => {
    const h = harness(); await settle();
    await h.nodes.get('view-playground').fire('click');
    await h.nodes.get('pet-arena-action').fire('click');
    assert.ok(h.frames.size > 0);
    const tickets = h.read().wallet.tickets;
    h.document.visibilityState = 'hidden'; await h.document.fire('visibilitychange');
    assert.equal(h.frames.size, 0);
    assert.equal(h.read().wallet.tickets, tickets);
    assert.match(h.nodes.get('pet-event-text').textContent, /未扣除游乐券/);
});

test('back-forward cache restoration reacquires a released writer lock', async () => {
    const h = harness(); await settle();
    await h.window.fire('pagehide'); await settle();
    await h.nodes.get('feed').fire('click'); assert.equal(h.read().daily.care, 0);
    await h.window.fire('pageshow', { persisted: true });
    await h.nodes.get('feed').fire('click'); assert.equal(h.read().daily.care, 1);
});

test('late cross-page notifications cannot roll back a newer rendered save', async () => {
    const h = harness({ lockAvailable: false }); await settle();
    const old = h.read(), next = structuredClone(old);
    next.revision += 1; next.wallet.coins += 100;
    await h.window.fire('storage', { key: 'rosang.pet.v1', newValue: JSON.stringify(next) });
    assert.equal(h.nodes.get('pet-coins').textContent, String(next.wallet.coins));
    await h.window.fire('storage', { key: 'rosang.pet.v1', newValue: JSON.stringify(old) });
    assert.equal(h.nodes.get('pet-coins').textContent, String(next.wallet.coins));
});

test('leaving a scouted competition clears stale controls and returning allows a fresh match', async () => {
    const h = harness(); await settle();
    await h.nodes.get('view-competition').fire('click');
    const divisionMarkup = h.nodes.get('pet-competition-divisions').children[0].innerHTML;
    const scout = h.element();
    scout.setAttribute('data-pet-enter-competition', divisionMarkup.match(/data-pet-enter-competition="([^"]+)"/)[1]);
    await h.nodes.get('pet-competition-divisions').fire('click', { target: scout });
    const stage = h.nodes.get('pet-competition-stage');
    assert.equal(stage.classList.contains('hidden'), false);
    await h.nodes.get('view-home').fire('click');
    await h.nodes.get('view-competition').fire('click');
    assert.equal(stage.classList.contains('hidden'), true, 'cancelled scouting must not leave clickable strategy controls');
    await h.nodes.get('pet-competition-divisions').fire('click', { target: scout });
    assert.equal(stage.classList.contains('hidden'), false);
    const strategy = h.element();
    strategy.setAttribute('data-pet-competition-strategy', stage.innerHTML.match(/data-pet-competition-strategy="([^"]+)"/)[1]);
    const before = h.read();
    await stage.fire('click', { target: strategy });
    assert.equal(h.read().competition.history.length, before.competition.history.length + 1);
    assert.equal(h.read().competition.entriesLeft, before.competition.entriesLeft - 1);
    assert.equal(stage.classList.contains('hidden'), true);
});
