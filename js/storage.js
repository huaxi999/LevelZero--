export const STORAGE_KEYS = {
    nickname: 'rosang.nickname',
    rpsStats: 'rosang.rpsStats',
    brickBestScore: 'rosang.brickBestScore',
    brickWallet: 'rosang.brickWallet',
    brickUpgrades: 'rosang.brickUpgrades',
    planeWallet: 'rosang.planeWallet',
    planeUpgrades: 'rosang.planeUpgrades',
    leaderboardPending: 'rosang.leaderboardPending',
};

export const PLANE_ATTACK_UPGRADE_MAX = 20;
export const PLANE_LIFE_UPGRADE_MAX = 20;
export const PLANE_PERMANENT_UPGRADE_MAX = 20;
export const BRICK_UPGRADE_MAX = {
    life: 1,
    paddle: 5,
    slowBall: 3,
    coinGain: 5,
    magnetRange: 4,
    reroll: 1,
};

export const getStoredNickname = () => {
    try { return localStorage.getItem(STORAGE_KEYS.nickname) || ''; }
    catch { return ''; }
};
export const setStoredNickname = (name) => localStorage.setItem(STORAGE_KEYS.nickname, name);

export const getStoredStats = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.rpsStats);
        if (!raw) return { wins: 0, losses: 0, draws: 0 };
        const parsed = JSON.parse(raw);
        return {
            wins: Number(parsed.wins) || 0,
            losses: Number(parsed.losses) || 0,
            draws: Number(parsed.draws) || 0,
        };
    } catch {
        return { wins: 0, losses: 0, draws: 0 };
    }
};

export const setStoredStats = (stats) => {
    localStorage.setItem(STORAGE_KEYS.rpsStats, JSON.stringify(stats));
};

export const getStoredBrickBestScore = () => {
    const value = Number(localStorage.getItem(STORAGE_KEYS.brickBestScore) || 0);
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
};

export const setStoredBrickBestScore = (score) => {
    const next = Math.max(0, Math.floor(Number(score) || 0));
    const current = getStoredBrickBestScore();
    if (next > current) {
        localStorage.setItem(STORAGE_KEYS.brickBestScore, String(next));
        return next;
    }
    return current;
};

export const normalizeBrickWallet = (value) => ({
    coins: Math.max(0, Math.floor(Number(value?.coins) || 0)),
});

export const normalizeBrickUpgrades = (value) => ({
    life: Math.max(0, Math.min(BRICK_UPGRADE_MAX.life, Math.floor(Number(value?.life) || 0))),
    paddle: Math.max(0, Math.min(BRICK_UPGRADE_MAX.paddle, Math.floor(Number(value?.paddle) || 0))),
    slowBall: Math.max(0, Math.min(BRICK_UPGRADE_MAX.slowBall, Math.floor(Number(value?.slowBall) || 0))),
    coinGain: Math.max(0, Math.min(BRICK_UPGRADE_MAX.coinGain, Math.floor(Number(value?.coinGain) || 0))),
    magnetRange: Math.max(0, Math.min(BRICK_UPGRADE_MAX.magnetRange, Math.floor(Number(value?.magnetRange) || 0))),
    reroll: Math.max(0, Math.min(BRICK_UPGRADE_MAX.reroll, Math.floor(Number(value?.reroll) || 0))),
});

export const getStoredBrickWallet = () => {
    try {
        return normalizeBrickWallet(JSON.parse(localStorage.getItem(STORAGE_KEYS.brickWallet) || '{}'));
    } catch {
        return normalizeBrickWallet({});
    }
};

export const setStoredBrickWallet = (wallet) => {
    const normalized = normalizeBrickWallet(wallet);
    localStorage.setItem(STORAGE_KEYS.brickWallet, JSON.stringify(normalized));
    return normalized;
};

export const getStoredBrickUpgrades = () => {
    try {
        return normalizeBrickUpgrades(JSON.parse(localStorage.getItem(STORAGE_KEYS.brickUpgrades) || '{}'));
    } catch {
        return normalizeBrickUpgrades({});
    }
};

export const setStoredBrickUpgrades = (upgrades) => {
    const normalized = normalizeBrickUpgrades(upgrades);
    localStorage.setItem(STORAGE_KEYS.brickUpgrades, JSON.stringify(normalized));
    return normalized;
};

export const normalizePlaneWallet = (value) => ({
    coins: Math.max(0, Math.floor(Number(value?.coins) || 0)),
    diamonds: Math.max(0, Math.floor(Number(value?.diamonds) || 0)),
});

export const normalizePlaneUpgrades = (value) => ({
    attackLevel: Math.max(0, Math.min(PLANE_ATTACK_UPGRADE_MAX, Math.floor(Number(value?.attackLevel) || 0))),
    lifeLevel: Math.max(0, Math.min(PLANE_LIFE_UPGRADE_MAX, Math.floor(Number(value?.lifeLevel) || 0))),
    fireRateLevel: Math.max(0, Math.min(PLANE_PERMANENT_UPGRADE_MAX, Math.floor(Number(value?.fireRateLevel) || 0))),
    engineLevel: Math.max(0, Math.min(PLANE_PERMANENT_UPGRADE_MAX, Math.floor(Number(value?.engineLevel) || 0))),
    magnetLevel: Math.max(0, Math.min(PLANE_PERMANENT_UPGRADE_MAX, Math.floor(Number(value?.magnetLevel) || 0))),
    droneLevel: Math.max(0, Math.min(PLANE_PERMANENT_UPGRADE_MAX, Math.floor(Number(value?.droneLevel) || 0))),
    bombLevel: Math.max(0, Math.min(PLANE_PERMANENT_UPGRADE_MAX, Math.floor(Number(value?.bombLevel) || 0))),
    rewardLevel: Math.max(0, Math.min(PLANE_PERMANENT_UPGRADE_MAX, Math.floor(Number(value?.rewardLevel) || 0))),
    maxStageUnlocked: Math.max(1, Math.min(20, Math.floor(Number(value?.maxStageUnlocked) || 1))),
});

