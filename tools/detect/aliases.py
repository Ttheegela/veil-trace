"""Alias and ID cross-check (TRC-24): find Sayari records that share an EXACT normalised
alias or an identifier with a party on the OFAC / EU / UK / Ukraine lists, but are not
flagged 'sanctioned' by Sayari ("screen gaps").

Every row is a LEAD: the record shares an exact alias or ID with a listed party. It is not
proof they are the same company (same name, different company; sponsor data lag; list lag).

Companies only: list rows with schema Person / UK 'Individual' are skipped, Sayari records
of type person are skipped.

Run (offline, saved pulls only):
    python aliases.py
Run with live Sayari look-ups (search_entities with exact aliases, get_entity_summary):
    python aliases.py --live 20
Test:
    python test_aliases.py
"""
from __future__ import annotations

import argparse
import csv
import glob
import json
import os
import re
import subprocess
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

# Paths: set CLIMATE_DAY_ROOT (the folder holding data/ and pulls/) and UK_SANCTIONS_CSV locally.
# The default assumes this file sits in tools/detect/ below that root. Sponsor pulls are never in the public repo.
ROOT = Path(os.environ.get("CLIMATE_DAY_ROOT", Path(__file__).resolve().parents[2]))
OS_DIR = ROOT / "data" / "opensanctions"
UK_CSV = Path(os.environ.get("UK_SANCTIONS_CSV", ROOT / "data" / "uk_sanctions_list" / "UK-Sanctions-List.csv"))
PULLS = ROOT / "pulls" / "sayari"
HERE = Path(__file__).resolve().parent
PY = ROOT / ".venv" / "Scripts" / "python.exe"
SAYARI_CLI = ROOT / "smoke" / "sayari_mcp.py"
LEDGER = HERE / "live_calls.jsonl"

csv.field_size_limit(10**9)

# ---------------------------------------------------------------- normalisation
CYR = dict(zip("абвгдеёжзийклмнопрстуфхцчшщъыьэюяіїєґў",
               ["a", "b", "v", "g", "d", "e", "e", "zh", "z", "i", "y", "k", "l", "m", "n", "o", "p", "r", "s", "t",
                "u", "f", "kh", "ts", "ch", "sh", "shch", "", "y", "", "e", "yu", "ya", "i", "yi", "ye", "g", "u"]))

# legal-form words (after transliteration + lower-casing); multi-word forms first
LEGAL_PHRASES = [
    r"obshchestvo s ogranichenn\w* otvetstvenn\w*", r"tovarishchestvo s ogranichenn\w* otvetstvenn\w*",
    r"tovarystvo z obmezhenoyu vidpovidalnistyu", r"(?:publichnoe |zakrytoe |otkrytoe |nepublichnoe )?aktsionernoe obshchestvo",
    r"limited liability (?:company|partnership)", r"(?:closed |open |public |private )?joint[ -]stock company",
    r"limited company", r"free zone (?:establishment|company)", r"sanayi ve ticaret", r"ticaret limited",
    r"company limited", r"co ltd", r"limited sirketi", r"anonim sirketi", r"dis ticaret",
]
LEGAL_WORDS = set("""llc ltd limited ooo oao zao pao ao jsc ojsc cjsc pjsc osoo too tov co company corp corporation inc
incorporated gmbh sirketi sti as fze fzco fz dmcc pte plc sa srl bv kft sro spa ag nv llp lp oy ab pvt private
the ik kk mchj xk sirket tic san ve ltdsti uab sia ood eood doo""".split())


def translit(s: str) -> str:
    return "".join(CYR.get(ch, ch) for ch in s)


def norm_name(s: str) -> str:
    """Lower-case, strip accents, light Cyrillic->Latin, & -> and, drop punctuation and legal forms."""
    if not s:
        return ""
    s = unicodedata.normalize("NFKC", s).lower()
    s = translit(s)
    s = "".join(c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c))
    s = s.replace("&", " and ").replace(".", "")
    s = re.sub(r"[^\w]+", " ", s).replace("_", " ")
    s = f" {s} "
    for p in LEGAL_PHRASES:
        s = re.sub(rf" {p} ", " ", s)
    toks = [t for t in s.split() if t not in LEGAL_WORDS]
    return " ".join(toks)


