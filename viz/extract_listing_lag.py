"""Build listing_lag.json (+ .js twin for file://) : per company, from first suspicious date to official listing.

Reads saved Sayari answers in ../../pulls/sayari/ (read-only) and pairs them with listing dates that were checked on
official pages (OFAC recent-actions pages, Federal Register, the UK Sanctions List CSV). Every event carries its source
and a verified flag. Status of every row: lead, not finding.
Run: python extract_listing_lag.py
"""
import json, os
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
PULLS = os.path.normpath(os.path.join(HERE, "..", "..", "pulls", "sayari"))
INVASION = "2022-02-24"
THIN_FROM = "2023-10-01"  # Russia-side customs records thin out from about late 2023 (blind-spot check, verified)

UK_CSV = "data/uk_sanctions_list/UK-Sanctions-List.csv"
UK_URL = "https://www.gov.uk/government/publications/the-uk-sanctions-list"

def ofac(day, verified_file, note=""):
    return {"authority": "US Treasury (OFAC)", "short": "OFAC", "date": day,
            "source_url": f"https://ofac.treasury.gov/recent-actions/{day.replace('-', '')}",
            "source_file": "pulls/tavily/" + verified_file, "verified": True, "note": note}

# ---------------------------------------------------------------------------------------------------------------
# Company set. Listing dates: each checked on the official page named in source_url (saved answer in source_file).
# ---------------------------------------------------------------------------------------------------------------
COMPANIES = [
 {"id": "elem", "name": "ELEM GROUP", "place": "Almaty, Kazakhstan",
  "role": "Shipper on the Kazakhstan-to-Russia chip route (666 of 715 chip records on that route)",
  "entity": "damNQVg-dgZx5gpM6kWqUw",
  "registered": {"date": "2022-03-14", "source_file": "20260925T134427Z_get_entity_summary.json",
                 "note": "Kazakh company registry via Sayari; 18 days after the invasion"},
  "own_range": {"file": "20260925T142852502069Z_29268_search_trade_facets.json",
                "label": "ELEM GROUP's own records into Russia (2,059 of 2,085 matched records are this company)"},
  "route_range": {"file": "20260925T134345Z_search_trade_facets.json", "label": "Kazakhstan-to-Russia chip route (HS 8542), all shippers"},
  "listings": [{"authority": "US Commerce (BIS Entity List)", "short": "BIS", "date": "2023-12-07",
                "source_url": "https://www.federalregister.gov/citation/88-FR-85097",
                "source_file": "US Consolidated Screening List (Entity List row 'Elem Group, LLC', 88 FR 85097)", "verified": True,
                "note": "Correction 13:12: ELEM GROUP's first restriction is the BIS Entity List, 7 Dec 2023 (address matches the OFAC entry)"},
               ofac("2024-02-23", "20260925T141036439217Z_26392_extract.json")],
  "first_suspicious": "registered"},
 {"id": "rm", "name": "RM Design and Development (RM Dizayn)", "place": "Bishkek, Kyrgyzstan",
  "role": "Top shipper on the Kyrgyzstan-to-Russia chip route (644 of 1,147 chip records)",
  "entity": "WBo7TmupYPexuLKYQ1yMZQ",
  "registered": {"date": "2022-03-17", "source_file": "20260925T134432Z_get_entity_summary.json",
                 "note": "Sayari registry; the OFAC entry itself says 'Organization Established Date 17 Mar 2022'"},
  "route_range": {"file": "20260925T134324Z_search_trade_facets.json", "label": "Kyrgyzstan-to-Russia chip route (HS 8542), all shippers"},
  "rows": [{"file": "20260925T135757Z_search_shipments.json", "supplier": "WBo7TmupYPexuLKYQ1yMZQ",
            "label": "shipped from Turkey to Russian buyers", "capped": True}],
  "listings": [{"authority": "US Treasury (OFAC)", "short": "OFAC", "date": "2023-07-20",
                "source_url": "https://www.federalregister.gov/documents/2023/08/08/2023-16934/notice-of-ofac-sanctions-action",
                "source_file": "pulls/tavily/20260925T142738902301Z_4272_extract_b15.json",
                "verified": True,
                "note": "Federal Register 2023-16934 (published 8 Aug 2023), section A: 'On July 20, 2023, OFAC determined...'; the firm is entity 57 in that section"}],
  "first_suspicious": "registered"},
 {"id": "streloi", "name": "STRELOI EKOMMERTS (Streloy E-Commerce)", "place": "St Petersburg, Russia",
  "role": "Buyer of ELEM GROUP's shipments (2,072 of 2,085 records)",
  "entity": "kJ9mLoa-Hy1RofEpS1UOvQ",
  "own_range": {"file": "20260925T142852502069Z_29268_search_trade_facets.json",
                "label": "records ELEM GROUP shipped into Russia (this firm is the buyer in 2,072 of 2,085)"},
  "listings": [ofac("2023-12-12", "20260925T141037976944Z_23152_extract.json"),
               dict(ofac("2023-09-14", "20260925T141037455741Z_2604_extract.json",
                         "A different legal entity, LLC STRELOI, at the same street address (Per. Dmitrovskii 13). Shown for context; not used for the lag."),
                    short="OFAC (sister firm)", sister=True)],
  "first_suspicious": "own_first"},
 {"id": "itic", "name": "ITIC LLC FZ", "place": "Dubai, United Arab Emirates",
  "role": "Top shipper on the UAE-to-Russia chip route (800 of 2,041 chip records)",
  "entity": "I06Pu0V8vu6N9F7q6Y0duw",
  "own_range": {"file": "20260925T142849065416Z_25848_search_trade_facets.json",
                "label": "ITIC's own records into Russia (3,897 of 3,953 matched records are this company)"},
  "route_range": {"file": "20260925T134328Z_search_trade_facets.json", "label": "UAE-to-Russia chip route (HS 8542), all shippers"},
  "listings": [ofac("2024-06-12", "20260925T141038501827Z_10044_extract.json")],
  "first_suspicious": "own_first"},
 {"id": "enkor", "name": "OOO Enkor Grupp", "place": "Kaliningrad, Russia",
  "role": "Buyer of 99.99% silicon from Xinjiang Daqo (on the US Entity List since 24 Jun 2021)",
  "entity": "5cBbyTNkj8cq0bekm8kDmQ",
  "rows": [{"file": "20260925T134737Z_search_shipments.json", "buyer": "5cBbyTNkj8cq0bekm8kDmQ",
            "label": "silicon from Xinjiang Daqo (HS 280461)"}],
  "listings": [dict(ofac("2023-09-14", "20260925T141037455741Z_2604_extract.json",
                         "Also Federal Register 2023-21224 section A: 'On September 14, 2023, OFAC determined...'"))],
  "first_suspicious": "first_row"},
 {"id": "titan", "name": "OOO Titan-Micro", "place": "Moscow, Russia",
  "role": "Buyer of Sinno Electronics' shipments after both were listed",
  "entity": "MWIh_l_d7PqJ2VON9PrOKg",
  "rows": [{"file": "20260925T134631Z_search_shipments.json", "buyer": "MWIh_l_d7PqJ2VON9PrOKg",
            "label": "from Sinno Electronics (Hong Kong)"}],
  "listings": [dict(ofac("2023-05-19", "20260925T142802415310Z_15196_extract_b15.json",
                         "Treasury press release jy1494 the same day"))],
  "first_suspicious": None},
 {"id": "sinno", "name": "Sinno Electronics", "place": "Hong Kong",
  "role": "Chip seller with records to Russia 2012 to 2023; kept shipping after US listings",
  "entity": "2gLgqs9tebcbOxLiAMvheQ",
  "own_range": {"file": "20260925T134534Z_search_trade_facets.json", "label": "all Sinno Electronics records (about 17,200)"},
  "rows": [{"file": "20260925T134704Z_search_shipments.json", "supplier": "2gLgqs9tebcbOxLiAMvheQ",
            "label": "to Turkish buyers (not listed)"},
           {"file": "20260925T134631Z_search_shipments.json", "supplier": "2gLgqs9tebcbOxLiAMvheQ",
            "label": "to Russian buyers"}],
  "listings": [{"authority": "US Commerce (BIS Entity List)", "short": "BIS", "date": "2022-06-28",
                "source_url": "https://www.govinfo.gov/content/pkg/FR-2022-06-30/html/2022-14069.htm",
                "source_file": "pulls/tavily/20260925T142824251064Z_23320_extract_b15.json", "verified": True,
                "note": "Federal Register 2022-14069, published 30 Jun 2022: 'This rule is effective on June 28, 2022.'"},
               ofac("2022-09-30", "20260925T140712475261Z_22320_extract_t10-basic.json"),
               {"authority": "UK (FCDO sanctions list)", "short": "UK", "date": "2023-12-06",
                "source_url": UK_URL, "source_file": UK_CSV, "verified": True,
                "note": "UK Sanctions List, Unique ID RUS2038, Date Designated 06/12/2023"}],
  "first_suspicious": None},
 {"id": "testk", "name": "LLC Testkomplekt", "place": "Moscow, Russia",
  "role": "Electronic-components importer; kept receiving after US and UK listings",
  "entity": "hJLL5hPfA4J2vrnWiNsuew",
  "rows": [{"file": "20260925T140119Z_search_shipments.json", "buyer": "hJLL5hPfA4J2vrnWiNsuew",
            "label": "records with departure country United Kingdom (50-record sample of 192)"},
           {"file": "20260925T140015Z_search_shipments.json", "buyer": "hJLL5hPfA4J2vrnWiNsuew",
            "label": "from an unlisted Shenzhen trader (China)", "capped": True}],
  "listings": [dict(ofac("2023-05-19", "20260925T142802415310Z_15196_extract_b15.json",
                         "Treasury press release jy1494 the same day")),
               {"authority": "UK (FCDO sanctions list)", "short": "UK", "date": "2023-08-08",
                "source_url": UK_URL, "source_file": UK_CSV, "verified": True,
                "note": "UK Sanctions List, Unique ID RUS1949, Date Designated 08/08/2023"},
               dict(ofac("2023-11-02", "20260925T142803027812Z_6232_extract_b15.json",
                         "The shipper Flavic FZE (UAE) was itself listed; it still sent one record on 4 Jan 2024"),
                    short="OFAC (shipper Flavic)", sister=True)],
  "first_suspicious": None},
]

