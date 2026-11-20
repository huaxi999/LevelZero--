const STORAGE_PREFIX = 'rs_';
const ONBOARDING_KEY = 'rs_mowangcheng_onboarding_seen';
const SESSION_KEY = 'rs_mowangcheng_session';
const BACKUP_VERSION = 1;
const SESSION_VERSION = 1;

const SESSION_FIELDS = [
    'phase', 'selectedElements', 'mainElement', 'availableElements',
    'acquiredEvolutions', 'evolutionChoices', 'tempBuffChoices', 'backpack',
    'gameEquipmentDrops', 'character', 'characterLevel', 'characterExp',
    'floor', 'monsters', 'battleLog', 'floatingNumbers', 'heroAnim', 'speed',
    'isPaused', 'coinsEarned', 'heroPointsEarned', 'totalMonstersKilled',
    'floorsCleared', 'isTransitioning', 'isVictory'
];
const ACTIVE_PHASES = new Set(['element-select', 'battle', 'evolution', 'temp-buff', 'game-over']);

const readSession = (storage = localStorage) => {
    try {
        const value = JSON.parse(storage.getItem(SESSION_KEY) || 'null');
        return value && value.version === SESSION_VERSION && value.state ? value : null;
    } catch {
        return null;
    }
};

const writeSession = (storage, store) => {
    if (!store || !ACTIVE_PHASES.has(store.phase) || store.phase === 'game-over') return;
    try {
        const state = {};
        SESSION_FIELDS.forEach((field) => {
            if (field in store) state[field] = JSON.parse(JSON.stringify(store[field]));
        });
        storage.setItem(SESSION_KEY, JSON.stringify({ version: SESSION_VERSION, savedAt: Date.now(), state }));
    } catch {
    }
};

const clearSession = (storage = localStorage) => storage.removeItem(SESSION_KEY);

const findGameStore = (child) => {
    try {
        const root = child?.document?.getElementById('app');
        const app = root?.__vue_app__;
        const context = root?.__vueParentComponent?.appContext;
        const pinia = app?.config?.globalProperties?.$pinia
            || app?._context?.provides?.pinia
            || app?._context?.provides?.['pinia']
            || context?.config?.globalProperties?.$pinia
            || context?.provides?.pinia;
        const store = pinia?._s?.get('game');
        return store && typeof store.startGame === 'function' ? store : null;
    } catch {
        return null;
    }
};

const findRouter = (child) => {
    try {
        const app = child?.document?.getElementById('app')?.__vue_app__;
        return app?.config?.globalProperties?.$router || null;
    } catch {
        return null;
    }
};

const restoreSession = (storage, store) => {
    const payload = readSession(storage);
    if (!payload || !store || !ACTIVE_PHASES.has(payload.state.phase) || payload.state.phase === 'game-over') return false;
    try {
        SESSION_FIELDS.filter((field) => field !== 'phase').forEach((field) => {
            if (Object.prototype.hasOwnProperty.call(payload.state, field)) {
                store[field] = payload.state[field];
            }
        });
        if (Object.prototype.hasOwnProperty.call(payload.state, 'phase')) store.phase = payload.state.phase;
        return true;
    } catch {
        return false;
    }
};

const installSessionPersistence = (child) => {
    if (!child || child.__mowangchengSessionPersistence) return;
    child.__mowangchengSessionPersistence = true;
    const storage = child.localStorage || localStorage;
    let store = null;
    let restored = false;
    let saveTimer = 0;
    let unsubscribe = null;
    const scheduleSave = () => {
        if (saveTimer) return;
        saveTimer = child.setTimeout(() => {
            saveTimer = 0;
            if (!store) return;
            if (store.phase === 'game-over' || !ACTIVE_PHASES.has(store.phase)) {
                clearSession(storage);
            } else {
                writeSession(storage, store);
            }
        }, 350);
    };
    const connect = () => {
        const next = findGameStore(child);
        if (!next || next === store) return;
        unsubscribe?.();
        store = next;
        if (!restored) {
            restored = restoreSession(storage, store);
            if (restored) {
                addToast('已恢复上次魔王城进度', 'normal');
                const router = findRouter(child);
                if (router?.currentRoute?.value?.path !== '/battle') {
                    child.setTimeout(() => router.push('/battle').catch(() => {}), 0);
                }
            }
        }
        if (typeof store.$subscribe === 'function') {
            unsubscribe = store.$subscribe(() => scheduleSave(), { deep: true });
        }
        scheduleSave();
    };
    child.setInterval(connect, 300);
    connect();
    child.addEventListener?.('pagehide', () => store && writeSession(storage, store));
};

const isCastleKey = (key) => typeof key === 'string' && key.startsWith(STORAGE_PREFIX);

const collectSave = () => {
    const entries = [];
    for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (isCastleKey(key)) entries.push([key, localStorage.getItem(key)]);
    }
    return { version: BACKUP_VERSION, exportedAt: new Date().toISOString(), entries };
};

