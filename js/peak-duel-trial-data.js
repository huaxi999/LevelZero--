import { PEAK_DUNGEONS } from './peak-duel-data.js';

export const PEAK_TRIAL_FLOORS = Object.freeze([
    { floor: 1, kind: 'normal', name: '试锋', difficultyId: 'normal', scale: 1, gold: 30 },
    { floor: 2, kind: 'normal', name: '追击', difficultyId: 'normal', scale: 1.06, gold: 40 },
    { floor: 3, kind: 'elite', name: '铁壁', difficultyId: 'elite', scale: 1.12, gold: 50 },
    { floor: 4, kind: 'normal', name: '变阵', difficultyId: 'elite', scale: 1.18, gold: 60 },
    { floor: 5, kind: 'elite', name: '压制', difficultyId: 'elite', scale: 1.25, gold: 70 },
    { floor: 6, kind: 'boss', name: '守关者', difficultyId: 'hard', scale: 1.34, gold: 90 },
    { floor: 7, kind: 'normal', name: '深层', difficultyId: 'elite', scale: 1.38, gold: 100 },
    { floor: 8, kind: 'elite', name: '猎杀', difficultyId: 'hard', scale: 1.46, gold: 115 },
    { floor: 9, kind: 'boss', name: '裁决者', difficultyId: 'hard', scale: 1.54, gold: 135 },
    { floor: 10, kind: 'nightmare', name: '梦魇前线', difficultyId: 'hard', scale: 1.63, gold: 155 },
    { floor: 11, kind: 'nightmare', name: '无光回廊', difficultyId: 'hard', scale: 1.73, gold: 180 },
    { floor: 12, kind: 'final', name: '巅峰之主', difficultyId: 'hard', scale: 1.88, gold: 240 },
]);

export const PEAK_TRIAL_BOONS = Object.freeze([
    { id: 'vital_core', name: '生命核心', summary: '本次试炼最大生命提高12%。', effect: { type: 'maxHpPercent', value: 12 }, maxStacks: 2 },
    { id: 'field_repair', name: '战地整备', summary: '立即恢复25%最大生命。', effect: { type: 'healPercent', value: 25 }, maxStacks: 3 },
    { id: 'weapon_tuning', name: '武器校准', summary: '本次试炼物理攻击提高12%。', effect: { type: 'statPercent', stat: 'physicalAttack', value: 12 }, maxStacks: 2 },
    { id: 'spell_tuning', name: '术式校准', summary: '本次试炼魔法攻击提高12%。', effect: { type: 'statPercent', stat: 'magicalAttack', value: 12 }, maxStacks: 2 },
    { id: 'independent_core', name: '独立核心', summary: '本次试炼独立攻击提高10%。', effect: { type: 'statPercent', stat: 'independentAttack', value: 10 }, maxStacks: 2 },
    { id: 'reserve_circuit', name: '储能回路', summary: '本次试炼最大MP提高12点。', effect: { type: 'maxMpFlat', value: 12 }, maxStacks: 2 },
    { id: 'tactical_draw', name: '先机筹划', summary: '每层战斗起手额外抽1张牌。', effect: { type: 'openingHand', value: 1 }, maxStacks: 1 },
    { id: 'combat_focus', name: '战斗专注', summary: '本次试炼伤害增加提高8点。', effect: { type: 'statFlat', stat: 'damageIncrease', value: 8 }, maxStacks: 2 },
    { id: 'guard_matrix', name: '守御矩阵', summary: '本次试炼伤害减免提高8点。', effect: { type: 'statFlat', stat: 'damageReduction', value: 8 }, maxStacks: 2 },
]);

const hashNumber = (seed, salt) => {
    let value = (Number(seed) || 1) ^ Math.imul(Number(salt) || 1, 2654435761);
    value = Math.imul(value ^ (value >>> 16), 2246822507);
    value = Math.imul(value ^ (value >>> 13), 3266489909);
    return (value ^ (value >>> 16)) >>> 0;
};

