import assert from 'node:assert/strict';

import {
    PEAK_CARD_BY_ID,
    PEAK_CARD_RARITIES,
    PEAK_CARDS,
    isPeakCardAvailableForAdvancement,
} from '../js/peak-duel-data.js';
import { createPeakBattle, queuePeakCard, resolvePeakRound, selectPeakTacticalDeclaration } from '../js/peak-duel-engine.js';

const RARITIES = ['common', 'excellent', 'rare', 'scarce', 'legendary', 'epic'];
const ROUTES = {
    ice_shadow: 'sword',
    light_guardian: 'sword',
    flame_brawler: 'brawler',
    shadow_fist: 'brawler',
};
const specials = PEAK_CARDS.filter((card) => card.routeSpecialExpansion);

assert.equal(specials.length, 24, `路线特殊牌应为24张，实际${specials.length}张`);
assert.equal(new Set(specials.map((card) => card.id)).size, 24, '路线特殊牌存在重复ID');
assert.deepEqual(specials.filter((card) => card.rarity === 'mythic'), [], '神话稀有度仍应保持预留');

const mechanicShape = (card) => card.effects.map((effect) => [
    effect.type,
    effect.condition || '',
    Boolean(effect.copy),
    Boolean(effect.consume),
    Boolean(effect.consumePercent),
    Boolean(effect.damagePerStack),
    Boolean(effect.restoreRoutePerStack),
    Boolean(effect.restoreMpPerStack),
    (effect.statuses || []).join('/'),
].join(':')).join('+');

for (const [pathId, classId] of Object.entries(ROUTES)) {
    const routeCards = specials.filter((card) => card.requiredAdvancement?.pathId === pathId);
    assert.equal(routeCards.length, 6, `${pathId} 应有6张路线特殊牌`);
    assert.deepEqual(routeCards.map((card) => card.rarity).sort(), [...RARITIES].sort(), `${pathId} 稀有度覆盖不完整`);
    assert.equal(new Set(routeCards.map(mechanicShape)).size, 6, `${pathId} 存在只有数值不同的路线特殊牌`);
    for (const card of routeCards) {
        const expectedTier = ['legendary', 'epic'].includes(card.rarity) ? 2 : 1;
        assert.equal(card.classId, classId, `${card.id} 职业归属错误`);
        assert.equal(card.category, 'special', `${card.id} 不是特殊牌`);
        assert.equal(card.requiredAdvancement.minTier, expectedTier, `${card.id} 转职层级错误`);
        assert.equal(isPeakCardAvailableForAdvancement(card, { pathId, tier: expectedTier }), true, `${card.id} 在正确路线不可用`);
        assert.equal(isPeakCardAvailableForAdvancement(card, { pathId, tier: expectedTier - 1 }), false, `${card.id} 提前解锁`);
        const otherPath = Object.keys(ROUTES).find((candidate) => candidate !== pathId);
        assert.equal(isPeakCardAvailableForAdvancement(card, { pathId: otherPath, tier: 2 }), false, `${card.id} 泄漏到其它路线`);
        assert.ok(card.tags.includes('路线特殊牌'), `${card.id} 缺少路线特殊牌标签`);
        assert.ok(PEAK_CARD_RARITIES[card.rarity] && !PEAK_CARD_RARITIES[card.rarity].reserved, `${card.id} 使用了未开放稀有度`);
    }
}

