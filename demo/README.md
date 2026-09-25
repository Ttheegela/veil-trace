# Demo: "Names change in weeks. The need doesn't."

A 3-minute demo for the Trace the Unseen build day (sanctions and evasion track). Seven screens, real data, all leads, not findings.
*Claude's suggestion, unruled by Alex.*

## Open it

Double-click `index.html`. It runs from disk, offline, with no build step and no external libraries. Fonts and theme are local (`fonts/`, `tokens.css`).
Designed for a 1920x1080 projector. It also scales to 1280x720 and a phone (narrow layouts stack).

## Present it

| Key | Does |
|---|---|
| Right arrow / Space / Page Down | next click: reveals the next layer of a screen, then moves on (15 clicks in all, one per "(click)" in the script) |
| Left arrow / Page Up | back one click |
| Home / End | first / last screen |
| 1 to 7 | jump to a screen |
| E | sources and details for this screen (On this screen, More in the data, Words used here) |
| V | presenter view: spoken line for this click, next click, timer, numbers for questions |
| N | presenter notes panel |
| ? | key help |
| Esc | close panels |
| P, or click the timer | pause / resume the timer |
| T | restart the timer from zero |

The step rail across the top names the seven screens; dots show clicks inside a screen. Clicking a number opens its evidence.
URL options: `#b3` opens screen 3, `#b3.2` at its second click; `?ev=b3-e5` opens the drawer on one item; `?shot=1` hides all chrome and shows every layer (for screenshots); `?view=presenter`; `?notes=1`; `?clock=0` hides the timer; `?theme=dark|light|system`.

Roles: Tarun speaks, Alex drives. Every "(click)" in the script is Alex pressing the right arrow.

**Before you go on (2 minutes):** open `index.html` full screen (F11) on the projector, press `V` on the laptop screen for the presenter view, check the timer reads 0:00, and press `Home`. Press `P` as Tarun starts speaking (that starts the timer; in v3 the first right arrow is a click on the first screen). If a judge asks where a number comes from, press `E` (or click the number): the drawer lists the source, the check level and, for experts, the raw file. If the laptop fails, show `shots/v3_<screen>_1920.png` in order.

**How each screen reads (concept first, details in the drawer):**

| Screen | The one idea | What the picture shows |
|---|---|---|
| b0 The question | A sanctions check matches names, so a company with a new name gets through. | A new name slips past the check. |
| b1 New routes | After the invasion, chips kept reaching Russia, sent through countries that had not sent them before. | Three new sending countries start in 2022; a second source confirms the jump. |
| b2 New names | The shipping companies change every few weeks; the flow of chips, and the buyer, stay. | The river of shipments, its company bands lighting up and fading, the buyer's line underneath. |
| b3 The lag | Lists arrive late: by the time a firm is listed, it has usually moved on. | Four rows on one time axis: records, then the wait to listing, then the gap with no records left. |
| b4 The drone part | A drone's chip model was shipped into Russia months before any firm on its path was listed. The weapon link is not proven. | The drone, a dashed "Not proven" link, the part; its two shipment records drop into one lane per firm, then each firm's wait to listing. |
| b5 Blind spots | No single source sees everything: not our data, not a screening tool. | A map of countries seen only through partners; the day our checker caught a provider's wrong "clean" flag. |
| b6 What to track | Track what doesn't change: the product, the buyer, the route. | How long each thing stays the same, from weeks to years, against when lists arrive. |

## v3 (25 Sep, after Alex's 12:51 direction and the reader, fact and motion reviews)

*Claude's suggestion, unruled by Alex.*

