"""
v0.44.0 — Arenas (fundo da batalha de cada fase).

Uso: python3 scripts/art/build_arenas.py <pasta-com-as-imagens>
Lê NNN_Nome.jpg/.png (NNN = número da fase, 001 a 100), corta no centro na proporção da tela deitada (20:9, sem
esticar) e grava src/assets/arenas/NNN.webp. As imagens de origem NÃO vão para o repositório.
"""
import os, re, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
W, H = 1920, 864
QUALITY = 74


def cover(im, w, h):
    r = w / h
    iw, ih = im.size
    if iw / ih > r:
        nw = round(ih * r)
        im = im.crop(((iw - nw) // 2, 0, (iw - nw) // 2 + nw, ih))
    else:
        nh = round(iw / r)
        im = im.crop((0, (ih - nh) // 2, iw, (ih - nh) // 2 + nh))
    return im.resize((w, h), Image.LANCZOS)


def main(src):
    out = os.path.join(ROOT, 'src', 'assets', 'arenas')
    os.makedirs(out, exist_ok=True)
    n = 0
    for d, _, fs in os.walk(src):
        for f in sorted(fs):
            m = re.match(r'(\d{3})_.*\.(jpe?g|png|webp)$', f, re.I)
            if not m or not 1 <= int(m.group(1)) <= 100:
                continue
            im = Image.open(os.path.join(d, f)).convert('RGB')
            if im.width < 1600:
                print('pequena demais (precisa ~2400×1080):', f, im.size)
            cover(im, W, H).save(os.path.join(out, f'{m.group(1)}.webp'), quality=QUALITY, method=6)
            n += 1
    print('arenas:', n)


if __name__ == '__main__':
    main(sys.argv[1])