def load(fname):
    d = json.load(open(os.path.join(PULLS, fname), encoding="utf-8"))
    return d["args"], json.loads(d["structured"]["result"])

def facet_range(fname):
    args, r = load(fname)
    fc = {f["name"]: f["buckets"] for f in r["facets"]}
    return fc["earliest_date"][0]["key"], fc["latest_date"][0]["key"]

def clean(v):
    return (v or "")[2:12] if isinstance(v, str) and v.startswith("[") else (v or "")

# Public-repo rule: only companies on an official list (or named in an official release) are named.
# Raw record spellings are replaced by a canonical listed name; every other party becomes a generic label.
PUBLIC_NAMES = {
    'FLAVIC (FZE)': 'Flavic FZE', 'FLAVIC(FZE)': 'Flavic FZE',
    'ROBOTRONIX SEMICONDUCTORS LIMITED': 'Robotronix Semiconductors',
    'SHENZHEN A TECHNOLOGY CO LTD': 'Shenzhen A Technology',
    'SHENZHEN ONE WORLD INTERNATIONAL LOGISTICS CO.,LTD': 'Shenzhen One World',
    'XINJIANG DAQO NEW ENERGY CO.,LTD..': 'Xinjiang Daqo New Energy',
    'ОСОО "РМ ДИЗАЙН АНД ДЕВЕЛОПМЕНТ"': 'RM Design and Development',
    '信諾電子科技有限公司': 'Sinno Electronics',
    'LLC "TESTKOMPLEKT"': 'Testkomplekt',
    'ООО "БАЗИС ТРЕЙД ПРОСОФТ"': 'Basis Trade Prosoft',
    'ООО "РЕГИОН-ПРОФ"': 'Region-Prof',
    'ООО "ТИТАН-МИКРО"': 'Titan-Micro',
    'ООО "ЭНКОР ГРУПП"': 'Enkor Grupp',
}

