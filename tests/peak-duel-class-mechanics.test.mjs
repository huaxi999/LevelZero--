import assert from 'node:assert/strict';

import { PEAK_ADVANCEMENTS, PEAK_CARD_BY_ID } from '../js/peak-duel-data.js';
import { createPeakBattle, queuePeakCard, resolvePeakRound, selectPeakTacticalDeclaration } from '../js/peak-duel-engine.js';
import { createPeakCharacter, createPeakSave, normalizePeakSave } from '../js/peak-duel-storage.js';

const NEW_TYPES = ['spellCharge', 'spellChargeSpend', 'timedFuse', 'vowGain', 'vowSpend', 'bleedAmplify', 'scheduleBlessing', 'comboEscalate',
    'vowShield', 'bleedHarvest', 'arcaneCascade', 'blessingHasten'];
const MECHANIC_OWNERS = {
    spellCharge: ['mage'],
    spellChargeSpend: ['mage'],
    timedFuse: ['mage', 'archer'],
    vowGain: ['knight'],
    vowSpend: ['knight'],
    bleedAmplify: ['lancer'],
    scheduleBlessing: ['priest'],
    comboEscalate: ['all'],
    vowShield: ['knight'],
    bleedHarvest: ['lancer'],
    arcaneCascade: ['mage'],
    blessingHasten: ['priest'],
};
const ROUTE_MECHANICS = ['vowShield', 'bleedHarvest', 'arcaneCascade', 'blessingHasten'];
const allCards = Object.values(PEAK_CARD_BY_ID);
const carries = (card, type) => card.effects.some((effect) => effect.type === type);

for (const rarity of ['common', 'excellent']) {
    const leaked = allCards.filter((card) => card.rarity === rarity && NEW_TYPES.some((type) => carries(card, type)));
    assert.deepEqual(leaked.map((card) => card.id), [], `${rarity} 不应出现中高稀有度机制`);
}

const chargeCards = allCards.filter((card) => carries(card, 'spellCharge'));
const spendCards = allCards.filter((card) => carries(card, 'spellChargeSpend'));
const fuseCards = allCards.filter((card) => carries(card, 'timedFuse'));
assert.ok(chargeCards.length > 0, '没有任何卡提供法力充能');
assert.ok(spendCards.length > 0, '没有任何卡消费法力充能');
assert.ok(fuseCards.length > 0, '没有任何卡埋设延迟引信');
for (const card of [...chargeCards, ...spendCards]) {
    assert.equal(card.classId, 'mage', `${card.id} 不是法师卡，充能机制越界`);
}
for (const card of fuseCards) {
    assert.ok(['mage', 'archer'].includes(card.classId), `${card.id} 不该携带延迟引信`);
}
for (const card of [...chargeCards, ...spendCards, ...fuseCards]) {
    assert.ok(['rare', 'scarce', 'legendary', 'epic'].includes(card.rarity), `${card.id} 稀有度过低`);
}
assert.ok(fuseCards.some((card) => card.classId === 'archer'), '弓箭手没有拿到延迟引信');
assert.ok(fuseCards.some((card) => card.classId === 'mage'), '法师没有拿到延迟引信');

for (const card of chargeCards) {
    const effect = card.effects.find((entry) => entry.type === 'spellCharge');
    assert.ok(effect.value >= 1 && effect.value <= 4, `${card.id} 充能获得量越界: ${effect.value}`);
    assert.ok(effect.max >= 3 && effect.max <= 6, `${card.id} 充能上限越界: ${effect.max}`);
    assert.ok(effect.value <= effect.max, `${card.id} 单次充能超过上限`);
}
for (const card of spendCards) {
    const effect = card.effects.find((entry) => entry.type === 'spellChargeSpend');
    assert.ok(effect.perCharge >= 1 && effect.perCharge <= 26, `${card.id} 每层增伤越界: ${effect.perCharge}`);
}
for (const card of fuseCards) {
    const effect = card.effects.find((entry) => entry.type === 'timedFuse');
    assert.ok(effect.turns >= 1 && effect.turns <= 3, `${card.id} 引信回合数越界: ${effect.turns}`);
    assert.ok(effect.base > 0, `${card.id} 引信伤害为零`);
}

for (const [type, owners] of Object.entries(MECHANIC_OWNERS)) {
    const cards = allCards.filter((card) => carries(card, type));
    assert.ok(cards.length > 0, `没有任何卡携带 ${type}`);
    for (const card of cards) {
        assert.ok(owners.includes(card.classId), `${card.id} 携带了不属于本职业的 ${type}`);
        assert.ok(['rare', 'scarce', 'legendary', 'epic'].includes(card.rarity), `${card.id} 的 ${type} 稀有度过低`);
    }
}

const vowGainCards = allCards.filter((card) => carries(card, 'vowGain'));
const vowSpendCards = allCards.filter((card) => carries(card, 'vowSpend'));
for (const card of vowGainCards) {
    const effect = card.effects.find((entry) => entry.type === 'vowGain');
    assert.ok(effect.value >= 1 && effect.value <= 3, `${card.id} 誓约获得量越界: ${effect.value}`);
    assert.ok(effect.maxStacks >= 1 && effect.maxStacks <= 20, `${card.id} 誓约上限越界: ${effect.maxStacks}`);
}
for (const card of vowSpendCards) {
    const effect = card.effects.find((entry) => entry.type === 'vowSpend');
    assert.ok(effect.perStack >= 1 && effect.perStack <= 30, `${card.id} 誓约每层增伤越界: ${effect.perStack}`);
}
assert.ok(vowGainCards.length > 0 && vowSpendCards.length > 0, '誓约缺少积攒或兑现的一端');

for (const card of allCards.filter((entry) => carries(entry, 'bleedAmplify'))) {
    const effect = card.effects.find((entry) => entry.type === 'bleedAmplify');
    assert.ok(effect.perStack >= 1 && effect.perStack <= 20, `${card.id} 流血追击每层增伤越界: ${effect.perStack}`);
    assert.ok(effect.maxStacks >= 1 && effect.maxStacks <= 9, `${card.id} 流血追击计数上限越界: ${effect.maxStacks}`);
}
assert.ok(allCards.some((card) => card.classId === 'lancer' && card.effects.some((effect) => effect.type === 'status' && effect.status === 'bleed')),
    '魔枪士没有任何施加流血的牌，流血追击无从触发');

const blessingCards = allCards.filter((card) => carries(card, 'scheduleBlessing'));
for (const card of blessingCards) {
    for (const effect of card.effects.filter((entry) => entry.type === 'scheduleBlessing')) {
        assert.ok(['heal', 'shield', 'cleanse'].includes(effect.blessingType), `${card.id} 祝福类型非法: ${effect.blessingType}`);
        assert.ok(effect.turns >= 1 && effect.turns <= 3, `${card.id} 祝福延迟回合越界: ${effect.turns}`);
        assert.ok(effect.value >= 1, `${card.id} 祝福兑现值为零`);
    }
}
const comboCards = allCards.filter((card) => carries(card, 'comboEscalate'));
assert.ok(comboCards.length > 0, '没有任何卡携带连段增伤');
for (const card of comboCards) {
    const effect = card.effects.find((entry) => entry.type === 'comboEscalate');
    assert.ok(effect.perCard >= 1 && effect.perCard <= 20, `${card.id} 连段每段增伤越界: ${effect.perCard}`);
    assert.ok(effect.maxCards >= 1 && effect.maxCards <= 6, `${card.id} 连段计数上限越界: ${effect.maxCards}`);
    assert.equal(card.category, 'attack', `${card.id} 不是进攻牌，连段增伤挂在这里结算不到`);
    assert.ok(card.id.startsWith('universal_five_'), `${card.id} 不属于通用五连段，连段增伤投放越界`);
}
for (const blessingType of ['heal', 'shield', 'cleanse']) {
    assert.ok(blessingCards.some((card) => card.effects.some((effect) => effect.type === 'scheduleBlessing' && effect.blessingType === blessingType)),
        `没有任何卡投放 ${blessingType} 型祝福`);
}

