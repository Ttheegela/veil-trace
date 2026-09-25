"""Merge the list-derived base graph with the research-angle files into the published dataset.

Inputs: base_nodes.json, base_edges.json (build_base.py) + research/*.json (one per research angle, verified).
Outputs: out/nodes.json, out/edges.json, out/meta.json, out/graph_data.json (all three together, for the viewer).
Naming policy (Alex's ruling 2026-09-25 13:35): people only when an official list/release/indictment/court record names
them; an unlisted company keeps its name only when an official record (a government list or release) names it in that
role; otherwise it is shown by a generic description ("unlisted UAE ship manager").
"""
import json, os, glob, re, collections, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out'); os.makedirs(OUT, exist_ok=True)
OFFICIAL_HOSTS = ('treasury.gov', 'ofac', 'gov.uk', 'europa.eu', 'justice.gov', 'federalregister.gov', 'state.gov',
                  'uscourts.gov', 'courtlistener', 'lda.senate.gov', 'fara.gov', 'consilium', 'eur-lex', 'bis.gov', 'trade.gov', 'imo.org', 'gc.ca', 'dfat.gov.au')
ROLE_WORDS = {'manages': 'ship manager', 'operates': 'ship operator', 'owns': 'ship owner', 'linked_to': 'company linked to listed ships',
              'formerly_operated': 'former ship operator', 'insured_by': 'insurer'}
EDGE_TYPES = {'owns', 'manages', 'operates', 'flagged_in', 'formerly_flagged_in', 'registered_in', 'designated_by', 'sold_to',
              'renamed_from', 'carried_cargo_for', 'controls', 'director_of', 'insured_by', 'transferred_cargo_with',
              'sister_shell_of', 'linked_to', 'formerly_operated', 'seized_by', 'charged_by', 'enforced_by', 'master_of'}
from build_base import CNAME, norm_co  # country names  (importing re-runs the base build: cheap and keeps one source of truth)

nodes = {n['id']: n for n in json.load(open(os.path.join(HERE, 'base_nodes.json'), encoding='utf-8'))}
edges = json.load(open(os.path.join(HERE, 'base_edges.json'), encoding='utf-8'))
for e in edges: e.setdefault('angle', 'lists')
for n in nodes.values(): n.setdefault('angle', ['lists'])

def is_official(url):
    return any(h in (url or '').lower() for h in OFFICIAL_HOSTS)

def _key(x): return set(norm_co(x.replace('-', ' ')).split())
def canon_company(rid, name):
    if rid in nodes: return rid
    k1 = _key(name) if name else set(); k2 = _key(rid[3:])
    for k in (k1, k2):
        if not k: continue
        exact = [i for i, n in nodes.items() if n.get('type') == 'company' and _key(n['name']) == k]
        if exact: return exact[0]
    for k in (k1, k2):
        if len(k) < 2: continue
        sup = [i for i, n in nodes.items() if n.get('type') == 'company' and (k < _key(n['name']) or _key(n['name']) < k) and len(_key(n['name'])) >= 2
               and norm_co(n['name']).split()[:1] == sorted(k, key=lambda w: norm_co(name or rid[3:].replace('-', ' ')).split().index(w) if w in norm_co(name or rid[3:].replace('-', ' ')).split() else 99)[:1]]
        if len(sup) == 1: return sup[0]
    return rid
PERSON_ALIASES = {'p:hossein-shamkhani': 'p:shamkhani-mohammad-hossein', 'p:mohammad-hossein-shamkhani': 'p:shamkhani-mohammad-hossein'}
def canon_person(rid, name):
    if rid in PERSON_ALIASES: return PERSON_ALIASES[rid]
    if rid in nodes: return rid
    k = set(re.sub(r'[^a-z ]', ' ', (name or rid[2:].replace('-', ' ')).lower()).split())
    for i, n in nodes.items():
        if n.get('type') == 'person' and set(re.sub(r'[^a-z ]', ' ', n['name'].lower()).split()) == k: return i
    return rid

