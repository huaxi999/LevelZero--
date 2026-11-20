export const initRpsGame = ({
    computerChoiceDisplay,
    playerChoiceDisplay,
    rpsResult,
    rpsResultText,
    rpsButtons,
    winsEl,
    lossesEl,
    drawsEl,
    resetStatsBtn,
    getStoredStats,
    setStoredStats,
}) => {
    const TOTAL_LEVELS = 20;
    const MINI_BOSS_LEVEL = 10;
    const FINAL_BOSS_LEVEL = 20;
    const CHOICES = ['rock', 'paper', 'scissors'];

    const choiceMeta = {
        rock: { emoji: '✊', label: '石头', className: 'rock', key: '1' },
        scissors: { emoji: '✌️', label: '剪刀', className: 'scissors', key: '2' },
        paper: { emoji: '✋', label: '布', className: 'paper', key: '3' },
    };

    const enemyStyles = {
        balanced: { label: '平衡型', note: '节奏平均', weights: { rock: 1, scissors: 1, paper: 1 } },
        steady: { label: '稳健型', note: '偏保守', weights: { rock: 1.18, scissors: 0.92, paper: 1 } },
        aggressive: { label: '激进型', note: '进攻欲强', weights: { rock: 1.05, scissors: 1.26, paper: 0.9 } },
        swing: { label: '摇摆型', note: '节奏漂移', weights: { rock: 0.9, scissors: 1.08, paper: 1.25 } },
        pressure: { label: '压迫型', note: '出手强硬', weights: { rock: 1.32, scissors: 1.08, paper: 0.86 } },
        patient: { label: '耐心型', note: '偏慢热', weights: { rock: 0.95, scissors: 0.96, paper: 1.24 } },
        miniBoss: { label: '小 Boss', note: '铁壁节奏', weights: { rock: 1.34, scissors: 1.1, paper: 0.98 } },
        finalBoss: { label: '最终 Boss', note: '终局压迫', weights: { rock: 1.16, scissors: 1.28, paper: 1.08 } },
    };

    const levelStyles = [
        'steady', 'aggressive', 'swing', 'balanced', 'pressure',
        'patient', 'aggressive', 'swing', 'pressure', 'miniBoss',
        'balanced', 'steady', 'patient', 'aggressive', 'swing',
        'pressure', 'patient', 'steady', 'aggressive', 'finalBoss',
    ];

    const talents = [
        { id: 'rockScore', rarity: 'common', name: '岩拳熟练', desc: '出石头获胜时，本次胜利积分 +15%。' },
        { id: 'scissorsScore', rarity: 'common', name: '利刃节奏', desc: '出剪刀获胜时，本次胜利积分 +15%。' },
        { id: 'paperScore', rarity: 'common', name: '布阵压制', desc: '出布获胜时，本次胜利积分 +15%。' },
        { id: 'lastHeartScore', rarity: 'uncommon', name: '残心反击', desc: '普通关只剩 1 红心时获胜，胜利积分 +20%。' },
        { id: 'lastHeartCoin', rarity: 'uncommon', name: '险胜赏金', desc: '用最后 1 红心过普通关，金币 +1。' },
        { id: 'afterDrawScore', rarity: 'common', name: '僵持破局', desc: '平局后下一次获胜，胜利积分 +10%。' },
        { id: 'enemyRockDown', rarity: 'uncommon', name: '碎岩干扰', desc: '本局敌人出石头的倾向小幅降低。' },
        { id: 'enemyScissorsDown', rarity: 'uncommon', name: '钝刃干扰', desc: '本局敌人出剪刀的倾向小幅降低。' },
        { id: 'enemyPaperDown', rarity: 'uncommon', name: '破阵干扰', desc: '本局敌人出布的倾向小幅降低。' },
        { id: 'rockAfterNoRock', rarity: 'uncommon', name: '蓄力重拳', desc: '连续两次不出石头后，下一次石头获胜积分 +20%。' },
        { id: 'scissorsAfterDraw', rarity: 'uncommon', name: '僵局快剪', desc: '平局后出剪刀获胜，胜利积分 +25%。' },
        { id: 'paperLossShield', rarity: 'rare', name: '纸盾回合', desc: '每 3 关一次，普通关出布失败时不扣红心。' },
        { id: 'streakCoin', rarity: 'rare', name: '连关赏金', desc: '连续过关金币逐步 +1，最多 +3。' },
        { id: 'bossRoundScore', rarity: 'uncommon', name: 'Boss 专注', desc: 'Boss 战每赢一小局，胜利积分 +8%。' },
        { id: 'normalCoin', rarity: 'common', name: '小额战利品', desc: '普通关过关金币 +1。' },
        { id: 'bossCoin', rarity: 'uncommon', name: '斩首奖励', desc: '第 10 / 20 关胜利金币 +3。' },
        { id: 'softenStyle', rarity: 'rare', name: '扰乱节奏', desc: '敌人风格偏向程度小幅降低。' },
        { id: 'insightEvery4', rarity: 'rare', name: '战术洞察', desc: '每清掉 4 关，下一次胜利积分 +18%。' },
        { id: 'rareUp', rarity: 'rare', name: '灵感涌现', desc: '后续天赋选择中，稀有天赋出现率小幅提高。' },
        { id: 'allGesturesScore', rarity: 'uncommon', name: '三式循环', desc: '三种手势都至少赢过一次后，胜利积分 +10%。' },
        { id: 'gestureMastery', rarity: 'uncommon', name: '单式精通', desc: '某个手势赢 3 次后，该手势后续获胜积分 +10%。' },
        { id: 'counterRepeatScore', rarity: 'rare', name: '复读惩罚', desc: '敌人连续两次出同一手后，下次克制它获胜积分 +25%。' },
        { id: 'styleScout', rarity: 'common', name: '风格侦察', desc: '每关首次获胜时，胜利积分 +8%。' },
        { id: 'every5Coin', rarity: 'uncommon', name: '整备节点', desc: '每 5 关额外金币 +2。' },
        { id: 'drawShield', rarity: 'rare', name: '平局缓冲', desc: '普通关第一次平局后，下一次失败不扣红心，每关最多 1 次。' },
        { id: 'lateScore', rarity: 'uncommon', name: '后程发力', desc: '第 11 关后获胜，胜利积分 +12%。' },
        { id: 'finalBossRoundCoin', rarity: 'rare', name: '终局掠夺', desc: '第 20 关每赢一小局，金币 +1。' },
        { id: 'bossBehindScore', rarity: 'rare', name: '逆风爆发', desc: 'Boss 战落后一局时，下一局获胜积分 +30%。' },
        { id: 'differentThreeScore', rarity: 'uncommon', name: '变招连携', desc: '连续三次使用不同手势后，下一次获胜积分 +20%。' },
        { id: 'discount', rarity: 'common', name: '精打细算', desc: '刷新天赋价格 -1，最低为 1。' },
    ];

    const talentById = new Map(talents.map((talent) => [talent.id, talent]));
    const rarityWeight = { common: 10, uncommon: 7, rare: 4 };
    const rarityLabel = { common: '普通', uncommon: '进阶', rare: '稀有' };

    const rpsGame = document.querySelector('.rps-game');
    const rpsRoundStatus = document.getElementById('rps-round-status');
    const rpsTaunt = document.getElementById('rps-taunt');
    const rpsStreakEl = document.getElementById('rps-streak');
    const playerPanel = document.getElementById('player-panel');
    const computerPanel = document.getElementById('computer-panel');
    const levelEl = document.getElementById('rps-level');
    const scoreEl = document.getElementById('rps-score');
    const coinsEl = document.getElementById('rps-coins');
    const heartsEl = document.getElementById('rps-hearts');
    const styleEl = document.getElementById('rps-enemy-style');
    const bossScoreWrap = document.getElementById('rps-boss-score-wrap');
    const bossScoreEl = document.getElementById('rps-boss-score');
    const ownedTalentsEl = document.getElementById('rps-owned-talents');
    const talentPanel = document.getElementById('rps-talent-panel');
    const talentChoicesEl = document.getElementById('rps-talent-choices');
    const refreshTalentsBtn = document.getElementById('rps-refresh-talents');
    const refreshCostEl = document.getElementById('rps-refresh-cost');
    const talentTipEl = document.getElementById('rps-talent-tip');
    const endPanel = document.getElementById('rps-end-panel');
    const endKickerEl = document.getElementById('rps-end-kicker');
    const endTitleEl = document.getElementById('rps-end-title');
    const endSummaryEl = document.getElementById('rps-end-summary');
    const restartRunBtn = document.getElementById('rps-restart-run');

    const taunts = {
        idle: ['固定风格已锁定，电脑不会读取你的选择。', '普通关 2 颗红心，赢一次就过关。', 'Boss 关没有红心，只看小比分。'],
        win: ['这一手打穿了本关节奏。', '判断正确，奖励已经结算。', '稳定推进，下一关会更紧。'],
        lose: ['失手了，普通关会扣红心。', '这关还有机会，平局不会扣红心。', '换个思路，不要被风格标签牵着走。'],
        draw: ['平局不计奖励，也不扣红心。', '双方同手，再来一局。', '僵持住了，下一手重新判断。'],
        clear: ['关卡清除，选择一个本局天赋。', '过关奖励已发放，准备强化路线。', '奖励到手，选天赋进入下一关。'],
        fail: ['本局失败，点击重新开局再挑战。'],
    };

    let stats = getStoredStats();
    let state = null;
    let locked = false;
    let settlementTimer = null;
    let runId = 0;

    rpsButtons.forEach((btn) => {
        const meta = choiceMeta[btn.dataset.choice];
        if (meta) {
            btn.classList.add('hotkey-hint');
            btn.dataset.key = `快捷键 ${meta.key}`;
        }
    });

    const randomFrom = (list) => list[Math.floor(Math.random() * list.length)];
    const isBossLevel = (level) => level === MINI_BOSS_LEVEL || level === FINAL_BOSS_LEVEL;
    const bossTargetWins = (level) => level === FINAL_BOSS_LEVEL ? 3 : 2;
    const clampWeight = (value) => Math.max(0.18, value);

    const hasTalent = (id) => state?.ownedTalentIds.has(id);

    const getCounterChoice = (choice) => (
        choice === 'rock' ? 'paper' :
        choice === 'paper' ? 'scissors' :
        choice === 'scissors' ? 'rock' :
        'rock'
    );

    const escapeAttr = (text) => String(text)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const setRpsButtonsDisabled = (disabled) => {
        rpsButtons.forEach((btn) => { btn.disabled = disabled; });
    };

    const clearRpsMood = () => {
        rpsGame?.classList.remove('mood-win', 'mood-lose', 'mood-draw');
        playerPanel?.classList.remove('active', 'winner', 'loser');
        computerPanel?.classList.remove('active', 'winner', 'loser');
    };

    const setChoiceDisplay = (el, choice, reveal = false) => {
        if (!el) return;
        const meta = choiceMeta[choice];
        el.classList.remove('thinking', 'reveal');
        void el.offsetWidth;
        if (!meta) {
            el.textContent = '?';
            el.className = 'choice-display';
            return;
        }
        el.textContent = meta.emoji;
        el.className = `choice-display ${meta.className}${reveal ? ' reveal' : ''}`;
    };

    const setResult = (text, type = '') => {
        if (!rpsResultText) return;
        rpsResultText.textContent = text;
        rpsResultText.className = `result-text ${type}`.trim();
    };

    const getOutcome = (player, computer) => {
        if (player === computer) return 'draw';
        if (
            (player === 'rock' && computer === 'scissors') ||
            (player === 'paper' && computer === 'rock') ||
            (player === 'scissors' && computer === 'paper')
        ) {
            return 'win';
        }
        return 'lose';
    };

    const getEnemyWeights = () => {
        const style = enemyStyles[state.styleId] || enemyStyles.balanced;
        const weights = { ...style.weights };
        if (hasTalent('softenStyle')) {
            CHOICES.forEach((choice) => {
                weights[choice] = 1 + (weights[choice] - 1) * 0.68;
            });
        }
        if (hasTalent('enemyRockDown')) weights.rock *= 0.82;
        if (hasTalent('enemyScissorsDown')) weights.scissors *= 0.82;
        if (hasTalent('enemyPaperDown')) weights.paper *= 0.82;
        CHOICES.forEach((choice) => { weights[choice] = clampWeight(weights[choice]); });
        return weights;
    };

    const weightedChoice = (weights) => {
        const total = CHOICES.reduce((sum, choice) => sum + weights[choice], 0);
        let roll = Math.random() * total;
        for (const choice of CHOICES) {
            roll -= weights[choice];
            if (roll <= 0) return choice;
        }
        return CHOICES[CHOICES.length - 1];
    };

    const getComputerChoice = () => weightedChoice(getEnemyWeights());

    const getRefreshCost = () => hasTalent('discount') ? 1 : 2;

    const updateStatsUI = () => {
        if (winsEl) winsEl.textContent = String(stats.wins);
        if (lossesEl) lossesEl.textContent = String(stats.losses);
        if (drawsEl) drawsEl.textContent = String(stats.draws);
    };

    const updateOwnedTalentsUI = () => {
        if (!ownedTalentsEl) return;
        if (!state.ownedTalentIds.size) {
            ownedTalentsEl.textContent = '暂无天赋';
            return;
        }
        ownedTalentsEl.innerHTML = Array.from(state.ownedTalentIds)
            .map((id) => talentById.get(id))
            .filter(Boolean)
            .map((talent) => `<span class="rps-talent-pill ${talent.rarity}">${talent.name}</span>`)
            .join('');
    };

    const updateUI = () => {
        if (!state) return;
        const boss = isBossLevel(state.level);
        const style = enemyStyles[state.styleId] || enemyStyles.balanced;
        if (levelEl) levelEl.textContent = `${state.level} / ${TOTAL_LEVELS}`;
        if (scoreEl) scoreEl.textContent = String(state.score);
        if (coinsEl) coinsEl.textContent = String(state.coins);
        if (heartsEl) heartsEl.textContent = boss ? 'Boss' : '♥'.repeat(Math.max(0, state.hearts));
        if (styleEl) styleEl.textContent = hasTalent('styleScout') ? `${style.label} · 已侦察` : style.label;
        if (bossScoreWrap) bossScoreWrap.classList.toggle('hidden', !boss);
        if (bossScoreEl) bossScoreEl.textContent = `${state.bossPlayerWins} : ${state.bossEnemyWins}`;
        if (rpsRoundStatus) {
            const mode = boss ? (state.level === FINAL_BOSS_LEVEL ? '最终 Boss · 五局三胜' : '小 Boss · 三局两胜') : '普通战 · 2 红心';
            rpsRoundStatus.textContent = `第 ${state.level} 关 · ${mode}`;
        }
        if (rpsStreakEl) rpsStreakEl.textContent = `通关连胜：${state.clearStreak}`;
        updateOwnedTalentsUI();
        updateStatsUI();
        if (refreshCostEl) refreshCostEl.textContent = String(getRefreshCost());
        if (refreshTalentsBtn) refreshTalentsBtn.disabled = !state.talentPending || state.coins < getRefreshCost();
    };

    const setStageReadyText = () => {
        const style = enemyStyles[state.styleId] || enemyStyles.balanced;
        if (rpsTaunt) rpsTaunt.textContent = `${style.label}敌人登场：${style.note}。`;
        setResult(isBossLevel(state.level) ? 'Boss 关平局不计胜负，先达成目标小局数获胜。' : '普通关赢一次过关，失败扣 1 红心。');
    };

    const hideEndPanel = () => {
        endPanel?.classList.add('hidden');
    };

    const showEndPanel = ({ title, summary, type = 'fail' }) => {
        if (endKickerEl) endKickerEl.textContent = type === 'win' ? '挑战完成' : '本局结束';
        if (endTitleEl) endTitleEl.textContent = title;
        if (endSummaryEl) endSummaryEl.textContent = summary;
        endPanel?.classList.remove('hidden');
        window.setTimeout(() => restartRunBtn?.focus(), 0);
    };

    const startLevel = () => {
        state.styleId = levelStyles[state.level - 1] || 'balanced';
        state.bossPlayerWins = 0;
        state.bossEnemyWins = 0;
        state.hearts = isBossLevel(state.level) ? 0 : 2;
        state.levelWinScored = false;
        state.paperShieldAvailable = hasTalent('paperLossShield') && !isBossLevel(state.level) && state.level % 3 === 0;
        state.drawShieldArmed = false;
        state.drawShieldUsed = false;
        state.talentPending = false;
        state.currentTalentOffers = [];
        locked = false;
        talentPanel?.classList.add('hidden');
        hideEndPanel();
        clearRpsMood();
        setChoiceDisplay(computerChoiceDisplay, '');
        setChoiceDisplay(playerChoiceDisplay, '');
        setRpsButtonsDisabled(false);
        setStageReadyText();
        updateUI();
    };

    const startNewRun = () => {
        runId += 1;
        if (settlementTimer !== null) window.clearTimeout(settlementTimer);
        settlementTimer = null;
        state = {
            level: 1,
            score: 0,
            coins: 0,
            hearts: 2,
            clearStreak: 0,
            clearedLevels: 0,
            runActive: true,
            gameOver: false,
            talentPending: false,
            currentTalentOffers: [],
            ownedTalentIds: new Set(),
            styleId: 'steady',
            bossPlayerWins: 0,
            bossEnemyWins: 0,
            winCounts: { rock: 0, scissors: 0, paper: 0 },
            wonGestures: new Set(),
            playerHistory: [],
            enemyHistory: [],
            afterDrawWinReady: false,
            previousWasDraw: false,
            insightReady: false,
            differentGestureReady: false,
            levelWinScored: false,
            paperShieldAvailable: false,
            drawShieldArmed: false,
            drawShieldUsed: false,
        };
        startLevel();
    };

    const getTalentWeight = (talent) => {
        let weight = rarityWeight[talent.rarity] || 5;
        if (hasTalent('rareUp')) {
            if (talent.rarity === 'rare') weight *= 1.5;
            if (talent.rarity === 'uncommon') weight *= 1.12;
        }
        return weight;
    };

    const rollTalentOffers = () => {
        const pool = talents.filter((talent) => !state.ownedTalentIds.has(talent.id));
        const offers = [];
        const working = [...pool];
        while (offers.length < 3 && working.length) {
            const total = working.reduce((sum, talent) => sum + getTalentWeight(talent), 0);
            let roll = Math.random() * total;
            const index = working.findIndex((talent) => {
                roll -= getTalentWeight(talent);
                return roll <= 0;
            });
            const pickedIndex = index >= 0 ? index : working.length - 1;
            offers.push(working[pickedIndex]);
            working.splice(pickedIndex, 1);
        }
        return offers;
    };

    const renderTalentOffers = () => {
        if (!talentChoicesEl) return;
        talentChoicesEl.innerHTML = state.currentTalentOffers.map((talent) => `
            <button class="rps-talent-choice ${talent.rarity}" data-talent-id="${escapeAttr(talent.id)}">
                <span class="rps-talent-rarity">${rarityLabel[talent.rarity] || '天赋'}</span>
                <strong>${talent.name}</strong>
                <span>${talent.desc}</span>
            </button>
        `).join('');
        talentChoicesEl.querySelectorAll('.rps-talent-choice').forEach((button) => {
            button.addEventListener('click', () => chooseTalent(button.dataset.talentId));
        });
        if (talentTipEl) talentTipEl.textContent = '三选一，选择后进入下一关。刷新只消耗本局金币。';
        updateUI();
    };

    const focusTalentSelection = () => {
        window.setTimeout(() => {
            talentPanel?.scrollIntoView?.({ block: 'center', inline: 'nearest' });
            talentChoicesEl?.querySelector('.rps-talent-choice')?.focus();
        }, 0);
    };

    const showTalentSelection = () => {
        state.talentPending = true;
        state.currentTalentOffers = rollTalentOffers();
        setRpsButtonsDisabled(true);
        talentPanel?.classList.remove('hidden');
        renderTalentOffers();
        focusTalentSelection();
    };

    const chooseTalent = (talentId) => {
        if (!state.talentPending || !talentById.has(talentId)) return;
        state.ownedTalentIds.add(talentId);
        state.level += 1;
        startLevel();
    };

    const refreshTalentOffers = () => {
        if (!state?.talentPending) return;
        const cost = getRefreshCost();
        if (state.coins < cost) {
            if (talentTipEl) talentTipEl.textContent = '金币不足，无法刷新。';
            return;
        }
        state.coins -= cost;
        state.currentTalentOffers = rollTalentOffers();
        renderTalentOffers();
        focusTalentSelection();
    };

    const addPlayerHistory = (playerChoice, computerChoice) => {
        state.playerHistory.push(playerChoice);
        state.enemyHistory.push(computerChoice);
        if (state.playerHistory.length > 12) state.playerHistory.shift();
        if (state.enemyHistory.length > 12) state.enemyHistory.shift();
        const lastThree = state.playerHistory.slice(-3);
        if (hasTalent('differentThreeScore') && lastThree.length === 3 && new Set(lastThree).size === 3) {
            state.differentGestureReady = true;
        }
    };

    const calculateWinScore = ({ playerChoice, level, isBoss, heartsBefore }) => {
        const base = isBoss ? 55 + level * 8 : 90 + level * 13;
        let multiplier = 1;
        const bonusText = [];
        const addBonus = (amount, label) => {
            multiplier += amount;
            bonusText.push(label);
        };

        if (playerChoice === 'rock' && hasTalent('rockScore')) addBonus(0.15, '岩拳');
        if (playerChoice === 'scissors' && hasTalent('scissorsScore')) addBonus(0.15, '利刃');
        if (playerChoice === 'paper' && hasTalent('paperScore')) addBonus(0.15, '布阵');
        if (!isBoss && heartsBefore === 1 && hasTalent('lastHeartScore')) addBonus(0.2, '残心');
        if (state.afterDrawWinReady) {
            if (hasTalent('afterDrawScore')) addBonus(0.1, '破局');
            state.afterDrawWinReady = false;
        }
        if (hasTalent('rockAfterNoRock') && playerChoice === 'rock') {
            const lastTwo = state.playerHistory.slice(-2);
            if (lastTwo.length === 2 && lastTwo.every((choice) => choice !== 'rock')) addBonus(0.2, '蓄力');
        }
        if (hasTalent('scissorsAfterDraw') && state.previousWasDraw && playerChoice === 'scissors') addBonus(0.25, '快剪');
        if (isBoss && hasTalent('bossRoundScore')) addBonus(0.08, '专注');
        if (hasTalent('allGesturesScore') && state.wonGestures.size === 3) addBonus(0.1, '三式');
        if (hasTalent('gestureMastery') && state.winCounts[playerChoice] >= 3) addBonus(0.1, '精通');
        if (hasTalent('counterRepeatScore')) {
            const lastTwoEnemy = state.enemyHistory.slice(-2);
            if (lastTwoEnemy.length === 2 && lastTwoEnemy[0] === lastTwoEnemy[1] && getCounterChoice(lastTwoEnemy[0]) === playerChoice) {
                addBonus(0.25, '复读惩罚');
            }
        }
        if (hasTalent('styleScout') && !state.levelWinScored) addBonus(0.08, '侦察');
        if (level >= 11 && hasTalent('lateScore')) addBonus(0.12, '后程');
        if (isBoss && state.bossEnemyWins > state.bossPlayerWins && hasTalent('bossBehindScore')) addBonus(0.3, '逆风');
        if (state.insightReady) {
            if (hasTalent('insightEvery4')) addBonus(0.18, '洞察');
            state.insightReady = false;
        }
        if (state.differentGestureReady) {
            if (hasTalent('differentThreeScore')) addBonus(0.2, '变招');
            state.differentGestureReady = false;
        }

        return {
            points: Math.round(base * multiplier),
            bonusText,
        };
    };

    const finishRun = () => {
        state.runActive = false;
        state.gameOver = true;
        locked = false;
        setRpsButtonsDisabled(true);
        setResult(`20 关通关！最终积分 ${state.score}，金币 ${state.coins}。`, 'win');
        window.dispatchEvent(new CustomEvent('rosang:game-result', { detail: { game: 'rps', victory: true, score: state.score } }));
        if (rpsTaunt) rpsTaunt.textContent = '本局天赋已结算，重新开局会清空本局天赋。';
        showEndPanel({
            title: '20 关通关',
            summary: `最终积分 ${state.score}，金币 ${state.coins}。点击重新开始挑战新路线。`,
            type: 'win',
        });
        updateUI();
    };

    const failRun = () => {
        stats.losses += 1;
        setStoredStats(stats);
        state.runActive = false;
        state.gameOver = true;
        state.clearStreak = 0;
        locked = false;
        setRpsButtonsDisabled(true);
        rpsGame?.classList.add('mood-lose');
        setResult(`本局失败，止步第 ${state.level} 关。最终积分 ${state.score}，金币 ${state.coins}。`, 'lose');
        window.dispatchEvent(new CustomEvent('rosang:game-result', { detail: { game: 'rps', victory: false, score: state.score } }));
        if (rpsTaunt) rpsTaunt.textContent = randomFrom(taunts.fail);
        showEndPanel({
            title: '挑战失败',
            summary: `止步第 ${state.level} 关 · 积分 ${state.score} · 金币 ${state.coins}`,
            type: 'fail',
        });
        updateUI();
    };

    const clearLevel = ({ heartsBefore, scoreText = '' }) => {
        const level = state.level;
        const boss = isBossLevel(level);
        let clearScore = boss ? (level === FINAL_BOSS_LEVEL ? 420 : 180) : 25 + level * 5;
        let coinGain = boss ? (level === FINAL_BOSS_LEVEL ? 10 : 5) : 2;
        const rewards = [];

        if (!boss && heartsBefore === 1 && hasTalent('lastHeartCoin')) {
            coinGain += 1;
            rewards.push('险胜 +1 金币');
        }
        if (!boss && hasTalent('normalCoin')) {
            coinGain += 1;
            rewards.push('普通关 +1 金币');
        }
        if (boss && hasTalent('bossCoin')) {
            coinGain += 3;
            rewards.push('Boss +3 金币');
        }
        if (hasTalent('every5Coin') && level % 5 === 0) {
            coinGain += 2;
            rewards.push('整备 +2 金币');
        }

        state.clearStreak += 1;
        if (hasTalent('streakCoin')) {
            const streakBonus = Math.min(3, state.clearStreak);
            coinGain += streakBonus;
            rewards.push(`连关 +${streakBonus} 金币`);
        }

        state.score += clearScore;
        state.coins += coinGain;
        state.clearedLevels += 1;
        if (hasTalent('insightEvery4') && state.clearedLevels % 4 === 0) {
            state.insightReady = true;
            rewards.push('获得洞察');
        }

        stats.wins += 1;
        setStoredStats(stats);

        const rewardText = [`过关 +${clearScore} 分`, `+${coinGain} 金币`, ...rewards].join(' · ');
        setResult(`${scoreText}${scoreText ? '。' : ''}${rewardText}`, 'win');
        if (rpsTaunt) rpsTaunt.textContent = level === TOTAL_LEVELS ? '最终 Boss 已击败。' : randomFrom(taunts.clear);
        updateUI();

        if (level >= TOTAL_LEVELS) {
            finishRun();
            return;
        }
        showTalentSelection();
    };

    const handleWin = ({ playerChoice, computerChoice, isBoss, heartsBefore }) => {
        const { points, bonusText } = calculateWinScore({ playerChoice, level: state.level, isBoss, heartsBefore });
        state.score += points;
        state.levelWinScored = true;
        state.winCounts[playerChoice] += 1;
        state.wonGestures.add(playerChoice);

        if (isBoss) {
            state.bossPlayerWins += 1;
            if (state.level === FINAL_BOSS_LEVEL && hasTalent('finalBossRoundCoin')) state.coins += 1;
            const scoreText = `小局胜利 +${points} 分${bonusText.length ? `（${bonusText.join('、')}）` : ''}`;
            if (state.bossPlayerWins >= bossTargetWins(state.level)) {
                clearLevel({ heartsBefore, scoreText });
            } else {
                setResult(`${scoreText}，Boss 小比分 ${state.bossPlayerWins}:${state.bossEnemyWins}`, 'win');
                if (rpsTaunt) rpsTaunt.textContent = randomFrom(taunts.win);
            }
            return;
        }

        const scoreText = `胜利 +${points} 分${bonusText.length ? `（${bonusText.join('、')}）` : ''}`;
        clearLevel({ heartsBefore, scoreText });
    };

    const handleLoss = ({ playerChoice, isBoss }) => {
        if (isBoss) {
            state.bossEnemyWins += 1;
            if (state.bossEnemyWins >= bossTargetWins(state.level)) {
                failRun();
                return;
            }
            setResult(`Boss 拿下一小局，小比分 ${state.bossPlayerWins}:${state.bossEnemyWins}。`, 'lose');
            if (rpsTaunt) rpsTaunt.textContent = 'Boss 关没有红心，继续争取目标胜局。';
            return;
        }

        let shieldText = '';
        if (hasTalent('paperLossShield') && playerChoice === 'paper' && state.paperShieldAvailable) {
            state.paperShieldAvailable = false;
            shieldText = '纸盾触发，本次不扣红心。';
        } else if (hasTalent('drawShield') && state.drawShieldArmed) {
            state.drawShieldArmed = false;
            state.drawShieldUsed = true;
            shieldText = '平局缓冲触发，本次不扣红心。';
        } else {
            state.hearts -= 1;
        }

        if (state.hearts <= 0) {
            failRun();
            return;
        }
        setResult(`${shieldText || '失败扣 1 红心。'}剩余 ${state.hearts} 红心。`, 'lose');
        if (rpsTaunt) rpsTaunt.textContent = randomFrom(taunts.lose);
    };

    const handleDraw = (isBoss) => {
        stats.draws += 1;
        setStoredStats(stats);
        state.afterDrawWinReady = true;
        if (!isBoss && hasTalent('drawShield') && !state.drawShieldUsed && !state.drawShieldArmed) {
            state.drawShieldArmed = true;
        }
        setResult(isBoss ? 'Boss 关平局不计胜负，继续该小局。' : '平局不扣红心，也不发积分金币。', 'draw');
        if (rpsTaunt) rpsTaunt.textContent = randomFrom(taunts.draw);
    };

    const handleRpsPick = (playerChoice) => {
        if (!state?.runActive || state.gameOver || state.talentPending || locked || !choiceMeta[playerChoice]) return;

        const computerChoice = getComputerChoice();
        const isBoss = isBossLevel(state.level);
        const heartsBefore = state.hearts;
        locked = true;
        clearRpsMood();
        setRpsButtonsDisabled(true);
        setChoiceDisplay(playerChoiceDisplay, playerChoice, true);
        if (computerChoiceDisplay) {
            computerChoiceDisplay.textContent = '…';
            computerChoiceDisplay.className = 'choice-display thinking';
        }
        playerPanel?.classList.add('active');
        computerPanel?.classList.add('active');
        setResult('出拳中……');

        const pickRunId = runId;
        settlementTimer = window.setTimeout(() => {
            if (pickRunId !== runId) return;
            settlementTimer = null;
            const outcome = getOutcome(playerChoice, computerChoice);
            const playerLabel = choiceMeta[playerChoice].label;
            const computerLabel = choiceMeta[computerChoice].label;
            setChoiceDisplay(computerChoiceDisplay, computerChoice, true);
            clearRpsMood();

            if (outcome === 'win') {
                rpsGame?.classList.add('mood-win');
                playerPanel?.classList.add('winner');
                computerPanel?.classList.add('loser');
                handleWin({ playerChoice, computerChoice, isBoss, heartsBefore });
            } else if (outcome === 'lose') {
                rpsGame?.classList.add('mood-lose');
                playerPanel?.classList.add('loser');
                computerPanel?.classList.add('winner');
                handleLoss({ playerChoice, computerChoice, isBoss });
            } else {
                rpsGame?.classList.add('mood-draw');
                handleDraw(isBoss);
            }

            if (!state.gameOver) {
                const prefix = `你出${playerLabel}，电脑出${computerLabel}。`;
                if (rpsResultText?.textContent && !rpsResultText.textContent.startsWith('本局失败')) {
                    rpsResultText.textContent = `${prefix}${rpsResultText.textContent}`;
                }
            }

            addPlayerHistory(playerChoice, computerChoice);
            state.previousWasDraw = outcome === 'draw';
            updateUI();
            locked = false;
            if (state.runActive && !state.talentPending && !state.gameOver) {
                setRpsButtonsDisabled(false);
            }
        }, 420);
    };

    rpsButtons.forEach((btn) => {
        btn.addEventListener('click', () => handleRpsPick(btn.dataset.choice));
    });

    refreshTalentsBtn?.addEventListener('click', refreshTalentOffers);
    restartRunBtn?.addEventListener('click', startNewRun);

    resetStatsBtn?.addEventListener('click', () => {
        startNewRun();
    });

    window.addEventListener('keydown', (event) => {
        const rpsSection = document.getElementById('rps');
        const isRpsActive = rpsSection && !rpsSection.classList.contains('hidden');
        const targetTag = event.target?.tagName?.toLowerCase();
        if (!isRpsActive || rpsSection.closest?.('.hidden') || document.getElementById('main-page')?.classList.contains('hidden')
            || document.hidden || ['input', 'textarea', 'select'].includes(targetTag) || event.target?.isContentEditable
            || event.isComposing || event.keyCode === 229 || event.key === 'Process'
            || locked || state?.talentPending || state?.gameOver) return;
        const keyChoice = event.key === '1' ? 'rock' : event.key === '2' ? 'scissors' : event.key === '3' ? 'paper' : '';
        if (keyChoice) handleRpsPick(keyChoice);
    });

    updateStatsUI();
    startNewRun();

    return {
        restart: startNewRun,
        pause: () => {
            if (settlementTimer === null) return;
            runId += 1;
            window.clearTimeout(settlementTimer);
            settlementTimer = null;
            locked = false;
            clearRpsMood();
            setChoiceDisplay(computerChoiceDisplay, '');
            setChoiceDisplay(playerChoiceDisplay, '');
            setStageReadyText();
            setRpsButtonsDisabled(!state.runActive || state.talentPending || state.gameOver);
        },
    };
};
