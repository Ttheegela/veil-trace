# Viewer spec: Shadow Fleet Network (interactive network chart)

Build `C:\Projects\climate-day\agents\fleetmap\viewer\template.html`: ONE self-contained HTML page (no build tools) that
renders the shadow-fleet network. Data arrives inline: the template must contain exactly one
`<script>/*__FLEET_DATA__*/</script>`; `build_viewer.py` replaces the placeholder with `window.FLEET_DATA={...};`
and writes `out/shadow_fleet_map.html`. Put your own app `<script>` AFTER that one. Test by running
`C:\Projects\climate-day\.venv\Scripts\python.exe C:\Projects\climate-day\agents\fleetmap\build_viewer.py`, then open
out/shadow_fleet_map.html in the Browser pane (mcp__Claude_Browser__preview_start with
url file:///C:/Projects/climate-day/agents/fleetmap/out/shadow_fleet_map.html, or navigate). Check 1920x1080,
1366x768 (laptop projector) and ~400px phone width (panels stack). The data file is refreshed by another process while you
work (out/graph_data.js); just re-run build_viewer.py.

## Data shape (window.FLEET_DATA); read out/graph_data.json for real examples
- nodes[]: {id, type: ship|company|person|country|government, name, aliases[], imo, program_group: both|russia|iran|terrorism|venezuela|other,
  programs[], listed_by[] (us|uk|eu), listed (bool), first_listed (YYYY-MM-DD), listing_dates{us,uk,eu}, country (iso2), role,
  ship_type, year_built, flag_now, flags_before[], flag_us, names_by_source{}, ua_former_names[], ship_count, name_count, flag_count,
  name_policy: show|generic, generic_name, name_note, history[{date,kind,from,to,source_url,source_file}], research_notes[{angle,text}],
  merge_notes[], sources[{label,url,file}], gap_days_us_minus_uk}. Most fields are optional.
- edges[]: {i (id), s (source id), t (target id), y (type), d (date), c ('D' Documented | 'L' Lead), n (date note),
  src: [[sourceIndex, quoteIndex, record, angle, 'D'|'L'], ...]}
- sources[i] = [url, file]; quotes[i] = text
- meta: {title, subtitle, patterns[{id,title,text,examples[] node ids}], coverage[], credits, counts{}, findings[{angle,text}],
  study_counts[{what,value,source_url,angle,...}], verified_angles[]}
- Edge types: owns, manages, operates, linked_to (OFAC "Linked To"), formerly_operated, flagged_in, formerly_flagged_in,
  registered_in, designated_by, sold_to, carried_cargo_for, controls, director_of, insured_by, transferred_cargo_with,
  sister_shell_of, seized_by, charged_by. Show them in plain words ("manages", "flies the flag of", "was flagged in",
  "registered in", "sanctioned by", "OFAC links to"...). Unknown types: show the type with underscores as spaces.
- NAMING RULE (hard): a company node with name_policy "generic" must be DISPLAYED as its generic_name everywhere (label,
  panel, search results, tooltips); never render its `name` or `aliases`, and search must not match on those hidden names.

## Size and scope
About 1,600 ships, 950 companies, 20 people, 70 countries, 3+ governments, 7,000 edges. Too many to draw at once readably.
- Presets (buttons): "Russia + Iran overlap" (DEFAULT: ships with program_group "both", every company/person
  connected to them, and their flag countries), "Big operators" (companies/people with ship_count >= 5 and their ships),
  "Named people" (people plus 2 hops), "Enforcement" (nodes touched by seized_by/charged_by edges plus 1 hop),
  "Everything" (all ships/companies/people; countries and governments hidden; may be slow: show a short "laying out" state).
- Search box: ship name, former name, IMO or company (visible names only) -> focus its 2-hop neighbourhood.
- Filters: programme (Russia / Iran / both / other), listed vs not listed, by government (US/UK/EU), node type toggles
  (governments OFF by default: as nodes they make a hairball; show sanctions as small US / UK / EU badges on the node
  instead), confidence (show Lead edges on/off).
- Time slider: "As of <month year>" from 2019-01 to 2026-09. Ships/companies whose first_listed is after the slider date fade
  to about 12% (not removed, so the layout doesn't jump); dated edges after the date hide. A play button steps month by month.
- Layout: cytoscape.js (cdnjs, pinned version, UMD) with a force layout (built-in cose, or fcose from cdn.jsdelivr.net/npm
  pinned). Freeze after layout; nodes draggable.

## Visual design (Alex asked to borrow the look of God's Eye View, a CesiumJS "tactical intelligence console", MIT licence)
- Deliberately single dark theme (the console look is the point): background #0a0a0f, panels slightly lighter, hairline
  borders, accent cyan #00d4ff for UI and selection, monospace data face (JetBrains Mono from Google Fonts, fallback
  ui-monospace, Consolas) for IMO numbers, dates and counts; a clean sans for prose (IBM Plex Sans; not Inter).
  Set body background explicitly. Small uppercase letter-spaced HUD labels. Selected node gets a corner-bracket ID box
  (like GEV's on-screen ID boxes): one tasteful flourish. No scanlines or CRT filters.
- Node shapes: ship = diamond (size by name_count), company = round-rectangle (size by ship_count), person = ellipse with a
  ring, country = hexagon, government = octagon. Colour = programme: Russia #ff6b5a, Iran #f5b83d, both #d86bff (the story
  colour), terrorism #7aa7ff, venezuela #57d19b, other #8a94a6. Listed = filled; not listed = hollow outline.
  Edges: Documented = solid, Lead = dashed and dimmer; muted grey-blue, highlighted on hover/selection.
- Labels on companies/people and on ships in the default view; hide small labels when zoomed out.
- Projector readability: minimum 13px text in panels, strong contrast.

## Panels
- Left rail: title (meta.title), subtitle, preset buttons, search, filters, time slider, a small key (shapes, colours, solid vs
  dashed) and live counts of what's shown.
- Right detail panel on click: type chip, display name, IMO in mono; US/UK/EU badges with dates; for ships "Every name this
  hull has carried" (names_by_source + aliases + ua_former_names), flags now/before as country names, history timeline if
  present; research notes; connections grouped by type, each with date, a Documented/Lead chip and its sources (clickable
  URLs opening in a new tab, saved-file names in mono, quote in italics). Clicking an edge shows the same source block.
  Hover = tooltip with display name + one line.
- "Patterns" tab (meta.patterns): five cards, plain language; each has "Show me" that focuses and highlights the example
  node ids. Plus "About this data" (meta.coverage, credits, counts, verified_angles) and "What studies say"
  (meta.study_counts as a small table with source links).
- Footer credit line: meta.credits.

## Rules
- Plain language at Popular Science level; define IMO, OFAC, flag on first use (the About panel and tooltips). No em dashes
  anywhere in UI copy. No internal codes.
- Visible keyboard focus; Esc closes the panel; respect prefers-reduced-motion.
- External hosts allowed: cdnjs.cloudflare.com, cdn.jsdelivr.net/npm/, fonts.googleapis.com + fonts.gstatic.com only.
  Pin exact versions. No fetch() of remote data. `<title>Shadow Fleet Network</title>` near the top. Layout must use flex/grid
  with height:100% (not 100vh) and never scroll the page body horizontally.
- Performance: default view interactive within about 2 s; don't lay out 2,500 nodes on page load.
- Finish with one screenshot at 1920x1080 of the default view with a ship selected and report what you built and anything you
  could not do. Do not publish anything and do not edit files outside viewer\ (build_viewer.py writes out\).
