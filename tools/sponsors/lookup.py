"""One look-up across both sponsors: Sayari and Tradeverifyd (TRC-14).

Given a company name, returns each vendor's best-matching entities side by side, with
id, name, country, match confidence, risk flags / annotation count, trade / ownership
counts (where the look-up tool gives them for free), and warnings for thin records.
Look-up tools only (no traversal, no monitoring, no writes). Every raw answer is saved
under pulls/<vendor>/ with its UTC call time, exactly like
the two connection scripts this reuses.

Reuses (does not re-invent) the two working connections:
  - smoke/tv_call.py       -> Tradeverifyd: bearer key from .board-keys/tradeverifyd.key,
                               same read-only tool allowlist.
  - smoke/sayari_mcp.py    -> Sayari: OAuth tokens already saved in
                               .board-keys/sayari_oauth.json. This module NEVER opens a
                               browser / starts a login flow: if the saved tokens don't
                               work, it stops and raises, it does not try to sign in.

CLI:
  python -m sponsors.lookup "Company name" [--country XX]

Calls stay few per lookup (design target <= 6 real MCP calls): one search per vendor,
plus a small, capped number of per-candidate detail calls (Tradeverifyd: entity_score;
Sayari: get_entity_summary) for the top candidate(s) only.
"""
from __future__ import annotations

import argparse
import asyncio
import difflib
import json
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
import os
from pathlib import Path
from typing import Any

from mcp import ClientSession
from mcp.client.auth import OAuthClientProvider, TokenStorage
from mcp.client.streamable_http import streamablehttp_client
from mcp.shared.auth import OAuthClientInformationFull, OAuthClientMetadata, OAuthToken

# ---------------------------------------------------------------------------
# Tradeverifyd connection (mirrors smoke/tv_call.py)
# ---------------------------------------------------------------------------
TV_URL = "https://platform.tradeverifyd.com/api/mcp"
TV_KEY_FILE = Path(os.environ.get("TV_KEY_FILE", ".board-keys/tradeverifyd.key"))
TV_OUT = Path(r".\pulls\tradeverifyd")
# Same read-only allowlist as tv_call.py. Never add a write tool here.
TV_READ_ONLY = {
    "search_entities", "entity_details", "entity_addresses", "entity_trade_relationships",
    "entity_affiliate_relationships", "entity_annotations", "annotated_relationship_paths",
    "entity_score", "relationship_types", "annotations_categories", "resolve_company_associations",
    "find_companies_in_radius",
}

# ---------------------------------------------------------------------------
# Sayari connection (mirrors smoke/sayari_mcp.py) — read-only tools only, no login flow
# ---------------------------------------------------------------------------
SAYARI_URL = "https://mcp.sayari.com/mcp"
SAYARI_STORE = Path(os.environ.get("SAYARI_OAUTH_FILE", ".board-keys/sayari_oauth.json"))
SAYARI_OUT = Path(r".\pulls\sayari")


class FileStorage(TokenStorage):
    """Identical to smoke/sayari_mcp.py's FileStorage: reads/writes the saved OAuth
    tokens. Reused so this module never has to know how to sign in."""

    def _load(self):
        return json.loads(SAYARI_STORE.read_text()) if SAYARI_STORE.exists() else {}

    def _save(self, d):
        SAYARI_STORE.write_text(json.dumps(d))

    async def get_tokens(self):
        t = self._load().get("tokens")
        return OAuthToken.model_validate(t) if t else None

    async def set_tokens(self, tokens):
        d = self._load(); d["tokens"] = tokens.model_dump(mode="json"); self._save(d)

    async def get_client_info(self):
        c = self._load().get("client")
        return OAuthClientInformationFull.model_validate(c) if c else None

    async def set_client_info(self, info):
        d = self._load(); d["client"] = info.model_dump(mode="json"); self._save(d)


class NoLoginAllowed(RuntimeError):
    """Raised instead of ever opening a browser sign-in flow for Sayari."""


async def _refused_redirect(url):
    raise NoLoginAllowed(
        "Sayari's saved OAuth tokens did not work and this would require a fresh "
        "sign-in (browser redirect). Refusing to start a login flow; stopping. "
        "Ask Alex to refresh the file named by SAYARI_OAUTH_FILE with "
        "smoke\\sayari_mcp.py login."
    )


async def _refused_callback():
    raise NoLoginAllowed("Sayari login callback requested; refusing (no login flow here).")


