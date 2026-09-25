/* Beat 0: the question. Navy title screen (DESIGN_SPEC section 2, b0; V3_PLAN section 1, b0). 18 s, 2 steps.
   One point: a sanctions check matches names, so a company with a new name gets through.
   Step 1 (screen open, no click): list, officer, upper branch "Company A, Order stopped", "The check matches names".
   Step 2 (click): the lower branch draws to "Order ships" (draw), then its arrowhead and labels (fade), then the question (fade).
   Motion uses the shell's data-reveal / data-anim attributes (shell.js MOTION).
   No numbers on this screen; the drawer holds the words used here. All CSS is prefixed #beat-b0. */
(function () {
  if (!window.DEMO) return;
  var CSS = [
    '#beat-b0 { display: grid; align-content: center; }',
    '#beat-b0 .b0-wrap { display: grid; gap: calc(var(--u) * 3.5); max-width: 100%; }',
    '#beat-b0 h1 { margin: 0; font: var(--display-weight, 600) var(--s-hero)/1.02 var(--font-display, var(--font-sans)); letter-spacing: var(--display-tracking, -.02em); }',
    '#beat-b0 h1 .l { display: block; }',
    '#beat-b0 .grad { color: var(--accent); }',
    '@supports (background-clip: text) or (-webkit-background-clip: text) {',
    '  #beat-b0 .grad { background: var(--accent-gradient, linear-gradient(var(--accent), var(--accent))); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }',
    '}',
    '#beat-b0 .d-explain { max-width: 62ch; }',
    '#beat-b0 .b0-fig { margin: 0; }',
    '#beat-b0 .b0-fig svg { display: block; height: 30vh; width: auto; max-width: 100%; overflow: visible; }',
    '#beat-b0 .b0-q { margin: 0; font: 500 var(--s-sub)/1.2 var(--font-sans); color: color-mix(in oklab, var(--hero-fg) 72%, transparent); }',
    '#beat-b0 .d-why { max-width: 72rem; font-size: var(--s-line); }',
    '#beat-b0 .d-why strong { font-weight: 600; }',
    /* diagram parts (colours from tokens; this section is navy, so hero colours) */
    '#beat-b0 .dg-box { fill: color-mix(in oklab, var(--hero-fg) 6%, transparent); stroke: color-mix(in oklab, var(--hero-fg) 32%, transparent); stroke-width: 1.5; }',
    '#beat-b0 .dg-pill { fill: color-mix(in oklab, var(--hero-fg) 12%, transparent); }',
    '#beat-b0 .dg-t { fill: var(--hero-fg); font-family: var(--font-sans); font-weight: 600; font-size: 30px; }',
    '#beat-b0 .dg-s { fill: color-mix(in oklab, var(--hero-fg) 78%, transparent); font-family: var(--font-sans); font-weight: 400; font-size: 27px; }',
    '#beat-b0 .dg-lab { fill: var(--hero-fg); font-family: var(--font-sans); font-weight: 500; font-size: 27px; }',
    '#beat-b0 .dg-lab b, #beat-b0 .dg-b { font-weight: 600; }',
    '#beat-b0 .dg-note { fill: var(--hero-fg); font-family: var(--font-sans); font-weight: 500; font-size: 27px; }',
    '#beat-b0 .dg-acc { fill: var(--accent); }',
    '#beat-b0 .dg-icon { fill: none; stroke: var(--hero-fg); stroke-width: 1.75; stroke-linecap: round; stroke-linejoin: round; }',
    '#beat-b0 .dg-line { fill: none; stroke: color-mix(in oklab, var(--hero-fg) 70%, transparent); stroke-width: 3; }',
    '#beat-b0 .dg-line-acc { fill: none; stroke: var(--accent); stroke-width: 4.5; }',
    '#beat-b0 .dg-stop { stroke: var(--hero-fg); stroke-width: 7; stroke-linecap: round; }',
    '#beat-b0 .dg-lead { fill: none; stroke: color-mix(in oklab, var(--hero-fg) 55%, transparent); stroke-width: 1.5; }',
    '#beat-b0 .dg-dot { fill: color-mix(in oklab, var(--hero-fg) 80%, transparent); }',
    '#beat-b0 .dg-head { fill: color-mix(in oklab, var(--hero-fg) 70%, transparent); }',
    '#beat-b0 .dg-head-acc { fill: var(--accent); }',
    'body.narrow #beat-b0 { align-content: start; }',
    'body.narrow #beat-b0 .b0-fig svg { height: auto; width: 100%; }',
    'body.narrow #beat-b0 .dg-t { font-size: 19px; } body.narrow #beat-b0 .dg-s, body.narrow #beat-b0 .dg-lab, body.narrow #beat-b0 .dg-note { font-size: 17px; }'
  ].join('\n');

  // Icons: 32 px box, 1.75 stroke, round caps, no fills (DESIGN_SPEC 3.7).
  function iconDoc(x, y, s) {
    return '<g class="dg-icon" transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<path d="M8 3h11l6 6v20H8z"/><path d="M19 3v6h6"/><path d="M12 15h9M12 19h9M12 23h6"/></g>';
  }
  function iconPerson(x, y, s) {
    return '<g class="dg-icon" transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<circle cx="16" cy="10" r="5"/><path d="M6 28c0-6 4.5-10 10-10s10 4 10 10"/></g>';
  }

  // Wide diagram: list -> officer -> fork (stopped / ships). viewBox units are close to screen pixels at 1080p.
  function wideSvg() {
    return '' +
      '<svg viewBox="0 0 1700 380" role="img" aria-label="How a sanctions check works: the compliance officer checks each order against the government list. An order from Company A, on the list, is stopped. An order from Company B, a new name with the same buyer behind it, ships, because the new name is not on the list yet.">' +
      '<defs>' +
        '<marker id="b0-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" class="dg-head"/></marker>' +
        '<marker id="b0-ah-acc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto"><path d="M0 0L10 5L0 10z" class="dg-head-acc"/></marker>' +
      '</defs>' +
      // node 1: the list
      '<rect class="dg-box" x="2" y="88" width="356" height="176" rx="12"/>' +
      iconDoc(22, 104, 1.4) +
      '<text class="dg-t" x="82" y="130">Government</text>' +
      '<text class="dg-t" x="82" y="164">sanctions list</text>' +
      '<rect class="dg-pill" x="22" y="190" width="316" height="54" rx="8"/>' +
      '<text class="dg-lab" x="44" y="226">Company A</text>' +
      // arrow to node 2
      '<path class="dg-line" d="M360 176H432" marker-end="url(#b0-ah)"/>' +
      // node 2: the officer
      '<rect class="dg-box" x="444" y="88" width="380" height="176" rx="12"/>' +
      iconPerson(464, 104, 1.4) +
      '<text class="dg-t" x="524" y="130">Compliance officer</text>' +
      '<text class="dg-s" x="524" y="182">checks every order</text>' +
      '<text class="dg-s" x="524" y="216">against the list</text>' +
      // fork
      '<path class="dg-line" d="M824 176H880L950 70H1428" marker-end="url(#b0-ah)"/>' +
      // lower branch (step 2): the line draws from the fork; its arrowhead is a separate shape so it does not
      // show before the line arrives (a marker-end would)
      '<path class="dg-line-acc" d="M880 176L950 290H1428" data-reveal="2" data-anim="draw" data-anim-order="0" data-anim-dur="800"/>' +
      '<circle class="dg-dot" cx="880" cy="176" r="6"/>' +
      // upper branch: stopped (neutral, not red)
      '<text class="dg-lab" x="972" y="52"><tspan class="dg-b">Company A</tspan></text>' +
      '<line class="dg-stop" x1="1452" y1="42" x2="1452" y2="98"/>' +
      '<text class="dg-t" x="1476" y="81">Order stopped</text>' +
      // the note at the split (step 1)
      '<text class="dg-note" x="906" y="186">The check matches <tspan class="dg-b">names</tspan></text>' +
      // lower branch labels (step 2, one fade after the line lands)
      '<g data-reveal="2" data-anim="fade" data-anim-order="1">' +
        '<path class="dg-head-acc" d="M1411.8 279.9L1432 290L1411.8 300.1z"/>' +
        '<text class="dg-note" x="972" y="274">A new name is <tspan class="dg-b">not on the list yet</tspan></text>' +
        '<text class="dg-lab" x="972" y="336"><tspan class="dg-b dg-acc">Company B:</tspan> new name, same buyer behind it</text>' +
        '<text class="dg-t dg-acc" x="1476" y="301">Order ships</text>' +
      '</g>' +
      '</svg>';
  }

  // Narrow (phone): the same diagram, top to bottom.
  function narrowSvg() {
    return '' +
      '<svg viewBox="0 0 360 560" role="img" aria-label="How a sanctions check works: the compliance officer checks each order against the government list. Company A, on the list, is stopped. Company B, a new name with the same buyer behind it, ships, because the new name is not on the list yet.">' +
      '<defs>' +
        '<marker id="b0-nah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10z" class="dg-head"/></marker>' +
        '<marker id="b0-nah-acc" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto"><path d="M0 0L10 5L0 10z" class="dg-head-acc"/></marker>' +
      '</defs>' +
      '<rect class="dg-box" x="1" y="1" width="358" height="104" rx="10"/>' +
      iconDoc(12, 12, 1) +
      '<text class="dg-t" x="54" y="36">Government sanctions list</text>' +
      '<rect class="dg-pill" x="14" y="56" width="330" height="36" rx="6"/>' +
      '<text class="dg-lab" x="28" y="80">Company A</text>' +
      '<path class="dg-line" d="M180 106V136" marker-end="url(#b0-nah)"/>' +
      '<rect class="dg-box" x="1" y="144" width="358" height="92" rx="10"/>' +
      iconPerson(12, 156, 1) +
      '<text class="dg-t" x="54" y="180">Compliance officer</text>' +
      '<text class="dg-s" x="54" y="210">checks every order against the list</text>' +
      '<text class="dg-note" x="0" y="272">The check matches <tspan class="dg-b">names</tspan></text>' +
      '<path class="dg-line" d="M180 290L90 330V396" marker-end="url(#b0-nah)"/>' +
      '<path class="dg-line-acc" d="M180 290L270 330V396" marker-end="url(#b0-nah-acc)"/>' +
      '<text class="dg-lab" x="80" y="366" text-anchor="end"><tspan class="dg-b">Company A</tspan></text>' +
      '<text class="dg-lab" x="282" y="356"><tspan class="dg-b dg-acc">Company B</tspan></text>' +
      '<text class="dg-s" x="282" y="378">new name</text>' +
      '<line class="dg-stop" x1="62" y1="410" x2="118" y2="410"/>' +
      '<text class="dg-t" x="90" y="442" text-anchor="middle">Order stopped</text>' +
      '<text class="dg-t dg-acc" x="270" y="424" text-anchor="middle">Order ships</text>' +
      '<text class="dg-s" x="180" y="484" text-anchor="middle">Company B: new name, same buyer behind it.</text>' +
      '<text class="dg-note" x="180" y="514" text-anchor="middle">A new name is <tspan class="dg-b">not on the list yet</tspan></text>' +
      '</svg>';
  }

  window.DEMO.register({
    id: 'b0',
    order: 0,
    kicker: 'The question',
    title: "Names change in weeks. The need doesn't.",
    seconds: 18,
    steps: 2,
    stepLabels: [
      'Screen open (no click): the list, the officer, Company A stopped, "The check matches names"',
      'Click: the lower branch draws to "Order ships"; then "So what happens when names change?"'
    ],
    stepNotes: [
      'SAY: "Picture a compliance officer at a chip distributor. Before an order ships, she checks it against a sanctions list: companies nobody may trade with. But the check matches names."\n\nSTART: Alex presses P as Tarun starts speaking (that starts the timer).\nCUE: on "the check matches names", point at the fork. Alex clicks right after "names."',
      'SAY: "A new name isn\'t on the list yet, so the order ships."\n\nMOVE: the lower branch draws from the check to "Order ships"; then "So what happens when names change?" (not spoken; it hands over to the next screen).'
    ],
    notes: [
      'START: Alex presses P as Tarun starts speaking (that starts the timer). The first right arrow is a click on this screen.',
      '',
      'SAY: "Picture a compliance officer at a chip distributor. Before an order ships, she checks it against a sanctions list: companies nobody may trade with. But the check matches names."',
      '',
      '(click) SAY: "A new name isn\'t on the list yet, so the order ships."',
      '',
      'MOVE on the click: the lower branch draws from the check to "Order ships"; then "So what happens when names change?" appears.'
    ].join('\n'),
    glossary: [
      { term: 'Sanctions list', def: "A government's list of companies nobody may trade with." },
      { term: 'Listed / listing', def: 'Added by a government to a sanctions list.' },
      { term: 'Compliance officer', def: 'The person who checks that each order is legal to ship.' },
      { term: 'Lead', def: 'A reason to look closer, not proof of wrongdoing.' }
    ],
    evidence: [],
    render: function (el, ctx) {
      el.classList.add('on-dark');
      var style = document.createElement('style');
      style.textContent = CSS;
      el.appendChild(style);

      var wrap = document.createElement('div');
      wrap.className = 'b0-wrap';
      wrap.innerHTML =
        '<h1 class="d-idea" style="max-width:none"><span class="l">Names change in weeks.</span> <span class="l grad">The need doesn’t.</span></h1>' +
        '<p class="d-explain"><span class="d-label">What you’re looking at</span>A <strong>sanctions list</strong> names companies nobody may do business with: no sales, no payments. It only works when the person checking recognizes the name.</p>' +
        '<figure class="b0-fig">' + (ctx && ctx.isNarrow ? narrowSvg() : wideSvg()) + '</figure>' +
        '<p class="b0-q" data-reveal="2" data-anim="fade" data-anim-order="2">So what happens when names change?</p>' +
        '<p class="d-why"><span class="d-label">Why it matters</span><strong>Our person:</strong> a compliance officer at a chip distributor, deciding whether an order ships.</p>';
      el.appendChild(wrap);
    }
  });
})();
