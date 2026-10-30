"""Gera as camadas do hub (céu + prédios recortados pelo contorno) em WebP e src/ui/hubLayers.ts.

v0.46.0: um pacote só.  v0.48.0: dois pacotes —
  python3 scripts/hub/build_hub.py <pacote antigo> [<pacote novo>] [<pacote refeito>]
v0.49.0: o pacote refeito (3º) traz os 10 prédios REDO completos (normal + cadeado + brilho) e tem prioridade.
Do pacote novo entram (normal + cadeado + brilho) só os prédios em NEW (os que cresceram certo).
Para os prédios mantidos do pacote antigo que ficam liberados, o BRILHO vem do pacote novo (mais forte),
reposicionado/escalado para casar com a arte antiga. Cadeado e normal desses continuam os antigos.
Também copia as camadas de cenário (nuvens/névoa) do pacote novo.
"""
import json, os, sys
from PIL import Image

old = sys.argv[1]
new = sys.argv[2] if len(sys.argv) > 2 else None
redo = sys.argv[3] if len(sys.argv) > 3 else None
REDO = {'03-treinar', '04-loja', '05-invocacao', '06-inventario', '07-tutorial', '10-arena', '11-masmorra-dupla', '12-desejos', '13-eventos', '14-mina'}
out = 'src/assets/hub'; os.makedirs(out, exist_ok=True)
NEW = {'05-invocacao', '07-tutorial', '11-masmorra-dupla', '12-desejos', '13-eventos', '14-mina'}
GLOW_FROM_NEW = {'01-aventura', '02-colecao', '03-treinar', '04-loja', '06-inventario'}

Image.open(f'{old}/hub-00-mapa-vazio.png').convert('RGB').save(f'{out}/vazio.webp', quality=80, method=6)
boxes = {}

def put(path, name):
    im = Image.open(path).convert('RGBA'); bb = im.getchannel('A').getbbox()
    if not bb: return None
    im.crop(bb).save(f'{out}/{name}.webp', quality=82, method=6)
    boxes[name] = list(bb)
    return bb

lay = f'{old}/camadas_2340x1080'
for f in sorted(os.listdir(lay)):
    if f.endswith('.png'): put(f'{lay}/{f}', f[4:-4])

if new:
    nl = f'{new}/camadas_2340x1080'
    for k in NEW:
        for suf in ('', '-locked', '-glow'):
            put(f'{nl}/hub-{k}{suf}.png', f'{k}{suf}')
    for k in GLOW_FROM_NEW:
        nb = Image.open(f'{nl}/hub-{k}.png').getchannel('A').getbbox()
        g = Image.open(f'{nl}/hub-{k}-glow.png').convert('RGBA'); gb = g.getchannel('A').getbbox()
        ob = boxes[k]
        sx = (ob[2] - ob[0]) / (nb[2] - nb[0]); sy = (ob[3] - ob[1]) / (nb[3] - nb[1])
        x0 = round(ob[0] + (gb[0] - nb[0]) * sx); y0 = round(ob[1] + (gb[1] - nb[1]) * sy)
        w = round((gb[2] - gb[0]) * sx); h = round((gb[3] - gb[1]) * sy)
        g.crop(gb).resize((w, h), Image.LANCZOS).save(f'{out}/{k}-glow.webp', quality=82, method=6)
        boxes[f'{k}-glow'] = [x0, y0, x0 + w, y0 + h]
    for c in ('nuvem-a', 'nevoa'):
        Image.open(f'{new}/cenario/hub-anim-{c}.png').convert('RGBA').save(f'{out}/cena-{c}.webp', quality=80, method=6)

if redo:
    rl = f'{redo}/camadas_2340x1080'
    for k in REDO:
        for suf in ('', '-locked', '-glow'):
            put(f'{rl}/hub-{k}{suf}.png', f'{k}{suf}')

with open('src/ui/hubLayers.ts', 'w') as fh:
    fh.write('// Gerado por scripts/hub/build_hub.py — caixas (x0, y0, x1, y1) no mapa 2340×1080.\n')
    fh.write('export const HUB_BOXES: Record<string, [number, number, number, number]> = ' + json.dumps(dict(sorted(boxes.items())), indent=1) + ';\n')
print(len(boxes))
