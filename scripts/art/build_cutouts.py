"""
v0.30.1 — Recortes dos personagens (sem fundo) para o Comandante adversário na batalha.

Parte da mesma arte das cartas (scripts/art/build_cards.py: janela da ilustração em resolução original, já sem a gota,
a pílula e a estrela do modelo antigo), tira o fundo com o rembg (modelo para arte anime), limpa a borda
(remove pedaços soltos, suaviza o contorno), corta rente à figura e salva em WebP com transparência.

Uso (as imagens de origem NÃO vão para o repositório; precisa de `pip install rembg onnxruntime`):
  python3 scripts/art/build_cutouts.py <pasta-com-as-imagens-ou-subpastas> [ids...] [--debug pasta]
Sem ids: gera os 20 personagens originais (os únicos que aparecem como Comandante nas fases e no tutorial).
Saída: src/assets/cutouts/<id>.webp (altura máx. H_OUT, largura proporcional)
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_cards import ROOT, clean_art, id_for  # noqa: E402

OUT = os.path.join(ROOT, 'src', 'assets', 'cutouts')
H_OUT = 560
QUALITY = 74
MODEL = 'birefnet-general-lite'


def keep_main(alpha):
    """Mantém só a maior região ligada (e as grandes perto dela); some com pedacinhos soltos do fundo."""
    from scipy import ndimage  # noqa: PLC0415
    solid = alpha > 96
    lab, n = ndimage.label(solid)
    if n <= 1:
        return alpha
    sizes = ndimage.sum(solid, lab, range(1, n + 1))
    big = sizes.max()
    keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= big * 0.06])
    keep = ndimage.binary_dilation(keep, iterations=6)
    return np.where(keep, alpha, 0).astype(np.uint8)


def cutout(session, crop):
    from rembg import remove  # noqa: PLC0415
    rgba = remove(crop, session=session, post_process_mask=True)
    a = np.asarray(rgba).copy()
    alpha = keep_main(a[..., 3])
    # contorno suave: fecha buraquinhos e amacia 1px
    al = Image.fromarray(alpha).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    a[..., 3] = np.minimum(np.asarray(al), alpha.astype(np.uint16) + 40).astype(np.uint8)
    img = Image.fromarray(a, 'RGBA')
    bbox = img.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    if bbox:
        img = img.crop(bbox)
    if img.height > H_OUT:
        img = img.resize((round(img.width * H_OUT / img.height), H_OUT), Image.LANCZOS)
    return img


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    debug = sys.argv[sys.argv.index('--debug') + 1] if '--debug' in sys.argv else None
    if debug:
        args.remove(debug)
        os.makedirs(debug, exist_ok=True)
    src, want = args[0], set(args[1:])
    cards = json.load(open(os.path.join(ROOT, 'docs', 'cartas.json')))['cartas']
    ids = {c['id'] for c in cards}
    if not want:
        want = {c['id'] for c in cards if c.get('existente')}
    from rembg import new_session  # noqa: PLC0415
    session = new_session(MODEL)
    files = [os.path.join(dp, f) for dp, _, fs in os.walk(src) for f in fs if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    os.makedirs(OUT, exist_ok=True)
    done = set()
    for p in sorted(files):
        cid = id_for(p, ids)
        if cid not in want or cid in done:
            continue
        crop = clean_art(p, cid)[0]
        img = cutout(session, crop)
        img.save(os.path.join(OUT, f'{cid}.webp'), 'WEBP', quality=QUALITY, method=6, exact=False)
        if debug:
            bg = Image.new('RGBA', img.size, (40, 20, 60, 255))
            bg.alpha_composite(img)
            bg.convert('RGB').save(os.path.join(debug, f'{cid}.png'))
        done.add(cid)
        print(cid, img.size, os.path.getsize(os.path.join(OUT, f'{cid}.webp')))
    print(f'{len(done)} recortes; faltam: {sorted(want - done)}')


if __name__ == '__main__':
    main()
