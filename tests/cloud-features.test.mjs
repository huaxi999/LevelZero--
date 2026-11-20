import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../cloud-features.js', import.meta.url), 'utf8');
const defer = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const settle = () => new Promise(resolve => setImmediate(resolve));
const clone = value => JSON.parse(JSON.stringify(value));

function cloudHarness({ records = [], beforeUpdate = async () => {}, getUser, signOut } = {}) {
    const rows = records.map(clone);
    let nextId = 1;
    const command = { lt: value => ({ operator: 'lt', value }), exists: value => ({ operator: 'exists', value }) };
    const matches = (row, query) => Object.entries(query).every(([key, condition]) => {
        const actual = key.split('.').reduce((value, part) => value?.[part], row);
        if (condition?.operator === 'lt') return actual < condition.value;
        if (condition?.operator === 'exists') return (actual !== undefined) === condition.value;
        return actual === condition;
    });
    const db = { command, collection() {
        return { where(query) {
            return { limit() { return this; }, orderBy() { return this; }, get: async () => ({ data: rows.filter(row => matches(row, query)).map(clone) }),
                async update(payload) {
                    await beforeUpdate(payload);
                    let updated = 0;
                    for (const row of rows) if (matches(row, query)) { Object.assign(row, clone(payload)); updated++; }
                    return { updated };
                } };
        }, async add(payload) {
            const id = payload._id || `row-${nextId++}`;
            if (rows.some(row => row._id === id)) throw new Error('duplicate document id');
            rows.push({ ...clone(payload), _id: id }); return { id };
        } };
    } };
    const auth = { getUser: getUser || (async () => ({ data: { user: { id: 'u1', phone: '' } } })), signOut };
    const context = { window: { cloudbase: { init: () => ({ auth: () => auth, database: () => db }) } } };
    vm.runInNewContext(source, context);
    return { api: context.window.RSCloud, rows };
}

test('a lower score arriving after a higher score cannot overwrite it', async () => {
    const waiting = defer();
    const h = cloudHarness({ records: [{ _id: 'existing', board: 'rsgame_scores', game: 'plane', userId: 'u1', score: 100 }],
        beforeUpdate: async payload => { if (payload.score === 150) await waiting.promise; } });
    await h.api.init();
    const high = h.api.submitScore({ game: 'plane', score: 200, expectedUserId: 'u1' });
    const low = h.api.submitScore({ game: 'plane', score: 150, expectedUserId: 'u1' });
    await high; await settle(); waiting.resolve(); await low;
    assert.equal(h.rows[0].score, 200);
});

test('simultaneous first scores create one record and retain the highest score', async () => {
    const h = cloudHarness(); await h.api.init();
    await Promise.all([h.api.submitScore({ game: 'plane', score: 100, expectedUserId: 'u1' }), h.api.submitScore({ game: 'plane', score: 200, expectedUserId: 'u1' })]);
    assert.equal(h.rows.length, 1);
    assert.equal(h.rows[0].score, 200);
    await assert.rejects(h.api.submitScore({ game: 'plane', score: Infinity, expectedUserId: 'u1' }), /有效/);
});

test('a score cannot be submitted without its intended account or after the SDK switches accounts', async () => {
    const currentUser = defer();
    const h = cloudHarness({ getUser: () => currentUser.promise }); await h.api.init();
    const submission = h.api.submitScore({ game: 'plane', score: 100, expectedUserId: 'account-a' });
    const rejected = assert.rejects(submission, error => error.code === 'AUTH_CHANGED');
    currentUser.resolve({ data: { user: { id: 'account-b', phone: '' } } });
    await rejected;
    await assert.rejects(h.api.submitScore({ game: 'plane', score: 100 }), error => error.code === 'AUTH_CHANGED');
    assert.equal(h.rows.length, 0);
});

test('a score write already prepared for A never changes its record owner when the session becomes B', async () => {
    const waiting = defer();
    let userId = 'account-a';
    const h = cloudHarness({
        records: [{ _id: 'a', board: 'rsgame_scores', game: 'plane', userId: 'account-a', score: 10 },
            { _id: 'b', board: 'rsgame_scores', game: 'plane', userId: 'account-b', score: 20 }],
        getUser: async () => ({ data: { user: { id: userId, phone: '' } } }),
        beforeUpdate: () => waiting.promise,
    });
    await h.api.init();
    const submission = h.api.submitScore({ game: 'plane', score: 100, expectedUserId: 'account-a' });
    await settle(); userId = 'account-b'; waiting.resolve(); await submission;
    assert.equal(h.rows.find(row => row.userId === 'account-a').score, 100);
    assert.equal(h.rows.find(row => row.userId === 'account-b').score, 20);
});

