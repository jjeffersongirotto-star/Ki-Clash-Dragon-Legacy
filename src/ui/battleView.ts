import { playerAuto, playerEndTurn, playerUse } from '../core/match';
import { ico } from './icons';
import { createBattle, deployCells, spellTargets, unitAt, waitOf, DEPLOY_DEPTH, Ctx } from '../core/battle';
import { isSpell } from '../core/spells';
import type { BattleState, CardInstance, RecordedEvent, Side, Snapshot, Unit } from '../core/types';
import type { Stage } from '../core/campaign';
import { PLAYER_HERO_HP } from '../core/campaign';
import { INFO_DEFAULT, attackFX, floatText, moveTrail, spark, sleep } from './battleFx';
import { enemyCommanderBattle, playerLeaderImg } from './art';
import { stageLabel } from '../core/world';
import { stageCommander } from '../core/campaign';
import { gameConfirm } from './dialog';
import { requestLandscape } from './orientation';
import { esc } from './components';
import * as battleEffects from './battleEffects';
import * as battleRender from './battleRender';
import * as battleModals from './battleModals';
import * as battleHand from './battleHand';

export interface BattleCallbacks {
  speed: () => number;
  setSpeed: (s: number) => void;
  /** v0.21.0: também informa o fim da partida (vida do seu Comandante e turno) para as ⭐ da fase */
  onFinish: (winner: Side | 'empate', end: { playerHp: number; playerMaxHp: number; turn: number; stats?: { cards: number; spells: number; kills: number } }) => void;
  onExit: () => void;
  /** v0.13: vida do Comandante do jogador (nível do Comandante). Sem informar: nível 1 */
  playerHeroHp?: number;
  /** v0.33.0: tutorial guiado — semente fixa (sempre igual) e cartas sem espera na mão */
  seed?: number;
  noWait?: boolean;
}

/**
 * Tela da batalha. v0.28.3: a mão (battleHand), as janelas de detalhes (battleModals), o desenho do tabuleiro
 * (battleRender) e a animação dos eventos (battleEffects) ficam em arquivos próprios; os métodos daqui só os chamam.
 */
export class BattleView {
  state: BattleState;
  root: HTMLElement;
  selected: number | null = null;
  busy = false;
  autoMode = false;
  /** unidades do jogador vindas de cartas (para animar o monte de derrotadas) */
  mine = new Set<number>();
  deadShown = 0;
  tokens = new Map<number, HTMLElement>();
  /** unidade mostrada no painel de informações (limpa quando ela é derrotada) */
  infoUid: number | null = null;
  /** long-press abriu os detalhes: ignora o clique que vem logo depois */
  suppressClick = false;
  /** v0.35.0: avisa quando a descrição foi aberta segurando (o tutorial usa) */
  onInfo?: (kind: 'card' | 'unit', id: number) => void;
  /** v0.10.1: saiu da batalha — animações/turnos pendentes param e o fim da luta não é mais anunciado */
  disposed = false;
  cb: BattleCallbacks;
  stage: Stage;

  constructor(root: HTMLElement, stage: Stage, playerDeck: CardInstance[], cb: BattleCallbacks) {
    this.root = root;
    this.cb = cb;
    this.stage = stage;
    this.state = createBattle({ playerDeck, enemyDeck: stage.enemyDeck, playerHeroHp: cb.playerHeroHp ?? PLAYER_HERO_HP, enemyHeroHp: stage.enemyHeroHp, seed: cb.seed, noWait: cb.noWait, aiLevel: stage.aiLevel });
    this.mount();
    this.renderSnapshot(this.snap());
    this.renderHand();
    this.log(`⚔ ${stage.id ? `Fase ${stageLabel(stage.id)}: ` : ''}${stage.name}. Invoque cartas na sua zona (3 colunas da esquerda) e toque em LUTAR!`, 'sys');
  }

  snap(): Snapshot {
    const s = this.state;
    return { units: s.units.map((u) => ({ ...u, effects: u.effects?.map((e) => ({ ...e })) })), heroes: { player: { ...s.heroes.player }, enemy: { ...s.heroes.enemy } }, turn: s.turn, active: s.active };
  }