def public_name(n):
    return PUBLIC_NAMES.get((n or "").strip(), "an unlisted company (not named)")

def rows_from(spec):
    args, r = load(spec["file"])
    out = []
    for it in r.get("items", []):
        sup, buy = it.get("supplier") or {}, it.get("buyer") or {}
        if "supplier" in spec and sup.get("entity_id") != spec["supplier"]:
            continue
        if "buyer" in spec and buy.get("entity_id") != spec["buyer"]:
            continue
        for b in it.get("shipment_buckets", []):
            for s in b.get("deduped_shipments", []):
                kind = "arrival" if s.get("first_arrival_date") else "departure"
                d0 = clean(s.get(f"first_{kind}_date")); d1 = clean(s.get(f"last_{kind}_date"))
                out.append({"type": "shipment", "date": d0, "date_end": d1, "date_kind": kind,
                            "records": s.get("shipment_rows_grouped", 1),
                            "from": public_name(sup.get("name")), "to": public_name(buy.get("name")),
                            "departure": (s.get("departure_country") or ["?"])[0],
                            "hs_code": s.get("primary_hs_code"), "product": (s.get("primary_hs_description") or "")[:90],
                            "group": spec["label"], "source_file": "pulls/sayari/" + spec["file"],
                            "verified": True})
    return out

def months_between(a, b):
    a, b = date.fromisoformat(a), date.fromisoformat(b)
    m = (b.year - a.year) * 12 + (b.month - a.month) - (1 if b.day < a.day else 0)
    return m

