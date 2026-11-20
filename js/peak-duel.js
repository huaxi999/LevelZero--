import {
    PEAK_ASSETS,
    PEAK_ADVANCEMENTS,
    PEAK_BLESSING_BY_ID,
    PEAK_BLESSING_TREES,
    PEAK_CARD_BY_ID,
    PEAK_CARD_CATEGORIES,
    PEAK_CARD_RARITIES,
    PEAK_CARDS,
    PEAK_CHARACTERS,
    PEAK_COMBAT_STATES,
    PEAK_DUNGEONS,
    PEAK_EQUIPMENT_RARITIES,
    PEAK_EQUIPMENT_GRADES,
    PEAK_EQUIPMENT_SLOT_LABELS,
    PEAK_EQUIPMENT_SLOTS,
    PEAK_PACKS,
    PEAK_RESERVED_CLASSES,
    PEAK_STATUS_EFFECTS,
    PEAK_TACTICAL_DECLARATIONS,
    PEAK_TUTORIAL_CHAPTERS,
    getPeakCharacterJobName,
    getAvailableCards,
    getPeakCardCost,
    getPeakCardEffects,
} from './peak-duel-data.js';
import { getPeakEffectiveCardLevel } from './peak-duel-combat.js';
import {
    createPeakBattle,
    queuePeakCard,
    resolvePeakRound,
    unqueuePeakCard,
    previewPeakQueueState,
    abandonPeakBattle,
    validatePeakQueue,
    canQueuePeakCard,
    getPeakPlayerMpRecovery,
    getPeakBattleCardCost,
    discardPeakHandCards,
    selectPeakTacticalDeclaration,
    PEAK_PLAYER_HAND_LIMIT,
} from './peak-duel-engine.js';
import {
    getPeakCharacterStats,
    PEAK_EQUIPMENT_STATS,
    getActivePeakCharacter,
    getPeakCardCollection,
    getPeakAccountRecordStatus,
    markPeakTutorialViewed,
    getPeakAdvancementStatus,
    getPeakBlessingBonuses,
    getPeakBlessingStatus,
    getPeakSave,
    getPeakStaminaCountdown,
    refreshPeakStamina,
    spendPeakStamina,
    validatePeakDeck,
    purchasePeakPack,
    settlePeakVictory,
    equipPeakItem,
    unequipPeakItem,
    togglePeakItemLock,
    sellPeakItem,
    getPeakCardUpgradeCost,
    upgradePeakCard,
    convertPeakDuplicateCards,
    convertPeakClassShardsToUniversal,
    getPeakUniversalShardBalance,
    getPeakClassShardBalance,
    learnPeakBlessing,
    resetPeakBlessings,
    claimPeakAttendance,
    claimPeakVipDaily,
    getPeakDateKey,
    getPeakWeekKey,
    getPeakVipStatus,
    getPeakVipDailyReward,
    purchasePeakMerchantOffer,
    purchasePeakPackWithVouchers,
    getPeakMissionStatus,
    claimPeakMission,
    PEAK_MISSION_GROUPS,
    PEAK_ATTENDANCE_REWARDS,
    PEAK_STREAK_MILESTONES,
    PEAK_TOTAL_MILESTONES,
    PEAK_MERCHANT_OFFERS,
    PEAK_VIP_THRESHOLDS,
    PEAK_PACK_VOUCHER_COSTS,
    PEAK_UNIVERSAL_SHARD_RARITIES,
    PEAK_DUPLICATE_TO_SHARD_RATE,
    PEAK_CLASS_SHARD_EXCHANGE_RATE,
    PEAK_TRIAL_WEEKLY_LIMIT,
    createPeakCharacter,
    renamePeakCharacter,
    selectPeakCharacter,
    deletePeakCharacter,
    restorePeakCharacter,
    advancePeakCharacter,
    switchPeakDeckPreset,
    copyPeakDeckPreset,
    renamePeakDeckPreset,
    PEAK_CHARACTER_SLOT_LIMIT,
    startPeakTrial,
    choosePeakTrialBoon,
    beginPeakTrialFloor,
    settlePeakTrialFloor,
    failPeakTrialFloor,
    createPeakBattlePlayerPayload,
    getPeakSaveIssue,
    PEAK_STORAGE_KEY,
} from './peak-duel-storage.js';
import { fetchTrustedPeakTime } from './peak-duel-time.js';
import { createPeakSaveScheduler } from './peak-duel-persistence.js';
import { createPeakSaveOwner } from './peak-duel-save-owner.js';
import { PEAK_CARD_PAGE_SIZE, paginatePeakCards, queryPeakCards } from './peak-duel-card-browser.js';
import { analyzePeakDeck } from './peak-duel-deck-analysis.js';
import { PEAK_TRIAL_BOONS, PEAK_TRIAL_FLOORS, applyPeakTrialBoons, buildPeakTrialFloor } from './peak-duel-trial-data.js';
import { getPeakSpriteActionDuration, getPeakSpriteFrameLayout } from './peak-duel-sprite.js';
import { getPeakPackProbabilitySummary } from './peak-duel-pack.js';

const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
const formatTimer = (milliseconds) => {
    if (!milliseconds) return '已满';
    const seconds = Math.ceil(milliseconds / 1000);
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
};
const rarityStyle = (rarity) => `--peak-rarity:${PEAK_CARD_RARITIES[rarity]?.color || '#d9e0e7'}`;
const categoryName = (card) => PEAK_CARD_CATEGORIES[card.category]?.name || card.category;
const rewardText = (reward = {}) => [
    reward.gold ? `${reward.gold.toLocaleString('zh-CN')}金币` : '',
    reward.vouchers ? `${reward.vouchers}代金券` : '',
    reward.stamina ? `${reward.stamina}体力` : '',
].filter(Boolean).join(' · ') || '无';
const formatPackChance = (chance) => {
    const value = Math.max(0, Math.min(100, Number(chance) || 0));
    if (value >= 99.995) return '100%';
    if (value <= .005) return '0%';
    return `${value.toFixed(value < 10 ? 2 : 1).replace(/\.0+$|(?<=\.[0-9])0+$/u, '')}%`;
};
const advancementRequirementText = (card) => {
    const requirement = card?.requiredAdvancement;
    const path = PEAK_ADVANCEMENTS[requirement?.pathId];
    if (!requirement || !path) return '';
    return Number(requirement.minTier) >= 2 ? `${path.secondName}（二转）` : `${path.firstName}（一转）`;
};
const meetsAdvancementRequirement = (card, advancement) => !card?.requiredAdvancement
    || (advancement?.pathId === card.requiredAdvancement.pathId && Number(advancement?.tier) >= Number(card.requiredAdvancement.minTier || 1));
const advancementCombatText = (path, tier = 1) => {
    const combat = path?.combat;
    if (!combat) return '';
    const max = tier >= 2 ? combat.secondMax : combat.max;
    const bonus = tier >= 2 ? combat.secondBonus : combat.firstBonus;
    const trigger = combat.trigger === 'iceDamage' ? '冰属性技能命中'
        : combat.trigger === 'defenseCard' ? '防守牌结算'
            : combat.trigger === 'damageHit' ? '每段伤害命中'
                : '成功施加有害异常';
    const spend = combat.spend === 'iceDamage' ? '下一张冰属性伤害牌'
        : combat.spend === 'debuffedTarget' ? '下一张攻击带有负面状态的目标的伤害牌'
            : '下一张进攻或技能伤害牌';
    const retention = combat.resourceId === 'radiance' ? `；每回合保留${tier >= 2 ? combat.secondShieldRetention : combat.shieldRetention}%护盾` : '';
    return `${trigger}获得1点${combat.resourceName}，上限${max}；满值强化${spend}${bonus}%${retention}`;
};
const conditionText = (card) => {
    if (card.category === 'attack' && card.attackState) {
        const result = PEAK_COMBAT_STATES[card.attackState.to] || card.attackState.to;
        return card.attackState.from.map((state) => `${PEAK_COMBAT_STATES[state] || state}→${result}`).join('　');
    }
    if (card.requiresTargetState?.length) {
        const resultState = card.effects?.reduce((result, effect) => effect.type === 'setState' ? effect.value : result, '') || '';
        return card.requiresTargetState.map((state) => {
            const result = resultState || state;
            return `${PEAK_COMBAT_STATES[state] || state}→${PEAK_COMBAT_STATES[result] || result}`;
        }).join('　');
    }
    const conditions = [];
    if (card.requiresPreviousCard?.length) conditions.push(`本回合先打出${card.requiresPreviousCard.map((category) => PEAK_CARD_CATEGORIES[category]?.name || category).join('或')}牌`);
    if (card.requiresRoundStateApplied?.length) conditions.push(`本回合先将目标变为${card.requiresRoundStateApplied.map((state) => PEAK_COMBAT_STATES[state] || state).join('或')}`);
    if (card.requiresNoPreviousCategory?.length) conditions.push(`本回合此前未打出${card.requiresNoPreviousCategory.map((category) => PEAK_CARD_CATEGORIES[category]?.name || category).join('或')}牌`);
    if (card.requiresDiscardCategories?.length) conditions.push(`手牌中保留至少一张${card.requiresDiscardCategories.map((category) => PEAK_CARD_CATEGORIES[category]?.name || category).join('或')}牌`);
    if (card.requiresLastHandCard) conditions.push('必须作为最后一张手牌打出');
    return conditions.join('；') || '无';
};
const statNames = { physicalAttack: '物理攻击', magicalAttack: '魔法攻击', independentAttack: '独立攻击', strength: '力量', intelligence: '智力', vitality: '体力', spirit: '精神', hp: '生命', mp: 'MP', physicalDefense: '物理防御', magicalDefense: '魔法防御', physicalPenetration: '物理穿透', magicalPenetration: '魔法穿透', elementalPenetration: '元素穿透', physicalCrit: '物理暴击', magicalCrit: '魔法暴击', damageIncrease: '伤害增加', skillAttack: '技能攻击', criticalDamage: '暴击伤害', damageReduction: '伤害减免', allElement: '全属性强化', fireElement: '火属性强化', iceElement: '冰属性强化', lightElement: '光属性强化', darkElement: '暗属性强化', allSkillLevel: '所有技能等级' };
const elementNames = { fire: '火', ice: '冰', light: '光', dark: '暗' };
const PEAK_ATTRIBUTE_GUIDE = Object.freeze([
    {
        title: '基础属性',
        entries: [
            ['力量', '提高物理系卡牌的常用缩放值，并影响部分职业技能。'],
            ['智力', '提高魔法系卡牌的常用缩放值，并影响部分职业技能。'],
            ['体力', '提高生命与部分防御向卡牌的缩放值。'],
            ['精神', '提高MP、魔法防御与部分恢复/辅助卡牌的缩放值。'],
            ['生命', '角色的当前生命与最大生命。生命降至0会输掉战斗。'],
            ['MP', '本回合可用于打出卡牌的资源；每回合按自然恢复值回复。'],
        ],
    },
    {
        title: '攻击与暴击',
        entries: [
            ['物理攻击', '物理伤害卡牌的主要攻击面板。'],
            ['魔法攻击', '魔法伤害卡牌的主要攻击面板。'],
            ['独立攻击', '不属于物理/魔法的独立攻击缩放，部分职业和终结技使用。'],
            ['技能攻击', '只提高技能类卡牌伤害，不影响普通攻击卡。'],
            ['伤害增加', '最终伤害乘区：每1点约提高1%最终伤害。'],
            ['物理/魔法暴击', '对应伤害类型的暴击概率，最高按100%计算。'],
            ['暴击伤害', '暴击时追加的伤害倍率；基础暴击倍率为1.5倍。'],
        ],
    },
    {
        title: '防御与穿透',
        entries: [
            ['物理防御', '降低受到的物理伤害，穿透会先削减有效防御。'],
            ['魔法防御', '降低受到的魔法伤害，穿透会先削减有效防御。'],
            ['伤害减免', '最终减伤乘区，当前系统最多按80%计算。'],
            ['物理/魔法穿透', '按百分比削减对应防御；不会削减元素抗性。'],
            ['元素穿透', '按百分比削减元素抗性，再计算属性强化差值。'],
        ],
    },
    {
        title: '属性强化与技能',
        entries: [
            ['全属性强化', '同时提高火、冰、光、暗属性伤害，是最通用的属性词条。'],
            ['火/冰/光/暗属性强化', '提高对应属性伤害；与全属性强化叠加。'],
            ['所有技能等级', '提高技能卡的有效等级，受卡牌自身等级上限限制。'],
            ['抽牌与自然回蓝', '抽牌数量决定每回合资源上限；自然回蓝决定每回合可用MP。'],
        ],
    },
    {
        title: '回合制说明',
        entries: [
            ['攻击速度、施法速度、移动速度', '巅峰对决为回合制，这些属性当前不参与结算。'],
            ['冷却缩减', '巅峰对决没有传统技能冷却，该属性当前不参与结算。'],
            ['异常状态', '灼烧、中毒、冰冻、易伤、虚弱等会在战斗记录和状态栏中显示层数与持续回合。'],
        ],
    },
]);
const damageTypeNames = { physical: '物理', magical: '魔法', true: '真实' };
const scaledCardNumber = (value, card, level) => Math.round(Number(value || 0) * (1 + Math.max(0, level - 1) * (card.levelGrowth || .06)) * 100) / 100;
const cardRangeValue = (effect, level, minKey, maxKey) => Math.round((Number(effect[minKey]) + (Number(effect[maxKey]) - Number(effect[minKey])) * Math.max(0, Math.min(9, level - 1)) / 9) * 10) / 10;
const cardRangeOrFixedValue = (effect, level, minKey, maxKey, fixedKey = 'value') => Math.round(
    Object.prototype.hasOwnProperty.call(effect, minKey)
        ? cardRangeValue(effect, level, minKey, maxKey)
        : Number(effect[fixedKey]) || 0
);
const valueFormula = (effect, card, level) => [effect.base ? String(scaledCardNumber(effect.base, card, level)) : '', ...Object.entries(effect.scaling || {}).map(([stat, value]) => `${statNames[stat] || stat}×${scaledCardNumber(value, card, level)}`)].filter(Boolean).join(' + ') || '0';
const queueMechanicBonusText = (mechanic) => mechanic.damageByCategoryCount
    ? Object.entries(mechanic.damageByCategoryCount).map(([count, bonus]) => `${count}种类别提高${Math.round(bonus * 100)}%`).join('、')
    : `伤害提高${Math.round((mechanic.damageBonus || 0) * 100)}%`;
