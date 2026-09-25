"""Load the UK, US and UN sanctions lists into one normalised table of records.

Each record is one (entity, name-or-alias) pair so a name search can report
exactly which name matched. Source files are read-only and already on disk
under hackathon-prep/research/R66_climate_data_pack/data/.

Public data only. A match here is a candidate for review, never proof of
wrongdoing.
"""
from __future__ import annotations

import csv
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable, Iterator

csv.field_size_limit(min(sys.maxsize, 2 ** 31 - 1))

DATA_ROOT = Path(
    r"data"
)
UK_CSV = DATA_ROOT / "uk_sanctions_list" / "UK-Sanctions-List.csv"
US_CSV = DATA_ROOT / "us_csl" / "consolidated.csv"
UN_XML = DATA_ROOT / "un_sc_consolidated" / "consolidated.xml"

# Legal-form suffixes stripped during normalisation (whole tokens only).
LEGAL_SUFFIXES = {
    "LLC", "LTD", "LIMITED", "INC", "INCORPORATED", "CORP", "CORPORATION",
    "CO", "COMPANY", "PLC", "GMBH", "SA", "SAS", "SARL", "SRL", "SPA",
    "BV", "NV", "AG", "KG", "OY", "AB", "AS", "A S", "PTY", "PJSC", "JSC",
    "OJSC", "PAO", "ZAO", "OOO", "OAO", "PC", "LP", "LLP", "SDN", "BHD",
    "KFT", "DOO", "EOOD", "AD", "SP", "ZOO", "TOO",
}

_PUNCT_RE = re.compile(r"[^\w\s]", re.UNICODE)
_WS_RE = re.compile(r"\s+")


def normalize_name(name: str) -> str:
    """Case-fold, de-accent, strip punctuation and legal suffixes.

    "Light" transliteration: Unicode is decomposed (NFKD) and combining
    marks / non-Latin remnants are dropped, so accented Latin (e.g. "Ë")
    and many transliterated Cyrillic/Arabic renderings collapse to plain
    ASCII the same way a human would type them.
    """
    if not name:
        return ""
    text = unicodedata.normalize("NFKD", name)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.encode("ascii", "ignore").decode("ascii")
    text = text.upper()
    text = _PUNCT_RE.sub(" ", text)
    tokens = [t for t in _WS_RE.split(text) if t]
    tokens = [t for t in tokens if t not in LEGAL_SUFFIXES]
    return " ".join(tokens)


@dataclass(frozen=True)
class Record:
    list_name: str          # "UK", "US", "UN"
    program: str            # regime / programs / UN list type
    entity_name: str        # the entity's primary/display name
    matched_name: str       # the specific name or alias this row carries
    is_alias: bool
    entity_type: str        # "Entity", "Individual", or "" if unknown
    country: str
    listing_date: str       # as given by the source, not reformatted
    source_file: str
    row_id: str              # id/reference number within the source
    normalized: str = field(compare=False, default="")

    def with_normalized(self) -> "Record":
        return Record(
            self.list_name, self.program, self.entity_name,
            self.matched_name, self.is_alias, self.entity_type,
            self.country, self.listing_date, self.source_file, self.row_id,
            normalize_name(self.matched_name),
        )


def _load_uk() -> Iterator[Record]:
    """UK Sanctions List CSV: one row per name/alias, grouped by Unique ID.

    First line is "Report Date: ..."; the real header is line 2. "Name 6"
    holds the full display name for both entities and individuals in this
    export; "Name type" marks Primary Name vs alias.
    """
    with open(UK_CSV, encoding="utf-8-sig", newline="") as fh:
        fh.readline()  # "Report Date: ..." banner line
        reader = csv.DictReader(fh)
        for i, row in enumerate(reader):
            name = (row.get("Name 6") or "").strip()
            if not name:
                continue
            uid = row.get("Unique ID", "")
            name_type = (row.get("Name type") or "").strip()
            is_alias = name_type != "Primary Name"
            yield Record(
                list_name="UK",
                program=(row.get("Regime Name") or "").strip(),
                entity_name=name,
                matched_name=name,
                is_alias=is_alias,
                entity_type=(row.get("Designation Type") or "").strip(),
                country=(row.get("Address Country") or "").strip(),
                listing_date=(row.get("Date Designated") or "").strip(),
                source_file="uk_sanctions_list/UK-Sanctions-List.csv",
                row_id=uid,
            )


def _load_us() -> Iterator[Record]:
    """US Consolidated Screening List CSV: one row per entity, alt_names
    (semicolon separated) held in one field.
    """
    with open(US_CSV, encoding="utf-8-sig", newline="") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            name = (row.get("name") or "").strip()
            if not name:
                continue
            row_id = row.get("_id", "")
            source = (row.get("source") or "").strip()
            programs = (row.get("programs") or "").strip()
            country = ""
            addresses = (row.get("addresses") or "").strip()
            if addresses:
                # crude "...,CN" trailing country-code pickup; best-effort only
                parts = [p.strip() for p in addresses.split(",")]
                if parts and len(parts[-1]) <= 3:
                    country = parts[-1]
            listing_date = (row.get("start_date") or "").strip()
            yield Record(
                list_name="US",
                program=programs or source,
                entity_name=name,
                matched_name=name,
                is_alias=False,
                entity_type=(row.get("type") or "").strip(),
                country=country,
                listing_date=listing_date,
                source_file="us_csl/consolidated.csv",
                row_id=row_id,
            )
            alt_names = (row.get("alt_names") or "").strip()
            if alt_names:
                for alt in alt_names.split(";"):
                    alt = alt.strip()
                    if not alt:
                        continue
                    yield Record(
                        list_name="US",
                        program=programs or source,
                        entity_name=name,
                        matched_name=alt,
                        is_alias=True,
                        entity_type=(row.get("type") or "").strip(),
                        country=country,
                        listing_date=listing_date,
                        source_file="us_csl/consolidated.csv",
                        row_id=row_id,
                    )