test('pet writes require the current account and the last loaded remote version', async () => {
    const h = cloudHarness({ records: [{ _id: 'pet', board: 'rsgame_pets', userId: 'u1', save: { updatedAt: 100, revision: 4, coins: 9000 } }] });
    await h.api.init();
    const before = clone(h.rows);
    await assert.rejects(h.api.savePetSave({ updatedAt: 200, revision: 1, coins: 280 }, { userId: 'u1', expectedUpdatedAt: null, expectedRevision: null }), /已更新/);
    assert.deepEqual(h.rows, before);
    await assert.rejects(h.api.savePetSave({}, { userId: 'other' }), /账号已变化/);
    await h.api.savePetSave({ updatedAt: 200, revision: 5, coins: 9010 }, { userId: 'u1', expectedUpdatedAt: 100, expectedRevision: 4 });
    assert.equal(h.rows[0].save.coins, 9010);
    await assert.rejects(h.api.savePetSave({ updatedAt: 300, revision: 5, coins: 280 }, { userId: 'u1', expectedUpdatedAt: 100, expectedRevision: 4 }), /已更新/);
});

test('simultaneous pet writes compare the token atomically, including legacy records', async () => {
    const waiting = defer();
    const h = cloudHarness({ records: [{ _id: 'pet', board: 'rsgame_pets', userId: 'u1', save: { updatedAt: 100, revision: 4 } }],
        beforeUpdate: async payload => { if (payload.save.coins === 2) await waiting.promise; } });
    await h.api.init();
    const expected = { userId: 'u1', expectedUpdatedAt: 100, expectedRevision: 4 };
    const first = h.api.savePetSave({ updatedAt: 200, revision: 5, coins: 1 }, expected);
    const second = h.api.savePetSave({ updatedAt: 200, revision: 5, coins: 2 }, expected);
    await first; await settle(); waiting.resolve();
    await assert.rejects(second, /已变化/);
    assert.equal(h.rows[0].save.coins, 1);
});

