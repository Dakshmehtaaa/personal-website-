/* Dataiku 2026 scene (.dk-scene): the section pins with the big Dataiku logo on the left. As you scroll the
   logo settles, then the role, a one-line summary and the Learn more button arrive on the right.
   Without GSAP, or with prefers-reduced-motion, it stays a static two-column block with everything visible. */
(function () {
  const scene = document.querySelector('.dk-scene');
  if (!scene || !window.gsap || !window.ScrollTrigger) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);
  const logo = scene.querySelector('.dk-logo');
  const rises = gsap.utils.toArray('.dk-rise', scene);
  const cta = scene.querySelector('.dk-cta');
  scene.classList.add('dk-live');
  gsap.set(rises, { yPercent: 105 });

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: {
      trigger: scene, start: 'top top',
      end: () => '+=' + Math.max(1, scene.offsetHeight - window.innerHeight - window.innerHeight * 0.35),
      scrub: true, invalidateOnRefresh: true
    }
  });
  tl.fromTo(logo, { xPercent: 22, scale: 1.12 }, { xPercent: 0, scale: 1, duration: 1, ease: 'power2.inOut' }, 0)
    .to(rises[0], { yPercent: 0, duration: 0.6 }, 0.5)
    .to(rises[1], { yPercent: 0, duration: 0.7 }, 0.85)
    .to(rises[2], { yPercent: 0, duration: 0.7 }, 1.25)
    .to(cta, { opacity: 1, y: 0, duration: 0.6 }, 1.7);

  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 150); });
})();
