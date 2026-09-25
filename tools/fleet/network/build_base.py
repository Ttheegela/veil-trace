"""Build the list-derived base graph for the shadow-fleet map.

Joins UK (Russia regime), US (OFAC SDN via OpenSanctions + US Consolidated Screening List) and the Ukraine
war-sanctions database by 7-digit IMO number. Everything here is Documented (it is what the list says),
except company name matches across lists, which are exact-after-normalisation matches and tagged as such.
Output: base_nodes.json, base_edges.json, base_stats.json in this folder.
"""
import csv, json, re, collections, os, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
UK = r'C:/Projects/hackathon-prep/research/R66_climate_data_pack/data/uk_sanctions_list/UK-Sanctions-List.csv'
CSL = r'C:/Projects/hackathon-prep/research/R66_climate_data_pack/data/us_csl/consolidated.csv'
OS = r'C:/Projects/climate-day/data/opensanctions/'

SRC_UK = {'url': 'https://www.gov.uk/government/publications/the-uk-sanctions-list', 'file': 'UK-Sanctions-List.csv (report 21-Sep-2026)'}
SRC_SDN = {'url': 'https://sanctionslist.ofac.treas.gov/Home/SdnList', 'file': 'us_ofac_sdn.csv (OpenSanctions export, 2026-09-25)'}
SRC_CSL = {'url': 'https://www.trade.gov/consolidated-screening-list', 'file': 'us_csl/consolidated.csv'}
SRC_EU = {'url': 'https://data.europa.eu/data/datasets/consolidated-list-of-persons-groups-and-entities-subject-to-eu-financial-sanctions', 'file': 'eu_fsf.csv (OpenSanctions export, 2026-09-25)'}
SRC_UA = {'url': 'https://war-sanctions.gur.gov.ua/en', 'file': 'ua_war_sanctions.csv (OpenSanctions export, 2026-09-25)'}

COUNTRY_ISO = {}
def iso(name):
    if not name: return ''
    n = name.strip().lower()
    return COUNTRY_ISO.get(n, '')

# Minimal country table (names seen in the lists) -> ISO2 and display name
CT = """af Afghanistan|al Albania|dz Algeria|ao Angola|ag Antigua and Barbuda|ar Argentina|am Armenia|au Australia|at Austria|az Azerbaijan|bs Bahamas|bh Bahrain|bd Bangladesh|bb Barbados|by Belarus|be Belgium|bz Belize|bj Benin|bo Bolivia|ba Bosnia and Herzegovina|br Brazil|bn Brunei|bg Bulgaria|kh Cambodia|cm Cameroon|ca Canada|cv Cape Verde|cl Chile|cn China|co Colombia|km Comoros|cg Congo|ck Cook Islands|cr Costa Rica|hr Croatia|cu Cuba|cw Curacao|cy Cyprus|cz Czech Republic|dk Denmark|dj Djibouti|dm Dominica|do Dominican Republic|ec Ecuador|eg Egypt|gq Equatorial Guinea|er Eritrea|ee Estonia|sz Eswatini|et Ethiopia|fj Fiji|fi Finland|fr France|ga Gabon|gm Gambia|ge Georgia|de Germany|gh Ghana|gr Greece|gd Grenada|gt Guatemala|gn Guinea|gw Guinea-Bissau|gy Guyana|ht Haiti|hn Honduras|hk Hong Kong|hu Hungary|is Iceland|in India|id Indonesia|ir Iran|iq Iraq|ie Ireland|im Isle of Man|il Israel|it Italy|ci Ivory Coast|jm Jamaica|jp Japan|jo Jordan|kz Kazakhstan|ke Kenya|ki Kiribati|kp North Korea|kr South Korea|kw Kuwait|kg Kyrgyzstan|la Laos|lv Latvia|lb Lebanon|lr Liberia|ly Libya|lt Lithuania|lu Luxembourg|mo Macau|mg Madagascar|mw Malawi|my Malaysia|mv Maldives|ml Mali|mt Malta|mh Marshall Islands|mr Mauritania|mu Mauritius|mx Mexico|md Moldova|mc Monaco|mn Mongolia|me Montenegro|ma Morocco|mz Mozambique|mm Myanmar|na Namibia|nr Nauru|np Nepal|nl Netherlands|nz New Zealand|ni Nicaragua|ng Nigeria|no Norway|om Oman|pk Pakistan|pw Palau|ps Palestine|pa Panama|pg Papua New Guinea|py Paraguay|pe Peru|ph Philippines|pl Poland|pt Portugal|qa Qatar|ro Romania|ru Russia|rw Rwanda|kn Saint Kitts and Nevis|lc Saint Lucia|vc Saint Vincent and the Grenadines|ws Samoa|sm San Marino|st Sao Tome and Principe|sa Saudi Arabia|sn Senegal|rs Serbia|sc Seychelles|sl Sierra Leone|sg Singapore|sk Slovakia|si Slovenia|sb Solomon Islands|so Somalia|za South Africa|es Spain|lk Sri Lanka|sd Sudan|sr Suriname|se Sweden|ch Switzerland|sy Syria|tw Taiwan|tj Tajikistan|tz Tanzania|th Thailand|tg Togo|to Tonga|tt Trinidad and Tobago|tn Tunisia|tr Turkey|tm Turkmenistan|tv Tuvalu|ug Uganda|ua Ukraine|ae United Arab Emirates|gb United Kingdom|us United States|uy Uruguay|uz Uzbekistan|vu Vanuatu|ve Venezuela|vn Vietnam|vg British Virgin Islands|ye Yemen|zm Zambia|zw Zimbabwe|aw Aruba|bm Bermuda|ky Cayman Islands|gi Gibraltar|sx Sint Maarten|tl Timor-Leste|bq Bonaire|mk North Macedonia|xk Kosovo|lr Liberia"""
CNAME = {}
for part in CT.split('|'):
    code, name = part.split(' ', 1)
    CNAME[code] = name
    COUNTRY_ISO[name.lower()] = code
