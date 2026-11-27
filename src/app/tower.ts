/**
 * v0.72.0 — 🗼 Torre: tela dos andares, batalha do andar e prêmio da primeira vitória (regras em core/tower.ts).
 */
import { getChar } from '../core/characters';
import { stageCommander } from '../core/campaign';
import { XP_ITEMS, stepOf } from '../core/progression';
import { leaderHp } from '../core/leaders';
import { isSpell } from '../core/spells';
import { addGear, markGearSeen } from '../core/gear';
import { addProfileXp } from '../core/profile';
import { TOWER_FLOORS, TOWER_UNLOCK_STAGE, isBossFloor, towerNext, towerReward, towerStage, towerUnlocked } from '../core/tower';
import { BattleView } from '../ui/battleView';
import { enterBattleMode } from '../ui/orientation';
import { deckCards, deckMax, teamReady } from '../ui/save';
import { enemyCommanderArt, faceUrl } from '../ui/art';
import { arenaAttrs } from '../ui/arenas';
import { esc, essIcon, gearHTML, gemHTML, goldHTML, orbBagHTML, orbHTML, starStyle } from '../ui/components';
import { ico } from '../ui/icons';
import { app, save, persist, activeLeader, leaderLevel, prof, fmt, track, levelNote } from './state';
import { topbar, bindNav, modal, closeModal } from './ui';
import { teamWarning } from './adventure';
import { train } from './train';

/** prêmio do andar em ícones (a parte fixa; os itens podem vir uma cor acima) */
function prizeHTML(floor: number): string {
  const r = towerReward(floor, () => 0);
  return `${goldHTML(fmt(r.gold))} ${essIcon()}${r.essencias} ${orbBagHTML(r.orbs)} ${r.gear.map((g) => gearHTML(g.id, g.rarity)).join('')}${r.gems ? ` ${gemHTML(`+${r.gems}`)}` : ''}`;
}

export function tower(): void {
  const open = towerUnlocked(save.cleared);
  const next = towerNext(save.tower);
  const best = save.tower?.best ?? 0;
  let body: string;
  if (!open) {
    body = `<div class="tower-lock"><p class="tower-big">🔒</p><p>A Torre abre quando você vencer a <b>fase ${TOWER_UNLOCK_STAGE} do Fácil</b> (fim da região 1).</p>
      <p class="hint">Na Torre, cada andar é uma batalha mais difícil que a anterior. Não gasta energia, dá para tentar quantas vezes quiser e o prêmio vem na primeira vitória de cada andar. A cada 10 andares, um chefe com ${gemHTML('')} Gemas.</p></div>`;
  } else if (next == null) {
    body = `<div class="tower-lock"><p class="tower-big">🏆</p><p>Você venceu os <b>${TOWER_FLOORS} andares</b> da Torre!</p></div>`;
  } else {
    const st = towerStage(next);
    const foes = st.enemyDeck.filter((c) => !isSpell(c.charId));
    const top = [...foes].sort((a, b) => b.stars * 3 + stepOf(b) - (a.stars * 3 + stepOf(a))).filter((c, k, arr) => arr.findIndex((x) => x.charId === c.charId) === k).slice(0, 3);
    const list: number[] = [];
    for (let f = Math.min(TOWER_FLOORS, next + 4); f >= Math.max(1, next - 2); f--) list.push(f);
    body = `<div class="tower-wrap">
      <div class="tower-card">
        ${enemyCommanderArt(stageCommander(st), 'stage-cmd tower-cmd')}
        <h3>Andar ${next}${isBossFloor(next) ? ' · <span class="tower-boss">Chefe</span>' : ''}</h3>
        <div class="stage-foes"><span class="stage-foes-lbl">Destaques do rival</span>${top.map((c) => `<span class="stage-foe" style="${starStyle(c.stars)}" title="${esc(getChar(c.charId).name)}">${faceUrl(c.charId) ? `<img src="${faceUrl(c.charId)}" alt="" draggable="false">` : ''}<small>${esc(getChar(c.charId).name.split(' ')[0])}</small></span>`).join('')}</div>
        <p class="stage-line">Prêmio da 1ª vitória: ${prizeHTML(next)}</p>
        <p class="hint">Grátis: não gasta energia · tente quantas vezes quiser · vida do rival ${st.enemyHeroHp}</p>
        <button class="btn primary big" id="towerFight">${ico('lutar', '⚔')} Lutar</button>
      </div>
      <ol class="tower-list">${list.map((f) => `<li class="${f <= best ? 'done' : f === next ? 'next' : 'lock'}${isBossFloor(f) ? ' boss' : ''}"><b>${f <= best ? '✔' : f === next ? '▶' : '🔒'} Andar ${f}${isBossFloor(f) ? ' · Chefe' : ''}</b><span>${f <= best ? 'vencido' : prizeHTML(f)}</span></li>`).join('')}</ol>
    </div>`;
  }
  app.innerHTML = `<div class="screen tower-screen">${topbar(`🗼 Torre${open ? ` · ${best}/${TOWER_FLOORS}` : ''}`)}${body}</div>`;
  bindNav();
  app.querySelector('#towerFight')?.addEventListener('click', () => towerBattle());
}

