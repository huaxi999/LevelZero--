import { PEAK_STATUS_EFFECTS } from './peak-duel-data.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const number = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

export const getPeakEffectiveCardLevel = (card, combatant, actorKey = 'player', instance = null) => {
    const override = Math.floor(number(instance?.levelOverride));
    if (override > 0) return clamp(override, 1, card.maxLevel || 10);
    const stored = actorKey === 'player' ? number(combatant.cardLevels?.[card.id]) || 1 : number(combatant.cardLevel) || 1;
    const skillBonus = card.category === 'skill' ? Math.floor(number(combatant.stats?.allSkillLevel)) : 0;
    return clamp(Math.floor(stored + skillBonus), 1, card.maxLevel || 10);
};

export const getPeakLevelMultiplier = (card, level) => 1 + Math.max(0, level - 1) * (number(card.levelGrowth) || .06);

export const calculatePeakEffectValue = (effect, stats, card, level) => {
    const raw = number(effect.base) + Object.entries(effect.scaling || {}).reduce((sum, [stat, coefficient]) => sum + number(stats?.[stat]) * number(coefficient), 0);
    return Math.max(0, Math.round(raw * getPeakLevelMultiplier(card, level)));
};

export const calculatePeakBuffValue = (effect, combatant, card, level, dynamicBonus = 0) => {
    const temporary = (combatant.buffs || []).filter((buff) => buff.stat === effect.stat).reduce((sum, buff) => sum + number(buff.value), 0);
    const baseStat = Math.max(0, number(combatant.stats?.[effect.stat]) - temporary);
    return Math.max(1, Math.round((number(effect.value) + dynamicBonus + baseStat * number(effect.percent) / 100) * getPeakLevelMultiplier(card, level)));
};

export const applyPeakStatBuff = (combatant, stat, value, duration) => {
    const derived = stat === 'vitality' ? { physicalDefense: value * 2, hp: value * 12 }
        : stat === 'spirit' ? { magicalDefense: value * 2, mp: Math.round(value * 1.75) } : {};
    combatant.stats[stat] = number(combatant.stats[stat]) + value;
    Object.entries(derived).forEach(([key, bonus]) => { combatant.stats[key] = number(combatant.stats[key]) + bonus; });
    if (derived.hp) combatant.maxHp += derived.hp;
    if (derived.mp) combatant.maxMp += derived.mp;
    combatant.buffs.push({ stat, value, duration, derived });
};

export const expirePeakBuffs = (combatant) => {
    combatant.buffs = (combatant.buffs || []).map((buff) => ({ ...buff, duration: buff.duration - 1 })).filter((buff) => {
        if (buff.duration > 0) return true;
        combatant.stats[buff.stat] = number(combatant.stats[buff.stat]) - number(buff.value);
        Object.entries(buff.derived || {}).forEach(([key, bonus]) => { combatant.stats[key] = number(combatant.stats[key]) - number(bonus); });
        if (buff.derived?.hp) combatant.maxHp = Math.max(1, combatant.maxHp - buff.derived.hp);
        if (buff.derived?.mp) combatant.maxMp = Math.max(0, combatant.maxMp - buff.derived.mp);
        return false;
    });
    combatant.hp = Math.min(combatant.hp, combatant.maxHp);
    combatant.mp = Math.min(combatant.mp, combatant.maxMp);
};

export const applyPeakDamageToCombatant = (combatant, amount, { useShield = true } = {}) => {
    const incoming = Math.max(0, Math.round(number(amount)));
    const absorbed = useShield ? Math.min(number(combatant.shield), incoming) : 0;
    const hpBefore = number(combatant.hp);
    const lethalAfterShield = incoming - absorbed >= hpBefore;
    if (lethalAfterShield && number(combatant.phoenixWard?.charges) > 0) {
        combatant.phoenixWard.charges -= 1;
        if (combatant.phoenixWard.charges <= 0) combatant.phoenixWard = null;
        const harmfulStatuses = (combatant.statuses || []).filter((status) => PEAK_STATUS_EFFECTS[status.id]?.harmful).length;
        combatant.statuses = (combatant.statuses || []).filter((status) => !PEAK_STATUS_EFFECTS[status.id]?.harmful);
        const clearedStun = Math.max(0, number(combatant.stunCharges));
        combatant.stunCharges = 0;
        if (combatant.state === 'stunned') combatant.state = 'standing';
        const clearedDisruptions = (combatant.cardDisruptions || []).length;
        combatant.cardDisruptions = [];
        return { incoming, absorbed: 0, hpDamage: 0, lastStandShield: 0, phoenixTriggered: true, cleansedDebuffs: harmfulStatuses + (clearedStun ? 1 : 0) + clearedDisruptions };
    }
    combatant.shield = Math.max(0, number(combatant.shield) - absorbed);
    combatant.hp = Math.max(0, hpBefore - (incoming - absorbed));
    let lastStandShield = 0;
    if (combatant.hp <= 0 && number(combatant.lastStand?.charges) > 0) {
        combatant.lastStand.charges -= 1;
        combatant.hp = 1;
        lastStandShield = Math.max(1, Math.round(number(combatant.maxHp) * number(combatant.lastStand.shieldPercent) / 100));
        combatant.shield += lastStandShield;
        if (combatant.lastStand.charges <= 0) combatant.lastStand = null;
    }
    return { incoming, absorbed, hpDamage: Math.max(0, hpBefore - combatant.hp), lastStandShield, phoenixTriggered: false, cleansedDebuffs: 0 };
};

