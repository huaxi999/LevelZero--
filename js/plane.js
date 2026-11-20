import { PLANE_ATTACK_UPGRADE_MAX, PLANE_LIFE_UPGRADE_MAX } from './storage.js';

import { PLANE_PERMANENT_UPGRADE_MAX } from './storage.js';

export const initPlaneGame = ({ dom, storage, submitCloudScore }) => {
    const {
        planeCanvas,
        planeScoreEl,
        planeLevelEl,
        planeCoinsEl,
        planeDiamondsEl,
        planeStartBtn,
        planeRestartBtn,
        planePauseBtn,
        planeControlHint,
        planeActionControls,
        planeBombBtn,
        planeBurstBtn,
        planeBombCount,
        planeBurstCount,
    } = dom;
    const ctx = planeCanvas.getContext('2d');
    const planeUiImages = {};
    const planeBossImages = {};
    const planeSpriteImages = {};
    const loadPlaneUiImage = (id, src) => {
        const img = new Image();
        img.onload = () => { planeUiImages[id] = img; renderPlaneGame(); };
        img.onerror = () => { planeUiImages[id] = null; };
        img.src = src;
    };
    const loadPlaneBossImage = (id, src) => {
        const img = new Image();
        img.onload = () => { planeBossImages[id] = img; renderPlaneGame(); };
        img.onerror = () => { planeBossImages[id] = null; };
        img.src = src;
    };
    const loadPlaneSpriteImage = (id, src) => {
        const img = new Image();
        img.onload = () => { planeSpriteImages[id] = img; renderPlaneGame(); };
        img.onerror = () => { planeSpriteImages[id] = null; };
        img.src = src;
    };
    loadPlaneUiImage('coin', 'assets/coin.png');
    loadPlaneUiImage('level', 'assets/lv.png');
    loadPlaneUiImage('point', 'assets/point.png');
    loadPlaneBossImage('boss1', 'assets/planes/boss1.png');
    loadPlaneBossImage('boss2', 'assets/planes/boss2.png');
    loadPlaneBossImage('boss3', 'assets/planes/boss3.png');
    loadPlaneBossImage('boss4', 'assets/planes/boss4.png');
    loadPlaneBossImage('boss5', 'assets/planes/boss5.png');
    loadPlaneBossImage('boss6', 'assets/planes/boss6.png');
    loadPlaneBossImage('boss7', 'assets/planes/boss7.png');
    loadPlaneBossImage('boss8', 'assets/planes/boss8.png');
    loadPlaneBossImage('boss9', 'assets/planes/boss9.png');
    loadPlaneBossImage('finalboss1', 'assets/planes/finalboss-1.png');
    loadPlaneBossImage('finalboss2', 'assets/planes/finalboss-2.png');
    loadPlaneBossImage('finalboss3', 'assets/planes/finalboss-3.png');
    loadPlaneBossImage('finalboss4', 'assets/planes/finalboss-4jieduan.png');
    loadPlaneBossImage('finalboss4half', 'assets/planes/finalboss-4jieduan-halfhp.png');
    loadPlaneSpriteImage('playerStandard', 'assets/planes/player-standard-fighter.png');
    loadPlaneSpriteImage('playerBarrage', 'assets/planes/player-barrage-fighter.png');
    loadPlaneSpriteImage('playerLaser', 'assets/planes/player-laser-fighter.png');
    loadPlaneSpriteImage('playerHeavy', 'assets/planes/player-heavy-fighter.png');
    loadPlaneSpriteImage('playerMagic', 'assets/planes/player-magic-fighter.png');
    loadPlaneSpriteImage('playerMelee', 'assets/planes/player-melee-fighter.png');
    loadPlaneSpriteImage('playerSummon', 'assets/planes/player-summon-fighter.png');
    loadPlaneSpriteImage('playerAfterburnerBoost', 'assets/planes/player-afterburner-boost-sheet.png');
    loadPlaneSpriteImage('effectMissileFlame', 'assets/planes/effect-missile-flame-strip.png');
    loadPlaneSpriteImage('effectGoldSpark', 'assets/planes/effect-gold-spark-strip.png');
    loadPlaneSpriteImage('effectArcaneOrb', 'assets/planes/effect-arcane-orb-strip.png');
    loadPlaneSpriteImage('effectArcaneGem', 'assets/planes/effect-arcane-gem-strip.png');
    loadPlaneSpriteImage('effectPurpleDiamond', 'assets/planes/effect-purple-diamond-strip.png');
    loadPlaneSpriteImage('effectBlueBeamLance', 'assets/planes/effect-blue-beam-lance-strip.png');
    loadPlaneSpriteImage('effectBlueLance', 'assets/planes/effect-blue-lance-strip.png');
    loadPlaneSpriteImage('effectCyanScythe', 'assets/planes/effect-cyan-scythe-strip.png');
    loadPlaneSpriteImage('effectCyanWave', 'assets/planes/effect-cyan-wave-strip.png');
    loadPlaneSpriteImage('effectIceBurst', 'assets/planes/effect-ice-burst-strip.png');
    loadPlaneSpriteImage('effectLightningBurst', 'assets/planes/effect-lightning-burst-strip.png');
    loadPlaneSpriteImage('effectArcaneBurst', 'assets/planes/effect-arcane-burst-strip.png');
    loadPlaneSpriteImage('effectMeteorExplosion', 'assets/planes/effect-meteor-explosion-strip.png');
    loadPlaneSpriteImage('effectVoidExplosion', 'assets/planes/effect-void-explosion-strip.png');
    const gameHud = document.querySelector('#plane .game-hud');
    const powerUpIndicator = document.createElement('div');
    powerUpIndicator.id = 'powerup-indicator';
    powerUpIndicator.className = 'hud-item powerup-indicator';
    powerUpIndicator.textContent = '';
    gameHud.appendChild(powerUpIndicator);

    const lifeDisplay = document.createElement('div');
    lifeDisplay.id = 'life-display';
    lifeDisplay.className = 'hud-item';
    lifeDisplay.textContent = '';
    gameHud.appendChild(lifeDisplay);

    let planeWallet = storage.getStoredPlaneWallet();
    let planeUpgrades = storage.getStoredPlaneUpgrades();
    const setStoredPlaneWallet = (wallet) => {
        planeWallet = storage.setStoredPlaneWallet(wallet);
    };
    const setStoredPlaneUpgrades = (upgrades) => {
        planeUpgrades = storage.setStoredPlaneUpgrades(upgrades);
    };
    const GAME = {
        running: false,
        paused: false,
        score: 0,
        level: 1,
        width: 0,
        height: 0,
        lastTime: 0,
        spawnTimer: 0,
        shotTimer: 0,
        gameOver: false,
        boss: null,
        bossKillCount: 0,
        waveState: 'small',
        waveTimer: 0,
        waveKills: 0,
        waveTarget: 0,
        waveIndex: 1,
        bossWarningSpawned: false,
        burstSequence: 0,
        fireLevel: 1,
        powerUpTimer: 0,
        shieldActive: false,
        bombs: 0,
        lives: 2,
        hp: 100,
        maxHp: 100,
        invincibleTimer: 0,
        doubleScoreTimer: 0,
        slowdownFactor: 1,
        slowdownTimer: 0,
        magnetTimer: 0,
        droneTimer: 0,
        droneCount: 0,
        burstCharges: 0,
        hitFlashTimer: 0,
        message: '',
        messageTimer: 0,
        combo: 0,
        comboTimer: 0,
        bestCombo: 0,
        shakeTimer: 0,
        shakeIntensity: 0,
        controlMode: 'keyboard',
        bossContactTimer: 0,
        respawnTimer: 0,
        frameId: 0,
        lastDamageFrame: -1,
        backgroundScroll: 0,
        runCoinsEarned: 0,
        runDiamondsEarned: 0,
        rewardGranted: false,
        runVictory: false,
        menuScreen: 'menu',
        menuMessage: '',
        difficultyStage: 1,
        buildCore: '',
        buildModules: [],
        buildTagCounts: {},
        buildDraft: null,
        barrierHp: 0,
        barrierMax: 0,
        autoMissileTimer: 0,
        autoLaserTimer: 0,
        autoVolleyTimer: 0,
        rearVolleyTimer: 0,
        summonTimer: 0,
        summonBarrierPulseTimer: 0,
        scytheTimer: 0,
        meleeHeat: 0,
        meteorTimer: 0,
        barrierRegenTimer: 0,
    };

    let player = null;
    let bullets = [];
    let enemyBullets = [];
    let enemies = [];
    let particles = [];
    let powerUps = [];
    let summons = [];
    const keys = {};
    const pointerControl = { active: false, x: 0, y: 0 };
    const clearPlaneInputs = () => {
        Object.keys(keys).forEach((key) => { keys[key] = false; });
        pointerControl.active = false;
    };
    let planeCanvasButtons = [];
    let planeAnimId = 0;
    const schedulePlaneFrame = () => {
        if (planeAnimId) cancelAnimationFrame(planeAnimId);
        planeAnimId = requestAnimationFrame(loopPlane);
    };
    const isPlaneMobileDevice = () => window.matchMedia?.('(max-width: 900px), (pointer: coarse)').matches ?? window.innerWidth <= 900;
    let selectedPlaneMode = isPlaneMobileDevice() ? 'touch' : 'keyboard';
    let selectedPlaneStage = Math.max(1, Math.min(20, planeUpgrades.maxStageUnlocked || 1));
    const isPlaneTouchMode = () => selectedPlaneMode === 'touch';
    const isPlaneLowPowerMode = () => isPlaneTouchMode() && isPlaneMobileDevice();
    const ENEMY_HP_MULTIPLIER = 20;
    const PLAYER_DAMAGE_MULTIPLIER = 20;
    const FIRE_LEVEL_MAX = 5;
    const FIRE_DAMAGE_SCALES = [0, 1, 1.4, 1.75, 2.1, 2.45];
    const DRONE_MAX_COUNT = 3;
    const PLAYER_BASE_HP = 100;
    const PLAYER_STARTING_LIVES = 2;
    const PLAYER_HP_PER_LIFE_LEVEL = 2;
    const PLAYER_BASE_DAMAGE = 1 * PLAYER_DAMAGE_MULTIPLIER;
    const BOMB_BASE_DAMAGE = 10 * PLAYER_DAMAGE_MULTIPLIER;
    const HEAL_AMOUNT = 25;
    const LIFE_LOST_INVINCIBLE_MS = 1500;
    const BOSS_DIAMOND_REWARD = 1;
    const FINAL_BOSS_DIAMOND_REWARD = 5;
    const PLANE_MODULE_REROLL_COST = 5;
    const PLANE_STAGE_MAX = 20;
    const PLANE_SUBSTAGES_PER_RUN = 20;
    const ENEMY_DAMAGE_RATIOS = {
        enemyBullet: 0.11,
        small: 0.12,
        fast: 0.12,
        sine: 0.13,
        medium: 0.15,
        shooter: 0.14,
        tank: 0.18,
        bossBullet: 0.17,
        bossHeavy: 0.22,
        bossContact: 0.25,
    };
    const getPlaneStage = () => {
        const value = (GAME.running || GAME.gameOver) ? GAME.difficultyStage : selectedPlaneStage;
        return Math.max(1, Math.min(PLANE_STAGE_MAX, Math.floor(value) || 1));
    };
    const getPlaneStageHpMult = () => 1 + (getPlaneStage() - 1) * 0.045;
    const getPlaneStageDamageMult = () => 1 + (getPlaneStage() - 1) * 0.025;
    const getPlaneStageScoreMult = () => 1 + (getPlaneStage() - 1) * 0.008;
    const getPlaneStageRewardMult = () => 1 + (getPlaneStage() - 1) * 0.015;
    const getPlaneMaxStageUnlocked = () => Math.max(1, Math.min(PLANE_STAGE_MAX, planeUpgrades.maxStageUnlocked || 1));
    const getPlayerBaseMaxHp = () => PLAYER_BASE_HP + planeUpgrades.lifeLevel * PLAYER_HP_PER_LIFE_LEVEL;
    const getPlayerMaxHp = () => Math.max(1, Math.round(getPlayerBaseMaxHp() * (1 + getPlaneBuildStats().maxHpBonusRatio)));
    const getPlayerBaseDamage = () => PLAYER_BASE_DAMAGE + planeUpgrades.attackLevel;
    const getPlayerDamage = () => Math.max(1, Math.round(getPlayerBaseDamage() * getPlaneBuildStats().damageMult));
    const getPlayerShootCooldown = () => Math.max(112, Math.round(160 * (1 - planeUpgrades.fireRateLevel * 0.009)));
    const getPlayerSpeed = () => Math.round(300 + planeUpgrades.engineLevel * 3);
    const getFireLevel = () => Math.max(1, Math.min(FIRE_LEVEL_MAX, Math.floor(GAME.fireLevel) || 1));
    const getShotTotalDamage = (fireLevel = getFireLevel()) => Math.max(1, Math.round(getPlayerDamage() * (FIRE_DAMAGE_SCALES[fireLevel] || 1)));
    const splitDamagePool = (totalDamage, count) => {
        const safeCount = Math.max(1, Math.floor(count) || 1);
        const base = Math.floor(totalDamage / safeCount);
        const remainder = totalDamage - base * safeCount;
        return Array.from({ length: safeCount }, (_, index) => base + (index < remainder ? 1 : 0));
    };
    const getDroneDamage = () => Math.max(1, Math.round(getPlayerDamage() * (0.2 + planeUpgrades.droneLevel * 0.006)));
    const getBombDamage = () => Math.max(1, Math.round((BOMB_BASE_DAMAGE + planeUpgrades.attackLevel * 5 + planeUpgrades.bombLevel * 8) * getPlaneBuildStats().bombDamageMult));
    const getMagnetRange = () => 180 + planeUpgrades.magnetLevel * 5;
    const getMagnetPullSpeed = () => 220 + planeUpgrades.magnetLevel * 5;
    const getMagnetDuration = () => 10000 + planeUpgrades.magnetLevel * 220;
    const getDroneDuration = () => 12000 + planeUpgrades.droneLevel * 260;
    const getPermanentRewardMult = () => 1 + planeUpgrades.rewardLevel * 0.015;
    const getAttackUpgradeCost = () => 10 + Math.floor(Math.pow(planeUpgrades.attackLevel + 1, 1.32) * 7);
    const getLifeUpgradeCost = () => 4 + Math.floor(Math.pow(planeUpgrades.lifeLevel + 1, 1.24) * 1.7);
    const getIncomingDamage = (ratio) => Math.max(1, Math.round(getPlayerMaxHp() * ratio * getPlaneStageDamageMult()));
    const getEnemyContactDamage = (enemy) => getIncomingDamage(ENEMY_DAMAGE_RATIOS[enemy?.type] || ENEMY_DAMAGE_RATIOS.medium);
    const getCoinUpgradeCost = (level, base = 12, growth = 5.8) => base + Math.floor(Math.pow(level + 1, 1.34) * growth);
    const getDiamondUpgradeCost = (level, base = 4, growth = 1.55) => base + Math.floor(Math.pow(level + 1, 1.27) * growth);
    const getPlaneShopUpgrades = () => ([
        {
            id: 'attackLevel',
            name: '主炮火力',
            currency: 'coins',
            max: PLANE_ATTACK_UPGRADE_MAX,
            level: planeUpgrades.attackLevel,
            cost: getAttackUpgradeCost(),
            desc: `伤害池 ${getPlayerDamage()}`,
        },
        {
            id: 'lifeLevel',
            name: '装甲上限',
            currency: 'diamonds',
            max: PLANE_LIFE_UPGRADE_MAX,
            level: planeUpgrades.lifeLevel,
            cost: getLifeUpgradeCost(),
            desc: `每条命 ${getPlayerMaxHp()}`,
        },
        {
            id: 'fireRateLevel',
            name: '供弹系统',
            currency: 'coins',
            max: PLANE_PERMANENT_UPGRADE_MAX,
            level: planeUpgrades.fireRateLevel,
            cost: getCoinUpgradeCost(planeUpgrades.fireRateLevel, 18, 6.6),
            desc: `射击间隔 ${getPlayerShootCooldown()}ms`,
        },
        {
            id: 'engineLevel',
            name: '推进引擎',
            currency: 'coins',
            max: PLANE_PERMANENT_UPGRADE_MAX,
            level: planeUpgrades.engineLevel,
            cost: getCoinUpgradeCost(planeUpgrades.engineLevel, 14, 5.4),
            desc: `速度 ${getPlayerSpeed()}`,
        },
        {
            id: 'magnetLevel',
            name: '补给磁场',
            currency: 'coins',
            max: PLANE_PERMANENT_UPGRADE_MAX,
            level: planeUpgrades.magnetLevel,
            cost: getCoinUpgradeCost(planeUpgrades.magnetLevel, 12, 4.9),
            desc: `吸附 ${getMagnetRange()}`,
        },
        {
            id: 'droneLevel',
            name: '僚机协议',
            currency: 'diamonds',
            max: PLANE_PERMANENT_UPGRADE_MAX,
            level: planeUpgrades.droneLevel,
            cost: getDiamondUpgradeCost(planeUpgrades.droneLevel, 5, 1.35),
            desc: `僚机 ${Math.round((0.2 + planeUpgrades.droneLevel * 0.004) * 100)}%`,
        },
        {
            id: 'bombLevel',
            name: '炸弹弹舱',
            currency: 'diamonds',
            max: PLANE_PERMANENT_UPGRADE_MAX,
            level: planeUpgrades.bombLevel,
            cost: getDiamondUpgradeCost(planeUpgrades.bombLevel, 5, 1.5),
            desc: `炸弹 ${getBombDamage()}`,
        },
        {
            id: 'rewardLevel',
            name: '战利品协议',
            currency: 'diamonds',
            max: PLANE_PERMANENT_UPGRADE_MAX,
            level: planeUpgrades.rewardLevel,
            cost: getDiamondUpgradeCost(planeUpgrades.rewardLevel, 6, 1.45),
            desc: `奖励 +${Math.round((getPermanentRewardMult() - 1) * 100)}%`,
        },
    ]);
    const MAX_PARTICLES = 130;
    const MAX_BULLETS = 82;
    const MAX_ENEMY_BULLETS = 76;
    const MAX_POWERUPS = 12;
    const MAX_ENEMIES = 30;
    const getPlaneParticleLimit = () => isPlaneLowPowerMode() ? 58 : MAX_PARTICLES;
    const WAVE_LABELS = {
        small: '小怪波',
        elite: '精英怪',
        reward: '补给奖励',
        bossWarning: 'BOSS 预警',
        boss: 'BOSS',
        clear: '结算奖励',
    };
    const ARCADE_COLORS = {
        steelDark: '#121827',
        steelMid: '#39465f',
        steelLight: '#d7e3f5',
        playerBlue: '#39d7ff',
        playerGold: '#ffd25a',
        enemyRed: '#ff365a',
        enemyOrange: '#ff9d2e',
        enemyViolet: '#a65cff',
        enemyCyan: '#4fd4ff',
    };

    const PLANE_BUILD_RARITIES = {
        common: { label: '普通', color: '#92f7ff', weight: 3.2 },
        rare: { label: '稀有', color: '#a78bfa', weight: 1.65 },
        epic: { label: '史诗', color: '#ffd25a', weight: 0.72 },
    };

    const PLANE_BUILD_CORES = [
        {
            id: 'barrage',
            name: '弹幕流',
            color: '#ffd25a',
            tags: ['弹幕', '火力'],
            desc: '主炮覆盖更宽，适合清小怪和压制精英。',
            effects: { extraShots: 1, shotCooldownMult: 0.98 },
        },
        {
            id: 'missile',
            name: '导弹流',
            color: '#ff9d2e',
            tags: ['爆破', '火力'],
            desc: '攻击时概率发射追踪导弹，命中后造成小范围爆炸。',
            effects: { missileChance: 0.15, missileDamageMult: 0.94, explosionRadius: 20 },
        },
        {
            id: 'laser',
            name: '激光流',
            color: '#62d2ff',
            tags: ['激光', '火力'],
            desc: '主炮获得穿透能力，打 BOSS 和纵向敌群更稳定。',
            effects: { pierce: 1, damageMult: 1.01, shotCooldownMult: 1.08 },
        },
        {
            id: 'shield',
            name: '护盾流',
            color: '#00ff88',
            tags: ['护盾', '生存'],
            desc: '开局自带护盾，生命更厚，容错率更高。',
            effects: { maxHpBonusRatio: 0.12, damageTakenMult: 0.92, startShield: true },
        },
        {
            id: 'summon',
            name: '召唤流',
            color: '#9d7cff',
            tags: ['召唤', '火力'],
            desc: '周期性部署临时辅助僚机，炮台、导弹架和激光器会协同作战。',
            effects: { summonInterval: 6800, summonDurationBonus: 8200, summonSlots: 1, summonDamageMult: 0.48, summonTurret: true },
        },
        {
            id: 'melee',
            name: '近战流',
            color: '#ff6b9d',
            tags: ['近战', '生存'],
            desc: '主攻改为近距离范围斩击，不再发射常规远程弹。',
            effects: { meleeMode: true, meleeRadius: 72, meleeDamageMult: 1.28, lifeStealRatio: 0.035 },
        },
        {
            id: 'magic',
            name: '魔法流',
            color: '#d6f75a',
            tags: ['魔法', '火力'],
            desc: '发射魔法弹和火焰弹，依靠溅射、追踪和元素爆发清场。',
            effects: { magicMode: true, magicDamageMult: 1.08, magicSplashRadius: 22, magicHoming: 0.16 },
        },
    ];

    const PLANE_BUILD_MODULES = [
        { id: 'universal_targeting_chip', core: 'universal', name: '泛用瞄准芯片', rarity: 'common', tags: ['通用', '火力'], desc: '所有流派总伤害提升 6%。', effects: { damageMult: 1.06 } },
        { id: 'universal_boss_analyzer', core: 'universal', name: '首领解析仪', rarity: 'rare', tags: ['通用', '火力'], desc: '对首领伤害提升 10%。', effects: { bossDamageMult: 1.1 } },
        { id: 'universal_light_alloy', core: 'universal', name: '轻质合金骨架', rarity: 'common', tags: ['通用', '生存'], desc: '装甲小幅提升，受到伤害降低。', effects: { maxHpBonusRatio: 0.04, damageTakenMult: 0.96 } },
        { id: 'universal_nano_plating', core: 'universal', name: '纳米装甲板', rarity: 'common', tags: ['通用', '生存'], desc: '生命上限提升 8%。', effects: { maxHpBonusRatio: 0.08 } },
        { id: 'universal_med_gel', core: 'universal', name: '自修复凝胶', rarity: 'common', tags: ['通用', '生存'], desc: '治疗道具效果提升 18%。', effects: { healMult: 1.18 } },
        { id: 'universal_repair_drone', core: 'universal', name: '维修微机群', rarity: 'rare', tags: ['通用', '护盾'], desc: '每 10 秒恢复少量护盾层。', effects: { barrierRegenInterval: 10000, barrierRegenRatio: 0.04, barrierMaxRatio: 0.14 } },
        { id: 'universal_emergency_shield', core: 'universal', name: '应急护盾发生器', rarity: 'rare', tags: ['通用', '护盾'], desc: '选择后立刻获得一次护盾和少量护盾层。', effects: { startShield: true, barrierMaxRatio: 0.08, grantBarrierRatio: 0.06 } },
        { id: 'universal_bomb_bay', core: 'universal', name: '扩容炸弹舱', rarity: 'common', tags: ['通用', '爆破'], desc: '选择后获得 1 枚炸弹，炸弹伤害提升 14%。', effects: { grantBombs: 1, bombDamageMult: 1.14 } },
        { id: 'universal_burst_capacitor', core: 'universal', name: '爆发电容组', rarity: 'common', tags: ['通用', '火力'], desc: '选择后获得 1 次爆发，爆发伤害提升 12%。', effects: { grantBursts: 1, burstDamageMult: 1.12 } },
        { id: 'universal_combat_recorder', core: 'universal', name: '战果记录仪', rarity: 'common', tags: ['通用'], desc: '分数收益提升 8%。', effects: { scoreMult: 1.08 } },
        { id: 'universal_supply_scanner', core: 'universal', name: '补给扫描阵列', rarity: 'rare', tags: ['通用', '生存'], desc: '击破敌人时道具掉落率提升。', effects: { powerUpDropBonus: 0.035 } },
        { id: 'universal_graze_converter', core: 'universal', name: '擦弹转换器', rarity: 'rare', tags: ['通用', '护盾'], desc: '擦弹时转换为少量护盾层。', effects: { grazeBarrierRatio: 0.014, barrierMaxRatio: 0.12 } },
        { id: 'universal_cooldown_sync', core: 'universal', name: '循环同步器', rarity: 'common', tags: ['通用', '火力'], desc: '所有流派攻击冷却缩短 4%。', effects: { cooldownMult: 0.96 } },
        { id: 'universal_core_overdrive', core: 'universal', name: '核心超频阀', rarity: 'epic', tags: ['通用', '火力'], desc: '总伤害和攻击频率明显提升，但承伤略增。', effects: { damageMult: 1.08, cooldownMult: 0.96, damageTakenMult: 1.04 } },
        { id: 'universal_reward_beacon', core: 'universal', name: '战利品信标', rarity: 'common', tags: ['通用'], desc: '分数收益提升，并小幅提高道具掉落率。', effects: { scoreMult: 1.06, powerUpDropBonus: 0.02 } },
        { id: 'universal_reinforced_cockpit', core: 'universal', name: '强化驾驶舱', rarity: 'rare', tags: ['通用', '生存'], desc: '生命上限提升，受到伤害降低。', effects: { maxHpBonusRatio: 0.05, damageTakenMult: 0.97 } },
        { id: 'universal_shield_battery', core: 'universal', name: '护盾电池包', rarity: 'common', tags: ['通用', '护盾'], desc: '立刻获得护盾层，并提高护盾层上限。', effects: { barrierMaxRatio: 0.1, grantBarrierRatio: 0.08 } },
        { id: 'universal_precision_burst', core: 'universal', name: '精密火控台', rarity: 'rare', tags: ['通用', '火力'], desc: '总伤害和首领伤害小幅提升。', effects: { damageMult: 1.03, bossDamageMult: 1.04 } },
        { id: 'universal_field_stabilizer', core: 'universal', name: '力场稳定器', rarity: 'common', tags: ['通用', '生存'], desc: '承伤降低，攻击循环略微加快。', effects: { damageTakenMult: 0.97, cooldownMult: 0.99 } },
        { id: 'universal_survival_cache', core: 'universal', name: '战场生存箱', rarity: 'epic', tags: ['通用', '生存'], desc: '立刻修复装甲，补充炸弹和爆发，并小幅降低承伤。', effects: { grantHealRatio: 0.22, grantBombs: 1, grantBursts: 1, damageTakenMult: 0.97 } },

        { id: 'barrage_spread', core: 'barrage', name: '扩散炮口', rarity: 'common', tags: ['弹幕'], desc: '主炮额外增加一组斜向弹。', effects: { extraShots: 1 } },
        { id: 'barrage_rapid', core: 'barrage', name: '高速供弹机', rarity: 'common', tags: ['弹幕', '火力'], desc: '射击冷却缩短 5%。', effects: { shotCooldownMult: 0.95 } },
        { id: 'barrage_focus', core: 'barrage', name: '稳定弹芯', rarity: 'rare', tags: ['火力'], desc: '总伤害提升 8%。', effects: { damageMult: 1.08 } },
        { id: 'barrage_split', core: 'barrage', name: '翼尖副炮', rarity: 'rare', tags: ['弹幕'], desc: '再增加一组外侧弹道。', effects: { extraShots: 1 } },
        { id: 'barrage_pierce', core: 'barrage', name: '穿甲弹链', rarity: 'epic', tags: ['弹幕', '火力'], desc: '所有主炮弹可额外穿透 1 个目标。', effects: { pierce: 1 } },
        { id: 'barrage_combo', core: 'barrage', name: '连击校准仪', rarity: 'common', tags: ['弹幕'], desc: '连击分数更容易滚起来。', effects: { scoreMult: 1.08 } },
        { id: 'barrage_auto_volley', core: 'barrage', name: '定时齐射器', rarity: 'rare', tags: ['弹幕'], desc: '每 6 秒向前方追加一轮轻型齐射。', effects: { autoVolleyInterval: 6200, autoVolleyCount: 4, autoVolleyDamageMult: 0.28 } },
        { id: 'barrage_light_frame', core: 'barrage', name: '轻量弹架', rarity: 'common', tags: ['弹幕'], desc: '弹速提升 8%，连击收益小幅提升。', effects: { bulletSpeedMult: 1.08, scoreMult: 1.04 } },
        { id: 'barrage_safe_feed', core: 'barrage', name: '稳压供弹', rarity: 'rare', tags: ['弹幕', '生存'], desc: '射速小幅提升，受到伤害小幅降低。', effects: { shotCooldownMult: 0.97, damageTakenMult: 0.97 } },
        { id: 'barrage_cross_feed', core: 'barrage', name: '交叉供弹轨', rarity: 'common', tags: ['弹幕'], desc: '主炮射击时追加两枚低伤侧翼弹。', effects: { sideShotCount: 2, sideShotDamageMult: 0.22 } },
        { id: 'barrage_rear_matrix', core: 'barrage', name: '后掠矩阵', rarity: 'rare', tags: ['弹幕', '火力'], desc: '每 6.8 秒自动释放一轮扇形支援弹。', effects: { rearVolleyInterval: 6800, rearVolleyCount: 4, rearVolleyDamageMult: 0.28 } },
        { id: 'barrage_graze_loader', core: 'barrage', name: '擦弹装填机', rarity: 'rare', tags: ['弹幕', '生存'], desc: '擦弹时回收少量当前攻击冷却。', effects: { grazeShotRefundMs: 90, scoreMult: 1.03 } },
        { id: 'barrage_break_chain', core: 'barrage', name: '破阵链炮', rarity: 'rare', tags: ['弹幕'], desc: '击破敌人时有概率从爆点追加轻型弹幕。', effects: { killVolleyChance: 0.2, killVolleyCount: 3, killVolleyDamageMult: 0.24 } },
        { id: 'barrage_boss_rake', core: 'barrage', name: '扫舰火线', rarity: 'common', tags: ['弹幕', '火力'], desc: '弹速提升，并小幅提升对首领伤害。', effects: { bulletSpeedMult: 1.05, bossDamageMult: 1.06 } },
        { id: 'barrage_heat_sink', core: 'barrage', name: '热沉供弹盘', rarity: 'epic', tags: ['弹幕', '火力'], desc: '全局攻击循环加快，主炮射速提升，但承伤略增。', effects: { cooldownMult: 0.97, shotCooldownMult: 0.97, damageTakenMult: 1.02 } },

        { id: 'missile_guidance', core: 'missile', name: '热源制导', rarity: 'common', tags: ['爆破'], desc: '导弹触发率 +7%。', effects: { missileChance: 0.07 } },
        { id: 'missile_payload', core: 'missile', name: '重型弹头', rarity: 'rare', tags: ['爆破', '火力'], desc: '导弹伤害提升 22%。', effects: { missileDamageMult: 1.22 } },
        { id: 'missile_cluster', core: 'missile', name: '集束弹舱', rarity: 'epic', tags: ['爆破'], desc: '触发导弹时额外发射 1 枚。', effects: { extraMissiles: 1 } },
        { id: 'missile_blast', core: 'missile', name: '扩大爆心', rarity: 'common', tags: ['爆破'], desc: '爆炸范围提升。', effects: { explosionRadius: 18 } },
        { id: 'missile_boss', core: 'missile', name: '破舰弹道', rarity: 'rare', tags: ['爆破', '火力'], desc: '对首领伤害提升 14%。', effects: { bossDamageMult: 1.14 } },
        { id: 'missile_bomb', core: 'missile', name: '同步引爆器', rarity: 'common', tags: ['爆破'], desc: '炸弹伤害提升 18%。', effects: { bombDamageMult: 1.18 } },
        { id: 'missile_timer_pod', core: 'missile', name: '自动挂架', rarity: 'rare', tags: ['爆破'], desc: '每 5 秒自动向前发射 1 枚导弹。', effects: { autoMissileInterval: 5000, autoMissileDamageMult: 0.82 } },
        { id: 'missile_micro_rack', core: 'missile', name: '微型弹巢', rarity: 'common', tags: ['爆破'], desc: '每 6.5 秒自动发射一枚轻型导弹，并略增触发率。', effects: { autoMissileInterval: 6500, autoMissileDamageMult: 0.62, missileChance: 0.03 } },
        { id: 'missile_stabilizer', core: 'missile', name: '尾焰稳定器', rarity: 'rare', tags: ['爆破', '生存'], desc: '导弹更稳，爆炸范围小幅提升，受伤略降。', effects: { explosionRadius: 8, damageTakenMult: 0.97 } },
        { id: 'missile_smart_fin', core: 'missile', name: '智能舵翼', rarity: 'common', tags: ['爆破'], desc: '导弹追踪转向能力提升。', effects: { missileTurnMult: 1.25 } },
        { id: 'missile_shaped_charge', core: 'missile', name: '定向破片弹', rarity: 'rare', tags: ['爆破', '火力'], desc: '导弹爆炸溅射伤害提升。', effects: { missileSplashDamageMult: 1.22 } },
        { id: 'missile_afterblast', core: 'missile', name: '二次爆燃剂', rarity: 'rare', tags: ['爆破'], desc: '爆炸范围和溅射伤害同时提升。', effects: { explosionRadius: 10, missileSplashDamageMult: 1.08 } },
        { id: 'missile_quick_lock', core: 'missile', name: '快速锁定器', rarity: 'common', tags: ['爆破', '火力'], desc: '导弹触发率提升，攻击循环略微加快。', effects: { missileChance: 0.04, cooldownMult: 0.99 } },
        { id: 'missile_chaff_armor', core: 'missile', name: '箔条装甲盒', rarity: 'common', tags: ['爆破', '生存'], desc: '承伤降低，并小幅提高补给掉落率。', effects: { damageTakenMult: 0.97, powerUpDropBonus: 0.01 } },
        { id: 'missile_final_warhead', core: 'missile', name: '终末战斗部', rarity: 'epic', tags: ['爆破', '火力'], desc: '导弹和对首领伤害提升，但主炮循环略慢。', effects: { missileDamageMult: 1.1, bossDamageMult: 1.08, shotCooldownMult: 1.03 } },

        { id: 'laser_lens', core: 'laser', name: '聚焦透镜', rarity: 'common', tags: ['激光', '火力'], desc: '总伤害提升 7%。', effects: { damageMult: 1.07 } },
        { id: 'laser_prism', core: 'laser', name: '棱镜折射', rarity: 'rare', tags: ['激光'], desc: '主炮额外穿透 1 个目标。', effects: { pierce: 1 } },
        { id: 'laser_overclock', core: 'laser', name: '过载电容', rarity: 'rare', tags: ['激光', '火力'], desc: '射速明显提升，但受到伤害略增。', effects: { shotCooldownMult: 0.91, damageTakenMult: 1.03 } },
        { id: 'laser_boss', core: 'laser', name: '核心切割', rarity: 'epic', tags: ['激光'], desc: '对首领伤害提升 13%。', effects: { bossDamageMult: 1.13 } },
        { id: 'laser_clean', core: 'laser', name: '净空光束', rarity: 'common', tags: ['激光'], desc: '主炮弹速度更快，穿透弹更稳定。', effects: { bulletSpeedMult: 1.12 } },
        { id: 'laser_burst', core: 'laser', name: '环形光矛', rarity: 'common', tags: ['激光'], desc: '能量爆发伤害提升，并小幅提高首领伤害。', effects: { burstDamageMult: 1.18, bossDamageMult: 1.03 } },
        { id: 'laser_timer_lance', core: 'laser', name: '定时光矛', rarity: 'rare', tags: ['激光'], desc: '每 6 秒自动向前发射一束穿透光矛。', effects: { autoLaserInterval: 6000, autoLaserDamageMult: 0.68 } },
        { id: 'laser_coolant', core: 'laser', name: '冷却导管', rarity: 'common', tags: ['激光', '生存'], desc: '过载更稳定：射速小幅提升，受伤不再明显增加。', effects: { shotCooldownMult: 0.98, damageTakenMult: 0.98 } },
        { id: 'laser_reflector', core: 'laser', name: '反射镀层', rarity: 'rare', tags: ['激光', '护盾'], desc: '每 10 秒获得少量百分比护盾层。', effects: { barrierRegenInterval: 10000, barrierRegenRatio: 0.05, barrierMaxRatio: 0.16 } },
        { id: 'laser_sustain_focus', core: 'laser', name: '持续焦痕', rarity: 'rare', tags: ['激光', '火力'], desc: '穿透后光束伤害不易衰减。', effects: { pierceDamageMult: 1.08 } },
        { id: 'laser_phase_grate', core: 'laser', name: '相位光栅', rarity: 'common', tags: ['激光'], desc: '小幅提升穿透能力和弹速。', effects: { pierce: 1, bulletSpeedMult: 1.04 } },
        { id: 'laser_charge_lance', core: 'laser', name: '蓄能长矛', rarity: 'rare', tags: ['激光', '火力'], desc: '自动光矛伤害提升，并略微加快触发。', effects: { autoLaserInterval: 5800, autoLaserDamageMult: 0.8 } },
        { id: 'laser_phase_cooling', core: 'laser', name: '相位冷却片', rarity: 'common', tags: ['激光'], desc: '所有攻击循环略微加快。', effects: { cooldownMult: 0.97 } },
        { id: 'laser_surgical_array', core: 'laser', name: '外科切割阵列', rarity: 'rare', tags: ['激光', '火力'], desc: '对首领伤害提升，命中更集中。', effects: { bossDamageMult: 1.08, damageMult: 1.02 } },
        { id: 'laser_light_screen', core: 'laser', name: '光幕偏折层', rarity: 'epic', tags: ['激光', '护盾'], desc: '周期获得护盾层，并降低承伤。', effects: { barrierRegenInterval: 9000, barrierRegenRatio: 0.04, barrierMaxRatio: 0.14, damageTakenMult: 0.97 } },

        { id: 'shield_plate', core: 'shield', name: '复合装甲', rarity: 'common', tags: ['护盾', '生存'], desc: '生命上限提升 10%。', effects: { maxHpBonusRatio: 0.1 } },
        { id: 'shield_reactor', core: 'shield', name: '护盾反应堆', rarity: 'rare', tags: ['护盾'], desc: '每次击破首领后刷新护盾，并提高护盾层上限。', effects: { shieldAfterBoss: true, barrierMaxRatio: 0.08 } },
        { id: 'shield_bulwark', core: 'shield', name: '偏导力场', rarity: 'common', tags: ['护盾'], desc: '受到伤害降低 8%。', effects: { damageTakenMult: 0.92 } },
        { id: 'shield_shock', core: 'shield', name: '破盾冲击', rarity: 'rare', tags: ['护盾', '爆破'], desc: '护盾被击碎时，对周围敌人造成反击。', effects: { shieldBreakDamageMult: 2.2, shieldBreakRadius: 84 } },
        { id: 'shield_repair', core: 'shield', name: '战地维修', rarity: 'common', tags: ['生存'], desc: '治疗道具效果提升 28%。', effects: { healMult: 1.28 } },
        { id: 'shield_laststand', core: 'shield', name: '应急电池', rarity: 'epic', tags: ['护盾', '生存'], desc: '立刻获得护盾、护盾层、1 枚炸弹和 1 次爆发。', effects: { startShield: true, barrierMaxRatio: 0.12, grantBarrierRatio: 0.1, grantBombs: 1, grantBursts: 1 } },
        { id: 'shield_layer_regen', core: 'shield', name: '层叠护盾', rarity: 'rare', tags: ['护盾'], desc: '每 8 秒获得 7% 最大生命的护盾层，最多 21%。', effects: { barrierRegenInterval: 8000, barrierRegenRatio: 0.07, barrierMaxRatio: 0.21 } },
        { id: 'shield_graze_charge', core: 'shield', name: '擦弹充能', rarity: 'common', tags: ['护盾', '生存'], desc: '擦弹时获得 2% 最大生命的护盾层。', effects: { grazeBarrierRatio: 0.02, barrierMaxRatio: 0.18 } },
        { id: 'shield_capacitor', core: 'shield', name: '储能电容', rarity: 'rare', tags: ['护盾', '火力'], desc: '护盾层上限提高，并小幅提升总伤害。', effects: { barrierMaxRatio: 0.12, damageMult: 1.06 } },
        { id: 'shield_vanguard_core', core: 'shield', name: '先锋护核', rarity: 'rare', tags: ['护盾', '火力'], desc: '拥有护盾或护盾层时，造成伤害提升。', effects: { barrierDamageMult: 1.08 } },
        { id: 'shield_safety_valve', core: 'shield', name: '安全泄压阀', rarity: 'common', tags: ['护盾', '生存'], desc: '主动护盾抵消伤害时回复装甲。', effects: { shieldBlockHealRatio: 0.12 } },
        { id: 'shield_kill_charge', core: 'shield', name: '击破回充线圈', rarity: 'rare', tags: ['护盾'], desc: '击破敌人时获得少量护盾层。', effects: { barrierOnKillRatio: 0.015, barrierMaxRatio: 0.12 } },
        { id: 'shield_dense_carapace', core: 'shield', name: '密化外壳', rarity: 'common', tags: ['护盾', '生存'], desc: '生命和减伤提升，但攻击循环略慢。', effects: { maxHpBonusRatio: 0.07, damageTakenMult: 0.95, cooldownMult: 1.02 } },
        { id: 'shield_return_current', core: 'shield', name: '回流电弧', rarity: 'rare', tags: ['护盾', '火力'], desc: '护盾层供能提升伤害，爆发伤害小幅提升。', effects: { barrierDamageMult: 1.05, burstDamageMult: 1.08 } },
        { id: 'shield_supply_anchor', core: 'shield', name: '补给锚点', rarity: 'epic', tags: ['护盾', '生存'], desc: '治疗效果和补给掉落率提升。', effects: { healMult: 1.12, powerUpDropBonus: 0.018, barrierMaxRatio: 0.08 } },

        { id: 'summon_dual_turret', core: 'summon', name: '双联机炮台', rarity: 'rare', tags: ['召唤'], desc: '召唤物可部署额外机炮台。', effects: { summonTurret: true, summonSlots: 1 } },
        { id: 'summon_missile_rack', core: 'summon', name: '导弹挂架', rarity: 'rare', tags: ['召唤', '爆破'], desc: '召唤物池加入临时导弹发射器。', effects: { summonMissile: true, summonDamageMult: 1.08 } },
        { id: 'summon_laser_node', core: 'summon', name: '激光节点', rarity: 'rare', tags: ['召唤', '激光'], desc: '召唤物池加入穿透激光发射器。', effects: { summonLaser: true, summonDamageMult: 1.06 } },
        { id: 'summon_long_contract', core: 'summon', name: '延时契约', rarity: 'common', tags: ['召唤', '生存'], desc: '召唤物持续时间提高。', effects: { summonDurationBonus: 2600 } },
        { id: 'summon_rapid_protocol', core: 'summon', name: '速射协议', rarity: 'rare', tags: ['召唤', '火力'], desc: '召唤物攻击间隔缩短。', effects: { summonFireRateMult: 0.86 } },
        { id: 'summon_damage_link', core: 'summon', name: '火控链路', rarity: 'common', tags: ['召唤', '火力'], desc: '召唤物伤害提升。', effects: { summonDamageMult: 1.14 } },
        { id: 'summon_quick_drop', core: 'summon', name: '快速投放舱', rarity: 'common', tags: ['召唤'], desc: '召唤间隔缩短。', effects: { summonInterval: 5600 } },
        { id: 'summon_orbit_guard', core: 'summon', name: '环卫护航器', rarity: 'rare', tags: ['召唤', '护盾'], desc: '召唤物存在时小幅降低受到伤害。', effects: { summonGuardDamageTakenMult: 0.94 } },
        { id: 'summon_command_swarm', core: 'summon', name: '蜂群指挥台', rarity: 'epic', tags: ['召唤', '火力'], desc: '召唤上限提升，并同时启用导弹和激光召唤物。', effects: { summonSlots: 1, summonMissile: true, summonLaser: true, summonDamageMult: 1.1 } },
        { id: 'summon_repair_beacon', core: 'summon', name: '维修信标机', rarity: 'rare', tags: ['召唤', '护盾'], desc: '召唤物存在时周期性恢复护盾层。', effects: { summonBarrierPulseInterval: 5200, summonBarrierPulseRatio: 0.03, barrierMaxRatio: 0.1 } },
        { id: 'summon_last_blast', core: 'summon', name: '退场爆破协议', rarity: 'common', tags: ['召唤', '爆破'], desc: '召唤物退场时在当前位置爆炸。', effects: { summonExpireExplosionDamageMult: 0.62 } },
        { id: 'summon_target_painter', core: 'summon', name: '目标标记仪', rarity: 'rare', tags: ['召唤', '火力'], desc: '召唤物伤害提升，并小幅提升对首领伤害。', effects: { summonDamageMult: 1.08, bossDamageMult: 1.04 } },
        { id: 'summon_spare_parts', core: 'summon', name: '备用零件仓', rarity: 'common', tags: ['召唤', '生存'], desc: '召唤物持续更久，击破敌人时获得微量护盾层。', effects: { summonDurationBonus: 1800, barrierOnKillRatio: 0.008, barrierMaxRatio: 0.08 } },
        { id: 'summon_sentry_line', core: 'summon', name: '哨戒火线', rarity: 'common', tags: ['召唤'], desc: '召唤物攻速提升，存在时承伤略降。', effects: { summonFireRateMult: 0.92, summonGuardDamageTakenMult: 0.97 } },
        { id: 'summon_field_factory', core: 'summon', name: '前线组装厂', rarity: 'epic', tags: ['召唤', '生存'], desc: '召唤投放更频繁，并小幅提高补给掉落率。', effects: { summonInterval: 6200, powerUpDropBonus: 0.018, summonDurationBonus: 1200 } },
        { id: 'summon_interceptor_wing', core: 'summon', name: '拦截机翼', rarity: 'rare', tags: ['召唤', '生存'], desc: '召唤物池加入高速拦截机，发射偏转弹道并略降承伤。', effects: { summonInterceptor: true, summonSlots: 1, summonGuardDamageTakenMult: 0.96 } },
        { id: 'summon_railgun_pylon', core: 'summon', name: '轨道炮挂塔', rarity: 'epic', tags: ['召唤', '火力'], desc: '召唤物池加入慢速高伤穿透轨道炮。', effects: { summonRailgun: true, summonDamageMult: 1.12, summonFireRateMult: 1.08 } },
        { id: 'summon_medic_pod', core: 'summon', name: '修复机舱', rarity: 'rare', tags: ['召唤', '护盾'], desc: '召唤物池加入修复机，开火周期改为修复护盾层。', effects: { summonRepair: true, summonRepairRatio: 0.028, barrierMaxRatio: 0.12 } },
        { id: 'summon_sync_barrage', core: 'summon', name: '协同齐射链', rarity: 'common', tags: ['召唤', '弹幕'], desc: '召唤物攻击时有概率带动主机追加两枚侧翼弹。', effects: { summonLinkVolleyChance: 0.18 } },
        { id: 'summon_drop_shield', core: 'summon', name: '投放护盾包', rarity: 'common', tags: ['召唤', '护盾'], desc: '每次部署召唤物时获得少量护盾层。', effects: { summonDeployBarrierRatio: 0.025, barrierMaxRatio: 0.1 } },
        { id: 'summon_hive_overseer', core: 'summon', name: '蜂巢督战核', rarity: 'epic', tags: ['召唤', '火力'], desc: '拦截机、轨道炮和协同齐射同时接入，但召唤物攻速略慢。', effects: { summonInterceptor: true, summonRailgun: true, summonLinkVolleyChance: 0.16, summonDamageMult: 1.08, summonFireRateMult: 1.06 } },

        { id: 'melee_wide_arc', core: 'melee', name: '阔刃弧光', rarity: 'common', tags: ['近战'], desc: '斩击范围提升。', effects: { meleeRadius: 18 } },
        { id: 'melee_blood_edge', core: 'melee', name: '饮血刃口', rarity: 'rare', tags: ['近战', '生存'], desc: '斩击命中时获得更多吸血。', effects: { lifeStealRatio: 0.025 } },
        { id: 'melee_scythe_orbit', core: 'melee', name: '镰刀环斩', rarity: 'rare', tags: ['近战'], desc: '周期性释放附近镰刀斩击。', effects: { scytheInterval: 3600, scytheDamageMult: 0.72, scytheRadius: 86 } },
        { id: 'melee_execution', core: 'melee', name: '处决校准', rarity: 'common', tags: ['近战', '火力'], desc: '近战斩击伤害提升。', effects: { meleeDamageMult: 1.12 } },
        { id: 'melee_dash_blade', core: 'melee', name: '突进刀翼', rarity: 'common', tags: ['近战'], desc: '近战流移动速度提升，斩击稍宽。', effects: { meleeRadius: 10, meleeSpeedBonus: 24 } },
        { id: 'melee_guard', core: 'melee', name: '格挡步法', rarity: 'rare', tags: ['近战', '生存'], desc: '近距离作战时承伤降低。', effects: { damageTakenMult: 0.94 } },
        { id: 'melee_shockwave', core: 'melee', name: '震荡刀波', rarity: 'rare', tags: ['近战', '爆破'], desc: '斩击命中时产生更大的范围冲击。', effects: { meleeSplashRadius: 28 } },
        { id: 'melee_combo_flow', core: 'melee', name: '连斩节奏', rarity: 'common', tags: ['近战'], desc: '斩击冷却小幅缩短。', effects: { meleeCooldownMult: 0.9 } },
        { id: 'melee_reaper_field', core: 'melee', name: '死神镰域', rarity: 'epic', tags: ['近战', '魔法'], desc: '镰刀斩击更频繁，吸血提升。', effects: { scytheInterval: 2800, scytheDamageMult: 0.95, scytheRadius: 112, lifeStealRatio: 0.018 } },
        { id: 'melee_armor_shear', core: 'melee', name: '裂甲刃路', rarity: 'rare', tags: ['近战', '火力'], desc: '近战攻击对首领伤害提升。', effects: { meleeBossDamageMult: 1.12 } },
        { id: 'melee_resonance_guard', core: 'melee', name: '共振护手', rarity: 'rare', tags: ['近战', '护盾'], desc: '近战命中时获得少量护盾层。', effects: { meleeBarrierOnHitRatio: 0.005, barrierMaxRatio: 0.1 } },
        { id: 'melee_close_quarters', core: 'melee', name: '贴身格斗舱', rarity: 'common', tags: ['近战', '生存'], desc: '移动速度提升，并降低承伤。', effects: { meleeSpeedBonus: 12, damageTakenMult: 0.97 } },
        { id: 'melee_spin_reactor', core: 'melee', name: '旋刃反应炉', rarity: 'rare', tags: ['近战'], desc: '周期性释放一轮较轻的旋刃。', effects: { scytheInterval: 4200, scytheDamageMult: 0.68, scytheRadius: 96 } },
        { id: 'melee_redline_edge', core: 'melee', name: '红线刃压', rarity: 'epic', tags: ['近战', '火力'], desc: '近战伤害和吸血提升，但承伤略增。', effects: { meleeDamageMult: 1.08, lifeStealRatio: 0.01, damageTakenMult: 1.03 } },
        { id: 'melee_afterimage_step', core: 'melee', name: '残影步法', rarity: 'common', tags: ['近战'], desc: '斩击更快，范围略微提升。', effects: { meleeCooldownMult: 0.94, meleeRadius: 6 } },
        { id: 'melee_blade_wave', core: 'melee', name: '离刃刀波', rarity: 'common', tags: ['近战', '火力'], desc: '每次斩击向前甩出一枚短程刀波。', effects: { meleeWaveDamageMult: 0.42 } },
        { id: 'melee_hot_edge', core: 'melee', name: '热刃蓄势', rarity: 'rare', tags: ['近战', '火力'], desc: '近战命中积累热刃值，满值自动释放环形刀风。', effects: { meleeHeatOnHit: 14, meleeStormDamageMult: 0.48, meleeStormCount: 6 } },
        { id: 'melee_counter_guard', core: 'melee', name: '受击反斩甲', rarity: 'rare', tags: ['近战', '生存'], desc: '受到伤害时自动释放一次低伤反斩。', effects: { meleeCounterSlashDamageMult: 0.52, damageTakenMult: 0.97 } },
        { id: 'melee_wave_splitter', core: 'melee', name: '裂波刀脊', rarity: 'rare', tags: ['近战', '弹幕'], desc: '刀波可穿透更多目标，并提高刀波伤害。', effects: { meleeWaveDamageMult: 0.2, meleeWavePierce: 1 } },
        { id: 'melee_kill_momentum', core: 'melee', name: '斩杀惯性轮', rarity: 'common', tags: ['近战'], desc: '击破敌人时回收当前斩击冷却。', effects: { meleeKillCooldownRefundMs: 72 } },
        { id: 'melee_tempest_core', core: 'melee', name: '暴风刃核', rarity: 'epic', tags: ['近战', '火力'], desc: '热刃风暴更强，刀波穿透提升，但近战攻击节奏略慢。', effects: { meleeHeatOnHit: 10, meleeStormDamageMult: 0.56, meleeStormCount: 8, meleeWavePierce: 1, meleeCooldownMult: 1.03 } },

        { id: 'magic_fireball', core: 'magic', name: '火焰弹芯', rarity: 'common', tags: ['魔法', '爆破'], desc: '魔法弹溅射范围提升。', effects: { magicSplashRadius: 18 } },
        { id: 'magic_arcane_focus', core: 'magic', name: '奥术聚焦', rarity: 'common', tags: ['魔法', '火力'], desc: '魔法弹伤害提升。', effects: { magicDamageMult: 1.1 } },
        { id: 'magic_seeker', core: 'magic', name: '追踪符文', rarity: 'rare', tags: ['魔法'], desc: '魔法弹追踪能力提升。', effects: { magicHoming: 0.18 } },
        { id: 'magic_frost_orb', core: 'magic', name: '霜冻宝珠', rarity: 'rare', tags: ['魔法', '生存'], desc: '魔法弹命中时小幅减速敌弹和敌机。', effects: { magicSlowChance: 0.18 } },
        { id: 'magic_split_rune', core: 'magic', name: '分裂符印', rarity: 'rare', tags: ['魔法'], desc: '魔法流额外发射一枚侧向魔法弹，单枚伤害会分流。', effects: { magicExtraProjectiles: 1 } },
        { id: 'magic_meteor', core: 'magic', name: '陨星术式', rarity: 'epic', tags: ['魔法', '爆破'], desc: '周期性召唤陨星火焰弹。', effects: { meteorInterval: 5200, meteorDamageMult: 1.2, magicSplashRadius: 10 } },
        { id: 'magic_mana_spring', core: 'magic', name: '魔力泉涌', rarity: 'common', tags: ['魔法'], desc: '魔法弹冷却缩短。', effects: { magicCooldownMult: 0.9 } },
        { id: 'magic_wildfire', core: 'magic', name: '野火扩散', rarity: 'common', tags: ['魔法', '爆破'], desc: '火焰弹爆炸伤害提升。', effects: { magicSplashDamageMult: 1.16 } },
        { id: 'magic_starfall', core: 'magic', name: '星落阵列', rarity: 'epic', tags: ['魔法', '火力'], desc: '魔法弹数量和陨星频率提升，单枚魔法弹伤害会分流。', effects: { magicExtraProjectiles: 1, meteorInterval: 4200, meteorDamageMult: 1.05 } },
        { id: 'magic_chain_lightning', core: 'magic', name: '连锁雷纹', rarity: 'rare', tags: ['魔法', '火力'], desc: '魔法弹命中时有概率弹跳伤害附近目标。', effects: { magicChainChance: 0.18, magicChainDamageMult: 0.42 } },
        { id: 'magic_mana_shield', core: 'magic', name: '法力护盾', rarity: 'common', tags: ['魔法', '护盾'], desc: '施放魔法弹时获得极少量护盾层。', effects: { magicBarrierOnCastRatio: 0.008, barrierMaxRatio: 0.1 } },
        { id: 'magic_rune_battery', core: 'magic', name: '符文电池', rarity: 'common', tags: ['魔法'], desc: '魔法攻击冷却缩短。', effects: { magicCooldownMult: 0.94 } },
        { id: 'magic_entropy_mark', core: 'magic', name: '熵变刻印', rarity: 'rare', tags: ['魔法', '火力'], desc: '魔法弹有概率暴击。', effects: { magicCritChance: 0.12, magicCritMult: 1.5 } },
        { id: 'magic_frost_well', core: 'magic', name: '霜井回路', rarity: 'common', tags: ['魔法', '生存'], desc: '霜冻触发概率提升，并小幅降低承伤。', effects: { magicSlowChance: 0.08, damageTakenMult: 0.98 } },
        { id: 'magic_apprentice_meteor', core: 'magic', name: '学徒陨星', rarity: 'epic', tags: ['魔法', '爆破'], desc: '周期性落下较轻的陨星。', effects: { meteorInterval: 6200, meteorDamageMult: 0.92, magicSplashRadius: 8 } },
    ];

    const createEmptyPlaneBuildStats = () => ({
        damageMult: 1,
        bossDamageMult: 1,
        bombDamageMult: 1,
        burstDamageMult: 1,
        scoreMult: 1,
        shotCooldownMult: 1,
        cooldownMult: 1,
        bulletSpeedMult: 1,
        sideShotCount: 0,
        sideShotDamageMult: 1,
        rearVolleyInterval: 0,
        rearVolleyCount: 0,
        rearVolleyDamageMult: 1,
        killVolleyChance: 0,
        killVolleyCount: 0,
        killVolleyDamageMult: 1,
        grazeShotRefundMs: 0,
        damageTakenMult: 1,
        healMult: 1,
        powerUpDropBonus: 0,
        maxHpBonusRatio: 0,
        extraShots: 0,
        pierce: 0,
        pierceDamageMult: 1,
        missileChance: 0,
        missileDamageMult: 1,
        missileTurnMult: 1,
        missileSplashDamageMult: 1,
        extraMissiles: 0,
        explosionRadius: 0,
        shieldBreakDamageMult: 0,
        shieldBreakRadius: 0,
        barrierDamageMult: 1,
        shieldBlockHealRatio: 0,
        barrierOnKillRatio: 0,
        autoMissileInterval: 0,
        autoMissileDamageMult: 1,
        autoLaserInterval: 0,
        autoLaserDamageMult: 1,
        autoVolleyInterval: 0,
        autoVolleyCount: 0,
        autoVolleyDamageMult: 1,
        summonInterval: 0,
        summonDurationBonus: 0,
        summonSlots: 0,
        summonDamageMult: 1,
        summonFireRateMult: 1,
        summonGuardDamageTakenMult: 1,
        summonExpireExplosionDamageMult: 0,
        summonBarrierPulseInterval: 0,
        summonBarrierPulseRatio: 0,
        summonTurret: false,
        summonMissile: false,
        summonLaser: false,
        summonInterceptor: false,
        summonRailgun: false,
        summonRepair: false,
        summonLinkVolleyChance: 0,
        summonDeployBarrierRatio: 0,
        summonRepairRatio: 0,
        meleeMode: false,
        meleeRadius: 0,
        meleeDamageMult: 1,
        meleeBossDamageMult: 1,
        meleeSplashRadius: 0,
        meleeCooldownMult: 1,
        meleeSpeedBonus: 0,
        lifeStealRatio: 0,
        meleeBarrierOnHitRatio: 0,
        meleeWaveDamageMult: 0,
        meleeWavePierce: 0,
        meleeHeatOnHit: 0,
        meleeHeatMax: 100,
        meleeStormDamageMult: 0,
        meleeStormCount: 0,
        meleeCounterSlashDamageMult: 0,
        meleeKillCooldownRefundMs: 0,
        scytheInterval: 0,
        scytheDamageMult: 1,
        scytheRadius: 0,
        magicMode: false,
        magicDamageMult: 1,
        magicSplashRadius: 0,
        magicSplashDamageMult: 1,
        magicHoming: 0,
        magicExtraProjectiles: 0,
        magicCooldownMult: 1,
        magicSlowChance: 0,
        magicCritChance: 0,
        magicCritMult: 1,
        magicBarrierOnCastRatio: 0,
        magicChainChance: 0,
        magicChainDamageMult: 1,
        meteorInterval: 0,
        meteorDamageMult: 1,
        barrierRegenInterval: 0,
        barrierRegenRatio: 0,
        barrierMaxRatio: 0,
        grazeBarrierRatio: 0,
        startShield: false,
        shieldAfterBoss: false,
        grantBombs: 0,
        grantBursts: 0,
        grantBarrierRatio: 0,
        grantHealRatio: 0,
    });

    const getPlaneBuildCore = () => PLANE_BUILD_CORES.find((core) => core.id === GAME.buildCore) || null;
    const getPlaneBuildModule = (id) => PLANE_BUILD_MODULES.find((module) => module.id === id) || null;

    const mergePlaneBuildEffects = (stats, effects = {}) => {
        Object.entries(effects).forEach(([key, value]) => {
            if (typeof value === 'boolean') {
                stats[key] = stats[key] || value;
            } else if (key.endsWith('Interval')) {
                stats[key] = stats[key] ? Math.min(stats[key], value) : value;
            } else if (key === 'autoMissileDamageMult' || key === 'autoLaserDamageMult' || key === 'autoVolleyDamageMult') {
                stats[key] = stats[key] === 1 ? value : Math.max(stats[key], value);
            } else if (key.endsWith('Mult')) {
                stats[key] *= value;
            } else {
                stats[key] += value;
            }
        });
    };

    const clampPlaneBuildStats = (stats) => {
        stats.damageMult = Math.min(1.42, stats.damageMult);
        stats.bossDamageMult = Math.min(1.32, stats.bossDamageMult);
        stats.bombDamageMult = Math.min(1.45, stats.bombDamageMult);
        stats.burstDamageMult = Math.min(1.3, stats.burstDamageMult);
        stats.scoreMult = Math.min(1.22, stats.scoreMult);
        stats.shotCooldownMult = Math.max(0.82, Math.min(1.18, stats.shotCooldownMult));
        stats.cooldownMult = Math.max(0.82, Math.min(1.08, stats.cooldownMult));
        stats.bulletSpeedMult = Math.min(1.22, stats.bulletSpeedMult);
        stats.sideShotCount = Math.min(4, Math.max(0, Math.floor(stats.sideShotCount)));
        stats.sideShotDamageMult = Math.min(0.42, Math.max(0.15, stats.sideShotDamageMult));
        stats.rearVolleyInterval = stats.rearVolleyInterval ? Math.max(5200, stats.rearVolleyInterval) : 0;
        stats.rearVolleyCount = Math.min(6, Math.max(0, Math.floor(stats.rearVolleyCount)));
        stats.rearVolleyDamageMult = Math.min(0.42, Math.max(0.18, stats.rearVolleyDamageMult));
        stats.killVolleyChance = Math.min(0.32, Math.max(0, stats.killVolleyChance));
        stats.killVolleyCount = Math.min(5, Math.max(0, Math.floor(stats.killVolleyCount)));
        stats.killVolleyDamageMult = Math.min(0.36, Math.max(0.16, stats.killVolleyDamageMult));
        stats.grazeShotRefundMs = Math.min(140, Math.max(0, stats.grazeShotRefundMs));
        stats.damageTakenMult = Math.max(0.72, Math.min(1.18, stats.damageTakenMult));
        stats.healMult = Math.min(1.5, stats.healMult);
        stats.powerUpDropBonus = Math.min(0.08, Math.max(0, stats.powerUpDropBonus));
        stats.maxHpBonusRatio = Math.min(0.36, stats.maxHpBonusRatio);
        stats.extraShots = Math.min(3, Math.max(0, Math.floor(stats.extraShots)));
        stats.pierce = Math.min(3, Math.max(0, Math.floor(stats.pierce)));
        stats.pierceDamageMult = Math.max(0.82, Math.min(1.18, stats.pierceDamageMult));
        stats.missileChance = Math.min(0.3, Math.max(0, stats.missileChance));
        stats.missileDamageMult = Math.min(1.48, stats.missileDamageMult);
        stats.missileTurnMult = Math.min(1.6, Math.max(0.85, stats.missileTurnMult));
        stats.missileSplashDamageMult = Math.min(1.35, Math.max(0.9, stats.missileSplashDamageMult));
        stats.extraMissiles = Math.min(1, Math.max(0, Math.floor(stats.extraMissiles)));
        stats.explosionRadius = Math.min(52, Math.max(0, stats.explosionRadius));
        stats.shieldBreakDamageMult = Math.min(2.6, stats.shieldBreakDamageMult);
        stats.shieldBreakRadius = Math.min(104, stats.shieldBreakRadius);
        stats.barrierDamageMult = Math.min(1.14, Math.max(1, stats.barrierDamageMult));
        stats.shieldBlockHealRatio = Math.min(0.16, Math.max(0, stats.shieldBlockHealRatio));
        stats.barrierOnKillRatio = Math.min(0.025, Math.max(0, stats.barrierOnKillRatio));
        stats.autoMissileInterval = stats.autoMissileInterval ? Math.max(4600, stats.autoMissileInterval) : 0;
        stats.autoMissileDamageMult = Math.min(1.0, stats.autoMissileDamageMult);
        stats.autoLaserInterval = stats.autoLaserInterval ? Math.max(5600, stats.autoLaserInterval) : 0;
        stats.autoLaserDamageMult = Math.min(0.92, stats.autoLaserDamageMult);
        stats.autoVolleyInterval = stats.autoVolleyInterval ? Math.max(6000, stats.autoVolleyInterval) : 0;
        stats.autoVolleyCount = Math.min(5, Math.max(0, Math.floor(stats.autoVolleyCount)));
        stats.autoVolleyDamageMult = Math.min(0.38, stats.autoVolleyDamageMult);
        stats.summonInterval = stats.summonInterval ? Math.max(4200, stats.summonInterval) : 0;
        stats.summonDurationBonus = Math.min(14000, Math.max(0, stats.summonDurationBonus));
        stats.summonSlots = Math.min(4, Math.max(0, Math.floor(stats.summonSlots)));
        if ((stats.summonTurret || stats.summonMissile || stats.summonLaser || stats.summonInterceptor || stats.summonRailgun || stats.summonRepair) && stats.summonSlots <= 0) stats.summonSlots = 1;
        if (stats.summonSlots > 0 && !stats.summonInterval) stats.summonInterval = 7200;
        if (stats.summonSlots > 0 && stats.summonDurationBonus <= 0) stats.summonDurationBonus = 6200;
        stats.summonDamageMult = Math.min(1.45, Math.max(0.35, stats.summonDamageMult));
        stats.summonFireRateMult = Math.max(0.72, Math.min(1.2, stats.summonFireRateMult));
        stats.summonGuardDamageTakenMult = Math.max(0.88, Math.min(1, stats.summonGuardDamageTakenMult));
        stats.summonExpireExplosionDamageMult = Math.min(1.05, Math.max(0, stats.summonExpireExplosionDamageMult));
        stats.summonBarrierPulseInterval = stats.summonBarrierPulseInterval ? Math.max(4800, stats.summonBarrierPulseInterval) : 0;
        stats.summonBarrierPulseRatio = Math.min(0.04, Math.max(0, stats.summonBarrierPulseRatio));
        stats.summonLinkVolleyChance = Math.min(0.32, Math.max(0, stats.summonLinkVolleyChance));
        stats.summonDeployBarrierRatio = Math.min(0.05, Math.max(0, stats.summonDeployBarrierRatio));
        stats.summonRepairRatio = Math.min(0.045, Math.max(0, stats.summonRepairRatio));
        stats.meleeRadius = Math.min(132, Math.max(0, stats.meleeRadius));
        stats.meleeDamageMult = Math.min(1.75, Math.max(0.6, stats.meleeDamageMult));
        stats.meleeBossDamageMult = Math.min(1.2, Math.max(1, stats.meleeBossDamageMult));
        stats.meleeSplashRadius = Math.min(58, Math.max(0, stats.meleeSplashRadius));
        stats.meleeCooldownMult = Math.max(0.74, Math.min(1.1, stats.meleeCooldownMult));
        stats.meleeSpeedBonus = Math.min(52, Math.max(0, stats.meleeSpeedBonus));
        stats.lifeStealRatio = Math.min(0.09, Math.max(0, stats.lifeStealRatio));
        stats.meleeBarrierOnHitRatio = Math.min(0.008, Math.max(0, stats.meleeBarrierOnHitRatio));
        stats.meleeWaveDamageMult = Math.min(0.82, Math.max(0, stats.meleeWaveDamageMult));
        stats.meleeWavePierce = Math.min(2, Math.max(0, Math.floor(stats.meleeWavePierce)));
        stats.meleeHeatOnHit = Math.min(24, Math.max(0, stats.meleeHeatOnHit));
        stats.meleeHeatMax = Math.max(60, Math.min(120, stats.meleeHeatMax));
        stats.meleeStormDamageMult = Math.min(0.72, Math.max(0, stats.meleeStormDamageMult));
        stats.meleeStormCount = Math.min(8, Math.max(0, Math.floor(stats.meleeStormCount)));
        stats.meleeCounterSlashDamageMult = Math.min(0.9, Math.max(0, stats.meleeCounterSlashDamageMult));
        stats.meleeKillCooldownRefundMs = Math.min(120, Math.max(0, stats.meleeKillCooldownRefundMs));
        stats.scytheInterval = stats.scytheInterval ? Math.max(2400, stats.scytheInterval) : 0;
        stats.scytheDamageMult = Math.min(1.15, Math.max(0.4, stats.scytheDamageMult));
        stats.scytheRadius = Math.min(132, Math.max(0, stats.scytheRadius));
        stats.magicDamageMult = Math.min(1.48, Math.max(0.75, stats.magicDamageMult));
        stats.magicSplashRadius = Math.min(68, Math.max(0, stats.magicSplashRadius));
        stats.magicSplashDamageMult = Math.min(1.35, Math.max(0.8, stats.magicSplashDamageMult));
        stats.magicHoming = Math.min(0.52, Math.max(0, stats.magicHoming));
        stats.magicExtraProjectiles = Math.min(2, Math.max(0, Math.floor(stats.magicExtraProjectiles)));
        stats.magicCooldownMult = Math.max(0.76, Math.min(1.1, stats.magicCooldownMult));
        stats.magicSlowChance = Math.min(0.28, Math.max(0, stats.magicSlowChance));
        stats.magicCritChance = Math.min(0.22, Math.max(0, stats.magicCritChance));
        stats.magicCritMult = Math.min(1.65, Math.max(1, stats.magicCritMult));
        stats.magicBarrierOnCastRatio = Math.min(0.014, Math.max(0, stats.magicBarrierOnCastRatio));
        stats.magicChainChance = Math.min(0.28, Math.max(0, stats.magicChainChance));
        stats.magicChainDamageMult = Math.min(0.58, Math.max(0.22, stats.magicChainDamageMult));
        stats.meteorInterval = stats.meteorInterval ? Math.max(3800, stats.meteorInterval) : 0;
        stats.meteorDamageMult = Math.min(1.35, Math.max(0.8, stats.meteorDamageMult));
        stats.barrierRegenInterval = stats.barrierRegenInterval ? Math.max(7000, stats.barrierRegenInterval) : 0;
        stats.barrierRegenRatio = Math.min(0.08, stats.barrierRegenRatio);
        stats.barrierMaxRatio = Math.min(0.28, stats.barrierMaxRatio);
        stats.grazeBarrierRatio = Math.min(0.025, stats.grazeBarrierRatio);
        return stats;
    };

    const getPlaneBuildStats = () => {
        const stats = createEmptyPlaneBuildStats();
        const core = getPlaneBuildCore();
        if (core) mergePlaneBuildEffects(stats, core.effects);
        GAME.buildModules.map(getPlaneBuildModule).filter(Boolean).forEach((module) => {
            mergePlaneBuildEffects(stats, module.effects);
        });

        const tags = GAME.buildTagCounts || {};
        if ((tags['通用'] || 0) >= 3) {
            stats.damageMult *= 1.03;
            stats.damageTakenMult *= 0.98;
        }
        if ((tags['火力'] || 0) >= 3) stats.damageMult *= 1.06;
        if ((tags['弹幕'] || 0) >= 3) {
            stats.extraShots += 1;
            stats.shotCooldownMult *= 0.98;
        }
        if ((tags['爆破'] || 0) >= 3) {
            stats.explosionRadius += 8;
            stats.bombDamageMult *= 1.1;
        }
        if ((tags['激光'] || 0) >= 3) stats.pierce += 1;
        if ((tags['护盾'] || 0) >= 3) stats.damageTakenMult *= 0.92;
        if ((tags['生存'] || 0) >= 3) {
            stats.maxHpBonusRatio += 0.1;
            stats.healMult *= 1.15;
        }
        if ((tags['召唤'] || 0) >= 3) {
            stats.summonSlots += 1;
            stats.summonFireRateMult *= 0.94;
        }
        if ((tags['近战'] || 0) >= 3) {
            stats.meleeRadius += 14;
            stats.lifeStealRatio += 0.012;
        }
        if ((tags['魔法'] || 0) >= 3) {
            stats.magicSplashRadius += 10;
            stats.magicCooldownMult *= 0.94;
        }
        return clampPlaneBuildStats(stats);
    };

    const resizeCanvas = ({ playLayout = GAME.running } = {}) => {
        const maxWidth = 780;
        const viewport = window.visualViewport;
        const viewportWidth = Math.max(1, Math.floor(viewport?.width || window.innerWidth));
        const viewportHeight = Math.max(1, Math.floor(viewport?.height || window.innerHeight));
        const availableWidth = Math.floor((planeCanvas.parentElement?.clientWidth || maxWidth) * 0.98);
        const useMobilePlayfield = playLayout && isPlaneTouchMode() && window.matchMedia?.('(hover: none) and (pointer: coarse)').matches;
        let width;
        let height;
        if (useMobilePlayfield) {
            width = viewportWidth;
            height = viewportHeight;
        } else {
            const heightRatio = window.innerWidth <= 700 ? 0.68 : 0.82;
            const maxByHeight = Math.floor(window.innerHeight * heightRatio * 3 / 4);
            const minWidth = Math.min(380, Math.max(300, availableWidth));
            width = Math.max(minWidth, Math.min(availableWidth, maxWidth, maxByHeight));
            height = Math.round(width * 4 / 3);
        }
        const ratio = isPlaneLowPowerMode() ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);

        planeCanvas.width = width * ratio;
        planeCanvas.height = height * ratio;
        planeCanvas.style.width = `${width}px`;
        planeCanvas.style.height = `${height}px`;

        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

        GAME.width = width;
        GAME.height = height;

        if (player) {
            player.x = Math.min(player.x, GAME.width - player.w / 2);
            player.y = Math.min(player.y, GAME.height - 30);
        }
    };

    const setPlaneShopMessage = (text = '') => {
        GAME.menuMessage = text;
    };

    const setPlaneMenuView = (view = 'main') => {
        const screen = view === 'main' ? 'menu' : view;
        GAME.menuScreen = screen;
        if (view !== 'shop') setPlaneShopMessage('');
        renderPlaneGame();
    };

    const exitPlaneGameOverTo = (screen = 'menu') => {
        GAME.running = false;
        GAME.paused = false;
        GAME.gameOver = false;
        GAME.menuScreen = screen;
        planeRestartBtn.classList.add('hidden');
        planePauseBtn.classList.add('hidden');
        planeStartBtn.classList.add('hidden');
        updatePlaneModeUI();
        setPlaneMenuView(screen);
    };

    const updatePlaneProgressUI = () => {
        const coins = String(planeWallet.coins);
        const diamonds = String(planeWallet.diamonds);
        if (planeCoinsEl) planeCoinsEl.textContent = coins;
        if (planeDiamondsEl) planeDiamondsEl.textContent = diamonds;
    };

    const buyPlaneAttackUpgrade = () => {
        if (GAME.running && !GAME.gameOver) {
            setPlaneShopMessage('战斗中不能强化，结束本局后再来商店。');
            updatePlaneProgressUI();
            renderPlaneGame();
            return;
        }
        if (planeUpgrades.attackLevel >= PLANE_ATTACK_UPGRADE_MAX) return;
        const cost = getAttackUpgradeCost();
        if (planeWallet.coins < cost) {
            setPlaneShopMessage(`金币不足，还差 ${cost - planeWallet.coins} 金币。`);
            updatePlaneProgressUI();
            renderPlaneGame();
            return;
        }
        setStoredPlaneWallet({ ...planeWallet, coins: planeWallet.coins - cost });
        setStoredPlaneUpgrades({ ...planeUpgrades, attackLevel: planeUpgrades.attackLevel + 1 });
        setPlaneShopMessage(`攻击升级成功：总伤害池 ${getPlayerDamage()}，满火力总伤害 ${getShotTotalDamage(FIRE_LEVEL_MAX)}。`);
        updatePlaneProgressUI();
        requestPlaneHudUpdate();
        renderPlaneGame();
    };

    const buyPlaneLifeUpgrade = () => {
        if (GAME.running && !GAME.gameOver) {
            setPlaneShopMessage('战斗中不能强化，结束本局后再来商店。');
            updatePlaneProgressUI();
            renderPlaneGame();
            return;
        }
        if (planeUpgrades.lifeLevel >= PLANE_LIFE_UPGRADE_MAX) return;
        const cost = getLifeUpgradeCost();
        if (planeWallet.diamonds < cost) {
            setPlaneShopMessage(`钻石不足，还差 ${cost - planeWallet.diamonds} 钻石。`);
            updatePlaneProgressUI();
            renderPlaneGame();
            return;
        }
        setStoredPlaneWallet({ ...planeWallet, diamonds: planeWallet.diamonds - cost });
        setStoredPlaneUpgrades({ ...planeUpgrades, lifeLevel: planeUpgrades.lifeLevel + 1 });
        setPlaneShopMessage(`生命上限升级成功！每条命上限 ${getPlayerMaxHp()}。`);
        updatePlaneProgressUI();
        requestPlaneHudUpdate();
        renderPlaneGame();
    };

    const buyPlanePermanentUpgrade = (id) => {
        if (GAME.running && !GAME.gameOver) {
            setPlaneShopMessage('战斗中不能强化，结束本局后再来商店。');
            updatePlaneProgressUI();
            renderPlaneGame();
            return;
        }
        const upgrade = getPlaneShopUpgrades().find((item) => item.id === id);
        if (!upgrade || upgrade.level >= upgrade.max) return;
        const walletValue = planeWallet[upgrade.currency] || 0;
        if (walletValue < upgrade.cost) {
            setPlaneShopMessage(`${upgrade.currency === 'diamonds' ? '钻石' : '金币'}不足，还差 ${upgrade.cost - walletValue}。`);
            updatePlaneProgressUI();
            renderPlaneGame();
            return;
        }
        setStoredPlaneWallet({ ...planeWallet, [upgrade.currency]: walletValue - upgrade.cost });
        setStoredPlaneUpgrades({ ...planeUpgrades, [id]: upgrade.level + 1 });
        setPlaneShopMessage(`${upgrade.name} 升级成功，Lv.${upgrade.level + 1}/${upgrade.max}`);
        updatePlaneProgressUI();
        requestPlaneHudUpdate();
        renderPlaneGame();
    };

    const updatePlaneHud = () => {
        planeScoreEl.textContent = String(GAME.score);
        planeLevelEl.textContent = String(GAME.level);
        lifeDisplay.textContent = `生命 ${GAME.lives}/${PLAYER_STARTING_LIVES}  装甲 ${Math.ceil(GAME.hp)}/${GAME.maxHp}${GAME.barrierHp > 0 ? `  护盾层 ${Math.ceil(GAME.barrierHp)}` : ''}`;
        let statusText = '';
        if (isPlaneTouchMode()) statusText += '自动开火 ';
        else statusText += '手动射击 ';
        statusText += `伤害池${getPlayerDamage()} `;
        if (GAME.fireLevel > 1) statusText += `火力×${getFireLevel()} `;
        if (GAME.shieldActive) statusText += '护盾 ';
        if (GAME.bombs > 0) statusText += `炸弹×${GAME.bombs} `;
        if (GAME.invincibleTimer > 0) statusText += '复位保护 ';
        if (GAME.doubleScoreTimer > 0) statusText += '分数×2 ';
        if (GAME.slowdownFactor < 1) statusText += '减速 ';
        if (GAME.magnetTimer > 0) statusText += '磁吸 ';
        if (GAME.droneCount > 0) statusText += `僚机×${GAME.droneCount} `;
        if (summons.length > 0) statusText += `召唤×${summons.length} `;
        if (GAME.burstCharges > 0) statusText += `爆发×${GAME.burstCharges} `;
        const buildCore = getPlaneBuildCore();
        if (buildCore) statusText += `${buildCore.name} `;
        if (GAME.buildModules.length > 0) statusText += `模组${GAME.buildModules.length} `;
        if (GAME.combo >= 3) statusText += `连击×${GAME.combo}`;
        powerUpIndicator.textContent = statusText.trim() || '';
        updatePlaneActionButtons();
        updatePlaneProgressUI();
    };

    let planeHudUpdateQueued = false;
    const requestPlaneHudUpdate = () => {
        if (planeHudUpdateQueued) return;
        planeHudUpdateQueued = true;
        requestAnimationFrame(() => {
            planeHudUpdateQueued = false;
            updatePlaneHud();
        });
    };

    const updatePlaneActionButtons = () => {
        const showActions = isPlaneTouchMode() && (GAME.running || GAME.paused || GAME.gameOver);
        planeActionControls?.classList.toggle('hidden', !showActions);
        if (planeBombCount) planeBombCount.textContent = String(GAME.bombs);
        if (planeBurstCount) planeBurstCount.textContent = String(GAME.burstCharges);
        if (planeBombBtn) {
            planeBombBtn.disabled = !GAME.running || GAME.paused || GAME.bombs <= 0;
            planeBombBtn.classList.toggle('is-ready', GAME.running && !GAME.paused && GAME.bombs > 0);
        }
        if (planeBurstBtn) {
            planeBurstBtn.disabled = !GAME.running || GAME.paused || GAME.burstCharges <= 0;
            planeBurstBtn.classList.toggle('is-ready', GAME.running && !GAME.paused && GAME.burstCharges > 0);
        }
    };

    const resetPlaneGame = () => {
        clearPlaneInputs();
        GAME.running = false;
        GAME.paused = false;
        GAME.score = 0;
        GAME.level = 1;
        GAME.lastTime = 0;
        GAME.spawnTimer = 0;
        GAME.shotTimer = 0;
        GAME.gameOver = false;
        GAME.boss = null;
        GAME.bossKillCount = 0;
        GAME.waveState = 'small';
        GAME.waveTimer = 0;
        GAME.waveKills = 0;
        GAME.waveTarget = 21;
        GAME.waveIndex = 1;
        GAME.bossWarningSpawned = false;
        GAME.burstSequence = 0;
        GAME.fireLevel = 1;
        GAME.powerUpTimer = 0;
        GAME.shieldActive = false;
        GAME.bombs = 0;
        GAME.lives = PLAYER_STARTING_LIVES;
        GAME.maxHp = getPlayerMaxHp();
        GAME.hp = GAME.maxHp;
        GAME.invincibleTimer = 0;
        GAME.doubleScoreTimer = 0;
        GAME.slowdownFactor = 1;
        GAME.slowdownTimer = 0;
        GAME.magnetTimer = 0;
        GAME.droneTimer = 0;
        GAME.droneCount = 0;
        GAME.burstCharges = 0;
        GAME.hitFlashTimer = 0;
        GAME.message = '';
        GAME.messageTimer = 0;
        GAME.combo = 0;
        GAME.comboTimer = 0;
        GAME.bestCombo = 0;
        GAME.shakeTimer = 0;
        GAME.shakeIntensity = 0;
        GAME.controlMode = selectedPlaneMode;
        GAME.bossContactTimer = 0;
        GAME.respawnTimer = 0;
        GAME.frameId = 0;
        GAME.lastDamageFrame = -1;
        GAME.backgroundScroll = 0;
        GAME.runCoinsEarned = 0;
        GAME.runDiamondsEarned = 0;
        GAME.rewardGranted = false;
        GAME.runVictory = false;
        GAME.menuScreen = 'menu';
        GAME.menuMessage = '';
        GAME.difficultyStage = getPlaneStage();
        GAME.buildCore = '';
        GAME.buildModules = [];
        GAME.buildTagCounts = {};
        GAME.buildDraft = null;
        GAME.barrierHp = 0;
        GAME.barrierMax = 0;
        GAME.autoMissileTimer = 0;
        GAME.autoLaserTimer = 0;
        GAME.autoVolleyTimer = 0;
        GAME.rearVolleyTimer = 0;
        GAME.summonTimer = 0;
        GAME.summonBarrierPulseTimer = 0;
        GAME.scytheTimer = 0;
        GAME.meleeHeat = 0;
        GAME.meteorTimer = 0;
        GAME.barrierRegenTimer = 0;
        pointerControl.active = false;

        player = {
            x: (GAME.width || 480) / 2,
            y: (GAME.height || 640) - 70,
            w: 28,
            h: 32,
            hitW: 24,
            hitH: 28,
            speed: getPlayerSpeed(),
            shootCooldown: getPlayerShootCooldown(),
            vx: 0,
            vy: 0,
        };

        bullets = [];
        enemyBullets = [];
        enemies = [];
        particles = [];
        powerUps = [];
        summons = [];

        requestPlaneHudUpdate();
        planeStartBtn.classList.add('hidden');
        planeRestartBtn.classList.add('hidden');
        planePauseBtn.classList.add('hidden');
        planePauseBtn.textContent = '暂停';
        planeActionControls?.classList.add('hidden');
        updatePlaneModeUI();
    };

    const getPlaneSpriteFrame = (id, progress = 0, frameCount = 4) => {
        const img = planeSpriteImages[id];
        if (!img?.complete || !img.naturalWidth) return null;
        const frames = Math.max(1, frameCount);
        const frame = Math.max(0, Math.min(frames - 1, Math.floor(progress * frames)));
        return {
            img,
            sx: frame * img.naturalWidth / frames,
            sy: 0,
            sw: img.naturalWidth / frames,
            sh: img.naturalHeight,
        };
    };

    const drawPlaneSpriteFrame = (id, x, y, w, h, options = {}) => {
        const frame = getPlaneSpriteFrame(id, options.progress ?? 0, options.frames || 4);
        if (!frame) return false;
        ctx.save();
        ctx.translate(x, y);
        if (options.rotate) ctx.rotate(options.rotate);
        if (options.alpha != null) ctx.globalAlpha *= options.alpha;
        if (options.glow) {
            ctx.shadowColor = options.glow;
            ctx.shadowBlur = options.shadowBlur || 14;
        }
        ctx.drawImage(frame.img, frame.sx, frame.sy, frame.sw, frame.sh, -w / 2, -h / 2, w, h);
        ctx.restore();
        return true;
    };

    const drawPlaneSpriteGridFrame = (id, x, y, w, h, options = {}) => {
        const img = planeSpriteImages[id];
        if (!img?.complete || !img.naturalWidth) return false;
        const cols = Math.max(1, options.cols || 4);
        const rows = Math.max(1, options.rows || 2);
        const total = cols * rows;
        const frameIndex = Math.max(0, Math.min(total - 1, Math.floor((options.progress ?? 0) * total)));
        const col = frameIndex % cols;
        const row = Math.floor(frameIndex / cols);
        const sw = img.naturalWidth / cols;
        const sh = img.naturalHeight / rows;
        ctx.save();
        ctx.translate(x, y);
        if (options.alpha != null) ctx.globalAlpha *= options.alpha;
        if (options.glow) {
            ctx.shadowColor = options.glow;
            ctx.shadowBlur = options.shadowBlur || 14;
        }
        ctx.drawImage(img, col * sw, row * sh, sw, sh, -w / 2, -h / 2, w, h);
        ctx.restore();
        return true;
    };

    const getPlanePlayerSpriteId = () => {
        if (GAME.buildCore === 'barrage') return 'playerBarrage';
        if (GAME.buildCore === 'laser') return 'playerLaser';
        if (GAME.buildCore === 'magic') return 'playerMagic';
        if (GAME.buildCore === 'summon') return 'playerSummon';
        if (GAME.buildCore === 'melee') return 'playerMelee';
        if (GAME.buildCore === 'missile' || GAME.buildCore === 'shield') return 'playerHeavy';
        return 'playerStandard';
    };

    const updatePlayerHitboxByBuild = () => {
        if (!player) return;
        if (GAME.buildCore === 'laser') {
            player.hitW = 24;
            player.hitH = 32;
        } else if (GAME.buildCore === 'barrage') {
            player.hitW = 32;
            player.hitH = 32;
        } else if (GAME.buildCore === 'summon') {
            player.hitW = 34;
            player.hitH = 32;
        } else if (GAME.buildCore === 'melee') {
            player.hitW = 32;
            player.hitH = 32;
        } else if (GAME.buildCore === 'magic') {
            player.hitW = 30;
            player.hitH = 30;
        } else if (GAME.buildCore === 'missile' || GAME.buildCore === 'shield') {
            player.hitW = 32;
            player.hitH = 32;
        } else {
            player.hitW = 26;
            player.hitH = 30;
        }
    };

    const isPlanePlayerBoostingForward = () => (
        player &&
        (player.vy < -90 || keys.ArrowUp || (pointerControl.active && pointerControl.y < player.y - 18))
    );

    const getPlaneExplosionSpriteId = (color = '') => {
        const value = String(color).toLowerCase();
        if (value.includes('ff9d') || value.includes('ff7a') || value.includes('orange')) return 'effectMeteorExplosion';
        if (value.includes('ff6b') || value.includes('ff2d') || value.includes('ff3366')) return 'effectVoidExplosion';
        if (value.includes('62d2') || value.includes('4fd4') || value.includes('00ff') || value.includes('cyan')) return 'effectLightningBurst';
        if (value.includes('bb55') || value.includes('a65c') || value.includes('9d7c')) return 'effectArcaneBurst';
        return 'effectGoldSpark';
    };

    const addExplosionParticles = (x, y, color, count = 10) => {
        const particleLimit = getPlaneParticleLimit();
        if (particles.length > particleLimit - 8) return;
        const requestedCount = isPlaneLowPowerMode() ? Math.ceil(count * 0.45) : count;
        const safeCount = Math.max(2, Math.min(requestedCount, particleLimit - particles.length - 1));
        particles.push({
            x, y,
            vx: 0,
            vy: 0,
            life: 0.36,
            maxLife: 0.36,
            color,
            size: Math.max(30, Math.min(96, 24 + count * 1.6)),
            spriteId: getPlaneExplosionSpriteId(color),
            spriteFrames: 4,
        });
        particles.push({
            x, y,
            vx: 0,
            vy: 0,
            life: 0.34,
            maxLife: 0.34,
            color,
            size: 12 + count * 0.45,
            ring: true,
        });
        for (let i = 0; i < safeCount; i += 1) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 70 + Math.random() * 220;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.36 + Math.random() * 0.46,
                maxLife: 0.82,
                color: i % 4 === 0 ? '#fff2a8' : color,
                size: 2 + Math.random() * 4,
                spark: i % 3 !== 0,
            });
            if (!isPlaneLowPowerMode() && i % 5 === 0) {
                particles.push({
                    x, y,
                    vx: Math.cos(angle + 0.25) * speed * 0.42,
                    vy: Math.sin(angle + 0.25) * speed * 0.42,
                    life: 0.7 + Math.random() * 0.35,
                    maxLife: 1.05,
                    color: 'rgba(80,90,100,0.8)',
                    size: 8 + Math.random() * 8,
                    smoke: true,
                });
            }
            if (!isPlaneLowPowerMode() && i % 6 === 0) {
                const dx = Math.cos(angle) * (12 + Math.random() * 18);
                const dy = Math.sin(angle) * (12 + Math.random() * 18);
                particles.push({
                    x: x + dx,
                    y: y + dy,
                    vx: Math.cos(angle) * speed * 0.34,
                    vy: Math.sin(angle) * speed * 0.34,
                    life: 0.28,
                    maxLife: 0.28,
                    color: '#d9e3ed',
                    size: 5 + Math.random() * 5,
                    debris: true,
                });
            }
        }
    };

    const setPlaneMessage = (text, duration = 1400) => {
        GAME.message = text;
        GAME.messageTimer = duration;
    };

    const triggerShake = (intensity = 5, duration = 180) => {
        GAME.shakeIntensity = Math.max(GAME.shakeIntensity, intensity);
        GAME.shakeTimer = Math.max(GAME.shakeTimer, duration);
    };

    const addPlaneScore = (baseScore) => {
        const doubleScore = GAME.doubleScoreTimer > 0 ? 2 : 1;
        const comboBonus = GAME.combo >= 8 ? 1.5 : GAME.combo >= 4 ? 1.25 : 1;
        const gained = Math.round(baseScore * doubleScore * comboBonus * getPlaneBuildStats().scoreMult * getPlaneStageScoreMult());
        GAME.score += gained;
        GAME.combo += 1;
        GAME.bestCombo = Math.max(GAME.bestCombo, GAME.combo);
        GAME.comboTimer = 2300;
        if (GAME.combo === 4 || GAME.combo === 8 || GAME.combo % 12 === 0) {
            setPlaneMessage(`连击 ×${GAME.combo}  分数加成`, 900);
        }
        return gained;
    };

    const breakCombo = () => {
        GAME.combo = 0;
        GAME.comboTimer = 0;
    };

    const limitGameEntities = () => {
        const particleLimit = getPlaneParticleLimit();
        if (particles.length > particleLimit) particles.splice(0, particles.length - particleLimit);
        if (bullets.length > MAX_BULLETS) bullets.splice(0, bullets.length - MAX_BULLETS);
        if (enemyBullets.length > MAX_ENEMY_BULLETS) enemyBullets.splice(0, enemyBullets.length - MAX_ENEMY_BULLETS);
        if (powerUps.length > MAX_POWERUPS) powerUps.splice(0, powerUps.length - MAX_POWERUPS);
        if (enemies.length > MAX_ENEMIES) enemies.splice(0, enemies.length - MAX_ENEMIES);
        if (summons.length > 4) summons.splice(0, summons.length - 4);
    };

    const recalcPlaneBuildTags = () => {
        const counts = {};
        const addTags = (tags = []) => tags.forEach((tag) => { counts[tag] = (counts[tag] || 0) + 1; });
        const core = getPlaneBuildCore();
        if (core) addTags(core.tags);
        GAME.buildModules.map(getPlaneBuildModule).filter(Boolean).forEach((module) => addTags(module.tags));
        GAME.buildTagCounts = counts;
        return counts;
    };

    const applyPlaneBuildVitals = () => {
        const beforeMax = GAME.maxHp || getPlayerBaseMaxHp();
        const nextMax = getPlayerMaxHp();
        GAME.maxHp = nextMax;
        if (nextMax > beforeMax) GAME.hp = Math.min(nextMax, GAME.hp + (nextMax - beforeMax));
        else GAME.hp = Math.min(GAME.hp, nextMax);
        const barrierMax = Math.round(nextMax * getPlaneBuildStats().barrierMaxRatio);
        GAME.barrierMax = barrierMax;
        GAME.barrierHp = Math.min(GAME.barrierHp || 0, barrierMax);
    };

    const addPlaneBarrier = (amount) => {
        applyPlaneBuildVitals();
        if (!GAME.barrierMax || amount <= 0) return 0;
        const before = GAME.barrierHp || 0;
        GAME.barrierHp = Math.min(GAME.barrierMax, before + Math.round(amount));
        return GAME.barrierHp - before;
    };

    const applyPlaneBuildImmediateEffects = (effects = {}) => {
        if (effects.startShield) GAME.shieldActive = true;
        if (effects.grantBombs) GAME.bombs = Math.min(9, GAME.bombs + effects.grantBombs);
        if (effects.grantBursts) GAME.burstCharges = Math.min(3, GAME.burstCharges + effects.grantBursts);
        if (effects.grantBarrierRatio) addPlaneBarrier(GAME.maxHp * effects.grantBarrierRatio);
        if (effects.grantHealRatio) GAME.hp = Math.min(GAME.maxHp, GAME.hp + Math.round(GAME.maxHp * effects.grantHealRatio));
    };

    const primePlaneBuildTimers = () => {
        const stats = getPlaneBuildStats();
        if (stats.autoMissileInterval > 0 && GAME.autoMissileTimer <= 0) GAME.autoMissileTimer = stats.autoMissileInterval;
        if (stats.autoLaserInterval > 0 && GAME.autoLaserTimer <= 0) GAME.autoLaserTimer = stats.autoLaserInterval;
        if (stats.autoVolleyInterval > 0 && GAME.autoVolleyTimer <= 0) GAME.autoVolleyTimer = stats.autoVolleyInterval;
        if (stats.rearVolleyInterval > 0 && GAME.rearVolleyTimer <= 0) GAME.rearVolleyTimer = stats.rearVolleyInterval;
        if (stats.summonInterval > 0 && GAME.summonTimer <= 0) GAME.summonTimer = Math.min(1400, stats.summonInterval);
        if (stats.summonBarrierPulseInterval > 0 && GAME.summonBarrierPulseTimer <= 0) GAME.summonBarrierPulseTimer = stats.summonBarrierPulseInterval;
        if (stats.scytheInterval > 0 && GAME.scytheTimer <= 0) GAME.scytheTimer = stats.scytheInterval;
        if (stats.meteorInterval > 0 && GAME.meteorTimer <= 0) GAME.meteorTimer = stats.meteorInterval;
        if (stats.barrierRegenInterval > 0 && GAME.barrierRegenTimer <= 0) GAME.barrierRegenTimer = stats.barrierRegenInterval;
    };

    const resumePlaneRunAfterDraft = () => {
        GAME.buildDraft = null;
        GAME.paused = false;
        planePauseBtn.textContent = '暂停';
        GAME.lastTime = performance.now();
        updatePlaneActionButtons();
        requestPlaneHudUpdate();
        renderPlaneGame();
        if (GAME.running && !GAME.gameOver) {
            schedulePlaneFrame();
        }
    };

    const pickUniquePlaneItems = (pool, count, picker = null) => {
        const working = [...pool];
        const choices = [];
        while (choices.length < count && working.length) {
            const picked = picker ? picker(working) : working[Math.floor(Math.random() * working.length)];
            choices.push(picked);
            working.splice(working.indexOf(picked), 1);
        }
        return choices;
    };

    const createPlaneCoreDraft = () => ({
        type: 'core',
        title: '选择核心流派',
        subtitle: '本局随机出现 3 个核心，后续 BOSS 会掉落模组',
        choices: pickUniquePlaneItems(PLANE_BUILD_CORES, 3),
    });

    const weightedPickPlaneModule = (pool) => {
        const total = pool.reduce((sum, module) => {
            const rarityWeight = PLANE_BUILD_RARITIES[module.rarity]?.weight || 1;
            const coreBias = module.core === GAME.buildCore ? 2.15 : 1;
            return sum + rarityWeight * coreBias;
        }, 0);
        let roll = Math.random() * total;
        for (const module of pool) {
            const weight = (PLANE_BUILD_RARITIES[module.rarity]?.weight || 1) * (module.core === GAME.buildCore ? 2.15 : 1);
            roll -= weight;
            if (roll <= 0) return module;
        }
        return pool[pool.length - 1];
    };

    const isPlaneModuleEligibleForBuild = (module) => (
        module?.core === 'universal' || module?.core === GAME.buildCore
    );

    const createPlaneModuleDraft = (excludedIds = []) => {
        const owned = new Set(GAME.buildModules);
        const excluded = new Set(excludedIds);
        const choices = [];

        const corePool = PLANE_BUILD_MODULES.filter((module) => module.core === GAME.buildCore && !owned.has(module.id) && !excluded.has(module.id));
        if (corePool.length) {
            choices.push(weightedPickPlaneModule(corePool));
        }

        let pool = PLANE_BUILD_MODULES.filter((module) => isPlaneModuleEligibleForBuild(module) && !owned.has(module.id) && !excluded.has(module.id) && !choices.some((choice) => choice.id === module.id));
        if (pool.length + choices.length < 3) {
            pool = PLANE_BUILD_MODULES.filter((module) => isPlaneModuleEligibleForBuild(module) && !owned.has(module.id) && !choices.some((choice) => choice.id === module.id));
        }
        while (choices.length < 3 && pool.length) {
            const picked = weightedPickPlaneModule(pool);
            choices.push(picked);
            pool.splice(pool.indexOf(picked), 1);
        }
        if (!choices.length) return null;
        return {
            type: 'module',
            title: '选择战术模组',
            subtitle: '同标签累计 3 个会触发套装效果',
            choices,
        };
    };

    const openPlaneBuildDraft = (draft) => {
        if (!draft || !draft.choices?.length) return false;
        GAME.buildDraft = draft;
        GAME.paused = true;
        pointerControl.active = false;
        planePauseBtn.textContent = '选择中';
        updatePlaneActionButtons();
        renderPlaneGame();
        return true;
    };

    const selectPlaneBuildChoice = (id) => {
        const draft = GAME.buildDraft;
        if (!draft) return;
        if (draft.type === 'core') {
            const core = PLANE_BUILD_CORES.find((item) => item.id === id);
            if (!core) return;
            GAME.buildCore = core.id;
            recalcPlaneBuildTags();
            applyPlaneBuildVitals();
            applyPlaneBuildImmediateEffects(core.effects);
            primePlaneBuildTimers();
            setPlaneMessage(`${core.name} 已启动`, 1200);
            resumePlaneRunAfterDraft();
            return;
        }

        const module = PLANE_BUILD_MODULES.find((item) => item.id === id);
        if (!module || GAME.buildModules.includes(module.id)) return;
        GAME.buildModules.push(module.id);
        recalcPlaneBuildTags();
        applyPlaneBuildVitals();
        applyPlaneBuildImmediateEffects(module.effects);
        primePlaneBuildTimers();
        setPlaneMessage(`${module.name} 已装配`, 1200);
        resumePlaneRunAfterDraft();
    };

    const rerollPlaneModuleDraft = () => {
        const draft = GAME.buildDraft;
        if (!draft || draft.type !== 'module') return;
        if (planeWallet.coins < PLANE_MODULE_REROLL_COST) {
            setPlaneMessage(`金币不足，刷新需要 ${PLANE_MODULE_REROLL_COST}`, 900);
            renderPlaneGame();
            return;
        }
        const previous = draft.choices.map((choice) => choice.id);
        const nextDraft = createPlaneModuleDraft(previous);
        if (!nextDraft) {
            setPlaneMessage('没有更多可用模组', 900);
            renderPlaneGame();
            return;
        }
        setStoredPlaneWallet({ ...planeWallet, coins: planeWallet.coins - PLANE_MODULE_REROLL_COST });
        GAME.buildDraft = nextDraft;
        setPlaneMessage('模组已刷新', 700);
        updatePlaneProgressUI();
        renderPlaneGame();
    };

    const createEnemyBullet = (x, y, vx, vy, options = {}) => {
        if (enemyBullets.length >= MAX_ENEMY_BULLETS) return;
        const ratio = options.damageRatio || ENEMY_DAMAGE_RATIOS.bossBullet;
        enemyBullets.push({
            x, y, vx, vy,
            size: options.size || 5,
            color: options.color || '#ff3366',
            shape: options.shape || 'circle',
            life: options.life || 8,
            damage: options.damage || getIncomingDamage(ratio),
            grazed: false,
        });
    };

    const shootAtPlayer = (x, y, speed = 210, options = {}) => {
        if (!player) return;
        const dx = player.x - x;
        const dy = player.y - y;
        const len = Math.hypot(dx, dy) || 1;
        createEnemyBullet(x, y, dx / len * speed, dy / len * speed, options);
    };

    const dropPowerUp = (x, y, type) => {
        const table = {
            fire:        { color: '#ffd25a' },
            shield:      { color: '#00ff88' },
            bomb:        { color: '#ff7a2e' },
            heal:        { color: '#ff365a' },
            slow:        { color: '#66ccff' },
            doubleScore: { color: '#ffcc00' },
            magnet:      { color: '#32e6ff' },
            drone:       { color: '#9d7cff' },
            burst:       { color: '#f7f36a' },
        };
        const meta = table[type];
        if (!meta) return;
        powerUps.push({ x, y, color: meta.color, type });
    };

    const dropRandomPowerUp = (x, y, boosted = false) => {
        const bonus = boosted ? 0.16 : 0;
        const buildBonus = getPlaneBuildStats().powerUpDropBonus || 0;
        if (Math.random() >= 0.225 + bonus + buildBonus) return;
        const roll = Math.random() * 0.225;
        if (roll < 0.035) dropPowerUp(x, y, 'fire');
        else if (roll < 0.060) dropPowerUp(x, y, 'shield');
        else if (roll < 0.080) dropPowerUp(x, y, 'bomb');
        else if (roll < 0.105) dropPowerUp(x, y, 'heal');
        else if (roll < 0.130) dropPowerUp(x, y, 'slow');
        else if (roll < 0.155) dropPowerUp(x, y, 'doubleScore');
        else if (roll < 0.180) dropPowerUp(x, y, 'magnet');
        else if (roll < 0.205) dropPowerUp(x, y, 'drone');
        else dropPowerUp(x, y, 'burst');
    };

    const grantPlaneDiamonds = (amount) => {
        if (amount <= 0) return;
        const adjusted = Math.max(amount, Math.floor(amount * getPlaneStageRewardMult() * getPermanentRewardMult()));
        GAME.runDiamondsEarned += adjusted;
        setStoredPlaneWallet({ ...planeWallet, diamonds: planeWallet.diamonds + adjusted });
        updatePlaneProgressUI();
    };

    const grantPlaneGameOverRewards = () => {
        if (GAME.rewardGranted) return;
        const coins = Math.floor((GAME.score / 500) * getPlaneStageRewardMult() * getPermanentRewardMult());
        GAME.runCoinsEarned = coins;
        GAME.rewardGranted = true;
        if (coins > 0) {
            setStoredPlaneWallet({ ...planeWallet, coins: planeWallet.coins + coins });
        }
        updatePlaneProgressUI();
    };

    const unlockNextPlaneStage = () => {
        const stage = getPlaneStage();
        const currentUnlocked = getPlaneMaxStageUnlocked();
        if (stage !== currentUnlocked || stage >= PLANE_STAGE_MAX) return 0;
        setStoredPlaneUpgrades({ ...planeUpgrades, maxStageUnlocked: stage + 1 });
        selectedPlaneStage = Math.min(PLANE_STAGE_MAX, stage + 1);
        return stage + 1;
    };

    const setPlaneWaveState = (state) => {
        GAME.waveState = state;
        GAME.waveTimer = 0;
        GAME.waveKills = 0;
        GAME.bossWarningSpawned = false;
        GAME.level = Math.max(1, GAME.waveIndex);

        if (state === 'small') {
            GAME.waveTarget = 18 + Math.min(24, GAME.waveIndex * 3);
            GAME.spawnTimer = Math.min(GAME.spawnTimer, 150);
            setPlaneMessage(`第 ${GAME.waveIndex} 波来袭`, 1100);
        } else if (state === 'elite') {
            GAME.waveTarget = 4 + Math.min(5, Math.floor(GAME.waveIndex / 2));
            GAME.spawnTimer = 180;
            setPlaneMessage('精英编队接近', 1200);
        } else if (state === 'reward') {
            GAME.waveTimer = 1300;
            dropRandomPowerUp(GAME.width * 0.42, 34, true);
            dropRandomPowerUp(GAME.width * 0.58, 34, true);
            setPlaneMessage('补给投放', 1100);
        } else if (state === 'bossWarning') {
            const finalWarning = GAME.waveIndex >= PLANE_SUBSTAGES_PER_RUN;
            GAME.waveTimer = finalWarning ? 3200 : 2000;
            enemies = [];
            enemyBullets = [];
            triggerShake(finalWarning ? 8 : 4, finalWarning ? 1100 : 650);
            setPlaneMessage(finalWarning ? 'FINAL WARNING  终极首领苏醒' : 'WARNING  首领接近', finalWarning ? 3000 : 2000);
        } else if (state === 'clear') {
            GAME.waveTimer = 1700;
            GAME.waveIndex += 1;
            GAME.level = GAME.waveIndex;
            GAME.burstCharges = Math.min(3, GAME.burstCharges + 1);
            setPlaneMessage(`第 ${GAME.waveIndex - 1} 关突破`, 1500);
            requestPlaneHudUpdate();
        }
    };

    const updatePlaneWaveState = (dt) => {
        if (GAME.boss || GAME.waveState === 'boss') return;
        if (GAME.waveState === 'small' || GAME.waveState === 'elite') return;

        GAME.waveTimer = Math.max(0, GAME.waveTimer - dt * 1000);
        if (GAME.waveState === 'reward' && GAME.waveTimer <= 0) {
            setPlaneWaveState('bossWarning');
            return;
        }
        if (GAME.waveState === 'bossWarning') {
            if (!GAME.bossWarningSpawned && GAME.waveTimer <= 800) {
                GAME.bossWarningSpawned = true;
                spawnBoss();
            }
            return;
        }
        if (GAME.waveState === 'clear' && GAME.waveTimer <= 0) {
            setPlaneWaveState('small');
        }
    };

    const recordPlaneEnemyKill = (enemy) => {
        if (GAME.waveState !== 'small' && GAME.waveState !== 'elite') return;
        if (GAME.waveState === 'elite' && !enemy?.elite) return;
        GAME.waveKills += 1;
        if (GAME.waveKills < GAME.waveTarget) return;
        setPlaneWaveState(GAME.waveState === 'small' ? 'elite' : 'reward');
    };

    const shouldSpawnPlaneWaveEnemy = () => (
        GAME.waveState === 'small' ||
        GAME.waveState === 'elite'
    );
    const isPlaneFinalBossWave = () => GAME.waveIndex >= PLANE_SUBSTAGES_PER_RUN;

    const getBossPhase = (boss) => boss?.phaseLevel || 1;
    const getBossPhaseSpeedScale = (boss) => 1 + (getBossPhase(boss) - 1) * 0.18;
    const getBossPhaseMinDuration = (boss) => {
        if (boss?.isFinalBoss) return (boss.finalLife || 1) >= 2 ? 5.0 : 5.8;
        const stage = boss?.stageIndex || GAME.waveIndex || 1;
        if (stage <= 1) return 0.9;
        if (stage <= 2) return 1.35;
        if (stage <= 4) return 2.45;
        if (stage <= 7) return 3.75;
        return 5.25;
    };
    const getBossPhaseTransitionMs = (boss, nextPhase) => {
        if (boss?.isFinalBoss) return nextPhase >= 4 ? 1900 : 1450;
        const stage = boss?.stageIndex || GAME.waveIndex || 1;
        if (stage <= 2) return nextPhase === 3 ? 520 : 360;
        if (stage <= 5) return nextPhase === 3 ? 850 : 650;
        return nextPhase === 3 ? 1250 : 980;
    };
    const getBossPhaseFloorRatio = (boss) => {
        const phase = getBossPhase(boss);
        if (boss?.isFinalBoss) {
            if ((boss.finalLife || 1) >= 2) return phase === 4 ? 0.50 : 0;
            if (phase === 1) return 0.66;
            if (phase === 2) return 0.33;
            return 0;
        }
        if (phase === 1) return 0.70;
        if (phase === 2) return 0.35;
        return 0;
    };
    const getBossSpecialDamageCap = (boss, source = 'bomb') => {
        if (getBossPhaseMinDuration(boss) <= 0) return Infinity;
        const phase = getBossPhase(boss);
        const phaseSpanRatio = phase === 1 ? 0.30 : 0.35;
        const capRatio = source === 'burst' ? 0.25 : 0.20;
        return Math.max(getPlayerDamage() * 2, Math.round(boss.maxHp * phaseSpanRatio * capRatio));
    };

    const applyBossDamage = (damage, source = 'shot', options = {}) => {
        const boss = GAME.boss;
        if (!boss || damage <= 0) return { applied: 0, blocked: false };
        if ((boss.phaseTransitionTimer || 0) > 0) {
            return { applied: 0, blocked: true };
        }

        let actualDamage = Math.max(0, Math.round(damage));
        if (source === 'bomb') {
            actualDamage = Math.min(actualDamage, getBossSpecialDamageCap(boss, source));
        } else if (source === 'burst') {
            const burstId = options.burstId || 0;
            boss.burstDamageById = boss.burstDamageById || {};
            const used = boss.burstDamageById[burstId] || 0;
            const remaining = Math.max(0, getBossSpecialDamageCap(boss, source) - used);
            actualDamage = Math.min(actualDamage, remaining);
            boss.burstDamageById[burstId] = used + actualDamage;
        }

        if (actualDamage <= 0) return { applied: 0, blocked: true };

        const beforeHp = boss.hp;
        boss.hp = Math.max(0, boss.hp - actualDamage);

        const minDuration = getBossPhaseMinDuration(boss);
        const floorRatio = getBossPhaseFloorRatio(boss);
        if (minDuration > 0 && floorRatio > 0 && (boss.phaseElapsed || 0) < minDuration) {
            const floorHp = Math.min(boss.maxHp, Math.ceil(boss.maxHp * floorRatio) + 1);
            if (boss.hp < floorHp) {
                boss.hp = floorHp;
                if (!boss.phaseLockMessageTimer || boss.phaseLockMessageTimer <= 0) {
                    const left = Math.max(1, Math.ceil(minDuration - (boss.phaseElapsed || 0)));
                    setPlaneMessage(`阶段装甲稳定 ${left}s`, 650);
                    boss.phaseLockMessageTimer = 700;
                }
                return { applied: Math.max(0, beforeHp - boss.hp), blocked: true };
            }
        }

        return { applied: Math.max(0, beforeHp - boss.hp), blocked: false };
    };

    const updateBossPhaseTransitions = (boss) => {
        if (!boss?.maxHp) return;
        const hpRatio = Math.max(0, boss.hp / boss.maxHp);
        const nextPhase = boss.isFinalBoss
            ? ((boss.finalLife || 1) >= 2
                ? (hpRatio <= 0.50 ? 5 : 4)
                : (hpRatio <= 0.33 ? 3 : hpRatio <= 0.66 ? 2 : 1))
            : (hpRatio <= 0.35 ? 3 : hpRatio <= 0.70 ? 2 : 1);
        if (nextPhase <= getBossPhase(boss)) return;
        if (getBossPhaseMinDuration(boss) > 0 && (boss.phaseElapsed || 0) < getBossPhaseMinDuration(boss)) return;

        boss.phaseLevel = nextPhase;
        boss.phaseElapsed = 0;
        boss.speed = (boss.baseSpeed || boss.speed || 60) * getBossPhaseSpeedScale(boss);
        boss.shootTimer = Math.min(boss.shootTimer || 0.6, nextPhase >= 4 ? 0.12 : nextPhase === 3 ? 0.18 : 0.35);
        boss.phaseFireTimer = 0.25;
        if (getBossPhaseMinDuration(boss) > 0) {
            boss.phaseTransitionTimer = getBossPhaseTransitionMs(boss, nextPhase);
            enemyBullets = [];
            dropPowerUp(boss.x + boss.w / 2, boss.y + boss.h + 8, nextPhase >= 3 ? 'heal' : 'doubleScore');
        }
        triggerShake(nextPhase >= 4 ? 12 : nextPhase === 3 ? 9 : 6, nextPhase >= 4 ? 760 : nextPhase === 3 ? 520 : 360);
        addExplosionParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, boss.accent || '#ff3366', nextPhase >= 4 ? 34 : nextPhase === 3 ? 24 : 16);
        setPlaneMessage(nextPhase >= 5 ? '终极首领：半血暴走' : nextPhase >= 4 ? '终极首领：第二命苏醒' : nextPhase === 3 ? 'BOSS 核心暴走' : 'BOSS 弹幕升级', 1050);
    };

    const updateBossPhasePressure = (boss, dt) => {
        const phase = getBossPhase(boss);
        if (phase < 2) return;
        boss.phaseFireTimer = (boss.phaseFireTimer || 0) - dt;
        if (boss.phaseFireTimer > 0) return;

        const cx = boss.x + boss.w / 2;
        const cy = boss.y + boss.h / 2;
        boss.phaseFireTimer = boss.isFinalBoss ? (phase >= 5 ? 0.48 : phase >= 4 ? 0.62 : phase >= 3 ? 0.9 : 1.12) : phase === 3 ? 0.82 : 1.2;

        if (boss.bossType === 'apocalypse') {
            const side = (boss.apocalypseSweepSide = -(boss.apocalypseSweepSide || 1));
            const lanes = phase >= 5 ? 7 : phase >= 4 ? 5 : phase >= 3 ? 4 : 3;
            for (let i = 0; i < lanes; i += 1) {
                const x = GAME.width * ((i + 1) / (lanes + 1));
                createEnemyBullet(x, cy - 12, side * (phase >= 5 ? 96 : phase >= 4 ? 76 : 48), 255 + phase * 34, {
                    color: i % 2 ? '#ff2df7' : '#4fd4ff',
                    size: phase >= 5 ? 7 : phase >= 4 ? 6 : 5,
                    shape: 'diamond',
                    damageRatio: phase >= 4 ? ENEMY_DAMAGE_RATIOS.bossHeavy : ENEMY_DAMAGE_RATIOS.bossBullet,
                });
            }
            if (phase >= 4) {
                shootAtPlayer(cx, cy, 385, { color: '#ffffff', size: 8, shape: 'diamond', damageRatio: ENEMY_DAMAGE_RATIOS.bossHeavy });
            }
            if (phase >= 5) {
                createEnemyBullet(cx - 52, cy + 8, -118, 285, { color: '#ffd25a', size: 6, shape: 'diamond', damageRatio: ENEMY_DAMAGE_RATIOS.bossHeavy });
                createEnemyBullet(cx + 52, cy + 8, 118, 285, { color: '#62d2ff', size: 6, shape: 'diamond', damageRatio: ENEMY_DAMAGE_RATIOS.bossHeavy });
            }
        } else if (boss.bossType === 'spiral') {
            const count = phase === 3 ? 10 : 6;
            const spin = (boss.angle || boss.phase || 0) + Date.now() * 0.001;
            for (let i = 0; i < count; i += 1) {
                const angle = spin + i * Math.PI * 2 / count;
                createEnemyBullet(cx, cy, Math.cos(angle) * (phase === 3 ? 165 : 130), Math.sin(angle) * (phase === 3 ? 165 : 130), { color: boss.accent, size: phase === 3 ? 5 : 4 });
            }
        } else if (boss.bossType === 'laser') {
            for (let i = -2; i <= 2; i += 1) {
                createEnemyBullet(cx + i * 24, cy, i * (phase === 3 ? 32 : 20), 260 + phase * 36, { color: boss.accent, size: 5, shape: 'diamond', damageRatio: ENEMY_DAMAGE_RATIOS.bossHeavy });
            }
        } else if (boss.bossType === 'sniper') {
            shootAtPlayer(cx - 24, cy, 300 + phase * 28, { color: boss.accent, size: 6, shape: 'diamond', damageRatio: ENEMY_DAMAGE_RATIOS.bossHeavy });
            shootAtPlayer(cx + 24, cy, 300 + phase * 28, { color: boss.accent, size: 6, shape: 'diamond', damageRatio: ENEMY_DAMAGE_RATIOS.bossHeavy });
        } else if (boss.bossType === 'hydra') {
            [-42, -18, 18, 42].forEach((offset) => {
                createEnemyBullet(cx + offset, cy, offset * 1.2, 230 + phase * 34, { color: boss.accent, size: 4 });
            });
            if (phase === 3) shootAtPlayer(cx, cy, 330, { color: boss.accent, size: 7, damageRatio: ENEMY_DAMAGE_RATIOS.bossHeavy });
        } else if (boss.bossType === 'sentinel') {
            const spread = phase === 3 ? 4 : 3;
            for (let i = -spread; i <= spread; i += 1) {
                createEnemyBullet(cx + i * 18, cy, i * 18, 245 + phase * 42, { color: boss.accent, size: 5, shape: 'diamond' });
            }
            if (phase === 3) shootAtPlayer(cx, cy, 360, { color: boss.accent, size: 7, damageRatio: ENEMY_DAMAGE_RATIOS.bossHeavy });
        } else if (boss.bossType === 'gatekeeper') {
            const laneGap = GAME.width / 6;
            const shift = ((boss.gatePattern || 0) % 2) * laneGap * 0.5;
            for (let lane = 1; lane <= 5; lane += 1) {
                if (phase < 3 && lane === 3) continue;
                createEnemyBullet(lane * laneGap + shift, cy - 4, Math.sin(lane + phase) * 24, 250 + phase * 38, { color: boss.accent, size: 5, shape: 'diamond' });
            }
            boss.gatePattern = (boss.gatePattern || 0) + 1;
        } else if (boss.bossType === 'minefield') {
            [-48, -24, 0, 24, 48].forEach((offset, index) => {
                createEnemyBullet(cx + offset, cy + 8, Math.sin((boss.phaseElapsed || 0) * 2 + index) * 42, 145 + phase * 22, { color: boss.accent, size: phase === 3 ? 7 : 6, life: 5.5 });
            });
        } else if (boss.bossType === 'dronecarrier') {
            for (let i = -2; i <= 2; i += 1) {
                shootAtPlayer(cx + i * 22, cy, 220 + phase * 36, { color: boss.accent, size: 4 });
            }
            if (phase === 3) {
                createEnemyBullet(cx - 58, cy, -86, 238, { color: boss.accent, size: 5 });
                createEnemyBullet(cx + 58, cy, 86, 238, { color: boss.accent, size: 5 });
            }
        } else {
            for (let i = -1; i <= 1; i += 1) {
                shootAtPlayer(cx + i * 28, cy, 250 + phase * 32, { color: boss.accent, size: phase === 3 ? 6 : 5 });
                if (phase === 3) createEnemyBullet(cx, cy, i * 72, 250, { color: boss.accent, size: 4 });
            }
        }
    };

    const enterFinalBossSecondLife = (boss) => {
        const secondLifeMaxHp = Math.max(1, Math.round((boss.maxHp || 1) * 1.12));
        boss.finalLife = 2;
        boss.phaseLevel = 4;
        boss.phaseElapsed = 0;
        boss.phaseTransitionTimer = 2200;
        boss.phaseLockMessageTimer = 0;
        boss.phaseFireTimer = 0.42;
        boss.shootTimer = 0.65;
        boss.finalBeamTimer = 1.65;
        boss.finalRingTimer = 1.25;
        boss.burstDamageById = {};
        boss.maxHp = secondLifeMaxHp;
        boss.hp = secondLifeMaxHp;
        boss.baseSpeed = Math.max(boss.baseSpeed || boss.speed || 42, 46);
        boss.speed = boss.baseSpeed * getBossPhaseSpeedScale(boss);
        boss.y = Math.min(72, boss.y);
        enemyBullets = [];
        dropPowerUp(boss.x + boss.w / 2 - 28, boss.y + boss.h + 10, 'heal');
        dropPowerUp(boss.x + boss.w / 2 + 28, boss.y + boss.h + 10, 'doubleScore');
        triggerShake(15, 920);
        addExplosionParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, '#ff2df7', 52);
        setPlaneMessage('天启第二命：星核重构', 1800);
    };

    const defeatCurrentBoss = () => {
        if (!GAME.boss) return;
        const boss = GAME.boss;
        if (boss.isFinalBoss && (boss.finalLife || 1) < 2) {
            enterFinalBossSecondLife(boss);
            requestPlaneHudUpdate();
            return;
        }
        const reward = boss.isFinalBoss ? FINAL_BOSS_DIAMOND_REWARD : BOSS_DIAMOND_REWARD;
        addExplosionParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, '#ff3366', boss.isFinalBoss ? 45 : 30);
        addPlaneScore(boss.isFinalBoss ? 260 : 70);
        grantPlaneDiamonds(reward);
        GAME.bossKillCount += 1;
        const unlockedStage = boss.isFinalBoss ? unlockNextPlaneStage() : 0;
        dropPowerUp(boss.x + boss.w / 2, boss.y, 'fire');
        dropPowerUp(boss.x + boss.w / 2 - 18, boss.y, 'heal');
        dropRandomPowerUp(boss.x + boss.w / 2 + 18, boss.y, true);
        triggerPlaneKillBuildEffects(boss.x + boss.w / 2, boss.y + boss.h / 2);
        GAME.boss = null;
        if (boss.isFinalBoss) {
            GAME.runVictory = true;
            GAME.waveState = 'clear';
            GAME.waveTimer = 0;
            setPlaneMessage(unlockedStage ? `${boss.bossName} 击破  难度${unlockedStage}解锁` : `${boss.bossName} 击破`, 2200);
            victoryTrigger();
            return;
        }
        setPlaneWaveState('clear');
        if (getPlaneBuildStats().shieldAfterBoss) GAME.shieldActive = true;
        setPlaneMessage(unlockedStage ? `${boss.bossName} 击破  难度${unlockedStage}解锁` : `${boss.bossName} 击破  +${reward}钻石`, 1600);
        openPlaneBuildDraft(createPlaneModuleDraft());
        requestPlaneHudUpdate();
    };

    const enemyDefs = [
        { type: 'small',     hp: 1, size: 26, speedBase: 90,  color: '#cf3147', scoreValue: 10, move: null, shoot: null },
        { type: 'medium',    hp: 2, size: 34, speedBase: 70,  color: '#c96b2b', scoreValue: 15, move: null, shoot: null },
        { type: 'fast',      hp: 1, size: 22, speedBase: 150, color: '#d5b24a', scoreValue: 10, move: null, shoot: null },
        { type: 'sine',      hp: 1, size: 28, speedBase: 70,  color: '#38a9d8', scoreValue: 12,
            move(e, dt, GAME) {
                const factor = GAME.slowdownFactor || 1;
                e.sinPhase = (e.sinPhase || 0) + 3 * dt;
                e.y += e.speed * dt * factor;
                e.x += Math.sin(e.sinPhase) * 50 * dt * factor;
            }
        },
        { type: 'tank',      hp: 4, size: 40, speedBase: 45,  color: '#7f5cc8', scoreValue: 25, move: null, shoot: null },
        { type: 'shooter',   hp: 2, size: 32, speedBase: 60,  color: '#d85f25', scoreValue: 15,
            shoot(e, dt, enemyBullets) {
                e.shootTimer = (e.shootTimer || 1) - dt;
                if (e.shootTimer <= 0) {
                    e.shootTimer = 2 + Math.random() * 0.5;
                    createEnemyBullet(e.x + e.w / 2, e.y + e.h / 2, 0, 160, {
                        color: e.color,
                        damageRatio: ENEMY_DAMAGE_RATIOS.enemyBullet,
                    });
                }
            }
        },
    ];

    const spawnEnemy = (preferredTypes = null, elite = false) => {
        if (enemies.length >= MAX_ENEMIES) return;
        const preferredSet = Array.isArray(preferredTypes) && preferredTypes.length
            ? new Set(preferredTypes)
            : null;
        const availableTypes = enemyDefs.filter(def => {
            if (preferredSet && !preferredSet.has(def.type)) return false;
            if (def.type === 'tank' || def.type === 'shooter') return GAME.level >= 2;
            return true;
        });
        const fallbackTypes = enemyDefs.filter(def => {
            if (!elite) return true;
            return def.type === 'medium' || def.type === 'sine' || def.type === 'tank' || def.type === 'shooter';
        });
        const pool = availableTypes.length ? availableTypes : fallbackTypes;
        const def = pool[Math.floor(Math.random() * pool.length)];
        const size = elite ? Math.round(def.size * 1.18) : def.size;
        const hp = Math.round(def.hp * ENEMY_HP_MULTIPLIER * (elite ? 2.2 : 1) * getPlaneStageHpMult());
        enemies.push({
            x: 10 + Math.random() * Math.max(10, GAME.width - size - 20),
            y: -size,
            w: size,
            h: size,
            speed: (def.speedBase + (Math.random() * 30) + GAME.level * 5) * (elite ? 0.92 : 1),
            hp,
            maxHp: hp,
            type: def.type,
            color: elite ? '#ffd25a' : def.color,
            scoreValue: def.scoreValue + (elite ? 24 : 0),
            move: def.move,
            shoot: def.shoot,
            sinPhase: 0,
            shootTimer: 0,
            elite,
        });
    };

    const bossTypes = [
        {
            type: 'viper', name: '赤翼歼灭炮舰', hpMultiplier: 1.0, speed: 90, color: '#9c2638', accent: '#ff365a',
            imageId: 'boss1', visualW: 146, visualH: 146, hitW: 124, hitH: 98,
            move(boss, dt, GAME) {
                const factor = GAME.slowdownFactor || 1;
                boss.y = Math.min(100, boss.y + 48 * dt * factor);
                boss.x += boss.speed * dt * factor * boss.dir;
                if (boss.x <= 10 || boss.x + boss.w >= GAME.width - 10) boss.dir *= -1;
            },
            shoot(boss, dt) {
                boss.shootTimer -= dt;
                if (boss.shootTimer <= 0) {
                    boss.shootTimer = Math.max(0.68, 1.12 - GAME.bossKillCount * 0.05);
                    for (let i = -2; i <= 2; i += 1) {
                        createEnemyBullet(boss.x + boss.w / 2 + i * 11, boss.y + boss.h / 2, i * 36, 190 + GAME.level * 5, { color: '#ff477e', size: 5 });
                    }
                }
            },
        },
        {
            type: 'spiral', name: '紫电回旋炮台', hpMultiplier: 1.18, speed: 60, color: '#46317f', accent: '#a65cff',
            imageId: 'boss6', visualW: 152, visualH: 152, hitW: 106, hitH: 106,
            move(boss, dt, GAME) {
                const factor = GAME.slowdownFactor || 1;
                boss.angle = (boss.angle || 0) + 1.6 * dt;
                boss.x = GAME.width / 2 - boss.w / 2 + Math.sin(boss.angle) * 72;
                boss.y = Math.min(118, boss.y + 22 * dt * factor);
            },
            shoot(boss, dt) {
                boss.shootTimer -= dt;
                if (boss.shootTimer <= 0) {
                    boss.shootTimer = 1.45;
                    const count = 12 + Math.min(6, GAME.bossKillCount);
                    for (let i = 0; i < count; i += 1) {
                        const angle = (Math.PI * 2 / count) * i + (boss.angle || 0) * 0.8;
                        createEnemyBullet(boss.x + boss.w / 2, boss.y + boss.h / 2, Math.cos(angle) * 115, Math.sin(angle) * 115, { color: '#bb55ff', size: 4 });
                    }
                }
            },
        },
        {
            type: 'rush', name: '橙焰突击军械', hpMultiplier: 0.92, speed: 165, color: '#a84f22', accent: '#ff9d2e',
            imageId: 'boss2', visualW: 126, visualH: 148, hitW: 94, hitH: 112,
            move(boss, dt, GAME) {
                const factor = GAME.slowdownFactor || 1;
                boss.x += boss.speed * dt * factor * boss.dir;
                if (boss.x <= 8 || boss.x + boss.w >= GAME.width - 8) {
                    boss.dir *= -1;
                    boss.speed = 150 + Math.random() * 72;
                }
                boss.y = Math.min(92, boss.y + 26 * dt * factor);
            },
            shoot(boss, dt) {
                boss.shootTimer -= dt;
                if (boss.shootTimer <= 0) {
                    boss.shootTimer = 0.52;
                    shootAtPlayer(boss.x + boss.w / 2, boss.y + boss.h / 2, 270 + GAME.level * 8, { color: '#ffb347', size: 5 });
                }
            },
        },
        {
            type: 'laser', name: '绿核攻城重炮', hpMultiplier: 1.45, speed: 45, color: '#236b4a', accent: '#00ff88',
            imageId: 'boss7', visualW: 164, visualH: 164, hitW: 132, hitH: 98,
            move(boss, dt, GAME) {
                const factor = GAME.slowdownFactor || 1;
                boss.x += boss.speed * dt * factor * boss.dir;
                if (boss.x <= 20 || boss.x + boss.w >= GAME.width - 20) boss.dir *= -1;
                boss.y = Math.min(72, boss.y + 12 * dt * factor);
            },
            shoot(boss, dt) {
                boss.laserCharge = (boss.laserCharge || 0) + dt;
                if (boss.laserCharge > 2.25) {
                    boss.laserCharge = 0;
                    setPlaneMessage('警告：重炮齐射', 850);
                    for (let i = -6; i <= 6; i += 1) {
                        createEnemyBullet(boss.x + boss.w / 2 + i * 11, boss.y + boss.h / 2, 0, 330, { color: '#00ff88', size: 5, shape: 'diamond', damageRatio: ENEMY_DAMAGE_RATIOS.bossHeavy });
                    }
                }
            },
        },
        {
            type: 'sentinel', name: '黑曜哨戒机甲', hpMultiplier: 1.34, speed: 72, color: '#2e3447', accent: '#f7d24a',
            imageId: 'boss3', visualW: 126, visualH: 164, hitW: 108, hitH: 124,
            move(boss, dt, GAME) {
                const factor = GAME.slowdownFactor || 1;
                boss.phase = (boss.phase || 0) + dt;
                boss.x += Math.sin(boss.phase * 1.35) * 88 * dt * factor + boss.speed * 0.18 * dt * boss.dir * factor;
                if (boss.x <= 16 || boss.x + boss.w >= GAME.width - 16) boss.dir *= -1;
                boss.x = Math.max(16, Math.min(GAME.width - boss.w - 16, boss.x));
                boss.y = Math.min(96, boss.y + 18 * dt * factor);
            },
            shoot(boss, dt) {
                boss.shootTimer -= dt;
                if (boss.shootTimer <= 0) {
                    const phase = getBossPhase(boss);
                    boss.shootTimer = Math.max(0.62, 1.08 - phase * 0.12 - GAME.bossKillCount * 0.025);
                    const cx = boss.x + boss.w / 2;
                    const cy = boss.y + boss.h / 2;
                    for (let i = -2; i <= 2; i += 1) {
                        createEnemyBullet(cx + i * 20, cy + 8, i * 26, 215 + phase * 32, { color: boss.accent, size: 5 });
                    }
                    shootAtPlayer(cx, cy + 10, 285 + phase * 28, { color: boss.accent, size: 6, shape: 'diamond' });
                }
            },
        },
        {
            type: 'gatekeeper', name: '钴蓝闸门机甲', hpMultiplier: 1.42, speed: 48, color: '#24456f', accent: '#4fd4ff',
            imageId: 'boss8', visualW: 166, visualH: 166, hitW: 128, hitH: 112,
            move(boss, dt, GAME) {
                const factor = GAME.slowdownFactor || 1;
                boss.phase = (boss.phase || 0) + dt;
                boss.x = GAME.width / 2 - boss.w / 2 + Math.sin(boss.phase * 1.15) * Math.min(96, GAME.width * 0.18);
                boss.y = Math.min(78, boss.y + 12 * dt * factor);
            },
            shoot(boss, dt) {
                boss.shootTimer -= dt;
                if (boss.shootTimer <= 0) {
                    const phase = getBossPhase(boss);
                    boss.shootTimer = Math.max(0.7, 1.28 - phase * 0.12 - GAME.bossKillCount * 0.018);
                    const cx = boss.x + boss.w / 2;
                    const cy = boss.y + boss.h / 2;
                    const laneGap = GAME.width / 6;
                    const openLane = phase === 1 ? 3 : 2 + Math.floor((boss.phase || 0) * 1.7) % 3;
                    for (let lane = 1; lane <= 5; lane += 1) {
                        if (lane === openLane) continue;
                        createEnemyBullet(lane * laneGap, cy + 4, 0, 245 + phase * 34, { color: boss.accent, size: 5, shape: 'diamond' });
                    }
                    if (phase >= 2) shootAtPlayer(cx, cy + 10, 285 + phase * 24, { color: boss.accent, size: 6 });
                }
            },
        },
        {
            type: 'sniper', name: '蓝星轨道狙击炮', hpMultiplier: 1.12, speed: 50, color: '#1f4c91', accent: '#62d2ff',
            imageId: 'boss4', visualW: 116, visualH: 172, hitW: 86, hitH: 132,
            move(boss, dt, GAME) {
                boss.timer = (boss.timer || 0) + dt;
                boss.x = GAME.width / 2 - boss.w / 2 + Math.sin(boss.timer * 1.8) * 90;
                boss.y = Math.min(86, boss.y + 18 * dt);
            },
            shoot(boss, dt) {
                boss.shootTimer -= dt;
                if (boss.shootTimer <= 0) {
                    boss.shootTimer = 1.05;
                    setPlaneMessage('轨道炮锁定，立刻规避', 900);
                    shootAtPlayer(boss.x + boss.w / 2, boss.y + boss.h / 2, 340, { color: '#62d2ff', size: 7, shape: 'diamond', damageRatio: ENEMY_DAMAGE_RATIOS.bossHeavy });
                    createEnemyBullet(boss.x + 18, boss.y + boss.h / 2, -54, 230, { color: '#62d2ff', size: 4 });
                    createEnemyBullet(boss.x + boss.w - 18, boss.y + boss.h / 2, 54, 230, { color: '#62d2ff', size: 4 });
                }
            },
        },
        {
            type: 'minefield', name: '猩红布雷重装', hpMultiplier: 1.5, speed: 42, color: '#6b2230', accent: '#ff6b35', hitW: 126, hitH: 96,
            move(boss, dt, GAME) {
                const factor = GAME.slowdownFactor || 1;
                boss.phase = (boss.phase || 0) + dt;
                boss.x += Math.sin(boss.phase * 1.9) * 52 * dt * factor;
                boss.x = Math.max(18, Math.min(GAME.width - boss.w - 18, boss.x));
                boss.y = Math.min(82, boss.y + 14 * dt * factor);
            },
            shoot(boss, dt) {
                boss.shootTimer -= dt;
                if (boss.shootTimer <= 0) {
                    const phase = getBossPhase(boss);
                    boss.shootTimer = Math.max(0.72, 1.35 - phase * 0.14 - GAME.bossKillCount * 0.02);
                    const cx = boss.x + boss.w / 2;
                    const cy = boss.y + boss.h / 2;
                    [-42, -21, 0, 21, 42].forEach((offset, index) => {
                        createEnemyBullet(cx + offset, cy + 14, Math.sin((boss.phase || 0) * 3 + index) * 54, 135 + phase * 26, { color: boss.accent, size: 6, life: 5.8 });
                    });
                    if (phase >= 2) {
                        createEnemyBullet(cx - 56, cy, -86, 210, { color: boss.accent, size: 5 });
                        createEnemyBullet(cx + 56, cy, 86, 210, { color: boss.accent, size: 5 });
                    }
                }
            },
        },
        {
            type: 'dronecarrier', name: '白钢蜂群母机', hpMultiplier: 1.58, speed: 54, color: '#505866', accent: '#92f7ff',
            imageId: 'boss5', visualW: 118, visualH: 220, hitW: 96, hitH: 146,
            move(boss, dt, GAME) {
                const factor = GAME.slowdownFactor || 1;
                boss.phase = (boss.phase || 0) + dt;
                boss.x += Math.sin(boss.phase * 1.45) * 72 * dt * factor;
                boss.x = Math.max(12, Math.min(GAME.width - boss.w - 12, boss.x));
                boss.y = Math.min(88, boss.y + 16 * dt * factor);
            },
            shoot(boss, dt) {
                boss.shootTimer -= dt;
                if (boss.shootTimer <= 0) {
                    const phase = getBossPhase(boss);
                    boss.shootTimer = Math.max(0.66, 1.18 - phase * 0.12 - GAME.bossKillCount * 0.018);
                    const cx = boss.x + boss.w / 2;
                    const cy = boss.y + boss.h / 2;
                    [-45, -20, 20, 45].forEach((offset) => {
                        shootAtPlayer(cx + offset, cy + 6, 210 + phase * 36, { color: boss.accent, size: 4 });
                    });
                    if (phase >= 2) {
                        for (let i = -1; i <= 1; i += 1) {
                            createEnemyBullet(cx, cy + 18, i * 68, 225 + phase * 24, { color: boss.accent, size: 5 });
                        }
                    }
                }
            },
        },
        {
            type: 'hydra', name: '终极多炮塔灭绝母舰', hpMultiplier: 1.65, speed: 36, color: '#48305f', accent: '#ff5df4',
            imageId: 'boss9', visualW: 156, visualH: 156, hitW: 124, hitH: 110,
            move(boss, dt, GAME) {
                const factor = GAME.slowdownFactor || 1;
                boss.phase = (boss.phase || 0) + dt;
                boss.x += Math.sin(boss.phase * 2.4) * 58 * dt * factor;
                boss.x = Math.max(18, Math.min(GAME.width - boss.w - 18, boss.x));
                boss.y = Math.min(80, boss.y + 14 * dt * factor);
            },
            shoot(boss, dt) {
                boss.shootTimer -= dt;
                if (boss.shootTimer <= 0) {
                    boss.shootTimer = 1.25;
                    const barrels = [boss.x + 18, boss.x + boss.w / 2, boss.x + boss.w - 18];
                    barrels.forEach((x, idx) => {
                        shootAtPlayer(x, boss.y + boss.h / 2, 220 + idx * 28, { color: '#ff5df4', size: 5 });
                        createEnemyBullet(x, boss.y + boss.h / 2, (idx - 1) * 70, 205, { color: '#ff5df4', size: 4 });
                    });
                }
            },
        },
    ];

    const FINAL_BOSS_TYPE = {
        type: 'apocalypse', name: '天启零式·星核机神', hpMultiplier: 3.35, speed: 42, color: '#111827', accent: '#ff2df7', w: 150, h: 112,
        imageStages: { 1: 'finalboss1', 2: 'finalboss2', 3: 'finalboss3', 4: 'finalboss4', 5: 'finalboss4half' },
        imageVisuals: {
            1: { w: 200, h: 150 },
            2: { w: 150, h: 200 },
            3: { w: 182, h: 168 },
            4: { w: 210, h: 160 },
            5: { w: 214, h: 164 },
        },
        hitStages: {
            1: { w: 148, h: 112 },
            2: { w: 126, h: 142 },
            3: { w: 150, h: 124 },
            4: { w: 154, h: 118 },
            5: { w: 158, h: 122 },
        },
        move(boss, dt, GAME) {
            const phase = getBossPhase(boss);
            const factor = GAME.slowdownFactor || 1;
            boss.phase = (boss.phase || 0) + dt;
            const width = Math.min(GAME.width * 0.26, phase >= 4 ? 124 : 96);
            boss.x = GAME.width / 2 - boss.w / 2 + Math.sin(boss.phase * (phase >= 4 ? 1.45 : 0.95)) * width;
            boss.y = Math.min(phase >= 4 ? 68 : 82, boss.y + (phase >= 4 ? 18 : 12) * dt * factor);
        },
        shoot(boss, dt) {
            boss.shootTimer -= dt;
            boss.finalBeamTimer = (boss.finalBeamTimer || 1.8) - dt;
            boss.finalRingTimer = (boss.finalRingTimer || 2.4) - dt;
            const phase = getBossPhase(boss);
            const cx = boss.x + boss.w / 2;
            const cy = boss.y + boss.h / 2;

            if (boss.shootTimer <= 0) {
                boss.shootTimer = Math.max(0.28, 0.98 - phase * 0.11 - ((boss.finalLife || 1) >= 2 ? 0.08 : 0));
                const count = phase >= 5 ? 11 : phase >= 4 ? 9 : phase >= 3 ? 7 : 5;
                for (let i = 0; i < count; i += 1) {
                    const spread = i - (count - 1) / 2;
                    createEnemyBullet(cx + spread * 16, cy + 14, spread * (phase >= 5 ? 24 : phase >= 4 ? 18 : 12), 235 + phase * 32, {
                        color: phase >= 4 ? (spread % 2 ? '#4fd4ff' : '#ff2df7') : boss.accent,
                        size: phase >= 5 ? 6 : phase >= 3 ? 5 : 4,
                        shape: 'diamond',
                    });
                }
                if (phase >= 2) {
                    shootAtPlayer(cx - 44, cy + 8, 260 + phase * 28, { color: '#62d2ff', size: 6, shape: 'diamond', damageRatio: ENEMY_DAMAGE_RATIOS.bossHeavy });
                    shootAtPlayer(cx + 44, cy + 8, 260 + phase * 28, { color: '#ffd25a', size: 6, shape: 'diamond', damageRatio: ENEMY_DAMAGE_RATIOS.bossHeavy });
                }
                if (phase >= 5) {
                    shootAtPlayer(cx, cy + 16, 360, { color: '#ffffff', size: 8, shape: 'diamond', damageRatio: ENEMY_DAMAGE_RATIOS.bossHeavy });
                }
            }

            if (boss.finalRingTimer <= 0) {
                boss.finalRingTimer = phase >= 5 ? 1.05 : phase >= 4 ? 1.35 : phase >= 3 ? 1.8 : 2.5;
                const count = phase >= 5 ? 22 : phase >= 4 ? 18 : phase >= 3 ? 14 : 10;
                const spin = boss.phase * (phase >= 5 ? 2.25 : phase >= 4 ? 1.8 : 1.2);
                for (let i = 0; i < count; i += 1) {
                    const angle = spin + i * Math.PI * 2 / count;
                    const speed = phase >= 5 ? 205 : phase >= 4 ? 178 : 138 + phase * 12;
                    createEnemyBullet(cx, cy, Math.cos(angle) * speed, Math.sin(angle) * speed, {
                        color: i % 2 ? '#ff2df7' : '#4fd4ff',
                        size: phase >= 5 ? 6 : phase >= 4 ? 5 : 4,
                    });
                }
            }

            if (boss.finalBeamTimer <= 0) {
                boss.finalBeamTimer = phase >= 5 ? 1.75 : phase >= 4 ? 2.2 : phase >= 3 ? 2.75 : 3.4;
                const lanes = phase >= 5 ? [-0.42, -0.24, -0.08, 0.08, 0.24, 0.42] : phase >= 4 ? [-0.36, -0.18, 0, 0.18, 0.36] : phase >= 3 ? [-0.28, 0, 0.28] : [0];
                setPlaneMessage(phase >= 5 ? '终焉半血：交叉净化' : phase >= 4 ? '天启星核：全域净化' : '星核光束锁定', 760);
                lanes.forEach((lane, index) => {
                    const x = GAME.width * (0.5 + lane) + Math.sin((boss.phase || 0) + index) * 18;
                    createEnemyBullet(x, cy - 8, 0, 360 + phase * 34, {
                        color: '#ffffff',
                        size: phase >= 5 ? 9 : phase >= 4 ? 8 : 7,
                        shape: 'diamond',
                        damageRatio: ENEMY_DAMAGE_RATIOS.bossHeavy,
                        life: 3.2,
                    });
                    createEnemyBullet(x - 18, cy + 4, -28, 275 + phase * 28, { color: '#ff2df7', size: 5, shape: 'diamond' });
                    createEnemyBullet(x + 18, cy + 4, 28, 275 + phase * 28, { color: '#4fd4ff', size: 5, shape: 'diamond' });
                });
            }
        },
    };

    const spawnBoss = () => {
        const baseHp = 15 + GAME.bossKillCount * 7 + Math.floor(GAME.level * 1.5);
        const finalBoss = isPlaneFinalBossWave();
        const normalBossTypes = bossTypes;
        const typeIndex = GAME.bossKillCount % normalBossTypes.length;
        const template = finalBoss ? FINAL_BOSS_TYPE : normalBossTypes[typeIndex];
        const bossHp = Math.floor(baseHp * 1.14 * template.hpMultiplier * ENEMY_HP_MULTIPLIER * getPlaneStageHpMult());
        const bossW = template.w || 118;
        const bossH = template.h || 86;
        GAME.waveState = 'boss';
        GAME.boss = {
            x: GAME.width / 2 - bossW / 2,
            y: -bossH - 12,
            w: bossW,
            h: bossH,
            hp: bossHp,
            maxHp: bossHp,
            speed: template.speed,
            baseSpeed: template.speed,
            dir: Math.random() > 0.5 ? 1 : -1,
            shootTimer: 0.7,
            phaseLevel: 1,
            phaseElapsed: 0,
            phaseFireTimer: 1.1,
            phaseTransitionTimer: 0,
            phaseLockMessageTimer: 0,
            burstDamageById: {},
            stageIndex: GAME.waveIndex,
            bossType: template.type,
            bossName: template.name,
            isFinalBoss: finalBoss,
            finalLife: finalBoss ? 1 : 0,
            move: template.move.bind(template),
            shoot: template.shoot.bind(template),
            color: template.color,
            accent: template.accent,
            imageId: template.imageId,
            imageStages: template.imageStages,
            visualW: template.visualW,
            visualH: template.visualH,
            imageVisuals: template.imageVisuals,
            hitW: template.hitW,
            hitH: template.hitH,
            hitStages: template.hitStages,
        };
        setPlaneMessage(finalBoss ? `关底终极首领：${template.name}` : `首领：${template.name} 登场！`, finalBoss ? 2400 : 1600);
    };

    const findNearestPlaneTarget = (x, y) => {
        const targets = [...enemies];
        if (GAME.boss) targets.push(GAME.boss);
        let best = null;
        let bestDist = Infinity;
        targets.forEach((target) => {
            const { x: tx, y: ty } = getTargetCenter(target);
            if (ty > y + 80) return;
            const dist = Math.hypot(tx - x, ty - y);
            if (dist < bestDist) {
                best = target;
                bestDist = dist;
            }
        });
        return best;
    };

    const shoot = () => {
        if (GAME.shotTimer > 0) return;
        const buildStats = getPlaneBuildStats();
        const baseX = player.x;
        const baseY = player.y - player.h / 2;
        if (buildStats.meleeMode) {
            createPlaneMeleeSlash(buildStats);
            triggerShake(1.8, 70);
            GAME.shotTimer = Math.max(95, Math.round(player.shootCooldown * 1.08 * buildStats.meleeCooldownMult * buildStats.cooldownMult));
            return;
        }
        if (buildStats.magicMode) {
            firePlaneMagicBurst(buildStats);
            GAME.shotTimer = Math.max(92, Math.round(player.shootCooldown * 1.06 * buildStats.magicCooldownMult * buildStats.cooldownMult));
            return;
        }
        const bulletSpeed = 480 * buildStats.bulletSpeedMult;
        const firePatterns = {
            1: [{ x: 0, y: 0, vx: 0 }],
            2: [{ x: -9, y: 0, vx: 0 }, { x: 9, y: 0, vx: 0 }],
            3: [{ x: 0, y: 0, vx: 0 }, { x: -15, y: 4, vx: -34 }, { x: 15, y: 4, vx: 34 }],
            4: [{ x: -8, y: 0, vx: 0 }, { x: 8, y: 0, vx: 0 }, { x: -20, y: 6, vx: -44 }, { x: 20, y: 6, vx: 44 }],
            5: [{ x: 0, y: 0, vx: 0 }, { x: -12, y: 3, vx: 0 }, { x: 12, y: 3, vx: 0 }, { x: -24, y: 7, vx: -52 }, { x: 24, y: 7, vx: 52 }],
        };
        const pattern = [...(firePatterns[getFireLevel()] || firePatterns[1])];
        for (let i = 0; i < buildStats.extraShots; i += 1) {
            const offset = 30 + i * 9;
            const vx = 68 + i * 12;
            pattern.push({ x: -offset, y: 8 + i * 2, vx: -vx });
            pattern.push({ x: offset, y: 8 + i * 2, vx });
        }
        const damageParts = splitDamagePool(getShotTotalDamage(), pattern.length);

        pattern.forEach((shot, index) => {
            bullets.push({
                x: baseX + shot.x,
                y: baseY + shot.y,
                w: 4,
                h: 14,
                speed: bulletSpeed,
                vx: shot.vx,
                damage: damageParts[index],
                pierce: buildStats.pierce,
                pierceDamageMult: buildStats.pierceDamageMult,
                explosionRadius: buildStats.explosionRadius,
                color: buildStats.pierce > 0 ? '#7df3ff' : '',
            });
        });

        if (buildStats.missileChance > 0 && Math.random() < Math.min(0.85, buildStats.missileChance)) {
            const missileCount = 1 + Math.max(0, Math.floor(buildStats.extraMissiles));
            for (let i = 0; i < missileCount; i += 1) {
                bullets.push({
                    x: baseX + (i - (missileCount - 1) / 2) * 12,
                    y: baseY + 8,
                    w: 7,
                    h: 18,
                    speed: bulletSpeed * 0.84,
                    vx: (i - (missileCount - 1) / 2) * 24,
                    damage: Math.max(1, Math.round(getPlayerDamage() * buildStats.missileDamageMult)),
                    missile: true,
                    missileTurnMult: buildStats.missileTurnMult,
                    explosionRadius: Math.max(34, buildStats.explosionRadius),
                    splashDamageMult: buildStats.missileSplashDamageMult,
                    color: '#ff9d2e',
                });
            }
        }

        if (buildStats.sideShotCount > 0) {
            firePlaneSideShots(baseX, baseY, bulletSpeed, buildStats);
        }

        const droneDamage = getDroneDamage();
        if (GAME.droneCount >= 1) {
            bullets.push({ x: baseX - 28, y: baseY + 10, w: 3, h: 12, speed: bulletSpeed * 0.92, vx: -18, damage: droneDamage });
        }
        if (GAME.droneCount >= 2) {
            bullets.push({ x: baseX + 28, y: baseY + 10, w: 3, h: 12, speed: bulletSpeed * 0.92, vx: 18, damage: droneDamage });
        }
        if (GAME.droneCount >= 3) {
            bullets.push({ x: baseX, y: baseY + 34, w: 4, h: 12, speed: bulletSpeed * 0.82, vx: 0, damage: droneDamage });
        }
        const baseCooldown = GAME.droneCount > 0 ? Math.max(105, player.shootCooldown - 30) : player.shootCooldown;
        GAME.shotTimer = Math.max(72, Math.round(baseCooldown * buildStats.shotCooldownMult * buildStats.cooldownMult));
    };

    const firePlaneAutoMissile = () => {
        if (!player) return;
        const stats = getPlaneBuildStats();
        const count = 1 + Math.max(0, Math.floor(stats.extraMissiles));
        for (let i = 0; i < count; i += 1) {
            bullets.push({
                x: player.x + (i - (count - 1) / 2) * 14,
                y: player.y - player.h / 2 + 8,
                w: 7,
                h: 18,
                speed: 410,
                vx: (i - (count - 1) / 2) * 20,
                damage: Math.max(1, Math.round(getPlayerDamage() * stats.autoMissileDamageMult)),
                missile: true,
                missileTurnMult: stats.missileTurnMult,
                explosionRadius: Math.max(30, stats.explosionRadius),
                splashDamageMult: stats.missileSplashDamageMult,
                color: '#ff9d2e',
            });
        }
    };

    const firePlaneAutoLaser = () => {
        if (!player) return;
        const stats = getPlaneBuildStats();
        bullets.push({
            x: player.x,
            y: player.y - player.h / 2 - 4,
            w: 6,
            h: 26,
            speed: 620,
            vx: 0,
                damage: Math.max(1, Math.round(getPlayerDamage() * stats.autoLaserDamageMult)),
                pierce: Math.max(2, stats.pierce + 1),
                pierceDamageMult: stats.pierceDamageMult,
                color: '#62d2ff',
                spriteId: 'effectBlueLance',
                spriteW: 28,
                spriteH: 48,
            });
    };

    const firePlaneAutoVolley = () => {
        if (!player) return;
        const stats = getPlaneBuildStats();
        const count = Math.max(2, stats.autoVolleyCount || 0);
        const damage = Math.max(1, Math.round(getPlayerDamage() * stats.autoVolleyDamageMult));
        for (let i = 0; i < count; i += 1) {
            const spread = count === 1 ? 0 : (i - (count - 1) / 2) / ((count - 1) / 2);
            bullets.push({
                x: player.x + spread * 18,
                y: player.y - player.h / 2 + Math.abs(spread) * 5,
                w: 3,
                h: 12,
                speed: 500,
                vx: spread * 72,
                damage,
                pierce: 0,
                color: '#ffd25a',
            });
        }
    };

    const firePlaneSideShots = (baseX, baseY, bulletSpeed, stats) => {
        const count = Math.max(0, stats.sideShotCount || 0);
        if (!count) return;
        const damage = Math.max(1, Math.round(getPlayerDamage() * stats.sideShotDamageMult));
        for (let i = 0; i < count; i += 1) {
            const side = i % 2 === 0 ? -1 : 1;
            const rank = Math.floor(i / 2);
            bullets.push({
                x: baseX + side * (22 + rank * 8),
                y: baseY + 6 + rank * 4,
                w: 3,
                h: 11,
                speed: bulletSpeed * 0.9,
                vx: side * (86 + rank * 18),
                damage,
                color: '#ffe08a',
            });
        }
    };

    const firePlaneRearVolley = (stats) => {
        if (!player || stats.rearVolleyCount <= 0) return;
        const count = stats.rearVolleyCount;
        const damage = Math.max(1, Math.round(getPlayerDamage() * stats.rearVolleyDamageMult));
        for (let i = 0; i < count; i += 1) {
            const spread = count === 1 ? 0 : (i - (count - 1) / 2) / ((count - 1) / 2);
            bullets.push({
                x: player.x + spread * 26,
                y: player.y - player.h / 2 + 12,
                w: 3,
                h: 12,
                speed: 460,
                vx: spread * 96,
                damage,
                color: '#ffd25a',
            });
        }
        setPlaneMessage('支援齐射', 620);
    };

    const firePlaneKillVolley = (x, y, stats) => {
        if (!stats.killVolleyCount || Math.random() >= stats.killVolleyChance) return;
        const count = stats.killVolleyCount;
        const damage = Math.max(1, Math.round(getPlayerDamage() * stats.killVolleyDamageMult));
        for (let i = 0; i < count; i += 1) {
            const spread = count === 1 ? 0 : (i - (count - 1) / 2) / ((count - 1) / 2);
            bullets.push({
                x: x + spread * 10,
                y,
                w: 3,
                h: 11,
                speed: 430,
                vx: spread * 120,
                damage,
                color: '#fff2a8',
            });
        }
    };

    const createPlaneMeleeSlash = (stats, source = 'slash') => {
        if (!player) return;
        const radius = Math.max(48, source === 'scythe' ? (stats.scytheRadius || stats.meleeRadius || 86) : (stats.meleeRadius || 72));
        const sourceDamageMult = source === 'scythe'
            ? stats.scytheDamageMult
            : source === 'counter'
                ? stats.meleeCounterSlashDamageMult
                : 1;
        const damage = Math.max(1, Math.round(getPlayerDamage() * (stats.meleeDamageMult || 1) * sourceDamageMult));
        bullets.push({
            x: player.x,
            y: player.y - player.h * 0.25,
            w: radius * 1.75,
            h: radius * 1.25,
            speed: 0,
            vx: 0,
            damage,
            melee: true,
            scythe: source === 'scythe',
            life: source === 'scythe' ? 0.28 : 0.2,
            maxLife: source === 'scythe' ? 0.28 : 0.2,
            pierce: 99,
            explosionRadius: stats.meleeSplashRadius || 0,
            lifeStealRatio: stats.lifeStealRatio || 0,
            meleeBarrierOnHitRatio: stats.meleeBarrierOnHitRatio || 0,
            bossDamageMult: stats.meleeBossDamageMult || 1,
            counter: source === 'counter',
            color: source === 'counter' ? '#fff0a8' : source === 'scythe' ? '#ff6b9d' : '#ffd6e6',
        });
        if (source === 'slash' && stats.meleeWaveDamageMult > 0) firePlaneMeleeWave(stats);
    };

    const firePlaneMeleeWave = (stats, stormIndex = 0, stormCount = 1) => {
        if (!player) return;
        const spread = stormCount <= 1 ? 0 : stormIndex - (stormCount - 1) / 2;
        const damageMult = stormCount <= 1 ? stats.meleeWaveDamageMult : stats.meleeStormDamageMult;
        bullets.push({
            x: player.x + spread * 10,
            y: player.y - player.h / 2 - 6,
            w: stormCount <= 1 ? 12 : 9,
            h: stormCount <= 1 ? 28 : 22,
            speed: stormCount <= 1 ? 540 : 455,
            vx: spread * (stormCount <= 1 ? 84 : 115),
            damage: Math.max(1, Math.round(getPlayerDamage() * damageMult)),
            pierce: Math.max(stormCount <= 1 ? 1 : 0, stats.meleeWavePierce || 0),
            pierceDamageMult: 0.9,
            bladeWave: true,
            color: stormCount <= 1 ? '#ff9bc4' : '#ff5f9f',
        });
    };

    const firePlaneMeleeStorm = (stats) => {
        const count = Math.max(0, stats.meleeStormCount || 0);
        if (count <= 0 || stats.meleeStormDamageMult <= 0) return;
        for (let i = 0; i < count; i += 1) firePlaneMeleeWave(stats, i, count);
        triggerShake(2.6, 120);
        setPlaneMessage('热刃风暴释放', 760);
    };

    const chargePlaneMeleeHeat = (stats) => {
        if (!stats.meleeHeatOnHit || !stats.meleeStormDamageMult || !stats.meleeStormCount) return;
        GAME.meleeHeat += stats.meleeHeatOnHit;
        const heatMax = stats.meleeHeatMax || 100;
        if (GAME.meleeHeat >= heatMax) {
            GAME.meleeHeat = Math.max(0, GAME.meleeHeat - heatMax);
            firePlaneMeleeStorm(stats);
        }
    };

    const createPlaneMagicProjectile = (x, y, vx, stats, damageScale = 1, splashScale = 1) => {
        const crit = stats.magicCritChance > 0 && Math.random() < stats.magicCritChance;
        const damage = Math.max(1, Math.round(getPlayerDamage() * stats.magicDamageMult * damageScale * (crit ? stats.magicCritMult : 1)));
        bullets.push({
            x,
            y,
            w: 9,
            h: 18,
            speed: 430 * stats.bulletSpeedMult,
            vx,
            damage,
            magic: true,
            magicHoming: stats.magicHoming || 0,
            magicSlowChance: stats.magicSlowChance || 0,
            magicChainChance: stats.magicChainChance || 0,
            magicChainDamageMult: stats.magicChainDamageMult || 1,
            explosionRadius: Math.round((stats.magicSplashRadius || 0) * splashScale),
            splashDamageMult: stats.magicSplashDamageMult || 1,
            pierce: stats.pierce,
            pierceDamageMult: stats.pierceDamageMult,
            color: '#d6f75a',
        });
    };

    const firePlaneMagicBurst = (stats) => {
        if (stats.magicBarrierOnCastRatio > 0) addPlaneBarrier(GAME.maxHp * stats.magicBarrierOnCastRatio);
        const count = 1 + Math.max(0, stats.magicExtraProjectiles || 0);
        const damageScale = count <= 1 ? 1 : count === 2 ? 0.64 : 0.5;
        for (let i = 0; i < count; i += 1) {
            const spread = count === 1 ? 0 : (i - (count - 1) / 2);
            createPlaneMagicProjectile(player.x + spread * 13, player.y - player.h / 2 - Math.abs(spread) * 2, spread * 38, stats, damageScale);
        }
    };

    const firePlaneMeteor = () => {
        if (!player) return;
        const stats = getPlaneBuildStats();
        const target = findNearestPlaneTarget(player.x, player.y) || { x: player.x - 20, y: 40, w: 40, h: 40 };
        const tx = target.x + target.w / 2;
        bullets.push({
            x: Math.max(20, Math.min(GAME.width - 20, tx)),
            y: -20,
            w: 16,
            h: 28,
            speed: 520,
            vx: 0,
            damage: Math.max(1, Math.round(getPlayerDamage() * stats.magicDamageMult * stats.meteorDamageMult)),
            magic: true,
            meteor: true,
            explosionRadius: Math.max(36, stats.magicSplashRadius + 22),
            splashDamageMult: Math.max(1, stats.magicSplashDamageMult),
            color: '#ff7a2e',
        });
    };

    const getPlaneSummonTypes = (stats) => {
        const types = [];
        if (stats.summonTurret) types.push('turret');
        if (stats.summonMissile) types.push('missile');
        if (stats.summonLaser) types.push('laser');
        if (stats.summonInterceptor) types.push('interceptor');
        if (stats.summonRailgun) types.push('railgun');
        if (stats.summonRepair) types.push('repair');
        return types.length ? types : ['turret'];
    };

    const spawnPlaneSummon = () => {
        if (!player) return;
        const stats = getPlaneBuildStats();
        if (!stats.summonInterval || stats.summonSlots <= 0) return;
        const maxSlots = stats.summonSlots;
        summons = summons.filter((unit) => unit.life > 0).slice(-(maxSlots - 1));
        const types = getPlaneSummonTypes(stats);
        const type = types[(GAME.frameId + summons.length) % types.length];
        const slot = summons.length;
        const side = slot % 2 === 0 ? -1 : 1;
        summons.push({
            type,
            x: player.x + side * (44 + slot * 12),
            y: player.y + 36 + slot * 6,
            offsetX: side * (44 + slot * 12),
            offsetY: 36 + slot * 6,
            life: 6500 + stats.summonDurationBonus,
            maxLife: 6500 + stats.summonDurationBonus,
            fireTimer: 250,
            cooldown: (type === 'railgun' ? 1420 : type === 'repair' ? 1500 : type === 'laser' ? 1100 : type === 'missile' ? 980 : type === 'interceptor' ? 430 : 520) * stats.summonFireRateMult,
        });
        if (stats.summonDeployBarrierRatio > 0) {
            const gained = addPlaneBarrier(GAME.maxHp * stats.summonDeployBarrierRatio);
            if (gained > 0) requestPlaneHudUpdate();
        }
        setPlaneMessage(
            type === 'railgun' ? '轨道炮挂塔上线'
                : type === 'repair' ? '修复机舱上线'
                    : type === 'interceptor' ? '拦截机翼上线'
                        : type === 'laser' ? '激光发射器上线'
                            : type === 'missile' ? '导弹发射器上线'
                                : '辅助炮台上线',
            760
        );
    };

    const firePlaneSummon = (unit, stats) => {
        const damage = Math.max(1, Math.round(getPlayerDamage() * stats.summonDamageMult));
        if (unit.type === 'repair') {
            if (stats.summonRepairRatio > 0) {
                const gained = addPlaneBarrier(GAME.maxHp * stats.summonRepairRatio);
                if (gained > 0) {
                    addExplosionParticles(unit.x, unit.y, '#62d2ff', 6);
                    requestPlaneHudUpdate();
                }
            }
        } else if (unit.type === 'railgun') {
            bullets.push({
                x: unit.x,
                y: unit.y - 16,
                w: 7,
                h: 32,
                speed: 650,
                vx: 0,
                damage: Math.max(1, Math.round(damage * 1.22)),
                pierce: Math.max(2, stats.pierce + 1),
                pierceDamageMult: Math.max(0.86, stats.pierceDamageMult || 0.9),
                color: '#b7f7ff',
                spriteId: 'effectBlueBeamLance',
                spriteW: 24,
                spriteH: 54,
            });
        } else if (unit.type === 'interceptor') {
            const dir = unit.x < player.x ? -1 : 1;
            bullets.push({
                x: unit.x,
                y: unit.y - 10,
                w: 4,
                h: 13,
                speed: 515,
                vx: dir * 72,
                damage: Math.max(1, Math.round(damage * 0.68)),
                pierce: 1,
                color: '#c2a6ff',
            });
        } else if (unit.type === 'missile') {
            bullets.push({
                x: unit.x,
                y: unit.y - 10,
                w: 7,
                h: 18,
                speed: 380,
                vx: 0,
                damage,
                missile: true,
                missileTurnMult: stats.missileTurnMult,
                explosionRadius: Math.max(26, stats.explosionRadius),
                splashDamageMult: stats.missileSplashDamageMult,
                color: '#ff9d2e',
            });
        } else if (unit.type === 'laser') {
            bullets.push({
                x: unit.x,
                y: unit.y - 14,
                w: 5,
                h: 24,
                speed: 600,
                vx: 0,
                damage: Math.max(1, Math.round(damage * 0.86)),
                pierce: Math.max(1, stats.pierce + 1),
                color: '#62d2ff',
            });
        } else {
            bullets.push({
                x: unit.x,
                y: unit.y - 12,
                w: 4,
                h: 13,
                speed: 470,
                vx: 0,
                damage: Math.max(1, Math.round(damage * 0.74)),
                color: '#9d7cff',
            });
        }
        if (stats.summonLinkVolleyChance > 0 && Math.random() < stats.summonLinkVolleyChance && player) {
            const volleyDamage = Math.max(1, Math.round(getPlayerDamage() * 0.24));
            bullets.push({ x: player.x - 24, y: player.y - player.h / 2 + 6, w: 3, h: 12, speed: 475, vx: -52, damage: volleyDamage, color: '#c2a6ff' });
            bullets.push({ x: player.x + 24, y: player.y - player.h / 2 + 6, w: 3, h: 12, speed: 475, vx: 52, damage: volleyDamage, color: '#c2a6ff' });
        }
    };

    const updatePlaneSummons = (dt, stats) => {
        if (stats.summonInterval > 0) {
            GAME.summonTimer -= dt * 1000;
            if (GAME.summonTimer <= 0) {
                spawnPlaneSummon();
                GAME.summonTimer = stats.summonInterval;
                requestPlaneHudUpdate();
            }
        } else {
            GAME.summonTimer = 0;
            summons = [];
        }

        if (stats.summonBarrierPulseInterval > 0 && stats.summonBarrierPulseRatio > 0 && summons.length > 0) {
            GAME.summonBarrierPulseTimer -= dt * 1000;
            if (GAME.summonBarrierPulseTimer <= 0) {
                const gained = addPlaneBarrier(GAME.maxHp * stats.summonBarrierPulseRatio);
                if (gained > 0) setPlaneMessage(`召唤护盾 +${gained}`, 680);
                GAME.summonBarrierPulseTimer = stats.summonBarrierPulseInterval;
                requestPlaneHudUpdate();
            }
        } else {
            GAME.summonBarrierPulseTimer = 0;
        }

        summons.forEach((unit, index) => {
            unit.life -= dt * 1000;
            const targetX = player.x + unit.offsetX;
            const targetY = player.y + unit.offsetY + Math.sin((GAME.frameId + index * 17) * 0.08) * 4;
            unit.x += (targetX - unit.x) * Math.min(1, dt * 8);
            unit.y += (targetY - unit.y) * Math.min(1, dt * 8);
            unit.fireTimer -= dt * 1000;
            if (unit.fireTimer <= 0) {
                firePlaneSummon(unit, stats);
                unit.fireTimer = unit.cooldown;
            }
        });
        const expired = summons.filter((unit) => unit.life <= 0);
        if (stats.summonExpireExplosionDamageMult > 0) {
            expired.forEach((unit) => {
                const damage = Math.max(1, Math.round(getPlayerDamage() * stats.summonDamageMult * stats.summonExpireExplosionDamageMult));
                applyPlaneSplashDamage(unit.x, unit.y, 52, damage, null, 1);
                addExplosionParticles(unit.x, unit.y, '#9d7cff', 10);
            });
        }
        summons = summons.filter((unit) => unit.life > 0);
    };

    const getBulletRect = (bullet) => ({
        x: bullet.x - bullet.w / 2,
        y: bullet.y - bullet.h / 2,
        w: bullet.w,
        h: bullet.h,
    });

    const getCenteredHitRect = (entity, fallbackW = entity?.w || 0, fallbackH = entity?.h || 0) => {
        const w = entity?.hitW || fallbackW;
        const h = entity?.hitH || fallbackH;
        const cx = (entity?.x || 0) + (entity?.w || w) / 2;
        const cy = (entity?.y || 0) + (entity?.h || h) / 2;
        return { x: cx - w / 2, y: cy - h / 2, w, h };
    };

    const getPlayerHitRect = () => getCenteredHitRect(player, player?.w || 28, player?.h || 32);
    const getBossHitRect = (boss) => {
        const phaseHit = boss?.hitStages?.[getBossPhase(boss)];
        const w = phaseHit?.w || boss?.hitW || boss?.w || 118;
        const h = phaseHit?.h || boss?.hitH || boss?.h || 86;
        const cx = (boss?.x || 0) + (boss?.w || w) / 2;
        const cy = (boss?.y || 0) + (boss?.h || h) / 2;
        return { x: cx - w / 2, y: cy - h / 2, w, h };
    };
    const getTargetCenter = (target) => {
        const rect = target?.bossType ? getBossHitRect(target) : getCenteredHitRect(target, target?.w || 0, target?.h || 0);
        return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
    };

    const rectHit = (a, b) => (
        a.x < b.x + b.w &&
        a.x + a.w > b.x &&
        a.y < b.y + b.h &&
        a.y + a.h > b.y
    );

    const drawBackground = () => {
        const lowPower = isPlaneLowPowerMode();
        const scroll = GAME.backgroundScroll + GAME.score * 0.25;
        const sky = ctx.createLinearGradient(0, 0, 0, GAME.height);
        sky.addColorStop(0, '#050712');
        sky.addColorStop(0.45, '#071020');
        sky.addColorStop(1, '#10121e');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, GAME.width, GAME.height);

        ctx.save();
        ctx.globalAlpha = 0.38;
        for (let i = 0; i < (lowPower ? 12 : 24); i += 1) {
            const x = (i * 97 + Math.sin(i * 13.7) * 40) % GAME.width;
            const y = (i * 149 + scroll * (0.35 + (i % 4) * 0.09)) % GAME.height;
            const size = 1 + (i % 3);
            ctx.fillStyle = i % 5 === 0 ? 'rgba(255,220,130,0.78)' : 'rgba(155,220,255,0.65)';
            ctx.fillRect(x, y, size, size + 2);
        }
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.38;
        const laneW = GAME.width * 0.46;
        const laneX = (GAME.width - laneW) / 2;
        const laneGradient = ctx.createLinearGradient(laneX, 0, laneX + laneW, 0);
        laneGradient.addColorStop(0, 'rgba(0,0,0,0)');
        laneGradient.addColorStop(0.2, 'rgba(44,60,76,0.48)');
        laneGradient.addColorStop(0.5, 'rgba(62,78,94,0.32)');
        laneGradient.addColorStop(0.8, 'rgba(44,60,76,0.48)');
        laneGradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = laneGradient;
        ctx.fillRect(laneX, 0, laneW, GAME.height);
        ctx.strokeStyle = 'rgba(140,200,230,0.18)';
        ctx.lineWidth = 1;
        for (let y = -80 + (scroll % 80); y < GAME.height + 80; y += 80) {
            ctx.beginPath();
            ctx.moveTo(laneX + 20, y);
            ctx.lineTo(laneX + laneW - 20, y + 28);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(GAME.width / 2, y + 12);
            ctx.lineTo(GAME.width / 2, y + 46);
            ctx.stroke();
        }
        ctx.restore();

        if (!lowPower) {
            ctx.save();
            ctx.globalAlpha = 0.18;
            for (let i = 0; i < 6; i += 1) {
                const x = (i % 2 === 0 ? 18 : GAME.width - 88) + Math.sin(i * 2.1 + scroll * 0.008) * 16;
                const y = (i * 92 + scroll * 0.55) % (GAME.height + 120) - 80;
                const g = ctx.createRadialGradient(x, y, 4, x, y, 54);
                g.addColorStop(0, 'rgba(120,160,180,0.55)');
                g.addColorStop(1, 'rgba(15,28,44,0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.ellipse(x, y, 58, 22, Math.sin(i) * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        if (!lowPower) {
            ctx.save();
            ctx.globalAlpha = 0.09;
            ctx.fillStyle = '#ffffff';
            for (let y = 0; y < GAME.height; y += 6) ctx.fillRect(0, y, GAME.width, 1);
            ctx.restore();
        }
    };

    const drawSummons = () => {
        summons.forEach((unit) => {
            ctx.save();
            ctx.translate(unit.x, unit.y);
            const ratio = Math.max(0, Math.min(1, unit.life / unit.maxLife));
            ctx.globalAlpha = 0.42 + ratio * 0.58;
            const color = unit.type === 'laser' ? '#62d2ff'
                : unit.type === 'missile' ? '#ff9d2e'
                    : unit.type === 'railgun' ? '#b7f7ff'
                        : unit.type === 'interceptor' ? '#c2a6ff'
                            : unit.type === 'repair' ? '#73f0c5'
                                : '#9d7cff';
            ctx.shadowColor = color;
            ctx.shadowBlur = 12;
            const body = ctx.createLinearGradient(0, -16, 0, 16);
            body.addColorStop(0, '#f5fbff');
            body.addColorStop(0.32, color);
            body.addColorStop(1, '#121827');
            ctx.fillStyle = body;
            ctx.strokeStyle = 'rgba(245,250,255,0.78)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(-12, -11, 24, 22, 7);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#05080f';
            if (unit.type === 'railgun') {
                ctx.fillRect(-4, -25, 8, 24);
                ctx.fillStyle = '#b7f7ff';
                ctx.fillRect(-1, -30, 2, 12);
            } else if (unit.type === 'repair') {
                ctx.beginPath();
                ctx.arc(0, -12, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#73f0c5';
                ctx.fillRect(-2, -19, 4, 14);
                ctx.fillRect(-7, -14, 14, 4);
            } else if (unit.type === 'interceptor') {
                ctx.beginPath();
                ctx.moveTo(0, -25);
                ctx.lineTo(13, -5);
                ctx.lineTo(0, 1);
                ctx.lineTo(-13, -5);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            } else if (unit.type === 'laser') {
                ctx.fillRect(-3, -22, 6, 20);
                ctx.strokeRect(-3, -22, 6, 20);
            } else if (unit.type === 'missile') {
                [-5, 5].forEach((x) => {
                    ctx.beginPath();
                    ctx.roundRect(x - 3, -21, 6, 18, 3);
                    ctx.fill();
                    ctx.stroke();
                });
            } else {
                ctx.beginPath();
                ctx.roundRect(-4, -22, 8, 19, 4);
                ctx.fill();
                ctx.stroke();
            }
            ctx.fillStyle = color;
            ctx.globalAlpha *= 0.8;
            ctx.fillRect(-10, 13, 20 * ratio, 2);
            ctx.restore();
        });
    };

    const drawPlayer = () => {
        ctx.save();
        const flickering = GAME.invincibleTimer > 0 && Math.floor(Date.now() / 86) % 2 === 0;
        if (flickering) ctx.globalAlpha = 0.42;
        ctx.translate(player.x, player.y);
        ctx.scale(0.92, 0.92);
        const t = Date.now() * 0.008;

        if (GAME.droneCount > 0) {
            const droneSlots = [
                { x: -29, y: 6 },
                { x: 29, y: 6 },
                { x: 0, y: 32 },
            ].slice(0, Math.min(DRONE_MAX_COUNT, GAME.droneCount));
            droneSlots.forEach((slot) => {
                ctx.save();
                ctx.translate(slot.x, slot.y + Math.sin(t + slot.x) * 2);
                ctx.shadowColor = '#6ee7ff';
                ctx.shadowBlur = 8;
                const g = ctx.createLinearGradient(0, -13, 0, 12);
                g.addColorStop(0, '#f5fbff');
                g.addColorStop(0.34, '#4db8ff');
                g.addColorStop(1, '#162a4d');
                ctx.fillStyle = g;
                ctx.strokeStyle = '#d8f2ff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, -13);
                ctx.lineTo(9, 4);
                ctx.lineTo(4, 12);
                ctx.lineTo(0, 8);
                ctx.lineTo(-4, 12);
                ctx.lineTo(-9, 4);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#ffdf6b';
                ctx.fillRect(-2, 5, 4, 8);
                ctx.restore();
            });
        }

        const playerSpriteId = getPlanePlayerSpriteId();
        const playerSprite = planeSpriteImages[playerSpriteId];
        if (playerSprite?.complete && playerSprite.naturalWidth) {
            const flame = 14 + Math.sin(t * 3) * 4;
            [-7, 7].forEach((offset) => {
                const fg = ctx.createLinearGradient(offset, 15, offset, 15 + flame);
                fg.addColorStop(0, '#fff8b8');
                fg.addColorStop(0.28, '#ff9b24');
                fg.addColorStop(1, 'rgba(255,80,0,0)');
                ctx.fillStyle = fg;
                ctx.beginPath();
                ctx.moveTo(offset - 4, 15);
                ctx.lineTo(offset, 15 + flame);
                ctx.lineTo(offset + 4, 15);
                ctx.closePath();
                ctx.fill();
            });

            ctx.save();
            ctx.globalAlpha = 0.24;
            ctx.fillStyle = '#02040a';
            ctx.beginPath();
            ctx.ellipse(0, 11, 25, 9, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            const spriteSize = playerSpriteId === 'playerHeavy' || playerSpriteId === 'playerSummon' || playerSpriteId === 'playerMelee' ? 64 : 58;
            ctx.shadowColor = playerSpriteId === 'playerLaser'
                ? '#62d2ff'
                : playerSpriteId === 'playerSummon'
                    ? '#ff9d2e'
                    : playerSpriteId === 'playerMelee'
                        ? '#62f7ff'
                        : playerSpriteId === 'playerHeavy'
                            ? '#9ef8ff'
                            : '#6ee7ff';
            ctx.shadowBlur = 11;
            const useBoostSheet = playerSpriteId === 'playerStandard' && isPlanePlayerBoostingForward();
            if (!useBoostSheet || !drawPlaneSpriteGridFrame('playerAfterburnerBoost', 0, -1, 66, 68, {
                progress: (Date.now() * 0.012) % 1,
                cols: 4,
                rows: 2,
                glow: '#62d2ff',
                shadowBlur: 13,
            })) {
                ctx.drawImage(playerSprite, -spriteSize / 2, -spriteSize / 2 - 2, spriteSize, spriteSize);
            }

            if (GAME.hitFlashTimer > 0) {
                ctx.strokeStyle = '#ff365a';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#ff365a';
                ctx.shadowBlur = 14;
                ctx.beginPath();
                ctx.arc(0, 0, player.w * 1.24, 0, Math.PI * 2);
                ctx.stroke();
            }
            if (GAME.shieldActive) {
                ctx.strokeStyle = '#61ffb5';
                ctx.lineWidth = 2;
                ctx.shadowColor = '#61ffb5';
                ctx.shadowBlur = 18;
                ctx.beginPath();
                ctx.ellipse(0, 0, 25 + Math.sin(t * 2) * 2, 32, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
            if (GAME.barrierHp > 0 && GAME.barrierMax > 0) {
                const barrierRatio = Math.max(0.22, Math.min(1, GAME.barrierHp / GAME.barrierMax));
                ctx.strokeStyle = `rgba(98,210,255,${0.34 + barrierRatio * 0.38})`;
                ctx.lineWidth = 1.4;
                ctx.shadowColor = '#62d2ff';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.ellipse(0, 0, 29 + Math.sin(t * 1.6) * 1.5, 36, 0, -Math.PI * 0.85, Math.PI * 0.85);
                ctx.stroke();
            }
            ctx.restore();
            return;
        }

        const flame = 14 + Math.sin(t * 3) * 4;
        [-7, 7].forEach((offset) => {
            const fg = ctx.createLinearGradient(offset, 15, offset, 15 + flame);
            fg.addColorStop(0, '#fff8b8');
            fg.addColorStop(0.28, '#ff9b24');
            fg.addColorStop(1, 'rgba(255,80,0,0)');
            ctx.fillStyle = fg;
            ctx.beginPath();
            ctx.moveTo(offset - 4, 15);
            ctx.lineTo(offset, 15 + flame);
            ctx.lineTo(offset + 4, 15);
            ctx.closePath();
            ctx.fill();
        });

        ctx.shadowColor = 'rgba(70,190,255,0.72)';
        ctx.shadowBlur = 10;
        const wing = ctx.createLinearGradient(-27, -9, 27, 12);
        wing.addColorStop(0, '#1c2c46');
        wing.addColorStop(0.22, '#7f95ad');
        wing.addColorStop(0.5, '#d8e5f0');
        wing.addColorStop(0.78, '#758ca7');
        wing.addColorStop(1, '#18283f');
        ctx.fillStyle = wing;
        ctx.strokeStyle = '#f2fbff';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(0, -23);
        ctx.lineTo(14, -8);
        ctx.lineTo(27, 10);
        ctx.lineTo(15, 15);
        ctx.lineTo(7, 6);
        ctx.lineTo(5, 20);
        ctx.lineTo(0, 17);
        ctx.lineTo(-5, 20);
        ctx.lineTo(-7, 6);
        ctx.lineTo(-15, 15);
        ctx.lineTo(-27, 10);
        ctx.lineTo(-14, -8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        const body = ctx.createLinearGradient(0, -27, 0, 23);
        body.addColorStop(0, '#ffffff');
        body.addColorStop(0.18, '#bdefff');
        body.addColorStop(0.42, '#2ba8ff');
        body.addColorStop(0.72, '#174c8f');
        body.addColorStop(1, '#0c1832');
        ctx.fillStyle = body;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(0, -28);
        ctx.lineTo(9, -11);
        ctx.lineTo(11, 11);
        ctx.lineTo(4, 23);
        ctx.lineTo(0, 27);
        ctx.lineTo(-4, 23);
        ctx.lineTo(-11, 11);
        ctx.lineTo(-9, -11);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 4;
        ctx.fillStyle = '#061427';
        ctx.beginPath();
        ctx.ellipse(0, -12, 4.4, 8.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#9ef8ff';
        ctx.globalAlpha *= 0.86;
        ctx.beginPath();
        ctx.ellipse(0, -15, 2.2, 4.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = flickering ? 0.42 : 1;
        ctx.strokeStyle = '#eaf7ff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -24);
        ctx.lineTo(0, 18);
        ctx.stroke();
        [-13, 13].forEach((x) => {
            ctx.fillStyle = '#0b1020';
            ctx.fillRect(x - 1.5, -9, 3, 20);
            ctx.fillStyle = '#ffd25a';
            ctx.fillRect(x - 1, -13, 2, 5);
        });

        if (GAME.hitFlashTimer > 0) {
            ctx.strokeStyle = '#ff365a';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#ff365a';
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(0, 0, player.w * 1.24, 0, Math.PI * 2);
            ctx.stroke();
        }
        if (GAME.shieldActive) {
            ctx.strokeStyle = '#61ffb5';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#61ffb5';
            ctx.shadowBlur = 18;
            ctx.beginPath();
            ctx.ellipse(0, 0, 25 + Math.sin(t * 2) * 2, 32, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        if (GAME.barrierHp > 0 && GAME.barrierMax > 0) {
            const barrierRatio = Math.max(0.22, Math.min(1, GAME.barrierHp / GAME.barrierMax));
            ctx.strokeStyle = `rgba(98,210,255,${0.34 + barrierRatio * 0.38})`;
            ctx.lineWidth = 1.4;
            ctx.shadowColor = '#62d2ff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.ellipse(0, 0, 29 + Math.sin(t * 1.6) * 1.5, 36, 0, -Math.PI * 0.85, Math.PI * 0.85);
            ctx.stroke();
        }

        ctx.restore();
    };

    const drawBullets = () => {
        bullets.forEach((bullet) => {
            ctx.save();
            if (bullet.bladeWave) {
                const progress = (Date.now() * 0.014) % 1;
                ctx.translate(bullet.x, bullet.y);
                ctx.rotate(Math.atan2(bullet.vx || 0, -(bullet.speed || 1)) * 0.32);
                if (drawPlaneSpriteFrame('effectCyanWave', 0, 0, 30, 42, {
                    progress,
                    glow: bullet.color || '#ff9bc4',
                    shadowBlur: 18,
                })) {
                    ctx.restore();
                    return;
                }
                ctx.shadowColor = bullet.color || '#ff9bc4';
                ctx.shadowBlur = 18;
                const wave = ctx.createLinearGradient(0, 16, 0, -22);
                wave.addColorStop(0, 'rgba(255,255,255,0)');
                wave.addColorStop(0.45, bullet.color || '#ff9bc4');
                wave.addColorStop(1, '#fff7fb');
                ctx.fillStyle = wave;
                ctx.beginPath();
                ctx.moveTo(0, -24);
                ctx.lineTo(8, 15);
                ctx.lineTo(0, 10);
                ctx.lineTo(-8, 15);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                return;
            }
            if (bullet.melee) {
                const lifeRatio = bullet.maxLife ? Math.max(0, bullet.life / bullet.maxLife) : 1;
                const radius = Math.max(bullet.w, bullet.h) * 0.46;
                ctx.translate(bullet.x, bullet.y);
                ctx.globalAlpha = 0.34 + lifeRatio * 0.55;
                const slashSprite = bullet.scythe ? 'effectCyanScythe' : 'effectCyanWave';
                if (drawPlaneSpriteFrame(slashSprite, 0, 0, radius * 1.95, radius * 1.22, {
                    progress: 1 - lifeRatio,
                    glow: bullet.scythe ? '#ff2d78' : '#7df3ff',
                    shadowBlur: 18,
                })) {
                    ctx.restore();
                    return;
                }
                ctx.strokeStyle = bullet.scythe ? '#ff6b9d' : '#ffd6e6';
                ctx.lineWidth = bullet.scythe ? 8 : 6;
                ctx.shadowColor = bullet.scythe ? '#ff2d78' : '#ff9bc4';
                ctx.shadowBlur = 18;
                ctx.beginPath();
                ctx.arc(0, 0, radius, Math.PI * 1.08, Math.PI * 1.92);
                ctx.stroke();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, radius * 0.82, Math.PI * 1.16, Math.PI * 1.84);
                ctx.stroke();
                ctx.restore();
                return;
            }
            if (bullet.magic) {
                const color = bullet.meteor ? '#ff7a2e' : bullet.color || '#d6f75a';
                ctx.translate(bullet.x, bullet.y);
                const progress = (Date.now() * (bullet.meteor ? 0.008 : 0.012)) % 1;
                const spriteId = bullet.meteor ? 'effectMeteorExplosion' : bullet.magicSlowChance > 0 ? 'effectIceBurst' : 'effectArcaneOrb';
                if (drawPlaneSpriteFrame(spriteId, 0, 0, bullet.meteor ? 38 : 28, bullet.meteor ? 38 : 28, {
                    progress,
                    glow: color,
                    shadowBlur: bullet.meteor ? 22 : 16,
                })) {
                    ctx.restore();
                    return;
                }
                ctx.shadowColor = color;
                ctx.shadowBlur = bullet.meteor ? 22 : 16;
                const orb = ctx.createRadialGradient(0, 0, 1, 0, 0, bullet.meteor ? 13 : 8);
                orb.addColorStop(0, '#ffffff');
                orb.addColorStop(0.35, color);
                orb.addColorStop(1, 'rgba(20,24,38,0.25)');
                ctx.fillStyle = orb;
                ctx.beginPath();
                ctx.arc(0, 0, bullet.meteor ? 12 : 7, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, bullet.meteor ? 16 : 10, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
                return;
            }
            if (bullet.missile && drawPlaneSpriteFrame('effectMissileFlame', bullet.x, bullet.y, 22, 34, {
                progress: (Date.now() * 0.014) % 1,
                glow: '#ff9d2e',
                shadowBlur: 16,
            })) {
                ctx.restore();
                return;
            }
            if (bullet.burst && drawPlaneSpriteFrame('effectGoldSpark', bullet.x, bullet.y, 24, 24, {
                progress: (Date.now() * 0.018) % 1,
                glow: '#fff7a8',
                shadowBlur: 14,
            })) {
                ctx.restore();
                return;
            }
            if (bullet.spriteId && drawPlaneSpriteFrame(bullet.spriteId, bullet.x, bullet.y, bullet.spriteW || 24, bullet.spriteH || 36, {
                progress: (Date.now() * 0.012) % 1,
                glow: bullet.color || '#62d2ff',
                shadowBlur: 16,
            })) {
                ctx.restore();
                return;
            }
            if ((bullet.pierce || 0) > 0 && drawPlaneSpriteFrame('effectBlueBeamLance', bullet.x, bullet.y, 18, 40, {
                progress: (Date.now() * 0.012) % 1,
                glow: bullet.color || '#62d2ff',
                shadowBlur: 14,
            })) {
                ctx.restore();
                return;
            }
            const core = bullet.missile ? '#fff4c0' : bullet.burst ? '#fff7a8' : bullet.color || '#fff3a0';
            const glow = bullet.missile ? '#ff9d2e' : bullet.burst ? '#7df3ff' : bullet.color || '#ffd25a';
            ctx.shadowColor = glow;
            ctx.shadowBlur = bullet.missile ? 16 : bullet.burst ? 14 : 10;
            const trail = ctx.createLinearGradient(bullet.x, bullet.y + bullet.h, bullet.x, bullet.y - bullet.h);
            trail.addColorStop(0, 'rgba(255,210,90,0)');
            trail.addColorStop(0.35, glow);
            trail.addColorStop(1, '#ffffff');
            ctx.fillStyle = trail;
            ctx.beginPath();
            ctx.roundRect(bullet.x - bullet.w / 2, bullet.y - bullet.h / 2, bullet.w, bullet.h + (bullet.missile ? 12 : 8), 3);
            ctx.fill();
            ctx.fillStyle = core;
            ctx.fillRect(bullet.x - 1, bullet.y - bullet.h / 2, 2, bullet.h * 0.7);
            if (bullet.missile) {
                ctx.fillStyle = '#101827';
                ctx.fillRect(bullet.x - bullet.w / 2, bullet.y - 2, bullet.w, 5);
            }
            ctx.restore();
        });

        enemyBullets.forEach((b) => {
            ctx.save();
            const color = b.color || '#ff365a';
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 14;
            ctx.beginPath();
            const size = b.size || 5;
            const enemySpriteId = b.shape === 'diamond' ? 'effectPurpleDiamond' : 'effectArcaneGem';
            if (drawPlaneSpriteFrame(enemySpriteId, b.x, b.y, size * 4.2, size * 4.2, {
                progress: (Date.now() * 0.012 + b.x * 0.001) % 1,
                glow: color,
                shadowBlur: 14,
            })) {
                ctx.restore();
                return;
            }
            if (b.shape === 'diamond') {
                ctx.moveTo(b.x, b.y - size);
                ctx.lineTo(b.x + size, b.y);
                ctx.lineTo(b.x, b.y + size);
                ctx.lineTo(b.x - size, b.y);
                ctx.closePath();
            } else {
                ctx.arc(b.x, b.y, size, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.globalAlpha = 0.55;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.globalAlpha = 1;
            const tail = ctx.createLinearGradient(b.x, b.y - size * 3, b.x, b.y + size * 3);
            tail.addColorStop(0, 'rgba(255,255,255,0)');
            tail.addColorStop(1, color);
            ctx.strokeStyle = tail;
            ctx.lineWidth = Math.max(2, size * 0.55);
            ctx.beginPath();
            ctx.moveTo(b.x, b.y - Math.sign(b.vy || 1) * size * 2.2);
            ctx.lineTo(b.x - (b.vx || 0) * 0.02, b.y - (b.vy || 0) * 0.035);
            ctx.stroke();
            ctx.restore();
        });
    };

    const drawEnemies = () => {
        enemies.forEach((enemy) => {
            ctx.save();
            ctx.translate(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2);
            const t = Date.now() * 0.004 + enemy.x * 0.01;
            const r = enemy.w / 2;
            const hpRatio = enemy.maxHp ? Math.max(0, enemy.hp / enemy.maxHp) : 1;
            const core = enemy.color;
            ctx.shadowColor = core;
            ctx.shadowBlur = 9;
            ctx.strokeStyle = 'rgba(235,245,255,0.82)';
            ctx.lineWidth = 1;

            if (enemy.elite) {
                ctx.save();
                ctx.globalAlpha = 0.7 + Math.sin(t * 5) * 0.18;
                ctx.strokeStyle = '#ffd25a';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, r + 5, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            const metal = ctx.createLinearGradient(-r, -r, r, r);
            metal.addColorStop(0, '#121722');
            metal.addColorStop(0.24, '#63758c');
            metal.addColorStop(0.5, '#d5e1eb');
            metal.addColorStop(0.76, core);
            metal.addColorStop(1, '#141827');
            ctx.fillStyle = metal;

            const drawCanopy = (x, y, w, h, color = '#ff365a') => {
                ctx.save();
                ctx.shadowColor = color;
                ctx.shadowBlur = 8;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.ellipse(x, y, w, h, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.72)';
                ctx.beginPath();
                ctx.ellipse(x - w * 0.28, y - h * 0.28, w * 0.25, h * 0.35, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            };

            const drawEnemyShadow = () => {
                ctx.save();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 0.22;
                ctx.fillStyle = '#02040a';
                ctx.beginPath();
                ctx.ellipse(0, r * 0.5, r * 1.25, r * 0.34, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            };

            const drawEngineFlame = (x, y, scale = 1, color = core) => {
                const pulse = 1 + Math.sin(t * 7 + x) * 0.18;
                const flame = ctx.createLinearGradient(x, y - 2 * scale, x, y - 18 * scale * pulse);
                flame.addColorStop(0, '#fff7b0');
                flame.addColorStop(0.38, color);
                flame.addColorStop(1, 'rgba(255,80,0,0)');
                ctx.save();
                ctx.shadowColor = color;
                ctx.shadowBlur = 8;
                ctx.fillStyle = flame;
                ctx.beginPath();
                ctx.moveTo(x - 4.5 * scale, y);
                ctx.quadraticCurveTo(x, y - 18 * scale * pulse, x + 4.5 * scale, y);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            };

            const drawPanelLines = (span = r * 0.62, height = r * 1.45) => {
                ctx.save();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = 'rgba(255,255,255,0.26)';
                ctx.lineWidth = 1;
                [-span, span].forEach((x) => {
                    ctx.beginPath();
                    ctx.moveTo(x * 0.45, -height * 0.42);
                    ctx.lineTo(x, height * 0.34);
                    ctx.stroke();
                });
                ctx.strokeStyle = 'rgba(0,0,0,0.34)';
                ctx.beginPath();
                ctx.moveTo(0, -height * 0.52);
                ctx.lineTo(0, height * 0.48);
                ctx.stroke();
                ctx.restore();
            };

            const drawWingPanels = (spread = r + 2, y = 0, color = core) => {
                ctx.save();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = 'rgba(245,250,255,0.46)';
                ctx.fillStyle = 'rgba(5,9,18,0.54)';
                ctx.lineWidth = 1;
                [-1, 1].forEach((side) => {
                    ctx.beginPath();
                    ctx.roundRect(side * spread - side * 10, y - 5, 10, 16, 4);
                    ctx.fill();
                    ctx.stroke();
                    ctx.fillStyle = color;
                    ctx.globalAlpha = 0.72;
                    ctx.beginPath();
                    ctx.arc(side * (spread - 5), y + 8, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = 'rgba(5,9,18,0.54)';
                });
                ctx.restore();
            };

            const drawWeaponPods = (spread = r * 0.72, y = r * 0.25, scale = 1, color = core) => {
                ctx.save();
                ctx.shadowBlur = 0;
                [-spread, spread].forEach((x) => {
                    const pod = ctx.createLinearGradient(x - 4 * scale, y - 9 * scale, x + 4 * scale, y + 10 * scale);
                    pod.addColorStop(0, '#4b5565');
                    pod.addColorStop(0.5, '#090d15');
                    pod.addColorStop(1, color);
                    ctx.fillStyle = pod;
                    ctx.strokeStyle = 'rgba(255,255,255,0.38)';
                    ctx.beginPath();
                    ctx.roundRect(x - 4 * scale, y - 9 * scale, 8 * scale, 20 * scale, 3 * scale);
                    ctx.fill();
                    ctx.stroke();
                    ctx.fillStyle = '#05070c';
                    ctx.beginPath();
                    ctx.arc(x, y + 11 * scale, 3.2 * scale, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.restore();
            };

            const drawDamageMarks = () => {
                if (hpRatio > 0.7) return;
                ctx.save();
                ctx.shadowBlur = 0;
                ctx.strokeStyle = hpRatio > 0.35 ? 'rgba(30,35,45,0.7)' : 'rgba(255,90,60,0.78)';
                ctx.lineWidth = 1.2;
                const cracks = hpRatio > 0.35 ? [[-r * 0.45, -2, -r * 0.18, 4], [r * 0.26, -r * 0.3, r * 0.46, -r * 0.05]] : [[-r * 0.48, -3, -r * 0.08, 7], [r * 0.18, -r * 0.42, r * 0.5, 0], [-r * 0.2, r * 0.26, r * 0.14, r * 0.38]];
                cracks.forEach(([x1, y1, x2, y2], idx) => {
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo((x1 + x2) / 2 + Math.sin(t + idx) * 2, (y1 + y2) / 2);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                });
                if (hpRatio <= 0.35) {
                    ctx.fillStyle = 'rgba(30,30,30,0.28)';
                    ctx.beginPath();
                    ctx.ellipse(r * 0.35, -r * 0.55 - Math.sin(t * 2) * 2, 8, 3, -0.35, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            };

            drawEnemyShadow();

            if (enemy.type === 'fast') {
                ctx.rotate(Math.sin(t) * 0.08);
                drawEngineFlame(-5, -r + 1, 0.7, '#ffec7a');
                drawEngineFlame(5, -r + 1, 0.7, '#ffec7a');
                ctx.beginPath();
                ctx.moveTo(0, r + 8);
                ctx.lineTo(r + 7, -4);
                ctx.lineTo(7, -r - 7);
                ctx.lineTo(0, -r + 1);
                ctx.lineTo(-7, -r - 7);
                ctx.lineTo(-r - 7, -4);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                drawPanelLines(r * 0.42, r * 1.5);
                drawCanopy(0, -4, 4, 7, '#ffec7a');
            } else if (enemy.type === 'sine') {
                ctx.rotate(Math.sin(t * 1.7) * 0.18);
                drawEngineFlame(0, -r + 1, 0.85, '#4fd4ff');
                ctx.beginPath();
                ctx.moveTo(0, r + 6);
                ctx.lineTo(r + 8, 4);
                ctx.lineTo(r * 0.42, -r + 4);
                ctx.lineTo(0, -r - 4);
                ctx.lineTo(-r * 0.42, -r + 4);
                ctx.lineTo(-r - 8, 4);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = 'rgba(20,30,45,0.75)';
                ctx.fillRect(-3, -r + 5, 6, r * 1.6);
                drawWingPanels(r + 4, 3, '#4fd4ff');
                drawPanelLines(r * 0.5, r * 1.45);
                drawCanopy(0, -5, 5, 6, '#4fd4ff');
            } else if (enemy.type === 'tank') {
                drawEngineFlame(-r * 0.44, -r + 4, 0.75, '#ff9d2e');
                drawEngineFlame(r * 0.44, -r + 4, 0.75, '#ff9d2e');
                ctx.beginPath();
                ctx.roundRect(-r - 4, -r + 2, r * 2 + 8, r * 2 - 2, 10);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = 'rgba(255,255,255,0.16)';
                [-r * 0.45, 0, r * 0.45].forEach((x) => {
                    ctx.beginPath();
                    ctx.roundRect(x - 6, -r + 10, 12, r * 1.15, 4);
                    ctx.fill();
                });
                ctx.fillStyle = '#1a1f2a';
                ctx.beginPath();
                ctx.roundRect(-r * 0.58, -r - 6, r * 1.16, r * 0.9, 6);
                ctx.fill();
                ctx.stroke();
                [-r * 0.55, r * 0.55].forEach((x) => {
                    ctx.fillStyle = '#0b0f18';
                    ctx.fillRect(x - 3, -r - 10, 6, 16);
                });
                drawWeaponPods(r * 0.66, r * 0.34, 0.9, '#ff9d2e');
                drawCanopy(0, 2, 7, 6, '#ff9d2e');
            } else if (enemy.type === 'shooter') {
                drawEngineFlame(-r * 0.36, -r + 2, 0.75, '#ff365a');
                drawEngineFlame(r * 0.36, -r + 2, 0.75, '#ff365a');
                ctx.beginPath();
                ctx.moveTo(0, r + 9);
                ctx.lineTo(r + 9, 2);
                ctx.lineTo(r * 0.72, -r + 3);
                ctx.lineTo(0, -r - 8);
                ctx.lineTo(-r * 0.72, -r + 3);
                ctx.lineTo(-r - 9, 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#080b12';
                ctx.beginPath();
                ctx.roundRect(-4, -r - 4, 8, r + 13, 4);
                ctx.fill();
                drawWeaponPods(r * 0.78, r * 0.34, 0.86, '#ff365a');
                drawPanelLines(r * 0.58, r * 1.55);
                drawCanopy(0, -2, 7, 7, '#ff365a');
            } else {
                const medium = enemy.type === 'medium';
                drawEngineFlame(0, -r + 1, medium ? 0.9 : 0.68, medium ? '#ff9d2e' : '#ff365a');
                ctx.beginPath();
                ctx.moveTo(0, r + (medium ? 8 : 5));
                ctx.lineTo(r + (medium ? 8 : 4), 4);
                ctx.lineTo(r * 0.55, -r + 3);
                ctx.lineTo(0, -r - (medium ? 8 : 5));
                ctx.lineTo(-r * 0.55, -r + 3);
                ctx.lineTo(-r - (medium ? 8 : 4), 4);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = 'rgba(10,14,24,0.62)';
                ctx.fillRect(-2, -r + 4, 4, r * 1.6);
                drawPanelLines(medium ? r * 0.58 : r * 0.42, r * 1.42);
                if (medium) drawWeaponPods(r * 0.68, r * 0.32, 0.72, '#ff9d2e');
                drawCanopy(0, -4, medium ? 6 : 4, medium ? 7 : 5, medium ? '#ff9d2e' : '#ff365a');
            }
            drawDamageMarks();

            if (hpRatio < 0.98) {
                ctx.shadowBlur = 0;
                ctx.fillStyle = 'rgba(0,0,0,0.45)';
                ctx.fillRect(-r, r + 8, r * 2, 3);
                ctx.fillStyle = hpRatio > 0.4 ? '#00ff88' : '#ff3366';
                ctx.fillRect(-r, r + 8, r * 2 * hpRatio, 3);
            }
            ctx.restore();
        });
    };

    const getBossImageId = (boss) => {
        if (!boss) return '';
        const phase = getBossPhase(boss);
        return boss.imageStages?.[phase] || boss.imageStages?.[1] || boss.imageId || '';
    };

    const getBossVisualBox = (boss) => {
        const phase = getBossPhase(boss);
        return boss.imageVisuals?.[phase] || {
            w: boss.visualW || boss.w,
            h: boss.visualH || boss.h,
            y: 0,
        };
    };

    const drawBossHealthBar = (boss) => {
        const barWidth = GAME.width * 0.78;
        const barHeight = 11;
        const barX = (GAME.width - barWidth) / 2;
        const barY = 14;
        ctx.fillStyle = '#333340';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        const hpRatio = Math.max(0, boss.hp / boss.maxHp);
        const hpColor = hpRatio > 0.5 ? boss.accent || '#ff3366' : '#ffaa00';
        ctx.fillStyle = hpColor;
        ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        const lifeText = boss.isFinalBoss ? `  L${boss.finalLife || 1}` : '';
        ctx.fillText(`${boss.bossName || '首领'}${lifeText}  P${getBossPhase(boss)}  ${boss.hp}/${boss.maxHp}`, GAME.width / 2, barY + barHeight - 1);
    };

    const drawBossSprite = (boss, t, bossHpRatio) => {
        const img = planeBossImages[getBossImageId(boss)];
        if (!img) return false;

        const visual = getBossVisualBox(boss);
        const maxW = visual.w || boss.w;
        const maxH = visual.h || boss.h;
        const aspect = (img.naturalWidth || img.width || 1) / Math.max(1, img.naturalHeight || img.height || 1);
        let drawW = maxW;
        let drawH = drawW / aspect;
        if (drawH > maxH) {
            drawH = maxH;
            drawW = drawH * aspect;
        }
        const pulse = 1 + Math.sin(t * 1.8) * (boss.isFinalBoss ? 0.018 : 0.012);
        drawW *= pulse;
        drawH *= pulse;
        const offsetY = visual.y || 0;

        ctx.save();
        ctx.translate(boss.x + boss.w / 2, boss.y + boss.h / 2);
        ctx.save();
        ctx.globalAlpha = boss.isFinalBoss ? 0.34 : 0.26;
        ctx.fillStyle = boss.accent || '#ff365a';
        ctx.beginPath();
        ctx.ellipse(0, boss.h * 0.34, drawW * 0.45, Math.max(12, drawH * 0.12), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.shadowColor = boss.accent || '#ff365a';
        ctx.shadowBlur = boss.isFinalBoss ? 30 : 20;
        ctx.globalAlpha = (boss.phaseTransitionTimer || 0) > 0 ? 0.72 + Math.sin(t * 15) * 0.18 : 1;
        ctx.drawImage(img, -drawW / 2, -drawH / 2 + offsetY, drawW, drawH);

        if (bossHpRatio <= 0.35) {
            ctx.save();
            ctx.shadowColor = '#ff6b35';
            ctx.shadowBlur = 12;
            ctx.strokeStyle = 'rgba(255,116,64,0.82)';
            ctx.lineWidth = boss.isFinalBoss ? 2.4 : 1.8;
            const sparks = boss.isFinalBoss
                ? [[-drawW * 0.25, -drawH * 0.18, -drawW * 0.08, drawH * 0.03], [drawW * 0.18, -drawH * 0.28, drawW * 0.34, -drawH * 0.02], [-drawW * 0.08, drawH * 0.22, drawW * 0.16, drawH * 0.34]]
                : [[-drawW * 0.2, -drawH * 0.12, -drawW * 0.02, drawH * 0.06], [drawW * 0.16, -drawH * 0.2, drawW * 0.28, 0]];
            sparks.forEach(([x1, y1, x2, y2], index) => {
                ctx.beginPath();
                ctx.moveTo(x1, y1 + offsetY);
                ctx.lineTo((x1 + x2) / 2 + Math.sin(t * 3 + index) * 4, (y1 + y2) / 2 + offsetY);
                ctx.lineTo(x2, y2 + offsetY);
                ctx.stroke();
            });
            ctx.restore();
        }

        ctx.restore();
        return true;
    };

    const drawBoss = () => {
        if (!GAME.boss) return;
        const boss = GAME.boss;
        const t = Date.now() * 0.004;
        const bossHpRatio = boss.maxHp ? Math.max(0, boss.hp / boss.maxHp) : 1;
        if (drawBossSprite(boss, t, bossHpRatio)) {
            drawBossHealthBar(boss);
            return;
        }
        ctx.save();
        ctx.translate(boss.x + boss.w / 2, boss.y + boss.h / 2);
        ctx.shadowColor = boss.accent || '#ff365a';
        ctx.shadowBlur = 20;

        const metal = ctx.createLinearGradient(-boss.w / 2, -boss.h / 2, boss.w / 2, boss.h / 2);
        metal.addColorStop(0, '#101521');
        metal.addColorStop(0.18, '#6c7788');
        metal.addColorStop(0.42, boss.color || '#8b2d3b');
        metal.addColorStop(0.72, '#d9e3ed');
        metal.addColorStop(1, '#121622');

        const outline = () => {
            ctx.strokeStyle = 'rgba(245,250,255,0.82)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        };

        const drawCore = (x = 0, y = 0, size = 14, color = boss.accent || '#ff365a') => {
            ctx.save();
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            ctx.fillStyle = '#fff9c9';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x, y, size * 0.48 + Math.sin(t * 4) * 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        };

        const drawTurret = (x, y, angle = Math.PI / 2, scale = 1, color = boss.accent || '#ff365a') => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.shadowColor = color;
            ctx.shadowBlur = 12;
            const base = ctx.createLinearGradient(-8 * scale, -8 * scale, 8 * scale, 8 * scale);
            base.addColorStop(0, '#4b5566');
            base.addColorStop(0.5, '#111722');
            base.addColorStop(1, '#05080f');
            ctx.fillStyle = base;
            ctx.beginPath();
            ctx.roundRect(-7 * scale, -7 * scale, 14 * scale, 14 * scale, 5 * scale);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.72)';
            ctx.stroke();
            const barrel = ctx.createLinearGradient(-3 * scale, -3 * scale, 3 * scale, 22 * scale);
            barrel.addColorStop(0, '#d9e3ed');
            barrel.addColorStop(0.4, color);
            barrel.addColorStop(1, '#080b12');
            ctx.fillStyle = barrel;
            ctx.beginPath();
            ctx.roundRect(-2.5 * scale, -3 * scale, 5 * scale, 22 * scale, 3 * scale);
            ctx.fill();
            ctx.fillStyle = '#02040a';
            ctx.beginPath();
            ctx.arc(0, 19 * scale, 3.6 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5 * scale;
            ctx.stroke();
            ctx.restore();
        };

        const drawEngine = (x, y, scale = 1) => {
            const flame = ctx.createLinearGradient(x, y, x, y + 24 * scale);
            flame.addColorStop(0, '#fff8b8');
            flame.addColorStop(0.35, boss.accent || '#ff9d2e');
            flame.addColorStop(1, 'rgba(255,80,0,0)');
            ctx.fillStyle = flame;
            ctx.beginPath();
            ctx.moveTo(x - 6 * scale, y);
            ctx.lineTo(x, y + (18 + Math.sin(t * 6 + x) * 5) * scale);
            ctx.lineTo(x + 6 * scale, y);
            ctx.closePath();
            ctx.fill();
            ctx.save();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#05080f';
            ctx.strokeStyle = 'rgba(255,255,255,0.42)';
            ctx.beginPath();
            ctx.roundRect(x - 9 * scale, y - 7 * scale, 18 * scale, 9 * scale, 4 * scale);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = boss.accent || '#ff9d2e';
            ctx.globalAlpha = 0.52 + Math.sin(t * 8 + x) * 0.18;
            ctx.fillRect(x - 5 * scale, y - 4 * scale, 10 * scale, 2 * scale);
            ctx.restore();
        };

        const drawMissilePod = (x, y, scale = 1) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.shadowColor = '#ff365a';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#0b0f18';
            ctx.strokeStyle = 'rgba(240,245,255,0.76)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(-11 * scale, -16 * scale, 22 * scale, 32 * scale, 6 * scale);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = 'rgba(255,255,255,0.18)';
            ctx.fillRect(-7 * scale, -12 * scale, 14 * scale, 3 * scale);
            for (let row = -1; row <= 1; row += 1) {
                for (let col = -1; col <= 1; col += 2) {
                    ctx.fillStyle = '#ff365a';
                    ctx.beginPath();
                    ctx.arc(col * 4.6 * scale, row * 7 * scale, 2.4 * scale, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();
        };

        const drawMechJoint = (x, y, size = 8, color = boss.accent || '#ff365a') => {
            ctx.save();
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            const joint = ctx.createRadialGradient(x, y, 2, x, y, size);
            joint.addColorStop(0, '#f4fbff');
            joint.addColorStop(0.4, color);
            joint.addColorStop(1, '#05080f');
            ctx.fillStyle = joint;
            ctx.strokeStyle = 'rgba(245,250,255,0.58)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        };

        const drawMechShoulder = (side, y = -10, scale = 1, color = boss.accent || '#ff365a') => {
            const x = side * (boss.w / 2 - 10 * scale);
            ctx.save();
            ctx.shadowColor = color;
            ctx.shadowBlur = 12;
            const armor = ctx.createLinearGradient(x - side * 30 * scale, y - 16 * scale, x + side * 18 * scale, y + 20 * scale);
            armor.addColorStop(0, '#eef6ff');
            armor.addColorStop(0.18, '#5d6878');
            armor.addColorStop(0.58, '#111722');
            armor.addColorStop(1, color);
            ctx.fillStyle = armor;
            ctx.strokeStyle = 'rgba(245,250,255,0.72)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(x - side * 4 * scale, y - 22 * scale);
            ctx.lineTo(x + side * 28 * scale, y - 10 * scale);
            ctx.lineTo(x + side * 24 * scale, y + 20 * scale);
            ctx.lineTo(x - side * 10 * scale, y + 28 * scale);
            ctx.lineTo(x - side * 20 * scale, y + 6 * scale);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = 'rgba(5,8,14,0.78)';
            ctx.beginPath();
            ctx.roundRect(x + side * 2 * scale - 8 * scale, y - 6 * scale, 16 * scale, 24 * scale, 5 * scale);
            ctx.fill();
            drawMechJoint(x + side * 9 * scale, y + 8 * scale, 6 * scale, color);
            ctx.restore();
        };

        const drawMechArm = (side, y = 18, scale = 1, color = boss.accent || '#ff365a') => {
            const x = side * (boss.w / 2 + 6 * scale);
            ctx.save();
            ctx.shadowColor = color;
            ctx.shadowBlur = 9;
            ctx.fillStyle = '#0a0f1a';
            ctx.strokeStyle = 'rgba(245,250,255,0.58)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(x - side * 8 * scale - 7 * scale, y - 18 * scale, 14 * scale, 34 * scale, 6 * scale);
            ctx.fill();
            ctx.stroke();
            drawMechJoint(x - side * 2 * scale, y - 15 * scale, 5 * scale, color);
            const barrelX = x - side * 3 * scale;
            const barrelY = y + 6 * scale;
            const barrel = ctx.createLinearGradient(barrelX - 5 * scale, barrelY - 4 * scale, barrelX + 5 * scale, barrelY + 24 * scale);
            barrel.addColorStop(0, '#dbe7f2');
            barrel.addColorStop(0.42, '#343d4c');
            barrel.addColorStop(1, '#05070c');
            ctx.fillStyle = barrel;
            ctx.beginPath();
            ctx.roundRect(barrelX - 4 * scale, barrelY - 4 * scale, 8 * scale, 28 * scale, 3 * scale);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#02040a';
            ctx.beginPath();
            ctx.arc(barrelX, barrelY + 23 * scale, 4.8 * scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.6 * scale;
            ctx.stroke();
            ctx.restore();
        };

        const drawMechLegArmor = (x, y, scale = 1, color = boss.accent || '#ff365a') => {
            ctx.save();
            ctx.shadowColor = color;
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#0b101a';
            ctx.strokeStyle = 'rgba(245,250,255,0.5)';
            ctx.beginPath();
            ctx.moveTo(x - 12 * scale, y - 4 * scale);
            ctx.lineTo(x + 12 * scale, y - 4 * scale);
            ctx.lineTo(x + 17 * scale, y + 18 * scale);
            ctx.lineTo(x + 7 * scale, y + 26 * scale);
            ctx.lineTo(x - 7 * scale, y + 26 * scale);
            ctx.lineTo(x - 17 * scale, y + 18 * scale);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.55 + Math.sin(t * 7 + x) * 0.18;
            ctx.fillRect(x - 6 * scale, y + 3 * scale, 12 * scale, 3 * scale);
            ctx.restore();
        };

        const drawMechFrame = (heavy = 1) => {
            const scale = heavy;
            [-1, 1].forEach((side) => {
                drawMechShoulder(side, -12, scale, boss.accent);
                drawMechArm(side, 18, scale * 0.96, boss.accent);
            });
            drawMechLegArmor(-boss.w * 0.18, boss.h / 2 - 8, scale * 0.9, boss.accent);
            drawMechLegArmor(boss.w * 0.18, boss.h / 2 - 8, scale * 0.9, boss.accent);
            ctx.save();
            ctx.shadowBlur = 0;
            ctx.strokeStyle = 'rgba(245,250,255,0.32)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(-boss.w * 0.28, -boss.h * 0.2);
            ctx.lineTo(0, -boss.h * 0.34);
            ctx.lineTo(boss.w * 0.28, -boss.h * 0.2);
            ctx.stroke();
            ctx.restore();
        };

        const drawArmorSpikes = () => {
            ctx.save();
            ctx.fillStyle = '#0a0e18';
            ctx.strokeStyle = boss.accent || '#ff365a';
            ctx.lineWidth = 1;
            [-38, -19, 19, 38].forEach((x) => {
                ctx.beginPath();
                ctx.moveTo(x, -boss.h / 2 - 13);
                ctx.lineTo(x + 8 * Math.sign(x || 1), -boss.h / 2 + 2);
                ctx.lineTo(x - 8 * Math.sign(x || 1), -boss.h / 2 + 2);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            });
            ctx.restore();
        };

        const drawWarningVents = () => {
            ctx.save();
            ctx.shadowColor = '#ff365a';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#ff365a';
            [-24, -12, 12, 24].forEach((x, idx) => {
                ctx.globalAlpha = 0.58 + Math.sin(t * 5 + idx) * 0.22;
                ctx.fillRect(x - 3, boss.h / 2 - 12, 6, 3);
            });
            ctx.restore();
        };

        const drawSiegeGuns = () => {
            ctx.save();
            ctx.shadowColor = '#ff365a';
            ctx.shadowBlur = 12;
            const gunY = boss.h / 2 - 14;
            [-28, 0, 28].forEach((x, idx) => {
                const scale = idx === 1 ? 1.18 : 0.88;
                const barrel = ctx.createLinearGradient(x - 6, gunY - 10, x + 6, gunY + 22);
                barrel.addColorStop(0, '#394152');
                barrel.addColorStop(0.48, '#080b12');
                barrel.addColorStop(1, '#535d70');
                ctx.fillStyle = barrel;
                ctx.strokeStyle = 'rgba(255,245,245,0.72)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.roundRect(x - 5 * scale, gunY - 12, 10 * scale, 30 * scale, 4 * scale);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#05070c';
                ctx.beginPath();
                ctx.arc(x, gunY + 17 * scale, 5.5 * scale, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = idx === 1 ? boss.accent || '#ff365a' : '#ff365a';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, gunY + 17 * scale, 3.2 * scale, 0, Math.PI * 2);
                ctx.stroke();
            });
            ctx.restore();
        };

        const drawHazardArmor = () => {
            ctx.save();
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(5,7,12,0.72)';
            ctx.strokeStyle = 'rgba(255,54,90,0.72)';
            ctx.lineWidth = 1;
            [-44, -22, 22, 44].forEach((x) => {
                ctx.beginPath();
                ctx.roundRect(x - 9, -boss.h / 2 + 13, 18, 9, 3);
                ctx.fill();
                ctx.stroke();
            });
            ctx.fillStyle = '#ff365a';
            [-36, -18, 18, 36].forEach((x, idx) => {
                ctx.globalAlpha = 0.58 + Math.sin(t * 6 + idx) * 0.18;
                ctx.beginPath();
                ctx.moveTo(x - 5, -boss.h / 2 + 28);
                ctx.lineTo(x + 5, -boss.h / 2 + 28);
                ctx.lineTo(x, -boss.h / 2 + 36);
                ctx.closePath();
                ctx.fill();
            });
            ctx.restore();
        };

        const drawArmorPlates = () => {
            ctx.save();
            ctx.shadowBlur = 0;
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(245,250,255,0.26)';
            ctx.fillStyle = 'rgba(5,8,15,0.38)';
            [-boss.w * 0.28, boss.w * 0.28].forEach((x) => {
                ctx.beginPath();
                ctx.roundRect(x - 15, -boss.h * 0.28, 30, boss.h * 0.52, 8);
                ctx.fill();
                ctx.stroke();
            });
            ctx.strokeStyle = 'rgba(0,0,0,0.42)';
            [-1, 1].forEach((side) => {
                ctx.beginPath();
                ctx.moveTo(side * 10, -boss.h / 2 + 11);
                ctx.lineTo(side * (boss.w / 2 - 19), -4);
                ctx.lineTo(side * (boss.w / 2 - 27), boss.h / 2 - 8);
                ctx.stroke();
            });
            ctx.strokeStyle = boss.accent || '#ff365a';
            ctx.globalAlpha = 0.48;
            ctx.beginPath();
            ctx.moveTo(-boss.w * 0.18, boss.h * 0.28);
            ctx.lineTo(boss.w * 0.18, boss.h * 0.28);
            ctx.stroke();
            ctx.restore();
        };

        const drawSignalLights = () => {
            ctx.save();
            ctx.shadowColor = boss.accent || '#ff365a';
            ctx.shadowBlur = 10;
            const lights = [
                [-boss.w / 2 + 18, -boss.h / 2 + 18],
                [boss.w / 2 - 18, -boss.h / 2 + 18],
                [-boss.w / 2 + 26, boss.h / 2 - 16],
                [boss.w / 2 - 26, boss.h / 2 - 16],
            ];
            lights.forEach(([x, y], idx) => {
                const blink = 0.46 + Math.sin(t * 5 + idx * 1.7) * 0.22;
                ctx.globalAlpha = blink;
                ctx.fillStyle = boss.accent || '#ff365a';
                ctx.beginPath();
                ctx.arc(x, y, 3.2, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
        };

        const drawDamageState = () => {
            if (bossHpRatio > 0.72) return;
            ctx.save();
            ctx.shadowBlur = 0;
            const severe = bossHpRatio <= 0.34;
            ctx.strokeStyle = severe ? 'rgba(255,116,64,0.88)' : 'rgba(8,10,16,0.78)';
            ctx.lineWidth = severe ? 2 : 1.4;
            const cracks = severe
                ? [[-36, -10, -8, 12, 12, 6], [28, -26, 12, -4, 34, 14], [-18, 28, 6, 19, 24, 31]]
                : [[-30, -8, -12, 8, 3, 2], [24, -18, 12, -4, 30, 8]];
            cracks.forEach(([x1, y1, x2, y2, x3, y3], idx) => {
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2 + Math.sin(t * 2 + idx) * 2, y2);
                ctx.lineTo(x3, y3);
                ctx.stroke();
            });
            if (severe) {
                ctx.fillStyle = 'rgba(0,0,0,0.34)';
                [-26, 22].forEach((x, idx) => {
                    ctx.beginPath();
                    ctx.ellipse(x, -boss.h / 2 - 10 - Math.sin(t * 2 + idx) * 3, 14, 5, idx ? 0.25 : -0.25, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.fillStyle = boss.accent || '#ff365a';
                ctx.globalAlpha = 0.62 + Math.sin(t * 11) * 0.24;
                ctx.beginPath();
                ctx.arc(16, -6, 3.4, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        };

        ctx.save();
        ctx.globalAlpha = 0.34;
        ctx.fillStyle = boss.accent || '#ff365a';
        ctx.beginPath();
        ctx.ellipse(0, 4, boss.w * 0.62, boss.h * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (boss.bossType === 'apocalypse') {
            drawEngine(-48, boss.h / 2 - 4, 1.08);
            drawEngine(0, boss.h / 2 + 2, 0.86);
            drawEngine(48, boss.h / 2 - 4, 1.08);
            ctx.fillStyle = metal;
            ctx.beginPath();
            ctx.moveTo(0, -boss.h / 2 - 24);
            ctx.lineTo(boss.w / 2 + 30, -22);
            ctx.lineTo(boss.w / 2 + 12, boss.h / 2 - 6);
            ctx.lineTo(32, boss.h / 2 + 18);
            ctx.lineTo(0, boss.h / 2 + 6);
            ctx.lineTo(-32, boss.h / 2 + 18);
            ctx.lineTo(-boss.w / 2 - 12, boss.h / 2 - 6);
            ctx.lineTo(-boss.w / 2 - 30, -22);
            ctx.closePath();
            ctx.fill();
            outline();
            ctx.save();
            ctx.rotate(t * 0.8);
            ctx.strokeStyle = '#ff2df7';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#ff2df7';
            ctx.shadowBlur = 18;
            for (let i = 0; i < 3; i += 1) {
                ctx.beginPath();
                ctx.ellipse(0, 2, 34 + i * 11, 18 + i * 7, i * 0.55, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
            [-56, -28, 28, 56].forEach((x, idx) => {
                drawTurret(x, -6 + (idx % 2) * 12, Math.PI / 2 + Math.sin(t + idx) * 0.22, idx % 2 ? 0.88 : 1.05, idx % 2 ? '#4fd4ff' : '#ff2df7');
            });
            [-70, 70].forEach((x) => {
                ctx.fillStyle = '#080d18';
                ctx.beginPath();
                ctx.roundRect(x - 18, -8, 36, 44, 12);
                ctx.fill();
                outline();
                drawMechJoint(x, 10, 9, '#ffd25a');
            });
            drawCore(0, 8, getBossPhase(boss) >= 4 ? 26 : 22, '#ff2df7');
        } else if (boss.bossType === 'hydra') {
            drawEngine(-32, boss.h / 2 - 6, 1.05);
            drawEngine(32, boss.h / 2 - 6, 1.05);
            ctx.fillStyle = metal;
            ctx.beginPath();
            ctx.moveTo(0, -boss.h / 2 - 10);
            ctx.lineTo(boss.w / 2 + 18, -14);
            ctx.lineTo(boss.w / 2 - 4, boss.h / 2 + 8);
            ctx.lineTo(22, boss.h / 2 - 2);
            ctx.lineTo(0, boss.h / 2 + 14);
            ctx.lineTo(-22, boss.h / 2 - 2);
            ctx.lineTo(-boss.w / 2 + 4, boss.h / 2 + 8);
            ctx.lineTo(-boss.w / 2 - 18, -14);
            ctx.closePath();
            ctx.fill();
            outline();
            [-42, 0, 42].forEach((x, idx) => drawTurret(x, -12 + (idx === 1 ? -8 : 0), Math.PI / 2 + Math.sin(t + idx) * 0.16, idx === 1 ? 1.3 : 1.05));
            [-58, 58].forEach((x) => {
                ctx.fillStyle = '#141b29';
                ctx.beginPath();
                ctx.roundRect(x - 16, 4, 32, 34, 12);
                ctx.fill();
                outline();
                drawTurret(x, 13, Math.PI / 2, 0.85, '#62d2ff');
            });
            drawCore(0, 16, 18, boss.accent);
        } else if (boss.bossType === 'sniper') {
            drawEngine(-20, boss.h / 2 - 4, 0.8);
            drawEngine(20, boss.h / 2 - 4, 0.8);
            ctx.fillStyle = metal;
            ctx.beginPath();
            ctx.moveTo(0, -boss.h / 2 - 20);
            ctx.lineTo(18, -boss.h / 2 + 18);
            ctx.lineTo(boss.w / 2 + 12, 6);
            ctx.lineTo(16, boss.h / 2 + 12);
            ctx.lineTo(0, boss.h / 2 + 2);
            ctx.lineTo(-16, boss.h / 2 + 12);
            ctx.lineTo(-boss.w / 2 - 12, 6);
            ctx.lineTo(-18, -boss.h / 2 + 18);
            ctx.closePath();
            ctx.fill();
            outline();
            ctx.fillStyle = '#08101d';
            ctx.beginPath();
            ctx.roundRect(-5, -boss.h / 2 - 18, 10, boss.h + 20, 5);
            ctx.fill();
            ctx.fillStyle = boss.accent;
            ctx.fillRect(-2, -boss.h / 2 - 22, 4, boss.h + 28);
            drawCore(0, 8, 12, '#62d2ff');
        } else if (boss.bossType === 'minefield') {
            drawEngine(-38, boss.h / 2 - 2, 0.95);
            drawEngine(38, boss.h / 2 - 2, 0.95);
            ctx.fillStyle = metal;
            ctx.beginPath();
            ctx.roundRect(-boss.w / 2 - 8, -boss.h / 2 + 2, boss.w + 16, boss.h + 2, 14);
            ctx.fill();
            outline();
            ctx.fillStyle = '#090d15';
            [-38, -19, 0, 19, 38].forEach((x, index) => {
                ctx.beginPath();
                ctx.roundRect(x - 8, boss.h / 2 - 20, 16, 17, 5);
                ctx.fill();
                ctx.strokeStyle = index % 2 ? 'rgba(255,255,255,0.34)' : boss.accent;
                ctx.stroke();
                ctx.fillStyle = '#090d15';
            });
            drawCore(0, -6, 16, boss.accent);
        } else if (boss.bossType === 'dronecarrier') {
            drawEngine(-42, boss.h / 2 - 5, 0.82);
            drawEngine(42, boss.h / 2 - 5, 0.82);
            ctx.fillStyle = metal;
            ctx.beginPath();
            ctx.moveTo(0, -boss.h / 2 - 8);
            ctx.lineTo(boss.w / 2 + 24, -10);
            ctx.lineTo(boss.w / 2 + 10, boss.h / 2 - 4);
            ctx.lineTo(18, boss.h / 2 + 10);
            ctx.lineTo(0, boss.h / 2);
            ctx.lineTo(-18, boss.h / 2 + 10);
            ctx.lineTo(-boss.w / 2 - 10, boss.h / 2 - 4);
            ctx.lineTo(-boss.w / 2 - 24, -10);
            ctx.closePath();
            ctx.fill();
            outline();
            [-42, -22, 22, 42].forEach((x) => {
                ctx.fillStyle = 'rgba(5,9,18,0.86)';
                ctx.beginPath();
                ctx.roundRect(x - 9, -6, 18, 24, 7);
                ctx.fill();
                drawMechJoint(x, 6, 5, boss.accent);
            });
            drawCore(0, 12, 13, boss.accent);
        } else if (boss.bossType === 'laser') {
            drawEngine(-34, boss.h / 2 - 4, 0.95);
            drawEngine(34, boss.h / 2 - 4, 0.95);
            ctx.fillStyle = metal;
            ctx.beginPath();
            ctx.roundRect(-boss.w / 2 - 10, -boss.h / 2 - 2, boss.w + 20, boss.h + 4, 18);
            ctx.fill();
            outline();
            ctx.strokeStyle = boss.accent;
            ctx.lineWidth = 2;
            for (let i = -2; i <= 2; i += 1) {
                ctx.beginPath();
                ctx.moveTo(i * 18, -boss.h / 2 + 4);
                ctx.lineTo(i * 10, boss.h / 2 - 6);
                ctx.stroke();
            }
            drawCore(0, -2, 23 + Math.sin(t * 2) * 3, '#00ff88');
            drawTurret(-42, 10, Math.PI / 2, 0.85, '#00ff88');
            drawTurret(42, 10, Math.PI / 2, 0.85, '#00ff88');
        } else if (boss.bossType === 'sentinel') {
            drawEngine(-30, boss.h / 2 - 5, 0.86);
            drawEngine(30, boss.h / 2 - 5, 0.86);
            ctx.fillStyle = metal;
            ctx.beginPath();
            ctx.moveTo(0, -boss.h / 2 - 14);
            ctx.lineTo(boss.w / 2 + 10, -18);
            ctx.lineTo(boss.w / 2 - 4, boss.h / 2 + 6);
            ctx.lineTo(18, boss.h / 2 - 2);
            ctx.lineTo(0, boss.h / 2 + 12);
            ctx.lineTo(-18, boss.h / 2 - 2);
            ctx.lineTo(-boss.w / 2 + 4, boss.h / 2 + 6);
            ctx.lineTo(-boss.w / 2 - 10, -18);
            ctx.closePath();
            ctx.fill();
            outline();
            drawTurret(-30, -4, Math.PI / 2 + 0.12, 0.92, boss.accent);
            drawTurret(30, -4, Math.PI / 2 - 0.12, 0.92, boss.accent);
            drawCore(0, 8, 15, boss.accent);
        } else if (boss.bossType === 'gatekeeper') {
            drawEngine(-36, boss.h / 2 - 6, 0.82);
            drawEngine(36, boss.h / 2 - 6, 0.82);
            ctx.fillStyle = metal;
            ctx.beginPath();
            ctx.roundRect(-boss.w / 2 - 4, -boss.h / 2 + 4, boss.w + 8, boss.h - 2, 12);
            ctx.fill();
            outline();
            ctx.fillStyle = 'rgba(5,10,18,0.82)';
            [-36, -18, 0, 18, 36].forEach((x, index) => {
                ctx.beginPath();
                ctx.roundRect(x - 6, -boss.h / 2 - 6, 12, boss.h + 8, 4);
                ctx.fill();
                ctx.strokeStyle = index === 2 ? boss.accent : 'rgba(245,250,255,0.28)';
                ctx.stroke();
            });
            drawTurret(-48, 10, Math.PI / 2, 0.86, boss.accent);
            drawTurret(48, 10, Math.PI / 2, 0.86, boss.accent);
            drawCore(0, -2, 15, boss.accent);
        } else if (boss.bossType === 'spiral') {
            ctx.fillStyle = metal;
            for (let i = 0; i < 8; i += 1) {
                ctx.save();
                ctx.rotate(t * 1.25 + i * Math.PI / 4);
                ctx.beginPath();
                ctx.roundRect(4, -7, boss.w / 2 + 12, 14, 7);
                ctx.fill();
                outline();
                ctx.restore();
            }
            ctx.fillStyle = '#151a27';
            ctx.beginPath();
            ctx.arc(0, 0, 27, 0, Math.PI * 2);
            ctx.fill();
            outline();
            drawCore(0, 0, 19, '#a65cff');
        } else if (boss.bossType === 'rush') {
            drawEngine(-22, boss.h / 2 - 4, 0.9);
            drawEngine(22, boss.h / 2 - 4, 0.9);
            ctx.fillStyle = metal;
            ctx.beginPath();
            ctx.moveTo(0, -boss.h / 2 - 10);
            ctx.lineTo(boss.w / 2 + 12, -4);
            ctx.lineTo(30, boss.h / 2 + 14);
            ctx.lineTo(0, boss.h / 2 + 2);
            ctx.lineTo(-30, boss.h / 2 + 14);
            ctx.lineTo(-boss.w / 2 - 12, -4);
            ctx.closePath();
            ctx.fill();
            outline();
            ctx.fillStyle = boss.accent;
            [-32, 32].forEach((x) => {
                ctx.beginPath();
                ctx.moveTo(x, -8);
                ctx.lineTo(x * 1.35, 14);
                ctx.lineTo(x * 0.72, 18);
                ctx.closePath();
                ctx.fill();
            });
            drawTurret(-18, -4, Math.PI / 2 + 0.1, 0.8, '#ff9d2e');
            drawTurret(18, -4, Math.PI / 2 - 0.1, 0.8, '#ff9d2e');
            drawCore(0, 12, 12, '#ff9d2e');
        } else {
            drawEngine(-26, boss.h / 2 - 4, 0.86);
            drawEngine(26, boss.h / 2 - 4, 0.86);
            ctx.fillStyle = metal;
            ctx.beginPath();
            ctx.moveTo(0, -boss.h / 2 - 12);
            ctx.lineTo(boss.w / 2 + 14, -8);
            ctx.lineTo(34, boss.h / 2 + 12);
            ctx.lineTo(0, boss.h / 2 + 4);
            ctx.lineTo(-34, boss.h / 2 + 12);
            ctx.lineTo(-boss.w / 2 - 14, -8);
            ctx.closePath();
            ctx.fill();
            outline();
            drawTurret(-30, 2, Math.PI / 2, 0.8, boss.accent);
            drawTurret(30, 2, Math.PI / 2, 0.8, boss.accent);
            drawCore(0, 10, 14, boss.accent);
        }
        drawMechFrame(boss.bossType === 'apocalypse' ? 1.18 : boss.bossType === 'hydra' || boss.bossType === 'minefield' ? 1.08 : 0.94);
        drawSiegeGuns();
        drawHazardArmor();
        drawMissilePod(-boss.w / 2 + 16, 10, boss.bossType === 'apocalypse' ? 1.12 : boss.bossType === 'hydra' ? 1.05 : 0.82);
        drawMissilePod(boss.w / 2 - 16, 10, boss.bossType === 'apocalypse' ? 1.12 : boss.bossType === 'hydra' ? 1.05 : 0.82);
        drawArmorSpikes();
        drawArmorPlates();
        drawSignalLights();
        drawDamageState();
        drawWarningVents();
        ctx.restore();

        drawBossHealthBar(boss);
    };

    const drawPowerUpIcon = (type, color) => {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#07101a';
        ctx.fillStyle = '#07101a';
        ctx.lineWidth = 2.2;

        if (type === 'fire') {
            ctx.beginPath();
            ctx.moveTo(-2, -10);
            ctx.lineTo(7, -2);
            ctx.lineTo(2, -2);
            ctx.lineTo(5, 10);
            ctx.lineTo(-7, 0);
            ctx.lineTo(-1, 0);
            ctx.closePath();
            ctx.fill();
        } else if (type === 'shield') {
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(9, -6);
            ctx.lineTo(7, 4);
            ctx.quadraticCurveTo(0, 11, -7, 4);
            ctx.lineTo(-9, -6);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.42)';
            ctx.stroke();
        } else if (type === 'bomb') {
            ctx.beginPath();
            ctx.arc(-1, 2, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#07101a';
            ctx.beginPath();
            ctx.moveTo(3, -5);
            ctx.quadraticCurveTo(8, -12, 12, -6);
            ctx.stroke();
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(12, -6, 2.4, 0, Math.PI * 2);
            ctx.fill();
        } else if (type === 'heal') {
            ctx.beginPath();
            ctx.roundRect(-3, -10, 6, 20, 2);
            ctx.roundRect(-10, -3, 20, 6, 2);
            ctx.fill();
        } else if (type === 'slow') {
            ctx.beginPath();
            ctx.arc(0, 0, 9, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -6);
            ctx.moveTo(0, 0);
            ctx.lineTo(5, 3);
            ctx.stroke();
        } else if (type === 'doubleScore') {
            ctx.beginPath();
            ctx.arc(-4, 2, 6, 0, Math.PI * 2);
            ctx.arc(5, -3, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = color;
            ctx.beginPath();
            for (let i = 0; i < 5; i += 1) {
                const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
                const x = Math.cos(a) * 4.8 + 5;
                const y = Math.sin(a) * 4.8 - 3;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
                const b = a + Math.PI / 5;
                ctx.lineTo(Math.cos(b) * 2.1 + 5, Math.sin(b) * 2.1 - 3);
            }
            ctx.closePath();
            ctx.fill();
        } else if (type === 'magnet') {
            ctx.lineWidth = 3.2;
            ctx.beginPath();
            ctx.moveTo(-8, -7);
            ctx.lineTo(-8, 2);
            ctx.quadraticCurveTo(0, 11, 8, 2);
            ctx.lineTo(8, -7);
            ctx.stroke();
            ctx.fillRect(-11, -9, 6, 4);
            ctx.fillRect(5, -9, 6, 4);
        } else if (type === 'drone') {
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(8, 5);
            ctx.lineTo(3, 8);
            ctx.lineTo(0, 4);
            ctx.lineTo(-3, 8);
            ctx.lineTo(-8, 5);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = color;
            ctx.fillRect(-2, 3, 4, 6);
        } else {
            ctx.lineWidth = 2;
            for (let i = 0; i < 8; i += 1) {
                const a = i * Math.PI / 4;
                ctx.beginPath();
                ctx.moveTo(Math.cos(a) * 4, Math.sin(a) * 4);
                ctx.lineTo(Math.cos(a) * 11, Math.sin(a) * 11);
                ctx.stroke();
            }
            ctx.beginPath();
            ctx.arc(0, 0, 4.2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    };

    const drawPowerUps = () => {
        powerUps.forEach((p) => {
            ctx.save();
            ctx.translate(p.x, p.y);
            const pulse = 1 + Math.sin(Date.now() * 0.012) * 0.08;
            ctx.scale(pulse, pulse);
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 12;
            const shell = ctx.createRadialGradient(-5, -6, 2, 0, 0, 17);
            shell.addColorStop(0, '#ffffff');
            shell.addColorStop(0.28, p.color);
            shell.addColorStop(0.76, p.color);
            shell.addColorStop(1, '#111827');
            ctx.fillStyle = shell;
            ctx.beginPath();
            ctx.arc(0, 0, 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(255,255,255,0.86)';
            ctx.lineWidth = 1.4;
            ctx.stroke();
            ctx.globalAlpha = 0.36;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(-5, -6, 4.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            drawPowerUpIcon(p.type, p.color);
            ctx.restore();
        });
    };

    const drawParticles = () => {
        const lowPower = isPlaneLowPowerMode();
        particles.forEach((p) => {
            const alpha = p.life / p.maxLife;
            ctx.save();
            ctx.globalAlpha = Math.max(0, alpha);
            if (p.spriteId) {
                const progress = 1 - Math.max(0, Math.min(1, alpha));
                if (!drawPlaneSpriteFrame(p.spriteId, p.x, p.y, p.size, p.size, {
                    progress,
                    frames: p.spriteFrames || 4,
                    alpha: Math.min(1, alpha + 0.2),
                    glow: p.color,
                    shadowBlur: lowPower ? 0 : 18,
                })) {
                    ctx.fillStyle = p.color;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size * 0.35, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else if (p.ring) {
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 2.4;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = lowPower ? 0 : 14;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * (1.1 + (1 - alpha) * 1.8), 0, Math.PI * 2);
                ctx.stroke();
            } else if (p.spark) {
                ctx.strokeStyle = p.color;
                ctx.lineWidth = Math.max(1, p.size * 0.55);
                ctx.shadowColor = p.color;
                ctx.shadowBlur = lowPower ? 0 : 10;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035);
                ctx.stroke();
            } else if (p.debris) {
                ctx.fillStyle = p.color;
                ctx.translate(p.x, p.y);
                ctx.rotate((1 - alpha) * Math.PI * 3);
                ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
            } else {
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.smoke ? p.size * (1 + (1 - alpha) * 0.8) : p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });
    };

    const addPlaneCanvasButton = (id, label, x, y, w, h, onClick, options = {}) => {
        const button = { id, label, x, y, w, h, onClick, options };
        planeCanvasButtons.push(button);
        ctx.save();
        const primary = options.primary;
        const disabled = options.disabled;
        const border = disabled ? 'rgba(255,255,255,0.14)' : primary ? '#ffd700' : 'rgba(0,212,255,0.42)';
        const fill = primary
            ? ctx.createLinearGradient(x, y, x + w, y + h)
            : ctx.createLinearGradient(x, y, x, y + h);
        if (primary) {
            fill.addColorStop(0, disabled ? '#6a5b20' : '#ffe066');
            fill.addColorStop(1, disabled ? '#3d3414' : '#ff9f1c');
        } else {
            fill.addColorStop(0, disabled ? 'rgba(34,34,50,0.75)' : 'rgba(0,212,255,0.13)');
            fill.addColorStop(1, disabled ? 'rgba(12,12,24,0.72)' : 'rgba(14,14,32,0.92)');
        }
        ctx.fillStyle = fill;
        ctx.strokeStyle = border;
        ctx.lineWidth = primary ? 2 : 1;
        ctx.shadowColor = disabled ? 'transparent' : (primary ? 'rgba(255,215,0,0.35)' : 'rgba(0,212,255,0.28)');
        ctx.shadowBlur = disabled ? 0 : 14;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 14);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = disabled ? '#77778f' : (primary ? '#1a1200' : '#e8f7ff');
        ctx.font = `bold ${options.fontSize || 16}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x + w / 2, y + h / 2);
        ctx.restore();
    };

    const drawPlanePanel = (x, y, w, h, title, subtitle = '') => {
        ctx.save();
        ctx.fillStyle = 'rgba(5,7,18,0.78)';
        ctx.strokeStyle = 'rgba(0,212,255,0.32)';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = 'rgba(0,212,255,0.18)';
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 18);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffd700';
        ctx.font = '900 26px sans-serif';
        ctx.fillText(title, x + w / 2, y + 42);
        if (subtitle) {
            ctx.fillStyle = '#a8eaff';
            ctx.font = '13px sans-serif';
            ctx.fillText(subtitle, x + w / 2, y + 66);
        }
        ctx.restore();
    };

    const drawPlaneAssetIcon = (id, x, y, size = 18) => {
        const img = planeUiImages[id];
        if (!img?.complete || !img.naturalWidth) return false;
        ctx.drawImage(img, x, y, size, size);
        return true;
    };

    const drawPlaneMenuScreen = () => {
        const w = Math.min(340, GAME.width - 44);
        const x = (GAME.width - w) / 2;
        const y = Math.max(72, GAME.height * 0.18);
        drawPlanePanel(x, y, w, 340, '雷霆空战', '纵版街机 · 重装出击');

        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#e8e8f0';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`金币 ${planeWallet.coins}   钻石 ${planeWallet.diamonds}`, GAME.width / 2, y + 96);
        ctx.fillStyle = '#92f7ff';
        ctx.font = '12px sans-serif';
        ctx.fillText(`伤害池 ${getPlayerDamage()} · 装甲 ${getPlayerMaxHp()} · 生命 ${PLAYER_STARTING_LIVES}`, GAME.width / 2, y + 119);
        ctx.restore();

        addPlaneCanvasButton('menu-start', '开始游戏', x + 42, y + 150, w - 84, 50, () => {
            selectedPlaneStage = Math.min(selectedPlaneStage, getPlaneMaxStageUnlocked());
            setPlaneMenuView('stage');
        }, { primary: true, fontSize: 18 });
        addPlaneCanvasButton('menu-guide', '游戏说明', x + 42, y + 214, w - 84, 44, () => setPlaneMenuView('guide'));
        addPlaneCanvasButton('menu-shop', '军械商店', x + 42, y + 270, w - 84, 44, () => setPlaneMenuView('shop'));
    };

    const drawPlaneStageScreen = () => {
        const w = Math.min(372, GAME.width - 28);
        const x = (GAME.width - w) / 2;
        const y = Math.max(62, GAME.height * 0.16);
        const stage = getPlaneStage();
        const unlocked = getPlaneMaxStageUnlocked();
        const locked = stage > unlocked;
        drawPlanePanel(x, y, w, 374, '选择难度', `已解锁 ${unlocked}/${PLANE_STAGE_MAX}`);

        ctx.save();
        ctx.textAlign = 'center';
        if (drawPlaneAssetIcon('level', GAME.width / 2 - 24, y + 82, 48)) {
            ctx.fillStyle = '#ffd25a';
        }
        ctx.fillStyle = locked ? '#77778f' : '#ffd25a';
        ctx.font = '900 46px monospace';
        ctx.fillText(String(stage).padStart(2, '0'), GAME.width / 2, y + 148);
        ctx.font = '12px sans-serif';
        ctx.fillStyle = locked ? '#ff9d9d' : '#a8eaff';
        ctx.fillText(locked ? '未解锁：先通关上一难度' : `敌血 +${Math.round((getPlaneStageHpMult() - 1) * 100)}% · 敌伤 +${Math.round((getPlaneStageDamageMult() - 1) * 100)}%`, GAME.width / 2, y + 176);
        ctx.fillStyle = '#d8f7ff';
        ctx.fillText(`分数 +${Math.round((getPlaneStageScoreMult() - 1) * 100)}% · 奖励 +${Math.round((getPlaneStageRewardMult() * getPermanentRewardMult() - 1) * 100)}%`, GAME.width / 2, y + 198);
        ctx.fillStyle = '#7edfff';
        ctx.fillText('击破最终首领后解锁下一难度', GAME.width / 2, y + 224);
        ctx.restore();

        addPlaneCanvasButton('stage-prev', '‹', x + 34, y + 118, 54, 54, () => {
            selectedPlaneStage = Math.max(1, selectedPlaneStage - 1);
            renderPlaneGame();
        }, { disabled: stage <= 1, fontSize: 28 });
        addPlaneCanvasButton('stage-next', '›', x + w - 88, y + 118, 54, 54, () => {
            selectedPlaneStage = Math.min(PLANE_STAGE_MAX, selectedPlaneStage + 1);
            renderPlaneGame();
        }, { disabled: stage >= PLANE_STAGE_MAX, fontSize: 28 });
        addPlaneCanvasButton('stage-start', locked ? '难度未解锁' : '确认难度', x + 46, y + 254, w - 92, 48, () => {
            if (locked) return;
            setPlaneMenuView('mode');
        }, { primary: !locked, disabled: locked, fontSize: 16 });
        addPlaneCanvasButton('stage-back', '返回', x + 86, y + 316, w - 172, 40, () => setPlaneMenuView('menu'));
    };

    const drawPlaneModeScreen = () => {
        const w = Math.min(360, GAME.width - 36);
        const x = (GAME.width - w) / 2;
        const y = Math.max(74, GAME.height * 0.20);
        drawPlanePanel(x, y, w, 330, '选择操作方式', `难度 ${getPlaneStage()} · 选择后立即出击`);
        addPlaneCanvasButton('mode-touch', '触屏模式 / 自动开火', x + 30, y + 112, w - 60, 58, () => {
            selectedPlaneMode = 'touch';
            GAME.controlMode = selectedPlaneMode;
            updatePlaneModeUI();
            startPlaneGame();
        }, { primary: true, fontSize: 14 });
        addPlaneCanvasButton('mode-keyboard', '键鼠模式 / 空格 Q E', x + 30, y + 188, w - 60, 58, () => {
            selectedPlaneMode = 'keyboard';
            GAME.controlMode = selectedPlaneMode;
            updatePlaneModeUI();
            startPlaneGame();
        }, { fontSize: 14 });
        addPlaneCanvasButton('mode-back', '返回', x + 86, y + 268, w - 172, 40, () => setPlaneMenuView('stage'));
    };

    const drawPlaneGuideScreen = () => {
        const w = Math.min(390, GAME.width - 24);
        const x = (GAME.width - w) / 2;
        const y = 54;
        drawPlanePanel(x, y, w, GAME.height - 92, '游戏说明', '每条命归零后获得1.5秒复位保护');
        const lines = [
            '移动：方向键 / 拖动画布',
            '攻击：空格键；触屏模式自动攻击',
            '难度 1-20，通关上一难度才解锁下一难度',
            'Q 炸弹：清屏并对首领造成高伤害',
            'E 爆发：环形弹幕，吃攻击强化',
            '火力最高 5 级，5 发子弹共享总伤害池',
            '开局选核心流派，击破首领后三选一模组',
            '僚机最多左、右、下三架，输出低于主炮',
            '首领 70% / 35% 转阶段，爆发伤害有上限',
            '小怪伤害较低，首领弹幕和撞击更疼',
            '每 500 分结算 1 金币',
            '普通首领掉 1 钻石，最终首领掉 5 钻石',
        ];
        ctx.save();
        ctx.textAlign = 'left';
        ctx.font = '13px sans-serif';
        lines.forEach((line, index) => {
            ctx.fillStyle = index % 2 ? '#a8eaff' : '#e8e8f0';
            ctx.fillText(line, x + 30, y + 105 + index * 28);
        });
        ctx.restore();
        addPlaneCanvasButton('guide-back', '返回', x + 72, y + GAME.height - 168, w - 144, 42, () => setPlaneMenuView('menu'));
    };

    const drawPlaneShopScreen = () => {
        const w = Math.min(424, GAME.width - 18);
        const x = (GAME.width - w) / 2;
        const y = 18;
        const panelH = GAME.height - 36;
        drawPlanePanel(x, y, w, panelH, '前线军械库', `金币 ${planeWallet.coins}   钻石 ${planeWallet.diamonds}`);

        ctx.save();
        const upgrades = getPlaneShopUpgrades();
        const gap = 8;
        const startY = y + 100;
        const footerY = y + panelH - 54;
        const columns = 2;
        const rowCount = Math.ceil(upgrades.length / columns);
        const rowH = Math.max(40, Math.min(54, Math.floor((footerY - startY - (rowCount - 1) * gap) / rowCount)));
        const rowW = (w - 36 - gap) / columns;
        const rowX = x + 18;
        const gridW = rowW * columns + gap;
        const accents = ['#ffcf59', '#ff6e74', '#5ee8ff', '#83d0ff', '#9ef0a0', '#c2a6ff', '#ff9d63', '#73f0c5'];

        ctx.fillStyle = 'rgba(1, 5, 14, 0.58)';
        ctx.fillRect(rowX, y + 78, gridW, 16);
        ctx.textAlign = 'left';
        ctx.fillStyle = '#86a6bf';
        ctx.font = '10px monospace';
        ctx.fillText('舰载强化模块', rowX + 9, y + 89);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#6c8196';
        ctx.fillText('点击条目完成装配', rowX + gridW - 9, y + 89);

        upgrades.forEach((upgrade, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const cx = rowX + col * (rowW + gap);
            const cy = startY + row * (rowH + gap);
            const maxed = upgrade.level >= upgrade.max;
            const enough = (planeWallet[upgrade.currency] || 0) >= upgrade.cost;
            const disabled = maxed || !enough;
            const accent = maxed ? '#ffd25a' : accents[index % accents.length];
            const fill = ctx.createLinearGradient(cx, cy, cx + rowW, cy);
            fill.addColorStop(0, disabled ? 'rgba(22, 27, 42, 0.9)' : 'rgba(8, 17, 34, 0.96)');
            fill.addColorStop(1, disabled ? 'rgba(15, 18, 30, 0.82)' : 'rgba(20, 30, 50, 0.9)');
            ctx.fillStyle = fill;
            ctx.strokeStyle = maxed ? 'rgba(255,210,90,0.62)' : disabled ? 'rgba(255,255,255,0.13)' : `${accent}88`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.roundRect(cx, cy, rowW, rowH, 7);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = accent;
            ctx.fillRect(cx, cy + 6, 3, Math.max(18, rowH - 12));
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.fillRect(cx + 12, cy + rowH - 8, rowW - 24, 2);
            ctx.fillStyle = accent;
            ctx.fillRect(cx + 12, cy + rowH - 8, (rowW - 24) * (upgrade.level / upgrade.max), 2);

            ctx.textAlign = 'left';
            ctx.fillStyle = maxed ? '#ffe19a' : '#edf8ff';
            ctx.font = `900 ${rowH < 46 ? 10 : 11}px sans-serif`;
            ctx.fillText(upgrade.name, cx + 13, cy + (rowH < 46 ? 14 : 17));
            ctx.fillStyle = accent;
            ctx.font = '9px monospace';
            ctx.fillText(`LV ${upgrade.level}/${upgrade.max}`, cx + 13, cy + (rowH < 46 ? 27 : 31));
            ctx.fillStyle = '#9eb4c6';
            ctx.font = '9px sans-serif';
            ctx.fillText(upgrade.desc, cx + 13, cy + rowH - 14);
            ctx.textAlign = 'right';
            ctx.fillStyle = disabled && !maxed ? '#77778f' : '#ffd25a';
            ctx.font = 'bold 10px monospace';
            const costText = maxed ? 'MAX' : `${upgrade.cost}`;
            const iconId = upgrade.currency === 'diamonds' ? 'point' : 'coin';
            if (!maxed) drawPlaneAssetIcon(iconId, cx + rowW - 44, cy + 10, 13);
            ctx.fillText(costText, cx + rowW - 9, cy + 21);
            planeCanvasButtons.push({
                id: `shop-${upgrade.id}`,
                label: upgrade.name,
                x: cx,
                y: cy,
                w: rowW,
                h: rowH,
                onClick: () => buyPlanePermanentUpgrade(upgrade.id),
                options: { disabled },
            });
        });
        if (GAME.menuMessage) {
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(GAME.menuMessage, GAME.width / 2, y + 89);
        }
        ctx.restore();
        addPlaneCanvasButton('shop-back', '返回机库', x + 86, footerY, w - 172, 38, () => setPlaneMenuView('menu'));
    };

    const drawPlaneGameOverScreen = () => {
        const w = Math.min(360, GAME.width - 34);
        const x = (GAME.width - w) / 2;
        const y = Math.max(78, GAME.height * 0.18);
        drawPlanePanel(x, y, w, 382, GAME.runVictory ? '任务完成' : '任务失败', `得分 ${GAME.score} · 连击 ${GAME.bestCombo}`);
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#e8e8f0';
        ctx.font = '14px sans-serif';
        ctx.fillText(`本局奖励：+${GAME.runCoinsEarned}金币  +${GAME.runDiamondsEarned}钻石`, GAME.width / 2, y + 105);
        ctx.fillStyle = '#a8eaff';
        ctx.font = '12px sans-serif';
        ctx.fillText(`当前钱包：金币 ${planeWallet.coins} · 钻石 ${planeWallet.diamonds}`, GAME.width / 2, y + 130);
        if (GAME.runVictory) {
            ctx.fillStyle = '#ffd25a';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(`已通关 ${PLANE_SUBSTAGES_PER_RUN} 小关并击破关底首领`, GAME.width / 2, y + 150);
        }
        ctx.restore();
        addPlaneCanvasButton('over-restart', '重新出击', x + 42, y + 162, w - 84, 48, startPlaneGame, { primary: true, fontSize: 17 });
        addPlaneCanvasButton('over-shop', '进入商店', x + 42, y + 226, w - 84, 44, () => exitPlaneGameOverTo('shop'));
        addPlaneCanvasButton('over-menu', '返回主界面', x + 42, y + 282, w - 84, 44, () => exitPlaneGameOverTo('menu'));
    };

    const drawPlaneWrappedText = (text, x, y, maxWidth, lineHeight, maxLines = 2) => {
        const chars = String(text || '').split('');
        let line = '';
        let lines = 0;
        chars.forEach((char, index) => {
            const test = line + char;
            const tooWide = ctx.measureText(test).width > maxWidth && line;
            if (tooWide) {
                if (lines < maxLines) ctx.fillText(line, x, y + lines * lineHeight);
                lines += 1;
                line = char;
            } else {
                line = test;
            }
            if (index === chars.length - 1 && line && lines < maxLines) {
                ctx.fillText(line, x, y + lines * lineHeight);
            }
        });
    };

    const drawPlaneBuildDraftOverlay = () => {
        const draft = GAME.buildDraft;
        if (!draft) return;
        planeCanvasButtons = [];

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.68)';
        ctx.fillRect(0, 0, GAME.width, GAME.height);

        const choices = draft.choices || [];
        const w = Math.min(420, GAME.width - 24);
        const cardH = draft.type === 'core' ? 78 : 88;
        const panelH = Math.min(GAME.height - 36, 118 + choices.length * cardH + 24);
        const x = (GAME.width - w) / 2;
        const y = Math.max(18, (GAME.height - panelH) / 2);
        drawPlanePanel(x, y, w, panelH, draft.title, draft.subtitle);

        const core = getPlaneBuildCore();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#d8f7ff';
        ctx.font = '12px sans-serif';
        const buildSummary = core
            ? `${core.name} · 模组 ${GAME.buildModules.length} · 标签 ${Object.entries(GAME.buildTagCounts).map(([tag, count]) => `${tag}${count}`).join(' / ') || '无'}`
            : '先确定本局核心流派';
        ctx.fillText(buildSummary, GAME.width / 2, y + 88);

        choices.forEach((choice, index) => {
            const rarity = choice.rarity ? PLANE_BUILD_RARITIES[choice.rarity] : null;
            const color = rarity?.color || choice.color || '#92f7ff';
            const cy = y + 108 + index * cardH;
            const cx = x + 22;
            const cw = w - 44;
            const ch = cardH - 12;
            const grad = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch);
            grad.addColorStop(0, 'rgba(6,12,26,0.96)');
            grad.addColorStop(1, 'rgba(18,24,42,0.94)');
            ctx.fillStyle = grad;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.4;
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.roundRect(cx, cy, cw, ch, 12);
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.textAlign = 'left';
            ctx.fillStyle = color;
            ctx.font = '900 15px sans-serif';
            ctx.fillText(choice.name, cx + 14, cy + 24);
            ctx.font = '11px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(rarity ? rarity.label : choice.tags.join(' / '), cx + cw - 14, cy + 24);
            ctx.textAlign = 'left';
            ctx.fillStyle = '#d8f7ff';
            ctx.font = '12px sans-serif';
            drawPlaneWrappedText(choice.desc, cx + 14, cy + 46, cw - 28, 16, 2);
            ctx.fillStyle = '#9fb7c8';
            ctx.font = '10px monospace';
            ctx.fillText(`标签 ${choice.tags.join(' / ')}`, cx + 14, cy + ch - 9);

            planeCanvasButtons.push({
                id: `build-${choice.id}`,
                label: choice.name,
                x: cx,
                y: cy,
                w: cw,
                h: ch,
                onClick: () => selectPlaneBuildChoice(choice.id),
            });
        });

        if (draft.type === 'module') {
            const canReroll = planeWallet.coins >= PLANE_MODULE_REROLL_COST;
            const rx = x + 76;
            const ry = y + panelH - 40;
            const rw = w - 152;
            const rh = 30;
            ctx.fillStyle = canReroll ? 'rgba(0,212,255,0.13)' : 'rgba(42,44,58,0.62)';
            ctx.strokeStyle = canReroll ? 'rgba(0,212,255,0.46)' : 'rgba(255,255,255,0.16)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.roundRect(rx, ry, rw, rh, 10);
            ctx.fill();
            ctx.stroke();
            ctx.textAlign = 'center';
            ctx.fillStyle = canReroll ? '#d8f7ff' : '#77778f';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(`刷新三选一：${PLANE_MODULE_REROLL_COST}金币`, rx + rw / 2, ry + 19);
            planeCanvasButtons.push({
                id: 'build-reroll',
                label: '刷新',
                x: rx,
                y: ry,
                w: rw,
                h: rh,
                onClick: rerollPlaneModuleDraft,
            });
        }

        ctx.restore();
    };

    const drawPlaneIdleScreen = () => {
        planeCanvasButtons = [];
        if (GAME.menuScreen === 'shop') drawPlaneShopScreen();
        else if (GAME.menuScreen === 'guide') drawPlaneGuideScreen();
        else if (GAME.menuScreen === 'stage') drawPlaneStageScreen();
        else if (GAME.menuScreen === 'mode') drawPlaneModeScreen();
        else drawPlaneMenuScreen();
    };

    const drawPlaneWaveOverlay = () => {
        if (!GAME.running || GAME.gameOver) return;
        const label = WAVE_LABELS[GAME.waveState] || '作战中';
        const progress = (GAME.waveState === 'small' || GAME.waveState === 'elite')
            ? ` ${Math.min(GAME.waveKills, GAME.waveTarget)}/${GAME.waveTarget}`
            : '';

        ctx.save();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(0,0,0,0.42)';
        ctx.beginPath();
        ctx.roundRect(12, 84, 168, 30, 10);
        ctx.fill();
        ctx.fillStyle = GAME.waveState === 'elite' ? '#ffd25a' : '#92f7ff';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`STAGE ${GAME.waveIndex}  ${label}${progress}`, 22, 99);
        ctx.restore();

        if (GAME.boss?.phaseLevel >= 2) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.fillStyle = GAME.boss.phaseLevel >= 4 ? '#ff2df7' : GAME.boss.phaseLevel >= 3 ? '#ff6b35' : '#ffd25a';
            ctx.font = 'bold 11px monospace';
            ctx.fillText(`PHASE ${GAME.boss.phaseLevel}`, GAME.width / 2, 42);
            ctx.restore();
        }

        if ((GAME.boss?.phaseTransitionTimer || 0) > 0) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(0,0,0,0.48)';
            ctx.beginPath();
            ctx.roundRect(GAME.width / 2 - 104, 118, 208, 30, 12);
            ctx.fill();
            ctx.fillStyle = '#ffd25a';
            ctx.font = 'bold 13px monospace';
            ctx.fillText('PHASE SHIFT', GAME.width / 2, 137);
            ctx.restore();
        }

        if (GAME.waveState !== 'bossWarning') return;
        const countdown = Math.max(0, GAME.waveTimer / 1000).toFixed(1);
        const pulse = 0.58 + Math.sin(Date.now() * 0.018) * 0.22;

        ctx.save();
        ctx.fillStyle = `rgba(255,30,72,${0.12 + pulse * 0.12})`;
        ctx.fillRect(0, GAME.height * 0.28, GAME.width, 74);
        ctx.fillRect(0, GAME.height * 0.28 + 98, GAME.width, 4);
        ctx.fillRect(0, GAME.height * 0.28 - 10, GAME.width, 4);
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ff365a';
        ctx.shadowBlur = 24;
        ctx.fillStyle = '#fff2a8';
        ctx.font = '900 44px Impact, sans-serif';
        ctx.fillText('WARNING', GAME.width / 2, GAME.height * 0.28 + 46);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffccd6';
        ctx.font = 'bold 14px monospace';
        ctx.fillText(`BOSS IN ${countdown}s`, GAME.width / 2, GAME.height * 0.28 + 68);
        ctx.restore();
    };

    const hitPlaneCanvasButton = (x, y) => {
        const hit = planeCanvasButtons.find((button) => (
            x >= button.x && x <= button.x + button.w &&
            y >= button.y && y <= button.y + button.h
        ));
        if (!hit) return false;
        if (hit.options?.disabled) return true;
        hit.onClick?.();
        return true;
    };

    const getPlaneBulletDamage = (bullet, targetType = 'enemy') => {
        const base = bullet.damage || getPlayerDamage();
        const stats = getPlaneBuildStats();
        const bossMult = targetType === 'boss' ? stats.bossDamageMult * (bullet.bossDamageMult || 1) : 1;
        const barrierMult = (GAME.shieldActive || GAME.barrierHp > 0) ? (stats.barrierDamageMult || 1) : 1;
        return Math.max(1, Math.round(base * bossMult * barrierMult));
    };

    const consumePlaneBulletHit = (bullet, bulletIndex) => {
        if ((bullet.pierce || 0) > 0) {
            bullet.pierce -= 1;
            if (bullet.pierceDamageMult && bullet.pierceDamageMult !== 1) {
                bullet.damage = Math.max(1, Math.round((bullet.damage || getPlayerDamage()) * bullet.pierceDamageMult));
            }
            if (!bullet.melee) bullet.y -= 8;
            return false;
        }
        bullets.splice(bulletIndex, 1);
        return true;
    };

    const triggerPlaneKillBuildEffects = (x, y) => {
        const stats = getPlaneBuildStats();
        if (stats.barrierOnKillRatio > 0) {
            addPlaneBarrier(GAME.maxHp * stats.barrierOnKillRatio);
        }
        if (stats.killVolleyChance > 0 && stats.killVolleyCount > 0) {
            firePlaneKillVolley(x, y, stats);
        }
        if (stats.meleeMode && stats.meleeKillCooldownRefundMs > 0) {
            GAME.shotTimer = Math.max(0, GAME.shotTimer - stats.meleeKillCooldownRefundMs);
        }
    };

    const applyPlaneSplashDamage = (x, y, radius, damage, ignoredEnemy = null, damageScale = 1) => {
        if (!radius || radius <= 0 || damage <= 0) return;
        const splashDamage = Math.max(1, Math.round(damage * 0.45 * damageScale));
        enemies.forEach((enemy) => {
            if (enemy === ignoredEnemy) return;
            const ex = enemy.x + enemy.w / 2;
            const ey = enemy.y + enemy.h / 2;
            if (Math.hypot(ex - x, ey - y) <= radius) {
                enemy.hp -= splashDamage;
                addExplosionParticles(ex, ey, enemy.color, 4);
            }
        });
        for (let i = enemies.length - 1; i >= 0; i -= 1) {
            if (enemies[i] === ignoredEnemy) continue;
            if (enemies[i].hp > 0) continue;
            addPlaneScore(enemies[i].scoreValue || 10);
            dropRandomPowerUp(enemies[i].x + enemies[i].w / 2, enemies[i].y, enemies[i].elite || enemies[i].type === 'tank' || enemies[i].type === 'shooter');
            recordPlaneEnemyKill(enemies[i]);
            triggerPlaneKillBuildEffects(enemies[i].x + enemies[i].w / 2, enemies[i].y);
            enemies.splice(i, 1);
        }
        if (GAME.boss) {
            const bossRect = getBossHitRect(GAME.boss);
            const bx = bossRect.x + bossRect.w / 2;
            const by = bossRect.y + bossRect.h / 2;
            if (Math.hypot(bx - x, by - y) <= radius + Math.max(bossRect.w, bossRect.h) * 0.35) {
                const result = applyBossDamage(Math.round(splashDamage * getPlaneBuildStats().bossDamageMult), 'shot');
                if (result.applied > 0) addExplosionParticles(bx, by, '#ffcc00', 8);
                if (GAME.boss && GAME.boss.hp <= 0) defeatCurrentBoss();
            }
        }
    };

    const triggerPlaneMagicChain = (bullet, x, y, ignoredEnemy = null) => {
        if (!bullet?.magic || !bullet.magicChainChance || Math.random() >= bullet.magicChainChance) return;
        const chainDamage = Math.max(1, Math.round((bullet.damage || getPlayerDamage()) * (bullet.magicChainDamageMult || 0.35)));
        let best = null;
        let bestDist = 138;
        enemies.forEach((enemy) => {
            if (enemy === ignoredEnemy) return;
            const ex = enemy.x + enemy.w / 2;
            const ey = enemy.y + enemy.h / 2;
            const dist = Math.hypot(ex - x, ey - y);
            if (dist < bestDist) {
                best = enemy;
                bestDist = dist;
            }
        });
        if (best) {
            best.hp -= chainDamage;
            addExplosionParticles(best.x + best.w / 2, best.y + best.h / 2, '#d6f75a', 6);
            if (best.hp <= 0) {
                const enemyIndex = enemies.indexOf(best);
                addPlaneScore(best.scoreValue || 10);
                dropRandomPowerUp(best.x + best.w / 2, best.y, best.type === 'tank' || best.type === 'shooter');
                recordPlaneEnemyKill(best);
                triggerPlaneKillBuildEffects(best.x + best.w / 2, best.y);
                if (enemyIndex >= 0) enemies.splice(enemyIndex, 1);
            }
            return;
        }
        if (GAME.boss) {
            const bossRect = getBossHitRect(GAME.boss);
            const bx = bossRect.x + bossRect.w / 2;
            const by = bossRect.y + bossRect.h / 2;
            if (Math.hypot(bx - x, by - y) <= bestDist + Math.max(bossRect.w, bossRect.h) * 0.35) {
                const result = applyBossDamage(Math.round(chainDamage * getPlaneBuildStats().bossDamageMult), 'shot');
                if (result.applied > 0) addExplosionParticles(bx, by, '#d6f75a', 7);
                if (GAME.boss && GAME.boss.hp <= 0) defeatCurrentBoss();
            }
        }
    };

    const consumePlaneShield = () => {
        if (!GAME.shieldActive) return false;
        GAME.shieldActive = false;
        const stats = getPlaneBuildStats();
        addExplosionParticles(player.x, player.y, '#00ff88', stats.shieldBreakRadius ? 24 : 15);
        if (stats.shieldBlockHealRatio > 0) {
            const heal = Math.max(1, Math.round(GAME.maxHp * stats.shieldBlockHealRatio));
            GAME.hp = Math.min(GAME.maxHp, GAME.hp + heal);
            setPlaneMessage(`护盾回流 +${heal}`, 760);
        }
        if (stats.shieldBreakDamageMult > 0 && stats.shieldBreakRadius > 0) {
            const damage = Math.max(1, Math.round(getPlayerDamage() * stats.shieldBreakDamageMult));
            applyPlaneSplashDamage(player.x, player.y, stats.shieldBreakRadius, damage, null);
            triggerShake(5, 180);
            if (stats.shieldBlockHealRatio <= 0) setPlaneMessage('护盾反击', 780);
        }
        requestPlaneHudUpdate();
        return true;
    };

    const updatePlaneGame = (dt) => {
        GAME.frameId += 1;
        const warningScrollBoost = GAME.waveState === 'bossWarning' ? 1.75 : 1;
        GAME.backgroundScroll = (GAME.backgroundScroll + dt * (88 + Math.min(90, GAME.level * 6)) * warningScrollBoost) % 100000;
        if (GAME.invincibleTimer > 0) {
            GAME.invincibleTimer = Math.max(0, GAME.invincibleTimer - dt * 1000);
        }
        if (GAME.doubleScoreTimer > 0) {
            GAME.doubleScoreTimer = Math.max(0, GAME.doubleScoreTimer - dt * 1000);
        }
        if (GAME.slowdownTimer > 0) {
            GAME.slowdownTimer = Math.max(0, GAME.slowdownTimer - dt * 1000);
            if (GAME.slowdownTimer <= 0) GAME.slowdownFactor = 1;
        }
        if (GAME.magnetTimer > 0) GAME.magnetTimer = Math.max(0, GAME.magnetTimer - dt * 1000);
        if (GAME.droneTimer > 0) {
            GAME.droneTimer = Math.max(0, GAME.droneTimer - dt * 1000);
            if (GAME.droneTimer <= 0) GAME.droneCount = 0;
        }
        if (GAME.hitFlashTimer > 0) GAME.hitFlashTimer = Math.max(0, GAME.hitFlashTimer - dt * 1000);
        if (GAME.messageTimer > 0) {
            GAME.messageTimer = Math.max(0, GAME.messageTimer - dt * 1000);
            if (GAME.messageTimer <= 0) GAME.message = '';
        }
        if (GAME.comboTimer > 0) {
            GAME.comboTimer = Math.max(0, GAME.comboTimer - dt * 1000);
            if (GAME.comboTimer <= 0) GAME.combo = 0;
        }
        if (GAME.shakeTimer > 0) {
            GAME.shakeTimer = Math.max(0, GAME.shakeTimer - dt * 1000);
            if (GAME.shakeTimer <= 0) GAME.shakeIntensity = 0;
        }
        if (GAME.bossContactTimer > 0) {
            GAME.bossContactTimer = Math.max(0, GAME.bossContactTimer - dt * 1000);
        }
        if (GAME.respawnTimer > 0) {
            GAME.respawnTimer = Math.max(0, GAME.respawnTimer - dt * 1000);
        }

        const buildStats = getPlaneBuildStats();
        if (buildStats.autoMissileInterval > 0) {
            GAME.autoMissileTimer -= dt * 1000;
            if (GAME.autoMissileTimer <= 0) {
                firePlaneAutoMissile();
                GAME.autoMissileTimer = buildStats.autoMissileInterval;
            }
        } else {
            GAME.autoMissileTimer = 0;
        }
        if (buildStats.autoLaserInterval > 0) {
            GAME.autoLaserTimer -= dt * 1000;
            if (GAME.autoLaserTimer <= 0) {
                firePlaneAutoLaser();
                GAME.autoLaserTimer = buildStats.autoLaserInterval;
            }
        } else {
            GAME.autoLaserTimer = 0;
        }
        if (buildStats.autoVolleyInterval > 0) {
            GAME.autoVolleyTimer -= dt * 1000;
            if (GAME.autoVolleyTimer <= 0) {
                firePlaneAutoVolley();
                GAME.autoVolleyTimer = buildStats.autoVolleyInterval;
            }
        } else {
            GAME.autoVolleyTimer = 0;
        }
        if (buildStats.rearVolleyInterval > 0 && buildStats.rearVolleyCount > 0) {
            GAME.rearVolleyTimer -= dt * 1000;
            if (GAME.rearVolleyTimer <= 0) {
                firePlaneRearVolley(buildStats);
                GAME.rearVolleyTimer = buildStats.rearVolleyInterval;
            }
        } else {
            GAME.rearVolleyTimer = 0;
        }
        updatePlaneSummons(dt, buildStats);
        if (buildStats.scytheInterval > 0) {
            GAME.scytheTimer -= dt * 1000;
            if (GAME.scytheTimer <= 0) {
                createPlaneMeleeSlash(buildStats, 'scythe');
                GAME.scytheTimer = buildStats.scytheInterval;
            }
        } else {
            GAME.scytheTimer = 0;
        }
        if (buildStats.meteorInterval > 0) {
            GAME.meteorTimer -= dt * 1000;
            if (GAME.meteorTimer <= 0) {
                firePlaneMeteor();
                GAME.meteorTimer = buildStats.meteorInterval;
            }
        } else {
            GAME.meteorTimer = 0;
        }
        if (buildStats.barrierRegenInterval > 0 && buildStats.barrierRegenRatio > 0) {
            GAME.barrierRegenTimer -= dt * 1000;
            if (GAME.barrierRegenTimer <= 0) {
                const gained = addPlaneBarrier(GAME.maxHp * buildStats.barrierRegenRatio);
                if (gained > 0) setPlaneMessage(`护盾层 +${gained}`, 760);
                GAME.barrierRegenTimer = buildStats.barrierRegenInterval;
                requestPlaneHudUpdate();
            }
        } else {
            GAME.barrierRegenTimer = 0;
        }

        updatePlayerHitboxByBuild();
        const inputX = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0);
        const inputY = (keys.ArrowDown ? 1 : 0) - (keys.ArrowUp ? 1 : 0);
        const ease = Math.min(1, dt * 14);
        const currentPlayerSpeed = player.speed + (buildStats.meleeSpeedBonus || 0);
        player.vx += (inputX * currentPlayerSpeed - player.vx) * ease;
        player.vy += (inputY * currentPlayerSpeed - player.vy) * ease;

        if (pointerControl.active) {
            const dx = pointerControl.x - player.x;
            const dy = pointerControl.y - player.y;
            if (isPlaneTouchMode()) {
                player.x = pointerControl.x;
                player.y = pointerControl.y;
                player.vx = 0;
                player.vy = 0;
            } else {
                player.vx += (dx * 7 - player.vx) * Math.min(1, dt * 10);
                player.vy += (dy * 7 - player.vy) * Math.min(1, dt * 10);
            }
        }

        player.x += player.vx * dt;
        player.y += player.vy * dt;
        player.x = Math.max(player.w / 2, Math.min(GAME.width - player.w / 2, player.x));
        player.y = Math.max(player.h / 2 + 20, Math.min(GAME.height - player.h / 2 - 10, player.y));

        if (isPlaneTouchMode() || keys.Space) shoot();

        GAME.shotTimer = Math.max(0, GAME.shotTimer - dt * 1000);
        GAME.spawnTimer -= dt * 1000;

        if (GAME.fireLevel > 1) {
            GAME.powerUpTimer -= dt * 1000;
            if (GAME.powerUpTimer <= 0) {
                GAME.fireLevel = 1;
                GAME.powerUpTimer = 0;
            }
        }

        updatePlaneWaveState(dt);

        if (GAME.boss) {
            const boss = GAME.boss;
            boss.phaseElapsed = (boss.phaseElapsed || 0) + dt;
            if (boss.phaseLockMessageTimer > 0) {
                boss.phaseLockMessageTimer = Math.max(0, boss.phaseLockMessageTimer - dt * 1000);
            }
            if (boss.phaseTransitionTimer > 0) {
                boss.phaseTransitionTimer = Math.max(0, boss.phaseTransitionTimer - dt * 1000);
            }
            updateBossPhaseTransitions(boss);
            if (typeof boss.move === 'function') {
                boss.move(boss, dt, GAME);
            } else {
                const factor = GAME.slowdownFactor || 1;
                boss.y += 50 * dt * factor;
                if (boss.y > 100) boss.y = 100;
                boss.x += boss.speed * dt * factor * boss.dir;
                if (boss.x <= 10 || boss.x + boss.w >= GAME.width - 10) boss.dir *= -1;
            }
            if ((boss.phaseTransitionTimer || 0) > 0) {
                boss.shootTimer = Math.max(boss.shootTimer || 0, 0.35);
            } else if (typeof boss.shoot === 'function') {
                boss.shoot(boss, dt, enemyBullets);
            } else {
                boss.shootTimer -= dt;
                if (boss.shootTimer <= 0) {
                    boss.shootTimer = 1.2 + Math.random() * 0.5;
                    for (let i = -1; i <= 1; i += 1) {
                        createEnemyBullet(boss.x + boss.w / 2 + i * 14, boss.y + boss.h / 2, i * 30, 180);
                    }
                }
            }
            if ((boss.phaseTransitionTimer || 0) <= 0) updateBossPhasePressure(boss, dt);
        }

        if (GAME.spawnTimer <= 0 && shouldSpawnPlaneWaveEnemy()) {
            const eliteWave = GAME.waveState === 'elite';
            spawnEnemy(
                eliteWave ? ['tank', 'shooter', 'medium', 'sine'] : ['small', 'fast', 'sine', 'medium'],
                eliteWave
            );
            GAME.spawnTimer = eliteWave
                ? Math.max(420, 880 - GAME.level * 34)
                : Math.max(210, 560 - GAME.level * 28);
        }

        bullets.forEach((b) => {
            if (b.life != null) b.life -= dt;
            if (b.magic && b.magicHoming > 0) {
                const target = findNearestPlaneTarget(b.x, b.y);
                if (target) {
                    const tx = target.x + target.w / 2;
                    const dx = tx - b.x;
                    b.vx = (b.vx || 0) + Math.max(-220, Math.min(220, dx * 3.4)) * b.magicHoming * dt;
                    b.vx = Math.max(-180, Math.min(180, b.vx || 0));
                }
            }
            if (b.missile) {
                const target = findNearestPlaneTarget(b.x, b.y);
                if (target) {
                    const tx = target.x + target.w / 2;
                    const dx = tx - b.x;
                    b.vx = (b.vx || 0) + Math.max(-180, Math.min(180, dx * 2.8)) * (b.missileTurnMult || 1) * dt;
                    b.vx = Math.max(-190, Math.min(190, b.vx || 0));
                }
            }
            if (b.burst) {
                b.x += (b.vx || 0) * dt;
                b.y += (b.vy || -b.speed) * dt;
            } else if (b.melee) {
                b.x = player.x;
                b.y = player.y - player.h * 0.25;
            } else {
                b.x += (b.vx || 0) * dt;
                b.y -= b.speed * dt;
            }
        });
        bullets = bullets.filter((b) => (b.life == null || b.life > 0) && b.y + b.h / 2 > -30 && b.y < GAME.height + 30 && b.x > -30 && b.x < GAME.width + 30);
        enemyBullets.forEach((b) => {
            b.x += b.vx * dt * (b.ignoreSlow ? 1 : GAME.slowdownFactor);
            b.y += b.vy * dt * (b.ignoreSlow ? 1 : GAME.slowdownFactor);
            b.life = (b.life || 8) - dt;
        });
        enemyBullets = enemyBullets.filter((b) => b.life > 0 && b.y < GAME.height + 28 && b.y > -28 && b.x > -28 && b.x < GAME.width + 28);

        enemies.forEach((e) => {
            if (typeof e.move === 'function') {
                e.move(e, dt, GAME);
            } else {
                e.y += e.speed * dt * GAME.slowdownFactor;
            }
            if (typeof e.shoot === 'function') {
                e.shoot(e, dt, enemyBullets);
            }
        });

        powerUps.forEach((p) => {
            if (GAME.magnetTimer > 0 && player) {
                const dx = player.x - p.x;
                const dy = player.y - p.y;
                const dist = Math.hypot(dx, dy) || 1;
                if (dist < getMagnetRange()) {
                    p.x += dx / dist * getMagnetPullSpeed() * dt;
                    p.y += dy / dist * getMagnetPullSpeed() * dt;
                    return;
                }
            }
            p.y += 120 * dt;
        });
        powerUps = powerUps.filter((p) => p.y < GAME.height + 20);

        particles.forEach((p) => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
        });
        particles = particles.filter((p) => p.life > 0);
        limitGameEntities();

        for (let i = bullets.length - 1; i >= 0; i -= 1) {
            for (let j = enemies.length - 1; j >= 0; j -= 1) {
                const bullet = bullets[i];
                const enemy = enemies[j];
                if (!bullet || !enemy) continue;
                if (bullet.hitEnemies?.has(enemy)) continue;
                if (rectHit(getBulletRect(bullet), getCenteredHitRect(enemy, enemy.w, enemy.h))) {
                    if (!bullet.hitEnemies) bullet.hitEnemies = new Set();
                    bullet.hitEnemies.add(enemy);
                    const damage = getPlaneBulletDamage(bullet, 'enemy');
                    enemy.hp -= damage;
                    applyPlaneSplashDamage(bullet.x, bullet.y, bullet.explosionRadius || 0, damage, enemy, bullet.splashDamageMult || 1);
                    triggerPlaneMagicChain(bullet, enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy);
                    consumePlaneBulletHit(bullet, i);
                    if (bullet.lifeStealRatio > 0 && player) {
                        const heal = Math.max(1, Math.round(damage * bullet.lifeStealRatio));
                        GAME.hp = Math.min(GAME.maxHp, GAME.hp + heal);
                        requestPlaneHudUpdate();
                    }
                    if (bullet.meleeBarrierOnHitRatio > 0 && player) {
                        addPlaneBarrier(GAME.maxHp * bullet.meleeBarrierOnHitRatio);
                        requestPlaneHudUpdate();
                    }
                    if (bullet.melee) chargePlaneMeleeHeat(buildStats);
                    if (bullet.magicSlowChance > 0 && Math.random() < bullet.magicSlowChance) {
                        GAME.slowdownFactor = Math.min(GAME.slowdownFactor, 0.72);
                        GAME.slowdownTimer = Math.max(GAME.slowdownTimer, 1200);
                    }
                    if (bullet.missile || bullet.explosionRadius || bullet.melee) triggerShake(bullet.melee ? 1.2 : 2, 80);
                    addExplosionParticles(enemy.x + enemy.w / 2, enemy.y + enemy.h / 2, enemy.color, bullet.missile || bullet.meteor ? 12 : bullet.melee ? 9 : 7);
                    if (enemy.hp <= 0 && enemies.includes(enemy)) {
                        const enemyIndex = enemies.indexOf(enemy);
                        triggerShake(enemy.elite ? 3.2 : 2.2, enemy.elite ? 150 : 95);
                        addPlaneScore(enemy.scoreValue || 10);
                        dropRandomPowerUp(enemy.x + enemy.w / 2, enemy.y, enemy.type === 'tank' || enemy.type === 'shooter');
                        recordPlaneEnemyKill(enemy);
                        triggerPlaneKillBuildEffects(enemy.x + enemy.w / 2, enemy.y);
                        if (enemyIndex >= 0) enemies.splice(enemyIndex, 1);
                        requestPlaneHudUpdate();
                    }
                    break;
                }
            }
        }

        if (GAME.boss) {
            for (let i = bullets.length - 1; i >= 0; i -= 1) {
                const bullet = bullets[i];
                if (!bullet || bullet.hitBoss) continue;
                if (rectHit(getBulletRect(bullet), getBossHitRect(GAME.boss))) {
                    bullet.hitBoss = true;
                    const hitX = bullet.x;
                    const hitY = bullet.y;
                    const damage = getPlaneBulletDamage(bullet, 'boss');
                    const source = bullet.burst ? 'burst' : 'shot';
                    const burstId = bullet.burstId || 0;
                    consumePlaneBulletHit(bullet, i);
                    const result = applyBossDamage(damage, source, { burstId });
                    applyPlaneSplashDamage(hitX, hitY, bullet.explosionRadius || 0, damage, null, bullet.splashDamageMult || 1);
                    triggerPlaneMagicChain(bullet, hitX, hitY, null);
                    if (result.applied > 0) {
                        if (bullet.lifeStealRatio > 0 && player) {
                            const heal = Math.max(1, Math.round(result.applied * bullet.lifeStealRatio));
                            GAME.hp = Math.min(GAME.maxHp, GAME.hp + heal);
                            requestPlaneHudUpdate();
                        }
                        if (bullet.meleeBarrierOnHitRatio > 0 && player) {
                            addPlaneBarrier(GAME.maxHp * bullet.meleeBarrierOnHitRatio);
                            requestPlaneHudUpdate();
                        }
                        if (bullet.melee) chargePlaneMeleeHeat(buildStats);
                        if (bullet.missile || bullet.burst || bullet.explosionRadius || bullet.melee) triggerShake(bullet.missile ? 3 : 1.8, bullet.missile ? 120 : 75);
                        addExplosionParticles(hitX, hitY, bullet.missile || bullet.meteor ? '#ff9d2e' : bullet.melee ? '#ff6b9d' : '#ffd700', bullet.missile || bullet.meteor ? 12 : bullet.melee ? 9 : 5);
                    }
                    if (GAME.boss && GAME.boss.hp <= 0) {
                        defeatCurrentBoss();
                    }
                    break;
                }
            }
        }

        const playerRect = getPlayerHitRect();
        for (let i = enemyBullets.length - 1; i >= 0; i -= 1) {
            const b = enemyBullets[i];
            const size = b.size || 5;
            const bulletRect = { x: b.x - size, y: b.y - size, w: size * 2, h: size * 2 };
            if (!b.grazed && GAME.invincibleTimer <= 0 && Math.abs(player.x - b.x) < size + 20 && Math.abs(player.y - b.y) < size + 26 && !rectHit(playerRect, bulletRect)) {
                b.grazed = true;
                GAME.score += GAME.doubleScoreTimer > 0 ? 2 : 1;
                GAME.combo = Math.min(99, GAME.combo + 1);
                GAME.comboTimer = 1500;
                const grazeBarrier = getPlaneBuildStats().grazeBarrierRatio;
                if (grazeBarrier > 0 && addPlaneBarrier(GAME.maxHp * grazeBarrier) > 0) requestPlaneHudUpdate();
                const grazeRefund = getPlaneBuildStats().grazeShotRefundMs;
                if (grazeRefund > 0) GAME.shotTimer = Math.max(0, GAME.shotTimer - grazeRefund);
                if (GAME.combo % 10 === 0) setPlaneMessage(`擦弹连击 ×${GAME.combo}`, 650);
            }
            if (rectHit(playerRect, bulletRect)) {
                enemyBullets.splice(i, 1);
                if (GAME.invincibleTimer > 0) continue;
                if (consumePlaneShield()) {
                    continue;
                } else {
                    handlePlayerHit(b.damage || getIncomingDamage(ENEMY_DAMAGE_RATIOS.bossBullet), '弹幕命中');
                    if (!GAME.running || GAME.respawnTimer > 0) return;
                }
            }
        }

        for (let i = enemies.length - 1; i >= 0; i -= 1) {
            const e = enemies[i];
            if (e.y > GAME.height + 20) {
                enemies.splice(i, 1);
                GAME.score = Math.max(0, GAME.score - 5);
                breakCombo();
                requestPlaneHudUpdate();
                continue;
            }
            if (rectHit(getPlayerHitRect(), getCenteredHitRect(e, e.w, e.h))) {
                enemies.splice(i, 1);
                if (GAME.invincibleTimer > 0) continue;
                if (consumePlaneShield()) {
                    continue;
                } else {
                    handlePlayerHit(getEnemyContactDamage(e), '撞上敌机');
                    if (!GAME.running || GAME.respawnTimer > 0) return;
                }
            }
        }

        if (GAME.boss && rectHit(getPlayerHitRect(), getBossHitRect(GAME.boss))) {
            if (GAME.invincibleTimer <= 0 && GAME.bossContactTimer <= 0) {
                if (consumePlaneShield()) {
                    GAME.bossContactTimer = 450;
                    player.y = Math.min(GAME.height - player.h / 2 - 10, player.y + 18);
                    return;
                }
                handlePlayerHit(getIncomingDamage(ENEMY_DAMAGE_RATIOS.bossContact), '撞上首领');
                GAME.bossContactTimer = 450;
                player.y = Math.min(GAME.height - player.h / 2 - 10, player.y + 18);
                if (!GAME.running || GAME.respawnTimer > 0) return;
            }
        }

        for (let i = powerUps.length - 1; i >= 0; i -= 1) {
            const p = powerUps[i];
            if (Math.hypot(player.x - p.x, player.y - p.y) < 25) {
                if (p.type === 'fire') {
                    GAME.fireLevel = Math.min(FIRE_LEVEL_MAX, GAME.fireLevel + 1);
                    GAME.powerUpTimer = 15000;
                } else if (p.type === 'shield') {
                    GAME.shieldActive = true;
                } else if (p.type === 'bomb') {
                    GAME.bombs += 1;
                } else if (p.type === 'heal') {
                    const healAmount = Math.max(1, Math.round(HEAL_AMOUNT * getPlaneBuildStats().healMult));
                    GAME.hp = Math.min(GAME.maxHp, GAME.hp + healAmount);
                    setPlaneMessage(`装甲 +${healAmount}`, 900);
                } else if (p.type === 'slow') {
                    GAME.slowdownFactor = 0.5;
                    GAME.slowdownTimer = 5000;
                } else if (p.type === 'doubleScore') {
                    GAME.doubleScoreTimer = 10000;
                } else if (p.type === 'magnet') {
                    GAME.magnetTimer = getMagnetDuration();
                    setPlaneMessage('磁力吸附启动', 1000);
                } else if (p.type === 'drone') {
                    const before = GAME.droneCount;
                    GAME.droneCount = Math.min(DRONE_MAX_COUNT, GAME.droneCount + 1);
                    GAME.droneTimer = getDroneDuration();
                    if (before === 0) setPlaneMessage('左僚机上线', 1000);
                    else if (before === 1) setPlaneMessage('右僚机上线', 1000);
                    else if (before === 2) setPlaneMessage('下僚机上线', 1000);
                    else setPlaneMessage('僚机已满，持续时间刷新', 1000);
                } else if (p.type === 'burst') {
                    GAME.burstCharges = Math.min(3, GAME.burstCharges + 1);
                    setPlaneMessage('爆发充能完成，按 E 释放', 1100);
                }
                powerUps.splice(i, 1);
                requestPlaneHudUpdate();
            }
        }
    };

    const handlePlayerHit = (damage, reason = '机体受损') => {
        if (GAME.invincibleTimer > 0) return;
        if (GAME.lastDamageFrame === GAME.frameId) return;
        GAME.lastDamageFrame = GAME.frameId;
        const buildStats = getPlaneBuildStats();
        const summonGuard = summons.length > 0 ? buildStats.summonGuardDamageTakenMult : 1;
        let actualDamage = Math.max(1, Math.round((damage || getIncomingDamage(ENEMY_DAMAGE_RATIOS.medium)) * buildStats.damageTakenMult * summonGuard));
        triggerShake(8, 260);
        breakCombo();
        addExplosionParticles(player.x, player.y, '#ff3366', 25);
        GAME.hitFlashTimer = 420;
        if (GAME.barrierHp > 0) {
            const absorbed = Math.min(GAME.barrierHp, actualDamage);
            GAME.barrierHp -= absorbed;
            actualDamage -= absorbed;
            if (actualDamage <= 0) {
                setPlaneMessage(`护盾层吸收 ${absorbed}`, 700);
                requestPlaneHudUpdate();
                return;
            }
        }
        if (actualDamage > 0 && buildStats.meleeMode && buildStats.meleeCounterSlashDamageMult > 0) {
            createPlaneMeleeSlash(buildStats, 'counter');
            setPlaneMessage('受击反斩', 520);
        }
        GAME.hp = Math.max(0, GAME.hp - actualDamage);
        setPlaneMessage(`${reason} -${actualDamage}生命`, 760);
        requestPlaneHudUpdate();
        if (GAME.hp > 0) return;

        GAME.lives -= 1;
        if (GAME.lives <= 0) {
            requestPlaneHudUpdate();
            gameOverTrigger();
            return;
        }
        GAME.hp = GAME.maxHp;
        GAME.barrierHp = 0;
        GAME.invincibleTimer = LIFE_LOST_INVINCIBLE_MS;
        GAME.respawnTimer = 520;
        GAME.bossContactTimer = 700;
        GAME.lastTime = performance.now();
        player.x = GAME.width / 2;
        player.y = GAME.height - 70;
        player.vx = 0;
        player.vy = 0;
        enemyBullets = [];
        enemies = enemies.filter((enemy) => enemy.y < GAME.height * 0.55);
        setPlaneMessage('损失一条命，1.5秒复位保护', 1200);
        requestPlaneHudUpdate();
    };

    const finishPlaneRun = () => {
        GAME.running = false;
        GAME.paused = false;
        GAME.gameOver = true;
        GAME.menuScreen = 'gameover';
        GAME.buildDraft = null;
        GAME.boss = null;
        enemyBullets = [];
        enemies = [];
        summons = [];
        grantPlaneGameOverRewards();
        planePauseBtn.classList.add('hidden');
        planeRestartBtn.classList.remove('hidden');
        planeStartBtn.classList.add('hidden');
        requestPlaneHudUpdate();
        updatePlaneActionButtons();
        updatePlaneModeUI();
        submitCloudScore('plane', GAME.score, {
            level: GAME.level,
            stage: GAME.difficultyStage,
            combo: GAME.bestCombo,
            coins: GAME.runCoinsEarned,
            victory: GAME.runVictory,
        });
    };

    const victoryTrigger = () => {
        GAME.runVictory = true;
        finishPlaneRun();
        setPlaneMessage(`通关奖励 +${GAME.runCoinsEarned}金币`, 1800);
    };

    const gameOverTrigger = () => {
        GAME.runVictory = false;
        finishPlaneRun();
        setPlaneMessage(`结算 +${GAME.runCoinsEarned}金币`, 1600);
    };

    const useBomb = () => {
        if (GAME.bombs <= 0 || !GAME.running || GAME.paused) return;
        GAME.bombs -= 1;
        triggerShake(9, 280);
        setPlaneMessage('炸弹清屏', 900);
        enemies.forEach((e) => addExplosionParticles(e.x + e.w / 2, e.y + e.h / 2, e.color, 8));
        enemies = [];
        enemyBullets = [];
        if (GAME.boss) {
            const result = applyBossDamage(getBombDamage(), 'bomb');
            if (result.applied > 0) addExplosionParticles(GAME.boss.x + GAME.boss.w / 2, GAME.boss.y + GAME.boss.h / 2, '#ffcc00', 25);
            if (GAME.boss && GAME.boss.hp <= 0) {
                defeatCurrentBoss();
            }
        }
        particles.push({ x: GAME.width / 2, y: GAME.height / 2, vx: 0, vy: 0, life: 0.3, maxLife: 0.3, color: '#fff', size: GAME.width * 1.2 });
        requestPlaneHudUpdate();
    };

    const useBurst = () => {
        if (GAME.burstCharges <= 0 || !GAME.running || GAME.paused) return;
        GAME.burstCharges -= 1;
        triggerShake(6, 180);
        const count = 16;
        const damage = Math.max(1, Math.round(getPlayerDamage() * getPlaneBuildStats().burstDamageMult));
        GAME.burstSequence += 1;
        const burstId = GAME.burstSequence;
        for (let i = 0; i < count; i += 1) {
            const angle = (Math.PI * 2 / count) * i;
            bullets.push({
                x: player.x + Math.cos(angle) * 12,
                y: player.y + Math.sin(angle) * 12,
                w: 5,
                h: 14,
                speed: 360,
                vx: Math.cos(angle) * 260,
                vy: Math.sin(angle) * 260,
                burst: true,
                burstId,
                damage,
            });
        }
        addExplosionParticles(player.x, player.y, '#f7f36a', 22);
        setPlaneMessage('能量爆发', 900);
        requestPlaneHudUpdate();
    };

    const renderPlaneGame = () => {
        ctx.save();
        if (GAME.shakeTimer > 0) {
            const power = GAME.shakeIntensity * (GAME.shakeTimer / 280);
            ctx.translate((Math.random() - 0.5) * power, (Math.random() - 0.5) * power);
        }
        drawBackground();
        drawBullets();
        drawEnemies();
        drawBoss();
        drawPowerUps();
        drawParticles();
        drawSummons();
        drawPlayer();
        ctx.restore();

        if (GAME.hitFlashTimer > 0) {
            ctx.save();
            const alpha = Math.min(0.32, GAME.hitFlashTimer / 1200);
            ctx.fillStyle = `rgba(255,51,102,${alpha})`;
            ctx.fillRect(0, 0, GAME.width, GAME.height);
            ctx.restore();
        }

        drawPlaneWaveOverlay();

        if (GAME.buildDraft) {
            drawPlaneBuildDraftOverlay();
        }

        if (GAME.message && GAME.messageTimer > 0) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.font = 'bold 15px sans-serif';
            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            ctx.roundRect(GAME.width / 2 - 128, 42, 256, 34, 16);
            ctx.fill();
            ctx.fillStyle = '#ffd700';
            ctx.fillText(GAME.message, GAME.width / 2, 64);
            ctx.restore();
        }

        if (!GAME.running && !GAME.gameOver) {
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.34)';
            ctx.fillRect(0, 0, GAME.width, GAME.height);
            ctx.restore();
            drawPlaneIdleScreen();
        }

        if (GAME.paused && GAME.running && !GAME.buildDraft) {
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.fillRect(0, 0, GAME.width, GAME.height);
            ctx.fillStyle = '#e8e8f0';
            ctx.textAlign = 'center';
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText('游戏已暂停', GAME.width / 2, GAME.height / 2);
            ctx.restore();
        }

        if (GAME.gameOver) {
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, GAME.width, GAME.height);
            ctx.restore();
            planeCanvasButtons = [];
            drawPlaneGameOverScreen();
        }
    };

    const loopPlane = (time) => {
        if (!GAME.running || GAME.paused) {
            renderPlaneGame();
            return;
        }

        const dt = Math.min(0.032, (time - GAME.lastTime) / 1000 || 0);
        GAME.lastTime = time;

        updatePlaneGame(dt);
        renderPlaneGame();

        if (GAME.running) {
            planeAnimId = requestAnimationFrame(loopPlane);
        }
    };

    const updatePlaneModeUI = () => {
        const touch = isPlaneTouchMode();
        const planeSection = document.getElementById('plane');
        const mainPage = document.getElementById('main-page');
        const mobileBottomNav = document.getElementById('mobile-bottom-nav');
        const playing = GAME.running && !GAME.paused && !GAME.gameOver && !planeSection?.classList.contains('hidden');
        planeSection?.classList.toggle('plane-touch-mode', touch);
        planeSection?.classList.toggle('plane-keyboard-mode', !touch);
        planeSection?.classList.toggle('plane-low-power', isPlaneLowPowerMode());
        planeSection?.classList.toggle('is-plane-playing', playing);
        mainPage?.classList.toggle('is-plane-playing', playing);
        mobileBottomNav?.classList.toggle('is-plane-playing', playing);
        if (planeControlHint) {
            planeControlHint.innerHTML = touch
                ? '触屏模式：拖动画布移动，自动攻击；下方按钮释放炸弹 / 爆发；<kbd>Esc</kbd> 暂停'
                : '<kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> 移动 / 拖动画布移动 &nbsp; <kbd>空格</kbd> 射击 &nbsp; <kbd>Q</kbd> 炸弹 &nbsp; <kbd>E</kbd> 爆发 &nbsp; <kbd>Esc</kbd> 暂停';
        }
        updatePlaneActionButtons();
    };

    const startPlaneGame = () => {
        resizeCanvas({ playLayout: true });
        if (planeAnimId) cancelAnimationFrame(planeAnimId);
        resetPlaneGame();
        setPlaneMenuView('main');
        GAME.running = true;
        GAME.paused = false;
        GAME.gameOver = false;
        setPlaneWaveState('small');
        GAME.lastTime = performance.now();
        planeStartBtn.classList.add('hidden');
        planeRestartBtn.classList.remove('hidden');
        planePauseBtn.classList.remove('hidden');
        planePauseBtn.textContent = '暂停';
        openPlaneBuildDraft(createPlaneCoreDraft());
        updatePlaneModeUI();
        requestPlaneHudUpdate();
        planeAnimId = requestAnimationFrame(loopPlane);
    };

    planeStartBtn.addEventListener('click', () => {
        selectedPlaneStage = Math.min(selectedPlaneStage, getPlaneMaxStageUnlocked());
        setPlaneMenuView('stage');
        updatePlaneModeUI();
    });

    planeRestartBtn.addEventListener('click', () => {
        startPlaneGame();
    });

    planePauseBtn.addEventListener('click', () => {
        if (!GAME.running && !GAME.gameOver) return;
        if (GAME.gameOver) return;
        if (GAME.buildDraft) return;
        GAME.paused = !GAME.paused;
        planePauseBtn.textContent = GAME.paused ? '继续' : '暂停';
        updatePlaneModeUI();
        if (!GAME.paused) {
            GAME.lastTime = performance.now();
            schedulePlaneFrame();
        }
    });

    const isTypingTarget = (target) => {
        const tag = target?.tagName?.toLowerCase();
        return tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable;
    };

    const updatePointerControl = (event) => {
        if (!GAME.running || GAME.paused || GAME.gameOver) return;
        const rect = planeCanvas.getBoundingClientRect();
        const clientX = event.clientX ?? event.touches?.[0]?.clientX;
        const clientY = event.clientY ?? event.touches?.[0]?.clientY;
        if (clientX == null || clientY == null) return;
        const canvasX = (clientX - rect.left) * (GAME.width / Math.max(1, rect.width));
        const canvasY = (clientY - rect.top) * (GAME.height / Math.max(1, rect.height));
        pointerControl.x = Math.max(player.w / 2, Math.min(GAME.width - player.w / 2, canvasX));
        pointerControl.y = Math.max(player.h / 2 + 20, Math.min(GAME.height - player.h / 2 - 10, canvasY));
    };

    planeCanvas.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        const rect = planeCanvas.getBoundingClientRect();
        const clickX = (event.clientX - rect.left) * (GAME.width / rect.width);
        const clickY = (event.clientY - rect.top) * (GAME.height / rect.height);
        if (GAME.buildDraft && hitPlaneCanvasButton(clickX, clickY)) {
            pointerControl.active = false;
            return;
        }
        if ((!GAME.running || GAME.gameOver) && hitPlaneCanvasButton(clickX, clickY)) {
            pointerControl.active = false;
            return;
        }
        pointerControl.active = true;
        planeCanvas.setPointerCapture?.(event.pointerId);
        updatePointerControl(event);
    });
    planeCanvas.addEventListener('pointermove', (event) => {
        if (!pointerControl.active) return;
        event.preventDefault();
        updatePointerControl(event);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((type) => {
        planeCanvas.addEventListener(type, () => { pointerControl.active = false; });
    });

    const bindPlaneActionButton = (button, handler) => {
        if (!button) return;
        let ignoreClickUntil = 0;
        const run = (event) => {
            event.preventDefault();
            event.stopPropagation();
            handler();
            updatePlaneActionButtons();
        };
        button.addEventListener('pointerdown', (event) => {
            if (event.pointerType === 'mouse') return;
            ignoreClickUntil = performance.now() + 500;
            run(event);
        });
        button.addEventListener('click', (event) => {
            if (performance.now() < ignoreClickUntil) {
                event.preventDefault();
                return;
            }
            run(event);
        });
    };

    bindPlaneActionButton(planeBombBtn, useBomb);
    bindPlaneActionButton(planeBurstBtn, useBurst);

    window.addEventListener('keydown', (event) => {
        const planeSection = document.getElementById('plane');
        const isPlaneActive = planeSection && !planeSection.classList.contains('hidden');
        if (!isPlaneActive || planeSection.closest?.('.hidden') || document.getElementById('main-page')?.classList.contains('hidden')
            || document.hidden || isTypingTarget(event.target) || event.isComposing || event.keyCode === 229 || event.key === 'Process') return;

        const gameKeys = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ', 'Spacebar', 'q', 'Q', 'e', 'E', 'Escape'];
        if (gameKeys.includes(event.key)) event.preventDefault();

        if (event.key === 'ArrowLeft') keys.ArrowLeft = true;
        if (event.key === 'ArrowRight') keys.ArrowRight = true;
        if (event.key === 'ArrowUp') keys.ArrowUp = true;
        if (event.key === 'ArrowDown') keys.ArrowDown = true;
        if (event.key === ' ' || event.key === 'Spacebar') keys.Space = true;
        if (event.key === 'q' || event.key === 'Q') useBomb();
        if (event.key === 'e' || event.key === 'E') useBurst();
        if (event.key === 'Escape' && GAME.running && !GAME.gameOver && !GAME.buildDraft) {
            GAME.paused = !GAME.paused;
            planePauseBtn.textContent = GAME.paused ? '继续' : '暂停';
            updatePlaneModeUI();
            if (!GAME.paused) {
                GAME.lastTime = performance.now();
                schedulePlaneFrame();
            }
        }
    });

    window.addEventListener('keyup', (event) => {
        if (event.key === 'ArrowLeft') keys.ArrowLeft = false;
        if (event.key === 'ArrowRight') keys.ArrowRight = false;
        if (event.key === 'ArrowUp') keys.ArrowUp = false;
        if (event.key === 'ArrowDown') keys.ArrowDown = false;
        if (event.key === ' ' || event.key === 'Spacebar') keys.Space = false;
    });
    window.addEventListener('blur', clearPlaneInputs);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) clearPlaneInputs();
    });


    return {
        state: GAME,
        resize: resizeCanvas,
        render: renderPlaneGame,
        reset: resetPlaneGame,
        setMenuView: setPlaneMenuView,
        updateProgressUI: updatePlaneProgressUI,
        isRunning: () => GAME.running,
        isGameOver: () => GAME.gameOver,
        syncMobileMode: updatePlaneModeUI,
        pause: () => {
            clearPlaneInputs();
            if (!GAME.running) return;
            GAME.paused = true;
            planePauseBtn.textContent = '继续';
            updatePlaneModeUI();
        },
    };
};
