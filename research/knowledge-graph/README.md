# Knowledge graph: sanctions, companies, people and lobbies

One interactive map that joins the shadow fleet (listed ships and the companies that run them) to the US lobbying
bought by their parent companies, and to the people involved: officially named individuals and lobbyists, with the
government jobs they disclose. Open `index.html` in a browser (needs internet for the graph library from
cdn.jsdelivr.net; for local files, serve the folder, e.g. `python -m http.server 8792`).

**Methods and sources, in plain language:** [`methods.html`](methods.html).

**Controls:** `/` search · **Find a path** between any two names · **Overview** (`0`) · arrow keys step through the
9-step story · **Explore** hides it · filters for Russia, Iran, China and chips, Other, and Leads · click anything for its
records and source links.

## What the picture encodes
- **Columns, left to right:** Government · Bills and orders · Lobbyists · Lobbying firms · Clients · Parent companies ·
  then the shadow fleet in Russia, Iran and other clusters.
- **Colour = side:** blue companies and ships, orange lobbying, green government. **Shape = type:** triangle ship,
  square company, circle person, diamond lobbying firm, hexagon government body, bar bill.
- **Sanctions are rings:** solid red = blocked (US SDN list or UK asset freeze), dashed = restricted (US sectoral,
  menu-based, Chinese-military-company or Commerce Entity List). In the fleet almost every company is listed, so the
  exception is drawn instead: **hollow = runs listed ships but is on no list itself**. ⊘ = no US lobbying filings found.
- **Lines:** blue owns / runs, dashed orange with moving dots = money hired, green = lobbied or used to work at,
  dotted grey = a lead (our inference).

## Sources and rules
- Shadow fleet: the team's shadow-fleet map (`research/shadow-fleet/network/`), joined by IMO number. Its naming rule is
  kept: unlisted firms known only from non-official sources show a generic description, not a name.
- Lobbying: every page of the US lobbying-disclosure API (lda.gov) for the clients in our story: 3,232 filings scanned,
  1,513 kept. Each firm-client-quarter is counted once (the latest version stating an amount); subcontracted fees are
  shown but not added to the client's total. Hand-checked: Nord Stream 2 paid its prime firms $13.87M, 2016-2022.
- Bridges between the two sides are hand-checked in `scripts/curated.json`, each with its official URL
  (e.g. Treasury jl2629: "Gazprom Neft is majority owned by Gazprom"; jy2777: Gazpromneft Marine Bunker is
  "a Gazprom Neft subsidiary"). Sanctions statuses there were looked up by record number on the US and UK lists.
- People are named only where an official list or government release names them, or where their own lobbying
  disclosure does, in that role. Unchecked people from the shadow-fleet research layers show "(?)".

## Rebuild (from the event workspace, which holds the raw pulls)
```
python scripts/fetch_lda.py       # all pages of lobbying filings -> pulls/lda/
python scripts/extract_lobby.py   # lobbying layer
python scripts/build_kg.py        # merge with the shadow-fleet map -> kg_data.js
```
The scripts expect the event workspace layout (`agents/`, `pulls/`, the shadow-fleet map output); they are here so the
method is reviewable.

## Known gaps
- "En+ Group" can't be searched by name on the lobbying API (the "+" is ignored), so En+ comes from earlier targeted pulls.
- Bills: the key named bills plus any bill named in 3 or more filings (125 kept).
- No EU transparency-register data and no trade-association membership lists yet.
- "LLC CIB Holding" (99% owner on Sberbank CIB USA's filings) may be the US-listed "LLC Sberbank CIB Holding"
  (record 34639); not marked until confirmed.
- "No path found" is not proof of no relationship.