for (const type of ROUTE_MECHANICS) {
    for (const card of allCards.filter((entry) => carries(entry, type))) {
        assert.ok(card.requiredAdvancement?.pathId, `${card.id} 带路线机制却没有转职门槛`);
        assert.ok([1, 2].includes(Number(card.requiredAdvancement.minTier)), `${card.id} 的转职层级非法: ${card.requiredAdvancement.minTier}`);
        assert.equal(card.effects.filter((effect) => effect.type === type).length, 1, `${card.id} 重复携带 ${type}`);
    }
}
for (const card of allCards.filter((entry) => carries(entry, 'vowShield'))) {
    const effect = card.effects.find((entry) => entry.type === 'vowShield');
    assert.ok(effect.shieldPerStack >= 1 && effect.shieldPerStack <= 14, `${card.id} 誓约换盾每层护盾越界: ${effect.shieldPerStack}`);
    assert.ok(effect.maxStacks >= 1 && effect.maxStacks <= 5, `${card.id} 誓约换盾计数上限越界: ${effect.maxStacks}`);
}
for (const card of allCards.filter((entry) => carries(entry, 'bleedHarvest'))) {
    const effect = card.effects.find((entry) => entry.type === 'bleedHarvest');
    assert.ok(effect.damagePerStack >= 1 && effect.damagePerStack <= 15, `${card.id} 流血收割每层伤害越界: ${effect.damagePerStack}`);
    assert.ok(effect.maxStacks >= 1 && effect.maxStacks <= 9, `${card.id} 流血收割计数上限越界: ${effect.maxStacks}`);
}
for (const card of allCards.filter((entry) => carries(entry, 'arcaneCascade'))) {
    const effect = card.effects.find((entry) => entry.type === 'arcaneCascade');
    assert.ok(effect.damagePerCharge >= 1 && effect.damagePerCharge <= 16, `${card.id} 充能级联每层伤害越界: ${effect.damagePerCharge}`);
    assert.ok(effect.maxCharges >= 1 && effect.maxCharges <= 6, `${card.id} 充能级联计数上限越界: ${effect.maxCharges}`);
}
for (const card of allCards.filter((entry) => carries(entry, 'blessingHasten'))) {
    const effect = card.effects.find((entry) => entry.type === 'blessingHasten');
    assert.ok(effect.turns >= 1 && effect.turns <= 3, `${card.id} 祝福催熟回合数越界: ${effect.turns}`);
    assert.ok(effect.bonusPercent >= 1 && effect.bonusPercent <= 25, `${card.id} 祝福催熟加成越界: ${effect.bonusPercent}`);
}

const routeCards = allCards.filter((card) => card.classRouteMasteryExpansion);
assert.equal(routeCards.length, 560, `转职专属卡总数不符: ${routeCards.length}`);
for (const [classId, expected] of Object.entries({ knight: 140, lancer: 140, mage: 140, priest: 140 })) {
    const owned = routeCards.filter((card) => card.classId === classId);
    assert.equal(owned.length, expected, `${classId} 转职专属卡数量不符: ${owned.length}`);
    for (const rarity of ['common', 'excellent', 'rare', 'scarce', 'legendary', 'epic']) {
        assert.ok(owned.some((card) => card.rarity === rarity), `${classId} 缺少 ${rarity} 转职卡`);
    }
    for (const category of ['attack', 'defense', 'skill', 'buff']) {
        assert.ok(owned.some((card) => card.category === category), `${classId} 缺少 ${category} 转职卡`);
    }
    for (const tier of [1, 2]) {
        assert.ok(owned.some((card) => Number(card.requiredAdvancement?.minTier) === tier), `${classId} 缺少 ${tier} 转职卡`);
    }
    assert.deepEqual(owned.filter((card) => card.category === 'special').map((card) => card.id), [], `${classId} 出现了 special 转职卡`);
    assert.deepEqual(owned.filter((card) => card.promotedFromAttack).map((card) => card.id), [], `${classId} 有进攻牌被改判成技能牌`);
}
for (const pathId of ['holy_guardian', 'judgment_crusader', 'dragon_lancer', 'fortress_lancer',
    'elemental_sorceress', 'void_warlock', 'grace_cleric', 'revelation_priest']) {
    assert.equal(routeCards.filter((card) => card.requiredAdvancement.pathId === pathId).length, 70, `${pathId} 卡数不符`);
}

for (const advancement of Object.values(PEAK_ADVANCEMENTS)) {
    for (const [field, tier] of [['firstGrantCards', 1], ['secondGrantCards', 2]]) {
        for (const cardId of advancement[field] || []) {
            const card = PEAK_CARD_BY_ID[cardId];
            assert.ok(card, `${advancement.id}.${field} 指向不存在的卡: ${cardId}`);
            assert.equal(card.classId, advancement.baseClassId, `${cardId} 不是 ${advancement.baseClassId} 的卡`);
            if (!card.requiredAdvancement) continue;
            assert.equal(card.requiredAdvancement.pathId, advancement.id, `${cardId} 属于其它路线`);
            assert.ok(Number(card.requiredAdvancement.minTier) <= tier, `${cardId} 的层级高于 ${field} 能解锁的层级`);
        }
    }
}
for (const pathId of ['holy_guardian', 'judgment_crusader', 'dragon_lancer', 'fortress_lancer',
    'elemental_sorceress', 'void_warlock', 'grace_cleric', 'revelation_priest']) {
    const advancement = PEAK_ADVANCEMENTS[pathId];
    assert.ok(advancement, `路线不存在: ${pathId}`);
    assert.equal(advancement.firstGrantCards.length, 6, `${pathId} 一转赠卡数不符: ${advancement.firstGrantCards.length}`);
    assert.equal(advancement.secondGrantCards.length, 5, `${pathId} 二转赠卡数不符: ${advancement.secondGrantCards.length}`);
    const all = [...advancement.firstGrantCards, ...advancement.secondGrantCards];
    assert.equal(new Set(all).size, all.length, `${pathId} 赠卡里有重复 id`);
    for (const cardId of advancement.firstGrantCards) {
        assert.equal(Number(PEAK_CARD_BY_ID[cardId].requiredAdvancement?.minTier || 1), 1, `${cardId} 不该出现在一转赠卡里`);
    }
    for (const category of ['attack', 'defense', 'skill', 'buff']) {
        assert.ok(all.some((cardId) => PEAK_CARD_BY_ID[cardId].category === category), `${pathId} 赠卡缺少 ${category}`);
    }
}
for (const [classId, expected] of Object.entries({ mage: 'magical', priest: 'magical', knight: 'physical', lancer: 'physical' })) {
    const damaging = allCards.filter((card) => card.classId === classId && ['attack', 'skill'].includes(card.category));
    assert.ok(damaging.length >= 100, `${classId} 的进攻/技能牌太少，断言可能没覆盖到: ${damaging.length}`);
    for (const card of damaging) {
        for (const effect of card.effects.filter((entry) => entry.type === 'damage')) {
            if (effect.damageType === 'true') continue;
            assert.equal(effect.damageType, expected, `${card.id} 的 damageType 与职业属性不符: ${effect.damageType}`);
        }
    }
}

