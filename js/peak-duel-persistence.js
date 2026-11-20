import { setPeakSave } from './peak-duel-storage.js';

export const createPeakSaveScheduler = ({ getState, onSaved, onError, canWrite = () => true, delay = 250 }) => {
    let timer = null;
    let dirty = false;

    const cancelTimer = () => {
        if (timer !== null) globalThis.clearTimeout(timer);
        timer = null;
    };

    const commit = (nextState = getState(), { throwOnError = false } = {}) => {
        cancelTimer();
        dirty = true;
        try {
            if (!canWrite()) throw Object.assign(new Error('本页尚未取得存档保护，操作已暂停'), { code: 'PEAK_SAVE_OWNER' });
            const saved = setPeakSave(nextState, Date.now(), { throwOnError: true });
            onSaved(saved);
            dirty = false;
            return true;
        } catch (error) {
            onError?.(error);
            if (throwOnError) throw error;
            return false;
        }
    };

    const flush = () => {
        cancelTimer();
        return dirty ? commit() : true;
    };

    const schedule = () => {
        dirty = true;
        if (timer === null) timer = globalThis.setTimeout(flush, delay);
    };

    const discard = () => { cancelTimer(); dirty = false; };
    return { commit, schedule, flush, discard };
};