  mount() {
    const s = this.state;
    let cells = '';
    for (let r = 0; r < s.rows; r++)
      for (let c = 0; c < s.cols; c++)
        cells += `<div class="cell ${c < DEPLOY_DEPTH ? 'zone-p' : c >= s.cols - DEPLOY_DEPTH ? 'zone-e' : ''}" data-r="${r}" data-c="${c}"><span class="cell-coord">${r + 1}:${c + 1}</span></div>`;
    this.root.innerHTML = `
    <div class="battle">
      <div class="bhud">
        <button class="btn small ghost" data-act="exit">✕ Sair</button>
        <div class="vs-hud">
          <div class="vs-side vs-p">
            <span class="vs-badge">⚔</span>
            <div class="vs-bar-wrap">
              <div class="vs-label"><b>Você</b> <small id="topHpP">${s.heroes.player.hp}/${s.heroes.player.maxHp}</small></div>
              <div class="vs-bar"><i id="topBarP" style="width:100%"></i></div>
            </div>
          </div>
          <div class="vs-center" title="Turno atual">
            <span class="vs-inf">∞</span>
            <small>T<b id="turnNo">1</b></small>
          </div>
          <div class="vs-side vs-e">
            <div class="vs-bar-wrap">
              <div class="vs-label"><small id="topHpE">${s.heroes.enemy.hp}/${s.heroes.enemy.maxHp}</small> <b>${esc(this.stage.name)}</b></div>
              <div class="vs-bar"><i id="topBarE" style="width:100%"></i></div>
            </div>
            <span class="vs-badge">💀</span>
          </div>
        </div>
        <button class="btn small ghost" data-act="speed" id="speedBtn">${ico('velocidade')}<span>${this.cb.speed()}x</span></button>
        <button class="btn small ghost log-toggle" data-act="log" title="Registro da batalha">${ico('registro', '📜')}</button>
      </div>
      <div class="field">
        <div class="hero hero-p" id="hero-player">
          <div class="hero-fig"><div class="hero-aura"></div>${playerLeaderImg()}</div>
          <div class="hero-hp"><div class="bar"><i></i></div><span></span></div>
        </div>
        <div class="board-wrap">
          <div class="arena-scenery" aria-hidden="true"></div>
          <div class="board" style="--rows:${s.rows};--cols:${s.cols}">
            ${cells}
            <div class="units"></div>
            <div class="fx"></div>
          </div>
          <div class="banner" id="banner"></div>
        </div>
        <div class="hero hero-e" id="hero-enemy">
          <div class="hero-fig"><div class="hero-aura"></div>${enemyCommanderBattle(stageCommander(this.stage))}</div>
          <div class="hero-hp"><div class="bar"><i></i></div><span></span></div>
        </div>
      </div>
      <div class="tactical-tabs">
        <div class="info-wrap"><div class="info" id="info">${INFO_DEFAULT}</div><button class="info-close" data-act="info-close" aria-label="Fechar informações">✕</button></div>
        <div class="tactical-right">
          <button class="tab-btn" id="autoBtn" data-act="auto" title="Invocar e lutar automaticamente">${ico('auto')}<span>Auto: OFF</span></button>
          <div class="deployed-pill" title="Unidades aliadas em campo">Em campo (<b id="deployedCount">0</b>)</div>
        </div>
      </div>
      <div class="bottom">
        <div class="energy" id="energy"></div>
        <div class="hand-row">
          <div class="pile pile-draw" id="pileDraw" title="Baralho: cartas que ainda podem ser compradas"><div class="pile-stack"><span class="pile-ico">${ico('pilha', '🂠')}</span><b class="pile-count">0</b></div><div class="pile-label">Baralho</div></div>
          <div class="hand" id="hand"></div>
          <div class="pile pile-dead" id="pileDead" title="Necropolis (Derrotadas): cópias cujas unidades caíram"><div class="pile-stack"><span class="pile-ico">${ico('necropolis', '☠')}</span><b class="pile-count">0</b></div><div class="pile-label">Necropolis</div></div>
        </div>
        <button class="btn fight" data-act="fight" id="fightBtn">LUTAR ${ico('lutar', '⚔')}</button>
      </div>
      <details class="log-panel" open><summary>${ico('registro', '📜')} Registro da batalha</summary><ol class="log" id="log"></ol></details>
      <div class="rotate-prompt" role="dialog" aria-label="Gire o celular">
        <div class="rp-box">
          <div class="rp-icon" aria-hidden="true">${ico('girar', '📱')}</div>
          <div class="rp-title">Gire o celular para jogar deitado</div>
          <p class="rp-msg">A arena fica maior e as 6 cartas da mão cabem inteiras numa linha.</p>
          <div class="rp-btns"><button class="btn primary" data-act="rotate">⟳ Tela cheia deitada</button><button class="btn ghost" data-act="rotate-dismiss">Jogar em pé</button></div>
        </div>
      </div>
    </div>`;
    const battleEl = this.root.querySelector('.battle') as HTMLElement;
    if (sessionStorage.getItem('kicdl-rotate-dismissed')) battleEl.classList.add('rotate-dismissed');
    this.root.querySelector('[data-act=rotate]')!.addEventListener('click', () => void requestLandscape());
    this.root.querySelector('[data-act=rotate-dismiss]')!.addEventListener('click', () => {
      battleEl.classList.add('rotate-dismissed');
      try {
        sessionStorage.setItem('kicdl-rotate-dismissed', '1');
      } catch {
        /* ok */
      }
    });
    this.root.querySelector('[data-act=log]')!.addEventListener('click', () => battleEl.classList.toggle('log-open'));
    this.root.querySelector('[data-act=info-close]')!.addEventListener('click', () => {
      if (this.selected != null) this.clearSelection();
      else {
        this.infoUid = null;
        this.setInfo(INFO_DEFAULT);
      }
    });
    this.root.querySelector('[data-act=exit]')!.addEventListener('click', async () => {
      if (this.disposed) return;
      if (this.state.winner || (await gameConfirm('Sair da batalha?', 'O progresso desta luta será perdido.', 'Sair', true))) {
        if (this.disposed) return;
        this.dispose();
        this.cb.onExit();
      }
    });
    this.root.querySelector('[data-act=speed]')!.addEventListener('click', (e) => {
      const n = this.cb.speed() >= 3 ? 1 : this.cb.speed() + 1;
      this.cb.setSpeed(n);
      (e.currentTarget as HTMLElement).querySelector('span')!.textContent = `${n}x`;
    });
    this.root.querySelector('[data-act=auto]')!.addEventListener('click', () => {
      this.autoMode = !this.autoMode;
      const btn = this.root.querySelector('#autoBtn') as HTMLElement;
      btn.querySelector('span')!.textContent = `Auto: ${this.autoMode ? 'ON' : 'OFF'}`;
      btn.classList.toggle('active', this.autoMode);
      if (this.autoMode && !this.busy && !this.state.winner) void this.runAutoTurn();
    });
    this.root.querySelector('[data-act=fight]')!.addEventListener('click', () => this.fight());
    this.root.querySelectorAll<HTMLElement>('.cell').forEach((el) =>
      el.addEventListener('click', () => this.onCell(+el.dataset.r!, +el.dataset.c!)),
    );
  }

