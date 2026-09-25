# Alias and ID cross-check (screen gaps)
What: finds Sayari records that share an EXACT normalised alias or an identifier with a company on the US OFAC SDN, EU, UK or Ukraine lists but are flagged "not sanctioned" by Sayari.
Run: `PYTHONUTF8=1 ../../.venv/Scripts/python.exe aliases.py` (saved pulls only) or `... aliases.py --live 20` (adds live Sayari look-ups, logged in live_calls.jsonl); test: `... test_aliases.py`.
Output: `screen_gaps.csv` + a printed table (Sayari id, name, flag, list, programme, list entity, match type, source files); `weak_key=true` marks one-word names with high same-name risk.
Every row is a lead ("shares an exact alias/ID with a listed party"), not a finding: innocent explanations include same name but a different company, and sponsor or list data lag.
Limits: companies only (people skipped); exact match only (no fuzzy), light Cyrillic transliteration; non-unique codes (Russian KPP) and IDs shared by several listed parties are ignored.

# Sibling finder (address + shared trading partner)
What: for listed firms, finds unlisted companies whose Sayari address is the same street and building (office, room, floor, litera dropped) AND that appear in the same trading partner's buyer or supplier list; each lead "shares an address and a trading partner with a listed firm".
Run: `PYTHONUTF8=1 ../../.venv/Scripts/python.exe siblings_backtest.py` (OFAC-only back-test, writes siblings_backtest.csv) then `... siblings.py` (saved Sayari answers only, writes siblings.csv); `siblings_address.py` is the normaliser.
Score: shared partners x 1/log2(1 + tenants at the address) + 1 if registered within 90 days after 2022-02-24; the tenant count is always shown so busy business centres (Istanbul tower 194, Moscow Profsoyuznaya 65 about 297) are visible.
Back-test: 728 pairs of OFAC-listed organisations at one normalised address were listed in different waves (240 under Russia programmes), including STRELOI (2023-09-14) and STRELOI EKOMMERTS (2023-12-12).
Limits: leads for review, not findings; partner lists come from about 12 Sayari look-ups (some capped at 100 rows), so "no sibling found" is not "no sibling"; the address match is light and misses spelling variants.