const dummyEnemy = () => ({
    name: '路线机制木桩', maxHp: 99999, maxMp: 60, deck: [], cardLevel: 1,
    stats: {
        physicalAttack: 0, magicalAttack: 0, physicalDefense: 0, magicalDefense: 0,
        vitality: 10, spirit: 10, damageIncrease: 0, skillAttack: 0, criticalDamage: 0,
        damageReduction: 0, physicalCrit: 0, magicalCrit: 0, allElement: 0, elementalResistance: 0,
    },
});
const routePlayer = (classId, pathId) => ({
    name: '路线机制测试', classId, maxHp: 1000, maxMp: 100, drawPerTurn: 2,
    advancement: { pathId, tier: 2 }, cardLevels: {},
    stats: {
        physicalAttack: 60, magicalAttack: 60, independentAttack: 60,
        strength: 50, intelligence: 50, vitality: 50, spirit: 50,
        physicalDefense: 10, magicalDefense: 10, damageIncrease: 0, skillAttack: 0,
        criticalDamage: 0, damageReduction: 0, physicalCrit: 0, magicalCrit: 0,
        allElement: 0, fireElement: 0, iceElement: 0, lightElement: 0, darkElement: 0,
        elementalResistance: 0,
    },
});
const buildRouteBattle = (pathId, cardIds) => {
    const classId = ROUTES[pathId];
    const battle = createPeakBattle({
        deck: cardIds,
        player: routePlayer(classId, pathId),
        enemy: dummyEnemy(),
        dungeonId: 'route-special-test',
        seed: 20260815,
    });
    battle.hand = cardIds.map((cardId, index) => ({ uid: `route-test-${index}`, cardId }));
    battle.drawPile = [];
    const declared = selectPeakTacticalDeclaration(battle, 'measured_sequence');
    assert.equal(declared.ok, true, `战术宣言失败：${declared.reason || ''}`);
    return declared.state;
};
const resolveCards = (pathId, cardIds, setup = () => {}) => {
    let battle = buildRouteBattle(pathId, cardIds);
    setup(battle);
    for (const cardId of cardIds) {
        const handIndex = battle.hand.findIndex((entry) => entry.cardId === cardId);
        assert.notEqual(handIndex, -1, `手牌中没有${cardId}`);
        const queued = queuePeakCard(battle, handIndex);
        assert.equal(queued.ok, true, `${cardId}无法入队：${queued.reason || ''}`);
        battle = queued.state;
    }
    const resolved = resolvePeakRound(battle);
    assert.equal(resolved.ok, true, `路线特殊牌回合结算失败：${resolved.reason || ''}`);
    return resolved;
};
const cardFrame = (resolved, cardId) => {
    const frame = resolved.frames.find((entry) => entry.cardId === cardId && entry.visual);
    assert.ok(frame, `找不到${cardId}结算帧`);
    return frame;
};

for (const card of specials) {
    const pathId = card.requiredAdvancement.pathId;
    const resolved = resolveCards(pathId, [card.id], (battle) => {
        battle.player.shield = 200;
        battle.player.routeResource.value = battle.player.routeResource.max;
        battle.enemy.statuses = [
            { id: 'frozen', stacks: 2, duration: 4 },
            { id: 'burn', stacks: 2, duration: 4 },
            { id: 'poison', stacks: 2, duration: 4 },
            { id: 'bleed', stacks: 2, duration: 4 },
        ];
        battle.discardPile = [
            { uid: 'smoke-ice', cardId: 'frost_edge' },
            { uid: 'smoke-shadow', cardId: 'shadow_fist_venom_fangs' },
        ];
    });
    cardFrame(resolved, card.id);
}

const iceCommonId = 'route_special_ice_shadow_common';
const iceCommon = resolveCards('ice_shadow', [iceCommonId], (battle) => {
    battle.player.mp = 20;
    battle.enemy.statuses = [{ id: 'frozen', stacks: 1, duration: 3 }];
});
const iceCommonFrame = cardFrame(iceCommon, iceCommonId);
assert.equal(iceCommonFrame.state.player.routeResource.value, 1, '寒印归息未获得寒霜印记');
assert.ok(iceCommonFrame.state.player.mp > 20 - PEAK_CARD_BY_ID[iceCommonId].cost, '寒印归息未恢复MP');
const iceCommonMiss = resolveCards('ice_shadow', [iceCommonId]);
assert.equal(cardFrame(iceCommonMiss, iceCommonId).state.player.routeResource.value, 0, '无冰冻目标时不应获得寒霜印记');

const iceRecallId = 'route_special_ice_shadow_rare';
const iceRecall = resolveCards('ice_shadow', [iceRecallId], (battle) => {
    battle.discardPile = [
        { uid: 'discard-physical', cardId: 'straight_slash' },
        { uid: 'discard-ice', cardId: 'frost_edge' },
    ];
});
const iceRecallFrame = cardFrame(iceRecall, iceRecallId);
assert.ok(iceRecallFrame.state.hand.some((entry) => entry.cardId === 'frost_edge'), '冰轮复写没有回收冰属性牌');
assert.ok(iceRecallFrame.state.discardPile.some((entry) => entry.cardId === 'straight_slash'), '冰轮复写错误回收了非冰属性牌');

const iceExtendId = 'route_special_ice_shadow_scarce';
const iceExtend = resolveCards('ice_shadow', [iceExtendId], (battle) => {
    battle.enemy.statuses = [{ id: 'frozen', stacks: 1, duration: 3 }];
});
const iceExtendFrame = cardFrame(iceExtend, iceExtendId);
assert.deepEqual(iceExtendFrame.state.enemy.statuses.find((entry) => entry.id === 'frozen'), { id: 'frozen', stacks: 2, duration: 5 }, '霜痕延刻没有正确强化冰冻');
assert.equal(iceExtendFrame.state.player.routeResource.value, 1, '霜痕延刻没有获得寒霜印记');

