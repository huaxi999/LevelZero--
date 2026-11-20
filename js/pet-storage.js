import {
    PET_ACHIEVEMENTS,
    PET_AILMENTS,
    PET_COMPETITIONS,
    PET_COMPETITION_DIVISIONS,
    PET_COMPETITION_STRATEGIES,
    PET_DAILY_TASKS,
    PET_COLLECTIONS,
    PET_EXPLORATIONS,
    PET_GROWTH_STAGES,
    PET_ITEMS_BY_ID,
    PET_JOBS,
    PET_JOB_DURATIONS,
    PET_PLAYGROUND_GAMES,
    PET_OPPONENT_NAMES,
    PET_SPECIES,
    PET_SPECIES_BY_ID,
    PET_STORY_EVENTS,
    PET_TRAINING,
    PET_WEEKLY_TASKS,
} from './pet-data.js';

export const PET_STORAGE_KEY = 'rosang.pet.v1';
export const PET_SAVE_VERSION = 3;

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const MAX_OFFLINE_MS = DAY;
const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('rosang.pet') : null;

const NEED_RATES = { satiety: 1.8, cleanliness: 1, mood: 0.7, energy: 0.6 };

export const PET_ACTIONS = {
    feed: {
        label: '喂食', message: '好香！肚子暖暖的。', cooldown: 8, needKey: 'satiety', needs: { satiety: 22, mood: 2 }, affection: 2, growth: 3,
        messages: ['好香！肚子暖暖的。', '这一口刚刚好，谢谢你记得。', '吃饱以后，连尾巴都有力气了。'],
        urgentMessages: ['我就知道你听见肚子叫了，救星！', '终于开饭啦，我差点要把空气当点心。'],
        fullMessages: ['其实已经很饱啦……不过这一口是你给的。', '再吃就要圆一圈了，下次晚一点喂我吧。'],
    },
    clean: {
        label: '洗澡', message: '亮晶晶，感觉整个人都精神了。', cooldown: 10, needKey: 'cleanliness', needs: { cleanliness: 28, mood: 3, energy: -2 }, affection: 2, growth: 3,
        messages: ['亮晶晶，感觉整个人都精神了。', '泡泡跑到头顶啦，帮我冲干净。', '现在闻起来一定像刚晒过的云。'],
        urgentMessages: ['洗掉啦洗掉啦，我终于不是灰扑扑的了。', '呼，清爽多了！刚才那身泥可别告诉别人。'],
        fullMessages: ['今天已经很干净了，不过梳一梳也很舒服。', '又洗呀？那我要一个最大最圆的泡泡。'],
    },
    play: {
        label: '玩耍', message: '再来一次！这次我一定接住。', cooldown: 12, needKey: 'mood', needs: { mood: 24, energy: -12, satiety: -4, cleanliness: -4 }, affection: 4, growth: 5,
        messages: ['再来一次！这次我一定接住。', '轮到我追你了，不许偷偷加速！', '刚才那一下算热身，下一回合才是真的。'],
        urgentMessages: ['你真的来陪我玩了！刚才的坏心情全跑掉啦。', '我等这一刻好久了，今天一定要玩个痛快。'],
        fullMessages: ['我现在开心得停不下来，再来一局！', '今天已经很快乐了，但和你玩永远不嫌多。'],
    },
    sleep: {
        label: '休息', message: '我先眯一会儿，你也别太累。', cooldown: 15, needKey: 'energy', needs: { energy: 32, satiety: -5, cleanliness: -2, mood: 3 }, affection: 1, growth: 2,
        messages: ['我先眯一会儿，你也别太累。', '醒来以后记得还在这里哦。', '把今天的开心事放进梦里保存起来。'],
        urgentMessages: ['终于可以躺下啦……晚安，只睡一小会儿。', '电量开始恢复，暂时进入抱枕模式。'],
        fullMessages: ['我还不困，不过陪你安静坐一会儿也好。', '精神还很好呢，要不先去玩点什么？'],
    },
};

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Number(value) || 0));
const copy = (value) => JSON.parse(JSON.stringify(value));
const safeInteger = (value, fallback = 0) => {
    const number = Number(value);
    return Math.max(0, Math.floor(Number.isFinite(number) ? number : fallback));
};
const safeGrowth = (value) => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;
const PROFILE_FIELDS = [
    'id', 'name', 'species', 'stage', 'birthAt', 'lastSimulatedAt', 'needs', 'attributes', 'relationship',
    'equipment', 'habits', 'job', 'jobMastery', 'competition', 'playgroundRecords', 'exploration', 'collection', 'ailment', 'growthMilestones', 'lastActions',
    'lastTraining', 'story', 'lastMessage',
];
const STAGE_INDEX = Object.fromEntries(PET_GROWTH_STAGES.map((stage, index) => [stage.id, index]));
const deterministicUnit = (seed) => {
    let hash = 2166136261;
    String(seed).split('').forEach((character) => { hash = Math.imul(hash ^ character.charCodeAt(0), 16777619); });
    return (hash >>> 0) / 4294967295;
};
const todayKey = (now = Date.now()) => {
    const date = new Date(now);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const weekKey = (now = Date.now()) => {
    const date = new Date(now);
    const day = (date.getDay() + 6) % 7;
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - day);
    return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
};

const freshDaily = (now = Date.now()) => ({
    date: todayKey(now), care: 0, training: 0, playground: 0, jobs: 0, competition: 0, exploration: 0, arcade: 0, claimed: [],
});

const freshWeekly = (now = Date.now()) => ({
    week: weekKey(now), care: 0, training: 0, playground: 0, jobs: 0, competition: 0, exploration: 0, claimed: [],
});

const freshCompetition = (now = Date.now()) => ({
    season: todayKey(now).slice(0, 7),
    entriesDate: todayKey(now),
    entriesLeft: 5,
    rating: 1000,
    trophies: { strength: 0, intelligence: 0, charm: 0 },
    wins: 0,
    losses: 0,
    history: [],
});

const freshPlaygroundRecords = () => Object.fromEntries(PET_PLAYGROUND_GAMES.map((game) => [game.id, { best: 0, plays: 0 }]));
const freshCollection = () => ({ owned: [], routes: {}, recent: [] });

const freshLoginStreak = (now = Date.now()) => ({
    lastVisitDate: todayKey(now), lastRewardDate: todayKey(now), current: 1, best: 1,
});

const freshStory = (now = Date.now()) => ({ nextAt: now + 18 * 60 * 1000, pending: null, history: [] });

const freshPet = (now = Date.now()) => ({
    version: PET_SAVE_VERSION,
    adopted: false,
    id: '',
    name: '',
    species: 'shadow-wolf',
    stage: '等待领养',
    birthAt: 0,
    lastSimulatedAt: now,
    updatedAt: now,
    revision: 0,
    needs: { satiety: 82, cleanliness: 88, mood: 86, energy: 90, health: 100 },
    attributes: { strength: 1, intelligence: 1, charm: 1 },
    relationship: { affection: 0, growth: 0 },
    wallet: { coins: 280, tickets: 3 },
    inventory: { 'berry-bun': 2, 'mint-soap': 1, 'bounce-ball': 1 },
    equipment: { outfit: '', decor: '' },
    roster: { capacity: 12, activeId: '', owned: [], profiles: {} },
    habits: { feed: 0, clean: 0, play: 0, sleep: 0, strength: 0, intelligence: 0, charm: 0 },
    daily: freshDaily(now),
    weekly: freshWeekly(now),
    job: null,
    jobMastery: {},
    competition: freshCompetition(now),
    playgroundRecords: freshPlaygroundRecords(),
    exploration: null,
    collection: freshCollection(),
    ailment: null,
    growthMilestones: [],
    story: freshStory(now),
    achievements: [],
    loginStreak: freshLoginStreak(now),
    lastActions: {},
    lastTraining: {},
    stats: { careCount: 0, trainingCount: 0, jobsCompleted: 0, playgroundCount: 0, itemsBought: 0, arcadeCheers: 0, petsAdopted: 0, competitionWins: 0, storyChoices: 0, explorationsCompleted: 0 },
    lastMessage: '我在这里等你。',
    settings: { widgetVisible: true, widgetRoaming: true, widgetX: null, widgetY: null, sound: true },
});

const normalizeTimestamp = (value, fallback) => {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : fallback;
};

const normalizeMap = (source, validKeys = null) => {
    const result = {};
    Object.entries(source && typeof source === 'object' ? source : {}).forEach(([key, value]) => {
        if (validKeys && !validKeys.has(key)) return;
        const count = safeInteger(value);
        if (count > 0) result[key] = Math.min(99, count);
    });
    return result;
};

const normalizeAilment = (source) => {
    const ailment = PET_AILMENTS.find((entry) => entry.id === source?.id);
    return ailment ? { id: ailment.id, since: normalizeTimestamp(source.since, Date.now()) } : null;
};

export const getPetStage = (state, now = Date.now()) => {
    if (!state.adopted) return '等待领养';
    const ageDays = Math.max(0, (now - state.birthAt) / DAY);
    const growth = state.relationship.growth;
    return [...PET_GROWTH_STAGES].reverse().find((stage) => ageDays >= stage.minDays && growth >= stage.minGrowth)?.id || PET_GROWTH_STAGES[0].id;
};