const queueMechanicRewardText = (reward, level) => {
    if (!reward) return '';
    if (reward.type === 'restoreMp') return `，恢复${cardRangeValue(reward, level, 'minValue', 'maxValue')}MP`;
    if (reward.type === 'shield') return `，获得${cardRangeValue(reward, level, 'minValue', 'maxValue')}点护盾`;
    if (reward.type === 'status') return `，施加${reward.stacks || 1}层${PEAK_STATUS_EFFECTS[reward.status]?.name || reward.status}`;
    return '';
};
const queueMechanicDetail = (card, level) => `${card.queueMechanic.description}时：${queueMechanicBonusText(card.queueMechanic)}${queueMechanicRewardText(card.queueMechanic.reward, level)}`;
const effectText = (card, level = 1) => [...getPeakCardEffects(card, level).map((effect) => {
    if (effect.type === 'damage') return `${effect.hitCount ? `第${effect.hitIndex}/${effect.hitCount}段：` : ''}造成 ${valueFormula(effect, card, level)} 点${effect.element ? `${elementNames[effect.element]}属性` : ''}${damageTypeNames[effect.damageType || 'physical']}伤害${effect.onHitStatus ? `，独立判定${effect.onHitStatus.chance}%几率施加${PEAK_STATUS_EFFECTS[effect.onHitStatus.status]?.name || effect.onHitStatus.status}` : ''}`;
    if (effect.type === 'shield') return `获得 ${valueFormula(effect, card, level)} 点护盾`;
    if (effect.type === 'conditionalShield') {
        const value = cardRangeValue(effect, level, 'minValue', 'maxValue');
        if (effect.rule === 'handCount') return `每张手牌追加${value}点护盾，最多计算${effect.countCap}张，额外护盾上限为最大生命${effect.capPercent}%`;
        if (effect.rule === 'missingHpPercent') return `追加已损生命${value}%的护盾，上限为最大生命${effect.capPercent}%`;
        if (effect.rule === 'currentMpPercent') return `追加当前MP${value}%的护盾，上限为最大生命${effect.capPercent}%`;
        return `每种敌方负面状态追加${value}点护盾，最多计算${effect.countCap}种，上限为最大生命${effect.capPercent}%`;
    }
    if (effect.type === 'guard') return `接下来${effect.uses}次受到伤害降低${effect.reduction}%${effect.counterRatio ? `，反震减免量的${effect.counterRatio}%` : ''}${effect.restoreMp ? `，每次触发恢复${effect.restoreMp}MP` : ''}，持续${effect.duration}回合`;
    if (effect.type === 'statusWard') return `抵消接下来${effect.value}次有害异常，持续${effect.duration}回合`;
    if (effect.type === 'lastStand') return `${effect.duration}回合内抵挡一次致命伤，保留1点生命并获得最大生命${effect.shieldPercent}%的护盾`;
    if (effect.type === 'manaBarrier') return `接下来${effect.uses}次受伤时消耗MP吸收${effect.ratio}%伤害，持续${effect.duration}回合`;
    if (effect.type === 'thorns') return `接下来${effect.uses}次受伤时反弹${effect.ratio}%真实伤害，持续${effect.duration}回合`;
    if (effect.type === 'damageCap') return `接下来${effect.uses}次受到的单次伤害不超过最大生命${effect.ratio}%，持续${effect.duration}回合`;
    if (effect.type === 'shieldBreak') return `护盾被击破时恢复${effect.healPercent}%已损生命${effect.draw ? `并抽${effect.draw}张牌` : ''}，可触发${effect.uses}次`;
    if (effect.type === 'heal') return `恢复 ${valueFormula(effect, card, level)} 点生命`;
    if (effect.type === 'healMissing') return `恢复已损生命的 ${Math.min(30, scaledCardNumber(effect.value, card, level))}%`;
    if (effect.type === 'restoreMp') return `恢复 ${Math.round(scaledCardNumber(effect.base, card, level))} 点MP`;
    if (effect.type === 'setState') return effect.value === 'stunned' ? '使目标眩晕：下一张牌除状态变化外的效果无效' : `使目标变为${PEAK_COMBAT_STATES[effect.value] || effect.value}`;
    if (effect.type === 'buff') return `${statNames[effect.stat] || effect.stat}提高 ${effect.percent ? `(${effect.value} + 基础属性的${effect.percent}%) × 等级倍率` : Math.max(1, Math.round(scaledCardNumber(effect.value, card, level)))}，持续${effect.duration}回合${effect.dynamic?.description ? `；${effect.dynamic.description}` : ''}${effect.stat === 'vitality' ? '；同步增加生命上限与物防，不直接回血' : effect.stat === 'spirit' ? '；同步增加MP上限与魔防，不直接回蓝' : ''}`;
    if (effect.type === 'status') return `${effect.target === 'self' ? '自身获得' : '施加'}${PEAK_STATUS_EFFECTS[effect.status]?.name || effect.status}${PEAK_STATUS_EFFECTS[effect.status]?.maxStacks === 1 ? '（不叠加强度）' : `${effect.stacks || 1}层`}，持续${effect.duration || 1}回合`;
    if (effect.type === 'cleanse') return `净化${effect.value || 1}个负面状态`;
    if (effect.type === 'draw') return `抽取${effect.value || 1}张卡牌`;
    if (effect.type === 'generateCard') return `获得1张临时Lv.${level}${PEAK_CARD_BY_ID[effect.cardId]?.name || effect.cardId}`;
    if (effect.type === 'delayedBurst') return `埋下延迟标记；后续命中引爆并造成 ${valueFormula(effect, card, level)} 点${damageTypeNames[effect.damageType || 'physical']}伤害`;
    if (effect.type === 'nextTurnDraw') return `下回合额外抽取${effect.value || 1}张卡牌`;
    if (effect.type === 'scheduleCard') return (effect.delays || [1]).map((delay) => `${delay === 1 ? '下一回合' : delay === 2 ? '下下回合' : `之后第${delay}回合`}获得1张Lv.${effect.level || 1}${PEAK_CARD_BY_ID[effect.cardId]?.name || effect.cardId}`).join('；');
    if (effect.type === 'grantAndScheduleCard') return `立即获得1张Lv.${level}${PEAK_CARD_BY_ID[effect.cardId]?.name || effect.cardId}，之后两个回合开始时各再获得1张同等级卡牌`;
    if (effect.type === 'borrowDraw') return `抽取${effect.draw || 2}张牌；下回合抽牌数减少${effect.penalty || 0}，最低为0`;
    if (effect.type === 'advanceConsume') return `抽取${effect.draw || 1}张牌；若为进攻或技能牌，其伤害提高${cardRangeValue(effect, level, 'minDamageBonus', 'maxDamageBonus')}%；下回合少抽${effect.penalty || 0}张`;
    if (effect.type === 'sacrificeCurrentHp') return `消耗当前生命的${cardRangeOrFixedValue(effect, level, 'minValue', 'maxValue')}%`;
    if (effect.type === 'roundDamageBoost') return `本回合${damageTypeNames[effect.damageType] || '全部'}伤害提高${cardRangeValue(effect, level, 'minValue', 'maxValue')}%`;
    if (effect.type === 'classCategoryRoundDamageBoost') return `本回合职业专属${(effect.categories || []).map((category) => PEAK_CARD_CATEGORIES[category]?.name || category).join('与')}牌伤害提高${cardRangeValue(effect, level, 'minValue', 'maxValue')}%`;
    if (effect.type === 'nextTurnClassCategoryDamageBoost') return `下一回合职业专属${(effect.categories || []).map((category) => PEAK_CARD_CATEGORIES[category]?.name || category).join('与')}牌伤害提高${cardRangeValue(effect, level, 'minValue', 'maxValue')}%`;
    if (effect.type === 'hatTrick') return `队列中其他牌类别互不重复时：进攻/技能伤害提高${cardRangeValue(effect, level, 'minDamageBoost', 'maxDamageBoost')}%，防守获得${cardRangeValue(effect, level, 'minShield', 'maxShield')}点护盾，增益恢复${cardRangeValue(effect, level, 'minMp', 'maxMp')}MP`;
    if (effect.type === 'roundPenetration') return `本回合物理穿透与魔法穿透提高${cardRangeValue(effect, level, 'minValue', 'maxValue')}%`;
    if (effect.type === 'drawSword') return `直到本局结束：技能牌伤害为0但其他效果正常；进攻牌伤害提高${cardRangeValue(effect, level, 'minAttackBonus', 'maxAttackBonus')}%`;
    if (effect.type === 'roundTradeoff') return `本回合伤害降低${cardRangeValue(effect, level, 'minDamagePenalty', 'maxDamagePenalty')}%，治疗与护盾提高${cardRangeValue(effect, level, 'minSustainBonus', 'maxSustainBonus')}%`;
    if (effect.type === 'convertRoundDamage') return `本回合${damageTypeNames[effect.from]}伤害转为${damageTypeNames[effect.to]}伤害，并提高${cardRangeValue(effect, level, 'minBonus', 'maxBonus')}%`;
    if (effect.type === 'disruptCards') return effect.all ? `对方下回合所有增益/防守牌无效${effect.discardAtTurnEnd ? '，回合结束时丢弃手牌中全部此类卡牌' : ''}` : `对方下回合前${effect.charges || 1}张增益/防守牌无效`;
    if (effect.type === 'debuffImmunity') return '从现在起至下一回合结束，免疫任何来源施加的负面状态';
    if (effect.type === 'phoenixWard') return `${effect.duration || 3}回合内首次受到致命伤害时无视该次伤害，并清除全部负面状态`;
    if (effect.type === 'plantBomb') return `为对手安放蹦蹦炸弹：持有者回合开始时${effect.chance || 25}%几率爆炸，造成其最大生命${cardRangeValue(effect, level, 'minRatio', 'maxRatio')}%伤害${effect.bossFactor ? '（Boss减半）' : ''}，未爆炸则传给对面并持续循环`;
    if (effect.type === 'unstableMagic') return `本回合每张${PEAK_CARD_CATEGORIES[effect.category || 'skill']?.name || effect.category}牌随机获得${cardRangeValue(effect, level, 'minLow', 'maxLow')}%~${cardRangeValue(effect, level, 'minHigh', 'maxHigh')}%额外伤害，并按额外伤害的${cardRangeValue(effect, level, 'minLeech', 'maxLeech')}%恢复生命；额外伤害为负时改为扣血，最多扣至剩余1点生命`;
    if (effect.type === 'nullifyInsurance') return `本回合下一张因眩晕或卡牌干扰而无效的非特殊牌返回手牌，并返还${cardRangeValue(effect, level, 'minRefund', 'maxRefund')}%MP消耗`;
    if (effect.type === 'overhealToShield') return `本回合后续溢出治疗的${cardRangeValue(effect, level, 'minRatio', 'maxRatio')}%转化为护盾`;
    if (effect.type === 'transferDebuffs') return `移除自身最早获得的${Math.round(cardRangeValue(effect, level, 'minCount', 'maxCount'))}种负面状态并转移给对手${effect.bossFactor ? '，对Boss转移层数减半' : ''}`;
    if (effect.type === 'spentMpToShield') return `回合结束时，将后续进攻/技能牌消耗MP的${cardRangeValue(effect, level, 'minRatio', 'maxRatio')}%转化为护盾，上限为最大生命的${cardRangeValue(effect, level, 'minCap', 'maxCap')}%`;
    if (effect.type === 'damageEcho') return `本回合下一张造成伤害的进攻或技能牌产生${cardRangeValue(effect, level, 'minRatio', 'maxRatio')}%伤害余响；不触发暴击、状态、异常、反伤或延迟标记`;
    if (effect.type === 'soloQueueRecovery') return `若本回合队列中只有此牌，恢复${cardRangeValue(effect, level, 'minValue', 'maxValue')}MP`;
    if (effect.type === 'handReserveShield') return `回合结束时，每张保留手牌转化为${cardRangeValue(effect, level, 'minPerCard', 'maxPerCard')}点护盾，最多计算${effect.cap || 6}张`;
    if (effect.type === 'forecastGuard') return `对方下一张造成伤害的进攻/技能牌伤害降低${cardRangeValue(effect, level, 'minReduction', 'maxReduction')}%，减免量的${cardRangeValue(effect, level, 'minShieldRatio', 'maxShieldRatio')}%转化为自身护盾`;
    if (effect.type === 'scheduleMissingHpHeal') return `记录当前已损生命；下回合开始恢复其中${cardRangeValue(effect, level, 'minRatio', 'maxRatio')}%，最多恢复最大生命${effect.capPercent || 15}%`;
    if (effect.type === 'rewindLastCard') return '回合结束时记录最后打出的非特殊牌；下回合获得其同等级临时复制，使用后移出战斗';
    if (effect.type === 'nextCardTrueDamage') return `本回合下一张造成伤害的进攻/技能牌全部转为真实伤害，最终伤害降低${cardRangeValue(effect, level, 'minPenalty', 'maxPenalty')}%`;
    if (effect.type === 'shieldVanguard') return `本回合对护盾伤害提高${cardRangeValue(effect, level, 'minShieldBonus', 'maxShieldBonus')}%；破盾后剩余行动伤害提高${cardRangeValue(effect, level, 'minBreakBonus', 'maxBreakBonus')}%`;
    if (effect.type === 'stealShield') return `夺取目标当前护盾的${cardRangeValue(effect, level, 'minRatio', 'maxRatio')}%转化为自身护盾，Boss减半`;
    if (effect.type === 'discardHandDamage') return `丢弃全部剩余手牌，每张造成目标当前生命${cardRangeValue(effect, level, 'minRatio', 'maxRatio')}%的伤害，单张最低${effect.minimum || 20}，Boss减半`;
    if (effect.type === 'copyPreviousCard') return '复制本回合此前打出的上一张进攻牌或技能牌到手牌';
    if (effect.type === 'drawCategory') return `从牌库检索${effect.value || 1}张${PEAK_CARD_CATEGORIES[effect.category]?.name || effect.category}牌`;
    if (effect.type === 'discardForRandomCategories') return `随机丢弃1张${(effect.discardCategories || []).map((category) => PEAK_CARD_CATEGORIES[category]?.name || category).join('或')}牌，从牌库随机获得最多${effect.draw || 2}张${(effect.drawCategories || []).map((category) => PEAK_CARD_CATEGORIES[category]?.name || category).join('或')}牌`;
    if (effect.type === 'recoverDiscard') return `从弃牌堆回收最近的${effect.value || 1}张${PEAK_CARD_CATEGORIES[effect.category]?.name || ''}牌`;
    if (effect.type === 'shieldToMp') return `将当前护盾的${cardRangeOrFixedValue(effect, level, 'minValue', 'maxValue')}%转化为MP`;
    if (effect.type === 'retainShield') return `下一回合保留${Math.min(60, scaledCardNumber(effect.value, card, level))}%当前护盾`;
    if (effect.type === 'empower') return `下一张${PEAK_CARD_CATEGORIES[effect.category]?.name || effect.category}牌${effect.category === 'defense' ? '的护盾和治疗' : '伤害'}提高${Math.min(40, scaledCardNumber(effect.value, card, level))}%`;
    if (effect.type === 'spellCharge') return `积蓄${effect.value || 1}层法力充能（上限${effect.max || 5}层），充能会保留到后续回合`;
    if (effect.type === 'spellChargeSpend') return `引爆全部法力充能：每层使本牌伤害提高${effect.perCharge || 0}%，结算后充能清零`;
    if (effect.type === 'timedFuse') return `在对手身上埋下延迟引信，${effect.turns || 2}回合后于其回合开始时引爆，造成${valueFormula(effect, card, level)}点${elementNames[effect.element] ? `${elementNames[effect.element]}属性` : ''}伤害`;
    if (effect.type === 'vowGain') return `积攒${effect.value || 1}层誓约（上限${effect.maxStacks || 5}层），誓约会保留到后续回合`;
    if (effect.type === 'vowSpend') return `倾泻全部誓约：每层使本牌伤害提高${effect.perStack || 0}%，结算后誓约清零`;
    if (effect.type === 'bleedAmplify') return `目标每层流血使本牌伤害提高${effect.perStack || 0}%，最多计算${effect.maxStacks || 5}层`;
    if (effect.type === 'comboEscalate') return `本回合连续打出的进攻牌每张使本牌伤害提高${effect.perCard || 0}%（最多${effect.maxCards || 4}张），中途打出非进攻牌则连段中断`;
    if (effect.type === 'scheduleBlessing') {
        const payload = effect.blessingType === 'shield' ? `获得${effect.value || 0}点护盾`
            : effect.blessingType === 'cleanse' ? `清除${effect.value || 1}层负面状态`
                : `恢复${effect.value || 0}点生命`;
        return `埋设${effect.name || '祝福'}：${effect.turns || 2}回合后于自己回合开始时${payload}`;
    }
    if (effect.type === 'vowShield') return `倾泻全部誓约：每层转化为${effect.shieldPerStack || 0}点护盾（最多计算${effect.maxStacks || 5}层），结算后誓约清零`;
    if (effect.type === 'bleedHarvest') return `收割目标全部流血：每层立即造成${effect.damagePerStack || 0}点真实伤害（最多计算${effect.maxStacks || 5}层），结算后流血清除`;
    if (effect.type === 'arcaneCascade') return `引爆全部法力充能：每层追加${effect.damagePerCharge || 0}点${elementNames[effect.element] ? `${elementNames[effect.element]}属性` : ''}级联伤害（最多计算${effect.maxCharges || 5}层），结算后充能清零`;
    if (effect.type === 'blessingHasten') return `全部待兑现祝福提前${effect.turns || 1}回合，且兑现值提高${effect.bonusPercent || 0}%`;
    if (effect.type === 'conditionalRouteResource') {
        if (effect.condition === 'queueCategoryCount') return `队列中每张${PEAK_CARD_CATEGORIES[effect.category]?.name || effect.category}牌提供${effect.perCard || 1}层路线资源，最多${cardRangeOrFixedValue(effect, level, 'minCap', 'maxCap', 'maxValue')}层`;
        const value = cardRangeOrFixedValue(effect, level, 'minValue', 'maxValue');
        if (effect.condition === 'actorShield') return `当前护盾达到最大生命${Math.round((effect.threshold || 0) * 100)}%时获得${value}层路线资源`;
        return `目标带有${(effect.statuses || []).map((status) => PEAK_STATUS_EFFECTS[status]?.name || status).join('或')}时获得${value}层路线资源`;
    }
    if (effect.type === 'filteredRecall') return `从弃牌堆${effect.copy ? '临时复制' : '回收'}最近的${cardRangeOrFixedValue(effect, level, 'minValue', 'maxValue')}张符合路线条件的牌${effect.exhaustAfterUse ? '，使用后移出战斗' : ''}`;
    if (effect.type === 'statusExtend') return `${(effect.statuses || []).map((status) => PEAK_STATUS_EFFECTS[status]?.name || status).join('与')}增加${cardRangeOrFixedValue(effect, level, 'minStacks', 'maxStacks', 'stacks')}层并延长${cardRangeOrFixedValue(effect, level, 'minDuration', 'maxDuration', 'duration')}回合${effect.gainRoutePerStatus ? `，每种获得${effect.gainRoutePerStatus}层路线资源` : ''}`;
    if (effect.type === 'routeResourcePreserve') return `接下来${cardRangeOrFixedValue(effect, level, 'minUses', 'maxUses', 'uses')}次触发满层路线增伤后不消耗路线资源`;
    if (effect.type === 'statusEcho') return `接下来${cardRangeOrFixedValue(effect, level, 'minUses', 'maxUses', 'uses')}次施加${(effect.statuses || []).map((status) => PEAK_STATUS_EFFECTS[status]?.name || status).join('或')}时额外增加${cardRangeOrFixedValue(effect, level, 'minBonusStacks', 'maxBonusStacks', 'bonusStacks')}层${effect.durationBonus ? `并延长${effect.durationBonus}回合` : ''}`;
    if (effect.type === 'statusTransmute') return `将目标层数最高的${Object.keys(effect.mapping || {}).map((status) => PEAK_STATUS_EFFECTS[status]?.name || status).join('或')}转换为另一种，保留层数与持续时间`;
    if (effect.type === 'statusHarvest') return `收割目标最多${effect.maxStacks || 1}层${(effect.statuses || []).map((status) => PEAK_STATUS_EFFECTS[status]?.name || status).join('或')}${effect.damagePerStack ? `，每层造成${effect.damagePerStack}点${effect.damageType === 'true' ? '真实' : ''}伤害` : ''}${effect.restoreRoutePerStack ? `，每层转化${effect.restoreRoutePerStack}层路线资源` : ''}${effect.restoreMpPerStack ? `并恢复${effect.restoreMpPerStack}MP` : ''}`;
    if (effect.type === 'shieldStrike') return `以当前护盾为基准造成${cardRangeValue(effect, level, 'minRatio', 'maxRatio')}%真实伤害，最多计算最大生命${effect.capPercent || 0}%的护盾${effect.consumePercent ? `，并消耗当前护盾的${effect.consumePercent}%` : ''}${effect.bossFactor ? '，对Boss伤害减半' : ''}`;
    return effect.type;
}), ...(card.conditionalDamage?.description ? [card.conditionalDamage.description] : []),
...(card.queueMechanic ? [queueMechanicDetail(card, level)] : []),
...(card.requiresQueueLast ? ['必须位于队列最后'] : []),
...(card.positionScaling ? [`此前每张${PEAK_CARD_CATEGORIES[card.positionScaling.category]?.name || card.positionScaling.category}牌使伤害提高${card.positionScaling.perPrior}%，最多${card.positionScaling.maxStacks}张`] : []),
...(card.styleFollowUp ? ['根据前一张进攻牌的攻击流派触发不同追击效果'] : []),
...(card.consumeStyleChain ? [`此前连续${card.consumeStyleChain.threshold}张${card.consumeStyleChain.style}流派进攻牌时，终结伤害提高${card.consumeStyleChain.damageBonus}%`] : []),
...(card.recycleOnResolve ? [`首次结算后进入追击区；条件达成返回手牌，再次使用伤害降低${card.recycleOnResolve.damagePenalty}%`] : [])].join('；');
export const effectFormulaLines = (card, level = 1) => {
    card = { ...card, effects: getPeakCardEffects(card, level) };
    const multiHitGroup = card.effects.find((e) => e.type === 'damage' && e.hitCount && e.hitCount > 1);
    const lines = card.effects.flatMap((effect) => {
        if (effect.type === 'damage') {
            if (effect.hitCount && effect.hitCount > 1 && effect.hitIndex > 1) return [];
            return [`${effect.hitCount ? `第${effect.hitIndex}/${effect.hitCount}段` : damageTypeNames[effect.damageType || 'physical']}伤害 = ${valueFormula(effect, card, level)}${effect.element ? `（${elementNames[effect.element]}）` : ''}${effect.damageType === 'true' ? '；无视物理/魔法防御与伤害减免' : ''}${effect.onHitStatus ? `；独立判定${effect.onHitStatus.chance}%${PEAK_STATUS_EFFECTS[effect.onHitStatus.status]?.name || effect.onHitStatus.status}` : ''}`];
        }
        if (effect.type === 'shield') return [`护盾 = ${valueFormula(effect, card, level)}`];
        if (effect.type === 'conditionalShield') {
            const value = cardRangeValue(effect, level, 'minValue', 'maxValue');
            if (effect.rule === 'handCount') return [`额外护盾 = min(手牌数, ${effect.countCap}) × ${value}，上限最大生命 × ${effect.capPercent}%`];
            if (effect.rule === 'missingHpPercent') return [`额外护盾 = min(已损生命 × ${value}%, 最大生命 × ${effect.capPercent}%)`];
            if (effect.rule === 'currentMpPercent') return [`额外护盾 = min(当前MP × ${value}%, 最大生命 × ${effect.capPercent}%)`];
            return [`额外护盾 = min(敌方负面状态种类, ${effect.countCap}) × ${value}，上限最大生命 × ${effect.capPercent}%`];
        }
        if (effect.type === 'guard') return [`格挡 = 受到伤害 × ${effect.reduction}%（${effect.uses}次，${effect.duration}回合）${effect.counterRatio ? `；真实反震 = 格挡量 × ${effect.counterRatio}%` : ''}${effect.restoreMp ? `；触发恢复${effect.restoreMp}MP` : ''}`];
        if (effect.type === 'statusWard') return [`异常屏障 = 抵消${effect.value}次有害异常（${effect.duration}回合）`];
        if (effect.type === 'lastStand') return [`不屈 = 致命伤后保留1生命 + 最大生命 × ${effect.shieldPercent}%护盾（${effect.duration}回合内1次）`];
        if (effect.type === 'manaBarrier') return [`魔力护壁吸收 = min(当前MP, 本次伤害 × ${effect.ratio}%)（${effect.uses}次，${effect.duration}回合）`];
        if (effect.type === 'thorns') return [`荆棘真实伤害 = 本次承受伤害 × ${effect.ratio}%（${effect.uses}次，${effect.duration}回合）`];
        if (effect.type === 'damageCap') return [`单次伤害上限 = 最大生命 × ${effect.ratio}%（${effect.uses}次，${effect.duration}回合）`];
        if (effect.type === 'shieldBreak') return [`护盾击破回响 = 已损生命 × ${effect.healPercent}%${effect.draw ? ` + 抽${effect.draw}张牌` : ''}（${effect.uses}次）`];
        if (effect.type === 'heal') return [`生命恢复 = ${valueFormula(effect, card, level)}`];
        if (effect.type === 'healMissing') return [`生命恢复 = 已损生命 × ${Math.min(30, scaledCardNumber(effect.value, card, level))}%`];
        if (effect.type === 'restoreMp') return [`MP恢复 = ${scaledCardNumber(effect.base, card, level)}`];
        if (effect.type === 'buff') {
            const base = Math.max(1, Math.round(scaledCardNumber(effect.value, card, level)));
            const dynamic = effect.dynamic ? `；条件触发额外 +${Math.max(1, Math.round(scaledCardNumber(effect.dynamic.bonus, card, level)))}` : '';
            const gain = effect.percent ? `(${effect.value} + 不含临时增益的${statNames[effect.stat]} × ${effect.percent}%) × ${Number((1 + (level - 1) * card.levelGrowth).toFixed(3))}，取整` : `+${base}`;
            return [`${statNames[effect.stat] || effect.stat} = ${gain}${dynamic}（${effect.duration}回合）`,
                ...(effect.stat === 'vitality' ? ['每点体力额外增加12生命上限、2物防；不直接回血，到期回落'] : []),
                ...(effect.stat === 'spirit' ? ['每点精神额外增加1.75 MP上限、2魔防；不直接回蓝，到期回落'] : [])];
        }
        if (effect.type === 'status') {
            const statusLine = `${PEAK_STATUS_EFFECTS[effect.status]?.name || effect.status} = ${PEAK_STATUS_EFFECTS[effect.status]?.maxStacks === 1 ? '不叠加强度，刷新持续时间' : `${effect.stacks || 1}层`} × ${effect.duration || 1}回合`;
            if (effect.status === 'burn') return [statusLine, '回合开始伤害 = max(当前生命 × 层数 × 1% × 物理减伤率, 单位等级 × 0.3)；结算后层数减半'];
            if (effect.status === 'poison') return [statusLine, '回合开始伤害 = max(最大生命 × 层数 × 0.6% × 魔法减伤率, 单位等级 × 0.25)；结算后层数减半'];
            if (effect.status === 'frozen') return [statusLine, '造成伤害 = 原伤害 × (1 - 层数 × 3%)；自身回合结束时层数减半'];
            return [statusLine];
        }
        if (effect.type === 'draw') return [`抽牌 = ${effect.value || 1}张`];
        if (effect.type === 'generateCard') return [`衍生牌 = 1张临时Lv.${level}${PEAK_CARD_BY_ID[effect.cardId]?.name || effect.cardId}；使用后消耗`];
        if (effect.type === 'delayedBurst') return [`延迟爆发 = ${valueFormula(effect, card, level)}；由后续任意一次卡牌命中引爆`];
        if (effect.type === 'nextTurnDraw') return [`下回合抽牌数 = 基础抽牌数 + ${effect.value || 1}`];
        if (effect.type === 'scheduleCard') return (effect.delays || [1]).map((delay) => `第${delay}个后续回合：获得1张Lv.${effect.level || 1}${PEAK_CARD_BY_ID[effect.cardId]?.name || effect.cardId}`);
        if (effect.type === 'grantAndScheduleCard') return [`当前回合：获得1张Lv.${level}${PEAK_CARD_BY_ID[effect.cardId]?.name || effect.cardId}`, `后续第1、2回合：各获得1张同等级${PEAK_CARD_BY_ID[effect.cardId]?.name || effect.cardId}`];
        if (effect.type === 'borrowDraw') return [`本回合抽牌 = +${effect.draw || 2}；下回合抽牌 = max(0, 应抽牌数 - ${effect.penalty || 0})`];
        if (effect.type === 'advanceConsume') return [`新抽进攻/技能牌伤害 = 结算伤害 × (1 + ${cardRangeValue(effect, level, 'minDamageBonus', 'maxDamageBonus')}%)`, `下回合抽牌 = max(0, 应抽牌数 - ${effect.penalty || 0})`];
        if (effect.type === 'sacrificeCurrentHp') return [`生命消耗 = 当前生命 × ${cardRangeOrFixedValue(effect, level, 'minValue', 'maxValue')}%（不会因此降至0）`];
        if (effect.type === 'roundDamageBoost') return [`本回合${damageTypeNames[effect.damageType] || '全部'}伤害 = 结算伤害 × (1 + ${cardRangeValue(effect, level, 'minValue', 'maxValue')}%)`];
        if (effect.type === 'classCategoryRoundDamageBoost') return [`职业专属${(effect.categories || []).map((category) => PEAK_CARD_CATEGORIES[category]?.name || category).join('与')}牌伤害 = 结算伤害 × (1 + ${cardRangeValue(effect, level, 'minValue', 'maxValue')}%)`];
        if (effect.type === 'nextTurnClassCategoryDamageBoost') return [`下一回合职业专属${(effect.categories || []).map((category) => PEAK_CARD_CATEGORIES[category]?.name || category).join('与')}牌伤害 = 结算伤害 × (1 + ${cardRangeValue(effect, level, 'minValue', 'maxValue')}%)`];
        if (effect.type === 'hatTrick') return [`触发条件 = 除本牌外每种类别最多1张`, `进攻/技能伤害倍率 = 1 + ${cardRangeValue(effect, level, 'minDamageBoost', 'maxDamageBoost')}%`, `防守奖励 = ${cardRangeValue(effect, level, 'minShield', 'maxShield')}护盾；增益奖励 = ${cardRangeValue(effect, level, 'minMp', 'maxMp')}MP`];
        if (effect.type === 'roundPenetration') return [`本回合物理/魔法穿透 = +${cardRangeValue(effect, level, 'minValue', 'maxValue')}%`];
        if (effect.type === 'drawSword') return ['技能牌伤害 = 0；非伤害效果照常结算', `进攻牌伤害 = 结算伤害 × (1 + ${cardRangeValue(effect, level, 'minAttackBonus', 'maxAttackBonus')}%)`, '持续时间 = 本次战斗结束'];
        if (effect.type === 'roundTradeoff') return [`本回合伤害倍率 = 1 - ${cardRangeValue(effect, level, 'minDamagePenalty', 'maxDamagePenalty')}%`, `治疗/护盾倍率 = 1 + ${cardRangeValue(effect, level, 'minSustainBonus', 'maxSustainBonus')}%`];
        if (effect.type === 'convertRoundDamage') return [`伤害类型：${damageTypeNames[effect.from]} → ${damageTypeNames[effect.to]}`, `转换后伤害 = 结算伤害 × (1 + ${cardRangeValue(effect, level, 'minBonus', 'maxBonus')}%)`];
        if (effect.type === 'disruptCards') return [effect.all ? '封锁次数 = 下回合全部增益/防守牌' : `封锁次数 = 下回合前${effect.charges || 1}张增益/防守牌`, ...(effect.discardAtTurnEnd ? ['回合结束：丢弃剩余增益/防守手牌'] : [])];
        if (effect.type === 'debuffImmunity') return ['负面免疫 = 当前敌方行动阶段 + 下一自身回合'];
        if (effect.type === 'phoenixWard') return [`致命免伤 = ${effect.charges || 1}次 × ${effect.duration || 3}回合；触发时清除全部负面状态`];
        if (effect.type === 'plantBomb') return [`爆炸判定 = 持有者回合开始时 ${effect.chance || 25}%`, `爆炸伤害 = 持有者最大生命 × ${cardRangeValue(effect, level, 'minRatio', 'maxRatio')}%${effect.bossFactor ? ' × Boss系数50%' : ''}`, '未爆炸：炸弹转移给对面，下个回合开始重新判定'];
        if (effect.type === 'unstableMagic') return [`额外伤害 = 结算伤害 × random(${cardRangeValue(effect, level, 'minLow', 'maxLow')}%, ${cardRangeValue(effect, level, 'minHigh', 'maxHigh')}%)`, `生命转化 = 额外伤害 × ${cardRangeValue(effect, level, 'minLeech', 'maxLeech')}%（为负时扣血，下限剩余1点生命）`];
        if (effect.type === 'nullifyInsurance') return [`失效牌返回手牌；MP返还 = 该牌实际消耗 × ${cardRangeValue(effect, level, 'minRefund', 'maxRefund')}%`, `触发次数 = ${effect.uses || 1}次/回合`];
        if (effect.type === 'overhealToShield') return [`新增护盾 = max(0, 治疗量 - 实际恢复量) × ${cardRangeValue(effect, level, 'minRatio', 'maxRatio')}%`];
        if (effect.type === 'transferDebuffs') return [`转移数量 = ${Math.round(cardRangeValue(effect, level, 'minCount', 'maxCount'))}种`, `转移层数 = 原剩余层数${effect.bossFactor ? ' × Boss系数50%' : ''}；持续时间保持不变`];
        if (effect.type === 'spentMpToShield') return [`回合末护盾 = min(后续进攻/技能牌实际耗蓝 × ${cardRangeValue(effect, level, 'minRatio', 'maxRatio')}%, 最大生命 × ${cardRangeValue(effect, level, 'minCap', 'maxCap')}%)`];
        if (effect.type === 'damageEcho') return [`余响伤害 = 该牌每段最终伤害 × ${cardRangeValue(effect, level, 'minRatio', 'maxRatio')}%`, `仅强化下一张有效进攻/技能牌；余响不触发附加机制`];
        if (effect.type === 'soloQueueRecovery') return [`队列仅含本牌时：MP恢复 = ${cardRangeValue(effect, level, 'minValue', 'maxValue')}`];
        if (effect.type === 'handReserveShield') return [`回合末护盾 = min(保留手牌数, ${effect.cap || 6}) × ${cardRangeValue(effect, level, 'minPerCard', 'maxPerCard')}`];
        if (effect.type === 'forecastGuard') return [`目标下一张伤害牌 = 原伤害 × (1 - ${cardRangeValue(effect, level, 'minReduction', 'maxReduction')}%)`, `新增护盾 = 本牌总减免量 × ${cardRangeValue(effect, level, 'minShieldRatio', 'maxShieldRatio')}%`];
        if (effect.type === 'scheduleMissingHpHeal') return [`记录恢复量 = min(当前已损生命 × ${cardRangeValue(effect, level, 'minRatio', 'maxRatio')}%, 最大生命 × ${effect.capPercent || 15}%)`, `第${effect.turns || 1}个后续自身回合开始时恢复`];
        if (effect.type === 'rewindLastCard') return ['回溯对象 = 本回合最后结算的非特殊牌', '下回合获得同等级临时复制；临时复制使用后移出战斗'];
        if (effect.type === 'nextCardTrueDamage') return ['下一张有效进攻/技能牌：全部伤害类型 → 真实', `最终伤害 = 原结算伤害 × (1 - ${cardRangeValue(effect, level, 'minPenalty', 'maxPenalty')}%)`];
        if (effect.type === 'shieldVanguard') return [`额外护盾伤害 = 本次伤害 × ${cardRangeValue(effect, level, 'minShieldBonus', 'maxShieldBonus')}%`, `破盾后续伤害 = 结算伤害 × (1 + ${cardRangeValue(effect, level, 'minBreakBonus', 'maxBreakBonus')}%)`];
        if (effect.type === 'stealShield') return [`转化护盾 = 目标当前护盾 × ${cardRangeValue(effect, level, 'minRatio', 'maxRatio')}%${effect.bossFactor ? ' × Boss系数50%' : ''}`];
        if (effect.type === 'discardHandDamage') return [`单张伤害 = max(目标当前生命 × ${cardRangeValue(effect, level, 'minRatio', 'maxRatio')}%, ${effect.minimum || 20})${effect.bossFactor ? ' × Boss系数50%' : ''}`];
        if (effect.type === 'copyPreviousCard') return ['复制对象 = 本回合此前最后打出的进攻牌或技能牌；复制牌加入手牌'];
        if (effect.type === 'drawCategory') return [`定向检索 = ${PEAK_CARD_CATEGORIES[effect.category]?.name || effect.category}牌 × ${effect.value || 1}`];
        if (effect.type === 'discardForRandomCategories') return [`随机丢弃 = ${(effect.discardCategories || []).map((category) => PEAK_CARD_CATEGORIES[category]?.name || category).join('或')}牌 × 1`, `随机检索 = ${(effect.drawCategories || []).map((category) => PEAK_CARD_CATEGORIES[category]?.name || category).join('或')}牌 × 最多${effect.draw || 2}`];
        if (effect.type === 'recoverDiscard') return [`弃牌回收 = 最近的${effect.value || 1}张${PEAK_CARD_CATEGORIES[effect.category]?.name || ''}牌`];
        if (effect.type === 'shieldToMp') return [`MP转化 = 当前护盾 × ${cardRangeOrFixedValue(effect, level, 'minValue', 'maxValue')}%（1:1）`];
        if (effect.type === 'retainShield') return [`下回合护盾 = 回合结束护盾 × ${Math.min(60, scaledCardNumber(effect.value, card, level))}%`];
        if (effect.type === 'empower') return [effect.category === 'defense'
            ? `下一张防守牌的护盾和治疗 = 原效果 × (1 + ${Math.min(40, scaledCardNumber(effect.value, card, level))}%)`
            : `下一张${PEAK_CARD_CATEGORIES[effect.category]?.name || effect.category}牌伤害 = 结算伤害 × (1 + ${Math.min(40, scaledCardNumber(effect.value, card, level))}%)`];
        if (effect.type === 'cleanse') return [`净化 = ${effect.value || 1}个负面状态`];
        if (effect.type === 'setState') return [`目标状态 = ${PEAK_COMBAT_STATES[effect.value] || effect.value}`];
        if (effect.type === 'spellCharge') return [`充能获得 = ${effect.value || 1}层（上限${effect.max || 5}层，跨回合保留）`];
        if (effect.type === 'spellChargeSpend') return [`充能增伤 = 结算伤害 × (1 + 当前层数 × ${effect.perCharge || 0}%)`, '结算后充能清零'];
        if (effect.type === 'timedFuse') return [`引信伤害 = ${valueFormula(effect, card, level)}`, `引爆时机 = ${effect.turns || 2}回合后对手回合开始时`];
        if (effect.type === 'vowGain') return [`誓约获得 = ${effect.value || 1}层（上限${effect.maxStacks || 5}层，跨回合保留）`];
        if (effect.type === 'vowSpend') return [`誓约增伤 = 结算伤害 × (1 + 当前层数 × ${effect.perStack || 0}%)`, '结算后誓约清零'];
        if (effect.type === 'bleedAmplify') return [`流血增伤 = 结算伤害 × (1 + min(目标流血层数, ${effect.maxStacks || 5}) × ${effect.perStack || 0}%)`];
        if (effect.type === 'comboEscalate') return [`连段增伤 = 结算伤害 × (1 + min(连续进攻牌数, ${effect.maxCards || 4}) × ${effect.perCard || 0}%)`, '连段数从本回合最后一张非进攻牌之后开始计算'];
        if (effect.type === 'scheduleBlessing') {
            const payload = effect.blessingType === 'shield' ? `护盾 +${effect.value || 0}`
                : effect.blessingType === 'cleanse' ? `净化 ${effect.value || 1}个负面状态`
                    : `治疗 +${effect.value || 0}`;
            return [`${effect.name || '祝福'}兑现 = ${payload}`, `兑现时机 = ${effect.turns || 2}回合后自己回合开始时`];
        }
        if (effect.type === 'vowShield') return [`誓约护盾 = min(当前誓约层数, ${effect.maxStacks || 5}) × ${effect.shieldPerStack || 0}`, '结算后誓约清零'];
        if (effect.type === 'bleedHarvest') return [`流血收割 = min(目标流血层数, ${effect.maxStacks || 5}) × ${effect.damagePerStack || 0}（真实伤害）`, '结算后目标流血清除'];
        if (effect.type === 'arcaneCascade') return [`级联伤害 = min(当前充能层数, ${effect.maxCharges || 5}) × ${effect.damagePerCharge || 0}${effect.element ? `（${elementNames[effect.element]}）` : ''}`, '结算后充能清零'];
        if (effect.type === 'blessingHasten') return [`祝福兑现值 = 原兑现值 × (1 + ${effect.bonusPercent || 0}%)`, `兑现时机 = 提前${effect.turns || 1}回合`];
        if (effect.type === 'conditionalRouteResource') {
            if (effect.condition === 'queueCategoryCount') return [`路线资源获得 = min(队列${PEAK_CARD_CATEGORIES[effect.category]?.name || effect.category}牌数 × ${effect.perCard || 1}, ${cardRangeOrFixedValue(effect, level, 'minCap', 'maxCap', 'maxValue')})`];
            return [`条件满足时路线资源 = +${cardRangeOrFixedValue(effect, level, 'minValue', 'maxValue')}`];
        }
        if (effect.type === 'filteredRecall') return [`弃牌检索 = 最近${cardRangeOrFixedValue(effect, level, 'minValue', 'maxValue')}张符合元素/异常/类别条件的牌`];
        if (effect.type === 'statusExtend') return [`异常层数 = 当前 + ${cardRangeOrFixedValue(effect, level, 'minStacks', 'maxStacks', 'stacks')}`, `异常持续时间 = 当前 + ${cardRangeOrFixedValue(effect, level, 'minDuration', 'maxDuration', 'duration')}回合`];
        if (effect.type === 'routeResourcePreserve') return [`资源保留次数 = ${cardRangeOrFixedValue(effect, level, 'minUses', 'maxUses', 'uses')}`];
        if (effect.type === 'statusEcho') return [`异常追加 = +${cardRangeOrFixedValue(effect, level, 'minBonusStacks', 'maxBonusStacks', 'bonusStacks')}层${effect.durationBonus ? `、持续+${effect.durationBonus}` : ''}`, `触发次数 = ${cardRangeOrFixedValue(effect, level, 'minUses', 'maxUses', 'uses')}`];
        if (effect.type === 'statusTransmute') return ['转换层数与持续时间 = 原异常层数与持续时间'];
        if (effect.type === 'statusHarvest') return [`收割伤害 = min(异常总层数, ${effect.maxStacks || 1}) × ${effect.damagePerStack || 0}`, `收割后${effect.consume ? '扣除对应异常层数' : '保留异常'}`];
        if (effect.type === 'shieldStrike') return [`反照伤害 = min(当前护盾, 最大生命 × ${effect.capPercent || 0}%) × ${cardRangeValue(effect, level, 'minRatio', 'maxRatio')}%${effect.bossFactor ? ' × Boss系数50%' : ''}`, `自身护盾消耗 = 当前护盾 × ${effect.consumePercent || 0}%`];
        return [];
    });
    if (multiHitGroup) {
        const firstDamageIndex = lines.findIndex((line) => line.startsWith('第1/') || line.includes('伤害 ='));
        if (firstDamageIndex >= 0 && multiHitGroup.hitCount > 1) {
            lines.splice(firstDamageIndex + 1, 0, `第2-${multiHitGroup.hitCount}段伤害同上`);
        }
    }
    if (card.costGrowth?.length) lines.push(`MP消耗 = ${getPeakCardCost(card, level)}；成长节点：${card.costGrowth.map((step) => `Lv.${step.level}消耗${getPeakCardCost(card, step.level)}MP`).join('、')}`);
    if (card.utilityGrowth === 'defense') lines.push('升级成长：格挡每级增加1个百分点；Lv.5屏障延长1回合；Lv.10格挡与屏障各增加1次');
    if (card.conditionalDamage) lines.push(`条件增伤 = 基础结算伤害 × ${Math.round(card.conditionalDamage.bonus * 100)}%`);
    if (card.queueMechanic) {
        lines.push(`队列条件 = ${card.queueMechanic.description}`);
        if (card.queueMechanic.damageByCategoryCount) lines.push(`队列增伤 = ${Object.entries(card.queueMechanic.damageByCategoryCount).map(([count, bonus]) => `${count}种 × (1 + ${Math.round(bonus * 100)}%)`).join('；')}`);
        else lines.push(`队列增伤 = 结算伤害 × (1 + ${Math.round((card.queueMechanic.damageBonus || 0) * 100)}%)`);
        const reward = card.queueMechanic.reward;
        if (reward?.type === 'restoreMp') lines.push(`队列奖励 = 恢复${cardRangeValue(reward, level, 'minValue', 'maxValue')}MP`);
        if (reward?.type === 'shield') lines.push(`队列奖励 = ${cardRangeValue(reward, level, 'minValue', 'maxValue')}点护盾`);
        if (reward?.type === 'status') lines.push(`队列奖励 = ${reward.stacks || 1}层${PEAK_STATUS_EFFECTS[reward.status]?.name || reward.status} × ${reward.duration || 1}回合`);
    }
    if (card.positionScaling) lines.push(`位置增伤 = min(此前${PEAK_CARD_CATEGORIES[card.positionScaling.category]?.name || card.positionScaling.category}牌数, ${card.positionScaling.maxStacks}) × ${card.positionScaling.perPrior}%（本牌必须位于队尾）`);
    if (card.styleFollowUp) lines.push('流派追击 = 读取前一张进攻牌的 attackStyle，并应用对应增伤/状态');
    if (card.consumeStyleChain) lines.push(`终结强化 = 连续${card.consumeStyleChain.style}流派达到${card.consumeStyleChain.threshold}层后，伤害 × (1 + ${card.consumeStyleChain.damageBonus}%)`);
    if (card.recycleOnResolve) lines.push(`回收追击 = 条件达成后返回手牌；第二次伤害 × (1 - ${card.recycleOnResolve.damagePenalty}%)`);
    return lines;
};
export const peakUpgradePreview = (card, level) => {
    const next = Math.min(card.maxLevel || 10, level + 1);
    const currentCost = getPeakCardCost(card, level);
    const nextCost = getPeakCardCost(card, next);
    if (nextCost < currentCost) return `升级后MP消耗：${currentCost} → ${nextCost}`;
    if (card.costGrowth?.length) {
        const milestone = card.costGrowth.find((step) => step.level > level && getPeakCardCost(card, step.level) < currentCost);
        if (milestone) return `本次升级推进成长进度；Lv.${milestone.level}时MP消耗降至${getPeakCardCost(card, milestone.level)}，当前效果不变`;
    }
    const before = effectFormulaLines(card, level);
    const changes = effectFormulaLines(card, next).filter((line) => !before.includes(line));
    return changes.length ? `升级后：${changes.join('；')}` : '本级整数效果不变，继续升级累计成长';
};

const cardFormulaMarkup = (card, level = 1, full = false) => {
    const lines = effectFormulaLines(card, level);
    const visible = full ? lines : lines.slice(0, 2);
    return `<section class="peak-card-formula ${full ? 'is-full' : ''}"><small>LV.${level} 结算明细</small><ul>${visible.map((line) => `<li>${esc(line)}</li>`).join('')}</ul>${!full && lines.length > visible.length ? `<em>+${lines.length - visible.length} 项</em>` : ''}</section>`;
};
const baseStatusMarkup = (combatant, bomb = null) => `${
    combatStateArt[combatant.state] && !(combatant.state === 'stunned' && combatant.stunCharges)
        ? `<span class="peak-status peak-combat-state" style="--peak-status:#d9e2e7"><img src="${combatStateArt[combatant.state]}" alt="">${esc(PEAK_COMBAT_STATES[combatant.state] || combatant.state)}</span>` : ''
}${combatant.stunCharges ? `<span class="peak-status" style="--peak-status:#f3d96b" title="下一张牌除状态变化外的效果无效"><img src="${combatStateArt.stunned}" alt="">眩晕待触发 ${combatant.stunCharges}</span>` : ''}${
    (combatant.statuses || []).map((status) => { const definition = PEAK_STATUS_EFFECTS[status.id]; return `<span class="peak-status" style="--peak-status:${definition?.color || '#fff'}" title="${esc(definition?.description || '')}">${statusArt[status.id] ? `<img src="${statusArt[status.id]}" alt="">` : ''}${esc(definition?.name || status.id)}${definition?.maxStacks === 1 ? '' : ` ${status.stacks}`}<small>${status.duration}</small></span>`; }).join('')
}${(combatant.guards || []).map((guard) => `<span class="peak-status" style="--peak-status:#6fc5e8" title="下次受伤触发格挡">格挡 ${guard.reduction}%<small>${guard.uses}/${guard.duration}</small></span>`).join('')}${
    (combatant.manaBarriers || []).map((entry) => `<span class="peak-status" style="--peak-status:#70aee8" title="消耗MP吸收伤害">魔力护壁 ${entry.ratio}%<small>${entry.uses}/${entry.duration}</small></span>`).join('')
}${(combatant.thorns || []).map((entry) => `<span class="peak-status" style="--peak-status:#d78f9d" title="受伤时反弹真实伤害">反伤 ${entry.ratio}%<small>${entry.uses}/${entry.duration}</small></span>`).join('')}${
    (combatant.damageCaps || []).map((entry) => `<span class="peak-status" style="--peak-status:#8bc9bb" title="限制单次伤害">伤害上限 ${entry.ratio}%<small>${entry.uses}/${entry.duration}</small></span>`).join('')
}${(combatant.shieldBreaks || []).map((entry) => `<span class="peak-status" style="--peak-status:#e5b66f" title="护盾击破时恢复并抽牌">护盾回响 ${entry.healPercent}%<small>${entry.uses}/${entry.duration}</small></span>`).join('')}${
    combatant.statusWard ? `<span class="peak-status" style="--peak-status:#9edda8" title="抵消有害异常">异常屏障 ${combatant.statusWard.charges}<small>${combatant.statusWard.duration}</small></span>` : ''
}${combatant.lastStand ? `<span class="peak-status" style="--peak-status:#f0c75e" title="致命伤时保留1点生命并获得护盾">不屈 ${combatant.lastStand.charges}<small>${combatant.lastStand.persistent ? '本场' : combatant.lastStand.duration}</small></span>` : ''}${
    combatant.shieldRetention ? `<span class="peak-status" style="--peak-status:#e9b949" title="下一回合保留部分护盾">护盾保留 ${Math.round(combatant.shieldRetention)}%</span>` : ''
}${(combatant.empowerments || []).map((entry) => `<span class="peak-status" style="--peak-status:#c786e4" title="${entry.category === 'defense' ? '下一张防守牌的护盾和治疗提高' : '下一张匹配卡牌造成额外伤害'}">${PEAK_CARD_CATEGORIES[entry.category]?.name || entry.category}蓄势 +${Math.round(entry.value)}%</span>`).join('')}${combatant.nextTurnDraw ? `<span class="peak-status" style="--peak-status:#f06dc5" title="下回合额外抽牌">预支抽牌 +${combatant.nextTurnDraw}</span>` : ''}${combatant.nextTurnDrawPenalty ? `<span class="peak-status" style="--peak-status:#dc8492" title="下回合减少抽牌">抽牌偿还 -${combatant.nextTurnDrawPenalty}</span>` : ''}${(combatant.scheduledCards || []).map((entry) => `<span class="peak-status" style="--peak-status:#d9e0e7" title="后续回合获得固定等级卡牌">${esc(PEAK_CARD_BY_ID[entry.cardId]?.name || entry.cardId)} Lv.${entry.level}<small>${entry.turns}回合</small></span>`).join('')}${(combatant.cardDisruptions || []).map((entry) => `<span class="peak-status" style="--peak-status:#e26f91" title="增益与防守牌将失效">捣蛋封牌 ${entry.all ? '全部' : entry.charges}${entry.discardAtTurnEnd ? '<small>清手</small>' : ''}</span>`).join('')}${combatant.debuffImmunity ? `<span class="peak-status" style="--peak-status:#9be6c0" title="免疫任何来源施加的负面状态">负面免疫<small>${combatant.debuffImmunity.duration}</small></span>` : ''}${combatant.phoenixWard ? `<span class="peak-status" style="--peak-status:#ffd36a" title="致命伤害完全无效并清除负面状态">浴火金身 ${combatant.phoenixWard.charges}<small>${combatant.phoenixWard.duration}</small></span>` : ''}${(combatant.roundDamageBoosts || []).map((entry) => `<span class="peak-status" style="--peak-status:#ff9376">${entry.classId ? '职业牌' : entry.damageType === 'physical' ? '物伤' : entry.damageType === 'magical' ? '魔伤' : '伤害'} +${Math.round(entry.value)}%</span>`).join('')}${combatant.roundTradeoff ? `<span class="peak-status" style="--peak-status:#e5c56e" title="伤害降低，治疗与护盾提高">享乐 -${combatant.roundTradeoff.damagePenalty}% / +${combatant.roundTradeoff.sustainBonus}%</span>` : ''}${(combatant.damageConversions || []).map((entry) => `<span class="peak-status" style="--peak-status:#b98aff">${entry.from === 'physical' ? '物' : '魔'}→${entry.to === 'physical' ? '物' : '魔'} +${entry.bonus}%</span>`).join('')}${combatant.shieldVanguard ? `<span class="peak-status" style="--peak-status:#79cae8">破盾 +${combatant.shieldVanguard.shieldBonus}%${combatant.shieldVanguard.activated ? `<small>伤害+${combatant.shieldVanguard.breakBonus}%</small>` : ''}</span>` : ''}${combatant.unstableMagic ? `<span class="peak-status" style="--peak-status:#a86bff" title="本回合技能牌随机浮动伤害，并按额外伤害转化生命（为负则扣血）">不稳定 ${combatant.unstableMagic.low}%~${combatant.unstableMagic.high}%<small>转化${combatant.unstableMagic.leech}%</small></span>` : ''}${(combatant.delayedBursts || []).map((entry) => `<span class="peak-status" style="--peak-status:#ff7b65" title="下一次受到卡牌命中时引爆">延迟标记<small>${Math.round(entry.damage)}</small></span>`).join('')}${bomb ? `<span class="peak-status" style="--peak-status:#ff8a4c" title="回合开始时${bomb.chance}%几率爆炸，造成持有者最大生命${bomb.ratio}%的伤害；未爆炸则传给对面">蹦蹦炸弹 ${bomb.chance}%<small>${bomb.ratio}%</small></span>` : ''}${combatant.spellCharge?.value > 0 ? `<span class="peak-status" style="--peak-status:#6fb7ff" title="法力充能，可被充能爆发牌引爆以提高伤害">法力充能 ${combatant.spellCharge.value}<small>/${combatant.spellCharge.max}</small></span>` : ''}${(combatant.timedFuses || []).map((entry) => `<span class="peak-status" style="--peak-status:#c86bff" title="回合开始时倒数，归零后引爆">延迟引信<small>${entry.turns}回合·${Math.round(entry.damage)}</small></span>`).join('')}${combatant.vow?.stacks > 0 ? `<span class="peak-status" style="--peak-status:#f2d06b" title="誓约层数，可被誓约兑现牌倾泻以提高伤害">誓约 ${combatant.vow.stacks}<small>/${combatant.vow.max}</small></span>` : ''}${(combatant.blessedSchedules || []).map((entry) => `<span class="peak-status" style="--peak-status:#a9e8ff" title="自己回合开始时倒数，归零后兑现">${esc(entry.name || '祝福')}<small>${entry.turns}回合·${entry.type === 'cleanse' ? `净化${entry.value}` : `${entry.type === 'shield' ? '盾' : '治'}${Math.round(entry.value)}`}</small></span>`).join('')}`;
const statusMarkup = (combatant, bomb = null) => `${baseStatusMarkup(combatant, bomb)}${combatant.roundPenetration ? `<span class="peak-status" style="--peak-status:#72d6d0" title="本回合降低目标物理与魔法防御的有效值">双穿 ${Math.round(combatant.roundPenetration.physical)}%</span>` : ''}${combatant.drawnSword ? `<span class="peak-status" style="--peak-status:#ffcf66" title="技能伤害为0且非伤害效果正常，进攻牌持续增伤">亮剑 +${Math.round(combatant.drawnSword.attackBonus)}%<small>本场</small></span>` : ''}`;
const playerDrawPerTurn = (level) => 2 + (level >= 20 ? 1 : 0) + (level >= 45 ? 1 : 0);
const formatEquipmentValue = (value) => Number(value).toFixed(Number(value) % 1 ? 2 : 0);
const equipmentIconRarities = ['inferior', 'common', 'advanced', 'rare', 'artifact', 'legendary', 'epic', 'primordial', 'mythic'];
const equipmentIconMarkup = (slot, rarity = 'inferior', label = '') => {
    const sheet = PEAK_ASSETS.equipmentIcons?.[slot];
    if (!sheet) return `<span class="peak-equipment-icon is-fallback" role="img" aria-label="${esc(label || PEAK_EQUIPMENT_SLOT_LABELS[slot] || '装备')}">${slot === 'title' ? '称' : '装'}</span>`;
    const index = Math.max(0, equipmentIconRarities.indexOf(rarity));
    const x = (index % 3) * 50;
    const y = Math.floor(index / 3) * 50;
    return `<span class="peak-equipment-icon" role="img" aria-label="${esc(label || PEAK_EQUIPMENT_SLOT_LABELS[slot] || '装备')}" style="--peak-equipment-sheet:url('${sheet}');--peak-equipment-x:${x}%;--peak-equipment-y:${y}%"></span>`;
};

