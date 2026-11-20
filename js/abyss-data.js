const DNF_ENEMY_FRAME_WIDTH = 704;
const DNF_ENEMY_FRAME_HEIGHT = 480;
const DNF_ENEMY_LAYOUTS = {
    'clockwork-golem': { columns: 3, rows: 2, frames: 6 },
    'stone-golem': { columns: 2, rows: 2, frames: 4 },
};
const DNF_ENEMY_ATTACK_LAYOUTS = {
    'frost-lancer': { columns: 3, rows: 3, frames: 8 },
    'shadow-wolf': { columns: 3, rows: 3, frames: 9 },
    'shadow-wraith': { columns: 4, rows: 2, frames: 7 },
    'stone-golem': { columns: 2, rows: 2, frames: 4 },
    'void-mage': { columns: 3, rows: 2, frames: 6 },
};
const dnfEnemySheet = (name, fps = 6) => {
    const layout = DNF_ENEMY_LAYOUTS[name] || { columns: 4, rows: 2, frames: 8 };
    const attackLayout = DNF_ENEMY_ATTACK_LAYOUTS[name] || { columns: 4, rows: 2, frames: 8 };
    return {
        file: `assets/dnf/enemy/${name}-sheet.png`, eliteFile: `assets/dnf/enemy/${name}-elite-attack-sheet.png`, idleFile: `assets/dnf/enemy/idle/${name}.png`,
        ...layout, fps, sheetWidth: DNF_ENEMY_FRAME_WIDTH * layout.columns, sheetHeight: DNF_ENEMY_FRAME_HEIGHT * layout.rows,
        attackColumns: attackLayout.columns, attackRows: attackLayout.rows, attackFrames: attackLayout.frames,
        attackSheetWidth: DNF_ENEMY_FRAME_WIDTH * attackLayout.columns, attackSheetHeight: DNF_ENEMY_FRAME_HEIGHT * attackLayout.rows,
    };
};
const dnfBossSprite = (name) => ({ file: `assets/dnf/enemy/boss/${name}-full.png`, portraitFile: `assets/dnf/enemy/boss/${name}.png`, columns: 1, rows: 1, frames: 1, fps: 1 });
const dnfAbyssBossSprite = (name) => ({ file: `assets/dnf/enemy/superboss/${name}-abyss-boss.png`, columns: 1, rows: 1, frames: 1, fps: 1 });
const dnfDropAura = (rarity) => ({ file: `assets/dnf/drop-auras/${rarity}-aura-sheet.png`, columns: 4, rows: 2, frames: 8, fps: 9 });

export const ABYSS_ASSETS = {
    heroes: {
        sword: 'assets/fighters/heroes/hancheying/lihui.png',
        brawler: 'assets/fighters/heroes/FlameDemonGod/lihui.png',
    },
    heroSprites: {
        sword: 'assets/fighters/heroes/hancheying/standby.png',
        brawler: 'assets/fighters/heroes/FlameDemonGod/standby.png',
    },
    heroAnimations: {
        sword: {
            idle: { file: 'assets/fighters/heroes/hancheying/standby.png', frames: 8, fps: 7 },
            move: { file: 'assets/fighters/heroes/hancheying/walk.png', frames: 10, fps: 10 },
            jump: { file: 'assets/fighters/heroes/hancheying/jump.png', frames: 8, fps: 9 },
            attack1: { file: 'assets/fighters/heroes/hancheying/lightattack.png', frames: 10, fps: 14 },
            attack2: { file: 'assets/fighters/heroes/hancheying/lightkick.png', frames: 10, fps: 13 },
            attack3: { file: 'assets/fighters/heroes/hancheying/heavykick.png', frames: 11, fps: 12 },
            skill: { file: 'assets/fighters/heroes/hancheying/shootqigong.png', frames: 8, fps: 13 },
            super: { file: 'assets/fighters/heroes/hancheying/superskill.png', frames: 12, fps: 16 },
            guard: { file: 'assets/fighters/heroes/hancheying/guard.png', frames: 4, fps: 10 },
            hurt: { file: 'assets/fighters/heroes/hancheying/hurt.png', frames: 6, fps: 12 },
            knockdown: { file: 'assets/fighters/heroes/hancheying/knockdown.png', frames: 10, fps: 11 },
            defeat: { file: 'assets/fighters/heroes/hancheying/lose.png', frames: 8, fps: 8 },
        },
        brawler: {
            idle: { file: 'assets/fighters/heroes/FlameDemonGod/standby.png', frames: 8, fps: 7 },
            move: { file: 'assets/fighters/heroes/FlameDemonGod/walk.png', frames: 8, fps: 10 },
            jump: { file: 'assets/fighters/heroes/FlameDemonGod/jump.png', frames: 6, fps: 10 },
            attack1: { file: 'assets/fighters/heroes/FlameDemonGod/lightpunch.png', frames: 6, fps: 14 },
            attack2: { file: 'assets/fighters/heroes/FlameDemonGod/heavypunch.png', frames: 8, fps: 13 },
            attack3: { file: 'assets/fighters/heroes/FlameDemonGod/lightkick.png', frames: 6, fps: 13 },
            skill: { file: 'assets/fighters/heroes/FlameDemonGod/qigongxuli.png', frames: 8, fps: 12 },
            super: { file: 'assets/fighters/heroes/FlameDemonGod/superskill.png', frames: 12, fps: 16 },
            guard: { file: 'assets/fighters/heroes/FlameDemonGod/guard.png', frames: 3, fps: 8 },
            hurt: { file: 'assets/fighters/heroes/FlameDemonGod/hurt.png', frames: 4, fps: 12 },
            knockdown: { file: 'assets/fighters/heroes/FlameDemonGod/knockdown.png', frames: 7, fps: 10 },
            defeat: { file: 'assets/fighters/heroes/FlameDemonGod/lose.png', frames: 6, fps: 8 },
        },
    },
    dungeonBackdrops: {
        windfall: 'assets/dnf/background/verdant-catacombs.png',
        mosswood: 'assets/dnf/background/moonlit-forest.png',
        skyspire: 'assets/dnf/background/sky-sanctuary.png',
        cloudharbor: 'assets/dnf/background/azure-cathedral.png',
        frostpath: 'assets/dnf/background/frozen-ruins.png',
        shadecity: 'assets/dnf/background/blood-throne.png',
        mireveil: 'assets/dnf/background/verdant-catacombs.png',
        dirgerift: 'assets/dnf/background/infernal-fortress.png',
    },
    enemyModels: {
        mossGoblin: dnfEnemySheet('goblin-raider', 7),
        grayWolf: dnfEnemySheet('shadow-wolf', 8),
        stoneGuard: dnfEnemySheet('stone-golem', 5),
        mistPriest: dnfEnemySheet('void-mage', 6),
        skyPatrol: dnfEnemySheet('frost-lancer', 7),
        gearGolem: dnfEnemySheet('clockwork-golem', 5),
        cloudExecutioner: dnfEnemySheet('frost-warrior', 6),
        harborMarauder: dnfEnemySheet('goblin-raider', 8),
        frostSentinel: dnfEnemySheet('frost-warrior', 6),
        nightStalker: dnfEnemySheet('shadow-wraith', 8),
        plagueCarrier: dnfEnemySheet('stone-golem', 5),
        riftWraith: dnfEnemySheet('shadow-wraith', 8),
        briarTyrant: dnfBossSprite('briar-tyrant'),
        fogMatriarch: dnfBossSprite('fog-matriarch'),
        aetherWarden: dnfBossSprite('aether-warden'),
        harborDreadnought: dnfBossSprite('harbor-dreadnought'),
        frostSovereign: dnfBossSprite('frost-sovereign'),
        nightRegent: dnfBossSprite('night-regent'),
        plagueEngine: dnfBossSprite('plague-engine'),
        riftArbiter: dnfBossSprite('rift-arbiter'),
        abyssGoblinRaider: dnfAbyssBossSprite('goblin-raider'),
        abyssShadowWolf: dnfAbyssBossSprite('shadow-wolf'),
        abyssStoneGolem: dnfAbyssBossSprite('stone-golem'),
        abyssVoidMage: dnfAbyssBossSprite('void-mage'),
        abyssFrostLancer: dnfAbyssBossSprite('frost-lancer'),
        abyssClockworkGolem: dnfAbyssBossSprite('clockwork-golem'),
        abyssFrostWarrior: dnfAbyssBossSprite('frost-warrior'),
        abyssShadowWraith: dnfAbyssBossSprite('shadow-wraith'),
    },
    equipmentIcons: {
        weapon: 'assets/dnf/equipment-icons/weapon-icons.png', headShoulder: 'assets/dnf/equipment-icons/shoulder-icons.png',
        top: 'assets/dnf/equipment-icons/top-icons.png', bottom: 'assets/dnf/equipment-icons/bottom-icons.png', belt: 'assets/dnf/equipment-icons/belt-icons.png', shoes: 'assets/dnf/equipment-icons/shoes-icons.png',
        bracelet: 'assets/dnf/equipment-icons/bracelet-icons.png', necklace: 'assets/dnf/equipment-icons/necklace-icons.png', ring: 'assets/dnf/equipment-icons/ring-icons.png',
        support: 'assets/dnf/equipment-icons/support-icons.png', magicStone: 'assets/dnf/equipment-icons/magic-stone-icons.png', earring: 'assets/dnf/equipment-icons/earring-icons.png',
    },
    dropAuras: {
        artifact: dnfDropAura('artifact'), legendary: dnfDropAura('legendary'), epic: dnfDropAura('epic'),
        primordial: dnfDropAura('primordial'), mythic: dnfDropAura('mythic'),
    },
    townBackdrop: 'assets/fighters/background/fighterbackground3-zaochen.png',
    ui: {
        coin: 'assets/coin.png', point: 'assets/point.png', skill: 'assets/fighters/ui/skill.png', combo: 'assets/fighters/ui/combo.png',
        hit: 'assets/fighters/ui/hit.png', super: 'assets/fighters/ui/super.png',
        combatHudFrame: 'assets/dnf/ui/combat-hud-frame.png', inventoryWindow: 'assets/dnf/ui/inventory-window.png', characterEquipmentPanel: 'assets/dnf/ui/character-equipment-panel.png',
    },
};