const signature = (card) => card.effects.map((effect) => effect.type).join('+');
const scalingKeys = (card) => {
    const numeric = card.effects.find((effect) => ['damage', 'shield', 'heal'].includes(effect.type));
    return Object.keys(numeric?.scaling || {}).sort().join(',');
};

const GENERAL_ID = /^(knight|lancer|priest|archer|mage)_general_/;
const slots = new Map();
for (const card of allCards) {
    if (!GENERAL_ID.test(card.id)) continue;
    const key = `${card.classId}|${card.category}|${(card.id.match(/(\d+)$/) || [, '0'])[1]}`;
    if (!slots.has(key)) slots.set(key, []);
    slots.get(key).push(card);
}

assert.equal(slots.size, 70, `通用卡槽位总数不符: ${slots.size}`);

let differentiatedSlots = 0;
let sparseSlots = 0;
for (const [key, cards] of slots) {
    if (cards.length < 3) { sparseSlots += 1; continue; }
    const shapes = new Set(cards.map((card) => `${signature(card)}#${scalingKeys(card)}`));
    assert.ok(shapes.size > 1, `${key} 跨稀有度仍然只有一种结构，区分度未落地`);
    differentiatedSlots += 1;
}
assert.equal(sparseSlots, 4, `样本不足的稀疏槽位数量变了: ${sparseSlots}`);
assert.equal(differentiatedSlots, 66, `参与区分度校验的槽位数不符: ${differentiatedSlots}`);

const numericBulk = (card) => card.effects.reduce((total, effect) => {
    if (effect.type === 'scheduleBlessing') return total + (effect.blessingType === 'cleanse' ? 0 : Number(effect.value) || 0);
    if (!['damage', 'shield', 'heal', 'timedFuse'].includes(effect.type)) return total;
    const scaling = Object.values(effect.scaling || {}).reduce((sum, value) => sum + value, 0);
    return total + (Number(effect.base) || 0) + scaling * 10;
}, 0);
const RARITY_ORDER = ['common', 'excellent', 'rare', 'scarce', 'legendary', 'epic'];
let checkedCurves = 0;
for (const [key, cards] of slots) {
    const ordered = [...cards].sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));
    const curve = ordered.map(numericBulk);
    if (curve.every((value) => value === 0)) continue;
    const start = curve.findIndex((value) => value > 0);
    checkedCurves += 1;
    for (let i = start + 1; i < curve.length; i += 1) {
        assert.ok(curve[i] > curve[i - 1],
            `${key} 在 ${ordered[i - 1].rarity} → ${ordered[i].rarity} 数值没有增长: ${curve.join(' -> ')}`);
    }
}
assert.ok(checkedCurves >= 40, `参与数值单调性校验的槽位太少: ${checkedCurves}`);

const SEED = 20260811;
const dummyEnemy = () => ({
    name: '木桩',
    maxHp: 999999,
    maxMp: 60,
    deck: [],
    cardLevel: 1,
    stats: {
        physicalAttack: 0, magicalAttack: 0, physicalDefense: 0, magicalDefense: 0,
        vitality: 10, spirit: 10, damageIncrease: 0, skillAttack: 0, criticalDamage: 0,
        damageReduction: 0, physicalCrit: 0, magicalCrit: 0, allElement: 0, elementalResistance: 0,
    },
});
const magePlayer = () => ({
    name: '测试法师',
    classId: 'mage',
    maxHp: 99999,
    maxMp: 999,
    drawPerTurn: 2,
    cardLevels: {},
    stats: {
        magicalAttack: 60, intelligence: 50, independentAttack: 40, physicalAttack: 10,
        vitality: 30, spirit: 30, physicalDefense: 10, magicalDefense: 10,
        damageIncrease: 0, skillAttack: 0, criticalDamage: 0, damageReduction: 0,
        physicalCrit: 0, magicalCrit: 0, allElement: 0, elementalResistance: 0,
    },
});
const buildBattle = (cardId) => {
    const battle = createPeakBattle({
        deck: Array.from({ length: 16 }, () => cardId),
        player: magePlayer(),
        enemy: dummyEnemy(),
        dungeonId: 'test',
        seed: SEED,
    });
    const declared = selectPeakTacticalDeclaration(battle, 'measured_sequence');
    assert.equal(declared.ok, true, `战术宣言失败: ${declared.reason || ''}`);
    return declared.state;
};
const playOneCard = (battle, cardId) => {
    const handIndex = battle.hand.findIndex((entry) => entry.cardId === cardId);
    assert.notEqual(handIndex, -1, `手牌里没有摸到 ${cardId}`);
    const queued = queuePeakCard(battle, handIndex);
    assert.equal(queued.ok, true, `无法打出 ${cardId}: ${queued.reason || ''}`);
    const resolved = resolvePeakRound(queued.state);
    assert.equal(resolved.ok, true, `回合结算失败: ${resolved.reason || ''}`);
    return resolved;
};

const CHARGE_CARD = 'mage_general_epic_skill_1';
const SPEND_CARD = 'mage_general_epic_skill_3';
const FUSE_CARD = 'mage_general_epic_special_1';
for (const id of [CHARGE_CARD, SPEND_CARD, FUSE_CARD]) assert.ok(PEAK_CARD_BY_ID[id], `测试用卡不存在: ${id}`);
const chargeEffect = PEAK_CARD_BY_ID[CHARGE_CARD].effects.find((effect) => effect.type === 'spellCharge');
const spendEffect = PEAK_CARD_BY_ID[SPEND_CARD].effects.find((effect) => effect.type === 'spellChargeSpend');
const fuseEffect = PEAK_CARD_BY_ID[FUSE_CARD].effects.find((effect) => effect.type === 'timedFuse');
assert.ok(chargeEffect && spendEffect && fuseEffect, '史诗法师卡未按预期携带新机制');

let chargeBattle = buildBattle(CHARGE_CARD);
assert.deepEqual(chargeBattle.player.spellCharge, { value: 0, max: 5 }, '开局充能应为零');
const seen = [];
for (let round = 0; round < 4; round += 1) {
    chargeBattle = playOneCard(chargeBattle, CHARGE_CARD).state;
    seen.push(chargeBattle.player.spellCharge.value);
}
assert.equal(seen[0], chargeEffect.value, '第一次施法未按 value 积蓄充能');
assert.ok(seen[1] > seen[0], '充能没有跨回合累积');
assert.equal(chargeBattle.player.spellCharge.max, chargeEffect.max, '充能上限未采用卡面 max');
assert.equal(Math.max(...seen), chargeEffect.max, '充能未达到上限');
assert.ok(seen.every((value) => value <= chargeEffect.max), `充能突破上限: ${seen.join(',')}`);

const spendDamageAt = (stacks) => {
    const battle = buildBattle(SPEND_CARD);
    battle.player.spellCharge = { value: stacks, max: chargeEffect.max };
    const handIndex = battle.hand.findIndex((entry) => entry.cardId === SPEND_CARD);
    assert.notEqual(handIndex, -1, '手牌里没有摸到充能爆发牌');
    const queued = queuePeakCard(battle, handIndex);
    assert.equal(queued.ok, true, `无法打出充能爆发牌: ${queued.reason || ''}`);
    const resolved = resolvePeakRound(queued.state);
    assert.equal(resolved.ok, true, `回合结算失败: ${resolved.reason || ''}`);
    const frame = resolved.frames.find((entry) => entry.cardId === SPEND_CARD && entry.visual);
    assert.ok(frame, '没有找到充能爆发牌的结算帧');
    return { damage: frame.visual.hpDamage, state: resolved.state, frame };
};
const noCharge = spendDamageAt(0);
const someCharge = spendDamageAt(2);
const fullCharge = spendDamageAt(chargeEffect.max);
assert.ok(noCharge.damage > 0, '充能爆发牌本身没有造成伤害');
assert.ok(someCharge.damage > noCharge.damage, '持有充能时伤害没有提高');
assert.ok(fullCharge.damage > someCharge.damage, '充能层数增加时伤害没有继续提高');
assert.equal(fullCharge.state.player.spellCharge.value, 0, '引爆后充能没有清零');
assert.equal(noCharge.state.player.spellCharge.value, 0, '零充能时不应产生负值');
assert.equal(fullCharge.frame.visual.spellChargeSpent, chargeEffect.max, '结算帧未记录消耗的充能层数');

