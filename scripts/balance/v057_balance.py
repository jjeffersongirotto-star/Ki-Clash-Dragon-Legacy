"""v0.57.0 — passe de balanceamento (rodou uma vez). Entrada: /tmp/chars.json (dump de PLAYABLE com níveis de habilidade).
Corta ATQ/vida base por categoria e define `wait` (1–9) por contrapeso ATQ+vida+habilidades, espalhado dentro de cada raridade mínima."""
import json, re, sys, collections
d = json.load(open(sys.argv[1]))
FA = {'tanque': .5, 'dps': .67, 'assassino': .75, 'arqueiro': .67, 'mago': .7, 'suporte': .6}
FH = {'tanque': .65, 'dps': .7, 'assassino': .7, 'arqueiro': .7, 'mago': .7, 'suporte': .7}
AB = {'basica': 1.0, 'normal': 2.0, 'epica': 3.5}
CAP = {1: 4, 2: 5, 3: 7, 4: 8, 5: 9, 6: 9}
def rnd(x): return int(x + .5)
for c in d:
    c['natk'] = max(1, rnd(c['atk'] * FA[c['cat']]))
    c['nhp'] = max(1, rnd(c['hp'] * FH[c['cat']]))
    c['score'] = c['natk'] * 1.0 + c['nhp'] * .35 + sum(AB[t] for t in c['ab']) + (.5 if c['range'] > 1 else 0) + .5 * (c['pr'] + c['mr']) + .4 * (c['max'] - c['min'])
band = collections.defaultdict(list)
for c in d: band[c['min']].append(c)
for m, cs in band.items():
    cs.sort(key=lambda c: c['score']); n = len(cs)
    for i, c in enumerate(cs):
        c['wait'] = 1 + rnd((CAP[m] - 1) * (i / (n - 1) if n > 1 else .5))
by = {c['id']: c for c in d}
json.dump(by, open('/tmp/balance.json', 'w'))
def patch(path):
    s = open(path).read()
    for cid, c in by.items():
        m = re.search(r'id: ["\']%s["\'],' % re.escape(cid), s)
        if not m: continue
        end = s.find('lore:', m.end())
        blk = s[m.end():end]
        blk = re.sub(r'\n(\s*)atk: \d+,', lambda k: f"\n{k.group(1)}atk: {c['natk']},", blk, count=1)
        blk = re.sub(r'\n(\s*)hp: \d+,', lambda k: f"\n{k.group(1)}hp: {c['nhp']},\n{k.group(1)}wait: {c['wait']},", blk, count=1)
        s = s[:m.end()] + blk + s[end:]
    open(path, 'w').write(s)
patch('src/core/characters.ts'); patch('src/core/charactersNew.ts')
j = json.load(open('docs/cartas.json'))
for c in j['cartas']:
    if c['id'] in by: b = by[c['id']]; c['atk'], c['hp'], c['rodadas'] = b['natk'], b['nhp'], b['wait']
json.dump(j, open('docs/cartas.json', 'w'), ensure_ascii=False, indent=2)
