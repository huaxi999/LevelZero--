import assert from 'node:assert/strict';

import {
    PEAK_ADVANCEMENTS,
    PEAK_CARD_BY_ID,
    PEAK_DUNGEON_BASE_LEVELS,
    PEAK_DUNGEONS,
    PEAK_EARLY_HARD_REWARD_MULTIPLIER,
    PEAK_EQUIPMENT_DROP_BANDS,
    PEAK_EQUIPMENT_NAME_POOLS,
    PEAK_LATE_ENEMY_SCALING,
} from '../js/peak-duel-data.js';
import {
    PEAK_CLASS_SHARD_EXCHANGE_RATE,
    PEAK_DAILY_MISSION_COUNT,
    PEAK_DUPLICATE_TO_SHARD_RATE,
    PEAK_MISSIONS,
    PEAK_SAVE_VERSION,
    PEAK_TRIAL_WEEKLY_LIMIT,
    advancePeakCharacter,
    claimPeakMission,
    convertPeakClassShardsToUniversal,
    convertPeakDuplicateCards,
    createPeakCharacter,
    createPeakSave,
    equipPeakItem,
    generatePeakEquipment,
    getPeakLevelXpRequirement,
    getPeakMissionStatus,
    getPeakPlayerDrawPerTurn,
    getPeakClassShardBalance,
    normalizePeakSave,
    recordPeakMissionEvent,
    startPeakTrial,
    upgradePeakCard,
} from '../js/peak-duel-storage.js';

const monday = Date.parse('2026-08-17T04:00:00.000Z');
const day = 24 * 60 * 60 * 1000;
const week = 7 * day;

const saveWithSword = (now = monday) => {
    const created = createPeakCharacter(createPeakSave(now), 'sword', '经济测试', now);
    return created.state;
};

assert.equal(PEAK_SAVE_VERSION, 18, 'class shard changes require save version 18');
assert.equal(PEAK_DUPLICATE_TO_SHARD_RATE, 1, 'one duplicate card should convert to one shard');
assert.equal(PEAK_CLASS_SHARD_EXCHANGE_RATE, 2, 'two class shards should convert to one universal shard');
assert.deepEqual([1, 14, 15, 35, 36, 60].map((level) => getPeakPlayerDrawPerTurn(level)), [2, 2, 2, 2, 3, 3], 'player draw should stay at two through the mid game and rise to three for late content');

{
    const save = saveWithSword();
    const character = save.characters[save.activeCharacterId];
    const cardId = character.deck.cards.find((id) => PEAK_CARD_BY_ID[id]?.classId === 'sword');
    save.classCollections.sword[cardId].upgradeCopies = 2;
    const converted = convertPeakDuplicateCards(save, cardId, 2, monday);
    assert.equal(converted.ok, true, 'class-card duplicates should be convertible');
    assert.equal(converted.copiesUsed, 2);
    assert.equal(converted.shardCount, 2);
    assert.equal(converted.shardClassId, 'sword');
    assert.equal(converted.state.classShards.sword.common, 2);
    assert.equal(converted.state.universalShards.common, 0);

    const exchanged = convertPeakClassShardsToUniversal(converted.state, 'sword', 'common', 2, monday);
    assert.equal(exchanged.ok, true, 'two class shards should exchange for one universal shard');
    assert.equal(exchanged.classShardsUsed, 2);
    assert.equal(exchanged.universalShards, 1);
    assert.equal(exchanged.state.classShards.sword.common, 0);
    assert.equal(exchanged.state.universalShards.common, 1);
}

{
    const save = saveWithSword();
    const character = save.characters[save.activeCharacterId];
    const sharedCardId = character.deck.cards.find((id) => PEAK_CARD_BY_ID[id]?.classId === 'all');
    save.collection[sharedCardId].upgradeCopies = 1;
    const converted = convertPeakDuplicateCards(save, sharedCardId, 1, monday);
    assert.equal(converted.ok, true, 'universal-card duplicates should be convertible');
    assert.equal(converted.shardKind, 'universal');
    assert.equal(converted.state.universalShards.common, 1);
    assert.equal(getPeakClassShardBalance(converted.state, 'sword', 'common'), 0);
}

