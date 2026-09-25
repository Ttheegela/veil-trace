> **ALEX, 12:52 (v3 direction, overrides anything below for the lag slide):** "On the lag there is too much info too flat and it is hard for the eye to focus." So: the lag slide needs a clear focal point and strong hierarchy. Lead with ONE firm, large and highlighted, animated step by step; the other firms enter afterwards smaller and muted (or only as a count). Cut labels hard (move them to the drawer), fewer lines, more empty space, one accent colour on the one thing that matters (the gap between first appearance and listing).

# Design spec: "Names change in weeks. The need doesn't."

*Fri 25 Sept 2026, written for the redesign pass after Alex's direction at 11:44. Claude's suggestion, unruled by Alex.*
*Redesigners follow this exactly. Where this spec and a beat file disagree, this spec wins. Where this spec and `LOG_2026-09-25.md` disagree on a number, the log wins: stop and flag it.*

**v3 note:** `V3_PLAN.md` supersedes this spec where they differ. The lag range is 15 to 20 months everywhere (LOG 13:12 CORRECTED: ELEM GROUP's first listing is the US Commerce Entity List, 7 Dec 2023).

**v2 note (25 Sep, after the reader, fact and design reviews):** the beat files now differ from this spec on purpose in a few places (b1 wording "new sending countries", b2 band colours and no Rama Group label, b3 without the "15 to 20 months" big number, b4 with one "Not proven", b5 shorter "Why it matters", b6 row order). `README.md`, "What changed in v2", lists them. For those points the beat files win.

**Alex's direction (11:44):** "It needs a lot of theming and UX work. The data needs to be clearer. It needs to be understandable to a person who does not know the field: between Popular Science and Scientific American reading level. Concepts first, and details support them."

**What that means in practice:** every screen teaches one idea to a smart person who has never heard of sanctions. The picture proves the idea. Numbers are few and big. Everything an expert would want (sources, record counts, dates, caveats) is one key away, in the evidence drawer.

---

## 0. What is wrong today (from the current screenshots)

| Screen | Problem |
|---|---|
| All | Too many numbers at once (b1 shows 20+, b2 shows 30+, b3 shows 25+). Nothing tells the viewer where to look first. |
| All | Text as small as 16 to 18 px at 1920x1080 (chart ticks, footers, legends). Unreadable at 4 m. |
| All | Every number has a dotted underline, so the screen looks like a page of links. |
| All | Jargon with no explanation on the main screen: "OFAC", "Comtrade", "SOURCE 1", "HS", "records", "Entity List", "US Commerce". |
| All | Cards inside cards; legends instead of labels on the chart. |
| b1 | Two heroes plus a strip; the reader has to compare three charts to get one idea. |
| b2 | Two river charts, three stat cards and a buyer chart: four ideas on one screen. The purple firm reads as "the bad one". |
| b3 | Seven companies and five kinds of marks; the legend is needed to read it. |
| b4 | Good bones. Four listing dates per firm and an unrelated AI-chip card dilute it. |
| b5 | Map plus three cards plus a footnote; no single idea. |
| b0, b6 | Readable, but b6 says "the buyer and the part" in one box and "the product, the buyer, the route" in another. |
| Shell | The script has 12 clicks but the shell has only 6 screen changes: mid-screen "(click)"s would jump to the next screen. There is no in-screen reveal. |
| Shell | Progress bar is a 4 px strip with no names; timer shows three numbers to the audience. |

---

## 1. The reading order (every screen, no exceptions)

Every content screen is built from the same six parts, in this order, top to bottom (phone) or top to bottom then left to right (projector):

| # | Part | What it is | Rules |
|---|---|---|---|
| a | **THE IDEA** | One plain sentence, large. The one thing the viewer should remember. | 12 to 16 words. At most 2 lines at 1920x1080. No numbers unless the number *is* the idea (b3). No acronyms. |
| b | **What you're looking at** | One line that explains the picture: what a bar, band, dot or line means. | Starts with the small label "What you're looking at". One sentence, at most 25 words. Explains the first jargon term on the screen if the picture needs it. |
| c | **The hero visual** | ONE chart or diagram that proves the idea. | Annotated directly on the chart: 2 to 3 callouts, each a short phrase with a leader line. Direct labels instead of a legend. No card border around it. |
| d | **Big numbers** | 2 to 3 numbers, each with a plain caption. | Chosen from the verified log only (listed per screen below). Caption says what the number counts, in plain words, at most 20 words. |
| e | **Why it matters** | One line tied to the compliance officer. | Starts with the small label "Why it matters". Starts "For the compliance officer:" or names her. |
| f | **Everything else** | Sources, record counts, dates, caveats, company details, method notes. | In the evidence drawer (key E). Nothing is deleted: moved numbers keep their evidence items. |

Title screens (b0 and b6) use the same order, but the "big numbers" slot holds three big words or a short statement instead of numbers (spelled out below).

**Honesty lines that must stay visible on the main screen** (they are part of the idea, not caveats):
- b1: "Russia's own records here mostly start in 2022", as a chart annotation.
- b3: "at least" on every lag number, and the dashed "records thin out" zone.
- b4: "Not proven" as one of the big elements.
- b5: the whole screen is the blind spots.
- b6: "Leads, not verdicts."
- Every screen: the persistent footer "Leads, not findings." (see Visual system, chrome).

---

## 2. The seven screens

Step names (used in the progress rail, the kicker and the drawer title):

| Screen | Step name | Seconds | Reveal steps (clicks inside the screen) |
|---|---|---|---|
| b0 | The question | 15 | 1 |
| b1 | New routes | 35 | 2 |
| b2 | New names | 35 | 3 |
| b3 | The lag | 30 | 2 |
| b4 | The drone part | 30 | 2 |
| b5 | Blind spots | 25 | 2 |
| b6 | What to track | 10 | 1 |

Reveal steps match the "(click)"s in `SCRIPT.md`: the first click on a screen arrives on it (step 1); later clicks reveal the next layer. Step 1 must already make sense on its own.

Each number below is followed by its evidence id in brackets. Redesigners must wire each on-screen number to that id.

---

### b0. The question (navy title screen)

**Idea (a):** Names change in weeks. The need doesn't.
(Keep the current split: "Names change in weeks." in hero foreground, "The need doesn't." in the gradient. This is one of only two gradient uses in the demo.)

**What you're looking at (b):** A sanctions list names companies that nobody may trade with. It only works when the person checking recognizes the name.

**Hero visual (c): the checkpoint diagram** (adapted from Diagram 1 in `build/explainer/`, simplified to three nodes).
- Type: a left-to-right flow diagram, three nodes and a fork.
- Node 1: a document icon, "Government sanctions list", with one line inside it reading "Company A".
- Node 2: a person icon, "Compliance officer checks every order against the list".
- Fork: upper branch "Company A" ending in "Order stopped" (solid line, neutral, a small stop bar, not red). Lower branch "Company B: new name, same buyer behind it" ending in "Order ships" (the lower branch in accent).
- Annotations (2): on the fork, "The check matches names"; on the lower branch, "A new name is not on the list yet".

**Big words (d):** none. Instead, the question on its own line, large (text-4 size): "So what happens when names change?"

**Why it matters (e):** Our person: a compliance officer at a chip distributor, deciding whether an order ships.
(Keep the current "The person" tag style; it becomes the "Why it matters" line for this screen.)

**Moves off screen (f):** "Sanctions and evasion track" (goes to b6 credits). Drawer for b0 shows the glossary entries for this screen (sanctions list, compliance officer, listed) under "Words used here".

---

### b1. New routes

**Idea (a):** After Russia invaded Ukraine, computer chips kept arriving there, through new doors.

**What you're looking at (b):** Each bar shows when customs records name a country as the place a chip shipment left for Russia. The country is what the paperwork declares, not a traced route.

**Hero visual (c): "doors opening" timeline.**
- Type: horizontal timeline bars, one row per country.
- X axis: years 2019 to 2024 (ticks at each 1 January, labels "2019" to "2024" only).
- Y axis: no axis; five rows with direct labels on the left.
  - Top group, labeled directly above it "New doors": Kyrgyzstan, UAE, Kazakhstan. Bars in accent, from first to last record (Kyrgyzstan 21 Apr 2022 to 29 Dec 2023; UAE 5 Apr 2022 to 30 Dec 2023; Kazakhstan 22 May 2022 to 3 Aug 2023) [b1-e1, b1-e2, b1-e3].
  - Direct label at each accent bar's right end: "1,147 shipments", "2,041 shipments", "715 shipments" [b1-e1, b1-e2, b1-e3]. Directly under the first one only: "(counts of shipments, not dollar values)".
  - Bottom group, labeled "Old doors, for comparison": Germany, Turkey. Bars in slate, from 2019 onward. No counts on screen.
- Annotations (3):
  1. Vertical line at 24 Feb 2022, labeled at its top "24 Feb 2022: Russia invades Ukraine" [b1-e10].
  2. At the left ends of the accent bars: "New doors open in April and May 2022".
  3. A dashed (uncertain) zone over 2019 to 2021 on the three new rows only, labeled "Russia's own records here mostly start in 2022, so we checked a second source" with a short arrow toward big number 1 [b1-e9].
- Reveal: step 1 shows the chart with annotations 1 and 2. Step 2 adds annotation 3 and the big numbers.

**Big numbers (d), revealed at step 2:**
1. **$13.5 million** [b1-e5]. Caption: "Kyrgyzstan's own reported chip exports to Russia in 2023, up from almost nothing in 2019 to 2021. A second, independent source shows the same jump."
2. **45 of 1,147** [b1-e8]. Caption: "Kyrgyz shipments that say the chips were made in Kyrgyzstan. The rest were made mostly in China, Malaysia and Taiwan."
(Kazakhstan's $18.3 million in 2022 [b1-e6] is spoken and goes in the drawer; it is not a third big number, to keep the screen calm. It is the first line to cut per the script's cut list.)

**Why it matters (e):** For the compliance officer: an order headed to a country that never used to buy these chips is worth a second look.

**Moves off screen (f):** Germany and Turkey counts (32,595; 21,537) [b1-e4]; Kazakhstan and Armenia bar charts (all values stay in b1-e6, b1-e7); the made-in breakdown strip (China 419, Malaysia 196 ...) [b1-e8]; "SOURCE 1 / SOURCE 2" labels; "Sayari", "UN Comtrade" names (drawer); first and last record dates; the footnote. Armenia stays Q&A only.

---

### b2. New names

**Idea (a):** The companies doing the shipping change every few weeks. The flow of chips keeps going.

**What you're looking at (b):** Each band is one company's monthly chip shipments from Kyrgyzstan to Russia. Stacked together, they show the total flow.

**Hero visual (c): "same river, new boats".** Kyrgyz route only.
- Type: stacked area chart by month, one band per shipping company.
- X axis: months, Apr 2022 to Dec 2023; tick labels at Jul 2022, Jan 2023, Jul 2023 only.
- Y axis: shipments per month; two light gridlines, labeled "100" and "200", with the axis title "shipments a month" written once at the top of the axis.
- Bands: every company in a slate shade (alternating 3 lightness steps, thin background-colored separators between bands). No firm gets its own hue. RM Design and Development and Rama Group (both on official lists) carry direct labels inside their bands; unlisted firms are unlabeled.
- The top edge of the stack (the total flow) is drawn as a 3 px accent line. This is the one accent on the screen: the need.
- Annotations (3):
  1. On the accent line: "The flow: 1,147 shipments" [b2-e3].
  2. Four brackets along the top, one per half-year of the route, labeled "1 company", "4", "12", "6" [b2-e5]. Half-year boundaries come from the data file; do not guess them.
  3. On the grey bands: "Grey: firms not on any list, not named".
- Reveal: step 1 shows the chart with annotations 1 and 3 and big number 1. Step 2 adds annotation 2 and big number 2. Step 3 adds big number 3.

**Big numbers (d):**
1. **21 days** [b2-e2]. Caption: "after the invasion, RM Design and Development was registered in Bishkek. ELEM GROUP, in Kazakhstan: 18 days." [b2-e1]
2. **40 days** [b2-e6]. Caption: "how long a typical company lasted on this route."
3. **2019 to 2025** [b2-e12], revealed at step 3. Caption: "One buyer kept the same company record for six years, while its suppliers changed. All six of its new suppliers were later put on US lists." [b2-e14]
   Under this number, a micro-timeline (one thin line, 2019 to 2025, about 400 px wide): the buyer as a continuous accent line; below it four short slate segments for the supplier groups, labeled only "suppliers change". No names, no dates on screen.

Wording check on "six years": 2019 to 2025 spans parts of seven calendar years (11 Jan 2019 to 10 Mar 2025, about 6 years and 2 months). "Six years" is true; do not write "seven".

**Why it matters (e):** For the compliance officer: a seller's name that is a few weeks old tells you little. The buyer behind it tells you more.

**Moves off screen (f):** the Kazakhstan river chart and its relay (93% in 118 days) [b2-e4, b2-e7]; listing pins for RM Design, ELEM GROUP, Rama Group (the lag is b3's job) [b2-e8, b2-e9, b2-e10]; shipments per half-year 186, 279, 569, 113 [b2-e5]; "6 of 14 on one day only" [b2-e6]; the buyer's supplier chart, supplier names, Western distributors, unlisted suppliers, Treasury release [b2-e13 to b2-e18]; the colour legend.

---

### b3. The lag

**Idea (a):** Governments did list these companies, but 15 to 20 months after they first appeared.

**What you're looking at (b):** Each bar runs from a company's first sign in the shipment records to the day a government put it on a sanctions list.

**Hero visual (c): lag bars.**
- Type: horizontal range bars on a shared time axis (a Gantt-style timeline).
- X axis: 2022 to 2025, year ticks only.
- Rows (4), direct labels on the left in two lines: name, then role and place in plain words:
  - ELEM GROUP, "shipper, Kazakhstan" [b3-e1]
  - RM Design and Development, "shipper, Kyrgyzstan" [b3-e2]
  - STRELOI EKOMMERTS, "buyer, Russia" [b3-e3]
  - ITIC LLC FZ, "shipper, UAE" [b3-e4]
- Each bar: accent tint fill from first sign to listing; a solid dark line under it for the stretch with shipment records; a vertical tick at the listing date with the label "listed Feb 2024" etc. (month and year only). Inside each bar: "at least 20 months" / "at least 16 months" / "at least 18 months" / "at least 15 months".
- A dashed-edged, lightly hatched zone from 1 Oct 2023 onward across all rows [b3-e11].
- RM Design's post-listing records stay exactly as they are today: dots after its listing tick with the label "25+ shipments after listing, leaving Turkey" [b3-e7]. (Decision held for Alex.)
- Annotations (3):
  1. On the ELEM GROUP bar: "at least 20 months" is the largest label, set bolder; leader note "the longest wait".
  2. On the gap between RM Design's last Kyrgyz record and its listing: "left this route 24 days before it was listed" [b3-e6].
  3. On the hatched zone: "Records thin out after late 2023: dashed means less certain" [b3-e11].
- Reveal at step 2: a fifth row below a divider, "Testkomplekt, the buyer from the last screen", showing its listing tick (May 2023) and dots continuing to Mar 2025, labeled "still receiving shipments 22 months later" [b3-e10].

**Big numbers (d):**
1. **15 to 20 months** [b3-e5]. Caption: "from a company's first appearance to its listing. At least: it may have started earlier."
2. **4 of 5** [b3-e6]. Caption: "listed shipping firms on the Kyrgyz and Kazakh routes had already stopped before they were listed."
3. **22 months** [b3-e10], revealed at step 2. Caption: "how long the listed buyer kept receiving shipments after its own US listing, at least."

**Why it matters (e):** For the compliance officer: a clean screening result means "not listed yet", not "safe".

**Moves off screen (f):** Enkor Grupp and Titan-Micro rows and their counts [b3-e8, b3-e9]; exact day dates (month and year stay on the chart); "Registered Mar 2022" and "First record" labels (drawer); STRELOI's sister firm; the legend row; the source footer; the 81% figure (b5 owns it). The 240-pair back-test stays Q&A only.

---

### b4. The drone part

**Idea (a):** The exact chip model found in a military drone was shipped into Russia months before any seller was listed.

**What you're looking at (b):** Ukraine's defence intelligence (GUR, a party to the war) publishes the parts it finds in Russian weapons. We searched shipment records for one of those part numbers.

**Hero visual (c): the chain, with a time ruler.**
- Type: left-to-right chain diagram (five nodes) sitting on a shared time ruler.
- Nodes, left to right:
  1. **Drone**: "Shahed-136 drone. Part documented by GUR, Ukraine's defence intelligence, a party to the war." [b4-e1]
  2. **The part**: "Flight-control chip (a microcontroller)" with the part number STM32F765VIT6 in mono below it. No maker name. (Decision held: STMicroelectronics stays unnamed.)
  3. **Shipper 1**: "ACE ELECTRONIC, Hong Kong" [b4-e3].
  4. **Shipper 2**: "JINMINGSHENG TECHNOLOGY, Hong Kong" [b4-e4].
  5. **Buyer**: "OOO Onelek, Russia".
- Links: node 1 to node 2 is a **dashed** line with the label "not proven" set on it in large type. Node 2 to the shippers is a solid line labeled "same part number in shipment records". Shippers to buyer are solid arrows.
- Time ruler under the shippers and buyer, Jan 2022 to Dec 2025, year ticks only: two dots for the shipments (Aug 2022, Nov 2022) and a small "listed" tick under each firm's first listing (Onelek Jul 2023, ACE Oct 2023, Jinmingsheng May 2024) [b4-e10, b4-e5, b4-e9].
- Annotations (3):
  1. On the dashed link: "not proven" (this is also big element 3).
  2. On the ruler, a bracket from the shipment dots to the listing ticks: "shipped first, listed later".
  3. On node 2: "The part number is the maker's code for this exact chip model."
- Reveal: step 1 shows nodes 1 to 5 and the part-number link. Step 2 adds the time ruler, the listing ticks and big number 2.

**Big numbers (d):**
1. **100 + 22 pieces** [b4-e3, b4-e4]. Caption: "chips with this exact part number, in two shipments from Hong Kong to one Russian buyer, Aug and Nov 2022."
2. **11 to 17 months** [b4-e11], step 2. Caption: "from each shipment to the first time each firm was put on a sanctions list."
3. **Not proven** [b4-e2]. Caption: "whether these chips reached a weapon. Parts can be resold, old stock or fake. We say so."

**Why it matters (e):** For the compliance officer: a part number on an order is a clue that does not change when a company changes its name.

**Moves off screen (f):** ACE's four listings (US Commerce 6 Oct 2023, US Treasury 30 Oct 2024, UK 24 Feb 2025, EU 18 Jul 2025): only the first stays as a tick [b4-e5 to b4-e8]; Jinmingsheng and Onelek listing bodies (the tick label says only "listed") [b4-e9, b4-e10]; the Shreya Life Sciences AI-chip card (drawer item, flagged off-screen; spoken only "IF TIME") [b4-e12]; the 2023-02-08 generic record note [b4-e3].

---

### b5. Blind spots

**Idea (a):** Our data has blind spots. We show where they are, and we check our own work.

**What you're looking at (b):** Hatched countries keep no trade records of their own in our main data source. We see them only through the records of the countries they trade with.

**Hero visual (c): the blind-spot map** (keep the current projection and the God's Eye View callout style; credit stays in the drawer).
- Type: choropleth map of Europe, Africa and Asia, three states.
- States: countries with their own trade records in slate; countries seen only through partners hatched in accent (this is the screen's one accent); countries not in our data in the lightest neutral.
- No legend row. The hatched state is explained by annotation 1 and by the explainer line; the other two states get a two-item key in the map's bottom-left corner (text 22 px).
- Annotations (3), as callout plates:
  1. "Kyrgyzstan, Armenia, Hong Kong and 11 more: seen only through their partners" (one plate with three leader lines, one per named place) [b5-e1].
  2. "Iran's oil relabelling: not visible in our data" [b5-e3, b5-e4].
  3. "Ships at sea: no position data" (dashed plate, placed in the ocean) [b5-e5].
- Reveal: step 1 shows the map and big number 1. Step 2 adds big numbers 2 and 3 (what our checks caught), matching the script's second click ("We built a skeptic into the team").

**Big numbers (d):**
1. **81%** [b5-e6]. Caption: "of chip shipment records into Russia come from Russia's own customs data, which thins out after late 2023. A route that seems to stop may be the data stopping."
2. **$27.1M to $13.5M** [b5-e8], step 2, with a small label "Fixed". Caption: "A total we had counted twice. Our skeptic, a separate checker that redoes every number, caught it."
3. **12 Jun 2024** [b5-e7], step 2, with a small label "Caught". Caption: "the day a Dubai chip shipper joined the US Treasury sanctions list. A data provider's flag still called it clean."

**Why it matters (e):** For the compliance officer: one screening tool is not enough. A Russian firm with the same tax and registration numbers as a UK-listed company still screens clean. [b5-e9]
(Decision held: the firm stays "a Russian firm", unnamed. This keeps it on the main screen in the same words.)

**Moves off screen (f):** ITIC's name and list details [b5-e7]; the "77 own / 14 partners" counts [b5-e2]; Iran shipment numbers (245; Uzbekistan 133; Turkey 110) [b5-e3]; tanker names and ship IDs [b5-e5]; the other catches (Sinno's date, "former" ownership, the Turkish record) as a drawer item under "More in the data"; the LLC Phoenix identifiers [b5-e9]; map credits [b5-e10].

---

### b6. What to track (navy title screen)

**Idea (a):** Lists follow names. Evaders change names. Track what doesn't change: the product, the buyer, the route.
("Lists follow names. Evaders change names." in hero foreground; "Track what doesn't change:" in the gradient. The second and last gradient use.)

**What you're looking at (b):** How long each thing stayed the same in our data, on a scale from one week to ten years.

**Hero visual (c): the persistence scale** (adapted from Diagram 3, `build/diagrams/3_persistence.svg`).
- Type: horizontal bars on a logarithmic time axis.
- X axis: 1 week, 1 month, 6 months, 1 year, 2 years, 5 years, 10 years (log scale; axis title "how long it stayed the same").
- Rows, top to bottom:
  - **Company name** (slate): "weeks: a typical firm lasted 40 days" [b6 evidence, from b2-e6].
  - **Route** (accent): "months: Kyrgyzstan route, Apr 2022 through 2023" [from b1-e1].
  - **Buyer** (accent): "years: one buyer record, 2019 to 2025" [from b2-e12].
  - **Product** (accent): "years: the same chip families before and after 2022" [new item, log row 10:51, "part as anchor", verified].
- One vertical marker across all rows: "Lists arrive: 15 to 20 months after a firm appears" [from b3-e5].
- Annotations: the three accent rows are bracketed on the right with "track these"; the name row gets "lists match this".

**Big words (d):** the three tracked things as large chips, in this order and exact wording: **the product**, **the buyer**, **the route**.

**Why it matters (e):** Tomorrow, a chip distributor's compliance officer screens the product, the buyer, the route, not just the seller's name. Every lead links to its source. Leads, not verdicts.

**Thanks (stays on screen, one line):** Thank you, Sayari, Tradeverifyd and Microsoft.

**Moves off screen (f):** the full data and licence credits paragraph (drawer for b6, and README). Add evidence items to b6 (its list is empty today): copies of b2-e6, b1-e1, b2-e12, b3-e5 with new ids b6-e1 to b6-e4, plus b6-e5 for the product row (source: log row 10:51, part as anchor, check "verified"), plus b6-e6 for the credits.

**Close wording, aligned everywhere (required):** use exactly "the product, the buyer, the route". Replace every "the buyer and the part" / "the buyer and the part number":
- `beats/b6_close.js`: the "Tomorrow" box and the notes.
- `SCRIPT.md` b6 spoken line. New line (31 words, 1 over the old 27; covered by the script's slack): "Lists follow names. Evaders change names. So track what doesn't change: the product, the buyer, the route. Every lead links to its source. Leads, not verdicts. Thank you."
- `SCRIPT.md` Q&A 4: "Screen the product, the buyer and the route, not just the seller's name."
- Update the word-count table in `SCRIPT.md` for b6.

---

## 3. Visual system

### 3.1 Look and tokens
- The look is the team's corporate theme, `hackathon-prep/day_kit/looks/corporate` (`tokens.css` here is an exact copy). Read its `STYLE_GUIDE.md` and the launch `STYLE_GUIDE.md` it points to.
- Only tokens: no raw hex, no font-family by hand, no radius by hand. In SVG and canvas, read colours with `ctx.cssVar('--token')`, which resolves `light-dark()` for the current theme.
- Font: IBM Plex Sans (embedded). Mono (`--font-mono`) only for the part number and the drawer's receipt lines.

### 3.2 Projector type scale (1920x1080, readable at 4 m)
Assumption: a projected image about 2.5 to 3 m wide, farthest viewer at 4 m, so 1 px is about 1.5 mm on the wall. A 22 px letter is then about 3 cm tall, the practical floor for reading at 4 m.

Sizes are set in `vh` so 1280x720 scales down in proportion (1 vh = 10.8 px at 1080). Define these once in `app.css` as custom properties and use only them.

| Role | Size at 1080 | CSS | Weight / line height |
|---|---|---|---|
| Title-screen idea (b0, b6) | 104 px | `--s-hero: 9.6vh` | display 600, 1.02 |
| Idea (a) | 68 px | `--s-idea: 6.3vh` | display 600, 1.08, tracking -0.02em |
| Big number (d) | 104 px | `--s-num: 9.6vh` | display 600, 1.0, tabular figures |
| Big number unit ("months", "pieces") | 44 px | `--s-unit: 4.1vh` | 500 |
| Question line (b0), big words (b6) | 44 px | `--s-sub: 4.1vh` | 600 |
| Explainer (b), why it matters (e) | 30 px | `--s-line: 2.8vh` | 400, 1.3 |
| Body, number captions | 28 px | `--s-body: 2.6vh` | 400, 1.3 |
| Chart annotations | 26 px | `--s-note: 2.4vh` | 500, 1.25 |
| Chart direct labels | 24 px | `--s-label: 2.25vh` | 500 |
| Axis ticks, small labels ("What you're looking at"), footer | 22 px | `--s-min: 2.05vh` | 500; labels in caps, tracking .08em |
| Chrome (step rail, timer, E pill) | 20 px | `--s-chrome: 1.85vh` | 500 |

Hard floor: **nothing on the main screen smaller than 22 px** at 1920x1080 except the chrome (20 px). The drawer and presenter notes are read up close and may use 18 px (`--text-2`) and up.

### 3.3 Spacing grid and layout
- Base unit 8 px (0.74 vh). Allowed steps: 8, 16, 24, 32, 48, 64, 96 px. Use `calc(var(--u) * n)` with `--u: .74vh`.
- Page margins: 96 px left and right at 1920 (5vw); 16 px on a phone.
- 12-column grid, 32 px gutters.
- Content screen template (1920x1080):

| Zone | Height | Columns |
|---|---|---|
| Chrome top (step rail) | 56 px | full |
| Idea (a) | up to 2 lines | columns 1 to 10 |
| Explainer (b) | 1 line, 16 px below the idea | columns 1 to 10 |
| Hero (c) + numbers (d) | the rest, about 560 px, 32 px below the explainer | hero columns 1 to 8, numbers columns 9 to 12, stacked with 48 px between |
| Why it matters (e) | 1 line, 32 px below, with a 1 px hairline above | full |
| Chrome bottom | 48 px | "Leads, not findings." left, E pill right |

- b4's chain needs width: hero spans columns 1 to 12 and the numbers sit in one row of three under it.
- Title screens (b0, b6): single column, columns 1 to 9, content vertically centred.
- No boxes around the hero. At most one level of containment anywhere (a number card may have a tint; nothing nests inside it).

### 3.4 Colour: navy, slate, blue, used calmly
- **Navy** (`--hero-bg`): title screens b0 and b6 only, in both light and dark modes.
- **Page** (`--bg`), **text** (`--fg`), **secondary text** (`--muted-fg`).
- **Slate** for all data that is context: `color-mix(in oklab, var(--fg) 28%, var(--bg))` and two lighter steps (18%, 12%) for stacked bands.
- **Blue** (`--accent`) is the ONE thing to look at on each screen. One accent per screen:

| Screen | The accent marks |
|---|---|
| b0 | "The need doesn't." (gradient) and the lower "order ships" branch |
| b1 | the three new-route bars |
| b2 | the total-flow line (the need), and the buyer's micro-timeline |
| b3 | the lag bars (time before any list named them) |
| b4 | the part-number link and the part node |
| b5 | the hatched blind-spot countries |
| b6 | "Track what doesn't change:" (gradient) and the three tracked rows |

- The gradient (`--accent-gradient`, blue to teal) appears on b0 and b6 only, one phrase each. `--accent-2` never on its own.
- **No red for guilt.** `--danger` is not used in any beat. Listings are shown as a neutral tick in `--fg` with the word "listed". Records after a listing are `--fg` dots, not warning colours.
- `--warning` (amber) only for the timer when over budget. `--positive` (green) only in the drawer's "Verified" badge.
- Contrast: all text AA against its background in both themes; check the slate bands carry no text below 4.5:1 (put labels outside light bands).

### 3.5 Chart style
- Gridlines: horizontal only, 1 px, `color-mix(in oklab, var(--border) 30%, transparent)`. At most three per chart. No vertical gridlines except year boundaries on timelines (same weight).
- Axes: a 1 px baseline in `--border` at 60%. Tick labels 22 px, `--muted-fg`. Only the ticks named in this spec.
- **Direct labels, not legends.** Label the series where it is. The only legend allowed is the two-item corner key on the b5 map.
- **Annotations:** 26 px text in `--fg`, weight 500, key phrase in 600; a 1.5 px leader line in `--fg` at 55% ending in a 6 px dot on the data. Place text in empty space, never over data. Maximum three per chart. Plates (tinted boxes) only on the map.
- **Dashed means uncertain**, everywhere: dashed strokes (6 px dash, 5 px gap) for uncertain links and edges; a 45 degree hatch at 12% for uncertain regions and time zones. Say it in words once per screen ("dashed means less certain", "not proven").
- Reference lines (invasion date): 1.5 px dotted `--fg` at 60%, labeled at the top.
- Bars: square ends, 70% of row height. Stacked areas: 1 px `--bg` separators between bands.
- Dates: "24 Feb 2022" for a day, "Feb 2024" for a month, "2023" for a year. Ranges with "to" (never an en or em dash): "15 to 20 months", "2019 to 2025".
- Every chart gets an `aria-label` that states its idea in one sentence, and a hidden data table or a drawer item that lists the plotted values.

### 3.6 Number style
- Big numbers: display face, 600, tabular lining figures (`font-variant-numeric: tabular-nums lining-nums`), in `--fg`. Units and words in a smaller size on the same baseline ("15 to 20 **months**").
- Money: "$13.5 million" in captions; "$13.5M" allowed only inside a big number where space is tight. Always say whose money it is (declared value in a country's own report).
- Counts: always say what is counted ("shipments", "pieces", "companies"), and "shipments" means shipment records, not dollar values. Commas for thousands.
- Keep the log's exact figures. Simplifying means showing fewer numbers, never rounding or re-deriving them. No new sums (for example, do not write "122 pieces"; write "100 + 22").
- Clickable: every number is a button that opens its evidence item. On the projector it shows **no underline**; an underline appears on hover and keyboard focus, and in presenter view. The E pill tells the audience sources exist.

### 3.7 Icons
- Optional, and only as node markers in the b0 and b4 diagrams. Never decorative.
- One set, drawn inline as SVG: 32 px box, 1.75 px stroke, round caps and joins, `currentColor`, no fills. Six icons maximum: document (list), person (officer), box (order or shipment), chip (part), drone (outline), building (company).
- No emoji anywhere.

### 3.8 Light and dark
- Default: light content screens (best on projectors), navy title screens. `?theme=dark` gives dark content screens; `?theme=system` follows the OS.
- All colours come from `light-dark()` tokens, so charts must be drawn with `ctx.cssVar()` at render time and redrawn on theme change (listen to `matchMedia('(prefers-color-scheme: dark)')` when theme is system).
- Slate steps in dark mode: `color-mix(in oklab, var(--fg) 34%, var(--bg))`, 22%, 14% (slightly stronger than light so bands stay distinct).
- The drawer and notes follow the theme of the page, not of the title screen.
- Check both themes at 1920x1080 before handing off; the fallback screenshots are light.

---

## 4. UX

### 4.1 Reveal steps inside a screen (fixes the click mismatch)
- Extend the contract without breaking it: `register({...})` accepts optional `steps` (number, default 1) and `onStep(el, i, ctx)` (called with 1..steps). Existing fields (`id`, `order`, `kicker`, `title`, `seconds`, `notes`, `evidence`, `render`, `dataFiles`) are unchanged.
- Right arrow: next step if the screen has one, else the next screen. Left arrow: previous step, else the previous screen (arriving on its last step).
- Layers not yet revealed are present in the DOM with `visibility: hidden` so the layout never jumps.
- `kicker` becomes the step name from the table in section 2.

### 4.2 Progress indicator with named steps
- Replace the 4 px strip with a **step rail** across the top (56 px): seven names, "The question · New routes · New names · The lag · The drone part · Blind spots · What to track".
- Current step: `--fg`, 600, with a 3 px accent underline that fills with time spent against its budget. Done steps: `--muted-fg` with a small check. Future steps: `--muted-fg` at 70%.
- Reveal dots after the current name (one dot per reveal step, filled as revealed).
- Each name is a button (jumps there). On title screens the rail uses hero colours.
- Narrow screens: collapse to "4 of 7 · The lag" plus the dots.

### 4.3 Transitions
- Screen change: 240 ms crossfade (`--dur-2`, `--ease-out`); the idea line rises 12 px as it fades in.
- Reveal step: new layer fades in over 200 ms; nothing moves that was already on screen.
- No drawing animations on charts, no looping motion, no parallax.
- `prefers-reduced-motion: reduce`: everything appears instantly (the tokens already zero the durations; do not add JS animations that ignore them).

### 4.4 "Press E for sources"
- A persistent pill, bottom right, on every screen: "Sources and details" followed by the key cap `E` and the count of items ("12 sources"). 20 px, `--muted-fg`, becomes `--fg` on hover. Clickable.
- The first time the demo opens (not in shot mode), the pill shows a one-time ring highlight for 2 s (skipped under reduced motion).
- Drawer layout, top to bottom: screen name; "On this screen" (evidence items in reading order, each with its value, plain claim, check badge, source); "More in the data" (items moved off the main screen, marked with a new optional field `offscreen: true`); "Words used here" (the glossary entries for this screen, from a new optional `glossary` field); the check-level legend; the footer line.
- Source line in two parts: first a plain source ("Russia's customs records, via Sayari, saved 25 Sep 2026"), then an optional new field `receipt` in mono for file names and internal references. File names, agent names and card codes belong only in `receipt`.
- Clicking a number opens the drawer scrolled to that item, highlighted. Esc closes. The drawer must not cover the idea line at 1920 (width 34 rem, right side).

### 4.5 Timer that stays out of the way
- Audience view: one compact reading in the top-right corner of the rail, "1:42 / 3:00", 20 px mono, `--muted-fg` at 70%. No per-screen seconds for the audience.
- Over the total budget: text turns `--warning`. Never red, never blinking.
- The per-screen budget shows as the fill of the current step's underline (4.2), which reads as progress, not as a clock.
- Keys unchanged: P or click to pause, T to restart. Paused shows "paused" in words.
- `?clock=0` hides the timer entirely (for recordings).

### 4.6 Presenter view
- Key **V** toggles presenter view in the same window (for rehearsing on one screen). `?view=presenter` opens it directly.
- Layout: left 60%, the live screen scaled down; right 40%, stacked: the spoken line for the current step in 28 px, "Next click shows: ..." (one line per reveal), the next screen's name, the timer with per-screen seconds, and the evidence list for quick answers.
- Optional second window: `?view=presenter` in a second window stays in sync with the audience window through `BroadcastChannel('demo')`, with a `storage`-event fallback for pages opened from disk. If sync fails, each window still works on its own. Test from `file://` on the demo laptop before relying on it.
- N (notes panel) stays as it is for the mirrored-display case.
- Add `?` to show a small key help overlay.

### 4.7 Deep links
- `#b3` opens screen 3 (unchanged). `#b3.2` opens screen 3 at reveal step 2.
- `?ev=b3-e5` opens the drawer on that evidence item.
- `?view=presenter`, `?theme=dark|light|system`, `?notes=1`, `?clock=0` combine freely.
- `?shot=1` hides all chrome and shows every reveal step (the final state), for the backup screenshots. `?shot=1#b2.1` captures an early step.
- Keys 1 to 7 jump to a screen.

### 4.8 Phone readability (under 700 px wide, or portrait)
- Each screen scrolls vertically; all reveal steps are shown at once (scrolling is the reveal).
- Order is the reading order: idea, explainer, hero, numbers, why it matters, then a full-width "Sources and details" button.
- Type on phones: idea 28 px, big numbers 44 px, body 17 px, annotations 16 px, nothing under 15 px. Use `rem` sizes here, not `vh`.
- Charts re-render in narrow mode (`ctx.isNarrow`): fewer ticks (first and last year only), labels inside or above bars, and annotations turn into numbered markers (1, 2, 3) with the annotation text listed under the chart.
- b4's chain turns vertical (top to bottom). b5's map crops to Central Asia and the Middle East, with Hong Kong kept as a dot callout.
- Big numbers stack in one column. Swipe left or right changes screens (already built); tap targets at least 44 px.
- The step rail collapses to "4 of 7 · The lag". The timer is hidden on phones.

### 4.9 Things to keep
- Offline from disk, no build step, no external libraries.
- The `window.DEMO.register({...})` contract with evidence items; evidence ids stay the same, nothing is deleted.
- Decisions held for Alex: RM Design's post-listing shipments leaving Turkey stay as they are (b3); STMicroelectronics stays unnamed on screen (b4); OOO FENIKS stays "a Russian firm" (b5).
- Regenerate `shots/final_*_1920.png` and `_1280.png` after the redesign (final reveal state), and check each at 1920x1080 in both themes.

### 4.10 Hand-off checks (run before calling the redesign done)
1. Every number on each main screen appears in section 2 of this spec and opens its evidence item.
2. Search the beat files and `SCRIPT.md` for the em dash and en dash characters (U+2014, U+2013): zero hits in on-screen copy.
3. Search main-screen strings for "OFAC", "BIS", "Comtrade", "Sayari", "HS ", "TRC", ".json", "agents/": zero hits (allowed in the drawer).
4. Search for "the buyer and the part": zero hits.
5. Nothing on the main screen under 22 px at 1920x1080 (inspect computed sizes).
6. `--danger` does not appear in any beat file.
7. Only listed companies are named; no individuals anywhere.
8. Press through the whole demo once: 12 right-arrow presses land exactly on the 12 "(click)"s in `SCRIPT.md`.

---

## 5. Mini glossary

Each term gets its plain explanation on the main screen the first time it appears (in the explainer line, a caption or an annotation), and again in the drawer under "Words used here". Hover tooltips alone are not enough: nobody hovers on a projector.

| Term | First appears | Plain explanation |
|---|---|---|
| Sanctions list | b0 | A government's list of companies nobody may trade with. |
| Listed / listing | b0 | Added by a government to a sanctions list. |
| Compliance officer | b0 | The person who checks each order is legal to ship. |
| Chips | b1 | Integrated circuits: the tiny electronics inside almost every device. |
| Shipment records (customs records) | b1 | Border paperwork, one entry per shipment, not dollar values. |
| Declared country | b1 | The country the paperwork names, not a traced route. |
| Countries' own reports (UN Comtrade) | b1 | Each country's official export totals, reported to the UN. |
| Declared value | b1 | The dollar value written on the export paperwork. |
| Shipper / buyer | b2 | The company sending the goods / the company receiving them. |
| Registered (a company) | b2 | Legally set up as a company, on that date. |
| US Treasury sanctions list (OFAC) | b3 | The main US blacklist; cuts firms off from dollars. |
| At least | b3 | The true gap may be longer; our records start late. |
| GUR | b4 | Ukraine's defence intelligence agency, a party to the war. |
| Shahed-136 | b4 | A drone model; GUR publishes the parts found inside. |
| Microcontroller | b4 | A small computer on one chip; here, flight control. |
| Part number | b4 | The maker's exact code for one specific chip model. |
| US Commerce Entity List (BIS) | b4 (tick, drawer) | US list; exporters need a licence to supply them. |
| Export controls | b4 drawer, b2 drawer | Rules requiring a licence to send sensitive goods abroad. |
| Not proven | b4 | We cannot show these chips reached a weapon. |
| Own trade records | b5 | A country's customs service publishes its own shipment records. |
| Seen only through partners | b5 | No records of its own; we see the other side. |
| Relabelling (oil) | b5 | Changing a cargo's stated origin so it looks allowed. |
| Ship position data | b5 | Tracking of where a ship actually is at sea. |
| Screening tool / sponsor flag | b5 | A data company's automatic "sanctioned or not" label. |
| Tax and registration numbers | b5 | Government ID numbers that pin down one specific company. |
| Our skeptic | b5 | A separate checker that redoes every number from source. |
| Counted twice | b5 | The same total added in twice by mistake. |
| Lead | every screen (footer) | A reason to look closer, not proof of wrongdoing. |