def compact(key: str) -> str:
    """Spacing-insensitive form: 'rm design and development' == 'rm designanddevelopment'."""
    return key.replace(" ", "")


def norm_id(v: str) -> str | None:
    """Identifier key: digits only for numeric IDs (INN/OGRN/tax/registration/IMO, prefix letters dropped);
    upper-case alphanumerics for mixed IDs (LEI, Singapore UEN). None if too short to be distinctive."""
    v = re.sub(r"[^0-9A-Za-z]", "", unicodedata.normalize("NFKC", v or "")).upper()
    m = re.fullmatch(r"[A-Z]{0,5}(\d+)", v)
    if m:
        d = m.group(1)
        return d if d and len(d) >= 7 and len(set(d)) > 2 else None
    return v if len(v) >= 8 and sum(c.isdigit() for c in v) >= 4 else None


# ---------------------------------------------------------------- list index
class Index:
    def __init__(self):
        self.entities = {}                       # list_uid -> dict(list, id, name, programme, schema)
        self.names = defaultdict(set)            # compact key -> {(uid, original string, is_primary)}
        self.ids = defaultdict(set)              # id key -> {(uid, original string)}

    def add_entity(self, uid, lst, eid, name, programme, schema):
        self.entities[uid] = dict(list=lst, list_id=eid, list_name=name, programme=programme, schema=schema)

    def add_name(self, uid, s, primary):
        k = norm_name(s)
        if len(compact(k)) >= 3:
            self.names[compact(k)].add((uid, s.strip(), primary))

    def add_id(self, uid, s):
        k = norm_id(s)
        if k:
            self.ids[k].add((uid, s.strip()))

    def finish(self):
        # drop identifiers shared by several listed entities (e.g. Russian KPP codes are not unique)
        for k in [k for k, v in self.ids.items() if len({u for u, _ in v}) > 1]:
            del self.ids[k]
        # drop 9-digit Russian KPP-looking values: same 4-digit prefix as a 10-digit INN of the same entity
        by_uid = defaultdict(set)
        for k, v in self.ids.items():
            for u, _ in v:
                by_uid[u].add(k)
        for u, ks in by_uid.items():
            inn4 = {k[:4] for k in ks if len(k) == 10}
            for k in ks:
                if len(k) == 9 and k[:4] in inn4 and k[4:6] in ("01", "43", "45", "50"):
                    self.ids.pop(k, None)


def load_opensanctions(ix: Index):
    for fname, label in [("us_ofac_sdn.csv", "US OFAC SDN"), ("eu_fsf.csv", "EU FSF"), ("ua_war_sanctions.csv", "UA War&Sanctions")]:
        with open(OS_DIR / fname, encoding="utf-8") as f:
            for row in csv.DictReader(f):
                if row["schema"] == "Person":
                    continue
                uid = f"{label}|{row['id']}"
                prog = (row["sanctions"] or "").strip('"') or row.get("program_ids") or ""
                ix.add_entity(uid, label, row["id"], row["name"], prog[:200], row["schema"])
                ix.add_name(uid, row["name"], True)
                for a in (row["aliases"] or "").split(";"):
                    ix.add_name(uid, a, False)
                for i in (row["identifiers"] or "").split(";"):
                    ix.add_id(uid, i)


def load_uk(ix: Index):
    with open(UK_CSV, encoding="utf-8-sig") as f:
        r = csv.reader(f)
        next(r)
        h = next(r)
        for row in r:
            d = dict(zip(h, row))
            if d.get("Designation Type") not in ("Entity", "Ship"):
                continue
            uid = f"UK|{d['Unique ID']}"
            primary = (d.get("Name type") or "").lower().startswith("primary name") and "variation" not in d["Name type"].lower()
            full = d.get("Name 6") or " ".join(d.get(f"Name {i}", "") for i in range(1, 6))
            if uid not in ix.entities or primary:
                ix.add_entity(uid, "UK", d["Unique ID"], full, d.get("Regime Name", ""), d["Designation Type"])
            ix.add_name(uid, full, primary)
            if d.get("Name non-latin script"):
                ix.add_name(uid, d["Name non-latin script"], False)
            for col in ("Business registration number (s)", "IMO number"):
                for tok in re.findall(r"[0-9A-Za-z][0-9A-Za-z\-/ ]{5,}[0-9A-Za-z]", d.get(col, "")):
                    for part in re.split(r"[/ ]", tok):
                        ix.add_id(uid, part)