histories = {}
findings, counts, angles_loaded = [], [], []
_files = {}
for fp in sorted(glob.glob(os.path.join(HERE, 'research', '*.json'))):
    b = os.path.basename(fp)
    if b.startswith('_'): continue
    key = b.replace('.verified.json', '').replace('.json', '')
    if b.endswith('.verified.json') or key not in _files: _files[key] = fp
VERIFIED = {k: fp.endswith('.verified.json') for k, fp in _files.items()}
for fp in sorted(_files.values()):
    try:
        d = json.load(open(fp, encoding='utf-8'))
    except Exception as ex:  # a malformed research file must not break the build; report it
        print('SKIP', fp, ex); continue
    if not isinstance(d, dict) or os.path.basename(fp).startswith('_'): continue
    ang = d.get('angle') or os.path.basename(fp)[:-5]
    angles_loaded.append(ang)
    idmap = {}
    for n in d.get('nodes', []):
        rid = n.get('id', '').strip()
        if n.get('type') == 'company' or rid.startswith('co:'):
            c = canon_company(rid, n.get('name', ''))
            if c != rid: idmap[rid] = c
        if (n.get('type') == 'ship' or rid.startswith('ship:')) and not rid.startswith('IMO'):
            nm = (n.get('name') or rid.split(':', 1)[-1].replace('-', ' ')).upper().replace('.', ' ').replace('  ', ' ').strip()
            hits = [i for i, x in nodes.items() if x.get('type') == 'ship' and nm in {a.upper().replace('.', ' ').strip() for a in [x['name']] + x.get('aliases', [])}]
            if len(hits) == 1: idmap[rid] = hits[0]
        if n.get('type') == 'person' or rid.startswith('p:'):
            c = canon_person(rid, n.get('name', ''))
            if c != rid: idmap[rid] = c
    for n in d.get('nodes', []):
        nid = idmap.get(n.get('id', '').strip(), n.get('id', '').strip())
        if not nid: continue
        if n.get('type') == 'ship' and n.get('imo') and not nid.startswith('IMO'):
            nid = 'IMO' + re.sub(r'\D', '', n['imo'])[:7]
        cur = nodes.setdefault(nid, {'id': nid, 'type': n.get('type'), 'name': n.get('name', nid), 'angle': []})
        if ang not in cur['angle']: cur['angle'].append(ang)
        for k in ('name', 'country', 'role', 'imo'):
            if n.get(k) and not cur.get(k): cur[k] = n[k]
        if n.get('notes'):
            cur.setdefault('research_notes', []).append({'angle': ang, 'text': n['notes']})
        for a in n.get('aliases', []) or []:
            if a and a not in cur.setdefault('aliases', []): cur['aliases'].append(a)
        if n.get('type') == 'person': cur['type'] = 'person'
    for e in d.get('edges', []):
        s, t = e.get('source', ''), e.get('target', '')
        if not s or not t: continue
        s, t = idmap.get(s, s), idmap.get(t, t)
        s, t = PERSON_ALIASES.get(s, s), PERSON_ALIASES.get(t, t)
        if s.startswith('co:') and s not in nodes: s = canon_company(s, ''); 
        if t.startswith('co:') and t not in nodes: t = canon_company(t, '')
        e = dict(e); e['angle'] = ang; e['source'] = s; e['target'] = t
        dd = str(e.get('date', '') or '').strip()
        m1 = re.fullmatch(r'(\d{1,2})[./](\d{1,2})[./](\d{4})', dd)
        if m1: e['date'] = '%s-%02d-%02d' % (m1.group(3), int(m1.group(2)), int(m1.group(1)))
        if e.get('type') == 'designated_by' and s.startswith('gov:') and not t.startswith('gov:'):
            e['source'], e['target'] = t, s; s, t = t, s
        if e.get('type') in ('owns', 'manages', 'operates', 'formerly_operated') and s.startswith('IMO') and not t.startswith('IMO'):
            e['source'], e['target'] = t, s; s, t = t, s
        if e.get('type') in ('managed_by', 'owned_by', 'operated_by'):
            e['type'] = e['type'].replace('_by', 's').replace('manageds', 'manages').replace('owneds', 'owns').replace('operateds', 'operates')
            e['source'], e['target'] = e['target'], e['source']; s, t = t, s
        if ang == 'enforcement' and s.startswith('IMO') and (t.startswith('gov:') or t.startswith('cc:')) and e.get('type') == 'linked_to':
            e['type'] = 'enforced_by'
        if ang == 'enforcement' and s.startswith('p:') and t.startswith('IMO') and e.get('type') == 'operates':
            e['type'] = 'master_of'
        if e.get('type') not in EDGE_TYPES: e['type_raw'] = e.get('type'); e['type'] = 'linked_to'
        for x in (s, t):
            if x not in nodes:
                typ = 'ship' if x.startswith('IMO') else 'person' if x.startswith('p:') else 'country' if x.startswith('cc:') else 'government' if x.startswith('gov:') else 'company'
                nm = CNAME.get(x[3:], x) if typ == 'country' else x.split(':', 1)[-1].replace('-', ' ').upper() if typ != 'ship' else x
                nodes[x] = {'id': x, 'type': typ, 'name': nm, 'angle': [ang], 'stub': True}
        if e.get('confidence') not in ('Documented', 'Lead'): e['confidence'] = 'Lead'
        edges.append(e)
    for imo, h in (d.get('histories') or {}).items():
        histories.setdefault(imo if imo.startswith('IMO') else 'IMO' + imo, []).extend(h)
    for f in d.get('findings', []) or []: findings.append({'angle': ang, 'text': f})
    for c in d.get('counts', []) or []: c = dict(c); c['angle'] = ang; counts.append(c)

