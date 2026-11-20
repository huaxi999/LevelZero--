import { getMainDom, setActiveSection } from './dom.js';
import * as storage from './storage.js';
import { escapeHtml, formatCloudTime, isTypingTarget, rectHit, sanitizeNickname, startCodeCountdown } from './utils.js';
import { initRpsGame } from './rps.js';
import { initPlaneGame } from './plane.js';
import { initBrickGame } from './brick.js';
import { initFightGame } from './fight.js';
import { initAbyssGame } from './abyss.js';
import { initPetGame } from './pet.js';
import { initPeakDuel } from './peak-duel.js';
import { getActivePeakCharacter, getPeakSave } from './peak-duel-storage.js';

document.addEventListener('DOMContentLoaded', () => {
    const dom = getMainDom();
    const gameDom = {
        planeCanvas: document.getElementById('plane-canvas'),
        planeScoreEl: document.getElementById('plane-score'),
        planeLevelEl: document.getElementById('plane-level'),
        planeCoinsEl: document.getElementById('plane-coins'),
        planeDiamondsEl: document.getElementById('plane-diamonds'),
        planeStartBtn: document.getElementById('plane-start'),
        planeRestartBtn: document.getElementById('plane-restart'),
        planePauseBtn: document.getElementById('plane-pause'),
        planeControlHint: document.getElementById('plane-control-hint'),
        planeActionControls: document.getElementById('plane-action-controls'),
        planeBombBtn: document.getElementById('plane-bomb-btn'),
        planeBurstBtn: document.getElementById('plane-burst-btn'),
        planeBombCount: document.getElementById('plane-bomb-count'),
        planeBurstCount: document.getElementById('plane-burst-count'),
        brickCanvas: document.getElementById('brick-canvas'),
        brickScoreEl: document.getElementById('brick-score'),
        brickLevelEl: document.getElementById('brick-level'),
        brickLivesEl: document.getElementById('brick-lives'),
        brickBallsEl: document.getElementById('brick-balls'),
        brickBuffEl: document.getElementById('brick-buff'),
        brickStartBtn: document.getElementById('brick-start'),
        brickRestartBtn: document.getElementById('brick-restart'),
        brickPauseBtn: document.getElementById('brick-pause'),
        brickCoinsEl: document.getElementById('brick-coins'),
        brickUpgradeButtons: Array.from(document.querySelectorAll('.brick-upgrade-btn')),
        abyssCanvas: document.getElementById('abyss-canvas'),
    };

    const rpsDom = {
        computerChoiceDisplay: document.getElementById('computer-choice-display'),
        playerChoiceDisplay: document.getElementById('player-choice-display'),
        rpsResult: document.getElementById('rps-result'),
        rpsResultText: document.getElementById('rps-result')?.querySelector('.result-text'),
        rpsButtons: Array.from(document.querySelectorAll('.rps-btn')),
        winsEl: document.getElementById('wins'),
        lossesEl: document.getElementById('losses'),
        drawsEl: document.getElementById('draws'),
        resetStatsBtn: document.getElementById('reset-stats'),
    };

    let cloudReady = false;
    let cloudReadyPromise = null;
    let authEpoch = 0;
    let authChanging = false;
    const authChangedError = () => Object.assign(new Error('登录状态正在变化，请稍后重试'), { code: 'AUTH_CHANGED' });
    let cloudUnavailable = false;
    let cloudUser = null;
    let cloudVerification = null;
    let cloudMessageTimer = 0;
    let cloudMessageInterval = null;
    let messageCooldownUntil = 0;
    let messageSending = null;
    let messageRequestId = 0;
    let codeSending = false;
    let codeCooldownUntil = 0;
    let loginPending = false;
    let loginViewEpoch = 0;
    let leaderboardRequestId = 0;
    let pendingScoreFlush = null;
    let rpsGame = null;
    let leaderboardGame = 'plane';
    let planeGame = null;
    let brickGame = null;
    let fightGame = null;
    let abyssGame = null;
    let petGame = null;
    let peakDuelGame = null;

    const setCloudTip = (text) => {
        if (dom.cloudTip) dom.cloudTip.textContent = text || '';
    };

    const setLoginTip = (text) => {
        if (dom.loginTip) dom.loginTip.textContent = text || '';
    };

    const updateCloudMessageButton = () => {
        if (!dom.cloudSendMessageBtn) return;
        cloudMessageTimer = Math.max(0, Math.ceil((messageCooldownUntil - Date.now()) / 1000));
        const onCooldown = cloudMessageTimer > 0;
        dom.cloudSendMessageBtn.disabled = !cloudUser || authChanging || onCooldown || Boolean(messageSending);
        dom.cloudSendMessageBtn.textContent = messageSending ? '发送中…' : onCooldown ? `发送冷却 ${cloudMessageTimer}s` : '发送';
    };

    const updateCloudStatus = () => {
        const loggedIn = !!cloudUser;
        const phone = typeof cloudUser?.phone === 'string' ? cloudUser.phone.replace('+86 ', '') : '';
        if (dom.accountMode) dom.accountMode.textContent = loggedIn ? '已登录' : '游客试玩';
        if (dom.logoutBtn) dom.logoutBtn.textContent = loggedIn ? '退出登录' : '登录 / 同步';
        dom.cloudLoginBtn?.classList.toggle('hidden', loggedIn);
        if (dom.cloudStatus) dom.cloudStatus.textContent = cloudUnavailable ? '云端暂不可用 · 本地存档' : (loggedIn ? `云端 ${phone || '已登录'}` : '本地存档');
        if (dom.cloudLoginState) dom.cloudLoginState.textContent = cloudUnavailable ? '本地模式' : (loggedIn ? `已登录 ${phone || ''}` : '未登录');
        if (dom.cloudAccountPhone) dom.cloudAccountPhone.textContent = loggedIn ? (phone || '已登录') : '游客试玩';
        if (dom.cloudLogoutBtn) dom.cloudLogoutBtn.disabled = !loggedIn;
        if (dom.cloudRefreshMessagesBtn) dom.cloudRefreshMessagesBtn.disabled = !loggedIn;
        if (dom.cloudMessageInput) dom.cloudMessageInput.disabled = !loggedIn;
        if (dom.loginBtn) { dom.loginBtn.disabled = loginPending; dom.loginBtn.textContent = loginPending ? '登录中…' : '验证并开始'; }
        updateCloudMessageButton();
        if (dom.loginTip && !dom.loginCard?.classList.contains('hidden')) {
            setLoginTip(cloudUnavailable ? '云端暂不可用，可返回游客试玩。' : (loggedIn ? '云端已登录，输入昵称后可以直接开始。' : '游客可直接游玩，登录后使用云端功能。'));
        }
    };

    const ensureCloudReady = async () => {
        if (authChanging) throw authChangedError();
        if (!window.RSCloud) throw new Error('联网脚本未加载');
        const epoch = authEpoch;
        try {
            if (!cloudReady) {
                cloudReadyPromise ||= Promise.resolve().then(() => window.RSCloud.init()).then(() => { cloudReady = true; }).finally(() => { cloudReadyPromise = null; });
                await cloudReadyPromise;
            }
            if (authChanging || epoch !== authEpoch) throw authChangedError();
            const user = await window.RSCloud.getCurrentUser();
            if (authChanging || epoch !== authEpoch) throw authChangedError();
            cloudUnavailable = false;
            cloudUser = user;
            updateCloudStatus();
            return cloudUser;
        } catch (error) {
            if (authChanging || epoch !== authEpoch) throw authChangedError();
            throw error;
        }
    };

    const renderCloudMessages = (list, emptyText = '还没有留言，来抢第一条。') => {
        if (!dom.cloudMessages) return;
        if (!list || list.length === 0) {
            dom.cloudMessages.innerHTML = `<div class="cloud-empty">${escapeHtml(emptyText)}</div>`;
            return;
        }
        dom.cloudMessages.innerHTML = list.map((item) => `
            <div class="cloud-message">
                <div class="cloud-message-head">
                    <span>${escapeHtml(item.playerName || '玩家')}#${escapeHtml(item.phoneLast4 || '')}</span>
                    <span class="cloud-message-time">${escapeHtml(formatCloudTime(item.createdAt))}</span>
                </div>
                <div class="cloud-message-content">${escapeHtml(item.content || '')}</div>
            </div>
        `).join('');
        dom.cloudMessages.scrollTop = dom.cloudMessages.scrollHeight;
    };

    const loadCloudMessages = async () => {
        const requestId = ++messageRequestId;
        const epoch = authEpoch;
        const isCurrentRequest = () => requestId === messageRequestId && epoch === authEpoch && !authChanging;
        try {
            await ensureCloudReady();
            if (!isCurrentRequest()) return;
            if (!cloudUser) {
                renderCloudMessages([], '登录后查看和发布留言。');
                setCloudTip('游客可继续游玩，登录后可查看和发布留言。');
                return;
            }
            setCloudTip('正在读取留言...');
            const userId = cloudUser.id;
            const list = await window.RSCloud.loadMessages();
            if (!isCurrentRequest() || cloudUser?.id !== userId) return;
            renderCloudMessages(list);
            setCloudTip(`已读取 ${list.length} 条留言。`);
        } catch (error) {
            if (!isCurrentRequest()) return;
            renderCloudMessages([], '留言暂时无法读取，请稍后重试。');
            setCloudTip(error?.message || '读取留言失败');
        }
    };

    const stopCloudMessageCooldown = () => {
        if (cloudMessageInterval) clearInterval(cloudMessageInterval);
        cloudMessageInterval = null;
        cloudMessageTimer = 0;
        messageCooldownUntil = 0;
        updateCloudMessageButton();
    };

    const startCloudMessageCooldown = () => {
        messageCooldownUntil = Date.now() + 10000;
        if (cloudMessageInterval) clearInterval(cloudMessageInterval);
        const tick = () => {
            if (Date.now() >= messageCooldownUntil) {
                stopCloudMessageCooldown();
                return;
            }
            updateCloudMessageButton();
        };
        tick();
        cloudMessageInterval = setInterval(tick, 1000);
    };

    const flushPendingLeaderboardScores = async () => {
        if (!cloudUser?.id || authChanging) return 0;
        const userId = cloudUser.id;
        const epoch = authEpoch;
        if (pendingScoreFlush?.userId === userId && pendingScoreFlush.epoch === epoch) return pendingScoreFlush.promise;
        storage.claimGuestLeaderboardScores(userId);
        const task = { userId, epoch, promise: null };
        pendingScoreFlush = task;
        task.promise = (async () => {
            let submitted = 0;
            for (const entry of Object.values(storage.getPendingLeaderboardScores(userId))) {
                if (authChanging || epoch !== authEpoch || cloudUser?.id !== userId) break;
                try {
                    await sendCloudScoreNow(entry.game, entry.score, entry.meta, entry.playerName, userId, epoch);
                    storage.removePendingLeaderboardScore(entry.game, entry.score, userId);
                    submitted += 1;
                } catch (error) {
                    console.warn('[leaderboard] flush pending score failed:', error);
                }
            }
            return submitted;
        })();
        try { return await task.promise; }
        finally { if (pendingScoreFlush === task) pendingScoreFlush = null; }
    };

    const handleCloudLogout = async () => {
        if (authChanging || loginPending) return;
        try {
            await ensureCloudReady();
            if (authChanging) return;
            authEpoch += 1;
            authChanging = true;
            try { await window.RSCloud.logout(); }
            finally { authEpoch += 1; authChanging = false; }
            pauseAllGames();
            cloudUser = null;
            cloudVerification = null;
            messageSending = null;
            messageRequestId += 1;
            stopCloudMessageCooldown();
            updateCloudStatus();
            renderCloudMessages([], '登录后查看和发布留言。');
            setCloudTip('已退出云端登录。');
            showApp();
            void petGame?.syncCloud?.();
        } catch (error) {
            const message = `退出登录失败：${error?.message || '请稍后重试'}。当前账号和游戏状态已保留。`;
            setCloudTip(message);
            setLoginTip(message);
            if (dom.cloudStatus) dom.cloudStatus.textContent = message;
        }
    };

    const handleCloudSendMessage = async () => {
        if (messageSending || authChanging || Date.now() < messageCooldownUntil) return;
        const content = dom.cloudMessageInput?.value.trim() || '';
        if (!content) {
            setCloudTip('请输入留言内容。');
            dom.cloudMessageInput?.focus();
            return;
        }
        if (!cloudUser?.id) { setCloudTip('请先手机号登录。'); return; }
        const task = { userId: cloudUser.id, epoch: authEpoch };
        const isCurrentSend = () => messageSending === task && !authChanging && task.epoch === authEpoch && cloudUser?.id === task.userId;
        messageSending = task;
        updateCloudMessageButton();
        try {
            await ensureCloudReady();
            if (!isCurrentSend()) return;
            await window.RSCloud.sendMessage({
                playerName: storage.getStoredNickname() || '玩家',
                content,
                expectedUserId: task.userId,
            });
            if (!isCurrentSend()) return;
            if (dom.cloudMessageInput?.value.trim() === content) dom.cloudMessageInput.value = '';
            startCloudMessageCooldown();
            setCloudTip('留言发送成功。');
            await loadCloudMessages();
        } catch (error) {
            if (isCurrentSend()) setCloudTip(error?.message || '发送留言失败');
        } finally {
            if (messageSending === task) messageSending = null;
            updateCloudMessageButton();
        }
    };

    const leaderboardGameLabels = {
        plane: '飞机大战',
        brick: '超级弹球',
    };

    const setLeaderboardStatus = (text) => {
        if (dom.leaderboardStatus) dom.leaderboardStatus.textContent = text || '';
    };

    const syncLeaderboardTabs = (game) => {
        dom.leaderboardTabs.forEach((btn) => {
            const active = btn.dataset.game === game;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-selected', active ? 'true' : 'false');
        });
    };

    const renderLeaderboard = (list, game = leaderboardGame) => {
        if (!dom.leaderboardList) return;
        const title = leaderboardGameLabels[game] || '排行榜';
        if (!list || list.length === 0) {
            dom.leaderboardList.innerHTML = `<div class="leaderboard-empty">${title} 暂无数据。</div>`;
            return;
        }

        dom.leaderboardList.innerHTML = `
            <div class="leaderboard-head">
                <span>排名</span>
                <span>昵称</span>
                <span>尾号</span>
                <span>分数</span>
            </div>
            ${list.map((item, index) => {
                const rank = index + 1;
                const score = Number(item.score) || 0;
                return `
                    <div class="leaderboard-row ${rank <= 3 ? `leaderboard-top-${rank}` : ''}">
                        <span class="leaderboard-rank">#${rank}</span>
                        <span class="leaderboard-name">${escapeHtml(item.playerName || '玩家')}</span>
                        <span class="leaderboard-phone">${escapeHtml(item.phoneLast4 || '----')}</span>
                        <span class="leaderboard-score">${score}</span>
                    </div>
                `;
            }).join('')}
        `;
    };

    const loadLeaderboardView = async (game = leaderboardGame) => {
        const requestId = ++leaderboardRequestId;
        leaderboardGame = game;
        syncLeaderboardTabs(leaderboardGame);
        setLeaderboardStatus('正在读取...');
        try {
            await ensureCloudReady();
            const epoch = authEpoch;
            const pendingFlush = flushPendingLeaderboardScores().then(
                submitted => ({ submitted }), error => ({ error })
            );
            const list = await window.RSCloud.loadLeaderboard(game);
            if (requestId !== leaderboardRequestId) return;
            renderLeaderboard(list, game);
            const status = `${leaderboardGameLabels[game] || '排行榜'} · 已读取 ${list.length} 条`;
            setLeaderboardStatus(status);
            const result = await pendingFlush;
            if (requestId !== leaderboardRequestId || epoch !== authEpoch) return;
            if (result.error) setLeaderboardStatus(`${status} · 成绩补传暂未完成，请稍后刷新重试`);
            else if (result.submitted) {
                try {
                    const updated = await window.RSCloud.loadLeaderboard(game);
                    if (requestId !== leaderboardRequestId) return;
                    renderLeaderboard(updated, game);
                    setLeaderboardStatus(`${leaderboardGameLabels[game] || '排行榜'} · 已读取 ${updated.length} 条`);
                } catch {
                    if (requestId === leaderboardRequestId) setLeaderboardStatus(`${status} · 成绩已补传，请刷新查看最新排名`);
                }
            }
        } catch (error) {
            if (requestId !== leaderboardRequestId) return;
            if (dom.leaderboardList) dom.leaderboardList.innerHTML = '<div class="leaderboard-empty">排行榜暂时无法读取，请稍后刷新重试。</div>';
            setLeaderboardStatus(error?.message || '读取排行榜失败');
        }
    };

    const sendCloudScoreNow = async (game, score, meta, playerName, expectedUserId, expectedEpoch) => {
        const accountChanged = () => authChanging || expectedEpoch !== authEpoch || cloudUser?.id !== expectedUserId;
        if (!expectedUserId || accountChanged()) throw authChangedError();
        await ensureCloudReady();
        if (accountChanged()) throw authChangedError();
        await window.RSCloud.submitScore({ game, score, playerName, meta, expectedUserId });
        if (accountChanged()) throw authChangedError();
    };

    const submitCloudScore = async (game, score, meta = {}) => {
        const userId = cloudUser?.id || null;
        const epoch = authEpoch;
        const playerName = storage.getStoredNickname() || '玩家';
        window.dispatchEvent(new CustomEvent('rosang:game-result', {
            detail: { game, score, ...meta, victory: Boolean(meta.victory) },
        }));
        if (!window.RSCloud || !userId) {
            storage.upsertPendingLeaderboardScore(game, score, meta, playerName, userId);
            return false;
        }
        try {
            await sendCloudScoreNow(game, score, meta, playerName, userId, epoch);
            storage.removePendingLeaderboardScore(game, score, userId);
            if (dom.leaderboardList && !document.getElementById('leaderboard')?.classList.contains('hidden') && leaderboardGame === game) {
                await loadLeaderboardView(game);
            }
            return true;
        } catch (error) {
            storage.upsertPendingLeaderboardScore(game, score, meta, playerName, userId);
            console.warn('[leaderboard] submit score failed:', error);
            return false;
        }
    };

    const updateWelcome = (name) => {
        if (dom.welcomeName) dom.welcomeName.textContent = name || '朋友';
    };

    const updateHomeMobileContinue = () => {
        const card = dom.mobileContinue;
        if (!card) return;
        const save = getPeakSave();
        const character = getActivePeakCharacter(save);
        if (!character) {
            card.classList.remove('hidden');
            if (dom.mobileContinueTitle) dom.mobileContinueTitle.textContent = '开始巅峰对决';
            if (dom.mobileContinueDetail) dom.mobileContinueDetail.textContent = '创建角色，进入天空圣域';
            if (dom.mobileContinueBtn) {
                dom.mobileContinueBtn.textContent = '开始';
                dom.mobileContinueBtn.dataset.mobileContinueTarget = 'peak-duel';
            }
            return;
        }
        card.classList.remove('hidden');
        const run = character.activeRun;
        if (run) {
            if (dom.mobileContinueTitle) dom.mobileContinueTitle.textContent = '继续战斗';
            if (dom.mobileContinueDetail) dom.mobileContinueDetail.textContent = `${character.name} · 第${run.round || 1}回合 · ${run.phase === 'playerPlanning' ? '等待出牌' : '战斗进行中'}`;
            if (dom.mobileContinueBtn) {
                dom.mobileContinueBtn.textContent = '回到战斗';
                dom.mobileContinueBtn.dataset.mobileContinueTarget = 'peak-duel';
            }
        } else {
            if (dom.mobileContinueTitle) dom.mobileContinueTitle.textContent = `继续 ${character.name}`;
            if (dom.mobileContinueDetail) dom.mobileContinueDetail.textContent = `Lv.${character.level} · 体力 ${character.stamina.current}/${character.stamina.max} · 进入主城`;
            if (dom.mobileContinueBtn) {
                dom.mobileContinueBtn.textContent = '进入';
                dom.mobileContinueBtn.dataset.mobileContinueTarget = 'peak-duel';
            }
        }
    };

    const showSection = (sectionId) => {
        if (setActiveSection(dom.sections, dom.navButtons, sectionId) === false) return;
        updateHomeMobileContinue();
        const onVisibleFrame = (callback) => requestAnimationFrame(() => {
            if (document.hidden || dom.mainPage?.classList.contains('hidden')
                || dom.mainPage?.getAttribute('data-active-section') !== sectionId) return;
            callback();
        });

        if (sectionId === 'brick') {
            onVisibleFrame(() => {
                brickGame?.resize();
                brickGame?.draw();
            });
        }
        if (sectionId === 'plane') {
            onVisibleFrame(() => {
                if (!planeGame?.isRunning() && !planeGame?.isGameOver()) {
                    planeGame?.resize();
                    planeGame?.setMenuView('main');
                    planeGame?.updateProgressUI();
                }
                planeGame?.syncMobileMode?.();
            });
        }
        if (sectionId === 'fight') {
            onVisibleFrame(() => {
                fightGame?.render();
                fightGame?.syncMobileMode?.();
            });
        }
        if (sectionId === 'abyss') {
            onVisibleFrame(() => {
                abyssGame?.resize();
                abyssGame?.resume();
            });
        }
        if (sectionId === 'pet') {
            onVisibleFrame(() => {
                petGame?.resize();
                petGame?.resume();
            });
        }
        if (sectionId === 'peak-duel') {
            onVisibleFrame(() => peakDuelGame?.resume());
        }
        if (sectionId === 'mowangcheng' && dom.mowangchengFrame && !dom.mowangchengFrame.getAttribute('src')) {
            dom.mowangchengFrame.setAttribute('src', dom.mowangchengFrame.dataset.src || 'mowangcheng/index.html');
        }
        if (sectionId === 'mowangcheng') {
            window.mowangchengFrameCommand?.('resume');
        } else {
            window.mowangchengFrameCommand?.('pause');
        }

        if (sectionId !== 'plane') planeGame?.pause();
        if (sectionId !== 'brick') brickGame?.pause();
        if (sectionId !== 'fight') fightGame?.pause();
        if (sectionId !== 'abyss') abyssGame?.pause();
        if (sectionId !== 'pet') petGame?.pause();
        if (sectionId !== 'peak-duel') peakDuelGame?.pause();
        if (sectionId !== 'rps') rpsGame?.pause?.();

        if (sectionId === 'message-board') {
            loadCloudMessages();
        }
        if (sectionId === 'leaderboard') {
            loadLeaderboardView(leaderboardGame);
        }
    };

    const showApp = () => {
        const returningFromLogin = dom.mainPage?.classList.contains('hidden');
        loginViewEpoch += 1;
        dom.loginCard?.classList.add('hidden');
        dom.mainPage?.classList.remove('hidden');
        dom.mobileBottomNav?.classList.remove('hidden');
        updateWelcome(storage.getStoredNickname() || '游客');
        showSection('home');
        if (returningFromLogin) {
            const home = document.getElementById('home');
            home?.setAttribute('tabindex', '-1');
            home?.focus({ preventScroll: true });
        }
    };

    const pauseAllGames = () => {
        for (const game of [rpsGame, planeGame, brickGame, fightGame, abyssGame, petGame, peakDuelGame]) game?.pause?.();
        window.mowangchengFrameCommand?.('pause');
    };

    const showLogin = (tipText = '') => {
        const viewEpoch = ++loginViewEpoch;
        pauseAllGames();
        dom.mainPage?.classList.add('hidden');
        dom.mobileBottomNav?.classList.add('hidden');
        dom.loginCard?.classList.remove('hidden');
        if (dom.nicknameInput) dom.nicknameInput.value = storage.getStoredNickname() || '游客';
        if (Date.now() < codeCooldownUntil) startCodeCountdown(dom.loginSendCodeBtn, '获取验证码', codeCooldownUntil);
        updateCloudStatus();
        setLoginTip(tipText || (cloudUnavailable ? '云端暂不可用，可返回游客试玩。' : '登录后可同步云端数据，也可随时返回游客试玩。'));
        setTimeout(() => {
            if (viewEpoch === loginViewEpoch && !dom.loginCard?.classList.contains('hidden')) dom.nicknameInput?.focus();
        }, 0);
    };

    const handleLoginSendCode = async () => {
        if (codeSending || Date.now() < codeCooldownUntil) return;
        const phone = dom.loginPhoneInput?.value.trim() || '';
        if (!/^1[3-9]\d{9}$/.test(phone)) {
            setLoginTip('请输入有效手机号。');
            dom.loginPhoneInput?.focus();
            return;
        }
        const viewEpoch = loginViewEpoch;
        codeSending = true;
        if (dom.loginSendCodeBtn) dom.loginSendCodeBtn.disabled = true;
        try {
            await ensureCloudReady();
            if (viewEpoch !== loginViewEpoch) return;
            setLoginTip('正在发送验证码...');
            cloudVerification = { ...await window.RSCloud.sendCode(phone), phone };
            codeCooldownUntil = Date.now() + 60000;
            startCodeCountdown(dom.loginSendCodeBtn, '获取验证码', codeCooldownUntil);
            if (viewEpoch === loginViewEpoch) {
                setLoginTip('验证码已发送，请查看短信。');
                dom.loginCodeInput?.focus();
            }
        } catch (error) {
            if (viewEpoch === loginViewEpoch) setLoginTip(error?.message || '发送验证码失败');
        } finally {
            codeSending = false;
            if (dom.loginSendCodeBtn) dom.loginSendCodeBtn.disabled = Date.now() < codeCooldownUntil;
        }
    };

    const handleLogin = async () => {
        if (loginPending || authChanging) return;
        const nickname = sanitizeNickname(dom.nicknameInput?.value || '');
        if (!nickname) {
            dom.nicknameInput?.focus();
            return;
        }

        const viewEpoch = loginViewEpoch;
        loginPending = true;
        updateCloudStatus();
        try {
            await ensureCloudReady();
            if (viewEpoch !== loginViewEpoch) return;
            if (!cloudUser) {
                const phone = dom.loginPhoneInput?.value.trim() || '';
                const code = dom.loginCodeInput?.value.trim() || '';
                if (!/^1[3-9]\d{9}$/.test(phone)) {
                    setLoginTip('请输入有效手机号。');
                    dom.loginPhoneInput?.focus();
                    return;
                }
                if (!cloudVerification || cloudVerification.phone !== phone) {
                    setLoginTip('请先为当前手机号获取验证码。');
                    return;
                }
                if (!code) {
                    setLoginTip('请输入验证码。');
                    dom.loginCodeInput?.focus();
                    return;
                }
                setLoginTip('正在验证手机号...');
                authEpoch += 1;
                authChanging = true;
                try { cloudUser = await window.RSCloud.loginWithPhone(phone, code, cloudVerification); }
                finally { authEpoch += 1; authChanging = false; }
                updateCloudStatus();
            }
            storage.setStoredNickname(nickname);
            updateWelcome(nickname);
            if (viewEpoch === loginViewEpoch) {
                setLoginTip('登录成功，正在进入游戏。');
                showApp();
            }
            void flushPendingLeaderboardScores().catch(console.warn);
            void petGame?.syncCloud?.();
        } catch (error) {
            if (viewEpoch === loginViewEpoch) setLoginTip(error?.message || '手机号验证失败');
        } finally {
            loginPending = false;
            if (dom.loginBtn) { dom.loginBtn.disabled = false; dom.loginBtn.textContent = '验证并开始'; }
        }
    };

    rpsGame = initRpsGame({
        ...rpsDom,
        getStoredStats: storage.getStoredStats,
        setStoredStats: storage.setStoredStats,
    });
    planeGame = initPlaneGame({ dom: gameDom, storage, submitCloudScore });
    brickGame = initBrickGame({ dom: gameDom, storage, submitCloudScore, isTypingTarget, rectHit });
    fightGame = initFightGame({ showSection });
    abyssGame = initAbyssGame({ canvas: gameDom.abyssCanvas });
    petGame = initPetGame({
        showSection,
        cloudSync: {
            load: async () => {
                await ensureCloudReady();
                if (!cloudUser) return { status: 'guest' };
                if (!window.RSCloud?.loadPetSave) throw new Error('伙伴云存档接口未加载');
                const userId = cloudUser.id;
                const epoch = authEpoch;
                const save = await window.RSCloud.loadPetSave();
                if (authChanging || epoch !== authEpoch || cloudUser?.id !== userId) throw authChangedError();
                return { status: 'authenticated', userId, save };
            },
            save: async (save, expected) => {
                await ensureCloudReady();
                if (!cloudUser) return { saved: false, reason: 'guest' };
                if (!expected?.userId || expected.userId !== cloudUser.id) throw new Error('账号已变化，请先读取云端存档');
                if (!window.RSCloud?.savePetSave) throw new Error('伙伴云存档接口未加载');
                const epoch = authEpoch;
                await window.RSCloud.savePetSave(save, expected);
                if (authChanging || epoch !== authEpoch || cloudUser?.id !== expected.userId) throw authChangedError();
                return { saved: true, userId: expected.userId };
            },
        },
    });
    peakDuelGame = initPeakDuel({ root: document.getElementById('peak-duel') });

    planeGame.resize();
    planeGame.reset();
    brickGame.resize();
    brickGame.reset();
    brickGame.draw();
    fightGame.setup();
    fightGame.render();
    abyssGame.resize();
    abyssGame.render();
    petGame.render();
    peakDuelGame.render();

    let resizeQueued = false;
    window.addEventListener('resize', () => {
        if (resizeQueued) return;
        resizeQueued = true;
        requestAnimationFrame(() => {
            resizeQueued = false;
            planeGame.resize();
            planeGame.render();
            planeGame.syncMobileMode?.();
            brickGame.resize();
            if (!brickGame.state.running || brickGame.state.paused) brickGame.draw();
            abyssGame.resize();
            petGame.resize();
        });
    });

    dom.loginBtn?.addEventListener('click', handleLogin);
    dom.guestPlayBtn?.addEventListener('click', showApp);
    dom.cloudLoginBtn?.addEventListener('click', () => showLogin());
    const isSubmitEnter = (event) => event.key === 'Enter' && !event.isComposing && event.keyCode !== 229;
    dom.nicknameInput?.addEventListener('keydown', (event) => {
        if (isSubmitEnter(event)) handleLogin();
    });
    dom.loginSendCodeBtn?.addEventListener('click', handleLoginSendCode);
    dom.loginPhoneInput?.addEventListener('keydown', (event) => {
        if (isSubmitEnter(event)) handleLoginSendCode();
    });
    dom.loginCodeInput?.addEventListener('keydown', (event) => {
        if (isSubmitEnter(event)) handleLogin();
    });
    dom.logoutBtn?.addEventListener('click', async () => {
        if (cloudUser) await handleCloudLogout();
        else showLogin();
    });
    dom.cloudRefreshUserBtn?.addEventListener('click', () => {
        ensureCloudReady()
            .then(() => {
                if (!cloudUser) {
                    setCloudTip('当前为游客试玩，点击登录后可使用云端功能。');
                    return;
                }
                setCloudTip('云端登录状态已刷新。');
                return loadCloudMessages();
            })
            .catch((error) => setCloudTip(error?.message || '刷新登录失败'));
    });
    dom.cloudLogoutBtn?.addEventListener('click', async () => {
        await handleCloudLogout();
    });
    dom.cloudRefreshMessagesBtn?.addEventListener('click', loadCloudMessages);
    dom.cloudSendMessageBtn?.addEventListener('click', handleCloudSendMessage);
    dom.cloudMessageInput?.addEventListener('keydown', (event) => {
        if (isSubmitEnter(event)) handleCloudSendMessage();
    });
    dom.leaderboardRefreshBtn?.addEventListener('click', () => loadLeaderboardView(leaderboardGame));
    dom.leaderboardTabs.forEach((btn) => {
        btn.addEventListener('click', () => loadLeaderboardView(btn.dataset.game || 'plane'));
    });
    dom.navButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            if (target) showSection(target);
        });
    });
    dom.startGameButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const game = btn.dataset.homeStart || btn.closest('.game-card')?.dataset.game;
            if (game) showSection(game);
        });
    });
    dom.mobileContinueBtn?.addEventListener('click', () => showSection(dom.mobileContinueBtn.dataset.mobileContinueTarget || 'peak-duel'));
    let mobileNavigationEpoch = 0;
    dom.mobileBottomNav?.querySelectorAll('[data-mobile-target]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.mobileTarget;
            if (!target) return;
            const navigationEpoch = ++mobileNavigationEpoch;
            const returnToHomeTop = target === 'home' && !btn.dataset.mobileScroll
                && dom.mainPage?.getAttribute('data-active-section') === 'home';
            showSection(target);
            if (returnToHomeTop) window.scrollTo?.({ top: 0, left: 0, behavior: 'smooth' });
            if (btn.dataset.mobileScroll) {
                requestAnimationFrame(() => {
                    if (navigationEpoch !== mobileNavigationEpoch || document.hidden || dom.mainPage?.classList.contains('hidden')
                        || dom.mainPage?.getAttribute('data-active-section') !== target) return;
                    document.querySelector(`.${btn.dataset.mobileScroll}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
            }
        });
    });
    updateHomeMobileContinue();
    updateCloudStatus();
    window.addEventListener('pagehide', pauseAllGames);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) { pauseAllGames(); return; }
        if (dom.mainPage?.classList.contains('hidden')) return;
        const section = dom.mainPage?.getAttribute('data-active-section');
        if (section === 'abyss') abyssGame?.resume();
        if (section === 'pet') petGame?.resume();
        if (section === 'peak-duel') peakDuelGame?.resume();
    });

    const bootstrapLoginState = async () => {
        showApp();
        const savedNickname = storage.getStoredNickname();
        if (savedNickname) {
            if (dom.nicknameInput) dom.nicknameInput.value = savedNickname;
            updateWelcome(savedNickname);
        }
        try {
            await ensureCloudReady();
        } catch (error) {
            if (error?.code === 'AUTH_CHANGED') return;
            cloudUnavailable = true;
            cloudUser = null;
            updateCloudStatus();
            return;
        }
        if (cloudUser) await flushPendingLeaderboardScores();
        await petGame?.syncCloud?.();
    };

    bootstrapLoginState().catch(error => console.warn('[cloud] account restore failed:', error));
});
