// Beat 3 data. Derived from build/viz/listing_lag.js (window.LISTING_LAG), official listing dates only.
// Regenerate by hand if listing_lag.js changes. Counts after listing are minimums.
// Redesign 2026-09-25: added plain "role" labels, RM's last Kyrgyz-route record (2023-06-26, evidence b3-e6),
// and "onScreen" per buyer (only Testkomplekt is drawn; Enkor Grupp and Titan-Micro live in the evidence drawer).
// v3 (25 Sep, V3_PLAN.md b3): range ends 2024-12-31 (no buyer row on screen any more, so every month is wider);
// RM Design gets a firstRecord (its Kyrgyz-route records); Testkomplekt onScreen: false (drawer b3-e10, Q&A 7).
// v3 CORRECTED per LOG_2026-09-25 13:12 (outside review, US consolidated screening list): ELEM GROUP's FIRST
// restriction is the BIS Entity List, 2023-12-07 (88 FR 85097), not OFAC 2024-02-23. Lag >= 20 months (was 23);
// the lag range is 15 to 20 months. The OFAC date stays as "laterListed".
window.DEMO_DATA = window.DEMO_DATA || {};
window.DEMO_DATA.b3 = {
 "range": [
  "2022-01-01",
  "2024-12-31"
 ],
 "invasion": "2022-02-24",
 "thinFrom": "2023-10-01",
 "lanes": [
  {
   "id": "elem",
   "name": "ELEM GROUP",
   "place": "Almaty, Kazakhstan",
   "start": "2022-03-14",
   "startKind": "registered",
   "startBasis": "registered 18 days after the invasion",
   "listed": "2023-12-07",
   "listedBy": "BIS Entity List",
   "listedRef": "88 FR 85097",
   "laterListed": "2024-02-23",
   "laterListedBy": "OFAC",
   "listedUrl": "https://ofac.treasury.gov/recent-actions/20240223",
   "months": 20,
   "firstRecord": "2022-06-12",
   "lastRecord": "2023-09-19",
   "after": [],
   "afterCount": 0,
   "role": "shipper, Kazakhstan"
  },
  {
   "id": "rm",
   "name": "RM Design and Development",
   "place": "Bishkek, Kyrgyzstan",
   "start": "2022-03-17",
   "startKind": "registered",
   "startBasis": "registered 21 days after the invasion",
   "listed": "2023-07-20",
   "listedBy": "OFAC",
   "listedUrl": "https://www.federalregister.gov/documents/2023/08/08/2023-16934/notice-of-ofac-sanctions-action",
   "months": 16,
   // its Kyrgyz-route records: data/b2_river.js series "rm" first (evidence b2-e3, b3-e6); lastRecord below is
   // the Turkey leg's last row (b3-e7), kept for the post-listing note; the route's last record is routeLastRecord
   "firstRecord": "2022-04-21",
   "lastRecord": "2023-09-29",
   "after": [
    {
     "date": "2023-07-28",
     "records": 5
    },
    {
     "date": "2023-08-09",
     "records": 7
    },
    {
     "date": "2023-08-28",
     "records": 17
    },
    {
     "date": "2023-08-31",
     "records": 1
    },
    {
     "date": "2023-09-01",
     "records": 3
    },
    {
     "date": "2023-09-08",
     "records": 3
    },
    {
     "date": "2023-09-29",
     "records": 4
    }
   ],
   "afterCount": 40,
   "role": "shipper, Kyrgyzstan",
   "routeLastRecord": "2023-06-26",
   "routeLastBasis": "last record on the Kyrgyz route, 24 days before listing"
  },
  {
   "id": "streloi",
   "name": "STRELOI EKOMMERTS",
   "place": "St Petersburg, Russia (buyer)",
   "start": "2022-06-12",
   "startKind": "first record",
   "startBasis": "first own record into Russia",
   "listed": "2023-12-12",
   "listedBy": "OFAC",
   "listedUrl": "https://ofac.treasury.gov/recent-actions/20231212",
   "months": 18,
   "firstRecord": "2022-06-12",
   "lastRecord": "2023-09-19",
   "after": [],
   "afterCount": 0,
   "role": "buyer, Russia"
  },
  {
   "id": "itic",
   "name": "ITIC LLC FZ",
   "place": "Dubai, UAE",
   "start": "2023-03-06",
   "startKind": "first record",
   "startBasis": "first own record into Russia",
   "listed": "2024-06-12",
   "listedBy": "OFAC",
   "listedUrl": "https://ofac.treasury.gov/recent-actions/20240612",
   "months": 15,
   "firstRecord": "2023-03-06",
   "lastRecord": "2024-01-26",
   "after": [],
   "afterCount": 0,
   "role": "shipper, UAE"
  }
 ],
 "buyers": [
  {
   "id": "enkor",
   "name": "Enkor Grupp",
   "listed": "2023-09-14",
   "listedBy": "OFAC",
   "listedUrl": "https://ofac.treasury.gov/recent-actions/20230914",
   "before": [
    {
     "date": "2023-08-02",
     "records": 2
    }
   ],
   "after": [
    {
     "date": "2024-02-01",
     "records": 4
    },
    {
     "date": "2025-01-21",
     "records": 1
    }
   ],
   "afterCount": 5,
   "lastRecord": "2025-01-21",
   "from": "silicon from Xinjiang Daqo (US Entity List)",
   "onScreen": false
  },
  {
   "id": "titan",
   "name": "Titan-Micro",
   "listed": "2023-05-19",
   "listedBy": "OFAC",
   "listedUrl": "https://ofac.treasury.gov/recent-actions/20230519",
   "before": [],
   "after": [
    {
     "date": "2023-09-29",
     "records": 15
    },
    {
     "date": "2023-11-02",
     "records": 8
    },
    {
     "date": "2023-12-06",
     "records": 1
    }
   ],
   "afterCount": 24,
   "lastRecord": "2023-12-06",
   "from": "chips from Sinno Electronics (US-listed)",
   "onScreen": false
  },
  {
   "id": "testk",
   "name": "Testkomplekt",
   "listed": "2023-05-19",
   "listedBy": "OFAC",
   "listedUrl": "https://ofac.treasury.gov/recent-actions/20230519",
   "before": [
    {
     "date": "2022-01-13",
     "records": 4
    },
    {
     "date": "2022-02-11",
     "records": 1
    }
   ],
   "after": [
    {
     "date": "2023-06-09",
     "records": 24
    },
    {
     "date": "2023-06-17",
     "records": 8
    },
    {
     "date": "2023-06-23",
     "records": 1
    },
    {
     "date": "2023-08-17",
     "records": 2
    },
    {
     "date": "2023-08-18",
     "records": 1
    },
    {
     "date": "2023-09-02",
     "records": 1
    },
    {
     "date": "2023-09-18",
     "records": 1
    },
    {
     "date": "2023-09-21",
     "records": 1
    },
    {
     "date": "2023-09-28",
     "records": 4
    },
    {
     "date": "2023-10-26",
     "records": 1
    },
    {
     "date": "2024-01-04",
     "records": 1
    },
    {
     "date": "2024-12-14",
     "records": 12
    },
    {
     "date": "2024-12-16",
     "records": 2
    },
    {
     "date": "2024-12-20",
     "records": 4
    },
    {
     "date": "2025-01-13",
     "records": 6
    },
    {
     "date": "2025-03-10",
     "records": 1
    }
   ],
   "afterCount": 70,
   "lastRecord": "2025-03-10",
   "from": "several suppliers",
   "onScreen": false,
   "role": "the buyer from the last screen"
  }
 ]
};
