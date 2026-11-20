import {
    ATTRIBUTE_LABELS,
    ITEM_CATEGORY_LABELS,
    PET_ACHIEVEMENTS,
    PET_DAILY_TASKS,
    PET_DIALOGUES,
    PET_COMPETITIONS,
    PET_COMPETITION_DIVISIONS,
    PET_COMPETITION_STRATEGIES,
    PET_COLLECTIONS,
    PET_EXPLORATIONS,
    PET_ITEMS,
    PET_ITEMS_BY_ID,
    PET_JOBS,
    PET_JOB_DURATIONS,
    PET_PLAYGROUND_GAMES,
    PET_SPECIES,
    PET_SPECIES_BY_ID,
    PET_STORY_EVENTS,
    PET_TRAINING,
    PET_WEEKLY_TASKS,
} from './pet-data.js';
import {
    PET_ACTIONS,
    buyPetItem,
    claimDailyTask,
    claimPetAchievement,
    claimPetExploration,
    claimPetJob,
    claimWeeklyTask,
    completePlaygroundGame,
    createPet,
    adoptAdditionalPet,
    enterPetCompetition,
    getAdditionalAdoptionCost,
    getAchievementProgress,
    getCompetitionRank,
    getJobMastery,
    getPetGrowthProgress,
    getPetAilment,
    getPetLevel,
    getPetTalent,
    getEffectiveAttributes,
    getPetPersonality,
    loadPetState,
    normalizePetState,
    simulatePetState,
    restorePetCloudState,
    performPetAction,
    previewPetCompetition,
    recordArcadeResult,
    recallPetExploration,
    resolvePetStoryEvent,
    savePetState,
    startPetJob,
    startPetExploration,
    switchActivePet,
    subscribePetState,
    trainPet,
    usePetItem,
} from './pet-storage.js';
import { createPetCloudSync } from './pet-cloud-sync.js';
import { acquirePetWriter } from './pet-writer.js';

const NEED_LABELS = { satiety: '饱腹', cleanliness: '清洁', mood: '心情', energy: '体力', health: '健康' };
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const DEFAULT_ROOM_BACKGROUND = 'assets/fighters/background/fighterbackground9-qingchen.png';
const MEMORY_SYMBOLS = ['星', '月', '云', '叶', '光', '晶'];

const formatAge = (birthAt) => {
    const age = Math.max(0, Date.now() - birthAt);
    if (age < HOUR) return `${Math.max(1, Math.floor(age / 60000))} 分钟`;
    if (age < DAY) return `${Math.floor(age / HOUR)} 小时`;
    return `${Math.floor(age / DAY)} 天`;
};

const formatOffline = (milliseconds) => {
    if (milliseconds < 5 * 60000) return '';
    const hours = milliseconds / HOUR;
    if (milliseconds > DAY) return `离线 ${Math.floor(hours)} 小时，仅结算最近 24 小时。`;
    if (hours >= 1) return `离线 ${hours.toFixed(hours >= 10 ? 0 : 1)} 小时，状态已按真实时间结算。`;
    return `离线 ${Math.floor(milliseconds / 60000)} 分钟，状态已更新。`;
};

const formatStreakReward = (reward) => reward
    ? `连续相伴第 ${reward.days} 天，领取 ${reward.rewardCoins} 宠物币${reward.rewardTickets ? `和 ${reward.rewardTickets} 张游乐券` : ''}。`
    : '';

