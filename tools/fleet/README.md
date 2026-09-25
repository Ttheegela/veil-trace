# tools/fleet: join sanctions lists by IMO number

Three small Python scripts (standard library only, Python 3.10 or later) that reproduce the
tanker counts in [research/shadow-fleet/](../../research/shadow-fleet/). They read **public
list files that you download yourself**. They make no network calls and use no sponsor data.

## Files you need

| Flag | File | Where to get it |
|---|---|---|
| `--uk` | `UK-Sanctions-List.csv` | UK Sanctions List, CSV download (gov.uk) |
| `--us` | `us_ofac_sdn.csv` | OpenSanctions, US OFAC SDN dataset, "targets.simple" CSV |
| `--csl` (optional) | `consolidated.csv` | US Consolidated Screening List, CSV download (trade.gov) |
| `--eu` in `mgrs.py` (optional) | `eu_fsf.csv` | OpenSanctions, EU financial sanctions dataset, "targets.simple" CSV |
| `--eu` in `join.py` (optional) | your own `imo,date` CSV | built by hand from an EU act's ship annex on EUR-Lex |

Put them anywhere; pass the paths on the command line. Nothing is hard-coded.

## Run

```
python join.py  --uk data/UK-Sanctions-List.csv --us data/us_ofac_sdn.csv --csl data/consolidated.csv --out out
python tiers.py --out out
python mgrs.py  --uk data/UK-Sanctions-List.csv --us data/us_ofac_sdn.csv --eu data/eu_fsf.csv --csl data/consolidated.csv --out out
```

- `join.py` joins UK Russia-regime ships to US vessel entries by IMO number and saves `out/state.pkl`.
- `tiers.py` sorts the overlap into filter tiers (strict Iran programme code; plus cited Iran
  order; plus terrorism-only), computes who listed first, and counts name mismatches. It
  writes `out/overlap_ships.json`.
- `mgrs.py` groups the overlap ships by the manager named on the UK list and checks each
  manager against the lists by normalised name. It writes `out/managers.json`.

With the list files we used on 25 September 2026 (UK list report dated 21 September 2026),
`tiers.py` prints 42 strict, 46 with cited Iran orders and the second US file, 54 with
terrorism-only; US first 30, UK first 12; median gap 209 days; 16 of 42 names differ.
Newer list files will give different numbers.

## Publishing rule

- `out/` is git-ignored. `overlap_ships.json` copies the UK list's owner/operator column,
  which names firms that are on no list. Keep it local.
- `mgrs.py` replaces the name of any manager with no list hit by `UNLISTED-nn`. The
  `--keep-unlisted-names` flag is for private checking only; never commit or publish what it
  produces.
- Name matching is exact after normalising, so "no hit" means "not found by this matcher",
  not "proven unlisted".
