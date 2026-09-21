/* Standalone behavior for the About me beta page. */
(function () {
    'use strict';

    const root = document.documentElement;
    const readPreference = key => {
        try { return localStorage.getItem(key); } catch (error) { return null; }
    };
    const savePreference = (key, value) => {
        try { localStorage.setItem(key, value); } catch (error) { /* Storage may be disabled. */ }
    };

    root.classList.add('beta-js');

    // English is captured from the markup so the original content stays authoritative.
    const french = {
        'skip': 'Aller au contenu',
        'nav.about': 'Mon parcours',
        'nav.experience': 'Mon expérience',
        'nav.projects': 'Mes projets',
        'nav.contact': 'Échangeons',
        'hero.eyebrow': 'La durabilité, concrètement.',
        'hero.line1': 'De bonnes intentions.',
        'hero.line2': 'Un impact',
        'hero.line3': 'mesurable.',
        'hero.intro': 'Moi, c’est Daksh. Je relie les ambitions de durabilité aux personnes, aux processus et aux données qui les concrétisent.',
        'hero.work': 'Découvrir mes projets',
        'hero.cv': 'Télécharger mon CV',
        'hero.location': 'Basé à Paris. Une vision internationale.',
        'hero.role': 'RSE · ESG · Durabilité',
        'hero.current': 'Actuellement chez Dataiku',
        'hero.footer': 'De la stratégie. Et surtout, du concret.',
        'hero.scroll': 'Faites défiler pour me découvrir',
        'logos.label': 'Une expérience acquise au sein de ces équipes',
        'about.label': 'La personne derrière les projets',
        'about.title1': 'Une vision d’ensemble.',
        'about.title2': 'Des actions concrètes.',
        'about.lede': 'La durabilité prend tout son sens pour moi lorsqu’elle sort des présentations et entre dans le quotidien de l’entreprise.',
        'about.body': 'Mon travail se situe entre stratégie et exécution : transformer les référentiels de reporting en données exploitables, les objectifs achats en meilleurs processus, et les engagements en preuves. De la logistique à la technologie, j’apporte curiosité, méthode et sens pratique à une même question : comment rendre les progrès concrets ?',
        'about.link': 'Pourquoi la durabilité compte',
        'stat.suffix': 'e',
        'stat.one': 'Centile EcoVadis',
        'stat.oneNote': 'Chez CEVA Logistics, en 2024',
        'stat.two': 'KPI d’achats responsables',
        'stat.twoNote': 'Suivis chaque semaine chez Thales',
        'stat.three': 'Demandes et rapports clients',
        'stat.threeNote': 'RFI, appels d’offres et CO₂ chez CEVA',
        'tools.label': 'Quelques outils de mon quotidien',
        'experience.label': 'Mon expérience',
        'experience.title1': 'Des secteurs variés.',
        'experience.title2': 'Un même fil conducteur.',
        'experience.intro': 'De meilleurs systèmes. Des décisions éclairées. Des progrès que l’on peut démontrer.',
        'job1.date': '2025 — Aujourd’hui',
        'job.current': 'En cours',
        'job1.role': 'Alternant Durabilité et Impact Social',
        'job1.body': 'Rapprocher durabilité et intelligence artificielle. Je coordonne le benchmarking ESG et l’engagement fournisseurs, consolide les données GES pour le rapport RSE 2026 et travaille avec les équipes internationales sur AI for Good, pour aider les associations à amplifier leur impact.',
        'job1.tag': 'Reporting GES',
        'job2.date': 'Mars — Août 2025',
        'job2.role': 'Consultant RSE — Stage',
        'job2.body': 'Cartographie et automatisation du processus RSE au sein des Achats, suivi hebdomadaire de plus de 15 KPI d’achats responsables et présentation des réussites du projet au Global Low Carbon Seminar.',
        'job2.tag1': 'Achats responsables',
        'job2.tag2': 'Automatisation des processus',
        'job3.date': 'Avr. — Oct. 2024',
        'job3.role': 'Chargé de la relation client RSE — Stage',
        'job3.body': 'Pilotage du projet d’amélioration de la notation CDP 2024 et contribution à un score EcoVadis au 97e centile, en hausse de 12 points sur un an. Gestion de plus de 20 RFI, appels d’offres et rapports CO₂ clients pour des marques telles que CMA CGM et Ferrari.',
        'job3.tag': 'Reporting clients',
        'job4.date': 'Juil. — Déc. 2022',
        'job4.role': 'Process Manager — Stage',
        'job4.body': 'Analyse de 17 KPI sous Excel et SQL pour alimenter les échanges hebdomadaires, revue de la performance de plus de 500 conseillers clientèle et appui à la gestion des projets d’une équipe de cinq personnes.',
        'job4.tag1': 'Analyse de données',
        'job4.tag2': 'Opérations',
        'education.label': 'Toujours apprendre',
        'education.one': 'MSc International Business Management, gestion de projet',
        'education.oneDate': '2025 — Aujourd’hui',
        'education.two': 'Master in Management · Durabilité',
        'education.award': '1re place · Concours de start-up verte',
        'projects.label': 'Projets sélectionnés',
        'projects.title1': 'Des idées',
        'projects.title2': 'mises en pratique.',
        'projects.all': 'Découvrir les 11 projets',
        'project1.type': 'Pitch de start-up · EN',
        'project1.body': 'Une seconde vie pour les objets. Un campus plus abordable. Une place de marché entre étudiants, fondée sur le réemploi, le reconditionnement et la circularité.',
        'project1.link': 'Lire le pitch deck',
        'project2.type': 'Analyse d’investissement · EN',
        'project2.title': 'Au-delà de l’étiquette verte.',
        'project2.body': 'Une analyse de l’ETF économie circulaire de BNP Paribas : sa composition, ses performances et les liens entre capital et durabilité.',
        'project2.link': 'Découvrir l’analyse',
        'beyond.label': 'En dehors des tableurs',
        'beyond.title1': 'Toujours curieux.',
        'beyond.title2': 'Même après le travail.',
        'beyond.body': 'Un échiquier, une bonne séance de sport, un endroit encore inconnu. Autant de façons de rester curieux et de voir les choses sous un autre angle.',
        'beyond.note': 'J’ai aussi organisé un tournoi d’échecs caritatif pour collecter des fonds au profit de l’Animal and Bird Welfare Society.',
        'beyond.link': 'Un peu plus sur moi',
        'beyond.chess': 'Le prochain coup.',
        'beyond.travel': 'Un nouveau regard.',
        'contact.label': 'Chaque échange commence quelque part.',
        'contact.title1': 'Avançons',
        'contact.title2': 'ensemble.',
        'contact.body': 'Programmes RSE, reporting ESG ou nouvelle idée à la croisée de la durabilité et des données : je serais ravi d’en discuter.',
        'contact.email': 'Écrivez-moi',
        'contact.linkedin': 'Échangeons sur LinkedIn',
        'footer.note': 'Un esprit pratique. Un avenir durable.',
        'footer.back': 'Retour au site principal'
    };
    const translatedElements = Array.from(document.querySelectorAll('[data-beta-i18n]'));
    const english = new Map(translatedElements.map(element => [element, element.textContent]));
    const languageButtons = Array.from(document.querySelectorAll('[data-beta-lang]'));
    const themeToggle = document.getElementById('beta-theme-toggle');
    const menuToggle = document.getElementById('beta-menu-toggle');
    const navigation = document.getElementById('beta-nav-links');
    const translatedAttributes = [
        ['.beta-header .beta-brand', 'aria-label', 'Daksh Mehta — retour en haut'],
        ['#beta-nav-links', 'aria-label', 'Navigation principale'],
        ['.beta-language', 'aria-label', 'Langue'],
        ['.beta-organisations', 'aria-label', 'Expérience professionnelle'],
        ['.beta-project-image-green', 'aria-label', 'Voir le pitch deck SustainSwap (PDF)'],
        ['.beta-project-image-sand', 'aria-label', 'Voir l’analyse de l’ETF vert (PDF)'],
        ['.beta-project-image-green img', 'alt', 'Couverture du pitch deck SustainSwap'],
        ['.beta-project-image-sand img', 'alt', 'Couverture de l’analyse de l’ETF vert BNP Paribas'],
        ['.beta-photo-pair figure:first-child img', 'alt', 'Daksh jouant aux échecs'],
        ['.beta-photo-pair figure:last-child img', 'alt', 'Un souvenir des voyages de Daksh']
    ].map(([selector, attribute, frenchText]) => {
        const element = document.querySelector(selector);
        return element ? { element, attribute, frenchText, englishText: element.getAttribute(attribute) } : null;
    }).filter(Boolean);
    let language = readPreference('lang') === 'fr' ? 'fr' : 'en';
    let menuOpen = false;

    const updateControlLabels = () => {
        const isFrench = language === 'fr';
        if (themeToggle) {
            const dark = root.dataset.theme === 'dark';
            const label = isFrench
                ? (dark ? 'Activer le thème clair' : 'Activer le thème sombre')
                : (dark ? 'Switch to light theme' : 'Switch to dark theme');
            themeToggle.setAttribute('aria-label', label);
            themeToggle.setAttribute('title', label);
            themeToggle.setAttribute('aria-pressed', String(dark));
        }
        if (menuToggle) {
            menuToggle.setAttribute('aria-label', isFrench
                ? (menuOpen ? 'Fermer le menu' : 'Ouvrir le menu')
                : (menuOpen ? 'Close menu' : 'Open menu'));
        }
    };

    const applyLanguage = next => {
        language = next === 'fr' ? 'fr' : 'en';
        translatedElements.forEach(element => {
            const translation = french[element.dataset.betaI18n];
            element.textContent = language === 'fr' && translation !== undefined
                ? translation : english.get(element);
        });
        translatedAttributes.forEach(item => {
            item.element.setAttribute(item.attribute, language === 'fr' ? item.frenchText : item.englishText);
        });
        root.lang = language;
        languageButtons.forEach(button => {
            const active = button.dataset.betaLang === language;
            button.classList.toggle('is-active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        updateControlLabels();
    };

    const applyTheme = next => {
        root.dataset.theme = next === 'dark' ? 'dark' : 'light';
        const themeMeta = document.querySelector('meta[name="theme-color"]');
        if (themeMeta) {
            const color = window.getComputedStyle(root).getPropertyValue('--paper').trim();
            if (color) themeMeta.setAttribute('content', color);
        }
        updateControlLabels();
    };

    // A new visitor sees the light art direction; returning visitors keep their choice.
    applyTheme(readPreference('theme') === 'dark' ? 'dark' : 'light');
    applyLanguage(language);

    languageButtons.forEach(button => button.addEventListener('click', () => {
        applyLanguage(button.dataset.betaLang);
        savePreference('lang', language);
        scheduleScrollUpdate();
    }));

    if (themeToggle) themeToggle.addEventListener('click', () => {
        applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
        savePreference('theme', root.dataset.theme);
    });

    // Native anchor navigation remains intact, including keyboard and history behavior.
    if (menuToggle && navigation) {
        try {
            const setMenuOpen = open => {
                menuOpen = open;
                navigation.classList.toggle('is-open', open);
                menuToggle.classList.toggle('is-open', open);
                menuToggle.setAttribute('aria-expanded', String(open));
                updateControlLabels();
            };

            menuToggle.setAttribute('aria-controls', navigation.id);
            setMenuOpen(false);
            menuToggle.addEventListener('click', () => setMenuOpen(!menuOpen));
            navigation.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => setMenuOpen(false));
            });
            document.addEventListener('click', event => {
                if (menuOpen && !navigation.contains(event.target) && !menuToggle.contains(event.target)) {
                    setMenuOpen(false);
                }
            });
            document.addEventListener('keydown', event => {
                if (event.key === 'Escape' && menuOpen) {
                    setMenuOpen(false);
                    menuToggle.focus();
                }
            });
            window.addEventListener('resize', () => {
                if (menuOpen && window.getComputedStyle(menuToggle).display === 'none') setMenuOpen(false);
            }, { passive: true });
            root.classList.add('beta-menu-ready');
        } catch (error) {
            root.classList.remove('beta-menu-ready');
            navigation.classList.remove('is-open');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    }

    // Reveal styling is enabled only after the observer has been created successfully.
    const revealElements = Array.from(document.querySelectorAll('.beta-reveal'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let revealObserver;
    const revealAll = () => {
        root.classList.remove('beta-reveal-ready');
        revealElements.forEach(element => element.classList.add('is-visible'));
        if (revealObserver) revealObserver.disconnect();
    };

    if (reducedMotion.matches || !('IntersectionObserver' in window)) {
        revealAll();
    } else {
        try {
            revealObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                });
            }, { rootMargin: '0px 0px -24px 0px', threshold: 0.08 });
            revealElements.forEach(element => {
                const rectangle = element.getBoundingClientRect();
                if (rectangle.top < window.innerHeight && rectangle.bottom > 0) {
                    element.classList.add('is-visible');
                } else {
                    revealObserver.observe(element);
                }
            });
            root.classList.add('beta-reveal-ready');
        } catch (error) {
            revealAll();
        }
    }
    const onMotionChange = event => { if (event.matches) revealAll(); };
    if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', onMotionChange);
    else if (reducedMotion.addListener) reducedMotion.addListener(onMotionChange);

    // Mark the current section without changing focus or rewriting the URL.
    const sectionLinks = navigation ? Array.from(navigation.querySelectorAll('a[href^="#"]')) : [];
    const sections = sectionLinks.map(link => ({
        link,
        section: document.getElementById(link.getAttribute('href').slice(1))
    })).filter(item => item.section);
    let scrollScheduled = false;

    const updateScrollState = () => {
        scrollScheduled = false;
        let current;
        sections.forEach(item => {
            if (item.section.getBoundingClientRect().top <= 180) current = item;
        });
        sections.forEach(item => {
            const active = item === current;
            item.link.classList.toggle('is-active', active);
            if (active) item.link.setAttribute('aria-current', 'location');
            else item.link.removeAttribute('aria-current');
        });
        const scrollableHeight = root.scrollHeight - window.innerHeight;
        const progress = scrollableHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollableHeight)) : 0;
        root.style.setProperty('--beta-scroll-progress', String(progress));
    };
    const scheduleScrollUpdate = () => {
        if (scrollScheduled) return;
        scrollScheduled = true;
        window.requestAnimationFrame(updateScrollState);
    };
    window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
    window.addEventListener('resize', scheduleScrollUpdate, { passive: true });
    window.addEventListener('load', scheduleScrollUpdate, { once: true });
    updateScrollState();
})();
