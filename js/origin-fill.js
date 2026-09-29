/* Origin fill: on hover a circle grows from the exact point the pointer entered
   a button and shrinks back toward the point it left. Keyboard focus fills from
   the centre. Only (hover:hover) pointers get the fill, so taps never leave it
   stuck on; the press scale is pure CSS and works everywhere. Colours live in
   css/origin-fill.css (--of-fill / --of-fg per button family). */
(function () {
  'use strict';

  const SELECTOR = [
    '.beta-button', '.studio-more-cta', '.studio-gallery-button', '.project-link',
    '.sys-cta', '.sys-filter button', '.xv-cta', '.xv-poster-play',
    'a.button', 'button.button'
  ].join(',');

  const init = () => {
    const canHover = matchMedia('(hover: hover) and (pointer: fine)');
    const isOff = el => el.disabled || el.getAttribute('aria-disabled') === 'true';

    document.querySelectorAll(SELECTOR).forEach(el => {
      if (el.querySelector(':scope > .of-fill')) return;
      const fill = document.createElement('span');
      fill.className = 'of-fill';
      fill.setAttribute('aria-hidden', 'true');
      el.prepend(fill);
      el.classList.add('of-btn');

      let hovering = false;
      let focused = false;
      const sync = () => el.classList.toggle('of-active', (hovering || focused) && !isOff(el));

      /* Coordinates are relative to the padding box, which is what the
         absolutely-positioned circle is measured from. */
      const place = (x, y) => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        const far = Math.hypot(Math.max(x, w - x), Math.max(y, h - y));
        el.style.setProperty('--of-x', `${x}px`);
        el.style.setProperty('--of-y', `${y}px`);
        el.style.setProperty('--of-size', `${Math.ceil(far * 2)}px`);
      };
      const local = e => {
        const r = el.getBoundingClientRect();
        return [e.clientX - r.left - el.clientLeft, e.clientY - r.top - el.clientTop];
      };

      el.addEventListener('pointerenter', e => {
        if (e.pointerType === 'touch' || !canHover.matches || isOff(el)) return;
        if (!focused) place(...local(e));
        hovering = true;
        sync();
      });
      el.addEventListener('pointerleave', e => {
        if (!hovering) return;
        hovering = false;
        if (!focused) place(...local(e));
        sync();
      });
      el.addEventListener('focus', () => {
        if (!el.matches(':focus-visible')) return;
        focused = true;
        if (!hovering) place(el.clientWidth / 2, el.clientHeight / 2);
        sync();
      });
      el.addEventListener('blur', () => { focused = false; sync(); });
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
