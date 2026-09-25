/* Demo shell: registers beats, renders them into full-screen sections, runs reveal steps and the presenter chrome.
   Plain script, no modules, opens from disk. Beats call window.DEMO.register({...}).

   CONTRACT (unchanged fields): id, order, kicker, title, seconds, notes, evidence[], render(el, ctx), dataFiles[].
   Optional (DESIGN_SPEC 4.1, 4.4):
     steps: n            reveal steps on this screen (default 1). Right arrow reveals the next step, then moves on.
     onStep(el, i, ctx)  called with 1..steps whenever the step changes (and after every render).
                         Elements inside the beat with data-reveal="k" are hidden (space kept) until step k, automatically.
     stepNotes: []       the spoken line for each step (presenter view). Falls back to notes.
     stepLabels: []      what each click shows, one per step (presenter view "Clicks on this screen").
     glossary: []        { term, def } (or text) for "Words used here" in the drawer.
   Evidence item fields: id, value, claim, source, check (official | verified | approximate | none),
     receipt (file names and internal references, shown in mono), offscreen: true (listed under "More in the data").
   ctx given to render: isNarrow, step (current step, a getter), steps, openEvidence(ids), cssVar(name), px(name).

   Keys: Right / Space / PageDown = next click; Left / PageUp = back; Home / End; 1 to 7 = jump to a screen;
         E = sources drawer; V = presenter view; N = notes panel; P = pause timer; T = restart timer; ? = key help; Esc.
   URL:  #b3 opens a screen, #b3.2 at reveal step 2. ?ev=b3-e5 opens the drawer on an item. ?shot=1 hides chrome and
         shows the final reveal state (or the step in the hash). ?notes=1, ?view=presenter, ?clock=0, ?theme=...

   MOTION (v3, V3_PLAN.md section 3). Animate only to explain; every move belongs to one click step.
     A move plays ONLY when the presenter goes FORWARD by one click (right arrow, or the synced window doing so):
     arriving on a screen plays its step-1 moves (after the 240 ms screen crossfade), a click inside a screen plays
     that step's moves. Going back, jumping (1 to 7, Home, rail, hash), redraws, ?shot=1, narrow screens and
     prefers-reduced-motion all show the FINISHED state instantly. A click while a move is running finishes it at once.
     Moves run one after another (one thing moving at a time); moves that share an order number move together as one.
     Durations are clamped to 400 to 1200 ms, easing is var(--ease-out). Web Animations API only, no libraries.

     Declarative (preferred): put attributes on any element inside a beat (HTML or SVG):
       data-reveal="k"        the step that shows it (hidden, space kept, before step k). Without it: step 1.
       data-anim="kind"       fade | rise | draw | wipe | grow | count | light
       data-anim-order="n"    order inside the step (default 0); equal numbers move together as one thing
       data-anim-dur="ms"     optional duration (clamped 400 to 1200)
       data-anim-from="side"  wipe and grow: left (default) | right | top | bottom
       data-anim-from="n"     count: the start value (default 0)
     Kinds:
       fade   opacity 0 to 1 (400 ms). Safe on anything, including SVG with a transform attribute.
       rise   fade plus a 12 px rise (500 ms). HTML, or SVG elements WITHOUT a transform attribute.
       draw   SVG strokes draw along their length (900 ms): a path/line/polyline/circle/rect, or a <g> whose shapes all
              draw at once. Solid strokes only (it borrows stroke-dasharray); for dashed lines or fills use wipe.
              Arrowhead markers show from the start: reveal a separate arrowhead with a later fade.
       wipe   a clip edge sweeps across the element (1000 ms): a time cursor for charts, areas, dashed lines, groups.
       grow   scaleX (left/right) or scaleY (top/bottom) from 0 (700 ms): bars and brackets. Not on text; not on SVG
              elements with a transform attribute (wrap them in a <g>).
       count  the first number in the element's text counts up from data-anim-from (800 ms), keeping its format
              ("$13.5", "1,147", "81"); it always ends on the exact original text.
       light  the element's [data-light] children (else its children) appear one after another in DOM order, the
              whole run taking the duration (900 ms): records lighting up in sequence.
     Imperative (for SVG built in JS, or moves the attributes cannot express), on the ctx given to render and onStep:
       ctx.reveal(el, step, kind, opts)  sets the attributes above; opts { order, dur, from }. Returns el.
       ctx.animate(el, kind, opts)       inside onStep: queue one move now; opts { dur, from, with: true (move with the
                                         previous move), keyframes (kind 'keys': your own Web Animations keyframes) }.
                                         Returns a Promise. Does nothing (finished state) unless ctx.entering.
       ctx.entering   true only while the shell applies a forward click to this screen
       ctx.motion     true when this device and mode allow motion at all (not ?shot=1, narrow or reduced motion)
       ctx.refresh()  re-apply the current step instantly, after a beat redraws its own DOM (e.g. on resize)
     window.DEMO.motion = { animate, flush, enabled } for the console. */