def _sayari_provider():
    if not SAYARI_STORE.exists():
        raise NoLoginAllowed(f"No saved Sayari tokens at {SAYARI_STORE}; stopping (no login flow here).")
    meta = OAuthClientMetadata(
        client_name="Climate build day (Alex) - sponsors.lookup",
        redirect_uris=["http://localhost:33418/callback"],
        grant_types=["authorization_code", "refresh_token"],
        response_types=["code"],
    )
    return OAuthClientProvider(
        server_url=SAYARI_URL, client_metadata=meta, storage=FileStorage(),
        redirect_handler=_refused_redirect, callback_handler=_refused_callback,
    )


# ---------------------------------------------------------------------------
# Raw-answer saving (same shape as the two smoke scripts)
# ---------------------------------------------------------------------------

def _save_raw(out_dir: Path, vendor: str, tool: str, args: dict, body: dict) -> Path:
    out_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    f = out_dir / f"{ts}_{tool}.json"
    payload = {"called_at_utc": ts, "vendor": vendor, "tool": tool, "args": args, **body}
    f.write_text(json.dumps(payload, indent=1, ensure_ascii=False, default=str), encoding="utf-8")
    return f


async def _tv_call(tool: str, args: dict) -> tuple[Any, Path]:
    if tool not in TV_READ_ONLY:
        raise RuntimeError(f"REFUSED: {tool} is not on the Tradeverifyd read-only list")
    key = TV_KEY_FILE.read_text().strip()
    async with streamablehttp_client(TV_URL, headers={"Authorization": f"Bearer {key}"}) as (r, w, _):
        async with ClientSession(r, w) as s:
            await s.initialize()
            res = await s.call_tool(tool, args)
    body = {"is_error": res.isError, "structured": res.structuredContent,
            "text": [c.text for c in res.content if getattr(c, "type", "") == "text"]}
    f = _save_raw(TV_OUT, "tradeverifyd", tool, args, body)
    data = res.structuredContent
    if data is None and body["text"]:
        try:
            data = json.loads(body["text"][0])
        except json.JSONDecodeError:
            data = {"raw_text": body["text"]}
    return data, f


async def _sayari_call(tool: str, args: dict) -> tuple[Any, Path]:
    provider = _sayari_provider()
    async with streamablehttp_client(SAYARI_URL, auth=provider) as (r, w, _):
        async with ClientSession(r, w) as s:
            await s.initialize()
            res = await s.call_tool(tool, args)
    body = {"is_error": res.isError, "structured": res.structuredContent,
            "text": [c.text for c in res.content if getattr(c, "type", "") == "text"]}
    f = _save_raw(SAYARI_OUT, "sayari", tool, args, body)
    data = res.structuredContent
    if data is None and body["text"]:
        try:
            data = json.loads(body["text"][0])
        except json.JSONDecodeError:
            data = {"raw_text": body["text"]}
    if isinstance(data, dict) and "result" in data and isinstance(data["result"], str):
        try:
            data = json.loads(data["result"])
        except json.JSONDecodeError:
            pass
    return data, f


# ---------------------------------------------------------------------------
# Matching helpers
# ---------------------------------------------------------------------------

def _name_similarity(a: str, b: str) -> float:
    return round(difflib.SequenceMatcher(None, a.strip().lower(), b.strip().lower()).ratio(), 3)


@dataclass
class Candidate:
    vendor: str
    entity_id: str
    name: str
    country: str | None
    match_confidence: float | None  # vendor-reported where available, else computed similarity
    confidence_is_computed: bool
    risk: dict = field(default_factory=dict)
    counts: dict = field(default_factory=dict)
    warnings: list = field(default_factory=list)

    def to_dict(self):
        return {
            "vendor": self.vendor, "entity_id": self.entity_id, "name": self.name,
            "country": self.country, "match_confidence": self.match_confidence,
            "confidence_is_computed": self.confidence_is_computed,
            "risk": self.risk, "counts": self.counts, "warnings": self.warnings,
        }


# ---------------------------------------------------------------------------
# Tradeverifyd side of a lookup
# ---------------------------------------------------------------------------

