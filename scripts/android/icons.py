"""Gera os ícones e as telas de abertura do app Android a partir dos ícones do PWA (public/).

Rodar na raiz do projeto: python3 scripts/android/icons.py
"""
from pathlib import Path
from PIL import Image, ImageDraw

RES = Path('android/app/src/main/res')
BG = (11, 13, 26)  # --bg do jogo (#0b0d1a)
icon = Image.open('public/icon-512.png').convert('RGBA')
maskable = Image.open('public/icon-maskable-512.png').convert('RGBA')

DENS = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
for d, k in DENS.items():
    folder = RES / f'mipmap-{d}'
    s = round(48 * k)
    icon.resize((s, s), Image.LANCZOS).save(folder / 'ic_launcher.png')
    # ícone redondo: o ícone recortado num círculo
    round_ = icon.resize((s, s), Image.LANCZOS)
    mask = Image.new('L', (s * 4, s * 4), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, s * 4 - 1, s * 4 - 1), fill=255)
    round_.putalpha(mask.resize((s, s), Image.LANCZOS))
    round_.save(folder / 'ic_launcher_round.png')
    # ícone adaptável (Android 8+): camada da frente de 108 dp com a arte "maskable" inteira
    f = round(108 * k)
    maskable.resize((f, f), Image.LANCZOS).save(folder / 'ic_launcher_foreground.png')

# telas de abertura: fundo do jogo com o ícone no centro (mesmos tamanhos gerados pelo Capacitor)
for splash in RES.glob('drawable*/splash.png'):
    w, h = Image.open(splash).size
    out = Image.new('RGB', (w, h), BG)
    s = min(w, h) // 3
    out.paste(icon.resize((s, s), Image.LANCZOS), ((w - s) // 2, (h - s) // 2), icon.resize((s, s), Image.LANCZOS))
    out.save(splash)

(RES / 'values/ic_launcher_background.xml').write_text(
    '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#0B0D1A</color>\n</resources>\n'
)
print('ícones e telas de abertura gerados')
