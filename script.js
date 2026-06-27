/* ======================================
   Smooth Scrolling
====================================== */

document.querySelectorAll('nav a, .button').forEach(link => {

    link.addEventListener('click', e => {

        const href = link.getAttribute('href');

        if (!href || !href.startsWith('#')) return;

        const target = document.querySelector(href);

        if (!target) return;

        e.preventDefault();

        target.scrollIntoView({

            behavior: 'smooth'

        });

    });

});


/* ======================================
   Fade In Sections
====================================== */

const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add('show');

            }

        });

    }, {
        threshold: .15
    })
    : null;

document.querySelectorAll('section:not(.hero)').forEach(section => {

    section.classList.add('hidden');

    if (revealObserver) {

        revealObserver.observe(section);

    } else {

        section.classList.add('show');

    }

});


/* ======================================
   Floating Navbar
====================================== */

const nav = document.querySelector('nav');

if (nav) {

    window.addEventListener('scroll', () => {

        if (window.scrollY > 60) {

            nav.style.background = 'rgba(16,35,29,.92)';

            nav.style.boxShadow = '0 18px 45px rgba(0,0,0,.30)';

        } else {

            nav.style.background = 'rgba(255,255,255,.08)';

            nav.style.boxShadow = 'none';

        }

    });

}


/* ======================================
   Hero Parallax
====================================== */

const hero = document.querySelector('.hero');

if (hero) {

    window.addEventListener('scroll', () => {

        hero.style.backgroundPositionY = window.scrollY * .35 + 'px';

    });

}


/* ======================================
   Professional Journey Carousel
====================================== */

const journeyCarousel = document.querySelector('[data-journey-carousel]');

if (journeyCarousel) {

    const track = journeyCarousel.querySelector('.journey-track');
    const pages = Array.from(journeyCarousel.querySelectorAll('.journey-page'));
    const previousButton = journeyCarousel.querySelector('.journey-arrow--prev');
    const nextButton = journeyCarousel.querySelector('.journey-arrow--next');
    const dots = Array.from(document.querySelectorAll('.journey-dot'));
    const viewport = journeyCarousel.querySelector('.journey-viewport');
    let currentPage = 0;
    let pointerStartX = 0;

    journeyCarousel.setAttribute('tabindex', '0');

    const showPage = index => {

        if (!track || pages.length === 0) return;

        currentPage = (index + pages.length) % pages.length;

        track.style.transform = `translate3d(-${currentPage * 100}%,0,0)`;

        pages.forEach((page, pageIndex) => {

            const isActive = pageIndex === currentPage;

            page.classList.toggle('active', isActive);

            page.setAttribute('aria-hidden', String(!isActive));

        });

        dots.forEach((dot, dotIndex) => {

            const isActive = dotIndex === currentPage;

            dot.classList.toggle('active', isActive);

            dot.setAttribute('aria-selected', String(isActive));

        });

    };

    previousButton?.addEventListener('click', () => {

        showPage(currentPage - 1);

    });

    nextButton?.addEventListener('click', () => {

        showPage(currentPage + 1);

    });

    dots.forEach((dot, dotIndex) => {

        dot.addEventListener('click', () => {

            showPage(dotIndex);

        });

    });

    journeyCarousel.addEventListener('keydown', event => {

        if (event.key === 'ArrowLeft') {

            event.preventDefault();

            showPage(currentPage - 1);

        }

        if (event.key === 'ArrowRight') {

            event.preventDefault();

            showPage(currentPage + 1);

        }

    });

    viewport?.addEventListener('pointerdown', event => {

        pointerStartX = event.clientX;

    });

    viewport?.addEventListener('pointerup', event => {

        const distance = event.clientX - pointerStartX;

        if (Math.abs(distance) < 45) return;

        showPage(currentPage + (distance < 0 ? 1 : -1));

    });

    showPage(0);

}


/* ======================================
   Cursor Glow
====================================== */

const glow = document.createElement('div');

glow.className = 'cursor-glow';

glow.style.opacity = '0';

document.body.appendChild(glow);

let mouseX = window.innerWidth / 2;

let mouseY = window.innerHeight / 2;

let glowX = mouseX;

let glowY = mouseY;

let isVisible = false;

window.addEventListener('mousemove', e => {

    if (!isVisible) {

        isVisible = true;

        glow.style.opacity = '1';

        glowX = e.clientX;

        glowY = e.clientY;

    }

    mouseX = e.clientX;

    mouseY = e.clientY;

});

