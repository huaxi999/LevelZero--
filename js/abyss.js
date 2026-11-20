import {
    ABYSS_ASSETS, ABYSS_CHARACTERS, ABYSS_SLOTS, ABYSS_SLOT_LABELS,
    ABYSS_RARITIES, ABYSS_ITEM_GRADES, ABYSS_DIFFICULTIES, ABYSS_COMBAT, ABYSS_SKILL_CATALOG, ABYSS_MONSTERS, ABYSS_BOSSES,
    ABYSS_AREAS, ABYSS_EQUIPMENT, ABYSS_RARITY_LOOT, ABYSS_STANDARD_DROP_BANDS, ABYSS_DEEP_DROP_BANDS, ABYSS_DEEP_BOSS_IDS,
} from './abyss-data.js';
import { getAbyssSave, setAbyssSave } from './abyss-storage.js';

const W = 1280;
const H = 720;
const keys = new Set();
const touchPointers = new Map();
const SPRINT_DOUBLE_TAP_MS = 260;
const SPRINT_SPEED_MULTIPLIER = 1.65;
const skillKeys = ['H', 'K', 'L', 'Y', 'U', 'I', 'O', 'P', '1', '2', '3', '4'];
const skillPalettes = {
    sword: ['#9eeaff', '#b8f3ff', '#d4c6ff', '#79d8ff', '#91f5ff', '#b7a4ff', '#f5e59a', '#d4a4ff', '#8ff4ff', '#fff1a8', '#a895ff', '#f7fbff'],
    brawler: ['#ff9a62', '#ffbd6b', '#ffe078', '#ff7c5f', '#ffb052', '#ff6f4d', '#ffd078', '#ff8b64', '#ff5f45', '#ffcf6c', '#ff785b', '#fff0a3'],
};
const skillColorFor = (classId, index) => skillPalettes[classId]?.[Math.max(0, index)] || (classId === 'sword' ? '#9eeaff' : '#ff864f');
const enemyActionPalette = {
    area: { solid: '#ff7169', fill: 'rgba(255, 88, 79, .25)' },
    pulse: { solid: '#d98cff', fill: 'rgba(199, 100, 255, .23)' },
    dash: { solid: '#ffad52', fill: 'rgba(255, 158, 61, .22)' },
    projectile: { solid: '#78ddff', fill: 'rgba(85, 205, 255, .21)' },
    summon: { solid: '#b982ff', fill: 'rgba(154, 90, 255, .24)' },
    melee: { solid: '#ffd66c', fill: 'rgba(255, 210, 91, .18)' },
};
const enemyActionColor = (type) => enemyActionPalette[type] || enemyActionPalette.melee;
const copy = (value) => JSON.parse(JSON.stringify(value));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const xpFor = (level) => 90 + level * 48;
const statLabel = {
    physicalAttack: '物理攻击', magicalAttack: '魔法攻击', independentAttack: '独立攻击', strength: '力量', intelligence: '智力', vitality: '体力', spirit: '精神', hp: '生命上限', mp: '魔力上限',
    physicalDefense: '物理防御', magicalDefense: '魔法防御', physicalCrit: '物理暴击', magicalCrit: '魔法暴击', attackSpeed: '攻击速度', castSpeed: '施放速度', moveSpeed: '移动速度',
    allElement: '所有属性强化', fireElement: '火属性强化', iceElement: '冰属性强化', lightElement: '光属性强化', darkElement: '暗属性强化',
    damageIncrease: '伤害增加', skillAttack: '技能攻击力', criticalDamage: '暴击伤害', cooldownReduction: '冷却缩减', allSkillLevel: '所有技能等级', damageReduction: '伤害减免',
};
const percentStats = new Set(['attackSpeed', 'castSpeed', 'moveSpeed', 'damageIncrease', 'skillAttack', 'criticalDamage', 'cooldownReduction', 'damageReduction']);
const slotIcon = { weapon: '刃', headShoulder: '肩', top: '甲', bottom: '腿', belt: '腰', shoes: '靴', bracelet: '镯', necklace: '链', ring: '戒', title: '冠', support: '徽', magicStone: '石', earring: '耳' };
const armorSlots = ['headShoulder', 'top', 'bottom', 'belt', 'shoes'];
const jewelrySlots = ['bracelet', 'necklace', 'ring'];
const specialSlots = ['title', 'support', 'magicStone', 'earring'];
const formatStat = (key, value) => `${statLabel[key] || key}+${Number(value).toFixed(Number.isInteger(value) ? 0 : 1)}${percentStats.has(key) ? '%' : ''}`;
const characterStatOrder = ['physicalAttack', 'magicalAttack', 'independentAttack', 'strength', 'intelligence', 'vitality', 'spirit', 'hp', 'mp', 'physicalDefense', 'magicalDefense', 'physicalCrit', 'magicalCrit', 'attackSpeed', 'castSpeed', 'moveSpeed', 'allElement', 'damageIncrease', 'skillAttack', 'criticalDamage', 'cooldownReduction', 'damageReduction', 'allSkillLevel'];

