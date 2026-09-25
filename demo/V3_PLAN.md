# V3 plan: one point per screen, motion that explains

*Fri 25 Sept 2026, written after Alex's direction at 12:51. Claude's suggestion, unruled by Alex.*
*Builders follow this plan. Where it and `DESIGN_SPEC.md` disagree, this plan wins (in particular it replaces spec 4.3 "no drawing animations on charts"). Where it and `LOG_2026-09-25.md` disagree on a number, the log wins: stop and flag it. Every number below is already on the v2 screens or in the v2 drawer; nothing is re-derived.*

**Alex (12:51):** "The lag and the drone part pages are not as clear as they could be. Also each slide should be one clear point or thrust. Also would it be possible to animate some of the details for clarity?"

**What that means in practice:** each screen gets one sentence the audience should leave with. Anything on a screen that does not serve that sentence moves to the drawer (key E) or to another screen. The lag and drone screens are rebuilt around one visual each. Motion is used only to show a mechanism (a line drawing along time, a gap growing between "shipped" and "listed", records lighting up in order), always on a click, and the finished slide is what screenshots show.

---

## 0. The shape of v3

| Screen | The one point (what the audience leaves with) | Clicks on it | Seconds | Words |
|---|---|---|---|---|
| b0 The question | A sanctions check matches names, so a company with a new name gets through. | 2 (1 inside) | 18 | 41 |
| b1 New routes | After the invasion, chips kept reaching Russia, sent through countries that had not sent them before. | 2 | 27 | 61 |
| b2 New names | The shipping companies change every few weeks; the flow of chips, and the buyer, stay. | 3 | 27 | 57 |
| b3 The lag | Lists arrive late: by the time a firm is listed, it has usually moved on. | 3 | 30 | 62 |
| b4 The drone part | The exact chip model from a military drone was shipped into Russia months before any firm on its path was listed; whether these chips reached a weapon is not proven. | 3 | 32 | 68 |
| b5 Blind spots | Our data, and the screening tools, have blind spots, and we show where they are. | 2 | 31 | 71 |
| b6 What to track | Track what doesn't change: the product, the buyer, the route. | 1 | 15 | 28 |
| **Total** | | **15 clicks** (was 12) | **180** | **388** |

Clicks: b0 now has one click inside it (the new name slipping through). b3 and b4 gain one click each. So 15 right-arrow presses, one per "(click)" in `SCRIPT.md`. **Timer:** the first press is now on b0 itself, so Alex presses **P** as Tarun starts speaking (P starts the timer when it is idle).

---

## 1. Screen by screen

Legend for storyboards: **order** = the order inside one click (equal numbers move together as one thing); kinds and durations are the helper's (section 3). Everything not listed under a click is already on screen when the click lands.

### b0. The question (navy title)

**One point:** A sanctions check matches names, so a company with a new name gets through.

**Keep:** title, "What you're looking at" (sanctions list explained), the checkpoint diagram, "Why it matters" (our person).
**Cut / move:** nothing leaves. The question "So what happens when names change?" becomes the last thing to appear.

| Click | What appears or moves | Kind, ms | Spoken (Tarun) |
|---|---|---|---|
| (screen open, no click) | Title, list, officer, upper branch "Company A, Order stopped", note "The check matches names" | none (opening screen) | "Picture a compliance officer ... But the check matches names." |
| **(click)** | order 0: the lower branch line draws from the fork to "Order ships" (accent). Move its arrowhead out of `marker-end` into its own small path so it does not show before the line arrives | draw 800 | "A new name isn't on the list yet, so the order ships." |
| | order 1: arrowhead, "A new name is not on the list yet", "Company B: new name, same buyer behind it", "Order ships" | fade 400 | |
| | order 2: "So what happens when names change?" | fade 400 | |

### b1. New routes

**One point:** After the invasion, chips kept reaching Russia, sent through countries that had not sent them before.

**Keep:** the timeline (three accent rows, two slate long-time senders), the invasion line, "Russia's own records here mostly start in 2022, so we checked a second source" (honesty line, as the dashed zone), **$13.5 million** (the second source).
**Cut / move:** "45 of 1,147" and its made-in caption -> drawer (`b1-e8` becomes `offscreen: true`; Q&A 1). It is a second idea (made elsewhere, passing through). Spoken "Kazakhstan, 18.3 million in 2022" -> dropped (already drawer `b1-e6`). Spoken per-country counts -> they stay as the bar labels on screen only.

