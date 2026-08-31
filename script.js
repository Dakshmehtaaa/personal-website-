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
   Portfolio tabs + project accordion
====================================== */
(function () {

    const tabs = Array.from(document.querySelectorAll('.portfolio-tab'));
    const panels = Array.from(document.querySelectorAll('.portfolio-panel'));

    tabs.forEach(tab => {

        tab.addEventListener('click', () => {

            const target = tab.dataset.tabTarget;

            tabs.forEach(other => {
                const isActive = other === tab;
                other.classList.toggle('active', isActive);
                other.setAttribute('aria-selected', String(isActive));
            });

            panels.forEach(panel => {
                const isActive = panel.id === target;
                panel.classList.toggle('active', isActive);
                panel.hidden = !isActive;
            });

        });

    });

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
   CV modal
====================================== */
(function () {

    const openButton = document.getElementById('open-cv-modal');
    const closeButton = document.getElementById('close-cv-modal');
    const modal = document.getElementById('cv-modal');
    const form = document.getElementById('cv-download-form');
    const success = document.getElementById('cv-success-msg');

    if (!modal) return;

    const open = () => {
        modal.classList.remove('hidden');
        if (form) form.classList.remove('hidden');
        if (success) success.classList.add('hidden');
        document.body.style.overflow = 'hidden';
        const first = modal.querySelector('input');
        if (first) window.setTimeout(() => first.focus(), 120);
    };

    const close = () => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    };

    if (openButton) openButton.addEventListener('click', open);
    if (closeButton) closeButton.addEventListener('click', close);

    modal.addEventListener('click', event => {
        if (event.target === modal) close();
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !modal.classList.contains('hidden')) close();
    });

    if (!form) return;

    form.addEventListener('submit', event => {

        event.preventDefault();

        // Start the download. Nothing is transmitted anywhere.
        const link = document.createElement('a');
        link.href = 'assets/CV_Daksh_2026.pdf';
        link.download = 'CV_Daksh_Mehta.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        form.classList.add('hidden');
        if (success) success.classList.remove('hidden');
        form.reset();

    });

})();


/* ======================================
   Scroll reveal
====================================== */
(function () {

    const targets = document.querySelectorAll(
        '.section-head, .about-grid, .timeline-item, .logo-strip, .portfolio-tabs, ' +
        '.panel-note, .accordion-item, .insight-card, .contact-card, .hero-stats, ' +
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
   Footer year
====================================== */
(function () {
    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
})();
