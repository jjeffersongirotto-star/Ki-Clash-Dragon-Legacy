"""
v0.42.2 — Miniaturas das artes dos personagens para as cartas das GRADES (Coleção, baralho, Treinar, troca).

A grade mostra dezenas de cartas pequenas; com a arte inteira (486×675) o celular decodifica imagens grandes demais
e, ao rolar rápido, as cartas ficam pretas por um instante. A miniatura tem o tamanho que a carta usa na tela.

Uso: python3 scripts/art/build_thumbs.py   (lê src/assets/chars/*.webp, grava src/assets/chars-sm/<id>.webp)
"""
import glob, os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
W, H = 300, 417
QUALITY = 76

out = os.path.join(ROOT, 'src', 'assets', 'chars-sm')
os.makedirs(out, exist_ok=True)
n = 0
for p in sorted(glob.glob(os.path.join(ROOT, 'src', 'assets', 'chars', '*.webp'))):
    Image.open(p).convert('RGB').resize((W, H), Image.LANCZOS).save(os.path.join(out, os.path.basename(p)), quality=QUALITY, method=6)
    n += 1
print('miniaturas:', n)
