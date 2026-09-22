/* Homepage experience carousel and small portrait interaction. */
(function () {
  'use strict';

  const init = () => {
    const root = document.documentElement;
    const buttons = [...document.querySelectorAll('.studio-experience-switch')];
    const story = document.getElementById('studio-story');
    const frenchMeta = {
      dataiku: { date: '2025 — Aujourd’hui', location: 'Paris, France' },
      thales: { date: 'Mars — Août 2025', location: 'Gémenos, France' },
      ceva: { date: 'Avr. — Oct. 2024', location: 'Marseille, France' }
    };
    const english = {
      dataiku: {
        role: 'Sustainability & Social Impact Apprentice',
        body: 'Supporting ESG reporting, supplier engagement and AI for Good.'
      },
      thales: {
        role: 'CSR Consultant Intern',
        body: 'Helping the Purchasing team organise and automate responsible procurement.'
      },
      ceva: {
        role: 'CSR Customer Desk Intern',
        body: 'Contributing to CDP, EcoVadis and customer sustainability reporting.'
      }
    };

    if (buttons.length && story) {
      const date = story.querySelector('.studio-story-date');
      const location = story.querySelector('.studio-story-location');
      const logo = story.querySelector('.studio-story-logo img');
      const company = story.querySelector('.studio-story-company');
      const role = story.querySelector('.studio-story-role');
      const body = story.querySelector('.studio-story-body');
      let active = Math.max(0, buttons.findIndex(button => button.classList.contains('is-active')));
      const isFrench = () => root.lang.toLowerCase().startsWith('fr');
      const render = (next, focus) => {
        active = (next + buttons.length) % buttons.length;
        const button = buttons[active];
        const id = button.dataset.studioExperience;
        const fr = window.EDITORIAL_FR || {};
        const copy = english[id] || {};
        const meta = frenchMeta[id] || {};
        buttons.forEach((item, index) => {
          const selected = index === active;
          item.classList.toggle('is-active', selected);
          item.classList.toggle('is-left', !selected && index === (active + buttons.length - 1) % buttons.length);
          item.classList.toggle('is-right', !selected && index === (active + 1) % buttons.length);
          item.setAttribute('aria-selected', String(selected));
          item.tabIndex = 0;
        });
        const french = isFrench();
        const roleText = french ? (fr[button.dataset.roleKey] || copy.role) : copy.role;
        const bodyText = french ? (fr[button.dataset.bodyKey] || copy.body) : copy.body;
        if (date) date.textContent = french ? meta.date : button.dataset.date;
        if (location) location.textContent = french ? meta.location : button.dataset.location;
        if (logo) {
          logo.src = button.dataset.logo;
          logo.alt = button.dataset.alt || `${button.dataset.company} logo`;
        }
        if (company) company.textContent = button.dataset.company;
        if (role) role.textContent = roleText;
        if (body) body.textContent = bodyText;
        story.dataset.studioExperience = id;
        if (focus) (getComputedStyle(button).display === 'none' ? story : button).focus();
      };
      buttons.forEach((button, index) => {
        button.addEventListener('click', () => render(index, true));
        button.addEventListener('keydown', event => {
          let next;
          if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = active + 1;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = active - 1;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = buttons.length - 1;
          if (next === undefined) return;
          event.preventDefault();
          render(next, true);
        });
      });
      story.addEventListener('keydown', event => {
        const next = { ArrowRight: active + 1, ArrowDown: active + 1, ArrowLeft: active - 1, ArrowUp: active - 1, Home: 0, End: buttons.length - 1 }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        render(next, true);
      });
      render(active, false);
      new MutationObserver(() => render(active, false)).observe(root, { attributeFilter: ['lang'] });
    }

    /* The hero is a dark navy band, so the sticky header has to sit on it as
       glass rather than as a light slab. CSS does the rest off .studio-top-dark. */
    const hero = document.querySelector('.studio-hero');
    if (hero && 'IntersectionObserver' in window) {
      const header = document.querySelector('.beta-header');
      const headerHeight = () => Math.round(header ? header.getBoundingClientRect().height : 87);
      let margin = headerHeight();
      const watchHero = () => {
        const observer = new IntersectionObserver(entries => {
          root.classList.toggle('studio-top-dark', entries[entries.length - 1].isIntersecting);
        }, { rootMargin: `-${margin}px 0px 0px 0px`, threshold: 0 });
        observer.observe(hero);
        return observer;
      };
      let heroObserver = watchHero();
      /* rootMargin is fixed at construction, so the observer has to be rebuilt
         when the header changes height - but only then, not on every resize
         event, which would tear down and re-create it dozens of times a drag. */
      let resizeTimer = null;
      addEventListener('resize', () => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          resizeTimer = null;
          const next = headerHeight();
          if (next === margin) return;
          margin = next;
          heroObserver.disconnect();
          heroObserver = watchHero();
        }, 200);
      }, { passive: true });
    }

    document.querySelectorAll('.studio-portrait-cutout[data-fallback-src]').forEach(image => {
      image.addEventListener('error', () => {
        if (image.dataset.fallbackApplied) return;
        image.dataset.fallbackApplied = 'true';
        image.src = image.dataset.fallbackSrc;
      });
    });

    const reduce = matchMedia('(prefers-reduced-motion: reduce)');
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    document.querySelectorAll('.studio-portrait-scene[data-studio-tilt]').forEach(scene => {
      const reset = () => {
        scene.style.setProperty('--studio-tilt-x', '0deg');
        scene.style.setProperty('--studio-tilt-y', '0deg');
      };
      scene.addEventListener('pointermove', event => {
        if (reduce.matches || !fine.matches) return;
        const box = scene.getBoundingClientRect();
        scene.style.setProperty('--studio-tilt-x', `${((event.clientY - box.top) / box.height - .5) * -5}deg`);
        scene.style.setProperty('--studio-tilt-y', `${((event.clientX - box.left) / box.width - .5) * 5}deg`);
      });
      scene.addEventListener('pointerleave', reset);
      scene.addEventListener('pointercancel', reset);
      reduce.addEventListener('change', reset);
      fine.addEventListener('change', reset);
      reset();
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