export const getPetGrowthProgress = (state, now = Date.now()) => {
    const stageId = getPetStage(state, now);
    const index = Math.max(0, PET_GROWTH_STAGES.findIndex((entry) => entry.id === stageId));
    const current = PET_GROWTH_STAGES[index];
    const next = PET_GROWTH_STAGES[index + 1] || null;
    const ageDays = Math.max(0, (now - state.birthAt) / DAY);
    if (!next) return { current, next: null, percent: 100, ageDays, growthNeeded: 0, daysNeeded: 0 };
    const growthRange = Math.max(1, next.minGrowth - current.minGrowth);
    const dayRange = Math.max(1, next.minDays - current.minDays);
    const growthProgress = (state.relationship.growth - current.minGrowth) / growthRange;
    const dayProgress = (ageDays - current.minDays) / dayRange;
    return {
        current, next, ageDays,
        percent: Math.round(clamp(Math.min(growthProgress, dayProgress) * 100)),
        growthNeeded: Math.max(0, Math.ceil(next.minGrowth - state.relationship.growth)),
        daysNeeded: Math.max(0, Math.ceil(next.minDays - ageDays)),
    };
};

export const getPetLevel = (state) => Math.min(50, 1 + Math.floor(Math.sqrt(Math.max(0, Number(state.relationship?.growth) || 0) / 10)));

export const getCompetitionRank = (rating) => {
    const value = safeInteger(rating, 1000);
    if (value >= 1800) return '传奇伙伴';
    if (value >= 1500) return '大师伙伴';
    if (value >= 1250) return '黄金伙伴';
    if (value >= 1050) return '白银伙伴';
    return '青铜伙伴';
};

const grantGrowthMilestones = (state) => {
    const stageIndex = STAGE_INDEX[state.stage] || 0;
    const rewards = [];
    PET_GROWTH_STAGES.forEach((stage) => {
        if ((STAGE_INDEX[stage.id] || 0) > stageIndex || state.growthMilestones.includes(stage.id)) return;
        state.growthMilestones.push(stage.id);
        state.wallet.coins += stage.rewardCoins;
        state.wallet.tickets += stage.rewardTickets;
        if (stage.rewardCoins || stage.rewardTickets) rewards.push(stage);
    });
    if (rewards.length) state.lastMessage = `成长为${rewards[rewards.length - 1].id}，解锁${rewards[rewards.length - 1].unlock}！奖励已经送到。`;
    return rewards;
};

export const getEffectiveAttributes = (state) => {
    const bonus = PET_ITEMS_BY_ID[state.equipment?.outfit]?.bonus || {};
    return {
        strength: safeInteger(state.attributes?.strength, 1) + safeInteger(bonus.strength),
        intelligence: safeInteger(state.attributes?.intelligence, 1) + safeInteger(bonus.intelligence),
        charm: safeInteger(state.attributes?.charm, 1) + safeInteger(bonus.charm),
    };
};

export const getPetTalent = (state) => PET_SPECIES_BY_ID[state.species]?.talent || { name: '陪伴本能', description: '正在发现自己的专长' };
export const getPetAilment = (state) => PET_AILMENTS.find((entry) => entry.id === state.ailment?.id) || null;

export const getPetPersonality = (state) => {
    const habits = state.habits || {};
    const scores = [
        ['勇敢行动派', (habits.strength || 0) * 2 + (habits.play || 0)],
        ['好奇思考家', (habits.intelligence || 0) * 2 + (habits.feed || 0) * 0.25],
        ['活泼气氛组', (habits.charm || 0) * 2 + (habits.play || 0) * 1.2],
        ['讲究小管家', (habits.clean || 0) * 1.6],
        ['慢热安心派', (habits.sleep || 0) * 1.4],
    ].sort((a, b) => b[1] - a[1]);
    return scores[0][1] >= 4 ? scores[0][0] : '正在形成';
};

const normalizeJobMastery = (source) => Object.fromEntries(PET_JOBS.map((job) => [job.id, safeInteger(source?.[job.id])]).filter(([, count]) => count > 0));

const normalizeCompetition = (source, now) => {
    const base = freshCompetition(now);
    const currentDate = todayKey(now);
    const sameDate = source?.entriesDate === currentDate;
    return {
        season: typeof source?.season === 'string' ? source.season.slice(0, 7) : base.season,
        entriesDate: currentDate,
        entriesLeft: sameDate ? Math.min(5, safeInteger(source.entriesLeft, 5)) : 5,
        rating: Math.max(600, safeInteger(source?.rating, base.rating)),
        trophies: {
            strength: safeInteger(source?.trophies?.strength),
            intelligence: safeInteger(source?.trophies?.intelligence),
            charm: safeInteger(source?.trophies?.charm),
        },
        wins: safeInteger(source?.wins),
        losses: safeInteger(source?.losses),
        history: Array.isArray(source?.history) ? source.history.slice(0, 10).map((entry) => ({
            competitionId: PET_COMPETITIONS.some((item) => item.id === entry?.competitionId) ? entry.competitionId : PET_COMPETITIONS[0].id,
            divisionId: PET_COMPETITION_DIVISIONS.some((item) => item.id === entry?.divisionId) ? entry.divisionId : PET_COMPETITION_DIVISIONS[0].id,
            opponent: String(entry?.opponent || PET_OPPONENT_NAMES[0]).slice(0, 12),
            playerScore: safeInteger(entry?.playerScore), opponentScore: safeInteger(entry?.opponentScore),
            won: Boolean(entry?.won), playedAt: normalizeTimestamp(entry?.playedAt, now),
            strategyId: PET_COMPETITION_STRATEGIES.some((item) => item.id === entry?.strategyId) ? entry.strategyId : 'focus',
            opponentStyleId: PET_COMPETITION_STRATEGIES.some((item) => item.id === entry?.opponentStyleId) ? entry.opponentStyleId : 'focus',
        })) : [],
    };
};

const normalizePlaygroundRecords = (source) => Object.fromEntries(PET_PLAYGROUND_GAMES.map((game) => [game.id, {
    best: Math.min(100, safeInteger(source?.[game.id]?.best)),
    plays: safeInteger(source?.[game.id]?.plays),
}]));

const normalizeExploration = (source) => {
    const route = PET_EXPLORATIONS.find((entry) => entry.id === source?.routeId);
    if (!route || !['traveling', 'ready'].includes(source?.status)) return null;
    const startedAt = normalizeTimestamp(source.startedAt, Date.now());
    return {
        routeId: route.id,
        status: source.status,
        startedAt,
        endsAt: normalizeTimestamp(source.endsAt, startedAt + route.duration),
        rewardCoins: safeInteger(source.rewardCoins),
        rewardTickets: Math.min(3, safeInteger(source.rewardTickets)),
        collectibleId: PET_COLLECTIONS.some((item) => item.id === source.collectibleId) ? source.collectibleId : '',
        event: String(source.event || route.events[0]).slice(0, 80),
    };
};

const normalizeCollection = (source) => ({
    owned: [...new Set(Array.isArray(source?.owned) ? source.owned.filter((id) => PET_COLLECTIONS.some((item) => item.id === id)) : [])],
    routes: Object.fromEntries(PET_EXPLORATIONS.map((route) => [route.id, safeInteger(source?.routes?.[route.id])]).filter(([, count]) => count > 0)),
    recent: Array.isArray(source?.recent) ? source.recent.slice(0, 8).filter((entry) =>
        PET_COLLECTIONS.some((item) => item.id === entry?.collectibleId)
    ).map((entry) => ({ collectibleId: entry.collectibleId, foundAt: normalizeTimestamp(entry.foundAt, Date.now()), duplicate: Boolean(entry.duplicate) })) : [],
});

const normalizeStory = (source, now) => {
    const event = PET_STORY_EVENTS.find((entry) => entry.id === source?.pending?.eventId);
    return {
        nextAt: normalizeTimestamp(source?.nextAt, now + 18 * 60 * 1000),
        pending: event ? { eventId: event.id, triggeredAt: normalizeTimestamp(source.pending.triggeredAt, now) } : null,
        history: Array.isArray(source?.history) ? source.history.slice(0, 8).filter((entry) =>
            PET_STORY_EVENTS.some((eventEntry) => eventEntry.id === entry?.eventId)
        ).map((entry) => ({ eventId: entry.eventId, optionId: String(entry.optionId || '').slice(0, 24), resolvedAt: normalizeTimestamp(entry.resolvedAt, now) })) : [],
    };
};

const captureActiveProfile = (state) => Object.fromEntries(PROFILE_FIELDS.map((field) => [field, copy(state[field])]));

const makeFreshProfile = (speciesId, name, id, birthAt, now) => {
    const pet = freshPet(now);
    const species = PET_SPECIES_BY_ID[speciesId] || PET_SPECIES[0];
    pet.adopted = true;
    pet.id = id;
    pet.name = String(name || species.name).trim().slice(0, 10) || species.name;
    pet.species = species.id;
    pet.birthAt = birthAt;
    pet.lastSimulatedAt = birthAt;
    pet.attributes = { ...species.attributes };
    pet.stage = '幼年期';
    pet.growthMilestones = ['幼年期'];
    return captureActiveProfile(pet);
};

