# VeilTrace

**Trace the Unseen: Climate Intelligence Build Day, 25 September 2026 (Microsoft Garage, NYC). Sanctions and evasion track.**

> **Names change in weeks. The need doesn't.**
> A sanctions list only works when someone recognises the name. After Russia's full invasion of Ukraine, Western chips kept reaching Russia through new countries and short-lived companies. Governments listed those companies **15 to 20 months** after they first appeared, usually after they had moved on. What stays the same for years is **the product, the buyer and the route**, so that is what we track.

## What's here

| Path | What it is |
|---|---|
| `demo/` | The 3-minute demo. Open `demo/index.html` in a browser (1920x1080). Arrow keys step through; **E** opens the sources behind every number; **V** is presenter view. `demo/SCRIPT.md` is the spoken script; `demo/screens/` has still images of each slide. |
| `docs/RESEARCH_AND_SOURCES.md` | Our research in one file: data sources and their traps, official references for every listing date, findings beyond the demo, open leads. |
| `research/shadow-fleet/network/shadow_fleet_map.html` | Shadow Fleet Network: interactive map of the tankers, companies, officially named people and countries behind Russia's and Iran's shadow fleet, joined by IMO hull number, with a source on every link. Open it in a browser (about 3 MB; the data files add about 8 MB). Data in `nodes.json` / `edges.json`; sources and rules in `METHOD.md`. |
| `research/shadow-fleet/FINDINGS.md` | Tankers serving both Russia and Iran, matched by IMO number: overlap counts, listing order, name changes, manager churn. |
| `research/russia-ukraine/` | Dual-use goods reaching Russia: routes, churn, listing lag, hubs, buyers, part numbers. Interactive views in `research/russia-ukraine/viz/`. |
| `research/knowledge-graph/index.html` | Knowledge graph: the shadow fleet joined to the US lobbying bought by parent companies (1,513 filings), with lobbyists' disclosed government jobs, sanctions rings, a path finder and an 9-step story. See its `README.md`. |
| `research/lobbying/FINDINGS.md` | Lobbying around sanctions: who pays, through which clean names (parents, subsidiaries, law firms, governments), and what changed, with each effect graded documented / timing fits / contested. |
| `docs/METHODS_LOG.md` | How we found things: discovery methods, checks, and the traps we fell into. |
| `docs/sanctions-explained/` | A plain-language explainer: how sanctions work and how evasion works. |
| `docs/shape-of-the-problem/` | Six diagrams of the system. |
| `docs/CONNECT_SAYARI.md`, `docs/TAVILY_GUIDE.md` | How to connect the data tools we used. |
| `tools/sanctions/` | Fuzzy sanctions-list checker (US, UK, EU, UN) with tests. |
| `tools/detect/` | Alias and ID cross-check, sibling finder (shared addresses), and its back-test. |
| `tools/sponsors/` | One look-up across both sponsor data services. |

**Branches:** `russia-ukraine` and `shadow-fleet` were merged into `main` on 25 Sep 2026; their work now lives under `research/` and `tools/`.

## Data

- **Sayari:** shipment records (mostly Russia's own import records), company and ownership records, watchlists.
- **Tradeverifyd:** company-to-company trade links, supply-chain risk paths, dated sanctions flags.
- **UN Comtrade** (countries' own reported trade), **official US, UK and EU sanctions and export-control lists**, **Ukraine's GUR weapon-components database** (a party to the war), and web sources found with **Tavily**.

## How we state things

Documented conduct (government findings, and what the records directly show, such as "kept shipping after being sanctioned: 40 records") is stated plainly with its source. Our own inferences about companies that are not listed are marked as **leads**. We describe conduct; we don't make legal findings. Shipment records are counts, not dollar values; "departure country" is the declared country, not a traced physical route.

## Team

Built at the event by our team with AI agents (Claude Code) doing research, cross-checking and building under human direction. Every number on screen traces to a saved source, and an independent verifier agent re-derived each figure; the corrections it forced are logged in `docs/METHODS_LOG.md`.
