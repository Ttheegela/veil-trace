"""Lobbying layer for the knowledge graph.

Reads the raw US Senate lobbying-disclosure (LDA) API answers our agents saved under
agents/lobbying*, agents/proxylobby (read-only), keeps only filings whose client is one of the
companies in our story (CLIENTS below), and writes build/kg/data/lobby.json:

  nodes: lobby firms, clients, their foreign parents (from the filing's foreign_entities),
         lobbyists (named by the filing), government bodies lobbied, bills/orders named,
         former government posts (the filing's covered_position = the revolving door)
  edges: hired, lobbyist_at, lobbied, lobbied_on, foreign_entity_of, formerly_served_in

Every edge carries the filing UUID and its public URL on lda.senate.gov.
"""
from __future__ import annotations

import glob
import json
import os
import re
from collections import defaultdict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(os.path.dirname(__file__), "data", "lobby.json")

# client-name pattern -> (canonical node id, display name, story group)
CLIENTS = [
    (r"\bSBERBANK\b", "co:sberbank-cib-usa", "Sberbank CIB USA", "russia"),
    (r"^VTB BANK", "co:vtb-bank", "VTB Bank", "russia"),
    (r"GAZPROMBANK", "co:gazprombank", "Gazprombank", "russia"),
    (r"GAZPROMEXPORT", "co:gazpromexport", "Gazpromexport", "russia"),
    (r"NORD STREAM 2", "co:nord-stream-2", "Nord Stream 2 AG", "russia"),
    (r"NEW EUROPEAN PIPELINE", "co:nord-stream-2", "Nord Stream 2 AG", "russia"),
    (r"NORILSK", "co:norilsk-nickel", "Norilsk Nickel", "russia"),
    (r"^NORIMET", "co:norilsk-nickel", "Norilsk Nickel", "russia"),
    (r"UNION OF OIL AND GAS PRODUCERS", "co:union-oil-gas-producers-russia", "Union of Oil and Gas Producers of Russia", "russia"),
    (r"ARCTIC LNG", "co:arctic-lng-2", "Arctic LNG 2", "russia"),
    (r"YAMAL LNG", "co:yamal-lng", "Yamal LNG", "russia"),
    (r"^(OAO |PAO )?NOVATEK", "co:novatek", "Novatek", "russia"),
    (r"^OLEG DERIPASKA", "p:oleg-deripaska", "Oleg Deripaska", "russia"),
    (r"^EN\+ GROUP", "co:en-plus-group", "En+ Group", "russia"),
    (r"HIKVISION", "co:hikvision-usa", "Hikvision USA", "china"),
    (r"HUAWEI|FUTUREWEI", "co:huawei", "Huawei", "china"),
    (r"\bZTE (USA|CORP)", "co:zte", "ZTE", "china"),
    (r"HYTERA", "co:hytera", "Hytera Communications", "china"),
    (r"SEMICONDUCTOR MANUFACTURING INTERNATIONAL", "co:smic", "SMIC (Semiconductor Manufacturing International)", "china"),
    (r"^DJI TECHNOLOGY", "co:dji", "DJI Technology", "china"),
    (r"NINESTAR CORP", "co:ninestar", "Ninestar", "china"),
    (r"^SEMICONDUCTORS? INDUSTRY ASSOCIATION", "org:sia", "Semiconductor Industry Association", "chips"),
    (r"US-CHINA BUSINESS COUNCIL", "org:uscbc", "US-China Business Council", "chips"),
    (r"^NVIDIA", "co:nvidia", "NVIDIA", "chips"),
]
CLIENT_RE = [(re.compile(p), cid, name, grp) for p, cid, name, grp in CLIENTS]
ASSOC = {"org:sia", "org:uscbc", "org:union-oil-gas-producers-russia"}

