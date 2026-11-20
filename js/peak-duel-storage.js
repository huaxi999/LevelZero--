import {
    PEAK_ADVANCEMENTS,
    PEAK_ADVANCEMENT_LEVELS,
    PEAK_BLESSING_BY_ID,
    PEAK_CARD_BY_ID,
    PEAK_CARD_CATEGORIES,
    PEAK_CARD_RARITIES,
    PEAK_CARDS,
    PEAK_CHARACTERS,
    PEAK_DUNGEONS,
    PEAK_EQUIPMENT_DROP_BANDS,
    PEAK_EQUIPMENT_GRADES,
    PEAK_EQUIPMENT_NAME_POOLS,
    PEAK_EQUIPMENT_RARITIES,
    PEAK_EQUIPMENT_SLOTS,
    PEAK_EQUIPMENT_SLOT_LABELS,
    PEAK_PACKS,
    PEAK_RESERVED_CLASSES,
    PEAK_SHARED_STARTERS,
    PEAK_STARTER_DECKS,
    PEAK_STARTER_EQUIPMENT,
    PEAK_STATUS_EFFECTS,
    PEAK_TACTICAL_DECLARATIONS,
    PEAK_TUTORIAL_CHAPTERS,
    isPeakCardAvailableForAdvancement,
} from './peak-duel-data.js';
import { isPeakPackEpicEligible } from './peak-duel-pack.js';
import { PEAK_TRIAL_BOONS, PEAK_TRIAL_FLOORS, getPeakTrialBoonChoices } from './peak-duel-trial-data.js';

export const PEAK_STORAGE_KEY = 'rosang.peak-duel';
const KEY = PEAK_STORAGE_KEY;
const BACKUP_KEY = 'rosang.peak-duel.backup-v17';
const SAVE_BASELINE = Symbol('peakSaveBaseline');
const saveError = (code, message, cause) => Object.assign(new Error(message, { cause }), { code });
export const getPeakSaveIssue = (save) => save?.[SAVE_BASELINE]?.error || null;
export const PEAK_SAVE_VERSION = 18;
export const PEAK_STAMINA_INTERVAL = 2 * 60 * 1000;
export const PEAK_DECK_LIMITS = { min: 15, max: 50 };
export const PEAK_CHARACTER_SLOT_LIMIT = 8;
export const PEAK_DECK_PRESET_LIMIT = 3;
export const PEAK_UNIVERSAL_SHARD_RARITIES = Object.freeze(['common', 'excellent', 'rare', 'scarce', 'legendary', 'epic']);
export const PEAK_DUPLICATE_TO_SHARD_RATE = 1;
export const PEAK_CLASS_SHARD_EXCHANGE_RATE = 2;
export const PEAK_TRIAL_WEEKLY_LIMIT = 3;
export const PEAK_DAILY_MISSION_COUNT = 4;
export const PEAK_EQUIPMENT_STATS = Object.freeze([
    'physicalAttack', 'magicalAttack', 'independentAttack', 'strength', 'intelligence', 'vitality', 'spirit',
    'hp', 'mp', 'physicalDefense', 'magicalDefense', 'physicalPenetration', 'magicalPenetration', 'elementalPenetration',
    'physicalCrit', 'magicalCrit', 'damageIncrease', 'skillAttack', 'criticalDamage', 'damageReduction', 'allElement',
    'fireElement', 'iceElement', 'lightElement', 'darkElement', 'allSkillLevel',
]);
export const PEAK_VIP_THRESHOLDS = Object.freeze([0, 1, 10, 25, 50, 90, 140, 210, 300, 400, 520]);
export const PEAK_PACK_VOUCHER_COSTS = Object.freeze({ lower: 2, low: 4, middle: 9, high: 18, upper: 40, special: 90, highest: 200, class: 300 });
export const PEAK_ATTENDANCE_REWARDS = Object.freeze([
    { gold: 50 }, { gold: 80 }, { vouchers: 1 }, { gold: 100 }, { gold: 120 }, { gold: 150 }, { gold: 200, vouchers: 1 },
]);
export const PEAK_STREAK_MILESTONES = Object.freeze([
    { days: 3, reward: { gold: 100 } }, { days: 7, reward: { vouchers: 1 } }, { days: 14, reward: { vouchers: 1, gold: 200 } }, { days: 30, reward: { vouchers: 2, gold: 300 } },
]);
export const PEAK_TOTAL_MILESTONES = Object.freeze([
    { days: 7, reward: { vouchers: 1 } }, { days: 15, reward: { vouchers: 1, gold: 200 } }, { days: 30, reward: { vouchers: 2 } }, { days: 60, reward: { vouchers: 3, gold: 500 } }, { days: 100, reward: { vouchers: 5, gold: 800 } },
]);
export const PEAK_MERCHANT_OFFERS = Object.freeze([
    { id: 'gold_100', name: '金币兑换', description: '按固定比例兑换100金币。', cost: 1, type: 'gold', amount: 100 },
    { id: 'stamina_10', name: '远征补给', description: '恢复10点体力，不超过体力上限。', cost: 2, type: 'stamina', amount: 10 },
    { id: 'middle_pack', name: '中级卡包', description: '开启1个中级卡包，获得5张卡。', cost: 6, type: 'pack', packId: 'middle' },
    { id: 'high_pack', name: '高级卡包', description: '开启1个高级卡包，获得5张卡。', cost: 14, type: 'pack', packId: 'high' },
    { id: 'upper_pack', name: '上级卡包', description: '开启1个上级卡包，获得5张卡。', cost: 32, type: 'pack', packId: 'upper' },
    { id: 'special_pack', name: '特级卡包', description: '开启1个特级卡包，获得5张卡。', cost: 70, type: 'pack', packId: 'special' },
]);

export const PEAK_MISSION_GROUPS = Object.freeze({
    daily: { id: 'daily', name: '每日任务', subtitle: '每日00:00随机4项', period: 'daily' },
    weekly: { id: 'weekly', name: '每周任务', subtitle: '每周一00:00刷新', period: 'weekly' },
    growth: { id: 'growth', name: '成长任务', subtitle: '账号永久保留', period: 'lifetime' },
});

export const PEAK_MISSIONS = Object.freeze([
    { id: 'daily_clear_1', group: 'daily', event: 'dungeonCleared', target: 1, name: '远征出发', description: '通关任意副本1次。', reward: { gold: 70 } },
    { id: 'daily_clear_2', group: 'daily', event: 'dungeonCleared', target: 2, name: '连续远征', description: '通关任意副本2次。', reward: { gold: 110 } },
    { id: 'daily_clear_3', group: 'daily', event: 'dungeonCleared', target: 3, name: '深入战区', description: '通关任意副本3次。', reward: { gold: 145 } },
    { id: 'daily_cards_10', group: 'daily', event: 'cardsPlayed', target: 10, name: '战术热身', description: '在副本中累计打出10张牌。', reward: { gold: 70 } },
    { id: 'daily_cards_20', group: 'daily', event: 'cardsPlayed', target: 20, name: '战术演练', description: '在副本中累计打出20张牌。', reward: { gold: 110 } },
    { id: 'daily_cards_30', group: 'daily', event: 'cardsPlayed', target: 30, name: '连携大师', description: '在副本中累计打出30张牌。', reward: { gold: 150 } },
    { id: 'daily_boss_1', group: 'daily', event: 'bossDefeated', target: 1, name: '首领追猎', description: '击败1名副本首领。', reward: { gold: 85 } },
    { id: 'daily_boss_2', group: 'daily', event: 'bossDefeated', target: 2, name: '双重讨伐', description: '累计击败2名副本首领。', reward: { gold: 130 } },
    { id: 'daily_equipment_2', group: 'daily', event: 'equipmentObtained', target: 2, name: '战利品整备', description: '获得2件副本装备。', reward: { gold: 80 } },
    { id: 'daily_equipment_4', group: 'daily', event: 'equipmentObtained', target: 4, name: '军需补充', description: '获得4件副本装备。', reward: { gold: 120 } },
    { id: 'daily_hard_1', group: 'daily', event: 'hardDungeonCleared', target: 1, name: '困难突破', description: '通关任意困难副本1次。', reward: { gold: 130 }, availability: 'hardUnlocked' },
    { id: 'daily_pack_1', group: 'daily', event: 'packOpened', target: 1, name: '卡包补给', description: '开启任意卡包1次。', reward: { gold: 100 }, availability: 'packAffordable', spending: true },
    { id: 'daily_upgrade_1', group: 'daily', event: 'cardUpgraded', target: 1, name: '精进牌技', description: '升级任意卡牌1次。', reward: { gold: 110 }, availability: 'cardUpgradeable', spending: true },
    { id: 'weekly_clear_8', group: 'weekly', event: 'dungeonCleared', target: 8, name: '本周远征', description: '本周累计通关8次副本。', reward: { gold: 450, vouchers: 1 } },
    { id: 'weekly_boss_3', group: 'weekly', event: 'bossDefeated', target: 3, name: '首领讨伐', description: '本周击败3名副本首领。', reward: { gold: 380 } },
    { id: 'weekly_cards_80', group: 'weekly', event: 'cardsPlayed', target: 80, name: '百式磨炼', description: '本周累计打出80张牌。', reward: { gold: 420 } },
    { id: 'weekly_equipment_6', group: 'weekly', event: 'equipmentObtained', target: 6, name: '整备军需', description: '本周获得6件副本装备。', reward: { gold: 360 } },
    { id: 'growth_level_10', group: 'growth', event: 'maxCharacterLevel', aggregation: 'max', target: 10, name: '初露锋芒', description: '任意角色达到Lv.10。', reward: { gold: 300 } },
    { id: 'growth_advancement_1', group: 'growth', event: 'maxAdvancementTier', aggregation: 'max', target: 1, name: '职业抉择', description: '任意角色完成一转。', reward: { gold: 500, vouchers: 1 } },
    { id: 'growth_card_level_5', group: 'growth', event: 'maxCardLevel', aggregation: 'max', target: 5, name: '核心卡牌', description: '将任意卡牌提升至Lv.5。', reward: { gold: 400 } },
    { id: 'growth_hard_clear', group: 'growth', event: 'hardDungeonCleared', target: 1, name: '困难突破', description: '首次通关任意困难副本。', reward: { gold: 550 } },
]);

const emptyMissionGroup = (periodKey = '', activeIds = []) => ({ periodKey, activeIds, progress: {}, claimed: [] });
const emptyLiveOps = () => ({
    claims: {},
    transactions: [],
    missions: { daily: emptyMissionGroup(), weekly: emptyMissionGroup(), growth: emptyMissionGroup('lifetime') },
});

export const PEAK_ACCOUNT_ACHIEVEMENTS = Object.freeze([
    { id: 'first_adventurer', name: '冒险启程', description: '创建首个巅峰对决角色。' },
    { id: 'three_paths', name: '三路并进', description: '账号拥有3名角色。' },
    { id: 'card_collector_50', name: '卡牌收藏家', description: '账号图鉴发现50张卡牌。' },
    { id: 'first_advancement', name: '职业觉醒', description: '任意角色完成一次转职。' },
    { id: 'peak_six', name: '半程巅峰', description: '巅峰试炼历史最高达到第6层。' },
    { id: 'peak_master', name: '巅峰之主', description: '完成巅峰试炼第12层。' },
]);

const emptyAccountRecords = () => ({
    codexCardIds: [],
    tutorialViewedIds: [],
    achievementIds: [],
});

const clone = (value) => JSON.parse(JSON.stringify(value));
const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const LEGACY_STARTER_DECKS_V13 = Object.freeze({
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
});
const LEGACY_STARTER_DECKS_V14 = Object.freeze({
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
});
const LEGACY_STARTER_DECKS_V15 = Object.freeze({
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
});
const sameCardOrder = (left, right) => Array.isArray(left) && Array.isArray(right)
    && left.length === right.length && left.every((id, index) => id === right[index]);
const migrateStarterDeck = (character, sourceVersion, targetVersion, legacyDecks) => {
    const legacy = legacyDecks[character?.baseClassId];
    const replacement = PEAK_STARTER_DECKS[character?.baseClassId];
    if (sourceVersion >= targetVersion || !legacy || !replacement) return;
    character.deck.presets.forEach((preset) => {
        if (sameCardOrder(preset.cards, legacy)) preset.cards = [...replacement];
    });
    if (sameCardOrder(character.deck.cards, legacy)) character.deck.cards = [...replacement];
};
const migrateStarterDeckV14 = (character, sourceVersion) => migrateStarterDeck(character, sourceVersion, 14, LEGACY_STARTER_DECKS_V13);
const migrateStarterDeckV15 = (character, sourceVersion) => migrateStarterDeck(character, sourceVersion, 15, LEGACY_STARTER_DECKS_V14);
const migrateStarterDeckV16 = (character, sourceVersion) => migrateStarterDeck(character, sourceVersion, 16, LEGACY_STARTER_DECKS_V15);
const exposeActiveCharacterContext = (state) => {
    if (!state || typeof state !== 'object') return state;
    Object.defineProperties(state, {
        activeClass: { configurable: true, get: () => state.characters?.[state.activeCharacterId]?.baseClassId || '' },
        stamina: { configurable: true, get: () => state.characters?.[state.activeCharacterId]?.stamina || { current: 0, max: 0, updatedAt: 0 } },
        progress: { configurable: true, get: () => state.characters?.[state.activeCharacterId]?.progress || emptyProgress() },
        activeRun: {
            configurable: true,
            get: () => state.characters?.[state.activeCharacterId]?.activeRun || null,
            set: (value) => { if (state.characters?.[state.activeCharacterId]) state.characters[state.activeCharacterId].activeRun = value; },
        },
    });
    return state;
};
const ignoredTurnBasedStats = new Set(['attackSpeed', 'moveSpeed', 'baseMoveSpeed', 'castSpeed', 'cooldownReduction']);
const turnBasedStats = (stats) => Object.fromEntries(Object.entries(stats && typeof stats === 'object' ? stats : {})
    .filter(([key, value]) => !ignoredTurnBasedStats.has(key) && Number.isFinite(Number(value)) && Number(value) >= 0)
    .map(([key, value]) => [key, Number(value)]));

const blessingRankCost = (node, rank) => Array.from({ length: rank }, (_, index) => node.goldBase + node.goldGrowth * index)
    .reduce((sum, cost) => sum + cost, 0);

const pruneInvalidPeakBlessings = (character) => {
    const ranks = character?.blessings?.ranks || {};
    let refund = 0;
    let changed = true;
    while (changed) {
        changed = false;
        Object.entries(ranks).forEach(([id, storedRank]) => {
            const node = PEAK_BLESSING_BY_ID[id];
            if (!node || !node.requires.some((requiredId) => (ranks[requiredId] || 0) < PEAK_BLESSING_BY_ID[requiredId].maxRank)) return;
            refund += blessingRankCost(node, Math.max(0, Math.min(node.maxRank, Math.floor(finite(storedRank)))));
            delete ranks[id];
            changed = true;
        });
    }
    return refund;
};

const starterItem = (classId, now) => {
    const source = PEAK_STARTER_EQUIPMENT[classId];
    return { ...clone(source), stats: turnBasedStats(source.stats), id: `peak-${classId}-starter`, quality: 1, grade: 'highest', equipped: true, locked: true, acquiredAt: now };
};

