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
# v0.52.0: rosto centralizado e mais justo (sem céu sobrando, ex.: Nara), medido com detector de rosto de anime
# (lbpcascade_animeface) e conferido à mão. Quem não está aqui usa FACE ou o padrão (ex.: Zarek, Kenji, Vorax).
FACE_AUTO = {
    'aethra': (0.503, 0.223, 0.26),
    'aiko': (0.449, 0.222, 0.38),
    'akemi': (0.502, 0.329, 0.359),
    'aya': (0.531, 0.27, 0.331),
    'cador': (0.51, 0.281, 0.26),
    'celina': (0.51, 0.305, 0.283),
    'cria': (0.277, 0.469, 0.42),
    'cryo6': (0.402, 0.306, 0.269),
    'daisuke': (0.531, 0.31, 0.331),
    'dorian': (0.504, 0.161, 0.42),
    'echo5': (0.614, 0.301, 0.317),
    'eldrin': (0.503, 0.244, 0.29),
    'elegia': (0.552, 0.312, 0.327),
    'emi': (0.485, 0.306, 0.375),
    'fenra': (0.676, 0.421, 0.363),
    'gorm': (0.699, 0.34, 0.317),
    'halo8': (0.503, 0.242, 0.327),
    'hana': (0.529, 0.194, 0.42),
    'hayato': (0.626, 0.193, 0.274),
    'ilun': (0.502, 0.236, 0.35),
    'isel': (0.506, 0.262, 0.294),
    'ivra': (0.504, 0.246, 0.35),
    'kael': (0.523, 0.276, 0.416),
    'kaela': (0.508, 0.356, 0.283),
    'kaito': (0.503, 0.304, 0.299),
    'kaori': (0.561, 0.309, 0.308),
    'lethe': (0.523, 0.267, 0.26),
    'lunaris': (0.5, 0.234, 0.42),
    'lyra': (0.512, 0.279, 0.313),
    'masao': (0.519, 0.27, 0.35),
    'medi3': (0.49, 0.2, 0.34),
    'mei': (0.457, 0.225, 0.304),
    'mimic': (0.506, 0.233, 0.283),
    'morgause': (0.506, 0.219, 0.35),
    'morrigan': (0.501, 0.3, 0.26),
    'morv': (0.515, 0.291, 0.336),
    'nalia': (0.578, 0.302, 0.304),
    'nara': (0.537, 0.37, 0.322),
    'nhyra': (0.508, 0.256, 0.359),
    'nocturna': (0.425, 0.272, 0.29),
    'nyx': (0.514, 0.215, 0.313),
    'omega9': (0.582, 0.35, 0.274),
    'pip': (0.423, 0.287, 0.412),
    'pira': (0.506, 0.236, 0.283),
    'riku': (0.514, 0.292, 0.368),
    'rin': (0.458, 0.333, 0.278),
    'sayuri': (0.547, 0.274, 0.26),
    'selene': (0.455, 0.27, 0.34),
    'shin': (0.597, 0.292, 0.322),
    'sora': (0.519, 0.218, 0.26),
    'suri': (0.505, 0.223, 0.327),
    'taro': (0.534, 0.318, 0.308),
    'tetsuo': (0.442, 0.292, 0.42),
    'trokk': (0.494, 0.234, 0.322),
    'varo': (0.494, 0.28, 0.304),
    'vexar': (0.58, 0.508, 0.42),
    'yume': (0.503, 0.315, 0.308),
    'yuna': (0.528, 0.217, 0.336),
}
# v0.53.1: ajuste à mão pedido pelo jogador (rosto no centro; 'flip' = arte de cabeça para baixo, o rosto é girado 180°)
FACE_FIX = {
 'borgo': (0.5, 0.24, 0.32), 'trokk': (0.5, 0.21, 0.3), 'skarr': (0.48, 0.3, 0.3), 'oculus': (0.5, 0.42, 0.45),
 'grendar': (0.47, 0.27, 0.45), 'razorv': (0.45, 0.27, 0.3), 'thessa': (0.48, 0.27, 0.28), 'orun': (0.55, 0.24, 0.3),
 'velka': (0.5, 0.2, 0.32), 'fenra': (0.66, 0.13, 0.32), 'zynna': (0.28, 0.36, 0.3), 'gorm': (0.58, 0.24, 0.3),
 'vexar': (0.36, 0.25, 0.3), 'bolt': (0.62, 0.27, 0.26), 'goro': (0.47, 0.28, 0.3), 'hayato': (0.43, 0.22, 0.3),
 'tobi': (0.47, 0.27, 0.3), 'ren': (0.47, 0.26, 0.28), 'sylith': (0.45, 0.48, 0.26), 'kraz9': (0.45, 0.28, 0.28),
 'vex4': (0.6, 0.27, 0.3), 'fen': (0.44, 0.75, 0.28, 'flip'), 'bram': (0.5, 0.3, 0.34), 'vesna': (0.36, 0.36, 0.28),
 'dorian': (0.5, 0.2, 0.28), 'lamenta': (0.5, 0.33, 0.26), 'drakon': (0.28, 0.44, 0.34),
}
FACE = {**FACE_AUTO, **FACE, **FACE_FIX}
FACE_PX = 128
fout = os.path.join(ROOT, 'src', 'assets', 'faces')
os.makedirs(fout, exist_ok=True)
for p in sorted(glob.glob(os.path.join(ROOT, 'src', 'assets', 'chars', '*.webp'))):
    cid = os.path.basename(p)[:-5]
    im = Image.open(p).convert('RGB')
    w, h = im.size
    v = FACE.get(cid, FACE_DEFAULT)
    cx, cy, sz = v[:3]
    s = sz * w
    x0 = min(max(0, cx * w - s / 2), w - s)
    y0 = min(max(0, cy * h - s / 2), h - s)
    face = im.crop((round(x0), round(y0), round(x0 + s), round(y0 + s))).resize((FACE_PX, FACE_PX), Image.LANCZOS)
    if len(v) > 3 and v[3] == 'flip':
        face = face.rotate(180)
    face.save(os.path.join(fout, f'{cid}.webp'), quality=80, method=6)
print('rostos:', len(os.listdir(fout)))
