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
   Floating Navbar (Optimized with rAF)
====================================== */
const nav = document.querySelector('nav');
if (nav) {
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 60) {
                    if (!nav.classList.contains('scrolled')) nav.classList.add('scrolled');
                } else {
                    if (nav.classList.contains('scrolled')) nav.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
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
    if (window.matchMedia('(pointer: coarse)').matches) return;
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    glow.style.transform = `translate3d(${glowX - 160}px, ${glowY - 160}px, 0)`;
    requestAnimationFrame(animateGlow);
}

animateGlow();


/* ======================================
   Typewriter Name & Quick Reveal Sequence
====================================== */
window.addEventListener('DOMContentLoaded', () => {
    const navEl = document.querySelector('nav');
    const h1 = document.querySelector('.hero-content h1');
    const h2 = document.querySelector('.hero-content h2');
    const p = document.querySelector('.hero-content p');
    const heroActions = document.querySelector('.hero-actions');
    const restOfSite = [
        document.querySelector('#companies'),
        document.querySelector('#contact')
    ].filter(Boolean);

    if (!h1 || !h2 || !p) return;

    // Save original text
    const textH1 = h1.textContent.trim();

    // Hide elements initially
    if (navEl) { navEl.classList.add('reveal-fade'); }
    [h2, p, heroActions, ...restOfSite].filter(Boolean).forEach(el => {
        el.classList.add('reveal-fade');
    });

    // Clear only the name for typewriter
    h1.textContent = '';

    const cursor = document.createElement('span');
    cursor.className = 'typewrite-cursor';

    const typeText = (element, text, speed, callback) => {
        element.appendChild(cursor);
        let i = 0;
        const interval = setInterval(() => {
            if (i < text.length) {
                cursor.insertAdjacentText('beforebegin', text.charAt(i));
                i++;
            } else {
                clearInterval(interval);
                if (callback) setTimeout(callback, 150);
            }
        }, speed);
    };

    // STEP 1: Navbar appears first
    setTimeout(() => {
        if (navEl) navEl.classList.add('revealed');

        // STEP 2: After navbar, typewrite the name
        setTimeout(() => {
            typeText(h1, textH1, 55, () => {
                // STEP 3: Remove cursor and reveal everything else quickly
                if (cursor.parentNode) cursor.parentNode.removeChild(cursor);

                // Stagger the reveals for a snappy cascade
                const allReveal = [h2, p, heroActions, ...restOfSite].filter(Boolean);
                allReveal.forEach((el, i) => {
                    setTimeout(() => el.classList.add('revealed'), i * 120);
                });
            });
        }, 400);
    }, 200);
});


/* ======================================
   CV Download Modal & Email Automation
====================================== */
const openCvBtn = document.getElementById('open-cv-modal');
const closeCvBtn = document.getElementById('close-cv-modal');
const cvModal = document.getElementById('cv-modal');
const cvForm = document.getElementById('cv-download-form');
const cvSuccessMsg = document.getElementById('cv-success-msg');

if (openCvBtn && cvModal) {
    openCvBtn.addEventListener('click', () => {
        cvModal.classList.remove('hidden');
        if (cvForm) cvForm.classList.remove('hidden');
        if (cvSuccessMsg) cvSuccessMsg.classList.add('hidden');
    });
}

if (closeCvBtn && cvModal) {
    closeCvBtn.addEventListener('click', () => {
        cvModal.classList.add('hidden');
    });
}

if (cvModal) {
    cvModal.addEventListener('click', (e) => {
        if (e.target === cvModal) {
            cvModal.classList.add('hidden');
        }
    });
}

if (cvForm) {
    cvForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const firstName = document.getElementById('first-name').value;
        const lastName = document.getElementById('last-name').value;
        const email = document.getElementById('work-email').value;

        // 1. Trigger Instant CV PDF Download in Browser
        const link = document.createElement('a');
        link.href = 'assets/CV_Daksh_2026.pdf';
        link.download = 'CV_Daksh_Mehta.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 2. Email Automation Hook
        // To enable automated email notifications sending your CV:
        // Get a free API key from Web3Forms.com or Formspree and uncomment:
        /*
        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                access_key: 'YOUR_WEB3FORMS_ACCESS_KEY_HERE',
                subject: `New CV Download Request from ${firstName} ${lastName}`,
                from_name: 'Daksh Mehta CV Portal',
                email: email,
                message: `${firstName} ${lastName} (${email}) requested and downloaded your CV.`
            })
        }).catch(err => console.log('Email automation error:', err));
        */

        cvForm.classList.add('hidden');
        if (cvSuccessMsg) cvSuccessMsg.classList.remove('hidden');

        cvForm.reset();

        setTimeout(() => {
            if (cvModal) cvModal.classList.add('hidden');
        }, 5000);
    });
}