# ---- unify lobbying-graph ids (lob:) with fleet company ids (co:) naming the same firm ----
uni = {}
for lid_, ln in list(nodes.items()):
    if not lid_.startswith('lob:'): continue
    cand = 'co:' + lid_[4:].replace('_', '-')
    k = _key(ln['name'])
    hits = [cand] if cand in nodes else [i for i, n in nodes.items() if i.startswith('co:') and n.get('type') == 'company' and k and (_key(n['name']) == k or _key(i[3:]) == _key(lid_[4:].replace('_', ' ')))]
    if len(hits) >= 1:
        uni[lid_] = hits[0]
for old_, new_ in uni.items():
    o = nodes.pop(old_); t = nodes[new_]
    for a in [o['name']] + o.get('aliases', []):
        if a and a not in t.setdefault('aliases', []) and a != t['name']: t['aliases'].append(a)
    for k2 in ('angle', 'research_notes'):
        for x in o.get(k2, []) or []:
            if x not in t.setdefault(k2, []): t[k2].append(x)
    t['lobbying_graph'] = True
for e in edges:
    e['source'] = uni.get(e['source'], e['source']); e['target'] = uni.get(e['target'], e['target'])
for i, n in nodes.items():
    if i.startswith('lob:'): n['lobbying_graph'] = True
print('lobbying ids unified:', len(uni))

# ---- de-duplicate edges (same source, target, type, date keeps every source in a list) ----
merged = {}
for e in edges:
    k = (e['source'], e['target'], e['type'], e.get('date', ''))
    if k not in merged:
        merged[k] = dict(e); merged[k]['sources'] = []
    m = merged[k]
    src = {'url': e.get('source_url', ''), 'file': e.get('source_file', ''), 'quote': e.get('quote', ''), 'record': e.get('record', ''),
           'angle': e.get('angle', ''), 'confidence': e.get('confidence', 'Lead')}
    if src not in m['sources']: m['sources'].append(src)
    if e.get('confidence') == 'Documented': m['confidence'] = 'Documented'
edges = list(merged.values())
for i, e in enumerate(edges): e['id'] = 'e%d' % i

# ---- people policy: keep only people with at least one official source ----
drop = set()
for nid, n in nodes.items():
    if n.get('type') != 'person': continue
    offs = [s for e in edges if nid in (e['source'], e['target']) for s in e['sources'] if is_official(s['url']) or 'OFAC' in (s['record'] or '') or s['angle'] == 'lists']
    if not offs:
        drop.add(nid)