for alias, code in {'uae': 'ae', 'u.a.e.': 'ae', 'russian federation': 'ru', 'republic of cameroon': 'cm', 'iran (islamic republic of)': 'ir',
                    'turkiye': 'tr', 'türkiye': 'tr', 'hong kong sar': 'hk', 'china, hong kong': 'hk', 'st kitts and nevis': 'kn',
                    'st vincent and the grenadines': 'vc', 'saint vincent and grenadines': 'vc', 'sao tome & principe': 'st',
                    'são tomé and príncipe': 'st', 'cote d\'ivoire': 'ci', 'côte d\'ivoire': 'ci', 'korea, north': 'kp',
                    'democratic people\'s republic of korea': 'kp', 'republic of the marshall islands': 'mh', 'marshall islands (the)': 'mh',
                    'the gambia': 'gm', 'swaziland': 'sz', 'kingdom of eswatini': 'sz', 'burma': 'mm', 'viet nam': 'vn',
                    'united kingdom of great britain and northern ireland': 'gb', 'uk': 'gb', 'united states of america': 'us', 'usa': 'us',
                    'bvi': 'vg', 'virgin islands, british': 'vg', 'unknown': '', 'none identified': '', 'false flag': ''}.items():
    COUNTRY_ISO[alias] = code

def isos(text):
    """Split a flag field like 'Panama, Liberia' or 'Comoros; Gabon' into ISO codes, keeping unknown text."""
    out = []
    for p in re.split(r'[;,/]|\band\b', text or ''):
        p = p.strip().strip('.').strip()
        if not p: continue
        c = iso(p)
        if not c:
            # tolerate 'Cameroon (false flag)' style
            m = re.match(r'([A-Za-z \'\-]+)', p)
            c = iso(m.group(1).strip()) if m else ''
        out.append(c or 'raw:' + p)
    return out

SUFFIX = r'\b(public joint stock|joint stock|pjsc|ojsc|cjsc|pao|insurance company|l\.?l\.?c|llc|ltd|limited|inc|corp|corporation|co|company|dmcc|fze|fzco|fz-llc|fzllc|fz|pte|pvt|private|sa|s\.a|smc|sole proprietorship|jsc|ooo|llp|gmbh|bv|s\.r\.l|srl|sdn bhd|opc|the)\b'
def norm_co(name):
    n = name.lower()
    n = re.sub(r'\(.*?\)', ' ', n)
    n = n.replace('&', ' and ')
    n = re.sub(r'[^a-z0-9 \-]', ' ', n)
    n = n.replace('-', ' ')
    n = re.sub(r'l l c|f z e|fczo|fz llc|llc fz|s a|pvt ltd', ' ', n)
    n = re.sub(SUFFIX, ' ', n)
    n = re.sub(r'\b(ship ?management|shipmanagement)\b', 'shipmanagement', n)
    n = re.sub(r'\s+', ' ', n).strip()
    return n