const download = (payload) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `yongchuangmowangcheng-save-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const importSave = (file) => file.text().then((text) => {
    const payload = JSON.parse(text);
    if (!payload || !Array.isArray(payload.entries) || payload.entries.length > 500) {
        throw new Error('存档格式不正确');
    }
    const entries = payload.entries.filter((entry) => Array.isArray(entry) && isCastleKey(entry[0]) && typeof entry[1] === 'string');
    if (!entries.length) throw new Error('没有找到魔王城存档');
    entries.forEach(([key, value]) => localStorage.setItem(key, value));
});

const castleKeys = () => {
    const keys = [];
    for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (isCastleKey(key)) keys.push(key);
    }
    return keys;
};

const addToast = (message, tone = 'normal') => {
    const toast = document.createElement('div');
    toast.className = `mowangcheng-enhancement-toast ${tone}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
};

const createBackupToolbar = (frame) => {
    const shell = frame.closest('.mowangcheng-shell');
    if (!shell || shell.querySelector('.mowangcheng-backup-toolbar')) return;
    const toolbar = document.createElement('div');
    toolbar.className = 'mowangcheng-backup-toolbar';
    toolbar.innerHTML = `
        <button type="button" data-castle-action="export">导出存档</button>
        <button type="button" data-castle-action="import">导入存档</button>
        <button type="button" data-castle-action="organize">整理仓库</button>
        <button type="button" data-castle-action="reset">重置魔王城</button>
        <input type="file" accept="application/json" hidden>
    `;
    const input = toolbar.querySelector('input');
    toolbar.addEventListener('click', (event) => {
        const action = event.target.closest('[data-castle-action]')?.dataset.castleAction;
        if (!action) return;
        if (action === 'export') {
            download(collectSave());
            addToast('魔王城存档已导出');
        } else if (action === 'import') {
            input.click();
        } else if (action === 'organize') {
            organizeInventory(frame);
        } else if (action === 'reset' && window.confirm('只重置勇闯魔王城存档，不影响大厅和其他游戏。确定继续吗？')) {
            castleKeys().forEach((key) => localStorage.removeItem(key));
            addToast('魔王城存档已重置，请重新加载游戏', 'warning');
            frame.contentWindow?.location.reload();
        }
    });
    input.addEventListener('change', () => {
        const file = input.files?.[0];
        if (!file) return;
        importSave(file).then(() => {
            addToast('存档已导入，正在重新加载');
            frame.contentWindow?.location.reload();
        }).catch((error) => addToast(error.message || '导入失败', 'warning'));
        input.value = '';
    });
    shell.appendChild(toolbar);
};