export const ABYSS_CHARACTERS = {
    sword: {
        id: 'sword', name: '剑士', title: '寒澈影 · 霜刃剑士', accent: '#8be9ff', asset: 'sword',
        combatType: 'physical', attackElement: 'ice',
        base: { physicalAttack: 24, magicalAttack: 8, independentAttack: 12, strength: 20, intelligence: 8, vitality: 18, spirit: 12, hp: 260, mp: 100, physicalDefense: 55, magicalDefense: 38, physicalCrit: 5, magicalCrit: 2, attackSpeed: 0, castSpeed: 0, moveSpeed: 0, baseMoveSpeed: 188, allElement: 0, fireElement: 0, iceElement: 0, lightElement: 0, darkElement: 0, damageIncrease: 0, skillAttack: 0, criticalDamage: 0, cooldownReduction: 0, allSkillLevel: 0, damageReduction: 0 },
        growth: { physicalAttack: 3, independentAttack: 1, strength: 3, intelligence: 1, vitality: 2, spirit: 1, hp: 16, mp: 5, physicalDefense: 3, magicalDefense: 2, physicalCrit: .18, magicalCrit: .08 },
        starterWeapon: 'rustwind_blade',
    },
    brawler: {
        id: 'brawler', name: '格斗家', title: '炎狱魔神 · 魔焰重拳', accent: '#ff7043', asset: 'brawler',
        combatType: 'physical', attackElement: 'fire',
        base: { physicalAttack: 23, magicalAttack: 7, independentAttack: 15, strength: 22, intelligence: 7, vitality: 20, spirit: 10, hp: 280, mp: 84, physicalDefense: 62, magicalDefense: 34, physicalCrit: 6, magicalCrit: 2, attackSpeed: 3, castSpeed: 0, moveSpeed: 0, baseMoveSpeed: 196, allElement: 0, fireElement: 0, iceElement: 0, lightElement: 0, darkElement: 0, damageIncrease: 0, skillAttack: 0, criticalDamage: 0, cooldownReduction: 0, allSkillLevel: 0, damageReduction: 0 },
        growth: { physicalAttack: 3, independentAttack: 2, strength: 3, intelligence: 1, vitality: 2, spirit: 1, hp: 18, mp: 4, physicalDefense: 3, magicalDefense: 2, physicalCrit: .2, magicalCrit: .08 },
        starterWeapon: 'ember_knuckles',
    },
};

export const ABYSS_SLOTS = ['weapon', 'headShoulder', 'top', 'bottom', 'belt', 'shoes', 'bracelet', 'necklace', 'ring', 'title', 'support', 'magicStone', 'earring'];
export const ABYSS_SLOT_LABELS = {
    weapon: '武器', headShoulder: '头肩', top: '上衣', bottom: '下装', belt: '腰带', shoes: '鞋',
    bracelet: '手镯', necklace: '项链', ring: '戒指', title: '称号', support: '辅助装备', magicStone: '魔法石', earring: '耳环',
};
export const ABYSS_RARITIES = {
    inferior: { name: '劣质', color: '#9198a2', weight: 20, power: .78, minLevel: 1 },
    common: { name: '普通', color: '#f1f4f8', weight: 30, power: 1, minLevel: 1 },
    advanced: { name: '高级', color: '#63a9ff', weight: 25, power: 1.18, minLevel: 5 },
    rare: { name: '稀有', color: '#bf78ff', weight: 14, power: 1.42, minLevel: 10 },
    artifact: { name: '神器', color: '#ff7fca', weight: 6, power: 1.72, minLevel: 18 },
    legendary: { name: '传说', color: '#ff9b42', weight: 3, power: 2.05, minLevel: 28 },
    epic: { name: '史诗', color: '#ffe06c', weight: 1.4, power: 2.45, minLevel: 40 },
    primordial: { name: '太初', color: '#9feaff', weight: .5, power: 2.95, minLevel: 52 },
    mythic: { name: '神话', color: '#f0c6ff', colors: ['#ff87c9', '#ffe26d', '#83eaff', '#cf8cff'], weight: .1, power: 3.6, minLevel: 60 },
};

