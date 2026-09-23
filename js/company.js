/* For-companies page: header, operating loop, cards and resource filter.

   The loop runs Measure -> Decide -> Disclose -> Act. It steps on its own
   every few seconds while it is on screen, and the yellow comet always
   travels clockwise to the active stage, so the direction of the loop is the
   first thing a visitor sees. Hovering, focusing or clicking a stage takes
   over; "Resources for this step" filters the library below to that stage.
   Everything degrades to a static, readable page without JS, and nothing
   moves on its own under prefers-reduced-motion. */
(function () {
  'use strict';
  var STAGES = ['measure', 'decide', 'disclose', 'act'];

  var init = function () {
    var body = document.body;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)');

    /* header: transparent over the navy hero, like the homepage */
    var hero = document.querySelector('.sys-hero');
    var header = document.querySelector('.beta-header');
    if (hero && header) {
      var measure = function () { body.style.setProperty('--sys-header-h', header.offsetHeight + 'px'); };
      measure();
      window.addEventListener('resize', measure, { passive: true });
      body.classList.add('sys-top-dark');
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          body.classList.toggle('sys-top-dark', entries[entries.length - 1].isIntersecting);
        }, { rootMargin: '-60px 0px 0px 0px' }).observe(hero);
      }
      var onScroll = function () { body.classList.toggle('sys-scrolled', window.scrollY > 8); };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* resource filter (the loop link below uses it too) */
    var filter = document.querySelector('.sys-filter');
    var cards = [].slice.call(document.querySelectorAll('.sys-res'));
    var count = document.querySelector('.sys-res-count');
    var current = 'all';
    var applyFilter = function (stage) {
      current = stage;
      var shown = 0;
      cards.forEach(function (card) {
        var match = stage === 'all' || card.dataset.node === stage;
        card.classList.toggle('is-dimmed', !match);
        card.setAttribute('aria-hidden', String(!match));
        if (match) shown++;
      });
      if (filter) {
        [].forEach.call(filter.querySelectorAll('button'), function (b) {
          b.setAttribute('aria-pressed', String(b.dataset.filter === stage));
        });
      }
      if (count) {
        var fr = document.documentElement.lang === 'fr' && count.dataset.templateFr;
        count.textContent = (fr ? count.dataset.templateFr : count.dataset.template).replace('{n}', shown);
      }
    };
    if (filter && cards.length) {
      filter.addEventListener('click', function (event) {
        var button = event.target.closest('button[data-filter]');
        if (button) applyFilter(button.dataset.filter);
      });
      document.querySelectorAll('[data-beta-lang]').forEach(function (b) {
        b.addEventListener('click', function () { setTimeout(function () { applyFilter(current); }, 0); });
      });
      applyFilter('all');
    }

    /* the loop */
    var loop = document.querySelector('[data-loop]');
    if (loop) {
      var nodes = [].slice.call(loop.querySelectorAll('.sys-node'));
      var panels = [].slice.call(loop.querySelectorAll('.sys-loop-panel'));
      var comet = loop.querySelector('.sys-loop-comet');
      var link = loop.querySelector('.sys-loop-link');
      var step = 0, timer = null, held = false, visible = false, resumeAt = 0;
      var INTERVAL = 3200;

      var show = function (nextStep) {
        step = nextStep;
        var index = ((step % 4) + 4) % 4;
        nodes.forEach(function (node, i) { node.setAttribute('aria-pressed', String(i === index)); });
        panels.forEach(function (panel, i) { panel.classList.toggle('is-active', i === index); });
        if (comet) comet.style.setProperty('--angle', (step * 90) + 'deg');
      };
      /* always travel forward, so the comet never runs the loop backwards */
      var goTo = function (index) {
        var delta = ((index - step) % 4 + 4) % 4;
        show(step + delta);
      };
      var schedule = function () {
        clearTimeout(timer);
        if (reduce.matches || held || !visible || document.hidden) return;
        var wait = Math.max(INTERVAL, resumeAt - Date.now());
        timer = setTimeout(function () { show(step + 1); schedule(); }, wait);
      };

      nodes.forEach(function (node, i) {
        node.addEventListener('click', function () { goTo(i); resumeAt = Date.now() + 9000; schedule(); });
        node.addEventListener('mouseenter', function () { held = true; goTo(i); schedule(); });
        node.addEventListener('mouseleave', function () { held = false; resumeAt = Date.now() + 2500; schedule(); });
        node.addEventListener('focus', function () { held = true; goTo(i); schedule(); });
        node.addEventListener('blur', function () { held = false; schedule(); });
      });
      if (link) {
        link.addEventListener('click', function () { applyFilter(STAGES[((step % 4) + 4) % 4]); });
      }
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          visible = entries[entries.length - 1].isIntersecting;
          schedule();
        }, { threshold: 0.35 }).observe(loop);
      } else { visible = true; }
      document.addEventListener('visibilitychange', schedule);
      show(0);
      schedule();
    }

    /* cards arrive, then the one you are reading lights up */
    var points = [].slice.call(document.querySelectorAll('.sys-point'));
    var rise = [].slice.call(document.querySelectorAll('.sys-rise'));
    if (reduce.matches || !('IntersectionObserver' in window)) {
      rise.forEach(function (el) { el.classList.add('is-in'); });
    } else {
      var riseObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          riseObserver.unobserve(entry.target);
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
      rise.forEach(function (el) { riseObserver.observe(el); });
    }
    if (points.length && 'IntersectionObserver' in window && matchMedia('(max-width: 980px)').matches) {
      /* on a single column there is no hover to lean on */
      var seen = new Map();
      var pointObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { seen.set(entry.target, entry.intersectionRatio); });
        var best = null, bestRatio = 0;
        seen.forEach(function (ratio, el) { if (ratio > bestRatio) { bestRatio = ratio; best = el; } });
        points.forEach(function (point) { point.classList.toggle('is-active', point === best && bestRatio > 0.6); });
      }, { threshold: [0, 0.6, 0.9] });
      points.forEach(function (point) { pointObserver.observe(point); });
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