const organizeInventory = (frame) => {
    const childWindow = frame?.contentWindow || frame;
    const storage = childWindow?.localStorage;
    if (!storage) return;
    const read = (key, fallback) => {
        try { return JSON.parse(storage.getItem(key) || 'null') ?? fallback; } catch { return fallback; }
    };
    const rarityRank = { legendary: 5, epic: 4, rare: 3, excellent: 2, common: 1, normal: 0 };
    const score = (item) => Object.values(item?.stats || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
    const equipment = read('rs_equipItems', []);
    if (Array.isArray(equipment)) {
        equipment.sort((a, b) => (rarityRank[b?.rarity] || 0) - (rarityRank[a?.rarity] || 0)
            || (Number(b?.droppedFloor) || 0) - (Number(a?.droppedFloor) || 0)
            || score(b) - score(a));
        storage.setItem('rs_equipItems', JSON.stringify(equipment));
    }
    const warehouse = read('rs_warehouse', []);
    if (Array.isArray(warehouse)) {
        warehouse.sort((a, b) => String(a?.defId || '').localeCompare(String(b?.defId || '')));
        storage.setItem('rs_warehouse', JSON.stringify(warehouse));
    }
    addToast('仓库已按稀有度和属性整理');
    childWindow.location.reload();
};

const patchAnimationLoop = (frame) => {
    const child = frame?.contentWindow || frame;
    if (!child || child.__castleAnimationPatched) return;
    child.__castleAnimationPatched = true;
    const nativeRequest = child.requestAnimationFrame.bind(child);
    const nativeCancel = child.cancelAnimationFrame.bind(child);
    const waiting = new Map();
    const nativeIds = new Map();
    let nextId = 1;
    let paused = false;
    child.requestAnimationFrame = (callback) => {
        const id = nextId++;
        const run = (time) => {
            if (paused) {
                waiting.set(id, callback);
                return;
            }
            waiting.delete(id);
            nativeIds.delete(id);
            callback(time);
        };
        if (paused) waiting.set(id, callback);
        else nativeIds.set(id, nativeRequest(run));
        return id;
    };
    child.cancelAnimationFrame = (id) => {
        waiting.delete(id);
        const nativeId = nativeIds.get(id);
        nativeIds.delete(id);
        if (nativeId !== undefined) nativeCancel(nativeId);
    };
    child.addEventListener('message', (event) => {
        if (event.source !== child.parent || event.data?.type !== 'mowangcheng-command') return;
        paused = event.data.command === 'pause';
        if (!paused) {
            const callbacks = [...waiting.entries()];
            waiting.clear();
            callbacks.forEach(([id, callback]) => {
                nativeIds.set(id, nativeRequest((time) => {
                    waiting.delete(id);
                    nativeIds.delete(id);
                    callback(time);
                }));
            });
        }
    });
};

const patchChildStorage = (frame) => {
    try {
        const child = frame?.contentWindow || frame;
        const childStorage = child.localStorage;
        const storagePrototype = child.Storage?.prototype;
        if (!storagePrototype || storagePrototype.clear.__castleScoped) return;
        const nativeClear = storagePrototype.clear;
        storagePrototype.clear = function scopedCastleClear() {
            const keys = [];
            for (let index = 0; index < childStorage.length; index += 1) {
                const key = childStorage.key(index);
                if (isCastleKey(key)) keys.push(key);
            }
            keys.forEach((key) => childStorage.removeItem(key));
        };
        storagePrototype.clear.__castleScoped = true;
        storagePrototype.clear.__castleOriginal = nativeClear;
    } catch {
    }
};

const createOnboarding = (frame) => {
    if (localStorage.getItem(ONBOARDING_KEY)) return;
    const overlay = document.createElement('div');
    overlay.className = 'mowangcheng-onboarding';
    overlay.innerHTML = `
        <div class="mowangcheng-onboarding-card" role="dialog" aria-modal="true" aria-labelledby="mowangcheng-onboarding-title">
            <button class="mowangcheng-onboarding-close" type="button" aria-label="跳过引导">×</button>
            <small>勇闯魔王城 · 初次冒险</small>
            <h2 id="mowangcheng-onboarding-title">先记住这三件事</h2>
            <ol>
                <li><b>选元素</b><span>主元素决定克制，副元素补充属性。</span></li>
                <li><b>每 5 级进化</b><span>优先补足当前流派最缺的能力。</span></li>
                <li><b>装备会自动带入</b><span>战斗结束后再整理仓库和局内背包。</span></li>
            </ol>
            <button class="mowangcheng-onboarding-start" type="button">开始冒险</button>
        </div>
    `;
    const close = () => {
        localStorage.setItem(ONBOARDING_KEY, '1');
        overlay.remove();
        frame.contentWindow?.focus();
    };
    overlay.querySelector('.mowangcheng-onboarding-close').addEventListener('click', close);
    overlay.querySelector('.mowangcheng-onboarding-start').addEventListener('click', close);
    document.body.appendChild(overlay);
};

const installFrameEnhancements = (frame) => {
    patchChildStorage(frame);
    createBackupToolbar(frame);
    patchAnimationLoop(frame);
    installSessionPersistence(frame.contentWindow);
};

const installStandaloneEnhancements = () => {
    const child = window;
    patchChildStorage(child);
    patchAnimationLoop(child);
    const toolbar = document.createElement('div');
    toolbar.className = 'mowangcheng-backup-toolbar';
    toolbar.innerHTML = `
        <button type="button" data-castle-action="export">导出存档</button>
        <button type="button" data-castle-action="import">导入存档</button>
        <button type="button" data-castle-action="organize">整理仓库</button>
        <button type="button" data-castle-action="reset">重置魔王城</button>
        <input type="file" accept="application/json" hidden>
    `;
    const input = toolbar.querySelector('input');
    toolbar.addEventListener('click', (event) => {
        const action = event.target.closest('[data-castle-action]')?.dataset.castleAction;
        if (!action) return;
        if (action === 'export') download(collectSave());
        if (action === 'import') input.click();
        if (action === 'organize') organizeInventory(child);
        if (action === 'reset' && window.confirm('只重置勇闯魔王城存档，不影响其他网站数据。确定继续吗？')) {
            castleKeys().forEach((key) => localStorage.removeItem(key));
            window.location.reload();
        }
    });
    input.addEventListener('change', () => {
        const file = input.files?.[0];
        if (!file) return;
        importSave(file).then(() => window.location.reload()).catch((error) => addToast(error.message || '导入失败', 'warning'));
        input.value = '';
    });
    document.body.appendChild(toolbar);
    installSessionPersistence(child);
    setTimeout(() => createOnboarding({ contentWindow: child }), 600);
};

const frame = document.getElementById('mowangcheng-frame');
if (frame) {
    frame.addEventListener('load', () => installFrameEnhancements(frame));
    window.mowangchengFrameCommand = (command) => {
        if (!frame.contentWindow) return;
        frame.contentWindow.postMessage({ type: 'mowangcheng-command', command }, '*');
    };
    const observer = new MutationObserver(() => {
        if (document.getElementById('main-page')?.dataset.activeSection === 'mowangcheng') createOnboarding(frame);
    });
    observer.observe(document.getElementById('main-page') || document.documentElement, { attributes: true, attributeFilter: ['data-active-section'] });
} else if (window.top === window) {
    installStandaloneEnhancements();
}

export { collectSave, importSave, castleKeys, readSession, writeSession, clearSession };
