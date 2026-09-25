"""Check a company (or other entity) name against the UK, US and UN
sanctions lists loaded by sanctions.lists.

A hit here is a "candidate match": a name looked similar to something on a
public list. It is a lead for a human to review, never proof that the
company is sanctioned or has done anything wrong.

CLI:
    python -m sanctions.check "Company name" [--country CC] [--threshold 82]
"""
from __future__ import annotations

import argparse
import difflib
import json
from dataclasses import asdict, dataclass

from .lists import Record, load_all, load_token_index, normalize_name

DEFAULT_THRESHOLD = 82  # 0-100; below this, don't call it a candidate


@dataclass
class Match:
    score: float
    list_name: str
    program: str
    entity_name: str
    matched_name: str
    is_alias: bool
    entity_type: str
    country: str
    listing_date: str
    source_file: str
    row_id: str

    def to_dict(self) -> dict:
        return asdict(self)


def _token_set_ratio(a: str, b: str) -> float:
    """Score two normalised names by overlap of their word sets (handles
    reordered words, e.g. "Trading Company Global" vs "Global Trading Co").
    """
    ta, tb = set(a.split()), set(b.split())
    if not ta or not tb:
        return 0.0
    inter = ta & tb
    union = ta | tb
    jaccard = len(inter) / len(union)
    # Reward when one name's tokens are a subset of the other's (common
    # with "Foo Holdings" vs "Foo Holdings International").
    subset_bonus = len(inter) / min(len(ta), len(tb))
    # A short or trading name (2+ words) fully contained in the listed name is a strong candidate:
    # "Hoshine Silicon" vs "Hoshine Silicon Industry (Shanshan) Co., Ltd." must not slip through.
    # A single word ("Silicon") is too generic to count on its own.
    if len(ta) >= 2 and ta <= tb or len(tb) >= 2 and tb <= ta:
        return 88.0 if jaccard < 0.88 else 100.0 * jaccard
    return 100.0 * max(jaccard, 0.6 * subset_bonus)


def _score(query_norm: str, candidate_norm: str) -> float:
    if not query_norm or not candidate_norm:
        return 0.0
    if query_norm == candidate_norm:
        return 100.0
    ratio = difflib.SequenceMatcher(None, query_norm, candidate_norm).ratio() * 100.0
    token = _token_set_ratio(query_norm, candidate_norm)
    return max(ratio, token)


def check(
    name: str,
    country: str | None = None,
    threshold: float = DEFAULT_THRESHOLD,
    max_results: int = 25,
) -> list[Match]:
    """Return candidate matches for `name` across all three lists.

    Scores each list row (an entity's primary name or one alias) against
    the normalised query, keeps the best-scoring row per (list, entity),
    then returns everything at or above `threshold`, best first.
    """
    query_norm = normalize_name(name)
    if not query_norm:
        return []

    records = load_all()
    index = load_token_index()

    # Only score records that share at least one normalised word with the
    # query: on ~120k rows this keeps a check() call well under a second
    # without needing a fuzzy-matching library. A name with no shared word
    # at all against anything on the lists is, by construction, not a
    # candidate.
    candidate_ids: set[int] = set()
    for token in query_norm.split():
        candidate_ids.update(index.get(token, ()))

    best_per_entity: dict[tuple[str, str], tuple[float, Record]] = {}

    # A one-word name that is rare on the lists ("Katrade" inside "Limited Liability Company
    # Katrade") is a strong candidate; common words ("Silicon", "Trading") are not.
    q_tokens = query_norm.split()
    rare_single = (len(q_tokens) == 1 and len(q_tokens[0]) >= 5
                   and 0 < len(index.get(q_tokens[0], ())) <= 5)

    for idx in candidate_ids:
        rec = records[idx]
        score = _score(query_norm, rec.normalized)
        if rare_single and q_tokens[0] in rec.normalized.split():
            score = max(score, 86.0)
        if score < threshold:
            continue
        if country and rec.country and rec.country.strip().lower() != country.strip().lower():
            score -= 5  # country mismatch: keep as a weaker candidate, don't drop
            if score < threshold:
                continue
        key = (rec.list_name, rec.row_id)
        prior = best_per_entity.get(key)
        if prior is None or score > prior[0]:
            best_per_entity[key] = (score, rec)

    matches = [
        Match(
            score=round(score, 1),
            list_name=rec.list_name,
            program=rec.program,
            entity_name=rec.entity_name,
            matched_name=rec.matched_name,
            is_alias=rec.is_alias,
            entity_type=rec.entity_type or "unknown",
            country=rec.country,
            listing_date=rec.listing_date,
            source_file=rec.source_file,
            row_id=rec.row_id,
        )
        for score, rec in best_per_entity.values()
    ]
    matches.sort(key=lambda m: m.score, reverse=True)
    return matches[:max_results]


def _main() -> None:
    parser = argparse.ArgumentParser(
        description="Check a name against the UK, US and UN sanctions lists (candidate matches only)."
    )
    parser.add_argument("name", help="Company (or other entity) name to check")
    parser.add_argument("--country", default=None, help="Optional country filter/hint")
    parser.add_argument(
        "--threshold", type=float, default=DEFAULT_THRESHOLD,
        help=f"Minimum match score 0-100 (default {DEFAULT_THRESHOLD})",
    )
    parser.add_argument("--json", action="store_true", help="Print raw JSON")
    args = parser.parse_args()

    results = check(args.name, country=args.country, threshold=args.threshold)

    if args.json:
        print(json.dumps([m.to_dict() for m in results], indent=2))
        return

    if not results:
        print(f'No candidate matches for "{args.name}" above threshold {args.threshold}.')
        return

    print(f'{len(results)} candidate match(es) for "{args.name}" (not a finding of wrongdoing):\n')
    for m in results:
        alias_note = f' (matched alias "{m.matched_name}")' if m.is_alias else ""
        print(
            f"  [{m.score:5.1f}] {m.entity_name}{alias_note}\n"
            f"          list: {m.list_name}   type: {m.entity_type}   "
            f"program: {m.program or 'n/a'}   date: {m.listing_date or 'n/a'}\n"
            f"          source: {m.source_file}#{m.row_id}\n"
        )


if __name__ == "__main__":
    _main()
