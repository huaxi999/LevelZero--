import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read = name => fs.readFileSync(new URL(`../js/${name}`, import.meta.url), 'utf8');
const defer = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const settle = () => new Promise(resolve => setImmediate(resolve));

function harness(cloudOverrides = {}) {
    const nodes = new Map(), lists = new Map(), memory = new Map(), timers = new Map();
    let now = 100000, timerId = 0;
    let deferFrames = false;
    const frames = [], pageScrolls = [];
    const games = [];
    function element(id = '') {
        if (nodes.has(id)) return nodes.get(id);
        const classes = new Set(), attrs = new Map(), events = {};
        const el = { id, value: '', textContent: '', innerHTML: '', disabled: false, dataset: {}, events,
            classList: { contains: x => classes.has(x), add: x => classes.add(x), remove: x => classes.delete(x),
                toggle(x, on = !classes.has(x)) { on ? classes.add(x) : classes.delete(x); } },
            setAttribute: (k, v) => attrs.set(k, v), getAttribute: k => attrs.get(k) ?? null, removeAttribute: k => attrs.delete(k),
            addEventListener(type, callback) { (events[type] ||= []).push(callback); },
            async fire(type, event = {}) { for (const fn of events[type] || []) await fn({ target: el, ...event }); },
            querySelector() { return null; },
            querySelectorAll(selector) { return id === 'mobile-bottom-nav' && selector === '[data-mobile-target]' ? lists.get('#mobile-bottom-nav [data-mobile-target]') || [] : []; },
            focus() { document.activeElement = el; },
            scrollIntoView(options) { (el.scrolls ||= []).push(options); },
        };
        nodes.set(id, el); return el;
    }
    const sections = ['home', 'plane', 'brick', 'rps', 'fight', 'abyss', 'pet', 'peak-duel', 'leaderboard', 'message-board', 'mowangcheng'].map(element);
    lists.set('.section', sections);
    lists.set('.nav-btn', sections.map(section => { const btn = element(`nav-${section.id}`); btn.dataset.target = section.id; return btn; }));
    lists.set('.leaderboard-tab', ['plane', 'brick'].map(game => { const btn = element(`tab-${game}`); btn.dataset.game = game; return btn; }));
    lists.set('#mobile-bottom-nav [data-mobile-target]', ['home', 'all'].map(id => { const btn = element(`mobile-${id}`); btn.dataset.mobileTarget = 'home'; if (id === 'all') btn.dataset.mobileScroll = 'game-cards'; return btn; }));
    let start;
    const documentEvents = {};
    const document = { hidden: false, activeElement: null, getElementById: element, querySelectorAll: selector => lists.get(selector) || [],
        querySelector: selector => selector === '.game-cards' ? element('game-cards') : null,
        addEventListener(event, callback) { if (event === 'DOMContentLoaded') start = callback; else (documentEvents[event] ||= []).push(callback); },
    };
    const cloud = { init: async () => {}, getCurrentUser: async () => null, loadMessages: async () => [], submitScore: async () => {}, ...cloudOverrides };
    function game(extra = {}) { const value = { state: {}, pauses: 0, resumes: 0, pause() { this.pauses++; }, resume() { this.resumes++; }, render() {}, draw() {}, resize() {}, reset() {}, setup() {}, isRunning: () => false, isGameOver: () => false, setMenuView() {}, updateProgressUI() {}, ...extra }; games.push(value); return value; }
    const context = { console, document, window: { RSCloud: cloud, addEventListener() {}, dispatchEvent() {}, scrollTo: options => pageScrolls.push(options) },
        localStorage: { getItem: k => memory.get(k) ?? null, setItem: (k, v) => memory.set(k, String(v)) },
        setTimeout: (fn, ms) => { const id = ++timerId; timers.set(id, { fn, ms }); return id; },
        clearTimeout: id => timers.delete(id), setInterval: (fn, ms) => { const id = ++timerId; timers.set(id, { fn, ms }); return id; }, clearInterval: id => timers.delete(id),
        requestAnimationFrame: fn => deferFrames ? frames.push(fn) : fn(), CustomEvent: function(type, init) { this.type = type; this.detail = init.detail; },
        Date: class extends Date { static now() { return now; } },
        initRpsGame: () => game(), initPlaneGame: options => game({ submitScore: options.submitCloudScore }), initBrickGame: () => game(),
        initFightGame: () => game(), initAbyssGame: () => game(), initPetGame: () => game(), initPeakDuel: () => game(),
        getPeakSave: () => ({}), getActivePeakCharacter: () => null,
    };
    vm.createContext(context);
    vm.runInContext(read('dom.js').replaceAll('export const ', 'const '), context);
    vm.runInContext(read('utils.js').replaceAll('export const ', 'const '), context);
    const storageSource = read('storage.js');
    const storageExports = [...storageSource.matchAll(/export const (\w+)/g)].map(m => m[1]);
    vm.runInContext(storageSource.replaceAll('export const ', 'const ') + `\nglobalThis.storage={${storageExports.join(',')}};`, context);
    vm.runInContext(read('app.js').replace(/^import .*;\r?\n/gm, ''), context);
    start();
    return { nodes, element, games, memory, cloud, timers, document, pageScrolls, storage: context.storage, advance: ms => { now += ms; },
        deferFrames() { deferFrames = true; }, flushFrames() { while (frames.length) frames.shift()(); },
        visibility(hidden) { document.hidden = hidden; for (const fn of documentEvents.visibilitychange || []) fn(); } };
}

