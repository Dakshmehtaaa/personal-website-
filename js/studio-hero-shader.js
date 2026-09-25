/* Animated hero backdrop.

   A port of the three.js "chromatic sine wave" shader to raw WebGL — the site
   has no build step and no dependencies, so pulling in three.js for one
   full-screen quad would cost more than the effect is worth. The maths is the
   original: three sine waves offset from each other by a radial distortion
   term, each divided into a thin glowing band. Only the palette changed — the
   three waves are tinted inside one hue family taken from the CV (deep forest,
   green and sage) instead of being mapped straight onto R/G/B, so the split
   reads as depth rather than as a rainbow.

   Housekeeping, in the same spirit as the sustainability page's hero video:
   the loop pauses whenever the hero is off-screen or the tab is hidden, it
   renders a single still frame under prefers-reduced-motion (and re-checks
   that setting if the viewer changes it mid-session), it recovers from a lost
   GPU context, and if WebGL is unavailable the container falls back to its
   CSS gradient. */
(function () {
  'use strict';

  /* Animation advances on wall-clock seconds, not on frames, so a 120 Hz phone
     does not play it at double speed. WRAP is the shortest period after which
     both sine terms below are back where they started: sin(t) repeats every
     2*PI and sin(0.375*t) every 16*PI/3, and 16*PI is a whole number of both.
     Wrapping there keeps the float32 uniform small forever instead of letting
     it drift into visible stepping on a tab left open for hours. */
  var SPEED = 0.6;
  var WRAP = Math.PI * 16;

  var VERT = [
    'attribute vec2 position;',
    'void main(){ gl_Position = vec4(position, 0.0, 1.0); }'
  ].join('\n');

  var FRAG = [
    'precision highp float;',
    'uniform vec2 resolution;',
    'uniform float time;',
    'uniform float xScale;',
    'uniform float yScale;',
    'uniform float distortion;',
    '',
    'void main(){',
    '  vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);',
    '  vec2 uv = gl_FragCoord.xy / resolution;',
    '',
    '  float d = length(p) * distortion;',
    '',
    '  /* the three sampling offsets the chromatic split comes from */',
    '  float ax = p.x * (1.0 + d);',
    '  float bx = p.x;',
    '  float cx = p.x * (1.0 - d);',
    '',
    '  /* slow breathing on the amplitude so the wave never sits still;',
    '     0.375 = 3/8, picked so the whole animation has a finite period */',
    '  float amp = yScale * (0.86 + 0.14 * sin(time * 0.375));',
    '',
    '  float a = 0.115 / abs(p.y + sin((ax + time) * xScale) * amp);',
    '  float b = 0.115 / abs(p.y + sin((bx + time) * xScale) * amp);',
    '  float c = 0.115 / abs(p.y + sin((cx + time) * xScale) * amp);',
    '',
    '  vec3 glow = a * vec3(0.10, 0.33, 0.22)',
    '            + b * vec3(0.20, 0.55, 0.34)',
    '            + c * vec3(0.65, 0.80, 0.70);',
    '',
    '  /* fade towards the top and bottom edges so the band dissolves into the',
    '     section instead of ending on a hard line */',
    '  float edge = smoothstep(0.0, 0.34, uv.y) * smoothstep(1.0, 0.70, uv.y);',
    '  glow *= mix(0.30, 1.0, edge);',
    '',
    '  /* filmic rolloff: the hot core saturates to pale sage rather than',
    '     clipping to white, which keeps the frame inside the palette */',
    '  glow = vec3(1.0) - exp(-glow * 2.35);',
    '',
    '  vec3 base = mix(vec3(0.043, 0.184, 0.141), vec3(0.059, 0.231, 0.176), uv.y);',
    '',
    '  gl_FragColor = vec4(base + glow, 1.0);',
    '}'
  ].join('\n');

  function compile(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function init() {
    var canvas = document.getElementById('studio-hero-canvas');
    if (!canvas) return;
    var stage = canvas.parentElement;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)');

    function fail() { if (stage) stage.classList.add('is-fallback'); }
    function recovered() { if (stage) stage.classList.remove('is-fallback'); }

    var gl = null;
    var uniforms = null;
    var frame = null;
    var clock = 0;          // wrapped animation time, in shader units
    var last = 0;           // previous rAF timestamp, ms
    var pendingResize = true;
    var bufferW = 0;
    var bufferH = 0;
    var visible = !document.hidden;
    var onScreen = true;
    var lost = false;

    /* A tall mobile hero at full device pixel ratio is a lot of fill for an
       effect nobody studies closely, so the ratio is capped harder on small
       screens and the buffer is capped by total pixels as well. */
    function pixelRatio() {
      var dpr = window.devicePixelRatio || 1;
      return Math.min(dpr, window.innerWidth <= 700 ? 1.25 : 1.75);
    }

    function build() {
      try {
        gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' })
          || canvas.getContext('experimental-webgl', { alpha: false, antialias: false, depth: false });
      } catch (e) {
        gl = null;
      }
      if (!gl || gl.isContextLost()) return false;

      var vs = compile(gl, gl.VERTEX_SHADER, VERT);
      var fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
      if (!vs || !fs) return false;

      var program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
      gl.useProgram(program);

      var buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      var position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

      uniforms = {
        resolution: gl.getUniformLocation(program, 'resolution'),
        time: gl.getUniformLocation(program, 'time')
      };
      gl.uniform1f(gl.getUniformLocation(program, 'xScale'), 1.0);
      gl.uniform1f(gl.getUniformLocation(program, 'yScale'), 0.46);
      gl.uniform1f(gl.getUniformLocation(program, 'distortion'), 0.075);

      bufferW = bufferH = 0;
      pendingResize = true;
      return true;
    }

    /* Sizing reads canvas.clientWidth, which forces layout, so it runs only
       when a ResizeObserver says the box actually changed - never per frame. */
    function applyResize() {
      pendingResize = false;
      var dpr = pixelRatio();
      var w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      var h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      var over = (w * h) / 2.4e6;
      if (over > 1) {
        var k = Math.sqrt(over);
        w = Math.max(1, Math.round(w / k));
        h = Math.max(1, Math.round(h / k));
      }
      if (w === bufferW && h === bufferH) return;
      bufferW = w;
      bufferH = h;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uniforms.resolution, w, h);
    }

    function paint() {
      gl.uniform1f(uniforms.time, clock);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function still() {
      if (!gl || lost) return;
      if (pendingResize) applyResize();
      clock = 2.2;
      paint();
    }

    function tick(now) {
      frame = requestAnimationFrame(tick);
      var dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      if (pendingResize) applyResize();
      clock = (clock + dt * SPEED) % WRAP;
      paint();
    }

    function running() { return frame !== null; }

    function start() {
      if (running() || lost || !gl || reduce.matches || !visible || !onScreen) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    }

    function stop() {
      if (frame !== null) { cancelAnimationFrame(frame); frame = null; }
    }

    function render() { reduce.matches ? still() : start(); }

    if (!build()) { fail(); return; }

    /* A lost context leaves a blank canvas behind; without this the hero would
       stay empty for the rest of the session while rAF kept burning frames. */
    canvas.addEventListener('webglcontextlost', function (event) {
      event.preventDefault();
      lost = true;
      stop();
      fail();
    });
    canvas.addEventListener('webglcontextrestored', function () {
      lost = false;
      if (build()) { recovered(); render(); } else { fail(); }
    });

    function onBoxChange() {
      pendingResize = true;
      if (!running()) render();
    }
    if ('ResizeObserver' in window) new ResizeObserver(onBoxChange).observe(canvas);
    else window.addEventListener('resize', onBoxChange, { passive: true });

    document.addEventListener('visibilitychange', function () {
      visible = !document.hidden;
      visible ? render() : stop();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[entries.length - 1].isIntersecting;
        onScreen ? start() : stop();
      }, { threshold: 0 }).observe(canvas);
    }

    /* Re-checked rather than branched once at load: someone can switch reduced
       motion on while the page is open and expect the movement to stop. */
    function onMotionChange() {
      if (reduce.matches) { stop(); still(); } else { start(); }
    }
    if (reduce.addEventListener) reduce.addEventListener('change', onMotionChange);
    else if (reduce.addListener) reduce.addListener(onMotionChange);

    render();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