  /** Para tudo ao sair da batalha (Auto, turnos em andamento, janelas da batalha). */
  dispose() {
    this.disposed = true;
    this.autoMode = false;
    document.querySelectorAll('.battle-card-modal-bg').forEach((el) => el.remove());
  }

  async runAutoTurn() {
    while (this.autoMode && !this.disposed && !this.busy && !this.state.winner && this.state.active === 'player') {
      const ctx = new Ctx();
      playerAuto(this.state, ctx);
      if (ctx.events.length) {
        this.busy = true;
        await this.play(ctx.events);
        this.busy = false;
        if (this.disposed) return;
        this.renderHand();
      }
      if (!this.autoMode || this.disposed || this.state.winner) break;
      await this.fight();
    }
  }

  get board() {
    return this.root.querySelector('.board') as HTMLElement;
  }

  cellSize(): number {
    const cell = this.root.querySelector('.cell') as HTMLElement;
    return cell.getBoundingClientRect().width;
  }

  renderHand() {
    return battleHand.renderHand(this);
  }

  setPile(sel: string, n: number) {
    return battleHand.setPile(this, sel, n);
  }

  /** v0.14.4: cópia da carta que segue o dedo (dentro de um invólucro .hand para manter o visual da mão; só transform) */
  makeDragGhost(el: HTMLElement): HTMLElement {
    return battleHand.makeDragGhost(this, el);
  }

  /** soltou fora de uma casa válida: a carta volta para a mão (animação só de transform) */
  returnDragGhost(g: HTMLElement, el: HTMLElement) {
    return battleHand.returnDragGhost(this, g, el);
  }

