import test, { after } from 'node:test';
import assert from 'node:assert/strict';

const originalChannel = globalThis.BroadcastChannel;
globalThis.BroadcastChannel = undefined;
const { normalizePetState } = await import('../js/pet-storage.js');
const { createPetCloudSync } = await import('../js/pet-cloud-sync.js');
const { acquirePetWriter } = await import('../js/pet-writer.js');
after(() => { globalThis.BroadcastChannel = originalChannel; });
const defer = () => { let resolve; const promise = new Promise(r => { resolve = r; }); return { promise, resolve }; };
const settle = () => new Promise(resolve => setImmediate(resolve));
const makePet = (overrides = {}) => normalizePetState({
    version: 3, adopted: true, id: 'pet-a', name: '星星', species: 'shadow-wolf',
    birthAt: 1000, lastSimulatedAt: 2000, updatedAt: 2000, revision: 5, ...overrides,
});
function harness(local, response, saveResult) {
    let state = structuredClone(local);
    const uploads = [], restores = [], statuses = [];
    const cloudSync = {
        load: async () => typeof response === 'function' ? response() : response,
        save: async (value, options) => { uploads.push({ value, options }); return saveResult ?? { saved: true, userId: options.userId }; },
    };
    const controller = createPetCloudSync({
        cloudSync, getState: () => state,
        restore(value, userId) { restores.push({ value, userId }); state = { ...structuredClone(value), cloudUserId: userId }; },
        markAccount(userId) { state = { ...state, cloudUserId: userId, revision: state.revision + 1 }; },
        onStatus: (label, message) => statuses.push({ label, message }),
    });
    return { controller, cloudSync, uploads, restores, statuses, update(value) { state = value; }, get state() { return state; } };
}

test('a new browser restores the authenticated cloud pet before any upload', async () => {
    const remote = makePet();
    const h = harness(normalizePetState(null), { status: 'authenticated', userId: 'u1', save: remote });
    assert.equal(await h.controller.sync(), true);
    assert.equal(h.state.id, remote.id);
    assert.equal(h.state.cloudUserId, 'u1');
    assert.equal(h.uploads.length, 0);
});

test('a new local adoption cannot overwrite an existing different cloud pet', async () => {
    const local = makePet({ id: 'new-pet', updatedAt: 9000 });
    const remote = makePet({ id: 'old-cloud-pet', updatedAt: 2000 });
    const h = harness(local, { status: 'authenticated', userId: 'u1', save: remote });
    await h.controller.sync();
    assert.equal(h.restores.length, 1);
    assert.equal(h.state.id, 'old-cloud-pet');
    assert.equal(h.uploads.length, 0);
});

test('guest, failed authentication and malformed remote saves never trigger an upload', async () => {
    for (const response of [
        { status: 'guest' },
        { status: 'authenticated', save: null },
        { status: 'authenticated', userId: 'u1', save: { id: 'p1', adopted: true } },
        () => { throw new Error('network unavailable'); },
    ]) {
        const h = harness(makePet(), response);
        assert.equal(await h.controller.sync(), false);
        assert.equal(h.uploads.length, 0);
        assert.equal(h.restores.length, 0);
    }
});

test('first upload requires a confirmed empty remote and binds the account', async () => {
    const h = harness(makePet(), { status: 'authenticated', userId: 'u1', save: null });
    assert.equal(await h.controller.sync(), true);
    assert.equal(h.uploads[0].value.cloudUserId, 'u1');
    assert.deepEqual(h.uploads[0].options, { userId: 'u1', expectedUpdatedAt: null, expectedRevision: null });
});

test('local progress uploads with the exact version read from the cloud', async () => {
    const remote = makePet({ updatedAt: 2000, revision: 8 });
    const h = harness(makePet({ updatedAt: 4000, revision: 12, cloudUserId: 'u1' }), { status: 'authenticated', userId: 'u1', save: remote });
    await h.controller.sync();
    assert.equal(h.restores.length, 0);
    assert.deepEqual(h.uploads[0].options, { userId: 'u1', expectedUpdatedAt: 2000, expectedRevision: 8 });
    assert.equal(h.uploads[0].value.revision, 12);
});