test('a visitor can use the lobby before account restoration resolves and return from login', async () => {
    const pending = defer();
    const h = harness({ init: () => pending.promise });
    assert.equal(h.element('main-page').classList.contains('hidden'), false);
    assert.equal(h.element('login-card').classList.contains('hidden'), true);
    assert.equal(h.element('welcome-name').textContent, '游客');
    await h.element('nav-plane').fire('click');
    assert.equal(h.element('plane').classList.contains('hidden'), false);
    const before = h.games.map(g => g.pauses);
    await h.element('logout-btn').fire('click');
    assert.equal(h.element('login-card').classList.contains('hidden'), false);
    h.games.forEach((g, i) => assert.equal(g.pauses, before[i] + 1));
    await h.element('guest-play-btn').fire('click');
    assert.equal(h.element('home').classList.contains('hidden'), false);
});

test('returning from login to the current home restores keyboard focus and ignores its old focus callback', async () => {
    const h = harness(); await settle();
    await h.element('logout-btn').fire('click');
    h.element('guest-play-btn').focus();
    await h.element('guest-play-btn').fire('click');
    for (const timer of h.timers.values()) if (timer.ms === 0) timer.fn();
    assert.equal(h.document.activeElement, h.element('home'));
    assert.equal(h.element('login-card').classList.contains('hidden'), true);
});

test('a late login success updates the account without pulling a player out of the game they opened', async () => {
    const pending = defer(); let user = null;
    const h = harness({ getCurrentUser: async () => user, sendCode: async () => ({ verification_id: 'v' }),
        loginWithPhone: async () => { await pending.promise; return user = { id: 'player' }; } });
    await settle(); await h.element('logout-btn').fire('click');
    h.element('nickname-input').value = 'Player';
    h.element('login-phone-input').value = '13800000000';
    await h.element('login-send-code-btn').fire('click');
    h.element('login-code-input').value = '123456';
    const loggingIn = h.element('login-btn').fire('click'); await settle();
    await h.element('guest-play-btn').fire('click');
    await h.element('nav-abyss').fire('click');
    const pauses = h.games[4].pauses;
    pending.resolve(); await loggingIn;
    assert.equal(h.element('account-mode').textContent, '已登录');
    assert.equal(h.element('main-page').getAttribute('data-active-section'), 'abyss');
    assert.equal(h.games[4].pauses, pauses);
});

test('a login preflight abandoned for guest play cannot start authentication later', async () => {
    const pending = defer(); let delay = false, logins = 0;
    const h = harness({ getCurrentUser: () => delay ? pending.promise : Promise.resolve(null),
        sendCode: async () => ({ verification_id: 'v' }), loginWithPhone: async () => { logins++; return { id: 'player' }; } });
    await settle(); await h.element('logout-btn').fire('click');
    h.element('nickname-input').value = 'Player';
    h.element('login-phone-input').value = '13800000000';
    await h.element('login-send-code-btn').fire('click');
    h.element('login-code-input').value = '123456'; delay = true;
    const loggingIn = h.element('login-btn').fire('click'); await settle();
    await h.element('guest-play-btn').fire('click');
    pending.resolve(null); await loggingIn;
    assert.equal(logins, 0);
    assert.equal(h.element('account-mode').textContent, '游客试玩');
});

test('the mobile all-games shortcut scrolls only while its destination is still visible', async () => {
    const h = harness(); await settle(); h.deferFrames();
    await h.element('mobile-all').fire('click'); h.flushFrames();
    assert.equal(h.element('game-cards').scrolls.length, 1);
    await h.element('mobile-all').fire('click');
    await h.element('nav-abyss').fire('click'); h.flushFrames();
    assert.equal(h.element('game-cards').scrolls.length, 1);
    await h.element('mobile-all').fire('click');
    await h.element('logout-btn').fire('click'); h.flushFrames();
    assert.equal(h.element('game-cards').scrolls.length, 1);
});

test('the mobile home button returns to the top after the all-games shortcut on the same page', async () => {
    const h = harness(); await settle();
    await h.element('mobile-all').fire('click');
    assert.equal(h.element('game-cards').scrolls.length, 1);
    assert.equal(h.pageScrolls.length, 0, 'all-games must not first reset the already-visible home');
    await h.element('mobile-home').fire('click');
    assert.equal(h.pageScrolls.length, 1);
    assert.equal(h.pageScrolls[0].top, 0);
    assert.equal(h.pageScrolls[0].left, 0);
    assert.equal(h.element('main-page').getAttribute('data-active-section'), 'home');
    assert.equal(h.element('game-cards').scrolls.length, 1);
});

