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

    const nav = document.querySelector('.site-nav');
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

    // Highlight the section currently in view — shared with the side index,
    // whose links point at the same anchors
    const navAnchors = Array.from(document.querySelectorAll('.nav-links a, .side-index a'));
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
   Side index — appears once the hero scrolls out of view
====================================== */
(function () {

    const rail = document.getElementById('side-index');
    const hero = document.getElementById('top');

    if (!rail || !hero || !('IntersectionObserver' in window)) return;

    // Reveal a bit before the hero has fully scrolled away rather than
    // waiting for the last pixel of it to clear the viewport.
    const reveal = new IntersectionObserver(entries => {
        entries.forEach(entry => rail.classList.toggle('is-visible', !entry.isIntersecting));
    }, { rootMargin: '0px 0px -70% 0px' });

    reveal.observe(hero);

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
   Scroll reveal
====================================== */
(function () {

    // This list is the only place .reveal is applied — never put the class in
    // the markup, or the reduced-motion path (which adds .revealed without
    // .reveal) leaves the element stuck at opacity:0 forever.
    const targets = document.querySelectorAll(
        '.section-head, .about-grid, .timeline-item, .logo-strip, ' +
        '.panel-note, .accordion-item, .insight-card, .contact-card, ' +
        '.adv-card, .res-card, .promo-strip-link, ' +
        '.co2-scope-card, .co2-method-card, .co2-hero-facts li'
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
   Sustainability page — background video
====================================== */
(function () {

    const video = document.getElementById('sus-video');

    if (!video) return;

    // The file has no audio track, so there's nothing to unmute — `muted`
    // stays purely to satisfy the autoplay policy.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        video.removeAttribute('autoplay');
        video.pause();
        return;
    }

    if (!('IntersectionObserver' in window)) return;

    // Save the decode/CPU cost while it's off-screen rather than looping
    // a video nobody is looking at.
    new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) video.play().catch(() => {});
            else video.pause();
        });
    }, { threshold: 0.25 }).observe(video);

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


/* ======================================
   CO₂ tracker (beta) — co2-tracker.html

   Every input carries its own emission factor in data-factor, so the maths
   here is one multiply per row and the factor table at the bottom of the page
   is generated from the same attributes. There is deliberately no second copy
   of the numbers anywhere.
====================================== */
(function () {

    const form = document.getElementById('co2-calc');

    if (!form) return;

    const STORAGE_KEY = 'co2-tracker-v1';

    /* Upstream (well-to-tank) shares for Scope 3 category 3. Derived from the
       DEFRA/DESNZ WTT factors against their combustion counterparts: gas is
       ~19%, diesel ~24%, and for electricity WTT plus grid losses is ~21%. */
    const WTT_FUEL = 0.19;
    const WTT_ELEC = 0.21;

    /* Equivalence anchors, both taken from factors already used on this page:
       a Paris–New York return in economy is ~11,680 p.km at 0.117 kgCO₂e,
       and a car is 0.17 kgCO₂e per km. */
    const KG_PER_FLIGHT = 11680 * 0.117;
    const KG_PER_CAR_KM = 0.17;

    const dictionary = window.TRANSLATIONS || {};

    const t = (key, fallback) => {
        const lang = document.documentElement.getAttribute('lang');
        return (lang === 'fr' && dictionary.fr && dictionary.fr[key]) || fallback;
    };

    const rows = Array.from(form.querySelectorAll('input[data-scope]'));

    const gridSelect = document.getElementById('s2-grid');
    const customRow = document.getElementById('s2-custom-row');
    const customInput = document.getElementById('s2-custom');
    const elecInput = document.getElementById('s2-elec');
    const refrigSelect = document.getElementById('s1-refrig-type');
    const refrigInput = document.getElementById('s1-refrig');
    const wttCheck = document.getElementById('s3-wtt');
    const wttOut = document.getElementById('s3-wtt-out');

    const totalOut = document.getElementById('co2-total');
    const barEmpty = document.getElementById('co2-bar-empty');
    const intensityBox = document.getElementById('co2-intensity');
    const topBox = document.getElementById('co2-top');
    const topList = document.getElementById('co2-top-list');
    const equivBox = document.getElementById('co2-equiv');
    const equivList = document.getElementById('co2-equiv-list');
    const factorBody = document.getElementById('co2-factor-body');

    /* ---------- formatting ---------- */

    const formatters = {};

    const fmt = (value, digits) => {

        const lang = document.documentElement.getAttribute('lang') === 'fr' ? 'fr-FR' : 'en-GB';
        const key = lang + digits;

        if (!formatters[key]) {
            formatters[key] = new Intl.NumberFormat(lang, {
                minimumFractionDigits: digits,
                maximumFractionDigits: digits
            });
        }

        return formatters[key].format(value);

    };

    // Below a tonne, kilograms read better; above it, tonnes do.
    const mass = kg => {
        if (kg >= 1000) return fmt(kg / 1000, 2) + ' t';
        if (kg > 0 && kg < 10) return fmt(kg, 1) + ' kg';
        return fmt(kg, 0) + ' kg';
    };

    // Factors span five orders of magnitude (0.025 to 3922), so pick the
    // decimals from the value rather than padding everything to a fixed width.
    const factorText = value => {
        const rounded = Math.round(value * 1e5) / 1e5;
        const decimals = (String(rounded).split('.')[1] || '').length;
        return fmt(rounded, Math.min(decimals, 5));
    };

    const amount = element => {
        const value = parseFloat(element.value);
        return Number.isFinite(value) && value > 0 ? value : 0;
    };

    const factorOf = input => {
        const value = parseFloat(input.dataset.factor);
        return Number.isFinite(value) ? value : 0;
    };

    const labelOf = input => {
        const label = input.closest('.co2-row, .co2-check');
        const span = label && label.querySelector('.co2-row-label > span');
        return span ? span.textContent.trim() : input.id;
    };

    /* ---------- the two rows whose factor comes from a <select> ---------- */

    const syncGrid = () => {

        if (!gridSelect || !elecInput) return;

        const custom = gridSelect.value === 'custom';
        const option = gridSelect.options[gridSelect.selectedIndex];
        const name = option ? (option.dataset.label || option.textContent.trim()) : '';

        if (customRow) customRow.hidden = !custom;

        if (custom) {
            const own = customInput ? parseFloat(customInput.value) : NaN;
            elecInput.dataset.factor = Number.isFinite(own) && own >= 0 ? String(own) : '0';
            elecInput.dataset.source = t('co2.src.supplier', 'Supplier-specific factor');
        } else {
            elecInput.dataset.factor = gridSelect.value;
            elecInput.dataset.source = name + ' — ' + t('co2.src.grid', 'grid average, location-based');
        }

    };

    const syncRefrigerant = () => {

        if (!refrigSelect || !refrigInput) return;

        const option = refrigSelect.options[refrigSelect.selectedIndex];
        const name = option ? (option.dataset.label || option.textContent.trim()) : '';

        refrigInput.dataset.factor = refrigSelect.value;
        refrigInput.dataset.source = 'IPCC AR5 GWP₁₀₀ — ' + name;

    };

    /* ---------- the calculation ---------- */

    const compute = () => {

        const totals = { 1: 0, 2: 0, 3: 0 };
        const lines = [];

        let fuelKg = 0;
        let elecKg = 0;

        rows.forEach(input => {

            const quantity = amount(input);
            const factor = factorOf(input);
            const kg = quantity * factor;
            const scope = input.dataset.scope;

            totals[scope] += kg;

            if (input.dataset.fuel === '1') fuelKg += kg;
            if (input.dataset.elec === '1') elecKg += kg;

            const output = form.querySelector('output[for="' + input.id + '"]');

            if (output) {
                output.textContent = mass(kg);
                output.dataset.active = kg > 0 ? '1' : '0';
            }

            if (kg > 0) lines.push({ scope: scope, name: labelOf(input), quantity: quantity, unit: input.dataset.unit || '', factor: factor, kg: kg, source: input.dataset.source || '' });

        });

        // Scope 3, category 3 — upstream of everything counted above
        const wttKg = wttCheck && wttCheck.checked ? (fuelKg * WTT_FUEL + elecKg * WTT_ELEC) : 0;

        totals[3] += wttKg;

        if (wttOut) {
            wttOut.textContent = mass(wttKg);
            wttOut.dataset.active = wttKg > 0 ? '1' : '0';
        }

        if (wttKg > 0) {
            lines.push({
                scope: '3',
                name: t('co2.line.wtt', 'Upstream fuel and energy (WTT + grid losses)'),
                quantity: null,
                unit: '',
                factor: null,
                kg: wttKg,
                source: 'DEFRA/DESNZ 2025 — WTT and T&D'
            });
        }

        return { totals: totals, lines: lines, grand: totals[1] + totals[2] + totals[3] };

    };

    /* ---------- rendering ---------- */

    const renderTop = lines => {

        if (!topBox || !topList) return;

        const best = lines.slice().sort((a, b) => b.kg - a.kg).slice(0, 3);

        topBox.hidden = best.length === 0;
        topList.textContent = '';

        best.forEach(line => {

            const item = document.createElement('li');
            const name = document.createElement('span');
            const value = document.createElement('strong');

            name.className = 'co2-top-name';
            name.textContent = line.name;
            // the panel is narrow enough to ellipsise a long activity name
            name.title = line.name;
            value.textContent = mass(line.kg);

            item.append(name, value);
            topList.append(item);

        });

    };

    const renderEquivalents = grand => {

        if (!equivBox || !equivList) return;

        equivBox.hidden = grand <= 0;

        if (grand <= 0) return;

        const items = [
            fmt(grand / KG_PER_FLIGHT, 0) + ' ' + t('co2.eq.flights', 'return Paris–New York flights, in economy'),
            fmt(grand / KG_PER_CAR_KM, 0) + ' ' + t('co2.eq.km', 'kilometres driven in an average car')
        ];

        equivList.textContent = '';

        items.forEach(text => {
            const item = document.createElement('li');
            item.textContent = text;
            equivList.append(item);
        });

    };

    const renderIntensity = grand => {

        if (!intensityBox) return;

        const staffField = document.getElementById('org-staff');
        const revenueField = document.getElementById('org-revenue');

        const staff = staffField ? amount(staffField) : 0;
        const revenue = revenueField ? amount(revenueField) : 0;

        const staffRow = document.getElementById('co2-int-staff');
        const staffValue = document.getElementById('co2-int-staff-val');
        const revenueRow = document.getElementById('co2-int-rev');
        const revenueValue = document.getElementById('co2-int-rev-val');

        const showStaff = staff > 0 && grand > 0;
        const showRevenue = revenue > 0 && grand > 0;

        if (staffRow) {
            staffRow.hidden = !showStaff;
            if (showStaff && staffValue) staffValue.textContent = fmt(grand / 1000 / staff, 2) + ' t';
        }

        if (revenueRow) {
            revenueRow.hidden = !showRevenue;
            if (showRevenue && revenueValue) revenueValue.textContent = fmt(grand / 1000 / revenue, 2) + ' t';
        }

        intensityBox.hidden = !showStaff && !showRevenue;

    };

    const render = () => {

        const result = compute();
        const grand = result.grand;

        ['1', '2', '3'].forEach(scope => {

            const kg = result.totals[scope];
            const share = grand > 0 ? (kg / grand) * 100 : 0;

            const pill = form.querySelector('[data-scope-total="' + scope + '"]');
            const bar = form.querySelector('[data-bar="' + scope + '"]');
            const legend = form.querySelector('[data-legend="' + scope + '"]');
            const pct = form.querySelector('[data-legend-pct="' + scope + '"]');

            if (pill) pill.textContent = mass(kg);
            if (bar) bar.style.width = share + '%';
            if (legend) legend.textContent = fmt(kg / 1000, 2) + ' t';
            if (pct) pct.textContent = grand > 0 ? fmt(share, 0) + '%' : '—';

        });

        if (barEmpty) barEmpty.style.display = grand > 0 ? 'none' : 'block';
        if (totalOut) totalOut.textContent = fmt(grand / 1000, 2);

        renderIntensity(grand);
        renderTop(result.lines);
        renderEquivalents(grand);

        return result;

    };

    /* ---------- factor table, built from the inputs themselves ---------- */

    const renderFactorTable = () => {

        if (!factorBody) return;

        factorBody.textContent = '';

        rows.forEach(input => {

            const tr = document.createElement('tr');
            const scope = input.dataset.scope;

            const scopeCell = document.createElement('td');
            const swatch = document.createElement('span');
            const scopeWrap = document.createElement('span');

            swatch.className = 'co2-swatch co2-swatch--s' + scope;
            scopeWrap.className = 'co2-table-scope';
            scopeWrap.append(swatch, document.createTextNode(' ' + scope));
            scopeCell.append(scopeWrap);

            const cells = [
                labelOf(input),
                factorText(factorOf(input)),
                'kgCO₂e / ' + (input.dataset.unit || ''),
                input.dataset.source || ''
            ];

            tr.append(scopeCell);

            cells.forEach(text => {
                const td = document.createElement('td');
                td.textContent = text;
                tr.append(td);
            });

            factorBody.append(tr);

        });

        const tr = document.createElement('tr');
        const scopeCell = document.createElement('td');
        const swatch = document.createElement('span');
        const scopeWrap = document.createElement('span');

        swatch.className = 'co2-swatch co2-swatch--s3';
        scopeWrap.className = 'co2-table-scope';
        scopeWrap.append(swatch, document.createTextNode(' 3'));
        scopeCell.append(scopeWrap);
        tr.append(scopeCell);

        [
            t('co2.line.wtt', 'Upstream fuel and energy (WTT + grid losses)'),
            fmt(WTT_FUEL * 100, 0) + '% / ' + fmt(WTT_ELEC * 100, 0) + '%',
            t('co2.table.uplift', 'of Scope 1 fuels / Scope 2 electricity'),
            'DEFRA/DESNZ 2025 — WTT and T&D'
        ].forEach(text => {
            const td = document.createElement('td');
            td.textContent = text;
            tr.append(td);
        });

        factorBody.append(tr);

    };

    /* ---------- persistence ---------- */

    const stored = () => Array.from(form.querySelectorAll('input, select'));

    const save = () => {

        const state = {};

        stored().forEach(field => {
            if (!field.id) return;
            state[field.id] = field.type === 'checkbox' ? field.checked : field.value;
        });

        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
        catch (e) { /* storage blocked or full — the page still works, it just won't remember */ }

    };

    const restore = () => {

        let state = null;

        try { state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
        catch (e) { return; }

        if (!state || typeof state !== 'object') return;

        stored().forEach(field => {

            if (!field.id || !(field.id in state)) return;

            const value = state[field.id];

            if (field.type === 'checkbox') field.checked = Boolean(value);
            else if (typeof value === 'string') field.value = value;

        });

    };

    /* ---------- CSV ---------- */

    const csvCell = value => '"' + String(value === null || value === undefined ? '' : value).replace(/"/g, '""') + '"';

    const downloadCsv = () => {

        const result = render();

        const name = (document.getElementById('org-name') || {}).value || '';
        const year = (document.getElementById('org-year') || {}).value || '';

        const lines = [
            ['Screening GHG inventory (beta) — dakshmehtaaa.github.io/personal-website-/co2-tracker.html'],
            ['Organisation', name],
            ['Reporting year', year],
            ['Generated', new Date().toISOString().slice(0, 10)],
            ['Basis', 'GHG Protocol scopes. Location-based Scope 2. Indicative screening estimate, not audit-grade.'],
            [],
            ['Scope', 'Activity', 'Quantity', 'Unit', 'Factor (kgCO2e/unit)', 'kgCO2e', 'tCO2e', 'Source']
        ];

        result.lines.forEach(line => {
            lines.push([
                'Scope ' + line.scope,
                line.name,
                line.quantity === null ? '' : line.quantity,
                line.unit,
                line.factor === null ? '' : line.factor,
                line.kg.toFixed(2),
                (line.kg / 1000).toFixed(4),
                line.source
            ]);
        });

        lines.push([]);

        ['1', '2', '3'].forEach(scope => {
            lines.push(['Scope ' + scope + ' total', '', '', '', '', result.totals[scope].toFixed(2), (result.totals[scope] / 1000).toFixed(4), '']);
        });

        lines.push(['Grand total', '', '', '', '', result.grand.toFixed(2), (result.grand / 1000).toFixed(4), '']);

        // A BOM keeps Excel from mangling the accented characters in the sources
        const csv = '\ufeff' + lines.map(row => row.map(csvCell).join(',')).join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = 'ghg-screening-' + (year || new Date().getFullYear()) + '.csv';

        document.body.append(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

    };

    /* ---------- wiring ---------- */

    form.addEventListener('submit', event => event.preventDefault());

    form.addEventListener('input', event => {

        if (event.target === customInput) {
            syncGrid();
            renderFactorTable();
        }

        render();
        save();

    });

    form.addEventListener('change', event => {

        if (event.target === gridSelect) syncGrid();
        if (event.target === refrigSelect) syncRefrigerant();

        if (event.target === gridSelect || event.target === refrigSelect) renderFactorTable();

        render();
        save();

    });

    const csvButton = document.getElementById('co2-csv');
    const printButton = document.getElementById('co2-print');
    const resetButton = document.getElementById('co2-reset');

    if (csvButton) csvButton.addEventListener('click', downloadCsv);

    if (printButton) {

        printButton.addEventListener('click', () => {

            // Anything collapsed would print as a heading with no content, so
            // open everything first and put it back the way the reader had it.
            const collapsed = Array.from(document.querySelectorAll('details:not([open])'));

            collapsed.forEach(panel => { panel.open = true; });

            const restoreDetails = () => {
                collapsed.forEach(panel => { panel.open = false; });
                window.removeEventListener('afterprint', restoreDetails);
            };

            window.addEventListener('afterprint', restoreDetails);

            window.print();

        });

    }

    if (resetButton) {

        resetButton.addEventListener('click', () => {

            const question = t('co2.confirmReset', 'Clear every figure you have entered?');

            if (!window.confirm(question)) return;

            form.querySelectorAll('input').forEach(field => {
                if (field.type === 'checkbox') field.checked = false;
                else field.value = '';
            });

            if (gridSelect) gridSelect.selectedIndex = 0;
            if (refrigSelect) refrigSelect.selectedIndex = 0;

            try { localStorage.removeItem(STORAGE_KEY); }
            catch (e) { /* nothing to clear */ }

            syncGrid();
            syncRefrigerant();
            renderFactorTable();
            render();

        });

    }

    // Number formatting and the generated labels are language-dependent
    new MutationObserver(() => {
        syncGrid();
        syncRefrigerant();
        renderFactorTable();
        render();
    }).observe(document.documentElement, { attributeFilter: ['lang'] });

    restore();
    syncGrid();
    syncRefrigerant();
    renderFactorTable();
    render();

})();