const rollItemGrade = () => {
    const entries = Object.entries(ABYSS_ITEM_GRADES);
    let roll = Math.random() * entries.reduce((total, [, grade]) => total + grade.weight, 0);
    let gradeId = 'middle';
    entries.some(([id, grade]) => { roll -= grade.weight; if (roll <= 0) { gradeId = id; return true; } return false; });
    const grade = ABYSS_ITEM_GRADES[gradeId];
    return { grade: gradeId, quality: Number((grade.min + Math.random() * (grade.max - grade.min)).toFixed(2)) };
};
const scaleStatsByQuality = (stats, quality) => Object.fromEntries(Object.entries(stats || {}).map(([key, value]) => [key, key === 'allSkillLevel' ? value : Number((value * quality).toFixed(2))]));
const gradeText = (item) => {
    const grade = ABYSS_ITEM_GRADES[item.grade] || ABYSS_ITEM_GRADES.middle;
    const quality = Number.isFinite(item.quality) ? item.quality : .68;
    return `${grade.name} ${Math.round(quality * 100)}%`;
};
const classText = (item) => item.classId === 'sword' ? '剑士专属' : item.classId === 'brawler' ? '格斗家专属' : '通用';
const createItem = (definition) => {
    const defaultGrade = definition.grade || 'middle';
    const grade = ABYSS_ITEM_GRADES[defaultGrade] || ABYSS_ITEM_GRADES.middle;
    const quality = Number.isFinite(definition.quality) ? definition.quality : Number(((grade.min + grade.max) / 2).toFixed(2));
    return { ...copy(definition), id: `${definition.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, stats: scaleStatsByQuality(definition.stats, quality), grade: defaultGrade, quality, equipped: false, locked: false };
};
const areaById = (id) => ABYSS_AREAS.find((area) => area.id === id);
const dungeonById = (id) => ABYSS_AREAS.flatMap((area) => area.dungeons.map((dungeon) => ({ ...dungeon, area }))).find((dungeon) => dungeon.id === id);
const rarityOrder = Object.keys(ABYSS_RARITIES);
const rarityBoost = {
    adventure: { rare: 1.05, artifact: 1.10, legendary: 1.15, epic: 1.20 },
    king: { rare: 1.08, artifact: 1.18, legendary: 1.30, epic: 1.50 },
};
const sourceBoost = {
    elite: { rare: 1.03, artifact: 1.08, legendary: 1.12, epic: 1.18 },
    chest: { rare: 1.05, artifact: 1.15, legendary: 1.25, epic: 1.35 },
    boss: { rare: 1.10, artifact: 1.25, legendary: 1.50, epic: 1.80 },
};

export const getStandardDropWeights = (level, difficultyId = 'normal', source = 'monster') => {
    const band = ABYSS_STANDARD_DROP_BANDS.find((entry) => level <= entry.maxLevel) || ABYSS_STANDARD_DROP_BANDS.at(-1);
    const difficulty = rarityBoost[difficultyId] || {};
    const sourceModifier = sourceBoost[source] || {};
    return Object.fromEntries(Object.entries(band.weights)
        .filter(([rarity]) => rarity !== 'primordial' && rarity !== 'mythic' && level >= (ABYSS_RARITIES[rarity]?.minLevel ?? Infinity))
        .map(([rarity, weight]) => [rarity, weight * (difficulty[rarity] || 1) * (sourceModifier[rarity] || 1)]));
};

export const rollStandardRarity = (level, difficultyId = 'normal', source = 'monster', random = Math.random) => {
    const entries = Object.entries(getStandardDropWeights(level, difficultyId, source));
    let roll = random() * entries.reduce((total, [, weight]) => total + weight, 0);
    return entries.find(([, weight]) => (roll -= weight) <= 0)?.[0] || 'common';
};

export const getAbyssTicketCost = (level) => level < 50 ? Infinity : 3 + Math.ceil((level - 50) / 3);

export const getAbyssDropWeights = (level) => {
    if (level < 50) return {};
    const band = ABYSS_DEEP_DROP_BANDS.find((entry) => level <= entry.maxLevel) || ABYSS_DEEP_DROP_BANDS.at(-1);
    return Object.fromEntries(Object.entries(band.weights).filter(([rarity]) => level >= (ABYSS_RARITIES[rarity]?.minLevel ?? Infinity)));
};

export const rollAbyssRarity = (level, random = Math.random) => {
    const entries = Object.entries(getAbyssDropWeights(level));
    if (!entries.length) return null;
    let roll = random() * entries.reduce((total, [, weight]) => total + weight, 0);
    return entries.find(([, weight]) => (roll -= weight) <= 0)?.[0] || entries[0][0];
};

export const rollAbyssTicketDrop = (level, random = Math.random) => {
    if (level < 35) return 0;
    if (level < 44) return random() < .35 ? 1 : 0;
    if (level < 50) return random() < .72 ? 1 : 0;
    return 1 + (level >= 58 && random() < .45 ? 1 : 0);
};

export const initAbyssGame = ({ canvas }) => {
    if (!canvas) return { resize() {}, render() {}, pause() {}, resume() {} };
    const ctx = canvas.getContext('2d');
    const virtualControls = document.getElementById('abyss-virtual-controls');
    const virtualMoveButtons = [...(virtualControls?.querySelectorAll('[data-abyss-key]') || [])];
    const virtualActionButtons = [...(virtualControls?.querySelectorAll('[data-abyss-action]') || [])];
    const virtualSkillButtons = [...(virtualControls?.querySelectorAll('[data-abyss-skill-slot]') || [])];
    const virtualSkillHeader = virtualControls?.querySelector('.abyss-virtual-skillbar > header strong');
    const virtualPointerIds = new Set();
    const images = new Map();
    const hitboxes = [];
    let save = getAbyssSave();
    let mode = save.activeId ? 'menu' : 'menu';
    let overlay = '';
    let player = null;
    let town = { x: 500, y: 475, facing: 1, jump: 0, state: 'idle' };
    let run = null;
    let paused = true;
    let lastTime = 0;
    let accumulator = 0;
    let frame = 0;
    let selectedSkillId = '';
    let inventoryPage = 0;
    let inventoryFilter = 'all';
    let inventorySort = 'rarity';
    let inventoryMenu = null;
    let inspectedItemId = '';
    let lastInventoryClick = { id: '', at: -Infinity };
    let audioContext = null;
    let lastCueAt = -1;
    let sprintDirection = 0;
    let virtualSkillPage = 0;
    const lastDirectionTap = { A: -Infinity, D: -Infinity };
    const isAbyssVirtualMode = () => window.matchMedia?.('(hover: none) and (pointer: coarse) and (max-width: 1180px)').matches;
    const pressed = (key) => keys.has(key) || [...touchPointers.values()].includes(key);
    const cancelSprint = () => { sprintDirection = 0; };
    const registerDirectionTap = (key, now = performance.now()) => {
        const direction = key === 'A' ? -1 : 1;
        if (sprintDirection && sprintDirection !== direction) cancelSprint();
        if (now - lastDirectionTap[key] <= SPRINT_DOUBLE_TAP_MS) sprintDirection = direction;
        lastDirectionTap[key] = now;
    };
    const sprintMultiplierFor = (dx) => dx && Math.sign(dx) === sprintDirection && pressed(sprintDirection < 0 ? 'A' : 'D') ? SPRINT_SPEED_MULTIPLIER : 1;

    Object.entries({
        sword: ABYSS_ASSETS.heroes.sword,
        brawler: ABYSS_ASSETS.heroes.brawler,
        swordSprite: ABYSS_ASSETS.heroSprites.sword,
        brawlerSprite: ABYSS_ASSETS.heroSprites.brawler,
        town: ABYSS_ASSETS.townBackdrop,
        ...ABYSS_ASSETS.ui,
    }).forEach(([id, src]) => {
        const image = new Image();
        image.onload = () => { images.set(id, image); render(); };
        image.onerror = () => images.set(id, null);
        image.src = src;
        images.set(id, image);
    });

    Object.entries(ABYSS_ASSETS.heroAnimations).forEach(([classId, animations]) => {
        Object.entries(animations).forEach(([state, animation]) => {
            const image = new Image();
            image.onload = () => render();
            image.onerror = () => images.set(`${classId}:${state}`, null);
            image.src = animation.file;
            images.set(`${classId}:${state}`, image);
        });
    });

    Object.entries(ABYSS_ASSETS.dungeonBackdrops).forEach(([areaId, src]) => {
        const image = new Image();
        image.onload = () => render();
        image.onerror = () => images.set(`dungeonBackdrop:${areaId}`, null);
        image.src = src;
        images.set(`dungeonBackdrop:${areaId}`, image);
    });

    Object.entries(ABYSS_ASSETS.enemyModels).forEach(([id, model]) => {
        const image = new Image();
        image.onload = () => render();
        image.onerror = () => images.set(`enemy:${id}`, null);
        image.src = model.file;
        images.set(`enemy:${id}`, image);
        if (model.eliteFile) {
            const eliteImage = new Image();
            eliteImage.onload = () => render();
            eliteImage.onerror = () => images.set(`enemy:${id}:elite`, null);
            eliteImage.src = model.eliteFile;
            images.set(`enemy:${id}:elite`, eliteImage);
        }
        if (model.idleFile) {
            const idleImage = new Image();
            idleImage.onload = () => render();
            idleImage.onerror = () => images.set(`enemy:${id}:idle`, null);
            idleImage.src = model.idleFile;
            images.set(`enemy:${id}:idle`, idleImage);
        }
    });

    Object.entries(ABYSS_ASSETS.equipmentIcons).forEach(([slot, src]) => {
        const image = new Image();
        image.onload = () => render();
        image.onerror = () => images.set(`equipmentIcon:${slot}`, null);
        image.src = src;
        images.set(`equipmentIcon:${slot}`, image);
    });

    Object.entries(ABYSS_ASSETS.dropAuras).forEach(([rarity, aura]) => {
        const image = new Image();
        image.onload = () => render();
        image.onerror = () => images.set(`dropAura:${rarity}`, null);
        image.src = aura.file;
        images.set(`dropAura:${rarity}`, image);
    });

    const active = () => save.characters[save.activeId] || null;
    const unlockSound = () => {
        if (save.settings?.sound === false) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        if (!audioContext) audioContext = new AudioContextClass();
        if (audioContext.state === 'suspended') audioContext.resume();
    };
    const playCue = (cue) => {
        if (!audioContext || save.settings?.sound === false || audioContext.state !== 'running') return;
        const now = audioContext.currentTime;
        if (now - lastCueAt < .035) return;
        lastCueAt = now;
        const profile = { attack: [180, .035, 'square'], skill: [330, .055, 'sawtooth'], critical: [520, .065, 'square'], hurt: [105, .055, 'triangle'], boss: [72, .09, 'sawtooth'] }[cue];
        if (!profile) return;
        const [frequency, volume, type] = profile;
        const oscillator = audioContext.createOscillator(); const gain = audioContext.createGain();
        oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, now); oscillator.frequency.exponentialRampToValueAtTime(Math.max(42, frequency * .58), now + .09);
        gain.gain.setValueAtTime(volume, now); gain.gain.exponentialRampToValueAtTime(.0001, now + .1);
        oscillator.connect(gain).connect(audioContext.destination); oscillator.start(now); oscillator.stop(now + .105);
    };
    const skillsFor = (hero = active()) => ABYSS_SKILL_CATALOG[hero.classId];
    const ensureSkills = (hero = active()) => {
        if (!hero) return;
        hero.skillPoints = Math.max(0, Number(hero.skillPoints) || 0);
        hero.skills = hero.skills && typeof hero.skills === 'object' ? hero.skills : {};
        hero.warehouse = Array.isArray(hero.warehouse) ? hero.warehouse : [];
        if (hero.skillProgressionVersion !== 2) {
            skillsFor(hero).forEach((entry) => { if (hero.level < entry.unlockLevel) hero.skills[entry.id] = 0; });
            hero.skillProgressionVersion = 2;
        }
        const learned = [];
        skillsFor(hero).forEach((entry) => { if (hero.level >= entry.unlockLevel && (!Number.isFinite(hero.skills[entry.id]) || hero.skills[entry.id] <= 0)) { hero.skills[entry.id] = 1; learned.push(entry); } });
        return learned;
    };
    const skillLevel = (entry, hero = active()) => hero?.skills?.[entry.id] || 0;
    const skillValues = (entry, hero = active()) => {
        const stats = getStats(hero);
        const level = Math.min(entry.maxLevel, skillLevel(entry, hero) + Math.floor(stats.allSkillLevel || 0));
        const step = Math.max(0, level - 1);
        return { level, damage: entry.mult * (1 + entry.growth.damage * step), range: entry.range * (1 + entry.growth.range * step), cooldown: Math.max(.35, entry.cooldown * (1 - entry.growth.cooldown * step) * (1 - Math.min(.7, stats.cooldownReduction / 100))), cost: Math.max(1, Math.ceil(entry.cost * (1 - entry.growth.cost * step))), hits: entry.attacks + Math.floor(step / 4) };
    };
    const upgradeSkill = (entry) => { const hero = active(); ensureSkills(hero); if (hero.skillPoints <= 0 || skillLevel(entry, hero) >= entry.maxLevel || hero.level < entry.unlockLevel) return; hero.skillPoints -= 1; hero.skills[entry.id] = skillLevel(entry, hero) + 1; commit(); };
    const resetSkills = () => { const hero = active(); const cost = 80 + hero.level * 6; if (hero.gold < cost) return; let refund = 0; skillsFor(hero).forEach((entry) => { refund += Math.max(0, skillLevel(entry, hero) - 1); hero.skills[entry.id] = hero.level >= entry.unlockLevel ? 1 : 0; }); hero.gold -= cost; hero.skillPoints += refund; commit(); };
    const commit = () => { if (active()) active().updatedAt = Date.now(); save = setAbyssSave(save); };
    const makeCharacter = (classId) => {
        const definition = ABYSS_CHARACTERS[classId];
        const existingId = `${classId}-save`;
        if (save.characters[existingId]) {
            save.activeId = existingId;
            commit();
            mode = 'town';
            resetPlayer();
            return;
        }
        const weapon = createItem(ABYSS_EQUIPMENT[definition.starterWeapon]);
        const id = existingId;
        save.characters[id] = {
            id, classId, name: definition.name, level: 1, xp: 0, gold: 80,
            inventory: [weapon], equipped: { weapon: weapon.id },
            progress: { cleared: {}, discovered: ['windfall'] }, warehouse: [], materials: { abyssTicket: 0 }, skillProgressionVersion: 2, createdAt: Date.now(), updatedAt: Date.now(),
        };
        save.activeId = id;
        ensureSkills(save.characters[id]);
        commit();
        mode = 'town';
        resetPlayer();
    };
    const resetPlayer = () => {
        const hero = active();
        if (!hero) return;
        cancelSprint();
        ensureSkills(hero);
        const stats = getStats(hero);
        player = {
            x: 355, y: 510, z: 0, vz: 0, grounded: true, facing: 1,
            hp: stats.hp, mp: stats.mp, maxHp: stats.hp, maxMp: stats.mp,
            state: 'idle', stateTime: 0, stateDuration: 0, stateElapsed: 0, action: null, cooldowns: {}, invuln: 0,
            hurtTimer: 0, knockdownTimer: 0, dodgeTimer: 0, dodgeCooldown: 0, comboIndex: 0, comboGrace: 0,
            bufferedAttack: false, bufferedSkill: null, queuedInput: null, hitFlash: 0, armorFlash: 0, armorFeedbackCooldown: 0,
        };
    };
    const getEquipped = (hero) => hero.inventory.filter((item) => hero.equipped[item.slot] === item.id);
    const getStats = (hero) => {
        const definition = ABYSS_CHARACTERS[hero.classId];
        const base = { ...definition.base };
        const levelSteps = Math.max(0, hero.level - 1);
        Object.entries(definition.growth || {}).forEach(([key, value]) => { base[key] = (base[key] || 0) + value * levelSteps; });
        getEquipped(hero).forEach((item) => Object.entries(item.stats || {}).forEach(([key, value]) => { if (key in statLabel || key === 'hp' || key === 'mp') base[key] = (base[key] || 0) + Number(value || 0); }));
        base.hp = Math.round(base.hp + base.vitality * 12);
        base.mp = Math.round(base.mp + base.spirit * 7);
        base.physicalDefense = Math.round(base.physicalDefense + base.vitality * 2);
        base.magicalDefense = Math.round(base.magicalDefense + base.spirit * 2);
        base.physicalCrit = clamp(base.physicalCrit, 0, 100);
        base.magicalCrit = clamp(base.magicalCrit, 0, 100);
        base.elementalStrength = (base[`${definition.attackElement}Element`] || 0) + base.allElement;
        base.attackSpeedMultiplier = Math.max(.7, 1 + base.attackSpeed / 100);
        base.castSpeedMultiplier = Math.max(.7, 1 + base.castSpeed / 100);
        base.moveSpeedActual = base.baseMoveSpeed * Math.max(.55, 1 + base.moveSpeed / 100);
        return base;
    };
    const gainXp = (amount) => {
        const hero = active();
        hero.xp += amount;
        while (hero.level < 60 && hero.xp >= xpFor(hero.level)) {
            hero.xp -= xpFor(hero.level);
            hero.level += 1;
            hero.skillPoints = (hero.skillPoints || 0) + 1;
            const learned = ensureSkills(hero);
            player.maxHp = getStats(hero).hp;
            player.maxMp = getStats(hero).mp;
            player.hp = player.maxHp;
            player.mp = player.maxMp;
            run?.log.push(`升级至 ${hero.level} 级，生命与魔力已恢复。`);
            learned.forEach((entry) => run?.log.push(`学会技能：${entry.name}（${entry.key}）`));
        }
    };
    const dropEquipment = (dungeon, source = 'monster') => {
        const dungeonLevel = dungeon.level || dungeon.area?.levels?.[0] || 1;
        const rarity = run?.difficulty?.abyss && source === 'boss' ? rollAbyssRarity(dungeonLevel) : rollStandardRarity(dungeonLevel, run?.difficulty?.id || 'normal', source);
        const lockedSlots = active().level < 60 ? new Set(['support', 'magicStone', 'earring']) : new Set();
        const pool = ABYSS_RARITY_LOOT[rarity].filter((item) => (!item.classId || item.classId === active().classId) && !lockedSlots.has(item.slot));
        const template = pool[Math.floor(Math.random() * pool.length)];
        const { grade, quality } = rollItemGrade();
        const priceMultiplier = (ABYSS_RARITIES[rarity]?.power || 1) * quality;
        return { id: `loot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name: template.name, slot: template.slot, classId: template.classId || null, level: dungeonLevel, rarity, grade, quality, stats: scaleStatsByQuality(template.stats, quality), price: Math.round(template.price * priceMultiplier), icon: template.icon || slotIcon[template.slot] || '装', equipped: false, locked: false };
    };
    const combatBounds = ABYSS_COMBAT.bounds;
    const enemyProfile = (source, boss) => {
        const base = ABYSS_COMBAT.enemy[boss ? 'boss' : source.ranged ? 'ranged' : source.elite ? 'elite' : 'normal'];
        const profile = { ...base, poise: Math.max(base.poise, source.elite ? 2 : 1) };
        if (run?.difficulty?.abyss) {
            profile.detect *= 1.12;
            profile.windup *= .84;
            profile.recovery *= .78;
            profile.attackRange = (profile.attackRange || 72) + (boss ? 16 : 10);
            profile.poise += boss ? 2 : 1;
            if (profile.keepRange) profile.keepRange += 24;
            if (profile.projectileSpeed) profile.projectileSpeed *= 1.22;
        }
        return profile;
    };
    const actionLength = (action) => Math.max(action.active?.[1] || 0, action.startup || 0) + (action.recovery || 0);
    const spawnEnemy = (type, x, y, boss = false, champion = false) => {
        const source = boss ? ABYSS_BOSSES[type] : ABYSS_MONSTERS[type];
        const areaLevel = run?.dungeon?.level || run?.dungeon?.area?.levels?.[0] || 1;
        const progression = 1 + Math.max(0, areaLevel - 1) * .115;
        const attackProgression = 1 + Math.max(0, areaLevel - 1) * .046;
        const scale = (run?.difficulty?.hp || 1) * progression * (champion ? 1.38 : 1);
        const profile = enemyProfile(source, boss);
        return {
            id: `${type}-${Math.random()}`, type, name: champion ? `精英·${source.name}` : source.name, x, y, z: 0, vz: 0,
            hp: Math.round(source.hp * scale), maxHp: Math.round(source.hp * scale), attack: Math.round(source.attack * attackProgression * (run?.difficulty?.damage || 1) * (champion ? 1.18 : 1)), speed: source.speed * (champion ? 1.08 : 1), attackType: source.attackType || (source.ranged ? 'magical' : 'physical'),
            physicalDefense: Math.round((source.physicalDefense || Math.max(14, source.hp * .16)) * (1 + Math.max(0, areaLevel - 1) * .06) * (champion ? 1.18 : 1)), magicalDefense: Math.round((source.magicalDefense || Math.max(12, source.hp * .13)) * (1 + Math.max(0, areaLevel - 1) * .06) * (champion ? 1.18 : 1)), elementalResistance: source.elementalResistance ?? (boss ? 18 : source.elite ? 8 : 3),
            size: boss ? 126 : Math.max(54, (source.size || 30) * 2.1), color: source.color, xp: Math.round(source.xp * (1 + Math.max(0, areaLevel - 1) * .07) * (run?.difficulty?.xp || 1) * (champion ? 1.35 : 1)), gold: source.gold, boss, champion, source, profile, modelId: type,
            state: 'patrol', stateTime: 0, action: null, facing: -1, animOffset: Math.random() * 10, hitFlash: 0, armorFlash: 0, armorFeedbackCooldown: 0, hurtTimer: 0, knockdownTimer: 0, groundHits: 0, invulnerable: 0,
            poise: profile.poise, poiseMax: profile.poise, stunTimer: 0, juggleHits: 0, patrolDir: Math.random() > 0.5 ? 1 : -1, patrolTimer: 0.8 + Math.random() * 1.2, bossCycle: 0, abyssCycle: Math.floor(Math.random() * 3),
            specialTimer: boss ? (run?.difficulty?.abyss ? 1.9 : 2.8) : run?.difficulty?.abyss ? 1.15 + Math.random() * 1.1 : source.elite || source.lunge || champion ? 2.0 : 0, attackCooldown: .35 + Math.random() * .30, summonCd: 4.5, pulseCd: 3.4,
            flankOffset: source.swarm ? (Math.random() > .5 ? 1 : -1) * (34 + Math.random() * 44) : 0, dead: false,
        };
    };
    const spawnWave = (dungeon, roomIndex, waveIndex) => {
        const choices = dungeon.monsters || [];
        const count = 3 + Math.min(2, roomIndex) + (waveIndex > 0 ? 1 : 0);
        return Array.from({ length: count }, (_, index) => spawnEnemy(choices[(index + roomIndex + waveIndex) % choices.length], 580 + index * 150, 400 + (index % 3) * 48, false, roomIndex > 0 && waveIndex > 0 && index === count - 1));
    };
    const roomsFor = (dungeon) => {
        const rooms = [];
        for (let i = 0; i < dungeon.rooms; i += 1) {
            const isBoss = i === dungeon.rooms - 1;
            const waves = isBoss ? [] : Array.from({ length: i === 0 ? 1 : 2 }, (_, waveIndex) => spawnWave(dungeon, i, waveIndex));
            const enemies = isBoss ? [spawnEnemy(run?.abyssBossId || dungeon.boss, 940, 430, true)] : waves.shift();
            rooms.push({ enemies, waves, waveIndex: 1, waveDelay: 0, drops: [], chest: i === 1 ? { x: 1050, y: 500, opened: false } : null, complete: false });
        }
        return rooms;
    };
    const beginDungeon = (dungeonId, difficultyId = 'normal') => {
        const dungeon = dungeonById(dungeonId);
        if (!dungeon || !active() || active().level < dungeon.level || !Array.isArray(dungeon.monsters) || !dungeon.monsters.length || !dungeon.boss) return;
        const difficulty = ABYSS_DIFFICULTIES[difficultyId] || ABYSS_DIFFICULTIES.normal;
        const hero = active();
        const ticketCost = difficulty.abyss ? getAbyssTicketCost(dungeon.level) : 0;
        if (difficulty.abyss && (dungeon.level < 50 || hero.level < 50 || (hero.materials?.abyssTicket || 0) < ticketCost)) return false;
        if (difficulty.abyss) { hero.materials.abyssTicket -= ticketCost; commit(); }
        overlay = '';
        paused = false;
        keys.clear();
        const abyssBossId = difficulty.abyss ? ABYSS_DEEP_BOSS_IDS[Math.floor(Math.random() * ABYSS_DEEP_BOSS_IDS.length)] : null;
        run = { dungeon, difficulty, abyssBossId, ticketCost, roomIndex: 0, rooms: [], startedAt: performance.now(), kills: 0, earnedXp: 0, earnedGold: 0, earnedTickets: 0, picked: [], unclaimedDrops: 0, effects: [], visuals: [], projectiles: [], playerProjectiles: [], sfx: [], hitstop: 0, shake: 0, flash: 0, flashColor: '#ffffff', combo: 0, bestCombo: 0, comboTimer: 0, styleScore: 0, finishTimer: 0, backgroundId: `dungeonBackdrop:${dungeon.area.id}`, log: [difficulty.abyss ? `深渊开启：消耗 ${ticketCost} 张深渊票。` : '副本开始：清空房间后前往出口。'], completed: false };
        run.rooms = roomsFor(dungeon);
        mode = 'dungeon';
        resetPlayer();
        player.x = 220; player.y = 485;
        return true;
    };
    const currentRoom = () => run?.rooms[run.roomIndex];
    const addDrop = (x, y, value) => currentRoom().drops.push({ x, y, value, picked: false });
    const advanceRoom = () => {
        const room = currentRoom();
        if (!room || room.enemies.some((enemy) => !enemy.dead) || room.waves.length || player.x <= 1120) return false;
        if (run.roomIndex >= run.rooms.length - 1) return false;
        run.roomIndex += 1;
        player.x = 180;
        player.y = 480;
        setPlayerState('interact', 0.18);
        run.log.push(`进入第 ${run.roomIndex + 1} 个房间。`);
        return true;
    };
    const advanceWave = (dt) => {
        const room = currentRoom();
        if (!room || room.enemies.some((enemy) => !enemy.dead) || !room.waves.length) return false;
        room.waveDelay = (room.waveDelay || .58) - dt;
        if (room.waveDelay > 0) return true;
        const next = room.waves.shift();
        room.enemies.push(...next);
        room.waveIndex += 1;
        run.visuals.push({ type: 'burst', x: W / 2, y: 360, color: '#e5c66f', facing: 1, radius: 165, life: .34, maxLife: .34 });
        emitFeedback(W / 2, 280, `第 ${room.waveIndex} 波`, '#fff1ad', 'critical', 3);
        return true;
    };
    const claimDrop = (drop) => {
        if (!drop || drop.picked) return false;
        drop.picked = true;
        if (drop.value.kind === 'gold') run.earnedGold += drop.value.amount;
        else if (drop.value.kind === 'material' && drop.value.id === 'abyssTicket') { active().materials ??= { abyssTicket: 0 }; active().materials.abyssTicket += drop.value.amount; run.earnedTickets += drop.value.amount; }
        else if (active().inventory.length < 120) { active().inventory.push(drop.value.item); run.picked.push(drop.value.item); }
        else if (active().warehouse.length < 120) { active().warehouse.push(drop.value.item); run.picked.push(drop.value.item); run.log.push(`${drop.value.item.name} 已转入仓库。`); }
        else { drop.picked = false; run.unclaimedDrops += 1; return false; }
        return true;
    };
    const autoCollectDrops = () => {
        const room = currentRoom();
        if (!room) return;
        let persistentChange = false;
        room.drops.forEach((drop) => {
            if (drop.picked || drop.value.kind === 'item' || dist(player, drop) > 58) return;
            if (claimDrop(drop) && drop.value.kind === 'material') persistentChange = true;
        });
        if (persistentChange) commit();
    };
    const collectUnclaimedDrops = () => run.rooms.forEach((room) => room.drops.forEach(claimDrop));
    const defeatEnemy = (enemy) => {
        if (enemy.dead) return;
        enemy.dead = true;
        run.kills += 1;
        run.earnedXp += enemy.xp;
        const amount = Array.isArray(enemy.gold) ? enemy.gold[0] + Math.floor(Math.random() * (enemy.gold[1] - enemy.gold[0] + 1)) : enemy.gold;
        addDrop(enemy.x, enemy.y, { kind: 'gold', amount });
        const equipmentChance = (enemy.champion ? .22 : .12) + run.difficulty.dropBonus * .35;
        const equipmentRolls = enemy.boss ? (run.difficulty.abyss ? 2 : 1) : Math.random() < equipmentChance ? 1 : 0;
        for (let index = 0; index < equipmentRolls; index += 1) addDrop(enemy.x + 20 + index * 30, enemy.y - index * 8, { kind: 'item', item: dropEquipment(run.dungeon, enemy.boss ? 'boss' : enemy.champion ? 'elite' : 'monster') });
        if (enemy.boss && !run.difficulty.abyss) { const tickets = rollAbyssTicketDrop(run.dungeon.level); if (tickets) addDrop(enemy.x - 28, enemy.y - 8, { kind: 'material', id: 'abyssTicket', name: '深渊票', amount: tickets }); }
        run.visuals.push({ type: 'burst', x: enemy.x, y: enemy.y - enemy.size * .68, color: enemy.boss ? '#ffb45a' : '#f3d48a', facing: enemy.facing, radius: enemy.boss ? 178 : 94, life: enemy.boss ? .42 : .24, maxLife: enemy.boss ? .42 : .24 });
        run.shake = Math.max(run.shake, enemy.boss ? 8 : 2.5);
        if (enemy.boss) { run.completedAt = performance.now(); run.projectiles.length = 0; run.finishTimer = 2.4; run.log.push('首领已击败，战利品正在显现。'); }
    };
    const safePlayerX = (next) => {
        if (!run || mode !== 'dungeon') return clamp(next, combatBounds.left, combatBounds.right);
        const direction = Math.sign(next - player.x);
        let result = clamp(next, combatBounds.left, combatBounds.right);
        currentRoom().enemies.filter((enemy) => !enemy.dead && enemy.z <= 5 && Math.abs(enemy.y - player.y) < 46).forEach((enemy) => {
            const separation = enemy.size / 2 + 22;
            if (direction > 0 && player.x < enemy.x && result > enemy.x - separation) result = Math.min(result, enemy.x - separation);
            if (direction < 0 && player.x > enemy.x && result < enemy.x + separation) result = Math.max(result, enemy.x + separation);
        });
        return result;
    };
    const setPlayerState = (state, duration = 0, restart = false) => {
        if (restart || player.state !== state) {
            player.state = state;
            player.stateElapsed = 0;
        }
        if (duration > 0 || restart) {
            player.stateTime = duration;
            player.stateDuration = duration;
        }
    };
    const emitFeedback = (x, y, text, color, kind = 'normal', shake = 0) => {
        const life = ABYSS_COMBAT.feedback.damageLife;
        run.effects.push({ x, y, text, color, kind, life, maxLife: life, rise: kind === 'critical' ? 70 : 52 });
        run.shake = Math.max(run.shake, shake);
        playCue(kind);
        if (run.sfx) { run.sfx.push({ cue: kind, x, y, at: performance.now() }); if (run.sfx.length > 20) run.sfx.shift(); }
    };
    const applyEnemyControl = (enemy, data, heavy) => {
        const control = data.hitType || (data.launch ? 'launch' : data.knockdown ? 'knockdown' : 'stagger');
        const wantsStun = Boolean(data.stun) || Number(data.hitstun || 0) >= .32;
        let poiseBroken = false;
        if (enemy.state !== 'knockdown' && enemy.poiseMax > 1 && enemy.poise > 1) {
            enemy.poise = Math.max(0, enemy.poise - (heavy ? 2 : 1));
            if (enemy.poise > 0) {
                enemy.armorFlash = .16;
                if (enemy.armorFeedbackCooldown <= 0) {
                    const life = .34;
                    run.effects.push({ x: enemy.x, y: enemy.y - enemy.size - 34, text: '霸体', color: '#ffd36b', kind: 'status', life, maxLife: life, rise: 30 });
                    enemy.armorFeedbackCooldown = .32;
                }
                return true;
            }
            poiseBroken = true;
        } else if (enemy.state !== 'knockdown' && enemy.poiseMax > 1 && enemy.poise <= 1) poiseBroken = true;
        if (poiseBroken) {
            enemy.armorFlash = .22;
            emitFeedback(enemy.x, enemy.y - enemy.size - 38, '破韧', '#fff0a0', 'critical', enemy.boss ? 4 : 2);
            run.visuals.push({ type: 'impact', x: enemy.x, y: enemy.y - enemy.size * .72, color: '#ffd566', facing: player.facing, radius: enemy.boss ? 126 : 82, life: .22, maxLife: .22 });
        }
        if (control === 'launch' && enemy.poise <= 1) {
            enemy.action = null;
            const juggleScale = Math.max(.55, 1 - (enemy.juggleHits || 0) * .075);
            enemy.vz = Math.max(enemy.vz * .35, (data.launch || 250) * juggleScale);
            enemy.state = 'knockdown';
            enemy.knockdownTimer = .48;
            enemy.groundHits = 0;
            enemy.stunTimer = 0;
            return;
        }
        if (control === 'knockdown' && (!enemy.boss || enemy.poise <= 1)) {
            enemy.action = null;
            enemy.vz = 0;
            const alreadyDown = enemy.state === 'knockdown' && enemy.z <= 8;
            enemy.state = 'knockdown';
            enemy.knockdownTimer = alreadyDown ? Math.min(enemy.knockdownTimer, .28) : .62;
            enemy.groundHits = alreadyDown ? (enemy.groundHits || 0) + 1 : 0;
            if (enemy.groundHits >= 3) enemy.knockdownTimer = Math.min(enemy.knockdownTimer, .10);
            enemy.stunTimer = 0;
            enemy.poise = enemy.poiseMax;
            return;
        }
        if (enemy.state === 'knockdown' && enemy.z <= 8) {
            enemy.action = null;
            enemy.groundHits = (enemy.groundHits || 0) + 1;
            enemy.knockdownTimer = Math.min(enemy.knockdownTimer, enemy.groundHits >= 3 ? .10 : .28);
            return;
        }
        enemy.action = null;
        const stun = wantsStun && (!enemy.boss || enemy.poise <= 1);
        enemy.state = stun ? 'stunned' : 'hurt';
        enemy.hurtTimer = stun ? 0 : data.hitstun || .18;
        enemy.stunTimer = stun ? Math.max(.24, data.hitstun || .32) : 0;
        enemy.poise = enemy.poiseMax;
    };
    const defeatEnemyHit = (enemy, data, action) => {
        if (enemy.dead || enemy.invulnerable > 0) return;
        const definition = ABYSS_CHARACTERS[active().classId];
        const stats = getStats(active());
        const physical = definition.combatType !== 'magical';
        const critical = Math.random() * 100 < (physical ? stats.physicalCrit : stats.magicalCrit);
        const heavy = Boolean(data.launch || data.knockback >= 70);
        const nextCombo = run.combo + 1;
        const comboBonus = 1 + Math.min(.18, Math.floor(nextCombo / 10) * .03);
        const comboStepMultiplier = action.kind === 'attack' ? 1 + Math.min(.18, (action.index || 0) * .06) : 1;
        const juggleMultiplier = enemy.z > 8 ? Math.max(.76, 1.14 - (enemy.juggleHits || 0) * .055) : 1;
        const baseMultiplier = action.kind === 'skill' ? action.values.damage * (data.grab && !enemy.boss ? 1.25 : 1) : data.damage;
        const attack = physical ? stats.physicalAttack : stats.magicalAttack;
        const mainStat = physical ? stats.strength : stats.intelligence;
        const defense = physical ? enemy.physicalDefense : enemy.magicalDefense;
        const attackPower = (attack + stats.independentAttack * .18) * (1 + mainStat / 250);
        const defenseMultiplier = 1000 / (1000 + Math.max(0, defense));
        const elementMultiplier = (1 + Math.max(0, stats.elementalStrength) * .0045) * Math.max(.15, 1 - Math.max(0, enemy.elementalResistance) / 220);
        const offenseMultiplier = (1 + stats.damageIncrease / 100) * (action.kind === 'skill' ? 1 + stats.skillAttack / 100 : 1);
        const criticalMultiplier = critical ? 1.5 + stats.criticalDamage / 100 : 1;
        const damage = Math.max(1, Math.round(attackPower * baseMultiplier * comboBonus * comboStepMultiplier * juggleMultiplier * defenseMultiplier * elementMultiplier * offenseMultiplier * criticalMultiplier));
        enemy.hp -= damage;
        if (enemy.z > 8) enemy.juggleHits = (enemy.juggleHits || 0) + 1;
        run.combo = nextCombo; run.bestCombo = Math.max(run.bestCombo, run.combo); run.comboTimer = 1.35;
        run.styleScore = Math.min(9999, (run.styleScore || 0) + 8 + (heavy ? 7 : 0) + (enemy.z > 8 ? 5 : 0) + (critical ? 4 : 0));
        if (run.combo > 0 && run.combo % 12 === 0) { player.mp = Math.min(player.maxMp, player.mp + 6); emitFeedback(player.x, player.y - 118, '连击回气', '#8fe7ff', 'skill', 1); }
        enemy.hitFlash = critical ? 0.18 : 0.12;
        action.hitAny = true;
        const baseHitstop = enemy.boss ? ABYSS_COMBAT.feedback.bossHitstop : heavy ? ABYSS_COMBAT.feedback.heavyHitstop : ABYSS_COMBAT.feedback.lightHitstop;
        const hitstop = Math.max(data.hitstop || 0, baseHitstop) * (action.kind === 'skill' ? 1.08 : 1);
        run.hitstop = Math.max(run.hitstop, hitstop);
        const impactRadius = Math.max(48, Math.min(168, data.range * .60));
        run.visuals.push({ type: data.projectile ? 'burst' : 'slash', x: enemy.x, y: enemy.y - enemy.size * .68, color: action.color, facing: player.facing, radius: impactRadius, life: .26, maxLife: .26 });
        run.visuals.push({ type: 'burst', x: enemy.x, y: enemy.y - enemy.size * .64, color: critical ? '#fff4b5' : action.color, facing: player.facing, radius: heavy ? impactRadius : impactRadius * .62, life: heavy ? .22 : .14, maxLife: heavy ? .22 : .14 });
        run.visuals.push({ type: 'impact', x: enemy.x, y: enemy.y - enemy.size * .66, color: critical ? '#fff0a6' : action.color, facing: player.facing, radius: heavy ? impactRadius * 1.12 : impactRadius * .78, life: heavy ? .24 : .16, maxLife: heavy ? .24 : .16 });
        run.flash = Math.max(run.flash, heavy ? .14 : critical ? .11 : action.kind === 'skill' ? .075 : .05);
        run.flashColor = critical ? '#ffe6a3' : action.color;
        if (critical || heavy) run.visuals.push({ type: 'hitStamp', x: enemy.x, y: enemy.y - enemy.size - 32, color: action.color, facing: player.facing, radius: critical ? 106 : 82, life: .20, maxLife: .20 });
        const impactShake = Math.max(data.shake || 0, action.kind === 'skill' ? (heavy ? 5.5 : 3.2) : heavy ? 4 : 1.5);
        emitFeedback(enemy.x, enemy.y - enemy.size - 14, `${critical ? '暴击 ' : ''}-${damage}`, critical ? '#ffd96d' : action.color, critical ? 'critical' : action.kind, impactShake);
        if (enemy.hp <= 0) { defeatEnemy(enemy); return; }
        enemy.facing = player.facing;
        const controlAbsorbed = applyEnemyControl(enemy, data, heavy);
        const knockbackScale = controlAbsorbed ? .08 : enemy.boss ? .38 : 1;
        enemy.x = clamp(enemy.x + player.facing * (data.knockback || 0) * knockbackScale, combatBounds.left, combatBounds.right);
    };
    const playerHitbox = (action) => {
        const room = currentRoom();
        const data = action.data;
        const active = action.time >= data.active[0] && action.time <= data.active[1] && data.hits > 0;
        if (!active) return;
        room.enemies.forEach((enemy) => {
            if (enemy.dead || enemy.invulnerable > 0 || Math.abs(enemy.y - player.y) > data.depth || Math.abs((enemy.z || 0) - player.z) > 150) return;
            const forward = (enemy.x - player.x) * player.facing;
            if (data.area ? Math.abs(enemy.x - player.x) > data.range + enemy.size / 2 : forward < -22 || forward > data.range + enemy.size / 2) return;
            const record = action.hitTargets.get(enemy.id) || { count: 0, last: -99 };
            if (record.count >= (data.hits || 1) || action.time - record.last < (data.rehit || 99)) return;
            record.count += 1; record.last = action.time; action.hitTargets.set(enemy.id, record);
            if (data.pull && !enemy.boss) enemy.x += (player.x - enemy.x) * .55;
            defeatEnemyHit(enemy, data, action);
        });
    };
    const startPlayerAction = (kind, index) => {
        cancelSprint();
        const classId = active().classId;
        const entry = kind === 'skill' ? skillsFor()[index] : null;
        const values = entry ? skillValues(entry) : null;
        const data = { ...(kind === 'skill' ? entry.action : ABYSS_COMBAT.player[classId].combo[index]) };
        const stats = getStats(active());
        const speed = kind === 'attack' ? stats.attackSpeedMultiplier : stats.castSpeedMultiplier;
        ['startup', 'recovery'].forEach((key) => { data[key] /= speed; });
        data.active = data.active.map((value) => value / speed);
        if (data.cancel) data.cancel = data.cancel.map((value) => value / speed);
        if (data.skillCancel) data.skillCancel = data.skillCancel.map((value) => value / speed);
        data.hits ??= 1;
        if (values) { data.range = values.range; data.hits = Math.max(data.hits, values.hits); }
        const skill = entry;
        player.action = { kind, index, data, values, time: 0, total: actionLength(data), hitTargets: new Map(), hitAny: false, bufferedAttack: false, bufferedSkill: null, color: skill?.color || skillColorFor(classId, index), moved: false, activeVisualFired: false, visualPulseTimer: 0 };
        const castLife = kind === 'skill' ? Math.max(.24, data.active[0] + .08) : .20;
        run.visuals.push({ type: kind === 'skill' ? 'skillAura' : 'trail', x: player.x + player.facing * 42, y: player.y - 68, color: player.action.color, facing: player.facing, radius: Math.max(48, Math.min(150, data.range * .48)), life: castLife, maxLife: castLife, followPlayer: kind === 'skill' });
        if (kind === 'skill' && index >= 8) run.visuals.push({ type: 'superBanner', x: W / 2, y: 180, color: player.action.color, facing: 1, radius: 320, life: .52, maxLife: .52 });
        setPlayerState(kind === 'skill' ? 'skill' : 'attack', player.action.total, true);
        if (data.step) player.x = safePlayerX(player.x + player.facing * data.step);
        if (kind === 'skill') {
            if (data.invuln) player.invuln = Math.max(player.invuln, data.invuln);
            player.mp -= values.cost;
            player.cooldowns[skill.key] = values.cooldown;
            if (skill.heal) player.hp = Math.min(player.maxHp, player.hp + player.maxHp * skill.heal);
            if (data.guard) { player.guardTimer = data.guard; player.guardAction = player.action; }
            emitFeedback(player.x, player.y - 94, skill.name, skill.color, 'skill', data.shake || 0);
        }
    };
    const attack = () => {
        if (mode !== 'dungeon' || !player || ['hurt', 'knockdown', 'dead'].includes(player.state)) return;
        if (player.state === 'attack') { player.action.bufferedAttack = true; return; }
        if (player.state === 'skill') { player.queuedInput = { kind: 'attack', time: .30 }; return; }
        if (player.state === 'dodge' && player.dodgeTimer <= .11) { startPlayerAction('attack', 0); return; }
        if (!['idle', 'move', 'jump', 'fall'].includes(player.state)) return;
        const chain = ABYSS_COMBAT.player[active().classId].combo;
        const index = player.comboGrace > 0 ? player.comboIndex : 0;
        startPlayerAction('attack', Math.min(index, chain.length - 1));
    };
    const useSkill = (index) => {
        if (mode !== 'dungeon' || !player || ['hurt', 'knockdown', 'dead'].includes(player.state)) return;
        const skill = skillsFor()[index]; const values = skillValues(skill);
        if (values.level <= 0 || player.cooldowns[skill.key] > 0 || player.mp < values.cost || (!player.grounded && !skill.canAir)) return;
        if (player.state === 'dodge' && player.dodgeTimer <= .11) { startPlayerAction('skill', index); return; }
        if (!['idle', 'move', 'jump', 'fall', 'attack', 'skill'].includes(player.state)) return;
        if (player.state === 'skill') { player.queuedInput = { kind: 'skill', index, time: .30 }; return; }
        if (player.state === 'attack') {
            const cancel = player.action.data.skillCancel;
            if (player.action.hitAny && cancel && player.action.time >= cancel[0] && player.action.time <= cancel[1]) { startPlayerAction('skill', index); return; }
            player.action.bufferedSkill = index;
            return;
        }
        startPlayerAction('skill', index);
    };
    const consumeQueuedInput = () => {
        const queued = player?.queuedInput;
        if (!queued || queued.time <= 0 || player.action) return;
        player.queuedInput = null;
        if (queued.kind === 'attack') attack();
        else useSkill(queued.index);
    };
    const pickOrInteract = () => {
        cancelSprint();
        if (mode === 'town') {
            const items = [{ x: 245, y: 400, id: 'guide' }, { x: 585, y: 410, id: 'smith' }, { x: 860, y: 430, id: 'merchant' }, { x: 1055, y: 390, id: 'warehouse' }, { x: 1090, y: 535, id: 'portal' }];
            const target = items.find((item) => dist(town, item) < 86);
            if (target) overlay = target.id === 'portal' ? 'world' : target.id;
            return;
        }
        if (mode !== 'dungeon') return;
        const room = currentRoom();
        const drop = room.drops.find((item) => !item.picked && dist(player, item) < 65);
        if (drop) {
            claimDrop(drop);
            if (player && ['idle', 'move', 'jump', 'fall'].includes(player.state)) setPlayerState('interact', 0.12);
            commit();
            return;
        }
        if (room.chest && !room.chest.opened && dist(player, room.chest) < 75) {
            room.chest.opened = true;
            addDrop(room.chest.x - 15, room.chest.y - 30, { kind: 'gold', amount: 18 + run.roomIndex * 12 });
            addDrop(room.chest.x + 20, room.chest.y - 28, { kind: 'item', item: dropEquipment(run.dungeon, 'chest') });
            if (player && ['idle', 'move', 'jump', 'fall'].includes(player.state)) setPlayerState('interact', 0.18);
            run.log.push('宝箱开启，靠近掉落按 E 拾取。');
            return;
        }
        advanceRoom();
    };
    const gradeRun = () => {
        const seconds = Math.max(1, ((run.completedAt || performance.now()) - run.startedAt) / 1000);
        const healthRatio = player.hp / player.maxHp;
        const score = healthRatio * 52 + Math.min(26, run.bestCombo * 1.3) + Math.max(0, 22 - seconds / 11);
        if (score >= 72) return { id: 'S', bonusGold: 42, bonusXp: 38 };
        if (score >= 48) return { id: 'A', bonusGold: 22, bonusXp: 18 };
        return { id: 'B', bonusGold: 8, bonusXp: 0 };
    };
    const finishRun = () => {
        if (run.completed) return;
        run.completedAt ??= performance.now();
        run.completed = true;
        const hero = active();
        collectUnclaimedDrops();
        run.grade = gradeRun();
        run.earnedGold += run.grade.bonusGold;
        run.earnedXp += run.grade.bonusXp;
        gainXp(run.earnedXp);
        hero.gold += run.earnedGold;
        const first = !hero.progress.cleared[run.dungeon.id];
        if (first) {
            hero.progress.cleared[run.dungeon.id] = true;
            hero.gold += run.dungeon.firstReward.gold || 0;
            if (run.dungeon.firstReward.item) {
                const item = createItem(ABYSS_EQUIPMENT[run.dungeon.firstReward.item]);
                if (hero.inventory.length < 120) { hero.inventory.push(item); run.picked.push(item); }
                else if (hero.warehouse.length < 120) { hero.warehouse.push(item); run.picked.push(item); }
                else run.unclaimedDrops += 1;
            }
        }
        const nextArea = ABYSS_AREAS[ABYSS_AREAS.findIndex((area) => area.id === run.dungeon.area.id) + 1];
        if (nextArea && hero.level >= nextArea.unlockLevel && !hero.progress.discovered.includes(nextArea.id)) hero.progress.discovered.push(nextArea.id);
        commit();
        mode = 'result';
    };
    const syncEquippedFlags = (hero) => hero.inventory.forEach((item) => { item.equipped = hero.equipped[item.slot] === item.id; });
    const refreshEquipmentStats = (hero) => {
        if (!player) return;
        const stats = getStats(hero);
        player.maxHp = stats.hp; player.maxMp = stats.mp;
        player.hp = Math.min(player.hp, stats.hp); player.mp = Math.min(player.mp, stats.mp);
    };
    const canEquip = (item, hero = active()) => Boolean(item && hero && (!item.classId || item.classId === hero.classId) && item.level <= hero.level && (!['support', 'magicStone', 'earring'].includes(item.slot) || hero.level >= 60));
    const equip = (item) => {
        const hero = active();
        if (!canEquip(item, hero)) return false;
        hero.equipped[item.slot] = item.id;
        syncEquippedFlags(hero);
        refreshEquipmentStats(hero);
        commit();
        return true;
    };
    const unequip = (slot) => { const hero = active(); delete hero.equipped[slot]; syncEquippedFlags(hero); refreshEquipmentStats(hero); commit(); };
    const toggleItemLock = (item) => { if (!item) return; item.locked = !item.locked; commit(); };
    const buy = (id) => {
        const definition = ABYSS_EQUIPMENT[id]; const hero = active();
        if (!definition || hero.gold < definition.price || hero.inventory.length >= 120) return;
        hero.gold -= definition.price; hero.inventory.push(createItem(definition)); commit();
    };
    const sell = (item) => {
        const hero = active();
        if (!item || item.locked || hero.equipped[item.slot] === item.id) return false;
        hero.inventory = hero.inventory.filter((entry) => entry.id !== item.id);
        hero.gold += item.price || 1; commit();
        return true;
    };
    const storeItem = (item) => {
        const hero = active();
        if (!item || hero.warehouse.length >= 120 || hero.equipped[item.slot] === item.id) return;
        hero.inventory = hero.inventory.filter((entry) => entry.id !== item.id);
        hero.warehouse.push(item);
        commit();
    };
    const withdrawItem = (item) => {
        const hero = active();
        if (!item || hero.inventory.length >= 120) return;
        hero.warehouse = hero.warehouse.filter((entry) => entry.id !== item.id);
        hero.inventory.push(item);
        commit();
    };
    const drawText = (text, x, y, size = 18, color = '#f5f8ff', align = 'left', weight = 600) => { ctx.fillStyle = color; ctx.font = `${weight} ${size}px system-ui, sans-serif`; ctx.textAlign = align; ctx.fillText(text, x, y); };
    const drawSheetFrame = (image, sheet, frame, x, y, width, height, flip = false) => {
        const columns = sheet.columns || 1; const rows = sheet.rows || 1; const frames = Math.max(1, sheet.frames || columns * rows);
        const index = ((frame % frames) + frames) % frames; const sourceWidth = image.naturalWidth / columns; const sourceHeight = image.naturalHeight / rows;
        const sourceX = index % columns * sourceWidth; const sourceY = Math.floor(index / columns) * sourceHeight;
        ctx.save(); ctx.translate(x + width / 2, y); ctx.scale(flip ? -1 : 1, 1); ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, -width / 2, 0, width, height); ctx.restore();
    };
    const drawItemIcon = (item, x, y, size = 30) => {
        const rarity = ABYSS_RARITIES[item.rarity] || ABYSS_RARITIES.common; const color = rarity.color; const border = rarity.colors ? (() => { const gradient = ctx.createLinearGradient(x, y, x + size, y + size); rarity.colors.forEach((tone, index) => gradient.addColorStop(index / (rarity.colors.length - 1), tone)); return gradient; })() : color;
        ctx.save(); ctx.fillStyle = 'rgba(7, 15, 28, .92)'; ctx.fillRect(x, y, size, size); ctx.strokeStyle = border; ctx.lineWidth = 2; ctx.strokeRect(x + 1, y + 1, size - 2, size - 2);
        const image = images.get(`equipmentIcon:${item.slot}`); const rarityIndex = Math.max(0, rarityOrder.indexOf(item.rarity));
        if (image?.complete && image.naturalWidth) { const sourceWidth = image.naturalWidth / 3; const sourceHeight = image.naturalHeight / 3; const sourceX = rarityIndex % 3 * sourceWidth; const sourceY = Math.floor(rarityIndex / 3) * sourceHeight; ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x + 2, y + 2, size - 4, size - 4); }
        else drawText(item.icon || slotIcon[item.slot] || '装', x + size / 2, y + size * .70, Math.max(13, size * .52), color, 'center', 800);
        ctx.restore();
    };
    const drawAbyssTicket = (x, y, width = 30, height = 22) => {
        ctx.save(); ctx.fillStyle = '#33254d'; ctx.strokeStyle = '#c69cff'; ctx.lineWidth = 2; ctx.shadowColor = '#9a66ff'; ctx.shadowBlur = 10;
        ctx.fillRect(x, y, width, height); ctx.strokeRect(x, y, width, height);
        ctx.fillStyle = '#e8d9ff'; ctx.beginPath(); ctx.arc(x, y + height / 2, 3, 0, Math.PI * 2); ctx.arc(x + width, y + height / 2, 3, 0, Math.PI * 2); ctx.fill();
        drawText('深', x + width / 2, y + height - 5, Math.max(10, height * .52), '#f2e8ff', 'center', 900); ctx.restore();
    };
    const drawDropAura = (item, x, y) => {
        const sheet = ABYSS_ASSETS.dropAuras[item.rarity]; const image = images.get(`dropAura:${item.rarity}`);
        if (!sheet || !image?.complete || !image.naturalWidth) return;
        const frameIndex = Math.floor(performance.now() / 1000 * sheet.fps) % sheet.frames;
        const size = item.rarity === 'mythic' ? 162 : item.rarity === 'primordial' ? 156 : 150;
        ctx.save(); ctx.globalAlpha = .84; ctx.globalCompositeOperation = 'screen'; drawSheetFrame(image, sheet, frameIndex, x - size / 2, y - size + 11, size, size); ctx.restore();
    };
    const panel = (x, y, width, height, title = '') => { ctx.fillStyle = 'rgba(7, 14, 28, 0.94)'; ctx.fillRect(x, y, width, height); ctx.strokeStyle = 'rgba(125, 200, 255, 0.45)'; ctx.lineWidth = 2; ctx.strokeRect(x, y, width, height); if (title) drawText(title, x + 20, y + 32, 21, '#b9eaff'); };
    const button = (label, x, y, width, height, action, disabled = false, color = '#167c91') => {
        ctx.fillStyle = disabled ? 'rgba(77, 84, 96, .7)' : color;
        ctx.fillRect(x, y, width, height); ctx.strokeStyle = disabled ? '#777' : '#a9eaff'; ctx.strokeRect(x, y, width, height);
        drawText(label, x + width / 2, y + height / 2 + 7, 16, disabled ? '#bbc0c8' : '#ffffff', 'center', 700);
        if (!disabled) hitboxes.push({ x, y, width, height, action });
    };
    const drawQuickActions = (inDungeon = false) => {
        const actions = [
            ['背包', () => { inventoryPage = 0; inventoryFilter = 'all'; overlay = 'inventory'; }],
            ['属性', () => { overlay = 'character'; }],
            ['技能', () => { overlay = 'skills'; }],
            ['设置', () => { overlay = 'settings'; }],
        ];
        if (inDungeon) actions.push(['暂停', () => { overlay = 'pause'; paused = true; }]);
        actions.forEach(([label, action], index) => button(label, 500 + index * 82, 18, 74, 32, action, false, label === '暂停' ? '#75504a' : '#315f79'));
    };
    const touchControlAt = (x, y) => {
        const controls = [['W', 70, 540], ['A', 22, 586], ['S', 70, 586], ['D', 118, 586]];
        return controls.find(([, controlX, controlY]) => x >= controlX && x <= controlX + 42 && y >= controlY && y <= controlY + 42)?.[0] || '';
    };
    const drawTouchPad = () => {
        if (!window.matchMedia?.('(pointer: coarse)').matches) return;
        if (virtualControls && isAbyssVirtualMode()) return;
        [['W', 70, 540], ['A', 22, 586], ['S', 70, 586], ['D', 118, 586]].forEach(([key, x, y]) => {
            ctx.fillStyle = pressed(key) ? 'rgba(104, 212, 230, .72)' : 'rgba(8, 19, 31, .68)'; ctx.fillRect(x, y, 42, 42);
            ctx.strokeStyle = '#86dce9'; ctx.strokeRect(x, y, 42, 42);
            drawText(key === 'W' ? '^' : key === 'A' ? '<' : key === 'S' ? 'v' : '>', x + 21, y + 28, 19, '#e9fbff', 'center', 800);
        });
    };
    const drawCombatStatus = () => {
        const room = currentRoom();
        if (!room) return;
        const boss = room.enemies.find((enemy) => enemy.boss && !enemy.dead);
        const elapsed = Math.max(0, ((run.completedAt || performance.now()) - run.startedAt) / 1000);
        const timeText = `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(Math.floor(elapsed % 60)).padStart(2, '0')}`;
        const waveText = boss ? `首领战 · ${boss.name}` : `房间 ${run.roomIndex + 1}/${run.rooms.length} · 第 ${room.waveIndex} 波${room.waves.length ? ` · 待命 ${room.waves.length}` : ''}`;
        ctx.fillStyle = 'rgba(4, 8, 15, .84)'; ctx.fillRect(510, 58, 450, 59); ctx.strokeStyle = 'rgba(125, 170, 198, .38)'; ctx.strokeRect(510, 58, 450, 59);
        drawText(waveText, 520, 78, 14, boss ? '#ffdb9a' : '#bce9ff');
        drawText(`用时 ${timeText}`, 520, 105, 13, run.completedAt ? '#ffe18b' : '#dce8f2');
        drawText(player.dodgeCooldown > 0 ? `闪避 ${player.dodgeCooldown.toFixed(1)}s` : '闪避就绪', 650, 105, 13, player.dodgeCooldown > 0 ? '#8d9aa8' : '#8feaff', 'center', 800);
        const statuses = [];
        if (player.state === 'skill' && player.action?.data?.superArmor) statuses.push(['霸体', '#ffd45f']);
        if (player.guardTimer > 0) statuses.push(['格挡', '#9eeaff']);
        if (player.invuln > 0) statuses.push(['无敌', '#c5f7ff']);
        if (player.state === 'knockdown') statuses.push(['倒地', '#ff9d91']);
        else if (!player.grounded) statuses.push(['浮空', '#b8d8ff']);
        if (player.state === 'move' && sprintDirection === player.facing) statuses.push(['疾跑', '#8ff0bd']);
        statuses.slice(0, 4).forEach(([label, color], index) => { const x = 720 + index * 59; ctx.fillStyle = 'rgba(5, 10, 18, .88)'; ctx.fillRect(x, 84, 52, 22); ctx.strokeStyle = color; ctx.strokeRect(x, 84, 52, 22); drawText(label, x + 26, 100, 11, color, 'center', 800); });
    };
    const drawBar = (x, y, width, value, max, color, label) => { ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x, y, width, 16); ctx.fillStyle = color; ctx.fillRect(x, y, width * clamp(value / max, 0, 1), 16); ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.strokeRect(x, y, width, 16); drawText(label, x + 6, y + 13, 12, '#fff', 'left', 700); };
    const drawBackdrop = (a = '#173f4b', b = '#172238') => { const gradient = ctx.createLinearGradient(0, 0, 0, H); gradient.addColorStop(0, a); gradient.addColorStop(1, b); ctx.fillStyle = gradient; ctx.fillRect(0, 0, W, H); };
    const drawHero = (classId, x, y, width = 170, height = 270) => {
        const image = images.get(ABYSS_CHARACTERS[classId].asset);
        if (image?.complete && image.naturalWidth) {
            const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
            const drawWidth = image.naturalWidth * scale;
            const drawHeight = image.naturalHeight * scale;
            const drawX = x + (width - drawWidth) / 2;
            const drawY = y + (height - drawHeight) / 2;
            ctx.save();
            ctx.shadowColor = ABYSS_CHARACTERS[classId].accent;
            ctx.shadowBlur = 20;
            ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
            ctx.restore();
            return;
        }
        ctx.fillStyle = ABYSS_CHARACTERS[classId].accent; ctx.fillRect(x + 35, y + 30, width - 70, height - 30); drawText(`${ABYSS_CHARACTERS[classId].name}\n资源占位`, x + width / 2, y + height / 2, 16, '#102033', 'center');
    };
    const drawMenu = () => {
        drawBackdrop('#102e3c', '#11152d');
        drawText('格斗之王：深渊远征', W / 2, 130, 48, '#f7e7a9', 'center', 800);
        drawText('原创横版动作刷图 RPG', W / 2, 165, 20, '#a4dced', 'center');
        drawHero('sword', 170, 245, 230, 370); drawHero('brawler', 880, 245, 230, 370);
        panel(430, 265, 420, 290, '深渊远征');
        drawText(save.activeId ? `继续：${active().name} · Lv.${active().level}` : '创建一名冒险者，开始远征。', W / 2, 330, 18, '#d8eaf4', 'center');
        button(save.activeId ? '继续游戏' : '新游戏', 500, 365, 280, 52, () => { if (save.activeId) { mode = 'town'; resetPlayer(); } else mode = 'character-select'; });
        button('角色选择', 500, 432, 280, 52, () => { mode = 'character-select'; }, false, '#53507d');
        drawText('WASD 移动 · Space 跳跃 · J 普攻 · H/K/L/Y/U/I/O/P/1/2/3/4 技能 · E 互动 · B 背包 · C 角色 · Esc 关闭', W / 2, 660, 14, '#a4b8c7', 'center');
    };
    const drawCharacterSelect = () => {
        drawBackdrop('#1e2739', '#14162a'); drawText('选择远征职业', W / 2, 85, 34, '#f7e7a9', 'center');
        ['sword', 'brawler'].forEach((classId, index) => { const x = index ? 680 : 140; const definition = ABYSS_CHARACTERS[classId]; const hasSave = Boolean(save.characters[`${classId}-save`]); panel(x, 145, 460, 465, definition.name); drawHero(classId, x + 34, 205, 180, 300); drawText(definition.title, x + 250, 245, 18, definition.accent); const base = definition.base; [`物攻 ${base.physicalAttack}`, `力量 ${base.strength}`, `生命 ${base.hp}`, `基础移速 ${base.baseMoveSpeed}`].forEach((text, statIndex) => drawText(text, x + 250, 300 + statIndex * 40, 17, '#e7edf4')); button(hasSave ? `使用${definition.name}存档` : `创建${definition.name}`, x + 240, 480, 175, 50, () => makeCharacter(classId), false, index ? '#994b42' : '#1e7894'); });
        button('返回', 540, 640, 200, 44, () => { mode = 'menu'; }, false, '#53507d');
    };
    const drawTown = () => {
        drawBackdrop('#4a6047', '#1c3435');
        const image = images.get('town'); if (image?.complete && image.naturalWidth) { ctx.globalAlpha = .26; ctx.drawImage(image, 0, 0, W, H); ctx.globalAlpha = 1; }
        ctx.fillStyle = 'rgba(13, 31, 28, .64)'; ctx.fillRect(0, 525, W, 195);
        [[245, 400, '冒险向导', '#e2c88b'], [585, 410, '铁匠', '#db8064'], [860, 430, '装备商人', '#6dc9c0'], [1055, 390, '仓库管理员', '#b49ade']].forEach(([x, y, name, color]) => { ctx.fillStyle = color; ctx.fillRect(x - 24, y - 64, 48, 64); ctx.fillStyle = '#29243a'; ctx.fillRect(x - 34, y, 68, 12); drawText(name, x, y - 80, 15, '#fff', 'center'); });
        ctx.fillStyle = '#76e8ff'; ctx.beginPath(); ctx.arc(1090, 535, 42, 0, Math.PI * 2); ctx.fill(); drawText('地图石', 1090, 605, 16, '#dffaff', 'center');
        hitboxes.push({ x: 1042, y: 486, width: 96, height: 96, action: () => { overlay = 'world'; } });
        drawPlayer(town); drawTownHud(); drawQuickActions(); drawTouchPad();
        drawText('走近 NPC 或地图石，按 E 互动。', W / 2, 685, 17, '#edfae5', 'center');
        if (overlay) drawOverlay();
    };
    const drawTownHud = () => { const hero = active(); const stats = getStats(hero); panel(18, 18, 420, 110); drawText(`${hero.name} · Lv.${hero.level}`, 36, 47, 22, ABYSS_CHARACTERS[hero.classId].accent); drawText(`金币 ${hero.gold}  |  深渊票 ${hero.materials?.abyssTicket || 0}  |  武器 ${getEquipped(hero).find((item) => item.slot === 'weapon')?.name || '未装备'}`, 36, 77, 14, '#e8ecf3'); drawBar(36, 92, 175, player.hp, stats.hp, '#dc5562', `HP ${Math.ceil(player.hp)}/${stats.hp}`); drawBar(225, 92, 175, player.mp, stats.mp, '#4c9bea', `MP ${Math.ceil(player.mp)}/${stats.mp}`); };
    const drawPlayer = (entity) => {
        const hero = active(); const armored = entity.state === 'skill' && entity.action?.data?.superArmor; const accent = entity.hitFlash > 0 ? '#ffffff' : armored ? '#ffd45f' : ABYSS_CHARACTERS[hero.classId].accent; const lift = entity.z || (entity.jump > 0 ? Math.sin(entity.jump * Math.PI) * 58 : 0);
        ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(entity.x, entity.y + 18, 28, 9, 0, 0, Math.PI * 2); ctx.fill();
        if (armored) { ctx.save(); ctx.strokeStyle = '#ffd45f'; ctx.shadowColor = '#ffb62e'; ctx.shadowBlur = 16 + (entity.armorFlash > 0 ? 12 : 0); ctx.lineWidth = entity.armorFlash > 0 ? 5 : 3; ctx.globalAlpha = .72; ctx.beginPath(); ctx.ellipse(entity.x, entity.y + 10, 43, 14, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
        const animationState = entity.state === 'dead' ? 'defeat'
            : entity.state === 'knockdown' ? 'knockdown'
                : entity.state === 'hurt' ? 'hurt'
                    : entity.state === 'skill' && entity.action?.data?.guard ? 'guard'
                        : entity.state === 'skill' ? (entity.action?.index >= 8 ? 'super' : 'skill')
                            : entity.state === 'attack' ? `attack${Math.min(3, (entity.action?.index || 0) + 1)}`
                                : entity.state === 'dodge' ? 'move'
                            : entity.state === 'jump' || entity.state === 'fall' ? 'jump'
                                : entity.state === 'move' ? 'move' : 'idle';
        const animation = ABYSS_ASSETS.heroAnimations[hero.classId][animationState];
        const sprite = images.get(`${hero.classId}:${animationState}`) || images.get(`${hero.classId}Sprite`);
        if (sprite?.complete && sprite.naturalWidth && sprite.naturalHeight && animation) {
            const sprinting = entity.state === 'move' && entity.facing === sprintDirection && pressed(sprintDirection < 0 ? 'A' : 'D');
            const isAction = entity.action && ['attack', 'skill'].includes(entity.state);
            const isTimedState = ['hurt', 'knockdown', 'dead', 'dodge', 'interact'].includes(entity.state);
            let animationFrame;
            if (isAction) {
                const progress = clamp(entity.action.time / Math.max(.001, entity.action.total), 0, .999999);
                animationFrame = Math.min(animation.frames - 1, Math.floor(progress * animation.frames));
            } else if (isTimedState) {
                const duration = Math.max(.001, entity.stateDuration || animation.frames / animation.fps);
                const progress = clamp(entity.stateElapsed / duration, 0, .999999);
                animationFrame = Math.min(animation.frames - 1, Math.floor(progress * animation.frames));
            } else if (entity.state === 'jump' || entity.state === 'fall') {
                const splitFrame = Math.max(1, Math.ceil(animation.frames / 2));
                animationFrame = entity.state === 'jump'
                    ? Math.min(splitFrame - 1, Math.floor((entity.stateElapsed || 0) * animation.fps))
                    : Math.min(animation.frames - 1, splitFrame + Math.floor((entity.stateElapsed || 0) * animation.fps));
            } else {
                const localTime = Number.isFinite(entity.stateElapsed) ? entity.stateElapsed : performance.now() / 1000;
                const animationTime = localTime * (sprinting ? 1.45 : 1);
                animationFrame = Math.floor(animationTime * animation.fps) % animation.frames;
            }
            const sourceWidth = sprite.naturalWidth / animation.frames;
            const sourceHeight = sprite.naturalHeight;
            ctx.save();
            ctx.translate(entity.x, entity.y - 6 - lift);
            ctx.scale(entity.facing || 1, 1);
            ctx.shadowColor = accent;
            ctx.shadowBlur = entity.state === 'skill' ? 24 : 10;
            ctx.drawImage(sprite, animationFrame * sourceWidth, 0, sourceWidth, sourceHeight, -116, -210, 232, 232);
            ctx.restore();
        } else {
            ctx.fillStyle = accent; ctx.fillRect(entity.x - 17, entity.y - 61 - lift, 34, 58); ctx.fillStyle = '#f5d7bf'; ctx.beginPath(); ctx.arc(entity.x, entity.y - 74 - lift, 17, 0, Math.PI * 2); ctx.fill();
        }
        const action = entity.action;
        if (action && action.time >= action.data.active[0] && action.time <= action.data.active[1]) { ctx.save(); ctx.globalAlpha = .68; ctx.strokeStyle = action.color; ctx.lineWidth = entity.state === 'skill' ? 14 : 9; ctx.shadowColor = action.color; ctx.shadowBlur = 18; ctx.beginPath(); const radius = Math.min(168, action.data.range * .62); ctx.arc(entity.x + entity.facing * 28, entity.y - 72 - lift, radius, entity.facing > 0 ? -1.16 : Math.PI - 1.16, entity.facing > 0 ? .86 : Math.PI + .86); ctx.stroke(); ctx.restore(); }
    };
    const drawDungeon = () => {
        const room = currentRoom(); const palette = ['#2a574d', '#3a2b54', '#315472'][ABYSS_AREAS.findIndex((area) => area.id === run.dungeon.area.id)]; drawBackdrop(palette, '#101827');
        const backdrop = images.get(run.backgroundId);
        if (backdrop?.complete && backdrop.naturalWidth) { const backdropHeight = W * backdrop.naturalHeight / backdrop.naturalWidth; ctx.save(); ctx.globalAlpha = .86; ctx.drawImage(backdrop, 0, 505 - backdropHeight, W, backdropHeight); ctx.restore(); }
        const shake = run.shake || 0; const sx = shake ? (Math.random() - .5) * shake * 2 : 0; const sy = shake ? (Math.random() - .5) * shake : 0;
        ctx.save(); ctx.translate(sx, sy);
        const floor = ctx.createLinearGradient(0, 505, 0, H); floor.addColorStop(0, 'rgba(31, 45, 45, .92)'); floor.addColorStop(.12, 'rgba(12, 21, 24, .96)'); floor.addColorStop(1, '#070b12'); ctx.fillStyle = floor; ctx.fillRect(0, 505, W, H - 505); ctx.fillStyle = 'rgba(244, 201, 111, .38)'; ctx.fillRect(0, 505, W, 4);
        for (let x = -40; x < W + 120; x += 94) { ctx.strokeStyle = 'rgba(213, 182, 115, .13)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 507); ctx.lineTo(x + 110, H); ctx.stroke(); }
        const alive = room.enemies.some((enemy) => !enemy.dead);
        if (!alive) { const gateX = 1160; const gateY = 495; ctx.save(); ctx.strokeStyle = '#6ff0ff'; ctx.shadowColor = '#46d9ff'; ctx.shadowBlur = 22; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(gateX, gateY - 68, 46, Math.PI, 0); ctx.lineTo(gateX + 46, gateY); ctx.lineTo(gateX - 46, gateY); ctx.closePath(); ctx.stroke(); ctx.globalAlpha = .48; ctx.fillStyle = '#48d4ff'; ctx.fillRect(gateX - 36, gateY - 61, 72, 57); ctx.restore(); drawText(run.roomIndex === run.rooms.length - 1 ? '首领已击败' : '前往下一房', gateX, gateY - 132, 15, '#e6fdff', 'center', 800); }
        if (room.chest && !room.chest.opened) { const chestX = room.chest.x; const chestY = room.chest.y; ctx.fillStyle = '#5b3214'; ctx.fillRect(chestX - 31, chestY - 27, 62, 36); ctx.fillStyle = '#c88932'; ctx.fillRect(chestX - 31, chestY - 33, 62, 13); ctx.fillStyle = '#f6d36c'; ctx.fillRect(chestX - 4, chestY - 33, 8, 42); ctx.strokeStyle = '#ffe2a1'; ctx.strokeRect(chestX - 31, chestY - 33, 62, 42); drawText('宝箱', chestX, chestY - 48, 13, '#ffe4a2', 'center', 800); }
        const nearbyEquipment = room.drops
            .filter((drop) => !drop.picked && drop.value.kind === 'item' && dist(player, drop) < 65)
            .sort((a, b) => dist(player, a) - dist(player, b))[0];
        room.drops.filter((drop) => !drop.picked).forEach((drop) => {
            if (drop.value.kind === 'item') { const item = drop.value.item; drawDropAura(item, drop.x, drop.y); ctx.save(); ctx.shadowColor = ABYSS_RARITIES[item.rarity]?.color || '#c5cbd4'; ctx.shadowBlur = 18; drawItemIcon(item, drop.x - 18, drop.y - 38, 36); ctx.restore(); drawText(item.name, drop.x, drop.y + 17, 12, ABYSS_RARITIES[item.rarity]?.color || '#e8edf2', 'center', 800); if (drop === nearbyEquipment) { ctx.save(); ctx.fillStyle = 'rgba(6, 12, 22, .92)'; ctx.strokeStyle = '#f5e7b0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(drop.x, drop.y - 62, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); drawText('E', drop.x, drop.y - 57, 13, '#fff4c5', 'center', 900); ctx.restore(); } }
            else if (drop.value.kind === 'material') { drawAbyssTicket(drop.x - 18, drop.y - 33, 36, 26); drawText(`${drop.value.name} ×${drop.value.amount}`, drop.x, drop.y + 14, 12, '#d9bcff', 'center', 800); }
            else { const image = images.get('coin'); if (image?.complete && image.naturalWidth) { ctx.save(); ctx.shadowColor = '#ffd457'; ctx.shadowBlur = 12; ctx.drawImage(image, drop.x - 15, drop.y - 30, 30, 30); ctx.restore(); } else { ctx.fillStyle = '#f6d24d'; ctx.beginPath(); ctx.arc(drop.x, drop.y - 12, 10, 0, Math.PI * 2); ctx.fill(); } }
        });
        room.enemies.filter((enemy) => !enemy.dead).sort((a, b) => a.y - b.y).forEach(drawEnemy); drawPlayer(player);
        run.visuals.forEach(drawCombatVisual);
        run.projectiles.forEach((projectile) => { ctx.save(); ctx.strokeStyle = projectile.color; ctx.fillStyle = projectile.color; ctx.shadowColor = projectile.color; ctx.shadowBlur = 18; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(projectile.x - projectile.vx * .055, projectile.y - projectile.z - projectile.vy * .055); ctx.lineTo(projectile.x, projectile.y - projectile.z); ctx.stroke(); ctx.beginPath(); ctx.arc(projectile.x, projectile.y - projectile.z, 12, 0, Math.PI * 2); ctx.fill(); ctx.restore(); });
        run.playerProjectiles.forEach((projectile) => { const radius = Math.max(10, projectile.radius * .46); ctx.save(); ctx.strokeStyle = projectile.color; ctx.fillStyle = '#f6feff'; ctx.shadowColor = projectile.color; ctx.shadowBlur = 28; ctx.globalAlpha = .42; ctx.lineWidth = Math.max(10, projectile.radius * .62); ctx.beginPath(); ctx.moveTo(projectile.x - projectile.vx * .14, projectile.y - 62); ctx.lineTo(projectile.x, projectile.y - 62); ctx.stroke(); ctx.globalAlpha = 1; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(projectile.x, projectile.y - 62, radius, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(projectile.x, projectile.y - 62, radius * .54, 0, Math.PI * 2); ctx.fill(); ctx.restore(); });
        run.effects.forEach((effect) => { const progress = 1 - effect.life / Math.max(.001, effect.maxLife || ABYSS_COMBAT.feedback.damageLife); drawText(effect.text, effect.x, effect.y - progress * (effect.rise || 52), effect.kind === 'critical' ? 22 : 18, effect.color, 'center', 800); }); ctx.restore();
        if (run.difficulty.abyss) {
            const pressure = .07 + (Math.sin(performance.now() / 520) + 1) * .012;
            const vignette = ctx.createRadialGradient(W / 2, H * .48, 210, W / 2, H * .48, 735);
            vignette.addColorStop(0, 'rgba(18, 7, 30, 0)');
            vignette.addColorStop(.72, `rgba(44, 12, 62, ${pressure * .34})`);
            vignette.addColorStop(1, `rgba(13, 3, 24, ${pressure + .14})`);
            ctx.fillStyle = vignette; ctx.fillRect(0, 0, W, H);
        }
        if (run.flash > 0) { ctx.save(); ctx.globalAlpha = Math.min(.22, run.flash * 1.75); ctx.fillStyle = run.flashColor; ctx.fillRect(0, 0, W, H); ctx.restore(); }
        drawDungeonHud(); drawBossHud(); drawQuickActions(true); drawCombatStatus(); drawTouchPad();
        drawCombatBar();
        if (overlay) drawOverlay();
    };
    const drawCombatVisual = (visual) => {
        const progress = 1 - visual.life / visual.maxLife;
        const visualX = visual.followPlayer ? player.x : visual.x; const visualY = visual.followPlayer ? player.y - 68 - player.z : visual.y;
        ctx.save(); ctx.translate(visualX, visualY); ctx.scale(visual.facing || 1, 1); ctx.globalAlpha = Math.max(0, 1 - progress);
        ctx.strokeStyle = visual.color; ctx.fillStyle = visual.color; ctx.shadowColor = visual.color; ctx.shadowBlur = 24;
        if (visual.type === 'hitStamp' || visual.type === 'superBanner') { const image = images.get(visual.type === 'hitStamp' ? 'hit' : 'super'); if (image?.complete && image.naturalWidth) { const width = visual.radius; const height = width * image.naturalHeight / image.naturalWidth; ctx.drawImage(image, -width / 2, -height / 2, width, height); } }
        else if (visual.type === 'slash' || visual.type === 'trail') { ctx.lineWidth = visual.type === 'slash' ? 15 * (1 - progress * .5) : 9; ctx.beginPath(); ctx.arc(0, 0, visual.radius * (.55 + progress * .55), -.98, .92); ctx.stroke(); }
        else if (visual.type === 'skillAura') { ctx.lineWidth = 5 + progress * 4; for (let ring = 0; ring < 3; ring += 1) { ctx.globalAlpha *= .82; ctx.beginPath(); ctx.arc(0, 0, visual.radius * (.25 + progress * .55 + ring * .13), progress * 4 + ring, progress * 4 + ring + Math.PI * 1.35); ctx.stroke(); } }
        else if (visual.type === 'shockwave') { ctx.lineWidth = Math.max(4, visual.radius * .045 * (1 - progress * .35)); ctx.scale(1, .38); for (let ring = 0; ring < 3; ring += 1) { ctx.globalAlpha *= .82; ctx.beginPath(); ctx.arc(0, 0, visual.radius * (.28 + progress * .72 - ring * .08), 0, Math.PI * 2); ctx.stroke(); } }
        else if (visual.type === 'vortex') { ctx.lineWidth = 8; for (let arc = 0; arc < 4; arc += 1) { const angle = progress * 7 + arc * Math.PI / 2; ctx.beginPath(); ctx.arc(0, 0, visual.radius * (.42 + arc * .11), angle, angle + Math.PI * 1.08); ctx.stroke(); } }
        else if (visual.type === 'impact') { ctx.lineWidth = 5 * (1 - progress * .45); for (let ray = 0; ray < 10; ray += 1) { const angle = ray * Math.PI / 5 + .18; const inner = visual.radius * (.12 + progress * .18); const outer = visual.radius * (.52 + progress * .48); ctx.beginPath(); ctx.moveTo(Math.cos(angle) * inner, Math.sin(angle) * inner); ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer); ctx.stroke(); } ctx.globalAlpha *= .72; ctx.beginPath(); ctx.arc(0, 0, visual.radius * (.18 + progress * .42), 0, Math.PI * 2); ctx.stroke(); }
        else {
            const radius = visual.radius * (.24 + progress);
            ctx.globalAlpha *= .68;
            ctx.lineWidth = Math.max(3, visual.radius * .055);
            for (let ray = 0; ray < 7; ray += 1) { const angle = ray * Math.PI * 2 / 7 + progress * 1.8; ctx.beginPath(); ctx.moveTo(Math.cos(angle) * radius * .22, Math.sin(angle) * radius * .22); ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius); ctx.stroke(); }
            ctx.globalAlpha *= .72; ctx.beginPath(); ctx.arc(0, 0, radius * .46, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    };
    const drawBossHud = () => {
        const boss = currentRoom()?.enemies.find((enemy) => enemy.boss && !enemy.dead);
        if (!boss) return;
        const width = 800; const x = (W - width) / 2; const y = 142; const ratio = clamp(boss.hp / boss.maxHp, 0, 1);
        ctx.save();
        ctx.fillStyle = 'rgba(8, 10, 17, .92)'; ctx.fillRect(x - 14, y - 10, width + 28, 62);
        ctx.strokeStyle = '#cfa954'; ctx.lineWidth = 2; ctx.strokeRect(x - 14, y - 10, width + 28, 62);
        ctx.fillStyle = '#cfa954'; ctx.fillRect(x - 14, y - 10, 150, 5); ctx.fillRect(x + width - 136, y - 10, 150, 5);
        drawText(`BOSS  ${boss.name}`, x, y + 14, 17, '#ffe7a1', 'left', 900);
        ctx.fillStyle = '#200d16'; ctx.fillRect(x, y + 25, width, 21);
        const bar = ctx.createLinearGradient(x, 0, x + width, 0); bar.addColorStop(0, '#9e1936'); bar.addColorStop(.55, '#ed4a51'); bar.addColorStop(1, '#ffb34d'); ctx.fillStyle = bar; ctx.fillRect(x, y + 23, width * ratio, 20);
        ctx.strokeStyle = 'rgba(255, 234, 197, .75)'; ctx.strokeRect(x, y + 25, width, 21);
        drawText(`${Math.max(0, Math.ceil(boss.hp))} / ${boss.maxHp}`, x + width / 2, y + 41, 12, '#fff5de', 'center', 800);
        const poiseRatio = clamp(boss.poise / Math.max(1, boss.poiseMax), 0, 1);
        drawText('韧性', x + width, y + 14, 11, poiseRatio > .35 ? '#e5c56f' : '#ff8b76', 'right', 800);
        ctx.fillStyle = '#18131d'; ctx.fillRect(x, y + 49, width, 6); ctx.fillStyle = poiseRatio > .35 ? '#e0b85a' : '#ff755f'; ctx.fillRect(x, y + 49, width * poiseRatio, 6);
        for (let segment = 1; segment < boss.poiseMax; segment += 1) { const markerX = x + width * segment / boss.poiseMax; ctx.fillStyle = '#17111a'; ctx.fillRect(markerX - 1, y + 49, 2, 6); }
        ctx.restore();
    };
    const drawEnemy = (enemy) => {
        const lift = enemy.z || 0;
        if (enemy.action?.telegraph) {
            const telegraph = enemyActionColor(enemy.action.type); const targetX = enemy.action.targetX ?? player.x; const targetY = enemy.action.targetY ?? player.y; const radius = enemy.action.radius || 68;
            ctx.save(); ctx.fillStyle = telegraph.fill; ctx.strokeStyle = telegraph.solid; ctx.shadowColor = telegraph.solid; ctx.shadowBlur = enemy.boss ? 14 : 8; ctx.lineWidth = enemy.boss ? 3 : 2; ctx.setLineDash([10, 7]);
            if (enemy.action.type === 'dash') { ctx.lineWidth = Math.max(24, radius * .58); ctx.globalAlpha = .24; ctx.beginPath(); ctx.moveTo(enemy.x, enemy.y); ctx.lineTo(targetX, targetY); ctx.stroke(); ctx.globalAlpha = 1; ctx.lineWidth = 2; }
            ctx.beginPath(); ctx.ellipse(targetX, targetY, radius, radius * .30, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); ctx.restore();
        }
        if (enemy.action && !enemy.action.telegraph) { const telegraph = enemyActionColor(enemy.action.type); ctx.save(); ctx.strokeStyle = telegraph.solid; ctx.shadowColor = telegraph.solid; ctx.shadowBlur = 14; ctx.lineWidth = enemy.boss ? 11 : 7; ctx.beginPath(); ctx.arc(enemy.x + enemy.facing * 18, enemy.y - 70 - lift, enemy.action.radius * .62, enemy.facing > 0 ? -1.1 : Math.PI - 1.1, enemy.facing > 0 ? .75 : Math.PI + .75); ctx.stroke(); ctx.restore(); }
        const model = ABYSS_ASSETS.enemyModels[enemy.modelId]; const attacking = !enemy.boss && Boolean(enemy.action); const eliteAttack = attacking && (enemy.champion || enemy.source.elite);
        let image = enemy.boss ? images.get(`enemy:${enemy.modelId}`) : attacking ? images.get(eliteAttack ? `enemy:${enemy.modelId}:elite` : `enemy:${enemy.modelId}`) : images.get(`enemy:${enemy.modelId}:idle`);
        let displayModel = enemy.boss || !attacking
            ? { columns: 1, rows: 1, frames: 1, fps: 1 }
            : eliteAttack
                ? { columns: model.attackColumns, rows: model.attackRows, frames: model.attackFrames, fps: model.fps }
                : model;
        if (!image?.complete || !image.naturalWidth) {
            image = images.get(`enemy:${enemy.modelId}:idle`) || images.get(`enemy:${enemy.modelId}`);
            displayModel = { columns: 1, rows: 1, frames: 1, fps: 1 };
        }
        const height = enemy.boss ? 330 : 210; const width = model ? height * (image?.naturalWidth || 4) / displayModel.columns / ((image?.naturalHeight || 2) / displayModel.rows) : enemy.size;
        if (model && image?.complete && image.naturalWidth) {
            let frameIndex = 0;
            if (attacking) {
                const action = enemy.action;
                const strikeFrame = Math.min(displayModel.frames - 1, Math.max(1, Math.floor(displayModel.frames * .55)));
                if (action.time < action.fireAt) frameIndex = Math.min(strikeFrame - 1, Math.floor(clamp(action.time / Math.max(.001, action.fireAt), 0, .999999) * strikeFrame));
                else frameIndex = Math.min(displayModel.frames - 1, strikeFrame + Math.floor(clamp((action.time - action.fireAt) / Math.max(.001, action.total - action.fireAt), 0, .999999) * (displayModel.frames - strikeFrame)));
            }
            ctx.save(); if (enemy.hitFlash > 0) ctx.globalAlpha = .55; else if (enemy.invulnerable > 0 && Math.floor(performance.now() / 70) % 2) ctx.globalAlpha = .38; drawSheetFrame(image, displayModel, frameIndex, enemy.x - width / 2, enemy.y - height - lift, width, height, enemy.facing < 0); ctx.restore();
        }
        else { ctx.fillStyle = enemy.color; ctx.beginPath(); ctx.arc(enemy.x, enemy.y - enemy.size / 2 - lift, enemy.size / 2, 0, Math.PI * 2); ctx.fill(); }
        const visualHeight = enemy.boss ? 235 : 145;
        if (enemy.state === 'hurt') { ctx.strokeStyle = '#fff5bf'; ctx.lineWidth = 3; ctx.strokeRect(enemy.x - width / 2 - 4, enemy.y - visualHeight - lift - 4, width + 8, visualHeight + 8); }
        if (enemy.armorFlash > 0) { ctx.save(); ctx.strokeStyle = '#ffd45f'; ctx.shadowColor = '#ffb62e'; ctx.shadowBlur = 18; ctx.lineWidth = 4; ctx.strokeRect(enemy.x - width / 2 - 6, enemy.y - visualHeight - lift - 6, width + 12, visualHeight + 12); ctx.restore(); }
        if (enemy.state === 'stunned') {
            ctx.save(); ctx.translate(enemy.x, enemy.y - visualHeight - lift - 18); ctx.strokeStyle = '#ffe46b'; ctx.fillStyle = '#fff3a6'; ctx.shadowColor = '#ffd35a'; ctx.shadowBlur = 14; ctx.lineWidth = 4;
            for (let star = 0; star < 3; star += 1) { const angle = performance.now() / 260 + star * Math.PI * 2 / 3; const sx = Math.cos(angle) * 25; const sy = Math.sin(angle) * 8; ctx.beginPath(); ctx.moveTo(sx, sy - 9); ctx.lineTo(sx + 4, sy - 3); ctx.lineTo(sx + 11, sy - 2); ctx.lineTo(sx + 6, sy + 3); ctx.lineTo(sx + 7, sy + 10); ctx.lineTo(sx, sy + 6); ctx.lineTo(sx - 7, sy + 10); ctx.lineTo(sx - 6, sy + 3); ctx.lineTo(sx - 11, sy - 2); ctx.lineTo(sx - 4, sy - 3); ctx.closePath(); ctx.stroke(); }
            ctx.restore(); drawText('眩晕', enemy.x, enemy.y - visualHeight - lift - 34, 13, '#ffe46b', 'center', 900);
        }
        if (enemy.state === 'knockdown' && enemy.z > 8) drawText('浮空', enemy.x, enemy.y - visualHeight - lift - 30, 12, '#bceeff', 'center', 800);
        const barX = enemy.x - (enemy.boss ? 95 : 46); const barY = enemy.y - visualHeight - 20 - lift; const barWidth = enemy.boss ? 190 : 92;
        drawBar(barX, barY, barWidth, enemy.hp, enemy.maxHp, enemy.boss ? '#df5572' : enemy.champion ? '#d5a64d' : '#b86d6d', enemy.name);
        if (!enemy.boss && enemy.poiseMax > 1) {
            const poiseRatio = clamp(enemy.poise / enemy.poiseMax, 0, 1);
            ctx.fillStyle = '#17131a'; ctx.fillRect(barX, barY + 18, barWidth, 4);
            ctx.fillStyle = poiseRatio > .34 ? '#d9ad4e' : '#ff7466'; ctx.fillRect(barX, barY + 18, barWidth * poiseRatio, 4);
            ctx.strokeStyle = 'rgba(255, 229, 160, .48)'; ctx.strokeRect(barX, barY + 18, barWidth, 4);
        }
    };
    const drawCombatBar = () => {
        const classId = active().classId; const skills = skillsFor(); const slots = [{ entry: skills[0], skillIndex: 0 }, { entry: { key: 'J', name: '普攻', icon: 'J', level: 1, cost: 0 }, skillIndex: -1 }, ...skills.slice(1).map((entry, skillIndex) => ({ entry, skillIndex: skillIndex + 1 }))]; const barX = 88; const barWidth = 1104; const slotWidth = Math.floor((barWidth - 22) / slots.length); const slotHeight = 76;
        ctx.fillStyle = 'rgba(5,8,16,.88)'; ctx.fillRect(barX, 620, barWidth, 92); ctx.strokeStyle = '#9b7a3d'; ctx.strokeRect(barX, 620, barWidth, 92);
        slots.forEach(({ entry, skillIndex }, index) => { const x = barX + 11 + index * slotWidth; const width = slotWidth - 6; const isAttack = entry.key === 'J'; const accent = isAttack ? '#e7c15a' : skillColorFor(classId, skillIndex); const values = isAttack ? { level: 1, cost: 0, cooldown: 0 } : skillValues(entry); const cd = isAttack ? 0 : player.cooldowns[entry.key] || 0; const locked = !isAttack && values.level <= 0; const noMp = !isAttack && player.mp < values.cost; const controlled = ['hurt','knockdown','dead'].includes(player.state); const unavailable = locked || cd > 0 || noMp || (!player.grounded && !entry.canAir) || controlled; ctx.fillStyle = unavailable ? '#202735' : '#111c29'; ctx.fillRect(x, 628, width, slotHeight); if (!unavailable) { ctx.save(); ctx.globalAlpha = .18; ctx.fillStyle = accent; ctx.fillRect(x, 628, width, slotHeight); ctx.restore(); } ctx.strokeStyle = accent; ctx.strokeRect(x, 628, width, slotHeight); ctx.fillStyle = accent; ctx.fillRect(x + 1, 700, width - 2, 3); drawText(entry.icon || entry.key, x + 8, 651, 15, unavailable ? '#71808e' : accent, 'left', 800); drawText(entry.key, x + width - 10, 648, 12, '#f7e7a9', 'center', 800); drawText(isAttack ? '普攻' : entry.name, x + width / 2, 675, 10, unavailable ? '#9ca6b0' : '#f4f7ff', 'center'); drawText(isAttack ? '连段' : locked ? `Lv.${entry.unlockLevel}` : `Lv.${values.level} MP${values.cost}`, x + width / 2, 696, 9, noMp ? '#ff9e9e' : '#cbd5df', 'center'); if (cd > 0) { ctx.fillStyle = 'rgba(4,7,14,.70)'; ctx.fillRect(x, 628, width, slotHeight * Math.min(1, cd / values.cooldown)); drawText(cd.toFixed(1), x + width / 2, 670, 15, '#ffffff', 'center', 800); } });
    };
    const styleRank = () => { const score = run.styleScore || 0; if (score >= 1600) return ['SSS', '#fff1a4']; if (score >= 1000) return ['SS', '#ffd06f']; if (score >= 650) return ['S', '#ff9f62']; if (score >= 350) return ['A', '#d7a0ff']; if (score >= 180) return ['B', '#83dfff']; return ['C', '#c7d0da']; };
    const drawSegmentedBar = (x, y, width, height, value, max, colors, label) => {
        const ratio = clamp(value / Math.max(1, max), 0, 1); const gradient = ctx.createLinearGradient(x, 0, x + width, 0);
        gradient.addColorStop(0, colors[0]); gradient.addColorStop(1, colors[1]);
        ctx.fillStyle = 'rgba(1, 4, 10, .88)'; ctx.fillRect(x, y, width, height); ctx.fillStyle = gradient; ctx.fillRect(x, y, width * ratio, height);
        for (let segment = 1; segment < 10; segment += 1) { ctx.fillStyle = 'rgba(3, 6, 12, .38)'; ctx.fillRect(x + width * segment / 10 - 1, y, 2, height); }
        ctx.strokeStyle = 'rgba(240, 245, 255, .58)'; ctx.strokeRect(x, y, width, height); drawText(label, x + 7, y + height - 4, 11, '#fff', 'left', 800);
    };
    const drawDungeonHud = () => {
        const hero = active(); const stats = getStats(hero); const border = run.difficulty.abyss ? '#a46cff' : '#a98a4b';
        ctx.fillStyle = 'rgba(4, 8, 15, .91)'; ctx.fillRect(14, 14, 486, 112); ctx.strokeStyle = border; ctx.lineWidth = 2; ctx.strokeRect(14, 14, 486, 112);
        ctx.fillStyle = 'rgba(17, 27, 39, .96)'; ctx.fillRect(28, 29, 42, 42); ctx.strokeStyle = ABYSS_CHARACTERS[hero.classId].accent; ctx.strokeRect(28, 29, 42, 42); drawText(`${hero.level}`, 49, 57, 17, '#fff0bb', 'center', 900);
        drawText(`${hero.name} · ${run.dungeon.name} · ${run.difficulty.name}`, 82, 40, 15, run.difficulty.abyss ? '#e2c7ff' : '#f2dda4', 'left', 800);
        drawSegmentedBar(82, 49, 260, 19, player.hp, stats.hp, ['#7f1828', '#ee5a62'], `HP ${Math.ceil(player.hp)} / ${stats.hp}`);
        drawSegmentedBar(82, 75, 260, 19, player.mp, stats.mp, ['#164b8c', '#53a9ef'], `MP ${Math.ceil(player.mp)} / ${stats.mp}`);
        const xpRatio = hero.level >= 60 ? 1 : clamp(hero.xp / xpFor(hero.level), 0, 1); ctx.fillStyle = '#111a25'; ctx.fillRect(82, 103, 260, 6); ctx.fillStyle = '#65d8c2'; ctx.fillRect(82, 103, 260 * xpRatio, 6); ctx.strokeStyle = '#47736f'; ctx.strokeRect(82, 103, 260, 6); drawText(hero.level >= 60 ? 'MAX' : `EXP ${Math.floor(xpRatio * 100)}%`, 338, 110, 10, '#94eadb', 'right');
        const coin = images.get('coin'); if (coin?.complete && coin.naturalWidth) ctx.drawImage(coin, 365, 47, 21, 21); else drawText('G', 375, 63, 13, '#f6d24d', 'center', 900); drawText(`${hero.gold} +${run.earnedGold}`, 394, 63, 13, '#f6d24d');
        drawAbyssTicket(364, 76, 25, 19); drawText(`${hero.materials?.abyssTicket || 0}${run.earnedTickets ? ` +${run.earnedTickets}` : ''}`, 397, 91, 12, '#d9bcff');
        drawText(`击杀 ${run.kills}`, 365, 113, 12, '#cbd8e4');
        if (run.combo > 1) { const combo = images.get('combo'); if (combo?.complete && combo.naturalWidth) ctx.drawImage(combo, 986, 26, 172, 47); else drawText('COMBO', 1052, 58, 15, '#f7d86a', 'center', 800); drawText(`${run.combo}`, 1070, 110, 42, '#fff1a6', 'center', 900); }
        const [rank, rankColor] = styleRank(); drawText('STYLE', 1212, 49, 11, '#abb8c5', 'center', 800); drawText(rank, 1212, 94, rank.length > 2 ? 30 : 38, rankColor, 'center', 900);
    };
    const chooseInventoryItem = (item, x, y, selling = false) => {
        if (!item) return;
        const now = performance.now();
        inspectedItemId = item.id;
        if (!selling && lastInventoryClick.id === item.id && now - lastInventoryClick.at <= 340) {
            if (active().equipped[item.slot] === item.id) unequip(item.slot); else equip(item);
            inventoryMenu = null;
            lastInventoryClick = { id: '', at: -Infinity };
            return;
        }
        lastInventoryClick = { id: item.id, at: now };
        inventoryMenu = { itemId: item.id, x: clamp(x + 54, 90, 1040), y: clamp(y, 105, 475), selling };
    };
    const fitText = (value, maxWidth, size = 12, weight = 600) => {
        const source = String(value ?? ''); ctx.font = `${weight} ${size}px system-ui, sans-serif`;
        if (ctx.measureText(source).width <= maxWidth) return source;
        let result = source; while (result.length > 1 && ctx.measureText(`${result}...`).width > maxWidth) result = result.slice(0, -1);
        return `${result}...`;
    };
    const comparisonStat = (key, value) => {
        const amount = Number(value || 0); const decimals = Number.isInteger(amount) ? 0 : 1;
        return `${statLabel[key] || key} ${amount > 0 ? '+' : ''}${amount.toFixed(decimals)}${percentStats.has(key) ? '%' : ''}`;
    };
    const drawItemDetails = (hero, item, x, y, width, height) => {
        ctx.fillStyle = 'rgba(4, 9, 19, .90)'; ctx.fillRect(x, y, width, height);
        ctx.strokeStyle = ABYSS_RARITIES[item?.rarity]?.color || '#53677b'; ctx.strokeRect(x, y, width, height);
        if (!item) { drawText('未选择装备', x + 18, y + 36, 15, '#8190a0'); return; }
        drawItemIcon(item, x + 14, y + 14, 54);
        drawText(fitText(`${item.locked ? '锁定 · ' : ''}${item.name}`, 282, 17, 800), x + 82, y + 27, 17, ABYSS_RARITIES[item.rarity]?.color || '#fff', 'left', 800);
        drawText(fitText(`Lv.${item.level} · ${ABYSS_SLOT_LABELS[item.slot]} · ${ABYSS_RARITIES[item.rarity]?.name} · ${gradeText(item)}`, 282, 12), x + 82, y + 48, 12, '#cbd6e0');
        const stats = Object.entries(item.stats || {}).map(([key, value]) => formatStat(key, value));
        stats.slice(0, 6).forEach((text, index) => drawText(fitText(text, 136, 11), x + 82 + (index % 2) * 144, y + 69 + Math.floor(index / 2) * 17, 11, '#e6edf5'));
        ctx.fillStyle = 'rgba(195, 213, 230, .22)'; ctx.fillRect(x + 374, y + 12, 1, height - 24);
        const equipped = hero.inventory.find((entry) => hero.equipped[item.slot] === entry.id);
        if (!equipped) { drawText('当前槽位未装备', x + 390, y + 29, 12, '#94a8b9'); return; }
        if (equipped.id === item.id) { drawText('当前已装备', x + 390, y + 29, 12, '#8ff4ff', 'left', 800); drawText(fitText(equipped.name, 200, 12), x + 390, y + 50, 12, ABYSS_RARITIES[equipped.rarity]?.color || '#fff'); return; }
        drawText('对比当前装备', x + 390, y + 24, 11, '#aab8c5');
        drawText(fitText(equipped.name, 200, 12, 800), x + 390, y + 44, 12, ABYSS_RARITIES[equipped.rarity]?.color || '#fff', 'left', 800);
        const keys = [...new Set([...Object.keys(item.stats || {}), ...Object.keys(equipped.stats || {})])];
        keys.map((key) => [key, Number(item.stats?.[key] || 0) - Number(equipped.stats?.[key] || 0)]).filter(([, delta]) => Math.abs(delta) > .001).slice(0, 3).forEach(([key, delta], index) => drawText(fitText(comparisonStat(key, delta), 200, 11), x + 390, y + 64 + index * 17, 11, delta > 0 ? '#7fe29a' : '#ff8f89'));
    };
    const drawEquipmentPane = (hero) => {
        ctx.fillStyle = 'rgba(5, 10, 20, .88)'; ctx.fillRect(72, 92, 370, 506);
        ctx.strokeStyle = 'rgba(211, 168, 77, .62)'; ctx.strokeRect(72, 92, 370, 506);
        drawText('已装备', 92, 122, 18, '#f1d48d');
        ABYSS_SLOTS.forEach((slot, index) => {
            const x = 92 + (index % 2) * 82; const y = 140 + Math.floor(index / 2) * 64;
            const item = hero.inventory.find((entry) => hero.equipped[slot] === entry.id);
            const levelLocked = ['support', 'magicStone', 'earring'].includes(slot) && hero.level < 60;
            ctx.fillStyle = 'rgba(11, 20, 34, .96)'; ctx.fillRect(x, y, 50, 50);
            ctx.strokeStyle = item ? ABYSS_RARITIES[item.rarity]?.color : levelLocked ? '#675f72' : '#566b7f'; ctx.strokeRect(x, y, 50, 50);
            if (item) {
                drawItemIcon(item, x + 3, y + 3, 44);
                if (item.locked) drawText('锁', x + 42, y + 14, 10, '#ffd878', 'center', 800);
                hitboxes.push({ x, y, width: 50, height: 50, action: () => chooseInventoryItem(item, x, y) });
            } else drawText(levelLocked ? '锁' : slotIcon[slot], x + 25, y + 32, 16, levelLocked ? '#777080' : '#8195a8', 'center', 800);
            drawText(ABYSS_SLOT_LABELS[slot], x + 25, y + 61, 10, item ? '#d7e3ec' : '#8996a3', 'center');
        });
        drawHero(hero.classId, 262, 132, 150, 245);
        drawText(`${hero.name}  Lv.${hero.level}`, 337, 392, 16, ABYSS_CHARACTERS[hero.classId].accent, 'center', 800);
        const stats = getStats(hero);
        [['物理攻击', stats.physicalAttack], ['魔法攻击', stats.magicalAttack], ['独立攻击', stats.independentAttack], ['力量', stats.strength], ['智力', stats.intelligence], ['生命', stats.hp], ['魔力', stats.mp], ['移动速度', `${stats.moveSpeed.toFixed(1)}%`]].forEach(([label, value], index) => drawText(`${label} ${value}`, 260, 424 + index * 21, 12, index < 3 ? '#f1d48d' : '#cbd7e1'));
    };
    const drawInventoryMenu = (hero) => {
        if (!inventoryMenu) return;
        const item = hero.inventory.find((entry) => entry.id === inventoryMenu.itemId);
        if (!item) { inventoryMenu = null; return; }
        const equipped = hero.equipped[item.slot] === item.id;
        const x = inventoryMenu.x; const y = inventoryMenu.y; const width = 150;
        const actions = inventoryMenu.selling
            ? [
                ['查看', () => { inspectedItemId = item.id; inventoryMenu = null; }, false, '#315f79'],
                [item.locked ? '解除锁定' : '锁定', () => { toggleItemLock(item); inventoryMenu = null; }, false, item.locked ? '#6b5b38' : '#515d6b'],
                ['出售', () => { if (sell(item)) { inspectedItemId = ''; inventoryMenu = null; } }, item.locked || equipped, '#8b4c45'],
            ]
            : [
                [equipped ? '卸下' : '装备', () => { if (equipped) unequip(item.slot); else equip(item); inventoryMenu = null; }, !equipped && !canEquip(item, hero), '#26788a'],
                ['查看', () => { inspectedItemId = item.id; inventoryMenu = null; }, false, '#315f79'],
                [item.locked ? '解除锁定' : '锁定', () => { toggleItemLock(item); inventoryMenu = null; }, false, item.locked ? '#6b5b38' : '#515d6b'],
            ];
        ctx.fillStyle = 'rgba(4, 8, 15, .98)'; ctx.fillRect(x - 5, y - 5, width + 10, actions.length * 36 + 10);
        ctx.strokeStyle = ABYSS_RARITIES[item.rarity]?.color || '#708094'; ctx.strokeRect(x - 5, y - 5, width + 10, actions.length * 36 + 10);
        actions.forEach(([label, action, disabled, color], index) => button(label, x, y + index * 36, width, 31, action, disabled, color));
    };
    const drawInventoryWindow = (hero, selling = false) => {
        const background = images.get('inventoryWindow');
        if (background?.complete && background.naturalWidth) { ctx.save(); ctx.globalAlpha = .22; const sourceHeight = Math.min(background.naturalHeight, Math.round(background.naturalWidth / (1160 / 620))); const sourceY = Math.floor((background.naturalHeight - sourceHeight) / 2); ctx.drawImage(background, 0, sourceY, background.naturalWidth, sourceHeight, 60, 50, 1160, 620); ctx.restore(); }
        ctx.fillStyle = 'rgba(4, 8, 18, .88)'; ctx.fillRect(60, 50, 1160, 620); ctx.strokeStyle = '#9a7b3e'; ctx.lineWidth = 2; ctx.strokeRect(60, 50, 1160, 620);
        drawText(selling ? `出售装备 · ${hero.gold} 金币` : `装备背包 · ${hero.inventory.length}/120`, 82, 82, 22, '#f2d58d');
        drawAbyssTicket(1090, 61, 34, 24); drawText(`${hero.materials?.abyssTicket || 0}`, 1137, 80, 15, '#d9bcff');
        drawEquipmentPane(hero);
        ctx.fillStyle = 'rgba(5, 10, 20, .88)'; ctx.fillRect(454, 92, 744, 506); ctx.strokeStyle = 'rgba(211, 168, 77, .55)'; ctx.strokeRect(454, 92, 744, 506);
        const filters = [['all', '全部'], ['weapon', '武器'], ['armor', '防具'], ['jewelry', '首饰'], ['special', '特殊']];
        filters.forEach(([id, label], index) => button(label, 470 + index * 82, 105, 74, 26, () => { inventoryFilter = id; inventoryPage = 0; inventoryMenu = null; }, inventoryFilter === id, inventoryFilter === id ? '#6a5630' : '#315f79'));
        [['rarity', '稀有度'], ['level', '等级'], ['slot', '部位']].forEach(([id, label], index) => button(label, 900 + index * 94, 105, 88, 26, () => { inventorySort = id; inventoryPage = 0; inventoryMenu = null; }, inventorySort === id, inventorySort === id ? '#6a5630' : '#485563'));
        const equippedFirst = (a, b) => Number(hero.equipped[b.slot] === b.id) - Number(hero.equipped[a.slot] === a.id);
        const rarityFirst = (a, b) => rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity);
        const sorter = inventorySort === 'level'
            ? (a, b) => equippedFirst(a, b) || b.level - a.level || rarityFirst(a, b) || a.name.localeCompare(b.name, 'zh-CN')
            : inventorySort === 'slot'
                ? (a, b) => equippedFirst(a, b) || ABYSS_SLOTS.indexOf(a.slot) - ABYSS_SLOTS.indexOf(b.slot) || rarityFirst(a, b) || b.level - a.level
                : (a, b) => equippedFirst(a, b) || rarityFirst(a, b) || b.level - a.level || a.name.localeCompare(b.name, 'zh-CN');
        const filtered = hero.inventory.filter((item) => inventoryFilter === 'all' || item.slot === inventoryFilter || (inventoryFilter === 'armor' && armorSlots.includes(item.slot)) || (inventoryFilter === 'jewelry' && jewelrySlots.includes(item.slot)) || (inventoryFilter === 'special' && specialSlots.includes(item.slot))).sort(sorter);
        const pageSize = 50; const pages = Math.max(1, Math.ceil(filtered.length / pageSize)); inventoryPage = clamp(inventoryPage, 0, pages - 1);
        const entries = filtered.slice(inventoryPage * pageSize, inventoryPage * pageSize + pageSize);
        for (let index = 0; index < pageSize; index += 1) {
            const x = 470 + (index % 10) * 62; const y = 142 + Math.floor(index / 10) * 62; const item = entries[index];
            ctx.fillStyle = 'rgba(8, 16, 28, .94)'; ctx.fillRect(x, y, 56, 56); ctx.strokeStyle = item?.id === inspectedItemId ? '#fff0a7' : '#405268'; ctx.lineWidth = item?.id === inspectedItemId ? 2 : 1; ctx.strokeRect(x, y, 56, 56);
            if (!item) continue;
            drawItemIcon(item, x + 4, y + 4, 48);
            if (item.locked) drawText('锁', x + 48, y + 15, 10, '#ffd878', 'center', 800);
            if (hero.equipped[item.slot] === item.id) drawText('装', x + 10, y + 51, 10, '#8ff4ff', 'center', 900);
            hitboxes.push({ x, y, width: 56, height: 56, action: () => chooseInventoryItem(item, x, y, selling) });
        }
        const selected = hero.inventory.find((item) => item.id === inspectedItemId) || null;
        drawItemDetails(hero, selected, 470, 462, 610, 118);
        drawText(`${filtered.length} 件 · ${inventoryPage + 1}/${pages}`, 1095, 483, 12, '#aebdca');
        button('上一页', 1092, 500, 90, 30, () => { inventoryPage = Math.max(0, inventoryPage - 1); inventoryMenu = null; }, inventoryPage <= 0, '#4b5867');
        button('下一页', 1092, 538, 90, 30, () => { inventoryPage = Math.min(pages - 1, inventoryPage + 1); inventoryMenu = null; }, inventoryPage >= pages - 1, '#315f79');
        button('角色', 865, 615, 100, 35, () => { overlay = 'character'; inventoryMenu = null; }, false, '#315f79');
        button('关闭', 1082, 615, 100, 35, () => { overlay = ''; inventoryMenu = null; }, false, '#53507d');
        drawInventoryMenu(hero);
    };
    const drawOverlay = () => {
        hitboxes.length = 0;
        ctx.fillStyle = 'rgba(3, 7, 16, .76)'; ctx.fillRect(0, 0, W, H); const hero = active();
        if (overlay === 'world') { panel(80, 48, 1120, 620, '世界地图 · 1-60 级远征路线'); ABYSS_AREAS.forEach((area, index) => { const x = 120 + (index % 4) * 270; const y = 120 + Math.floor(index / 4) * 230; const unlocked = hero.level >= area.unlockLevel || hero.progress.discovered.includes(area.id); panel(x, y, 235, 190, `${unlocked ? area.name : '锁定区域'}`); drawText(`推荐 ${area.levels[0]}-${area.levels[1]} 级`, x + 16, y + 62, 15, unlocked ? '#bce9ff' : '#9ea7af'); drawText(area.intro.slice(0, 19), x + 16, y + 88, 13, '#d5dbe5'); if (area.playable && unlocked) { area.dungeons.slice(0, 2).forEach((dungeon, dungeonIndex) => { const canEnter = hero.level >= dungeon.level; button(`Lv.${dungeon.level} ${dungeon.name}`, x + 16, y + 108 + dungeonIndex * 35, 200, 28, () => { overlay = 'difficulty'; run = { dungeon }; }, !canEnter, dungeonIndex ? '#4c657f' : '#236f82'); }); } else { drawText(`地下城：${area.dungeons.map((dungeon) => dungeon.name).join(' / ')}`, x + 16, y + 120, 12, '#9ea7af'); drawText(`等级 ${area.unlockLevel} 解锁`, x + 16, y + 155, 14, '#a7adb8'); } }); button('关闭', 1020, 610, 140, 38, () => { overlay = ''; }, false, '#53507d'); return; }
        if (overlay === 'difficulty') {
            const dungeon = run.dungeon; const tickets = hero.materials?.abyssTicket || 0; const ticketCost = getAbyssTicketCost(dungeon.level);
            const choices = [['normal', '普通', '基础掉落'], ['adventure', '冒险', '敌人强化，经验提高'], ['king', '王者', '高压挑战，更多经验']];
            if (dungeon.level >= 50) choices.push(['abyss', '深渊', `终极进化 Boss · 消耗深渊票 ${ticketCost}`]);
            panel(330, 135, 620, choices.length > 3 ? 470 : 390, `${dungeon.name} Lv.${dungeon.level} · 选择难度`);
            choices.forEach(([id, name, note], index) => { const isAbyss = id === 'abyss'; const disabled = hero.level < dungeon.level || isAbyss && (hero.level < 50 || tickets < ticketCost); button(name, 390, 205 + index * 68, 170, 46, () => beginDungeon(dungeon.id, id), disabled, isAbyss ? '#67408d' : index === 2 ? '#8b5b33' : '#226d87'); drawText(note, 585, 234 + index * 68, 15, disabled && isAbyss ? '#8f849b' : isAbyss ? '#d9bcff' : '#dce6ef'); });
            if (dungeon.level >= 50) { drawAbyssTicket(785, 156, 32, 23); drawText(`${tickets}`, 828, 175, 15, '#d9bcff'); }
            button('返回地图', 550, choices.length > 3 ? 548 : 480, 180, 38, () => { overlay = 'world'; }, false, '#53507d'); return;
        }
        if (overlay === 'settings') { panel(430, 215, 420, 250, '游戏设置'); drawText('音效', 480, 295, 18, '#dce8f2'); button(save.settings.sound === false ? '音效：关闭' : '音效：开启', 590, 265, 200, 48, () => { save.settings.sound = save.settings.sound === false; commit(); if (save.settings.sound) unlockSound(); }, false, save.settings.sound === false ? '#5a5369' : '#286f80'); drawText('Shift 闪避 · J 普攻 · H/K/L/Y/U/I/O/P/1/2/3/4 技能', 640, 350, 14, '#c7d4df', 'center'); button('关闭', 540, 390, 200, 42, () => { overlay = ''; }, false, '#53507d'); return; }
        if (overlay === 'guide') { panel(330, 180, 620, 340, '冒险向导'); drawText(`主线目标：前往地图石，挑战${ABYSS_AREAS.find((area) => hero.level >= area.unlockLevel)?.name || '岚风边地'}。`, 370, 260, 19); drawText('清空每个房间后，从右侧出口进入下一房。', 370, 305, 17, '#dce6ef'); drawText('Boss 掉落和首通奖励都会进入背包。', 370, 340, 17, '#dce6ef'); button('前往地图', 405, 410, 180, 46, () => { overlay = 'world'; }); button('关闭', 650, 410, 180, 46, () => { overlay = ''; }, false, '#53507d'); return; }
        if (overlay === 'smith' || overlay === 'merchant') { const isSmith = overlay === 'smith'; panel(210, 120, 860, 480, isSmith ? '铁匠 · 职业专属武器' : '装备商人 · 职业专属防具与出售'); const offers = isSmith ? [`smith_${hero.classId}_practice`] : [`merchant_${hero.classId}_top`, `merchant_${hero.classId}_shoes`]; offers.forEach((id, index) => { const item = ABYSS_EQUIPMENT[id]; panel(260 + index * 280, 195, 240, 190, item.name); drawText(`Lv.${item.level} ${ABYSS_RARITIES[item.rarity].name} · ${gradeText(item)}`, 280 + index * 280, 245, 15, ABYSS_RARITIES[item.rarity].color); drawText(classText(item), 280 + index * 280, 270, 13, '#b9e5ff'); drawText(Object.entries(item.stats).map(([key, value]) => formatStat(key, value)).join('  '), 280 + index * 280, 295, 14, '#e1e6ee'); button(`${item.price} 金币购买`, 280 + index * 280, 330, 190, 42, () => buy(id), hero.gold < item.price); }); drawText(isSmith ? '武器与五件防具只可由对应职业装备。' : '首饰、称号与特殊装备为全职业通用。', 260, 435, 16, '#bac7d5'); button(isSmith ? '背包' : '出售背包物品', 510, 500, 180, 42, () => { overlay = isSmith ? 'inventory' : 'sell'; }); button('关闭', 710, 500, 120, 42, () => { overlay = ''; }, false, '#53507d'); return; }
        if (overlay === 'warehouse') {
            panel(115, 84, 1050, 555, '仓库管理员 · 本地仓库');
            drawText(`背包 ${hero.inventory.length}/120`, 150, 145, 16, '#bce9ff');
            drawText(`仓库 ${hero.warehouse.length}/120`, 680, 145, 16, '#ffe1a1');
            const drawStorageItem = (item, index, storage) => {
                const col = index % 2; const row = Math.floor(index / 2); const x = (storage ? 675 : 145) + col * 245; const y = 170 + row * 82;
                if (y > 525) return;
                const equipped = hero.equipped[item.slot] === item.id;
                ctx.fillStyle = equipped ? 'rgba(100, 91, 52, .55)' : 'rgba(53, 93, 113, .38)'; ctx.fillRect(x, y, 225, 66);
                ctx.strokeStyle = ABYSS_RARITIES[item.rarity]?.color || '#c5cbd4'; ctx.strokeRect(x, y, 225, 66);
                drawText(`${item.icon} ${item.name}`, x + 10, y + 25, 15, ABYSS_RARITIES[item.rarity]?.color || '#fff');
                drawText(equipped ? '已装备，先卸下' : `${gradeText(item)} · ${classText(item)} · 点击${storage ? '取回' : '存入'}`, x + 10, y + 49, 12, '#d8e1e9');
                if (!equipped || storage) hitboxes.push({ x, y, width: 225, height: 66, action: () => storage ? withdrawItem(item) : storeItem(item) });
            };
            hero.inventory.slice(0, 10).forEach((item, index) => drawStorageItem(item, index, false));
            hero.warehouse.slice(0, 10).forEach((item, index) => drawStorageItem(item, index, true));
            button('关闭', 565, 565, 150, 42, () => { overlay = ''; }, false, '#53507d');
            return;
        }
        if (overlay === 'skills') { ensureSkills(hero); const entries = skillsFor(hero); const selected = entries.find((entry) => entry.id === selectedSkillId) || entries[0]; const values = skillValues(selected, hero); panel(70, 55, 1140, 600, `技能页 · 技能点 ${hero.skillPoints}`); entries.forEach((entry, index) => { const x = 100 + (index % 3) * 245; const y = 125 + Math.floor(index / 3) * 78; const value = skillValues(entry, hero); const unlocked = value.level > 0; ctx.fillStyle = unlocked ? 'rgba(74, 129, 146, .38)' : 'rgba(45, 48, 60, .8)'; ctx.fillRect(x, y, 220, 62); ctx.strokeStyle = unlocked ? '#538da4' : '#4e5562'; ctx.strokeRect(x, y, 220, 62); drawText(`${entry.key}  ${entry.name}`, x + 12, y + 25, 15, unlocked ? '#e9f8ff' : '#a3aab3'); drawText(unlocked ? `Lv.${value.level}/${entry.maxLevel}  MP ${value.cost}  CD ${value.cooldown.toFixed(1)}s` : `Lv.${entry.unlockLevel} 解锁`, x + 12, y + 49, 11, '#c4d0da'); hitboxes.push({ x, y, width: 220, height: 62, action: () => { selectedSkillId = entry.id; } }); }); panel(860, 130, 300, 335, selected.name); drawText(`固定键位 ${selected.key} · ${selected.category}`, 885, 205, 14, '#dbeaf3'); drawText(`伤害 ${values.damage.toFixed(2)}x · ${selected.attacks} 段`, 885, 238, 14, '#dbeaf3'); drawText(`范围 ${Math.round(values.range)} · ${selected.canAir ? '可空放' : '仅地面'}`, 885, 270, 14, '#dbeaf3'); drawText(`前摇 ${selected.startup}s · 后摇 ${selected.recovery}s`, 885, 302, 14, '#dbeaf3'); drawText(selected.superArmor ? '施放期间：霸体' : '施放期间可被打断', 885, 334, 14, selected.superArmor ? '#ffdc91' : '#cdd5de'); button('升级', 885, 370, 110, 38, () => upgradeSkill(selected), hero.skillPoints <= 0 || values.level <= 0 || values.level >= selected.maxLevel); button('重置技能', 1010, 370, 125, 38, () => resetSkills(), hero.gold < 80 + hero.level * 6); button('返回角色', 875, 545, 140, 40, () => { overlay = 'character'; }, false, '#53507d'); button('关闭', 1035, 545, 120, 40, () => { overlay = ''; }, false, '#53507d'); return; }
        if (overlay === 'inventory' || overlay === 'sell') { drawInventoryWindow(hero, overlay === 'sell'); return; }
        if (overlay === 'inventory' || overlay === 'sell' || overlay === 'character') { const inventory = hero.inventory; panel(80, 70, 1120, 580, overlay === 'inventory' ? `背包 · ${inventory.length}/120` : overlay === 'sell' ? `出售物品 · 金币 ${hero.gold}` : `角色面板 · ${hero.name} Lv.${hero.level}`); if (overlay === 'character') { const stats = getStats(hero); characterStatOrder.forEach((key, index) => drawText(`${statLabel[key]}：${Number(stats[key] || 0).toFixed(percentStats.has(key) ? 1 : 0)}${percentStats.has(key) ? '%' : ''}`, 108 + (index % 2) * 242, 128 + Math.floor(index / 2) * 28, 15, '#d9e6ef')); drawText(`当前属强：${Math.round(stats.elementalStrength)}`, 108, 474, 15, '#b9ecff'); drawText('已装备（点击卸下）', 600, 135, 19, '#bce9ff'); ABYSS_SLOTS.forEach((slot, index) => { const item = inventory.find((entry) => hero.equipped[slot] === entry.id); const x = 600 + (index % 2) * 265; const y = 165 + Math.floor(index / 2) * 55; drawText(`${ABYSS_SLOT_LABELS[slot]}：${item?.name || (['support', 'magicStone', 'earring'].includes(slot) ? '60级解锁' : '空')}`, x, y, 15, item ? ABYSS_RARITIES[item.rarity].color : '#adb6c0'); if (item) hitboxes.push({ x, y: y - 21, width: 240, height: 30, action: () => unequip(slot) }); }); }
        else {
            const filters = [['all', '全部'], ['weapon', '武器'], ['armor', '防具'], ['jewelry', '首饰']];
            const armorSlots = ['headShoulder', 'top', 'bottom', 'belt', 'shoes']; const jewelrySlots = ['bracelet', 'necklace', 'ring'];
            filters.forEach(([id, label], index) => button(label, 115 + index * 104, 96, 92, 28, () => { inventoryFilter = id; inventoryPage = 0; }, inventoryFilter === id, inventoryFilter === id ? '#476074' : '#236f82'));
            const filtered = inventory.filter((item) => inventoryFilter === 'all' || item.slot === inventoryFilter || (inventoryFilter === 'armor' && armorSlots.includes(item.slot)) || (inventoryFilter === 'jewelry' && jewelrySlots.includes(item.slot))).sort((a, b) => (Number(b.equipped) - Number(a.equipped)) || (ABYSS_RARITIES[b.rarity]?.weight || 0) - (ABYSS_RARITIES[a.rarity]?.weight || 0) || b.level - a.level || a.name.localeCompare(b.name, 'zh-CN'));
            const pageSize = 15; const pages = Math.max(1, Math.ceil(filtered.length / pageSize)); inventoryPage = clamp(inventoryPage, 0, pages - 1);
            const entries = filtered.slice(inventoryPage * pageSize, inventoryPage * pageSize + pageSize);
            entries.forEach((item, index) => { const col = index % 3; const row = Math.floor(index / 3); const x = 115 + col * 350; const y = 145 + row * 83; const equipped = hero.equipped[item.slot] === item.id; const entries = Object.entries(item.stats); const statText = entries.slice(0, 3).map(([key, value]) => formatStat(key, value)).join(' ') + (entries.length > 3 ? ` +${entries.length - 3}词条` : ''); ctx.fillStyle = equipped ? 'rgba(163, 127, 59, .22)' : 'rgba(255,255,255,.05)'; ctx.fillRect(x, y, 320, 68); ctx.strokeStyle = ABYSS_RARITIES[item.rarity]?.color || '#70808f'; ctx.strokeRect(x, y, 320, 68); drawText(`${item.icon} ${item.name}${equipped ? '  [已装备]' : ''}`, x + 12, y + 22, 16, ABYSS_RARITIES[item.rarity]?.color || '#fff'); drawText(`${gradeText(item)} · ${classText(item)}`, x + 12, y + 42, 12, ABYSS_ITEM_GRADES[item.grade]?.color || '#b9dca7'); drawText(`Lv.${item.level} · ${ABYSS_SLOT_LABELS[item.slot]} · ${statText}`, x + 12, y + 60, 11, '#d9e0e9'); hitboxes.push({ x, y, width: 320, height: 68, action: () => overlay === 'sell' ? sell(item) : equip(item) }); });
            drawText(`${filtered.length} 件 · 第 ${inventoryPage + 1}/${pages} 页 · 点击物品${overlay === 'sell' ? '出售' : '装备'}`, 115, 575, 14, '#c6d6e1'); button('上一页', 610, 552, 100, 32, () => { inventoryPage = Math.max(0, inventoryPage - 1); }, inventoryPage <= 0, '#476074'); button('下一页', 722, 552, 100, 32, () => { inventoryPage = Math.min(pages - 1, inventoryPage + 1); }, inventoryPage >= pages - 1, '#236f82');
        } button('角色面板', 850, 590, 140, 38, () => { overlay = 'character'; }); button('关闭', 1020, 590, 140, 38, () => { overlay = ''; }, false, '#53507d'); return; }
        if (overlay === 'pause') { panel(435, 210, 410, 255, '已暂停'); button('继续', 505, 285, 270, 48, () => { overlay = ''; paused = false; }, false, '#286f80'); button('返回主城', 505, 350, 270, 48, () => { overlay = ''; mode = 'town'; paused = false; resetPlayer(); }); return; }
        if (overlay === 'death') { const retryCost = run.difficulty.abyss ? getAbyssTicketCost(run.dungeon.level) : 0; const cannotRetry = run.difficulty.abyss && (active().materials?.abyssTicket || 0) < retryCost; panel(435, 210, 410, 255, '挑战失败'); drawText('生命耗尽，选择下一步。', 640, 265, 16, '#e7edf5', 'center'); button(run.difficulty.abyss ? `重新挑战 · ${retryCost} 票` : '重新挑战', 505, 295, 270, 48, () => beginDungeon(run.dungeon.id, run.difficulty.id), cannotRetry, '#8d4a49'); button('返回主城', 505, 360, 270, 48, () => { overlay = ''; mode = 'town'; paused = false; resetPlayer(); }); return; }
    };
    const drawResult = () => {
        drawBackdrop('#1d2935', '#0e1323');
        const seconds = Math.max(1, Math.round(((run.completedAt || performance.now()) - run.startedAt) / 1000));
        const grade = run.grade?.id || 'B';
        panel(330, 115, 620, 480, '远征结算');
        drawText(grade, W / 2, 245, 86, grade === 'S' ? '#ffd55f' : '#75d8ff', 'center', 800);
        const rows = [[`经验 +${run.earnedXp}（评级 +${run.grade?.bonusXp || 0}）`, 320], [`金币 +${run.earnedGold}（评级 +${run.grade?.bonusGold || 0}）`, 355], [`击杀 ${run.kills} · 最高连击 ${run.bestCombo}`, 390], [`耗时 ${seconds} 秒`, 425], [`拾取装备 ${run.picked.length} 件 · 深渊票 +${run.earnedTickets || 0}`, 460]];
        if (run.unclaimedDrops) rows.push([`背包和仓库已满，未领取 ${run.unclaimedDrops} 件`, 485, '#ffb7a8']);
        rows.forEach(([text, y, color]) => drawText(text, W / 2, y, 18, color || '#e5edf5', 'center'));
        button('返回主城', 500, 520, 280, 48, () => { mode = 'town'; run = null; resetPlayer(); });
    };
    const clearAbyssVirtualMovement = () => {
        const hadVirtualMovement = virtualPointerIds.size > 0;
        virtualPointerIds.forEach((pointerId) => touchPointers.delete(pointerId));
        virtualPointerIds.clear();
        virtualMoveButtons.forEach((button) => {
            button.classList.remove('is-pressed');
            button.setAttribute('aria-pressed', 'false');
        });
        if (hadVirtualMovement) cancelSprint();
    };
    const clearAbyssInputs = () => {
        keys.clear();
        touchPointers.clear();
        clearAbyssVirtualMovement();
        cancelSprint();
    };
    const syncAbyssVirtualControls = () => {
        if (!virtualControls) return;
        const sectionVisible = !canvas.closest('.section')?.classList.contains('hidden');
        const playableMode = mode === 'town' || mode === 'dungeon';
        const pauseOverlay = overlay === 'pause';
        const controlsActive = Boolean(isAbyssVirtualMode() && sectionVisible && active() && playableMode && (!overlay || pauseOverlay));
        const inDungeon = mode === 'dungeon' && Boolean(player) && !run?.completed;
        const canMove = controlsActive && !paused && !overlay && (mode === 'town' || (inDungeon && player.state !== 'dead'));
        const canFight = canMove && inDungeon;
        virtualControls.classList.toggle('is-active', controlsActive);
        virtualControls.classList.toggle('is-paused', pauseOverlay);
        virtualControls.setAttribute('aria-hidden', controlsActive ? 'false' : 'true');
        if (!controlsActive || !canMove) clearAbyssVirtualMovement();
        virtualMoveButtons.forEach((button) => {
            const key = button.dataset.abyssKey;
            button.disabled = !canMove;
            button.classList.toggle('is-pressed', pressed(key));
            button.setAttribute('aria-pressed', pressed(key) ? 'true' : 'false');
        });
        virtualActionButtons.forEach((button) => {
            const action = button.dataset.abyssAction;
            const enabled = action === 'pause'
                ? inDungeon && (!overlay || pauseOverlay)
                : action === 'interact'
                    ? canMove
                    : action === 'jump'
                        ? canMove
                        : action === 'skill-page'
                            ? canFight
                            : canFight;
            button.disabled = !enabled;
            if (action === 'pause') {
                const label = button.querySelector('strong');
                const hint = button.querySelector('small');
                if (label) label.textContent = pauseOverlay ? '继续' : '暂停';
                if (hint) hint.textContent = pauseOverlay ? '返回战斗' : '菜单';
            } else if (action === 'skill-page') {
                const hint = button.querySelector('small');
                if (hint) hint.textContent = virtualSkillPage ? 'II / I' : 'I / II';
            }
        });
        if (virtualSkillHeader) virtualSkillHeader.textContent = `技能栏 ${virtualSkillPage ? 'II' : 'I'}`;
        const hero = active();
        const skills = hero ? skillsFor(hero) : [];
        virtualSkillButtons.forEach((button) => {
            const slot = Number(button.dataset.abyssSkillSlot) || 0;
            const skillIndex = virtualSkillPage * 6 + slot;
            const entry = skills[skillIndex];
            const label = button.querySelector('strong');
            const hint = button.querySelector('small');
            button.dataset.abyssSkill = String(skillIndex);
            if (!entry || !hero || !player) {
                button.disabled = true;
                if (label) label.textContent = '未配置';
                if (hint) hint.textContent = '--';
                return;
            }
            const values = skillValues(entry, hero);
            const cooldown = player.cooldowns[entry.key] || 0;
            const locked = values.level <= 0;
            const unavailable = !canFight || locked || cooldown > 0 || player.mp < values.cost || (!player.grounded && !entry.canAir) || ['hurt', 'knockdown', 'dead'].includes(player.state);
            button.disabled = unavailable;
            button.classList.toggle('is-locked', locked);
            button.classList.toggle('is-cooling', cooldown > 0);
            button.style.setProperty('--abyss-skill-color', skillColorFor(hero.classId, skillIndex));
            button.setAttribute('aria-label', locked ? `${entry.name}，${entry.unlockLevel}级解锁` : `${entry.name}，快捷键 ${entry.key}`);
            if (label) label.textContent = entry.name;
            if (hint) hint.textContent = locked ? `Lv.${entry.unlockLevel}` : cooldown > 0 ? `${cooldown.toFixed(1)}s` : `${entry.key} · MP${values.cost}`;
        });
    };
    const render = () => {
        hitboxes.length = 0;
        ctx.clearRect(0, 0, W, H);
        if (mode === 'menu') drawMenu();
        else if (mode === 'character-select') drawCharacterSelect();
        else if (mode === 'town') drawTown();
        else if (mode === 'dungeon') drawDungeon();
        else if (mode === 'result') drawResult();
        syncAbyssVirtualControls();
    };
    const startJump = () => {
        if (!player || mode !== 'dungeon' || !player.grounded || !['idle', 'move'].includes(player.state)) return;
        player.vz = 430; player.grounded = false;
        setPlayerState('jump', 0, true);
    };
    const startDodge = () => {
        if (!player || mode !== 'dungeon' || !player.grounded || player.dodgeCooldown > 0 || !['idle', 'move', 'jump', 'fall'].includes(player.state)) return;
        cancelSprint();
        const direction = pressed('A') ? -1 : pressed('D') ? 1 : player.facing;
        player.facing = direction || 1;
        player.x = safePlayerX(player.x + player.facing * 108);
        player.invuln = Math.max(player.invuln, .19);
        player.dodgeTimer = .18;
        player.dodgeCooldown = .62;
        setPlayerState('dodge', player.dodgeTimer, true);
        run.visuals.push({ type: 'trail', x: player.x - player.facing * 35, y: player.y - 70, color: '#dffcff', facing: player.facing, radius: 92, life: .20, maxLife: .20 });
        playCue('skill');
    };
    const applyPlayerDamage = (amount, source, heavy = false, attackType = source?.attackType || 'physical') => {
        if (!player || player.state === 'dead' || player.invuln > 0) return;
        cancelSprint();
        const guarding = player.guardTimer > 0;
        const armored = player.state === 'skill' && player.action?.data.superArmor;
        const guardAction = player.guardAction;
        if (guarding && guardAction?.data?.counter && source && !source.dead) {
            player.guardTimer = 0;
            player.invuln = .34;
            player.action = null;
            defeatEnemyHit(source, { ...guardAction.data, hits: 1, range: 120, depth: 70, hitType: 'launch', launch: 220, knockback: 88, hitstun: .5, shake: 6 }, guardAction);
            emitFeedback(player.x, player.y - 118, '完美格挡', '#fff2a8', 'critical', 6);
            setPlayerState(player.grounded ? 'idle' : 'fall');
            return;
        }
        const stats = getStats(active());
        const defense = attackType === 'magical' ? stats.magicalDefense : stats.physicalDefense;
        const mitigation = 1000 / (1000 + Math.max(0, defense));
        amount = Math.max(1, Math.ceil(amount * mitigation * (1 - Math.min(.8, stats.damageReduction / 100)) * (guarding ? .35 : 1)));
        player.hp = Math.max(0, player.hp - amount); player.invuln = heavy ? 0.42 : 0.22; player.hitFlash = 0.16; run.combo = 0; run.comboTimer = 0; run.styleScore = Math.max(0, (run.styleScore || 0) - (heavy ? 70 : 35));
        emitFeedback(player.x, player.y - 92 - player.z, `-${amount}`, heavy ? '#ff9a9f' : '#ffc2c2', 'hurt', heavy ? 4 : 2);
        if (armored && player.hp > 0) {
            player.armorFlash = .20;
            if (player.armorFeedbackCooldown <= 0) {
                const life = .38;
                run.effects.push({ x: player.x, y: player.y - 122 - player.z, text: '霸体', color: '#ffd45f', kind: 'status', life, maxLife: life, rise: 34 });
                player.armorFeedbackCooldown = .32;
            }
            run.visuals.push({ type: 'impact', x: player.x, y: player.y - 78 - player.z, color: '#ffd45f', facing: source && source.x < player.x ? 1 : -1, radius: 82, life: .18, maxLife: .18 });
        }
        run.visuals.push({ type: 'burst', x: player.x, y: player.y - 82 - player.z, color: heavy ? '#ff665e' : '#ffd0ba', facing: source && source.x < player.x ? 1 : -1, radius: heavy ? 122 : 74, life: heavy ? .24 : .16, maxLife: heavy ? .24 : .16 });
        run.flash = Math.max(run.flash, heavy ? .10 : .055); run.flashColor = '#ff746c';
        if (!armored && player.hp > 0) {
            player.action = null;
            if (source?.x !== undefined) { const direction = Math.sign(player.x - source.x) || 1; player.x = safePlayerX(player.x + direction * (heavy ? 58 : 26)); }
            if (heavy) { player.vz = Math.max(player.vz, 175); player.grounded = false; player.knockdownTimer = 0.72; setPlayerState('knockdown', player.knockdownTimer, true); }
            else {
                const animation = ABYSS_ASSETS.heroAnimations[active().classId].hurt;
                player.hurtTimer = clamp((animation.frames - 1) / animation.fps, .28, .44);
                setPlayerState('hurt', player.hurtTimer, true);
            }
        }
        if (player.hp <= 0) { player.action = null; const animation = ABYSS_ASSETS.heroAnimations[active().classId].defeat; setPlayerState('dead', animation.frames / animation.fps, true); overlay = 'death'; paused = true; }
    };
    const chooseBossAction = (enemy) => {
        const cycle = enemy.bossCycle++;
        const phaseTwo = enemy.hp <= enemy.maxHp * .5;
        if (enemy.type === 'briarTyrant') {
            if (enemy.hp <= enemy.maxHp * .55 && cycle % 3 === 2) return 'summon';
            return cycle % 2 === 0 ? 'area' : 'dash';
        }
        if (enemy.type === 'fogMatriarch') return ['pulse', 'area', 'dash'][cycle % 3];
        if (enemy.type === 'aetherWarden') return phaseTwo ? ['dash', 'area', 'dash'][cycle % 3] : ['area', 'dash'][cycle % 2];
        if (enemy.type === 'harborDreadnought') return phaseTwo ? ['dash', 'dash', 'area'][cycle % 3] : ['dash', 'pulse', 'area'][cycle % 3];
        if (enemy.type === 'frostSovereign') return phaseTwo ? ['area', 'dash', 'area'][cycle % 3] : ['pulse', 'area', 'dash'][cycle % 3];
        if (enemy.type === 'nightRegent') return ['summon', 'pulse', 'dash'][cycle % 3];
        if (enemy.type === 'plagueEngine') return phaseTwo ? ['summon', 'pulse', 'area'][cycle % 3] : ['pulse', 'summon', 'area'][cycle % 3];
        if (enemy.type === 'riftArbiter') return phaseTwo ? ['dash', 'summon', 'area'][cycle % 3] : ['area', 'pulse', 'dash'][cycle % 3];
        if (enemy.type.startsWith('abyss')) {
            const rotation = [];
            if (enemy.source.summons) rotation.push('summon');
            if (enemy.source.pulse) rotation.push('pulse');
            if (enemy.source.enrage) rotation.push('dash');
            rotation.push('area');
            if (phaseTwo && enemy.source.enrage) rotation.push('dash');
            return rotation[cycle % rotation.length];
        }
        return 'melee';
    };
    const beginEnemyAction = (enemy, type) => {
        const profile = enemy.profile;
        const special = type === 'area' ? { windup: 0.68, active: 0.16, recovery: 0.50, radius: enemy.boss ? 168 : 112 } : type === 'pulse' ? { windup: 0.58, active: 0.18, recovery: 0.52, radius: enemy.boss ? 192 : 118 } : type === 'summon' ? { windup: 0.62, active: 0.12, recovery: 0.48, radius: 118 } : type === 'dash' ? { windup: 0.42, active: 0.13, recovery: 0.34, radius: 82 } : { windup: profile.windup, active: profile.active, recovery: profile.recovery, radius: profile.attackRange || 70 };
        if (run?.difficulty?.abyss) { special.windup *= .84; special.recovery *= .80; special.radius *= enemy.boss ? 1.08 : 1.04; }
        enemy.attackCooldown = type === 'melee' ? (enemy.source.swarm ? .48 : .78) : type === 'projectile' ? 1.25 : 1.6;
        const selfTargeted = type === 'pulse' || type === 'summon';
        const fireAt = type === 'dash' ? special.windup + special.active : special.windup;
        enemy.action = { type, time: 0, total: special.windup + special.active + special.recovery, windup: special.windup, active: special.active, fireAt, radius: special.radius, fired: false, telegraph: true, startX: enemy.x, startY: enemy.y, targetX: selfTargeted ? enemy.x : player.x, targetY: selfTargeted ? enemy.y : player.y };
        enemy.state = 'attack';
    };
    const fireEnemyAction = (enemy, action) => {
        if (action.type === 'projectile') {
            const dx = player.x - enemy.x; const dy = player.y - enemy.y; const length = Math.max(1, Math.hypot(dx, dy));
            run.projectiles.push({ x: enemy.x, y: enemy.y - 26, z: 18, vx: dx / length * enemy.profile.projectileSpeed, vy: dy / length * enemy.profile.projectileSpeed, damage: enemy.attack, attackType: enemy.attackType, color: '#c89bff', life: enemy.profile.projectileLife });
            return;
        }
        if (action.type === 'summon') { const room = currentRoom(); const capacity = Math.max(0, 8 - room.enemies.filter((entry) => !entry.dead && !entry.boss).length); const positions = [[-80, 36], [80, -36]].slice(0, capacity); positions.forEach(([offsetX, offsetY]) => room.enemies.push(spawnEnemy(enemy.source.summons || 'mossGoblin', clamp(enemy.x + offsetX, combatBounds.left, combatBounds.right), clamp(enemy.y + offsetY, combatBounds.top, combatBounds.bottom)))); run.visuals.push({ type: 'burst', x: enemy.x, y: enemy.y - 74, color: '#cf9cff', facing: 1, radius: 150, life: .32, maxLife: .32 }); return; }
        if (action.type === 'pulse') { run.visuals.push({ type: 'burst', x: enemy.x, y: enemy.y - 58, color: '#da8bff', facing: 1, radius: action.radius, life: .30, maxLife: .30 }); if (Math.abs(player.x - enemy.x) <= action.radius && Math.abs(player.y - enemy.y) <= action.radius * .42 && player.z < 72) applyPlayerDamage(Math.round(enemy.attack * 1.18), enemy, true); return; }
        if (action.type === 'dash') { enemy.x = clamp(action.targetX, combatBounds.left, combatBounds.right); enemy.y = clamp(action.targetY, combatBounds.top, combatBounds.bottom); if (Math.abs(player.y - enemy.y) < 58 && Math.abs(player.x - enemy.x) < action.radius) applyPlayerDamage(Math.round(enemy.attack * 1.25), enemy, true); return; }
        if (action.type === 'melee') {
            const inRange = Math.abs(player.x - enemy.x) <= action.radius + 26 && Math.abs(player.y - enemy.y) <= 56 && player.z < 72;
            if (inRange) applyPlayerDamage(enemy.attack, enemy, enemy.boss);
            return;
        }
        const targetX = action.targetX;
        const targetY = action.targetY;
        if (Math.abs(player.x - targetX) <= action.radius && Math.abs(player.y - targetY) <= action.radius * .38 && player.z < 72) applyPlayerDamage(Math.round(enemy.attack * 1.15), enemy, true);
    };
    const updatePlayer = (dt) => {
        player.stateElapsed = (player.stateElapsed || 0) + dt;
        player.invuln = Math.max(0, player.invuln - dt); player.dodgeCooldown = Math.max(0, player.dodgeCooldown - dt); player.dodgeTimer = Math.max(0, player.dodgeTimer - dt); player.guardTimer = Math.max(0, (player.guardTimer || 0) - dt); if (!player.guardTimer) player.guardAction = null; if (player.queuedInput) { player.queuedInput.time -= dt; if (player.queuedInput.time <= 0) player.queuedInput = null; } player.hitFlash = Math.max(0, player.hitFlash - dt); player.armorFlash = Math.max(0, (player.armorFlash || 0) - dt); player.armorFeedbackCooldown = Math.max(0, (player.armorFeedbackCooldown || 0) - dt); player.comboGrace = Math.max(0, player.comboGrace - dt); player.mp = Math.min(player.maxMp, player.mp + dt * 7);
        Object.keys(player.cooldowns).forEach((key) => { player.cooldowns[key] = Math.max(0, player.cooldowns[key] - dt); });
        if (!player.grounded || player.z > 0) { player.vz -= 900 * dt; player.z += player.vz * dt; if (player.z <= 0) { player.z = 0; player.vz = 0; player.grounded = true; if (!['attack', 'skill', 'hurt', 'knockdown', 'dead'].includes(player.state)) setPlayerState('idle'); } else if (!['attack', 'skill', 'hurt', 'knockdown', 'dead'].includes(player.state)) setPlayerState(player.vz > 0 ? 'jump' : 'fall'); }
        if (player.state === 'hurt') { player.hurtTimer -= dt; if (player.hurtTimer <= 0) setPlayerState(player.grounded ? 'idle' : 'fall'); }
        if (player.state === 'knockdown') { player.knockdownTimer -= dt; if (player.knockdownTimer <= 0 && player.grounded) setPlayerState('idle'); }
        if (player.state === 'dodge' && player.dodgeTimer <= 0) setPlayerState(player.grounded ? 'idle' : 'fall');
        if (player.state === 'interact') { player.stateTime -= dt; if (player.stateTime <= 0) setPlayerState(player.grounded ? 'idle' : 'fall'); }
        const movable = ['idle', 'move', 'jump', 'fall'].includes(player.state);
        if (movable) { let dx = 0; let dy = 0; if (pressed('W')) dy -= 1; if (pressed('S')) dy += 1; if (pressed('A')) dx -= 1; if (pressed('D')) dx += 1; if (dx || dy) { const length = Math.hypot(dx, dy); const speed = getStats(active()).moveSpeedActual * sprintMultiplierFor(dx) * dt; player.x = safePlayerX(player.x + dx / length * speed); player.y = clamp(player.y + dy / length * speed * combatBounds.depthScale, combatBounds.top, combatBounds.bottom); if (dx) player.facing = Math.sign(dx); if (player.grounded) setPlayerState('move'); } else if (player.grounded) setPlayerState('idle'); }
        if (!player.action) return;
        const action = player.action; action.time += dt;
        if (action.kind === 'skill' && !action.activeVisualFired && action.time >= action.data.active[0]) {
            action.activeVisualFired = true;
            const effectType = action.data.projectile ? 'impact' : action.data.area && action.data.hits > 1 ? 'vortex' : action.data.area || action.data.launch || action.data.knockdown ? 'shockwave' : 'slash';
            const radius = Math.max(82, Math.min(310, action.data.range * (action.data.area ? .92 : .62)));
            const life = Math.max(.28, action.data.active[1] - action.data.active[0] + .18);
            run.visuals.push({ type: effectType, x: player.x + (action.data.area ? 0 : player.facing * Math.min(82, action.data.range * .34)), y: player.y - (effectType === 'shockwave' ? 12 : 68) - player.z, color: action.color, facing: player.facing, radius, life, maxLife: life });
            run.flash = Math.max(run.flash, action.index >= 8 ? .10 : .045); run.flashColor = action.color;
        }
        if (action.kind === 'skill' && action.time >= action.data.active[0] && action.time <= action.data.active[1] && action.data.hits > 1) {
            action.visualPulseTimer -= dt;
            if (action.visualPulseTimer <= 0) { action.visualPulseTimer = Math.max(.07, action.data.rehit || .10); run.visuals.push({ type: 'slash', x: player.x + player.facing * (36 + Math.random() * Math.min(96, action.data.range * .36)), y: player.y - 54 - player.z + (Math.random() - .5) * 70, color: action.color, facing: player.facing, radius: Math.max(62, Math.min(142, action.data.range * .48)), life: .18, maxLife: .18 }); }
        }
        if (action.kind === 'skill' && action.data.projectile && !action.projectileFired && action.time >= action.data.active[0]) { action.projectileFired = true; const projectile = action.data.projectile; run.playerProjectiles.push({ x: player.x + player.facing * 32, y: player.y, vx: player.facing * projectile.speed, life: projectile.life, radius: projectile.radius, color: action.color, action }); }
        playerHitbox(action);
        if (action.kind === 'attack' && action.data.cancel && action.time >= action.data.cancel[0] && action.time <= action.data.cancel[1]) { action.chainOpened = true; if (action.bufferedAttack) action.total = Math.min(action.total, action.time + .065); }
        if (action.kind === 'attack' && action.bufferedSkill !== null && action.hitAny && action.data.skillCancel && action.time >= action.data.skillCancel[0] && action.time <= action.data.skillCancel[1]) { const nextSkill = action.bufferedSkill; startPlayerAction('skill', nextSkill); return; }
        if (action.time < action.total) return;
        player.action = null;
        if (action.kind === 'attack') {
            const combo = ABYSS_COMBAT.player[active().classId].combo;
            const canChain = action.bufferedAttack && action.chainOpened && action.index < combo.length - 1;
            if (canChain) { player.comboIndex = action.index + 1; startPlayerAction('attack', player.comboIndex); return; }
            player.comboIndex = 0; player.comboGrace = 0.24;
            if (action.bufferedSkill !== null) { startPlayerAction('skill', action.bufferedSkill); return; }
        }
        setPlayerState(player.grounded ? 'idle' : 'fall');
        consumeQueuedInput();
    };
    const updateEnemy = (enemy, dt) => {
        enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
        enemy.armorFlash = Math.max(0, (enemy.armorFlash || 0) - dt);
        enemy.armorFeedbackCooldown = Math.max(0, (enemy.armorFeedbackCooldown || 0) - dt);
        enemy.invulnerable = Math.max(0, (enemy.invulnerable || 0) - dt);
        enemy.attackCooldown = Math.max(0, (enemy.attackCooldown || 0) - dt);
        if (enemy.z > 0 || enemy.vz > 0) { enemy.vz -= 900 * dt; enemy.z += enemy.vz * dt; if (enemy.z <= 0) { enemy.z = 0; enemy.vz = 0; if (enemy.state === 'knockdown') enemy.knockdownTimer = Math.max(enemy.knockdownTimer, .42); } }
        if (enemy.state === 'stunned') { enemy.stunTimer -= dt; if (enemy.stunTimer <= 0) enemy.state = 'chase'; return; }
        if (enemy.state === 'hurt') { enemy.hurtTimer -= dt; if (enemy.hurtTimer <= 0) enemy.state = 'chase'; return; }
        if (enemy.state === 'knockdown') { if (enemy.z > 0) return; enemy.knockdownTimer -= dt; if (enemy.knockdownTimer <= 0) { enemy.state = 'chase'; enemy.invulnerable = .22; enemy.poise = enemy.poiseMax; enemy.juggleHits = 0; } return; }
        if (enemy.action) {
            const action = enemy.action; action.time += dt;
            if (action.time >= action.windup) action.telegraph = false;
            if (action.type === 'dash' && action.time >= action.windup && action.time < action.windup + action.active) {
                const progress = clamp((action.time - action.windup) / action.active, 0, 1);
                enemy.x = clamp(action.startX + (action.targetX - action.startX) * progress, combatBounds.left, combatBounds.right);
                enemy.y = clamp(action.startY + (action.targetY - action.startY) * progress, combatBounds.top, combatBounds.bottom);
                run.visuals.push({ type: 'trail', x: enemy.x, y: enemy.y - 62, color: enemy.boss ? '#ff8b70' : '#ffc86b', facing: enemy.facing, radius: enemy.boss ? 102 : 68, life: .10, maxLife: .10 });
            }
            if (!action.fired && action.time >= action.fireAt) { action.fired = true; fireEnemyAction(enemy, action); }
            if (action.time >= action.total) { enemy.action = null; enemy.state = 'chase'; }
            return;
        }
        const desiredY = player.y + (enemy.source.swarm && Math.abs(player.x - enemy.x) > 105 ? enemy.flankOffset : 0);
        const dx = player.x - enemy.x; const dy = desiredY - enemy.y; const distance = Math.hypot(dx, dy);
        if (distance > enemy.profile.detect) { enemy.state = 'patrol'; enemy.patrolTimer -= dt; if (enemy.patrolTimer <= 0) { enemy.patrolTimer = 0.7 + Math.random(); enemy.patrolDir *= -1; } enemy.x = clamp(enemy.x + enemy.patrolDir * enemy.profile.patrol * dt, combatBounds.left, combatBounds.right); return; }
        enemy.state = 'chase'; enemy.facing = Math.sign(dx) || enemy.facing;
        const horizontal = Math.abs(dx); const depth = Math.abs(dy);
        if (enemy.boss) { if (enemy.source.enrage && enemy.hp < enemy.maxHp * .5 && !enemy.phase) { enemy.phase = true; enemy.speed *= 1.34; } enemy.specialTimer -= dt; if (enemy.specialTimer <= 0) { enemy.specialTimer = run.difficulty.abyss ? (enemy.phase ? 1.75 : 2.45) : enemy.phase ? 3.1 : 4.8; beginEnemyAction(enemy, chooseBossAction(enemy)); return; } }
        else if (run.difficulty.abyss) {
            enemy.specialTimer -= dt;
            if (enemy.specialTimer <= 0) {
                enemy.specialTimer = (enemy.source.elite || enemy.champion ? 1.75 : 2.25) + Math.random() * .85;
                const cycle = enemy.abyssCycle++;
                const specialType = enemy.source.ranged ? (cycle % 3 === 2 ? 'area' : 'projectile') : enemy.source.elite || enemy.champion ? (cycle % 2 ? 'area' : 'dash') : enemy.source.lunge || enemy.source.swarm ? (cycle % 3 === 2 ? 'area' : 'dash') : cycle % 2 ? 'area' : 'melee';
                beginEnemyAction(enemy, specialType);
                return;
            }
        } else if (enemy.source.elite || enemy.source.lunge || enemy.champion) { enemy.specialTimer -= dt; if (enemy.specialTimer <= 0 && horizontal > 110) { enemy.specialTimer = enemy.source.lunge ? 2.8 : enemy.profile.lungeCooldown || 4.2; beginEnemyAction(enemy, 'dash'); return; } }
        if (enemy.source.ranged) { if (horizontal < enemy.profile.keepRange - 28) enemy.x = clamp(enemy.x - Math.sign(dx) * enemy.speed * dt, combatBounds.left, combatBounds.right); else if (horizontal > enemy.profile.keepRange + 34) enemy.x = clamp(enemy.x + Math.sign(dx) * enemy.speed * dt, combatBounds.left, combatBounds.right); if (depth > 28) enemy.y = clamp(enemy.y + Math.sign(dy) * enemy.speed * dt * combatBounds.depthScale, combatBounds.top, combatBounds.bottom); if (horizontal < enemy.profile.keepRange + 60 && Math.abs(player.y - enemy.y) < 72 && enemy.attackCooldown <= 0) beginEnemyAction(enemy, 'projectile'); return; }
        if (horizontal > enemy.profile.attackRange || Math.abs(player.y - enemy.y) > 44) { const speed = enemy.speed * (enemy.source.swarm ? 1.22 : 1); enemy.x = clamp(enemy.x + Math.sign(dx) * speed * dt, combatBounds.left, combatBounds.right); enemy.y = clamp(enemy.y + Math.sign(dy) * speed * dt * combatBounds.depthScale, combatBounds.top, combatBounds.bottom); }
        else if (enemy.attackCooldown <= 0) beginEnemyAction(enemy, 'melee');
    };
    const resolveEnemyFormation = () => {
        const enemies = currentRoom().enemies.filter((enemy) => !enemy.dead && !enemy.action && enemy.z <= 4);
        for (let i = 0; i < enemies.length; i += 1) {
            for (let j = i + 1; j < enemies.length; j += 1) {
                const a = enemies[i]; const b = enemies[j]; const depth = b.y - a.y;
                if (Math.abs(depth) > 58) continue;
                const horizontal = b.x - a.x; const minimum = Math.min(126, a.size / 2 + b.size / 2 + 18);
                if (Math.abs(horizontal) >= minimum) continue;
                const direction = Math.sign(horizontal) || (i % 2 ? -1 : 1); const push = (minimum - Math.abs(horizontal)) * .5;
                a.x = clamp(a.x - direction * push, combatBounds.left, combatBounds.right);
                b.x = clamp(b.x + direction * push, combatBounds.left, combatBounds.right);
                a.y = clamp(a.y - depth * .07, combatBounds.top, combatBounds.bottom);
                b.y = clamp(b.y + depth * .07, combatBounds.top, combatBounds.bottom);
            }
        }
    };
    const updateProjectiles = (dt) => {
        run.projectiles.forEach((projectile) => { projectile.x += projectile.vx * dt; projectile.y += projectile.vy * dt; projectile.life -= dt; if (projectile.life > 0 && Math.abs(projectile.x - player.x) < 19 && Math.abs(projectile.y - player.y) < 25 && player.z < 74) { projectile.life = 0; applyPlayerDamage(projectile.damage, null, false, projectile.attackType); } });
        run.projectiles = run.projectiles.filter((projectile) => projectile.life > 0 && projectile.x > combatBounds.left - 20 && projectile.x < combatBounds.right + 20 && projectile.y > combatBounds.top - 20 && projectile.y < combatBounds.bottom + 20);
        run.playerProjectiles.forEach((projectile) => { projectile.x += projectile.vx * dt; projectile.life -= dt; const enemy = currentRoom().enemies.find((entry) => !entry.dead && (entry.invulnerable || 0) <= 0 && Math.abs(entry.x - projectile.x) < entry.size / 2 + projectile.radius && Math.abs(entry.y - projectile.y) < 48); if (enemy) { projectile.life = 0; defeatEnemyHit(enemy, projectile.action.data, projectile.action); } });
        run.playerProjectiles = run.playerProjectiles.filter((projectile) => projectile.life > 0 && projectile.x > combatBounds.left - 30 && projectile.x < combatBounds.right + 30);
    };
    const update = (dt) => {
        if (paused || overlay || !player) return;
        if (mode === 'town') { town.jump = Math.max(0, town.jump - dt * 1.8); let dx = 0; let dy = 0; if (pressed('W')) dy -= 1; if (pressed('S')) dy += 1; if (pressed('A')) dx -= 1; if (pressed('D')) dx += 1; if (dx || dy) { const length = Math.hypot(dx, dy); const speed = getStats(active()).moveSpeedActual * sprintMultiplierFor(dx) * dt; town.x = clamp(town.x + dx / length * speed, 55, 1215); town.y = clamp(town.y + dy / length * speed * .56, 310, 540); if (dx) town.facing = Math.sign(dx); town.state = 'move'; } else town.state = 'idle'; return; }
        if (mode !== 'dungeon' || run.completed) return;
        if (run.hitstop > 0) { run.hitstop = Math.max(0, run.hitstop - dt); return; }
        run.effects.forEach((effect) => { effect.life -= dt; }); run.effects = run.effects.filter((effect) => effect.life > 0);
        run.visuals.forEach((visual) => { visual.life -= dt; }); run.visuals = run.visuals.filter((visual) => visual.life > 0);
        run.shake = Math.max(0, run.shake - ABYSS_COMBAT.feedback.shakeDecay * dt); run.flash = Math.max(0, run.flash - dt * 2.8); run.comboTimer = Math.max(0, run.comboTimer - dt); if (run.comboTimer <= 0) run.combo = 0;
        updatePlayer(dt); autoCollectDrops(); if (mode !== 'dungeon' || run.completed || player.state === 'dead') return;
        if (run.finishTimer > 0) { run.finishTimer -= dt; if (run.finishTimer <= 0) finishRun(); return; }
        if (advanceWave(dt) || advanceRoom()) return;
        currentRoom().enemies.filter((enemy) => !enemy.dead).forEach((enemy) => updateEnemy(enemy, dt)); resolveEnemyFormation(); updateProjectiles(dt);
    };
    const loop = (time) => {
        const elapsed = Math.min(.10, (time - lastTime) / 1000 || 0);
        lastTime = time;
        if (!paused) {
            accumulator = Math.min(.10, accumulator + elapsed);
            while (accumulator >= 1 / 120) { update(1 / 120); accumulator -= 1 / 120; }
        } else accumulator = 0;
        render();
        frame = requestAnimationFrame(loop);
    };
    const keyDown = (event) => {
        const targetTag = event.target?.tagName?.toLowerCase();
        if (canvas.closest('.hidden') || document.getElementById('main-page')?.classList.contains('hidden')
            || document.hidden || ['input', 'textarea', 'select'].includes(targetTag) || event.target?.isContentEditable
            || event.isComposing || event.keyCode === 229 || event.key === 'Process') return;
        const key = event.key.toUpperCase();
        const allowed = ['W', 'A', 'S', 'D', ' ', 'SHIFT', 'J', 'E', 'B', 'C', 'ESCAPE', ...skillKeys];
        if (!allowed.includes(key)) return;
        unlockSound(); event.preventDefault();
        if (event.repeat && !['W', 'A', 'S', 'D'].includes(key)) return;
        if (overlay === 'death' || (overlay === 'pause' && key !== 'ESCAPE')) return;
        if (overlay && !['B', 'C', 'ESCAPE'].includes(key)) return;
        const wasPressed = keys.has(key); keys.add(key);
        if (!event.repeat && !wasPressed && ['A', 'D'].includes(key)) registerDirectionTap(key);
        if (key === ' ') { if (mode === 'dungeon') startJump(); else { const target = town; if (target && target.jump <= 0) target.jump = 1; } }
        else if (key === 'SHIFT') startDodge();
        else if (key === 'J') attack(); else if (key === 'E') pickOrInteract(); else if (key === 'B' && active()) { inventoryMenu = null; overlay = overlay === 'inventory' ? '' : 'inventory'; } else if (key === 'C' && active()) overlay = overlay === 'character' ? 'skills' : overlay === 'skills' ? 'character' : 'character'; else if (key === 'ESCAPE') { inventoryMenu = null; if (overlay) { overlay = ''; paused = false; } else if (mode === 'dungeon') { overlay = 'pause'; paused = true; } } else { const index = skillKeys.indexOf(key); if (index >= 0) useSkill(index); }
    };
    const keyUp = (event) => { const key = event.key.toUpperCase(); keys.delete(key); if ((key === 'A' && sprintDirection < 0) || (key === 'D' && sprintDirection > 0)) cancelSprint(); };
    const performAbyssVirtualAction = (action) => {
        if (action === 'pause') {
            if (overlay === 'pause') {
                overlay = '';
                paused = false;
                lastTime = performance.now();
            } else if (mode === 'dungeon' && !overlay) {
                clearAbyssVirtualMovement();
                cancelSprint();
                overlay = 'pause';
                paused = true;
            }
        } else if (paused || overlay) return;
        else if (action === 'attack') attack();
        else if (action === 'jump') {
            if (mode === 'dungeon') startJump();
            else if (mode === 'town' && town.jump <= 0) town.jump = 1;
        } else if (action === 'dodge') startDodge();
        else if (action === 'interact') pickOrInteract();
        else if (action === 'skill-page' && mode === 'dungeon') virtualSkillPage = virtualSkillPage ? 0 : 1;
        render();
    };
    const canvasPoint = (event) => { const box = canvas.getBoundingClientRect(); return { x: (event.clientX - box.left) * W / box.width, y: (event.clientY - box.top) * H / box.height }; };
    const click = (event) => { unlockSound(); const { x, y } = canvasPoint(event); const target = [...hitboxes].reverse().find((hit) => x >= hit.x && x <= hit.x + hit.width && y >= hit.y && y <= hit.y + hit.height); if (target) target.action(); else inventoryMenu = null; render(); };
    const updateTouchDirection = (event) => { const { x, y } = canvasPoint(event); const key = touchControlAt(x, y); if (key) touchPointers.set(event.pointerId, key); else touchPointers.delete(event.pointerId); render(); };
    const clearTouchDirection = (event) => { if (touchPointers.delete(event.pointerId)) render(); };
    const pointerDown = (event) => { if (event.pointerType === 'mouse' || (virtualControls && isAbyssVirtualMode())) return; unlockSound(); updateTouchDirection(event); if (touchPointers.has(event.pointerId)) { event.preventDefault(); canvas.setPointerCapture?.(event.pointerId); } };
    const releaseVirtualDirection = (event) => {
        if (!virtualPointerIds.has(event.pointerId)) return;
        const key = touchPointers.get(event.pointerId);
        virtualPointerIds.delete(event.pointerId);
        touchPointers.delete(event.pointerId);
        if ((key === 'A' && sprintDirection < 0) || (key === 'D' && sprintDirection > 0)) cancelSprint();
        render();
    };
    virtualMoveButtons.forEach((button) => {
        button.addEventListener('pointerdown', (event) => {
            if (button.disabled) return;
            event.preventDefault();
            unlockSound();
            const key = button.dataset.abyssKey;
            if (['A', 'D'].includes(key)) registerDirectionTap(key);
            virtualPointerIds.add(event.pointerId);
            touchPointers.set(event.pointerId, key);
            button.setPointerCapture?.(event.pointerId);
            render();
        });
        button.addEventListener('pointerup', releaseVirtualDirection);
        button.addEventListener('pointercancel', releaseVirtualDirection);
        button.addEventListener('lostpointercapture', releaseVirtualDirection);
    });
    virtualActionButtons.forEach((button) => {
        button.addEventListener('pointerdown', (event) => {
            if (button.disabled) return;
            event.preventDefault();
            unlockSound();
            performAbyssVirtualAction(button.dataset.abyssAction);
        });
    });
    virtualSkillButtons.forEach((button) => {
        button.addEventListener('pointerdown', (event) => {
            if (button.disabled) return;
            event.preventDefault();
            unlockSound();
            useSkill(Number(button.dataset.abyssSkill));
            render();
        });
    });
    window.addEventListener('keydown', keyDown); window.addEventListener('keyup', keyUp); canvas.addEventListener('click', click); canvas.addEventListener('pointerdown', pointerDown); canvas.addEventListener('pointermove', (event) => { if (touchPointers.has(event.pointerId)) { event.preventDefault(); updateTouchDirection(event); } }); canvas.addEventListener('pointerup', clearTouchDirection); canvas.addEventListener('pointercancel', clearTouchDirection); canvas.width = W; canvas.height = H; render();
    window.addEventListener('blur', clearAbyssInputs);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) clearAbyssInputs();
    });
    return { resize() { render(); }, render, pause() { paused = true; accumulator = 0; clearAbyssInputs(); if (frame) cancelAnimationFrame(frame); frame = 0; syncAbyssVirtualControls(); }, resume() { paused = false; if (!player && active()) resetPlayer(); if (!frame) { lastTime = performance.now(); frame = requestAnimationFrame(loop); } render(); } };
};