const normalizeProfile = (source, fallback, now) => {
    const species = PET_SPECIES_BY_ID[source?.species] ? source.species : fallback.species;
    const speciesBase = PET_SPECIES_BY_ID[species].attributes;
    const birthAt = normalizeTimestamp(source?.birthAt, fallback.birthAt || now);
    const profile = {
        id: String(source?.id || fallback.id).slice(0, 48),
        name: String(source?.name || fallback.name || PET_SPECIES_BY_ID[species].name).trim().slice(0, 10) || PET_SPECIES_BY_ID[species].name,
        species,
        birthAt,
        lastSimulatedAt: normalizeTimestamp(source?.lastSimulatedAt, birthAt),
        needs: Object.fromEntries(Object.keys(fallback.needs).map((key) => [key, clamp(source?.needs?.[key] ?? fallback.needs[key])])),
        attributes: Object.fromEntries(Object.keys(speciesBase).map((key) => [key, Math.max(speciesBase[key], safeInteger(source?.attributes?.[key], speciesBase[key]))])),
        relationship: { affection: safeInteger(source?.relationship?.affection), growth: safeGrowth(source?.relationship?.growth) },
        equipment: {
            outfit: PET_ITEMS_BY_ID[source?.equipment?.outfit]?.category === 'outfit' ? source.equipment.outfit : '',
            decor: PET_ITEMS_BY_ID[source?.equipment?.decor]?.category === 'decor' ? source.equipment.decor : '',
        },
        habits: Object.fromEntries(Object.keys(fallback.habits).map((key) => [key, safeInteger(source?.habits?.[key])])),
        job: normalizeJob(source?.job),
        jobMastery: normalizeJobMastery(source?.jobMastery),
        competition: normalizeCompetition(source?.competition, now),
        playgroundRecords: normalizePlaygroundRecords(source?.playgroundRecords),
        exploration: normalizeExploration(source?.exploration),
        collection: normalizeCollection(source?.collection),
        ailment: normalizeAilment(source?.ailment),
        growthMilestones: Array.isArray(source?.growthMilestones) ? source.growthMilestones.filter((id) => PET_GROWTH_STAGES.some((stage) => stage.id === id)) : [],
        story: normalizeStory(source?.story, now),
        lastActions: source?.lastActions && typeof source.lastActions === 'object' ? { ...source.lastActions } : {},
        lastTraining: source?.lastTraining && typeof source.lastTraining === 'object' ? { ...source.lastTraining } : {},
        lastMessage: String(source?.lastMessage || fallback.lastMessage).slice(0, 80),
    };
    profile.stage = getPetStage({ ...profile, adopted: true }, now);
    return profile;
};

const applyProfileToState = (state, profile) => {
    PROFILE_FIELDS.forEach((field) => { state[field] = copy(profile[field]); });
    state.adopted = true;
    return state;
};

const normalizeRoster = (source, state, now) => {
    const owned = Array.isArray(source?.owned) ? source.owned : [];
    const seenSpecies = new Set();
    let safeOwned = owned.filter((entry) => entry && PET_SPECIES_BY_ID[entry.speciesId] && !seenSpecies.has(entry.speciesId) && seenSpecies.add(entry.speciesId)).slice(0, 12).map((entry) => ({
        id: String(entry.id || '').slice(0, 48),
        speciesId: entry.speciesId,
        name: String(entry.name || PET_SPECIES_BY_ID[entry.speciesId].name).slice(0, 10),
        adoptedAt: normalizeTimestamp(entry.adoptedAt, state.birthAt || Date.now()),
    }));
    if (state.adopted) {
        safeOwned = safeOwned.filter((entry) => entry.id !== state.id && entry.speciesId !== state.species);
        safeOwned.unshift({ id: state.id, speciesId: state.species, name: state.name, adoptedAt: state.birthAt });
    }
    const finalOwned = safeOwned.filter((entry) => entry.id).slice(0, 12);
    const profiles = {};
    finalOwned.forEach((entry) => {
        const fallback = entry.id === state.id ? captureActiveProfile(state) : makeFreshProfile(entry.speciesId, entry.name, entry.id, entry.adoptedAt, now);
        profiles[entry.id] = normalizeProfile(source?.profiles?.[entry.id], fallback, now);
    });
    if (state.adopted) profiles[state.id] = normalizeProfile(captureActiveProfile(state), captureActiveProfile(state), now);
    const activeId = profiles[state.id] ? state.id : (profiles[source?.activeId] ? source.activeId : finalOwned[0]?.id || '');
    return { capacity: 12, activeId, owned: finalOwned, profiles };
};

const normalizeDaily = (source, now) => {
    if (source?.date !== todayKey(now)) return freshDaily(now);
    return {
        date: source.date,
        care: safeInteger(source.care), training: safeInteger(source.training), playground: safeInteger(source.playground),
        jobs: safeInteger(source.jobs), competition: safeInteger(source.competition), exploration: safeInteger(source.exploration), arcade: safeInteger(source.arcade),
        claimed: Array.isArray(source.claimed) ? source.claimed.filter((id) => PET_DAILY_TASKS.some((task) => task.id === id)) : [],
    };
};

const normalizeWeekly = (source, now) => {
    if (source?.week !== weekKey(now)) return freshWeekly(now);
    return {
        week: source.week,
        care: safeInteger(source.care), training: safeInteger(source.training), playground: safeInteger(source.playground),
        jobs: safeInteger(source.jobs), competition: safeInteger(source.competition), exploration: safeInteger(source.exploration),
        claimed: Array.isArray(source.claimed) ? source.claimed.filter((id) => PET_WEEKLY_TASKS.some((task) => task.id === id)) : [],
    };
};

const normalizeLoginStreak = (source, now) => {
    const currentDate = todayKey(now);
    const lastVisitDate = /^\d{4}-\d{2}-\d{2}$/.test(source?.lastVisitDate || '') ? source.lastVisitDate : currentDate;
    const lastRewardDate = /^\d{4}-\d{2}-\d{2}$/.test(source?.lastRewardDate || '') ? source.lastRewardDate : lastVisitDate;
    const current = Math.max(1, safeInteger(source?.current, 1));
    return { lastVisitDate, lastRewardDate, current, best: Math.max(current, safeInteger(source?.best, current)) };
};

const updateLoginStreak = (state, now) => {
    if (!state.adopted) return null;
    const currentDate = todayKey(now);
    if (state.loginStreak.lastVisitDate === currentDate) return null;
    const previous = new Date(`${state.loginStreak.lastVisitDate}T00:00:00`);
    const current = new Date(`${currentDate}T00:00:00`);
    const dayGap = Math.round((current - previous) / DAY);
    state.loginStreak.current = dayGap === 1 ? state.loginStreak.current + 1 : 1;
    state.loginStreak.best = Math.max(state.loginStreak.best, state.loginStreak.current);
    state.loginStreak.lastVisitDate = currentDate;
    if (state.loginStreak.lastRewardDate === currentDate) return null;
    const rewardCoins = 30 + Math.min(7, state.loginStreak.current) * 10;
    const rewardTickets = state.loginStreak.current % 3 === 0 ? 1 : 0;
    state.wallet.coins += rewardCoins;
    state.wallet.tickets += rewardTickets;
    state.loginStreak.lastRewardDate = currentDate;
    state.lastMessage = `连续相伴第 ${state.loginStreak.current} 天，收到 ${rewardCoins} 宠物币${rewardTickets ? '和 1 张游乐券' : ''}。`;
    return { rewardCoins, rewardTickets, days: state.loginStreak.current };
};

const normalizeJob = (source) => {
    if (!source || typeof source !== 'object') return null;
    if (!PET_JOBS.some((job) => job.id === source.jobId) || !PET_JOB_DURATIONS.some((duration) => duration.id === source.durationId)) return null;
    return {
        jobId: source.jobId,
        durationId: source.durationId,
        status: source.status === 'ready' ? 'ready' : 'working',
        startedAt: normalizeTimestamp(source.startedAt, Date.now()),
        endsAt: normalizeTimestamp(source.endsAt, Date.now()),
        rewardCoins: safeInteger(source.rewardCoins),
        rewardTickets: safeInteger(source.rewardTickets),
        eventId: ['excellent', 'tip', 'tiring', 'steady'].includes(source.eventId) ? source.eventId : 'steady',
        eventMood: Math.max(-20, Math.min(20, Number(source.eventMood) || 0)),
    };
};

export const getJobMastery = (state, jobId) => {
    const completions = safeInteger(state.jobMastery?.[jobId]);
    const title = completions >= 16 ? '职业大师' : completions >= 8 ? '资深员工' : completions >= 3 ? '熟练员工' : '见习员工';
    return { completions, level: Math.min(10, Math.floor(completions / 2) + 1), bonus: Math.min(0.25, completions * 0.025), title };
};