SUBCONTRACT = re.compile(r"ON BEHALF OF|\bTHROUGH\b|\(FOR ", re.I)
BILL_RE = re.compile(r"\b(S\.\s?\d{2,5}|H\.\s?R\.\s?\d{2,5}|E\.?O\.?\s?\d{5}|Executive Order\s?\d{5})", re.I)

# covered_position text -> former-post node
POSTS = [
    (r"treasury", "gov:us-treasury", "US Treasury"),
    (r"commerce|\bdoc\b", "gov:us-commerce", "US Commerce Department"),
    (r"state dep|dept\. of state|department of state|secretary of state|ambassador|\bstate\b.*secy|secy.*\bstate\b", "gov:us-state", "US State Department"),
    (r"white house|\bwh\b|to (the )?pres|ast to pres|potus|national economic council|natl econ|\bnsc\b|national security council|\beop\b|ustr|trade representative", "gov:white-house", "White House"),
    (r"senat|\bsen\b|\bsen\.|\bs\.? maj|senate", "gov:us-senate", "US Senate"),
    (r"house|congress|representative|\brep\b|\brep\.|speaker|\bspkr\b", "gov:us-house", "US House of Representatives"),
    (r"defense|pentagon|army|navy|air force", "gov:us-defense", "US Defense Department"),
    (r"justice|doj|attorney", "gov:us-justice", "US Justice Department"),
]
POST_RE = [(re.compile(p, re.I), gid, name) for p, gid, name in POSTS]
ROLE_WORDS = re.compile(r"chief|director|counsel|assist|asst|staff|member|senator|secretary|secy|advis|aide|"
                        r"correspondent|ambassador|representative|congress|legislative|\bla\b|\bld\b|\bcos\b", re.I)

# Foreign-entity names on filings -> one canonical node (the filings spell parents many ways
# and add notes such as "(50% of NS2 operating budget)", which we keep as the edge note).
FE_ALIASES = [
    (r"gazprombank", "co:gazprombank", "company", "Gazprombank"),
    (r"gazprom(?!bank|export)", "co:gazprom", "company", "Gazprom"),
    (r"russian federation", "gov:russia", "government", "Government of Russia"),
    (r"novate[kc]h?", "co:novatek", "company", "Novatek"),
    (r"deripaska", "p:oleg-deripaska", "person", "Oleg Deripaska"),
    (r"^wang tao", "p:wang-tao", "person", "Wang Tao"),
    (r"^qingzhou chen", "p:qingzhou-chen", "person", "Qingzhou Chen"),
    (r"^dji\b", "co:dji-group", "company", "DJI group companies"),
    (r"iflight", "co:iflight-technology", "company", "iFlight Technology"),
    (r"royal dutch shell", "co:shell", "company", "Shell"),
    (r"^engie", "co:engie", "company", "Engie"),
    (r"^omv", "co:omv", "company", "OMV"),
    (r"^uniper", "co:uniper", "company", "Uniper"),
    (r"^wintershall", "co:wintershall", "company", "Wintershall"),
    (r"^e\.?on", "co:e-on", "company", "E.ON"),
    (r"china electronics technology group", "co:cetc", "company", "China Electronics Technology Group (CETC)"),
    (r"^cethik", "co:cethik-group", "company", "CETHIK Group"),
    (r"zhongxingxin", "co:zhongxingxin", "company", "Zhongxingxin Telecom Equipment"),
    (r"zhongxing telecom", "co:zte", "company", "ZTE"),
    (r"independent trustees", None, None, None),
]
FE_RE = [(re.compile(p, re.I), fid, t, n) for p, fid, t, n in FE_ALIASES]

