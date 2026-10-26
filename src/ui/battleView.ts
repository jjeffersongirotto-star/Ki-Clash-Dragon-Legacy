import { aiDeploy } from '../core/ai';
import { createBattle, deploy, deployCells, endPlayerTurn, effectiveAtk, unitAt, waitFor, waitOf, DEPLOY_DEPTH, Ctx } from '../core/battle';
import { RACE_INFO, getChar } from '../core/characters';
import { pileCount } from '../core/deck';
import type { BattleState, CardInstance, RecordedEvent, Side, Snapshot, Unit } from '../core/types';
import type { Stage } from '../core/campaign';
import { PLAYER_HERO_HP } from '../core/campaign';
import { enemyLeaderImg, playerLeaderImg, unitSpriteSVG } from './art';
import { gameConfirm } from './dialog';
import { requestLandscape } from './orientation';
import { dropAction, ghostTransform, shouldStartDrag } from './drag';
import { abilityListHTML, cardHTML, categoryHTML, dmgLabel, esc, raceHTML, reachLabel, starStyle, tierHTML } from './components';

export interface BattleCallbacks {
  speed: () => number;
  setSpeed: (s: number) => void;
  onFinish: (winner: Side | 'empate') => void;
  onExit: () => void;
  /** v0.13: vida do Comandante do jogador (nível do Comandante). Sem informar: nível 1 */
  playerHeroHp?: number;
}