{
    const save = saveWithSword();
    const character = save.characters[save.activeCharacterId];
    const cardId = character.deck.cards.find((id) => PEAK_CARD_BY_ID[id]?.classId === 'sword');
    const entry = save.classCollections.sword[cardId];
    entry.level = 2;
    entry.upgradeCopies = 0;
    save.classShards.sword.common = 1;
    save.universalShards.common = 1;
    save.wallet.gold = 1000;
    const upgraded = upgradePeakCard(save, cardId, monday);
    assert.equal(upgraded.ok, true, 'class and universal shards should combine for an upgrade');
    assert.equal(upgraded.cost.classShardsUsed, 1, 'matching class shards should be spent first');
    assert.equal(upgraded.cost.universalShardsUsed, 1, 'universal shards should cover the remainder');
    assert.equal(upgraded.state.classShards.sword.common, 0);
    assert.equal(upgraded.state.universalShards.common, 0);
}

{
    const created = createPeakCharacter(createPeakSave(monday), 'brawler', '通用碎片测试', monday);
    const save = created.state;
    const character = save.characters[save.activeCharacterId];
    const cardId = character.deck.cards.find((id) => PEAK_CARD_BY_ID[id]?.classId === 'brawler');
    save.classShards.sword.common = 5;
    save.wallet.gold = 1000;
    const wrongClass = upgradePeakCard(save, cardId, monday);
    assert.equal(wrongClass.ok, false, 'another profession shard must not upgrade this profession');
    save.universalShards.common = 1;
    const universal = upgradePeakCard(save, cardId, monday);
    assert.equal(universal.ok, true, 'a universal shard should upgrade any profession');
    assert.equal(universal.cost.universalShardsUsed, 1);
}

{
    let save = saveWithSword();
    save.characters[save.activeCharacterId].level = 15;
    for (let index = 0; index < PEAK_TRIAL_WEEKLY_LIMIT; index += 1) {
        const started = startPeakTrial(save, monday + index * 1000);
        assert.equal(started.ok, true, `trial run ${index + 1} should start`);
        assert.equal(started.state.peakTrialProgress.weeklyRunsStarted, index + 1);
        assert.equal(started.remainingRuns, PEAK_TRIAL_WEEKLY_LIMIT - index - 1);
        save = started.state;
        save.characters[save.activeCharacterId].peakTrial.phase = 'failed';
    }
    const fourth = startPeakTrial(save, monday + PEAK_TRIAL_WEEKLY_LIMIT * 1000);
    assert.equal(fourth.ok, false, 'a fourth trial run in one week must be rejected');
    assert.match(fourth.reason, /本周最多开启3轮/);

    const nextWeek = startPeakTrial(save, monday + week);
    assert.equal(nextWeek.ok, true, 'trial allowance should reset next week');
    assert.equal(nextWeek.state.peakTrialProgress.weeklyRunsStarted, 1);
}

{
    const save = saveWithSword();
    const firstStatus = getPeakMissionStatus(save, monday);
    const firstDaily = firstStatus.groups.find((group) => group.id === 'daily').missions;
    assert.equal(firstDaily.length, PEAK_DAILY_MISSION_COUNT, 'exactly four daily missions should rotate in');
    assert.equal(new Set(firstDaily.map((mission) => mission.event)).size, firstDaily.length, 'daily rotation should not repeat one event type');
    assert.ok(firstDaily.filter((mission) => mission.spending).length <= 1, 'daily rotation should contain at most one spending mission');

    const repeated = getPeakMissionStatus(save, monday + 60 * 60 * 1000)
        .groups.find((group) => group.id === 'daily').missions.map((mission) => mission.id);
    assert.deepEqual(repeated, firstDaily.map((mission) => mission.id), 'the rotation must remain stable throughout the day');

    const seen = new Set();
    for (let offset = 0; offset < 14; offset += 1) {
        getPeakMissionStatus(save, monday + offset * day).groups
            .find((group) => group.id === 'daily').missions
            .forEach((mission) => seen.add(mission.id));
    }
    assert.ok(seen.size > PEAK_DAILY_MISSION_COUNT, 'the larger pool should produce different missions across days');

    const activeIds = new Set(firstDaily.map((mission) => mission.id));
    const inactive = PEAK_MISSIONS.find((mission) => mission.group === 'daily' && !activeIds.has(mission.id));
    const inactiveClaim = claimPeakMission(firstStatus.state, inactive.id, monday);
    assert.equal(inactiveClaim.ok, false, 'an inactive rotated mission must not be claimable');
    assert.match(inactiveClaim.reason, /不在今日轮换中/);

    const trackedEvent = firstDaily.find((mission) => PEAK_MISSIONS.filter((entry) => entry.group === 'daily' && entry.event === mission.event).length > 1).event;
    const progressed = recordPeakMissionEvent(firstStatus.state, trackedEvent, 99, monday);
    const sameEventMissions = PEAK_MISSIONS.filter((mission) => mission.group === 'daily' && mission.event === trackedEvent);
    sameEventMissions.forEach((mission) => {
        const value = progressed.liveOps.missions.daily.progress[mission.id] || 0;
        assert.equal(value > 0, activeIds.has(mission.id), 'only the active variant should gain daily progress');
    });
}