  /** casa do campo embaixo do dedo (a carta fantasma não recebe toques) */
  cellAt(x: number, y: number): HTMLElement | null {
    const hit = document.elementFromPoint(x, y) as HTMLElement | null;
    const cell = hit?.closest<HTMLElement>('.cell') ?? null;
    return cell && this.root.contains(cell) ? cell : null;
  }

  /** durante o arrasto: destaca as mesmas casas que o toque destaca (casas livres da sua zona) */
  highlightDeploy(i?: number) {
    const cells = this.root.querySelectorAll<HTMLElement>('.cell');
    cells.forEach((c) => c.classList.remove('can', 'spell-t'));
    if (this.busy) return;
    const card = i == null ? undefined : this.state.decks.player.hand[i];
    for (const [r, c] of this.targetCells(card)) {
      this.root.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`)?.classList.add('can', ...(card && isSpell(card.charId) ? ['spell-t'] : []));
    }
  }

  /** casas válidas para a carta: zona livre (personagem) ou alvos do feitiço (v0.17.0) */
  targetCells(card?: CardInstance): [number, number][] {
    if (card && isSpell(card.charId)) return spellTargets(this.state, 'player', card.charId);
    return deployCells(this.state, 'player');
  }

  /** usa a carta da mão na casa: invoca o personagem ou lança o feitiço */
  useCard(i: number, r: number, c: number) {
    return playerUse(this.state, i, r, c);
  }

  /** v0.14.4: soltar a carta arrastada numa casa — mesmas regras do toque (carta pronta, zona, casa livre) */
  async dropCard(i: number, r: number, c: number) {
    if (this.busy) return;
    const res = this.useCard(i, r, c);
    if (!res.ok) {
      this.toast(res.reason ?? 'Inválido');
      this.renderHand();
      this.highlight();
      return;
    }
    this.selected = null;
    this.highlight();
    await this.play(res.events);
    this.renderHand();
  }

  /** Tira a seleção da carta da mão e volta o painel de informações ao texto inicial. */
  clearSelection() {
    this.selected = null;
    this.infoUid = null;
    this.setInfo(INFO_DEFAULT);
    this.renderHand();
    this.highlight();
  }

  showCardInfo(i: number) {
    return battleModals.showCardInfo(this, i);
  }

  showUnitInfo(u: Unit) {
    return battleModals.showUnitInfo(this, u);
  }

  /** Modal de detalhes da carta em batalha (idêntico à referência Legend of Dragon) */
  openCardModal(card: CardInstance, side: Side) {
    return battleModals.openCardModal(this, card, side);
  }

  /** v0.17.0: janela de detalhes do feitiço */
  openSpellModal(id: string) {
    return battleModals.openSpellModal(this, id);
  }

  /** v0.17.0 (decisões 16 e 17): efeitos com duração e auras recebidas pela unidade */
  setInfo(html: string) {
    this.root.querySelector('#info')!.innerHTML = html;
    // no layout deitado o painel vira uma janela por cima da arena: só aparece com conteúdo
    this.root.querySelector('.battle')?.classList.toggle('has-info', html !== INFO_DEFAULT);
  }

  highlight() {
    const cells = this.root.querySelectorAll<HTMLElement>('.cell');
    cells.forEach((c) => c.classList.remove('can', 'spell-t'));
    if (this.selected == null || this.busy) return;
    // v0.16.0: carta ainda na contagem não acende casas (só a carta pronta, com 0, pode ser invocada)
    const card = this.state.decks.player.hand[this.selected];
    if (!card || waitOf(card) > 0) return;
    const spell = isSpell(card.charId);
    for (const [r, c] of this.targetCells(card)) {
      this.root.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`)?.classList.add('can', ...(spell ? ['spell-t'] : []));
    }
  }

  async onCell(r: number, c: number) {
    if (this.busy) return;
    const u = unitAt(this.state, r, c);
    // v0.35.0: tocar numa casa/unidade sem carta escolhida não abre mais a descrição (só segurando)
    if (this.selected == null) return;
    const res = this.useCard(this.selected, r, c);
    if (!res.ok) {
      this.toast(res.reason ?? 'Inválido');
      if (u) {
        this.selected = null;
        this.renderHand();
        this.highlight();
      }
      return;
    }
    this.selected = null;
    this.highlight();
    await this.play(res.events);
    this.renderHand();
  }

  async fight() {
    if (this.busy || this.state.winner) return;
    this.busy = true;
    this.selected = null;
    // a luta começa: o painel/janela de informações fecha (no layout deitado ele cobre a arena)
    this.infoUid = null;
    this.setInfo(INFO_DEFAULT);
    this.highlight();
    this.renderHand();
    this.mine = new Set(this.state.units.filter((u) => u.side === 'player' && u.slot != null).map((u) => u.uid));
    this.deadShown = this.state.decks.player.defeated.length;
    const events = playerEndTurn(this.state);
    await this.play(events);
    this.busy = false;
    if (this.disposed) return;
    this.renderHand();
    this.renderSnapshot(this.snap());
    if (this.state.winner) {
      this.autoMode = false;
      await sleep(600);
      if (this.disposed) return;
      this.cb.onFinish(this.state.winner, { playerHp: this.state.heroes.player.hp, playerMaxHp: this.state.heroes.player.maxHp, turn: this.state.turn, stats: this.state.stats && { ...this.state.stats.player } });
    }
  }

  dur(ms: number) {
    return ms / this.cb.speed();
  }

  async play(events: RecordedEvent[]) {
    for (const ev of events) {
      if (this.disposed) return;
      this.renderSnapshot(ev.snap, ev);
      this.log(ev.text, ev.type === 'turn' || ev.type === 'end' ? 'sys' : this.sideOfEvent(ev));
      await this.effect(ev);
    }
  }

  sideOfEvent(ev: RecordedEvent): string {
    if ('uid' in ev) {
      const u = ev.snap.units.find((x) => x.uid === ev.uid) ?? this.lastUnits.get(ev.uid);
      if (u) return u.side;
    }
    if (ev.type === 'hero') return ev.side === 'enemy' ? 'player' : 'enemy';
    return 'sys';
  }

  lastUnits = new Map<number, Unit>();

  renderSnapshot(snap: Snapshot, _ev?: RecordedEvent) {
    return battleRender.renderSnapshot(this, snap, _ev);
  }

  center(r: number, c: number): [number, number] {
    const cs = this.cellSize();
    return [c * cs + cs / 2, r * cs + cs / 2];
  }

  heroCenter(side: Side): [number, number] {
    const b = this.board.getBoundingClientRect();
    const h = this.root.querySelector(`#hero-${side}`)!.getBoundingClientRect();
    return [h.left + h.width / 2 - b.left, h.top + h.height / 2 - b.top];
  }

  floatText(x: number, y: number, text: string, cls: string) {
    floatText(this.root.querySelector('.fx')!, x, y, text, cls);
  }

  /** Seta tática MOVE e poeira quando o personagem caminha na arena */
  showMoveTrail(from: [number, number], to: [number, number], jumped: boolean, label = jumped ? 'JUMP' : 'MOVE') {
    moveTrail(this.root.querySelector('.fx')!, this.center(from[0], from[1]), this.center(to[0], to[1]), to[1] > from[1], label, this.dur(440));
  }

  /** Feixe de Ki ou corte de energia estilo anime durante o ataque */
  showAttackFX(ax: number, ay: number, tx: number, ty: number, ranged: boolean, damageType: string, side: Side) {
    attackFX(this.root.querySelector('.fx')!, ax, ay, tx, ty, ranged, damageType, side, (ms) => this.dur(ms));
  }

  async effect(ev: RecordedEvent) {
    return battleEffects.effect(this, ev);
  }

  spark(x: number, y: number, type: string) {
    spark(this.root.querySelector('.fx')!, x, y, type);
  }

  banner(text: string, side: Side, big = false) {
    const b = this.root.querySelector('#banner') as HTMLElement;
    b.textContent = text;
    b.className = `banner show side-${side} ${big ? 'big' : ''}`;
    const t = b as HTMLElement & { _t?: ReturnType<typeof setTimeout> };
    clearTimeout(t._t);
    t._t = setTimeout(() => (b.className = 'banner'), big ? 2000 : this.dur(800));
  }

  toast(msg: string) {
    this.setInfo(`<span class="warn">⚠ ${esc(msg)}</span>`);
  }

  log(text: string, cls: string) {
    const ol = this.root.querySelector('#log')!;
    const li = document.createElement('li');
    li.className = `log-${cls}`;
    li.textContent = text;
    ol.appendChild(li);
    while (ol.children.length > 150) ol.firstChild!.remove();
    ol.scrollTop = ol.scrollHeight;
  }
}