let fuseBattle = buildBattle(FUSE_CARD);
const planted = playOneCard(fuseBattle, FUSE_CARD);
fuseBattle = planted.state;
assert.equal(fuseBattle.enemy.timedFuses.length, 1, '引信没有埋到对手身上');
assert.equal(fuseBattle.player.timedFuses.length, 0, '引信错误地埋在了自己身上');
const fuseDamage = fuseBattle.enemy.timedFuses[0].damage;
assert.ok(fuseDamage > 0, '引信伤害为零');
assert.equal(fuseBattle.enemy.timedFuses[0].turns, fuseEffect.turns - 1, '引信没有在敌方回合开始时递减');
assert.equal(planted.frames.filter((frame) => frame.kind === 'fuse').length, 0, '引信不应在埋设当回合引爆');

const hpBeforeDetonation = fuseBattle.enemy.hp;
const detonated = resolvePeakRound(fuseBattle);
assert.equal(detonated.ok, true, `引爆回合结算失败: ${detonated.reason || ''}`);
const fuseFrames = detonated.frames.filter((frame) => frame.kind === 'fuse');
assert.equal(fuseFrames.length, 1, '引信没有按时引爆');
assert.equal(fuseFrames[0].visual.fuseDetonated, true, '引爆帧缺少 fuseDetonated 标记');
assert.equal(fuseFrames[0].visual.hpDamage, fuseDamage, '引爆伤害与埋设时记录的不一致');
assert.equal(detonated.state.enemy.hp, hpBeforeDetonation - fuseDamage, '引爆没有正确扣血');
assert.equal(detonated.state.enemy.timedFuses.length, 0, '引爆后引信没有被移除');

const lethalBattle = buildBattle(FUSE_CARD);
lethalBattle.enemy.hp = 5;
lethalBattle.enemy.timedFuses = [
    { name: '先手引信', turns: 1, damage: 50, element: '' },
    { name: '后手引信', turns: 1, damage: 50, element: '' },
];
const lethal = resolvePeakRound(lethalBattle);
assert.equal(lethal.ok, true, `致命引爆回合结算失败: ${lethal.reason || ''}`);
const lethalFuseFrames = lethal.frames.filter((frame) => frame.kind === 'fuse');
assert.equal(lethalFuseFrames.length, 1, '目标已死后引信仍然继续引爆');
assert.equal(lethalFuseFrames[0].visual.hpDamage, 5, '致命引爆的扣血量应止步于剩余生命');
assert.equal(lethal.state.phase, 'victory', '引信击杀后没有进入胜利状态');

assert.equal(fuseBattle.player.timedFuses.length, 0, '玩家侧引信残留');

const classPlayer = (classId, stats) => () => ({
    name: `测试${classId}`,
    classId,
    maxHp: 99999,
    maxMp: 999,
    drawPerTurn: 2,
    cardLevels: {},
    stats: {
        physicalAttack: 0, magicalAttack: 0, intelligence: 0, independentAttack: 40, strength: 0,
        vitality: 30, spirit: 30, physicalDefense: 10, magicalDefense: 10,
        damageIncrease: 0, skillAttack: 0, criticalDamage: 0, damageReduction: 0,
        physicalCrit: 0, magicalCrit: 0, allElement: 0, elementalResistance: 0,
        ...stats,
    },
});
const buildClassBattle = (classId, deckIds, stats) => {
    const battle = createPeakBattle({
        deck: deckIds.length === 1 ? Array.from({ length: 16 }, () => deckIds[0]) : Array.from({ length: 16 }, (_, i) => deckIds[i % deckIds.length]),
        player: classPlayer(classId, stats)(),
        enemy: dummyEnemy(),
        dungeonId: 'test',
        seed: SEED,
    });
    const declared = selectPeakTacticalDeclaration(battle, 'measured_sequence');
    assert.equal(declared.ok, true, `战术宣言失败: ${declared.reason || ''}`);
    return declared.state;
};

const VOW_GAIN_CARD = 'knight_general_epic_defense_1';
const VOW_SPEND_CARD = 'knight_general_epic_attack_3';
for (const id of [VOW_GAIN_CARD, VOW_SPEND_CARD]) assert.ok(PEAK_CARD_BY_ID[id], `测试用卡不存在: ${id}`);
const vowGainEffect = PEAK_CARD_BY_ID[VOW_GAIN_CARD].effects.find((effect) => effect.type === 'vowGain');
const vowSpendEffect = PEAK_CARD_BY_ID[VOW_SPEND_CARD].effects.find((effect) => effect.type === 'vowSpend');
assert.ok(vowGainEffect, `${VOW_GAIN_CARD} 未携带誓约积攒`);
assert.ok(vowSpendEffect, `${VOW_SPEND_CARD} 未携带誓约兑现`);

let vowBattle = buildClassBattle('knight', [VOW_GAIN_CARD], { physicalAttack: 60, strength: 50 });
assert.deepEqual(vowBattle.player.vow, { stacks: 0, max: 5 }, '开局誓约应为零');
const vowSeen = [];
for (let round = 0; round < 4; round += 1) {
    vowBattle = playOneCard(vowBattle, VOW_GAIN_CARD).state;
    vowSeen.push(vowBattle.player.vow.stacks);
}
assert.equal(vowSeen[0], vowGainEffect.value, '第一次防守未按 value 积攒誓约');
assert.ok(vowSeen[1] > vowSeen[0], '誓约没有跨回合累积');
assert.equal(Math.max(...vowSeen), vowBattle.player.vow.max, '誓约未达到上限');
assert.ok(vowSeen.every((value) => value <= vowBattle.player.vow.max), `誓约突破上限: ${vowSeen.join(',')}`);

const vowDamageAt = (stacks) => {
    const battle = buildClassBattle('knight', [VOW_SPEND_CARD], { physicalAttack: 60, strength: 50 });
    battle.player.vow = { stacks, max: 5 };
    const handIndex = battle.hand.findIndex((entry) => entry.cardId === VOW_SPEND_CARD);
    assert.notEqual(handIndex, -1, '手牌里没有摸到誓约兑现牌');
    const queued = queuePeakCard(battle, handIndex);
    assert.equal(queued.ok, true, `无法打出誓约兑现牌: ${queued.reason || ''}`);
    const resolved = resolvePeakRound(queued.state);
    assert.equal(resolved.ok, true, `回合结算失败: ${resolved.reason || ''}`);
    const frame = resolved.frames.find((entry) => entry.cardId === VOW_SPEND_CARD && entry.visual);
    assert.ok(frame, '没有找到誓约兑现牌的结算帧');
    return { damage: frame.visual.hpDamage, state: resolved.state, frame };
};
const noVow = vowDamageAt(0);
const someVow = vowDamageAt(2);
const fullVow = vowDamageAt(5);
assert.ok(noVow.damage > 0, '誓约兑现牌本身没有造成伤害');
assert.ok(someVow.damage > noVow.damage, '持有誓约时伤害没有提高');
assert.ok(fullVow.damage > someVow.damage, '誓约层数增加时伤害没有继续提高');
assert.equal(fullVow.state.player.vow.stacks, 0, '倾泻后誓约没有清零');
assert.equal(noVow.state.player.vow.stacks, 0, '零誓约时不应产生负值');
assert.equal(fullVow.frame.visual.vowSpent, 5, '结算帧未记录消耗的誓约层数');