export const ABYSS_STANDARD_DROP_BANDS = [
    { maxLevel: 8, weights: { inferior: 55, common: 40, advanced: 5 } },
    { maxLevel: 16, weights: { inferior: 30, common: 48, advanced: 20, rare: 2 } },
    { maxLevel: 25, weights: { inferior: 14, common: 42, advanced: 35, rare: 8.7, artifact: .3 } },
    { maxLevel: 34, weights: { inferior: 6, common: 34, advanced: 42, rare: 16.5, artifact: 1.4, legendary: .1 } },
    { maxLevel: 43, weights: { inferior: 2, common: 27, advanced: 42, rare: 25, artifact: 3.7, legendary: .28, epic: .02 } },
    { maxLevel: 51, weights: { common: 18, advanced: 39, rare: 33, artifact: 8.5, legendary: 1.4, epic: .1 } },
    { maxLevel: 57, weights: { common: 14, advanced: 33, rare: 38, artifact: 11.5, legendary: 3.3, epic: .2 } },
    { maxLevel: 60, weights: { common: 10, advanced: 29, rare: 42, artifact: 14, legendary: 4.5, epic: .5 } },
];

export const ABYSS_DEEP_DROP_BANDS = [
    { maxLevel: 54, weights: { rare: 45, artifact: 30, legendary: 20, epic: 4.8, primordial: .2 } },
    { maxLevel: 57, weights: { rare: 38, artifact: 31, legendary: 24, epic: 6.6, primordial: .4 } },
    { maxLevel: 59, weights: { rare: 30, artifact: 31, legendary: 28, epic: 10.2, primordial: .8 } },
    { maxLevel: 60, weights: { rare: 26, artifact: 30, legendary: 29, epic: 13.4, primordial: 1.4, mythic: .2 } },
];

export const ABYSS_ITEM_GRADES = {
    lowest: { name: '最下级', min: .33, max: .46, weight: 17, color: '#9aa4af' },
    low: { name: '下级', min: .47, max: .60, weight: 29, color: '#8eb0d2' },
    middle: { name: '中级', min: .61, max: .74, weight: 32, color: '#b9dca7' },
    high: { name: '上级', min: .75, max: .89, weight: 17, color: '#ffd47c' },
    highest: { name: '最上级', min: .90, max: 1, weight: 5, color: '#ff9ddb' },
};

export const ABYSS_RARITY_LOOT = Object.fromEntries(Object.keys(ABYSS_RARITIES).map((rarity) => [rarity, []]));

