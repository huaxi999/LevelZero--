const KEY = 'rosang.abyss-expedition';
export const ABYSS_SAVE_VERSION = 4;

const fresh = () => ({ version: ABYSS_SAVE_VERSION, activeId: '', characters: {}, settings: { sound: true } });

const validStats = new Set(['physicalAttack', 'magicalAttack', 'independentAttack', 'strength', 'intelligence', 'vitality', 'spirit', 'hp', 'mp', 'physicalDefense', 'magicalDefense', 'physicalCrit', 'magicalCrit', 'attackSpeed', 'castSpeed', 'moveSpeed', 'allElement', 'fireElement', 'iceElement', 'lightElement', 'darkElement', 'damageIncrease', 'skillAttack', 'criticalDamage', 'cooldownReduction', 'allSkillLevel', 'damageReduction']);
const normalizeStats = (stats, legacyAttackSpeed = false) => {
    const result = {};
    Object.entries(stats && typeof stats === 'object' ? stats : {}).forEach(([rawKey, rawValue]) => {
        const key = rawKey === 'attack' ? 'physicalAttack' : rawKey === 'crit' ? 'physicalCrit' : rawKey;
        let value = Number(rawValue);
        if (!validStats.has(key) || !Number.isFinite(value)) return;
        if (legacyAttackSpeed && key === 'attackSpeed' && value > 0 && value <= 1) value *= 100;
        result[key] = Math.round(value * 100) / 100;
    });
    return result;
};

const itemGrades = {
    lowest: [.33, .46], low: [.47, .60], middle: [.61, .74], high: [.75, .89], highest: [.90, 1],
};
const safeItem = (item, legacyAttackSpeed = false) => {
    if (!item || typeof item !== 'object' || typeof item.id !== 'string' || typeof item.slot !== 'string') return null;
    const rawQuality = Number(item.quality);
    const quality = Number.isFinite(rawQuality) ? Math.max(.33, Math.min(1, rawQuality)) : 1;
    const grade = itemGrades[item.grade]
        ? item.grade
        : Object.entries(itemGrades).find(([, [min, max]]) => quality >= min && quality <= max)?.[0] || 'highest';
    return { ...item, stats: normalizeStats(item.stats, legacyAttackSpeed), grade, quality: Math.round(quality * 100) / 100, equipped: Boolean(item.equipped), locked: Boolean(item.locked) };
};

const safeCharacter = (character, legacyAttackSpeed = false) => {
    if (!character || typeof character !== 'object' || !['sword', 'brawler'].includes(character.classId)) return null;
    const level = Math.max(1, Math.min(60, Math.floor(Number(character.level) || 1)));
    return {
        id: String(character.id || `${character.classId}-save`).slice(0, 48),
        classId: character.classId,
        name: String(character.name || '').slice(0, 16),
        level,
        xp: Math.max(0, Math.floor(Number(character.xp) || 0)),
        gold: Math.max(0, Math.floor(Number(character.gold) || 0)),
        inventory: Array.isArray(character.inventory) ? character.inventory.map((item) => safeItem(item, legacyAttackSpeed)).filter(Boolean).slice(0, 120) : [],
        equipped: character.equipped && typeof character.equipped === 'object' ? character.equipped : {},
        progress: character.progress && typeof character.progress === 'object' ? character.progress : { cleared: {}, discovered: ['windfall'] },
        warehouse: Array.isArray(character.warehouse) ? character.warehouse.map((item) => safeItem(item, legacyAttackSpeed)).filter(Boolean).slice(0, 120) : [],
        materials: { abyssTicket: Math.max(0, Math.floor(Number(character.materials?.abyssTicket) || 0)) },
        skillProgressionVersion: Math.max(0, Math.floor(Number(character.skillProgressionVersion) || 0)),
        skillPoints: Math.max(0, Math.floor(Number(character.skillPoints) || 0)),
        skills: character.skills && typeof character.skills === 'object' ? Object.fromEntries(Object.entries(character.skills).filter(([id, level]) => /^[a-z0-9_]+$/.test(id) && Number.isFinite(Number(level))).map(([id, level]) => [id, Math.max(0, Math.min(10, Math.floor(Number(level))))])) : {},
        createdAt: Number(character.createdAt) || Date.now(),
        updatedAt: Date.now(),
    };
};

export const getAbyssSave = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(KEY) || '{}');
        if (!parsed || typeof parsed !== 'object' || ![1, 2, 3, ABYSS_SAVE_VERSION].includes(Number(parsed.version))) return fresh();
        const characters = {};
        Object.entries(parsed.characters || {}).forEach(([id, value]) => {
            const character = safeCharacter(value, [1, 2, 3].includes(Number(parsed.version)));
            if (character) characters[id] = character;
        });
        return { version: ABYSS_SAVE_VERSION, activeId: characters[parsed.activeId] ? parsed.activeId : '', characters, settings: { sound: parsed.settings?.sound !== false } };
    } catch {
        return fresh();
    }
};

export const setAbyssSave = (value) => {
    const next = value && typeof value === 'object' ? value : fresh();
    const characters = {};
    Object.entries(next.characters || {}).forEach(([id, character]) => {
        const safe = safeCharacter(character, [1, 2, 3].includes(Number(next.version)));
        if (safe) characters[id] = safe;
    });
    const normalized = { version: ABYSS_SAVE_VERSION, activeId: characters[next.activeId] ? next.activeId : '', characters, settings: { sound: next.settings?.sound !== false } };
    try { localStorage.setItem(KEY, JSON.stringify(normalized)); } catch {                                                      }
    return normalized;
};
