export const getMainDom = () => ({
    loginCard: document.getElementById('login-card'),
    mainPage: document.getElementById('main-page'),
    nicknameInput: document.getElementById('nickname-input'),
    loginPhoneInput: document.getElementById('login-phone-input'),
    loginCodeInput: document.getElementById('login-code-input'),
    loginSendCodeBtn: document.getElementById('login-send-code-btn'),
    loginTip: document.getElementById('login-tip'),
    loginBtn: document.getElementById('login-btn'),
    guestPlayBtn: document.getElementById('guest-play-btn'),
    accountMode: document.getElementById('account-mode'),
    logoutBtn: document.getElementById('logout-btn'),
    welcomeName: document.getElementById('welcome-name'),
    cloudStatus: document.getElementById('cloud-status'),
    cloudLoginState: document.getElementById('cloud-login-state'),
    cloudAccountPhone: document.getElementById('cloud-account-phone'),
    cloudRefreshUserBtn: document.getElementById('cloud-refresh-user'),
    cloudLogoutBtn: document.getElementById('cloud-logout'),
    cloudLoginBtn: document.getElementById('cloud-login'),
    cloudTip: document.getElementById('cloud-tip'),
    cloudMessages: document.getElementById('cloud-messages'),
    cloudMessageInput: document.getElementById('cloud-message-input'),
    cloudSendMessageBtn: document.getElementById('cloud-send-message'),
    cloudRefreshMessagesBtn: document.getElementById('cloud-refresh-messages'),
    leaderboardStatus: document.getElementById('leaderboard-status'),
    leaderboardRefreshBtn: document.getElementById('leaderboard-refresh'),
    leaderboardList: document.getElementById('leaderboard-list'),
    mowangchengFrame: document.getElementById('mowangcheng-frame'),
    navButtons: Array.from(document.querySelectorAll('.nav-btn')),
    sections: Array.from(document.querySelectorAll('.section')),
    startGameButtons: Array.from(document.querySelectorAll('.start-game-btn')),
    leaderboardTabs: Array.from(document.querySelectorAll('.leaderboard-tab')),
    mobileBottomNav: document.getElementById('mobile-bottom-nav'),
    mobileContinue: document.getElementById('home-mobile-continue'),
    mobileContinueTitle: document.getElementById('home-mobile-continue-title'),
    mobileContinueDetail: document.getElementById('home-mobile-continue-detail'),
    mobileContinueBtn: document.getElementById('home-mobile-continue-btn'),
});

const GAME_SECTION_IDS = new Set([
    'plane',
    'brick',
    'rps',
    'fight',
    'abyss',
    'peak-duel',
    'mowangcheng',
    'pet',
]);

export const setActiveSection = (sections, navButtons, sectionId) => {
    const targetSection = sections.find(section => section.id === sectionId);
    if (!targetSection) return false;
    const mainPage = document.getElementById('main-page');
    const previousSectionId = mainPage?.getAttribute('data-active-section');
    if (previousSectionId === sectionId && !targetSection.classList.contains('hidden')) return true;
    const isGameSection = GAME_SECTION_IDS.has(sectionId);
    mainPage?.setAttribute('data-active-section', sectionId);
    mainPage?.classList.toggle('is-game-section', isGameSection);
    mainPage?.setAttribute('data-page-mode', isGameSection ? 'game' : 'lobby');
    mainPage?.classList.remove('is-peak-battle-view');
    mainPage?.classList.remove('is-fight-playing');
    mainPage?.classList.remove('is-plane-playing');
    const mobileBottomNav = document.getElementById('mobile-bottom-nav');
    mobileBottomNav?.classList.toggle('is-game-section', isGameSection);
    mobileBottomNav?.classList.remove('is-peak-battle-view');
    mobileBottomNav?.classList.remove('is-fight-playing');
    mobileBottomNav?.classList.remove('is-plane-playing');

    sections.forEach((section) => {
        section.classList.toggle('hidden', section.id !== sectionId);
    });

    navButtons.forEach((btn) => {
        const active = btn.dataset.target === sectionId;
        btn.classList.toggle('active', active);
        if (active) btn.setAttribute('aria-current', 'page');
        else btn.removeAttribute('aria-current');
    });

    document.querySelectorAll('#mobile-bottom-nav [data-mobile-target]').forEach((btn) => {
        const active = btn.dataset.mobileTarget === sectionId && !btn.dataset.mobileScroll;
        btn.classList.toggle('active', active);
        if (active) btn.setAttribute('aria-current', 'page');
        else btn.removeAttribute('aria-current');
    });

    if (previousSectionId && previousSectionId !== sectionId) {
        targetSection.setAttribute('tabindex', '-1');
        targetSection.focus?.({ preventScroll: true });
        window.scrollTo?.({ top: 0, left: 0, behavior: 'instant' });
    }
    return true;
};
