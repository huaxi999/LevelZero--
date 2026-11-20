const finiteTime = (value) => Number.isFinite(Number(value)) ? Number(value) : 0;

export const PEAK_TRUSTED_TIME_URL = './index.html?peak-trusted-time=1';

const parseTrustedTime = async (response) => {
    const headerTime = Date.parse(response.headers?.get?.('date') || '');
    if (Number.isFinite(headerTime)) return headerTime;
    if (typeof response.json !== 'function') throw new Error('服务器未返回可信时间');
    const payload = await response.json();
    const payloadTime = Date.parse(payload?.utc_datetime || payload?.datetime || '');
    if (!Number.isFinite(payloadTime)) throw new Error('服务器未返回可信时间');
    return payloadTime;
};

export const fetchTrustedPeakTime = async ({
    fetchImpl = globalThis.fetch,
    url = PEAK_TRUSTED_TIME_URL,
    monotonicNow = () => globalThis.performance?.now?.() || 0,
    wallClockNow = () => Date.now(),
    allowLocalFallback = url === PEAK_TRUSTED_TIME_URL,
    timeoutMs = 8000,
    abortController = typeof globalThis.AbortController === 'function' ? new globalThis.AbortController() : null,
} = {}) => {
    const localFallback = () => {
        const value = finiteTime(wallClockNow());
        if (!value) throw new Error('当前无法取得游戏时间');
        return Math.floor(value);
    };
    if (typeof fetchImpl !== 'function' || !url) {
        if (allowLocalFallback) return localFallback();
        throw new Error('当前无法连接可信时间服务');
    }
    const startedAt = finiteTime(monotonicNow());
    const timeout = abortController && Number.isFinite(timeoutMs) && timeoutMs > 0
        ? globalThis.setTimeout?.(() => abortController.abort(), timeoutMs)
        : null;
    try {
        const response = await fetchImpl(url, {
            method: 'GET',
            cache: 'no-store',
            credentials: 'omit',
            signal: abortController?.signal,
        });
        if (!response?.ok) throw new Error('可信时间服务暂不可用');
        const serverTime = await parseTrustedTime(response);
        const roundTrip = Math.max(0, finiteTime(monotonicNow()) - startedAt);
        return Math.floor(serverTime + roundTrip / 2);
    } catch (error) {
        if (allowLocalFallback) return localFallback();
        if (error?.name === 'AbortError') throw new Error('可信时间请求超时');
        throw error;
    } finally {
        if (timeout != null) globalThis.clearTimeout?.(timeout);
    }
};
