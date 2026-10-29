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

# ---------- v0.43.0: rostos para a foto de perfil (src/assets/faces/<id>.webp, 128×128) ----------
# Corte quadrado em volta do rosto: (centro x, centro y, lado) em frações da arte (x e lado pela largura, y pela altura).
# Padrão: rosto no alto e no meio. FACE corrige quem tem o rosto em outro lugar (de cabeça para baixo, monstros…).
FACE_DEFAULT = (0.5, 0.226, 0.46)
FACE = {
    'bufo': (0.5, 0.35, 0.32), 'grub': (0.47, 0.45, 0.35), 'fen': (0.5, 0.64, 0.26), 'ghul': (0.42, 0.38, 0.32),
    'kolossus': (0.4, 0.42, 0.38), 'oculus': (0.5, 0.41, 0.5), 'wex': (0.53, 0.6, 0.26), 'sylith': (0.52, 0.54, 0.22),
    'zynna': (0.31, 0.32, 0.24), 'spindra': (0.5, 0.27, 0.3), 'magra': (0.5, 0.38, 0.3), 'phase3': (0.5, 0.42, 0.22),
    'ysmera': (0.5, 0.39, 0.28), 'lamenta': (0.5, 0.28, 0.3), 'sanguis': (0.5, 0.33, 0.2), 'drakon': (0.5, 0.33, 0.35),
    'bastion2': (0.5, 0.33, 0.4), 'kenji': (0.5, 0.33, 0.3),
}
FACE_PX = 128
fout = os.path.join(ROOT, 'src', 'assets', 'faces')
os.makedirs(fout, exist_ok=True)
for p in sorted(glob.glob(os.path.join(ROOT, 'src', 'assets', 'chars', '*.webp'))):
    cid = os.path.basename(p)[:-5]
    im = Image.open(p).convert('RGB')
    w, h = im.size
    cx, cy, sz = FACE.get(cid, FACE_DEFAULT)
    s = sz * w
    x0 = min(max(0, cx * w - s / 2), w - s)
    y0 = min(max(0, cy * h - s / 2), h - s)
    im.crop((round(x0), round(y0), round(x0 + s), round(y0 + s))).resize((FACE_PX, FACE_PX), Image.LANCZOS).save(os.path.join(fout, f'{cid}.webp'), quality=80, method=6)
print('rostos:', len(os.listdir(fout)))
