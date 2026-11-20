import test, { beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';

const memory = new Map();
let failWrites = false;
let now = new Date(2026, 10, 19, 12).getTime();
const originalNow = Date.now;
const originalChannel = globalThis.BroadcastChannel;
globalThis.BroadcastChannel = undefined;
globalThis.localStorage = {
    getItem: key => memory.get(key) ?? null,
    setItem(key, value) { if (failWrites) throw new Error('quota'); memory.set(key, String(value)); },
};
Date.now = () => now;
const pet = await import('../js/pet-storage.js');
const data = await import('../js/pet-data.js');
const snapshot = () => JSON.parse(memory.get(pet.PET_STORAGE_KEY));
beforeEach(() => { memory.clear(); failWrites = false; now = new Date(2026, 10, 19, 12).getTime(); });
after(() => { Date.now = originalNow; globalThis.BroadcastChannel = originalChannel; });

test('30-second simulations retain the same growth and needs as one hour of elapsed time', () => {
    for (const species of ['shadow-wolf', 'void-mage']) {
        memory.clear();
        const start = pet.createPet('星星', species);
        const base = now;
        let stepped = start;
        for (let step = 1; step <= 120; step++) stepped = pet.simulatePetState(stepped, base + step * 30000).state;
        const once = pet.simulatePetState(start, base + 3600000).state;
        for (const key of Object.keys(once.needs)) assert.ok(Math.abs(stepped.needs[key] - once.needs[key]) < 1e-9, key);
        assert.ok(Math.abs(stepped.relationship.growth - once.relationship.growth) < 1e-9);
        assert.ok(stepped.relationship.growth > 0.49);
        now = base + 3600000;
        const saved = pet.savePetState(stepped);
        assert.equal(pet.loadPetState().state.relationship.growth, saved.relationship.growth);
    }
});

test('reads do not write or move the simulation clock backwards', () => {
    const start = pet.createPet('星星');
    const raw = memory.get(pet.PET_STORAGE_KEY);
    failWrites = true;
    now += 30000;
    const loaded = pet.loadPetState().state;
    assert.ok(loaded.relationship.growth > 0);
    assert.equal(memory.get(pet.PET_STORAGE_KEY), raw);
    assert.equal(pet.simulatePetState(loaded, start.lastSimulatedAt).state.lastSimulatedAt, loaded.lastSimulatedAt);
});

test('stale actions reject instead of undoing the first purchase', () => {
    const stale = pet.createPet('星星');
    const first = pet.buyPetItem(stale, 'berry-bun');
    assert.equal(first.ok, true);
    assert.throws(() => pet.buyPetItem(stale, 'berry-bun'), { code: 'PET_SAVE_CONFLICT' });
    assert.equal(snapshot().wallet.coins, first.state.wallet.coins);
    assert.equal(snapshot().inventory['berry-bun'], first.state.inventory['berry-bun']);
});

test('failed storage writes preserve both the save and input cooldown maps', () => {
    const state = pet.createPet('星星');
    const before = structuredClone(state);
    const raw = memory.get(pet.PET_STORAGE_KEY);
    failWrites = true;
    assert.throws(() => pet.performPetAction(state, 'feed'), /保存失败/);
    assert.deepEqual(state, before);
    assert.equal(memory.get(pet.PET_STORAGE_KEY), raw);
    failWrites = false;
    const retry = pet.performPetAction(state, 'feed');
    assert.equal(retry.ok, true);
    assert.equal(state.lastActions.feed, undefined);
    assert.ok(retry.state.lastActions.feed > now);
});

test('invalid JSON, incomplete objects, and unsupported versions stay untouched', () => {
    for (const raw of ['{broken', 'null', '[]', '{"foo":1}', '{"version":99,"adopted":false}', '{"version":3,"adopted":true,"id":"p1"}']) {
        memory.set(pet.PET_STORAGE_KEY, raw);
        assert.throws(() => pet.loadPetState(), /无法读取/);
        assert.throws(() => pet.createPet('新伙伴'), /无法读取/);
        assert.equal(memory.get(pet.PET_STORAGE_KEY), raw);
    }
});

test('existing adopted saves cannot be replaced through the first-adoption action', () => {
    const state = pet.createPet('星星');
    assert.throws(() => pet.createPet('另一个'), /已经领养/);
    assert.equal(snapshot().id, state.id);
});

test('the inventory cap rejects a purchase without charging money', () => {
    let state = pet.createPet('星星');
    state.inventory['berry-bun'] = 99;
    state = pet.savePetState(state);
    const result = pet.buyPetItem(state, 'berry-bun');
    assert.equal(result.ok, false);
    assert.equal(result.state.wallet.coins, state.wallet.coins);
    assert.equal(snapshot().revision, state.revision);
    assert.equal(snapshot().inventory['berry-bun'], 99);
});

test('a completed exploration cannot be recalled and its reward is granted once', () => {
    const route = data.PET_EXPLORATIONS[0];
    const start = pet.startPetExploration(pet.createPet('星星'), route.id);
    assert.equal(start.ok, true);
    now = start.state.exploration.endsAt;
    const recall = pet.recallPetExploration(start.state);
    assert.equal(recall.ok, false);
    assert.equal(recall.state.exploration.status, 'ready');
    const reward = pet.claimPetExploration(recall.state);
    assert.equal(reward.ok, true);
    assert.equal(reward.state.exploration, null);
    assert.throws(() => pet.claimPetExploration(recall.state), { code: 'PET_SAVE_CONFLICT' });
    assert.equal(pet.claimPetExploration(reward.state).ok, false);
    assert.equal(snapshot().stats.explorationsCompleted, 1);
});

test('a competition preview keeps its opponent but settles at the real current day', () => {
    now = new Date(2026, 10, 19, 23, 59, 50).getTime();
    const state = pet.createPet('星星');
    const competition = data.PET_COMPETITIONS[0];
    const division = data.PET_COMPETITION_DIVISIONS[0];
    const preview = pet.previewPetCompetition(state, competition.id, division.id);
    assert.equal(preview.ok, true);
    now += 20000;
    const result = pet.enterPetCompetition(state, competition.id, division.id, 'focus', now, preview.matchAt);
    assert.equal(result.ok, true);
    assert.equal(result.opponent, preview.opponent);
    assert.equal(result.opponentStyleId, preview.opponentStyleId);
    assert.equal(result.state.lastSimulatedAt, now);
    assert.equal(result.state.competition.entriesDate, '2026-11-20');
    assert.equal(result.state.competition.entriesLeft, 4);
    assert.equal(result.state.daily.competition, 1);
    assert.equal(result.state.competition.history[0].playedAt, now);
});

test('cloud restoration backs up a different local pet and keeps revisions monotonic', () => {
    const local = pet.createPet('本地');
    const remote = structuredClone(local);
    remote.id = 'cloud-pet'; remote.name = '云端'; remote.revision = 200;
    remote.roster = { owned: [], profiles: {} };
    const restored = pet.restorePetCloudState(remote, local, 'account-1');
    assert.equal(restored.id, remote.id);
    assert.equal(restored.cloudUserId, 'account-1');
    assert.ok(restored.revision > remote.revision);
    assert.equal(JSON.parse(memory.get(`${pet.PET_STORAGE_KEY}.before-cloud-restore`)).id, local.id);
});

test('a failed cloud backup never replaces the local save', () => {
    const local = pet.createPet('本地');
    const remote = { ...local, id: 'cloud-pet' };
    const raw = memory.get(pet.PET_STORAGE_KEY);
    failWrites = true;
    assert.throws(() => pet.restorePetCloudState(remote, local, 'account-1'), /无法备份/);
    assert.equal(memory.get(pet.PET_STORAGE_KEY), raw);
});

test('switching pets keeps the shared wallet, roster and independent activities', () => {
    const first = pet.createPet('一号');
    const adopted = pet.adoptAdditionalPet(first, '二号', 'clockwork-golem');
    assert.equal(adopted.ok, true);
    const job = pet.startPetJob(adopted.state, data.PET_JOBS[0].id, data.PET_JOB_DURATIONS[0].id);
    assert.equal(job.ok, true);
    const switched = pet.switchActivePet(job.state, first.id);
    assert.equal(switched.ok, true);
    assert.equal(switched.state.job, null);
    assert.equal(switched.state.wallet.coins, job.state.wallet.coins);
    now = job.state.job.endsAt;
    const back = pet.switchActivePet(switched.state, adopted.petId);
    assert.equal(back.state.job.status, 'ready');
    const paid = pet.claimPetJob(back.state);
    assert.equal(paid.ok, true);
    assert.equal(pet.claimPetJob(paid.state).ok, false);
    assert.equal(paid.state.roster.owned.length, 2);
});