async def _lookup_tradeverifyd(name: str, country: str | None, raw_files: list) -> list[Candidate]:
    args = {"name": name, "limit": 5}
    if country:
        args["jurisdiction"] = country
    data, f = await _tv_call("search_entities", args)
    raw_files.append(str(f))
    results = (data or {}).get("results", []) if isinstance(data, dict) else []
    if not results:
        return []

    # search_entities already returns confidence, jurisdiction, annotation_count and
    # relationship counts for free (checked against a live pull on 2026-09-25) — no
    # extra call needed for those. Sort exact (case-insensitive) name matches first,
    # then by the vendor's own confidence.
    def sort_key(item):
        exact = item.get("name", "").strip().lower() == name.strip().lower()
        return (not exact, -(item.get("confidence") or 0))

    results = sorted(results, key=sort_key)

    candidates: list[Candidate] = []
    # Score only the top candidate to stay inside the call budget, unless the top
    # result is not an exact-name match, in which case also score the runner-up.
    to_score = results[:1] if results[0].get("name", "").strip().lower() == name.strip().lower() else results[:2]
    scores: dict[str, dict] = {}
    for item in to_score:
        eid = item["entity_id"]
        try:
            sdata, sf = await _tv_call("entity_score", {"entity_id": eid})
            raw_files.append(str(sf))
            scores[eid] = sdata or {}
        except Exception as e:  # keep the lookup alive; note the failure instead of crashing
            scores[eid] = {"error": str(e)}

    for item in results[:5]:
        eid = item["entity_id"]
        c = Candidate(
            vendor="tradeverifyd", entity_id=eid, name=item.get("name", ""),
            country=item.get("jurisdiction"),
            match_confidence=item.get("confidence"), confidence_is_computed=False,
        )
        if country and item.get("jurisdiction") and item["jurisdiction"].upper() != country.upper():
            c.warnings.append(
                f"jurisdiction filter is unreliable: requested {country}, this record's "
                f"actual country is {item['jurisdiction']} — check the returned country, "
                f"don't trust the filter alone."
            )
        ann = item.get("annotation_count", 0) or 0
        c.risk["annotation_count"] = ann
        inbound = item.get("direct_inbound_relationships", 0) or 0
        outbound = item.get("direct_outbound_relationships", 0) or 0
        affiliates = item.get("affiliate_relationship_count", 0) or 0
        c.counts.update({
            "direct_inbound_trade": inbound, "direct_outbound_trade": outbound,
            "affiliate_relationships": affiliates,
        })
        if inbound == 0 and outbound == 0 and affiliates > 0:
            c.warnings.append(
                "thin trade record: 0 direct trade relationships but affiliate/ownership "
                "links exist — pattern seen on holding companies. Could mean a shell, or "
                "just a coverage gap; don't read it as proof either way."
            )
        elif inbound == 0 and outbound == 0 and affiliates == 0:
            c.warnings.append("no trade or affiliate relationships on record at all — very thin record.")
        if eid in scores:
            s = scores[eid]
            if "error" in s:
                c.warnings.append(f"entity_score call failed: {s['error']}")
            else:
                c.risk["tradeverifyd_score"] = s.get("tradeverifyd_score")
                c.risk["score_level"] = s.get("score_level")
                # Tip from this morning: higher score = safer.
                c.risk["score_note"] = "higher tradeverifyd_score = safer"
        candidates.append(c)
    return candidates


# ---------------------------------------------------------------------------
# Sayari side of a lookup
# ---------------------------------------------------------------------------