export const normalizePetState = (value, now = Date.now()) => {
    const source = value && typeof value === 'object' ? value : {};
    const base = freshPet(now);
    const adopted = Boolean(source.adopted);
    const species = PET_SPECIES_BY_ID[source.species] ? source.species : 'shadow-wolf';
    const speciesBase = PET_SPECIES_BY_ID[species].attributes;
    const birthAt = adopted ? normalizeTimestamp(source.birthAt, now) : 0;
    const state = {
        ...base,
        version: PET_SAVE_VERSION,
        adopted,
        id: adopted ? String(source.id || `pet-${birthAt}`).slice(0, 48) : '',
        name: adopted ? String(source.name || '小影').trim().slice(0, 10) || '小影' : '',
        species,
        birthAt,
        lastSimulatedAt: normalizeTimestamp(source.lastSimulatedAt, now),
        updatedAt: normalizeTimestamp(source.updatedAt, now),
        revision: safeInteger(source.revision),
        cloudUserId: typeof source.cloudUserId === 'string' ? source.cloudUserId : '',
        needs: {
            satiety: clamp(source.needs?.satiety ?? base.needs.satiety), cleanliness: clamp(source.needs?.cleanliness ?? base.needs.cleanliness),
            mood: clamp(source.needs?.mood ?? base.needs.mood), energy: clamp(source.needs?.energy ?? base.needs.energy),
            health: clamp(source.needs?.health ?? base.needs.health),
        },
        attributes: {
            strength: Math.max(speciesBase.strength, safeInteger(source.attributes?.strength, speciesBase.strength)),
            intelligence: Math.max(speciesBase.intelligence, safeInteger(source.attributes?.intelligence, speciesBase.intelligence)),
            charm: Math.max(speciesBase.charm, safeInteger(source.attributes?.charm, speciesBase.charm)),
        },
        relationship: { affection: safeInteger(source.relationship?.affection), growth: safeGrowth(source.relationship?.growth) },
        wallet: { coins: safeInteger(source.wallet?.coins, source.version === 1 ? 280 : base.wallet.coins), tickets: safeInteger(source.wallet?.tickets, base.wallet.tickets) },
        inventory: normalizeMap(source.inventory || (source.version === 1 ? base.inventory : {}), new Set(Object.keys(PET_ITEMS_BY_ID))),
        equipment: {
            outfit: PET_ITEMS_BY_ID[source.equipment?.outfit]?.category === 'outfit' ? source.equipment.outfit : '',
            decor: PET_ITEMS_BY_ID[source.equipment?.decor]?.category === 'decor' ? source.equipment.decor : '',
        },
        habits: Object.fromEntries(Object.keys(base.habits).map((key) => [key, safeInteger(source.habits?.[key])])),
        daily: normalizeDaily(source.daily, now),
        weekly: normalizeWeekly(source.weekly, now),
        job: normalizeJob(source.job),
        jobMastery: normalizeJobMastery(source.jobMastery),
        competition: normalizeCompetition(source.competition, now),
        playgroundRecords: normalizePlaygroundRecords(source.playgroundRecords),
        exploration: normalizeExploration(source.exploration),
        collection: normalizeCollection(source.collection),
        ailment: normalizeAilment(source.ailment),
        growthMilestones: Array.isArray(source.growthMilestones) ? source.growthMilestones.filter((id) => PET_GROWTH_STAGES.some((stage) => stage.id === id)) : [],
        story: normalizeStory(source.story, now),
        achievements: Array.isArray(source.achievements) ? [...new Set(source.achievements.filter((id) => PET_ACHIEVEMENTS.some((achievement) => achievement.id === id)))] : [],
        loginStreak: normalizeLoginStreak(source.loginStreak, now),
        lastActions: source.lastActions && typeof source.lastActions === 'object' ? { ...source.lastActions } : {},
        lastTraining: source.lastTraining && typeof source.lastTraining === 'object' ? { ...source.lastTraining } : {},
        stats: Object.fromEntries(Object.keys(base.stats).map((key) => [key, safeInteger(source.stats?.[key], key === 'careCount' ? source.stats?.careCount : 0)])),
        lastMessage: String(source.lastMessage || base.lastMessage).slice(0, 80),
        settings: {
            widgetVisible: source.settings?.widgetVisible !== false,
            widgetRoaming: source.settings?.widgetRoaming !== false,
            widgetX: source.settings?.widgetX !== null && source.settings?.widgetX !== undefined && Number.isFinite(Number(source.settings.widgetX)) ? Number(source.settings.widgetX) : null,
            widgetY: source.settings?.widgetY !== null && source.settings?.widgetY !== undefined && Number.isFinite(Number(source.settings.widgetY)) ? Number(source.settings.widgetY) : null,
            sound: source.settings?.sound !== false,
        },
    };
    state.roster = normalizeRoster(source.roster, state, now);
    state.roster.activeId = state.id;
    if (state.adopted) state.roster.profiles[state.id] = captureActiveProfile(state);
    state.stats.petsAdopted = Math.max(state.stats.petsAdopted, state.roster.owned.length);
    if (state.daily.date === todayKey(now)) state.wallet.tickets = Math.max(state.wallet.tickets, source.daily?.date === state.daily.date ? 0 : 3);
    state.stage = getPetStage(state, now);
    return state;
};

const applyNeeds = (state, changes) => {
    const talent = getPetTalent(state);
    Object.entries(changes || {}).forEach(([need, change]) => {
        if (!(need in state.needs)) return;
        let adjusted = Number(change) || 0;
        if (need === 'energy' && adjusted < 0) adjusted *= talent.energyCost || 1;
        if (need === 'mood' && adjusted > 0) adjusted *= talent.moodGain || 1;
        state.needs[need] = clamp(state.needs[need] + adjusted);
    });
};

const triggerStoryEvent = (state, now) => {
    if (state.story.pending || state.job || state.exploration || now < state.story.nextAt) return null;
    const previousId = state.story.history[0]?.eventId;
    const choices = PET_STORY_EVENTS.filter((entry) => entry.id !== previousId);
    const index = Math.floor(deterministicUnit(`${state.id}:story:${now}`) * choices.length) % choices.length;
    const event = choices[index] || PET_STORY_EVENTS[0];
    state.story.pending = { eventId: event.id, triggeredAt: now };
    state.lastMessage = `${event.title}：${event.description}`;
    return event;
};

const getBusyMessage = (state) => {
    if (state.job) return state.job.status === 'ready' ? '先领取打工报酬，再参加活动。' : '伙伴正在打工，回来后才能参加活动。';
    if (state.exploration) return state.exploration.status === 'ready' ? '先领取探索见闻，再参加其他活动。' : '伙伴正在外出探索，回来后才能参加活动。';
    return '';
};

const canDoActivity = (state, energyCost = 0) => {
    if (!state.adopted) return '请先领养伙伴。';
    const busy = getBusyMessage(state);
    if (busy) return busy;
    const ailment = getPetAilment(state);
    if (ailment) return `当前有${ailment.name}，先完成照顾或使用药品。`;
    if (state.needs.health < 35) return '健康低于 35，先休息或使用药品。';
    if (state.needs.energy < energyCost) return '体力不足，先休息一下。';
    return '';
};

export const simulatePetState = (value, now = Date.now()) => {
    const state = normalizePetState(value, now);
    const streakReward = updateLoginStreak(state, now);
    if (!state.adopted) {
        state.lastSimulatedAt = now;
        return { state, elapsedMs: 0, simulatedMs: 0, jobBecameReady: false, streakReward };
    }
    const rawElapsed = Math.max(0, now - state.lastSimulatedAt);
    const elapsedMs = Math.min(rawElapsed, MAX_OFFLINE_MS);
    const hours = elapsedMs / HOUR;
    const talent = getPetTalent(state);
    Object.entries(NEED_RATES).forEach(([need, rate]) => { state.needs[need] = clamp(state.needs[need] - rate * hours); });
    const criticalNeeds = ['satiety', 'cleanliness', 'mood'].filter((key) => state.needs[key] < 20).length;
    state.needs.health = clamp(state.needs.health + (criticalNeeds >= 2 ? -1 : 0.25) * hours);
    if (!state.ailment) {
        const ailmentCandidates = PET_AILMENTS.filter((entry) => state.needs[entry.needKey] < 18).sort((a, b) => state.needs[a.needKey] - state.needs[b.needKey]);
        const severe = ailmentCandidates[0] && (state.needs[ailmentCandidates[0].needKey] < 8 || ailmentCandidates.length >= 2 || state.needs.health < 45);
        if (severe) {
            state.ailment = { id: ailmentCandidates[0].id, since: now };
            state.lastMessage = `状态长期过低，引发了${ailmentCandidates[0].name}，需要及时照顾。`;
        }
    }
    if (state.ailment) state.needs.health = clamp(state.needs.health - 1.5 * hours);
    state.relationship.growth += hours * 0.5 * (1 + (talent.offlineGrowth || 0));
    const jobBecameReady = state.job?.status === 'working' && now >= state.job.endsAt;
    if (jobBecameReady) {
        state.job.status = 'ready';
        state.lastMessage = '打工结束啦，记得来领取报酬。';
    }
    const explorationBecameReady = state.exploration?.status === 'traveling' && now >= state.exploration.endsAt;
    if (explorationBecameReady) {
        state.exploration.status = 'ready';
        state.lastMessage = '探索结束啦，我带着见闻和纪念物回来了。';
    }
    state.lastSimulatedAt = Math.max(state.lastSimulatedAt, now);
    state.stage = getPetStage(state, now);
    const milestoneRewards = grantGrowthMilestones(state);
    const storyTriggered = triggerStoryEvent(state, now);
    return { state, elapsedMs: rawElapsed, simulatedMs: elapsedMs, jobBecameReady, explorationBecameReady, milestoneRewards, streakReward, storyTriggered };
};

export const isReadablePetSave = (value) => Boolean(
    value && typeof value === 'object' && !Array.isArray(value)
    && Number.isInteger(value.version) && value.version >= 1 && value.version <= PET_SAVE_VERSION
    && typeof value.adopted === 'boolean'
    && (!value.adopted || (
        typeof value.id === 'string' && value.id.length > 0
        && PET_SPECIES_BY_ID[value.species]
        && Number.isFinite(value.birthAt) && value.birthAt > 0
        && Number.isFinite(value.lastSimulatedAt) && value.lastSimulatedAt > 0
        && value.needs && ['satiety', 'cleanliness', 'mood', 'energy', 'health'].every(key => Number.isFinite(value.needs[key]))
        && value.relationship && Number.isFinite(value.relationship.growth)
        && (value.version === 1 || value.wallet && Number.isFinite(value.wallet.coins) && Number.isFinite(value.wallet.tickets))
    ))
);

const readRawPet = () => {
    try {
        const raw = localStorage.getItem(PET_STORAGE_KEY);
        if (raw === null) return null;
        const parsed = JSON.parse(raw);
        if (!isReadablePetSave(parsed)) throw new Error('Invalid or unsupported save');
        return parsed;
    } catch (cause) { throw new Error('伙伴存档无法读取，原存档已保留。请检查浏览器存储权限后重试。', { cause }); }
};

