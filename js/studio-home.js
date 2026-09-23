/* Homepage experience carousel and small portrait interaction. */
(function () {
  'use strict';

  const init = () => {
    const root = document.documentElement;
    /* ---- Experience deck ---------------------------------------------------
       All three roles live in the markup; which slot each card occupies is just
       a class. On a switch we measure every card before and after the class
       change and play the difference back as a transform (FLIP), so the card
       that was clicked visibly travels from the side into the centre rather
       than the middle panel silently swapping its contents. */
    const deck = document.querySelector('.studio-experience-deck');
    if (deck) {
      const cards = [...deck.querySelectorAll('.studio-xp-card')];
      const faces = cards.map(card => card.querySelector('.studio-xp-face'));
      const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
      const EASE = 'cubic-bezier(.22,1,.36,1)';
      const DURATION = 620;
      let active = Math.max(0, cards.findIndex(card => card.classList.contains('is-active')));

      const assign = next => {
        active = (next + cards.length) % cards.length;
        cards.forEach((card, index) => {
          const offset = (index - active + cards.length) % cards.length;
          card.classList.toggle('is-active', offset === 0);
          card.classList.toggle('is-right', offset === 1);
          card.classList.toggle('is-left', offset === cards.length - 1);
          const face = faces[index];
          if (face) {
            face.setAttribute('aria-expanded', String(offset === 0));
            face.tabIndex = offset === 0 ? -1 : 0;
          }
        });
      };

      const box = card => card.getBoundingClientRect();

      const show = (next, focus) => {
        if (next === active) return;
        const animate = !reduceMotion.matches && typeof deck.animate === 'function';
        const before = animate ? cards.map(box) : null;
        const previous = active;
        assign(next);
        if (animate) {
          cards.forEach((card, index) => {
            const from = before[index];
            const to = box(card);
            const dx = from.left - to.left;
            const dy = from.top - to.top;
            const sx = to.width ? from.width / to.width : 1;
            const sy = to.height ? from.height / to.height : 1;
            if (Math.abs(dx) < 1 && Math.abs(dy) < 1 && Math.abs(sx - 1) < 0.01 && Math.abs(sy - 1) < 0.01) return;
            card.classList.add('is-moving');
            const move = card.animate(
              [{ transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transform: 'none' }],
              { duration: DURATION, easing: EASE }
            );
            move.finished.catch(() => {}).then(() => card.classList.remove('is-moving'));
          });
          /* The card is scaled while it travels, which would stretch its text.
             Holding the detail back until the move is mostly done hides that,
             and reads as the card opening once it has arrived. */
          const detail = cards[active].querySelector('.studio-xp-detail');
          if (detail) detail.animate([{ opacity: 0 }, { opacity: 0, offset: 0.3 }, { opacity: 1 }], { duration: DURATION, easing: 'ease-out' });
          const leaving = cards[previous] && cards[previous].querySelector('.studio-xp-face');
          if (leaving) leaving.animate([{ opacity: 0 }, { opacity: 0, offset: 0.35 }, { opacity: 1 }], { duration: DURATION, easing: 'ease-out' });
        }
        if (focus) {
          const target = faces[previous];
          if (target && getComputedStyle(target).display !== 'none') target.focus();
          else cards[active].querySelector('.studio-xp-role')?.focus?.();
        }
      };

      faces.forEach((face, index) => {
        if (!face) return;
        face.addEventListener('click', () => show(index, false));
        face.addEventListener('keydown', event => {
          const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
          if (step === undefined) return;
          event.preventDefault();
          const order = cards.map((_, i) => i).filter(i => i !== active);
          const at = order.indexOf(index);
          const target = order[(at + step + order.length) % order.length];
          faces[target]?.focus();
        });
      });

      assign(active);
    }

    /* The hero is a dark navy band, so the sticky header has to sit on it as
       glass rather than as a light slab. CSS does the rest off .studio-top-dark. */
    const hero = document.querySelector('.studio-hero');
    if (hero && 'IntersectionObserver' in window) {
      const header = document.querySelector('.beta-header');
      const headerHeight = () => Math.round(header ? header.getBoundingClientRect().height : 87);
      let margin = headerHeight();
      root.style.setProperty('--studio-header-h', `${margin}px`);
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
          root.style.setProperty('--studio-header-h', `${margin}px`);
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
