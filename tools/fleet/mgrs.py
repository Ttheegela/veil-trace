"""Group the overlap ships by the manager named in the UK list, and check each manager
against the UK, US and EU lists by normalised name.

Reads <out>/overlap_ships.json (from tiers.py) plus the same public list files.
Writes <out>/managers.json.

REDACTION: by default, a manager with no exact normalised-name hit on any list is written
as "UNLISTED-nn" and its name is not printed. The project's rule is that firms which are
not on an official list are never named in public output. --keep-unlisted-names exists
only for private, local checking; never commit or publish what it produces.

Name matching is exact after normalisation (upper case, punctuation and legal suffixes
removed). It misses transliterations and spelling variants, so "no hit" means
"not found by this matcher", not "proven unlisted".
"""
import argparse, collections, csv, json, os, re

ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
ap.add_argument('--uk', required=True)
ap.add_argument('--us', required=True, help='OpenSanctions OFAC SDN CSV')
ap.add_argument('--eu', default=None, help='OpenSanctions EU financial sanctions CSV (eu_fsf.csv)')
ap.add_argument('--csl', default=None)
ap.add_argument('--out', default='out')
ap.add_argument('--keep-unlisted-names', action='store_true')
a = ap.parse_args()

rows = json.load(open(os.path.join(a.out, 'overlap_ships.json'), encoding='utf-8'))
STOP = {'LTD', 'LIMITED', 'INC', 'CO', 'CORP', 'CORPORATION', 'LLC', 'L', 'C', 'SA', 'S', 'A', 'FZE', 'FZCO', 'FZ',
        'DMCC', 'PVT', 'PRIVATE', 'THE', 'AND', 'COMPANY', 'SOLE', 'PROPRIETORSHIP', 'MAI', 'OPERATION'}


def norm(s):
    s = re.sub(r'[^A-Z0-9 ]', ' ', s.upper()).replace('MGMT', 'MANAGEMENT')
    return ' '.join(t for t in s.split() if t not in STOP)


BLANK = '(blank on UK list)'
mg = collections.defaultdict(lambda: {'A': [], 'AB': [], 'ABC': []})
for r in rows:
    m = r['uk_current_owner_operator'].strip() or BLANK
    k = m if m == BLANK else norm(m)
    for T in ('A', 'AB', 'ABC'):
        if r['tier'][0] in T:
            mg[k][T].append(r['imo'] + ' ' + r['uk_name'])

idx = collections.defaultdict(list)
f = open(a.uk, encoding='utf-8-sig'); next(f)
for row in csv.DictReader(f):
    if row['Type of entity'] or row['Designation Type'] == 'Entity':
        idx[norm(row['Name 6'])].append(('UK', row['Regime Name'][:12], row['Date Designated']))
for fn, lab in ((a.us, 'US'), (a.eu, 'EU')):
    if not fn:
        continue
    for row in csv.DictReader(open(fn, encoding='utf-8')):
        if row['schema'] in ('Person', 'Vessel'):
            continue
        for n in [row['name']] + row['aliases'].split(';'):
            if n:
                idx[norm(n)].append((lab, row['sanctions'][:40], row['first_seen'][:10]))
if a.csl:
    for row in csv.DictReader(open(a.csl, encoding='utf-8')):
        if row['type'] == 'Entity':
            for n in [row['name']] + row['alt_names'].split(';'):
                if n.strip():
                    idx[norm(n)].append(('US-CSL', row['programs'][:30], row['start_date']))

out = []; n_unlisted = 0
for k, v in sorted(mg.items(), key=lambda kv: (-len(kv[1]['A']), -len(kv[1]['ABC']))):
    st = sorted(set(idx.get(k, [])))
    label = k
    if k != BLANK and not st and not a.keep_unlisted_names:
        n_unlisted += 1
        label = f'UNLISTED-{n_unlisted:02d}'
    out.append({'manager_norm': label, 'n_A': len(v['A']), 'n_AB': len(v['AB']), 'n_ABC': len(v['ABC']),
                'ships': v['ABC'], 'exact_norm_list_hits': st})
    print(len(v['A']), len(v['AB']), len(v['ABC']), label, '|', st[:4])
json.dump(out, open(os.path.join(a.out, 'managers.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('redacted', n_unlisted, 'unlisted manager names' if not a.keep_unlisted_names else '(names kept: LOCAL USE ONLY)')
