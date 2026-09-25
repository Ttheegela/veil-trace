"""Sibling finder (TRC-25): unlisted firms that share an address and a trading partner with a listed firm.

Two independent signals are required for every lead:
  1. ADDRESS: the sibling's Sayari address normalises to the same street + building as the listed
     firm's address (office / room / floor / litera parts dropped; see siblings_address.py).
  2. SHARED PARTNER: the sibling and the listed firm both appear in the same trading partner's
     counterparty list (a saved Sayari search_buyers / search_suppliers answer for that partner).
Leads are for review, not findings. Wording: "shares an address and a trading partner with a listed firm".

Score = shared partners x 1/log2(1 + tenants at address) + 1 if registered within 90 days after 2022-02-24.
Tenants = companies Sayari returns for a free-text search of that address (its total_available), or,
if no address search was saved, the number of distinct companies seen at that building in saved answers.

Reads only saved answers in pulls/sayari/ (no live calls). Run from build/detect:
    python siblings.py            -> prints the ranked table, writes siblings.csv
"""
from __future__ import annotations

import csv
import glob
import json
import math
import os
import sys
from collections import defaultdict
from datetime import date
from pathlib import Path

from siblings_address import key, same_building

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
PULLS = ROOT / "pulls" / "sayari"
OS_DIR = ROOT / "data" / "opensanctions"
INVASION = date(2022, 2, 24)

# Listed firms we start from (OFAC SDN, from our findings). Addresses: OFAC row + the Sayari record.
LISTED = [
    {"name": "LIMITED LIABILITY COMPANY STRELOI / STRELOI EKOMMERTS", "sayari_ids": ["kJ9mLoa-Hy1RofEpS1UOvQ"],
     "ofac_ids": ["NK-kTVGAGQrTRdBDHm9RBfMxA", "NK-ViQ5mbKZCQFxpFUxZoFJcE"],
     "address": "Per. Dmitrovskii D. 13, Saint Petersburg, 191025",
     "address_search": "Dmitrovsky pereulok 13 Saint Petersburg"},
    {"name": "OOO Titan-Micro", "sayari_ids": ["MWIh_l_d7PqJ2VON9PrOKg"], "ofac_ids": ["NK-iWrqVdfLifqyHycPBoBSNi"],
     "address": "65 Profsoyuznaya Street, Moscow", "address_search": "Profsoyuznaya 65 Moscow"},
    {"name": "LLC TestKomplekt", "sayari_ids": ["Z-ouCpFi1gfDZfBcawiIig"], "ofac_ids": ["NK-gYqEeiZgmFvCrvnNePJmAR"],
     "address": "ul. Kolpakova, d. 24A, Mytishchi, Moscow oblast", "address_search": "Kolpakova 24A Mytishchi"},
    {"name": "OOO ENKOR GRUPP", "sayari_ids": ["5cBbyTNkj8cq0bekm8kDmQ"], "ofac_ids": ["NK-BAxMCva9qauh6Zndznynhm"],
     "address": "Ul. Teatralnaya D. 35, Kaliningrad, 236006", "address_search": "Teatralnaya 35 Kaliningrad"},
    {"name": "LIMITED LIABILITY PARTNERSHIP ELEM GROUP", "sayari_ids": ["damNQVg-dgZx5gpM6kWqUw"],
     "ofac_ids": ["NK-VdC3KXo6RXzT8GBhWCL8RG"],
     "address": "Ulitsa Nauriyzbai Batiyra, Dom 8, Almaty", "address_search": "Nauryzbai Batyr 8 Almaty"},
    {"name": "LLC RM Design and Development (Istanbul office)", "sayari_ids": ["qOTV1trPEObHvPLAF6GdGQ", "WBo7TmupYPexuLKYQ1yMZQ"],
     "ofac_ids": ["NK-kL5urGiKf2sPAGbR25qiuj"],
     "address": "Sultan Selim Mah. Eski Buyukdere Cad No: 61 Kagithane, Istanbul",
     "address_search": "Eski Buyukdere Cad No 61 Kagithane Istanbul"},
    {"name": "LLC RM Design and Development (Bishkek)", "sayari_ids": ["WBo7TmupYPexuLKYQ1yMZQ"],
     "ofac_ids": ["NK-kL5urGiKf2sPAGbR25qiuj"],
     "address": "Chyngyza Atymatova Str., 303, Bishkek, 720016", "address_search": "Chingiz Aitmatov Avenue 303 Bishkek"},
]


def _load(path):
    try:
        d = json.load(open(path, encoding="utf-8"))
        return d, json.loads(d["structured"]["result"])
    except Exception:
        return None, None