const classGearSlots = ['weapon', 'headShoulder', 'top', 'bottom', 'belt', 'shoes'];
const universalSlots = ABYSS_SLOTS.filter((slot) => !classGearSlots.includes(slot));
const rarityThemes = { inferior: '残锈', common: '狼牙', advanced: '苍蓝', rare: '紫晶', artifact: '绯蔷', legendary: '曜日', epic: '破穹', primordial: '初晨', mythic: '命运' };
const classGearScale = [
    { attack: 3, strength: 2, independent: 2, crit: 1, speed: 2, element: 3, skill: 1, damage: 1, criticalDamage: 2, cooldown: 1, defense: 9, hp: 18, mp: 5, vitality: 2, reduction: 1 },
    { attack: 6, strength: 3, independent: 4, crit: 2, speed: 3, element: 5, skill: 2, damage: 2, criticalDamage: 3, cooldown: 2, defense: 16, hp: 32, mp: 8, vitality: 3, reduction: 2 },
    { attack: 10, strength: 5, independent: 7, crit: 3, speed: 4, element: 8, skill: 3, damage: 3, criticalDamage: 4, cooldown: 3, defense: 25, hp: 50, mp: 12, vitality: 5, reduction: 3 },
    { attack: 16, strength: 8, independent: 11, crit: 4, speed: 5, element: 12, skill: 4, damage: 4, criticalDamage: 6, cooldown: 4, defense: 36, hp: 74, mp: 16, vitality: 7, reduction: 4 },
    { attack: 24, strength: 12, independent: 16, crit: 6, speed: 7, element: 18, skill: 6, damage: 6, criticalDamage: 8, cooldown: 5, defense: 50, hp: 104, mp: 22, vitality: 10, reduction: 5 },
    { attack: 34, strength: 17, independent: 22, crit: 8, speed: 9, element: 25, skill: 8, damage: 8, criticalDamage: 10, cooldown: 7, defense: 68, hp: 140, mp: 30, vitality: 13, reduction: 6 },
    { attack: 46, strength: 23, independent: 30, crit: 10, speed: 12, element: 33, skill: 10, damage: 10, criticalDamage: 13, cooldown: 8, defense: 88, hp: 182, mp: 40, vitality: 17, reduction: 7 },
    { attack: 62, strength: 30, independent: 39, crit: 13, speed: 15, element: 42, skill: 13, damage: 13, criticalDamage: 16, cooldown: 10, defense: 112, hp: 230, mp: 52, vitality: 21, reduction: 8 },
    { attack: 80, strength: 38, independent: 50, crit: 16, speed: 19, element: 54, skill: 16, damage: 16, criticalDamage: 20, cooldown: 12, defense: 140, hp: 286, mp: 66, vitality: 26, reduction: 10 },
];
const valueFor = (key, scale) => ({ physicalAttack: scale.attack, magicalAttack: scale.attack, strength: scale.strength, intelligence: scale.strength, spirit: scale.vitality, independentAttack: scale.independent, physicalCrit: scale.crit, magicalCrit: scale.crit, attackSpeed: scale.speed, castSpeed: scale.speed, moveSpeed: scale.speed, allElement: scale.element, damageIncrease: scale.damage, skillAttack: scale.skill, criticalDamage: scale.criticalDamage, cooldownReduction: scale.cooldown, physicalDefense: scale.defense, magicalDefense: Math.round(scale.defense * .82), hp: scale.hp, mp: scale.mp, vitality: scale.vitality, damageReduction: scale.reduction, allSkillLevel: scale.skill >= 10 ? 2 : 1 }[key]);
const buildStats = (keys, scale, count, classId) => Object.fromEntries(keys.slice(0, count).map((key) => [key === 'classElement' ? (classId === 'sword' ? 'iceElement' : 'fireElement') : key, key === 'classElement' ? scale.element : valueFor(key, scale)]));
const weaponProfiles = [
    ['physicalAttack', 'strength', 'independentAttack', 'physicalCrit', 'attackSpeed', 'classElement', 'skillAttack', 'damageIncrease'],
    ['independentAttack', 'physicalAttack', 'physicalCrit', 'attackSpeed', 'moveSpeed', 'classElement', 'damageIncrease', 'criticalDamage'],
    ['attackSpeed', 'physicalAttack', 'strength', 'castSpeed', 'classElement', 'physicalCrit', 'skillAttack', 'cooldownReduction'],
    ['classElement', 'physicalAttack', 'physicalCrit', 'independentAttack', 'damageIncrease', 'skillAttack', 'criticalDamage', 'attackSpeed'],
    ['strength', 'physicalAttack', 'physicalDefense', 'hp', 'physicalCrit', 'classElement', 'damageIncrease', 'damageReduction'],
];
const armorProfiles = [
    ['physicalDefense', 'magicalDefense', 'vitality', 'hp', 'physicalCrit', 'damageReduction', 'cooldownReduction', 'damageIncrease'],
    ['hp', 'vitality', 'physicalDefense', 'magicalDefense', 'damageReduction', 'damageIncrease', 'skillAttack', 'classElement'],
    ['vitality', 'hp', 'physicalDefense', 'moveSpeed', 'physicalCrit', 'classElement', 'damageIncrease', 'cooldownReduction'],
    ['damageReduction', 'hp', 'vitality', 'physicalDefense', 'magicalDefense', 'cooldownReduction', 'mp', 'damageIncrease'],
    ['moveSpeed', 'physicalDefense', 'attackSpeed', 'hp', 'physicalCrit', 'classElement', 'damageIncrease', 'cooldownReduction'],
];
const classGearNames = {
    sword: {
        weapon: ['裂风短剑', '断岳钝器', '逐月太刀', '寒川巨剑', '流光剑', '断潮光剑', '雪走太刀', '镇岳巨剑', '寒星短剑', '苍雷钝器'],
        headShoulder: ['剑痕护肩', '锋影肩甲', '霜纹披肩', '破阵肩铠', '流心护肩', '寒星肩甲', '断潮披肩', '剑域护肩', '雪走肩铠', '苍雷肩甲'],
        top: ['剑魂战衣', '锋芒胸甲', '寒霜剑衣', '破军重甲', '流心轻甲', '寒星剑袍', '断潮胸甲', '剑域战衣', '雪走轻甲', '苍雷重甲'],
        bottom: ['剑痕护腿', '锋影腿甲', '霜纹下装', '破阵胫甲', '流心腿甲', '寒星护腿', '断潮腿甲', '剑域下装', '雪走胫甲', '苍雷腿铠'],
        belt: ['剑魂腰带', '锋芒束腰', '寒霜剑带', '破军腰甲', '流心腰封', '寒星束带', '断潮腰甲', '剑域腰封', '雪走剑带', '苍雷腰铠'],
        shoes: ['剑痕战靴', '锋影长靴', '霜纹剑靴', '破阵重靴', '流心轻靴', '寒星战靴', '断潮长靴', '剑域剑靴', '雪走轻靴', '苍雷重靴'],
    },
    brawler: {
        weapon: ['烈拳手套', '崩山臂铠', '裂骨利爪', '伏虎拳套', '盘龙东方棍', '震岳拳套', '焚风臂铠', '赤虎利爪', '雷动手套', '金刚东方棍'],
        headShoulder: ['斗神护肩', '炎劲肩甲', '刚拳披肩', '伏虎肩铠', '盘龙护肩', '震岳肩甲', '焚风披肩', '赤虎护肩', '雷动肩铠', '金刚肩甲'],
        top: ['斗神战衣', '炎劲胸甲', '刚拳武服', '伏虎重甲', '盘龙轻甲', '震岳武服', '焚风胸甲', '赤虎战衣', '雷动轻甲', '金刚重甲'],
        bottom: ['斗神护腿', '炎劲腿甲', '刚拳下装', '伏虎胫甲', '盘龙腿甲', '震岳护腿', '焚风腿甲', '赤虎下装', '雷动胫甲', '金刚腿铠'],
        belt: ['斗神腰带', '炎劲束腰', '刚拳腰封', '伏虎腰甲', '盘龙武带', '震岳腰带', '焚风束腰', '赤虎腰封', '雷动腰甲', '金刚武带'],
        shoes: ['斗神战靴', '炎劲短靴', '刚拳武靴', '伏虎重靴', '盘龙轻靴', '震岳战靴', '焚风短靴', '赤虎武靴', '雷动轻靴', '金刚重靴'],
    },
};
const universalNames = {
    bracelet: ['星纹手镯', '潮汐腕轮', '赤心臂环', '月蚀手环', '圣痕腕饰', '晨曦手镯', '深海腕轮', '龙血臂环', '星界手环', '王庭腕饰'],
    necklace: ['星辉项链', '潮音吊坠', '赤魂项圈', '月影坠饰', '圣痕项链', '晨曦项链', '深海吊坠', '龙血项圈', '星界坠饰', '王庭项链'],
    ring: ['星砂戒指', '潮汐指环', '赤心骨戒', '月蚀秘戒', '圣痕指环', '晨曦戒指', '深海指环', '龙血骨戒', '星界秘戒', '王庭指环'],
    title: ['逐风者', '守望者', '破界者', '征服者', '天命者', '踏浪者', '斩星者', '不屈者', '巡界者', '裁决者'],
    support: ['战术腕轮', '灵能核心', '远古徽章', '机械心脏', '王权印章', '晨曦徽记', '深海核心', '龙血图腾', '星界罗盘', '王庭圣印'],
    magicStone: ['炽魂魔石', '冰魄晶石', '圣光灵珠', '暗影魔晶', '混沌源石', '晨曦辉石', '深海泪晶', '龙血心石', '星界棱晶', '王庭秘石'],
    earring: ['苍音耳坠', '雷鸣耳环', '赤霞耳钉', '月华耳饰', '虚空耳坠', '晨曦耳坠', '深海耳环', '龙血耳钉', '星界耳饰', '王庭耳坠'],
};
const universalProfiles = [
    ['independentAttack', 'strength', 'physicalAttack', 'physicalCrit', 'damageIncrease', 'criticalDamage', 'attackSpeed', 'skillAttack'],
    ['hp', 'vitality', 'spirit', 'physicalDefense', 'magicalDefense', 'damageReduction', 'mp', 'cooldownReduction'],
    ['allElement', 'independentAttack', 'physicalCrit', 'magicalCrit', 'damageIncrease', 'skillAttack', 'criticalDamage', 'allSkillLevel'],
    ['physicalCrit', 'magicalCrit', 'criticalDamage', 'damageIncrease', 'attackSpeed', 'castSpeed', 'allElement', 'skillAttack'],
    ['moveSpeed', 'attackSpeed', 'castSpeed', 'cooldownReduction', 'skillAttack', 'damageIncrease', 'allSkillLevel', 'independentAttack'],
];
const buildClassGear = (rarity, rarityIndex, classId) => {
    const theme = rarityThemes[rarity];
    const names = classGearNames[classId];
    const scale = classGearScale[rarityIndex];
    const count = Math.min(8, rarityIndex + 1);
    const price = Math.round(12 * ABYSS_RARITIES[rarity].power * (rarityIndex + 1));
    const weapons = names.weapon.map((name, index) => ({ id: `${classId}_${rarity}_weapon_${index + 1}`, name: `${theme}${name}`, slot: 'weapon', icon: classId === 'sword' ? '剑' : '拳', classId, stats: buildStats(weaponProfiles[index % weaponProfiles.length], scale, count, classId), price }));
    const armor = classGearSlots.slice(1).flatMap((slot, slotIndex) => names[slot].map((name, profileIndex) => ({ id: `${classId}_${rarity}_${slot}_${profileIndex + 1}`, name: `${theme}${name}`, slot, icon: ['肩', '甲', '腿', '腰', '靴'][slotIndex], classId, stats: buildStats(armorProfiles[profileIndex % armorProfiles.length], scale, count, classId), price: Math.round(price * .86) })));
    return [...weapons, ...armor];
};
const buildUniversalGear = (rarity, rarityIndex) => {
    const theme = rarityThemes[rarity];
    const scale = classGearScale[rarityIndex];
    const count = Math.min(8, rarityIndex + 1);
    const price = Math.round(11 * ABYSS_RARITIES[rarity].power * (rarityIndex + 1));
    return universalSlots.flatMap((slot) => universalNames[slot].map((name, profileIndex) => ({ id: `universal_${rarity}_${slot}_${profileIndex + 1}`, name: `${theme}${name}`, slot, icon: { bracelet: '镯', necklace: '链', ring: '戒', title: '冠', support: '徽', magicStone: '石', earring: '耳' }[slot], classId: null, stats: buildStats(universalProfiles[profileIndex % universalProfiles.length], scale, count), price })));
};