def co_id(name):
    return 'co:' + norm_co(name).replace(' ', '-')

def imo7(s):
    m = re.search(r'(\d{7})', s or '')
    return m.group(1) if m else ''

def ddmmyyyy(s):
    s = (s or '').strip()
    try:
        return datetime.datetime.strptime(s, '%d/%m/%Y').date().isoformat()
    except ValueError:
        return ''

nodes = {}
edges = []
def node(nid, **kw):
    n = nodes.setdefault(nid, {'id': nid})
    for k, v in kw.items():
        if v in (None, '', []): continue
        if k in ('aliases', 'programs', 'listed_by', 'sources'):
            cur = n.setdefault(k, [])
            for x in (v if isinstance(v, list) else [v]):
                if x and x not in cur: cur.append(x)
        elif k not in n or not n[k]:
            n[k] = v
    return n

def edge(s, t, typ, date='', src=None, quote='', conf='Documented', **kw):
    e = {'source': s, 'target': t, 'type': typ, 'date': date, 'source_url': (src or {}).get('url', ''),
         'source_file': (src or {}).get('file', ''), 'quote': quote, 'confidence': conf}
    e.update(kw)
    edges.append(e)

def country(code):
    if not code or code.startswith('raw:'):
        return None
    return node('cc:' + code, type='country', name=CNAME.get(code, code.upper()), country=code)

for g, nm in [('gov:us', 'United States (sanctioning government)'), ('gov:uk', 'United Kingdom (sanctioning government)'),
              ('gov:eu', 'European Union (sanctioning body)')]:
    node(g, type='government', name=nm)

# ---------------- UK list ----------------
f = open(UK, encoding='utf-8-sig'); next(f)
uk_rows = list(csv.DictReader(f))
uk_entities = {}   # norm name -> (row)
for r in uk_rows:
    if r['Designation Type'] in ('Entity',) and 'Russia' in r['Regime Name']:
        names = [r['Name 6']] + [r[f'Name {i}'] for i in range(1, 6)]
        nm = ' '.join(x for x in names if x.strip()).strip()
        uk_entities.setdefault(norm_co(nm), r)

uk_ships = collections.OrderedDict()
for r in uk_rows:
    im = imo7(r['IMO number'])
    if not im or 'Russia' not in r['Regime Name']:
        continue
    uk_ships.setdefault(im, []).append(r)

def split_ops(text):
    text = (text or '').strip()
    if not text: return []
    parts = re.split(r';|\n| / |\bformerly\b', text)
    return [p.strip().strip(',').strip() for p in parts if len(p.strip()) > 2]

for im, rs in uk_ships.items():
    prim = next((r for r in rs if r['Name type'].lower().startswith('primary')), rs[0])
    sid = 'IMO' + im
    names = [r['Name 6'].strip() for r in rs if r['Name 6'].strip()]
    node(sid, type='ship', name=prim['Name 6'].strip(), imo=im, aliases=names, ship_type=prim['Type of ship'].strip(),
         year_built=prim['Year Built'].strip(), tonnage=prim['Tonnage of ship'].strip(), programs='russia', listed_by='uk')
    n = nodes[sid]
    n['uk_id'] = prim['Unique ID']
    n['uk_name'] = prim['Name 6'].strip()
    n.setdefault('names_by_source', {})['UK list'] = prim['Name 6'].strip()
    d = ddmmyyyy(prim['Date Designated'])
    n['uk_date'] = d
    edge(sid, 'gov:uk', 'designated_by', d, SRC_UK, (prim['Other Information'] or '')[:160], regime='Russia', record=prim['Unique ID'])
    cur = prim['Current believed flag of ship'].strip()
    for c in isos(cur):
        if country(c):
            edge(sid, 'cc:' + c, 'flagged_in', '', SRC_UK, 'Current believed flag of ship: ' + cur, record=prim['Unique ID'])
            n['flag_now'] = c
    for c in isos(prim['Previous flags']):
        if country(c):
            edge(sid, 'cc:' + c, 'formerly_flagged_in', '', SRC_UK, 'Previous flags: ' + prim['Previous flags'].strip()[:120], record=prim['Unique ID'])
            n.setdefault('flags_before', []).append(c)
    for op in split_ops(prim['Current owner/operator (s)']):
        cid = co_id(op)
        if cid == 'co:': continue
        node(cid, type='company', name=re.sub(r'\s+', ' ', op), role='owner/operator (UK list)')
        edge(cid, sid, 'operates', d, SRC_UK, 'UK list, current owner/operator: ' + op[:100], record=prim['Unique ID'])
    for op in split_ops(prim['Previous owner/operator (s)']):
        cid = co_id(op)
        if cid == 'co:': continue
        node(cid, type='company', name=re.sub(r'\s+', ' ', op), role='former owner/operator (UK list)')
        edge(cid, sid, 'formerly_operated', '', SRC_UK, 'UK list, previous owner/operator: ' + op[:100], record=prim['Unique ID'])