const cardArtScenes = {
    sword: 'assets/dnf/background/frozen-ruins.png',
    brawler: 'assets/dnf/background/infernal-fortress.png',
    archer: 'assets/dnf/background/sky-sanctuary.png',
    knight: 'assets/dnf/background/azure-cathedral.png',
    priest: 'assets/dnf/background/verdant-catacombs.png',
    mage: 'assets/dnf/background/azure-cathedral.png',
    lancer: 'assets/fighters/background/fighterbackground10-yongzhou.png',
    attack: 'assets/dnf/background/blood-throne.png',
    defense: 'assets/dnf/background/frozen-ruins.png',
    skill: 'assets/dnf/background/azure-cathedral.png',
    buff: 'assets/dnf/background/verdant-catacombs.png',
    special: 'assets/dnf/background/azure-cathedral.png',
};
const cardArtGlyphs = { attack: '攻', defense: '守', skill: '技', buff: '增', special: '特' };
const cardAuraSheets = { legendary: 'assets/dnf/drop-auras/legendary-aura-sheet.png', epic: 'assets/dnf/drop-auras/epic-aura-sheet.png' };
const combatStateArt = {
    launched: 'assets/card/zhuangtai/jifei.png',
    airborne: 'assets/card/zhuangtai/fukong.png',
    knockedDown: 'assets/card/zhuangtai/jidao.png',
    stunned: 'assets/card/zhuangtai/xuanyun.png',
};
const statusArt = {
    burn: 'assets/card/zhuangtai/灼烧.png',
    poison: 'assets/card/zhuangtai/zhongdu.png',
    bleed: 'assets/card/zhuangtai/zhongshang.png',
    weak: 'assets/card/zhuangtai/xuruo.png',
    vulnerable: 'assets/card/zhuangtai/yisun.png',
};
const packArt = {
    lower: 'assets/card/icon/chouka-white.png',
    low: 'assets/card/icon/chouka-green.png',
    middle: 'assets/card/icon/chouka-blue.png',
    high: 'assets/card/icon/chouka-purple.png',
    upper: 'assets/card/icon/chouka-gold.png',
    special: 'assets/card/icon/chouka-gold.png',
    highest: 'assets/card/icon/chouka-gold.png',
    class: 'assets/card/icon/chouka-box.png',
};
const npcArt = {
    equipment: 'assets/card/npc/equipseller.png',
    store: 'assets/card/npc/storeseller.png',
    attendance: 'assets/card/npc/guide.png',
    merchant: 'assets/card/npc/manager.png',
    vip: 'assets/card/npc/weaponblack.png',
};
const genericArtByRarity = {
    common: 'assets/card/ui/white-texiao.png',
    excellent: 'assets/card/ui/green-texiao.png',
    rare: 'assets/card/ui/blue-texiao.png',
    scarce: 'assets/card/ui/purple-texiao.png',
    legendary: 'assets/card/ui/purple-texiao.png',
    epic: 'assets/card/ui/gold-texiao.png',
};
const potionColumnByRarity = { common: 0, excellent: 1, rare: 2, scarce: 3, legendary: 4, epic: 4 };
const potionEffectArt = (card, row) => ({
    file: 'assets/card/ui/yaoshui.png',
    potion: true,
    x: (potionColumnByRarity[card.rarity] || 0) * 25,
    y: row * 50,
});
const cardEffectArt = (card) => {
    const effects = card.effects || [];
    if (card.effectArt) return { file: card.effectArt };
    const resultState = effects.find((effect) => effect.type === 'setState')?.value || card.attackState?.to;
    const harmfulStatus = effects.find((effect) => effect.type === 'status' && statusArt[effect.status])?.status;
    if (card.tags?.includes('破甲')) return { file: 'assets/card/zhuangtai/pojia.png' };
    if (harmfulStatus) return { file: statusArt[harmfulStatus] };
    if (resultState && resultState !== 'standing' && combatStateArt[resultState]) return { file: combatStateArt[resultState] };
    if (effects.some((effect) => effect.type === 'heal' || effect.type === 'healMissing')) return potionEffectArt(card, 1);
    if (effects.some((effect) => effect.type === 'restoreMp')) return potionEffectArt(card, 0);
    if (effects.some((effect) => ['draw', 'drawCategory', 'nextTurnDraw', 'scheduleCard', 'borrowDraw', 'advanceConsume'].includes(effect.type))) return { file: 'assets/card/zhuangtai/chouka.png' };
    if (effects.some((effect) => effect.type === 'copyPreviousCard')) return { file: 'assets/card/ui/summon-card-texiao.png' };
    if (effects.some((effect) => effect.type === 'recoverDiscard')) return { file: 'assets/card/icon/chouka-box.png' };
    if (effects.some((effect) => effect.type === 'shield' || effect.type === 'vowShield')) return { file: 'assets/card/ui/sheild-texiao.png' };
    if (effects.some((effect) => effect.type === 'status' && effect.status === 'regeneration')) return { file: 'assets/card/ui/heal-texiao.png' };
    if (effects.some((effect) => effect.type === 'buff' && ['strength', 'physicalAttack'].includes(effect.stat))) return { file: 'assets/card/ui/liliangbuff-texiao.png' };
    if (effects.some((effect) => effect.type === 'buff' && ['intelligence', 'magicalAttack'].includes(effect.stat))) return { file: 'assets/card/ui/zhilibuff-texiao.png' };
    if (effects.some((effect) => effect.type === 'blessingHasten')) return { file: 'assets/card/ui/heal-texiao.png' };
    if (effects.some((effect) => ['empower', 'shieldToMp', 'spellCharge', 'spellChargeSpend', 'vowGain', 'vowSpend', 'arcaneCascade', 'bleedHarvest'].includes(effect.type))) return { file: 'assets/card/ui/summon-card-texiao.png' };
    if (card.category === 'attack' && card.classId === 'sword') return { file: 'assets/card/feijian-attack.png', sheet: true };
    return { file: genericArtByRarity[card.rarity] || genericArtByRarity.common };
};
const cardArtAction = (card) => {
    if (card.category === 'defense') return 'guard';
    if (card.category === 'skill') return ['legendary', 'epic'].includes(card.rarity) ? 'super' : 'skill';
    if (card.category === 'buff') return 'skill';
    if (card.category === 'special') return 'super';
    if (card.classId === 'sword') {
        if (card.attackStyle === 'finisher') return 'attack3';
        if (card.attackStyle === 'thrust') return 'attack2';
        return 'attack1';
    }
    if (card.classId === 'archer') {
        if (card.attackStyle === 'snipe' || card.attackStyle === 'finisher') return 'attack2';
        if (card.attackStyle === 'volley' || card.attackStyle === 'launch') return 'attack3';
        return 'attack1';
    }
    if (card.classId === 'lancer') {
        if (card.attackStyle === 'finisher' || card.attackStyle === 'volley') return 'attack3';
        if (card.attackStyle === 'launch') return 'attack2';
        return 'attack1';
    }
    if (card.attackStyle === 'kick') return 'attack3';
    if (card.attackStyle === 'finisher') return 'attack2';
    return 'attack1';
};
const cardArtMarkup = (card) => {
    const classId = Object.hasOwn(PEAK_CHARACTERS, card.classId) ? card.classId : '';
    const animation = classId ? PEAK_ASSETS.heroAnimations?.[classId]?.[cardArtAction(card)] : null;
    const gridClass = Number(animation?.columns) === 4 && Number(animation?.rows) === 2 ? 'is-grid-4x2' : '';
    const displayScale = Math.max(.5, Number(PEAK_ASSETS.heroDisplayScales?.[classId]) || 1);
    const figureSize = (gridClass ? 228 : 114) * displayScale;
    const scene = card.cardArt || cardArtScenes[classId || card.category];
    const aura = cardAuraSheets[card.rarity] || '';
    const effectArt = cardEffectArt(card);
    const element = card.effects.find((effect) => effect.type === 'damage' && effect.element)?.element;
    const artLabel = element ? `${elementNames[element] || element}属性` : categoryName(card);
    return `<div class="peak-card-art ${animation ? 'has-sprite' : 'is-shared'} ${gridClass} ${effectArt?.file ? 'has-effect-art' : ''} ${effectArt?.sheet ? 'effect-art-sheet' : ''} ${effectArt?.potion ? 'effect-art-potion' : ''}" aria-hidden="true" style="--peak-card-scene:url('${scene}');--peak-card-figure:${animation ? `url('${animation.file}')` : 'none'};--peak-card-figure-size:${figureSize}%;--peak-card-aura:${aura ? `url('${aura}')` : 'none'};--peak-card-effect-art:${effectArt?.file ? `url('${effectArt.file}')` : 'none'};--peak-effect-x:${effectArt?.x || 0}%;--peak-effect-y:${effectArt?.y || 0}%"><i></i><u></u><b>${cardArtGlyphs[card.category] || '卡'}</b><span>${esc(artLabel)}</span></div>`;
};

const cardMarkup = (card, level = 1, extra = '', mpCost = getPeakCardCost(card, level)) => `
    <article class="peak-card peak-card-${card.category}" data-rarity="${card.rarity}" style="${rarityStyle(card.rarity)}" ${extra}>
        <header><span>${esc(PEAK_CARD_RARITIES[card.rarity]?.name)}</span><b>Lv.${level}</b></header>
        <div class="peak-card-cost">${mpCost}<small>MP</small></div>
        ${cardArtMarkup(card)}
        <strong>${esc(card.name)}</strong>
        <em>${esc(categoryName(card))}</em>
        <p class="peak-card-effect">${esc(effectText(card, level))}</p>
        ${card.category === 'attack' || card.requiresTargetState?.length || card.requiresPreviousCard?.length || card.requiresRoundStateApplied?.length || card.requiresNoPreviousCategory?.length || card.requiresDiscardCategories?.length || card.requiresLastHandCard ? `<small class="peak-card-condition">${esc(conditionText(card))}</small>` : ''}
        ${cardFormulaMarkup(card, level)}
        <footer>${card.tags.slice(0, 2).map((tag) => `<span>${esc(tag)}</span>`).join('')}</footer>
    </article>`;

const cardPaginationMarkup = (scope, pagination) => pagination.pages > 1 ? `
    <nav class="peak-card-pagination" aria-label="卡牌分页">
        <button type="button" data-action="set-${scope}-page" data-page="${pagination.page - 1}" ${pagination.page <= 1 ? 'disabled' : ''} aria-label="上一页">‹</button>
        <span><b>${pagination.page}</b> / ${pagination.pages}<small>共 ${pagination.total} 张</small></span>
        <button type="button" data-action="set-${scope}-page" data-page="${pagination.page + 1}" ${pagination.page >= pagination.pages ? 'disabled' : ''} aria-label="下一页">›</button>
    </nav>` : '';

