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

    // Factors span several orders of magnitude, so pick the
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

    const labelOf = input => {
        const label = input.closest('.co2-row, .co2-check');
        const span = label && label.querySelector('.co2-row-label > span');
        return span ? span.textContent.trim() : input.id;
    };

    /* ---------- the two rows whose factor comes from a <select> ---------- */

    const syncGrid = () => {

        if (!gridSelect || !elecInput) return;

        if (!gridSelect.value) gridSelect.value = 'custom';
        const custom = gridSelect.value === 'custom';
        const sourceRow = document.getElementById('s2-source-row');
        if (sourceRow) sourceRow.hidden = !custom;
        const option = gridSelect.options[gridSelect.selectedIndex];
        const name = option ? (option.dataset.label || option.textContent.trim()) : '';

        if (customRow) customRow.hidden = !custom;

        if (custom) {
            const own = customInput ? parseFloat(customInput.value) : NaN;
            const citation = (document.getElementById('s2-custom-source')?.value || '').trim();
            elecInput.dataset.factor = Number.isFinite(own) && own >= 0 && citation ? String(own) : '';
            elecInput.dataset.source = citation || 'Published grid factor required';
            delete elecInput.dataset.sourceUrl;
        } else {
            elecInput.dataset.factor = gridSelect.value;
            elecInput.dataset.source = option.dataset.source || name;
            elecInput.dataset.sourceUrl = 'https://www.gov.uk/government/publications/greenhouse-gas-reporting-conversion-factors-2026';
        }

    };

    const syncRefrigerant = () => {

        if (!refrigSelect || !refrigInput) return;
        if (!refrigSelect.value) refrigSelect.selectedIndex = 0;

        const option = refrigSelect.options[refrigSelect.selectedIndex];
        const name = option ? (option.dataset.label || option.textContent.trim()) : '';

        refrigInput.dataset.factor = refrigSelect.value;
        refrigInput.dataset.source = option.dataset.source || ('DESNZ 2026 — ' + name);

    };

    /* ---------- the calculation ---------- */

    const syncCustomFactors = () => {
        form.querySelectorAll('[data-factor-edit]').forEach(field => {
            const input = document.getElementById(field.dataset.factorEdit);
            const source = document.getElementById(field.dataset.factorEdit + '-source');
            const factor = parseFloat(field.value);
            input.dataset.factor = Number.isFinite(factor) && factor >= 0 && source.value.trim() ? String(factor) : '';
            input.dataset.source = source.value.trim() || 'Published spend factor required';
        });
    };

    const compute = () => {
        syncGrid();
        syncCustomFactors();
        const activities = rows.map(input => ({
            id: input.id, scope: input.dataset.scope, name: labelOf(input),
            quantity: amount(input), factor: parseFloat(input.dataset.factor),
            unit: input.dataset.unit || '', source: input.dataset.source || '',
            wtt: parseFloat(input.dataset.wtt), wttSource: input.dataset.wttSource || ''
        }));
        const result = window.CarbonCore.computeInventory(activities, !!wttCheck?.checked);
        const isFrench = document.documentElement.lang === 'fr';
        rows.forEach(input => {
            const output = form.querySelector('output[for="' + input.id + '"]');
            const invalid = result.missing.includes(input.id);
            if (output) {
                output.textContent = invalid ? (isFrench ? 'Facteur requis' : 'Factor needed') : mass(amount(input) * (parseFloat(input.dataset.factor) || 0));
                output.dataset.active = amount(input) > 0 ? '1' : '0';
            }
            input.setAttribute('aria-invalid', String(invalid));
        });
        if (wttOut) wttOut.textContent = mass(result.upstreamKg);
        const quality = document.getElementById('co2-quality');
        if (quality) {
            quality.textContent = result.missing.length
                ? (isFrench ? 'Sous-total incomplet : ajoutez les facteurs et leurs sources.' : 'Incomplete subtotal: add the missing factors and their sources.')
                : (isFrench ? 'Activités renseignées uniquement · estimation partielle' : 'Entered activities only · partial estimate');
            quality.classList.toggle('is-incomplete', !!result.missing.length);
        }
        ['co2-csv', 'co2-print'].forEach(id => {
            const button = document.getElementById(id);
            if (button) button.disabled = !!result.missing.length;
        });
        return result;
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
                Number.isFinite(parseFloat(input.dataset.factor)) ? factorText(parseFloat(input.dataset.factor)) : '—',
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

        rows.filter(input => input.dataset.wtt).forEach(input => {
            const tr = document.createElement('tr');
            ['3', labelOf(input) + ' · upstream', input.dataset.wtt, 'kgCO₂e / ' + input.dataset.unit, input.dataset.wttSource].forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.append(td);
            });
            factorBody.append(tr);
        });
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

        // Earlier saved selections stored AR4 values; retain the gas identity.
        const previousRefrigerants = { '2088': '1924', '1430': '1300', '675': '677', '1774': '1624', '3922': '3943' };
        if (previousRefrigerants[state['s1-refrig-type']]) state['s1-refrig-type'] = previousRefrigerants[state['s1-refrig-type']];

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
        if (result.missing.length) return;

        const name = (document.getElementById('org-name') || {}).value || '';
        const year = (document.getElementById('org-year') || {}).value || '';

        const lines = [
            ['Screening GHG inventory (beta) — dakshmehtaaa.github.io/personal-website-/co2-tracker.html'],
            ['Organisation', name],
            ['Reporting year', year],
            ['Generated', new Date().toISOString().slice(0, 10)],
            ['Basis', 'GHG Protocol scope structure; partial coverage; location-based Scope 2 only; not certified or assured.'],
            ['Factors', 'DESNZ 2026 v1.2; UK proxies except France hotel; cited custom grid and spend factors.'],
            ['Coverage', 'Entered activities only. Blank activities are excluded, not confirmed zero. Flights exclude non-CO2 radiative forcing.'],
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

        if (event.target === customInput || event.target.id === 's2-custom-source' || event.target.matches('[data-factor-edit]') || event.target.id.endsWith('-source')) {
            syncCustomFactors();
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
            syncCustomFactors();
            renderFactorTable();
            render();

        });

    }

    // Number formatting and the generated labels are language-dependent
    new MutationObserver(() => {
        syncGrid();
        syncRefrigerant();
        syncCustomFactors();
        renderFactorTable();
        render();
    }).observe(document.documentElement, { attributeFilter: ['lang'] });

    restore();
    syncGrid();
    syncRefrigerant();
    syncCustomFactors();
    renderFactorTable();
    render();

})();
