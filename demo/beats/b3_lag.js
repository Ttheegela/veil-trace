/* Beat 3: The lag (v3, V3_PLAN.md section 1, b3).
   One point: lists arrive late. By the time a firm is listed, it has usually moved on.
   Data: window.DEMO_DATA.b3 (data/b3_lag.js), derived from build/viz/listing_lag.js, with the LOG 13:12 correction
   (ELEM GROUP's first listing is the US Commerce Entity List, 7 Dec 2023: at least 20 months, not 23).
   One visual: four rows on one time axis. Each row tells the same three-beat story, one beat per click:
     click 1 (arrive)  the dark shipment-record lines sweep in along time            (wipe, one time cursor)
     click 2           blue bars grow from first appearance to the listing; ticks drop in; "at least N months"
     click 3           the "already gone" gaps grow from each last record to its listing; notes; RM Design's
                       Turkey footnote (its own order: one thing moves at a time); then "4 of 5"
   Motion uses the shell's helper (shell.js MOTION): data-reveal / data-anim attributes set with ctx.reveal.
   ?shot=1, jumps, going back, phones and reduced motion show the finished state instantly (the shell does that).
   The Testkomplekt row and its "22 months" moved to the drawer (b3-e10, offscreen) and Q&A 7. */
(function () {
  var D = (window.DEMO_DATA || {}).b3;
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function t(s) { return Date.parse(s + 'T00:00:00Z'); }
  function fmtMon(s) { var p = s.split('-'); return MON[+p[1] - 1] + ' ' + p[0]; }

  var CSS = [
    '#beat-b3{--b3-idea:var(--s-idea,6.3vh);--b3-num:var(--s-num,8vh);--b3-unit:var(--s-unit,4.1vh);--b3-line:var(--s-line,2.8vh);--b3-body:var(--s-body,2.6vh);--b3-min:var(--s-min,2.05vh);--b3-u:var(--u,.74vh)}',
    '#beat-b3 .b3-wrap{display:flex;flex-direction:column;height:100%;box-sizing:border-box;font-family:var(--font-sans);color:var(--fg);overflow:hidden}',
    '#beat-b3 .b3-idea{margin:0;font:var(--display-weight,600) var(--b3-idea)/1.08 var(--font-display);letter-spacing:var(--display-tracking,-.02em);max-width:none;text-wrap:balance}',
    '#beat-b3 .b3-lab{display:inline-block;margin-right:.9em;font:500 var(--b3-min)/1 var(--font-sans);letter-spacing:.08em;text-transform:uppercase;color:var(--muted-fg);vertical-align:.12em}',
    '#beat-b3 .b3-explain{margin:calc(var(--b3-u)*2) 0 0;font-size:var(--b3-line);line-height:1.3;color:var(--fg);max-width:none}',
    '#beat-b3 .b3-main{flex:1 1 auto;min-height:0;display:grid;grid-template-columns:minmax(0,9fr) minmax(0,3fr);gap:calc(var(--b3-u)*6);margin-top:calc(var(--b3-u)*3)}',
    '#beat-b3 .b3-chart{position:relative;min-height:0;min-width:0}',
    '#beat-b3 svg{display:block;width:100%;height:100%;overflow:visible;font-family:var(--font-sans)}',
    '#beat-b3 .b3-nums{display:flex;flex-direction:column;justify-content:center;min-width:0}',
    '#beat-b3 .b3-n{display:block;text-align:left;background:none;border:0;padding:0;margin:0;color:inherit;font:inherit;cursor:pointer}',
    '#beat-b3 .b3-n-v{display:block;font:var(--display-weight,600) var(--b3-num)/.96 var(--font-display);letter-spacing:-.02em;font-variant-numeric:tabular-nums lining-nums;color:var(--fg);white-space:nowrap}',
    '#beat-b3 .b3-n-c{display:block;margin-top:calc(var(--b3-u)*1.5);font-size:var(--b3-body);line-height:1.3;color:var(--muted-fg)}',
    '#beat-b3 .b3-n:hover .b3-n-v,#beat-b3 .b3-n:focus-visible .b3-n-v{text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:.12em}',
    '#beat-b3 .b3-why{margin:calc(var(--b3-u)*2) 0 0;padding-top:calc(var(--b3-u)*2);border-top:1px solid color-mix(in oklab,var(--border) 45%,transparent);font-size:var(--b3-line);line-height:1.3}',
    '#beat-b3 .b3-click{cursor:pointer}',
    '#beat-b3 .b3-click:focus{outline:none}',
    '#beat-b3 .b3-click:hover .b3-hov,#beat-b3 .b3-click:focus-visible .b3-hov{text-decoration:underline}',
    '#beat-b3 .b3-click:focus-visible .b3-hov{outline:2px solid var(--accent);outline-offset:3px}',
    /* phone / narrow layout (spec 4.8): rem sizes, everything shown, scrolling is the reveal */
    '#beat-b3 .b3-wrap.b3-narrow{height:auto;overflow:visible}',
    '#beat-b3 .b3-narrow .b3-idea{font-size:1.75rem}',
    '#beat-b3 .b3-narrow .b3-explain,#beat-b3 .b3-narrow .b3-why{font-size:1.0625rem}',
    '#beat-b3 .b3-narrow .b3-lab{font-size:.9375rem;display:block;margin:0 0 .25rem}',
    '#beat-b3 .b3-narrow .b3-main{display:flex;flex-direction:column;gap:1.25rem;margin-top:1rem}',
    '#beat-b3 .b3-narrow .b3-n-v{font-size:2.75rem}',
    '#beat-b3 .b3-narrow .b3-n-c{font-size:1.0625rem}',
    '#beat-b3 .b3-rows{display:flex;flex-direction:column;gap:.9rem}',
    '#beat-b3 .b3-row{display:block;width:100%;text-align:left;background:none;border:0;padding:0;color:inherit;font:inherit;cursor:pointer}',
    '#beat-b3 .b3-row-name{font-weight:600;font-size:1.0625rem}',
    '#beat-b3 .b3-row-role{color:var(--muted-fg);font-size:.9375rem}',
    '#beat-b3 .b3-row-bar{margin-top:.35rem;padding:.45rem .6rem;background:color-mix(in oklab,var(--accent) 16%,transparent);border:1.5px solid var(--accent);font-size:1rem}',
    '#beat-b3 .b3-row-note{margin-top:.25rem;color:var(--muted-fg);font-size:.9375rem}'
  ].join('\n');

  /* ---------------- evidence (ids unchanged; plain claims; file names go in receipt) ---------------- */
  var evidence = [
    { id: 'b3-e5', claim: 'For the four companies on the chart, the time from their first sign (their registration as a company, or their first shipment record) to their first official listing runs from 15 to 20 months: ELEM GROUP at least 20, STRELOI EKOMMERTS at least 18, RM Design and Development at least 16, ITIC LLC FZ at least 15. We say "at least" because activity may have started before our first record. (Corrected: an earlier version said 15 to 23 months, using ELEM GROUP\'s later Treasury listing instead of its first listing.)', value: 'at least 15 to 20 months', source: 'Worked out from the four first-listing dates and first-sign dates below (b3-e1 to b3-e4).', receipt: 'build/viz/listing_lag.js; LOG_2026-09-25 10:35 and 13:12 CORRECTED', check: 'verified' },
    { id: 'b3-e1', claim: 'ELEM GROUP, a shipper in Almaty, Kazakhstan, was registered as a company on 14 Mar 2022, 18 days after the invasion. Its first US listing is the Commerce Department\'s Entity List (firms that need a US licence to be supplied), on 7 Dec 2023: at least 20 months later, the longest wait of the four. The address matches the later listing. The US Treasury then put it on its sanctions list on 23 Feb 2024. Its own shipment records run from 12 Jun 2022 to 19 Sep 2023.', value: 'at least 20 months', source: 'US Federal Register 88 FR 85097 (Entity List, 7 Dec 2023), confirmed on the US consolidated screening list; US Treasury sanctions action, 23 Feb 2024; Kazakhstan company registry and shipment records, via Sayari.', receipt: '88 FR 85097; US consolidated screening list; ofac.treasury.gov/recent-actions/20240223; pulls/sayari/20260925T134427Z_get_entity_summary.json; LOG_2026-09-25 13:12 CORRECTED', check: 'official' },
    { id: 'b3-e2', claim: 'RM Design and Development, a shipper in Bishkek, Kyrgyzstan, was registered on 17 Mar 2022 (the US listing itself says "Established 17 Mar 2022"). The US Treasury listed it on 20 Jul 2023: at least 16 months later. The dark line on its row is its shipment records on the Kyrgyz route, 21 Apr 2022 to 26 Jun 2023. No earlier Entity List entry.', value: 'at least 16 months', source: 'US Federal Register notice of the 20 Jul 2023 Treasury action (published 8 Aug 2023); company registry and shipment records via Sayari.', receipt: 'Federal Register 2023-16934; pulls/sayari/20260925T134432Z_get_entity_summary.json; river.js (Kyrgyz route series); LOG_2026-09-25 13:12', check: 'official' },
    { id: 'b3-e3', claim: 'STRELOI EKOMMERTS, a buyer in St Petersburg, Russia (the buyer on the Kazakhstan route), has its first shipment record on 12 Jun 2022 and was listed by the US Treasury on 12 Dec 2023: at least 18 months later. A sister firm at the same address, LLC STRELOI, was listed on 14 Sep 2023 (the Entity List\'s "Streloy" is also that older firm); neither is used for the lag.', value: 'at least 18 months', source: 'US Treasury sanctions action, 12 Dec 2023; shipment records via Sayari.', receipt: 'ofac.treasury.gov/recent-actions/20231212; pulls/sayari/20260925T142852502069Z_29268_search_trade_facets.json; LOG_2026-09-25 13:12', check: 'official' },
    { id: 'b3-e4', claim: 'ITIC LLC FZ, the top chip shipper on the UAE route (Dubai), has its first shipment record into Russia on 6 Mar 2023 and was listed by the US Treasury on 12 Jun 2024: at least 15 months later. A data provider\'s flag still called it "not sanctioned"; that flag is wrong.', value: 'at least 15 months', source: 'US Treasury sanctions action, 12 Jun 2024; shipment records via Sayari.', receipt: 'ofac.treasury.gov/recent-actions/20240612 (list row 49398); pulls/sayari/20260925T142849065416Z_25848_search_trade_facets.json', check: 'official' },
    { id: 'b3-e6', claim: 'On the Kyrgyz and Kazakh routes, 4 of the 5 listed shipping firms had already left these routes before they were listed. Leaving a route is not the same as stopping: some kept shipping into Russia from other countries (for example Thailand and Hong Kong). RM Design and Development\'s last record on the Kyrgyz route is 26 Jun 2023, 24 days before its listing on 20 Jul 2023. Of the four firms on the chart, three had no records left at all by their listing day: ELEM GROUP (last record 19 Sep 2023, first listed 7 Dec 2023), STRELOI EKOMMERTS (19 Sep 2023, listed 12 Dec 2023), ITIC LLC FZ (26 Jan 2024, listed 12 Jun 2024). Records thin out after late 2023, so "no records" may partly be the data stopping.', value: '4 of 5', source: 'Shipment records via Sayari, checked a second time by our skeptic.', receipt: 'listing_lag.js (last_record_seen); river.js; LOG_2026-09-25 10:51 (verified), wording per 12:25', check: 'verified' },
    { id: 'b3-e7', claim: 'RM Design and Development kept appearing after its listing: 40 shipment records under the Bishkek firm\'s own Kyrgyz-registered name, 28 Jul to 29 Sep 2023, declared as leaving Turkey for Russian buyers (network switches, rugged computers, power supplies, and chips). In all, 76 such records run from Aug 2022: a few in 2022 and early 2023, a batch of 24 on 17 Jul 2023 (3 days before the listing), then the 40 after. Most give an Istanbul address. This is the Bishkek firm\'s own record, not the separate Turkish "RM DESIGN" company record, which we could not prove is the same company. "Leaving Turkey" is the declared country, not a traced route. So it left the Kyrgyz route; it did not stop.', value: '40 records', source: 'Shipment records via Sayari, all pages pulled (76 rows), recounted by our skeptic.', receipt: 'pulls/sayari/20260925T160814625735Z_5552, 20260925T160848855403Z_8812, 20260925T160906801597Z_19152 _search_shipments.json (supplier entity WBo7TmupYPexuLKYQ1yMZQ); LOG_2026-09-25 12:25', check: 'verified' },
    { id: 'b3-e11', claim: 'About 81% of chip shipment records into Russia come from Russia\'s own customs data, which thins out from late 2023 (the dashed, hatched zone starts 1 Oct 2023). A company that seems to stop in this zone may be the data stopping.', value: 'after late 2023', source: 'Coverage notes on the shipment records (Sayari trade data).', receipt: 'listing_lag.js caveats; Sayari trade facets', check: 'approximate' },
    { id: 'b3-e13', offscreen: true, claim: 'The exact listing dates behind the ticks on the chart: ELEM GROUP 7 Dec 2023 (US Commerce Entity List; US Treasury followed on 23 Feb 2024), RM Design and Development 20 Jul 2023, STRELOI EKOMMERTS 12 Dec 2023, ITIC LLC FZ 12 Jun 2024 (all three US Treasury). ELEM GROUP has the longest wait of the four.', value: 'listing dates', source: 'Official listing pages (see b3-e1 to b3-e4).', receipt: 'listing_lag.js; LOG_2026-09-25 10:35, 13:12 CORRECTED', check: 'official' },
    { id: 'b3-e10', offscreen: true, claim: 'A listing does not stop every buyer. Testkomplekt, the Russian buyer from the "New names" screen, was listed by the US Treasury on 19 May 2023 (UK on 8 Aug 2023). Its shipment records continue to 10 Mar 2025, about 22 months after its own US listing: at least 70 records after the US listing date. (On the v2 lag screen; moved here in v3 so the screen keeps one point. Q&A 7.)', value: '22 months', source: 'US Treasury sanctions action, 19 May 2023; UK Sanctions List; shipment records via Sayari.', receipt: 'Treasury jy1494; UK Sanctions List RUS1949; listing_lag.js', check: 'verified' },
    { id: 'b3-e8', offscreen: true, claim: 'Another listed buyer still receiving: Enkor Grupp (Kaliningrad) was listed by the US Treasury on 14 Sep 2023. It has 2 records before and at least 5 after, the last on 21 Jan 2025: 99.99% silicon from Xinjiang Daqo, a Chinese maker on the US Commerce Department\'s Entity List since 24 Jun 2021 (a list of firms that need a US licence to be supplied). The buyer\'s tax number matches the listed company.', value: '5 after listing', source: 'US Treasury sanctions action, 14 Sep 2023; US Federal Register (Entity List); shipment records via Sayari.', receipt: 'OFAC recent actions 2023-09-14; Federal Register 2023-21224; listing_lag.js', check: 'verified' },
    { id: 'b3-e9', offscreen: true, claim: 'Another listed buyer still receiving: Titan-Micro was listed by the US Treasury on 19 May 2023. At least 24 records after that, Sep to Dec 2023, all from Sinno Electronics (Hong Kong), itself on the US Commerce Entity List (28 Jun 2022) and the US Treasury list (30 Sep 2022). Tax number matches.', value: '24 after listing', source: 'US Treasury sanctions action, 19 May 2023; shipment records via Sayari.', receipt: 'Treasury jy1494; listing_lag.js', check: 'verified' },
    { id: 'b3-e12', offscreen: true, claim: 'Russia\'s full-scale invasion of Ukraine began on 24 Feb 2022. The chart runs from 1 Jan 2022 to the end of 2024.', value: '24 Feb 2022', source: 'Public record.', check: 'official' }
  ];

  var glossary = [
    { term: 'Sanctions list', def: 'A government\'s list of companies nobody may trade with.' },
    { term: 'Listed / listing', def: 'Added by a government to a sanctions list or a trade blacklist.' },
    { term: 'US Treasury sanctions list (OFAC)', def: 'The main US blacklist, run by the Treasury\'s Office of Foreign Assets Control; it cuts firms off from dollars.' },
    { term: 'Entity List', def: 'A US Commerce Department list of firms that need a US licence to be supplied.' },
    { term: 'Shipment records', def: 'Border paperwork, one entry per shipment. We count shipments, not dollar values.' },
    { term: 'At least', def: 'The true gap may be longer: our records may start after the company did.' },
    { term: 'Left a route', def: 'No more records from that country. Not the same as stopping: a firm can ship from somewhere else.' },
    { term: 'Dashed or hatched', def: 'Less certain. Here: shipment records thin out after late 2023.' },
    { term: 'Lead', def: 'A reason to look closer, not proof of wrongdoing.' }
  ];

  var laneEv = { elem: 'b3-e1', rm: 'b3-e2', streloi: 'b3-e3', itic: 'b3-e4' };

  /* ---------------- helpers ---------------- */
  function el(tag, attrs, parent, text) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }
  function clickable(g, ids, ctx, label) {
    g.setAttribute('class', ((g.getAttribute('class') || '') + ' b3-click').trim());
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', label + ' (open sources)');
    g.addEventListener('click', function () { ctx.openEvidence(ids); });
    g.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); ctx.openEvidence(ids); } });
  }
  function lines(parent, x, y, lh, arr, attrs) {
    var tx = el('text', Object.assign({ x: x, y: y }, attrs), parent);
    arr.forEach(function (s, i) { el('tspan', { x: x, dy: i ? lh : 0 }, tx, s); });
    return tx;
  }
  var HALO = { stroke: 'var(--bg)', 'stroke-width': 7, 'stroke-linejoin': 'round', 'paint-order': 'stroke' };
  function halo(a) { return Object.assign({}, HALO, a); }
  /* a dimension bracket |____| hung under the record line: caps rise from y to yTop. Its own <g> (no transform
     attribute) so "grow" scales it from its own left end. */
  function bracket(parent, xa, xb, y, yTop, attrs) {
    var inner = el('g', {}, parent);
    var w = Math.max(2, xb - xa);
    el('path', Object.assign({ d: 'M' + xa + ' ' + yTop + 'V' + y + 'H' + (xa + w) + 'V' + yTop, fill: 'none', 'stroke-linejoin': 'miter' }, attrs), inner);
    return inner;
  }

  /* ---------------- the chart (projector) ---------------- */
  function drawChart(host, ctx) {
    var W = Math.max(560, host.clientWidth), H = Math.max(360, host.clientHeight);
    host.innerHTML = '';
    var vh = (window.innerHeight || 1080) / 100;
    var fL = Math.max(12, 2.25 * vh);   // direct labels, 24 px at 1080
    var fN = Math.max(13, 2.4 * vh);    // annotations, 26 px
    var fM = Math.max(11, 2.05 * vh);   // ticks and small labels, 22 px (the floor)
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img',
      'aria-label': 'Timeline of four listed companies. Each was listed at least 15 to 20 months after it first appeared. By the day it was listed, each had already left its route: three had no shipment records left at all, and RM Design and Development had left the Kyrgyz route 24 days before its listing (it then has 40 records declared as leaving Turkey).' }, host);

    // label column fits the longest one-line name (measured), capped
    var probe = el('text', { x: -9999, y: -9999, 'font-size': fL, 'font-weight': 600 }, svg, 'STRELOI EKOMMERTS');
    var labelW = Math.min(Math.max(fL * 8, probe.getComputedTextLength() + fL * 0.3), W * 0.26);
    svg.removeChild(probe);
    var x0 = labelW + fL * 0.8, x1 = W - 2;
    var r0 = t(D.range[0]), r1 = t(D.range[1]);
    function X(s) { return x0 + (t(s) - r0) / (r1 - r0) * (x1 - x0); }

    var defs = el('defs', {}, svg);
    var pat = el('pattern', { id: 'b3-hatch', width: 12, height: 12, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 12, stroke: 'var(--fg)', 'stroke-width': 3, 'stroke-opacity': 0.12 }, pat);

    // vertical budget: year labels, the zone label (2 lines), then the rows
    var axisY = fM * 1.0;
    var zoneLbl1 = axisY + fN * 1.45, zoneLbl2 = zoneLbl1 + fN * 1.2;
    var rowsTop = zoneLbl2 + fN * 0.5;
    var rowsBot = H - fM * 0.4;
    var weights = { elem: 1, rm: 1.7, streloi: 1, itic: 1 };
    var wsum = D.lanes.reduce(function (n, L) { return n + (weights[L.id] || 1); }, 0);
    var unit = (rowsBot - rowsTop) / wsum;
    var barH = Math.min(fL * 1.55, unit * 0.36);
    var padTop = fM * 1.35;             // room above each bar for "first appeared" / "listed"
    var recGap = Math.max(7, barH * 0.26); // the record line sits just under the bar
    var plotT = axisY + fM * 0.4, plotB = H;

    // thin-data zone: dashed edge + light hatch (dashed means less certain). Static from the first frame.
    var thinX = X(D.thinFrom);
    var zone = el('g', {}, svg);
    el('rect', { x: thinX, y: plotT, width: x1 - thinX, height: plotB - plotT, fill: 'url(#b3-hatch)' }, zone);
    el('line', { x1: thinX, x2: thinX, y1: plotT, y2: plotB, stroke: 'var(--fg)', 'stroke-opacity': 0.55, 'stroke-width': 1.5, 'stroke-dasharray': '6 5' }, zone);
    var zl = el('g', {}, zone);
    var zt = el('text', halo({ x: x1, y: zoneLbl1, 'font-size': fN, 'font-weight': 500, fill: 'var(--fg)', 'text-anchor': 'end' }), zl);
    el('tspan', { 'font-weight': 600, class: 'b3-hov' }, zt, 'Records thin out after late 2023:');
    el('text', halo({ x: x1, y: zoneLbl2, 'font-size': fN, 'font-weight': 500, fill: 'var(--fg)', 'text-anchor': 'end' }), zl, 'hatched means less certain');
    clickable(zl, ['b3-e11'], ctx, 'Records thin out after late 2023');

    // year boundaries and labels
    ['2022', '2023', '2024', '2025'].forEach(function (y) {
      var xx = X(y + '-01-01');
      el('line', { x1: xx, x2: xx, y1: plotT, y2: plotB, stroke: 'var(--border)', 'stroke-opacity': 0.3, 'stroke-width': 1 }, svg);
      if (y !== '2025') el('text', { x: xx + 6, y: axisY, 'font-size': fM, 'font-weight': 500, fill: 'var(--muted-fg)' }, svg, y);
    });

    // layers, one per click and order (the shell hides each until its click, then plays it)
    var recLayer = ctx.reveal(el('g', {}, svg), 1, 'wipe', { order: 0, dur: 1100, from: 'left' });      // click 1
    var barLayer = el('g', {}, svg);                                                                     // click 2, per bar
    var tickLayer = ctx.reveal(el('g', {}, svg), 2, 'fade', { order: 1, dur: 400 });
    var monLayer = ctx.reveal(el('g', {}, svg), 2, 'fade', { order: 2, dur: 400 });
    var gapLayer = el('g', {}, svg);                                                                     // click 3, per gap
    var noteLayer = ctx.reveal(el('g', {}, svg), 3, 'fade', { order: 1, dur: 500 });
    // RM Design's Turkey records: its own, later order, so it lands after the gap notes and before "4 of 5" (one thing at a time)
    var turkeyLayer = ctx.reveal(el('g', {}, svg), 3, 'fade', { order: 2, dur: 400 });

    var y = rowsTop;
    D.lanes.forEach(function (L, idx) {
      var rowH = unit * (weights[L.id] || 1);
      var top = y + padTop, cy = top + barH / 2, bot = top + barH;
      var recY = bot + recGap;
      y += rowH;
      var sx = X(L.start), lx = X(L.listed);
      var recStart = L.firstRecord, recEnd = L.routeLastRecord || L.lastRecord;

      // left labels: name (wrapped if long), then role; centred on the bar and its record line
      var nameLines = L.name.length > 18 ? L.name.replace(/^(.{1,16})\s(.*)$/, '$1\n$2').split('\n') : [L.name];
      var blockH = nameLines.length * fL * 1.15 + fM * 1.2;
      var nameTop = (top + recY) / 2 - blockH / 2 + fL * 0.9;
      lines(svg, 0, nameTop, fL * 1.15, nameLines, { 'font-size': fL, 'font-weight': 600, fill: 'var(--fg)' });
      el('text', { x: 0, y: nameTop + nameLines.length * fL * 1.15 + fM * 0.1, 'font-size': fM, 'font-weight': 500, fill: 'var(--muted-fg)' }, svg, L.role);

      // click 1: the shipment records (dark line), one time sweep for all four rows
      if (recStart && recEnd) {
        var rl = el('line', { x1: X(recStart), x2: X(recEnd), y1: recY, y2: recY, stroke: 'var(--fg)', 'stroke-opacity': 0.78, 'stroke-width': 5, 'stroke-linecap': 'butt' }, recLayer);
        clickable(rl, L.id === 'rm' ? ['b3-e2', 'b3-e6'] : [laneEv[L.id]], ctx, L.name + ': shipment records ' + fmtMon(recStart) + ' to ' + fmtMon(recEnd));
      }

      // click 2, order 0: the lag bar grows from first appearance to the listing (the screen's one accent)
      var bg = ctx.reveal(el('g', {}, barLayer), 2, 'grow', { order: 0, dur: 1000, from: 'left' });
      el('rect', { x: sx, y: top, width: Math.max(2, lx - sx), height: barH, fill: 'var(--accent)', 'fill-opacity': 0.16, stroke: 'var(--accent)', 'stroke-width': 1.5 }, bg);
      clickable(bg, [laneEv[L.id], 'b3-e5'], ctx, L.name + ': at least ' + L.months + ' months from first appearing to being listed');

      // click 2, order 1: the listing tick (neutral, never red) drops in at the bar's end
      el('line', { x1: lx, x2: lx, y1: top - 6, y2: recY + 8, stroke: 'var(--fg)', 'stroke-width': 3 }, tickLayer);
      if (idx === 0) {   // the words once, on the top row; the other rows read by analogy
        el('text', halo({ x: lx, y: top - 10, 'font-size': fM, 'font-weight': 600, fill: 'var(--fg)', 'text-anchor': 'middle' }), tickLayer, 'listed');
        el('text', halo({ x: sx, y: top - 10, 'font-size': fM, 'font-weight': 500, fill: 'var(--muted-fg)' }), tickLayer, 'first appeared');
      }

      // click 2, order 2: "at least N months" inside the bar
      var mg = el('g', {}, monLayer);
      var nt = el('text', { x: sx + fL * 0.55, y: cy + fL * 0.36, 'font-size': fL, fill: 'var(--fg)' }, mg);
      el('tspan', { 'font-weight': 500 }, nt, 'at least ');
      el('tspan', { 'font-weight': 700, class: 'b3-hov' }, nt, L.months + ' months');
      clickable(mg, [laneEv[L.id], 'b3-e5'], ctx, L.name + ': at least ' + L.months + ' months');

      // click 3, order 0: the "already gone" gap grows from the last record to the listing tick
      if (recEnd) {
        var gg = el('g', {}, gapLayer);
        var br = bracket(gg, X(recEnd), lx, recY + fM * 0.62, recY + 3.5, { stroke: 'var(--fg)', 'stroke-opacity': 0.8, 'stroke-width': 2.5 });
        ctx.reveal(br, 3, 'grow', { order: 0, dur: 800, from: 'left' });
        clickable(gg, ['b3-e6'], ctx, L.name + ': no records left on this route when it was listed');
      }

      // click 3, order 1: the notes
      if (idx === 0) {
        var n0 = el('g', {}, noteLayer);
        var nt0 = lines(n0, lx + fM * 0.7, recY + fN * 0.5, fN * 1.12, ['no records left', 'when it was listed'], halo({ 'font-size': fN, 'font-weight': 600, fill: 'var(--fg)' }));
        nt0.querySelector('tspan').setAttribute('class', 'b3-hov');
        clickable(n0, ['b3-e6'], ctx, 'No records left when it was listed');
      }
      if (L.id === 'rm') {
        // the route: left 24 days before the listing (under the gap, ending at the tick)
        var n1 = el('g', {}, noteLayer);
        var t1 = lines(n1, lx, recY + fM * 0.62 + fN * 1.1, fN * 1.12, ['left this route 24 days', 'before it was listed'], halo({ 'font-size': fN, 'font-weight': 600, fill: 'var(--fg)', 'text-anchor': 'end' }));
        t1.querySelector('tspan').setAttribute('class', 'b3-hov');
        clickable(n1, ['b3-e6'], ctx, 'RM Design and Development left this route 24 days before it was listed');
        // ONE subordinate annotation (held for Alex: stays visible): its records after the listing, declared as leaving Turkey
        var n2 = el('g', {}, turkeyLayer);
        L.after.forEach(function (a) {
          el('circle', { cx: X(a.date), cy: recY, r: Math.max(3, fM * 0.2), fill: 'var(--muted-fg)' }, n2);
        });
        var ax = X(L.after[L.after.length - 1].date) + fM * 0.7;
        var t2 = lines(n2, ax, recY + fM * 0.36, fM * 1.15, ['kept shipping after sanctions:', L.afterCount + ' records, leaving Turkey'], halo({ 'font-size': fM, 'font-weight': 500, fill: 'var(--muted-fg)' }));
        t2.querySelector('tspan').setAttribute('class', 'b3-hov');
        clickable(n2, ['b3-e7'], ctx, 'RM Design and Development kept shipping after being sanctioned: ' + L.afterCount + ' records, declared as leaving Turkey');
      }
    });
  }

  /* ---------------- narrow layout (phone): all steps shown, scrolling is the reveal ---------------- */
  function drawRows(host, ctx) {
    host.innerHTML = '';
    var box = document.createElement('div'); box.className = 'b3-rows';
    D.lanes.forEach(function (L) {
      var b = document.createElement('button'); b.className = 'b3-row'; b.type = 'button';
      b.innerHTML = '<div class="b3-row-name"></div><div class="b3-row-role"></div><div class="b3-row-bar"></div><div class="b3-row-note"></div>';
      b.querySelector('.b3-row-name').textContent = L.name;
      b.querySelector('.b3-row-role').textContent = L.role;
      b.querySelector('.b3-row-bar').innerHTML = 'at least <b></b> from first appearing to being listed';
      b.querySelector('.b3-row-bar b').textContent = L.months + ' months';
      var note = 'Listed ' + fmtMon(L.listed) + '. ';
      if (L.id === 'rm') note += 'Left this route 24 days before it was listed. It kept shipping after being sanctioned: ' + L.afterCount + ' records, declared as leaving Turkey.';
      else note += 'No records left when it was listed.';
      b.querySelector('.b3-row-note').textContent = note;
      b.addEventListener('click', function () { ctx.openEvidence(L.id === 'rm' ? ['b3-e2', 'b3-e6', 'b3-e7'] : [laneEv[L.id], 'b3-e6', 'b3-e5']); });
      box.appendChild(b);
    });
    var n = document.createElement('p'); n.className = 'b3-row-note';
    n.textContent = 'Records thin out after late 2023, so every gap is "at least".';
    box.appendChild(n);
    host.appendChild(box);
  }

  function numBtn(value, caption, ids, ctx) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'b3-n d-num';
    b.innerHTML = '<span class="b3-n-v d-big-n"></span><span class="b3-n-c d-big-cap"></span>';
    b.querySelector('.b3-n-v').textContent = value;
    b.querySelector('.b3-n-c').textContent = caption;
    b.setAttribute('aria-label', value + ': ' + caption + ' (open sources)');
    b.addEventListener('click', function () { ctx.openEvidence(ids); });
    return b;
  }

  var SAY1 = 'Four companies from these routes. The dark lines are their shipment records.';
  var SAY2 = 'Governments did list them. But at least 15 to 20 months after they first appeared.';
  var SAY3 = 'By then, most had moved on: 4 of 5 listed shippers had already left these routes. RM Design left its route 24 days before its listing. A clean screen means not listed yet, not safe.';

  window.DEMO.register({
    id: 'b3',
    order: 3,
    kicker: 'The lag',
    title: 'Lists arrive late: by the time a firm is listed, it has usually moved on',
    seconds: 30,
    steps: 3,
    stepLabels: [
      'Arrive: the four companies\' shipment records sweep in along time',
      'Click: blue bars grow from first appearance to the listing; ticks, then "at least N months"',
      'Click: the gap from each last record to its listing grows; its notes; RM Design\'s Turkey footnote; then "4 of 5"'
    ],
    stepNotes: [
      'SAY: "' + SAY1 + '"\n\nMOVE: the dark record lines sweep in left to right, like time passing. Nothing else moves.',
      'SAY: "' + SAY2 + '"\n\nMOVE: a blue bar grows on each row from when the company first appeared to the day it was listed; the listing ticks drop in; then "at least N months".\nNUMBER: 15 to 20 months (LOG 13:12 CORRECTED: ELEM GROUP\'s first listing is the Entity List, 7 Dec 2023. Never say 23.)',
      'SAY: "' + SAY3 + '"\n\nMOVE: the gap between each last record and its listing grows; "no records left when it was listed" and "left this route 24 days before" fade in; then RM Design\'s small grey note ("it kept shipping after being sanctioned: 40 records, declared as leaving Turkey"); then "4 of 5".\nCUE: the grey note is a footnote to "moved on", not a second point. Do not speak it unless asked.\nIF ASKED about the grey dots after RM Design\'s listing: 40 records under its own name, declared as leaving Turkey, 28 Jul to 29 Sep 2023. It left the Kyrgyz route; it did not stop.'
    ],
    notes: [
      '(click, arrive) SAY: "' + SAY1 + '"',
      '(click) SAY: "' + SAY2 + '"',
      '(click) SAY: "' + SAY3 + '"',
      'NUMBER: say 15 to 20 months, never 23 (LOG 13:12 CORRECTED: ELEM GROUP\'s first listing is the US Commerce Entity List, 7 Dec 2023; the Treasury followed on 23 Feb 2024).',
      'CUE: point at the dashed, hatched zone only if asked: "at least", because Russia-side records thin out after late 2023.',
      'IF ASKED about the dots after RM Design\'s listing: 40 records under its own name, declared as leaving Turkey, 28 Jul to 29 Sep 2023. It had used Turkey lightly since Aug 2022, and sent a big batch 3 days before its listing. Its own record, not the separate Turkish company record we dropped. Left the route, not stopped.',
      'IF ASKED "does a listing stop the trade?" (Q&A 7): not always. The buyer from the "new names" screen, Testkomplekt, kept receiving shipments at least 22 months after its own US listing (drawer, More in the data). Two more listed buyers too (Enkor Grupp at least 5, Titan-Micro at least 24).',
      'GUARD: documented facts stated plainly with their source; leads only for our inferences. Shipment records, not values. Declared countries, not physical routes. Counts after listing are minimums.',
      'Q&A only: 240 pairs of Russia-programme firms at one address were listed in different waves, median about 167 days apart (approximate dates).'
    ].join('\n'),
    evidence: evidence,
    glossary: glossary,
    render: function (root, ctx) {
      if (!root.id) root.id = 'beat-b3';
      if (!document.getElementById('b3-style')) {
        var st = document.createElement('style'); st.id = 'b3-style'; st.textContent = CSS;
        document.head.appendChild(st);
      }
      var narrow = ctx.isNarrow;
      var wrap = document.createElement('div');
      wrap.className = 'b3-wrap' + (narrow ? ' b3-narrow' : '');
      wrap.innerHTML =
        '<p class="d-kick">The lag</p>' +
        '<h2 class="b3-idea d-idea">Lists arrive late: by the time a firm is listed, it has usually moved on.</h2>' +
        '<p class="b3-explain d-explain"><span class="b3-lab d-label">What you’re looking at</span>Each row is one listed company. Dark line: its shipment records. Blue bar: from when it first appeared (registered, or first shipped) to the day a government listed it.</p>' +
        '<div class="b3-main"><div class="b3-chart"></div><div class="b3-nums"></div></div>' +
        '<p class="b3-why d-why"><span class="b3-lab d-label">Why it matters</span>For the compliance officer: a clean screening result means “not listed yet”, not “safe”.</p>';
      root.appendChild(wrap);

      var nums = wrap.querySelector('.b3-nums');
      var big = numBtn('4 of 5', 'listed shipping firms on the Kyrgyz and Kazakh routes had already left those routes when they were listed. ELEM GROUP and RM Design are two of them.', ['b3-e6'], ctx);
      ctx.reveal(big, 3, 'rise', { order: 3, dur: 500 });
      nums.appendChild(big);

      var host = wrap.querySelector('.b3-chart');
      if (!D) { host.textContent = 'This chart could not load its data.'; return; }
      function draw() { if (narrow) drawRows(host, ctx); else drawChart(host, ctx); }
      draw();
      if (!narrow && window.ResizeObserver) {
        var last = host.clientWidth + 'x' + host.clientHeight;
        new ResizeObserver(function () {
          var now = host.clientWidth + 'x' + host.clientHeight;
          if (now !== last && host.clientWidth > 0) { last = now; draw(); ctx.refresh(); }
        }).observe(host);
      }
    }
  });
})();