export const initPeakDuel = ({ root }) => {
    if (!root) return { render() {}, resume() {}, pause() {} };
    const content = root.querySelector('#peak-duel-content');
    const modal = root.querySelector('#peak-duel-modal');
    const notice = root.querySelector('#peak-duel-notice');
    const goldEl = root.querySelector('#peak-duel-gold');
    const vouchersEl = root.querySelector('#peak-duel-vouchers');
    const staminaEl = root.querySelector('#peak-duel-stamina');
    const timerEl = root.querySelector('#peak-duel-stamina-timer');
    const levelEl = root.querySelector('#peak-duel-level');
    let save = getPeakSave();
    const saveOwner = createPeakSaveOwner();
    let storageIssue = getPeakSaveIssue(save);
    let resumed = false;
    let view = getActivePeakCharacter(save) && !getActivePeakCharacter(save).needsNaming ? (save.activeRun ? 'battle' : 'town') : 'roster';
    let selectedCodexId = '';
    let codexClassFilter = save.settings.codex.classFilter;
    let codexRarityFilter = save.settings.codex.rarityFilter;
    let codexTypeFilter = save.settings.codex.typeFilter;
    let codexOwnershipFilter = save.settings.codex.ownershipFilter;
    let codexAdvancementFilter = save.settings.codex.advancementFilter;
    let codexSort = save.settings.codex.sort;
    let codexQuery = '';
    let codexPage = 1;
    let deckRarityFilter = save.settings.deck.rarityFilter;
    let deckTypeFilter = save.settings.deck.typeFilter;
    let deckSort = save.settings.deck.sort;
    let deckQuery = '';
    let deckPage = 1;
    let inventorySlotFilter = save.settings.inventory.slotFilter;
    let inventoryRarityFilter = save.settings.inventory.rarityFilter;
    let inventoryStatusFilter = save.settings.inventory.statusFilter;
    let inventoryStatFilter = save.settings.inventory.statFilter || 'all';
    let selectedInventoryIds = new Set();
    let selectedBlessingTree = 'heroic';
    let selectedMissionGroup = 'daily';
    let selectedTutorialId = PEAK_TUTORIAL_CHAPTERS[0]?.id || '';
    let selectedCard = null;
    let selectedEquipmentId = '';
    let selectedDiscardUids = new Set();
    let resolutionFrame = null;
    let resolving = false;
    let timer = 0;
    let pendingCharacterClass = 'sword';
    let trustedNow = 0;
    let trustedTimeState = 'idle';
    let trustedTimeError = '';
    let accountBusy = false;
    let cardSearchTimer = 0;
    let noticeTimer = 0;
    let cardSearchComposing = false;
    let mobileOnboardingDismissed = false;
    let peakAudioContext = null;
    let modalReturnFocus = null;

    const activeCharacter = () => getActivePeakCharacter(save);
    const characterPortrait = (character = activeCharacter()) => {
        const portraits = PEAK_ASSETS.heroPortraits?.[character?.baseClassId];
        if (portraits && Number(character?.advancement?.tier) >= 1) return portraits.advanced || portraits.base;
        return portraits?.base || PEAK_ASSETS.heroes[character?.baseClassId] || '';
    };
    const activeDeck = () => activeCharacter()?.deck;
    const activeCollection = () => getPeakCardCollection(save);
    const selectedDungeon = () => PEAK_DUNGEONS.find((entry) => entry.id === save.progress.selectedDungeon) || PEAK_DUNGEONS[0];
    const persistence = createPeakSaveScheduler({
        getState: () => save,
        canWrite: () => saveOwner.owned,
        onSaved: (nextSave) => { save = nextSave; },
        onError: (error) => { storageIssue = error; setNotice(error.message, 'error'); render(); },
    });
    const commit = () => persistence.commit();
    const commitSoon = () => {
        persistence.schedule();
        if (document.visibilityState === 'hidden') persistence.flush();
    };
    const commitViewSettings = () => {
        save.settings.codex = { classFilter: codexClassFilter, rarityFilter: codexRarityFilter, typeFilter: codexTypeFilter, ownershipFilter: codexOwnershipFilter, advancementFilter: codexAdvancementFilter, sort: codexSort };
        save.settings.deck = { rarityFilter: deckRarityFilter, typeFilter: deckTypeFilter, sort: deckSort };
        save.settings.inventory = { slotFilter: inventorySlotFilter, rarityFilter: inventoryRarityFilter, statusFilter: inventoryStatusFilter, statFilter: inventoryStatFilter };
        commitSoon();
    };
    const commitAccountState = (nextSave) => {
        persistence.commit(nextSave, { throwOnError: true });
    };
    const setNotice = (message, kind = '') => {
        if (noticeTimer) window.clearTimeout(noticeTimer);
        noticeTimer = 0;
        notice.textContent = message || '';
        notice.dataset.kind = kind;
        notice.classList.toggle('is-visible', Boolean(message));
        if (message) {
            noticeTimer = window.setTimeout(() => {
                notice.classList.remove('is-visible');
                noticeTimer = 0;
            }, kind === 'error' ? 3600 : 2800);
        }
    };

    const playPeakTone = (frequency, duration = 0.08, type = 'sine', volume = 0.035) => {
        if (!save.settings.sound || typeof window === 'undefined') return;
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtor) return;
        try {
            peakAudioContext ||= new AudioCtor();
            const audio = peakAudioContext;
            const now = audio.currentTime;
            const oscillator = audio.createOscillator();
            const gain = audio.createGain();
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(Math.max(40, frequency), now);
            gain.gain.setValueAtTime(0.0001, now);
            gain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume), now + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.025, duration));
            oscillator.connect(gain).connect(audio.destination);
            oscillator.start(now);
            oscillator.stop(now + Math.max(0.03, duration) + 0.02);
            if (audio.state === 'suspended') audio.resume().catch(() => {});
        } catch {                                                      }
    };

    const getPeakImpactProfile = (frame) => {
        const visual = frame?.visual || {};
        const hpDamage = Math.max(0, Number(visual.hpDamage) || 0);
        const shieldDamage = Math.max(0, Number(visual.shieldDamage) || 0);
        const damage = hpDamage + shieldDamage;
        const target = visual.target && frame?.state?.[visual.target];
        const ratio = damage / Math.max(1, Number(target?.maxHp) || 1);
        const critical = Boolean(visual.critical);
        const shieldBroken = shieldDamage > 0 && Number(target?.shield) <= 0;
        const hits = Math.max(1, Array.isArray(visual.hitResults) ? visual.hitResults.length : 1);
        const tier = critical || ratio >= .18 ? 'critical' : ratio >= .1 || shieldBroken ? 'heavy' : ratio >= .04 || hits >= 3 ? 'medium' : 'light';
        return { damage, hpDamage, shieldDamage, ratio, critical, shieldBroken, hits, tier, element: visual.element || 'physical' };
    };

    const playPeakNoise = (duration = .05, volume = .02, cutoff = 900) => {
        if (!save.settings.sound || !peakAudioContext) return;
        try {
            const audio = peakAudioContext;
            const sampleCount = Math.max(64, Math.floor(audio.sampleRate * duration));
            const buffer = audio.createBuffer(1, sampleCount, audio.sampleRate);
            const data = buffer.getChannelData(0);
            for (let index = 0; index < sampleCount; index += 1) data[index] = (Math.random() * 2 - 1) * (1 - index / sampleCount);
            const source = audio.createBufferSource();
            const filter = audio.createBiquadFilter();
            const gain = audio.createGain();
            filter.type = 'lowpass';
            filter.frequency.value = cutoff;
            gain.gain.setValueAtTime(volume, audio.currentTime);
            gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + duration);
            source.buffer = buffer;
            source.connect(filter).connect(gain).connect(audio.destination);
            source.start();
        } catch {                                             }
    };

    const playPeakFrameSound = (frame) => {
        if (!frame) return;
        if (frame.kind === 'victory') { playPeakTone(523, .12, 'triangle', .045); window.setTimeout(() => playPeakTone(784, .16, 'triangle', .04), 90); return; }
        if (frame.kind === 'defeat') { playPeakTone(180, .2, 'sawtooth', .035); return; }
        if (frame.kind === 'bossDefeated') { playPeakTone(330, .1, 'square', .04); window.setTimeout(() => playPeakTone(660, .22, 'triangle', .045), 100); return; }
        const profile = getPeakImpactProfile(frame);
        if (profile.damage > 0) {
            const actorTone = frame.actor === 'enemy' ? 92 : ({ sword: 155, brawler: 105, archer: 225, knight: 118, priest: 260, mage: 285, lancer: 135 })[save.activeClass] || 145;
            const attackWave = frame.actor === 'enemy' ? 'sawtooth' : ({ sword: 'sawtooth', brawler: 'square', archer: 'triangle', knight: 'sine', priest: 'triangle', mage: 'sine', lancer: 'sawtooth' })[save.activeClass] || 'sine';
            const tierBoost = { light: 0, medium: 24, heavy: 48, critical: 82 }[profile.tier];
            playPeakTone(actorTone + tierBoost, profile.tier === 'critical' ? .16 : .1, profile.critical ? 'square' : attackWave, profile.tier === 'light' ? .024 : .04);
            playPeakNoise(profile.tier === 'light' ? .035 : .07, profile.tier === 'critical' ? .04 : .024, profile.shieldBroken ? 1900 : 1050);
            const elementTone = { fire: 460, ice: 710, light: 860, dark: 330 }[profile.element];
            if (elementTone) playPeakTone(elementTone, .055, 'triangle', .012);
            const hitInterval = Math.max(18, 48 / Math.max(1, save.settings.resolutionSpeed));
            for (let hit = 1; hit < Math.min(profile.hits, 6); hit += 1) window.setTimeout(() => playPeakTone(actorTone + hit * 11, .035, attackWave, .012), hit * hitInterval);
            if (profile.shieldBroken) playPeakTone(920, .09, 'triangle', .035);
            if (profile.critical) window.setTimeout(() => playPeakTone(360, .09, 'square', .03), 22);
        } else if (frame.visual?.healing > 0) playPeakTone(620, .1, 'sine', .025);
        else if (frame.kind === 'status') playPeakTone(390, .06, 'triangle', .018);
    };

    const focusedModalFieldIntoView = () => {
        if (modal.classList.contains('hidden')) return;
        const field = modal.querySelector('input:focus, textarea:focus, select:focus');
        field?.scrollIntoView?.({ block: 'center', inline: 'nearest', behavior: 'smooth' });
    };
    const syncPeakVisualViewport = () => {
        const viewport = window.visualViewport;
        root.style.setProperty('--peak-visual-viewport-height', `${Math.max(1, Math.round(viewport?.height || window.innerHeight))}px`);
        root.style.setProperty('--peak-visual-viewport-top', `${Math.max(0, Math.round(viewport?.offsetTop || 0))}px`);
        window.requestAnimationFrame(focusedModalFieldIntoView);
    };
    window.visualViewport?.addEventListener('resize', syncPeakVisualViewport);
    window.visualViewport?.addEventListener('scroll', syncPeakVisualViewport);
    window.screen?.orientation?.addEventListener?.('change', syncPeakVisualViewport);
    window.addEventListener('orientationchange', syncPeakVisualViewport);
    modal.addEventListener('focusin', (event) => {
        if (!event.target.matches('input, textarea, select')) return;
        window.setTimeout(focusedModalFieldIntoView, 80);
    });
    modal.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            event.stopPropagation();
            if (!modal.querySelector('.peak-hand-discard-modal')) {
                event.preventDefault();
                closeModal();
            }
            return;
        }
        if (event.key === 'Tab') {
            const focusables = modalFocusable();
            if (!focusables.length) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
            return;
        }
        if (event.key !== 'Enter' || event.isComposing || event.target.id !== 'peak-character-name-input') return;
        event.preventDefault();
        modal.querySelector('[data-action="confirm-create-character"], [data-action="confirm-rename-character"]')?.click();
    });
    const modalObserver = new MutationObserver(() => window.requestAnimationFrame(focusModalEntry));
    modalObserver.observe(modal, { childList: true, subtree: true });
    syncPeakVisualViewport();

    const updateResources = () => {
        const character = activeCharacter();
        goldEl.textContent = save.wallet.gold.toLocaleString('zh-CN');
        vouchersEl.textContent = save.wallet.vouchers.toLocaleString('zh-CN');
        staminaEl.textContent = `${save.stamina.current}/${save.stamina.max}`;
        timerEl.textContent = formatTimer(getPeakStaminaCountdown(save));
        levelEl.textContent = character ? `${character.name} · Lv.${character.level}` : '未创建';
    };

    const trustedTimeLabel = () => {
        if (trustedTimeState === 'loading') return '正在校准可信时间…';
        if (trustedTimeState === 'error') return trustedTimeError || '可信时间服务暂不可用';
        const dateKey = getPeakDateKey(trustedNow);
        return dateKey ? `服务器日期 ${dateKey}` : '领取前将连接服务器校准日期';
    };

    const refreshTrustedTime = async (showError = false) => {
        if (accountBusy) return 0;
        accountBusy = true;
        trustedTimeState = 'loading';
        trustedTimeError = '';
        render();
        try {
            trustedNow = await fetchTrustedPeakTime();
            trustedTimeState = 'ready';
            return trustedNow;
        } catch (error) {
            trustedNow = 0;
            trustedTimeState = 'error';
            trustedTimeError = error?.message || '可信时间服务暂不可用';
            if (showError) setNotice(`${trustedTimeError}，请检查网络后重试。`, 'error');
            return 0;
        } finally {
            accountBusy = false;
            render();
        }
    };

    const runTrustedClaim = async (kind) => {
        if (accountBusy) return;
        accountBusy = true;
        trustedTimeState = 'loading';
        trustedTimeError = '';
        render();
        try {
            trustedNow = await fetchTrustedPeakTime();
            trustedTimeState = 'ready';
            const result = kind === 'attendance' ? claimPeakAttendance(save, trustedNow) : claimPeakVipDaily(save, trustedNow);
            if (!result.ok) {
                save = result.state;
                setNotice(result.reason, 'error');
                return;
            }
            commitAccountState(result.state);
            setNotice(kind === 'attendance' ? `签到成功，获得 ${rewardText(result.reward)}。` : `VIP每日奖励已领取：${rewardText(result.reward)}。`, 'success');
        } catch (error) {
            trustedNow = 0;
            trustedTimeState = 'error';
            trustedTimeError = error?.message || '可信时间服务暂不可用';
            const retryHint = trustedTimeError.startsWith('存档写入失败') ? '' : '，请检查网络后重试';
            setNotice(`${trustedTimeError}，领取未生效${retryHint}。`, 'error');
        } finally {
            accountBusy = false;
            render();
        }
    };

    const syncStamina = () => {
        if (!saveOwner.owned || storageIssue) return;
        const previous = save.stamina.current;
        save = refreshPeakStamina(save);
        if (save.stamina.current !== previous) commitSoon();
        updateResources();
    };

    const renderRoster = () => {
        const slotsUsed = save.characterOrder.length + save.deletedCharacters.length;
        const characterCards = save.characterOrder.map((id) => {
            const character = save.characters[id];
            const definition = PEAK_CHARACTERS[character.baseClassId];
            const advancement = getPeakAdvancementStatus(character);
            const accent = PEAK_ADVANCEMENTS[character.advancement.pathId]?.accent || definition.accent;
            return `<article class="peak-roster-character ${id === save.activeCharacterId ? 'active' : ''}" style="--peak-roster-accent:${accent}">
                <div class="peak-roster-portrait"><img src="${characterPortrait(character)}" alt="${esc(character.name)}"><span>LV.${character.level}</span></div>
                <div class="peak-roster-copy"><small>${esc(definition.name)} · ${esc(getPeakCharacterJobName(character))}</small><h3>${esc(character.name)}</h3><p>${character.needsNaming ? '旧档角色需要完成命名' : advancement.available ? `${advancement.tier === 1 ? '一转' : '二转'}资格已开放` : advancement.reason}</p><div><span>体力 ${character.stamina.current}/${character.stamina.max}</span><span>装备 ${character.inventory.length}/120</span></div></div>
                <footer><button type="button" data-action="enter-character" data-id="${id}">${character.needsNaming ? '完成命名' : id === save.activeCharacterId ? '进入游戏' : '选择角色'}</button><button type="button" data-action="open-rename-character" data-id="${id}" aria-label="重命名${esc(character.name)}">重命名</button>${advancement.available ? `<button class="is-advance" type="button" data-action="open-advancement" data-id="${id}">${advancement.tier === 1 ? '一转' : '二转'}</button>` : ''}<button class="is-danger" type="button" data-action="open-delete-character" data-id="${id}" ${save.characterOrder.length <= 1 ? 'disabled' : ''}>删除</button></footer>
            </article>`;
        }).join('');
        const emptySlots = Array.from({ length: Math.max(0, PEAK_CHARACTER_SLOT_LIMIT - slotsUsed) }, (_, index) => `<button type="button" class="peak-roster-empty" data-action="open-create-character"><span>+</span><strong>创建角色</strong><small>空栏位 ${String(slotsUsed + index + 1).padStart(2, '0')}</small></button>`).join('');
        const recycle = save.deletedCharacters.length ? `<aside class="peak-roster-recycle"><header><span>角色回收站</span><small>回收站角色仍占用栏位</small></header>${save.deletedCharacters.map((entry) => `<div><strong>${esc(entry.character.name)}</strong><span>${esc(getPeakCharacterJobName(entry.character))} · Lv.${entry.character.level}</span><button type="button" data-action="restore-character" data-id="${entry.character.id}">恢复</button></div>`).join('')}</aside>` : '';
        const rosterOnboarding = !mobileOnboardingDismissed && (!activeCharacter() || activeCharacter().needsNaming)
            ? '<div class="peak-mobile-onboarding"><b>1</b><div class="peak-mobile-onboarding-copy"><small>巅峰对决 · 1 / 3</small><strong>选择角色</strong><span>先创建一名冒险家，再进入天空圣域。</span></div><button type="button" class="btn btn-primary" data-action="mobile-onboarding" data-target-action="open-create-character">创建</button><button type="button" class="peak-mobile-onboarding-dismiss" data-action="dismiss-mobile-onboarding" aria-label="稍后再看">×</button></div>'
            : '';
        content.innerHTML = `<section class="peak-roster-view">${rosterOnboarding}<header><div><small>ADVENTURER ROSTER</small><h3>角色选择</h3><p>每个角色独立培养装备、职业卡、卡组、祝福、体力与副本进度。</p></div><strong>${slotsUsed}/${PEAK_CHARACTER_SLOT_LIMIT}</strong></header><div class="peak-roster-grid">${characterCards}${emptySlots || (!characterCards ? '<p class="peak-roster-full">暂无可用栏位</p>' : '')}</div>${recycle}</section>`;
    };

    const renderTown = () => {
        const character = activeCharacter();
        const definition = PEAK_CHARACTERS[character.baseClassId];
        const advancement = getPeakAdvancementStatus(character);
        const stats = getPeakCharacterStats(save);
        const deckCheck = validatePeakDeck(activeDeck().cards, save.activeClass, activeCollection(), character.advancement);
        const missionStatus = getPeakMissionStatus(save, trustedNow || Date.now());
        const missionReady = missionStatus.ready;
        const trial = character.peakTrial;
        const dateKey = getPeakDateKey(trustedNow);
        const attendanceReady = !dateKey || save.attendance.lastClaimDate !== dateKey;
        const recommendedDungeon = PEAK_DUNGEONS.filter((entry) => save.progress.unlockedDungeons.includes(entry.id)).at(-1) || PEAK_DUNGEONS[0];
        const nextMission = missionStatus.groups.flatMap((group) => group.missions.map((mission) => ({ ...mission, groupName: group.name })))
            .find((mission) => !mission.claimed && !mission.complete);
        const trialGuide = character.level < 15 ? null : trial?.phase === 'choosing'
            ? { key: 'trial-boon', tone: 'special', eyebrow: '巅峰试炼', title: `第${trial.floor}层选择增益`, detail: '确认本层强化后继续挑战', view: 'trial', cta: '选择' }
            : trial?.phase === 'ready'
                ? { key: 'trial-ready', tone: 'special', eyebrow: '巅峰试炼', title: `第${trial.floor}层待挑战`, detail: '本周进度已保留，可继续登塔', view: 'trial', cta: '继续' }
                : null;
        const guideCandidates = [
            missionReady ? { key: 'mission-reward', tone: 'reward', eyebrow: '报酬待领', title: '领取任务奖励', detail: `${missionReady}项委托已经完成`, view: 'missions', cta: '领取' } : null,
            advancement.available ? { key: 'advancement', tone: 'job', eyebrow: '职业成长', title: `完成${advancement.tier === 1 ? '一转' : '二转'}试炼`, detail: `Lv.${character.level}已达到转职要求`, action: 'open-advancement', id: character.id, highlightView: 'character', cta: '转职' } : null,
            !deckCheck.valid ? { key: 'deck', tone: 'warning', eyebrow: '出战整备', title: '修正当前卡组', detail: deckCheck.errors[0] || '当前卡组无法出战', view: 'deck', cta: '整备' } : null,
            attendanceReady ? { key: 'attendance', tone: 'reward', eyebrow: '每日福利', title: '领取今日签到', detail: '赛丽亚正在城镇中等候', view: 'attendance', cta: '签到' } : null,
            trialGuide,
            nextMission ? { key: `mission-${nextMission.id}`, tone: 'quest', eyebrow: nextMission.groupName, title: nextMission.name, detail: `${nextMission.description} · ${nextMission.progress}/${nextMission.target}`, view: 'missions', cta: '查看' } : null,
            { key: 'expedition', tone: 'quest', eyebrow: '主线远征', title: `挑战 ${recommendedDungeon.baseName}`, detail: `${recommendedDungeon.difficultyName} · 推荐Lv.${recommendedDungeon.recommendedLevel} · 消耗${recommendedDungeon.staminaCost}TP`, view: 'map', cta: '前往' },
        ].filter(Boolean);
        const primaryGuide = guideCandidates[0];
        const guideItems = guideCandidates.filter((entry, index, entries) => index === entries.findIndex((candidate) => (candidate.view || candidate.highlightView || candidate.key) === (entry.view || entry.highlightView || entry.key))).slice(0, 3);
        const recommendedView = primaryGuide.view || primaryGuide.highlightView || '';
        const mobileOnboarding = !mobileOnboardingDismissed && (!deckCheck.valid
            ? `<div class="peak-mobile-onboarding"><b>2</b><div class="peak-mobile-onboarding-copy"><small>巅峰对决 · 2 / 3</small><strong>配置牌组</strong><span>${esc(deckCheck.errors[0] || '准备一套可出战卡组。')}</span></div><button type="button" class="btn btn-primary" data-action="mobile-onboarding" data-target-view="deck">整备</button><button type="button" class="peak-mobile-onboarding-dismiss" data-action="dismiss-mobile-onboarding" aria-label="稍后再看">×</button></div>`
            : `<div class="peak-mobile-onboarding"><b>3</b><div class="peak-mobile-onboarding-copy"><small>巅峰对决 · 3 / 3</small><strong>进入第一张地图</strong><span>卡组已就绪，前往远征之门开始第一场对决。</span></div><button type="button" class="btn btn-primary" data-action="mobile-onboarding" data-target-view="map">出发</button><button type="button" class="peak-mobile-onboarding-dismiss" data-action="dismiss-mobile-onboarding" aria-label="稍后再看">×</button></div>`);
        const facilities = [
            { group: '成长', view: 'deck', icon: 'C', art: 'assets/card/icon/chouka-box.png', hotkey: '1', name: '卡组', text: `${activeDeck().cards.length}/50`, alert: deckCheck.valid ? '' : '!' },
            { group: '成长', view: 'codex', icon: 'B', art: 'assets/card/zhuangtai/chouka.png', hotkey: '2', name: '图鉴', text: `${Object.values(activeCollection()).filter((entry) => entry.unlocked).length}张` },
            { group: '成长', view: 'character', icon: 'I', art: 'assets/dnf/equipment-icons/weapon-icons.png', artSize: '300% 300%', artPosition: '50% 50%', hotkey: '3', name: '装备', text: `${character.inventory.length}/120` },
            { group: '成长', view: 'blessing', icon: 'S', art: 'assets/card/ui/liliangbuff-texiao.png', hotkey: '4', name: '祝福', text: '技能树' },
            { group: '冒险', view: 'missions', icon: 'Q', art: 'assets/card/ui/baoxiang.png', artSize: '500% 100%', artPosition: '50% center', hotkey: '5', name: '任务', text: missionReady ? `${missionReady}可领` : '委托', alert: missionReady ? `${missionReady}` : '' },
            { group: '冒险', view: 'tutorial', icon: '?', hotkey: '6', name: '指南', text: '玩法说明' },
            { group: '交易', view: 'shop', icon: '商', hotkey: '7', name: '卡包', text: '金币商店' },
            { group: '交易', view: 'merchant', icon: 'V', hotkey: '8', name: '兑换', text: `${save.wallet.vouchers}券` },
        ];
        const npcs = [
            { view: 'shop', art: npcArt.store, name: '艾琳', role: '卡包商店', text: '今天也要补充卡牌吗？', x: 5 },
            { view: 'merchant', art: npcArt.merchant, name: '罗兰', role: '代金券商人', text: `代金券 ${save.wallet.vouchers}`, x: 19 },
            { view: 'attendance', art: npcArt.attendance, name: '赛丽亚', role: '城镇向导', text: attendanceReady ? '今日签到等待领取' : '今天也辛苦了', alert: attendanceReady ? '!' : '', x: 32 },
            { view: 'missions', art: npcArt.equipment, name: '公会管理员', role: '任务中心', text: missionReady ? `${missionReady}项报酬待领取` : '查看冒险委托', alert: missionReady ? '!' : '', x: 68 },
            { view: 'vip', art: npcArt.vip, name: '辛达', role: 'VIP服务', text: `VIP成长 ${save.vip.growth}`, x: 84 },
        ];
        content.innerHTML = `<section class="peak-town" style="--peak-town-bg:url('assets/dnf/background/sky-sanctuary.png');--peak-town-accent:${PEAK_ADVANCEMENTS[character.advancement.pathId]?.accent || definition.accent}">${mobileOnboarding}
            <header class="peak-town-header"><div><small>CH.01 · SKY SANCTUARY</small><h3>第零关主城</h3></div><div class="peak-town-header-actions"><span>安全区域</span><button type="button" data-peak-view="roster">角色选择</button></div></header>
            <div class="peak-town-stage">
                <aside class="peak-town-minimap"><i><b></b><b></b><b></b></i><div><small>当前区域</small><strong>天空圣域</strong><span>第零关冒险家主城</span></div></aside>
                <details class="peak-town-quest-tracker" open><summary><span>任务追踪</span><strong>${esc(primaryGuide.title)}</strong><i>${guideItems.length}</i></summary><div>${guideItems.map((entry, index) => `<button type="button" class="is-${entry.tone} ${index === 0 ? 'is-primary' : ''}" ${entry.action ? `data-action="${entry.action}" data-id="${esc(entry.id)}"` : `data-peak-view="${entry.view}"`}><b>${String(index + 1).padStart(2, '0')}</b><span><small>${esc(entry.eyebrow)}</small><strong>${esc(entry.title)}</strong><em>${esc(entry.detail)}</em></span><i>${esc(entry.cta)}</i></button>`).join('')}</div></details>
                <div class="peak-town-portals"><button type="button" class="is-expedition ${recommendedView === 'map' ? 'is-recommended' : ''}" data-peak-view="map"><img src="assets/card/ui/enter.png" alt=""><span><small>副本入口</small><strong>远征之门</strong><em>${save.stamina.current}/${save.stamina.max} TP</em></span></button><button type="button" class="is-trial ${recommendedView === 'trial' ? 'is-recommended' : ''}" data-peak-view="trial"><img src="assets/card/ui/enterhole.png" alt=""><span><small>特殊区域</small><strong>巅峰试炼</strong><em>${character.level < 15 ? 'Lv.15开放' : trial ? `${trial.floor}F · ${trial.phase === 'choosing' ? '选择增益' : trial.phase === 'ready' ? '待挑战' : trial.phase === 'fighting' ? '进行中' : '可重启'}` : '12层'}</em></span>${trial?.phase === 'choosing' ? '<b>!</b>' : ''}</button></div>
                ${npcs.map((entry) => `<button type="button" class="peak-town-npc ${recommendedView === entry.view ? 'is-recommended' : ''}" data-peak-view="${entry.view}" data-town-status="${entry.alert ? 'ready' : 'available'}" style="--npc-x:${entry.x}%"><span class="peak-town-npc-marker">${entry.alert || (recommendedView === entry.view ? '›' : '')}</span><img src="${entry.art}" alt="${esc(entry.name)}"><span class="peak-town-npc-name"><small>${esc(entry.role)}</small><strong>${esc(entry.name)}</strong><em>${esc(entry.text)}</em></span></button>`).join('')}
                <div class="peak-town-avatar"><span class="peak-town-player-name"><i>Lv.${character.level}</i><strong>${esc(character.name)}</strong><small>${esc(getPeakCharacterJobName(character))}</small></span><img src="${characterPortrait(character)}" alt="${esc(character.name)}">${advancement.available ? `<button type="button" data-action="open-advancement" data-id="${character.id}"><b>!</b>${advancement.tier === 1 ? '一转' : '二转'}任务</button>` : ''}</div>
                <div class="peak-town-chat"><small>GUIDE</small><span>推荐行动：${esc(primaryGuide.title)} · ${esc(primaryGuide.detail)}</span></div>
            </div>
            <footer class="peak-town-command-bar"><section class="peak-town-character-hud"><div class="peak-town-hud-portrait"><img src="${characterPortrait(character)}" alt=""><b>${character.level}</b></div><div><strong>${esc(character.name)}</strong><small>${esc(definition.name)} · ${esc(getPeakCharacterJobName(character))}</small><i class="is-hp"><b style="width:100%"></b><span>HP ${stats.hp}</span></i><i class="is-mp"><b style="width:100%"></b><span>MP ${stats.mp}</span></i></div></section><nav aria-label="城镇快捷功能">${['成长', '冒险', '交易'].map((group) => `<section class="peak-town-command-group"><small>${group}</small><div>${facilities.filter((entry) => entry.group === group).map((entry) => `<button type="button" class="${recommendedView === entry.view ? 'is-recommended' : ''}" data-peak-view="${entry.view}" title="${esc(entry.name)} · ${esc(entry.text)}"><kbd>${entry.hotkey}</kbd><i class="${entry.art ? 'has-art' : ''}" style="${entry.art ? `--town-command-art:url('${entry.art}');--town-command-size:${entry.artSize || 'contain'};--town-command-position:${entry.artPosition || 'center'}` : ''}">${entry.art ? '' : entry.icon}</i><span>${entry.name}</span>${entry.alert ? `<b>${esc(entry.alert)}</b>` : ''}</button>`).join('')}</div></section>`).join('')}</nav><aside><small>系统</small><button type="button" data-peak-view="roster"><i>角</i><span>角色</span></button></aside></footer>
        </section>`;
    };

    const renderMap = () => {
        const chosen = selectedDungeon();
        const unlocked = save.progress.unlockedDungeons.includes(chosen.id);
        const deckCheck = validatePeakDeck(activeDeck().cards, save.activeClass, activeCollection(), activeCharacter().advancement);
        const deck = activeDeck();
        const startBlockReason = !unlocked
            ? '当前难度尚未解锁'
            : !deckCheck.valid
                ? (deckCheck.errors[0] || '当前卡组无法出战')
                : save.stamina.current < chosen.staminaCost
                    ? `体力不足：需要 ${chosen.staminaCost}，当前 ${save.stamina.current}`
                    : '';
        const dungeonGroups = PEAK_DUNGEONS.reduce((groups, dungeon) => {
            const current = groups.at(-1);
            if (current?.baseId === dungeon.baseId) current.dungeons.push(dungeon);
            else groups.push({ baseId: dungeon.baseId, baseName: dungeon.baseName, areaName: dungeon.areaName, backdrop: dungeon.backdrop, dungeons: [dungeon] });
            return groups;
        }, []);
        content.innerHTML = `
            <div class="peak-map-layout">
                <section class="peak-map-list" aria-label="副本地图">
                    <header class="peak-view-title peak-map-title"><span>01</span><div><small>EXPEDITION SELECT</small><h3>选择远征区域</h3><p>先选区域，再选择难度。已解锁的最高区域会优先推荐。</p></div><strong>${save.progress.unlockedDungeons.length}/${PEAK_DUNGEONS.length} 已解锁</strong></header>
                    <div class="peak-map-grid">
                        ${dungeonGroups.map((group, groupIndex) => {
                            const unlockedCount = group.dungeons.filter((entry) => save.progress.unlockedDungeons.includes(entry.id)).length;
                            const clearedCount = group.dungeons.filter((entry) => Number(save.progress.cleared[entry.id]) > 0).length;
                            const groupState = unlockedCount === group.dungeons.length ? '已开放' : unlockedCount ? '部分开放' : '未开放';
                            return `<article class="peak-map-row ${group.dungeons.some((entry) => entry.id === chosen.id) ? 'is-selected' : ''}">
                            <header style="--peak-map-thumb:url('${group.backdrop}')">
                                <span class="peak-map-zone-index">${String(groupIndex + 1).padStart(2, '0')}</span>
                                <div><small>${esc(group.areaName)}</small><strong>${esc(group.baseName)}</strong><em>${groupState} · ${clearedCount}/${group.dungeons.length}难度已通关</em></div>
                                <i class="peak-map-zone-progress"><b style="width:${Math.round((unlockedCount / group.dungeons.length) * 100)}%"></b></i>
                            </header>
                            <div class="peak-map-difficulties">
                                ${group.dungeons.map((dungeon) => {
                                    const isUnlocked = save.progress.unlockedDungeons.includes(dungeon.id);
                                    const cleared = Number(save.progress.cleared[dungeon.id]) || 0;
                                    const stateLabel = cleared ? `已通关 ×${cleared}` : isUnlocked ? '可挑战' : '未解锁';
                                    return `<button type="button" class="peak-map-entry ${dungeon.id === chosen.id ? 'active' : ''} ${isUnlocked ? 'is-unlocked' : 'locked'} ${cleared ? 'is-cleared' : ''}" data-action="select-dungeon" data-id="${dungeon.id}" data-difficulty="${dungeon.difficultyId}" style="--peak-difficulty:${dungeon.difficultyTone}">
                                        <i class="peak-map-entry-mark">${dungeon.difficultyIndex + 1}</i><span><small>${esc(dungeon.difficultyName)}</small><strong>推荐 LV.${dungeon.recommendedLevel}</strong><em>${stateLabel}</em></span><b>${dungeon.staminaCost} TP</b>
                                    </button>`;
                                }).join('')}
                            </div>
                        </article>`;
                        }).join('')}
                    </div>
                </section>
                <aside class="peak-mission-brief" style="--peak-map-bg:url('${chosen.backdrop}')">
                    <div class="peak-mission-scene">
                        <img src="${chosen.enemy.image}" alt="${esc(chosen.enemy.name)}">
                        <span>${esc(chosen.areaName)}<small>${esc(chosen.difficultyName)} · ${unlocked ? '可挑战' : '未解锁'}</small></span>
                    </div>
                    <div class="peak-mission-copy">
                        <div class="peak-map-selection-kicker"><span>当前选择</span><strong>${esc(chosen.difficultyName)}</strong><em>${chosen.staminaCost} TP</em></div>
                        <small>${esc(chosen.difficultyName)}挑战 · 推荐 LV.${chosen.recommendedLevel}</small>
                        <h3>${esc(chosen.baseName)}</h3>
                        <p>${esc(chosen.areaIntro)}</p>
                        <div class="peak-map-deck-switch"><span>出战卡组</span><div>${deck.presets.map((preset, index) => `<button type="button" class="${preset.id === deck.activePresetId ? 'active' : ''}" data-action="switch-deck-preset" data-id="${preset.id}" aria-pressed="${preset.id === deck.activePresetId}"><small>0${index + 1}</small><strong>${esc(preset.name)}</strong><b>${preset.cards.length}张</b></button>`).join('')}</div></div>
                        <dl><div><dt>目标</dt><dd>${esc(chosen.enemy.name)}</dd></div><div><dt>敌方强度</dt><dd>${esc(chosen.difficultyName)} · ${esc(chosen.enemy.archetypeName || '均衡')}流 · 卡牌 Lv.${chosen.enemy.cardLevel} · 抽${chosen.enemy.drawPerTurn}</dd></div><div><dt>生命 / 攻击</dt><dd>${chosen.enemy.maxHp.toLocaleString('zh-CN')} / ${chosen.enemy.combatAttack}</dd></div><div><dt>物防 / 魔防</dt><dd>${chosen.enemy.physicalDefense} / ${chosen.enemy.magicalDefense}</dd></div><div><dt>遭遇顺序</dt><dd>${chosen.encounters.length > 1 ? esc(chosen.encounters.map((entry) => `${entry.isBoss ? '首领 ' : ''}${entry.name}`).join(' → ')) : '单场对决'}</dd></div><div><dt>消耗</dt><dd>${chosen.staminaCost} 体力 · ${activeDeck().cards.length} 张卡</dd></div><div><dt>金币保底</dt><dd>${chosen.guaranteedGold.toLocaleString('zh-CN')} 金币 · 实际结算取更高值</dd></div><div><dt>基础掉落</dt><dd>${chosen.baseItemCount} 件装备 · ${esc(chosen.lootHint)}</dd></div>${chosen.cardRewardChance ? `<div class="peak-map-card-reward"><dt>困难卡牌</dt><dd>${Math.round(chosen.cardRewardChance * 100)}% 获得1张 · 最高罕见（紫）</dd></div>` : ''}<div><dt>收益倍率</dt><dd>金币 ×${chosen.goldMultiplier.toFixed(2)} · 经验 ×${chosen.xpMultiplier.toFixed(2)}</dd></div>${chosen.hasEncounterChain ? `<div><dt>小怪掉落</dt><dd>每只 ${(chosen.minionDropChance * 100).toFixed(0)}% · 通关后发放</dd></div>` : ''}<div><dt>战术</dt><dd>${esc(chosen.enemy.tactics)}</dd></div></dl>
                        <button class="btn btn-primary" type="button" data-action="start-battle" title="${esc(startBlockReason || '开始当前远征')}" ${startBlockReason ? 'disabled' : ''}>开始对决</button>
                        ${startBlockReason ? `<p class="peak-inline-error">${esc(startBlockReason)}</p>` : ''}
                    </div>
                </aside>
            </div>`;
    };

    const renderDeck = () => {
        const deck = activeDeck();
        const collection = activeCollection();
        const check = validatePeakDeck(deck.cards, save.activeClass, collection, activeCharacter().advancement);
        const counts = deck.cards.reduce((result, id) => ({ ...result, [id]: (result[id] || 0) + 1 }), {});
        const analysis = analyzePeakDeck(deck.cards, save.activeClass, activeCharacter().advancement, collection);
        const available = queryPeakCards(
            getAvailableCards(save.activeClass, activeCharacter().advancement).filter((card) => collection[card.id]?.unlocked),
            { query: deckQuery, rarity: deckRarityFilter, category: deckTypeFilter, sort: deckSort },
            { collection, advancement: activeCharacter().advancement },
        );
        const availablePage = paginatePeakCards(available, deckPage, PEAK_CARD_PAGE_SIZE);
        deckPage = availablePage.page;
        const composition = Object.keys(PEAK_CARD_CATEGORIES).map((category) => [category, deck.cards.filter((id) => PEAK_CARD_BY_ID[id]?.category === category).length]);
        const option = (value, current, label) => `<option value="${value}" ${value === current ? 'selected' : ''}>${esc(label)}</option>`;
        const maxCostCount = Math.max(1, ...Object.values(analysis.costCurve));
        const analysisWarnings = analysis.warnings.length
            ? `<div class="peak-deck-analysis-warnings">${analysis.warnings.map((entry) => `<div class="is-${entry.severity}"><b>${esc(entry.label)}</b><span>${esc(entry.detail)}</span></div>`).join('')}</div>`
            : '<div class="peak-deck-analysis-ok">构筑结构完整，可直接进入战斗。</div>';
        const deckRowsMarkup = Object.entries(counts).map(([id, count]) => {
            const card = PEAK_CARD_BY_ID[id];
            return `<div class="peak-deck-row" style="${rarityStyle(card.rarity)}"><span>${esc(categoryName(card))}</span><strong>${esc(card.name)}</strong><small>Lv.${collection[id]?.level || 1}</small><b>×${count}</b><button type="button" data-action="remove-deck-card" data-id="${id}" aria-label="移除${esc(card.name)}">−</button></div>`;
        }).join('');
        const emptyDeckMarkup = '<p class="peak-deck-empty">当前卡组为空，从可用卡牌中点击添加。</p>';
        content.innerHTML = `
            <div class="peak-deck-layout">
                <section class="peak-deck-column">
                    <nav class="peak-deck-presets" aria-label="卡组方案"><header><span>卡组方案</span><button type="button" data-action="open-rename-deck-preset">重命名当前方案</button></header><div>${deck.presets.map((preset, index) => `<article class="${preset.id === deck.activePresetId ? 'active' : ''}"><button type="button" data-action="switch-deck-preset" data-id="${preset.id}" aria-current="${preset.id === deck.activePresetId ? 'true' : 'false'}"><span>0${index + 1}</span><strong>${esc(preset.name)}</strong><small>${preset.cards.length} / 50 张</small></button>${preset.id !== deck.activePresetId ? `<button type="button" class="peak-deck-copy" data-action="open-copy-deck-preset" data-id="${preset.id}" title="用当前卡组覆盖${esc(preset.name)}">覆盖</button>` : '<b>使用中</b>'}</article>`).join('')}</div></nav>
                    <header class="peak-view-title"><span>02</span><div><small>ACTIVE DECK</small><h3>${esc(deck.name)}</h3></div><strong class="${check.valid ? 'valid' : 'invalid'}">${deck.cards.length}/50 · 均耗${analysis.averageCost.toFixed(1)}MP</strong></header>
                    <div class="peak-deck-composition">${composition.map(([category, count]) => `<span style="--peak-category:${PEAK_CARD_CATEGORIES[category].color}">${esc(PEAK_CARD_CATEGORIES[category].name)}<strong>${count}</strong></span>`).join('')}</div>
                    <section class="peak-deck-analysis">
                        <header><span>构筑分析</span><small>${analysis.size}张 · 起手${analysis.openerCount} · 击飞${analysis.launcherCount} · 浮空追击${analysis.airborneFollowCount} · 终结${analysis.finisherCount}</small></header>
                        <div class="peak-deck-analysis-metrics"><span>防守 <b>${analysis.defenseCount}</b></span><span>抽牌 <b>${analysis.drawCount}</b></span><span>回能 <b>${analysis.mpRecoveryCount}</b></span><span>状态 <b>${Object.keys(analysis.statusSources).length}</b></span></div>
                        <div class="peak-cost-curve" aria-label="MP消耗曲线">${Object.entries(analysis.costCurve).map(([cost, count]) => `<span style="--peak-cost-height:${Math.max(4, Math.round(count / maxCostCount * 100))}%"><i></i><b>${count}</b><small>${cost}MP</small></span>`).join('')}</div>
                        ${analysisWarnings}
                    </section>
                    <div class="peak-deck-list">
                        ${deckRowsMarkup || emptyDeckMarkup}
                    </div>
                    <div class="peak-deck-status ${check.valid ? 'valid' : 'invalid'}">${check.valid ? '卡组可用于战斗' : esc(check.errors[0])}</div>
                </section>
                <section class="peak-collection-column">
                    <header class="peak-view-title"><span>COL</span><div><small>OWNED CARDS</small><h3>可用卡牌</h3></div><strong>${availablePage.total}张</strong></header>
                    <aside class="peak-mobile-deck-tray" aria-label="当前已加入卡组" aria-live="polite"><header><span>当前卡组</span><strong>${deck.cards.length}/50</strong><small>左右滑动查看，点减号移除</small></header><div>${deckRowsMarkup || emptyDeckMarkup}</div></aside>
                    <div class="peak-deck-filters">
                        <label class="peak-card-search"><span>搜索</span><input type="search" data-deck-search value="${esc(deckQuery)}" placeholder="名称、效果、标签"></label>
                        <label><span>稀有度</span><select data-deck-filter="rarity">${option('all', deckRarityFilter, '全部稀有度')}${Object.entries(PEAK_CARD_RARITIES).filter(([, entry]) => !entry.reserved).map(([id, entry]) => option(id, deckRarityFilter, entry.name)).join('')}</select></label>
                        <label><span>卡牌类型</span><select data-deck-filter="type">${option('all', deckTypeFilter, '全部类型')}${Object.entries(PEAK_CARD_CATEGORIES).map(([id, entry]) => option(id, deckTypeFilter, entry.name)).join('')}</select></label>
                        <label><span>排序</span><select data-deck-filter="sort">${option('rarity', deckSort, '稀有度')}${option('cost-asc', deckSort, 'MP低→高')}${option('cost-desc', deckSort, 'MP高→低')}${option('name', deckSort, '名称')}</select></label>
                    </div>
                    <div class="peak-card-grid compact">
                        ${availablePage.items.map((card) => {
                            const owned = collection[card.id]?.copies || 0;
                            const used = counts[card.id] || 0;
                            return `<button class="peak-card-button" type="button" data-action="add-deck-card" data-id="${card.id}" ${used >= owned || deck.cards.length >= 50 ? 'disabled' : ''}>${cardMarkup(card, collection[card.id]?.level || 1)}<span class="peak-owned-count">${used}/${owned}</span></button>`;
                        }).join('')}
                    </div>
                    ${cardPaginationMarkup('deck', availablePage)}
                </section>
            </div>`;
    };

    const renderCodex = () => {
        const collection = activeCollection();
        const activeClassId = activeCharacter()?.baseClassId || save.activeClass;
        const activeClassName = PEAK_CHARACTERS[activeClassId]?.name || '当前职业';
        const upgradeableIds = new Set(PEAK_CARDS.filter((card) => {
            const entry = collection[card.id];
            const cost = getPeakCardUpgradeCost(save, card.id);
            const classShards = card.classId === 'all' ? 0 : getPeakClassShardBalance(save, card.classId, card.rarity);
            return Boolean(cost && (entry?.upgradeCopies || 0) + classShards + getPeakUniversalShardBalance(save, card.rarity) >= cost.copies && save.wallet.gold >= cost.gold);
        }).map((card) => card.id));
        const filteredCards = queryPeakCards(PEAK_CARDS, {
            query: codexQuery,
            classId: codexClassFilter,
            rarity: codexRarityFilter,
            category: codexTypeFilter,
            ownership: codexOwnershipFilter,
            advancement: codexAdvancementFilter,
            sort: codexSort,
        }, { collection, advancement: activeCharacter()?.advancement, upgradeableIds });
        const pageData = paginatePeakCards(filteredCards, codexPage, PEAK_CARD_PAGE_SIZE);
        codexPage = pageData.page;
        const pageCards = pageData.items;
        const selected = pageCards.find((card) => card.id === selectedCodexId) || pageCards[0] || null;
        selectedCodexId = selected?.id || '';
        const selectedEntry = selected ? collection[selected.id] : null;
        const selectedLevel = selectedEntry?.level || 1;
        const upgradeCost = selected ? getPeakCardUpgradeCost(save, selected.id) : null;
        const selectedUniversalShardBalance = selected ? getPeakUniversalShardBalance(save, selected.rarity) : 0;
        const selectedClassShardBalance = selected?.classId && selected.classId !== 'all' ? getPeakClassShardBalance(save, selected.classId, selected.rarity) : 0;
        const requiredAfterCopies = upgradeCost ? Math.max(0, upgradeCost.copies - (selectedEntry?.upgradeCopies || 0)) : 0;
        const projectedClassShardsUsed = Math.min(selectedClassShardBalance, requiredAfterCopies);
        const projectedUniversalShardsUsed = requiredAfterCopies - projectedClassShardsUsed;
        const selectedMaterialBalance = (selectedEntry?.upgradeCopies || 0) + selectedClassShardBalance + selectedUniversalShardBalance;
        const selectedClassName = selected?.classId && selected.classId !== 'all' ? PEAK_CHARACTERS[selected.classId]?.name : '';
        const duplicateShardLabel = selectedClassName ? `${selectedClassName}碎片` : '通用碎片';
        const upgradeMaterialText = upgradeCost
            ? [`同名卡${Math.min(selectedEntry?.upgradeCopies || 0, upgradeCost.copies)}`, projectedClassShardsUsed ? `${selectedClassName}碎片${projectedClassShardsUsed}` : '', projectedUniversalShardsUsed ? `通用碎片${projectedUniversalShardsUsed}` : ''].filter(Boolean).join(' + ') || '材料充足'
            : '';
        const selectedRouteAvailable = selected ? meetsAdvancementRequirement(selected, activeCharacter()?.advancement) : true;
        const option = (value, current, label) => `<option value="${value}" ${value === current ? 'selected' : ''}>${esc(label)}</option>`;
        const inspector = selected ? `
            ${cardMarkup(selected, selectedLevel)}
            <dl><div><dt>详细效果</dt><dd>${esc(effectText(selected, selectedLevel))}</dd></div><div><dt>${selected.category === 'attack' ? '适用状态' : '释放条件'}</dt><dd>${esc(conditionText(selected))}</dd></div><div><dt>职业</dt><dd>${selected.classId === 'all' ? '通用' : esc(PEAK_CHARACTERS[selected.classId].name)}</dd></div>${selected.requiredAdvancement ? `<div class="${selectedRouteAvailable ? 'is-route-ready' : 'is-route-locked'}"><dt>转职要求</dt><dd>${esc(advancementRequirementText(selected))}${selectedRouteAvailable ? ' · 已满足' : ' · 未满足'}</dd></div>` : ''}<div><dt>同名卡</dt><dd>${selectedEntry?.upgradeCopies || 0}${upgradeCost ? ` / ${upgradeCost.copies}` : ''}</dd></div>${selectedClassName ? `<div><dt>${esc(PEAK_CARD_RARITIES[selected.rarity]?.name)}${esc(selectedClassName)}碎片</dt><dd>${selectedClassShardBalance} · 本职业卡可用</dd></div>` : ''}<div><dt>${esc(PEAK_CARD_RARITIES[selected.rarity]?.name)}通用碎片</dt><dd>${selectedUniversalShardBalance} · 所有职业可用</dd></div></dl>
            ${cardFormulaMarkup(selected, selectedLevel, true)}
            ${upgradeCost ? `<p class="peak-card-upgrade-preview">${esc(peakUpgradePreview(selected, selectedLevel))}</p>` : ''}
            <div class="peak-card-upgrade">${upgradeCost ? `<div><span>Lv.${upgradeCost.fromLevel} → Lv.${upgradeCost.toLevel} · ${esc(upgradeMaterialText)}</span><strong>${upgradeCost.gold} 金币</strong></div>` : `<strong>${selectedEntry?.unlocked ? '已达到最高等级' : '尚未解锁'}</strong>`}<footer>${upgradeCost ? `<button type="button" data-action="upgrade-card" data-id="${selected.id}" ${!selectedRouteAvailable || !selectedEntry?.unlocked || selectedMaterialBalance < upgradeCost.copies || save.wallet.gold < upgradeCost.gold ? 'disabled' : ''}>${selectedRouteAvailable ? '升级卡牌' : '转职后可升级'}</button>` : ''}<button class="is-shard-convert" type="button" data-action="convert-card-shards" data-id="${selected.id}" ${(selectedEntry?.upgradeCopies || 0) < PEAK_DUPLICATE_TO_SHARD_RATE ? 'disabled' : ''}>${PEAK_DUPLICATE_TO_SHARD_RATE}张同名卡 → 1${esc(duplicateShardLabel)}</button>${selectedClassName ? `<button class="is-shard-exchange" type="button" data-action="convert-class-shards" data-id="${selected.id}" ${selectedClassShardBalance < PEAK_CLASS_SHARD_EXCHANGE_RATE ? 'disabled' : ''}>${PEAK_CLASS_SHARD_EXCHANGE_RATE}${esc(selectedClassName)}碎片 → 1通用</button>` : ''}</footer></div>` : '<div class="peak-codex-empty"><strong>没有符合条件的卡牌</strong><span>请调整图鉴筛选条件</span></div>';
        content.innerHTML = `
            <div class="peak-codex-layout">
                <section>
                    <header class="peak-view-title"><span>03</span><div><small>CARD ARCHIVE</small><h3>卡牌图鉴</h3></div><strong>${pageData.total}/${PEAK_CARDS.length}</strong></header>
                    <div class="peak-codex-shard-bank"><header><strong>碎片仓库</strong><small>职业碎片1:1升级本职业 · ${PEAK_CLASS_SHARD_EXCHANGE_RATE}:1兑换通用</small></header><div class="peak-shard-bank-groups"><section><header><strong>通用碎片</strong><small>所有职业可用</small></header><div class="peak-shard-grid">${PEAK_UNIVERSAL_SHARD_RARITIES.map((rarity) => `<span style="--peak-shard:${PEAK_CARD_RARITIES[rarity].color}"><small>${esc(PEAK_CARD_RARITIES[rarity].name)}</small><b>${getPeakUniversalShardBalance(save, rarity)}</b></span>`).join('')}</div></section><section><header><strong>${esc(activeClassName)}碎片</strong><small>仅升级${esc(activeClassName)}卡牌</small></header><div class="peak-shard-grid">${PEAK_UNIVERSAL_SHARD_RARITIES.map((rarity) => `<span style="--peak-shard:${PEAK_CARD_RARITIES[rarity].color}"><small>${esc(PEAK_CARD_RARITIES[rarity].name)}</small><b>${getPeakClassShardBalance(save, activeClassId, rarity)}</b></span>`).join('')}</div></section></div></div>
                    <div class="peak-codex-filters">
                        <label class="peak-card-search"><span>搜索</span><input type="search" data-codex-search value="${esc(codexQuery)}" placeholder="名称、效果、标签、状态、元素"></label>
                        <label><span>分类</span><select data-codex-filter="class">${option('all', codexClassFilter, '全部分类')}${option('shared', codexClassFilter, '通用')}${Object.values(PEAK_CHARACTERS).map((entry) => option(entry.id, codexClassFilter, entry.name)).join('')}</select></label>
                        <label><span>稀有度</span><select data-codex-filter="rarity">${option('all', codexRarityFilter, '全部稀有度')}${Object.entries(PEAK_CARD_RARITIES).map(([id, entry]) => option(id, codexRarityFilter, entry.name)).join('')}</select></label>
                        <label><span>卡牌类型</span><select data-codex-filter="type">${option('all', codexTypeFilter, '全部类型')}${Object.entries(PEAK_CARD_CATEGORIES).map(([id, entry]) => option(id, codexTypeFilter, entry.name)).join('')}</select></label>
                        <label><span>拥有</span><select data-codex-filter="ownership">${option('all', codexOwnershipFilter, '全部卡牌')}${option('owned', codexOwnershipFilter, '已拥有')}${option('unowned', codexOwnershipFilter, '未拥有')}${option('upgradeable', codexOwnershipFilter, '可升级')}</select></label>
                        <label><span>路线</span><select data-codex-filter="advancement">${option('all', codexAdvancementFilter, '全部路线')}${option('available', codexAdvancementFilter, '当前可用')}${option('locked', codexAdvancementFilter, '转职解锁')}</select></label>
                        <label><span>排序</span><select data-codex-filter="sort">${option('rarity', codexSort, '稀有度')}${option('cost-asc', codexSort, 'MP低→高')}${option('cost-desc', codexSort, 'MP高→低')}${option('level', codexSort, '卡牌等级')}${option('copies', codexSort, '持有数量')}${option('name', codexSort, '名称')}</select></label>
                    </div>
                    <div class="peak-card-grid compact">
                        ${pageCards.map((card) => { const routeAvailable = meetsAdvancementRequirement(card, activeCharacter()?.advancement); return `<button class="peak-card-button ${card.id === selected?.id ? 'selected' : ''} ${routeAvailable ? '' : 'is-advancement-locked'}" type="button" data-action="select-codex" data-id="${card.id}">${cardMarkup(card, collection[card.id]?.level || 1)}${!routeAvailable ? `<span class="peak-card-route-lock">${esc(advancementRequirementText(card))}</span>` : ''}</button>`; }).join('')}
                        ${pageData.page === 1 && (codexRarityFilter === 'all' || codexRarityFilter === 'mythic') ? '<div class="peak-mythic-slot"><span>神话</span><strong>未知卡牌</strong><small>尚未被发现</small></div>' : ''}
                        ${!pageCards.length && codexRarityFilter !== 'mythic' ? '<div class="peak-codex-grid-empty">暂无符合条件的卡牌</div>' : ''}
                    </div>
                    ${cardPaginationMarkup('codex', pageData)}
                </section>
                <aside class="peak-card-inspector" style="${rarityStyle(selected?.rarity)}">${inspector}</aside>
            </div>`;
    };

    const renderCharacter = () => {
        const character = activeCharacter();
        const definition = PEAK_CHARACTERS[character.baseClassId];
        const stats = getPeakCharacterStats(save);
        const inventoryItems = character.inventory.filter((item) => {
            const equipped = character.equipped[item.slot] === item.id;
            return (inventorySlotFilter === 'all' || item.slot === inventorySlotFilter)
                && (inventoryRarityFilter === 'all' || item.rarity === inventoryRarityFilter)
                && (inventoryStatFilter === 'all' || Object.prototype.hasOwnProperty.call(item.stats || {}, inventoryStatFilter))
                && (inventoryStatusFilter === 'all'
                    || (inventoryStatusFilter === 'equipped' && equipped)
                    || (inventoryStatusFilter === 'unequipped' && !equipped)
                    || (inventoryStatusFilter === 'locked' && item.locked)
                    || (inventoryStatusFilter === 'available' && !item.locked && !equipped));
        });
        const visibleInventoryIds = new Set(inventoryItems.map((item) => item.id));
        selectedInventoryIds = new Set([...selectedInventoryIds].filter((id) => visibleInventoryIds.has(id)));
        const selectedInventoryCount = selectedInventoryIds.size;
        const selectedSellableCount = inventoryItems.filter((item) => selectedInventoryIds.has(item.id) && !item.locked && character.equipped[item.slot] !== item.id).length;
        const selectedItem = inventoryItems.find((item) => item.id === selectedEquipmentId) || inventoryItems[0] || null;
        selectedEquipmentId = selectedItem?.id || '';
        const selectedRarity = selectedItem ? PEAK_EQUIPMENT_RARITIES[selectedItem.rarity] : null;
        const selectedEquipped = selectedItem && character.equipped[selectedItem.slot] === selectedItem.id;
        const selectedWeaponClassName = selectedItem?.slot === 'weapon' ? PEAK_CHARACTERS[selectedItem.classId]?.name || '未知职业' : '';
        const selectedWeaponClassMismatch = Boolean(selectedItem?.slot === 'weapon' && selectedItem.classId !== character.baseClassId);
        const comparedItem = selectedItem && !selectedEquipped
            ? character.inventory.find((item) => item.id === character.equipped[selectedItem.slot]) || null
            : null;
        const comparedStats = selectedItem ? [...new Set([...Object.keys(selectedItem.stats || {}), ...Object.keys(comparedItem?.stats || {})])].map((stat) => {
            const value = Number(selectedItem.stats?.[stat]) || 0;
            const difference = value - (Number(comparedItem?.stats?.[stat]) || 0);
            return { stat, value, difference };
        }) : [];
        const statRows = [
            ['力量', stats.strength], ['智力', stats.intelligence], ['体力', stats.vitality], ['精神', stats.spirit],
            ['物理攻击', stats.physicalAttack], ['魔法攻击', stats.magicalAttack], ['独立攻击', stats.independentAttack],
            ['物理防御', stats.physicalDefense], ['魔法防御', stats.magicalDefense], ['生命', stats.hp], ['MP', stats.mp],
            ['物理暴击', `${Number(stats.physicalCrit || 0).toFixed(1)}%`], ['魔法暴击', `${Number(stats.magicalCrit || 0).toFixed(1)}%`],
            ['物理穿透', `${Number(stats.physicalPenetration || 0).toFixed(1)}%`], ['魔法穿透', `${Number(stats.magicalPenetration || 0).toFixed(1)}%`],
            ['伤害增加', `${Number(stats.damageIncrease || 0).toFixed(1)}%`], ['技能攻击力', `${Number(stats.skillAttack || 0).toFixed(1)}%`],
            ['暴击伤害', `${Number(stats.criticalDamage || 0).toFixed(1)}%`], ['伤害减免', `${Number(stats.damageReduction || 0).toFixed(1)}%`],
            ['全属性强化', stats.allElement || 0], ['火属性强化', stats.fireElement || 0], ['冰属性强化', stats.iceElement || 0],
            ['光属性强化', stats.lightElement || 0], ['暗属性强化', stats.darkElement || 0], ['所有技能等级', `+${Math.floor(stats.allSkillLevel || 0)}`],
            ['每回合抽牌', playerDrawPerTurn(character.level)], ['自然回蓝', `${getPeakPlayerMpRecovery(stats.mp)}/回合`],
        ];
        content.innerHTML = `
            <div class="peak-character-layout">
                <section class="peak-character-stage peak-equipment-sidebar">
                    <div class="peak-class-switch"><button type="button" class="active" data-action="open-roster">角色选择</button><span>${esc(character.name)} · ${esc(getPeakCharacterJobName(character))}</span></div>
                    <div class="peak-character-portrait" style="--peak-accent:${PEAK_ADVANCEMENTS[character.advancement.pathId]?.accent || definition.accent}"><img src="${characterPortrait(character)}" alt="${esc(definition.name)}"><span>LV.${character.level}</span><strong>${esc(getPeakCharacterJobName(character))}</strong><small>${esc(character.name)} · 经验 ${character.xp}${character.overflowXp ? ` · 储存 ${character.overflowXp}` : ''}</small></div>
                    <div class="peak-equipment-section-head"><div><small>EQUIPPED</small><h4>当前装备</h4></div><strong>${PEAK_EQUIPMENT_SLOTS.filter((slot) => character.equipped[slot]).length}/${PEAK_EQUIPMENT_SLOTS.length}</strong></div>
                    <div class="peak-equipment-grid">
                        ${PEAK_EQUIPMENT_SLOTS.map((slot) => {
                            const item = character.inventory.find((entry) => entry.id === character.equipped[slot]);
                            const rarity = item ? PEAK_EQUIPMENT_RARITIES[item.rarity] : null;
                            return `<button type="button" class="peak-equipment-slot ${item ? 'equipped' : ''}" style="--peak-item-color:${rarity?.color || '#56616d'}" ${item ? `data-action="select-equipment" data-id="${item.id}" data-reset-inventory-filters="true"` : 'disabled'}>${equipmentIconMarkup(slot, item?.rarity, item?.name)}<span>${esc(PEAK_EQUIPMENT_SLOT_LABELS[slot])}</span><strong>${item ? esc(item.name) : '未装备'}</strong>${item ? `<small>LV.${item.level} · ${esc(rarity?.name || '')} · ${esc(PEAK_EQUIPMENT_GRADES[item.grade]?.name || item.grade)}</small>` : ''}</button>`;
                        }).join('')}
                    </div>
                    <div class="peak-equipment-section-head"><div><small>ITEM DETAILS</small><h4>装备信息</h4></div>${selectedItem ? `<strong style="color:${selectedRarity?.color || '#aab5bb'}">${esc(selectedRarity?.name || '')}</strong>` : ''}</div>
                    <aside class="peak-item-inspector" style="--peak-item-color:${selectedRarity?.color || '#63727d'}">
                        ${selectedItem ? `<header><span>${esc(selectedRarity?.name || '')} · ${esc(PEAK_EQUIPMENT_GRADES[selectedItem.grade]?.name || selectedItem.grade)}</span><strong>${esc(selectedItem.name)}</strong><small>Lv.${selectedItem.level} ${esc(PEAK_EQUIPMENT_SLOT_LABELS[selectedItem.slot])} · ${selectedItem.slot === 'weapon' ? `${esc(selectedWeaponClassName)}专属` : '通用装备'}</small>${comparedItem ? `<em>对比：${esc(comparedItem.name)}</em>` : ''}</header><dl>${comparedStats.map(({ stat, value, difference }) => `<div><dt>${esc(statNames[stat] || stat)}</dt><dd>+${formatEquipmentValue(value)}${comparedItem && difference !== 0 ? `<small class="${difference > 0 ? 'up' : 'down'}">${difference > 0 ? '↑ +' : '↓ '}${formatEquipmentValue(difference)}</small>` : ''}</dd></div>`).join('')}</dl><footer>${selectedEquipped ? `<button type="button" data-action="unequip-item" data-slot="${selectedItem.slot}">卸下</button>` : `<button type="button" data-action="equip-item" data-id="${selectedItem.id}" ${character.level < selectedItem.level || selectedWeaponClassMismatch ? 'disabled' : ''}>${selectedWeaponClassMismatch ? '职业不符' : character.level < selectedItem.level ? `需要 Lv.${selectedItem.level}` : '穿戴'}</button>`}<button type="button" data-action="lock-item" data-id="${selectedItem.id}">${selectedItem.locked ? '解锁' : '锁定'}</button><button class="danger" type="button" data-action="sell-item" data-id="${selectedItem.id}" ${selectedItem.locked || selectedEquipped ? 'disabled' : ''}>出售 ${selectedItem.price}</button></footer>` : '<p class="peak-item-inspector-empty">选择右侧背包中的装备查看属性</p>'}
                    </aside>
                    <details class="peak-character-stats">
                        <summary><span>角色属性</span><strong>${definition.name} · Lv.${character.level}</strong></summary>
                        <div class="peak-stat-grid">${statRows.map(([label, value]) => `<div><span>${label}</span><strong>${typeof value === 'number' ? Math.round(value) : esc(value)}</strong></div>`).join('')}</div>
                    </details>
                </section>
                <section class="peak-equipment-panel peak-equipment-inventory">
                    <header class="peak-view-title peak-view-title-with-npc"><span>04</span><div><small>EQUIPMENT INVENTORY</small><h3>装备背包</h3></div><div class="peak-npc-label"><small>装备商人</small><strong>整备与鉴定</strong></div><img src="${npcArt.equipment}" alt="装备商人"></header>
                    <div class="peak-inventory-head"><div><small>INVENTORY</small><h4>装备背包</h4></div><strong>${inventoryItems.length}/${character.inventory.length} · ${character.inventory.length}/120</strong></div>
                    <div class="peak-inventory-filters">
                        <label><span>部位</span><select data-inventory-filter="slot"><option value="all">全部部位</option>${PEAK_EQUIPMENT_SLOTS.map((slot) => `<option value="${slot}" ${inventorySlotFilter === slot ? 'selected' : ''}>${esc(PEAK_EQUIPMENT_SLOT_LABELS[slot])}</option>`).join('')}</select></label>
                        <label><span>稀有度</span><select data-inventory-filter="rarity"><option value="all">全部稀有度</option>${equipmentIconRarities.map((rarity) => `<option value="${rarity}" ${inventoryRarityFilter === rarity ? 'selected' : ''}>${esc(PEAK_EQUIPMENT_RARITIES[rarity]?.name || rarity)}</option>`).join('')}</select></label>
                        <label><span>状态</span><select data-inventory-filter="status"><option value="all" ${inventoryStatusFilter === 'all' ? 'selected' : ''}>全部状态</option><option value="equipped" ${inventoryStatusFilter === 'equipped' ? 'selected' : ''}>已装备</option><option value="unequipped" ${inventoryStatusFilter === 'unequipped' ? 'selected' : ''}>未装备</option><option value="locked" ${inventoryStatusFilter === 'locked' ? 'selected' : ''}>已锁定</option></select></label>
                    </div>
                    <div class="peak-inventory-filters peak-inventory-affix-filter"><label><span>词条</span><select data-inventory-filter="stat"><option value="all" ${inventoryStatFilter === 'all' ? 'selected' : ''}>全部词条</option>${PEAK_EQUIPMENT_STATS.map((stat) => `<option value="${stat}" ${inventoryStatFilter === stat ? 'selected' : ''}>${esc(statNames[stat] || stat)}</option>`).join('')}</select></label></div>
                    <div class="peak-inventory-bulk"><span>已选 ${selectedInventoryCount} 件</span><button type="button" data-action="select-visible-inventory" ${inventoryItems.length ? '' : 'disabled'}>全选当前</button><button type="button" data-action="clear-inventory-selection" ${selectedInventoryCount ? '' : 'disabled'}>清空</button><button type="button" data-action="bulk-lock-inventory" data-locked="true" ${selectedInventoryCount ? '' : 'disabled'}>批量锁定</button><button type="button" data-action="bulk-lock-inventory" data-locked="false" ${selectedInventoryCount ? '' : 'disabled'}>批量解锁</button><button class="danger" type="button" data-action="bulk-sell-inventory" ${selectedSellableCount ? '' : 'disabled'}>出售未锁装备 (${selectedSellableCount})</button></div>
                    <div class="peak-inventory-grid">
                        ${inventoryItems.map((item) => {
                            const rarity = PEAK_EQUIPMENT_RARITIES[item.rarity];
                            const equipped = character.equipped[item.slot] === item.id;
                            const selectedForBulk = selectedInventoryIds.has(item.id);
                            return `<button type="button" class="peak-inventory-item ${item.id === selectedItem?.id ? 'selected' : ''} ${equipped ? 'equipped' : ''} ${selectedForBulk ? 'bulk-selected' : ''}" style="--peak-item-color:${rarity?.color || '#dce3e7'}" data-action="select-equipment" data-id="${item.id}"><span class="peak-inventory-bulk-check ${selectedForBulk ? 'is-selected' : ''}" role="checkbox" aria-checked="${selectedForBulk}" tabindex="0" data-action="toggle-inventory-selection" data-id="${item.id}">${selectedForBulk ? '✓' : ''}</span>${equipmentIconMarkup(item.slot, item.rarity, item.name)}<span>${esc(item.name)}</span><small>Lv.${item.level} ${equipped ? 'E' : item.locked ? 'L' : ''}</small></button>`;
                        }).join('') || '<p class="peak-inventory-empty">没有符合筛选条件的装备</p>'}
                    </div>
                </section>
            </div>`;
    };

    const renderBlessing = () => {
        const character = activeCharacter();
        const status = getPeakBlessingStatus(save);
        const tree = PEAK_BLESSING_TREES[selectedBlessingTree] || PEAK_BLESSING_TREES.heroic;
        selectedBlessingTree = tree.id;
        const tierNames = { 1: '基础属性', 2: '进阶属性', 3: '复合属性', 4: '核心机制', 5: '核心强化', 6: '终极祝福' };
        const nextPointLevel = character.level >= 60 ? 0 : character.level + (character.level % 2 ? 1 : 2);
        const rankDots = (rank, maxRank) => Array.from({ length: maxRank }, (_, index) => `<i class="${index < rank ? 'filled' : ''}"></i>`).join('');
        const treeSpent = (treeId) => PEAK_BLESSING_TREES[treeId].nodes.reduce((sum, node) => sum + (status.ranks[node.id] || 0), 0);
        const nodeMarkup = (node) => {
            const rank = status.ranks[node.id] || 0;
            const maxed = rank >= node.maxRank;
            const missing = node.requires.find((requiredId) => (status.ranks[requiredId] || 0) < PEAK_BLESSING_BY_ID[requiredId].maxRank);
            const goldCost = node.goldBase + node.goldGrowth * rank;
            const canLearn = !maxed && !missing && status.available > 0 && save.wallet.gold >= goldCost;
            const stateClass = maxed ? 'maxed' : missing ? 'locked' : canLearn ? 'available' : 'unaffordable';
            const requirement = missing
                ? `前置：点满「${PEAK_BLESSING_BY_ID[missing].name}」`
                : !maxed && status.available < 1
                    ? '需要1点可用祝福点'
                    : !maxed && save.wallet.gold < goldCost
                        ? `还需 ${(goldCost - save.wallet.gold).toLocaleString('zh-CN')} 金币`
                        : node.requires.length ? `前置已完成` : '无前置要求';
            return `<button type="button" class="peak-blessing-node ${stateClass}" data-action="learn-blessing" data-id="${node.id}" ${canLearn ? '' : 'disabled'}>
                <header><span>${maxed ? '已精通' : missing ? '未解锁' : `第${node.tier}层`}</span><strong>${esc(node.name)}</strong><b>${rank}/${node.maxRank}</b></header>
                <div class="peak-blessing-ranks" aria-label="${rank}/${node.maxRank}级">${rankDots(rank, node.maxRank)}</div>
                <p>${esc(node.description)}</p>
                <footer><small>${esc(requirement)}</small><strong>${maxed ? 'MAX' : `${goldCost.toLocaleString('zh-CN')} 金币`}</strong></footer>
            </button>`;
        };
        content.innerHTML = `
            <section class="peak-blessing-view" style="--peak-tree-color:${tree.color}">
                <header class="peak-blessing-summary">
                    <div class="peak-blessing-heading"><small>BLESSING MATRIX</small><h3>祝福</h3><p>每个偶数等级获得1点，角色达到60级时共可获得30点。</p></div>
                    <div class="peak-blessing-class-switch"><button type="button" class="active" data-action="open-roster">${esc(character.name)}<small>${esc(getPeakCharacterJobName(character))} · Lv.${character.level}</small></button></div>
                    <div class="peak-blessing-counters"><div><span>可用点数</span><strong>${status.available}</strong></div><div><span>已获得</span><strong>${status.earned}</strong></div><div><span>已投入</span><strong>${status.spent}</strong></div><div><span>持有金币</span><strong>${save.wallet.gold.toLocaleString('zh-CN')}</strong></div></div>
                    <div class="peak-blessing-next"><span>${nextPointLevel ? `下一个祝福点：Lv.${nextPointLevel}` : '已获得全部等级祝福点'}</span><button type="button" data-action="open-blessing-reset" ${status.spent ? '' : 'disabled'}>重置祝福</button></div>
                </header>
                <nav class="peak-blessing-tabs" aria-label="祝福分类">
                    ${Object.values(PEAK_BLESSING_TREES).map((entry) => `<button type="button" class="${entry.id === tree.id ? 'active' : ''}" style="--tree-color:${entry.color}" data-action="select-blessing-tree" data-id="${entry.id}"><span>${esc(entry.name)}</span><small>${esc(entry.subtitle)}</small><b>${treeSpent(entry.id)}点</b></button>`).join('')}
                </nav>
                <div class="peak-blessing-tree" data-tree="${tree.id}">
                    ${[6, 5, 4, 3, 2, 1].map((tier) => `<section class="peak-blessing-tier" data-tier="${tier}"><header><span>0${tier}</span><div><small>TIER ${tier}</small><strong>${tierNames[tier]}</strong></div></header><div class="peak-blessing-tier-nodes">${tree.nodes.filter((node) => node.tier === tier).map(nodeMarkup).join('')}</div></section>`).join('')}
                </div>
            </section>`;
    };

    const renderShop = () => {
        const rarityOrder = Object.keys(PEAK_CARD_RARITIES);
        const character = activeCharacter();
        const advancementTier = Number(character?.advancement?.tier || 0);
        const packUnlocked = (pack) => !pack.minAdvancementTier || advancementTier >= Number(pack.minAdvancementTier);
        const affordablePacks = PEAK_PACKS.filter((pack) => packUnlocked(pack) && save.wallet.gold >= pack.price).length;
        content.innerHTML = `
            <section class="peak-shop-view">
                <header class="peak-view-title peak-view-title-with-npc peak-shop-heading"><span>05</span><div><small>CARD PACK STORE</small><h3>卡包商店</h3></div><div class="peak-npc-label"><small>卡包商人</small><strong>本期卡包已到货</strong></div><img src="${npcArt.store}" alt="卡包商人"><b>${save.wallet.gold.toLocaleString('zh-CN')} 金币</b></header>
                <div class="peak-shop-status"><div><span>可产史诗卡包连续未出</span><strong>${save.shop.epicPity}/50</strong></div><i aria-label="史诗保底进度 ${save.shop.epicPity}/50"><b style="width:${Math.min(100, save.shop.epicPity / 50 * 100)}%"></b></i><small>第50包保底史诗 · 前四张已出史诗则第五张恢复普通保底 · 高级及以下不累计</small></div>
                <div class="peak-pack-grid">
                    ${PEAK_PACKS.map((pack, index) => {
                        const highestRarity = [...rarityOrder].reverse().find((rarity) => pack.rates[rarity]);
                        const unlocked = packUnlocked(pack);
                        const affordable = unlocked && save.wallet.gold >= pack.price;
                        const voucherCost = PEAK_PACK_VOUCHER_COSTS[pack.id];
                        const voucherAffordable = unlocked && save.wallet.vouchers >= voucherCost;
                        const probability = getPeakPackProbabilitySummary(pack);
                        const guarantee = pack.guaranteeRarity
                            ? `第5张保底：至少${PEAK_CARD_RARITIES[pack.guaranteeRarity]?.name || pack.guaranteeRarity}`
                            : '第5张：按单张基础概率抽取';
                        const warning = pack.id === 'highest' && advancementTier < 2
                            ? '当前无法抽到转职史诗牌；完成二转后可抽到所选路线的转职史诗牌。'
                            : pack.poolMode === 'class' && !unlocked
                                ? '二转后开放：只包含当前基础职业及所选转职路线专属卡，不会抽到通用卡。'
                                : pack.poolMode === 'class'
                                    ? '职业定向：只包含当前基础职业及所选转职路线专属卡，不会抽到通用卡。'
                                    : '';
                        const stateText = !unlocked ? '尚未开放' : affordable || voucherAffordable ? '可购买' : '资源不足';
                        return `<article class="peak-pack ${unlocked ? '' : 'is-locked'} ${affordable || voucherAffordable ? '' : 'is-unaffordable'}" style="--peak-pack:${pack.tone}">
                            <div class="peak-pack-art"><img src="${packArt[pack.id] || packArt.highest}" alt="${esc(pack.name)}卡包"><span>${String(index + 1).padStart(2, '0')}</span><small>最高 ${esc(PEAK_CARD_RARITIES[highestRarity]?.name || '')}</small></div>
                            <header><div><small>${pack.poolMode === 'class' ? 'CLASS-FOCUSED PACK' : '5 CARD PACK'}</small><h4>${esc(pack.name)}</h4></div><strong>${stateText}</strong></header>
                            ${warning ? `<div class="peak-pack-warning ${pack.id === 'highest' ? 'is-danger' : ''}"><strong>${pack.id === 'highest' ? '转职卡池提醒' : '职业卡池规则'}</strong><span>${esc(warning)}</span></div>` : ''}
                            <div class="peak-pack-rate-title"><strong>单张基础概率</strong><small>每次独立抽取</small></div>
                            <div class="peak-pack-rates" aria-label="${esc(pack.name)}单张基础概率">${Object.entries(pack.rates).map(([rarity, rate]) => `<span style="--rate-color:${PEAK_CARD_RARITIES[rarity].color}"><small>${esc(PEAK_CARD_RARITIES[rarity].name)}</small><b>${rate}%</b></span>`).join('')}</div>
                            <div class="peak-pack-guarantee"><strong>${esc(guarantee)}</strong><small>保底位按符合条件的稀有度概率重新分配</small></div>
                            <div class="peak-pack-total-title"><strong>整包至少获得概率</strong><small>至少1张 · 未计入第50包史诗保底</small></div>
                            <div class="peak-pack-total-rates">${['rare', 'scarce', 'legendary', 'epic'].map((rarity) => `<span style="--rate-color:${PEAK_CARD_RARITIES[rarity].color}"><small>${esc(PEAK_CARD_RARITIES[rarity].name)}+</small><b>${formatPackChance(probability[rarity])}</b></span>`).join('')}</div>
                            <div class="peak-pack-payments"><button class="peak-pack-buy" type="button" data-action="buy-pack" data-id="${pack.id}" ${affordable ? '' : 'disabled'}><span>金币购买</span><strong><img src="assets/coin.png" alt="">${pack.price.toLocaleString('zh-CN')}</strong></button><button class="peak-pack-buy is-voucher" type="button" data-action="buy-pack-voucher" data-id="${pack.id}" ${voucherAffordable ? '' : 'disabled'}><span>代金券购买</span><strong><i>V</i>${voucherCost}</strong></button></div>
                        </article>`;
                    }).join('')}
                </div>
            </section>`;
    };

    const renderAttendance = () => {
        const attendance = save.attendance;
        const dateKey = getPeakDateKey(trustedNow);
        const claimedToday = Boolean(dateKey && attendance.lastClaimDate === dateKey);
        const activeIndex = claimedToday ? (attendance.totalDays - 1 + PEAK_ATTENDANCE_REWARDS.length) % PEAK_ATTENDANCE_REWARDS.length : attendance.totalDays % PEAK_ATTENDANCE_REWARDS.length;
        const cycleClaimed = claimedToday && attendance.totalDays % 7 === 0 ? 7 : attendance.totalDays % 7;
        const milestoneRows = (entries, claimed, kind) => entries.map((entry) => {
            const isClaimed = claimed.includes(entry.days);
            const reached = (kind === 'streak' ? attendance.streak : attendance.totalDays) >= entry.days;
            return `<div class="peak-attendance-milestone ${isClaimed ? 'is-claimed' : reached ? 'is-ready' : ''}"><span>${kind === 'streak' ? '连续' : '累计'} ${entry.days} 天</span><strong>${esc(rewardText(entry.reward))}</strong><small>${isClaimed ? '已随签到领取' : reached ? '本次签到领取' : '未达成'}</small></div>`;
        }).join('');
        content.innerHTML = `<section class="peak-account-view peak-attendance-view">
            <header class="peak-account-hero"><div class="peak-view-title"><span>08</span><div><small>DAILY ATTENDANCE</small><h3>每日签到</h3><p>奖励按7天周期循环，里程碑奖励会在达成时自动一并发放。</p></div></div><img src="${npcArt.attendance}" alt="签到引导员"><div class="peak-account-clock ${trustedTimeState === 'error' ? 'is-error' : ''}"><span>可信时间</span><strong>${esc(trustedTimeLabel())}</strong></div></header>
            <div class="peak-attendance-summary"><div><span>连续签到</span><strong>${attendance.streak}<small>天</small></strong></div><div><span>累计签到</span><strong>${attendance.totalDays}<small>天</small></strong></div><div><span>上次签到</span><strong>${attendance.lastClaimDate || '暂无'}</strong></div><button type="button" data-action="claim-attendance" ${accountBusy || claimedToday ? 'disabled' : ''}>${accountBusy ? '正在校准…' : claimedToday ? '今日已签到' : '领取今日奖励'}</button></div>
            <div class="peak-attendance-cycle">${PEAK_ATTENDANCE_REWARDS.map((reward, index) => `<div class="peak-attendance-day ${index < cycleClaimed ? 'is-claimed' : ''} ${index === activeIndex ? 'is-current' : ''}"><span>DAY ${index + 1}</span><strong>${esc(rewardText(reward))}</strong><small>${index < cycleClaimed ? '已领取' : index === activeIndex ? claimedToday ? '今日已领' : '今日奖励' : '等待解锁'}</small></div>`).join('')}</div>
            <div class="peak-attendance-milestones"><section><header><span>连续签到里程碑</span><small>中断后连续天数重新计算</small></header>${milestoneRows(PEAK_STREAK_MILESTONES, attendance.claimedStreakMilestones, 'streak')}</section><section><header><span>累计签到里程碑</span><small>累计天数永久保留</small></header>${milestoneRows(PEAK_TOTAL_MILESTONES, attendance.claimedTotalMilestones, 'total')}</section></div>
        </section>`;
    };

    const renderMerchant = () => {
        const character = activeCharacter();
        const vip = getPeakVipStatus(save, trustedNow);
        content.innerHTML = `<section class="peak-account-view peak-merchant-view">
            <header class="peak-account-hero"><div class="peak-view-title"><span>09</span><div><small>VOUCHER EXCHANGE</small><h3>代金券商人</h3><p>代金券消费等额累计VIP成长；金币消费不会增加VIP成长。</p></div></div><img src="${npcArt.merchant}" alt="代金券商人"><div class="peak-voucher-balance"><span>持有代金券</span><strong><i>V</i>${save.wallet.vouchers.toLocaleString('zh-CN')}</strong><small>VIP ${vip.level} · 成长 ${vip.growth}</small></div></header>
            <div class="peak-merchant-rate"><strong>V</strong><span>固定兑换比例</span><b>1 代金券 = 100 金币</b><small>商人卡包为限时折扣价</small></div>
            <div class="peak-merchant-offers">${PEAK_MERCHANT_OFFERS.map((offer) => {
                const pack = offer.type === 'pack' ? PEAK_PACKS.find((entry) => entry.id === offer.packId) : null;
                const staminaFull = offer.type === 'stamina' && character.stamina.current >= character.stamina.max;
                const affordable = save.wallet.vouchers >= offer.cost && !staminaFull;
                const icon = pack ? `<img src="${packArt[pack.id]}" alt="">` : `<span class="peak-merchant-offer-glyph">${offer.type === 'gold' ? 'G' : 'TP'}</span>`;
                return `<article style="--offer-tone:${pack?.tone || (offer.type === 'gold' ? '#e6bd55' : '#58b9d4')}">${icon}<div><small>${offer.type === 'pack' ? '折扣卡包' : offer.type === 'gold' ? '货币兑换' : '远征补给'}</small><strong>${esc(offer.name)}</strong><p>${esc(offer.description)}</p></div><dl><div><dt>价格</dt><dd><i>V</i>${offer.cost}</dd></div><div><dt>VIP成长</dt><dd>+${offer.cost}</dd></div></dl><button type="button" data-action="buy-merchant-offer" data-id="${offer.id}" ${affordable ? '' : 'disabled'}>${staminaFull ? '体力已满' : affordable ? '立即兑换' : '代金券不足'}</button></article>`;
            }).join('')}</div>
        </section>`;
    };

    const renderVip = () => {
        const status = getPeakVipStatus(save, trustedNow);
        const maxed = status.level >= 10;
        content.innerHTML = `<section class="peak-account-view peak-vip-view">
            <header class="peak-account-hero peak-vip-hero"><div class="peak-view-title"><span>10</span><div><small>ACCOUNT PRIVILEGE</small><h3>VIP成长</h3><p>消费代金券提升VIP等级，每个服务器自然日可领取一次当前等级奖励。</p></div></div><img src="${npcArt.vip}" alt="VIP服务专员"><div class="peak-account-clock ${trustedTimeState === 'error' ? 'is-error' : ''}"><span>可信时间</span><strong>${esc(trustedTimeLabel())}</strong></div></header>
            <div class="peak-vip-status"><div class="peak-vip-level"><span>CURRENT VIP</span><strong>${status.level}</strong></div><div class="peak-vip-progress"><header><span>${maxed ? '已达到最高等级' : `距 VIP ${status.level + 1}`}</span><strong>${maxed ? status.growth : `${status.growth} / ${status.nextThreshold}`}</strong></header><i><b style="width:${status.progress}%"></b></i><small>${maxed ? '后续消费仍会保留成长记录' : `还需 ${Math.max(0, status.nextThreshold - status.growth)} 点成长`}</small></div><div class="peak-vip-daily"><span>今日奖励 · VIP ${status.level}</span><strong>${esc(rewardText(status.reward))}</strong><button type="button" data-action="claim-vip-daily" ${accountBusy || !status.level || status.claimedToday ? 'disabled' : ''}>${accountBusy ? '正在校准…' : !status.level ? 'VIP 1 解锁' : status.claimedToday ? '今日已领取' : '领取每日奖励'}</button></div></div>
            <div class="peak-vip-ladder">${PEAK_VIP_THRESHOLDS.slice(1).map((threshold, index) => {
                const level = index + 1;
                const reward = getPeakVipDailyReward(level);
                return `<div class="${level === status.level ? 'is-current' : level < status.level ? 'is-unlocked' : ''}"><span>VIP ${level}</span><strong>${threshold} 成长</strong><small>每日 ${esc(rewardText(reward))}</small><b>${level <= status.level ? '已解锁' : '未解锁'}</b></div>`;
            }).join('')}</div>
        </section>`;
    };

    const renderPeakTrial = () => {
        const character = activeCharacter();
        const run = character.peakTrial;
        const progress = save.peakTrialProgress;
        const currentWeekKey = getPeakWeekKey(trustedNow || Date.now());
        const isCurrentWeek = currentWeekKey && progress.weekKey === currentWeekKey;
        const weeklyBestFloor = isCurrentWeek ? progress.weeklyBestFloor : 0;
        const weeklyRunsStarted = isCurrentWeek ? progress.weeklyRunsStarted : 0;
        const weeklyLimitReached = weeklyRunsStarted >= PEAK_TRIAL_WEEKLY_LIMIT;
        const currentFloor = run?.phase === 'completed' ? 12 : run?.floor || 1;
        const floorData = buildPeakTrialFloor({ floor: currentFloor, characterLevel: character.level, seed: run?.seed || 1 });
        const deckCheck = validatePeakDeck(activeDeck().cards, save.activeClass, activeCollection(), character.advancement);
        const boonCounts = (run?.boons || []).reduce((result, id) => ({ ...result, [id]: (result[id] || 0) + 1 }), {});
        const boonList = Object.entries(boonCounts).map(([id, count]) => {
            const boon = PEAK_TRIAL_BOONS.find((entry) => entry.id === id);
            return boon ? `<span><b>${esc(boon.name)}${count > 1 ? ` ×${count}` : ''}</b><small>${esc(boon.summary)}</small></span>` : '';
        }).join('');
        const route = PEAK_TRIAL_FLOORS.map((floor) => {
            const cleared = progress.lifetimeClearedFloors.includes(floor.floor);
            const stateClass = run && floor.floor === currentFloor ? 'is-current' : run && floor.floor < currentFloor ? 'is-passed' : cleared ? 'is-cleared' : '';
            return `<li class="${stateClass}"><i>${floor.floor}</i><span>${esc(floor.name)}</span><small>${floor.kind === 'final' ? '最终' : floor.kind === 'nightmare' ? '梦魇' : floor.kind === 'boss' ? '首领' : floor.kind === 'elite' ? '精英' : '普通'}</small></li>`;
        }).join('');
        const choices = run?.phase === 'choosing' ? run.choices.map((id) => {
            const boon = PEAK_TRIAL_BOONS.find((entry) => entry.id === id);
            return boon ? `<button type="button" data-action="choose-trial-boon" data-id="${boon.id}"><small>TRIAL BOON</small><strong>${esc(boon.name)}</strong><span>${esc(boon.summary)}</span></button>` : '';
        }).join('') : '';
        const phaseText = !run ? '尚未开始' : run.phase === 'ready' ? `第${run.floor}层待挑战` : run.phase === 'choosing' ? '选择临时增益' : run.phase === 'failed' ? '本轮挑战失败' : run.phase === 'completed' ? '本轮试炼完成' : '战斗进行中';
        content.innerHTML = `<section class="peak-trial-view">
            <header class="peak-trial-hero"><div><small>THE PEAK · 12 FLOORS</small><h3>巅峰试炼</h3><p>每周最多开启${PEAK_TRIAL_WEEKLY_LIMIT}轮。每层独立战斗，生命比例跨层保留，不消耗体力。</p></div><aside><span>本周最高</span><strong>${weeklyBestFloor}/12</strong><small>已开启 ${weeklyRunsStarted}/${PEAK_TRIAL_WEEKLY_LIMIT} 轮 · 6层/12层发代金券</small></aside></header>
            <ol class="peak-trial-route">${route}</ol>
            <div class="peak-trial-layout"><article class="peak-trial-current"><header><small>${esc(phaseText)}</small><h4>${floorData ? `${floorData.floor}F · ${esc(floorData.name)}` : '等待新的试炼'}</h4></header>${floorData ? `<div class="peak-trial-enemy"><span>${esc(floorData.enemy.difficulty)}</span><strong>${esc(floorData.enemy.name)}</strong><small>${esc(floorData.enemy.archetypeName || floorData.enemy.tactics)}</small><b>生命 ${floorData.enemy.maxHp.toLocaleString('zh-CN')} · 每回合抽 ${floorData.enemy.drawPerTurn}</b></div>` : ''}<dl><div><dt>剩余生命</dt><dd>${Math.round((run?.remainingHpRatio ?? 1) * 100)}%</dd></div><div><dt>累计金币</dt><dd>${(run?.earnedGold || 0).toLocaleString('zh-CN')}</dd></div><div><dt>累计代金券</dt><dd>${run?.earnedVouchers || 0}</dd></div></dl><p class="${deckCheck.valid ? 'is-valid' : 'is-invalid'}">${weeklyLimitReached && (!run || ['failed', 'completed'].includes(run.phase)) ? `本周${PEAK_TRIAL_WEEKLY_LIMIT}轮试炼次数已用完` : deckCheck.valid ? `当前卡组可出战 · ${activeDeck().cards.length}张` : esc(deckCheck.errors[0])}</p><footer>${!run || ['failed', 'completed'].includes(run.phase) ? `<button type="button" data-action="start-peak-trial" ${character.level < 15 || accountBusy || !deckCheck.valid || weeklyLimitReached ? 'disabled' : ''}>${accountBusy ? '校准时间中…' : character.level < 15 ? 'Lv.15开放' : weeklyLimitReached ? '本周次数已用完' : run ? '开始新一轮' : '开始试炼'}</button>` : run.phase === 'ready' ? `<button type="button" data-action="begin-trial-floor" ${deckCheck.valid ? '' : 'disabled'}>挑战第${run.floor}层</button>` : run.phase === 'choosing' ? '<span>选择一项增益后继续</span>' : '<span>当前层正在战斗</span>'}</footer></article><aside class="peak-trial-boons"><header><span>临时增益</span><strong>${run?.boons.length || 0}/11</strong></header>${choices ? `<div class="peak-trial-choices">${choices}</div>` : boonList || '<p>通过一层后可从三个临时增益中选择一个。</p>'}</aside></div>
        </section>`;
    };

    const renderMissions = () => {
        const status = getPeakMissionStatus(save, trustedNow || Date.now());
        const group = status.groups.find((entry) => entry.id === selectedMissionGroup) || status.groups[0];
        selectedMissionGroup = group?.id || 'daily';
        const missionNames = new Map(status.groups.flatMap((entry) => entry.missions.map((mission) => [mission.id, mission.name])));
        const recentTransactions = (save.liveOps?.transactions || []).slice(0, 6);
        const periodLabel = group?.period === 'lifetime'
            ? '永久进度'
            : group?.periodKey ? `${group.periodKey} 周期` : '等待可信时间校准';
        content.innerHTML = `<section class="peak-account-view peak-mission-view">
            <header class="peak-account-hero peak-mission-hero"><div class="peak-view-title"><span>11</span><div><small>MISSION CENTER</small><h3>任务中心</h3><p>每日从任务池随机轮换4项，每周任务按可信时间刷新，成长任务由账号下全部角色共同推进。</p></div></div><img src="${npcArt.attendance}" alt="任务引导员"><div class="peak-account-clock ${trustedTimeState === 'error' ? 'is-error' : ''}"><span>可信时间</span><strong>${esc(trustedTimeLabel())}</strong></div></header>
            <div class="peak-mission-overview"><div><span>可领取</span><strong>${status.ready}</strong></div><div><span>当前分类</span><strong>${esc(group?.name || '')}</strong></div><div><span>统计周期</span><strong>${esc(periodLabel)}</strong></div></div>
            <nav class="peak-mission-tabs" aria-label="任务分类">${status.groups.map((entry) => `<button type="button" class="${entry.id === selectedMissionGroup ? 'active' : ''}" data-action="select-mission-group" data-id="${entry.id}" aria-current="${entry.id === selectedMissionGroup ? 'page' : 'false'}"><span>${esc(entry.name)}</span><small>${esc(PEAK_MISSION_GROUPS[entry.id]?.subtitle || '')}</small>${entry.ready ? `<b>${entry.ready}</b>` : ''}</button>`).join('')}</nav>
            <div class="peak-mission-layout"><div class="peak-mission-list">${(group?.missions || []).map((mission) => {
                const percent = Math.max(0, Math.min(100, mission.progress / Math.max(1, mission.target) * 100));
                const stateLabel = mission.claimed ? '已领取' : mission.complete ? '领取奖励' : '进行中';
                return `<article class="peak-mission-row ${mission.complete ? 'is-complete' : ''} ${mission.claimed ? 'is-claimed' : ''}"><span class="peak-mission-state">${mission.claimed ? 'DONE' : mission.complete ? 'READY' : 'ACTIVE'}</span><div class="peak-task-copy"><small>${esc(group.name)}</small><strong>${esc(mission.name)}</strong><p>${esc(mission.description)}</p><div class="peak-mission-progress"><i><b style="width:${percent}%"></b></i><span>${mission.progress} / ${mission.target}</span></div></div><div class="peak-mission-reward"><span>任务奖励</span><strong>${esc(rewardText(mission.reward))}</strong></div><button type="button" data-action="claim-mission" data-id="${mission.id}" ${accountBusy || !mission.complete || mission.claimed ? 'disabled' : ''}>${accountBusy && mission.complete && !mission.claimed ? '校准中…' : stateLabel}</button></article>`;
            }).join('')}</div><aside class="peak-transaction-panel"><header><small>ACCOUNT LEDGER</small><strong>最近收支</strong></header>${recentTransactions.length ? `<ol>${recentTransactions.map((entry) => {
                const parts = [entry.gold ? `${entry.gold > 0 ? '+' : ''}${entry.gold}金币` : '', entry.vouchers ? `${entry.vouchers > 0 ? '+' : ''}${entry.vouchers}代金券` : '', entry.stamina ? `${entry.stamina > 0 ? '+' : ''}${entry.stamina}体力` : ''].filter(Boolean);
                const source = missionNames.get(entry.source) || entry.source || '系统';
                return `<li><span>${entry.type === 'reward' ? '获得' : '支出'}</span><div><strong>${esc(source)}</strong><small>${esc(parts.join(' · ') || '记录')}</small></div><time>${entry.at ? new Date(entry.at).toLocaleDateString('zh-CN') : ''}</time></li>`;
            }).join('')}</ol>` : '<p>完成任务或进行消费后，记录会显示在这里。</p>'}</aside></div>
        </section>`;
    };

    const renderTutorial = () => {
        const selected = PEAK_TUTORIAL_CHAPTERS.find((chapter) => chapter.id === selectedTutorialId) || PEAK_TUTORIAL_CHAPTERS[0];
        selectedTutorialId = selected?.id || '';
        const accountRecords = getPeakAccountRecordStatus(save);
        const viewedTutorials = new Set(accountRecords.tutorialViewedIds);
        const selectedIndex = Math.max(0, PEAK_TUTORIAL_CHAPTERS.findIndex((chapter) => chapter.id === selected?.id));
        const previous = PEAK_TUTORIAL_CHAPTERS[selectedIndex - 1];
        const next = PEAK_TUTORIAL_CHAPTERS[selectedIndex + 1];
        content.innerHTML = selected ? `
            <div class="peak-tutorial-layout">
                <aside class="peak-tutorial-index">
                    <header class="peak-view-title"><span>07</span><div><small>FIELD MANUAL</small><h3>新手教学</h3></div></header>
                    <nav aria-label="教学章节">
                        ${PEAK_TUTORIAL_CHAPTERS.map((chapter) => `<button type="button" class="${chapter.id === selected.id ? 'active' : ''} ${viewedTutorials.has(chapter.id) ? 'is-viewed' : ''}" data-action="select-tutorial" data-id="${chapter.id}" aria-current="${chapter.id === selected.id ? 'page' : 'false'}"><span>${chapter.code}</span><strong>${esc(chapter.title)}</strong><small>${viewedTutorials.has(chapter.id) ? '账号已读' : esc(chapter.kicker)}</small></button>`).join('')}
                    </nav>
                    <section class="peak-account-achievements"><header><span>账号成就</span><strong>${accountRecords.achievements.filter((entry) => entry.unlocked).length}/${accountRecords.achievements.length}</strong></header>${accountRecords.achievements.map((entry) => `<div class="${entry.unlocked ? 'is-unlocked' : ''}"><b>${entry.unlocked ? '✓' : '·'}</b><span><strong>${esc(entry.name)}</strong><small>${esc(entry.description)}</small></span></div>`).join('')}</section>
                </aside>
                <article class="peak-tutorial-content">
                    <header><small>${esc(selected.kicker)} · ${selectedIndex + 1} / ${PEAK_TUTORIAL_CHAPTERS.length}</small><span>${esc(selected.code)}</span><h3>${esc(selected.title)}</h3><p>${esc(selected.summary)}</p></header>
                    <button class="btn btn-secondary peak-attribute-guide-trigger" type="button" data-action="open-attribute-compendium">打开属性图鉴</button>
                    <div class="peak-tutorial-steps">
                        ${selected.points.map((point, index) => `<section><span>${String(index + 1).padStart(2, '0')}</span><div><h4>${esc(point.title)}</h4><p>${esc(point.text)}</p></div></section>`).join('')}
                    </div>
                    ${selected.example ? `<section class="peak-tutorial-example"><small>实战示例</small><h4>${esc(selected.example.title)}</h4><p>${esc(selected.example.text)}</p></section>` : ''}
                    ${selected.mistakes?.length ? `<section class="peak-tutorial-mistakes"><small>常见错误</small><ul>${selected.mistakes.map((mistake) => `<li>${esc(mistake)}</li>`).join('')}</ul></section>` : ''}
                    <footer><strong>战术提示</strong><p>${esc(selected.tip)}</p></footer>
                    <nav class="peak-tutorial-pager" aria-label="章节翻页">
                        <button type="button" data-action="select-tutorial" data-id="${previous?.id || ''}" ${previous ? '' : 'disabled'} aria-label="上一章"><span aria-hidden="true">←</span><small>上一章</small><strong>${esc(previous?.title || '已是第一章')}</strong></button>
                        <span>${selectedIndex + 1} / ${PEAK_TUTORIAL_CHAPTERS.length}</span>
                        <button type="button" data-action="select-tutorial" data-id="${next?.id || ''}" ${next ? '' : 'disabled'} aria-label="下一章"><small>下一章</small><strong>${esc(next?.title || '已是最后一章')}</strong><span aria-hidden="true">→</span></button>
                    </nav>
                </article>
            </div>` : '<div class="peak-tutorial-empty">暂无教学章节</div>';
    };

    const compactBattleCardReason = (reason = '') => {
        if (reason.includes('战术宣言')) return '先选宣言';
        if (reason.includes('MP')) return 'MP不足';
        if (reason.includes('特殊牌')) return '特殊牌受限';
        if (reason.includes('最左侧')) return '需放队首';
        if (reason.includes('队列最后')) return '需放队尾';
        if (reason.includes('最后一张')) return '需最后打出';
        if (reason.includes('不能作用于') || reason.includes('状态')) return '目标状态不符';
        if (reason.includes('先打出') || reason.includes('先将目标')) return '需先完成连段';
        if (reason.includes('手牌中保留')) return '缺少前置手牌';
        return '条件未满足';
    };

    const battleCardButton = (battle, instance, index, zone) => {
        const card = PEAK_CARD_BY_ID[instance.cardId];
        const mpCost = getPeakBattleCardCost(battle, 'player', card, zone === 'queue' ? battle.queue.slice(0, index) : battle.queue, instance);
        const playCheck = zone === 'hand' ? canQueuePeakCard(battle, index) : { ok: true };
        const level = getPeakEffectiveCardLevel(card, battle.player, 'player', instance);
        const quickAction = zone === 'hand'
            ? `<button class="peak-card-quick-action" type="button" data-action="quick-queue-card" data-index="${index}" title="${esc(playCheck.ok ? '快速加入队列' : playCheck.reason)}" aria-label="${esc(playCheck.ok ? `将${card.name}加入队列` : `${card.name}暂不可用：${playCheck.reason}`)}" ${playCheck.ok ? '' : 'disabled'}>+</button>`
            : `<button class="peak-card-quick-action is-withdraw" type="button" data-action="quick-withdraw-card" data-index="${index}" title="撤回手牌" aria-label="撤回${esc(card.name)}">−</button>`;
        return `<div class="peak-battle-card-slot ${playCheck.ok ? '' : 'is-unplayable'}" ${zone === 'queue' ? `data-order="${index + 1}"` : index < 9 ? `data-hotkey="${index + 1}"` : ''}><button class="peak-card-button ${playCheck.ok ? '' : 'is-unplayable'}" type="button" data-action="inspect-battle-card" data-zone="${zone}" data-index="${index}" title="${esc(playCheck.ok ? card.name : playCheck.reason)}">${cardMarkup(card, level, '', mpCost)}${playCheck.ok ? '' : `<span class="peak-card-availability">${esc(compactBattleCardReason(playCheck.reason))}</span>`}</button>${quickAction}</div>`;
    };

    const damageDigitsMarkup = (value, critical = false, hitIndex = 0) => {
        const amount = Math.max(0, Math.round(Number(value) || 0));
        if (!amount) return '';
        const sheet = critical ? 'battlenumber0-9.png' : 'normalnumber0-9.png';
        const digits = String(amount).split('').map((digit) => `<i style="--peak-digit-position:${Number(digit) * 100 / 9}%" aria-hidden="true"></i>`).join('');
        const hitDelay = Math.round((hitIndex - 1) * Math.max(20, 55 / Math.max(1, save.settings.resolutionSpeed)));
        const hitStyle = hitIndex ? `;--peak-hit-top:${9 + (hitIndex - 1) * 7}%;--peak-hit-left:${43 + (hitIndex - 1) % 3 * 8}%;--peak-hit-delay:${hitDelay}ms` : '';
        return `<div class="peak-damage-number ${critical ? 'is-critical' : ''} ${hitIndex ? 'is-multi-hit' : ''}" style="--peak-digit-sheet:url('assets/fighters/ui/${sheet}')${hitStyle}" role="img" aria-label="${critical ? '暴击' : '伤害'} ${amount}"><span aria-hidden="true">−</span>${digits}${critical ? '<b>CRITICAL</b>' : ''}</div>`;
    };

    const heroAnimationState = (frame) => {
        const visual = frame?.visual;
        if (visual?.target === 'player' && visual.hpDamage > 0) return 'hurt';
        if (frame?.kind === 'victory') return 'victory';
        if (frame?.kind === 'defeat') return 'defeat';
        if (frame?.actor !== 'player' || frame.kind !== 'card') return 'idle';
        if (visual?.category === 'defense') return 'guard';
        if (visual?.category === 'skill') return ['legendary', 'epic', 'mythic'].includes(visual.rarity) ? 'super' : 'skill';
        if (visual?.category === 'buff') return 'skill';
        if (visual?.category === 'special') return 'super';
        if (visual?.category !== 'attack') return 'idle';
        if (save.activeClass === 'sword') {
            if (visual.attackStyle === 'launch') return 'attack1';
            if (visual.attackStyle === 'finisher') return 'attack3';
            if (visual.attackStyle === 'thrust') return 'attack2';
            return 'attack1';
        }
        if (save.activeClass === 'archer') {
            if (visual.attackStyle === 'snipe' || visual.attackStyle === 'finisher') return 'attack2';
            if (visual.attackStyle === 'volley' || visual.attackStyle === 'launch') return 'attack3';
            return 'attack1';
        }
        if (save.activeClass === 'lancer') {
            if (visual.attackStyle === 'finisher' || visual.attackStyle === 'volley') return 'attack3';
            if (visual.attackStyle === 'launch') return 'attack2';
            return 'attack1';
        }
        if (visual.attackStyle === 'kick') return 'attack3';
        if (visual.attackStyle === 'finisher') return 'attack2';
        return 'attack1';
    };

    const heroSpriteMarkup = (frame, name) => {
        const animationState = heroAnimationState(frame);
        const animation = PEAK_ASSETS.heroAnimations?.[save.activeClass]?.[animationState]
            || PEAK_ASSETS.heroAnimations?.[save.activeClass]?.idle;
        const frames = Math.max(1, Number(animation?.frames) || 1);
        const fps = Math.max(1, Number(animation?.fps) || 1);
        const gridClass = Number(animation?.columns) === 4 && Number(animation?.rows) === 2 ? 'is-grid-4x2' : '';
        const displayScale = Math.max(.5, Number(PEAK_ASSETS.heroDisplayScales?.[save.activeClass]) || 1);
        const actionDuration = Math.max(160, Math.min(520, frames / fps * 1000) / Math.max(1, save.settings.resolutionSpeed));
        const idleDuration = frames / fps * 1000;
        return `<div class="peak-hero-sprite ${gridClass} ${animationState === 'idle' ? 'is-idle' : 'is-action'}" data-animation="${animationState}" role="img" aria-label="${esc(name)}" style="--peak-sprite-image:url('${animation?.file || PEAK_ASSETS.heroSprites?.[save.activeClass] || PEAK_ASSETS.heroes[save.activeClass]}');--peak-sprite-size:${frames * 100}%;--peak-sprite-steps:${Math.max(2, frames)};--peak-sprite-duration:${animationState === 'idle' ? idleDuration : actionDuration}ms;--peak-sprite-scale:${displayScale.toFixed(3)}"></div>`;
    };

    const enemySpriteMarkup = (frame, enemy, fallbackImage) => {
        const attacking = frame?.actor === 'enemy' && frame.kind === 'card' && ((frame.visual?.hpDamage || 0) > 0 || (frame.visual?.shieldDamage || 0) > 0);
        if (!attacking) return `<img src="${enemy.image || fallbackImage}" alt="${esc(enemy.name)}">`;
        const eliteAttack = Boolean(enemy.source?.elite || enemy.champion);
        const sheet = eliteAttack ? (enemy.eliteAttackSheet || enemy.attackSheet) : (enemy.attackSheet || enemy.spriteSheet);
        if (!sheet || (enemy.spriteFrames || 1) <= 1) return `<img src="${enemy.image || fallbackImage}" alt="${esc(enemy.name)}">`;
        const frames = Math.max(1, Number(eliteAttack ? enemy.eliteAttackFrames : enemy.spriteFrames) || 1);
        const fps = Math.max(1, Number(enemy.spriteFps) || 1);
        const duration = getPeakSpriteActionDuration(frames, fps, save.settings.resolutionSpeed);
        const layout = getPeakSpriteFrameLayout({
            columns: eliteAttack ? enemy.eliteAttackColumns : enemy.spriteColumns,
            rows: eliteAttack ? enemy.eliteAttackRows : enemy.spriteRows,
            frames,
            duration,
            sheetWidth: eliteAttack ? enemy.eliteAttackSheetWidth : enemy.spriteSheetWidth,
            sheetHeight: eliteAttack ? enemy.eliteAttackSheetHeight : enemy.spriteSheetHeight,
        });
        const cells = layout.cells.map((cell) => `<i class="peak-enemy-sprite-frame ${cell.index === layout.frames - 1 ? 'is-last' : ''}" style="--peak-frame-position:${cell.x}% ${cell.y}%;--peak-frame-delay:${cell.delay}ms;--peak-frame-duration:${layout.frameDuration}ms"></i>`).join('');
        return `<div class="peak-enemy-sprite is-action" role="img" aria-label="${esc(enemy.name)}" style="--peak-enemy-sheet:url('${sheet}');--peak-enemy-columns:${layout.columns};--peak-enemy-rows:${layout.rows};--peak-enemy-aspect:${layout.aspectRatio};--peak-enemy-duration:${duration}ms">${cells}</div>`;
    };

    const combatStatusFeedbackMarkup = (frame, target) => {
        const visual = frame?.visual;
        if (!visual) return '';
        const art = [];
        const labels = [];
        if (visual.stateTarget === target && combatStateArt[visual.stateApplied]) art.push(combatStateArt[visual.stateApplied]);
        if (visual.statusTarget === target) (visual.statusesApplied || []).forEach((status) => {
            if (statusArt[status]) art.push(statusArt[status]);
            else if (PEAK_STATUS_EFFECTS[status]?.name) labels.push(PEAK_STATUS_EFFECTS[status].name);
        });
        if (visual.phoenixTriggered && (visual.phoenixTarget || visual.target) === target) labels.push('浴火免伤');
        return art.length || labels.length ? `<div class="peak-status-splash" aria-hidden="true">${[...new Set(art)].map((file, index) => `<i style="--peak-status-art:url('${file}');--peak-status-delay:${index * 90}ms"></i>`).join('')}${[...new Set(labels)].map((label, index) => `<b style="--peak-status-delay:${(art.length + index) * 90}ms">${esc(label)}</b>`).join('')}</div>` : '';
    };

    const combatCastEffectMarkup = (frame, target) => {
        if (frame?.kind !== 'card' || frame.actor !== target) return '';
        const card = PEAK_CARD_BY_ID[frame.cardId];
        if (!card || card.category === 'attack') return '';
        const art = cardEffectArt(card)?.file;
        const effects = card.effects || [];
        const hasShield = effects.some((effect) => ['shield', 'vowShield'].includes(effect.type));
        const hasHealing = effects.some((effect) => ['heal', 'healMissing'].includes(effect.type)
            || effect.type === 'status' && effect.status === 'regeneration');
        const isGroundBuff = card.category === 'buff' || effects.some((effect) => [
            'buff', 'empower', 'restoreMp', 'shieldToMp', 'spellCharge', 'spellChargeSpend',
            'vowGain', 'vowSpend', 'arcaneCascade', 'blessingHasten',
        ].includes(effect.type));
        const layout = hasShield ? 'shield' : hasHealing ? 'heal' : isGroundBuff ? 'ground' : 'center';
        const effectArt = cardEffectArt(card);
        const potionClass = effectArt?.potion ? ' is-potion' : '';
        const dodgeClass = card.tags?.includes('闪避') ? ' is-dodge' : '';
        const effectFile = dodgeClass ? 'assets/card/zhuangtai/shanbi.png' : effectArt?.file;
        return effectFile ? `<span class="peak-cast-effect is-${layout}${potionClass}${dodgeClass}" style="--peak-cast-art:url('${effectFile}');--peak-effect-x:${effectArt?.x || 0}%;--peak-effect-y:${effectArt?.y || 0}%" aria-hidden="true"></span>` : '';
    };

    const peakResolutionFrameDuration = (speed) => Math.max(180, 540 / Math.max(1, speed));

    const PEAK_PROJECTILE_CLASSES = ['archer', 'knight', 'mage', 'priest', 'lancer'];

    const PEAK_MELEE_QIGONG = {
        sword: 'assets/fighters/heroes/hancheying/qigong.png',
        brawler: 'assets/fighters/heroes/FlameDemonGod/qigong.png',
    };
    const qigongProjectileFile = (frame) => {
        const file = PEAK_MELEE_QIGONG[save.activeClass];
        return file && heroAnimationState(frame) === 'skill' ? file : '';
    };

    const hasCombatProjectile = (frame, target) => {
        const visual = frame?.visual;
        if (!visual || visual.target !== target || frame.actor !== 'player') return false;
        if (!PEAK_PROJECTILE_CLASSES.includes(save.activeClass) && !qigongProjectileFile(frame)) return false;
        const hpDamage = Math.max(0, Math.round(Number(visual.hpDamage) || 0));
        const shieldDamage = Math.max(0, Math.round(Number(visual.shieldDamage) || 0));
        return Boolean(hpDamage || shieldDamage);
    };

    const combatFeedbackMarkup = (frame, target) => {
        const visual = frame?.visual;
        const receivesDamage = visual?.target === target;
        const receivesHealing = visual?.healingTarget === target;
        if (!visual || (!receivesDamage && !receivesHealing)) return '';
        const hpDamage = Math.max(0, Math.round(Number(visual.hpDamage) || 0));
        const shieldDamage = Math.max(0, Math.round(Number(visual.shieldDamage) || 0));
        const healing = Math.max(0, Math.round(Number(visual.healing) || 0));
        const hitResults = Array.isArray(visual.hitResults) ? visual.hitResults : [];
        const shieldBroken = shieldDamage > 0 && Number(frame.state?.[target]?.shield) <= 0;
        const damageNumbers = hitResults.length > 1
            ? hitResults.map((hit, index) => damageDigitsMarkup((hit.hpDamage || 0) + (hit.shieldDamage || 0), hit.critical, index + 1)).join('')
            : damageDigitsMarkup(hpDamage, visual.critical);
        const effectType = frame.kind === 'status' ? 'status' : frame.actor === 'enemy' ? 'enemy' : save.activeClass;
        const element = ['fire', 'ice', 'light', 'dark'].includes(visual.element) ? visual.element : 'physical';
        const archerProjectile = receivesDamage && frame.actor === 'player' && save.activeClass === 'archer' && (hpDamage || shieldDamage)
            ? `<span class="peak-archer-projectile" style="--peak-arrow-sheet:url('assets/fighters/heroes/lingfeng/arrow-shoot-strip.png')" aria-hidden="true"></span>`
            : '';
        const knightProjectile = receivesDamage && frame.actor === 'player' && save.activeClass === 'knight' && (hpDamage || shieldDamage)
            ? `<span class="peak-knight-projectile" style="--peak-knight-projectile-sheet:url('assets/fighters/heroes/shengwei/holy-hammer-projectile-strip.png')" aria-hidden="true"></span>`
            : '';
        const mageProjectile = receivesDamage && frame.actor === 'player' && save.activeClass === 'mage' && (hpDamage || shieldDamage)
            ? ['legendary', 'epic', 'mythic'].includes(visual.rarity)
                ? `<span class="peak-mage-projectile is-advanced" style="--peak-mage-projectile-sheet:url('assets/fighters/heroes/molinger/arcane-projectile-strip.png')" aria-hidden="true"></span>`
                : `<span class="peak-mage-projectile" style="--peak-mage-projectile-1:url('assets/fighters/heroes/molinger/feidan1.png');--peak-mage-projectile-2:url('assets/fighters/heroes/molinger/feidan2.png');--peak-mage-projectile-3:url('assets/fighters/heroes/molinger/feidan3.png');--peak-mage-projectile-4:url('assets/fighters/heroes/molinger/feidan4.png')" aria-hidden="true"></span>`
            : '';
        const priestProjectile = receivesDamage && frame.actor === 'player' && save.activeClass === 'priest' && (hpDamage || shieldDamage)
            ? `<span class="peak-priest-projectile" style="--peak-priest-projectile-sheet:url('assets/fighters/heroes/shenmu/shoot-strip.png')" aria-hidden="true"></span>`
            : '';
        const lancerProjectile = receivesDamage && frame.actor === 'player' && save.activeClass === 'lancer' && (hpDamage || shieldDamage)
            ? `<span class="peak-lancer-projectile" style="--peak-lancer-projectile-sheet:url('${PEAK_ASSETS.heroProjectiles.lancer.file}')" aria-hidden="true"></span>`
            : '';
        const qigongSheet = receivesDamage && frame.actor === 'player' && (hpDamage || shieldDamage) ? qigongProjectileFile(frame) : '';
        const qigongProjectile = qigongSheet
            ? `<span class="peak-qigong-projectile is-${save.activeClass}" style="--peak-qigong-sheet:url('${qigongSheet}')" aria-hidden="true"></span>`
            : '';
        const dodge = visual.dodgeTarget === target
            ? `<span class="peak-dodge-effect" style="--peak-dodge-art:url('assets/card/zhuangtai/shanbi.png')" aria-hidden="true"></span>`
            : '';
        return `${dodge}${archerProjectile}${knightProjectile}${mageProjectile}${priestProjectile}${lancerProjectile}${qigongProjectile}${receivesDamage && (hpDamage || shieldDamage) ? `<span class="peak-impact-effect effect-${effectType} ${visual.critical ? 'is-critical' : ''}" data-element="${element}" aria-hidden="true"></span>` : ''}${receivesDamage ? damageNumbers : ''}${receivesDamage && hitResults.length > 1 ? `<div class="peak-hit-count"><strong>${hitResults.length}</strong><span>HIT</span></div>` : ''}${receivesDamage && shieldDamage ? `<div class="peak-shield-damage">护盾 −${shieldDamage}</div>` : ''}${shieldBroken ? '<div class="peak-shield-break"><strong>BREAK</strong><span>护盾击破</span></div>' : ''}${receivesHealing && healing ? `<div class="peak-healing-number">+${healing}</div>` : ''}`;
    };

    const combatVitalsMarkup = (combatant, subtitle, portrait, bomb = null) => {
        const hpPercent = Math.max(0, Math.min(100, Math.round(combatant.hp / Math.max(1, combatant.maxHp) * 100)));
        const mpPercent = Math.max(0, Math.min(100, Math.round(combatant.mp / Math.max(1, combatant.maxMp) * 100)));
        const shieldPercent = Math.max(0, Math.min(100, Math.round(combatant.shield / Math.max(1, combatant.maxHp * .5) * 100)));
        const shield = Math.max(0, Math.ceil(combatant.shield));
        const route = combatant.routeResource;
        const routePercent = route ? Math.max(0, Math.min(100, Math.round(route.value / Math.max(1, route.max) * 100))) : 0;
        const routeMarkup = route ? `<div class="peak-route-resource ${route.value >= route.max ? 'is-ready' : ''}" style="--peak-route-color:${route.color || '#d9e0e7'}"><span>${esc(route.name)}</span><i><b style="width:${routePercent}%"></b></i><strong>${route.value}/${route.max}</strong></div>` : '';
        const statusParts = statusMarkup(combatant, bomb).split(/(?=<span class="peak-status)/g).filter(Boolean);
        const statusHtml = statusParts.length > 3
            ? `${statusParts.slice(0, 3).join('')}<details class="peak-status-more"${typeof window !== 'undefined' && window.matchMedia?.('(min-width: 701px)').matches ? ' open' : ''}><summary>+${statusParts.length - 3} 状态</summary>${statusParts.slice(3).join('')}</details>`
            : statusParts.join('');
        return `<div class="peak-health ${shield ? 'has-shield' : ''} ${route ? 'has-route-resource' : ''}"><img class="peak-hud-portrait" src="${portrait}" alt=""><header><span>${esc(combatant.name)}</span><small>${esc(subtitle)}</small></header><div class="peak-vital-bar" data-kind="hp" aria-label="生命 ${Math.ceil(combatant.hp)}/${combatant.maxHp}"><span>HP</span><i><b style="width:${hpPercent}%"></b></i><strong>${Math.ceil(combatant.hp)}<small> / ${combatant.maxHp}</small></strong></div><div class="peak-vital-bar" data-kind="mp" aria-label="魔力 ${Math.ceil(combatant.mp)}/${combatant.maxMp}"><span>MP</span><i><b style="width:${mpPercent}%"></b></i><strong>${Math.ceil(combatant.mp)}<small> / ${combatant.maxMp}</small></strong></div><div class="peak-shield-readout"><span>护盾</span><i><b style="width:${shieldPercent}%"></b></i><strong>${shield}</strong></div>${routeMarkup}<div class="peak-status-strip">${statusHtml}</div></div>`;
    };

    const renderBattle = () => {
        const persistedBattle = save.activeRun;
        if (!persistedBattle) { view = 'town'; renderTown(); return; }
        const battle = resolutionFrame?.state || persistedBattle;
        const dungeon = PEAK_DUNGEONS.find((entry) => entry.id === battle.dungeonId) || PEAK_DUNGEONS[0];
        const battleName = battle.trialName || dungeon.name;
        const predicted = previewPeakQueueState(battle);
        const queueCheck = validatePeakQueue(battle);
        const ended = ['victory', 'defeat'].includes(battle.phase);
        const endTurnReason = ended ? '战斗已经结束' : resolving ? '正在结算本回合' : queueCheck.valid ? '' : queueCheck.reason;
        const endTurnLabel = ended
            ? '战斗已结束'
            : resolving
                ? '结算中'
                : !queueCheck.valid
                    ? queueCheck.reason.includes('战术宣言') ? '先选战术宣言' : '调整队列'
                    : battle.hand.length > PEAK_PLAYER_HAND_LIMIT
                        ? `整理手牌后${battle.queue.length ? '结束' : '跳过'}回合`
                        : battle.queue.length ? '结束回合' : '跳过回合';
        const playerHit = resolutionFrame?.visual?.target === 'player' && resolutionFrame.visual.hpDamage > 0;
        const enemyHit = resolutionFrame?.visual?.target === 'enemy' && resolutionFrame.visual.hpDamage > 0;
        const impactProfile = getPeakImpactProfile(resolutionFrame);
        const impactDamage = impactProfile.damage;
        const heavyImpact = ['heavy', 'critical'].includes(impactProfile.tier);
        const hasAttackImpact = resolutionFrame?.kind === 'card' && impactDamage > 0;
        const declarationFirstRound = Math.max(1, Math.floor(Number(battle.encounterRound) || 1)) === 1;
        const declarationLocked = !declarationFirstRound || resolving || ended || battle.phase !== 'playerPlanning' || battle.queue.length > 0;
        const selectedDeclaration = PEAK_TACTICAL_DECLARATIONS.find((entry) => entry.id === battle.tacticalDeclarationId);
        const declarationResult = battle.tacticalDeclarationResult;
        const showDeclarationChooser = declarationFirstRound && !selectedDeclaration && !declarationResult && !ended;
        const bossHpPercent = Math.max(0, Math.min(100, Math.round(battle.enemy.hp / Math.max(1, battle.enemy.maxHp) * 100)));
        const bossPhase = bossHpPercent > 70
            ? { id: 'control', name: '压制阶段' }
            : bossHpPercent > 35
                ? { id: 'clash', name: '激战阶段' }
                : { id: 'decisive', name: '决胜阶段' };
        const bossEncounterClass = battle.enemy.isBoss ? `is-boss-encounter boss-phase-${bossPhase.id} ${bossHpPercent <= 35 ? 'is-boss-critical' : ''}` : '';
        const bossThreatMarkup = battle.enemy.isBoss
            ? `<div class="peak-boss-threat" data-phase="${bossPhase.id}" aria-label="首领遭遇，${bossPhase.name}，剩余生命${bossHpPercent}%"><span><i aria-hidden="true"></i>BOSS ENCOUNTER</span><strong>${bossPhase.name}</strong><small>${esc(battle.enemy.difficulty || '普通')} · 卡牌Lv.${battle.enemy.cardLevel || 1} · HP ${bossHpPercent}%</small></div>`
            : '';
        const playerProjectile = hasCombatProjectile(resolutionFrame, 'enemy');
        const enemyProjectile = hasCombatProjectile(resolutionFrame, 'player');
        const frameBudget = peakResolutionFrameDuration(save.settings.resolutionSpeed);
        const projectileTravel = playerProjectile || enemyProjectile ? Math.round(frameBudget * .3) : 0;
        const impactDuration = Math.max(120, Math.min(Math.max(150, 430 / Math.max(1, save.settings.resolutionSpeed)), frameBudget - projectileTravel));
        content.innerHTML = `
            <section class="peak-battle ${battle.advancementTrial ? 'is-advancement-trial' : ''} ${battle.recoveryZone?.length ? 'has-recovery-zone' : ''} ${showDeclarationChooser ? 'has-tactical-declaration' : ''} ${bossEncounterClass} ${hasAttackImpact ? `is-impact impact-${impactProfile.tier} ${heavyImpact ? 'is-heavy-impact' : ''} ${impactProfile.critical ? 'is-critical-impact' : ''} ${impactProfile.shieldBroken ? 'is-shield-break' : ''}` : ''} ${playerProjectile || enemyProjectile ? 'is-projectile-flight' : ''}" style="--peak-battle-bg:url('${battle.trialBackdrop || dungeon.backdrop}');--peak-impact-duration:${impactDuration}ms;--peak-feedback-duration:${Math.max(180, 700 / Math.max(1, save.settings.resolutionSpeed))}ms;--peak-projectile-travel:${projectileTravel}ms;--peak-impact-color:${({ fire: '#ff6b3d', ice: '#79e6ff', light: '#fff18a', dark: '#cd73ff', physical: '#eef7ff' })[impactProfile.element] || '#eef7ff'}">
                <header class="peak-battle-top">
                    <div class="peak-battle-tools"><span class="peak-battle-shortcut-hint">数字键出牌 · Space结束</span><button type="button" data-action="abandon-battle" ${resolving ? 'disabled' : ''}>退出战斗</button><button type="button" data-action="open-battle-log">战报</button></div>
                    <div><span>${battle.advancementTrial ? 'ADVANCEMENT TRIAL' : `ROUND ${battle.round}`}</span><strong>${battle.advancementTrial ? esc(battle.trialName) : battle.encounters?.length > 1 ? `WAVE ${(battle.encounterIndex || 0) + 1}/${battle.encounters.length}` : battle.round}</strong></div>
                    <div class="peak-battle-meta"><div class="peak-resolution-speed" aria-label="结算速度">${[1, 2, 3].map((speed) => `<button type="button" data-action="set-resolution-speed" data-speed="${speed}" class="${save.settings.resolutionSpeed === speed ? 'active' : ''}">×${speed}</button>`).join('')}</div><div class="peak-enemy-intent"><span>${esc(battle.enemy.difficulty || '普通')} · 敌人行动</span><strong>${battle.enemyIntent.cards ? `${battle.enemyIntent.cards}张 · ${battle.enemyIntent.mpCost || 0}MP · ${battle.enemyIntent.names.join(' / ')}` : `本回合将抽${battle.enemyIntent.draw || battle.enemy.drawPerTurn || 3}张`}</strong></div></div>
                </header>
                <div class="peak-battle-hud">
                    <div class="peak-hud-side player">${combatVitalsMarkup(battle.player, `${getPeakCharacterJobName(activeCharacter())} · ${PEAK_COMBAT_STATES[battle.player.state] || battle.player.state}`, characterPortrait(), battle.bomb?.holder === 'player' ? battle.bomb : null)}</div>
                    ${resolutionFrame ? `<div class="peak-resolution-banner" data-kind="${resolutionFrame.kind}"><small>${resolutionFrame.actor === 'enemy' ? battle.enemy.name : resolutionFrame.actor === 'player' ? battle.player.name : 'SYSTEM'}</small><strong>${esc(resolutionFrame.cardName || resolutionFrame.kind)}${resolutionFrame.cardLevel ? ` · Lv.${resolutionFrame.cardLevel}` : ''}</strong><p>${esc(resolutionFrame.text)}</p></div>` : `<div class="peak-versus"><small>ROUND ${battle.round}</small><strong>VS</strong><span>${resolving ? '结算中' : '战术规划'}</span></div>`}
                    <div class="peak-hud-side enemy ${battle.enemy.isBoss ? 'is-boss' : ''}">${bossThreatMarkup}${combatVitalsMarkup(battle.enemy, `${PEAK_COMBAT_STATES[battle.enemy.state] || battle.enemy.state} · 卡牌Lv.${battle.enemy.cardLevel || 1}`, battle.enemy.portrait || battle.enemy.image || dungeon.enemy.image, battle.bomb?.holder === 'enemy' ? battle.bomb : null)}</div>
                </div>
                <div class="peak-combatants ${resolutionFrame ? `is-resolving actor-${resolutionFrame.actor} ${hasAttackImpact ? 'has-attack-impact' : ''}` : ''}">
                    <div class="peak-combatant player ${playerHit ? 'is-hurt' : ''} ${enemyProjectile ? 'has-projectile' : ''}">${heroSpriteMarkup(resolutionFrame, battle.player.name)}${combatCastEffectMarkup(resolutionFrame, 'player')}${combatFeedbackMarkup(resolutionFrame, 'player')}${combatStatusFeedbackMarkup(resolutionFrame, 'player')}</div>
                    <div class="peak-combatant enemy ${enemyHit ? 'is-hurt' : ''} ${resolutionFrame?.kind === 'wave' ? 'is-entering' : ''} ${battle.enemy.isBoss ? 'is-boss' : ''} ${playerProjectile ? 'has-projectile' : ''}">${enemySpriteMarkup(resolutionFrame, battle.enemy, dungeon.enemy.image)}${combatCastEffectMarkup(resolutionFrame, 'enemy')}${combatFeedbackMarkup(resolutionFrame, 'enemy')}${combatStatusFeedbackMarkup(resolutionFrame, 'enemy')}</div>
                </div>
                ${resolutionFrame?.kind === 'bossDefeated' ? `<div class="peak-boss-defeated" role="status" aria-live="assertive"><i aria-hidden="true"></i><small>BOSS DEFEATED</small><strong>首领已击破</strong><span>${esc(battle.enemy.name)}</span></div>` : ''}
                ${showDeclarationChooser ? `<aside class="peak-tactical-declarations ${declarationLocked ? 'is-locked' : 'is-required'}"><header><span>战术宣言</span><strong>首回合必选</strong><small>${declarationLocked ? '当前状态不可选择' : '选择本次遭遇的作战目标'}</small></header><div>${PEAK_TACTICAL_DECLARATIONS.map((entry) => `<button type="button" style="--peak-tactical-tone:${entry.tone}" data-action="select-tactical-declaration" data-id="${entry.id}" ${declarationLocked ? 'disabled' : ''}><span>${esc(entry.name)}</span><small>${esc(entry.description)}</small><b>${esc(entry.rewardText)}</b></button>`).join('')}</div></aside>` : ''}
                <div class="peak-queue-zone ${queueCheck.valid ? '' : 'invalid'}"><header><span>${queueCheck.valid ? `缓冲队列 · ${battle.queue.length}张 · 预留MP ${queueCheck.spentMp || 0}/${battle.player.mp}` : esc(queueCheck.reason)}</span><strong>${PEAK_COMBAT_STATES[battle.enemy.state] || battle.enemy.state} → ${PEAK_COMBAT_STATES[predicted] || predicted}</strong></header><div>${battle.queue.length ? battle.queue.map((entry, index) => battleCardButton(battle, entry, index, 'queue')).join('') : '<span class="peak-empty-queue">本回合尚未出牌</span>'}</div></div>
                ${battle.recoveryZone?.length ? `<aside class="peak-recovery-zone"><span>追击区</span>${battle.recoveryZone.map((entry) => `<b>${esc(PEAK_CARD_BY_ID[entry.cardId]?.name || entry.cardId)}<small>${entry.states.map((state) => PEAK_COMBAT_STATES[state] || state).join('/')}</small></b>`).join('')}</aside>` : ''}
                ${ended ? `<div class="peak-battle-result"><div class="peak-battle-result-panel" data-result="${battle.phase}"><img class="peak-battle-result-art" src="assets/card/zhuangtai/${battle.phase === 'victory' ? 'shengli' : 'shibai'}.png" alt=""><small>${battle.phase === 'victory' ? 'MISSION CLEARED' : 'MISSION FAILED'}</small><strong>${battle.phase === 'victory' ? battle.peakTrial ? `第${battle.peakTrial.floor}层突破` : battle.advancementTrial ? '试炼通过' : '对决胜利' : battle.peakTrial ? '巅峰折戟' : battle.advancementTrial ? '试炼失败' : '挑战失败'}</strong><p>${esc(battleName)} · ${esc(battle.enemy.difficulty || '普通')} · ${battle.round}回合</p><div><span>剩余生命 <b>${Math.ceil(battle.player.hp)}/${battle.player.maxHp}</b></span><span>完成遭遇 <b>${Math.min((battle.encounterIndex || 0) + 1, battle.encounters?.length || 1)}/${battle.encounters?.length || 1}</b></span>${!battle.advancementTrial && !battle.peakTrial && battle.pendingDrops?.length ? `<span>待结算掉落 <b>${battle.pendingDrops.length}</b></span>` : ''}</div><em>${esc(battle.log.at(-1)?.text || '')}</em><button type="button" data-action="finish-battle">${battle.peakTrial ? battle.phase === 'victory' ? '领取层奖励' : '返回试炼' : battle.advancementTrial ? battle.phase === 'victory' ? '完成转职' : '离开试炼' : battle.phase === 'victory' ? '结算战利品' : '返回远征地图'}</button></div></div>` : ''}
                <footer class="peak-hand-zone"><div class="peak-pile-counts"><span>牌库 ${battle.drawPile.length}</span><span>弃牌 ${battle.discardPile.length}</span><span class="${battle.hand.length > PEAK_PLAYER_HAND_LIMIT ? 'is-over-limit' : ''}">手牌 ${battle.hand.length}/${PEAK_PLAYER_HAND_LIMIT}</span><span>敌方手牌 ${battle.enemyHand?.length || 0}</span></div><div class="peak-hand">${battle.hand.map((entry, index) => battleCardButton(battle, entry, index, 'hand')).join('')}</div><button class="peak-end-turn" type="button" data-action="resolve-round" title="${esc(endTurnReason || endTurnLabel)}" aria-label="${esc(endTurnReason || endTurnLabel)}" ${queueCheck.valid && !resolving && !ended ? '' : 'disabled'}>${esc(endTurnLabel)}</button></footer>
                <div class="peak-battle-card-popover-host" aria-live="polite"></div>
            </section>`;
    };

    const renderBattleTools = () => {
        const tools = content.querySelector('.peak-battle-tools');
        if (!tools || tools.querySelector('[data-action="toggle-peak-sound"]')) return;
        const soundButton = document.createElement('button');
        soundButton.type = 'button';
        soundButton.dataset.action = 'toggle-peak-sound';
        soundButton.textContent = save.settings.sound ? '音效开' : '音效关';
        soundButton.setAttribute('aria-pressed', String(Boolean(save.settings.sound)));
        const motionButton = document.createElement('button');
        motionButton.type = 'button';
        motionButton.dataset.action = 'toggle-reduced-motion';
        motionButton.textContent = save.settings.reducedMotion ? '动效少' : '动效全';
        motionButton.setAttribute('aria-pressed', String(Boolean(save.settings.reducedMotion)));
        tools.append(soundButton, motionButton);
    };

    const renderBattleQueueTools = () => {
        const battle = save.activeRun;
        const header = content.querySelector('.peak-queue-zone header');
        if (!header || !battle?.queue?.length || resolving || header.querySelector('[data-action="clear-queue"]')) return;
        const clearButton = document.createElement('button');
        clearButton.type = 'button';
        clearButton.className = 'peak-queue-clear';
        clearButton.dataset.action = 'clear-queue';
        clearButton.textContent = '清空队列';
        clearButton.title = '撤回本回合已安排的全部卡牌';
        header.classList.add('has-clear-action');
        header.closest('.peak-queue-zone')?.classList.add('has-clear-action');
        header.appendChild(clearButton);
    };

    const render = () => {
        if (!activeCharacter() || activeCharacter().needsNaming) view = 'roster';
        updateResources();
        const mainPage = document.getElementById('main-page');
        const mobileBottomNav = document.getElementById('mobile-bottom-nav');
        if (!saveOwner.owned || storageIssue) {
            root.classList.remove('is-battle-view');
            mainPage?.classList.remove('is-peak-battle-view');
            mobileBottomNav?.classList.remove('is-peak-battle-view');
            root.querySelectorAll('[data-peak-view]').forEach((button) => { button.disabled = true; });
            modal.classList.add('hidden');
            const retrySave = storageIssue?.code === 'PEAK_SAVE_WRITE' && saveOwner.owned;
            content.innerHTML = `<div class="card" role="alert"><h3>巅峰对决已暂停</h3><p>${esc(storageIssue?.message || saveOwner.reason || '正在准备安全存档…')}</p><button class="btn btn-primary" type="button" data-retry-peak-save>${retrySave ? '重试保存' : saveOwner.owned ? '重新读取已保存进度' : '重新进入'}</button></div>`;
            return;
        }
        const isBattleView = view === 'battle'
            && Boolean(save.activeRun)
            && mainPage?.dataset.activeSection === 'peak-duel';
        root.classList.toggle('is-battle-view', isBattleView);
        root.classList.toggle('is-reduced-motion', Boolean(save.settings.reducedMotion) || Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches));
        mainPage?.classList.toggle('is-peak-battle-view', isBattleView);
        mobileBottomNav?.classList.toggle('is-peak-battle-view', isBattleView);
        root.classList.toggle('is-roster-view', view === 'roster');
        root.querySelectorAll('[data-peak-view]').forEach((button) => {
            const active = button.dataset.peakView === view || (view === 'battle' && button.dataset.peakView === (save.activeRun?.peakTrial ? 'trial' : 'map'));
            button.classList.toggle('active', active);
            if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
            button.disabled = (!activeCharacter() || activeCharacter().needsNaming) && button.dataset.peakView !== 'roster';
        });
        ({ roster: renderRoster, town: renderTown, map: renderMap, deck: renderDeck, codex: renderCodex, character: renderCharacter, blessing: renderBlessing, shop: renderShop, attendance: renderAttendance, merchant: renderMerchant, vip: renderVip, missions: renderMissions, trial: renderPeakTrial, tutorial: renderTutorial, battle: renderBattle }[view] || renderRoster)();
        if (view === 'battle') {
            renderBattleTools();
            renderBattleQueueTools();
        }
    };

    const renderPreservingScroll = (selectors) => {
        const positions = selectors.map((selector) => {
            const element = content.querySelector(selector);
            return [selector, element?.scrollTop || 0, element?.scrollLeft || 0];
        });
        render();
        positions.forEach(([selector, scrollTop, scrollLeft]) => {
            const element = content.querySelector(selector);
            if (element) {
                element.scrollTop = scrollTop;
                element.scrollLeft = scrollLeft;
            }
        });
    };
    const renderDeckPreservingScroll = () => renderPreservingScroll(['.peak-deck-list', '.peak-collection-column .peak-card-grid']);
    const renderCodexPreservingScroll = () => renderPreservingScroll(['.peak-codex-layout .peak-card-grid']);
    const renderInventoryPreservingScroll = () => renderPreservingScroll(['.peak-inventory-grid']);
    const renderBattlePreservingScroll = () => renderPreservingScroll(['.peak-queue-zone > div', '.peak-hand']);

    const openBattleCard = (zone, index) => {
        const battle = save.activeRun;
        const instance = battle?.[zone]?.[index];
        const card = PEAK_CARD_BY_ID[instance?.cardId];
        if (!card) return;
        selectedCard = { zone, index };
        const level = getPeakEffectiveCardLevel(card, battle.player, 'player', instance);
        const mpCost = getPeakBattleCardCost(battle, 'player', card, zone === 'queue' ? battle.queue.slice(0, index) : battle.queue, instance);
        const playCheck = zone === 'hand' ? canQueuePeakCard(battle, index) : { ok: true };
        const playButton = `<button class="btn btn-primary" type="button" data-action="play-selected-card" ${playCheck.ok ? '' : `disabled title="${esc(playCheck.reason)}"`}>打出</button>`;
        const host = content.querySelector('.peak-battle-card-popover-host');
        if (!host) return;
        content.querySelectorAll('.peak-card-button[data-action="inspect-battle-card"]').forEach((button) => {
            button.classList.toggle('selected', button.dataset.zone === zone && Number(button.dataset.index) === index);
        });
        host.innerHTML = `<aside class="peak-battle-card-popover" style="${rarityStyle(card.rarity)}"><button class="peak-battle-card-close" type="button" data-action="close-battle-card" aria-label="关闭卡牌详情">×</button><header><span>${esc(PEAK_CARD_RARITIES[card.rarity]?.name)} · ${esc(categoryName(card))}</span><strong>${esc(card.name)}</strong><small>Lv.${level} · ${mpCost} MP</small></header><div class="peak-battle-card-popover-body"><div class="peak-battle-card-preview">${cardMarkup(card, level, '', mpCost)}</div><div class="peak-battle-card-details"><dl><div><dt>${card.category === 'attack' ? '适用状态' : '释放条件'}</dt><dd>${esc(conditionText(card))}</dd></div><div><dt>卡牌效果</dt><dd>${esc(effectText(card, level))}</dd></div>${card.requiredAdvancement ? `<div><dt>转职要求</dt><dd>${esc(advancementRequirementText(card))}</dd></div>` : ''}<div><dt>当前目标</dt><dd>${esc(PEAK_COMBAT_STATES[battle.enemy.state] || battle.enemy.state)}</dd></div></dl>${cardFormulaMarkup(card, level, true)}${!playCheck.ok ? `<p class="peak-battle-card-reason">${esc(playCheck.reason)}</p>` : ''}</div></div><footer>${zone === 'hand' ? playButton : '<button class="btn btn-secondary" type="button" data-action="withdraw-selected-card">撤回</button>'}<button class="btn btn-secondary" type="button" data-action="close-battle-card">关闭</button></footer></aside>`;
    };

    const closeBattleCardPopover = () => {
        selectedCard = null;
        const host = content.querySelector('.peak-battle-card-popover-host');
        if (host) host.innerHTML = '';
        content.querySelectorAll('.peak-card-button.selected[data-action="inspect-battle-card"]').forEach((button) => button.classList.remove('selected'));
    };

    const modalFocusable = () => [...modal.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter((element) => element.offsetParent !== null);
    const focusModalEntry = () => {
        if (modal.classList.contains('hidden')) return;
        const active = document.activeElement;
        if (active && modal.contains(active)) return;
        modalFocusable()[0]?.focus({ preventScroll: true });
    };
    const closeModal = ({ force = false } = {}) => {
        if (!force && modal.querySelector('.peak-hand-discard-modal')) return;
        selectedCard = null;
        selectedDiscardUids = new Set();
        modal.classList.add('hidden');
        modal.innerHTML = '';
        const focusTarget = modalReturnFocus;
        modalReturnFocus = null;
        if (focusTarget && document.contains(focusTarget)) window.requestAnimationFrame(() => focusTarget.focus({ preventScroll: true }));
    };

    const openCreateCharacterModal = (name = '') => {
        const definition = PEAK_CHARACTERS[pendingCharacterClass];
        const description = definition.description || definition.summary || {
            sword: '稳健的剑术连段，擅长击飞、浮空与攻防转换。',
            brawler: '强韧的近身连击，擅长多段攻击、灼烧与持续压制。',
            archer: '灵活的远程射击，擅长箭矢连射、蓄势与战术控制。',
            knight: '坚实的誓约守护，擅长积累护盾、防守反击与持续作战。',
            priest: '神圣的祈祷与祝福，擅长治疗、净化与跨回合支援。',
            mage: '多变的秘法施放，擅长法力充能、延迟引爆与魔法爆发。',
            lancer: '凌厉的长枪攻势，擅长贯刺连击、流血与连段爆发。',
        }[pendingCharacterClass] || definition.title;
        const playableClasses = Object.values(PEAK_CHARACTERS).map((entry) => `<button type="button" class="${entry.id === pendingCharacterClass ? 'active' : ''}" data-action="set-create-class" data-id="${entry.id}"><img src="${PEAK_ASSETS.heroes[entry.id]}" alt=""><span>${esc(entry.name)}</span><small>${esc(entry.title)}</small></button>`).join('');
        const reservedClasses = Object.values(PEAK_RESERVED_CLASSES).map((entry) => `<button type="button" class="is-reserved" disabled style="--peak-reserved-accent:${entry.accent}" title="${esc(entry.summary)}"><i aria-hidden="true">${esc(entry.symbol)}</i><span>${esc(entry.name)}<b>开发中</b></span><small>${esc(entry.title)}</small></button>`).join('');
        modal.innerHTML = `<div class="peak-modal-panel peak-character-create-modal"><button class="peak-modal-close" type="button" data-action="close-modal" aria-label="关闭">×</button><header><small>CREATE ADVENTURER</small><h3 id="peak-duel-modal-title">创建角色</h3><p>选择基础职业并为角色命名。当前显示的职业均可创建，并拥有各自的卡组与转职路线。</p></header><div class="peak-create-class-tabs">${playableClasses}${reservedClasses}</div><section class="peak-create-preview"><div><small>BASE CLASS</small><strong>${esc(definition.name)}</strong><p>${esc(description)}</p></div><dl><div><dt>生命</dt><dd>${definition.base.hp}</dd></div><div><dt>MP</dt><dd>${definition.base.mp}</dd></div><div><dt>力量</dt><dd>${definition.base.strength}</dd></div><div><dt>体力</dt><dd>${definition.base.vitality}</dd></div></dl></section><label class="peak-character-name-field"><span>角色名称</span><input id="peak-character-name-input" type="text" minlength="2" maxlength="12" inputmode="text" enterkeyhint="done" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(name)}" placeholder="输入2至12个字符"><small>名称在本地账号内不能重复</small></label><footer><button class="btn btn-secondary" type="button" data-action="close-modal">取消</button><button class="btn btn-primary" type="button" data-action="confirm-create-character">创建角色</button></footer></div>`;
        modal.classList.remove('hidden');
        modal.querySelector('#peak-character-name-input')?.focus();
    };

    const openRenameCharacterModal = (id) => {
        const character = save.characters[id];
        if (!character) return;
        modal.innerHTML = `<div class="peak-modal-panel peak-confirm-modal peak-character-name-modal"><button class="peak-modal-close" type="button" data-action="close-modal" aria-label="关闭">×</button><small>CHARACTER NAME</small><h3 id="peak-duel-modal-title">${character.needsNaming ? '完成角色命名' : '重命名角色'}</h3><p>${esc(getPeakCharacterJobName(character))} · Lv.${character.level}</p><label class="peak-character-name-field"><span>角色名称</span><input id="peak-character-name-input" type="text" minlength="2" maxlength="12" inputmode="text" enterkeyhint="done" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(character.needsNaming ? '' : character.name)}"></label><footer><button class="btn btn-secondary" type="button" data-action="close-modal">取消</button><button class="btn btn-primary" type="button" data-action="confirm-rename-character" data-id="${id}">确认名称</button></footer></div>`;
        modal.classList.remove('hidden');
        modal.querySelector('#peak-character-name-input')?.focus();
    };

    const openDeleteCharacterModal = (id) => {
        const character = save.characters[id];
        if (!character) return;
        modal.innerHTML = `<div class="peak-modal-panel peak-confirm-modal"><button class="peak-modal-close" type="button" data-action="close-modal" aria-label="关闭">×</button><small>RECYCLE CHARACTER</small><h3 id="peak-duel-modal-title">将「${esc(character.name)}」移入回收站？</h3><p>装备、职业卡和全部角色进度都会随角色保留，回收站中的角色仍会占用栏位。</p><footer><button class="btn btn-secondary" type="button" data-action="close-modal">取消</button><button class="btn btn-primary" type="button" data-action="confirm-delete-character" data-id="${id}">移入回收站</button></footer></div>`;
        modal.classList.remove('hidden');
    };

    const openRenameDeckPresetModal = () => {
        const deck = activeDeck();
        const preset = deck?.presets?.find((entry) => entry.id === deck.activePresetId);
        if (!preset) return;
        modal.innerHTML = `<div class="peak-modal-panel peak-confirm-modal peak-deck-preset-modal"><button class="peak-modal-close" type="button" data-action="close-modal" aria-label="关闭">×</button><small>DECK PRESET</small><h3 id="peak-duel-modal-title">重命名卡组方案</h3><p>${esc(activeCharacter().name)} · 当前方案 ${esc(preset.name)}</p><label class="peak-character-name-field"><span>方案名称</span><input id="peak-deck-preset-name-input" type="text" minlength="1" maxlength="16" autocomplete="off" value="${esc(preset.name)}"></label><footer><button class="btn btn-secondary" type="button" data-action="close-modal">取消</button><button class="btn btn-primary" type="button" data-action="confirm-rename-deck-preset" data-id="${preset.id}">确认名称</button></footer></div>`;
        modal.classList.remove('hidden');
        modal.querySelector('#peak-deck-preset-name-input')?.focus();
        modal.querySelector('#peak-deck-preset-name-input')?.select();
    };

    const openCopyDeckPresetModal = (targetPresetId) => {
        const deck = activeDeck();
        const sourcePreset = deck?.presets?.find((entry) => entry.id === deck.activePresetId);
        const targetPreset = deck?.presets?.find((entry) => entry.id === targetPresetId);
        if (!sourcePreset || !targetPreset || sourcePreset.id === targetPreset.id) return;
        modal.innerHTML = `<div class="peak-modal-panel peak-confirm-modal peak-deck-preset-modal"><button class="peak-modal-close" type="button" data-action="close-modal" aria-label="关闭">×</button><small>COPY DECK PRESET</small><h3 id="peak-duel-modal-title">覆盖「${esc(targetPreset.name)}」？</h3><p>将用「${esc(sourcePreset.name)}」的 ${deck.cards.length} 张卡覆盖目标方案。目标方案原有的 ${targetPreset.cards.length} 张卡组配置将被替换。</p><footer><button class="btn btn-secondary" type="button" data-action="close-modal">取消</button><button class="btn btn-primary" type="button" data-action="confirm-copy-deck-preset" data-id="${targetPreset.id}">确认覆盖</button></footer></div>`;
        modal.classList.remove('hidden');
    };

    const advancementGrantMarkup = (cardIds = [], title = '转职赠卡') => {
        const cards = cardIds.map((cardId) => PEAK_CARD_BY_ID[cardId]).filter(Boolean);
        if (!cards.length) return '';
        return `<section class="peak-advancement-grants"><span>${esc(title)}</span><div>${cards.map((card) => `<small style="${rarityStyle(card.rarity)}"><b>${esc(card.name)}</b><em>${esc(categoryName(card))}</em></small>`).join('')}</div></section>`;
    };

    const openAdvancementModal = (id) => {
        const character = save.characters[id];
        const status = getPeakAdvancementStatus(character);
        if (!character || !status.available) return;
        const paths = Object.values(PEAK_ADVANCEMENTS).filter((entry) => entry.baseClassId === character.baseClassId);
        if (status.tier === 1) {
            modal.innerHTML = `<div class="peak-modal-panel peak-advancement-modal"><button class="peak-modal-close" type="button" data-action="close-modal" aria-label="关闭">×</button><header><small>FIRST ADVANCEMENT</small><h3 id="peak-duel-modal-title">选择一转路线</h3><p>${esc(character.name)}已达到Lv.30。路线确认后将决定50级二转方向。</p></header><div class="peak-advancement-paths">${paths.map((path) => `<article style="--peak-path-accent:${path.accent}"><span>${esc(PEAK_CHARACTERS[path.baseClassId].name)}一转</span><strong>${esc(path.firstName)}</strong><small>二转 · ${esc(path.secondName)}</small><p>${esc(path.firstSummary)}</p><em>${esc(advancementCombatText(path, 1))}</em>${advancementGrantMarkup(path.firstGrantCards, '一转立即获得')}<button type="button" data-action="preview-advancement" data-id="${id}" data-path="${path.id}">选择${esc(path.firstName)}</button></article>`).join('')}</div><footer><button class="btn btn-secondary" type="button" data-action="close-modal">暂不转职</button></footer></div>`;
        } else {
            const path = PEAK_ADVANCEMENTS[character.advancement.pathId];
            modal.innerHTML = `<div class="peak-modal-panel peak-advancement-modal peak-second-advancement" style="--peak-path-accent:${path.accent}"><button class="peak-modal-close" type="button" data-action="close-modal" aria-label="关闭">×</button><header><small>SECOND ADVANCEMENT</small><h3 id="peak-duel-modal-title">${esc(path.secondName)}</h3><p>${esc(path.secondSummary)}</p></header><div class="peak-advancement-emblem"><span>${esc(path.firstName)}</span><strong>→</strong><b>${esc(path.secondName)}</b></div><p class="peak-advancement-combat-preview">${esc(advancementCombatText(path, 2))}</p>${advancementGrantMarkup(path.secondGrantCards, '完成二转获得')}<p class="peak-trial-note">二转试炼不消耗体力，也不会产出普通副本奖励。击败试炼首领后完成二转。</p><footer><button class="btn btn-secondary" type="button" data-action="close-modal">暂不挑战</button><button class="btn btn-primary" type="button" data-action="start-advancement-trial" data-id="${id}" data-path="${path.id}">开始二转试炼</button></footer></div>`;
        }
        modal.classList.remove('hidden');
    };

    const openAdvancementConfirmModal = (id, pathId) => {
        const character = save.characters[id];
        const path = PEAK_ADVANCEMENTS[pathId];
        if (!character || !path || path.baseClassId !== character.baseClassId) return;
        modal.innerHTML = `<div class="peak-modal-panel peak-confirm-modal" style="--peak-path-accent:${path.accent}"><button class="peak-modal-close" type="button" data-action="close-modal" aria-label="关闭">×</button><small>ADVANCEMENT TRIAL</small><h3 id="peak-duel-modal-title">挑战${esc(path.firstName)}试炼？</h3><p>${esc(path.firstSummary)} 通过试炼后路线将正式锁定，50级固定二转为${esc(path.secondName)}。</p><p class="peak-trial-note">试炼不消耗体力，也不会产出金币、经验或装备；失败后可以重新挑战。</p><footer><button class="btn btn-secondary" type="button" data-action="open-advancement" data-id="${id}">返回选择</button><button class="btn btn-primary" type="button" data-action="start-advancement-trial" data-id="${id}" data-path="${path.id}">开始一转试炼</button></footer></div>`;
        modal.classList.remove('hidden');
    };

    const openHandDiscardModal = () => {
        const battle = save.activeRun;
        if (!battle) return;
        const required = Math.max(0, battle.hand.length - PEAK_PLAYER_HAND_LIMIT);
        const validUids = new Set(battle.hand.map((entry) => entry.uid));
        selectedDiscardUids = new Set([...selectedDiscardUids].filter((uid) => validUids.has(uid)));
        modal.innerHTML = `<div class="peak-modal-panel peak-hand-discard-modal"><header><small>HAND LIMIT</small><h3 id="peak-duel-modal-title">选择回合结束弃牌</h3><p>当前手牌${battle.hand.length}张，选择${required}张丢弃后保留${PEAK_PLAYER_HAND_LIMIT}张。</p><strong>${selectedDiscardUids.size}/${required}</strong></header><div class="peak-hand-discard-grid">${battle.hand.map((instance) => {
            const card = PEAK_CARD_BY_ID[instance.cardId];
            const level = getPeakEffectiveCardLevel(card, battle.player, 'player', instance);
            const selected = selectedDiscardUids.has(instance.uid);
            return `<button type="button" class="peak-hand-discard-card ${selected ? 'selected' : ''}" data-action="toggle-hand-discard" data-uid="${esc(instance.uid)}" aria-pressed="${selected}">${cardMarkup(card, level)}<span>${selected ? '将丢弃' : '保留'}</span></button>`;
        }).join('')}</div><footer><span class="peak-discard-required-hint">手牌超出上限，必须先选择弃牌</span><button class="btn btn-primary" type="button" data-action="confirm-hand-discard" ${selectedDiscardUids.size === required ? '' : 'disabled'}>丢弃并结算</button></footer></div>`;
        modal.classList.remove('hidden');
    };

    const openPackModal = (result) => {
        const newCount = result.cards.filter((entry) => entry.isNew).length;
        const rarityOrder = Object.keys(PEAK_CARD_RARITIES);
        const highestRarity = result.cards.reduce((best, entry) => rarityOrder.indexOf(PEAK_CARD_BY_ID[entry.cardId]?.rarity) > rarityOrder.indexOf(best) ? PEAK_CARD_BY_ID[entry.cardId].rarity : best, 'common');
        modal.innerHTML = `<div class="peak-modal-panel peak-pack-result"><button class="peak-modal-close" type="button" data-action="close-modal" aria-label="关闭">×</button><header><small>PACK OPENED</small><h3 id="peak-duel-modal-title">${esc(result.pack.name)}</h3><div class="peak-pack-result-summary"><span>获得 <b>${result.cards.length}</b> 张</span><span>新卡 <b>${newCount}</b> 张</span><span>最高 <b style="color:${PEAK_CARD_RARITIES[highestRarity].color}">${esc(PEAK_CARD_RARITIES[highestRarity].name)}</b></span></div></header><div class="peak-pack-reveal">${result.cards.map((entry, index) => {
            const card = PEAK_CARD_BY_ID[entry.cardId];
            return `<div class="peak-reveal-card" style="${rarityStyle(card.rarity)};--peak-delay:${index * 80}ms">${cardMarkup(card, activeCollection()[card.id]?.level || 1)}<strong>${entry.isNew ? 'NEW' : entry.upgradeCopies ? `同名卡 +${entry.upgradeCopies}` : '持有数 +1'}</strong></div>`;
        }).join('')}</div><footer><button class="btn btn-primary" type="button" data-action="close-modal">收下卡牌</button></footer></div>`;
        modal.classList.remove('hidden');
    };

    const openRewardModal = (reward, dungeon) => {
        selectedEquipmentId = reward.items[0]?.id || '';
        const xpPercent = reward.newLevel >= 60 || reward.advancementAvailable ? 100 : Math.max(0, Math.min(100, Math.round(reward.currentXp / Math.max(1, reward.xpToNext) * 100)));
        const rewardCard = PEAK_CARD_BY_ID[reward.card?.cardId];
        const cardRewardMarkup = rewardCard ? `<section class="peak-reward-card"><header><small>CARD ACQUIRED</small><h4>困难卡牌奖励</h4><strong style="color:${PEAK_CARD_RARITIES[rewardCard.rarity].color}">${esc(PEAK_CARD_RARITIES[rewardCard.rarity].name)}</strong></header><div>${cardMarkup(rewardCard, activeCollection()[rewardCard.id]?.level || 1)}<article><span>${reward.card.isNew ? '首次获得' : reward.card.upgradeCopies ? '转为同名升级卡' : '持有数量增加'}</span><strong>${esc(rewardCard.name)}</strong><small>${esc(categoryName(rewardCard))} · ${rewardCard.classId === 'all' ? '通用' : esc(PEAK_CHARACTERS[rewardCard.classId]?.name || '')}</small><p>${esc(rewardCard.summary)}</p></article></div></section>` : '';
        const equipmentRows = reward.items.map((item, index) => {
            const rarity = PEAK_EQUIPMENT_RARITIES[item.rarity];
            const stats = Object.entries(item.stats || {}).slice(0, 3).map(([stat, value]) => `${statNames[stat] || stat} +${formatEquipmentValue(value)}`).join(' · ');
            return `<article style="--peak-item-color:${rarity.color}">${equipmentIconMarkup(item.slot, item.rarity, item.name)}<div><span>${item.fieldDrop ? '小怪掉落 · ' : ''}${esc(rarity.name)} · ${esc(PEAK_EQUIPMENT_GRADES[item.grade]?.name || item.grade)}</span><strong>${esc(item.name)}</strong><small>Lv.${item.level} ${esc(PEAK_EQUIPMENT_SLOT_LABELS[item.slot])}</small><em>${esc(stats)}</em></div></article>`;
        }).join('');
        modal.innerHTML = `<div class="peak-modal-panel peak-reward-result" style="--peak-reward-bg:url('${dungeon?.backdrop || ''}')"><button class="peak-modal-close" type="button" data-action="close-modal" aria-label="关闭">×</button>
            <header class="peak-reward-hero"><small>MISSION COMPLETE</small><h3 id="peak-duel-modal-title">${esc(dungeon?.name || '战斗奖励')}</h3><p>${esc(dungeon?.areaName || '远征区域')} · ${esc(dungeon?.enemy?.difficulty || '普通')} · ${reward.rounds}回合</p><div><span>通关</span>${reward.fieldDropCount ? `<span>额外掉落 ${reward.fieldDropCount}</span>` : ''}${rewardCard ? '<span>随机卡牌 ×1</span>' : ''}</div></header>
            <section class="peak-reward-progression"><div class="peak-reward-level"><small>角色成长</small><strong>Lv.${reward.oldLevel}${reward.newLevel !== reward.oldLevel ? ` <i>→</i> Lv.${reward.newLevel}` : ''}</strong>${reward.levelsGained ? `<b>提升 ${reward.levelsGained} 级</b>` : '<span>等级经验已累积</span>'}</div><div class="peak-reward-xp"><header><span>${reward.newLevel >= 60 ? '已达到等级上限' : reward.advancementAvailable ? `等待转职 · 已储存 ${reward.overflowXp} EXP` : `当前经验 ${reward.currentXp}/${reward.xpToNext}`}</span><strong>+${reward.xp} EXP</strong></header><i><b style="width:${xpPercent}%"></b></i></div>${reward.blessingPointsGained ? `<div class="peak-reward-blessing"><span>祝福点</span><strong>+${reward.blessingPointsGained}</strong><small>偶数等级奖励</small></div>` : ''}</section>
            <section class="peak-reward-breakdown"><header><small>REWARD BREAKDOWN</small><h4>收益明细</h4></header><div><article><img src="assets/coin.png" alt=""><span>副本金币</span><strong>+${reward.gold.toLocaleString('zh-CN')}</strong><small>基础 ${reward.baseGold} · 保底 ${reward.guaranteedGold}${reward.goldBonus ? ` · 祝福 +${reward.goldBonus}` : ''}</small></article><article><span class="peak-reward-exp-mark">EXP</span><span>角色经验</span><strong>+${reward.xp.toLocaleString('zh-CN')}</strong><small>基础 ${reward.baseXp}${reward.xpBonus ? ` · 祝福加成 +${reward.xpBonus}` : ''}</small></article>${reward.overflowGold ? `<article><span class="peak-reward-sale-mark">售</span><span>溢出出售</span><strong>+${reward.overflowGold.toLocaleString('zh-CN')}</strong><small>装备背包已满，自动折算</small></article>` : ''}</div></section>
            ${cardRewardMarkup}
            <section class="peak-reward-loot"><header><small>EQUIPMENT ACQUIRED</small><h4>获得装备</h4><strong>${reward.items.length}件</strong></header><div class="peak-reward-items">${equipmentRows || '<p>装备背包已满，本次装备已自动折算为金币。</p>'}</div></section>
            <footer><button class="btn btn-primary" type="button" data-action="close-modal">返回地图</button><button class="btn btn-secondary" type="button" data-action="reward-to-equipment">查看装备</button>${reward.advancementAvailable ? `<button class="btn btn-secondary peak-reward-blessing-button" type="button" data-action="open-advancement" data-id="${save.activeCharacterId}">进行转职</button>` : reward.blessingPointsGained ? '<button class="btn btn-secondary peak-reward-blessing-button" type="button" data-action="reward-to-blessing">前往祝福</button>' : ''}</footer></div>`;
        modal.classList.remove('hidden');
    };

    const openBlessingResetModal = () => {
        const status = getPeakBlessingStatus(save);
        if (!status.spent) return;
        const refund = Math.floor(status.goldSpent * .5);
        modal.innerHTML = `<div class="peak-modal-panel peak-confirm-modal peak-blessing-reset-modal"><button class="peak-modal-close" type="button" data-action="close-modal" aria-label="关闭">×</button><small>RESET BLESSINGS</small><h3 id="peak-duel-modal-title">重置${esc(activeCharacter().name)}的全部祝福？</h3><p>所有已投入祝福点将返还；学习消耗的金币只返还50%。</p><dl><div><dt>返还祝福点</dt><dd>${status.spent}</dd></div><div><dt>累计花费</dt><dd>${status.goldSpent.toLocaleString('zh-CN')} 金币</dd></div><div><dt>实际返还</dt><dd>${refund.toLocaleString('zh-CN')} 金币</dd></div><div><dt>重置损耗</dt><dd>${(status.goldSpent - refund).toLocaleString('zh-CN')} 金币</dd></div></dl><footer><button class="btn btn-secondary" type="button" data-action="close-modal">取消</button><button class="btn btn-primary" type="button" data-action="confirm-reset-blessings">确认重置</button></footer></div>`;
        modal.classList.remove('hidden');
    };

    const openAbandonModal = () => {
        const trial = Boolean(save.activeRun?.advancementTrial || save.activeRun?.peakTrial);
        modal.innerHTML = `<div class="peak-modal-panel peak-confirm-modal"><button class="peak-modal-close" type="button" data-action="close-modal" aria-label="关闭">×</button><small>LEAVE BATTLE</small><h3 id="peak-duel-modal-title">退出当前${trial ? '试炼' : '战斗'}？</h3><p>${save.activeRun?.peakTrial ? '退出会结束本轮巅峰试炼，已领取的层奖励不会回滚。' : trial ? '退出不会完成转职，可以随时重新挑战。' : '本次挑战消耗的体力不会返还。'}</p><footer><button class="btn btn-secondary" type="button" data-action="close-modal">继续战斗</button><button class="btn btn-primary" type="button" data-action="confirm-abandon">确认退出</button></footer></div>`;
        modal.classList.remove('hidden');
    };

    const openBattleLog = () => {
        const entries = (save.activeRun?.log || []).slice().reverse();
        modal.innerHTML = `<div class="peak-modal-panel peak-battle-log-modal"><button class="peak-modal-close" type="button" data-action="close-modal" aria-label="关闭">×</button><header><small>BATTLE RECORD</small><h3 id="peak-duel-modal-title">战斗记录</h3></header><ol>${entries.map((entry) => `<li data-kind="${esc(entry.type)}"><span>R${entry.round}</span><p>${esc(entry.text)}</p></li>`).join('')}</ol><footer><button class="btn btn-secondary" type="button" data-action="close-modal">关闭</button></footer></div>`;
        modal.classList.remove('hidden');
    };

    const openAttributeCompendiumModal = () => {
        modal.innerHTML = `<div class="peak-modal-panel peak-attribute-compendium"><button class="peak-modal-close" type="button" data-action="close-modal" aria-label="关闭">×</button><header><small>ATTRIBUTE CODEX</small><h3 id="peak-duel-modal-title">属性图鉴</h3><p>装备、祝福和卡牌的数值最终都会在这里参与结算。百分比属性按当前战斗公式计算。</p></header><div class="peak-attribute-guide-grid">${PEAK_ATTRIBUTE_GUIDE.map((group) => `<section><h4>${esc(group.title)}</h4><dl>${group.entries.map(([name, description]) => `<div><dt>${esc(name)}</dt><dd>${esc(description)}</dd></div>`).join('')}</dl></section>`).join('')}</div><footer><button class="btn btn-primary" type="button" data-action="close-modal">知道了</button></footer></div>`;
        modal.classList.remove('hidden');
    };

    const openBulkSellModal = () => {
        const character = activeCharacter();
        const selected = character.inventory.filter((item) => selectedInventoryIds.has(item.id));
        const sellable = selected.filter((item) => !item.locked && character.equipped[item.slot] !== item.id);
        const gold = sellable.reduce((sum, item) => sum + Math.max(0, Number(item.price) || 0), 0);
        modal.innerHTML = `<div class="peak-modal-panel peak-confirm-modal"><button class="peak-modal-close" type="button" data-action="close-modal" aria-label="关闭">×</button><small>BULK SELL</small><h3 id="peak-duel-modal-title">出售选中的装备？</h3><p>将出售 ${sellable.length} 件未锁定、未装备的装备，获得 <strong>${gold.toLocaleString('zh-CN')}</strong> 金币。</p>${selected.length - sellable.length ? `<small>已跳过 ${selected.length - sellable.length} 件锁定或正在装备的物品。</small>` : ''}<footer><button class="btn btn-secondary" type="button" data-action="close-modal">取消</button><button class="btn btn-primary" type="button" data-action="confirm-bulk-sell" ${sellable.length ? '' : 'disabled'}>确认出售</button></footer></div>`;
        modal.classList.remove('hidden');
    };

    const openSingleSellModal = (itemId) => {
        const item = activeCharacter().inventory.find((entry) => entry.id === itemId);
        if (!item) return;
        const rarity = PEAK_EQUIPMENT_RARITIES[item.rarity];
        modal.innerHTML = `<div class="peak-modal-panel peak-confirm-modal"><button class="peak-modal-close" type="button" data-action="close-modal" aria-label="关闭">×</button><small>VALUABLE EQUIPMENT</small><h3 id="peak-duel-modal-title">出售高稀有度装备？</h3><p>「${esc(item.name)}」是${esc(rarity?.name || item.rarity)}装备。出售后获得 <strong>${Math.max(0, Number(item.price) || 0).toLocaleString('zh-CN')}</strong> 金币，且无法撤销。</p><footer><button class="btn btn-secondary" type="button" data-action="close-modal">取消</button><button class="btn btn-primary" type="button" data-action="confirm-sell-item" data-id="${item.id}">确认出售</button></footer></div>`;
        modal.classList.remove('hidden');
    };

    const peakHitStopDuration = (tier) => ({ light: 14, medium: 28, heavy: 44, critical: 64 }[tier] || 0);

    const runPeakImpactFeedback = (frame) => {
        const profile = getPeakImpactProfile(frame);
        const projectile = profile.damage > 0 && frame.visual?.target ? hasCombatProjectile(frame, frame.visual.target) : false;
        const delay = projectile ? Math.round(peakResolutionFrameDuration(save.settings.resolutionSpeed) * .3) : 0;
        if (projectile) playPeakTone(({ archer: 510, knight: 360, priest: 620, mage: 680, lancer: 420 })[save.activeClass] || 460, .055, 'triangle', .014);
        window.setTimeout(() => playPeakFrameSound(frame), delay);
        if (!profile.damage || save.settings.reducedMotion || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
        const stopDuration = peakHitStopDuration(profile.tier);
        window.setTimeout(() => {
            if (resolutionFrame !== frame) return;
            const battleElement = content.querySelector('.peak-battle');
            if (!battleElement) return;
            battleElement.classList.add('is-hit-stop');
            if ((profile.tier === 'heavy' || profile.tier === 'critical') && globalThis.navigator?.vibrate) globalThis.navigator.vibrate(profile.tier === 'critical' ? 24 : 12);
            window.setTimeout(() => battleElement.classList.remove('is-hit-stop'), stopDuration);
        }, delay);
    };

    const playResolution = async (result) => {
        resolving = true;
        closeModal();
        const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const reduceCombatMotion = Boolean(save.settings.reducedMotion) || reducedMotion;
        const duration = reduceCombatMotion ? 30 : peakResolutionFrameDuration(save.settings.resolutionSpeed);
        for (const frame of result.frames) {
            if (!saveOwner.owned || storageIssue) { resolutionFrame = null; resolving = false; return; }
            resolutionFrame = frame;
            render();
            runPeakImpactFeedback(frame);
            const frameImpactProfile = getPeakImpactProfile(frame);
            const hitStop = !reduceCombatMotion && frameImpactProfile.damage > 0 ? peakHitStopDuration(frameImpactProfile.tier) : 0;
            const frameDuration = (frame.kind === 'bossDefeated' && !reduceCombatMotion ? 850 : duration) + hitStop;
            await new Promise((resolve) => window.setTimeout(resolve, frameDuration));
        }
        resolutionFrame = null;
        if (!saveOwner.owned || storageIssue) { resolving = false; return; }
        save.activeRun = result.state;
        resolving = false;
        commit();
        render();
        if (save.activeRun?.phase === 'playerDiscarding') openHandDiscardModal();
    };

    const battlePlayerPayload = () => createPeakBattlePlayerPayload(save, save.activeCharacterId);

    const runStartPeakTrial = async () => {
        const now = await refreshTrustedTime(true);
        if (!now) return;
        const result = startPeakTrial(save, now);
        save = result.state;
        if (!result.ok) { setNotice(result.reason, 'error'); render(); return; }
        commit();
        setNotice(`巅峰试炼已开启，本周还可开启${result.remainingRuns}轮。`, 'success');
        render();
    };

    const runBeginPeakTrialFloor = () => {
        const character = activeCharacter();
        const run = character?.peakTrial;
        if (!run || run.phase !== 'ready') { setNotice('当前不能开始试炼战斗。', 'error'); return; }
        const check = validatePeakDeck(activeDeck().cards, save.activeClass, activeCollection(), character.advancement);
        if (!check.valid) { setNotice(check.errors[0], 'error'); return; }
        const floor = buildPeakTrialFloor({ floor: run.floor, characterLevel: character.level, seed: run.seed });
        if (!floor) { setNotice('试炼层数据不存在。', 'error'); return; }
        const player = applyPeakTrialBoons(battlePlayerPayload(), run.boons);
        const battle = createPeakBattle({ deck: activeDeck().cards, dungeonId: `peak_trial_${run.floor}`, encounters: [floor.enemy], enemy: floor.enemy, seed: run.seed + run.floor, player });
        battle.player.hp = Math.max(1, Math.round(battle.player.maxHp * run.remainingHpRatio));
        battle.peakTrial = { runId: run.id, floor: run.floor };
        battle.trialName = `巅峰试炼 · ${run.floor}F ${floor.name}`;
        battle.trialBackdrop = floor.backdrop;
        battle.log[0].text = `${battle.trialName}开始。当前生命比例将带入后续楼层。`;
        const result = beginPeakTrialFloor(save, battle);
        save = result.state;
        if (!result.ok) { setNotice(result.reason, 'error'); return; }
        commit();
        view = 'battle';
        setNotice('');
        render();
    };

    const startAdvancementTrial = (characterId, pathId) => {
        if (save.activeRun) { setNotice('请先结束当前战斗。', 'error'); return; }
        if (save.characters?.[characterId]?.activeRun) { setNotice('该角色已有未结束的战斗，请先进入角色处理。', 'error'); return; }
        if (characterId !== save.activeCharacterId) {
            const selected = selectPeakCharacter(save, characterId);
            if (!selected.ok) { save = selected.state; setNotice(selected.reason, 'error'); return; }
            save = selected.state;
            commit();
        }
        const character = activeCharacter();
        const status = getPeakAdvancementStatus(character);
        const path = PEAK_ADVANCEMENTS[pathId];
        if (!status.available || !path || path.baseClassId !== character.baseClassId) {
            setNotice(status.reason || '当前不能进行该转职试炼。', 'error');
            render();
            return;
        }
        if (status.tier === 2 && character.advancement.pathId !== path.id) {
            setNotice('二转路线必须继承当前一转路线。', 'error');
            return;
        }
        const collection = activeCollection();
        const deckCheck = validatePeakDeck(activeDeck().cards, save.activeClass, collection, character.advancement);
        if (!deckCheck.valid) { setNotice(deckCheck.errors[0], 'error'); closeModal(); render(); return; }
        const targetLevel = status.tier === 1 ? 30 : 50;
        const targetDifficulty = status.tier === 1 ? 'elite' : 'hard';
        const candidates = PEAK_DUNGEONS.filter((entry) => entry.difficultyId === targetDifficulty);
        const trialDungeon = candidates.reduce((best, entry) => (
            !best || Math.abs(entry.level - targetLevel) < Math.abs(best.level - targetLevel) ? entry : best
        ), null) || PEAK_DUNGEONS[0];
        const hpScale = status.tier === 1 ? 1.08 : 1.45;
        const attackScale = status.tier === 1 ? 1.06 : 1.25;
        const enemy = {
            ...trialDungeon.enemy,
            id: `advancement-trial-${path.id}-${status.tier}`,
            name: status.tier === 1 ? `${path.firstName}试炼官` : `${path.secondName}试炼官`,
            difficulty: status.tier === 1 ? '一转试炼' : '二转试炼',
            maxHp: Math.round(trialDungeon.enemy.maxHp * hpScale),
            combatAttack: Math.round(trialDungeon.enemy.combatAttack * attackScale),
            cardLevel: Math.max(status.tier === 1 ? 4 : 7, trialDungeon.enemy.cardLevel || 1),
            drawPerTurn: Math.max(status.tier === 1 ? 3 : 4, trialDungeon.enemy.drawPerTurn || 3),
            dropChance: 0,
            isBoss: true,
        };
        const battle = createPeakBattle({
            deck: activeDeck().cards,
            dungeonId: trialDungeon.id,
            encounters: [enemy],
            enemy,
            seed: Date.now(),
            player: battlePlayerPayload(),
        });
        battle.advancementTrial = { characterId: character.id, tier: status.tier, pathId: path.id };
        battle.trialName = `${status.tier === 1 ? '一转' : '二转'}试炼 · ${status.tier === 1 ? path.firstName : path.secondName}`;
        battle.trialBackdrop = trialDungeon.backdrop;
        battle.log[0].text = `${battle.trialName}开始。试炼不消耗体力，胜利后完成转职。`;
        save.activeRun = battle;
        commit();
        closeModal();
        setNotice('');
        view = 'battle';
        render();
    };

    const startBattle = () => {
        const dungeon = selectedDungeon();
        if (!save.progress.unlockedDungeons.includes(dungeon.id)) { setNotice('该副本尚未解锁。', 'error'); return; }
        const collection = activeCollection();
        const check = validatePeakDeck(activeDeck().cards, save.activeClass, collection, activeCharacter().advancement);
        if (!check.valid) { setNotice(check.errors[0], 'error'); return; }
        const spent = spendPeakStamina(save, dungeon.staminaCost);
        if (!spent.ok) { save = spent.state; setNotice(spent.reason, 'error'); render(); return; }
        save = spent.state;
        save.activeRun = createPeakBattle({
            deck: activeDeck().cards,
            dungeonId: dungeon.id,
            encounters: dungeon.encounters,
            seed: Date.now(),
            player: battlePlayerPayload(),
            enemy: {
                name: dungeon.enemy.name,
                maxHp: dungeon.enemy.maxHp,
                attack: dungeon.enemy.combatAttack,
                physicalDefense: dungeon.enemy.physicalDefense,
                magicalDefense: dungeon.enemy.magicalDefense,
                deck: dungeon.enemy.deck,
                drawPerTurn: dungeon.enemy.drawPerTurn,
                cardLevel: dungeon.enemy.cardLevel,
                maxMp: dungeon.enemy.maxMp,
                difficulty: dungeon.enemy.difficulty,
            },
        });
        commit();
        setNotice('');
        view = 'battle';
        render();
    };

    const openAdvancementResultModal = (result) => {
        const path = result.path;
        const jobName = result.tier === 1 ? path.firstName : path.secondName;
        const stats = result.tier === 1 ? path.firstStats : path.secondStats;
        const statRows = Object.entries(stats || {}).map(([stat, value]) => `<span>${esc(statNames[stat] || stat)} <b>+${value}</b></span>`).join('');
        const cardRows = (result.grantedCards || []).map((entry) => {
            const card = PEAK_CARD_BY_ID[entry.cardId];
            return `<span style="${rarityStyle(card?.rarity)}"><b>${esc(card?.name || entry.cardId)}</b><small>${entry.isNew ? '新卡解锁' : '已有卡牌保留原等级'}</small></span>`;
        }).join('');
        modal.innerHTML = `<div class="peak-modal-panel peak-advancement-result" style="--peak-path-accent:${path.accent}"><small>ADVANCEMENT COMPLETE</small><h3 id="peak-duel-modal-title">${esc(jobName)}</h3><p>${esc(result.character.name)}已通过${result.tier === 1 ? '一转' : '二转'}试炼。</p><div class="peak-advancement-result-stats">${statRows}</div><section><header><span>转职卡牌</span><strong>${result.grantedCards?.length || 0}</strong></header><div>${cardRows || '<span><b>职业卡牌已继承</b><small>没有新增卡牌</small></span>'}</div></section>${result.levelsGained ? `<em>储存经验已结算，角色提升 ${result.levelsGained} 级</em>` : ''}<footer><button class="btn btn-primary" type="button" data-action="close-modal">返回地图</button><button class="btn btn-secondary" type="button" data-action="reward-to-deck">配置转职卡组</button></footer></div>`;
        modal.classList.remove('hidden');
    };

    const finishBattle = async () => {
        const battle = save.activeRun;
        if (battle?.peakTrial) {
            if (battle.phase === 'victory') {
                const now = await refreshTrustedTime(true);
                if (!now) return;
                const result = settlePeakTrialFloor(save, battle, now);
                save = result.state;
                if (!result.ok) { setNotice(result.reason, 'error'); render(); return; }
                commit();
                view = 'trial';
                setNotice(result.completed ? `巅峰试炼完成！本轮共获得 ${result.run.earnedGold} 金币和 ${result.run.earnedVouchers} 代金券。` : `第${battle.peakTrial.floor}层通过，获得 ${result.reward.gold + result.reward.firstClearGold} 金币${result.reward.vouchers ? `和 ${result.reward.vouchers} 代金券` : ''}。`, 'success');
                render();
                return;
            }
            const result = failPeakTrialFloor(save, battle);
            save = result.state;
            if (result.ok) commit();
            view = 'trial';
            setNotice('本轮巅峰试炼已经结束，可以调整构筑后重新开始。', 'error');
            render();
            return;
        }
        if (battle?.advancementTrial) {
            const trial = battle.advancementTrial;
            if (battle.phase === 'victory') {
                const result = advancePeakCharacter(save, trial.characterId, trial.pathId);
                if (!result.ok) { setNotice(result.reason, 'error'); return; }
                save = result.state;
                save.activeRun = null;
                commit();
                view = 'map';
                render();
                openAdvancementResultModal(result);
                return;
            }
            save.activeRun = null;
            commit();
            view = 'map';
            setNotice('转职试炼未通过，可以调整卡组与装备后重新挑战。', 'error');
            render();
            return;
        }
        if (battle?.phase === 'victory') {
            const result = settlePeakVictory(save, battle);
            if (!result.ok) { setNotice(result.reason, 'error'); return; }
            save = result.state;
            save.activeRun = null;
            commit();
            view = 'map';
            render();
            openRewardModal(result.reward, PEAK_DUNGEONS.find((entry) => entry.id === battle.dungeonId));
            return;
        }
        save.activeRun = null;
        commit();
        view = 'map';
        render();
    };

    const scheduleCardSearchRender = (selector) => {
        globalThis.clearTimeout(cardSearchTimer);
        cardSearchTimer = globalThis.setTimeout(() => {
            render();
            const input = content.querySelector(selector);
            if (input) {
                input.focus();
                input.setSelectionRange(input.value.length, input.value.length);
            }
        }, 140);
    };

    ['click', 'dblclick', 'input', 'change', 'keydown', 'compositionstart', 'compositionend'].forEach((type) => {
        root.addEventListener(type, (event) => {
            if (saveOwner.owned && !storageIssue) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            if (type !== 'click' || !event.target.closest?.('[data-retry-peak-save]')) return;
            if (storageIssue?.code === 'PEAK_SAVE_WRITE' && saveOwner.owned) {
                storageIssue = null;
                persistence.flush();
                render();
            } else if (saveOwner.owned) window.location.reload();
            else void enterProtectedSession();
        }, true);
    });

    root.addEventListener('compositionstart', (event) => {
        if (event.target.closest('[data-codex-search], [data-deck-search]')) cardSearchComposing = true;
    });

    root.addEventListener('compositionend', (event) => {
        const codexSearch = event.target.closest('[data-codex-search]');
        const deckSearch = event.target.closest('[data-deck-search]');
        if (!codexSearch && !deckSearch) return;
        cardSearchComposing = false;
        if (codexSearch) { codexQuery = codexSearch.value; codexPage = 1; }
        if (deckSearch) { deckQuery = deckSearch.value; deckPage = 1; }
        scheduleCardSearchRender(codexSearch ? '[data-codex-search]' : '[data-deck-search]');
    });

    root.addEventListener('input', (event) => {
        const codexSearch = event.target.closest('[data-codex-search]');
        const deckSearch = event.target.closest('[data-deck-search]');
        if (!codexSearch && !deckSearch) return;
        if (codexSearch) { codexQuery = codexSearch.value; codexPage = 1; }
        if (deckSearch) { deckQuery = deckSearch.value; deckPage = 1; }
        if (cardSearchComposing || event.isComposing || event.inputType === 'insertCompositionText') return;
        scheduleCardSearchRender(codexSearch ? '[data-codex-search]' : '[data-deck-search]');
    });

    root.addEventListener('change', (event) => {
        const inventoryFilter = event.target.closest('[data-inventory-filter]');
        if (inventoryFilter) {
            if (inventoryFilter.dataset.inventoryFilter === 'slot') inventorySlotFilter = inventoryFilter.value;
            else if (inventoryFilter.dataset.inventoryFilter === 'rarity') inventoryRarityFilter = inventoryFilter.value;
            else if (inventoryFilter.dataset.inventoryFilter === 'status') inventoryStatusFilter = inventoryFilter.value;
            else if (inventoryFilter.dataset.inventoryFilter === 'stat') inventoryStatFilter = inventoryFilter.value;
            selectedEquipmentId = '';
            commitViewSettings();
            render();
            return;
        }
        const deckFilter = event.target.closest('[data-deck-filter]');
        if (deckFilter) {
            if (deckFilter.dataset.deckFilter === 'rarity') deckRarityFilter = deckFilter.value;
            else if (deckFilter.dataset.deckFilter === 'type') deckTypeFilter = deckFilter.value;
            else if (deckFilter.dataset.deckFilter === 'sort') deckSort = deckFilter.value;
            deckPage = 1;
            commitViewSettings();
            render();
            return;
        }
        const filter = event.target.closest('[data-codex-filter]');
        if (!filter) return;
        if (filter.dataset.codexFilter === 'class') codexClassFilter = filter.value;
        else if (filter.dataset.codexFilter === 'rarity') codexRarityFilter = filter.value;
        else if (filter.dataset.codexFilter === 'type') codexTypeFilter = filter.value;
        else if (filter.dataset.codexFilter === 'ownership') codexOwnershipFilter = filter.value;
        else if (filter.dataset.codexFilter === 'advancement') codexAdvancementFilter = filter.value;
        else if (filter.dataset.codexFilter === 'sort') codexSort = filter.value;
        codexPage = 1;
        selectedCodexId = '';
        commitViewSettings();
        render();
    });

    root.addEventListener('keydown', (event) => {
        const bulkSelection = event.target.closest?.('[data-action="toggle-inventory-selection"]');
        if (!bulkSelection || ![' ', 'Enter'].includes(event.key)) return;
        event.preventDefault();
        bulkSelection.click();
    });

    root.addEventListener('click', async (event) => {
        const bulkSelection = event.target.closest('[data-action="toggle-inventory-selection"]');
        if (bulkSelection) {
            const bulkId = bulkSelection.dataset.id;
            if (selectedInventoryIds.has(bulkId)) selectedInventoryIds.delete(bulkId);
            else selectedInventoryIds.add(bulkId);
            renderInventoryPreservingScroll();
            return;
        }
        const target = event.target.closest('button');
        if (!target || target.disabled) return;
        if (modal.classList.contains('hidden')) modalReturnFocus = target;
        if (resolving) return;
        if (target.dataset.peakView) {
            if (save.activeRun) {
                setNotice(['victory', 'defeat'].includes(save.activeRun.phase) ? '请先返回远征地图完成结算。' : '请先结束或退出当前战斗。', 'error');
                view = 'battle';
                render();
                return;
            }
            view = target.dataset.peakView;
            setNotice('');
            if (view === 'tutorial') {
                const viewed = markPeakTutorialViewed(save, selectedTutorialId);
                if (viewed.ok) { save = viewed.state; commit(); }
            }
            render();
            if (view === 'attendance' || view === 'vip' || view === 'missions' || view === 'trial') void refreshTrustedTime();
            return;
        }
        const { action, id } = target.dataset;
        if (action === 'dismiss-mobile-onboarding') {
            mobileOnboardingDismissed = true;
            render();
        }
        else if (action === 'mobile-onboarding') {
            if (target.dataset.targetAction === 'open-create-character') {
                pendingCharacterClass = 'sword';
                openCreateCharacterModal();
            } else if (target.dataset.targetView) {
                view = target.dataset.targetView;
                setNotice('');
                render();
            }
        }
        else if (action === 'open-roster') {
            if (save.activeRun) { setNotice('请先结束或退出当前战斗。', 'error'); return; }
            view = 'roster'; setNotice(''); render();
        }
        else if (action === 'open-create-character') { pendingCharacterClass = 'sword'; openCreateCharacterModal(); }
        else if (action === 'set-create-class') {
            const name = modal.querySelector('#peak-character-name-input')?.value || '';
            pendingCharacterClass = id;
            openCreateCharacterModal(name);
        }
        else if (action === 'confirm-create-character') {
            const result = createPeakCharacter(save, pendingCharacterClass, modal.querySelector('#peak-character-name-input')?.value || '');
            save = result.state;
            if (!result.ok) { setNotice(result.reason, 'error'); return; }
            commit(); closeModal(); view = 'town'; setNotice(`${result.character.name}已创建。`, 'success'); render();
        }
        else if (action === 'enter-character') {
            if (save.characters[id]?.needsNaming) { openRenameCharacterModal(id); return; }
            const result = selectPeakCharacter(save, id);
            save = result.state;
            if (!result.ok) { setNotice(result.reason, 'error'); return; }
            selectedEquipmentId = ''; commit(); view = save.activeRun ? 'battle' : 'town'; setNotice(''); render();
        }
        else if (action === 'open-rename-character') openRenameCharacterModal(id);
        else if (action === 'confirm-rename-character') {
            const result = renamePeakCharacter(save, id, modal.querySelector('#peak-character-name-input')?.value || '');
            save = result.state;
            if (!result.ok) { setNotice(result.reason, 'error'); return; }
            commit(); closeModal(); setNotice(`角色已命名为${result.character.name}。`, 'success'); render();
        }
        else if (action === 'open-delete-character') openDeleteCharacterModal(id);
        else if (action === 'confirm-delete-character') {
            const result = deletePeakCharacter(save, id);
            save = result.state;
            closeModal();
            if (!result.ok) setNotice(result.reason, 'error'); else { commit(); setNotice(`${result.character.name}已移入回收站。`, 'success'); }
            render();
        }
        else if (action === 'restore-character') {
            const result = restorePeakCharacter(save, id);
            save = result.state;
            if (!result.ok) setNotice(result.reason, 'error'); else { commit(); setNotice(`${result.character.name}已恢复。`, 'success'); }
            render();
        }
        else if (action === 'open-advancement') openAdvancementModal(id);
        else if (action === 'preview-advancement') openAdvancementConfirmModal(id, target.dataset.path);
        else if (action === 'start-advancement-trial') startAdvancementTrial(id, target.dataset.path);
        else if (action === 'select-dungeon') { save.progress.selectedDungeon = id; commit(); render(); }
        else if (action === 'switch-deck-preset') {
            const result = switchPeakDeckPreset(save, save.activeCharacterId, id);
            save = result.state;
            if (!result.ok) setNotice(result.reason, 'error');
            else {
                commit();
                const check = validatePeakDeck(result.preset.cards, save.activeClass, activeCollection(), activeCharacter().advancement);
                setNotice(check.valid ? `已切换至「${result.preset.name}」。` : `已切换至「${result.preset.name}」，${check.errors[0]}`, check.valid ? 'success' : 'error');
            }
            if (view === 'deck') renderDeckPreservingScroll(); else render();
        }
        else if (action === 'open-rename-deck-preset') openRenameDeckPresetModal();
        else if (action === 'confirm-rename-deck-preset') {
            const result = renamePeakDeckPreset(save, save.activeCharacterId, id, modal.querySelector('#peak-deck-preset-name-input')?.value || '');
            save = result.state;
            if (!result.ok) { setNotice(result.reason, 'error'); return; }
            commit(); closeModal(); setNotice(`卡组方案已命名为「${result.preset.name}」。`, 'success'); render();
        }
        else if (action === 'open-copy-deck-preset') openCopyDeckPresetModal(id);
        else if (action === 'confirm-copy-deck-preset') {
            const result = copyPeakDeckPreset(save, save.activeCharacterId, id);
            save = result.state;
            if (!result.ok) { setNotice(result.reason, 'error'); return; }
            commit(); closeModal(); setNotice(`已用「${result.sourcePreset.name}」覆盖「${result.targetPreset.name}」。`, 'success'); renderDeckPreservingScroll();
        }
        else if (action === 'start-battle') startBattle();
        else if (action === 'start-peak-trial') void runStartPeakTrial();
        else if (action === 'begin-trial-floor') runBeginPeakTrialFloor();
        else if (action === 'choose-trial-boon') {
            const result = choosePeakTrialBoon(save, id);
            save = result.state;
            if (!result.ok) setNotice(result.reason, 'error');
            else { commit(); setNotice(`已选择「${result.boon.name}」。`, 'success'); }
            render();
        }
        else if (action === 'select-blessing-tree') { selectedBlessingTree = id; setNotice(''); render(); }
        else if (action === 'select-mission-group') { selectedMissionGroup = id; setNotice(''); render(); }
        else if (action === 'select-tutorial') {
            selectedTutorialId = id;
            const viewed = markPeakTutorialViewed(save, id);
            if (viewed.ok) { save = viewed.state; commit(); }
            else setNotice(viewed.reason, 'error');
            render();
        }
        else if (action === 'open-attribute-compendium') openAttributeCompendiumModal();
        else if (action === 'learn-blessing') {
            const result = learnPeakBlessing(save, save.activeCharacterId, id);
            save = result.state;
            if (result.ok) { commit(); setNotice(`${result.node.name} 已提升至 ${result.rank}/${result.node.maxRank} 级。`, 'success'); }
            else setNotice(result.reason, 'error');
            render();
        }
        else if (action === 'open-blessing-reset') openBlessingResetModal();
        else if (action === 'confirm-reset-blessings') {
            const result = resetPeakBlessings(save, save.activeCharacterId);
            save = result.state;
            closeModal();
            if (result.ok) { commit(); setNotice(`已返还 ${result.resetPoints} 点祝福点和 ${result.refund.toLocaleString('zh-CN')} 金币。`, 'success'); }
            else setNotice(result.reason, 'error');
            render();
        }
        else if (action === 'set-codex-page') { codexPage = Number(target.dataset.page) || 1; selectedCodexId = ''; render(); }
        else if (action === 'set-deck-page') { deckPage = Number(target.dataset.page) || 1; render(); }
        else if (action === 'select-codex') { selectedCodexId = id; renderCodexPreservingScroll(); }
        else if (action === 'upgrade-card') {
            const result = upgradePeakCard(save, id);
            save = result.state;
            if (result.ok) { commit(); setNotice(`${result.card.name} 已升级至 Lv.${result.cost.toLevel}。`, 'success'); }
            else setNotice(result.reason, 'error');
            renderCodexPreservingScroll();
        }
        else if (action === 'convert-card-shards') {
            const result = convertPeakDuplicateCards(save, id, PEAK_DUPLICATE_TO_SHARD_RATE);
            save = result.state;
            if (result.ok) {
                commit();
                const shardLabel = result.shardClassId ? `${PEAK_CHARACTERS[result.shardClassId].name}碎片` : '通用碎片';
                setNotice(`已将${result.copiesUsed}张「${result.card.name}」兑换为${result.shardCount}枚${PEAK_CARD_RARITIES[result.rarity].name}${shardLabel}。`, 'success');
            } else setNotice(result.reason, 'error');
            renderCodexPreservingScroll();
        }
        else if (action === 'convert-class-shards') {
            const card = PEAK_CARD_BY_ID[id];
            const result = convertPeakClassShardsToUniversal(save, card?.classId, card?.rarity, PEAK_CLASS_SHARD_EXCHANGE_RATE);
            save = result.state;
            if (result.ok) {
                commit();
                setNotice(`已将${result.classShardsUsed}枚${PEAK_CHARACTERS[result.classId].name}碎片兑换为${result.universalShards}枚${PEAK_CARD_RARITIES[result.rarity].name}通用碎片。`, 'success');
            } else setNotice(result.reason, 'error');
            renderCodexPreservingScroll();
        }
        else if (action === 'add-deck-card') { activeDeck().cards.push(id); commit(); renderDeckPreservingScroll(); }
        else if (action === 'remove-deck-card') { const index = activeDeck().cards.lastIndexOf(id); if (index >= 0) activeDeck().cards.splice(index, 1); commit(); renderDeckPreservingScroll(); }
        else if (action === 'buy-pack') {
            const result = purchasePeakPack(save, id);
            if (!result.ok) { save = result.state; setNotice(result.reason, 'error'); render(); }
            else { save = result.state; commit(); render(); openPackModal(result); }
        }
        else if (action === 'buy-pack-voucher') {
            const result = purchasePeakPackWithVouchers(save, id);
            if (!result.ok) { save = result.state; setNotice(result.reason, 'error'); render(); }
            else {
                try { commitAccountState(result.state); render(); openPackModal(result); }
                catch (error) { setNotice(error?.message || '存档写入失败，本次购买未生效。', 'error'); render(); }
            }
        }
        else if (action === 'buy-merchant-offer') {
            const result = purchasePeakMerchantOffer(save, id);
            if (!result.ok) { save = result.state; setNotice(result.reason, 'error'); render(); }
            else {
                try {
                    commitAccountState(result.state);
                    setNotice(`${result.offer.name}兑换成功，VIP成长 +${result.vipGrowth}。`, 'success');
                    render();
                    if (result.pack) openPackModal(result);
                } catch (error) {
                    setNotice(error?.message || '存档写入失败，本次兑换未生效。', 'error');
                    render();
                }
            }
        }
        else if (action === 'claim-attendance') await runTrustedClaim('attendance');
        else if (action === 'claim-vip-daily') await runTrustedClaim('vip');
        else if (action === 'claim-mission') {
            if (accountBusy) return;
            accountBusy = true;
            trustedTimeState = 'loading';
            trustedTimeError = '';
            render();
            try {
                trustedNow = await fetchTrustedPeakTime();
                trustedTimeState = 'ready';
                const result = claimPeakMission(save, id, trustedNow);
                if (!result.ok) { save = result.state; setNotice(result.reason, 'error'); }
                else { commitAccountState(result.state); setNotice(`任务完成，获得 ${rewardText(result.reward)}。`, 'success'); }
            } catch (error) {
                trustedNow = 0;
                trustedTimeState = 'error';
                trustedTimeError = error?.message || '可信时间服务暂不可用';
                setNotice(`${trustedTimeError}，领取未生效。`, 'error');
            } finally {
                accountBusy = false;
                render();
            }
        }
        else if (action === 'select-equipment') {
            const resetFilters = target.dataset.resetInventoryFilters;
            if (resetFilters) {
                inventorySlotFilter = 'all';
                inventoryRarityFilter = 'all';
                inventoryStatusFilter = 'all';
                commitViewSettings();
            }
            selectedEquipmentId = id;
            if (resetFilters) render(); else renderInventoryPreservingScroll();
        }
        else if (action === 'select-visible-inventory') {
            const character = activeCharacter();
            const visible = character.inventory.filter((item) => {
                const equipped = character.equipped[item.slot] === item.id;
                return (inventorySlotFilter === 'all' || item.slot === inventorySlotFilter)
                    && (inventoryRarityFilter === 'all' || item.rarity === inventoryRarityFilter)
                    && (inventoryStatFilter === 'all' || Object.prototype.hasOwnProperty.call(item.stats || {}, inventoryStatFilter))
                    && (inventoryStatusFilter === 'all'
                        || (inventoryStatusFilter === 'equipped' && equipped)
                        || (inventoryStatusFilter === 'unequipped' && !equipped)
                        || (inventoryStatusFilter === 'locked' && item.locked)
                        || (inventoryStatusFilter === 'available' && !item.locked && !equipped));
            });
            visible.forEach((item) => selectedInventoryIds.add(item.id));
            renderInventoryPreservingScroll();
        }
        else if (action === 'clear-inventory-selection') {
            selectedInventoryIds.clear();
            renderInventoryPreservingScroll();
        }
        else if (action === 'bulk-lock-inventory') {
            const locked = target.dataset.locked === 'true';
            const character = activeCharacter();
            let changed = 0;
            [...selectedInventoryIds].forEach((itemId) => {
                const item = character.inventory.find((entry) => entry.id === itemId);
                if (!item || Boolean(item.locked) === locked) return;
                const result = togglePeakItemLock(save, save.activeCharacterId, itemId);
                if (result.ok) { save = result.state; changed += 1; }
            });
            if (changed) commit();
            setNotice(`${locked ? '已锁定' : '已解锁'} ${changed} 件装备。`, 'success');
            renderInventoryPreservingScroll();
        }
        else if (action === 'bulk-sell-inventory') openBulkSellModal();
        else if (action === 'confirm-bulk-sell') {
            const character = activeCharacter();
            const sellableIds = character.inventory.filter((item) => selectedInventoryIds.has(item.id) && !item.locked && character.equipped[item.slot] !== item.id).map((item) => item.id);
            let totalGold = 0;
            let sold = 0;
            sellableIds.forEach((itemId) => {
                const result = sellPeakItem(save, save.activeCharacterId, itemId);
                if (result.ok) { save = result.state; totalGold += result.gold; sold += 1; }
            });
            selectedInventoryIds.clear();
            selectedEquipmentId = '';
            closeModal();
            if (sold) { commit(); setNotice(`已出售 ${sold} 件装备，获得 ${totalGold.toLocaleString('zh-CN')} 金币。`, 'success'); }
            renderInventoryPreservingScroll();
        }
        else if (action === 'equip-item') {
            const result = equipPeakItem(save, save.activeCharacterId, id);
            save = result.state;
            if (!result.ok) setNotice(result.reason, 'error'); else { commit(); setNotice('装备已穿戴。', 'success'); }
            renderInventoryPreservingScroll();
        }
        else if (action === 'unequip-item') {
            const result = unequipPeakItem(save, save.activeCharacterId, target.dataset.slot);
            save = result.state; if (result.ok) commit(); else setNotice(result.reason, 'error'); renderInventoryPreservingScroll();
        }
        else if (action === 'lock-item') {
            const result = togglePeakItemLock(save, save.activeCharacterId, id);
            save = result.state; if (result.ok) commit(); else setNotice(result.reason, 'error'); renderInventoryPreservingScroll();
        }
        else if (action === 'sell-item') {
            const item = activeCharacter().inventory.find((entry) => entry.id === id);
            if (item && equipmentIconRarities.indexOf(item.rarity) >= equipmentIconRarities.indexOf('legendary')) {
                openSingleSellModal(id);
                return;
            }
            const result = sellPeakItem(save, save.activeCharacterId, id);
            save = result.state;
            if (result.ok) { selectedEquipmentId = ''; commit(); setNotice(`装备已出售，获得 ${result.gold} 金币。`, 'success'); } else setNotice(result.reason, 'error');
            renderInventoryPreservingScroll();
        }
        else if (action === 'confirm-sell-item') {
            const result = sellPeakItem(save, save.activeCharacterId, id);
            save = result.state;
            closeModal();
            if (result.ok) { selectedEquipmentId = ''; commit(); setNotice(`装备已出售，获得 ${result.gold} 金币。`, 'success'); } else setNotice(result.reason, 'error');
            renderInventoryPreservingScroll();
        }
        else if (action === 'inspect-battle-card') openBattleCard(target.dataset.zone, Number(target.dataset.index));
        else if (action === 'select-tactical-declaration') {
            const result = selectPeakTacticalDeclaration(save.activeRun, id);
            save.activeRun = result.state;
            if (result.ok) {
                commit();
                const declaration = PEAK_TACTICAL_DECLARATIONS.find((entry) => entry.id === id);
                setNotice(declaration ? `宣言「${declaration.name}」已生效：${declaration.description}` : '战术宣言已生效。', 'success');
            }
            else setNotice(result.reason, 'error');
            render();
        }
        else if (action === 'quick-queue-card') {
            const result = queuePeakCard(save.activeRun, Number(target.dataset.index));
            if (result.ok) { save.activeRun = result.state; selectedCard = null; commitSoon(); renderBattlePreservingScroll(); }
            else setNotice(result.reason, 'error');
        }
        else if (action === 'quick-withdraw-card') {
            const result = unqueuePeakCard(save.activeRun, Number(target.dataset.index));
            if (result.ok) { save.activeRun = result.state; selectedCard = null; commitSoon(); renderBattlePreservingScroll(); }
            else setNotice(result.reason, 'error');
        }
        else if (action === 'clear-queue') {
            let nextState = save.activeRun;
            let cleared = 0;
            for (let index = nextState.queue.length - 1; index >= 0; index -= 1) {
                const result = unqueuePeakCard(nextState, index);
                if (!result.ok) break;
                nextState = result.state;
                cleared += 1;
            }
            if (cleared) {
                save.activeRun = nextState;
                selectedCard = null;
                commitSoon();
                setNotice(`已撤回 ${cleared} 张卡牌。`, 'success');
                renderBattlePreservingScroll();
            }
        }
        else if (action === 'close-battle-card') closeBattleCardPopover();
        else if (action === 'close-modal') closeModal();
        else if (action === 'toggle-hand-discard') {
            const uid = target.dataset.uid;
            if (selectedDiscardUids.has(uid)) selectedDiscardUids.delete(uid); else selectedDiscardUids.add(uid);
            openHandDiscardModal();
        }
        else if (action === 'confirm-hand-discard') {
            const result = discardPeakHandCards(save.activeRun, [...selectedDiscardUids]);
            if (!result.ok) { setNotice(result.reason, 'error'); return; }
            save.activeRun = result.state;
            commit();
            closeModal({ force: true });
            const resolution = resolvePeakRound(save.activeRun);
            if (resolution.ok) playResolution(resolution); else setNotice(resolution.reason, 'error');
        }
        else if (action === 'play-selected-card' && selectedCard) {
            const result = queuePeakCard(save.activeRun, selectedCard.index);
            if (result.ok) { save.activeRun = result.state; selectedCard = null; commitSoon(); renderBattlePreservingScroll(); }
            else setNotice(result.reason, 'error');
        } else if (action === 'withdraw-selected-card' && selectedCard) {
            const result = unqueuePeakCard(save.activeRun, selectedCard.index);
            if (result.ok) { save.activeRun = result.state; selectedCard = null; commitSoon(); renderBattlePreservingScroll(); }
        } else if (action === 'resolve-round') {
            const result = resolvePeakRound(save.activeRun);
            if (result.ok) playResolution(result);
            else if (result.requiresDiscard) openHandDiscardModal();
            else setNotice(result.reason, 'error');
        } else if (action === 'abandon-battle') {
            openAbandonModal();
        } else if (action === 'open-battle-log') {
            openBattleLog();
        } else if (action === 'toggle-peak-sound') {
            save.settings.sound = !save.settings.sound;
            commit();
            render();
        } else if (action === 'toggle-reduced-motion') {
            save.settings.reducedMotion = !save.settings.reducedMotion;
            commit();
            render();
        } else if (action === 'set-resolution-speed') {
            save.settings.resolutionSpeed = Math.max(1, Math.min(3, Number(target.dataset.speed) || 1));
            commit();
            render();
        } else if (action === 'confirm-abandon') {
            closeModal();
            const abandoned = abandonPeakBattle(save.activeRun);
            if (abandoned?.peakTrial) {
                const result = failPeakTrialFloor(save, abandoned);
                save = result.state;
                if (result.ok) commit();
                view = 'trial';
            } else {
                save.activeRun = null; commit(); view = 'map';
            }
            render();
        } else if (action === 'finish-battle') void finishBattle();
        else if (action === 'reward-to-equipment') { closeModal(); view = 'character'; render(); }
        else if (action === 'reward-to-blessing') { closeModal(); view = 'blessing'; render(); }
        else if (action === 'reward-to-deck') { closeModal(); view = 'deck'; render(); }
    });

    root.addEventListener('dblclick', (event) => {
        const target = event.target.closest('.peak-card-button[data-action="inspect-battle-card"][data-zone="hand"]');
        if (!target || resolving || !save.activeRun) return;
        const result = queuePeakCard(save.activeRun, Number(target.dataset.index));
        if (!result.ok) {
            setNotice(result.reason, 'error');
            return;
        }
        save.activeRun = result.state;
        selectedCard = null;
        commitSoon();
        renderBattlePreservingScroll();
    });

    const isPeakTypingTarget = (target) => Boolean(target?.closest?.('input, textarea, select, [contenteditable="true"]'));
    window.addEventListener('keydown', (event) => {
        if (!saveOwner.owned || storageIssue) return;
        if (document.getElementById('main-page')?.dataset.activeSection !== 'peak-duel' || event.isComposing) return;
        if (!modal.classList.contains('hidden')) {
            if (event.key === 'Escape' && !modal.querySelector('.peak-hand-discard-modal')) {
                event.preventDefault();
                closeModal();
            }
            return;
        }
        if (isPeakTypingTarget(event.target)) return;
        if (view === 'town' && /^[1-8]$/.test(event.key)) {
            const command = [...content.querySelectorAll('.peak-town-command-bar kbd')].find((kbd) => kbd.textContent.trim() === event.key)?.closest('button');
            if (command) {
                event.preventDefault();
                command.click();
            }
            return;
        }
        if (view !== 'battle' || !save.activeRun || resolving || save.activeRun.phase !== 'playerPlanning') return;
        if (/^[1-9]$/.test(event.key) && !event.repeat) {
            const index = Number(event.key) - 1;
            const quickButton = content.querySelector(`.peak-hand [data-action="quick-queue-card"][data-index="${index}"]`);
            if (quickButton && !quickButton.disabled) {
                event.preventDefault();
                quickButton.click();
            }
            return;
        }
        if (event.key === 'Backspace' && save.activeRun.queue.length) {
            event.preventDefault();
            content.querySelector('[data-action="clear-queue"]')?.click();
            return;
        }
        if ((event.key === ' ' || event.key === 'Enter') && !event.repeat && !event.target.closest?.('button, [role="button"]')) {
            const endTurn = content.querySelector('[data-action="resolve-round"]');
            if (endTurn && !endTurn.disabled) {
                event.preventDefault();
                endTurn.click();
            }
        }
    });

    modal.addEventListener('click', (event) => {
        if (event.target !== modal || modal.querySelector('.peak-hand-discard-modal')) return;
        closeModal();
    });

    const enterProtectedSession = async () => {
        const wasOwned = saveOwner.owned;
        if (!await saveOwner.acquire()) { render(); return; }
        if (!wasOwned) {
            persistence.discard();
            save = getPeakSave();
            storageIssue = getPeakSaveIssue(save);
            ({ classFilter: codexClassFilter, rarityFilter: codexRarityFilter, typeFilter: codexTypeFilter, ownershipFilter: codexOwnershipFilter, advancementFilter: codexAdvancementFilter, sort: codexSort } = save.settings.codex);
            ({ rarityFilter: deckRarityFilter, typeFilter: deckTypeFilter, sort: deckSort } = save.settings.deck);
            ({ slotFilter: inventorySlotFilter, rarityFilter: inventoryRarityFilter, statusFilter: inventoryStatusFilter, statFilter: inventoryStatFilter } = save.settings.inventory);
            view = activeCharacter() && !activeCharacter().needsNaming ? (save.activeRun ? 'battle' : 'town') : 'roster';
        }
        if (resumed && !storageIssue) {
            syncStamina();
            if (!timer) timer = window.setInterval(syncStamina, 1000);
        }
        render();
        if (!storageIssue) void refreshTrustedTime();
    };
    const resume = () => {
        resumed = true;
        if (!saveOwner.owned) { void enterProtectedSession(); return; }
        syncStamina();
        if (!timer) timer = window.setInterval(syncStamina, 1000);
        render();
    };
    const pause = () => {
        resumed = false;
        if (timer) window.clearInterval(timer);
        timer = 0;
        setNotice('');
        persistence.flush();
    };
    window.addEventListener('pagehide', () => {
        if (saveOwner.owned && !storageIssue) persistence.flush();
        saveOwner.release();
    });
    window.addEventListener('pageshow', (event) => { if (event.persisted) window.location.reload(); });
    window.addEventListener('storage', (event) => {
        if (event.key !== PEAK_STORAGE_KEY && event.key !== null) return;
        if (!saveOwner.owned) return;
        storageIssue = Object.assign(new Error('存档已被其他页面更新，请重新读取已保存进度后继续'), { code: 'PEAK_SAVE_CONFLICT' });
        persistence.discard();
        render();
    });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && saveOwner.owned && !storageIssue) persistence.flush();
    });
    render();
    return { render, resume, pause };
};