KEY_BILLS = {
    "bill:s722": "S.722 Countering Iran's Destabilizing Activities Act (2017), the vehicle for new Russia sanctions",
    "bill:hr3364": "H.R.3364 Countering America's Adversaries Through Sanctions Act (CAATSA, 2017)",
    "bill:s1705": "S.1705 Chip Security Act",
    "bill:hr3447": "H.R.3447 Chip Security Act",
    "bill:s3455": "S.3455 ZTE Enforcement Review and Oversight Act",
    "bill:eo13660": "Executive Order 13660 (2014): first US sanctions over Ukraine",
    "bill:eo13873": "Executive Order 13873 (2019): securing telecom supply chains",
    "bill:eo14017": "Executive Order 14017 (2021): America's supply chains",
}
BILL_KEEP = re.compile(r"sanction|export control|export administration|entity list|russia|china|chinese|huawei|zte|"
                       r"countering|pipeline|nord stream|caatsa|adversar|outbound|cfius|iran|hikvision|drone|unmanned|"
                       r"chip security|ofac|magnitsky|ukraine", re.I)

GOV_BODIES = [
    (r"SENATE", "gov:us-senate", "US Senate"),
    (r"HOUSE OF REP", "gov:us-house", "US House of Representatives"),
    (r"TREASURY", "gov:us-treasury", "US Treasury"),
    (r"COMMERCE", "gov:us-commerce", "US Commerce Department"),
    (r"STATE - DEPT|STATE DEPT|DEPARTMENT OF STATE", "gov:us-state", "US State Department"),
    (r"WHITE HOUSE|EXECUTIVE OFFICE|NATIONAL SECURITY COUNCIL|TRADE REPRESENTATIVE|USTR", "gov:white-house", "White House"),
    (r"DEFENSE", "gov:us-defense", "US Defense Department"),
    (r"ENERGY - DEPT", "gov:us-energy", "US Energy Department"),
]
GOV_RE = [(re.compile(p, re.I), gid, name) for p, gid, name in GOV_BODIES]


def slug(s: str) -> str:
    s = re.sub(r"[.,'\"()&]", " ", s.lower())
    s = re.sub(r"\b(llc|l l c|inc|ltd|lp|llp|pllc|corp|corporation|co|company|the)\b", " ", s)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


def person_name(lb: dict) -> str:
    parts = [lb.get("first_name") or "", lb.get("middle_name") or "", lb.get("last_name") or "", lb.get("suffix") or ""]
    return " ".join(p.strip().title() for p in parts if p and p.strip())


def money(r: dict) -> float:
    for k in ("income", "expenses"):
        v = r.get(k)
        if v not in (None, ""):
            try:
                return float(v)
            except ValueError:
                pass
    return 0.0


def load_filings() -> dict[str, dict]:
    seen: dict[str, dict] = {}
    for d in ("agents/lobbying", "agents/lobbying2", "agents/proxylobby", "pulls/lda"):
        for f in sorted(glob.glob(os.path.join(ROOT, d, "**", "*.json"), recursive=True)):
            try:
                j = json.load(open(f, encoding="utf-8"))
            except Exception:
                continue
            if isinstance(j, dict) and isinstance(j.get("response"), dict):  # pulls/lda wrapper (fetch_lda.py)
                j = j["response"]
            res = j.get("results") if isinstance(j, dict) else j
            if not isinstance(res, list):
                continue
            for r in res:
                if isinstance(r, dict) and r.get("filing_uuid") and isinstance(r.get("client"), dict):
                    seen[r["filing_uuid"]] = r
    return seen


def match_client(name: str):
    for rx, cid, disp, grp in CLIENT_RE:
        if rx.search(name.upper()):
            return cid, disp, grp
    return None


