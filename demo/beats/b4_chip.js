/* Beat 4: "The drone part" (v3, V3_PLAN.md section 1, b4). Data: data/b4_chain.js (window.DEMO_DATA.b4).
   One point: a military drone's exact chip model was shipped into Russia months before any firm on its path was
   listed; whether these chips reached a weapon is NOT PROVEN.
   One visual: the chain (drone, dashed "Not proven" link, the part) runs along the top; the part's shipment records
   drop straight down into one time field with a lane per firm, so "what" and "when" read as one diagram.
     click 1 (arrive)  the dashed link draws from the drone to the part (wipe), then "Not proven" + caption (fade).
                       "Not proven" stays on screen from here on, on the link it describes, never solid.
     click 2           lanes and time axis (fade); then record by record, in date order: the part's line drops into
                       the Aug 2022 record (draw) and its labels land (fade); then the Nov 2022 record, same moves.
     click 3           each firm's "shipped, not listed yet" gap grows from its first shipment (grow, together);
                       the "listed" ticks land (fade); then "11 to 17 months" (rise).
   Motion is the shell's helper (shell.js MOTION): data-reveal / data-anim attributes only, no beat timers.
   ?shot=1, jumps, going back, phones and reduced motion show the finished state instantly (the shell does that). */
(function () {
  var D = (window.DEMO_DATA && window.DEMO_DATA.b4) || null;
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtMonth(iso) { var p = iso.split('-'); return MON[+p[1] - 1] + ' ' + p[0]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function days(iso) { return Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 864e5; }
  function evAttr(ev, label) { return ' data-ev="' + ev.join(',') + '" role="button" tabindex="0" aria-label="' + esc(label) + ', show source"'; }
  function rv(step, kind, order, dur, from) {
    return ' data-reveal="' + step + '"' + (kind ? ' data-anim="' + kind + '"' : '') +
      (order != null ? ' data-anim-order="' + order + '"' : '') + (dur ? ' data-anim-dur="' + dur + '"' : '') +
      (from ? ' data-anim-from="' + from + '"' : '');
  }
  // Icons: 32px box, 1.75 stroke, round caps, currentColor, no fills (spec 3.7).
  var ICON = {
    drone: '<path d="M16 4 L28 26 L16 21 L4 26 Z"/><path d="M16 9 V21"/>',
    chip: '<rect x="9" y="9" width="14" height="14" rx="1.5"/><path d="M13 5v4M19 5v4M13 23v4M19 23v4M5 13h4M5 19h4M23 13h4M23 19h4"/>'
  };
  function svgIcon(n, x, y, cls) {
    return '<svg x="' + x + '" y="' + y + '" width="32" height="32" viewBox="0 0 32 32" class="' + cls + '" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + ICON[n] + '</svg>';
  }
  function htmlIcon(n) { return '<svg class="b4-ic" viewBox="0 0 32 32" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + ICON[n] + '</svg>'; }

  /* Diagram geometry, in SVG units (1 unit = 1 px when the page is 1920 x 1080 and the diagram is full width). */
  var G = {
    W: 1728, H: 552,
    drone: { x: 1.5, y: 22, w: 300, h: 150 },
    linkY: 97,
    np: { cx: 531, y: 50, w: 384, h: 94 },
    part: { x: 760, y: 1.5, w: 362, h: 196 },
    big: { x: 1196 },
    X0: 560, X1: 1728,             // time field (lane labels sit left of X0)
    lanes: [282, 372, 462],
    axisY: 512
  };

  var CSS = [
    '#beat-b4 { background: var(--bg); color: var(--fg); }',
    '#beat-b4 .b4-wrap { height: 100%; display: flex; flex-direction: column; min-height: 0; font-family: var(--font-sans); }',
    '#beat-b4 .b4-kicker { margin: 0; font: 500 var(--s-min, 2.05vh)/1.2 var(--font-sans); letter-spacing: .08em; text-transform: uppercase; color: var(--accent); }',
    '#beat-b4 .b4-idea { margin: calc(var(--u) * 1) 0 0; max-width: none; }',
    '#beat-b4 .b4-explain { margin: calc(var(--u) * 2) 0 0; max-width: none; }',
    '#beat-b4 .b4-tag { display: inline; margin-right: calc(var(--u) * 1.5); }',
    '#beat-b4 .b4-hero { flex: 1 1 auto; min-height: 0; margin-top: calc(var(--u) * 2.5); position: relative; }',
    '#beat-b4 .b4-svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; overflow: visible; }',
    '#beat-b4 .b4-why { margin: calc(var(--u) * 2) 0 0; }',
    /* SVG text and marks: colours are tokens, so both themes work */
    '#beat-b4 .b4-svg text { font-family: var(--font-sans); fill: var(--fg); }',
    '#beat-b4 .b4-t-lab { font-size: 22px; font-weight: 500; letter-spacing: .08em; fill: var(--muted-fg) !important; }',
    '#beat-b4 .b4-t-name { font: 600 30px var(--font-display, var(--font-sans)) !important; letter-spacing: -.01em; }',
    '#beat-b4 .b4-t-note { font-size: 22px; fill: var(--muted-fg) !important; }',
    '#beat-b4 .b4-t-body { font-size: 22px; }',
    '#beat-b4 .b4-t-mono { font: 600 31px var(--font-mono) !important; letter-spacing: .01em; }',
    '#beat-b4 .b4-t-acc { font-size: 22px; font-weight: 600; fill: var(--accent) !important; }',
    '#beat-b4 .b4-t-lane { font: 600 28px var(--font-display, var(--font-sans)) !important; letter-spacing: -.01em; }',
    '#beat-b4 .b4-t-rec { font-size: 25px; font-weight: 600; font-variant-numeric: tabular-nums lining-nums; }',
    '#beat-b4 .b4-t-rec tspan.m { font-weight: 500; fill: var(--muted-fg); }',
    '#beat-b4 .b4-t-listed { font-size: 23px; font-weight: 600; }',
    '#beat-b4 .b4-t-gap { font-size: 22px; font-style: italic; fill: var(--muted-fg) !important; }',
    '#beat-b4 .b4-t-year { font-size: 22px; fill: var(--muted-fg) !important; font-variant-numeric: tabular-nums lining-nums; }',
    '#beat-b4 .b4-t-np { font: 700 60px var(--font-display, var(--font-sans)) !important; letter-spacing: -.015em; }',
    '#beat-b4 .b4-t-npcap { font-size: 23px; fill: var(--muted-fg) !important; }',
    '#beat-b4 .b4-t-big { font: var(--display-weight, 600) 86px var(--font-display, var(--font-sans)) !important; letter-spacing: -.02em; font-variant-numeric: tabular-nums lining-nums; }',
    '#beat-b4 .b4-t-big tspan.u { font-size: 44px; font-weight: 500; letter-spacing: 0; }',
    '#beat-b4 .b4-t-bigcap { font-size: 26px; fill: var(--muted-fg) !important; }',
    '#beat-b4 .b4-drone-box { fill: none; stroke: color-mix(in oklab, var(--fg) 45%, transparent); stroke-width: 2; stroke-dasharray: 8 6; }',
    '#beat-b4 .b4-part-box { fill: var(--surface); stroke: var(--accent); stroke-width: 2.5; }',
    '#beat-b4 .b4-rule { stroke: color-mix(in oklab, var(--border) 45%, transparent); stroke-width: 1; }',
    '#beat-b4 .b4-ic-muted { color: var(--muted-fg); } #beat-b4 .b4-ic-acc { color: var(--accent); }',
    /* the unproven link: dashed, never solid, no warning colour */
    '#beat-b4 .b4-np-line { stroke: color-mix(in oklab, var(--fg) 60%, transparent); stroke-width: 3.5; stroke-dasharray: 11 8; fill: none; }',
    '#beat-b4 .b4-np-box { fill: var(--bg); stroke: color-mix(in oklab, var(--fg) 60%, transparent); stroke-width: 3; stroke-dasharray: 11 8; }',
    /* time field */
    '#beat-b4 .b4-lane { stroke: color-mix(in oklab, var(--border) 55%, transparent); stroke-width: 1.5; }',
    '#beat-b4 .b4-axis { stroke: color-mix(in oklab, var(--border) 75%, transparent); stroke-width: 2; }',
    '#beat-b4 .b4-yr { stroke: color-mix(in oklab, var(--border) 75%, transparent); stroke-width: 1.5; }',
    '#beat-b4 .b4-rec { stroke: var(--accent); stroke-width: 3; fill: none; stroke-linecap: round; }',
    '#beat-b4 .b4-arrow { fill: var(--accent); }',
    '#beat-b4 .b4-dot { fill: var(--accent); stroke: var(--bg); stroke-width: 3; }',
    '#beat-b4 .b4-ring { fill: var(--bg); stroke: var(--accent); stroke-width: 3; }',
    '#beat-b4 .b4-gap { fill: color-mix(in oklab, var(--fg) 42%, transparent); }',
    '#beat-b4 .b4-tick { stroke: var(--fg); stroke-width: 3.5; stroke-linecap: butt; }',
    /* clickable: no underline on the projector; underline on hover and keyboard focus */
    '#beat-b4 [data-ev] { cursor: pointer; }',
    '#beat-b4 [data-ev]:focus { outline: none; }',
    '#beat-b4 g[data-ev]:hover text, #beat-b4 g[data-ev]:focus-visible text { text-decoration: underline; }',
    '#beat-b4 g[data-ev]:focus-visible { outline: 3px solid var(--accent); outline-offset: 4px; }',
    '#beat-b4 button[data-ev]:hover, #beat-b4 button[data-ev]:focus-visible { text-decoration: underline; text-underline-offset: .15em; }',
    '#beat-b4 button[data-ev]:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }',
    /* Narrow (phones): drone, Not proven, part, a dated list per firm, then the number. Everything shown. */
    '#beat-b4 .b4-wrap.b4-narrow { height: auto; padding: 0 0 24px; }',
    '#beat-b4 .b4-narrow .b4-kicker, #beat-b4 .b4-narrow .b4-tag { font-size: 15px; }',
    '#beat-b4 .b4-narrow .b4-idea { font-size: 28px; }',
    '#beat-b4 .b4-narrow .b4-explain, #beat-b4 .b4-narrow .b4-why { font-size: 17px; }',
    '#beat-b4 .b4-n-chain { display: flex; flex-direction: column; margin-top: 20px; }',
    '#beat-b4 .b4-n-node { display: flex; flex-direction: column; gap: 4px; padding: 12px 14px; border-radius: var(--radius-lg, var(--radius)); }',
    '#beat-b4 .b4-n-drone { border: 2px dashed color-mix(in oklab, var(--fg) 45%, transparent); }',
    '#beat-b4 .b4-n-part { border: 2px solid var(--accent); background: var(--surface); }',
    '#beat-b4 .b4-n-head { display: flex; align-items: center; gap: 8px; font: 500 15px/1.1 var(--font-sans); letter-spacing: .08em; text-transform: uppercase; color: var(--muted-fg); }',
    '#beat-b4 .b4-n-part .b4-n-head { color: var(--accent); }',
    '#beat-b4 .b4-ic { width: 22px; height: 22px; flex: none; }',
    '#beat-b4 .b4-n-name { font: 600 19px/1.2 var(--font-display, var(--font-sans)); }',
    '#beat-b4 .b4-n-small { font-size: 15px; line-height: 1.3; color: var(--muted-fg); }',
    '#beat-b4 .b4-n-pn { all: unset; cursor: pointer; font: 600 19px/1.2 var(--font-mono); }',
    '#beat-b4 .b4-n-np { position: relative; padding: 12px 0 12px 40px; }',
    '#beat-b4 .b4-n-np::before { content: ""; position: absolute; left: 20px; top: 0; bottom: 0; border-left: 3px dashed color-mix(in oklab, var(--fg) 60%, transparent); }',
    '#beat-b4 .b4-n-npbtn { all: unset; cursor: pointer; display: flex; flex-direction: column; gap: 4px; }',
    '#beat-b4 .b4-n-npbig { font: 700 30px/1 var(--font-display, var(--font-sans)); border: 3px dashed color-mix(in oklab, var(--fg) 60%, transparent); border-radius: var(--radius-lg, var(--radius)); padding: 6px 12px; align-self: flex-start; }',
    '#beat-b4 .b4-n-hop { margin: 12px 0 8px; font: 600 15px/1.3 var(--font-sans); color: var(--accent); }',
    '#beat-b4 .b4-n-list { list-style: none; margin: 0; padding: 0 0 0 14px; border-left: 3px solid var(--accent); display: flex; flex-direction: column; gap: 10px; }',
    '#beat-b4 .b4-n-list li { font-size: 16px; line-height: 1.35; }',
    '#beat-b4 .b4-n-list b { font-weight: 600; }',
    '#beat-b4 .b4-n-list button { all: unset; cursor: pointer; }',
    '#beat-b4 .b4-n-role { color: var(--muted-fg); }',
    '#beat-b4 .b4-n-big { all: unset; cursor: pointer; display: block; margin-top: 20px; font: var(--display-weight, 600) 44px/1 var(--font-display, var(--font-sans)); letter-spacing: -.02em; }',
    '#beat-b4 .b4-n-big i { font-style: normal; font-size: 22px; font-weight: 500; letter-spacing: 0; }',
    '#beat-b4 .b4-n-cap { margin: 6px 0 0; font-size: 17px; line-height: 1.3; color: var(--muted-fg); }',
    '#beat-b4 .b4-narrow .b4-why { margin-top: 20px; }'
  ].join('\n');

  // ---------- the one diagram (wide screens) ----------
  function diagram() {
    var t0 = days(D.range.from), span = days(D.range.to) - t0;
    function X(iso) { return +(G.X0 + (days(iso) - t0) / span * (G.X1 - G.X0)).toFixed(1); }
    var laneY = {}, laneById = {};
    D.lanes.forEach(function (l, i) { laneY[l.id] = G.lanes[i]; laneById[l.id] = l; });
    var s = [];
    s.push('<svg class="b4-svg" viewBox="0 0 ' + G.W + ' ' + G.H + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' +
      esc('The drone and its flight-control chip, joined by a dashed line marked Not proven. The chip’s exact part number appears in two shipment records into Russia, August and November 2022, from two Hong Kong shippers to one Russian buyer. Each firm was listed 11 to 17 months after it shipped.') + '">');

    // --- chain row: drone, dashed "not proven" link, the part (static except the link) ---
    var dr = G.drone;
    s.push('<g' + evAttr(D.weapon.ev, D.weapon.name + ', ' + D.weapon.note) + '>' +
      '<rect class="b4-drone-box" x="' + dr.x + '" y="' + dr.y + '" width="' + dr.w + '" height="' + dr.h + '" rx="12"/>' +
      svgIcon('drone', dr.x + 22, dr.y + 22, 'b4-ic-muted') +
      '<text class="b4-t-lab" x="' + (dr.x + 64) + '" y="' + (dr.y + 46) + '">' + esc(D.weapon.label) + '</text>' +
      '<text class="b4-t-name" x="' + (dr.x + 22) + '" y="' + (dr.y + 94) + '">' + esc(D.weapon.name) + '</text>' +
      '<text class="b4-t-note" x="' + (dr.x + 22) + '" y="' + (dr.y + 128) + '">' + esc(D.weapon.note) + '</text></g>');
    // the dashed link wipes from the drone to the part (wipe, not draw: draw would turn the dashes solid)
    s.push('<line class="b4-np-line" x1="' + (dr.x + dr.w) + '" y1="' + G.linkY + '" x2="' + G.part.x + '" y2="' + G.linkY + '"' + rv(1, 'wipe', 0, 600, 'left') + '/>');
    var np = G.np;
    s.push('<g' + rv(1, 'fade', 1, 400) + evAttr(D.link.ev, D.link.label + ': ' + D.link.caption.join(' ')) + '>' +
      '<rect class="b4-np-box" x="' + (np.cx - np.w / 2) + '" y="' + np.y + '" width="' + np.w + '" height="' + np.h + '" rx="14"/>' +
      '<text class="b4-t-np" x="' + np.cx + '" y="' + (np.y + 68) + '" text-anchor="middle">' + esc(D.link.label) + '</text>' +
      D.link.caption.map(function (c, i) { return '<text class="b4-t-npcap" x="' + np.cx + '" y="' + (np.y + np.h + 32 + i * 28) + '" text-anchor="middle">' + esc(c) + '</text>'; }).join('') +
      '</g>');
    var p = G.part;
    s.push('<g' + evAttr(D.part.ev, 'Part number ' + D.part.number) + '>' +
      '<rect class="b4-part-box" x="' + p.x + '" y="' + p.y + '" width="' + p.w + '" height="' + p.h + '" rx="12"/>' +
      svgIcon('chip', p.x + 20, p.y + 16, 'b4-ic-acc') +
      '<text class="b4-t-acc" x="' + (p.x + 60) + '" y="' + (p.y + 40) + '" style="letter-spacing:.08em">' + esc(D.part.label) + '</text>' +
      '<text class="b4-t-name" x="' + (p.x + 22) + '" y="' + (p.y + 82) + '">' + esc(D.part.kind) + '</text>' +
      '<text class="b4-t-mono" x="' + (p.x + 22) + '" y="' + (p.y + 122) + '">' + esc(D.part.number) + '</text>' +
      '<line class="b4-rule" x1="' + (p.x + 22) + '" y1="' + (p.y + 138) + '" x2="' + (p.x + p.w - 22) + '" y2="' + (p.y + 138) + '"/>' +
      D.part.note.map(function (c, i) { return '<text class="b4-t-body" x="' + (p.x + 22) + '" y="' + (p.y + 164 + i * 25) + '">' + esc(c) + '</text>'; }).join('') +
      '</g>');

    // --- click 2, order 0: the time field (lanes, their labels, the axis) as one thing ---
    var yrs = '';
    for (var y = +D.range.from.slice(0, 4); y < +D.range.to.slice(0, 4); y++) {
      var xy = X(y + '-01-01');
      yrs += '<line class="b4-yr" x1="' + xy + '" y1="' + G.axisY + '" x2="' + xy + '" y2="' + (G.axisY + 14) + '"/>' +
        '<text class="b4-t-year" x="' + (xy + 8) + '" y="' + (G.axisY + 38) + '">' + y + '</text>';
    }
    s.push('<g' + rv(2, 'fade', 0, 400) + '>' +
      D.lanes.map(function (l) {
        var ly = laneY[l.id];
        return '<line class="b4-lane" x1="' + G.X0 + '" y1="' + ly + '" x2="' + G.X1 + '" y2="' + ly + '"/>' +
          '<g' + evAttr(l.ev, l.name + ', ' + l.role) + '><text class="b4-t-lane" x="0" y="' + (ly - 2) + '">' + esc(l.name) + '</text>' +
          '<text class="b4-t-note" x="0" y="' + (ly + 27) + '">' + esc(l.role) + '</text></g>';
      }).join('') +
      '<line class="b4-axis" x1="' + G.X0 + '" y1="' + G.axisY + '" x2="' + G.X1 + '" y2="' + G.axisY + '"/>' + yrs +
      '</g>');

    // --- click 3 (drawn under the records): each firm's gap from its first shipment to its first listing ---
    var gaps = '', ticks = '';
    D.lanes.forEach(function (l, i) {
      var ly = laneY[l.id];
      var first = D.shipments.filter(function (sh) { return sh.from === l.id || sh.to === l.id; })
        .map(function (sh) { return sh.date; }).sort()[0];
      var xa = X(first), xb = X(l.listed.date);
      // each gap grows from its own shipment (same order = they move together as one thing)
      gaps += '<rect class="b4-gap" x="' + xa + '" y="' + (ly - 3.5) + '" width="' + (xb - xa).toFixed(1) + '" height="7" rx="1"' + rv(3, 'grow', 0, 900, 'left') + '/>';
      ticks += '<g' + evAttr(l.listed.ev, l.name + ' listed ' + fmtMonth(l.listed.date)) + '>' +
        '<line class="b4-tick" x1="' + xb + '" y1="' + (ly - 24) + '" x2="' + xb + '" y2="' + (ly + 24) + '"/>' +
        '<text class="b4-t-listed" x="' + (xb + 10) + '" y="' + (ly - 11) + '">listed</text></g>';
      if (i === 0 && D.gapLabel) ticks += '<text class="b4-t-gap" x="' + (xb - 14) + '" y="' + (ly - 14) + '" text-anchor="end">' + esc(D.gapLabel) + '</text>';
    });
    s.push('<g>' + gaps + '</g>');

    // --- click 2, orders 1 and 2: the records, one after another in date order (the time field and its label are order 0) ---
    var yBuyer = laneY[D.shipments[0].to];
    D.shipments.forEach(function (sh, k) {
      var x = X(sh.date), ys = laneY[sh.from], yb = laneY[sh.to];
      var o = 1 + k;   // one record per order: its line draws while its dot and label fade in with it (one thing)
      // the part's line drops from the part into this record, through the shipper, to the buyer
      s.push('<path class="b4-rec" d="M' + x + ' ' + (p.y + p.h) + ' V' + (yb - 24) + '"' + rv(2, 'draw', o, 700) + '/>');
      if (k === 0) s.push('<text class="b4-t-acc" x="' + (X(D.shipments[D.shipments.length - 1].date) + 18) + '" y="' + (p.y + p.h + 40) + '"' + rv(2, 'fade', 0, 400) + '>' + esc(D.hop) + '</text>');
      var left = k === 0;
      var lx = left ? x - 18 : x + 18, anchor = left ? 'end' : 'start';
      var lab = sh.pieces + ' pieces, ';
      s.push('<g' + rv(2, 'fade', o, 700) + evAttr(sh.ev, sh.pieces + ' pieces, ' + fmtMonth(sh.date) + ', ' + laneById[sh.from].name + ' to ' + laneById[sh.to].name) + '>' +
        '<path class="b4-arrow" d="M' + (x - 9) + ' ' + (yb - 26) + ' L' + (x + 9) + ' ' + (yb - 26) + ' L' + x + ' ' + (yb - 11) + ' Z"/>' +
        '<circle class="b4-ring" cx="' + x + '" cy="' + yb + '" r="10"/>' +
        '<circle class="b4-dot" cx="' + x + '" cy="' + ys + '" r="11"/>' +
        '<text class="b4-t-rec" x="' + lx + '" y="' + (ys - 16) + '" text-anchor="' + anchor + '">' + esc(lab) + '<tspan class="m">' + fmtMonth(sh.date) + '</tspan></text>' +
        '</g>');
      if (k === D.shipments.length - 1) {
        s.push('<g' + rv(2, 'fade', o, 700) + evAttr(D.received.ev, laneById[sh.to].name + ' ' + D.received.text) + '>' +
          '<text class="b4-t-rec" x="' + (X(D.shipments[0].date) - 18) + '" y="' + (yBuyer - 16) + '" text-anchor="end">' + esc(D.received.text) + '</text></g>');
      }
    });

    // --- click 3, orders 1 and 2: the listing ticks land, then the one big number ---
    s.push('<g' + rv(3, 'fade', 1, 400) + '>' + ticks + '</g>');
    var b = D.big;
    s.push('<g' + rv(3, 'rise', 2, 500) + evAttr(b.ev, b.big + ' ' + b.unit + ' ' + b.caption.join(' ')) + '>' +
      '<text class="b4-t-big" x="' + G.big.x + '" y="' + (p.y + 84) + '">' + esc(b.big) + '<tspan class="u" dx="14">' + esc(b.unit) + '</tspan></text>' +
      b.caption.map(function (c, i) { return '<text class="b4-t-bigcap" x="' + G.big.x + '" y="' + (p.y + 128 + i * 32) + '">' + esc(c) + '</text>'; }).join('') +
      '</g>');
    s.push('</svg>');
    return s.join('');
  }

  // ---------- narrow (phones): the same story as a list, everything shown ----------
  function narrow() {
    var byId = {};
    D.lanes.forEach(function (l) { byId[l.id] = l; });
    function btn(ev, inner, label) { return '<button type="button" data-ev="' + ev.join(',') + '" aria-label="' + esc(label) + ', show source">' + inner + '</button>'; }
    var items = D.lanes.map(function (l) {
      var sent = D.shipments.filter(function (sh) { return sh.from === l.id; }).map(function (sh) {
        return btn(sh.ev, fmtMonth(sh.date) + ': sent ' + sh.pieces + ' pieces.', sh.pieces + ' pieces, ' + fmtMonth(sh.date));
      });
      var got = D.shipments.filter(function (sh) { return sh.to === l.id; });
      var rec = got.length ? [btn(D.received.ev, 'Received both: ' + got.map(function (sh) { return fmtMonth(sh.date); }).join(' and ') + '.', D.received.text)] : [];
      return '<li><b>' + esc(l.name) + '</b> <span class="b4-n-role">' + esc(l.role) + '</span><br>' +
        sent.concat(rec).join(' ') + ' ' + btn(l.listed.ev, 'Listed ' + fmtMonth(l.listed.date) + '.', l.name + ' listed ' + fmtMonth(l.listed.date)) + '</li>';
    }).join('');
    return '<div class="b4-n-chain">' +
      '<button type="button" class="b4-n-node b4-n-drone" style="all:unset;cursor:pointer;display:flex;flex-direction:column;gap:4px;padding:12px 14px;border:2px dashed color-mix(in oklab, var(--fg) 45%, transparent);border-radius:var(--radius-lg, var(--radius))" data-ev="' + D.weapon.ev.join(',') + '" aria-label="' + esc(D.weapon.name) + ', show source">' +
        '<span class="b4-n-head">' + htmlIcon('drone') + esc(D.weapon.label) + '</span><span class="b4-n-name">' + esc(D.weapon.name) + '</span><span class="b4-n-small">' + esc(D.weapon.note) + '</span></button>' +
      '<div class="b4-n-np"><button type="button" class="b4-n-npbtn" data-ev="' + D.link.ev.join(',') + '" aria-label="' + esc(D.link.label) + ', show source">' +
        '<span class="b4-n-npbig">' + esc(D.link.label) + '</span><span class="b4-n-small">' + esc(D.link.caption.join(' ')) + '</span></button></div>' +
      '<div class="b4-n-node b4-n-part"><span class="b4-n-head">' + htmlIcon('chip') + esc(D.part.label) + '</span><span class="b4-n-name">' + esc(D.part.kind) + '</span>' +
        '<button type="button" class="b4-n-pn" data-ev="' + D.part.ev.join(',') + '" aria-label="Part number ' + esc(D.part.number) + ', show source">' + esc(D.part.number) + '</button>' +
        '<span class="b4-n-small">' + esc(D.part.note.join(' ')) + '</span></div>' +
      '<p class="b4-n-hop">' + esc(D.hop.charAt(0).toUpperCase() + D.hop.slice(1)) + ':</p>' +
      '<ul class="b4-n-list">' + items + '</ul>' +
      '<button type="button" class="b4-n-big" data-ev="' + D.big.ev.join(',') + '" aria-label="' + esc(D.big.big + ' ' + D.big.unit) + ', show source">' + esc(D.big.big) + ' <i>' + esc(D.big.unit) + '</i></button>' +
      '<p class="b4-n-cap">' + esc(D.big.caption.join(' ')) + '</p>' +
      '</div>';
  }

  function render(el, ctx) {
    if (!D) { el.innerHTML = '<div class="b4-wrap"><p>Beat 4 data missing (data/b4_chain.js).</p></div>'; return; }
    var isN = !!(ctx && ctx.isNarrow);
    el.innerHTML =
      '<div class="b4-wrap' + (isN ? ' b4-narrow' : '') + '">' +
        '<p class="b4-kicker d-kick">The drone part</p>' +
        '<h2 class="b4-idea d-idea">' + esc(D.idea) + '</h2>' +
        '<p class="b4-explain d-explain"><span class="b4-tag d-label">What you’re looking at</span>' + esc(D.explainer) + '</p>' +
        (isN ? narrow() : '<div class="b4-hero">' + diagram() + '</div>') +
        '<p class="b4-why d-why"><span class="b4-tag d-label">Why it matters</span>' + esc(D.why) + '</p>' +
      '</div>';
    var st = document.createElement('style'); st.textContent = CSS; el.insertBefore(st, el.firstChild);
    el._b4ctx = ctx;
    if (el._b4bound) return;
    el._b4bound = true;
    function open(node) {
      var c = el._b4ctx;
      if (node && el.contains(node) && c && c.openEvidence) c.openEvidence(node.getAttribute('data-ev').split(','));
    }
    el.addEventListener('click', function (e) {
      var n = e.target.closest ? e.target.closest('[data-ev]') : null;
      if (n) { e.stopPropagation(); open(n); }
    });
    el.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var n = e.target.closest ? e.target.closest('[data-ev]') : null;
      if (n && n.tagName.toLowerCase() !== 'button') { e.preventDefault(); e.stopPropagation(); open(n); }
    });
  }

  if (window.DEMO && window.DEMO.register) {
    window.DEMO.register({
      id: 'b4', order: 4, kicker: 'The drone part', title: 'The drone part', seconds: 32,
      steps: 3,
      stepLabels: [
        'Arrive (click): the dashed link from the drone to the part draws; "Not proven" appears on it (it stays on screen)',
        'Click: the lanes and time axis appear; the part number’s line drops into the August 2022 record, then the November 2022 record',
        'Click: on each firm’s row, the gap from its shipment to its listing grows; the "listed" marks land; then "11 to 17 months"'
      ],
      stepNotes: [
        'SAY: "Ukraine’s defence intelligence, a party to this war, documents this chip model inside a Shahed drone."\n\nMOVE: the dashed link draws from the drone to the part; "Not proven" appears on it and stays.\nCUE: point at the drone, then the part number.',
        'SAY: "We searched shipment records for its exact part number: 100 pieces went into Russia in August 2022, 22 more in November, both from Hong Kong."\n\nMOVE: the lanes appear; the part’s line drops into the August record (ACE ELECTRONIC to the buyer), then the November record (JINMINGSHENG TECHNOLOGY to the same buyer).\nDON’T SAY: "122 pieces".',
        'SAY: "Every firm on that path was listed later, 11 to 17 months after it shipped. We can’t prove these chips reached a weapon, and we say so."\n\nMOVE: each firm’s grey gap grows from its shipment to its listing; "listed" lands; then "11 to 17 months".\nCUE: on "we can’t prove", point back up at the dashed "Not proven" link. Never cut that sentence.'
      ],
      notes: [
        '(click, arrive) SAY: "Ukraine’s defence intelligence, a party to this war, documents this chip model inside a Shahed drone."',
        '',
        '(click) SAY: "We searched shipment records for its exact part number: 100 pieces went into Russia in August 2022, 22 more in November, both from Hong Kong."',
        '',
        '(click) SAY: "Every firm on that path was listed later, 11 to 17 months after it shipped. We can’t prove these chips reached a weapon, and we say so."',
        '',
        'CUES: the dashed "Not proven" link is on screen from the first moment; point at it on "we can’t prove". Click any record, "listed" mark or number to open its source.',
        'IF ASKED which lists: buyer US Treasury Jul 2023; ACE US Commerce Entity List Oct 2023; Jinmingsheng US Treasury May 2024 (drawer). ACE’s later US, UK and EU listings are in the drawer too.',
        'IF TIME: "Same pattern with AI chips: Shreya Life Sciences was reported shipping H100 servers to Russia and was put on the US Treasury list two days later." (drawer, More in the data)',
        'DON’T SAY: that the chips reached a drone; the chip maker’s name; any value in dollars; "122 pieces".'
      ].join('\n'),
      evidence: D ? D.evidence : [],
      glossary: D ? D.glossary : [],
      render: render
    });
  }
})();
