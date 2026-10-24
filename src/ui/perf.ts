/**
 * v0.10.1 — Desempenho visual.
 *
 * 1) Camadas sobrepostas (detalhes, diálogos, Despertar, janela de carta na batalha):
 *    tudo o que fica ATRÁS da camada do topo recebe `.is-under`, que pausa as animações
 *    decorativas (o fundo fica embaçado/escurecido e não precisa ser redesenhado a cada quadro).
 * (v0.10.2: as cartas de grade são quadros congelados, sem animação; não há mais observador de
 *  rolagem marcando cartas fora da tela.)
 * O visual parado é exatamente o mesmo; só deixa de gastar quadros com o que não se vê.
 */
const OVERLAY_SEL = '.modal-bg, .dialog-bg, .evo-bg, .battle-card-modal-bg';

export function installPerfGuards(app: HTMLElement): void {
  const updateLayers = () => {
    const overlays = Array.from(document.body.children).filter((el) => el.matches(OVERLAY_SEL) && !el.classList.contains('closing')) as HTMLElement[];
    const top = overlays[overlays.length - 1];
    app.classList.toggle('is-under', overlays.length > 0);
    document.body.classList.toggle('overlay-open', overlays.length > 0);
    for (const o of overlays) o.classList.toggle('is-under', o !== top);
  };

  let queued = false;
  const flush = () => {
    queued = false;
    updateLayers();
  };
  const mo = new MutationObserver(() => {
    if (queued) return;
    queued = true;
    queueMicrotask(flush);
  });
  // só filhos diretos: telas trocam o conteúdo de #app; camadas são anexadas ao <body>
  mo.observe(document.body, { childList: true });
  mo.observe(app, { childList: true });
  flush();
}