Object.keys(ABYSS_RARITY_LOOT).forEach((rarity, index) => {
    ABYSS_RARITY_LOOT[rarity] = [...buildUniversalGear(rarity, index), ...buildClassGear(rarity, index, 'sword'), ...buildClassGear(rarity, index, 'brawler')];
});

export const ABYSS_DIFFICULTIES = {
    normal: { id: 'normal', name: '普通', hp: 1, damage: 1, xp: 1, dropBonus: 0 },
    adventure: { id: 'adventure', name: '冒险', hp: 1.3, damage: 1.18, xp: 1.25, dropBonus: 0.1 },
    king: { id: 'king', name: '王者', hp: 1.65, damage: 1.38, xp: 1.55, dropBonus: 0.22 },
    abyss: { id: 'abyss', name: '深渊', hp: 2.45, damage: 1.75, xp: 1.8, dropBonus: 0.28, abyss: true },
};

export const ABYSS_COMBAT = {
    bounds: { left: 74, right: 1206, top: 334, bottom: 510, depthScale: 0.56 },
    player: {
        sword: {
            combo: [
                { name: '横斩', startup: 0.09, active: [0.10, 0.17], recovery: 0.18, damage: 0.92, range: 106, depth: 42, step: 24, hitstun: 0.18, knockback: 38, hitstop: 0.045, shake: 1.5, cancel: [0.16, 0.32], skillCancel: [0.14, 0.28] },
                { name: '回身斩', startup: 0.10, active: [0.12, 0.20], recovery: 0.20, damage: 1.08, range: 118, depth: 46, step: 28, hitstun: 0.23, knockback: 52, hitstop: 0.055, shake: 2, cancel: [0.19, 0.36], skillCancel: [0.18, 0.31] },
                { name: '挑空斩', startup: 0.13, active: [0.15, 0.25], recovery: 0.30, damage: 1.42, range: 126, depth: 50, step: 34, hitstun: 0.38, knockback: 74, launch: 235, hitstop: 0.08, shake: 4, cancel: [0.29, 0.40], skillCancel: [0.27, 0.37] },
            ],
        },
        brawler: {
            combo: [
                { name: '直拳', startup: 0.06, active: [0.07, 0.13], recovery: 0.12, damage: 0.66, range: 76, depth: 38, step: 16, hitstun: 0.13, knockback: 24, hitstop: 0.032, shake: 1, cancel: [0.11, 0.23], skillCancel: [0.10, 0.19] },
                { name: '肘击', startup: 0.06, active: [0.08, 0.14], recovery: 0.13, damage: 0.73, range: 82, depth: 40, step: 18, hitstun: 0.15, knockback: 30, hitstop: 0.036, shake: 1.3, cancel: [0.13, 0.25], skillCancel: [0.12, 0.21] },
                { name: '侧踢', startup: 0.08, active: [0.10, 0.17], recovery: 0.16, damage: 0.86, range: 96, depth: 46, step: 22, hitstun: 0.20, knockback: 44, hitstop: 0.045, shake: 2, cancel: [0.16, 0.30], skillCancel: [0.15, 0.25] },
                { name: '升龙重击', startup: 0.11, active: [0.13, 0.23], recovery: 0.27, damage: 1.22, range: 98, depth: 50, step: 28, hitstun: 0.38, knockback: 62, launch: 250, hitstop: 0.075, shake: 4, cancel: [0.27, 0.36], skillCancel: [0.25, 0.33] },
            ],
        },
    },
    enemy: {
        normal: { detect: 470, attackRange: 70, windup: 0.34, active: 0.10, recovery: 0.34, hitstun: 0.22, poise: 1, patrol: 34 },
        ranged: { detect: 520, keepRange: 205, windup: 0.48, active: 0.08, recovery: 0.48, hitstun: 0.18, poise: 1, projectileSpeed: 290, projectileLife: 2.1 },
        elite: { detect: 500, attackRange: 82, windup: 0.38, active: 0.13, recovery: 0.36, hitstun: 0.15, poise: 2, patrol: 24, lungeCooldown: 4.2 },
        boss: { detect: 620, attackRange: 110, windup: 0.52, active: 0.16, recovery: 0.46, hitstun: 0.10, poise: 4, patrol: 0 },
    },
    feedback: { lightHitstop: 0.042, heavyHitstop: 0.085, bossHitstop: 0.105, damageLife: 0.78, shakeDecay: 22 },
};

const makeSkill = (classId, key, id, name, unlockLevel, cost, cooldown, mult, action, extra = {}) => ({
    id, classId, key, name, icon: key, category: 'active', unlockLevel, maxLevel: 10, cost, cooldown, mult,
    attacks: action.hits, range: action.range, startup: action.startup, active: action.active, recovery: action.recovery,
    canAir: true, superArmor: Boolean(action.superArmor), growth: { damage: .09, range: .025, cooldown: .025, cost: .015 }, action, ...extra,
});
const swordAction = (range, hits = 1, extra = {}) => ({ startup: .12, active: [.15, .28], recovery: .30, range, depth: 62, hits, hitstun: .30, knockback: 62, shake: 3, ...extra });
const fistAction = (range, hits = 1, extra = {}) => ({ startup: .10, active: [.13, .28], recovery: .28, range, depth: 58, hits, hitstun: .28, knockback: 58, shake: 3, ...extra });

