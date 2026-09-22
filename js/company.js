/* For-companies page: the operating loop.
   One diagram does three jobs - it draws itself in the hero, lights the arc that
   matches whichever business-case point you are reading, and its nodes act as
   the filter legend for the resource library. All of it degrades to a static,
   fully readable page without JS or with reduced motion. */
(function () {
  'use strict';
  var init = function () {
    var reduce = matchMedia('(prefers-reduced-motion: reduce)');
    var loop = document.querySelector('.sys-loop');

    /* give each path its own length so the dash animation draws cleanly */
    if (loop) {
      [].forEach.call(loop.querySelectorAll('.sys-arc'), function (path) {
        try { path.style.setProperty('--len', Math.ceil(path.getTotalLength())); } catch (e) {}
      });
      if (reduce.matches) loop.classList.add('is-drawn');
      else if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries, obs) {
          if (!entries[entries.length - 1].isIntersecting) return;
          loop.classList.add('is-drawn');
          obs.disconnect();
        }, { threshold: 0.25 }).observe(loop);
      } else loop.classList.add('is-drawn');
    }

    var arcs = loop ? [].slice.call(loop.querySelectorAll('.sys-arc[data-arc]')) : [];
    var nodes = loop ? [].slice.call(loop.querySelectorAll('.sys-node')) : [];
    var points = [].slice.call(document.querySelectorAll('.sys-point'));

    var light = function (index) {
      arcs.forEach(function (arc) { arc.classList.toggle('is-lit', arc.dataset.arc === String(index)); });
      nodes.forEach(function (node, i) { node.classList.toggle('is-lit', index !== null && (i === index || i === index + 1)); });
      points.forEach(function (point, i) { point.classList.toggle('is-active', i === index); });
    };

    if (points.length && 'IntersectionObserver' in window) {
      var seen = new Map();
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { seen.set(entry.target, entry.intersectionRatio); });
        var best = null, bestRatio = 0;
        seen.forEach(function (ratio, el) { if (ratio > bestRatio) { bestRatio = ratio; best = el; } });
        light(best && bestRatio > 0.35 ? points.indexOf(best) : null);
      }, { threshold: [0, 0.35, 0.6, 0.9] });
      points.forEach(function (point) { observer.observe(point); });
    }

    /* panels arrive instead of appearing */
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

    /* the loop's four stages are the filter for the resource library */
    var filter = document.querySelector('.sys-filter');
    var cards = [].slice.call(document.querySelectorAll('.sys-res'));
    var count = document.querySelector('.sys-res-count');
    if (filter && cards.length) {
      var apply = function (stage) {
        var shown = 0;
        cards.forEach(function (card) {
          var match = stage === 'all' || card.dataset.node === stage;
          card.classList.toggle('is-dimmed', !match);
          card.setAttribute('aria-hidden', String(!match));
          if (match) shown++;
        });
        [].forEach.call(filter.querySelectorAll('button'), function (b) {
          b.setAttribute('aria-pressed', String(b.dataset.filter === stage));
        });
        nodes.forEach(function (node) {
          if (stage === 'all') return;
          node.classList.toggle('is-lit', node.dataset.node === stage);
        });
        if (stage === 'all') nodes.forEach(function (n) { n.classList.remove('is-lit'); });
        if (count) count.textContent = count.dataset.template.replace('{n}', shown);
      };
      filter.addEventListener('click', function (event) {
        var button = event.target.closest('button[data-filter]');
        if (button) apply(button.dataset.filter);
      });
      apply('all');
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