def load_pulls():
    """Returns (entities, partner_lists, address_searches)."""
    entities = {}              # id -> {label, addresses, sanctioned, registration_date, sources}
    partner_lists = []         # {partner, side, file, ids:set}
    address_searches = {}      # query -> {total, file, items}
    for f in sorted(glob.glob(str(PULLS / "*.json"))):
        d, r = _load(f)
        if not r or not isinstance(r, dict):
            continue
        tool, args = d.get("tool"), d.get("args") or {}
        items = r.get("items") or []
        if tool in ("get_entity_profile", "get_entity_summary") and r.get("entity_id"):
            items = [dict(r, addresses=r.get("attributes", {}).get("addresses", []),
                          risk_flags=r.get("risk", {}))]
        for it in items:
            eid = it.get("entity_id")
            if not eid:
                continue
            e = entities.setdefault(eid, {"label": it.get("label", ""), "addresses": [], "sanctioned": None,
                                          "registration_date": "", "sources": set(), "type": it.get("type", "")})
            for a in it.get("addresses") or []:
                if a and a not in e["addresses"]:
                    e["addresses"].append(a)
            rf = it.get("risk_flags") or {}
            if "sanctioned" in rf:
                e["sanctioned"] = bool(rf["sanctioned"]) or bool(e["sanctioned"])
                e["risk_levels"] = rf.get("risk_levels", [])
            for n in (it.get("attributes") or {}).get("names") or []:
                e.setdefault("names", set()).add(n)
            rd = (it.get("attributes") or {}).get("registration_date")
            if rd:
                e["registration_date"] = rd
            e["sources"].add(os.path.basename(f))
        if tool in ("search_buyers", "search_suppliers") and items and r.get("response_mode") == "full":
            partner = args.get("shipper_name") if tool == "search_buyers" else args.get("receiver_name")
            if partner:
                partner_lists.append({"partner": partner, "side": "buyers of" if tool == "search_buyers" else "suppliers to",
                                      "file": os.path.basename(f), "ids": {it["entity_id"] for it in items},
                                      "complete": (r.get("returned") or 0) >= (r.get("total_available") or 0)})
        if tool == "search_entities" and args.get("query"):
            address_searches[args["query"]] = {"total": r.get("total_available"), "file": os.path.basename(f),
                                               "items": [it.get("entity_id") for it in items]}
    return entities, partner_lists, address_searches


def opensanctions_names():
    import re
    names = {}
    csv.field_size_limit(10**8)
    for fn in ("us_ofac_sdn.csv", "eu_fsf.csv", "ua_war_sanctions.csv"):
        p = OS_DIR / fn
        if not p.exists():
            continue
        with open(p, encoding="utf-8", newline="") as f:
            for r in csv.DictReader(f):
                if r.get("schema") == "Person":
                    continue
                for n in [r.get("name", "")] + (r.get("aliases") or "").split(";"):
                    k = _core(n)
                    if k:
                        names.setdefault(k, (fn, r.get("id"), r.get("name")))
    return names


def _core(name: str) -> str:
    import re
    from siblings_address import _ascii
    n = _ascii(name or "")
    n = re.sub(r"obshchestvo s ogranichennoi otvetstvennostyu|limited liability company|\booo\b|\bllc\b|\bllp\b|"
               r"tovarishchestvo s ogranichennoi otvetstvennostyu|\bltd\b|limited|sirketi|\bao\b|\bzao\b|\bpao\b",
               " ", n)
    n = re.sub(r"[^a-z0-9 ]", " ", n)
    return re.sub(r"\s+", " ", n).strip()


def team_checker(name: str):
    """The team checker (UK / US / UN lists). Returns the best candidate or None."""
    sys.path.insert(0, str(HERE.parent))
    try:
        from sanctions.check import check
        from siblings_address import _ascii
        import re
        q = re.findall(r'"+([^"]+)"+', name)
        core = q[0] if q else _core(name)
        best = None
        for cand in {core, _ascii(core)}:
            for m in check(cand) or []:
                if best is None or m.score > best["score"]:
                    best = m.to_dict()
        if best:
            best["checked_as"] = core
        return best
    except Exception as ex:  # checker unavailable: say so, never assume clean
        return {"error": str(ex)}


def reg_bonus(reg: str) -> int:
    try:
        d = date.fromisoformat(reg[:10])
    except Exception:
        return 0
    return 1 if 0 <= (d - INVASION).days <= 90 else 0


