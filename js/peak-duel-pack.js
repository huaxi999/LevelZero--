export const PEAK_PACK_SIZE = 5;

export const PEAK_PACK_RARITY_ORDER = Object.freeze([
    'common',
    'excellent',
    'rare',
    'scarce',
    'legendary',
    'epic',
    'mythic',
]);

const rarityIndex = (rarity) => PEAK_PACK_RARITY_ORDER.indexOf(rarity);
const positiveRateEntries = (rates = {}) => Object.entries(rates)
    .filter(([rarity, rate]) => rarityIndex(rarity) >= 0 && Number(rate) > 0);

const normalizeRates = (entries) => {
    const total = entries.reduce((sum, [, rate]) => sum + Number(rate), 0);
    if (!total) return {};
    return Object.fromEntries(entries.map(([rarity, rate]) => [rarity, Number(rate) / total]));
};

export const isPeakPackEpicEligible = (pack) => Number(pack?.rates?.epic) > 0;

export const getPeakPackLastSlotRates = (pack) => {
    const entries = positiveRateEntries(pack?.rates);
    const guaranteeRank = rarityIndex(pack?.guaranteeRarity);
    const eligible = guaranteeRank >= 0
        ? entries.filter(([rarity]) => rarityIndex(rarity) >= guaranteeRank)
        : entries;
    return normalizeRates(eligible.length ? eligible : entries);
};

const chanceAtLeast = (rates, minimumRarity) => {
    const minimumRank = rarityIndex(minimumRarity);
    if (minimumRank < 0) return 0;
    return Object.entries(rates).reduce((sum, [rarity, rate]) => (
        rarityIndex(rarity) >= minimumRank ? sum + Number(rate) : sum
    ), 0);
};

export const getPeakPackAtLeastChance = (pack, minimumRarity) => {
    const baseRates = normalizeRates(positiveRateEntries(pack?.rates));
    const lastSlotRates = getPeakPackLastSlotRates(pack);
    const baseChance = chanceAtLeast(baseRates, minimumRarity);
    const lastSlotChance = chanceAtLeast(lastSlotRates, minimumRarity);
    const missChance = ((1 - baseChance) ** (PEAK_PACK_SIZE - 1)) * (1 - lastSlotChance);
    return Math.max(0, Math.min(100, (1 - missChance) * 100));
};

export const getPeakPackProbabilitySummary = (pack) => Object.fromEntries(
    ['rare', 'scarce', 'legendary', 'epic'].map((rarity) => [
        rarity,
        getPeakPackAtLeastChance(pack, rarity),
    ]),
);