def build_index() -> Index:
    ix = Index()
    load_opensanctions(ix)
    load_uk(ix)
    ix.finish()
    return ix


# ---------------------------------------------------------------- Sayari records
def load_pull(path):
    try:
        d = json.load(open(path, encoding="utf-8"))
    except Exception:
        return None, None
    if not isinstance(d, dict) or d.get("is_error"):
        return None, None
    s = d.get("structured")
    r = s.get("result") if isinstance(s, dict) else None
    if isinstance(r, str):
        try:
            r = json.loads(r)
        except Exception:
            return d, None
    return d, r


class Rec:
    __slots__ = ("eid", "names", "ids", "flags", "psa", "countries", "files", "types", "label")

    def __init__(self, eid):
        self.eid, self.names, self.ids, self.flags = eid, set(), {}, set()
        self.psa, self.countries, self.files, self.types, self.label = False, set(), set(), set(), ""


def scan_pulls(pattern=str(PULLS / "*.json")):
    recs: dict[str, Rec] = {}

    def visit(o, fname):
        if isinstance(o, dict):
            eid = o.get("entity_id")
            nm = o.get("label") or o.get("name")
            if isinstance(eid, str) and (nm or o.get("attributes")):
                rec = recs.setdefault(eid, Rec(eid))
                rec.files.add(fname)
                if nm:
                    rec.names.add(nm)
                    rec.label = rec.label or nm
                if o.get("type"):
                    rec.types.add(o["type"])
                attrs = o.get("attributes") or {}
                for n in attrs.get("names") or []:
                    rec.names.add(n)
                for c in (o.get("countries") or []) + (attrs.get("countries") or []):
                    rec.countries.add(c)
                for idl in (o.get("identifiers") or []) + (attrs.get("identifiers") or []):
                    if isinstance(idl, dict) and idl.get("value"):
                        rec.ids[str(idl["value"])] = idl.get("type", "")
                    elif isinstance(idl, str):
                        rec.ids[idl] = ""
                risk = o.get("risk_flags") or o.get("risk") or {}
                if isinstance(risk, dict) and "sanctioned" in risk:
                    rec.flags.add(bool(risk["sanctioned"]))
                    if any(x.startswith("psa_sanctioned") for x in risk.get("risk_levels") or []):
                        rec.psa = True
            for v in o.values():
                visit(v, fname)
        elif isinstance(o, list):
            for v in o:
                visit(v, fname)

    for f in sorted(glob.glob(pattern)):
        d, r = load_pull(f)
        if r is not None:
            visit(r, os.path.basename(f))
    return recs


# ---------------------------------------------------------------- matching
def match(recs, ix: Index):
    rows = []
    for rec in recs.values():
        if "person" in rec.types:
            continue
        hits = {}
        for n in rec.names:
            k = compact(norm_name(n))
            for uid, orig, primary in ix.names.get(k, ()):
                hits.setdefault((uid, "exact name" if primary else "exact alias"), (n, orig, norm_name(n), ""))
        for v, typ in rec.ids.items():
            if any(w in (typ or "").lower() for w in ("kpp", "okved", "okopf", "okfs", "phone", "postal")):
                continue  # non-unique codes (e.g. Russian KPP is shared by many firms)
            k = norm_id(v)
            for uid, orig in ix.ids.get(k, ()) if k else ():
                hits.setdefault((uid, "identifier"), (v, orig, k, typ))
        if True in rec.flags:
            continue  # Sayari already flags this record sanctioned: not a gap
        merged = {}
        for (uid, mtype), (sname, lstr, key, idtype) in hits.items():
            mt = "identifier" if mtype == "identifier" else "exact alias"
            m = merged.setdefault(uid, dict(types=set(), sname=sname, lstr=lstr, key=key, idtype=idtype))
            m["types"].add(mt)
            if mt == "identifier":  # identifier evidence wins the display columns
                m.update(sname=sname, lstr=lstr, key=key, idtype=idtype)
        for uid, m in merged.items():
            e = ix.entities[uid]
            mtype = " + ".join(sorted(m["types"], key=lambda t: t != "identifier"))
            weak = mtype == "exact alias" and (len(m["key"].split()) < 2 or len(compact(m["key"])) < 6)
            rows.append(dict(
                sayari_entity_id=rec.eid, sayari_name=rec.label, sayari_matched_string=m["sname"],
                sayari_sanctioned=("false" if rec.flags == {False} else "unknown"),
                sayari_psa_sanctioned=str(rec.psa).lower(), sayari_countries=";".join(sorted(rec.countries)),
                sayari_id_type=m["idtype"], match_type=mtype, match_key=m["key"], list=e["list"],
                list_entity_id=e["list_id"], list_entity_name=e["list_name"], list_matched_string=m["lstr"],
                programme=e["programme"], list_schema=e["schema"], weak_key=str(weak).lower(),
                source_files=";".join(sorted(rec.files)),
                lead="shares an exact alias/ID with a listed party; not proof of identity (same name, different company; data lag)",
            ))
    rank = {"US OFAC SDN": 0, "EU FSF": 1, "UK": 2, "UA War&Sanctions": 3}
    rows.sort(key=lambda r: (r["sayari_sanctioned"] != "false", r["weak_key"] == "true", "identifier" not in r["match_type"],
                             rank.get(r["list"], 9), r["sayari_name"]))
    return rows


