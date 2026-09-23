/* Clock for the "Why now" explainer (see css/explainer.css for the idea).

   One global time t, in ms, split across the scenes by their data-dur. Each
   frame works out which scene t falls in and how far into it, then toggles
   .on on every [data-at] the scene has reached and .gone on every [data-out]
   it has passed. Nothing is animated from JS except the number count-up; the
   CSS transitions do the moving.

   Whenever the current scene changes, or the viewer seeks, the new state is
   applied with transitions switched off (.xv-snap), so jumping around never
   plays elements backwards. Autoplays once when the frame is mostly on
   screen, pauses when it leaves or the tab is hidden, and never autoplays
   under prefers-reduced-motion. */
(function () {
  'use strict';

  function fmt(ms) {
    var s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function setup(player) {
    var stage = player.querySelector('.xv-stage');
    var poster = player.querySelector('.xv-poster');
    var playBtn = player.querySelector('.xv-play');
    var segsBox = player.querySelector('.xv-segs');
    var timeEl = player.querySelector('.xv-time');
    var reduce = matchMedia('(prefers-reduced-motion: reduce)');

    var total = 0;
    var scenes = Array.prototype.map.call(stage.querySelectorAll('.xv-scene'), function (el, i) {
      var dur = Number(el.dataset.dur);
      var scene = {
        el: el, start: total, dur: dur,
        items: Array.prototype.map.call(el.querySelectorAll('[data-at],[data-out]'), function (node) {
          return {
            el: node,
            at: node.hasAttribute('data-at') ? Number(node.dataset.at) : -1,
            out: node.hasAttribute('data-out') ? Number(node.dataset.out) : Infinity
          };
        }),
        counts: Array.prototype.map.call(el.querySelectorAll('[data-count]'), function (node) {
          var host = node.closest('[data-at]');
          return { el: node, target: Number(node.dataset.count), at: host ? Number(host.dataset.at) : 0, dur: Number(node.dataset.countDur || 1400), shown: null };
        })
      };
      total += dur;

      var chapter = el.querySelector('.xv-chapter [id]');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'xv-seg-btn';
      btn.style.setProperty('--w', dur);
      if (chapter) btn.setAttribute('aria-labelledby', chapter.id);
      btn.appendChild(document.createElement('i'));
      btn.addEventListener('click', function (event) { event.stopPropagation(); seek(scene.start); });
      segsBox.appendChild(btn);
      scene.fill = btn.firstChild;
      return scene;
    });

    var t = 0, current = -1, frame = null, last = 0;
    var started = false, ended = false, userPaused = false, pausedByView = false;

    function lang() { return document.documentElement.lang === 'fr' ? 'fr-FR' : 'en-GB'; }

    function label() {
      var fr = document.documentElement.lang === 'fr';
      var state = ended ? (fr ? 'Revoir' : 'Replay') : frame ? 'Pause' : (fr ? 'Lecture' : 'Play');
      playBtn.setAttribute('aria-label', state);
    }

    function apply(snap) {
      var idx = scenes.length - 1;
      for (var i = 0; i < scenes.length; i++) {
        if (t < scenes[i].start + scenes[i].dur) { idx = i; break; }
      }
      var scene = scenes[idx];
      var local = Math.min(t - scene.start, scene.dur);
      var changed = idx !== current;

      if (changed) {
        scenes.forEach(function (s, i) {
          s.el.classList.toggle('is-active', i === idx);
          s.el.classList.toggle('is-past', i < idx);
          s.el.inert = i !== idx;
        });
        current = idx;
      }
      if (changed || snap) scene.el.classList.add('xv-snap');

      scene.items.forEach(function (item) {
        item.el.classList.toggle('on', local >= item.at);
        item.el.classList.toggle('gone', local >= item.out);
      });

      scene.counts.forEach(function (c) {
        var p = Math.max(0, Math.min(1, (local - c.at) / c.dur));
        var v = Math.round(c.target * (1 - Math.pow(1 - p, 3)));
        var text = v.toLocaleString(lang());
        if (text !== c.shown) { c.el.textContent = text; c.shown = text; }
      });

      if (changed || snap) {
        void scene.el.offsetWidth;
        scene.el.classList.remove('xv-snap');
      }

      scenes.forEach(function (s, i) {
        var p = i < idx ? 1 : i > idx ? 0 : local / s.dur;
        s.fill.style.transform = 'scaleX(' + p + ')';
      });
      timeEl.textContent = fmt(t) + ' / ' + fmt(total);
    }

    function tick(now) {
      frame = requestAnimationFrame(tick);
      var dt = last ? Math.min(now - last, 100) : 0;
      last = now;
      t += dt;
      if (t >= total) {
        t = total;
        apply(false);
        stop();
        ended = true;
        player.classList.add('is-ended');
        label();
        return;
      }
      apply(false);
    }

    function play() {
      if (frame) return;
      if (ended) { ended = false; player.classList.remove('is-ended'); seek(0); }
      if (!started) { started = true; player.classList.add('is-started'); }
      last = 0;
      frame = requestAnimationFrame(tick);
      player.classList.add('is-playing');
      label();
    }

    function stop() {
      if (frame) { cancelAnimationFrame(frame); frame = null; }
      player.classList.remove('is-playing');
      label();
    }

    function seek(ms) {
      t = Math.max(0, Math.min(ms, total - 1));
      if (ended) { ended = false; player.classList.remove('is-ended'); }
      if (!started) { started = true; player.classList.add('is-started'); }
      current = -1;
      apply(true);
      label();
    }

    function toggle() {
      if (frame) { userPaused = true; stop(); }
      else { userPaused = false; play(); }
    }

    poster.addEventListener('click', function (event) { event.stopPropagation(); userPaused = false; play(); });
    playBtn.addEventListener('click', toggle);
    stage.addEventListener('click', function (event) {
      if (event.target.closest('a,button')) return;
      toggle();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var entry = entries[entries.length - 1];
        if (entry.intersectionRatio >= 0.6) {
          if (pausedByView || (!started && !reduce.matches)) { pausedByView = false; if (!userPaused && !ended) play(); }
        } else if (!entry.isIntersecting && frame) {
          pausedByView = true;
          stop();
        }
      }, { threshold: [0, 0.6] }).observe(stage);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden && frame) { pausedByView = true; stop(); }
      else if (!document.hidden && pausedByView && !userPaused) { pausedByView = false; play(); }
    });

    /* the language switch rewrites text in place; refresh the bits JS owns */
    document.querySelectorAll('[data-beta-lang]').forEach(function (b) {
      b.addEventListener('click', function () {
        setTimeout(function () {
          scenes.forEach(function (s) { s.counts.forEach(function (c) { c.shown = null; }); });
          apply(false);
          label();
        }, 0);
      });
    });

    player.xvSeek = seek; // lets a test jump to an exact frame
    apply(true);
    label();
  }

  function init() { document.querySelectorAll('[data-xv]').forEach(setup); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