for nid in drop:
    print('DROP person without official source:', nid)
    nodes.pop(nid)
edges = [e for e in edges if e['source'] in nodes and e['target'] in nodes]

# ---- listing status, first listing date, programmes ----
for n in nodes.values():
    n.setdefault('listed_by', []); n.setdefault('programs', []); n.setdefault('aliases', [])
for e in edges:
    if e['type'] == 'designated_by' and e['target'].startswith('gov:'):
        n = nodes[e['source']]; g = e['target'][4:]
        if g not in n['listed_by']: n['listed_by'].append(g)
        if e.get('date'):
            n['first_listed'] = min(filter(None, [n.get('first_listed'), e['date']]))
            n.setdefault('listing_dates', {}).setdefault(g, e['date'])
for n in nodes.values():
    n['listed'] = bool(n['listed_by'])

# ---- display names: unlisted companies ----
def generic(n, roles):
    c = CNAME.get(n.get('country', ''), '')
    role = sorted(roles)[0] if roles else 'company'
    return ('unlisted ' + (c + ' ' if c else '') + role).strip()
roles = collections.defaultdict(set)
official_named = collections.defaultdict(bool)
FLEET_ROLES = {'owns', 'manages', 'operates', 'linked_to', 'formerly_operated', 'sister_shell_of', 'transferred_cargo_with',
               'carried_cargo_for', 'controls', 'director_of', 'insured_by', 'sold_to'}
fleet_actor = collections.defaultdict(bool)
for e in edges:
    if e['type'] in ROLE_WORDS:
        roles[e['source']].add(ROLE_WORDS[e['type']])
    if e['type'] in FLEET_ROLES:
        fleet_actor[e['source']] = True
    if e['source'].startswith('IMO') or e['target'].startswith('IMO'):
        fleet_actor[e['source']] = True; fleet_actor[e['target']] = True
    if any(is_official(s['url']) or s['angle'] == 'lists' for s in e['sources']):
        official_named[e['source']] = True; official_named[e['target']] = True
for nid, n in nodes.items():
    if n.get('type') != 'company': continue
    if n['listed'] or n.get('lobbying_graph'):
        n['name_policy'] = 'show'   # lobbying-graph organisations are named in US lobbying/FARA filings (official records)
    elif not fleet_actor[nid]:
        n['name_policy'] = 'show'   # not a fleet actor (e.g. a research organisation or registry named in a source)
    elif official_named[nid]:
        n['name_policy'] = 'show'
        n['name_note'] = 'Not itself on a sanctions list we hold. Named by an official record in the role shown.'
    else:
        n['name_policy'] = 'generic'
    n['generic_name'] = generic(n, roles[nid])

# ---- scrub names of generic-policy firms from the PUBLIC payload (full copy kept in out/private/) ----
os.makedirs(os.path.join(OUT, 'private'), exist_ok=True)
json.dump({'nodes': list(nodes.values()), 'edges': edges}, open(os.path.join(OUT, 'private', 'graph_full_unscrubbed.json'), 'w', encoding='utf-8'), ensure_ascii=False)
hidden = {}
for nid, n in nodes.items():
    if n.get('type') == 'company' and n.get('name_policy') == 'generic':
        for nm in [n['name']] + n.get('aliases', []):
            if nm and len(nm) > 3: hidden[nm] = n['generic_name']
        n['name'] = n['generic_name']; n['aliases'] = []
        n.pop('merge_notes', None); n.pop('address_us', None)
        n['research_notes'] = [{'angle': r['angle'], 'text': r['text']} for r in n.get('research_notes', [])]
