# Russia and Ukraine: dual-use goods reaching Russia

Part of **Trace the Unseen**, a hackathon project for the Sanctions track of the Climate Intelligence Build
Day, 25 September 2026.

## What this branch is

Chips, machine tools and other "dual-use" goods (goods with both civilian and military uses) kept reaching
Russia after its full-scale invasion of Ukraine on 24 February 2022. This branch collects what our team found
in one day, using sponsor trade data (Sayari shipment records and Tradeverifyd trade links), countries' own
trade statistics (UN Comtrade) and official sanctions lists.

The one-line takeaway: **names change in weeks, routes in months, while the buyer and the part persist for
years.** Sanctions lists name companies, and they caught up with the companies we traced 15 to 20 months
after those companies first showed up.

**Documented conduct is stated plainly with its source; our own inferences are marked as leads.** We describe conduct; we don't make legal findings.

## How to read it

| File | What it holds |
|---|---|
| [FINDINGS.md](FINDINGS.md) | What the records show, by theme (new routes, company churn, listing lag, buyers, part numbers, Turkey, UAE, Hong Kong and China, machine tools, plywood and aluminium, payments, screening gaps, AI chips), each with numbers, dates, official sources and a solidity rating |
| [OPEN_LEADS.md](OPEN_LEADS.md) | Open questions and the next test for each; unlisted firms are described, not named |
| [SOCIAL.md](SOCIAL.md) | Short summary of the social side (forged paperwork, remittances, disinformation, enablers), checked items only |
| `../../viz/` | The day's interactive views (open the HTML files in a browser) and the scripts that built their data |
| `../../detect/` | Detection code: exact alias and ID cross-check, and a "sibling" finder (same address plus shared trading partner) |

**Solidity ratings:** H (high: re-derived by an independent checker, dates on official pages), M (medium),
L (low). Every correction made on the day is listed at the end of FINDINGS.md.

**Naming rule.** A company is named only if it is on an official US, UK, EU or UN list, or named in an
official government release, and the list and date are given. Unlisted companies are described generically.
No private individuals are named.

**Data we do not publish.** Raw sponsor answers are not in this repository. Counts and dates derived from them
are, with the source named ("Sayari shipment records"). Some receipt links in the views point to local file
names of those raw answers; they will not open here.

## The views (`viz/`)

| View | What it shows |
|---|---|
| `index.html` | Which countries ship chips into Russia and since when, against the invasion date |
| `river.html` | "Same river, new boats": per-route monthly records, coloured by firm, with listing pins |
| `listing_lag.html` | One lane per company: first sign, listings, records after listing |
| `coverage.html` | Map of what our data can and cannot see, the drone-chip chain, and listed ships |

Changes made for this public copy:

- **ELEM GROUP correction applied.** Its first restriction is now shown as the BIS Entity List on 2023-12-07
  (88 FR 85097), with OFAC on 2024-02-23 as a second listing. `listing_lag.js` / `listing_lag.json` were
  regenerated with the corrected script (lag at least 20 months), and the ELEM pin in `river.js` now reads
  "left this route 209 days before its first listing".
- **Names cleaned in `listing_lag.js` / `.json`.** Record-level parties are shown by their listed name only;
  every unlisted party reads "an unlisted company (not named)". Raw record spellings are not included.
- **`ships.js` rewritten** so that only listed ships are named; owners and managers not on a list are
  described.
- **Known limit in the listing-lag view:** RM Design's "records after listing" shows 25 because the saved
  answer it reads was a capped page. The full pull found 40 of 76 (see FINDINGS section 6).
- **Known limit in the river view:** one merged RM Design record is a Turkish-registered spelling whose
  identity with the Bishkek firm is not verified (see OPEN_LEADS item 6).

**Rebuilding the data.** `extract_routes.py`, `extract_listing_lag.py` and `extract_river.py` read raw sponsor
answers that are not in this repository. To rebuild, run them locally where those files exist. In
`extract_river.py`, two unlisted supplier names and two unlisted firm keys are placeholders; set them locally
(environment variables `RIVER_UNLISTED_SUPPLIER_1` and `RIVER_UNLISTED_SUPPLIER_2`) from sponsor data. Never
commit the regenerated files without re-running the naming check.

## The detection code (`detect/`)

- `aliases.py`: finds sponsor records that share an **exact** alias or ID with a listed company but are
  flagged "not sanctioned". Set `CLIMATE_DAY_ROOT` (a folder holding `data/opensanctions/` and `pulls/sayari/`)
  and `UK_SANCTIONS_CSV`. `test_aliases.py` runs its unit tests; the one test that needs sponsor data skips
  itself without it.
- `siblings.py`, `siblings_address.py`, `siblings_backtest.py`: the sibling finder and its back-test on the
  public US list. `siblings.py` also imports our name checker (`sanctions/check.py`), which is not part of this
  branch.
- Outputs are **not** included (`screen_gaps.csv`, `siblings.csv`, `siblings_backtest.csv`, run logs). They
  contain unlisted company names or rows from sponsor data. Regenerate them locally; the back-test uses only
  the public OFAC list.

## Sources and credits

- Sponsor data: Sayari and Tradeverifyd (used under the event's terms; raw answers not published).
- Countries' own trade statistics: UN Comtrade.
- Official lists: US Treasury OFAC, US Commerce BIS (via the US Consolidated Screening List), UK Sanctions List,
  EU Official Journal; list-file dates from OpenSanctions (used locally, not redistributed).
- Weapon components: Ukraine's defence intelligence (GUR) War and Sanctions portal; GUR is a party to the war.
- `coverage.html` adapts small pieces of God's Eye View (MIT licence); map outlines from Natural Earth (public
  domain). Details in `viz/THIRD_PARTY.md`.