export const getPeakStatus = (combatant, id) => combatant.statuses?.find((status) => status.id === id) || null;

export const addPeakStatus = (combatant, id, stacks = 1, duration = 1) => {
    const definition = PEAK_STATUS_EFFECTS[id];
    if (!definition) return null;
    combatant.statuses = Array.isArray(combatant.statuses) ? combatant.statuses : [];
    let status = getPeakStatus(combatant, id);
    if (!status) {
        status = { id, stacks: 0, duration: 0 };
        combatant.statuses.push(status);
    }
    status.stacks = clamp(status.stacks + Math.max(1, Math.floor(number(stacks) || 1)), 1, definition.maxStacks || 99);
    status.duration = clamp(Math.max(status.duration, Math.floor(number(duration) || 1)), 1, 99);
    return status;
};

export const cleansePeakStatuses = (combatant, amount = 1) => {
    const removed = [];
    combatant.statuses = (combatant.statuses || []).filter((status) => {
        if (removed.length >= amount || !PEAK_STATUS_EFFECTS[status.id]?.harmful) return true;
        removed.push(status);
        return false;
    });
    return removed;
};

export const calculatePeakDamage = ({ effect, card, level, actor, target, random = Math.random, forceCritical = false }) => {
    const trueDamage = effect.damageType === 'true';
    const magical = effect.damageType === 'magical';
    const raw = calculatePeakEffectValue(effect, actor.stats, card, level);
    const penetrationStat = magical ? 'magicalPenetration' : 'physicalPenetration';
    const penetration = trueDamage ? 0 : clamp(number(actor.stats?.[penetrationStat]), 0, 80);
    const defense = trueDamage ? 0 : number(target.stats?.[magical ? 'magicalDefense' : 'physicalDefense']) * (1 - penetration / 100);
    const defenseMultiplier = trueDamage ? 1 : 100 / (100 + Math.max(0, defense));
    const skillMultiplier = card.category === 'skill' ? 1 + Math.max(0, number(actor.stats?.skillAttack)) / 100 : 1;
    const increaseMultiplier = 1 + Math.max(0, number(actor.stats?.damageIncrease)) / 100;
    const weakMultiplier = getPeakStatus(actor, 'weak') ? .85 : 1;
    const frozenStacks = getPeakStatus(actor, 'frozen')?.stacks || 0;
    const frozenMultiplier = 1 - clamp(frozenStacks * .03, 0, .6);
    const vulnerableMultiplier = getPeakStatus(target, 'vulnerable') ? 1.2 : 1;
    const reductionMultiplier = trueDamage ? 1 : 1 - clamp(number(target.stats?.damageReduction), 0, 80) / 100;
    const element = effect.element || '';
    const elementPower = element ? number(actor.stats?.allElement) + number(actor.stats?.[`${element}Element`]) : 0;
    const elementResistance = element ? number(target.stats?.elementalResistance) + number(target.stats?.[`${element}Resistance`]) : 0;
    const elementalPenetration = clamp(number(actor.stats?.elementalPenetration), 0, 80);
    const effectiveElementResistance = elementResistance * (1 - elementalPenetration / 100);
    const elementMultiplier = element ? clamp(1 + (elementPower - effectiveElementResistance) / 220, .5, 3) : 1;
    const critChance = trueDamage
        ? clamp(Math.max(number(actor.stats?.physicalCrit), number(actor.stats?.magicalCrit)), 0, 100)
        : clamp(number(actor.stats?.[magical ? 'magicalCrit' : 'physicalCrit']), 0, 100);
    const critical = forceCritical || random() * 100 < critChance;
    const criticalMultiplier = critical ? 1.5 + Math.max(0, number(actor.stats?.criticalDamage)) / 100 : 1;
    const damage = Math.max(1, Math.round(raw * defenseMultiplier * skillMultiplier * increaseMultiplier * weakMultiplier * frozenMultiplier * vulnerableMultiplier * reductionMultiplier * elementMultiplier * criticalMultiplier));
    return { damage, raw, critical, element, damageType: trueDamage ? 'true' : magical ? 'magical' : 'physical', critChance, defenseMultiplier, elementMultiplier, frozenMultiplier };
};

