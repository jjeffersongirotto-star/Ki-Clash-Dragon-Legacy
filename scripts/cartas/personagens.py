"""
v0.30.0 — gera src/core/charactersNew.ts (as 99 cartas novas do jogo) a partir de docs/cartas.json.
Uso: python3 scripts/cartas/personagens.py   (depois de `npx vite-node scripts/cartas/gerar.ts`)
"""
import hashlib
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
d = json.load(open(os.path.join(ROOT, 'docs', 'cartas.json')))
src = open(os.path.join(ROOT, 'src', 'core', 'abilities.ts')).read()
known = set(re.findall(r"^  (\w+): \{\n    id: '", src, re.M))
RACE_COL = {'humano': ('#38bdf8', '#e9c46a'), 'extraterrestre': ('#c084fc', '#7dd3fc'), 'monstro': ('#fb923c', '#a16207'),
            'mago': ('#f472b6', '#a78bfa'), 'androide': ('#2dd4bf', '#94a3b8'), 'necromante': ('#a3e635', '#3f3f46')}
SKIN = {'humano': '#f1c27d', 'extraterrestre': '#c4b5fd', 'monstro': '#a3b18a', 'mago': '#f5d0c5', 'androide': '#cbd5e1', 'necromante': '#cfd8c4'}
out = []
for c in d['cartas']:
    if c.get('existente'):
        continue
    missing = [h for h in c['habs'] if h not in known]
    if missing:
        raise SystemExit(f"{c['id']}: habilidade sem implementação no jogo: {missing}")
    hsh = int(hashlib.md5(c['id'].encode()).hexdigest(), 16)
    p, sec = RACE_COL[c['raca']]
    parts = c['nome'].split(' ')
    title = (next((w for w in reversed(parts) if '-' in w), None) or parts[-1]).replace('-', ' ')
    cat = c['grupo']
    out.append(f"""  {{
    ...base,
    id: {json.dumps(c['id'])},
    name: {json.dumps(c['nome'], ensure_ascii=False)},
    title: {json.dumps(title, ensure_ascii=False)},
    category: {json.dumps(cat)},
    plusStat: {json.dumps('hp' if cat in ('tanque', 'suporte') else 'atk')},
    race: {json.dumps(c['raca'])},
    minStars: {c['min']},
    maxStars: {c['max']},
    cost: {c['espera']},
    atk: {c['atk']},
    hp: {c['hp']},
    damageType: {json.dumps(c['dano'])},
    abilities: {json.dumps(c['habs'])},
    palette: {{ primary: '{p}', secondary: '{sec}', hair: '#{hsh % 0xffffff:06x}', aura: '{p}', skin: '{SKIN[c['raca']]}', eyes: '#{(hsh >> 24) % 0xffffff:06x}' }},
    hairStyle: {hsh % 8},
    lore: {json.dumps(c['lore'], ensure_ascii=False)},
  }},""")
HDR = '''/**
 * v0.30.0 — as 99 cartas novas (projeto em CARTAS.md / docs/cartas.json), com arte ilustrada em src/assets/chars/.
 * ARQUIVO GERADO por scripts/cartas/personagens.py a partir de docs/cartas.json — não editar à mão.
 * Saem só no 🎴 Banner da Loja (não vêm em pacote de fase nem no começo do jogo).
 */
import type { CharacterDef } from './types';

const base = { move: 2, range: 1, physRes: 0, magRes: 0 };

export const NEW_CHARACTERS: CharacterDef[] = [
'''
open(os.path.join(ROOT, 'src', 'core', 'charactersNew.ts'), 'w').write(HDR + '\n'.join(out) + '\n];\n')
print(len(out), 'cartas novas')
