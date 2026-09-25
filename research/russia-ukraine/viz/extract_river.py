"""Build river.js (window.RIVER) for river.html: "Same river, new boats".

Inputs (read only):
  agents/b16/rows_KGZ.json, rows_KAZ.json   chip (HS 8542) shipment rows into Russia, from Sayari
                                             "Russia Imports & Exports"; firm-name merges as in agents/b16/churn2.py
  agents/b17/buyer_timelines.csv             Testkomplekt supplier windows
  pulls/comtrade/b16_8542_8482_exports_to_RUS_2021_2025_AGGREGATE.json   countries' own chip exports to Russia
Listing dates: verified rows in LOG_2026-09-25.md (10:35, 10:51) and build/viz/listing_lag.js;
OpenSanctions first_seen dates are marked approximate.

Unlisted companies are not named in the output: they get a neutral label ("Unlisted firm A").
Run:  python extract_river.py   (from this folder)
"""
import collections, csv, json, os, statistics
from datetime import date

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
P = lambda *a: os.path.join(ROOT, *a)

# Public repo: two unlisted suppliers of the Testkomplekt buyer are matched by their exact Sayari supplier name.
# Their names are not published; set them locally (environment variables) to rebuild river.js from sponsor data.
UNLISTED_SUPPLIER_1 = os.environ.get('RIVER_UNLISTED_SUPPLIER_1', '<unlisted distributor name, set locally>')
UNLISTED_SUPPLIER_2 = os.environ.get('RIVER_UNLISTED_SUPPLIER_2', '<unlisted Shenzhen trader name, set locally>')

# same record-id merges as agents/b16/churn2.py (spelling variants of one firm; unlisted firms get placeholder keys)
# Caveat: one merged RM DESIGN record id is a Turkish-registered spelling whose identity with the Bishkek firm is NOT verified.
CL = {'biqoY5rY9uqyvsj4Aag__A': 'RM DESIGN', 'WBo7TmupYPexuLKYQ1yMZQ': 'RM DESIGN', 'fsR08ATkO5qR8Q845AnWog': 'RM DESIGN',
      'BbeE4BGWRgR5pcxFnx-mrA': 'RM DESIGN', 'qOTV1trPEObHvPLAF6GdGQ': 'RM DESIGN', 'uEqzSxDwR2BBfU-yBHn6wA': 'RM DESIGN',
      '3PRmLiTlXgCTuoRD82PcbQ': 'GTME', 'lSAHaQICDfVN3OGh4wX5jg': 'GTME',
      'iM-59_CI59lYGxpKM1RInA': 'UNLISTED_KAZ_1', 'MAUaFqn8iOTK7Z9ru2pTpg': 'UNLISTED_KAZ_1',
      '2TggfLihlrMjRz8m6TDQtw': 'UNLISTED_KAZ_2', 'tb-FivlcpKBJdhM-P3BpUw': 'UNLISTED_KAZ_2', '3-EyjhCaBTuTMJkfn4d4pA': 'UNLISTED_KAZ_2'}

LOG = 'LOG_2026-09-25.md'
# Listed shippers on the two routes. key = merged firm name in the rows.
LISTED = {
    'RM DESIGN': dict(label='RM Design and Development', authority='US Treasury (OFAC)', short='OFAC', date='2023-07-20', approx=False,
                      source='build/viz/listing_lag.js; LOG 10:35 (Federal Register 2023-16934)',
                      url='https://www.federalregister.gov/documents/2023/08/08/2023-16934/notice-of-ofac-sanctions-action'),
    # Correction (13:12): ELEM GROUP's FIRST restriction is the BIS Entity List, 2023-12-07 (88 FR 85097); OFAC followed 2024-02-23.
    'ТОО "ELEM GROUP"': dict(label='ELEM GROUP', authority='US Commerce (BIS Entity List)', short='BIS', date='2023-12-07', approx=False,
                            source='US Consolidated Screening List, Entity List row "Elem Group, LLC" (88 FR 85097); OFAC followed on 2024-02-23',
                            url='https://www.federalregister.gov/citation/88-FR-85097'),
    'RAMA GROUP LLC': dict(label='Rama Group', authority='UK sanctions list', short='UK', date='2025-02-24', approx=False,
                           source='LOG 10:51 (verified row); agents/b17/buyer_timelines.csv', url=''),
    'GTME': dict(label='GTME (listed as ZAO GTME Tekhnologii)', authority='US Treasury (OFAC)', short='OFAC', date='2023-07-20', approx=True,
                 source='OpenSanctions first_seen (data/opensanctions/us_ofac_sdn.csv), per agents/b16 TRC-28 comment; not checked on an official page', url=''),
    'LLC TRANSIT SEVICE BUSHKEK': dict(label='Transit Service Bishkek', authority='US Treasury (OFAC)', short='OFAC', date='2024-06-12', approx=True,
                                       source='OpenSanctions first_seen, per agents/b16 TRC-28 comment; not checked on an official page', url=''),
}
PALETTE_SLOTS = 6          # calm categorical slots (no red); the largest 6 firms get a colour, the rest fold into a grey "other firms" band