test('a newer mobile home click cancels an earlier queued all-games scroll', async () => {
    const h = harness(); await settle(); h.deferFrames();
    await h.element('mobile-all').fire('click');
    await h.element('mobile-home').fire('click');
    h.flushFrames();
    assert.equal(h.pageScrolls.length, 1);
    assert.equal(h.pageScrolls[0].top, 0);
    assert.equal(h.element('game-cards').scrolls?.length || 0, 0);
    assert.equal(h.element('main-page').getAttribute('data-active-section'), 'home');
});

test('a late verification-code response cannot move focus away from guest play', async () => {
    const pending = defer();
    const h = harness({ sendCode: () => pending.promise });
    await settle(); await h.element('logout-btn').fire('click');
    h.element('login-phone-input').value = '13800000000';
    const sending = h.element('login-send-code-btn').fire('click'); await settle();
    await h.element('guest-play-btn').fire('click');
    await h.element('nav-abyss').fire('click');
    const focus = h.document.activeElement;
    pending.resolve({ verification_id: 'v' }); await sending;
    assert.equal(h.document.activeElement, focus);
    assert.equal(h.element('main-page').getAttribute('data-active-section'), 'abyss');
});

test('SMS cooldown and in-flight guards cover keyboard and button paths', async () => {
    const pending = defer(); let sent = 0;
    const h = harness({ sendCode: async () => { sent++; return pending.promise; } });
    await settle();
    h.element('login-phone-input').value = '13800000000';
    const first = h.element('login-send-code-btn').fire('click');
    await settle();
    await h.element('login-phone-input').fire('keydown', { key: 'Enter' });
    assert.equal(sent, 1);
    pending.resolve({ verification_id: 'v1' }); await first;
    await h.element('login-phone-input').fire('keydown', { key: 'Enter' });
    assert.equal(sent, 1);
    await h.element('logout-btn').fire('click');
    await h.element('login-phone-input').fire('keydown', { key: 'Enter' });
    assert.equal(sent, 1);
    h.advance(60001);
    await h.element('login-phone-input').fire('keydown', { key: 'Enter' });
    await settle();
    assert.equal(sent, 2);
});

test('message cooldown blocks Enter, allows later messages, and guards simultaneous requests', async () => {
    const pending = defer(); let sent = 0;
    const h = harness({ getCurrentUser: async () => ({ id: 'u1', phone: '' }), sendMessage: async () => { sent++; await pending.promise; } });
    await settle();
    h.element('cloud-message-input').value = 'first';
    const first = h.element('cloud-send-message').fire('click'); await settle();
    await h.element('cloud-message-input').fire('keydown', { key: 'Enter' }); assert.equal(sent, 1);
    pending.resolve(); await first;
    h.element('cloud-message-input').value = 'second';
    await h.element('cloud-message-input').fire('keydown', { key: 'Enter' }); assert.equal(sent, 1);
    h.advance(10001);
    await h.element('cloud-message-input').fire('keydown', { key: 'Enter' }); await settle(); assert.equal(sent, 2);
});

test('the latest selected leaderboard wins even when responses arrive out of order', async () => {
    const requests = [];
    const h = harness({ loadLeaderboard: game => { const request = { game, ...defer() }; requests.push(request); return request.promise; } });
    await settle();
    const plane = h.element('tab-plane').fire('click'); await settle();
    const brick = h.element('tab-brick').fire('click'); await settle();
    assert.deepEqual(requests.map(r => r.game), ['plane', 'brick']);
    requests[1].resolve([{ playerName: 'BRICK_RESULT', score: 200 }]); await brick;
    requests[0].resolve([{ playerName: 'PLANE_RESULT', score: 100 }]); await plane;
    assert.match(h.element('leaderboard-list').innerHTML, /BRICK_RESULT/);
    assert.doesNotMatch(h.element('leaderboard-list').innerHTML, /PLANE_RESULT/);
    assert.match(h.element('leaderboard-status').textContent, /超级弹球/);
});

test('an acknowledged older score cannot delete a newer queued score', async () => {
    const h = harness(); await settle();
    h.storage.upsertPendingLeaderboardScore('plane', 100);
    h.storage.upsertPendingLeaderboardScore('plane', 200);
    h.storage.removePendingLeaderboardScore('plane', 100);
    assert.equal(h.storage.getPendingLeaderboardScores().plane.score, 200);
    h.storage.removePendingLeaderboardScore('plane', 200);
    assert.equal(h.storage.getPendingLeaderboardScores().plane, undefined);
});

test('home marks only the page navigation active, not the scroll shortcut', async () => {
    const h = harness(); await settle();
    assert.equal(h.element('mobile-home').getAttribute('aria-current'), 'page');
    assert.equal(h.element('mobile-all').getAttribute('aria-current'), null);
});

