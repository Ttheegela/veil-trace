"""Join the UK Russia ship list to the US ship list by IMO number.

Runs only on PUBLIC list files that you download yourself (see tools/fleet/README.md):
  --uk      UK Sanctions List, CSV export (UK-Sanctions-List.csv)
  --us      OpenSanctions export of the OFAC SDN list (us_ofac_sdn.csv, "targets.simple" CSV)
  --csl     optional: US Consolidated Screening List CSV (consolidated.csv)
  --eu      optional: a two-column CSV you build from an EU act's ship annex: imo,date

Writes <out>/state.pkl for tiers.py. Nothing here calls a network service.
"""
import argparse, collections, csv, datetime as dt, os, pickle, re

ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument('--uk', required=True)
ap.add_argument('--us', required=True)
ap.add_argument('--csl', default=None)
ap.add_argument('--eu', default=None)
ap.add_argument('--out', default='out')
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)

# UK list: the CSV has one title line before the header row.
f = open(a.uk, encoding='utf-8-sig'); next(f)
uk = {}; regimes = collections.Counter()
for row in csv.DictReader(f):
    imo = re.sub(r'\D', '', row['IMO number'] or '')
    if len(imo) != 7:
        continue
    regimes[row['Regime Name']] += 1
    ds = row['Date Designated'].strip()
    d = dt.datetime.strptime(ds, '%d/%m/%Y').date() if ds else None
    e = uk.setdefault(imo, {'names': set(), 'regimes': set(), 'date': d, 'cur': set(), 'prev': set(), 'id': row['Unique ID']})
    e['names'].add(row['Name 6'].strip()); e['regimes'].add(row['Regime Name'])
    if d and (e['date'] is None or d < e['date']):
        e['date'] = d
    for k, c in (('cur', 'Current owner/operator (s)'), ('prev', 'Previous owner/operator (s)')):
        if row[c].strip():
            e[k].add(row[c].strip())
print('UK ship regimes', dict(regimes))
ukR = {k: v for k, v in uk.items() if any('Russia' in x for x in v['regimes'])}
print('UK ships', len(uk), 'of which Russia regime', len(ukR))

# US (OpenSanctions OFAC export). Tags are CASE-SENSITIVE programme codes on purpose:
# "IRAN"/"IFSR" in upper case = an Iran programme. The words "(Iran)" inside a Russia
# action are handled separately in tiers.py (the programme-filter trap, see METHOD.md).
us = {}
for row in csv.DictReader(open(a.us, encoding='utf-8')):
    imos = re.findall(r'IMO(\d{7})', row['identifiers'])
    if row['schema'] != 'Vessel' or not imos:
        continue
    s = row['sanctions']; tags = set()
    if re.search(r'IRAN|IFSR', s): tags.add('IRAN')
    if re.search(r'RUSSIA|UKRAINE', s): tags.add('RUSSIA')
    if 'SDGT' in s: tags.add('SDGT')
    for imo in imos:
        e = us.setdefault(imo, {'name': row['name'], 'tags': set(), 's': set(), 'first_seen': row['first_seen'][:10]})
        e['tags'] |= tags; e['s'].add(s)
        e['first_seen'] = min(e['first_seen'], row['first_seen'][:10])

csl = {}
if a.csl:
    for row in csv.DictReader(open(a.csl, encoding='utf-8')):
        if row['type'] != 'Vessel':
            continue
        for imo in re.findall(r'IMO (\d{7})', row['ids']):
            csl.setdefault(imo, set()).add(row['programs'])

eu = {}
if a.eu:
    for row in csv.DictReader(open(a.eu, encoding='utf-8')):
        eu[re.sub(r'\D', '', row['imo'])] = (row['date'], '')

res = {}
for name, flt in (('strict_IRAN', lambda t: 'IRAN' in t), ('broad_IRAN_or_SDGT', lambda t: bool(t & {'IRAN', 'SDGT'}))):
    res[name] = sorted(i for i in ukR if i in us and flt(us[i]['tags']))
    print(name, len(res[name]))
if csl:
    print('CSL Iran/IFSR', len([i for i in ukR if any('IRAN' in p or 'IFSR' in p for p in csl.get(i, []))]))
print('broad minus strict', sorted(set(res['broad_IRAN_or_SDGT']) - set(res['strict_IRAN'])))
# OpenSanctions first_seen dates at the dataset start (2023-04-20/21) are not real listing dates.
print('US first_seen at dataset floor (dates unusable):', sum(1 for i in res['broad_IRAN_or_SDGT'] if us[i]['first_seen'] <= '2023-04-21'))
pickle.dump((ukR, us, csl, eu, res), open(os.path.join(a.out, 'state.pkl'), 'wb'))
print('wrote', os.path.join(a.out, 'state.pkl'))