(function () {
  'use strict';
  window.DEMO_DATA = window.DEMO_DATA || {};

  // Step names from DESIGN_SPEC section 2 (they win over a beat's kicker, so the rail always tells the same story).
  var STEP_NAMES = { b0: 'The question', b1: 'New routes', b2: 'New names', b3: 'The lag', b4: 'The drone part', b5: 'Blind spots', b6: 'What to track' };

  var beats = [];
  var byId = {};
  var extraLoaded = {};
  var current = -1;
  var step = 1;
  var rendered = {};
  var lastNarrow = null, lastSize = '';
  var params = new URLSearchParams(location.search);
  var SHOT = params.get('shot') === '1';
  var shotStep = null;          // a step named in the hash while in shot mode
  var reduceMotion = false;
  try { reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  // ---------- motion (see MOTION in the header) ----------
  var MO = (function () {
    var DEF = { fade: 400, rise: 500, draw: 900, wipe: 1000, grow: 700, count: 800, light: 900, keys: 600 };
    var groups = [];      // [{ jobs: [], state: 'wait' | 'run' | 'done', lead: ms }]
    var active = false;   // true only while the shell applies a forward click
    var lead = 0;         // delay before the first move of this step
    var timer = null;
    var HAS_WAAPI = typeof Element !== 'undefined' && typeof Element.prototype.animate === 'function';
    var GEOM = 'path,line,polyline,polygon,circle,rect,ellipse';

    function reduced() { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return reduceMotion; } }
    function easing() {
      var v = '';
      try { v = getComputedStyle(document.documentElement).getPropertyValue('--ease-out').trim(); } catch (e) {}
      return v || 'cubic-bezier(.2, .7, .3, 1)';
    }
    function clamp(d) { return Math.max(400, Math.min(1200, +d || 0)); }
    function isSvg(el) { return typeof SVGElement !== 'undefined' && el instanceof SVGElement; }
    function hasTransformAttr(el) { return isSvg(el) && el.hasAttribute('transform'); }

    // ---- count helpers: animate the first number in the text, keep its format, end on the exact text ----
    function numberNode(el) {
      var w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
      var n;
      while ((n = w.nextNode())) if (/\d/.test(n.nodeValue)) return n;
      return null;
    }
    function fmtLike(sample, v) {
      var dec = (sample.split('.')[1] || '').length;
      var s = Math.abs(v).toFixed(dec);
      if (sample.indexOf(',') >= 0) {
        var p = s.split('.');
        p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        s = p.join('.');
      }
      return (v < 0 ? '-' : '') + s;
    }

    function waitOn(job) { job.el.classList.add('mo-wait'); }
    function show(job) { job.el.classList.remove('mo-wait'); }

    function start(job) {
      show(job);
      job.state = 'run';
      var el = job.el, o = job.opts, dur = job.dur, ez = easing();
      var base = { duration: dur, easing: ez, fill: 'backwards' };
      var kind = job.kind;
      if ((kind === 'rise' || kind === 'grow') && hasTransformAttr(el)) kind = 'fade';
      try {
        if (kind === 'fade') {
          job.anims.push(el.animate([{ opacity: 0 }, { opacity: 1 }], base));
        } else if (kind === 'rise') {
          job.anims.push(el.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }], base));
        } else if (kind === 'draw') {
          var shapes = el.matches && el.matches(GEOM) ? [el] : Array.prototype.slice.call(el.querySelectorAll(GEOM));
          shapes.forEach(function (g) {
            var len = 0;
            try { len = g.getTotalLength(); } catch (e) { len = 0; }
            if (!len) { job.anims.push(g.animate([{ opacity: 0 }, { opacity: 1 }], base)); return; }
            var da = len + 'px ' + len + 'px';
            job.anims.push(g.animate([{ strokeDasharray: da, strokeDashoffset: len + 'px' }, { strokeDasharray: da, strokeDashoffset: '0px' }], base));
          });
        } else if (kind === 'wipe') {
          var from = { left: 'inset(-12% 100% -12% -2%)', right: 'inset(-12% -2% -12% 100%)', top: 'inset(-2% -12% 100% -12%)', bottom: 'inset(100% -12% -2% -12%)' }[o.from] || 'inset(-12% 100% -12% -2%)';
          job.anims.push(el.animate([{ clipPath: from }, { clipPath: 'inset(-12% -2% -12% -2%)' }], base));
        } else if (kind === 'grow') {
          var side = o.from || 'left';
          var horiz = side === 'left' || side === 'right';
          if (isSvg(el)) el.style.transformBox = 'fill-box';
          el.style.transformOrigin = { left: '0% 50%', right: '100% 50%', top: '50% 0%', bottom: '50% 100%' }[side] || '0% 50%';
          job.anims.push(el.animate([{ transform: horiz ? 'scaleX(0)' : 'scaleY(0)' }, { transform: horiz ? 'scaleX(1)' : 'scaleY(1)' }], base));
        } else if (kind === 'light') {
          var kids = Array.prototype.slice.call(el.querySelectorAll('[data-light]'));
          if (!kids.length) kids = Array.prototype.slice.call(el.children);
          var slot = dur / Math.max(1, kids.length);
          kids.forEach(function (k, i) {
            job.anims.push(k.animate([{ opacity: 0 }, { opacity: 1 }], { duration: Math.max(120, slot), delay: i * slot, easing: ez, fill: 'backwards' }));
          });
        } else if (kind === 'keys' && o.keyframes) {
          job.anims.push(el.animate(o.keyframes, base));
        } else if (kind === 'count') {
          var node = numberNode(el);
          var m = node && /-?\d[\d,]*(\.\d+)?/.exec(node.nodeValue);
          if (node && m) {
            var text = node.nodeValue, target = parseFloat(m[0].replace(/,/g, ''));
            var from0 = o.from != null && o.from !== '' ? +o.from : 0;
            var pre = text.slice(0, m.index), post = text.slice(m.index + m[0].length);
            var t0 = performance.now();
            job.finishCount = function () { node.nodeValue = text; };
            var frame = function (t) {
              if (job.state !== 'run') return;
              var k = Math.min(1, (t - t0) / dur);
              var e = 1 - Math.pow(1 - k, 3);
              if (k >= 1) { node.nodeValue = text; done(job); return; }
              node.nodeValue = pre + fmtLike(m[0], from0 + (target - from0) * e) + post;
              job.raf = requestAnimationFrame(frame);
            };
            node.nodeValue = pre + fmtLike(m[0], from0) + post;
            job.raf = requestAnimationFrame(frame);
            job.to = setTimeout(function () { done(job); }, dur + 34);   // frames can stall; the clock cannot
            return;
          }
        }
      } catch (err) {
        console.warn('[demo] motion: ' + job.kind + ' could not run; showing the finished state.', err);
      }
      if (!job.anims.length) { done(job); return; }
      var left = job.anims.length, total = 0;
      job.anims.forEach(function (a) {
        var tm = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming().endTime : dur;
        total = Math.max(total, +tm || dur);
        a.onfinish = a.oncancel = function () { if (--left === 0) done(job); };
      });
      // finish events arrive with the next frame; a timer makes sure the queue moves on even if frames stall
      job.to = setTimeout(function () { done(job); }, total + 34);
    }

    function done(job) {
      if (job.state === 'done') return;
      if (job.to) clearTimeout(job.to);
      if (job.raf) cancelAnimationFrame(job.raf);
      // end on the finished state even if frames stalled (hidden tab, busy laptop)
      job.anims.forEach(function (x) { if (x.playState !== 'finished') { try { x.finish(); } catch (e) { try { x.cancel(); } catch (e2) {} } } });
      job.state = 'done';
      show(job);
      if (job.finishCount) job.finishCount();
      job.resolve();
      pump();
    }

    function finishJob(job) {
      if (job.state === 'done') return;
      if (job.raf) cancelAnimationFrame(job.raf);
      if (job.to) clearTimeout(job.to);
      if (job.state === 'run') job.anims.forEach(function (a) { try { a.finish(); } catch (e) { try { a.cancel(); } catch (e2) {} } });
      job.state = 'done';
      show(job);
      if (job.finishCount) job.finishCount();
      job.resolve();
    }

    function pump() {
      for (var i = 0; i < groups.length; i++) {
        var g = groups[i];
        if (g.state === 'run') {
          if (g.jobs.every(function (j) { return j.state === 'done'; })) { g.state = 'done'; continue; }
          return;
        }
        if (g.state === 'wait') {
          g.state = 'run';
          var d = g.lead || 0;
          var go = function (grp) { return function () { timer = null; grp.jobs.forEach(function (j) { if (j.state === 'wait') start(j); }); }; }(g);
          if (d > 0) timer = setTimeout(go, d); else go();
          return;
        }
      }
    }

    function animate(el, kind, opts) {
      opts = opts || {};
      if (el && typeof el.length === 'number' && !el.nodeType) {   // a list moves as one thing
        var list = Array.prototype.slice.call(el), ps = [];
        list.forEach(function (x, i) { ps.push(animate(x, kind, i ? Object.assign({}, opts, { 'with': true }) : opts)); });
        return Promise.all(ps);
      }
      if (!el || !active || !enabled()) return Promise.resolve();
      if (!DEF[kind]) { console.warn('[demo] motion: unknown kind "' + kind + '"'); return Promise.resolve(); }
      var job = { el: el, kind: kind, opts: opts, anims: [], state: 'wait', dur: kind === 'light' ? clamp(opts.dur || DEF.light) : clamp(opts.dur || DEF[kind]) };
      var p = new Promise(function (res) { job.resolve = res; });
      var last = groups[groups.length - 1];
      if (opts['with'] && last && last.state !== 'done') {
        last.jobs.push(job);
        if (last.state === 'run' && !timer) { start(job); return p; }
      } else {
        groups.push({ jobs: [job], state: 'wait', lead: groups.length ? 0 : lead });
      }
      waitOn(job);
      pump();
      return p;
    }

    function flush() {
      if (timer) { clearTimeout(timer); timer = null; }
      var gs = groups;
      groups = [];
      gs.forEach(function (g) { g.jobs.forEach(finishJob); });
    }

    function enabled() { return HAS_WAAPI && !reduced() && !(typeof allStepsShown === 'function' && allStepsShown()); }

    return {
      animate: animate,
      flush: flush,
      enabled: enabled,
      begin: function (ms) { active = true; lead = ms || 0; },
      end: function () { active = false; lead = 0; },
      get active() { return active; }
    };
  })();

  // Runs the declarative moves (data-anim) for step s of a beat, in data-anim-order, equal orders together.
  function autoMotion(el, s) {
    var all = Array.prototype.slice.call(el.querySelectorAll('[data-anim]'));
    var mine = all.filter(function (n) {
      var k = parseInt(n.getAttribute('data-reveal'), 10) || 1;
      return k === s && !n.closest('.rv-hidden:not([data-anim])');
    });
    mine = mine.map(function (n, i) { return { n: n, i: i, o: parseFloat(n.getAttribute('data-anim-order')) || 0 }; })
      .sort(function (a, b) { return a.o - b.o || a.i - b.i; });
    var prevO = null;
    mine.forEach(function (m) {
      var n = m.n;
      MO.animate(n, n.getAttribute('data-anim'), {
        dur: n.getAttribute('data-anim-dur'),
        from: n.getAttribute('data-anim-from'),
        'with': prevO !== null && m.o === prevO
      });
      prevO = m.o;
    });
  }

  // ---------- timer ----------
  var timer = { started: false, paused: false, t0: 0, pausedAt: 0, pausedTotal: 0, beatT0: 0, beatPausedTotal: 0 };
  function now() { return performance.now(); }
  function elapsed() {
    if (!timer.started) return 0;
    var end = timer.paused ? timer.pausedAt : now();
    return Math.max(0, end - timer.t0 - timer.pausedTotal);
  }
  function beatElapsed() {
    if (!timer.started) return 0;
    var end = timer.paused ? timer.pausedAt : now();
    return Math.max(0, end - timer.beatT0 - timer.beatPausedTotal);
  }
  function startTimerIfIdle() {
    if (timer.started) return;
    timer.started = true; timer.paused = false; timer.t0 = now(); timer.pausedTotal = 0;
    timer.beatT0 = timer.t0; timer.beatPausedTotal = 0;
  }
  function restartTimer() {
    timer.started = true; timer.paused = false; timer.t0 = now(); timer.pausedTotal = 0;
    timer.beatT0 = timer.t0; timer.beatPausedTotal = 0;
  }
  function togglePause() {
    if (!timer.started) { startTimerIfIdle(); return; }
    if (timer.paused) {
      var gap = now() - timer.pausedAt;
      timer.pausedTotal += gap; timer.beatPausedTotal += gap; timer.paused = false;
    } else { timer.paused = true; timer.pausedAt = now(); }
  }
  function fmt(ms) {
    var s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  // ---------- public API ----------
  var booted = false;
  var DEMO = window.DEMO = {
    register: function (beat) {
      if (!beat || !beat.id || typeof beat.render !== 'function') {
        console.warn('[demo] register() needs at least { id, render }. Skipped:', beat);
        return;
      }
      if (byId[beat.id]) {
        console.warn('[demo] beat ' + beat.id + ' registered twice; the later one wins.');
        beats = beats.filter(function (b) { return b.id !== beat.id; });
      }
      beat.order = typeof beat.order === 'number' ? beat.order : beats.length;
      beat.seconds = +beat.seconds || 0;
      beat.steps = Math.max(1, Math.floor(+beat.steps || 1));
      beat.evidence = Array.isArray(beat.evidence) ? beat.evidence : [];
      byId[beat.id] = beat;
      beats.push(beat);
      if (booted) { sortBeats(); buildSections(); buildRail(); }
    },
    missing: function (tag) {
      var src = tag && (tag.getAttribute('src') || tag.src);
      console.info('[demo] skipped a missing file: ' + src + ' (the demo runs without it).');
    },
    go: function (i, s) { show(i, s || 1); },
    motion: { animate: function (el, kind, opts) { return MO.animate(el, kind, opts); }, flush: function () { MO.flush(); }, get enabled() { return MO.enabled(); } },
    get beats() { return beats.slice(); },
    get step() { return step; }
  };
  DEMO._beats = beats; // read by the hover info box

  function sortBeats() { beats.sort(function (a, b) { return a.order - b.order; }); }
  function stepName(b) { return (b && (STEP_NAMES[b.id] || b.kicker || b.title || b.id)) || ''; }

  // ---------- helpers given to beats ----------
  function isNarrow() { return window.innerWidth < 900 || window.innerHeight > window.innerWidth * 1.1; }
  function allStepsShown() { return isNarrow() || (SHOT && shotStep == null); }
  function effectiveStep(b) { return allStepsShown() ? b.steps : Math.min(step, b.steps); }

  function makeCtx(beat, el) {
    return {
      isNarrow: isNarrow(),
      steps: beat.steps,
      // motion (see MOTION in the header)
      get entering() { return MO.active && beats[current] === beat; },
      get motion() { return MO.enabled(); },
      animate: function (node, kind, opts) { return MO.animate(node, kind, opts); },
      reveal: function (node, s, kind, opts) {
        if (!node) return node;
        opts = opts || {};
        node.setAttribute('data-reveal', String(s || 1));
        if (kind) node.setAttribute('data-anim', kind);
        if (opts.order != null) node.setAttribute('data-anim-order', String(opts.order));
        if (opts.dur != null) node.setAttribute('data-anim-dur', String(opts.dur));
        if (opts.from != null) node.setAttribute('data-anim-from', String(opts.from));
        return node;
      },
      refresh: function () { applyStep(beat, false); },
      get step() { return beats[current] === beat ? effectiveStep(beat) : (allStepsShown() ? beat.steps : 1); },
      openEvidence: function (ids) { openDrawer(beat, Array.isArray(ids) ? ids : [ids]); },
      // Resolves a token to a usable value. Colour tokens (light-dark(), color-mix()) come back as rgb()/color()
      // resolved for this section's colour scheme, so they work in SVG attributes and canvas.
      cssVar: function (name) {
        if (name.slice(0, 2) !== '--') name = '--' + name;
        var raw = getComputedStyle(el).getPropertyValue(name).trim();
        if (!raw) return '';
        if (/^(#|rgb|hsl|oklab|oklch|color|light-dark|lab|lch|hwb)/i.test(raw)) {
          var probe = document.createElement('span');
          probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;color:var(' + name + ')';
          el.appendChild(probe);
          var c = getComputedStyle(probe).color;
          el.removeChild(probe);
          return c || raw;
        }
        return raw;
      },
      // A size token (for example '--s-note') in CSS pixels, for canvas and SVG layout.
      px: function (name) {
        if (name.slice(0, 2) !== '--') name = '--' + name;
        var probe = document.createElement('span');
        probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;font-size:var(' + name + ')';
        el.appendChild(probe);
        var v = parseFloat(getComputedStyle(probe).fontSize) || 0;
        el.removeChild(probe);
        return v;
      }
    };
  }

  // ---------- DOM ----------
  var stage, sections = {}, ctxs = {};

  function buildSections() {
    beats.forEach(function (b) {
      if (sections[b.id]) return;
      var sec = document.createElement('section');
      sec.id = 'beat-' + b.id;
      sec.className = 'beat';
      sec.setAttribute('aria-label', stepName(b) + (b.title && b.title !== stepName(b) ? ': ' + b.title : ''));
      stage.appendChild(sec);
      sections[b.id] = sec;
    });
  }

  function loadScript(src) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () { resolve(true); };
      s.onerror = function () { DEMO.missing(s); resolve(false); };
      document.body.appendChild(s);
    });
  }

  function renderBeat(beat, enter) {
    var el = sections[beat.id];
    if (!el) return;
    var go = function () {
      el.innerHTML = '';
      el.classList.remove('on-dark');
      var ctx = makeCtx(beat, el);
      ctxs[beat.id] = ctx;
      try {
        beat.render(el, ctx);
      } catch (err) {
        console.error('[demo] beat ' + beat.id + ' failed to render:', err);
        el.innerHTML = '';
        var box = document.createElement('div');
        box.className = 'beat-error';
        box.textContent = stepName(beat) + ': this screen could not draw. Press the right arrow to continue.';
        el.appendChild(box);
      }
      rendered[beat.id] = true;
      applyStep(beat, enter);
      syncChromeScheme();
    };
    var files = (beat.dataFiles || []).filter(function (f) { return !extraLoaded[f]; });
    if (!files.length) { go(); return; }
    Promise.all(files.map(function (f) { extraLoaded[f] = true; return loadScript(f); })).then(go);
  }

  // Shows the layers for the current step: data-reveal elements automatically, then the beat's own onStep.
  // enter = true only for a forward click onto this step: then the step's moves play (MOTION in the header).
  function applyStep(beat, enter) {
    var el = sections[beat.id];
    if (!el || !rendered[beat.id]) return;
    MO.flush();                                     // a click during a move finishes it first
    var isCur = beats[current] === beat;
    var s = isCur ? effectiveStep(beat) : (allStepsShown() ? beat.steps : 1);
    el.setAttribute('data-step', String(s));
    var layers = el.querySelectorAll('[data-reveal]');
    for (var k = 0; k < layers.length; k++) {
      var need = parseInt(layers[k].getAttribute('data-reveal'), 10) || 1;
      layers[k].classList.toggle('rv-hidden', need > s);
    }
    var play = !!enter && isCur && MO.enabled();
    // arriving on a screen: wait for the crossfade; a click inside a screen: start at once
    if (play) MO.begin(s === 1 ? (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dur-2')) || 240) + 40 : 0);
    try {
      if (play) autoMotion(el, s);
      if (typeof beat.onStep === 'function') {
        try { beat.onStep(el, s, ctxs[beat.id]); } catch (err) { console.error('[demo] onStep failed on ' + beat.id + ':', err); }
      }
    } finally { MO.end(); }
  }

  function syncChromeScheme() {
    var b = beats[current];
    var el = b && sections[b.id];
    document.getElementById('chrome').classList.toggle('on-dark', !!(el && el.classList.contains('on-dark')));
  }

  function show(i, s, opts) {
    if (!beats.length) return;
    opts = opts || {};
    i = Math.max(0, Math.min(beats.length - 1, i));
    var changed = i !== current;
    if (changed && current >= 0 && timer.started) {
      timer.beatT0 = timer.paused ? timer.pausedAt : now();
      timer.beatPausedTotal = 0;
    }
    current = i;
    var beat = beats[i];
    step = s === 'last' ? beat.steps : Math.max(1, Math.min(beat.steps, +s || 1));
    if (!rendered[beat.id]) renderBeat(beat, opts.enter); else applyStep(beat, opts.enter);
    beats.forEach(function (b) {
      var sec = sections[b.id];
      if (!sec) return;
      var on = b === beat;
      sec.classList.toggle('is-current', on);
      sec.setAttribute('aria-hidden', on ? 'false' : 'true');
      if ('inert' in sec) sec.inert = !on;
    });
    syncChromeScheme();
    var h = '#' + beat.id + (step > 1 ? '.' + step : '');
    if (!opts.fromHash && location.hash !== h) {
      try { history.replaceState(null, '', h); } catch (e) { location.hash = h.slice(1); }
    }
    updateRail();
    fillNotes();
    fillPresenter();
    updatePill();
    if (!drawer.hidden && changed) openDrawer(beat, []);
    if (!opts.remote) broadcast();
    tick();
  }

  // ---------- step rail, sources pill, timer ----------
  var totalBudget = 0;
  var CHECK_SVG = '<svg class="chk-mark" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function buildRail() {
    var ol = document.getElementById('steps');
    ol.innerHTML = '';
    totalBudget = beats.reduce(function (sum, b) { return sum + (b.seconds || 0); }, 0);
    beats.forEach(function (b, k) {
      var li = document.createElement('li');
      li.style.display = 'contents';
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rs';
      btn.setAttribute('data-i', String(k));
      btn.innerHTML = '<span class="rs-check"></span><span class="rs-name"></span><span class="rs-dots"></span><span class="rs-bar"><i></i></span>';
      btn.querySelector('.rs-name').textContent = stepName(b);
      btn.addEventListener('click', function () { show(k, 1); });
      li.appendChild(btn);
      ol.appendChild(li);
    });
  }

  function dotsHtml(b, s) {
    if (b.steps < 2) return '';
    var out = '';
    for (var k = 1; k <= b.steps; k++) out += '<i class="' + (k <= s ? 'on' : '') + '"></i>';
    return out;
  }

  function updateRail() {
    var beat = beats[current];
    var s = effectiveStep(beat);
    var btns = document.querySelectorAll('#steps .rs');
    btns.forEach(function (btn, k) {
      var b = beats[k];
      btn.classList.toggle('done', k < current);
      btn.classList.toggle('now', k === current);
      if (k === current) btn.setAttribute('aria-current', 'step'); else btn.removeAttribute('aria-current');
      btn.querySelector('.rs-check').innerHTML = k < current ? CHECK_SVG : '';
      btn.querySelector('.rs-dots').innerHTML = k === current ? dotsHtml(b, s) : '';
      btn.title = stepName(b) + ((b.seconds) ? ' (' + b.seconds + ' s)' : '');
    });
    var rc = document.getElementById('rail-compact');
    rc.innerHTML = '<span></span><span class="rc-of"></span><span class="rs-dots"></span>';
    rc.children[0].textContent = (current + 1) + ' of ' + beats.length;
    rc.children[1].textContent = '· ' + stepName(beat);
    rc.children[2].innerHTML = dotsHtml(beat, s);
  }

  function updatePill() {
    var beat = beats[current];
    var n = beat.evidence.length;
    document.getElementById('pill-count').textContent = n ? n + (n === 1 ? ' source' : ' sources') : '';
    document.getElementById('pill').setAttribute('aria-label', 'Sources and details for this screen' + (n ? ', ' + n + ' items' : '') + ' (E)');
  }

  function tick() {
    if (current < 0) return;
    var beat = beats[current];
    var over = timer.started && elapsed() > totalBudget * 1000;
    var clock = document.getElementById('clock');
    clock.textContent = timer.paused && timer.started ? fmt(elapsed()) + ' paused' : fmt(elapsed()) + ' / ' + fmt(totalBudget * 1000);
    clock.classList.toggle('over', over);
    var be = beatElapsed() / 1000;
    var fill = document.querySelector('#steps .rs.now .rs-bar > i');
    if (fill) fill.style.width = (!timer.started ? 0 : beat.seconds ? Math.min(100, (be / beat.seconds) * 100) : 100) + '%';
    if (presenterOn) {
      var pc = document.getElementById('pv-clock');
      pc.firstChild.nodeValue = fmt(elapsed()) + (timer.paused && timer.started ? ' paused' : '');
      pc.classList.toggle('over', over);
      var pb = document.getElementById('pv-beat');
      pb.textContent = Math.floor(be) + ' / ' + (beat.seconds || 0) + ' s on this screen';
      pb.classList.toggle('over', !!(timer.started && beat.seconds && be > beat.seconds));
    }
  }

  // ---------- notes panel (N) ----------
  var notesEl, drawer, helpEl;
  function fillNotes() {
    var b = beats[current];
    if (!b) return;
    document.getElementById('notes-title').textContent = stepName(b) + (b.steps > 1 ? '  (step ' + effectiveStep(b) + ' of ' + b.steps + ')' : '');
    document.getElementById('notes-budget').textContent = (b.seconds || 0) + ' s';
    document.getElementById('notes-body').textContent = b.notes || 'No notes for this screen.';
  }
  function toggleNotes(force) {
    notesEl.hidden = typeof force === 'boolean' ? !force : !notesEl.hidden;
    try { localStorage.setItem('demo.notes', notesEl.hidden ? '0' : '1'); } catch (e) {}
  }

  // ---------- presenter view (V) ----------
  var presenterOn = false;
  function setPresenter(on) {
    presenterOn = !!on;
    document.body.classList.toggle('presenter', presenterOn);
    fillPresenter();
    tick();
  }
  function fillPresenter() {
    if (!presenterOn || current < 0) return;
    var b = beats[current];
    var s = effectiveStep(b);
    document.getElementById('pv-pos').textContent = 'Screen ' + (current + 1) + ' of ' + beats.length + (b.steps > 1 ? ', click ' + s + ' of ' + b.steps : '');
    document.getElementById('pv-now').textContent = stepName(b);
    var say = (Array.isArray(b.stepNotes) && b.stepNotes[s - 1]) || b.notes || 'No notes for this screen.';
    document.getElementById('pv-say').textContent = say;
    var ol = document.getElementById('pv-clicks');
    ol.innerHTML = '';
    for (var k = 1; k <= b.steps; k++) {
      var li = document.createElement('li');
      li.textContent = (Array.isArray(b.stepLabels) && b.stepLabels[k - 1]) || (k === 1 ? 'Arrive on the screen' : 'Reveal step ' + k);
      li.className = k < s ? 'done' : k === s ? 'now' : '';
      ol.appendChild(li);
    }
    var nb = beats[current + 1];
    document.getElementById('pv-next').textContent = s < b.steps ? 'Next click stays here: ' + ((Array.isArray(b.stepLabels) && b.stepLabels[s]) || 'reveal step ' + (s + 1)) + '.' : nb ? 'Next click: ' + stepName(nb) + ' (' + (nb.seconds || 0) + ' s)' : 'This is the last screen. Stop at 3:00.';
    var ul = document.getElementById('pv-ev');
    ul.innerHTML = '';
    b.evidence.forEach(function (ev) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      var v = document.createElement('b'); v.textContent = ev.value == null ? '' : String(ev.value);
      btn.appendChild(v);
      btn.appendChild(document.createTextNode(': ' + (ev.claim || '')));
      btn.addEventListener('click', function () { openDrawer(b, [ev.id]); });
      li.appendChild(btn);
      ul.appendChild(li);
    });
    if (!b.evidence.length) ul.innerHTML = '<li>No numbers on this screen.</li>';
  }

  // ---------- sources drawer (E) ----------
  function findEvidence(id) {
    for (var i = 0; i < beats.length; i++) {
      var ev = beats[i].evidence;
      for (var j = 0; j < ev.length; j++) if (ev[j].id === id) return { beat: beats[i], index: i, item: ev[j] };
    }
    return null;
  }
  function evItem(ev, ids) {
    var li = document.createElement('li');
    li.id = 'ev-' + ev.id;
    var check = String(ev.check || 'approximate').toLowerCase();
    var top = document.createElement('div'); top.className = 'ev-top';
    var val = document.createElement('span'); val.className = 'ev-value'; val.textContent = ev.value == null ? '' : String(ev.value);
    top.appendChild(val);
    if (check !== 'none') {
      if (!/^(official|verified|approximate)$/.test(check)) check = 'approximate';
      var chk = document.createElement('span'); chk.className = 'chk chk-' + check; chk.textContent = check;
      top.appendChild(chk);
    }
    li.appendChild(top);
    var claim = document.createElement('div'); claim.className = 'ev-claim'; claim.textContent = ev.claim || '';
    li.appendChild(claim);
    var src = document.createElement('div'); src.className = 'ev-source'; src.textContent = 'Source: ' + (ev.source || 'not given');
    li.appendChild(src);
    if (ev.receipt) {
      var rc = document.createElement('div'); rc.className = 'ev-receipt'; rc.textContent = ev.receipt;
      li.appendChild(rc);
    }
    if (ids.indexOf(ev.id) >= 0) li.classList.add('hit');
    return li;
  }
  function section(title) {
    var h = document.createElement('h3'); h.textContent = title; return h;
  }
  function openDrawer(beat, ids) {
    ids = ids || [];
    if (ids.length) {
      var hit = findEvidence(ids[0]);
      if (hit) beat = hit.beat;
      else console.warn('[demo] evidence id not found: ' + ids.join(', '));
    }
    beat = beat || beats[current];
    document.getElementById('drawer-title').textContent = stepName(beat);
    var body = document.getElementById('drawer-body');
    body.innerHTML = '';
    var on = beat.evidence.filter(function (ev) { return !ev.offscreen; });
    var off = beat.evidence.filter(function (ev) { return ev.offscreen; });
    body.appendChild(section('On this screen'));
    var ul = document.createElement('ol'); ul.className = 'ev-list';
    if (!on.length) { var e0 = document.createElement('li'); e0.className = 'ev-empty'; e0.textContent = 'No numbers on this screen.'; ul.appendChild(e0); }
    on.forEach(function (ev) { ul.appendChild(evItem(ev, ids)); });
    body.appendChild(ul);
    if (off.length) {
      body.appendChild(section('More in the data'));
      var ul2 = document.createElement('ol'); ul2.className = 'ev-list';
      off.forEach(function (ev) { ul2.appendChild(evItem(ev, ids)); });
      body.appendChild(ul2);
    }
    var gl = Array.isArray(beat.glossary) ? beat.glossary : [];
    if (gl.length) {
      body.appendChild(section('Words used here'));
      var dl = document.createElement('dl'); dl.className = 'gl-list';
      gl.forEach(function (g) {
        var term = Array.isArray(g) ? g[0] : g.term;
        var def = Array.isArray(g) ? g[1] : (g.def || g.plain || g.text || g.desc || '');
        var dt = document.createElement('dt'); dt.textContent = term || '';
        var dd = document.createElement('dd'); dd.textContent = def;
        dl.appendChild(dt); dl.appendChild(dd);
      });
      body.appendChild(dl);
    }
    drawer.hidden = false;
    document.getElementById('pill').setAttribute('aria-pressed', 'true');
    var first = body.querySelector('li.hit');
    if (first) first.scrollIntoView({ block: 'center' });
    else drawer.scrollTop = 0;
  }
  function closeDrawer() {
    drawer.hidden = true;
    document.getElementById('pill').setAttribute('aria-pressed', 'false');
  }
  function toggleDrawer() { drawer.hidden ? openDrawer(beats[current], []) : closeDrawer(); }

  // ---------- sync between an audience window and a presenter window ----------
  var WIN = Math.random().toString(36).slice(2);
  var chan = null;
  try { chan = new BroadcastChannel('demo'); chan.onmessage = function (m) { receive(m.data); }; } catch (e) { chan = null; }
  function broadcast() {
    if (SHOT) return;
    var msg = { from: WIN, i: current, s: step, pv: presenterOn, ts: Date.now() };
    try { if (chan) chan.postMessage(msg); } catch (e) {}
    try { localStorage.setItem('demo.pos', JSON.stringify(msg)); } catch (e) {}
  }
  var lastTs = 0;
  function receive(msg) {
    if (SHOT || !msg || msg.from === WIN || typeof msg.i !== 'number' || msg.ts <= lastTs) return;
    if (!msg.pv && !presenterOn) return;   // only an audience window and a presenter window follow each other
    lastTs = msg.ts;
    // the other window moved forward by exactly one click: play the same moves here
    var cb = beats[current];
    var fwd = (msg.i === current && msg.s === step + 1) || (msg.i === current + 1 && msg.s === 1 && cb && step >= cb.steps);
    if (msg.i !== current || msg.s !== step) show(msg.i, msg.s, { remote: true, enter: fwd });
  }
  window.addEventListener('storage', function (e) {
    if (e.key !== 'demo.pos' || !e.newValue) return;
    try { receive(JSON.parse(e.newValue)); } catch (err) {}
  });

  // ---------- input ----------
  function next() {
    startTimerIfIdle();
    var b = beats[current];
    if (!allStepsShown() && step < b.steps) { step++; applyStep(b, true); afterStep(); }
    else if (current < beats.length - 1) show(current + 1, 1, { enter: true });
  }
  function prev() {
    var b = beats[current];
    if (!allStepsShown() && step > 1) { step--; applyStep(b, false); afterStep(); }
    else if (current > 0) show(current - 1, 'last');
  }
  function afterStep() {
    var b = beats[current];
    var h = '#' + b.id + (step > 1 ? '.' + step : '');
    try { history.replaceState(null, '', h); } catch (e) {}
    updateRail(); fillNotes(); fillPresenter(); broadcast(); tick();
  }

  function onKey(e) {
    if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
    var t = e.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    var k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown' || (k === ' ' && !(t && t.tagName === 'BUTTON'))) { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); prev(); }
    else if (k === 'Home') { e.preventDefault(); show(0, 1); }
    else if (k === 'End') { e.preventDefault(); show(beats.length - 1, 1); }
    else if (/^[1-9]$/.test(k) && +k <= beats.length) { show(+k - 1, 1); }
    else if (k === 'n' || k === 'N') { toggleNotes(); }
    else if (k === 'e' || k === 'E') { toggleDrawer(); }
    else if (k === 'v' || k === 'V') { setPresenter(!presenterOn); }
    else if (k === '?') { helpEl.hidden = !helpEl.hidden; }
    else if (k === 'Escape') { closeDrawer(); toggleNotes(false); helpEl.hidden = true; }
    else if (k === 'p' || k === 'P') { togglePause(); tick(); }
    else if (k === 't' || k === 'T') { restartTimer(); tick(); }
  }

  function parseHash() {
    var m = /^#?([^.]+)(?:\.(\d+))?$/.exec(location.hash || '');
    if (!m) return null;
    return { id: m[1], step: m[2] ? parseInt(m[2], 10) : null };
  }
  function onHash() {
    var h = parseHash();
    if (!h) return;
    if (SHOT) shotStep = h.step;
    for (var i = 0; i < beats.length; i++) if (beats[i].id === h.id) {
      if (i === current && (h.step || 1) === step) return;
      show(i, h.step || 1, { fromHash: true }); return;
    }
  }

  var touchX = null, touchY = null;
  function onTouchStart(e) { if (e.touches.length === 1) { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; } }
  function onTouchEnd(e) {
    if (touchX == null) return;
    var dx = e.changedTouches[0].clientX - touchX, dy = e.changedTouches[0].clientY - touchY;
    touchX = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { dx < 0 ? next() : prev(); }
  }

  // Redraw on a real size change (charts are drawn to the pixel) and on a system theme change.
  function redrawAll() {
    rendered = {};
    if (beats[current]) renderBeat(beats[current]);
  }
  var resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var n = isNarrow();
      document.body.classList.toggle('narrow', n);
      var size = window.innerWidth + 'x' + window.innerHeight;
      if (n !== lastNarrow || size !== lastSize) {
        lastNarrow = n; lastSize = size;
        redrawAll();
        updateRail();
      }
    }, 200);
  }

  // ---------- boot ----------
  function boot() {
    booted = true;
    stage = document.getElementById('stage');
    notesEl = document.getElementById('notes');
    drawer = document.getElementById('drawer');
    helpEl = document.getElementById('help');
    if (SHOT) document.body.classList.add('shot');
    if (params.get('clock') === '0') document.body.classList.add('no-clock');
    lastNarrow = isNarrow();
    lastSize = window.innerWidth + 'x' + window.innerHeight;
    document.body.classList.toggle('narrow', lastNarrow);
    sortBeats();
    if (!beats.length) {
      stage.innerHTML = '<section class="beat is-current"><p class="beat-error">No screens loaded. Check that the beats folder sits next to index.html.</p></section>';
      return;
    }
    console.info('[demo] beats loaded: ' + beats.map(function (b) { return b.id + (b.steps > 1 ? '(' + b.steps + ')' : ''); }).join(', '));
    buildSections();
    buildRail();

    document.addEventListener('keydown', onKey);
    window.addEventListener('hashchange', onHash);
    window.addEventListener('resize', onResize);
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    document.getElementById('btn-prev').addEventListener('click', prev);
    document.getElementById('btn-next').addEventListener('click', next);
    document.getElementById('pill').addEventListener('click', toggleDrawer);
    document.getElementById('drawer-close').addEventListener('click', closeDrawer);
    document.getElementById('clock').addEventListener('click', function () { togglePause(); tick(); });
    try {
      matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
        if (!document.documentElement.hasAttribute('data-theme')) redrawAll();
      });
    } catch (e) {}

    var wantNotes = params.get('notes') === '1';
    try { if (localStorage.getItem('demo.notes') === '1') wantNotes = true; } catch (e) {}
    if (wantNotes && !SHOT) toggleNotes(true);
    if (params.get('view') === 'presenter' && !SHOT) setPresenter(true);

    var start = 0, startStep = 1;
    var h = parseHash();
    var id = (h && h.id) || params.get('beat') || '';
    beats.forEach(function (b, i) { if (b.id === id) start = i; });
    if (h && h.step) startStep = h.step;
    if (SHOT && h && h.step) shotStep = h.step;
    show(start, startStep, { fromHash: true });

    var evParam = params.get('ev');
    if (evParam && !SHOT) {
      var hit = findEvidence(evParam);
      if (hit) { show(hit.index, 'last'); openDrawer(hit.beat, [evParam]); }
    }

    // One-time ring on the sources pill, so the audience learns sources exist.
    if (!SHOT && !reduceMotion) {
      var seen = false;
      try { seen = localStorage.getItem('demo.pillSeen') === '1'; } catch (e) {}
      if (!seen) {
        var pill = document.getElementById('pill');
        setTimeout(function () { pill.classList.add('ring'); }, 400);
        setTimeout(function () { pill.classList.remove('ring'); }, 2400);
        try { localStorage.setItem('demo.pillSeen', '1'); } catch (e) {}
      }
    }
    setInterval(tick, 250);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 0);
})();

