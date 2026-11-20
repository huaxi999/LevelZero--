import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read = name => fs.readFileSync(new URL(`../js/${name}`, import.meta.url), 'utf8');
const between = (source, start, end) => {
    const first = source.indexOf(start), last = source.indexOf(end, first + start.length);
    assert.ok(first >= 0 && last > first, `Missing boundaries: ${start}`);
    return source.slice(first, last);
};
const normalEvent = key => ({ key, target: { tagName: 'BODY' }, repeat: false });

function keyboardHarness(name, { mainHidden = false, sectionHidden = false, ancestorHidden = false, pageHidden = false, overlay = '' } = {}) {
    const effects = [], handlers = {};
    const section = { classList: { contains: () => sectionHidden }, closest: () => sectionHidden || ancestorHidden ? {} : null };
    const main = { classList: { contains: () => mainHidden } };
    const context = vm.createContext({
        document: { hidden: pageHidden, getElementById: id => id === 'main-page' ? main : section },
        window: { addEventListener(type, fn) { handlers[type] = fn; } }, canvas: section,
        GAME: { running: true, paused: true, gameOver: false }, BRICK: { running: true, paused: true, gameOver: false },
        planePauseBtn: {}, brickPauseBtn: {}, performance: { now: () => 100 },
        schedulePlaneFrame() { effects.push('plane-resume'); }, scheduleBrickFrame() { effects.push('brick-resume'); },
        updatePlaneModeUI() {}, drawBrickGame() {}, releaseStuckBalls() { effects.push('launch'); },
        useBomb() { effects.push('bomb'); }, useBurst() { effects.push('burst'); },
        keys: name === 'abyss' ? new Set() : {}, brickKeys: {}, fightKeys: {},
        state: {}, locked: false, handleRpsPick(choice) { effects.push(choice); },
        mode: 'dungeon', overlay, paused: true, inventoryMenu: null, active: () => ({}),
        skillKeys: ['H'], unlockSound() {}, registerDirectionTap() {},
        attack() { effects.push('attack'); }, useSkill() { effects.push('skill'); },
        startJump() { effects.push('jump'); }, startDodge() { effects.push('dodge'); }, pickOrInteract() { effects.push('interact'); },
    });
    const typing = between(read('utils.js'), 'export const isTypingTarget = ', 'export const escapeHtml = ').replace('export const ', 'const ');
    vm.runInContext(typing, context);
    const source = read(`${name}.js`);
    if (name === 'abyss') {
        vm.runInContext(between(source, '    const keyDown = ', '    const keyUp = ') + '\nglobalThis.handle=keyDown;', context);
        handlers.keydown = context.handle;
    } else vm.runInContext(between(source, "    window.addEventListener('keydown'", name === 'rps' ? '    updateStatsUI();' : "    window.addEventListener('keyup'"), context);
    return { context, effects, press(key, extra = {}) {
        let prevented = false;
        handlers.keydown({ ...normalEvent(key), ...extra, preventDefault() { prevented = true; } });
        return prevented;
    } };
}

const gameKeys = { plane: 'Escape', brick: 'Escape', fight: '1', rps: '1', abyss: 'j' };
for (const [game, key] of Object.entries(gameKeys)) {
    test(`${game} shortcuts ignore the hidden lobby, inactive section, text editing and IME`, () => {
        const scenarios = [
            { options: { mainHidden: true }, event: { target: { tagName: 'INPUT' } } },
            { options: { mainHidden: true } }, { options: { sectionHidden: true } },
            { options: { ancestorHidden: true } }, { options: { pageHidden: true } },
            ...['INPUT', 'TEXTAREA', 'SELECT'].map(tagName => ({ event: { target: { tagName } } })),
            { event: { target: { tagName: 'SPAN', isContentEditable: true } } },
            { event: { isComposing: true } }, { event: { keyCode: 229 } },
        ];
        for (const scenario of scenarios) {
            const h = keyboardHarness(game, scenario.options);
            assert.equal(h.press(key, scenario.event), false, JSON.stringify(scenario));
            assert.deepEqual(h.effects, []);
            assert.equal(Object.values(h.context.fightKeys).some(Boolean), false);
        }
        const h = keyboardHarness(game);
        h.press(key);
        if (game === 'fight') assert.equal(h.context.fightKeys['1'], true);
        else assert.equal(h.effects.length, 1, 'active gameplay retains its original shortcut');
    });
}

test('Abyss death cannot be dismissed or replaced with a keyboard menu', () => {
    const h = keyboardHarness('abyss', { overlay: 'death' });
    for (const key of ['Escape', 'b', 'c', 'j', 'h', 'e', ' ', 'Shift']) h.press(key);
    assert.equal(h.context.overlay, 'death');
    assert.equal(h.context.paused, true);
    assert.deepEqual(h.effects, []);
});