# ---------------- US: OpenSanctions SDN export (dates, programmes) ----------------
def prog_class(text):
    t = text.upper()
    if 'IRAN' in t or 'IFSR' in t or '13846' in t or '13902' in t or '13599' in t: base = 'iran'
    elif 'RUSSIA' in t or '14024' in t or 'UKRAINE' in t or '14071' in t: base = 'russia'
    elif 'TERR' in t or 'SDGT' in t or '13224' in t: base = 'terrorism'
    elif 'VENEZUELA' in t or '13850' in t or '13884' in t: base = 'venezuela'
    elif 'DPRK' in t or 'KOREA' in t: base = 'dprk'
    else: base = 'other'
    return base

sdn = list(csv.DictReader(open(OS + 'us_ofac_sdn.csv', encoding='utf-8')))
us_first_seen = {}
us_orgs = {}
for r in sdn:
    if r['schema'] == 'Vessel':
        im = imo7(re.search(r'IMO\d{7}', r['identifiers']).group(0)) if re.search(r'IMO\d{7}', r['identifiers']) else ''
        if im:
            us_first_seen[im] = (r['first_seen'][:10], r['sanctions'], r['name'], r['aliases'], r['countries'])
    elif r['schema'] in ('Organization', 'Company', 'LegalEntity'):
        for nm in [r['name']] + r['aliases'].split(';'):
            if nm.strip():
                us_orgs.setdefault(norm_co(nm), r)

# ---------------- US: Consolidated Screening List (Linked To, flags, owner) ----------------
csl = list(csv.DictReader(open(CSL, encoding='utf-8')))
csl_ent = {}
for r in csl:
    if r['type'] != 'Vessel':
        for nm in [r['name']] + r['alt_names'].split(';'):
            if nm.strip():
                csl_ent.setdefault(norm_co(nm), r)

us_ships = 0
for r in csl:
    if r['type'] != 'Vessel' or 'Treasury' not in r['source']:
        continue
    m = re.search(r'IMO (\d{7})', r['ids'])
    if not m: continue
    im = m.group(1)
    pc = prog_class(r['programs'] + ' ' + r['remarks'])
    fs = us_first_seen.get(im)
    if pc not in ('iran', 'russia', 'terrorism', 'venezuela'):
        continue
    if re.search(r'yacht|passenger', r['vessel_type'], re.I):
        continue
    us_ships += 1
    sid = 'IMO' + im
    alts = [a.strip() for a in r['alt_names'].split(';') if a.strip()]
    node(sid, type='ship', name=r['name'].strip(), imo=im, aliases=[r['name'].strip()] + alts, ship_type=r['vessel_type'],
         programs=pc, listed_by='us', tonnage=r['gross_tonnage'])
    n = nodes[sid]
    n.setdefault('names_by_source', {})['US list'] = r['name'].strip()
    usd = fs[0] if fs else ''
    n['us_date'] = usd
    n['us_programs'] = r['programs']
    edge(sid, 'gov:us', 'designated_by', usd, SRC_SDN, 'Programmes: ' + r['programs'], program=pc, record='OFAC ent_num ' + r['entity_number'],
         date_note='date = first seen on the OFAC list in the OpenSanctions export')
    fl = r['vessel_flag'].strip()
    for c in isos(fl):
        if country(c):
            edge(sid, 'cc:' + c, 'flagged_in', '', SRC_CSL, 'OFAC vessel flag: ' + fl, record='OFAC ent_num ' + r['entity_number'])
            n.setdefault('flag_us', c)
    for ff in re.findall(r'Former Vessel Flag, ([^;]+)', r['ids']):
        for c in isos(ff):
            if country(c):
                edge(sid, 'cc:' + c, 'formerly_flagged_in', '', SRC_CSL, 'OFAC: Former Vessel Flag, ' + ff.strip(), record='OFAC ent_num ' + r['entity_number'])
                n.setdefault('flags_before', [])
                if c not in n['flags_before']: n['flags_before'].append(c)
    mm = re.search(r'MMSI, (\d{9})', r['ids'])
    if mm: n['mmsi_us'] = mm.group(1)
    for lt in re.findall(r'Linked To: ([^)]+)\)', r['remarks']):
        lt = lt.strip()
        cid = co_id(lt)
        ent = csl_ent.get(norm_co(lt))
        role = 'company'
        node(cid, type='company', name=lt, role='linked company (OFAC)')
        edge(cid, sid, 'linked_to', usd, SRC_CSL, 'OFAC vessel entry: (Linked To: ' + lt + ')', record='OFAC ent_num ' + r['entity_number'])
    if r['vessel_owner'].strip():
        cid = co_id(r['vessel_owner'])
        node(cid, type='company', name=r['vessel_owner'].strip(), role='registered owner (OFAC)')
        edge(cid, sid, 'owns', usd, SRC_CSL, 'OFAC vessel owner: ' + r['vessel_owner'].strip(), record='OFAC ent_num ' + r['entity_number'])