export const savePetState = (value, { notify = true, touch = true, revisionFloor = 0 } = {}) => {
    const current = readRawPet();
    if (safeInteger(current?.revision) !== safeInteger(value?.revision)) {
        const error = new Error('伙伴存档已在其他页面更新，本次操作未保存。请读取最新存档后重试。');
        error.code = 'PET_SAVE_CONFLICT';
        throw error;
    }
    const state = normalizePetState(value);
    state.stage = getPetStage(state, Date.now());
    grantGrowthMilestones(state);
    if (state.adopted) {
        state.roster.activeId = state.id;
        state.roster.profiles[state.id] = captureActiveProfile(state);
        const summary = state.roster.owned.find((entry) => entry.id === state.id);
        if (summary) { summary.name = state.name; summary.speciesId = state.species; }
    }
    if (touch) {
        state.updatedAt = Date.now();
    }
    state.revision = Math.max(safeInteger(current?.revision), safeInteger(revisionFloor)) + 1;
    try { localStorage.setItem(PET_STORAGE_KEY, JSON.stringify(state)); }
    catch (cause) { throw new Error('伙伴存档保存失败，本次操作未生效。请释放浏览器存储空间或检查存储权限后重试。', { cause }); }
    if (notify) try { channel?.postMessage({ type: 'pet-state', state }); } catch {                                                  }
    return state;
};

export const loadPetState = (now = Date.now()) => {
    const result = simulatePetState(readRawPet(), now);
    return result;
};

export const restorePetCloudState = (remote, local, userId) => {
    if (local.adopted && (local.id !== remote.id || (local.cloudUserId && local.cloudUserId !== userId))) {
        try { localStorage.setItem(`${PET_STORAGE_KEY}.before-cloud-restore`, JSON.stringify(local)); }
        catch (cause) { throw new Error('无法备份本地伙伴，已停止云端恢复。请先释放存储空间。', { cause }); }
    }
    return savePetState({ ...normalizePetState(remote), revision: local.revision, cloudUserId: userId }, { touch: false, revisionFloor: remote.revision });
};

export const createPet = (name, speciesId = 'shadow-wolf', now = Date.now()) => {
    const current = readRawPet();
    if (current?.adopted) throw new Error('已经领养伙伴，请读取现有存档或在伙伴名册中领养。');
    const species = PET_SPECIES_BY_ID[speciesId] || PET_SPECIES_BY_ID['shadow-wolf'];
    const state = freshPet(now);
    state.revision = safeInteger(current?.revision);
    state.adopted = true;
    state.id = `pet-${now}-${Math.random().toString(36).slice(2, 7)}`;
    state.name = String(name || species.name).trim().slice(0, 10) || species.name;
    state.species = species.id;
    state.birthAt = now;
    state.lastSimulatedAt = now;
    state.attributes = { ...species.attributes };
    state.stage = '幼年期';
    state.growthMilestones = ['幼年期'];
    state.stats.petsAdopted = 1;
    state.loginStreak = freshLoginStreak(now);
    state.roster.activeId = state.id;
    state.roster.owned = [{ id: state.id, speciesId: species.id, name: state.name, adoptedAt: now }];
    state.roster.profiles[state.id] = captureActiveProfile(state);
    state.lastMessage = `你好，我是${state.name}。以后请多关照！`;
    return savePetState(state);
};

export const getAdditionalAdoptionCost = (value) => {
    const state = normalizePetState(value);
    return 260 + Math.max(0, state.roster.owned.length - 1) * 180;
};

export const adoptAdditionalPet = (value, name, speciesId, now = Date.now()) => {
    const { state } = simulatePetState(value, now);
    const species = PET_SPECIES_BY_ID[speciesId];
    if (!state.adopted || !species) return { state, ok: false, message: '没有找到这位伙伴。' };
    if (state.roster.owned.length >= state.roster.capacity) return { state, ok: false, message: '伙伴名册已经满了。' };
    if (state.roster.owned.some((entry) => entry.speciesId === speciesId)) return { state, ok: false, message: '这种伙伴已经加入名册。' };
    const cost = getAdditionalAdoptionCost(state);
    if (state.wallet.coins < cost) return { state, ok: false, message: `领养需要 ${cost} 宠物币。` };
    state.wallet.coins -= cost;
    state.stats.petsAdopted += 1;
    state.roster.profiles[state.id] = captureActiveProfile(state);
    const id = `pet-${now}-${Math.random().toString(36).slice(2, 7)}`;
    const fallback = makeFreshProfile(speciesId, String(name || species.name).trim().slice(0, 10) || species.name, id, now, now);
    const profile = normalizeProfile({
        id, name: String(name || species.name).trim().slice(0, 10) || species.name, species: speciesId,
        birthAt: now, lastSimulatedAt: now, attributes: species.attributes, relationship: {}, growthMilestones: ['幼年期'],
        lastMessage: `你好，我是${String(name || species.name).trim().slice(0, 10) || species.name}。`,
    }, fallback, now);
    state.roster.owned.push({ id, speciesId, name: profile.name, adoptedAt: now });
    state.roster.profiles[id] = profile;
    applyProfileToState(state, profile);
    state.roster.activeId = id;
    state.lastMessage = `${profile.name}加入了伙伴名册！`;
    return { state: savePetState(state), ok: true, message: state.lastMessage, petId: id, cost };
};

export const switchActivePet = (value, petId, now = Date.now()) => {
    const { state } = simulatePetState(value, now);
    if (!state.roster.profiles[petId]) return { state, ok: false, message: '名册里没有这位伙伴。' };
    if (petId === state.id) return { state, ok: false, message: `${state.name}已经在身边。` };
    state.roster.profiles[state.id] = captureActiveProfile(state);
    const target = normalizeProfile(state.roster.profiles[petId], state.roster.profiles[petId], now);
    applyProfileToState(state, target);
    state.roster.activeId = petId;
    state.lastMessage = `${state.name}从托管小屋回来了。`;
    const result = simulatePetState(state, now);
    result.state.lastMessage = state.lastMessage;
    return { state: savePetState(result.state), ok: true, message: result.state.lastMessage };
};

export const performPetAction = (value, actionId, now = Date.now()) => {
    const action = PET_ACTIONS[actionId];
    if (!action) return { state: normalizePetState(value, now), ok: false, message: '这个动作还没有准备好。' };
    const { state } = simulatePetState(value, now);
    if (!state.adopted) return { state, ok: false, message: '请先领养伙伴。' };
    const busy = getBusyMessage(state);
    if (busy) return { state, ok: false, message: busy };
    const readyAt = Number(state.lastActions[actionId]) || 0;
    if (readyAt > now) return { state, ok: false, message: `${action.label}还要等待 ${Math.ceil((readyAt - now) / 1000)} 秒。`, readyAt };
    const previousNeed = state.needs[action.needKey];
    applyNeeds(state, action.needs);
    const ailment = getPetAilment(state);
    const cured = ailment?.cureAction === actionId && state.needs[ailment.needKey] >= 35;
    if (cured) {
        state.ailment = null;
        applyNeeds(state, { health: 8 });
    }
    const careEfficiency = previousNeed >= 90 ? 0.25 : previousNeed >= 75 ? 0.6 : 1;
    state.relationship.affection += Math.max(1, Math.round(action.affection * careEfficiency));
    state.relationship.growth += action.growth * careEfficiency;
    state.stats.careCount += 1;
    state.daily.care += 1;
    state.weekly.care += 1;
    state.habits[actionId] += 1;
    state.lastActions[actionId] = now + action.cooldown * 1000;
    const messagePool = previousNeed < 30 ? action.urgentMessages : previousNeed > 85 ? action.fullMessages : action.messages;
    const messageIndex = Math.floor(deterministicUnit(`${state.id}:${actionId}:${state.habits[actionId]}`) * messagePool.length) % messagePool.length;
    state.lastMessage = `${messagePool[messageIndex] || action.message}${cured ? `${ailment.name}已经恢复了。` : ''}`;
    return { state: savePetState(state), ok: true, message: state.lastMessage, readyAt: state.lastActions[actionId], careEfficiency };
};

export const trainPet = (value, trainingId, now = Date.now()) => {
    const training = PET_TRAINING.find((entry) => entry.id === trainingId);
    const { state } = simulatePetState(value, now);
    if (!training) return { state, ok: false, message: '没有找到这项训练。' };
    const energyCost = Math.abs(Math.min(0, training.needs.energy || 0)) * (getPetTalent(state).energyCost || 1);
    const blocked = canDoActivity(state, energyCost);
    if (blocked) return { state, ok: false, message: blocked };
    const readyAt = Number(state.lastTraining[trainingId]) || 0;
    if (readyAt > now) return { state, ok: false, message: `${training.name}还要等待 ${Math.ceil((readyAt - now) / 1000)} 秒。`, readyAt };
    applyNeeds(state, training.needs);
    const talent = getPetTalent(state);
    const talentGain = talent.trainingAttribute === training.attribute ? safeInteger(talent.trainingGain) : 0;
    state.attributes[training.attribute] += training.gain + talentGain;
    state.relationship.growth += 6;
    state.relationship.affection += 2;
    state.habits[training.attribute] += 1;
    state.daily.training += 1;
    state.weekly.training += 1;
    state.stats.trainingCount += 1;
    state.lastTraining[trainingId] = now + training.cooldown * 1000;
    state.lastMessage = `${training.name}完成，${training.attribute === 'strength' ? '力量' : training.attribute === 'intelligence' ? '智力' : '魅力'}提升 ${training.gain + talentGain} 点${talentGain ? `，触发${talent.name}` : ''}。`;
    return { state: savePetState(state), ok: true, message: state.lastMessage, readyAt: state.lastTraining[trainingId] };
};

