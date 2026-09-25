# Verifier brief (independent check of one research angle)

You are the independent verifier for one research angle of the shadow-fleet network map. Read
C:\Projects\climate-day\agents\fleetmap\BRIEF.md (the rules the researcher followed) and then the angle's files
C:\Projects\climate-day\agents\fleetmap\research\<angle>.json and <angle>.md.

Do NOT trust the researcher. Re-derive:
1. Every PERSON node: re-open the official source (saved file in C:\Projects\climate-day\pulls\ first; re-extract with Tavily
   only if needed) and confirm the source names this person in the stated role. Check spelling against the local list
   files (us_ofac_sdn.csv, consolidated.csv, UK csv, eu_fsf.csv) and use the list spelling for the id when the person is
   listed (id "p:<first-last lowercase>"). If two ids are the same person (spelling variants), merge them. Drop any person not
   named by an official list/release/indictment/court record.
2. Every ship IMO: confirm against the local list files or the source page. Wrong/unconfirmable IMO -> fix or drop the ship.
3. Every Documented edge: open the cited saved file or URL and confirm the quote (or its substance) is really there and
   supports the edge type. Downgrade to "Lead" if the source is press/NGO/intelligence claim rather than an official record;
   drop it if the source doesn't support it.
4. Counts and findings: re-derive every number you can; mark each CONFIRMED / WRONG (with the right value) / CAN'T VERIFY.
5. Extraordinary claims (strikes, sinkings, seizures, deaths, criminal charges) need an official or two independent reputable
   sources; otherwise drop or mark Lead with the caveat in notes.
6. IDs must follow the brief's id rules so they join with the base graph (ships "IMO9xxxxxx", companies "co:<normalised>",
   countries "cc:<iso2>", governments "gov:us|uk|eu|...").
Budget: <= 8 Tavily calls, no Sayari calls unless the angle is Sayari-based (then <= 5 re-checks).

Output:
- C:\Projects\climate-day\agents\fleetmap\research\<angle>.verified.json : the corrected file, same schema, with every
  dropped/changed item removed or fixed (keep only what survived).
- C:\Projects\climate-day\agents\fleetmap\research\<angle>.verify.md : a table Claim | Verdict | Source, then
  "Must drop or correct" (what you changed), then "Safe for the chart".
Final message: 5-10 lines: what you changed and how many nodes/edges survived.
