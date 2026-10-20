/* Experience timeline (.beta-tl: #timeline on about-me-beta.html, #experience on index.html), vanilla JS + GSAP ScrollTrigger.
   821px and wider (.tl-live): the section pins and the scroll only drives the line, which grows from the start dot to each
   job's node in turn. Reaching a node switches that job on (.is-on) and puts it in focus (.is-active); the text and logo then
   arrive on CSS transitions, so they are never left half-drawn by a scroll that stops midway. Every job is a snap point, so a
   scroll that stops between two jobs settles on the nearer one.
   Narrower (.tl-flow): the vertical list stays, its line fills with the scroll and each job comes in as it enters the screen.
   Without GSAP, or with prefers-reduced-motion, the section stays the plain list with everything visible. */
(function () {
  const section = document.querySelector('.beta-tl');
  if (!section) return;
  if (!window.gsap || !window.ScrollTrigger) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return;

  gsap.registerPlugin(ScrollTrigger);
  const track = section.querySelector('.tl-track');
  const rail = section.querySelector('.tl-rail');
  const grow = section.querySelector('.tl-grow');
  const itemsEl = section.querySelector('.tl-items');
  const items = gsap.utils.toArray('.tl-item', section);
  const lead = section.querySelector('.tl-lead');
  const wide = window.matchMedia('(min-width: 821px)');
  const STEP = 1;      // timeline units from one job to the next
  const UNIT = 0.55;   // viewport heights of scrolling per timeline unit

  const setState = (reached) => {
    items.forEach((item, i) => {
      item.classList.toggle('is-on', i <= reached);
      item.classList.toggle('is-active', i === reached);
    });
  };

  let ctx = null;
  const buildPinned = () => {
    section.classList.add('tl-live');
    const nodeX = (el) => itemsEl.offsetLeft + el.offsetLeft;
    const last = nodeX(items[items.length - 1]);
    rail.style.setProperty('--rail', last + 'px');

    const master = gsap.timeline({ defaults: { ease: 'none' } });
    const times = [0];
    master.set(grow, { scaleX: 6 / last }, 0); // just the start dot
    items.forEach((item, i) => {
      master.to(grow, { scaleX: nodeX(item) / last, duration: STEP, ease: 'power1.inOut' }, STEP * i + 0.25);
      times.push(STEP * (i + 1) + 0.25);
    });
    master.to({}, { duration: 0.6 }); // a short rest on the last job before the section lets go
    const total = master.duration();
    times.push(total);
    const snaps = times.map((t) => t / total);

    let reached = -2;
    const update = () => {
      const t = master.time();
      // a job switches on once the line is most of the way to its node
      let r = -1;
      for (let i = 0; i < items.length; i++) if (t >= times[i + 1] - STEP * 0.3) r = i;
      if (r !== reached) { reached = r; setState(r); }
    };

    section.style.height = Math.round(window.innerHeight * (1 + total * UNIT)) + 'px';
    ScrollTrigger.create({
      animation: master, trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.6,
      snap: { snapTo: snaps, duration: { min: 0.25, max: 0.7 }, delay: 0.12, ease: 'power2.inOut', inertia: false },
      onUpdate: update, onRefresh: update
    });
    ScrollTrigger.create({
      trigger: section, start: 'top 70%',
      onEnter: () => lead.classList.add('is-on'), onLeaveBack: () => lead.classList.remove('is-on')
    });
    update();
  };

  const buildFlow = () => {
    section.classList.add('tl-flow');
    gsap.fromTo(itemsEl, { '--fill': 0 }, {
      '--fill': 1, ease: 'none',
      scrollTrigger: { trigger: itemsEl, start: 'top 75%', end: 'bottom 60%', scrub: 0.4 }
    });
    [lead].concat(items).forEach((el) => {
      ScrollTrigger.create({
        trigger: el, start: 'top 82%',
        onEnter: () => el.classList.add('is-on'), onLeaveBack: () => el.classList.remove('is-on')
      });
    });
  };

  const build = () => {
    ctx = gsap.context(() => (wide.matches ? buildPinned() : buildFlow()), section);
  };
  const teardown = () => {
    if (ctx) ctx.revert();
    ctx = null;
    section.style.height = '';
    section.classList.remove('tl-live', 'tl-flow');
    [lead].concat(items).forEach((el) => el.classList.remove('is-on', 'is-active'));
    itemsEl.style.removeProperty('--fill');
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
  // fonts change the card heights, and so the node positions
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { teardown(); build(); ScrollTrigger.refresh(); });
  reduce.addEventListener && reduce.addEventListener('change', () => location.reload());
})();