function animateGlow() {

    glowX += (mouseX - glowX) * 0.12;

    glowY += (mouseY - glowY) * 0.12;

    glow.style.transform = `translate3d(${glowX - 160}px, ${glowY - 160}px, 0)`;

    requestAnimationFrame(animateGlow);

}

animateGlow();


/* ======================================
   Active Navbar Link
====================================== */

const sections = document.querySelectorAll('section[id]');

const navLinks = document.querySelectorAll('nav a');

window.addEventListener('scroll', () => {

    let current = '';

    sections.forEach(section => {

        const top = section.offsetTop - 150;

        if (window.scrollY >= top) {

            current = section.getAttribute('id');

        }

    });

    navLinks.forEach(link => {

        link.classList.remove('active');

        if (link.getAttribute('href') === '#' + current) {

            link.classList.add('active');

        }

    });

});


/* ======================================
   Interactive France Map
====================================== */

const mapSection = document.getElementById('france-map');

if (mapSection) {

    const regionsData = {
        paris: {
            title: 'Île-de-France',
            dept: 'Department 75 (Paris)',
            desc: 'Spearheading Sustainability & Social Impact at Dataiku and mastering business innovation at INSEEC École de Commerce.',
            logos: [
                { src: 'assets/logos/Dataiku.svg', name: 'Dataiku' },
                { src: 'assets/logos/Inseec.svg', name: 'INSEEC' }
            ]
        },
        bordeaux: {
            title: 'Nouvelle-Aquitaine',
            dept: 'Department 33 (Bordeaux)',
            desc: 'Driving operations at Back Market, managing project execution at Pollen Robotics, and foundational studies at KEDGE Business School.',
            logos: [
                { src: 'assets/logos/Back_market.svg', name: 'Back Market' },
                { src: 'assets/logos/Pollenrobotics.svg', name: 'Pollen Robotics' },
                { src: 'assets/logos/KBS.png', name: 'KEDGE BS' }
            ]
        },
        marseille: {
            title: "Provence-Alpes-Côte d'Azur",
            dept: 'Department 13 (Marseille / Gémenos)',
            desc: 'Managing ESG initiatives at CEVA Logistics, pioneering AI & Data innovation at Thales, and completing Master in Management at KEDGE Business School.',
            logos: [
                { src: 'assets/logos/CEVA.svg', name: 'CEVA Logistics' },
                { src: 'assets/logos/Thales_Logo.svg.svg', name: 'Thales' },
                { src: 'assets/logos/KBS.png', name: 'KEDGE BS' }
            ]
        }
    };

    const interactiveGroups = mapSection.querySelectorAll('.interactive-group');
    const defaultPanel = document.getElementById('map-default');
    const contentPanel = document.getElementById('map-content');
    const titleEl = document.getElementById('region-title');
    const deptEl = document.getElementById('region-dept');
    const descEl = document.getElementById('region-desc');
    const logosEl = document.getElementById('region-logos');

    const selectRegion = (regionKey) => {
        const data = regionsData[regionKey];
        if (!data) return;

        interactiveGroups.forEach(g => {
            if (g.getAttribute('data-region') === regionKey) {
                g.classList.add('selected');
            } else {
                g.classList.remove('selected');
            }
        });

        if (defaultPanel) defaultPanel.classList.add('hidden');
        if (contentPanel) {
            contentPanel.classList.remove('hidden');
            contentPanel.style.animation = 'none';
            contentPanel.offsetHeight;
            contentPanel.style.animation = null;
        }

        if (titleEl) titleEl.textContent = data.title;
        if (deptEl) deptEl.textContent = data.dept;
        if (descEl) descEl.textContent = data.desc;

        if (logosEl) {
            logosEl.innerHTML = data.logos.map(l => `
                <div class="region-logo-card">
                    <img src="${l.src}" alt="${l.name}" loading="lazy">
                    <span>${l.name}</span>
                </div>
            `).join('');
        }
    };

    interactiveGroups.forEach(group => {
        const regionKey = group.getAttribute('data-region');

        group.addEventListener('mouseenter', () => {
            selectRegion(regionKey);
        });

        group.addEventListener('click', (e) => {
            e.stopPropagation();
            selectRegion(regionKey);
        });

        group.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectRegion(regionKey);
            }
        });
    });

}

