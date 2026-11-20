const carouselInstances = new WeakMap();
const ROTATION_DELAY = 4500;

export const initHomeCarousel = (root = globalThis.document?.getElementById('home-featured-carousel')) => {
    if (!root) return null;
    if (carouselInstances.has(root)) return carouselInstances.get(root);

    const doc = root.ownerDocument;
    const view = doc.defaultView;
    const slides = [...root.querySelectorAll('[data-featured-slide]')];
    if (slides.length === 0) return null;
    const selectors = [...root.querySelectorAll('[data-featured-select]')];
    const toggle = root.querySelector('[data-featured-toggle]');
    const toggleIcon = root.querySelector('[data-featured-toggle-icon]');
    const current = root.querySelector('[data-featured-current]');
    const home = root.closest('#home');
    const mainPage = root.closest('#main-page');
    let index = Math.max(0, slides.findIndex(slide => slide.classList.contains('is-active')));
    let autoplay = slides.length > 1;
    let keyboardInput = Boolean(doc.activeElement?.matches?.(':focus-visible'));
    const hasKeyboardFocus = node => keyboardInput && slides.some(slide => slide.contains(node));
    let keyboardFocused = hasKeyboardFocus(doc.activeElement);
    let pressedPointer = null;
    let pageActive = true;
    let destroyed = false;
    let timer = null;
    let timerGeneration = 0;
    const unbind = [];

    const listen = (target, type, handler) => {
        if (!target) return;
        target.addEventListener(type, handler);
        unbind.push(() => target.removeEventListener(type, handler));
    };
    const visible = () => pageActive && !doc.hidden && !root.closest('.hidden');
    const canRotate = () => !destroyed && autoplay && slides.length > 1 && visible() && !keyboardFocused && pressedPointer === null;
    const stopTimer = () => {
        timerGeneration += 1;
        if (timer !== null) view.clearTimeout(timer);
        timer = null;
        root.dataset.playing = 'false';
    };
    const render = () => {
        slides.forEach((slide, position) => {
            const active = position === index;
            slide.classList.toggle('is-active', active);
            slide.setAttribute('aria-hidden', String(!active));
            slide.inert = !active;
        });
        selectors.forEach(button => {
            const active = Number(button.dataset.featuredSelect) === index;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        if (toggle) {
            const label = autoplay ? '暂停自动切换' : '开启自动切换';
            toggle.setAttribute('aria-label', label);
            toggle.setAttribute('title', label);
            toggle.setAttribute('aria-pressed', String(autoplay));
        }
        if (toggleIcon) toggleIcon.textContent = autoplay ? 'Ⅱ' : '▶';
        if (current) current.textContent = String(index + 1).padStart(2, '0');
        root.setAttribute('aria-live', autoplay ? 'off' : 'polite');
    };
    const syncTimer = () => {
        stopTimer();
        if (!canRotate()) return;
        root.dataset.playing = 'true';
        const generation = timerGeneration;
        timer = view.setTimeout(() => {
            if (generation !== timerGeneration) return;
            timer = null;
            if (!canRotate()) { root.dataset.playing = 'false'; return; }
            index = (index + 1) % slides.length;
            render();
            syncTimer();
        }, ROTATION_DELAY);
    };
    const select = position => {
        if (!Number.isInteger(position)) return;
        index = (position % slides.length + slides.length) % slides.length;
        render();
        syncTimer();
    };
    const refreshVisibility = () => {
        if (!visible()) pressedPointer = null;
        keyboardFocused = hasKeyboardFocus(doc.activeElement);
        syncTimer();
    };
    const refreshFocus = node => {
        const focused = hasKeyboardFocus(node);
        if (focused === keyboardFocused) return;
        keyboardFocused = focused;
        syncTimer();
    };
    const releasePointer = event => {
        if (pressedPointer === null || (event.pointerId !== undefined && event.pointerId !== pressedPointer)) return;
        pressedPointer = null;
        syncTimer();
    };

    selectors.forEach(button => listen(button, 'click', () => select(Number(button.dataset.featuredSelect))));
    listen(root.querySelector('[data-featured-prev]'), 'click', () => select(index - 1));
    listen(root.querySelector('[data-featured-next]'), 'click', () => select(index + 1));
    listen(toggle, 'click', () => { autoplay = !autoplay; render(); syncTimer(); });
    listen(doc, 'keydown', () => { keyboardInput = true; refreshFocus(doc.activeElement); });
    listen(doc, 'pointerdown', event => {
        keyboardInput = false;
        const previousPointer = pressedPointer;
        if (event.isPrimary !== false) {
            pressedPointer = event.button === 0 && slides[index].contains(event.target) ? event.pointerId : null;
        }
        refreshFocus(doc.activeElement);
        if (previousPointer !== pressedPointer) syncTimer();
    });
    listen(doc, 'pointerup', releasePointer);
    listen(doc, 'pointercancel', releasePointer);
    listen(view, 'blur', releasePointer);
    listen(root, 'focusin', event => refreshFocus(event.target));
    listen(root, 'focusout', event => refreshFocus(event.relatedTarget));
    listen(doc, 'visibilitychange', refreshVisibility);
    listen(view, 'pagehide', () => { pageActive = false; pressedPointer = null; stopTimer(); });
    listen(view, 'pageshow', () => { pageActive = true; refreshVisibility(); });

    const observer = view.MutationObserver ? new view.MutationObserver(refreshVisibility) : null;
    for (const ancestor of [home, mainPage]) {
        if (ancestor) observer?.observe(ancestor, { attributes: true, attributeFilter: ['class'] });
    }

    const controller = {
        destroy() {
            destroyed = true;
            stopTimer();
            observer?.disconnect();
            unbind.forEach(remove => remove());
            carouselInstances.delete(root);
        },
    };
    carouselInstances.set(root, controller);
    root.style.setProperty('--featured-interval', `${ROTATION_DELAY}ms`);
    render();
    syncTimer();
    return controller;
};

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initHomeCarousel(), { once: true });
    else initHomeCarousel();
}