export const ABYSS_SKILL_CATALOG = {
    sword: [
        makeSkill('sword','H','sword_h','\u65ad\u98ce\u65a9',1,12,1.8,1.8,swordAction(124),{tags:['slash']}),
        makeSkill('sword','K','sword_k','\u5d29\u5c71\u6311',5,15,5.5,2.1,swordAction(112,1,{launch:250,knockback:72,hitstun:.42,shake:4}),{tags:['slash']}),
        makeSkill('sword','L','sword_l','\u6708\u8f6e\u6a2a\u65a9',10,20,4.8,2.5,swordAction(142,3,{active:[.13,.47],rehit:.11,area:true,knockback:24}),{tags:['slash']}),
        makeSkill('sword','Y','sword_y','\u7834\u519b\u7a81\u523a',15,16,4.2,2.25,swordAction(154,1,{startup:.06,active:[.08,.20],step:112,superArmor:true,invuln:.10,stun:true,hitstun:.44,knockback:82}),{mobile:true,tags:['slash']}),
        makeSkill('sword','U','sword_u','\u88c2\u5730\u6ce2',20,28,8,3.1,swordAction(270,0,{projectile:{speed:420,life:.72,radius:28}}),{tags:['slash']}),
        makeSkill('sword','I','sword_i','\u65cb\u5203\u98ce\u66b4',26,32,11,3.8,swordAction(160,5,{active:[.16,.62],rehit:.09,area:true,superArmor:true,knockback:22}),{tags:['slash']}),
        makeSkill('sword','O','sword_o','\u9006\u5149\u683c\u6321',33,24,13,2.8,swordAction(110,0,{guard:1.05,superArmor:true,counter:true}),{tags:['slash']}),
        makeSkill('sword','P','sword_p','\u5929\u9668\u5251\u9635',40,58,22,6.2,swordAction(250,3,{startup:.30,active:[.36,.66],recovery:.62,rehit:.12,area:true,launch:285,knockback:105,superArmor:true,shake:7}),{tags:['slash']}),
        makeSkill('sword','1','sword_1','\u971c\u5f71\u8fde\u95ea',45,42,14,4.5,swordAction(182,4,{active:[.10,.54],rehit:.09,area:true,superArmor:true,knockback:38,shake:5}),{tags:['slash']}),
        makeSkill('sword','2','sword_2','\u6781\u663c\u5251\u9e23',50,48,17,5.1,swordAction(310,0,{projectile:{speed:520,life:.86,radius:40},superArmor:true,shake:6}),{tags:['slash']}),
        makeSkill('sword','3','sword_3','\u51a5\u754c\u65ad\u7ae0',55,56,20,5.8,swordAction(225,2,{active:[.22,.58],rehit:.16,area:true,launch:300,knockback:112,superArmor:true,shake:7}),{tags:['slash']}),
        makeSkill('sword','4','sword_4','\u82cd\u7a79\u7ec8\u7109',60,72,28,7.7,swordAction(290,4,{startup:.34,active:[.42,.82],recovery:.68,rehit:.11,area:true,launch:330,knockback:128,superArmor:true,shake:9}),{tags:['slash']}),
    ],
    brawler: [
        makeSkill('brawler','H','brawler_h','\u8fde\u73af\u51b2\u62f3',1,10,1.5,1.75,fistAction(110,3,{active:[.07,.28],rehit:.07,knockback:28}),{tags:['fist']}),
        makeSkill('brawler','K','brawler_k','\u94c1\u5c71\u9760',5,16,4.6,2.35,fistAction(132,1,{step:72,superArmor:true,stun:true,hitstun:.42,knockback:78}),{mobile:true,tags:['fist']}),
        makeSkill('brawler','L','brawler_l','\u5347\u9f99\u811a',10,18,4,2.25,fistAction(118,1,{launch:292,knockback:72,hitstun:.45,shake:5}),{tags:['fist']}),
        makeSkill('brawler','Y','brawler_y','\u56de\u65cb\u64d2\u62ff',15,22,5.8,2.9,fistAction(88,1,{grab:true,launch:190,knockback:96,hitstun:.50,shake:5}),{tags:['fist']}),
        makeSkill('brawler','U','brawler_u','\u6c14\u65cb\u6295',20,26,7.2,3.15,fistAction(174,1,{area:true,pull:105,knockback:86,shake:5}),{tags:['fist']}),
        makeSkill('brawler','I','brawler_i','\u95ea\u7535\u4e71\u51fb',26,34,11,4.05,fistAction(152,5,{active:[.16,.48],rehit:.065,superArmor:true,knockback:24,shake:4}),{tags:['fist']}),
        makeSkill('brawler','O','brawler_o','\u9738\u4f53\u9707\u51fb',33,30,13,3.6,fistAction(150,1,{area:true,superArmor:true,knockdown:true,knockback:92,hitstun:.52,shake:6}),{tags:['fist']}),
        makeSkill('brawler','P','brawler_p','\u88c2\u7a7a\u7ec8\u7ed3\u8e22',40,58,22,6.35,fistAction(238,3,{startup:.26,active:[.31,.56],recovery:.56,rehit:.11,area:true,launch:278,knockback:102,superArmor:true,shake:7}),{tags:['fist']}),
        makeSkill('brawler','1','brawler_1','\u9b54\u708e\u8fde\u5d29',45,40,14,4.6,fistAction(180,5,{active:[.10,.52],rehit:.08,area:true,superArmor:true,knockback:32,shake:5}),{tags:['fist']}),
        makeSkill('brawler','2','brawler_2','\u708e\u9b54\u8df5\u88c2',50,48,17,5.2,fistAction(220,2,{active:[.18,.50],rehit:.15,area:true,knockdown:true,knockback:108,superArmor:true,shake:7}),{tags:['fist']}),
        makeSkill('brawler','3','brawler_3','\u72f1\u706b\u6355\u98df',55,56,20,5.9,fistAction(205,1,{grab:true,area:true,launch:310,knockback:118,superArmor:true,shake:8}),{tags:['fist']}),
        makeSkill('brawler','4','brawler_4','\u70ac\u72f1\u7ec8\u5c40',60,72,28,7.8,fistAction(278,4,{startup:.32,active:[.40,.80],recovery:.66,rehit:.11,area:true,launch:340,knockback:132,superArmor:true,shake:9}),{tags:['fist']}),
    ],
};

export const ABYSS_MONSTERS = {
    mossGoblin: { name: '苔牙小鬼', hp: 58, attack: 8, speed: 58, xp: 17, gold: [3, 7], color: '#94c86d', size: 23, swarm: true },
    grayWolf: { name: '灰爪野狼', hp: 74, attack: 10, speed: 82, xp: 21, gold: [4, 8], color: '#a6a5a0', size: 25, lunge: true },
    stoneGuard: { name: '石壳守卫', hp: 132, attack: 14, speed: 38, xp: 36, gold: [8, 13], color: '#9c8875', size: 32, elite: true },
    mistPriest: { name: '雾林祭司', hp: 118, attack: 16, speed: 43, xp: 40, gold: [8, 14], color: '#b587cc', size: 27, elite: true, ranged: true },
    skyPatrol: { name: '浮空巡守', hp: 146, attack: 18, speed: 70, xp: 50, gold: [10, 16], color: '#78c5e8', size: 27, ranged: true },
    gearGolem: { name: '齿轮傀儡', hp: 210, attack: 22, speed: 36, xp: 68, gold: [13, 21], color: '#d7aa5f', size: 34, elite: true },
    cloudExecutioner: { name: '云塔执刑者', hp: 245, attack: 25, speed: 54, xp: 76, gold: [16, 24], color: '#d8d5e8', size: 35, elite: true },
    harborMarauder: { name: '浮港掠行者', hp: 270, attack: 27, speed: 72, xp: 82, gold: [18, 27], color: '#e3a96c', size: 32, lunge: true },
    frostSentinel: { name: '寒霜卫士', hp: 310, attack: 29, speed: 42, xp: 94, gold: [20, 30], color: '#a9d9f4', size: 37, elite: true },
    nightStalker: { name: '夜幕猎手', hp: 328, attack: 31, speed: 84, xp: 102, gold: [22, 33], color: '#a783d9', size: 30, ranged: true },
    plagueCarrier: { name: '瘟雾载体', hp: 352, attack: 34, speed: 50, xp: 112, gold: [24, 36], color: '#8da85a', size: 39, elite: true },
    riftWraith: { name: '裂隙幽魂', hp: 385, attack: 37, speed: 78, xp: 128, gold: [27, 40], color: '#c486e7', size: 33, lunge: true },
};

