import { aiDeploy } from '../core/ai';
import { createBattle, deploy, deployCells, endPlayerTurn, effectiveAtk, unitAt, DEPLOY_DEPTH } from '../core/battle';
import { getChar } from '../core/characters';
import type { BattleState, RecordedEvent, Side, Snapshot, Unit } from '../core/types';
import type { Stage } from '../core/campaign';
import { PLAYER_HERO_HP } from '../core/campaign';
import { heroSVG, portraitSVG } from './art';
import { abilityListHTML, cardHTML, dmgLabel, esc, reachLabel, starStyle, starsHTML } from './components';

export interface BattleCallbacks {
  speed: () => number;
  setSpeed: (s: number) => void;
  onFinish: (winner: Side | 'empate') => void;
  onExit: () => void;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class BattleView {
  state: BattleState;
  root: HTMLElement;
  selected: number | null = null;
  busy = false;
  tokens = new Map<number, HTMLElement>();
  cb: BattleCallbacks;
  stage: Stage;

  constructor(root: HTMLElement, stage: Stage, playerDeck: { charId: string; level: number; stars: number }[], cb: BattleCallbacks) {
    this.root = root;
    this.cb = cb;
    this.stage = stage;
    this.state = createBattle({ playerDeck, enemyDeck: stage.enemyDeck, playerHeroHp: PLAYER_HERO_HP, enemyHeroHp: stage.enemyHeroHp });
    this.mount();
    this.renderSnapshot(this.snap());
    this.renderHand();
    this.log(`⚔ Fase ${stage.id}: ${stage.name}. Invoque cartas na sua zona (3 colunas da esquerda) e toque em LUTAR!`, 'sys');
  }

  snap(): Snapshot {
    const s = this.state;
    return { units: s.units.map((u) => ({ ...u })), heroes: { player: { ...s.heroes.player }, enemy: { ...s.heroes.enemy } }, energy: { ...s.energy }, turn: s.turn, active: s.active };
  }

  mount() {
    const s = this.state;
    let cells = '';
    for (let r = 0; r < s.rows; r++)
      for (let c = 0; c < s.cols; c++)
        cells += `<div class="cell ${c < DEPLOY_DEPTH ? 'zone-p' : c >= s.cols - DEPLOY_DEPTH ? 'zone-e' : ''}" data-r="${r}" data-c="${c}"></div>`;
    this.root.innerHTML = `
    <div class="battle">
      <div class="bhud">
        <button class="btn small ghost" data-act="exit">✕ Sair</button>
        <div class="bhud-title">Fase ${this.stage.id} · ${esc(this.stage.name)}</div>
        <div class="turn-ind">Turno <b id="turnNo">1</b></div>
        <button class="btn small ghost" data-act="speed" id="speedBtn">${this.cb.speed()}x</button>
      </div>
      <div class="field">
        <div class="hero hero-p" id="hero-player">${heroSVG('player')}<div class="hero-hp"><div class="bar"><i></i></div><span></span></div><div class="hero-name">Você</div></div>
        <div class="board-wrap">
          <div class="board" style="--rows:${s.rows};--cols:${s.cols}">
            ${cells}
            <div class="units"></div>
            <div class="fx"></div>
          </div>
          <div class="banner" id="banner"></div>
        </div>
        <div class="hero hero-e" id="hero-enemy">${heroSVG('enemy')}<div class="hero-hp"><div class="bar"><i></i></div><span></span></div><div class="hero-name">Inimigo</div></div>
      </div>
      <div class="info" id="info">Toque numa carta e depois numa casa brilhante para invocar.</div>
      <div class="bottom">
        <div class="energy" id="energy"></div>
        <div class="hand" id="hand"></div>
        <button class="btn fight" data-act="fight" id="fightBtn">LUTAR ⚔</button>
      </div>
      <details class="log-panel" open><summary>📜 Registro da batalha</summary><ol class="log" id="log"></ol></details>
    </div>`;
    this.root.querySelector('[data-act=exit]')!.addEventListener('click', () => {
      if (this.state.winner || confirm('Sair da batalha? O progresso desta luta será perdido.')) this.cb.onExit();
    });
    this.root.querySelector('[data-act=speed]')!.addEventListener('click', (e) => {
      const n = this.cb.speed() >= 3 ? 1 : this.cb.speed() + 1;
      this.cb.setSpeed(n);
      (e.currentTarget as HTMLElement).textContent = `${n}x`;
    });
    this.root.querySelector('[data-act=fight]')!.addEventListener('click', () => this.fight());
    this.root.querySelectorAll<HTMLElement>('.cell').forEach((el) =>
      el.addEventListener('click', () => this.onCell(+el.dataset.r!, +el.dataset.c!)),
    );
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
        const def = getChar(c.charId);
        const afford = def.cost <= s.energy.player && s.active === 'player' && !s.winner;
        return cardHTML(c, { extraClass: `hand-card ${afford ? '' : 'cant'} ${this.selected === i ? 'sel' : ''}`, attrs: `data-i="${i}"` });
      })
      .join('') || '<div class="empty-hand">Sem cartas na mão</div>';
    hand.querySelectorAll<HTMLElement>('.hand-card').forEach((el) =>
      el.addEventListener('click', () => {
        const i = +el.dataset.i!;
        this.selected = this.selected === i ? null : i;
        this.showCardInfo(i);
        this.renderHand();
        this.highlight();
      }),
    );
    const e = this.root.querySelector('#energy')!;
    const max = s.active === 'player' ? Math.min(10, 2 + s.turn) : s.energy.player;
    e.innerHTML = `<div class="energy-orb">⚡<b>${s.energy.player}</b></div><div class="energy-pips">${Array.from({ length: max }, (_, i) => `<i class="${i < s.energy.player ? 'on' : ''}"></i>`).join('')}</div><div class="deck-count">🂠 ${s.decks.player.draw.length}</div>`;
    (this.root.querySelector('#fightBtn') as HTMLButtonElement).disabled = this.busy || !!s.winner;
  }

  showCardInfo(i: number) {
    const c = this.state.decks.player.hand[i];
    if (!c) return;
    const def = getChar(c.charId);
    this.setInfo(`<b>${esc(def.name)}</b> ${starsHTML(c.stars)} · custo ${def.cost} · ${dmgLabel(def)} · alcance ${reachLabel(def)}${abilityListHTML(def, c.stars, c.level)}`);
  }

  showUnitInfo(u: Unit) {
    const def = getChar(u.charId);
    this.setInfo(`<b>${esc(def.name)}</b> ${u.side === 'enemy' ? '<span class="tag-e">inimigo</span>' : ''} ${starsHTML(u.stars)} Nv.${u.level} · ❤ ${u.hp}/${u.maxHp} · ataque ${effectiveAtk(this.state, u)} (${dmgLabel(def)}) · alcance ${reachLabel(def)}${abilityListHTML(def, u.stars, u.level)}`);
  }

  setInfo(html: string) {
    this.root.querySelector('#info')!.innerHTML = html;
  }

  highlight() {
    const cells = this.root.querySelectorAll<HTMLElement>('.cell');
    cells.forEach((c) => c.classList.remove('can'));
    if (this.selected == null || this.busy) return;
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
    this.highlight();
    this.renderHand();
    const events = endPlayerTurn(this.state, aiDeploy);
    await this.play(events);
    this.busy = false;
    this.renderHand();
    this.renderSnapshot(this.snap());
    if (this.state.winner) {
      await sleep(600);
      this.cb.onFinish(this.state.winner);
    }
  }

  dur(ms: number) {
    return ms / this.cb.speed();
  }

  async play(events: RecordedEvent[]) {
    for (const ev of events) {
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

  renderSnapshot(snap: Snapshot, ev?: RecordedEvent) {
    const layer = this.root.querySelector('.units') as HTMLElement;
    const seen = new Set<number>();
    for (const u of snap.units) {
      seen.add(u.uid);
      this.lastUnits.set(u.uid, u);
      let el = this.tokens.get(u.uid);
      if (!el) {
        el = document.createElement('div');
        el.className = `unit side-${u.side} ${u.isMinion ? 'minion' : ''} appear`;
        el.setAttribute('style', starStyle(u.stars));
        el.innerHTML = `<div class="u-portrait">${portraitSVG(getChar(u.charId), { flip: u.side === 'enemy' })}</div><div class="u-hp"><i></i></div><div class="u-atk"></div><div class="u-hpn"></div>`;
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
      atkEl.textContent = `${u.damageType === 'fisico' ? '👊' : '✨'}${atk}`;
      atkEl.classList.toggle('debuff', atk < u.atk);
      (el.querySelector('.u-hpn') as HTMLElement).textContent = String(Math.max(0, u.hp));
    }
    for (const [uid, el] of this.tokens) {
      if (!seen.has(uid)) {
        this.tokens.delete(uid);
        el.classList.add('dying');
        setTimeout(() => el.remove(), 600);
      }
    }
    for (const side of ['player', 'enemy'] as Side[]) {
      const h = snap.heroes[side];
      const box = this.root.querySelector(`#hero-${side}`)!;
      (box.querySelector('.bar i') as HTMLElement).style.width = `${(h.hp / h.maxHp) * 100}%`;
      box.querySelector('.hero-hp span')!.textContent = `${h.hp}/${h.maxHp}`;
    }
    this.root.querySelector('#turnNo')!.textContent = String(snap.turn);
    if (ev?.type === 'turn' || ev?.type === 'deploy') {
      const e = this.root.querySelector('#energy b');
      if (e && ev.type === 'deploy') e.textContent = String(snap.energy.player);
    }
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
        if (el && ev.jumped) {
          el.classList.add('jumping');
          setTimeout(() => el.classList.remove('jumping'), this.dur(450));
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
        if (ev.ranged) {
          const p = document.createElement('div');
          p.className = `proj ${ev.damageType} side-${a.side}`;
          p.style.left = `${ax}px`;
          p.style.top = `${ay}px`;
          fx.appendChild(p);
          const d = this.dur(320);
          p.animate([{ transform: 'translate(-50%,-50%) scale(.6)' }, { transform: `translate(calc(${tx - ax}px - 50%), calc(${ty - ay}px - 50%)) scale(1.2)` }], { duration: d, easing: 'ease-in' });
          el?.classList.add('casting');
          await sleep(d);
          p.remove();
          el?.classList.remove('casting');
        } else if (el) {
          const cs = this.cellSize();
          const dx = Math.max(-0.45, Math.min(0.45, (tx - ax) / cs / 2)) * cs;
          const dy = Math.max(-0.45, Math.min(0.45, (ty - ay) / cs / 2)) * cs;
          el.animate([{ translate: '0 0' }, { translate: `${dx}px ${dy}px` }, { translate: '0 0' }], { duration: this.dur(300), easing: 'ease-out' });
          await sleep(this.dur(170));
        }
        this.spark(tx, ty, ev.damageType);
        break;
      }
      case 'damage': {
        const t = ev.snap.units.find((x) => x.uid === ev.uid) ?? this.lastUnits.get(ev.uid);
        if (t) {
          const [x, y] = this.center(t.row, t.col);
          this.floatText(x, y, `-${ev.amount}`, ev.damageType);
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
          this.floatText(x, y, `+${ev.amount}`, 'heal');
        }
        await sleep(this.dur(300));
        break;
      }
      case 'death':
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