const formatRemaining = (milliseconds) => {
    const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
    if (seconds < 60) return `${seconds} 秒`;
    const minutes = Math.floor(seconds / 60);
    const remainSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}:${String(remainSeconds).padStart(2, '0')}`;
    const hours = Math.floor(minutes / 60);
    return `${hours} 小时 ${minutes % 60} 分`;
};

const createElement = (html) => {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstElementChild;
};
const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

export const calculatePetPlaygroundScore = (game, position) => {
    if (!game || !Array.isArray(game.target) || game.target.length !== 2) return 0;
    const safePosition = Math.max(0, Math.min(100, Number(position) || 0));
    const center = (game.target[0] + game.target[1]) / 2;
    const halfWidth = Math.max(1, (game.target[1] - game.target[0]) / 2);
    const distance = Math.abs(safePosition - center);
    return distance <= halfWidth
        ? Math.round(100 - (distance / halfWidth) * 30)
        : Math.max(0, Math.round(60 - (distance - halfWidth) * 2.2));
};

export const averagePetPlaygroundScores = (scores) => {
    const valid = Array.isArray(scores) ? scores.map(Number).filter(Number.isFinite) : [];
    return valid.length ? Math.round(valid.reduce((sum, score) => sum + score, 0) / valid.length) : 0;
};

export const createPetMemorySequence = (length, random = Math.random) => {
    const sequence = [];
    const safeLength = Math.max(1, Math.min(8, Math.floor(Number(length) || 1)));
    for (let index = 0; index < safeLength; index += 1) {
        let value = Math.floor(Math.max(0, Math.min(0.999999, Number(random()) || 0)) * MEMORY_SYMBOLS.length);
        if (value === sequence[sequence.length - 1]) value = (value + 1) % MEMORY_SYMBOLS.length;
        sequence.push(value);
    }
    return sequence;
};

export const calculatePetMemoryScore = (sequence, input, elapsedMs = 0) => {
    const expected = Array.isArray(sequence) ? sequence : [];
    const actual = Array.isArray(input) ? input : [];
    if (!expected.length) return 0;
    let correct = 0;
    while (correct < actual.length && correct < expected.length && actual[correct] === expected[correct]) correct += 1;
    if (correct === expected.length && actual.length === expected.length) {
        return Math.max(70, 100 - Math.floor(Math.max(0, Number(elapsedMs) || 0) / 700) * 2);
    }
    return Math.max(0, Math.round((correct / expected.length) * 60));
};

export const initPetGame = ({ showSection, cloudSync } = {}) => {
    const section = document.getElementById('pet');
    const adoption = document.getElementById('pet-adoption');
    const game = document.getElementById('pet-game');
    const form = document.getElementById('pet-adopt-form');
    const nameInput = document.getElementById('pet-name-input');
    const adoptionTip = document.getElementById('pet-adoption-tip');
    const adoptionImage = document.getElementById('pet-adoption-image');
    const adoptionSpecies = document.getElementById('pet-adoption-species');
    const adoptionDescription = document.getElementById('pet-adoption-description');
    const adoptionTrait = document.getElementById('pet-adoption-trait');
    const speciesGrid = document.getElementById('pet-species-grid');
    const speciesPreviewValues = {
        strength: document.getElementById('pet-adoption-strength'),
        intelligence: document.getElementById('pet-adoption-intelligence'),
        charm: document.getElementById('pet-adoption-charm'),
    };
    const avatar = document.getElementById('pet-avatar');
    const avatarImage = document.getElementById('pet-avatar-image');
    const outfitBadge = document.getElementById('pet-outfit-badge');
    const room = document.querySelector('.pet-room');
    const petName = document.getElementById('pet-display-name');
    const petSpeciesName = document.getElementById('pet-species-name');
    const stage = document.getElementById('pet-stage');
    const condition = document.getElementById('pet-condition');
    const age = document.getElementById('pet-age');
    const coins = document.getElementById('pet-coins');
    const tickets = document.getElementById('pet-tickets');
    const loginStreak = document.getElementById('pet-login-streak');
    const syncState = document.getElementById('pet-sync-state');
    const affection = document.getElementById('pet-affection');
    const growth = document.getElementById('pet-growth');
    const level = document.getElementById('pet-level');
    const leagueRank = document.getElementById('pet-league-rank');
    const attributeElements = {
        strength: document.getElementById('pet-strength'),
        intelligence: document.getElementById('pet-intelligence'),
        charm: document.getElementById('pet-charm'),
    };
    const personality = document.getElementById('pet-personality');
    const talentName = document.getElementById('pet-talent');
    const storyCard = document.getElementById('pet-story-card');
    const bubble = document.getElementById('pet-bubble');
    const eventText = document.getElementById('pet-event-text');
    const actionButtons = Array.from(document.querySelectorAll('[data-pet-action]'));
    const needItems = Array.from(document.querySelectorAll('[data-pet-need]'));
    const viewButtons = Array.from(document.querySelectorAll('[data-pet-view-target]'));
    const views = Array.from(document.querySelectorAll('[data-pet-view]'));
    const nextAction = document.getElementById('pet-next-action');
    const nextIcon = document.getElementById('pet-next-icon');
    const nextTitle = document.getElementById('pet-next-title');
    const nextCopy = document.getElementById('pet-next-copy');
    const nextButton = document.getElementById('pet-next-button');
    const dailyList = document.getElementById('pet-daily-list');
    const trainingGrid = document.getElementById('pet-training-grid');
    const jobDuration = document.getElementById('pet-job-duration');
    const currentJob = document.getElementById('pet-current-job');
    const jobGrid = document.getElementById('pet-job-grid');
    const explorationSummary = document.getElementById('pet-exploration-summary');
    const currentExploration = document.getElementById('pet-current-exploration');
    const explorationGrid = document.getElementById('pet-exploration-grid');
    const weeklyCount = document.getElementById('pet-weekly-count');
    const weeklyList = document.getElementById('pet-weekly-list');
    const collectionCount = document.getElementById('pet-collection-count');
    const collectionGrid = document.getElementById('pet-collection-grid');
    const playgroundGrid = document.getElementById('pet-playground-grid');
    const playgroundArena = document.getElementById('pet-playground-arena');
    const arenaTitle = document.getElementById('pet-arena-title');
    const arenaStatus = document.getElementById('pet-arena-status');
    const arenaScene = document.getElementById('pet-mini-scene');
    const memoryBoard = document.getElementById('pet-memory-board');
    const arenaAvatar = document.getElementById('pet-arena-avatar');
    const arenaScore = document.getElementById('pet-arena-score');
    const arenaCopy = document.getElementById('pet-arena-copy');
    const arenaRounds = Array.from(document.querySelectorAll('[data-pet-round]'));
    const timingTarget = document.getElementById('pet-timing-target');
    const timingMarker = document.getElementById('pet-timing-marker');
    const arenaAction = document.getElementById('pet-arena-action');
    const shopTabs = document.getElementById('pet-shop-tabs');
    const shopGrid = document.getElementById('pet-shop-grid');
    const inventoryGrid = document.getElementById('pet-inventory-grid');
    const competitionSummary = document.getElementById('pet-competition-summary');
    const competitionTypes = document.getElementById('pet-competition-types');
    const competitionDivisions = document.getElementById('pet-competition-divisions');
    const competitionResult = document.getElementById('pet-competition-result');
    const competitionStage = document.getElementById('pet-competition-stage');
    const competitionHistory = document.getElementById('pet-competition-history');
    const rosterCapacity = document.getElementById('pet-roster-capacity');
    const growthPanel = document.getElementById('pet-growth-panel');
    const ownedRoster = document.getElementById('pet-owned-roster');
    const rosterCatalog = document.getElementById('pet-roster-catalog');
    const achievementCount = document.getElementById('pet-achievement-count');
    const achievementGrid = document.getElementById('pet-achievement-grid');
    const soundToggle = document.getElementById('pet-sound-toggle');
    const widgetToggle = document.getElementById('pet-widget-toggle');
    const widget = document.getElementById('pet-widget');
    const widgetShell = document.getElementById('pet-widget-shell');
    const widgetAvatar = document.getElementById('pet-widget-avatar');
    const widgetName = document.getElementById('pet-widget-name');
    const widgetBubble = document.getElementById('pet-widget-bubble');
    const widgetStatusTitle = document.getElementById('pet-widget-status-title');
    const widgetStatusStage = document.getElementById('pet-widget-status-stage');
    const widgetStatusCoins = document.getElementById('pet-widget-status-coins');
    const widgetStatusTickets = document.getElementById('pet-widget-status-tickets');
    const widgetNeedItems = Array.from(document.querySelectorAll('[data-pet-widget-need]'));
    const widgetMenu = document.getElementById('pet-widget-menu');
    const widgetClose = document.getElementById('pet-widget-close');
    const widgetRoam = document.getElementById('pet-widget-roam');
    const widgetHome = document.getElementById('pet-widget-home');
    const widgetAlert = document.getElementById('pet-widget-alert');

    if (!section || !widget) return { render() {}, resize() {}, pause() {}, resume() {}, syncCloud() {} };

    let initialError = '';
    let loadResult;
    try { loadResult = loadPetState(); }
    catch (error) { initialError = error.message; loadResult = { state: normalizePetState(null), elapsedMs: 0 }; }
    let state = loadResult.state;
    let pendingOfflineMessage = [formatStreakReward(loadResult.streakReward), formatOffline(loadResult.elapsedMs)].filter(Boolean).join(' ');
    let selectedSpeciesId = state.adopted ? state.species : PET_SPECIES[0].id;
    let activeView = 'home';
    let selectedShopCategory = 'food';
    let selectedPlaygroundId = PET_PLAYGROUND_GAMES[0].id;
    let selectedCompetitionId = PET_COMPETITIONS[0].id;
    let selectedDivisionId = PET_COMPETITION_DIVISIONS[0].id;
    let competitionDraft = null;
    let playgroundRun = null;
    let playgroundScores = [];
    let active = false;
    let actionTimer = null;
    let cloudSaveTimer = null;
    let writerOwned = false;
    let writerLease = null;
    let writerAcquisition = null;
    let writerEpoch = 0;
    let storageError = initialError;
    let dragging = null;
    let suppressWidgetClick = false;
    let audioContext = null;
    let dialogueIndex = 0;
    let lastDialogue = '';
    let lastWidgetHoverAt = 0;

    const setMessage = (message, action = '') => {
        const text = message || state.lastMessage || '我在听。';
        if (bubble) bubble.textContent = text;
        if (widgetBubble) widgetBubble.textContent = text;
        if (eventText) eventText.textContent = text;
        if (!action) return;
        avatar?.setAttribute('data-action', action);
        widgetAvatar?.setAttribute('data-action', action);
        clearTimeout(actionTimer);
        actionTimer = setTimeout(() => {
            avatar?.removeAttribute('data-action');
            widgetAvatar?.removeAttribute('data-action');
        }, 1100);
    };

    const playTone = (kind = 'action') => {
        const AudioEngine = window.AudioContext || window.webkitAudioContext;
        if (!state.settings.sound || typeof AudioEngine !== 'function') return;
        try {
            audioContext ||= new AudioEngine();
            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();
            oscillator.type = kind === 'win' ? 'triangle' : kind === 'loss' ? 'sine' : 'square';
            oscillator.frequency.value = kind === 'win' ? 660 : kind === 'loss' ? 190 : 360;
            gain.gain.setValueAtTime(0.035, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.16);
            oscillator.connect(gain).connect(audioContext.destination);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.17);
        } catch {                                                        }
    };

    const storageNotice = document.createElement('div');
    storageNotice.className = 'pet-empty-state hidden';
    storageNotice.setAttribute('role', 'alert');
    const storageNoticeText = document.createElement('span');
    const retryStorage = document.createElement('button');
    retryStorage.type = 'button';
    retryStorage.className = 'btn btn-secondary';
    retryStorage.textContent = '重试读取 / 同步';
    storageNotice.append(storageNoticeText, retryStorage);
    section.insertBefore(storageNotice, adoption);
    const showStorageNotice = (message = '') => {
        storageNoticeText.textContent = message;
        storageNotice.classList.toggle('hidden', !message);
        if (message) setMessage(message);
    };
    const cloudController = createPetCloudSync({
        cloudSync,
        getState: () => state,
        canWrite: () => writerOwned && !storageError,
        restore(remote, userId) {
            state = restorePetCloudState(remote, state, userId);
            cancelPlaygroundRun();
            competitionDraft = null;
            render('已恢复云端伙伴存档。');
        },
        markAccount(userId) { state = savePetState({ ...state, cloudUserId: userId }, { touch: false }); },
        onStatus(label, message) {
            if (syncState) syncState.textContent = label;
            if (message) showStorageNotice(message);
            else if (!storageError && writerOwned) showStorageNotice();
        },
    });
    const syncCloudState = () => cloudController.sync();
    const queueCloudSave = () => {
        if (!state.adopted || !writerOwned || storageError) return;
        clearTimeout(cloudSaveTimer);
        cloudSaveTimer = setTimeout(syncCloudState, 1200);
    };

    const renderSpeciesPicker = () => {
        if (!speciesGrid) return;
        speciesGrid.replaceChildren(...PET_SPECIES.map((species, index) => createElement(`
            <button class="pet-species-option ${species.id === selectedSpeciesId ? 'active' : ''}" type="button"
                data-pet-species="${species.id}" role="radio" aria-checked="${species.id === selectedSpeciesId}">
                <span class="pet-species-number">${String(index + 1).padStart(2, '0')}</span>
                <img src="${species.image}" alt="">
                <strong>${species.name}</strong>
            </button>
        `)));
    };

    const renderSpeciesPreview = () => {
        const species = PET_SPECIES_BY_ID[selectedSpeciesId] || PET_SPECIES[0];
        if (adoptionImage) adoptionImage.src = species.image;
        if (adoptionSpecies) adoptionSpecies.textContent = species.name;
        if (adoptionDescription) adoptionDescription.textContent = `${species.description} 天赋“${species.talent.name}”：${species.talent.description}。`;
        if (adoptionTrait) adoptionTrait.textContent = species.trait;
        Object.entries(speciesPreviewValues).forEach(([key, element]) => { if (element) element.textContent = String(species.attributes[key]); });
        section.style.setProperty('--pet-species-accent', species.accent);
        renderSpeciesPicker();
    };

    const getLowestNeed = () => Object.entries(state.needs).sort((a, b) => a[1] - b[1])[0];
    const getMoodClass = () => {
        const [, lowest] = getLowestNeed();
        if (state.needs.health < 35) return 'unwell';
        if (lowest < 25) return 'needs-care';
        if (state.needs.mood > 78) return 'happy';
        return 'calm';
    };

    const getActionableState = () => {
        const dailyReady = PET_DAILY_TASKS.filter((task) => !state.daily.claimed.includes(task.id) && (state.daily[task.field] || 0) >= task.target).length;
        const weeklyReady = PET_WEEKLY_TASKS.filter((task) => !state.weekly.claimed.includes(task.id) && (state.weekly[task.field] || 0) >= task.target).length;
        const achievementsReady = PET_ACHIEVEMENTS.filter((achievement) => {
            const progress = getAchievementProgress(state, achievement);
            return progress.complete && !progress.claimed;
        }).length;
        const lowNeeds = Object.entries(state.needs).filter(([, value]) => Number(value) < 35);
        return {
            dailyReady,
            weeklyReady,
            achievementsReady,
            lowNeeds,
            jobReady: state.job?.status === 'ready' ? 1 : 0,
            explorationReady: state.exploration?.status === 'ready' ? 1 : 0,
            storyReady: state.story.pending ? 1 : 0,
        };
    };

    const renderNextAction = () => {
        if (!nextAction || !nextButton) return;
        const actionable = getActionableState();
        const ailment = getPetAilment(state);
        const [lowestNeed, lowestValue] = getLowestNeed();
        let guidance;
        if (ailment) {
            guidance = { tone: 'danger', icon: '♥', title: `${ailment.name}需要处理`, copy: ailment.description, label: '查看药品', view: 'shop', category: 'medicine' };
        } else if (state.job?.status === 'ready') {
            guidance = { tone: 'reward', icon: '币', title: '打工班次已经结束', copy: '报酬和职业熟练度正在等待领取。', label: '领取报酬', view: 'jobs' };
        } else if (state.exploration?.status === 'ready') {
            guidance = { tone: 'reward', icon: '途', title: '伙伴带着见闻回来了', copy: '领取探索奖励，并查看是否发现了新纪念物。', label: '领取见闻', view: 'exploration' };
        } else if (state.job) {
            guidance = { tone: 'calm', icon: '工', title: '伙伴正在认真打工', copy: `班次剩余 ${formatRemaining(state.job.endsAt - Date.now())}。`, label: '查看班次', view: 'jobs' };
        } else if (state.exploration) {
            guidance = { tone: 'calm', icon: '途', title: `正在探索${PET_EXPLORATIONS.find((route) => route.id === state.exploration.routeId)?.name || '街区'}`, copy: `预计剩余 ${formatRemaining(state.exploration.endsAt - Date.now())}。`, label: '查看行程', view: 'exploration' };
        } else if (state.needs.health < 35) {
            guidance = { tone: 'danger', icon: '♥', title: '健康状态偏低', copy: '先使用药品恢复健康，再安排训练或比赛。', label: '查看药品', view: 'shop', category: 'medicine' };
        } else if (lowestValue < 35) {
            guidance = { tone: 'warning', icon: lowestNeed === 'energy' ? '⚡' : lowestNeed === 'mood' ? '♪' : lowestNeed === 'cleanliness' ? '✦' : '◆', title: `${NEED_LABELS[lowestNeed]}需要照顾`, copy: `当前 ${Math.round(lowestValue)}/100，恢复状态后活动表现会更稳定。`, label: '回到小屋', view: 'home' };
        } else if (state.story.pending) {
            const event = PET_STORY_EVENTS.find((entry) => entry.id === state.story.pending.eventId);
            guidance = { tone: 'reward', icon: '事', title: event?.title || '街区有新鲜事', copy: event?.description || '伙伴正在等你一起作出选择。', label: '处理事件', view: 'home' };
        } else if (actionable.dailyReady) {
            guidance = { tone: 'reward', icon: '日', title: `${actionable.dailyReady} 项今日奖励可领取`, copy: '完成的今日清单已经结算，可以领取宠物币和游乐券。', label: '领取奖励', view: 'home' };
        } else if (actionable.weeklyReady) {
            guidance = { tone: 'reward', icon: '周', title: `${actionable.weeklyReady} 项周常委托可领取`, copy: '本周积累已经达到目标。', label: '领取周常', view: 'exploration' };
        } else if (actionable.achievementsReady) {
            guidance = { tone: 'reward', icon: '成', title: `${actionable.achievementsReady} 项生涯成就已达成`, copy: '前往伙伴名册领取长期培养奖励。', label: '查看成就', view: 'roster' };
        } else {
            const progress = getPetGrowthProgress(state);
            guidance = progress.next
                ? { tone: 'calm', icon: '育', title: `向${progress.next.id}成长`, copy: `还需 ${progress.growthNeeded} 成长值、${progress.daysNeeded} 天。`, label: '能力训练', view: 'training' }
                : { tone: 'calm', icon: '赛', title: '继续书写伙伴生涯', copy: `今日还有 ${state.competition.entriesLeft} 次比拼机会。`, label: '前往比拼馆', view: 'competition' };
        }
        nextAction.dataset.tone = guidance.tone;
        if (nextIcon) nextIcon.textContent = guidance.icon;
        if (nextTitle) nextTitle.textContent = guidance.title;
        if (nextCopy) nextCopy.textContent = guidance.copy;
        nextButton.textContent = guidance.label;
        nextButton.dataset.targetView = guidance.view;
        if (guidance.category) nextButton.dataset.shopCategory = guidance.category;
        else delete nextButton.dataset.shopCategory;

        const badges = {
            home: actionable.dailyReady + actionable.storyReady,
            jobs: actionable.jobReady,
            exploration: actionable.explorationReady + actionable.weeklyReady,
            roster: actionable.achievementsReady,
            shop: ailment || state.needs.health < 35 ? 1 : 0,
        };
        viewButtons.forEach((button) => {
            const count = badges[button.dataset.petViewTarget] || 0;
            const baseLabel = button.dataset.baseLabel || button.textContent.trim();
            button.dataset.baseLabel = baseLabel;
            if (count) button.dataset.badge = count > 9 ? '9+' : String(count);
            else delete button.dataset.badge;
            button.setAttribute('aria-label', count ? `${baseLabel}，${count} 项待处理` : baseLabel);
        });
    };

    const getContextDialogue = () => {
        const event = PET_STORY_EVENTS.find((entry) => entry.id === state.story.pending?.eventId);
        if (event) return `${event.title}，你觉得我们该怎么做？`;
        const ailment = getPetAilment(state);
        if (ailment) return `${ailment.name}还没有恢复，今天先好好照顾我吧。`;
        if (state.job?.status === 'ready') return '班次结束啦，我把今天发生的事都记住了。快来听我讲。';
        if (state.job) return '我正在认真工作，结束后第一时间回来找你。';
        if (state.exploration?.status === 'ready') return '我从旅行中回来啦，背包里好像多了点东西。';
        if (state.exploration) {
            const route = PET_EXPLORATIONS.find((entry) => entry.id === state.exploration.routeId);
            return `我正在${route?.name || '街区'}探索，沿途见闻回去再讲给你听。`;
        }
        const [lowestNeed, lowestValue] = getLowestNeed();
        if (lowestValue < 35) return chooseDialogue(PET_DIALOGUES.needs[lowestNeed]);
        const hour = new Date().getHours();
        const timeKey = hour < 6 ? 'night' : hour < 11 ? 'morning' : hour < 18 ? 'afternoon' : hour < 23 ? 'evening' : 'night';
        const moodKey = state.needs.mood >= 76 ? 'happy' : 'calm';
        const generalLines = PET_DIALOGUES.general.filter((line) =>
            (!line.includes('{friends}') || state.roster.owned.length > 1)
            && (!line.includes('{wins}') || state.competition.wins > 0)
        );
        return chooseDialogue([
            ...(PET_DIALOGUES.time[timeKey] || []),
            ...(PET_DIALOGUES.mood[moodKey] || []),
            ...(PET_DIALOGUES.stage[state.stage] || []),
            ...(PET_DIALOGUES.species[state.species] || []),
            ...generalLines,
        ]);
    };

    const formatDialogue = (line) => String(line || '')
        .replaceAll('{name}', state.name)
        .replaceAll('{days}', String(state.loginStreak.current))
        .replaceAll('{personality}', getPetPersonality(state))
        .replaceAll('{stage}', state.stage)
        .replaceAll('{talent}', getPetTalent(state).name)
        .replaceAll('{friends}', String(Math.max(0, state.roster.owned.length - 1)))
        .replaceAll('{wins}', String(state.competition.wins));

    function chooseDialogue(lines) {
        const choices = (Array.isArray(lines) ? lines : []).map(formatDialogue).filter(Boolean);
        if (!choices.length) return '我在听。';
        let line = choices[dialogueIndex % choices.length];
        dialogueIndex += 1;
        if (line === lastDialogue && choices.length > 1) {
            line = choices[dialogueIndex % choices.length];
            dialogueIndex += 1;
        }
        lastDialogue = line;
        return line;
    }

    const getInteractionDialogue = (kind) => chooseDialogue(PET_DIALOGUES.interaction[kind] || PET_DIALOGUES.general);

    const placeWidget = () => {
        if (!widgetShell) return;
        const maxX = Math.max(12, window.innerWidth - widgetShell.offsetWidth - 12);
        const maxBottom = Math.max(10, window.innerHeight - widgetShell.offsetHeight - 12);
        const savedX = state.settings.widgetX;
        const savedY = state.settings.widgetY;
        const x = savedX !== null && Number.isFinite(Number(savedX)) ? Math.max(12, Math.min(maxX, Number(savedX))) : maxX;
        const bottom = savedY !== null && Number.isFinite(Number(savedY)) ? Math.max(10, Math.min(maxBottom, Number(savedY))) : 10;
        widget.style.setProperty('--pet-widget-x', `${x}px`);
        widget.style.setProperty('--pet-widget-bottom', `${bottom}px`);
    };

    const updateWidgetVisibility = () => {
        const mainPage = document.getElementById('main-page');
        const mainPageVisible = !mainPage?.classList.contains('hidden');
        const visible = state.adopted && state.settings.widgetVisible && mainPageVisible && mainPage?.dataset.activeSection === 'home';
        const wasHidden = widget.classList.contains('hidden');
        widget.classList.toggle('hidden', !visible);
        widget.setAttribute('aria-hidden', visible ? 'false' : 'true');
        if (!visible) {
            widgetMenu?.classList.add('hidden');
            widget.classList.remove('menu-open');
            widgetShell?.setAttribute('aria-expanded', 'false');
        }
        if (visible && wasHidden) requestAnimationFrame(placeWidget);
    };

    const switchView = (viewId) => {
        activeView = views.some((view) => view.dataset.petView === viewId) ? viewId : 'home';
        views.forEach((view) => view.classList.toggle('hidden', view.dataset.petView !== activeView));
        viewButtons.forEach((button) => {
            const selected = button.dataset.petViewTarget === activeView;
            button.classList.toggle('active', selected);
            if (selected) button.setAttribute('aria-current', 'page');
            else button.removeAttribute('aria-current');
        });
        if (activeView !== 'playground') cancelPlaygroundRun();
        if (activeView !== 'competition' && competitionDraft) {
            competitionDraft = null;
            renderCompetition();
        }
    };

    const updateBasicCooldowns = () => {
        const now = Date.now();
        actionButtons.forEach((button) => {
            const actionId = button.dataset.petAction;
            const remaining = Math.max(0, Math.ceil(((Number(state.lastActions[actionId]) || 0) - now) / 1000));
            button.disabled = remaining > 0 || !state.adopted || Boolean(state.job || state.exploration);
            const label = PET_ACTIONS[actionId]?.label || actionId;
            const labelNode = button.querySelector('[data-action-label]');
            if (labelNode) labelNode.textContent = remaining ? `${remaining}s` : label;
            if (button.closest('#pet-widget-menu')) {
                button.dataset.cooldown = remaining ? String(remaining) : '';
                button.title = remaining ? `${label}（${remaining} 秒后可用）` : label;
            }
            button.setAttribute('aria-label', remaining ? `${label}，${remaining} 秒后可用` : label);
        });
    };

    const renderDaily = () => {
        if (!dailyList) return;
        dailyList.replaceChildren(...PET_DAILY_TASKS.map((task) => {
            const progress = Math.min(task.target, state.daily[task.field] || 0);
            const claimed = state.daily.claimed.includes(task.id);
            const ready = progress >= task.target && !claimed;
            return createElement(`
                <button class="pet-daily-task ${ready ? 'ready' : ''}" type="button" data-pet-task="${task.id}" ${claimed || !ready ? 'disabled' : ''}>
                    <span>${claimed ? '已领' : `${progress}/${task.target}`}</span>
                    <strong>${task.label}</strong>
                    <small>${task.rewardCoins} 币${task.rewardTickets ? ` + ${task.rewardTickets} 券` : ''}</small>
                </button>
            `);
        }));
    };

    const renderStory = () => {
        if (!storyCard) return;
        const event = PET_STORY_EVENTS.find((entry) => entry.id === state.story.pending?.eventId);
        if (!event) {
            const remaining = Math.max(0, state.story.nextAt - Date.now());
            const latest = state.story.history[0];
            const latestEvent = PET_STORY_EVENTS.find((entry) => entry.id === latest?.eventId);
            const latestOption = latestEvent?.options.find((option) => option.id === latest?.optionId);
            storyCard.className = 'pet-story-card quiet';
            storyCard.innerHTML = `<div><span>街区动态</span><strong>${latestEvent ? `上次：${latestEvent.title}` : '附近暂时很平静'}</strong><small>${latestOption ? `选择了“${latestOption.label}” · ` : ''}${remaining ? `预计 ${formatRemaining(remaining)} 后会有新鲜事` : '新的街区消息正在路上'}</small></div>`;
            return;
        }
        storyCard.className = 'pet-story-card pending';
        storyCard.innerHTML = `
            <div class="pet-story-copy"><span>街区事件</span><strong>${event.title}</strong><small>${event.description}</small></div>
            <div class="pet-story-options">${event.options.map((option) => `<button type="button" data-pet-story-option="${option.id}" ${state.job || state.exploration ? 'disabled' : ''}>${option.label}</button>`).join('')}</div>`;
    };

    const renderTraining = () => {
        if (!trainingGrid) return;
        const now = Date.now();
        trainingGrid.replaceChildren(...PET_TRAINING.map((training) => {
            const remaining = Math.max(0, (Number(state.lastTraining[training.id]) || 0) - now);
            const talent = getPetTalent(state);
            const gain = training.gain + (talent.trainingAttribute === training.attribute ? talent.trainingGain || 0 : 0);
            const energyCost = Math.round(Math.abs(training.needs.energy) * (talent.energyCost || 1) * 10) / 10;
            const healthLow = state.needs.health < 35;
            const energyLow = state.needs.energy < energyCost;
            const blocked = remaining > 0 || state.job || state.exploration || state.ailment || healthLow || energyLow;
            const buttonLabel = remaining > 0 ? formatRemaining(remaining) : state.job ? '打工中' : state.exploration ? '探索中'
                : state.ailment ? '需要照顾' : healthLow ? '健康不足' : energyLow ? '体力不足' : '开始训练';
            return createElement(`
                <article class="pet-content-item pet-training-item">
                    <span class="pet-content-icon">${training.icon}</span>
                    <div><h4>${training.name}</h4><p>${training.description}</p><small>体力 -${energyCost} · ${ATTRIBUTE_LABELS[training.attribute]} +${gain}${gain > training.gain ? ` · ${talent.name}` : ''}</small></div>
                    <button class="btn btn-primary" type="button" data-pet-training="${training.id}" ${blocked ? 'disabled' : ''}>
                        ${buttonLabel}
                    </button>
                </article>
            `);
        }));
    };

    const renderCurrentJob = () => {
        if (!currentJob) return;
        if (!state.job) {
            currentJob.innerHTML = '<span class="pet-current-job-icon">闲</span><div><strong>当前没有班次</strong><p>选择适合伙伴能力的工作。</p></div>';
            if (jobDuration) jobDuration.disabled = false;
            return;
        }
        const job = PET_JOBS.find((entry) => entry.id === state.job.jobId);
        const remaining = Math.max(0, state.job.endsAt - Date.now());
        const progress = state.job.status === 'ready' ? 100 : Math.max(0, Math.min(100, ((Date.now() - state.job.startedAt) / (state.job.endsAt - state.job.startedAt)) * 100));
        currentJob.innerHTML = `
            <span class="pet-current-job-icon">${job?.icon || '工'}</span>
            <div class="pet-current-job-copy"><strong>${job?.name || '打工中'}</strong><p>${state.job.status === 'ready' ? '班次已结束，可以领取报酬。' : `剩余 ${formatRemaining(remaining)}`}</p><span><i style="width:${progress}%"></i></span></div>
            ${state.job.status === 'ready' ? '<button class="btn btn-primary" type="button" data-pet-job-claim>领取报酬</button>' : `<strong class="pet-job-reward">${state.job.rewardCoins} 币</strong>`}
        `;
        if (jobDuration) jobDuration.disabled = true;
    };

    const renderJobs = () => {
        if (!jobGrid) return;
        const attributes = getEffectiveAttributes(state);
        const petTalent = getPetTalent(state);
        const duration = PET_JOB_DURATIONS.find((entry) => entry.id === jobDuration?.value) || PET_JOB_DURATIONS[0];
        jobGrid.replaceChildren(...PET_JOBS.map((job) => {
            const requiredStage = duration.id === 'long' ? '少年期' : duration.id === 'medium' ? '童年期' : '幼年期';
            const stageOrder = ['幼年期', '童年期', '少年期', '成年期'];
            const stageLocked = stageOrder.indexOf(state.stage) < stageOrder.indexOf(requiredStage);
            const attributeLocked = attributes[job.primary] < job.requirement;
            const energyCost = Math.round(duration.energy * (petTalent.energyCost || 1) * 10) / 10;
            const healthLow = state.needs.health < 35;
            const energyLow = state.needs.energy < energyCost;
            const locked = attributeLocked || stageLocked || Boolean(state.job || state.exploration || state.ailment) || healthLow || energyLow;
            const skillBonus = Math.min(0.5, Math.max(0, attributes[job.primary] - job.requirement) * 0.03);
            const mastery = getJobMastery(state, job.id);
            const reward = Math.round(job.rewardRate * duration.rewardFactor * (1 + skillBonus + mastery.bonus + (petTalent.jobCoins || 0)));
            return createElement(`
                <article class="pet-content-item pet-job-item ${locked ? 'locked' : ''}">
                    <span class="pet-content-icon">${job.icon}</span>
                    <div><h4>${job.name}</h4><p>${job.description}</p><small>${mastery.title} · 熟练 Lv.${mastery.level}（+${Math.round(mastery.bonus * 100)}%） · ${ATTRIBUTE_LABELS[job.primary]} ${attributes[job.primary]}/${job.requirement} · 体力 ${energyCost} · 预计 ${reward} 币</small></div>
                    <button class="btn btn-primary" type="button" data-pet-job="${job.id}" ${locked ? 'disabled' : ''}>${stageLocked ? `需${requiredStage}` : attributeLocked ? '能力不足' : state.job ? '已有班次' : state.exploration ? '探索中' : state.ailment ? '需要照顾' : healthLow ? '健康不足' : energyLow ? '体力不足' : '开始班次'}</button>
                </article>
            `);
        }));
        renderCurrentJob();
    };

    const renderCurrentExploration = () => {
        if (!currentExploration) return;
        const activeExploration = state.exploration;
        if (!activeExploration) {
            if (currentExploration.dataset.signature === 'empty') return;
            currentExploration.dataset.signature = 'empty';
            currentExploration.setAttribute('aria-live', 'off');
            currentExploration.className = 'pet-current-exploration empty';
            currentExploration.innerHTML = '<span class="pet-exploration-emblem">途</span><div><strong>当前没有行程</strong><p>选择一条已解锁路线，伙伴会按真实时间带回见闻。</p></div>';
            return;
        }
        const route = PET_EXPLORATIONS.find((entry) => entry.id === activeExploration.routeId);
        const now = Date.now();
        const ready = activeExploration.status === 'ready' || now >= activeExploration.endsAt;
        const duration = Math.max(1, activeExploration.endsAt - activeExploration.startedAt);
        const percent = ready ? 100 : Math.round(Math.max(0, Math.min(1, (now - activeExploration.startedAt) / duration)) * 100);
        const signature = `${activeExploration.routeId}:${ready ? 'ready' : 'traveling'}`;
        if (currentExploration.dataset.signature === signature) {
            const copy = currentExploration.querySelector('.pet-exploration-current-copy p');
            const progress = currentExploration.querySelector('.pet-exploration-track i');
            if (copy && !ready) copy.textContent = `预计剩余 ${formatRemaining(activeExploration.endsAt - now)}`;
            if (progress) progress.style.width = `${percent}%`;
            return;
        }
        currentExploration.dataset.signature = signature;
        currentExploration.setAttribute('aria-live', ready ? 'polite' : 'off');
        currentExploration.className = `pet-current-exploration ${ready ? 'ready' : 'traveling'}`;
        currentExploration.innerHTML = `
            <span class="pet-exploration-emblem">${route?.icon || '途'}</span>
            <div class="pet-exploration-current-copy"><span>${ready ? 'JOURNEY COMPLETE' : 'ON THE ROAD'}</span><strong>${route?.name || '街区探索'}</strong><p>${ready ? escapeHtml(activeExploration.event) : `预计剩余 ${formatRemaining(activeExploration.endsAt - now)}`}</p></div>
            <div class="pet-exploration-track"><i style="width:${percent}%"></i></div>
            <div class="pet-exploration-current-actions">
                ${ready ? '<button class="btn btn-primary" type="button" data-pet-exploration-claim>领取见闻</button>' : '<button class="btn btn-secondary" type="button" data-pet-exploration-recall>提前召回</button>'}
            </div>`;
    };

    const renderExploration = () => {
        if (!explorationGrid || !weeklyList || !collectionGrid) return;
        const attributes = getEffectiveAttributes(state);
        const stageOrder = ['幼年期', '童年期', '少年期', '成年期'];
        if (explorationSummary) explorationSummary.innerHTML = `<span>完成 ${state.stats.explorationsCompleted} 次</span><strong>纪念物 ${state.collection.owned.length}/${PET_COLLECTIONS.length}</strong>`;
        explorationGrid.replaceChildren(...PET_EXPLORATIONS.map((route) => {
            const stageLocked = stageOrder.indexOf(state.stage) < stageOrder.indexOf(route.requiredStage);
            const attributeLocked = attributes[route.attribute] < route.requirement;
            const energyCost = Math.round(route.energy * (getPetTalent(state).energyCost || 1) * 10) / 10;
            const busy = Boolean(state.job || state.exploration);
            const stateLocked = Boolean(state.ailment) || state.needs.health < 35 || state.needs.energy < energyCost;
            const locked = stageLocked || attributeLocked || busy || stateLocked;
            const mastery = state.collection.routes[route.id] || 0;
            const rewardBonus = Math.min(20, mastery * 2);
            const buttonLabel = stageLocked ? `需${route.requiredStage}` : attributeLocked ? `${ATTRIBUTE_LABELS[route.attribute]}不足` : busy ? '伙伴忙碌中' : state.ailment ? '需要照顾' : stateLocked ? '状态不足' : '开始探索';
            return createElement(`
                <article class="pet-exploration-card ${locked ? 'locked' : ''}" data-route="${route.id}">
                    <div class="pet-exploration-card-visual"><span>${route.icon}</span><em>${formatRemaining(route.duration)}</em></div>
                    <div class="pet-exploration-card-copy"><span>${route.requiredStage} · 熟练 ${mastery}</span><strong>${route.name}</strong><p>${route.description}</p><small>${ATTRIBUTE_LABELS[route.attribute]} ${attributes[route.attribute]}/${route.requirement} · 体力 ${energyCost} · ${route.rewardCoins[0]}-${route.rewardCoins[1]} 币${rewardBonus ? ` · 收益 +${rewardBonus}%` : ''}</small></div>
                    <button class="btn btn-primary" type="button" data-pet-exploration-start="${route.id}" ${locked ? 'disabled' : ''}>${buttonLabel}</button>
                </article>`);
        }));
        const claimedWeekly = state.weekly.claimed.length;
        if (weeklyCount) weeklyCount.textContent = `${claimedWeekly} / ${PET_WEEKLY_TASKS.length}`;
        weeklyList.replaceChildren(...PET_WEEKLY_TASKS.map((task) => {
            const progress = Math.min(task.target, state.weekly[task.field] || 0);
            const claimed = state.weekly.claimed.includes(task.id);
            const ready = progress >= task.target && !claimed;
            return createElement(`
                <button class="pet-weekly-task ${ready ? 'ready' : ''}" type="button" data-pet-weekly-task="${task.id}" ${!ready ? 'disabled' : ''}>
                    <span>${claimed ? '已领' : `${progress}/${task.target}`}</span><div><strong>${task.label}</strong><i><b style="width:${Math.round(progress / task.target * 100)}%"></b></i></div><em>${task.rewardCoins} 币${task.rewardTickets ? ` + ${task.rewardTickets} 券` : ''}</em>
                </button>`);
        }));
        if (collectionCount) collectionCount.textContent = `${state.collection.owned.length} / ${PET_COLLECTIONS.length}`;
        collectionGrid.replaceChildren(...PET_COLLECTIONS.map((item) => {
            const owned = state.collection.owned.includes(item.id);
            const rarity = item.rarity === 'epic' ? '珍贵' : item.rarity === 'rare' ? '稀有' : '普通';
            return createElement(`
                <article class="pet-collection-item ${owned ? 'owned' : 'unknown'}" data-rarity="${item.rarity}">
                    <span>${owned ? item.icon : '?'}</span><div><em>${owned ? rarity : '尚未发现'}</em><strong>${owned ? item.name : '未知纪念物'}</strong><small>${owned ? item.description : '继续探索对应街区寻找线索。'}</small></div>
                </article>`);
        }));
        renderCurrentExploration();
    };

    const ensureMemoryBoard = () => {
        if (!memoryBoard || memoryBoard.children.length === MEMORY_SYMBOLS.length) return;
        memoryBoard.replaceChildren(...MEMORY_SYMBOLS.map((symbol, index) => createElement(`
            <button type="button" data-pet-memory="${index}" aria-label="星图符号 ${index + 1}" disabled><span>${symbol}</span><small>${String(index + 1).padStart(2, '0')}</small></button>
        `)));
    };

    const renderPlayground = () => {
        if (!playgroundGrid) return;
        ensureMemoryBoard();
        playgroundGrid.replaceChildren(...PET_PLAYGROUND_GAMES.map((entry) => {
            const record = state.playgroundRecords?.[entry.id] || { best: 0, plays: 0 };
            return createElement(`
                <button class="pet-playground-card ${entry.id === selectedPlaygroundId ? 'active' : ''}" type="button" data-pet-playground="${entry.id}" aria-pressed="${entry.id === selectedPlaygroundId}">
                    <span>${entry.icon}</span><strong>${entry.name}</strong><small>${entry.description}</small><em>${ATTRIBUTE_LABELS[entry.attribute]} · BEST ${record.best} · ${record.plays} 次</em>
                </button>
            `);
        }));
        const selected = PET_PLAYGROUND_GAMES.find((entry) => entry.id === selectedPlaygroundId);
        if (arenaTitle) arenaTitle.textContent = selected?.name || '';
        if (arenaScene && selected) arenaScene.dataset.game = selected.id;
        if (playgroundArena && selected) {
            playgroundArena.dataset.game = selected.id;
            playgroundArena.classList.toggle('is-memory-game', selected.mode === 'memory');
        }
        memoryBoard?.classList.toggle('hidden', selected?.mode !== 'memory');
        if (arenaAvatar) arenaAvatar.src = (PET_SPECIES_BY_ID[state.species] || PET_SPECIES[0]).image;
        if (timingTarget && selected) {
            timingTarget.style.left = `${selected.target[0]}%`;
            timingTarget.style.width = `${selected.target[1] - selected.target[0]}%`;
            playgroundArena?.style.setProperty('--target-start', `${selected.target[0]}%`);
            playgroundArena?.style.setProperty('--target-width', `${selected.target[1] - selected.target[0]}%`);
        }
        if (!playgroundRun && arenaAction) {
            const talent = getPetTalent(state);
            const energyCost = 8 * (talent.energyCost || 1);
            const blockedLabel = state.wallet.tickets < 1 ? '游乐券不足' : state.job ? '伙伴打工中' : state.exploration ? '伙伴探索中'
                : state.ailment ? '需要照顾' : state.needs.health < 35 ? '健康不足' : state.needs.energy < energyCost ? '体力不足' : '';
            arenaAction.disabled = Boolean(blockedLabel);
            if (blockedLabel) {
                arenaAction.textContent = blockedLabel;
                if (arenaCopy) arenaCopy.textContent = blockedLabel === '游乐券不足' ? '完成今日清单可以获得游乐券' : '恢复状态后再来挑战';
            } else {
                arenaAction.disabled = false;
                arenaAction.textContent = playgroundScores.length ? `开始第 ${playgroundScores.length + 1} 回合` : '开始挑战';
            }
        }
    };

    const renderCompetition = () => {
        if (!competitionTypes || !competitionDivisions) return;
        const selectedCompetition = PET_COMPETITIONS.find((entry) => entry.id === selectedCompetitionId) || PET_COMPETITIONS[0];
        const attributes = getEffectiveAttributes(state);
        const talent = getPetTalent(state);
        competitionSummary.innerHTML = `<span>今日 ${state.competition.entriesLeft}/5 · ${state.competition.wins}胜 ${state.competition.losses}负</span><strong>${getCompetitionRank(state.competition.rating)} · ${state.competition.rating}</strong><em>总奖杯 ${Object.values(state.competition.trophies).reduce((sum, value) => sum + value, 0)}</em>`;
        competitionTypes.replaceChildren(...PET_COMPETITIONS.map((entry) => createElement(`
            <button class="pet-competition-type ${entry.id === selectedCompetitionId ? 'active' : ''}" type="button" data-pet-competition="${entry.id}" aria-pressed="${entry.id === selectedCompetitionId}">
                <span>${entry.icon}</span><div><strong>${entry.name}</strong><small>${entry.description}</small></div><em>${ATTRIBUTE_LABELS[entry.attribute]} ${attributes[entry.attribute]}${talent.competitionAttribute === entry.attribute ? ` · ${talent.name} +${Math.round((talent.competitionScore || 0) * 100)}%` : ''}</em>
            </button>
        `)));
        const stageOrder = ['幼年期', '童年期', '少年期', '成年期'];
        competitionDivisions.replaceChildren(...PET_COMPETITION_DIVISIONS.map((division) => {
            const stageLocked = stageOrder.indexOf(state.stage) < stageOrder.indexOf(division.requiredStage);
            const attributeLocked = attributes[selectedCompetition.attribute] < division.requiredAttribute;
            const busy = Boolean(state.job || state.exploration);
            const energyCost = Math.round(division.energy * (talent.energyCost || 1) * 10) / 10;
            const healthLow = state.needs.health < 35;
            const energyLow = state.needs.energy < energyCost;
            const coinsLow = state.wallet.coins < division.fee;
            const entriesUsed = state.competition.entriesLeft <= 0;
            const locked = stageLocked || attributeLocked || coinsLow || entriesUsed || busy || Boolean(state.ailment) || healthLow || energyLow;
            return createElement(`
                <article class="pet-division-card ${division.id === selectedDivisionId ? 'selected' : ''} ${locked ? 'locked' : ''}" data-pet-division-card="${division.id}">
                    <div><span>${division.name}</span><strong>${division.winCoins} 币</strong></div>
                    <p>${division.requiredStage} · ${ATTRIBUTE_LABELS[selectedCompetition.attribute]} ${division.requiredAttribute} · 体力 ${energyCost}</p>
                    <small>报名 ${division.fee} 币 · 胜利 +${division.trophy} 奖杯</small>
                    <button class="btn btn-primary" type="button" data-pet-enter-competition="${division.id}" ${locked ? 'disabled' : ''}>${stageLocked ? `需${division.requiredStage}` : attributeLocked ? '能力不足' : entriesUsed ? '今日次数已用完' : coinsLow ? '宠物币不足' : busy ? '伙伴忙碌中' : state.ailment ? '需要照顾' : healthLow ? '健康不足' : energyLow ? '体力不足' : '侦察对手'}</button>
                </article>
            `);
        }));
        if (competitionStage) {
            competitionStage.classList.toggle('hidden', !competitionDraft);
            if (competitionDraft) {
                const opponentSpecies = PET_SPECIES_BY_ID[competitionDraft.opponentSpeciesId] || PET_SPECIES[1] || PET_SPECIES[0];
                const playerSpecies = PET_SPECIES_BY_ID[state.species] || PET_SPECIES[0];
                const peak = Math.max(1, competitionDraft.projectedPower, competitionDraft.opponentPower);
                competitionStage.innerHTML = `
                    <div class="pet-match-preview-head">
                        <div class="pet-match-contender player"><img src="${playerSpecies.image}" alt=""><span>我方</span><strong>${escapeHtml(state.name)}</strong><small>基础战力 ${competitionDraft.projectedPower}</small></div>
                        <div class="pet-match-versus"><b>VS</b><span>${competitionDraft.division.name}</span></div>
                        <div class="pet-match-contender rival"><img src="${opponentSpecies.image}" alt=""><span>对手</span><strong>${escapeHtml(competitionDraft.opponent)}</strong><small>威胁战力 ${competitionDraft.opponentPower}</small></div>
                    </div>
                    <div class="pet-power-compare" aria-label="双方基础战力对比">
                        <div><span>我方</span><i><b style="width:${Math.round(competitionDraft.projectedPower / peak * 100)}%"></b></i><strong>${competitionDraft.projectedPower}</strong></div>
                        <div><span>对手</span><i><b style="width:${Math.round(competitionDraft.opponentPower / peak * 100)}%"></b></i><strong>${competitionDraft.opponentPower}</strong></div>
                    </div>
                    <div class="pet-rival-intel"><span>侦察情报</span><strong>${competitionDraft.opponentStyle}倾向</strong><p>选择一套临场策略，克制成功会获得额外发挥。</p></div>
                    <div class="pet-strategy-grid">
                        ${PET_COMPETITION_STRATEGIES.map((strategy) => {
                            const counters = strategy.counters === competitionDraft.opponentStyleId;
                            const countered = PET_COMPETITION_STRATEGIES.find((entry) => entry.id === competitionDraft.opponentStyleId)?.counters === strategy.id;
                            return `<button type="button" class="${counters ? 'advantage' : countered ? 'danger' : ''}" data-pet-competition-strategy="${strategy.id}"><span>${strategy.icon}</span><strong>${strategy.name}${counters ? ' · 克制' : countered ? ' · 不利' : ''}</strong><small>${strategy.description}</small></button>`;
                        }).join('')}
                    </div>
                    <button class="pet-match-cancel" type="button" data-pet-competition-cancel>更换赛事</button>
                `;
            }
        }
        if (competitionHistory) {
            if (!state.competition.history.length) competitionHistory.innerHTML = '<div class="pet-empty-state">还没有比赛记录。</div>';
            else competitionHistory.replaceChildren(...state.competition.history.map((entry) => {
                const event = PET_COMPETITIONS.find((item) => item.id === entry.competitionId);
                const division = PET_COMPETITION_DIVISIONS.find((item) => item.id === entry.divisionId);
                const strategy = PET_COMPETITION_STRATEGIES.find((item) => item.id === entry.strategyId);
                return createElement(`<div class="pet-history-row ${entry.won ? 'win' : 'loss'}"><span>${entry.won ? '胜' : '负'}</span><strong>${event?.name || '伙伴比拼'} · ${division?.name || ''}</strong><small>${entry.playerScore}:${entry.opponentScore} · ${strategy?.name || '蓄势'} · ${escapeHtml(entry.opponent)}</small></div>`);
            }));
        }
    };

    const renderRoster = () => {
        if (!ownedRoster || !rosterCatalog) return;
        const draftNames = new Map(Array.from(rosterCatalog.querySelectorAll('[data-pet-adopt-name]'), input => [input.dataset.petAdoptName, input.value]));
        const focusedDraft = rosterCatalog.contains(document.activeElement) ? document.activeElement : null;
        const focusedSpecies = focusedDraft?.dataset.petAdoptName;
        const selection = focusedSpecies ? [focusedDraft.selectionStart, focusedDraft.selectionEnd] : null;
        const progress = getPetGrowthProgress(state);
        if (rosterCapacity) rosterCapacity.textContent = `${state.roster.owned.length} / ${state.roster.capacity}`;
        if (soundToggle) {
            soundToggle.textContent = state.settings.sound ? '声音：开启' : '声音：关闭';
            soundToggle.setAttribute('aria-pressed', state.settings.sound ? 'true' : 'false');
        }
        if (growthPanel) growthPanel.innerHTML = `
            <div><span>当前成长</span><strong>${state.stage}</strong><small>${progress.next ? `下一阶段：${progress.next.id}` : '已进入完整成长阶段'}</small></div>
            <div class="pet-growth-track"><i style="width:${progress.percent}%"></i></div>
            <p>${progress.next ? `还需 ${progress.growthNeeded} 成长值、${progress.daysNeeded} 天；将解锁${progress.next.unlock}。` : '所有成长内容均已解锁，可以继续培养属性与职业熟练度。'}</p>`;
        ownedRoster.replaceChildren(...state.roster.owned.map((entry) => {
            const profile = state.roster.profiles[entry.id];
            const species = PET_SPECIES_BY_ID[entry.speciesId];
            const activePet = entry.id === state.id;
            const jobReady = profile?.job && (profile.job.status === 'ready' || profile.job.endsAt <= Date.now());
            const explorationReady = profile?.exploration && (profile.exploration.status === 'ready' || profile.exploration.endsAt <= Date.now());
            const rosterStatus = activePet ? '当前伙伴' : jobReady ? '等待领取工资' : explorationReady ? '等待领取见闻'
                : profile?.job ? '托管打工中' : profile?.exploration ? '托管旅行中' : profile?.ailment ? '托管照顾中' : '托管中';
            return createElement(`
                <article class="pet-roster-card ${activePet ? 'active' : ''}">
                    <img src="${species.image}" alt=""><div><span>${rosterStatus}</span><strong>${escapeHtml(entry.name)}</strong><small>${species.name} · ${profile?.stage || '幼年期'} · 力 ${profile?.attributes?.strength || 0} / 智 ${profile?.attributes?.intelligence || 0} / 魅 ${profile?.attributes?.charm || 0}</small></div>
                    <button class="btn btn-secondary" type="button" data-pet-switch="${entry.id}" ${activePet ? 'disabled' : ''}>${activePet ? '陪伴中' : '切换'}</button>
                </article>`);
        }));
        if (achievementCount) achievementCount.textContent = `${state.achievements.length} / ${PET_ACHIEVEMENTS.length}`;
        if (achievementGrid) achievementGrid.replaceChildren(...PET_ACHIEVEMENTS.map((achievement) => {
            const status = getAchievementProgress(state, achievement);
            return createElement(`
                <article class="pet-achievement ${status.complete ? 'complete' : ''} ${status.claimed ? 'claimed' : ''}">
                    <span>${status.claimed ? '已领' : `${status.value}/${status.target}`}</span><div><strong>${achievement.name}</strong><small>${achievement.description}</small></div>
                    <button type="button" data-pet-achievement="${achievement.id}" ${!status.complete || status.claimed ? 'disabled' : ''}>${status.claimed ? '完成' : `${achievement.rewardCoins} 币${achievement.rewardTickets ? ` + ${achievement.rewardTickets} 券` : ''}`}</button>
                </article>`);
        }));
        const cost = getAdditionalAdoptionCost(state);
        rosterCatalog.replaceChildren(...PET_SPECIES.map((species) => {
            const owned = state.roster.owned.some((entry) => entry.speciesId === species.id);
            return createElement(`
                <article class="pet-catalog-card ${owned ? 'owned' : ''}">
                    <img src="${species.image}" alt=""><div><strong>${species.name}</strong><span>${species.talent.name}</span><small>${species.talent.description} · 力 ${species.attributes.strength} / 智 ${species.attributes.intelligence} / 魅 ${species.attributes.charm}</small></div>
                    <input type="text" maxlength="10" data-pet-adopt-name="${species.id}" value="${escapeHtml(draftNames.get(species.id) || '')}" placeholder="伙伴名字" ${owned ? 'disabled' : ''}>
                    <button class="btn btn-primary" type="button" data-pet-adopt-species="${species.id}" ${owned || state.wallet.coins < cost ? 'disabled' : ''}>${owned ? '已领养' : `${cost} 币领养`}</button>
                </article>`);
        }));
        if (focusedSpecies) {
            const input = rosterCatalog.querySelector(`[data-pet-adopt-name="${focusedSpecies}"]`);
            input?.focus({ preventScroll: true });
            input?.setSelectionRange(...selection);
        }
    };

    const renderShop = () => {
        if (!shopTabs || !shopGrid || !inventoryGrid) return;
        shopTabs.replaceChildren(...Object.entries(ITEM_CATEGORY_LABELS).map(([id, label]) => createElement(`
            <button class="${id === selectedShopCategory ? 'active' : ''}" type="button" role="tab" aria-selected="${id === selectedShopCategory}" data-pet-shop-tab="${id}">${label}</button>
        `)));
        const items = PET_ITEMS.filter((item) => item.category === selectedShopCategory);
        shopGrid.replaceChildren(...items.map((item) => {
            const owned = state.inventory[item.id] || 0;
            const uniqueOwned = ['outfit', 'decor'].includes(item.category) && owned > 0;
            const full = owned >= 99;
            return createElement(`
                <article class="pet-item-tile"><span class="pet-item-icon">${item.icon}</span><div><strong>${item.name}</strong><p>${item.description}</p></div>
                    <button type="button" data-pet-buy="${item.id}" ${state.wallet.coins < item.price || uniqueOwned || full ? 'disabled' : ''}>${uniqueOwned ? '已拥有' : full ? '已达上限' : `${item.price} 币`}</button>
                </article>
            `);
        }));
        const inventory = Object.entries(state.inventory).map(([id, count]) => ({ item: PET_ITEMS_BY_ID[id], count })).filter(({ item }) => item && item.category === selectedShopCategory);
        if (inventory.length === 0) {
            inventoryGrid.innerHTML = '<div class="pet-empty-state">这个分类还没有物品。</div>';
        } else {
            inventoryGrid.replaceChildren(...inventory.map(({ item, count }) => {
                const equipped = state.equipment.outfit === item.id || state.equipment.decor === item.id;
                const action = item.category === 'outfit' || item.category === 'decor' ? (equipped ? '使用中' : '装备') : '使用';
                return createElement(`
                    <article class="pet-item-tile"><span class="pet-item-icon">${item.icon}</span><div><strong>${item.name}</strong><p>${item.description}</p></div>
                        <button type="button" data-pet-use="${item.id}" ${equipped || state.job || state.exploration ? 'disabled' : ''}>${action}${count > 1 ? ` ×${count}` : ''}</button>
                    </article>
                `);
            }));
        }
    };

    const render = (message = '') => {
        adoption?.classList.toggle('hidden', state.adopted);
        game?.classList.toggle('hidden', !state.adopted);
        section.dataset.petMood = getMoodClass();
        section.dataset.petStage = state.stage;
        widget.dataset.petMood = getMoodClass();
        if (!state.adopted) {
            renderSpeciesPreview();
            updateWidgetVisibility();
            return;
        }
        const species = PET_SPECIES_BY_ID[state.species] || PET_SPECIES[0];
        const attributes = getEffectiveAttributes(state);
        const outfit = PET_ITEMS_BY_ID[state.equipment.outfit];
        const decor = PET_ITEMS_BY_ID[state.equipment.decor];
        section.style.setProperty('--pet-species-accent', species.accent);
        if (avatarImage) { avatarImage.src = species.image; avatarImage.alt = `${species.name}伙伴`; }
        if (widgetAvatar) widgetAvatar.src = species.image;
        if (petName) petName.textContent = state.name;
        if (petSpeciesName) petSpeciesName.textContent = `${species.name} · ${species.trait}`;
        if (stage) stage.textContent = state.stage;
        const ailment = getPetAilment(state);
        if (condition) {
            const [lowestKey, lowestValue] = getLowestNeed();
            condition.textContent = ailment?.name || (state.needs.health < 35 ? '健康欠佳' : lowestValue < 35 ? `${NEED_LABELS[lowestKey]}偏低` : '健康');
            condition.dataset.level = ailment || lowestValue < 35 ? 'warning' : 'good';
        }
        if (age) age.textContent = formatAge(state.birthAt);
        if (coins) coins.textContent = String(state.wallet.coins);
        if (tickets) tickets.textContent = String(state.wallet.tickets);
        if (loginStreak) loginStreak.textContent = `${state.loginStreak.current} 天`;
        if (affection) affection.textContent = String(state.relationship.affection);
        if (growth) growth.textContent = String(Math.floor(state.relationship.growth));
        if (level) level.textContent = `Lv.${getPetLevel(state)}`;
        if (leagueRank) leagueRank.textContent = getCompetitionRank(state.competition.rating);
        Object.entries(attributeElements).forEach(([key, element]) => { if (element) element.textContent = String(attributes[key]); });
        if (personality) personality.textContent = getPetPersonality(state);
        if (talentName) {
            const talent = getPetTalent(state);
            talentName.textContent = talent.name;
            talentName.title = talent.description;
        }
        if (widgetName) widgetName.textContent = state.name;
        if (widgetStatusTitle) widgetStatusTitle.textContent = `${state.name} · Lv.${getPetLevel(state)}`;
        if (widgetStatusStage) widgetStatusStage.textContent = ailment ? ailment.name
            : state.exploration?.status === 'ready' ? '旅途归来'
                : state.job?.status === 'ready' ? '待领工资'
                    : state.exploration ? '探索中' : state.job ? '打工中' : state.stage;
        if (widgetStatusCoins) widgetStatusCoins.textContent = String(state.wallet.coins);
        if (widgetStatusTickets) widgetStatusTickets.textContent = String(state.wallet.tickets);
        if (widgetRoam) {
            const roaming = state.settings.widgetRoaming !== false;
            widgetRoam.querySelector('span')?.replaceChildren(document.createTextNode(roaming ? '⌖' : '↝'));
            widgetRoam.title = roaming ? '固定挂件位置' : '恢复自动漫游';
            widgetRoam.setAttribute('aria-label', widgetRoam.title);
            widgetRoam.setAttribute('aria-pressed', roaming ? 'false' : 'true');
            widget.classList.toggle('is-pinned', !roaming);
        }
        if (widgetAlert) {
            const actionable = getActionableState();
            const rewardCount = actionable.jobReady + actionable.explorationReady + actionable.dailyReady + actionable.weeklyReady + actionable.achievementsReady;
            const alertTotal = actionable.lowNeeds.length + rewardCount;
            const alertCount = ailment ? '!' : String(alertTotal);
            const alertText = ailment ? `${ailment.name}，悬停查看伙伴状态`
                : rewardCount ? `${rewardCount} 项奖励待领取${actionable.lowNeeds.length ? `，${actionable.lowNeeds.length} 项状态需要照顾` : ''}`
                    : `${actionable.lowNeeds.length} 项状态需要照顾`;
            widgetAlert.classList.toggle('hidden', !ailment && alertTotal === 0);
            widgetAlert.textContent = alertCount;
            widgetAlert.title = alertText;
            widgetAlert.setAttribute('aria-label', alertText);
        }
        if (outfitBadge) {
            outfitBadge.classList.toggle('hidden', !outfit);
            outfitBadge.textContent = outfit?.icon || '';
            outfitBadge.title = outfit?.name || '';
            outfitBadge.style.background = outfit?.accent || '';
        }
        if (room) {
            const background = decor?.background || DEFAULT_ROOM_BACKGROUND;
            room.style.backgroundImage = `linear-gradient(180deg, rgba(7,12,19,.04) 45%, rgba(7,12,19,.72) 100%), url("${background}")`;
        }
        if (widgetToggle) {
            widgetToggle.textContent = state.settings.widgetVisible ? '主页挂件：开启' : '主页挂件：关闭';
            widgetToggle.setAttribute('aria-pressed', state.settings.widgetVisible ? 'true' : 'false');
        }
        needItems.forEach((item) => {
            const key = item.dataset.petNeed;
            const value = Math.round(state.needs[key] || 0);
            item.style.setProperty('--pet-need-value', `${value}%`);
            item.dataset.level = value < 25 ? 'low' : value < 55 ? 'mid' : 'good';
            item.querySelector('[data-need-value]')?.replaceChildren(document.createTextNode(String(value)));
            item.setAttribute('aria-label', `${NEED_LABELS[key]} ${value}`);
        });
        widgetNeedItems.forEach((item) => {
            const key = item.dataset.petWidgetNeed;
            const value = Math.round(state.needs[key] || 0);
            item.style.setProperty('--pet-widget-need-value', `${value}%`);
            item.dataset.level = value < 25 ? 'low' : value < 55 ? 'mid' : 'good';
            const valueNode = item.querySelector('em');
            if (valueNode) valueNode.textContent = String(value);
            item.setAttribute('aria-label', `${NEED_LABELS[key]} ${value}`);
        });
        renderNextAction();
        updateBasicCooldowns();
        renderDaily();
        renderStory();
        renderTraining();
        renderJobs();
        renderExploration();
        renderPlayground();
        renderCompetition();
        renderRoster();
        renderShop();
        switchView(activeView);
        setMessage(message || state.lastMessage);
        updateWidgetVisibility();
    };

    const applyResult = (operation, action = '') => {
        const before = JSON.parse(JSON.stringify(state));
        try {
            if (!writerOwned) throw new Error('另一页面正在照顾伙伴，请关闭该页面后点击“重试读取 / 同步”。');
            if (storageError) throw new Error(storageError);
            const result = operation();
            state = result.state;
            render(result.message);
            if (result.ok && action) setMessage(result.message, action);
            if (result.ok) {
                showStorageNotice();
                playTone(result.won === true ? 'win' : result.won === false ? 'loss' : 'action');
                queueCloudSave();
            }
            return result;
        } catch (error) {
            state = before;
            if (writerOwned) storageError = error.message;
            cancelPlaygroundRun();
            competitionDraft = null;
            render();
            showStorageNotice(error.message);
            return { state, ok: false, message: error.message };
        }
    };
    const saveSettings = (change, message) => applyResult(() => {
        const next = JSON.parse(JSON.stringify(state));
        change(next.settings);
        return { state: savePetState(next), ok: true, message };
    });

    const renderRoundBoard = (scores = playgroundScores, completed = false) => {
        arenaRounds.forEach((round, index) => {
            const score = scores[index];
            const hasScore = Number.isFinite(score);
            round.classList.toggle('done', hasScore);
            round.classList.toggle('great', hasScore && score >= 85);
            round.classList.toggle('current', !completed && index === scores.length);
            const value = round.querySelector('em');
            if (value) value.textContent = hasScore ? String(score) : '--';
        });
    };

    const showArenaScore = (score, prefix = '本轮') => {
        const grade = score >= 85 ? 'great' : score >= 60 ? 'good' : 'miss';
        if (playgroundArena) playgroundArena.dataset.result = grade;
        if (arenaScore) arenaScore.textContent = score >= 85 ? 'PERFECT' : score >= 60 ? 'GOOD' : 'KEEP GOING';
        if (arenaCopy) arenaCopy.textContent = `${prefix} ${score} 分`;
        return grade;
    };

    const cancelPlaygroundRun = () => {
        if (playgroundRun?.frame) cancelAnimationFrame(playgroundRun.frame);
        playgroundRun?.timers?.forEach((timer) => clearTimeout(timer));
        playgroundRun = null;
        playgroundScores = [];
        playgroundArena?.classList.remove('is-memory-running', 'is-running');
        if (playgroundArena) delete playgroundArena.dataset.result;
        playgroundArena?.style.setProperty('--arena-position', '0%');
        if (timingMarker) timingMarker.style.left = '0%';
        if (arenaAction) arenaAction.textContent = '开始挑战';
        if (arenaStatus) arenaStatus.textContent = '准备';
        if (arenaScore) arenaScore.textContent = 'READY';
        if (arenaCopy) arenaCopy.textContent = '三回合挑战等待开始';
        if (arenaAction) arenaAction.disabled = false;
        memoryBoard?.querySelectorAll('button').forEach((button) => {
            button.disabled = true;
            button.classList.remove('preview', 'correct', 'wrong');
        });
        renderRoundBoard([]);
    };

    const tickPlayground = (now) => {
        if (!playgroundRun || !['timing', 'rhythm', 'memory-input'].includes(playgroundRun.mode)) return;
        const run = playgroundRun;
        const elapsed = (now - run.startedAt) / 1000;
        if (run.mode === 'memory-input') {
            const remaining = Math.max(0, run.game.timeLimit - elapsed);
            if (remaining <= 0) {
                finishPlaygroundRound(run.game, calculatePetMemoryScore(run.sequence, [...run.input, -1], run.game.timeLimit * 1000), null, '输入超时');
                return;
            }
            if (arenaCopy) arenaCopy.textContent = `已输入 ${run.input.length}/${run.sequence.length} · 剩余 ${remaining.toFixed(1)} 秒`;
            run.frame = requestAnimationFrame(tickPlayground);
            return;
        }
        const limit = run.mode === 'rhythm' ? run.game.beatDuration : run.game.timeLimit;
        if (elapsed >= limit) {
            if (run.mode === 'rhythm') finishRhythmBeat(true);
            else finishPlaygroundRun(true);
            return;
        }
        const phase = run.mode === 'rhythm'
            ? elapsed / limit
            : (elapsed * run.speed) % 2;
        const position = run.mode === 'rhythm' || phase <= 1 ? phase * 100 : (2 - phase) * 100;
        run.position = position;
        if (timingMarker) timingMarker.style.left = `${position}%`;
        playgroundArena?.style.setProperty('--arena-position', `${position}%`);
        if (arenaCopy) {
            arenaCopy.textContent = run.mode === 'rhythm'
                ? `第 ${run.beatScores.length + 1}/${run.game.beats} 拍 · 剩余 ${(limit - elapsed).toFixed(1)} 秒`
                : `本回合剩余 ${(limit - elapsed).toFixed(1)} 秒`;
        }
        run.frame = requestAnimationFrame(tickPlayground);
    };

    const finishPlaygroundRound = (selected, score, position = null, outcome = '') => {
        if (playgroundRun?.frame) cancelAnimationFrame(playgroundRun.frame);
        playgroundRun?.timers?.forEach((timer) => clearTimeout(timer));
        playgroundRun = null;
        playgroundArena?.classList.remove('is-memory-running', 'is-running');
        if (selected.mode === 'memory') memoryBoard?.querySelectorAll('button').forEach((button) => { button.disabled = true; });
        playgroundScores.push(score);
        if (position !== null) {
            if (timingMarker) timingMarker.style.left = `${position}%`;
            playgroundArena?.style.setProperty('--arena-position', `${position}%`);
        }
        showArenaScore(score);
        renderRoundBoard(playgroundScores);
        if (playgroundScores.length < 3) {
            if (arenaAction) {
                arenaAction.disabled = false;
                arenaAction.textContent = `开始第 ${playgroundScores.length + 1} 回合`;
            }
            if (arenaStatus) arenaStatus.textContent = `${outcome ? `${outcome} · ` : ''}本轮 ${score} 分 · 已完成 ${playgroundScores.length}/3`;
            playTone('action');
            return;
        }
        const completedScores = [...playgroundScores];
        const average = averagePetPlaygroundScores(completedScores);
        playgroundScores = [];
        const result = applyResult(() => completePlaygroundGame(state, selected.id, average), 'play');
        renderRoundBoard(completedScores, true);
        showArenaScore(result.ok ? result.score : average, '三回合平均');
        if (arenaAction) {
            const replayBlocked = state.wallet.tickets < 1 || state.job || state.exploration || state.ailment || state.needs.health < 35 || state.needs.energy < 8 * (getPetTalent(state).energyCost || 1);
            arenaAction.disabled = Boolean(replayBlocked);
            arenaAction.textContent = state.wallet.tickets < 1 ? '游乐券不足' : replayBlocked ? '当前状态不足' : '再挑战一次';
        }
        if (arenaStatus) arenaStatus.textContent = result.ok ? `挑战完成 · 三回合平均 ${result.score} 分` : result.message;
    };

    const startMemoryRound = (selected) => {
        const round = playgroundScores.length;
        const sequence = createPetMemorySequence(3 + round);
        const run = { game: selected, mode: 'memory-preview', sequence, input: [], timers: [], startedAt: 0 };
        playgroundRun = run;
        playgroundArena?.classList.add('is-running', 'is-memory-running');
        playgroundArena?.style.setProperty('--arena-position', '50%');
        renderRoundBoard(playgroundScores);
        if (arenaStatus) arenaStatus.textContent = `第 ${round + 1}/3 回合 · ${sequence.length} 枚星图`;
        if (arenaScore) arenaScore.textContent = 'MEMORIZE';
        if (arenaCopy) arenaCopy.textContent = '星图序列展示中';
        if (arenaAction) { arenaAction.disabled = true; arenaAction.textContent = '观察星图'; }
        const pads = Array.from(memoryBoard?.querySelectorAll('button') || []);
        pads.forEach((button) => { button.disabled = true; button.classList.remove('preview', 'correct', 'wrong'); });
        sequence.forEach((value, index) => {
            run.timers.push(setTimeout(() => pads[value]?.classList.add('preview'), index * 600 + 180));
            run.timers.push(setTimeout(() => pads[value]?.classList.remove('preview'), index * 600 + 560));
        });
        run.timers.push(setTimeout(() => {
            if (playgroundRun !== run) return;
            run.mode = 'memory-input';
            run.startedAt = performance.now();
            playgroundArena?.classList.remove('is-memory-running');
            pads.forEach((button) => { button.disabled = false; button.classList.remove('preview'); });
            if (arenaScore) arenaScore.textContent = 'REPEAT';
            if (arenaCopy) arenaCopy.textContent = `已输入 0/${sequence.length} · 剩余 ${selected.timeLimit.toFixed(1)} 秒`;
            if (arenaAction) arenaAction.textContent = '按星图顺序选择';
            run.frame = requestAnimationFrame(tickPlayground);
        }, sequence.length * 600 + 240));
    };

    const startPlaygroundRun = () => {
        if (!writerOwned || storageError) { showStorageNotice(storageError || '伙伴正在另一页面中使用，请重试读取后开始。'); return; }
        if (state.wallet.tickets < 1) { setMessage('游乐券不够，完成每日任务可以获得。'); return; }
        if (state.job) { setMessage(state.job.status === 'ready' ? '先领取打工报酬，再来游乐场。' : '伙伴正在打工，回来后再玩。'); return; }
        if (state.exploration) { setMessage(state.exploration.status === 'ready' ? '先领取探索见闻，再来游乐场。' : '伙伴正在外出探索，回来后再玩。'); return; }
        if (state.ailment) { setMessage(`${getPetAilment(state)?.name || '身体不适'}还没有恢复，先照顾一下伙伴。`); return; }
        if (state.needs.health < 35 || state.needs.energy < 8 * (getPetTalent(state).energyCost || 1)) { setMessage('当前状态不适合挑战，先照顾一下伙伴。'); return; }
        const selected = PET_PLAYGROUND_GAMES.find((entry) => entry.id === selectedPlaygroundId);
        if (playgroundArena) delete playgroundArena.dataset.result;
        if (selected.mode === 'memory') {
            startMemoryRound(selected);
            return;
        }
        const round = playgroundScores.length;
        playgroundRun = {
            game: selected,
            mode: selected.mode,
            startedAt: performance.now(),
            position: 0,
            frame: 0,
            timers: [],
            speed: selected.speed * (1 + round * 0.14),
            beatScores: [],
        };
        playgroundArena?.classList.add('is-running');
        playgroundArena?.style.setProperty('--arena-position', '0%');
        renderRoundBoard(playgroundScores);
        if (arenaAction) arenaAction.textContent = selected.mode === 'rhythm' ? '踩下第 1 拍' : '停在这里';
        if (arenaStatus) arenaStatus.textContent = `第 ${round + 1}/3 回合${selected.mode === 'rhythm' ? ` · 0/${selected.beats} 拍` : ''}`;
        if (arenaScore) arenaScore.textContent = `ROUND ${round + 1}`;
        if (arenaCopy) arenaCopy.textContent = `${selected.name}进行中`;
        playgroundRun.frame = requestAnimationFrame(tickPlayground);
    };

    const finishPlaygroundRun = (timedOut = false) => {
        if (!playgroundRun || !['timing', 'rhythm'].includes(playgroundRun.mode)) return;
        if (playgroundRun.mode === 'rhythm') {
            finishRhythmBeat(timedOut);
            return;
        }
        const { game: selected, position } = playgroundRun;
        finishPlaygroundRound(selected, timedOut ? 0 : calculatePetPlaygroundScore(selected, position), position, timedOut ? '冲刺超时' : '成功停点');
    };

    const finishRhythmBeat = (timedOut = false) => {
        const run = playgroundRun;
        if (!run || run.mode !== 'rhythm') return;
        if (run.frame) cancelAnimationFrame(run.frame);
        run.frame = 0;
        const score = timedOut ? 0 : calculatePetPlaygroundScore(run.game, run.position);
        run.beatScores.push(score);
        showArenaScore(score, `第 ${run.beatScores.length} 拍`);
        if (run.beatScores.length >= run.game.beats) {
            const roundScore = averagePetPlaygroundScores(run.beatScores);
            finishPlaygroundRound(run.game, roundScore, run.position, `四拍平均 ${roundScore} 分`);
            return;
        }
        run.startedAt = performance.now();
        run.position = 0;
        if (timingMarker) timingMarker.style.left = '0%';
        playgroundArena?.style.setProperty('--arena-position', '0%');
        if (arenaStatus) arenaStatus.textContent = `第 ${playgroundScores.length + 1}/3 回合 · ${run.beatScores.length}/${run.game.beats} 拍`;
        if (arenaAction) arenaAction.textContent = `踩下第 ${run.beatScores.length + 1} 拍`;
        run.frame = requestAnimationFrame(tickPlayground);
    };

    form?.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = String(nameInput?.value || '').trim().replace(/\s+/g, ' ').slice(0, 10);
        if (!name) { if (adoptionTip) adoptionTip.textContent = '先给伙伴取一个名字。'; nameInput?.focus(); return; }
        applyResult(() => ({ state: createPet(name, selectedSpeciesId), ok: true, message: '伙伴已经加入小屋。' }));
    });

    speciesGrid?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-pet-species]');
        if (!button) return;
        selectedSpeciesId = button.dataset.petSpecies;
        renderSpeciesPreview();
    });
    actionButtons.forEach((button) => button.addEventListener('click', () => applyResult(() => performPetAction(state, button.dataset.petAction), button.dataset.petAction)));
    const interactWithAvatar = () => setMessage(state.job || state.exploration ? getContextDialogue() : getInteractionDialogue('pet'), 'play');
    avatar?.addEventListener('click', interactWithAvatar);
    avatar?.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        interactWithAvatar();
    });
    storyCard?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-pet-story-option]');
        if (button) applyResult(() => resolvePetStoryEvent(state, button.dataset.petStoryOption), 'play');
    });
    viewButtons.forEach((button) => button.addEventListener('click', () => switchView(button.dataset.petViewTarget)));
    nextButton?.addEventListener('click', () => {
        if (nextButton.dataset.shopCategory) selectedShopCategory = nextButton.dataset.shopCategory;
        switchView(nextButton.dataset.targetView || 'home');
        if (activeView === 'shop') renderShop();
    });
    trainingGrid?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-pet-training]');
        if (button) applyResult(() => trainPet(state, button.dataset.petTraining), 'play');
    });
    jobDuration?.addEventListener('change', renderJobs);
    jobGrid?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-pet-job]');
        if (button) applyResult(() => startPetJob(state, button.dataset.petJob, jobDuration?.value || 'short'), 'sleep');
    });
    currentJob?.addEventListener('click', (event) => { if (event.target.closest('[data-pet-job-claim]')) applyResult(() => claimPetJob(state), 'play'); });
    explorationGrid?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-pet-exploration-start]');
        if (button) applyResult(() => startPetExploration(state, button.dataset.petExplorationStart), 'play');
    });
    currentExploration?.addEventListener('click', (event) => {
        if (event.target.closest('[data-pet-exploration-claim]')) applyResult(() => claimPetExploration(state), 'play');
        if (event.target.closest('[data-pet-exploration-recall]')) applyResult(() => recallPetExploration(state), 'sleep');
    });
    weeklyList?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-pet-weekly-task]');
        if (button) applyResult(() => claimWeeklyTask(state, button.dataset.petWeeklyTask), 'play');
    });
    playgroundGrid?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-pet-playground]');
        if (!button) return;
        selectedPlaygroundId = button.dataset.petPlayground;
        playgroundArena?.classList.remove('hidden');
        cancelPlaygroundRun();
        renderPlayground();
    });
    memoryBoard?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-pet-memory]');
        const run = playgroundRun;
        if (!button || run?.mode !== 'memory-input') return;
        const choice = Number(button.dataset.petMemory);
        const expected = run.sequence[run.input.length];
        run.input.push(choice);
        const correct = choice === expected;
        button.classList.remove('correct', 'wrong');
        button.classList.add(correct ? 'correct' : 'wrong');
        run.timers.push(setTimeout(() => button.classList.remove('correct', 'wrong'), 320));
        if (!correct || run.input.length === run.sequence.length) {
            const score = calculatePetMemoryScore(run.sequence, run.input, performance.now() - run.startedAt);
            finishPlaygroundRound(run.game, score);
            return;
        }
        if (arenaCopy) {
            const remaining = Math.max(0, run.game.timeLimit - (performance.now() - run.startedAt) / 1000);
            arenaCopy.textContent = `已输入 ${run.input.length}/${run.sequence.length} · 剩余 ${remaining.toFixed(1)} 秒`;
        }
    });
    arenaAction?.addEventListener('click', () => {
        if (!playgroundRun) startPlaygroundRun();
        else if (['timing', 'rhythm'].includes(playgroundRun.mode)) finishPlaygroundRun();
    });
    competitionTypes?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-pet-competition]');
        if (!button) return;
        selectedCompetitionId = button.dataset.petCompetition;
        competitionDraft = null;
        renderCompetition();
    });
    competitionDivisions?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-pet-enter-competition]');
        if (!button) return;
        selectedDivisionId = button.dataset.petEnterCompetition;
        const preview = previewPetCompetition(state, selectedCompetitionId, selectedDivisionId);
        if (!preview.ok) { setMessage(preview.message); return; }
        competitionDraft = preview;
        renderCompetition();
    });
    competitionStage?.addEventListener('click', (event) => {
        if (event.target.closest('[data-pet-competition-cancel]')) {
            competitionDraft = null;
            renderCompetition();
            return;
        }
        const button = event.target.closest('[data-pet-competition-strategy]');
        if (!button || !competitionDraft) return;
        const draft = competitionDraft;
        competitionDraft = null;
        const result = applyResult(() => enterPetCompetition(state, selectedCompetitionId, selectedDivisionId, button.dataset.petCompetitionStrategy, Date.now(), draft.matchAt), 'play');
        if (result.ok && competitionResult) {
            const rounds = result.rounds.map((round) => `<span class="${round.won ? 'win' : 'loss'}"><b>第 ${round.round} 局</b><em>${round.player}:${round.opponent}</em></span>`).join('');
            const matchupText = result.matchup > 0 ? '策略克制成功' : result.matchup < 0 ? '策略受到克制' : '策略正面交锋';
            competitionResult.className = `pet-match-result ${result.won ? 'win' : 'loss'} detailed`;
            competitionResult.innerHTML = `<span class="pet-match-emblem">${result.won ? '胜' : '负'}</span><div><strong>${escapeHtml(state.name)} ${result.playerScore} : ${result.opponentScore} ${escapeHtml(result.opponent)}</strong><p>${result.strategy} 对 ${result.opponentStyle} · ${matchupText} · 评级 ${result.ratingChange > 0 ? '+' : ''}${result.ratingChange}</p><div class="pet-match-rounds">${rounds}</div></div>`;
        }
    });
    ownedRoster?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-pet-switch]');
        if (!button) return;
        const result = applyResult(() => switchActivePet(state, button.dataset.petSwitch), 'play');
        if (result.ok) selectedSpeciesId = state.species;
    });
    achievementGrid?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-pet-achievement]');
        if (button) applyResult(() => claimPetAchievement(state, button.dataset.petAchievement), 'play');
    });
    rosterCatalog?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-pet-adopt-species]');
        if (!button) return;
        const speciesId = button.dataset.petAdoptSpecies;
        const input = rosterCatalog.querySelector(`[data-pet-adopt-name="${speciesId}"]`);
        const species = PET_SPECIES_BY_ID[speciesId];
        const name = String(input?.value || species?.name || '').trim().replace(/\s+/g, ' ').slice(0, 10);
        const result = applyResult(() => adoptAdditionalPet(state, name, speciesId), 'play');
        if (result.ok) selectedSpeciesId = state.species;
    });
    soundToggle?.addEventListener('click', () => {
        const sound = !state.settings.sound;
        saveSettings(settings => { settings.sound = sound; }, sound ? '伙伴音效已开启。' : '伙伴音效已关闭。');
    });
    shopTabs?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-pet-shop-tab]');
        if (!button) return;
        selectedShopCategory = button.dataset.petShopTab;
        renderShop();
    });
    shopGrid?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-pet-buy]');
        if (button) applyResult(() => buyPetItem(state, button.dataset.petBuy));
    });
    inventoryGrid?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-pet-use]');
        if (button) applyResult(() => usePetItem(state, button.dataset.petUse), 'feed');
    });
    dailyList?.addEventListener('click', (event) => {
        const button = event.target.closest('[data-pet-task]');
        if (button) applyResult(() => claimDailyTask(state, button.dataset.petTask));
    });

    widgetToggle?.addEventListener('click', () => {
        const visible = !state.settings.widgetVisible;
        saveSettings(settings => { settings.widgetVisible = visible; }, visible ? '我会在大厅陪着你。' : '需要我的时候，再把挂件打开吧。');
    });
    widgetClose?.addEventListener('click', (event) => {
        event.stopPropagation();
        saveSettings(settings => { settings.widgetVisible = false; }, '我先回小屋休息。');
    });
    const setWidgetMenuOpen = (open, announce = false) => {
        if (!widgetMenu || !widgetShell) return;
        widgetMenu.classList.toggle('hidden', !open);
        widget.classList.toggle('menu-open', open);
        widgetShell.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open && announce) setMessage(getInteractionDialogue('menu'));
    };
    const toggleWidgetMenu = () => setWidgetMenuOpen(widgetMenu?.classList.contains('hidden'), true);
    widgetRoam?.addEventListener('click', (event) => {
        event.stopPropagation();
        const roaming = state.settings.widgetRoaming === false;
        const widgetStyle = getComputedStyle(widget);
        saveSettings(settings => {
            settings.widgetRoaming = roaming;
            if (!roaming) {
                settings.widgetX = Math.round(parseFloat(widgetStyle.left) || 12);
                settings.widgetY = Math.round(parseFloat(widgetStyle.bottom) || 10);
            }
        }, roaming ? '好呀，我继续在大厅里散步。' : '我会乖乖待在这里。');
        setWidgetMenuOpen(false);
    });
    widgetHome?.addEventListener('click', (event) => {
        event.stopPropagation();
        setWidgetMenuOpen(false);
        setMessage(getInteractionDialogue('home'), 'play');
        showSection?.('pet');
    });
    widgetMenu?.addEventListener('click', (event) => {
        if (event.target.closest('[data-pet-action]')) setWidgetMenuOpen(false);
    });
    widgetShell?.addEventListener('click', (event) => {
        if (suppressWidgetClick) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        toggleWidgetMenu();
    });
    widgetShell?.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        toggleWidgetMenu();
    });
    widgetShell?.addEventListener('pointerenter', () => {
        const now = Date.now();
        if (dragging || now - lastWidgetHoverAt < 8000) return;
        lastWidgetHoverAt = now;
        setMessage(getInteractionDialogue('hover'));
    });
    widgetShell?.addEventListener('pointerdown', (event) => {
        if (event.button !== 0 || event.target.closest('button')) return;
        event.preventDefault();
        setWidgetMenuOpen(false);
        const widgetStyle = getComputedStyle(widget);
        dragging = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            originX: parseFloat(widgetStyle.left) || 12,
            originBottom: parseFloat(widgetStyle.bottom) || 10,
        };
        suppressWidgetClick = false;
        widget.classList.remove('is-roaming');
        widgetShell.setPointerCapture?.(event.pointerId);
        widget.classList.add('is-dragging');
    });
    widgetShell?.addEventListener('pointermove', (event) => {
        if (!dragging || dragging.pointerId !== event.pointerId) return;
        event.preventDefault();
        const deltaX = event.clientX - dragging.startX;
        const deltaY = event.clientY - dragging.startY;
        if (Math.hypot(deltaX, deltaY) > 4) suppressWidgetClick = true;
        const maxX = Math.max(12, window.innerWidth - widgetShell.offsetWidth - 12);
        const maxBottom = Math.max(10, window.innerHeight - widgetShell.offsetHeight - 12);
        if (Math.abs(deltaX) > 2) widget.dataset.direction = deltaX < 0 ? 'left' : 'right';
        widget.style.setProperty('--pet-widget-x', `${Math.max(12, Math.min(maxX, dragging.originX + deltaX))}px`);
        widget.style.setProperty('--pet-widget-bottom', `${Math.max(10, Math.min(maxBottom, dragging.originBottom - deltaY))}px`);
    });
    const finishDrag = (event) => {
        if (!dragging || dragging.pointerId !== event.pointerId) return;
        const widgetStyle = getComputedStyle(widget);
        if (suppressWidgetClick) {
            const result = saveSettings(settings => {
                settings.widgetX = Math.round(parseFloat(widgetStyle.left) || 12);
                settings.widgetY = Math.round(parseFloat(widgetStyle.bottom) || 10);
            }, getInteractionDialogue('drag'));
            if (!result.ok) placeWidget();
        }
        dragging = null;
        widget.classList.remove('is-dragging');
        setTimeout(() => { suppressWidgetClick = false; }, 0);
    };
    widgetShell?.addEventListener('pointerup', finishDrag);
    widgetShell?.addEventListener('pointercancel', finishDrag);
    widgetShell?.addEventListener('lostpointercapture', finishDrag);
    widgetShell?.addEventListener('dragstart', (event) => event.preventDefault());

    document.addEventListener('pointerdown', (event) => {
        if (!widget.contains(event.target)) setWidgetMenuOpen(false);
    });
    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || widgetMenu?.classList.contains('hidden')) return;
        setWidgetMenuOpen(false);
        widgetShell?.focus();
    });

    const scheduleWidgetRoam = () => {
        const delay = 16000 + Math.random() * 12000;
        setTimeout(() => {
            const menuOpen = widgetMenu && !widgetMenu.classList.contains('hidden');
            const engaged = widget.matches(':hover') || widget.contains(document.activeElement);
            const canRoam = state.settings.widgetRoaming !== false
                && !widget.classList.contains('hidden')
                && !dragging
                && !menuOpen
                && !engaged
                && document.visibilityState !== 'hidden'
                && window.innerWidth >= 720
                && widgetShell;
            if (canRoam) {
                const maxX = Math.max(24, window.innerWidth - widgetShell.offsetWidth - 24);
                const nextX = 24 + Math.random() * Math.max(0, maxX - 24);
                const currentX = parseFloat(getComputedStyle(widget).left) || nextX;
                widget.dataset.direction = nextX < currentX ? 'left' : 'right';
                widget.classList.add('is-roaming');
                widget.style.setProperty('--pet-widget-x', `${Math.round(nextX)}px`);
                setTimeout(() => widget.classList.remove('is-roaming'), 4200);
            }
            scheduleWidgetRoam();
        }, delay);
    };
    scheduleWidgetRoam();

    const mainPage = document.getElementById('main-page');
    if (mainPage) new MutationObserver(updateWidgetVisibility).observe(mainPage, { attributes: true, attributeFilter: ['class', 'data-active-section'] });
    subscribePetState((nextState) => {
        if (nextState.revision <= state.revision) return;
        cancelPlaygroundRun();
        competitionDraft = null;
        state = nextState;
        render('另一处页面刚刚更新了伙伴状态。');
    });
    window.addEventListener('rosang:game-result', (event) => {
        if (!state.adopted || !writerOwned || storageError) return;
        applyResult(() => recordArcadeResult(state, event.detail || {}), 'play');
    });
    window.addEventListener('resize', placeWidget);

    const refreshLocal = ({ persist = false, retry = false } = {}) => {
        if (storageError && !retry) return null;
        try {
            let loaded = loadPetState();
            if (!retry && loaded.state.revision === state.revision && loaded.state.id === state.id) loaded = simulatePetState(state);
            const next = persist && writerOwned && loaded.state.adopted
                ? savePetState(loaded.state, { touch: false }) : loaded.state;
            if (retry) { cancelPlaygroundRun(); competitionDraft = null; }
            state = next;
            storageError = '';
            return loaded;
        } catch (error) {
            storageError = error.message;
            cancelPlaygroundRun();
            competitionDraft = null;
            showStorageNotice(storageError);
            return null;
        }
    };
    const obtainWriter = () => {
        if (writerOwned) return Promise.resolve(true);
        if (writerAcquisition) return writerAcquisition;
        const epoch = writerEpoch;
        writerAcquisition = acquirePetWriter().then(lease => {
            if (epoch !== writerEpoch) { lease.release(); return false; }
            writerLease = lease;
            writerOwned = lease.owned;
            if (!writerOwned) showStorageNotice(lease.native
                ? '另一页面正在照顾伙伴。请关闭该页面后点击“重试读取 / 同步”。'
                : '此浏览器无法安全保存伙伴，请使用最新版浏览器通过 HTTPS 打开网站后重试。');
            return writerOwned;
        }).finally(() => { writerAcquisition = null; });
        return writerAcquisition;
    };
    retryStorage.addEventListener('click', async () => {
        retryStorage.disabled = true;
        try {
            if (!await obtainWriter()) return;
            if (!refreshLocal({ retry: true })) return;
            showStorageNotice();
            render('已重新读取伙伴存档。');
            await syncCloudState();
        } finally { retryStorage.disabled = false; }
    });
    const stopTransientActivities = () => {
        const interrupted = Boolean(playgroundRun || playgroundScores.length);
        cancelPlaygroundRun();
        competitionDraft = null;
        if (interrupted) setMessage('已离开挑战页面，本次挑战已取消，未扣除游乐券。');
        renderCompetition();
    };
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') stopTransientActivities();
        else if (refreshLocal({ persist: writerOwned })) render();
    });
    window.addEventListener('pagehide', () => {
        writerEpoch += 1;
        writerOwned = false;
        writerLease?.release();
        writerLease = null;
        clearTimeout(cloudSaveTimer);
        stopTransientActivities();
    });
    window.addEventListener('pageshow', async (event) => {
        if (!event.persisted || !await obtainWriter()) return;
        if (refreshLocal({ retry: true })) { render(); await syncCloudState(); }
    });

    setInterval(() => {
        if (!state.adopted || storageError) return;
        const jobFinished = state.job?.status === 'working' && Date.now() >= state.job.endsAt;
        const explorationFinished = state.exploration?.status === 'traveling' && Date.now() >= state.exploration.endsAt;
        if (jobFinished || explorationFinished) {
            if (refreshLocal({ persist: writerOwned })) render(state.lastMessage);
            return;
        }
        updateBasicCooldowns();
        renderCurrentJob();
        renderCurrentExploration();
        renderNextAction();
        document.querySelectorAll('[data-pet-training]').forEach((button) => {
            const remaining = Math.max(0, (Number(state.lastTraining[button.dataset.petTraining]) || 0) - Date.now());
            const training = PET_TRAINING.find((entry) => entry.id === button.dataset.petTraining);
            const energyCost = Math.abs(training?.needs.energy || 0) * (getPetTalent(state).energyCost || 1);
            const healthLow = state.needs.health < 35;
            const energyLow = state.needs.energy < energyCost;
            button.disabled = remaining > 0 || Boolean(state.job || state.exploration || state.ailment) || healthLow || energyLow;
            button.textContent = remaining > 0 ? formatRemaining(remaining) : state.job ? '打工中' : state.exploration ? '探索中'
                : state.ailment ? '需要照顾' : healthLow ? '健康不足' : energyLow ? '体力不足' : '开始训练';
        });
    }, 1000);
    setInterval(() => {
        if (!state.adopted || document.visibilityState === 'hidden' || avatar?.hasAttribute('data-action')) return;
        setMessage(getContextDialogue());
    }, 16000);
    setInterval(() => {
        if (!state.adopted) return;
        if (!refreshLocal({ persist: writerOwned })) return;
        if (active) render();
        else updateWidgetVisibility();
    }, 30000);

    render(pendingOfflineMessage || state.lastMessage);
    if (initialError) showStorageNotice(initialError);
    obtainWriter().then(owned => { if (owned && !storageError) syncCloudState(); });
    return {
        render,
        resize: placeWidget,
        syncCloud: syncCloudState,
        pause() {
            active = false;
            cancelPlaygroundRun();
            competitionDraft = null;
        },
        resume() {
            active = true;
            const loaded = refreshLocal();
            if (!loaded) { render(); showStorageNotice(storageError); return; }
            const message = pendingOfflineMessage || [formatStreakReward(loaded.streakReward), formatOffline(loaded.elapsedMs)].filter(Boolean).join(' ') || state.lastMessage;
            pendingOfflineMessage = '';
            render(message);
            syncCloudState();
        },
    };
};
