# Shadow-fleet network map: shared research brief (read fully)

Hackathon "Trace the Unseen", 2026-09-25, Sanctions & evasion track. We are building an interactive network chart of
the shadow fleet: nodes = PEOPLE (only officially named), SHIPS (by IMO), COMPANIES, COUNTRIES; edges = typed, dated, sourced.
A deterministic builder already joins the UK/US/EU/Ukraine list files by IMO (ships, flags, former names, UK
"current owner/operator", OFAC "Linked To"). YOUR job is the layer the list files cannot give: official texts and studies.

## Rules (hard)
- Official sources first: home.treasury.gov, ofac.treasury.gov, federalregister.gov, justice.gov, gov.uk, eur-lex.europa.eu,
  consilium.europa.eu, state.gov, courtlistener/court records. Cite the page URL and the saved raw file name. Never cite an AI summary.
- PEOPLE: name a person ONLY if an official list, government release, indictment or court record names them, and only in
  that role. Otherwise write "an individual". No private individuals from press.
- State documented conduct plainly with attribution ("Treasury says X managed vessels for Y"). Use conduct words, not legal
  conclusions, unless a court/agency said so. Our own inferences (timing, shared address, name similarity) = confidence "Lead".
- Every ship must carry its 7-digit IMO number if the source gives it (it usually does). Don't invent IMOs.
- Keep a budget: <= 12 Tavily calls. Sayari only if your angle says so (<= 12 calls).

## Tools (set PYTHONUTF8=1; py = C:\Projects\climate-day\.venv\Scripts\python.exe)
- Tavily: `py C:\Projects\climate-day\smoke\tavily.py search "<q>" --depth advanced --no-answer --max 5 [--domains a,b]`
  and `py ...\tavily.py extract <url> --query "<q>"`. Raw answers auto-save under C:\Projects\climate-day\pulls\tavily\ (note the file name).
- Sayari: `py C:\Projects\climate-day\smoke\sayari_mcp.py call <tool> '<json>'` (NEVER run "login"; schemas in newest
  C:\Projects\climate-day\pulls\sayari\*_tools.json; check "former" on ownership; Sayari splits firms into several records;
  its sanctioned flag can be wrong). Raw answers auto-save under pulls\sayari\.
- Team checker: `cd C:\Projects\climate-day\build && py -m sanctions.check "<name>"`
- Local lists: UK C:\Projects\hackathon-prep\research\R66_climate_data_pack\data\uk_sanctions_list\UK-Sanctions-List.csv
  (first line is a report date; ships have "IMO number", "Current owner/operator (s)", "Previous flags"),
  US C:\Projects\climate-day\data\opensanctions\us_ofac_sdn.csv and ...\R66_climate_data_pack\data\us_csl\consolidated.csv
  (vessel rows: remarks "(Linked To: X)", ids with IMO/MMSI/former flags), EU C:\Projects\climate-day\data\opensanctions\eu_fsf.csv,
  Ukraine C:\Projects\climate-day\data\opensanctions\ua_war_sanctions.csv (a database, NOT a sanctions list).
- Existing verified reports to build on (don't redo): C:\Projects\climate-day\ideas\fleet\*.md,
  ideas\teammate\fleet-service-providers.md, ideas\people\shadow-fleet-people.md. Read their "Must drop or correct".

## Output (two files in C:\Projects\climate-day\agents\fleetmap\research\)
1. `<angle>.json`:
{"angle":"...","nodes":[{"id":"...","type":"person|ship|company|country","name":"...","country":"ISO2 or ''",
   "role":"e.g. ship manager / oil trader / insurer / flag registry","imo":"9xxxxxx (ships)","aliases":["former names"],
   "notes":"one plain sentence"}],
 "edges":[{"source":"id","target":"id","type":"owns|manages|operates|flagged_in|registered_in|designated_by|sold_to|renamed_from|carried_cargo_for|controls|director_of|insured_by|transferred_cargo_with|sister_shell_of|linked_to",
   "date":"YYYY-MM-DD or YYYY or ''","source_url":"https://...","source_file":"pulls\... file name or ''",
   "quote":"<=25-word supporting quote from the source","confidence":"Documented|Lead"}],
 "findings":["plain-language finding with number and source"],"counts":[{"what":"...","value":"...","source_url":"..."}]}
 IDs: ships "IMO9xxxxxx"; companies "co:<lowercase name, spaces->-, no punctuation, drop LLC/LTD/DMCC/FZE suffixes>";
 people "p:<lowercase-first-last>"; countries "cc:<iso2 lowercase>"; sanctioning governments "gov:us|gov:uk|gov:eu|gov:ca|gov:au|gov:ch|gov:nz".
2. `<angle>.md`: a short plain-language report: headline, findings, how solid, what's Documented vs Lead, sources.
Final message: 5-10 lines summary + counts of nodes/edges + budget used.