test('signing out pauses all games and returns to the guest lobby', async () => {
    let user = { id: 'u1', phone: '' };
    const h = harness({ getCurrentUser: async () => user, logout: async () => { user = null; } });
    await settle();
    const before = h.games.map(g => g.pauses);
    await h.element('logout-btn').fire('click');
    h.games.forEach((g, i) => assert.ok(g.pauses > before[i]));
    assert.equal(h.element('main-page').classList.contains('hidden'), false);
    assert.equal(h.element('logout-btn').textContent, '登录 / 同步');
});

test('an obsolete bootstrap response cannot clear a newly authenticated account', async () => {
    const restore = defer();
    let user = null, calls = 0;
    const h = harness({
        getCurrentUser: async () => calls++ === 0 ? restore.promise : user,
        sendCode: async () => ({ verification_id: 'verification' }),
        loginWithPhone: async () => user = { id: 'new-user', phone: '13800000000' },
    });
    await settle();
    await h.element('logout-btn').fire('click');
    h.element('nickname-input').value = '登录竞态测试';
    h.element('login-phone-input').value = '13800000000';
    await h.element('login-send-code-btn').fire('click');
    h.element('login-code-input').value = '123456';
    await h.element('login-btn').fire('click');
    assert.equal(h.element('account-mode').textContent, '已登录');
    restore.resolve(null);
    await settle();
    assert.equal(h.element('account-mode').textContent, '已登录');
    assert.equal(h.element('logout-btn').textContent, '退出登录');
});

test('an obsolete bootstrap network failure cannot clear a newly authenticated account', async () => {
    const restore = defer();
    let user = null, calls = 0;
    const h = harness({
        getCurrentUser: async () => calls++ === 0 ? restore.promise.then(() => { throw new Error('old request failed'); }) : user,
        sendCode: async () => ({ verification_id: 'verification' }),
        loginWithPhone: async () => user = { id: 'new-user', phone: '13800000000' },
    });
    await settle();
    await h.element('logout-btn').fire('click');
    h.element('nickname-input').value = '失败竞态测试';
    h.element('login-phone-input').value = '13800000000';
    await h.element('login-send-code-btn').fire('click');
    h.element('login-code-input').value = '123456';
    await h.element('login-btn').fire('click');
    assert.equal(h.element('account-mode').textContent, '已登录');
    restore.resolve();
    await settle();
    assert.equal(h.element('account-mode').textContent, '已登录');
    assert.equal(h.element('logout-btn').textContent, '退出登录');
});

test('work started during logout cannot restore the old account after logout completes', async () => {
    const logout = defer(), lateUser = defer();
    let user = { id: 'old-user', phone: '' }, loggingOut = false;
    const h = harness({
        getCurrentUser: async () => loggingOut ? lateUser.promise : user,
        logout: async () => { loggingOut = true; await logout.promise; user = null; loggingOut = false; },
        submitScore: async () => { if (!user) throw new Error('not logged in'); },
    });
    await settle();
    const signingOut = h.element('logout-btn').fire('click');
    await settle();
    const submission = h.games.find(game => game.submitScore).submitScore('plane', 10);
    await settle();
    logout.resolve(); await signingOut;
    assert.equal(h.element('account-mode').textContent, '游客试玩');
    lateUser.resolve({ id: 'old-user', phone: '' });
    await submission;
    assert.equal(h.element('account-mode').textContent, '游客试玩');
    assert.equal(h.element('logout-btn').textContent, '登录 / 同步');
});

test('returning to a tab resumes the active mode with no separate continue control', async () => {
    const h = harness(); await settle();
    await h.element('nav-abyss').fire('click');
    const abyss = h.games[4], before = abyss.resumes;
    h.visibility(true); h.visibility(false);
    assert.equal(abyss.resumes, before + 1);
    await h.element('logout-btn').fire('click');
    h.visibility(true); h.visibility(false);
    assert.equal(abyss.resumes, before + 1, 'hidden lobby must stay paused');
});

test('deferred section callbacks cannot resume a game after navigating away or opening login', async () => {
    const h = harness(); await settle(); h.deferFrames();
    await h.element('nav-abyss').fire('click');
    await h.element('nav-home').fire('click'); h.flushFrames();
    assert.equal(h.games[4].resumes, 0);
    await h.element('nav-pet').fire('click');
    await h.element('logout-btn').fire('click'); h.flushFrames();
    assert.equal(h.games[5].resumes, 0);
});

test('a late message response cannot repopulate the logged-out guest account', async () => {
    const pending = defer(); let user = { id: 'u1', phone: '' };
    const h = harness({ getCurrentUser: async () => user, loadMessages: () => pending.promise, logout: async () => { user = null; } });
    await settle();
    const read = h.element('cloud-refresh-messages').fire('click'); await settle();
    await h.element('logout-btn').fire('click');
    pending.resolve([{ playerName: 'LATE_USER', content: 'LATE_CONTENT' }]); await read;
    assert.doesNotMatch(h.element('cloud-messages').innerHTML, /LATE_CONTENT/);
});

