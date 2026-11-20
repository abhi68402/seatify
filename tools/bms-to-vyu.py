"""Turn BookMyShow seat extracts (halls.json, from tools/bms-seatmap.js) + researched facts
(facts_*.json: name, area, single, tags, halls specs, rating, highlights, district) into Vyu entries.
Usage: python3 -I tools/bms-to-vyu.py <dir with halls.json, facts_*.json, venues.tsv> <out dir> [codes...]"""
import json, re, sys, os

D = sys.argv[1]; OUT = sys.argv[2]
H = json.load(open(os.path.join(D, 'halls.json')))
F = {}
for g in ['aa', 'ab', 'ac']: F.update(json.load(open(os.path.join(D, f'facts_{g}.json'))))
V = {}
for line in open(os.path.join(D, 'venues.tsv')):
    c, name, lat, lng, area = line.rstrip('\n').split('\t'); V[c] = dict(bms=name, lat=float(lat), lng=float(lng), addr=area)

SKIP = {'CPHY'}  # unlabelled box sections; add with the next batch
IDS = {'AACN': 'aparna-nallagandla', 'CTNR': 'cinepolis-tnr', 'SRMO': 'sree-ramulu', 'MMCA': 'miraj-cinetown', 'IGMH': 'inox-gsm',
       'MMAH': 'moviemax-amr', 'ILKS': 'pvr-lakeshore', 'CVMU': 'cineverse-uppal', 'CPMH': 'cinepolis-lulu', 'GPRH': 'gpr-nizampet',
       'ASHN': 'asian-cinemart', 'SRCM': 'sai-ranga', 'BRKH': 'bhramaramba', 'MAHM': 'mallikarjuna', 'AMCA': 'asian-mcube',
       'ABCS': 'cinepolis-dsl', 'GOKU': 'gokul', 'PNNG': 'pvr-galleria',
       'PVYH': 'pvr-central', 'PVTP': 'pvr-preston', 'INMH': 'inox-kachiguda', 'ARMH': 'asian-radhika', 'MCSS': 'miraj-shalini-shivani',
       'PRCX': 'pvr-rk-cineplex', 'TVHY': 'tivoli', 'PIMH': 'pvr-irrum-manzil', 'CMMA': 'cinepolis-mantra', 'IOMH': 'inox-odeon'}
codes = sys.argv[3:] or [c for c in H if c not in SKIP]

def slug(s): return re.sub(r'[^a-z0-9]+', '-', s.lower().replace('&', ' ')).strip('-')
def title(s):
    s = re.sub(r'\bROWS\b', '', s).strip()
    return ' '.join(w if w in ('VIP',) else w.capitalize() for w in s.split())
def tier_of(cat, single):
    u = cat.upper()
    if 'LOUNG' in u: return 'lounger'
    if 'RECLIN' in u or u == 'VIP': return 'recliner'
    if 'SOFA' in u: return 'semi'
    if single and re.search(r'BALCONY|BOX|MAHARAJA|UPPER', u): return 'balcony'
    if 'BOX' in u: return 'prime'
    if re.search(r'GOLD|ROYAL|PRIME|PLATINUM|EXECUTIVEP', u): return 'prime'
    return 'classic'
def is_balc(cat): return bool(re.search(r'BALCONY|BOX|MAHARAJA|UPPER', cat.upper()))
def num_of(s):
    m = re.search(r'(\d+)', s); return int(m.group(1)) if m else None

def match_hall(code, screen):
    halls = (F.get(code) or {}).get('halls') or []
    if len(halls) == 1: return halls[0]
    u = screen.upper()
    for kw in ['MACRO', 'PXL', 'P[XL]', 'MAGNUS', 'INFINITY', 'EXTREEME']:
        if kw in u.replace(' ', ''):
            for h in halls:
                if kw.replace('[', '').replace(']', '') in h['screen'].upper().replace('[', '').replace(']', '').replace(' ', ''): return h
    n = num_of(screen)
    for h in halls:
        if num_of(h['screen']) == n: return h
    return None