test('concurrent creation cannot replace another newly created pet', async () => {
    const h = cloudHarness(); await h.api.init();
    const expected = { userId: 'u1', expectedUpdatedAt: null, expectedRevision: null };
    const results = await Promise.allSettled([
        h.api.savePetSave({ updatedAt: 100, revision: 1, name: 'first' }, expected),
        h.api.savePetSave({ updatedAt: 101, revision: 1, name: 'second' }, expected),
    ]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(h.rows.length, 1);
    assert.equal(h.rows[0].save.name, 'first');
});

test('authentication network errors are not interpreted as an empty guest cloud save', async () => {
    const h = cloudHarness({ getUser: async () => { throw new Error('network failure'); } }); await h.api.init();
    await assert.rejects(h.api.getCurrentUser(), /network failure/);
    await assert.rejects(h.api.loadPetSave(), /network failure/);
});

test('an existing malformed pet record is preserved rather than treated as an empty cloud slot', async () => {
    for (const save of [undefined, null, 'broken', []]) {
        const h = cloudHarness({ records: [{ _id: 'pet', board: 'rsgame_pets', userId: 'u1', save }] });
        await h.api.init();
        const before = clone(h.rows);
        await assert.rejects(h.api.loadPetSave(), /格式异常/);
        await assert.rejects(h.api.savePetSave({ updatedAt: 200, revision: 1 }, { userId: 'u1', expectedUpdatedAt: null, expectedRevision: null }), /格式异常/);
        assert.deepEqual(h.rows, before);
    }
});

test('SDK loading is asynchronous, shared across callers, and can retry after failure', async () => {
    const scripts = [], timers = new Map(); let timerId = 0;
    const context = { window: {}, document: { createElement: () => ({ remove() { this.removed = true; } }), head: { appendChild: script => scripts.push(script) } },
        setTimeout: fn => { const id = ++timerId; timers.set(id, fn); return id; }, clearTimeout: id => timers.delete(id) };
    vm.runInNewContext(source, context);
    const api = context.window.RSCloud;
    const pending = Promise.allSettled([api.init(), api.init()]);
    assert.equal(scripts.length, 1); assert.equal(scripts[0].async, true);
    scripts[0].onerror();
    assert.equal((await pending).filter(result => result.status === 'rejected').length, 2);
    const retry = api.init(); assert.equal(scripts.length, 2);
    context.window.cloudbase = { init: () => ({ auth: () => ({}), database: () => ({}) }) };
    scripts[1].onload(); await retry;
    assert.equal(timers.size, 0);
});

test('a message cannot be submitted without its intended account or after the SDK switches accounts', async () => {
    const pendingUser = defer();
    const h = cloudHarness({ getUser: () => pendingUser.promise }); await h.api.init();
    const sending = h.api.sendMessage({ expectedUserId: 'account-a', playerName: 'Alice', content: 'A draft' });
    const rejected = assert.rejects(sending, error => error.code === 'AUTH_CHANGED');
    pendingUser.resolve({ data: { user: { id: 'account-b', phone: '' } } });
    await rejected;
    await assert.rejects(h.api.sendMessage({ playerName: 'Alice', content: 'No account' }), error => error.code === 'AUTH_CHANGED');
    assert.equal(h.rows.length, 0);
    await h.api.sendMessage({ expectedUserId: 'account-b', playerName: 'Bob', content: 'B draft' });
    assert.equal(h.rows[0].userId, 'account-b');
    assert.equal(h.rows[0].content, 'B draft');
});

function readHarness({ rows = [], failOrdered = false, malformed = false } = {}) {
    const requests = [];
    const db = { collection() { return { where(filter) {
        let ordering = null, maxRows = Infinity;
        return {
            orderBy(key, direction) { ordering = { key, direction }; return this; },
            limit(count) { maxRows = count; return this; },
            async get() {
                requests.push({ filter, ordering, maxRows });
                if (failOrdered && ordering) throw new Error('index unavailable');
                if (malformed) return { data: null };
                const result = rows.filter(row => Object.entries(filter).every(([key, value]) => row[key] === value)).map(clone);
                if (ordering) result.sort((a, b) => {
                    const difference = a[ordering.key] < b[ordering.key] ? -1 : a[ordering.key] > b[ordering.key] ? 1 : 0;
                    return ordering.direction === 'desc' ? -difference : difference;
                });
                return { data: result.slice(0, maxRows) };
            },
        };
    } }; } };
    const context = { window: { cloudbase: { init: () => ({
        auth: () => ({ getUser: async () => ({ data: { user: { id: 'u1' } } }) }), database: () => db,
    }) } } };
    vm.runInNewContext(source, context);
    return { api: context.window.RSCloud, requests };
}

test('an unavailable ordered query reports failure without displaying an arbitrary truncated fallback', async () => {
    const h = readHarness({ failOrdered: true }); await h.api.init();
    await assert.rejects(h.api.loadMessages(), /留言暂时无法读取/);
    await assert.rejects(h.api.loadLeaderboard('plane'), /排行榜暂时无法读取/);
    assert.equal(h.requests.length, 2);
    assert.ok(h.requests.every(request => request.ordering), 'never issue an unordered fallback');
});

test('valid ordered reads select the actual latest 100 messages and highest 50 scores', async () => {
    const rows = [
        ...Array.from({ length: 101 }, (_, index) => ({ board: 'rsgame', content: `message-${index + 1}`, createdAt: new Date(1700000000000 + index * 1000).toISOString() })),
        ...Array.from({ length: 51 }, (_, index) => ({ board: 'rsgame_scores', game: 'plane', score: index + 1, playerName: `player-${index + 1}` })),
    ];
    const h = readHarness({ rows }); await h.api.init();
    const messages = await h.api.loadMessages();
    assert.equal(messages.length, 100);
    assert.equal(messages[0].content, 'message-2');
    assert.equal(messages.at(-1).content, 'message-101');
    const scores = await h.api.loadLeaderboard('plane');
    assert.equal(scores.length, 50);
    assert.equal(scores[0].score, 51);
    assert.equal(scores.at(-1).score, 2);
});

test('malformed query responses are errors, while confirmed empty arrays remain valid empty results', async () => {
    const broken = readHarness({ malformed: true }); await broken.api.init();
    await assert.rejects(broken.api.loadMessages(), /无法读取/);
    await assert.rejects(broken.api.loadLeaderboard('plane'), /无法读取/);
    const empty = readHarness(); await empty.api.init();
    assert.equal((await empty.api.loadMessages()).length, 0);
    assert.equal((await empty.api.loadLeaderboard('plane')).length, 0);
});

test('logout checks the SDK resolved error contract and preserves its failure message', async () => {
    const failed = cloudHarness({ signOut: async () => ({ data: {}, error: { code: 'network_error', message: 'SIGNOUT_NETWORK_FAILURE' } }) });
    await failed.api.init();
    await assert.rejects(failed.api.logout(), /SIGNOUT_NETWORK_FAILURE/);
    const unnamed = cloudHarness({ signOut: async () => ({ data: {}, error: { code: 'unknown' } }) });
    await unnamed.api.init(); await assert.rejects(unnamed.api.logout(), /退出登录失败/);
    const success = cloudHarness({ signOut: async () => ({ data: {}, error: null }) });
    await success.api.init(); await success.api.logout();
    const rejected = cloudHarness({ signOut: async () => { throw new Error('REJECTED_SIGNOUT'); } });
    await rejected.api.init(); await assert.rejects(rejected.api.logout(), /REJECTED_SIGNOUT/);
});
