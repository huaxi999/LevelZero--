import {
    PEAK_ADVANCEMENTS,
    PEAK_CARD_BY_ID,
    PEAK_COMBAT_STATES,
    PEAK_ENEMY_BATTLE_CARD_BY_ID,
    PEAK_STATUS_EFFECTS,
    PEAK_TACTICAL_DECLARATIONS,
    getPeakCardResultState,
    getPeakCardCost,
    getPeakCardEffects,
    validatePeakCardTargetState,
} from './peak-duel-data.js';
import { buildPeakEnemyQueue, summarizePeakEnemyIntent } from './peak-duel-ai.js';
import {
    addPeakStatus,
    applyPeakDamageToCombatant,
    applyPeakStatBuff,
    calculatePeakBuffValue,
    calculatePeakDamage,
    calculatePeakEffectValue,
    cleansePeakStatuses,
    getPeakEffectiveCardLevel,
    getPeakLevelMultiplier,
    expirePeakBuffs as expireBuffs,
    tickPeakTurnEnd,
    tickPeakTurnStart,
} from './peak-duel-combat.js';

export const PEAK_BATTLE_PHASES = ['playerPlanning', 'playerResolving', 'playerDiscarding', 'enemyPlanning', 'enemyResolving', 'victory', 'defeat', 'abandoned'];
export const PEAK_PLAYER_HAND_LIMIT = 12;
export const getPeakPlayerMpRecovery = (maxMp) => Math.max(4, Math.round(Math.max(1, Number(maxMp) || 1) * .07));
export const getPeakEnemyMpRecovery = (maxMp, playerRecovery = 0) => Math.max(8, Math.round(Math.max(1, Number(maxMp) || 1) * .12), Math.max(0, Number(playerRecovery) || 0) + 3);

const emptyRoundHistory = () => ({
    player: { cards: [], stateTransitions: [], hits: 0, damage: 0 },
    enemy: { cards: [], stateTransitions: [], hits: 0, damage: 0 },
});

const ensureRoundHistory = (battle) => {
    battle.roundHistory = battle.roundHistory || emptyRoundHistory();
    ['player', 'enemy'].forEach((side) => {
        battle.roundHistory[side] = battle.roundHistory[side] || { cards: [], stateTransitions: [], hits: 0, damage: 0 };
    });
    return battle.roundHistory;
};

export const hasPeakStateRoute = (transitions = [], route = []) => {
    if (route.length < 2) return false;
    let routeIndex = 0;
    for (const transition of transitions) {
        if (routeIndex === 0 && transition.from === route[0]) routeIndex = 1;
        if (routeIndex > 0 && transition.to === route[routeIndex]) routeIndex += 1;
        else if (transition.from === route[0] && transition.to === route[1]) routeIndex = 2;
        if (routeIndex >= route.length) return true;
    }
    return false;
};