const emptyProgress = () => ({ cleared: {}, unlockedDungeons: ['breeze_watch_normal'], selectedDungeon: 'breeze_watch_normal', claimedRuns: [] });
const cardEntry = (copies = 0) => ({ unlocked: copies > 0, level: 1, upgradeCopies: 0, copies });
const emptyClassCollections = () => Object.fromEntries(Object.keys(PEAK_CHARACTERS).map((classId) => [classId, {}]));
const emptyUniversalShards = () => Object.fromEntries(PEAK_UNIVERSAL_SHARD_RARITIES.map((rarity) => [rarity, 0]));
const emptyClassShards = () => Object.fromEntries(Object.keys(PEAK_CHARACTERS).map((classId) => [classId, emptyUniversalShards()]));
const normalizeUniversalShards = (source) => {
    const result = emptyUniversalShards();
    if (source && typeof source === 'object') {
        PEAK_UNIVERSAL_SHARD_RARITIES.forEach((rarity) => {
            result[rarity] = Math.max(0, Math.min(999999, Math.floor(finite(source[rarity]))));
        });
    } else if (Number.isFinite(Number(source))) {
        result.common = Math.max(0, Math.min(999999, Math.floor(finite(source))));
    }
    return result;
};
const normalizeClassShards = (source) => {
    const result = emptyClassShards();
    Object.keys(PEAK_CHARACTERS).forEach((classId) => {
        result[classId] = normalizeUniversalShards(source?.[classId]);
    });
    return result;
};
const starterCardCounts = (classId, shared) => PEAK_STARTER_DECKS[classId].reduce((counts, id) => {
    const card = PEAK_CARD_BY_ID[id];
    if (card && (shared ? card.classId === 'all' : card.classId === classId)) counts[id] = (counts[id] || 0) + 1;
    return counts;
}, {});
const starterClassCollection = (classId) => Object.fromEntries(Object.entries(starterCardCounts(classId, false)).map(([id, copies]) => [id, cardEntry(copies)]));
const starterUniversalCollection = () => {
    const counts = {};
    Object.keys(PEAK_STARTER_DECKS).forEach((classId) => Object.entries(starterCardCounts(classId, true)).forEach(([id, copies]) => { counts[id] = Math.max(counts[id] || 0, copies); }));
    return Object.fromEntries(Object.entries(counts).map(([id, copies]) => [id, cardEntry(copies)]));
};
const createCharacterId = (now = Date.now()) => globalThis.crypto?.randomUUID?.() || `peak-${Math.floor(now).toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const createDeckPresets = (classId, cards, primaryName = `${PEAK_CHARACTERS[classId].name}起始卡组`) => Array.from({ length: PEAK_DECK_PRESET_LIMIT }, (_, index) => ({
    id: `preset-${index + 1}`,
    name: index === 0 ? primaryName : `方案${['一', '二', '三'][index]}`,
    cards: index === 0 ? [...cards] : [],
}));

const freshCharacter = (classId, now, options = {}) => {
    const item = starterItem(classId, now);
    return {
        id: options.id || createCharacterId(now),
        name: String(options.name || PEAK_CHARACTERS[classId].name),
        needsNaming: Boolean(options.needsNaming),
        baseClassId: classId,
        advancement: { tier: 0, pathId: null, tier1CompletedAt: null, tier2CompletedAt: null },
        level: 1,
        xp: 0,
        overflowXp: 0,
        stamina: { current: 40, max: 40, updatedAt: now },
        collection: starterClassCollection(classId),
        deck: {
            id: `${classId}-starter`,
            name: `${PEAK_CHARACTERS[classId].name}起始卡组`,
            cards: [...PEAK_STARTER_DECKS[classId]],
            activePresetId: 'preset-1',
            presets: createDeckPresets(classId, PEAK_STARTER_DECKS[classId]),
        },
        inventory: [item],
        equipped: Object.fromEntries(PEAK_EQUIPMENT_SLOTS.map((slot) => [slot, slot === 'weapon' ? item.id : ''])),
        blessings: { ranks: {} },
        progress: emptyProgress(),
        activeRun: null,
        peakTrial: null,
        createdAt: now,
        updatedAt: now,
        lastPlayedAt: now,
    };
};

export const createPeakSave = (now = Date.now()) => ({
    version: PEAK_SAVE_VERSION,
    storageRevision: 0,
    [SAVE_BASELINE]: { raw: null, error: null },
    activeCharacterId: '',
    characterOrder: [],
    wallet: { gold: 500, vouchers: 0 },
    universalShards: emptyUniversalShards(),
    classShards: emptyClassShards(),
    collection: starterUniversalCollection(),
    classCollections: emptyClassCollections(),
    characters: {},
    deletedCharacters: [],
    shop: { epicPity: 0, history: [] },
    attendance: { lastClaimDate: '', streak: 0, totalDays: 0, claimedStreakMilestones: [], claimedTotalMilestones: [] },
    vip: { growth: 0, lastDailyClaimDate: '' },
    liveOps: emptyLiveOps(),
    accountRecords: emptyAccountRecords(),
    peakTrialProgress: { weekKey: '', weeklyBestFloor: 0, weeklyRunsStarted: 0, weeklyClaimedMilestones: [], lifetimeBestFloor: 0, lifetimeClearedFloors: [], completedRuns: 0 },
    settings: {
        sound: true,
        reducedMotion: false,
        resolutionSpeed: 1,
        codex: { classFilter: 'all', rarityFilter: 'all', typeFilter: 'all', ownershipFilter: 'all', advancementFilter: 'all', sort: 'rarity' },
        deck: { rarityFilter: 'all', typeFilter: 'all', sort: 'rarity' },
        inventory: { slotFilter: 'all', rarityFilter: 'all', statusFilter: 'all', statFilter: 'all' },
    },
    createdAt: now,
    updatedAt: now,
});

const safeItem = (item) => {
    if (!item || typeof item !== 'object' || typeof item.id !== 'string' || !PEAK_EQUIPMENT_SLOTS.includes(item.slot)) return null;
    if (item.slot === 'weapon' && !PEAK_CHARACTERS[item.classId]) return null;
    const id = item.id.trim().slice(0, 96);
    if (!id) return null;
    return {
        ...item,
        id,
        name: String(item.name || PEAK_EQUIPMENT_SLOT_LABELS[item.slot]).slice(0, 40),
        level: Math.max(1, Math.min(60, Math.floor(finite(item.level, 1)))),
        rarity: PEAK_EQUIPMENT_RARITIES[item.rarity] ? item.rarity : 'common',
        grade: PEAK_EQUIPMENT_GRADES[item.grade] ? item.grade : 'middle',
        quality: Math.max(0, Math.min(1, finite(item.quality, 1))),
        classId: item.slot === 'weapon' ? item.classId : null,
        stats: turnBasedStats(item.stats),
        price: Math.max(0, Math.floor(finite(item.price))),
        equipped: Boolean(item.equipped),
        locked: Boolean(item.locked),
    };
};

const safeCardCollection = (source, accepts) => {
    const collection = {};
    Object.entries(source || {}).forEach(([id, entry]) => {
        const card = PEAK_CARD_BY_ID[id];
        if (!card || !accepts(card) || !entry || typeof entry !== 'object') return;
        collection[id] = {
            unlocked: Boolean(entry.unlocked),
            level: Math.max(1, Math.min(10, Math.floor(finite(entry.level, 1)))),
            upgradeCopies: Math.max(0, Math.floor(finite(entry.upgradeCopies, entry.fragments))),
            copies: Math.max(0, Math.floor(finite(entry.copies))),
        };
    });
    return collection;
};

const mergePeakCardCollections = (target, source) => {
    Object.entries(source || {}).forEach(([id, incoming]) => {
        if (!incoming) return;
        const current = target[id];
        if (!current) {
            target[id] = clone(incoming);
            return;
        }
        current.unlocked = current.unlocked || incoming.unlocked;
        current.level = Math.max(current.level, incoming.level);
        current.upgradeCopies = Math.max(current.upgradeCopies, incoming.upgradeCopies);
        current.copies = Math.max(current.copies, incoming.copies);
    });
    return target;
};

const classCollectionFor = (save, classId) => {
    if (!save?.classCollections || !PEAK_CHARACTERS[classId]) return null;
    save.classCollections[classId] ||= {};
    return save.classCollections[classId];
};

const syncPeakAccountRecords = (state) => {
    state.accountRecords ||= emptyAccountRecords();
    const discovered = [
        ...Object.entries(state.collection || {}).filter(([, entry]) => entry?.unlocked).map(([id]) => id),
        ...Object.values(state.classCollections || {}).flatMap((bucket) => Object.entries(bucket || {}).filter(([, entry]) => entry?.unlocked).map(([id]) => id)),
    ];
    state.accountRecords.codexCardIds = [...new Set([...state.accountRecords.codexCardIds, ...discovered])].filter((id) => PEAK_CARD_BY_ID[id]).slice(0, PEAK_CARDS.length);
    const unlocked = new Set(state.accountRecords.achievementIds);
    if (state.characterOrder?.length) unlocked.add('first_adventurer');
    if ((state.characterOrder?.length || 0) >= 3) unlocked.add('three_paths');
    if (state.accountRecords.codexCardIds.length >= 50) unlocked.add('card_collector_50');
    if (Object.values(state.characters || {}).some((character) => Number(character.advancement?.tier) >= 1)) unlocked.add('first_advancement');
    if (Number(state.peakTrialProgress?.lifetimeBestFloor) >= 6) unlocked.add('peak_six');
    if (Number(state.peakTrialProgress?.lifetimeBestFloor) >= 12) unlocked.add('peak_master');
    state.accountRecords.achievementIds = [...unlocked].filter((id) => PEAK_ACCOUNT_ACHIEVEMENTS.some((achievement) => achievement.id === id));
    return state.accountRecords;
};

const safePeakTrial = (source) => {
    if (!source || typeof source !== 'object') return null;
    const phase = ['ready', 'fighting', 'choosing', 'failed', 'completed'].includes(source.phase) ? source.phase : 'failed';
    const validBoonIds = new Set(PEAK_TRIAL_BOONS.map((entry) => entry.id));
    const boons = (Array.isArray(source.boons) ? source.boons : []).filter((id) => validBoonIds.has(id)).slice(0, 11);
    const choices = [...new Set((Array.isArray(source.choices) ? source.choices : []).filter((id) => validBoonIds.has(id)))].slice(0, 3);
    return {
        version: 1,
        id: String(source.id || '').slice(0, 96),
        seed: Math.floor(finite(source.seed, 1)) >>> 0,
        floor: Math.max(1, Math.min(12, Math.floor(finite(source.floor, 1)))),
        phase,
        remainingHpRatio: Math.max(.05, Math.min(1, finite(source.remainingHpRatio, 1))),
        boons,
        choices: phase === 'choosing' ? choices : [],
        settledBattleIds: [...new Set((Array.isArray(source.settledBattleIds) ? source.settledBattleIds : []).filter((id) => typeof id === 'string').map((id) => id.slice(0, 128)))].slice(-12),
        earnedGold: Math.max(0, Math.floor(finite(source.earnedGold))),
        earnedVouchers: Math.max(0, Math.floor(finite(source.earnedVouchers))),
        createdAt: Math.max(0, Math.floor(finite(source.createdAt))),
        updatedAt: Math.max(0, Math.floor(finite(source.updatedAt))),
    };
};

const safeCharacter = (source, classId, now, options = {}) => {
    const fallback = freshCharacter(classId, now, { id: options.id, name: options.name, needsNaming: options.needsNaming });
    const level = Math.max(1, Math.min(60, Math.floor(finite(source?.level, 1))));
    const seenIds = new Set();
    const inventorySource = Array.isArray(source?.inventory) ? source.inventory : fallback.inventory;
    const inventory = inventorySource.map(safeItem).filter((item) => {
        if (!item || seenIds.has(item.id)) return false;
        seenIds.add(item.id);
        return true;
    }).slice(0, 120);
    const equippedSource = source?.equipped && typeof source.equipped === 'object' ? source.equipped : fallback.equipped;
    const equipped = Object.fromEntries(PEAK_EQUIPMENT_SLOTS.map((slot) => {
        const id = typeof equippedSource[slot] === 'string' ? equippedSource[slot] : '';
        const item = inventory.find((entry) => entry.id === id && entry.slot === slot);
        return [slot, item && (!item.classId || item.classId === classId) && item.level <= level ? id : ''];
    }));
    const blessingRanks = Object.fromEntries(Object.entries(source?.blessings?.ranks || {}).flatMap(([id, rank]) => {
        const node = PEAK_BLESSING_BY_ID[id];
        return node ? [[id, Math.max(0, Math.min(node.maxRank, Math.floor(finite(rank))))]] : [];
    }).filter(([, rank]) => rank > 0));
    inventory.forEach((item) => { item.equipped = equipped[item.slot] === item.id; });
    const path = PEAK_ADVANCEMENTS[source?.advancement?.pathId];
    const pathId = path?.baseClassId === classId ? path.id : null;
    const tier = pathId ? Math.max(1, Math.min(2, Math.floor(finite(source?.advancement?.tier, 1)))) : 0;
    const overflowCapLevel = tier === 0 ? PEAK_ADVANCEMENT_LEVELS.first : tier === 1 ? PEAK_ADVANCEMENT_LEVELS.second : 0;
    const overflowXpCap = level === overflowCapLevel ? getPeakLevelXpRequirement(overflowCapLevel) : 0;
    const deckSource = source?.deck || options.deck;
    const normalizeDeckCards = (cards, fallbackCards = []) => (Array.isArray(cards) ? cards : fallbackCards)
        .map((id) => classId === 'brawler' && id === 'rising_cut' ? 'brawler_uppercut' : id)
        .filter((id) => PEAK_CARD_BY_ID[id]).slice(0, PEAK_DECK_LIMITS.max);
    const deckCards = normalizeDeckCards(deckSource?.cards, fallback.deck.cards);
    const presetSources = Array.isArray(deckSource?.presets) ? deckSource.presets : [];
    const requestedActivePresetId = String(deckSource?.activePresetId || 'preset-1');
    const activePresetId = Array.from({ length: PEAK_DECK_PRESET_LIMIT }, (_, index) => `preset-${index + 1}`).includes(requestedActivePresetId)
        ? requestedActivePresetId
        : 'preset-1';
    const presets = Array.from({ length: PEAK_DECK_PRESET_LIMIT }, (_, index) => {
        const id = `preset-${index + 1}`;
        const presetSource = presetSources.find((entry) => entry?.id === id) || presetSources[index];
        const legacyPrimary = index === 0 && !presetSources.length;
        const defaultName = legacyPrimary ? String(deckSource?.name || fallback.deck.name) : `方案${['一', '二', '三'][index]}`;
        return {
            id,
            name: String(presetSource?.name || defaultName).trim().slice(0, 16) || defaultName,
            cards: id === activePresetId ? [...deckCards] : normalizeDeckCards(presetSource?.cards, legacyPrimary ? deckCards : []),
        };
    });
    const activePreset = presets.find((preset) => preset.id === activePresetId) || presets[0];
    const collection = safeCardCollection(source?.collection || options.collection, (card) => card.classId === classId);
    Object.entries(fallback.collection).forEach(([id, entry]) => {
        if (!collection[id]) collection[id] = entry;
        else { collection[id].unlocked = true; collection[id].copies = Math.max(collection[id].copies, entry.copies); }
    });
    return {
        id: String(source?.id || options.id || fallback.id).slice(0, 96),
        name: String(source?.name || options.name || fallback.name).trim().slice(0, 12),
        needsNaming: Boolean(source?.needsNaming ?? options.needsNaming),
        baseClassId: classId,
        advancement: {
            tier, pathId,
            tier1CompletedAt: tier >= 1 ? finite(source?.advancement?.tier1CompletedAt, now) : null,
            tier2CompletedAt: tier >= 2 ? finite(source?.advancement?.tier2CompletedAt, now) : null,
        },
        level,
        xp: Math.max(0, Math.floor(finite(source?.xp))),
        overflowXp: Math.min(overflowXpCap, Math.max(0, Math.floor(finite(source?.overflowXp)))),
        stamina: {
            current: Math.max(0, Math.min(40, Math.floor(finite(source?.stamina?.current, options.stamina?.current ?? 40)))),
            max: 40,
            updatedAt: finite(source?.stamina?.updatedAt, options.stamina?.updatedAt ?? now),
        },
        collection,
        deck: {
            id: String(deckSource?.id || fallback.deck.id).slice(0, 48),
            name: activePreset.name,
            cards: [...activePreset.cards],
            activePresetId: activePreset.id,
            presets,
        },
        inventory,
        equipped,
        blessings: { ranks: blessingRanks },
        progress: clone(source?.progress || options.progress || fallback.progress),
        activeRun: source?.activeRun ?? options.activeRun ?? null,
        peakTrial: safePeakTrial(source?.peakTrial),
        createdAt: finite(source?.createdAt, now),
        updatedAt: finite(source?.updatedAt, now),
        lastPlayedAt: finite(source?.lastPlayedAt, source?.updatedAt ?? now),
    };
};

const safeActiveRun = (source, collection) => {
    if (Number(source?.version) !== 2 || !source.player || !source.enemy) return null;
    const run = clone(source);
    run.randomCounter = Math.max(0, Math.floor(finite(run.randomCounter)));
    run.player.statuses = Array.isArray(run.player.statuses) ? run.player.statuses : [];
    run.enemy.statuses = Array.isArray(run.enemy.statuses) ? run.enemy.statuses : [];
    [run.player, run.enemy].forEach((combatant) => {
        combatant.statuses.forEach((status) => {
            if (['weak', 'vulnerable'].includes(status.id || status.status)) status.stacks = 1;
        });
    });
    const safeDelayedBursts = (entries) => (Array.isArray(entries) ? entries : []).flatMap((entry) => (
        finite(entry?.damage) > 0 ? [{ damage: Math.max(1, Math.min(999999, Math.floor(finite(entry.damage)))), damageType: ['physical', 'magical', 'true'].includes(entry.damageType) ? entry.damageType : 'physical', name: String(entry.name || '延迟爆发').slice(0, 40), sourceCardId: String(entry.sourceCardId || '').slice(0, 96) }] : []
    )).slice(-4);
    run.player.delayedBursts = safeDelayedBursts(run.player.delayedBursts);
    run.enemy.delayedBursts = safeDelayedBursts(run.enemy.delayedBursts);
    run.player.buffs = Array.isArray(run.player.buffs) ? run.player.buffs : [];
    run.enemy.buffs = Array.isArray(run.enemy.buffs) ? run.enemy.buffs : [];
    run.player.shieldRetention = Math.max(0, Math.min(60, finite(run.player.shieldRetention)));
    run.enemy.shieldRetention = Math.max(0, Math.min(60, finite(run.enemy.shieldRetention)));
    run.player.stunCharges = Math.max(0, Math.min(3, Math.floor(finite(run.player.stunCharges))));
    run.enemy.stunCharges = Math.max(0, Math.min(3, Math.floor(finite(run.enemy.stunCharges))));
    const safeEmpowerments = (entries) => (Array.isArray(entries) ? entries : []).flatMap((entry) => (
        ['attack', 'skill', 'defense'].includes(entry?.category) && finite(entry?.uses) > 0
            ? [{ category: entry.category, value: Math.max(1, Math.min(40, finite(entry.value, 1))), uses: Math.max(1, Math.min(3, Math.floor(finite(entry.uses, 1)))) }]
            : []
    )).slice(0, 4);
    run.player.empowerments = safeEmpowerments(run.player.empowerments);
    run.enemy.empowerments = safeEmpowerments(run.enemy.empowerments);
    const safeReactiveDefense = (combatant) => {
        combatant.guards = (Array.isArray(combatant.guards) ? combatant.guards : []).flatMap((guard) => {
            const uses = Math.max(0, Math.min(2, Math.floor(finite(guard?.uses))));
            const duration = Math.max(0, Math.min(3, Math.floor(finite(guard?.duration))));
            return uses && duration ? [{ reduction: Math.max(1, Math.min(40, finite(guard.reduction, 1))), uses, duration, counterRatio: Math.max(0, Math.min(70, finite(guard.counterRatio))), restoreMp: Math.max(0, Math.min(6, finite(guard.restoreMp))), dodge: Boolean(guard.dodge) }] : [];
        }).slice(-3);
        const safeTimedEntries = (entries, normalize) => (Array.isArray(entries) ? entries : []).flatMap((entry) => {
            const uses = Math.max(0, Math.min(2, Math.floor(finite(entry?.uses))));
            const duration = Math.max(0, Math.min(3, Math.floor(finite(entry?.duration))));
            return uses && duration ? [{ ...normalize(entry), uses, duration }] : [];
        }).slice(-3);
        combatant.manaBarriers = safeTimedEntries(combatant.manaBarriers, (entry) => ({ ratio: Math.max(1, Math.min(35, finite(entry.ratio, 1))) }));
        combatant.thorns = safeTimedEntries(combatant.thorns, (entry) => ({ ratio: Math.max(1, Math.min(70, finite(entry.ratio, 1))) }));
        combatant.damageCaps = safeTimedEntries(combatant.damageCaps, (entry) => ({ ratio: Math.max(1, Math.min(35, finite(entry.ratio, 1))) }));
        combatant.shieldBreaks = safeTimedEntries(combatant.shieldBreaks, (entry) => ({ healPercent: Math.max(0, Math.min(20, finite(entry.healPercent))), draw: Math.max(0, Math.min(2, Math.floor(finite(entry.draw)))) }));
        const wardCharges = Math.max(0, Math.min(3, Math.floor(finite(combatant.statusWard?.charges))));
        const wardDuration = Math.max(0, Math.min(3, Math.floor(finite(combatant.statusWard?.duration))));
        combatant.statusWard = wardCharges && wardDuration ? { charges: wardCharges, duration: wardDuration } : null;
        const standCharges = Math.max(0, Math.min(1, Math.floor(finite(combatant.lastStand?.charges))));
        const persistentStand = Boolean(combatant.lastStand?.persistent);
        const standDuration = Math.max(0, Math.min(persistentStand ? 999 : 3, Math.floor(finite(combatant.lastStand?.duration))));
        combatant.lastStand = standCharges && standDuration ? { charges: standCharges, duration: standDuration, shieldPercent: Math.max(0, Math.min(20, finite(combatant.lastStand?.shieldPercent))), persistent: persistentStand } : null;
    };
    safeReactiveDefense(run.player);
    safeReactiveDefense(run.enemy);
    run.player.drawPerTurn = Math.max(1, Math.min(10, Math.floor(finite(run.player.drawPerTurn, 2))));
    run.player.drawInterval = Math.max(0, Math.min(10, Math.floor(finite(run.player.drawInterval))));
    run.player.openingHandBonus = Math.max(0, Math.min(4, Math.floor(finite(run.player.openingHandBonus))));
    run.player.nextTurnDraw = Math.max(0, Math.min(10, Math.floor(finite(run.player.nextTurnDraw))));
    run.player.nextTurnDrawPenalty = Math.max(0, Math.min(10, Math.floor(finite(run.player.nextTurnDrawPenalty))));
    const safeScheduledCards = (entries) => (Array.isArray(entries) ? entries : []).flatMap((entry) => (
        PEAK_CARD_BY_ID[entry?.cardId] && finite(entry?.turns) > 0
            ? [{ cardId: entry.cardId, turns: Math.max(1, Math.min(3, Math.floor(finite(entry.turns, 1)))), level: Math.max(1, Math.min(10, Math.floor(finite(entry.level, 1)))) }]
            : []
    )).slice(-8);
    run.player.scheduledCards = safeScheduledCards(run.player.scheduledCards);
    run.enemy.drawPerTurn = Math.max(1, Math.min(10, Math.floor(finite(run.enemy.drawPerTurn, 3))));
    run.enemy.nextTurnDraw = Math.max(0, Math.min(10, Math.floor(finite(run.enemy.nextTurnDraw))));
    run.enemy.nextTurnDrawPenalty = Math.max(0, Math.min(10, Math.floor(finite(run.enemy.nextTurnDrawPenalty))));
    run.enemy.scheduledCards = safeScheduledCards(run.enemy.scheduledCards);
    const safeSpecialCombatState = (combatant) => {
        combatant.cardDisruptions = (Array.isArray(combatant.cardDisruptions) ? combatant.cardDisruptions : []).flatMap((entry) => {
            const categories = [...new Set((Array.isArray(entry?.categories) ? entry.categories : []).filter((category) => ['buff', 'defense'].includes(category)))];
            const all = Boolean(entry?.all);
            const charges = all ? 0 : Math.max(0, Math.min(2, Math.floor(finite(entry?.charges))));
            return categories.length && (all || charges) ? [{ categories, charges, all, discardAtTurnEnd: Boolean(entry?.discardAtTurnEnd) }] : [];
        }).slice(-3);
        const immunityDuration = Math.max(0, Math.min(2, Math.floor(finite(combatant.debuffImmunity?.duration))));
        combatant.debuffImmunity = immunityDuration ? { duration: immunityDuration, skipFirstEnd: Boolean(combatant.debuffImmunity?.skipFirstEnd) } : null;
        const phoenixDuration = Math.max(0, Math.min(3, Math.floor(finite(combatant.phoenixWard?.duration))));
        const phoenixCharges = Math.max(0, Math.min(1, Math.floor(finite(combatant.phoenixWard?.charges))));
        combatant.phoenixWard = phoenixDuration && phoenixCharges ? { duration: phoenixDuration, charges: phoenixCharges } : null;
        const safeDamageBoosts = (entries) => (Array.isArray(entries) ? entries : []).flatMap((entry) => {
            if (!['physical', 'magical', 'true', 'all'].includes(entry?.damageType) || finite(entry?.value) <= 0) return [];
            const classId = PEAK_CHARACTERS[entry.classId] ? entry.classId : '';
            const categories = [...new Set((Array.isArray(entry.categories) ? entry.categories : []).filter((category) => ['attack', 'skill'].includes(category)))];
            return [{ damageType: entry.damageType, value: Math.max(1, Math.min(40, finite(entry.value, 1))), ...(classId ? { classId } : {}), ...(categories.length ? { categories } : {}) }];
        }).slice(-4);
        combatant.roundDamageBoosts = safeDamageBoosts(combatant.roundDamageBoosts);
        combatant.nextTurnDamageBoosts = safeDamageBoosts(combatant.nextTurnDamageBoosts);
        const physicalPenetration = Math.max(0, Math.min(80, finite(combatant.roundPenetration?.physical)));
        const magicalPenetration = Math.max(0, Math.min(80, finite(combatant.roundPenetration?.magical)));
        combatant.roundPenetration = physicalPenetration || magicalPenetration ? { physical: physicalPenetration, magical: magicalPenetration } : null;
        const drawnSwordAttackBonus = Math.max(0, Math.min(80, finite(combatant.drawnSword?.attackBonus)));
        combatant.drawnSword = drawnSwordAttackBonus ? { attackBonus: drawnSwordAttackBonus } : null;
        const damagePenalty = Math.max(0, Math.min(30, finite(combatant.roundTradeoff?.damagePenalty)));
        const sustainBonus = Math.max(0, Math.min(60, finite(combatant.roundTradeoff?.sustainBonus)));
        combatant.roundTradeoff = damagePenalty || sustainBonus ? { damagePenalty, sustainBonus } : null;
        combatant.damageConversions = (Array.isArray(combatant.damageConversions) ? combatant.damageConversions : []).flatMap((entry) => (
            ['physical', 'magical'].includes(entry?.from) && ['physical', 'magical'].includes(entry?.to) && entry.from !== entry.to
                ? [{ from: entry.from, to: entry.to, bonus: Math.max(0, Math.min(30, finite(entry.bonus))) }]
                : []
        )).slice(-2);
        const shieldBonus = Math.max(0, Math.min(80, finite(combatant.shieldVanguard?.shieldBonus)));
        const breakBonus = Math.max(0, Math.min(10, finite(combatant.shieldVanguard?.breakBonus)));
        combatant.shieldVanguard = shieldBonus ? { shieldBonus, breakBonus, activated: Boolean(combatant.shieldVanguard?.activated) } : null;
        combatant.routeResourcePreserveUses = Math.max(0, Math.min(3, Math.floor(finite(combatant.routeResourcePreserveUses))));
        const routeEchoStatuses = [...new Set((Array.isArray(combatant.routeStatusEcho?.statuses) ? combatant.routeStatusEcho.statuses : [])
            .filter((status) => PEAK_STATUS_EFFECTS[status]?.harmful))];
        const routeEchoUses = Math.max(0, Math.min(3, Math.floor(finite(combatant.routeStatusEcho?.uses))));
        combatant.routeStatusEcho = routeEchoStatuses.length && routeEchoUses ? {
            statuses: routeEchoStatuses,
            bonusStacks: Math.max(0, Math.min(3, Math.floor(finite(combatant.routeStatusEcho?.bonusStacks)))),
            durationBonus: Math.max(0, Math.min(2, Math.floor(finite(combatant.routeStatusEcho?.durationBonus)))),
            uses: routeEchoUses,
        } : null;
    };
    safeSpecialCombatState(run.player);
    safeSpecialCombatState(run.enemy);
    const advancementTier = Math.max(0, Math.min(2, Math.floor(finite(run.player.advancement?.tier))));
    const advancementPath = PEAK_ADVANCEMENTS[run.player.advancement?.pathId];
    run.player.advancement = advancementTier > 0 && advancementPath
        ? { ...run.player.advancement, tier: advancementTier, pathId: advancementPath.id }
        : { tier: 0, pathId: '' };
    run.player.advancementCombat = advancementTier > 0 && advancementPath?.combat ? clone(advancementPath.combat) : null;
    if (run.player.advancementCombat) {
        const routeMax = Math.max(1, Math.floor(finite(advancementTier >= 2 ? run.player.advancementCombat.secondMax : run.player.advancementCombat.max, 1)));
        run.player.routeResource = {
            id: run.player.advancementCombat.resourceId,
            name: run.player.advancementCombat.resourceName,
            color: run.player.advancementCombat.color,
            value: Math.max(0, Math.min(routeMax, Math.floor(finite(run.player.routeResource?.value)))),
            max: routeMax,
        };
        run.player.baseShieldRetention = Math.max(0, Math.min(100, finite(advancementTier >= 2 ? run.player.advancementCombat.secondShieldRetention : run.player.advancementCombat.shieldRetention)));
        run.player.shieldRetention = Math.max(run.player.shieldRetention, run.player.baseShieldRetention);
    } else {
        run.player.routeResource = null;
        run.player.baseShieldRetention = 0;
    }
    const trialPath = PEAK_ADVANCEMENTS[run.advancementTrial?.pathId];
    const trialTier = Math.max(0, Math.min(2, Math.floor(finite(run.advancementTrial?.tier))));
    run.advancementTrial = trialPath && trialTier
        ? { characterId: String(run.advancementTrial.characterId || '').slice(0, 64), pathId: trialPath.id, tier: trialTier }
        : null;
    const peakTrialFloor = Math.max(0, Math.min(12, Math.floor(finite(run.peakTrial?.floor))));
    run.peakTrial = peakTrialFloor && run.peakTrial?.runId
        ? { runId: String(run.peakTrial.runId).slice(0, 96), floor: peakTrialFloor }
        : null;
    run.enemy.cardLevel = Math.max(1, Math.min(10, Math.floor(finite(run.enemy.cardLevel, 1))));
    run.encounters = Array.isArray(run.encounters) && run.encounters.length ? run.encounters : [clone(run.enemy)];
    run.encounterIndex = Math.max(0, Math.min(run.encounters.length - 1, Math.floor(finite(run.encounterIndex))));
    run.encounterRound = Math.max(1, Math.min(999, Math.floor(finite(run.encounterRound, run.tacticalDeclarationResult ? 2 : 1))));
    run.pendingDrops = Array.isArray(run.pendingDrops) ? run.pendingDrops.filter((entry) => entry && typeof entry.sourceName === 'string').slice(0, 6) : [];
    run.recoveryZone = (Array.isArray(run.recoveryZone) ? run.recoveryZone : []).flatMap((entry) => (
        PEAK_CARD_BY_ID[entry?.cardId] && Array.isArray(entry.states)
            ? [{ uid: String(entry.uid || `recovery-${entry.cardId}`).slice(0, 128), cardId: entry.cardId, recycledOnce: true, damagePenalty: Math.max(0, Math.min(80, finite(entry.damagePenalty))), states: [...new Set(entry.states.filter((state) => ['standing', 'launched', 'airborne', 'knockedDown', 'stunned'].includes(state)))] }]
            : []
    )).filter((entry) => entry.states.length).slice(-8);
    run.exhaustPile = (Array.isArray(run.exhaustPile) ? run.exhaustPile : []).filter((entry) => PEAK_CARD_BY_ID[entry?.cardId]).slice(-30);
    run.roundCards = {
        player: Array.isArray(run.roundCards?.player) ? run.roundCards.player : [],
        enemy: Array.isArray(run.roundCards?.enemy) ? run.roundCards.enemy : [],
    };
    const safeRoundHistorySide = (side) => ({
        cards: (Array.isArray(side?.cards) ? side.cards : []).filter((entry) => PEAK_CARD_BY_ID[entry?.cardId] || entry?.category).slice(-60),
        stateTransitions: (Array.isArray(side?.stateTransitions) ? side.stateTransitions : []).flatMap((entry) => (
            ['standing', 'launched', 'airborne', 'knockedDown', 'stunned'].includes(entry?.from)
            && ['standing', 'launched', 'airborne', 'knockedDown', 'stunned'].includes(entry?.to)
                ? [{ from: entry.from, to: entry.to, cardId: String(entry.cardId || '').slice(0, 80), target: entry.target === 'player' ? 'player' : 'enemy' }]
                : []
        )).slice(-30),
        hits: Math.max(0, Math.min(9999, Math.floor(finite(side?.hits)))),
        damage: Math.max(0, Math.min(999999999, Math.floor(finite(side?.damage)))),
    });
    run.roundHistory = { player: safeRoundHistorySide(run.roundHistory?.player), enemy: safeRoundHistorySide(run.roundHistory?.enemy) };
    run.tacticalDeclarationId = PEAK_TACTICAL_DECLARATIONS.some((entry) => entry.id === run.tacticalDeclarationId) ? run.tacticalDeclarationId : '';
    run.tacticalDeclarationResult = run.tacticalDeclarationResult?.id === run.tacticalDeclarationId
        ? { id: run.tacticalDeclarationId, completed: Boolean(run.tacticalDeclarationResult.completed), round: Math.max(1, Math.floor(finite(run.tacticalDeclarationResult.round, run.round))) }
        : null;
    run.statistics = {
        playerCardsPlayed: Math.max(0, Math.floor(finite(run.statistics?.playerCardsPlayed))),
        enemyCardsPlayed: Math.max(0, Math.floor(finite(run.statistics?.enemyCardsPlayed))),
        playerHits: Math.max(0, Math.floor(finite(run.statistics?.playerHits))),
        playerDamage: Math.max(0, Math.floor(finite(run.statistics?.playerDamage))),
        completedDeclarations: Math.max(0, Math.floor(finite(run.statistics?.completedDeclarations))),
        completedStateRoutes: Math.max(0, Math.floor(finite(run.statistics?.completedStateRoutes))),
    };
    run.player.cardLevels = Object.fromEntries(Object.entries(collection).map(([id, entry]) => [id, Math.max(1, Math.min(10, Math.floor(finite(run.player.cardLevels?.[id], entry.level || 1))))]));
    run.enemyIntent = { cards: 0, attacks: 0, defense: false, mpCost: 0, names: [], ...(run.enemyIntent || {}), draw: run.enemy.drawPerTurn };
    run.bomb = ['player', 'enemy'].includes(run.bomb?.holder)
        ? {
            holder: run.bomb.holder,
            chance: Math.max(0, Math.min(100, finite(run.bomb.chance, 25))),
            ratio: Math.max(0, Math.min(100, finite(run.bomb.ratio, 25))),
            bossFactor: Math.max(0, Math.min(1, finite(run.bomb.bossFactor, .5))),
        }
        : null;
    const safeSpellCharge = (source) => {
        const rawMax = finite(source?.max);
        const max = rawMax > 0 ? Math.max(1, Math.min(20, Math.floor(rawMax))) : 5;
        return { value: Math.max(0, Math.min(max, Math.floor(finite(source?.value)))), max };
    };
    run.player.spellCharge = safeSpellCharge(run.player.spellCharge);
    run.enemy.spellCharge = safeSpellCharge(run.enemy.spellCharge);
    const safeTimedFuses = (entries) => (Array.isArray(entries) ? entries : []).flatMap((entry) => (
        finite(entry?.damage) > 0 && finite(entry?.turns) > 0 ? [{ name: String(entry.name || '延迟引爆').slice(0, 40), turns: Math.max(1, Math.min(9, Math.floor(finite(entry.turns, 1)))), damage: Math.max(1, Math.min(999999, Math.floor(finite(entry.damage)))), element: String(entry.element || '').slice(0, 16) }] : []
    )).slice(-6);
    run.player.timedFuses = safeTimedFuses(run.player.timedFuses);
    run.enemy.timedFuses = safeTimedFuses(run.enemy.timedFuses);
    const safeVow = (source) => {
        const rawMax = finite(source?.max);
        const max = rawMax > 0 ? Math.max(1, Math.min(20, Math.floor(rawMax))) : 5;
        return { stacks: Math.max(0, Math.min(max, Math.floor(finite(source?.stacks)))), max };
    };
    run.player.vow = safeVow(run.player.vow);
    run.enemy.vow = safeVow(run.enemy.vow);
    const BLESSING_TYPES = ['heal', 'shield', 'cleanse'];
    const safeBlessings = (entries) => (Array.isArray(entries) ? entries : []).flatMap((entry) => {
        const type = BLESSING_TYPES.includes(entry?.type) ? entry.type : null;
        if (!type || finite(entry?.turns) <= 0) return [];
        const rawValue = Math.floor(finite(entry?.value, 1));
        const value = type === 'cleanse' ? Math.max(1, Math.min(9, rawValue)) : Math.max(1, Math.min(999999, rawValue));
        return [{
            type,
            turns: Math.max(1, Math.min(9, Math.floor(finite(entry.turns, 1)))),
            value,
            name: String(entry.name || '祝福').slice(0, 40),
        }];
    }).slice(-6);
    run.player.blessedSchedules = safeBlessings(run.player.blessedSchedules);
    run.enemy.blessedSchedules = safeBlessings(run.enemy.blessedSchedules);
    return run;
};

export const validatePeakDeck = (cards, classId, collection, advancement = null) => {
    const list = Array.isArray(cards) ? cards.filter((id) => typeof id === 'string') : [];
    const errors = [];
    if (list.length < PEAK_DECK_LIMITS.min) errors.push(`至少需要 ${PEAK_DECK_LIMITS.min} 张卡牌`);
    if (list.length > PEAK_DECK_LIMITS.max) errors.push(`最多只能放入 ${PEAK_DECK_LIMITS.max} 张卡牌`);
    const counts = {};
    const specialRarityCounts = {};
    list.forEach((id) => {
        const definition = PEAK_CARD_BY_ID[id];
        counts[id] = (counts[id] || 0) + 1;
        if (!definition) errors.push(`包含未知卡牌：${id}`);
        else {
            if (definition.generatedOnly) errors.push(`${definition.name}是战斗衍生牌，不能加入卡组`);
            if (definition.classId !== 'all' && definition.classId !== classId) errors.push(`${definition.name} 不属于当前职业`);
            if (!isPeakCardAvailableForAdvancement(definition, advancement)) errors.push(`${definition.name}需要对应转职路线`);
            if (definition.category === 'special') specialRarityCounts[definition.rarity] = (specialRarityCounts[definition.rarity] || 0) + 1;
        }
        if (!collection?.[id]?.unlocked) errors.push(`${definition?.name || id} 尚未解锁`);
    });
    Object.entries(counts).forEach(([id, count]) => {
        const owned = Math.max(0, Math.floor(finite(collection?.[id]?.copies)));
        if (count > owned) errors.push(`${PEAK_CARD_BY_ID[id]?.name || id} 只有 ${owned} 张`);
        const limit = PEAK_CARD_RARITIES[PEAK_CARD_BY_ID[id]?.rarity]?.deckLimit;
        if (Number.isFinite(limit) && count > limit) errors.push(`${PEAK_CARD_BY_ID[id]?.name || id} 最多放入 ${limit} 张`);
    });
    Object.entries(specialRarityCounts).forEach(([rarity, count]) => {
        if (count > 1) errors.push(`${PEAK_CARD_RARITIES[rarity]?.name || rarity}特殊牌最多携带1张`);
    });
    return { valid: errors.length === 0, errors: [...new Set(errors)], count: list.length };
};

const recoverPeakStamina = (stamina, now) => {
    if (!stamina) return;
    const safeNow = finite(now, Date.now());
    stamina.max = 40;
    stamina.current = Math.max(0, Math.min(stamina.max, Math.floor(finite(stamina.current, stamina.max))));
    stamina.updatedAt = Math.min(safeNow, Math.max(0, finite(stamina.updatedAt, safeNow)));
    if (stamina.current >= stamina.max) {
        stamina.updatedAt = safeNow;
        return;
    }
    const recovered = Math.floor((safeNow - stamina.updatedAt) / PEAK_STAMINA_INTERVAL);
    if (recovered > 0) {
        stamina.current = Math.min(stamina.max, stamina.current + recovered);
        stamina.updatedAt = stamina.current >= stamina.max ? safeNow : stamina.updatedAt + recovered * PEAK_STAMINA_INTERVAL;
    }
};

export const refreshPeakStamina = (save, now = Date.now()) => {
    const character = save.characters?.[save.activeCharacterId];
    const next = { ...save, characters: { ...save.characters } };
    if (character) {
        const stamina = { ...character.stamina };
        recoverPeakStamina(stamina, now);
        next.characters[save.activeCharacterId] = { ...character, stamina };
    }
    return exposeActiveCharacterContext(next);
};

export const getPeakStaminaCountdown = (save, now = Date.now()) => {
    const stamina = save.characters?.[save.activeCharacterId]?.stamina;
    if (!stamina || stamina.current >= stamina.max) return 0;
    return Math.max(0, PEAK_STAMINA_INTERVAL - (now - stamina.updatedAt));
};

export const spendPeakStamina = (save, amount, now = Date.now()) => {
    const next = refreshPeakStamina(save, now);
    const cost = Math.max(0, Math.floor(finite(amount)));
    const stamina = next.characters?.[next.activeCharacterId]?.stamina;
    if (!stamina) return { ok: false, state: next, reason: '请先选择角色' };
    if (stamina.current < cost) return { ok: false, state: next, reason: '体力不足' };
    if (stamina.current >= stamina.max) stamina.updatedAt = now;
    stamina.current -= cost;
    next.updatedAt = now;
    return { ok: true, state: next };
};

const grantAdvancementCards = (state, character, cardIds) => cardIds.flatMap((id) => {
    const card = PEAK_CARD_BY_ID[id];
    if (!card || card.classId !== character.baseClassId) return [];
    const bucket = classCollectionFor(state, character.baseClassId);
    const entry = bucket[id] || { unlocked: false, level: 1, upgradeCopies: 0, copies: 0 };
    const isNew = !entry.unlocked;
    entry.unlocked = true;
    entry.copies = Math.max(1, entry.copies);
    bucket[id] = entry;
    return [{ cardId: id, isNew }];
});

const normalizeMissionGroup = (source, groupId) => {
    const missionIds = new Set(PEAK_MISSIONS.filter((mission) => mission.group === groupId).map((mission) => mission.id));
    return {
        periodKey: groupId === 'growth' ? 'lifetime' : String(source?.periodKey || '').slice(0, 16),
        activeIds: [...new Set((Array.isArray(source?.activeIds) ? source.activeIds : []).filter((id) => missionIds.has(id)))],
        progress: Object.fromEntries(Object.entries(source?.progress || {}).flatMap(([id, value]) => (
            missionIds.has(id) ? [[id, Math.max(0, Math.min(999999, Math.floor(finite(value))))]] : []
        ))),
        claimed: [...new Set((Array.isArray(source?.claimed) ? source.claimed : []).filter((id) => missionIds.has(id)))],
    };
};

const normalizeLiveOps = (source) => ({
    claims: Object.fromEntries(Object.entries(source?.claims || {}).slice(-1000).flatMap(([key, value]) => (
        typeof key === 'string' && key.length <= 120 ? [[key, Math.max(0, Math.floor(finite(value)))]] : []
    ))),
    transactions: (Array.isArray(source?.transactions) ? source.transactions : []).filter((entry) => entry && typeof entry === 'object').slice(0, 100).map((entry) => ({
        id: String(entry.id || '').slice(0, 120),
        type: String(entry.type || 'reward').slice(0, 24),
        source: String(entry.source || '').slice(0, 48),
        gold: Math.trunc(finite(entry.gold)),
        vouchers: Math.trunc(finite(entry.vouchers)),
        stamina: Math.trunc(finite(entry.stamina)),
        at: Math.max(0, Math.floor(finite(entry.at))),
    })),
    missions: {
        daily: normalizeMissionGroup(source?.missions?.daily, 'daily'),
        weekly: normalizeMissionGroup(source?.missions?.weekly, 'weekly'),
        growth: normalizeMissionGroup(source?.missions?.growth, 'growth'),
    },
});

export const normalizePeakSave = (source, now = Date.now()) => {
    if (!source || typeof source !== 'object' || Number(source.version) < 1 || Number(source.version) > PEAK_SAVE_VERSION) return exposeActiveCharacterContext(createPeakSave(now));
    const base = createPeakSave(now);
    const allLegacyCards = safeCardCollection(source.collection, () => true);
    const collection = safeCardCollection(source.collection, (card) => card.classId === 'all');
    Object.entries(base.collection).forEach(([id, entry]) => {
        if (!collection[id]) collection[id] = entry;
        else { collection[id].unlocked = true; collection[id].copies = Math.max(collection[id].copies, entry.copies); }
    });
    const classCollections = emptyClassCollections();
    Object.keys(PEAK_CHARACTERS).forEach((classId) => {
        classCollections[classId] = safeCardCollection(source.classCollections?.[classId], (card) => card.classId === classId);
    });
    const dungeonIds = new Set(PEAK_DUNGEONS.map((entry) => entry.id));
    const migrateDungeonId = (id) => dungeonIds.has(id) ? id : dungeonIds.has(`${id}_normal`) ? `${id}_normal` : '';
    const normalizeProgress = (progress) => {
        const sourceCleared = progress?.cleared && typeof progress.cleared === 'object' ? progress.cleared : {};
        const migratedUnlocks = (Array.isArray(progress?.unlockedDungeons) ? progress.unlockedDungeons : []).map(migrateDungeonId).filter(Boolean);
        Object.keys(sourceCleared).map(migrateDungeonId).filter(Boolean).forEach((normalId) => {
            if (!normalId.endsWith('_normal')) return;
            const eliteId = normalId.replace(/_normal$/, '_elite');
            if (dungeonIds.has(eliteId)) migratedUnlocks.push(eliteId);
        });
        const unlockedDungeons = [...new Set([PEAK_DUNGEONS[0].id, ...migratedUnlocks].filter((id) => dungeonIds.has(id)))].slice(0, PEAK_DUNGEONS.length);
        const migratedSelected = migrateDungeonId(progress?.selectedDungeon);
        return {
            cleared: Object.fromEntries(Object.entries(sourceCleared).map(([id, count]) => [migrateDungeonId(id), Math.max(0, Math.floor(finite(count)))]).filter(([id]) => dungeonIds.has(id))),
            unlockedDungeons,
            selectedDungeon: unlockedDungeons.includes(migratedSelected) ? migratedSelected : unlockedDungeons[0],
            claimedRuns: Array.isArray(progress?.claimedRuns) ? progress.claimedRuns.filter((id) => typeof id === 'string').slice(-100) : [],
        };
    };
    const normalized = {
        ...base,
        storageRevision: Math.max(0, Math.floor(finite(source.storageRevision))),
        [SAVE_BASELINE]: source[SAVE_BASELINE] || { raw: null, error: null },
        wallet: {
            gold: Math.max(0, Math.floor(finite(source.wallet?.gold, 500))),
            vouchers: Math.max(0, Math.floor(finite(source.wallet?.vouchers))),
        },
        universalShards: normalizeUniversalShards(source.universalShards ?? source.shop?.universalShards),
        classShards: normalizeClassShards(source.classShards),
        collection,
        classCollections,
        characters: {},
        characterOrder: [],
        deletedCharacters: [],
        shop: { epicPity: Math.max(0, Math.floor(finite(source.shop?.epicPity))), history: Array.isArray(source.shop?.history) ? source.shop.history.slice(0, 30) : [] },
        attendance: {
            lastClaimDate: /^\d{4}-\d{2}-\d{2}$/.test(source.attendance?.lastClaimDate) ? source.attendance.lastClaimDate : '',
            streak: Math.max(0, Math.min(9999, Math.floor(finite(source.attendance?.streak)))),
            totalDays: Math.max(0, Math.min(999999, Math.floor(finite(source.attendance?.totalDays)))),
            claimedStreakMilestones: [...new Set((Array.isArray(source.attendance?.claimedStreakMilestones) ? source.attendance.claimedStreakMilestones : []).map((value) => Math.floor(finite(value))).filter((value) => PEAK_STREAK_MILESTONES.some((entry) => entry.days === value)))],
            claimedTotalMilestones: [...new Set((Array.isArray(source.attendance?.claimedTotalMilestones) ? source.attendance.claimedTotalMilestones : []).map((value) => Math.floor(finite(value))).filter((value) => PEAK_TOTAL_MILESTONES.some((entry) => entry.days === value)))],
        },
        vip: {
            growth: Math.max(0, Math.min(999999, Math.floor(finite(source.vip?.growth)))),
            lastDailyClaimDate: /^\d{4}-\d{2}-\d{2}$/.test(source.vip?.lastDailyClaimDate) ? source.vip.lastDailyClaimDate : '',
        },
        liveOps: normalizeLiveOps(source.liveOps),
        accountRecords: {
            codexCardIds: [...new Set((Array.isArray(source.accountRecords?.codexCardIds) ? source.accountRecords.codexCardIds : []).filter((id) => PEAK_CARD_BY_ID[id]))].slice(0, PEAK_CARDS.length),
            tutorialViewedIds: [...new Set((Array.isArray(source.accountRecords?.tutorialViewedIds) ? source.accountRecords.tutorialViewedIds : []).filter((id) => PEAK_TUTORIAL_CHAPTERS.some((chapter) => chapter.id === id)))],
            achievementIds: [...new Set((Array.isArray(source.accountRecords?.achievementIds) ? source.accountRecords.achievementIds : []).filter((id) => PEAK_ACCOUNT_ACHIEVEMENTS.some((achievement) => achievement.id === id)))],
        },
        peakTrialProgress: {
            weekKey: /^(\d{4}-W\d{2}|\d{4}-\d{2}-\d{2})$/.test(source.peakTrialProgress?.weekKey) ? source.peakTrialProgress.weekKey : '',
            weeklyBestFloor: Math.max(0, Math.min(12, Math.floor(finite(source.peakTrialProgress?.weeklyBestFloor)))),
            weeklyRunsStarted: Math.max(0, Math.min(PEAK_TRIAL_WEEKLY_LIMIT, Math.floor(finite(source.peakTrialProgress?.weeklyRunsStarted)))),
            weeklyClaimedMilestones: [...new Set((Array.isArray(source.peakTrialProgress?.weeklyClaimedMilestones) ? source.peakTrialProgress.weeklyClaimedMilestones : []).map((value) => Math.floor(finite(value))).filter((value) => [6, 12].includes(value)))],
            lifetimeBestFloor: Math.max(0, Math.min(12, Math.floor(finite(source.peakTrialProgress?.lifetimeBestFloor)))),
            lifetimeClearedFloors: [...new Set((Array.isArray(source.peakTrialProgress?.lifetimeClearedFloors) ? source.peakTrialProgress.lifetimeClearedFloors : []).map((value) => Math.floor(finite(value))).filter((value) => value >= 1 && value <= 12))].sort((a, b) => a - b),
            completedRuns: Math.max(0, Math.floor(finite(source.peakTrialProgress?.completedRuns))),
        },
        settings: {
            sound: source.settings?.sound !== false,
            reducedMotion: source.settings?.reducedMotion === true,
            resolutionSpeed: Math.max(1, Math.min(3, finite(source.settings?.resolutionSpeed, 1))),
            codex: {
                classFilter: ['all', 'shared', ...Object.keys(PEAK_CHARACTERS)].includes(source.settings?.codex?.classFilter) ? source.settings.codex.classFilter : 'all',
                rarityFilter: ['all', ...Object.keys(PEAK_CARD_RARITIES)].includes(source.settings?.codex?.rarityFilter) ? source.settings.codex.rarityFilter : 'all',
                typeFilter: ['all', ...Object.keys(PEAK_CARD_CATEGORIES)].includes(source.settings?.codex?.typeFilter) ? source.settings.codex.typeFilter : 'all',
                ownershipFilter: source.settings?.codex?.ownershipFilter === 'missing' ? 'unowned'
                    : ['all', 'owned', 'unowned', 'upgradeable'].includes(source.settings?.codex?.ownershipFilter) ? source.settings.codex.ownershipFilter : 'all',
                advancementFilter: ['all', 'base', 'available', 'locked'].includes(source.settings?.codex?.advancementFilter) ? source.settings.codex.advancementFilter : 'all',
                sort: source.settings?.codex?.sort === 'cost' ? 'cost-asc'
                    : ['rarity', 'name', 'cost-asc', 'cost-desc', 'level', 'copies'].includes(source.settings?.codex?.sort) ? source.settings.codex.sort : 'rarity',
            },
            deck: {
                rarityFilter: ['all', ...Object.keys(PEAK_CARD_RARITIES)].includes(source.settings?.deck?.rarityFilter) ? source.settings.deck.rarityFilter : 'all',
                typeFilter: ['all', ...Object.keys(PEAK_CARD_CATEGORIES)].includes(source.settings?.deck?.typeFilter) ? source.settings.deck.typeFilter : 'all',
                sort: source.settings?.deck?.sort === 'cost' ? 'cost-asc'
                    : ['rarity', 'name', 'cost-asc', 'cost-desc', 'level', 'copies'].includes(source.settings?.deck?.sort) ? source.settings.deck.sort : 'rarity',
            },
            inventory: {
                slotFilter: ['all', ...PEAK_EQUIPMENT_SLOTS].includes(source.settings?.inventory?.slotFilter) ? source.settings.inventory.slotFilter : 'all',
                rarityFilter: ['all', ...Object.keys(PEAK_EQUIPMENT_RARITIES)].includes(source.settings?.inventory?.rarityFilter) ? source.settings.inventory.rarityFilter : 'all',
                statusFilter: ['all', 'equipped', 'unequipped', 'locked', 'available'].includes(source.settings?.inventory?.statusFilter) ? source.settings.inventory.statusFilter : 'all',
                statFilter: ['all', ...PEAK_EQUIPMENT_STATS].includes(source.settings?.inventory?.statFilter) ? source.settings.inventory.statFilter : 'all',
            },
        },
        createdAt: finite(source.createdAt, now),
        updatedAt: now,
    };
    const addCharacter = (candidate, classId, options = {}) => {
        if (!PEAK_CHARACTERS[classId] || normalized.characterOrder.length >= PEAK_CHARACTER_SLOT_LIMIT) return;
        const character = safeCharacter(candidate, classId, now, options);
        if (!character.id || normalized.characters[character.id]) return;
        character.progress = normalizeProgress(character.progress);
        character.activeRun = safeActiveRun(character.activeRun, { ...normalized.collection, ...normalized.classCollections[classId], ...character.collection });
        if (character.activeRun) character.activeRun.dungeonId = migrateDungeonId(character.activeRun.dungeonId) || character.activeRun.dungeonId;
        recoverPeakStamina(character.stamina, now);
        normalized.characters[character.id] = character;
        normalized.characterOrder.push(character.id);
    };
    if (Number(source.version) >= 7) {
        const order = [...new Set([...(Array.isArray(source.characterOrder) ? source.characterOrder : []), ...Object.keys(source.characters || {})])];
        order.forEach((id) => {
            const candidate = source.characters?.[id];
            const classId = PEAK_CHARACTERS[candidate?.baseClassId] ? candidate.baseClassId : '';
            if (classId) addCharacter(candidate, classId, { id });
        });
    } else {
        const legacyActiveClass = PEAK_CHARACTERS[source.activeClass] ? source.activeClass : 'sword';
        const legacyActiveRun = source.activeRun ? clone(source.activeRun) : null;
        if (legacyActiveClass === 'brawler' && legacyActiveRun) {
            ['hand', 'drawPile', 'discardPile', 'queue', 'exhaustPile', 'recoveryZone'].forEach((zone) => {
                if (!Array.isArray(legacyActiveRun[zone])) return;
                legacyActiveRun[zone].forEach((entry) => {
                    if (entry?.cardId === 'rising_cut') entry.cardId = 'brawler_uppercut';
                });
            });
            if (legacyActiveRun.player?.cardLevels?.rising_cut != null) {
                legacyActiveRun.player.cardLevels.brawler_uppercut = legacyActiveRun.player.cardLevels.rising_cut;
                delete legacyActiveRun.player.cardLevels.rising_cut;
            }
        }
        ['sword', 'brawler'].forEach((classId) => addCharacter(source.characters?.[classId], classId, {
            id: `legacy-${classId}`,
            name: classId === 'sword' ? '剑士-01' : '斗士-01',
            needsNaming: true,
            stamina: source.stamina,
            progress: source.progress,
            deck: source.decks?.[classId],
            collection: Object.fromEntries(Object.entries(allLegacyCards).filter(([id]) => PEAK_CARD_BY_ID[id]?.classId === classId)),
            activeRun: classId === legacyActiveClass ? legacyActiveRun : null,
        }));
        normalized.activeCharacterId = `legacy-${legacyActiveClass}`;
    }
    Object.values(normalized.characters).forEach((character) => {
        migrateStarterDeckV14(character, Number(source.version));
        migrateStarterDeckV15(character, Number(source.version));
        migrateStarterDeckV16(character, Number(source.version));
    });
    Object.values(normalized.characters).forEach((character) => {
        const bucket = normalized.classCollections[character.baseClassId] ||= {};
        mergePeakCardCollections(bucket, character.collection);
        character.collection = {};
    });
    Object.keys(normalized.classCollections).forEach((classId) => {
        const hasCharacter = Object.values(normalized.characters).some((character) => character.baseClassId === classId);
        if (hasCharacter || Object.keys(normalized.classCollections[classId]).length) mergePeakCardCollections(normalized.classCollections[classId], starterClassCollection(classId));
    });
    normalized.accountRecords.codexCardIds = [...new Set([
        ...normalized.accountRecords.codexCardIds,
        ...Object.entries(normalized.collection).filter(([, entry]) => entry.unlocked).map(([id]) => id),
        ...Object.values(normalized.classCollections).flatMap((bucket) => Object.entries(bucket).filter(([, entry]) => entry.unlocked).map(([id]) => id)),
    ].filter(Boolean))].slice(0, PEAK_CARDS.length);
    syncPeakAccountRecords(normalized);
    normalized.activeCharacterId = normalized.characters[source.activeCharacterId]?.id || normalized.characters[normalized.activeCharacterId]?.id || normalized.characterOrder[0] || '';
    normalized.deletedCharacters = (Array.isArray(source.deletedCharacters) ? source.deletedCharacters : []).flatMap((entry) => {
        const candidate = entry?.character;
        const classId = PEAK_CHARACTERS[candidate?.baseClassId] ? candidate.baseClassId : '';
        if (!classId || finite(entry.deletedAt) <= 0 || normalized.characters[candidate.id]) return [];
        const character = safeCharacter(candidate, classId, now, { id: candidate.id });
        character.progress = normalizeProgress(character.progress);
        character.activeRun = null;
        const bucket = normalized.classCollections[classId] ||= {};
        mergePeakCardCollections(bucket, character.collection);
        character.collection = {};
        return [{ character, deletedAt: finite(entry.deletedAt) }];
    }).slice(0, PEAK_CHARACTER_SLOT_LIMIT);
    Object.values(normalized.characters).forEach((character) => {
        const path = PEAK_ADVANCEMENTS[character.advancement?.pathId];
        if (!path || character.advancement.tier < 1) return;
        grantAdvancementCards(normalized, character, path.firstGrantCards || []);
        if (character.advancement.tier >= 2) grantAdvancementCards(normalized, character, path.secondGrantCards || []);
    });
    normalized.wallet.gold += Object.values(normalized.characters).reduce((sum, character) => sum + pruneInvalidPeakBlessings(character), 0);
    syncPeakAccountRecords(normalized);
    return exposeActiveCharacterContext(normalized);
};

export const getPeakSave = (now = Date.now()) => {
    let raw = null;
    try {
        if (typeof globalThis.localStorage?.getItem !== 'function') throw new Error('localStorage unavailable');
        raw = globalThis.localStorage.getItem(KEY);
        const parsed = JSON.parse(raw || 'null');
        if (raw !== null && (!parsed || typeof parsed !== 'object' || !Number.isInteger(Number(parsed.version)) || Number(parsed.version) < 1 || Number(parsed.version) > PEAK_SAVE_VERSION)) {
            throw saveError('PEAK_SAVE_READ', '存档格式损坏或版本不受支持，已暂停操作以保留原始存档');
        }
        if (raw && Number(parsed?.version) < PEAK_SAVE_VERSION) {
            try {
                if (!globalThis.localStorage?.getItem(BACKUP_KEY)) globalThis.localStorage?.setItem(BACKUP_KEY, raw);
            } catch {                                                                         }
        }
        const save = normalizePeakSave(parsed, now);
        save[SAVE_BASELINE] = { raw, error: null };
        return save;
    }
    catch (cause) {
        const save = exposeActiveCharacterContext(createPeakSave(now));
        save[SAVE_BASELINE] = { raw, error: saveError('PEAK_SAVE_READ', '无法安全读取存档，已暂停操作以保留原始存档', cause) };
        return save;
    }
};

export const setPeakSave = (value, now = Date.now(), { throwOnError = false } = {}) => {
    const normalized = normalizePeakSave({ ...value, updatedAt: now }, now);
    try {
        const issue = getPeakSaveIssue(normalized);
        if (issue && issue.code !== 'PEAK_SAVE_WRITE') throw issue;
        if (typeof globalThis.localStorage?.getItem !== 'function' || typeof globalThis.localStorage?.setItem !== 'function') throw new Error('localStorage unavailable');
        const baseline = normalized[SAVE_BASELINE];
        if (globalThis.localStorage.getItem(KEY) !== baseline.raw) {
            throw saveError('PEAK_SAVE_CONFLICT', '存档已被其他页面更新，已暂停操作。请重新读取最新存档后继续');
        }
        const nextRevision = normalized.storageRevision + 1;
        const raw = JSON.stringify({ ...normalized, storageRevision: nextRevision });
        globalThis.localStorage.setItem(KEY, raw);
        normalized.storageRevision = nextRevision;
        normalized[SAVE_BASELINE] = { raw, error: null };
    }
    catch (cause) {
        const error = cause?.code?.startsWith('PEAK_SAVE_') ? cause : saveError('PEAK_SAVE_WRITE', '存档写入失败，请检查浏览器存储权限或剩余空间', cause);
        if (throwOnError) throw error;
        normalized[SAVE_BASELINE] = { ...normalized[SAVE_BASELINE], error };
    }
    return normalized;
};

export const getActivePeakCharacter = (save) => save?.characters?.[save?.activeCharacterId] || null;

export const getPeakCardCollection = (save, characterId = save?.activeCharacterId) => ({
    ...(save?.collection || {}),
    ...(save?.classCollections?.[save?.characters?.[characterId]?.baseClassId] || save?.characters?.[characterId]?.collection || {}),
});

export const getPeakAccountRecordStatus = (save) => {
    const records = syncPeakAccountRecords(save);
    const unlocked = new Set(records.achievementIds);
    return {
        codexCardIds: [...records.codexCardIds],
        tutorialViewedIds: [...records.tutorialViewedIds],
        achievements: PEAK_ACCOUNT_ACHIEVEMENTS.map((achievement) => ({ ...achievement, unlocked: unlocked.has(achievement.id) })),
    };
};

export const markPeakTutorialViewed = (source, tutorialId, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    if (!PEAK_TUTORIAL_CHAPTERS.some((chapter) => chapter.id === tutorialId)) return { ok: false, state, reason: '教学章节不存在' };
    if (!state.accountRecords.tutorialViewedIds.includes(tutorialId)) state.accountRecords.tutorialViewedIds.push(tutorialId);
    state.updatedAt = now;
    return { ok: true, state };
};

export const validatePeakCharacterName = (value, save, excludedId = '') => {
    const name = String(value || '').trim().replace(/\s+/g, ' ');
    const length = Array.from(name).length;
    if (length < 2 || length > 12) return { valid: false, name, reason: '角色名需要2至12个字符' };
    if (/[<>\u0000-\u001f\u007f]/u.test(name)) return { valid: false, name, reason: '角色名包含不可用字符' };
    if (!/^[\p{L}\p{N}· _-]+$/u.test(name)) return { valid: false, name, reason: '角色名只能使用文字、数字、空格、横线或间隔号' };
    const comparable = name.toLocaleLowerCase('zh-CN');
    const occupied = [
        ...Object.values(save?.characters || {}).filter((entry) => entry.id !== excludedId),
        ...(save?.deletedCharacters || []).map((entry) => entry.character).filter((entry) => entry?.id !== excludedId),
    ].some((entry) => String(entry?.name || '').toLocaleLowerCase('zh-CN') === comparable);
    return occupied ? { valid: false, name, reason: '该角色名已经被使用' } : { valid: true, name, reason: '' };
};

export const createPeakCharacter = (source, classId, name, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    if (PEAK_RESERVED_CLASSES[classId]) return { ok: false, state, reason: `${PEAK_RESERVED_CLASSES[classId].name}尚未开放` };
    if (!PEAK_CHARACTERS[classId]) return { ok: false, state, reason: '基础职业不存在' };
    if (state.characterOrder.length + state.deletedCharacters.length >= PEAK_CHARACTER_SLOT_LIMIT) return { ok: false, state, reason: '角色栏位已满' };
    const checked = validatePeakCharacterName(name, state);
    if (!checked.valid) return { ok: false, state, reason: checked.reason };
    const character = freshCharacter(classId, now, { name: checked.name });
    const sharedCollection = classCollectionFor(state, classId);
    mergePeakCardCollections(sharedCollection, character.collection);
    character.collection = {};
    state.characters[character.id] = character;
    state.characterOrder.push(character.id);
    state.activeCharacterId = character.id;
    if (!state.accountRecords.achievementIds.includes('first_adventurer')) state.accountRecords.achievementIds.push('first_adventurer');
    return { ok: true, state, character };
};

export const renamePeakCharacter = (source, id, name, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const character = state.characters[id];
    if (!character) return { ok: false, state, reason: '角色不存在' };
    const checked = validatePeakCharacterName(name, state, id);
    if (!checked.valid) return { ok: false, state, reason: checked.reason };
    character.name = checked.name;
    character.needsNaming = false;
    character.updatedAt = now;
    return { ok: true, state, character };
};

export const selectPeakCharacter = (source, id, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const character = state.characters[id];
    if (!character) return { ok: false, state, reason: '角色不存在' };
    if (character.needsNaming) return { ok: false, state, reason: '请先为角色命名', needsNaming: true };
    state.activeCharacterId = id;
    character.lastPlayedAt = now;
    return { ok: true, state, character };
};

const findPeakDeckPreset = (character, presetId) => character?.deck?.presets?.find((preset) => preset.id === presetId) || null;

export const switchPeakDeckPreset = (source, characterId, presetId, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const character = state.characters[characterId];
    if (!character) return { ok: false, state, reason: '角色不存在' };
    if (character.activeRun) return { ok: false, state, reason: '战斗中不能切换卡组方案' };
    const preset = findPeakDeckPreset(character, presetId);
    if (!preset) return { ok: false, state, reason: '卡组方案不存在' };
    character.deck.activePresetId = preset.id;
    character.deck.name = preset.name;
    character.deck.cards = [...preset.cards];
    character.updatedAt = now;
    return { ok: true, state, character, preset };
};

export const copyPeakDeckPreset = (source, characterId, targetPresetId, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const character = state.characters[characterId];
    if (!character) return { ok: false, state, reason: '角色不存在' };
    if (character.activeRun) return { ok: false, state, reason: '战斗中不能覆盖卡组方案' };
    const sourcePreset = findPeakDeckPreset(character, character.deck.activePresetId);
    const targetPreset = findPeakDeckPreset(character, targetPresetId);
    if (!sourcePreset || !targetPreset) return { ok: false, state, reason: '卡组方案不存在' };
    if (sourcePreset.id === targetPreset.id) return { ok: false, state, reason: '不能覆盖当前卡组方案' };
    targetPreset.cards = [...character.deck.cards];
    character.updatedAt = now;
    return { ok: true, state, character, sourcePreset, targetPreset };
};

export const renamePeakDeckPreset = (source, characterId, presetId, name, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const character = state.characters[characterId];
    if (!character) return { ok: false, state, reason: '角色不存在' };
    if (character.activeRun) return { ok: false, state, reason: '战斗中不能重命名卡组方案' };
    const preset = findPeakDeckPreset(character, presetId);
    if (!preset) return { ok: false, state, reason: '卡组方案不存在' };
    const normalizedName = String(name || '').trim().slice(0, 16);
    if (!normalizedName) return { ok: false, state, reason: '请输入卡组方案名称' };
    const duplicate = character.deck.presets.some((entry) => entry.id !== preset.id && entry.name.toLocaleLowerCase('zh-CN') === normalizedName.toLocaleLowerCase('zh-CN'));
    if (duplicate) return { ok: false, state, reason: '该角色已有同名卡组方案' };
    preset.name = normalizedName;
    if (character.deck.activePresetId === preset.id) character.deck.name = normalizedName;
    character.updatedAt = now;
    return { ok: true, state, character, preset };
};

export const deletePeakCharacter = (source, id, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const character = state.characters[id];
    if (!character) return { ok: false, state, reason: '角色不存在' };
    if (state.characterOrder.length <= 1) return { ok: false, state, reason: '至少需要保留一个角色' };
    if (character.activeRun) return { ok: false, state, reason: '请先结束该角色正在进行的战斗' };
    state.deletedCharacters.push({ character, deletedAt: now });
    delete state.characters[id];
    state.characterOrder = state.characterOrder.filter((entry) => entry !== id);
    if (state.activeCharacterId === id) state.activeCharacterId = state.characterOrder[0] || '';
    return { ok: true, state, character };
};

export const restorePeakCharacter = (source, id, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const index = state.deletedCharacters.findIndex((entry) => entry.character?.id === id);
    if (index < 0) return { ok: false, state, reason: '回收站中没有该角色' };
    const [entry] = state.deletedCharacters.splice(index, 1);
    entry.character.updatedAt = now;
    state.characters[id] = entry.character;
    state.characterOrder.push(id);
    return { ok: true, state, character: entry.character };
};

const PEAK_BEIJING_OFFSET = 8 * 60 * 60 * 1000;
export const getPeakDateKey = (trustedNow) => {
    const value = finite(trustedNow);
    if (value <= 0) return '';
    return new Date(value + PEAK_BEIJING_OFFSET).toISOString().slice(0, 10);
};

export const getPeakWeekKey = (trustedNow) => {
    const value = finite(trustedNow);
    if (value <= 0) return '';
    const date = new Date(value + PEAK_BEIJING_OFFSET);
    const daysSinceMonday = (date.getUTCDay() + 6) % 7;
    date.setUTCDate(date.getUTCDate() - daysSinceMonday);
    return date.toISOString().slice(0, 10);
};

const ensurePeakTrialWeek = (progress, weekKey) => {
    if (progress.weekKey === weekKey) return;
    progress.weekKey = weekKey;
    progress.weeklyBestFloor = 0;
    progress.weeklyRunsStarted = 0;
    progress.weeklyClaimedMilestones = [];
};

export const startPeakTrial = (source, trustedNow) => {
    const state = normalizePeakSave(source, finite(trustedNow));
    const character = getActivePeakCharacter(state);
    const weekKey = getPeakWeekKey(trustedNow);
    if (!weekKey) return { ok: false, state, reason: '无法取得可信时间，请稍后重试' };
    if (!character) return { ok: false, state, reason: '请先选择角色' };
    if (state.activeRun) return { ok: false, state, reason: '请先结束当前战斗' };
    if (character.level < 15) return { ok: false, state, reason: '角色达到15级后开放巅峰试炼' };
    if (character.peakTrial && !['failed', 'completed'].includes(character.peakTrial.phase)) return { ok: false, state, reason: '请先完成当前巅峰试炼' };
    const deckCheck = validatePeakDeck(character.deck.cards, character.baseClassId, getPeakCardCollection(state, character.id), character.advancement);
    if (!deckCheck.valid) return { ok: false, state, reason: deckCheck.errors[0] };
    ensurePeakTrialWeek(state.peakTrialProgress, weekKey);
    if (state.peakTrialProgress.weeklyRunsStarted >= PEAK_TRIAL_WEEKLY_LIMIT) return { ok: false, state, reason: `本周最多开启${PEAK_TRIAL_WEEKLY_LIMIT}轮巅峰试炼` };
    state.peakTrialProgress.weeklyRunsStarted += 1;
    const id = globalThis.crypto?.randomUUID?.() || `peak-trial-${Math.floor(trustedNow).toString(36)}`;
    character.peakTrial = {
        version: 1, id, seed: Math.floor(trustedNow) >>> 0, floor: 1, phase: 'ready', remainingHpRatio: 1,
        boons: [], choices: [], settledBattleIds: [], earnedGold: 0, earnedVouchers: 0,
        createdAt: trustedNow, updatedAt: trustedNow,
    };
    return { ok: true, state, character, run: character.peakTrial, remainingRuns: PEAK_TRIAL_WEEKLY_LIMIT - state.peakTrialProgress.weeklyRunsStarted };
};

export const choosePeakTrialBoon = (source, boonId, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const character = getActivePeakCharacter(state);
    const run = character?.peakTrial;
    const boon = PEAK_TRIAL_BOONS.find((entry) => entry.id === boonId);
    if (!run || run.phase !== 'choosing') return { ok: false, state, reason: '当前不在增益选择阶段' };
    if (!boon || !run.choices.includes(boonId)) return { ok: false, state, reason: '该增益不在本次候选中' };
    if (run.boons.filter((id) => id === boonId).length >= boon.maxStacks) return { ok: false, state, reason: '该增益已达到叠加上限' };
    run.boons.push(boonId);
    if (boon.effect.type === 'healPercent') run.remainingHpRatio = Math.min(1, run.remainingHpRatio + boon.effect.value / 100);
    run.choices = [];
    run.phase = 'ready';
    run.updatedAt = now;
    return { ok: true, state, character, run, boon };
};

export const beginPeakTrialFloor = (source, battle, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const character = getActivePeakCharacter(state);
    const run = character?.peakTrial;
    if (!run || run.phase !== 'ready') return { ok: false, state, reason: '当前试炼不能开始战斗' };
    if (!battle?.peakTrial || battle.peakTrial.runId !== run.id || battle.peakTrial.floor !== run.floor) return { ok: false, state, reason: '试炼战斗标记不匹配' };
    run.phase = 'fighting';
    run.updatedAt = now;
    state.activeRun = battle;
    return { ok: true, state, character, run, battle };
};

export const settlePeakTrialFloor = (source, battle, trustedNow) => {
    const state = normalizePeakSave(source, finite(trustedNow));
    const character = getActivePeakCharacter(state);
    const run = character?.peakTrial;
    const weekKey = getPeakWeekKey(trustedNow);
    const marker = `${battle?.peakTrial?.runId || ''}:${battle?.peakTrial?.floor || 0}:${battle?.seed || 0}`;
    if (!weekKey) return { ok: false, state, reason: '无法取得可信时间，请稍后重试' };
    if (!run || run.phase !== 'fighting') return { ok: false, state, reason: '试炼运行状态不存在' };
    if (battle?.phase !== 'victory') return { ok: false, state, reason: '当前层尚未胜利' };
    if (battle.peakTrial?.runId !== run.id || battle.peakTrial?.floor !== run.floor) return { ok: false, state, reason: '试炼层数或运行ID不匹配' };
    if (run.settledBattleIds.includes(marker)) return { ok: false, state, reason: '本层奖励已经领取' };
    const floor = PEAK_TRIAL_FLOORS.find((entry) => entry.floor === run.floor);
    if (!floor) return { ok: false, state, reason: '试炼层数据不存在' };
    const progress = state.peakTrialProgress;
    ensurePeakTrialWeek(progress, weekKey);
    const firstClearGold = progress.lifetimeClearedFloors.includes(floor.floor) ? 0 : floor.floor * 20;
    let vouchers = 0;
    if (floor.floor === 6 && !progress.weeklyClaimedMilestones.includes(6)) vouchers = 1;
    if (floor.floor === 12 && !progress.weeklyClaimedMilestones.includes(12)) vouchers = 2;
    if (vouchers) progress.weeklyClaimedMilestones.push(floor.floor);
    if (!progress.lifetimeClearedFloors.includes(floor.floor)) progress.lifetimeClearedFloors.push(floor.floor);
    progress.weeklyBestFloor = Math.max(progress.weeklyBestFloor, floor.floor);
    progress.lifetimeBestFloor = Math.max(progress.lifetimeBestFloor, floor.floor);
    const gold = floor.gold + firstClearGold;
    state.wallet.gold += gold;
    state.wallet.vouchers += vouchers;
    run.earnedGold += gold;
    run.earnedVouchers += vouchers;
    run.remainingHpRatio = Math.max(.05, Math.min(1, finite(battle.player?.hp) / Math.max(1, finite(battle.player?.maxHp, 1))));
    run.settledBattleIds.push(marker);
    state.activeRun = null;
    if (floor.floor === PEAK_TRIAL_FLOORS.length) {
        run.phase = 'completed';
        run.choices = [];
        progress.completedRuns += 1;
    } else {
        run.floor += 1;
        run.phase = 'choosing';
        run.choices = getPeakTrialBoonChoices(run.seed, run.floor, run.boons);
    }
    run.updatedAt = trustedNow;
    return { ok: true, state, character, run, completed: run.phase === 'completed', reward: { gold: floor.gold, firstClearGold, vouchers } };
};

export const failPeakTrialFloor = (source, battle, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const character = getActivePeakCharacter(state);
    const run = character?.peakTrial;
    if (!run || battle?.peakTrial?.runId !== run.id) return { ok: false, state, reason: '试炼运行状态不匹配' };
    run.phase = 'failed';
    run.choices = [];
    run.updatedAt = now;
    state.activeRun = null;
    return { ok: true, state, character, run };
};

const previousPeakDateKey = (dateKey) => {
    const timestamp = Date.parse(`${dateKey}T00:00:00.000Z`);
    return Number.isFinite(timestamp) ? new Date(timestamp - 24 * 60 * 60 * 1000).toISOString().slice(0, 10) : '';
};

const mergePeakRewards = (rewards) => rewards.reduce((total, reward) => ({
    gold: total.gold + Math.max(0, Math.floor(finite(reward?.gold))),
    vouchers: total.vouchers + Math.max(0, Math.floor(finite(reward?.vouchers))),
    stamina: total.stamina + Math.max(0, Math.floor(finite(reward?.stamina))),
}), { gold: 0, vouchers: 0, stamina: 0 });

const recordPeakTransaction = (state, type, source, delta = {}, now = Date.now()) => {
    state.liveOps = state.liveOps || emptyLiveOps();
    state.liveOps.transactions.unshift({
        id: `${Math.floor(finite(now, Date.now()))}-${type}-${source}`,
        type,
        source,
        gold: Math.trunc(finite(delta.gold)),
        vouchers: Math.trunc(finite(delta.vouchers)),
        stamina: Math.trunc(finite(delta.stamina)),
        at: Math.max(0, Math.floor(finite(now, Date.now()))),
    });
    state.liveOps.transactions = state.liveOps.transactions.slice(0, 100);
};

const grantPeakReward = (state, reward, options = {}) => {
    state.liveOps = state.liveOps || emptyLiveOps();
    const claimKey = String(options.claimKey || '');
    if (claimKey && state.liveOps.claims[claimKey]) return false;
    const granted = {
        gold: Math.max(0, Math.floor(finite(reward.gold))),
        vouchers: Math.max(0, Math.floor(finite(reward.vouchers))),
        stamina: Math.max(0, Math.floor(finite(reward.stamina))),
    };
    state.wallet.gold += granted.gold;
    state.wallet.vouchers += granted.vouchers;
    const stamina = getActivePeakCharacter(state)?.stamina;
    if (stamina) stamina.current = Math.min(stamina.max, stamina.current + granted.stamina);
    const now = finite(options.now, Date.now());
    if (claimKey) state.liveOps.claims[claimKey] = now;
    recordPeakTransaction(state, 'reward', options.source || 'system', granted, now);
    return true;
};

const missionPeriodKey = (groupId, now) => groupId === 'daily' ? getPeakDateKey(now) : groupId === 'weekly' ? getPeakWeekKey(now) : 'lifetime';

const peakMissionRotationHash = (value) => {
    let hash = 2166136261;
    for (const character of String(value)) {
        hash ^= character.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
};

const canOfferPeakDailyMission = (state, mission) => {
    if (mission.availability === 'hardUnlocked') return Object.values(state.characters || {}).some((character) => (
        (character.progress?.unlockedDungeons || []).some((id) => PEAK_DUNGEONS.find((dungeon) => dungeon.id === id)?.difficultyId === 'hard')
    ));
    if (mission.availability === 'packAffordable') return state.wallet.gold >= Math.min(...PEAK_PACKS.map((pack) => pack.price))
        || state.wallet.vouchers >= Math.min(...Object.values(PEAK_PACK_VOUCHER_COSTS));
    if (mission.availability === 'cardUpgradeable') {
        const character = getActivePeakCharacter(state);
        const collection = getPeakCardCollection(state);
        return PEAK_CARDS.some((card) => {
            const entry = collection[card.id];
            if (!entry?.unlocked || entry.level >= card.maxLevel || !isPeakCardAvailableForAdvancement(card, character?.advancement)) return false;
            const copies = PEAK_CARD_UPGRADE_COPY_COSTS[entry.level - 1];
            const gold = Math.round(PEAK_CARD_UPGRADE_RULES[card.rarity].gold * Math.pow(entry.level, 1.35));
            const classShards = card.classId === 'all' ? 0 : getPeakClassShardBalance(state, card.classId, card.rarity);
            return entry.upgradeCopies + classShards + getPeakUniversalShardBalance(state, card.rarity) >= copies && state.wallet.gold >= gold;
        });
    }
    return true;
};

const getPeakDailyMissionIds = (state, periodKey) => {
    const seed = `${periodKey}:${Math.floor(finite(state.createdAt))}`;
    const ordered = PEAK_MISSIONS
        .filter((mission) => mission.group === 'daily' && canOfferPeakDailyMission(state, mission))
        .map((mission) => ({ mission, order: peakMissionRotationHash(`${seed}:${mission.id}`) }))
        .sort((left, right) => left.order - right.order || left.mission.id.localeCompare(right.mission.id))
        .map(({ mission }) => mission);
    const selected = [];
    const usedEvents = new Set();
    let hasSpendingMission = false;
    ordered.forEach((mission) => {
        if (selected.length >= PEAK_DAILY_MISSION_COUNT || usedEvents.has(mission.event) || (mission.spending && hasSpendingMission)) return;
        selected.push(mission);
        usedEvents.add(mission.event);
        if (mission.spending) hasSpendingMission = true;
    });
    ordered.forEach((mission) => {
        if (selected.length >= PEAK_DAILY_MISSION_COUNT || selected.includes(mission) || (mission.spending && hasSpendingMission)) return;
        selected.push(mission);
        if (mission.spending) hasSpendingMission = true;
    });
    return selected.slice(0, PEAK_DAILY_MISSION_COUNT).map((mission) => mission.id);
};

const ensureMissionPeriods = (state, now) => {
    state.liveOps = state.liveOps || emptyLiveOps();
    Object.keys(PEAK_MISSION_GROUPS).forEach((groupId) => {
        const periodKey = missionPeriodKey(groupId, now);
        const current = state.liveOps.missions[groupId] || emptyMissionGroup(groupId === 'growth' ? 'lifetime' : periodKey);
        if (groupId !== 'growth' && periodKey && current.periodKey !== periodKey) {
            const activeIds = groupId === 'daily' ? getPeakDailyMissionIds(state, periodKey) : [];
            state.liveOps.missions[groupId] = emptyMissionGroup(periodKey, activeIds);
        }
        else {
            current.periodKey = groupId === 'growth' ? 'lifetime' : current.periodKey || periodKey;
            if (groupId === 'daily' && current.periodKey && !current.activeIds.length) current.activeIds = getPeakDailyMissionIds(state, current.periodKey);
            state.liveOps.missions[groupId] = current;
        }
    });
};

const recordMissionEventInState = (state, event, amount = 1, now = Date.now()) => {
    ensureMissionPeriods(state, now);
    PEAK_MISSIONS.filter((mission) => {
        if (mission.event !== event) return false;
        return mission.group !== 'daily' || state.liveOps.missions.daily.activeIds.includes(mission.id);
    }).forEach((mission) => {
        const bucket = state.liveOps.missions[mission.group];
        const previous = Math.max(0, Math.floor(finite(bucket.progress[mission.id])));
        const value = Math.max(0, Math.floor(finite(amount)));
        bucket.progress[mission.id] = mission.aggregation === 'max' ? Math.max(previous, value) : Math.min(999999, previous + value);
    });
};

const syncGrowthMissionProgress = (state, now = Date.now()) => {
    const characters = Object.values(state.characters || {});
    const cardEntries = [state.collection, ...Object.values(state.classCollections || {})];
    recordMissionEventInState(state, 'maxCharacterLevel', Math.max(0, ...characters.map((character) => character.level || 0)), now);
    recordMissionEventInState(state, 'maxAdvancementTier', Math.max(0, ...characters.map((character) => character.advancement?.tier || 0)), now);
    recordMissionEventInState(state, 'maxCardLevel', Math.max(0, ...cardEntries.flatMap((collection) => Object.values(collection || {}).map((entry) => entry.level || 0))), now);
    const hardClears = characters.reduce((total, character) => total + Object.entries(character.progress?.cleared || {}).reduce((sum, [id, count]) => (
        sum + (PEAK_DUNGEONS.find((dungeon) => dungeon.id === id)?.difficultyId === 'hard' ? Math.max(0, Math.floor(finite(count))) : 0)
    ), 0), 0);
    const bucket = state.liveOps.missions.growth;
    bucket.progress.growth_hard_clear = Math.max(Math.floor(finite(bucket.progress.growth_hard_clear)), hardClears);
};

export const recordPeakMissionEvent = (source, event, amount = 1, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    recordMissionEventInState(state, event, amount, now);
    syncGrowthMissionProgress(state, now);
    state.updatedAt = now;
    return state;
};

export const getPeakMissionStatus = (source, trustedNow = Date.now()) => {
    const state = normalizePeakSave(source, finite(trustedNow, Date.now()));
    ensureMissionPeriods(state, trustedNow);
    syncGrowthMissionProgress(state, trustedNow);
    const groups = Object.values(PEAK_MISSION_GROUPS).map((group) => {
        const bucket = state.liveOps.missions[group.id];
        const missions = PEAK_MISSIONS.filter((mission) => mission.group === group.id && (group.id !== 'daily' || bucket.activeIds.includes(mission.id))).map((mission) => {
            const progress = Math.min(mission.target, Math.max(0, Math.floor(finite(bucket.progress[mission.id]))));
            const claimed = bucket.claimed.includes(mission.id);
            return { ...mission, progress, complete: progress >= mission.target, claimed };
        });
        return { ...group, periodKey: bucket.periodKey, missions, ready: missions.filter((mission) => mission.complete && !mission.claimed).length };
    });
    return { state, groups, ready: groups.reduce((sum, group) => sum + group.ready, 0) };
};

export const claimPeakMission = (source, missionId, trustedNow) => {
    const now = finite(trustedNow);
    const state = normalizePeakSave(source, now || Date.now());
    if (!getPeakDateKey(now)) return { ok: false, state, reason: '尚未取得可信时间' };
    ensureMissionPeriods(state, now);
    syncGrowthMissionProgress(state, now);
    const mission = PEAK_MISSIONS.find((entry) => entry.id === missionId);
    if (!mission) return { ok: false, state, reason: '任务不存在' };
    const bucket = state.liveOps.missions[mission.group];
    if (mission.group === 'daily' && !bucket.activeIds.includes(mission.id)) return { ok: false, state, reason: '该任务不在今日轮换中' };
    if (bucket.claimed.includes(mission.id)) return { ok: false, state, reason: '任务奖励已经领取' };
    if (Math.floor(finite(bucket.progress[mission.id])) < mission.target) return { ok: false, state, reason: '任务尚未完成' };
    const claimKey = `mission:${mission.group}:${bucket.periodKey}:${mission.id}`;
    if (!grantPeakReward(state, mission.reward, { claimKey, source: mission.id, now })) return { ok: false, state, reason: '任务奖励已经领取' };
    bucket.claimed.push(mission.id);
    state.updatedAt = now;
    return { ok: true, state, mission, reward: mission.reward };
};

export const getPeakVipLevel = (source) => {
    const growth = Math.max(0, Math.floor(finite(typeof source === 'number' ? source : source?.vip?.growth)));
    let level = 0;
    PEAK_VIP_THRESHOLDS.forEach((threshold, index) => { if (index > 0 && growth >= threshold) level = index; });
    return Math.min(10, level);
};

export const getPeakVipDailyReward = (level) => {
    const safeLevel = Math.max(0, Math.min(10, Math.floor(finite(level))));
    return safeLevel ? { gold: 50 + safeLevel * 25, stamina: Math.floor(safeLevel / 3) * 2 } : { gold: 0, stamina: 0 };
};

export const getPeakVipStatus = (source, trustedNow = 0) => {
    const growth = Math.max(0, Math.floor(finite(source?.vip?.growth)));
    const level = getPeakVipLevel(growth);
    const currentThreshold = PEAK_VIP_THRESHOLDS[level] || 0;
    const nextThreshold = PEAK_VIP_THRESHOLDS[level + 1] ?? currentThreshold;
    const span = Math.max(1, nextThreshold - currentThreshold);
    const progress = level >= 10 ? 100 : Math.max(0, Math.min(100, (growth - currentThreshold) / span * 100));
    const dateKey = getPeakDateKey(trustedNow);
    return {
        level,
        growth,
        currentThreshold,
        nextThreshold,
        progress,
        reward: getPeakVipDailyReward(level),
        dateKey,
        claimedToday: Boolean(dateKey && source?.vip?.lastDailyClaimDate === dateKey),
    };
};

export const claimPeakAttendance = (source, trustedNow) => {
    const dateKey = getPeakDateKey(trustedNow);
    const state = normalizePeakSave(source, finite(trustedNow, Date.now()));
    if (!dateKey) return { ok: false, state, reason: '尚未取得可信时间' };
    if (state.attendance.lastClaimDate === dateKey) return { ok: false, state, reason: '今天已经签到' };
    if (state.attendance.lastClaimDate && state.attendance.lastClaimDate > dateKey) return { ok: false, state, reason: '可信日期早于上次签到记录' };
    const streak = state.attendance.lastClaimDate === previousPeakDateKey(dateKey) ? state.attendance.streak + 1 : 1;
    const totalDays = state.attendance.totalDays + 1;
    const dailyReward = PEAK_ATTENDANCE_REWARDS[(totalDays - 1) % PEAK_ATTENDANCE_REWARDS.length];
    const streakMilestones = PEAK_STREAK_MILESTONES.filter((entry) => entry.days <= streak && !state.attendance.claimedStreakMilestones.includes(entry.days));
    const totalMilestones = PEAK_TOTAL_MILESTONES.filter((entry) => entry.days <= totalDays && !state.attendance.claimedTotalMilestones.includes(entry.days));
    const reward = mergePeakRewards([dailyReward, ...streakMilestones.map((entry) => entry.reward), ...totalMilestones.map((entry) => entry.reward)]);
    state.attendance.lastClaimDate = dateKey;
    state.attendance.streak = streak;
    state.attendance.totalDays = totalDays;
    state.attendance.claimedStreakMilestones.push(...streakMilestones.map((entry) => entry.days));
    state.attendance.claimedTotalMilestones.push(...totalMilestones.map((entry) => entry.days));
    grantPeakReward(state, reward, { claimKey: `attendance:${dateKey}`, source: 'attendance', now: trustedNow });
    state.updatedAt = trustedNow;
    return { ok: true, state, dateKey, reward, dailyReward, streakMilestones, totalMilestones };
};

export const claimPeakVipDaily = (source, trustedNow) => {
    const dateKey = getPeakDateKey(trustedNow);
    const state = normalizePeakSave(source, finite(trustedNow, Date.now()));
    const level = getPeakVipLevel(state);
    if (!dateKey) return { ok: false, state, reason: '尚未取得可信时间' };
    if (!level) return { ok: false, state, reason: '达到VIP 1后可领取每日奖励' };
    if (state.vip.lastDailyClaimDate === dateKey) return { ok: false, state, reason: '今天已经领取VIP奖励' };
    if (state.vip.lastDailyClaimDate && state.vip.lastDailyClaimDate > dateKey) return { ok: false, state, reason: '可信日期早于上次领取记录' };
    const reward = getPeakVipDailyReward(level);
    grantPeakReward(state, reward, { claimKey: `vip:${dateKey}`, source: `vip-${level}`, now: trustedNow });
    state.vip.lastDailyClaimDate = dateKey;
    state.updatedAt = trustedNow;
    return { ok: true, state, dateKey, level, reward };
};

export const getPeakBlessingBonuses = (character) => {
    const bonuses = {
        stats: {}, goldBonus: 0, xpBonus: 0, drawInterval: 0, openingHandBonus: 0, startingShieldPercent: 0,
        firstAttackGuaranteedCrit: false, firstAttackCritDamage: 0, queueDamageBonuses: {}, categoryDamageBonuses: {},
        harmfulStatusStackBonus: 0, harmfulStatusDurationBonus: 0, firstSkillMpDiscount: 0, shieldRetentionPercent: 0,
        shieldCarryAmplify: 0, endTurnMpShieldPercent: 0, blessingLastStandShieldPercent: 0, drawTriggerMp: 0,
        firstCardMpReduction: 0,
    };
    Object.entries(character?.blessings?.ranks || {}).forEach(([id, storedRank]) => {
        const node = PEAK_BLESSING_BY_ID[id];
        const rank = Math.max(0, Math.min(node?.maxRank || 0, Math.floor(finite(storedRank))));
        if (!node || !rank) return;
        node.effects.forEach((effect) => {
            if (effect.type === 'stat') bonuses.stats[effect.stat] = finite(bonuses.stats[effect.stat]) + finite(effect.value) * rank;
            else if (effect.type === 'drawInterval') {
                const interval = effect.values?.[rank - 1] || effect.value || 0;
                if (interval > 0) bonuses.drawInterval = bonuses.drawInterval > 0 ? Math.min(bonuses.drawInterval, interval) : interval;
            }
            else if (effect.type === 'drawMasterUpgrade') {
                const upgrade = effect.values?.[rank - 1];
                if (upgrade) {
                    bonuses.drawInterval = bonuses.drawInterval > 0 ? Math.min(bonuses.drawInterval, upgrade.interval) : upgrade.interval;
                    bonuses.drawTriggerMp = Math.max(bonuses.drawTriggerMp, upgrade.restoreMp || 0);
                }
            } else if (effect.type === 'queueDamageBonus') bonuses.queueDamageBonuses[effect.position] = Math.max(bonuses.queueDamageBonuses[effect.position] || 0, finite(effect.value));
            else if (effect.type === 'queueDamageUpgrade') Object.assign(bonuses.queueDamageBonuses, effect.values?.[rank - 1] || {});
            else if (effect.type === 'categoryDamageBonus') bonuses.categoryDamageBonuses[effect.category] = Math.max(bonuses.categoryDamageBonuses[effect.category] || 0, finite(effect.value));
            else if (effect.type === 'statusSpreadUpgrade') {
                const upgrade = effect.values?.[rank - 1] || {};
                bonuses.harmfulStatusStackBonus += finite(upgrade.stacks);
                bonuses.harmfulStatusDurationBonus += finite(upgrade.duration);
            } else if (effect.type === 'firstSkillMpDiscount') {
                const value = effect.values?.[rank - 1] ?? effect.value;
                bonuses.firstSkillMpDiscount = Math.max(bonuses.firstSkillMpDiscount, finite(value));
            } else if (effect.type === 'shieldRetentionPercent') bonuses.shieldRetentionPercent = Math.max(bonuses.shieldRetentionPercent, finite(effect.value));
            else if (effect.type === 'endTurnMpShieldPercent') {
                const value = effect.values?.[rank - 1] ?? effect.value;
                bonuses.endTurnMpShieldPercent = Math.max(bonuses.endTurnMpShieldPercent, finite(value));
            } else if (effect.type === 'shieldCarryAmplify') bonuses.shieldCarryAmplify = Math.max(bonuses.shieldCarryAmplify, finite(effect.values?.[rank - 1] ?? effect.value));
            else if (effect.type === 'blessingLastStand') bonuses.blessingLastStandShieldPercent = Math.max(bonuses.blessingLastStandShieldPercent, finite(effect.shieldPercent));
            else bonuses[effect.type] = typeof bonuses[effect.type] === 'boolean' ? true : finite(bonuses[effect.type]) + finite(effect.value) * rank;
        });
    });
    return bonuses;
};

export const getPeakBlessingStatus = (save, characterId = save.activeCharacterId) => {
    const character = save.characters[characterId];
    const ranks = character?.blessings?.ranks || {};
    const earned = Math.floor(Math.max(1, finite(character?.level, 1)) / 2);
    const spent = Object.entries(ranks).reduce((sum, [id, rank]) => sum + (PEAK_BLESSING_BY_ID[id] ? Math.max(0, Math.floor(finite(rank))) : 0), 0);
    const goldSpent = Object.entries(ranks).reduce((total, [id, storedRank]) => {
        const node = PEAK_BLESSING_BY_ID[id];
        const rank = Math.min(node?.maxRank || 0, Math.max(0, Math.floor(finite(storedRank))));
        if (!node) return total;
        return total + Array.from({ length: rank }, (_, index) => node.goldBase + node.goldGrowth * index).reduce((sum, cost) => sum + cost, 0);
    }, 0);
    return { earned, spent, available: Math.max(0, earned - spent), goldSpent, ranks };
};

export const learnPeakBlessing = (source, characterId, blessingId, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const character = state.characters[characterId];
    const node = PEAK_BLESSING_BY_ID[blessingId];
    if (!character || !node) return { ok: false, state, reason: '祝福不存在' };
    const status = getPeakBlessingStatus(state, characterId);
    const rank = Math.max(0, Math.floor(finite(status.ranks[node.id])));
    if (rank >= node.maxRank) return { ok: false, state, reason: '该祝福已经点满' };
    const missing = node.requires.find((id) => (status.ranks[id] || 0) < PEAK_BLESSING_BY_ID[id].maxRank);
    if (missing) return { ok: false, state, reason: `需要先点满「${PEAK_BLESSING_BY_ID[missing].name}」` };
    if (status.available < 1) return { ok: false, state, reason: '可用祝福点不足' };
    const goldCost = node.goldBase + node.goldGrowth * rank;
    if (state.wallet.gold < goldCost) return { ok: false, state, reason: `需要 ${goldCost} 金币` };
    state.wallet.gold -= goldCost;
    character.blessings.ranks[node.id] = rank + 1;
    return { ok: true, state, node, rank: rank + 1, goldCost };
};

export const resetPeakBlessings = (source, characterId, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const character = state.characters[characterId];
    if (!character) return { ok: false, state, reason: '角色不存在' };
    const status = getPeakBlessingStatus(state, characterId);
    if (!status.spent) return { ok: false, state, reason: '当前没有已学习的祝福' };
    const refund = Math.floor(status.goldSpent * .5);
    character.blessings.ranks = {};
    state.wallet.gold += refund;
    return { ok: true, state, refund, resetPoints: status.spent };
};

export const getPeakCharacterStats = (save, characterId = save.activeCharacterId) => {
    const character = save.characters[characterId];
    const definition = PEAK_CHARACTERS[character?.baseClassId];
    if (!character || !definition) return {};
    const stats = { ...definition.base };
    const steps = Math.max(0, character.level - 1);
    Object.entries(definition.growth || {}).forEach(([key, value]) => { stats[key] = finite(stats[key]) + value * steps; });
    const advancement = PEAK_ADVANCEMENTS[character.advancement.pathId];
    if (advancement && character.advancement.tier >= 1) Object.entries(advancement.firstStats || {}).forEach(([key, value]) => { stats[key] = finite(stats[key]) + finite(value); });
    if (advancement && character.advancement.tier >= 2) Object.entries(advancement.secondStats || {}).forEach(([key, value]) => { stats[key] = finite(stats[key]) + finite(value); });
    character.inventory.filter((item) => character.equipped[item.slot] === item.id).forEach((item) => {
        Object.entries(item.stats || {}).forEach(([key, value]) => { stats[key] = finite(stats[key]) + finite(value); });
    });
    const blessingBonuses = getPeakBlessingBonuses(character);
    Object.entries(blessingBonuses.stats).forEach(([key, value]) => { stats[key] = finite(stats[key]) + finite(value); });
    stats.hp = Math.round(stats.hp + stats.vitality * 12);
    const directMpBonus = stats.mp - (definition.base.mp + finite(definition.growth?.mp) * steps);
    stats.mp = Math.max(50, Math.round((definition.base.mp + finite(definition.growth?.mp) * steps) * .4 + directMpBonus + stats.spirit * 1.75));
    stats.physicalDefense = Math.round(stats.physicalDefense + stats.vitality * 2);
    stats.magicalDefense = Math.round(stats.magicalDefense + stats.spirit * 2);
    delete stats.attackSpeed;
    delete stats.moveSpeed;
    delete stats.baseMoveSpeed;
    delete stats.castSpeed;
    delete stats.cooldownReduction;
    return stats;
};

export const getPeakPlayerDrawPerTurn = (level) => 2 + (finite(level) >= 36 ? 1 : 0);

export const createPeakBattlePlayerPayload = (save, characterId = save.activeCharacterId) => {
    const character = save.characters?.[characterId];
    if (!character) return null;
    const collection = getPeakCardCollection(save, characterId);
    const stats = getPeakCharacterStats(save, characterId);
    const blessingBonuses = getPeakBlessingBonuses(character);
    return {
        name: character.name,
        level: character.level,
        advancement: clone(character.advancement),
        maxHp: stats.hp,
        maxMp: stats.mp,
        stats,
        cardLevels: Object.fromEntries(Object.entries(collection).map(([id, entry]) => [id, entry.level || 1])),
        drawPerTurn: getPeakPlayerDrawPerTurn(character.level),
        drawInterval: blessingBonuses.drawInterval,
        openingHandBonus: Math.min(4, blessingBonuses.openingHandBonus),
        startingShield: Math.round(stats.hp * blessingBonuses.startingShieldPercent / 100),
        blessingEffects: blessingBonuses,
    };
};

const weightedKey = (weights, random = Math.random) => {
    const entries = Object.entries(weights).filter(([, weight]) => Number(weight) > 0);
    const total = entries.reduce((sum, [, weight]) => sum + Number(weight), 0);
    let roll = random() * total;
    for (const [key, weight] of entries) {
        roll -= Number(weight);
        if (roll <= 0) return key;
    }
    return entries.at(-1)?.[0] || '';
};

const rarityRank = ['common', 'excellent', 'rare', 'scarce', 'legendary', 'epic', 'mythic'];
export const PEAK_CARD_UPGRADE_COPY_COSTS = Object.freeze([1, 2, 3, 4, 5, 6, 8, 10, 12]);
export const PEAK_CARD_UPGRADE_RULES = {
    common: { gold: 90 },
    excellent: { gold: 150 },
    rare: { gold: 260 },
    scarce: { gold: 360 },
    legendary: { gold: 480 },
    epic: { gold: 900 },
    mythic: { gold: 1800 },
};

const peakCardCollectionBucket = (save, card) => card?.classId === 'all'
    ? save.collection
    : save.classCollections?.[save.characters?.[save.activeCharacterId]?.baseClassId] || save.characters?.[save.activeCharacterId]?.collection;

export const getPeakUniversalShardBalance = (save, rarity) => PEAK_UNIVERSAL_SHARD_RARITIES.includes(rarity)
    ? Math.max(0, Math.floor(finite(save?.universalShards?.[rarity])))
    : 0;

export const getPeakClassShardBalance = (save, classId, rarity) => PEAK_CHARACTERS[classId] && PEAK_UNIVERSAL_SHARD_RARITIES.includes(rarity)
    ? Math.max(0, Math.floor(finite(save?.classShards?.[classId]?.[rarity])))
    : 0;

export const getPeakCardUpgradeCost = (save, cardId) => {
    const card = PEAK_CARD_BY_ID[cardId];
    const entry = getPeakCardCollection(save)?.[cardId];
    if (!card || !entry?.unlocked || entry.level >= card.maxLevel) return null;
    const rule = PEAK_CARD_UPGRADE_RULES[card.rarity];
    const level = Math.max(1, Math.floor(finite(entry.level, 1)));
    return {
        copies: PEAK_CARD_UPGRADE_COPY_COSTS[level - 1],
        gold: Math.round(rule.gold * Math.pow(level, 1.35)),
        fromLevel: level,
        toLevel: level + 1,
    };
};

export const upgradePeakCard = (source, cardId, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const card = PEAK_CARD_BY_ID[cardId];
    const entry = peakCardCollectionBucket(state, card)?.[cardId];
    if (!card || !entry?.unlocked) return { ok: false, state, reason: '卡牌尚未解锁' };
    if (!isPeakCardAvailableForAdvancement(card, getActivePeakCharacter(state)?.advancement)) return { ok: false, state, reason: '当前转职路线不能升级该卡牌' };
    const cost = getPeakCardUpgradeCost(state, cardId);
    if (!cost) return { ok: false, state, reason: '卡牌已经达到最高等级' };
    const classShardBalance = card.classId === 'all' ? 0 : getPeakClassShardBalance(state, card.classId, card.rarity);
    const universalShardBalance = getPeakUniversalShardBalance(state, card.rarity);
    if (entry.upgradeCopies + classShardBalance + universalShardBalance < cost.copies) return { ok: false, state, reason: `同名卡、职业碎片与${PEAK_CARD_RARITIES[card.rarity].name}通用碎片数量不足` };
    if (state.wallet.gold < cost.gold) return { ok: false, state, reason: '金币不足' };
    const copiesUsed = Math.min(entry.upgradeCopies, cost.copies);
    const remainingAfterCopies = cost.copies - copiesUsed;
    const classShardsUsed = Math.min(classShardBalance, remainingAfterCopies);
    const universalShardsUsed = remainingAfterCopies - classShardsUsed;
    entry.upgradeCopies -= copiesUsed;
    if (classShardsUsed) state.classShards[card.classId][card.rarity] -= classShardsUsed;
    state.universalShards[card.rarity] -= universalShardsUsed;
    entry.level = cost.toLevel;
    state.wallet.gold -= cost.gold;
    recordPeakTransaction(state, 'spend', 'card-upgrade', { gold: -cost.gold }, now);
    recordMissionEventInState(state, 'cardUpgraded', 1, now);
    recordMissionEventInState(state, 'maxCardLevel', entry.level, now);
    state.updatedAt = now;
    return {
        ok: true,
        state,
        card,
        cost: {
            ...cost,
            copiesUsed,
            shardsUsed: classShardsUsed + universalShardsUsed,
            classShardsUsed,
            universalShardsUsed,
            shardRarity: card.rarity,
            shardClassId: card.classId === 'all' ? null : card.classId,
        },
    };
};

export const convertPeakDuplicateCards = (source, cardId, copies = PEAK_DUPLICATE_TO_SHARD_RATE, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const card = PEAK_CARD_BY_ID[cardId];
    const entry = peakCardCollectionBucket(state, card)?.[cardId];
    if (!card || !entry?.unlocked) return { ok: false, state, reason: '卡牌尚未解锁' };
    if (!PEAK_UNIVERSAL_SHARD_RARITIES.includes(card.rarity)) return { ok: false, state, reason: '该稀有度暂不支持兑换碎片' };
    const requested = Math.max(0, Math.floor(finite(copies)));
    const shardCount = Math.floor(Math.min(entry.upgradeCopies, requested) / PEAK_DUPLICATE_TO_SHARD_RATE);
    if (shardCount < 1) return { ok: false, state, reason: `至少需要${PEAK_DUPLICATE_TO_SHARD_RATE}张多余同名卡` };
    const copiesUsed = shardCount * PEAK_DUPLICATE_TO_SHARD_RATE;
    entry.upgradeCopies -= copiesUsed;
    const shardClassId = card.classId === 'all' ? null : card.classId;
    if (shardClassId) state.classShards[shardClassId][card.rarity] += shardCount;
    else state.universalShards[card.rarity] += shardCount;
    state.updatedAt = now;
    return { ok: true, state, card, copiesUsed, shardCount, rarity: card.rarity, shardClassId, shardKind: shardClassId ? 'class' : 'universal' };
};

export const convertPeakClassShardsToUniversal = (source, classId, rarity, classShardAmount = PEAK_CLASS_SHARD_EXCHANGE_RATE, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    if (!PEAK_CHARACTERS[classId]) return { ok: false, state, reason: '职业不存在' };
    if (!PEAK_UNIVERSAL_SHARD_RARITIES.includes(rarity)) return { ok: false, state, reason: '该稀有度暂不支持碎片兑换' };
    const requested = Math.max(0, Math.floor(finite(classShardAmount)));
    const balance = getPeakClassShardBalance(state, classId, rarity);
    const universalShards = Math.floor(Math.min(balance, requested) / PEAK_CLASS_SHARD_EXCHANGE_RATE);
    if (universalShards < 1) return { ok: false, state, reason: `至少需要${PEAK_CLASS_SHARD_EXCHANGE_RATE}枚同稀有度职业碎片` };
    const classShardsUsed = universalShards * PEAK_CLASS_SHARD_EXCHANGE_RATE;
    state.classShards[classId][rarity] -= classShardsUsed;
    state.universalShards[rarity] += universalShards;
    state.updatedAt = now;
    return { ok: true, state, classId, rarity, classShardsUsed, universalShards };
};

const grantPeakCardDefinition = (state, definition) => {
    const bucket = peakCardCollectionBucket(state, definition);
    if (!bucket || !definition) return null;
    const current = bucket[definition.id] || { unlocked: false, level: 1, upgradeCopies: 0, copies: 0 };
    const isNew = !current.unlocked;
    const limit = PEAK_CARD_RARITIES[definition.rarity].deckLimit;
    let duplicateCopies = 0;
    current.unlocked = true;
    if (current.copies < limit) current.copies += 1;
    else {
        duplicateCopies = 1;
        current.upgradeCopies += duplicateCopies;
    }
    bucket[definition.id] = current;
    return { cardId: definition.id, rarity: definition.rarity, isNew, upgradeCopies: duplicateCopies, converted: duplicateCopies };
};

const isPeakPackCardCandidate = (card, pack, character) => {
    if (!card || card.generatedOnly || card.enemyOnly || !character) return false;
    const isGeneric = card.classId === 'all';
    const isBaseClass = card.classId === character.baseClassId;
    if (!isGeneric && !isBaseClass) return false;
    if (!isPeakCardAvailableForAdvancement(card, character.advancement)) return false;
    return pack?.poolMode !== 'class' || isBaseClass;
};

const drawPackCard = (pack, character, random, minimumRarity = '') => {
    const minimumRank = Math.max(0, rarityRank.indexOf(minimumRarity));
    const eligibleRates = Object.fromEntries(Object.entries(pack.rates).filter(([rarity]) => rarityRank.indexOf(rarity) >= minimumRank));
    let rarity = weightedKey(Object.keys(eligibleRates).length ? eligibleRates : pack.rates, random);
    let candidates = PEAK_CARDS.filter((card) => card.rarity === rarity && isPeakPackCardCandidate(card, pack, character));
    while (!candidates.length && rarityRank.indexOf(rarity) > 0) {
        rarity = rarityRank[rarityRank.indexOf(rarity) - 1];
        candidates = PEAK_CARDS.filter((card) => card.rarity === rarity && isPeakPackCardCandidate(card, pack, character));
    }
    return candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))];
};

const openPeakPack = (state, packId, random, now) => {
    const character = getActivePeakCharacter(state);
    if (!character) return { ok: false, state, reason: '请先创建并选择角色' };
    const pack = PEAK_PACKS.find((entry) => entry.id === packId);
    if (!pack) return { ok: false, state, reason: '卡包不存在' };
    if (Number(pack.minAdvancementTier) > Number(character.advancement?.tier || 0)) {
        return { ok: false, state, reason: '该卡包需要角色完成二次转职后开放' };
    }
    const definitions = Array.from({ length: 4 }, () => drawPackCard(pack, character, random));
    const firstFourHaveEpic = definitions.some((definition) => definition?.rarity === 'epic');
    const pityEpic = isPeakPackEpicEligible(pack) && state.shop.epicPity >= 49 && !firstFourHaveEpic;
    definitions.push(drawPackCard(pack, character, random, pityEpic ? 'epic' : (pack.guaranteeRarity || '')));
    if (definitions.some((definition) => !definition)) return { ok: false, state, reason: '卡池暂时不可用' };
    const cards = [];
    definitions.forEach((definition) => {
        const granted = grantPeakCardDefinition(state, definition);
        if (granted) cards.push(granted);
    });
    const hasEpic = cards.some((entry) => entry.rarity === 'epic');
    if (isPeakPackEpicEligible(pack)) state.shop.epicPity = hasEpic ? 0 : state.shop.epicPity + 1;
    state.shop.history.unshift({ id: `${now}-${pack.id}`, characterId: character.id, packId: pack.id, cards: cards.map((entry) => entry.cardId), openedAt: now });
    state.shop.history = state.shop.history.slice(0, 30);
    recordMissionEventInState(state, 'packOpened', 1, now);
    state.updatedAt = now;
    return { ok: true, state, cards, pack };
};

export const purchasePeakPack = (source, packId, random = Math.random, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const pack = PEAK_PACKS.find((entry) => entry.id === packId);
    if (!pack) return { ok: false, state, reason: '卡包不存在' };
    if (state.wallet.gold < pack.price) return { ok: false, state, reason: '金币不足' };
    const result = openPeakPack(state, packId, random, now);
    if (!result.ok) return result;
    result.state.wallet.gold -= pack.price;
    recordPeakTransaction(result.state, 'spend', `pack-${pack.id}`, { gold: -pack.price }, now);
    return { ...result, payment: { type: 'gold', amount: pack.price } };
};

export const purchasePeakPackWithVouchers = (source, packId, random = Math.random, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const cost = PEAK_PACK_VOUCHER_COSTS[packId];
    if (!cost) return { ok: false, state, reason: '该卡包暂不支持代金券购买' };
    if (state.wallet.vouchers < cost) return { ok: false, state, reason: '代金券不足' };
    const result = openPeakPack(state, packId, random, now);
    if (!result.ok) return result;
    result.state.wallet.vouchers -= cost;
    result.state.vip.growth += cost;
    recordPeakTransaction(result.state, 'spend', `pack-${packId}`, { vouchers: -cost }, now);
    return { ...result, payment: { type: 'vouchers', amount: cost }, vipGrowth: cost };
};

export const purchasePeakMerchantOffer = (source, offerId, random = Math.random, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const offer = PEAK_MERCHANT_OFFERS.find((entry) => entry.id === offerId);
    if (!offer) return { ok: false, state, reason: '商品不存在' };
    if (state.wallet.vouchers < offer.cost) return { ok: false, state, reason: '代金券不足' };
    if (offer.type === 'stamina') {
        const stamina = getActivePeakCharacter(state)?.stamina;
        if (!stamina) return { ok: false, state, reason: '请先创建并选择角色' };
        if (stamina.current >= stamina.max) return { ok: false, state, reason: '体力已经满了' };
    }
    let packResult = null;
    if (offer.type === 'pack') {
        packResult = openPeakPack(state, offer.packId, random, now);
        if (!packResult.ok) return packResult;
    } else if (offer.type === 'gold') {
        state.wallet.gold += Math.max(0, Math.floor(finite(offer.amount)));
    } else if (offer.type === 'stamina') {
        const stamina = getActivePeakCharacter(state).stamina;
        stamina.current = Math.min(stamina.max, stamina.current + Math.max(0, Math.floor(finite(offer.amount))));
        stamina.updatedAt = now;
    } else return { ok: false, state, reason: '商品类型暂不可用' };
    state.wallet.vouchers -= offer.cost;
    state.vip.growth += offer.cost;
    recordPeakTransaction(state, 'spend', `merchant-${offer.id}`, { vouchers: -offer.cost }, now);
    state.updatedAt = now;
    return {
        ok: true,
        state,
        offer,
        vipGrowth: offer.cost,
        payment: { type: 'vouchers', amount: offer.cost },
        ...(packResult ? { cards: packResult.cards, pack: packResult.pack } : {}),
    };
};

const equipmentRarityOrder = ['inferior', 'common', 'advanced', 'rare', 'artifact', 'legendary', 'epic', 'primordial', 'mythic'];
const droppableEquipmentSlots = PEAK_EQUIPMENT_SLOTS.filter((slot) => slot !== 'title');
const elementalAffixes = ['fireElement', 'iceElement', 'lightElement', 'darkElement'];
const penetrationAffixes = ['physicalPenetration', 'magicalPenetration', 'elementalPenetration'];
const slotProfiles = {
    weapon: ['physicalAttack', 'magicalAttack', 'independentAttack', 'strength', 'intelligence', 'physicalCrit', 'magicalCrit', 'allElement', 'damageIncrease', 'skillAttack', 'criticalDamage', ...elementalAffixes, ...penetrationAffixes],
    headShoulder: ['physicalDefense', 'magicalDefense', 'vitality', 'spirit', 'hp', 'physicalCrit', 'magicalCrit', 'damageReduction', 'allElement', 'skillAttack', ...elementalAffixes],
    top: ['hp', 'physicalDefense', 'magicalDefense', 'vitality', 'spirit', 'damageReduction', 'allElement', 'skillAttack', 'damageIncrease', ...elementalAffixes, 'mp'],
    bottom: ['hp', 'magicalDefense', 'physicalDefense', 'spirit', 'vitality', 'damageReduction', 'allElement', 'criticalDamage', ...elementalAffixes],
    belt: ['vitality', 'hp', 'physicalDefense', 'magicalDefense', 'damageReduction', 'allElement', 'skillAttack', 'damageIncrease', ...elementalAffixes, 'mp'],
    shoes: ['physicalDefense', 'magicalDefense', 'hp', 'vitality', 'spirit', 'physicalCrit', 'magicalCrit', 'damageReduction', 'criticalDamage', 'allElement', ...elementalAffixes],
    bracelet: ['independentAttack', 'strength', 'intelligence', 'physicalAttack', 'magicalAttack', 'physicalCrit', 'magicalCrit', 'allElement', 'damageIncrease', 'criticalDamage', 'skillAttack', ...elementalAffixes, ...penetrationAffixes],
    necklace: ['vitality', 'spirit', 'magicalDefense', 'hp', 'allElement', 'damageReduction', 'skillAttack', 'criticalDamage', ...elementalAffixes, ...penetrationAffixes, 'mp'],
    ring: ['physicalAttack', 'magicalAttack', 'independentAttack', 'physicalCrit', 'magicalCrit', 'allElement', 'damageIncrease', 'skillAttack', 'criticalDamage', 'allSkillLevel', ...elementalAffixes, ...penetrationAffixes, 'mp'],
    title: ['strength', 'intelligence', 'physicalAttack', 'magicalAttack', 'physicalCrit', 'magicalCrit', 'damageIncrease', 'allElement', 'skillAttack', 'criticalDamage', 'allSkillLevel', ...elementalAffixes, ...penetrationAffixes, 'mp'],
    support: ['independentAttack', 'physicalAttack', 'magicalAttack', 'physicalDefense', 'magicalDefense', 'allElement', 'damageIncrease', 'skillAttack', 'physicalCrit', 'magicalCrit', 'allSkillLevel', ...elementalAffixes, ...penetrationAffixes, 'mp'],
    magicStone: ['allElement', 'strength', 'intelligence', 'vitality', 'spirit', 'damageIncrease', 'skillAttack', 'criticalDamage', 'allSkillLevel', ...elementalAffixes, ...penetrationAffixes, 'mp'],
    earring: ['physicalAttack', 'magicalAttack', 'independentAttack', 'physicalCrit', 'magicalCrit', 'criticalDamage', 'damageIncrease', 'skillAttack', 'allElement', 'allSkillLevel', ...elementalAffixes, ...penetrationAffixes, 'mp'],
};
const weaponProfiles = {
    sword: ['physicalAttack', 'strength', 'physicalCrit', 'independentAttack', 'skillAttack', 'criticalDamage', 'iceElement', 'lightElement', 'allElement', 'physicalPenetration', 'damageIncrease'],
    brawler: ['independentAttack', 'strength', 'physicalAttack', 'physicalCrit', 'skillAttack', 'criticalDamage', 'fireElement', 'darkElement', 'allElement', 'physicalPenetration', 'damageIncrease'],
    archer: ['physicalAttack', 'strength', 'physicalCrit', 'criticalDamage', 'skillAttack', 'damageIncrease', 'lightElement', 'darkElement', 'allElement', 'physicalPenetration', 'independentAttack'],
    knight: ['physicalAttack', 'vitality', 'physicalDefense', 'damageReduction', 'strength', 'skillAttack', 'lightElement', 'allElement', 'physicalPenetration', 'physicalCrit'],
    priest: ['magicalAttack', 'intelligence', 'spirit', 'magicalCrit', 'skillAttack', 'lightElement', 'allElement', 'magicalPenetration', 'damageIncrease', 'criticalDamage'],
    mage: ['magicalAttack', 'intelligence', 'magicalCrit', 'fireElement', 'darkElement', 'allElement', 'skillAttack', 'magicalPenetration', 'damageIncrease', 'criticalDamage', 'spirit'],
    lancer: ['physicalAttack', 'strength', 'physicalCrit', 'skillAttack', 'independentAttack', 'criticalDamage', 'allElement', 'physicalPenetration', 'damageIncrease'],
};
const rollEquipmentStats = (profile, count, random, guaranteedStat = '') => {
    const available = [...new Set(profile)];
    const selected = [];
    const guaranteedIndex = available.indexOf(guaranteedStat);
    if (guaranteedIndex >= 0 && count > 0) selected.push(available.splice(guaranteedIndex, 1)[0]);
    while (selected.length < count && available.length) {
        const index = Math.min(available.length - 1, Math.floor(random() * available.length));
        selected.push(available.splice(index, 1)[0]);
    }
    return selected;
};

const equipmentStatValue = (stat, level, power, quality, roll = .5) => {
    const scaledLevel = 1 + Math.max(0, level - 1) * .45;
    const base = {
        physicalAttack: 3 + scaledLevel * 1.05, magicalAttack: 3 + scaledLevel * 1.05, independentAttack: 2 + scaledLevel * .8,
        strength: 2 + scaledLevel * .38, intelligence: 2 + scaledLevel * .38, vitality: 2 + scaledLevel * .34, spirit: 2 + scaledLevel * .34,
        hp: 14 + scaledLevel * 5.4, mp: 3 + scaledLevel * .55, physicalDefense: 8 + scaledLevel * 3.1, magicalDefense: 7 + scaledLevel * 2.7,
        physicalCrit: 1 + scaledLevel * .08, magicalCrit: 1 + scaledLevel * .08,
        allElement: 2 + scaledLevel * .18, fireElement: 2 + scaledLevel * .18, iceElement: 2 + scaledLevel * .18, lightElement: 2 + scaledLevel * .18, darkElement: 2 + scaledLevel * .18,
        physicalPenetration: .45 + scaledLevel * .055, magicalPenetration: .45 + scaledLevel * .055, elementalPenetration: .35 + scaledLevel * .045,
        damageIncrease: .8 + scaledLevel * .045, skillAttack: .7 + scaledLevel * .04,
        criticalDamage: 1 + scaledLevel * .055, damageReduction: .7 + scaledLevel * .035, allSkillLevel: .5 + scaledLevel * .012,
    }[stat] || 1;
    const rollMultiplier = .9 + Math.max(0, Math.min(1, finite(roll, .5))) * .2;
    return Math.max(1, Math.round(base * power * quality * rollMultiplier * 100) / 100);
};

const equipmentGradeOrder = ['lowest', 'low', 'middle', 'high', 'highest'];
const shiftWeightsUp = (weights, order, steps, ratio = .14) => {
    let result = { ...weights };
    for (let step = 0; step < steps; step += 1) {
        const next = { ...result };
        order.slice(0, -1).forEach((rarity, index) => {
            const moved = (result[rarity] || 0) * ratio;
            next[rarity] = (next[rarity] || 0) - moved;
            next[order[index + 1]] = (next[order[index + 1]] || 0) + moved;
        });
        result = next;
    }
    return Object.fromEntries(Object.entries(result).filter(([, weight]) => weight > 0));
};

const equipmentGradeWeights = (level, rarityBoost = 0) => {
    let weights;
    if (level <= 8) weights = { lowest: 75, low: 24, middle: 1 };
    else if (level <= 16) weights = { lowest: 45, low: 50, middle: 5 };
    else if (level <= 24) weights = { low: 38, middle: 52, high: 9.5, highest: .5 };
    else weights = { low: 10, middle: 55, high: 32, highest: 3 };
    return shiftWeightsUp(weights, equipmentGradeOrder, rarityBoost, .1);
};

export const generatePeakEquipment = (dungeon, classId, random = Math.random, now = Date.now(), sequence = 0) => {
    const band = PEAK_EQUIPMENT_DROP_BANDS.find((entry) => dungeon.level <= entry.maxLevel) || PEAK_EQUIPMENT_DROP_BANDS.at(-1);
    const eligibleRarities = equipmentRarityOrder.filter((rarity) => PEAK_EQUIPMENT_RARITIES[rarity]?.minLevel <= dungeon.level);
    const eligibleWeights = Object.fromEntries(Object.entries(band.weights).filter(([rarity]) => eligibleRarities.includes(rarity)));
    const rarityWeights = shiftWeightsUp(eligibleWeights, eligibleRarities, Math.max(0, Math.floor(finite(dungeon.rarityBoost))), .14);
    const rarity = weightedKey(rarityWeights, random);
    const grade = weightedKey(equipmentGradeWeights(dungeon.level, dungeon.rarityBoost), random);
    const gradeData = PEAK_EQUIPMENT_GRADES[grade];
    const quality = gradeData.min + random() * (gradeData.max - gradeData.min);
    const slot = droppableEquipmentSlots[Math.floor(random() * droppableEquipmentSlots.length)];
    const rarityData = PEAK_EQUIPMENT_RARITIES[rarity];
    const statCount = Math.min(4, 1 + Math.floor(equipmentRarityOrder.indexOf(rarity) / 2));
    const profile = slot === 'weapon' ? (weaponProfiles[classId] || weaponProfiles.sword) : (slotProfiles[slot] || slotProfiles.weapon);
    const rolledStats = rollEquipmentStats(profile, statCount, random, slot === 'weapon' ? profile[0] : '');
    const stats = Object.fromEntries(rolledStats.map((stat) => [stat, equipmentStatValue(stat, dungeon.level, rarityData.power, quality, random())]));
    const namePool = (PEAK_EQUIPMENT_NAME_POOLS[rarity] || []).filter((entry) => entry.slot === slot && (!entry.classId || entry.classId === classId));
    const nameTemplate = namePool[Math.min(namePool.length - 1, Math.floor(random() * namePool.length))];
    return {
        id: `peak-drop-${now}-${sequence}-${Math.floor(random() * 1e7)}`,
        name: nameTemplate?.name || `${rarityData.name}${PEAK_EQUIPMENT_SLOT_LABELS[slot]}`,
        slot,
        level: dungeon.level,
        rarity,
        grade,
        quality: Math.round(quality * 100) / 100,
        classId: slot === 'weapon' ? classId : null,
        stats,
        price: Math.max(10, Math.round((18 + dungeon.level * 4) * rarityData.power * quality)),
        equipped: false,
        locked: false,
        acquiredAt: now,
    };
};

export function getPeakLevelXpRequirement(level) { return 80 + level * 45; }
const grantCharacterXp = (character, amount) => {
    let availableXp = Math.max(0, Math.floor(finite(character.xp))) + Math.max(0, Math.floor(finite(amount)));
    let levels = 0;
    const cap = character.advancement.tier === 0
        ? PEAK_ADVANCEMENT_LEVELS.first
        : character.advancement.tier === 1 ? PEAK_ADVANCEMENT_LEVELS.second : PEAK_ADVANCEMENT_LEVELS.max;
    while (character.level < cap && availableXp >= getPeakLevelXpRequirement(character.level)) {
        availableXp -= getPeakLevelXpRequirement(character.level);
        character.level += 1;
        levels += 1;
    }
    if (character.level >= cap && cap < PEAK_ADVANCEMENT_LEVELS.max) {
        character.xp = 0;
        character.overflowXp = Math.min(
            getPeakLevelXpRequirement(cap),
            Math.max(0, Math.floor(finite(character.overflowXp))) + availableXp,
        );
    } else character.xp = character.level >= PEAK_ADVANCEMENT_LEVELS.max ? 0 : availableXp;
    return levels;
};

export const getPeakAdvancementStatus = (character) => {
    if (!character) return { available: false, tier: 0, reason: '请先选择角色' };
    if (character.advancement.tier === 0) return {
        available: character.level >= PEAK_ADVANCEMENT_LEVELS.first,
        tier: 1,
        requiredLevel: PEAK_ADVANCEMENT_LEVELS.first,
        reason: character.level >= PEAK_ADVANCEMENT_LEVELS.first ? '' : `达到Lv.${PEAK_ADVANCEMENT_LEVELS.first}后开放一转`,
    };
    if (character.advancement.tier === 1) return {
        available: character.level >= PEAK_ADVANCEMENT_LEVELS.second,
        tier: 2,
        requiredLevel: PEAK_ADVANCEMENT_LEVELS.second,
        reason: character.level >= PEAK_ADVANCEMENT_LEVELS.second ? '' : `达到Lv.${PEAK_ADVANCEMENT_LEVELS.second}后开放二转`,
    };
    return { available: false, tier: 0, requiredLevel: 0, reason: '已经完成二转' };
};

export const advancePeakCharacter = (source, characterId, pathId = '', now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const character = state.characters[characterId];
    const status = getPeakAdvancementStatus(character);
    if (!character || !status.available) return { ok: false, state, reason: status.reason || '当前不能转职' };
    let grantedCards = [];
    if (status.tier === 1) {
        const path = PEAK_ADVANCEMENTS[pathId];
        if (!path || path.baseClassId !== character.baseClassId) return { ok: false, state, reason: '转职路线不适用于当前职业' };
        character.advancement = { tier: 1, pathId: path.id, tier1CompletedAt: now, tier2CompletedAt: null };
        grantedCards = grantAdvancementCards(state, character, path.firstGrantCards || []);
    } else {
        const path = PEAK_ADVANCEMENTS[character.advancement.pathId];
        if (!path) return { ok: false, state, reason: '一转路线数据异常' };
        character.advancement.tier = 2;
        character.advancement.tier2CompletedAt = now;
        grantedCards = grantAdvancementCards(state, character, path.secondGrantCards || []);
    }
    const overflowXp = character.overflowXp;
    character.overflowXp = 0;
    const levelsGained = grantCharacterXp(character, overflowXp);
    recordMissionEventInState(state, 'maxAdvancementTier', character.advancement.tier, now);
    recordMissionEventInState(state, 'maxCharacterLevel', character.level, now);
    character.updatedAt = now;
    return { ok: true, state, character, tier: status.tier, path: PEAK_ADVANCEMENTS[character.advancement.pathId], levelsGained, grantedCards };
};

const drawPeakDungeonRewardCard = (dungeon, character, random) => {
    const rates = dungeon?.cardRewardRates;
    if (!rates || dungeon.difficultyId !== 'hard') return null;
    let rarity = weightedKey(rates, random);
    const maximumRank = rarityRank.indexOf('scarce');
    if (rarityRank.indexOf(rarity) > maximumRank) rarity = 'scarce';
    let candidates = PEAK_CARDS.filter((card) => card.rarity === rarity && isPeakPackCardCandidate(card, {}, character));
    while (!candidates.length && rarityRank.indexOf(rarity) > 0) {
        rarity = rarityRank[rarityRank.indexOf(rarity) - 1];
        candidates = PEAK_CARDS.filter((card) => card.rarity === rarity && isPeakPackCardCandidate(card, {}, character));
    }
    return candidates[Math.min(candidates.length - 1, Math.floor(random() * candidates.length))] || null;
};

export const settlePeakVictory = (source, battle, random = Math.random, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    if (!battle || battle.phase !== 'victory') return { ok: false, state, reason: '当前战斗尚未胜利' };
    const runId = `${battle.createdAt}-${battle.seed}`;
    const character = getActivePeakCharacter(state);
    if (!character) return { ok: false, state, reason: '请先选择角色' };
    if (character.progress.claimedRuns.includes(runId)) return { ok: false, state, reason: '该战斗奖励已经领取' };
    const dungeon = PEAK_DUNGEONS.find((entry) => entry.id === battle.dungeonId);
    if (!dungeon) return { ok: false, state, reason: '副本数据不存在' };
    const blessingBonuses = getPeakBlessingBonuses(character);
    const bossMultiplier = dungeon.isBoss ? 1.18 : 1;
    const rolledGold = Math.round((12 + dungeon.level * 3.2) * bossMultiplier * (dungeon.goldMultiplier || 1) * (.9 + random() * .2));
    const guaranteedGold = Math.max(1, Math.floor(finite(dungeon.guaranteedGold, 1)));
    const baseGold = Math.max(rolledGold, guaranteedGold);
    const baseXp = Math.round((90 + dungeon.level * 25) * (dungeon.xpMultiplier || 1));
    const gold = Math.round(baseGold * (1 + blessingBonuses.goldBonus / 100));
    const xp = Math.round(baseXp * (1 + blessingBonuses.xpBonus / 100));
    const fieldDropCount = Math.min(6, battle.pendingDrops?.length || 0);
    const baseItemCount = Math.max(1, Math.floor(finite(dungeon.baseItemCount, dungeon.isBoss ? 2 : 1)));
    const itemCount = baseItemCount + fieldDropCount;
    const items = Array.from({ length: itemCount }, (_, index) => ({ ...generatePeakEquipment(dungeon, character.baseClassId, random, now, index), fieldDrop: index >= baseItemCount }));
    let overflowGold = 0;
    const receivedItems = [];
    items.forEach((item) => {
        if (character.inventory.length < 120) { character.inventory.push(item); receivedItems.push(item); }
        else overflowGold += item.price;
    });
    let cardReward = null;
    if (dungeon.difficultyId === 'hard' && random() < Math.max(0, Math.min(1, finite(dungeon.cardRewardChance)))) {
        const definition = drawPeakDungeonRewardCard(dungeon, character, random);
        if (definition) cardReward = grantPeakCardDefinition(state, definition);
    }
    state.wallet.gold += gold + overflowGold;
    const oldLevel = character.level;
    const oldBlessingPoints = Math.floor(oldLevel / 2);
    const levelsGained = grantCharacterXp(character, xp);
    const blessingPointsGained = Math.max(0, Math.floor(character.level / 2) - oldBlessingPoints);
    character.progress.cleared[dungeon.id] = (Number(character.progress.cleared[dungeon.id]) || 0) + 1;
    const dungeonIndex = PEAK_DUNGEONS.findIndex((entry) => entry.id === dungeon.id);
    const next = PEAK_DUNGEONS[dungeonIndex + 1];
    if (next && !character.progress.unlockedDungeons.includes(next.id)) character.progress.unlockedDungeons.push(next.id);
    character.progress.claimedRuns.push(runId);
    character.progress.claimedRuns = character.progress.claimedRuns.slice(-100);
    const cardsPlayed = Math.max(0, Math.floor(finite(battle.statistics?.playerCardsPlayed, battle.log?.filter((entry) => entry.type === 'card').length || 0)));
    const defeatedBosses = Math.max(0, (battle.encounters || []).filter((entry) => entry.isBoss).length || (dungeon.isBoss ? 1 : 0));
    recordMissionEventInState(state, 'dungeonCleared', 1, now);
    recordMissionEventInState(state, 'cardsPlayed', cardsPlayed, now);
    recordMissionEventInState(state, 'bossDefeated', defeatedBosses, now);
    recordMissionEventInState(state, 'equipmentObtained', receivedItems.length, now);
    if (dungeon.difficultyId === 'hard') recordMissionEventInState(state, 'hardDungeonCleared', 1, now);
    recordMissionEventInState(state, 'maxCharacterLevel', character.level, now);
    return { ok: true, state, reward: {
        gold, baseGold, rolledGold, guaranteedGold, goldBonus: gold - baseGold, xp, baseXp, xpBonus: xp - baseXp,
        items: receivedItems, card: cardReward, overflowGold, levelsGained, blessingPointsGained, fieldDropCount,
        oldLevel, newLevel: character.level, currentXp: character.xp,
        xpToNext: character.level >= 60 || getPeakAdvancementStatus(character).available ? 0 : getPeakLevelXpRequirement(character.level),
        overflowXp: character.overflowXp,
        advancementAvailable: getPeakAdvancementStatus(character).available,
        rounds: Math.max(1, Math.floor(finite(battle.round, 1))),
        remainingHp: Math.max(0, Math.ceil(finite(battle.player?.hp))),
        maxHp: Math.max(1, Math.ceil(finite(battle.player?.maxHp, 1))),
    } };
};

export const equipPeakItem = (source, characterId, itemId, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const character = state.characters[characterId];
    const item = character?.inventory.find((entry) => entry.id === itemId);
    if (!item) return { ok: false, state, reason: '装备不存在' };
    if (item.slot === 'weapon' && item.classId !== character.baseClassId) {
        const weaponClassName = PEAK_CHARACTERS[item.classId]?.name || '其他职业';
        return { ok: false, state, reason: `该武器仅限${weaponClassName}使用` };
    }
    if (character.level < item.level) return { ok: false, state, reason: `需要角色达到 Lv.${item.level}` };
    character.inventory.forEach((entry) => { if (entry.slot === item.slot) entry.equipped = false; });
    item.equipped = true;
    character.equipped[item.slot] = item.id;
    return { ok: true, state };
};

export const unequipPeakItem = (source, characterId, slot, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const character = state.characters[characterId];
    if (!character || !PEAK_EQUIPMENT_SLOTS.includes(slot)) return { ok: false, state, reason: '装备栏不存在' };
    const item = character.inventory.find((entry) => entry.id === character.equipped[slot]);
    if (item) item.equipped = false;
    character.equipped[slot] = '';
    return { ok: true, state };
};

export const togglePeakItemLock = (source, characterId, itemId, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const item = state.characters[characterId]?.inventory.find((entry) => entry.id === itemId);
    if (!item) return { ok: false, state, reason: '装备不存在' };
    item.locked = !item.locked;
    return { ok: true, state, locked: item.locked };
};

export const sellPeakItem = (source, characterId, itemId, now = Date.now()) => {
    const state = normalizePeakSave(source, now);
    const character = state.characters[characterId];
    const index = character?.inventory.findIndex((entry) => entry.id === itemId) ?? -1;
    if (index < 0) return { ok: false, state, reason: '装备不存在' };
    const item = character.inventory[index];
    if (item.locked) return { ok: false, state, reason: '已锁定装备不能出售' };
    if (character.equipped[item.slot] === item.id || item.equipped) return { ok: false, state, reason: '请先卸下装备' };
    const gold = Math.max(1, Math.floor(finite(item.price, 1)));
    character.inventory.splice(index, 1);
    state.wallet.gold += gold;
    return { ok: true, state, gold };
};