export const getPeakTrialBoonChoices = (seed, floor, taken = []) => {
    const counts = taken.reduce((result, id) => ({ ...result, [id]: (result[id] || 0) + 1 }), {});
    return PEAK_TRIAL_BOONS
        .filter((boon) => (counts[boon.id] || 0) < boon.maxStacks)
        .map((boon, index) => ({ boon, order: hashNumber(seed, floor * 101 + index) }))
        .sort((left, right) => left.order - right.order || left.boon.id.localeCompare(right.boon.id))
        .slice(0, 3)
        .map(({ boon }) => boon.id);
};

export const applyPeakTrialBoons = (playerPayload, boonIds = []) => {
    const next = { ...playerPayload, stats: { ...(playerPayload.stats || {}) } };
    boonIds.forEach((id) => {
        const effect = PEAK_TRIAL_BOONS.find((entry) => entry.id === id)?.effect;
        if (!effect || effect.type === 'healPercent') return;
        if (effect.type === 'maxHpPercent') next.maxHp = Math.round(next.maxHp * (1 + effect.value / 100));
        else if (effect.type === 'maxMpFlat') next.maxMp = Math.round(next.maxMp + effect.value);
        else if (effect.type === 'openingHand') next.openingHandBonus = (next.openingHandBonus || 0) + effect.value;
        else if (effect.type === 'statPercent') next.stats[effect.stat] = Math.round((Number(next.stats[effect.stat]) || 0) * (1 + effect.value / 100));
        else if (effect.type === 'statFlat') next.stats[effect.stat] = (Number(next.stats[effect.stat]) || 0) + effect.value;
    });
    next.stats.hp = next.maxHp;
    next.stats.mp = next.maxMp;
    return next;
};

export const buildPeakTrialFloor = ({ floor, characterLevel, seed }) => {
    const definition = PEAK_TRIAL_FLOORS.find((entry) => entry.floor === floor);
    if (!definition) return null;
    const candidates = PEAK_DUNGEONS.filter((entry) => entry.difficultyId === definition.difficultyId);
    const targetLevel = Math.max(1, Number(characterLevel) + Math.floor((floor - 1) / 3));
    const closest = [...candidates].sort((left, right) => Math.abs(left.level - targetLevel) - Math.abs(right.level - targetLevel) || left.id.localeCompare(right.id)).slice(0, 3);
    const source = closest[hashNumber(seed, floor) % Math.max(1, closest.length)] || PEAK_DUNGEONS[0];
    const boss = ['boss', 'final'].includes(definition.kind);
    const nightmare = definition.kind === 'nightmare';
    const sourceEnemy = source.enemy;
    const enemy = {
        ...sourceEnemy,
        id: `peak-trial-${floor}-${sourceEnemy.id}`,
        name: `${definition.name}·${sourceEnemy.name}`,
        maxHp: Math.round(sourceEnemy.maxHp * definition.scale * (boss ? 1.12 : 1)),
        combatAttack: Math.round(sourceEnemy.combatAttack * definition.scale * (nightmare ? 1.05 : boss ? 1.08 : 1)),
        physicalDefense: Math.round(sourceEnemy.physicalDefense * definition.scale),
        magicalDefense: Math.round(sourceEnemy.magicalDefense * definition.scale),
        cardLevel: Math.min(10, Math.max(sourceEnemy.cardLevel || 1, 2 + Math.floor(floor * .65))),
        drawPerTurn: Math.min(6, Math.max(sourceEnemy.drawPerTurn || 3, 3 + Math.floor((floor - 1) / 4))),
        isBoss: boss,
        difficulty: definition.kind === 'final' ? '最终首领' : definition.kind === 'nightmare' ? '梦魇' : definition.kind === 'boss' ? '首领' : definition.kind === 'elite' ? '精英' : '普通',
        tactics: `${sourceEnemy.tactics} · 巅峰试炼第${floor}层`,
        deck: [...sourceEnemy.deck],
        dropChance: 0,
    };
    enemy.attack = enemy.combatAttack;
    return { ...definition, sourceDungeonId: source.id, backdrop: source.backdrop, enemy };
};
