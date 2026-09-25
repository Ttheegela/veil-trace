"""Sort the overlap ships into filter tiers and compute who listed first.

Tier A: US entry carries an Iran programme code (IRAN*/IFSR).        -> the strict count
Tier B: adds ships whose US entry only CITES the Iran order (E.O. 13846, "(Iran)")
        inside a Russia action, or whose CSL row carries IFSR.
Tier C: adds ships the US listed only under its terrorism programme (SDGT).

Reads <out>/state.pkl from join.py. Writes <out>/overlap_ships.json.
overlap_ships.json copies the UK list's owner/operator column, which can name firms that
are on no list. Keep it local (out/ is git-ignored); publish only mgrs.py's redacted output.
"""
import argparse, datetime as dt, json, os, pickle, re, statistics

ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument('--out', default='out')
a = ap.parse_args()
ukR, us, csl, eu, res = pickle.load(open(os.path.join(a.out, 'state.pkl'), 'rb'))


def tier(i):
    u = us.get(i); s = ' '.join(u['s']) if u else ''
    c = ' '.join(csl.get(i, []))
    if u and 'IRAN' in u['tags']:
        return 'A_iran_programme'
    if re.search(r'\(Iran\)', s) or re.search(r'IRAN|IFSR', c):
        return 'B_iran_authority_cited'
    if 'SDGT' in s or 'SDGT' in c:
        return 'C_sdgt_only'
    return None


def name_key(s):
    # The UK list sometimes writes a ship as "IMO 9417464 ('TANI')": use the quoted name.
    m = re.search(r"\('([^']+)'\)", s)
    s = m.group(1) if m else s
    return re.sub(r'[^A-Z0-9]', '', s.upper())


rows = []
for i, e in ukR.items():
    if i not in us:
        continue
    t = tier(i)
    if not t:
        continue
    u = us[i]; usd = dt.date.fromisoformat(u['first_seen']); ukd = e['date']
    gap = (ukd - usd).days
    eud = eu.get(i)
    rows.append({'imo': i, 'uk_name': sorted(e['names'])[0], 'us_name': u['name'], 'tier': t,
                 'us_programmes': sorted(u['s']), 'csl_programmes': sorted(csl.get(i, [])),
                 'us_russia_too': 'RUSSIA' in u['tags'],
                 'us_date_first_seen': str(usd), 'uk_date': str(ukd), 'eu_date': eud[0] if eud else '',
                 'first': 'US' if gap > 0 else ('same day' if gap == 0 else 'UK'),
                 'gap_days_uk_minus_us': gap,
                 'uk_current_owner_operator': ' | '.join(sorted(e['cur'])),
                 'uk_previous_owner_operator': ' | '.join(sorted(e['prev']))})
rows.sort(key=lambda r: (r['tier'], r['uk_date']))
json.dump(rows, open(os.path.join(a.out, 'overlap_ships.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

for T in ['A', 'AB', 'ABC']:
    rr = [r for r in rows if r['tier'][0] in T]
    if not rr:
        continue
    g = [r['gap_days_uk_minus_us'] for r in rr]
    renamed = sum(1 for r in rr if name_key(r['uk_name']) != name_key(r['us_name']))
    print(f"tiers {T}: {len(rr)} ships | median gap {statistics.median(g)} d | US first {sum(x > 0 for x in g)} | "
          f"UK first {sum(x < 0 for x in g)} | same day {sum(x == 0 for x in g)} | range {min(g)}..{max(g)} | "
          f"UK name differs from US primary name: {renamed} | on EU file: {sum(1 for r in rr if r['eu_date'])}")
# Ship names below are listed vessels (public list entries); no manager names are printed here.
for r in rows:
    print(r['tier'][0], r['imo'], r['uk_name'][:22], r['us_date_first_seen'], r['uk_date'], r['gap_days_uk_minus_us'], r['eu_date'])
