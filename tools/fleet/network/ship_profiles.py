"""Per-ship fact sheets, two steps out in the verified graph -> out/watchlist.json (globe cards) and out/ship_profiles.json.

For each listed hull: every name, who listed it and when, flags, operators; then for each operator its officially named
people, parent group (and that group's lobbying links from the lobbying research), registration country, own listings and
sister ships. Uses only out/nodes.json + out/edges.json (already scrubbed of unlisted firm names).
"""
import json, os, re, collections
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, 'out')
N = {n['id']: n for n in json.load(open(os.path.join(OUT, 'nodes.json'), encoding='utf-8'))}
E = json.load(open(os.path.join(OUT, 'edges.json'), encoding='utf-8'))
CN = {i[3:]: n['name'] for i, n in N.items() if i.startswith('cc:')}
ROLE = {'operates': 'operator', 'manages': 'manager', 'linked_to': 'linked company (US list)', 'owns': 'owner', 'formerly_operated': 'former operator'}
OPS = set(ROLE)
out_e, in_e = collections.defaultdict(list), collections.defaultdict(list)
for e in E:
    out_e[e['source']].append(e); in_e[e['target']].append(e)

def src1(e):
    s = e['sources'][0] if e.get('sources') else {}
    return {'url': s.get('url', ''), 'quote': (s.get('quote') or '')[:180], 'conf': e['confidence']}

def is_actor(i):
    return N.get(i, {}).get('type') in ('company', 'person') or i.startswith('lob:')

def ships_of(i):
    return sorted({e['target'] for e in out_e[i] if e['type'] in OPS and N.get(e['target'], {}).get('type') == 'ship'})

def people_of(i):
    ppl = []
    for e in out_e[i] + in_e[i]:
        o = e['target'] if e['source'] == i else e['source']
        if N.get(o, {}).get('type') == 'person':
            ppl.append({'name': N[o]['name'], 'role': N[o].get('role', ''), 'link': e.get('type_raw') or e['type'].replace('_', ' '), **src1(e)})
    seen, uniq = set(), []
    for x in ppl:
        if x['name'] not in seen: seen.add(x['name']); uniq.append(x)
    return uniq

def parents_of(i, depth=0):
    res = []
    for e in in_e[i]:
        if e['type'] in ('controls', 'owns') and is_actor(e['source']) and depth < 3:
            p = e['source']
            res.append({'id': p, 'name': N.get(p, {}).get('name', p.split(':', 1)[-1]), 'link': e['type'], **src1(e)})
            res += parents_of(p, depth + 1)
    return res

def lobbying_of(i):
    res = []
    for e in out_e[i] + in_e[i]:
        if 'lobby' in (e.get('angle', '') + ' '.join(s.get('angle', '') for s in e.get('sources', []))) or (e.get('type_raw') or '').startswith(('lobb', 'client', 'foreign_entity', 'hired', 'registrant', 'funds', 'member')):
            o = e['target'] if e['source'] == i else e['source']
            res.append({'with': N.get(o, {}).get('name', o), 'how': (e.get('type_raw') or e['type']).replace('_', ' '), **src1(e)})
    return res

def op_card(i, ship):
    n = N[i]
    sis = [N[s]['name'] for s in ships_of(i) if s != ship]
    regs = [CN.get(e['target'][3:], '') for e in out_e[i] if e['type'] == 'registered_in']
    par = parents_of(i)
    lob = lobbying_of(i) + [l for p in par for l in lobbying_of(p['id'])]
    return {'name': n['name'], 'type': n['type'], 'country': CN.get(n.get('country', ''), '') or (regs[0] if regs else ''),
            'listed_by': n.get('listed_by', []), 'listing_dates': n.get('listing_dates', {}), 'ship_count': len(ships_of(i)),
            'sister_ships': sis[:6], 'people': people_of(i)[:4], 'parents': [{k: v for k, v in p.items() if k != 'id'} for p in par][:4],
            'lobbying': lob[:4], 'note': n.get('name_note', '')}

profiles = []
for i, n in N.items():
    if n['type'] != 'ship' or not re.fullmatch(r'\d{7}', n.get('imo', '')): continue
    names = []
    for a in [n['name']] + list((n.get('names_by_source') or {}).values()) + n.get('aliases', []) + n.get('ua_former_names', []):
        a = a.strip()
        if a and a.upper() not in {x.upper() for x in names}: names.append(a)
    ops, seen = [], set()
    for e in in_e[i]:
        if e['type'] in OPS and is_actor(e['source']) and e['source'] not in seen:
            seen.add(e['source']); c = op_card(e['source'], i); c['role'] = ROLE[e['type']]; c['conf'] = e['confidence']; ops.append(c)
    ops.sort(key=lambda c: (c['conf'] != 'Documented', -c['ship_count']))
    ppl = [{'name': N[e['source']]['name'], 'role': e['type'].replace('_', ' '), **src1(e)} for e in in_e[i] if N.get(e['source'], {}).get('type') == 'person']
    enf = [{'date': e.get('date', ''), 'by': N.get(e['target'], {}).get('name', ''), **src1(e)} for e in out_e[i] if e['type'] == 'enforced_by']
    cargo = [{'date': e.get('date', ''), 'for': N.get(e['target'], {}).get('name', ''), **src1(e)} for e in out_e[i] if e['type'] == 'carried_cargo_for']
    countries = sorted({CN.get(x, '') for x in [n.get('flag_now'), n.get('flag_us')] + (n.get('flags_before') or []) if x} - {''})
    profiles.append({
        'imo': n['imo'], 'mmsi': n.get('mmsi_us', ''), 'name': n['name'], 'names': names[:10],
        'listed_by': n.get('listed_by', []), 'listing_dates': n.get('listing_dates', {}), 'program_group': n.get('program_group'),
        'first_listed': n.get('first_listed', ''), 'ship_type': n.get('ship_type', ''), 'year_built': n.get('year_built', ''),
        'flag_now': CN.get(n.get('flag_now') or n.get('flag_us', ''), ''), 'flags_before': [CN.get(c, c) for c in (n.get('flags_before') or [])][:6],
        'countries': countries, 'operators': ops[:4], 'people': ppl[:4], 'enforcement': enf[:3], 'cargo': cargo[:2],
        'history': [{k: h.get(k, '') for k in ('date', 'kind', 'from', 'to')} for h in n.get('history', [])][:6],
        'gap_days_us_minus_uk': n.get('gap_days_us_minus_uk')})
json.dump(profiles, open(os.path.join(OUT, 'watchlist.json'), 'w', encoding='utf-8'), ensure_ascii=False)
json.dump({p['imo']: p for p in profiles}, open(os.path.join(OUT, 'ship_profiles.json'), 'w', encoding='utf-8'), ensure_ascii=False)
c = collections.Counter()
for p in profiles:
    c['ships'] += 1; c['with operator'] += bool(p['operators'])
    c['with named people (1-2 steps)'] += bool(p['people'] or any(o['people'] for o in p['operators']))
    c['with parent group'] += any(o['parents'] for o in p['operators'])
    c['with lobbying link'] += any(o['lobbying'] for o in p['operators'])
    c['with enforcement'] += bool(p['enforcement'])
print(dict(c))
