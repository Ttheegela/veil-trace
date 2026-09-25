/* Beat 1 "New routes": after Feb 2022, chips kept reaching Russia through new departure countries.
   One point (V3_PLAN section 1, b1): after the invasion, chips kept reaching Russia, sent through countries
   that had not sent them before.
   Reading order (DESIGN_SPEC.md, section 1): idea, what you're looking at, one hero timeline,
   one big number, why it matters. Everything else lives in the evidence drawer (key E).
   Two clicks, motion through the shell's data-reveal / data-anim attributes (shell.js MOTION):
   step 1 (arrive) = the invasion line drops (wipe from top, with its label), then the three new-country bars grow
     from their start dates, then their shipment labels and the "New senders start" note fade in;
   step 2 = the hatched "records start in 2022" zone fades in, then $13.5 million counts up from zero.
   "45 of 1,147" moved to the drawer in v3 (b1-e8, offscreen).
   Data: window.DEMO_DATA.b1 (data/b1_routes.js). Colours are tokens only, applied through CSS classes,
   so the chart follows light and dark themes without a redraw. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var STEPS = 2;

  var CSS = [
    /* Scale: spec 3.2 sizes, with fallbacks in case app.css does not define them yet. */
    '#beat-b1{--b1-idea:var(--s-idea,6.3vh);--b1-num:var(--s-num,9.6vh);--b1-unit:var(--s-unit,4.1vh);--b1-line:var(--s-line,2.8vh);--b1-body:var(--s-body,2.6vh);--b1-min:var(--s-min,2.05vh);--b1-u:var(--u,.74vh);',
    '  --b1-slate:color-mix(in oklab,var(--fg) 28%,var(--bg));--b1-slate-2:color-mix(in oklab,var(--fg) 18%,var(--bg))}',
    '@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) #beat-b1{--b1-slate:color-mix(in oklab,var(--fg) 34%,var(--bg));--b1-slate-2:color-mix(in oklab,var(--fg) 22%,var(--bg))}}',
    ':root[data-theme="dark"] #beat-b1{--b1-slate:color-mix(in oklab,var(--fg) 34%,var(--bg));--b1-slate-2:color-mix(in oklab,var(--fg) 22%,var(--bg))}',
    '#beat-b1 .b1{box-sizing:border-box;width:100%;height:100%;display:flex;flex-direction:column;color:var(--fg);font-family:var(--font-sans);overflow:hidden}',
    '#beat-b1 .b1-kicker{font:600 var(--b1-min)/1.2 var(--font-sans);letter-spacing:.08em;text-transform:uppercase;color:var(--muted-fg);margin:0 0 calc(var(--b1-u)*1)}',
    '#beat-b1 h1{font:var(--display-weight,600) var(--b1-idea)/1.08 var(--font-display,var(--font-sans));letter-spacing:var(--display-tracking,-.02em);margin:0;max-width:83%;text-wrap:balance}',
    '#beat-b1 .b1-explain{font-size:var(--b1-line);line-height:1.3;color:var(--fg);margin:calc(var(--b1-u)*2) 0 0;max-width:83%}',
    '#beat-b1 .b1-lab{display:inline-block;font:600 var(--b1-min)/1 var(--font-sans);letter-spacing:.08em;text-transform:uppercase;color:var(--muted-fg);margin-right:.7em;vertical-align:.12em}',
    '#beat-b1 .b1-main{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:7fr 5fr;column-gap:calc(var(--b1-u)*6);margin-top:calc(var(--b1-u)*4)}',
    '#beat-b1 .b1-hero{min-width:0;min-height:0;display:flex;align-items:center}',
    '#beat-b1 .b1-hero svg{display:block;width:100%;height:100%;max-height:100%;overflow:visible}',
    '#beat-b1 .b1-nums{display:flex;flex-direction:column;justify-content:center;gap:calc(var(--b1-u)*4);min-width:0}',
    '#beat-b1 .b1-numblock{display:block;text-align:left}',
    '#beat-b1 button.b1-numbtn{all:unset;display:block;cursor:pointer;border-radius:var(--radius-control,var(--radius))}',
    '#beat-b1 button.b1-numbtn:hover .b1-big,#beat-b1 button.b1-numbtn:focus-visible .b1-big{text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:.08em}',
    '#beat-b1 button.b1-numbtn:focus-visible{outline:3px solid var(--accent);outline-offset:6px}',
    '#beat-b1 .b1-numlab{font:600 var(--b1-min)/1.2 var(--font-sans);letter-spacing:.08em;text-transform:uppercase;color:var(--muted-fg);margin:0}',
    '#beat-b1 .b1-big{font:var(--display-weight,600) var(--b1-num)/1 var(--font-display,var(--font-sans));letter-spacing:-.02em;font-variant-numeric:tabular-nums lining-nums;color:var(--fg);margin:calc(var(--b1-u)*1) 0 calc(var(--b1-u)*1.5);white-space:nowrap}',
    '#beat-b1 .b1-big small{font-size:var(--b1-unit);font-weight:500;letter-spacing:0;margin-left:.25em}',
    '#beat-b1 .b1-cap{font-size:var(--b1-body);line-height:1.3;color:var(--fg);margin:0}',
    '#beat-b1 .b1-why{margin:calc(var(--b1-u)*4) 0 0;padding-top:calc(var(--b1-u)*2);border-top:1px solid color-mix(in oklab,var(--border) 60%,transparent);font-size:var(--b1-line);line-height:1.3}',
    /* SVG marks. Blue = the new doors only. Slate = context. Dashed / hatched = less certain. */
    '#beat-b1 .t-lab{fill:var(--fg);font-family:var(--font-sans);font-weight:500}',
    '#beat-b1 .t-strong{fill:var(--fg);font-family:var(--font-sans);font-weight:600}',
    '#beat-b1 .t-mut{fill:var(--muted-fg);font-family:var(--font-sans);font-weight:500}',
    '#beat-b1 .t-cap{fill:var(--muted-fg);font-family:var(--font-sans);font-weight:600;letter-spacing:.08em}',
    '#beat-b1 .t-acc{fill:var(--accent);font-family:var(--font-sans);font-weight:600;letter-spacing:.08em}',
    '#beat-b1 .t-halo{paint-order:stroke;stroke:var(--bg);stroke-width:8px;stroke-linejoin:round}',
    '#beat-b1 .m-new{fill:var(--accent)}',
    '#beat-b1 .m-old{fill:var(--b1-slate)}',
    '#beat-b1 .m-axis{stroke:color-mix(in oklab,var(--border) 60%,transparent);stroke-width:1}',
    '#beat-b1 .m-year{stroke:color-mix(in oklab,var(--border) 30%,transparent);stroke-width:1}',
    '#beat-b1 .m-inv{stroke:color-mix(in oklab,var(--fg) 60%,transparent);stroke-width:1.5;stroke-dasharray:2 5;stroke-linecap:round}',
    '#beat-b1 .m-lead{stroke:color-mix(in oklab,var(--fg) 55%,transparent);stroke-width:1.5;fill:none}',
    '#beat-b1 .m-dot{fill:color-mix(in oklab,var(--fg) 70%,transparent)}',
    '#beat-b1 .m-hatch-line{stroke:var(--fg);stroke-width:2;opacity:.14}',
    '#beat-b1 .m-zone-edge{fill:none;stroke:color-mix(in oklab,var(--fg) 45%,transparent);stroke-width:1.5;stroke-dasharray:6 5}',
    '#beat-b1 .b1-hit{cursor:pointer;outline:none}',
    '#beat-b1 .b1-hit:hover .u,#beat-b1 .b1-hit:focus-visible .u{text-decoration:underline;text-decoration-thickness:2px}',
    '#beat-b1 .b1-hit:focus-visible .hitbox{stroke:var(--accent);stroke-width:3}',
    '#beat-b1 .hitbox{fill:transparent;stroke:none}',
    '#beat-b1 .b1-notes{display:none}',
    /* Narrow (phone): scroll, stack, rem sizes, every step visible, notes listed under the chart. */
    'body.narrow #beat-b1 .b1,#beat-b1.b1-narrow .b1{height:auto;min-height:100%;overflow:visible}',
    '#beat-b1.b1-narrow h1{font-size:1.75rem;max-width:none}',
    '#beat-b1.b1-narrow .b1-kicker,#beat-b1.b1-narrow .b1-lab,#beat-b1.b1-narrow .b1-numlab{font-size:.8rem}',
    '#beat-b1.b1-narrow .b1-explain,#beat-b1.b1-narrow .b1-why,#beat-b1.b1-narrow .b1-cap{font-size:1.06rem;max-width:none}',
    '#beat-b1.b1-narrow .b1-main{display:block;margin-top:20px}',
    '#beat-b1.b1-narrow .b1-hero{display:block}',
    '#beat-b1.b1-narrow .b1-hero svg{height:auto}',
    '#beat-b1.b1-narrow .b1-nums{gap:24px;margin-top:20px}',
    '#beat-b1.b1-narrow .b1-big{font-size:2.75rem}',
    '#beat-b1.b1-narrow .b1-big small{font-size:1.2rem}',
    '#beat-b1.b1-narrow .b1-notes{display:block;margin:12px 0 0;padding-left:1.4em;font-size:1rem;line-height:1.35;color:var(--fg)}',
    '#beat-b1.b1-narrow .b1-notes li{margin:0 0 6px}',
    '#beat-b1.b1-narrow .b1-why{margin-top:24px}',
    '#beat-b1.b1-narrow .b1-srcbtn{all:unset;display:block;box-sizing:border-box;width:100%;min-height:44px;margin:20px 0 8px;padding:12px 16px;text-align:center;border:1px solid var(--border);border-radius:var(--radius-control,var(--radius));font-weight:600;cursor:pointer}',
    '#beat-b1 .b1-srcbtn{display:none}'
  ].join('\n');

  function fmtInt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function t(iso) { return Date.parse(iso + 'T00:00:00Z'); }

  function mk(tag, attrs, parent, text) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) if (Object.prototype.hasOwnProperty.call(attrs, k)) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }
  function hit(parent, ev, label) {
    return mk('g', { 'class': 'b1-hit', 'data-ev': ev, tabindex: '0', role: 'button', 'aria-label': label }, parent);
  }
  function el_(tag, cls, parent, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    if (parent) parent.appendChild(n);
    return n;
  }
  function hatch(defs, id) {
    var p = mk('pattern', { id: id, patternUnits: 'userSpaceOnUse', width: 12, height: 12, patternTransform: 'rotate(45)' }, defs);
    mk('line', { x1: 0, y1: 0, x2: 0, y2: 12, 'class': 'm-hatch-line' }, p);
  }

  /* The hero: "doors opening" timeline. Projector layout, viewBox units are about 1 px at 1920x1080. */
  function drawTimeline(D) {
    var W = 1000, H = 560, x0 = 180, x1 = 740;
    var svg = mk('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'xMinYMid meet', role: 'img',
      'aria-label': 'Timeline, 2019 to 2024. Chip shipments to Russia from Kyrgyzstan, the UAE and Kazakhstan begin only in April and May 2022, after the invasion. Germany and Turkey appear from 2019.' });
    var defs = mk('defs', {}, svg);
    hatch(defs, 'b1-hatch');
    var a = t(D.axis.from), b = t(D.axis.to);
    function X(iso) { return x0 + (t(iso) - a) / (b - a) * (x1 - x0); }
    var yAxis = 500, rowsNew = [150, 225, 300], rowsOld = [430, 468];

    // Year boundaries and ticks (timelines may keep year lines, same weight as gridlines).
    for (var y = 2019; y <= 2025; y++) {
      var gx = X(y + '-01-01');
      mk('line', { x1: gx, x2: gx, y1: 110, y2: yAxis, 'class': 'm-year' }, svg);
      if (y < 2025) mk('text', { x: X(y + '-07-01'), y: yAxis + 34, 'text-anchor': 'middle', 'class': 't-mut', 'font-size': 24 }, svg, String(y));
    }
    mk('line', { x1: x0, x2: x1, y1: yAxis, y2: yAxis, 'class': 'm-axis' }, svg);

    // Step 2 layer, drawn first so bars sit on top: the "records start in 2022" zone over 2019 to 2021.
    var zx0 = X('2019-01-01'), zx1 = X('2022-01-01'), zy0 = rowsNew[0] - 34, zy1 = rowsNew[2] + 34;
    var zone = mk('g', { 'class': 'b1-zone', 'data-reveal': '2', 'data-anim': 'fade', 'data-anim-order': '0', 'data-anim-dur': '500' }, svg);
    var zh = hit(zone, 'b1-e9', 'Why we checked a second source: Russia\'s own records here mostly start in 2022. Open evidence.');
    mk('rect', { x: zx0, y: zy0, width: zx1 - zx0, height: zy1 - zy0, fill: 'url(#b1-hatch)' }, zh);
    mk('rect', { x: zx0, y: zy0, width: zx1 - zx0, height: zy1 - zy0, 'class': 'm-zone-edge' }, zh);
    mk('rect', { x: zx0, y: zy0, width: zx1 - zx0, height: zy1 - zy0, 'class': 'hitbox' }, zh);
    ['Russia\'s own records', 'here mostly start in', '2022, so we checked', 'a second source', '(the number, right)'].forEach(function (line, i) {
      mk('text', { x: zx0 + 14, y: zy0 + 36 + i * 30, 'class': 't-mut t-halo' + (i === 3 ? ' u' : ''), 'font-size': 22 }, zh, line);
    });

    // Annotation 1: the invasion line, labeled at its top.
    var ix = X(D.invasion.date);
    // dotted line, so it is revealed by a wipe from the top (draw is for solid strokes); the label fades with it
    mk('line', { x1: ix, x2: ix, y1: 24, y2: yAxis, 'class': 'm-inv', 'data-anim': 'wipe', 'data-anim-from': 'top', 'data-anim-order': '0', 'data-anim-dur': '600' }, svg);
    var gi = hit(svg, 'b1-e10', 'Reference date: 24 February 2022. Open evidence.');
    gi.setAttribute('data-anim', 'fade'); gi.setAttribute('data-anim-order', '0');
    mk('text', { x: ix + 12, y: 34, 'class': 't-strong u', 'font-size': 26 }, gi, '24 Feb 2022: Russia invades Ukraine');

    // New doors: group label, three accent bars, direct count labels.
    mk('text', { x: 0, y: rowsNew[0] - 50, 'class': 't-acc', 'font-size': 23 }, svg, 'NEW SENDING COUNTRIES');
    D.newRoutes.forEach(function (r, i) {
      var cy = rowsNew[i];
      mk('text', { x: 0, y: cy + 9, 'class': 't-strong', 'font-size': 28 }, svg, r.name);
      var bx = X(r.first), bw = Math.max(6, X(r.last) - bx);
      var g = hit(svg, r.ev, r.name + ': ' + fmtInt(r.records) + ' shipments to Russia. Open evidence.');
      // order 1: the three bars grow from their start dates together; order 2: their labels
      mk('rect', { x: bx, y: cy - 20, width: bw, height: 40, 'class': 'm-new', 'data-anim': 'grow', 'data-anim-from': 'left', 'data-anim-order': '1', 'data-anim-dur': '800' }, g);
      mk('rect', { x: bx, y: cy - 30, width: W - bx, height: 60, 'class': 'hitbox' }, g);
      mk('text', { x: X(r.last) + 16, y: cy + 9, 'class': 't-strong u', 'font-size': 28, 'data-anim': 'fade', 'data-anim-order': '2' }, g, fmtInt(r.records) + ' shipments');

    });

    // Annotation 2: where the new doors open.
    var kaz = D.newRoutes[2], kx = X(kaz.first), ky = rowsNew[2] + 20;
    var gn = mk('g', { 'data-anim': 'fade', 'data-anim-order': '2' }, svg);
    mk('path', { d: 'M' + kx + ' ' + (ky + 4) + ' L' + kx + ' ' + (ky + 34), 'class': 'm-lead' }, gn);
    mk('circle', { cx: kx, cy: ky + 2, r: 4, 'class': 'm-dot' }, gn);
    mk('text', { x: kx - 14, y: ky + 62, 'class': 't-lab', 'font-size': 26 }, gn).innerHTML =
      '<tspan class="t-strong">New senders start</tspan> in April and May 2022';

    // Old doors, for comparison: slate, no counts on screen (they are in the drawer).
    mk('text', { x: 0, y: rowsOld[0] - 34, 'class': 't-cap', 'font-size': 23 }, svg, 'LONG-TIME SENDERS');
    D.olderRoutes.forEach(function (r, i) {
      var cy = rowsOld[i];
      var g = hit(svg, r.ev, r.name + ': sending chips to Russia since 2019. Open evidence.');
      mk('text', { x: 0, y: cy + 9, 'class': 't-lab', 'font-size': 26 }, g, r.name);
      var bx = X(r.first);
      mk('rect', { x: bx, y: cy - 11, width: X(r.last) - bx, height: 22, 'class': 'm-old' }, g);
      mk('rect', { x: 0, y: cy - 18, width: x1, height: 36, 'class': 'hitbox' }, g);
    });
    return svg;
  }

  /* Phone version: first and last year only, labels above bars, notes become numbered markers. */
  function drawTimelineNarrow(D) {
    var W = 400, H = 400, x0 = 8, x1 = 300;
    var svg = mk('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img',
      'aria-label': 'Timeline, 2019 to 2024. Chip shipments to Russia from Kyrgyzstan, the UAE and Kazakhstan begin only in April and May 2022. Germany and Turkey appear from 2019.' });
    var defs = mk('defs', {}, svg);
    hatch(defs, 'b1-hatch-n');
    var a = t(D.axis.from), b = t(D.axis.to);
    function X(iso) { return x0 + (t(iso) - a) / (b - a) * (x1 - x0); }
    var yAxis = 356, rowsNew = [96, 156, 216], rowsOld = [286, 326];
    function marker(x, y, n) {
      mk('circle', { cx: x, cy: y, r: 11, 'class': 'm-dot' }, svg);
      mk('text', { x: x, y: y + 5, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: 'var(--bg)', 'font-family': 'var(--font-sans)' }, svg, String(n));
    }
    var zx0 = X('2019-01-01'), zx1 = X('2022-01-01');
    mk('rect', { x: zx0, y: rowsNew[0] - 34, width: zx1 - zx0, height: rowsNew[2] - rowsNew[0] + 50, fill: 'url(#b1-hatch-n)' }, svg);
    mk('rect', { x: zx0, y: rowsNew[0] - 34, width: zx1 - zx0, height: rowsNew[2] - rowsNew[0] + 50, 'class': 'm-zone-edge' }, svg);
    marker(zx0 + 18, rowsNew[0] - 14, 3);
    var ix = X(D.invasion.date);
    mk('line', { x1: ix, x2: ix, y1: 26, y2: yAxis, 'class': 'm-inv' }, svg);
    marker(ix, 16, 1);
    mk('text', { x: 0, y: 50, 'class': 't-acc', 'font-size': 14 }, svg, 'NEW SENDING COUNTRIES');
    D.newRoutes.forEach(function (r, i) {
      var cy = rowsNew[i], bx = X(r.first);
      var g = hit(svg, r.ev, r.name + ': ' + fmtInt(r.records) + ' shipments to Russia. Open evidence.');
      mk('text', { x: bx, y: cy - 16, 'class': 't-strong', 'font-size': 17 }, g, r.name);
      mk('rect', { x: bx, y: cy - 10, width: Math.max(4, X(r.last) - bx), height: 20, 'class': 'm-new' }, g);
      mk('text', { x: X(r.last) + 8, y: cy + 6, 'class': 't-strong', 'font-size': 16 }, g, fmtInt(r.records));
      mk('rect', { x: bx - 4, y: cy - 34, width: W - bx, height: 48, 'class': 'hitbox' }, g);
    });
    marker(X(D.newRoutes[1].first) - 16, rowsNew[1], 2);
    mk('text', { x: 0, y: rowsOld[0] - 26, 'class': 't-cap', 'font-size': 13 }, svg, 'LONG-TIME SENDERS');
    D.olderRoutes.forEach(function (r, i) {
      var cy = rowsOld[i], bx = X(r.first);
      var g = hit(svg, r.ev, r.name + ': sending chips to Russia since 2019. Open evidence.');
      mk('text', { x: X(r.last) + 8, y: cy + 5, 'class': 't-mut', 'font-size': 15 }, g, r.name);
      mk('rect', { x: bx, y: cy - 7, width: X(r.last) - bx, height: 14, 'class': 'm-old' }, g);
      mk('rect', { x: 0, y: cy - 16, width: W, height: 32, 'class': 'hitbox' }, g);
    });
    mk('line', { x1: x0, x2: x1, y1: yAxis, y2: yAxis, 'class': 'm-axis' }, svg);
    mk('text', { x: x0, y: yAxis + 24, 'class': 't-mut', 'font-size': 15 }, svg, '2019');
    mk('text', { x: x1, y: yAxis + 24, 'text-anchor': 'end', 'class': 't-mut', 'font-size': 15 }, svg, '2024');
    return svg;
  }

  window.DEMO.register({
    id: 'b1',
    order: 1,
    kicker: 'New routes',
    title: 'After Russia invaded Ukraine, computer chips kept arriving there, sent through new countries.',
    seconds: 27,
    steps: STEPS,
    stepLabels: [
      'Arrive: the invasion line drops; the three new-country bars grow from April and May 2022',
      'Click: the hatched "records start in 2022" zone; $13.5 million counts up from zero'
    ],
    stepNotes: [
      'SAY: "After Russia invaded Ukraine, chips kept arriving there, through new countries. In the shipment records, Kyrgyzstan, the UAE and Kazakhstan all start in April and May 2022."\n\nMOVE: the invasion line drops; the three blue bars grow from April and May 2022; then their shipment counts.\nCUE: point at the dotted invasion line, then at where the three blue bars begin.',
      'SAY: "Russia\'s own records here mostly start in 2022, so we checked a second source: each country\'s own export reports. Kyrgyzstan: close to nothing before, then 13.5 million dollars in 2023. Two sources, same shift."\n\nMOVE: the hatched zone appears on the left; $13.5 million counts up on the right.\nNEVER CUT: "Russia\'s own records here mostly start in 2022". Cut first if short: "Two sources, same shift."'
    ],
    notes: [
      'STEP 1 SAY: "After Russia invaded Ukraine, chips kept arriving there, through new countries. ',
      'In the shipment records, Kyrgyzstan, the UAE and Kazakhstan all start in April and May 2022."',
      '\nMOVE: the invasion line drops; the three blue bars grow from their start dates; then the counts (1,147; 2,041; 715 shipments, on screen only). Grey rows: Germany and Turkey, sending since 2019.',
      '\n\n(click) STEP 2 SAY: "Russia\'s own records here mostly start in 2022, so we checked a second source: each country\'s own export reports. ',
      'Kyrgyzstan: close to nothing before, then 13.5 million dollars in 2023. Two sources, same shift."',
      '\nMOVE: the hatched zone appears on the left; $13.5 million counts up from zero on the right.',
      '\n\nCUT FIRST if short on time: "Two sources, same shift." Never cut "Russia\'s own records here mostly start in 2022".',
      '\n\nIF ASKED (drawer, More in the data): Kazakhstan\'s own reports, $18.3 million in 2022 (b1-e6). Only 45 of the 1,147 Kyrgyz shipments say the chips were made in Kyrgyzstan; most list China, Malaysia or Taiwan (b1-e8, Q&A 1).',
      '\n\nGUARDRAILS: shipments are counts of shipment records, not dollar values. $13.5 million is the declared value in Kyrgyzstan\'s own report. ',
      'Declared countries, not physical routes. ',
      'If asked about Armenia: its own reports show the same jump ($13.1 million in 2022), but it barely appears in Russia-side records, a blind spot shown on the Blind spots screen.'
    ].join(''),
    glossary: [
      { term: 'Chips', plain: 'Integrated circuits: the tiny electronics inside almost every device. Customs codes starting 8542.' },
      { term: 'Shipment records (customs records)', plain: 'Border paperwork, one entry per shipment. We count entries, not dollar values.' },
      { term: 'Declared country', plain: 'The country the paperwork names as the sender. It is not a traced physical route.' },
      { term: 'Countries\' own reports', plain: 'Each country\'s official export totals, reported to the UN (UN Comtrade).' },
      { term: 'Declared value', plain: 'The dollar value written on the export paperwork.' },
      { term: 'Lead', plain: 'A reason to look closer, not proof of wrongdoing.' }
    ],
    evidence: [
      { id: 'b1-e10', claim: 'Reference date on the timeline: Russia\'s full-scale invasion of Ukraine.', value: '24 Feb 2022', source: 'Public record', check: 'official' },
      { id: 'b1-e1', claim: 'Chip shipments arriving in Russia that name Kyrgyzstan as the departure country. First record 21 Apr 2022, last 29 Dec 2023. A count of shipment records, not a dollar value.', value: '1,147 shipments', source: 'Shipment records via Sayari, saved 25 Sep 2026', receipt: 'Sayari search_trade_facets, HS 8542, KGZ to RUS: 20260925T134324Z_search_trade_facets.json (view: build/viz/routes_8542_rus.json)', check: 'verified' },
      { id: 'b1-e2', claim: 'Chip shipments arriving in Russia that name the UAE as the departure country. First record 5 Apr 2022, last 30 Dec 2023.', value: '2,041 shipments', source: 'Shipment records via Sayari, saved 25 Sep 2026', receipt: 'Sayari search_trade_facets, HS 8542, ARE to RUS: 20260925T134328Z_search_trade_facets.json', check: 'verified' },
      { id: 'b1-e3', claim: 'Chip shipments arriving in Russia that name Kazakhstan as the departure country. First record 22 May 2022, last 3 Aug 2023.', value: '715 shipments', source: 'Shipment records via Sayari, saved 25 Sep 2026', receipt: 'Sayari search_trade_facets, HS 8542, KAZ to RUS: 20260925T134345Z_search_trade_facets.json', check: 'verified' },
      { id: 'b1-e9', claim: 'Why we checked a second source. Russia\'s own customs records make up most chip records into Russia in this data (about 81%), and they mostly begin in January 2022 and thin out after late 2023. So "new after 2022" on the timeline could partly be where the data starts, and bars that stop in 2023 may reflect where the data stops. The countries\' own export reports (next items) are the independent check.', value: 'Records mostly start Jan 2022', source: 'Team data review, build day log 25 Sep 2026', check: 'approximate' },
      { id: 'b1-e5', claim: 'Kyrgyzstan\'s own reported chip exports to Russia, declared value, by year 2019 to 2024. No row was returned for 2019 and 2020 (not the same as a reported zero). 2024 may be incomplete. This is a second source, independent of the shipment records.', value: '2023: $13.5 million (2019 to 2024: no row, no row, $0.006M, $0.66M, $13.5M, $1.3M)', source: 'Kyrgyzstan\'s own export report to the UN (UN Comtrade), aggregate rows', receipt: '8542_exports_to_russia_2019_2024_AGGREGATE.json, field "aggregate" (corrected totals, LOG 10:19)', check: 'official' },
      { id: 'b1-e8', offscreen: true, claim: 'Where the chips on the Kyrgyz route were made, as the paperwork records it. Only 45 of the 1,147 shipments say made in Kyrgyzstan. "Other or not stated" is 1,147 minus the six countries shown.', value: '45 of 1,147 (China 419, Malaysia 196, Taiwan 140, Thailand 116, Philippines 96, Kyrgyzstan 45, other or not stated 135)', source: 'Shipment records via Sayari, country-of-manufacture field, saved 25 Sep 2026. Re-derived from the saved raw response in the v2 pass (25 Sep); the split is not yet a row in the team log. Moved off the main screen in v3 (one point per screen); for questions.', receipt: 'Sayari product_origin facet (top 10 origins): 20260925T134324Z_search_trade_facets.json, total_available 1,147. "Other or not stated" 135 = USA 36, Mexico 19, Uzbekistan 18, Japan 16, plus 46 outside the top 10 or with no origin given.', check: 'verified' },
      { id: 'b1-e6', offscreen: true, claim: 'Kazakhstan\'s own reported chip exports to Russia, declared value, 2019 to 2024. Spoken on this screen, not shown.', value: '2022: $18.3 million (2019 to 2024: $0.33M, $0.18M, $0.25M, $18.3M, $15.6M, $0.41M)', source: 'Kazakhstan\'s own export report to the UN (UN Comtrade), aggregate rows', receipt: '8542_exports_to_russia_2019_2024_AGGREGATE.json, field "aggregate"', check: 'official' },
      { id: 'b1-e7', offscreen: true, claim: 'Armenia\'s own reported chip exports to Russia, declared value, 2019 to 2024 (no row returned for 2024). The same jump after 2022. For questions only.', value: '2022: $13.1 million (2019 to 2024: $0.12M, $0.005M, $0.002M, $13.1M, $15.7M, no row)', source: 'Armenia\'s own export report to the UN (UN Comtrade), aggregate rows', receipt: '8542_exports_to_russia_2019_2024_AGGREGATE.json, field "aggregate"', check: 'official' },
      { id: 'b1-e4', offscreen: true, claim: 'Old doors, for comparison: long-standing senders in the same shipment data. Germany from 5 Jan 2019 to 2 Jul 2024, Turkey from 8 Oct 2019 to 26 Jul 2024.', value: 'Germany 32,595 shipments; Turkey 21,537 shipments', source: 'Shipment records via Sayari, saved 25 Sep 2026', receipt: '20260925T134404Z_search_trade_facets.json (Germany), 20260925T134353Z_search_trade_facets.json (Turkey)', check: 'verified' }
    ],
    render: function (el, ctx) {
      var D = (window.DEMO_DATA || {}).b1;
      if (!el.id) el.id = 'beat-b1';
      el.innerHTML = '';
      var narrow = !!(ctx && ctx.isNarrow);
      el.classList.toggle('b1-narrow', narrow);
      var st = document.createElement('style');
      st.textContent = CSS;
      el.appendChild(st);
      var root = el_('div', 'b1', el);
      if (!D) { el_('p', 'b1-explain', root, 'The data for this screen did not load.'); return; }

      // (a) The idea, with the step name above it.
      el_('p', 'b1-kicker d-kick', root, 'New routes');
      el_('h1', 'd-idea', root, 'After Russia invaded Ukraine, computer chips kept arriving there, sent through new countries.');
      // (b) What you're looking at.
      el_('p', 'b1-explain d-explain', root, '<span class="b1-lab d-label">What you\'re looking at</span>Each bar shows when border paperwork (customs records) names that country as the sender of chips bound for Russia: the declared country, not a traced route.');

      // (c) Hero, (d) big numbers.
      var main = el_('div', 'b1-main', root);
      var hero = el_('div', 'b1-hero', main);
      hero.appendChild(narrow ? drawTimelineNarrow(D) : drawTimeline(D));
      if (narrow) {
        el_('ol', 'b1-notes', hero,
          '<li>24 Feb 2022: Russia invades Ukraine.</li>' +
          '<li>New senders start in April and May 2022. The labels count shipments, not dollars.</li>' +
          '<li>Russia\'s own records here mostly start in 2022, so we checked a second source.</li>');
      }
      var nums = el_('div', 'b1-nums', main);
      var k = D.comtrade.series[0];
      // step 2, after the zone: the number counts up from 0 (the jump from almost nothing is the point); caption with it.
      // The reveal sits on a wrapper: the button's all:unset would override the shell's hidden state.
      var n1w = el_('div', 'b1-numwrap', nums);
      n1w.setAttribute('data-reveal', '2'); n1w.setAttribute('data-anim', 'count'); n1w.setAttribute('data-anim-order', '1'); n1w.setAttribute('data-anim-from', '0');
      var n1 = el_('button', 'b1-numbtn', n1w);
      n1.type = 'button'; n1.setAttribute('data-ev', k.ev);
      n1.setAttribute('aria-label', '13.5 million dollars, a second source confirming the shift: Kyrgyzstan\'s own reported chip exports to Russia in 2023. Open evidence.');
      n1.innerHTML = '<span class="b1-numblock">' +
        '<span class="b1-big d-big-n" style="display:block">$13.5<small class="d-big-unit">million</small></span>' +
        '<span class="b1-cap d-big-cap" style="display:block">A second source confirms the shift: chips Kyrgyzstan itself reported selling to Russia in 2023, in dollars. Before 2022, almost none.</span></span>';
      // "45 of 1,147" moved to the drawer in v3 (b1-e8): a second idea (made elsewhere, passing through).

      // (e) Why it matters.
      el_('p', 'b1-why d-why', root, '<span class="b1-lab d-label">Why it matters</span>For the compliance officer: a chip order headed to one of these new sending countries deserves a second look.');
      if (narrow) {
        var sb = el_('button', 'b1-srcbtn', root, 'Sources and details');
        sb.type = 'button'; sb.setAttribute('data-ev', 'b1-e1');
      }

      function open(target) {
        var n = target && target.closest ? target.closest('[data-ev]') : null;
        if (!n || !el.contains(n) || !ctx || !ctx.openEvidence) return false;
        ctx.openEvidence(n.getAttribute('data-ev').split(','));
        return true;
      }
      el._b1open = open;
      if (el._b1bound) return;
      el._b1bound = true;
      el.addEventListener('click', function (e) { if (el._b1open && el._b1open(e.target)) e.stopPropagation(); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.target && e.target.getAttribute && e.target.getAttribute('role') === 'button') {
          if (el._b1open && el._b1open(e.target)) { e.preventDefault(); e.stopPropagation(); }
        }
      });
    }
  });
})();
