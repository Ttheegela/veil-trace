/* Beat 5: Blind spots (2:14 to 2:45). Redesigned to DESIGN_SPEC.md section 2, b5, and V3_PLAN section 1, b5.
   One point: no single source sees everything: not our data, not a screening tool (v3 review: one thrust, two proofs).
   Reading order: idea, "What you're looking at", the blind-spot map (one plate + the corner key),
   big numbers (81% at step 1; "Caught" at step 2), "Why it matters". Details live in the drawer (E).
   Two clicks, motion through the shell's data-reveal / data-anim attributes (shell.js MOTION):
   step 1 (arrive) = base map and key static; the hatched countries, the plate and its leaders fade in together;
     then 81% rises in. Step 2 = "12 Jun 2024, Caught" rises in.
   v3 moved "$13.5M not $27.1M, Fixed" (b5-e8) and the Iran oil and ships-at-sea plates (b5-e3 to b5-e5) to the drawer.
   Data: data/b5_honesty.js (window.DEMO_DATA.b5). All CSS is prefixed #beat-b5. */
(function () {
  if (!window.DEMO || typeof window.DEMO.register !== 'function') { console.warn('b5: DEMO.register missing'); return; }

  var CSS = [
    /* type scale (spec 3.2), with fallbacks if app.css has not defined the shared sizes yet */
    '#beat-b5 { --b5-idea: var(--s-idea, 6.3vh); --b5-num: var(--s-num, 9.6vh); --b5-line: var(--s-line, 2.8vh); --b5-body: var(--s-body, 2.6vh); --b5-note: var(--s-note, 2.4vh); --b5-min: var(--s-min, 2.05vh); --b5-u: var(--u, .74vh); }',
    /* colours (spec 3.4): slate for context, the one accent = the hatched blind-spot countries */
    '#beat-b5 { --b5-own: color-mix(in oklab, var(--fg) 28%, var(--bg)); --b5-none: color-mix(in oklab, var(--fg) 9%, var(--bg)); --b5-part: var(--accent); --b5-part-bg: color-mix(in oklab, var(--accent) 22%, var(--bg)); --b5-sea: var(--bg); --b5-rule: color-mix(in oklab, var(--border) 45%, transparent); --b5-lead: color-mix(in oklab, var(--fg) 55%, transparent); }',
    '@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) #beat-b5 { --b5-own: color-mix(in oklab, var(--fg) 34%, var(--bg)); --b5-none: color-mix(in oklab, var(--fg) 12%, var(--bg)); } }',
    ':root[data-theme="dark"] #beat-b5 { --b5-own: color-mix(in oklab, var(--fg) 34%, var(--bg)); --b5-none: color-mix(in oklab, var(--fg) 12%, var(--bg)); }',

    '#beat-b5 .b5 { height: 100%; display: grid; grid-template-rows: auto auto minmax(0, 1fr) auto; row-gap: 0; }',
    '#beat-b5 .b5-kicker { font: 600 var(--b5-min)/1.2 var(--font-sans); letter-spacing: .08em; text-transform: uppercase; color: var(--accent); margin: 0 0 calc(var(--b5-u) * 1); }',
    '#beat-b5 .b5-idea { font: var(--display-weight, 600) var(--b5-idea)/1.08 var(--font-display, var(--font-sans)); letter-spacing: -.02em; margin: 0; max-width: 21em; text-wrap: balance; }',
    '#beat-b5 .b5-explain { font-size: var(--b5-line); line-height: 1.3; color: var(--fg); margin: calc(var(--b5-u) * 2) 0 0; max-width: none; }',
    '#beat-b5 .b5-lab { display: block; font: 600 var(--b5-min)/1.2 var(--font-sans); letter-spacing: .08em; text-transform: uppercase; color: var(--muted-fg); margin-bottom: .25em; }',
    '#beat-b5 .b5-explain .b5-lab { display: inline; margin: 0 .6em 0 0; }',

    /* hero + numbers */
    '#beat-b5 .b5-body { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: calc(var(--b5-u) * 6); min-height: 0; margin-top: calc(var(--b5-u) * 3); }',
    /* v3: an explicit height (the number column is shorter now, so it no longer props the row open) */
    '#beat-b5 .b5-mapbox { position: relative; min-height: 0; height: 52vh; aspect-ratio: var(--b5-ar); max-width: 58vw; }',
    '#beat-b5 .b5-map { position: absolute; inset: 0; }',
    '#beat-b5 .b5-map svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; overflow: hidden; }',
    '#beat-b5 .b5-map path.c { stroke: var(--bg); stroke-width: .6; vector-effect: non-scaling-stroke; }',
    '#beat-b5 .b5-map path.c.own { fill: var(--b5-own); }',
    '#beat-b5 .b5-map path.c.none { fill: var(--b5-none); }',
    '#beat-b5 .b5-map path.c.partners { fill: url(#b5-hatch); stroke: var(--accent); stroke-width: 1; }',
    '#beat-b5 .b5-map circle.dot { fill: var(--b5-part-bg); stroke: var(--accent); stroke-width: 2; vector-effect: non-scaling-stroke; }',
    '#beat-b5 .b5-map .lead { stroke: var(--b5-lead); stroke-width: 1.5; vector-effect: non-scaling-stroke; fill: none; }',
    '#beat-b5 .b5-map .anc { fill: var(--fg); }',
    /* annotation plates (God\'s Eye View callout style: plate, accent bar; credit in the drawer) */
    '#beat-b5 .b5-plate { position: absolute; z-index: 2; background: color-mix(in oklab, var(--surface) 94%, transparent); color: var(--surface-fg); border: 1px solid var(--b5-rule); border-left: 4px solid var(--accent); border-radius: var(--radius-control, var(--radius)); padding: .3em .6em .35em; font: 500 var(--b5-note)/1.25 var(--font-sans); text-align: left; cursor: pointer; max-width: 17em; }',
    '#beat-b5 .b5-plate b { font-weight: 600; }',
    '#beat-b5 .b5-plate:hover, #beat-b5 .b5-plate:focus-visible { border-color: var(--accent); }',
    '#beat-b5 .b5-plate.dashed { border-style: dashed; border-left: 4px dashed var(--muted-fg); background: color-mix(in oklab, var(--bg) 88%, transparent); }',
    '#beat-b5 .b5-key { position: absolute; left: 0; bottom: 0; z-index: 2; list-style: none; margin: 0; padding: .35em .6em; display: grid; gap: .25em; font: 500 var(--b5-min)/1.2 var(--font-sans); color: var(--muted-fg); background: color-mix(in oklab, var(--bg) 88%, transparent); border-radius: var(--radius-control, var(--radius)); }',
    '#beat-b5 .b5-key li { display: flex; align-items: center; gap: .5em; }',
    '#beat-b5 .b5-sw { width: 1.2em; height: .85em; border-radius: 2px; display: inline-block; flex: none; }',
    '#beat-b5 .b5-sw.own { background: var(--b5-own); }',
    '#beat-b5 .b5-sw.none { background: var(--b5-none); box-shadow: inset 0 0 0 1px var(--b5-rule); }',
    '#beat-b5 .b5-sw.partners { background: repeating-linear-gradient(45deg, var(--b5-part) 0 2px, var(--b5-part-bg) 2px 5px); box-shadow: inset 0 0 0 1px var(--accent); }',
    '#beat-b5 .b5-key li.b5-key-main { color: var(--fg); font-weight: 600; }',

    /* big numbers */
    '#beat-b5 .b5-nums { display: flex; flex-direction: column; justify-content: flex-start; gap: calc(var(--b5-u) * 2.5); min-width: 0; min-height: 0; }',
    '#beat-b5 .b5-n { margin: 0; }',
    '#beat-b5 .b5-n + .b5-n { padding-top: 0; }',
    '#beat-b5 .b5-big { display: flex; align-items: baseline; flex-wrap: wrap; gap: 0 .45em; margin: 0 0 .15em; }',
    '#beat-b5 .b5-big .d-num { font: var(--display-weight, 600) var(--b5-numsize)/1 var(--font-display, var(--font-sans)); letter-spacing: -.02em; color: var(--fg); font-variant-numeric: tabular-nums lining-nums; border-bottom: 0; padding: 0; }',
    '#beat-b5 .b5-big .d-num:hover, #beat-b5 .b5-big .d-num:focus-visible { text-decoration: underline; text-decoration-thickness: 3px; text-underline-offset: .12em; }',
    '#beat-b5 { --b5-numsize: var(--b5-num); }',
    '#beat-b5 .b5-was { font: 500 var(--b5-line)/1 var(--font-sans); color: var(--muted-fg); }',
    '#beat-b5 .b5-was s { text-decoration-thickness: 2px; }',
    '#beat-b5 .b5-tag { font: 600 var(--b5-min)/1 var(--font-sans); letter-spacing: .08em; text-transform: uppercase; color: var(--muted-fg); border: 1px solid var(--b5-rule); border-radius: var(--radius-control, var(--radius)); padding: .3em .5em; align-self: center; }',
    '#beat-b5 .b5-cap { font-size: var(--b5-body); line-height: 1.3; color: var(--muted-fg); margin: 0; max-width: 52ch; }',
    '#beat-b5 .b5-cap strong { color: var(--fg); font-weight: 600; }',

    /* why it matters */
    '#beat-b5 .b5-why .d-num { color: var(--fg); border-bottom: 0; padding: 0; }',
    '#beat-b5 .b5-why .d-num:hover, #beat-b5 .b5-why .d-num:focus-visible { text-decoration: underline; }',
    '#beat-b5 .b5-why { margin: calc(var(--b5-u) * 3) 0 0; padding-top: calc(var(--b5-u) * 2); border-top: 1px solid var(--b5-rule); font-size: var(--b5-line); line-height: 1.3; max-width: none; }',
    '#beat-b5 .b5-why .b5-lab { display: inline; margin: 0 .6em 0 0; }',


    /* narrow (phone): stack, map crops to Central Asia and the Middle East, plates become numbered markers */
    '#beat-b5.b5-narrow { --b5-idea: 1.75rem; --b5-numsize: 2.75rem; --b5-line: 1.0625rem; --b5-body: 1.0625rem; --b5-note: 1rem; --b5-min: .95rem; --b5-u: 8px; }',
    '#beat-b5.b5-narrow .b5 { height: auto; grid-template-rows: none; }',
    '#beat-b5.b5-narrow .b5-body { grid-template-columns: minmax(0, 1fr); }',
    '#beat-b5.b5-narrow .b5-mapbox { height: auto; width: 100%; max-width: none; }',
    '#beat-b5.b5-narrow .b5-plate { display: none; }',
    '#beat-b5.b5-narrow .b5-key { position: static; background: none; padding: .5em 0 0; }',
    '#beat-b5 .b5-mk { fill: var(--surface); stroke: var(--fg); stroke-width: 1.5; vector-effect: non-scaling-stroke; }',
    '#beat-b5 .b5-mk-t { fill: var(--fg); font: 600 7px var(--font-sans); text-anchor: middle; dominant-baseline: central; }',
    '#beat-b5 .b5-mklist { margin: .5em 0 0; padding-left: 1.4em; font-size: var(--b5-note); line-height: 1.3; }',
    '#beat-b5 .b5-mklist button { font: inherit; color: inherit; background: none; border: 0; padding: .35em 0; text-align: left; cursor: pointer; min-height: 44px; }'
  ].join('\n');

  var STEP_LABELS = [
    'Arrive: the hatched blind-spot countries fade in; then 81%',
    'Click: "12 Jun 2024, Caught" rises in'
  ];
  var STEP_NOTES = [
    'SAY: "No single source sees everything, ours included. Hatched countries keep no trade records of their own; we see them only through partners. A route that seems to stop may just be Russia\'s own data thinning out after late 2023."\n\nMOVE: the hatched countries and their plate fade in; then 81%.\nNEVER CUT the blind-spot line ("A route that seems to stop..."). Cut first if short: "Hatched countries keep no trade records of their own; we see them only through partners." (the explainer on screen says it).',
    'SAY: "Screening tools miss things too. The skeptic we built into our team caught a sanctioned Dubai shipper that a data provider called clean. One screening tool is not enough."\n\nMOVE: "12 Jun 2024, Caught" rises in.'
  ];
  var NOTES = [
    'STEP 1 SAY: "No single source sees everything, ours included. Hatched countries keep no trade records of their own; we see them only through partners. A route that seems to stop may just be Russia\'s own data thinning out after late 2023."',
    '(click)',
    'STEP 2 SAY: "Screening tools miss things too. The skeptic we built into our team caught a sanctioned Dubai shipper that a data provider called clean. One screening tool is not enough."',
    '',
    'MOVES: step 1, the hatched countries (Armenia, Kyrgyzstan, Hong Kong and 11 more) fade in with their plate, then 81%. Step 2, "Caught" rises in. Open a number only if a judge asks.',
    'HOLD FOR Q&A (drawer, "More in the data"): the Dubai shipper is ITIC LLC FZ, on the US Treasury list since 12 Jun 2024; a total counted twice ($27.1M was really $13.5M, now fixed); Iran\'s oil relabelling does not show in our data; no ship positions; the unnamed Russian firm matches UK-listed LLC Phoenix on tax number, registration number and address; our checker also caught a wrong listing date (Sinno), "former" ownership reported as current, and a Turkish record we could not prove was the same company, so we dropped it.',
    'WORDS: "seen only through partners" = we see a country\'s trade only when the other side reports it. "Customs records" = the import and export paperwork a country\'s border officials keep. "Sanctions list" = a government list of firms its companies may not trade with. "Our checker (the skeptic)" = a separate step that redoes every number from the saved source files.'
  ].join('\n');

  var PLAIN_SAYARI = 'Sayari (sponsor data platform), saved 25 Sep 2026';
  var EVIDENCE = [
    { id: 'b5-e1', claim: 'Kyrgyzstan, Armenia and Hong Kong have no import or export records of their own in our main source; we see them only when the country on the other side reports. 14 countries in all are in this group (also Georgia, Belarus, Iran, UAE (its only source is a 2020 Dubai document set), Tajikistan, Turkmenistan, Azerbaijan, Mongolia, Syria, Myanmar, Cuba).', value: '14 countries seen only through partners', source: 'Sayari source catalogue, saved 25 Sep 2026; blind-spot map re-derived by our independent checker', receipt: 'pulls/sayari/20260925T132800Z_lookup_data_sources.json; build/viz/coverage.js; LOG 10:06', check: 'verified' },
    { id: 'b5-e2', claim: 'How the map is shaded. Slate: the country has its own trade records in our main source (77 countries). Hatched blue: seen only through partners (14). Lightest: not in our data (no trade source of its own; not checked further). Countries are the ones declared on shipment records, not physical routes.', value: '77 own, 14 through partners only', source: 'Sayari source catalogue, saved 25 Sep 2026; country shapes from Natural Earth (public domain)', receipt: 'build/viz/coverage.js; Natural Earth 1:110m', check: 'verified', offscreen: true },
    { id: 'b5-e6', claim: '81% of chip shipment records into Russia (471,206 of 582,920) come from Russia\'s own customs records, and those records thin out after late 2023. So a route that seems to end may just be the data ending. Counts are shipment records, not values. (Chips = customs code HS 8542, integrated circuits.)', value: '81% (471,206 of 582,920)', source: PLAIN_SAYARI + ', trade summary for chips into Russia', receipt: 'pulls/sayari/20260925T134248Z_search_trade_facets.json; coverage.js RUS note; LOG 09:46, 10:00', check: 'verified' },
    { id: 'b5-e8', offscreen: true, claim: 'The UN\'s trade database returns one total split across several rows plus a summary row. Adding every row counted each total twice. Example: Kyrgyzstan\'s own reported chip exports to Russia in 2023 came to $27.1 million summed over all rows, and $13.5 million on the summary row alone (exactly double). We now use summary rows only (moved off the main screen in v3; for questions). Also corrected: Kazakhstan 2022 $18.3 million (not $36.5 million), Armenia 2022 $13.1 million (not $52.4 million). These are declared values in each country\'s own report.', value: '$27.1M counted, $13.5M correct', source: 'UN Comtrade (countries\' own trade reports to the UN), saved 25 Sep 2026', receipt: 'pulls/comtrade/8542_exports_to_russia_2019_2024_AGGREGATE.json (Kyrgyzstan 2023: all_rows_sum 27,062,780; aggregate 13,531,390); LOG 10:19', check: 'verified' },
    { id: 'b5-e7', claim: 'The Dubai chip shipper is ITIC LLC FZ, the top chip shipper on the UAE route. It has been on the US Treasury sanctions list since 12 June 2024 (Russia programme, Executive Order 14024) and on the EU list since 25 Feb 2025. The sponsor record flagged it "not sanctioned", and our own first exact-spelling search missed it too; a re-run of our checker caught it.', value: '12 Jun 2024', source: 'US Treasury (OFAC) sanctions list, via OpenSanctions', receipt: 'us_ofac_sdn.csv (ITIC LLC FZ, first seen 2024-06-12, row 49398); LOG 10:12 correction', check: 'official' },
    { id: 'b5-e9', offscreen: true, claim: 'Another screening gap (moved off the main screen in v2; for questions). A Russian firm in the sponsor data (not named here because it is not itself on a list) has the same tax number (INN 7805349407), registration number (OGRN 1167847135059) and St Petersburg address as LLC PHOENIX on the UK Russia sanctions list (listed 24 Feb 2026). The sponsor record still flags it not sanctioned. A lead for a screening team, not a finding.', value: 'Same tax and registration numbers', source: 'Sayari company record; UK sanctions list via OpenSanctions', receipt: 'build/detect/screen_gaps.csv; OpenSanctions RUS3475; LOG 10:45 fact-check', check: 'verified' },
    { id: 'b5-e3', claim: 'Iran\'s oil is nearly invisible: 245 crude shipment records leaving Iran from 2019 to 2026, only to Uzbekistan (133) and Turkey (110). China records 6,975 crude arrivals and Iran is not among its top 12 senders; Malaysia to China crude is only 19 records, so the known relabelling route does not appear.', value: '245 shipment records leaving Iran', source: PLAIN_SAYARI + ', shipment search (independently checked)', receipt: 'LOG_2026-09-25.md 10:04', check: 'verified', offscreen: true },
    { id: 'b5-e4', claim: 'Why Iran\'s oil hides: tankers transfer oil ship to ship off Johor, Malaysia, and it is relabelled as Malaysian or Omani blends (cited context, not re-checked by us).', value: 'context', source: 'US House committee report; United Against Nuclear Iran ship-to-ship tracking', receipt: 'LOG 10:16', check: 'approximate', offscreen: true },
    { id: 'b5-e5', claim: 'None of our sources has ship positions: listed tankers such as VELIKIY NOVGOROD (IMO 9630004) and SAMIRA (IMO 9436006) show "position: no data". No voyages, ship-to-ship transfers or insurance data either.', value: 'Position: no data', source: PLAIN_SAYARI + ', tanker records', receipt: '20260925T135658Z_get_entity_profile.json, 20260925T135832Z_get_entity_profile.json (via build/viz/ships.js); LOG 10:06', check: 'verified', offscreen: true },
    { id: 'b5-e11', claim: 'Other things our checker caught before they reached a screen: a listing date for Sinno that was really a dataset start date (shown 20 Apr 2023; real US listing 30 Sep 2022); ownership links that were "former" but reported as current; a figure with no saved source behind it (dropped); and a Turkish RM DESIGN record we could not prove was the same company as the listed one in Bishkek, so we dropped it.', value: '4 more catches', source: 'Our team log, 25 Sep 2026', receipt: 'LOG_2026-09-25.md 09:52, 10:08, 10:45', check: 'verified', offscreen: true },
    { id: 'b5-e10', claim: 'Credits: the map callout style (plate and accent bar) is adapted from God\'s Eye View, MIT License, (c) 2026 Bilawal Sidhu. Country boundaries: Natural Earth 1:110m (public domain), via world-atlas (ISC). Hong Kong is too small at this scale and is drawn as a dot.', value: 'credit', source: 'God\'s Eye View (MIT); Natural Earth (public domain)', receipt: 'github.com/bilawalsidhu/gods-eye-view (commit b210ab0); build/viz/THIRD_PARTY.md', check: 'verified', offscreen: true }
  ];

  var GLOSSARY = [
    { term: 'Seen only through partners', def: 'The country keeps no trade records of its own in our data; we see its trade only when the country on the other side reports it.' },
    { term: 'Customs records', def: 'The import and export paperwork a country\'s border officials keep for each shipment.' },
    { term: 'Sanctions list', def: 'A government list of companies its businesses may not trade with.' },
    { term: 'Skeptic (our checker)', def: 'A separate step that redoes every number from the saved source files before it reaches a screen.' },
    { term: 'Shipment records', def: 'Counts of paperwork entries, not dollar values.' }
  ];

  function h(tag, cls, parent, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    if (parent) parent.appendChild(n);
    return n;
  }
  var SVGNS = 'http://www.w3.org/2000/svg';
  function s(tag, attrs, parent) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function num(text, ids, label) {
    return '<button type="button" class="d-num" data-ev="' + ids.join(',') + '"' + (label ? ' aria-label="' + label + '"' : '') + '>' + text + '</button>';
  }

  window.DEMO.register({
    id: 'b5',
    order: 5,
    kicker: 'Blind spots',
    title: 'Blind spots',
    seconds: 31,
    steps: 2,
    stepLabels: STEP_LABELS,
    stepNotes: STEP_NOTES,
    notes: NOTES,
    evidence: EVIDENCE,
    glossary: GLOSSARY,
    render: function (el, ctx) {
      var D = (window.DEMO_DATA || {}).b5;
      if (!el.id) el.id = 'beat-b5';
      el.innerHTML = '';
      var st = document.createElement('style'); st.textContent = CSS; el.appendChild(st);
      var narrow = !!(ctx && ctx.isNarrow);
      el.classList.toggle('b5-narrow', narrow);
      if (!D) { h('div', 'beat-error', el, 'Beat 5 data file (data/b5_honesty.js) did not load.'); return; }
      var open = function (ids) { if (ctx && ctx.openEvidence) ctx.openEvidence(ids); };

      var root = h('div', 'b5', el);
      var head = h('header', 'b5-head', root);
      h('p', 'b5-kicker d-kick', head, 'Blind spots');
      h('h2', 'b5-idea d-idea', head, 'No single source sees everything: not our data, not a screening tool.');
      h('p', 'b5-explain d-explain', head, '<span class="b5-lab d-label">What you’re looking at</span>Hatched countries keep no trade records of their own here; we see them only through their partners.');

      var body = h('div', 'b5-body', root);

      // ---------- hero: the blind-spot map ----------
      var vb = narrow && D.view_narrow ? D.view_narrow : D.view; // [x, y, w, h]
      var mapbox = h('figure', 'b5-mapbox', body);
      mapbox.style.margin = '0';
      mapbox.style.setProperty('--b5-ar', vb[2] + ' / ' + vb[3]);
      if (narrow) mapbox.style.aspectRatio = vb[2] + ' / ' + vb[3];
      var map = h('div', 'b5-map', mapbox);
      var svg = s('svg', { viewBox: vb.join(' '), preserveAspectRatio: 'xMidYMid meet', role: 'img', 'aria-label': 'Map of Europe, Africa and Asia. Fourteen hatched countries, including Kyrgyzstan, Armenia and Hong Kong, are seen only through their partners.' }, map);
      var defs = s('defs', {}, svg);
      var clip = s('clipPath', { id: 'b5-clip' }, defs);
      s('rect', { x: vb[0], y: vb[1], width: vb[2], height: vb[3] }, clip);
      var pat = s('pattern', { id: 'b5-hatch', patternUnits: 'userSpaceOnUse', width: 2.6, height: 2.6, patternTransform: 'rotate(45)' }, defs);
      s('rect', { width: 2.6, height: 2.6, style: 'fill: var(--b5-part-bg)' }, pat);
      s('rect', { width: 1.1, height: 2.6, style: 'fill: var(--b5-part)' }, pat);
      var gC = s('g', { 'clip-path': 'url(#b5-clip)' }, svg);
      // the blind spots sit in their own layer, drawn last, so they can fade in on arrival
      var gP = s('g', { 'data-anim': 'fade', 'data-anim-order': '0', 'data-anim-dur': '600' }, gC);
      D.countries.forEach(function (c) {
        // under each blind spot, a plain base shape so the map has no hole before the hatching fades in
        if (c.cov === 'partners') s('path', { d: c.d, 'class': 'c none', 'aria-hidden': 'true' }, gC);
        var p = s('path', { d: c.d, 'class': 'c ' + c.cov }, c.cov === 'partners' ? gP : gC);
        s('title', {}, p).textContent = c.name + ': ' + (c.cov === 'own' ? 'own trade records' : c.cov === 'partners' ? 'seen only through partners' : 'not in our data');
      });
      gC.appendChild(gP);
      D.dots.forEach(function (d) {
        var c = s('circle', { cx: d.xy[0], cy: d.xy[1], r: narrow ? 2.4 : 3.2, 'class': 'dot' }, gP);
        s('title', {}, c).textContent = d.name + ': seen only through partners';
      });
      var gL = s('g', { 'data-anim': 'fade', 'data-anim-order': '0', 'data-anim-dur': '600' }, svg);
      // v3: only the blind-spot plate stays on the map; Iran's oil and ships at sea are in the drawer (b5-e3 to b5-e5)
      var LABELS = D.labels.filter(function (L) { return L.key === 'PARTNERS'; });

      var key = h('ul', 'b5-key', mapbox);
      key.setAttribute('aria-label', 'Map key');
      h('li', 'b5-key-main', key, '<i class="b5-sw partners"></i>Seen only through partners');
      h('li', '', key, '<i class="b5-sw own"></i>Keeps its own trade records');
      h('li', '', key, '<i class="b5-sw none"></i>Not in our data');

      function pct(xy) { return [(xy[0] - vb[0]) / vb[2] * 100, (xy[1] - vb[1]) / vb[3] * 100]; }
      var plates = [];
      if (!narrow) {
        LABELS.forEach(function (L) {
          var b = h('button', 'b5-plate' + (L.dashed ? ' dashed' : ''), map, '<b>' + L.title + ':</b> ' + L.line);
          b.type = 'button';
          b.setAttribute('data-anim', 'fade'); b.setAttribute('data-anim-order', '0'); b.setAttribute('data-anim-dur', '600');
          var q = pct(L.box);
          b.style.left = q[0] + '%'; b.style.top = q[1] + '%';
          b.setAttribute('aria-label', L.title + ': ' + L.line + '. Open sources.');
          b.setAttribute('data-ev', [].concat(L.ev).join(','));
          b.addEventListener('click', function () { open(L.ev); });
          plates.push({ el: b, L: L });
        });
        // Leaders start on the plate edge nearest their target, measured after layout.
        var drawLeaders = function () {
          var mr = map.getBoundingClientRect();
          if (!mr.width) return;
          while (gL.firstChild) gL.removeChild(gL.firstChild);
          var sx = vb[2] / mr.width, sy = vb[3] / mr.height, sc = Math.max(sx, sy);
          var ox = vb[0] - (mr.width * sc - vb[2]) / 2, oy = vb[1] - (mr.height * sc - vb[3]) / 2;
          plates.forEach(function (P) {
            var r = P.el.getBoundingClientRect();
            var x0 = ox + (r.left - mr.left) * sc, x1 = ox + (r.right - mr.left) * sc;
            var y0 = oy + (r.top - mr.top) * sc, y1 = oy + (r.bottom - mr.top) * sc;
            (P.L.leaders || []).forEach(function (ld) {
              var t = ld.to;
              var fx = Math.min(Math.max(t[0], x0 + 2 * sc), x1 - 2 * sc), fy = Math.min(Math.max(t[1], y0), y1);
              s('line', { x1: fx, y1: fy, x2: t[0], y2: t[1], 'class': 'lead' }, gL);
              s('circle', { cx: t[0], cy: t[1], r: 3 * sc, 'class': 'anc' }, gL);
            });
          });
        };
        requestAnimationFrame(drawLeaders);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawLeaders);
        if (window.ResizeObserver) new ResizeObserver(drawLeaders).observe(map);
      } else {
        // Phone: numbered markers on the map, annotation text listed under it.
        var list = h('ol', 'b5-mklist', mapbox);
        LABELS.forEach(function (L, i) {
          var t = (L.leaders && L.leaders[0] && L.leaders[0].to) || [vb[0] + vb[2] * .6, vb[1] + vb[3] * .85];
          if (L.key === 'PARTNERS') t = L.leaders[1].to;
          if (L.key === 'SHIP') t = [vb[0] + vb[2] * .78, vb[1] + vb[3] * .86];
          s('circle', { cx: t[0], cy: t[1], r: 5, 'class': 'b5-mk' }, gL);
          s('text', { x: t[0], y: t[1], 'class': 'b5-mk-t' }, gL).textContent = String(i + 1);
          var li = h('li', '', list);
          var b = h('button', '', li, '<b>' + L.title + ':</b> ' + L.line);
          b.type = 'button';
          b.setAttribute('data-ev', [].concat(L.ev).join(','));
          b.addEventListener('click', function () { open(L.ev); });
        });
      }

      // ---------- big numbers ----------
      var nums = h('div', 'b5-nums', body);
      nums.setAttribute('aria-label', 'Key numbers');
      var n1 = h('div', 'b5-n', nums);
      n1.setAttribute('data-anim', 'rise'); n1.setAttribute('data-anim-order', '1');
      h('p', 'b5-big', n1, num('81%', ['b5-e6'], '81 percent, open source'));
      h('p', 'b5-cap d-big-cap', n1, 'of chip shipment records into Russia are <strong>Russia’s own customs records</strong>. They thin out after late 2023, so a route that seems to stop may be the data stopping.');

      // "$13.5M not $27.1M, Fixed" moved to the drawer in v3 (b5-e8): it is about our process, a second thrust.
      var n3 = h('div', 'b5-n', nums);
      n3.setAttribute('data-reveal', '2'); n3.setAttribute('data-anim', 'rise'); n3.setAttribute('data-anim-order', '0');
      h('p', 'b5-big', n3, num('12 Jun 2024', ['b5-e7'], '12 June 2024, open source') + '<span class="b5-tag">Caught</span>');
      h('p', 'b5-cap d-big-cap', n3, 'the day a Dubai chip shipper went on the <strong>US sanctions list</strong>. A data provider’s flag still called it clean; <strong>our checker</strong>, a step that redoes every number, caught it.');

      // ---------- why it matters ----------
      h('p', 'b5-why d-why', root, '<span class="b5-lab d-label">Why it matters</span>For the compliance officer: one screening tool is not enough. We used two that check each other: Sayari\'s shipment records and Tradeverifyd\'s trade links and dated flags.');

      root.addEventListener('click', function (e) {
        var t = e.target.closest ? e.target.closest('.d-num[data-ev]') : null;
        if (t) { e.stopPropagation(); open(t.getAttribute('data-ev').split(',')); }
      });
    }
  });
})();