if hidden:
    pat = re.compile('|'.join(re.escape(k) for k in sorted(hidden, key=len, reverse=True)), re.I)
    def scrub(t): return pat.sub(lambda m: '[' + hidden.get(m.group(0), next((v for k, v in hidden.items() if k.lower() == m.group(0).lower()), 'unlisted firm')) + ']', t or '')
    for e in edges:
        for src in e['sources']: src['quote'] = scrub(src['quote'])
        e['quote'] = scrub(e.get('quote', ''))
        for k in ('notes', 'type_raw'):
            if e.get(k): e[k] = scrub(e[k])
    for n in nodes.values():
        for r in n.get('research_notes', []) or []: r['text'] = scrub(r['text'])
        if n.get('role'): n['role'] = scrub(n['role'])
    for hl in histories.values():
        for h in hl:
            h['from'] = scrub(h.get('from', '')); h['to'] = scrub(h.get('to', ''))
    findings[:] = [{'angle': f['angle'], 'text': scrub(f['text'])} for f in findings]
    # generic ids would leak names too: rename ids
    ren = {nid: 'co:unlisted-%03d' % i for i, nid in enumerate(sorted(i for i, n in nodes.items() if n.get('name_policy') == 'generic'))}
    for old, new in ren.items():
        nodes[new] = nodes.pop(old); nodes[new]['id'] = new
    for e in edges:
        e['source'] = ren.get(e['source'], e['source']); e['target'] = ren.get(e['target'], e['target'])
print('scrubbed generic firms:', len(hidden))

# ---- history entries name firms from Ukraine's database: keep a name only if it is a node we show by name ----
SHOWN = {norm_co(n['name']) for n in nodes.values() if n.get('type') == 'company' and n.get('name_policy') == 'show'}
SHOWN |= {norm_co(a) for n in nodes.values() if n.get('type') == 'company' and n.get('name_policy') == 'show' for a in n.get('aliases', [])}
COMPANYISH = re.compile(r'(ltd|llc|l\.l\.c|inc|corp|co\.|company|shipping|marine|maritime|lines|management|shipmanagement|pvt|fze|fzco|dmcc|s\.a|limited|trading|navigation|tankers?|holding)', re.I)
withheld = 0
for hl in histories.values():
    for h in hl:
        for k in ('from', 'to'):
            v = (h.get(k) or '').strip()
            if v and COMPANYISH.search(v) and norm_co(v) not in SHOWN:
                h[k] = 'an unlisted company'; withheld += 1
print('history names withheld:', withheld)

# ---- ship facts ----
for nid, n in nodes.items():
    if n.get('type') != 'ship': continue
    if not n.get('imo') and re.fullmatch(r'IMO\d{7}', nid): n['imo'] = nid[3:]
    n['history'] = sorted(histories.get(nid, []), key=lambda h: h.get('date', ''))
    n['name_count'] = len({a.strip().upper() for a in n['aliases'] if a.strip()} | {n['name'].upper()})
    fl = set(n.get('flags_before', []) or []) | set(n.get('ua_flag_countries', []) or [])
    if n.get('flag_now'): fl.add(n['flag_now'])
    n['flag_count'] = len(fl)
    p = set(n['programs'])
    n['program_group'] = 'both' if {'russia', 'iran'} <= p else 'russia' if 'russia' in p else 'iran' if 'iran' in p else (sorted(p)[0] if p else 'other')

# companies: programme group from their ships
ships_of = collections.defaultdict(set)
for e in edges:
    if e['type'] in ('operates', 'manages', 'owns', 'linked_to', 'formerly_operated') and nodes[e['target']].get('type') == 'ship':
        ships_of[e['source']].add(e['target'])
for nid, n in nodes.items():
    if n.get('type') in ('company', 'person'):
        gs = {nodes[s]['program_group'] for s in ships_of[nid]}
        own = set(n['programs'])
        allp = gs | own
        n['program_group'] = 'both' if ('both' in allp or {'russia', 'iran'} <= allp) else 'russia' if 'russia' in allp else 'iran' if 'iran' in allp else (sorted(allp)[0] if allp else 'other')
        n['ship_count'] = len(ships_of[nid])

if 'co:shamkhani-network' in nodes:
    nodes['co:shamkhani-network']['name_note'] = 'A network, not a single company. US Treasury uses this name for the companies, ships and people around Mohammad Hossein Shamkhani, which it has sanctioned.'
    nodes['co:shamkhani-network']['role'] = 'network named by US Treasury'