{
    const baseIds = [...new Set(PEAK_DUNGEONS.map((dungeon) => dungeon.baseId))];
    assert.deepEqual(PEAK_DUNGEON_BASE_LEVELS, [1, 5, 10, 16, 23, 31, 39, 47]);
    assert.deepEqual(baseIds.map((baseId) => PEAK_DUNGEONS.find((dungeon) => dungeon.baseId === baseId && dungeon.difficultyId === 'normal').level), PEAK_DUNGEON_BASE_LEVELS);
    const finalDifficulties = PEAK_DUNGEONS.filter((dungeon) => dungeon.baseId === baseIds.at(-1)).map((dungeon) => dungeon.level);
    assert.deepEqual(finalDifficulties, [47, 48, 50], 'the final existing map should cover Lv.47 through Lv.50');
    assert.equal(Math.max(...PEAK_DUNGEONS.map((dungeon) => dungeon.level)), 50, 'existing maps should now reach Lv.50');
    baseIds.slice(0, 2).forEach((baseId, order) => {
        const hard = PEAK_DUNGEONS.find((dungeon) => dungeon.baseId === baseId && dungeon.difficultyId === 'hard');
        assert.equal(hard.earlyHardRewardMultiplier, PEAK_EARLY_HARD_REWARD_MULTIPLIER);
        assert.equal(hard.guaranteedGold, Math.round(10 * (order + 1) * 3 * PEAK_EARLY_HARD_REWARD_MULTIPLIER));
        const boostedXp = Math.round((90 + hard.level * 25) * hard.xpMultiplier);
        const oldXp = Math.round((90 + hard.level * 25) * hard.xpMultiplier / PEAK_EARLY_HARD_REWARD_MULTIPLIER);
        assert.ok(boostedXp / oldXp > 1.34 && boostedXp / oldXp < 1.36, 'early hard XP should rise by about 35%');
    });
    const laterHard = PEAK_DUNGEONS.find((dungeon) => dungeon.baseId === baseIds[2] && dungeon.difficultyId === 'hard');
    assert.equal(laterHard.earlyHardRewardMultiplier, 1, 'later chapters should keep their existing reward curve');
    assert.deepEqual(PEAK_LATE_ENEMY_SCALING, { startLevel: 34, maxLevel: 50, hpBonus: .08, attackBonus: .06, defenseBonus: .05 });
    const lateHardStages = PEAK_DUNGEONS.filter((dungeon) => dungeon.difficultyId === 'hard' && dungeon.level >= 34);
    assert.deepEqual(lateHardStages.map((dungeon) => dungeon.enemy.maxHp), [3337, 4039, 4785]);
    assert.deepEqual(lateHardStages.map((dungeon) => dungeon.enemy.combatAttack), [100, 120, 142]);
    assert.deepEqual(lateHardStages.map((dungeon) => dungeon.enemy.cardLevel), [7, 8, 10]);
    assert.ok(lateHardStages.every((dungeon, index) => !index || dungeon.enemy.maxHp / lateHardStages[index - 1].enemy.maxHp < 1.25), 'late enemy growth should remain smooth between chapters');
    assert.deepEqual(lateHardStages.at(-1).encounters.map((enemy) => enemy.cardLevel), [9, 9, 10], 'only the final Lv.50 boss should receive the Lv.10 card climax');
}