# ---------------- EU vessels: OpenSanctions export of the EU Official Journal (downloaded 2026-09-25 14:33 EDT) ----------------
SRC_EUJ = {'url': 'https://eur-lex.europa.eu/eli/reg/2014/833/oj', 'file': 'eu_journal_sanctions.csv (OpenSanctions export of the EU Official Journal, 2026-09-25)'}
eu_ships = 0
for r in csv.DictReader(open(OS + 'eu_journal_sanctions.csv', encoding='utf-8')):
    if r['schema'] != 'Vessel': continue
    m = re.search(r'IMO(\d{7})', r['identifiers'])
    if not m: continue
    im = m.group(1); sid = 'IMO' + im
    pc = 'russia' if 'RUS' in r['program_ids'] or 'UKR' in r['program_ids'] else prog_class(r['program_ids'] + ' ' + r['sanctions'])
    dm = re.findall(r'(\d{4}-\d{2}-\d{2})', r['sanctions'])
    d = min(dm) if dm else ''
    eu_ships += 1
    node(sid, type='ship', name=r['name'].strip(), imo=im, aliases=[r['name'].strip()] + [a for a in r['aliases'].split(';') if a.strip()], programs=pc, listed_by='eu')
    n = nodes[sid]
    n.setdefault('names_by_source', {})['EU list'] = r['name'].strip()
    n['eu_date'] = d
    reason = re.sub(r'\s*-\s*\d{4}-\d{2}-\d{2}$', '', r['sanctions'].split(';')[0])
    edge(sid, 'gov:eu', 'designated_by', d, SRC_EUJ, reason[:200], regime='Russia (Reg. 833/2014 ship list)' if pc == 'russia' else pc, record='OpenSanctions ' + r['id'])

# ---------------- EU FSF vessels (only 2) ----------------
eu = list(csv.DictReader(open(OS + 'eu_fsf.csv', encoding='utf-8')))
eu_orgs = {}
for r in eu:
    if r['schema'] in ('Organization', 'Company', 'LegalEntity'):
        for nm in [r['name']] + r['aliases'].split(';'):
            if nm.strip():
                eu_orgs.setdefault(norm_co(nm), r)

# ---------------- Ukraine database: former names and flag countries for ships already in scope ----------------
ua = list(csv.DictReader(open(OS + 'ua_war_sanctions.csv', encoding='utf-8')))
ua_hits = 0
for r in ua:
    if r['schema'] != 'Vessel': continue
    m = re.search(r'IMO(\d{7})', r['identifiers'])
    if not m: continue
    sid = 'IMO' + m.group(1)
    if sid not in nodes: continue
    ua_hits += 1
    n = nodes[sid]
    al = [a.strip() for a in r['aliases'].split(';') if a.strip()]
    n.setdefault('names_by_source', {})['Ukraine database (current)'] = r['name'].strip()
    n['ua_former_names'] = al
    n['ua_flag_countries'] = [c for c in r['countries'].split(';') if c]
    node(sid, aliases=[r['name'].strip()] + al)
    n.setdefault('sources', [])
    n['sources'].append({'label': 'Ukraine war-sanctions database (not a sanctions list): names and flag countries', 'url': SRC_UA['url'], 'file': SRC_UA['file']})

