export const createPeakSaveOwner = ({ locks = globalThis.navigator?.locks } = {}) => {
    let owned = false;
    let pending = null;
    let releaseLock = null;
    let generation = 0;
    let reason = '';
    const acquire = () => {
        if (owned) return Promise.resolve(true);
        if (pending) return pending;
        if (typeof locks?.request !== 'function') {
            reason = '当前浏览器无法安全保护多页面存档，请使用最新版 Chrome、Edge 或 Safari 打开';
            return Promise.resolve(false);
        }
        const token = generation;
        pending = new Promise((resolve) => {
            let finished = false;
            const finish = (value) => { if (!finished) { finished = true; resolve(value); } };
            Promise.resolve().then(() => locks.request('rosang.peak-duel.writer', { ifAvailable: true }, async (lock) => {
                if (!lock || token !== generation) {
                    reason = '巅峰对决已在另一个页面打开，请先关闭该页面，再重新进入';
                    finish(false);
                    return;
                }
                owned = true;
                reason = '';
                const held = new Promise((release) => { releaseLock = release; });
                finish(true);
                await held;
                owned = false;
            })).catch(() => {
                reason = '暂时无法取得存档保护，请重试';
                finish(false);
            });
        }).finally(() => { pending = null; });
        return pending;
    };
    const release = () => {
        generation += 1;
        owned = false;
        releaseLock?.();
        releaseLock = null;
    };
    return { acquire, release, get owned() { return owned; }, get reason() { return reason; } };
};