export const getStoredPlaneWallet = () => {
    try {
        return normalizePlaneWallet(JSON.parse(localStorage.getItem(STORAGE_KEYS.planeWallet) || '{}'));
    } catch {
        return normalizePlaneWallet({});
    }
};

export const setStoredPlaneWallet = (wallet) => {
    const normalized = normalizePlaneWallet(wallet);
    localStorage.setItem(STORAGE_KEYS.planeWallet, JSON.stringify(normalized));
    return normalized;
};

export const getStoredPlaneUpgrades = () => {
    try {
        return normalizePlaneUpgrades(JSON.parse(localStorage.getItem(STORAGE_KEYS.planeUpgrades) || '{}'));
    } catch {
        return normalizePlaneUpgrades({});
    }
};

export const setStoredPlaneUpgrades = (upgrades) => {
    const normalized = normalizePlaneUpgrades(upgrades);
    localStorage.setItem(STORAGE_KEYS.planeUpgrades, JSON.stringify(normalized));
    return normalized;
};

const isPendingScoreMap = (value) => !!value && typeof value === 'object' && !Array.isArray(value);

const readPendingLeaderboardQueue = () => {
    const empty = { version: 2, guest: {}, accounts: {}, legacy: {} };
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.leaderboardPending);
        if (!raw) return empty;
        const parsed = JSON.parse(raw);
        if (!isPendingScoreMap(parsed)) return empty;
        if (parsed.version !== 2) {
            return { ...empty, legacy: parsed };
        }
        return {
            version: 2,
            guest: isPendingScoreMap(parsed.guest) ? parsed.guest : {},
            accounts: isPendingScoreMap(parsed.accounts) ? parsed.accounts : {},
            legacy: isPendingScoreMap(parsed.legacy) ? parsed.legacy : {},
        };
    } catch {
        return empty;
    }
};

const pendingScoresForAccount = (queue, userId) => {
    if (!userId) return queue.guest;
    return Object.hasOwn(queue.accounts, userId) && isPendingScoreMap(queue.accounts[userId]) ? queue.accounts[userId] : {};
};

const writePendingLeaderboardQueue = (queue) => {
    localStorage.setItem(STORAGE_KEYS.leaderboardPending, JSON.stringify(queue));
};

export const getPendingLeaderboardScores = (userId = null) => pendingScoresForAccount(readPendingLeaderboardQueue(), userId);

export const setPendingLeaderboardScores = (value, userId = null) => {
    const queue = readPendingLeaderboardQueue();
    const scores = isPendingScoreMap(value) ? value : {};
    if (userId) queue.accounts = { ...queue.accounts, [userId]: scores };
    else queue.guest = scores;
    writePendingLeaderboardQueue(queue);
};

export const upsertPendingLeaderboardScore = (game, score, meta = {}, playerName = getStoredNickname() || '玩家', userId = null) => {
    const gameKey = String(game || '').trim();
    if (!['plane', 'brick'].includes(gameKey)) return;
    const nextScore = Math.max(0, Math.floor(Number(score) || 0));
    if (!Number.isSafeInteger(nextScore) || nextScore <= 0) return;
    const pending = getPendingLeaderboardScores(userId);
    const current = pending[gameKey];
    if (!current || nextScore >= (Number(current.score) || 0)) {
        pending[gameKey] = {
            game: gameKey,
            score: nextScore,
            playerName: String(playerName || '玩家').trim().slice(0, 12) || '玩家',
            meta: meta && typeof meta === 'object' ? meta : {},
            updatedAt: new Date().toISOString(),
        };
        setPendingLeaderboardScores(pending, userId);
    }
};

export const removePendingLeaderboardScore = (game, submittedScore, userId = null) => {
    const gameKey = String(game || '').trim();
    if (!gameKey) return;
    const pending = getPendingLeaderboardScores(userId);
    if (pending[gameKey] && Number.isFinite(submittedScore) && Number(pending[gameKey].score) <= submittedScore) {
        delete pending[gameKey];
        setPendingLeaderboardScores(pending, userId);
    }
};

export const claimGuestLeaderboardScores = (userId) => {
    if (typeof userId !== 'string' || !userId) return;
    const queue = readPendingLeaderboardQueue();
    if (Object.keys(queue.guest).length === 0) return;
    const account = pendingScoresForAccount(queue, userId);
    for (const [game, entry] of Object.entries(queue.guest)) {
        if (!['plane', 'brick'].includes(game) || entry?.game !== game || !Number.isSafeInteger(entry.score) || entry.score <= 0) continue;
        if (!account[game] || entry.score >= (Number(account[game].score) || 0)) account[game] = entry;
        delete queue.guest[game];
    }
    queue.accounts = { ...queue.accounts, [userId]: account };
    writePendingLeaderboardQueue(queue);
};
