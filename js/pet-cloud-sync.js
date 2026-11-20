import { isReadablePetSave } from './pet-storage.js';

const versionOf = (save) => ({ expectedUpdatedAt: save?.updatedAt ?? null, expectedRevision: save?.revision ?? null });
const belongsToSameRoster = (first, second) => {
    const ids = new Set([first.id, ...(first.roster?.owned || []).map(entry => entry.id)].filter(Boolean));
    return [second.id, ...(second.roster?.owned || []).map(entry => entry.id)].some(id => ids.has(id));
};
const sameSaveContent = (first, second) => {
    const canonical = value => Array.isArray(value) ? value.map(canonical)
        : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
    const content = ({ revision, cloudUserId, ...save }) => JSON.stringify(canonical(save));
    return content(first) === content(second);
};

export const createPetCloudSync = ({ cloudSync, getState, restore, markAccount, canWrite = () => true, onStatus = () => {} }) => {
    let tail = Promise.resolve();
    const synchronize = async () => {
        if (!cloudSync?.load || !cloudSync?.save || !canWrite()) return false;
        onStatus('同步中');
        const beforeRevision = getState().revision;
        const response = await cloudSync.load();
        if (!canWrite()) return false;
        if (response?.status === 'guest') { onStatus('本地'); return false; }
        if (response?.status !== 'authenticated' || !response.userId) throw new Error('无法确认云端账号，未上传伙伴存档。');
        const { userId, save: remote } = response;
        if (remote !== null && (!isReadablePetSave(remote) || remote.adopted !== true)) {
            throw new Error('云端伙伴存档格式异常，已停止覆盖。');
        }
        let local = getState();
        if (remote && local.adopted && (!local.cloudUserId || local.cloudUserId === userId) && sameSaveContent(local, remote)) {
            if (local.cloudUserId !== userId) markAccount(userId);
            onStatus('云端');
            return true;
        }
        if (remote && (!local.adopted || !belongsToSameRoster(local, remote) || local.cloudUserId && local.cloudUserId !== userId
            || Number(remote.updatedAt) > Number(local.updatedAt)
            || Number(remote.updatedAt) === Number(local.updatedAt) && Number(remote.revision) > Number(local.revision))) {
            if (local.revision !== beforeRevision) throw new Error('读取云端期间本地伙伴已更新，请重试同步后再恢复。');
            restore(remote, userId);
            onStatus('云端', '已恢复云端伙伴存档。');
            return true;
        }
        if (!local.adopted) { onStatus('本地'); return false; }
        if (local.cloudUserId && local.cloudUserId !== userId) {
            throw new Error('当前本地伙伴属于另一账号，请切回原账号同步；该账号的云存档未被覆盖。');
        }
        if (local.cloudUserId !== userId) { markAccount(userId); local = getState(); }
        const snapshot = JSON.parse(JSON.stringify(local));
        const result = await cloudSync.save(snapshot, { userId, ...versionOf(remote) });
        if (result?.saved !== true || result.userId !== userId) {
            onStatus('本地', result?.reason === 'guest' ? '当前未登录，伙伴已保存在本地。' : '云端保存未完成，伙伴已保存在本地。');
            return false;
        }
        onStatus('云端');
        return true;
    };
    return {
        sync() {
            const next = tail.then(synchronize).catch((error) => { onStatus('本地', error?.message || '云端同步失败，伙伴已保存在本地。'); return false; });
            tail = next;
            return next;
        },
    };
};