export const startPetJob = (value, jobId, durationId, now = Date.now()) => {
    const job = PET_JOBS.find((entry) => entry.id === jobId);
    const duration = PET_JOB_DURATIONS.find((entry) => entry.id === durationId);
    const { state } = simulatePetState(value, now);
    if (!job || !duration) return { state, ok: false, message: '打工配置不存在。' };
    if (state.job) return { state, ok: false, message: state.job.status === 'ready' ? '先领取上一份打工报酬。' : '伙伴已经在打工了。' };
    const requiredStage = duration.id === 'long' ? '少年期' : duration.id === 'medium' ? '童年期' : '幼年期';
    if ((STAGE_INDEX[state.stage] || 0) < STAGE_INDEX[requiredStage]) return { state, ok: false, message: `${duration.label}班次需要成长到${requiredStage}。` };
    const attributes = getEffectiveAttributes(state);
    if (attributes[job.primary] < job.requirement) return { state, ok: false, message: `这份工作需要 ${job.requirement} 点对应能力。` };
    const blocked = canDoActivity(state, duration.energy * (getPetTalent(state).energyCost || 1));
    if (blocked) return { state, ok: false, message: blocked };
    const skillBonus = Math.min(0.5, Math.max(0, attributes[job.primary] - job.requirement) * 0.03);
    const mastery = getJobMastery(state, jobId);
    const talent = getPetTalent(state);
    const eventRoll = deterministicUnit(`${state.id}:${jobId}:${durationId}:${now}`);
    const eventId = eventRoll < 0.16 ? 'excellent' : eventRoll < 0.27 ? 'tip' : eventRoll < 0.38 ? 'tiring' : 'steady';
    const eventBonus = eventId === 'excellent' ? 0.2 : 0;
    const rewardCoins = Math.round(job.rewardRate * duration.rewardFactor * (1 + skillBonus + mastery.bonus + eventBonus + (talent.jobCoins || 0)));
    const rewardTickets = (duration.id === 'long' ? 1 : 0) + (eventId === 'tip' ? 1 : 0);
    applyNeeds(state, { energy: -duration.energy, satiety: -Math.ceil(duration.energy * 0.35), cleanliness: -Math.ceil(duration.energy * 0.2) });
    state.job = { jobId, durationId, status: 'working', startedAt: now, endsAt: now + duration.milliseconds, rewardCoins, rewardTickets, eventId, eventMood: eventId === 'tiring' ? -7 : 0 };
    state.lastMessage = `${state.name}去做${job.name}了。`;
    return { state: savePetState(state), ok: true, message: state.lastMessage };
};

export const claimPetJob = (value, now = Date.now()) => {
    const { state } = simulatePetState(value, now);
    if (!state.job || state.job.status !== 'ready') return { state, ok: false, message: '现在没有可领取的打工报酬。' };
    const job = PET_JOBS.find((entry) => entry.id === state.job.jobId);
    const rewardCoins = state.job.rewardCoins;
    const rewardTickets = state.job.rewardTickets;
    state.wallet.coins += rewardCoins;
    state.wallet.tickets += rewardTickets;
    state.relationship.growth += 8;
    state.relationship.affection += 3;
    state.habits[job.primary] += 1;
    state.jobMastery[job.id] = safeInteger(state.jobMastery[job.id]) + 1;
    state.daily.jobs += 1;
    state.weekly.jobs += 1;
    state.stats.jobsCompleted += 1;
    applyNeeds(state, { mood: state.job.eventMood });
    const eventText = state.job.eventId === 'excellent' ? '表现出色，额外获得了优秀奖励。'
        : state.job.eventId === 'tip' ? '遇到热心客人，额外收到一张游乐券。'
            : state.job.eventId === 'tiring' ? '今天的班次有些辛苦，心情稍有下降。' : '班次顺利完成。';
    state.job = null;
    state.lastMessage = `打工报酬到账：${rewardCoins} 宠物币${rewardTickets ? `、${rewardTickets} 张游乐券` : ''}。${eventText}`;
    return { state: savePetState(state), ok: true, message: state.lastMessage };
};

export const startPetExploration = (value, routeId, now = Date.now()) => {
    const route = PET_EXPLORATIONS.find((entry) => entry.id === routeId);
    const { state } = simulatePetState(value, now);
    if (!route) return { state, ok: false, message: '没有找到这条探索路线。' };
    const blocked = canDoActivity(state, route.energy * (getPetTalent(state).energyCost || 1));
    if (blocked) return { state, ok: false, message: blocked };
    if ((STAGE_INDEX[state.stage] || 0) < (STAGE_INDEX[route.requiredStage] || 0)) return { state, ok: false, message: `${route.name}需要成长到${route.requiredStage}。` };
    const attributes = getEffectiveAttributes(state);
    if (attributes[route.attribute] < route.requirement) return { state, ok: false, message: `${route.name}需要 ${route.requirement} 点${route.attribute === 'strength' ? '力量' : route.attribute === 'intelligence' ? '智力' : '魅力'}。` };
    const mastery = safeInteger(state.collection.routes[route.id]);
    const masteryBonus = Math.min(0.2, mastery * 0.02);
    const seed = `${state.id}:${route.id}:${now}`;
    const rewardRoll = deterministicUnit(`${seed}:coins`);
    const rewardCoins = Math.round((route.rewardCoins[0] + rewardRoll * (route.rewardCoins[1] - route.rewardCoins[0])) * (1 + masteryBonus));
    const rewardTickets = deterministicUnit(`${seed}:ticket`) < route.ticketChance ? 1 : 0;
    const collectibleRoll = deterministicUnit(`${seed}:collectible`);
    const collectibleChance = Math.min(0.7, 0.48 + mastery * 0.015);
    const collectibleId = collectibleRoll < collectibleChance
        ? route.collectibles[collectibleRoll > collectibleChance * 0.76 ? 1 : 0]
        : '';
    const event = route.events[Math.floor(deterministicUnit(`${seed}:event`) * route.events.length) % route.events.length];
    applyNeeds(state, { energy: -route.energy, satiety: -Math.ceil(route.energy * 0.25), cleanliness: -Math.ceil(route.energy * 0.18) });
    state.exploration = {
        routeId: route.id, status: 'traveling', startedAt: now, endsAt: now + route.duration,
        rewardCoins, rewardTickets, collectibleId, event,
    };
    state.lastMessage = `${state.name}出发前往${route.name}，预计 ${Math.ceil(route.duration / 60000)} 分钟后回来。`;
    return { state: savePetState(state), ok: true, message: state.lastMessage, endsAt: state.exploration.endsAt };
};

export const claimPetExploration = (value, now = Date.now()) => {
    const { state } = simulatePetState(value, now);
    const active = state.exploration;
    if (!active) return { state, ok: false, message: '现在没有可以领取的探索见闻。' };
    if (active.status !== 'ready' && now < active.endsAt) return { state, ok: false, message: `探索还需要 ${Math.ceil((active.endsAt - now) / 60000)} 分钟。`, endsAt: active.endsAt };
    const route = PET_EXPLORATIONS.find((entry) => entry.id === active.routeId);
    if (!route) {
        state.exploration = null;
        return { state: savePetState(state), ok: false, message: '探索路线已经失效，伙伴安全回到了小屋。' };
    }
    let collectible = PET_COLLECTIONS.find((item) => item.id === active.collectibleId) || null;
    let duplicate = false;
    let duplicateCoins = 0;
    if (collectible) {
        duplicate = state.collection.owned.includes(collectible.id);
        if (duplicate) {
            duplicateCoins = collectible.rarity === 'epic' ? 60 : collectible.rarity === 'rare' ? 30 : 12;
        } else {
            state.collection.owned.push(collectible.id);
        }
        state.collection.recent.unshift({ collectibleId: collectible.id, foundAt: now, duplicate });
        state.collection.recent = state.collection.recent.slice(0, 8);
    }
    const previousMastery = safeInteger(state.collection.routes[route.id]);
    const nextMastery = previousMastery + 1;
    state.collection.routes[route.id] = nextMastery;
    const attributeRaised = nextMastery % 3 === 0;
    if (attributeRaised) state.attributes[route.attribute] += 1;
    const totalCoins = active.rewardCoins + duplicateCoins;
    state.wallet.coins += totalCoins;
    state.wallet.tickets += active.rewardTickets;
    state.daily.exploration += 1;
    state.weekly.exploration += 1;
    state.stats.explorationsCompleted += 1;
    state.relationship.growth += 6 + route.duration / HOUR * 2;
    state.relationship.affection += 2;
    state.habits[route.attribute] += 1;
    applyNeeds(state, { mood: 8 });
    const discoveryText = collectible ? duplicate ? `再次发现${collectible.name}，折算 ${duplicateCoins} 宠物币。` : `发现新纪念物“${collectible.name}”！` : '这次没有发现纪念物。';
    const growthText = attributeRaised ? `${route.attribute === 'strength' ? '力量' : route.attribute === 'intelligence' ? '智力' : '魅力'}提升 1 点。` : '';
    state.exploration = null;
    state.lastMessage = `${route.name}探索完成：${active.event} 获得 ${totalCoins} 宠物币${active.rewardTickets ? `和 ${active.rewardTickets} 张游乐券` : ''}。${discoveryText}${growthText}`;
    return {
        state: savePetState(state), ok: true, message: state.lastMessage, routeId: route.id, rewardCoins: totalCoins,
        rewardTickets: active.rewardTickets, collectibleId: collectible?.id || '', duplicate, duplicateCoins, attributeRaised,
    };
};

export const recallPetExploration = (value) => {
    const { state } = simulatePetState(value);
    if (!state.exploration) return { state, ok: false, message: '伙伴现在没有外出探索。' };
    if (state.exploration.status === 'ready') return { state, ok: false, message: '探索已经完成，直接领取见闻吧。' };
    const route = PET_EXPLORATIONS.find((entry) => entry.id === state.exploration.routeId);
    state.exploration = null;
    applyNeeds(state, { mood: -2 });
    state.lastMessage = `提前结束了${route?.name || '探索'}，本次没有获得奖励。`;
    return { state: savePetState(state), ok: true, message: state.lastMessage };
};

