import assert from 'node:assert/strict';

import { PEAK_CARD_BY_ID, PEAK_SHARED_STARTERS, PEAK_STARTER_DECKS } from '../js/peak-duel-data.js';
import { PEAK_SAVE_VERSION, createPeakCharacter, createPeakSave, normalizePeakSave, validatePeakDeck } from '../js/peak-duel-storage.js';

const targetClasses = ['sword', 'brawler', 'archer', 'knight', 'priest', 'mage', 'lancer'];
const expectedCategoryCounts = { attack: 6, defense: 3, skill: 4, buff: 4, special: 1 };
const legacyDecksV15 = {
    priest: [
        'priest_general_common_attack_1', 'priest_general_common_attack_1',
        'priest_general_common_attack_2', 'priest_general_common_attack_2',
        'breaking_wheel_kick', 'priest_general_common_attack_3',
        'priest_general_common_defense_1', 'priest_general_common_defense_1',
        'priest_general_common_defense_2',
        'priest_general_common_skill_1', 'priest_general_common_skill_1',
        'priest_general_common_skill_2', 'priest_general_common_skill_3',
        'priest_general_common_buff_1', 'priest_general_common_buff_1',
        'priest_general_common_buff_2', 'focus',
        'priest_general_common_special_1',
    ],
    mage: [
        'mage_general_common_attack_1', 'mage_general_common_attack_1',
        'mage_general_common_attack_2', 'mage_general_common_attack_2',
        'breaking_wheel_kick', 'mage_general_common_attack_3',
        'mage_general_common_defense_1', 'mage_general_common_defense_1',
        'mage_general_common_defense_2',
        'mage_general_common_skill_1', 'mage_general_common_skill_1',
        'mage_general_common_skill_2', 'mage_general_common_skill_3',
        'mage_general_common_buff_1', 'mage_general_common_buff_1',
        'mage_general_common_buff_2', 'focus',
        'mage_general_common_special_1',
    ],
};
const legacyDecksV14 = {
    sword: [...PEAK_SHARED_STARTERS, 'rising_cut', 'rising_cut', 'frost_edge', 'mountain_launcher', 'moon_air_combo', 'frost_guard'],
    brawler: [...PEAK_SHARED_STARTERS, 'brawler_uppercut', 'brawler_uppercut', 'flame_jab', 'dragon_kick', 'thunder_combo', 'body_armor'],
    archer: [...PEAK_SHARED_STARTERS, 'archer_quick_shot', 'archer_quick_shot', 'archer_rising_arrow', 'archer_rising_arrow', 'archer_hunter_guard', 'archer_steady_aim'],
    knight: [...PEAK_SHARED_STARTERS, 'knight_general_common_attack_1', 'knight_general_common_attack_1', 'knight_general_common_attack_2', 'knight_general_common_attack_2', 'knight_general_common_defense_1', 'knight_general_common_buff_1'],
    priest: [
        'priest_general_common_attack_1', 'priest_general_common_attack_1',
        'priest_general_common_attack_2', 'priest_general_common_attack_2',
        'priest_general_common_defense_1', 'priest_general_common_defense_1',
        'priest_general_common_defense_2', 'priest_general_common_defense_2',
        'priest_general_common_defense_3',
        'priest_general_common_skill_1', 'priest_general_common_skill_1',
        'priest_general_common_skill_2', 'priest_general_common_skill_2',
        'priest_general_common_skill_3', 'priest_general_common_skill_3',
        'priest_general_common_buff_1', 'priest_general_common_buff_2',
        'priest_general_common_special_1',
    ],
    mage: [
        'mage_general_common_attack_1', 'mage_general_common_attack_1',
        'mage_general_common_attack_2', 'mage_general_common_attack_2',
        'mage_general_common_defense_1', 'mage_general_common_defense_1',
        'mage_general_common_defense_2', 'mage_general_common_defense_2',
        'mage_general_common_defense_3', 'iron_will',
        'mage_general_common_skill_1', 'mage_general_common_skill_1',
        'mage_general_common_skill_2', 'mage_general_common_skill_2',
        'mage_general_common_skill_3',
        'mage_general_common_buff_1', 'mage_general_common_buff_2',
        'mage_general_common_special_1',
    ],
    lancer: [
        'lancer_general_common_attack_1', 'lancer_general_common_attack_1',
        'lancer_general_common_attack_2', 'lancer_general_common_attack_2',
        'lancer_general_common_attack_3', 'lancer_general_common_attack_3',
        'lancer_general_common_defense_1', 'lancer_general_common_defense_1',
        'lancer_general_common_defense_2', 'lancer_general_common_defense_3',
        'lancer_general_common_skill_1', 'lancer_general_common_skill_1',
        'lancer_general_common_skill_2',
        'lancer_general_common_skill_3', 'lancer_general_common_skill_3',
        'lancer_general_common_buff_1',
        'lancer_general_common_buff_2', 'lancer_general_common_special_1',
    ],
};
const legacyDecksV13 = {
    priest: [...PEAK_SHARED_STARTERS, 'priest_general_common_attack_1', 'priest_general_common_attack_1', 'priest_general_common_attack_2', 'priest_general_common_attack_2', 'priest_general_common_defense_1', 'priest_general_common_buff_1'],
    mage: [...PEAK_SHARED_STARTERS, 'mage_general_common_attack_1', 'mage_general_common_attack_1', 'mage_general_common_attack_2', 'mage_general_common_attack_2', 'mage_general_common_defense_1', 'mage_general_common_buff_1'],
    lancer: [
        'lancer_general_common_attack_1', 'lancer_general_common_attack_1',
        'lancer_general_common_attack_2', 'lancer_general_common_attack_2',
        'lancer_general_common_attack_3', 'lancer_general_common_attack_3',
        'lancer_general_common_defense_1', 'lancer_general_common_defense_1',
        'lancer_general_common_defense_2', 'lancer_general_common_defense_2',
        'lancer_general_common_skill_1', 'lancer_general_common_skill_1',
        'lancer_general_common_skill_2', 'lancer_general_common_skill_2',
        'lancer_general_common_buff_1', 'lancer_general_common_buff_1',
        'lancer_general_common_buff_2', 'lancer_general_common_special_1',
    ],
};