out_companies = []
for c in COMPANIES:
    ev = []
    if c.get("registered"):
        g = c["registered"]
        ev.append({"type": "registered", "authority": "company registry (via Sayari)", "date": g["date"],
                   "source_file": "pulls/sayari/" + g["source_file"], "note": g["note"], "verified": True})
    own = None
    if c.get("own_range"):
        a, z = facet_range(c["own_range"]["file"])
        own = (a, z)
        for t, d in (("first_shipment", a), ("last_shipment", z)):
            ev.append({"type": t, "date": d, "scope": c["own_range"]["label"],
                       "source_file": "pulls/sayari/" + c["own_range"]["file"], "verified": True})
    route = None
    if c.get("route_range"):
        a, z = facet_range(c["route_range"]["file"])
        route = {"first": a, "last": z, "label": c["route_range"]["label"],
                 "source_file": "pulls/sayari/" + c["route_range"]["file"]}
    ships = []
    capped = False
    for spec in c.get("rows", []):
        ships += rows_from(spec)
        capped = capped or spec.get("capped", False)
    ships.sort(key=lambda s: s["date"])
    ev += ships
    lst = sorted(c["listings"], key=lambda l: l["date"])
    for l in lst:
        ev.append({"type": "listed", **l})
    own_listings = [l for l in lst if not l.get("sister")]
    first_listing = own_listings[0]["date"]

    fs = c["first_suspicious"]
    if fs == "registered":
        fsd, fsb = c["registered"]["date"], "registered after the invasion"
    elif fs == "own_first":
        fsd, fsb = own[0], "first own trade record into Russia"
    elif fs == "first_row":
        fsd, fsb = ships[0]["date"], "first shipment from an Entity-Listed seller"
    else:
        fsd, fsb = None, "no suspicious date before listing in our records"
    lag = months_between(fsd, first_listing) if fsd else None

    after = {}
    for l in own_listings:
        after[f'{l["short"]} {l["date"]}'] = sum(s["records"] for s in ships if s["date"] > l["date"])
    post = sum(s["records"] for s in ships if s["date"] > first_listing)
    last_seen = max([s["date_end"] or s["date"] for s in ships] + ([own[1]] if own else []))
    out_companies.append({
        "id": c["id"], "name": c["name"], "place": c["place"], "role": c["role"],
        "sayari_entity_url": f'https://graph.sayari.com/resource/entity/{c["entity"]}',
        "first_suspicious": {"date": fsd, "basis": fsb},
        "first_listing": {"date": first_listing, "authority": own_listings[0]["authority"]},
        "lag_months_at_least": lag,
        "post_listing_shipments": post,
        "post_listing_by_listing": after,
        "post_listing_note": ("counts the saved record-level answers only (records whose first date is after the listing); "
                              + ("an answer hit its row limit, so the true count is higher; " if capped else "")
                              + "facet totals cannot be split by date"),
        "last_record_seen": last_seen,
        "route": route,
        "events": ev,
        "status": "lead, not finding",
    })

out = {
    "view": "listing_lag",
    "question": "How long after a company starts to look suspicious does an official list name it, and does trade continue after?",
    "reference_dates": [{"date": INVASION, "label": "Russia's full-scale invasion of Ukraine"}],
    "thin_data_from": THIN_FROM,
    "thin_data_label": "Russia-side customs data thins out: a route 'ending' here may be data ending",
    "status": "lead, not finding",
    "companies": out_companies,
    "caveats": [
        "Listing dates come from official pages only: OFAC recent-actions pages, the Federal Register, and the UK Sanctions List. OpenSanctions 'first seen' dates are not used.",
        "Lags are 'at least': the first suspicious date is the earliest one visible in our records; activity may have started earlier.",
        "Trade dates are record dates in Sayari's trade data (arrival date, or departure date where only that is given). A record is not proof of a breach.",
        "Records after a listing are counted only from saved record-level answers; several answers hit their row limit, so real counts can be higher.",
        "About 81% of chip records into Russia come from Russia's own customs data, which thins out from late 2023. A company 'stopping' then may be the data stopping.",
        "Sinno's US Entity List date is 28 Jun 2022 (the rule's effective date); the Federal Register published it on 30 Jun 2022.",
    ],
}
json.dump(out, open(os.path.join(HERE, "listing_lag.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(os.path.join(HERE, "listing_lag.js"), "w", encoding="utf-8").write(
    "// generated by extract_listing_lag.py from listing_lag.json (file:// pages cannot fetch JSON)\nwindow.LISTING_LAG = "
    + json.dumps(out, ensure_ascii=False) + ";\n")
print(f'{"company":42} {"first suspicious":16} {"first listing":13} {"lag>=":>5} {"after":>5}  last seen')
for c in out_companies:
    print(f'{c["name"][:42]:42} {str(c["first_suspicious"]["date"]):16} {c["first_listing"]["date"]:13} '
          f'{str(c["lag_months_at_least"]):>5} {c["post_listing_shipments"]:>5}  {c["last_record_seen"]}  {c["post_listing_by_listing"]}')
