import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createPeakCharacter, createPeakSave, createPeakBattlePlayerPayload, getPeakSave, getPeakSaveIssue, normalizePeakSave, PEAK_STORAGE_KEY, refreshPeakStamina, renamePeakCharacter, setPeakSave } from '../js/peak-duel-storage.js';
import { createPeakSaveScheduler } from '../js/peak-duel-persistence.js';
import { createPeakSaveOwner } from '../js/peak-duel-save-owner.js';
import { createPeakBattle, resolvePeakRound, selectPeakTacticalDeclaration } from '../js/peak-duel-engine.js';
import { tickPeakTurnStart, tickPeakTurnEnd } from '../js/peak-duel-combat.js';

const now = Date.parse('2026-11-19T04:00:00Z');
const fresh = () => createPeakCharacter(createPeakSave(now), 'sword', '测试勇者', now).state;
const installStorage = (raw = null) => {
    const memory = new Map(raw == null ? [] : [[PEAK_STORAGE_KEY, raw]]);
    let unavailable = false;
    globalThis.localStorage = {
        getItem: (key) => memory.get(key) ?? null,
        setItem: (key, value) => { if (unavailable) throw new Error('quota'); memory.set(key, value); },
    };
    return { memory, failWrites: (value) => { unavailable = value; } };
};
const save = (state, at = now) => setPeakSave(state, at, { throwOnError: true });

test('stale tab cannot replace a saved purchase or progress, including after normalization', () => {
    const { memory } = installStorage();
    save(fresh());
    const tabA = getPeakSave(now), tabB = getPeakSave(now);
    const edited = renamePeakCharacter(tabA, tabA.activeCharacterId, '新角色名', now + 1).state;
    const committed = save(edited, now + 2);
    const savedRaw = memory.get(PEAK_STORAGE_KEY);
    tabB.settings.sound = false;
    assert.throws(() => save(normalizePeakSave(tabB, now + 3)), { code: 'PEAK_SAVE_CONFLICT' });
    assert.equal(memory.get(PEAK_STORAGE_KEY), savedRaw);
    assert.equal(getPeakSave(now).characters[committed.activeCharacterId].name, '新角色名');
    assert.equal(getPeakSave(now).settings.sound, true);
});

test('same-page saves advance baseline and revision through gameplay and stamina normalization', () => {
    installStorage();
    let state = save(fresh());
    for (let i = 1; i <= 4; i += 1) {
        state = renamePeakCharacter(state, state.activeCharacterId, `勇者${i}`, now + i).state;
        state = refreshPeakStamina(state, now + i);
        state = save(state, now + i);
        assert.equal(state.storageRevision, i + 1);
        assert.equal(getPeakSaveIssue(state), null);
    }
    assert.equal(getPeakSave(now).characters[state.activeCharacterId].name, '勇者4');
    assert.equal(JSON.stringify(state).includes('peakSaveBaseline'), false);
});

test('a legacy save can migrate once, but its old raw baseline cannot overwrite migration', () => {
    const legacy = fresh();
    delete legacy.storageRevision;
    installStorage(JSON.stringify(legacy));
    const first = getPeakSave(now), second = getPeakSave(now);
    assert.equal(save(first).storageRevision, 1);
    assert.throws(() => save(second), { code: 'PEAK_SAVE_CONFLICT' });
});

test('corrupt, unsupported and inaccessible saves cannot be silently overwritten', () => {
    for (const raw of ['{broken', 'null', '', JSON.stringify({ version: 999 })]) {
        const { memory } = installStorage(raw);
        const state = getPeakSave(now);
        assert.equal(getPeakSaveIssue(state)?.code, 'PEAK_SAVE_READ');
        assert.throws(() => save(state), { code: 'PEAK_SAVE_READ' });
        assert.equal(memory.get(PEAK_STORAGE_KEY), raw);
    }
    globalThis.localStorage = { getItem() { throw new Error('denied'); }, setItem() { assert.fail('must not write'); } };
    assert.throws(() => save(getPeakSave(now)), { code: 'PEAK_SAVE_READ' });
});

test('missing baseline or cleared storage is a conflict, never an implicit reset', () => {
    const { memory } = installStorage();
    const state = save(fresh());
    const copiedWithoutBaseline = JSON.parse(JSON.stringify(state));
    assert.throws(() => save(copiedWithoutBaseline), { code: 'PEAK_SAVE_CONFLICT' });
    assert.throws(() => save(fresh()), { code: 'PEAK_SAVE_CONFLICT' });
    memory.delete(PEAK_STORAGE_KEY);
    assert.throws(() => save(state), { code: 'PEAK_SAVE_CONFLICT' });
    assert.equal(memory.has(PEAK_STORAGE_KEY), false);
});