def run(out_csv: Path = HERE / "siblings.csv"):
    entities, plists, asearch = load_pulls()
    os_names = opensanctions_names()
    rows = []
    for L in LISTED:
        laddrs = [L["address"]] + [a for i in L["sayari_ids"] for a in entities.get(i, {}).get("addresses", [])
                                   if same_building(a, L["address"])]
        # tenants at the building
        s = asearch.get(L["address_search"])
        seen_here = {eid for eid, e in entities.items() if any(same_building(a, L["address"]) for a in e["addresses"])}
        tenants = max(s["total"] or 0, len(seen_here)) if s else len(seen_here)
        tenant_src = f"{s['file']} (Sayari address search, total_available)" if s else "companies seen at this building in saved answers"
        # partner lists that contain the listed firm
        mine = [p for p in plists if p["ids"] & set(L["sayari_ids"])]
        cands = defaultdict(list)
        for p in mine:
            for eid in p["ids"] - set(L["sayari_ids"]):
                e = entities.get(eid)
                if not e or e.get("type") not in ("company", ""):
                    continue
                if any(same_building(a, L["address"]) for a in e["addresses"]):
                    cands[eid].append(p)
        for eid, ps in cands.items():
            e = entities[eid]
            partners = sorted({f"{p['side']} {p['partner']}" for p in ps})
            names = [e["label"]] + sorted(e.get("names", set()) - {e["label"]})
            os_hit = next((os_names[_core(n)] for n in names if _core(n) in os_names), None)
            tcs = [t for t in (team_checker(n) for n in names) if t and t.get("score")]
            tc = max(tcs, key=lambda t: t["score"]) if tcs else None
            import re as _re
            set_aside = "consignee label via a forwarder, not a registered company" if _re.search(
                r"\bTHROUGH\b|\bC/O\b|\bVIA\b", e["label"], _re.I) else ""
            listed = bool(e.get("sanctioned")) or bool(os_hit) or bool(tc and not tc.get("error") and tc.get("score", 0) >= 95)
            addr = next(a for a in e["addresses"] if same_building(a, L["address"]))
            score = len(partners) / math.log2(1 + max(tenants, 1)) + reg_bonus(e["registration_date"])
            rows.append({
                "listed_firm": L["name"], "listed_address": L["address"], "sibling": e["label"],
                "sibling_latin_name": next((n for n in names if n.isascii()), ""), "sibling_sayari_id": eid,
                "sibling_address": addr, "address_key": key(L["address"]), "tenants_at_address": tenants,
                "tenant_count_source": tenant_src, "shared_partners": len(partners), "shared_partner_names": " | ".join(partners),
                "registration_date": e["registration_date"] or "unknown (not in saved answers)",
                "registered_within_90d_of_2022-02-24": bool(reg_bonus(e["registration_date"])),
                "score": round(score, 3),
                "unlisted_check": ("LISTED/flagged: " + ("Sayari sanctioned flag " if e.get("sanctioned") else "")
                                   + (f"OpenSanctions {os_hit[0]} {os_hit[2]} " if os_hit else "")
                                   + (f"team checker {tc.get('entity_name')} ({tc.get('score')}) " if tc and tc.get("score", 0) >= 95 else "")) if listed
                                  else "no match: Sayari flag, OpenSanctions US/EU/UA names, team checker (UK/US/UN)"
                                       + (f"; checker best {tc.get('entity_name')} {tc.get('score')} (below 95)" if tc and tc.get("score") else ""),
                "is_unlisted": not listed,
                "set_aside": set_aside,
                "wording": "shares an address and a trading partner with a listed firm",
                "source_files": " ; ".join(sorted({p["file"] for p in ps} | ({s["file"]} if s else set()))),
            })
    rows.sort(key=lambda r: (-r["is_unlisted"], -r["score"]))
    fields = list(rows[0].keys()) if rows else ["listed_firm"]
    with open(out_csv, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    print("Sibling leads: firms that share an address and a trading partner with a listed firm (leads for review, not findings)\n")
    print(f"{'#':>2} {'score':>5} {'tenants':>7} {'shared':>6}  {'sibling (unlisted)':40} {'registered':12} {'listed firm':32} address")
    unl = [r for r in rows if r["is_unlisted"] and not r["set_aside"]]
    for i, r in enumerate(unl, 1):
        print(f"{i:>2} {r['score']:>5} {r['tenants_at_address']:>7} {r['shared_partners']:>6}  {(r['sibling_latin_name'] or r['sibling'])[:40]:40} "
              f"{r['registration_date'][:12]:12} {r['listed_firm'][:32]:32} {r['sibling_address'][:70]}")
        print(f"{'':25}partners: {r['shared_partner_names'][:110]}")
        print(f"{'':25}sources: {r['source_files'][:110]}")
    aside = [r for r in rows if r["is_unlisted"] and r["set_aside"]]
    if aside:
        print(f"\nSet aside ({len(aside)}):")
        for r in aside:
            print(f"   {r['sibling'][:50]:50} {r['set_aside']} ({r['sibling_address'][:60]})")
    flagged = [r for r in rows if not r["is_unlisted"]]
    if flagged:
        print(f"\nAlready listed, so not leads; each shows the two signals re-finding a listed firm ({len(flagged)}):")
        for r in flagged:
            print(f"   {r['sibling'][:36]:36} with {r['listed_firm'][:24]:24} tenants {r['tenants_at_address']:>4}  "
                  f"{r['shared_partner_names'][:36]}  [{r['unlisted_check'][:60]}]")
    print("\nCoverage per listed firm (partner lists that contain it / tenants at its address):")
    for L in LISTED:
        mine = [p for p in plists if p["ids"] & set(L["sayari_ids"])]
        s = asearch.get(L["address_search"])
        print(f"   {L['name'][:48]:48} partner lists: {len(mine):>2}  tenants: {s['total'] if s else 'n/a'}")
    print(f"\nwritten: {out_csv}")
    return rows


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    run()
