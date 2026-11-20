export const initFightGame = ({ showSection }) => {
    const FIGHT_WIDTH = 960;
    const FIGHT_HEIGHT = 600;
    const FIGHT_CENTER_X = FIGHT_WIDTH / 2;
    const FIGHT_LEFT_BOUND = 58;
    const FIGHT_RIGHT_BOUND = FIGHT_WIDTH - 58;
    const FIGHT_FLOOR = 470;
    const FIGHT_GRAVITY = 2100;
    const FIGHT_ROUND_TIME = 120;
    const FIGHT_MAX_POWER = 100;
    const FIGHT_KNOCKDOWN_MAX = 100;
    const FIGHT_KNOCKDOWN_DECAY = 16;
    const FIGHT_SPECIAL_POWER_COST = FIGHT_MAX_POWER * 0.04;
    const FIGHT_ATTACKS = {
        lightPunch: { label: '轻拳', damage: 5, blockDamage: 1, range: 66, high: 66, startup: 42, active: 48, recovery: 112, hitstun: 190, knockback: 108, power: 7, hitstop: 52, cancelLevel: 1 },
        heavyPunch: { label: '重拳', damage: 11, blockDamage: 2, range: 94, high: 78, startup: 106, active: 58, recovery: 262, hitstun: 330, knockback: 220, power: 12, hitstop: 74, cancelLevel: 2, slide: 72 },
        lightKick: { label: '轻腿', damage: 7, blockDamage: 1, range: 84, high: 48, startup: 58, active: 56, recovery: 148, hitstun: 220, knockback: 148, power: 8, hitstop: 58, low: true, cancelLevel: 1 },
        heavyKick: { label: '重腿', damage: 11, blockDamage: 3, range: 112, high: 88, startup: 131, active: 75, recovery: 315, hitstun: 380, knockback: 248, power: 14, hitstop: 82, cancelLevel: 2, slide: 86 },
        special: { label: '气功波', damage: 6, blockDamage: 1, range: 0, startup: 142, active: 70, recovery: 360, hitstun: 230, knockback: 132, power: 5, cost: FIGHT_SPECIAL_POWER_COST, hitstop: 54, projectile: true, cancelLevel: 3 },
        super: { label: '超必杀', damage: 28, blockDamage: 7, range: 188, high: 112, startup: 166, active: 92, recovery: 390, hitstun: 660, knockback: 350, power: 0, cost: FIGHT_MAX_POWER, hitstop: 112, super: true, cancelLevel: 4, slide: 150 },
    };
    const FIGHT_REPEAT_DAMAGE_TYPES = new Set(['lightPunch', 'heavyPunch', 'lightKick', 'heavyKick', 'special']);
    Object.assign(FIGHT_ATTACKS.lightPunch, { range: 70, high: 68, startup: 36, active: 52, recovery: 92, hitstun: 205, knockback: 116, hitstop: 58 });
    Object.assign(FIGHT_ATTACKS.heavyPunch, { range: 102, high: 82, startup: 96, active: 64, recovery: 224, hitstun: 350, knockback: 235, hitstop: 88, slide: 84 });
    Object.assign(FIGHT_ATTACKS.lightKick, { range: 90, high: 50, startup: 52, active: 60, recovery: 126, hitstun: 240, knockback: 160, hitstop: 64 });
    Object.assign(FIGHT_ATTACKS.heavyKick, { range: 120, high: 92, startup: 118, active: 80, recovery: 270, hitstun: 405, knockback: 266, hitstop: 94, slide: 96 });
    Object.assign(FIGHT_ATTACKS.special, { startup: 128, active: 74, recovery: 320, hitstun: 250, knockback: 146, power: 6, hitstop: 62 });
    Object.assign(FIGHT_ATTACKS.super, { range: 204, high: 118, startup: 150, active: 104, recovery: 350, hitstun: 700, knockback: 380, hitstop: 126, slide: 170 });
    const FIGHT_CANCEL_ROUTES = {
        lightPunch: ['heavyPunch', 'lightKick', 'special', 'super'],
        lightKick: ['heavyPunch', 'heavyKick', 'special', 'super'],
        heavyPunch: ['special', 'super'],
        heavyKick: ['special', 'super'],
        special: ['super'],
    };
    const FIGHT_SUPER_DAMAGE = {
        blast: 28,
        rush: 29,
        quake: 29,
        beam: 28,
        swordDance: 29,
    };
    const FIGHT_MELEE_SUPER_TYPES = new Set(['rush', 'swordDance']);
    const FIGHT_SUPER_BLOCK_DAMAGE = 7;
    const isFightSuperActive = (player) => player?.attackType === 'super' && player.attackTimer > 0;
    const FIGHT_P1_COLOR = '#ff5a43';
    const FIGHT_P1_ACCENT = '#ff6b4a';
    const FIGHT_P2_COLOR = '#34d4ff';

    const FIGHTERS = [
        {
            id: 'flame',
            name: '炎狱魔神',
            title: '格斗家 · 炼狱重拳',
            desc: '熔岩护甲与重拳爆发并重，低血量时压迫感更强。',
            maxHp: 237,
            speed: 255,
            jump: 760,
            damageScale: 1,
            powerScale: 1,
            trait: 'flame',
            traitName: '魔焰爆发',
            special: '炼狱气功',
            superName: '魔焰冲锋',
            superType: 'rush',
            palette: { suit: '#2fc7ff', dark: '#0f5b80', skin: '#f6c48d', hair: '#2a1a10', glove: '#fff1a8', trim: '#ecfaff' },
        },
        {
            id: 'hancheying',
            name: '寒澈影',
            title: '剑士 · 寒影牵制',
            desc: '命中后降低对手速度，适合以寒气压制节奏。',
            maxHp: 243,
            speed: 246,
            jump: 750,
            damageScale: 0.98,
            powerScale: 1.02,
            trait: 'frost',
            traitName: '寒霜迟滞',
            special: '霜晶波',
            superName: '寒冰剑舞',
            superType: 'swordDance',
            palette: { suit: '#7ed7ff', dark: '#235c78', skin: '#f2c08b', hair: '#1f2e40', glove: '#e9fbff', trim: '#b8f2ff' },
        },
    ];

    const FIGHT_BACKGROUNDS = [
        { id: 'random', name: '随机', file: '' },
        { id: 'bg1', name: '傍晚', file: 'assets/fighters/background/fighterbackground1-bangwan.png' },
        { id: 'bg2', name: '中午', file: 'assets/fighters/background/fighterbackground2-zhongwu.png' },
        { id: 'bg3', name: '早晨', file: 'assets/fighters/background/fighterbackground3-zaochen.png' },
        { id: 'bg4', name: '上午', file: 'assets/fighters/background/fighterbackground4-shangwu.png' },
        { id: 'bg5', name: '下午', file: 'assets/fighters/background/fighterbackground5-xiawu.png' },
        { id: 'bg6', name: '晚上', file: 'assets/fighters/background/fighterbackground6-wanshang.png' },
        { id: 'bg7', name: '半上午', file: 'assets/fighters/background/fighterbackground7-banshangwu.png' },
        { id: 'bg8', name: '黄昏', file: 'assets/fighters/background/fighterbackground8-huanghun.png' },
        { id: 'bg9', name: '清晨', file: 'assets/fighters/background/fighterbackground9-qingchen.png' },
        { id: 'bg10', name: '永昼', file: 'assets/fighters/background/fighterbackground10-yongzhou.png' },
    ];

    let fightDrawReady = false;
    let fightRenderQueued = false;
    let fightBackgroundCache = null;
    const invalidateFightBackgroundCache = () => {
        fightBackgroundCache = null;
    };
    const requestFightRender = () => {
        if (fightRenderQueued) return;
        fightRenderQueued = true;
        requestAnimationFrame((now) => {
            fightRenderQueued = false;
            if (fightDrawReady && (!FIGHT.running || FIGHT.paused)) drawFightGame(now);
        });
    };

    const fightBgImages = new Map();
    FIGHT_BACKGROUNDS.filter(bg => bg.file).forEach((bg) => {
        const img = new Image();
        img.src = bg.file;
        img.onload = () => {
            invalidateFightBackgroundCache();
            requestFightRender();
        };
        fightBgImages.set(bg.id, img);
    });

    const FIGHT_SPRITE_SETS = {
        flame: {
            basePath: 'assets/fighters/heroes/FlameDemonGod/',
            actions: {
                idle: { file: 'standby.png', frames: 8, fps: 7, frameW: 256, frameH: 256, scale: 0.86, footY: 240 },
                walk: { file: 'walk.png', frames: 8, fps: 10, frameW: 256, frameH: 256, scale: 1.08, footY: 216 },
                jump: { file: 'jump.png', frames: 6, fps: 10, frameW: 256, frameH: 256, scale: 0.87, footY: 237 },
                crouch: { file: 'crouch.png', frames: 3, fps: 7, frameW: 256, frameH: 256, scale: 0.84, footY: 240 },
                guard: { file: 'guard.png', frames: 3, fps: 8, frameW: 256, frameH: 256, scale: 0.84, footY: 240 },
                hurt: { file: 'hurt.png', frames: 4, fps: 12, frameW: 256, frameH: 256, scale: 0.85, footY: 240 },
                knockdown: { file: 'knockdown.png', frames: 7, fps: 10, frameW: 256, frameH: 256, scale: 0.86, footY: 240, duration: 900 },
                getup: { file: 'getup.png', frames: 6, fps: 10, frameW: 256, frameH: 256, scale: 0.86, footY: 240, duration: 420 },
                lose: { file: 'lose.png', frames: 6, fps: 8, frameW: 256, frameH: 256, scale: 0.86, footY: 240, duration: 900 },
                win: { file: 'win.png', frames: 6, fps: 8, frameW: 256, frameH: 256, scale: 1, footY: 241 },
                lightPunch: { file: 'lightpunch.png', frames: 6, fps: 14, frameW: 256, frameH: 256, scale: 1.04, footY: 208 },
                heavyPunch: { file: 'heavypunch.png', frames: 8, fps: 13, frameW: 256, frameH: 256, scale: 1.24, footY: 215 },
                lightKick: { file: 'lightkick.png', frames: 6, fps: 13, frameW: 503, frameH: 503, scale: 0.56, footY: 446 },
                heavyKick: { file: 'heavykick.png', frames: 6, fps: 11, frameW: 256, frameH: 256, scale: 1.05, footY: 216 },
                specialCharge: { file: 'qigongxuli.png', frames: 8, fps: 12, frameW: 256, frameH: 256, scale: 1.1, footY: 217 },
                super: { file: 'superskill.png', frames: 12, fps: 16, frameW: 256, frameH: 256, scale: 1.5, footY: 222 },
            },
            projectiles: {
                qigong: { file: 'qigong.png', frames: 4, fps: 14, frameW: 256, frameH: 256, scale: 0.38 },
            },
            effects: {
                shield: { file: 'sheild.png', frames: 3, fps: 12, frameW: 256, frameH: 256, scale: 0.88, footY: 252 },
            },
            portraits: {
                lihui: { file: 'lihui.png' },
                icon: { file: 'icon.png' },
            },
        },
        hancheying: {
            basePath: 'assets/fighters/heroes/hancheying/',
            actions: {
                idle: { file: 'standby.png', frames: 8, fps: 7, frameW: 256, frameH: 256, scale: 0.86, footY: 240 },
                walk: { file: 'walk.png', frames: 10, fps: 10, frameW: 256, frameH: 256, scale: 0.87, footY: 240 },
                jump: { file: 'jump.png', frames: 8, fps: 9, frameW: 256, frameH: 256, scale: 1.06, footY: 239, offsetX: 14 },
                crouch: { file: 'crouch.png', frames: 4, fps: 9, frameW: 256, frameH: 256, scale: 0.86, footY: 240 },
                guard: { file: 'guard.png', frames: 4, fps: 10, frameW: 256, frameH: 256, scale: 0.86, footY: 240 },
                hurt: { file: 'hurt.png', frames: 6, fps: 12, frameW: 256, frameH: 256, scale: 0.9, footY: 241 },
                knockdown: { file: 'knockdown.png', frames: 10, fps: 11, frameW: 256, frameH: 256, scale: 1.08, footY: 238, duration: 900 },
                getup: { file: 'getup.png', frames: 8, fps: 11, frameW: 256, frameH: 256, scale: 0.86, footY: 240, duration: 420 },
                lose: { file: 'lose.png', frames: 8, fps: 8, frameW: 256, frameH: 256, scale: 0.86, footY: 240, duration: 900 },
                win: { file: 'win.png', frames: 10, fps: 8, frameW: 256, frameH: 256, scale: 0.86, footY: 240 },
                lightPunch: { file: 'lightattack.png', frames: 10, fps: 14, frameW: 256, frameH: 256, scale: 0.94, footY: 241, frameWeights: [1, 1, 1.2, 2.2, 2.6, 2.2, 1.45, 1, 0.9, 0.9] },
                heavyPunch: { file: 'lightattack.png', frames: 10, fps: 12, frameW: 256, frameH: 256, scale: 0.94, footY: 241, frameWeights: [1.1, 1.1, 1.35, 2.35, 2.8, 2.35, 1.65, 1.15, 1, 1] },
                lightKick: { file: 'lightkick.png', frames: 10, fps: 13, frameW: 256, frameH: 256, scale: 0.91, footY: 240 },
                heavyKick: { file: 'heavykick.png', frames: 11, fps: 12, frameW: 256, frameH: 256, scale: 0.91, footY: 240 },
                specialCharge: { file: 'shootqigong.png', frames: 8, fps: 13, frameW: 256, frameH: 256, scale: 1.08, footY: 241 },
                super: { file: 'superskill.png', frames: 12, fps: 16, frameW: 256, frameH: 256, scale: 1.48, footY: 230 },
            },
            projectiles: {
                qigong: { file: 'qigong.png', frames: 4, fps: 14, frameW: 256, frameH: 256, scale: 0.32 },
            },
            effects: {
                shield: { file: 'sheild.png', frames: 6, fps: 12, frameW: 256, frameH: 256, scale: 0.86, footY: 240 },
            },
            portraits: {
                lihui: { file: 'lihui.png' },
                hidden: { file: 'yincanglihui.png' },
            },
        },
    };

    const fightSpriteImages = new Map();
    Object.entries(FIGHT_SPRITE_SETS).forEach(([fighterId, set]) => {
        Object.entries(set.actions).forEach(([actionId, action]) => {
            const img = new Image();
            img.src = `${set.basePath}${action.file}`;
            img.onload = requestFightRender;
            fightSpriteImages.set(`${fighterId}:${actionId}`, img);
        });
        Object.entries(set.projectiles || {}).forEach(([projectileId, projectile]) => {
            const img = new Image();
            img.src = `${set.basePath}${projectile.file}`;
            img.onload = requestFightRender;
            fightSpriteImages.set(`${fighterId}:projectile:${projectileId}`, img);
        });
        Object.entries(set.effects || {}).forEach(([effectId, effect]) => {
            const img = new Image();
            img.src = `${set.basePath}${effect.file}`;
            img.onload = requestFightRender;
            fightSpriteImages.set(`${fighterId}:effect:${effectId}`, img);
        });
        Object.entries(set.portraits || {}).forEach(([portraitId, portrait]) => {
            const img = new Image();
            img.src = `${set.basePath}${portrait.file}`;
            img.onload = requestFightRender;
            fightSpriteImages.set(`${fighterId}:portrait:${portraitId}`, img);
        });
    });

    const FIGHT_UI_BASE_PATH = 'assets/fighters/ui/';
    const FIGHT_UI_SPRITES = {
        round: { file: 'round.png' },
        roundNumbers: { file: '123.png', slices: 3 },
        digits: { file: 'normalnumber0-9.png', slices: 10, digitSheet: true },
        battleDigits: { file: 'battlenumber0-9.png', slices: 10, digitSheet: true },
        fight: { file: 'fight.png' },
        ko: { file: 'ko.png' },
        start: { file: 'start.png' },
        hit: { file: 'hit.png' },
        combo: { file: 'combo.png' },
        bomb: { file: 'bomb.png' },
        timeup: { file: 'timeup.png' },
        win: { file: 'win.png' },
        lose: { file: 'lose.png' },
        perfect: { file: 'perfect.png' },
        draw: { file: 'draw.png' },
        p1: { file: 'p1.png' },
        p2: { file: 'p2.png' },
        healthbarRed: { file: 'healthbar-red.png' },
        healthbarBlue: { file: 'healthbar-blue.png' },
        healthbarRedLarge: { file: 'red-xuetiao.png' },
        healthbarBlueLarge: { file: 'blue-xuetiao.png' },
        ragebarFull: { file: 'ragebar-full.png' },
        angerPower: { file: 'angerpower.png' },
        timerFrame: { file: 'timer-frame.png' },
        countdownPanel: { file: 'daojishi-background.png' },
        ready: { file: 'ready.png' },
        danger: { file: 'danger.png' },
        warning: { file: 'warning.png' },
        skill: { file: 'skill.png' },
        super: { file: 'super.png' },
        max: { file: 'MAX.png' },
        vs: { file: 'vs.png' },
    };
    const fightUiImages = new Map();
    const fightUiTrimCache = new Map();
    const fightUiDigitSegments = new Map();
    const FIGHT_DIGIT_FALLBACK_TRIMS = [
        { sx: 47, sy: 243, sw: 147, sh: 194 },
        { sx: 266, sy: 243, sw: 110, sh: 208 },
        { sx: 480, sy: 243, sw: 142, sh: 195 },
        { sx: 718, sy: 246, sw: 137, sh: 194 },
        { sx: 950, sy: 245, sw: 135, sh: 215 },
        { sx: 1186, sy: 232, sw: 150, sh: 208 },
        { sx: 1408, sy: 248, sw: 136, sh: 192 },
        { sx: 1604, sy: 247, sw: 143, sh: 215 },
        { sx: 1805, sy: 250, sw: 138, sh: 190 },
        { sx: 1981, sy: 251, sw: 158, sh: 207 },
    ];

    Object.entries(FIGHT_UI_SPRITES).forEach(([id, sprite]) => {
        const img = new Image();
        img.src = `${FIGHT_UI_BASE_PATH}${sprite.file}`;
        img.onload = () => {
            fightUiTrimCache.clear();
            fightUiDigitSegments.clear();
            requestFightRender();
        };
        fightUiImages.set(id, img);
    });

    const isFightDigitSheetBackground = (data, offset) => {
        const maxChannel = Math.max(data[offset], data[offset + 1], data[offset + 2]);
        const minChannel = Math.min(data[offset], data[offset + 1], data[offset + 2]);
        return data[offset + 3] > 248 &&
            data[offset] > 220 &&
            data[offset + 1] > 220 &&
            data[offset + 2] > 220 &&
            maxChannel - minChannel < 36;
    };

    const getFightDigitSegments = (id = 'digits') => {
        const img = fightUiImages.get(id);
        if (!img?.complete || !img.naturalWidth) return null;
        const cacheKey = `${id}:${img.naturalWidth}x${img.naturalHeight}`;
        if (fightUiDigitSegments.has(cacheKey)) return fightUiDigitSegments.get(cacheKey);

        let segments = null;
        try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            const columns = new Array(canvas.width).fill(0);
            const ignoreBakedDigitBg = id === 'digits' && img.naturalWidth === 2172 && img.naturalHeight === 724;
            for (let y = 0; y < canvas.height; y += 1) {
                for (let x = 0; x < canvas.width; x += 1) {
                    const offset = (y * canvas.width + x) * 4;
                    if (data[offset + 3] > 8 && !(ignoreBakedDigitBg && isFightDigitSheetBackground(data, offset))) {
                        columns[x] += 1;
                    }
                }
            }

            const runs = [];
            let start = -1;
            columns.forEach((count, x) => {
                if (count > 5 && start < 0) start = x;
                if ((count <= 5 || x === columns.length - 1) && start >= 0) {
                    const end = count <= 5 ? x - 1 : x;
                    if (end - start > 10) runs.push({ sx: Math.max(0, start - 4), sy: 0, sw: end - start + 9, sh: canvas.height });
                    start = -1;
                }
            });

            if (runs.length >= 10) {
                segments = runs.slice(0, 10).map(run => ({
                    sx: run.sx,
                    sy: run.sy,
                    sw: Math.min(canvas.width - run.sx, run.sw),
                    sh: run.sh,
                }));
            }
        } catch (error) {
            segments = null;
        }

        fightUiDigitSegments.set(cacheKey, segments);
        return segments;
    };

    const getFightUiTrim = (id, sliceIndex = 0) => {
        const sprite = FIGHT_UI_SPRITES[id];
        const img = fightUiImages.get(id);
        if (!sprite || !img?.complete || !img.naturalWidth) return null;

        const slices = sprite.slices || 1;
        const digitSegments = sprite.digitSheet ? getFightDigitSegments(id) : null;
        const startX = Math.round(img.naturalWidth * sliceIndex / slices);
        const endX = Math.round(img.naturalWidth * (sliceIndex + 1) / slices);
        const fallbackDigitTrim = id === 'digits' && img.naturalWidth === 2172 && img.naturalHeight === 724
            ? FIGHT_DIGIT_FALLBACK_TRIMS[sliceIndex]
            : null;
        const source = digitSegments?.[sliceIndex] || fallbackDigitTrim || { sx: startX, sy: 0, sw: endX - startX, sh: img.naturalHeight };
        const cacheKey = `${id}:${sliceIndex}:${img.naturalWidth}x${img.naturalHeight}`;
        if (fightUiTrimCache.has(cacheKey)) return fightUiTrimCache.get(cacheKey);

        let trim = source;
        try {
            const canvas = document.createElement('canvas');
            canvas.width = source.sw;
            canvas.height = source.sh;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(img, source.sx, source.sy, source.sw, source.sh, 0, 0, source.sw, source.sh);
            const data = ctx.getImageData(0, 0, source.sw, source.sh).data;
            const ignoreBakedDigitBg = id === 'digits' && img.naturalWidth === 2172 && img.naturalHeight === 724;
            let minX = source.sw;
            let minY = source.sh;
            let maxX = -1;
            let maxY = -1;
            for (let y = 0; y < source.sh; y += 1) {
                for (let x = 0; x < source.sw; x += 1) {
                    const offset = (y * source.sw + x) * 4;
                    const alpha = data[offset + 3];
                    const isBakedDigitBg = ignoreBakedDigitBg && isFightDigitSheetBackground(data, offset);
                    if (alpha > 8 && !isBakedDigitBg) {
                        if (x < minX) minX = x;
                        if (y < minY) minY = y;
                        if (x > maxX) maxX = x;
                        if (y > maxY) maxY = y;
                    }
                }
            }
            if (maxX >= 0 && maxY >= 0) {
                const pad = 2;
                minX = Math.max(0, minX - pad);
                minY = Math.max(0, minY - pad);
                maxX = Math.min(source.sw - 1, maxX + pad);
                maxY = Math.min(source.sh - 1, maxY + pad);
                trim = {
                    sx: source.sx + minX,
                    sy: source.sy + minY,
                    sw: maxX - minX + 1,
                    sh: maxY - minY + 1,
                };
            }
        } catch (error) {
            trim = source;
        }

        fightUiTrimCache.set(cacheKey, trim);
        return trim;
    };

    const measureFightUiSprite = (id, options = {}) => {
        const trim = getFightUiTrim(id, options.sliceIndex || 0);
        if (!trim) return null;
        const maxW = options.maxW || Infinity;
        const maxH = options.maxH || Infinity;
        let scale = options.scale || 1;
        if (options.height) scale = options.height / trim.sh;
        if (options.width) scale = options.width / trim.sw;
        scale = Math.min(scale, maxW / trim.sw, maxH / trim.sh);
        return { trim, width: trim.sw * scale, height: trim.sh * scale, scale };
    };

    const drawFightUiSprite = (id, x, y, options = {}) => {
        const img = fightUiImages.get(id);
        const measured = measureFightUiSprite(id, options);
        if (!img?.complete || !img.naturalWidth || !measured) return false;

        const align = options.align || 'center';
        const valign = options.valign || 'middle';
        const dx = align === 'left' ? x : align === 'right' ? x - measured.width : x - measured.width / 2;
        const dy = valign === 'top' ? y : valign === 'bottom' ? y - measured.height : y - measured.height / 2;
        fightCtx.save();
        fightCtx.globalAlpha *= options.alpha == null ? 1 : options.alpha;
        if (options.shadow !== false) {
            fightCtx.shadowColor = options.shadowColor || 'rgba(0,0,0,0.72)';
            fightCtx.shadowBlur = options.shadowBlur || 12;
            fightCtx.shadowOffsetY = options.shadowOffsetY || 4;
        }
        fightCtx.drawImage(
            img,
            measured.trim.sx,
            measured.trim.sy,
            measured.trim.sw,
            measured.trim.sh,
            dx,
            dy,
            measured.width,
            measured.height,
        );
        fightCtx.restore();
        return true;
    };

    const drawFightUiExactBar = (id, x, y, w, h, pct, reverse = false, alpha = 1) => {
        const img = fightUiImages.get(id);
        const trim = getFightUiTrim(id);
        if (!img?.complete || !img.naturalWidth || !trim) return false;

        const ratio = clampFight01(pct || 0);
        fightCtx.save();
        fightCtx.globalAlpha *= 0.3 * alpha;
        fightCtx.filter = 'grayscale(1) brightness(0.45) saturate(0.75)';
        fightCtx.drawImage(img, trim.sx, trim.sy, trim.sw, trim.sh, x, y, w, h);
        fightCtx.restore();

        const sourceW = Math.max(0, Math.round(trim.sw * ratio));
        const drawW = Math.max(0, w * ratio);
        if (sourceW <= 0 || drawW <= 0) return true;

        const sx = reverse ? trim.sx + trim.sw - sourceW : trim.sx;
        const dx = reverse ? x + w - drawW : x;
        fightCtx.save();
        fightCtx.globalAlpha *= alpha;
        fightCtx.shadowColor = reverse ? 'rgba(52,212,255,0.34)' : 'rgba(255,90,67,0.34)';
        fightCtx.shadowBlur = 10;
        fightCtx.drawImage(img, sx, trim.sy, sourceW, trim.sh, dx, y, drawW, h);
        fightCtx.restore();
        return true;
    };

    const drawFightUiExactImage = (id, x, y, w, h, alpha = 1) => {
        const img = fightUiImages.get(id);
        const trim = getFightUiTrim(id);
        if (!img?.complete || !img.naturalWidth || !trim) return false;

        fightCtx.save();
        fightCtx.globalAlpha *= alpha;
        fightCtx.drawImage(img, trim.sx, trim.sy, trim.sw, trim.sh, x, y, w, h);
        fightCtx.restore();
        return true;
    };

    const drawFightLargeHealthBar = (id, x, y, w, h, pct, reverse = false) => {
        const img = fightUiImages.get(id);
        const trim = getFightUiTrim(id);
        if (!img?.complete || !img.naturalWidth || !trim) return false;

        const ratio = clampFight01(pct || 0);
        fightCtx.save();
        fightCtx.shadowColor = reverse ? 'rgba(52,212,255,0.28)' : 'rgba(255,90,67,0.28)';
        fightCtx.shadowBlur = 10;
        fightCtx.drawImage(img, trim.sx, trim.sy, trim.sw, trim.sh, x, y, w, h);
        fightCtx.restore();

        if (ratio >= 0.995) return true;

        const innerPadX = Math.round(w * 0.105);
        const innerY = y + Math.round(h * 0.31);
        const innerW = Math.max(0, w - innerPadX * 2);
        const innerH = Math.max(4, Math.round(h * 0.39));
        const filledW = innerW * ratio;
        const emptyX = reverse ? x + innerPadX : x + innerPadX + filledW;
        const emptyW = reverse ? innerW - filledW : innerW - filledW;
        if (emptyW <= 0) return true;

        fightCtx.save();
        fightCtx.beginPath();
        fightCtx.roundRect(emptyX, innerY, emptyW, innerH, Math.max(4, innerH * 0.45));
        fightCtx.clip();
        const emptyGrad = fightCtx.createLinearGradient(emptyX, innerY, emptyX + emptyW, innerY + innerH);
        emptyGrad.addColorStop(0, 'rgba(7,9,13,0.88)');
        emptyGrad.addColorStop(0.55, reverse ? 'rgba(6,23,38,0.9)' : 'rgba(38,9,8,0.9)');
        emptyGrad.addColorStop(1, 'rgba(2,3,7,0.94)');
        fightCtx.fillStyle = emptyGrad;
        fightCtx.fillRect(emptyX, innerY, emptyW, innerH);
        fightCtx.strokeStyle = 'rgba(255,255,255,0.12)';
        fightCtx.lineWidth = 1;
        for (let sx = emptyX - innerH; sx < emptyX + emptyW + innerH; sx += 22) {
            fightCtx.beginPath();
            fightCtx.moveTo(sx, innerY + innerH);
            fightCtx.lineTo(sx + innerH * 0.72, innerY);
            fightCtx.stroke();
        }
        fightCtx.restore();

        const edgeX = reverse ? emptyX + emptyW : emptyX;
        fightCtx.save();
        fightCtx.strokeStyle = reverse ? 'rgba(137,232,255,0.75)' : 'rgba(255,210,166,0.75)';
        fightCtx.lineWidth = 1.4;
        fightCtx.beginPath();
        fightCtx.moveTo(edgeX, innerY + 1);
        fightCtx.lineTo(edgeX, innerY + innerH - 1);
        fightCtx.stroke();
        fightCtx.restore();
        return true;
    };

    const drawFightDigits = (text, x, y, options = {}) => {
        const value = String(text);
        if (!/^\d+$/.test(value)) return false;
        const spriteId = options.spriteId || 'digits';
        const img = fightUiImages.get(spriteId);
        if (!img?.complete || !img.naturalWidth) return false;

        const height = options.height || 34;
        const spacing = options.spacing == null ? -5 : options.spacing;
        const alpha = options.alpha == null ? 1 : options.alpha;
        const metrics = value.split('').map(char => {
            const measured = measureFightUiSprite(spriteId, { sliceIndex: Number(char), height });
            return measured ? { ...measured, digit: Number(char) } : null;
        });
        if (metrics.some(item => !item)) return false;

        const totalW = metrics.reduce((sum, item, index) => sum + item.width + (index ? spacing : 0), 0);
        const align = options.align || 'center';
        const valign = options.valign || 'middle';
        let cursor = align === 'left' ? x : align === 'right' ? x - totalW : x - totalW / 2;
        fightCtx.save();
        fightCtx.globalAlpha *= alpha;
        if (options.shadow !== false) {
            fightCtx.shadowColor = options.shadowColor || 'rgba(0,0,0,0.72)';
            fightCtx.shadowBlur = options.shadowBlur || 8;
            fightCtx.shadowOffsetY = options.shadowOffsetY || 2;
        }
        metrics.forEach((item, index) => {
            if (index) cursor += spacing;
            const dy = valign === 'top' ? y : valign === 'bottom' || valign === 'baseline' ? y - item.height : y - item.height / 2;
            fightCtx.drawImage(
                img,
                item.trim.sx,
                item.trim.sy,
                item.trim.sw,
                item.trim.sh,
                cursor,
                dy,
                item.width,
                item.height,
            );
            cursor += item.width;
        });
        fightCtx.restore();
        return true;
    };

    const measureFightDigitText = (text, options = {}) => {
        const value = String(text);
        if (!/^\d+$/.test(value)) return null;
        const spriteId = options.spriteId || 'digits';
        const height = options.height || 34;
        const spacing = options.spacing == null ? -5 : options.spacing;
        const metrics = value.split('').map(char => measureFightUiSprite(spriteId, { sliceIndex: Number(char), height }));
        if (metrics.some(item => !item)) return null;
        return {
            width: metrics.reduce((sum, item, index) => sum + item.width + (index ? spacing : 0), 0),
            height: Math.max(...metrics.map(item => item.height)),
        };
    };

    const drawFightRoundMessage = (round, x, y) => {
        const roundSprite = measureFightUiSprite('round', { height: 138, maxW: 430 });
        const numberIndex = Math.max(0, Math.min(2, Number(round || 1) - 1));
        const numberSprite = measureFightUiSprite('roundNumbers', { sliceIndex: numberIndex, height: 158 });
        if (!roundSprite || !numberSprite) return false;

        const gap = -18;
        const totalW = roundSprite.width + gap + numberSprite.width;
        const startX = x - totalW / 2;
        drawFightUiSprite('round', startX, y, { height: 138, maxW: 430, align: 'left', shadowBlur: 16, shadowOffsetY: 3 });
        drawFightUiSprite('roundNumbers', startX + roundSprite.width + gap, y + 3, { sliceIndex: numberIndex, height: 158, align: 'left', shadowBlur: 16, shadowOffsetY: 3 });
        return true;
    };

    const drawFightComboMessage = (comboCount, x, y) => {
        const digitHeight = 68;
        const hitMaxW = 180;
        const hitMaxH = 78;
        const digits = measureFightDigitText(comboCount, { spriteId: 'battleDigits', height: digitHeight, spacing: -8 });
        const hit = measureFightUiSprite('hit', { maxW: hitMaxW, maxH: hitMaxH });
        if (!digits || !hit) return false;

        const life = Math.max(0, Math.min(1, (FIGHT.messageTimer || 0) / 680));
        const pop = 1 + (1 - life) * 0.05;
        const gap = 12;
        const line1W = digits.width + gap + hit.width;

        fightCtx.save();
        fightCtx.translate(x, y);
        fightCtx.scale(pop, pop);
        fightCtx.rotate(-0.02);
        drawFightDigits(comboCount, -line1W / 2, 0, {
            spriteId: 'battleDigits',
            height: digitHeight,
            spacing: -8,
            align: 'left',
            valign: 'middle',
            shadowBlur: 14,
            shadowOffsetY: 3,
        });
        drawFightUiSprite('hit', -line1W / 2 + digits.width + gap, 0, {
            maxW: hitMaxW,
            maxH: hitMaxH,
            align: 'left',
            valign: 'middle',
            shadowBlur: 14,
            shadowOffsetY: 3,
        });
        drawFightUiSprite('combo', 0, 50, {
            maxW: 170,
            maxH: 58,
            alpha: 0.92,
            shadowBlur: 12,
            shadowOffsetY: 2,
        });
        fightCtx.restore();
        return true;
    };

    const drawFightSubMessage = (text, x, y) => {
        const value = String(text || '').trim();
        if (!value) return false;
        if (/^READY$/i.test(value)) {
            return drawFightUiSprite('ready', x, y, { maxW: 360, maxH: 130, shadowBlur: 18, shadowOffsetY: 4 });
        }
        if (/^MAX(IMUM)?$/i.test(value)) {
            return drawFightUiSprite('max', x, y, { maxW: 190, maxH: 78, shadowBlur: 16, shadowOffsetY: 3 });
        }
        if (/^WARNING$/i.test(value)) {
            return drawFightUiSprite('warning', x, y, { maxW: 300, maxH: 92, shadowBlur: 16, shadowOffsetY: 3 });
        }
        if (/^DANGER$/i.test(value)) {
            return drawFightUiSprite('danger', x, y, { maxW: 300, maxH: 92, shadowBlur: 16, shadowOffsetY: 3 });
        }
        return false;
    };

    const drawFightMainMessage = () => {
        if (!FIGHT.message) return;

        const roundMatch = FIGHT.message.match(/^ROUND\s+(\d+)/i);
        const comboMatch = FIGHT.message.match(/^(\d+)\s+HIT\s+COMBO$/i);
        const resultSprite = (() => {
            if (/^WIN$/i.test(FIGHT.message)) return ['win', { maxW: 540, maxH: 230, y: 198, shadowBlur: 18, shadowOffsetY: 5 }];
            if (/^LOSE$/i.test(FIGHT.message)) return ['lose', { maxW: 540, maxH: 230, y: 198, shadowBlur: 18, shadowOffsetY: 5 }];
            if (/^PERFECT$/i.test(FIGHT.message)) return ['perfect', { maxW: 620, maxH: 230, y: 198, shadowBlur: 18, shadowOffsetY: 5 }];
            if (/^DRAW(\s+GAME)?$/i.test(FIGHT.message)) return ['draw', { maxW: 540, maxH: 230, y: 198, shadowBlur: 18, shadowOffsetY: 5 }];
            if (/^TIME\s*UP$/i.test(FIGHT.message)) return ['timeup', { maxW: 560, maxH: 230, y: 198, shadowBlur: 18, shadowOffsetY: 5 }];
            return null;
        })();
        fightCtx.textAlign = 'center';
        fightCtx.shadowColor = 'rgba(0,0,0,0.75)';
        fightCtx.shadowBlur = 12;
        if (
            (roundMatch && drawFightRoundMessage(roundMatch[1], FIGHT_CENTER_X, 176)) ||
            (comboMatch && drawFightComboMessage(comboMatch[1], FIGHT_CENTER_X, 166)) ||
            (/^FIGHT!?$/i.test(FIGHT.message) && drawFightUiSprite('fight', FIGHT_CENTER_X, 178, { maxW: 560, maxH: 205, shadowBlur: 18, shadowOffsetY: 4 })) ||
            (resultSprite && drawFightUiSprite(resultSprite[0], FIGHT_CENTER_X, resultSprite[1].y, resultSprite[1])) ||
            (/^K\.?O\.?!?$/i.test(FIGHT.message) && drawFightUiSprite('ko', FIGHT_CENTER_X, 205, { maxW: 460, maxH: 300, shadowBlur: 20, shadowOffsetY: 5 }))
        ) {
            if (FIGHT.subMessage) {
                const subY = /^READY$/i.test(FIGHT.subMessage) ? 304 : comboMatch ? 238 : 250;
                if (!drawFightSubMessage(FIGHT.subMessage, FIGHT_CENTER_X, subY)) {
                    fightCtx.fillStyle = '#ffffff';
                    fightCtx.font = '900 20px sans-serif';
                    fightCtx.fillText(FIGHT.subMessage, FIGHT_CENTER_X, comboMatch ? 238 : 250);
                }
            }
            fightCtx.shadowBlur = 0;
            return;
        }

        if (/^SUPER\s+CLASH$/i.test(FIGHT.message) && drawFightUiSprite('bomb', FIGHT_CENTER_X, 178, { maxW: 360, maxH: 160, shadowBlur: 22, shadowOffsetY: 4 })) {
            fightCtx.fillStyle = '#fff1a8';
            fightCtx.strokeStyle = '#2b0b06';
            fightCtx.lineWidth = 6;
            fightCtx.font = '900 42px sans-serif';
            fightCtx.strokeText(FIGHT.message, FIGHT_CENTER_X, 220);
            fightCtx.fillText(FIGHT.message, FIGHT_CENTER_X, 220);
            fightCtx.shadowBlur = 0;
            return;
        }

        if (FIGHT.superFlash > 0 && drawFightUiSprite('super', FIGHT_CENTER_X, 164, { maxW: 430, maxH: 138, shadowBlur: 22, shadowOffsetY: 4 })) {
            drawFightUiSprite('bomb', FIGHT_CENTER_X, 212, { maxW: 300, maxH: 120, alpha: 0.55, shadowBlur: 18, shadowOffsetY: 3 });
            fightCtx.fillStyle = '#ffffff';
            fightCtx.strokeStyle = '#2b0b06';
            fightCtx.lineWidth = 5;
            fightCtx.font = '900 30px sans-serif';
            fightCtx.strokeText(FIGHT.message, FIGHT_CENTER_X, 244);
            fightCtx.fillText(FIGHT.message, FIGHT_CENTER_X, 244);
            if (FIGHT.subMessage && !drawFightSubMessage(FIGHT.subMessage, FIGHT_CENTER_X, 304)) {
                fightCtx.font = '900 20px sans-serif';
                fightCtx.fillText(FIGHT.subMessage, FIGHT_CENTER_X, 282);
            }
            fightCtx.shadowBlur = 0;
            return;
        }

        fightCtx.fillStyle = '#fff1a8';
        fightCtx.strokeStyle = '#4a1414';
        fightCtx.lineWidth = 7;
        fightCtx.font = '900 50px sans-serif';
        fightCtx.strokeText(FIGHT.message, FIGHT_CENTER_X, 190);
        fightCtx.fillText(FIGHT.message, FIGHT_CENTER_X, 190);
        if (FIGHT.subMessage) {
            fightCtx.font = '900 20px sans-serif';
            fightCtx.fillStyle = '#ffffff';
            fightCtx.fillText(FIGHT.subMessage, FIGHT_CENTER_X, 224);
        }
        fightCtx.shadowBlur = 0;
    };

    const getFightChar = (id) => FIGHTERS.find(fighter => fighter.id === id) || FIGHTERS[0];

    const createFightPlayer = (side, fighterId = side === 'p1' ? 'flame' : 'shadow') => {
        const fighter = getFightChar(fighterId);
        return ({
        fighterId: fighter.id,
        name: fighter.name,
        title: fighter.title,
        specialName: fighter.special,
        superName: fighter.superName,
        superType: fighter.superType,
        palette: fighter.palette,
        trait: fighter.trait,
        traitName: fighter.traitName,
        speed: fighter.speed,
        jump: fighter.jump,
        damageScale: fighter.damageScale,
        powerScale: fighter.powerScale,
        x: side === 'p1' ? FIGHT_WIDTH * 0.26 : FIGHT_WIDTH * 0.74,
        y: FIGHT_FLOOR,
        hp: fighter.maxHp,
        maxHp: fighter.maxHp,
        power: 0,
        wins: 0,
        vx: 0,
        vy: 0,
        facing: side === 'p1' ? 1 : -1,
        state: 'idle',
        frame: 0,
        attackType: '',
        attackProfile: null,
        attackTimer: 0,
        attackElapsed: 0,
        attackHit: false,
        attackHitConnected: false,
        afterimageTimer: 0,
        attackBufferType: '',
        attackBufferTimer: 0,
        rushTimer: 0,
        rushHitDone: false,
        swordDashTimer: 0,
        invincible: 0,
        hitstun: 0,
        blockstun: 0,
        hurtTimer: 0,
        slowTimer: 0,
        knockdownTimer: 0,
        getupTimer: 0,
        knockdownGauge: 0,
        knockdownElapsed: 0,
        loseElapsed: 0,
        combo: 0,
        comboTimer: 0,
        receivedDamageMemory: { type: '', count: 0, otherCount: 0 },
        grounded: true,
        crouching: false,
        guarding: false,
        });
    };

    const FIGHT = {
        running: false,
        paused: false,
        gameOver: false,
        roundEnding: false,
        roundEndTimer: 0,
        round: 1,
        timer: FIGHT_ROUND_TIME,
        countdown: 0,
        selectedP1: 'flame',
        selectedP2: 'hancheying',
        selectedBg: 'random',
        activeBg: 'bg1',
        mode: 'cpu',
        aiDifficulty: 'normal',
        aiDecisionTimer: 0,
        aiAttackCooldown: 0,
        aiInput: {},
        pickSide: 'p1',
        p1: createFightPlayer('p1', 'flame'),
        p2: createFightPlayer('p2', 'shadow'),
        projectiles: [],
        particles: [],
        sparks: [],
        afterimages: [],
        lastTime: 0,
        message: '',
        subMessage: '',
        messageTimer: 0,
        cameraShake: 0,
        superFlash: 0,
        hitStop: 0,
        energyWarnTimer: 0,
    };

    const fightCanvas = document.getElementById('fight-canvas');
    const fightCtx = fightCanvas.getContext('2d');
    const fightSetup = document.getElementById('fight-setup');
    const fightP1Roster = document.getElementById('fight-p1-roster');
    const fightP2Roster = document.getElementById('fight-p2-roster');
    const fightBgPicker = document.getElementById('fight-bg-picker');
    const fightStartBtn = document.getElementById('fight-start');
    const fightRestartBtn = document.getElementById('fight-restart');
    const fightPauseBtn = document.getElementById('fight-pause');
    const fightContinueBtn = document.getElementById('fight-continue');
    const fightHomeBtn = document.getElementById('fight-home');
    const fightP1Hp = document.getElementById('fight-p1-hp');
    const fightP2Hp = document.getElementById('fight-p2-hp');
    const fightRoundEl = document.getElementById('fight-round');
    const fightTimeEl = document.getElementById('fight-time');
    const fightSection = document.getElementById('fight');
    const fightVirtualControls = document.getElementById('fight-virtual-controls');

    const fightKeys = {};
    const fightVirtualPointers = new Map();
    let fightCanvasButtons = [];
    let fightAnimId = 0;
    const scheduleFightFrame = () => {
        if (fightAnimId) cancelAnimationFrame(fightAnimId);
        fightAnimId = requestAnimationFrame(loopFight);
    };

    const getFightBackground = (id) => FIGHT_BACKGROUNDS.find(bg => bg.id === id) || FIGHT_BACKGROUNDS[1];

    const clearFightVirtualInputs = () => {
        Object.keys(fightKeys).forEach((key) => { fightKeys[key] = false; });
        fightVirtualPointers.clear();
        fightVirtualControls?.querySelectorAll('[data-fight-key]').forEach((button) => {
            button.classList.remove('is-pressed');
            button.setAttribute('aria-pressed', 'false');
        });
    };

    const syncFightVirtualControls = () => {
        const active = FIGHT.running && !FIGHT.gameOver && !fightSection?.classList.contains('hidden');
        const activePlay = active && !FIGHT.paused;
        const mainPage = document.getElementById('main-page');
        const mobileBottomNav = document.getElementById('mobile-bottom-nav');
        fightSection?.classList.toggle('is-fight-running', active);
        mainPage?.classList.toggle('is-fight-playing', activePlay);
        mobileBottomNav?.classList.toggle('is-fight-playing', activePlay);
        fightVirtualControls?.classList.toggle('is-active', activePlay);
        fightVirtualControls?.classList.remove('is-paused');
        fightVirtualControls?.setAttribute('aria-hidden', activePlay ? 'false' : 'true');
        fightVirtualControls?.querySelectorAll('[data-fight-key]').forEach((button) => {
            button.disabled = !active || FIGHT.paused;
        });
        if (!active || FIGHT.paused) clearFightVirtualInputs();
    };

    const chooseFightBackground = () => {
        if (FIGHT.selectedBg !== 'random') return FIGHT.selectedBg;
        const choices = FIGHT_BACKGROUNDS.filter(bg => bg.file);
        return choices[Math.floor(Math.random() * choices.length)]?.id || 'bg1';
    };

    const renderFightSetup = () => {
        fightSetup?.classList.remove('hidden');
        const renderRoster = (root, side) => {
            if (!root) return;
            const selected = side === 'p1' ? FIGHT.selectedP1 : FIGHT.selectedP2;
            root.innerHTML = '';
            FIGHTERS.forEach((fighter) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `fight-character-btn${fighter.id === selected ? ' active' : ''}`;
                btn.dataset.fighter = fighter.id;
                const portrait = FIGHT_SPRITE_SETS[fighter.id]?.portraits?.lihui;
                const portraitSrc = portrait ? `${FIGHT_SPRITE_SETS[fighter.id].basePath}${portrait.file}` : '';
                btn.innerHTML = `${portraitSrc ? `<img class="fight-character-art" src="${portraitSrc}" alt="">` : ''}<span class="fight-character-copy"><strong>${fighter.name}</strong><em>${fighter.title}</em><span>${fighter.desc}</span><span>必杀：${fighter.superName}</span></span>`;
                btn.addEventListener('click', () => {
                    if (side === 'p1') FIGHT.selectedP1 = fighter.id;
                    else FIGHT.selectedP2 = fighter.id;
                    renderFightSetup();
                    resetFightGame();
                    drawFightGame();
                });
                root.appendChild(btn);
            });
        };

        renderRoster(fightP1Roster, 'p1');
        renderRoster(fightP2Roster, 'p2');

        if (fightBgPicker) {
            fightBgPicker.innerHTML = '';
            FIGHT_BACKGROUNDS.forEach((bg, index) => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = `fight-bg-btn${bg.id === FIGHT.selectedBg ? ' active' : ''}`;
                btn.dataset.bg = bg.id;
                btn.innerHTML = `<strong>${bg.name}</strong><span>${bg.id === 'random' ? '每次开局随机一张' : `背景 ${index}`}</span>`;
                btn.addEventListener('click', () => {
                    FIGHT.selectedBg = bg.id;
                    if (bg.id !== 'random') {
                        FIGHT.activeBg = bg.id;
                        invalidateFightBackgroundCache();
                    }
                    renderFightSetup();
                    drawFightGame();
                });
                fightBgPicker.appendChild(btn);
            });
        }
    };

    const addFightCanvasButton = (id, x, y, w, h, onClick) => {
        fightCanvasButtons.push({ id, x, y, w, h, onClick });
    };

    const hitFightCanvasButton = (x, y) => {
        const hit = fightCanvasButtons.find((button) => (
            x >= button.x && x <= button.x + button.w &&
            y >= button.y && y <= button.y + button.h
        ));
        if (!hit) return false;
        hit.onClick?.();
        return true;
    };

    const resetFightGame = () => {
        FIGHT.running = false;
        FIGHT.paused = false;
        FIGHT.gameOver = false;
        FIGHT.roundEnding = false;
        FIGHT.roundEndTimer = 0;
        FIGHT.round = 1;
        FIGHT.timer = FIGHT_ROUND_TIME;
        FIGHT.countdown = 0;
        FIGHT.pickSide = 'p1';
        FIGHT.p1 = createFightPlayer('p1', FIGHT.selectedP1);
        FIGHT.p2 = createFightPlayer('p2', FIGHT.selectedP2);
        FIGHT.projectiles = [];
        FIGHT.particles = [];
        FIGHT.sparks = [];
        FIGHT.afterimages = [];
        FIGHT.message = '';
        FIGHT.subMessage = '';
        FIGHT.messageTimer = 0;
        FIGHT.cameraShake = 0;
        FIGHT.superFlash = 0;
        FIGHT.hitStop = 0;
        FIGHT.energyWarnTimer = 0;
        FIGHT.aiDecisionTimer = 0;
        FIGHT.aiAttackCooldown = 0;
        FIGHT.aiInput = {};
        fightSetup?.classList.add('hidden');
        fightStartBtn.classList.remove('hidden');
        fightRestartBtn.classList.add('hidden');
        fightPauseBtn.classList.add('hidden');
        fightContinueBtn?.classList.add('hidden');
        fightHomeBtn?.classList.add('hidden');
        fightPauseBtn.textContent = '暂停';
        updateFightHud();
        syncFightVirtualControls();
    };

    const updateFightHud = () => {
        fightP1Hp.textContent = Math.max(0, Math.ceil(FIGHT.p1.hp));
        fightP2Hp.textContent = Math.max(0, Math.ceil(FIGHT.p2.hp));
        fightRoundEl.textContent = String(FIGHT.round);
        if (fightTimeEl) fightTimeEl.textContent = String(Math.max(0, Math.ceil(FIGHT.timer)));
    };

    const startFightGame = () => {
        if (fightAnimId) cancelAnimationFrame(fightAnimId);
        resetFightGame();
        FIGHT.activeBg = chooseFightBackground();
        invalidateFightBackgroundCache();
        FIGHT.p1 = createFightPlayer('p1', FIGHT.selectedP1);
        FIGHT.p2 = createFightPlayer('p2', FIGHT.selectedP2);
        FIGHT.running = true;
        FIGHT.paused = false;
        FIGHT.countdown = 1050;
        FIGHT.message = `ROUND ${FIGHT.round}`;
        FIGHT.subMessage = 'READY';
        FIGHT.messageTimer = 1020;
        FIGHT.lastTime = performance.now();
        fightSetup?.classList.add('hidden');
        fightStartBtn.classList.add('hidden');
        fightRestartBtn.classList.remove('hidden');
        fightPauseBtn.classList.remove('hidden');
        fightContinueBtn?.classList.add('hidden');
        fightHomeBtn?.classList.add('hidden');
        updateFightHud();
        syncFightVirtualControls();
        fightAnimId = requestAnimationFrame(loopFight);
    };

    const clampFight01 = (value) => Math.max(0, Math.min(1, value));
    const easeFightOut = (value) => 1 - Math.pow(1 - clampFight01(value), 3);
    const easeFightIn = (value) => clampFight01(value) * clampFight01(value);
    const easeFightSnap = (value) => {
        const t = clampFight01(value);
        const c1 = 1.7;
        const c3 = c1 + 1;
        return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    };

    const getFightAttackMotion = (player, attack) => {
        if (!attack || player.attackTimer <= 0) {
            return { wind: 0, strike: 0, recover: 0, active: false, raw: 0 };
        }
        const elapsed = player.attackElapsed;
        const activeStart = attack.startup;
        const activeEnd = attack.startup + (attack.active || 1);
        const total = activeEnd + attack.recovery;
        const raw = clampFight01(elapsed / Math.max(1, total));
        if (elapsed < activeStart) {
            return {
                wind: easeFightOut(elapsed / Math.max(1, activeStart)),
                strike: 0,
                recover: 0,
                active: false,
                raw,
            };
        }
        if (elapsed <= activeEnd) {
            const activeT = (elapsed - activeStart) / Math.max(1, attack.active || 1);
            return {
                wind: Math.max(0.1, 1 - activeT * 0.55),
                strike: activeT < 0.5 ? easeFightSnap(activeT / 0.5) : 1 - easeFightIn((activeT - 0.5) / 0.5) * 0.14,
                recover: 0,
                active: true,
                raw,
            };
        }
        const recoverT = (elapsed - activeEnd) / Math.max(1, attack.recovery);
        const recover = easeFightOut(recoverT);
        return {
            wind: 0,
            strike: Math.max(0, 0.86 * (1 - recover)),
            recover,
            active: false,
            raw,
        };
    };

    const getFightAttackProfile = (player, attackType) => {
        const base = FIGHT_ATTACKS[attackType];
        if (!base) return null;
        const attack = { ...base, type: attackType };
        if (player?.trait === 'flame') {
            const lowHp = player.hp / Math.max(1, player.maxHp) <= 0.4;
            if (lowHp) {
                attack.damage = Math.round(attack.damage * 1.12);
                attack.hitstop += 8;
            }
            if (attackType === 'special' || attackType === 'super') attack.damage += 1;
        }
        if (player?.trait === 'shadow') {
            if (attackType === 'lightPunch' || attackType === 'lightKick') {
                attack.startup = Math.round(attack.startup * 0.82);
                attack.recovery = Math.round(attack.recovery * 0.82);
            }
            if (attackType === 'special') {
                attack.startup = Math.round(attack.startup * 0.88);
                attack.recovery = Math.round(attack.recovery * 0.88);
            }
            if (attackType === 'super') {
                attack.active += 74;
                attack.range += 36;
                attack.knockback += 22;
            }
        }
        if (player?.trait === 'stone') {
            if (attackType === 'heavyPunch' || attackType === 'heavyKick') {
                attack.damage += 2;
                attack.knockback += 42;
                attack.hitstop += 10;
            }
            if (attackType === 'super') {
                attack.damage += 1;
                attack.knockback += 52;
            }
        }
        if (player?.trait === 'volt') {
            if (attack.projectile) {
                attack.startup = Math.round(attack.startup * 0.82);
                attack.recovery = Math.round(attack.recovery * 0.86);
                attack.projectileSpeedBonus = 130;
                attack.radiusBonus = 3;
            }
            attack.power += 2;
        }
        if (player?.trait === 'frost') {
            if (player?.fighterId === 'hancheying' && attackType === 'lightPunch') {
                attack.range += 12;
                attack.recovery += 30;
            }
            if (attackType === 'lightKick' || attackType === 'special' || attackType === 'super') {
                attack.slow = attackType === 'super' ? 1200 : 760;
                attack.hitstun += 34;
                attack.knockback = Math.round(attack.knockback * 0.9);
            }
        }
        if (player?.trait === 'blade') {
            attack.recovery = Math.round(attack.recovery * 0.86);
            if (!player.grounded) {
                attack.damage = Math.round(attack.damage * 1.15);
                attack.knockback += 26;
                attack.hitstop += 8;
            }
            if (attackType === 'super') attack.active += 48;
        }
        return attack;
    };

    const getFightRepeatDamageScale = (defender, attack) => {
        const type = attack?.type || attack?.attackType || '';
        if (!FIGHT_REPEAT_DAMAGE_TYPES.has(type)) return 1;

        const memory = defender.receivedDamageMemory || (defender.receivedDamageMemory = { type: '', count: 0, otherCount: 0 });
        if (memory.type === type) {
            memory.count += 1;
            memory.otherCount = 0;
        } else if (!memory.type) {
            memory.type = type;
            memory.count = 1;
            memory.otherCount = 0;
        } else {
            memory.otherCount += 1;
            if (memory.otherCount >= 2) {
                memory.type = type;
                memory.count = 1;
                memory.otherCount = 0;
            }
        }

        if (memory.type !== type) return 1;
        return Math.max(0.5, 1 - Math.max(0, memory.count - 2) * 0.1);
    };

    const canFightCancel = (player, nextAttackType) => {
        const currentType = player.attackType;
        const current = player.attackProfile || getFightAttackProfile(player, currentType);
        if (!current || !player.attackHitConnected) return false;
        const routes = FIGHT_CANCEL_ROUTES[currentType] || [];
        if (!routes.includes(nextAttackType)) return false;
        const next = getFightAttackProfile(player, nextAttackType);
        if (!next || (next.cost && player.power < next.cost)) return false;
        const cancelStart = current.startup + (current.active || 0) * 0.25;
        return player.attackElapsed >= cancelStart;
    };

    const showFightEnergyWarning = (player) => {
        if (FIGHT.energyWarnTimer > 0) return;
        addFightSpark(player.x, player.y - 110, '', '#ffdf6a', 'warning');
        FIGHT.energyWarnTimer = 1000;
    };

    const fightPlayerAttack = (player, attackType) => {
        const attack = getFightAttackProfile(player, attackType);
        const canceling = player.attackTimer > 0 && canFightCancel(player, attackType);
        if (!attack || (!canceling && player.attackTimer > 0) || player.hitstun > 0 || player.blockstun > 0 || player.knockdownTimer > 0 || player.getupTimer > 0 || FIGHT.roundEnding || FIGHT.countdown > 0) return false;
        if (attack.cost && player.power < attack.cost) {
            showFightEnergyWarning(player);
            return false;
        }
        if (canceling) {
            addFightAfterimage(player, 0.28);
            addFightSpark(player.x + player.facing * 36, player.y - 88, 'CANCEL', '#a7ffda');
        }
        if (attack.cost) player.power -= attack.cost;
        player.state = 'attack';
        player.frame = 0;
        player.attackType = attackType;
        player.attackProfile = attack;
        player.attackTimer = attack.startup + (attack.active || 0) + attack.recovery;
        player.attackElapsed = 0;
        player.attackHit = false;
        player.attackHitConnected = false;
        player.attackBufferType = '';
        player.attackBufferTimer = 0;
        player.crouching = !!attack.low;
        if (attack.slide && player.grounded) player.vx = player.facing * attack.slide;
        if (attack.super) {
            FIGHT.superFlash = 0.42;
            FIGHT.cameraShake = 10;
            FIGHT.message = player.superName;
            FIGHT.subMessage = 'MAXIMUM';
            FIGHT.messageTimer = 720;
            if (player.superType === 'swordDance') player.swordDashTimer = 260;
        }
        return true;
    };

    const applyFightHit = (player, other, attack, x, y) => {
        if (other.hp > 0 && (other.state === 'knockdown' || other.knockdownTimer > 0)) {
            FIGHT.hitStop = Math.max(FIGHT.hitStop, 18);
            addFightSpark(x, y - 20, 'DOWN', '#9ad7ff');
            return;
        }
        const blocked = other.guarding && other.grounded && other.hitstun <= 0;
        const scale = attack.super ? 1 : player.damageScale;
        const armored = other.trait === 'stone' && other.attackTimer > 0 && ['heavyPunch', 'heavyKick'].includes(other.attackType) && !attack.super;
        const repeatDamageScale = getFightRepeatDamageScale(other, attack);
        let damage = (blocked ? attack.blockDamage : attack.damage) * scale;
        if (blocked && other.trait === 'stone') damage *= 0.72;
        if (armored) damage *= 0.72;
        damage = Math.max(1, Math.round(damage * repeatDamageScale));
        const wakeupArmor = other.invincible > 0 && other.hp > 0;
        other.hp = Math.max(0, other.hp - damage);
        if (wakeupArmor && other.hp > 0) {
            other.hurtTimer = 90;
            FIGHT.hitStop = Math.max(FIGHT.hitStop, 24);
            addFightParticle(x, y, '#fff1a8', 8, 0.55);
            addFightSpark(x, y - 20, 'ARMOR', '#fff1a8');
            updateFightHud();
            return;
        }
        const superClashArmor = attack.super && isFightSuperActive(other) && other.hp > 0;
        if (superClashArmor) {
            const push = attack.knockback * 0.32;
            other.vx += player.facing * push;
            player.vx -= player.facing * push * 0.28;
            other.hurtTimer = Math.max(other.hurtTimer, 145);
            other.invincible = Math.max(other.invincible || 0, 120);
            other.attackTimer = Math.max(other.attackTimer, 180);
            other.attackHit = false;
            FIGHT.hitStop = Math.max(FIGHT.hitStop, attack.hitstop || 120);
            FIGHT.cameraShake = Math.max(FIGHT.cameraShake, 22);
            FIGHT.superFlash = Math.max(FIGHT.superFlash, 0.22);
            FIGHT.message = 'SUPER CLASH';
            FIGHT.subMessage = '霸体对撞';
            FIGHT.messageTimer = 520;
            addFightAfterimage(player, 0.48);
            addFightAfterimage(other, 0.48);
            addFightParticle(x, y, '#fff1a8', 42, 1.85);
            addFightSpark(x, y - 24, String(damage), '#fff1a8');
            updateFightHud();
            return;
        }
        other.vx = player.facing * (blocked ? attack.knockback * 0.55 : attack.knockback) * (armored ? 0.45 : 1);
        other.hitstun = blocked ? 0 : armored ? Math.min(95, attack.hitstun * 0.35) : attack.hitstun;
        other.blockstun = blocked ? 160 : Math.min(120, attack.hitstun * 0.25);
        other.hurtTimer = blocked ? 120 : 230;
        let knockdownBreak = false;
        if (!blocked && !attack.super && other.hp > 0) {
            const knockdownGain = attack.knockback >= 240 ? 48 : attack.knockback >= 220 ? 42 : attack.knockback >= 180 ? 20 : 0;
            if (knockdownGain > 0) {
                other.knockdownGauge = Math.min(FIGHT_KNOCKDOWN_MAX, other.knockdownGauge + knockdownGain);
                knockdownBreak = other.knockdownGauge >= FIGHT_KNOCKDOWN_MAX;
                if (knockdownBreak) other.knockdownGauge = 0;
            }
        }
        const causesKnockdown = !blocked && (attack.super || knockdownBreak || other.hp <= 0);
        other.state = blocked ? 'block' : causesKnockdown ? other.hp <= 0 ? 'lose' : 'knockdown' : 'hurt';
        if (causesKnockdown) {
            other.knockdownGauge = 0;
            other.knockdownElapsed = 0;
            other.loseElapsed = 0;
            other.knockdownTimer = other.hp <= 0 ? 999999 : 900;
            other.getupTimer = 0;
            other.attackTimer = 0;
            other.attackType = '';
            other.attackProfile = null;
            other.attackHit = false;
            other.rushTimer = 0;
            other.swordDashTimer = 0;
            other.guarding = false;
            other.crouching = false;
        }
        const attackerPowerGain = attack.projectile && !attack.super ? 0 : Math.round(attack.power * player.powerScale);
        other.power = Math.min(FIGHT_MAX_POWER, other.power + (blocked ? 8 : 5));
        player.power = Math.min(FIGHT_MAX_POWER, player.power + attackerPowerGain);
        if (!blocked && attack.slow) other.slowTimer = Math.max(other.slowTimer, attack.slow);
        player.attackHitConnected = !blocked;
        player.combo = blocked ? 0 : player.combo + 1;
        player.comboTimer = blocked ? 0 : player.trait === 'shadow' ? 1120 : 960;
        if (causesKnockdown) {
            other.vy = Math.min(other.vy, -120);
        }
        FIGHT.hitStop = Math.max(FIGHT.hitStop, blocked ? 42 : attack.super ? Math.max(138, attack.hitstop || 0) : attack.hitstop || 70);
        FIGHT.cameraShake = Math.max(FIGHT.cameraShake, blocked ? 6 : attack.super ? 28 : attack.knockback >= 240 ? 16 : attack.knockback >= 180 ? 12 : 9);
        addFightAfterimage(player, attack.super ? 0.58 : attack.knockback >= 220 ? 0.36 : 0.26);
        addFightParticle(x, y, blocked ? '#9ad7ff' : '#ffdf6a', blocked ? 14 : attack.super ? 54 : attack.knockback >= 220 ? 32 : 24, blocked ? 0.9 : attack.super ? 2.05 : attack.knockback >= 220 ? 1.48 : 1.28);
        addFightSpark(x, y - 20, blocked ? 'GUARD' : String(damage), blocked ? '#9ad7ff' : '#ffdf6a', attack.super ? 'bomb' : '');
        if (!blocked && player.combo >= 2) {
            FIGHT.message = `${player.combo} HIT COMBO`;
            FIGHT.subMessage = `${player.name} · ${player.traitName || ''}`;
            FIGHT.messageTimer = 680;
        }
        updateFightHud();
    };

    const resolveFightAttack = (player) => {
        const attack = player.attackProfile || getFightAttackProfile(player, player.attackType);
        if (!attack || player.attackHit || player.attackElapsed < attack.startup) return;
        player.attackHit = true;
        if (attack.projectile) {
            const fastShot = player.superType === 'beam';
            const spawnOffsetX = player.fighterId === 'flame' ? 76 : 56;
            const spawnOffsetY = player.fighterId === 'flame' ? -116 : -72;
            const projectileId = FIGHT_SPRITE_SETS[player.fighterId]?.projectiles?.qigong ? 'qigong' : '';
            FIGHT.projectiles.push({
                x: player.x + player.facing * spawnOffsetX,
                y: player.y + spawnOffsetY,
                vx: player.facing * ((fastShot ? 560 : 430) + (attack.projectileSpeedBonus || 0)),
                life: fastShot ? 0.95 : 1.08,
                radius: (fastShot ? 14 : 16) + (attack.radiusBonus || 0),
                owner: player,
                age: 0,
                spriteFighterId: player.fighterId,
                spriteId: projectileId,
                ...attack,
                damage: fastShot ? attack.damage - 1 : attack.damage,
                knockback: fastShot ? attack.knockback + 25 : attack.knockback,
            });
            return;
        }
        const other = player === FIGHT.p1 ? FIGHT.p2 : FIGHT.p1;
        const inFront = player.facing === 1 ? other.x > player.x - 10 : other.x < player.x + 10;
        const yDist = Math.abs((other.y - 70) - (player.y - 70));
        const superDamage = attack.super ? FIGHT_SUPER_DAMAGE[player.superType] || attack.damage : attack.damage;
        const hitAttack = attack.super ? { ...attack, damage: superDamage, blockDamage: FIGHT_SUPER_BLOCK_DAMAGE } : attack;
        const canMeleeHit = !attack.super || FIGHT_MELEE_SUPER_TYPES.has(player.superType);
        const meleeRange = attack.super && player.superType === 'swordDance' ? attack.range + 54 : attack.range;
        const meleeHigh = attack.super && player.superType === 'swordDance' ? attack.high + 24 : attack.high;
        if (canMeleeHit && inFront && Math.abs(other.x - player.x) <= meleeRange && yDist <= meleeHigh) {
            applyFightHit(player, other, hitAttack, other.x - other.facing * 18, attack.low ? other.y - 34 : other.y - 78);
        }
        if (attack.super) {
            const superAttack = hitAttack;
            if (player.superType === 'rush') {
                player.vx = player.facing * (player.trait === 'flame' ? 560 : 520);
                player.rushTimer = player.trait === 'flame' ? 560 : player.trait === 'shadow' || player.trait === 'blade' ? 380 : 280;
                if (player.trait === 'flame') player.attackTimer = Math.max(player.attackTimer, player.rushTimer);
                player.rushHitDone = false;
            } else if (player.superType === 'swordDance') {
                FIGHT.cameraShake = Math.max(FIGHT.cameraShake, 18);
                addFightAfterimage(player, 0.42);
                addFightParticle(player.x + player.facing * 86, player.y - 82, '#7ed7ff', 34, 1.55);
            } else if (player.superType === 'quake') {
                const other = player === FIGHT.p1 ? FIGHT.p2 : FIGHT.p1;
                if (Math.abs(other.x - player.x) < 260 && other.grounded) {
                    applyFightHit(player, other, { ...superAttack, knockback: 420 }, other.x, other.y - 36);
                }
            } else {
                FIGHT.projectiles.push({
                    x: player.x + player.facing * 78,
                    y: player.y - 78,
                    vx: player.facing * ((player.superType === 'beam' ? 690 : 560) + (superAttack.projectileSpeedBonus || 0)),
                    life: player.superType === 'beam' ? 0.78 : 0.62,
                    radius: (player.superType === 'beam' ? 24 : 34) + (superAttack.radiusBonus || 0),
                    owner: player,
                    ...superAttack,
                    knockback: player.superType === 'beam' ? 310 : superAttack.knockback,
                });
            }
        }
    };

    const addFightParticle = (x, y, color, count = 8, force = 1) => {
        const safeCount = Math.max(0, Math.min(count, 70 - FIGHT.particles.length));
        for (let i = 0; i < safeCount; i++) {
            FIGHT.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 260 * force,
                vy: -80 - Math.random() * 260 * force,
                life: 0.32 + Math.random() * 0.24,
                maxLife: 0.56,
                color,
                size: 3 + Math.random() * 3,
            });
        }
    };

    const addFightSpark = (x, y, label, color = '#fff', spriteId = '') => {
        FIGHT.sparks.push({ x, y, label, color, life: 0.58, vy: -48, spriteId });
        if (FIGHT.sparks.length > 10) FIGHT.sparks.splice(0, FIGHT.sparks.length - 10);
    };

    const addFightAfterimage = (player, life = 0.24) => {
        FIGHT.afterimages.push({
            ...player,
            palette: player.palette,
            life,
            maxLife: life,
            ghost: true,
        });
        if (FIGHT.afterimages.length > 8) FIGHT.afterimages.splice(0, FIGHT.afterimages.length - 8);
    };

    const FIGHT_AI_LEVELS = {
        easy: { reaction: 260, attackCooldown: 390, idealMin: 92, idealMax: 190, block: 0.45, punish: 0.46, jump: 0.18, special: 0.18, super: 0.28 },
        normal: { reaction: 170, attackCooldown: 280, idealMin: 78, idealMax: 178, block: 0.66, punish: 0.66, jump: 0.32, special: 0.32, super: 0.55 },
        hard: { reaction: 82, attackCooldown: 190, idealMin: 68, idealMax: 158, block: 0.84, punish: 0.86, jump: 0.5, special: 0.45, super: 0.82 },
    };

    const createFightAiControls = (player, target, dt) => {
        const level = FIGHT_AI_LEVELS[FIGHT.aiDifficulty] || FIGHT_AI_LEVELS.normal;
        FIGHT.aiAttackCooldown = Math.max(0, FIGHT.aiAttackCooldown - dt * 1000);
        FIGHT.aiDecisionTimer = Math.max(0, FIGHT.aiDecisionTimer - dt * 1000);
        const current = FIGHT.aiInput || {};
        const locked = FIGHT.roundEnding || FIGHT.countdown > 0 || player.hitstun > 0 || player.blockstun > 0 || player.knockdownTimer > 0 || player.getupTimer > 0;
        if (locked) {
            FIGHT.aiInput = {};
        } else if (FIGHT.aiDecisionTimer <= 0) {
            const distance = target.x - player.x;
            const absDistance = Math.abs(distance);
            const facing = player.x <= target.x ? 1 : -1;
            const targetAttack = target.attackProfile || getFightAttackProfile(target, target.attackType);
            const targetThreatening = target.attackTimer > 0 && targetAttack && target.attackElapsed >= Math.max(0, targetAttack.startup - level.reaction);
            const incomingProjectile = FIGHT.projectiles.some(p => (
                p.owner !== player &&
                Math.abs(p.y - (player.y - 74)) < p.radius + 54 &&
                ((p.vx > 0 && p.x < player.x && player.x - p.x < 300) || (p.vx < 0 && p.x > player.x && p.x - player.x < 300))
            ));
            const input = {
                left: false,
                right: false,
                up: false,
                down: false,
                lightPunch: false,
                heavyPunch: false,
                lightKick: false,
                heavyKick: false,
                special: false,
                super: false,
            };
            const pressToward = () => {
                if (distance > 0) input.right = true;
                else input.left = true;
            };
            const pressBack = () => {
                if (facing === 1) input.left = true;
                else input.right = true;
            };

            if ((targetThreatening && absDistance < 190 && Math.random() < level.block) || (incomingProjectile && Math.random() < level.block)) {
                pressBack();
                input.down = incomingProjectile ? Math.random() < 0.42 : Math.random() < 0.55;
                if (incomingProjectile && Math.random() < level.jump) {
                    input.up = true;
                    input.down = false;
                    input.left = false;
                    input.right = false;
                    if (Math.random() < 0.65) pressToward();
                }
            } else if (absDistance > level.idealMax) {
                pressToward();
                if (absDistance > 240 && player.power >= FIGHT_SPECIAL_POWER_COST && Math.random() < level.special) {
                    input.special = true;
                    input.left = false;
                    input.right = false;
                }
            } else if (absDistance < level.idealMin) {
                pressBack();
                if (Math.random() < 0.22) input.down = true;
            } else if (Math.random() < 0.34) {
                pressToward();
            }

            if (FIGHT.aiAttackCooldown <= 0 && absDistance < 210 && !incomingProjectile) {
                const canSuper = player.power >= FIGHT_MAX_POWER;
                const canSpecial = player.power >= FIGHT_SPECIAL_POWER_COST;
                const punishWindow = target.attackTimer > 0 || target.hitstun > 0 || target.blockstun > 0;
                if (canSuper && (punishWindow || player.hp < player.maxHp * 0.45 || absDistance < 120) && Math.random() < level.super) {
                    input.super = true;
                    FIGHT.aiAttackCooldown = level.attackCooldown + 320;
                } else if (canSpecial && absDistance > 128 && Math.random() < level.special) {
                    input.special = true;
                    FIGHT.aiAttackCooldown = level.attackCooldown + 170;
                } else if (absDistance < 132 && Math.random() < level.punish) {
                    const roll = Math.random();
                    input.heavyPunch = roll < 0.28;
                    input.heavyKick = roll >= 0.28 && roll < 0.5;
                    input.lightPunch = roll >= 0.5 && roll < 0.76;
                    input.lightKick = roll >= 0.76;
                    FIGHT.aiAttackCooldown = level.attackCooldown + Math.random() * 110;
                }
            }

            FIGHT.aiInput = input;
            FIGHT.aiDecisionTimer = level.reaction + Math.random() * level.reaction * 0.55;
        }
        const input = FIGHT.aiInput || current;
        return {
            left: () => !!input.left,
            right: () => !!input.right,
            up: () => !!input.up,
            down: () => !!input.down,
            lightPunch: () => !!input.lightPunch,
            heavyPunch: () => !!input.heavyPunch,
            lightKick: () => !!input.lightKick,
            heavyKick: () => !!input.heavyKick,
            special: () => !!input.special,
            super: () => !!input.super,
        };
    };

    const openFightSetupScreen = () => {
        if (fightAnimId) cancelAnimationFrame(fightAnimId);
        Object.keys(fightKeys).forEach(key => { fightKeys[key] = false; });
        resetFightGame();
        FIGHT.message = '';
        FIGHT.subMessage = '';
        FIGHT.messageTimer = 0;
        drawFightGame();
    };

    const updateFightGame = (dt) => {
        const p1 = FIGHT.p1;
        const p2 = FIGHT.p2;

        if (FIGHT.energyWarnTimer > 0) {
            FIGHT.energyWarnTimer = Math.max(0, FIGHT.energyWarnTimer - dt * 1000);
        }

        if (FIGHT.countdown > 0) {
            FIGHT.countdown = Math.max(0, FIGHT.countdown - dt * 1000);
            if (FIGHT.countdown <= 0) {
                FIGHT.message = 'FIGHT!';
                FIGHT.subMessage = '';
                FIGHT.messageTimer = 620;
            }
        } else if (!FIGHT.roundEnding) {
            FIGHT.timer = Math.max(0, FIGHT.timer - dt);
        }

        if (FIGHT.cameraShake > 0) FIGHT.cameraShake = Math.max(0, FIGHT.cameraShake - dt * 34);
        if (FIGHT.superFlash > 0) FIGHT.superFlash = Math.max(0, FIGHT.superFlash - dt);
        if (FIGHT.hitStop > 0) {
            FIGHT.hitStop = Math.max(0, FIGHT.hitStop - dt * 1000);
            FIGHT.afterimages.forEach(img => { img.life -= dt * 0.42; });
            FIGHT.afterimages = FIGHT.afterimages.filter(img => img.life > 0);
            FIGHT.sparks.forEach(s => {
                s.y += s.vy * dt * 0.28;
                s.life -= dt * 0.28;
            });
            FIGHT.sparks = FIGHT.sparks.filter(s => s.life > 0);
            updateFightHud();
            return;
        }

        const updatePlayer = (player, other, controls) => {
            player.facing = player.x <= other.x ? 1 : -1;
            if (player.attackTimer > 0) {
                player.attackElapsed += dt * 1000;
                player.attackTimer = Math.max(0, player.attackTimer - dt * 1000);
                player.afterimageTimer = Math.max(0, player.afterimageTimer - dt * 1000);
                resolveFightAttack(player);
                const attack = player.attackProfile || getFightAttackProfile(player, player.attackType);
                const motion = getFightAttackMotion(player, attack);
                if (attack && motion.active && (attack.super || attack.slide || attack.projectile) && player.afterimageTimer <= 0) {
                    addFightAfterimage(player, attack.super ? 0.3 : 0.16);
                    player.afterimageTimer = attack.super ? 52 : 84;
                }
                if (player.attackTimer <= 0) {
                    player.state = player.grounded ? 'idle' : 'jump';
                    player.attackType = '';
                    player.attackProfile = null;
                    player.attackHitConnected = false;
                    player.crouching = false;
                    player.swordDashTimer = 0;
                }
            }
            if (player.invincible > 0) player.invincible = Math.max(0, player.invincible - dt * 1000);
            if (player.slowTimer > 0) player.slowTimer = Math.max(0, player.slowTimer - dt * 1000);
            if (player.attackBufferTimer > 0) {
                player.attackBufferTimer = Math.max(0, player.attackBufferTimer - dt * 1000);
                if (player.attackBufferTimer <= 0) player.attackBufferType = '';
            }
            if (player.rushTimer > 0) {
                player.rushTimer = Math.max(0, player.rushTimer - dt * 1000);
                if (player.rushTimer <= 0) player.rushHitDone = false;
            }
            if (player.swordDashTimer > 0) player.swordDashTimer = Math.max(0, player.swordDashTimer - dt * 1000);
            if (player.hitstun > 0) player.hitstun = Math.max(0, player.hitstun - dt * 1000);
            if (player.blockstun > 0) player.blockstun = Math.max(0, player.blockstun - dt * 1000);
            if (player.hurtTimer > 0) player.hurtTimer = Math.max(0, player.hurtTimer - dt * 1000);
            if (player.comboTimer > 0) {
                player.comboTimer = Math.max(0, player.comboTimer - dt * 1000);
                if (player.comboTimer <= 0) player.combo = 0;
            }
            if (player.state === 'knockdown' || player.state === 'lose') {
                player.knockdownElapsed = Math.min(2000, (player.knockdownElapsed || 0) + dt * 1000);
            }
            if (player.state === 'lose') {
                player.loseElapsed = Math.min(2400, (player.loseElapsed || 0) + dt * 1000);
            }
            if (player.knockdownGauge > 0 && player.knockdownTimer <= 0 && !FIGHT.roundEnding) {
                player.knockdownGauge = Math.max(0, player.knockdownGauge - FIGHT_KNOCKDOWN_DECAY * dt);
            }
            if (player.knockdownTimer > 0 && player.hp > 0) {
                player.knockdownTimer = Math.max(0, player.knockdownTimer - dt * 1000);
                if (player.knockdownTimer <= 0) {
                    player.getupTimer = 420;
                    player.state = 'getup';
                    player.invincible = Math.max(player.invincible, 1000);
                }
            }
            if (player.getupTimer > 0) {
                player.getupTimer = Math.max(0, player.getupTimer - dt * 1000);
                if (player.getupTimer <= 0 && player.state === 'getup') player.state = 'idle';
            }

            const locked = FIGHT.roundEnding || FIGHT.countdown > 0 || player.hitstun > 0 || player.blockstun > 0 || player.knockdownTimer > 0 || player.getupTimer > 0;
            const attacking = player.attackTimer > 0;
            const rushing = player.superType === 'rush' && player.rushTimer > 0;
            const swordDashing = player.superType === 'swordDance' && player.swordDashTimer > 0 && player.attackType === 'super';
            const left = controls.left();
            const right = controls.right();
            const down = controls.down();
            const up = controls.up();
            const holdingBack = (player.facing === 1 && left) || (player.facing === -1 && right);
            if (FIGHT.roundEnding) {
                player.crouching = false;
                player.guarding = false;
            } else {
                player.crouching = down && player.grounded && !attacking;
                player.guarding = (holdingBack || down) && player.grounded && !attacking && player.hitstun <= 0;
            }
            const readAttackInput = () => {
                if (controls.super()) return 'super';
                if (controls.special()) return 'special';
                if (controls.heavyKick()) return 'heavyKick';
                if (controls.heavyPunch()) return 'heavyPunch';
                if (controls.lightKick()) return 'lightKick';
                if (controls.lightPunch()) return 'lightPunch';
                return '';
            };
            const requestedAttack = readAttackInput();
            if (requestedAttack && (locked || attacking) && player.attackBufferType !== requestedAttack) {
                player.attackBufferType = requestedAttack;
                player.attackBufferTimer = 190;
            }

            if (!locked && !attacking && !rushing) {
                if (up && player.grounded && !player.crouching) {
                    player.vy = -player.jump;
                    player.grounded = false;
                    player.state = 'jump';
                }
                const axis = player.crouching ? 0 : (right ? 1 : 0) - (left ? 1 : 0);
                const slowScale = player.slowTimer > 0 ? 0.68 : 1;
                const traitSpeedScale = player.trait === 'shadow' ? 1.04 : player.trait === 'stone' ? 0.96 : 1;
                const speedScale = (player.guarding ? 0.45 : 1) * slowScale * traitSpeedScale;
                player.vx = axis * player.speed * speedScale;
                if (player.grounded) {
                    player.state = player.crouching ? 'crouch' : player.guarding ? 'guard' : axis ? 'walk' : 'idle';
                }
            } else if (swordDashing) {
                player.vx = player.facing * 360;
            } else if (rushing && player.trait === 'flame') {
                player.vx = player.facing * 560;
            } else {
                player.vx *= player.grounded ? 0.82 : 0.97;
            }

            player.vy += FIGHT_GRAVITY * dt;
            player.x += player.vx * dt;
            player.y += player.vy * dt;
            player.x = Math.max(FIGHT_LEFT_BOUND, Math.min(FIGHT_RIGHT_BOUND, player.x));
            if (player.y >= FIGHT_FLOOR) {
                player.y = FIGHT_FLOOR;
                player.vy = 0;
                player.grounded = true;
                if (player.state === 'jump') player.state = 'idle';
            } else {
                player.grounded = false;
                if (!attacking && !locked) player.state = 'jump';
            }

            if (!locked && (!attacking || player.attackHitConnected)) {
                const chosenAttack = player.attackBufferTimer > 0 ? player.attackBufferType : requestedAttack;
                if (chosenAttack && fightPlayerAttack(player, chosenAttack)) {
                    player.attackBufferType = '';
                    player.attackBufferTimer = 0;
                }
            }
        };

        updatePlayer(p1, p2, {
            left: () => fightKeys['a'] || fightKeys['A'],
            right: () => fightKeys['d'] || fightKeys['D'],
            up: () => fightKeys['w'] || fightKeys['W'],
            down: () => fightKeys['s'] || fightKeys['S'],
            lightPunch: () => fightKeys['j'] || fightKeys['J'],
            heavyPunch: () => fightKeys['k'] || fightKeys['K'],
            lightKick: () => fightKeys['l'] || fightKeys['L'],
            heavyKick: () => fightKeys['u'] || fightKeys['U'],
            special: () => fightKeys['i'] || fightKeys['I'],
            super: () => fightKeys['o'] || fightKeys['O'],
        });
        const p2Controls = FIGHT.mode === 'cpu' ? createFightAiControls(p2, p1, dt) : {
            left: () => fightKeys.ArrowLeft,
            right: () => fightKeys.ArrowRight,
            up: () => fightKeys.ArrowUp,
            down: () => fightKeys.ArrowDown,
            lightPunch: () => fightKeys['1'],
            heavyPunch: () => fightKeys['2'],
            lightKick: () => fightKeys['3'],
            heavyKick: () => fightKeys['4'],
            special: () => fightKeys['5'],
            super: () => fightKeys['6'],
        };
        updatePlayer(p2, p1, p2Controls);

        const overlap = 58 - Math.abs(p1.x - p2.x);
        if (overlap > 0) {
            const push = overlap / 2;
            if (p1.x < p2.x) {
                p1.x = Math.max(FIGHT_LEFT_BOUND, p1.x - push);
                p2.x = Math.min(FIGHT_RIGHT_BOUND, p2.x + push);
            } else {
                p1.x = Math.min(FIGHT_RIGHT_BOUND, p1.x + push);
                p2.x = Math.max(FIGHT_LEFT_BOUND, p2.x - push);
            }
        }

        [p1, p2].forEach((player) => {
            if (player.superType !== 'rush' || player.rushTimer <= 0 || player.rushHitDone) return;
            const target = player === p1 ? p2 : p1;
            const rushAttack = {
                ...getFightAttackProfile(player, 'super'),
                super: true,
                damage: FIGHT_SUPER_DAMAGE.rush,
                blockDamage: FIGHT_SUPER_BLOCK_DAMAGE,
                knockback: 320,
                hitstun: 620,
                hitstop: 108,
            };
            const closeEnough = Math.abs(target.x - player.x) < 90 && Math.abs((target.y - 70) - (player.y - 70)) < 92;
            const inFront = player.facing === 1 ? target.x >= player.x - 12 : target.x <= player.x + 12;
            if (closeEnough && inFront) {
                player.rushHitDone = true;
                player.rushTimer = 0;
                applyFightHit(player, target, rushAttack, target.x - target.facing * 14, target.y - 82);
            }
        });

        FIGHT.projectiles.forEach(p => {
            p.age = (p.age || 0) + dt;
            p.x += p.vx * dt;
            p.life -= dt;
            const target = p.owner === FIGHT.p1 ? FIGHT.p2 : FIGHT.p1;
            if (Math.abs(p.x - target.x) < p.radius + 28 && Math.abs(p.y - (target.y - 68)) < p.radius + 52) {
                applyFightHit(p.owner, target, p, p.x, p.y);
                p.life = 0;
            }
            if (p.x < -80 || p.x > FIGHT_WIDTH + 80) p.life = 0;
        });
        FIGHT.projectiles = FIGHT.projectiles.filter(p => p.life > 0);

        FIGHT.particles.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 520 * dt;
            p.life -= dt;
        });
        FIGHT.particles = FIGHT.particles.filter(p => p.life > 0);
        if (FIGHT.particles.length > 90) FIGHT.particles.splice(0, FIGHT.particles.length - 90);

        FIGHT.sparks.forEach(s => {
            s.y += s.vy * dt;
            s.life -= dt;
        });
        FIGHT.sparks = FIGHT.sparks.filter(s => s.life > 0);

        FIGHT.afterimages.forEach(img => { img.life -= dt; });
        FIGHT.afterimages = FIGHT.afterimages.filter(img => img.life > 0);

        if (FIGHT.messageTimer > 0) {
            FIGHT.messageTimer = Math.max(0, FIGHT.messageTimer - dt * 1000);
            if (FIGHT.messageTimer <= 0 && !FIGHT.roundEnding && FIGHT.countdown <= 0) {
                FIGHT.message = '';
                FIGHT.subMessage = '';
            }
        }

        if (!FIGHT.roundEnding && (FIGHT.p1.hp <= 0 || FIGHT.p2.hp <= 0 || FIGHT.timer <= 0)) {
            FIGHT.roundEnding = true;
            FIGHT.roundEndTimer = 1850;
            const timeout = FIGHT.timer <= 0;
            const winner = FIGHT.p1.hp === FIGHT.p2.hp ? null : FIGHT.p1.hp > FIGHT.p2.hp ? FIGHT.p1 : FIGHT.p2;
            if (winner) winner.wins += 1;
            if (winner) {
                const loser = winner === FIGHT.p1 ? FIGHT.p2 : FIGHT.p1;
                winner.state = 'win';
                winner.attackTimer = 0;
                winner.rushTimer = 0;
                winner.swordDashTimer = 0;
                winner.guarding = false;
                loser.state = 'lose';
                loser.knockdownTimer = 999999;
                loser.loseElapsed = 0;
                loser.attackTimer = 0;
                loser.rushTimer = 0;
                loser.swordDashTimer = 0;
                loser.guarding = false;
            }
            const perfectWin = !!winner && !timeout && winner.hp >= winner.maxHp;
            const playerLostToCpu = !!winner && FIGHT.mode === 'cpu' && winner === FIGHT.p2;
            FIGHT.message = !winner ? (timeout ? 'TIME UP' : 'DRAW GAME') : perfectWin ? 'PERFECT' : playerLostToCpu ? 'LOSE' : 'WIN';
            FIGHT.subMessage = winner ? `${winner.name} 胜利` : 'DRAW GAME';
            FIGHT.messageTimer = 1800;
            FIGHT.cameraShake = 12;
        }

        if (FIGHT.roundEnding) {
            FIGHT.roundEndTimer = Math.max(0, FIGHT.roundEndTimer - dt * 1000);
            if (FIGHT.roundEndTimer <= 0) {
                if (FIGHT.p1.wins >= 2 || FIGHT.p2.wins >= 2 || FIGHT.round >= 3) {
                    const finalWinner = FIGHT.p1.wins === FIGHT.p2.wins ? null : FIGHT.p1.wins > FIGHT.p2.wins ? FIGHT.p1 : FIGHT.p2;
                    const finalPlayerLostToCpu = !!finalWinner && FIGHT.mode === 'cpu' && finalWinner === FIGHT.p2;
                    const finalMessage = !finalWinner ? 'DRAW GAME' : finalPlayerLostToCpu ? 'LOSE' : 'WIN';
                    const finalSubMessage = finalWinner ? `${finalWinner.name} 最终胜利` : '平局';
                    window.dispatchEvent(new CustomEvent('rosang:game-result', {
                        detail: { game: 'fight', victory: finalMessage === 'WIN', score: finalWinner ? finalWinner.wins * 100 : 0 },
                    }));
                    resetFightGame();
                    FIGHT.message = finalMessage;
                    FIGHT.subMessage = finalSubMessage;
                    FIGHT.messageTimer = 3000;
                    return;
                } else {
                    const p1Wins = FIGHT.p1.wins;
                    const p2Wins = FIGHT.p2.wins;
                    const p1Power = Math.min(100, FIGHT.p1.power + 18);
                    const p2Power = Math.min(100, FIGHT.p2.power + 18);
                    FIGHT.round += 1;
                    FIGHT.p1 = createFightPlayer('p1', FIGHT.selectedP1);
                    FIGHT.p2 = createFightPlayer('p2', FIGHT.selectedP2);
                    FIGHT.p1.wins = p1Wins;
                    FIGHT.p2.wins = p2Wins;
                    FIGHT.p1.power = p1Power;
                    FIGHT.p2.power = p2Power;
                    FIGHT.projectiles = [];
                    FIGHT.particles = [];
                    FIGHT.sparks = [];
                    FIGHT.afterimages = [];
                    FIGHT.hitStop = 0;
                    FIGHT.timer = FIGHT_ROUND_TIME;
                    FIGHT.countdown = 1050;
                    FIGHT.roundEnding = false;
                    FIGHT.message = `ROUND ${FIGHT.round}`;
                    FIGHT.subMessage = 'READY';
                    FIGHT.messageTimer = 1020;
                }
            }
        }
        updateFightHud();
    };

    const getFightSpriteAction = (player) => {
        const set = FIGHT_SPRITE_SETS[player.fighterId];
        if (!set) return null;
        if (player.guarding && player.crouching && set.actions.crouch) return 'crouch';
        const stateAction = {
            block: 'guard',
            guard: 'guard',
            hurt: 'hurt',
            jump: 'jump',
            crouch: 'crouch',
            knockdown: 'knockdown',
            getup: 'getup',
            win: 'win',
            lose: 'lose',
        }[player.state];
        if (stateAction && set.actions[stateAction]) return stateAction;
        if (player.state === 'getup' && set.actions.knockdown) return 'knockdown';
        if (player.state === 'lose' && set.actions.knockdown) return 'knockdown';
        const attack = player.attackProfile || getFightAttackProfile(player, player.attackType);
        if (player.attackTimer > 0 && attack) {
            if (player.attackType === 'special') {
                return 'specialCharge';
            }
            if (player.attackType === 'super') return 'super';
            if (set.actions[player.attackType]) return player.attackType;
        }
        if (player.state === 'walk' && set.actions.walk) return 'walk';
        if (player.state === 'idle' && set.actions.idle) return 'idle';
        return null;
    };

    const getFightSpriteFrame = (player, actionId, action, now) => {
        const attack = player.attackProfile || getFightAttackProfile(player, player.attackType);
        if (actionId === 'crouch') {
            return action.frames - 1;
        }
        if (actionId === 'getup') {
            const duration = Math.max(1, action.duration || 420);
            const elapsed = duration - Math.max(0, player.getupTimer || 0);
            return Math.min(action.frames - 1, Math.floor((elapsed / duration) * action.frames));
        }
        if (actionId === 'lose') {
            const duration = Math.max(1, action.duration || 900);
            const elapsed = Math.max(0, player.loseElapsed || 0);
            return Math.min(action.frames - 1, Math.floor((elapsed / duration) * action.frames));
        }
        if (actionId === 'knockdown') {
            if (player.state === 'getup') {
                const duration = Math.max(1, player.getupTimer || 420);
                const elapsed = 420 - duration;
                const forwardFrame = Math.min(action.frames - 1, Math.floor((elapsed / 420) * action.frames));
                return Math.max(0, action.frames - 1 - forwardFrame);
            }
            const duration = Math.max(1, action.duration || 720);
            const elapsed = Math.max(0, player.knockdownElapsed || 0);
            return Math.min(action.frames - 1, Math.floor((elapsed / duration) * action.frames));
        }
        if (player.attackTimer > 0 && attack) {
            let duration = Math.max(1, attack.startup + (attack.active || 0) + attack.recovery);
            let elapsed = Math.max(0, player.attackElapsed || 0);
            if (player.attackType === 'special' && actionId === 'specialCharge') {
                duration = Math.max(1, attack.startup);
                elapsed = Math.min(elapsed, duration - 1);
            }
            if (Array.isArray(action.frameWeights) && action.frameWeights.length >= action.frames) {
                const weights = action.frameWeights.slice(0, action.frames).map(weight => Math.max(0.1, weight || 1));
                const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
                const target = Math.min(totalWeight - 0.001, (elapsed / duration) * totalWeight);
                let passed = 0;
                for (let i = 0; i < weights.length; i += 1) {
                    passed += weights[i];
                    if (target < passed) return i;
                }
                return action.frames - 1;
            }
            return Math.min(action.frames - 1, Math.floor((elapsed / duration) * action.frames));
        }
        return Math.floor(now * 0.001 * action.fps) % action.frames;
    };

    const drawFightGroundShadow = (player, width = 96, height = 18) => {
        const heavy = player?.fighterId === 'flame' || player?.trait === 'flame';
        const shadowW = heavy ? 112 : width;
        const shadowH = heavy ? 20 : height;
        const grad = fightCtx.createRadialGradient(0, 9, 4, 0, 9, shadowW * 0.58);
        grad.addColorStop(0, heavy ? 'rgba(28,7,4,0.58)' : 'rgba(0,0,0,0.42)');
        grad.addColorStop(0.55, heavy ? 'rgba(15,6,6,0.42)' : 'rgba(0,0,0,0.28)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        fightCtx.fillStyle = grad;
        fightCtx.beginPath();
        fightCtx.ellipse(0, 10, shadowW * 0.5, shadowH * 0.55, 0, 0, Math.PI * 2);
        fightCtx.fill();
        if (heavy) {
            fightCtx.strokeStyle = 'rgba(255,80,28,0.18)';
            fightCtx.lineWidth = 2;
            fightCtx.beginPath();
            fightCtx.ellipse(0, 10, shadowW * 0.38, shadowH * 0.34, 0.02, 0.12, Math.PI * 1.06);
            fightCtx.stroke();
            fightCtx.strokeStyle = 'rgba(255,170,64,0.14)';
            fightCtx.lineWidth = 1.5;
            [[-34, 7, -18, 10], [5, 11, 28, 8], [-6, 14, 14, 15]].forEach(([x1, y1, x2, y2]) => {
                fightCtx.beginPath();
                fightCtx.moveTo(x1, y1);
                fightCtx.lineTo(x2, y2);
                fightCtx.stroke();
            });
        }
    };

    const getFightShadowOffsetX = (player, actionId = '') => {
        if (player?.fighterId === 'flame' && actionId === 'heavyPunch') return -32 * player.facing;
        return 0;
    };

    const drawFightGroundShadowAt = (player, x, y, width = 96, height = 18, actionId = '') => {
        const air = Math.max(0, FIGHT_FLOOR - player.y);
        const airScale = Math.max(0.58, 1 - air / 520);
        fightCtx.save();
        fightCtx.globalAlpha *= Math.max(0.32, airScale);
        fightCtx.translate(x + getFightShadowOffsetX(player, actionId), y);
        drawFightGroundShadow(player, width * airScale, height * airScale);
        fightCtx.restore();
    };

    const drawFightShieldEffect = (player, crouchOffset = 0, now) => {
        const set = FIGHT_SPRITE_SETS[player.fighterId];
        const effect = set?.effects?.shield;
        const img = effect ? fightSpriteImages.get(`${player.fighterId}:effect:shield`) : null;
        if (!effect || !img?.complete || !img.naturalWidth) return false;
        const frame = Math.floor(now * 0.001 * effect.fps) % effect.frames;
        const sx = Math.min(frame, effect.frames - 1) * effect.frameW;
        const standingCover = crouchOffset <= 0 ? 1.12 : 1;
        const drawW = effect.frameW * effect.scale * standingCover;
        const drawH = effect.frameH * effect.scale * standingCover;
        const drawX = -drawW / 2 + (effect.offsetX || 0);
        const drawY = -(effect.footY || effect.frameH) * effect.scale * standingCover + (effect.offsetY || 0) + crouchOffset + (crouchOffset <= 0 ? 22 : 0);
        fightCtx.save();
        fightCtx.globalAlpha *= 0.86;
        fightCtx.globalCompositeOperation = 'lighter';
        fightCtx.drawImage(img, sx, 0, effect.frameW, effect.frameH, drawX, drawY, drawW, drawH);
        fightCtx.restore();
        return true;
    };

    const drawFightSpritePlayer = (player, ghost = false, now) => {
        const set = FIGHT_SPRITE_SETS[player.fighterId];
        const actionId = getFightSpriteAction(player);
        const action = actionId ? set?.actions[actionId] : null;
        const img = action ? fightSpriteImages.get(`${player.fighterId}:${actionId}`) : null;
        if (!action || !img || !img.complete || !img.naturalWidth) return false;

        const frame = getFightSpriteFrame(player, actionId, action, now);
        const sx = Math.min(frame, action.frames - 1) * action.frameW;
        const drawW = action.frameW * action.scale;
        const drawH = action.frameH * action.scale;
        const drawX = -drawW / 2 + (action.offsetX || 0);
        const drawY = -(action.footY || action.frameH) * action.scale + (action.offsetY || 0);

        fightCtx.save();
        fightCtx.globalAlpha = ghost
            ? Math.max(0, (player.life || 0) / (player.maxLife || 1)) * 0.34
            : player.hurtTimer > 0 && Math.floor(now / 60) % 2 ? 0.72 : 1;
        if (!ghost) drawFightGroundShadowAt(player, player.x, FIGHT_FLOOR, Math.max(84, drawW * 0.56), 20, actionId);
        fightCtx.translate(player.x, player.y);
        if (!ghost && player.slowTimer > 0) {
            fightCtx.strokeStyle = 'rgba(126,215,255,0.72)';
            fightCtx.lineWidth = 3;
            fightCtx.beginPath();
            fightCtx.ellipse(0, 5, Math.max(52, drawW * 0.32), 15, 0, 0, Math.PI * 2);
            fightCtx.stroke();
        }
        fightCtx.scale(player.facing, 1);
        fightCtx.imageSmoothingEnabled = true;
        fightCtx.drawImage(img, sx, 0, action.frameW, action.frameH, drawX, drawY, drawW, drawH);
        if (!ghost && (player.guarding || player.state === 'block')) {
            drawFightShieldEffect(player, player.crouching ? 18 : 0, now);
        }
        fightCtx.restore();
        return true;
    };

    const getFightBackgroundCanvas = (bg, img) => {
        if (!bg || !img?.complete || !img.naturalWidth) return null;
        const key = `${FIGHT.activeBg}:${bg.id}:${img.naturalWidth}x${img.naturalHeight}:${FIGHT_WIDTH}x${FIGHT_HEIGHT}`;
        if (fightBackgroundCache?.key === key) return fightBackgroundCache.canvas;

        const canvas = document.createElement('canvas');
        canvas.width = FIGHT_WIDTH;
        canvas.height = FIGHT_HEIGHT;
        const ctx = canvas.getContext('2d');
        const scale = Math.max(FIGHT_WIDTH / img.naturalWidth, FIGHT_HEIGHT / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx.drawImage(img, (FIGHT_WIDTH - dw) / 2, (FIGHT_HEIGHT - dh) / 2, dw, dh);
        ctx.fillStyle = 'rgba(8,5,10,0.18)';
        ctx.fillRect(0, 0, FIGHT_WIDTH, FIGHT_HEIGHT);
        fightBackgroundCache = { key, canvas };
        return canvas;
    };

    const drawFightGame = (now = performance.now()) => {
        fightCanvasButtons = [];
        fightCtx.save();
        if (FIGHT.cameraShake > 0) {
            fightCtx.translate((Math.random() - 0.5) * FIGHT.cameraShake, (Math.random() - 0.5) * FIGHT.cameraShake);
        }

        const bg = getFightBackground(FIGHT.activeBg);
        const bgImg = fightBgImages.get(bg.id);
        const photoBg = getFightBackgroundCanvas(bg, bgImg);
        const hasPhotoBg = Boolean(photoBg);
        if (hasPhotoBg) {
            fightCtx.drawImage(photoBg, 0, 0);
        } else {
            const sky = fightCtx.createLinearGradient(0, 0, 0, FIGHT_HEIGHT);
            sky.addColorStop(0, '#251034');
            sky.addColorStop(0.48, '#3d1827');
            sky.addColorStop(1, '#120b13');
            fightCtx.fillStyle = sky;
            fightCtx.fillRect(0, 0, FIGHT_WIDTH, FIGHT_HEIGHT);
        }

        if (!hasPhotoBg) {
        fightCtx.fillStyle = 'rgba(255,196,87,0.9)';
        fightCtx.font = '900 38px sans-serif';
        fightCtx.textAlign = 'center';
        fightCtx.fillText('RONG FIGHTERS', FIGHT_CENTER_X, 78);
        fightCtx.font = '700 14px sans-serif';
        fightCtx.fillStyle = 'rgba(255,255,255,0.68)';
        fightCtx.fillText('NEON ROOFTOP ARENA', FIGHT_CENTER_X, 100);

        for (let i = 0; i < 10; i++) {
            const x = i * 86 - 20;
            const h = 130 + (i % 4) * 34;
            fightCtx.fillStyle = i % 2 ? '#1a1630' : '#24152b';
            fightCtx.fillRect(x, 230 - h * 0.45, 74, h);
            fightCtx.fillStyle = 'rgba(255,214,118,0.5)';
            for (let y = 120; y < 250; y += 24) {
                if ((i + y) % 3 !== 0) fightCtx.fillRect(x + 12, y, 12, 8);
                if ((i + y) % 4 !== 0) fightCtx.fillRect(x + 42, y + 4, 12, 8);
            }
        }

        fightCtx.fillStyle = 'rgba(0,0,0,0.34)';
        for (let i = 0; i < 32; i++) {
            const x = i * 28 + Math.sin(now * 0.002 + i) * 3;
            const y = 332 + (i % 3) * 9;
            fightCtx.beginPath();
            fightCtx.arc(x, y, 9, 0, Math.PI * 2);
            fightCtx.fill();
            fightCtx.fillRect(x - 7, y + 8, 14, 26);
        }
        fightCtx.fillStyle = '#2a1721';
        fightCtx.fillRect(0, 360, FIGHT_WIDTH, 110);
        const floorGrad = fightCtx.createLinearGradient(0, 392, 0, FIGHT_HEIGHT);
        floorGrad.addColorStop(0, '#6d2430');
        floorGrad.addColorStop(0.5, '#321920');
        floorGrad.addColorStop(1, '#140d12');
        fightCtx.fillStyle = floorGrad;
        fightCtx.fillRect(0, FIGHT_FLOOR, FIGHT_WIDTH, FIGHT_HEIGHT - FIGHT_FLOOR);
        fightCtx.strokeStyle = 'rgba(255,196,87,0.28)';
        fightCtx.lineWidth = 2;
        for (let x = -120; x < FIGHT_WIDTH + 160; x += 80) {
            fightCtx.beginPath();
            fightCtx.moveTo(x, FIGHT_HEIGHT);
            fightCtx.lineTo(FIGHT_CENTER_X + (x - FIGHT_CENTER_X) * 0.25, FIGHT_FLOOR);
            fightCtx.stroke();
        }
        for (let y = FIGHT_FLOOR + 22; y < FIGHT_HEIGHT; y += 28) {
            fightCtx.beginPath();
            fightCtx.moveTo(0, y);
            fightCtx.lineTo(FIGHT_WIDTH, y);
            fightCtx.stroke();
        }
        }

        const drawFightHealthBar = (x, y, w, h, pct, color, reverse = false) => {
            const ratio = clampFight01(pct || 0);
            const inset = 4;
            const skew = 9;
            const innerX = x + inset;
            const innerY = y + inset;
            const innerW = Math.max(0, w - inset * 2);
            const innerH = Math.max(0, h - inset * 2);
            const fillW = innerW * ratio;
            const fillX = reverse ? innerX + innerW - fillW : innerX;

            const traceBar = (left, top, width, height, skewSize) => {
                fightCtx.beginPath();
                fightCtx.moveTo(left + skewSize, top);
                fightCtx.lineTo(left + width, top);
                fightCtx.lineTo(left + width - skewSize, top + height);
                fightCtx.lineTo(left, top + height);
                fightCtx.closePath();
            };

            fightCtx.save();
            traceBar(x, y, w, h, skew);
            const frame = fightCtx.createLinearGradient(x, y, x, y + h);
            frame.addColorStop(0, '#fff0a8');
            frame.addColorStop(0.42, '#b78b30');
            frame.addColorStop(1, '#4a3415');
            fightCtx.fillStyle = frame;
            fightCtx.fill();
            fightCtx.strokeStyle = 'rgba(255,244,184,0.82)';
            fightCtx.lineWidth = 1.2;
            fightCtx.stroke();

            traceBar(innerX, innerY, innerW, innerH, Math.max(3, skew - inset));
            const empty = fightCtx.createLinearGradient(innerX, innerY, innerX, innerY + innerH);
            empty.addColorStop(0, '#8b8774');
            empty.addColorStop(0.5, '#59584d');
            empty.addColorStop(1, '#2f302c');
            fightCtx.fillStyle = empty;
            fightCtx.fill();

            fightCtx.save();
            traceBar(innerX, innerY, innerW, innerH, Math.max(3, skew - inset));
            fightCtx.clip();
            fightCtx.strokeStyle = 'rgba(255,255,255,0.22)';
            fightCtx.lineWidth = 1;
            for (let sx = innerX - innerH; sx < innerX + innerW + innerH; sx += 28) {
                fightCtx.beginPath();
                fightCtx.moveTo(sx, innerY + innerH);
                fightCtx.lineTo(sx + innerH * 0.62, innerY);
                fightCtx.stroke();
            }

            if (fillW > 0) {
                fightCtx.beginPath();
                fightCtx.rect(fillX, innerY, fillW, innerH);
                fightCtx.clip();
                const fill = fightCtx.createLinearGradient(innerX, innerY, innerX, innerY + innerH);
                fill.addColorStop(0, '#fff1a8');
                fill.addColorStop(0.18, color);
                fill.addColorStop(0.68, color);
                fill.addColorStop(1, reverse ? '#097bad' : '#9f1d18');
                fightCtx.fillStyle = fill;
                fightCtx.fillRect(innerX - 1, innerY - 1, innerW + 2, innerH + 2);
                fightCtx.strokeStyle = 'rgba(255,255,255,0.34)';
                for (let sx = innerX - innerH; sx < innerX + innerW + innerH; sx += 28) {
                    fightCtx.beginPath();
                    fightCtx.moveTo(sx, innerY + innerH);
                    fightCtx.lineTo(sx + innerH * 0.62, innerY);
                    fightCtx.stroke();
                }
            }
            fightCtx.restore();

            if (ratio < 0.995) {
                const edgeX = reverse ? fillX : fillX + fillW;
                fightCtx.strokeStyle = 'rgba(255,240,168,0.8)';
                fightCtx.lineWidth = 1.2;
                fightCtx.beginPath();
                fightCtx.moveTo(edgeX + (reverse ? Math.max(3, skew - inset) : 0), innerY);
                fightCtx.lineTo(edgeX + (reverse ? 0 : -Math.max(3, skew - inset)), innerY + innerH);
                fightCtx.stroke();
            }
            fightCtx.restore();
        };

        const drawFightRageBar = (x, y, w, h, pct, reverse = false) => {
            const ratio = clampFight01(pct || 0);
            const frameDrawn = drawFightUiExactImage('angerPower', x - 8, y - 4, w + 16, h + 8, 0.72);
            const img = fightUiImages.get('ragebarFull');
            if (!img?.complete || !img.naturalWidth) {
                drawHudBar(x, y + 7, w, Math.max(8, h - 14), ratio, '#ff8d2f', reverse);
                return;
            }

            fightCtx.save();
            fightCtx.globalAlpha = 0.34;
            fightCtx.filter = 'grayscale(1) brightness(0.42) saturate(0.65)';
            fightCtx.drawImage(img, x, y, w, h);
            fightCtx.restore();

            if (!frameDrawn) {
                fightCtx.save();
                fightCtx.strokeStyle = 'rgba(255,196,87,0.74)';
                fightCtx.lineWidth = 1.5;
                fightCtx.strokeRect(x - 2, y - 2, w + 4, h + 4);
                fightCtx.restore();
            }

            const sourceW = Math.max(0, Math.round(img.naturalWidth * ratio));
            const drawW = Math.max(0, w * ratio);
            if (sourceW <= 0 || drawW <= 0) return;

            const sx = reverse ? img.naturalWidth - sourceW : 0;
            const dx = reverse ? x + w - drawW : x;
            fightCtx.save();
            fightCtx.shadowColor = 'rgba(255,90,18,0.52)';
            fightCtx.shadowBlur = 8;
            fightCtx.drawImage(img, sx, 0, sourceW, img.naturalHeight, dx, y, drawW, h);
            fightCtx.restore();
        };

        const drawHudBar = (x, y, w, h, pct, color, reverse = false, spriteId = '') => {
            const ratio = clampFight01(pct || 0);
            if (spriteId === 'healthbarRedLarge' || spriteId === 'healthbarBlueLarge') {
                if (drawFightLargeHealthBar(spriteId, x, y, w, h, ratio, reverse)) return;
                const fallbackId = spriteId === 'healthbarRedLarge' ? 'healthbarRed' : 'healthbarBlue';
                if (drawFightUiExactBar(fallbackId, x + 12, y + 15, w - 24, 20, ratio, reverse, 1)) return;
            }
            if (spriteId === 'healthbarRed' || spriteId === 'healthbarBlue') {
                drawFightHealthBar(x, y, w, h, ratio, color, reverse);
                return;
            }
            fightCtx.fillStyle = 'rgba(0,0,0,0.62)';
            fightCtx.strokeStyle = 'rgba(255,255,255,0.55)';
            fightCtx.lineWidth = 2;
            fightCtx.beginPath();
            fightCtx.roundRect(x, y, w, h, 5);
            fightCtx.fill();
            fightCtx.stroke();
            const fillW = Math.max(0, w * ratio);
            const fillX = reverse ? x + w - fillW : x;
            const grad = fightCtx.createLinearGradient(fillX, y, fillX + fillW, y);
            grad.addColorStop(0, color);
            grad.addColorStop(1, '#fff09b');
            fightCtx.fillStyle = grad;
                fightCtx.fillRect(fillX + 3, y + 3, Math.max(0, fillW - 6), h - 6);
        };

        drawHudBar(100, 20, 300, 52, FIGHT.p1.hp / FIGHT.p1.maxHp, FIGHT_P1_COLOR, false, 'healthbarRedLarge');
        drawHudBar(FIGHT_WIDTH - 400, 20, 300, 52, FIGHT.p2.hp / FIGHT.p2.maxHp, FIGHT_P2_COLOR, true, 'healthbarBlueLarge');
        drawFightRageBar(124, 48, 204, 27, FIGHT.p1.power / 100);
        drawFightRageBar(FIGHT_WIDTH - 328, 48, 204, 27, FIGHT.p2.power / 100, true);
        drawHudBar(130, 78, 180, 7, FIGHT.p1.knockdownGauge / FIGHT_KNOCKDOWN_MAX, '#ff9d2e');
        drawHudBar(FIGHT_WIDTH - 310, 78, 180, 7, FIGHT.p2.knockdownGauge / FIGHT_KNOCKDOWN_MAX, '#ff9d2e', true);
        const drawPowerState = (player, x, y, align = 'left') => {
            if (player.power >= FIGHT_MAX_POWER) {
                drawFightUiSprite('max', x, y, { maxW: 74, maxH: 30, align, shadowBlur: 8, shadowOffsetY: 2 });
            } else if (player.power >= FIGHT_SPECIAL_POWER_COST) {
                drawFightUiSprite('skill', x, y, { maxW: 72, maxH: 28, align, shadowBlur: 8, shadowOffsetY: 2 });
            }
        };
        drawPowerState(FIGHT.p1, 336, 64, 'left');
        drawPowerState(FIGHT.p2, FIGHT_WIDTH - 336, 64, 'right');
        if (FIGHT.p1.hp / FIGHT.p1.maxHp <= 0.25) {
            drawFightUiSprite('danger', 194, 102, { maxW: 116, maxH: 42, shadowBlur: 10, shadowOffsetY: 2 });
        }
        if (FIGHT.p2.hp / FIGHT.p2.maxHp <= 0.25) {
            drawFightUiSprite('danger', FIGHT_WIDTH - 194, 102, { maxW: 116, maxH: 42, shadowBlur: 10, shadowOffsetY: 2 });
        }
        fightCtx.textAlign = 'left';
        fightCtx.font = '900 18px sans-serif';
        fightCtx.fillStyle = FIGHT_P1_COLOR;
        const p1BadgeDrawn = drawFightUiSprite('p1', 48, 35, { maxW: 88, maxH: 44, align: 'left', shadowBlur: 8, shadowOffsetY: 2 });
        fightCtx.fillText(FIGHT.p1.name, p1BadgeDrawn ? 112 : 48, 20);
        fightCtx.textAlign = 'right';
        fightCtx.fillStyle = FIGHT_P2_COLOR;
        const p2BadgeDrawn = drawFightUiSprite('p2', FIGHT_WIDTH - 48, 35, { maxW: 88, maxH: 44, align: 'right', shadowBlur: 8, shadowOffsetY: 2 });
        fightCtx.fillText(FIGHT.p2.name, p2BadgeDrawn ? FIGHT_WIDTH - 112 : FIGHT_WIDTH - 48, 20);
        fightCtx.textAlign = 'center';
        const timerPanelDrawn = drawFightUiSprite('countdownPanel', FIGHT_CENTER_X, 48, { maxW: 126, maxH: 62, shadowBlur: 8, shadowOffsetY: 2 });
        const timerFrameDrawn = drawFightUiSprite('timerFrame', FIGHT_CENTER_X, 48, { maxW: 82, maxH: 48, alpha: timerPanelDrawn ? 0.92 : 1, shadowBlur: 8, shadowOffsetY: 2 });
        if (!timerPanelDrawn && !timerFrameDrawn) {
                fightCtx.fillStyle = '#0b0b10';
                fightCtx.strokeStyle = '#fff1a8';
                fightCtx.lineWidth = 3;
                fightCtx.beginPath();
                fightCtx.roundRect(FIGHT_CENTER_X - 46, 18, 92, 58, 10);
                fightCtx.fill();
                fightCtx.stroke();
        }
        if (!drawFightDigits(Math.max(0, Math.ceil(FIGHT.timer)).toString().padStart(2, '0'), FIGHT_CENTER_X, 47, { height: 32, spacing: -7 })) {
            fightCtx.fillStyle = '#fff1a8';
            fightCtx.font = '900 34px monospace';
            fightCtx.fillText(Math.max(0, Math.ceil(FIGHT.timer)).toString().padStart(2, '0'), FIGHT_CENTER_X, 58);
        }
        [FIGHT.p1, FIGHT.p2].forEach((p, side) => {
            for (let i = 0; i < 2; i++) {
                fightCtx.fillStyle = i < p.wins ? '#ffdf6a' : 'rgba(255,255,255,0.16)';
                fightCtx.beginPath();
                fightCtx.arc(side === 0 ? 48 + i * 18 : FIGHT_WIDTH - 80 + i * 18, 76, 6, 0, Math.PI * 2);
                fightCtx.fill();
            }
        });

        const drawPlayer = (p, ghost = false) => {
            if (drawFightSpritePlayer(p, ghost, now)) return;
            const palette = p.palette;
            if (!ghost && (p.state === 'knockdown' || p.state === 'lose')) {
                fightCtx.save();
                drawFightGroundShadowAt(p, p.x, FIGHT_FLOOR, 112, 18);
                fightCtx.translate(p.x, p.y + 2);
                fightCtx.scale(p.facing, 1);
                fightCtx.globalAlpha = p.hurtTimer > 0 && Math.floor(now / 60) % 2 ? 0.72 : 1;
                fightCtx.rotate(-0.12);
                fightCtx.fillStyle = palette.dark;
                fightCtx.strokeStyle = '#21141a';
                fightCtx.lineWidth = 4;
                fightCtx.beginPath();
                fightCtx.roundRect(-54, -28, 92, 34, 14);
                fightCtx.fill();
                fightCtx.stroke();
                fightCtx.fillStyle = palette.suit;
                fightCtx.beginPath();
                fightCtx.roundRect(-28, -36, 56, 42, 13);
                fightCtx.fill();
                fightCtx.stroke();
                fightCtx.fillStyle = palette.skin;
                fightCtx.beginPath();
                fightCtx.ellipse(45, -28, 18, 20, -0.18, 0, Math.PI * 2);
                fightCtx.fill();
                fightCtx.stroke();
                fightCtx.fillStyle = palette.hair;
                fightCtx.beginPath();
                fightCtx.moveTo(34, -45);
                fightCtx.quadraticCurveTo(45, -64, 56, -45);
                fightCtx.quadraticCurveTo(50, -52, 34, -45);
                fightCtx.fill();
                fightCtx.restore();
                return;
            }
            if (!ghost && p.state === 'win') {
                fightCtx.save();
                drawFightGroundShadowAt(p, p.x, FIGHT_FLOOR, 102, 18);
                fightCtx.translate(p.x, p.y);
                fightCtx.scale(p.facing, 1);
                fightCtx.lineCap = 'round';
                fightCtx.strokeStyle = '#21141a';
                fightCtx.lineWidth = 16;
                fightCtx.beginPath();
                fightCtx.moveTo(-16, -52);
                fightCtx.lineTo(-28, 4);
                fightCtx.moveTo(16, -52);
                fightCtx.lineTo(28, 4);
                fightCtx.moveTo(-18, -96);
                fightCtx.lineTo(-36, -138);
                fightCtx.moveTo(18, -96);
                fightCtx.lineTo(36, -138);
                fightCtx.stroke();
                fightCtx.strokeStyle = palette.dark;
                fightCtx.lineWidth = 10;
                fightCtx.stroke();
                fightCtx.fillStyle = palette.suit;
                fightCtx.strokeStyle = '#21141a';
                fightCtx.lineWidth = 3;
                fightCtx.beginPath();
                fightCtx.roundRect(-30, -112, 60, 66, 16);
                fightCtx.fill();
                fightCtx.stroke();
                fightCtx.fillStyle = palette.skin;
                fightCtx.beginPath();
                fightCtx.ellipse(0, -136, 19, 23, 0, 0, Math.PI * 2);
                fightCtx.fill();
                fightCtx.stroke();
                fightCtx.fillStyle = palette.hair;
                fightCtx.beginPath();
                fightCtx.moveTo(-20, -150);
                fightCtx.quadraticCurveTo(0, -174, 20, -150);
                fightCtx.quadraticCurveTo(7, -158, -20, -150);
                fightCtx.fill();
                fightCtx.restore();
                return;
            }
            const t = now;
            const walkPhase = Math.sin(t * 0.018);
            const bob = p.state === 'walk' ? walkPhase * 3 : 0;
            const crouch = p.crouching ? 18 : 0;
            const hurtLean = p.hurtTimer > 0 ? -p.facing * 8 : 0;
            const attack = p.attackProfile || getFightAttackProfile(p, p.attackType);
            const attackingNow = p.attackTimer > 0 && attack;
            const motion = getFightAttackMotion(p, attack);
            const active = attackingNow && motion.active;
            const strike = motion.strike;
            const wind = motion.wind;
            const recover = motion.recover;
            const punchTarget = p.attackType === 'lightPunch' ? 38 : p.attackType === 'heavyPunch' ? 64 : p.attackType === 'super' ? 76 : 22;
            const punchReach = 22 - wind * 17 + strike * (punchTarget + wind * 8) - recover * 14;
            const punchTargetY = p.attackType === 'heavyPunch' ? -62 + crouch : p.attackType === 'super' ? -88 + crouch : -74 + crouch;
            const punchY = -74 + crouch - wind * 10 + (punchTargetY + 74 - crouch) * strike + recover * 8;
            const kickTarget = p.attackType === 'heavyKick' ? 76 : p.attackType === 'lightKick' ? 58 : 24;
            const kickReach = 24 - wind * 14 + strike * (kickTarget + wind * 9) - recover * 16;
            const kickTargetY = p.attackType === 'heavyKick' ? -58 : p.attackType === 'lightKick' ? -22 : -8;
            const kickY = -8 + wind * 8 + (kickTargetY + 8) * strike + recover * 8;
            const torsoShift = (p.state === 'walk' ? walkPhase * 2 : p.guarding ? -5 : 0) - wind * 5 + strike * 7 - recover * 3;
            const shoulderY = -106 + crouch;
            const hipY = -48 + crouch;
            const leadArmX = punchReach;
            const leadArmY = punchY;
            const rearArmX = p.guarding ? -2 : -30 - wind * 8 + strike * 4;
            const rearArmY = p.guarding ? -82 + crouch : -62 + crouch - wind * 12 + strike * 6;
            const leadLegKneeX = active && ['lightKick', 'heavyKick'].includes(p.attackType) ? kickReach * 0.52 : 14 + walkPhase * 5;
            const leadLegKneeY = active && ['lightKick', 'heavyKick'].includes(p.attackType) ? kickY + 18 : -18;
            const leadFootX = active && ['lightKick', 'heavyKick'].includes(p.attackType) ? kickReach + 18 : 22 + walkPhase * 5;
            const leadFootY = active && ['lightKick', 'heavyKick'].includes(p.attackType) ? kickY + 8 : 4;
            const rearFootX = -26 - walkPhase * 4 - wind * 6;
            const attackLean = attackingNow ? -wind * 7 + strike * 10 - recover * 5 : 0;
            const squashX = 1 + strike * 0.035 - wind * 0.02;
            const squashY = 1 - strike * 0.025 + wind * 0.02;

            fightCtx.save();
            if (!ghost) drawFightGroundShadowAt(p, p.x, FIGHT_FLOOR, 98, 18, p.attackType);
            fightCtx.translate(p.x, p.y);
            fightCtx.translate(p.facing * (strike * 8 - wind * 4), bob + wind * 3 - strike * 2);
            fightCtx.scale(p.facing * squashX, squashY);
            fightCtx.rotate((hurtLean + attackLean) * Math.PI / 360);
            fightCtx.globalAlpha = ghost ? Math.max(0, (p.life || 0) / (p.maxLife || 1)) * 0.34 : p.hurtTimer > 0 && Math.floor(now / 60) % 2 ? 0.72 : 1;
            if (ghost) {
                fightCtx.shadowColor = palette.trim;
                fightCtx.shadowBlur = 16;
            }
            if (!ghost && p.slowTimer > 0) {
                fightCtx.strokeStyle = 'rgba(126,215,255,0.72)';
                fightCtx.lineWidth = 3;
                fightCtx.beginPath();
                fightCtx.ellipse(0, 5, 56 + Math.sin(t * 0.014) * 4, 15, 0, 0, Math.PI * 2);
                fightCtx.stroke();
            }

            fightCtx.lineCap = 'round';
            fightCtx.lineJoin = 'round';

            const drawLimb = (points, width, outer, inner) => {
                fightCtx.strokeStyle = outer;
                fightCtx.lineWidth = width;
                fightCtx.beginPath();
                fightCtx.moveTo(points[0][0], points[0][1]);
                for (let i = 1; i < points.length; i++) fightCtx.lineTo(points[i][0], points[i][1]);
                fightCtx.stroke();
                fightCtx.strokeStyle = inner;
                fightCtx.lineWidth = Math.max(2, width - 6);
                fightCtx.beginPath();
                fightCtx.moveTo(points[0][0], points[0][1]);
                for (let i = 1; i < points.length; i++) fightCtx.lineTo(points[i][0], points[i][1]);
                fightCtx.stroke();
            };

            drawLimb([[-13, hipY], [-24 - walkPhase * 4, -18], [rearFootX, 4]], 18, '#20171a', palette.dark);
            drawLimb([[13, hipY], [leadLegKneeX, leadLegKneeY], [leadFootX, leadFootY]], 18, '#20171a', palette.dark);

            fightCtx.fillStyle = '#171116';
            fightCtx.beginPath();
            fightCtx.ellipse(rearFootX - 4, 7, 20, 7, -0.1, 0, Math.PI * 2);
            fightCtx.fill();
            fightCtx.beginPath();
            fightCtx.ellipse(leadFootX + 2, leadFootY + 3, active && ['lightKick', 'heavyKick'].includes(p.attackType) ? 22 : 20, 7, 0.08, 0, Math.PI * 2);
            fightCtx.fill();

            const bodyGrad = fightCtx.createLinearGradient(-28, shoulderY, 28, hipY);
            bodyGrad.addColorStop(0, palette.trim);
            bodyGrad.addColorStop(0.28, palette.suit);
            bodyGrad.addColorStop(1, palette.dark);
            fightCtx.fillStyle = bodyGrad;
            fightCtx.strokeStyle = '#21141a';
            fightCtx.lineWidth = 3.2;
            fightCtx.beginPath();
            fightCtx.moveTo(-27 + torsoShift, shoulderY + 8);
            fightCtx.quadraticCurveTo(-31 + torsoShift, -80 + crouch, -18, hipY);
            fightCtx.lineTo(18, hipY);
            fightCtx.quadraticCurveTo(31 + torsoShift, -80 + crouch, 27 + torsoShift, shoulderY + 8);
            fightCtx.quadraticCurveTo(8 + torsoShift, shoulderY - 8, -27 + torsoShift, shoulderY + 8);
            fightCtx.closePath();
            fightCtx.fill();
            fightCtx.stroke();
            fightCtx.fillStyle = 'rgba(255,255,255,0.18)';
            fightCtx.beginPath();
            fightCtx.moveTo(-6 + torsoShift, shoulderY + 2);
            fightCtx.lineTo(12 + torsoShift, shoulderY + 9);
            fightCtx.lineTo(4, hipY - 4);
            fightCtx.lineTo(-8, hipY - 8);
            fightCtx.closePath();
            fightCtx.fill();
            fightCtx.fillStyle = '#1d1217';
            fightCtx.fillRect(-21, hipY - 4, 42, 7);

            drawLimb([[-19 + torsoShift, -93 + crouch], [rearArmX, rearArmY], [rearArmX + 5, rearArmY + 20]], 15, '#21141a', palette.dark);
            drawLimb([[19 + torsoShift, -93 + crouch], [leadArmX * 0.58, leadArmY + 5], [leadArmX, leadArmY]], p.attackType === 'heavyPunch' && active ? 17 : 14, '#21141a', palette.dark);

            fightCtx.fillStyle = palette.glove;
            fightCtx.beginPath();
            fightCtx.ellipse(leadArmX + 8, leadArmY, p.attackType === 'heavyPunch' && active ? 15 : 12, p.attackType === 'heavyPunch' && active ? 12 : 10, 0, 0, Math.PI * 2);
            fightCtx.fill();
            fightCtx.beginPath();
            fightCtx.ellipse(rearArmX + 5, rearArmY + 21, 11, 9, 0, 0, Math.PI * 2);
            fightCtx.fill();
            fightCtx.strokeStyle = 'rgba(0,0,0,0.45)';
            fightCtx.lineWidth = 2;
            fightCtx.stroke();

            fightCtx.fillStyle = palette.skin;
            fightCtx.strokeStyle = '#25161b';
            fightCtx.lineWidth = 3;
            fightCtx.fillRect(-7, -116 + crouch, 14, 16);
            fightCtx.beginPath();
            fightCtx.ellipse(1, -134 + crouch, 18, 23, -0.06, 0, Math.PI * 2);
            fightCtx.fill();
            fightCtx.stroke();
            fightCtx.fillStyle = 'rgba(255,255,255,0.18)';
            fightCtx.beginPath();
            fightCtx.ellipse(7, -141 + crouch, 5, 8, -0.25, 0, Math.PI * 2);
            fightCtx.fill();

            fightCtx.fillStyle = palette.hair;
            fightCtx.beginPath();
            fightCtx.moveTo(-19, -145 + crouch);
            fightCtx.quadraticCurveTo(-14, -165 + crouch, -5, -151 + crouch);
            fightCtx.quadraticCurveTo(2, -171 + crouch, 9, -151 + crouch);
            fightCtx.quadraticCurveTo(20, -160 + crouch, 18, -137 + crouch);
            fightCtx.quadraticCurveTo(5, -149 + crouch, -19, -145 + crouch);
            fightCtx.closePath();
            fightCtx.fill();
            fightCtx.fillStyle = '#161018';
            fightCtx.fillRect(6, -135 + crouch, 5, 3);
            fightCtx.strokeStyle = '#161018';
            fightCtx.lineWidth = 2;
            fightCtx.beginPath();
            fightCtx.moveTo(3, -125 + crouch);
            fightCtx.lineTo(12, -124 + crouch);
            fightCtx.stroke();

            if (p.guarding || p.state === 'block') {
                if (!drawFightShieldEffect(p, crouch, now)) {
                    fightCtx.strokeStyle = 'rgba(154,215,255,0.78)';
                    fightCtx.lineWidth = 5;
                    fightCtx.beginPath();
                    fightCtx.arc(22, -76 + crouch, 34, -1.2, 1.2);
                    fightCtx.stroke();
                }
            }
            if (active && !attack?.projectile && !ghost) {
                const slashX = p.attackType === 'heavyKick' ? 78 : p.attackType === 'lightKick' ? 62 : 56;
                const slashY = p.attackType === 'lightKick' ? -26 : p.attackType === 'heavyKick' ? -58 : punchY;
                const slashRadius = attack?.super ? 68 : p.attackType === 'heavyPunch' || p.attackType === 'heavyKick' ? 42 : 28;
                for (let i = 0; i < 3; i += 1) {
                    fightCtx.globalAlpha = 0.72 - i * 0.18;
                    fightCtx.strokeStyle = i === 0 ? (attack?.super ? '#fff1a8' : '#ffdf6a') : 'rgba(255,255,255,0.72)';
                    fightCtx.lineWidth = (attack?.super ? 8 : p.attackType === 'heavyPunch' || p.attackType === 'heavyKick' ? 6 : 4) - i;
                    fightCtx.beginPath();
                    fightCtx.arc(slashX - i * 7, slashY + i * 3, slashRadius + i * 8, -0.86, 0.72);
                    fightCtx.stroke();
                }
                fightCtx.globalAlpha = 1;
            }
            fightCtx.restore();
            fightCtx.shadowBlur = 0;
            fightCtx.globalAlpha = 1;
        };

        FIGHT.afterimages.forEach(img => drawPlayer(img, true));
        const first = FIGHT.p1.y <= FIGHT.p2.y ? FIGHT.p1 : FIGHT.p2;
        const second = first === FIGHT.p1 ? FIGHT.p2 : FIGHT.p1;
        drawPlayer(first);
        drawPlayer(second);

        FIGHT.projectiles.forEach(p => {
            const set = p.spriteFighterId ? FIGHT_SPRITE_SETS[p.spriteFighterId] : null;
            const projectile = p.spriteId ? set?.projectiles?.[p.spriteId] : null;
            const img = projectile ? fightSpriteImages.get(`${p.spriteFighterId}:projectile:${p.spriteId}`) : null;
            if (projectile && img?.complete && img.naturalWidth) {
                const frame = Math.floor((p.age || 0) * projectile.fps) % projectile.frames;
                const sx = Math.min(frame, projectile.frames - 1) * projectile.frameW;
                const drawW = projectile.frameW * projectile.scale;
                const drawH = projectile.frameH * projectile.scale;
                fightCtx.save();
                fightCtx.translate(p.x, p.y);
                fightCtx.scale(p.vx >= 0 ? 1 : -1, 1);
                fightCtx.drawImage(img, sx, 0, projectile.frameW, projectile.frameH, -drawW / 2, -drawH / 2, drawW, drawH);
                fightCtx.restore();
            } else {
                const grad = fightCtx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.radius);
                grad.addColorStop(0, '#fff');
                grad.addColorStop(0.38, p.super ? '#fff1a8' : '#76f5ff');
                grad.addColorStop(1, p.super ? 'rgba(255,65,37,0.2)' : 'rgba(48,159,255,0.1)');
                fightCtx.fillStyle = grad;
                fightCtx.beginPath();
                fightCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                fightCtx.fill();
            }
        });

        FIGHT.particles.forEach(p => {
            fightCtx.globalAlpha = Math.max(0, p.life / (p.maxLife || 0.7));
            fightCtx.fillStyle = p.color;
            fightCtx.beginPath();
            fightCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            fightCtx.fill();
        });
        fightCtx.globalAlpha = 1;
        FIGHT.sparks.forEach(s => {
            fightCtx.globalAlpha = Math.max(0, s.life / 0.65);
            if (s.spriteId) {
                drawFightUiSprite(s.spriteId, s.x, s.y - 12, {
                    maxW: 116,
                    maxH: 64,
                    alpha: Math.max(0, s.life / 0.58) * 0.86,
                    shadowBlur: 10,
                    shadowOffsetY: 1,
                });
            }
            const numericSpark = drawFightDigits(s.label, s.x, s.y - 8, {
                spriteId: 'battleDigits',
                height: 34,
                spacing: -4,
                valign: 'bottom',
                shadowColor: s.color,
                shadowBlur: 10,
                shadowOffsetY: 1,
            });
            if (!numericSpark) {
                fightCtx.fillStyle = s.color;
                fightCtx.font = '900 18px sans-serif';
                fightCtx.textAlign = 'center';
                fightCtx.fillText(s.label, s.x, s.y);
            }
        });
        fightCtx.globalAlpha = 1;
        fightCtx.restore();

        if (FIGHT.superFlash > 0) {
            fightCtx.fillStyle = `rgba(255,255,255,${Math.min(0.38, FIGHT.superFlash)})`;
            fightCtx.fillRect(0, 0, FIGHT_WIDTH, FIGHT_HEIGHT);
        }

        drawFightMainMessage();

        if (!FIGHT.running && !FIGHT.gameOver) {
            fightCtx.fillStyle = 'rgba(0,0,0,0.62)';
            fightCtx.fillRect(0, 0, FIGHT_WIDTH, FIGHT_HEIGHT);

            const panelX = 36;
            const panelY = 34;
            const panelW = FIGHT_WIDTH - 72;
            const panelH = 532;
            const panelGrad = fightCtx.createLinearGradient(0, panelY, 0, panelY + panelH);
            panelGrad.addColorStop(0, 'rgba(22,16,24,0.96)');
            panelGrad.addColorStop(0.5, 'rgba(12,10,18,0.94)');
            panelGrad.addColorStop(1, 'rgba(28,14,17,0.96)');
            fightCtx.fillStyle = panelGrad;
            fightCtx.strokeStyle = 'rgba(255,196,87,0.55)';
            fightCtx.lineWidth = 2;
            fightCtx.beginPath();
            fightCtx.roundRect(panelX, panelY, panelW, panelH, 18);
            fightCtx.fill();
            fightCtx.stroke();

            fightCtx.textAlign = 'center';
            fightCtx.fillStyle = '#fff1a8';
            fightCtx.font = '900 30px sans-serif';
            fightCtx.fillText('SELECT YOUR FIGHTER', FIGHT_CENTER_X, 72);
            fightCtx.font = '800 14px sans-serif';
            fightCtx.fillStyle = 'rgba(255,255,255,0.72)';
            fightCtx.fillText('选择角色与擂台', FIGHT_CENTER_X, 96);
            drawFightUiSprite('vs', FIGHT_CENTER_X, 112, { maxW: 66, maxH: 54, shadowBlur: 10, shadowOffsetY: 2 });

            const p1Char = getFightChar(FIGHT.selectedP1);
            const p2Char = getFightChar(FIGHT.selectedP2);
            const bgName = getFightBackground(FIGHT.selectedBg).name;

            const drawMiniPortrait = (fighter, x, y, size, activeColor = '#fff1a8') => {
                const palette = fighter.palette;
                const cx = x + size / 2;
                const cy = y + size / 2;
                const iconImg = fightSpriteImages.get(`${fighter.id}:portrait:icon`) || fightSpriteImages.get(`${fighter.id}:portrait:lihui`);
                const tileGrad = fightCtx.createLinearGradient(x, y, x, y + size);
                tileGrad.addColorStop(0, palette.suit);
                tileGrad.addColorStop(1, palette.dark);
                fightCtx.fillStyle = tileGrad;
                fightCtx.beginPath();
                fightCtx.roundRect(x, y, size, size, 10);
                fightCtx.fill();
                if (iconImg?.complete && iconImg.naturalWidth) {
                    const headCrop = fighter.id === 'hancheying'
                        ? { sx: 350, sy: 18, size: 340 }
                        : null;
                    const crop = headCrop ? Math.min(headCrop.size, iconImg.naturalWidth, iconImg.naturalHeight) : Math.min(iconImg.naturalWidth, iconImg.naturalHeight);
                    const sx = headCrop ? Math.max(0, Math.min(iconImg.naturalWidth - crop, headCrop.sx)) : (iconImg.naturalWidth - crop) / 2;
                    const sy = headCrop ? Math.max(0, Math.min(iconImg.naturalHeight - crop, headCrop.sy)) : (iconImg.naturalHeight - crop) / 2;
                    fightCtx.save();
                    fightCtx.beginPath();
                    fightCtx.roundRect(x + 5, y + 5, size - 10, size - 10, 8);
                    fightCtx.clip();
                    fightCtx.drawImage(iconImg, sx, sy, crop, crop, x + 5, y + 5, size - 10, size - 10);
                    fightCtx.restore();
                } else {
                    fightCtx.fillStyle = 'rgba(0,0,0,0.25)';
                    fightCtx.fillRect(x, y + size * 0.58, size, size * 0.42);
                    fightCtx.fillStyle = palette.skin;
                    fightCtx.beginPath();
                    fightCtx.ellipse(cx, cy - size * 0.12, size * 0.18, size * 0.23, 0, 0, Math.PI * 2);
                    fightCtx.fill();
                    fightCtx.fillStyle = palette.hair;
                    fightCtx.beginPath();
                    fightCtx.moveTo(cx - size * 0.22, cy - size * 0.24);
                    fightCtx.quadraticCurveTo(cx, cy - size * 0.48, cx + size * 0.22, cy - size * 0.22);
                    fightCtx.lineTo(cx + size * 0.18, cy - size * 0.04);
                    fightCtx.quadraticCurveTo(cx, cy - size * 0.16, cx - size * 0.22, cy - size * 0.04);
                    fightCtx.closePath();
                    fightCtx.fill();
                    fightCtx.fillStyle = palette.trim;
                    fightCtx.beginPath();
                    fightCtx.roundRect(cx - size * 0.23, cy + size * 0.12, size * 0.46, size * 0.22, 8);
                    fightCtx.fill();
                }
                fightCtx.strokeStyle = activeColor;
                fightCtx.lineWidth = 2;
                fightCtx.strokeRect(x + 5, y + 5, size - 10, size - 10);
            };

            const drawPreviewFighter = (fighter, x, y, facing) => {
                const palette = fighter.palette;
                fightCtx.save();
                fightCtx.translate(x, y);
                fightCtx.scale(facing * 0.92, 0.92);
                fightCtx.fillStyle = 'rgba(0,0,0,0.42)';
                fightCtx.beginPath();
                fightCtx.ellipse(0, 96, 60, 14, 0, 0, Math.PI * 2);
                fightCtx.fill();
                fightCtx.lineCap = 'round';
                fightCtx.lineJoin = 'round';
                const limb = (points, width, inner) => {
                    fightCtx.strokeStyle = '#1b1116';
                    fightCtx.lineWidth = width;
                    fightCtx.beginPath();
                    fightCtx.moveTo(points[0][0], points[0][1]);
                    for (let i = 1; i < points.length; i++) fightCtx.lineTo(points[i][0], points[i][1]);
                    fightCtx.stroke();
                    fightCtx.strokeStyle = inner;
                    fightCtx.lineWidth = width - 6;
                    fightCtx.beginPath();
                    fightCtx.moveTo(points[0][0], points[0][1]);
                    for (let i = 1; i < points.length; i++) fightCtx.lineTo(points[i][0], points[i][1]);
                    fightCtx.stroke();
                };
                limb([[-15, 22], [-34, 62], [-42, 92]], 18, palette.dark);
                limb([[15, 22], [30, 58], [46, 88]], 18, palette.dark);
                const bodyGrad = fightCtx.createLinearGradient(-28, -70, 28, 24);
                bodyGrad.addColorStop(0, palette.trim);
                bodyGrad.addColorStop(0.32, palette.suit);
                bodyGrad.addColorStop(1, palette.dark);
                fightCtx.fillStyle = bodyGrad;
                fightCtx.strokeStyle = '#21141a';
                fightCtx.lineWidth = 4;
                fightCtx.beginPath();
                fightCtx.moveTo(-30, -54);
                fightCtx.quadraticCurveTo(-34, -22, -20, 28);
                fightCtx.lineTo(20, 28);
                fightCtx.quadraticCurveTo(34, -22, 30, -54);
                fightCtx.quadraticCurveTo(0, -76, -30, -54);
                fightCtx.closePath();
                fightCtx.fill();
                fightCtx.stroke();
                limb([[-22, -48], [-52, -22], [-74, -8]], 15, palette.dark);
                limb([[22, -48], [54, -70], [82, -72]], 15, palette.dark);
                fightCtx.fillStyle = palette.glove;
                fightCtx.beginPath();
                fightCtx.ellipse(88, -72, 14, 11, 0, 0, Math.PI * 2);
                fightCtx.fill();
                fightCtx.beginPath();
                fightCtx.ellipse(-78, -8, 13, 10, 0, 0, Math.PI * 2);
                fightCtx.fill();
                fightCtx.fillStyle = palette.skin;
                fightCtx.fillRect(-7, -84, 14, 18);
                fightCtx.beginPath();
                fightCtx.ellipse(0, -106, 20, 25, 0, 0, Math.PI * 2);
                fightCtx.fill();
                fightCtx.stroke();
                fightCtx.fillStyle = palette.hair;
                fightCtx.beginPath();
                fightCtx.moveTo(-22, -116);
                fightCtx.quadraticCurveTo(-8, -142, 4, -124);
                fightCtx.quadraticCurveTo(18, -142, 22, -108);
                fightCtx.quadraticCurveTo(2, -120, -22, -116);
                fightCtx.fill();
                fightCtx.restore();
            };

            const drawPortraitPreview = (fighter, centerX, bottomY, facing, tagColor) => {
                const img = fightSpriteImages.get(`${fighter.id}:portrait:lihui`);
                if (!img?.complete || !img.naturalWidth) return false;
                const maxH = 360;
                const maxW = 278;
                const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
                const drawW = img.naturalWidth * scale;
                const drawH = img.naturalHeight * scale;
                fightCtx.save();
                fightCtx.fillStyle = 'rgba(0,0,0,0.44)';
                fightCtx.beginPath();
                fightCtx.ellipse(centerX, bottomY + 3, drawW * 0.38, 15, 0, 0, Math.PI * 2);
                fightCtx.fill();
                fightCtx.shadowColor = tagColor;
                fightCtx.shadowBlur = 18;
                fightCtx.translate(centerX, bottomY - drawH);
                if (facing < 0) {
                    fightCtx.scale(-1, 1);
                    fightCtx.drawImage(img, -drawW / 2, 0, drawW, drawH);
                } else {
                    fightCtx.drawImage(img, -drawW / 2, 0, drawW, drawH);
                }
                fightCtx.restore();
                return true;
            };

            const drawCharacterPreview = (fighter, x, y, facing, tagColor) => {
                if (drawPortraitPreview(fighter, x, 486, facing, tagColor)) return;
                drawPreviewFighter(fighter, x, y, facing);
            };

            const drawSelectedPlate = (fighter, x, y, w, color, tag) => {
                fightCtx.fillStyle = 'rgba(0,0,0,0.42)';
                fightCtx.strokeStyle = color;
                fightCtx.lineWidth = 1.5;
                fightCtx.beginPath();
                fightCtx.roundRect(x, y, w, 54, 12);
                fightCtx.fill();
                fightCtx.stroke();
                fightCtx.textAlign = 'left';
                fightCtx.fillStyle = color;
                fightCtx.font = '900 13px sans-serif';
                fightCtx.fillText(tag, x + 14, y + 18);
                fightCtx.fillStyle = '#fff';
                fightCtx.font = '900 19px sans-serif';
                fightCtx.fillText(fighter.name, x + 14, y + 39);
                fightCtx.textAlign = 'right';
                fightCtx.fillStyle = 'rgba(255,255,255,0.72)';
                fightCtx.font = '700 12px sans-serif';
                fightCtx.fillText(fighter.traitName, x + w - 12, y + 38);
            };

            drawCharacterPreview(p1Char, 172, 300, 1, FIGHT_P1_ACCENT);
            drawCharacterPreview(p2Char, FIGHT_WIDTH - 172, 300, -1, FIGHT_P2_COLOR);
            drawSelectedPlate(p1Char, 60, 112, 212, FIGHT_P1_ACCENT, 'P1');
            drawSelectedPlate(p2Char, FIGHT_WIDTH - 272, 112, 212, FIGHT_P2_COLOR, 'P2');

            fightCtx.fillStyle = 'rgba(255,196,87,0.16)';
            fightCtx.strokeStyle = 'rgba(255,196,87,0.35)';
            fightCtx.lineWidth = 1.5;
            fightCtx.beginPath();
            fightCtx.roundRect(FIGHT_CENTER_X - 130, 122, 260, 222, 14);
            fightCtx.fill();
            fightCtx.stroke();
            fightCtx.textAlign = 'center';
            fightCtx.fillStyle = '#fff1a8';
            fightCtx.font = '900 15px sans-serif';
            fightCtx.fillText('ROSTER', FIGHT_CENTER_X, 146);

            const drawSideSwitch = (side, x, active, color) => {
                addFightCanvasButton(`switch-${side}`, x, 104, 70, 30, () => {
                    FIGHT.pickSide = side;
                    drawFightGame();
                });
                fightCtx.fillStyle = active ? color : 'rgba(255,255,255,0.08)';
                fightCtx.strokeStyle = active ? '#fff' : 'rgba(255,255,255,0.18)';
                fightCtx.lineWidth = active ? 2.4 : 1.2;
                fightCtx.beginPath();
                fightCtx.roundRect(x, 104, 70, 30, 9);
                fightCtx.fill();
                fightCtx.stroke();
                fightCtx.fillStyle = active ? '#071017' : '#fff';
                fightCtx.font = '900 14px sans-serif';
                fightCtx.textAlign = 'center';
                fightCtx.fillText(side.toUpperCase(), x + 35, 124);
            };
            drawSideSwitch('p1', FIGHT_CENTER_X - 84, FIGHT.pickSide === 'p1', FIGHT_P1_ACCENT);
            drawSideSwitch('p2', FIGHT_CENTER_X + 14, FIGHT.pickSide === 'p2', FIGHT_P2_COLOR);

            FIGHTERS.forEach((fighter, index) => {
                const col = index % 3;
                const row = Math.floor(index / 3);
                const x = FIGHT_CENTER_X - 108 + col * 76;
                const y = 164 + row * 82;
                const p1Selected = FIGHT.selectedP1 === fighter.id;
                const p2Selected = FIGHT.selectedP2 === fighter.id;
                addFightCanvasButton(`pick-${fighter.id}`, x, y, 70, 72, () => {
                    if (FIGHT.pickSide === 'p1') {
                        FIGHT.selectedP1 = fighter.id;
                        FIGHT.pickSide = 'p2';
                    } else {
                        FIGHT.selectedP2 = fighter.id;
                        FIGHT.pickSide = 'p1';
                    }
                    drawFightGame();
                });
                drawMiniPortrait(fighter, x, y, 70, p1Selected ? FIGHT_P1_ACCENT : p2Selected ? FIGHT_P2_COLOR : 'rgba(255,255,255,0.45)');
                if (p1Selected || p2Selected) {
                    fightCtx.strokeStyle = p1Selected && p2Selected ? '#fff1a8' : p1Selected ? FIGHT_P1_ACCENT : FIGHT_P2_COLOR;
                    fightCtx.lineWidth = 4;
                    fightCtx.beginPath();
                    fightCtx.roundRect(x - 3, y - 3, 76, 78, 12);
                    fightCtx.stroke();
                }
                fightCtx.fillStyle = 'rgba(0,0,0,0.58)';
                fightCtx.fillRect(x, y + 52, 70, 18);
                fightCtx.fillStyle = '#fff';
                fightCtx.font = '800 12px sans-serif';
                fightCtx.textAlign = 'center';
                fightCtx.fillText(fighter.name, x + 35, y + 65);
            });

            fightCtx.textAlign = 'center';
            fightCtx.fillStyle = 'rgba(255,255,255,0.66)';
            fightCtx.font = '700 12px sans-serif';
            fightCtx.fillText(`当前为 ${FIGHT.pickSide === 'p1' ? 'P1' : 'P2'} 选择角色，点击头像后自动切换`, FIGHT_CENTER_X, 362);

            const drawStageTile = (bg, x, y, active) => {
                addFightCanvasButton(`stage-${bg.id}`, x, y, 112, 54, () => {
                    FIGHT.selectedBg = bg.id;
                    if (bg.id !== 'random') {
                        FIGHT.activeBg = bg.id;
                        invalidateFightBackgroundCache();
                    }
                    drawFightGame();
                });
                const tileW = 112;
                const tileH = 54;
                const radius = 10;
                const bgImg = fightBgImages.get(bg.id);
                const hasThumb = bgImg?.complete && bgImg.naturalWidth > 0;
                fightCtx.beginPath();
                fightCtx.roundRect(x, y, tileW, tileH, radius);
                fightCtx.save();
                fightCtx.clip();
                if (hasThumb) {
                    const scale = Math.max(tileW / bgImg.naturalWidth, tileH / bgImg.naturalHeight);
                    const drawW = bgImg.naturalWidth * scale;
                    const drawH = bgImg.naturalHeight * scale;
                    fightCtx.drawImage(bgImg, x + (tileW - drawW) / 2, y + (tileH - drawH) / 2, drawW, drawH);
                    fightCtx.fillStyle = 'rgba(0,0,0,0.08)';
                    fightCtx.fillRect(x, y, tileW, tileH);
                } else {
                    const stageGrad = fightCtx.createLinearGradient(x, y, x + tileW, y + tileH);
                    stageGrad.addColorStop(0, active ? 'rgba(255,196,87,0.36)' : 'rgba(255,255,255,0.08)');
                    stageGrad.addColorStop(1, bg.id === 'random' ? 'rgba(0,212,255,0.2)' : 'rgba(255,107,53,0.16)');
                    fightCtx.fillStyle = stageGrad;
                    fightCtx.fillRect(x, y, tileW, tileH);
                    fightCtx.fillStyle = 'rgba(0,0,0,0.28)';
                    for (let i = 0; i < 5; i++) fightCtx.fillRect(x + 10 + i * 20, y + 30 - (i % 3) * 6, 12, 16 + (i % 2) * 8);
                }
                fightCtx.fillStyle = 'rgba(0,0,0,0.58)';
                fightCtx.fillRect(x, y + tileH - 19, tileW, 19);
                fightCtx.restore();
                fightCtx.strokeStyle = active ? '#fff1a8' : 'rgba(255,255,255,0.22)';
                fightCtx.lineWidth = active ? 3 : 1.2;
                fightCtx.beginPath();
                fightCtx.roundRect(x, y, tileW, tileH, radius);
                fightCtx.stroke();
                fightCtx.fillStyle = '#fff';
                fightCtx.font = '800 13px sans-serif';
                fightCtx.textAlign = 'center';
                fightCtx.fillText(bg.name, x + tileW / 2, y + tileH - 6);
            };

            fightCtx.fillStyle = '#fff1a8';
            fightCtx.font = '900 15px sans-serif';
            fightCtx.fillText('STAGE', FIGHT_CENTER_X, 396);
            const stageSlotCount = 5;
            const selectedStageIndex = Math.max(0, FIGHT_BACKGROUNDS.findIndex(bg => bg.id === FIGHT.selectedBg));
            const stageStart = Math.max(0, Math.min(selectedStageIndex - stageSlotCount + 1, FIGHT_BACKGROUNDS.length - stageSlotCount));
            const visibleStages = FIGHT_BACKGROUNDS.slice(stageStart, stageStart + stageSlotCount);
            const stageGroupX = FIGHT_CENTER_X - 306;
            visibleStages.forEach((bg, index) => {
                drawStageTile(bg, stageGroupX + index * 118, 412, FIGHT.selectedBg === bg.id);
            });
            const stageMoreX = stageGroupX + stageSlotCount * 118;
            addFightCanvasButton('stage-more', stageMoreX, 412, 44, 54, () => {
                const currentIndex = FIGHT_BACKGROUNDS.findIndex(bg => bg.id === FIGHT.selectedBg);
                const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % FIGHT_BACKGROUNDS.length : 0;
                FIGHT.selectedBg = FIGHT_BACKGROUNDS[nextIndex].id;
                if (FIGHT.selectedBg !== 'random') {
                    FIGHT.activeBg = FIGHT.selectedBg;
                    invalidateFightBackgroundCache();
                }
                drawFightGame();
            });
            fightCtx.fillStyle = 'rgba(255,255,255,0.08)';
            fightCtx.strokeStyle = 'rgba(255,255,255,0.18)';
            fightCtx.beginPath();
            fightCtx.roundRect(stageMoreX, 412, 44, 54, 10);
            fightCtx.fill();
            fightCtx.stroke();
            fightCtx.fillStyle = '#fff1a8';
            fightCtx.font = '900 24px sans-serif';
            fightCtx.fillText('>', stageMoreX + 22, 447);

            const drawModeButton = (id, label, x, y, w, active, color, onClick) => {
                addFightCanvasButton(id, x, y, w, 30, onClick);
                fightCtx.fillStyle = active ? color : 'rgba(255,255,255,0.08)';
                fightCtx.strokeStyle = active ? '#fff' : 'rgba(255,255,255,0.18)';
                fightCtx.lineWidth = active ? 2.2 : 1.1;
                fightCtx.beginPath();
                fightCtx.roundRect(x, y, w, 30, 8);
                fightCtx.fill();
                fightCtx.stroke();
                fightCtx.fillStyle = active ? '#071017' : 'rgba(255,255,255,0.82)';
                fightCtx.font = '900 13px sans-serif';
                fightCtx.textAlign = 'center';
                fightCtx.fillText(label, x + w / 2, y + 20);
            };

            drawModeButton('mode-cpu', '人机对战', FIGHT_CENTER_X - 180, 470, 104, FIGHT.mode === 'cpu', '#34d4ff', () => {
                FIGHT.mode = 'cpu';
                FIGHT.aiInput = {};
                FIGHT.aiDecisionTimer = 0;
                drawFightGame();
            });
            drawModeButton('mode-pvp', '玩家对战', FIGHT_CENTER_X - 68, 470, 104, FIGHT.mode === 'pvp', '#ff6b4a', () => {
                FIGHT.mode = 'pvp';
                FIGHT.aiInput = {};
                drawFightGame();
            });
            if (FIGHT.mode === 'cpu') {
                [
                    ['easy', '简单'],
                    ['normal', '普通'],
                    ['hard', '困难'],
                ].forEach(([level, label], index) => {
                    drawModeButton(`ai-${level}`, label, FIGHT_CENTER_X + 50 + index * 58, 470, 52, FIGHT.aiDifficulty === level, '#fff1a8', () => {
                        FIGHT.aiDifficulty = level;
                        FIGHT.aiInput = {};
                        FIGHT.aiDecisionTimer = 0;
                        drawFightGame();
                    });
                });
            }

            addFightCanvasButton('fight-start-canvas', FIGHT_CENTER_X - 98, 498, 196, 48, startFightGame);
            fightCtx.fillStyle = 'rgba(255,196,87,0.28)';
            fightCtx.strokeStyle = 'rgba(255,196,87,0.92)';
            fightCtx.lineWidth = 2.5;
            fightCtx.beginPath();
            fightCtx.roundRect(FIGHT_CENTER_X - 98, 498, 196, 48, 14);
            fightCtx.fill();
            fightCtx.stroke();
            if (!drawFightUiSprite('start', FIGHT_CENTER_X, 523, { maxW: 174, maxH: 40, shadowBlur: 8, shadowOffsetY: 2 })) {
                fightCtx.fillStyle = '#fff1a8';
                fightCtx.font = '900 20px sans-serif';
                fightCtx.fillText('开始对战', FIGHT_CENTER_X, 529);
            }
            fightCtx.fillStyle = 'rgba(255,255,255,0.72)';
            fightCtx.font = '700 13px sans-serif';
            fightCtx.fillText(`擂台：${bgName}`, FIGHT_CENTER_X, 560);
        }

        if (FIGHT.paused) {
            fightCtx.fillStyle = 'rgba(0,0,0,0.58)';
            fightCtx.fillRect(0, 0, FIGHT_WIDTH, FIGHT_HEIGHT);
            fightCtx.fillStyle = '#fff';
            fightCtx.font = '900 38px sans-serif';
            fightCtx.textAlign = 'center';
            fightCtx.fillText('已暂停', FIGHT_CENTER_X, 304);
        }
    };

    fightDrawReady = true;

    const loopFight = (time) => {
        const now = time;
        if (!FIGHT.running) {
            drawFightGame(now);
            return;
        }
        if (FIGHT.paused) {
            drawFightGame(now);
            return;
        }
        const dt = Math.min(0.032, (now - FIGHT.lastTime) / 1000 || 0);
        FIGHT.lastTime = now;
        updateFightGame(dt);
        drawFightGame(now);
        if (FIGHT.gameOver) {
            FIGHT.running = false;
            fightPauseBtn.classList.add('hidden');
            syncFightVirtualControls();
            return;
        }
        if (FIGHT.running && !FIGHT.paused) fightAnimId = requestAnimationFrame(loopFight);
    };

    fightStartBtn.addEventListener('click', startFightGame);
    fightRestartBtn.addEventListener('click', openFightSetupScreen);
    fightContinueBtn?.addEventListener('click', openFightSetupScreen);
    fightHomeBtn?.addEventListener('click', () => {
        Object.keys(fightKeys).forEach(key => { fightKeys[key] = false; });
        openFightSetupScreen();
        showSection('home');
        drawFightGame();
    });
    fightPauseBtn.addEventListener('click', () => {
        if (!FIGHT.running || FIGHT.gameOver) return;
        FIGHT.paused = !FIGHT.paused;
        fightPauseBtn.textContent = FIGHT.paused ? '继续' : '暂停';
        syncFightVirtualControls();
        if (!FIGHT.paused) {
            FIGHT.lastTime = performance.now();
            scheduleFightFrame();
        }
    });

    const pauseFightGame = () => {
        if (!FIGHT.running) return;
        FIGHT.paused = true;
        fightPauseBtn.textContent = '继续';
        syncFightVirtualControls();
    };

    fightVirtualControls?.querySelectorAll('[data-fight-key]').forEach((button) => {
        const press = (event) => {
            if (!FIGHT.running || FIGHT.paused || FIGHT.gameOver) return;
            event.preventDefault();
            const key = button.dataset.fightKey;
            fightVirtualPointers.set(event.pointerId, key);
            fightKeys[key] = true;
            button.classList.add('is-pressed');
            button.setAttribute('aria-pressed', 'true');
            button.setPointerCapture?.(event.pointerId);
        };
        const release = (event) => {
            const key = fightVirtualPointers.get(event.pointerId);
            if (!key) return;
            event.preventDefault();
            fightVirtualPointers.delete(event.pointerId);
            const stillPressed = [...fightVirtualPointers.values()].includes(key);
            fightKeys[key] = stillPressed;
            if (!stillPressed) {
                button.classList.remove('is-pressed');
                button.setAttribute('aria-pressed', 'false');
            }
        };
        button.addEventListener('pointerdown', press);
        button.addEventListener('pointerup', release);
        button.addEventListener('pointercancel', release);
        button.addEventListener('lostpointercapture', release);
        button.addEventListener('contextmenu', (event) => event.preventDefault());
    });

    window.addEventListener('blur', clearFightVirtualInputs);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) clearFightVirtualInputs();
    });

    window.addEventListener('keydown', (event) => {
        const fightSection = document.getElementById('fight');
        const isFightActive = fightSection && !fightSection.classList.contains('hidden');
        const targetTag = event.target?.tagName?.toLowerCase();
        if (!isFightActive || fightSection.closest?.('.hidden') || document.getElementById('main-page')?.classList.contains('hidden')
            || document.hidden || ['input', 'textarea', 'select'].includes(targetTag) || event.target?.isContentEditable
            || event.isComposing || event.keyCode === 229 || event.key === 'Process') return;
        fightKeys[event.key] = true;
        if (['w','a','s','d','W','A','S','D','j','k','l','u','i','o','J','K','L','U','I','O','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','1','2','3','4','5','6'].includes(event.key)) {
            event.preventDefault();
        }
    });

    window.addEventListener('keyup', (event) => {
        fightKeys[event.key] = false;
    });

    fightCanvas.addEventListener('pointerdown', (event) => {
        if (FIGHT.running && !FIGHT.gameOver) return;
        const rect = fightCanvas.getBoundingClientRect();
        const scaleX = fightCanvas.width / rect.width;
        const scaleY = fightCanvas.height / rect.height;
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        if (hitFightCanvasButton(x, y)) {
            event.preventDefault();
            fightCanvas.setPointerCapture?.(event.pointerId);
        }
    });


    return {
        pause: pauseFightGame,
        setup: openFightSetupScreen,
        render: drawFightGame,
        syncMobileMode: syncFightVirtualControls,
    };
};