const BLEED_CARD = 'lancer_general_epic_skill_3';
assert.ok(PEAK_CARD_BY_ID[BLEED_CARD], `测试用卡不存在: ${BLEED_CARD}`);
const bleedEffect = PEAK_CARD_BY_ID[BLEED_CARD].effects.find((effect) => effect.type === 'bleedAmplify');
assert.ok(bleedEffect, `${BLEED_CARD} 未携带流血追击`);
const bleedDamageAt = (stacks) => {
    const battle = buildClassBattle('lancer', [BLEED_CARD], { physicalAttack: 60, strength: 50 });
    battle.enemy.state = 'airborne';
    if (stacks > 0) battle.enemy.statuses.push({ status: 'bleed', stacks, duration: 3 });
    const handIndex = battle.hand.findIndex((entry) => entry.cardId === BLEED_CARD);
    assert.notEqual(handIndex, -1, '手牌里没有摸到流血追击牌');
    const queued = queuePeakCard(battle, handIndex);
    assert.equal(queued.ok, true, `无法打出流血追击牌: ${queued.reason || ''}`);
    const resolved = resolvePeakRound(queued.state);
    assert.equal(resolved.ok, true, `回合结算失败: ${resolved.reason || ''}`);
    const frame = resolved.frames.find((entry) => entry.cardId === BLEED_CARD && entry.visual);
    assert.ok(frame, '没有找到流血追击牌的结算帧');
    return { damage: frame.visual.hpDamage, frame };
};
const noBleed = bleedDamageAt(0);
const someBleed = bleedDamageAt(2);
const capBleed = bleedDamageAt(bleedEffect.maxStacks);
const overBleed = bleedDamageAt(bleedEffect.maxStacks + 4);
assert.ok(noBleed.damage > 0, '流血追击牌本身没有造成伤害');
assert.ok(someBleed.damage > noBleed.damage, '目标有流血时伤害没有提高');
assert.ok(capBleed.damage > someBleed.damage, '流血层数增加时伤害没有继续提高');
assert.equal(overBleed.damage, capBleed.damage, '流血追击没有在 maxStacks 处截断');
assert.equal(noBleed.frame.visual.bleedAmplified, undefined, '目标无流血时不应记录追击层数');
assert.equal(someBleed.frame.visual.bleedAmplified, 2, '结算帧未记录目标流血层数');

const BLESSING_CARD = 'priest_general_epic_defense_1';
assert.ok(PEAK_CARD_BY_ID[BLESSING_CARD], `测试用卡不存在: ${BLESSING_CARD}`);
const blessingEffect = PEAK_CARD_BY_ID[BLESSING_CARD].effects.find((effect) => effect.type === 'scheduleBlessing');
assert.ok(blessingEffect, `${BLESSING_CARD} 未携带祝福预载`);
let blessBattle = buildClassBattle('priest', [BLESSING_CARD], { magicalAttack: 60, intelligence: 50 });
assert.deepEqual(blessBattle.player.blessedSchedules, [], '开局不应有待兑现的祝福');
blessBattle = playOneCard(blessBattle, BLESSING_CARD).state;
assert.equal(blessBattle.player.blessedSchedules.length, 1, '祝福没有埋到自己身上');
assert.equal(blessBattle.enemy.blessedSchedules.length, 0, '祝福错误地埋在了对手身上');
assert.equal(blessBattle.player.blessedSchedules[0].turns, blessingEffect.turns - 1, '祝福没有在自己回合开始时递减');
assert.ok(blessingEffect.turns >= 2, '测试用祝福的延迟必须大于 1 回合，否则埋设当回合就兑现了');
assert.equal(blessBattle.player.blessedSchedules[0].type, blessingEffect.blessingType, '祝福类型丢失');

const healBattle = buildClassBattle('priest', [BLESSING_CARD], { magicalAttack: 60, intelligence: 50 });
healBattle.player.hp = Math.max(1, healBattle.player.maxHp - 500);
healBattle.player.blessedSchedules = [{ type: 'heal', turns: 1, value: 120, name: '测试治疗' }];
const healHpBefore = healBattle.player.hp;
const healed = resolvePeakRound(healBattle);
assert.equal(healed.ok, true, `祝福兑现回合结算失败: ${healed.reason || ''}`);
const healFrames = healed.frames.filter((frame) => frame.kind === 'blessing');
assert.equal(healFrames.length, 1, '治疗型祝福没有按时兑现');
assert.equal(healFrames[0].visual.healing, 120, '治疗型祝福兑现量不对');
assert.equal(healed.state.player.hp, healHpBefore + 120, '治疗型祝福没有实际回血');
assert.equal(healed.state.player.blessedSchedules.length, 0, '兑现后祝福没有被移除');

const shieldBattle = buildClassBattle('priest', [BLESSING_CARD], { magicalAttack: 60, intelligence: 50 });
shieldBattle.player.shield = 0;
shieldBattle.player.blessedSchedules = [{ type: 'shield', turns: 1, value: 90, name: '测试护盾' }];
const shielded = resolvePeakRound(shieldBattle);
assert.equal(shielded.ok, true, `护盾祝福结算失败: ${shielded.reason || ''}`);
const shieldFrames = shielded.frames.filter((frame) => frame.kind === 'blessing');
assert.equal(shieldFrames.length, 1, '护盾型祝福没有按时兑现');
assert.equal(shieldFrames[0].visual.shieldGained, 90, '护盾型祝福兑现量不对');
assert.equal(shieldBattle.player.baseShieldRetention || 0, 0, '测试前提失效：该角色的护盾保留率不再是 0');
assert.equal(shielded.state.player.shield, 90, '护盾型祝福被护盾衰减吃掉了（兑现顺序早于 retainShieldForNextRound）');

const cleanseBattle = buildClassBattle('priest', [BLESSING_CARD], { magicalAttack: 60, intelligence: 50 });
cleanseBattle.player.statuses = [
    { id: 'bleed', stacks: 3, duration: 3 },
    { id: 'poison', stacks: 2, duration: 3 },
    { id: 'regeneration', stacks: 1, duration: 3 },
];
cleanseBattle.player.blessedSchedules = [{ type: 'cleanse', turns: 1, value: 2, name: '测试净化' }];
const cleansed = resolvePeakRound(cleanseBattle);
assert.equal(cleansed.ok, true, `净化祝福结算失败: ${cleansed.reason || ''}`);
assert.equal(cleansed.frames.filter((frame) => frame.kind === 'blessing').length, 1, '净化型祝福没有按时兑现');
const remainingStatuses = cleansed.state.player.statuses.map((entry) => entry.id);
assert.ok(!remainingStatuses.includes('bleed') && !remainingStatuses.includes('poison'), '净化型祝福没有洗掉负面状态');
assert.ok(remainingStatuses.includes('regeneration'), '净化型祝福误伤了有益状态');

const pendingBattle = buildClassBattle('priest', [BLESSING_CARD], { magicalAttack: 60, intelligence: 50 });
pendingBattle.player.blessedSchedules = [{ type: 'heal', turns: 3, value: 100, name: '测试延迟' }];
const pending = resolvePeakRound(pendingBattle);
assert.equal(pending.ok, true, `延迟祝福结算失败: ${pending.reason || ''}`);
assert.equal(pending.frames.filter((frame) => frame.kind === 'blessing').length, 0, '祝福提前兑现了');
assert.equal(pending.state.player.blessedSchedules[0].turns, 2, '祝福没有在自己回合开始时递减');