async function signInForQueueTest(h, nickname) {
    await h.element('logout-btn').fire('click');
    h.element('nickname-input').value = nickname;
    h.element('login-phone-input').value = '13800000000';
    h.advance(60001);
    await h.element('login-send-code-btn').fire('click');
    h.element('login-code-input').value = '123456';
    await h.element('login-btn').fire('click');
    await settle();
}

test('A offline scores stay with A when B logs in and are retried when A returns', async () => {
    let user = { id: 'a', phone: '' }, nextUserId = 'b', fail = true;
    const attempts = [];
    const h = harness({
        getCurrentUser: async () => user,
        sendCode: async () => ({ verification_id: 'v' }),
        loginWithPhone: async () => user = { id: nextUserId, phone: '' },
        logout: async () => { user = null; },
        submitScore: async data => { attempts.push(data); if (fail) throw new Error('offline'); },
    });
    await settle();
    h.storage.setStoredNickname('Alice');
    assert.equal(await h.games[1].submitScore('plane', 120, { level: 3 }), false);
    assert.equal(h.storage.getPendingLeaderboardScores('a').plane.score, 120);
    await h.element('logout-btn').fire('click');
    await signInForQueueTest(h, 'Bob');
    assert.equal(attempts.length, 1, 'B must not upload A pending scores');
    assert.equal(h.storage.getPendingLeaderboardScores('a').plane.score, 120);
    nextUserId = 'a'; fail = false;
    await h.element('logout-btn').fire('click');
    await signInForQueueTest(h, 'Alice');
    assert.equal(attempts.length, 2);
    assert.equal(attempts[1].expectedUserId, 'a');
    assert.equal(attempts[1].playerName, 'Alice');
    assert.equal(h.storage.getPendingLeaderboardScores('a').plane, undefined);
});

test('A upload failing after B signs in is queued under the original account and nickname', async () => {
    let user = { id: 'a', phone: '' };
    const upload = defer(), attempts = [];
    const h = harness({
        getCurrentUser: async () => user,
        sendCode: async () => ({ verification_id: 'v' }),
        loginWithPhone: async () => user = { id: 'b', phone: '' },
        logout: async () => { user = null; },
        loadLeaderboard: async () => [],
        submitScore: async data => { attempts.push(data); await upload.promise; throw new Error('late network failure'); },
    });
    await settle(); h.storage.setStoredNickname('Alice');
    const submission = h.games[1].submitScore('plane', 350);
    await settle();
    await h.element('logout-btn').fire('click');
    await signInForQueueTest(h, 'Bob');
    upload.resolve(); assert.equal(await submission, false);
    assert.equal(h.storage.getPendingLeaderboardScores('a').plane.playerName, 'Alice');
    assert.equal(h.storage.getPendingLeaderboardScores('a').plane.score, 350);
    assert.equal(h.storage.getPendingLeaderboardScores('b').plane, undefined);
    assert.equal(h.storage.getPendingLeaderboardScores().plane, undefined);
    await h.element('tab-plane').fire('click');
    assert.equal(attempts.length, 1);
    assert.equal(attempts[0].expectedUserId, 'a');
});

test('guest claims survive account changes and the old A flush cannot clear the active B flush lock', async () => {
    let user = null, nextUserId = 'a';
    const requests = [];
    const h = harness({
        getCurrentUser: async () => user,
        sendCode: async () => ({ verification_id: 'v' }),
        loginWithPhone: async () => user = { id: nextUserId, phone: '' },
        logout: async () => { user = null; },
        loadLeaderboard: async () => [],
        submitScore: data => { const request = { data, ...defer() }; requests.push(request); return request.promise; },
    });
    await settle();
    await h.games[1].submitScore('plane', 400);
    await signInForQueueTest(h, 'Alice');
    assert.equal(h.storage.getPendingLeaderboardScores().plane, undefined);
    assert.equal(h.storage.getPendingLeaderboardScores('a').plane.score, 400);
    assert.equal(requests[0].data.expectedUserId, 'a');
    await h.element('logout-btn').fire('click');
    await h.games[1].submitScore('plane', 250);
    nextUserId = 'b';
    await signInForQueueTest(h, 'Bob');
    assert.equal(requests.length, 2, 'B starts its own flush while A is still waiting');
    assert.equal(requests[1].data.expectedUserId, 'b');
    assert.equal(requests[1].data.score, 250, 'B only claims the later guest score');
    requests[0].resolve(); await settle();
    const refresh = h.element('tab-plane').fire('click'); await settle();
    assert.equal(requests.length, 2, 'A finalizer cannot release B active flush lock');
    requests[1].resolve(); await refresh; await settle();
    assert.equal(h.storage.getPendingLeaderboardScores('a').plane.score, 400);
    assert.equal(h.storage.getPendingLeaderboardScores('b').plane, undefined);
});

