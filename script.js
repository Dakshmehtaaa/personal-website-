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
