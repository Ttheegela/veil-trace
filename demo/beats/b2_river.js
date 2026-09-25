/* Beat 2: "New names" (same river, new boats). Data: window.DEMO_DATA.b2 (data/b2_river.js).
   Redesigned per DESIGN_SPEC.md section 2 (b2) and V3_PLAN section 1 (b2). Draws only inside el. Styles scoped to #beat-b2.
   One point: the shipping companies change every few weeks; the flow of chips, and the buyer, stay.
   Three clicks, motion through the shell's data-reveal / data-anim attributes (shell.js MOTION):
   1 (arrive) = the river as one flat slate shape plus the blue total line, wiped in left to right like time passing;
       then "The flow: 1,147 shipments".
   2 = the company bands light up one after another, in the order they first shipped (RM Design first, dark);
       then the RM Design label and "Grey bands" note; then 40 days.
   3 = the buyer's line draws 2019 to 2025; its supplier segments light up under it; then "2019 to 2025".
   v3 moved "21 days", ELEM GROUP's 18 days, the half-year company counts and "six of its new suppliers were later
   listed" to the drawer (offscreen evidence). No libraries. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  var CSS = [
    /* local copies of the spec's projector scale, used only when app.css does not define them */
    '#beat-b2 { --b2-idea: var(--s-idea, 6.3vh); --b2-line: var(--s-line, 2.8vh); --b2-num: var(--s-num, 8vh); --b2-unit: var(--s-unit, 4.1vh);',
    '  --b2-body: var(--s-body, 2.6vh); --b2-min: var(--s-min, 2.05vh); --b2-u: .74vh;',
    '  --b2-s1: light-dark(color-mix(in oklab, var(--fg) 28%, var(--bg)), color-mix(in oklab, var(--fg) 34%, var(--bg)));',
    '  --b2-s2: light-dark(color-mix(in oklab, var(--fg) 18%, var(--bg)), color-mix(in oklab, var(--fg) 22%, var(--bg)));',
    '  --b2-s3: light-dark(color-mix(in oklab, var(--fg) 12%, var(--bg)), color-mix(in oklab, var(--fg) 14%, var(--bg)));',
    '  background: var(--bg); color: var(--fg); font-family: var(--font-sans); }',
    '#beat-b2 .b2-wrap { box-sizing: border-box; width: 100%; height: 100%; display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);',
    '  grid-template-rows: auto auto auto minmax(0, 1fr) auto; column-gap: calc(var(--b2-u) * 6); }',
    '#beat-b2 .b2-wrap > * { min-width: 0; }',
    '#beat-b2 .b2-idea { grid-column: 1 / -1; margin: 0; max-width: 46ch; font: var(--display-weight, 600) var(--b2-idea)/1.08 var(--font-display, var(--font-sans)); letter-spacing: -.02em; text-wrap: balance; }',
    '#beat-b2 .b2-kick { grid-column: 1 / -1; }',
    '#beat-b2 .b2-look { grid-column: 1 / -1; margin: calc(var(--b2-u) * 2) 0 0; font-size: var(--b2-line); line-height: 1.3; color: var(--fg); }',
    '#beat-b2 .b2-tag { display: block; font-size: var(--b2-min); font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--muted-fg); margin-bottom: .2em; }',
    '#beat-b2 .b2-hero { position: relative; min-height: 0; margin-top: calc(var(--b2-u) * 4); }',
    '#beat-b2 .b2-hero svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }',
    '#beat-b2 .b2-nums { display: flex; flex-direction: column; justify-content: center; gap: calc(var(--b2-u) * 5); margin-top: calc(var(--b2-u) * 1); min-height: 0; }',
    '#beat-b2 .b2-n { margin: 0; }',
    '#beat-b2 .b2-big { display: block; font: var(--display-weight, 600) var(--b2-num)/1 var(--font-display, var(--font-sans)); letter-spacing: -.02em; font-variant-numeric: tabular-nums lining-nums; color: var(--fg); }',
    '#beat-b2 .b2-big small { font-size: var(--b2-unit); font-weight: 500; letter-spacing: 0; margin-left: .15em; }',
    '#beat-b2 .b2-cap { display: block; margin-top: .1em; font-size: var(--b2-body); line-height: 1.3; color: var(--muted-fg); max-width: 46ch; }',
    '#beat-b2 .b2-cap b { color: var(--fg); font-weight: 600; }',
    '#beat-b2 .b2-why { grid-column: 1 / -1; margin: calc(var(--b2-u) * 3) 0 0; padding-top: calc(var(--b2-u) * 2); border-top: 1px solid var(--hairline, color-mix(in oklab, var(--border) 45%, transparent)); font-size: var(--b2-line); line-height: 1.3; }',
    /* numbers are buttons: no underline on the projector, underline on hover / focus */
    '#beat-b2 .b2-ev { font: inherit; color: inherit; background: none; border: 0; padding: 0; margin: 0; cursor: pointer; border-radius: 2px; text-decoration: none; }',
    '#beat-b2 .b2-ev:hover, #beat-b2 .b2-ev:focus-visible { text-decoration: underline dotted; text-underline-offset: .15em; }',
    '#beat-b2 .b2-ev:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }',
    /* micro-timeline under number 3 */
    '#beat-b2 .b2-micro { display: block; width: min(100%, 680px); height: calc(var(--s-note, 2.4vh) * 2.7); margin-top: .35em; overflow: visible; }',
    /* the buyer number carries step 3, so it is set nearly as large as 40 days */
    '#beat-b2 .b2-n3 .b2-big { font-size: calc(var(--b2-num) * .9); }',
    /* svg */
    '#beat-b2 svg text { font-family: var(--font-sans); fill: var(--fg); }',
    '#beat-b2 svg .t-muted { fill: var(--muted-fg); }',
    '#beat-b2 svg .t-note { font-weight: 500; }',
    '#beat-b2 svg .t-strong { font-weight: 600; }',
    '#beat-b2 svg .grid { stroke: color-mix(in oklab, var(--border) 30%, transparent); stroke-width: 1; }',
    '#beat-b2 svg .base { stroke: color-mix(in oklab, var(--border) 60%, transparent); stroke-width: 1; }',
    /* bands: a clear gap between companies, alternating light and mid slate; RM Design is the one dark band */
    '#beat-b2 svg .band { stroke: var(--bg); stroke-width: 2.5; stroke-linejoin: round; }',
    '#beat-b2 svg .s1 { fill: var(--b2-s1); } #beat-b2 svg .s2 { fill: var(--b2-s3); } #beat-b2 svg .s3 { fill: var(--b2-s1); }',
    '#beat-b2 svg .s-rm { fill: color-mix(in oklab, var(--fg) 62%, var(--bg)); }',
    /* step 1: the whole flow as one flat shape, before any company is shown */
    '#beat-b2 svg .sil { fill: var(--b2-s2); }',
    '#beat-b2 svg .t-inv { fill: var(--bg); }',
    '#beat-b2 svg .flow { fill: none; stroke: var(--accent); stroke-width: 3; stroke-linejoin: round; stroke-linecap: round; }',
    '#beat-b2 svg .lead { stroke: color-mix(in oklab, var(--fg) 55%, transparent); stroke-width: 1.5; fill: none; }',
    '#beat-b2 svg .lead-dot { fill: color-mix(in oklab, var(--fg) 55%, transparent); }',
    '#beat-b2 svg .brk { stroke: var(--fg); stroke-width: 1.5; fill: none; }',
    '#beat-b2 svg .buyer { stroke: var(--accent); stroke-width: 4; stroke-linecap: round; }',
    '#beat-b2 svg .sup { stroke: var(--b2-s1); stroke-width: 8; }',
    '#beat-b2 svg .hit { fill: transparent; cursor: pointer; }',
    '#beat-b2 svg [role=button] { cursor: pointer; }',
    '#beat-b2 svg [role=button]:focus-visible { outline: 3px solid var(--accent); }',
    /* narrow (phone): scroll, stack, rem sizes, all steps visible */
    '#beat-b2.b2-narrow { --b2-idea: 1.75rem; --b2-line: 1.1rem; --b2-num: 2.75rem; --b2-unit: 1.25rem; --b2-body: 1.06rem; --b2-min: .95rem; --b2-u: 8px; }',
    '#beat-b2.b2-narrow .b2-wrap { height: auto; grid-template-columns: 1fr; grid-template-rows: auto; }',
    '#beat-b2.b2-narrow .b2-hero { height: 340px; }',
    '#beat-b2 .b2-keylist { margin: .5em 0 0; padding-left: 1.4em; font-size: var(--b2-body); color: var(--muted-fg); } #beat-b2 .b2-keylist:empty { display: none; }'
  ].join('\n');

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function parse(s) { var p = s.split('-'); return { y: +p[0], m: +p[1], d: +(p[2] || 1) }; }
  function dim(y, m) { return new Date(y, m, 0).getDate(); }
  /* months since Jan of baseYear, fractional */
  function mIdx(s, baseYear) { var p = parse(s); return (p.y - baseYear) * 12 + (p.m - 1) + (p.d - 1) / dim(p.y, p.m); }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  function mk(tag, attrs, parent, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function clickable(node, ids, ctx, label) {
    node.setAttribute('role', 'button');
    node.setAttribute('tabindex', '0');
    if (label) node.setAttribute('aria-label', label + ' (show sources)');
    node.setAttribute('data-ev', ids.join(','));
    node.addEventListener('click', function () { ctx.openEvidence(ids); });
    node.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ev.stopPropagation(); ctx.openEvidence(ids); } });
  }
  /* multi-line text; lines = [[part, ...], ...], part = string or {t, ids, strong} */
  function note(g, x, y, lines, anchor, fs, ctx, cls) {
    var t = mk('text', { x: x, y: y, 'text-anchor': anchor || 'start', 'font-size': fs, 'class': cls || 't-note' }, g);
    lines.forEach(function (parts, li) {
      parts.forEach(function (p, pi) {
        var a = {};
        if (pi === 0) { a.x = x; a.dy = li === 0 ? 0 : fs * 1.25; }
        if (typeof p === 'string') { mk('tspan', a, t, p); return; }
        if (p.strong) a['class'] = 't-strong';
        var ts = mk('tspan', a, t, p.t);
        if (p.ids) clickable(ts, p.ids, ctx, p.t);
      });
    });
    return t;
  }
  function leader(g, x1, y1, x2, y2) {
    mk('path', { d: 'M' + x1.toFixed(1) + ',' + y1.toFixed(1) + ' L' + x2.toFixed(1) + ',' + y2.toFixed(1), 'class': 'lead' }, g);
    mk('circle', { cx: x2, cy: y2, r: 3, 'class': 'lead-dot' }, g);
  }

  /* Evidence. `source` is plain; file names and internal references live in `receipt`.
     `offscreen: true` = moved off the main screen by the redesign (kept, never deleted). */
  var EVIDENCE = [
    { id: 'b2-e2', offscreen: true, claim: 'RM Design and Development (Bishkek, Kyrgyzstan) was registered as a company on 17 Mar 2022, 21 days after the invasion. The US Treasury sanctions list entry reads "Established 17 Mar 2022".', value: '21 days (registered 17 Mar 2022)', source: 'US Treasury sanctions notice in the Federal Register (2023-16934)', receipt: 'LOG_2026-09-25.md 10:07 and 10:12', check: 'official' },
    { id: 'b2-e1', offscreen: true, claim: 'ELEM GROUP (Almaty, Kazakhstan) was registered on 14 Mar 2022, 18 days after the invasion. It is on the US Treasury sanctions list.', value: '18 days (registered 14 Mar 2022)', source: 'Company registry record via Sayari, saved 25 Sep 2026; US Treasury sanctions list', receipt: 'LOG_2026-09-25.md 10:07 (b10, TRC-22, verified); OFAC SDN entry 47950', check: 'verified' },
    { id: 'b2-e19', offscreen: true, claim: 'Russia began its full-scale invasion of Ukraine on 24 Feb 2022. (The reference date for "21 days" and "18 days", moved off the main screen in v3.)', value: '24 Feb 2022', source: 'Public record', check: 'official' },
    { id: 'b2-e3', claim: 'The flow on the chart: chip shipment records from Kyrgyzstan to Russia, 21 Apr 2022 to 29 Dec 2023, from 14 shipping companies. Counts of shipments, not dollar values. Kyrgyzstan is the country the paperwork declares, not a traced physical route.', value: '1,147 shipments', source: "Russia's customs records, via Sayari, saved 25 Sep 2026", receipt: 'pulls/sayari/20260925T134248Z_search_trade_facets.json; agents/b16/rows_KGZ.json (HS 8542)', check: 'verified' },
    { id: 'b2-e11', claim: 'How the chart is built: shipments per month, stacked by shipping company, Apr 2022 to Dec 2023. Monthly totals: 17, 50, 119, 61, 65, 50, 50, 31, 22 (2022, Apr to Dec); 35, 14, 100, 233, 98, 89, 45, 49, 14, 4, 0, 1 (2023). Only RM Design and Development (the dark band) is named on the chart. Grey bands are other companies; unlisted ones are never named. The thin top band groups 8 small firms (1 to 10 records each), so the chart has 7 bands for 14 companies. Rama Group (UK-listed) is one grey band, named here in the drawer only. One more Kyrgyz firm matches a US Treasury entry by name only (listing date approximate); it is not named on screen.', value: 'chart data', source: "Russia's customs records, via Sayari, saved 25 Sep 2026", receipt: 'build/viz/river.js (extract_river.py from agents/b16 rows; merge rule agents/b16/churn2.py)', check: 'verified' },
    { id: 'b2-e5', offscreen: true, claim: 'On the Kyrgyz route, the number of companies shipping per half-year went 1, 4, 12, 6 (Jan to Jun 2022, Jul to Dec 2022, Jan to Jun 2023, Jul to Dec 2023), while shipments continued: 186, 279, 569 and 113. On screen in v3 the bands lighting up one after another show this churn without the numbers.', value: '1, 4, 12, 6 companies', source: "Russia's customs records, via Sayari; counted by the team and re-checked", receipt: 'agents/b16/churn_summary.json (TRC-28); LOG_2026-09-25.md 10:51 (verified); re-summed from build/viz/river.js', check: 'verified' },
    { id: 'b2-e6', claim: 'On the Kyrgyz route, the typical (median) shipping company was active for 40 days, from its first shipment to its last. 6 of the 14 companies appear on a single day only.', value: '40 days', source: "Russia's customs records, via Sayari; counted by the team and re-checked", receipt: 'agents/b16/churn_summary.json; LOG_2026-09-25.md 10:51 (verified)', check: 'verified' },
    { id: 'b2-e12', claim: 'The buyer Testkomplekt (Russia) appears as one company record from 11 Jan 2019 to 10 Mar 2025, across 9,141 shipment records, while its suppliers change. About six years and two months.', value: '2019 to 2025', source: "Russia's customs records, via Sayari, saved 25 Sep 2026", receipt: 'agents/b17/buyer_timelines.csv; LOG_2026-09-25.md 10:51 (verified)', check: 'verified' },
    { id: 'b2-e14', offscreen: true, claim: 'Six suppliers from Hong Kong, Shenzhen and India shipped to the buyer between 9 Jun 2023 and 31 Mar 2024 (65 records). All six were later put on US lists: Shenzhen A Technology, Shenzhen One World, Flavic FZE, Robotronix Semiconductors, Innovio Ventures, Group Yeoh. Some listing dates are approximate (first seen in OpenSanctions, a public database of sanctions lists).', value: '6 suppliers, all later listed', source: "Russia's customs records, via Sayari; US sanctions lists", receipt: 'agents/b17/buyer_timelines.csv; 20260925T140119Z and 20260925T142912953202Z_720 shipment pulls', check: 'verified' },
    { id: 'b2-e13', offscreen: true, claim: 'Five Western distributors (not named) supplied the buyer from Dec 2019; the last record is 2 Mar 2022 (179 records). These are lawful exits after export controls (rules that require a licence to send sensitive goods abroad), not evasion. None is on a list.', value: 'stopped by 2 Mar 2022', source: "Russia's customs records, via Sayari", receipt: 'agents/b17/buyer_timelines.csv; 20260925T140119Z_search_shipments.json and two further shipment pulls', check: 'verified' },
    { id: 'b2-e18', offscreen: true, claim: 'Two suppliers are not on any list and are not named: a distributor (16 Jun 2022 to 27 May 2023, 24 records) and a Shenzhen trader (10 Jun 2024 to 10 Mar 2025, 69 records). Leads for an agency only; innocent explanations include licensed or uncontrolled goods.', value: 'not named', source: "Russia's customs records, via Sayari; our list checker found no match", receipt: 'agents/b17/buyer_timelines.csv (list checker: no match)', check: 'verified' },
    { id: 'b2-e15', offscreen: true, claim: 'On 30 Oct 2024 the US Treasury listed Shenzhen One World, Shenzhen A Technology and Innovio Ventures; its press release names Testkomplekt as their customer.', value: '30 Oct 2024', source: 'US Treasury press release jy2700', receipt: 'pulls/tavily/20260925T143518915163Z_26216_search.json', check: 'official' },
    { id: 'b2-e16', offscreen: true, claim: 'The buyer itself was put on the US Treasury sanctions list on 19 May 2023 and on the UK list on 8 Aug 2023.', value: '19 May 2023; 8 Aug 2023', source: 'US Treasury recent actions, 19 May 2023 (press release jy1494); UK sanctions list', receipt: 'build/viz/listing_lag.js', check: 'official' },
    { id: 'b2-e17', offscreen: true, claim: 'The buyer kept receiving shipments after its own US listing: last record 10 Mar 2025, about 22 months later.', value: '22 months', source: "Russia's customs records, via Sayari", receipt: 'agents/b17/buyer_timelines.csv; LOG_2026-09-25.md 10:51 (verified)', check: 'verified' },
    { id: 'b2-e4', offscreen: true, claim: 'Kazakhstan to Russia: chip shipment records from 22 May 2022 to 3 Aug 2023, from 4 shipping companies. Counts, not dollar values; declared country, not a traced route.', value: '715 shipments', source: "Russia's customs records, via Sayari", receipt: 'agents/b16/rows_KAZ.json (HS 8542)', check: 'verified' },
    { id: 'b2-e7', offscreen: true, claim: 'The Kazakh route was a relay, one company at a time. ELEM GROUP carried 666 of the 715 records (93%) between 14 Jan and 12 May 2023 (118 days).', value: '93% in 118 days', source: "Russia's customs records, via Sayari; counted by the team and re-checked", receipt: 'agents/b16/churn_summary.json; build/viz/river.js; LOG_2026-09-25.md 10:51 (verified)', check: 'verified' },
    { id: 'b2-e8', offscreen: true, claim: 'RM Design and Development was put on the US Treasury sanctions list on 20 Jul 2023. Its last record on this Kyrgyz route is 26 Jun 2023, 24 days earlier. (Screen 4, "The lag", shows this.)', value: '20 Jul 2023; 24 days', source: 'US Treasury sanctions notice in the Federal Register (2023-16934, published 8 Aug 2023, action 20 Jul 2023)', receipt: 'LOG 10:35 correction', check: 'official' },
    { id: 'b2-e9', offscreen: true, claim: 'ELEM GROUP was first restricted by the US Commerce Department (Entity List) on 7 Dec 2023; the US Treasury sanctions list followed on 23 Feb 2024. Its last record on the Kazakh route is 12 May 2023, 209 days before the first restriction.', value: '7 Dec 2023; 209 days', source: 'US Commerce Entity List, 88 FR 85097 (7 Dec 2023); US Treasury recent actions, 23 Feb 2024', receipt: 'ofac.treasury.gov/recent-actions/20240223; LOG_2026-09-25.md 10:35', check: 'official' },
    { id: 'b2-e10', offscreen: true, claim: 'Rama Group, one of the grey bands on the chart (Jun to Sep 2023; not labelled on screen in v2), was put on the UK sanctions list on 24 Feb 2025. Its last record on this Kyrgyz route is 18 Sep 2023, 525 days earlier.', value: '24 Feb 2025; 525 days', source: 'UK sanctions list', receipt: 'LOG_2026-09-25.md 10:51 (verified row); agents/b17/buyer_timelines.csv', check: 'verified' }
  ];

  var GLOSSARY = [
    { term: 'Shipper / buyer', text: 'The company sending the goods / the company receiving them.' },
    { term: 'Registered (a company)', text: 'Legally set up as a company, on that date.' },
    { term: 'Shipment records', text: 'Border paperwork, one entry per shipment. We count shipments, not dollar values.' },
    { term: 'Sanctions list', text: "A government's list of companies nobody may trade with." },
    { term: 'Lead', text: 'A reason to look closer, not proof of wrongdoing.' }
  ];

  var STEP_LABELS = [
    'Arrive: the river and its blue line sweep in from left to right, as one grey shape',
    'Click: the shipping companies light up one after another; then 40 days',
    'Click: the buyer\'s line draws from 2019 to 2025; its suppliers change underneath'
  ];
  var STEP_NOTES = [
    'SAY: "One route: Kyrgyzstan into Russia. The blue line is the flow of chips, month by month."\n\nMOVE: the river and its blue line sweep in from left to right, as one grey shape; then "The flow: 1,147 shipments".\nCUE: trace the blue line left to right.',
    'SAY: "Each band under it is a shipping company. Watch them come and go: a typical one lasted 40 days. The flow kept going."\n\nMOVE: the company bands light up one after another, in the order they first shipped (RM Design first, dark); then 40 days.',
    'SAY: "And the buyer at the far end stays: one Russian buyer, 2019 to 2025, while its suppliers changed."\n\nMOVE: the buyer\'s line draws from 2019 to 2025; its supplier segments light up under it; then "2019 to 2025".\nCut first if short: "while its suppliers changed" (the picture shows it).'
  ];
  var NOTES = [
    'STEP 1, on arrival: "One route: Kyrgyzstan into Russia. The blue line is the flow of chips, month by month." (click)',
    'STEP 2: "Each band under it is a shipping company. Watch them come and go: a typical one lasted 40 days. The flow kept going." (click)',
    'STEP 3: "And the buyer at the far end stays: one Russian buyer, 2019 to 2025, while its suppliers changed."',
    '',
    'MOVES: step 1, the river sweeps in as one grey shape with its blue line. Step 2, the company bands light up in the order they first shipped. Step 3, the buyer\'s line draws, its suppliers change under it.',
    'IF ASKED (drawer, More in the data): RM Design and Development was registered 21 days after the invasion; ELEM GROUP, Kazakhstan, 18 days. Companies shipping per half-year: 1, 4, 12, 6. Six of the buyer\'s new suppliers were later put on US lists. The Kazakh route was a relay: ELEM GROUP carried 93% in 118 days. Western suppliers stopped by 2 Mar 2022 (lawful exits).',
    'IF ASKED why the buyer: its need is steady, so every new seller shows up next to it. Watching buyers is a tool for agencies with full data, not a public blacklist.',
    'GUARDRAILS: documented facts stated plainly with their source, leads only for our inferences; shipment records, not values; declared countries, not physical routes. Grey firms are unlisted and stay unnamed. Russia-side records thin out after late 2023.'
  ].join('\n');


  function drawRiver(box, D, ctx, keyList) {
    var W = box.clientWidth, H = box.clientHeight;
    if (W < 50 || H < 50) return false;
    if (box._b2size === W + 'x' + H && box.firstChild) return false;   /* same size: keep the drawing (and any move in progress) */
    box._b2size = W + 'x' + H;
    box.innerHTML = '';
    if (keyList) keyList.innerHTML = '';
    var narrow = ctx.isNarrow || W < 460;
    var vh = window.innerHeight / 100;
    var fN = narrow ? 14 : Math.max(16, 2.4 * vh);   /* annotations: 26 px at 1080 */
    var fL = narrow ? 13 : Math.max(15, 2.25 * vh);  /* direct labels: 24 px */
    var fT = narrow ? 13 : Math.max(14, 2.05 * vh);  /* ticks: 22 px */
    var r = D.routes[0];
    var svg = mk('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Chip shipments from Kyrgyzstan to Russia by month, April 2022 to December 2023, stacked by shipping company. The companies keep changing while the total flow continues. ' + fmt(r.records) + ' shipments in all.' }, box);

    var M0 = 3, M1 = 24;                          /* Apr 2022 .. end of Dec 2023 */
    var L = narrow ? 34 : fT * 2.6, R = narrow ? 6 : 10;
    var T = narrow ? fT * 2 : fN * 1.6;          /* room for the axis title (the v2 company-count brackets moved to the drawer) */
    var B = fT * 1.9;
    var pw = W - L - R, ph = H - T - B, base = T + ph;
    var ymax = 250;
    var x = function (m) { return L + ((m - M0) / (M1 - M0)) * pw; };
    var y = function (v) { return base - (v / ymax) * ph; };

    /* grid + y axis title, written once */
    [100, 200].forEach(function (v) {
      mk('line', { x1: L, x2: L + pw, y1: y(v), y2: y(v), 'class': 'grid' }, svg);
      mk('text', { x: L - 8, y: y(v) + fT * 0.35, 'text-anchor': 'end', 'class': 't-muted', 'font-size': fT }, svg, v);
    });
    mk('text', { x: narrow ? L : L - fT * 1.6, y: y(ymax) - fT * 0.2, 'text-anchor': 'start', 'class': 't-muted', 'font-size': fT }, svg, narrow ? 'shipments a month' : 'shipments a month (counts, not dollars)');

    /* step 1: the total as one flat slate shape (no companies yet), wiped in with the blue line */
    var sp = [x(M0).toFixed(1) + ',' + y(r.total[M0]).toFixed(1)];
    for (var si0 = M0; si0 < M1; si0++) sp.push(x(si0 + 0.5).toFixed(1) + ',' + y(r.total[si0]).toFixed(1));
    sp.push(x(M1).toFixed(1) + ',' + y(r.total[M1 - 1]).toFixed(1), x(M1).toFixed(1) + ',' + base.toFixed(1), x(M0).toFixed(1) + ',' + base.toFixed(1));
    mk('polygon', { points: sp.join(' '), 'class': 'sil', 'data-anim': 'wipe', 'data-anim-from': 'left', 'data-anim-order': '0', 'data-anim-dur': '1200' }, svg);

    /* step 2: stacked bands, in order of first appearance, slate shades alternating; they light up in that order */
    var gBands = mk('g', { 'data-reveal': '2', 'data-anim': 'light', 'data-anim-order': '0', 'data-anim-dur': '1100' }, svg);
    var ser = r.series.slice().sort(function (a, b) { return a.first < b.first ? -1 : 1; });
    var cum = r.months.map(function () { return 0; });
    var shades = ['s1', 's2'];
    var geo = {};
    ser.forEach(function (s, si) {
      var lo = cum.slice(), hi = cum.map(function (c, i) { return c + s.counts[i]; });
      var first = -1, last = -1, i;
      for (i = 0; i < s.counts.length; i++) if (s.counts[i] > 0) { if (first < 0) first = i; last = i; }
      if (first >= 0) {
        var a = Math.max(M0, first - 1), b = Math.min(M1 - 1, last + 1), pts = [];
        for (i = a; i <= b; i++) pts.push(x(i + 0.5).toFixed(1) + ',' + y(hi[i]).toFixed(1));
        for (i = b; i >= a; i--) pts.push(x(i + 0.5).toFixed(1) + ',' + y(lo[i]).toFixed(1));
        if (a === M0 && first === M0) { pts.unshift(x(M0).toFixed(1) + ',' + y(hi[M0]).toFixed(1)); pts.push(x(M0).toFixed(1) + ',' + y(lo[M0]).toFixed(1)); }
        var shade = s.key === 'rm' ? 's-rm' : shades[si % 2];
        var poly = mk('polygon', { points: pts.join(' '), 'class': 'band ' + shade, 'data-light': '' }, gBands);
        mk('title', {}, poly, (s.label || 'A company not on any list (not named)') + ': ' + fmt(s.n) + ' shipments');
      }
      geo[s.key || ('u' + si)] = { lo: lo, hi: hi, s: s };
      cum = hi;
    });
    mk('line', { x1: L, x2: L + pw, y1: base, y2: base, 'class': 'base' }, svg);

    /* the flow: top edge of the stack, the one accent on the screen */
    var fp = [x(M0).toFixed(1) + ',' + y(r.total[M0]).toFixed(1)];
    for (var i = M0; i < M1; i++) fp.push(x(i + 0.5).toFixed(1) + ',' + y(r.total[i]).toFixed(1));
    fp.push(x(M1).toFixed(1) + ',' + y(r.total[M1 - 1]).toFixed(1));
    var flow = mk('polyline', { points: fp.join(' '), 'class': 'flow', 'data-anim': 'wipe', 'data-anim-from': 'left', 'data-anim-order': '0', 'data-anim-dur': '1200' }, svg);
    clickable(flow, ['b2-e3', 'b2-e11'], ctx, 'The flow, ' + fmt(r.records) + ' shipments');

    /* x ticks: Jul 2022, Jan 2023, Jul 2023 only */
    [6, 12, 18].forEach(function (m) {
      mk('line', { x1: x(m), x2: x(m), y1: base, y2: base + 6, 'class': 'base' }, svg);
      mk('text', { x: x(m), y: base + fT * 1.35, 'text-anchor': 'middle', 'class': 't-muted', 'font-size': fT }, svg, MONTHS[m % 12] + ' ' + (2022 + Math.floor(m / 12)));
    });

    /* direct labels for the two listed companies */
    var rm = geo.rm, rama = geo.rama;
    var mRm = 6.5; /* Jul 2022: thick, flat part of RM's band */
    var yRm = y((rm.lo[6] + rm.hi[6]) / 2);
    /* Only RM Design is named on the chart (the one dark band; "21 days" is in the drawer since v3). Rama Group, the other listed firm,
       stays in the drawer (b2-e10): a lone name with no story attached confused first-time readers. */
    var gRm = mk('g', { 'data-reveal': '2', 'data-anim': 'fade', 'data-anim-order': '1' }, svg);
    if (narrow) note(gRm, x(mRm), yRm, [['RM Design and'], ['Development']], 'middle', fL * 0.9, ctx, 't-strong t-inv');
    else note(gRm, x(mRm - 0.35), yRm - fL * 0.2, [['RM Design and'], ['Development']], 'middle', fL * 0.92, ctx, 't-strong t-inv');

    var keys = [];
    /* annotation 1: the flow */
    var f1x = x(7.5), f1y = y(r.total[7]);
    var t1x = x(5.0), t1y = y(190);
    if (!narrow) {
      var gF = mk('g', { 'data-anim': 'fade', 'data-anim-order': '1' }, svg);
      leader(gF, x(7.3), t1y + fN * 1.55, f1x, f1y - 4);
      note(gF, t1x, t1y, [[{ t: 'The flow: ', strong: true }, { t: fmt(r.records) + ' shipments', ids: ['b2-e3'], strong: true }], ['the blue line is the total']], 'start', fN, ctx);
    }
    /* annotation 3: unnamed bands (grey firm on top of the Jul 2023 stack) */
    var gk = null;
    Object.keys(geo).forEach(function (k) { if (!geo[k].s.key && geo[k].s.counts[18] > 20) gk = k; });
    var gx = x(18.5), gy = gk ? y((geo[gk].lo[18] + geo[gk].hi[18]) / 2) : y(20);
    var t3x = L + pw, t3y = y(112);
    if (!narrow) {
      var gG = mk('g', { 'data-reveal': '2', 'data-anim': 'fade', 'data-anim-order': '1' }, svg);
      leader(gG, x(19.6), t3y + fN * 2.8, gx + 4, gy);
      note(gG, t3x, t3y, [[{ t: 'Grey bands:', strong: true }], ['other shipping companies,'], ['not named here']], 'end', fN, ctx);
    }

    /* v2's company-count brackets per half-year (1, 4, 12, 6) moved to the drawer in v3 (b2-e5): the bands lighting up
       one after another show the churn without the numbers. */

    if (narrow && keyList) {
      ['The blue line is the total flow: ' + fmt(r.records) + ' shipments.', 'Grey bands: other shipping companies, not named here.'].forEach(function (s) {
        var li = document.createElement('li'); li.textContent = s; keyList.appendChild(li);
      });
    }
    return true;
  }

  /* micro-timeline: the buyer as one continuous accent line, suppliers as short slate segments.
     Step 3: the buyer line draws (with its label), then the supplier segments light up one after another. */
  function drawMicro(svgEl, D, ctx) {
    var W = svgEl.clientWidth || 400, H = svgEl.clientHeight || 70;
    if (svgEl._b2size === W + 'x' + H && svgEl.firstChild) return false;
    svgEl._b2size = W + 'x' + H;
    svgEl.innerHTML = '';
    svgEl.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    var fs = Math.max(13, H / 2.7);
    var by = D.buyer, span = 7 * 12, LX = 2, RX = W - fs * 9.5;
    var x = function (s) { return LX + (mIdx(s, 2019) / span) * (RX - LX); };
    var y1 = fs * 0.7, y2 = y1 + fs * 1.15;
    var bl = mk('line', { x1: x(by.first), x2: x(by.last), y1: y1, y2: y1, 'class': 'buyer', 'data-reveal': '3', 'data-anim': 'draw', 'data-anim-order': '0', 'data-anim-dur': '900' }, svgEl);
    clickable(bl, ['b2-e12'], ctx, 'The buyer, 2019 to 2025');
    mk('text', { x: x(by.last) + 8, y: y1 + fs * 0.35, 'font-size': fs, 'class': 't-strong', 'data-reveal': '3', 'data-anim': 'fade', 'data-anim-order': '0' }, svgEl, 'one buyer, years');
    var gSup = mk('g', { 'data-reveal': '3', 'data-anim': 'light', 'data-anim-order': '1', 'data-anim-dur': '600' }, svgEl);
    by.lanes.forEach(function (ln) {
      var s = mk('line', { x1: x(ln.first), x2: Math.max(x(ln.first) + 4, x(ln.last)), y1: y2, y2: y2, 'class': 'sup' }, gSup);
      clickable(s, ln.key === 'six' ? ['b2-e14'] : ln.key === 'west' ? ['b2-e13'] : ['b2-e18'], ctx, 'A group of suppliers');
    });
    mk('text', { x: x(by.last) + 8, y: y2 + fs * 0.35, 'font-size': fs, 'class': 't-muted' }, gSup, 'its suppliers change');
    return true;
  }

  function render(el, ctx) {
    var D = window.DEMO_DATA && window.DEMO_DATA.b2;
    if (!el.id) el.id = 'beat-b2';
    el.innerHTML = '';
    if (!D) { el.textContent = 'Beat 2 data missing (data/b2_river.js).'; return; }
    el.classList.toggle('b2-narrow', !!ctx.isNarrow);
    var style = document.createElement('style');
    style.textContent = CSS;
    el.appendChild(style);

    var r = D.routes[0];
    var ev = function (ids, text) { return '<button class="b2-ev" data-ev="' + ids + '">' + text + '</button>'; };
    var wrap = document.createElement('div');
    wrap.className = 'b2-wrap';
    wrap.innerHTML =
      '<p class="b2-kick d-kick">New names</p>' +
      '<h1 class="b2-idea d-idea">The shipping companies change every few weeks. The flow of chips, and its buyer, stay.</h1>' +
      '<p class="b2-look d-explain"><span class="b2-tag d-label">What you\'re looking at</span>Chip shipments from Kyrgyzstan to Russia, month by month. Each band is a shipping company (the smallest are grouped); stacked, they add up to the blue line.</p>' +
      '<figure class="b2-hero" style="margin:0" aria-label="Chip shipments by company"><div class="b2-svgbox" style="position:absolute;inset:0"></div></figure>' +
      '<div class="b2-nums">' +
        '<p class="b2-n"><span class="b2-big d-big-n" data-reveal="2" data-anim="rise" data-anim-order="2">' + ev('b2-e6', r.median_active_days + '<small class="d-big-unit">days</small>') + '</span>' +
          '<span class="b2-cap d-big-cap" data-reveal="2" data-anim="rise" data-anim-order="2">how long a typical shipping company lasted on this route. The flow kept going.</span></p>' +
        '<p class="b2-n b2-n3"><span class="b2-big d-big-n" data-reveal="3" data-anim="rise" data-anim-order="2">' + ev('b2-e12', '2019<small class="d-big-unit"> to </small>2025') + '</span>' +
          '<span class="b2-cap d-big-cap" data-reveal="3" data-anim="rise" data-anim-order="2">But the buyer stays: one Russian company, one record, while its suppliers changed.</span>' +
          '<svg class="b2-micro" data-reveal="3" role="img" aria-label="The buyer continues from 2019 to 2025 while four groups of suppliers come and go"></svg></p>' +
      '</div>' +
      '<p class="b2-why d-why"><span class="b2-tag d-label">Why it matters</span>For the compliance officer: a seller\'s name that is a few weeks old tells you little. The buyer tells you more.</p>';
    el.appendChild(wrap);
    var keyList = document.createElement('ol');
    keyList.className = 'b2-keylist';
    wrap.querySelector('.b2-hero').after(keyList);

    Array.prototype.forEach.call(wrap.querySelectorAll('button.b2-ev'), function (b) {
      b.addEventListener('click', function () { ctx.openEvidence(b.getAttribute('data-ev').split(',')); });
    });

    var box = wrap.querySelector('.b2-svgbox');
    var micro = wrap.querySelector('.b2-micro');
    function draw() {
      var a = drawRiver(box, D, ctx, ctx.isNarrow ? keyList : null);
      var b = drawMicro(micro, D, ctx);
      return a || b;
    }
    draw();
    if (typeof ResizeObserver === 'function') {
      var pending = false;
      var ro = new ResizeObserver(function () {
        if (pending) return; pending = true;
        requestAnimationFrame(function () {
          pending = false;
          if (!el.contains(box)) { ro.disconnect(); return; }
          /* a real size change redraws; then the shell re-applies the current step so hidden layers stay hidden */
          if (draw() && ctx.refresh) ctx.refresh();
        });
      });
      ro.observe(box);
    }
  }

  var def = {
    id: 'b2', order: 2, kicker: 'New names',
    title: 'The shipping companies change every few weeks. The flow of chips, and its buyer, stay.',
    seconds: 27, steps: 3, glossary: GLOSSARY,
    stepLabels: STEP_LABELS, stepNotes: STEP_NOTES,
    notes: NOTES, evidence: EVIDENCE, render: render
  };
  if (window.DEMO && typeof window.DEMO.register === 'function') window.DEMO.register(def);
  else { window.DEMO_PENDING = window.DEMO_PENDING || []; window.DEMO_PENDING.push(def); }
})();
