/* Pinned horizontal experience timeline (.beta-tl: #timeline on about-me-beta.html, #experience on index.html).
   Adapted from the 21st.dev / Hyperiux "timeline" React component to vanilla JS + GSAP ScrollTrigger.
   One scrubbed timeline drives the whole pinned section: for every job the track slides to it, its stem/node/text
   draw in, the line reaches it, then a feature panel (big logo left; role, one line and Learn more top right) comes
   up and goes away again. At the end the track settles into one overview with "Today" pulsing, and holds.
   Without GSAP, with prefers-reduced-motion, or below 821px wide (phones, portrait tablets: the pinned track is too
   narrow there to read), the section stays a plain vertical list. */
(function () {
  const section = document.querySelector('.beta-tl');
  if (!section) return;
  if (!window.gsap || !window.ScrollTrigger) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return;

  gsap.registerPlugin(ScrollTrigger);
  const track = section.querySelector('.tl-track');
  const rail = section.querySelector('.tl-rail');
  const itemsEl = section.querySelector('.tl-items');
  const items = gsap.utils.toArray('.tl-item', section);
  const feats = gsap.utils.toArray('.tl-feature', section);
  const lead = gsap.utils.toArray('.tl-lead .tl-rise', section);
  const endcap = items[items.length - 1].querySelector('.tl-endcap');
  const UNIT = 0.34; // viewport heights of scrolling per timeline unit
  const wide = window.matchMedia('(min-width: 821px)');

  let ctx = null;
  const build = () => {
    if (!wide.matches) return;
    section.classList.add('tl-live');
    ctx = gsap.context(() => {
      gsap.set(section.querySelectorAll('.tl-rise, .tf-rise'), { yPercent: 105 });
      gsap.set(feats, { autoAlpha: 0 });
      gsap.set(section.querySelectorAll('.tf-cta'), { opacity: 0, y: 16 });

      const vw = window.innerWidth;
      const dist = Math.max(0, track.scrollWidth - vw);
      const nodeX = (el) => itemsEl.offsetLeft + el.offsetLeft;
      const railLeft = rail.offsetLeft;
      const fit = Math.min(1, Math.max(0.5, vw / track.scrollWidth));
      const master = gsap.timeline({ defaults: { ease: 'none' } });
      let at = 0, lastX = 0;

      items.forEach((item, i) => {
        const focus = -Math.min(dist, Math.max(0, nodeX(item) - vw * 0.4));
        if (Math.abs(focus - lastX) > 4) {
          master.to(track, { x: focus, duration: 0.8, ease: 'power1.inOut' }, at);
          at += 0.8;
        }
        lastX = focus;
        const stem = item.querySelector('.tl-stem');
        const node = item.querySelector('.tl-node');
        const rises = item.querySelectorAll('.tl-card .tl-rise');
        const logo = item.querySelector('.tl-logo');
        const lineTo = nodeX(item) - railLeft + (i === items.length - 1 ? 5 : 0);
        master.to(rail, { width: lineTo, duration: 0.5 }, at)
          .to(stem, { scaleY: 1, duration: 0.4 }, at + 0.1)
          .to(node, { scale: 1, duration: 0.3 }, at + 0.1)
          .to(rises, { yPercent: 0, duration: 0.5, stagger: 0.04, ease: 'power2.out' }, at + 0.2)
          .to(logo, { opacity: 1, duration: 0.4 }, at + 0.25);
        at += 0.6;

        const f = feats[i];
        const fr = f.querySelectorAll('.tf-rise');
        master.to(track, { opacity: 0.06, duration: 0.4 }, at)
          .to(f, { autoAlpha: 1, duration: 0.3 }, at)
          .fromTo(f.querySelector('.tf-logo'), { xPercent: -8, scale: 0.94 }, { xPercent: 0, scale: 1, duration: 0.7, ease: 'power2.out' }, at)
          .to(fr, { yPercent: 0, duration: 0.5, stagger: 0.15, ease: 'power2.out' }, at + 0.2)
          .to(f.querySelector('.tf-cta'), { opacity: 1, y: 0, duration: 0.4 }, at + 0.75);
        at += 1.5; // in + hold
        master.to(f, { autoAlpha: 0, duration: 0.3 }, at)
          .to(track, { opacity: 1, duration: 0.3 }, at);
        at += 0.4;
      });

      // Overview: the whole timeline in one window (on a narrow phone, its latest half at half size), "Today" lands on the last node and pulses, then a final hold.
      master.to(track, { x: -Math.max(0, track.scrollWidth * fit - vw), scale: fit, transformOrigin: '0% 50%', duration: 1.1, ease: 'power1.inOut' }, at);
      at += 1.1;
      let tPulse = at;
      if (endcap) { master.to(endcap.querySelectorAll('.tl-rise'), { yPercent: 0, duration: 0.4, ease: 'power2.out' }, at); at += 0.4; tPulse = at - 0.2; }
      master.to({}, { duration: 1.3 }, at); // hold
      const total = master.duration();

      section.style.height = Math.round(window.innerHeight * (1 + total * UNIT)) + 'px';
      ScrollTrigger.create({
        animation: master, trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true,
        onUpdate: () => section.classList.toggle('tl-pulse', master.time() >= tPulse)
      });
      gsap.to(lead, {
        yPercent: 0, duration: 1, stagger: 0.06, ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 60%', toggleActions: 'play none none reverse' }
      });
    }, section);
  };
  const teardown = () => {
    if (ctx) ctx.revert();
    ctx = null;
    section.style.height = '';
    section.classList.remove('tl-live', 'tl-pulse');
  };
  build();

  let t, lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    clearTimeout(t);
    t = setTimeout(() => {
      if (window.innerWidth === lastW) return; // mobile URL-bar height changes: keep the build
      lastW = window.innerWidth; teardown(); build(); ScrollTrigger.refresh();
    }, 200);
  });
  reduce.addEventListener && reduce.addEventListener('change', () => location.reload());
})();
