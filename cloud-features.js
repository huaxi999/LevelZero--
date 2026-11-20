(function () {
    const CONFIG = {
        env: 'cloudbase-d6gpyyhnv0d03337e',
        region: 'ap-shanghai',
        appId: '177960929979373070ace42b61760',
        board: 'rsgame',
        phoneRegion: '+86',
        accessKey: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJpc3MiOiJodHRwczovL2Nsb3VkYmFzZS1kNmdweXlobnYwZDAzMzM3ZS5hcC1zaGFuZ2hhaS50Y2ItYXBpLnRlbmNlbnRjbG91ZGFwaS5jb20iLCJzdWIiOiJhbm9uIiwiYXVkIjoiY2xvdWRiYXNlLWQ2Z3B5eWhudjBkMDMzMzdlIiwiZXhwIjo0MDg0MjIxNjM4LCJpYXQiOjE3ODA1Mzg0MzgsIm5vbmNlIjoiMkVLNEgyN3lRdi12TTdGMzVya0lFQSIsImF0X2hhc2giOiIyRUs0SDI3eVF2LXZNN0YzNXJrSUVBIiwibmFtZSI6IkFub255bW91cyIsInNjb3BlIjoiYW5vbnltb3VzIiwicHJvamVjdF9pZCI6ImNsb3VkYmFzZS1kNmdweXlobnYwZDAzMzM3ZSIsIm1ldGEiOnsicGxhdGZvcm0iOiJQdWJsaXNoYWJsZUtleSJ9LCJ1c2VyX3R5cGUiOiIiLCJjbGllbnRfdHlwZSI6ImNsaWVudF91c2VyIiwiaXNfc3lzdGVtX2FkbWluIjpmYWxzZX0.BqAhLj1PWUKRnVR6U-_v17rGFKcvKa5Wes6rR4UnCPRUrk_n-c2eM8ufkbCeM7MQ09O9ktAw4BDxnFy4BxePLrkRu9oD5ZykXXowdoZqGejQ6Z2YKmaiAQCCFFFBuXqOkF1Tu-eds6XJEpUN2h2fh9oW2tgzbzse3Fdfqo2wUQGe6okYHlnouEqMabR54HMfk0D7HG0ZYlpREtk5sxYhQnW64XLnINlPr8R2CpaPvbmY-P7ubHruz4lIckGwcVvND2Eqm4Dm9BlWwWuDNOxIO9-pcMWeF_alA0h4f-ca6evK-beu4JN01tx_OisIKe2URlgLcWJB96vsvJQdXrIXyw'
    };

    const MESSAGES_COLLECTION = `public_app_${CONFIG.appId}_messages`;
    const SCORES_COLLECTION = MESSAGES_COLLECTION;
    const SCORES_BOARD = `${CONFIG.board}_scores`;
    const PETS_BOARD = `${CONFIG.board}_pets`;
    const MESSAGE_LIMIT = 100;
    let app = null;
    let auth = null;
    let db = null;
    let sdkPromise = null;

    function loadSdk() {
        if (window.cloudbase?.init) return Promise.resolve();
        if (sdkPromise) return sdkPromise;
        sdkPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://static.cloudbase.net/cloudbase-js-sdk/3.4.5/cloudbase.full.js';
            script.async = true;
            const timer = setTimeout(() => finish(new Error('云端加载超时，可继续游客试玩')), 10000);
            const finish = (error) => {
                clearTimeout(timer);
                script.onload = script.onerror = null;
                if (error) { script.remove(); reject(error); }
                else resolve();
            };
            script.onload = () => finish(window.cloudbase?.init ? null : new Error('CloudBase SDK 未加载'));
            script.onerror = () => finish(new Error('云端加载失败，可继续游客试玩'));
            document.head.appendChild(script);
        }).catch(error => { sdkPromise = null; throw error; });
        return sdkPromise;
    }

    function formatPhone(phone) {
        return `${CONFIG.phoneRegion} ${String(phone || '').trim()}`;
    }

    function assertReady() {
        if (!app || !auth || !db) {
            throw new Error('联网模块未初始化');
        }
    }

    async function init() {
        if (app) return true;
        await loadSdk();
        if (app) return true;
        if (!window.cloudbase || typeof window.cloudbase.init !== 'function') {
            throw new Error('CloudBase SDK 未加载');
        }

        const instance = window.cloudbase.init({
            env: CONFIG.env,
            region: CONFIG.region,
            accessKey: CONFIG.accessKey,
            auth: {
                detectSessionInUrl: true
            }
        });
        const nextAuth = instance.auth();
        const nextDb = instance.database();
        app = instance;
        auth = nextAuth;
        db = nextDb;
        return true;
    }

    async function getCurrentUser() {
        assertReady();
        const result = await auth.getUser();
        if (result?.error) {
            const code = String(result.error.code || '').toLowerCase();
            if (['unauthenticated', 'not_logged_in', 'auth/session-missing', 'auth/session-expired'].includes(code)) return null;
            throw new Error(result.error.message || '读取登录状态失败，请稍后重试');
        }
        const user = result?.data?.user;
        if (!user || user.is_anonymous) return null;
        return { id: user.id, phone: typeof user.phone === 'string' ? user.phone : typeof user.phone_number === 'string' ? user.phone_number : '' };
    }

    async function sendCode(phone) {
        assertReady();
        const phoneNumber = formatPhone(phone);
        const result = await auth.getVerification({ phone_number: phoneNumber });
        if (!result || !result.verification_id) {
            throw new Error('发送验证码失败');
        }
        return {
            verification_id: result.verification_id,
            is_user: !!result.is_user
        };
    }

    async function loginWithPhone(phone, code, verification) {
        assertReady();
        if (!verification || !verification.verification_id) {
            throw new Error('请先发送验证码');
        }

        const phoneNumber = formatPhone(phone);
        const verified = await auth.verify({
            verification_id: verification.verification_id,
            verification_code: String(code || '').trim()
        });
        if (!verified || !verified.verification_token) {
            throw new Error('验证码校验失败');
        }

        if (verification.is_user) {
            await auth.signIn({
                username: phoneNumber,
                verification_token: verified.verification_token
            });
        } else {
            await auth.signUp({
                phone_number: phoneNumber,
                verification_code: String(code || '').trim(),
                verification_token: verified.verification_token
            });
        }

        const user = await getCurrentUser();
        if (!user) {
            throw new Error('登录成功但获取用户失败');
        }
        return user;
    }

    async function logout() {
        assertReady();
        const result = await auth.signOut();
        if (result?.error) throw new Error(result.error.message || '退出登录失败，请稍后重试', { cause: result.error });
    }

    async function loadMessages() {
        assertReady();
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('请先手机号登录');
        }

        try {
            const result = await db.collection(MESSAGES_COLLECTION)
                .where({ board: CONFIG.board })
                .orderBy('createdAt', 'desc')
                .limit(MESSAGE_LIMIT)
                .get();
            if (!Array.isArray(result?.data)) throw new Error('留言读取结果异常');
            const list = result.data;
            return list.reverse();
        } catch (error) {
            throw new Error('留言暂时无法读取，请稍后重试', { cause: error });
        }
    }

    async function sendMessage(data) {
        assertReady();
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('请先手机号登录');
        }
        if (!data?.expectedUserId || data.expectedUserId !== user.id) {
            throw Object.assign(new Error('账号已变化，留言未发送，请在当前账号重新确认'), { code: 'AUTH_CHANGED' });
        }

        const content = String(data && data.content || '').trim();
        if (!content) {
            throw new Error('请输入留言');
        }
        if (content.length > 30) {
            throw new Error('留言最多30字');
        }

        const playerName = String(data && data.playerName || '玩家').trim().slice(0, 12) || '玩家';
        const phone = user.phone || '';
        const result = await db.collection(MESSAGES_COLLECTION).add({
            board: CONFIG.board,
            userId: user.id,
            playerName,
            phoneLast4: phone.slice(-4),
            content,
            createdAt: new Date().toISOString()
        });
        return result && result.id;
    }

    async function loadLeaderboard(game) {
        assertReady();
        const gameKey = String(game || '').trim();
        if (!gameKey) {
            throw new Error('缺少排行游戏类型');
        }

        try {
            const result = await db.collection(SCORES_COLLECTION)
                .where({ board: SCORES_BOARD, game: gameKey })
                .orderBy('score', 'desc')
                .limit(50)
                .get();
            if (!Array.isArray(result?.data)) throw new Error('排行榜读取结果异常');
            const list = result.data;
            return list.sort((a, b) => {
                const scoreDiff = (Number(b.score) || 0) - (Number(a.score) || 0);
                if (scoreDiff !== 0) return scoreDiff;
                return String(a.updatedAt || a.createdAt || '').localeCompare(String(b.updatedAt || b.createdAt || ''));
            });
        } catch (error) {
            throw new Error('排行榜暂时无法读取，请稍后重试', { cause: error });
        }
    }

    async function submitScore(data) {
        assertReady();
        const user = await getCurrentUser();
        if (!user) {
            throw new Error('请先手机号登录');
        }
        if (!data?.expectedUserId || data.expectedUserId !== user.id) {
            throw Object.assign(new Error('账号已变化，成绩保留在原账号待上传列表'), { code: 'AUTH_CHANGED' });
        }

        const gameKey = String(data && data.game || '').trim();
        if (!gameKey) {
            throw new Error('缺少排行游戏类型');
        }

        if (!['plane', 'brick'].includes(gameKey)) throw new Error('不支持的排行游戏类型');
        const score = Math.floor(Number(data && data.score));
        if (!Number.isSafeInteger(score) || score < 0) throw new Error('成绩必须是有效的非负整数');
        const playerName = String(data && data.playerName || '玩家').trim().slice(0, 12) || '玩家';
        const phone = user.phone || '';
        const now = new Date().toISOString();
        const findRecord = async () => {
            const { data: existing } = await db.collection(SCORES_COLLECTION)
            .where({ board: SCORES_BOARD, game: gameKey, userId: user.id })
            .limit(1)
            .get();
            return Array.isArray(existing) && existing.length > 0 ? existing[0] : null;
        };
        const payload = {
            board: SCORES_BOARD,
            game: gameKey,
            userId: user.id,
            playerName,
            phoneLast4: phone.slice(-4),
            score,
            meta: data && data.meta ? data.meta : {},
            updatedAt: now
        };

        let oldRecord = await findRecord();
        if (!oldRecord) {
            try {
                const id = `rsgame_score_${gameKey}_${encodeURIComponent(user.id)}`;
                const result = await db.collection(SCORES_COLLECTION).add({ ...payload, _id: id, createdAt: now });
                return { id: result?.id || id, score };
            } catch (error) {
                oldRecord = await findRecord();
                if (!oldRecord) throw error;
            }
        }
        const oldScore = Math.max(0, Math.floor(Number(oldRecord.score) || 0));
        if (score > oldScore) {
            await db.collection(SCORES_COLLECTION)
                .where({ _id: oldRecord._id, userId: user.id, score: db.command.lt(score) })
                .update(payload);
        }
        const latest = await findRecord();
        if (!latest || Number(latest.score) < score) throw new Error('成绩尚未确认保存，请稍后重试');
        return { id: latest._id, score: Number(latest.score) };
    }

    async function loadPetSave() {
        assertReady();
        const user = await getCurrentUser();
        if (!user) throw new Error('请先登录后再同步伙伴存档');
        const result = await db.collection(MESSAGES_COLLECTION)
            .where({ board: PETS_BOARD, userId: user.id })
            .limit(1)
            .get();
        if (!Array.isArray(result?.data)) throw new Error('云端伙伴存档读取结果异常，未覆盖任何数据');
        const records = result.data;
        const record = records[0];
        if (!record) return null;
        if (!record.save || typeof record.save !== 'object' || Array.isArray(record.save)) throw new Error('云端伙伴存档格式异常，原数据已保留');
        return record.save;
    }

    async function savePetSave(save, expected) {
        assertReady();
        const user = await getCurrentUser();
        if (!user) throw new Error('请先登录后再同步伙伴存档');
        if (!expected || expected.userId !== user.id) throw new Error('账号已变化，请先读取云端伙伴存档');
        const safeSave = JSON.parse(JSON.stringify(save && typeof save === 'object' ? save : {}));
        const serialized = JSON.stringify(safeSave);
        if (serialized.length > 120000) throw new Error('伙伴存档数据过大');
        const now = new Date().toISOString();
        const { data: existing } = await db.collection(MESSAGES_COLLECTION)
            .where({ board: PETS_BOARD, userId: user.id })
            .limit(1)
            .get();
        const oldRecord = Array.isArray(existing) && existing.length > 0 ? existing[0] : null;
        const payload = { board: PETS_BOARD, userId: user.id, save: safeSave, updatedAt: now,
            writeToken: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}` };
        if (oldRecord) {
            if (!oldRecord.save || typeof oldRecord.save !== 'object' || Array.isArray(oldRecord.save)) throw new Error('云端伙伴存档格式异常，原数据已保留');
            if ((oldRecord.save?.updatedAt ?? null) !== (expected.expectedUpdatedAt ?? null)
                || (oldRecord.save?.revision ?? null) !== (expected.expectedRevision ?? null)) {
                throw new Error('云端伙伴存档已更新，请先重新读取，未覆盖任何数据');
            }
            const condition = { _id: oldRecord._id, userId: user.id,
                writeToken: oldRecord.writeToken ?? db.command.exists(false) };
            const result = await db.collection(MESSAGES_COLLECTION)
                .where(condition)
                .update(payload);
            if (Number(result?.updated ?? result?.stats?.updated) !== 1) throw new Error('云端伙伴存档已变化，请重新读取');
            return oldRecord._id;
        }
        if (expected.expectedUpdatedAt != null || expected.expectedRevision != null) throw new Error('云端伙伴存档已变化，请先重新读取');
        payload.createdAt = now;
        payload._id = `rsgame_pet_${encodeURIComponent(user.id)}`;
        const result = await db.collection(MESSAGES_COLLECTION).add(payload);
        return result && result.id;
    }

    window.RSCloud = {
        init,
        getCurrentUser,
        sendCode,
        loginWithPhone,
        logout,
        loadMessages,
        sendMessage,
        loadLeaderboard,
        submitScore,
        loadPetSave,
        savePetSave
    };
})();