# ---------------------------------------------------------------- live look-ups
LEAD_NAMES = ["ELEM GROUP", "STRELOI", "STRELOY", "RM Design and Development", "ITIC", "Enkor", "Titan-Micro", "Sinno Electronics",
              "Testkomplekt", "Flavic", "SUN Ship Management", "Sovcomflot",
              "Naftna Industrija Srbije", "Belarusian Potash", "Belaruskali"]
# Public repo: seed names are listed parties only; add unlisted leads locally if an agency review needs them.


def saved_calls():
    done = {}
    for f in glob.glob(str(PULLS / "*.json")):
        try:
            d = json.load(open(f, encoding="utf-8"))
        except Exception:
            continue
        if isinstance(d, dict) and d.get("tool") in ("search_entities", "get_entity_summary"):
            a = d.get("args") or {}
            done[(d["tool"], (a.get("query") or a.get("entity_id") or "").strip().lower())] = os.path.basename(f)
    return done


def call(tool, args):
    env = dict(os.environ, PYTHONUTF8="1")
    try:
        p = subprocess.run([str(PY), str(SAYARI_CLI), "call", tool, json.dumps(args, ensure_ascii=False)],
                           capture_output=True, text=True, encoding="utf-8", timeout=90, env=env)
    except subprocess.TimeoutExpired:
        return None
    m = re.search(r"saved (\S+\.json)", p.stdout or "")
    with open(LEDGER, "a", encoding="utf-8") as f:
        f.write(json.dumps({"tool": tool, "args": args, "file": m.group(1) if m else None,
                            "err": None if m else (p.stderr or "")[-300:]}, ensure_ascii=False) + "\n")
    return m.group(1) if m else None


def pick_seeds(ix: Index, recs):
    """Listed parties to search live: lead companies from the day's log + listed counterparties in saved shipments."""
    seeds = []
    for lead in LEAD_NAMES:
        k = norm_name(lead)
        for key, vals in ix.names.items():
            if key.startswith(compact(k)) and len(key) <= len(compact(k)) + 25:
                seeds.extend(u for u, _, _ in vals)
    ship = set()
    for f in glob.glob(str(PULLS / "*search_shipments.json")):
        d, r = load_pull(f)
        for it in (r or {}).get("items", []) if isinstance(r, dict) else []:
            for side in ("supplier", "buyer"):
                p = it.get(side) or {}
                if p.get("name"):
                    ship.add(p["name"])
    for n in ship:
        seeds.extend(u for u, _, _ in ix.names.get(compact(norm_name(n)), ()))
    out = []
    for s in seeds:
        if s not in out and ix.entities[s]["schema"] not in ("Vessel", "Ship"):
            out.append(s)
    return out


