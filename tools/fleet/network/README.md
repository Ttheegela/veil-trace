# Shadow Fleet Network: build tools

Builds the interactive network chart in `research/shadow-fleet/network/` from the UK, US and EU sanctions lists (joined by
IMO number) plus verified research files. See `research/shadow-fleet/network/METHOD.md` for sources, rules and limits.

- `build_base.py`: list join (expects the list files at the paths at the top of the script).
- `merge.py`: adds verified research (`research/<angle>.verified.json`, not published) and applies the naming policy.
- `build_viewer.py`: inlines the data into `viewer/template.html`.
- `release_check.py`: no keys, no local paths, no names of unlisted firms, every person officially sourced.
- `BRIEF.md`, `VERIFY_BRIEF.md`, `VIEWER_SPEC.md`: the instructions given to the research, verification and chart agents.
