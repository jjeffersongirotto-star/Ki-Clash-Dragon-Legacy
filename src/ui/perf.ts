/**
 * v0.10.1 — Desempenho visual.
 *
 * 1) Camadas sobrepostas (detalhes, diálogos, Despertar, janela de carta na batalha):
 *    tudo o que fica ATRÁS da camada do topo recebe `.is-under`, que pausa as animações
 *    decorativas (o fundo fica embaçado/escurecido e não precisa ser redesenhado a cada quadro).
 * 2) Cartas fora da tela (grades da Coleção, Treinar, Equipe, Troca): recebem `.offscreen`
 *    e pausam as animações enquanto não estão visíveis.
 * O visual parado é exatamente o mesmo; só deixa de gastar quadros com o que não se vê.
 */
const OVERLAY_SEL = '.modal-bg, .dialog-bg, .evo-bg, .battle-card-modal-bg';
const GRID_CARD_SEL = '.card-grid > .card, .deck-slots > .card, .train-list > .card, .swap-grid > .card';

export function installPerfGuards(app: HTMLElement): void {
  const updateLayers = () => {
    const overlays = Array.from(document.body.children).filter((el) => el.matches(OVERLAY_SEL) && !el.classList.contains('closing')) as HTMLElement[];
    const top = overlays[overlays.length - 1];
    app.classList.toggle('is-under', overlays.length > 0);
    document.body.classList.toggle('overlay-open', overlays.length > 0);
    for (const o of overlays) o.classList.toggle('is-under', o !== top);
  };

  const io = typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver((entries) => {
        for (const e of entries) (e.target as HTMLElement).classList.toggle('offscreen', !e.isIntersecting);
      }, { rootMargin: '120px' })
    : null;
  const observed = new WeakSet<Element>();
  const watchCards = (root: ParentNode) => {
    if (!io) return;
    root.querySelectorAll(GRID_CARD_SEL).forEach((el) => {
      if (observed.has(el)) return;
      observed.add(el);
      io.observe(el);
    });
  };

  let queued = false;
  const flush = () => {
    queued = false;
    updateLayers();
    watchCards(document);
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