test('logging back into the same account starts a flush for its new authentication epoch', async () => {
    let user = null;
    const requests = [];
    const h = harness({
        getCurrentUser: async () => user,
        sendCode: async () => ({ verification_id: 'v' }),
        loginWithPhone: async () => user = { id: 'a', phone: '' },
        logout: async () => { user = null; },
        submitScore: data => { const request = { data, ...defer() }; requests.push(request); return request.promise; },
    });
    await settle(); await h.games[1].submitScore('plane', 100);
    await signInForQueueTest(h, 'Alice');
    await h.element('logout-btn').fire('click');
    await signInForQueueTest(h, 'Alice');
    assert.equal(requests.length, 2);
    requests[0].resolve(); await settle();
    assert.equal(h.storage.getPendingLeaderboardScores('a').plane.score, 100);
    requests[1].resolve(); await settle();
    assert.equal(h.storage.getPendingLeaderboardScores('a').plane, undefined);
});

test('a late score acknowledgement only clears the matching account and preserves a newer score', async () => {
    const upload = defer();
    const h = harness({ getCurrentUser: async () => ({ id: 'a', phone: '' }), submitScore: () => upload.promise });
    await settle();
    const submission = h.games[1].submitScore('plane', 100); await settle();
    h.storage.upsertPendingLeaderboardScore('plane', 200, {}, 'Alice', 'a');
    h.storage.upsertPendingLeaderboardScore('plane', 50, {}, 'Bob', 'b');
    upload.resolve(); assert.equal(await submission, true);
    assert.equal(h.storage.getPendingLeaderboardScores('a').plane.score, 200);
    assert.equal(h.storage.getPendingLeaderboardScores('b').plane.score, 50);
});

test('a failed persisted guest claim prevents uploading until local storage recovers', async () => {
    const attempts = [];
    const h = harness({ getCurrentUser: async () => ({ id: 'a', phone: '' }),
        loadLeaderboard: async () => [], submitScore: async data => { attempts.push(data); } });
    await settle();
    h.storage.upsertPendingLeaderboardScore('plane', 100, {}, 'Guest');
    const originalSet = h.memory.set.bind(h.memory);
    h.memory.set = () => { throw new Error('storage unavailable'); };
    await h.element('tab-plane').fire('click');
    assert.equal(attempts.length, 0);
    assert.equal(h.storage.getPendingLeaderboardScores().plane.score, 100);
    h.memory.set = originalSet;
    await h.element('tab-plane').fire('click');
    assert.equal(attempts.length, 1);
    assert.equal(attempts[0].expectedUserId, 'a');
    assert.equal(h.storage.getPendingLeaderboardScores().plane, undefined);
});

test('logging in never uploads old queue entries whose account was not recorded', async () => {
    let user = null;
    const attempts = [], old = { plane: { game: 'plane', score: 900, playerName: 'Old', meta: { stage: 5 } } };
    const h = harness({
        getCurrentUser: async () => user,
        sendCode: async () => ({ verification_id: 'v' }),
        loginWithPhone: async () => user = { id: 'a', phone: '' },
        submitScore: async data => { attempts.push(data); },
    });
    await settle();
    h.memory.set('rosang.leaderboardPending', JSON.stringify(old));
    await signInForQueueTest(h, 'Alice');
    assert.equal(attempts.length, 0);
    assert.deepEqual(JSON.parse(h.memory.get('rosang.leaderboardPending')), old);
    h.storage.upsertPendingLeaderboardScore('brick', 50, {}, 'Alice', 'a');
    assert.deepEqual(JSON.parse(h.memory.get('rosang.leaderboardPending')).legacy, old);
});

test('an older message snapshot cannot remove a newly sent message', async () => {
    const reads = [];
    const h = harness({ getCurrentUser: async () => ({ id: 'a' }), sendMessage: async () => {},
        loadMessages: () => { const read = defer(); reads.push(read); return read.promise; } });
    await settle();
    const first = h.element('cloud-refresh-messages').fire('click'); await settle();
    h.element('cloud-message-input').value = 'NEW_MESSAGE';
    const sending = h.element('cloud-send-message').fire('click'); await settle();
    reads[1].resolve([{ playerName: 'Alice', content: 'NEW_MESSAGE' }]); await sending;
    reads[0].resolve([]); await first;
    assert.match(h.element('cloud-messages').innerHTML, /NEW_MESSAGE/);
    assert.match(h.element('cloud-tip').textContent, /1 条/);
});

test('an obsolete message read failure cannot replace the latest successful list', async () => {
    const old = defer(); let count = 0;
    const h = harness({ getCurrentUser: async () => ({ id: 'a' }), loadMessages: async () => {
        if (++count === 1) { await old.promise; throw new Error('OLD_FAILURE'); }
        return [{ content: 'LATEST_MESSAGE' }];
    } });
    await settle();
    const first = h.element('cloud-refresh-messages').fire('click'); await settle();
    await h.element('cloud-refresh-messages').fire('click'); old.resolve(); await first;
    assert.match(h.element('cloud-messages').innerHTML, /LATEST_MESSAGE/);
    assert.doesNotMatch(h.element('cloud-tip').textContent, /OLD_FAILURE/);
});