test('Abyss pause cannot be replaced by inventory and Escape resumes normally', () => {
    const h = keyboardHarness('abyss', { overlay: 'pause' });
    h.press('b'); h.press('b'); h.press('c'); h.press('j');
    assert.equal(h.context.overlay, 'pause');
    assert.equal(h.context.paused, true);
    assert.deepEqual(h.effects, []);
    h.press('Escape');
    assert.equal(h.context.overlay, '');
    assert.equal(h.context.paused, false);
    h.press('j'); assert.deepEqual(h.effects, ['attack']);
});

test('Abyss ordinary menus block combat shortcuts and still close with Escape or B', () => {
    for (const closeKey of ['Escape', 'b']) {
        const h = keyboardHarness('abyss', { overlay: 'inventory' });
        h.context.paused = false;
        for (const key of ['j', 'h', 'e', ' ', 'Shift']) h.press(key);
        assert.deepEqual(h.effects, []);
        h.press(closeKey);
        assert.equal(h.context.overlay, '');
        assert.equal(h.context.paused, false);
    }
});

function overlayHarness(overlay) {
    const hitboxes = [{ label: 'underlying-backpack', action() { throw new Error('background click'); } }];
    const calls = [];
    const context = vm.createContext({
        overlay, paused: true, mode: 'dungeon', hitboxes, W: 1280, H: 720,
        ctx: { fillRect() {} }, active: () => ({}), panel() {}, drawText() {},
        run: { difficulty: { id: 'normal' }, dungeon: { id: 'first', level: 1 } },
        button(label, x, y, w, h, action, disabled) { if (!disabled) hitboxes.push({ label, action }); },
        beginDungeon(...args) { calls.push(args); }, resetPlayer() { calls.push('reset-player'); },
    });
    vm.runInContext(between(read('abyss.js'), '    const drawOverlay = ', '    const drawResult = ') + '\ndrawOverlay();', context);
    return { context, hitboxes, calls };
}

test('Abyss pause and death dialogs remove underlying click targets while retaining recovery actions', () => {
    for (const overlay of ['pause', 'death']) {
        const h = overlayHarness(overlay);
        assert.equal(h.hitboxes.some(hit => hit.label === 'underlying-backpack'), false);
        h.hitboxes.find(hit => hit.label === '返回主城').action();
        assert.equal(h.context.mode, 'town');
        assert.equal(h.context.overlay, '');
        assert.equal(h.context.paused, false);
        assert.deepEqual(h.calls, ['reset-player']);
    }
    const death = overlayHarness('death');
    death.hitboxes.find(hit => hit.label === '重新挑战').action();
    assert.deepEqual(death.calls, [['first', 'normal']]);
    const pause = overlayHarness('pause');
    pause.hitboxes.find(hit => hit.label === '继续').action();
    assert.equal(pause.context.paused, false);
    assert.equal(pause.context.overlay, '');
});

test('Fight native start enters combat while restart and continue retain the character selection flow', () => {
    const source = read('fight.js'), buttons = {};
    const button = id => buttons[id] ||= { classList: { add() {}, remove() {} }, addEventListener(type, fn) { this[type] = fn; } };
    const context = vm.createContext({
        FIGHT: { selectedP1: 'flame', selectedP2: 'hancheying' }, FIGHT_ROUND_TIME: 120,
        fightKeys: {}, fightAnimId: 0, performance: { now: () => 10 }, requestAnimationFrame: () => 1,
        cancelAnimationFrame() {}, loopFight() {}, fightSetup: null,
        createFightPlayer: (_side, id) => ({ id, hp: 200 }), chooseFightBackground: () => 'bg1',
        invalidateFightBackgroundCache() {}, syncFightVirtualControls() {}, drawFightGame() {},
        fightP1Hp: {}, fightP2Hp: {}, fightRoundEl: {}, fightTimeEl: {},
        fightStartBtn: button('start'), fightRestartBtn: button('restart'), fightPauseBtn: button('pause'),
        fightContinueBtn: button('continue'), fightHomeBtn: button('home'),
    });
    vm.runInContext(between(source, '    const resetFightGame = ', '    const clampFight01 = ')
        + between(source, '    const openFightSetupScreen = ', '    const updateFightGame = ')
        + between(source, "    fightStartBtn.addEventListener('click'", "    fightHomeBtn?.addEventListener('click'"), context);
    buttons.start.click();
    assert.equal(context.FIGHT.running, true);
    assert.equal(context.FIGHT.countdown, 1050);
    assert.equal(context.FIGHT.p1.id, 'flame');
    buttons.restart.click(); assert.equal(context.FIGHT.running, false);
    buttons.start.click(); assert.equal(context.FIGHT.running, true);
    context.FIGHT.gameOver = true;
    buttons.continue.click();
    assert.equal(context.FIGHT.running, false);
    assert.equal(context.FIGHT.gameOver, false);
});

