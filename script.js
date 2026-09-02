/* ======================================
   Intro — typing splash (once per session)
====================================== */
(function () {

    const overlay = document.getElementById('intro-overlay');
    const textEl = document.getElementById('intro-text');
    const cursorEl = document.getElementById('intro-cursor');

    if (!overlay || !textEl || !cursorEl) return;
    if (document.documentElement.getAttribute('data-intro') === 'skip') return;

    const MESSAGE = 'Daksh Mehta';
    const TYPE_MS = 85;
    const START_DELAY = 550;
    const END_HOLD = 550;
    const FADE_MS = 500;

    document.body.style.overflow = 'hidden';
    cursorEl.classList.add('blink');

    let finished = false;

    const finish = () => {

        if (finished) return;
        finished = true;

        overlay.classList.add('intro-hide');
        document.body.style.overflow = '';

        try { sessionStorage.setItem('introDone', '1'); } catch (e) { /* storage blocked */ }

        window.setTimeout(() => { overlay.style.display = 'none'; }, FADE_MS);

        window.removeEventListener('keydown', finish);
        overlay.removeEventListener('click', finish);

    };

    // Let an impatient visitor jump straight to the site
    overlay.addEventListener('click', finish);
    window.addEventListener('keydown', finish);

    window.setTimeout(() => {

        if (finished) return;

        cursorEl.classList.remove('blink');

        let i = 0;

        const typeNext = () => {

            if (finished) return;

            if (i >= MESSAGE.length) {
                cursorEl.classList.add('blink');
                window.setTimeout(finish, END_HOLD);
                return;
            }

            textEl.textContent += MESSAGE[i];
            i += 1;
            window.setTimeout(typeNext, TYPE_MS);

        };

        typeNext();

    }, START_DELAY);

    // Safety net: a visitor is never trapped behind the splash
    window.setTimeout(finish, START_DELAY + MESSAGE.length * TYPE_MS + END_HOLD + 3000);

})();


/* ======================================
   Theme (light / dark)
====================================== */
(function () {

    const root = document.documentElement;
    const toggle = document.getElementById('theme-toggle');
    const meta = document.querySelector('meta[name="theme-color"]');

    const paintMeta = theme => {
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#0c1512' : '#ffffff');
    };

    paintMeta(root.getAttribute('data-theme'));

    if (!toggle) return;

    toggle.addEventListener('click', () => {

        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';

        root.setAttribute('data-theme', next);
        paintMeta(next);

        try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked */ }

    });

    // Follow the OS only while the visitor hasn't chosen for themselves
    const query = window.matchMedia('(prefers-color-scheme: dark)');

    query.addEventListener('change', event => {

        let stored = null;
        try { stored = localStorage.getItem('theme'); } catch (e) { /* storage blocked */ }

        if (stored) return;

        const next = event.matches ? 'dark' : 'light';
        root.setAttribute('data-theme', next);
        paintMeta(next);

    });

})();


/* ======================================
   Language (EN / FR)
====================================== */
(function () {

    const root = document.documentElement;
    const buttons = Array.from(document.querySelectorAll('.lang-btn'));
    const dictionary = (window.TRANSLATIONS || {});

    if (!buttons.length) return;

    // Capture the English source straight from the markup so we can switch back
    const english = {};

    document.querySelectorAll('[data-i18n]').forEach(element => {
        english[element.dataset.i18n] = element.innerHTML;
    });

    const apply = lang => {

        const table = lang === 'en' ? english : (dictionary[lang] || {});

        document.querySelectorAll('[data-i18n]').forEach(element => {

            const value = table[element.dataset.i18n];

            if (typeof value === 'string') element.innerHTML = value;
            else if (lang !== 'en' && english[element.dataset.i18n] !== undefined) {
                element.innerHTML = english[element.dataset.i18n];
            }

        });

        root.setAttribute('lang', lang);

        buttons.forEach(button => {
            const isActive = button.dataset.lang === lang;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });

    };

    buttons.forEach(button => {

        button.addEventListener('click', () => {

            const lang = button.dataset.lang;

            apply(lang);

            try { localStorage.setItem('lang', lang); } catch (e) { /* storage blocked */ }

        });

    });

    // The inline head script already set <html lang>; honour it now that the DOM is ready
    apply(root.getAttribute('lang') === 'fr' ? 'fr' : 'en');

})();