const getCompetitionSetup = (value, competitionId, divisionId, now) => {
    const competition = PET_COMPETITIONS.find((entry) => entry.id === competitionId);
    const division = PET_COMPETITION_DIVISIONS.find((entry) => entry.id === divisionId);
    const { state } = simulatePetState(value, now);
    if (!competition || !division) return { state, ok: false, message: '没有找到这项赛事。' };
    const blocked = canDoActivity(state, division.energy * (getPetTalent(state).energyCost || 1));
    if (blocked) return { state, ok: false, message: blocked };
    if (state.competition.entriesLeft <= 0) return { state, ok: false, message: '今天的 5 次参赛机会已经用完。' };
    if ((STAGE_INDEX[state.stage] || 0) < (STAGE_INDEX[division.requiredStage] || 0)) return { state, ok: false, message: `${division.name}需要成长到${division.requiredStage}。` };
    const attributes = getEffectiveAttributes(state);
    if (attributes[competition.attribute] < division.requiredAttribute) return { state, ok: false, message: `${division.name}需要 ${division.requiredAttribute} 点${competition.attribute === 'strength' ? '力量' : competition.attribute === 'intelligence' ? '智力' : '魅力'}。` };
    if (state.wallet.coins < division.fee) return { state, ok: false, message: `报名需要 ${division.fee} 宠物币。` };

    return { state, competition, division, attributes, ok: true };
};

const createCompetitionOpponent = (state, competitionId, division, now) => {
    const seed = `${state.id}:${competitionId}:${division.id}:${now}`;
    const [minimum, maximum] = division.opponentPower;
    const opponentPower = Math.round(minimum + deterministicUnit(`${seed}:opponent`) * (maximum - minimum));
    const opponent = PET_OPPONENT_NAMES[Math.floor(deterministicUnit(`${seed}:name`) * PET_OPPONENT_NAMES.length) % PET_OPPONENT_NAMES.length];
    const style = PET_COMPETITION_STRATEGIES[Math.floor(deterministicUnit(`${seed}:style`) * PET_COMPETITION_STRATEGIES.length) % PET_COMPETITION_STRATEGIES.length];
    const species = PET_SPECIES[Math.floor(deterministicUnit(`${seed}:species`) * PET_SPECIES.length) % PET_SPECIES.length];
    return { seed, opponent, opponentPower, style, speciesId: species.id };
};

export const previewPetCompetition = (value, competitionId, divisionId, now = Date.now()) => {
    const setup = getCompetitionSetup(value, competitionId, divisionId, now);
    if (!setup.ok) return setup;
    const rival = createCompetitionOpponent(setup.state, competitionId, setup.division, now);
    const condition = setup.state.needs.mood * 0.12 + setup.state.needs.energy * 0.08 + setup.state.needs.health * 0.08;
    const support = Object.entries(setup.attributes).filter(([key]) => key !== setup.competition.attribute).reduce((sum, [, score]) => sum + score, 0);
    const projectedPower = Math.round(setup.attributes[setup.competition.attribute] * 7 + support * 0.7 + condition);
    return {
        state: setup.state, ok: true, matchAt: now, opponent: rival.opponent, opponentPower: rival.opponentPower,
        opponentStyleId: rival.style.id, opponentStyle: rival.style.name, opponentSpeciesId: rival.speciesId, projectedPower,
        competition: setup.competition, division: setup.division,
    };
};

export const enterPetCompetition = (value, competitionId, divisionId, strategyOrNow = 'focus', now = Date.now(), matchAt = now) => {
    const legacyNow = typeof strategyOrNow === 'number' ? strategyOrNow : now;
    const strategyId = typeof strategyOrNow === 'string' ? strategyOrNow : 'focus';
    const strategy = PET_COMPETITION_STRATEGIES.find((entry) => entry.id === strategyId);
    const setup = getCompetitionSetup(value, competitionId, divisionId, legacyNow);
    if (!setup.ok) return setup;
    if (!strategy) return { state: setup.state, ok: false, message: '没有找到这套比赛策略。' };
    const { state, competition, division, attributes } = setup;

    const rival = createCompetitionOpponent(state, competitionId, division, typeof strategyOrNow === 'number' ? legacyNow : matchAt);
    const seed = rival.seed;
    const condition = state.needs.mood * 0.12 + state.needs.energy * 0.08 + state.needs.health * 0.08;
    const talent = getPetTalent(state);
    const talentScore = talent.competitionAttribute === competition.attribute ? talent.competitionScore || 0 : 0;
    const support = Object.entries(attributes).filter(([key]) => key !== competition.attribute).reduce((sum, [, score]) => sum + score, 0);
    const matchup = strategy.counters === rival.style.id ? 0.12 : rival.style.counters === strategy.id ? -0.09 : 0;
    const playerPower = (attributes[competition.attribute] * 7 * strategy.primaryScale
        + support * 0.7 * strategy.supportScale + condition * strategy.conditionScale) * (1 + talentScore + matchup);
    const roundWeights = [0.32, 0.33, 0.35];
    const rounds = roundWeights.map((weight, index) => {
        const playerVariance = (deterministicUnit(`${seed}:player:${strategy.id}:${index}`) - 0.5) * strategy.variance;
        const opponentVariance = (deterministicUnit(`${seed}:rival:${index}`) - 0.5) * 0.14;
        const player = Math.max(1, Math.round(playerPower * weight * (1 + playerVariance)));
        const opponent = Math.max(1, Math.round(rival.opponentPower * weight * (1 + opponentVariance)));
        return { round: index + 1, player, opponent, won: player >= opponent };
    });
    const playerScore = rounds.reduce((sum, round) => sum + round.player, 0);
    const opponentScore = rounds.reduce((sum, round) => sum + round.opponent, 0);
    const opponent = rival.opponent;
    const won = playerScore >= opponentScore;
    const coinReward = won ? division.winCoins : Math.max(8, Math.round(division.fee * 0.2));
    const trophyChange = won ? division.trophy : -Math.max(2, Math.round(division.trophy * 0.25));
    const ratingChange = won ? division.rating : -Math.max(8, Math.round(division.rating * 0.6));

    state.wallet.coins -= division.fee;
    state.wallet.coins += coinReward;
    state.competition.entriesLeft -= 1;
    state.competition.trophies[competition.attribute] = Math.max(0, state.competition.trophies[competition.attribute] + trophyChange);
    state.competition.rating = Math.max(600, state.competition.rating + ratingChange);
    state.competition[won ? 'wins' : 'losses'] += 1;
    if (won) state.stats.competitionWins += 1;
    state.competition.history.unshift({ competitionId, divisionId, opponent, playerScore, opponentScore, won, playedAt: legacyNow, strategyId: strategy.id, opponentStyleId: rival.style.id });
    state.competition.history = state.competition.history.slice(0, 10);
    state.daily.competition += 1;
    state.weekly.competition += 1;
    applyNeeds(state, { energy: -division.energy, mood: won ? 8 : -3, satiety: -3, cleanliness: -2 });
    state.relationship.growth += won ? 12 : 6;
    state.relationship.affection += won ? 3 : 1;
    state.habits[competition.attribute] += 1;
    state.lastMessage = won
        ? `${competition.name}战胜${opponent}，赢得 ${coinReward} 宠物币与 ${division.trophy} 奖杯分！`
        : `${competition.name}惜败给${opponent}，获得 ${coinReward} 宠物币鼓励奖。`;
    return {
        state: savePetState(state), ok: true, message: state.lastMessage, won, playerScore, opponentScore,
        opponent, opponentStyle: rival.style.name, opponentStyleId: rival.style.id, opponentSpeciesId: rival.speciesId,
        strategy: strategy.name, strategyId: strategy.id,
        rounds, matchup, coinReward, trophyChange, ratingChange,
    };
};

export const buyPetItem = (value, itemId) => {
    const state = normalizePetState(value);
    const item = PET_ITEMS_BY_ID[itemId];
    if (!item) return { state, ok: false, message: '商品不存在。' };
    if (state.wallet.coins < item.price) return { state, ok: false, message: '宠物币不够。' };
    if (['outfit', 'decor'].includes(item.category) && state.inventory[itemId]) return { state, ok: false, message: '这件物品已经拥有。' };
    if ((state.inventory[itemId] || 0) >= 99) return { state, ok: false, message: '这件物品已达到 99 件上限，请先使用。' };
    state.wallet.coins -= item.price;
    state.inventory[itemId] = Math.min(99, (state.inventory[itemId] || 0) + 1);
    state.stats.itemsBought += 1;
    state.lastMessage = `买到了${item.name}。`;
    return { state: savePetState(state), ok: true, message: state.lastMessage };
};

export const usePetItem = (value, itemId) => {
    const state = normalizePetState(value);
    const item = PET_ITEMS_BY_ID[itemId];
    if (!item || !state.inventory[itemId]) return { state, ok: false, message: '背包里没有这件物品。' };
    const busy = getBusyMessage(state);
    if (busy) return { state, ok: false, message: busy };
    if (item.category === 'outfit') {
        state.equipment.outfit = itemId;
        state.lastMessage = `换上了${item.name}。`;
    } else if (item.category === 'decor') {
        state.equipment.decor = itemId;
        state.lastMessage = `小屋已经换成${item.name}。`;
    } else {
        applyNeeds(state, item.effect);
        state.inventory[itemId] -= 1;
        if (state.inventory[itemId] <= 0) delete state.inventory[itemId];
        state.relationship.affection += 1;
        const curedAilment = item.category === 'medicine' ? getPetAilment(state) : null;
        if (curedAilment) {
            state.ailment = null;
            applyNeeds(state, { health: 5 });
        }
        state.lastMessage = `使用了${item.name}。${curedAilment ? `${curedAilment.name}已经恢复。` : ''}`;
    }
    return { state: savePetState(state), ok: true, message: state.lastMessage };
};