**One point per screen.** Each screen has one sentence the audience should leave with (the table above). Anything that argued a second point moved to the drawer (key E) with its evidence id unchanged: b1 "45 of 1,147"; b2 "21 days", the half-year company counts and "six suppliers later listed"; b3 the Testkomplekt row and "22 months" (Q&A 7); b5 "Fixed" and the Iran oil and ships-at-sea plates. After the review pass:
- **b3 The lag** is one chart read in three clicks: records, then the wait to listing, then the gap with no records left. RM Design's records declared as leaving Turkey after its listing stay on screen (held for Alex) as one small grey footnote worded "it moved on: 40 records after listing", so it supports the headline instead of reading as a second point. "4 of 5" now says which rows it covers ("ELEM GROUP and RM Design are two of them"). The zone label says "hatched means less certain", matching what is drawn.
- **b4 The drone part** is one diagram: what (drone, dashed "Not proven" link, the part) above, when (one lane per firm on a shared time axis) below. The buyer is labelled "one Russian buyer received both". "Not proven" is on screen from the first click of the screen, at big-number size, on the dashed link it describes.
- **b5** is one thrust: "No single source sees everything: not our data, not a screening tool." The map and the "Caught" date are its two proofs.
- **b1** caption says the dollars are "a second source confirming the shift". **b2** no longer names the buyer on screen (it is in the drawer); it says "one Russian company, one record".
- **Facts:** the lag range is 15 to 20 months everywhere (LOG 13:12 CORRECTED: ELEM GROUP's first listing is the US Commerce Entity List, 7 Dec 2023), including b6's "Lists arrive" band (now drawn to 20 months), its evidence item, SCRIPT.md, DESIGN_SPEC.md and V3_PLAN.md. No other number changed.

**How the clicks and animations work.**
- 15 right-arrow presses, one per "(click)" in `SCRIPT.md`: b0 1, b1 2, b2 3, b3 3, b4 3, b5 2, b6 1. Arriving on a screen counts as its first click and plays that step's moves.
- Motion only explains: a line drawing along time, a bar growing from "first appeared" to "listed", a gap bracket growing from the last record to the listing, company bands lighting up in the order they shipped, a number counting up. Each move belongs to one click, lasts 400 to 1200 ms, eases out, and moves one thing at a time (a click plays its moves in order; b3's last click is gaps, notes, footnote, then "4 of 5"; b4's middle click is the time field, then the August record, then the November record).
- Pressing right during a move finishes it at once and goes on. Left arrow, number keys, the rail, `#bN` links, `?shot=1`, phones and `prefers-reduced-motion` all show the finished slide instantly. It is the shell's motion helper (`shell.js`, MOTION block): Web Animations on opacity, transform, clip-path and stroke only, no libraries.
- Checked in headless Chrome: all 15 clicks land on the right step, every screen's last step has nothing hidden, reduced motion shows finished states, no console errors at 1920x1080 and 1280x720, light and dark. Not checked: smoothness on the real laptop and projector (one run-through before going on).

**How to present.** Alex drives, Tarun speaks. Full screen (F11), `V` on the laptop for the presenter view (spoken line and the [MOVE] for each click), `Home`, then `P` as Tarun starts. Tarun starts each line on the click and lets the picture move under his words; no need to wait for a move to finish. On b4, point back at the dashed "Not proven" on "we can't prove". If asked where a number comes from, press `E` or click the number. Backup: `shots/v3_<screen>_1920.png` (and `_1280.png`), finished state of each screen.

## What changed in v2 (reader, fact and design reviews, 25 Sep)

- **Plainer words.** b1 now says "sent through new countries" (was "new doors"); the "declared country, not a traced route" rule sits in the explain line instead of stacked small print; the $13.5 million caption starts "Dollars, from a different source" so it is not confused with the shipment counts. b0 says what a sanctions list stops ("no sales, no payments"). b3's explain line now says a bar starts at a company's registration or first shipment (it said "first sign in shipment records", which was wrong for two of the four firms).
- **b2 chart.** RM Design and Development is the one dark band; all other companies are grey with a clear gap between bands. The floating "Rama Group" label is gone (it is in the drawer). The explain line says the smallest firms are grouped (7 bands, 14 companies). The buyer key and the "2019 to 2025" number are sized so they no longer compete with the chart.
- **Fewer numbers.** b3 drops the big "15 to 23 months" (since corrected to 15 to 20 months, v3) (the headline already says it). b5's "Why it matters" is one sentence; the tax-number case moved to the drawer (b5-e9).
- **Cleaner visuals.** b0 notes sit on the fork, the closing question is quieter. b3's buyer row uses one tick per shipment day instead of bunched dots. b4 has one "Not proven" (the big one); the chain shows a dashed link with a plain note, the part number is no longer blue, and listing labels on the ruler no longer touch. b5's map key includes "Seen only through partners" and the Iran callout no longer covers Iran. b6's three words are underlined, not boxed; the rows read top to bottom as the product, the buyer, the route; the "lists arrive" band is visible; the product bar fades out because it is not measured to a date; the thank-you line is quieter.
- **Facts.** Every on-screen number is unchanged. "45 of 1,147" was re-derived from the saved raw response (product-origin field: Kyrgyzstan 45 of 1,147); the country split stays in the drawer, marked as not yet a log row. Close wording is "the product, the buyer, the route" everywhere, including the explainer.
- Script still 429 spoken words; SCRIPT.md lines changed on b1 ("new countries") and b2 ("Each band is a shipping company").

## Where things are

- `SCRIPT.md`: the spoken script, word counts per screen, cut list, number check (each spoken number to its log row), Q&A prep.
- `shots/v3_<screen>_1920.png` and `_1280.png`: backup screenshots of every screen, v3 (finished state), in case the laptop or projector fails. `v2_*` and `final_*` are earlier versions.
- `V3_PLAN.md`: the v3 storyboard (one point per screen, the motion per click); it wins over `DESIGN_SPEC.md` where they differ.
- `DESIGN_SPEC.md`: the redesign spec (reading order, type sizes, colour rules).
- `beats/`: one file per screen (b0 hook, b1 routes, b2 river, b3 lag, b4 chip, b5 honesty, b6 close).
- `data/`: the data each screen draws, copied from the team's earlier views in `build/viz/` and the UN Comtrade aggregate files.

## Evidence check levels

- **official**: checked on a government page (US Treasury, Federal Register, US Commerce, UK, EU, UN Comtrade, GUR).
- **verified**: re-derived from a saved sponsor response by a second check.
- **approximate**: context or an estimate; treat as a range.

## What is approximate

- "At least" everywhere: shipment records are minimums, and Russia-side records (about 81% of chip records into Russia) thin out after late 2023.
- Counts after a listing are minimums (saved answers hit row limits).
- Some later-listing dates for the buyer's six suppliers and the buyer's EU listing are first-seen dates in OpenSanctions, not checked on the official page.
- Comtrade values are declared values; 2024 may be incomplete.
- Iran oil relabelling context (b5) is cited, not re-checked by us.
- "New since 2022" on b1 partly reflects where Russia's own records start; the Comtrade panel is the independent check.

## Credits

- Sponsor data: Sayari and Tradeverifyd. UN Comtrade (countries' own trade reports). Official sanctions lists: US Treasury (OFAC), US Commerce (BIS), UK, EU; OpenSanctions. GUR, Ukraine's defence intelligence (a party to the war).
- Map callout style adapted from God's Eye View, MIT License, (c) 2026 Bilawal Sidhu (github.com/bilawalsidhu/gods-eye-view). See `build/viz/THIRD_PARTY.md`.
- Country boundaries: Natural Earth 1:110m (public domain), via world-atlas (ISC).
- Type: IBM Plex Sans, SIL Open Font License (`fonts/LICENSE-IBMPlexSans-OFL.txt`).
- Look: the team's corporate theme (`hackathon-prep/day_kit/looks/corporate`).

Raw sponsor pulls stay local and are not part of this folder.