/* ======================================
   Navigation — scroll state, burger, active link
====================================== */
(function () {

    const nav = document.querySelector('nav');
    const burger = document.getElementById('nav-burger');
    const links = document.getElementById('nav-links');

    if (nav) {

        let ticking = false;

        window.addEventListener('scroll', () => {

            if (ticking) return;

            ticking = true;

            window.requestAnimationFrame(() => {
                nav.classList.toggle('scrolled', window.scrollY > 40);
                ticking = false;
            });

        }, { passive: true });

    }

    if (burger && links) {

        burger.addEventListener('click', () => {
            const open = links.classList.toggle('open');
            burger.setAttribute('aria-expanded', String(open));
        });

        links.addEventListener('click', event => {
            if (event.target.tagName !== 'A') return;
            links.classList.remove('open');
            burger.setAttribute('aria-expanded', 'false');
        });

    }

    // Highlight the section currently in view
    const navAnchors = Array.from(document.querySelectorAll('.nav-links a'));
    const sections = navAnchors
        .map(anchor => document.querySelector(anchor.getAttribute('href')))
        .filter(Boolean);

    if (!sections.length || !('IntersectionObserver' in window)) return;

    const spy = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if (!entry.isIntersecting) return;

            navAnchors.forEach(anchor => {
                anchor.classList.toggle('active', anchor.getAttribute('href') === '#' + entry.target.id);
            });

        });

    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(section => spy.observe(section));

})();


/* ======================================
   Project accordion
====================================== */
(function () {

    const heads = Array.from(document.querySelectorAll('.accordion-head'));

    heads.forEach(head => {

        head.addEventListener('click', () => {

            const item = head.closest('.accordion-item');

            if (!item) return;

            const willOpen = !item.classList.contains('open');

            // Keep a single project open at a time
            heads.forEach(other => {

                const otherItem = other.closest('.accordion-item');

                if (!otherItem || otherItem === item) return;

                otherItem.classList.remove('open');
                other.setAttribute('aria-expanded', 'false');

            });

            item.classList.toggle('open', willOpen);
            head.setAttribute('aria-expanded', String(willOpen));

        });

    });

})();


/* ======================================
   LinkedIn embeds — degrade gracefully
   when the iframe cannot load (offline,
   tracking blockers, non-public post)
====================================== */
(function () {

    const embeds = Array.from(document.querySelectorAll('.li-embed'));

    embeds.forEach(embed => {

        const frame = embed.querySelector('iframe');

        if (!frame) return;

        let loaded = false;

        frame.addEventListener('load', () => { loaded = true; });

        // If the frame never loads at all, drop the empty box rather than
        // leaving a blank panel. The written summary above it already carries
        // the card, so nothing is lost.
        window.setTimeout(() => {
            if (!loaded) embed.remove();
        }, 6000);

    });

})();


/* ======================================
   Scroll reveal
====================================== */
(function () {

    const targets = document.querySelectorAll(
        '.section-head, .about-grid, .timeline-item, .logo-strip, ' +
        '.panel-note, .accordion-item, .insight-card, .contact-card, ' +
        '.adv-card, .res-card, .promo-strip-link'
    );

    if (!targets.length) return;

    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        targets.forEach(target => target.classList.add('revealed'));
        return;
    }

    targets.forEach(target => target.classList.add('reveal'));

    // Position-based rather than observer-based: one code path, and content
    // can never stay stuck invisible if a callback fails to fire.
    let pending = Array.from(targets);
    let ticking = false;

    const check = () => {

        const limit = window.innerHeight * 0.92;

        pending = pending.filter(target => {

            if (target.getBoundingClientRect().top > limit) return true;

            target.classList.add('revealed');
            return false;

        });

        if (!pending.length) {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', check);
        }

    };

    function onScroll() {

        if (ticking) return;

        ticking = true;

        window.requestAnimationFrame(() => {
            check();
            ticking = false;
        });

    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', check);
    window.addEventListener('load', check);

    check();

})();


/* ======================================
   Advantages carousel (sustainability page)
====================================== */
(function () {

    const track = document.getElementById('adv-track');
    const prevBtn = document.getElementById('adv-prev');
    const nextBtn = document.getElementById('adv-next');
    const dots = Array.from(document.querySelectorAll('.adv-dot'));

    if (!track || !prevBtn || !nextBtn || !dots.length) return;

    const pageCount = track.children.length;
    let page = 0;

    const render = () => {

        track.style.transform = `translateX(-${page * 100}%)`;

        prevBtn.disabled = page === 0;
        nextBtn.disabled = page === pageCount - 1;

        dots.forEach((dot, i) => dot.classList.toggle('active', i === page));

    };

    prevBtn.addEventListener('click', () => {
        if (page === 0) return;
        page -= 1;
        render();
    });

    nextBtn.addEventListener('click', () => {
        if (page === pageCount - 1) return;
        page += 1;
        render();
    });

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => {
            page = i;
            render();
        });
    });

    render();

})();


