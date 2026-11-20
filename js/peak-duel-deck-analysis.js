import { PEAK_CARD_BY_ID, PEAK_CARD_CATEGORIES, PEAK_STATUS_EFFECTS, getPeakCardCost } from './peak-duel-data.js';

const resultState = (card) => card.attackState?.to
    || card.effects?.reduce((state, effect) => effect.type === 'setState' ? effect.value : state, '')
    || '';

const acceptedStates = (card) => card.category === 'attack'
    ? card.attackState?.from || ['standing']
    : card.requiresTargetState || [];

const hasEffect = (card, types) => card.effects?.some((effect) => types.has(effect.type));

const advancementAvailable = (card, advancement) => !card.requiredAdvancement
    || (advancement?.pathId === card.requiredAdvancement.pathId
        && Number(advancement?.tier) >= Number(card.requiredAdvancement.minTier || 1));

const warning = (code, label, detail, severity = 'warning') => ({ code, label, detail, severity });

export const analyzePeakDeck = (cardIds, classId = '', advancement = null, collection = {}) => {
    const cards = (cardIds || []).map((id) => PEAK_CARD_BY_ID[id]).filter(Boolean);
    const categoryCounts = Object.fromEntries(Object.keys(PEAK_CARD_CATEGORIES).map((category) => [category, 0]));
    const costCurve = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, '5+': 0 };
    const statusSources = {};
    const drawTypes = new Set(['draw', 'drawCategory', 'borrowDraw', 'advanceConsume', 'nextTurnDraw']);
    const searchTypes = new Set(['drawCategory']);
    const mpRecoveryTypes = new Set(['restoreMp', 'soloQueueRecovery', 'shieldToMp']);

    let openerCount = 0;
    let launcherCount = 0;
    let airborneFollowCount = 0;
    let finisherCount = 0;
    let drawCount = 0;
    let searchCount = 0;
    let mpRecoveryCount = 0;
    let advancementMismatchCount = 0;

    cards.forEach((card) => {
        categoryCounts[card.category] = (categoryCounts[card.category] || 0) + 1;
        const cost = getPeakCardCost(card, collection[card.id]?.level);
        const costBucket = cost >= 5 ? '5+' : String(cost);
        costCurve[costBucket] += 1;
        const states = acceptedStates(card);
        const nextState = resultState(card);
        const dealsDamage = hasEffect(card, new Set(['damage']));
        if (dealsDamage && (states.includes('standing') || (!states.length && card.category === 'skill'))) openerCount += 1;
        if (nextState === 'launched' && (states.includes('standing') || !states.length)) launcherCount += 1;
        if (nextState === 'airborne' && states.includes('launched')) airborneFollowCount += 1;
        if (nextState === 'knockedDown' || nextState === 'stunned' || card.attackStyle === 'finisher') finisherCount += 1;
        if (hasEffect(card, drawTypes)) drawCount += 1;
        if (hasEffect(card, searchTypes)) searchCount += 1;
        if (hasEffect(card, mpRecoveryTypes) || card.queueMechanic?.reward?.type === 'restoreMp') mpRecoveryCount += 1;
        if (!advancementAvailable(card, advancement)) advancementMismatchCount += 1;
        card.effects?.forEach((effect) => {
            if (effect.type !== 'status' || !PEAK_STATUS_EFFECTS[effect.status]?.harmful) return;
            statusSources[effect.status] = (statusSources[effect.status] || 0) + 1;
        });
    });

    const size = cards.length;
    const totalCost = cards.reduce((total, card) => total + getPeakCardCost(card, collection[card.id]?.level), 0);
    const averageCost = size ? totalCost / size : 0;
    const defenseCount = categoryCounts.defense || 0;
    const warnings = [];
    if (size >= 15 && openerCount === 0) warnings.push(warning('NO_STANDING_OPENER', '缺少起手牌', '没有能稳定攻击站立目标的伤害牌。', 'danger'));
    if (airborneFollowCount > 0 && launcherCount === 0) warnings.push(warning('NO_LAUNCH_SOURCE', '浮空链缺少击飞来源', '牌组有击飞追击牌，但没有可靠的站立→击飞来源。', 'danger'));
    if (airborneFollowCount > 0 && finisherCount === 0) warnings.push(warning('NO_AIRBORNE_FINISHER', '连段缺少终结', '牌组能构建浮空状态，但没有明确的击倒或眩晕终结牌。'));
    if (size >= 15 && averageCost >= 3.5 && mpRecoveryCount === 0) warnings.push(warning('HIGH_MP_WITHOUT_RECOVERY', 'MP曲线偏重', '平均消耗较高且没有回能手段，长回合容易断档。'));
    if (size >= 15 && defenseCount < Math.max(2, Math.ceil(size * .15))) warnings.push(warning('LOW_DEFENSE', '防守牌偏少', `当前仅${defenseCount}张防守牌，连续遭遇时容错较低。`));
    if (advancementMismatchCount > 0) warnings.push(warning('ADVANCEMENT_MISMATCH', '存在转职不匹配卡', `${advancementMismatchCount}张卡不符合当前转职路线，无法正常构筑。`, 'danger'));

    return {
        classId,
        size,
        averageCost,
        costCurve,
        categoryCounts,
        openerCount,
        launcherCount,
        airborneFollowCount,
        finisherCount,
        defenseCount,
        drawCount,
        searchCount,
        mpRecoveryCount,
        statusSources,
        advancementMismatchCount,
        warnings,
    };
};