const COMBO_STRIKE = 'universal_five_attack_rare_1';
const COMBO_LAUNCH = 'universal_five_attack_rare_2';
const COMBO_CARD = 'universal_five_attack_rare_3';
const COMBO_BREAKER = 'brace';
for (const id of [COMBO_STRIKE, COMBO_LAUNCH, COMBO_CARD, COMBO_BREAKER]) assert.ok(PEAK_CARD_BY_ID[id], `测试用卡不存在: ${id}`);
const comboEffect = PEAK_CARD_BY_ID[COMBO_CARD].effects.find((effect) => effect.type === 'comboEscalate');
assert.ok(comboEffect, `${COMBO_CARD} 未携带连段增伤`);
assert.equal(PEAK_CARD_BY_ID[COMBO_BREAKER].category, 'defense', '打断用牌必须是非进攻牌');

const playCombo = (cardIds) => {
    const battle = createPeakBattle({
        deck: Array.from({ length: 24 }, (_, i) => cardIds[i % cardIds.length]),
        player: classPlayer('all', { physicalAttack: 60, strength: 50 })(),
        enemy: dummyEnemy(),
        dungeonId: 'test',
        seed: SEED,
    });
    const declared = selectPeakTacticalDeclaration(battle, 'measured_sequence');
    assert.equal(declared.ok, true, `战术宣言失败: ${declared.reason || ''}`);
    let state = declared.state;
    state.hand = cardIds.map((cardId, index) => ({ cardId, uid: `combo-${index}`, level: 1 }));
    for (const cardId of cardIds) {
        const handIndex = state.hand.findIndex((entry) => entry.cardId === cardId);
        assert.notEqual(handIndex, -1, `手牌里没有 ${cardId}`);
        const queued = queuePeakCard(state, handIndex);
        assert.equal(queued.ok, true, `无法排入 ${cardId}: ${queued.reason || ''}`);
        state = queued.state;
    }
    assert.deepEqual(state.queue.map((entry) => entry.cardId), cardIds, '队列顺序被改写，连段前提失效');
    const resolved = resolvePeakRound(state);
    assert.equal(resolved.ok, true, `回合结算失败: ${resolved.reason || ''}`);
    const frame = resolved.frames.find((entry) => entry.cardId === COMBO_CARD && entry.visual);
    assert.ok(frame, '没有找到连段增伤牌的结算帧');
    return { chain: frame.visual.comboChain, damage: frame.visual.hpDamage, frame, state: resolved.state };
};

const chain1 = playCombo([COMBO_LAUNCH, COMBO_CARD]);
const chain2 = playCombo([COMBO_STRIKE, COMBO_LAUNCH, COMBO_CARD]);
const chain3 = playCombo([COMBO_STRIKE, COMBO_STRIKE, COMBO_LAUNCH, COMBO_CARD]);
assert.equal(chain1.chain, 1, `连段数不对: ${chain1.chain}`);
assert.equal(chain2.chain, 2, `连段数不对: ${chain2.chain}`);
assert.equal(chain3.chain, 3, `连段数不对: ${chain3.chain}`);
assert.ok(chain1.damage > 0, '连段增伤牌本身没有造成伤害');
assert.ok(chain2.damage > chain1.damage, '连段接长了但伤害没有提高');
assert.ok(chain3.damage > chain2.damage, '连段继续接长时伤害没有继续提高');

const broken = playCombo([COMBO_STRIKE, COMBO_STRIKE, COMBO_BREAKER, COMBO_LAUNCH, COMBO_CARD]);
assert.equal(broken.chain, 1, `非进攻牌没有打断连段: ${broken.chain}`);
assert.ok(broken.damage < chain3.damage, '被打断的连段伤害不该和没被打断的一样高');

const chain4 = playCombo([COMBO_STRIKE, COMBO_STRIKE, COMBO_STRIKE, COMBO_LAUNCH, COMBO_CARD]);
const chain5 = playCombo([COMBO_STRIKE, COMBO_STRIKE, COMBO_STRIKE, COMBO_STRIKE, COMBO_LAUNCH, COMBO_CARD]);
assert.equal(comboEffect.maxCards, 4, `测试前提失效：该卡的连段上限不再是 4: ${comboEffect.maxCards}`);
assert.equal(chain4.chain, 4, `连段数不对: ${chain4.chain}`);
assert.equal(chain5.chain, 5, `连段数不对: ${chain5.chain}`);
assert.ok(chain4.damage > chain3.damage, '连段吃满前伤害就停止增长了');
assert.equal(chain5.damage, chain4.damage, `连段超过上限后仍在涨: ${chain4.damage} -> ${chain5.damage}`);

const soloCombo = playCombo([COMBO_LAUNCH, COMBO_CARD]);
assert.ok(soloCombo.frame.text.includes('连段'), '结算文本没有提到连段');
const noComboCard = 'universal_five_attack_rare_5';
assert.ok(PEAK_CARD_BY_ID[noComboCard], `测试用卡不存在: ${noComboCard}`);
assert.ok(!PEAK_CARD_BY_ID[noComboCard].effects.some((effect) => effect.type === 'comboEscalate'),
    `${noComboCard} 意外携带了连段增伤，空连段用例失效`);

const VOW_SHIELD_CARD = 'knight_route_holy_guardian_epic_defense_t2_1';
const BLEED_HARVEST_CARD = 'lancer_route_dragon_lancer_epic_defense_t2_1';
const CASCADE_CARD = 'mage_route_elemental_sorceress_epic_defense_t2_1';
const HASTEN_CARD = 'priest_route_grace_cleric_epic_buff_t2_1';
for (const id of [VOW_SHIELD_CARD, BLEED_HARVEST_CARD, CASCADE_CARD, HASTEN_CARD]) {
    assert.ok(PEAK_CARD_BY_ID[id], `测试用卡不存在: ${id}`);
}
const vowShieldEffect = PEAK_CARD_BY_ID[VOW_SHIELD_CARD].effects.find((effect) => effect.type === 'vowShield');
const harvestEffect = PEAK_CARD_BY_ID[BLEED_HARVEST_CARD].effects.find((effect) => effect.type === 'bleedHarvest');
const cascadeEffect = PEAK_CARD_BY_ID[CASCADE_CARD].effects.find((effect) => effect.type === 'arcaneCascade');
const hastenEffect = PEAK_CARD_BY_ID[HASTEN_CARD].effects.find((effect) => effect.type === 'blessingHasten');
assert.ok(vowShieldEffect && harvestEffect && cascadeEffect && hastenEffect, '转职卡未按预期携带路线机制');