# ---- strip bulky / internal fields ----
for n in nodes.values():
    for k in ('stub',):
        n.pop(k, None)

meta = {
    'generated': datetime.datetime.now().isoformat(timespec='minutes'),
    'angles': angles_loaded, 'verified_angles': [k for k, v in VERIFIED.items() if v],
    'counts': {
        'ships': sum(1 for n in nodes.values() if n['type'] == 'ship'),
        'companies': sum(1 for n in nodes.values() if n['type'] == 'company'),
        'people': sum(1 for n in nodes.values() if n['type'] == 'person'),
        'countries': sum(1 for n in nodes.values() if n['type'] == 'country'),
        'edges': len(edges),
        'documented_edges': sum(1 for e in edges if e['confidence'] == 'Documented'),
        'lead_edges': sum(1 for e in edges if e['confidence'] == 'Lead'),
        'ships_russia_and_iran': sum(1 for n in nodes.values() if n.get('program_group') == 'both' and n['type'] == 'ship'),
    },
    'findings': [f for f in findings if f['angle'] in ('studies', 'treasury-iran', 'russia-actions', 'eu-acts', 'enforcement', 'service-providers')],
    'study_counts': [c for c in counts if c['angle'] == 'studies'],
}
extra = os.path.join(HERE, 'meta_text.json')
if os.path.exists(extra):
    meta.update(json.load(open(extra, encoding='utf-8')))
for p in meta.get('patterns', []):
    p['examples'] = [x if x in nodes else next((i for i in nodes if i.startswith(x)), x) for x in p['examples']]
    miss = [x for x in p['examples'] if x not in nodes]
    if miss: print('PATTERN EXAMPLE MISSING', p['id'], miss)
NL = sorted(nodes.values(), key=lambda n: n['id'])
json.dump(NL, open(os.path.join(OUT, 'nodes.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(edges, open(os.path.join(OUT, 'edges.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(meta, open(os.path.join(OUT, 'meta.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
# ---- compact viewer payload: source table + short keys ----
SRC, SIDX, QT, QIDX = [], {}, [], {}
def sidx(url, f):
    k = (url or '', f or '')
    if k not in SIDX: SIDX[k] = len(SRC); SRC.append(list(k))
    return SIDX[k]
def qidx(q):
    q = (q or '')[:300]
    if q not in QIDX: QIDX[q] = len(QT); QT.append(q)
    return QIDX[q]
CE = []
for e in edges:
    CE.append({'i': e['id'], 's': e['source'], 't': e['target'], 'y': e['type'], 'd': e.get('date', ''), 'c': 'D' if e['confidence'] == 'Documented' else 'L',
               'src': [[sidx(x['url'], x['file']), qidx(x['quote']), x.get('record', ''), x.get('angle', ''), 'D' if x.get('confidence') == 'Documented' else 'L'] for x in e['sources']],
               **({'n': e['date_note']} if e.get('date_note') else {})})
KEEP = ('id', 'type', 'name', 'aliases', 'imo', 'programs', 'program_group', 'listed_by', 'listed', 'first_listed', 'listing_dates', 'country',
        'role', 'ship_type', 'year_built', 'flag_now', 'flags_before', 'flag_us', 'mmsi_us', 'names_by_source', 'ua_former_names', 'ship_count',
        'name_count', 'flag_count', 'name_policy', 'generic_name', 'name_note', 'history', 'research_notes', 'merge_notes', 'address_us',
        'sources', 'gap_days_us_minus_uk', 'uk_id', 'angle', 'country_basis')
CN = [{k: n[k] for k in KEEP if n.get(k) not in (None, '', [], {})} for n in NL]
payload = {'nodes': CN, 'edges': CE, 'sources': SRC, 'quotes': QT, 'meta': meta}
json.dump(payload, open(os.path.join(OUT, 'graph_data.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
open(os.path.join(OUT, 'graph_data.js'), 'w', encoding='utf-8').write('window.FLEET_DATA=' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';')
print(json.dumps(meta['counts'], indent=1))