# ---------------- Company enrichment: listings + registration country ----------------
for nid, n in list(nodes.items()):
    if n.get('type') != 'company': continue
    key = norm_co(n['name'])
    if not key: continue
    r = us_orgs.get(key)
    if r:
        pc = prog_class(r['sanctions'] + ' ' + r['program_ids'])
        node(nid, listed_by='us', programs=pc)
        n['us_date'] = r['first_seen'][:10]
        edge(nid, 'gov:us', 'designated_by', r['first_seen'][:10], SRC_SDN, (r['sanctions'] or '')[:160], program=pc,
             record='OpenSanctions ' + r['id'], date_note='date = first seen on the OFAC list in the OpenSanctions export')
        for c in [x for x in r['countries'].split(';') if x]:
            if country(c):
                edge(nid, 'cc:' + c, 'registered_in', '', SRC_SDN, 'OFAC country: ' + CNAME.get(c, c), record='OpenSanctions ' + r['id'])
                n.setdefault('country', c)
        if r['addresses']: n['address_us'] = r['addresses'][:200]
        ids = r['identifiers']
    else:
        c2 = csl_ent.get(key)
        if c2 and 'Treasury' in c2['source']:
            pc = prog_class(c2['programs'])
            node(nid, listed_by='us', programs=pc)
            n['us_date'] = c2['start_date']
            edge(nid, 'gov:us', 'designated_by', c2['start_date'], SRC_CSL, 'Programmes: ' + c2['programs'], program=pc, record='OFAC ent_num ' + c2['entity_number'])
    r = eu_orgs.get(key)
    if r:
        node(nid, listed_by='eu')
        m = re.search(r'(\d{4}-\d{2}-\d{2})', r['sanctions'])
        n['eu_date'] = m.group(1) if m else ''
        edge(nid, 'gov:eu', 'designated_by', n['eu_date'], SRC_EU, r['sanctions'][:160], record='OpenSanctions ' + r['id'])
        for c in [x for x in r['countries'].split(';') if x]:
            if country(c) and not n.get('country'):
                n['country'] = c
                edge(nid, 'cc:' + c, 'registered_in', '', SRC_EU, 'EU record country: ' + CNAME.get(c, c), record='OpenSanctions ' + r['id'])
    r = uk_entities.get(key)
    if r:
        node(nid, listed_by='uk')
        n['uk_date'] = ddmmyyyy(r['Date Designated'])
        edge(nid, 'gov:uk', 'designated_by', n['uk_date'], SRC_UK, (r['UK Statement of Reasons'] or r['Other Information'])[:200], record=r['Unique ID'])
    # country from the name string e.g. "(UAE)" or ", Dubai"
    if not n.get('country'):
        s = n['name'].lower()
        for pat, c in [(r'\buae\b|dubai|abu dhabi|sharjah|fujairah|ajman', 'ae'), (r'hong kong|\bhk\b', 'hk'), (r'\bindia\b|mumbai|\bpvt\b', 'in'),
                       (r'seychelles', 'sc'), (r'marshall', 'mh'), (r'\bchina\b|shanghai|shenzhen', 'cn'), (r'singapore|\bpte\b', 'sg'),
                       (r'turkey|istanbul', 'tr'), (r'\brussia\b|moscow|st\.? petersburg', 'ru'), (r'panama', 'pa'), (r'liberia', 'lr'), (r'oman|muscat', 'om')]:
            if re.search(pat, s):
                n['country'] = c; n['country_basis'] = 'from the name or address text in the list entry'
                break

# ---------------- Merge unlisted company names into a listed record when the name is contained in it ----------------
def toks(k): return [t for t in k.split() if t not in ('and', 'of', 'shipping', 'marine', 'maritime', 'shipmanagement', 'management', 'lines', 'operation', 'sole', 'proprietorship', 'ships', 'ship')]
listed_keys = {}
for nid, n in nodes.items():
    if n.get('type') == 'company' and n.get('listed_by'):
        listed_keys[nid] = set(norm_co(n['name']).split())
alias_of = {}
for nid, n in nodes.items():
    if n.get('type') != 'company': continue
    key = norm_co(n['name']).split()
    core = toks(' '.join(key))
    if len(key) < 2 or not core: continue
    cands = [lid for lid, kt in listed_keys.items() if lid != nid and set(key) < kt and key[0] == norm_co(nodes[lid]['name']).split()[0]]
    if len(cands) == 1:
        alias_of[nid] = cands[0]