test('sending binds the original account and its late response cannot clear a new account draft', async () => {
    const pending = defer(), payloads = []; let user = { id: 'a' };
    const h = harness({ getCurrentUser: async () => user, logout: async () => { user = null; },
        sendCode: async () => ({ verification_id: 'v' }), loginWithPhone: async () => user = { id: 'b' },
        sendMessage: async data => { payloads.push(data); await pending.promise; } });
    await settle(); h.element('cloud-message-input').value = 'same words';
    const sending = h.element('cloud-send-message').fire('click'); await settle();
    assert.equal(payloads[0].expectedUserId, 'a');
    await h.element('logout-btn').fire('click'); await signInForQueueTest(h, 'Bob');
    h.element('cloud-message-input').value = 'same words';
    pending.resolve(); await sending;
    assert.equal(h.element('cloud-message-input').value, 'same words');
    assert.equal(h.element('cloud-send-message').textContent, '发送');
    assert.equal(h.element('cloud-send-message').disabled, false);
});

test('an old account send completion cannot unlock the new account send in flight', async () => {
    const first = defer(), second = defer(); let sends = 0, user = { id: 'a' };
    const h = harness({ getCurrentUser: async () => user, logout: async () => { user = null; },
        sendCode: async () => ({ verification_id: 'v' }), loginWithPhone: async () => user = { id: 'b' },
        sendMessage: () => ++sends === 1 ? first.promise : second.promise });
    await settle(); h.element('cloud-message-input').value = 'Alice';
    const sendA = h.element('cloud-send-message').fire('click'); await settle();
    await h.element('logout-btn').fire('click'); await signInForQueueTest(h, 'Bob');
    h.element('cloud-message-input').value = 'Bob';
    const sendB = h.element('cloud-send-message').fire('click'); await settle();
    first.resolve(); await sendA;
    assert.equal(h.element('cloud-send-message').textContent, '发送中…');
    assert.equal(h.element('cloud-send-message').disabled, true);
    await h.element('cloud-message-input').fire('keydown', { key: 'Enter' }); assert.equal(sends, 2);
    second.resolve(); await sendB; assert.match(h.element('cloud-send-message').textContent, /冷却/);
});

test('a failed logout preserves running and paused games and reports the error in the visible header', async () => {
    const h = harness({ getCurrentUser: async () => ({ id: 'a' }), logout: async () => { throw new Error('NETWORK_OFFLINE'); } });
    await settle(); await h.element('nav-abyss').fire('click');
    const before = h.games.map(game => ({ pauses: game.pauses, resumes: game.resumes }));
    await h.element('logout-btn').fire('click');
    h.games.forEach((game, index) => { assert.equal(game.pauses, before[index].pauses); assert.equal(game.resumes, before[index].resumes); });
    assert.equal(h.element('main-page').getAttribute('data-active-section'), 'abyss');
    assert.equal(h.element('account-mode').textContent, '已登录');
    assert.match(h.element('cloud-status').textContent, /退出登录失败/);
    assert.match(h.element('cloud-status').textContent, /NETWORK_OFFLINE/);
});

test('a failed guest score claim still permits reading the public leaderboard', async () => {
    let uploads = 0, reads = 0;
    const h = harness({ getCurrentUser: async () => ({ id: 'a' }), submitScore: async () => { uploads++; },
        loadLeaderboard: async () => { reads++; return [{ playerName: 'TOP_PLAYER', score: 999 }]; } });
    await settle(); h.storage.upsertPendingLeaderboardScore('plane', 10);
    h.memory.set = () => { throw new Error('quota exceeded'); };
    await h.element('tab-plane').fire('click');
    assert.equal(uploads, 0); assert.equal(reads, 1);
    assert.match(h.element('leaderboard-list').innerHTML, /TOP_PLAYER/);
    assert.match(h.element('leaderboard-status').textContent, /补传暂未完成/);
    assert.equal(h.storage.getPendingLeaderboardScores().plane.score, 10);
});

test('the public leaderboard is rendered while a score upload is still pending', async () => {
    const pending = defer();
    const h = harness({ getCurrentUser: async () => ({ id: 'a' }), submitScore: () => pending.promise,
        loadLeaderboard: async () => [{ playerName: 'VISIBLE_WHILE_UPLOADING', score: 999 }] });
    await settle(); h.storage.upsertPendingLeaderboardScore('plane', 10);
    const reading = h.element('tab-plane').fire('click'); await settle();
    assert.match(h.element('leaderboard-list').innerHTML, /VISIBLE_WHILE_UPLOADING/);
    pending.resolve(); await reading;
    assert.equal(h.storage.getPendingLeaderboardScores('a').plane, undefined);
});