const vowShieldAt = (stacks) => {
    const battle = buildClassBattle('knight', [VOW_SHIELD_CARD], { physicalAttack: 60, strength: 50, vitality: 30 });
    battle.player.vow = { stacks, max: 5 };
    const handIndex = battle.hand.findIndex((entry) => entry.cardId === VOW_SHIELD_CARD);
    assert.notEqual(handIndex, -1, '手牌里没有摸到誓约换盾牌');
    const queued = queuePeakCard(battle, handIndex);
    assert.equal(queued.ok, true, `无法打出誓约换盾牌: ${queued.reason || ''}`);
    const resolved = resolvePeakRound(queued.state);
    assert.equal(resolved.ok, true, `回合结算失败: ${resolved.reason || ''}`);
    const frame = resolved.frames.find((entry) => entry.cardId === VOW_SHIELD_CARD && entry.visual);
    assert.ok(frame, '没有找到誓约换盾牌的结算帧');
    return { shield: frame.visual.shieldGained, onBody: frame.state.player.shield, state: resolved.state, frame };
};
const noVowShield = vowShieldAt(0);
const someVowShield = vowShieldAt(2);
const fullVowShield = vowShieldAt(5);
const overVowShield = vowShieldAt(vowShieldEffect.maxStacks + 3);
assert.ok(noVowShield.shield > 0, '载体牌本身没有提供护盾');
assert.equal(someVowShield.shield - noVowShield.shield, 2 * vowShieldEffect.shieldPerStack, '两层誓约换出的护盾量不对');
assert.equal(fullVowShield.shield - noVowShield.shield, 5 * vowShieldEffect.shieldPerStack, '五层誓约换出的护盾量不对');
assert.equal(overVowShield.shield, fullVowShield.shield, '誓约换盾没有在 maxStacks 处截断');
assert.equal(noVowShield.onBody, noVowShield.shield, '载体牌的护盾没有加到身上');
assert.equal(fullVowShield.onBody, fullVowShield.shield, '誓约换出的护盾没有加到身上');
assert.equal(fullVowShield.onBody - noVowShield.onBody, 5 * vowShieldEffect.shieldPerStack, '身上的护盾增量与誓约层数不匹配');
assert.equal(fullVowShield.frame.visual.vowSpent, 5, '结算帧未记录消耗的誓约层数');
assert.equal(fullVowShield.state.player.vow.stacks, 0, '倾泻后誓约没有清零');
assert.equal(noVowShield.state.player.vow.stacks, 0, '零誓约时不应产生负值');
assert.equal(noVowShield.frame.visual.vowSpent, undefined, '无誓约时不该记录消耗层数');

const harvestAt = (stacks, key = 'status') => {
    const battle = buildClassBattle('lancer', [BLEED_HARVEST_CARD], { physicalAttack: 60, strength: 50 });
    battle.enemy.stats.physicalDefense = 400;
    battle.enemy.stats.damageReduction = 50;
    if (stacks > 0) battle.enemy.statuses.push({ [key]: 'bleed', stacks, duration: 3 });
    const handIndex = battle.hand.findIndex((entry) => entry.cardId === BLEED_HARVEST_CARD);
    assert.notEqual(handIndex, -1, '手牌里没有摸到流血收割牌');
    const queued = queuePeakCard(battle, handIndex);
    assert.equal(queued.ok, true, `无法打出流血收割牌: ${queued.reason || ''}`);
    const resolved = resolvePeakRound(queued.state);
    assert.equal(resolved.ok, true, `回合结算失败: ${resolved.reason || ''}`);
    const frame = resolved.frames.find((entry) => entry.cardId === BLEED_HARVEST_CARD && entry.visual);
    assert.ok(frame, '没有找到流血收割牌的结算帧');
    return { damage: frame.visual.hpDamage, state: resolved.state, frame };
};
const noHarvest = harvestAt(0);
const someHarvest = harvestAt(3);
const capHarvest = harvestAt(harvestEffect.maxStacks);
const overHarvest = harvestAt(harvestEffect.maxStacks + 4);
const idKeyHarvest = harvestAt(3, 'id');
assert.equal(noHarvest.damage, 0, '目标无流血时不该造成伤害');
assert.equal(someHarvest.damage, 3 * harvestEffect.damagePerStack, '三层流血收割的伤害量不对');
assert.equal(capHarvest.damage, harvestEffect.maxStacks * harvestEffect.damagePerStack, '满层流血收割的伤害量不对');
assert.equal(overHarvest.damage, capHarvest.damage, '流血收割没有在 maxStacks 处截断');
assert.equal(idKeyHarvest.damage, someHarvest.damage, 'addPeakStatus 风格的 { id } 流血没有被收割读到');
assert.equal(someHarvest.frame.visual.bleedHarvested, 3, '结算帧未记录收割的流血层数');
assert.equal(noHarvest.frame.visual.bleedHarvested, undefined, '目标无流血时不该记录收割层数');
assert.deepEqual(someHarvest.state.enemy.statuses.filter((entry) => entry.id === 'bleed' || entry.status === 'bleed'), [],
    '收割后目标的流血没有被清除');
assert.deepEqual(idKeyHarvest.state.enemy.statuses.filter((entry) => entry.id === 'bleed' || entry.status === 'bleed'), [],
    '收割后 { id } 风格的流血没有被清除');

const cascadeAt = (charges) => {
    const battle = buildClassBattle('mage', [CASCADE_CARD], { magicalAttack: 60, intelligence: 50 });
    battle.player.spellCharge = { value: charges, max: 6 };
    const handIndex = battle.hand.findIndex((entry) => entry.cardId === CASCADE_CARD);
    assert.notEqual(handIndex, -1, '手牌里没有摸到充能级联牌');
    const queued = queuePeakCard(battle, handIndex);
    assert.equal(queued.ok, true, `无法打出充能级联牌: ${queued.reason || ''}`);
    const resolved = resolvePeakRound(queued.state);
    assert.equal(resolved.ok, true, `回合结算失败: ${resolved.reason || ''}`);
    const frame = resolved.frames.find((entry) => entry.cardId === CASCADE_CARD && entry.visual);
    assert.ok(frame, '没有找到充能级联牌的结算帧');
    return { damage: frame.visual.hpDamage, state: resolved.state, frame };
};
const noCascade = cascadeAt(0);
const someCascade = cascadeAt(3);
const capCascade = cascadeAt(cascadeEffect.maxCharges);
const overCascade = cascadeAt(cascadeEffect.maxCharges + 1);
assert.equal(noCascade.damage, 0, '没有充能时不该造成伤害');
assert.equal(someCascade.damage, 3 * cascadeEffect.damagePerCharge, '三层充能级联的伤害量不对');
assert.equal(capCascade.damage, cascadeEffect.maxCharges * cascadeEffect.damagePerCharge, '满层充能级联的伤害量不对');
assert.equal(overCascade.damage, capCascade.damage, '充能级联没有在 maxCharges 处截断');
assert.equal(someCascade.frame.visual.arcaneCascadeCharges, 3, '结算帧未记录引爆的充能层数');
assert.equal(noCascade.frame.visual.arcaneCascadeCharges, undefined, '无充能时不该记录引爆层数');
assert.equal(someCascade.state.player.spellCharge.value, 0, '级联后充能没有清零');
assert.equal(noCascade.state.player.spellCharge.value, 0, '零充能时不应产生负值');
assert.equal(someCascade.frame.visual.element, cascadeEffect.element, '级联伤害的元素标记丢失');

const hastenWith = (schedules, { play = true } = {}) => {
    const battle = buildClassBattle('priest', [HASTEN_CARD], { magicalAttack: 60, intelligence: 50 });
    battle.player.hp = Math.max(1, battle.player.maxHp - 900);
    battle.player.blessedSchedules = schedules.map((entry) => ({ ...entry }));
    if (!play) {
        const resolved = resolvePeakRound(battle);
        assert.equal(resolved.ok, true, `对照回合结算失败: ${resolved.reason || ''}`);
        return { state: resolved.state, frames: resolved.frames, frame: null };
    }
    const handIndex = battle.hand.findIndex((entry) => entry.cardId === HASTEN_CARD);
    assert.notEqual(handIndex, -1, '手牌里没有摸到祝福催熟牌');
    const queued = queuePeakCard(battle, handIndex);
    assert.equal(queued.ok, true, `无法打出祝福催熟牌: ${queued.reason || ''}`);
    const resolved = resolvePeakRound(queued.state);
    assert.equal(resolved.ok, true, `回合结算失败: ${resolved.reason || ''}`);
    const frame = resolved.frames.find((entry) => entry.cardId === HASTEN_CARD && entry.visual);
    assert.ok(frame, '没有找到祝福催熟牌的结算帧');
    return { state: resolved.state, frames: resolved.frames, frame };
};

