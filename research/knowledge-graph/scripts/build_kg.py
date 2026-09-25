"""Merge the knowledge graph: shadow-fleet map + lobbying layer + curated bridges.

Inputs (read-only):  agents/fleetmap/out/{nodes,edges}.json   (another teammate's build; never written here)
                     build/kg/data/lobby.json                   (python build/kg/extract_lobby.py)
                     build/kg/curated.json                      (hand-checked bridges and statuses)
Outputs:             build/kg/data/kg.json and build/kg/kg_data.js (window.KG = ...) for the page.

Design: sanctions are drawn as rings on a node (not as edges), flags/registration countries go into the
details panel (not edges), so the picture shows who is connected to whom.
"""
from __future__ import annotations

import json
import os
import re
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
FLEET = os.path.join(ROOT, "agents", "fleetmap", "out")

DROP_EDGE_TYPES = {"designated_by", "flagged_in", "formerly_flagged_in", "registered_in"}
CONF = {"Documented": "D", "Reported": "R", "Lead": "L", "D": "D", "L": "L", "R": "R"}
GOV_NAMES = {"gov:us": "US", "gov:uk": "UK", "gov:eu": "EU", "gov:ca": "Canada", "gov:au": "Australia",
             "gov:ch": "Switzerland", "gov:nz": "New Zealand"}


def load(p):
    return json.load(open(p, encoding="utf-8"))


def iso(d: str) -> str:
    """Dates arrive as YYYY-MM-DD, YYYY or DD/MM/YYYY; return YYYY-MM-DD / YYYY-MM / YYYY or ''."""
    d = (d or "").strip()
    m = re.fullmatch(r"(\d{2})/(\d{2})/(\d{4})", d)
    if m:
        return "%s-%s-%s" % (m.group(3), m.group(2), m.group(1))
    return d if re.match(r"\d{4}", d) else ""


# The shadow-fleet map now carries its own lobbying layer ("lob:" ids). Where it names the same organisation as
# ours, it merges into our node; the rest joins the lobbying side with its own sources. Checked by hand 2026-09-25.
LOB_ALIAS = {
    "lob:akin_gump": "lf:akin-gump-strauss-hauer-feld", "lob:arctic_lng_2": "co:arctic-lng-2", "lob:avoq": "lf:avoq",
    "lob:capitol_counsel": "lf:capitol-counsel", "lob:cetc": "co:cetc", "lob:dci_group": "lf:dci-group",
    "lob:dji": "co:sz-dji-technology", "lob:dji_technology_inc": "co:dji", "lob:elevation_association": "lf:elevation-association",
    "lob:en_plus": "co:en-plus-group", "lob:futurewei": "co:huawei", "lob:gazprom": "co:gazprom",
    "lob:hikvision": "co:hangzhou-hikvision", "lob:hikvision_usa": "co:hikvision-usa", "lob:huawei": "co:huawei",
    "lob:huawei_technologies_usa": "co:huawei", "lob:liberty_gov_affairs": "lf:liberty-government-affairs",
    "lob:madison_group": "lf:madison-group", "lob:manatos_manatos": "lf:manatos-manatos",
    "lob:mercury_public_affairs": "lf:mercury-public-affairs", "lob:nord_stream_2": "co:nord-stream-2",
    "lob:novatek": "co:novatek", "lob:podesta_group": "lf:podesta-group", "lob:qorvis_geopols": "lf:qorvis-holding-geopols",
    "lob:roberti_global": "lf:roberti-global-fka-roberti-white", "lob:russian_federation": "gov:russia",
    "lob:russia_finance_ministry": "gov:russia", "lob:sberbank": "co:sberbank", "lob:sberbank_cib_usa": "co:sberbank-cib-usa",
    "lob:scarinci_hollenbeck": "lf:scarinci-hollenbeck", "lob:sidley_austin": "lf:sidley-austin", "lob:smic": "co:smic",
    "lob:squire_patton_boggs": "lf:squire-patton-boggs", "lob:union_oil_gas_ru": "co:union-oil-gas-producers-russia",
    "lob:uscbc": "org:uscbc", "lob:vtb_bank": "co:vtb-bank",
}
LOB_TYPE = {  # teammate nodes are all typed "company"; give the rest their real kind
    "lob:bell_pottinger": "lobbyfirm", "lob:brunswick_group": "lobbyfirm", "lob:porter_wright": "lobbyfirm",
    "lob:sass_consulting_ag": "lobbyfirm", "lob:rumyantsev_partners": "lobbyfirm",
    "lob:alliance_drone_innovation": "association", "lob:drone_mfrs_alliance": "association",
    "lob:small_uav_coalition": "association", "lob:awdc": "association",
    "lob:eu": "government", "lob:european_parliament": "government", "lob:us_congress": "government",
    "lob:bulgaria": "government",
}
HUBS = {"lob:eu", "lob:european_parliament", "lob:us_congress"}  # bodies that are lobbied: never relay a path


