import { getPeakCardCost } from './peak-duel-data.js';

const RARITY_ORDER = Object.freeze({ common: 0, excellent: 1, rare: 2, scarce: 3, legendary: 4, epic: 5, mythic: 6 });

export const PEAK_CARD_PAGE_SIZE = 48;

export const normalizePeakCardSearch = (value) => String(value || '')
    .trim()
    .toLocaleLowerCase('zh-CN');

const cardSearchText = (card) => normalizePeakCardSearch([
    card.id,
    card.name,
    card.summary,
    card.category,
    card.classId,
    card.attackStyle,
    ...(card.tags || []),
    ...(card.attackState?.from || []),
    card.attackState?.to,
    ...(card.requiresTargetState || []),
    ...(card.effects || []).flatMap((effect) => [
        effect.type,
        effect.status,
        effect.element,
        effect.damageType,
        effect.stat,
    ]),
].filter(Boolean).join(' '));

const advancementAvailable = (card, advancement) => !card.requiredAdvancement
    || (advancement?.pathId === card.requiredAdvancement.pathId
        && Number(advancement?.tier) >= Number(card.requiredAdvancement.minTier || 1));

const compareName = (left, right) => String(left.name || '').localeCompare(String(right.name || ''), 'zh-CN');

const cardSorter = (sort, collection) => (left, right) => {
    const costDifference = getPeakCardCost(left, collection[left.id]?.level) - getPeakCardCost(right, collection[right.id]?.level);
    if (sort === 'cost-asc') return costDifference || compareName(left, right);
    if (sort === 'cost-desc') return -costDifference || compareName(left, right);
    if (sort === 'name') return compareName(left, right);
    if (sort === 'level') return (collection[right.id]?.level || 1) - (collection[left.id]?.level || 1)
        || compareName(left, right);
    if (sort === 'copies') return (collection[right.id]?.copies || 0) - (collection[left.id]?.copies || 0)
        || compareName(left, right);
    return (RARITY_ORDER[right.rarity] ?? -1) - (RARITY_ORDER[left.rarity] ?? -1)
        || costDifference
        || compareName(left, right);
};

export const queryPeakCards = (cards, filters = {}, context = {}) => {
    const collection = context.collection || {};
    const upgradeableIds = context.upgradeableIds instanceof Set ? context.upgradeableIds : new Set();
    const tokens = normalizePeakCardSearch(filters.query).split(/\s+/).filter(Boolean);
    return cards.filter((card) => {
        const entry = collection[card.id];
        const routeAvailable = advancementAvailable(card, context.advancement);
        if (filters.classId && filters.classId !== 'all') {
            if (filters.classId === 'shared' ? card.classId !== 'all' : card.classId !== filters.classId) return false;
        }
        if (filters.rarity && filters.rarity !== 'all' && card.rarity !== filters.rarity) return false;
        if (filters.category && filters.category !== 'all' && card.category !== filters.category) return false;
        if (filters.ownership === 'owned' && !entry?.unlocked) return false;
        if (filters.ownership === 'unowned' && entry?.unlocked) return false;
        if (filters.ownership === 'upgradeable' && !upgradeableIds.has(card.id)) return false;
        if (filters.advancement === 'available' && !routeAvailable) return false;
        if (filters.advancement === 'locked' && routeAvailable) return false;
        if (tokens.length && !tokens.every((token) => cardSearchText(card).includes(token))) return false;
        return true;
    }).sort(cardSorter(filters.sort || 'rarity', collection));
};

export const paginatePeakCards = (cards, requestedPage = 1, requestedPageSize = PEAK_CARD_PAGE_SIZE) => {
    const pageSize = Math.max(1, Math.floor(Number(requestedPageSize) || PEAK_CARD_PAGE_SIZE));
    const pages = Math.max(1, Math.ceil(cards.length / pageSize));
    const page = Math.max(1, Math.min(pages, Math.floor(Number(requestedPage) || 1)));
    const start = (page - 1) * pageSize;
    return { page, pages, pageSize, total: cards.length, items: cards.slice(start, start + pageSize) };
};
