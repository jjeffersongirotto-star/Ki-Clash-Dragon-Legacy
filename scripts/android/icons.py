"""Gera os ícones do PWA (public/) e os ícones e as telas de abertura do app Android a partir da arte do ícone.

Rodar na raiz do projeto: python3 scripts/android/icons.py [arte.jpg]
(sem argumento usa scripts/android/icone-fonte.jpg — v0.41.0: dragão dourado em anel com cartas, fundo cósmico)

- public/icon-512.png e icon-192.png ("any"): a arte inteira, quadrada.
- public/icon-maskable-512.png: o anel do dragão reduzido para caber no círculo seguro do meio (60% do lado),
  por cima do fundo cósmico (os raios da arte esticados para fora do anel) — nada importante é cortado por máscara redonda ou "squircle".
- Android: ic_launcher (arte inteira), ic_launcher_round (arte recortada num círculo) e o ícone adaptável
  (Android 8+): fundo = os raios da arte esticados para fora do anel (108 dp); frente = disco com o anel do dragão dentro da zona segura
  de 66 dp (bordas suaves, o resto transparente).
- Telas de abertura: fundo do jogo com o ícone redondo no centro.
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

SRC = Path(sys.argv[1] if len(sys.argv) > 1 else 'scripts/android/icone-fonte.jpg')
RES = Path('android/app/src/main/res')
BG = (11, 13, 26)  # --bg do jogo (#0b0d1a)
N = 1024

art = Image.open(SRC).convert('RGB').resize((N, N), Image.LANCZOS)
# o anel do dragão (com os chifres) fica num círculo de raio ~0,44 do lado, com o centro um pouco acima do meio
RING_CX, RING_CY, RING_R = 0.515, 0.48, 0.445


def soft_disc(size: int, radius: float, feather: float) -> Image.Image:
    """Máscara circular (0–255) com borda suave: `radius` e `feather` em fração do lado."""
    big = size * 4
    m = Image.new('L', (big, big), 0)
    r = radius * big
    ImageDraw.Draw(m).ellipse((big / 2 - r, big / 2 - r, big / 2 + r, big / 2 + r), fill=255)
    return m.resize((size, size), Image.LANCZOS).filter(ImageFilter.GaussianBlur(feather * size))


def placed(size: int, safe: float) -> tuple[Image.Image, int, int]:
    """A arte reduzida para o anel do dragão ter raio `safe` (fração do lado) e a posição dela no quadro `size`."""
    s = round(size * safe / RING_R)
    return art.resize((s, s), Image.LANCZOS), round(size / 2 - RING_CX * s), round(size / 2 - RING_CY * s)


def ring_layer(size: int, safe: float) -> Image.Image:
    """O anel do dragão centrado num quadro `size`, com raio `safe` (fração do lado); fora dele, transparente."""
    scaled, x, y = placed(size, safe)
    out = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    out.paste(scaled.convert('RGBA'), (x, y))
    out.putalpha(soft_disc(size, safe * 1.06, 0.012))
    return out


def cosmic_bg(size: int, safe: float) -> Image.Image:
    """
    Fundo: os raios da própria arte "esticados" para fora. Cada ponto fora do disco do dragão pega a arte original
    no mesmo ângulo, a partir da borda do anel — os raios continuam saindo do anel, sem o anel borrado nem cópias.
    """
    src = np.asarray(art, dtype=np.float32)
    cx, cy = RING_CX * N, RING_CY * N
    yy, xx = np.mgrid[0:size, 0:size].astype(np.float32) + 0.5
    dx, dy = xx - size / 2, yy - size / 2
    d = np.hypot(dx, dy)
    ang = np.arctan2(dy, dx)
    d0 = safe * 1.06 * size  # borda do disco da frente
    r0 = RING_R * 1.06 * N  # a mesma borda, na arte original
    dmax = size * 0.7072
    rho = r0 + np.clip((d - d0) / (dmax - d0), 0, 1) * (N * 0.7 - r0)
    rho = np.where(d < d0, d / d0 * r0, rho)
    sx = np.clip(cx + rho * np.cos(ang), 0, N - 1).astype(np.int32)
    sy = np.clip(cy + rho * np.sin(ang), 0, N - 1).astype(np.int32)
    bg = Image.fromarray(src[sy, sx].astype(np.uint8)).filter(ImageFilter.GaussianBlur(size * 0.003))
    return ImageEnhance.Brightness(bg).enhance(0.92).convert('RGBA')


def maskable(size: int) -> Image.Image:
    bg = cosmic_bg(size, 0.30)
    bg.alpha_composite(ring_layer(size, 0.30))
    return bg


def rounded(size: int) -> Image.Image:
    im = art.resize((size, size), Image.LANCZOS).convert('RGBA')
    im.putalpha(soft_disc(size, 0.5, 0.0))
    return im


Path('public').mkdir(exist_ok=True)
art.resize((512, 512), Image.LANCZOS).save('public/icon-512.png', optimize=True)
art.resize((192, 192), Image.LANCZOS).save('public/icon-192.png', optimize=True)
maskable(512).convert('RGB').save('public/icon-maskable-512.png', optimize=True)

DENS = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
for d, k in DENS.items():
    folder = RES / f'mipmap-{d}'
    s = round(48 * k)
    art.resize((s, s), Image.LANCZOS).save(folder / 'ic_launcher.png')
    rounded(s).save(folder / 'ic_launcher_round.png')
    # ícone adaptável: 108 dp; a zona segura é o círculo de 66 dp do meio (raio 0,305 do lado)
    f = round(108 * k)
    ring_layer(f, 0.295).save(folder / 'ic_launcher_foreground.png')
    cosmic_bg(f, 0.295).convert('RGB').save(folder / 'ic_launcher_background.png')

# telas de abertura: fundo do jogo com o ícone redondo no centro (mesmos tamanhos gerados pelo Capacitor)
for splash in RES.glob('drawable*/splash.png'):
    w, h = Image.open(splash).size
    out = Image.new('RGB', (w, h), BG)
    s = round(min(w, h) * 0.45)
    ic = rounded(s)
    out.paste(ic, ((w - s) // 2, (h - s) // 2), ic)
    out.save(splash)

ADAPTIVE = (
    '<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n'
    '    <background android:drawable="@mipmap/ic_launcher_background"/>\n'
    '    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n</adaptive-icon>'
)
for name in ('ic_launcher.xml', 'ic_launcher_round.xml'):
    (RES / 'mipmap-anydpi-v26' / name).write_text(ADAPTIVE)
(RES / 'values/ic_launcher_background.xml').write_text(
    '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#0B0D1A</color>\n</resources>\n'
)
print('ícones e telas de abertura gerados')
