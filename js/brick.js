export const initBrickGame = ({ dom, storage, submitCloudScore, isTypingTarget, rectHit }) => {
    const {
        brickCanvas,
        brickScoreEl,
        brickLevelEl,
        brickLivesEl,
        brickBallsEl,
        brickBuffEl,
        brickStartBtn,
        brickRestartBtn,
        brickPauseBtn,
        brickCoinsEl,
        brickUpgradeButtons = [],
    } = dom;
    const brickCtx = brickCanvas.getContext('2d');
    const BRICK = {
        running: false,
        paused: false,
        gameOver: false,
        score: 0,
        level: 1,
        lives: 3,
        width: 0,
        height: 0,
        lastTime: 0,
        fireStacks: 0,
        fireTimer: 0,
        paddleStacks: 0,
        paddleTimer: 0,
        speedStacks: 0,
        speedTimer: 0,
        combo: 0,
        comboTimer: 0,
        message: '',
        messageTimer: 0,
        shakeTimer: 0,
        shakeIntensity: 0,
        magnetTimer: 0,
        scoreBoostTimer: 0,
        scoreMultiplier: 1,
        slowTimeTimer: 0,
        giantBallTimer: 0,
        rapidFireTimer: 0,
        pierceTimer: 0,
        bestCombo: 0,
        feverTimer: 0,
        levelStartTime: 0,
        levelHits: 0,
        coinsEarned: 0,
        upgradePending: false,
        upgradeChoices: [],
        rerollUsed: false,
        graceReady: false,
        activeKeys: 0,
    };

    let brickPaddle = null;
    let brickBalls = [];
    let brickBricks = [];
    let brickPowerUps = [];
    let brickParticles = [];
    let brickAnimId = 0;
    const scheduleBrickFrame = () => {
        if (brickAnimId) cancelAnimationFrame(brickAnimId);
        brickAnimId = requestAnimationFrame(loopBrick);
    };
    const brickKeys = {};
    const brickPointer = { active: false, x: 0 };
    const brickRunUpgrades = {};
    let lastBrickHudState = null;
    let brickBackgroundCache = null;
    let brickWallet = storage?.getStoredBrickWallet?.() || { coins: 0 };
    let brickMetaUpgrades = storage?.getStoredBrickUpgrades?.() || {};
    const brickRunUpgradePanel = document.getElementById('brick-run-upgrade-panel');
    const brickRunUpgradeChoicesEl = document.getElementById('brick-run-upgrade-choices');
    const brickRerollUpgradesBtn = document.getElementById('brick-reroll-upgrades');
    const brickEndPanel = document.getElementById('brick-end-panel');
    const brickEndTitleEl = document.getElementById('brick-end-title');
    const brickEndSummaryEl = document.getElementById('brick-end-summary');
    const brickEndRestartBtn = document.getElementById('brick-end-restart');
    const brickTouchLeftBtn = document.getElementById('brick-touch-left');
    const brickTouchRightBtn = document.getElementById('brick-touch-right');
    const brickTouchLaunchBtn = document.getElementById('brick-touch-launch');
    const BRICK_MAX_BALLS = 18;
    const BRICK_MAX_POWERUPS = 12;
    const BRICK_MAX_PARTICLES = 90;
    const BRICK_BASE_DROP_RATE = 0.18;
    const BRICK_UPGRADE_COSTS = {
        life: [90],
        paddle: [70, 110, 160, 220, 290],
        slowBall: [80, 130, 190],
        coinGain: [80, 130, 190, 260, 340],
        magnetRange: [70, 115, 170, 235],
        reroll: [180],
    };
    const BRICK_UPGRADE_LABELS = {
        life: '初始生命',
        paddle: '初始板宽',
        slowBall: '初始球速',
        coinGain: '金币收益',
        magnetRange: '吸附范围',
        reroll: '强化刷新',
    };
    const BRICK_KIND_META = {
        normal: { label: '', color: '#246b8a', stroke: 'rgba(93,229,255,0.48)' },
        coin: { label: 'COIN', color: '#c89525', stroke: 'rgba(255,216,112,0.82)' },
        explosive: { label: 'BOOM', color: '#a7382e', stroke: 'rgba(255,95,61,0.86)' },
        shield: { label: 'SHIELD', color: '#4b66a8', stroke: 'rgba(157,192,255,0.78)' },
        bonus: { label: 'DROP', color: '#2c9267', stroke: 'rgba(93,255,190,0.78)' },
        danger: { label: 'RISK', color: '#82253e', stroke: 'rgba(255,72,116,0.82)' },
        key: { label: 'KEY', color: '#b98625', stroke: 'rgba(255,210,92,0.9)' },
        locked: { label: 'LOCK', color: '#3b4357', stroke: 'rgba(188,199,220,0.62)' },
        moving: { label: 'MOVE', color: '#276f7f', stroke: 'rgba(93,229,255,0.78)' },
        reflector: { label: 'TURN', color: '#6f3aa6', stroke: 'rgba(205,146,255,0.82)' },
    };
    const DEFAULT_RUN_UPGRADES = {
        damage: 0,
        paddleScale: 0,
        dropRate: 0,
        comboTime: 0,
        startPowerups: 0,
        scoreBonus: 0,
        comboKeep: 0,
        grace: 0,
    };

    const brickPowerMeta = {
        split:       { icon: '🟢', label: '分裂球', color: '#00ff88' },
        fire:        { icon: '🔥', label: '火力', color: '#ffd700' },
        doubleSplit: { icon: '🟣', label: '双倍分裂', color: '#b388ff' },
        longPaddle:  { icon: '📏', label: '加长板', color: '#00d4ff' },
        speedBoots:  { icon: '👟', label: '疾跑靴', color: '#ff9f43' },
        magnet:      { icon: '🧲', label: '磁力球', color: '#ff66cc' },
        extraLife:   { icon: '❤️', label: '额外生命', color: '#ff3366' },
        scoreBoost:  { icon: '💎', label: '分数加倍', color: '#ffd700' },
        slowTime:    { icon: '⏳', label: '时间减速', color: '#66ccff' },
        giantBall:   { icon: '🔵', label: '巨球', color: '#ff66cc' },
        rapidFire:   { icon: '⚡', label: '急速', color: '#ffcc00' },
        brickBomb:   { icon: '💥', label: '炸弹', color: '#ff3366' },
        pierce:      { icon: '◆', label: '穿透', color: '#9fffd7' },
        hazard:      { icon: '!', label: '过载', color: '#ff426d' },
    };

    const brickUpgradePool = [
        { id: 'damage', title: '精准重击', desc: '球伤害 +1，最多叠 3 次', max: 3, apply: () => { brickRunUpgrades.damage += 1; } },
        { id: 'paddleScale', title: '宽板改装', desc: '本局发射板宽度 +12%', max: 4, apply: () => { brickRunUpgrades.paddleScale += 0.12; } },
        { id: 'dropRate', title: '补给雷达', desc: '道具掉率 +4%', max: 5, apply: () => { brickRunUpgrades.dropRate += 0.04; } },
        { id: 'comboTime', title: '连击延长', desc: '连击保留时间 +0.8 秒', max: 4, apply: () => { brickRunUpgrades.comboTime += 800; } },
        { id: 'startPowerups', title: '开局补给', desc: '每关开始额外掉落 1 个普通道具', max: 3, apply: () => { brickRunUpgrades.startPowerups += 1; } },
        { id: 'scoreBonus', title: '街机倍率', desc: '本局分数倍率 +10%', max: 5, apply: () => { brickRunUpgrades.scoreBonus += 0.10; } },
        { id: 'comboKeep', title: '失误续势', desc: '掉球后保留 30% 连击', max: 1, apply: () => { brickRunUpgrades.comboKeep = 1; } },
        { id: 'grace', title: '保险弹匣', desc: '首次掉球不扣生命，每局一次', max: 1, apply: () => { brickRunUpgrades.grace = 1; BRICK.graceReady = true; } },
    ];

    const resetRunUpgrades = () => {
        Object.assign(brickRunUpgrades, DEFAULT_RUN_UPGRADES);
    };

    resetRunUpgrades();

    const getUpgradeLevel = (key) => Math.max(0, Math.floor(Number(brickMetaUpgrades?.[key]) || 0));
    const getUpgradeCost = (key) => BRICK_UPGRADE_COSTS[key]?.[getUpgradeLevel(key)] || 0;
    const getInitialLives = () => 3 + Math.min(1, getUpgradeLevel('life'));
    const getMetaPaddleScale = () => 1 + Math.min(0.10, getUpgradeLevel('paddle') * 0.02);
    const getMetaBallSpeedScale = () => 1 - Math.min(0.06, getUpgradeLevel('slowBall') * 0.02);
    const getCoinGainScale = () => 1 + Math.min(0.15, getUpgradeLevel('coinGain') * 0.03);
    const getPowerupAttractRange = () => 190 * (1 + Math.min(0.20, getUpgradeLevel('magnetRange') * 0.05));

    const addBrickCoins = (amount) => {
        const next = Math.max(0, Math.floor(amount * getCoinGainScale()));
        BRICK.coinsEarned += next;
        updateBrickEconomyUI();
        return next;
    };

    const updateBrickEconomyUI = () => {
        brickWallet = storage?.getStoredBrickWallet?.() || brickWallet || { coins: 0 };
        brickMetaUpgrades = storage?.getStoredBrickUpgrades?.() || brickMetaUpgrades || {};
        if (brickCoinsEl) {
            brickCoinsEl.textContent = `金币 ${brickWallet.coins || 0}  本局 +${BRICK.coinsEarned || 0}`;
        }
        brickUpgradeButtons.forEach((btn) => {
            const key = btn.dataset.brickUpgrade;
            const max = storage?.BRICK_UPGRADE_MAX?.[key] ?? 0;
            const level = getUpgradeLevel(key);
            const cost = getUpgradeCost(key);
            const label = BRICK_UPGRADE_LABELS[key] || key;
            const capped = level >= max;
            btn.innerHTML = capped
                ? `<span class="brick-upgrade-name">${label}</span><span class="brick-upgrade-meta">Lv.${level} 已满</span>`
                : `<span class="brick-upgrade-name">${label}</span><span class="brick-upgrade-meta">Lv.${level} · ${cost} 金币</span>`;
            btn.disabled = capped || (brickWallet.coins || 0) < cost || BRICK.running;
        });
    };

    const buyBrickUpgrade = (key) => {
        const max = storage?.BRICK_UPGRADE_MAX?.[key] ?? 0;
        const level = getUpgradeLevel(key);
        const cost = getUpgradeCost(key);
        if (!cost || level >= max || (brickWallet.coins || 0) < cost || BRICK.running) return;
        brickWallet = storage.setStoredBrickWallet({ coins: brickWallet.coins - cost });
        brickMetaUpgrades = storage.setStoredBrickUpgrades({ ...brickMetaUpgrades, [key]: level + 1 });
        updateBrickEconomyUI();
        resetBrickGame();
        drawBrickGame();
    };

    const getSpecialBrickKind = (r, c, rowRatio) => {
        const roll = hashBrick(BRICK.level, r, c, 59);
        const specialRate = Math.min(0.36, 0.12 + BRICK.level * 0.012);
        if (roll > specialRate) return 'normal';
        if (roll < 0.020) return 'key';
        if (roll < 0.050 && BRICK.level >= 2) return 'locked';
        if (roll < 0.085) return 'coin';
        if (roll < 0.120 && BRICK.level >= 2) return 'explosive';
        if (roll < 0.155 && BRICK.level >= 2) return 'shield';
        if (roll < 0.190) return 'bonus';
        if (roll < 0.225 && BRICK.level >= 3) return 'danger';
        if (roll < 0.270 && BRICK.level >= 4) return 'moving';
        if (roll < 0.320 && BRICK.level >= 5 && rowRatio > 0.15) return 'reflector';
        return 'normal';
    };

    const resizeBrickCanvas = () => {
        const parentWidth = brickCanvas.parentElement?.clientWidth || 800;
        const maxByWidth = Math.floor(parentWidth * 0.98);
        const heightRatio = window.innerWidth <= 700 ? 0.62 : 0.82;
        const maxByHeight = Math.floor(window.innerHeight * heightRatio * 16 / 15);
        const minWidth = Math.min(360, Math.max(300, maxByWidth));
        const width = Math.max(minWidth, Math.min(maxByWidth, 1080, maxByHeight));
        const height = Math.round(width * 15 / 16);
        const ratio = Math.min(2, window.devicePixelRatio || 1);
        const keepRunSize = (BRICK.running || BRICK.gameOver) && BRICK.width > 0 && BRICK.height > 0;
        const logicalWidth = keepRunSize ? BRICK.width : width;
        const logicalHeight = keepRunSize ? BRICK.height : height;
        brickCanvas.width = Math.round(width * ratio);
        brickCanvas.height = Math.round(height * ratio);
        brickCanvas.style.width = `${width}px`;
        brickCanvas.style.height = `${height}px`;
        brickCtx.setTransform(ratio * width / logicalWidth, 0, 0, ratio * height / logicalHeight, 0, 0);
        BRICK.width = logicalWidth;
        BRICK.height = logicalHeight;
        brickBackgroundCache = null;
        if (brickPaddle) {
            brickPaddle.y = BRICK.height - 54;
            brickPaddle.x = Math.max(brickPaddle.w / 2, Math.min(BRICK.width - brickPaddle.w / 2, brickPaddle.x));
        }
    };

    const hashBrick = (level, r, c, extra = 0) => {
        const x = Math.sin(level * 928.133 + r * 57.731 + c * 131.719 + extra * 19.91) * 10000;
        return x - Math.floor(x);
    };

    const getPaddleScale = () => Math.min(3, getMetaPaddleScale() + brickRunUpgrades.paddleScale + BRICK.paddleStacks * 0.15);
    const getSpeedScale = () => Math.min(3, 1 + BRICK.speedStacks * 0.10);
    const getBallDamage = () => 1 + brickRunUpgrades.damage + BRICK.fireStacks + (BRICK.giantBallTimer > 0 ? 1 : 0);
    const getBallSize = () => BRICK.giantBallTimer > 0 ? 13 : 7;
    const getBallSpeedMult = () => BRICK.rapidFireTimer > 0 ? 1.3 : (BRICK.slowTimeTimer > 0 ? 0.6 : 1);
    const getCurrentScoreMultiplier = () => (BRICK.scoreMultiplier || 1) + (BRICK.feverTimer > 0 ? 1 : 0) + brickRunUpgrades.scoreBonus;

    const updateBrickHud = () => {
        const scoreText = String(BRICK.score);
        const levelText = String(BRICK.level);
        const livesText = String(BRICK.lives);
        const ballsText = String(brickBalls.length);
        const buffs = [];
        if (BRICK.fireStacks > 0) buffs.push(`🔥伤害+${BRICK.fireStacks}`);
        if (BRICK.paddleStacks > 0) buffs.push(`📏长度+${Math.round((getPaddleScale() - 1) * 100)}%`);
        if (BRICK.speedStacks > 0) buffs.push(`👟速度+${Math.round((getSpeedScale() - 1) * 100)}%`);
        if (BRICK.combo > 1) buffs.push(`连击×${BRICK.combo}`);
        if (BRICK.feverTimer > 0) buffs.push('FEVER加分');
        if (BRICK.slowTimeTimer > 0) buffs.push('⏳减速');
        if (BRICK.giantBallTimer > 0) buffs.push('🔵巨球');
        if (BRICK.rapidFireTimer > 0) buffs.push('⚡急速');
        if (BRICK.pierceTimer > 0) buffs.push('◆穿透');
        const buffText = buffs.join('  ') || (BRICK.running ? '普通模式' : '准备发射');
        const state = `${scoreText}|${levelText}|${livesText}|${ballsText}|${buffText}`;
        if (state === lastBrickHudState) return;
        lastBrickHudState = state;
        brickScoreEl.textContent = scoreText;
        brickLevelEl.textContent = levelText;
        brickLivesEl.textContent = livesText;
        brickBallsEl.textContent = ballsText;
        brickBuffEl.textContent = buffText;
    };

    const setBrickMessage = (text, duration = 1000) => {
        BRICK.message = text;
        BRICK.messageTimer = duration;
    };

    const hideBrickEndPanel = () => {
        brickEndPanel?.classList.add('hidden');
    };

    const showBrickEndPanel = ({ title, summary }) => {
        if (brickEndTitleEl) brickEndTitleEl.textContent = title;
        if (brickEndSummaryEl) brickEndSummaryEl.textContent = summary;
        brickEndPanel?.classList.remove('hidden');
        window.setTimeout(() => brickEndRestartBtn?.focus(), 0);
    };

    const triggerBrickShake = (intensity = 2, duration = 120) => {
        BRICK.shakeIntensity = Math.max(BRICK.shakeIntensity, intensity);
        BRICK.shakeTimer = Math.max(BRICK.shakeTimer, duration);
    };

    const addBrickParticles = (x, y, color, count = 5) => {
        const safeCount = Math.max(0, Math.min(count, BRICK_MAX_PARTICLES - brickParticles.length));
        for (let i = 0; i < safeCount; i += 1) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 45 + Math.random() * 90;
            brickParticles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.22 + Math.random() * 0.22,
                maxLife: 0.44,
                color,
                size: 2 + Math.random() * 2,
                drag: 0.94 + Math.random() * 0.035,
            });
        }
        if (brickParticles.length > BRICK_MAX_PARTICLES) brickParticles.splice(0, brickParticles.length - BRICK_MAX_PARTICLES);
    };

    const shouldKeepBrick = (pattern, r, c, rows, cols, level) => {
        const mid = (cols - 1) / 2;
        const rand = hashBrick(level, r, c, 9);
        if (pattern === 0) return rand > 0.05;
        if (pattern === 1) return r < 2 || (r + c) % 2 === 0 || rand > 0.62;
        if (pattern === 2) return Math.abs(c - mid) <= Math.max(1.5, (r + 2) * cols / (rows * 2.15)) || rand > 0.82;
        if (pattern === 3) return ((c + r * 2 + level) % 4 !== 0) && rand > 0.08;
        if (pattern === 4) return c % 3 !== 1 || r % 2 === 0 || rand > 0.72;
        return r === 0 || r === rows - 1 || c === 0 || c === cols - 1 || Math.abs(c - mid) < 1.2 || rand > 0.70;
    };

    function createBrickLayout() {
        const cols = Math.min(14, 9 + Math.floor((BRICK.level - 1) / 3));
        const rows = Math.min(11, 5 + Math.floor((BRICK.level - 1) / 2));
        const gap = 8;
        const top = 78;
        const side = 38;
        const brickW = (BRICK.width - side * 2 - gap * (cols - 1)) / cols;
        const brickH = Math.max(26, Math.min(34, Math.floor(BRICK.height * 0.034)));
        const pattern = (BRICK.level - 1) % 7;
        brickBricks = [];
        let keyCount = 0;
        let lockedCount = 0;

        for (let r = 0; r < rows; r += 1) {
            for (let c = 0; c < cols; c += 1) {
                if (!shouldKeepBrick(pattern, r, c, rows, cols, BRICK.level)) continue;
                const rowRatio = rows <= 1 ? 0 : r / (rows - 1);
                const numberChance = Math.min(0.72, 0.14 + BRICK.level * 0.038 + rowRatio * 0.28);
                const numbered = hashBrick(BRICK.level, r, c, 17) < numberChance;
                const maxRandomHp = 2 + Math.floor(BRICK.level * 0.52);
                const hp = numbered
                    ? Math.min(24, 2 + Math.floor(hashBrick(BRICK.level, r, c, 31) * maxRandomHp) + Math.floor(rowRatio * (1 + BRICK.level * 0.36)))
                    : 1;
                let kind = getSpecialBrickKind(r, c, rowRatio);
                if (kind === 'key') keyCount += 1;
                if (kind === 'locked') lockedCount += 1;
                if (kind === 'locked' && keyCount === 0 && lockedCount > 2) kind = 'shield';
                brickBricks.push({
                    x: side + c * (brickW + gap),
                    baseX: side + c * (brickW + gap),
                    y: top + r * (brickH + gap),
                    w: brickW,
                    h: brickH,
                    hp,
                    maxHp: hp,
                    numbered,
                    kind,
                    shield: kind === 'shield',
                    locked: kind === 'locked',
                    movePhase: hashBrick(BRICK.level, r, c, 67) * Math.PI * 2,
                    moveAmp: kind === 'moving' ? Math.min(28, brickW * 0.34) : 0,
                    moveSpeed: kind === 'moving' ? 0.75 + hashBrick(BRICK.level, r, c, 71) * 0.45 : 0,
                    flash: 0,
                    seed: hashBrick(BRICK.level, r, c, 41),
                });
            }
        }

        if (pattern === 6 || BRICK.level % 3 === 0) {
            for (let i = 0; i < Math.floor(cols * 0.3); i += 1) {
                const randR = Math.floor(Math.random() * rows);
                const randC = Math.floor(Math.random() * cols);
                brickBricks = brickBricks.filter(b => !(b.x === side + randC * (brickW + gap) && b.y === top + randR * (brickH + gap)));
            }
        }

        if (brickBricks.length < cols * 2) {
            for (let r = 0; r < Math.min(rows, 4); r += 1) {
                for (let c = 0; c < cols; c += 1) {
                    const numbered = r > 1 && (c + r + BRICK.level) % 3 === 0;
                    const hp = numbered ? 2 + Math.floor(BRICK.level / 2) : 1;
                    brickBricks.push({
                        x: side + c * (brickW + gap),
                        baseX: side + c * (brickW + gap),
                        y: top + r * (brickH + gap),
                        w: brickW,
                        h: brickH,
                        hp,
                        maxHp: hp,
                        numbered,
                        kind: 'normal',
                        shield: false,
                        locked: false,
                        movePhase: 0,
                        moveAmp: 0,
                        moveSpeed: 0,
                        flash: 0,
                        seed: hashBrick(BRICK.level, r, c, 43),
                    });
                }
            }
        }
        if (brickBricks.some((brick) => brick.locked) && !brickBricks.some((brick) => brick.kind === 'key')) {
            const candidate = brickBricks.find((brick) => !brick.locked) || brickBricks[0];
            if (candidate) {
                Object.assign(candidate, { kind: 'key', numbered: false, hp: 1, maxHp: 1, shield: false, locked: false, moveAmp: 0 });
            }
        }
        BRICK.activeKeys = brickBricks.filter((brick) => brick.kind === 'key').length;
        if (brickRunUpgrades.startPowerups > 0) {
            for (let i = 0; i < brickRunUpgrades.startPowerups; i += 1) {
                const x = BRICK.width * (0.28 + i * 0.18);
                maybeDropBrickPowerUp(x, top - 26, true);
            }
        }
        BRICK.levelStartTime = performance.now();
        BRICK.levelHits = 0;
    }

    function spawnBrickBall(offset = 0, stuck = false) {
        if (brickBalls.length >= BRICK_MAX_BALLS || !brickPaddle) return;
        const angle = (-Math.PI / 2) + offset;
        const baseSpeed = (455 + Math.min(240, BRICK.level * 16)) * getMetaBallSpeedScale();
        const speed = baseSpeed;
        const size = getBallSize();
        brickBalls.push({
            x: brickPaddle.x,
            y: brickPaddle.y - brickPaddle.h / 2 - size - 1,
            r: size,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            speed: baseSpeed,
            stuck,
            trail: [],
        });
    }

    const resetBrickGame = () => {
        BRICK.running = false;
        BRICK.paused = false;
        BRICK.gameOver = false;
        BRICK.score = 0;
        BRICK.level = 1;
        BRICK.lives = getInitialLives();
        BRICK.lastTime = 0;
        BRICK.fireStacks = 0;
        BRICK.fireTimer = 0;
        BRICK.paddleStacks = 0;
        BRICK.paddleTimer = 0;
        BRICK.speedStacks = 0;
        BRICK.speedTimer = 0;
        BRICK.combo = 0;
        BRICK.comboTimer = 0;
        BRICK.magnetTimer = 0;
        BRICK.scoreBoostTimer = 0;
        BRICK.scoreMultiplier = 1;
        BRICK.slowTimeTimer = 0;
        BRICK.giantBallTimer = 0;
        BRICK.rapidFireTimer = 0;
        BRICK.pierceTimer = 0;
        BRICK.bestCombo = 0;
        BRICK.feverTimer = 0;
        BRICK.levelHits = 0;
        BRICK.coinsEarned = 0;
        BRICK.upgradePending = false;
        BRICK.upgradeChoices = [];
        BRICK.rerollUsed = false;
        BRICK.graceReady = brickRunUpgrades.grace > 0;
        BRICK.activeKeys = 0;
        resetRunUpgrades();
        BRICK.graceReady = false;
        BRICK.message = '';
        BRICK.messageTimer = 0;
        BRICK.shakeTimer = 0;
        BRICK.shakeIntensity = 0;
        hideRunUpgradePanel();
        hideBrickEndPanel();
        brickKeys.Left = false;
        brickKeys.Right = false;
        brickTouchLeftBtn?.classList.remove('active');
        brickTouchRightBtn?.classList.remove('active');
        brickPointer.active = false;
        brickPaddle = {
            x: (BRICK.width || 1120) / 2,
            y: (BRICK.height || 1050) - 54,
            baseW: 164,
            w: 164,
            h: 18,
            baseSpeed: 980,
            speed: 980,
        };
        brickBalls = [];
        brickPowerUps = [];
        brickParticles = [];
        updateBrickEconomyUI();
        createBrickLayout();
        spawnBrickBall(0, true);
        brickStartBtn.classList.remove('hidden');
        brickRestartBtn.classList.add('hidden');
        brickPauseBtn.classList.add('hidden');
        brickPauseBtn.textContent = '暂停';
        updateBrickHud();
    };

    const startBrickGame = () => {
        if (brickAnimId) cancelAnimationFrame(brickAnimId);
        resizeBrickCanvas();
        resetBrickGame();
        BRICK.running = true;
        BRICK.paused = false;
        BRICK.gameOver = false;
        BRICK.lastTime = performance.now();
        brickStartBtn.classList.add('hidden');
        brickRestartBtn.classList.remove('hidden');
        brickPauseBtn.classList.remove('hidden');
        setBrickMessage('按空格开球，拖动发射板微调角度', 1500);
        updateBrickHud();
        brickAnimId = requestAnimationFrame(loopBrick);
    };

    const releaseStuckBalls = () => {
        let released = false;
        brickBalls.forEach((ball, index) => {
            if (ball.stuck) {
                const angle = -Math.PI / 2 + (index % 3 - 1) * 0.18;
                ball.vx = Math.cos(angle) * ball.speed;
                ball.vy = Math.sin(angle) * ball.speed;
                ball.stuck = false;
                released = true;
            }
        });
        return released;
    };

    const launchExtraBalls = (count) => {
        const offsets = count === 1 ? [0] : [-0.24, 0.24];
        offsets.slice(0, count).forEach((offset) => spawnBrickBall(offset, false));
        setBrickMessage(count === 1 ? '🟢 分裂球 +1！' : '🟣 双倍分裂 +2！', 850);
        updateBrickHud();
    };

    const maybeDropBrickPowerUp = (x, y, force = false) => {
        if (brickPowerUps.length >= BRICK_MAX_POWERUPS) return;
        const comboBonus = Math.min(0.16, BRICK.combo * 0.007);
        if (!force && Math.random() >= BRICK_BASE_DROP_RATE + brickRunUpgrades.dropRate + comboBonus) return;
        const roll = Math.random();
        let type = 'split';
        if (roll < 0.16) type = 'split';
        else if (roll < 0.29) type = 'fire';
        else if (roll < 0.39) type = 'doubleSplit';
        else if (roll < 0.50) type = 'longPaddle';
        else if (roll < 0.60) type = 'speedBoots';
        else if (roll < 0.70) type = 'magnet';
        else if (roll < 0.80) type = 'scoreBoost';
        else if (roll < 0.86) type = 'slowTime';
        else if (roll < 0.91) type = 'giantBall';
        else if (roll < 0.95) type = 'rapidFire';
        else if (roll < 0.98) type = 'pierce';
        else if (BRICK.lives < 4 && roll < 0.992) type = 'extraLife';
        else type = 'brickBomb';
        const meta = brickPowerMeta[type];
        brickPowerUps.push({ x, y, w: 34, h: 34, vy: 190 + Math.min(70, BRICK.level * 4), type, pulse: Math.random() * Math.PI * 2, ...meta });
    };

    const chooseUpgradeOptions = () => {
        const available = brickUpgradePool.filter((item) => {
            const current = item.id === 'paddleScale'
                ? Math.round(brickRunUpgrades.paddleScale / 0.12)
                : item.id === 'dropRate'
                    ? Math.round(brickRunUpgrades.dropRate / 0.04)
                    : item.id === 'comboTime'
                        ? Math.round(brickRunUpgrades.comboTime / 800)
                        : item.id === 'scoreBonus'
                            ? Math.round(brickRunUpgrades.scoreBonus / 0.10)
                            : Number(brickRunUpgrades[item.id]) || 0;
            return current < item.max;
        });
        const pool = [...available];
        const choices = [];
        while (choices.length < 3 && pool.length > 0) {
            const index = Math.floor(Math.random() * pool.length);
            choices.push(pool.splice(index, 1)[0]);
        }
        return choices;
    };

    const renderRunUpgradePanel = () => {
        if (!brickRunUpgradePanel || !brickRunUpgradeChoicesEl) return;
        brickRunUpgradeChoicesEl.innerHTML = BRICK.upgradeChoices.map((choice, index) => `
            <button class="brick-run-upgrade-choice" type="button" data-brick-run-upgrade="${index}">
                <span class="brick-panel-title">${index + 1}</span>
                <strong>${choice.title}</strong>
                <span>${choice.desc}</span>
            </button>
        `).join('');
        brickRunUpgradeChoicesEl.querySelectorAll('.brick-run-upgrade-choice').forEach((btn) => {
            btn.addEventListener('click', () => selectUpgradeChoice(Number(btn.dataset.brickRunUpgrade)));
        });
        if (brickRerollUpgradesBtn) {
            const canReroll = getUpgradeLevel('reroll') > 0 && !BRICK.rerollUsed;
            brickRerollUpgradesBtn.classList.toggle('hidden', !canReroll);
            brickRerollUpgradesBtn.disabled = !canReroll;
        }
    };

    const showRunUpgradePanel = () => {
        renderRunUpgradePanel();
        brickRunUpgradePanel?.classList.remove('hidden');
        window.setTimeout(() => {
            brickRunUpgradePanel?.scrollIntoView?.({ block: 'center', inline: 'nearest' });
            brickRunUpgradeChoicesEl?.querySelector('.brick-run-upgrade-choice')?.focus();
        }, 0);
    };

    const hideRunUpgradePanel = () => {
        brickRunUpgradePanel?.classList.add('hidden');
    };

    const showUpgradeChoices = () => {
        BRICK.upgradeChoices = chooseUpgradeOptions();
        if (BRICK.upgradeChoices.length === 0) {
            continueAfterUpgrade();
            return;
        }
        BRICK.upgradePending = true;
        setBrickMessage('选择一项本局强化', 900);
        showRunUpgradePanel();
    };

    const continueAfterUpgrade = () => {
        BRICK.upgradePending = false;
        BRICK.upgradeChoices = [];
        hideRunUpgradePanel();
        BRICK.level += 1;
        brickPowerUps = [];
        createBrickLayout();
        spawnBrickBall(-0.16, true);
        BRICK.combo = 0;
        BRICK.comboTimer = 0;
        BRICK.lastTime = performance.now();
        setBrickMessage(`进入第 ${BRICK.level} 关`, 1000);
    };

    const selectUpgradeChoice = (index) => {
        if (!BRICK.upgradePending) return;
        const choice = BRICK.upgradeChoices[index];
        if (!choice) return;
        choice.apply();
        setBrickMessage(`${choice.title} 已生效`, 900);
        continueAfterUpgrade();
        updateBrickHud();
    };

    const rerollUpgradeChoices = () => {
        if (!BRICK.upgradePending || BRICK.rerollUsed || getUpgradeLevel('reroll') <= 0) return;
        BRICK.rerollUsed = true;
        BRICK.upgradeChoices = chooseUpgradeOptions();
        setBrickMessage('强化已刷新', 700);
        renderRunUpgradePanel();
        drawBrickGame();
    };

    const applyBrickPowerUp = (type) => {
        if (type === 'split') {
            launchExtraBalls(1);
        } else if (type === 'doubleSplit') {
            launchExtraBalls(2);
        } else if (type === 'fire') {
            BRICK.fireStacks += 1;
            BRICK.fireTimer = 5000;
            setBrickMessage(`🔥 火力+${BRICK.fireStacks}，5秒！`, 850);
        } else if (type === 'longPaddle') {
            const maxStacks = Math.ceil((3 - 1) / 0.15);
            BRICK.paddleStacks = Math.min(maxStacks, BRICK.paddleStacks + 1);
            BRICK.paddleTimer = 12000;
            setBrickMessage(`📏 发射板长度+${Math.round((getPaddleScale() - 1) * 100)}%`, 850);
        } else if (type === 'speedBoots') {
            const maxStacks = Math.ceil((3 - 1) / 0.10);
            BRICK.speedStacks = Math.min(maxStacks, BRICK.speedStacks + 1);
            BRICK.speedTimer = 12000;
            setBrickMessage(`👟 移动速度+${Math.round((getSpeedScale() - 1) * 100)}%`, 850);
        } else if (type === 'magnet') {
            BRICK.magnetTimer = 8000;
            setBrickMessage('🧲 磁力球激活，击中板后粘住！', 850);
        } else if (type === 'extraLife') {
            BRICK.lives += 1;
            setBrickMessage('❤️ 获得额外生命！', 850);
        } else if (type === 'scoreBoost') {
            BRICK.scoreBoostTimer = 10000;
            BRICK.scoreMultiplier = 2;
            setBrickMessage('💎 分数加倍，10秒！', 850);
        } else if (type === 'slowTime') {
            BRICK.slowTimeTimer = 6000;
            setBrickMessage('⏳ 所有球减速6秒！', 850);
        } else if (type === 'giantBall') {
            BRICK.giantBallTimer = 8000;
            brickBalls.forEach((ball) => { ball.r = getBallSize(); });
            setBrickMessage('🔵 巨球模式，伤害更高！', 850);
        } else if (type === 'rapidFire') {
            BRICK.rapidFireTimer = 6000;
            setBrickMessage('⚡ 球速加快6秒！', 850);
        } else if (type === 'pierce') {
            BRICK.pierceTimer = 6500;
            setBrickMessage('◆ 穿透模式，连续击碎砖块！', 900);
        } else if (type === 'hazard') {
            BRICK.rapidFireTimer = Math.max(BRICK.rapidFireTimer, 5200);
            BRICK.slowTimeTimer = 0;
            setBrickMessage('! 过载：球速短时提高，注意接球', 900);
        } else if (type === 'brickBomb') {
            for (let i = 0; i < 3 && brickBricks.length > 0; i += 1) {
                const idx = Math.floor(Math.random() * brickBricks.length);
                const b = brickBricks[idx];
                BRICK.score += 20;
                addBrickParticles(b.x + b.w / 2, b.y + b.h / 2, '#ff3366', 8);
                brickBricks.splice(idx, 1);
            }
            triggerBrickShake(5, 160);
            setBrickMessage('💥 炸弹清砖！', 850);
        }
        updateBrickHud();
    };

    const circleRectHit = (circle, rect) => {
        const nearestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.w));
        const nearestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.h));
        const dx = circle.x - nearestX;
        const dy = circle.y - nearestY;
        return dx * dx + dy * dy <= circle.r * circle.r;
    };

    const unlockLockedBricks = () => {
        if (BRICK.activeKeys > 0) return;
        brickBricks.forEach((brick) => {
            if (brick.kind === 'locked') {
                brick.locked = false;
                brick.flash = 1;
            }
        });
        setBrickMessage('锁链砖已解锁', 850);
    };

    const damageBrickAtIndex = (index, damage, sourceBall = null, force = false) => {
        const brick = brickBricks[index];
        if (!brick) return false;

        if (brick.locked && BRICK.activeKeys > 0 && !force) {
            brick.flash = 1;
            setBrickMessage('先击破 KEY 砖解锁', 750);
            return true;
        }

        if (brick.shield && !force) {
            brick.shield = false;
            brick.flash = 1;
            addBrickParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, '#9dc0ff', 7);
            setBrickMessage('护盾已破', 550);
            return true;
        }

        brick.hp -= damage;
        brick.flash = 1;
        if (brick.hp > 0) return true;

        const centerX = brick.x + brick.w / 2;
        const centerY = brick.y + brick.h / 2;
        const mult = getCurrentScoreMultiplier();
        let scoreGain = brick.numbered ? 14 + brick.maxHp * 4 : 10;

        if (brick.kind === 'coin') {
            const coins = addBrickCoins(3 + Math.floor(BRICK.level / 2));
            scoreGain += 20 + coins * 3;
            setBrickMessage(`金币砖 +${coins}`, 650);
        } else if (brick.kind === 'bonus') {
            scoreGain += 30;
        } else if (brick.kind === 'danger') {
            scoreGain += 70 + BRICK.level * 6;
            const meta = brickPowerMeta.hazard;
            brickPowerUps.push({ x: centerX, y: centerY, w: 34, h: 34, vy: 250, type: 'hazard', pulse: 0, ...meta });
            setBrickMessage('危险砖高分，避开红色过载', 900);
        } else if (brick.kind === 'key') {
            BRICK.activeKeys = Math.max(0, BRICK.activeKeys - 1);
            unlockLockedBricks();
            scoreGain += 35;
        } else if (brick.kind === 'explosive') {
            triggerBrickShake(5, 160);
            scoreGain += 30;
            for (let i = brickBricks.length - 1; i >= 0; i -= 1) {
                if (i === index) continue;
                const other = brickBricks[i];
                const dx = other.x + other.w / 2 - centerX;
                const dy = other.y + other.h / 2 - centerY;
                if (Math.hypot(dx, dy) <= Math.max(brick.w, brick.h) * 2.2) {
                    if (other.locked && BRICK.activeKeys > 0) {
                        other.flash = 1;
                        continue;
                    }
                    other.hp -= 1;
                    other.flash = 1;
                    addBrickParticles(other.x + other.w / 2, other.y + other.h / 2, '#ff5f3d', 4);
                    if (other.hp <= 0) {
                        if (other.kind === 'key') BRICK.activeKeys = Math.max(0, BRICK.activeKeys - 1);
                        if (other.kind === 'coin') addBrickCoins(2 + Math.floor(BRICK.level / 3));
                        BRICK.score += Math.floor(18 * mult);
                        brickBricks.splice(i, 1);
                    }
                }
            }
            unlockLockedBricks();
        }

        BRICK.score += Math.floor(scoreGain * mult);
        maybeDropBrickPowerUp(centerX, centerY, brick.kind === 'bonus');
        const removeIndex = brickBricks.indexOf(brick);
        if (removeIndex >= 0) brickBricks.splice(removeIndex, 1);
        addBrickParticles(sourceBall?.x ?? centerX, sourceBall?.y ?? centerY, brick.numbered ? '#ffcc66' : (BRICK_KIND_META[brick.kind]?.stroke || '#5de5ff'), brick.numbered ? 10 : 6);
        triggerBrickShake(brick.numbered ? 2 : 1, 75);
        return true;
    };

    const updateBrickTimers = (dt) => {
        const ms = dt * 1000;
        if (BRICK.fireTimer > 0) {
            BRICK.fireTimer = Math.max(0, BRICK.fireTimer - ms);
            if (BRICK.fireTimer <= 0) BRICK.fireStacks = 0;
        }
        if (BRICK.paddleTimer > 0) {
            BRICK.paddleTimer = Math.max(0, BRICK.paddleTimer - ms);
            if (BRICK.paddleTimer <= 0) BRICK.paddleStacks = 0;
        }
        if (BRICK.speedTimer > 0) {
            BRICK.speedTimer = Math.max(0, BRICK.speedTimer - ms);
            if (BRICK.speedTimer <= 0) BRICK.speedStacks = 0;
        }
        if (BRICK.comboTimer > 0) {
            BRICK.comboTimer = Math.max(0, BRICK.comboTimer - ms);
            if (BRICK.comboTimer <= 0) BRICK.combo = 0;
        }
        if (BRICK.messageTimer > 0) {
            BRICK.messageTimer = Math.max(0, BRICK.messageTimer - ms);
            if (BRICK.messageTimer <= 0) BRICK.message = '';
        }
        if (BRICK.shakeTimer > 0) {
            BRICK.shakeTimer = Math.max(0, BRICK.shakeTimer - ms);
            if (BRICK.shakeTimer <= 0) BRICK.shakeIntensity = 0;
        }
        if (BRICK.magnetTimer > 0) {
            BRICK.magnetTimer = Math.max(0, BRICK.magnetTimer - ms);
        }
        if (BRICK.scoreBoostTimer > 0) {
            BRICK.scoreBoostTimer = Math.max(0, BRICK.scoreBoostTimer - ms);
            if (BRICK.scoreBoostTimer <= 0) BRICK.scoreMultiplier = 1;
        }
        if (BRICK.slowTimeTimer > 0) {
            BRICK.slowTimeTimer = Math.max(0, BRICK.slowTimeTimer - ms);
        }
        if (BRICK.giantBallTimer > 0) {
            BRICK.giantBallTimer = Math.max(0, BRICK.giantBallTimer - ms);
        }
        if (BRICK.rapidFireTimer > 0) {
            BRICK.rapidFireTimer = Math.max(0, BRICK.rapidFireTimer - ms);
        }
        if (BRICK.pierceTimer > 0) {
            BRICK.pierceTimer = Math.max(0, BRICK.pierceTimer - ms);
        }
        if (BRICK.feverTimer > 0) {
            BRICK.feverTimer = Math.max(0, BRICK.feverTimer - ms);
        }
    };

    const hitBrickWithBall = (ball) => {
        for (let i = brickBricks.length - 1; i >= 0; i -= 1) {
            const brick = brickBricks[i];
            if (!circleRectHit(ball, brick)) continue;
            const damage = brick.numbered || brick.kind === 'shield' || brick.kind === 'locked' ? getBallDamage() : brick.hp;
            BRICK.levelHits += 1;
            const mult = getCurrentScoreMultiplier();
            BRICK.score += Math.floor((brick.numbered ? 4 * damage : 6) * mult);
            const prevVx = ball.vx;
            const prevVy = ball.vy;

            const overlapLeft = Math.abs((ball.x + ball.r) - brick.x);
            const overlapRight = Math.abs(ball.x - ball.r - (brick.x + brick.w));
            const overlapTop = Math.abs((ball.y + ball.r) - brick.y);
            const overlapBottom = Math.abs(ball.y - ball.r - (brick.y + brick.h));
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
            const piercing = BRICK.pierceTimer > 0 || BRICK.giantBallTimer > 0;
            if (!piercing || brick.numbered) {
                if (minOverlap === overlapLeft || minOverlap === overlapRight) ball.vx *= -1;
                else ball.vy *= -1;
            }
            if (brick.kind === 'reflector') {
                const speed = Math.max(ball.speed, Math.hypot(ball.vx, ball.vy));
                const turn = (hashBrick(BRICK.level, Math.floor(brick.y), Math.floor(brick.x), 88) > 0.5 ? 1 : -1) * 0.52;
                const angle = Math.atan2(ball.vy, ball.vx) + turn;
                ball.vx = Math.cos(angle) * speed;
                ball.vy = Math.sin(angle) * speed;
            }

            const beforeCount = brickBricks.length;
            damageBrickAtIndex(i, damage, ball);
            if (brickBricks.length === beforeCount && brickBricks[i]) {
                addBrickParticles(ball.x, ball.y, '#ffb347', 5);
            }
            if (BRICK.giantBallTimer > 0 && !brick.numbered && !piercing) {
                ball.vx = prevVx;
                ball.vy = prevVy;
            }
            BRICK.combo = Math.min(20, BRICK.combo + 1);
            BRICK.bestCombo = Math.max(BRICK.bestCombo, BRICK.combo);
            if (BRICK.combo >= 8) BRICK.feverTimer = 3800;
            BRICK.comboTimer = 2200 + brickRunUpgrades.comboTime;
            BRICK.score += Math.floor(BRICK.combo * 1.5 * mult);
            return true;
        }
        return false;
    };

    const updateOneBall = (ball, stepDt) => {
        if (ball.stuck) return;
        const speedMult = getBallSpeedMult();
        if (ball.trail) {
            ball.trail.push({ x: ball.x, y: ball.y });
            if (ball.trail.length > 9) ball.trail.shift();
        }
        ball.x += ball.vx * stepDt * speedMult;
        ball.y += ball.vy * stepDt * speedMult;

        if (ball.x - ball.r < 0) {
            ball.x = ball.r;
            ball.vx = Math.abs(ball.vx);
        } else if (ball.x + ball.r > BRICK.width) {
            ball.x = BRICK.width - ball.r;
            ball.vx = -Math.abs(ball.vx);
        }
        if (ball.y - ball.r < 0) {
            ball.y = ball.r;
            ball.vy = Math.abs(ball.vy);
        }

        const paddleRect = { x: brickPaddle.x - brickPaddle.w / 2, y: brickPaddle.y - brickPaddle.h / 2, w: brickPaddle.w, h: brickPaddle.h };
        if (ball.vy > 0 && circleRectHit(ball, paddleRect)) {
            BRICK.comboTimer = Math.max(BRICK.comboTimer, 900);
            if (BRICK.magnetTimer > 0) {
                ball.stuck = true;
                ball.vx = 0;
                ball.vy = 0;
                ball.y = paddleRect.y - ball.r - 1;
            } else {
                const hit = Math.max(-1, Math.min(1, (ball.x - brickPaddle.x) / (brickPaddle.w / 2)));
                const speed = Math.min(880, Math.max(ball.speed, Math.hypot(ball.vx, ball.vy) + 4));
                const angle = -Math.PI / 2 + hit * 1.05;
                ball.vx = Math.cos(angle) * speed;
                ball.vy = Math.sin(angle) * speed;
                if (Math.abs(ball.vy) < speed * 0.52) ball.vy = -speed * 0.52;
                ball.y = paddleRect.y - ball.r - 1;
            }
        }

        hitBrickWithBall(ball);
    };

    const updateBrickGame = (dt) => {
        updateBrickTimers(dt);
        if (BRICK.upgradePending) return;
        brickPaddle.w = brickPaddle.baseW * getPaddleScale();
        brickPaddle.speed = brickPaddle.baseSpeed * getSpeedScale();

        const inputX = (brickKeys.Right ? 1 : 0) - (brickKeys.Left ? 1 : 0);
        if (brickPointer.active) {
            brickPaddle.x = brickPointer.x;
        } else {
            brickPaddle.x += inputX * brickPaddle.speed * dt;
        }
        brickPaddle.x = Math.max(brickPaddle.w / 2, Math.min(BRICK.width - brickPaddle.w / 2, brickPaddle.x));

        brickBricks.forEach((brick) => {
            if (brick.flash > 0) brick.flash = Math.max(0, brick.flash - dt * 7);
            if (brick.kind === 'moving' && brick.moveAmp > 0) {
                brick.movePhase += brick.moveSpeed * dt;
                brick.x = Math.max(8, Math.min(BRICK.width - brick.w - 8, brick.baseX + Math.sin(brick.movePhase) * brick.moveAmp));
            }
        });

        brickBalls.forEach((ball) => {
            ball.r = getBallSize();
            if (ball.stuck) {
                ball.x = brickPaddle.x;
                ball.y = brickPaddle.y - brickPaddle.h / 2 - ball.r - 1;
                if (inputX !== 0 || brickPointer.active) releaseStuckBalls();
                return;
            }
            const speed = Math.hypot(ball.vx, ball.vy) || ball.speed;
            const steps = Math.min(6, Math.max(1, Math.ceil(speed * dt / 12)));
            const stepDt = dt / steps;
            for (let step = 0; step < steps; step += 1) updateOneBall(ball, stepDt);
        });

        brickBalls = brickBalls.filter((ball) => ball.y - ball.r <= BRICK.height + 50);
        if (brickBalls.length === 0) {
            if (BRICK.graceReady) {
                BRICK.graceReady = false;
                setBrickMessage('保险弹匣触发，本次不扣生命', 1000);
            } else {
                BRICK.lives -= 1;
            }
            BRICK.combo = brickRunUpgrades.comboKeep > 0 ? Math.floor(BRICK.combo * 0.3) : 0;
            BRICK.comboTimer = 0;
            if (BRICK.lives <= 0) {
                BRICK.running = false;
                BRICK.gameOver = true;
                brickPauseBtn.classList.add('hidden');
                brickRestartBtn.classList.remove('hidden');
                const settleCoins = addBrickCoins(Math.floor(BRICK.score / 220) + BRICK.level * 8 + BRICK.bestCombo);
                brickWallet = storage?.setStoredBrickWallet?.({ coins: (brickWallet.coins || 0) + BRICK.coinsEarned }) || brickWallet;
                storage?.setStoredBrickBestScore?.(BRICK.score);
                updateBrickEconomyUI();
                setBrickMessage('游戏结束', 1200);
                showBrickEndPanel({
                    title: '挑战结束',
                    summary: `得分 ${BRICK.score} · 第 ${BRICK.level} 关 · 最佳连击 ${BRICK.bestCombo || BRICK.combo || 0} · 金币 +${BRICK.coinsEarned}`,
                });
                submitCloudScore('brick', BRICK.score, {
                    level: BRICK.level,
                    lives: 0,
                    combo: BRICK.bestCombo || BRICK.combo || 0,
                    coins: settleCoins,
                });
            } else {
                spawnBrickBall(0, true);
                setBrickMessage('掉球了，按空格重新发射', 1200);
            }
        }

        brickPowerUps.forEach((p) => {
            p.y += p.vy * dt;
            p.pulse += dt * 5;
            if (BRICK.feverTimer > 0 && brickPaddle) {
                const dx = brickPaddle.x - p.x;
                const range = getPowerupAttractRange();
                if (Math.abs(dx) < range) p.x += Math.sign(dx) * Math.min(Math.abs(dx), 150 * dt);
            }
        });
        const paddleRect = { x: brickPaddle.x - brickPaddle.w / 2, y: brickPaddle.y - brickPaddle.h / 2, w: brickPaddle.w, h: brickPaddle.h };
        for (let i = brickPowerUps.length - 1; i >= 0; i -= 1) {
            const p = brickPowerUps[i];
            const powerRect = { x: p.x - p.w / 2, y: p.y - p.h / 2, w: p.w, h: p.h };
            if (rectHit(powerRect, paddleRect)) {
                applyBrickPowerUp(p.type);
                brickPowerUps.splice(i, 1);
            } else if (p.y > BRICK.height + 40) {
                brickPowerUps.splice(i, 1);
            }
        }

        brickParticles.forEach((p) => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= p.drag || 0.96;
            p.vy = p.vy * (p.drag || 0.96) + 90 * dt;
            p.life -= dt;
        });
        brickParticles = brickParticles.filter((p) => p.life > 0);

        if (brickBricks.length === 0 && BRICK.running) {
            const clearSeconds = Math.max(1, (performance.now() - BRICK.levelStartTime) / 1000);
            const speedBonus = Math.max(0, Math.round((70 - clearSeconds) * 4));
            const accuracyBonus = Math.max(0, 180 - BRICK.levelHits * 2);
            const clearBonus = Math.floor((220 + BRICK.level * 70 + speedBonus + accuracyBonus) * getCurrentScoreMultiplier());
            BRICK.score += clearBonus;
            addBrickCoins(8 + BRICK.level * 2 + Math.floor(clearBonus / 120));
            brickPowerUps = [];
            brickBalls = [];
            setBrickMessage(`清场奖励 +${clearBonus}`, 1000);
            showUpgradeChoices();
            triggerBrickShake(4, 160);
        }
        updateBrickHud();
    };

    const drawBrickBackground = () => {
        const key = `${BRICK.width}x${BRICK.height}`;
        if (!brickBackgroundCache || brickBackgroundCache.key !== key) {
            const canvas = document.createElement('canvas');
            canvas.width = BRICK.width;
            canvas.height = BRICK.height;
            const ctx = canvas.getContext('2d');
            const bg = ctx.createLinearGradient(0, 0, 0, BRICK.height);
            bg.addColorStop(0, '#061426');
            bg.addColorStop(0.46, '#08101c');
            bg.addColorStop(1, '#16080f');
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, BRICK.width, BRICK.height);
            const glow = ctx.createRadialGradient(BRICK.width * 0.5, BRICK.height * 0.18, 20, BRICK.width * 0.5, BRICK.height * 0.18, BRICK.width * 0.72);
            glow.addColorStop(0, 'rgba(93,229,255,0.18)');
            glow.addColorStop(0.5, 'rgba(255,200,87,0.06)');
            glow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, BRICK.width, BRICK.height);
            ctx.fillStyle = 'rgba(93,229,255,0.055)';
            for (let x = 0; x < BRICK.width; x += 72) ctx.fillRect(x, 0, 1, BRICK.height);
            ctx.fillStyle = 'rgba(255,255,255,0.035)';
            for (let y = 0; y < BRICK.height; y += 72) ctx.fillRect(0, y, BRICK.width, 1);
            ctx.fillStyle = 'rgba(255,200,87,0.05)';
            ctx.fillRect(0, 64, BRICK.width, 2);
            ctx.fillStyle = 'rgba(255,95,61,0.10)';
            ctx.fillRect(0, BRICK.height - 74, BRICK.width, 2);
            brickBackgroundCache = { key, canvas };
        }
        brickCtx.drawImage(brickBackgroundCache.canvas, 0, 0);
    };

    const drawBrickHudOverlay = () => {
        brickCtx.save();
        brickCtx.textBaseline = 'middle';
        brickCtx.font = `bold ${BRICK.width < 520 ? 11 : 13}px JetBrains Mono, Consolas, monospace`;
        brickCtx.fillStyle = 'rgba(3,7,15,0.56)';
        brickCtx.beginPath();
        brickCtx.roundRect(18, 16, BRICK.width - 36, 36, 10);
        brickCtx.fill();
        brickCtx.strokeStyle = 'rgba(93,229,255,0.20)';
        brickCtx.stroke();
        brickCtx.fillStyle = '#dff8ff';
        brickCtx.textAlign = 'left';
        brickCtx.fillText(`LV ${BRICK.level}`, 34, 34);
        brickCtx.fillStyle = '#ffc857';
        brickCtx.fillText(BRICK.width < 520 ? `${BRICK.score}` : `SCORE ${BRICK.score}`, 110, 34);
        brickCtx.fillStyle = '#21f29a';
        if (BRICK.width >= 520) brickCtx.fillText(`BEST x${BRICK.bestCombo}`, 250, 34);
        brickCtx.textAlign = 'right';
        brickCtx.fillStyle = BRICK.feverTimer > 0 ? '#ff5f3d' : 'rgba(223,248,255,0.72)';
        brickCtx.fillText(BRICK.feverTimer > 0 ? `FEVER  +${BRICK.coinsEarned}G` : `${brickBricks.length} BLOCKS  +${BRICK.coinsEarned}G`, BRICK.width - 34, 34);
        brickCtx.restore();
    };

    const drawUpgradeOverlay = () => {
        if (!BRICK.upgradePending) return;
        brickCtx.save();
        brickCtx.fillStyle = 'rgba(0,0,0,0.68)';
        brickCtx.fillRect(0, 0, BRICK.width, BRICK.height);
        const panelW = Math.min(760, BRICK.width - 34);
        const panelH = 300;
        const panelX = (BRICK.width - panelW) / 2;
        const panelY = Math.max(92, (BRICK.height - panelH) / 2);
        brickCtx.fillStyle = 'rgba(5,10,20,0.94)';
        brickCtx.beginPath();
        brickCtx.roundRect(panelX, panelY, panelW, panelH, 12);
        brickCtx.fill();
        brickCtx.strokeStyle = 'rgba(255,200,87,0.42)';
        brickCtx.stroke();
        brickCtx.textAlign = 'center';
        brickCtx.textBaseline = 'middle';
        brickCtx.fillStyle = '#f4fbff';
        brickCtx.font = 'bold 26px sans-serif';
        brickCtx.fillText(`第 ${BRICK.level} 关清场`, BRICK.width / 2, panelY + 42);
        brickCtx.fillStyle = 'rgba(244,251,255,0.68)';
        brickCtx.font = '14px sans-serif';
        brickCtx.fillText('选择一项本局强化继续挑战', BRICK.width / 2, panelY + 72);
        const cardGap = 12;
        const cardW = (panelW - 48 - cardGap * 2) / 3;
        BRICK.upgradeChoices.forEach((choice, index) => {
            const x = panelX + 24 + index * (cardW + cardGap);
            const y = panelY + 105;
            brickCtx.fillStyle = 'rgba(255,255,255,0.065)';
            brickCtx.beginPath();
            brickCtx.roundRect(x, y, cardW, 136, 8);
            brickCtx.fill();
            brickCtx.strokeStyle = 'rgba(93,229,255,0.22)';
            brickCtx.stroke();
            brickCtx.fillStyle = '#ffc857';
            brickCtx.font = 'bold 18px sans-serif';
            brickCtx.fillText(`${index + 1}. ${choice.title}`, x + cardW / 2, y + 32);
            brickCtx.fillStyle = 'rgba(244,251,255,0.78)';
            brickCtx.font = '13px sans-serif';
            const desc = choice.desc.length > 16 ? [choice.desc.slice(0, 16), choice.desc.slice(16)] : [choice.desc];
            desc.forEach((line, lineIndex) => {
                brickCtx.fillText(line, x + cardW / 2, y + 70 + lineIndex * 20);
            });
        });
        if (getUpgradeLevel('reroll') > 0 && !BRICK.rerollUsed) {
            brickCtx.fillStyle = '#9fffd7';
            brickCtx.font = 'bold 13px sans-serif';
            brickCtx.fillText('按 R 刷新一次选项', BRICK.width / 2, panelY + panelH - 28);
        }
        brickCtx.restore();
    };

    const drawBrickGame = () => {
        brickCtx.save();
        if (BRICK.shakeTimer > 0) {
            const power = BRICK.shakeIntensity * (BRICK.shakeTimer / 220);
            brickCtx.translate((Math.random() - 0.5) * power, (Math.random() - 0.5) * power);
        }
        drawBrickBackground();
        drawBrickHudOverlay();

        brickCtx.textAlign = 'center';
        brickCtx.textBaseline = 'middle';
        brickCtx.font = 'bold 15px JetBrains Mono, monospace';
        brickBricks.forEach((brick) => {
            const hpRatio = brick.maxHp <= 0 ? 0 : brick.hp / brick.maxHp;
            const kindMeta = BRICK_KIND_META[brick.kind] || BRICK_KIND_META.normal;
            if (brick.kind !== 'normal') {
                const grad = brickCtx.createLinearGradient(brick.x, brick.y, brick.x + brick.w, brick.y + brick.h);
                grad.addColorStop(0, brick.flash > 0 ? '#ffffff' : kindMeta.color);
                grad.addColorStop(1, brick.locked && BRICK.activeKeys > 0 ? '#1b202c' : '#07131f');
                brickCtx.fillStyle = grad;
                brickCtx.strokeStyle = brick.locked && BRICK.activeKeys > 0 ? 'rgba(255,255,255,0.35)' : kindMeta.stroke;
            } else if (brick.numbered) {
                const num = brick.maxHp;
                const hue = (num * 31 + BRICK.level * 12) % 360;
                const grad = brickCtx.createLinearGradient(brick.x, brick.y, brick.x + brick.w, brick.y + brick.h);
                grad.addColorStop(0, `hsl(${hue}, 84%, ${54 + brick.flash * 14}%)`);
                grad.addColorStop(1, `hsl(${(hue + 48) % 360}, 78%, ${38 + brick.flash * 12}%)`);
                brickCtx.fillStyle = grad;
                brickCtx.strokeStyle = brick.flash > 0 ? 'rgba(255,255,255,0.88)' : 'rgba(255,215,120,0.64)';
            } else {
                const grad = brickCtx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.h);
                grad.addColorStop(0, brick.flash > 0 ? '#79f4ff' : '#246b8a');
                grad.addColorStop(1, '#0d2f45');
                brickCtx.fillStyle = grad;
                brickCtx.strokeStyle = brick.flash > 0 ? 'rgba(255,255,255,0.72)' : 'rgba(93,229,255,0.48)';
            }
            brickCtx.lineWidth = 1;
            brickCtx.beginPath();
            brickCtx.roundRect(brick.x, brick.y, brick.w, brick.h, 6);
            brickCtx.fill();
            brickCtx.stroke();
            if (brick.numbered) {
                brickCtx.fillStyle = 'rgba(0,0,0,0.24)';
                brickCtx.fillRect(brick.x + 7, brick.y + brick.h - 7, Math.max(0, brick.w - 14), 3);
                brickCtx.fillStyle = 'rgba(255,255,255,0.62)';
                brickCtx.fillRect(brick.x + 7, brick.y + brick.h - 7, Math.max(0, (brick.w - 14) * hpRatio), 3);
            }
            if (brick.shield) {
                brickCtx.strokeStyle = 'rgba(157,192,255,0.86)';
                brickCtx.lineWidth = 2;
                brickCtx.strokeRect(brick.x + 4, brick.y + 4, brick.w - 8, brick.h - 8);
                brickCtx.lineWidth = 1;
            }
            if (brick.numbered) {
                brickCtx.fillStyle = '#ffffff';
                brickCtx.shadowColor = 'rgba(0,0,0,0.55)';
                brickCtx.shadowBlur = 5;
                brickCtx.fillText(String(brick.hp), brick.x + brick.w / 2, brick.y + brick.h / 2 + 1);
                brickCtx.shadowBlur = 0;
            } else if (kindMeta.label) {
                brickCtx.fillStyle = 'rgba(255,255,255,0.86)';
                brickCtx.font = 'bold 10px JetBrains Mono, monospace';
                brickCtx.fillText(kindMeta.label, brick.x + brick.w / 2, brick.y + brick.h / 2 + 1);
                brickCtx.font = 'bold 15px JetBrains Mono, monospace';
            }
        });

        brickPowerUps.forEach((p) => {
            const bob = Math.sin(p.pulse || 0) * 2;
            brickCtx.shadowColor = p.color;
            brickCtx.shadowBlur = 14;
            brickCtx.fillStyle = p.color;
            brickCtx.beginPath();
            brickCtx.roundRect(p.x - p.w / 2, p.y - p.h / 2 + bob, p.w, p.h, 8);
            brickCtx.fill();
            brickCtx.shadowBlur = 0;
            brickCtx.fillStyle = '#071018';
            brickCtx.font = 'bold 16px sans-serif';
            brickCtx.fillText(p.icon, p.x, p.y + 1 + bob);
            brickCtx.font = 'bold 9px JetBrains Mono, monospace';
            brickCtx.fillStyle = 'rgba(255,255,255,0.86)';
            brickCtx.fillText(p.label, p.x, p.y + 27 + bob);
        });

        brickBalls.forEach((ball) => {
            if (ball.trail && ball.trail.length > 1) {
                ball.trail.forEach((point, index) => {
                    const alpha = (index + 1) / ball.trail.length;
                    brickCtx.globalAlpha = alpha * 0.18;
                    brickCtx.fillStyle = BRICK.pierceTimer > 0 ? '#9fffd7' : (BRICK.fireStacks > 0 ? '#ffc857' : '#5de5ff');
                    brickCtx.beginPath();
                    brickCtx.arc(point.x, point.y, ball.r * (0.35 + alpha * 0.55), 0, Math.PI * 2);
                    brickCtx.fill();
                });
                brickCtx.globalAlpha = 1;
            }
            brickCtx.shadowColor = BRICK.pierceTimer > 0 ? '#9fffd7' : (BRICK.fireStacks > 0 ? '#ffc857' : '#5de5ff');
            brickCtx.shadowBlur = BRICK.giantBallTimer > 0 ? 18 : 10;
            brickCtx.fillStyle = BRICK.fireStacks > 0 ? '#ffd45a' : (BRICK.pierceTimer > 0 ? '#9fffd7' : '#eefbff');
            brickCtx.beginPath();
            brickCtx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
            brickCtx.fill();
            brickCtx.shadowBlur = 0;
            if (BRICK.fireStacks > 0 || BRICK.giantBallTimer > 0) {
                brickCtx.fillStyle = '#1a1200';
                brickCtx.font = 'bold 9px JetBrains Mono, monospace';
                brickCtx.fillText(String(getBallDamage()), ball.x, ball.y + 0.5);
            }
        });

        brickParticles.forEach((p) => {
            brickCtx.globalAlpha = Math.max(0, p.life / p.maxLife);
            brickCtx.fillStyle = p.color;
            brickCtx.beginPath();
            brickCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            brickCtx.fill();
            brickCtx.globalAlpha = 1;
        });

        if (brickPaddle) {
            const x = brickPaddle.x - brickPaddle.w / 2;
            const y = brickPaddle.y - brickPaddle.h / 2;
            const grad = brickCtx.createLinearGradient(x, y, x + brickPaddle.w, y + brickPaddle.h);
            grad.addColorStop(0, BRICK.magnetTimer > 0 ? '#ff66cc' : '#39d7ff');
            grad.addColorStop(0.5, '#f4fbff');
            grad.addColorStop(1, '#ffc857');
            brickCtx.shadowColor = BRICK.magnetTimer > 0 ? '#ff66cc' : '#39d7ff';
            brickCtx.shadowBlur = 18;
            brickCtx.fillStyle = grad;
            brickCtx.beginPath();
            brickCtx.roundRect(x, y, brickPaddle.w, brickPaddle.h, 9);
            brickCtx.fill();
            brickCtx.shadowBlur = 0;
            brickCtx.fillStyle = 'rgba(255,255,255,0.78)';
            brickCtx.fillRect(x + 8, y + 4, Math.max(0, brickPaddle.w - 16), 3);
            brickCtx.fillStyle = 'rgba(255,95,61,0.30)';
            brickCtx.fillRect(x, y + brickPaddle.h + 11, brickPaddle.w, 2);
        }
        brickCtx.restore();

        const stuckBall = brickBalls.find((ball) => ball.stuck);
        if (stuckBall && BRICK.running && !BRICK.paused) {
            brickCtx.save();
            brickCtx.strokeStyle = 'rgba(255,200,87,0.62)';
            brickCtx.setLineDash([8, 8]);
            brickCtx.lineWidth = 2;
            brickCtx.beginPath();
            brickCtx.moveTo(stuckBall.x, stuckBall.y - stuckBall.r - 4);
            brickCtx.lineTo(stuckBall.x, Math.max(66, stuckBall.y - 170));
            brickCtx.stroke();
            brickCtx.setLineDash([]);
            brickCtx.fillStyle = 'rgba(255,200,87,0.9)';
            brickCtx.textAlign = 'center';
            brickCtx.font = 'bold 13px sans-serif';
            brickCtx.fillText('SPACE 发射', stuckBall.x, Math.max(72, stuckBall.y - 185));
            brickCtx.restore();
        }

        if (BRICK.message && BRICK.messageTimer > 0) {
            brickCtx.save();
            const bubbleW = Math.min(440, BRICK.width - 34);
            brickCtx.fillStyle = 'rgba(3,7,15,0.76)';
            brickCtx.beginPath();
            brickCtx.roundRect(BRICK.width / 2 - bubbleW / 2, 58, bubbleW, 42, 12);
            brickCtx.fill();
            brickCtx.strokeStyle = 'rgba(255,200,87,0.36)';
            brickCtx.stroke();
            brickCtx.fillStyle = '#ffc857';
            brickCtx.textAlign = 'center';
            brickCtx.textBaseline = 'middle';
            brickCtx.font = 'bold 16px sans-serif';
            brickCtx.fillText(BRICK.message, BRICK.width / 2, 79);
            brickCtx.restore();
        }

        if (!BRICK.running && !BRICK.gameOver) {
            brickCtx.save();
            brickCtx.fillStyle = 'rgba(0,0,0,0.38)';
            brickCtx.fillRect(0, 0, BRICK.width, BRICK.height);
            brickCtx.fillStyle = '#f4fbff';
            brickCtx.textAlign = 'center';
            brickCtx.font = 'bold 32px sans-serif';
            brickCtx.fillText('超级弹球', BRICK.width / 2, BRICK.height / 2 - 34);
            brickCtx.fillStyle = 'rgba(244,251,255,0.78)';
            brickCtx.font = '16px sans-serif';
            brickCtx.fillText('清砖、叠连击、抢道具，FEVER 时分数翻倍且道具吸附', BRICK.width / 2, BRICK.height / 2 + 8);
            brickCtx.fillText('普通砖一击碎，数字砖需要把数字打到 0', BRICK.width / 2, BRICK.height / 2 + 38);
            brickCtx.restore();
        }

        if (BRICK.paused && BRICK.running) {
            brickCtx.save();
            brickCtx.fillStyle = 'rgba(0,0,0,0.45)';
            brickCtx.fillRect(0, 0, BRICK.width, BRICK.height);
            brickCtx.fillStyle = '#e8e8f0';
            brickCtx.textAlign = 'center';
            brickCtx.font = 'bold 28px sans-serif';
            brickCtx.fillText('超级弹球已暂停', BRICK.width / 2, BRICK.height / 2);
            brickCtx.restore();
        }

        if (BRICK.gameOver) {
            brickCtx.save();
            brickCtx.fillStyle = 'rgba(0,0,0,0.55)';
            brickCtx.fillRect(0, 0, BRICK.width, BRICK.height);
            brickCtx.textAlign = 'center';
            brickCtx.fillStyle = '#ff3366';
            brickCtx.font = 'bold 34px sans-serif';
            brickCtx.fillText('游戏结束', BRICK.width / 2, BRICK.height / 2 - 34);
            brickCtx.fillStyle = '#e8e8f0';
            brickCtx.font = '18px sans-serif';
            brickCtx.fillText(`最终得分：${BRICK.score}`, BRICK.width / 2, BRICK.height / 2 + 8);
            brickCtx.fillText(`最高连击：${BRICK.bestCombo}   到达关卡：${BRICK.level}`, BRICK.width / 2, BRICK.height / 2 + 40);
            brickCtx.fillText('点击“重新开始”继续挑战', BRICK.width / 2, BRICK.height / 2 + 72);
            brickCtx.restore();
        }
        drawUpgradeOverlay();
    };

    const loopBrick = (time) => {
        if (!BRICK.running) {
            drawBrickGame();
            return;
        }
        if (BRICK.paused) {
            drawBrickGame();
            return;
        }
        const dt = Math.min(0.026, (time - BRICK.lastTime) / 1000 || 0);
        BRICK.lastTime = time;
        updateBrickGame(dt);
        drawBrickGame();
        if (BRICK.running && !BRICK.paused) brickAnimId = requestAnimationFrame(loopBrick);
    };

    brickStartBtn.addEventListener('click', startBrickGame);
    brickRestartBtn.addEventListener('click', startBrickGame);
    brickEndRestartBtn?.addEventListener('click', startBrickGame);
    brickRerollUpgradesBtn?.addEventListener('click', rerollUpgradeChoices);
    brickPauseBtn.addEventListener('click', () => {
        if (!BRICK.running || BRICK.gameOver) return;
        BRICK.paused = !BRICK.paused;
        brickPauseBtn.textContent = BRICK.paused ? '继续' : '暂停';
        if (!BRICK.paused) {
            BRICK.lastTime = performance.now();
            scheduleBrickFrame();
        } else {
            drawBrickGame();
        }
    });

    const bindBrickMoveButton = (button, key) => {
        if (!button) return;
        const stop = (event) => {
            event?.preventDefault?.();
            brickKeys[key] = false;
            button.classList.remove('active');
        };
        button.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            brickKeys[key] = true;
            button.classList.add('active');
            button.setPointerCapture?.(event.pointerId);
        });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach((type) => {
            button.addEventListener(type, stop);
        });
    };

    bindBrickMoveButton(brickTouchLeftBtn, 'Left');
    bindBrickMoveButton(brickTouchRightBtn, 'Right');
    brickTouchLaunchBtn?.addEventListener('click', () => {
        releaseStuckBalls();
    });

    const updateBrickPointer = (event) => {
        if (!BRICK.running || BRICK.paused || BRICK.gameOver || !brickPaddle) return;
        const rect = brickCanvas.getBoundingClientRect();
        const clientX = event.clientX ?? event.touches?.[0]?.clientX;
        if (clientX == null) return;
        const scaledX = (clientX - rect.left) * (BRICK.width / rect.width);
        brickPointer.x = Math.max(brickPaddle.w / 2, Math.min(BRICK.width - brickPaddle.w / 2, scaledX));
    };

    const getBrickCanvasPoint = (event) => {
        const rect = brickCanvas.getBoundingClientRect();
        const clientX = event.clientX ?? event.touches?.[0]?.clientX;
        const clientY = event.clientY ?? event.touches?.[0]?.clientY;
        if (clientX == null || clientY == null) return null;
        return {
            x: (clientX - rect.left) * (BRICK.width / rect.width),
            y: (clientY - rect.top) * (BRICK.height / rect.height),
        };
    };

    const getUpgradeChoiceAtPoint = (point) => {
        if (!BRICK.upgradePending || !point) return -1;
        const panelW = Math.min(760, BRICK.width - 34);
        const panelH = 300;
        const panelX = (BRICK.width - panelW) / 2;
        const panelY = Math.max(92, (BRICK.height - panelH) / 2);
        const cardGap = 12;
        const cardW = (panelW - 48 - cardGap * 2) / 3;
        const y = panelY + 105;
        for (let index = 0; index < 3; index += 1) {
            const x = panelX + 24 + index * (cardW + cardGap);
            if (point.x >= x && point.x <= x + cardW && point.y >= y && point.y <= y + 136) return index;
        }
        return -1;
    };

    brickCanvas.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        if (BRICK.upgradePending) {
            const index = getUpgradeChoiceAtPoint(getBrickCanvasPoint(event));
            if (index >= 0) selectUpgradeChoice(index);
            return;
        }
        brickPointer.active = true;
        brickCanvas.setPointerCapture?.(event.pointerId);
        updateBrickPointer(event);
        releaseStuckBalls();
    });
    brickCanvas.addEventListener('pointermove', (event) => {
        if (!brickPointer.active) return;
        event.preventDefault();
        updateBrickPointer(event);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((type) => {
        brickCanvas.addEventListener(type, () => { brickPointer.active = false; });
    });

    window.addEventListener('keydown', (event) => {
        const brickSection = document.getElementById('brick');
        const isBrickActive = brickSection && !brickSection.classList.contains('hidden');
        if (!isBrickActive || brickSection.closest?.('.hidden') || document.getElementById('main-page')?.classList.contains('hidden')
            || document.hidden || isTypingTarget(event.target) || event.isComposing || event.keyCode === 229 || event.key === 'Process') return;
        const gameKeys = ['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D', ' ', 'Spacebar', 'Escape', '1', '2', '3', 'r', 'R'];
        if (gameKeys.includes(event.key)) event.preventDefault();
        if (BRICK.upgradePending) {
            if (event.key === '1' || event.key === '2' || event.key === '3') selectUpgradeChoice(Number(event.key) - 1);
            if (event.key === 'r' || event.key === 'R') rerollUpgradeChoices();
            return;
        }
        if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') brickKeys.Left = true;
        if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') brickKeys.Right = true;
        if (event.key === ' ' || event.key === 'Spacebar') releaseStuckBalls();
        if (event.key === 'Escape' && BRICK.running && !BRICK.gameOver) {
            BRICK.paused = !BRICK.paused;
            brickPauseBtn.textContent = BRICK.paused ? '继续' : '暂停';
            if (!BRICK.paused) {
                BRICK.lastTime = performance.now();
                scheduleBrickFrame();
            } else {
                drawBrickGame();
            }
        }
    });

    window.addEventListener('keyup', (event) => {
        if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') brickKeys.Left = false;
        if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') brickKeys.Right = false;
    });
    const clearBrickInputs = () => {
        brickKeys.Left = false;
        brickKeys.Right = false;
        brickPointer.active = false;
        brickTouchLeftBtn?.classList.remove('active');
        brickTouchRightBtn?.classList.remove('active');
    };
    window.addEventListener('blur', clearBrickInputs);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) clearBrickInputs();
    });

    brickUpgradeButtons.forEach((btn) => {
        btn.addEventListener('click', () => buyBrickUpgrade(btn.dataset.brickUpgrade));
    });


    return {
        state: BRICK,
        resize: resizeBrickCanvas,
        draw: drawBrickGame,
        reset: resetBrickGame,
        isRunning: () => BRICK.running,
        pause: () => {
            clearBrickInputs();
            if (!BRICK.running) return;
            BRICK.paused = true;
            brickPauseBtn.textContent = '继续';
            drawBrickGame();
        },
    };
};