/* ---- Hover info box (Alex 14:09): hovering any element with data-ev shows its source and data in a small
   box beside the cursor; clicking still opens the full sources drawer. Off on touch devices and in ?shot=1. ---- */
(function () {
  if (/[?&]shot=1/.test(location.search)) return;
  if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;
  var tip = document.createElement('div');
  tip.id = 'ev-tip';
  tip.setAttribute('role', 'tooltip');
  if (document.body) document.body.appendChild(tip); else document.addEventListener('DOMContentLoaded', function () { document.body.appendChild(tip); });
  var cur = null;
  function short(t, n) { t = String(t || ''); if (t.length <= n) return t; var cut = t.lastIndexOf('. ', n); return (cut > 80 ? t.slice(0, cut + 1) : t.slice(0, n).replace(/\s+\S*$/, '') + '…'); }
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var CHECK = { official: 'Official source', verified: 'Re-checked by our verifier', approximate: 'Approximate', none: 'Not independently checked' };
  function items(ids) {
    var out = [];
    (window.DEMO && window.DEMO._beats ? window.DEMO._beats : []).forEach(function (b) {
      (b.evidence || []).forEach(function (ev) { if (ids.indexOf(ev.id) >= 0) out.push(ev); });
    });
    return out;
  }
  function show(node, x, y) {
    var ids = (node.getAttribute('data-ev') || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var evs = items(ids);
    if (!evs.length) { hide(); return; }
    tip.innerHTML = evs.slice(0, 2).map(function (ev) {
      return '<div class="ev-tip-item">' +
        (ev.value ? '<div class="ev-tip-v">' + esc(ev.value) + '</div>' : '') +
        '<div class="ev-tip-c">' + esc(short(ev.claim, 240)) + '</div>' +
        '<div class="ev-tip-s"><b>Source:</b> ' + esc(ev.source) + (ev.check ? ' <span class="ev-tip-k">' + esc(CHECK[ev.check] || ev.check) + '</span>' : '') + '</div>' +
        '</div>';
    }).join('') + (evs.length > 2 ? '<div class="ev-tip-more">+' + (evs.length - 2) + ' more: click for all sources</div>' : '<div class="ev-tip-more">Click for full sources</div>');
    tip.classList.add('on');
    place(x, y);
  }
  function place(x, y) {
    var w = tip.offsetWidth, h = tip.offsetHeight, vw = window.innerWidth, vh = window.innerHeight;
    var left = x + 18, top = y + 18;
    if (left + w > vw - 12) left = Math.max(12, x - w - 18);
    if (top + h > vh - 12) top = Math.max(12, y - h - 18);
    tip.style.left = left + 'px'; tip.style.top = top + 'px';
  }
  function hide() { tip.classList.remove('on'); cur = null; }
  document.addEventListener('mouseover', function (e) {
    var n = e.target.closest ? e.target.closest('[data-ev]') : null;
    if (!n) { if (cur) hide(); return; }
    if (n !== cur) { cur = n; show(n, e.clientX, e.clientY); }
  });
  document.addEventListener('mousemove', function (e) { if (cur) place(e.clientX, e.clientY); });
  document.addEventListener('focusin', function (e) {
    var n = e.target.closest ? e.target.closest('[data-ev]') : null;
    if (n) { var r = n.getBoundingClientRect(); cur = n; show(n, r.right, r.bottom); }
  });
  document.addEventListener('focusout', hide);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hide(); });
  document.addEventListener('click', hide, true);
})();
