import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read = (name) => fs.readFileSync(new URL(`../js/${name}`, import.meta.url), 'utf8');
const between = (source, start, end) => {
    const a = source.indexOf(start);
    const b = source.indexOf(end, a + start.length);
    assert.ok(a >= 0 && b > a, `Missing code boundaries: ${start}`);
    return source.slice(a, b);
};

function createRps() {
    const elements = new Map();
    const timers = [];
    const el = (id) => {
        if (!elements.has(id)) elements.set(id, {
            textContent: '', innerHTML: '', className: '', disabled: false, dataset: {},
            classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
            listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; },
            querySelectorAll() { return []; }, querySelector() { return null; },
            setAttribute() {}, focus() {}, scrollIntoView() {},
        });
        return elements.get(id);
    };
    const buttons = ['rock', 'paper', 'scissors'].map((choice) => {
        const button = el(`pick-${choice}`);
        button.dataset.choice = choice;
        return button;
    });
    const context = vm.createContext({
        document: { getElementById: el, querySelector: el },
        window: {
            setTimeout(fn, ms) { const timer = { fn, ms, cancelled: false }; timers.push(timer); return timer; },
            clearTimeout(timer) { timer.cancelled = true; },
            addEventListener() {}, dispatchEvent() {},
        },
        Math: Object.assign(Object.create(Math), { random: () => 0 }),
        CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init.detail; } },
    });
    vm.runInContext(read('rps.js').replace('export const initRpsGame', 'globalThis.initRpsGame'), context);
    const args = { rpsButtons: buttons, getStoredStats: () => ({ wins: 0, losses: 0, draws: 0 }), setStoredStats() {} };
    for (const name of ['computerChoiceDisplay', 'playerChoiceDisplay', 'rpsResult', 'rpsResultText', 'winsEl', 'lossesEl', 'drawsEl', 'resetStatsBtn']) args[name] = el(name);
    const game = context.initRpsGame(args);
    return {
        game, el, buttons,
        pick(choice) { el(`pick-${choice}`).listeners.click(); return timers.filter((timer) => timer.ms === 420).at(-1); },
        restart() { args.resetStatsBtn.listeners.click(); },
    };
}

for (const choice of ['scissors', 'paper']) {
    test(`RPS restarting cancels the previous ${choice === 'paper' ? 'winning' : 'losing'} pick`, () => {
        const { pick, restart, el, buttons } = createRps();
        const pending = pick(choice);
        restart();
        assert.equal(pending.cancelled, true);
        pending.fn();
        assert.equal(el('rps-hearts').textContent, '♥♥');
        assert.equal(el('rps-score').textContent, '0');
        assert.ok(buttons.every((button) => !button.disabled));
    });
}

test('RPS stale callbacks cannot unlock or overwrite a new pending pick', () => {
    const { pick, restart, el, buttons } = createRps();
    const oldPick = pick('paper');
    restart();
    const currentPick = pick('scissors');
    oldPick.fn();
    assert.ok(buttons.every((button) => button.disabled));
    currentPick.fn();
    assert.equal(el('rps-hearts').textContent, '♥');
    assert.equal(el('rps-score').textContent, '0');
    assert.ok(buttons.every((button) => !button.disabled));
});

test('RPS pause abandons only the pending pick and preserves settled hearts', () => {
    const { game, pick, el, buttons } = createRps();
    pick('scissors').fn();
    const pending = pick('scissors');
    game.pause();
    assert.equal(pending.cancelled, true);
    pending.fn();
    assert.equal(el('rps-hearts').textContent, '♥');
    assert.ok(buttons.every((button) => !button.disabled));
    pick('rock').fn();
    assert.equal(el('rps-hearts').textContent, '♥');
});

function planeHit(enemySpecs) {
    const source = read('plane.js');
    const splash = between(source, '    const applyPlaneSplashDamage = ', '    const triggerPlaneMagicChain = ');
    const collision = between(source, '        for (let i = bullets.length - 1; i >= 0; i -= 1) {', '        if (GAME.boss) {');
    const tallies = { score: 0, kills: [], drops: 0 };
    const enemies = enemySpecs.map((enemy) => ({ x: 0, y: 0, w: 10, h: 10, scoreValue: 10, ...enemy }));
    const bullets = [{ x: 0, y: 0, explosionRadius: 50 }];
    const context = vm.createContext({
        enemies, bullets, GAME: {}, player: {}, buildStats: {},
        rectHit: (_bullet, enemy) => enemy.id === 'primary', getBulletRect: () => ({}), getCenteredHitRect: (enemy) => enemy,
        getPlaneBulletDamage: () => 2,
        consumePlaneBulletHit: (_bullet, index) => bullets.splice(index, 1),
        triggerPlaneMagicChain() {}, triggerShake() {}, addExplosionParticles() {},
        addPlaneScore(value) { tallies.score += value; },
        dropRandomPowerUp() { tallies.drops++; },
        recordPlaneEnemyKill(enemy) { tallies.kills.push(enemy.id); },
        triggerPlaneKillBuildEffects() {}, requestPlaneHudUpdate() {},
    });
    vm.runInContext(`${splash}\n${collision}`, context);
    return { enemies, tallies };
}