const hastenSchedule = [{ type: 'heal', turns: 3, value: 100, name: '测试祝福' }];
const hastenControl = hastenWith(hastenSchedule, { play: false });
const hastened = hastenWith(hastenSchedule);
assert.equal(hastenControl.state.player.blessedSchedules[0].turns, 2, '对照组祝福没有在回合开始时递减');
assert.equal(hastened.state.player.blessedSchedules[0].turns, 2 - hastenEffect.turns, '催熟没有把倒数压近');
assert.equal(hastened.state.player.blessedSchedules[0].value,
    Math.round(100 * (1 + hastenEffect.bonusPercent / 100)), '催熟没有提高兑现值');
assert.equal(hastened.frame.visual.blessingsHastened, 1, '结算帧未记录被催熟的祝福数量');
assert.equal(hastenControl.frames.filter((frame) => frame.kind === 'blessing').length, 0, '对照组祝福提前兑现了');
assert.equal(hastened.frames.filter((frame) => frame.kind === 'blessing').length, 0, '催熟不该让倒数 3 的祝福当场兑现');

const readySchedule = [{ type: 'heal', turns: 2, value: 200, name: '测试提前兑现' }];
const readyControl = hastenWith(readySchedule, { play: false });
const readyHastened = hastenWith(readySchedule);
assert.equal(readyControl.frames.filter((frame) => frame.kind === 'blessing').length, 0, '对照组祝福不该在本回合兑现');
const readyFrames = readyHastened.frames.filter((frame) => frame.kind === 'blessing');
assert.equal(readyFrames.length, 1, '催熟后的祝福没有在本回合兑现');
assert.equal(readyFrames[0].visual.healing, Math.round(200 * (1 + hastenEffect.bonusPercent / 100)), '兑现量没有吃到催熟加成');
assert.equal(readyHastened.state.player.blessedSchedules.length, 0, '兑现后祝福没有被移除');

const multiHastened = hastenWith([
    { type: 'heal', turns: 3, value: 100, name: '甲' },
    { type: 'shield', turns: 3, value: 80, name: '乙' },
]);
assert.equal(multiHastened.frame.visual.blessingsHastened, 2, '多条祝福没有被一起催熟');
assert.deepEqual(multiHastened.state.player.blessedSchedules.map((entry) => entry.turns), [2 - hastenEffect.turns, 2 - hastenEffect.turns],
    '多条祝福的倒数没有同步压近');
const emptyHastened = hastenWith([]);
assert.deepEqual(emptyHastened.state.player.blessedSchedules, [], '无祝福时不该凭空产生祝福');
assert.equal(emptyHastened.frame.visual.blessingsHastened, undefined, '无祝福时不该记录催熟数量');
assert.deepEqual(emptyHastened.state.enemy.blessedSchedules, [], '催熟牵动了对手的祝福');

const created = createPeakCharacter(createPeakSave(0), 'mage', '机制测试', 0);
assert.equal(created.ok, true, `建号失败: ${created.reason || ''}`);
const runSave = created.state;
const character = runSave.characters[runSave.activeCharacterId];
const dirtyRun = buildBattle(CHARGE_CARD);
dirtyRun.player.spellCharge = { value: -7, max: Number.NaN };
dirtyRun.enemy.spellCharge = { value: 9999, max: 999 };
dirtyRun.player.timedFuses = 'not-an-array';
dirtyRun.enemy.timedFuses = [
    { name: 'x'.repeat(200), turns: 99, damage: 1e12, element: 'y'.repeat(50) },
    { turns: 2, damage: 0 },
    { turns: 0, damage: 10 },
    { turns: Number.NaN, damage: Number.NaN },
];
character.activeRun = dirtyRun;
const normalized = normalizePeakSave(runSave, 0);
const safeRun = normalized.characters[normalized.activeCharacterId].activeRun;
assert.ok(safeRun, '带新字段的存档被整体丢弃了');
assert.deepEqual(safeRun.player.spellCharge, { value: 0, max: 5 }, '玩家充能未被 clamp 到安全默认值');
assert.equal(safeRun.enemy.spellCharge.max, 20, '充能上限未被 clamp 到 20');
assert.equal(safeRun.enemy.spellCharge.value, 20, '充能层数未被 clamp 到上限');
assert.deepEqual(safeRun.player.timedFuses, [], '非数组引信未被规范化为空数组');
assert.equal(safeRun.enemy.timedFuses.length, 1, '非法引信条目未被剔除');
assert.equal(safeRun.enemy.timedFuses[0].turns, 9, '引信回合数未被 clamp');
assert.equal(safeRun.enemy.timedFuses[0].damage, 999999, '引信伤害未被 clamp');
assert.equal(safeRun.enemy.timedFuses[0].name.length, 40, '引信名称未被截断');
assert.equal(safeRun.enemy.timedFuses[0].element.length, 16, '引信元素未被截断');

const vowSave = createPeakCharacter(createPeakSave(0), 'knight', '誓约测试', 0);
assert.equal(vowSave.ok, true, `建号失败: ${vowSave.reason || ''}`);
const vowRunSave = vowSave.state;
const vowCharacter = vowRunSave.characters[vowRunSave.activeCharacterId];
const dirtyVowRun = buildClassBattle('knight', [VOW_GAIN_CARD], { physicalAttack: 60, strength: 50 });
dirtyVowRun.player.vow = { stacks: -4, max: null };
dirtyVowRun.enemy.vow = { stacks: 9999, max: 999 };
dirtyVowRun.player.blessedSchedules = 'not-an-array';
dirtyVowRun.enemy.blessedSchedules = [
    { type: 'heal', turns: 99, value: 1e12, name: 'z'.repeat(200) },
    { type: 'cleanse', turns: 2, value: 500 },
    { type: 'curse', turns: 2, value: 10 },
    { type: 'shield', turns: 0, value: 10 },
    { type: 'shield', turns: Number.NaN, value: Number.NaN },
];
vowCharacter.activeRun = dirtyVowRun;
const vowNormalized = normalizePeakSave(vowRunSave, 0);
const safeVowRun = vowNormalized.characters[vowNormalized.activeCharacterId].activeRun;
assert.ok(safeVowRun, '带誓约字段的存档被整体丢弃了');
assert.deepEqual(safeVowRun.player.vow, { stacks: 0, max: 5 }, '玩家誓约未被 clamp 到安全默认值');
assert.equal(safeVowRun.enemy.vow.max, 20, '誓约上限未被 clamp 到 20');
assert.equal(safeVowRun.enemy.vow.stacks, 20, '誓约层数未被 clamp 到上限');
assert.deepEqual(safeVowRun.player.blessedSchedules, [], '非数组祝福未被规范化为空数组');
assert.equal(safeVowRun.enemy.blessedSchedules.length, 2, `非法祝福条目未被剔除: ${JSON.stringify(safeVowRun.enemy.blessedSchedules)}`);
const [healEntry, cleanseEntry] = safeVowRun.enemy.blessedSchedules;
assert.equal(healEntry.turns, 9, '祝福回合数未被 clamp');
assert.equal(healEntry.value, 999999, '治疗型祝福数值未被 clamp');
assert.equal(healEntry.name.length, 40, '祝福名称未被截断');
assert.equal(cleanseEntry.type, 'cleanse', '净化型祝福被误删');
assert.equal(cleanseEntry.value, 9, '净化型祝福层数未被压到小范围');

console.log('peak duel class mechanics: passed');