export const ABYSS_BOSSES = {
    briarTyrant: { name: '棘冠巨兽', hp: 720, attack: 20, speed: 42, xp: 260, gold: 56, color: '#d2a85b', mechanic: '生命低于 55% 后持续召唤苔牙小鬼。', summons: 'mossGoblin' },
    fogMatriarch: { name: '雾林主祭', hp: 980, attack: 27, speed: 45, xp: 340, gold: 78, color: '#d58fdd', mechanic: '每隔一段时间释放雾环，近身也会受到伤害。', pulse: true },
    aetherWarden: { name: '天穹监卫', hp: 1320, attack: 34, speed: 52, xp: 470, gold: 105, color: '#b9e9ff', mechanic: '半血后进入加速阶段，冲锋频率提高。', enrage: true },
    harborDreadnought: { name: '断帆无畏舰', hp: 1580, attack: 39, speed: 46, xp: 570, gold: 132, color: '#e4b16d', mechanic: '连续冲锋后展开大范围甲板轰击。', enrage: true },
    frostSovereign: { name: '霜冠领主', hp: 1770, attack: 44, speed: 40, xp: 660, gold: 154, color: '#a8e2ff', mechanic: '冰环与重击交替出现，闪避节奏更紧凑。' },
    nightRegent: { name: '夜廷摄政王', hp: 1980, attack: 49, speed: 58, xp: 750, gold: 178, color: '#d399f1', mechanic: '召唤暗影侍从，并以雾环封锁近身空间。', summons: 'nightStalker' },
    plagueEngine: { name: '瘟潮母机', hp: 2220, attack: 55, speed: 44, xp: 860, gold: 205, color: '#b2ce6a', mechanic: '高频雾环与增援交替，要求优先清理场上单位。', summons: 'plagueCarrier' },
    riftArbiter: { name: '悲鸣裁决者', hp: 2580, attack: 62, speed: 62, xp: 1040, gold: 250, color: '#f0a3ef', mechanic: '半血后进入裁决阶段，冲锋和范围技能都会加速。', enrage: true, summons: 'riftWraith' },
    abyssGoblinRaider: { name: '深渊·魔刃统领', hp: 2380, attack: 58, speed: 66, xp: 980, gold: 220, color: '#8dcf58', mechanic: '终极哥布林形态，召唤军团后高速斩击。', enrage: true, summons: 'mossGoblin' },
    abyssShadowWolf: { name: '深渊·噬月魔狼', hp: 2520, attack: 64, speed: 82, xp: 1020, gold: 230, color: '#e25757', mechanic: '终极魔狼形态，残血后连续扑杀。', enrage: true },
    abyssStoneGolem: { name: '深渊·熔核壁垒', hp: 3100, attack: 61, speed: 38, xp: 1080, gold: 245, color: '#df8444', mechanic: '终极石像形态，以熔核震荡封锁近身区域。', pulse: true },
    abyssVoidMage: { name: '深渊·虚无大贤者', hp: 2260, attack: 69, speed: 50, xp: 1060, gold: 240, color: '#ba73ff', mechanic: '终极法师形态，虚空脉冲与召唤交替。', pulse: true, summons: 'mistPriest' },
    abyssFrostLancer: { name: '深渊·极光枪皇', hp: 2640, attack: 67, speed: 72, xp: 1040, gold: 238, color: '#7de6ff', mechanic: '终极枪骑形态，半血后冲锋频率大幅提高。', enrage: true },
    abyssClockworkGolem: { name: '深渊·永动战械', hp: 3260, attack: 63, speed: 42, xp: 1100, gold: 255, color: '#d7a04e', mechanic: '终极机巧形态，持续呼叫齿轮傀儡增援。', summons: 'gearGolem' },
    abyssFrostWarrior: { name: '深渊·冰狱征服者', hp: 2840, attack: 70, speed: 56, xp: 1090, gold: 250, color: '#87dfff', mechanic: '终极冰战士形态，重击与冰环连续施放。', pulse: true, enrage: true },
    abyssShadowWraith: { name: '深渊·无相收割者', hp: 2420, attack: 72, speed: 78, xp: 1120, gold: 260, color: '#a26cff', mechanic: '终极幽魂形态，以暗影增援和高速裁决压制。', enrage: true, summons: 'riftWraith' },
};

export const ABYSS_DEEP_BOSS_IDS = ['abyssGoblinRaider', 'abyssShadowWolf', 'abyssStoneGolem', 'abyssVoidMage', 'abyssFrostLancer', 'abyssClockworkGolem', 'abyssFrostWarrior', 'abyssShadowWraith'];