for c in codes: IDS.setdefault(c, slug((F.get(c) or {}).get('short') or V[c]['bms']))

def js(s): return "'" + s.replace("\\", "\\\\").replace("'", "\\'") + "'"

def build(code):
    h, f, v = H[code], F.get(code, {}), V[code]
    single = bool(f.get('single'))
    # parse rows into groups
    groups, cur = [], None
    for line in h['rows']:
        if line.startswith('##'):
            m = re.match(r'##\s*(?:₹(\d+))?\s*(.*?)\s*\[', line)
            price, cat = (int(m.group(1)) if m.group(1) else None), m.group(2)
            if cat in ('?', ''): cat = 'Box'  # unsold box seats carry no price, so no '₹' title
            cur = {'cat': cat, 'price': price, 'rows': []}; groups.append(cur); continue
        rtl = line.startswith('RTL ')
        body = line[4:] if rtl else line
        body = body.strip().strip("'")
        cur['rows'].append((body, rtl))
    allrows = [r for g in groups for r, _ in g['rows'] if r != '-']
    width_cols = max(len(r.split(None, 1)[1]) for r in allrows)
    hall_rtl = all(rt for g in groups for r, rt in g['rows'] if r != '-')
    any_rtl = any(rt for g in groups for r, rt in g['rows'] if r != '-')
    if any_rtl and not hall_rtl: raise SystemExit(code + ': mixed rtl rows, handle by hand')
    spec = match_hall(code, h['screen'])
    w_ft = spec and spec.get('width_ft')
    est = not w_ft
    seat_w = width_cols * 0.55
    w = round(w_ft * 0.3048, 2) if w_ft else round(max(8.0, min(20.0, seat_w * 0.78)) * 2) / 2
    sh = round(w * 0.48, 2)
    first = round(max(4.2, (0.42 if single else 0.4) * w), 1)
    atmos = 'ATMOS' in (h['attrs'] + ' ' + str(spec and spec.get('sound'))).upper()
    a = h['attrs'].upper()
    fmt = 'PXL' if 'PXL' in a else 'LARGE' if re.search(r'MACRO|LARGE|INFINITY', a) else '70MM' if '70MM' in (h['screen'] + ' ' + f.get('name', '')).upper() else 'LASER' if 'LASER' in a or (spec and 'laser' in str(spec.get('projector')).lower()) else '2D'
    # hall display name
    sn = h['screen']
    if single: hname = 'Main Screen' + (' · 70mm' if '70MM' in (sn + f.get('name', '')).upper() else '')
    else:
        n = num_of(sn); base = ('Audi ' if re.search(r'AUDI', sn, re.I) else 'Screen ') + str(n) if n else title(sn)
        extra = 'Macro XE' if 'MACRO' in a else 'P[XL]' if 'PXL' in a else 'Magnus' if 'MAGNUS' in sn.upper() else 'Infinity Vision' if 'INFINITY' in a else ''
        hname = base + (' · ' + extra if extra else '')
        if spec and '(' in spec['screen']: hname = re.sub(r'\s*\((.*)\)', r' · \1', spec['screen'])
    note = (f"{w_ft:g} ft wide ({spec.get('url','').split('/')[2].replace('www.','')})" if w_ft else 'Screen size estimated from the seating width') + '; height estimated'
    # sections
    seen_letters = set()
    def group_js(g, tier):
        letters = {r.split(None, 1)[0].split(':')[0] for r, _ in g['rows'] if r != '-'}
        lab = title(g['cat'])
        needs_prefix = bool(letters & seen_letters) or any(l.isdigit() for l in letters)
        seen_letters.update(letters)
        parts = [f"tier: '{tier}'", f"label: {js(lab)}"]
        if needs_prefix: parts.append(f"prefix: {js(lab.replace(' Class', '') if lab.endswith(' Class') else lab)}")
        if g['price']: parts.append(f"price: {g['price']}")
        if tier in ('recliner', 'lounger', 'semi'): parts.append('colW: 0.7')
        rows = ',\n'.join('            ' + js(r) for r, _ in g['rows'])
        return '          { ' + ', '.join(parts) + ', rows: [\n' + rows + ',\n          ] }'
    if single:
        balc = [g for g in groups if is_balc(g['cat'])]
        stalls = [g for g in groups if not is_balc(g['cat'])]
        secs = []
        # register letters in on-screen order (balcony first) so prefixes go on the later, repeated classes
        balc_js = [group_js(g, tier_of(g['cat'], True)) for g in balc]
        stall_js = [group_js(g, tier_of(g['cat'], True)) for g in stalls]
        if stalls: secs.append("        { name: 'Stalls', grid: [\n" + ',\n'.join(stall_js) + ',\n        ] }')
        if balc: secs.append("        { name: 'Balcony', balcony: { stack: true, lift: 1.2, gap: 1 }, riser: 0.3, grid: [\n" + ',\n'.join(balc_js) + ',\n        ] }')
        riser = 0.25
    else:
        secs = ["        { name: 'Stalls', grid: [\n" + ',\n'.join(group_js(g, tier_of(g['cat'], False)) for g in groups) + ',\n        ] }']
        riser = 0.35
    nm = f.get('name') or v['bms']; short = f.get('short') or nm; area = f.get('area') or ''
    tags = f.get('tags') or []
    others = '; '.join(h['screens'])
    hall = (f"      // BookMyShow seat objects, {h['n']} seats ({h['screen']}, read {('21' if '20261121' in h['url'] else '20')} Nov 2026). Biggest of: {others}\n"
            f"      name: {js(hname)}, format: '{fmt}'{', atmos: true' if atmos else ''}, screenNote: {js(note)},\n"
            f"      screen: {{ w: {w}, h: {sh}, bottom: 1.2, curve: 0 }},\n"
            f"      firstRow: {first}, riser: {riser}{', rtl: true' if hall_rtl else ''},\n"
            f"      sections: [\n" + ',\n'.join(secs) + ",\n      ],\n")
    entry = (f"  {{\n    id: '{IDS[code]}', name: {js(nm)}, short: {js(short)}, area: {js(area)},\n"
             f"    lat: {v['lat']}, lng: {v['lng']}, single: {'true' if single else 'false'}, source: 'bms', tags: [{', '.join(js(t) for t in tags)}],\n"
             f"    hall: {{\n{hall}    }},\n  }},\n")
    # info.js
    r = f.get('rating')
    info = [f"  '{IDS[code]}': {{"]
    if r: info.append(f"    rating: {{ value: {r['value']}, count: {r.get('count') or 0}, src: {js(r['src'])}, url: {js(r['url'])} }},")
    hl = f.get('highlights') or []
    info.append('    highlights: [\n' + '\n'.join(f"      {{ text: {js(x['text'])}, src: {js(x['src'])}, url: {js(x['url'])} }}," for x in hl[:3]) + '\n    ],')
    if spec:
        info.append(f"    halls: [\n      {{ width: {js(f'{w_ft:g} ft') if w_ft else 'null'}, projector: {js(spec.get('projector') or '—')}, sound: {js(spec.get('sound') or '—')}, which: {js(spec['screen'])}, url: {js(spec['url'])} }},\n    ],")
    info.append('  },')
    bms_url = f"https://in.bookmyshow.com/cinemas/hyderabad/{slug(v['bms'])}/{code}"
    booking = f"  '{IDS[code]}': {{ bms: {js(bms_url)}, district: {js(f['district']) if f.get('district') else 'null'} }},"
    return entry, '\n'.join(info), booking, dict(code=code, id=IDS[code], n=h['n'], w=w, est=est, fmt=fmt, single=single)

E, I, B, S = [], [], [], []
for c in codes:
    e, i, b, s = build(c); E.append(e); I.append(i); B.append(b); S.append(s)
open(os.path.join(OUT, 'gen_data.js'), 'w').write(''.join(E))
open(os.path.join(OUT, 'gen_info.js'), 'w').write('\n'.join(I) + '\n')
open(os.path.join(OUT, 'gen_booking.js'), 'w').write('\n'.join(B) + '\n')
for s in S: print(s)
