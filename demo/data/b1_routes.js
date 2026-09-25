// Beat 1 data: "New doors". Derived by hand from read-only sources (no runtime loads outside build/demo):
//  - Sayari route counts and dates: build/viz/routes_8542_rus.json (window.ROUTES), re-checked against
//    pulls/sayari/20260925T134324Z_search_trade_facets.json (Kyrgyz route, product_origin facet).
//  - UN Comtrade: pulls/comtrade/8542_exports_to_russia_2019_2024_AGGREGATE.json, field "aggregate" only
//    (the corrected, non double-counted totals; LOG 2026-09-25 10:19 correction).
window.DEMO_DATA = window.DEMO_DATA || {};
window.DEMO_DATA.b1 = {
  invasion: { date: '2022-02-24', label: '24 Feb 2022: full-scale invasion' },
  axis: { from: '2019-01-01', to: '2025-01-01' },

  // Sayari shipment records of chips (HS 8542) arriving in Russia, by declared departure country.
  newRoutes: [
    { iso: 'KGZ', name: 'Kyrgyzstan', records: 1147, first: '2022-04-21', last: '2023-12-29', ev: 'b1-e1',
      source: '20260925T134324Z_search_trade_facets.json' },
    { iso: 'ARE', name: 'UAE', records: 2041, first: '2022-04-05', last: '2023-12-30', ev: 'b1-e2',
      source: '20260925T134328Z_search_trade_facets.json' },
    { iso: 'KAZ', name: 'Kazakhstan', records: 715, first: '2022-05-22', last: '2023-08-03', ev: 'b1-e3',
      source: '20260925T134345Z_search_trade_facets.json' }
  ],
  // Context: long-standing senders, visible in the same data since 2019.
  olderRoutes: [
    { iso: 'DEU', name: 'Germany', records: 32595, first: '2019-01-05', last: '2024-07-02', ev: 'b1-e4',
      source: '20260925T134404Z_search_trade_facets.json' },
    { iso: 'TUR', name: 'Turkey', records: 21537, first: '2019-10-08', last: '2024-07-26', ev: 'b1-e4',
      source: '20260925T134353Z_search_trade_facets.json' }
  ],

  // UN Comtrade: each country's own reported chip (HS 8542) exports to Russia, declared value in US$.
  // null = no row returned for that year (not the same as a reported zero).
  comtrade: {
    years: [2019, 2020, 2021, 2022, 2023, 2024],
    source: '8542_exports_to_russia_2019_2024_AGGREGATE.json',
    series: [
      { iso: 'KGZ', name: 'Kyrgyzstan', ev: 'b1-e5',
        usd: [null, null, 5877, 658584, 13531390, 1333365] },
      { iso: 'KAZ', name: 'Kazakhstan', ev: 'b1-e6',
        usd: [326571.2, 176190.99, 245946, 18258557.85, 15609835.05, 411190.22] },
      { iso: 'ARM', name: 'Armenia', ev: 'b1-e7',
        usd: [122219.44, 5202.54, 1715.5, 13105310.99, 15706053.38, null] }
    ]
  },

  // Kyrgyz route: country of manufacture as recorded (Sayari product_origin facet, top buckets).
  madeIn: {
    route: 'Kyrgyzstan',
    total: 1147,
    ev: 'b1-e8',
    source: '20260925T134324Z_search_trade_facets.json',
    parts: [
      { iso: 'CHN', name: 'China', n: 419 },
      { iso: 'MYS', name: 'Malaysia', n: 196 },
      { iso: 'TWN', name: 'Taiwan', n: 140 },
      { iso: 'THA', name: 'Thailand', n: 116 },
      { iso: 'PHL', name: 'Philippines', n: 96 },
      { iso: 'KGZ', name: 'Kyrgyzstan', n: 45, highlight: true },
      { iso: 'OTH', name: 'All other or not stated', n: 135, other: true }
    ]
  }
};