const iceSealId = 'route_special_ice_shadow_legendary';
const iceSeal = resolveCards('ice_shadow', [iceSealId, 'frost_edge']);
const frostEdgeFrame = cardFrame(iceSeal, 'frost_edge');
assert.equal(frostEdgeFrame.visual.routeDamageBonus, 28, '霜狱封印后的冰牌没有获得二转满印增伤');
assert.equal(frostEdgeFrame.state.player.routeResource.value, frostEdgeFrame.state.player.routeResource.max, '霜狱封印没有保留满层寒霜印记');
assert.equal(frostEdgeFrame.visual.routeResourceConsumed, false, '封存中的寒霜印记不应被消费');

const lightRareId = 'route_special_light_guardian_rare';
const lightRare = resolveCards('light_guardian', [lightRareId], (battle) => { battle.player.shield = 100; });
const lightRareFrame = cardFrame(lightRare, lightRareId);
assert.equal(lightRareFrame.visual.hpDamage, 32, '圣壁反照的一级伤害不正确');
assert.equal(lightRareFrame.visual.shieldSpent, 0, '圣壁反照不应消耗护盾');
assert.equal(lightRareFrame.state.player.shield, 100, '圣壁反照结算帧中的护盾被错误扣除');
const lightEpicId = 'route_special_light_guardian_epic';
const lightEpic = resolveCards('light_guardian', [lightEpicId], (battle) => { battle.player.shield = 100; });
const lightEpicFrame = cardFrame(lightEpic, lightEpicId);
assert.equal(lightEpicFrame.visual.hpDamage, 140, '天穹圣裁的一级伤害不正确');
assert.equal(lightEpicFrame.visual.shieldSpent, 50, '天穹圣裁没有献出一半护盾');
assert.equal(lightEpicFrame.state.player.shield, 50, '天穹圣裁结算帧中的剩余护盾不正确');

const flameEchoId = 'route_special_flame_brawler_rare';
const flameEcho = resolveCards('flame_brawler', [flameEchoId, 'flame_jab']);
const flameJabFrame = cardFrame(flameEcho, 'flame_jab');
assert.equal(flameJabFrame.state.enemy.statuses.find((entry) => entry.id === 'burn')?.stacks, 4, '爆炎续拳没有为炎拳追加灼烧');
assert.equal(flameJabFrame.state.player.routeStatusEcho?.uses, 1, '爆炎续拳的触发次数没有正确扣减');

const shadowTransmuteId = 'route_special_shadow_fist_excellent';
const shadowTransmute = resolveCards('shadow_fist', [shadowTransmuteId], (battle) => {
    battle.enemy.statuses = [{ id: 'poison', stacks: 3, duration: 4 }, { id: 'bleed', stacks: 1, duration: 2 }];
});
const shadowTransmuteFrame = cardFrame(shadowTransmute, shadowTransmuteId);
assert.deepEqual(shadowTransmuteFrame.state.enemy.statuses.find((entry) => entry.id === 'bleed'), { id: 'bleed', stacks: 4, duration: 4 }, '毒血易形没有保留并合并异常层数');
assert.equal(shadowTransmuteFrame.state.enemy.statuses.some((entry) => entry.id === 'poison'), false, '毒血易形后原中毒仍然存在');

const shadowHarvestId = 'route_special_shadow_fist_epic';
const shadowHarvest = resolveCards('shadow_fist', [shadowHarvestId], (battle) => {
    battle.player.mp = 40;
    battle.enemy.stats.physicalDefense = 500;
    battle.enemy.stats.magicalDefense = 500;
    battle.enemy.stats.damageReduction = 60;
    battle.enemy.statuses = [{ id: 'poison', stacks: 3, duration: 4 }, { id: 'bleed', stacks: 2, duration: 4 }];
});
const shadowHarvestFrame = cardFrame(shadowHarvest, shadowHarvestId);
assert.equal(shadowHarvestFrame.visual.statusHarvested, 5, '无间·毒血葬收割层数错误');
assert.equal(shadowHarvestFrame.visual.hpDamage, 100, '无间·毒血葬没有按真实伤害结算');
assert.deepEqual(shadowHarvestFrame.state.enemy.statuses, [], '无间·毒血葬没有清空已收割异常');
assert.equal(shadowHarvestFrame.state.player.mp, 40 - PEAK_CARD_BY_ID[shadowHarvestId].cost + 5, '无间·毒血葬回蓝量错误');

