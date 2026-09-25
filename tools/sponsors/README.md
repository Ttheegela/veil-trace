# sponsors: one look-up across Sayari and Tradeverifyd

`lookup(name, country=None)` calls both sponsors and returns their best-matching
companies side by side: id, name, country, match confidence, risk flags/annotations,
trade or ownership counts, and warnings for thin or ambiguous records.

Run it: `python -m sponsors.lookup "Company legal name"` (add `--country CN` as a hint,
`--json` for the full result). Use the exact legal name where you have it; a generic
name returns dozens or hundreds of fuzzy Sayari hits.

Every raw vendor answer is saved with its call time under `pulls/tradeverifyd/` and
`pulls/sayari/`. Sponsor data stays local; never commit `pulls/`.

Limits: look-up tools only, no traversal, so Sayari trade/ownership counts are not
fetched here (noted on each candidate); a match or a link is a lead, not a finding.