test('changing the active pet in one roster does not restore the old active pet', async () => {
    const remote = makePet();
    const local = makePet({ id: 'pet-b', updatedAt: 4000, cloudUserId: 'u1' });
    local.roster.owned.push({ id: remote.id, speciesId: remote.species });
    const h = harness(local, { status: 'authenticated', userId: 'u1', save: remote });
    await h.controller.sync();
    assert.equal(h.restores.length, 0);
    assert.equal(h.uploads[0].value.id, 'pet-b');
});

test('a different account without a cloud pet cannot receive the previous account pet', async () => {
    const h = harness(makePet({ cloudUserId: 'old-account' }), { status: 'authenticated', userId: 'new-account', save: null });
    assert.equal(await h.controller.sync(), false);
    assert.equal(h.uploads.length, 0);
    assert.match(h.statuses.at(-1).message, /另一账号/);
});

test('progress made while a cloud restore is pending is preserved', async () => {
    const pending = defer();
    const h = harness(makePet({ updatedAt: 2000 }), () => pending.promise);
    const sync = h.controller.sync(); await settle();
    h.update({ ...h.state, revision: 6, updatedAt: 4000 });
    pending.resolve({ status: 'authenticated', userId: 'u1', save: makePet({ updatedAt: 9000 }) });
    assert.equal(await sync, false);
    assert.equal(h.state.revision, 6);
    assert.equal(h.restores.length, 0);
    assert.equal(h.uploads.length, 0);
});

test('rejected saves do not report successful cloud persistence', async () => {
    for (const outcome of [{ saved: false, reason: 'guest' }, { saved: true, userId: 'other-user' }]) {
        const h = harness(makePet(), { status: 'authenticated', userId: 'u1', save: null }, outcome);
        assert.equal(await h.controller.sync(), false);
        assert.equal(h.statuses.at(-1).label, '本地');
    }
    const h = harness(makePet(), { status: 'authenticated', userId: 'u1', save: null });
    h.cloudSync.save = async () => { throw new Error('cloud version conflict'); };
    assert.equal(await h.controller.sync(), false);
    assert.match(h.statuses.at(-1).message, /cloud version conflict/);
});

test('simultaneous sync requests are serialized', async () => {
    const pending = defer(); let loads = 0;
    const h = harness(makePet(), async () => { loads++; if (loads === 1) await pending.promise; return { status: 'authenticated', userId: 'u1', save: null }; });
    const first = h.controller.sync();
    const second = h.controller.sync();
    await settle(); assert.equal(loads, 1);
    pending.resolve();
    assert.deepEqual(await Promise.all([first, second]), [true, true]);
    assert.equal(loads, 2);
});

test('two devices with identical progress do not ping-pong restoration revisions', async () => {
    const remote = makePet({ cloudUserId: 'u1', revision: 6 });
    const first = harness({ ...structuredClone(remote), revision: 7 }, { status: 'authenticated', userId: 'u1', save: remote });
    const second = harness({ ...structuredClone(remote), revision: 2 }, { status: 'authenticated', userId: 'u1', save: remote });
    for (let index = 0; index < 8; index++) {
        assert.equal(await first.controller.sync(), true);
        assert.equal(await second.controller.sync(), true);
    }
    assert.equal(first.uploads.length + second.uploads.length, 0);
    assert.equal(first.restores.length + second.restores.length, 0);
    assert.equal(remote.revision, 6);
});

test('only one browser page owns the pet writer lock and release permits a retry', async () => {
    let held = false;
    const locks = { async request(name, options, callback) {
        assert.equal(name, 'pixel-park-pet-writer');
        assert.equal(options.ifAvailable, true);
        if (held) return callback(null);
        held = true;
        try { await callback({ name }); } finally { held = false; }
    } };
    const first = await acquirePetWriter({ locks, page: null });
    const second = await acquirePetWriter({ locks, page: null });
    assert.equal(first.owned, true);
    assert.equal(second.owned, false);
    first.release(); await settle();
    const retry = await acquirePetWriter({ locks, page: null });
    assert.equal(retry.owned, true);
    retry.release(); await settle();
});

test('lock unavailability and rejected requests keep the page read-only', async () => {
    assert.equal((await acquirePetWriter({ locks: null, page: null })).owned, false);
    const result = await acquirePetWriter({ locks: { request: async () => { throw new Error('blocked'); } }, page: null });
    assert.equal(result.owned, false);
});
