/**
 * v0.46.0: locais do hub (mapa flutuante da Base). 1–7 abrem telas que já existem; 8–14 ficam trancados ("Em breve").
 * Sem import de DOM: dá para testar no vitest.
 */
export interface HubSpot {
  /** prefixo das camadas em src/assets/hub (ex.: '01-aventura') */
  key: string;
  label: string;
  /** tela aberta pelo go() de ui.ts; null = trancado (Em breve) */
  nav: 'adventure' | 'collection' | 'train' | 'shop' | 'inventory' | 'help' | null;
  /** margem extra da área de toque, em px do mapa 2340×1080 (prédios pequenos) */
  pad?: number;
  soon?: string;
  /** nome em cima do prédio (quando embaixo ficaria por cima de outro nome ou fora da tela) */
  tagUp?: boolean;
  /** nome à esquerda do prédio */
  tagLeft?: boolean;
  /** v0.47.0: deslocamento do prédio no mapa (px do mapa 2340×1080), para espalhar sem esticar a arte */
  dx?: number;
  dy?: number;
}

export const HUB_SPOTS: HubSpot[] = [
  { key: '01-aventura', label: 'Aventura', nav: 'adventure' },
  { key: '02-colecao', label: 'Coleção & Baralho', nav: 'collection' },
  { key: '03-treinar', label: 'Treinar & Despertar', nav: 'train', dx: 20, dy: 20 },
  { key: '04-loja', label: 'Loja', nav: 'shop' },
  // o Banner fica no topo da Loja (não há tela própria de Banner)
  { key: '05-invocacao', label: 'Altar de Invocação', nav: 'shop', dy: 40 },
  { key: '06-inventario', label: 'Inventário', nav: 'inventory' },
  // o tutorial guiado só roda uma vez; o Acampamento abre o "Como jogar"
  { key: '07-tutorial', label: 'Acampamento do Iniciante', nav: 'help', dx: -20 },
  { key: '08-torre', label: 'Torre', nav: null, soon: 'Suba andares cada vez mais difíceis.' },
  { key: '09-invasao', label: 'Invasão de Chefe', nav: null, soon: 'Chefes gigantes invadem o mundo por tempo limitado.' },
  { key: '10-arena', label: 'Arena', nav: null, soon: 'Lute contra baralhos de outros jogadores controlados pela IA.', dy: 60 },
  { key: '11-masmorra-dupla', label: 'Masmorra em Dupla', nav: null, soon: 'Explore masmorras com um parceiro.', dx: -40, dy: 40 },
  { key: '12-desejos', label: 'Santuário dos 7 Diamantes', nav: null, soon: 'Reúna os 7 diamantes e faça um desejo.' },
  { key: '13-eventos', label: 'Praça de Eventos', nav: null, soon: 'Eventos especiais com prêmios por tempo limitado.' },
  { key: '14-mina', label: 'Mina de Cristais', nav: null, pad: 20, dx: 60, dy: 40, tagLeft: true, soon: 'Recolha cristais com o tempo.' },
];

export const HUB_W = 2340;
export const HUB_H = 1080;

/** Caixa de toque em % do mapa (com a margem extra do local). */
export function hitBox(b: [number, number, number, number], pad = 0) {
  const x0 = Math.max(0, b[0] - pad), y0 = Math.max(0, b[1] - pad);
  const x1 = Math.min(HUB_W, b[2] + pad), y1 = Math.min(HUB_H, b[3] + pad);
  return { left: (x0 / HUB_W) * 100, top: (y0 / HUB_H) * 100, width: ((x1 - x0) / HUB_W) * 100, height: ((y1 - y0) / HUB_H) * 100 };
}

/** Caixa de uma camada já deslocada (dx/dy do local). */
export function moved(b: [number, number, number, number], s: Pick<HubSpot, 'dx' | 'dy'>): [number, number, number, number] {
  const dx = s.dx ?? 0, dy = s.dy ?? 0;
  return [b[0] + dx, b[1] + dy, b[2] + dx, b[3] + dy];
}