const statusDefenseMultiplier = (combatant, magical = false) => {
    const defense = number(combatant.stats?.[magical ? 'magicalDefense' : 'physicalDefense']);
    const reduction = 1 - clamp(number(combatant.stats?.damageReduction), 0, 80) / 100;
    return 100 / (100 + Math.max(0, defense)) * reduction;
};

export const tickPeakTurnStart = (combatant) => {
    const events = [];
    const statuses = Array.isArray(combatant.statuses) ? combatant.statuses : [];
    statuses.forEach((status) => {
        if (status.stacks <= 0 || status.duration <= 0) return;
        if (status.id === 'burn' || status.id === 'poison') {
            const level = Math.max(1, Math.floor(number(combatant.level) || number(combatant.cardLevel) || 1));
            const burning = status.id === 'burn';
            const percentageDamage = (burning ? combatant.hp : combatant.maxHp) * status.stacks * (burning ? .01 : .006);
            const minimumDamage = level * (burning ? .3 : .25);
            const damage = Math.max(1, Math.round(Math.max(minimumDamage, percentageDamage * statusDefenseMultiplier(combatant, !burning))));
            const result = applyPeakDamageToCombatant(combatant, damage, { useShield: false });
            if (result.phoenixTriggered) statuses.forEach((entry) => { if (PEAK_STATUS_EFFECTS[entry.id]?.harmful) { entry.stacks = 0; entry.duration = 0; } });
            events.push({ type: 'damage', statusId: status.id, value: result.hpDamage, lastStandShield: result.lastStandShield, phoenixTriggered: result.phoenixTriggered, text: result.phoenixTriggered ? `${PEAK_STATUS_EFFECTS[status.id].name}触发浴火金身，本次致命伤害被无视并清除全部负面状态。` : `${PEAK_STATUS_EFFECTS[status.id].name}造成${result.hpDamage}点伤害${result.lastStandShield ? `，不屈触发并获得${result.lastStandShield}护盾` : ''}。` });
            status.stacks = Math.floor(status.stacks / 2);
        }
    });
    combatant.statuses = statuses.filter((status) => status.duration > 0 && status.stacks > 0);
    return events;
};

export const tickPeakTurnEnd = (combatant) => {
    const events = [];
    const statuses = Array.isArray(combatant.statuses) ? combatant.statuses : [];
    statuses.forEach((status) => {
        if (status.stacks <= 0 || status.duration <= 0) return;
        if (status.id === 'bleed') {
            const reduction = 1 - clamp(number(combatant.stats?.damageReduction), 0, 80) / 100;
            const damage = Math.max(1, Math.round(status.stacks * 6 * reduction));
            const result = applyPeakDamageToCombatant(combatant, damage, { useShield: false });
            if (result.phoenixTriggered) statuses.forEach((entry) => { if (PEAK_STATUS_EFFECTS[entry.id]?.harmful) { entry.stacks = 0; entry.duration = 0; } });
            events.push({ type: 'damage', statusId: status.id, value: result.hpDamage, lastStandShield: result.lastStandShield, phoenixTriggered: result.phoenixTriggered, text: result.phoenixTriggered ? '流血触发浴火金身，本次致命伤害被无视并清除全部负面状态。' : `流血造成${result.hpDamage}点伤害${result.lastStandShield ? `，不屈触发并获得${result.lastStandShield}护盾` : ''}。` });
            status.stacks = Math.max(0, status.stacks - 1);
        } else if (status.id === 'regeneration') {
            const sustainMultiplier = 1 + Math.max(0, number(combatant.roundTradeoff?.sustainBonus)) / 100;
            const value = Math.min(combatant.maxHp - combatant.hp, Math.round(status.stacks * 6 * sustainMultiplier));
            combatant.hp += value;
            events.push({ type: 'heal', statusId: status.id, value, text: `再生恢复${value}点生命。` });
        } else if (status.id === 'frozen') {
            status.stacks = Math.floor(status.stacks / 2);
        }
        status.duration -= 1;
    });
    combatant.statuses = statuses.filter((status) => status.duration > 0 && status.stacks > 0);
    return events;
};

export const tickPeakStatuses = tickPeakTurnEnd;
