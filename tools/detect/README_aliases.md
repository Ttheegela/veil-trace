# Alias and ID cross-check (screen gaps)
What: finds Sayari records that share an EXACT normalised alias or an identifier with a company on the US OFAC SDN, EU, UK or Ukraine lists but are flagged "not sanctioned" by Sayari.
Run: `PYTHONUTF8=1 ../../.venv/Scripts/python.exe aliases.py` (saved pulls only) or `... aliases.py --live 20` (adds live Sayari look-ups, logged in live_calls.jsonl); test: `... test_aliases.py`.
Output: `screen_gaps.csv` + a printed table (Sayari id, name, flag, list, programme, list entity, match type, source files); `weak_key=true` marks one-word names with high same-name risk.
Every row is a lead ("shares an exact alias/ID with a listed party"), not a finding: innocent explanations include same name but a different company, and sponsor or list data lag.
Limits: companies only (people skipped); exact match only (no fuzzy), light Cyrillic transliteration; non-unique codes (Russian KPP) and IDs shared by several listed parties are ignored.