{
    assert.equal(PEAK_EQUIPMENT_DROP_BANDS.at(-1).maxLevel, 50, 'equipment drop bands should cover Lv.50');
    ['inferior', 'common', 'advanced', 'rare'].forEach((rarity) => {
        const pool = PEAK_EQUIPMENT_NAME_POOLS[rarity];
        ['sword', 'brawler', 'archer', 'knight', 'priest', 'mage', 'lancer'].forEach((classId) => {
            const names = pool.filter((entry) => entry.slot === 'weapon' && entry.classId === classId).map((entry) => entry.name);
            assert.ok(names.length >= 4, `${rarity} ${classId} should have at least four weapon names`);
            assert.equal(new Set(names).size, names.length, `${rarity} ${classId} weapon names should be unique`);
            assert.ok(names.every((name) => name !== `${rarity}武器` && name !== '武器'), 'low-rarity weapons should never use a fallback name');
        });
    });
    ['artifact', 'legendary', 'epic'].forEach((rarity) => {
        const pool = PEAK_EQUIPMENT_NAME_POOLS[rarity];
        const weaponClasses = new Set(pool.filter((entry) => entry.slot === 'weapon').map((entry) => entry.classId));
        assert.deepEqual([...weaponClasses].sort(), ['archer', 'brawler', 'knight', 'lancer', 'mage', 'priest', 'sword']);
        assert.ok(pool.some((entry) => entry.slot === 'headShoulder' && !entry.classId), `${rarity} armor should use the new universal names`);
        assert.ok(pool.some((entry) => entry.slot === 'earring' && !entry.classId), `${rarity} special equipment should use the new universal names`);
    });

    const finalHard = PEAK_DUNGEONS.at(-1);
    const sequenceRandom = (values) => () => values.shift() ?? .5;
    const lowLevelMaxRoll = generatePeakEquipment({ level: 1, rarityBoost: 0 }, 'sword', sequenceRandom([0, 0, .5, 0, 1, .5, .5]), monday, 10);
    const highLevelMinRoll = generatePeakEquipment({ level: 8, rarityBoost: 0 }, 'sword', sequenceRandom([0, 0, .5, 0, 0, .5, .5]), monday, 11);
    assert.equal(lowLevelMaxRoll.rarity, highLevelMinRoll.rarity);
    assert.equal(lowLevelMaxRoll.grade, highLevelMinRoll.grade);
    assert.equal(lowLevelMaxRoll.slot, highLevelMinRoll.slot);
    assert.ok(highLevelMinRoll.stats.physicalAttack > lowLevelMaxRoll.stats.physicalAttack, 'a higher-level item minimum roll should exceed the lower-level range for the same rarity, slot and grade');
    const highLevelMaxRoll = generatePeakEquipment({ level: 8, rarityBoost: 0 }, 'sword', sequenceRandom([0, 0, .5, 0, 1, .5, .5]), monday, 12);
    assert.ok(highLevelMaxRoll.stats.physicalAttack > highLevelMinRoll.stats.physicalAttack, 'each affix value should roll independently inside its level-scaled range');

    const mageWeapon = generatePeakEquipment(finalHard, 'mage', sequenceRandom([.999999, .5, .5, 0, .5, .5]), monday, 1);
    assert.equal(mageWeapon.level, 50);
    assert.equal(mageWeapon.rarity, 'epic');
    assert.equal(mageWeapon.slot, 'weapon');
    assert.equal(mageWeapon.classId, 'mage');
    assert.ok(mageWeapon.stats.magicalAttack > 0 && !mageWeapon.stats.physicalAttack, 'mage weapons should always remain magical-class equipment');
    assert.ok(PEAK_EQUIPMENT_NAME_POOLS.epic.some((entry) => entry.name === mageWeapon.name && entry.classId === 'mage'));
    const alternateMageWeapon = generatePeakEquipment(finalHard, 'mage', sequenceRandom([.999999, .5, .5, 0, 0, 0, 0, .5, .5]), monday, 3);
    assert.ok(alternateMageWeapon.stats.magicalAttack > 0 && !alternateMageWeapon.stats.physicalAttack, 'all randomized weapon affixes should remain relevant to the bound profession');
    assert.notDeepEqual(Object.keys(alternateMageWeapon.stats), Object.keys(mageWeapon.stats), 'secondary affixes should vary between otherwise matching drops');

    const mageRing = generatePeakEquipment(finalHard, 'mage', sequenceRandom([.999999, .5, .5, .7, 0, 0, 0, 0, .5, .5]), monday, 4);
    assert.equal(mageRing.slot, 'ring');
    assert.ok(mageRing.stats.physicalAttack > 0 && mageRing.stats.magicalAttack > 0, 'generic offensive slots should roll from the same mixed pool for every class');

    const universalArmor = generatePeakEquipment(finalHard, 'mage', sequenceRandom([.999999, .5, .5, .1, .5, .5]), monday, 2);
    assert.notEqual(universalArmor.slot, 'weapon');
    assert.equal(universalArmor.classId, null, 'non-weapon drops should remain universal');

    const save = saveWithSword();
    const character = save.characters[save.activeCharacterId];
    character.level = 50;
    character.inventory.push(mageWeapon, universalArmor);
    const wrongWeapon = equipPeakItem(save, character.id, mageWeapon.id, monday);
    assert.equal(wrongWeapon.ok, false, 'another base profession must not equip this weapon');
    assert.match(wrongWeapon.reason, /仅限魔法师使用/);
    const sharedArmor = equipPeakItem(save, character.id, universalArmor.id, monday);
    assert.equal(sharedArmor.ok, true, 'non-weapon equipment should be wearable across base professions');
}

