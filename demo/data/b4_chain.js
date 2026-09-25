// Beat 4 data: "The drone part" (v3, V3_PLAN.md section 1, b4). Derived from build/viz/weapon_chain.js and
// LOG_2026-09-25.md rows 10:31, 10:45 (fact-check: ONE exact-part ACE row only; all listing dates official) and 11:02 (Shreya).
// Leads, not findings. Shipment records, not values. The part-to-weapon link is not proven.
// v3: the chain and the time ruler are ONE diagram. The shipper and buyer boxes became lanes on one time axis;
// "100 + 22 pieces" became the labels on the two shipment records; "Not proven" sits on the dashed link.
// Everything cut from the screen stays here as drawer items (ids unchanged, nothing deleted).
window.DEMO_DATA = window.DEMO_DATA || {};
window.DEMO_DATA.b4 = {
  idea: 'A drone’s chip model was shipped into Russia months before any firm on its path was listed.',
  explainer: 'Ukraine’s defence intelligence (GUR, a party to the war) publishes the parts it finds in Russian weapons. We searched shipment records for one exact part number.',
  why: 'For the compliance officer: a part number is a clue that stays the same when a company changes its name.',
  weapon: { label: 'THE DRONE', name: 'Shahed-136 drone', note: 'part documented by GUR', ev: ['b4-e1'] },
  link: {
    label: 'Not proven',
    caption: ['whether these chips reached a weapon.', 'Parts can be resold, old stock or fake.'],
    ev: ['b4-e2']
  },
  part: {
    label: 'THE PART',
    kind: 'Flight-control chip',
    number: 'STM32F765VIT6',
    note: ['Part number: the maker’s code', 'for one exact chip model.'],
    ev: ['b4-e1']
  },
  hop: 'same part number in shipment records',
  // One shared time axis for every lane (Jan 2022 to the end of 2024).
  range: { from: '2022-01-01', to: '2025-01-01' },
  // Lanes, top to bottom. listed = each firm's FIRST listing only; later listings are drawer items (b4-e6 to b4-e8).
  lanes: [
    { id: 'ace', name: 'ACE ELECTRONIC', role: 'shipper, Hong Kong', ev: ['b4-e3', 'b4-e5'], listed: { date: '2023-10-06', ev: ['b4-e5'] } },
    { id: 'jms', name: 'JINMINGSHENG TECHNOLOGY', role: 'shipper, Hong Kong', ev: ['b4-e4', 'b4-e9'], listed: { date: '2024-05-01', ev: ['b4-e9'] } },
    { id: 'onelek', name: 'OOO Onelek', role: 'buyer, Russia', ev: ['b4-e10'], listed: { date: '2023-07-20', ev: ['b4-e10'] } }
  ],
  // The two shipment records with the exact part number, in date order. Never add them up on screen.
  shipments: [
    { from: 'ace', to: 'onelek', date: '2022-08-26', pieces: 100, ev: ['b4-e3'] },
    { from: 'jms', to: 'onelek', date: '2022-11-30', pieces: 22, ev: ['b4-e4'] }
  ],
  received: { text: 'one Russian buyer received both', ev: ['b4-e3', 'b4-e4'] },
  gapLabel: 'not listed yet',          // one label, on the top lane's gap: a screen in this stretch says "clean"
  big: { big: '11 to 17', unit: 'months', caption: ['from each shipment to that', 'firm’s first listing.'], ev: ['b4-e11'] },
  evidence: [
    { id: 'b4-e1', claim: 'Ukraine’s defence intelligence (GUR, a party to the war) documents the STM32F765VIT6 microcontroller, a flight-control chip, in the Shahed-136 drone. A part number is the maker’s code for one exact chip model: searching for the full code finds that model and nothing else (the shorter code STM32F765 alone found no records).', value: 'STM32F765VIT6 in Shahed-136', source: 'GUR War and Sanctions portal, component 2090 (confirmed on the GUR page in our fact-check)', receipt: 'https://war-sanctions.gur.gov.ua/en/components/2090 ; LOG_2026-09-25.md rows 10:31 and 10:45', check: 'official' },
    { id: 'b4-e2', claim: 'No shipment record proves these chips reached a weapon. Parts may be resold, older stock, or counterfeit. A part type found in a weapon is context, not proof. On the screen, the link from the drone to the part is dashed for this reason and is never drawn solid.', value: 'Not proven', source: 'Our own limits statement, checked in the fact-check', receipt: 'LOG_2026-09-25.md rows 10:31 and 10:45; build/viz/weapon_chain.js', check: 'verified' },
    { id: 'b4-e3', claim: 'ACE ELECTRONIC (HK) CO., LIMITED, a shipper in Hong Kong, shipped to OOO ONELEK (Russia) with the exact part number STM32F765VIT6 in the shipment text: 100 pieces. Only this one ACE record has the exact part number; a 2023-02-08 ACE record is generic and is not counted. Shipment records, not values: we count pieces and records, not dollars.', value: '26 Aug 2022, 100 pieces', source: 'Shipment records via Sayari (sponsor data), saved 25 Sep 2026', receipt: 'pulls/sayari/20260925T142701077807Z_19572_search_shipments.json', check: 'verified' },
    { id: 'b4-e4', claim: 'JINMINGSHENG TECHNOLOGY (HK) CO., LIMITED, a shipper in Hong Kong, shipped to OOO ONELEK (Russia) with the exact part number STM32F765VIT6 in the shipment text: 22 pieces. With the ACE record, the same Russian buyer received this part twice in 2022 (the two shipments are shown separately, never added up).', value: '30 Nov 2022, 22 pieces', source: 'Shipment records via Sayari (sponsor data), saved 25 Sep 2026', receipt: 'pulls/sayari/20260925T142701077807Z_19572_search_shipments.json', check: 'verified' },
    { id: 'b4-e11', claim: 'Gap from each firm’s exact-part shipment here to its first listing (put on a government list that limits trade with it): OOO Onelek 26 Aug 2022 to 20 Jul 2023, US Treasury sanctions list (about 11 months); ACE ELECTRONIC 26 Aug 2022 to 6 Oct 2023, US Commerce Entity List (about 13 months); JINMINGSHENG TECHNOLOGY 30 Nov 2022 to 1 May 2024, US Treasury sanctions list (about 17 months). All three shipments came before any listing: in that stretch a name check would have come back clean ("not listed yet").', value: '11 to 17 months', source: 'Computed from the shipment and listing items on this screen', receipt: 'b4-e3, b4-e4, b4-e5, b4-e9, b4-e10', check: 'verified' },
    { id: 'b4-e10', claim: 'OOO ONELEK (the Russian buyer) added to the US Treasury sanctions list (the SDN list kept by OFAC, the Treasury’s sanctions office). This is the buyer’s first listing, about 11 months after the first shipment it received with this part number.', value: '20 Jul 2023', source: 'US Treasury sanctions list (official page, fact-check)', receipt: 'OFAC SDN; LOG_2026-09-25.md row 10:45', check: 'official' },
    { id: 'b4-e5', claim: 'ACE ELECTRONIC added to the US Commerce Department’s Entity List (an export-control list run by BIS: US goods need a licence to reach listed firms). This is ACE’s first listing, about 13 months after its shipment with this part number.', value: '6 Oct 2023', source: 'US Commerce Entity List (official page, fact-check)', receipt: 'BIS Entity List; LOG_2026-09-25.md row 10:45', check: 'official' },
    { id: 'b4-e9', claim: 'JINMINGSHENG TECHNOLOGY added to the US Treasury sanctions list (OFAC SDN). This is its first listing, about 17 months after its shipment with this part number.', value: '1 May 2024', source: 'US Treasury sanctions list (official page, fact-check)', receipt: 'OFAC SDN; LOG_2026-09-25.md row 10:45', check: 'official' },
    { id: 'b4-e6', offscreen: true, claim: 'ACE ELECTRONIC later added to the US Treasury sanctions list (OFAC SDN).', value: '30 Oct 2024', source: 'US Treasury sanctions list (official page, fact-check)', receipt: 'OFAC SDN; LOG_2026-09-25.md row 10:45', check: 'official' },
    { id: 'b4-e7', offscreen: true, claim: 'ACE ELECTRONIC later added to the UK sanctions list.', value: '24 Feb 2025', source: 'UK sanctions list (official page, fact-check)', receipt: 'LOG_2026-09-25.md rows 10:31 and 10:45', check: 'official' },
    { id: 'b4-e8', offscreen: true, claim: 'ACE ELECTRONIC later added to the EU sanctions list.', value: '18 Jul 2025', source: 'EU sanctions list (official page, fact-check)', receipt: 'LOG_2026-09-25.md row 10:45', check: 'official' },
    { id: 'b4-e12', offscreen: true, claim: 'Same pattern with AI chips: Bloomberg reported that Shreya Life Sciences (India) shipped servers with H100 AI chips to Russia. Shreya was added to the US Treasury sanctions list two days after that report. The reported shipments are Bloomberg’s, not re-checked by us.', value: '30 Oct 2024 (two days after the report)', source: 'US Treasury sanctions list via OpenSanctions (first-seen date); Bloomberg report', receipt: 'us_ofac_sdn.csv (first_seen, not the placeholder date); ideas/ai_chips/verify_b20_TRC-32.md; LOG_2026-09-25.md row 11:02', check: 'verified' }
  ],
  glossary: [
    { term: 'Part number', def: 'The maker’s code for one exact product model. Searching for the full code finds that model and nothing else.' },
    { term: 'Microcontroller', def: 'A small computer on one chip. In a drone it can run flight control.' },
    { term: 'Shipment records', def: 'Customs paperwork for individual deliveries: who sent what to whom, and when. We count records, not dollar values.' },
    { term: 'Listed', def: 'Put on a government list that restricts trade with a company, such as a sanctions list or an export-control list.' },
    { term: 'Sanctions list', def: 'A government list of companies that people and firms under that government may not do business with.' },
    { term: 'Export-control list', def: 'A government list of companies that cannot receive certain goods (here, US goods) without a licence. The US Commerce Entity List is one.' },
    { term: 'GUR', def: 'Ukraine’s defence intelligence agency. It is a party to the war, so we cite it as such.' },
    { term: 'OOO', def: 'The Russian short form for a limited company, like "LLC".' },
    { term: 'Dashed line', def: 'On this screen, a link we cannot prove. Solid lines are shipment records we can show.' }
  ]
};