async def _lookup_sayari(name: str, country: str | None, raw_files: list) -> list[Candidate]:
    data, f = await _sayari_call("search_entities", {"query": name, "limit": 5})
    raw_files.append(str(f))
    items = (data or {}).get("items", []) if isinstance(data, dict) else []
    total = (data or {}).get("returned") if isinstance(data, dict) else None
    if not items:
        return []

    def sim(item):
        return _name_similarity(name, item.get("label", ""))

    items = sorted(items, key=sim, reverse=True)

    # Per this morning's exploration: generic names return 600+ fuzzy hits, so prefer
    # an exact legal name and use get_entity_summary for the top few. We summarize the
    # single best-similarity candidate to stay inside the call budget, plus a second
    # one only if the best isn't a near-exact match.
    best_sim = sim(items[0])
    to_summarize = items[:1] if best_sim >= 0.92 else items[:2]
    summaries: dict[str, dict] = {}
    for item in to_summarize:
        eid = item["entity_id"]
        try:
            sdata, sf = await _sayari_call("get_entity_summary", {"entity_id": eid})
            raw_files.append(str(sf))
            summaries[eid] = sdata or {}
        except Exception as e:
            summaries[eid] = {"error": str(e)}

    candidates: list[Candidate] = []
    for item in items[:5]:
        eid = item["entity_id"]
        quality_flags = item.get("quality_flags", []) or []
        countries = None
        c = Candidate(
            vendor="sayari", entity_id=eid, name=item.get("label", ""),
            country=None, match_confidence=sim(item), confidence_is_computed=True,
        )
        c.risk["quality_flags"] = quality_flags
        if "sparse_identifiers" in quality_flags:
            c.warnings.append("thin record: sparse_identifiers flag from Sayari (few identifiers on file).")
        if "missing_country" in quality_flags:
            c.warnings.append("thin record: missing_country flag from Sayari (no country attached).")
        if eid in summaries:
            s = summaries[eid]
            if "error" in s:
                c.warnings.append(f"get_entity_summary call failed: {s['error']}")
            else:
                attrs = s.get("attributes", {}) or {}
                countries = attrs.get("countries")
                c.country = ", ".join(countries) if countries else None
                c.risk["status"] = attrs.get("status")
                c.risk["closed"] = s.get("closed")
        if country and c.country and country.upper() not in [x.upper() for x in (countries or [])]:
            c.warnings.append(
                f"requested country {country} not among this record's countries ({c.country})."
            )
        c.counts["trade_ownership_note"] = (
            "not fetched this lookup (look-up tools only, call budget) — "
            "use Sayari's traversal tools (get_upstream_supply_chain, find_beneficial_owners) "
            "for actual trade/ownership counts if this candidate is chosen for deeper work."
        )
        candidates.append(c)
    if total and total > 25:
        for c in candidates:
            c.warnings.append(f"broad query: {total} fuzzy hits returned for '{name}' — verify this is the right entity.")
    return candidates


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def lookup_async(name: str, country: str | None = None) -> dict:
    started = time.monotonic()
    ts = datetime.now(timezone.utc).isoformat()
    tv_files: list[str] = []
    sy_files: list[str] = []
    tv_error = sy_error = None

    async def run_tv():
        nonlocal tv_error
        try:
            return await _lookup_tradeverifyd(name, country, tv_files)
        except Exception as e:
            tv_error = str(e)
            return []

    async def run_sayari():
        nonlocal sy_error
        try:
            return await _lookup_sayari(name, country, sy_files)
        except NoLoginAllowed as e:
            sy_error = f"STOPPED: {e}"
            return []
        except Exception as e:
            sy_error = str(e)
            return []

    tv_candidates, sy_candidates = await asyncio.gather(run_tv(), run_sayari())

    elapsed = round(time.monotonic() - started, 2)
    return {
        "queried_name": name,
        "requested_country": country,
        "called_at_utc": ts,
        "elapsed_seconds": elapsed,
        "tradeverifyd": {
            "candidates": [c.to_dict() for c in tv_candidates],
            "raw_files": tv_files,
            "error": tv_error,
        },
        "sayari": {
            "candidates": [c.to_dict() for c in sy_candidates],
            "raw_files": sy_files,
            "error": sy_error,
        },
    }


def lookup(name: str, country: str | None = None) -> dict:
    """Sync entry point: for each sponsor, the best few matching entities with id,
    name, country, match confidence, risk flags/annotation count, trade/ownership
    counts, and warnings for thin records. Raw answers are saved under pulls/<vendor>/."""
    return asyncio.run(lookup_async(name, country))


def _print_human(result: dict):
    print(f"\n=== {result['queried_name']} "
          f"({'country=' + result['requested_country'] if result['requested_country'] else 'no country filter'}) "
          f"— {result['elapsed_seconds']}s ===")
    for vendor in ("tradeverifyd", "sayari"):
        block = result[vendor]
        print(f"\n-- {vendor} --")
        if block["error"]:
            print(f"  ERROR: {block['error']}")
        if not block["candidates"]:
            print("  (no candidates)")
        for c in block["candidates"]:
            conf = c["match_confidence"]
            conf_s = f"{conf}" + (" (computed)" if c["confidence_is_computed"] else "") if conf is not None else "n/a"
            print(f"  - {c['name']!r}  id={c['entity_id']}  country={c['country']}  confidence={conf_s}")
            if c["risk"]:
                print(f"      risk: {c['risk']}")
            if c["counts"]:
                print(f"      counts: {c['counts']}")
            for w in c["warnings"]:
                print(f"      WARNING: {w}")
        for f in block["raw_files"]:
            print(f"  raw: {f}")


def main(argv=None):
    p = argparse.ArgumentParser(description="One look-up across Sayari and Tradeverifyd.")
    p.add_argument("name", help="Company legal name (exact names work best; generic names return many fuzzy hits).")
    p.add_argument("--country", default=None, help="ISO alpha-2 country hint (e.g. CN, US). Advisory only — always check the returned country.")
    p.add_argument("--json", action="store_true", help="Print the full result as JSON instead of the human-readable summary.")
    args = p.parse_args(argv)

    result = lookup(args.name, args.country)
    if args.json:
        print(json.dumps(result, indent=1, ensure_ascii=False))
    else:
        _print_human(result)
    return 0


if __name__ == "__main__":
    sys.exit(main())
