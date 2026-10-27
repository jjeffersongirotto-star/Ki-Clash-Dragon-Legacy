"""
v0.29.0 — Artes dos personagens a partir das cartas desenhadas por outra IA (modelo antigo de carta).

Cada imagem de origem é uma carta inteira (896×1200) no modelo antigo: gota de custo (canto de cima à esquerda),
pílula ⚡ (no meio, em cima), estrela "Nv." (canto de cima à direita), faixa do nome, ataque e vida.
Só a ILUSTRAÇÃO do personagem interessa. O script:
  1. acha a moldura prateada da carta (colunas/linhas com muitos pixels cinza-claros);
  2. acha a janela da arte (de dentro da moldura até a borda de cima da faixa do nome);
  3. apaga a gota, a pílula e a estrela preenchendo essas áreas com as cores vizinhas (convolução normalizada);
  4. recorta no formato da arte da carta do jogo (largura/altura = 0,82), centralizado, e salva em WebP.

Uso (as imagens de origem NÃO vão para o repositório):
  python3 scripts/art/build_cards.py <pasta-com-as-imagens-ou-subpastas> [ids,separados,por,vírgula] [--debug pasta]
v0.30.2: ilustrações já limpas (tabela PLAIN, ex.: cria-sombria.jpg → cria) só são recortadas no formato da carta.
Saída: src/assets/chars/<id>.webp
"""
import json, os, re, sys, unicodedata
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'src', 'assets', 'chars')
W_OUT, H_OUT = 400, 488  # proporção .82 da arte da carta
QUALITY = 78

# Imagens soltas do Necromante (nomes de arquivo sem o personagem): prefixo → id
LOOSE = {
    '0e0acc2b': 'nocturna', 'e4d8aedc': 'elegia', '42b231ac': 'yume', '3aa37590': 'sanguis', '132a2526': 'lamenta',
    '074bf471': 'drakon', '0cab23a9': 'vorax', 'a695a9a9': 'ghor', '90bf3cfb': 'morrigan', '9c94c29a': 'thane',
    'c490d598': 'ivra', '216ef3a4': 'wex', '815a018b': 'lethe', '7f3e3778': 'cador', 'd2824551': 'mira',
    '3981f924': 'grav', '0dc2c408': 'brunna', '0d40f352': 'pira', '9184af88': 'ossian', '627d7486': 'sabbath',
}
# Nomes de arquivo que não batem com o primeiro nome do id
ALIAS = {'mimesis': 'mimic', 'aegis': 'aegis', 'medi': 'medi3', 'kraz': 'kraz9', 'vex': 'vex4', 'cryo': 'cryo6', 'bastion': 'bastion2',
         'echo': 'echo5', 'halo': 'halo8', 'spike': 'spike11', 'phase': 'phase3', 'titan': 'titanx', 'pulse': 'pulse7',
         'omega': 'omega9', 'sentinel': 'sentinel0', 'razor': 'razorv', 'nyx': 'nyx', 'mestre': 'hayato', 'magra': 'magra'}
# Ajustes manuais da janela da arte (x0, y0, x1, y1 em pixels da imagem de origem) quando a detecção falha
MANUAL = {'sabbath': (176, 856, 1080, 1688), 'nyx': (76, 60, 836, 766), 'yume': (72, 66, 822, 846)}  # print de tela do chat (1220×2712)
# Áreas extras a apagar (x0, y0, x1, y1), por id
EXTRA_MASK = {}
# v0.30.2: ilustrações limpas (sem carta antiga em volta): nome do arquivo → (id, onde fica o topo do recorte, 0 a 1)
PLAIN = {'cria-sombria': ('cria', 0.05)}
TOKENS = {cid for cid, _ in PLAIN.values()}  # invocações: não estão no cartas.json