def mkey(d):
    return d[:7]


def months(a, b):
    y, m = int(a[:4]), int(a[5:7])
    out = []
    while f'{y:04d}-{m:02d}' <= b:
        out.append(f'{y:04d}-{m:02d}')
        m += 1
        if m == 13:
            y, m = y + 1, 1
    return out


def days(a, b):
    return (date.fromisoformat(b) - date.fromisoformat(a)).days


def route(tag, title):
    src = f'agents/b16/rows_{tag}.json'
    rows = json.load(open(P(src), encoding='utf-8'))['rows']
    F = collections.defaultdict(list)
    for r in rows:
        F[CL.get(r['sid'], r['sname'])].append(r['date'])
    firms = sorted(F.items(), key=lambda kv: min(kv[1]))
    letter = iter('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    by_size = [n for n, ds in sorted(F.items(), key=lambda kv: -len(kv[1]))]
    coloured = set(by_size if len(by_size) <= PALETTE_SLOTS + 1 else by_size[:PALETTE_SLOTS])
    out_firms, slot = [], 0
    other = dict(id='other', label='', n=0, members=0, listed=None, slot=None, monthly=collections.Counter(), first=None, last=None)
    for name, ds in firms:
        listed = LISTED.get(name)
        label = listed['label'] if listed else (f'Unlisted firm {next(letter)}' if name in coloured else 'Unlisted firm (in "other firms")')
        f = dict(id=f'{tag}-{len(out_firms)}', label=label, n=len(ds), first=min(ds), last=max(ds), listed=None,
                 active_days=days(min(ds), max(ds)) + 1, monthly=collections.Counter(mkey(d) for d in ds))
        if listed:
            gap = days(max(ds), listed['date'])
            f['listed'] = dict(listed, gap_days=gap,
                               note=(f'left this route {gap} days before listing' if gap > 0 else f'still on this route {-gap} days after listing'))
        own = name in coloured
        if own:
            f['slot'] = slot; slot += 1
            out_firms.append(f)
        else:
            f['slot'] = None
            other['n'] += len(ds); other['members'] += 1; other['monthly'].update(f['monthly'])
            other['first'] = min(filter(None, [other['first'], f['first']]))
            other['last'] = max(filter(None, [other['last'], f['last']]))
            f['in_other'] = True
            out_firms.append(f)
    first, last = min(r['date'] for r in rows), max(r['date'] for r in rows)
    ms = months('2022-01', '2023-12')
    bands = [f for f in out_firms if f['slot'] is not None]
    if other['members']:
        other['label'] = f"{other['members']} other firms, not named (1-{max(f['n'] for f in out_firms if f.get('in_other'))} records each)"
        bands.append(other)
    series = [dict(id=b['id'], label=b['label'], slot=b['slot'], n=b['n'], first=b['first'], last=b['last'],
                   listed=b.get('listed'), counts=[b['monthly'].get(m, 0) for m in ms]) for b in bands]
    pins = [dict(firm=f['label'], first=f['first'], last=f['last'], n=f['n'], in_other=bool(f.get('in_other')), **f['listed'])
            for f in out_firms if f['listed']]
    for f in out_firms:
        f.pop('monthly')
    total = [sum(s['counts'][i] for s in series) for i in range(len(ms))]
    assert sum(total) == len(rows), (tag, sum(total), len(rows))
    return dict(id=tag, title=title, source_file=src, merge_rule='agents/b16/churn2.py',
                records=len(rows), firms=len(firms), first=first, last=last, months=ms, total=total,
                series=series, pins=sorted(pins, key=lambda p: p['date']),
                median_active_days=statistics.median(days(f['first'], f['last']) for f in out_firms),
                single_day_firms=sum(1 for f in out_firms if f['first'] == f['last']),
                firm_table=[dict(label=f['label'], n=f['n'], first=f['first'], last=f['last'], listed=bool(f['listed'])) for f in out_firms])


def buyer():
    src = 'agents/b17/buyer_timelines.csv'
    rows = [r for r in csv.DictReader(open(P(src), encoding='utf-8')) if r['buyer'] == 'Testkomplekt']
    west = [r for r in rows if r['supplier_country_of_departure'] in ('BEL', 'USA', 'GBR') and r['last_row'] <= '2022-03-02']
    lanes = [dict(group='Western distributors', label=f'Western distributors ({len({r["supplier"].split()[0] for r in west})} firms, not named)',
                  first=min(r['first_row'] for r in west), last=max(r['last_row'] for r in west),
                  rows=sum(int(r['rows_seen']) for r in west), kind='west', listings=[],
                  note='Stopped by 2 Mar 2022 (export controls; lawful exits, not evasion). None on a list.',
                  source=src + ' ; ' + ' ; '.join(sorted({r['source_file'] for r in west})))]
    L = {  # supplier listings (earliest first); approx = OpenSanctions first_seen or not rechecked on an official page
        'SHENZHEN A TECHNOLOGY CO LTD': ('Shenzhen A Technology', [('US SDN', '2024-10-30', False)]),
        'SHENZHEN ONE WORLD INTERNATIONAL LOGISTICS': ('Shenzhen One World', [('BIS Entity List', '2023-10-06', True), ('US SDN', '2024-10-30', False)]),
        'FLAVIC FZE': ('Flavic FZE', [('US SDN', '2023-11-02', True)]),
        'ROBOTRONIX SEMICONDUCTORS': ('Robotronix Semiconductors', [('US SDN', '2023-12-12', True)]),
        'INNOVIO VENTURES': ('Innovio Ventures (India)', [('BIS Entity List', '2023-10-06', True), ('US SDN', '2024-10-30', False)]),
        'GROUP YEOH LIMITED': ('Group Yeoh', [('US SDN', '2024-10-30', True)]),
    }
    for r in rows:
        s = r['supplier']
        if r in west:
            continue
        if s == UNLISTED_SUPPLIER_1:
            lanes.append(dict(group='An unlisted distributor', label='An unlisted distributor', first=r['first_row'], last=r['last_row'],
                              rows=int(r['rows_seen']), kind='unlisted', listings=[],
                              note='Not on any list (checker). Last row 8 days after the buyer\'s US listing. Agency-only lead; innocent explanations include licensed or uncontrolled goods.',
                              source=src + ' ; ' + r['source_file']))
        elif s == UNLISTED_SUPPLIER_2:
            lanes.append(dict(group='An unlisted Shenzhen trader', label='An unlisted Shenzhen trader', first=r['first_row'], last=r['last_row'],
                              rows=int(r['rows_seen']), kind='unlisted', listings=[],
                              note='Not on any list (checker). Main supplier in our rows after the six were listed. Agency-only lead.',
                              source=src + ' ; ' + r['source_file']))
        elif s in L:
            name, ls = L[s]
            lanes.append(dict(group='Six suppliers, all later US-listed', label=name, first=r['first_row'], last=r['last_row'],
                              rows=int(r['rows_seen']), kind='listed',
                              listings=[dict(list=a, date=d, approx=ap) for a, d, ap in ls],
                              note=r['supplier_list_status'], source=src + ' ; ' + r['source_file']))
    buyer_listings = [dict(list='US SDN', date='2023-05-19', approx=False, source='build/viz/listing_lag.js (ofac.treasury.gov/recent-actions/20230519)'),
                      dict(list='UK', date='2023-08-08', approx=False, source='build/viz/listing_lag.js (UK sanctions list)'),
                      dict(list='EU', date='2024-02-23', approx=True, source='agents/b17/buyer_timelines.csv (not rechecked on the official page)')]
    return dict(buyer='Testkomplekt', buyer_rows=9141, buyer_first='2019-01-11', buyer_last='2025-03-10', source_file=src,
                receipt='pulls/tavily/20260925T143518915163Z_26216_search.json (Treasury press release jy2700 names Testkomplekt as customer of One World, Shenzhen A Technology, Innovio)',
                lanes=lanes, buyer_listings=buyer_listings)


def need():
    src = 'pulls/comtrade/b16_8542_8482_exports_to_RUS_2021_2025_AGGREGATE.json'
    d = json.load(open(P(src), encoding='utf-8'))
    yrs = list(range(2021, 2026))
    return dict(source_file=src, hs='8542', unit='USD million, declared values', years=yrs,
                series=[dict(id=c, label=n, values=[round(d[f'8542 {c} {y}'] / 1e6, 3) for y in yrs])
                        for c, n in (('KGZ', 'Kyrgyzstan'), ('KAZ', 'Kazakhstan'))])


out = dict(view='river', status='lead, not finding', generated_by='extract_river.py',
           takeaway='Names change in weeks. The flow, the buyer and the part stay for years.',
           routes=[route('KGZ', 'Kyrgyzstan to Russia'), route('KAZ', 'Kazakhstan to Russia')],
           buyer=buyer(), need=need(), log_file=LOG)
js = '// generated by extract_river.py (file:// pages cannot fetch JSON)\nwindow.RIVER = ' + json.dumps(out, ensure_ascii=False) + ';\n'
open(os.path.join(HERE, 'river.js'), 'w', encoding='utf-8').write(js)
for r in out['routes']:
    print(r['id'], r['records'], 'firms', r['firms'], 'median active days', r['median_active_days'], 'last', r['last'])
    for p in r['pins']:
        print('   pin', p['firm'], p['date'], p['note'], 'approx' if p['approx'] else '')
    print('   bands', [(s['label'], s['n']) for s in r['series']])
print('need', out['need']['series'])
print('lanes', [(l['label'], l['first'], l['last'], l['rows']) for l in out['buyer']['lanes']])