const iceCommonLv10 = resolveCards('ice_shadow', [iceCommonId], (battle) => {
    battle.player.cardLevels[iceCommonId] = 10;
    battle.enemy.statuses = [{ id: 'frozen', stacks: 1, duration: 3 }];
});
assert.equal(cardFrame(iceCommonLv10, iceCommonId).state.player.routeResource.value, 2, '满级寒印归息应获得2层寒霜印记');

const iceRecallLv10 = resolveCards('ice_shadow', [iceRecallId], (battle) => {
    battle.player.cardLevels[iceRecallId] = 10;
    battle.discardPile = [
        { uid: 'discard-ice-one', cardId: 'frost_edge' },
        { uid: 'discard-physical', cardId: 'straight_slash' },
        { uid: 'discard-ice-two', cardId: 'sword_frostbite_edge' },
    ];
});
const iceRecallLv10Frame = cardFrame(iceRecallLv10, iceRecallId);
assert.equal(iceRecallLv10Frame.state.hand.filter((entry) => ['frost_edge', 'sword_frostbite_edge'].includes(entry.cardId)).length, 2, '满级冰轮复写应回收2张冰属性牌');
assert.ok(iceRecallLv10Frame.state.discardPile.some((entry) => entry.cardId === 'straight_slash'), '满级冰轮复写不应回收非冰属性牌');

const iceExtendLv10 = resolveCards('ice_shadow', [iceExtendId], (battle) => {
    battle.player.cardLevels[iceExtendId] = 10;
    battle.enemy.statuses = [{ id: 'frozen', stacks: 1, duration: 3 }];
});
assert.deepEqual(cardFrame(iceExtendLv10, iceExtendId).state.enemy.statuses.find((entry) => entry.id === 'frozen'), { id: 'frozen', stacks: 3, duration: 6 }, '满级霜痕延刻的层数或持续时间成长未生效');

const iceSealLv10 = resolveCards('ice_shadow', [iceSealId, 'frost_edge', 'sword_frostbite_edge'], (battle) => {
    battle.player.cardLevels[iceSealId] = 10;
});
const secondIceFrame = cardFrame(iceSealLv10, 'sword_frostbite_edge');
assert.equal(secondIceFrame.state.player.routeResource.value, secondIceFrame.state.player.routeResource.max, '满级霜狱封印应连续保留两次满层寒霜印记');
assert.equal(secondIceFrame.state.player.routeResourcePreserveUses, 0, '满级霜狱封印的两次保留次数未正确消耗');

const flameEchoLv10 = resolveCards('flame_brawler', [flameEchoId, 'flame_jab'], (battle) => {
    battle.player.cardLevels[flameEchoId] = 10;
});
const flameEchoLv10Frame = cardFrame(flameEchoLv10, 'flame_jab');
assert.equal(flameEchoLv10Frame.state.enemy.statuses.find((entry) => entry.id === 'burn')?.stacks, 5, '满级爆炎续拳应额外追加2层灼烧');
assert.equal(flameEchoLv10Frame.state.player.routeStatusEcho?.uses, 2, '满级爆炎续拳应有3次触发次数');

const flameBloodId = 'route_special_flame_brawler_excellent';
const flameBloodLv1 = cardFrame(resolveCards('flame_brawler', [flameBloodId]), flameBloodId);
const flameBloodLv10 = cardFrame(resolveCards('flame_brawler', [flameBloodId], (battle) => {
    battle.player.cardLevels[flameBloodId] = 10;
}), flameBloodId);
assert.equal(flameBloodLv1.visual.hpDamage, 120, '一级燃血升温应消耗12%当前生命');
assert.equal(flameBloodLv10.visual.hpDamage, 60, '满级燃血升温应只消耗6%当前生命');
assert.ok(flameBloodLv10.visual.hpDamage < flameBloodLv1.visual.hpDamage, '燃血升温升级后生命代价没有降低');

const lightConvertId = 'route_special_light_guardian_excellent';
const lightConvertLv10 = cardFrame(resolveCards('light_guardian', [lightConvertId], (battle) => {
    battle.player.cardLevels[lightConvertId] = 10;
    battle.player.shield = 200;
    battle.player.mp = PEAK_CARD_BY_ID[lightConvertId].cost;
}), lightConvertId);
assert.equal(lightConvertLv10.state.player.mp, 90, '满级辉盾回流应把45%护盾转化为MP');
assert.equal(lightConvertLv10.state.player.shield, 110, '满级辉盾回流扣除的护盾不正确');

console.log('peak duel route specials: passed');