test('Plane explosive direct hit awards each defeated enemy exactly once', () => {
    const { enemies, tallies } = planeHit([{ id: 'primary', hp: 1 }]);
    assert.equal(enemies.length, 0);
    assert.deepEqual(tallies, { score: 10, kills: ['primary'], drops: 1 });
});

for (const primaryFirst of [true, false]) {
    test(`Plane collateral removals preserve nearby live enemies (primary ${primaryFirst ? 'first' : 'last'})`, () => {
        const primary = { id: 'primary', hp: 1 };
        const rest = [{ id: 'survivor', hp: 20 }, { id: 'collateral', hp: 1 }];
        const { enemies, tallies } = planeHit(primaryFirst ? [primary, ...rest] : [...rest, primary]);
        assert.deepEqual(enemies.map((enemy) => enemy.id), ['survivor']);
        assert.equal(enemies[0].hp, 19);
        assert.equal(tallies.score, 20);
        assert.equal(tallies.drops, 2);
        assert.deepEqual(tallies.kills.sort(), ['collateral', 'primary']);
    });
}

test('Plane explosive hit keeps a living primary target while settling collateral', () => {
    const { enemies, tallies } = planeHit([{ id: 'collateral', hp: 1 }, { id: 'primary', hp: 10 }]);
    assert.deepEqual(enemies.map((enemy) => [enemy.id, enemy.hp]), [['primary', 8]]);
    assert.deepEqual(tallies, { score: 10, kills: ['collateral'], drops: 1 });
});

function skillContext(hero) {
    const source = read('abyss.js');
    const ensure = between(source, '    const ensureSkills = ', '    const skillLevel = ');
    const level = between(source, '    const skillLevel = ', '    const skillValues = ');
    const reset = between(source, '    const resetSkills = ', '    const commit = ');
    const context = vm.createContext({ hero, active: () => hero, commit() {} });
    vm.runInContext(read('abyss-data.js').replaceAll('export const ', 'const '), context);
    vm.runInContext(`const skillsFor = () => ABYSS_SKILL_CATALOG[hero.classId];\n${ensure}\n${level}\n${reset}`, context);
    return context;
}

test('Abyss reset skills unlock at the required level without spending another point', () => {
    const hero = { classId: 'sword', level: 1, gold: 1000, skillProgressionVersion: 2, skillPoints: 0, skills: { sword_h: 3 } };
    const context = skillContext(hero);
    vm.runInContext('resetSkills();', context);
    assert.equal(hero.skills.sword_k, 0);
    assert.equal(hero.skillPoints, 2);
    vm.runInContext('hero.level=5; ensureSkills(); ensureSkills();', context);
    assert.equal(hero.skills.sword_k, 1);
    assert.equal(hero.skills.sword_l, 0);
    assert.equal(hero.skillPoints, 2);
    hero.skills.sword_k = 4;
    vm.runInContext('ensureSkills();', context);
    assert.equal(hero.skills.sword_k, 4);
});

test('Abyss skill migration can unlock a previously stored zero rank', () => {
    const hero = { classId: 'brawler', level: 1, gold: 1000, skillPoints: 0, skills: {} };
    const context = skillContext(hero);
    vm.runInContext('ensureSkills(); hero.level=5; ensureSkills();', context);
    assert.equal(hero.skills.brawler_k, 1);
});