def _un_country(elem: ET.Element, addr_tag: str) -> str:
    addr = elem.find(addr_tag)
    if addr is None:
        return ""
    c = addr.findtext("COUNTRY") or ""
    return c.strip()


def _load_un() -> Iterator[Record]:
    """UN Security Council consolidated XML: INDIVIDUALS and ENTITIES,
    each with repeated *_ALIAS children.
    """
    tree = ET.parse(UN_XML)
    root = tree.getroot()

    entities = root.find("ENTITIES")
    if entities is not None:
        for i, ent in enumerate(entities.findall("ENTITY")):
            name = (ent.findtext("FIRST_NAME") or "").strip()
            if not name:
                continue
            ref = ent.findtext("REFERENCE_NUMBER") or f"E{i}"
            program = ent.findtext("UN_LIST_TYPE") or ""
            listed_on = ent.findtext("LISTED_ON") or ""
            country = _un_country(ent, "ENTITY_ADDRESS")
            yield Record(
                list_name="UN", program=program.strip(), entity_name=name,
                matched_name=name, is_alias=False, entity_type="Entity",
                country=country, listing_date=listed_on.strip(),
                source_file="un_sc_consolidated/consolidated.xml",
                row_id=ref,
            )
            for alias in ent.findall("ENTITY_ALIAS"):
                alias_name = (alias.findtext("ALIAS_NAME") or "").strip()
                if not alias_name:
                    continue
                yield Record(
                    list_name="UN", program=program.strip(),
                    entity_name=name, matched_name=alias_name,
                    is_alias=True, entity_type="Entity", country=country,
                    listing_date=listed_on.strip(),
                    source_file="un_sc_consolidated/consolidated.xml",
                    row_id=ref,
                )

    individuals = root.find("INDIVIDUALS")
    if individuals is not None:
        for i, ind in enumerate(individuals.findall("INDIVIDUAL")):
            parts = [
                ind.findtext(tag) or ""
                for tag in ("FIRST_NAME", "SECOND_NAME", "THIRD_NAME", "FOURTH_NAME")
            ]
            name = " ".join(p.strip() for p in parts if p.strip())
            if not name:
                continue
            ref = ind.findtext("REFERENCE_NUMBER") or f"I{i}"
            program = ind.findtext("UN_LIST_TYPE") or ""
            listed_on = ind.findtext("LISTED_ON") or ""
            country = _un_country(ind, "INDIVIDUAL_ADDRESS")
            yield Record(
                list_name="UN", program=program.strip(), entity_name=name,
                matched_name=name, is_alias=False, entity_type="Individual",
                country=country, listing_date=listed_on.strip(),
                source_file="un_sc_consolidated/consolidated.xml",
                row_id=ref,
            )
            for alias in ind.findall("INDIVIDUAL_ALIAS"):
                alias_name = (alias.findtext("ALIAS_NAME") or "").strip()
                if not alias_name:
                    continue
                yield Record(
                    list_name="UN", program=program.strip(),
                    entity_name=name, matched_name=alias_name,
                    is_alias=True, entity_type="Individual", country=country,
                    listing_date=listed_on.strip(),
                    source_file="un_sc_consolidated/consolidated.xml",
                    row_id=ref,
                )


_CACHE: list[Record] | None = None
_TOKEN_INDEX: dict[str, list[int]] | None = None


def load_all(force: bool = False) -> list[Record]:
    """Load and normalise all three lists once; cached after the first call."""
    global _CACHE
    if _CACHE is not None and not force:
        return _CACHE
    records: list[Record] = []
    for loader in (_load_uk, _load_us, _load_un):
        for rec in loader():
            records.append(rec.with_normalized())
    _CACHE = records
    return records


def load_token_index(force: bool = False) -> dict[str, list[int]]:
    """A word -> [record indices] index over load_all(), so a name check
    only has to fuzzy-score records that share at least one word with the
    query, instead of every row in the table (keeps check() under a
    second on ~120k rows).
    """
    global _TOKEN_INDEX
    if _TOKEN_INDEX is not None and not force:
        return _TOKEN_INDEX
    records = load_all(force=force)
    index: dict[str, list[int]] = {}
    for i, rec in enumerate(records):
        for token in rec.normalized.split():
            index.setdefault(token, []).append(i)
    _TOKEN_INDEX = index
    return index


if __name__ == "__main__":
    import time
    t0 = time.time()
    recs = load_all()
    dt = time.time() - t0
    by_list: dict[str, int] = {}
    for r in recs:
        by_list[r.list_name] = by_list.get(r.list_name, 0) + 1
    print(f"Loaded {len(recs)} name rows in {dt:.2f}s: {by_list}")
