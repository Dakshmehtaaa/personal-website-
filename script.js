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
   Anthropic-Style Typewriter & Reveal
====================================== */
window.addEventListener('DOMContentLoaded', () => {
    const h1 = document.querySelector('.hero-content h1');
    const h2 = document.querySelector('.hero-content h2');
    const p = document.querySelector('.hero-content p');
    const revealElements = [
        document.querySelector('.hero-actions'),
        document.querySelector('nav'),
        document.querySelector('#companies'),
        document.querySelector('#contact')
    ].filter(Boolean);

    if (!h1 || !h2 || !p) return;

    const textH1 = h1.textContent.trim();
    const textH2 = h2.textContent.trim();
    const textP = p.textContent.trim().replace(/\s+/g, ' ');

    revealElements.forEach(el => el.classList.add('reveal-fade'));

    h1.textContent = '';
    h2.textContent = '';
    p.textContent = '';

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
                if (callback) setTimeout(callback, 200);
            }
        }, speed);
    };

    setTimeout(() => {
        typeText(h1, textH1, 45, () => {
            typeText(h2, textH2, 25, () => {
                typeText(p, textP, 12, () => {
                    setTimeout(() => {
                        if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
                        revealElements.forEach(el => el.classList.add('revealed'));
                    }, 400);
                });
            });
        });
    }, 300);
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