test('Abyss purchase control has a valid hit area and respects insufficient funds', () => {
    const source = read('abyss.js');
    const button = between(source, '    const button = ', '    const drawQuickActions = ');
    const call = source.match(/button\(`\$\{item\.price\} 金币购买`[^;]+/)[0];
    for (const gold of [100, 0]) {
        const hitboxes = [];
        const purchases = [];
        const context = vm.createContext({
            hitboxes, ctx: { fillRect() {}, strokeRect() {} }, drawText() {},
            item: { price: 10 }, hero: { gold }, index: 0, id: 'shop-item', buy(id) { purchases.push(id); },
        });
        vm.runInContext(`${button}\n${call};`, context);
        if (gold === 0) assert.equal(hitboxes.length, 0);
        else {
            const hit = hitboxes.find((entry) => 300 >= entry.x && 300 <= entry.x + entry.width && 350 >= entry.y && 350 <= entry.y + entry.height);
            assert.ok(hit);
            hit.action();
            assert.deepEqual(purchases, ['shop-item']);
        }
    }
});

function storageContext(initialSave) {
    let raw = initialSave ? JSON.stringify(initialSave) : null;
    const context = vm.createContext({ localStorage: { setItem(_key, value) { raw = value; }, getItem() { return raw; } } });
    vm.runInContext(read('abyss-storage.js').replaceAll('export const ', 'const ') + ';globalThis.api={getAbyssSave,setAbyssSave};', context);
    return context;
}
const abyssSave = (version, item) => ({ version, activeId: 'hero', characters: { hero: { id: 'hero', classId: 'sword', level: 1, inventory: [item], warehouse: [{ ...item, id: 'warehouse-item' }] } } });

test('Abyss current low-quality gear retains fractional percentage attack speed through saves', () => {
    const context = storageContext();
    vm.runInContext(read('abyss-data.js').replaceAll('export const ', 'const ') + ';globalThis.loot=ABYSS_RARITY_LOOT;', context);
    const template = context.loot.common.find((item) => item.stats.attackSpeed === 3);
    const item = { ...template, grade: 'lowest', quality: 0.33, stats: Object.fromEntries(Object.entries(template.stats).map(([key, value]) => [key, Number((value * 0.33).toFixed(2))])) };
    let save = abyssSave(4, item);
    for (let i = 0; i < 3; i++) {
        save = context.api.setAbyssSave(save);
        save = context.api.getAbyssSave();
        assert.equal(save.characters.hero.inventory[0].stats.attackSpeed, 0.99);
        assert.equal(save.characters.hero.warehouse[0].stats.attackSpeed, 0.99);
    }
});

for (const version of [1, 2, 3]) {
    test(`Abyss legacy v${version} fractional attack speed converts once even when result remains below 1`, () => {
        const item = { id: 'old-item', slot: 'weapon', stats: { attack: 8, crit: 2, attackSpeed: 0.005 } };
        const context = storageContext(abyssSave(version, item));
        let save = context.api.getAbyssSave();
        assert.equal(save.version, 4);
        for (let i = 0; i < 3; i++) {
            save = context.api.setAbyssSave(save);
            save = context.api.getAbyssSave();
            assert.equal(save.characters.hero.inventory[0].stats.attackSpeed, 0.5);
            assert.equal(save.characters.hero.warehouse[0].stats.attackSpeed, 0.5);
            assert.equal(save.characters.hero.inventory[0].stats.physicalAttack, 8);
        }
    });
}

test('Abyss importing an old save normalizes its version and is idempotent', () => {
    const context = storageContext();
    let save = context.api.setAbyssSave(abyssSave(1, { id: 'old', slot: 'weapon', stats: { attackSpeed: 0.05 } }));
    save = context.api.setAbyssSave(save);
    assert.equal(save.version, 4);
    assert.equal(save.characters.hero.inventory[0].stats.attackSpeed, 5);
});

test('Action game loss-of-focus handlers clear keyboard and pointer inputs', () => {
    const configurations = [
        ['plane.js', '    const clearPlaneInputs = ', '    let planeAnimId', { keys: { ArrowLeft: true, Space: true }, pointerControl: { active: true } }, (c) => !c.keys.ArrowLeft && !c.keys.Space && !c.pointerControl.active],
        ['brick.js', '    const clearBrickInputs = ', "    window.addEventListener('blur'", { brickKeys: { Left: true, Right: true }, brickPointer: { active: true }, brickTouchLeftBtn: null, brickTouchRightBtn: null }, (c) => !c.brickKeys.Left && !c.brickKeys.Right && !c.brickPointer.active],
        ['fight.js', '    const clearFightVirtualInputs = ', '    const syncFightVirtualControls = ', { fightKeys: { a: true, j: true }, fightVirtualPointers: new Map([[1, 'ArrowRight']]), fightVirtualControls: null }, (c) => !c.fightKeys.a && !c.fightKeys.j && !c.fightVirtualPointers.size],
        ['abyss.js', '    const clearAbyssInputs = ', '    const syncAbyssVirtualControls = ', { keys: new Set(['A']), touchPointers: new Map([[1, 'D']]), clearAbyssVirtualMovement() {}, cancelSprint() {} }, (c) => !c.keys.size && !c.touchPointers.size],
    ];
    for (const [file, start, end, inputs, cleared] of configurations) {
        const source = read(file);
        const handlers = {};
        const context = vm.createContext({ ...inputs, window: { addEventListener(type, fn) { handlers[type] = fn; } }, document: { hidden: true, addEventListener(type, fn) { handlers[type] = fn; } } });
        const handlerName = start.match(/const (\w+)/)[1];
        const blurStart = `    window.addEventListener('blur', ${handlerName});`;
        const bindings = source.slice(source.indexOf(blurStart), source.indexOf('    });', source.indexOf(blurStart)) + 7);
        vm.runInContext(`${between(source, start, end)}\n${bindings}`, context);
        assert.equal(typeof handlers.blur, 'function', file);
        assert.equal(typeof handlers.visibilitychange, 'function', file);
        handlers.blur();
        handlers.visibilitychange();
        assert.ok(cleared(context), file);
    }
});
