export const sanitizeNickname = (value) => String(value ?? '').trim().slice(0, 12);

export const randomFrom = (list) => list[Math.floor(Math.random() * list.length)];

export const isTypingTarget = (target) => {
    const tag = target?.tagName?.toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable;
};

export const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

export const formatCloudTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString();
};

export const startCodeCountdown = (button, label = '获取验证码', deadline = Date.now() + 60000) => {
    if (!button) return;
    if (button._countdownInterval) {
        clearInterval(button._countdownInterval);
        button._countdownInterval = null;
    }
    const tick = () => {
        const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
        if (remaining <= 0) {
            button.disabled = false;
            button.textContent = label;
            clearInterval(button._countdownInterval);
            button._countdownInterval = null;
            return;
        }
        button.disabled = true;
        button.textContent = `重新发送(${remaining}s)`;
    };
    tick();
    button._countdownInterval = setInterval(tick, 1000);
};

export const rectHit = (a, b) => (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
);
