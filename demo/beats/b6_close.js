/* Beat 6: what to track. Navy title screen (DESIGN_SPEC section 2, b6; V3_PLAN section 1, b6). 15 s, 1 step.
   One point: track what doesn't change: the product, the buyer, the route.
   Reading order: the idea with its three big words, what you're looking at, the persistence scale, why it matters, thanks.
   Motion on arrival (shell.js MOTION): the headline, words, axis, "Lists arrive" band and row captions are static;
   order 0: the four persistence bars are revealed left to right by one moving edge (wipe, 1200 ms): the company-name
   bar ends at weeks, the route, buyer and product bars run on past the "Lists arrive" band;
   order 1: the "track these" and "lists match this" brackets fade in.
   Credits live in the drawer (b6-e6). All CSS is prefixed #beat-b6. */
(function () {
  if (!window.DEMO) return;
  var CSS = [
    '#beat-b6 { display: grid; align-content: center; }',
    '#beat-b6 .b6-wrap { display: grid; gap: calc(var(--u) * 2.5); }',
    '#beat-b6 h1 { margin: 0; font: var(--display-weight, 600) calc(var(--s-hero) * .74)/1.06 var(--font-display, var(--font-sans)); letter-spacing: var(--display-tracking, -.02em); max-width: none; }',
    '#beat-b6 h1 .l { display: block; }',
    '#beat-b6 .grad { color: var(--accent); }',
    '@supports (background-clip: text) or (-webkit-background-clip: text) {',
    '  #beat-b6 .grad { background: var(--accent-gradient, linear-gradient(var(--accent), var(--accent))); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }',
    '}',
    /* three words, not buttons: no box, an accent underline, commas between */
    '#beat-b6 .b6-three { display: flex; flex-wrap: wrap; gap: 0 calc(var(--u) * 2.5); margin: 0; padding: 0; list-style: none; }',
    '#beat-b6 .b6-three li { font: 600 var(--s-sub)/1.2 var(--font-sans); text-decoration: underline; text-decoration-color: var(--accent); text-decoration-thickness: .12em; text-underline-offset: .2em; }',
    '#beat-b6 .b6-three li:not(:last-child)::after { content: ","; text-decoration: none; display: inline-block; }',
    '#beat-b6 .b6-fig { margin: 0; }',
    '#beat-b6 .b6-fig svg { display: block; overflow: visible; }',
    '#beat-b6 .d-why strong { font-weight: 600; }',
    '#beat-b6 .b6-thanks { margin: calc(var(--u) * 1.5) 0 0; font: 500 var(--s-line)/1.3 var(--font-sans); color: color-mix(in oklab, var(--hero-fg) 72%, transparent); }',
    /* chart */
    '#beat-b6 .pc-name { fill: var(--hero-fg); font: 600 var(--s-label) var(--font-sans); }',
    '#beat-b6 .pc-cap { fill: color-mix(in oklab, var(--hero-fg) 88%, transparent); font: 500 var(--s-label) var(--font-sans); }',
    '#beat-b6 .pc-cap .pc-b { font-weight: 600; fill: var(--hero-fg); }',
    '#beat-b6 .pc-tick { fill: color-mix(in oklab, var(--hero-fg) 72%, transparent); font: 500 var(--s-min) var(--font-sans); }',
    '#beat-b6 .pc-note { fill: var(--hero-fg); font: 500 var(--s-note) var(--font-sans); }',
    '#beat-b6 .pc-note-acc { fill: var(--accent); font: 600 var(--s-note) var(--font-sans); }',
    '#beat-b6 .pc-bar-slate { fill: color-mix(in oklab, var(--hero-fg) 42%, var(--hero-bg)); }',
    '#beat-b6 .pc-bar-acc { fill: var(--accent); }',
    '#beat-b6 .pc-band { fill: color-mix(in oklab, var(--hero-fg) 25%, transparent); stroke: color-mix(in oklab, var(--hero-fg) 60%, transparent); stroke-width: 1.5; }',
    '#beat-b6 .pc-fade-a { stop-color: var(--accent); }',
    '#beat-b6 .pc-axis { stroke: color-mix(in oklab, var(--hero-fg) 45%, transparent); stroke-width: 1; }',
    '#beat-b6 .pc-grid { stroke: color-mix(in oklab, var(--hero-fg) 14%, transparent); stroke-width: 1; }',
    '#beat-b6 .pc-brk { fill: none; stroke: var(--accent); stroke-width: 2.5; }',
    '#beat-b6 .pc-brk-muted { fill: none; stroke: color-mix(in oklab, var(--hero-fg) 55%, transparent); stroke-width: 2; }',
    '#beat-b6 [data-ev] { cursor: pointer; }',
    '#beat-b6 [data-ev]:hover .pc-b, #beat-b6 [data-ev]:focus-visible .pc-b { text-decoration: underline dotted; }',
    'body.narrow #beat-b6 { align-content: start; }',
    'body.narrow #beat-b6 h1 { font-size: var(--s-idea); }'
  ].join('\n');

  // How long each thing stayed the same, in days (from the evidence items below; no new numbers).
  var NAME_DAYS = 40;      // b6-e1: median firm active 40 days
  var ROUTE_DAYS = 617;    // b6-e2: 21 Apr 2022 to 29 Dec 2023
  var BUYER_DAYS = 2250;   // b6-e3: 11 Jan 2019 to 10 Mar 2025
  var LIST_FROM = 456, LIST_TO = 608;  // b6-e4: 15 to 20 months (15 x 30.4 and 20 x 30.4 days); LOG 13:12 CORRECTED (was 23)
  var MIN_D = 7, MAX_D = 3652;         // axis: 1 week to 10 years

  // Top to bottom in the order of the close line: the product, the buyer, the route; then the name lists match.
  // The product bar is not a measured span: it fades out instead of ending on a precise date (b6-e5 says so).
  var ROWS = [
    { name: 'Product', cls: 'pc-bar-acc', fade: true, days: BUYER_DAYS, ev: 'b6-e5', lead: 'Years:', cap: ' the same chip families ', num: 'before and after 2022', tail: ' (not measured to a date)' },
    { name: 'Buyer', cls: 'pc-bar-acc', days: BUYER_DAYS, ev: 'b6-e3', lead: 'Years:', cap: ' one buyer record, ', num: '2019 to 2025', tail: '' },
    { name: 'Route', cls: 'pc-bar-acc', days: ROUTE_DAYS, ev: 'b6-e2', lead: 'Months:', cap: ' Kyrgyzstan route, ', num: 'Apr 2022 through 2023', tail: '' },
    { name: 'Company name', cls: 'pc-bar-slate', days: NAME_DAYS, ev: 'b6-e1', lead: 'Weeks:', cap: ' a typical firm lasted ', num: '40 days', tail: '' }
  ];
  var TICKS = [[7, '1 week'], [30.4, '1 month'], [182.6, '6 months'], [365.25, '1 year'], [730.5, '2 years'], [1826, '5 years'], [3652, '10 years']];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function chartSvg(W, px, narrow) {
    var fLabel = px('--s-label'), fMin = px('--s-min'), fNote = px('--s-note');
    var labelW = narrow ? 0 : Math.round(fLabel * 8.8);
    var rightW = narrow ? 8 : Math.round(fNote * 10);   // room for "lists match this" at 1280 (motion review)
    var x0 = labelW, x1 = W - rightW;
    var lx = function (d) { return x0 + (x1 - x0) * Math.log(d / MIN_D) / Math.log(MAX_D / MIN_D); };
    var barH = Math.round(fLabel * (narrow ? .8 : .95));
    var capGap = Math.round(fLabel * .3);
    var rowH = (narrow ? fLabel * 2.7 : 0) + fLabel + capGap + barH + Math.round(fLabel * (narrow ? .9 : .55));
    var top = Math.round(fNote * 1.9);
    var y = top;
    var out = [];
    var bars = [];   // the four bars, revealed together by one moving edge (time passing on the scale)
    var H = top + rowH * ROWS.length + fMin * (narrow ? 2.6 : 3.5);

    out.push('<defs><linearGradient id="b6-fade" x1="0" x2="1" y1="0" y2="0"><stop offset="0" class="pc-fade-a" stop-opacity="1"/><stop offset=".72" class="pc-fade-a" stop-opacity="1"/><stop offset="1" class="pc-fade-a" stop-opacity="0"/></linearGradient></defs>');
    // lists band (behind everything), label on top
    var bx0 = lx(LIST_FROM), bx1 = lx(LIST_TO);
    out.push('<rect class="pc-band" x="' + bx0.toFixed(1) + '" y="' + (top - 6) + '" width="' + (bx1 - bx0).toFixed(1) + '" height="' + (rowH * ROWS.length + 6) + '"/>');
    var bandMid = (bx0 + bx1) / 2;
    var bandLabel = narrow ? 'Lists arrive: 15 to 20 months' : 'Lists arrive: 15 to 20 months after a firm appears';
    var anchor = narrow ? 'end' : 'middle', lxp = narrow ? bx1 : bandMid;
    out.push('<g data-ev="b6-e4" tabindex="0" role="button" aria-label="Lists arrive 15 to 20 months after a firm appears. Open the source."><text class="pc-note" x="' + lxp.toFixed(1) + '" y="' + Math.round(fNote * 1.1) + '" text-anchor="' + anchor + '">Lists arrive: <tspan class="pc-b" font-weight="600">15 to 20 months</tspan>' + (narrow ? '' : ' after a firm appears') + '</text></g>');

    ROWS.forEach(function (r, k) {
      var capY, barY;
      if (narrow) {
        out.push('<text class="pc-name" x="0" y="' + (y + fLabel).toFixed(1) + '">' + esc(r.name) + '</text>');
        capY = y + fLabel * 2.7 + fLabel;
      } else {
        capY = y + fLabel;
      }
      barY = capY + capGap;
      if (!narrow) out.push('<text class="pc-name" x="0" y="' + (barY + barH * .78).toFixed(1) + '">' + esc(r.name) + '</text>');
      var capText = narrow
        ? '<text class="pc-cap" x="' + x0 + '" y="' + (capY - fLabel * 1.35).toFixed(1) + '"><tspan class="pc-b">' + esc(r.lead) + '</tspan>' + esc(r.cap.replace(/,\s*$/, '').replace(/\s+$/, '')) + '</text>' +
          '<text class="pc-cap" x="' + x0 + '" y="' + capY.toFixed(1) + '"><tspan class="pc-b">' + esc(r.num) + '</tspan></text>'
        : '<text class="pc-cap" x="' + x0 + '" y="' + capY.toFixed(1) + '"><tspan class="pc-b">' + esc(r.lead) + '</tspan>' + esc(r.cap) + '<tspan class="pc-b">' + esc(r.num) + '</tspan>' + esc(r.tail) + '</text>';
      out.push('<g data-ev="' + r.ev + '" tabindex="0" role="button" aria-label="' + esc(r.name + ': ' + r.lead + r.cap + r.num + '. Open the source.') + '">' +
        capText + '</g>');
      bars.push('<rect data-ev="' + r.ev + '" class="' + r.cls + '"' + (r.fade ? ' style="fill:url(#b6-fade)"' : '') + ' x="' + x0 + '" y="' + barY.toFixed(1) + '" width="' + Math.max(4, lx(r.days) - x0).toFixed(1) + '" height="' + barH + '"/>');
      r._y0 = barY; r._y1 = barY + barH;
      y += rowH;
    });

    out.push('<g class="pc-bars" data-anim="wipe" data-anim-from="left" data-anim-order="0" data-anim-dur="1200">' + bars.join('') + '</g>');

    // axis and ticks
    var ay = top + rowH * ROWS.length + 4;
    out.push('<line class="pc-axis" x1="' + x0 + '" x2="' + x1 + '" y1="' + ay + '" y2="' + ay + '"/>');
    TICKS.forEach(function (t, k) {
      if (narrow && !(k === 0 || k === 3 || k === TICKS.length - 1)) return;
      var tx = lx(t[0]);
      var a = k === 0 ? 'start' : k === TICKS.length - 1 ? 'end' : 'middle';
      if (!narrow && k === 0) a = 'middle';
      if (!narrow && k === TICKS.length - 1) a = 'middle';
      out.push('<line class="pc-axis" x1="' + tx.toFixed(1) + '" x2="' + tx.toFixed(1) + '" y1="' + ay + '" y2="' + (ay + 7) + '"/>');
      out.push('<text class="pc-tick" x="' + tx.toFixed(1) + '" y="' + (ay + 8 + fMin).toFixed(1) + '" text-anchor="' + a + '">' + t[1] + '</text>');
    });
    if (!narrow) {
      out.push('<text class="pc-tick" x="' + x0 + '" y="' + (ay + 10 + fMin * 2.25).toFixed(1) + '">how long it stayed the same</text>');
      // right-hand brackets: "track these" on the three accent rows, "lists match this" on the name row
      var bx = x1 + Math.round(fNote * .9);
      var rTop = ROWS[0], rMid = ROWS[2], rName = ROWS[3];
      out.push('<g data-anim="fade" data-anim-order="1">');
      out.push('<path class="pc-brk" d="M' + (bx - 10) + ' ' + rTop._y0 + 'H' + bx + 'V' + rMid._y1 + 'H' + (bx - 10) + '"/>');
      out.push('<text class="pc-note-acc" x="' + (bx + 14) + '" y="' + ((rTop._y0 + rMid._y1) / 2 + fNote * .35).toFixed(1) + '">track these</text>');
      out.push('<path class="pc-brk-muted" d="M' + (bx - 10) + ' ' + rName._y0 + 'H' + bx + 'V' + rName._y1 + 'H' + (bx - 10) + '"/>');
      out.push('<text class="pc-note" x="' + (bx + 14) + '" y="' + ((rName._y0 + rName._y1) / 2 + fNote * .35).toFixed(1) + '">lists match this</text>');
      out.push('</g>');
    } else {
      out.push('<text class="pc-tick" x="0" y="' + (ay + 8 + fMin * 2.3).toFixed(1) + '">how long it stayed the same</text>');
    }

    return '<svg width="' + W + '" height="' + Math.ceil(H) + '" viewBox="0 0 ' + W + ' ' + Math.ceil(H) + '" role="img" aria-label="How long each thing stayed the same in our data. The product: the same chip families before and after 2022, years (not measured to a date). The buyer: one buyer record, 2019 to 2025. The route: Kyrgyzstan, April 2022 through 2023, months. Company names lasted weeks: a typical firm lasted 40 days. Lists arrived 15 to 20 months after a firm appeared: after the names were gone, while the product, the buyer and the route were still there.">' +
      '<title>What lasts: names for weeks, routes for months, buyers and products for years</title>' + out.join('') + '</svg>';
  }

  window.DEMO.register({
    id: 'b6',
    order: 6,
    kicker: 'What to track',
    title: "Track what doesn't change",
    seconds: 15,
    steps: 1,
    stepLabels: ['Arrive: one edge sweeps the scale from weeks to years; the company name stops at weeks; the product, the buyer and the route run past the moment lists arrive'],
    stepNotes: [
      'SAY: "Lists follow names. Evaders change names. So track what doesn\'t change: the product, the buyer, the route. Every lead links to its source. Leads, not verdicts. Thank you."\n\nMOVE: one edge sweeps the scale from weeks to years: the company name stops at weeks; the product, the buyer and the route run past the moment lists arrive.\nCUE: on "the product, the buyer, the route", point at the three blue words. Stop talking at 3:00. This screen stays up for questions; the credits are in the sources drawer (E).'
    ],
    notes: [
      'SAY: "Lists follow names. Evaders change names. So track what doesn\'t change: the product, the buyer, the route. Every lead links to its source. Leads, not verdicts. Thank you."',
      '',
      'MOVE on arrival: one edge sweeps the scale from weeks to years: the company name stops at weeks; the product, the buyer and the route run past the moment lists arrive.',
      '',
      'CUE: on "the product, the buyer, the route", point at the three blue words. Stop talking at 3:00. This screen stays up for questions; the credits are in the sources drawer (E).',
      '',
      'IF ASKED how a compliance officer uses this: "Screen the product, the buyer and the route, not just the seller’s name."'
    ].join('\n'),
    glossary: [
      { term: 'Route', def: 'The declared country a shipment left from on its way to Russia: what the paperwork says, not a traced physical path.' },
      { term: 'Buyer', def: 'The company receiving the goods.' },
      { term: 'Product', def: 'What is shipped. For chips, the part number is the maker’s exact code for one chip model.' },
      { term: 'Lead', def: 'A reason to look closer, not proof of wrongdoing.' }
    ],
    evidence: [
      { id: 'b6-e1', value: '40 days', check: 'verified',
        claim: 'Company names last weeks. On the Kyrgyzstan chip route, the typical (median) shipping company was active for 40 days from its first to its last shipment record; 6 of 14 appear on a single day only.',
        source: 'Russia’s customs records, via Sayari, saved 25 Sep 2026; counted by the team and checked a second time (same item as "New names", 40 days)',
        receipt: 'b2-e6; agents/b16/churn_summary.json; LOG_2026-09-25.md 10:51 (verified)' },
      { id: 'b6-e2', value: 'Apr 2022 through 2023', check: 'verified',
        claim: 'Routes last months. Chip shipment records into Russia that name Kyrgyzstan as the departure country run from 21 Apr 2022 to 29 Dec 2023 (1,147 shipment records). A declared country, not a traced physical route.',
        source: 'Shipment records via Sayari, saved 25 Sep 2026 (same item as "New routes")',
        receipt: 'b1-e1; Sayari search_trade_facets, HS 8542, KGZ to RUS: 20260925T134324Z_search_trade_facets.json' },
      { id: 'b6-e3', value: '2019 to 2025', check: 'verified',
        claim: 'Buyers last years. One Russian buyer, Testkomplekt (on the US Treasury and UK sanctions lists since 2023), appears as a single company record from 11 Jan 2019 to 10 Mar 2025 across 9,141 shipment records, while its suppliers changed.',
        source: 'Shipment records via Sayari, saved 25 Sep 2026; checked a second time (same item as "New names", the buyer)',
        receipt: 'b2-e12; agents/b17/buyer_timelines.csv; LOG_2026-09-25.md 10:51 (verified)' },
      { id: 'b6-e4', value: '15 to 20 months', check: 'verified',
        claim: 'Lists arrive late. For the four listed companies on "The lag" screen, the gap from their first sign in the shipment records to their official listing runs from at least 15 to at least 20 months. On the scale, the band is drawn from 15 to 20 months. (Corrected: an earlier version said 15 to 23 months, using ELEM GROUP’s later Treasury listing instead of its first listing, the US Commerce Entity List on 7 Dec 2023.)',
        source: 'Official sanctions lists and shipment records via Sayari (same item as "The lag")',
        receipt: 'b3-e5; derived from b3-e1 to b3-e4 (build/viz/listing_lag.js); LOG_2026-09-25.md 13:12 CORRECTED' },
      { id: 'b6-e5', value: 'same chip families', check: 'verified',
        claim: 'Products last years. For one US maker’s programmable chips shipped into Russia (181 shipment records under 58 shipper names, 45 of them seen in one month only), the same part families arrive before and after the invasion; only the senders change (Germany and the Netherlands before; China, Hong Kong, India and Thailand after). Only 2 of 39 post-invasion shippers had shipped before. The bar shows "years", not a measured span: it is drawn the same length as the buyer bar.',
        source: 'Shipment records via Sayari, saved 25 Sep 2026; counted by the team and checked a second time',
        receipt: 'LOG_2026-09-25.md 10:51, "Part as anchor" (verified); card TRC-30' },
      { id: 'b6-e6', value: 'Credits', check: 'none', offscreen: true,
        claim: 'Built for the Trace the Unseen build day, sanctions and evasion track. Data: Sayari and Tradeverifyd (sponsor trade and company records); UN Comtrade (countries’ own trade reports to the UN); official sanctions lists (US Treasury, US Commerce, UK, EU); OpenSanctions; GUR, Ukraine’s defence intelligence, a party to the war; Natural Earth (public domain). Map pieces adapted from God’s Eye View (MIT licence). Type: IBM Plex Sans (SIL Open Font Licence). Thank you, Sayari, Tradeverifyd and Microsoft.',
        source: 'README.md, Credits',
        receipt: 'US Treasury = OFAC; US Commerce = BIS Entity List; build/viz/THIRD_PARTY.md' }
    ],
    render: function (el, ctx) {
      el.classList.add('on-dark');
      var style = document.createElement('style');
      style.textContent = CSS;
      el.appendChild(style);
      var narrow = !!(ctx && ctx.isNarrow);

      var wrap = document.createElement('div');
      wrap.className = 'b6-wrap';
      wrap.innerHTML =
        '<h1 class="d-idea"><span class="l">Lists follow names. Evaders change names.</span> <span class="l grad">Track what doesn’t change:</span></h1>' +
        '<ul class="b6-three" aria-label="What does not change"><li>the product</li><li>the buyer</li><li>the route</li></ul>' +
        '<p class="d-explain"><span class="d-label">What you’re looking at</span>How long each thing stayed the same in our data, on a scale from one week to ten years.</p>' +
        '<figure class="b6-fig"></figure>' +
        '<p class="d-why"><span class="d-label">Why it matters</span><strong>Tomorrow,</strong> a chip distributor’s compliance officer screens <strong>the product, the buyer, the route</strong>, not just the seller’s name. Every lead links to its source. Leads, not verdicts.</p>' +
        '<p class="b6-thanks">Thank you, Sayari, Tradeverifyd and Microsoft.</p>';
      el.appendChild(wrap);

      var fig = wrap.querySelector('.b6-fig');
      var W = Math.max(280, Math.floor(fig.getBoundingClientRect().width || el.clientWidth - 32));
      var px = ctx && ctx.px ? ctx.px : function () { return 22; };
      fig.innerHTML = chartSvg(W, px, narrow);
      fig.addEventListener('click', function (e) {
        var g = e.target.closest ? e.target.closest('[data-ev]') : null;
        if (g && ctx) ctx.openEvidence([g.getAttribute('data-ev')]);
      });
      fig.addEventListener('keydown', function (e) {
        if ((e.key === 'Enter') && e.target.getAttribute && e.target.getAttribute('data-ev') && ctx) { e.preventDefault(); ctx.openEvidence([e.target.getAttribute('data-ev')]); }
      });
    }
  });
})();