| Click | What appears or moves | Kind, ms | Spoken |
|---|---|---|---|
| **(click)** arrive | Axis, country names and slate long-time senders are static. order 0: invasion line draws top to bottom, with its label | draw 500 (+ label fade, with) | "After Russia invaded Ukraine, chips kept arriving there, through new countries. In the shipment records, Kyrgyzstan, the UAE and Kazakhstan all start in April and May 2022." |
| | order 1: the three accent bars grow from their start dates | grow 800 (left), together | |
| | order 2: "1,147 / 2,041 / 715 shipments" labels and "New senders start in April and May 2022" | fade 400 | |
| **(click)** | order 0: dashed "Russia's own records here mostly start in 2022, so we checked a second source" zone | fade 500 | "Russia's own records here mostly start in 2022, so we checked a second source ... then 13.5 million dollars in 2023. Two sources, same shift." |
| | order 1: **$13.5 million** counts up from 0 (the jump from almost nothing is the point), caption with it | count 800 | |

### b2. New names

**One point:** The shipping companies change every few weeks; the flow of chips, and the buyer, stay. (One thrust: names churn, the need does not. This is the talk's title made visible.)

**Keep:** the river (Kyrgyz route), the blue total line, RM Design and Development as the one dark named band, **40 days**, the buyer micro-timeline with **2019 to 2025**.
**Cut / move:** "21 days" and the ELEM GROUP 18 days caption -> drawer (`b2-e2`, `b2-e1` offscreen; Q&A). They say "new", not "weeks". The four half-year brackets "1, 4, 12, 6" -> drawer (`b2-e5` offscreen): the lighting-up of the bands shows the churn without numbers. "Six of its new suppliers were later put on US lists" -> drawer (`b2-e14` offscreen): it is a lag fact, and b3 carries the lag.
**New idea line:** "The shipping companies change every few weeks. The flow of chips, and its buyer, stay."

| Click | What appears or moves | Kind, ms | Spoken |
|---|---|---|---|
| **(click)** arrive | order 0: the river as ONE flat slate silhouette (the total, no company bands yet) and the blue total line, revealed left to right like time passing | wipe 1200 (left), one group | "One route: Kyrgyzstan into Russia. The blue line is the flow of chips, month by month." |
| | order 1: "The flow: 1,147 shipments" | fade 400 | |
| **(click)** | order 0: the company bands appear one after another in the order they first shipped (RM Design first, dark; the rest grey), each covering its slice of the silhouette. Mark each band `data-light`, in first-month order | light 1100 | "Each band under it is a shipping company. Watch them come and go: a typical one lasted 40 days. The flow kept going." |
| | order 1: RM Design label and "Grey bands: other shipping companies, not named here" | fade 400 | |
| | order 2: **40 days** and caption | rise 500 | |
| **(click)** | order 0: the buyer's line draws from 2019 to 2025 (accent) | draw 900 | "And the buyer at the far end stays: one Russian buyer, 2019 to 2025, while its suppliers changed." |
| | order 1: the supplier segments under it, one after another ("its suppliers change") | light 600 | |
| | order 2: **2019 to 2025** and "But the buyer stays: Testkomplekt, in Russia." | rise 500 | |

### b3. The lag (rebuilt)

**One point:** Lists arrive late: by the time a firm is listed, it has usually moved on.

**Why v2 was unclear:** two ideas on one chart (the lag, and a listed buyer that kept receiving), five kinds of marks read at once (bars, record lines, ticks, dots, a separate row), eight date labels, and two big numbers about different things. The eye had no path.

**The one visual:** four rows on one time axis (2022 to the end of 2024; the range shrinks from mid-2025 because the Testkomplekt row is gone, so each month is wider). Each row tells the same three-beat story, revealed one beat per click: **active** (dark line: its shipment records) -> **listed, much later** (blue bar from first appearance to the listing tick) -> **already gone** (the stretch between its last record and its listing).

- Rows, top to bottom (name bold, role muted under it): ELEM GROUP, shipper, Kazakhstan; RM Design and Development, shipper, Kyrgyzstan (row 1.5x tall for its notes); STRELOI EKOMMERTS, buyer, Russia; ITIC LLC FZ, shipper, UAE.
- Dark record line per row: ELEM 12 Jun 2022 to 19 Sep 2023; STRELOI 12 Jun 2022 to 19 Sep 2023; ITIC 6 Mar 2023 to 26 Jan 2024 (all as v2). **RM Design: 21 Apr 2022 to 26 Jun 2023, its Kyrgyz-route records** (add `firstRecord: "2022-04-21"` to RM in `data/b3_lag.js`, with a comment: from `data/b2_river.js` series `rm.first`, evidence b2-e3 and b3-e6; keep `lastRecord` 2023-09-29 for the Turkey note). v2 drew no dark line for RM.
- Blue lag bar: accent tint with 1.5 px accent edge, from `start` (registration or first record, as v2) to `listed`. Label inside: "at least N months" (20, 16, 18, 15; ELEM corrected from 23 per LOG 13:12), unchanged. Listing tick: 3 px `--fg`, the word "listed" above the top row's tick only (the others read by analogy). **No month labels on the ticks** (exact dates stay in b3-e1 to b3-e4).
- "Already gone" gap: a 3 px bracket in `--fg` at 55% with end caps, at the record-line height, from each row's last record (RM: 26 Jun 2023) to its listing tick. One label, on the top row: "no records left when it was listed". RM row: "left this route 24 days before it was listed" (b3-e6), and, as ONE subordinate annotation in `--muted-fg` at 22 px right of RM's tick: the post-listing dots plus "then 40 records after listing, declared as leaving Turkey" (b3-e7; held for Alex: stays visible, now subordinate; it also shows "left the route" is not "stopped").
- The hatched "Records thin out after late 2023: dashed means less certain" zone stays from the first frame (honesty line; ELEM's and STRELOI's gaps sit in it).
- Right column narrows to one number: **4 of 5**, caption "listed shipping firms on the Kyrgyz and Kazakh routes had already left those routes when they were listed." Grid 9fr / 3fr.
- Idea: "Lists arrive late: by the time a firm is listed, it has usually moved on." Explainer: "Each row is one listed company. Dark line: its shipment records. Blue bar: from when it first appeared (registered, or first shipped) to the day it was listed." Why it matters (unchanged): "For the compliance officer: a clean screening result means 'not listed yet', not 'safe'."

**Cut / move:** the Testkomplekt row and **22 months** -> drawer "More in the data" (`b3-e10` becomes `offscreen: true`), presenter note "IF ASKED", and new Q&A 7 in `SCRIPT.md`. Reason: "a listing doesn't stop every buyer" is a different point (enforcement), and the compliance officer's screen would already flag a listed buyer; the buyer's persistence is carried by b2's "2019 to 2025" and b6's buyer row. "the longest wait" note -> dropped (the ELEM bar is visibly longest). Month labels on ticks -> drawer.

| Click | What appears or moves | Kind, ms | Spoken |
|---|---|---|---|
| **(click)** arrive | Static: axis, row names and roles, hatched zone with its label. order 0: the four dark record lines, revealed left to right as one time sweep | wipe 1000 (left), one group | "Four companies from these routes. The dark lines are their shipment records." |
| **(click)** | order 0: the four blue lag bars grow from first appearance to the listing date | grow 900 (left), together | "Governments did list them. But at least 15 to 20 months after they first appeared." |
| | order 1: listing ticks and the word "listed" | fade 400 | |
| | order 2: "at least N months" labels | fade 400 | |
| **(click)** | order 0: the four "already gone" gaps grow from each last record to its listing tick | grow 700 (left), together | "By then, most had moved on: 4 of 5 listed shippers had already left these routes. RM Design left its route 24 days before its listing. A clean screen means not listed yet, not safe." |
| | order 1: "no records left when it was listed", RM's "left this route 24 days before it was listed", and the subordinate Turkey note with its dots | fade 400 | |
| | order 2: **4 of 5** and caption | rise 500 | |

Narrow (phone): keep v2's row list; drop the Testkomplekt row; add "No records left when it was listed" to each row note.

### b4. The drone part (rebuilt)

**One point:** The exact chip model from a military drone was shipped into Russia months before any firm on its path was listed; whether these chips reached a weapon is not proven.

**Why v2 was unclear:** two diagrams (a five-box chain and a separate time ruler) told the same story twice, the ruler mixed shipment labels, listing labels and year labels on one line, and three big numbers competed with both.

**The one visual (chain and ruler merged, the separate ruler is cut):** a left column that says *what* (drone, the unproven link, the part) and a right field that says *when* (one lane per firm on a shared time axis). The shipper and buyer boxes of v2 become the lane labels.

- **Left column (about a quarter of the width), top to bottom:** Drone node (dashed outline, no fill, drone icon): "Shahed-136 drone", "part documented by GUR". Then a **dashed** vertical link (3 px, 6/5 dash) down to the part, and beside it the ONE big **Not proven** (about 6 vh, 600, in v2's dashed box style) with its caption "whether these chips reached a weapon. Parts can be resold, old stock or fake." (b4-e2). Then the part node (2 px accent border, chip icon): "THE PART", "Flight-control chip", `STM32F765VIT6` (mono), "Part number: the maker's code for one exact chip model." No maker name (held).
- **Right field:** time axis Jan 2022 to Dec 2024, year ticks 2022, 2023, 2024 along the bottom. Three lanes, label left of the lane (name bold, role muted): ACE ELECTRONIC, shipper, Hong Kong; JINMINGSHENG TECHNOLOGY, shipper, Hong Kong; OOO Onelek, buyer, Russia.
- **The part's link into time:** an accent connector from the part node's right edge that splits to the two shipment dots, labelled once in accent: "same part number in shipment records".
- **Shipments:** ACE lane dot at 26 Aug 2022 "100 pieces, Aug 2022" (b4-e3); Jinmingsheng lane dot at 30 Nov 2022 "22 pieces, Nov 2022" (b4-e4); Onelek lane: two rings at the same two dates, one label "received both". Never "122".
- **Shipped -> listed:** per lane, a 3 px bracket in `--fg` at 55% from the first dot to the lane's listing tick (Onelek 20 Jul 2023, b4-e10; ACE 6 Oct 2023, b4-e5; Jinmingsheng 1 May 2024, b4-e9). Each tick carries only the word "listed" (months in the drawer).
- **Numbers:** one big number, **11 to 17 months** (b4-e11), under the right field, caption "from each shipment to that firm's first listing." "100 + 22 pieces" is no longer a big number: the two dot labels carry it.
- Idea: "A military drone's exact chip model was shipped into Russia months before any firm on its path was listed." Explainer: "Ukraine's defence intelligence (GUR, a party to the war) publishes the parts it finds in Russian weapons. We searched shipment records for one exact part number." Why it matters (unchanged): "For the compliance officer: a part number is a clue that stays the same when a company changes its name."
- **"Not proven" stays unmistakable:** it is on screen from the first frame of the screen, on the dashed link it describes, at big-number size, and the link is never drawn solid. It is spoken at the end ("We can't prove ... and we say so"; never cut).

**Cut / move:** the separate time ruler (merged into the lanes); the shipper and buyer boxes (now lane labels); "100 + 22 pieces" as a big number (now dot labels, same evidence ids); the numbers row's "Not proven" (moved onto the link, same size); ACE's later listings stay drawer only (b4-e6 to b4-e8); Shreya AI-chip item stays drawer only (b4-e12).

| Click | What appears or moves | Kind, ms | Spoken |
|---|---|---|---|
| **(click)** arrive | Static: idea, explainer, drone node, part node. order 0: the dashed link, revealed top to bottom | wipe 600 (top) | "Ukraine's defence intelligence, a party to this war, documents this chip model inside a Shahed drone." |
| | order 1: **Not proven** and its caption (from here on, always on screen) | fade 400 | |
| **(click)** | order 0: the time axis and the three lane labels | fade 400 | "We searched shipment records for its exact part number: 100 pieces went into Russia in August 2022, 22 more in November, both from Hong Kong." |
| | order 1: the accent connector draws from the part to the two shipment dots | draw 700 | |
| | order 2: the records light up in date order: ACE dot and label, Onelek ring, Jinmingsheng dot and label, Onelek ring and "received both" | light 800 | |
| **(click)** | order 0: the three "shipped -> listed" brackets grow from each shipment to each listing | grow 900 (left), together | "Every firm on that path was listed later, 11 to 17 months after it shipped. We can't prove these chips reached a weapon, and we say so." |
| | order 1: the three ticks with "listed" | fade 400 | |
| | order 2: **11 to 17 months** and caption | rise 500 | |

Narrow (phone): drone, "Not proven", part, then a dated list per firm ("Aug 2022: 100 pieces. Listed Oct 2023."), then 11 to 17 months.

### b5. Blind spots

**One point:** Our data, and the screening tools, have blind spots, and we show where they are.

**Keep:** the map (hatched countries seen only through partners, its two-item key), the plate "Kyrgyzstan, Armenia, Hong Kong and 11 more: seen only through their partners", **81%** (the blind-spot line: "a route that seems to stop may be the data stopping"), **12 Jun 2024 / Caught** (a provider's flag called a listed Dubai shipper clean), "Why it matters: one screening tool is not enough".
**Cut / move:** "$13.5M not $27.1M / Fixed" -> drawer (`b5-e8` offscreen; Q&A spare). It is about our process, a second thrust. Iran oil plate and "Ships at sea" plate -> drawer (`b5-e3`, `b5-e4`, `b5-e5` offscreen): other tracks, not chips.
**New idea line:** "Our data has blind spots, and so do the screening tools. We show where they are."

| Click | What appears or moves | Kind, ms | Spoken |
|---|---|---|---|
| **(click)** arrive | Static: base map and key. order 0: the hatched countries and their plate | fade 600, together | "Our data has blind spots, and we show them. Hatched countries ... after late 2023." |
| | order 1: **81%** and caption | rise 500 | |
| **(click)** | order 0: **12 Jun 2024 / Caught** and caption | rise 500 | "Screening tools have blind spots too ... One screening tool is not enough." |

### b6. What to track (navy title)

**One point:** Track what doesn't change: the product, the buyer, the route.

**Keep all** (it is already one point). No cuts.

| Click | What appears or moves | Kind, ms | Spoken |
|---|---|---|---|
| **(click)** arrive | Static: headline, the three words, explainer, axis, "Lists arrive" band, thanks. order 0: the four persistence bars revealed left to right by one moving edge: the company-name bar ends at weeks, the route, buyer and product bars run on past the "Lists arrive" band | wipe 1200 (left), one group | "Lists follow names. Evaders change names. So track what doesn't change: the product, the buyer, the route. Every lead links to its source. Leads, not verdicts. Thank you." |
| | order 1: "track these" bracket and "lists match this" | fade 400 | |

---

## 2. Script

`SCRIPT.md` is rewritten to this storyboard: 15 clicks, 388 spoken words (limit 430). Per-screen seconds in the `register()` calls change to b0 18, b1 27, b2 27, b3 30, b4 32, b5 31, b6 15 (total stays 180). Each beat's `stepNotes` and `stepLabels` must match the script word for word (presenter view reads them).

---

## 3. The motion helper (built, in `shell.js` and `app.css`)

Full reference: the MOTION block at the top of `shell.js`. In short:

- **When it plays:** only on a forward click. Arriving on a screen plays its step-1 moves after the 240 ms crossfade; a click inside a screen plays that step's moves. Back, jumps (1 to 7, Home, rail, hash), redraws, `?shot=1`, narrow screens and `prefers-reduced-motion` show the finished state instantly. A click during a move finishes it at once, then applies the next click. A synced presenter window plays the same moves when the other window moves forward by one click.
- **How it plays:** one thing at a time: moves run in `data-anim-order`; equal order numbers move together as one thing. Durations clamped to 400 to 1200 ms, `var(--ease-out)`. Web Animations API, no libraries; transform, opacity, clip-path and stroke-dashoffset only, so a laptop driving a projector stays smooth.
- **Declarative (preferred):** `data-reveal="k"` (the step), `data-anim="fade|rise|draw|wipe|grow|count|light"`, `data-anim-order="n"`, `data-anim-dur="ms"`, `data-anim-from="left|right|top|bottom"` (wipe, grow) or a start number (count).
- **Imperative:** `ctx.reveal(el, step, kind, {order, dur, from})` sets those attributes (handy for SVG built in JS); `ctx.animate(el, kind, {dur, from, with, keyframes})` queues a move from `onStep` (a no-op unless `ctx.entering`); `ctx.entering`, `ctx.motion`; `ctx.refresh()` after a beat redraws its own DOM (for example in a ResizeObserver), so hidden layers stay hidden.
- **Kind rules:** `draw` is for solid strokes (it borrows `stroke-dasharray`); dashed lines, areas and groups use `wipe`. `grow` and `rise` are not for SVG elements with a `transform` attribute (wrap them in a `<g>`) and `grow` is not for text. `count` animates the first number in the text and always ends on the exact original text. `light` shows `[data-light]` children one after another.
- **Tested:** `_dev/motion_selftest.html` drives every kind through arrive, click, click-during-a-move, back, reduced motion and `?shot=1` (headless Chrome: `--virtual-time-budget=9000 --dump-dom`). Headless Chrome does not advance animation frames, so the helper also ends every move on a timer; smoothness itself still needs one look on the real laptop.

**Beat-file rule:** v3 beats use `data-reveal` / `data-anim` instead of their own step classes (`b3-at-1`, `data-step` on `.b4-root`, and so on), so the shell owns hiding, showing and timing in one place. Beats that redraw on resize call `ctx.refresh()` afterwards.

---

## 4. Build checklist

1. b3 and b4: rebuild to section 1 (largest change). b0, b1, b2, b5, b6: add the attributes, apply the cuts, update idea lines where given.
2. Data: `data/b3_lag.js` RM `firstRecord: "2022-04-21"` (commented source) and `range` end `2024-12-31`; `data/b4_chain.js` numbers drop "100 + 22" and "Not proven" from the numbers row, add lane layout fields as needed.
3. Evidence: set `offscreen: true` on b1-e8, b2-e1, b2-e2, b2-e5, b2-e14, b3-e10, b5-e3, b5-e4, b5-e5, b5-e8. Ids never change; nothing is deleted.
4. `register()`: new `steps` (b0 2, b3 3, b4 3), `seconds` (section 2), `stepNotes` and `stepLabels` from `SCRIPT.md`.
5. README: key table ("15 clicks"), the P-to-start-timer note, "What changed in v3", the screen table's "one idea" column from section 0.
6. Screenshots: `shots/v3_<beat>_1920.png` and `_1280.png` with `?shot=1` (final state), both themes checked.

## 5. Hand-off checks (v2 checks still apply)

1. 15 right-arrow presses from Home land exactly on the 15 "(click)"s in `SCRIPT.md`; every move in section 1 plays on its click and on no other.
2. `?shot=1`, `#bN` jumps, Left arrow, and reduced motion (DevTools > Rendering > prefers-reduced-motion) show finished slides, never a half-drawn one.
3. Pressing right during a move finishes it and moves on; nothing is left hidden.
4. b4: "Not proven" visible in every state of the screen, including step 1 and the narrow layout.
5. b3: the RM Design Turkey note is visible in the final state; wording "left", never "stopped".
6. Zero em or en dashes; no internal codes or file names on main screens; no red; only listed companies named; GUR called a party to the war; no "122".
7. Every on-screen number is on a v2 screen or in the v2 drawer, and opens its evidence item.
8. One look on the demo laptop at 1920x1080 with the projector: motion smooth, nothing flickers.

## 6. For Alex to rule on (my calls, unruled)

- b3: Testkomplekt's "22 months after its own listing" leaves the main screens (drawer, Q&A, presenter note). Alternative: a single line on b6's buyer row.
- b4: chain and ruler merged into one diagram rather than one of them deleted (the unproven drone link needs the chain's left end; the timing needs the ruler).
- b1 "45 of 1,147", b2 "21 days" and "1, 4, 12, 6", b5 "Fixed" and the Iran and ships plates move to the drawer.
- b0 gains a click (the new name slipping through), so the timer starts with P.
- Held decisions unchanged: STMicroelectronics unnamed; OOO FENIKS stays "a Russian firm" (drawer); RM Design's post-listing Turkey records stay visible on b3.
