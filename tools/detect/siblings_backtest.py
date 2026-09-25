"""Back-test for the sibling finder (TRC-25), from the OFAC SDN file alone.

Question: does "same normalised street address" catch firms that OFAC itself
listed in a later wave next to an already-listed firm?  We group non-person
OFAC entries by normalised address key and count pairs at one key whose
first_seen dates differ. first_seen = 2023-04-20 is the start of the
OpenSanctions dataset, not a listing date, so those rows are left out.

Run:  python siblings_backtest.py            (from build/detect)
Writes siblings_backtest.csv next to this file.
"""
from __future__ import annotations

import csv
import itertools
import sys
from collections import defaultdict
from pathlib import Path

from siblings_address import key

HERE = Path(__file__).resolve().parent
OFAC = HERE.parents[1] / "data" / "opensanctions" / "us_ofac_sdn.csv"
DATASET_START = "2023-04-20"
csv.field_size_limit(10**8)


def load_orgs(path: Path = OFAC):
    rows = []
    with open(path, encoding="utf-8", newline="") as f:
        for r in csv.DictReader(f):
            if r["schema"] == "Person":
                continue
            r["_date"] = (r.get("first_seen") or "")[:10]
            r["_keys"] = {k for k in (key(a) for a in (r.get("addresses") or "").split(";")) if k}
            r["_russia"] = "RUS" in (r.get("program_ids") or "") or "RUSSIA" in (r.get("sanctions") or "").upper()
            rows.append(r)
    return rows


def run(out_csv: Path = HERE / "siblings_backtest.csv"):
    orgs = load_orgs()
    by_key = defaultdict(list)
    for r in orgs:
        for k in r["_keys"]:
            by_key[k].append(r)

    pairs = []
    for k, members in by_key.items():
        dated = [m for m in members if m["_date"] and m["_date"] != DATASET_START]
        for a, b in itertools.combinations(dated, 2):
            if a["_date"] == b["_date"] or a["id"] == b["id"]:
                continue
            first, later = (a, b) if a["_date"] < b["_date"] else (b, a)
            pairs.append({
                "address_key": k,
                "listed_orgs_at_address": len(members),
                "first_firm": first["name"], "first_seen": first["_date"],
                "later_firm": later["name"], "later_seen": later["_date"],
                "gap_days": (_d(later["_date"]) - _d(first["_date"])).days,
                "russia_programme": first["_russia"] and later["_russia"],
                "first_id": first["id"], "later_id": later["id"],
                "source": "data/opensanctions/us_ofac_sdn.csv",
            })
    # one row per firm pair even if they share several address keys
    seen, uniq = set(), []
    for p in sorted(pairs, key=lambda p: (-p["russia_programme"], p["address_key"], p["first_seen"])):
        pk = (p["first_id"], p["later_id"])
        if pk in seen:
            continue
        seen.add(pk)
        uniq.append(p)

    with open(out_csv, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=list(uniq[0].keys()) if uniq else ["address_key"])
        w.writeheader()
        w.writerows(uniq)

    n_orgs = len(orgs)
    n_dated = sum(1 for r in orgs if r["_date"] and r["_date"] != DATASET_START)
    shared_keys = sum(1 for m in by_key.values() if len(m) >= 2)
    rus = [p for p in uniq if p["russia_programme"]]
    print(f"OFAC non-person entries: {n_orgs}; with a real first_seen (not {DATASET_START}): {n_dated}")
    print(f"Normalised addresses shared by 2+ listed organisations (any date): {shared_keys}")
    print(f"Pairs at one address listed in different waves: {len(uniq)} "
          f"(addresses: {len({p['address_key'] for p in uniq})}); Russia-programme pairs: {len(rus)}")
    print()
    print(f"{'first listed':42} {'date':10}  {'later listed':42} {'date':10} {'gap':>5} {'n@addr':>6}  address key")
    for p in rus:
        print(f"{p['first_firm'][:42]:42} {p['first_seen']}  {p['later_firm'][:42]:42} {p['later_seen']} "
              f"{p['gap_days']:>5} {p['listed_orgs_at_address']:>6}  {p['address_key'][:60]}")
    print(f"\nwritten: {out_csv}")
    return uniq


def _d(s):
    from datetime import date
    return date.fromisoformat(s)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    run()
