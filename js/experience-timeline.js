/* Pinned horizontal experience timeline (.beta-tl: #timeline on about-me-beta.html, #experience on index.html).
   Adapted from the 21st.dev / Hyperiux "timeline" React component to vanilla JS + GSAP ScrollTrigger:
   the section pins, the track slides sideways, the centre line grows, and each entry draws its
   stem and node and rises its text out of a mask as it reaches the reading position.
   Without GSAP, or with prefers-reduced-motion, the section stays a plain vertical list. */
(function () {
  const section = document.querySelector('.beta-tl');
  if (!section) return;
  if (!window.gsap || !window.ScrollTrigger) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return;

  gsap.registerPlugin(ScrollTrigger);
  const track = section.querySelector('.tl-track');
  const grow = section.querySelector('.tl-grow');
  const items = gsap.utils.toArray('.tl-item', section);
  const lead = gsap.utils.toArray('.tl-lead .tl-rise', section);
  section.classList.add('tl-live');
  gsap.set(section.querySelectorAll('.tl-rise'), { yPercent: 105 });

  const mm = gsap.matchMedia();
  mm.add('(min-width: 0px)', () => {
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const slide = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: true, invalidateOnRefresh: true }
    });

    gsap.to(grow, {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: section, start: 'top 25%', end: 'bottom bottom', scrub: true }
    });

    gsap.to(lead, {
      yPercent: 0, duration: 1, stagger: 0.06, ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 60%', toggleActions: 'play none none reverse' }
    });

    items.forEach((item) => {
      const stem = item.querySelector('.tl-stem');
      const node = item.querySelector('.tl-node');
      const rises = item.querySelectorAll('.tl-rise');
      const logo = item.querySelector('.tl-logo');
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: item, containerAnimation: slide,
          start: 'left 90%', end: 'left 62%', scrub: true
        }
      });
      tl.to(stem, { scaleY: 1, duration: 0.4 })
        .to(node, { scale: 1, duration: 0.4 }, '<')
        .to(rises, { yPercent: 0, duration: 1, stagger: 0.04, ease: 'power2.out' }, 0.15)
        .to(logo, { opacity: 1, duration: 0.6 }, 0.3);
    });
    return () => { section.classList.remove('tl-live'); };
  });

  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 150); });
  reduce.addEventListener && reduce.addEventListener('change', () => location.reload());
})();