def main() -> None:
    fn, fe = load(os.path.join(FLEET, "nodes.json")), load(os.path.join(FLEET, "edges.json"))
    lobby = load(os.path.join(HERE, "data", "lobby.json"))
    cur = load(os.path.join(HERE, "curated.json"))

    nodes: dict[str, dict] = {}
    edges: list[dict] = []

    # ---- fleet layer -------------------------------------------------------------------------
    listed_dates = defaultdict(dict)  # node -> {gov: date}
    for e in fe:
        if e["type"] == "designated_by" and e["target"] in GOV_NAMES:
            listed_dates[e["source"]].setdefault(GOV_NAMES[e["target"]], iso(e.get("date", "")))
    for n in fn:
        if n["type"] in ("country", "government"):
            continue
        if n["id"] in LOB_ALIAS:
            continue
        lb = n.get("listed_by") or []
        info = {k: n[k] for k in ("imo", "aliases", "role", "ship_type", "year_built", "flag_now", "flags_before",
                                  "country", "named_by", "programs", "first_listed") if n.get(k)}
        notes = [r["text"] for r in n.get("research_notes") or []]
        name = n["name"]
        if n.get("name_policy") == "generic":
            # Team rule (shadow-fleet map): unlisted firms known only from non-official sources are not named.
            name = n.get("generic_name") or "unlisted company"
            info.pop("aliases", None)
            notes = []
        nodes[n["id"]] = {
            "id": n["id"], "t": n["type"], "n": name, "L": "fleet",
            "g": n.get("program_group") or "other",
            "s": "blocked" if n.get("listed") or lb else "",
            "lists": [[k.upper() if len(k) == 2 else k, "", v] for k, v in (listed_dates.get(n["id"]) or {}).items()]
                     or [[x.upper(), "", ""] for x in lb],
            "info": info, "notes": notes[:3],
            "unverified_person": n["type"] == "person" and not (n.get("named_by") or n.get("listed")),
        }
        if n["id"].startswith("lob:"):
            nodes[n["id"]].update({"L": "lobby", "t": LOB_TYPE.get(n["id"], n["type"]), "g": "",
                                   "hub": n["id"] in HUBS, "src": "team lobbying research"})
    deferred = []
    for e in fe:
        s_id, t_id = LOB_ALIAS.get(e["source"], e["source"]), LOB_ALIAS.get(e["target"], e["target"])
        if s_id.startswith(("lob:", "gov:", "co:", "lf:", "org:")) and (e["source"].startswith("lob:") or e["target"].startswith("lob:")):
            deferred.append((s_id, t_id, e))
            continue
        if e["type"] in DROP_EDGE_TYPES or e["source"] not in nodes or e["target"] not in nodes:
            continue
        edges.append({"s": e["source"], "t": e["target"], "y": e["type"], "c": CONF.get(e.get("confidence"), "D"),
                      "d": iso(e.get("date", "")), "u": e.get("source_url", ""), "f": e.get("source_file", ""),
                      "r": e.get("record", ""), "q": (e.get("quote") or "")[:240], "L": "fleet"})

    # ---- lobbying layer ----------------------------------------------------------------------
    for n in lobby["nodes"] + cur["nodes"]:
        nid = n["id"]
        if nid in nodes:  # the same company already on the fleet side: it bridges the two sides
            nodes[nid]["br"] = True
            continue
        info = {k: n[k] for k in ("role", "country", "title", "covered_positions", "lda_names") if n.get(k)}
        nodes[nid] = {"id": nid, "t": n["type"], "n": n["name"], "L": n.get("layer", "lobby"), "g": n.get("group", ""),
                      "s": "", "lists": [], "info": info, "notes": []}
    for e in lobby["edges"]:
        yrs = e.get("years") or []
        edges.append({"s": e["source"], "t": e["target"], "y": e["type"], "c": "D",
                      "d": "%s" % yrs[0] if yrs else "", "d2": "%s" % yrs[-1] if yrs else "",
                      "u": e["source_url"], "r": "%d filing%s" % (e["n_filings"], "" if e["n_filings"] == 1 else "s"),
                      "ids": e["filings"][:6], "a": e.get("amount", 0), "q": " | ".join(e.get("texts", []))[:300],
                      "pct": e.get("ownership_pct", ""), "sa": e.get("sub_amount", 0), "sub": e.get("subcontract", False),
                      "L": "lobby"})
    for e in cur["edges"]:
        for k in ("source", "target"):
            if e[k] not in nodes:
                raise SystemExit("curated edge points at unknown node %s" % e[k])
        edges.append({"s": e["source"], "t": e["target"], "y": e["type"], "c": CONF[e["confidence"]],
                      "d": iso(e.get("date", "")), "u": e.get("source_url", ""), "f": e.get("source_file", ""),
                      "r": e.get("record", ""), "q": e.get("quote", ""), "a": e.get("amount", 0),
                      "an": e.get("amount_note", ""), "L": "curated"})
    # Teammate lobbying links: add only where no link of ours already joins the same pair.
    have = {frozenset((e["s"], e["t"])) for e in edges}
    added = 0
    for s_id, t_id, e in deferred:
        if s_id == t_id or s_id not in nodes or t_id not in nodes or frozenset((s_id, t_id)) in have:
            continue
        y = e["type"]
        if y == "linked_to" and nodes[t_id]["t"] == "lobbyfirm":
            y = "hired"
        elif y == "linked_to" and nodes[t_id].get("hub"):
            y = "lobbied"
        edges.append({"s": s_id, "t": t_id, "y": y, "c": CONF.get(e.get("confidence"), "D"), "d": iso(e.get("date", "")),
                      "u": e.get("source_url", ""), "f": e.get("source_file", ""), "r": e.get("record", ""),
                      "q": (e.get("quote") or "")[:240], "L": "team"})
        have.add(frozenset((s_id, t_id))); added += 1
    print("teammate lobbying links added:", added, "of", len(deferred))

    # Ships seen live on the God's Eye globe (AIS snapshot), if a snapshot exists.
    live_p = os.path.join(HERE, "data", "godseye_live.json")
    live_meta = None
    if os.path.exists(live_p):
        live = load(live_p)
        live_meta = {"taken_utc": live["taken_utc"], "count": len(live["ships"])}
        for sh in live["ships"]:
            nid = "IMO" + sh["imo"]
            if nid in nodes:
                nodes[nid]["live"] = {"area": sh["area"], "at": live["taken_utc"]}

    # A bridge is any link with one end on the lobbying side and the other in the fleet.
    for e in edges:
        a, b = nodes[e["s"]]["L"], nodes[e["t"]]["L"]
        if {a, b} == {"lobby", "fleet"}:
            e["br"] = True
            nodes[e["s"]]["br"] = nodes[e["t"]]["br"] = True

    for nid, st in cur["status"].items():
        if nid in nodes:
            nodes[nid]["s"] = st["level"]
            nodes[nid]["lists"] = st["lists"]
    for nid in cur["no_lobbying_found"]["match"]:
        if nid in nodes:
            nodes[nid]["nolobby"] = True
        else:
            print("note: no-lobbying marker skipped, node not in graph:", nid)

    # Hide fleet nodes with no remaining links (ships whose owner/operator no list names): count them.
    deg = Counter()
    for e in edges:
        deg[e["s"]] += 1
        deg[e["t"]] += 1
    orphans = [nid for nid, n in nodes.items() if deg[nid] == 0]
    orphan_ships = sum(1 for nid in orphans if nodes[nid]["t"] == "ship")
    for nid in orphans:
        del nodes[nid]
    for nid, n in nodes.items():
        n["k"] = deg[nid]

    meta = {
        "generated_from": ["agents/fleetmap/out (shadow-fleet map, read-only)", "US Senate lobbying disclosures (LDA)",
                           "build/kg/curated.json"],
        "counts": {"nodes": len(nodes), "edges": len(edges), "by_type": Counter(n["t"] for n in nodes.values()),
                   "by_layer": Counter(n["L"] for n in nodes.values()), "edge_types": Counter(e["y"] for e in edges),
                   "lead_edges": sum(1 for e in edges if e["c"] == "L"),
                   "ships_hidden_no_owner_link": orphan_ships,
                   "lda_filings_scanned": lobby["filings_scanned"], "lda_filings_kept": lobby["filings_kept"]},
        "no_lobbying_found": cur["no_lobbying_found"],
        "live": live_meta,
    }
    out = {"meta": meta, "nodes": list(nodes.values()), "edges": edges}
    json.dump(out, open(os.path.join(HERE, "data", "kg.json"), "w", encoding="utf-8"), ensure_ascii=False)
    with open(os.path.join(HERE, "kg_data.js"), "w", encoding="utf-8") as f:
        f.write("window.KG=")
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")
    print(json.dumps(meta["counts"], indent=1, default=dict))


if __name__ == "__main__":
    main()
