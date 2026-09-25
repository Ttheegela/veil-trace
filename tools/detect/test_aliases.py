"""Tests for aliases.py. Run: python test_aliases.py"""
import os
import tempfile
from pathlib import Path

import aliases as A


def test_normalisation():
    assert A.norm_name("RM DESIGN&DEVELOPMENT SIRKETI") == A.norm_name("LLC RM Design and Development")
    assert A.compact(A.norm_name("RM DesignandDevelopment")) == A.compact(A.norm_name("RM Design&Development"))
    assert A.norm_name("ITIC L.L.C-FZ") == A.norm_name("ITIC LLC FZ") == "itic"
    # Cyrillic look-alike letters (homoglyphs) fold to Latin
    assert A.norm_name("SINNO ЕLЕCTRONICS CO., LIMITЕD") == A.norm_name("Sinno Electronics Co., Limited")
    assert A.norm_name('ООО "ФЕНИКС"') == "feniks"
    assert A.norm_id("IMO 9630004") == "9630004" and A.norm_id("123") is None


def test_fuzzy_is_not_a_match():
    ix = A.Index()
    ix.add_entity("X|1", "X", "1", "LLC RM Design and Development", "P", "Organization")
    ix.add_name("X|1", "LLC RM Design and Development", True)
    ix.finish()
    rec = A.Rec("s1"); rec.names = {"RM DESIGN STUDIO"}; rec.flags = {False}
    assert A.match({"s1": rec}, ix) == []
    rec.names = {"RM DESIGN&DEVELOPMENT SIRKETI"}
    assert len(A.match({"s1": rec}, ix)) == 1
    rec.flags = {False, True}  # Sayari flags it somewhere: not a gap
    assert A.match({"s1": rec}, ix) == []


def test_kpp_not_an_identifier_match():
    ix = A.Index()
    ix.add_entity("X|1", "X", "1", "Some Firm", "P", "Organization")
    ix.add_id("X|1", "772601001")
    ix.finish()
    rec = A.Rec("s1"); rec.names = {"Other"}; rec.ids = {"772601001": "ru_kpp"}; rec.flags = {False}
    assert A.match({"s1": rec}, ix) == []


def test_rm_design_example_found():
    out = Path(tempfile.gettempdir()) / "b12_screen_gaps_test.csv"
    rows = A.run(0, out=out, quiet=True)
    os.remove(out)
    hit = [r for r in rows if r["sayari_entity_id"] == "qOTV1trPEObHvPLAF6GdGQ"]
    assert hit, "RM DESIGN&DEVELOPMENT SIRKETI not found"
    r = [h for h in hit if h["list"] == "US OFAC SDN"][0]
    assert r["list_entity_name"] == "LLC RM Design and Development" and r["sayari_sanctioned"] == "false"
    assert "exact alias" in r["match_type"] and "EO14024" in r["programme"]
    print("  RM DESIGN row:", r["sayari_name"], "|", r["list"], r["list_entity_id"], "|", r["match_type"], "|", r["source_files"])


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
            print("PASS", name)