const INFO_DEFAULT = 'Toque numa carta e depois numa casa brilhante para invocar. Segure a carta (ou use 🔍 Detalhes) para ver os detalhes.';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
  /** v0.10.1: saiu da batalha — animações/turnos pendentes param e o fim da luta não é mais anunciado */
  disposed = false;
  cb: BattleCallbacks;
  stage: Stage;

  constructor(root: HTMLElement, stage: Stage, playerDeck: CardInstance[], cb: BattleCallbacks) {
    this.root = root;
    this.cb = cb;
    this.stage = stage;
    this.state = createBattle({ playerDeck, enemyDeck: stage.enemyDeck, playerHeroHp: cb.playerHeroHp ?? PLAYER_HERO_HP, enemyHeroHp: stage.enemyHeroHp });
    this.mount();
    this.renderSnapshot(this.snap());
    this.renderHand();
    this.log(`⚔ Fase ${stage.id}: ${stage.name}. Invoque cartas na sua zona (3 colunas da esquerda) e toque em LUTAR!`, 'sys');
  }

  snap(): Snapshot {
    const s = this.state;
    return { units: s.units.map((u) => ({ ...u })), heroes: { player: { ...s.heroes.player }, enemy: { ...s.heroes.enemy } }, turn: s.turn, active: s.active };
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
        <button class="btn small ghost" data-act="speed" id="speedBtn">${this.cb.speed()}x</button>
        <button class="btn small ghost log-toggle" data-act="log" title="Registro da batalha">📜</button>
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
          <div class="hero-fig"><div class="hero-aura"></div>${enemyLeaderImg()}</div>
          <div class="hero-hp"><div class="bar"><i></i></div><span></span></div>
        </div>
      </div>
      <div class="tactical-tabs">
        <div class="info-wrap"><div class="info" id="info">${INFO_DEFAULT}</div><button class="info-close" data-act="info-close" aria-label="Fechar informações">✕</button></div>
        <div class="tactical-right">
          <button class="tab-btn" id="autoBtn" data-act="auto" title="Invocar e lutar automaticamente">Auto: OFF</button>
          <div class="deployed-pill" title="Unidades aliadas em campo">Em campo (<b id="deployedCount">0</b>)</div>
        </div>
      </div>
      <div class="bottom">
        <div class="energy" id="energy"></div>
        <div class="hand-row">
          <div class="pile pile-draw" id="pileDraw" title="Baralho: cartas que ainda podem ser compradas"><div class="pile-stack"><span class="pile-ico">🂠</span><b class="pile-count">0</b></div><div class="pile-label">Baralho</div></div>
          <div class="hand" id="hand"></div>
          <div class="pile pile-dead" id="pileDead" title="Necropolis (Derrotadas): cópias cujas unidades caíram"><div class="pile-stack"><span class="pile-ico">☠</span><b class="pile-count">0</b></div><div class="pile-label">Necropolis</div></div>
        </div>
        <button class="btn fight" data-act="fight" id="fightBtn">LUTAR ⚔</button>
      </div>
      <details class="log-panel" open><summary>📜 Registro da batalha</summary><ol class="log" id="log"></ol></details>
      <div class="rotate-prompt" role="dialog" aria-label="Gire o celular">
        <div class="rp-box">
          <div class="rp-icon" aria-hidden="true">📱</div>
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
      (e.currentTarget as HTMLElement).textContent = `${n}x`;
    });
    this.root.querySelector('[data-act=auto]')!.addEventListener('click', () => {
      this.autoMode = !this.autoMode;
      const btn = this.root.querySelector('#autoBtn') as HTMLElement;
      btn.textContent = `Auto: ${this.autoMode ? 'ON' : 'OFF'}`;
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
      aiDeploy(this.state, ctx, 'player');
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
    const s = this.state;
    const hand = this.root.querySelector('#hand')!;
    hand.innerHTML = s.decks.player.hand
      .map((c, i) => {
        const afford = waitOf(c) === 0 && s.active === 'player' && !s.winner;
        return cardHTML(c, { wait: waitOf(c), extraClass: `hand-card ${afford ? '' : 'cant'} ${this.selected === i ? 'sel' : ''}`, attrs: `data-i="${i}"` });
      })
      .join('') || '<div class="empty-hand">Sem cartas na mão</div>';
    hand.querySelectorAll<HTMLElement>('.hand-card').forEach((el) => {
      const i = +el.dataset.i!;
      // segurar a carta (~0,5 s) abre os detalhes; tocar seleciona; tocar de novo tira a seleção;
      // v0.14.4: ARRASTAR a carta até uma casa da sua zona também invoca (toque e mouse)
      let timer: ReturnType<typeof setTimeout> | undefined;
      const cancel = () => clearTimeout(timer);
      let drag: { id: number; x0: number; y0: number; gx: number; gy: number; ghost?: HTMLElement; over?: HTMLElement | null } | null = null;
      el.addEventListener('pointerdown', (ev) => {
        cancel();
        this.suppressClick = false;
        timer = setTimeout(() => {
          const c = s.decks.player.hand[i];
          if (!c || drag?.ghost) return;
          drag = null;
          this.suppressClick = true;
          this.openCardModal(c, 'player');
        }, 500);
        drag = null;
        if (this.busy || s.winner || s.active !== 'player' || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
        const r = el.getBoundingClientRect();
        drag = { id: ev.pointerId, x0: ev.clientX, y0: ev.clientY, gx: ev.clientX - r.left, gy: ev.clientY - r.top };
      });
      el.addEventListener('pointermove', (ev) => {
        if (!drag || ev.pointerId !== drag.id) return;
        if (!drag.ghost) {
          if (!shouldStartDrag(ev.clientX - drag.x0, ev.clientY - drag.y0)) return;
          cancel();
          try {
            el.setPointerCapture(ev.pointerId);
          } catch {
            /* sem captura: segue pelos eventos do próprio elemento */
          }
          drag.ghost = this.makeDragGhost(el);
          el.classList.add('dragging');
          this.highlightDeploy();
        }
        ev.preventDefault();
        drag.ghost.style.transform = ghostTransform(ev.clientX, ev.clientY, drag.gx, drag.gy);
        const cell = this.cellAt(ev.clientX, ev.clientY);
        if (cell !== drag.over) {
          drag.over?.classList.remove('drop-over');
          if (cell?.classList.contains('can')) cell.classList.add('drop-over');
          drag.over = cell;
        }
      });
      const end = (ev: PointerEvent, dropped: boolean) => {
        cancel();
        if (!drag || ev.pointerId !== drag.id) return;
        const d = drag;
        drag = null;
        if (!d.ghost) return;
        this.suppressClick = true;
        d.over?.classList.remove('drop-over');
        const cell = dropped ? this.cellAt(ev.clientX, ev.clientY) : null;
        if (dropAction(cell ? { valid: cell.classList.contains('can') } : null) === 'deploy' && cell) {
          d.ghost.parentElement!.remove();
          el.classList.remove('dragging');
          void this.dropCard(i, +cell.dataset.r!, +cell.dataset.c!);
        } else {
          this.returnDragGhost(d.ghost, el);
          this.highlight();
        }
      };
      el.addEventListener('pointerup', (ev) => end(ev, true));
      el.addEventListener('pointercancel', (ev) => end(ev, false));
      el.addEventListener('pointerleave', () => {
        if (!drag?.ghost) cancel();
      });
      el.addEventListener('contextmenu', (e) => e.preventDefault());
      el.addEventListener('click', () => {
        if (this.suppressClick) {
          this.suppressClick = false;
          return;
        }
        if (this.selected === i) {
          this.clearSelection();
          return;
        }
        this.selected = i;
        this.showCardInfo(i);
        this.renderHand();
        this.highlight();
      });
    });
    const e = this.root.querySelector('#energy')!;
    // v0.16.0: no lugar da energia, quantas cartas da mão estão prontas (contagem 0)
    const inHand = s.decks.player.hand;
    const ready = inHand.filter((h) => waitOf(h) === 0).length;
    e.innerHTML = `<div class="energy-orb" title="Cartas prontas para invocar">⏳<b>${ready}</b></div><div class="energy-pips">${inHand.map((h) => `<i class="${waitOf(h) === 0 ? 'on' : ''}"></i>`).join('')}</div>`;
    this.setPile('#pileDraw', pileCount(s.decks.player));
    this.setPile('#pileDead', s.decks.player.defeated.length);
    const depCount = s.units.filter((u) => u.side === 'player' && u.hp > 0).length;
    const depEl = this.root.querySelector('#deployedCount');
    if (depEl) depEl.textContent = String(depCount);
    (this.root.querySelector('#fightBtn') as HTMLButtonElement).disabled = this.busy || !!s.winner;
  }

  setPile(sel: string, n: number) {
    const el = this.root.querySelector<HTMLElement>(sel);
    if (!el) return;
    const b = el.querySelector('.pile-count')!;
    if (b.textContent !== String(n)) {
      b.textContent = String(n);
      el.classList.remove('bump');
      void el.offsetWidth;
      el.classList.add('bump');
    }
    if (sel === '#pileDead') el.classList.toggle('empty', n === 0);
  }

  /** v0.14.4: cópia da carta que segue o dedo (dentro de um invólucro .hand para manter o visual da mão; só transform) */
  makeDragGhost(el: HTMLElement): HTMLElement {
    const r = el.getBoundingClientRect();
    const wrap = document.createElement('div');
    wrap.className = 'hand drag-ghost-wrap';
    const g = el.cloneNode(true) as HTMLElement;
    g.classList.remove('sel', 'dragging');
    g.classList.add('drag-ghost');
    g.style.width = `${r.width}px`;
    g.style.flex = 'none';
    g.style.transform = `translate3d(${Math.round(r.left)}px, ${Math.round(r.top)}px, 0)`;
    wrap.appendChild(g);
    this.root.appendChild(wrap);
    return g;
  }

  /** soltou fora de uma casa válida: a carta volta para a mão (animação só de transform) */
  returnDragGhost(g: HTMLElement, el: HTMLElement) {
    const r = el.getBoundingClientRect();
    g.style.transition = 'transform .16s ease-out';
    g.style.transform = `translate3d(${Math.round(r.left)}px, ${Math.round(r.top)}px, 0)`;
    setTimeout(() => {
      g.parentElement?.remove();
      el.classList.remove('dragging');
    }, 170);
  }

  /** casa do campo embaixo do dedo (a carta fantasma não recebe toques) */
  cellAt(x: number, y: number): HTMLElement | null {
    const hit = document.elementFromPoint(x, y) as HTMLElement | null;
    const cell = hit?.closest<HTMLElement>('.cell') ?? null;
    return cell && this.root.contains(cell) ? cell : null;
  }

  /** durante o arrasto: destaca as mesmas casas que o toque destaca (casas livres da sua zona) */
  highlightDeploy() {
    const cells = this.root.querySelectorAll<HTMLElement>('.cell');
    cells.forEach((c) => c.classList.remove('can'));
    if (this.busy) return;
    for (const [r, c] of deployCells(this.state, 'player')) {
      this.root.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`)?.classList.add('can');
    }
  }

  /** v0.14.4: soltar a carta arrastada numa casa — mesmas regras do toque (carta pronta, zona, casa livre) */
  async dropCard(i: number, r: number, c: number) {
    if (this.busy) return;
    const res = deploy(this.state, 'player', i, r, c);
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
    const c = this.state.decks.player.hand[i];
    if (!c) return;
    const def = getChar(c.charId);
    this.setInfo(
      `<div class="info-head"><span><b>${esc(def.name)}</b> ${tierHTML(c.stars, !!c.plus)} · ${raceHTML(def)} · espera ${waitFor(def.id)} rodada(s)${waitOf(c) ? ` (falta${waitOf(c) > 1 ? 'm' : ''} ${waitOf(c)})` : ' (pronta)'} · ${dmgLabel(def)} · alcance ${reachLabel(def)}</span><button class="btn small ghost info-inspect" data-inspect-hand="${i}">🔍 Detalhes</button></div>${abilityListHTML(def, c.stars, c.level)}`,
    );
    this.root.querySelector('[data-inspect-hand]')?.addEventListener('click', () => this.openCardModal(c, 'player'));
    this.infoUid = null;
  }

  showUnitInfo(u: Unit) {
    const def = getChar(u.charId);
    this.setInfo(
      `<div class="info-head"><span><b>${esc(def.name)}</b> ${u.side === 'enemy' ? '<span class="tag-e">inimigo</span>' : ''} ${tierHTML(u.stars, !!u.plus)} Nv.${u.level} · ${raceHTML(def)} · ❤ ${u.hp}/${u.maxHp} · ATQ ${effectiveAtk(this.state, u)} (${dmgLabel(def)}) · alcance ${reachLabel(def)}</span><button class="btn small ghost info-inspect" data-inspect-unit="${u.uid}">🔍 Ver Carta</button></div>${abilityListHTML(def, u.stars, u.level)}`,
    );
    this.root.querySelector('[data-inspect-unit]')?.addEventListener('click', () =>
      this.openCardModal({ charId: u.charId, level: u.level, stars: u.stars, plus: !!u.plus }, u.side),
    );
    this.infoUid = u.uid;
  }

  /** Modal de detalhes da carta em batalha (idêntico à referência Legend of Dragon) */
  openCardModal(card: CardInstance, side: Side) {
    document.querySelector('.battle-card-modal-bg')?.remove();
    const def = getChar(card.charId);
    const race = RACE_INFO[def.race];
    const bg = document.createElement('div');
    bg.className = 'battle-card-modal-bg';
    bg.innerHTML = `
      <div class="battle-card-modal" style="${starStyle(card.stars)}">
        <button class="bcm-close" aria-label="Fechar">✕</button>
        <div class="bcm-body">
        <div class="bcm-left">
          ${cardHTML(card)}
        </div>
        <div class="bcm-right">
          <div class="bcm-leader">Comandante: ${side === 'player' ? 'Você' : esc(this.stage.name)}</div>
          <h3 class="bcm-title">${esc(def.name)}</h3>
          <div class="bcm-sub">${esc(def.title)} · ${race.icon} ${race.label}</div>
          <div class="bcm-tags">${categoryHTML(def, true)} ${tierHTML(card.stars, !!card.plus)}</div>
          <div class="bcm-sec">Habilidades & Atributos</div>
          <div class="bcm-stats">Alcance: <b>${reachLabel(def)}</b> · Movimento: <b>${def.move} casas</b> · Dano: <b>${dmgLabel(def)}</b></div>
          ${abilityListHTML(def, card.stars, card.level)}
          <p class="bcm-lore">${esc(def.lore)}</p>
        </div>
        </div>
      </div>
      <div class="bcm-hint">Toque no botão '✕' ou fora da janela para fechar os detalhes da carta.</div>
    `;
    document.body.appendChild(bg);
    // ao fechar, a carta não fica selecionada
    const close = () => {
      bg.remove();
      if (this.selected != null) this.clearSelection();
    };
    bg.querySelector('.bcm-close')!.addEventListener('click', close);
    bg.addEventListener('click', (e) => {
      if (e.target === bg) close();
    });
  }

  setInfo(html: string) {
    this.root.querySelector('#info')!.innerHTML = html;
    // no layout deitado o painel vira uma janela por cima da arena: só aparece com conteúdo
    this.root.querySelector('.battle')?.classList.toggle('has-info', html !== INFO_DEFAULT);
  }

  highlight() {
    const cells = this.root.querySelectorAll<HTMLElement>('.cell');
    cells.forEach((c) => c.classList.remove('can'));
    if (this.selected == null || this.busy) return;
    // v0.16.0: carta ainda na contagem não acende casas (só a carta pronta, com 0, pode ser invocada)
    const card = this.state.decks.player.hand[this.selected];
    if (!card || waitOf(card) > 0) return;
    for (const [r, c] of deployCells(this.state, 'player')) {
      this.root.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`)?.classList.add('can');
    }
  }

  async onCell(r: number, c: number) {
    if (this.busy) return;
    const u = unitAt(this.state, r, c);
    if (this.selected == null) {
      if (u) this.showUnitInfo(u);
      return;
    }
    const res = deploy(this.state, 'player', this.selected, r, c);
    if (!res.ok) {
      if (u) {
        this.showUnitInfo(u);
        this.selected = null;
        this.renderHand();
        this.highlight();
      } else this.toast(res.reason ?? 'Inválido');
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
    const events = endPlayerTurn(this.state, aiDeploy);
    await this.play(events);
    this.busy = false;
    if (this.disposed) return;
    this.renderHand();
    this.renderSnapshot(this.snap());
    if (this.state.winner) {
      this.autoMode = false;
      await sleep(600);
      if (this.disposed) return;
      this.cb.onFinish(this.state.winner);
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
    const layer = this.root.querySelector('.units') as HTMLElement;
    const seen = new Set<number>();
    for (const u of snap.units) {
      seen.add(u.uid);
      this.lastUnits.set(u.uid, u);
      let el = this.tokens.get(u.uid);
      if (!el) {
        const def = getChar(u.charId);
        el = document.createElement('div');
        el.className = `unit side-${u.side} cat-${def.category} ${u.isMinion ? 'minion' : ''} appear`;
        el.setAttribute('style', `${starStyle(u.stars)};--ac:${def.palette.aura}`);
        el.innerHTML = `
          <div class="u-portrait">${unitSpriteSVG(def, { flip: u.side === 'enemy', stars: u.stars, side: u.side })}</div>
          <div class="u-hp"><i></i></div>
          <div class="u-stat-plate"><span class="u-atk"></span><b class="u-sep">|</b><span class="u-hpn"></span></div>
        `;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const cur = this.state.units.find((x) => x.uid === u.uid);
          if (this.selected != null) {
            this.onCell(cur?.row ?? u.row, cur?.col ?? u.col);
            return;
          }
          if (cur) this.showUnitInfo(cur);
        });
        layer.appendChild(el);
        this.tokens.set(u.uid, el);
        setTimeout(() => el!.classList.remove('appear'), 500);
      }
      el.style.setProperty('--r', String(u.row));
      el.style.setProperty('--c', String(u.col));
      (el.querySelector('.u-hp i') as HTMLElement).style.width = `${Math.max(0, (u.hp / u.maxHp) * 100)}%`;
      const fake = { ...this.state, units: snap.units } as BattleState;
      const atk = effectiveAtk(fake, u);
      const atkEl = el.querySelector('.u-atk') as HTMLElement;
      atkEl.textContent = String(atk);
      atkEl.classList.toggle('debuff', atk < u.atk);
      atkEl.classList.toggle('buff', atk > u.atk);
      (el.querySelector('.u-hpn') as HTMLElement).textContent = String(Math.max(0, u.hp));
    }
    if (this.infoUid != null && !seen.has(this.infoUid)) {
      this.infoUid = null;
      if (this.selected == null) this.setInfo(INFO_DEFAULT);
    }
    for (const [uid, el] of this.tokens) {
      if (!seen.has(uid)) {
        this.tokens.delete(uid);
        el.classList.add('dying');
        setTimeout(() => el.remove(), 650);
      }
    }
    for (const side of ['player', 'enemy'] as Side[]) {
      const h = snap.heroes[side];
      const pct = `${Math.max(0, (h.hp / h.maxHp) * 100)}%`;
      const box = this.root.querySelector(`#hero-${side}`)!;
      (box.querySelector('.bar i') as HTMLElement).style.width = pct;
      box.querySelector('.hero-hp span')!.textContent = `${h.hp}/${h.maxHp}`;
      const topBar = this.root.querySelector(side === 'player' ? '#topBarP' : '#topBarE') as HTMLElement | null;
      const topHp = this.root.querySelector(side === 'player' ? '#topHpP' : '#topHpE') as HTMLElement | null;
      if (topBar) topBar.style.width = pct;
      if (topHp) topHp.textContent = `${h.hp}/${h.maxHp}`;
    }
    const depEl = this.root.querySelector('#deployedCount');
    if (depEl) depEl.textContent = String(snap.units.filter((u) => u.side === 'player' && u.hp > 0).length);
    this.root.querySelector('#turnNo')!.textContent = String(snap.turn);
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
    const fx = this.root.querySelector('.fx')!;
    const d = document.createElement('div');
    d.className = `float ${cls}`;
    d.textContent = text;
    d.style.left = `${x}px`;
    d.style.top = `${y}px`;
    fx.appendChild(d);
    setTimeout(() => d.remove(), 1100);
  }

  /** Seta tática MOVE e poeira quando o personagem caminha na arena */
  showMoveTrail(from: [number, number], to: [number, number], jumped: boolean, label = jumped ? 'JUMP' : 'MOVE') {
    const fx = this.root.querySelector('.fx')!;
    const [x1, y1] = this.center(from[0], from[1]);
    const [x2] = this.center(to[0], to[1]);
    const trail = document.createElement('div');
    trail.className = `move-arrow ${to[1] > from[1] ? 'dir-r' : 'dir-l'}`;
    trail.style.left = `${Math.min(x1, x2)}px`;
    trail.style.top = `${y1 - 26}px`;
    trail.style.width = `${Math.max(36, Math.abs(x2 - x1))}px`;
    trail.innerHTML = `<span>${label}</span><i></i>`;
    fx.appendChild(trail);
    for (let i = 0; i < 3; i++) {
      const dust = document.createElement('div');
      dust.className = 'dust-puff';
      dust.style.left = `${x1 + ((x2 - x1) * i) / 3}px`;
      dust.style.top = `${y1 + 18}px`;
      fx.appendChild(dust);
      setTimeout(() => dust.remove(), 480);
    }
    setTimeout(() => trail.remove(), this.dur(440));
  }

  /** Feixe de Ki ou corte de energia estilo anime durante o ataque */
  showAttackFX(ax: number, ay: number, tx: number, ty: number, ranged: boolean, damageType: string, side: Side) {
    const fx = this.root.querySelector('.fx')!;
    const dx = tx - ax;
    const dy = ty - ay;
    const dist = Math.hypot(dx, dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (ranged && damageType === 'magico') {
      // Feixe de Ki contínuo estilo anime (Kamehameha / raio arcano)
      const beam = document.createElement('div');
      beam.className = `ki-beam side-${side}`;
      beam.style.left = `${ax}px`;
      beam.style.top = `${ay - 6}px`;
      beam.style.width = `${dist}px`;
      beam.style.transform = ` translateY(-50%) rotate(${angle}deg)`;
      fx.appendChild(beam);
      setTimeout(() => beam.remove(), this.dur(360));
    } else if (!ranged) {
      // Onda de corte corpo a corpo + selo HIT!
      const slash = document.createElement('div');
      slash.className = `melee-wave ${damageType} side-${side}`;
      slash.style.left = `${(ax + tx) / 2}px`;
      slash.style.top = `${(ay + ty) / 2 - 4}px`;
      slash.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
      fx.appendChild(slash);
      this.floatText(tx, ty - 26, 'HIT!', 'hit-tag');
      setTimeout(() => slash.remove(), this.dur(350));
    }
  }

  async effect(ev: RecordedEvent) {
    const fx = this.root.querySelector('.fx')!;
    switch (ev.type) {
      case 'turn':
        this.banner(ev.side === 'player' ? `Turno ${ev.turn} · Sua vez` : `Turno ${ev.turn} · Inimigo`, ev.side);
        await sleep(this.dur(650));
        break;
      case 'deploy':
      case 'spawn':
        await sleep(this.dur(380));
        break;
      case 'aura': {
        this.board.classList.add('aura-pulse');
        await sleep(this.dur(600));
        this.board.classList.remove('aura-pulse');
        break;
      }
      case 'move': {
        const el = this.tokens.get(ev.uid);
        const through = ev.through ?? [];
        // v0.15.1: JUMP só no salto de verdade (Salto Vendaval); passar por aliados = PASSA
        this.showMoveTrail(ev.from, ev.to, ev.jumped, ev.jumped ? 'JUMP' : through.length ? 'PASSA' : 'MOVE');
        if (el) {
          // v0.15.0: passar por um aliado = pulinho por cima dele (só transform), e o aliado se abaixa
          const cls = ev.jumped || through.length ? ['jumping', 'passing'] : ['moving'];
          el.classList.add(...cls);
          setTimeout(() => el.classList.remove(...cls), this.dur(430));
        }
        for (const [r, c] of through) {
          const o = ev.snap.units.find((x) => x.row === r && x.col === c && x.uid !== ev.uid);
          const oe = o && this.tokens.get(o.uid);
          if (!oe) continue;
          oe.classList.add('ducking');
          setTimeout(() => oe.classList.remove('ducking'), this.dur(430));
        }
        await sleep(this.dur(420));
        break;
      }
      case 'push':
        this.tokens.get(ev.uid)?.classList.add('pushed');
        setTimeout(() => this.tokens.get(ev.uid)?.classList.remove('pushed'), 400);
        await sleep(this.dur(350));
        break;
      case 'counter': {
        const u = ev.snap.units.find((x) => x.uid === ev.uid);
        if (u) {
          const [x, y] = this.center(u.row, u.col);
          this.floatText(x, y - 20, 'CONTRA-GOLPE!', 'counter');
        }
        await sleep(this.dur(400));
        break;
      }
      case 'attack': {
        const a = ev.snap.units.find((x) => x.uid === ev.uid);
        if (!a) break;
        const [ax, ay] = this.center(a.row, a.col);
        let tx: number, ty: number;
        if (ev.target === 'hero') [tx, ty] = this.heroCenter(ev.targetSide);
        else {
          const t = ev.snap.units.find((x) => x.uid === ev.target);
          if (!t) break;
          [tx, ty] = this.center(t.row, t.col);
        }
        const el = this.tokens.get(a.uid);
        this.showAttackFX(ax, ay, tx, ty, ev.ranged, ev.damageType, a.side);
        if (ev.ranged) {
          const p = document.createElement('div');
          p.className = `proj ${ev.damageType} side-${a.side}`;
          p.style.left = `${ax}px`;
          p.style.top = `${ay - 6}px`;
          fx.appendChild(p);
          const d = this.dur(320);
          p.animate([{ transform: 'translate(-50%,-50%) scale(.6)' }, { transform: `translate(calc(${tx - ax}px - 50%), calc(${ty - ay}px - 50%)) scale(1.35)` }], { duration: d, easing: 'ease-in' });
          el?.classList.add('casting');
          await sleep(d);
          p.remove();
          el?.classList.remove('casting');
        } else if (el) {
          const cs = this.cellSize();
          const dx = Math.max(-0.55, Math.min(0.55, (tx - ax) / cs / 1.6)) * cs;
          const dy = Math.max(-0.55, Math.min(0.55, (ty - ay) / cs / 1.6)) * cs;
          el.classList.add('attacking-melee');
          el.animate([{ translate: '0 0' }, { translate: `${dx}px ${dy}px` }, { translate: '0 0' }], { duration: this.dur(300), easing: 'ease-out' });
          await sleep(this.dur(220));
          el.classList.remove('attacking-melee');
        }
        this.spark(tx, ty, ev.damageType);
        break;
      }
      case 'damage': {
        const t = ev.snap.units.find((x) => x.uid === ev.uid) ?? this.lastUnits.get(ev.uid);
        if (t) {
          const [x, y] = this.center(t.row, t.col);
          this.floatText(x, y - 8, `-${ev.amount}`, ev.damageType);
          const el = this.tokens.get(ev.uid);
          el?.classList.remove('hit');
          void el?.offsetWidth;
          el?.classList.add('hit');
        }
        await sleep(this.dur(300));
        break;
      }
      case 'hero': {
        const [x, y] = this.heroCenter(ev.side);
        this.floatText(x, y, `-${ev.amount}`, 'hero-dmg');
        const box = this.root.querySelector(`#hero-${ev.side}`)!;
        box.classList.remove('hit');
        void (box as HTMLElement).offsetWidth;
        box.classList.add('hit');
        this.board.parentElement!.classList.add('quake');
        setTimeout(() => this.board.parentElement!.classList.remove('quake'), 300);
        await sleep(this.dur(380));
        break;
      }
      case 'heal': {
        const t = ev.snap.units.find((x) => x.uid === ev.uid);
        if (t) {
          const [x, y] = this.center(t.row, t.col);
          this.floatText(x, y - 10, `+${ev.amount}`, 'heal');
        }
        await sleep(this.dur(300));
        break;
      }
      case 'death':
        if (this.mine.has(ev.uid)) this.setPile('#pileDead', ++this.deadShown);
        await sleep(this.dur(380));
        break;
      case 'end':
        this.banner(ev.winner === 'player' ? 'VITÓRIA!' : ev.winner === 'enemy' ? 'DERROTA' : 'EMPATE', ev.winner === 'player' ? 'player' : 'enemy', true);
        await sleep(900);
        break;
    }
  }

  spark(x: number, y: number, type: string) {
    const fx = this.root.querySelector('.fx')!;
    const s = document.createElement('div');
    s.className = `spark ${type}`;
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    fx.appendChild(s);
    setTimeout(() => s.remove(), 500);
  }

  banner(text: string, side: Side, big = false) {
    const b = this.root.querySelector('#banner') as HTMLElement;
    b.textContent = text;
    b.className = `banner show side-${side} ${big ? 'big' : ''}`;
    clearTimeout((b as any)._t);
    (b as any)._t = setTimeout(() => (b.className = 'banner'), big ? 2000 : this.dur(800));
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