export const ABYSS_AREAS = [
    { id: 'windfall', name: '岚风边地', levels: [1, 8], intro: '被长风切开的边陲草地，旧哨塔的火种尚未熄灭。', unlockLevel: 1, playable: true,
        dungeons: [{ id: 'breeze_watch', name: '风痕哨道', level: 1, rooms: 3, boss: 'briarTyrant', monsters: ['mossGoblin', 'grayWolf', 'stoneGuard'], firstReward: { gold: 80, item: 'windwatch_title' }, repeatLoot: ['wind'] }, { id: 'thistle_den', name: '荆石洞窟', level: 5, rooms: 3, boss: 'briarTyrant', monsters: ['grayWolf', 'stoneGuard'], firstReward: { gold: 70 }, repeatLoot: ['wind'] }] },
    { id: 'mosswood', name: '影苔密林', levels: [9, 16], intro: '浓雾包围着低语巨木，迷路者常被苔影吞没。', unlockLevel: 9, playable: true,
        dungeons: [{ id: 'murmur_grove', name: '低语林径', level: 9, rooms: 3, boss: 'fogMatriarch', monsters: ['mossGoblin', 'mistPriest', 'stoneGuard'], firstReward: { gold: 120, item: 'mistward_pendant' }, repeatLoot: ['moss'] }, { id: 'mire_altar', name: '苔影祭坛', level: 13, rooms: 4, boss: 'fogMatriarch', monsters: ['grayWolf', 'mistPriest'], firstReward: { gold: 110 }, repeatLoot: ['moss'] }] },
    { id: 'skyspire', name: '浮空塔城', levels: [17, 25], intro: '漂浮在云层间的断塔群，旧时代的机巧仍在巡逻。', unlockLevel: 17, playable: true,
        dungeons: [{ id: 'horizon_lift', name: '苍穹升降井', level: 17, rooms: 4, boss: 'aetherWarden', monsters: ['skyPatrol', 'gearGolem', 'cloudExecutioner'], firstReward: { gold: 180, item: 'skybreaker_ring' }, repeatLoot: ['sky'] }, { id: 'gear_gallery', name: '齿轮回廊', level: 21, rooms: 4, boss: 'aetherWarden', monsters: ['skyPatrol', 'gearGolem'], firstReward: { gold: 160 }, repeatLoot: ['sky'] }] },
    { id: 'cloudharbor', name: '云幕巨港', levels: [26, 34], intro: '悬港的灯塔已熄灭，风帆只在无人的夜里起航。', unlockLevel: 26, playable: true, dungeons: [{ id: 'harbor_lock', name: '断帆船坞', level: 26, rooms: 4, boss: 'harborDreadnought', monsters: ['harborMarauder', 'skyPatrol', 'gearGolem'], firstReward: { gold: 240 }, repeatLoot: ['harbor'] }, { id: 'cloud_customs', name: '浮港关卡', level: 30, rooms: 5, boss: 'harborDreadnought', monsters: ['harborMarauder', 'cloudExecutioner', 'skyPatrol'], firstReward: { gold: 230 }, repeatLoot: ['harbor'] }] },
    { id: 'frostpath', name: '极霜山径', levels: [35, 43], intro: '冰脊封住古道，山风带来不属于此世的回声。', unlockLevel: 35, playable: true, dungeons: [{ id: 'ice_shelf', name: '碎冰栈道', level: 35, rooms: 5, boss: 'frostSovereign', monsters: ['frostSentinel', 'nightStalker', 'gearGolem'], firstReward: { gold: 300 }, repeatLoot: ['frost'] }, { id: 'white_bastion', name: '白垒遗址', level: 39, rooms: 5, boss: 'frostSovereign', monsters: ['frostSentinel', 'cloudExecutioner'], firstReward: { gold: 285 }, repeatLoot: ['frost'] }] },
    { id: 'shadecity', name: '暗影都城', levels: [44, 51], intro: '日光无法照进高墙，城市的钟声只为亡者响起。', unlockLevel: 44, playable: true, dungeons: [{ id: 'black_lane', name: '黑巷回声', level: 44, rooms: 5, boss: 'nightRegent', monsters: ['nightStalker', 'harborMarauder', 'frostSentinel'], firstReward: { gold: 360 }, repeatLoot: ['night'] }, { id: 'night_court', name: '夜廷旧址', level: 48, rooms: 6, boss: 'nightRegent', monsters: ['nightStalker', 'cloudExecutioner', 'plagueCarrier'], firstReward: { gold: 345 }, repeatLoot: ['night'] }] },
    { id: 'mireveil', name: '瘟雾沼地', levels: [52, 57], intro: '腐雾在水面游走，沉没的军旗还在低语。', unlockLevel: 52, playable: true, dungeons: [{ id: 'plague_marsh', name: '瘟潮泥泽', level: 52, rooms: 6, boss: 'plagueEngine', monsters: ['plagueCarrier', 'nightStalker', 'frostSentinel'], firstReward: { gold: 430 }, repeatLoot: ['plague'] }, { id: 'sunk_laboratory', name: '沉没工坊', level: 55, rooms: 6, boss: 'plagueEngine', monsters: ['plagueCarrier', 'gearGolem', 'riftWraith'], firstReward: { gold: 415 }, repeatLoot: ['plague'] }] },
    { id: 'dirgerift', name: '悲鸣裂隙', levels: [58, 60], intro: '裂隙尽头传来长久的悲鸣，最后的试炼正在等候。', unlockLevel: 58, playable: true, dungeons: [{ id: 'weeping_arch', name: '悲鸣拱廊', level: 58, rooms: 6, boss: 'riftArbiter', monsters: ['riftWraith', 'plagueCarrier', 'nightStalker'], firstReward: { gold: 520 }, repeatLoot: ['rift'] }, { id: 'last_rift', name: '终末裂谷', level: 60, rooms: 7, boss: 'riftArbiter', monsters: ['riftWraith', 'frostSentinel', 'cloudExecutioner'], firstReward: { gold: 600 }, repeatLoot: ['rift'] }] },
];

export const ABYSS_EQUIPMENT = {
    rustwind_blade: { id: 'rustwind_blade', name: '风蚀短剑', slot: 'weapon', level: 1, rarity: 'common', classId: 'sword', stats: { physicalAttack: 7, strength: 3 }, price: 20, icon: '剑' },
    ember_knuckles: { id: 'ember_knuckles', name: '余烬拳套', slot: 'weapon', level: 1, rarity: 'common', classId: 'brawler', stats: { physicalAttack: 6, strength: 4, attackSpeed: 3 }, price: 20, icon: '拳' },
    windwatch_title: { id: 'windwatch_title', name: '岚风见习者', slot: 'title', level: 1, rarity: 'advanced', stats: { hp: 30, strength: 4, physicalCrit: 2 }, price: 55, icon: '称' },
    mistward_pendant: { id: 'mistward_pendant', name: '驱雾项坠', slot: 'necklace', level: 9, rarity: 'rare', stats: { hp: 52, vitality: 5, allElement: 7, physicalCrit: 2 }, price: 130, icon: '链' },
    skybreaker_ring: { id: 'skybreaker_ring', name: '破云指环', slot: 'ring', level: 17, rarity: 'rare', stats: { independentAttack: 12, lightElement: 10, physicalCrit: 4, moveSpeed: 5 }, price: 220, icon: '环' },
    smith_sword_practice: { id: 'smith_sword_practice', name: '试锋长剑', slot: 'weapon', level: 1, rarity: 'advanced', classId: 'sword', stats: { physicalAttack: 11, strength: 4, physicalCrit: 1 }, price: 95, icon: '剑' },
    smith_brawler_practice: { id: 'smith_brawler_practice', name: '练习拳套', slot: 'weapon', level: 1, rarity: 'advanced', classId: 'brawler', stats: { physicalAttack: 10, strength: 5, attackSpeed: 3 }, price: 95, icon: '拳' },
    merchant_sword_top: { id: 'merchant_sword_top', name: '霜纹剑衣', slot: 'top', level: 1, rarity: 'advanced', classId: 'sword', stats: { hp: 46, vitality: 3, physicalDefense: 20 }, price: 75, icon: '甲' },
    merchant_brawler_top: { id: 'merchant_brawler_top', name: '焰纹拳衣', slot: 'top', level: 1, rarity: 'advanced', classId: 'brawler', stats: { hp: 50, vitality: 4, physicalDefense: 19 }, price: 75, icon: '甲' },
    merchant_sword_shoes: { id: 'merchant_sword_shoes', name: '轻纹剑靴', slot: 'shoes', level: 1, rarity: 'advanced', classId: 'sword', stats: { hp: 22, moveSpeed: 6, physicalDefense: 12 }, price: 68, icon: '靴' },
    merchant_brawler_shoes: { id: 'merchant_brawler_shoes', name: '踏火拳靴', slot: 'shoes', level: 1, rarity: 'advanced', classId: 'brawler', stats: { hp: 24, moveSpeed: 5, attackSpeed: 2 }, price: 68, icon: '靴' },
};