def live(ix: Index, budget: int):
    recs = scan_pulls()
    done = saved_calls()
    seeds = pick_seeds(ix, recs)
    names_by_uid = defaultdict(list)
    for key, vals in ix.names.items():
        for u, orig, primary in vals:
            names_by_uid[u].append((primary, orig))
    # group seeds that are the same listed party on several lists (OpenSanctions ids are shared)
    groups = {}
    for u in seeds:
        groups.setdefault(u.split("|", 1)[1] if not u.startswith("UK|") else u, []).append(u)
    queue, seen_keys = [], set()
    for rnd in range(3):  # round-robin: one alias per listed party, then a second one...
        for us in groups.values():
            prim = {compact(norm_name(o)) for u in us for p, o in names_by_uid[u] if p}
            lrank = {"US OFAC SDN": 0, "UK": 1, "UA War&Sanctions": 2, "EU FSF": 3}
            cand = {}
            for u in us:
                for p, o in names_by_uid[u]:
                    if not p:
                        script = 0 if o.isascii() else 1 if re.search("[Ѐ-ӿ]", o) else 2
                        cand[o] = min(cand.get(o, (9, 9)), (script, lrank.get(ix.entities[u]["list"], 9)))
            alts = sorted(cand, key=lambda o: (cand[o], o))
            fresh = [a for a in alts if compact(norm_name(a)) not in seen_keys | prim]
            if fresh:
                seen_keys.add(compact(norm_name(fresh[0])))
                queue.append(fresh[0])
    used = 0
    for q in queue:
        if used >= budget * 3 // 4:
            break
        if ("search_entities", q.strip().lower()) in done:
            continue
        print(f"  live search_entities: {q}")
        if call("search_entities", {"query": q, "limit": 10, "response_mode": "compact"}) is None:
            print("  live call failed; stopping live look-ups")
            return used + 1
        used += 1
    # resolve 'unknown' flags / fetch all names+IDs for candidate hits
    recs = scan_pulls()
    rows = match(recs, ix)
    for r in rows:
        if used >= budget:
            break
        if r["sayari_sanctioned"] == "unknown" and ("get_entity_summary", r["sayari_entity_id"].lower()) not in done:
            print(f"  live get_entity_summary: {r['sayari_entity_id']}")
            done[("get_entity_summary", r["sayari_entity_id"].lower())] = "x"
            if call("get_entity_summary", {"entity_id": r["sayari_entity_id"]}) is None:
                break
            used += 1
    return used


# ---------------------------------------------------------------- main
COLS = ["sayari_entity_id", "sayari_name", "sayari_matched_string", "sayari_sanctioned", "sayari_psa_sanctioned",
        "sayari_countries", "sayari_id_type", "match_type", "match_key", "list", "list_entity_id", "list_entity_name",
        "list_matched_string", "programme", "list_schema", "weak_key", "source_files", "lead"]


def run(live_budget=0, out=HERE / "screen_gaps.csv", quiet=False):
    ix = build_index()
    if not quiet:
        print(f"index: {len(ix.entities)} listed non-person parties, {len(ix.names)} name keys, {len(ix.ids)} ID keys")
    if live_budget:
        print(f"live look-ups used: {live(ix, live_budget)}")
    recs = scan_pulls()
    rows = match(recs, ix)
    with open(out, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=COLS)
        w.writeheader()
        w.writerows(rows)
    if not quiet:
        gaps = [r for r in rows if r["sayari_sanctioned"] == "false"]
        print(f"Sayari records scanned: {len(recs)}; screen-gap leads (flag false): {len(gaps)} rows / "
              f"{len({r['sayari_entity_id'] for r in gaps})} records; flag unknown: {len(rows) - len(gaps)} rows -> {out.name}")
        print("LEADS, not findings: each row shares an exact alias/ID with a listed party. Innocent explanations: "
              "same name, different company; sponsor or list data lag.")
        fmt = "{:<24} {:<34} {:<7} {:<17} {:<24} {:<34} {:<5}"
        print(fmt.format("sayari_id", "sayari_name", "flag", "list", "match", "list_entity", "weak_key"))
        for r in rows[:60]:
            print(fmt.format(r["sayari_entity_id"][:24], " ".join(r["sayari_name"].split())[:34], r["sayari_sanctioned"], r["list"][:17],
                             r["match_type"], r["list_entity_name"][:34], r["weak_key"]))
        if len(rows) > 60:
            print(f"... {len(rows) - 60} more rows in {out.name}")
    return rows


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--live", type=int, default=0, help="max live Sayari calls (0 = saved pulls only)")
    a = ap.parse_args()
    run(a.live)