for old, new in alias_of.items():
    while new in alias_of: new = alias_of[new]
    alias_of[old] = new
for old, new in alias_of.items():
    o = nodes.pop(old); t = nodes[new]
    for k in ('listed_by', 'programs'):
        for x in o.get(k, []):
            if x not in t.setdefault(k, []): t[k].append(x)
    for k in ('eu_date', 'uk_date', 'us_date', 'country'):
        if o.get(k) and not t.get(k): t[k] = o[k]
    t.setdefault('aliases', [])
    if o['name'] not in t['aliases']: t['aliases'].append(o['name'])
    t.setdefault('merge_notes', []).append('UK list writes this firm as "%s"; merged with the listed record by name containment (Claude match, check before quoting)' % o['name'])
    if o.get('role') and o['role'] not in t.get('role', ''): t['role'] = (t.get('role', '') + '; ' + o['role']).strip('; ')
for e in edges:
    e['source'] = alias_of.get(e['source'], e['source']); e['target'] = alias_of.get(e['target'], e['target'])
print('merged', len(alias_of), sorted(alias_of.items())[:40])

# ---------------- People named on the lists (OFAC 'Linked To' an individual) ----------------
csl_people = {norm_co(r['name']): r for r in csl if r['type'] == 'Individual'}
sdn_people = {}
for r in sdn:
    if r['schema'] == 'Person':
        for nm in [r['name']] + r['aliases'].split(';'):
            sdn_people.setdefault(norm_co(nm), r)
ren = {}
for nid, n in list(nodes.items()):
    if n.get('type') != 'company': continue
    k = norm_co(n['name'])
    if k in csl_people or (k in sdn_people and k not in us_orgs):
        pid = 'p:' + k.replace(' ', '-')
        n2 = nodes.pop(nid); n2['id'] = pid; n2['type'] = 'person'; n2['role'] = 'individual named by OFAC as linked to listed vessels'
        n2['named_by'] = 'OFAC SDN list'
        nodes[pid] = n2; ren[nid] = pid
for e in edges:
    e['source'] = ren.get(e['source'], e['source']); e['target'] = ren.get(e['target'], e['target'])
print('people from lists', list(ren.values()))

# listed_by / status defaults
for n in nodes.values():
    if n.get('type') in ('ship', 'company', 'person'):
        n['listed'] = bool(n.get('listed_by'))
        n.setdefault('listed_by', [])

# ---------------- Derived facts ----------------
for n in nodes.values():
    if n.get('type') != 'ship': continue
    names = set(a.upper() for a in n.get('aliases', []))
    n['name_count'] = len(names)
    progs = set(n.get('programs', []))
    n['russia_and_iran'] = ('russia' in progs and 'iran' in progs)
    uk_d, us_d = n.get('uk_date'), n.get('us_date')
    if uk_d and us_d and 'iran' in progs:
        n['gap_days_us_minus_uk'] = (datetime.date.fromisoformat(us_d) - datetime.date.fromisoformat(uk_d)).days

# degree for companies
deg = collections.Counter()
for e in edges:
    if e['type'] in ('operates', 'linked_to', 'owns'):
        deg[e['source']] += 1
for nid, n in nodes.items():
    if n.get('type') == 'company':
        n['ship_count'] = deg[nid]

stats = {
    'uk_russia_ships': len(uk_ships), 'eu_ships': eu_ships, 'us_ships_in_scope': us_ships, 'ua_matches': ua_hits,
    'ships_total': sum(1 for n in nodes.values() if n.get('type') == 'ship'),
    'companies_total': sum(1 for n in nodes.values() if n.get('type') == 'company'),
    'companies_listed': sum(1 for n in nodes.values() if n.get('type') == 'company' and n['listed']),
    'russia_and_iran_ships': sum(1 for n in nodes.values() if n.get('russia_and_iran')),
    'edges': len(edges), 'edge_types': collections.Counter(e['type'] for e in edges),
}
json.dump(list(nodes.values()), open(os.path.join(HERE, 'base_nodes.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(edges, open(os.path.join(HERE, 'base_edges.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(stats, open(os.path.join(HERE, 'base_stats.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps(stats, indent=1, default=str))
