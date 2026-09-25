# Tavily for the sanctions-evasion team (Claude's suggestion, unruled by Alex)

Tavily is a web search service built for AI tools. We use it to check leads (company names from
the sponsor data) against official sanctions notices and investigative reporting. Free tier:
1,000 credits a month, dev key limit 100 requests a minute. Script: `smoke\tavily.py`.

## The rule
Cite the source URL and read the page. Never cite Tavily's AI summary ("answer"): in our test it
wrote a confident paragraph about a company that none of the returned pages named. A hit that
names a company is a lead to read, not proof. No hit is not "no relationship". Every raw answer
is saved with its time under `pulls\tavily\` (keep local; never commit).

## Which tool when
- **search**: find pages about a name. Our main tool.
- **extract**: you already have the URL (an OFAC notice, a report) and want the text. With
  `--query "COMPANY NAME"` it returns only the matching paragraphs (best receipt for a screen).
- **map / crawl**: list or read a whole site. Not needed today; costs grow with page count.
- **research**: Tavily writes a cited report for you. 4 to 250 credits per call and the output is
  an AI summary, so skip it for evidence.

## Credit costs
search basic 1, advanced 2 · extract basic 1 per 5 URLs, advanced 2 per 5 URLs ·
map 1 per 10 pages · crawl = map + extract · research 4 to 250. `corroborate` = 2 credits.

## The 5 practices that matter most
1. **Short, specific queries** (under 400 characters). Put the company name in quotes. Split a
   complex question into several searches instead of one long one.
2. **Restrict to the right domains** (`--domains`). Unrestricted searches drift to aggregators;
   official domains gave us the actual OFAC, EU and BIS listing pages.
3. **Use topic general, not news, for official sources.** With `--topic news`, the official-domain
   search returned unrelated recent press releases; `general` found the real listing pages.
4. **Use `--depth advanced` for obscure names** (2 credits). It ranks the paragraph that names the
   company, not the page header, so the snippet itself shows the match.
5. **Check the snippet, then extract.** Scores are relevance, not truth. Confirm the name is in the
   text, then `extract --query` the page and save that as the receipt.

## Commands (PowerShell, from the `smoke` scripts folder)
```
python tavily.py corroborate "Sinno Electronics"                    # official, then investigative (2 credits)
python tavily.py corroborate "ELEM GROUP" --depth advanced          # obscure name (4 credits)
python tavily.py search '"Enkor Grupp" sanctions' --domains ofac.treasury.gov,gov.uk --no-answer
python tavily.py search '"COMPANY" export' --days 365 --max 10 --exclude wikipedia.org
python tavily.py search '"COMPANY"' --depth advanced --chunks 3 --no-answer
python tavily.py extract https://ofac.treasury.gov/recent-actions/20220930 --depth advanced --query "SINNO ELECTRONICS"
```
Other options: `--topic general|news|finance`, `--time-range day|week|month|year`, `--raw` (full page
text, large files), `--exact` (exact phrase), `--tag` (label in the saved file name).
Official domains used by `corroborate`: home.treasury.gov, ofac.treasury.gov, bis.gov, bis.doc.gov,
gov.uk, consilium.europa.eu, eur-lex.europa.eu. Investigative: occrp.org, forbiddenstories.org,
reuters.com, rusi.org, kse.ua.

## What our tests showed (2026-09-25)
- Sinno Electronics: official search found the Treasury press releases and the OFAC listing
  (30 Sep 2022); investigative search found a RUSI report and a Reuters investigation naming it.
- ELEM GROUP (Kazakhstan): official pages (OFAC action of 23 Feb 2024, EU annex) name it; a BIS entity
  list row "Elem Group, LLC" may be a different company (same name is not same company); the investigative domains returned nothing that names it.
- Published dates are usually missing outside `--topic news`; read the date on the page itself.