const blessingEffectsFor = (combatant) => combatant?.blessingEffects || {};
const advancementCombatFor = (combatant) => combatant?.advancementCombat || null;
const routeResourceMax = (combatant) => Math.max(0, Math.floor(Number(combatant?.routeResource?.max) || 0));
const routeResourceValue = (combatant) => Math.max(0, Math.floor(Number(combatant?.routeResource?.value) || 0));
const targetHasHarmfulStatus = (combatant) => (combatant?.statuses || []).some((status) => PEAK_STATUS_EFFECTS[status.id]?.harmful);
const gainRouteResource = (combatant, amount) => {
    const resource = combatant?.routeResource;
    const max = routeResourceMax(combatant);
    if (!resource || !max || amount <= 0) return 0;
    const before = routeResourceValue(combatant);
    resource.value = Math.min(max, before + Math.max(0, Math.floor(Number(amount) || 0)));
    return resource.value - before;
};
const statusIdOf = (entry) => entry?.id || entry?.status || '';
const statusEchoFor = (combatant, statusId) => {
    const echo = combatant?.routeStatusEcho;
    return echo?.uses > 0 && echo.statuses?.includes(statusId) ? echo : null;
};
const consumeStatusEcho = (combatant) => {
    if (!combatant?.routeStatusEcho) return;
    combatant.routeStatusEcho.uses -= 1;
    if (combatant.routeStatusEcho.uses <= 0) combatant.routeStatusEcho = null;
};
const SPELL_CHARGE_DEFAULT_MAX = 5;
const spellChargeMax = (combatant) => Math.max(1, Math.floor(Number(combatant?.spellCharge?.max) || SPELL_CHARGE_DEFAULT_MAX));
const spellChargeValue = (combatant) => Math.max(0, Math.floor(Number(combatant?.spellCharge?.value) || 0));
const gainSpellCharge = (combatant, amount) => {
    if (!combatant || amount <= 0) return 0;
    const max = spellChargeMax(combatant);
    const before = spellChargeValue(combatant);
    if (!combatant.spellCharge) combatant.spellCharge = { value: 0, max };
    combatant.spellCharge.max = max;
    combatant.spellCharge.value = Math.min(max, before + Math.max(0, Math.floor(Number(amount) || 0)));
    return combatant.spellCharge.value - before;
};
const routeStatusStackBonus = (combatant, statusId) => {
    const route = advancementCombatFor(combatant);
    const tier = Math.max(0, Number(combatant?.advancement?.tier) || 0);
    if (!route) return 0;
    if (route.resourceId === 'heat' && statusId === 'burn') return tier >= 2 ? route.secondBurnStackBonus || 0 : route.burnStackBonus || 0;
    if (route.resourceId === 'shadow' && ['poison', 'bleed'].includes(statusId)) return tier >= 2 ? route.secondStatusStackBonus || 0 : route.statusStackBonus || 0;
    return 0;
};
export const getPeakBattleCardCost = (battle, side, card, precedingCards = [], instance = null) => {
    const base = getPeakCardCost(card, getPeakEffectiveCardLevel(card, battle[side], side, instance));
    if (side !== 'player') return base;
    const history = [...(battle.roundCards?.[side] || []), ...precedingCards.map((entry) => entry?.cardId ? PEAK_CARD_BY_ID[entry.cardId] : entry).filter(Boolean)];
    const blessing = blessingEffectsFor(battle[side]);
    let cost = base;
    if (!history.length) cost = Math.max(0, cost - Math.max(0, Number(blessing.firstCardMpReduction) || 0));
    if (card?.category === 'skill' && !history.some((entry) => entry.category === 'skill')) {
        cost = Math.ceil(cost * (1 - Math.max(0, Math.min(100, Number(blessing.firstSkillMpDiscount) || 0)) / 100));
    }
    return Math.max(0, cost);
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const elementNames = { fire: '火', ice: '冰', light: '光', dark: '暗' };
const damageTypeNames = { physical: '物理', magical: '魔法', true: '真实' };
const categoryNames = { attack: '进攻', defense: '防守', skill: '技能', buff: '增益', special: '特殊' };
const makeRng = (seed) => {
    let value = (Number(seed) || 1) >>> 0;
    return () => {
        value += 0x6D2B79F5;
        let result = value;
        result = Math.imul(result ^ result >>> 15, result | 1);
        result ^= result + Math.imul(result ^ result >>> 7, result | 61);
        return ((result ^ result >>> 14) >>> 0) / 4294967296;
    };
};

const shuffled = (entries, seed) => {
    const result = [...entries];
    const random = makeRng(seed);
    for (let index = result.length - 1; index > 0; index -= 1) {
        const target = Math.floor(random() * (index + 1));
        [result[index], result[target]] = [result[target], result[index]];
    }
    return result;
};

const makeInstances = (cards, prefix) => cards.map((cardId, index) => ({ uid: `${prefix}-${index}-${cardId}`, cardId }));

const drawFor = (battle, side, amount) => {
    const playerSide = side === 'player';
    const drawKey = playerSide ? 'drawPile' : 'enemyDrawPile';
    const handKey = playerSide ? 'hand' : 'enemyHand';
    const discardKey = playerSide ? 'discardPile' : 'enemyDiscardPile';
    const handLimit = playerSide ? Infinity : 12;
    for (let count = 0; count < amount; count += 1) {
        if (!battle[drawKey].length && battle[discardKey].length) {
            const salt = playerSide ? 97 : 193;
            battle[drawKey] = shuffled(battle[discardKey], battle.seed + battle.round * salt + count);
            battle[discardKey] = [];
        }
        const next = battle[drawKey].pop();
        if (!next) break;
        if (battle[handKey].length >= handLimit) battle[discardKey].push(next);
        else battle[handKey].push(next);
    }
};

const restoreBlessingDrawMp = (combatant, triggered) => {
    if (!triggered) return 0;
    const amount = Math.max(0, Math.floor(Number(blessingEffectsFor(combatant).drawTriggerMp) || 0));
    const restored = Math.min(amount, Math.max(0, combatant.maxMp - combatant.mp));
    combatant.mp += restored;
    return restored;
};

const zoneKeysFor = (side) => side === 'player'
    ? { draw: 'drawPile', hand: 'hand', discard: 'discardPile' }
    : { draw: 'enemyDrawPile', hand: 'enemyHand', discard: 'enemyDiscardPile' };

const recoverDiscardFor = (battle, side, amount, category = '') => {
    const keys = zoneKeysFor(side);
    let recovered = 0;
    const handLimit = side === 'player' ? Infinity : 12;
    while (recovered < amount && battle[keys.discard].length && battle[keys.hand].length < handLimit) {
        const index = category ? battle[keys.discard].findLastIndex((entry) => battleCard(entry, side)?.category === category) : battle[keys.discard].length - 1;
        if (index < 0) break;
        battle[keys.hand].push(...battle[keys.discard].splice(index, 1));
        recovered += 1;
    }
    return recovered;
};

const addGeneratedCardToHand = (battle, side, cardId, levelOverride = 0, options = {}) => {
    const handKey = side === 'player' ? 'hand' : 'enemyHand';
    if (!PEAK_CARD_BY_ID[cardId] || (side !== 'player' && battle[handKey].length >= 12)) return false;
    const historyLength = battle.roundCards?.[side]?.length || 0;
    const instance = { uid: `${side}-generated-${battle.round}-${historyLength}-${battle[handKey].length}-${cardId}`, cardId, generated: true };
    if (Number(levelOverride) > 0) instance.levelOverride = Math.max(1, Math.min(10, Math.floor(Number(levelOverride))));
    if (options.temporary) instance.temporary = true;
    if (options.exhaustAfterUse) instance.exhaustAfterUse = true;
    battle[handKey].push(instance);
    return true;
};

const releaseRecoveryCards = (battle, side, frames) => {
    const zone = Array.isArray(battle.recoveryZone) ? battle.recoveryZone : [];
    if (!zone.length) return [];
    const target = side === 'player' ? battle.enemy : battle.player;
    const released = zone.filter((entry) => entry.states?.includes(target.state));
    if (!released.length) return [];
    battle.recoveryZone = zone.filter((entry) => !released.includes(entry));
    const handKey = side === 'player' ? 'hand' : 'enemyHand';
    released.forEach((entry) => battle[handKey].push({ uid: entry.uid, cardId: entry.cardId, recycledOnce: true, damagePenalty: entry.damagePenalty }));
    const names = released.map((entry) => PEAK_CARD_BY_ID[entry.cardId]?.name || entry.cardId);
    const text = `追击条件达成，「${names.join('」「')}」返回手牌，再次使用时伤害降低。`;
    appendLog(battle, 'recovery', text);
    addFrame(frames, battle, 'system', null, text, 'recovery', 0, { category: 'attack', recoveryCount: released.length });
    return names;
};

const grantScheduledCardsForTurn = (battle, side) => {
    const actor = battle[side];
    const granted = [];
    actor.scheduledCards = (actor.scheduledCards || []).flatMap((entry) => {
        const turns = Math.max(0, Math.floor(Number(entry.turns) || 0) - 1);
        if (turns > 0) return [{ ...entry, turns }];
        if (addGeneratedCardToHand(battle, side, entry.cardId, entry.level || 1, entry)) granted.push(PEAK_CARD_BY_ID[entry.cardId]?.name || entry.cardId);
        return [];
    });
    return granted;
};

const activateNextTurnDamageBoosts = (combatant) => {
    const boosts = Array.isArray(combatant.nextTurnDamageBoosts) ? combatant.nextTurnDamageBoosts : [];
    combatant.roundDamageBoosts = [...(combatant.roundDamageBoosts || []), ...boosts];
    combatant.nextTurnDamageBoosts = [];
    return boosts;
};

const resolveScheduledSpecialHealing = (battle, side, frames) => {
    const actor = battle[side];
    const remaining = [];
    (actor.scheduledSpecialHeals || []).forEach((entry) => {
        const turns = Math.max(0, Math.floor(Number(entry.turns) || 0) - 1);
        if (turns > 0) {
            remaining.push({ ...entry, turns });
            return;
        }
        if (actor.hp <= 0) return;
        const restored = Math.min(Math.max(0, Math.round(Number(entry.amount) || 0)), actor.maxHp - actor.hp);
        actor.hp += restored;
        const text = `${side === 'player' ? '伤势回拨' : actor.name}在回合开始时恢复${restored}点生命。`;
        appendLog(battle, 'special', text);
        addFrame(frames, battle, side, null, text, 'special', 0, { category: 'special', healingTarget: side, healing: restored });
    });
    actor.scheduledSpecialHeals = remaining;
};

const drawCategoryFor = (battle, side, category, amount) => {
    const keys = zoneKeysFor(side);
    let drawn = 0;
    const handLimit = side === 'player' ? Infinity : 12;
    while (drawn < amount && battle[keys.hand].length < handLimit) {
        if (!battle[keys.draw].length && battle[keys.discard].length) {
            battle[keys.draw] = shuffled(battle[keys.discard], battle.seed + battle.round * 311 + drawn);
            battle[keys.discard] = [];
        }
        let matchIndex = -1;
        for (let index = battle[keys.draw].length - 1; index >= 0; index -= 1) {
            if (battleCard(battle[keys.draw][index], side)?.category === category) { matchIndex = index; break; }
        }
        if (matchIndex < 0) break;
        const [match] = battle[keys.draw].splice(matchIndex, 1);
        battle[keys.hand].push(match);
        drawn += 1;
    }
    return drawn;
};

const drawRandomCategoriesFor = (battle, side, categories, amount) => {
    const keys = zoneKeysFor(side);
    const allowed = new Set(categories || []);
    const handLimit = side === 'player' ? Infinity : 12;
    let drawn = 0;
    while (drawn < amount && battle[keys.hand].length < handLimit) {
        if (!battle[keys.draw].length && battle[keys.discard].length) {
            battle[keys.draw] = shuffled(battle[keys.discard], battle.seed + battle.round * 353 + drawn);
            battle[keys.discard] = [];
        }
        const matches = battle[keys.draw].flatMap((instance, index) => allowed.has(battleCard(instance, side)?.category) ? [index] : []);
        if (!matches.length) break;
        const matchIndex = matches[Math.min(matches.length - 1, Math.floor(nextBattleRandom(battle) * matches.length))];
        const [match] = battle[keys.draw].splice(matchIndex, 1);
        battle[keys.hand].push(match);
        drawn += 1;
    }
    return drawn;
};

const retainShieldForNextRound = (combatant) => {
    const blessing = blessingEffectsFor(combatant);
    const ratio = Math.max(0, Math.min(100, Math.max(Number(combatant.shieldRetention) || 0, Number(combatant.baseShieldRetention) || 0, Number(blessing.shieldRetentionPercent) || 0)));
    const amplification = 1 + Math.max(0, Math.min(50, Number(blessing.shieldCarryAmplify) || 0)) / 100;
    const retained = Math.min(Number(combatant.maxHp) || Infinity, Math.max(0, Math.round((Number(combatant.shield) || 0) * ratio / 100 * amplification)));
    combatant.shield = retained;
    combatant.shieldRetention = Math.max(0, Number(combatant.baseShieldRetention) || 0);
    return retained;
};

const appendLog = (battle, type, text) => {
    battle.log.push({ type, text, round: battle.round });
    battle.log = battle.log.slice(-80);
};

const battleCard = (instance, actor) => actor === 'player' ? PEAK_CARD_BY_ID[instance?.cardId] : PEAK_ENEMY_BATTLE_CARD_BY_ID[instance?.cardId];
const nextBattleRandom = (battle) => {
    const value = makeRng(battle.seed + battle.randomCounter * 2654435761)();
    battle.randomCounter += 1;
    return value;
};

const addFrame = (frames, battle, actor, card, text, kind = 'card', cardLevel = 0, visual = null) => {
    frames.push({ actor, cardId: card?.id || '', cardName: card?.name || '', cardLevel, text, kind, visual: visual ? clone(visual) : null, state: clone(battle) });
};

const addBossDefeatedFrame = (frames, battle) => {
    if (!battle.enemy?.isBoss) return false;
    const text = `首领${battle.enemy.name}已被击破。`;
    appendLog(battle, 'bossDefeated', text);
    addFrame(frames, battle, 'player', null, text, 'bossDefeated');
    return true;
};

const queueCardsFor = (battle, actorKey, currentCard) => {
    const queue = actorKey === 'player' ? battle.queue : battle.enemyQueue;
    const cards = (queue || []).map((instance) => battleCard(instance, actorKey)).filter(Boolean);
    return cards.length ? cards : [currentCard];
};

const isRecoveryCard = (card) => card.effects?.some((effect) =>
    ['heal', 'healMissing', 'restoreMp'].includes(effect.type)
    || (effect.type === 'status' && effect.status === 'regeneration')
    || (effect.type === 'shieldBreak' && Number(effect.healPercent) > 0));

const queueConditionMatches = (cards, condition, categoryCount) => {
    if (!condition) return false;
    if (condition.type === 'exclude') return !cards.some((card) =>
        condition.categories?.includes(card.category)
        || (condition.excludeRecovery && isRecoveryCard(card))
        || card.effects?.some((effect) => condition.effectTypes?.includes(effect.type)));
    if (condition.type === 'allCategory') return cards.length > 0 && cards.every((card) => card.category === condition.category);
    if (condition.type === 'includesCategories') {
        const categories = new Set(cards.map((card) => card.category));
        return (condition.categories || []).every((category) => categories.has(category));
    }
    if (condition.type === 'distinctCategoriesAtLeast') return categoryCount >= Math.max(1, Number(condition.count) || 1);
    if (condition.type === 'variety') return categoryCount >= Math.max(1, Number(condition.minimum) || 1);
    return false;
};

const resolveQueueMechanic = (battle, actorKey, card) => {
    const mechanic = card.queueMechanic;
    if (!mechanic) return { triggered: false, categoryCount: 0, damageBonus: 0, reward: null };
    const cards = queueCardsFor(battle, actorKey, card);
    const categoryCount = new Set(cards.map((entry) => entry.category)).size;
    const triggered = queueConditionMatches(cards, mechanic.condition, categoryCount);
    let damageBonus = triggered ? Math.max(0, Number(mechanic.damageBonus) || 0) : 0;
    if (triggered && mechanic.damageByCategoryCount) {
        const matchingThreshold = Object.keys(mechanic.damageByCategoryCount)
            .map(Number)
            .filter((count) => count <= categoryCount)
            .sort((left, right) => right - left)[0];
        damageBonus = Math.max(0, Number(mechanic.damageByCategoryCount[matchingThreshold]) || 0);
    }
    return { triggered, categoryCount, damageBonus, reward: triggered ? mechanic.reward || null : null };
};

const conditionalDamageBonus = (battle, actorKey, targetKey, card) => {
    const rule = card.conditionalDamage;
    if (!rule) return 0;
    const actor = battle[actorKey];
    const target = battle[targetKey];
    if (rule.type === 'targetHpAbove') return target.hp / Math.max(1, target.maxHp) > rule.threshold ? rule.bonus : 0;
    if (rule.type === 'targetHpBelow') return target.hp / Math.max(1, target.maxHp) < rule.threshold ? rule.bonus : 0;
    if (rule.type === 'targetHasShield') return target.shield > 0 ? rule.bonus : 0;
    if (rule.type === 'actorHpBelow') return actor.hp / Math.max(1, actor.maxHp) < rule.threshold ? rule.bonus : 0;
    if (rule.type === 'targetState') return rule.states?.includes(target.state) ? rule.bonus : 0;
    if (rule.type === 'priorAttackStyleOnly') {
        const history = battle.roundCards?.[actorKey] || [];
        return history.length > 0 && history.every((entry) => entry.category === 'attack' && entry.attackStyle === rule.style) ? rule.bonus : 0;
    }
    const history = battle.roundCards?.[actorKey] || [];
    if (rule.type === 'queuePositionAtLeast') return history.length + 1 >= rule.position ? rule.bonus : 0;
    if (rule.type === 'queuePositionEquals') return history.length + 1 === rule.position ? rule.bonus : 0;
    if (rule.type === 'previousResultState') return rule.states?.includes(history.at(-1)?.resultState) ? rule.bonus : 0;
    if (rule.type === 'targetHasStatus') return (target.statuses || []).some((status) => rule.statuses?.includes(status.id)) ? rule.bonus : 0;
    if (rule.type === 'distinctAttackStyles') {
        const styles = new Set(history.filter((entry) => entry.category === 'attack' && entry.attackStyle).map((entry) => entry.attackStyle));
        return styles.size >= rule.count ? rule.bonus : 0;
    }
    if (rule.type === 'previousElement') return history.at(-1)?.elements?.includes(rule.element) ? rule.bonus : 0;
    if (rule.type === 'distinctElements') {
        const elements = new Set(history.flatMap((entry) => entry.elements || []));
        return elements.size >= rule.count ? rule.bonus : 0;
    }
    if (rule.type === 'mpSpentRatio') return history.reduce((sum, entry) => sum + (Number(entry.cost) || 0), 0) / Math.max(1, actor.maxMp) >= rule.threshold ? rule.bonus : 0;
    if (rule.type === 'actorShieldRatio') return actor.shield / Math.max(1, actor.maxHp) >= rule.threshold ? rule.bonus : 0;
    return 0;
};

const dynamicBuffBonus = (battle, actorKey, targetKey, effect) => {
    const rule = effect.dynamic;
    if (!rule) return 0;
    const actor = battle[actorKey];
    const target = battle[targetKey];
    const history = battle.roundCards?.[actorKey] || [];
    if (rule.type === 'firstCard') return history.length === 0 ? rule.bonus : 0;
    if (rule.type === 'targetState') return rule.states?.includes(target.state) ? rule.bonus : 0;
    if (rule.type === 'distinctAttackStyles') {
        const styles = new Set(history.filter((entry) => entry.category === 'attack' && entry.attackStyle).map((entry) => entry.attackStyle));
        return styles.size >= rule.count ? rule.bonus : 0;
    }
    if (rule.type === 'mpSpentRatio') return history.reduce((sum, entry) => sum + (Number(entry.cost) || 0), 0) / Math.max(1, actor.maxMp) >= rule.threshold ? rule.bonus : 0;
    if (rule.type === 'actorShieldRatio') return actor.shield / Math.max(1, actor.maxHp) >= rule.threshold ? rule.bonus : 0;
    return 0;
};

const scaledRangeValue = (effect, level, minKey, maxKey) => {
    const minimum = Number(effect[minKey]) || 0;
    const maximum = Number(effect[maxKey]) || minimum;
    return minimum + (maximum - minimum) * Math.max(0, Math.min(9, level - 1)) / 9;
};
const scaledRangeOrFixedValue = (effect, level, minKey, maxKey, fixedKey = 'value') => (
    Object.prototype.hasOwnProperty.call(effect, minKey)
        ? scaledRangeValue(effect, level, minKey, maxKey)
        : Number(effect[fixedKey]) || 0
);

const consumeCardDisruption = (combatant, category) => {
    combatant.cardDisruptions = Array.isArray(combatant.cardDisruptions) ? combatant.cardDisruptions : [];
    const matching = combatant.cardDisruptions.filter((entry) => entry.categories?.includes(category));
    const disruption = matching.find((entry) => entry.all) || matching.find((entry) => entry.charges > 0);
    if (!disruption) return null;
    if (!disruption.all) disruption.charges -= 1;
    combatant.cardDisruptions = combatant.cardDisruptions.filter((entry) => entry.all || entry.charges > 0);
    return disruption;
};

const finishTurnSpecialEffects = (battle, side, frames) => {
    const actor = battle[side];
    const disruptions = Array.isArray(actor.cardDisruptions) ? actor.cardDisruptions : [];
    const discardCategories = new Set(disruptions.filter((entry) => entry.discardAtTurnEnd).flatMap((entry) => entry.categories || []));
    if (discardCategories.size) {
        const handKey = side === 'player' ? 'hand' : 'enemyHand';
        const discardKey = side === 'player' ? 'discardPile' : 'enemyDiscardPile';
        const discarded = battle[handKey].filter((instance) => discardCategories.has(battleCard(instance, side)?.category));
        battle[handKey] = battle[handKey].filter((instance) => !discardCategories.has(battleCard(instance, side)?.category));
        battle[discardKey].push(...discarded);
        if (discarded.length) {
            const text = `${actor.name}${side === 'player' ? '' : '在回合结束时'}被迫丢弃${discarded.length}张增益/防守手牌。`;
            appendLog(battle, 'discard', text);
            addFrame(frames, battle, 'system', null, text, 'discard');
        }
    }
    actor.cardDisruptions = [];
    if (actor.handReserveShield) {
        const handKey = side === 'player' ? 'hand' : 'enemyHand';
        const counted = Math.min(actor.handReserveShield.cap, battle[handKey].length);
        const gained = counted * actor.handReserveShield.perCard;
        actor.shield += gained;
        const text = `${side === 'player' ? '留牌成盾' : actor.name}按${counted}张保留手牌获得${gained}点护盾。`;
        appendLog(battle, 'special', text);
        addFrame(frames, battle, side, null, text, 'special', 0, { category: 'special', target: side, shieldGained: gained, cardsCounted: counted });
        actor.handReserveShield = null;
    }
    if (actor.tacticalRewind) {
        const lastCard = [...(battle.roundCards?.[side] || [])].reverse().find((entry) => entry.category !== 'special' && PEAK_CARD_BY_ID[entry.cardId]);
        if (lastCard) {
            actor.scheduledCards = Array.isArray(actor.scheduledCards) ? actor.scheduledCards : [];
            actor.scheduledCards.push({ cardId: lastCard.cardId, turns: 1, level: lastCard.level || 1, temporary: true, exhaustAfterUse: true });
            const text = `战术回溯记录「${PEAK_CARD_BY_ID[lastCard.cardId].name}」，下回合获得其Lv.${lastCard.level || 1}临时复制。`;
            appendLog(battle, 'special', text);
            addFrame(frames, battle, side, null, text, 'special', 0, { category: 'special', rewoundCardId: lastCard.cardId });
        }
        actor.tacticalRewind = null;
    }
    if (actor.spentMpShield) {
        const effect = actor.spentMpShield;
        const fromSpentMp = Math.max(0, Math.round(effect.spent * effect.ratio / 100));
        const cap = Math.max(0, Math.round(actor.maxHp * effect.capPercent / 100));
        const gained = Math.min(fromSpentMp, cap);
        actor.shield += gained;
        if (gained > 0) {
            const text = `${side === 'player' ? '魔力铸甲' : actor.name}将本回合消耗的${effect.spent}MP转化为${gained}点护盾。`;
            appendLog(battle, 'special', text);
            addFrame(frames, battle, side, null, text, 'special', 0, { category: 'special', target: side, shieldGained: gained });
        }
        actor.spentMpShield = null;
    }
    const conversionPercent = Math.max(0, Math.min(100, Number(blessingEffectsFor(actor).endTurnMpShieldPercent) || 0));
    if (conversionPercent > 0 && actor.mp > 0) {
        const converted = Math.max(0, Math.floor(actor.mp * conversionPercent / 100));
        actor.mp -= converted;
        actor.shield += converted;
        if (converted > 0) {
            const text = `${side === 'player' ? '灵能转化' : actor.name}消耗${converted}MP并获得${converted}点护盾。`;
            appendLog(battle, 'blessing', text);
            addFrame(frames, battle, side, null, text, 'blessing', 0, { category: 'blessing', target: side, shieldGained: converted });
        }
    }
    if (actor.debuffImmunity) {
        if (actor.debuffImmunity.skipFirstEnd) actor.debuffImmunity.skipFirstEnd = false;
        else {
            actor.debuffImmunity.duration -= 1;
            if (actor.debuffImmunity.duration <= 0) actor.debuffImmunity = null;
        }
    }
};

const resetRoundSpecialEffects = (combatant) => {
    combatant.roundDamageBoosts = [];
    combatant.roundPenetration = null;
    combatant.roundTradeoff = null;
    combatant.damageConversions = [];
    combatant.shieldVanguard = null;
    combatant.unstableMagic = null;
    combatant.nullifyInsurance = null;
    combatant.overhealShieldRatio = 0;
    combatant.spentMpShield = null;
    combatant.damageEcho = null;
    combatant.handReserveShield = null;
    combatant.forecastGuard = null;
    combatant.tacticalRewind = null;
    combatant.trueDamageConversion = null;
    combatant.routeResourcePreserveUses = 0;
    combatant.routeStatusEcho = null;
};

const resolveBombAtTurnStart = (battle, side, frames) => {
    const bomb = battle.bomb;
    if (!bomb || bomb.holder !== side) return false;
    const holder = battle[side];
    const owner = side === 'player' ? '你' : holder.name;
    if (nextBattleRandom(battle) * 100 >= Math.max(0, Math.min(100, Number(bomb.chance) || 25))) {
        battle.bomb = { ...bomb, holder: side === 'player' ? 'enemy' : 'player' };
        const passText = `${owner}身上的蹦蹦炸弹没有爆炸，被传给了${side === 'player' ? battle.enemy.name : '你'}。`;
        appendLog(battle, 'bomb', passText);
        addFrame(frames, battle, side, null, passText, 'bomb', 0, { category: 'special', bombPassed: true });
        return false;
    }
    const ratio = Math.max(0, Number(bomb.ratio) || 0) * (holder.isBoss ? Number(bomb.bossFactor) || .5 : 1);
    const amount = Math.max(1, Math.round(holder.maxHp * ratio / 100));
    const received = applyPeakDamageToCombatant(holder, amount);
    battle.bomb = null;
    const text = received.phoenixTriggered
        ? `蹦蹦炸弹在${owner}身上爆炸，但浴火金身无视了这次致命伤害。`
        : `蹦蹦炸弹在${owner}身上爆炸，造成${received.hpDamage + received.absorbed}点伤害${holder.isBoss ? '（Boss效果减半）' : ''}。`;
    appendLog(battle, 'bomb', text);
    addFrame(frames, battle, side, null, text, 'bomb', 0, {
        category: 'special',
        target: side,
        hpDamage: received.hpDamage,
        shieldDamage: received.absorbed,
        healing: 0,
        element: 'fire',
        bombExploded: true,
        phoenixTriggered: Boolean(received.phoenixTriggered),
        phoenixTarget: received.phoenixTriggered ? side : '',
        lastStand: Boolean(received.lastStandShield),
    });
    return true;
};

const resolveTimedFusesAtTurnStart = (battle, side, frames) => {
    const holder = battle[side];
    const fuses = Array.isArray(holder?.timedFuses) ? holder.timedFuses : [];
    if (!fuses.length) return false;
    const owner = side === 'player' ? '你' : holder.name;
    const remaining = [];
    let detonated = false;
    fuses.forEach((fuse) => {
        const turns = Math.max(0, Math.floor(Number(fuse.turns) || 0)) - 1;
        if (turns > 0) {
            remaining.push({ ...fuse, turns });
            return;
        }
        if (holder.hp <= 0) return;
        const amount = Math.max(1, Math.round(Number(fuse.damage) || 0));
        const received = applyPeakDamageToCombatant(holder, amount);
        detonated = true;
        const label = fuse.name || '延迟引爆';
        const text = received.phoenixTriggered
            ? `${label}在${owner}身上引爆，但浴火金身无视了这次致命伤害。`
            : `${label}在${owner}身上引爆，造成${received.hpDamage + received.absorbed}点伤害。`;
        appendLog(battle, 'fuse', text);
        addFrame(frames, battle, side, null, text, 'fuse', 0, {
            category: 'skill',
            target: side,
            hpDamage: received.hpDamage,
            shieldDamage: received.absorbed,
            healing: 0,
            element: fuse.element || '',
            fuseDetonated: true,
            phoenixTriggered: Boolean(received.phoenixTriggered),
            phoenixTarget: received.phoenixTriggered ? side : '',
            lastStand: Boolean(received.lastStandShield),
        });
    });
    holder.timedFuses = remaining;
    return detonated;
};

const resolveBlessedSchedulesAtTurnStart = (battle, side, frames) => {
    const holder = battle[side];
    const schedules = Array.isArray(holder?.blessedSchedules) ? holder.blessedSchedules : [];
    if (!schedules.length) return false;
    const owner = side === 'player' ? '你' : holder.name;
    const remaining = [];
    let triggered = false;
    schedules.forEach((schedule) => {
        const turns = Math.max(0, Math.floor(Number(schedule.turns) || 0)) - 1;
        if (turns > 0) {
            remaining.push({ ...schedule, turns });
            return;
        }
        if (holder.hp <= 0) return;
        triggered = true;
        const value = Math.max(1, Math.floor(Number(schedule.value) || 0));
        const label = schedule.name || '祝福';
        if (schedule.type === 'heal') {
            const before = holder.hp;
            holder.hp = Math.min(holder.maxHp, holder.hp + value);
            const healed = holder.hp - before;
            const text = `${label}在${owner}身上生效，恢复${healed}点生命。`;
            appendLog(battle, 'blessing', text);
            addFrame(frames, battle, side, null, text, 'blessing', 0, {
                category: 'defense',
                target: side,
                hpDamage: 0,
                shieldDamage: 0,
                healing: healed,
                element: '',
            });
        } else if (schedule.type === 'shield') {
            holder.shield += value;
            const text = `${label}在${owner}身上生效，获得${value}点护盾。`;
            appendLog(battle, 'blessing', text);
            addFrame(frames, battle, side, null, text, 'blessing', 0, {
                category: 'defense',
                target: side,
                hpDamage: 0,
                shieldDamage: 0,
                healing: 0,
                shieldGained: value,
                element: '',
            });
        } else if (schedule.type === 'cleanse') {
            const removed = cleansePeakStatuses(holder, value);
            const text = removed.length ? `${label}在${owner}身上生效，净化${removed.length}个负面状态。` : `${label}生效但无负面状态可净化。`;
            appendLog(battle, 'blessing', text);
            addFrame(frames, battle, side, null, text, 'blessing', 0, {
                category: 'defense',
                target: side,
                hpDamage: 0,
                shieldDamage: 0,
                healing: 0,
                element: '',
            });
        }
    });
    holder.blessedSchedules = remaining;
    return triggered;
};

const applyCard = (battle, actorKey, targetKey, instance, card, frames) => {
    const actor = battle[actorKey];
    const target = battle[targetKey];
    const roundHistory = battle.roundCards?.[actorKey] || [];
    const blessing = blessingEffectsFor(actor);
    const cardPosition = roundHistory.length + 1;
    const firstAttack = card.category === 'attack' && !roundHistory.some((entry) => entry.category === 'attack');
    const priorAttackCount = roundHistory.filter((entry) => entry.category === (card.positionScaling?.category || 'attack')).length;
    const positionDamageBonus = card.positionScaling ? Math.min(card.positionScaling.maxStacks || 99, priorAttackCount) * Math.max(0, Number(card.positionScaling.perPrior) || 0) : 0;
    const previousStyle = roundHistory.at(-1)?.attackStyle || '';
    const styleFollowRule = card.styleFollowUp?.[previousStyle] || null;
    const trailingStyleCount = card.consumeStyleChain ? [...roundHistory].reverse().findIndex((entry) => entry.category !== 'attack' || entry.attackStyle !== card.consumeStyleChain.style) : -1;
    const styleChainCount = card.consumeStyleChain ? (trailingStyleCount < 0 ? roundHistory.length : trailingStyleCount) : 0;
    const finisherMarkReady = Boolean(card.consumeStyleChain && styleChainCount >= card.consumeStyleChain.threshold);
    const resolvedMpCost = getPeakBattleCardCost(battle, actorKey, card, [], instance);
    const forcedLevel = Math.floor(Number(instance?.levelOverride) || 0);
    const level = getPeakEffectiveCardLevel(card, actor, actorKey, instance);
    card = { ...card, effects: getPeakCardEffects(card, level) };
    const conditionalBonus = conditionalDamageBonus(battle, actorKey, targetKey, card);
    const queueMechanic = resolveQueueMechanic(battle, actorKey, card);
    const empowerment = (actor.empowerments || []).find((entry) => entry.category === card.category && entry.uses > 0);
    const empowerBonus = Math.max(0, Number(empowerment?.value) || 0) / 100;
    const defenseEmpowerMultiplier = card.category === 'defense' ? 1 + empowerBonus : 1;
    const cardDisruption = consumeCardDisruption(actor, card.category);
    const nullifiedByDisruption = Boolean(cardDisruption);
    const nullifiedByStun = (Number(actor.stunCharges) || 0) > 0;
    if (nullifiedByStun) {
        actor.stunCharges = Math.max(0, actor.stunCharges - 1);
        if (actor.state === 'stunned') actor.state = 'standing';
    }
    actor.mp = Math.max(0, (Number(actor.mp) || 0) - resolvedMpCost);
    const messages = [];
    const routeCombat = advancementCombatFor(actor);
    const routeResource = actor.routeResource;
    const routeTier = Math.max(0, Math.floor(Number(actor.advancement?.tier) || 0));
    const damageEffects = card.effects.filter((effect) => effect.type === 'damage');
    const hasIceDamage = damageEffects.some((effect) => effect.element === 'ice');
    const isOffenseCard = ['attack', 'skill'].includes(card.category) && damageEffects.length > 0;
    const routeCanSpend = routeCombat?.spend === 'iceDamage' ? hasIceDamage
        : routeCombat?.spend === 'offenseCard' ? isOffenseCard
            : routeCombat?.spend === 'debuffedTarget' ? isOffenseCard && targetHasHarmfulStatus(target)
                : false;
    const routeResourceBefore = routeResourceValue(actor);
    const routeResourceSpent = Boolean(routeCombat && routeResource && routeCanSpend
        && routeResourceBefore >= routeResourceMax(actor) && !nullifiedByStun && !nullifiedByDisruption);
    const routeDamageBonus = routeResourceSpent
        ? Math.max(0, Number(routeTier >= 2 ? routeCombat.secondBonus : routeCombat.firstBonus) || 0) / 100
        : 0;
    const spellChargeSpendEffect = card.effects.find((effect) => effect.type === 'spellChargeSpend');
    const spellChargeStacksSpent = spellChargeSpendEffect && !nullifiedByStun && !nullifiedByDisruption
        ? spellChargeValue(actor)
        : 0;
    const spellChargeDamageBonus = spellChargeStacksSpent > 0
        ? spellChargeStacksSpent * Math.max(0, Number(spellChargeSpendEffect.perCharge) || 0) / 100
        : 0;
    const vowSpendEffect = card.effects.find((effect) => effect.type === 'vowSpend');
    const vowStacksSpent = vowSpendEffect && !nullifiedByStun && !nullifiedByDisruption
        ? Math.max(0, Math.floor(Number(actor.vow?.stacks) || 0))
        : 0;
    const vowDamageBonus = vowStacksSpent > 0
        ? vowStacksSpent * Math.max(0, Math.min(30, Math.floor(Number(vowSpendEffect.perStack) || 5))) / 100
        : 0;
    const bleedAmplifyEffect = card.effects.find((effect) => effect.type === 'bleedAmplify');
    const bleedStacksRead = bleedAmplifyEffect && !nullifiedByStun && !nullifiedByDisruption
        ? (target.statuses || []).filter((entry) => statusIdOf(entry) === 'bleed').reduce((sum, entry) => sum + (Number(entry.stacks) || 0), 0)
        : 0;
    const bleedAmplifyBonus = bleedStacksRead > 0
        ? Math.min(Math.max(0, Math.floor(Number(bleedAmplifyEffect.maxStacks) || 5)), bleedStacksRead)
            * Math.max(0, Math.min(20, Math.floor(Number(bleedAmplifyEffect.perStack) || 5))) / 100
        : 0;
    const comboEscalateEffect = card.effects.find((effect) => effect.type === 'comboEscalate');
    let comboChainLength = 0;
    if (comboEscalateEffect && !nullifiedByStun && !nullifiedByDisruption) {
        for (let index = roundHistory.length - 1; index >= 0; index -= 1) {
            if (roundHistory[index]?.category !== 'attack') break;
            comboChainLength += 1;
        }
    }
    const comboEscalateBonus = comboChainLength > 0
        ? Math.min(Math.max(1, Math.floor(Number(comboEscalateEffect.maxCards) || 4)), comboChainLength)
            * Math.max(0, Math.min(20, Math.floor(Number(comboEscalateEffect.perCard) || 6))) / 100
        : 0;
    const bleedHarvestEffect = card.effects.find((effect) => effect.type === 'bleedHarvest');
    const bleedHarvestStacksRead = bleedHarvestEffect && !nullifiedByStun && !nullifiedByDisruption
        ? (target.statuses || []).filter((entry) => statusIdOf(entry) === 'bleed').reduce((sum, entry) => sum + (Number(entry.stacks) || 0), 0)
        : 0;
    const bleedHarvestStacks = bleedHarvestStacksRead > 0
        ? Math.min(Math.max(0, Math.floor(Number(bleedHarvestEffect.maxStacks) || 5)), bleedHarvestStacksRead)
        : 0;
    const arcaneCascadeEffect = card.effects.find((effect) => effect.type === 'arcaneCascade');
    const arcaneCascadeChargesRead = arcaneCascadeEffect && !nullifiedByStun && !nullifiedByDisruption
        ? spellChargeValue(actor)
        : 0;
    const arcaneCascadeCharges = arcaneCascadeChargesRead > 0
        ? Math.min(Math.max(0, Math.floor(Number(arcaneCascadeEffect.maxCharges) || SPELL_CHARGE_DEFAULT_MAX)), arcaneCascadeChargesRead)
        : 0;
    if (actor.spentMpShield?.categories?.includes(card.category)) actor.spentMpShield.spent += resolvedMpCost;
    if (card.category !== 'special' && (nullifiedByStun || nullifiedByDisruption) && actor.nullifyInsurance?.uses > 0) {
        const refund = Math.min(actor.maxMp - actor.mp, Math.max(0, Math.round(resolvedMpCost * actor.nullifyInsurance.refund / 100)));
        actor.mp += refund;
        actor.nullifyInsurance.uses -= 1;
        if (actor.nullifyInsurance.uses <= 0) actor.nullifyInsurance = null;
        const handKey = actorKey === 'player' ? 'hand' : 'enemyHand';
        instance.returnedToHand = true;
        const returnedInstance = { ...instance };
        delete returnedInstance.returnedToHand;
        battle[handKey].push(returnedInstance);
        messages.push(`应变预案将本牌返回手牌并返还${refund}MP`);
    }
    const damageEcho = actor.damageEcho?.uses > 0
        && actor.damageEcho.categories?.includes(card.category)
        && card.effects.some((effect) => effect.type === 'damage')
        ? actor.damageEcho
        : null;
    const trueDamageConversion = actor.trueDamageConversion?.uses > 0
        && actor.trueDamageConversion.categories?.includes(card.category)
        && card.effects.some((effect) => effect.type === 'damage')
        ? actor.trueDamageConversion
        : null;
    const forecastGuard = target.forecastGuard?.uses > 0
        && target.forecastGuard.categories?.includes(card.category)
        && card.effects.some((effect) => effect.type === 'damage')
        ? target.forecastGuard
        : null;
    const visual = {
        category: card.category || '',
        rarity: card.rarity || '',
        attackStyle: card.attackStyle || '',
        target: '',
        healingTarget: '',
        healingJudgment: 0,
        hpDamage: 0,
        shieldDamage: 0,
        healing: 0,
        critical: false,
        element: '',
        stateTarget: '',
        stateApplied: '',
        statusTarget: '',
        statusesApplied: [],
        guardReduction: 0,
        dodgeTarget: '',
        counterDamage: 0,
        manaAbsorbed: 0,
        damageCapped: 0,
        thornsDamage: 0,
        shieldBreakTriggered: false,
        lastStand: false,
        statusBlocked: '',
        nullifiedByStun,
        nullifiedByDisruption,
        phoenixTriggered: false,
        phoenixTarget: '',
        unstableRoll: 0,
        unstableHeal: 0,
        unstableDrain: 0,
        delayedDamage: 0,
        echoDamage: 0,
        hitIndex: 0,
        hitCount: 0,
        hitResults: [],
        queueMechanicTriggered: false,
        queueCategoryCount: queueMechanic.categoryCount,
        forecastPrevented: 0,
        forecastShield: 0,
        trueDamageConverted: false,
        conditionalShield: 0,
        shieldGained: 0,
        routeResourceId: routeResource?.id || '',
        routeResourceName: routeResource?.name || '',
        routeResourceBefore,
        routeResourceAfter: routeResourceBefore,
        routeResourceGained: 0,
        routeResourceConsumed: false,
        routeDamageBonus: Math.round(routeDamageBonus * 100),
    };
    let conditionReported = false;
    let dealtDamage = false;
    let phoenixTriggeredThisCard = false;
    let forecastPrevented = 0;
    let drawnSwordSuppressionReported = false;
    let drawnSwordBonusReported = false;
    let resolvedDamageHits = 0;
    let harmfulStatusesAppliedToTarget = 0;
    card.effects.forEach((effect) => {
        if (nullifiedByDisruption) return;
        if (nullifiedByStun && effect.type !== 'setState') return;
        if (actor.drawnSword && card.category === 'skill' && ['damage', 'delayedBurst'].includes(effect.type)) {
            if (!drawnSwordSuppressionReported) messages.push('亮出你的剑使技能牌伤害变为0，其他效果继续结算');
            drawnSwordSuppressionReported = true;
            return;
        }
        if (effect.type === 'damage') {
            const originalDamageType = effect.damageType || 'physical';
            const conversion = trueDamageConversion ? null : [...(actor.damageConversions || [])].reverse().find((entry) => entry.from === originalDamageType);
            const resolvedEffect = trueDamageConversion ? { ...effect, damageType: 'true' } : conversion ? { ...effect, damageType: conversion.to } : effect;
            const firstAttackCritDamage = firstAttack ? Math.max(0, Number(blessing.firstAttackCritDamage) || 0) : 0;
            const damageActor = actor.roundPenetration || firstAttackCritDamage ? {
                ...actor,
                stats: {
                    ...actor.stats,
                    criticalDamage: (Number(actor.stats?.criticalDamage) || 0) + firstAttackCritDamage,
                    physicalPenetration: (Number(actor.stats?.physicalPenetration) || 0) + (Number(actor.roundPenetration?.physical) || 0),
                    magicalPenetration: (Number(actor.stats?.magicalPenetration) || 0) + (Number(actor.roundPenetration?.magical) || 0),
                },
            } : actor;
            const result = calculatePeakDamage({
                effect: resolvedEffect,
                card,
                level,
                actor: damageActor,
                target,
                random: () => nextBattleRandom(battle),
                forceCritical: firstAttack && Boolean(blessing.firstAttackGuaranteedCrit),
            });
            const roundDamageBonus = (actor.roundDamageBoosts || []).filter((entry) => (
                (entry.damageType === result.damageType || entry.damageType === 'all')
                && (!entry.classId || entry.classId === card.classId)
                && (!entry.categories?.length || entry.categories.includes(card.category))
            )).reduce((sum, entry) => sum + Math.max(0, Number(entry.value) || 0), 0) / 100;
            const tradeoffPenalty = Math.max(0, Number(actor.roundTradeoff?.damagePenalty) || 0) / 100;
            const instanceBonus = Math.max(0, Number(instance?.damageBonus) || 0) / 100;
            const breakBonus = actor.shieldVanguard?.activated ? Math.max(0, Number(actor.shieldVanguard.breakBonus) || 0) / 100 : 0;
            const conversionBonus = Math.max(0, Number(conversion?.bonus) || 0) / 100;
            const blessingDamageBonus = (Math.max(0, Number(blessing.categoryDamageBonuses?.[card.category]) || 0) + Math.max(0, Number(blessing.queueDamageBonuses?.[cardPosition]) || 0)) / 100;
            const mechanicDamageBonus = (positionDamageBonus + Math.max(0, Number(styleFollowRule?.damageBonus) || 0) + (finisherMarkReady ? Math.max(0, Number(card.consumeStyleChain.damageBonus) || 0) : 0)) / 100;
            const drawnSwordAttackBonus = actor.drawnSword && card.category === 'attack' ? Math.max(0, Number(actor.drawnSword.attackBonus) || 0) / 100 : 0;
            const recyclePenalty = Math.max(0, Math.min(80, Number(instance?.damagePenalty) || 0)) / 100;
            const totalMultiplier = Math.max(.1, 1 + conditionalBonus + queueMechanic.damageBonus + empowerBonus + roundDamageBonus + instanceBonus + breakBonus + conversionBonus + blessingDamageBonus + mechanicDamageBonus + drawnSwordAttackBonus + routeDamageBonus + spellChargeDamageBonus + vowDamageBonus + bleedAmplifyBonus + comboEscalateBonus - tradeoffPenalty - recyclePenalty);
            let damage = Math.max(1, Math.round(result.damage * totalMultiplier));
            if (trueDamageConversion) damage = Math.max(1, Math.round(damage * (1 - Math.max(0, Math.min(80, Number(trueDamageConversion.penalty) || 0)) / 100)));
            const unstable = actor.unstableMagic && card.category === (actor.unstableMagic.category || 'skill') ? actor.unstableMagic : null;
            let unstableExtra = 0;
            if (unstable) {
                const roll = unstable.low + (unstable.high - unstable.low) * nextBattleRandom(battle);
                const baseline = damage;
                damage = Math.max(1, Math.round(damage * (1 + roll / 100)));
                unstableExtra = damage - baseline;
                visual.unstableRoll = Math.round(roll * 10) / 10;
            }
            const damageCap = target.damageCaps?.[0];
            if (damageCap) {
                const limit = Math.max(1, Math.round(target.maxHp * damageCap.ratio / 100));
                if (damage > limit) {
                    visual.damageCapped += damage - limit;
                    damage = limit;
                }
                damageCap.uses -= 1;
                target.damageCaps = target.damageCaps.filter((entry) => entry.uses > 0);
            }
            if (forecastGuard) {
                const reduced = Math.min(Math.max(0, damage - 1), Math.max(0, Math.round(damage * forecastGuard.reduction / 100)));
                damage -= reduced;
                forecastPrevented += reduced;
                visual.forecastPrevented += reduced;
            }
            const guard = target.guards?.[0];
            let prevented = 0;
            if (guard) {
                prevented = Math.min(damage - 1, Math.max(1, Math.round(damage * guard.reduction / 100)));
                damage -= prevented;
                guard.uses -= 1;
                target.guards = target.guards.filter((entry) => entry.uses > 0);
                visual.guardReduction += prevented;
                if (guard.dodge) visual.dodgeTarget = targetKey;
                if (guard.restoreMp > 0) {
                    const restored = Math.min(guard.restoreMp, target.maxMp - target.mp);
                    target.mp += restored;
                    if (restored) messages.push(`目标格挡回能${restored}MP`);
                }
                if (guard.counterRatio > 0 && prevented > 0) {
                    const counterDamage = Math.max(1, Math.round(prevented * guard.counterRatio / 100));
                    const counterResult = applyPeakDamageToCombatant(actor, counterDamage);
                    visual.counterDamage += counterResult.hpDamage + counterResult.absorbed;
                    if (counterResult.lastStandShield) visual.lastStand = true;
                    if (counterResult.phoenixTriggered) { visual.phoenixTriggered = true; visual.phoenixTarget = actorKey; }
                    messages.push(counterResult.phoenixTriggered ? '反震触发自身浴火金身，致命伤害被无视' : `目标反震${counterResult.hpDamage + counterResult.absorbed}点真实伤害`);
                }
            }
            const manaBarrier = target.manaBarriers?.[0];
            if (manaBarrier) {
                const manaAbsorbed = Math.min(target.mp, Math.max(0, Math.round(damage * manaBarrier.ratio / 100)));
                target.mp -= manaAbsorbed;
                damage = Math.max(1, damage - manaAbsorbed);
                manaBarrier.uses -= 1;
                target.manaBarriers = target.manaBarriers.filter((entry) => entry.uses > 0);
                visual.manaAbsorbed += manaAbsorbed;
                if (manaAbsorbed) messages.push(`魔力护壁消耗${manaAbsorbed}MP吸收伤害`);
            }
            const shieldBefore = target.shield;
            const received = applyPeakDamageToCombatant(target, damage);
            visual.hitIndex = Math.max(visual.hitIndex, Number(effect.hitIndex) || 0);
            visual.hitCount = Math.max(visual.hitCount, Number(effect.hitCount) || 0);
            let vanguardAbsorbed = 0;
            if (!received.phoenixTriggered && target.shield > 0 && actor.shieldVanguard) {
                const bonusShieldDamage = Math.max(0, Math.round(damage * actor.shieldVanguard.shieldBonus / 100));
                vanguardAbsorbed = Math.min(target.shield, bonusShieldDamage);
                target.shield -= vanguardAbsorbed;
                visual.shieldDamage += vanguardAbsorbed;
            }
            if (effect.hitCount) visual.hitResults.push({
                hitIndex: effect.hitIndex || visual.hitResults.length + 1,
                hpDamage: received.hpDamage,
                shieldDamage: received.absorbed + vanguardAbsorbed,
                critical: Boolean(result.critical),
            });
            if (damageEcho && !received.phoenixTriggered && target.hp > 0) {
                const echoAmount = Math.max(1, Math.round(damage * damageEcho.ratio / 100));
                const echoResult = applyPeakDamageToCombatant(target, echoAmount);
                const echoed = echoResult.hpDamage + echoResult.absorbed;
                visual.hpDamage += echoResult.hpDamage;
                visual.shieldDamage += echoResult.absorbed;
                visual.echoDamage += echoed;
                visual.lastStand ||= Boolean(echoResult.lastStandShield);
                visual.phoenixTriggered ||= Boolean(echoResult.phoenixTriggered);
                if (echoResult.phoenixTriggered) visual.phoenixTarget = targetKey;
                phoenixTriggeredThisCard ||= Boolean(echoResult.phoenixTriggered);
                messages.push(echoResult.phoenixTriggered
                    ? '因果余响触发目标浴火金身，致命伤害被无视'
                    : `因果余响追加${echoed}点伤害`);
            }
            const delayedBurst = target.delayedBursts?.shift();
            if (delayedBurst && !received.phoenixTriggered) {
                const burstResult = applyPeakDamageToCombatant(target, delayedBurst.damage);
                visual.hpDamage += burstResult.hpDamage;
                visual.shieldDamage += burstResult.absorbed;
                visual.delayedDamage += burstResult.hpDamage + burstResult.absorbed;
                visual.lastStand ||= Boolean(burstResult.lastStandShield);
                visual.phoenixTriggered ||= Boolean(burstResult.phoenixTriggered);
                if (burstResult.phoenixTriggered) visual.phoenixTarget = targetKey;
                phoenixTriggeredThisCard ||= Boolean(burstResult.phoenixTriggered);
                messages.push(`引爆「${delayedBurst.name}」造成${burstResult.hpDamage + burstResult.absorbed}点延迟伤害`);
            }
            const onHit = effect.onHitStatus;
            if (onHit && nextBattleRandom(battle) * 100 < Math.max(0, Math.min(100, Number(onHit.chance) || 0))) {
                const harmful = PEAK_STATUS_EFFECTS[onHit.status]?.harmful;
                if (harmful && target.debuffImmunity) messages.push(`目标免疫${PEAK_STATUS_EFFECTS[onHit.status]?.name || onHit.status}`);
                else if (harmful && target.statusWard?.charges > 0) {
                    target.statusWard.charges -= 1;
                    if (target.statusWard.charges <= 0) target.statusWard = null;
                    messages.push(`异常屏障抵消${PEAK_STATUS_EFFECTS[onHit.status]?.name || onHit.status}`);
                } else {
                    const spreadStacks = harmful ? Math.max(0, Math.floor(Number(blessing.harmfulStatusStackBonus) || 0)) : 0;
                    const spreadDuration = harmful ? Math.max(0, Math.floor(Number(blessing.harmfulStatusDurationBonus) || 0)) : 0;
                    const routeStacks = harmful ? routeStatusStackBonus(actor, onHit.status) : 0;
                    const statusEcho = statusEchoFor(actor, onHit.status);
                    const echoStacks = Math.max(0, Math.floor(Number(statusEcho?.bonusStacks) || 0));
                    const echoDuration = Math.max(0, Math.floor(Number(statusEcho?.durationBonus) || 0));
                    const status = addPeakStatus(target, onHit.status, (onHit.stacks || 1) + spreadStacks + routeStacks + echoStacks, (onHit.duration || 1) + spreadDuration + echoDuration);
                    if (status) {
                        if (statusEcho) consumeStatusEcho(actor);
                        visual.statusTarget = targetKey;
                        visual.statusesApplied.push(onHit.status);
                        if (harmful) harmfulStatusesAppliedToTarget += 1;
                        messages.push(`第${effect.hitIndex || 1}段触发${PEAK_STATUS_EFFECTS[onHit.status]?.name || onHit.status}${routeStacks ? `（转职强化 +${routeStacks}层）` : ''}${statusEcho ? `（特殊牌回响 +${echoStacks}层${echoDuration ? `，持续+${echoDuration}` : ''}）` : ''}`);
                    }
                }
            }
            const thorns = target.thorns?.[0];
            if (thorns && !received.phoenixTriggered) {
                const thornDamage = Math.max(1, Math.round(damage * thorns.ratio / 100));
                const thornResult = applyPeakDamageToCombatant(actor, thornDamage);
                thorns.uses -= 1;
                target.thorns = target.thorns.filter((entry) => entry.uses > 0);
                visual.thornsDamage += thornResult.hpDamage + thornResult.absorbed;
                if (thornResult.phoenixTriggered) { visual.phoenixTriggered = true; visual.phoenixTarget = actorKey; }
                messages.push(thornResult.phoenixTriggered ? '荆棘反伤触发自身浴火金身，致命伤害被无视' : `荆棘反弹${thornResult.hpDamage + thornResult.absorbed}点真实伤害`);
            }
            const brokeShield = shieldBefore > 0 && target.shield <= 0;
            if (brokeShield && actor.shieldVanguard && !actor.shieldVanguard.activated) {
                actor.shieldVanguard.activated = true;
                messages.push(`击破护盾，剩余行动伤害提高${actor.shieldVanguard.breakBonus}%`);
            }
            const shieldBreak = brokeShield ? target.shieldBreaks?.[0] : null;
            if (shieldBreak) {
                const restored = Math.min(target.maxHp - target.hp, Math.round((target.maxHp - target.hp) * shieldBreak.healPercent / 100));
                target.hp += restored;
                const handKey = targetKey === 'player' ? 'hand' : 'enemyHand';
                const handBefore = battle[handKey].length;
                if (shieldBreak.draw > 0) drawFor(battle, targetKey, shieldBreak.draw);
                const drawn = battle[handKey].length - handBefore;
                shieldBreak.uses -= 1;
                target.shieldBreaks = target.shieldBreaks.filter((entry) => entry.uses > 0);
                visual.shieldBreakTriggered = true;
                visual.healingTarget = targetKey;
                visual.healing += restored;
                messages.push(`护盾回响恢复${restored}生命${drawn ? `并抽${drawn}张牌` : ''}`);
            }
            visual.target = targetKey;
            visual.hpDamage += received.hpDamage;
            visual.shieldDamage += received.absorbed;
            visual.lastStand ||= Boolean(received.lastStandShield);
            visual.phoenixTriggered ||= Boolean(received.phoenixTriggered);
            if (received.phoenixTriggered) visual.phoenixTarget = targetKey;
            phoenixTriggeredThisCard ||= Boolean(received.phoenixTriggered);
            visual.critical ||= result.critical;
            visual.element ||= result.element || effect.element || '';
            dealtDamage = true;
            resolvedDamageHits += 1;
            const label = `${effect.hitCount ? `第${effect.hitIndex}/${effect.hitCount}段 ` : ''}${result.critical ? '暴击 ' : ''}${damage}${damageTypeNames[result.damageType] || ''}伤害${result.element ? `·${elementNames[result.element] || result.element}属性` : ''}`;
            if (received.phoenixTriggered) messages.push(`目标触发浴火金身，无视本次致命伤害并清除全部负面状态`);
            else messages.push(received.absorbed || vanguardAbsorbed ? `${label}（护盾吸收${received.absorbed + vanguardAbsorbed}）` : label);
            if (prevented) messages.push(`格挡减免${prevented}`);
            if (visual.damageCapped) messages.push(`伤害上限截断${visual.damageCapped}`);
            if (received.lastStandShield) messages.push(`目标触发不屈并获得${received.lastStandShield}护盾`);
            if (conditionalBonus && !conditionReported) {
                messages.push(`触发条件增伤${Math.round(conditionalBonus * 100)}%`);
                conditionReported = true;
            }
            if (empowerBonus && !messages.some((message) => message.startsWith('蓄势增伤'))) messages.push(`蓄势增伤${Math.round(empowerBonus * 100)}%`);
            if (conversion) messages.push(`${damageTypeNames[conversion.from]}伤害转为${damageTypeNames[conversion.to]}伤害并提高${conversion.bonus}%`);
            if (drawnSwordAttackBonus && !drawnSwordBonusReported) {
                messages.push(`亮出你的剑使进攻牌伤害提高${actor.drawnSword.attackBonus}%`);
                drawnSwordBonusReported = true;
            }
            if (instanceBonus) messages.push(`超前消费强化${Math.round(instanceBonus * 100)}%`);
            if (roundDamageBonus) messages.push(`回合物伤强化${Math.round(roundDamageBonus * 100)}%`);
            if (tradeoffPenalty) messages.push(`享乐主义使伤害降低${Math.round(tradeoffPenalty * 100)}%`);
            if (firstAttack && blessing.firstAttackGuaranteedCrit) messages.push(`必杀一击使本牌必定暴击${firstAttackCritDamage ? `，额外暴击伤害${firstAttackCritDamage}%` : ''}`);
            if (blessingDamageBonus) messages.push(`祝福使第${cardPosition}张牌伤害提高${Math.round(blessingDamageBonus * 100)}%`);
            if (positionDamageBonus) messages.push(`压轴蓄势：此前${priorAttackCount}张进攻牌使伤害提高${positionDamageBonus}%`);
            if (styleFollowRule?.damageBonus) messages.push(`流派追击「${previousStyle}」使伤害提高${styleFollowRule.damageBonus}%`);
            if (finisherMarkReady) messages.push(`消耗${card.consumeStyleChain.threshold}层终结标记，伤害提高${card.consumeStyleChain.damageBonus}%`);
            if (recyclePenalty) messages.push(`回收追击使伤害降低${Math.round(recyclePenalty * 100)}%`);
            if (unstable) {
                messages.push(`不稳定黑魔法${unstableExtra >= 0 ? '增伤' : '减伤'}${Math.abs(visual.unstableRoll)}%（${unstableExtra >= 0 ? '+' : ''}${unstableExtra}）`);
                if (unstableExtra > 0) {
                    const sustainMultiplier = 1 + Math.max(0, Number(actor.roundTradeoff?.sustainBonus) || 0) / 100;
                    const restored = Math.min(Math.round(unstableExtra * unstable.leech / 100 * sustainMultiplier), actor.maxHp - actor.hp);
                    if (restored > 0) {
                        actor.hp += restored;
                        visual.healingTarget = actorKey;
                        visual.healing += restored;
                        visual.unstableHeal += restored;
                    }
                    messages.push(restored > 0 ? `不稳定黑魔法转化${restored}点生命` : '不稳定黑魔法未能转化生命（生命已满）');
                } else if (unstableExtra < 0) {
                    const drain = Math.min(Math.max(0, actor.hp - 1), Math.round(Math.abs(unstableExtra) * unstable.leech / 100));
                    actor.hp -= drain;
                    visual.unstableDrain += drain;
                    messages.push(drain > 0 ? `不稳定黑魔法反噬${drain}点生命` : '不稳定黑魔法反噬被生命下限阻止');
                }
            }
        } else if (effect.type === 'shield') {
            const sustainMultiplier = 1 + Math.max(0, Number(actor.roundTradeoff?.sustainBonus) || 0) / 100;
            const value = Math.round(calculatePeakEffectValue(effect, actor.stats, card, level) * sustainMultiplier * defenseEmpowerMultiplier);
            actor.shield += value;
            visual.shieldGained += value;
            messages.push(`${value}护盾${sustainMultiplier > 1 ? '（享乐主义强化）' : ''}`);
        } else if (effect.type === 'conditionalShield') {
            const unitValue = Math.max(0, scaledRangeValue(effect, level, 'minValue', 'maxValue'));
            const handKey = actorKey === 'player' ? 'hand' : 'enemyHand';
            let raw = 0;
            let basisText = '';
            if (effect.rule === 'handCount') {
                const count = Math.min(Math.max(0, Math.floor(Number(effect.countCap) || 0)), battle[handKey].length);
                raw = count * unitValue;
                basisText = `${count}张手牌`;
            } else if (effect.rule === 'missingHpPercent') {
                raw = Math.max(0, actor.maxHp - actor.hp) * unitValue / 100;
                basisText = '已损生命';
            } else if (effect.rule === 'currentMpPercent') {
                raw = Math.max(0, actor.mp) * unitValue / 100;
                basisText = '当前MP';
            } else if (effect.rule === 'enemyStatusCount') {
                const harmfulCount = Math.min(
                    Math.max(0, Math.floor(Number(effect.countCap) || 0)),
                    (target.statuses || []).filter((status) => PEAK_STATUS_EFFECTS[status.id]?.harmful).length,
                );
                raw = harmfulCount * unitValue;
                basisText = `${harmfulCount}种敌方负面状态`;
            }
            const cap = Math.max(0, Math.round(actor.maxHp * Math.max(0, Number(effect.capPercent) || 0) / 100));
            const sustainMultiplier = 1 + Math.max(0, Number(actor.roundTradeoff?.sustainBonus) || 0) / 100;
            const gained = Math.min(cap, Math.max(0, Math.round(raw * sustainMultiplier * defenseEmpowerMultiplier)));
            actor.shield += gained;
            visual.conditionalShield = (Number(visual.conditionalShield) || 0) + gained;
            visual.shieldGained += gained;
            messages.push(`${basisText}追加${gained}点条件护盾${sustainMultiplier > 1 ? '（享乐主义强化）' : ''}`);
        } else if (effect.type === 'guard') {
            actor.guards = Array.isArray(actor.guards) ? actor.guards : [];
            actor.guards.push({ reduction: effect.reduction, uses: effect.uses, duration: effect.duration, counterRatio: effect.counterRatio || 0, restoreMp: effect.restoreMp || 0, dodge: card.tags?.includes('闪避') });
            actor.guards = actor.guards.slice(-3);
            messages.push(`获得${effect.uses}次格挡：减伤${effect.reduction}%${effect.counterRatio ? `，反震减免量的${effect.counterRatio}%` : ''}${effect.restoreMp ? `，触发恢复${effect.restoreMp}MP` : ''}`);
        } else if (effect.type === 'statusWard') {
            const current = actor.statusWard || { charges: 0, duration: 0 };
            actor.statusWard = { charges: Math.min(3, current.charges + effect.value), duration: Math.max(current.duration, effect.duration) };
            messages.push(`获得${effect.value}次异常屏障`);
        } else if (effect.type === 'lastStand') {
            actor.lastStand = { charges: 1, shieldPercent: effect.shieldPercent, duration: effect.duration };
            messages.push(`获得不屈：致命伤保留1点生命并获得${effect.shieldPercent}%最大生命护盾`);
        } else if (effect.type === 'manaBarrier') {
            actor.manaBarriers = Array.isArray(actor.manaBarriers) ? actor.manaBarriers : [];
            actor.manaBarriers.push({ ratio: effect.ratio, uses: effect.uses, duration: effect.duration });
            actor.manaBarriers = actor.manaBarriers.slice(-3);
            messages.push(`获得${effect.uses}次魔力护壁：消耗MP吸收${effect.ratio}%伤害`);
        } else if (effect.type === 'thorns') {
            actor.thorns = Array.isArray(actor.thorns) ? actor.thorns : [];
            actor.thorns.push({ ratio: effect.ratio, uses: effect.uses, duration: effect.duration });
            actor.thorns = actor.thorns.slice(-3);
            messages.push(`获得${effect.uses}次反伤荆棘：反弹${effect.ratio}%真实伤害`);
        } else if (effect.type === 'damageCap') {
            actor.damageCaps = Array.isArray(actor.damageCaps) ? actor.damageCaps : [];
            actor.damageCaps.push({ ratio: effect.ratio, uses: effect.uses, duration: effect.duration });
            actor.damageCaps = actor.damageCaps.slice(-3);
            messages.push(`获得${effect.uses}次伤害上限：单次伤害不超过最大生命${effect.ratio}%`);
        } else if (effect.type === 'shieldBreak') {
            actor.shieldBreaks = Array.isArray(actor.shieldBreaks) ? actor.shieldBreaks : [];
            actor.shieldBreaks.push({ healPercent: effect.healPercent, draw: effect.draw, uses: effect.uses, duration: effect.duration });
            actor.shieldBreaks = actor.shieldBreaks.slice(-3);
            messages.push(`获得护盾回响：护盾击破时恢复${effect.healPercent}%已损生命${effect.draw ? `并抽${effect.draw}张牌` : ''}`);
        } else if (effect.type === 'heal') {
            const sustainMultiplier = 1 + Math.max(0, Number(actor.roundTradeoff?.sustainBonus) || 0) / 100;
            const value = Math.round(calculatePeakEffectValue(effect, actor.stats, card, level) * sustainMultiplier * defenseEmpowerMultiplier);
            const restored = Math.min(value, actor.maxHp - actor.hp);
            const overflow = Math.max(0, value - restored);
            const overflowShield = Math.max(0, Math.round(overflow * (Number(actor.overhealShieldRatio) || 0) / 100));
            actor.hp += restored;
            actor.shield += overflowShield;
            visual.healingTarget = actorKey;
            visual.healing += restored;
            const healingJudgmentRatio = Math.max(0, Number(routeTier >= 2 ? routeCombat?.secondHealingJudgmentRatio : routeCombat?.healingJudgmentRatio) || 0);
            const overhealJudgmentRatio = Math.max(0, Number(routeTier >= 2 ? routeCombat?.secondOverhealJudgmentRatio : routeCombat?.overhealJudgmentRatio) || 0);
            const judgmentDamage = Math.max(0, Math.round(restored * healingJudgmentRatio / 100 + overflow * overhealJudgmentRatio / 100));
            let judgmentDealt = 0;
            if (judgmentDamage > 0 && target.hp > 0) {
                const judgment = applyPeakDamageToCombatant(target, judgmentDamage);
                judgmentDealt = judgment.hpDamage + judgment.absorbed;
                visual.target = targetKey;
                visual.hpDamage += judgment.hpDamage;
                visual.shieldDamage += judgment.absorbed;
                visual.healingJudgment = (Number(visual.healingJudgment) || 0) + judgmentDealt;
                visual.element ||= 'light';
                dealtDamage = judgmentDealt > 0;
                resolvedDamageHits += judgmentDealt > 0 ? 1 : 0;
            }
            messages.push(`恢复${restored}生命${overflowShield ? `，溢出治疗转化为${overflowShield}点护盾` : ''}${judgmentDealt ? `，神恩反转造成${judgmentDealt}点圣光裁决伤害` : ''}`);
        } else if (effect.type === 'healMissing') {
            const ratio = Math.min(30, Math.max(0, effect.value * getPeakLevelMultiplier(card, level)));
            const sustainMultiplier = 1 + Math.max(0, Number(actor.roundTradeoff?.sustainBonus) || 0) / 100;
            const restored = Math.min(Math.round((actor.maxHp - actor.hp) * ratio / 100 * sustainMultiplier * defenseEmpowerMultiplier), actor.maxHp - actor.hp);
            actor.hp += restored;
            visual.healingTarget = actorKey;
            visual.healing += restored;
            messages.push(`按已损生命恢复${restored}点`);
        } else if (effect.type === 'restoreMp') {
            const restored = Math.min(calculatePeakEffectValue(effect, actor.stats, card, level), actor.maxMp - actor.mp);
            actor.mp += restored;
            messages.push(`恢复${restored}MP`);
        } else if (effect.type === 'drainMp') {
            const drained = Math.min(Math.max(0, target.mp), Math.max(0, Math.round(calculatePeakEffectValue(effect, actor.stats, card, level))));
            target.mp -= drained;
            visual.mpDrained = (Number(visual.mpDrained) || 0) + drained;
            messages.push(`侵蚀目标${drained}MP`);
        } else if (effect.type === 'setState') {
            if (effect.value === 'stunned' && target.debuffImmunity) messages.push('目标免疫眩晕');
            else {
                const previousState = target.state;
                target.state = effect.value;
                if (effect.value === 'stunned') target.stunCharges = Math.max(1, Number(target.stunCharges) || 0);
                ensureRoundHistory(battle)[actorKey].stateTransitions.push({
                    from: previousState,
                    to: effect.value,
                    cardId: card.id,
                    target: targetKey,
                });
                visual.stateTarget = targetKey;
                visual.stateApplied = effect.value;
                messages.push(`目标${PEAK_COMBAT_STATES[effect.value] || effect.value}`);
            }
        } else if (effect.type === 'buff') {
            const dynamicBonus = dynamicBuffBonus(battle, actorKey, targetKey, effect);
            const value = calculatePeakBuffValue(effect, actor, card, level, dynamicBonus);
            applyPeakStatBuff(actor, effect.stat, value, effect.duration);
            messages.push(`${effect.stat}+${value}${dynamicBonus ? '（机制强化）' : ''}`);
        } else if (effect.type === 'draw') {
            drawFor(battle, actorKey, effect.value || 1);
            messages.push(`抽${effect.value || 1}张牌`);
        } else if (effect.type === 'generateCard') {
            const generated = addGeneratedCardToHand(battle, actorKey, effect.cardId, level);
            messages.push(generated ? `获得1张临时Lv.${level}${PEAK_CARD_BY_ID[effect.cardId]?.name || effect.cardId}` : '临时衍生牌未能加入手牌');
        } else if (effect.type === 'delayedBurst') {
            const delayedResult = calculatePeakDamage({ effect: { ...effect, type: 'damage' }, card, level, actor, target, random: () => 1 });
            target.delayedBursts = Array.isArray(target.delayedBursts) ? target.delayedBursts : [];
            target.delayedBursts.push({ damage: delayedResult.damage, damageType: delayedResult.damageType, name: card.name, sourceCardId: card.id });
            target.delayedBursts = target.delayedBursts.slice(-4);
            messages.push(`埋下「${card.name}」延迟标记（${delayedResult.damage}伤害）`);
        } else if (effect.type === 'borrowDraw') {
            drawFor(battle, actorKey, effect.draw || 2);
            actor.nextTurnDrawPenalty = Math.min(10, (Number(actor.nextTurnDrawPenalty) || 0) + Math.max(0, effect.penalty || 0));
            messages.push(`抽${effect.draw || 2}张牌，下回合少抽${effect.penalty || 0}张`);
        } else if (effect.type === 'advanceConsume') {
            const handKey = actorKey === 'player' ? 'hand' : 'enemyHand';
            const before = new Set(battle[handKey].map((entry) => entry.uid));
            drawFor(battle, actorKey, effect.draw || 1);
            const drawn = battle[handKey].find((entry) => !before.has(entry.uid));
            const drawnCard = battleCard(drawn, actorKey);
            const damageBonus = Math.round(scaledRangeValue(effect, level, 'minDamageBonus', 'maxDamageBonus'));
            if (drawn && ['attack', 'skill'].includes(drawnCard?.category)) drawn.damageBonus = Math.max(Number(drawn.damageBonus) || 0, damageBonus);
            actor.nextTurnDrawPenalty = Math.min(10, (Number(actor.nextTurnDrawPenalty) || 0) + Math.max(0, effect.penalty || 0));
            messages.push(drawn ? `抽到「${drawnCard.name}」${drawn.damageBonus ? `，其伤害提高${damageBonus}%` : ''}，下回合少抽${effect.penalty || 0}张` : '没有可抽取的牌');
        } else if (effect.type === 'nextTurnDraw') {
            const value = Math.max(1, Math.floor(Number(effect.value) || 1));
            actor.nextTurnDraw = Math.min(10, (Number(actor.nextTurnDraw) || 0) + value);
            messages.push(`下回合额外抽${value}张牌`);
        } else if (effect.type === 'gainRouteResource') {
            const gained = gainRouteResource(actor, effect.value || 1);
            visual.routeResourceGained += gained;
            visual.routeResourceAfter = routeResourceValue(actor);
            messages.push(gained > 0 ? `${routeResource?.name || '路线资源'} +${gained}（${routeResourceValue(actor)}/${routeResourceMax(actor)}）` : '路线资源已满或尚未解锁');
        } else if (effect.type === 'routeResourcePayoff') {
            const marks = routeResourceValue(actor);
            const shield = Math.max(0, Math.round(marks * Math.max(0, Number(effect.shieldPerMark) || 0) * getPeakLevelMultiplier(card, level)));
            const restored = Math.min(actor.maxMp - actor.mp, Math.max(0, Math.round(marks * Math.max(0, Number(effect.mpPerMark) || 0))));
            if (shield > 0) {
                actor.shield += shield;
                visual.shieldGained += shield;
                visual.target = actorKey;
            }
            if (restored > 0) actor.mp += restored;
            if (effect.consume && marks > 0 && routeResource) {
                routeResource.value = 0;
                visual.routeResourceConsumed = true;
            }
            visual.routeResourceAfter = routeResourceValue(actor);
            messages.push(marks > 0 ? `利用${marks}层${routeResource?.name || '路线资源'}${shield ? `获得${shield}点护盾` : ''}${shield && restored ? '并' : ''}${restored ? `恢复${restored}MP` : ''}` : '当前没有可利用的路线资源');
        } else if (effect.type === 'conditionalRouteResource') {
            let units = 0;
            if (effect.condition === 'targetStatus') {
                const statuses = new Set(effect.statuses || []);
                units = (target.statuses || []).filter((entry) => statuses.has(statusIdOf(entry))).length > 0 ? 1 : 0;
            } else if (effect.condition === 'actorShield') {
                units = actor.shield / Math.max(1, actor.maxHp) >= Math.max(0, Number(effect.threshold) || 0) ? 1 : 0;
            } else if (effect.condition === 'queueCategoryCount') {
                units = queueCardsFor(battle, actorKey, card).filter((entry) => entry.category === effect.category).length;
            } else if (effect.condition === 'targetHarmfulStatusCount') {
                units = (target.statuses || []).filter((entry) => PEAK_STATUS_EFFECTS[statusIdOf(entry)]?.harmful).length;
            }
            const perUnit = effect.condition === 'queueCategoryCount'
                ? Math.max(1, Math.round(Number(effect.perCard) || 1))
                : Math.max(1, Math.round(scaledRangeOrFixedValue(effect, level, 'minValue', 'maxValue')));
            const cap = effect.condition === 'queueCategoryCount'
                ? Math.max(1, Math.round(scaledRangeOrFixedValue(effect, level, 'minCap', 'maxCap', 'maxValue')))
                : perUnit;
            const requested = Math.min(cap, units * perUnit);
            const gained = gainRouteResource(actor, requested);
            visual.routeResourceGained += gained;
            visual.routeResourceAfter = routeResourceValue(actor);
            messages.push(requested > 0
                ? `${effect.condition === 'queueCategoryCount' ? `识别${units}张${categoryNames[effect.category] || effect.category}牌，` : '条件满足，'}${routeResource?.name || '路线资源'} +${gained}（${routeResourceValue(actor)}/${routeResourceMax(actor)}）`
                : '路线特殊条件未满足');
        } else if (effect.type === 'filteredRecall') {
            const keys = zoneKeysFor(actorKey);
            const categories = new Set(effect.categories || []);
            const elements = new Set(effect.elements || []);
            const statuses = new Set(effect.statuses || []);
            const matches = (definition) => {
                if (!definition || categories.size && !categories.has(definition.category)) return false;
                if (elements.size && !definition.effects.some((entry) => entry.type === 'damage' && elements.has(entry.element))) return false;
                if (statuses.size && !definition.effects.some((entry) => (
                    entry.type === 'status' && statuses.has(entry.status)
                    || entry.onHitStatus && statuses.has(entry.onHitStatus.status)
                )) && !Object.values(definition.styleFollowUp || {}).some((entry) => statuses.has(entry.status))) return false;
                return true;
            };
            let recovered = 0;
            const names = [];
            const recallCount = Math.max(1, Math.round(scaledRangeOrFixedValue(effect, level, 'minValue', 'maxValue')));
            for (let index = battle[keys.discard].length - 1; index >= 0 && recovered < recallCount; index -= 1) {
                const candidate = battle[keys.discard][index];
                const definition = battleCard(candidate, actorKey);
                if (!matches(definition)) continue;
                const added = effect.copy
                    ? addGeneratedCardToHand(battle, actorKey, candidate.cardId, candidate.levelOverride || level, { temporary: Boolean(effect.temporary), exhaustAfterUse: Boolean(effect.exhaustAfterUse) })
                    : (() => {
                        if (actorKey !== 'player' && battle[keys.hand].length >= 12) return false;
                        const [moved] = battle[keys.discard].splice(index, 1);
                        battle[keys.hand].push(moved);
                        return true;
                    })();
                if (!added) continue;
                recovered += 1;
                names.push(definition.name);
            }
            messages.push(recovered ? `${effect.copy ? '临时复制' : '回收'}「${names.join('」「')}」` : '弃牌堆中没有符合路线条件的牌');
        } else if (effect.type === 'statusExtend') {
            const accepted = new Set(effect.statuses || []);
            const matched = (target.statuses || []).filter((entry) => accepted.has(statusIdOf(entry)));
            const addedStacks = Math.max(0, Math.round(scaledRangeOrFixedValue(effect, level, 'minStacks', 'maxStacks', 'stacks')));
            const addedDuration = Math.max(0, Math.round(scaledRangeOrFixedValue(effect, level, 'minDuration', 'maxDuration', 'duration')));
            matched.forEach((entry) => {
                const definition = PEAK_STATUS_EFFECTS[statusIdOf(entry)];
                entry.stacks = Math.min(definition?.maxStacks || 99, Math.max(1, Math.floor(Number(entry.stacks) || 1) + addedStacks));
                entry.duration = Math.min(99, Math.max(1, Math.floor(Number(entry.duration) || 1) + addedDuration));
            });
            let seeded = false;
            if (!matched.length && effect.seedStatus && !target.debuffImmunity && !(target.statusWard?.charges > 0)) {
                seeded = Boolean(addPeakStatus(target, effect.seedStatus, Math.max(1, addedStacks), Math.max(1, addedDuration)));
                if (seeded) {
                    visual.statusTarget = targetKey;
                    visual.statusesApplied.push(effect.seedStatus);
                    harmfulStatusesAppliedToTarget += PEAK_STATUS_EFFECTS[effect.seedStatus]?.harmful ? 1 : 0;
                }
            }
            const affected = matched.length + (seeded ? 1 : 0);
            const gained = gainRouteResource(actor, affected * Math.max(0, Math.floor(Number(effect.gainRoutePerStatus) || 0)));
            visual.routeResourceGained += gained;
            visual.routeResourceAfter = routeResourceValue(actor);
            messages.push(affected ? `延刻${affected}种异常${gained ? `并获得${gained}层${routeResource?.name || '路线资源'}` : ''}` : '目标没有可延长的异常');
        } else if (effect.type === 'routeResourcePreserve') {
            const uses = Math.max(1, Math.min(3, Math.round(scaledRangeOrFixedValue(effect, level, 'minUses', 'maxUses', 'uses'))));
            actor.routeResourcePreserveUses = Math.max(Number(actor.routeResourcePreserveUses) || 0, uses);
            messages.push(`接下来${uses}次触发满层${routeResource?.name || '路线资源'}增伤后不消耗资源`);
        } else if (effect.type === 'statusEcho') {
            actor.routeStatusEcho = {
                statuses: [...new Set((effect.statuses || []).filter((status) => PEAK_STATUS_EFFECTS[status]?.harmful))],
                bonusStacks: Math.max(0, Math.min(3, Math.round(scaledRangeOrFixedValue(effect, level, 'minBonusStacks', 'maxBonusStacks', 'bonusStacks')))),
                durationBonus: Math.max(0, Math.min(2, Math.floor(Number(effect.durationBonus) || 0))),
                uses: Math.max(1, Math.min(3, Math.round(scaledRangeOrFixedValue(effect, level, 'minUses', 'maxUses', 'uses')))),
            };
            messages.push(`接下来${actor.routeStatusEcho.uses}次施加${actor.routeStatusEcho.statuses.map((status) => PEAK_STATUS_EFFECTS[status]?.name || status).join('或')}时，额外增加${actor.routeStatusEcho.bonusStacks}层${actor.routeStatusEcho.durationBonus ? `并延长${actor.routeStatusEcho.durationBonus}回合` : ''}`);
        } else if (effect.type === 'statusTransmute') {
            const mapping = effect.mapping || {};
            const source = [...(target.statuses || [])]
                .filter((entry) => mapping[statusIdOf(entry)])
                .sort((left, right) => (Number(right.stacks) || 0) - (Number(left.stacks) || 0))[0];
            if (!source) messages.push('目标没有可转换的中毒或流血');
            else {
                const from = statusIdOf(source);
                const to = mapping[from];
                const stacks = Math.max(1, Math.floor(Number(source.stacks) || 1));
                const duration = Math.max(1, Math.floor(Number(source.duration) || 1));
                target.statuses = (target.statuses || []).filter((entry) => entry !== source);
                const converted = addPeakStatus(target, to, stacks, duration);
                visual.statusTarget = targetKey;
                visual.statusesApplied.push(to);
                messages.push(`将${stacks}层${PEAK_STATUS_EFFECTS[from]?.name || from}转换为${converted?.stacks || stacks}层${PEAK_STATUS_EFFECTS[to]?.name || to}`);
            }
        } else if (effect.type === 'statusHarvest') {
            const accepted = new Set(effect.statuses || []);
            const maxStacks = Math.max(1, Math.min(20, Math.floor(Number(effect.maxStacks) || 1)));
            const entries = (target.statuses || []).filter((entry) => accepted.has(statusIdOf(entry)));
            let remaining = maxStacks;
            let harvested = 0;
            entries.forEach((entry) => {
                if (remaining <= 0) return;
                const taken = Math.min(remaining, Math.max(0, Math.floor(Number(entry.stacks) || 0)));
                harvested += taken;
                remaining -= taken;
                if (effect.consume) entry.stacks = Math.max(0, Math.floor(Number(entry.stacks) || 0) - taken);
            });
            if (effect.consume) target.statuses = (target.statuses || []).filter((entry) => Number(entry.stacks) > 0);
            let damageDealt = 0;
            const damagePerStack = Math.max(0, Math.floor(Number(effect.damagePerStack) || 0));
            if (harvested > 0 && damagePerStack > 0) {
                const harvestResult = calculatePeakDamage({
                    effect: { type: 'damage', base: damagePerStack * harvested, damageType: effect.damageType || 'true', element: effect.element || '' },
                    card, level, actor, target, random: () => nextBattleRandom(battle),
                });
                const received = applyPeakDamageToCombatant(target, harvestResult.damage);
                damageDealt = received.hpDamage + received.absorbed;
                visual.hpDamage += received.hpDamage;
                visual.shieldDamage += received.absorbed;
                visual.element ||= harvestResult.element || effect.element || '';
                visual.lastStand ||= Boolean(received.lastStandShield);
                visual.phoenixTriggered ||= Boolean(received.phoenixTriggered);
                if (received.phoenixTriggered) visual.phoenixTarget = targetKey;
                phoenixTriggeredThisCard ||= Boolean(received.phoenixTriggered);
                dealtDamage = damageDealt > 0;
                resolvedDamageHits += damageDealt > 0 ? 1 : 0;
            }
            const gained = gainRouteResource(actor, harvested * Math.max(0, Math.floor(Number(effect.restoreRoutePerStack) || 0)));
            const restored = Math.min(actor.maxMp - actor.mp, harvested * Math.max(0, Math.floor(Number(effect.restoreMpPerStack) || 0)));
            actor.mp += restored;
            visual.routeResourceGained += gained;
            visual.routeResourceAfter = routeResourceValue(actor);
            visual.statusHarvested = harvested;
            visual.target = targetKey;
            messages.push(harvested
                ? `收割${harvested}层${[...accepted].map((status) => PEAK_STATUS_EFFECTS[status]?.name || status).join('或')}${damageDealt ? `，造成${damageDealt}点伤害` : ''}${gained ? `，获得${gained}层${routeResource?.name || '路线资源'}` : ''}${restored ? `，恢复${restored}MP` : ''}`
                : '目标没有可收割的异常层数');
        } else if (effect.type === 'shieldStrike') {
            const cap = Math.max(0, Math.round(actor.maxHp * Math.max(0, Number(effect.capPercent) || 0) / 100));
            const basis = Math.min(Math.max(0, actor.shield), cap || actor.shield);
            const ratio = Math.max(0, scaledRangeValue(effect, level, 'minRatio', 'maxRatio'));
            const spent = Math.min(actor.shield, Math.max(0, Math.round(actor.shield * Math.max(0, Number(effect.consumePercent) || 0) / 100)));
            actor.shield -= spent;
            const bossFactor = target.isBoss ? Math.max(0, Math.min(1, Number(effect.bossFactor) || 1)) : 1;
            const rawDamage = Math.max(0, Math.round(basis * ratio / 100 * bossFactor));
            let damageDealt = 0;
            if (rawDamage > 0) {
                const received = applyPeakDamageToCombatant(target, rawDamage);
                damageDealt = received.hpDamage + received.absorbed;
                visual.hpDamage += received.hpDamage;
                visual.shieldDamage += received.absorbed;
                visual.element ||= effect.element || '';
                visual.lastStand ||= Boolean(received.lastStandShield);
                visual.phoenixTriggered ||= Boolean(received.phoenixTriggered);
                if (received.phoenixTriggered) visual.phoenixTarget = targetKey;
                phoenixTriggeredThisCard ||= Boolean(received.phoenixTriggered);
                dealtDamage = damageDealt > 0;
                resolvedDamageHits += damageDealt > 0 ? 1 : 0;
            }
            visual.shieldSpent = spent;
            visual.target = targetKey;
            messages.push(basis > 0 ? `以${basis}点护盾为基准${spent ? `并献出${spent}点护盾` : ''}，反照造成${damageDealt}点真实伤害` : '当前没有护盾，反照未能造成伤害');
        } else if (effect.type === 'sacrificeCurrentHp') {
            const ratio = Math.max(0, Math.round(scaledRangeOrFixedValue(effect, level, 'minValue', 'maxValue')));
            const spent = Math.min(Math.max(0, actor.hp - 1), Math.max(1, Math.floor(actor.hp * ratio / 100)));
            actor.hp -= spent;
            visual.target = actorKey;
            visual.hpDamage += spent;
            messages.push(`消耗${spent}点当前生命`);
        } else if (effect.type === 'roundDamageBoost') {
            const value = Math.round(scaledRangeValue(effect, level, 'minValue', 'maxValue'));
            actor.roundDamageBoosts = Array.isArray(actor.roundDamageBoosts) ? actor.roundDamageBoosts : [];
            actor.roundDamageBoosts.push({ damageType: effect.damageType || 'all', value });
            messages.push(`本回合${damageTypeNames[effect.damageType] || '全部'}伤害提高${value}%`);
        } else if (effect.type === 'classCategoryRoundDamageBoost') {
            const value = Math.round(scaledRangeValue(effect, level, 'minValue', 'maxValue'));
            actor.roundDamageBoosts = Array.isArray(actor.roundDamageBoosts) ? actor.roundDamageBoosts : [];
            actor.roundDamageBoosts.push({ damageType: 'all', classId: effect.classId, categories: [...(effect.categories || [])], value });
            messages.push(`本回合职业专属${(effect.categories || []).map((category) => category === 'attack' ? '进攻' : category === 'skill' ? '技能' : category).join('与')}牌伤害提高${value}%`);
        } else if (effect.type === 'nextTurnClassCategoryDamageBoost') {
            const value = Math.round(scaledRangeValue(effect, level, 'minValue', 'maxValue'));
            actor.nextTurnDamageBoosts = Array.isArray(actor.nextTurnDamageBoosts) ? actor.nextTurnDamageBoosts : [];
            actor.nextTurnDamageBoosts.push({ damageType: 'all', classId: effect.classId, categories: [...(effect.categories || [])], value });
            actor.nextTurnDamageBoosts = actor.nextTurnDamageBoosts.slice(-4);
            messages.push(`下一回合职业专属${(effect.categories || []).map((category) => category === 'attack' ? '进攻' : category === 'skill' ? '技能' : category).join('与')}牌伤害提高${value}%`);
        } else if (effect.type === 'hatTrick') {
            const cards = queueCardsFor(battle, actorKey, card).filter((entry) => entry.id !== card.id && entry.category !== 'special');
            const categories = cards.map((entry) => entry.category);
            const unique = cards.length > 0 && new Set(categories).size === cards.length;
            if (!unique) messages.push(cards.length ? '队列存在重复类别，帽子戏法未触发' : '队列没有其他类别，帽子戏法未触发');
            else {
                const damageBoost = Math.round(scaledRangeValue(effect, level, 'minDamageBoost', 'maxDamageBoost'));
                const rewards = [];
                if (categories.includes('attack')) {
                    actor.roundDamageBoosts = Array.isArray(actor.roundDamageBoosts) ? actor.roundDamageBoosts : [];
                    actor.roundDamageBoosts.push({ damageType: 'all', categories: ['attack'], value: damageBoost });
                    rewards.push(`进攻伤害+${damageBoost}%`);
                }
                if (categories.includes('skill')) {
                    actor.roundDamageBoosts = Array.isArray(actor.roundDamageBoosts) ? actor.roundDamageBoosts : [];
                    actor.roundDamageBoosts.push({ damageType: 'all', categories: ['skill'], value: damageBoost });
                    rewards.push(`技能伤害+${damageBoost}%`);
                }
                if (categories.includes('defense')) {
                    const shield = Math.round(scaledRangeValue(effect, level, 'minShield', 'maxShield'));
                    actor.shield += shield;
                    visual.shieldGained += shield;
                    visual.target = actorKey;
                    rewards.push(`获得${shield}点护盾`);
                }
                if (categories.includes('buff')) {
                    const restored = Math.min(actor.maxMp - actor.mp, Math.round(scaledRangeValue(effect, level, 'minMp', 'maxMp')));
                    actor.mp += restored;
                    rewards.push(`恢复${restored}MP`);
                }
                messages.push(`帽子戏法识别${categories.map((category) => categoryNames[category] || category).join('、')}：${rewards.join('、')}`);
            }
        } else if (effect.type === 'roundPenetration') {
            const value = Math.round(scaledRangeValue(effect, level, 'minValue', 'maxValue'));
            actor.roundPenetration = { physical: value, magical: value };
            messages.push(`本回合物理穿透与魔法穿透提高${value}%`);
        } else if (effect.type === 'drawSword') {
            const attackBonus = Math.round(scaledRangeValue(effect, level, 'minAttackBonus', 'maxAttackBonus'));
            actor.drawnSword = { attackBonus };
            messages.push(`直到本局结束，技能牌伤害变为0，进攻牌伤害提高${attackBonus}%`);
        } else if (effect.type === 'roundTradeoff') {
            actor.roundTradeoff = {
                damagePenalty: Math.round(scaledRangeValue(effect, level, 'minDamagePenalty', 'maxDamagePenalty')),
                sustainBonus: Math.round(scaledRangeValue(effect, level, 'minSustainBonus', 'maxSustainBonus')),
            };
            messages.push(`本回合伤害降低${actor.roundTradeoff.damagePenalty}%，治疗与护盾提高${actor.roundTradeoff.sustainBonus}%`);
        } else if (effect.type === 'convertRoundDamage') {
            const bonus = Math.round(scaledRangeValue(effect, level, 'minBonus', 'maxBonus'));
            actor.damageConversions = Array.isArray(actor.damageConversions) ? actor.damageConversions : [];
            actor.damageConversions.push({ from: effect.from, to: effect.to, bonus });
            messages.push(`本回合${damageTypeNames[effect.from]}伤害转为${damageTypeNames[effect.to]}伤害并提高${bonus}%`);
        } else if (effect.type === 'disruptCards') {
            if (target.debuffImmunity) messages.push('目标免疫卡牌干扰');
            else {
                target.cardDisruptions = Array.isArray(target.cardDisruptions) ? target.cardDisruptions : [];
                target.cardDisruptions.push({ categories: [...(effect.categories || [])], charges: effect.all ? 0 : Math.max(1, effect.charges || 1), all: Boolean(effect.all), discardAtTurnEnd: Boolean(effect.discardAtTurnEnd) });
                messages.push(effect.all ? '对方下回合全部增益/防守牌无效' : `对方下回合前${effect.charges || 1}张增益/防守牌无效`);
            }
        } else if (effect.type === 'debuffImmunity') {
            actor.debuffImmunity = { duration: Math.max(1, effect.duration || 1), skipFirstEnd: true };
            messages.push('从现在起至下一回合结束免疫所有负面状态');
        } else if (effect.type === 'phoenixWard') {
            actor.phoenixWard = { duration: Math.max(1, effect.duration || 3), charges: Math.max(1, effect.charges || 1) };
            messages.push(`${effect.duration || 3}回合内获得1次致命伤害完全免疫并清除全部负面状态`);
        } else if (effect.type === 'plantBomb') {
            if (target.debuffImmunity) messages.push('目标免疫炸弹安放');
            else {
                const ratio = Math.round(scaledRangeValue(effect, level, 'minRatio', 'maxRatio'));
                battle.bomb = {
                    holder: targetKey,
                    chance: Math.max(0, Math.min(100, Number(effect.chance) || 25)),
                    ratio,
                    bossFactor: Number(effect.bossFactor) || .5,
                };
                messages.push(`为对手安放蹦蹦炸弹（每回合开始${battle.bomb.chance}%几率爆炸，伤害为持有者最大生命${ratio}%）`);
            }
        } else if (effect.type === 'unstableMagic') {
            actor.unstableMagic = {
                category: effect.category || 'skill',
                low: Math.round(scaledRangeValue(effect, level, 'minLow', 'maxLow') * 10) / 10,
                high: Math.round(scaledRangeValue(effect, level, 'minHigh', 'maxHigh') * 10) / 10,
                leech: Math.round(scaledRangeValue(effect, level, 'minLeech', 'maxLeech')),
            };
            messages.push(`本回合技能牌随机获得${actor.unstableMagic.low}%~${actor.unstableMagic.high}%额外伤害，并按额外伤害的${actor.unstableMagic.leech}%转化生命`);
        } else if (effect.type === 'nullifyInsurance') {
            actor.nullifyInsurance = {
                refund: Math.round(scaledRangeValue(effect, level, 'minRefund', 'maxRefund')),
                uses: Math.max(1, Math.floor(Number(effect.uses) || 1)),
            };
            messages.push(`本回合下一张失效的非特殊牌返回手牌并返还${actor.nullifyInsurance.refund}%MP`);
        } else if (effect.type === 'overhealToShield') {
            actor.overhealShieldRatio = Math.round(scaledRangeValue(effect, level, 'minRatio', 'maxRatio'));
            messages.push(`本回合溢出治疗的${actor.overhealShieldRatio}%转化为护盾`);
        } else if (effect.type === 'transferDebuffs') {
            const count = Math.max(1, Math.round(scaledRangeValue(effect, level, 'minCount', 'maxCount')));
            const harmful = (actor.statuses || []).filter((status) => PEAK_STATUS_EFFECTS[status.id]?.harmful).slice(0, count);
            const selected = new Set(harmful);
            actor.statuses = (actor.statuses || []).filter((status) => !selected.has(status));
            let transferred = 0;
            harmful.forEach((status) => {
                if (target.debuffImmunity) return;
                if (target.statusWard?.charges > 0) {
                    target.statusWard.charges -= 1;
                    if (target.statusWard.charges <= 0) target.statusWard = null;
                    return;
                }
                const bossFactor = target.isBoss ? Number(effect.bossFactor) || .5 : 1;
                const stacks = Math.max(1, Math.floor(status.stacks * bossFactor));
                if (addPeakStatus(target, status.id, stacks, status.duration)) {
                    transferred += 1;
                    harmfulStatusesAppliedToTarget += 1;
                    visual.statusTarget = targetKey;
                    visual.statusesApplied.push(status.id);
                }
            });
            if (!harmful.length) messages.push('自身没有可转移的负面状态');
            else messages.push(`移除自身${harmful.length}种负面状态，成功转移${transferred}种${target.isBoss && transferred ? '（Boss层数减半）' : ''}`);
        } else if (effect.type === 'spentMpToShield') {
            actor.spentMpShield = {
                categories: [...(effect.categories || ['attack', 'skill'])],
                ratio: Math.round(scaledRangeValue(effect, level, 'minRatio', 'maxRatio')),
                capPercent: Math.round(scaledRangeValue(effect, level, 'minCap', 'maxCap')),
                spent: 0,
            };
            messages.push(`本回合后续进攻与技能牌耗蓝的${actor.spentMpShield.ratio}%在回合末转为护盾，上限为最大生命${actor.spentMpShield.capPercent}%`);
        } else if (effect.type === 'damageEcho') {
            actor.damageEcho = {
                categories: [...(effect.categories || ['attack', 'skill'])],
                ratio: Math.round(scaledRangeValue(effect, level, 'minRatio', 'maxRatio')),
                uses: Math.max(1, Math.floor(Number(effect.uses) || 1)),
            };
            messages.push(`本回合下一张造成伤害的进攻牌或技能牌产生${actor.damageEcho.ratio}%伤害余响`);
        } else if (effect.type === 'soloQueueRecovery') {
            const solo = queueCardsFor(battle, actorKey, card).length === 1 && !roundHistory.some((entry) => entry.category !== 'special');
            if (!solo) messages.push('队列中存在其他牌，静候良机未生效');
            else {
                const amount = Math.max(0, Math.round(scaledRangeValue(effect, level, 'minValue', 'maxValue')));
                const restored = Math.min(amount, actor.maxMp - actor.mp);
                actor.mp += restored;
                messages.push(`队列中只有本牌，恢复${restored}MP`);
            }
        } else if (effect.type === 'handReserveShield') {
            actor.handReserveShield = {
                perCard: Math.max(0, Math.round(scaledRangeValue(effect, level, 'minPerCard', 'maxPerCard'))),
                cap: Math.max(1, Math.floor(Number(effect.cap) || 1)),
            };
            messages.push(`回合结束时每张保留手牌转化${actor.handReserveShield.perCard}点护盾，最多${actor.handReserveShield.cap}张`);
        } else if (effect.type === 'forecastGuard') {
            actor.forecastGuard = {
                categories: [...(effect.categories || ['attack', 'skill'])],
                reduction: Math.round(scaledRangeValue(effect, level, 'minReduction', 'maxReduction')),
                shieldRatio: Math.round(scaledRangeValue(effect, level, 'minShieldRatio', 'maxShieldRatio')),
                uses: Math.max(1, Math.floor(Number(effect.uses) || 1)),
            };
            messages.push(`预判对方下一张伤害牌：伤害降低${actor.forecastGuard.reduction}%，减免量的${actor.forecastGuard.shieldRatio}%转为护盾`);
        } else if (effect.type === 'scheduleMissingHpHeal') {
            const missing = Math.max(0, actor.maxHp - actor.hp);
            const ratio = scaledRangeValue(effect, level, 'minRatio', 'maxRatio');
            const cap = Math.max(0, Math.round(actor.maxHp * Math.max(0, Number(effect.capPercent) || 0) / 100));
            const amount = Math.min(cap, Math.max(0, Math.round(missing * ratio / 100)));
            actor.scheduledSpecialHeals = Array.isArray(actor.scheduledSpecialHeals) ? actor.scheduledSpecialHeals : [];
            actor.scheduledSpecialHeals.push({ amount, turns: Math.max(1, Math.floor(Number(effect.turns) || 1)) });
            actor.scheduledSpecialHeals = actor.scheduledSpecialHeals.slice(-4);
            messages.push(`记录${missing}点已损生命，下回合开始恢复${amount}点`);
        } else if (effect.type === 'rewindLastCard') {
            actor.tacticalRewind = { uses: Math.max(1, Math.floor(Number(effect.uses) || 1)) };
            messages.push('回合结束时记录最后一张非特殊牌，下回合获得其临时复制');
        } else if (effect.type === 'nextCardTrueDamage') {
            actor.trueDamageConversion = {
                categories: [...(effect.categories || ['attack', 'skill'])],
                penalty: Math.round(scaledRangeValue(effect, level, 'minPenalty', 'maxPenalty')),
                uses: Math.max(1, Math.floor(Number(effect.uses) || 1)),
            };
            messages.push(`本回合下一张伤害牌转为真实伤害，最终伤害降低${actor.trueDamageConversion.penalty}%`);
        } else if (effect.type === 'shieldVanguard') {
            actor.shieldVanguard = {
                shieldBonus: Math.round(scaledRangeValue(effect, level, 'minShieldBonus', 'maxShieldBonus')),
                breakBonus: Math.round(scaledRangeValue(effect, level, 'minBreakBonus', 'maxBreakBonus')),
                activated: false,
            };
            messages.push(`本回合对护盾伤害提高${actor.shieldVanguard.shieldBonus}%，破盾后剩余行动伤害提高${actor.shieldVanguard.breakBonus}%`);
        } else if (effect.type === 'stealShield') {
            const ratio = scaledRangeValue(effect, level, 'minRatio', 'maxRatio') * (target.isBoss ? effect.bossFactor || .5 : 1);
            const stolen = Math.min(target.shield, Math.round(target.shield * ratio / 100));
            target.shield -= stolen;
            actor.shield += stolen;
            visual.target = targetKey;
            visual.shieldDamage += stolen;
            messages.push(`夺取${stolen}点护盾${target.isBoss ? '（Boss效果减半）' : ''}`);
        } else if (effect.type === 'discardHandDamage') {
            const handKey = actorKey === 'player' ? 'hand' : 'enemyHand';
            const discardKey = actorKey === 'player' ? 'discardPile' : 'enemyDiscardPile';
            const discarded = battle[handKey].splice(0);
            battle[discardKey].push(...discarded);
            const ratio = scaledRangeValue(effect, level, 'minRatio', 'maxRatio');
            let total = 0;
            discarded.forEach(() => {
                if (target.hp <= 0) return;
                const raw = Math.max(effect.minimum || 20, target.hp * ratio / 100);
                const tradeoffMultiplier = 1 - Math.max(0, Number(actor.roundTradeoff?.damagePenalty) || 0) / 100;
                const amount = Math.max(1, Math.round(raw * (target.isBoss ? effect.bossFactor || .5 : 1) * tradeoffMultiplier));
                const received = applyPeakDamageToCombatant(target, amount);
                total += received.hpDamage + received.absorbed;
                visual.hpDamage += received.hpDamage;
                visual.shieldDamage += received.absorbed;
                visual.phoenixTriggered ||= Boolean(received.phoenixTriggered);
                if (received.phoenixTriggered) visual.phoenixTarget = targetKey;
                visual.lastStand ||= Boolean(received.lastStandShield);
            });
            visual.target = targetKey;
            dealtDamage = discarded.length > 0;
            messages.push(`丢弃${discarded.length}张手牌，造成${total}点生命比例伤害${target.isBoss ? '（Boss效果减半）' : ''}`);
        } else if (effect.type === 'scheduleCard') {
            actor.scheduledCards = Array.isArray(actor.scheduledCards) ? actor.scheduledCards : [];
            const delays = [...new Set((effect.delays || [1]).map((delay) => Math.max(1, Math.min(3, Math.floor(Number(delay) || 1)))))];
            delays.forEach((turns) => actor.scheduledCards.push({ cardId: effect.cardId, turns, level: Math.max(1, Math.min(10, Math.floor(Number(effect.level) || 1))) }));
            actor.scheduledCards = actor.scheduledCards.slice(-8);
            messages.push(delays.length === 2 && delays.includes(1) && delays.includes(2) ? `下一回合与下下回合各获得1张Lv.${effect.level || 1}${PEAK_CARD_BY_ID[effect.cardId]?.name || effect.cardId}` : `已安排后续获得${PEAK_CARD_BY_ID[effect.cardId]?.name || effect.cardId}`);
        } else if (effect.type === 'grantAndScheduleCard') {
            const generated = addGeneratedCardToHand(battle, actorKey, effect.cardId, level);
            actor.scheduledCards = Array.isArray(actor.scheduledCards) ? actor.scheduledCards : [];
            const delays = [...new Set((effect.delays || [1, 2]).map((delay) => Math.max(1, Math.min(3, Math.floor(Number(delay) || 1)))))];
            delays.forEach((turns) => actor.scheduledCards.push({ cardId: effect.cardId, turns, level }));
            actor.scheduledCards = actor.scheduledCards.slice(-8);
            messages.push(`${generated ? `立即获得1张Lv.${level}` : '未能立即获得'}${PEAK_CARD_BY_ID[effect.cardId]?.name || effect.cardId}，之后两个回合各再获得1张`);
        } else if (effect.type === 'copyPreviousCard') {
            const categories = Array.isArray(effect.categories) && effect.categories.length ? effect.categories : ['attack', 'skill'];
            const previous = [...(battle.roundCards?.[actorKey] || [])].reverse().find((entry) => categories.includes(entry.category));
            if (!previous) messages.push('本回合没有可复制的进攻牌或技能牌');
            else if (addGeneratedCardToHand(battle, actorKey, previous.cardId, previous.levelOverride || 0)) messages.push(`复制「${PEAK_CARD_BY_ID[previous.cardId]?.name || previous.cardId}」到手牌`);
            else messages.push('手牌已满，复制的卡牌未能加入手牌');
        } else if (effect.type === 'drawCategory') {
            const drawn = drawCategoryFor(battle, actorKey, effect.category, effect.value || 1);
            messages.push(drawn ? `检索${drawn}张${PEAK_CARD_BY_ID[instance.cardId]?.category === effect.category ? '' : effect.category === 'attack' ? '进攻' : effect.category}牌` : '牌库中没有可检索的牌');
        } else if (effect.type === 'discardForRandomCategories') {
            const handKey = actorKey === 'player' ? 'hand' : 'enemyHand';
            const discardKey = actorKey === 'player' ? 'discardPile' : 'enemyDiscardPile';
            const discardCategories = new Set(effect.discardCategories || []);
            const eligible = battle[handKey].flatMap((candidate, index) => discardCategories.has(battleCard(candidate, actorKey)?.category) ? [index] : []);
            if (!eligible.length) messages.push('没有可丢弃的进攻牌或技能牌');
            else {
                const discardIndex = eligible[Math.min(eligible.length - 1, Math.floor(nextBattleRandom(battle) * eligible.length))];
                const [discarded] = battle[handKey].splice(discardIndex, 1);
                battle[discardKey].push(discarded);
                const drawn = drawRandomCategoriesFor(battle, actorKey, effect.drawCategories || [], Math.max(1, Number(effect.draw) || 2));
                messages.push(`丢弃「${battleCard(discarded, actorKey)?.name || discarded.cardId}」，从牌库获得${drawn}张防守或增益牌`);
            }
        } else if (effect.type === 'recoverDiscard') {
            const recovered = recoverDiscardFor(battle, actorKey, effect.value || 1, effect.category);
            messages.push(recovered ? `回收${recovered}张${categoryNames[effect.category] || ''}弃牌` : '弃牌堆中没有符合条件的牌');
        } else if (effect.type === 'shieldToMp') {
            const ratio = Math.max(0, Math.round(scaledRangeOrFixedValue(effect, level, 'minValue', 'maxValue')));
            const available = Math.round(actor.shield * ratio / 100);
            const converted = Math.min(available, Math.max(0, actor.maxMp - actor.mp));
            actor.shield -= converted;
            actor.mp += converted;
            messages.push(converted ? `转化${converted}护盾为MP` : '护盾转化未生效');
        } else if (effect.type === 'retainShield') {
            const ratio = Math.min(60, Math.max(0, Math.round(effect.value * getPeakLevelMultiplier(card, level))));
            actor.shieldRetention = Math.max(Number(actor.shieldRetention) || 0, ratio);
            messages.push(`下回合保留${ratio}%护盾`);
        } else if (effect.type === 'vowGain') {
            const gained = Math.max(1, Math.min(3, Math.floor(Number(effect.value) || 1)));
            const current = actor.vow || { stacks: 0, max: 5 };
            const before = current.stacks;
            current.stacks = Math.min(current.max, current.stacks + gained);
            actor.vow = current;
            messages.push(`积攒誓约${gained}层（${before} → ${current.stacks}/${current.max}）`);
        } else if (effect.type === 'vowSpend') {
            if (vowStacksSpent > 0) {
                const current = actor.vow || { stacks: 0, max: 5 };
                visual.vowSpent = vowStacksSpent;
                messages.push(`消耗${vowStacksSpent}层誓约，本牌伤害提高${Math.round(vowDamageBonus * 100)}%`);
                current.stacks = Math.max(0, current.stacks - vowStacksSpent);
                actor.vow = current;
            } else {
                messages.push('誓约蓄力未就绪');
            }
        } else if (effect.type === 'bleedAmplify') {
            const targetBleed = bleedStacksRead;
            if (targetBleed > 0) {
                visual.bleedAmplified = targetBleed;
                const bonus = Math.round(bleedAmplifyBonus * 100);
                messages.push(`流血追击：目标${targetBleed}层流血，伤害提高${bonus}%`);
            }
        } else if (effect.type === 'comboEscalate') {
            if (comboChainLength > 0) {
                visual.comboChain = comboChainLength;
                messages.push(`连段第${comboChainLength + 1}段，伤害提高${Math.round(comboEscalateBonus * 100)}%`);
            } else {
                messages.push('连段尚未起势');
            }
        } else if (effect.type === 'scheduleBlessing') {
            const turns = Math.max(1, Math.min(3, Math.floor(Number(effect.turns) || 2)));
            const blessingType = effect.blessingType || 'heal';
            const value = Math.max(1, Math.round(Math.floor(Number(effect.value) || 10)
                * (['heal', 'shield'].includes(blessingType) ? defenseEmpowerMultiplier : 1)));
            const entry = { type: blessingType, turns, value, name: effect.name || '祝福' };
            actor.blessedSchedules = actor.blessedSchedules || [];
            actor.blessedSchedules.push(entry);
            const typeName = blessingType === 'heal' ? '治疗' : blessingType === 'shield' ? '护盾' : '净化';
            messages.push(`埋设${turns}回合后的${typeName}（${value}）`);
        } else if (effect.type === 'empower') {
            const value = Math.min(40, Math.max(1, Math.round(effect.value * getPeakLevelMultiplier(card, level))));
            actor.empowerments = Array.isArray(actor.empowerments) ? actor.empowerments : [];
            const existing = actor.empowerments.find((entry) => entry.category === effect.category);
            if (existing) { existing.value = Math.max(existing.value, value); existing.uses = Math.max(existing.uses, effect.uses || 1); }
            else actor.empowerments.push({ category: effect.category, value, uses: effect.uses || 1 });
            messages.push(effect.category === 'defense'
                ? `下一张防守牌的护盾和治疗提高${value}%`
                : `下一张${effect.category === 'attack' ? '进攻' : '技能'}牌伤害提高${value}%`);
        } else if (effect.type === 'status') {
            const statusTarget = effect.target === 'self' ? actor : target;
            const harmful = PEAK_STATUS_EFFECTS[effect.status]?.harmful;
            const immune = harmful && (statusTarget.debuffImmunity || (statusTarget === target && phoenixTriggeredThisCard));
            const blocked = harmful && statusTarget.statusWard?.charges > 0;
            if (immune) {
                visual.statusTarget = effect.target === 'self' ? actorKey : targetKey;
                visual.statusBlocked = effect.status;
                messages.push(`${phoenixTriggeredThisCard ? '浴火金身' : '负面免疫'}抵消${PEAK_STATUS_EFFECTS[effect.status]?.name || effect.status}`);
                return;
            }
            if (blocked) {
                statusTarget.statusWard.charges -= 1;
                if (statusTarget.statusWard.charges <= 0) statusTarget.statusWard = null;
                visual.statusTarget = effect.target === 'self' ? actorKey : targetKey;
                visual.statusBlocked = effect.status;
                messages.push(`异常屏障抵消${PEAK_STATUS_EFFECTS[effect.status]?.name || effect.status}`);
                return;
            }
            const spreadStacks = harmful ? Math.max(0, Math.floor(Number(blessing.harmfulStatusStackBonus) || 0)) : 0;
            const spreadDuration = harmful ? Math.max(0, Math.floor(Number(blessing.harmfulStatusDurationBonus) || 0)) : 0;
            const routeStacks = harmful && statusTarget === target ? routeStatusStackBonus(actor, effect.status) : 0;
            const statusEcho = statusTarget === target ? statusEchoFor(actor, effect.status) : null;
            const echoStacks = Math.max(0, Math.floor(Number(statusEcho?.bonusStacks) || 0));
            const echoDuration = Math.max(0, Math.floor(Number(statusEcho?.durationBonus) || 0));
            const status = addPeakStatus(statusTarget, effect.status, (effect.stacks || 1) + spreadStacks + routeStacks + echoStacks, (effect.duration || 1) + spreadDuration + echoDuration);
            if (status) {
                if (statusEcho) consumeStatusEcho(actor);
                visual.statusTarget = effect.target === 'self' ? actorKey : targetKey;
                visual.statusesApplied.push(effect.status);
                if (harmful && statusTarget === target) harmfulStatusesAppliedToTarget += 1;
                messages.push(`${PEAK_STATUS_EFFECTS[effect.status]?.name || effect.status} ${status.stacks}层${spreadStacks || spreadDuration ? `（元素蔓延 +${spreadStacks}层${spreadDuration ? `，持续+${spreadDuration}` : ''}）` : ''}${routeStacks ? `（转职强化 +${routeStacks}层）` : ''}${statusEcho ? `（特殊牌回响 +${echoStacks}层${echoDuration ? `，持续+${echoDuration}` : ''}）` : ''}`);
            }
        } else if (effect.type === 'cleanse') {
            const removed = cleansePeakStatuses(actor, effect.value || 1);
            messages.push(removed.length ? `净化${removed.length}个负面状态` : '净化生效');
        } else if (effect.type === 'spellChargeSpend') {
            if (spellChargeStacksSpent > 0) {
                if (actor.spellCharge) actor.spellCharge.value = 0;
                visual.spellChargeSpent = spellChargeStacksSpent;
                messages.push(`引爆${spellChargeStacksSpent}层法力充能，本牌伤害提高${Math.round(spellChargeDamageBonus * 100)}%`);
            } else {
                messages.push('没有可引爆的法力充能');
            }
        } else if (effect.type === 'spellCharge') {
            const max = Math.max(1, Math.floor(Number(effect.max) || SPELL_CHARGE_DEFAULT_MAX));
            if (!actor.spellCharge) actor.spellCharge = { value: 0, max };
            actor.spellCharge.max = Math.max(actor.spellCharge.max || 0, max);
            const gained = gainSpellCharge(actor, Math.max(1, Math.floor(Number(effect.value) || 1)));
            visual.spellChargeGained = (Number(visual.spellChargeGained) || 0) + gained;
            visual.spellChargeAfter = spellChargeValue(actor);
            messages.push(gained > 0
                ? `积蓄${gained}层法力充能（当前${spellChargeValue(actor)}/${spellChargeMax(actor)}）`
                : `法力充能已满（${spellChargeValue(actor)}/${spellChargeMax(actor)}）`);
        } else if (effect.type === 'timedFuse') {
            const turns = Math.max(1, Math.floor(Number(effect.turns) || 2));
            const damage = calculatePeakEffectValue(effect, actor.stats, card, level);
            const targetCombatant = effect.target === 'self' ? actor : target;
            if (!Array.isArray(targetCombatant.timedFuses)) targetCombatant.timedFuses = [];
            targetCombatant.timedFuses.push({
                name: effect.name || card.name,
                turns,
                damage,
                element: effect.element || '',
            });
            visual.fusePlanted = turns;
            visual.fuseTarget = effect.target === 'self' ? actorKey : targetKey;
            messages.push(`埋下延迟引信：${turns}回合后对${effect.target === 'self' ? '自己' : '对手'}造成${damage}点伤害`);
        } else if (effect.type === 'vowShield') {
            const vowStacks = Math.max(0, Math.floor(Number(actor.vow?.stacks) || 0));
            if (vowStacks > 0) {
                const stacksSpent = Math.min(Math.max(1, Math.floor(Number(effect.maxStacks) || 5)), vowStacks);
                const shieldPerStack = Math.max(0, Math.floor(Number(effect.shieldPerStack) || 0));
                const sustainMultiplier = 1 + Math.max(0, Number(actor.roundTradeoff?.sustainBonus) || 0) / 100;
                const shieldGained = Math.max(0, Math.round(stacksSpent * shieldPerStack * sustainMultiplier * defenseEmpowerMultiplier));
                if (actor.vow) actor.vow.stacks = 0;
                actor.shield += shieldGained;
                visual.shieldGained += shieldGained;
                visual.vowSpent = (Number(visual.vowSpent) || 0) + stacksSpent;
                messages.push(`消耗${stacksSpent}层誓约，获得${shieldGained}点护盾`);
            } else {
                messages.push('没有可消耗的誓约');
            }
        } else if (effect.type === 'bleedHarvest') {
            if (bleedHarvestStacks > 0) {
                const damagePerStack = Math.max(0, Math.floor(Number(effect.damagePerStack) || 0));
                const harvestResult = calculatePeakDamage({
                    effect: { type: 'damage', base: damagePerStack * bleedHarvestStacks, damageType: 'true' },
                    card, level, actor, target, random: () => nextBattleRandom(battle),
                });
                const received = applyPeakDamageToCombatant(target, harvestResult.damage);
                target.statuses = (target.statuses || []).filter((entry) => entry.id !== 'bleed' && entry.status !== 'bleed');
                visual.hpDamage += received.hpDamage;
                visual.shieldDamage += received.absorbed;
                visual.bleedHarvested = bleedHarvestStacks;
                visual.lastStand ||= Boolean(received.lastStandShield);
                visual.phoenixTriggered ||= Boolean(received.phoenixTriggered);
                if (received.phoenixTriggered) visual.phoenixTarget = targetKey;
                phoenixTriggeredThisCard ||= Boolean(received.phoenixTriggered);
                dealtDamage = true;
                messages.push(`收割${bleedHarvestStacks}层流血，造成${received.hpDamage + received.absorbed}点真实伤害`);
            } else {
                messages.push('目标没有流血层数可收割');
            }
        } else if (effect.type === 'arcaneCascade') {
            if (arcaneCascadeCharges > 0) {
                const damagePerCharge = Math.max(0, Math.floor(Number(effect.damagePerCharge) || 0));
                const element = effect.element || '';
                const cascadeResult = calculatePeakDamage({
                    effect: { type: 'damage', base: damagePerCharge * arcaneCascadeCharges, damageType: 'magical', element },
                    card, level, actor, target, random: () => nextBattleRandom(battle),
                });
                const received = applyPeakDamageToCombatant(target, cascadeResult.damage);
                if (actor.spellCharge) actor.spellCharge.value = 0;
                visual.hpDamage += received.hpDamage;
                visual.shieldDamage += received.absorbed;
                visual.arcaneCascadeCharges = arcaneCascadeCharges;
                visual.element ||= cascadeResult.element || element || '';
                visual.lastStand ||= Boolean(received.lastStandShield);
                visual.phoenixTriggered ||= Boolean(received.phoenixTriggered);
                if (received.phoenixTriggered) visual.phoenixTarget = targetKey;
                phoenixTriggeredThisCard ||= Boolean(received.phoenixTriggered);
                dealtDamage = true;
                messages.push(`引爆${arcaneCascadeCharges}层充能，级联追加${received.hpDamage + received.absorbed}点${elementNames[element] || ''}伤害`);
            } else {
                messages.push('没有可引爆的法力充能');
            }
        } else if (effect.type === 'blessingHasten') {
            const pending = Array.isArray(actor.blessedSchedules) ? actor.blessedSchedules : [];
            if (pending.length > 0) {
                const turns = Math.max(1, Math.floor(Number(effect.turns) || 1));
                const bonusPercent = Math.max(0, Math.floor(Number(effect.bonusPercent) || 0));
                actor.blessedSchedules = pending.map((schedule) => ({
                    ...schedule,
                    turns: Math.max(1, Math.floor(Number(schedule.turns) || 1) - turns),
                    value: Math.max(0, Math.round((Number(schedule.value) || 0) * (1 + bonusPercent / 100))),
                }));
                visual.blessingsHastened = pending.length;
                messages.push(`${pending.length}个祝福提前${turns}回合，兑现值提高${bonusPercent}%`);
            } else {
                messages.push('没有待兑现的祝福');
            }
        }
    });
    if (queueMechanic.triggered && !nullifiedByStun && !nullifiedByDisruption) {
        visual.queueMechanicTriggered = true;
        const reward = queueMechanic.reward;
        let rewardMessage = '';
        if (reward?.type === 'restoreMp') {
            const amount = Math.max(0, Math.round(scaledRangeValue(reward, level, 'minValue', 'maxValue')));
            const restored = Math.min(amount, actor.maxMp - actor.mp);
            actor.mp += restored;
            rewardMessage = `，恢复${restored}MP`;
        } else if (reward?.type === 'shield') {
            const amount = Math.max(0, Math.round(scaledRangeValue(reward, level, 'minValue', 'maxValue')));
            actor.shield += amount;
            visual.shieldGained += amount;
            rewardMessage = `，获得${amount}点护盾`;
        } else if (reward?.type === 'status' && target.hp > 0) {
            const statusName = PEAK_STATUS_EFFECTS[reward.status]?.name || reward.status;
            if (target.debuffImmunity || phoenixTriggeredThisCard) rewardMessage = `，但${statusName}被负面免疫抵消`;
            else if (target.statusWard?.charges > 0) {
                target.statusWard.charges -= 1;
                if (target.statusWard.charges <= 0) target.statusWard = null;
                visual.statusBlocked = reward.status;
                rewardMessage = `，但${statusName}被异常屏障抵消`;
            } else {
                const spreadStacks = Math.max(0, Math.floor(Number(blessing.harmfulStatusStackBonus) || 0));
                const spreadDuration = Math.max(0, Math.floor(Number(blessing.harmfulStatusDurationBonus) || 0));
                const routeStacks = routeStatusStackBonus(actor, reward.status);
                const statusEcho = statusEchoFor(actor, reward.status);
                const echoStacks = Math.max(0, Math.floor(Number(statusEcho?.bonusStacks) || 0));
                const echoDuration = Math.max(0, Math.floor(Number(statusEcho?.durationBonus) || 0));
                addPeakStatus(target, reward.status, (reward.stacks || 1) + spreadStacks + routeStacks + echoStacks, (reward.duration || 1) + spreadDuration + echoDuration);
                if (statusEcho) consumeStatusEcho(actor);
                visual.statusTarget = targetKey;
                visual.statusesApplied.push(reward.status);
                harmfulStatusesAppliedToTarget += 1;
                rewardMessage = `，施加${(reward.stacks || 1) + routeStacks + echoStacks}层${statusName}`;
            }
        }
        messages.push(`队列构成触发：${queueMechanic.categoryCount}种卡牌类别使伤害提高${Math.round(queueMechanic.damageBonus * 100)}%${rewardMessage}`);
    }
    if (styleFollowRule?.status && !nullifiedByStun && !nullifiedByDisruption) {
        const harmful = PEAK_STATUS_EFFECTS[styleFollowRule.status]?.harmful;
        if (harmful && target.debuffImmunity) messages.push(`流派追击未能穿透目标的负面免疫`);
        else if (harmful && target.statusWard?.charges > 0) {
            target.statusWard.charges -= 1;
            if (target.statusWard.charges <= 0) target.statusWard = null;
            messages.push(`异常屏障抵消流派追击的${PEAK_STATUS_EFFECTS[styleFollowRule.status]?.name || styleFollowRule.status}`);
        } else {
            const spreadStacks = harmful ? Math.max(0, Math.floor(Number(blessing.harmfulStatusStackBonus) || 0)) : 0;
            const spreadDuration = harmful ? Math.max(0, Math.floor(Number(blessing.harmfulStatusDurationBonus) || 0)) : 0;
            const routeStacks = harmful ? routeStatusStackBonus(actor, styleFollowRule.status) : 0;
            const statusEcho = statusEchoFor(actor, styleFollowRule.status);
            const echoStacks = Math.max(0, Math.floor(Number(statusEcho?.bonusStacks) || 0));
            const echoDuration = Math.max(0, Math.floor(Number(statusEcho?.durationBonus) || 0));
            const status = addPeakStatus(target, styleFollowRule.status, (styleFollowRule.stacks || 1) + spreadStacks + routeStacks + echoStacks, (styleFollowRule.duration || 1) + spreadDuration + echoDuration);
            if (status) {
                if (statusEcho) consumeStatusEcho(actor);
                visual.statusTarget = targetKey;
                visual.statusesApplied.push(styleFollowRule.status);
                if (harmful) harmfulStatusesAppliedToTarget += 1;
                messages.push(`流派追击施加${PEAK_STATUS_EFFECTS[styleFollowRule.status]?.name || styleFollowRule.status}${routeStacks ? `（转职强化 +${routeStacks}层）` : ''}${statusEcho ? `（特殊牌回响 +${echoStacks}层${echoDuration ? `，持续+${echoDuration}` : ''}）` : ''}`);
            }
        }
    }
    if (routeCombat && routeResource && !nullifiedByStun && !nullifiedByDisruption) {
        if (routeResourceSpent && dealtDamage) {
            const preserved = Math.max(0, Math.floor(Number(actor.routeResourcePreserveUses) || 0)) > 0;
            if (preserved) actor.routeResourcePreserveUses -= 1;
            else {
                routeResource.value = 0;
                visual.routeResourceConsumed = true;
            }
            messages.push(`${routeResource.name}已满，本牌伤害提高${Math.round(routeDamageBonus * 100)}%${preserved ? '，特殊牌封存使资源未被消耗' : ''}`);
        }
        const resourceGain = routeCombat.trigger === 'iceDamage' && dealtDamage && hasIceDamage ? 1
            : routeCombat.trigger === 'defenseCard' && card.category === 'defense' ? 1
                : routeCombat.trigger === 'damageHit' ? resolvedDamageHits
                    : routeCombat.trigger === 'harmfulStatus' ? harmfulStatusesAppliedToTarget
                        : 0;
        const gained = gainRouteResource(actor, resourceGain);
        visual.routeResourceGained += gained;
        visual.routeResourceAfter = routeResourceValue(actor);
        if (gained > 0) messages.push(`${routeResource.name} +${gained}（${routeResource.value}/${routeResource.max}）`);
    }
    if (card.recycleOnResolve && !instance.exhaustAfterUse && !instance.recycledOnce && !nullifiedByStun && !nullifiedByDisruption) {
        instance.movedToRecovery = true;
        battle.recoveryZone = Array.isArray(battle.recoveryZone) ? battle.recoveryZone : [];
        battle.recoveryZone.push({
            uid: `${instance.uid}-recovery`, cardId: card.id, recycledOnce: true,
            damagePenalty: Math.max(0, Math.min(80, Number(card.recycleOnResolve.damagePenalty) || 0)),
            states: [...(card.recycleOnResolve.states || [])],
        });
        messages.push(`进入追击区，目标变为${(card.recycleOnResolve.states || []).map((entry) => PEAK_COMBAT_STATES[entry] || entry).join('或')}时返回手牌`);
    }
    const defenseEmpowered = defenseEmpowerMultiplier > 1 && !nullifiedByStun && !nullifiedByDisruption;
    if (defenseEmpowered) messages.push(`防守蓄势：本牌护盾和治疗提高${Math.round(empowerBonus * 100)}%`);
    if ((dealtDamage || defenseEmpowered) && empowerment) {
        empowerment.uses -= 1;
        actor.empowerments = actor.empowerments.filter((entry) => entry.uses > 0);
    }
    if (dealtDamage && damageEcho) {
        damageEcho.uses -= 1;
        if (damageEcho.uses <= 0) actor.damageEcho = null;
    }
    if (dealtDamage && forecastGuard) {
        const shield = Math.max(0, Math.round(forecastPrevented * forecastGuard.shieldRatio / 100));
        target.shield += shield;
        forecastGuard.uses -= 1;
        if (forecastGuard.uses <= 0) target.forecastGuard = null;
        visual.forecastShield = shield;
        messages.push(`预判架势减免${forecastPrevented}点伤害并转化为${shield}点护盾`);
    }
    if (dealtDamage && trueDamageConversion) {
        trueDamageConversion.uses -= 1;
        if (trueDamageConversion.uses <= 0) actor.trueDamageConversion = null;
        visual.trueDamageConverted = true;
        messages.push(`绝对贯通将本牌伤害转为真实伤害，伤害降低${trueDamageConversion.penalty}%`);
    }
    battle.roundCards = battle.roundCards || { player: [], enemy: [] };
    battle.roundCards[actorKey] = battle.roundCards[actorKey] || [];
    battle.roundCards[actorKey].push({
        cardId: card.id,
        category: card.category,
        attackStyle: card.attackStyle || '',
        resultState: target.state,
        stateApplied: visual.stateApplied || '',
        level,
        levelOverride: forcedLevel > 0 ? level : 0,
        cost: resolvedMpCost,
        elements: [...new Set(card.effects.filter((effect) => effect.type === 'damage' && effect.element).map((effect) => effect.element))],
        damageTypes: [...new Set(card.effects.filter((effect) => effect.type === 'damage').map((effect) => effect.damageType || 'physical'))],
    });
    const history = ensureRoundHistory(battle)[actorKey];
    history.cards.push({ cardId: card.id, category: card.category, attackStyle: card.attackStyle || '', resultState: target.state });
    history.hits += resolvedDamageHits;
    history.damage += Math.max(0, Number(visual.hpDamage) || 0) + Math.max(0, Number(visual.shieldDamage) || 0);
    battle.statistics = battle.statistics || { playerCardsPlayed: 0, enemyCardsPlayed: 0, playerHits: 0, playerDamage: 0, completedDeclarations: 0, completedStateRoutes: 0 };
    if (actorKey === 'player') {
        battle.statistics.playerCardsPlayed += 1;
        battle.statistics.playerHits += resolvedDamageHits;
        battle.statistics.playerDamage += Math.max(0, Number(visual.hpDamage) || 0) + Math.max(0, Number(visual.shieldDamage) || 0);
    } else battle.statistics.enemyCardsPlayed += 1;
    const owner = actorKey === 'player' ? '你' : actor.name;
    if (nullifiedByDisruption) messages.unshift('捣蛋鬼使本牌效果完全无效');
    if (nullifiedByStun) messages.unshift('眩晕使本牌除状态变化外的效果无效');
    const text = `${owner}打出「${card.name}」：${messages.join('，') || '效果生效'}。`;
    appendLog(battle, actorKey === 'player' ? 'card' : 'enemy', text);
    addFrame(frames, battle, actorKey, card, text, 'card', level, visual);
};

const expireReactiveDefenses = (combatant) => {
    combatant.guards = (combatant.guards || []).map((guard) => ({ ...guard, duration: guard.duration - 1 })).filter((guard) => guard.duration > 0 && guard.uses > 0);
    ['manaBarriers', 'thorns', 'damageCaps', 'shieldBreaks'].forEach((key) => {
        combatant[key] = (combatant[key] || []).map((entry) => ({ ...entry, duration: entry.duration - 1 })).filter((entry) => entry.duration > 0 && entry.uses > 0);
    });
    if (combatant.statusWard) {
        combatant.statusWard.duration -= 1;
        if (combatant.statusWard.duration <= 0 || combatant.statusWard.charges <= 0) combatant.statusWard = null;
    }
    if (combatant.lastStand) {
        if (!combatant.lastStand.persistent) combatant.lastStand.duration -= 1;
        if (combatant.lastStand.duration <= 0 || combatant.lastStand.charges <= 0) combatant.lastStand = null;
    }
    if (combatant.phoenixWard) {
        combatant.phoenixWard.duration -= 1;
        if (combatant.phoenixWard.duration <= 0 || combatant.phoenixWard.charges <= 0) combatant.phoenixWard = null;
    }
};

const createEnemyCombatant = (source) => {
    const stats = clone(source.stats || {
        physicalAttack: source.combatAttack || source.attack || 8,
        magicalAttack: Math.max(6, Math.round((source.combatAttack || source.attack || 8) * .9)),
        vitality: Math.max(5, Math.round(source.maxHp / 35)),
        spirit: Math.max(5, Math.round(source.maxHp / 42)),
        physicalDefense: source.physicalDefense || 10,
        magicalDefense: source.magicalDefense || 8,
        damageIncrease: 0,
        skillAttack: 0,
        criticalDamage: 0,
        damageReduction: 0,
        physicalCrit: Math.min(35, 3 + Math.floor((source.cardLevel || 1) * 1.5)),
        magicalCrit: Math.min(35, 3 + Math.floor((source.cardLevel || 1) * 1.5)),
        allElement: Math.max(0, (source.cardLevel || 1) * 2),
        elementalResistance: Math.max(0, (source.cardLevel || 1) * 2),
    });
    const maxMp = Math.max(1, Math.floor(Number(source.maxMp) || 60));
    return {
        ...clone(source),
        stats,
        cardLevel: Math.max(1, Math.min(10, Math.floor(Number(source.cardLevel) || 1))),
        drawPerTurn: Math.max(1, Math.min(10, Math.floor(Number(source.drawPerTurn) || 3))),
        nextTurnDraw: 0,
        nextTurnDrawPenalty: 0,
        nextTurnDamageBoosts: [],
        scheduledCards: [],
        scheduledSpecialHeals: [],
        hp: source.maxHp,
        maxMp,
        mp: maxMp,
        shield: 0,
        shieldRetention: 0,
        empowerments: [],
        guards: [],
        manaBarriers: [],
        thorns: [],
        damageCaps: [],
        shieldBreaks: [],
        statusWard: null,
        lastStand: null,
        stunCharges: 0,
        cardDisruptions: [],
        debuffImmunity: null,
        phoenixWard: null,
        roundDamageBoosts: [],
        roundPenetration: null,
        drawnSword: null,
        roundTradeoff: null,
        damageConversions: [],
        shieldVanguard: null,
        unstableMagic: null,
        nullifyInsurance: null,
        overhealShieldRatio: 0,
        spentMpShield: null,
        damageEcho: null,
        handReserveShield: null,
        forecastGuard: null,
        tacticalRewind: null,
        trueDamageConversion: null,
        routeResourcePreserveUses: 0,
        routeStatusEcho: null,
        state: 'standing',
        buffs: [],
        statuses: [],
        delayedBursts: [],
        timedFuses: [],
        spellCharge: { value: 0, max: 5 },
        vow: { stacks: 0, max: 5 },
        blessedSchedules: [],
    };
};

export const createPeakBattle = ({ deck, player, enemy, encounters = [], dungeonId, seed = Date.now() }) => {
    const playerStats = clone(player.stats || {});
    const playerBlessings = clone(player.blessingEffects || {});
    const playerAdvancement = clone(player.advancement || { tier: 0, pathId: '' });
    const advancementDefinition = PEAK_ADVANCEMENTS[playerAdvancement.pathId];
    const advancementCombat = playerAdvancement.tier > 0 && advancementDefinition?.combat ? clone(advancementDefinition.combat) : null;
    const routeMax = advancementCombat ? Math.max(1, Math.floor(Number(playerAdvancement.tier >= 2 ? advancementCombat.secondMax : advancementCombat.max) || 1)) : 0;
    const baseShieldRetention = advancementCombat
        ? Math.max(0, Math.min(100, Number(playerAdvancement.tier >= 2 ? advancementCombat.secondShieldRetention : advancementCombat.shieldRetention) || 0))
        : 0;
    const blessingLastStand = Math.max(0, Math.min(20, Number(playerBlessings.blessingLastStandShieldPercent) || 0));
    const encounterList = (encounters.length ? encounters : [enemy]).map((entry) => clone(entry));
    const firstEnemy = createEnemyCombatant(encounterList[0]);
    const battle = {
        version: 2,
        dungeonId,
        seed: Number(seed) || 1,
        randomCounter: 0,
        round: 1,
        phase: 'playerPlanning',
        player: { ...clone(player), advancement: playerAdvancement, advancementCombat, routeResource: advancementCombat ? { id: advancementCombat.resourceId, name: advancementCombat.resourceName, color: advancementCombat.color, value: 0, max: routeMax } : null, baseShieldRetention, blessingEffects: playerBlessings, stats: playerStats, cardLevels: clone(player.cardLevels || {}), drawPerTurn: Math.max(1, Math.min(10, Math.floor(Number(player.drawPerTurn) || 2))), drawInterval: Math.max(0, Math.floor(Number(player.drawInterval) || 0)), openingHandBonus: Math.max(0, Math.min(4, Math.floor(Number(player.openingHandBonus) || 0))), nextTurnDraw: 0, nextTurnDrawPenalty: 0, nextTurnDamageBoosts: [], scheduledCards: [], scheduledSpecialHeals: [], hp: player.maxHp, mp: player.maxMp, shield: Math.max(0, Math.floor(Number(player.startingShield) || 0)), shieldRetention: baseShieldRetention, empowerments: [], guards: [], manaBarriers: [], thorns: [], damageCaps: [], shieldBreaks: [], statusWard: null, lastStand: blessingLastStand ? { charges: 1, shieldPercent: blessingLastStand, duration: 999, persistent: true } : null, phoenixWard: null, cardDisruptions: [], debuffImmunity: null, roundDamageBoosts: [], roundPenetration: null, drawnSword: null, roundTradeoff: null, damageConversions: [], shieldVanguard: null, unstableMagic: null, nullifyInsurance: null, overhealShieldRatio: 0, spentMpShield: null, damageEcho: null, handReserveShield: null, forecastGuard: null, tacticalRewind: null, trueDamageConversion: null, routeResourcePreserveUses: 0, routeStatusEcho: null, stunCharges: 0, state: 'standing', buffs: [], statuses: [], delayedBursts: [], timedFuses: [], spellCharge: { value: 0, max: 5 }, vow: { stacks: 0, max: 5 }, blessedSchedules: [] },
        enemy: firstEnemy,
        encounters: encounterList,
        encounterIndex: 0,
        encounterRound: 1,
        pendingDrops: [],
        recoveryZone: [],
        exhaustPile: [],
        drawPile: shuffled(makeInstances(deck, 'p'), seed),
        hand: [],
        queue: [],
        discardPile: [],
        enemyDrawPile: shuffled(makeInstances(firstEnemy.deck || ['enemy_claw'], 'e0'), seed + 431),
        enemyHand: [],
        enemyQueue: [],
        enemyDiscardPile: [],
        enemyIntent: { cards: 0, attacks: 0, defense: false, mpCost: 0, names: [], draw: firstEnemy.drawPerTurn },
        bomb: null,
        roundCards: { player: [], enemy: [] },
        roundHistory: emptyRoundHistory(),
        tacticalDeclarationId: '',
        tacticalDeclarationResult: null,
        statistics: { playerCardsPlayed: 0, enemyCardsPlayed: 0, playerHits: 0, playerDamage: 0, completedDeclarations: 0, completedStateRoutes: 0 },
        log: [{ type: 'system', text: '对决开始，第一回合不额外抽牌。', round: 1 }],
        createdAt: Date.now(),
    };
    const openingLevelBonus = Number(battle.player.level) >= 15 ? 1 : 0;
    drawFor(battle, 'player', 4 + battle.player.openingHandBonus + openingLevelBonus);
    if (battle.player.openingHandBonus > 0 || openingLevelBonus > 0) appendLog(battle, 'blessing', `开局手牌加成生效，额外抽取${battle.player.openingHandBonus + openingLevelBonus}张牌。`);
    return battle;
};

const advancePeakEncounter = (battle, frames) => {
    const current = battle.enemy;
    const nextIndex = battle.encounterIndex + 1;
    if (!battle.encounters?.[nextIndex]) return false;
    addBossDefeatedFrame(frames, battle);
    if (!current.isBoss && current.dropChance > 0 && nextBattleRandom(battle) < current.dropChance) {
        battle.pendingDrops.push({ sourceId: current.id, sourceName: current.name, encounter: battle.encounterIndex + 1 });
    }
    battle.encounterIndex = nextIndex;
    battle.encounterRound = 1;
    battle.enemy = createEnemyCombatant(battle.encounters[nextIndex]);
    battle.enemyDrawPile = shuffled(makeInstances(battle.enemy.deck || ['enemy_claw'], `e${nextIndex}`), battle.seed + 431 + nextIndex * 977);
    battle.enemyHand = [];
    battle.enemyQueue = [];
    battle.enemyDiscardPile = [];
    if (battle.recoveryZone?.length) {
        battle.discardPile.push(...battle.recoveryZone.map((entry) => ({ uid: entry.uid, cardId: entry.cardId })));
        battle.recoveryZone = [];
    }
    battle.round += 1;
    battle.player.state = 'standing';
    battle.bomb = null;
    battle.player.timedFuses = [];
    retainShieldForNextRound(battle.player);
    resolveBlessedSchedulesAtTurnStart(battle, 'player', frames);
    expireBuffs(battle.player);
    expireReactiveDefenses(battle.player);
    resetRoundSpecialEffects(battle.player);
    activateNextTurnDamageBoosts(battle.player);
    resolveScheduledSpecialHealing(battle, 'player', frames);
    const blessingDraw = battle.player.drawInterval > 0 && battle.round % battle.player.drawInterval === 0 ? 1 : 0;
    const delayedDraw = Math.max(0, Math.floor(Number(battle.player.nextTurnDraw) || 0));
    const drawPenalty = Math.max(0, Math.floor(Number(battle.player.nextTurnDrawPenalty) || 0));
    battle.player.nextTurnDraw = 0;
    battle.player.nextTurnDrawPenalty = 0;
    drawFor(battle, 'player', Math.max(0, battle.player.drawPerTurn + blessingDraw + delayedDraw - drawPenalty));
    const blessingMp = restoreBlessingDrawMp(battle.player, blessingDraw);
    const grantedCards = grantScheduledCardsForTurn(battle, 'player');
    battle.phase = 'playerPlanning';
    battle.roundCards = { player: [], enemy: [] };
    battle.roundHistory = emptyRoundHistory();
    battle.tacticalDeclarationId = '';
    battle.tacticalDeclarationResult = null;
    battle.enemyIntent = { cards: 0, attacks: 0, defense: false, mpCost: 0, names: [], draw: battle.enemy.drawPerTurn };
    const dropText = battle.pendingDrops.at(-1)?.encounter === nextIndex ? '，并发现一件待结算战利品' : '';
    const drawText = [blessingDraw ? `抽牌大师额外抽取1张牌${blessingMp ? `并恢复${blessingMp}MP` : ''}` : '', delayedDraw ? `无中生有额外抽取${delayedDraw}张牌` : '', drawPenalty ? `超前效果使抽牌减少${drawPenalty}张` : '', grantedCards.length ? `获得${grantedCards.map((name) => `Lv.1${name}`).join('、')}` : ''].filter(Boolean);
    const text = `${current.name}已被击败${dropText}。换场不会恢复生命与MP${drawText.length ? `，${drawText.join('，')}` : ''}，第${nextIndex + 1}/${battle.encounters.length}战开始：${battle.enemy.isBoss ? '首领 ' : ''}${battle.enemy.name}登场。`;
    appendLog(battle, 'wave', text);
    addFrame(frames, battle, 'system', null, text, 'wave');
    return true;
};

export const previewPeakQueueState = (battle) => battle.queue.reduce((state, entry) => {
    const definition = PEAK_CARD_BY_ID[entry.cardId];
    return definition ? getPeakCardResultState(definition, state) : state;
}, battle.enemy.state);

const targetStateReason = (card, state, check) => {
    const current = PEAK_COMBAT_STATES[state] || state;
    const result = PEAK_COMBAT_STATES[check.nextState] || check.nextState;
    if (check.reason === 'stateUnchanged') return `${card.name}不能连续保持目标的${current}状态`;
    const required = check.allowedStates.map((entry) => PEAK_COMBAT_STATES[entry] || entry).join('或');
    return `${card.name}不能作用于${current}目标，需要${required}${result ? `并转为${result}` : ''}`;
};

const hasRequiredPreviousCard = (battle, card, queuedEntries = []) => {
    const required = Array.isArray(card.requiresPreviousCard) ? card.requiresPreviousCard : [];
    if (!required.length) return true;
    const resolved = battle.roundCards?.player || [];
    const queued = queuedEntries.map((entry) => PEAK_CARD_BY_ID[entry.cardId]).filter(Boolean);
    return [...resolved, ...queued].some((entry) => required.includes(entry.category));
};

const hasRequiredRoundState = (battle, card, queuedEntries = []) => {
    const required = Array.isArray(card.requiresRoundStateApplied) ? card.requiresRoundStateApplied : [];
    if (!required.length) return true;
    const resolved = battle.roundCards?.player || [];
    const queuedStates = queuedEntries.map((entry) => {
        const definition = PEAK_CARD_BY_ID[entry.cardId];
        return definition?.effects?.find((effect) => effect.type === 'setState')?.value || definition?.attackState?.to || '';
    });
    return resolved.some((entry) => required.includes(entry.stateApplied)) || queuedStates.some((state) => required.includes(state));
};

const hasForbiddenPreviousCategory = (battle, card, queuedEntries = []) => {
    const forbidden = Array.isArray(card.requiresNoPreviousCategory) ? card.requiresNoPreviousCategory : [];
    if (!forbidden.length) return false;
    const resolved = battle.roundCards?.player || [];
    const queued = queuedEntries.map((entry) => PEAK_CARD_BY_ID[entry.cardId]).filter(Boolean);
    return [...resolved, ...queued].some((entry) => forbidden.includes(entry.category));
};

const previousCardReason = (card) => {
    const names = (card.requiresPreviousCard || []).map((category) => category === 'attack' ? '进攻牌' : category === 'skill' ? '技能牌' : category).join('或');
    return `${card.name}需要本回合先打出${names}`;
};

const roundStateReason = (card) => `${card.name}需要本回合先将目标变为${(card.requiresRoundStateApplied || []).map((state) => PEAK_COMBAT_STATES[state] || state).join('或')}`;
const noPreviousCategoryReason = (card) => `${card.name}要求本回合此前未打出${(card.requiresNoPreviousCategory || []).map((category) => category === 'attack' ? '进攻牌' : category).join('或')}`;
const hasRequiredDiscardCard = (battle, card) => {
    const categories = Array.isArray(card.requiresDiscardCategories) ? card.requiresDiscardCategories : [];
    return !categories.length || battle.hand.some((instance) => categories.includes(PEAK_CARD_BY_ID[instance.cardId]?.category));
};
const discardRequirementReason = (card) => `${card.name}需要手牌中保留至少一张${card.requiresDiscardCategories.map((category) => category === 'attack' ? '进攻牌' : category === 'skill' ? '技能牌' : category).join('或')}`;

export const specialLeadsQueue = (definition) => definition?.category === 'special'
    && !definition.requiresPreviousCard?.length
    && !definition.requiresRoundStateApplied?.length
    && !definition.requiresTargetState?.length;

export const PEAK_SPECIALS_PER_TURN = 1;

export const validatePeakQueue = (battle) => {
    if (Math.max(1, Math.floor(Number(battle.encounterRound) || 1)) === 1 && !battle.tacticalDeclarationId) {
        return { valid: false, invalidIndex: -1, reason: '每只怪物的第一回合必须先选择一项战术宣言' };
    }
    let targetState = battle.enemy.state;
    let spentMp = 0;
    let specials = (battle.roundCards?.player || []).filter((entry) => entry.category === 'special').length;
    for (let index = 0; index < battle.queue.length; index += 1) {
        const definition = PEAK_CARD_BY_ID[battle.queue[index].cardId];
        if (!definition) return { valid: false, invalidIndex: index, reason: '队列中存在未知卡牌' };
        if (definition.category === 'special') {
            specials += 1;
            if (specials > PEAK_SPECIALS_PER_TURN) return { valid: false, invalidIndex: index, reason: '每回合只能使用一张特殊牌' };
            if (specialLeadsQueue(definition) && index !== 0) return { valid: false, invalidIndex: index, reason: `${definition.name}必须结算于队列最左侧` };
        }
        if (definition.requiresQueueLast && index !== battle.queue.length - 1) return { valid: false, invalidIndex: index, reason: `${definition.name}必须位于队列最后` };
        if (!hasRequiredPreviousCard(battle, definition, battle.queue.slice(0, index))) return { valid: false, invalidIndex: index, reason: previousCardReason(definition) };
        if (!hasRequiredRoundState(battle, definition, battle.queue.slice(0, index))) return { valid: false, invalidIndex: index, reason: roundStateReason(definition) };
        if (hasForbiddenPreviousCategory(battle, definition, battle.queue.slice(0, index))) return { valid: false, invalidIndex: index, reason: noPreviousCategoryReason(definition) };
        if (definition.requiresLastHandCard && !battle.queue[index].conditionMetLastHand) return { valid: false, invalidIndex: index, reason: `${definition.name}必须作为手牌最后一张打出` };
        if (!hasRequiredDiscardCard(battle, definition)) return { valid: false, invalidIndex: index, reason: discardRequirementReason(definition) };
        spentMp += getPeakBattleCardCost(battle, 'player', definition, battle.queue.slice(0, index), battle.queue[index]);
        if (spentMp > battle.player.mp) return { valid: false, invalidIndex: index, reason: '队列消耗的MP超过当前MP' };
        const stateCheck = validatePeakCardTargetState(definition, targetState);
        if (!stateCheck.valid) return { valid: false, invalidIndex: index, reason: targetStateReason(definition, targetState, stateCheck) };
        targetState = stateCheck.nextState;
    }
    return { valid: true, invalidIndex: -1, targetState, spentMp };
};

export const peakQueueInsertIndex = (battle, definition) => (specialLeadsQueue(definition) ? 0 : battle.queue.length);

export const canQueuePeakCard = (battle, handIndex) => {
    if (battle.phase !== 'playerPlanning') return { ok: false, reason: '当前不能出牌' };
    const instance = battle.hand[handIndex];
    const definition = PEAK_CARD_BY_ID[instance?.cardId];
    if (!definition) return { ok: false, reason: '卡牌不存在' };
    if (definition.requiresLastHandCard && battle.hand.length !== 1) return { ok: false, reason: `${definition.name}必须作为手牌最后一张打出` };
    const insertIndex = peakQueueInsertIndex(battle, definition);
    const trial = { ...instance };
    if (definition.requiresLastHandCard) trial.conditionMetLastHand = true;
    const prospective = [...battle.queue];
    prospective.splice(insertIndex, 0, trial);
    const prospectiveHand = battle.hand.filter((_, index) => index !== handIndex);
    const queueCheck = validatePeakQueue({ ...battle, hand: prospectiveHand, queue: prospective });
    if (!queueCheck.valid) return { ok: false, reason: queueCheck.reason };
    return { ok: true, targetState: queueCheck.targetState, insertIndex };
};

export const queuePeakCard = (source, handIndex) => {
    const battle = clone(source);
    const check = canQueuePeakCard(battle, handIndex);
    if (!check.ok) return { ok: false, state: battle, reason: check.reason };
    const [instance] = battle.hand.splice(handIndex, 1);
    if (PEAK_CARD_BY_ID[instance.cardId]?.requiresLastHandCard) instance.conditionMetLastHand = true;
    battle.queue.splice(check.insertIndex, 0, instance);
    return { ok: true, state: battle };
};

export const unqueuePeakCard = (source, queueIndex) => {
    const battle = clone(source);
    if (battle.phase !== 'playerPlanning' || !battle.queue[queueIndex]) return { ok: false, state: battle, reason: '无法撤回这张卡' };
    const [instance] = battle.queue.splice(queueIndex, 1);
    battle.hand.push(instance);
    return { ok: true, state: battle };
};

export const discardPeakHandCards = (source, cardUids) => {
    const battle = clone(source);
    if (!['playerPlanning', 'playerDiscarding'].includes(battle.phase)) return { ok: false, state: battle, reason: '当前不能整理手牌' };
    const required = Math.max(0, battle.hand.length - PEAK_PLAYER_HAND_LIMIT);
    const selected = new Set(Array.isArray(cardUids) ? cardUids.filter((uid) => typeof uid === 'string') : []);
    if (!required) return { ok: true, state: battle, discarded: [] };
    if (selected.size !== required) return { ok: false, state: battle, reason: `需要选择${required}张牌丢弃` };
    const discarded = battle.hand.filter((entry) => selected.has(entry.uid));
    if (discarded.length !== required) return { ok: false, state: battle, reason: '弃牌选择中包含无效卡牌' };
    battle.hand = battle.hand.filter((entry) => !selected.has(entry.uid));
    battle.discardPile.push(...discarded);
    appendLog(battle, 'discard', `你在回合结束前丢弃了${discarded.length}张手牌。`);
    return { ok: true, state: battle, discarded };
};

const appendStatusFrames = (battle, frames, targetKey, events, timing) => {
    const target = battle[targetKey];
    events.forEach((event) => {
        const text = `${timing}：${target.name}${event.text}`;
        appendLog(battle, 'status', text);
        addFrame(frames, battle, targetKey, null, text, 'status', 0, {
            category: 'status',
            target: event.type === 'damage' ? targetKey : '',
            healingTarget: event.type === 'heal' ? targetKey : '',
            hpDamage: event.type === 'damage' ? event.value : 0,
            shieldDamage: 0,
            healing: event.type === 'heal' ? event.value : 0,
            critical: false,
            element: event.statusId === 'burn' ? 'fire' : event.statusId === 'poison' || event.statusId === 'bleed' ? 'dark' : event.statusId === 'frozen' ? 'ice' : '',
            statusId: event.statusId,
            phoenixTriggered: Boolean(event.phoenixTriggered),
            phoenixTarget: event.phoenixTriggered ? targetKey : '',
        });
    });
};

const tacticalDeclarationComplete = (battle, declaration) => {
    const history = ensureRoundHistory(battle).player;
    const cards = history.cards;
    const condition = declaration.condition;
    if (condition.type === 'exactCards') return cards.length === condition.value;
    if (condition.type === 'distinctCategories') return new Set(cards.map((card) => card.category)).size >= condition.value;
    if (condition.type === 'allCategory') return cards.length >= condition.minimum && cards.every((card) => card.category === condition.category);
    if (condition.type === 'stateRoute') return hasPeakStateRoute(history.stateTransitions, condition.route);
    if (condition.type === 'minimumHits') return history.hits >= condition.value;
    if (condition.type === 'damagePercent') return history.damage >= battle.enemy.maxHp * condition.value / 100;
    return false;
};

const resolveTacticalDeclaration = (battle, frames) => {
    if (!battle.tacticalDeclarationId || battle.tacticalDeclarationResult) return;
    const declaration = PEAK_TACTICAL_DECLARATIONS.find((entry) => entry.id === battle.tacticalDeclarationId);
    if (!declaration) return;
    battle.statistics = battle.statistics || { playerCardsPlayed: 0, enemyCardsPlayed: 0, playerHits: 0, playerDamage: 0, completedDeclarations: 0, completedStateRoutes: 0 };
    const completed = tacticalDeclarationComplete(battle, declaration);
    battle.tacticalDeclarationResult = { id: declaration.id, completed, round: battle.round };
    if (!completed) {
        const text = `战术宣言「${declaration.name}」未完成。`;
        appendLog(battle, 'tactical', text);
        addFrame(frames, battle, 'system', null, text, 'tactical');
        return;
    }
    const rewards = Array.isArray(declaration.rewards) ? declaration.rewards : declaration.reward ? [declaration.reward] : [];
    const rewardMessages = [];
    let shieldGained = 0;
    let healing = 0;
    rewards.forEach((reward) => {
        if (reward.type === 'shield') {
            const gained = Math.max(0, Math.floor(Number(reward.value) || 0));
            battle.player.shield += gained;
            shieldGained += gained;
            rewardMessages.push(`获得${gained}点护盾`);
        } else if (reward.type === 'restoreMp') {
            const restored = Math.min(Math.max(0, Math.floor(Number(reward.value) || 0)), battle.player.maxMp - battle.player.mp);
            battle.player.mp += restored;
            rewardMessages.push(`恢复${restored}MP`);
        } else if (reward.type === 'nextTurnDraw') {
            const draw = Math.max(0, Math.floor(Number(reward.value) || 0));
            battle.player.nextTurnDraw = Math.min(6, (Number(battle.player.nextTurnDraw) || 0) + draw);
            rewardMessages.push(`下回合额外抽${draw}张牌`);
        } else if (reward.type === 'empower') {
            const uses = Math.max(1, Math.floor(Number(reward.uses) || 1));
            battle.player.empowerments = Array.isArray(battle.player.empowerments) ? battle.player.empowerments : [];
            const existing = battle.player.empowerments.find((entry) => entry.category === reward.category);
            if (existing) { existing.value = Math.max(existing.value, reward.value); existing.uses = Math.max(existing.uses, uses); }
            else battle.player.empowerments.push({ category: reward.category, value: reward.value, uses });
            rewardMessages.push(`后续${uses}张${reward.category === 'attack' ? '进攻' : '技能'}牌伤害提高${reward.value}%`);
        } else if (reward.type === 'guard') {
            const uses = Math.max(1, Math.floor(Number(reward.uses) || 1));
            battle.player.guards = Array.isArray(battle.player.guards) ? battle.player.guards : [];
            battle.player.guards.push({ reduction: reward.reduction, uses, duration: reward.duration || 2, counterRatio: 0, restoreMp: 0 });
            battle.player.guards = battle.player.guards.slice(-3);
            rewardMessages.push(`获得${uses}次${reward.reduction}%格挡`);
        } else if (reward.type === 'statusWard') {
            const current = battle.player.statusWard || { charges: 0, duration: 0 };
            battle.player.statusWard = { charges: Math.min(3, current.charges + reward.value), duration: Math.max(current.duration, reward.duration || 2) };
            rewardMessages.push(`获得${reward.value}次异常屏障`);
        } else if (reward.type === 'healPercent') {
            const amount = Math.max(0, Math.round(battle.player.maxHp * reward.value / 100));
            const restored = Math.min(amount, battle.player.maxHp - battle.player.hp);
            battle.player.hp += restored;
            healing += restored;
            rewardMessages.push(`恢复${restored}点生命`);
        } else if (reward.type === 'cleanse') {
            const removed = cleansePeakStatuses(battle.player, reward.value || 1);
            rewardMessages.push(`净化${removed.length}种负面状态`);
        }
    });
    battle.statistics.completedDeclarations += 1;
    if (declaration.condition.type === 'stateRoute') battle.statistics.completedStateRoutes += 1;
    const text = `完成战术宣言「${declaration.name}」，${rewardMessages.join('，') || declaration.rewardText}。`;
    appendLog(battle, 'tactical', text);
    addFrame(frames, battle, 'player', null, text, 'tactical', 0, {
        category: 'tactical',
        target: shieldGained || healing ? 'player' : '',
        healingTarget: healing ? 'player' : '',
        shieldGained,
        healing,
    });
};

export const selectPeakTacticalDeclaration = (source, declarationId = '') => {
    const battle = clone(source);
    if (battle.phase !== 'playerPlanning') return { ok: false, state: battle, reason: '当前不能选择战术宣言' };
    if (Math.max(1, Math.floor(Number(battle.encounterRound) || 1)) !== 1) return { ok: false, state: battle, reason: '只有每只怪物的第一回合可以选择战术宣言' };
    if (battle.queue?.length || battle.roundCards?.player?.length) return { ok: false, state: battle, reason: '必须在首回合出牌前选择战术宣言' };
    if (!declarationId) return { ok: false, state: battle, reason: '战术宣言为必选，不能取消' };
    if (!PEAK_TACTICAL_DECLARATIONS.some((entry) => entry.id === declarationId)) return { ok: false, state: battle, reason: '战术宣言不存在' };
    battle.tacticalDeclarationId = declarationId;
    battle.tacticalDeclarationResult = null;
    return { ok: true, state: battle };
};

export const resolvePeakRound = (source) => {
    const battle = clone(source);
    const frames = [];
    const resumingAfterDiscard = battle.phase === 'playerDiscarding';
    if (resumingAfterDiscard && battle.hand.length > PEAK_PLAYER_HAND_LIMIT) return { ok: false, requiresDiscard: true, state: battle, frames, reason: `还需要将手牌丢弃到${PEAK_PLAYER_HAND_LIMIT}张` };
    if (!resumingAfterDiscard) {
        if (battle.phase !== 'playerPlanning') return { ok: false, state: battle, frames, reason: '当前不能结束回合' };
        if (battle.hand.length > PEAK_PLAYER_HAND_LIMIT) return { ok: false, requiresDiscard: true, state: battle, frames, reason: `手牌超过${PEAK_PLAYER_HAND_LIMIT}张，需要先选择弃牌` };
        const queueCheck = validatePeakQueue(battle);
        if (!queueCheck.valid) return { ok: false, state: battle, frames, reason: queueCheck.reason };

        battle.phase = 'playerResolving';
        if (!battle.queue.length) {
            const text = '你没有打出卡牌，跳过了本回合。';
            appendLog(battle, 'round', text);
            addFrame(frames, battle, 'system', null, text, 'pass');
        }
        battle.queue.forEach((instance) => {
            if (battle.player.hp > 0 && battle.enemy.hp > 0) {
                applyCard(battle, 'player', 'enemy', instance, battleCard(instance, 'player'), frames);
                releaseRecoveryCards(battle, 'player', frames);
            }
        });
        battle.discardPile.push(...battle.queue.filter((instance) => !instance.returnedToHand && !instance.movedToRecovery && !instance.exhaustAfterUse && !PEAK_CARD_BY_ID[instance.cardId]?.exhaustOnUse));
        battle.exhaustPile.push(...battle.queue.filter((instance) => !instance.returnedToHand && (instance.exhaustAfterUse || PEAK_CARD_BY_ID[instance.cardId]?.exhaustOnUse)));
        battle.queue = [];
        resolveTacticalDeclaration(battle, frames);
        if (battle.enemy.hp <= 0 && !battle.encounters?.[battle.encounterIndex + 1]) {
            addBossDefeatedFrame(frames, battle);
            battle.phase = 'victory';
            const text = battle.encounters.length > 1 ? '最终首领被击败，所有遭遇战完成。' : '敌人被击败，对决胜利。';
            appendLog(battle, 'victory', text);
            addFrame(frames, battle, 'player', null, text, 'victory');
            return { ok: true, state: battle, frames };
        }
        if (battle.hand.length > PEAK_PLAYER_HAND_LIMIT) {
            battle.phase = 'playerDiscarding';
            const text = `手牌达到${battle.hand.length}张，需要选择${battle.hand.length - PEAK_PLAYER_HAND_LIMIT}张丢弃后结束回合。`;
            appendLog(battle, 'discard', text);
            addFrame(frames, battle, 'system', null, text, 'discard');
            return { ok: true, requiresDiscard: true, state: battle, frames };
        }
    }

    finishTurnSpecialEffects(battle, 'player', frames);
    appendStatusFrames(battle, frames, 'player', tickPeakTurnEnd(battle.player), '你的回合结束');
    if (battle.player.hp <= 0) {
        battle.phase = 'defeat';
        const text = '持续状态在你的回合结束时耗尽了生命。';
        appendLog(battle, 'defeat', text);
        addFrame(frames, battle, 'enemy', null, text, 'defeat');
        return { ok: true, state: battle, frames };
    }

    if (battle.enemy.hp <= 0) {
        if (advancePeakEncounter(battle, frames)) return { ok: true, state: battle, frames };
    }

    battle.enemy.shield = 0;
    battle.phase = 'enemyPlanning';
    appendStatusFrames(battle, frames, 'enemy', tickPeakTurnStart(battle.enemy), `${battle.enemy.name}的回合开始`);
    resolveScheduledSpecialHealing(battle, 'enemy', frames);
    resolveBombAtTurnStart(battle, 'enemy', frames);
    resolveTimedFusesAtTurnStart(battle, 'enemy', frames);
    resolveBlessedSchedulesAtTurnStart(battle, 'enemy', frames);
    if (battle.enemy.hp <= 0) {
        if (advancePeakEncounter(battle, frames)) return { ok: true, state: battle, frames };
        addBossDefeatedFrame(frames, battle);
        battle.phase = 'victory';
        const text = battle.encounters.length > 1 ? '持续状态击败了最终首领，所有遭遇战完成。' : '持续状态在敌方回合开始时击败了敌人。';
        appendLog(battle, 'victory', text);
        addFrame(frames, battle, 'player', null, text, 'victory');
        return { ok: true, state: battle, frames };
    }
    drawFor(battle, 'enemy', battle.enemy.drawPerTurn);
    const planned = buildPeakEnemyQueue(battle, battle.enemy.drawPerTurn);
    const plannedIds = new Set(planned.map((entry) => entry.uid));
    battle.enemyHand = battle.enemyHand.filter((entry) => !plannedIds.has(entry.uid));
    battle.enemyQueue = planned;
    battle.enemyIntent = { ...summarizePeakEnemyIntent(planned, battle.enemy), draw: battle.enemy.drawPerTurn };
    battle.phase = 'enemyResolving';
    planned.forEach((instance) => {
        if (battle.player.hp > 0 && battle.enemy.hp > 0) applyCard(battle, 'enemy', 'player', instance, battleCard(instance, 'enemy'), frames);
    });
    battle.enemyDiscardPile.push(...battle.enemyQueue.filter((instance) => !instance.returnedToHand));
    battle.enemyQueue = [];

    if (battle.player.hp <= 0) {
        battle.phase = 'defeat';
        appendLog(battle, 'defeat', '你被击败了。');
        addFrame(frames, battle, 'enemy', null, '你被击败了。', 'defeat');
        return { ok: true, state: battle, frames };
    }

    finishTurnSpecialEffects(battle, 'enemy', frames);
    appendStatusFrames(battle, frames, 'enemy', tickPeakTurnEnd(battle.enemy), `${battle.enemy.name}的回合结束`);
    appendStatusFrames(battle, frames, 'player', tickPeakTurnStart(battle.player), '你的回合开始');
    resolveScheduledSpecialHealing(battle, 'player', frames);
    resolveBombAtTurnStart(battle, 'player', frames);
    resolveTimedFusesAtTurnStart(battle, 'player', frames);
    if (battle.player.hp <= 0 || battle.enemy.hp <= 0) {
        if (battle.player.hp > 0 && advancePeakEncounter(battle, frames)) return { ok: true, state: battle, frames };
        battle.phase = battle.player.hp <= 0 ? 'defeat' : 'victory';
        if (battle.phase === 'victory') addBossDefeatedFrame(frames, battle);
        const text = battle.phase === 'victory'
            ? (battle.encounters.length > 1 ? '持续状态击败了最终首领，所有遭遇战完成。' : '持续状态击败了敌人，对决胜利。')
            : '持续状态耗尽了你的生命。';
        appendLog(battle, battle.phase, text);
        addFrame(frames, battle, battle.phase === 'victory' ? 'player' : 'enemy', null, text, battle.phase);
        return { ok: true, state: battle, frames };
    }

    battle.round += 1;
    battle.encounterRound = Math.max(1, Math.floor(Number(battle.encounterRound) || 1)) + 1;
    battle.player.state = 'standing';
    battle.enemy.state = 'standing';
    const retainedPlayerShield = retainShieldForNextRound(battle.player);
    resolveBlessedSchedulesAtTurnStart(battle, 'player', frames);
    expireBuffs(battle.player);
    expireBuffs(battle.enemy);
    expireReactiveDefenses(battle.player);
    expireReactiveDefenses(battle.enemy);
    resetRoundSpecialEffects(battle.player);
    resetRoundSpecialEffects(battle.enemy);
    const activatedBoosts = activateNextTurnDamageBoosts(battle.player);
    const playerMpRecovery = getPeakPlayerMpRecovery(battle.player.maxMp);
    const recoveredPlayerMp = Math.min(playerMpRecovery, battle.player.maxMp - battle.player.mp);
    battle.player.mp += recoveredPlayerMp;
    const enemyMpRecovery = getPeakEnemyMpRecovery(battle.enemy.maxMp, playerMpRecovery);
    const recoveredEnemyMp = Math.min(enemyMpRecovery, battle.enemy.maxMp - battle.enemy.mp);
    battle.enemy.mp += recoveredEnemyMp;
    battle.phase = 'playerPlanning';
    battle.roundCards = { player: [], enemy: [] };
    battle.roundHistory = emptyRoundHistory();
    const blessingDraw = battle.player.drawInterval > 0 && battle.round % battle.player.drawInterval === 0 ? 1 : 0;
    const delayedDraw = Math.max(0, Math.floor(Number(battle.player.nextTurnDraw) || 0));
    const drawPenalty = Math.max(0, Math.floor(Number(battle.player.nextTurnDrawPenalty) || 0));
    battle.player.nextTurnDraw = 0;
    battle.player.nextTurnDrawPenalty = 0;
    drawFor(battle, 'player', Math.max(0, battle.player.drawPerTurn + blessingDraw + delayedDraw - drawPenalty));
    const blessingMp = restoreBlessingDrawMp(battle.player, blessingDraw);
    const grantedCards = grantScheduledCardsForTurn(battle, 'player');
    battle.enemyIntent = { cards: 0, attacks: 0, defense: false, mpCost: 0, names: [], draw: battle.enemy.drawPerTurn };
    const recoveryText = [retainedPlayerShield > 0 ? `你保留${retainedPlayerShield}点护盾` : '', recoveredPlayerMp > 0 ? `你恢复${recoveredPlayerMp}MP` : '', recoveredEnemyMp > 0 ? `${battle.enemy.name}恢复${recoveredEnemyMp}MP` : ''].filter(Boolean).join('，');
    const drawBonuses = [blessingDraw ? `抽牌大师额外抽取1张牌${blessingMp ? `并恢复${blessingMp}MP` : ''}` : '', delayedDraw ? `无中生有额外抽取${delayedDraw}张牌` : '', drawPenalty ? `超前效果使抽牌减少${drawPenalty}张` : '', grantedCards.length ? `获得${grantedCards.join('、')}` : '', activatedBoosts.length ? `秣兵历马使职业专属牌伤害提高${Math.max(...activatedBoosts.map((entry) => entry.value))}%` : ''].filter(Boolean);
    const drawText = drawBonuses.length ? `，${drawBonuses.join('，')}` : '';
    const roundText = `第 ${battle.round} 回合开始，双方恢复站立状态${recoveryText ? `，${recoveryText}` : ''}${drawText}。`;
    appendLog(battle, 'round', roundText);
    addFrame(frames, battle, 'system', null, roundText, 'round');
    return { ok: true, state: battle, frames };
};

export const abandonPeakBattle = (source) => ({ ...clone(source), phase: 'abandoned', queue: [], enemyQueue: [] });
