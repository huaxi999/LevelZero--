import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../js/storage.js', import.meta.url), 'utf8');
const exports = [...source.matchAll(/export const (\w+)/g)].map(match => match[1]);
const queueKey = 'rosang.leaderboardPending';
const plain = value => JSON.parse(JSON.stringify(value));

function queueHarness(initial) {
    const memory = new Map(initial ? [[queueKey, JSON.stringify(initial)]] : []);
    let writes = 0, failWrites = false;
    const context = { localStorage: {
        getItem: key => memory.get(key) ?? null,
        setItem(key, value) {
            if (failWrites) throw new Error('storage unavailable');
            writes++; memory.set(key, String(value));
        },
    } };
    vm.runInNewContext(source.replaceAll('export const ', 'const ') + `\nglobalThis.api = {${exports.join(',')}};`, context);
    return { api: context.api, memory, get writes() { return writes; }, failWrites(value) { failWrites = value; } };
}

test('guest and each account retain independent best pending scores', () => {
    const { api } = queueHarness();
    api.upsertPendingLeaderboardScore('plane', 100, {}, 'Guest');
    api.upsertPendingLeaderboardScore('plane', 200, {}, 'Alice', 'a');
    api.upsertPendingLeaderboardScore('plane', 300, {}, 'Bob', 'b');
    api.upsertPendingLeaderboardScore('plane', 150, {}, 'Alice', 'a');
    assert.equal(api.getPendingLeaderboardScores().plane.score, 100);
    assert.equal(api.getPendingLeaderboardScores('a').plane.score, 200);
    assert.equal(api.getPendingLeaderboardScores('b').plane.score, 300);
    api.removePendingLeaderboardScore('plane', 200, 'a');
    assert.equal(api.getPendingLeaderboardScores('a').plane, undefined);
    assert.equal(api.getPendingLeaderboardScores().plane.score, 100);
    assert.equal(api.getPendingLeaderboardScores('b').plane.score, 300);
});

test('a delayed account acknowledgement preserves a newer score and every other source', () => {
    const { api } = queueHarness();
    api.upsertPendingLeaderboardScore('plane', 100, {}, 'Alice', 'a');
    api.upsertPendingLeaderboardScore('plane', 200, {}, 'Alice', 'a');
    api.upsertPendingLeaderboardScore('plane', 50, {}, 'Bob', 'b');
    api.upsertPendingLeaderboardScore('plane', 10, {}, 'Guest');
    api.removePendingLeaderboardScore('plane', 100, 'a');
    assert.equal(api.getPendingLeaderboardScores('a').plane.score, 200);
    assert.equal(api.getPendingLeaderboardScores('b').plane.score, 50);
    assert.equal(api.getPendingLeaderboardScores().plane.score, 10);
});

test('old unowned records survive migration exactly and are never claimed by a login', () => {
    const old = { plane: { game: 'plane', score: 900, playerName: 'Old', meta: { level: 8 }, updatedAt: '2026-11-01T00:00:00Z' } };
    const { api, memory } = queueHarness(old);
    assert.deepEqual(plain(api.getPendingLeaderboardScores()), {});
    assert.deepEqual(plain(api.getPendingLeaderboardScores('a')), {});
    api.upsertPendingLeaderboardScore('brick', 50, {}, 'Guest');
    api.claimGuestLeaderboardScores('a');
    api.claimGuestLeaderboardScores('b');
    const queue = JSON.parse(memory.get(queueKey));
    assert.equal(queue.version, 2);
    assert.deepEqual(queue.legacy, old);
    assert.deepEqual(plain(api.getPendingLeaderboardScores('b')), {});
    assert.equal(api.getPendingLeaderboardScores('a').brick.score, 50);
    assert.equal(api.getPendingLeaderboardScores('a').plane, undefined);
});

test('guest scores are claimed in one persisted write and cannot be claimed again by another account', () => {
    const h = queueHarness(), { api } = h;
    api.upsertPendingLeaderboardScore('plane', 100, {}, 'Guest');
    api.upsertPendingLeaderboardScore('brick', 200, {}, 'Guest');
    api.upsertPendingLeaderboardScore('plane', 150, {}, 'Alice', 'a');
    const before = h.writes;
    api.claimGuestLeaderboardScores('a');
    assert.equal(h.writes, before + 1);
    assert.deepEqual(plain(api.getPendingLeaderboardScores()), {});
    assert.equal(api.getPendingLeaderboardScores('a').plane.score, 150);
    assert.equal(api.getPendingLeaderboardScores('a').brick.score, 200);
    api.claimGuestLeaderboardScores('b');
    assert.deepEqual(plain(api.getPendingLeaderboardScores('b')), {});
});

test('a failed local claim leaves the original guest queue available and reports failure', () => {
    const h = queueHarness(), { api } = h;
    api.upsertPendingLeaderboardScore('plane', 100, {}, 'Guest');
    const before = h.memory.get(queueKey);
    h.failWrites(true);
    assert.throws(() => api.claimGuestLeaderboardScores('a'), /storage unavailable/);
    assert.equal(h.memory.get(queueKey), before);
    assert.equal(api.getPendingLeaderboardScores().plane.score, 100);
    assert.deepEqual(plain(api.getPendingLeaderboardScores('a')), {});
});
