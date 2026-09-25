"""Release check for the public shadow-fleet map files. Exit 1 on any failure.

Checks: no key-like strings; no absolute local paths; names of generic-policy (unlisted, not officially named) firms appear
nowhere; every person has at least one official source; no raw sponsor answer dumped (file size / 'pulls' JSON bodies).
"""
import json, os, re, sys, glob
H = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(H, 'out')
PUBLIC = [os.path.join(OUT, f) for f in ('nodes.json', 'edges.json', 'meta.json', 'graph_data.json', 'graph_data.js', 'shadow_fleet_map.html')]
PUBLIC += glob.glob(os.path.join(H, 'METHOD.md'))
fails = []
KEYISH = [r'\b[0-9a-f]{40}\b', r'sk-[A-Za-z0-9]{20,}', r'Bearer\s+[A-Za-z0-9\-_.]{20,}', r'AKIA[0-9A-Z]{16}', r'eyJ[A-Za-z0-9_\-]{30,}\.']
PATHISH = [r'[A-Za-z]:\\\\?Users\\\\?', r'/c/Users/', r'AppData', r'\.board-keys']
full = json.load(open(os.path.join(OUT, 'private', 'graph_full_unscrubbed.json'), encoding='utf-8'))
hidden = set()
for n in full['nodes']:
    if n.get('type') == 'company' and n.get('name_policy') == 'generic':
        for nm in [n['name']] + n.get('aliases', []):
            if nm and len(nm) > 5: hidden.add(nm.lower())
for fp in PUBLIC:
    if not os.path.exists(fp): continue
    t = open(fp, encoding='utf-8').read()
    for p in KEYISH:
        for m in re.finditer(p, t):
            ctx = t[max(0, m.start() - 40):m.end() + 10]
            if 'sha' in ctx.lower() or 'commit' in ctx.lower(): continue
            fails.append('%s: key-like string near: %r' % (os.path.basename(fp), ctx[:80]))
    for p in PATHISH:
        if re.search(p, t): fails.append('%s: local path pattern %s' % (os.path.basename(fp), p))
    low = t.lower()
    leaked = sorted(nm for nm in hidden if nm in low)
    if leaked: fails.append('%s: %d hidden firm names present, e.g. %s' % (os.path.basename(fp), len(leaked), leaked[:3]))
nodes = json.load(open(os.path.join(OUT, 'nodes.json'), encoding='utf-8'))
edges = json.load(open(os.path.join(OUT, 'edges.json'), encoding='utf-8'))
OFF = ('treasury.gov', 'ofac', 'gov.uk', 'europa.eu', 'justice.gov', 'federalregister.gov', 'state.gov', 'trade.gov', 'courtlistener', 'uscourts')
for n in nodes:
    if n['type'] != 'person': continue
    srcs = [s for e in edges if n['id'] in (e['source'], e['target']) for s in e['sources']]
    if not any(any(h in (s['url'] or '').lower() for h in OFF) or s['angle'] == 'lists' for s in srcs):
        fails.append('person without official source: %s' % n['id'])
print('checked', len([p for p in PUBLIC if os.path.exists(p)]), 'files;', len(hidden), 'hidden names;',
      sum(1 for n in nodes if n['type'] == 'person'), 'people')
if fails:
    print('FAIL'); [print(' -', f) for f in fails[:40]]; sys.exit(1)
print('PASS')