function towerBattle() {
  const floor = towerNext(save.tower);
  if (floor == null || !towerUnlocked(save.cleared)) return;
  if (!teamReady(save)) {
    void teamWarning();
    return;
  }
  track('play');
  track('tower');
  persist();
  const stage = towerStage(floor);
  window.scrollTo(0, 0);
  enterBattleMode();
  const arena = arenaAttrs(((floor - 1) % 100) + 1);
  app.innerHTML = `<div class="screen battle-screen${arena.cls}" id="bs"${arena.style}></div>`;
  new BattleView(app.querySelector('#bs')!, stage, deckCards(save), {
    speed: () => save.speed || 1,
    setSpeed: (n) => {
      save.speed = n;
      persist();
    },
    onExit: () => tower(),
    onFinish: (winner) => towerFinish(floor, winner),
    playerHeroHp: leaderHp(activeLeader(), leaderLevel()),
  });
}

function towerFinish(floor: number, winner: string) {
  let html: string;
  if (winner === 'player' && (save.tower?.best ?? 0) < floor) {
    track('win');
    save.tower = { best: floor };
    const r = towerReward(floor);
    prof().gold += r.gold;
    save.essencias += r.essencias;
    for (const o of XP_ITEMS) save.items[o.id] += r.orbs[o.id] ?? 0;
    for (const g of r.gear) {
      addGear((save.gear ??= {}), g.id, g.rarity);
      markGearSeen((save.gearSeen ??= []), g.id, g.rarity);
    }
    save.gems = (save.gems ?? 0) + r.gems;
    const before = deckMax(save);
    const lv = addProfileXp(prof(), r.profileXp);
    html = `<h2 class="win">${ico('vitoria', '🏆')} Andar ${floor} vencido!</h2>
      <div class="res big"><span>${goldHTML(`+${fmt(r.gold)}`)}</span><span>${essIcon()} +${r.essencias}</span>${XP_ITEMS.filter((o) => r.orbs[o.id]).map((o) => `<span class="orb-pill">${orbHTML(o.id, `+${r.orbs[o.id]}`)}</span>`).join('')}${r.gear.map((g) => gearHTML(g.id, g.rarity, '+1')).join('')}${r.gems ? `<span>${gemHTML(`+${r.gems}`)} Gemas</span>` : ''}</div>
      <p class="hint">👤 +${r.profileXp} XP de perfil</p>${levelNote(lv, before)}
      ${floor < TOWER_FLOORS ? `<p>Próximo: <b>Andar ${floor + 1}</b>${isBossFloor(floor + 1) ? ' (chefe)' : ''}</p>` : '<p>Você venceu a Torre inteira!</p>'}`;
  } else {
    html = `<h2 class="lose">${winner === 'empate' ? `${ico('empate', '⏱')} Empate` : `${ico('derrota', '💀')} Derrota`}</h2><p>O andar ${floor} continua esperando. Treine, melhore o baralho e tente de novo (na Torre não gasta energia).</p>`;
  }
  persist();
  modal(`<div class="result-body">${html}</div><div class="row result-btns"><button class="btn primary" data-m="tw">Continuar</button><button class="btn" data-m="train">Treinar</button><button data-m="close" hidden></button></div>`, (m) => {
    const back = () => {
      closeModal();
      tower();
    };
    m.querySelector('[data-m=close]')!.addEventListener('click', back);
    m.querySelector('[data-m=tw]')!.addEventListener('click', back);
    m.querySelector('[data-m=train]')!.addEventListener('click', () => {
      closeModal();
      train();
    });
  });
}