{
    const save = saveWithSword();
    const character = save.characters[save.activeCharacterId];
    character.level = 30;
    character.xp = 0;
    character.overflowXp = 999999;
    const normalized = normalizePeakSave(save, monday);
    const capped = normalized.characters[normalized.activeCharacterId];
    assert.equal(capped.overflowXp, getPeakLevelXpRequirement(30), 'legacy overflow XP should be capped to one level');
    const path = Object.values(PEAK_ADVANCEMENTS).find((entry) => entry.baseClassId === 'sword');
    const advanced = advancePeakCharacter(normalized, capped.id, path.id, monday);
    assert.equal(advanced.ok, true);
    assert.equal(advanced.character.level, 31, 'first advancement may settle at most one stored level');
    assert.equal(advanced.character.overflowXp, 0);
    assert.equal(advanced.character.xp, 0);

    advanced.character.level = 50;
    advanced.character.xp = 0;
    advanced.character.overflowXp = 999999;
    const secondNormalized = normalizePeakSave(advanced.state, monday);
    const secondCharacter = secondNormalized.characters[secondNormalized.activeCharacterId];
    assert.equal(secondCharacter.overflowXp, getPeakLevelXpRequirement(50));
    const secondAdvanced = advancePeakCharacter(secondNormalized, secondCharacter.id, '', monday);
    assert.equal(secondAdvanced.ok, true);
    assert.equal(secondAdvanced.character.level, 51, 'second advancement may settle at most one stored level');
}

{
    const legacy = saveWithSword();
    legacy.version = 17;
    legacy.universalShards.rare = 7;
    delete legacy.classShards;
    delete legacy.peakTrialProgress.weeklyRunsStarted;
    delete legacy.liveOps.missions.daily.activeIds;
    const migrated = normalizePeakSave(legacy, monday);
    assert.equal(migrated.version, 18);
    assert.equal(migrated.universalShards.rare, 7, 'legacy shards should remain universal');
    assert.equal(migrated.classShards.sword.rare, 0, 'new class shard banks should start empty');
    assert.equal(migrated.peakTrialProgress.weeklyRunsStarted, 0);
    const daily = getPeakMissionStatus(migrated, monday).groups.find((group) => group.id === 'daily').missions;
    assert.equal(daily.length, PEAK_DAILY_MISSION_COUNT, 'V17 saves should receive a valid daily rotation');
}

console.log('peak duel economy: passed');
