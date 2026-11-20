export const acquirePetWriter = async ({ locks = globalThis.navigator?.locks, page = globalThis.window } = {}) => {
    if (!locks?.request) return { owned: false, native: false, release() {} };
    let release;
    const held = new Promise(resolve => { release = resolve; });
    const owned = await new Promise(resolve => {
        locks.request('pixel-park-pet-writer', { ifAvailable: true }, async lock => {
            resolve(Boolean(lock));
            if (lock) await held;
        }).catch(() => resolve(false));
    });
    page?.addEventListener('pagehide', release, { once: true });
    return { owned, native: true, release };
};