def main() -> None:
    filings = load_filings()
    nodes: dict[str, dict] = {}
    # aggregated edges keyed by (s, t, type)
    agg: dict[tuple, dict] = {}

    def node(nid, typ, name, **kw):
        n = nodes.setdefault(nid, {"id": nid, "type": typ, "name": name, "layer": "lobby"})
        for k, v in kw.items():
            if v not in (None, "", [], {}):
                n.setdefault(k, v)
        return n

    def edge(s, t, typ, r, **kw):
        e = agg.setdefault((s, t, typ), {"source": s, "target": t, "type": typ, "filings": [], "years": set(),
                                         "amount": 0.0, "texts": set(), "confidence": "Documented"})
        uuid = r["filing_uuid"]
        if uuid not in e["filings"]:
            e["filings"].append(uuid)
            if typ == "hired":
                # Count each firm-client-quarter once (latest amendment), and never count subcontracted money
                # toward the client: the prime firm's income already includes it.
                if SUBCONTRACT.search(r["client"].get("name") or ""):
                    e["sub_amount"] = e.get("sub_amount", 0.0) + (money(r) if uuid in canonical else 0.0)
                    e["subcontract"] = True
                elif uuid in canonical:
                    e["amount"] += money(r)
        if r.get("filing_year"):
            e["years"].add(int(r["filing_year"]))
        for k, v in kw.items():
            if k == "text" and v:
                e["texts"].add(v[:220])
        return e

    # One filing per (registrant, client, year, period): the most recently posted version (amendments and
    # termination reports repeat the same quarter's money).
    latest: dict[tuple, dict] = {}
    for r in filings.values():
        key = ((r.get("registrant") or {}).get("id"), r["client"].get("id"), r.get("filing_year"), r.get("filing_period"))
        # Prefer versions that state an amount (some amendments leave it blank), then the most recent.
        rank = (money(r) > 0, r.get("dt_posted") or "")
        if key not in latest or rank > (money(latest[key]) > 0, latest[key].get("dt_posted") or ""):
            latest[key] = r
    canonical = {r["filing_uuid"] for r in latest.values()}

    kept = 0
    for r in filings.values():
        cname = (r["client"].get("name") or "").strip()
        m = match_client(cname)
        if not m:
            continue
        # Sub-registrant filings ("X ON BEHALF OF SMIC") still count for SMIC.
        cid, cdisp, grp = m
        kept += 1
        ctype = "association" if cid in ASSOC else "person" if cid.startswith("p:") else "company"
        cn = node(cid, ctype, cdisp, group=grp)
        cn["type"], cn["name"] = ctype, cdisp  # a client may first appear as someone's foreign entity
        cn.setdefault("lda_names", [])
        if cname not in cn["lda_names"]:
            nodes[cid]["lda_names"].append(cname)
        reg = r.get("registrant") or {}
        rname = (reg.get("name") or "").strip()
        self_filed = match_client(rname) is not None and match_client(rname)[0] == cid
        if self_filed:
            fid = cid  # in-house lobbying: the company files for itself
        else:
            fid = "lf:" + slug(rname)
            node(fid, "lobbyfirm", rname.title().replace("Llc", "LLC").replace("Llp", "LLP"))
        e = edge(cid, fid, "hired" if not self_filed else "lobbied_in_house", r)
        for fe in r.get("foreign_entities") or []:
            fname = (fe.get("name") or "").strip()
            if not fname:
                continue
            note = "; ".join(re.findall(r"\(([^)]*)\)", fname))
            base = re.sub(r"\s*\([^)]*\)", "", fname).strip()
            if re.fullmatch(r"(joint stock company|llc|pjsc|oao|jsc)", base, re.I) and note:
                base, note = note, ""  # "JOINT STOCK COMPANY (NOVATEK)"
            hit = next(((fid_, t_, n_) for rx, fid_, t_, n_ in FE_RE if rx.search(base)), None)
            if hit and hit[0] is None:
                continue
            fm = match_client(base)
            if hit:
                feid, fetype, fename = hit
            elif fm:
                feid, fetype, fename = fm[0], "company", fm[1]
            else:
                feid, fetype, fename = "co:" + slug(base), "company", base.title()
            if feid == cid:
                continue
            node(feid, fetype, fename, country=fe.get("country") or "", group=grp,
                 role="named as a foreign entity on a US lobbying filing")
            fe_e = edge(feid, cid, "foreign_entity_of", r, text=note)
            pct = fe.get("ownership_percentage")
            if pct:
                fe_e["ownership_pct"] = pct
        for act in r.get("lobbying_activities") or []:
            desc = (act.get("description") or "").strip()
            for b in set(BILL_RE.findall(desc)):
                bid = "bill:" + re.sub(r"[^a-z0-9]", "", b.lower().replace("executive order", "eo"))
                if bid not in KEY_BILLS and not BILL_KEEP.search(desc):
                    continue
                label = re.sub(r"^(ExecutiveOrder|E\.?O\.?)", "EO ", re.sub(r"\s+", "", b))
                node(bid, "bill", label, title=KEY_BILLS.get(bid, ""))
                edge(fid, bid, "lobbied_on", r, text=desc)
            for ge in act.get("government_entities") or []:
                gname = ge.get("name") if isinstance(ge, dict) else str(ge)
                for rx, gid, gdisp in GOV_RE:
                    if gname and rx.search(gname):
                        node(gid, "government", gdisp)
                        edge(fid, gid, "lobbied", r, text=desc)
                        break
            if desc:
                e["texts"].add(desc[:220])
            for lb in act.get("lobbyists") or []:
                p = lb.get("lobbyist") if isinstance(lb, dict) else None
                if not p:
                    continue
                pn = person_name(p)
                if not pn:
                    continue
                pid = "p:" + slug(pn)
                cov = (lb.get("covered_position") or "").strip()
                pnode = node(pid, "person", pn, role="lobbyist (named in US lobbying disclosure)")
                # Skip in-house staff titles ("PRESIDENT") and intern-only entries: no government role.
                if cov and not ROLE_WORDS.search(cov) and not re.search(r"white house|treasury|commerce|potus|nsc|ustr", cov, re.I):
                    cov = ""
                if cov and re.search(r"\bintern", cov, re.I) and not re.search(r"chief|director|counsel|assist|asst|staff|secretary|advis|aide|correspondent|member", cov, re.I):
                    cov = ""
                if cov and cov.lower() not in ("n/a", "na", "none"):
                    pnode.setdefault("covered_positions", [])
                    if cov not in pnode["covered_positions"]:
                        pnode["covered_positions"].append(cov)
                    for rx, gid, gdisp in POST_RE:
                        if rx.search(cov):
                            node(gid, "government", gdisp)
                            edge(pid, gid, "formerly_served_in", r, text=cov)
                            break
                edge(pid, fid, "lobbyist_at", r)
                edge(pid, cid, "lobbied_for", r)

    # Keep a bill only if it is one of the key bills or at least 3 filings name it (the rest is long-tail noise).
    bill_filings = defaultdict(set)
    for (s, t, typ), e in agg.items():
        if typ == "lobbied_on":
            bill_filings[t].update(e["filings"])
    drop = {b for b in (n["id"] for n in nodes.values() if n["type"] == "bill")
            if b not in KEY_BILLS and len(bill_filings[b]) < 3}
    for b in drop:
        nodes.pop(b, None)
    agg = {k: v for k, v in agg.items() if k[1] not in drop}

    edges = []
    for e in agg.values():
        yrs = sorted(e.pop("years"))
        e["years"] = [yrs[0], yrs[-1]] if yrs else []
        e["texts"] = sorted(e["texts"])[:4]
        e["n_filings"] = len(e["filings"])
        e["source_url"] = "https://lda.senate.gov/filings/public/filing/%s/print/" % e["filings"][0]
        e["dataset"] = "US Senate lobbying disclosures (LDA)"
        if not e["amount"]:
            e.pop("amount")
        edges.append(e)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump({"nodes": list(nodes.values()), "edges": edges, "filings_kept": kept,
               "filings_scanned": len(filings)}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    from collections import Counter
    print("filings scanned", len(filings), "kept", kept)
    print("nodes", Counter(n["type"] for n in nodes.values()))
    print("edges", Counter(e["type"] for e in edges))


if __name__ == "__main__":
    main()
