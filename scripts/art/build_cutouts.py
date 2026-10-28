"""
v0.30.1 — Recortes dos personagens (sem fundo) para o Comandante adversário na batalha.

Parte da mesma arte das cartas (scripts/art/build_cards.py: janela da ilustração em resolução original, já sem a gota,
a pílula e a estrela do modelo antigo), tira o fundo com o rembg (modelo para arte anime), limpa a borda
(remove pedaços soltos, suaviza o contorno), corta rente à figura e salva em WebP com transparência.

Uso (as imagens de origem NÃO vão para o repositório; precisa de `pip install rembg onnxruntime`):
  python3 scripts/art/build_cutouts.py <pasta-com-as-imagens-ou-subpastas> [ids...] [--debug pasta]
Sem ids: gera os 20 personagens originais (os únicos que aparecem como Comandante nas fases e no tutorial).
Saída: src/assets/cutouts/<id>.webp (altura máx. H_OUT, largura proporcional)
v0.35.0: `--retrato pasta` com as máscaras do birefnet-portrait (ver PORTRAIT). v0.34.0: `--limpas` para ilustrações limpas (usa a imagem inteira), `todos` como id gera todos, `--saida pasta` muda a saída;
imprime quais bordas da imagem a figura toca (figura cortada pela borda não serve de Comandante).
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_cards import ROOT, TOKENS, clean_art, id_for  # noqa: E402

OUT = os.path.join(ROOT, 'src', 'assets', 'cutouts')
H_OUT = 560
QUALITY = 74
MODEL = 'birefnet-general-lite'
# v0.34.0: personagens que se confundem com o chão (ex.: golem de pedra sobre rocha) — soma a máscara de outros modelos
# (com ganho) à do modelo principal e endurece a borda. id → [(modelo, ganho), ...]
MERGE = {'daichi': [('isnet-anime', 2.2), ('isnet-general-use', 2.5)]}
# v0.35.0: efeitos cortados pela metade (ex.: redemoinho da Nyx, anel do Zarek). Usa a máscara do modelo de RETRATO
# (birefnet-portrait, que separa só a pessoa), gerada antes por `--retrato pasta` (<id>.png; o modelo é grande e roda
# um por vez). 'corpo' = máscara principal ∩ retrato dilatado (tira o efeito solto e mantém o corpo inteiro);
# 'uniao' = máscara principal + retrato (o retrato completa o efeito que ficou pela metade). O jogo desenha o efeito que sair.
PORTRAIT = {'nyx': 'corpo', 'zarek': 'uniao'}
# v0.35.0: personagem com buracos no corpo (pé do Daichi recortado como só o contorno): fecha e preenche a figura,
# depois tira os riscos finos soltos (rachaduras do chão) com uma abertura. id → (fechamento, abertura) em px
FILL = {'daichi': (6, 3)}


def keep_main(alpha, frac=0.06):
    """Mantém só a maior região ligada (e as grandes perto dela); some com pedacinhos soltos do fundo."""
    from scipy import ndimage  # noqa: PLC0415
    solid = alpha > 96
    lab, n = ndimage.label(solid)
    if n <= 1:
        return alpha
    sizes = ndimage.sum(solid, lab, range(1, n + 1))
    big = sizes.max()
    keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= big * frac])
    keep = ndimage.binary_dilation(keep, iterations=6)
    return np.where(keep, alpha, 0).astype(np.uint8)


def cutout(session, crop, cid=None, portrait_dir=None):
    from rembg import new_session, remove  # noqa: PLC0415
    rgba = remove(crop, session=session, post_process_mask=True)
    a = np.asarray(rgba).copy()
    if cid in PORTRAIT and portrait_dir:
        from scipy import ndimage  # noqa: PLC0415
        pm = Image.open(os.path.join(portrait_dir, f'{cid}.png')).getchannel('A').resize(crop.size, Image.LANCZOS)
        pa = np.asarray(pm)
        a[..., :3] = np.asarray(crop.convert('RGB'))
        if PORTRAIT[cid] == 'corpo':
            near = ndimage.binary_dilation(pa > 40, iterations=max(8, crop.height // 60))
            a[..., 3] = np.where(near, a[..., 3], 0).astype(np.uint8)
        else:  # 'uniao': máscara principal + retrato (o retrato completa o efeito preso ao corpo)
            a[..., 3] = np.maximum(a[..., 3], np.where(pa > 110, 255, 0)).astype(np.uint8)
    if cid in MERGE:
        al = a[..., 3].astype(float)
        for model, gain in MERGE[cid]:
            extra = np.asarray(remove(crop, session=new_session(model), only_mask=True)).astype(float)
            al = np.maximum(al, np.clip(extra * gain, 0, 255))
        a[..., :3] = np.asarray(crop.convert('RGB'))  # cores originais (o rembg zera onde a máscara dele é 0)
        a[..., 3] = np.where(al > 70, 255, 0).astype(np.uint8)
    if cid in FILL:
        from scipy import ndimage  # noqa: PLC0415
        close, op = FILL[cid]
        a[..., :3] = np.asarray(crop.convert('RGB'))
        base = a[..., 3] > 96
        closed = ndimage.binary_closing(base, iterations=close)
        holes, nh = ndimage.label(ndimage.binary_fill_holes(closed) & ~closed)
        hs = ndimage.sum(holes > 0, holes, range(1, nh + 1)) if nh else []
        small = np.isin(holes, [k + 1 for k, v in enumerate(hs) if v < base.sum() * 0.012])  # só buracos pequenos (não o vão entre as pernas)
        body = ndimage.binary_opening(base | small | (closed & ndimage.binary_dilation(base, iterations=2)), iterations=op)
        lab, n = ndimage.label(body)
        if n:
            body = lab == (np.argmax(ndimage.sum(body, lab, range(1, n + 1))) + 1)
        a[..., 3] = np.where(ndimage.binary_dilation(body, iterations=op), 255, 0).astype(np.uint8)
    alpha = keep_main(a[..., 3], 0.02 if PORTRAIT.get(cid) == 'uniao' else 0.06)
    # contorno suave: fecha buraquinhos e amacia 1px
    al = Image.fromarray(alpha).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    a[..., 3] = np.minimum(np.asarray(al), alpha.astype(np.uint16) + 40).astype(np.uint8)
    img = Image.fromarray(a, 'RGBA')
    # v0.34.0: bordas da imagem tocadas pela figura (personagem cortado pela borda → não serve de Comandante)
    m = a[..., 3] > 128
    edge = 4
    touches = {k: int(v.sum()) for k, v in (('topo', m[:edge]), ('base', m[-edge:]), ('esq', m[:, :edge]), ('dir', m[:, -edge:]))}
    bbox = img.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    if bbox:
        img = img.crop(bbox)
    if img.height > H_OUT:
        img = img.resize((round(img.width * H_OUT / img.height), H_OUT), Image.LANCZOS)
    img.info['touches'] = touches
    return img


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    debug = sys.argv[sys.argv.index('--debug') + 1] if '--debug' in sys.argv else None
    clean = '--limpas' in sys.argv
    retrato = sys.argv[sys.argv.index('--retrato') + 1] if '--retrato' in sys.argv else None
    for flag in ('--saida', '--retrato'):
        if flag in sys.argv:
            args.remove(sys.argv[sys.argv.index(flag) + 1])
    if debug:
        args.remove(debug)
        os.makedirs(debug, exist_ok=True)
    src, want = args[0], set(args[1:])
    cards = json.load(open(os.path.join(ROOT, 'docs', 'cartas.json')))['cartas']
    ids = {c['id'] for c in cards} | TOKENS
    if want == {'todos'}:
        want = ids
    elif not want:
        want = {c['id'] for c in cards if c.get('existente')}
    from rembg import new_session  # noqa: PLC0415
    session = new_session(MODEL)
    files = [os.path.join(dp, f) for dp, _, fs in os.walk(src) for f in fs if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    out = sys.argv[sys.argv.index('--saida') + 1] if '--saida' in sys.argv else OUT
    os.makedirs(out, exist_ok=True)
    done = set()
    for p in sorted(files):
        cid = id_for(p, ids)
        if cid not in want or cid in done:
            continue
        # v0.34.0: ilustrações limpas (--limpas) entram inteiras; as cartas antigas passam pela limpeza do build_cards
        crop = Image.open(p).convert('RGB') if clean else clean_art(p, cid)[0]
        if crop.height > 1500:
            crop = crop.resize((round(crop.width * 1500 / crop.height), 1500), Image.LANCZOS)
        img = cutout(session, crop, cid, retrato)
        touches = img.info.get('touches', {})
        img.save(os.path.join(out, f'{cid}.webp'), 'WEBP', quality=QUALITY, method=6, exact=False)
        if debug:
            bg = Image.new('RGBA', img.size, (40, 20, 60, 255))
            bg.alpha_composite(img)
            bg.convert('RGB').save(os.path.join(debug, f'{cid}.png'))
        done.add(cid)
        print(cid, img.size, os.path.getsize(os.path.join(out, f'{cid}.webp')), 'bordas:', touches, flush=True)
    print(f'{len(done)} recortes; faltam: {sorted(want - done)}')


if __name__ == '__main__':
    main()