export const completePlaygroundGame = (value, gameId, score, now = Date.now()) => {
    const game = PET_PLAYGROUND_GAMES.find((entry) => entry.id === gameId);
    const { state } = simulatePetState(value, now);
    if (!game) return { state, ok: false, message: '游乐项目不存在。' };
    const blocked = canDoActivity(state, 8 * (getPetTalent(state).energyCost || 1));
    if (blocked) return { state, ok: false, message: blocked };
    if (state.wallet.tickets < 1) return { state, ok: false, message: '游乐券不够，完成每日任务可以获得。' };
    const safeScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
    const rewardCoins = Math.round((15 + safeScore * 0.55) * (1 + (getPetTalent(state).playgroundCoins || 0)));
    state.wallet.tickets -= 1;
    state.wallet.coins += rewardCoins;
    applyNeeds(state, { energy: -8, mood: 10, cleanliness: -2, satiety: -2 });
    if (safeScore >= 60) state.attributes[game.attribute] += 1;
    state.relationship.growth += 4 + safeScore / 25;
    state.relationship.affection += 2;
    state.habits[game.attribute] += 1;
    state.daily.playground += 1;
    state.weekly.playground += 1;
    state.stats.playgroundCount += 1;
    state.playgroundRecords[game.id].best = Math.max(state.playgroundRecords[game.id].best, safeScore);
    state.playgroundRecords[game.id].plays += 1;
    state.lastMessage = `${game.name}获得 ${safeScore} 分，赢得 ${rewardCoins} 宠物币。`;
    return { state: savePetState(state), ok: true, message: state.lastMessage, score: safeScore, rewardCoins };
};

export const resolvePetStoryEvent = (value, optionId, now = Date.now()) => {
    const { state } = simulatePetState(value, now);
    const event = PET_STORY_EVENTS.find((entry) => entry.id === state.story.pending?.eventId);
    const option = event?.options.find((entry) => entry.id === optionId);
    if (!event || !option) return { state, ok: false, message: '这段街区事件已经结束了。' };
    const busy = getBusyMessage(state);
    if (busy) return { state, ok: false, message: busy };
    const effect = option.effect || {};
    applyNeeds(state, effect.needs);
    state.wallet.coins += safeInteger(effect.coins);
    state.wallet.tickets += safeInteger(effect.tickets);
    Object.entries(effect.attributes || {}).forEach(([attribute, gain]) => {
        if (attribute in state.attributes) state.attributes[attribute] += safeInteger(gain);
    });
    Object.entries(effect.inventory || {}).forEach(([itemId, count]) => {
        if (PET_ITEMS_BY_ID[itemId]) state.inventory[itemId] = Math.min(99, (state.inventory[itemId] || 0) + safeInteger(count));
    });
    state.relationship.affection += safeInteger(effect.affection);
    state.relationship.growth += Math.max(0, Number(effect.growth) || 0);
    state.stats.storyChoices += 1;
    state.story.history.unshift({ eventId: event.id, optionId: option.id, resolvedAt: now });
    state.story.history = state.story.history.slice(0, 8);
    state.story.pending = null;
    state.story.nextAt = now + Math.round((22 + deterministicUnit(`${state.id}:story-next:${now}`) * 23) * 60 * 1000);
    state.lastMessage = option.outcome;
    return { state: savePetState(state), ok: true, message: option.outcome, eventId: event.id, optionId: option.id };
};

export const claimDailyTask = (value, taskId) => {
    const state = normalizePetState(value);
    const task = PET_DAILY_TASKS.find((entry) => entry.id === taskId);
    if (!task) return { state, ok: false, message: '任务不存在。' };
    if (state.daily.claimed.includes(taskId)) return { state, ok: false, message: '奖励已经领取。' };
    if ((state.daily[task.field] || 0) < task.target) return { state, ok: false, message: '任务还没有完成。' };
    state.daily.claimed.push(taskId);
    state.wallet.coins += task.rewardCoins;
    state.wallet.tickets += task.rewardTickets || 0;
    state.lastMessage = `领取任务奖励：${task.rewardCoins} 宠物币${task.rewardTickets ? `、${task.rewardTickets} 张游乐券` : ''}。`;
    return { state: savePetState(state), ok: true, message: state.lastMessage };
};

export const claimWeeklyTask = (value, taskId, now = Date.now()) => {
    const state = normalizePetState(value, now);
    const task = PET_WEEKLY_TASKS.find((entry) => entry.id === taskId);
    if (!task) return { state, ok: false, message: '周常委托不存在。' };
    if (state.weekly.claimed.includes(taskId)) return { state, ok: false, message: '这项周常奖励已经领取。' };
    if ((state.weekly[task.field] || 0) < task.target) return { state, ok: false, message: '这项周常委托还没有完成。' };
    state.weekly.claimed.push(taskId);
    state.wallet.coins += task.rewardCoins;
    state.wallet.tickets += task.rewardTickets || 0;
    state.lastMessage = `完成周常“${task.label}”，领取 ${task.rewardCoins} 宠物币${task.rewardTickets ? `和 ${task.rewardTickets} 张游乐券` : ''}。`;
    return { state: savePetState(state), ok: true, message: state.lastMessage };
};

export const getAchievementProgress = (state, achievement) => {
    let value = safeInteger(state.stats?.[achievement.metric]);
    if (achievement.metric === 'rosterCount') value = state.roster?.owned?.length || 0;
    if (achievement.metric === 'minAttribute') value = Math.min(...Object.values(getEffectiveAttributes(state)));
    if (achievement.metric === 'maxJobMastery') {
        const profiles = Object.values(state.roster?.profiles || {});
        value = Math.max(0, ...profiles.flatMap((profile) => Object.values(profile.jobMastery || {}).map((count) => safeInteger(count))));
    }
    if (achievement.metric === 'adultPets') value = Object.values(state.roster?.profiles || {}).filter((profile) => profile.stage === '成年期').length;
    if (achievement.metric === 'collectionCount') {
        const collected = new Set(state.collection?.owned || []);
        Object.values(state.roster?.profiles || {}).forEach((profile) => profile.collection?.owned?.forEach((id) => collected.add(id)));
        value = collected.size;
    }
    value = Math.min(achievement.target, value);
    return { value, target: achievement.target, complete: value >= achievement.target, claimed: state.achievements?.includes(achievement.id) };
};

export const claimPetAchievement = (value, achievementId) => {
    const state = normalizePetState(value);
    const achievement = PET_ACHIEVEMENTS.find((entry) => entry.id === achievementId);
    if (!achievement) return { state, ok: false, message: '没有找到这项生涯目标。' };
    const progress = getAchievementProgress(state, achievement);
    if (progress.claimed) return { state, ok: false, message: '这项生涯奖励已经领取。' };
    if (!progress.complete) return { state, ok: false, message: '这项生涯目标还没有完成。' };
    state.achievements.push(achievement.id);
    state.wallet.coins += achievement.rewardCoins;
    state.wallet.tickets += achievement.rewardTickets || 0;
    state.lastMessage = `达成“${achievement.name}”，获得 ${achievement.rewardCoins} 宠物币${achievement.rewardTickets ? `和 ${achievement.rewardTickets} 张游乐券` : ''}！`;
    return { state: savePetState(state), ok: true, message: state.lastMessage };
};

export const recordArcadeResult = (value, detail = {}) => {
    const state = normalizePetState(value);
    if (!state.adopted || state.daily.arcade >= 3 || state.job || state.exploration) return { state, ok: false, message: '' };
    state.daily.arcade += 1;
    state.stats.arcadeCheers += 1;
    state.relationship.affection += 1;
    state.relationship.growth += 1;
    applyNeeds(state, { mood: detail.victory ? 4 : 2 });
    const gameName = detail.game === 'plane' ? '飞机大战' : detail.game === 'brick' ? '超级弹球'
        : detail.game === 'rps' ? '猜拳远征' : detail.game === 'fight' ? '格斗擂台' : '小游戏';
    state.lastMessage = detail.victory ? `${gameName}打得漂亮！我也跟着激动起来了。` : `${gameName}辛苦啦，休息一下再出发。`;
    return { state: savePetState(state), ok: true, message: state.lastMessage };
};

export const mergePetCloudState = (localValue, remoteValue) => {
    const local = normalizePetState(localValue);
    const remote = normalizePetState(remoteValue);
    const localUpdatedAt = Number(localValue?.updatedAt) || 0;
    const remoteUpdatedAt = Number(remoteValue?.updatedAt) || 0;
    if (remoteUpdatedAt !== localUpdatedAt) return remoteUpdatedAt > localUpdatedAt ? remote : local;
    return remote.revision > local.revision ? remote : local;
};

export const subscribePetState = (listener) => {
    if (typeof listener !== 'function') return () => {};
    const onStorage = (event) => {
        if (event.key !== PET_STORAGE_KEY || !event.newValue) return;
        try { listener(normalizePetState(JSON.parse(event.newValue))); } catch {                                       }
    };
    const onMessage = (event) => {
        if (event.data?.type !== 'pet-state') return;
        try { listener(normalizePetState(copy(event.data.state))); } catch {                                       }
    };
    if (channel) channel.addEventListener('message', onMessage);
    window.addEventListener('storage', onStorage);
    return () => {
        if (channel) channel.removeEventListener('message', onMessage);
        window.removeEventListener('storage', onStorage);
    };
};