const cardCounts = (deck) => deck.reduce((counts, id) => {
    counts[id] = (counts[id] || 0) + 1;
    return counts;
}, {});

const reachableCombatStates = (deck) => {
    const reachable = new Set(['standing']);
    let changed = true;
    while (changed) {
        changed = false;
        deck.forEach((id) => {
            const transition = PEAK_CARD_BY_ID[id]?.attackState;
            if (!transition?.to || !transition.from?.some((state) => reachable.has(state)) || reachable.has(transition.to)) return;
            reachable.add(transition.to);
            changed = true;
        });
    }
    return reachable;
};

const saveWithCharacter = (classId, now = 1000) => {
    const result = createPeakCharacter(createPeakSave(now), classId, `${classId}测试`, now);
    return { save: result.state, character: result.state.characters[result.state.activeCharacterId] };
};

assert.equal(PEAK_SAVE_VERSION, 18, 'class shard migration requires save version 18');

for (const classId of targetClasses) {
    const deck = PEAK_STARTER_DECKS[classId];
    const cards = deck.map((id) => PEAK_CARD_BY_ID[id]);
    assert.equal(deck.length, 18, `${classId} starter deck should contain 18 cards`);
    assert.ok(cards.every(Boolean), `${classId} starter deck contains an unknown card`);
    assert.ok(cards.every((card) => card.rarity === 'common'), `${classId} starter deck should not grant non-common cards`);
    assert.ok(cards.every((card) => card.classId === classId || card.classId === 'all'), `${classId} starter deck contains another class card`);
    assert.ok(Object.values(cardCounts(deck)).every((copies) => copies <= 2), `${classId} starter deck contains more than two copies of one card`);

    const categoryCounts = cards.reduce((counts, card) => {
        counts[card.category] = (counts[card.category] || 0) + 1;
        return counts;
    }, {});
    assert.deepEqual(categoryCounts, expectedCategoryCounts, `${classId} starter deck should have a balanced category spread`);
    assert.ok(cards.some((card) => card.effects?.some((effect) => effect.type === 'restoreMp')), `${classId} starter deck needs an MP recovery card`);
    assert.ok(cards.filter((card) => card.classId === classId).length >= 13, `${classId} starter deck should preserve class identity`);
    assert.deepEqual([...reachableCombatStates(deck)].sort(), ['airborne', 'knockedDown', 'launched', 'standing'], `${classId} starter deck should teach a full combo route`);

    const { save, character } = saveWithCharacter(classId);
    const collection = { ...save.collection, ...save.classCollections[classId] };
    assert.equal(validatePeakDeck(character.deck.cards, classId, collection, character.advancement).valid, true, `${classId} starter deck should be valid`);

    save.version = 14;
    character.deck.cards = [...legacyDecksV14[classId]];
    character.deck.presets[0].cards = [...legacyDecksV14[classId]];
    const migrated = normalizePeakSave(save, 2000).characters[character.id];
    assert.deepEqual(migrated.deck.cards, deck, `${classId} active V14 starter deck should migrate`);
    assert.deepEqual(migrated.deck.presets[0].cards, deck, `${classId} V14 starter preset should migrate`);

    const customizedSource = saveWithCharacter(classId).save;
    const customizedCharacter = customizedSource.characters[customizedSource.activeCharacterId];
    const reversed = [...legacyDecksV14[classId]].reverse();
    customizedSource.version = 14;
    customizedCharacter.deck.cards = [...reversed];
    customizedCharacter.deck.presets[0].cards = [...reversed];
    const customized = normalizePeakSave(customizedSource, 2000).characters[customizedCharacter.id];
    assert.deepEqual(customized.deck.cards, reversed, `${classId} customized deck must not be overwritten`);
    assert.deepEqual(customized.deck.presets[0].cards, reversed, `${classId} customized preset must not be overwritten`);
}

for (const [classId, legacyDeck] of Object.entries(legacyDecksV13)) {
    const { save, character } = saveWithCharacter(classId);
    save.version = 13;
    character.deck.cards = [...legacyDeck];
    character.deck.presets[0].cards = [...legacyDeck];
    const migrated = normalizePeakSave(save, 2000).characters[character.id];
    assert.deepEqual(migrated.deck.cards, PEAK_STARTER_DECKS[classId], `${classId} V13 starter deck should migrate directly to V16`);
    assert.deepEqual(migrated.deck.presets[0].cards, PEAK_STARTER_DECKS[classId], `${classId} V13 starter preset should migrate directly to V16`);
}

for (const [classId, legacyDeck] of Object.entries(legacyDecksV15)) {
    const { save, character } = saveWithCharacter(classId);
    save.version = 15;
    character.deck.cards = [...legacyDeck];
    character.deck.presets[0].cards = [...legacyDeck];
    const migrated = normalizePeakSave(save, 2000).characters[character.id];
    assert.deepEqual(migrated.deck.cards, PEAK_STARTER_DECKS[classId], `${classId} active V15 starter deck should migrate to V16`);
    assert.deepEqual(migrated.deck.presets[0].cards, PEAK_STARTER_DECKS[classId], `${classId} V15 starter preset should migrate to V16`);
}

console.log('peak duel starter decks: passed');
