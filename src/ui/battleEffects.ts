/** v0.28.3: animação de cada evento da batalha — separado de battleView.ts. */
import { getSpell } from '../core/spells';
import type { RecordedEvent } from '../core/types';
import { sleep } from './battleFx';
import type { BattleView } from './battleView';

export async function effect(view: BattleView, ev: RecordedEvent) {
  const fx = view.root.querySelector('.fx')!;
  switch (ev.type) {
    case 'turn':
      view.banner(ev.side === 'player' ? `Turno ${ev.turn} · Sua vez` : `Turno ${ev.turn} · Inimigo`, ev.side);
      await sleep(view.dur(650));
      break;
    case 'deploy':
    case 'spawn':
      await sleep(view.dur(380));
      break;
    case 'aura': {
      view.board.classList.add('aura-pulse');
      await sleep(view.dur(600));
      view.board.classList.remove('aura-pulse');
      break;
    }
    case 'move': {
      const el = view.tokens.get(ev.uid);
      const through = ev.through ?? [];
      // v0.15.1: JUMP só no salto de verdade (Salto Vendaval); passar por aliados = PASSA
      view.showMoveTrail(ev.from, ev.to, ev.jumped, ev.jumped ? 'JUMP' : through.length ? 'PASSA' : 'MOVE');
      if (el) {
        // v0.15.0: passar por um aliado = pulinho por cima dele (só transform), e o aliado se abaixa
        const cls = ev.jumped || through.length ? ['jumping', 'passing'] : ['moving'];
        el.classList.add(...cls);
        setTimeout(() => el.classList.remove(...cls), view.dur(430));
      }
      for (const [r, c] of through) {
        const o = ev.snap.units.find((x) => x.row === r && x.col === c && x.uid !== ev.uid);
        const oe = o && view.tokens.get(o.uid);
        if (!oe) continue;
        oe.classList.add('ducking');
        setTimeout(() => oe.classList.remove('ducking'), view.dur(430));
      }
      await sleep(view.dur(420));
      break;
    }
    case 'push':
      view.tokens.get(ev.uid)?.classList.add('pushed');
      setTimeout(() => view.tokens.get(ev.uid)?.classList.remove('pushed'), 400);
      await sleep(view.dur(350));
      break;
    case 'counter': {
      const u = ev.snap.units.find((x) => x.uid === ev.uid);
      if (u) {
        const [x, y] = view.center(u.row, u.col);
        view.floatText(x, y - 20, 'CONTRA-GOLPE!', 'counter');
      }
      await sleep(view.dur(400));
      break;
    }
    case 'attack': {
      const a = ev.snap.units.find((x) => x.uid === ev.uid);
      if (!a) break;
      const [ax, ay] = view.center(a.row, a.col);
      let tx: number, ty: number;
      if (ev.target === 'hero') [tx, ty] = view.heroCenter(ev.targetSide);
      else {
        const t = ev.snap.units.find((x) => x.uid === ev.target);
        if (!t) break;
        [tx, ty] = view.center(t.row, t.col);
      }
      const el = view.tokens.get(a.uid);
      view.showAttackFX(ax, ay, tx, ty, ev.ranged, ev.damageType, a.side);
      if (ev.ranged) {
        const p = document.createElement('div');
        p.className = `proj ${ev.damageType} side-${a.side}`;
        p.style.left = `${ax}px`;
        p.style.top = `${ay - 6}px`;
        fx.appendChild(p);
        const d = view.dur(320);
        p.animate([{ transform: 'translate(-50%,-50%) scale(.6)' }, { transform: `translate(calc(${tx - ax}px - 50%), calc(${ty - ay}px - 50%)) scale(1.35)` }], { duration: d, easing: 'ease-in' });
        el?.classList.add('casting');
        await sleep(d);
        p.remove();
        el?.classList.remove('casting');
      } else if (el) {
        const cs = view.cellSize();
        const dx = Math.max(-0.55, Math.min(0.55, (tx - ax) / cs / 1.6)) * cs;
        const dy = Math.max(-0.55, Math.min(0.55, (ty - ay) / cs / 1.6)) * cs;
        el.classList.add('attacking-melee');
        el.animate([{ translate: '0 0' }, { translate: `${dx}px ${dy}px` }, { translate: '0 0' }], { duration: view.dur(300), easing: 'ease-out' });
        await sleep(view.dur(220));
        el.classList.remove('attacking-melee');
      }
      view.spark(tx, ty, ev.damageType);
      break;
    }
    case 'damage': {
      const t = ev.snap.units.find((x) => x.uid === ev.uid) ?? view.lastUnits.get(ev.uid);
      if (t) {
        const [x, y] = view.center(t.row, t.col);
        view.floatText(x, y - 8, `-${ev.amount}`, ev.damageType);
        const el = view.tokens.get(ev.uid);
        el?.classList.remove('hit');
        void el?.offsetWidth;
        el?.classList.add('hit');
      }
      await sleep(view.dur(300));
      break;
    }
    case 'hero': {
      const [x, y] = view.heroCenter(ev.side);
      view.floatText(x, y, `-${ev.amount}`, 'hero-dmg');
      const box = view.root.querySelector(`#hero-${ev.side}`)!;
      box.classList.remove('hit');
      void (box as HTMLElement).offsetWidth;
      box.classList.add('hit');
      view.board.parentElement!.classList.add('quake');
      setTimeout(() => view.board.parentElement!.classList.remove('quake'), 300);
      await sleep(view.dur(380));
      break;
    }
    case 'heal': {
      const t = ev.snap.units.find((x) => x.uid === ev.uid);
      if (t) {
        const [x, y] = view.center(t.row, t.col);
        view.floatText(x, y - 10, `+${ev.amount}`, 'heal');
      }
      await sleep(view.dur(300));
      break;
    }
    case 'effect': {
      const t = ev.snap.units.find((x) => x.uid === ev.uid) ?? view.lastUnits.get(ev.uid);
      const TAG: Record<string, string> = { veneno: '🧪', queimadura: '🔥', atordoado: '💫 ATORDOADO', escudo: '🛡 ESCUDO', anjo: '👼 SALVO!', renascer: '♻ RENASCE!', reflexo: '🪞 REFLETE', necropolis: '⚰️ VOLTA!' };
      if (t) {
        const [x, y] = view.center(t.row, t.col);
        view.floatText(x, y - 22, TAG[ev.kind] ?? '✦', `fx-tag fx-${ev.kind}`);
      }
      if (ev.kind === 'necropolis') view.renderHand();
      await sleep(view.dur(ev.kind === 'veneno' || ev.kind === 'queimadura' ? 200 : 380));
      break;
    }
    case 'cast': {
      const sp = getSpell(ev.spellId);
      const c = ev.snap.units.find((x) => x.uid === ev.caster);
      if (c) {
        const [x, y] = view.center(c.row, c.col);
        view.floatText(x, y - 24, `${sp.icon} ${sp.name}`, 'fx-tag fx-cast');
        view.tokens.get(c.uid)?.classList.add('casting');
      }
      if (ev.target && sp.target !== 'none') {
        const [tx, ty] = view.center(ev.target[0], sp.target === 'row' ? Math.floor(view.state.cols / 2) : ev.target[1]);
        view.spark(tx, ty, sp.damageType ?? 'heal');
      }
      if (ev.side === 'player') view.renderHand();
      await sleep(view.dur(520));
      if (c) view.tokens.get(c.uid)?.classList.remove('casting');
      break;
    }
    case 'death':
      if (view.mine.has(ev.uid)) view.setPile('#pileDead', ++view.deadShown);
      await sleep(view.dur(380));
      break;
    case 'end':
      view.banner(ev.winner === 'player' ? 'VITÓRIA!' : ev.winner === 'enemy' ? 'DERROTA' : 'EMPATE', ev.winner === 'player' ? 'player' : 'enemy', true);
      await sleep(900);
      break;
  }
}
