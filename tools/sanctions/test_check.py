"""A few sanity tests for sanctions.check.

Run with: python -m sanctions.test_check
(plain functions + asserts, no pytest dependency assumed).
"""
from __future__ import annotations

from .check import check

# Real, currently-listed company entries picked from each source file
# (see each function's source_file for exactly where).
UK_KNOWN_COMPANY = "Haji Khairullah Haji Sattar Money Exchange"   # uk_sanctions_list, Unique ID AFG0001
US_KNOWN_COMPANY = "China Telecom Corporation Limited"             # us_csl, _id 30882 (CMIC list)
UN_KNOWN_COMPANY = "Butembo Airlines"                               # un_sc_consolidated, CDe.002

FAKE_COMPANY = "Zzyzx Nonexistent Widgets Cooperative of Nowhere"


def test_uk_known_company_found():
    results = check(UK_KNOWN_COMPANY)
    assert any(m.list_name == "UK" for m in results), "expected a UK candidate match"
    top = results[0]
    assert top.score >= 90
    print(f"OK  UK known company found: {top.entity_name!r} score={top.score}")


def test_us_known_company_found():
    results = check(US_KNOWN_COMPANY)
    assert any(m.list_name == "US" for m in results), "expected a US candidate match"
    us_hit = next(m for m in results if m.list_name == "US")
    assert us_hit.score >= 90
    print(f"OK  US known company found: {us_hit.entity_name!r} score={us_hit.score}")


def test_un_known_company_found():
    results = check(UN_KNOWN_COMPANY)
    assert any(m.list_name == "UN" for m in results), "expected a UN candidate match"
    un_hit = next(m for m in results if m.list_name == "UN")
    assert un_hit.score >= 80
    print(f"OK  UN known company found: {un_hit.entity_name!r} score={un_hit.score}")


def test_made_up_name_not_found():
    results = check(FAKE_COMPANY)
    assert results == [], f"expected no candidates for a made-up name, got {results}"
    print("OK  made-up name returns no candidate matches")


def test_entity_type_is_shown():
    results = check(UK_KNOWN_COMPANY)
    assert results and all(m.entity_type for m in results), "entity_type should never be blank"
    print("OK  entity_type is populated on every match")


def run_all():
    tests = [
        test_uk_known_company_found,
        test_us_known_company_found,
        test_un_known_company_found,
        test_made_up_name_not_found,
        test_entity_type_is_shown,
    ]
    failures = 0
    for t in tests:
        try:
            t()
        except AssertionError as e:
            failures += 1
            print(f"FAIL {t.__name__}: {e}")
    total = len(tests)
    print(f"\n{total - failures}/{total} tests passed")
    if failures:
        raise SystemExit(1)


if __name__ == "__main__":
    run_all()


def test_short_name_inside_longer_listed_name_is_found():
    # "Hoshine Silicon" must match the Entity List entry "Hoshine Silicon Industry (Shanshan) Co., Ltd."
    res = check("Hoshine Silicon")
    assert any("hoshine" in r.matched_name.lower() for r in res)


def test_single_generic_word_is_not_enough():
    assert not any(r.score >= 88 for r in check("Silicon"))


def test_rare_single_word_inside_listed_name_is_found():
    # "Katrade" must match the OFAC entry "Limited Liability Company Katrade"
    assert any("katrade" in r.matched_name.lower() for r in check("Katrade"))