/* ======================================
   Portfolio — show the rest of the projects
====================================== */
(function () {

    const toggle = document.getElementById('pf-more-toggle');
    const more = document.getElementById('pf-more');

    if (!toggle || !more) return;

    const dictionary = (window.TRANSLATIONS || {});

    // The label is swapped by JS, so it needs both translations up front
    const label = open => {

        const lang = document.documentElement.getAttribute('lang');
        const key = open ? 'pf.showLess' : 'pf.showMore';
        const fallback = open ? 'Show fewer projects' : 'Show all 11 projects';

        return (lang === 'fr' && dictionary.fr && dictionary.fr[key]) || fallback;

    };

    const isOpen = () => !more.hasAttribute('hidden');

    toggle.addEventListener('click', () => {

        const open = !isOpen();

        more.toggleAttribute('hidden', !open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.textContent = label(open);

        // Keep the key in sync so a later language switch picks the right string
        toggle.dataset.i18n = open ? 'pf.showLess' : 'pf.showMore';

    });

    // 'Show fewer projects' never appears in the markup, so the language switch
    // has no captured English source for it and would leave the button in French
    // on the way back. Rewrite our own label after every switch instead.
    new MutationObserver(() => { toggle.textContent = label(isOpen()); })
        .observe(document.documentElement, { attributeFilter: ['lang'] });

})();


/* ======================================
   Spotlight hover glow on card blocks
====================================== */
(function () {

    const cards = document.querySelectorAll('.adv-card, .res-card');

    if (!cards.length) return;
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    cards.forEach(card => {

        card.addEventListener('pointermove', event => {

            const rect = card.getBoundingClientRect();

            card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
            card.style.setProperty('--my', `${event.clientY - rect.top}px`);

        });

    });

})();


/* ======================================
   Coverflow carousel (hobbies page)
====================================== */
(function () {

    const root = document.getElementById('coverflow');
    const stage = document.getElementById('coverflow-stage');
    const dotsWrap = document.getElementById('cf-dots');
    const prevBtn = document.getElementById('cf-prev');
    const nextBtn = document.getElementById('cf-next');

    if (!root || !stage || !dotsWrap || !prevBtn || !nextBtn) return;

    const slides = Array.from(stage.querySelectorAll('.cf-slide'));

    if (!slides.length) return;

    const total = slides.length;
    let index = 0;

    const dots = slides.map((slide, i) => {

        const dot = document.createElement('button');

        dot.type = 'button';
        dot.className = 'cf-dot';
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => go(i));
        dotsWrap.appendChild(dot);

        // Clicking a side slide brings it to the front
        slide.addEventListener('click', () => { if (i !== index) go(i); });

        return dot;

    });

    // Shortest signed distance from the active slide, so the strip wraps evenly
    const offsetFrom = i => {
        let diff = (i - index + total) % total;
        if (diff > total / 2) diff -= total;
        return diff;
    };

    function render() {

        slides.forEach((slide, i) => {

            const pos = offsetFrom(i);

            if (Math.abs(pos) <= 2) slide.setAttribute('data-pos', String(pos));
            else slide.removeAttribute('data-pos');

        });

        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));

    }

    function go(next) {
        index = (next + total) % total;
        render();
    }

    prevBtn.addEventListener('click', () => go(index - 1));
    nextBtn.addEventListener('click', () => go(index + 1));

    root.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft') { go(index - 1); event.preventDefault(); }
        if (event.key === 'ArrowRight') { go(index + 1); event.preventDefault(); }
    });

    // Swipe
    let startX = null;

    stage.addEventListener('pointerdown', event => { startX = event.clientX; });

    stage.addEventListener('pointerup', event => {

        if (startX === null) return;

        const diff = event.clientX - startX;

        if (Math.abs(diff) > 45) go(diff < 0 ? index + 1 : index - 1);

        startX = null;

    });

    render();

})();


/* ======================================
   Footer year
====================================== */
(function () {
    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
})();
