"""
v0.42.0 — Ícones e artes do jogo (212 imagens numeradas, ver a lista de prompts dos ícones).

Converte as imagens de origem (NNN_Nome.png/.jpg, em qualquer subpasta) para WebP leve em src/assets/icons/ (ícones),
src/assets/spells/ (arte dos feitiços), src/assets/card/verso.webp e src/assets/banner-fundo.webp.
As imagens de origem NÃO vão para o repositório.

Uso: python3 scripts/art/build_icons.py <pasta-com-as-imagens>
- Ícones: 512×512 com transparência → ICON_PX×ICON_PX. Buracos fechados pintados de branco puro (dentro do anel, do arco,
  do cadeado…) viram transparentes (HOLES).
- Ícone sem transparência (JPG com fundo branco): o fundo ligado às bordas vira transparente (white_bg).
- SKIP: imagens que ficaram de fora (lembram personagens de marcas existentes) — o jogo mantém o ícone antigo.
"""
import os, re, sys
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ICON_PX = 128
REGION_PX = 192
QUALITY = 82
HOLES = {20, 32, 35, 53, 103, 114, 150, 163}
SKIP = {121}

ABILITIES = ('diagFrente diagTras guarda salto longoAlcance flechaDupla perfurante retaguarda menorVida prole contraGolpe sifao lotus '
             'inabalavel disparoSombrio espinhos sopro tambor brasa mare precisao olhoAguia cacaMagos surpresa vigia renascer anjo '
             'reflexo ombrada necromancia barreira critico provocar sangramento lentidao ataqueCostas veneno maldicao purificar furia '
             'regeneracao explosao congelar gritoGuerra protetor perfurar escudoInicial queimadura vampirismo investida atordoar '
             'teleporte anular ultimaResistencia evasao dominio copiador retaliacao clone raioCadeia couracaAdaptativa execucao '
             'vinganca sedeEterna marcaSede ressurreicao').split()
GEAR = ('elmo armadura escudo manoplas botas-ferro tiara tunica amuleto bastao sandalias bandana colete espada luvas botas '
        'chapeu manto cajado cristal anel capuz jaqueta arco aljava botas-leves mascara capa adagas cinto diamante-negro').split()
SPELLS = 'investida giratoria muralha tremor chuva flecha-veneno bola-fogo raio veneno sombras cura anjo necropolis'.split()
NAMES = {
    1: 'energia', 2: 'ouro', 3: 'essencia', 4: 'gema', 5: 'perfil', 6: 'poder',
    **{7 + i: f'orbe{i + 1}' for i in range(6)},
    **{13 + i: f'gear-{g}' for i, g in enumerate(GEAR)},
    **{43 + i: f'raca-{r}' for i, r in enumerate('humano extraterrestre monstro mago androide necromante'.split())},
    **{49 + i: f'cat-{c}' for i, c in enumerate('tanque suporte dps mago arqueiro assassino'.split())},
    **{55 + i: f'ab-{a}' for i, a in enumerate(ABILITIES)},
    **{121 + i: f'f-{s}' for i, s in enumerate(SPELLS)},
    **{134 + i: f'regiao-{i + 1}' for i in range(10)},
    144: 'dif-facil', 145: 'dif-normal', 146: 'dif-dificil', 147: 'estrela', 148: 'estrela-vazia', 149: 'concluida',
    150: 'bloqueado', 151: 'liberado',
    **{152 + i: n for i, n in enumerate('voltar mapa aventura colecao treinar loja inventario banner ajuda tutorial baixar atualizar '
                                         'fechar detalhes tirar faltando todos desmanchar desmanche-dir escada evoluir seta-evolucao '
                                         'pity confirmar passo-ok'.split())},
    **{177 + i: n for i, n in enumerate('pilha necropolis registro auto velocidade lutar espera vida custo comandante fisico magico '
                                         'alvo-none alvo-enemy alvo-ally alvo-row escudo-temp furia vitoria derrota empate girar'.split())},
    **{199 + i: f'atk-{c}' for i, c in enumerate('dps tanque suporte mago arqueiro assassino'.split())},
    205: 'pacote', 206: 'verso', 207: 'banner-fundo', 208: 'celebracao', 209: 'sucesso', 210: 'offline', 211: 'aviso', 212: 'seta-tutorial',
}
assert len(NAMES) == 212 and len(ABILITIES) == 66 and len(GEAR) == 30


def fill_holes(im):
    a = np.array(im).astype(int)
    rgb, al = a[..., :3], a[..., 3]
    white = (al > 200) & (rgb.min(-1) > 232) & ((rgb.max(-1) - rgb.min(-1)) < 20)
    lab, k = ndimage.label(white)
    sizes = ndimage.sum(white, lab, range(1, k + 1))
    mask = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 0.01 * al.size])
    grow = ndimage.binary_dilation(mask, iterations=2) & (rgb.min(-1) > 200)
    a[..., 3] = np.where(grow, 0, al)
    return Image.fromarray(a.astype('uint8'))


def white_bg(im):
    """Fundo branco ligado às bordas → transparente (borda suavizada em 2 px)."""
    a = np.array(im.convert('RGBA')).astype(int)
    rgb = a[..., :3]
    white = (rgb.min(-1) > 238) & ((rgb.max(-1) - rgb.min(-1)) < 18)
    lab, _ = ndimage.label(white)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(edge))
    soft = ndimage.binary_dilation(bg, iterations=2) & (rgb.min(-1) > 200)
    a[..., 3] = np.where(bg | soft, 0, 255)
    return Image.fromarray(a.astype('uint8'))


def main(src):
    found = {}
    for d, _, fs in os.walk(src):
        for f in fs:
            m = re.match(r'(\d{3})_.*\.(png|jpg|jpeg|webp)$', f, re.I)
            if m:
                found[int(m.group(1))] = os.path.join(d, f)
    missing = sorted(set(NAMES) - set(found))
    if missing:
        print('faltando:', missing)
    dirs = {k: os.path.join(ROOT, 'src', 'assets', k) for k in ('icons', 'spells', 'card')}
    for p in dirs.values():
        os.makedirs(p, exist_ok=True)
    for n, path in sorted(found.items()):
        if n in SKIP or n not in NAMES:
            continue
        name = NAMES[n]
        im = Image.open(path)
        if name.startswith('f-'):
            im.convert('RGB').resize((486, 675), Image.LANCZOS).save(os.path.join(dirs['spells'], f'{name}.webp'), quality=78, method=6)
        elif name == 'verso':
            im.convert('RGB').resize((486, 675), Image.LANCZOS).save(os.path.join(dirs['card'], 'verso.webp'), quality=78, method=6)
        elif name == 'banner-fundo':
            im.convert('RGB').resize((1200, 400), Image.LANCZOS).save(os.path.join(ROOT, 'src', 'assets', 'banner-fundo.webp'), quality=76, method=6)
        else:
            im = white_bg(im) if im.mode == 'RGB' else im.convert('RGBA')
            if n in HOLES:
                im = fill_holes(im)
            px = REGION_PX if name.startswith('regiao-') else ICON_PX
            im.resize((px, px), Image.LANCZOS).save(os.path.join(dirs['icons'], f'{name}.webp'), quality=QUALITY, method=6)
    print('ok:', len(found) - len(SKIP & set(found)))


if __name__ == '__main__':
    main(sys.argv[1])