test('a failed leaderboard request displays an error instead of claiming there are no scores', async () => {
    const h = harness({ loadLeaderboard: async () => { throw new Error('INDEX_UNAVAILABLE'); } });
    await settle(); await h.element('tab-plane').fire('click');
    assert.match(h.element('leaderboard-list').innerHTML, /无法读取/);
    assert.doesNotMatch(h.element('leaderboard-list').innerHTML, /暂无数据/);
    assert.match(h.element('leaderboard-status').textContent, /INDEX_UNAVAILABLE/);
});

test('a guest is invited to log in without falsely claiming that the unread message board is empty', async () => {
    let reads = 0;
    const h = harness({ loadMessages: async () => { reads++; return []; } });
    await settle(); await h.element('nav-message-board').fire('click'); await settle();
    assert.equal(reads, 0);
    assert.match(h.element('cloud-messages').innerHTML, /登录后/);
    assert.doesNotMatch(h.element('cloud-messages').innerHTML, /还没有留言|抢第一条/);
    assert.equal(h.element('cloud-message-input').disabled, true);
});

test('an invalid navigation target cannot hide the active page or pause its game', async () => {
    const h = harness(); await settle();
    await h.element('nav-abyss').fire('click');
    const before = h.games.map(game => game.pauses);
    h.element('nav-plane').dataset.target = 'missing-section';
    await h.element('nav-plane').fire('click');
    assert.equal(h.element('main-page').getAttribute('data-active-section'), 'abyss');
    assert.equal(h.element('abyss').classList.contains('hidden'), false);
    h.games.forEach((game, index) => assert.equal(game.pauses, before[index]));
});

test('IME confirmation Enter cannot send a code, log in, or post a message', async () => {
    const compositionEvents = [{ key: 'Enter', isComposing: true, keyCode: 13 }, { key: 'Enter', isComposing: false, keyCode: 229 }];
    for (const loginField of ['nickname-input', 'login-code-input']) {
        let codes = 0, logins = 0, messages = 0, user = null;
        const h = harness({ getCurrentUser: async () => user,
            sendCode: async () => { codes++; return { verification_id: 'v' }; },
            loginWithPhone: async () => { logins++; return user = { id: 'a' }; },
            sendMessage: async () => { messages++; },
        });
        await settle(); await h.element('logout-btn').fire('click');
        h.element('nickname-input').value = '中文玩家';
        h.element('login-phone-input').value = '13800000000';
        for (const event of compositionEvents) await h.element('login-phone-input').fire('keydown', event);
        await settle(); assert.equal(codes, 0);
        await h.element('login-phone-input').fire('keydown', { key: 'Enter' }); await settle();
        assert.equal(codes, 1);
        h.element('login-code-input').value = '123456';
        for (const event of compositionEvents) await h.element(loginField).fire('keydown', event);
        await settle(); assert.equal(logins, 0);
        await h.element(loginField).fire('keydown', { key: 'Enter' }); await settle();
        assert.equal(logins, 1);
        h.element('cloud-message-input').value = '正在选词';
        for (const event of compositionEvents) await h.element('cloud-message-input').fire('keydown', event);
        await settle(); assert.equal(messages, 0);
        assert.equal(h.element('cloud-message-input').value, '正在选词');
        await h.element('cloud-message-input').fire('keydown', { key: 'Enter' }); await settle();
        assert.equal(messages, 1);
    }
});

test('the real cloud logout adapter keeps the UI signed in on a resolved SDK error and supports retry', async () => {
    let user = { id: 'a' }, failure = true;
    const auth = {
        getUser: async () => ({ data: { user } }),
        signOut: async () => {
            if (failure) return { data: {}, error: { message: 'SDK_SIGNOUT_FAILURE' } };
            user = null;
            return { data: {}, error: null };
        },
    };
    const context = { window: { cloudbase: { init: () => ({ auth: () => auth, database: () => ({}) }) } } };
    vm.runInNewContext(fs.readFileSync(new URL('../cloud-features.js', import.meta.url), 'utf8'), context);
    const api = context.window.RSCloud; await api.init();
    const h = harness({ getCurrentUser: api.getCurrentUser, logout: api.logout });
    await settle(); await h.element('nav-abyss').fire('click');
    const before = h.games.map(game => game.pauses);
    await h.element('logout-btn').fire('click');
    assert.equal(h.element('account-mode').textContent, '已登录');
    assert.equal(h.element('main-page').getAttribute('data-active-section'), 'abyss');
    assert.match(h.element('cloud-status').textContent, /SDK_SIGNOUT_FAILURE/);
    h.games.forEach((game, index) => assert.equal(game.pauses, before[index]));
    failure = false; await h.element('logout-btn').fire('click');
    assert.equal(h.element('account-mode').textContent, '游客试玩');
    assert.equal(h.element('main-page').getAttribute('data-active-section'), 'home');
    h.games.forEach((game, index) => assert.ok(game.pauses > before[index]));
});