def norm(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()


def id_for(path, ids):
    base = os.path.basename(path)
    if os.path.splitext(base)[0] in PLAIN:
        return PLAIN[os.path.splitext(base)[0]][0]
    pre = base.split('-')[0]
    if pre in LOOSE:
        return LOOSE[pre]
    m = re.match(r'\d+_(.+)\.(jpe?g|png|webp)$', base, re.I)
    if not m:
        return None
    first = norm(m.group(1).split('_')[0]).replace("'", '')
    if first in ALIAS:
        return ALIAS[first]
    return first if first in ids else None


def detect(a):
    """Moldura da carta e janela da arte (pixels da imagem)."""
    mx, mn = a.max(2), a.min(2)
    silver = (mn > 140) & (mx - mn < 40)
    h, w = silver.shape
    cols = np.where(silver.sum(0) > 0.29 * h)[0]
    rows = np.where(silver.sum(1) > 0.39 * w)[0]
    x0, x1 = int(cols[0]), int(cols[-1])
    y0 = int(rows[0])
    W = x1 - x0
    inner = silver[:, x0 + int(0.05 * W):x1 - int(0.05 * W)].mean(1)
    lo, hi = y0 + int(0.62 * W), y0 + int(1.05 * W)
    band = [y for y in range(lo, min(hi, h)) if inner[y] > 0.6]
    bottom = band[0] if band else y0 + int(0.92 * W)
    # bordas de dentro da moldura (a barra de cima varia de espessura entre as cartas)
    def first_non_silver(seq):
        for i, frac in enumerate(seq):
            if frac < 0.5:
                return i
        return 0
    qc = np.r_[x0 + int(0.22 * W):x0 + int(0.32 * W), x1 - int(0.32 * W):x1 - int(0.22 * W)]
    top = y0 + first_non_silver(silver[y0:y0 + int(0.12 * W), qc].mean(1)) + 5
    ym = slice(y0 + int(0.4 * W), y0 + int(0.6 * W))
    left = x0 + first_non_silver(silver[ym, x0:x0 + int(0.12 * W)].mean(0)) + 5
    right = x1 - first_non_silver(silver[ym, x1 - int(0.12 * W):x1 + 1][:, ::-1].mean(0)) - 5
    return x0, y0, x1, bottom, W, top, left, right


def masks(a, x0, y0, x1, W):
    m = Image.new('L', (a.shape[1], a.shape[0]), 0)
    d = ImageDraw.Draw(m)
    cx = (x0 + x1) / 2
    d.ellipse([x0 - 0.08 * W, y0 - 0.09 * W, x0 + 0.235 * W, y0 + 0.29 * W], fill=255)          # gota
    d.rounded_rectangle([cx - 0.145 * W, y0 + 0.025 * W, cx + 0.15 * W, y0 + 0.195 * W], 0.06 * W, fill=255)  # ⚡
    d.ellipse([x1 - 0.28 * W, y0 - 0.1 * W, x1 + 0.1 * W, y0 + 0.29 * W], fill=255)          # estrela
    return m


def box(x, r):
    """Desfoque em caixa (3 passadas ≈ gaussiano), em numpy, nos dois eixos."""
    for _ in range(3):
        for ax in (0, 1):
            c = np.cumsum(np.pad(x, [(r + 1, r) if i == ax else (0, 0) for i in range(x.ndim)], mode='edge'), axis=ax)
            hi = np.take(c, range(2 * r + 1, c.shape[ax]), axis=ax)
            lo = np.take(c, range(0, c.shape[ax] - 2 * r - 1), axis=ax)
            x = (hi - lo) / (2 * r + 1)
    return x


def fill(img, mask, valid):
    """Preenche a máscara com as cores ao redor (convolução normalizada em várias escalas).
    Só os pixels `valid` (dentro da janela da arte) servem de fonte, para a moldura não vazar para dentro."""
    a = np.asarray(img).astype(np.float32)
    todo = np.asarray(mask) >= 128
    m = ((~todo) & valid).astype(np.float32)  # 1 = pixel bom
    out = a.copy()
    todo = todo.copy()
    for r in (6, 12, 24, 48, 96):
        num = np.stack([box(a[..., c] * m, r) for c in range(3)], -1)
        den = box(m, r)[..., None]
        ok = (den[..., 0] > 0.15) & todo
        out[ok] = num[ok] / den[ok]
        todo &= ~ok
    out[todo] = a[todo].mean(0) if todo.any() else 0
    res = Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
    # costura suave
    soft = mask.filter(ImageFilter.GaussianBlur(4))
    return Image.composite(res, img, soft)


def clean_art(path, cid):
    """Janela da arte em resolução original, já sem a gota, a pílula e a estrela. Retorna (imagem, caixa, máscara, original)."""
    img = Image.open(path).convert('RGB')
    plain = PLAIN.get(os.path.splitext(os.path.basename(path))[0])
    if plain:
        # sem gota/pílula/estrela: só recorta no formato da carta (largura inteira), com o topo na posição pedida
        w, h = img.width, min(img.height, int(round(img.width * H_OUT / W_OUT)))
        y0 = int(round((img.height - h) * plain[1]))
        box = (0, y0, w, y0 + h)
        return img.crop(box), box, Image.new('L', img.size, 0), img
    a = np.asarray(img).astype(int)
    if cid in MANUAL:
        x0, y0, x1, bottom = MANUAL[cid]
        W = x1 - x0
        top, left, right = y0 + int(0.04 * W), x0 + int(0.04 * W), x1 - int(0.04 * W)
    else:
        x0, y0, x1, bottom, W, top, left, right = detect(a)
    mask = masks(a, x0, y0, x1, W)
    for box in EXTRA_MASK.get(cid, []):
        ImageDraw.Draw(mask).rectangle(box, fill=255)
    ax0, ax1 = left, right
    ay0 = top
    band = (0, max(0, y0 - int(0.15 * W)), img.width, min(img.height, y0 + int(0.45 * W)))
    valid = np.zeros((img.height, img.width), bool)
    valid[ay0:bottom, ax0:ax1] = True
    clean = img.copy()
    clean.paste(fill(img.crop(band), mask.crop(band), valid[band[1]:band[3], band[0]:band[2]]), band[:2])
    ay1 = bottom - 6
    h = ay1 - ay0
    w = min(ax1 - ax0, int(round(h * W_OUT / H_OUT)))
    if w < ax1 - ax0:
        cx = (ax0 + ax1) // 2
        ax0, ax1 = cx - w // 2, cx - w // 2 + w
    else:
        h2 = int(round(w * H_OUT / W_OUT))
        ay1 = ay0 + h2
    return clean.crop((ax0, ay0, ax1, ay1)), (ax0, ay0, ax1, ay1), mask, img


def process(path, cid, debug=None):
    crop, (ax0, ay0, ax1, ay1), mask, img = clean_art(path, cid)
    art = crop.resize((W_OUT, H_OUT), Image.LANCZOS)
    os.makedirs(OUT, exist_ok=True)
    art.save(os.path.join(OUT, f'{cid}.webp'), 'WEBP', quality=QUALITY, method=6)
    if debug:
        dbg = img.copy()
        dd = ImageDraw.Draw(dbg)
        dd.rectangle([ax0, ay0, ax1, ay1], outline=(255, 0, 0), width=4)
        dbg.paste((0, 255, 0), mask=mask.point(lambda v: 90 if v else 0))
        dbg.resize((dbg.width // 3, dbg.height // 3)).save(os.path.join(debug, f'{cid}.png'))
    return art


def main():
    src = sys.argv[1]
    debug = sys.argv[sys.argv.index('--debug') + 1] if '--debug' in sys.argv else None
    if debug:
        os.makedirs(debug, exist_ok=True)
    ids = {c['id'] for c in json.load(open(os.path.join(ROOT, 'docs', 'cartas.json')))['cartas']}
    if len(sys.argv) > 2 and not sys.argv[2].startswith('--'):
        ids = set(sys.argv[2].split(','))  # só estes ids (ex.: cria)
    files = [os.path.join(dp, f) for dp, _, fs in os.walk(src) for f in fs if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    done = {}
    for p in sorted(files):
        cid = id_for(p, ids)
        if not cid:
            print('sem id:', p)
            continue
        if cid in done:
            print('repetido:', cid, p)
            continue
        try:
            process(p, cid, debug)
        except Exception as e:  # noqa: BLE001
            print('ERRO', cid, p, e)
            continue
        done[cid] = p
    missing = sorted(ids - set(done) - TOKENS)
    print(f'{len(done)} artes geradas; faltam: {missing}')


if __name__ == '__main__':
    main()