function brickResizeHarness(state = {}) {
    const source = read('brick.js'), transforms = [];
    const canvas = { parentElement: { clientWidth: 500 }, style: {}, getBoundingClientRect() {
        return { left: 20, top: 40, width: parseFloat(this.style.width), height: parseFloat(this.style.height) };
    } };
    const context = vm.createContext({
        BRICK: { running: true, width: 900, height: 844, ...state }, brickCanvas: canvas,
        brickCtx: { setTransform(...args) { transforms.push(args); } }, brickBackgroundCache: {},
        brickPaddle: { x: 450, y: 790, w: 164 }, brickPointer: {},
        window: { innerWidth: 1000, innerHeight: 900, devicePixelRatio: 2 },
    });
    vm.runInContext(between(source, '    const resizeBrickCanvas = ', '    const hashBrick = ')
        + between(source, '    const updateBrickPointer = ', "    brickCanvas.addEventListener('pointerdown'")
        + '\nglobalThis.api={resizeBrickCanvas,updateBrickPointer,getBrickCanvasPoint,getUpgradeChoiceAtPoint};', context);
    return { context, canvas, transforms, api: context.api };
}

test('Brick shrinking a running, paused or upgrade screen keeps all existing logical coordinates reachable', () => {
    for (const state of [{}, { paused: true }, { upgradePending: true }, { running: false, gameOver: true }]) {
        const h = brickResizeHarness(state);
        h.api.resizeBrickCanvas();
        assert.equal(h.context.BRICK.width, 900);
        assert.equal(h.context.BRICK.height, 844);
        assert.equal(h.canvas.style.width, '490px');
        assert.equal(h.context.brickPaddle.x, 450);
        const [sx, , , sy] = h.transforms.at(-1);
        assert.equal(sx, 2 * 490 / 900);
        assert.equal(sy, 2 * 459 / 844);
        assert.ok((778 + 84) * sx <= h.canvas.width, 'a far-right existing brick remains on the displayed canvas');
        h.canvas.parentElement.clientWidth = 1000;
        h.api.resizeBrickCanvas();
        assert.equal(h.context.BRICK.width, 900);
        assert.equal(h.context.BRICK.height, 844);
    }
});

test('Brick pointer movement and upgrade selection map resized display pixels back to the logical board', () => {
    const h = brickResizeHarness(); h.api.resizeBrickCanvas();
    const rect = h.canvas.getBoundingClientRect();
    const screenEvent = (x, y) => ({ clientX: rect.left + x / 900 * rect.width, clientY: rect.top + y / 844 * rect.height });
    h.api.updateBrickPointer(screenEvent(600, 700));
    assert.equal(h.context.brickPointer.x, 600);
    h.context.BRICK.upgradePending = true;
    const point = h.api.getBrickCanvasPoint(screenEvent(140, 400));
    assert.ok(Math.abs(point.x - 140) < .0001);
    assert.ok(Math.abs(point.y - 400) < .0001);
    assert.equal(h.api.getUpgradeChoiceAtPoint(point), 0);
    h.context.BRICK.paused = true;
    h.api.updateBrickPointer(screenEvent(300, 700));
    assert.equal(h.context.brickPointer.x, 600, 'paused pointer input remains inactive');
});

test('Brick initial resize establishes finite board dimensions before a run', () => {
    const h = brickResizeHarness({ running: false, width: 0, height: 0 });
    h.api.resizeBrickCanvas();
    assert.equal(h.context.BRICK.width, 490);
    assert.equal(h.context.BRICK.height, 459);
    assert.deepEqual(h.transforms[0], [2, 0, 0, 2, 0, 0]);
});

function brickLayoutHarness(level, random) {
    const source = read('brick.js');
    const context = vm.createContext({
        BRICK: { width: 900, height: 844, level }, brickBricks: [], brickRunUpgrades: {},
        performance: { now: () => 1 }, Math: Object.assign(Object.create(Math), { random }),
    });
    vm.runInContext(between(source, '    const getSpecialBrickKind = ', '    const resizeBrickCanvas = ')
        + between(source, '    const hashBrick = ', '    const getPaddleScale = ')
        + between(source, '    const shouldKeepBrick = ', '    function spawnBrickBall') + '\ncreateBrickLayout();', context);
    return context;
}

test('Brick level 3 random holes cannot leave a phantom key count', () => {
    let draw = 0;
    const h = brickLayoutHarness(3, () => draw++ % 2 === 0 ? 1.25 / 6 : 6.25 / 9);
    assert.equal(h.brickBricks.filter(brick => brick.kind === 'key').length, 1);
    assert.equal(h.BRICK.activeKeys, 1);
    assert.equal(h.brickBricks.filter(brick => brick.locked).length, 3);
});

test('Brick final layouts retain a valid key for every locked board across 100 levels and varied random holes', () => {
    for (let level = 1; level <= 100; level++) {
        for (let sample = 1; sample <= 4; sample++) {
            let seed = level * 100 + sample;
            const h = brickLayoutHarness(level, () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; });
            const keys = h.brickBricks.filter(brick => brick.kind === 'key');
            assert.equal(h.BRICK.activeKeys, keys.length, `level ${level}, sample ${sample}`);
            if (h.brickBricks.some(brick => brick.locked)) assert.ok(keys.length > 0, `locked level ${level} needs a key`);
            for (const key of keys) {
                assert.equal(key.locked, false);
                assert.equal(key.shield, false);
            }
        }
    }
});
