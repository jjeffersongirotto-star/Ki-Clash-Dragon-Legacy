"""v0.46.0: gera as camadas do hub (mapa + prédios recortados pelo contorno) em WebP e src/ui/hubLayers.ts.
Uso: python3 scripts/hub/build_hub.py <pasta Ki_Clash_Hub_Completo>"""
import json, os, sys
from PIL import Image
src = sys.argv[1]; out = 'src/assets/hub'; os.makedirs(out, exist_ok=True)
Image.open(f'{src}/hub-00-mapa.png').convert('RGB').save(f'{out}/mapa.webp', quality=80, method=6)
lay = f'{src}/camadas_2340x1080'; boxes = {}
for f in sorted(os.listdir(lay)):
    if not f.endswith('.png'): continue
    im = Image.open(f'{lay}/{f}').convert('RGBA'); bb = im.getchannel('A').getbbox()
    if not bb: continue
    name = f[4:-4]  # 01-aventura-glow
    im.crop(bb).save(f'{out}/{name}.webp', quality=82, method=6)
    boxes[name] = bb
with open('src/ui/hubLayers.ts', 'w') as fh:
    fh.write('// Gerado por scripts/hub/build_hub.py — caixas (x0, y0, x1, y1) no mapa 2340×1080.\n')
    fh.write('export const HUB_BOXES: Record<string, [number, number, number, number]> = ' + json.dumps(boxes, indent=1) + ';\n')
print(len(boxes))