test('failed write does not advance baseline or revision and can safely retry', () => {
    const store = installStorage();
    let state = save(fresh());
    const before = store.memory.get(PEAK_STORAGE_KEY);
    state.settings.sound = false;
    store.failWrites(true);
    const failed = setPeakSave(state, now + 1);
    assert.equal(getPeakSaveIssue(failed)?.code, 'PEAK_SAVE_WRITE');
    assert.equal(failed.storageRevision, 1);
    assert.equal(store.memory.get(PEAK_STORAGE_KEY), before);
    store.failWrites(false);
    const retried = save(failed, now + 2);
    assert.equal(retried.storageRevision, 2);
    assert.equal(getPeakSave(now).settings.sound, false);
});

test('scheduler refuses an unowned write and never adopts an unsuccessful account transaction', () => {
    const store = installStorage();
    let state = save(fresh());
    let owned = false;
    const errors = [];
    const scheduler = createPeakSaveScheduler({ getState: () => state, onSaved: next => { state = next; }, onError: e => errors.push(e.code), canWrite: () => owned });
    const purchased = normalizePeakSave(state, now);
    purchased.wallet.gold -= 100;
    assert.throws(() => scheduler.commit(purchased, { throwOnError: true }), { code: 'PEAK_SAVE_OWNER' });
    assert.equal(state.wallet.gold, 500);
    owned = true;
    store.failWrites(true);
    assert.throws(() => scheduler.commit(purchased, { throwOnError: true }), { code: 'PEAK_SAVE_WRITE' });
    assert.equal(state.wallet.gold, 500);
    store.failWrites(false);
    assert.equal(scheduler.commit(purchased), true);
    assert.equal(state.wallet.gold, 400);
    assert.deepEqual(errors, ['PEAK_SAVE_OWNER', 'PEAK_SAVE_WRITE']);
    scheduler.discard();
});

test('simultaneous browser lock requests have one writer; release allows the next page', async () => {
    let held = false;
    const locks = { async request(name, options, callback) {
        assert.equal(options.ifAvailable, true);
        if (held) return callback(null);
        held = true;
        try { return await callback({ name }); } finally { held = false; }
    } };
    const first = createPeakSaveOwner({ locks }), second = createPeakSaveOwner({ locks });
    assert.deepEqual(await Promise.all([first.acquire(), second.acquire()]), [true, false]);
    assert.equal(first.owned, true);
    assert.equal(second.owned, false);
    assert.equal(await first.acquire(), true);
    first.release();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(await second.acquire(), true);
    second.release();
    const unsupported = createPeakSaveOwner({ locks: null });
    assert.equal(await unsupported.acquire(), false);
    assert.equal(unsupported.owned, false);
});

test('bath of fire cancels subsequent cleared poison in a complete combat round', () => {
    const state = fresh();
    const character = state.characters[state.activeCharacterId];
    let battle = createPeakBattle({ deck: character.deck.cards, player: createPeakBattlePlayerPayload(state), enemy: { name: '状态目标', maxHp: 100, deck: ['brace'], drawPerTurn: 1, maxMp: 100 }, dungeonId: 'test', seed: 123 });
    battle = selectPeakTacticalDeclaration(battle, 'measured_sequence').state;
    battle.enemy.hp = 1;
    battle.enemy.phoenixWard = { charges: 1, duration: 3 };
    battle.enemy.statuses = [{ id: 'burn', stacks: 3, duration: 3 }, { id: 'poison', stacks: 2, duration: 3 }];
    const result = resolvePeakRound(battle);
    assert.equal(result.ok, true);
    assert.equal(result.state.enemy.hp, 1);
    assert.notEqual(result.state.phase, 'victory');
    assert.equal(result.state.enemy.statuses.length, 0);
    assert.equal(result.state.log.some(entry => entry.text.includes('中毒造成')), false);
});

test('cleared or expired statuses do no damage while active statuses still tick', () => {
    const target = { hp: 100, maxHp: 100, level: 60, shield: 0, stats: {}, statuses: [{ id: 'poison', stacks: 0, duration: 0 }, { id: 'burn', stacks: 2, duration: 0 }, { id: 'bleed', stacks: 0, duration: 0 }] };
    assert.deepEqual(tickPeakTurnStart(target), []);
    assert.deepEqual(tickPeakTurnEnd(target), []);
    assert.equal(target.hp, 100);
    target.statuses = [{ id: 'poison', stacks: 2, duration: 3 }];
    assert.equal(tickPeakTurnStart(target).length, 1);
    assert.ok(target.hp < 100);
});
