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
    for e in fe:
        if e["type"] in DROP_EDGE_TYPES or e["source"] not in nodes or e["target"] not in nodes:
            continue
        edges.append({"s": e["source"], "t": e["target"], "y": e["type"], "c": CONF.get(e.get("confidence"), "D"),
                      "d": iso(e.get("date", "")), "u": e.get("source_url", ""), "f": e.get("source_file", ""),
                      "r": e.get("record", ""), "q": (e.get("quote") or "")[:240], "L": "fleet"})

    # ---- lobbying layer ----------------------------------------------------------------------
    for n in lobby["nodes"] + cur["nodes"]:
        nid = n["id"]
        if nid in nodes:  # the same company already on the fleet side: mark it as a bridge
            nodes[nid]["L"] = "bridge"
            continue
        info = {k: n[k] for k in ("role", "country", "title", "covered_positions", "lda_names") if n.get(k)}
        nodes[nid] = {"id": nid, "t": n["type"], "n": n["name"], "L": "lobby", "g": n.get("group", ""),
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
                      "q": e.get("quote", ""), "a": e.get("amount", 0), "an": e.get("amount_note", ""), "L": "bridge"})
        for k in ("source", "target"):
            if nodes[e[k]]["L"] == "fleet":
                nodes[e[k]]["L"] = "bridge"

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
