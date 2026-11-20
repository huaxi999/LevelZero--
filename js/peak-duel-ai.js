import { PEAK_ENEMY_BATTLE_CARD_BY_ID, getPeakCardCost, validatePeakCardTargetState } from './peak-duel-data.js';
import { getPeakEffectiveCardLevel } from './peak-duel-combat.js';

const conditionIsActive = (card, battle, sequence) => {
    const rule = card.conditionalDamage;
    if (!rule) return false;
    if (rule.type === 'targetHpAbove') return battle.player.hp / Math.max(1, battle.player.maxHp) > rule.threshold;
    if (rule.type === 'targetHpBelow') return battle.player.hp / Math.max(1, battle.player.maxHp) < rule.threshold;
    if (rule.type === 'targetHasShield') return battle.player.shield > 0;
    if (rule.type === 'actorHpBelow') return battle.enemy.hp / Math.max(1, battle.enemy.maxHp) < rule.threshold;
    if (rule.type === 'targetState') return rule.states?.includes(battle.player.state);
    if (rule.type === 'priorAttackStyleOnly') {
        const history = [
            ...(battle.roundCards?.enemy || []),
            ...sequence.map((entry) => PEAK_ENEMY_BATTLE_CARD_BY_ID[entry.cardId]).filter(Boolean),
        ];
        return history.length > 0 && history.every((entry) => entry.category === 'attack' && entry.attackStyle === rule.style);
    }
    return false;
};

const scoreCard = (card, battle, sequence, cost) => {
    let score = Number(card.aiScore) || 10;
    const position = sequence.length;
    const healthRatio = battle.enemy.hp / Math.max(1, battle.enemy.maxHp);
    const profile = battle.enemy.aiProfile || {};
    const effects = card.effects || [];
    score *= Number(profile.categoryWeights?.[card.category]) || 1;
    if (healthRatio < .45 && card.category === 'defense') score *= Number(profile.lowHpDefenseMultiplier) || 1;
    if (effects.some((effect) => effect.type === 'damage' && effect.damageType === 'magical')) score *= Number(profile.magicalMultiplier) || 1;
    if (effects.some((effect) => effect.type === 'status')) score *= Number(profile.statusMultiplier) || 1;
    if (effects.some((effect) => effect.type === 'setState')) score *= Number(profile.stateMultiplier) || 1;
    if (card.category === 'defense') score *= healthRatio < .45 ? 1.8 : .7;
    if (card.category === 'buff') score *= position === 0 ? 1.35 : .75;
    if (card.effects?.some((effect) => effect.type === 'setState')) score += 4;
    if (card.effects?.some((effect) => effect.type === 'draw') && position === 0) score += 5;
    if (card.effects?.some((effect) => effect.type === 'drainMp')) score += Math.min(8, battle.player.mp / Math.max(1, battle.player.maxMp) * 8);
    if ((battle.enemy.stunCharges || 0) > 0 && position === 0) {
        score = card.effects?.some((effect) => effect.type === 'setState') ? 28 - Math.min(12, cost) : 1;
    }
    if (card.conditionalDamage) score *= conditionIsActive(card, battle, sequence) ? 1 + card.conditionalDamage.bonus : .92;
    return score;
};

export const buildPeakEnemyQueue = (battle, maxCards = 3) => {
    const hand = battle.enemyHand.slice(0, 10);
    const definitions = hand.map((instance) => PEAK_ENEMY_BATTLE_CARD_BY_ID[instance.cardId]);
    const costs = definitions.map((card, index) => card ? getPeakCardCost(card, getPeakEffectiveCardLevel(card, battle.enemy, 'enemy', hand[index])) : 0);
    const visited = new Map();
    const sequence = [];
    let best = { cards: [], score: -1 };

    const visit = (usedMask, targetState, spentMp, score) => {
        const key = `${usedMask}:${targetState}`;
        if (visited.has(key) && visited.get(key) >= score) return;
        visited.set(key, score);
        if (score > best.score || (score === best.score && sequence.length > best.cards.length)) best = { cards: [...sequence], score };
        if (sequence.length >= maxCards) return;
        const triedCards = new Set();
        hand.forEach((instance, index) => {
            if (usedMask & (1 << index)) return;
            const card = definitions[index];
            const variant = `${instance.cardId}:${instance.levelOverride || 0}`;
            if (!card || triedCards.has(variant)) return;
            triedCards.add(variant);
            const nextSpentMp = spentMp + costs[index];
            if (nextSpentMp > battle.enemy.mp) return;
            const stateCheck = validatePeakCardTargetState(card, targetState);
            if (!stateCheck.valid) return;
            const nextScore = score + scoreCard(card, battle, sequence, costs[index]);
            sequence.push(instance);
            visit(usedMask | (1 << index), stateCheck.nextState, nextSpentMp, nextScore);
            sequence.pop();
        });
    };

    visit(0, battle.player.state, 0, 0);
    return best.cards;
};

export const summarizePeakEnemyIntent = (queue, enemy = {}) => {
    const cards = queue.map((entry) => PEAK_ENEMY_BATTLE_CARD_BY_ID[entry.cardId]).filter(Boolean);
    return {
        cards: cards.length,
        attacks: cards.filter((card) => ['attack', 'skill'].includes(card.category)).length,
        defense: cards.some((card) => card.category === 'defense'),
        mpCost: queue.reduce((total, instance) => {
            const card = PEAK_ENEMY_BATTLE_CARD_BY_ID[instance.cardId];
            return total + (card ? getPeakCardCost(card, getPeakEffectiveCardLevel(card, enemy, 'enemy', instance)) : 0);
        }, 0),
        names: cards.map((card) => card.name),
    };
};
