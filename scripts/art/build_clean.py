"""
v0.34.0 — Artes das cartas a partir de ILUSTRAÇÕES LIMPAS (sem carta antiga em volta), padrão aprovado no teste do Quorr.

As imagens de origem já vêm no formato da arte da carta (retrato 1080×1500, largura/altura = 0,72), sem moldura, números
nem ícones. O script só:
  1. recorta no formato 0,72 quando a imagem não estiver nele (janela centralizada; OFFSET_X desloca a janela para um
     personagem fora do centro, sem cortá-lo);
  2. reduz para W_OUT×H_OUT e salva em WebP.
Área segura (onde o jogo desenha por cima): 15% de cima (gota, ⚡ e ícone do grupo), 15% de baixo (faixa do nome),
5% de cada lado (cartas da mão cortam um pouco). O rosto deve ficar fora dessas faixas.

Uso (as imagens de origem NÃO vão para o repositório):
  python3 scripts/art/build_clean.py <pasta-com-as-imagens-ou-subpastas> [ids,separados,por,vírgula]
Os nomes dos arquivos seguem o padrão NN_Nome_Sobrenome.jpg (o primeiro nome dá o id, ver build_cards.id_for);
`cria-sombria.jpg` vira `cria`.
Saída: src/assets/chars/<id>.webp
"""
import json, os, sys
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_cards import ROOT, id_for  # noqa: E402

OUT = os.path.join(ROOT, 'src', 'assets', 'chars')
RATIO = 0.72
W_OUT, H_OUT = 486, 675
QUALITY = 68
# deslocamento horizontal da janela de recorte (fração da sobra; -1 = encostada à esquerda, 1 = à direita), por id
OFFSET_X = {}


def crop_ratio(img, cid):
    w, h = img.size
    if abs(w / h - RATIO) < 0.005:
        return img
    if w / h > RATIO:  # larga demais: corta os lados
        nw = round(h * RATIO)
        spare = w - nw
        x = round(spare / 2 * (1 + OFFSET_X.get(cid, 0)))
        return img.crop((x, 0, x + nw, h))
    nh = round(w / RATIO)  # alta demais: corta embaixo (os pés ficam sob a faixa do nome mesmo)
    return img.crop((0, 0, w, nh))


def process(path, cid):
    img = Image.open(path).convert('RGB')
    out = crop_ratio(img, cid).resize((W_OUT, H_OUT), Image.LANCZOS)
    out.save(os.path.join(OUT, f'{cid}.webp'), 'WEBP', quality=QUALITY, method=6)


def main():
    src = sys.argv[1]
    ids = {c['id'] for c in json.load(open(os.path.join(ROOT, 'docs', 'cartas.json')))['cartas']} | {'cria'}
    only = set(sys.argv[2].split(',')) if len(sys.argv) > 2 else None
    files = []
    for dp, _, fs in os.walk(src):
        files += [os.path.join(dp, f) for f in fs if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    done = set()
    for f in sorted(files):
        cid = id_for(f, ids)
        if not cid or (only and cid not in only):
            continue
        process(f, cid)
        done.add(cid)
    print(f'{len(done)} artes geradas')
    falta = (only or ids) - done
    if falta:
        print('sem imagem:', ', '.join(sorted(falta)))


if __name__ == '__main__':
    main()
